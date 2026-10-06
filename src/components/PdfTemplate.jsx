import React from "react";
import { Home, MapPin, Maximize, Hammer, Trees } from "lucide-react";

// Formatage montant en euros, sans espaces insécables problématiques.
const fmtEuro = (n) =>
  `${Math.round(n).toLocaleString("fr-FR").replace(/[\u202f\u00a0]/g, " ")} €`;

// Modèle visuel A4 (800x1131px) utilisé uniquement comme source pour html2canvas.
export default function PdfTemplate({ data }) {
  const today = new Date().toLocaleDateString("fr-FR");
  const cards = [
    { Icon: MapPin, label: "Adresse", value: data.address || "—" },
    { Icon: Maximize, label: "Surface habitable", value: data.surface ? `${data.surface} m²` : "—" },
    { Icon: Trees, label: "Surface du terrain", value: data.terrainSurface ? `${data.terrainSurface} m²` : "Non renseignée" },
    { Icon: Hammer, label: "Indice de vétusté", value: `${data.vetuste} / 10` },
  ];

  return (
    <div className="w-[800px] h-[1131px] bg-white text-gray-900 font-sans p-10 flex flex-col">
      {/* === Header === */}
      <div className="bg-slate-900 text-white rounded-xl p-6 mb-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Home className="w-9 h-9 text-yellow-500" />
          <span className="text-3xl font-bold tracking-tight">L'Indice Immo</span>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-yellow-500">Estimation indicative</div>
          <div className="text-xs text-gray-300 mt-1">Éditée le {today}</div>
        </div>
      </div>

      {/* Type de bien */}
      <div className="mb-6 text-sm text-gray-500">
        Type de bien : <span className="font-semibold text-gray-800">{data.propertyType || "—"}</span>
      </div>

      {/* === Grille caractéristiques === */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-1.5">
              <c.Icon className="w-4 h-4 text-yellow-500" />
              <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{c.label}</span>
            </div>
            <div className="text-base font-semibold text-gray-800">{c.value}</div>
          </div>
        ))}
      </div>

      {/* === Bloc prix === */}
      <div className="bg-slate-900 rounded-xl p-8 text-center mb-8 shadow-lg">
        <div className="text-sm font-semibold text-yellow-500 uppercase tracking-widest mb-3">Estimation retenue</div>
        <div className="text-5xl text-yellow-500 font-bold">{fmtEuro(data.estimatedPrice)}</div>
        <div className="text-xs text-gray-300 mt-4">
          {data.fallback
            ? `Estimation indicative basée sur le prix moyen communal (DVF, data.gouv.fr) — commune de ${data.fallbackCommune || ""}`
            : "Basée sur les ventes réelles enregistrées dans la commune (DVF)"}
        </div>
      </div>

      {/* === Marketing === */}
      <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-100">
        <div className="text-base font-bold text-gray-800 mb-2">La suite de votre projet</div>
        <p className="text-sm text-gray-600 leading-relaxed">
          Cette estimation mathématique est un excellent point de départ. Pour affiner la valeur de votre bien et tenir compte de ses prestations uniques, nous vous recommandons de consulter un professionnel du secteur.
        </p>
      </div>

      {/* === Mentions légales === */}
      <div className="mt-auto pt-6 border-t border-gray-100">
        <p className="text-xs text-gray-400 leading-relaxed">
          Sources des données : Demandes de Valeurs Foncières (DVF) — data.gouv.fr / Cerema. Cette estimation présente une valeur indicative fondée sur des ventes réelles et ne constitue pas une expertise notariale.
        </p>
      </div>
    </div>
  );
}