import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Home as HomeIcon, MapPin, Calculator, Loader2, AlertCircle, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const euro = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

function formatYear(dateIso) {
  return dateIso ? dateIso.substring(0, 4) : "—";
}

export default function Estimation() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [surface, setSurface] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [recentSales, setRecentSales] = useState([]);
  const [debounceTimer, setDebounceTimer] = useState(null);

  const onQueryChange = (value) => {
    setQuery(value);
    setSelected(null);
    setError(null);
    if (debounceTimer) clearTimeout(debounceTimer);
    if (value.length < 3) {
      setSuggestions([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const response = await base44.functions.invoke("searchAddress", { query: value });
        setSuggestions(response.data.features || []);
      } catch (e) {
        setError("Impossible de contacter l'API d'adresse.");
      }
    }, 300);
    setDebounceTimer(t);
  };

  const selectAddress = (feature) => {
    setSelected(feature);
    setQuery(feature.properties.label);
    setSuggestions([]);
  };

  const estimate = useCallback(async () => {
    if (!selected || !surface || Number(surface) <= 0) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setRecentSales([]);
    try {
      const citycode = selected.properties.citycode;
      const commune = selected.properties.city || selected.properties.name || "";
      const response = await base44.functions.invoke("fetchDvf", { citycode, commune });
      const data = response.data;
      const features = data.features || [];

      const cutoff = new Date();
      cutoff.setFullYear(cutoff.getFullYear() - 3);

      const sales = features
        .map((f) => f.properties)
        .filter((m) => {
          const type = m.type_local;
          const hasPrice = m.valeur_fonciere && m.valeur_fonciere > 0;
          const hasSurface = m.surface_reelle_bati && m.surface_reelle_bati > 0;
          const dateOk = m.date_mutation && new Date(m.date_mutation) >= cutoff;
          return (type === "Maison" || type === "Appartement") && hasPrice && hasSurface && dateOk;
        });

      if (sales.length === 0) {
        setError("Aucune vente récente trouvée à proximité de cette adresse.");
        setLoading(false);
        return;
      }

      const avgPerSqm =
        sales.reduce((acc, s) => acc + s.valeur_fonciere / s.surface_reelle_bati, 0) /
        sales.length;
      const estimatedPrice = avgPerSqm * Number(surface);

      setResult({ estimatedPrice, averagePricePerSqm: avgPerSqm, sampleSize: sales.length });
      setRecentSales(
        [...sales]
          .sort((a, b) => (b.date_mutation || "").localeCompare(a.date_mutation || ""))
          .slice(0, 4)
      );
    } catch (e) {
      setError(e.message || "Erreur lors de l'estimation.");
    } finally {
      setLoading(false);
    }
  }, [selected, surface]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-heading font-semibold">
            <HomeIcon className="w-5 h-5" />
            ImmoEstim
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold tracking-tight mb-2">
            Estimation immobilière
          </h1>
          <p className="text-muted-foreground">
            Saisissez votre adresse et la surface pour obtenir une estimation basée sur les ventes réelles à proximité.
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6 space-y-4">
            {/* Adresse */}
            <div className="relative">
              <Label htmlFor="address">Adresse du bien</Label>
              <div className="relative mt-1.5">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="address"
                  value={query}
                  onChange={(e) => onQueryChange(e.target.value)}
                  placeholder="Ex : 10 cours Foch, Podensac"
                  className="pl-9"
                />
              </div>
              {suggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md max-h-60 overflow-auto">
                  {suggestions.map((f, i) => (
                    <button
                      key={i}
                      onClick={() => selectAddress(f)}
                      className="w-full text-left px-3 py-2 hover:bg-accent border-b last:border-b-0"
                    >
                      <div className="text-sm font-medium">{f.properties.label}</div>
                      {f.properties.context && (
                        <div className="text-xs text-muted-foreground">{f.properties.context}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Surface */}
            <div>
              <Label htmlFor="surface">Surface habitable (m²)</Label>
              <div className="relative mt-1.5">
                <Calculator className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="surface"
                  type="number"
                  min="0"
                  value={surface}
                  onChange={(e) => setSurface(e.target.value)}
                  placeholder="Ex : 90"
                  className="pl-9"
                  disabled={!selected}
                />
              </div>
            </div>

            <Button
              onClick={estimate}
              disabled={!selected || !surface || Number(surface) <= 0 || loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Estimation en cours…
                </>
              ) : (
                "Estimer"
              )}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <div className="flex items-start gap-2 p-4 mb-6 rounded-md border border-destructive/30 bg-destructive/5 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <>
            <Card className="mb-6">
              <CardContent className="pt-6 text-center">
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Estimation
                </div>
                <div className="text-4xl font-heading font-bold text-primary mb-3">
                  {euro.format(result.estimatedPrice)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Prix moyen : {euro.format(result.averagePricePerSqm)}/m² — sur {result.sampleSize} vente
                  {result.sampleSize > 1 ? "s" : ""} récente{result.sampleSize > 1 ? "s" : ""}
                </div>
              </CardContent>
            </Card>

            <h2 className="text-xl font-heading font-semibold mb-3">
              Ventes récentes à proximité
            </h2>
            <div className="space-y-2">
              {recentSales.map((sale, i) => (
                <Card key={i}>
                  <CardContent className="py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">
                        {sale.type_local} • {Math.round(sale.surface_reelle_bati)} m²
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {sale.nom_commune || ""} — vendue {euro.format(sale.valeur_fonciere)} en{" "}
                        {formatYear(sale.date_mutation)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}