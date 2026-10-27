import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, CalendarPlus, Loader2, ShieldAlert, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button, Field, PageHeader, Panel, SectionTitle, Tag } from "@/components/common";
import { NativeSelect } from "@/components/forms";
import { useStore } from "@/lib/store";
import { generatePlan } from "@/lib/training-plan.functions";
import { validatePlanRequest, type PlanRequest, type TrainingPlan } from "@/lib/training-plan";
import { groupLabel } from "@/lib/types";
import { addDays, toISODate } from "@/lib/format";

export const Route = createFileRoute("/plano-ia")({
  head: () => ({
    meta: [
      { title: "Plano com IA — Coach Osmar" },
      { name: "description", content: "Informe objetivos e limitações do aluno e gere um plano de treino personalizado com IA." },
      { property: "og:title", content: "Plano com IA — Coach Osmar" },
      { property: "og:description", content: "Plano de treino personalizado com base nos objetivos e limitações do aluno." },
    ],
  }),
  component: PlanoIA,
});

function PlanoIA() {
  const run = useServerFn(generatePlan);
  const { addWorkout } = useStore();
  const [v, setV] = useState({ studentName: "", age: "", sex: "", level: "iniciante", goals: "", limitations: "", daysPerWeek: "3", minutesPerSession: "60", equipment: "Academia completa" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => setV((s) => ({ ...s, [k]: e.target.value }));

  async function submit(ev: FormEvent) {
    ev.preventDefault();
    if (loading) return;
    const req: PlanRequest = {
      studentName: v.studentName.trim(), age: v.age ? Number(v.age) : null, sex: v.sex,
      level: v.level as PlanRequest["level"], goals: v.goals.trim(), limitations: v.limitations.trim(),
      daysPerWeek: Number(v.daysPerWeek), minutesPerSession: Number(v.minutesPerSession), equipment: v.equipment,
    };
    const e = validatePlanRequest(req);
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    try {
      const r = await run({ data: req });
      if (r.error || !r.plan) toast.error(r.error ?? "Não foi possível gerar o plano.");
      else { setPlan(r.plan); toast.success("Plano gerado!"); }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível gerar o plano.");
    } finally {
      setLoading(false);
    }
  }

  function schedule() {
    if (!plan) return;
    const today = new Date();
    plan.days.forEach((d, i) => {
      addWorkout({
        name: d.name, date: toISODate(addDays(today, i + 1)), durationMinutes: d.durationMinutes,
        muscleGroups: d.muscleGroups.length ? d.muscleGroups : ["corpo_inteiro"], status: "planejado",
        notes: d.focus,
        exercises: d.exercises.map((x) => ({ id: "", name: x.name, sets: x.sets, reps: parseInt(x.reps, 10) || 10 })),
      });
    });
    toast.success(`${plan.days.length} treinos agendados a partir de amanhã.`);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 page-enter">
      <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
        <Link to="/treinos"><ArrowLeft className="size-4" /> Voltar aos treinos</Link>
      </Button>
      <PageHeader title="Plano de treino com IA" description="Informe os objetivos e as limitações do aluno para gerar um plano personalizado." />

      <Panel>
        <form onSubmit={submit} noValidate className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field id="pi-name" label="Nome do aluno (opcional)"><Input id="pi-name" value={v.studentName} onChange={set("studentName")} /></Field>
            <Field id="pi-age" label="Idade (opcional)" error={errors["age"]}><Input id="pi-age" inputMode="numeric" value={v.age} onChange={set("age")} /></Field>
            <Field id="pi-sex" label="Sexo">
              <NativeSelect id="pi-sex" value={v.sex} onChange={set("sex")}>
                <option value="">Não informar</option><option>Feminino</option><option>Masculino</option>
              </NativeSelect>
            </Field>
          </div>
          <Field id="pi-goals" label="Objetivos" error={errors["goals"]}>
            <Textarea id="pi-goals" rows={3} value={v.goals} onChange={set("goals")} placeholder="Ex.: perder 6 kg, ganhar força nas pernas, melhorar condicionamento" aria-invalid={!!errors["goals"]} />
          </Field>
          <Field id="pi-lim" label="Limitações, lesões ou restrições" error={errors["limitations"]}>
            <Textarea id="pi-lim" rows={3} value={v.limitations} onChange={set("limitations")} placeholder="Ex.: dor no joelho direito, hérnia lombar, evitar impacto" />
          </Field>
          <div className="grid gap-3 sm:grid-cols-4">
            <Field id="pi-level" label="Nível">
              <NativeSelect id="pi-level" value={v.level} onChange={set("level")}>
                <option value="iniciante">Iniciante</option><option value="intermediario">Intermediário</option><option value="avancado">Avançado</option>
              </NativeSelect>
            </Field>
            <Field id="pi-days" label="Dias/semana" error={errors["daysPerWeek"]}>
              <NativeSelect id="pi-days" value={v.daysPerWeek} onChange={set("daysPerWeek")}>
                {[1, 2, 3, 4, 5, 6, 7].map((n) => <option key={n}>{n}</option>)}
              </NativeSelect>
            </Field>
            <Field id="pi-min" label="Minutos/sessão" error={errors["minutesPerSession"]}><Input id="pi-min" inputMode="numeric" value={v.minutesPerSession} onChange={set("minutesPerSession")} /></Field>
            <Field id="pi-eq" label="Equipamentos">
              <NativeSelect id="pi-eq" value={v.equipment} onChange={set("equipment")}>
                <option>Academia completa</option><option>Academia básica (halteres, barras, bancos)</option><option>Em casa, sem equipamentos</option><option>Em casa, com halteres e elásticos</option>
              </NativeSelect>
            </Field>
          </div>
          <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={loading}>
            {loading ? <><Loader2 className="size-4 animate-spin" /> Gerando plano…</> : <><Sparkles className="size-4" /> Gerar plano com IA</>}
          </Button>
          {loading && <p className="text-xs text-muted-foreground" aria-live="polite">Isso pode levar alguns segundos.</p>}
        </form>
      </Panel>

      {plan && (
        <div className="space-y-4" aria-live="polite">
          <Panel>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">{plan.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{plan.summary}</p>
                <div className="mt-2 flex flex-wrap gap-1"><Tag>{plan.days.length} dias/semana</Tag><Tag>{plan.weeks} semanas</Tag></div>
              </div>
              <Button variant="outline" onClick={schedule}><CalendarPlus className="size-4" /> Agendar treinos</Button>
            </div>
          </Panel>
          {plan.safetyNotes.length > 0 && (
            <Panel>
              <SectionTitle>Cuidados com as limitações</SectionTitle>
              <ul className="space-y-2 text-sm">
                {plan.safetyNotes.map((n) => <li key={n} className="flex gap-2"><ShieldAlert className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />{n}</li>)}
              </ul>
            </Panel>
          )}
          {plan.days.map((d) => (
            <Panel key={d.name}>
              <SectionTitle>{d.name}</SectionTitle>
              <p className="-mt-2 mb-3 text-sm text-muted-foreground">{d.focus} · {d.durationMinutes} min</p>
              <div className="mb-3 flex flex-wrap gap-1">{d.muscleGroups.map((g) => <Tag key={g}>{groupLabel(g)}</Tag>)}</div>
              <ul className="divide-y">
                {d.exercises.map((x) => (
                  <li key={x.name} className="py-2.5 text-sm">
                    <div className="flex justify-between gap-3"><span className="font-medium">{x.name}</span><span className="whitespace-nowrap tabular text-muted-foreground">{x.sets} × {x.reps} · {x.restSeconds}s</span></div>
                    {x.notes && <p className="mt-0.5 text-xs text-muted-foreground">{x.notes}</p>}
                  </li>
                ))}
              </ul>
            </Panel>
          ))}
          <Panel>
            <SectionTitle>Progressão</SectionTitle>
            <p className="text-sm">{plan.progression}</p>
            <p className="mt-3 text-xs text-muted-foreground">Plano gerado por IA; revise antes de aplicar e não substitui avaliação médica.</p>
          </Panel>
        </div>
      )}
    </div>
  );
}
