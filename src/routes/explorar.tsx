import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Clock, Compass, Flame, ListOrdered } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useStore } from "@/lib/store";
import { SUGGESTIONS, exerciseById } from "@/data/mock";
import { DIFFICULTY_LABEL, groupLabel, type Difficulty, type SuggestedWorkout, type SuggestionCategory } from "@/lib/types";
import { todayISO, uid } from "@/lib/format";
import { Button, Chip, EmptyState, PageHeader, SearchInput, Tag } from "@/components/common";

export const Route = createFileRoute("/explorar")({
  head: () => ({
    meta: [
      { title: "Explorar treinos — Coach Osmar" },
      { name: "description", content: "Sugestões de treinos por categoria e nível de dificuldade." },
      { property: "og:title", content: "Explorar treinos — Coach Osmar" },
      { property: "og:description", content: "Sugestões de treinos por categoria e nível." },
    ],
  }),
  component: Explorar,
});

const CATEGORIES: SuggestionCategory[] = ["Força", "Hipertrofia", "Resistência", "Mobilidade", "Cardio", "Corpo inteiro"];

function Explorar() {
  const { addWorkout, openForm } = useStore();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<SuggestionCategory | null>(null);
  const [diff, setDiff] = useState<Difficulty | null>(null);
  const [open, setOpen] = useState<SuggestedWorkout | null>(null);

  const list = SUGGESTIONS.filter(
    (s) =>
      (!cat || s.category === cat) &&
      (!diff || s.difficulty === diff) &&
      (s.name + s.description).toLowerCase().includes(q.trim().toLowerCase()),
  );
  const clear = () => { setQ(""); setCat(null); setDiff(null); };

  function addPlanned(s: SuggestedWorkout) {
    const created = addWorkout({
      name: s.name.replace(/^Treino (de )?/i, "").replace(/^./, (c) => c.toUpperCase()),
      date: todayISO(),
      durationMinutes: s.durationMinutes,
      muscleGroups: s.muscleGroups,
      status: "planejado",
      exercises: s.exercises.map((e) => ({ id: uid("we"), exerciseId: e.exerciseId, name: exerciseById(e.exerciseId)?.name ?? "", sets: e.sets, reps: e.reps })),
    });
    setOpen(null);
    toast.success("Treino adicionado como planejado.", {
      action: { label: "Editar", onClick: () => openForm({ kind: "workout", initial: created }) },
    });
  }

  return (
    <div className="space-y-5 page-enter">
      <PageHeader title="Explorar" description="Sugestões de treinos para inspirar sua próxima sessão." />
      <SearchInput value={q} onChange={setQ} placeholder="Buscar treinos sugeridos…" label="Buscar treinos sugeridos" />
      <div className="space-y-2">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <Chip active={!cat} onClick={() => setCat(null)}>Todas</Chip>
          {CATEGORIES.map((c) => <Chip key={c} active={cat === c} onClick={() => setCat(cat === c ? null : c)}>{c}</Chip>)}
        </div>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(DIFFICULTY_LABEL) as Difficulty[]).map((d) => (
            <Chip key={d} active={diff === d} onClick={() => setDiff(diff === d ? null : d)}>{DIFFICULTY_LABEL[d]}</Chip>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState icon={Compass} title="Nenhum treino encontrado" description="Tente outra busca ou limpe os filtros." action={<Button variant="outline" onClick={clear}>Limpar filtros</Button>} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => (
            <article key={s.id} className="flex flex-col rounded-xl border bg-card p-4 shadow-card transition-colors duration-200 hover:border-primary/50">
              <div className="flex items-center justify-between gap-2">
                <Tag>{s.category}</Tag>
                <span className="text-xs text-muted-foreground">{DIFFICULTY_LABEL[s.difficulty]}</span>
              </div>
              <h2 className="mt-3 font-semibold">{s.name}</h2>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{s.description}</p>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Clock className="size-3.5" aria-hidden="true" />{s.durationMinutes} min</span>
                <span className="inline-flex items-center gap-1"><ListOrdered className="size-3.5" aria-hidden="true" />{s.exercises.length} exercícios</span>
                <span>{s.muscleGroups.map(groupLabel).join(", ")}</span>
              </div>
              <Button variant="outline" className="mt-4" onClick={() => setOpen(s)}>Ver treino</Button>
            </article>
          ))}
        </div>
      )}

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle>{open.name}</DialogTitle>
                <DialogDescription>{open.description}</DialogDescription>
              </DialogHeader>
              <div className="flex flex-wrap gap-2 text-xs">
                <Tag>{open.category}</Tag>
                <Tag>{DIFFICULTY_LABEL[open.difficulty]}</Tag>
                <Tag>{open.durationMinutes} min</Tag>
                <Tag><Flame className="mr-1 size-3" aria-hidden="true" />~{open.estimatedCalories} kcal (estimado)</Tag>
              </div>
              <ol className="divide-y rounded-lg border">
                {open.exercises.map((e, i) => {
                  const ex = exerciseById(e.exerciseId);
                  return (
                    <li key={e.exerciseId} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                      <button type="button" className="text-left hover:text-primary" onClick={() => { setOpen(null); navigate({ to: "/exercicios", search: { ex: e.exerciseId } }); }}>
                        {i + 1}. {ex?.name}
                      </button>
                      <span className="tabular text-muted-foreground">{e.sets}× {ex?.suggestedReps ?? e.reps}</span>
                    </li>
                  );
                })}
              </ol>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(null)}>Fechar</Button>
                <Button onClick={() => addPlanned(open)}>Adicionar aos meus treinos</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
