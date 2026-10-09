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
  useSeo({ title: "Mentions légales | Chevillette.fr", description: "Mentions légales de Chevillette.fr, application d'estimation immobilière indicative.", path: "/mentions-legales" });
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
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              En vertu de l'article 6 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique, il est précisé aux utilisateurs du site internet Chevillette.fr (www.chevillette.fr) l'identité des différents intervenants dans le cadre de sa réalisation et de son suivi :
            </p>
            <Section title="1. Éditeur du site">
              <p>Le site Chevillette.fr est édité par :</p>
              <p>Nom / Prénom : Julien Derbez</p>
              <p>Statut : Particulier</p>
              <p>Adresse de domiciliation : 33410 Cadillac</p>
              <p>Email de contact : derbez.julien@indiceimmo.org</p>
            </Section>
            <Section title="2. Directeur de la publication">
              <p>Le Directeur de la publication est : Julien Derbez</p>
            </Section>
            <Section title="3. Hébergement">
              <p>Le site est hébergé par :</p>
              <p>IONOS SARL</p>
              <p>7, place de la Gare</p>
              <p>BP 70109</p>
              <p>57200 Sarreguemines Cedex</p>
              <p>France</p>
              <p>Site Web : <a href="https://www.ionos.fr" className="text-accent hover:underline" target="_blank" rel="noreferrer">https://www.ionos.fr</a></p>
            </Section>
            <Section title="4. Propriété intellectuelle">
              <p>L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. Le design, le code source, le logo "Chevillette.fr" et l'algorithme d'estimation sont la propriété exclusive de l'éditeur. Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable.</p>
            </Section>
            <Section title="5. Avertissement sur les estimations">
              <p>Les estimations fournies par l'outil Chevillette.fr sont données à titre purement indicatif. Elles sont issues d'un algorithme croisant les données publiques de l'État (DVF - Demandes de Valeurs Foncières) et des indices mathématiques de vétusté. Ces résultats ne constituent en aucun cas une expertise immobilière officielle ou notariale et ne sauraient engager la responsabilité de l'éditeur en cas de transaction immobilière.</p>
            </Section>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}