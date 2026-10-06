import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// --- Source de données : fichiers geo-dvf géolocalisés (data.gouv.fr / Etalab) ---
// On abandonne l'API Cerema (apidf-preprod.cerema.fr), instable (502/503/504
// fréquents), au profit des fichiers CSV statiques hébergés sur le CDN OVH de
// data.gouv.fr. Avantages :
//   - fiabilité (fichiers statiques, pas de rate-limit ni de panne serveur) ;
//   - géocodage latitude/longitude à la parcelle (WGS-84) → permet un vrai
//     « à proximité » côté client ;
//   - nombre de pièces principales disponible ;
//   - couverture complète de la commune (toutes les mutations de l'année).
// Inconvénient : pas de filtrage serveur, on télécharge puis on filtre.
//
// Structure du bucket :
//   https://files.data.gouv.fr/geo-dvf/latest/csv/{ANNEE}/communes/{DEP}/{CITYCODE}.csv
// DEP = 2 chiffres (métropole), "2A"/"2B" (Corse), 3 chiffres (DOM 971-976, 984-989).

const BASE = "https://files.data.gouv.fr/geo-dvf/latest/csv";
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // DVF mis à jour 2x/an → 7 jours sûr
const REQUEST_TIMEOUT_MS = 15000;
const MAX_FEATURES = 1000; // plafond pour borner la taille du cache entité

function log(level: "info" | "warn" | "error", msg: string, extra?: any) {
  const ts = new Date().toISOString();
  const payload = extra ? ` ${JSON.stringify(extra)}` : "";
  console[level](`[fetchDvf ${ts}] ${msg}${payload}`);
}

// Dossier département à partir du code commune INSEE (5 caractères).
function depFolder(citycode: string): string {
  if (/^2A/.test(citycode)) return "2A";
  if (/^2B/.test(citycode)) return "2B";
  if (/^9[78]/.test(citycode)) return citycode.substring(0, 3); // DOM
  return citycode.substring(0, 2);
}

// Parseur CSV gérant les champs entre guillemets (séparateur virgule, UTF-8).
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = false;
      } else cur += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ",") { result.push(cur); cur = ""; }
      else cur += ch;
    }
  }
  result.push(cur);
  return result;
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.length > 0);
  if (lines.length === 0) return [];
  const headers = parseCSVLine(lines[0]);
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = parseCSVLine(lines[i]);
    if (cells.length < headers.length - 1) continue; // ligne incomplète
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) row[headers[j]] = cells[j] ?? "";
    rows.push(row);
  }
  return rows;
}

// Télécharge le fichier d'une année pour la commune. 404 = année non publiée → [].
async function fetchYear(citycode: string, year: number, dep: string): Promise<Record<string, string>[]> {
  const url = `${BASE}/${year}/communes/${dep}/${citycode}.csv`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const t0 = Date.now();
  try {
    log("info", `Téléchargement ${url}`);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "text/csv", "User-Agent": "ImmoEstime/1.0 (+base44)" },
    });
    const elapsed = Date.now() - t0;
    if (res.status === 404) {
      log("info", `Année ${year} non disponible (404) en ${elapsed}ms`);
      return [];
    }
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }
    const text = await res.text();
    log("info", `Année ${year}: ${text.length} octets en ${elapsed}ms`);
    return parseCSV(text);
  } finally {
    clearTimeout(timer);
  }
}

// Convertit une ligne CSV en feature (Maison/Appartement valide uniquement).
function toFeature(row: Record<string, string>, commune: string) {
  const type = (row.type_local || "").trim();
  if (type !== "Maison" && type !== "Appartement") return null;
  const valeur = parseFloat(row.valeur_fonciere);
  const sbati = parseFloat(row.surface_reelle_bati);
  if (!valeur || valeur <= 0 || !sbati || sbati <= 0) return null;
  const sterr = parseFloat(row.surface_terrain);
  const lon = parseFloat(row.longitude);
  const lat = parseFloat(row.latitude);
  const pieces = parseInt(row.nombre_pieces_principales, 10);
  return {
    properties: {
      date_mutation: row.date_mutation,
      valeur_fonciere: valeur,
      surface_reelle_bati: sbati,
      surface_terrain: sterr > 0 ? sterr : null,
      nombre_pieces_principales: Number.isFinite(pieces) ? pieces : null,
      type_local: type,
      nom_commune: row.nom_commune || commune,
      longitude: Number.isFinite(lon) ? lon : null,
      latitude: Number.isFinite(lat) ? lat : null,
    },
  };
}

export default async function (req: any) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const citycode = String(body?.citycode || "");
    const commune = String(body?.commune || "");
    if (!/^(\d{5}|2[AB]\d{3})$/.test(citycode)) {
      return Response.json({ error: "Code commune requis" }, { status: 400 });
    }

    log("info", `Requête DVF (geo-dvf)`, { citycode, commune });

    // 1. Lecture du cache (commune)
    const cached = await base44.asServiceRole.entities.DvfCache.filter(
      { citycode },
      "-created_date",
      1
    );
    if (cached.length > 0) {
      const age = Date.now() - new Date(cached[0].created_date).getTime();
      if (age < CACHE_TTL_MS) {
        log("info", `Cache frais (âge: ${Math.round(age / 1000)}s)`, { citycode });
        return Response.json({ features: cached[0].features });
      }
      log("info", `Cache expiré (âge: ${Math.round(age / 1000)}s), refresh geo-dvf`, { citycode });
    }

    // 2. Téléchargement en parallèle des 4 dernières années potentielles
    // (l'année en cours n'est pas toujours publiée → on prend ce qui existe).
    const dep = depFolder(citycode);
    const currentYear = new Date().getFullYear();
    const candidateYears = [0, 1, 2, 3].map((n) => currentYear - n);
    const yearResults = await Promise.allSettled(candidateYears.map((y) => fetchYear(citycode, y, dep)));
    const allRows: Record<string, string>[] = [];
    const failures: string[] = [];
    let yearsCount = 0;
    yearResults.forEach((r, i) => {
      const y = candidateYears[i];
      if (r.status === "fulfilled" && r.value.length > 0) {
        allRows.push(...r.value);
        yearsCount++;
      } else if (r.status === "rejected") {
        failures.push(`${y}: ${r.reason?.message || r.reason}`);
        log("warn", `Échec année ${y}: ${r.reason?.message || r.reason}`);
      }
    });

    // 3. Aucune donnée trouvée → repli sur cache expiré ou erreur (mode secours client)
    if (allRows.length === 0) {
      log("error", `Aucune donnée geo-dvf pour ${citycode}`, { failures });
      if (cached.length > 0 && Array.isArray(cached[0].features) && cached[0].features.length > 0) {
        log("warn", "Repli sur cache expiré", { citycode });
        return Response.json({ features: cached[0].features, stale: true });
      }
      const err = new Error(
        `DVF_UNAVAILABLE [geo_dvf_empty] Aucune vente trouvée pour la commune ${citycode} (${failures.join("; ") || "fichiers absents"})`
      );
      (err as any).status = 502;
      (err as any).diagnostic = { type: "geo_dvf_empty", citycode, failures };
      throw err;
    }

    // 4. Transformation + filtrage + plafond (plus récentes d'abord)
    let features: any[] = [];
    for (const row of allRows) {
      const f = toFeature(row, commune);
      if (f) features.push(f);
    }
    features.sort((a, b) =>
      (b.properties.date_mutation || "").localeCompare(a.properties.date_mutation || "")
    );
    if (features.length > MAX_FEATURES) features = features.slice(0, MAX_FEATURES);

    log("info", `${features.length} mutations (Maison/Appartement) sur ${yearsCount} année(s)`, { citycode });

    // 5. Mise à jour du cache
    if (cached.length > 0) {
      await base44.asServiceRole.entities.DvfCache.update(cached[0].id, { features, commune });
    } else {
      await base44.asServiceRole.entities.DvfCache.create({ citycode, commune, features });
    }

    return Response.json({ features });
  } catch (error: any) {
    if (error.message && error.message.startsWith("DVF_UNAVAILABLE")) {
      return Response.json(
        { error: error.message, diagnostic: error.diagnostic },
        { status: error.status || 502 }
      );
    }
    log("error", "Erreur inattendue", { message: error.message });
    return Response.json({ error: error.message }, { status: 500 });
  }
}