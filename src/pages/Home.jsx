import React from "react";
import { Link } from "react-router-dom";
import { Home as HomeIcon, MapPin, Calculator, TrendingUp, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Home() {
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground shadow-soft mb-6 ring-1 ring-accent/30">
            <HomeIcon className="w-8 h-8" />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 text-accent text-xs font-semibold px-3 py-1 mb-5 ring-1 ring-accent/25">
            <ShieldCheck className="w-3.5 h-3.5" /> Données officielles de l'État
          </span>
          <h1 className="text-4xl md:text-6xl font-heading font-bold tracking-tight mb-5 text-primary leading-[1.1]">
            Estimez votre bien immobilier
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-9">
            Une estimation fiable et impartiale basée sur les ventes réelles
            récentes autour de chez vous, issues des données officielles de l'État français.
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
            <CardTitle className="text-primary text-lg">Localisation Certifiée</CardTitle>
            <CardDescription>
              Saisissez simplement l'adresse de votre propriété. Notre système la valide instantanément en s'appuyant sur les registres officiels de l'État pour garantir une précision absolue.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="transition-all hover:shadow-md hover:-translate-y-0.5">
          <CardHeader>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 mb-3 ring-1 ring-accent/20">
              <Calculator className="w-6 h-6 text-accent" />
            </div>
            <CardTitle className="text-primary text-lg">Évaluation Sur-Mesure</CardTitle>
            <CardDescription>
              Renseignez la surface habitable de votre bien. Obtenez en un clic une valorisation immédiate, personnalisée et strictement confidentielle de votre patrimoine.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="transition-all hover:shadow-md hover:-translate-y-0.5">
          <CardHeader>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 mb-3 ring-1 ring-accent/20">
              <TrendingUp className="w-6 h-6 text-accent" />
            </div>
            <CardTitle className="text-primary text-lg">Historique Notarié</CardTitle>
            <CardDescription>
              Votre prix de référence est calculé exclusivement à partir des véritables actes de vente enregistrés par les notaires dans votre quartier au cours des trois dernières années.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60">
        <div className="max-w-5xl mx-auto px-6 py-8 text-center text-sm text-muted-foreground">
          Données : Base Adresse Nationale & Demande de Valeurs Foncières (DVF) — data.gouv.fr
        </div>
      </footer>
    </div>
  );
}