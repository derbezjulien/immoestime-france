import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function Section({ title, children }) {
  return (
    <section className="mb-6">
      <h2 className="text-lg font-heading font-semibold text-primary mb-2">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

export default function Confidentialite() {
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
            <Section title="Responsable du traitement">
              <p>Le responsable du traitement des données est : [À COMPLÉTER — nom de l'éditeur]</p>
              <p>Contact : [À COMPLÉTER — e-mail]</p>
            </Section>
            <Section title="Données collectées">
              <p>Lors de la création d'un compte, nous collectons :</p>
              <p>• votre adresse e-mail ;</p>
              <p>• votre nom (si vous le renseignez).</p>
              <p>Aucune donnée bancaire n'est collectée.</p>
            </Section>
            <Section title="Finalité">
              <p>Les données servent à la gestion de votre compte et à l'accès aux fonctionnalités d'estimation immobilière.</p>
            </Section>
            <Section title="Durée de conservation">
              <p>Vos données sont conservées tant que votre compte est actif. Vous pouvez demander leur suppression à tout moment depuis la page Paramètres, ou en nous contactant.</p>
            </Section>
            <Section title="Vos droits">
              <p>Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Vous pouvez exercer ces droits :</p>
              <p>• depuis la page Paramètres (suppression du compte) ;</p>
              <p>• en nous contactant à : [À COMPLÉTER — e-mail de contact].</p>
            </Section>
            <Section title="Sources de données utilisées">
              <p>L'application interroge des données publiques pour produire ses estimations :</p>
              <p>• Base Adresse Nationale (BAN) — recherche d'adresses ;</p>
              <p>• Demandes de Valeurs Foncières (DVF, data.gouv.fr) — ventes enregistrées.</p>
              <p>Ces données ne sont pas stockées durablement au-delà d'un cache temporaire nécessaire au fonctionnement du service.</p>
            </Section>
            <Section title="Cookies">
              <p>L'application n'utilise pas de cookies publicitaires. Seuls les cookies techniques nécessaires à son fonctionnement (session d'authentification) peuvent être déposés.</p>
            </Section>
            <Section title="Publicité">
              <p>[À COMPLÉTER — Ce paragraphe devra être renseigné avant toute activation d'une régie publicitaire (ex. Google AdSense). Il précisera la nature des publicités affichées, les cookies associés et les moyens de s'y opposer.]</p>
            </Section>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}