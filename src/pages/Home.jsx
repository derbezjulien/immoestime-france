import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Calculator, TrendingUp, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import useSeo from "@/hooks/use-seo";

export default function Home() {
  useSeo({ title: "Estimation immobilière gratuite en ligne | Chevillette.fr", description: "Estimez gratuitement votre maison ou appartement à partir des ventes réelles de votre commune (DVF, données de l'État). Estimation indicative.", path: "/" });
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 18% 20%, #CBA328 0, transparent 42%), radial-gradient(circle at 82% 0%, #1E293B 0, transparent 38%)",
          }}
        />
        <div className="relative max-w-5xl mx-auto px-6 py-24 text-center">
          <Logo height={140} className="mb-6" />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 text-accent text-xs font-semibold px-3 py-1 mb-5 ring-1 ring-accent/25">
            <ShieldCheck className="w-3.5 h-3.5" /> Données officielles de l'État
          </span>
          <h1 className="text-4xl md:text-6xl font-heading font-bold tracking-tight mb-5 text-primary leading-[1.1]">
            Estimez votre bien immobilier
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-9">
            Une estimation indicative basée sur les ventes réelles récentes de votre commune, issues des données ouvertes de l'État (DVF).
          </p>
          <Button asChild size="lg" className="shadow-soft">
            <Link to="/estimation">Commencer une estimation</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-16 grid gap-6 md:grid-cols-3">
        <Card className="transition-all hover:shadow-md hover:-translate-y-0.5">
          <CardHeader>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 mb-3 ring-1 ring-accent/20">
              <MapPin className="w-6 h-6 text-accent" />
            </div>
            <CardTitle className="text-primary text-lg">Recherche d'adresse</CardTitle>
            <CardDescription>
              Saisissez l'adresse de votre bien ; elle est recherchée dans la Base Adresse Nationale.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="transition-all hover:shadow-md hover:-translate-y-0.5">
          <CardHeader>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 mb-3 ring-1 ring-accent/20">
              <Calculator className="w-6 h-6 text-accent" />
            </div>
            <CardTitle className="text-primary text-lg">Estimation personnalisée</CardTitle>
            <CardDescription>
              Renseignez la surface de votre bien pour obtenir une valeur indicative.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="transition-all hover:shadow-md hover:-translate-y-0.5">
          <CardHeader>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 mb-3 ring-1 ring-accent/20">
              <TrendingUp className="w-6 h-6 text-accent" />
            </div>
            <CardTitle className="text-primary text-lg">Ventes réelles récentes</CardTitle>
            <CardDescription>
              Votre prix de référence est calculé à partir des ventes enregistrées dans votre commune au cours des trois dernières années (Demandes de Valeurs Foncières).
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60">
        <div className="max-w-5xl mx-auto px-6 py-8 text-center text-sm text-muted-foreground space-y-3">
          <div>Données : Base Adresse Nationale & Demande de Valeurs Foncières (DVF) — data.gouv.fr</div>
          <div className="text-xs">
            <Link to="/mentions-legales" className="hover:text-accent hover:underline">Mentions légales</Link>
            <span className="mx-2">·</span>
            <Link to="/confidentialite" className="hover:text-accent hover:underline">Confidentialité</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}