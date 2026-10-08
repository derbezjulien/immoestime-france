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

export default function Confidentialite() {
  useSeo({ title: "Politique de confidentialité | L'Indice Immo", description: "Politique de confidentialité de L'Indice Immo : données collectées, finalité, conservation et droits RGPD.", path: "/confidentialite" });
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-3xl mx-auto px-6 py-10">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent mb-6">
          <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
        </Link>
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-2xl">Politique de confidentialité</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              La protection de vos données personnelles est une priorité pour L'Indice Immo. Cette page vous explique comment nous traitons vos données lors de votre navigation sur www.indiceimmo.org.
            </p>
            <Section title="1. Collecte des données">
              <p>L'utilisation de l'outil d'estimation est gratuite et ne nécessite pas la création d'un compte utilisateur.</p>
              <p>Les données que vous saisissez dans le formulaire (adresse du bien, surface, état) sont traitées instantanément par notre algorithme pour générer l'estimation. Ces données ne sont ni sauvegardées dans nos bases de données, ni revendues à des tiers. L'adresse saisie n'est conservée que le temps de votre session de navigation pour vous afficher le résultat.</p>
            </Section>
            <Section title="2. Utilisation des Cookies et Publicité (Google AdSense)">
              <p>Pour maintenir la gratuité de ce service, notre site utilise la régie publicitaire Google AdSense.</p>
              <p>Google et ses partenaires utilisent des cookies et d'autres technologies de suivi pour diffuser des annonces pertinentes en fonction de votre historique de navigation sur notre site et/ou sur d'autres sites web.</p>
              <p>Les cookies publicitaires permettent à Google et à ses partenaires de diffuser des annonces ciblées.</p>
              <p>Vous pouvez désactiver la publicité personnalisée en accédant aux <a href="https://adssettings.google.com" className="text-accent hover:underline" target="_blank" rel="noreferrer">Paramètres des annonces Google</a>.</p>
            </Section>
            <Section title="3. Données de navigation (Analytics)">
              <p>Nous pouvons être amenés à utiliser des outils de mesure d'audience anonymes pour comprendre comment notre site est utilisé et l'améliorer (pages visitées, temps passé, type d'appareil). Ces données sont anonymisées et ne permettent pas de vous identifier personnellement.</p>
            </Section>
            <Section title="4. Vos droits (RGPD)">
              <p>Conformément à la réglementation européenne (RGPD) et à la loi Informatique et Libertés, bien que nous ne stockions pas de données personnelles nominatives via notre formulaire d'estimation, vous disposez d'un droit d'accès, de rectification et d'effacement des données qui pourraient vous concerner.</p>
              <p>Pour exercer ce droit, vous pouvez nous contacter à l'adresse suivante : <a href="mailto:derbez.julien@indiceimmo.org" className="text-accent hover:underline">derbez.julien@indiceimmo.org</a></p>
            </Section>
            <Section title="5. Modification de la politique de confidentialité">
              <p>L'éditeur se réserve le droit de modifier la présente politique de confidentialité à tout moment, notamment en fonction de l'évolution de la législation.</p>
            </Section>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}