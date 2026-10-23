import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, CalendarX, Dumbbell, History, Lightbulb, Plus, Ruler, Scale, Target, TrendingDown, User } from "lucide-react";
import { useStore } from "@/lib/store";
import { countByGroup, currentWeight, inPeriod, insights, weekStats } from "@/lib/calc";
import { formatDate, formatHeight, formatKg, todayISO } from "@/lib/format";
import { MUSCLE_GROUPS, type MuscleGroup, type Workout } from "@/lib/types";
import { Button, Chip, DAY_OPTIONS, EmptyState, MetricCard, Panel, PeriodFilter, SectionTitle } from "@/components/common";
import { CaloriesChart, WeightChart } from "@/components/charts";
import { WorkoutCard, WorkoutDetails } from "@/components/workouts";

export const Route = createFileRoute("/treinos")({
  head: () => ({
    meta: [
      { title: "Treinos — Coach Osmar" },
      { name: "description", content: "Painel com frequência semanal, evolução do peso, calorias e insights do seu treino." },
      { property: "og:title", content: "Treinos — Coach Osmar" },
      { property: "og:description", content: "Painel com frequência semanal, evolução do peso, calorias e insights." },
    ],
  }),
  component: Dashboard,
});

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
}

function Dashboard() {
  const { data, openForm } = useStore();
  const { profile, workouts, measurements } = data;
  const week = weekStats(workouts);
  const weight = currentWeight(profile, measurements);
  const tips = insights(workouts, measurements);
  const [group, setGroup] = useState<MuscleGroup | "all">("all");
  const [days, setDays] = useState(30);
  const [viewing, setViewing] = useState<Workout | null>(null);

  const periodWorkouts = useMemo(
    () => workouts.filter((w) => w.status === "concluido" && inPeriod(w.date, days)),
    [workouts, days],
  );
  const counts = countByGroup(periodWorkouts);
  const list = periodWorkouts
    .filter((w) => group === "all" || w.muscleGroups.includes(group))
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="space-y-6 page-enter">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{formatDate(todayISO())}</p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {greeting()}, {profile.name.split(" ")[0]}
          </h1>
        </div>
        <Button size="lg" onClick={() => openForm({ kind: "workout" })}>
          <Plus className="size-4" /> Registrar treino
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="Usuário" value={profile.name} icon={User} hint={profile.email} />
        <MetricCard label="Peso atual" value={formatKg(weight)} icon={Scale} accent hint={`Inicial: ${formatKg(profile.initialWeightKg)}`} />
        <MetricCard label="Altura" value={formatHeight(profile.heightCm)} icon={Ruler} />
        <MetricCard label="Objetivo" value={<span className="text-sm font-medium leading-snug md:text-base">{profile.goal}</span>} icon={Target} />
        <MetricCard label="Peso inicial" value={formatKg(profile.initialWeightKg)} icon={TrendingDown} hint="Referência histórica" />
        <MetricCard label="Presenças na semana" value={week.present} icon={CalendarCheck} hint="Seg. a dom." />
        <MetricCard label="Faltas na semana" value={week.absent} icon={CalendarX} hint="Treinos não realizados" />
        <MetricCard label="Treinos concluídos" value={week.completed} icon={Dumbbell} accent hint="Nesta semana" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <WeightChart />
        <CaloriesChart />
      </div>

      <Panel>
        <SectionTitle>Insights do seu treino</SectionTitle>
        {tips.length === 0 ? (
          <EmptyState icon={Lightbulb} title="Sem dados suficientes" description="Adicione seu primeiro treino para receber sugestões." action={<Button onClick={() => openForm({ kind: "workout" })}>Registrar treino</Button>} />
        ) : (
          <ul className="grid gap-3 md:grid-cols-3">
            {tips.map((t) => (
              <li key={t} className="flex gap-3 rounded-lg bg-surface p-3 text-sm">
                <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-muted-foreground">Sugestões gerais baseadas nos seus registros; não substituem orientação profissional.</p>
      </Panel>

      <Panel>
        <SectionTitle action={<PeriodFilter value={days} onChange={setDays} options={DAY_OPTIONS} />}>Treinos por grupo muscular</SectionTitle>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
          <Chip active={group === "all"} onClick={() => setGroup("all")}>Todos · {periodWorkouts.length}</Chip>
          {MUSCLE_GROUPS.map((g) => (
            <Chip key={g.value} active={group === g.value} onClick={() => setGroup(g.value)}>
              {g.label} · {counts[g.value]}
            </Chip>
          ))}
        </div>
        <div className="mt-3">
          {list.length === 0 ? (
            <EmptyState
              icon={Dumbbell}
              title="Nenhum resultado para os filtros"
              description="Não há treinos concluídos deste grupo no período."
              action={<Button variant="outline" onClick={() => { setGroup("all"); setDays(90); }}>Limpar filtros</Button>}
            />
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {list.slice(0, 6).map((w) => <WorkoutCard key={w.id} workout={w} onView={() => setViewing(w)} />)}
            </div>
          )}
          {list.length > 6 && (
            <div className="mt-3 text-center">
              <Button variant="link" asChild><Link to="/atividades">Ver todos os {list.length} treinos</Link></Button>
            </div>
          )}
        </div>
      </Panel>

      <div>
        <SectionTitle>Próximas ações</SectionTitle>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <ActionTile icon={Plus} label="Registrar treino" primary onClick={() => openForm({ kind: "workout" })} />
          <ActionTile icon={Scale} label="Registrar peso ou medidas" onClick={() => openForm({ kind: "measurement" })} />
          <Link to="/atividades" className="flex flex-col gap-2 rounded-xl border bg-card p-4 text-sm font-medium transition-colors duration-150 hover:bg-elevated">
            <History className="size-5 text-muted-foreground" aria-hidden="true" /> Ver histórico
          </Link>
          <Link to="/corpo" className="flex flex-col gap-2 rounded-xl border bg-card p-4 text-sm font-medium transition-colors duration-150 hover:bg-elevated">
            <Target className="size-5 text-muted-foreground" aria-hidden="true" /> Ver evolução corporal
          </Link>
        </div>
      </div>

      <WorkoutDetails workout={viewing} onClose={() => setViewing(null)} onEdit={(w) => { setViewing(null); openForm({ kind: "workout", initial: w }); }} />
    </div>
  );
}

function ActionTile({ icon: Icon, label, onClick, primary }: { icon: typeof Plus; label: string; onClick: () => void; primary?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        primary
          ? "flex flex-col gap-2 rounded-xl border border-primary bg-primary/10 p-4 text-left text-sm font-medium transition-colors duration-150 hover:bg-primary/20"
          : "flex flex-col gap-2 rounded-xl border bg-card p-4 text-left text-sm font-medium transition-colors duration-150 hover:bg-elevated"
      }
    >
      <Icon className={primary ? "size-5 text-primary" : "size-5 text-muted-foreground"} aria-hidden="true" />
      {label}
    </button>
  );
}
