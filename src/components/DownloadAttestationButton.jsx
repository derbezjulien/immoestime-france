import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import jsPDF from "jspdf";

// Formatage montant en euros, sans espaces insécables problématiques pour jsPDF.
const fmtEuro = (n) =>
  `${Math.round(n).toLocaleString("fr-FR").replace(/[\u202f\u00a0]/g, " ")} €`;

export default function DownloadAttestationButton({ data }) {
  const [generating, setGenerating] = useState(false);

  const generate = () => {
    setGenerating(true);
    // Differé pour laisser le spinner se peindre avant le travail synchrone.
    setTimeout(() => {
      try {
        const doc = new jsPDF({ unit: "mm", format: "a4" });
        const pageW = doc.internal.pageSize.getWidth();
        const margin = 20;
        let y = 26;

        // === En-tête marque ===
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(15, 23, 42);
        doc.text("L'Indice Immo", margin, y);
        y += 5;
        doc.setDrawColor(212, 175, 55);
        doc.setLineWidth(0.8);
        doc.line(margin, y, pageW - margin, y);
        y += 10;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(110, 110, 110);
        doc.text("Attestation d'estimation immobilière", margin, y);
        y += 7;
        doc.setFontSize(9);
        doc.text(`Éditée le ${new Date().toLocaleDateString("fr-FR")}`, margin, y);
        y += 12;

        // === Informations du bien ===
        const rows = [
          ["Adresse", data.address || "—"],
          ["Type de bien", data.propertyType || "—"],
          ["Surface habitable", data.surface ? `${data.surface} m²` : "—"],
          ["Surface du terrain", data.terrainSurface ? `${data.terrainSurface} m²` : "Non renseignée"],
          ["Indice de vétusté", `${data.vetuste} / 10`],
        ];
        doc.setFontSize(11);
        rows.forEach(([label, val]) => {
          doc.setFont("helvetica", "bold");
          doc.setTextColor(15, 23, 42);
          doc.text(label, margin, y);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(70, 70, 70);
          doc.text(String(val), margin + 58, y);
          y += 8;
        });

        // === Prix mis en évidence ===
        y += 4;
        doc.setFillColor(15, 23, 42);
        doc.roundedRect(margin, y, pageW - margin * 2, 28, 3, 3, "F");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(212, 175, 55);
        doc.text("Estimation retenue", margin + 6, y + 10);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(24);
        doc.setTextColor(212, 175, 55);
        doc.text(fmtEuro(data.estimatedPrice), margin + 6, y + 22);
        y += 36;

        // === Mention légale ===
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.setTextColor(130, 130, 130);
        const mention = data.fallback
          ? `Réseau notarial momentanément indisponible. Estimation sécurisée via les indices officiels INSEE des 3 dernières années pour la commune de ${data.fallbackCommune || ""}.`
          : "Estimation fondée sur les ventes réelles enregistrées (fichier DVF - Demandes de Valeurs Foncières) à proximité de l'adresse, sur les 3 dernières années.";
        const lines = doc.splitTextToSize(mention, pageW - margin * 2);
        doc.text(lines, margin, y);
        y += lines.length * 5 + 8;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(160, 160, 160);
        const disclaimer = doc.splitTextToSize(
          "Ce document présente une valeur indicative et ne constitue pas une expertise notariale.",
          pageW - margin * 2
        );
        doc.text(disclaimer, margin, y);

        doc.save("attestation-estimation-immo.pdf");
      } finally {
        setGenerating(false);
      }
    }, 50);
  };

  return (
    <button
      type="button"
      onClick={generate}
      disabled={generating}
      className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border border-yellow-500/60 bg-transparent text-yellow-500 text-sm font-semibold hover:bg-yellow-500/10 transition-colors disabled:opacity-60"
    >
      {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      {generating ? "Génération…" : "Télécharger mon attestation (PDF)"}
    </button>
  );
}