import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LoadingState, PageHeader, Tag } from "@/components/common";
import { ExerciseBrowser } from "@/components/exercise-catalog";
import { useExerciseHistory, useExercises } from "@/lib/local/db";
import { EQUIPMENT_LABEL, MUSCLE_LABEL } from "@/lib/local/models";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/exercicios")({
  validateSearch: (s: Record<string, unknown>) => ({ ex: typeof s.ex === "string" ? s.ex : undefined }),
  head: () => ({
    meta: [
      { title: "Exercícios — Coach Osmar" },
      { name: "description", content: "Catálogo de exercícios com busca, filtros por músculo e equipamento, favoritos e instruções." },
      { property: "og:title", content: "Exercícios — Coach Osmar" },
      { property: "og:description", content: "Catálogo de exercícios com filtros, favoritos e instruções." },
    ],
  }),
  component: ExercisesPage,
});

function ExercisesPage() {
  const exercises = useExercises();
  const { ex } = Route.useSearch();
  const navigate = useNavigate({ from: "/exercicios" });
  const selected = exercises?.find((e) => e.id === ex) ?? null;
  const history = useExerciseHistory(selected?.id ?? null);

  if (!exercises) return <LoadingState />;
  return (
    <div className="space-y-4">
      <PageHeader title="Exercícios" description="Catálogo salvo neste dispositivo — funciona sem internet." />
      <ExerciseBrowser exercises={exercises} onSelect={(e) => navigate({ search: { ex: e.id } })} />
      <Dialog open={!!selected} onOpenChange={(o) => !o && navigate({ search: { ex: undefined } })}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.name}</DialogTitle>
                <DialogDescription>{EQUIPMENT_LABEL[selected.equipment]}</DialogDescription>
              </DialogHeader>
              <div className="flex flex-wrap gap-1.5">{selected.muscleGroups.map((m) => <Tag key={m}>{MUSCLE_LABEL[m]}</Tag>)}</div>
              <section>
                <h3 className="mb-2 text-sm font-semibold">Como fazer</h3>
                <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">{selected.instructions.map((s) => <li key={s}>{s}</li>)}</ol>
              </section>
              <p className="flex gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm"><AlertTriangle className="size-4 shrink-0" aria-hidden="true" /><span><strong>Cautela:</strong> {selected.caution}</span></p>
              <section>
                <h3 className="mb-2 text-sm font-semibold">Seus últimos registros</h3>
                {history && history.length > 0 ? (
                  <ul className="space-y-1 text-sm">{history.map((h) => <li key={h.id}>{formatDate(h.date.slice(0, 10))} — {h.reps} reps × {h.load} {h.loadUnit}</li>)}</ul>
                ) : <p className="text-sm text-muted-foreground">Você ainda não registrou séries deste exercício.</p>}
              </section>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
