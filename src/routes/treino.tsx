import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, ListPlus, SkipForward, Timer, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button, ConfirmDialog, EmptyState, LoadingState, Panel } from "@/components/common";
import { ExerciseBrowser } from "@/components/exercise-catalog";
import { sessionRepo, useActiveSession, useExercises, usePrefs } from "@/lib/local/db";
import { formatClock, logSet, skipExercise, volume } from "@/lib/local/session";
import type { WorkoutSession } from "@/lib/local/models";

export const Route = createFileRoute("/treino")({
  head: () => ({
    meta: [
      { title: "Treino em andamento — Coach Osmar" },
      { name: "description", content: "Registre carga e repetições série a série com cronômetro de descanso." },
      { property: "og:title", content: "Treino em andamento — Coach Osmar" },
      { property: "og:description", content: "Registro série a série com cronômetro de descanso." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LiveWorkout,
});

function LiveWorkout() {
  const session = useActiveSession();
  const exercises = useExercises();
  const prefs = usePrefs();
  const navigate = useNavigate();
  const [restEnd, setRestEnd] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [picking, setPicking] = useState(false);
  const [confirm, setConfirm] = useState<"finish" | "cancel" | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const restLeft = restEnd ? Math.ceil((restEnd - now) / 1000) : 0;
  useEffect(() => {
    if (restEnd && restLeft <= 0) { setRestEnd(null); navigator.vibrate?.(200); }
  }, [restEnd, restLeft]);

  if (session === undefined || !exercises || !prefs) return <LoadingState />;
  if (!session) return <EmptyState icon={Timer} title="Nenhum treino em andamento" description="Comece um treino pela tela Hoje ou por uma rotina." action={<Button asChild><Link to="/hoje">Ir para Hoje</Link></Button>} />;

  const unit = prefs.loadUnit;
  const byId = new Map(exercises.map((e) => [e.id, e]));
  const plan = session.plan ?? [];
  const save = (s: WorkoutSession) => void sessionRepo.save(s);
  const elapsed = Math.floor((now - new Date(session.startedAt).getTime()) / 1000);
  const end = async (status: "completed" | "cancelled") => {
    if (await sessionRepo.save({ ...session, status, endedAt: new Date().toISOString() }, status === "completed" ? "Treino concluído" : "Treino cancelado")) void navigate({ to: "/hoje" });
  };

  return (
    <div className="space-y-4 pb-24 page-enter">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-primary">Em andamento · {formatClock(elapsed)}</p>
          <h1 className="text-xl font-semibold">{session.name}</h1>
          <p className="text-sm text-muted-foreground">Volume: {Math.round(volume(session.setLogs)).toLocaleString("pt-BR")} {unit}</p>
        </div>
        <Button variant="ghost" size="sm" className="min-h-11 text-destructive" onClick={() => setConfirm("cancel")}><X className="size-4" /> Cancelar</Button>
      </div>

      {plan.length === 0 && <p className="rounded-lg bg-surface p-4 text-sm text-muted-foreground">Adicione exercícios para começar a registrar.</p>}

      {plan.map((p) => {
        const ex = byId.get(p.exerciseId);
        const logs = session.setLogs.filter((l) => l.exerciseId === p.exerciseId);
        return (
          <Panel key={p.exerciseId}>
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <h2 className="font-semibold">{ex?.name ?? "Exercício"}</h2>
                <p className="text-xs text-muted-foreground">{p.targetSets} × {p.repMin}–{p.repMax} reps · descanso {p.restSeconds}s{p.note ? ` · ${p.note}` : ""}</p>
              </div>
              <Button variant="ghost" size="sm" className="min-h-11" onClick={() => save(skipExercise(session, p.exerciseId, unit))}><SkipForward className="size-4" /> Pular</Button>
            </div>
            <div className="space-y-2">
              {Array.from({ length: p.targetSets }, (_, i) => i + 1).map((n) => (
                <SetRow key={n} n={n} unit={unit} log={logs.find((l) => l.setNumber === n)} prev={logs.find((l) => l.setNumber === n - 1)} repDefault={p.repMax}
                  onDone={(reps, load) => { save(logSet(session, p.exerciseId, n, reps, load, unit)); if (p.restSeconds) setRestEnd(Date.now() + p.restSeconds * 1000); }} />
              ))}
            </div>
            <Button variant="link" size="sm" onClick={() => save({ ...session, plan: plan.map((x) => (x.exerciseId === p.exerciseId ? { ...x, targetSets: x.targetSets + 1 } : x)) })}>+ Série</Button>
          </Panel>
        );
      })}

      <Button variant="outline" className="w-full min-h-12" onClick={() => setPicking(true)}><ListPlus className="size-4" /> Adicionar exercício</Button>
      <Button size="lg" className="w-full min-h-12" onClick={() => setConfirm("finish")}><Check className="size-4" /> Concluir treino</Button>

      {restEnd && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-surface/95 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur" role="timer" aria-live="polite">
          <div className="mx-auto flex max-w-xl items-center justify-between gap-2">
            <div><p className="text-xs text-muted-foreground">Descanso</p><p className="text-2xl font-semibold tabular-nums text-primary">{formatClock(restLeft)}</p></div>
            <div className="flex gap-2">
              <Button variant="outline" className="min-h-11" onClick={() => setRestEnd((e) => (e ?? Date.now()) + 15000)}>+15s</Button>
              <Button variant="outline" className="min-h-11" onClick={() => setRestEnd((e) => (e ?? Date.now()) + 30000)}>+30s</Button>
              <Button className="min-h-11" onClick={() => setRestEnd(null)}>Pular</Button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={picking} onOpenChange={setPicking}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Adicionar exercício</DialogTitle><DialogDescription>Entra no fim do treino de hoje.</DialogDescription></DialogHeader>
          <ExerciseBrowser exercises={exercises} actionLabel="Adicionar" onSelect={(e) => {
            if (!plan.some((p) => p.exerciseId === e.id)) save({ ...session, plan: [...plan, { exerciseId: e.id, targetSets: 3, repMin: 8, repMax: 12, restSeconds: prefs.defaultRestSeconds }] });
            setPicking(false);
          }} />
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={confirm !== null} onOpenChange={(o) => !o && setConfirm(null)}
        title={confirm === "finish" ? "Concluir treino?" : "Cancelar treino?"}
        description={confirm === "finish" ? "As séries registradas serão salvas no seu histórico." : "O treino não contará no seu progresso."}
        confirmLabel={confirm === "finish" ? "Concluir" : "Cancelar treino"} destructive={confirm === "cancel"}
        onConfirm={() => void end(confirm === "finish" ? "completed" : "cancelled")} />
    </div>
  );
}

function SetRow({ n, unit, log, prev, repDefault, onDone }: { n: number; unit: string; log?: WorkoutSession["setLogs"][number]; prev?: WorkoutSession["setLogs"][number]; repDefault: number; onDone: (reps: number, load: number) => void }) {
  const [load, setLoad] = useState(String(log?.load ?? prev?.load ?? ""));
  const [reps, setReps] = useState(String(log?.reps ?? repDefault));
  const done = log?.status === "done";
  const skipped = log?.status === "skipped";
  const valid = Number(reps) > 0 && Number(load) >= 0 && load !== "";
  return (
    <div className={`grid grid-cols-[2rem_1fr_1fr_3rem] items-center gap-2 rounded-lg p-1.5 ${done ? "bg-primary/10" : skipped ? "opacity-50" : ""}`}>
      <span className="text-center text-sm font-semibold text-muted-foreground">{n}</span>
      <Input aria-label={`Carga série ${n} (${unit})`} inputMode="decimal" placeholder={unit} value={load} onChange={(e) => setLoad(e.target.value.replace(",", "."))} className="h-11" />
      <Input aria-label={`Repetições série ${n}`} inputMode="numeric" placeholder="reps" value={reps} onChange={(e) => setReps(e.target.value.replace(/\D/g, ""))} className="h-11" />
      <Button size="icon" variant={done ? "default" : "outline"} className="size-11" disabled={!valid} aria-label={`Concluir série ${n}`} onClick={() => onDone(Number(reps), Number(load))}><Check className="size-4" /></Button>
    </div>
  );
}
