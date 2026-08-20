const REQUEST_TIMEOUT_MS = 15000;

export default async function(req) {
  try {
    const body = await req.json();
    const query = typeof body?.query === "string" ? body.query.trim() : "";
    if (query.length < 3) return Response.json({ features: [] });

    const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=8`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) return Response.json({ error: "BAN indisponible" }, { status: 502 });
      const data = await res.json();
      return Response.json(data);
    } catch (error) {
      clearTimeout(timer);
      if (error && error.name === "AbortError") {
        return Response.json({ error: "BAN_TIMEOUT" }, { status: 504 });
      }
      return Response.json({ error: error.message }, { status: 500 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}