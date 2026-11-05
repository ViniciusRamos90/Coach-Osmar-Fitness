import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CalendarDays, Dumbbell, ListChecks, Play, RotateCcw, Zap } from "lucide-react";
import { Button, EmptyState, LoadingState, Panel, SectionTitle } from "@/components/common";
import { sessionRepo, useActiveSession, useRoutines, useSessions } from "@/lib/local/db";
import { nextSession, startSession, weekSummary } from "@/lib/local/session";
import { newId } from "@/lib/local/models";

export const Route = createFileRoute("/hoje")({
  head: () => ({
    meta: [
      { title: "Hoje — Coach Osmar" },
      { name: "description", content: "Seu próximo treino, a semana em andamento e acesso rápido para começar." },
      { property: "og:title", content: "Hoje — Coach Osmar" },
      { property: "og:description", content: "Seu próximo treino e a semana em andamento." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Hoje,
});

const DAY = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function Hoje() {
  const routines = useRoutines();
  const sessions = useSessions();
  const active = useActiveSession();
  const navigate = useNavigate();
  if (!routines || !sessions || active === undefined) return <LoadingState />;

  const next = nextSession(routines, sessions);
  const week = weekSummary(sessions);
  const today = new Date().toDateString();
  const begin = async (s: Parameters<typeof sessionRepo.save>[0]) => {
    if (await sessionRepo.save(s)) void navigate({ to: "/treino" });
  };

  return (
    <div className="space-y-6 page-enter">
      <div>
        <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit" })}</p>
        <h1 className="text-2xl font-semibold tracking-tight">Hoje</h1>
      </div>

      <ul className="grid grid-cols-7 gap-1.5" aria-label="Semana atual">
        {week.days.map((d, i) => {
          const isToday = d.date.toDateString() === today;
          return (
            <li key={i} className={`flex flex-col items-center gap-1 rounded-xl border py-2 text-xs ${isToday ? "border-primary bg-primary/10" : "bg-card"}`}>
              <span className={isToday ? "font-semibold text-primary" : "text-muted-foreground"}>{DAY[i]}</span>
              <span className="text-base font-semibold">{d.date.getDate()}</span>
              <span className={`size-1.5 rounded-full ${d.trained ? "bg-primary" : "bg-border"}`} aria-label={d.trained ? "Treinou" : "Sem treino"} />
            </li>
          );
        })}
      </ul>

      {active ? (
        <Panel className="border-primary bg-primary/10">
          <p className="text-xs font-medium uppercase tracking-wide text-primary">Treino em andamento</p>
          <h2 className="mt-1 text-xl font-semibold">{active.name}</h2>
          <p className="text-sm text-muted-foreground">{active.setLogs.filter((l) => l.status === "done").length} séries registradas</p>
          <Button size="lg" className="mt-4 w-full min-h-12" asChild><Link to="/treino"><RotateCcw className="size-4" /> Continuar treino</Link></Button>
        </Panel>
      ) : next ? (
        <Panel>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Próximo treino</p>
          <h2 className="mt-1 text-xl font-semibold">{next.routine.sessions[next.index]!.name}</h2>
          <p className="text-sm text-muted-foreground">{next.routine.name} · {next.routine.sessions[next.index]!.exercises.length} exercícios</p>
          <Button size="lg" className="mt-4 w-full min-h-12" onClick={() => void begin(startSession(next.routine, next.index))}><Play className="size-4" /> Começar treino</Button>
        </Panel>
      ) : (
        <EmptyState icon={Dumbbell} title="Nenhuma rotina ativa" description="Crie e ative uma rotina para ver seu próximo treino aqui." action={<Button asChild><Link to="/rotinas">Criar rotina</Link></Button>} />
      )}

      <div className="grid grid-cols-2 gap-3">
        <Link to="/rotinas" className="flex min-h-20 flex-col gap-2 rounded-xl border bg-card p-4 text-sm font-medium hover:bg-elevated"><ListChecks className="size-5 text-muted-foreground" /> Minhas rotinas</Link>
        <button type="button" disabled={!!active} onClick={() => void begin({ id: newId(), name: "Treino livre", startedAt: new Date().toISOString(), status: "in_progress", setLogs: [], plan: [] })} className="flex min-h-20 flex-col gap-2 rounded-xl border bg-card p-4 text-left text-sm font-medium hover:bg-elevated disabled:opacity-50">
          <Zap className="size-5 text-primary" /> Treino livre
        </button>
      </div>

      <Panel>
        <SectionTitle>Esta semana</SectionTitle>
        <div className="grid grid-cols-3 gap-3 text-center">
          <Stat label="Treinos" value={week.completed} />
          <Stat label="Séries" value={week.sets} />
          <Stat label="Volume (kg)" value={Math.round(week.volume).toLocaleString("pt-BR")} />
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground"><CalendarDays className="size-3.5" /> Semana de segunda a domingo. Volume = carga × repetições das séries concluídas.</p>
      </Panel>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-lg bg-surface p-3"><p className="text-xl font-semibold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>;
}
