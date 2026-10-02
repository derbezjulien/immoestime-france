import React from "react";
import { Hammer, PaintRoller, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// Cartes de repère (milestones) cliquables affichées au-dessus du curseur.
const MILESTONES = [
  { value: 0, Icon: Hammer, title: "0 | À rénover", subtitle: "Gros œuvre (Toiture, Élec)" },
  { value: 5, Icon: PaintRoller, title: "5 | Rafraîchissements", subtitle: "Peinture, Sols, Cuisine" },
  { value: 10, Icon: Sparkles, title: "10 | État neuf", subtitle: "Récent, Garantie décennale" },
];

const GOLD = "#eab308"; // yellow-500

export default function VetusteSlider({ value, onChange, disabled }) {
  // Détermine la carte la plus proche de la note actuelle pour la mise en valeur.
  const nearest = MILESTONES.reduce((best, m) =>
    Math.abs(value - m.value) < Math.abs(value - best.value) ? m : best, MILESTONES[0]
  );
  const pct = (value / 10) * 100;

  return (
    <div>
      <style>{`
        input.vetuste-range {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 9999px;
          outline: none;
        }
        input.vetuste-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 9999px;
          background: #ffffff;
          border: 2px solid ${GOLD};
          box-shadow: 0 4px 12px rgba(234, 179, 8, 0.35);
          cursor: pointer;
          margin-top: -8px;
          transition: transform 0.1s ease;
        }
        input.vetuste-range::-webkit-slider-thumb:active { transform: scale(1.12); }
        input.vetuste-range::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 9999px;
          background: #ffffff;
          border: 2px solid ${GOLD};
          box-shadow: 0 4px 12px rgba(234, 179, 8, 0.35);
          cursor: pointer;
        }
        input.vetuste-range:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      {/* Cartes de repère cliquables */}
      <div className="flex justify-between gap-2">
        {MILESTONES.map((m) => {
          const active = m.value === nearest.value;
          return (
            <button
              key={m.value}
              type="button"
              disabled={disabled}
              onClick={() => onChange(m.value)}
              className={cn(
                "flex-1 rounded-xl bg-card p-2.5 border text-center transition-all duration-200 cursor-pointer hover:bg-gray-800",
                active
                  ? "border-yellow-500 text-yellow-500"
                  : "border-border/60 text-gray-400"
              )}
            >
              <m.Icon className="w-8 h-8 mx-auto mb-1" strokeWidth={1.5} />
              <div className="text-[11px] font-semibold leading-tight">{m.title}</div>
              <div className="text-[10px] leading-tight mt-0.5 opacity-80">{m.subtitle}</div>
            </button>
          );
        })}
      </div>

      {/* Note alignée à droite */}
      <div className="flex justify-end mt-4 mb-2">
        <span className="text-sm font-bold text-yellow-500 tabular-nums">Note : {value} / 10</span>
      </div>

      {/* Curseur (range) — piste dorée remplie jusqu'au thumb */}
      <input
        type="range"
        min={0}
        max={10}
        step={1}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="vetuste-range"
        style={{
          background: `linear-gradient(to right, ${GOLD} 0%, ${GOLD} ${pct}%, hsl(var(--muted)) ${pct}%, hsl(var(--muted)) 100%)`,
        }}
      />
    </div>
  );
}