import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3 } from "lucide-react";
import { useStore } from "@/lib/store";
import { caloriesSeries, weightSeries } from "@/lib/calc";
import { formatDate, formatKg, formatNumber, formatShortDate } from "@/lib/format";
import { DAY_OPTIONS, Panel, PeriodFilter, SectionTitle } from "./common";

const axis = { stroke: "var(--color-muted-foreground)", fontSize: 11, tickLine: false, axisLine: false };

function TooltipBox({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-card">
      <div className="font-medium">{title}</div>
      {lines.map((l) => (
        <div key={l} className="text-muted-foreground">{l}</div>
      ))}
    </div>
  );
}

function NotEnough({ text }: { text: string }) {
  return (
    <div className="flex h-56 flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
      <BarChart3 className="size-5" aria-hidden="true" />
      {text}
    </div>
  );
}

export function WeightChart() {
  const { data } = useStore();
  const [days, setDays] = useState(90);
  const series = weightSeries(data.measurements, days);
  return (
    <Panel>
      <SectionTitle action={<PeriodFilter value={days} onChange={setDays} options={DAY_OPTIONS} />}>Evolução do peso</SectionTitle>
      {series.length < 2 ? (
        <NotEnough text="Dados insuficientes neste período. Registre ao menos duas medições de peso." />
      ) : (
        <div className="h-56" role="img" aria-label={`Gráfico de peso com ${series.length} registros`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={formatShortDate} {...axis} />
              <YAxis domain={["dataMin - 2", "dataMax + 1"]} tickFormatter={(v) => formatNumber(v, 0)} {...axis} />
              <Tooltip
                cursor={{ fill: "var(--color-elevated)" }}
                content={({ active, payload }) =>
                  active && payload?.[0] ? (
                    <TooltipBox title={formatDate(payload[0].payload.date)} lines={[formatKg(payload[0].payload.weight)]} />
                  ) : null
                }
              />
              <Bar dataKey="weight" radius={[6, 6, 0, 0]} maxBarSize={36}>
                {series.map((s, i) => (
                  <Cell key={s.date} fill={i === series.length - 1 ? "var(--color-chart-1)" : "var(--color-chart-2)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Panel>
  );
}

export function CaloriesChart() {
  const { data } = useStore();
  const [days, setDays] = useState(30);
  const series = caloriesSeries(data.workouts, days);
  return (
    <Panel>
      <SectionTitle action={<PeriodFilter value={days} onChange={setDays} options={DAY_OPTIONS} />}>Gasto calórico</SectionTitle>
      {series.length < 2 ? (
        <NotEnough text="Registre treinos concluídos com calorias estimadas para ver o gráfico." />
      ) : (
        <div className="h-56" role="img" aria-label={`Gráfico de calorias com ${series.length} treinos`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={formatShortDate} {...axis} />
              <YAxis {...axis} />
              <Tooltip
                cursor={{ stroke: "var(--color-border)" }}
                content={({ active, payload }) =>
                  active && payload?.[0] ? (
                    <TooltipBox
                      title={payload[0].payload.name}
                      lines={[formatDate(payload[0].payload.date), `${payload[0].payload.calories} kcal (estimado)`]}
                    />
                  ) : null
                }
              />
              <Line type="monotone" dataKey="calories" stroke="var(--color-chart-1)" strokeWidth={2} dot={{ r: 3, fill: "var(--color-chart-1)" }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      <p className="mt-2 text-xs text-muted-foreground">Valores calóricos são estimativas fictícias neste protótipo.</p>
    </Panel>
  );
}
