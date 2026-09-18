import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Home as HomeIcon, MapPin, Calculator, Loader2, AlertCircle, Building2, Sparkles, TrendingUp, Trees } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import SaleDetailDialog from "@/components/SaleDetailDialog";

const euro = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

function formatYear(dateIso) {
  return dateIso ? dateIso.substring(0, 4) : "—";
}

// === Paramètres ajustables du mode secours (estimation par moyenne communale) ===
// Décote appliquée au prix au m² bâti d'une maison pour isoler la valeur de la construction.
const MAISON_BATI_DISCOUNT = 0.15;
// Valorisation du terrain à ajouter pour une maison (€ / m² de terrain).
const TERRAIN_PRICE_PER_SQM = 50;

export default function Estimation() {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [surface, setSurface] = useState("");
  const [propertyType, setPropertyType] = useState("Appartement");
  const [terrainSurface, setTerrainSurface] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [recentSales, setRecentSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
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

      // Filtre par type de bien sélectionné : on ne compare que des biens similaires.
      const sales = features
        .map((f) => f.properties)
        .filter((m) => {
          const hasPrice = m.valeur_fonciere && m.valeur_fonciere > 0;
          const hasSurface = m.surface_reelle_bati && m.surface_reelle_bati > 0;
          const dateOk = m.date_mutation && new Date(m.date_mutation) >= cutoff;
          return m.type_local === propertyType && hasPrice && hasSurface && dateOk;
        });

      if (sales.length === 0) {
        setError(`Aucune vente récente de type ${propertyType.toLowerCase()} trouvée à proximité de cette adresse.`);
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
          .slice(0, 6)
      );
    } catch (e) {
      const msg = (e && e.message) || "";
      const isServerDown =
        msg.includes("DVF_TIMEOUT") || msg.includes("DVF_UNAVAILABLE") || msg.includes("504") || msg.includes("502");

      if (isServerDown) {
        // Mode dégradé : l'API est en panne et aucune donnée n'était en cache.
        // On se replie sur le dictionnaire national statique des prix moyens au m².
        try {
          const fallbackModule = await import("@/data/fallback_national.json");
          const citycode = selected.properties.citycode;
          const avgPerSqm = fallbackModule.default?.[citycode] ?? fallbackModule[citycode];
          if (avgPerSqm && avgPerSqm > 0) {
            const surfaceBati = Number(surface);
            let estimatedPrice;
            if (propertyType === "Maison") {
              // Décote sur le bâti pour isoler la valeur de la construction,
              // puis ajout de la valorisation du terrain.
              const batiValue = avgPerSqm * (1 - MAISON_BATI_DISCOUNT) * surfaceBati;
              const terrainValue = (Number(terrainSurface) || 0) * TERRAIN_PRICE_PER_SQM;
              estimatedPrice = batiValue + terrainValue;
            } else {
              // Appartement : prix au m² du dictionnaire appliqué directement à la surface habitable.
              estimatedPrice = avgPerSqm * surfaceBati;
            }
            setResult({
              estimatedPrice,
              averagePricePerSqm: avgPerSqm,
              fallback: true,
              fallbackCommune: selected.properties.city || selected.properties.name || "",
            });
            setRecentSales([]);
          } else {
            setError(
              "Le serveur officiel des données foncières est indisponible et aucune moyenne de référence n'existe pour cette commune. Réessayez plus tard."
            );
          }
        } catch {
          setError("Le serveur des données foncières est indisponible. Réessayez dans quelques minutes.");
        }
      } else {
        setError(msg || "Erreur lors de l'estimation.");
      }
    } finally {
      setLoading(false);
    }
  }, [selected, surface, propertyType, terrainSurface]);

  return (
    <div className="min-h-screen bg-background">
      <header className="hidden md:block border-b border-border/60 bg-card/70 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-heading font-semibold text-primary">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
              <HomeIcon className="w-4 h-4" />
            </span>
            ImmoEstim
          </Link>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" /> Estimation
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-heading font-bold tracking-tight mb-2 text-primary">
            Estimation immobilière
          </h1>
          <p className="text-muted-foreground">
            Saisissez votre adresse et la surface pour obtenir une estimation basée sur les ventes réelles à proximité.
          </p>
        </div>

        <Card className="mb-6 shadow-soft">
          <CardContent className="pt-6 space-y-4">
            {/* Adresse */}
            <div className="relative">
              <Label htmlFor="address" className="text-primary font-medium">Adresse du bien</Label>
              <div className="relative mt-1.5">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                <Input
                  id="address"
                  value={query}
                  onChange={(e) => onQueryChange(e.target.value)}
                  placeholder="Ex : 10 cours Foch, Podensac"
                  className="pl-10"
                />
              </div>
              {suggestions.length > 0 && (
                <div className="absolute z-10 mt-1.5 w-full rounded-xl border border-border/60 bg-popover shadow-soft max-h-60 overflow-auto">
                  {suggestions.map((f, i) => (
                    <button
                      key={i}
                      onClick={() => selectAddress(f)}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-accent/10 border-b border-border/40 last:border-b-0 transition-colors"
                    >
                      <div className="text-sm font-medium text-primary">{f.properties.label}</div>
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
              <Label htmlFor="surface" className="text-primary font-medium">Surface habitable (m²)</Label>
              <div className="relative mt-1.5">
                <Calculator className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                <Input
                  id="surface"
                  type="number"
                  min="0"
                  value={surface}
                  onChange={(e) => setSurface(e.target.value)}
                  placeholder="Ex : 90"
                  className="pl-10"
                  disabled={!selected}
                />
              </div>
            </div>

            {/* Type de bien */}
            <div>
              <Label className="text-primary font-medium">Type de bien</Label>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                {["Appartement", "Maison"].map((t) => {
                  const active = propertyType === t;
                  const Icon = t === "Maison" ? HomeIcon : Building2;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setPropertyType(t)}
                      className={cn(
                        "flex items-center justify-center gap-2 h-11 rounded-xl border text-sm font-semibold transition-all",
                        active
                          ? "bg-primary text-primary-foreground border-primary shadow-soft"
                          : "bg-card text-muted-foreground border-input hover:border-accent/40 hover:text-accent-foreground"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Surface du terrain (optionnel) */}
            <div>
              <Label htmlFor="terrain" className="text-primary font-medium">
                Surface du terrain (m²) <span className="text-muted-foreground font-normal">(optionnel)</span>
              </Label>
              <div className="relative mt-1.5">
                <Trees className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                <Input
                  id="terrain"
                  type="number"
                  min="0"
                  value={terrainSurface}
                  onChange={(e) => setTerrainSurface(e.target.value)}
                  placeholder="Ex : 200"
                  className="pl-10"
                  disabled={!selected}
                />
              </div>
            </div>

            <Button
              onClick={estimate}
              disabled={!selected || !surface || Number(surface) <= 0 || loading}
              className="w-full h-12 text-base shadow-soft"
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
          <div className="flex items-start gap-2.5 p-4 mb-6 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <>
            <Card className="mb-8 relative overflow-hidden border-0 bg-primary text-primary-foreground shadow-glow">
              <div
                className="absolute inset-0 pointer-events-none opacity-25"
                style={{ backgroundImage: "radial-gradient(circle at 85% -20%, #CBA328 0, transparent 60%)" }}
              />
              <CardContent className="relative pt-8 pb-8 text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 text-accent text-xs font-semibold px-3 py-1 mb-4 ring-1 ring-accent/30">
                  <Sparkles className="w-3.5 h-3.5" /> Estimation
                </span>
                <div className="text-5xl md:text-6xl font-heading font-extrabold text-accent mb-4 tracking-tight">
                  {euro.format(result.estimatedPrice)}
                </div>
                {result.fallback ? (
                  <>
                    <div className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm text-primary-foreground/80 ring-1 ring-white/10">
                      <TrendingUp className="w-4 h-4 text-accent" />
                      Prix moyen de référence : <span className="font-semibold text-primary-foreground">{euro.format(result.averagePricePerSqm)}/m²</span>
                    </div>
                    <p className="mt-4 text-xs text-primary-foreground/70 italic">
                      Estimation basée sur la moyenne communale ({result.fallbackCommune}) — mode dégradé, données indicatives.
                    </p>
                  </>
                ) : (
                  <div className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm text-primary-foreground/80 ring-1 ring-white/10">
                    <TrendingUp className="w-4 h-4 text-accent" />
                    Prix moyen : <span className="font-semibold text-primary-foreground">{euro.format(result.averagePricePerSqm)}/m²</span>
                    <span className="text-primary-foreground/40">•</span>
                    sur {result.sampleSize} vente{result.sampleSize > 1 ? "s" : ""} récente{result.sampleSize > 1 ? "s" : ""}
                  </div>
                )}
              </CardContent>
            </Card>

            {!result.fallback && (
              <>
                <h2 className="text-xl font-heading font-semibold mb-4 text-primary flex items-center gap-2">
                  <span className="inline-block w-1.5 h-5 rounded-full bg-accent" />
                  Ventes récentes à proximité
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {recentSales.map((sale, i) => {
                const isHouse = sale.type_local === "Maison";
                const Icon = isHouse ? HomeIcon : Building2;
                return (
                  <Card
                    key={i}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedSale(sale)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedSale(sale); } }}
                    className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-accent/40"
                  >
                    <CardContent className="py-4 flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 ring-1 ring-accent/20">
                        <Icon className="w-5 h-5 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-primary">
                          {sale.type_local} • {Math.round(sale.surface_reelle_bati)} m²
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {sale.nom_commune || ""} — vendue {euro.format(sale.valeur_fonciere)} en{" "}
                          {formatYear(sale.date_mutation)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
                </div>
              </>
            )}
          </>
        )}

        <SaleDetailDialog
          sale={selectedSale}
          open={!!selectedSale}
          onOpenChange={(o) => { if (!o) setSelectedSale(null); }}
        />
      </main>
    </div>
  );
}