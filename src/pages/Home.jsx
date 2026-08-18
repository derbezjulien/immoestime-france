import React from "react";
import { Link } from "react-router-dom";
import { Home as HomeIcon, MapPin, Calculator, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b">
        <div className="max-w-5xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-primary text-primary-foreground mb-6">
            <HomeIcon className="w-7 h-7" />
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight mb-4">
            Estimez votre bien immobilier
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Une estimation fiable et impartiale basée sur les ventes réelles
            récentes autour de chez vous, issues des données officielles de l'État français.
          </p>
          <Button asChild size="lg">
            <Link to="/estimation">Commencer une estimation</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-16 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <MapPin className="w-6 h-6 text-primary mb-2" />
            <CardTitle>Adresse précise</CardTitle>
            <CardDescription>
              Saisissez votre adresse avec autocomplétion via la Base Adresse Nationale.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <Calculator className="w-6 h-6 text-primary mb-2" />
            <CardTitle>Calcul au m²</CardTitle>
            <CardDescription>
              Indiquez la surface habitable et obtenez une estimation instantanée.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <TrendingUp className="w-6 h-6 text-primary mb-2" />
            <CardTitle>Ventes réelles</CardTitle>
            <CardDescription>
              Prix moyen calculé sur les ventes DVF des 3 dernières années à proximité.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="max-w-5xl mx-auto px-6 py-8 text-center text-sm text-muted-foreground">
          Données : Base Adresse Nationale & Demande de Valeurs Foncières (DVF) — data.gouv.fr
        </div>
      </footer>
    </div>
  );
}