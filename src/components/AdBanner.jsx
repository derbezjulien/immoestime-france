import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Encart publicitaire horizontal (format leaderboard) réutilisable.
 *
 * Sobriété absolue :
 *  - Hauteur contenue (90 px), largeur plafonnée à 728 px (leaderboard classique).
 *  - Marges verticales généreuses (my-8) pour laisser respirer les éléments.
 *  - Aucun format intrusif : pas de pop-up, pas de carré géant, pas de format
 *    responsive plein écran. data-ad-format="horizontal" verrouille le format.
 *
 * Mode placeholder : tant que les identifiants AdSense ne sont pas fournis,
 * le composant affiche un bloc de remplacement qui se fond dans le design
 * (fond crème, bordure pointillée fine, libellé "Espace partenaire" en gris clair).
 *
 * Activation future : passer les props `adClient` ("ca-pub-XXXX") et `slot`.
 */
export default function AdBanner({ adClient = "ca-pub-2634463474515021", slot = "1580332016", className }) {
  const insRef = useRef(null);
  const isLive = Boolean(adClient && slot);

  useEffect(() => {
    if (!isLive) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* silencieux : l'encart ne doit jamais perturber l'UI */
    }
  }, [isLive]);

  if (!isLive) {
    return (
      <div
        aria-hidden="true"
        className={cn(
          "w-full max-w-[728px] mx-auto h-[90px] my-8 rounded-xl border border-dashed border-border/70 bg-secondary/40 flex items-center justify-center",
          className
        )}
      >
        <span className="text-xs tracking-wide text-muted-foreground/70 select-none">
          Espace partenaire
        </span>
      </div>
    );
  }

  return (
    <div className={cn("w-full max-w-[728px] mx-auto min-h-[90px] my-8 overflow-hidden", className)}>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: "block", width: "100%", maxWidth: "728px", height: "90px" }}
        data-ad-client={adClient}
        data-ad-slot={slot}
        data-ad-format="horizontal"
        data-full-width-responsive="false"
      />
    </div>
  );
}