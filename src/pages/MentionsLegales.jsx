import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useSeo from "@/hooks/use-seo";

function Section({ title, children }) {
  return (
    <section className="mb-6">
      <h2 className="text-lg font-heading font-semibold text-primary mb-2">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

export default function MentionsLegales() {
  useSeo({ title: "Mentions légales | L'Indice Immo", description: "Mentions légales de L'Indice Immo, application d'estimation immobilière indicative.", path: "/mentions-legales" });
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-3xl mx-auto px-6 py-10">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent mb-6">
          <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
        </Link>
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-2xl">Mentions légales</CardTitle>
          </CardHeader>
          <CardContent>
            <Section title="Éditeur de la publication">
              <p>Le présent site est édité par : [À COMPLÉTER — nom de l'éditeur]</p>
              <p>Adresse : [À COMPLÉTER]</p>
              <p>E-mail : [À COMPLÉTER]</p>
              <p>Forme juridique : [À COMPLÉTER]</p>
              <p>Capital social : [À COMPLÉTER]</p>
              <p>Numéro SIRET : [À COMPLÉTER]</p>
            </Section>
            <Section title="Directeur de la publication">
              <p>[À COMPLÉTER — nom du directeur de la publication]</p>
            </Section>
            <Section title="Hébergeur">
              <p>Le site est hébergé par : [À COMPLÉTER — nom de l'hébergeur]</p>
              <p>Adresse : [À COMPLÉTER]</p>
              <p>Contact : [À COMPLÉTER]</p>
            </Section>
            <Section title="Propriété intellectuelle">
              <p>Les éléments de ce site (textes, logos, charte graphique) sont la propriété de leur auteur. Toute reproduction, même partielle, est soumise à autorisation préalable.</p>
            </Section>
            <Section title="Sources des données">
              <p>Les estimations reposent sur des données publiques :</p>
              <p>• Base Adresse Nationale (BAN) — adresse.data.gouv.fr</p>
              <p>• Demandes de Valeurs Foncières (DVF) — data.gouv.fr / Cerema</p>
            </Section>
            <Section title="Limitation de responsabilité">
              <p>Les estimations fournies par ce site sont indicatives et fondées sur des ventes réelles enregistrées dans la commune. Elles ne constituent pas une expertise et ne remplacent pas l'avis d'un professionnel de l'immobilier.</p>
            </Section>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}