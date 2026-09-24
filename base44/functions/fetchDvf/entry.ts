import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// --- Paramètres de connexion au Cerema ---
// Le serveur preprod du Cerema est instable : il peut renvoyer 502/503/504 ou
// pendre sans répondre. On garde un timeout court et 2 tentatives seulement afin
// de renvoyer DVF_UNAVAILABLE bien avant la limite d'exécution de la fonction
// (sinon la fonction est tuée → erreur générique côté client → le mode secours
// ne se déclenche pas correctement).
const RETRYABLE_STATUS = new Set([500, 502, 503, 504]);
const MAX_ATTEMPTS = 2;
const RETRY_DELAY_MS = 1200;
const REQUEST_TIMEOUT_MS = 6000;
// Les données DVF sont mises à jour une fois par mois : un cache de 7 jours est sûr.
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function log(level: "info" | "warn" | "error", msg: string, extra?: any) {
  const ts = new Date().toISOString();
  const payload = extra ? ` ${JSON.stringify(extra)}` : "";
  console[level](`[fetchDvf ${ts}] ${msg}${payload}`);
}

// Relance automatique sur erreurs serveur (500/502/503/504) ou timeout réseau.
// Classifie précisément la cause (timeout / network / http_xxx) pour le diagnostic.
async function fetchWithRetry(url: string) {
  let lastStatus = 0;
  let lastErrorType = "unknown";
  let lastErrorDetail = "";
  const startedAt = Date.now();

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const t0 = Date.now();
    try {
      log("info", `Tentative ${attempt}/${MAX_ATTEMPTS} → ${url}`);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "User-Agent": "ImmoEstime/1.0 (+base44)",
        },
        redirect: "follow",
      });
      const elapsed = Date.now() - t0;
      clearTimeout(timer);
      log("info", `Réponse HTTP ${res.status} ${res.statusText} en ${elapsed}ms`, {
        redirected: res.redirected,
        finalUrl: res.url,
        contentType: res.headers.get("content-type"),
      });
      // OK ou erreur non retryable (ex: 400, 404) → on retourne pour laisser
      // l'appelant décider (le parsing/le statut seront gérés ensuite).
      if (res.ok || !RETRYABLE_STATUS.has(res.status)) return res;
      lastStatus = res.status;
      lastErrorType = `http_${res.status}`;
      lastErrorDetail = `HTTP ${res.status} ${res.statusText}`;
    } catch (e: any) {
      clearTimeout(timer);
      const elapsed = Date.now() - t0;
      if (e && e.name === "AbortError") {
        lastStatus = 504;
        lastErrorType = "timeout";
        lastErrorDetail = `Timeout après ${elapsed}ms (serveur injoignable / pas de réponse)`;
        log("warn", `Timeout tentative ${attempt} après ${elapsed}ms`);
      } else {
        lastStatus = 502;
        lastErrorType = "network";
        lastErrorDetail = `Erreur réseau: ${(e && e.message) || String(e)}`;
        log("warn", `Erreur réseau tentative ${attempt}: ${(e && e.message) || String(e)}`);
      }
    }
    if (attempt < MAX_ATTEMPTS) {
      await sleep(RETRY_DELAY_MS);
    }
  }

  const durationMs = Date.now() - startedAt;
  const err = new Error(
    `DVF_UNAVAILABLE [${lastErrorType}] ${lastErrorDetail} (tentatives: ${MAX_ATTEMPTS}, durée: ${durationMs}ms)`
  );
  (err as any).status = lastStatus || 502;
  (err as any).diagnostic = {
    type: lastErrorType,
    status: lastStatus || 502,
    attempts: MAX_ATTEMPTS,
    durationMs,
    lastUrl: url,
    detail: lastErrorDetail,
    // CORS n'a aucun sens côté serveur (les requêtes partent du runtime backend,
    // pas du navigateur) — on l'indique explicitement pour écarter ce doute.
    corsNote: "N/A côté serveur (le CORS ne s'applique qu'au navigateur)",
  };
  throw err;
}

// Une seule page (page_size=200) pour limiter la charge du serveur Cerema.
async function fetchFromCerema(citycode: string, commune: string) {
  const yearMin = new Date().getFullYear() - 3;
  const base = "https://apidf-preprod.cerema.fr/dvf_opendata/mutations/";
  let url = `${base}?code_insee=${citycode}&anneemut_min=${yearMin}&page_size=200`;
  const features = [];
  let pages = 0;
  while (url && pages < 1) {
    const res = await fetchWithRetry(url);
    const contentType = res.headers.get("content-type") || "";

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      log("error", `Réponse non-OK ${res.status}`, { contentType, bodyPreview: body.substring(0, 200) });
      const err = new Error(
        `DVF_UNAVAILABLE [http_${res.status}] HTTP ${res.status} ${res.statusText}`
      );
      (err as any).status = res.status;
      (err as any).diagnostic = {
        type: `http_${res.status}`,
        status: res.status,
        contentType,
        bodyPreview: body.substring(0, 200),
      };
      throw err;
    }

    let data;
    try {
      data = await res.json();
    } catch (e: any) {
      const body = await res.text().catch(() => "");
      log("error", "Échec du parsing JSON de la réponse Cerema", {
        contentType,
        bodyPreview: body.substring(0, 200),
      });
      const err = new Error(
        `DVF_UNAVAILABLE [parse_error] Réponse non-JSON (content-type: ${contentType})`
      );
      (err as any).status = 502;
      (err as any).diagnostic = {
        type: "parse_error",
        contentType,
        bodyPreview: body.substring(0, 200),
      };
      throw err;
    }

    log("info", `Mutations reçues: ${(data.results || []).length}`);
    for (const m of data.results || []) {
      const type = m.libtypbien || "";
      const isHouse = /MAISON/i.test(type);
      const isFlat = /APPARTEMENT/i.test(type);
      if (!isHouse && !isFlat) continue;
      const valeur = parseFloat(m.valeurfonc);
      const sbati = parseFloat(m.sbati);
      if (!valeur || valeur <= 0 || !sbati || sbati <= 0) continue;
      const sterr = parseFloat(m.sterr);
      features.push({
        properties: {
          date_mutation: m.datemut,
          valeur_fonciere: valeur,
          surface_reelle_bati: sbati,
          surface_terrain: sterr > 0 ? sterr : null,
          nombre_pieces_principales: null,
          type_local: isHouse ? "Maison" : "Appartement",
          nom_commune: commune,
        },
      });
    }
    // Le serveur peut renvoyer une URL de pagination en http → on force https
    // pour éviter tout conflit de schéma / redirection.
    url = (data.next || "").replace("http://", "https://");
    pages++;
  }
  return features;
}

export default async function (req: any) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const citycode = String(body?.citycode || "");
    const commune = String(body?.commune || "");
    if (!/^\d{5}$/.test(citycode)) {
      return Response.json({ error: "Code commune requis" }, { status: 400 });
    }

    log("info", `Requête DVF`, { citycode, commune });

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
      log("info", `Cache expiré (âge: ${Math.round(age / 1000)}s), interrogation Cerema`, { citycode });
    }

    // 2. Requête Cerema, avec repli sur le cache (même expiré) en cas d'échec serveur
    let features;
    try {
      features = await fetchFromCerema(citycode, commune);
    } catch (fetchError: any) {
      log("error", "Échec de la connexion Cerema", {
        message: fetchError.message,
        diagnostic: fetchError.diagnostic,
      });
      if (
        cached.length > 0 &&
        Array.isArray(cached[0].features) &&
        cached[0].features.length > 0
      ) {
        log("warn", "Repli sur cache expiré", { citycode });
        return Response.json({
          features: cached[0].features,
          stale: true,
          diagnostic: fetchError.diagnostic,
        });
      }
      throw fetchError;
    }

    // 3. Mise à jour du cache (création ou rafraîchissement)
    if (cached.length > 0) {
      await base44.asServiceRole.entities.DvfCache.update(cached[0].id, { features, commune });
    } else {
      await base44.asServiceRole.entities.DvfCache.create({ citycode, commune, features });
    }
    log("info", `Succès: ${features.length} mutations mises en cache`, { citycode });

    return Response.json({ features });
  } catch (error: any) {
    // On préserve les mots-clés DVF_UNAVAILABLE / DVF_TIMEOUT dans le message
    // pour que le client puisse détecter l'indisponibilité et basculer en mode
    // secours. On ajoute le détail exact du diagnostic.
    if (error.message && error.message.startsWith("DVF_UNAVAILABLE")) {
      return Response.json(
        { error: error.message, diagnostic: error.diagnostic },
        { status: error.status || 502 }
      );
    }
    if (error.message === "DVF_TIMEOUT") {
      return Response.json(
        { error: "DVF_TIMEOUT", diagnostic: { type: "timeout" } },
        { status: 504 }
      );
    }
    log("error", "Erreur inattendue", { message: error.message });
    return Response.json({ error: error.message }, { status: 500 });
  }
}