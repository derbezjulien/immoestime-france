import React from "react";
import { Hammer, Paintbrush, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// Cartes de repère (milestones) affichées au-dessus du curseur.
const MILESTONES = [
  {
    value: 0,
    Icon: Hammer,
    title: "0 | À rénover",
    subtitle: "Gros œuvre (Toiture, Élec)",
    iconClass: "text-primary",
  },
  {
    value: 5,
    Icon: Paintbrush,
    title: "5 | Rafraîchissements",
    subtitle: "Peinture, Sols, Cuisine",
    iconClass: "text-primary",
  },
  {
    value: 10,
    Icon: Sparkles,
    title: "10 | État neuf",
    subtitle: "Récent, Garantie décennale",
    iconClass: "text-accent",
  },
];

const GOLD = "#d4af37";

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
          height: 8px;
          border-radius: 9999px;
          outline: none;
        }
        input.vetuste-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 26px;
          height: 26px;
          border-radius: 9999px;
          background: #ffffff;
          border: 3px solid ${GOLD};
          box-shadow: 0 2px 8px rgba(212, 175, 55, 0.45);
          cursor: pointer;
          margin-top: -9px;
          transition: transform 0.1s ease;
        }
        input.vetuste-range::-webkit-slider-thumb:active { transform: scale(1.12); }
        input.vetuste-range::-moz-range-thumb {
          width: 26px;
          height: 26px;
          border-radius: 9999px;
          background: #ffffff;
          border: 3px solid ${GOLD};
          box-shadow: 0 2px 8px rgba(212, 175, 55, 0.45);
          cursor: pointer;
        }
        input.vetuste-range:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      {/* Cartes de repère */}
      <div className="flex justify-between gap-2">
        {MILESTONES.map((m) => {
          const active = m.value === nearest.value;
          return (
            <div
              key={m.value}
              className={cn(
                "flex-1 rounded-xl bg-card p-2.5 shadow-sm border text-center transition-all duration-200",
                active
                  ? "opacity-100 border-accent ring-1 ring-accent/40 scale-[1.03]"
                  : "opacity-60 border-border/60"
              )}
            >
              <m.Icon className={cn("w-5 h-5 mx-auto mb-1", m.iconClass)} />
              <div className="text-[11px] font-semibold text-primary leading-tight">{m.title}</div>
              <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">{m.subtitle}</div>
            </div>
          );
        })}
      </div>

      {/* Note sélectionnée */}
      <div className="flex items-baseline justify-between mt-4 mb-2">
        <span className="text-sm font-medium text-primary">Note sélectionnée</span>
        <span className="text-sm font-bold text-accent tabular-nums">Note : {value} / 10</span>
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