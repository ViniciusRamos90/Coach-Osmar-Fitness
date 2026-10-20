import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Dumbbell, Library, Plus } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useStore } from "@/lib/store";
import { EXERCISES, exerciseById } from "@/data/mock";
import { DIFFICULTY_LABEL, MUSCLE_GROUPS, groupLabel, type Exercise } from "@/lib/types";
import { formatDate, todayISO, uid } from "@/lib/format";
import { Button, EmptyState, PageHeader, SearchInput, StatusBadge, Tag } from "@/components/common";
import { NativeSelect } from "@/components/forms";

export const Route = createFileRoute("/exercicios")({
  validateSearch: (s: Record<string, unknown>): { ex?: string } => (typeof s.ex === "string" ? { ex: s.ex } : {}),
  head: () => ({
    meta: [
      { title: "Catálogo de exercícios — Coach Osmar" },
      { name: "description", content: "Consulte exercícios por grupo muscular, equipamento e dificuldade." },
      { property: "og:title", content: "Catálogo de exercícios — Coach Osmar" },
      { property: "og:description", content: "Exercícios por grupo muscular, equipamento e dificuldade." },
    ],
  }),
  component: Exercicios,
});

const EQUIPMENT = [...new Set(EXERCISES.map((e) => e.equipment))].sort();
const TYPES = [...new Set(EXERCISES.map((e) => e.type))];

function Exercicios() {
  const { ex } = Route.useSearch();
  const navigate = useNavigate({ from: "/exercicios" });
  const { data, updateWorkout, openForm } = useStore();
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("all");
  const [equip, setEquip] = useState("all");
  const [diff, setDiff] = useState("all");
  const [type, setType] = useState("all");
  const [picker, setPicker] = useState<Exercise | null>(null);
  const selected = exerciseById(ex) ?? null;
  const setSelected = (e: Exercise | null) => navigate({ search: e ? { ex: e.id } : {}, replace: true });

  const list = EXERCISES.filter(
    (e) =>
      e.name.toLowerCase().includes(q.trim().toLowerCase()) &&
      (group === "all" || e.primaryMuscleGroup === group || e.secondaryMuscleGroups.includes(group as Exercise["primaryMuscleGroup"])) &&
      (equip === "all" || e.equipment === equip) &&
      (diff === "all" || e.difficulty === diff) &&
      (type === "all" || e.type === type),
  );
  const clear = () => { setQ(""); setGroup("all"); setEquip("all"); setDiff("all"); setType("all"); };
  const active = q || group !== "all" || equip !== "all" || diff !== "all" || type !== "all";

  const editable = [...data.workouts].filter((w) => w.status !== "nao_realizado").sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 8);
  const toRow = (e: Exercise) => ({ id: uid("we"), exerciseId: e.id, name: e.name, sets: e.suggestedSets ?? 3, reps: parseInt(e.suggestedReps ?? "10") || 10 });

  return (
    <div className="space-y-5 page-enter">
      <PageHeader title="Exercícios" description={`${EXERCISES.length} exercícios no catálogo local.`} />
      <SearchInput value={q} onChange={setQ} placeholder="Buscar exercício por nome…" label="Buscar exercício" />
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <NativeSelect aria-label="Grupo muscular" value={group} onChange={(e) => setGroup(e.target.value)}>
          <option value="all">Todos os grupos</option>
          {MUSCLE_GROUPS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
        </NativeSelect>
        <NativeSelect aria-label="Equipamento" value={equip} onChange={(e) => setEquip(e.target.value)}>
          <option value="all">Todo equipamento</option>
          {EQUIPMENT.map((x) => <option key={x}>{x}</option>)}
        </NativeSelect>
        <NativeSelect aria-label="Dificuldade" value={diff} onChange={(e) => setDiff(e.target.value)}>
          <option value="all">Toda dificuldade</option>
          {Object.entries(DIFFICULTY_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </NativeSelect>
        <NativeSelect aria-label="Tipo de exercício" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="all">Todos os tipos</option>
          {TYPES.map((x) => <option key={x}>{x}</option>)}
        </NativeSelect>
      </div>
      {active && <Button variant="link" size="sm" className="h-auto p-0" onClick={clear}>Limpar filtros ({list.length} resultados)</Button>}

      {list.length === 0 ? (
        <EmptyState icon={Library} title="Nenhum exercício encontrado" description="Tente outro nome ou limpe os filtros." action={<Button variant="outline" onClick={clear}>Limpar filtros</Button>} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((e) => (
            <button key={e.id} type="button" onClick={() => setSelected(e)} className="flex items-start gap-3 rounded-xl border bg-card p-4 text-left shadow-card transition-colors duration-200 hover:border-primary/50">
              <span className="rounded-lg bg-elevated p-2"><Dumbbell className="size-5 text-primary" aria-hidden="true" /></span>
              <span className="min-w-0">
                <span className="block font-medium">{e.name}</span>
                <span className="mt-1 flex flex-wrap gap-1">
                  <Tag>{groupLabel(e.primaryMuscleGroup)}</Tag>
                  <Tag>{e.equipment}</Tag>
                  <Tag>{DIFFICULTY_LABEL[e.difficulty]}</Tag>
                </span>
              </span>
            </button>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.name}</DialogTitle>
                <DialogDescription>{selected.type} · {selected.equipment} · {DIFFICULTY_LABEL[selected.difficulty]}</DialogDescription>
              </DialogHeader>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-surface p-3"><dt className="text-xs text-muted-foreground">Grupo principal</dt><dd className="font-medium">{groupLabel(selected.primaryMuscleGroup)}</dd></div>
                <div className="rounded-lg bg-surface p-3"><dt className="text-xs text-muted-foreground">Secundários</dt><dd className="font-medium">{selected.secondaryMuscleGroups.map(groupLabel).join(", ") || "—"}</dd></div>
                <div className="col-span-2 rounded-lg bg-surface p-3"><dt className="text-xs text-muted-foreground">Sugestão</dt><dd className="font-medium">{selected.suggestedSets} séries · {selected.suggestedReps}</dd></div>
              </dl>
              <div>
                <h3 className="mb-1 text-sm font-medium">Como executar</h3>
                <p className="text-sm text-muted-foreground">{selected.instructions}</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelected(null)}>Fechar</Button>
                <Button onClick={() => { setPicker(selected); setSelected(null); }}><Plus className="size-4" /> Adicionar ao treino</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!picker} onOpenChange={(o) => !o && setPicker(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-md">
          {picker && (
            <>
              <DialogHeader>
                <DialogTitle>Adicionar “{picker.name}”</DialogTitle>
                <DialogDescription>Escolha um treino existente ou inicie um novo registro.</DialogDescription>
              </DialogHeader>
              <Button onClick={() => { openForm({ kind: "workout", initial: { name: "", date: todayISO(), status: "concluido", muscleGroups: [picker.primaryMuscleGroup], exercises: [toRow(picker)] } }); setPicker(null); }}>
                <Plus className="size-4" /> Novo treino com este exercício
              </Button>
              <ul className="divide-y rounded-lg border">
                {editable.map((w) => (
                  <li key={w.id}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-elevated"
                      onClick={() => {
                        updateWorkout({ ...w, exercises: [...w.exercises, toRow(picker)] });
                        toast.success(`Exercício adicionado a "${w.name}".`);
                        setPicker(null);
                      }}
                    >
                      <span>
                        <span className="block font-medium">{w.name}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(w.date)}</span>
                      </span>
                      <StatusBadge status={w.status} />
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
