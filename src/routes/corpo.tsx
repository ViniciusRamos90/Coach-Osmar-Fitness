import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock, Info, Pencil, Plus, Ruler, Scale, Target, Trash2, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { currentWeight, latestWeightRecord, sortedMeasurements } from "@/lib/calc";
import { formatDate, formatHeight, formatKg, formatNumber } from "@/lib/format";
import { MEASUREMENT_FIELDS, type BodyMeasurement } from "@/lib/types";
import { Button, ConfirmDialog, EmptyState, MetricCard, PageHeader, Panel, SectionTitle } from "@/components/common";
import { WeightChart } from "@/components/charts";

export const Route = createFileRoute("/corpo")({
  head: () => ({
    meta: [
      { title: "Minha evolução — Coach Osmar" },
      { name: "description", content: "Histórico de peso e medidas corporais com gráfico de evolução." },
      { property: "og:title", content: "Minha evolução — Coach Osmar" },
      { property: "og:description", content: "Histórico de peso e medidas corporais." },
    ],
  }),
  component: Corpo,
});

const BODY_FIELDS = MEASUREMENT_FIELDS.filter((f) => f.key !== "weightKg");

function Corpo() {
  const { data, openForm, deleteMeasurement } = useStore();
  const { profile, measurements } = data;
  const sorted = sortedMeasurements(measurements);
  const weight = currentWeight(profile, measurements);
  const lastW = latestWeightRecord(measurements);
  const diff = weight - profile.initialWeightKg;
  const [deleting, setDeleting] = useState<BodyMeasurement | null>(null);

  // latest and previous value for each body measure
  const latestOf = (k: keyof BodyMeasurement) => {
    const vals = sorted.filter((m) => m[k] != null);
    return { cur: vals[0]?.[k] as number | undefined, prev: vals[1]?.[k] as number | undefined, date: vals[0]?.date };
  };

  const weightCount = measurements.filter((m) => m.weightKg != null).length;
  const message =
    measurements.length === 0
      ? "Você ainda não cadastrou medidas. Registre a primeira para iniciar seu acompanhamento."
      : weightCount < 2
        ? "Ainda não há medições suficientes para comparar. Registre outra medição de peso mais adiante."
        : `Desde o início, seu peso variou ${diff > 0 ? "+" : ""}${formatNumber(diff)} kg. Analise junto com medidas e objetivo — variação de peso sozinha não indica melhora ou piora.`;

  return (
    <div className="space-y-6 page-enter">
      <PageHeader title="Minha evolução" description="Peso e medidas corporais ao longo do tempo." action={<Button onClick={() => openForm({ kind: "measurement" })}><Plus className="size-4" /> Registrar medidas</Button>} />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <MetricCard label="Peso inicial" value={formatKg(profile.initialWeightKg)} icon={Scale} />
        <MetricCard label="Peso atual" value={formatKg(weight)} icon={Scale} accent />
        <MetricCard label="Diferença" value={`${diff > 0 ? "+" : ""}${formatNumber(diff)} kg`} icon={TrendingDown} hint="Desde o início" />
        <MetricCard label="Altura" value={formatHeight(profile.heightCm)} icon={Ruler} hint="Editável no perfil" />
        <MetricCard label="Última atualização" value={sorted[0] ? formatDate(sorted[0].date) : "—"} icon={CalendarClock} />
        <MetricCard label="Objetivo" value={<span className="text-sm font-medium leading-snug">{profile.goal}</span>} icon={Target} />
      </div>

      <div className="flex gap-3 rounded-xl border bg-surface p-4 text-sm">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        <p>{message}</p>
      </div>

      <WeightChart />

      <Panel>
        <SectionTitle>Medidas corporais</SectionTitle>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {BODY_FIELDS.map((f) => {
            const { cur, prev, date } = latestOf(f.key);
            const d = cur != null && prev != null ? cur - prev : null;
            return (
              <div key={f.key} className="rounded-lg bg-surface p-3">
                <div className="text-xs text-muted-foreground">{f.label}</div>
                <div className="mt-1 text-lg font-semibold tabular">{cur != null ? `${formatNumber(cur)} ${f.unit}` : "—"}</div>
                <div className="text-xs text-muted-foreground">
                  {d != null ? `${d > 0 ? "+" : ""}${formatNumber(d)} ${f.unit} vs. anterior` : date ? formatDate(date) : "Sem registro"}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <div>
        <SectionTitle>Histórico de medições</SectionTitle>
        {sorted.length === 0 ? (
          <EmptyState icon={Ruler} title="Nenhuma medida cadastrada" description="Registre peso e medidas para acompanhar sua evolução." action={<Button onClick={() => openForm({ kind: "measurement" })}>Registrar medidas</Button>} />
        ) : (
          <ul className="space-y-2">
            {sorted.map((m) => (
              <li key={m.id} className="rounded-xl border bg-card p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium tabular">{formatDate(m.date)}{m.id === lastW?.id && <span className="ml-2 text-xs text-primary">● mais recente</span>}</div>
                  <div className="flex">
                    <Button variant="ghost" size="icon" aria-label={`Editar medição de ${formatDate(m.date)}`} onClick={() => openForm({ kind: "measurement", initial: m })}><Pencil className="size-4" /></Button>
                    <Button variant="ghost" size="icon" aria-label={`Excluir medição de ${formatDate(m.date)}`} className="text-destructive hover:text-destructive" onClick={() => setDeleting(m)}><Trash2 className="size-4" /></Button>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {MEASUREMENT_FIELDS.filter((f) => m[f.key] != null).map((f) => (
                    <span key={f.key}>{f.label}: <span className="text-foreground tabular">{formatNumber(m[f.key] as number)} {f.unit}</span></span>
                  ))}
                </div>
                {m.notes && <p className="mt-1 text-xs text-muted-foreground">{m.notes}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Excluir medição?"
        description={deleting ? `O registro de ${formatDate(deleting.date)} será removido.` : ""}
        onConfirm={() => { if (deleting) { deleteMeasurement(deleting.id); toast.success("Medição excluída."); } setDeleting(null); }}
      />
    </div>
  );
}
