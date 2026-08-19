export default async function(req) {
  try {
    const body = await req.json();
    const query = typeof body?.query === "string" ? body.query.trim() : "";
    if (query.length < 3) return Response.json({ features: [] });

    const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=8`;
    const res = await fetch(url);
    if (!res.ok) return Response.json({ error: "BAN indisponible" }, { status: 502 });
    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}