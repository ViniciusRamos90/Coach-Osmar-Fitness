import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { startSession } from "@/lib/local/session";
import { localDB, sessionRepo } from "@/lib/local/db";
import { Archive, ArrowDown, ArrowUp, Copy, ListPlus, Pencil, Play, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button, ConfirmDialog, EmptyState, LoadingState, PageHeader, Panel, Tag } from "@/components/common";
import { ExerciseBrowser } from "@/components/exercise-catalog";
import { routineRepo, useExercises, useRoutines } from "@/lib/local/db";
import { newId, type Routine, type RoutineExercise } from "@/lib/local/models";
import { STATUS_LABEL, STATUS_ORDER, createRoutine, duplicateRoutine, exerciseCount, makeRoutineExercise, moveItem, reorderExercises, sortRoutines, validateRoutine } from "@/lib/local/routines";

export const Route = createFileRoute("/rotinas")({
  head: () => ({
    meta: [
      { title: "Rotinas — Coach Osmar" },
      { name: "description", content: "Crie, edite, duplique e organize suas rotinas de treino, salvas no seu aparelho." },
      { property: "og:title", content: "Rotinas — Coach Osmar" },
      { property: "og:description", content: "Monte e organize suas rotinas de treino." },
    ],
  }),
  component: RoutinesPage,
});

function RoutinesPage() {
  const routines = useRoutines();
  const [editing, setEditing] = useState<Routine | null>(null);
  const [toDelete, setToDelete] = useState<Routine | null>(null);
  if (!routines) return <LoadingState />;
  const sorted = sortRoutines(routines);
  const nextOrder = routines.length;

  const move = (r: Routine, dir: -1 | 1) => {
    const group = sorted.filter((x) => x.status === r.status);
    const i = group.findIndex((x) => x.id === r.id);
    const next = moveItem(group, i, i + dir).map((x, idx) => ({ ...x, order: idx }));
    void routineRepo.saveMany(next);
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Rotinas" description="Salvas somente neste dispositivo." action={<Button onClick={() => setEditing(createRoutine("", nextOrder))}><Plus className="size-4" /> Nova rotina</Button>} />
      {routines.length === 0 ? (
        <EmptyState icon={ListPlus} title="Nenhuma rotina ainda" description="Crie uma rotina do zero e adicione exercícios do catálogo." action={<Button onClick={() => setEditing(createRoutine("", 0))}>Criar rotina</Button>} />
      ) : STATUS_ORDER.map((status) => {
        const group = sorted.filter((r) => r.status === status);
        if (!group.length) return null;
        return (
          <section key={status} className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground">{STATUS_LABEL[status]} ({group.length})</h2>
            {group.map((r, i) => (
              <Panel key={r.id} className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">{r.name}</h3>
                    <p className="text-xs text-muted-foreground">{r.sessions.length} sessão(ões) · {exerciseCount(r)} exercício(s)</p>
                  </div>
                  <div className="flex">
                    <Button variant="ghost" size="icon" className="size-12" disabled={i === 0} onClick={() => move(r, -1)} aria-label={`Subir ${r.name}`}><ArrowUp className="size-4" /></Button>
                    <Button variant="ghost" size="icon" className="size-12" disabled={i === group.length - 1} onClick={() => move(r, 1)} aria-label={`Descer ${r.name}`}><ArrowDown className="size-4" /></Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="min-h-11" onClick={async () => { if (await localDB().sessions.where("status").equals("in_progress").count()) { toast.info("Já há um treino em andamento."); void navigate({ to: "/treino" }); return; } const i = r.sessions.findIndex((s) => s.exercises.length); if (await sessionRepo.save(startSession(r, i))) void navigate({ to: "/treino" }); }} disabled={exerciseCount(r) === 0}><Play className="size-4" /> Iniciar</Button>
                  <Button size="sm" variant="outline" className="min-h-11" onClick={() => setEditing(structuredClone(r))}><Pencil className="size-4" /> Editar</Button>
                  <Button size="sm" variant="outline" className="min-h-11" onClick={() => void routineRepo.save(duplicateRoutine(r, nextOrder), "Rotina duplicada")}><Copy className="size-4" /> Duplicar</Button>
                  {r.status !== "active" && <Button size="sm" variant="outline" className="min-h-11" onClick={() => void routineRepo.save({ ...r, status: "active" }, "Rotina ativada")}>Ativar</Button>}
                  {r.status !== "archived" && <Button size="sm" variant="outline" className="min-h-11" onClick={() => void routineRepo.save({ ...r, status: "archived" }, "Rotina arquivada")}><Archive className="size-4" /> Arquivar</Button>}
                  <Button size="sm" variant="ghost" className="min-h-11 text-destructive" onClick={() => setToDelete(r)}><Trash2 className="size-4" /> Excluir</Button>
                </div>
              </Panel>
            ))}
          </section>
        );
      })}
      {editing && <RoutineEditor initial={editing} onClose={() => setEditing(null)} />}
      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Excluir rotina?"
        description={`"${toDelete?.name ?? ""}" e suas sessões serão apagadas deste dispositivo. Seu histórico de treinos não é afetado.`}
        confirmLabel="Excluir"
        onConfirm={() => { if (toDelete) void routineRepo.remove(toDelete.id); setToDelete(null); }}
      />
    </div>
  );
}

function RoutineEditor({ initial, onClose }: { initial: Routine; onClose: () => void }) {
  const exercises = useExercises() ?? [];
  const [r, setR] = useState<Routine>(initial);
  const [sIdx, setSIdx] = useState(0);
  const [picking, setPicking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const session = r.sessions[sIdx] ?? r.sessions[0]!;
  const name = (id: string) => exercises.find((e) => e.id === id)?.name ?? "Exercício";

  const setSession = (fn: (s: typeof session) => typeof session) =>
    setR((cur) => ({ ...cur, sessions: cur.sessions.map((s, i) => (i === sIdx ? fn(s) : s)) }));
  const setEx = (id: string, patch: Partial<RoutineExercise>) =>
    setSession((s) => ({ ...s, exercises: s.exercises.map((e) => (e.id === id ? { ...e, ...patch } : e)) }));

  const save = async () => {
    const err = validateRoutine(r);
    setError(err);
    if (err) return;
    if (await routineRepo.save({ ...r, name: r.name.trim() })) onClose();
  };

  const num = (v: string) => (v === "" ? 0 : Math.round(Number(v)));

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial.name ? "Editar rotina" : "Nova rotina"}</DialogTitle>
          <DialogDescription>Defina sessões, exercícios, séries, repetições e descanso.</DialogDescription>
        </DialogHeader>
        {picking ? (
          <div className="space-y-3">
            <Button variant="ghost" onClick={() => setPicking(false)}><X className="size-4" /> Voltar ao editor</Button>
            <ExerciseBrowser exercises={exercises} actionLabel="Adicionar" onSelect={(e) => {
              setSession((s) => ({ ...s, exercises: [...s.exercises, makeRoutineExercise(e.id, s.exercises.length)] }));
              toast.success(`${e.name} adicionado`);
            }} />
          </div>
        ) : (
          <div className="space-y-4">
            <label className="block space-y-1 text-sm font-medium">Nome da rotina
              <Input value={r.name} onChange={(e) => setR({ ...r, name: e.target.value })} placeholder="Ex.: Superior / Inferior" className="h-12" />
            </label>
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Sessões">
              {r.sessions.map((s, i) => (
                <Button key={s.id} role="tab" aria-selected={i === sIdx} variant={i === sIdx ? "default" : "outline"} size="sm" className="min-h-11" onClick={() => setSIdx(i)}>{s.name || `Sessão ${i + 1}`}</Button>
              ))}
              <Button variant="ghost" size="sm" className="min-h-11" onClick={() => { setR({ ...r, sessions: [...r.sessions, { id: newId(), name: `Sessão ${String.fromCharCode(65 + r.sessions.length)}`, exercises: [] }] }); setSIdx(r.sessions.length); }}><Plus className="size-4" /> Sessão</Button>
            </div>
            <div className="flex gap-2">
              <Input aria-label="Nome da sessão" value={session.name} onChange={(e) => setSession((s) => ({ ...s, name: e.target.value }))} className="h-12" />
              {r.sessions.length > 1 && <Button variant="ghost" className="h-12 text-destructive" aria-label="Remover sessão" onClick={() => { setR({ ...r, sessions: r.sessions.filter((_, i) => i !== sIdx) }); setSIdx(0); }}><Trash2 className="size-4" /></Button>}
            </div>
            {session.exercises.length === 0 && <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">Nenhum exercício nesta sessão.</p>}
            <ul className="space-y-2">
              {session.exercises.map((e, i) => (
                <li key={e.id} className="space-y-2 rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium"><Tag>{i + 1}</Tag> {name(e.exerciseId)}</span>
                    <div className="flex">
                      <Button variant="ghost" size="icon" className="size-11" disabled={i === 0} aria-label="Mover para cima" onClick={() => setSession((s) => reorderExercises(s, i, i - 1))}><ArrowUp className="size-4" /></Button>
                      <Button variant="ghost" size="icon" className="size-11" disabled={i === session.exercises.length - 1} aria-label="Mover para baixo" onClick={() => setSession((s) => reorderExercises(s, i, i + 1))}><ArrowDown className="size-4" /></Button>
                      <Button variant="ghost" size="icon" className="size-11 text-destructive" aria-label={`Remover ${name(e.exerciseId)}`} onClick={() => setSession((s) => ({ ...s, exercises: s.exercises.filter((x) => x.id !== e.id).map((x, k) => ({ ...x, order: k })) }))}><Trash2 className="size-4" /></Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    {([["targetSets", "Séries"], ["repMin", "Rep. mín."], ["repMax", "Rep. máx."], ["restSeconds", "Descanso (s)"]] as const).map(([k, label]) => (
                      <label key={k} className="space-y-1">{label}
                        <Input inputMode="numeric" value={String(e[k])} onChange={(ev) => setEx(e.id, { [k]: num(ev.target.value) })} className="h-11" />
                      </label>
                    ))}
                  </div>
                  <Input placeholder="Nota (opcional)" value={e.note ?? ""} onChange={(ev) => setEx(e.id, { note: ev.target.value })} className="h-11" />
                </li>
              ))}
            </ul>
            <Button variant="outline" className="h-12 w-full" onClick={() => setPicking(true)}><Plus className="size-4" /> Adicionar exercício do catálogo</Button>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button variant="ghost" className="h-12 flex-1" onClick={onClose}>Cancelar</Button>
              <Button className="h-12 flex-1" onClick={() => void save()}>Salvar no dispositivo</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
