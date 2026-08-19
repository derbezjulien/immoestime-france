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
    let url = `${base}?code_insee=${citycode}&anneemut_min=${yearMin}&page_size=500`;

    const features = [];
    let pages = 0;
    while (url && pages < 3) {
      const res = await fetch(url);
      if (!res.ok) return Response.json({ error: "API DVF indisponible" }, { status: 502 });
      const data = await res.json();
      for (const m of data.results || []) {
        const type = m.libtypbien || "";
        const isHouse = /MAISON/i.test(type);
        const isFlat = /APPARTEMENT/i.test(type);
        if (!isHouse && !isFlat) continue;
        const valeur = parseFloat(m.valeurfonc);
        const sbati = parseFloat(m.sbati);
        if (!valeur || valeur <= 0 || !sbati || sbati <= 0) continue;
        features.push({
          properties: {
            date_mutation: m.datemut,
            valeur_fonciere: valeur,
            surface_reelle_bati: sbati,
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
    return Response.json({ error: error.message }, { status: 500 });
  }
}