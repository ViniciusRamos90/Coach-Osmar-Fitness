import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Dumbbell, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { inPeriod } from "@/lib/calc";
import { formatDate } from "@/lib/format";
import { MUSCLE_GROUPS, STATUS_LABEL, groupLabel, type Workout } from "@/lib/types";
import { Button, ConfirmDialog, EmptyState, PageHeader, SearchInput, StatusBadge, Tag } from "@/components/common";
import { NativeSelect } from "@/components/forms";
import { WorkoutCard, WorkoutDetails } from "@/components/workouts";

export const Route = createFileRoute("/atividades")({
  head: () => ({
    meta: [
      { title: "Atividades — Coach Osmar" },
      { name: "description", content: "Histórico completo dos seus treinos com filtros por período, grupo e status." },
      { property: "og:title", content: "Atividades — Coach Osmar" },
      { property: "og:description", content: "Histórico completo dos seus treinos." },
    ],
  }),
  component: Atividades,
});

const PERIODS = [
  { v: "all", l: "Todo o período" },
  { v: "7", l: "Últimos 7 dias" },
  { v: "30", l: "Últimos 30 dias" },
  { v: "90", l: "Últimos 90 dias" },
];
const toDays = (p: string) => (p === "all" ? null : Number(p));

function Atividades() {
  const { openForm } = useStore();
  return (
    <div className="page-enter">
      <PageHeader
        title="Atividades"
        description="Histórico dos seus treinos."
        action={<Button onClick={() => openForm({ kind: "workout" })}><Plus className="size-4" /> Novo treino</Button>}
      />
      <WorkoutsTab />
    </div>
  );
}

function WorkoutsTab() {
  const { data, openForm, deleteWorkout } = useStore();
  const [period, setPeriod] = useState("all");
  const [group, setGroup] = useState("all");
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("date-desc");
  const [viewing, setViewing] = useState<Workout | null>(null);
  const [deleting, setDeleting] = useState<Workout | null>(null);

  const list = useMemo(() => {
    const r = data.workouts.filter(
      (w) =>
        inPeriod(w.date, toDays(period)) &&
        (group === "all" || w.muscleGroups.includes(group as Workout["muscleGroups"][number])) &&
        (status === "all" || w.status === status) &&
        w.name.toLowerCase().includes(q.trim().toLowerCase()),
    );
    const [k, dir] = sort.split("-");
    const m = dir === "asc" ? 1 : -1;
    return r.sort((a, b) => (k === "date" ? (a.date < b.date ? -1 : a.date > b.date ? 1 : 0) : a.durationMinutes - b.durationMinutes) * m);
  }, [data.workouts, period, group, status, q, sort]);

  const filtered = period !== "all" || group !== "all" || status !== "all" || q !== "";
  const clear = () => { setPeriod("all"); setGroup("all"); setStatus("all"); setQ(""); };

  return (
    <div className="space-y-4">
      <div className="grid gap-2 md:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
        <SearchInput value={q} onChange={setQ} placeholder="Buscar treino…" label="Buscar por nome do treino" />
        <NativeSelect aria-label="Período" value={period} onChange={(e) => setPeriod(e.target.value)}>
          {PERIODS.map((p) => <option key={p.v} value={p.v}>{p.l}</option>)}
        </NativeSelect>
        <NativeSelect aria-label="Grupo muscular" value={group} onChange={(e) => setGroup(e.target.value)}>
          <option value="all">Todos os grupos</option>
          {MUSCLE_GROUPS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
        </NativeSelect>
        <NativeSelect aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">Todos os status</option>
          {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </NativeSelect>
        <NativeSelect aria-label="Ordenar" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="date-desc">Mais recentes</option>
          <option value="date-asc">Mais antigos</option>
          <option value="duration-desc">Maior duração</option>
          <option value="duration-asc">Menor duração</option>
        </NativeSelect>
      </div>
      {filtered && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{list.length} resultado(s) com filtros ativos</span>
          <Button variant="link" size="sm" className="h-auto p-0" onClick={clear}>Limpar filtros</Button>
        </div>
      )}

      {list.length === 0 ? (
        data.workouts.length === 0 ? (
          <EmptyState icon={Dumbbell} title="Nenhum treino registrado" description="Registre sua primeira sessão para começar o histórico." action={<Button onClick={() => openForm({ kind: "workout" })}>Novo treino</Button>} />
        ) : (
          <EmptyState icon={Dumbbell} title="Nenhum resultado para os filtros" description="Ajuste ou limpe os filtros para ver mais treinos." action={<Button variant="outline" onClick={clear}>Limpar filtros</Button>} />
        )
      ) : (
        <>
          <div className="grid gap-3 md:hidden">
            {list.map((w) => (
              <WorkoutCard key={w.id} workout={w} onView={() => setViewing(w)} onEdit={() => openForm({ kind: "workout", initial: w })} onDelete={() => setDeleting(w)} />
            ))}
          </div>
          <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
            <table className="w-full text-sm">
              <thead className="bg-surface text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 font-medium">Treino</th>
                  <th className="px-4 py-3 font-medium">Grupo</th>
                  <th className="px-4 py-3 font-medium">Duração</th>
                  <th className="px-4 py-3 font-medium">Calorias</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {list.map((w) => (
                  <tr key={w.id} className="transition-colors hover:bg-elevated/50">
                    <td className="px-4 py-3 tabular">{formatDate(w.date)}</td>
                    <td className="px-4 py-3 font-medium">{w.name}</td>
                    <td className="px-4 py-3"><div className="flex flex-wrap gap-1">{w.muscleGroups.map((g) => <Tag key={g}>{groupLabel(g)}</Tag>)}</div></td>
                    <td className="px-4 py-3 tabular">{w.durationMinutes} min</td>
                    <td className="px-4 py-3 tabular">{w.estimatedCalories != null ? `${w.estimatedCalories} kcal` : "—"}</td>
                    <td className="px-4 py-3"><StatusBadge status={w.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" aria-label={`Ver detalhes de ${w.name}`} onClick={() => setViewing(w)}><Eye className="size-4" /></Button>
                        <Button variant="ghost" size="icon" aria-label={`Editar ${w.name}`} onClick={() => openForm({ kind: "workout", initial: w })}><Pencil className="size-4" /></Button>
                        <Button variant="ghost" size="icon" aria-label={`Excluir ${w.name}`} className="text-destructive hover:text-destructive" onClick={() => setDeleting(w)}><Trash2 className="size-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <WorkoutDetails workout={viewing} onClose={() => setViewing(null)} onEdit={(w) => { setViewing(null); openForm({ kind: "workout", initial: w }); }} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Excluir treino?"
        description={deleting ? `"${deleting.name}" de ${formatDate(deleting.date)} será removido.` : ""}
        onConfirm={() => { if (deleting) { deleteWorkout(deleting.id); toast.success("Treino excluído."); } setDeleting(null); }}
      />
    </div>
  );
}
