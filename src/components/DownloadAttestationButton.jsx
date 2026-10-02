import React, { useState, useRef } from "react";
import { Download, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import PdfTemplate from "@/components/PdfTemplate";

export default function DownloadAttestationButton({ data }) {
  const [generating, setGenerating] = useState(false);
  const templateRef = useRef(null);

  const generate = async () => {
    if (!templateRef.current) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(templateRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgH = (canvas.height * pageW) / canvas.width;
      // Ajuste à la page A4 (le template est aux proportions A4).
      const renderH = Math.min(imgH, pageH);
      pdf.addImage(imgData, "JPEG", 0, 0, pageW, renderH);
      pdf.save("attestation-estimation-immo.pdf");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={generate}
        disabled={generating}
        className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border border-yellow-500/60 bg-transparent text-yellow-500 text-sm font-semibold hover:bg-yellow-500/10 transition-colors disabled:opacity-60"
      >
        {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        {generating ? "Génération…" : "Télécharger mon attestation (PDF)"}
      </button>

      {/* Modèle A4 hors écran, utilisé uniquement par html2canvas */}
      <div className="absolute -left-[9999px] top-0" aria-hidden="true">
        <div ref={templateRef}>
          <PdfTemplate data={data} />
        </div>
      </div>
    </>
  );
}