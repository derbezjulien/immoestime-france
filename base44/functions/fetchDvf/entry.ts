import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const RETRYABLE_STATUS = new Set([500, 502, 503, 504]);
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1500;
const REQUEST_TIMEOUT_MS = 10000;
// Les données DVF sont mises à jour une fois par mois : un cache de 7 jours est sûr.
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Relance automatique sur erreurs serveur (500/502/503/504) :
// 3 tentatives max, 2s d'attente non-bloquante entre chaque.
async function fetchWithRetry(url) {
  let lastStatus = 0;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok || !RETRYABLE_STATUS.has(res.status)) return res;
      lastStatus = res.status;
    } catch (e) {
      clearTimeout(timer);
      // timeout (AbortError) ou erreur réseau -> relançable
      lastStatus = (e && e.name === "AbortError") ? 504 : 502;
    }
    if (attempt < MAX_ATTEMPTS) {
      await sleep(RETRY_DELAY_MS);
    }
  }
  const err = new Error("DVF_UNAVAILABLE");
  err.status = lastStatus || 502;
  throw err;
}

// Une seule page (page_size=200) pour limiter la charge du serveur Cerema.
async function fetchFromCerema(citycode, commune) {
  const yearMin = new Date().getFullYear() - 3;
  const base = "https://apidf-preprod.cerema.fr/dvf_opendata/mutations/";
  let url = `${base}?code_insee=${citycode}&anneemut_min=${yearMin}&page_size=200`;
  const features = [];
  let pages = 0;
  while (url && pages < 1) {
    const res = await fetchWithRetry(url);
    const data = await res.json();
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
    url = (data.next || "").replace("http://", "https://");
    pages++;
  }
  return features;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const citycode = String(body?.citycode || "");
    const commune = String(body?.commune || "");
    if (!/^\d{5}$/.test(citycode)) {
      return Response.json({ error: "Code commune requis" }, { status: 400 });
    }

    // 1. Lecture du cache (commune)
    const cached = await base44.asServiceRole.entities.DvfCache.filter({ citycode }, "-created_date", 1);
    if (cached.length > 0) {
      const age = Date.now() - new Date(cached[0].created_date).getTime();
      if (age < CACHE_TTL_MS) {
        return Response.json({ features: cached[0].features });
      }
    }

    // 2. Requête Cerema, avec repli sur le cache (même expiré) en cas d'échec serveur
    let features;
    try {
      features = await fetchFromCerema(citycode, commune);
    } catch (fetchError) {
      if (cached.length > 0 && Array.isArray(cached[0].features) && cached[0].features.length > 0) {
        return Response.json({ features: cached[0].features, stale: true });
      }
      throw fetchError;
    }

    // 3. Mise à jour du cache (création ou rafraîchissement)
    if (cached.length > 0) {
      await base44.asServiceRole.entities.DvfCache.update(cached[0].id, { features, commune });
    } else {
      await base44.asServiceRole.entities.DvfCache.create({ citycode, commune, features });
    }

    return Response.json({ features });
  } catch (error) {
    if (error.message === "DVF_TIMEOUT") {
      return Response.json({ error: "DVF_TIMEOUT" }, { status: 504 });
    }
    if (error.message === "DVF_UNAVAILABLE") {
      return Response.json({ error: "DVF_UNAVAILABLE" }, { status: 502 });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
}