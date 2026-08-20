const RETRYABLE_STATUS = new Set([500, 502, 503, 504]);
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2000;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Relance automatique sur erreurs serveur (500/502/503/504) :
// 3 tentatives max, 2s d'attente non-bloquante entre chaque.
const REQUEST_TIMEOUT_MS = 15000;

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
      // connexion trop lente (timeout) : pas de relance, échec immédiat
      if (e && e.name === "AbortError") {
        const err = new Error("DVF_TIMEOUT");
        err.status = 504;
        throw err;
      }
      // autre erreur réseau -> relançable
      lastStatus = 502;
    }
    if (attempt < MAX_ATTEMPTS) {
      await sleep(RETRY_DELAY_MS);
    }
  }
  const err = new Error("DVF_UNAVAILABLE");
  err.status = lastStatus || 502;
  throw err;
}

export default async function(req) {
  try {
    const body = await req.json();
    const citycode = String(body?.citycode || "");
    const commune = String(body?.commune || "");
    if (!/^\d{5}$/.test(citycode)) {
      return Response.json({ error: "Code commune requis" }, { status: 400 });
    }

    const yearMin = new Date().getFullYear() - 3;
    const base = "https://apidf-preprod.cerema.fr/dvf_opendata/mutations/";
    let url = `${base}?code_insee=${citycode}&anneemut_min=${yearMin}&page_size=200`;

    const features = [];
    let pages = 0;
    while (url && pages < 2) {
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