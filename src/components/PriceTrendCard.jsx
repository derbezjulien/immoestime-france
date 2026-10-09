import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const euro = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export default function PriceTrendCard({ trendData }) {
  if (!trendData || trendData.length < 2) return null;

  const first = trendData[0];
  const last = trendData[trendData.length - 1];
  const change =
    first.avgPerSqm > 0
      ? ((last.avgPerSqm - first.avgPerSqm) / first.avgPerSqm) * 100
      : 0;

  const TrendIcon = change > 2 ? TrendingUp : change < -2 ? TrendingDown : Minus;
  const trendLabel = change > 2 ? "Hausse" : change < -2 ? "Baisse" : "Stable";
  const trendColor =
    change > 2
      ? "text-green-500"
      : change < -2
      ? "text-red-500"
      : "text-muted-foreground";

  return (
    <Card className="mb-8 shadow-soft">
      <CardHeader>
        <CardTitle className="text-primary text-lg flex items-center gap-2">
          <span className="inline-block w-1.5 h-5 rounded-full bg-accent" />
          Tendance du prix au m²
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">
            Évolution sur {trendData.length} an{trendData.length > 1 ? "s" : ""}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 text-sm font-semibold ${trendColor}`}
          >
            <TrendIcon className="w-4 h-4" />
            {change > 0 ? "+" : ""}
            {change.toFixed(1)}% ({trendLabel})
          </span>
        </div>

        <div className="h-48 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={trendData}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="year"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={45}
              />
              <Tooltip
                formatter={(v) => [`${euro.format(v)}/m²`, "Prix moyen"]}
                labelFormatter={(l) => `Année ${l}`}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  color: "hsl(var(--card-foreground))",
                }}
                labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                itemStyle={{ color: "hsl(var(--card-foreground))" }}
              />
              <Line
                type="monotone"
                dataKey="avgPerSqm"
                stroke="hsl(var(--accent))"
                strokeWidth={2.5}
                dot={{ r: 5, fill: "hsl(var(--accent))" }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex gap-3">
          {trendData.map((d) => (
            <div
              key={d.year}
              className="flex-1 text-center rounded-xl bg-muted/50 p-3"
            >
              <div className="text-xs text-muted-foreground mb-1">{d.year}</div>
              <div className="text-sm font-semibold text-primary">
                {euro.format(d.avgPerSqm)}/m²
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {d.count} vente{d.count > 1 ? "s" : ""}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs text-muted-foreground text-center">
          Tendance calculée à partir des ventes réelles enregistrées dans la
          commune (DVF). Valeur indicative, ne constitue pas une prévision.
        </p>
      </CardContent>
    </Card>
  );
}