import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowLeft, Check, Dumbbell, Flame, Target, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildPlan } from "@/lib/calc";
import { parseNum } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { Logo } from "./common";

/* ---------------- Local persistence (frontend phase) ---------------- */

export interface Anamnesis {
  goal: "ganhar" | "perder" | "definir";
  challenge: string;
  focus: string;
  experience: string;
  gym: string;
  cardio: boolean;
  days: number[]; // 0 = Seg … 6 = Dom
  time: string;
  sex: string;
  birth: string;
  heightCm: number;
  weightKg: number;
  targetKg: number;
  completedAt: string;
}

const key = (uid: string) => `coach-osmar:anamnese:${uid}`;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export function readAnamnesis(uid: string): Anamnesis | null {
  try {
    const raw = localStorage.getItem(key(uid));
    return raw ? (JSON.parse(raw) as Anamnesis) : null;
  } catch {
    return null;
  }
}
export function resetAnamnesis(uid: string) {
  localStorage.removeItem(key(uid));
  notify();
}

/** Returns undefined until read on the client, then the saved anamnesis or null. */
export function useAnamnesis() {
  const { session } = useStore();
  const uid = session?.user.id ?? "";
  const [value, setValue] = useState<Anamnesis | null | undefined>(undefined);
  useEffect(() => {
    if (!uid) return;
    const sync = () => setValue(readAnamnesis(uid));
    sync();
    listeners.add(sync);
    return () => void listeners.delete(sync);
  }, [uid]);
  const save = (a: Anamnesis) => {
    localStorage.setItem(key(uid), JSON.stringify(a));
    notify();
  };
  return { anamnesis: value, save, reset: () => resetAnamnesis(uid) };
}

/* ---------------- Options ---------------- */

const GOALS = [
  { v: "ganhar", l: "Ganhar músculos", d: "Mais massa muscular e mais volume" },
  { v: "perder", l: "Perder gordura", d: "Emagrecer sem perder massa muscular" },
  { v: "definir", l: "Definir o corpo", d: "Reduzir gordura e destacar os músculos" },
] as const;
const CHALLENGES = [
  { v: "o-que-treinar", l: "Saber o que treinar", d: "Fico na dúvida em cada escolha do treino" },
  { v: "resultados", l: "Ver resultados", d: "Sinto que consigo evoluir mais que isso" },
  { v: "movimento", l: "Fazer o movimento certo", d: "Não sei se estou executando corretamente" },
  { v: "rotina", l: "Manter a rotina", d: "Começo animado, mas acabo parando" },
];
const FOCUS = ["Equilibrado", "Peito", "Costas", "Braços", "Pernas", "Abdômen", "Glúteos"];
const EXPERIENCE = [
  { v: "zero", l: "Do zero", d: "Nunca treinei ou parei há muito tempo" },
  { v: "iniciante", l: "Iniciante", d: "Treino há alguns meses e ainda estou aprendendo" },
  { v: "intermediario", l: "Intermediário", d: "Treino com regularidade há mais de um ano" },
];
const GYMS = [
  { v: "basica", l: "Academia básica", d: "Halteres, barras e bancos" },
  { v: "equipada", l: "Academia equipada", d: "Grande variedade de equipamentos" },
];
const WEEK = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
const SEXES = ["Feminino", "Masculino", "Prefiro não dizer"];

const GOAL_LABEL: Record<Anamnesis["goal"], string> = { ganhar: "ganhar músculos", perder: "perder gordura", definir: "definir o corpo" };

type Draft = Omit<Anamnesis, "completedAt" | "goal" | "heightCm" | "weightKg" | "targetKg"> & {
  goal: Anamnesis["goal"] | "";
  height: string;
  weight: string;
  target: string;
};

const STEPS = [
  "goal", "challenge", "insight", "focus", "experience", "gym", "cardio", "days", "time",
  "ready", "sex", "birth", "height", "weight", "target", "analyzing", "plan", "commit",
] as const;
type Step = (typeof STEPS)[number];

function age(birth: string) {
  const b = new Date(birth);
  const n = new Date();
  let a = n.getFullYear() - b.getFullYear();
  if (n < new Date(n.getFullYear(), b.getMonth(), b.getDate())) a--;
  return a;
}

/* ---------------- UI building blocks ---------------- */

function OptionCard({ selected, onClick, title, desc }: { selected: boolean; onClick: () => void; title: string; desc?: string }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        "flex min-h-16 w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition-colors duration-150",
        selected ? "border-primary bg-primary/10" : "bg-card hover:bg-elevated",
      )}
    >
      <span>
        <span className="block font-semibold">{title}</span>
        {desc && <span className="mt-0.5 block text-sm text-muted-foreground">{desc}</span>}
      </span>
      <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-full border", selected && "border-primary bg-primary text-primary-foreground")}>
        {selected && <Check className="size-4" aria-hidden="true" />}
      </span>
    </button>
  );
}

function Question({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function NumberField({ id, value, onChange, unit, placeholder }: { id: string; value: string; onChange: (v: string) => void; unit: string; placeholder: string }) {
  return (
    <div className="flex items-baseline justify-center gap-2 py-8">
      <Input
        id={id}
        inputMode="decimal"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-20 w-40 border-0 border-b-2 border-primary bg-transparent text-center text-5xl font-bold tabular shadow-none focus-visible:ring-0 md:text-5xl"
        aria-label={unit}
      />
      <span className="text-xl text-muted-foreground">{unit}</span>
    </div>
  );
}

/* ---------------- Flow ---------------- */

export function Onboarding({ onDone }: { onDone: (a: Anamnesis) => void }) {
  const { data } = useStore();
  const [i, setI] = useState(0);
  const [progress, setProgress] = useState(0);
  const [d, setD] = useState<Draft>({
    goal: "", challenge: "", focus: "", experience: "", gym: "", cardio: true,
    days: [0, 1, 3, 4], time: "19:00", sex: "", birth: "2000-01-01",
    height: data.profile.heightCm ? String(data.profile.heightCm) : "",
    weight: data.profile.initialWeightKg ? String(data.profile.initialWeightKg).replace(".", ",") : "",
    target: "",
  });
  const step: Step = STEPS[i]!;
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((s) => ({ ...s, [k]: v }));
  const next = () => setI((x) => Math.min(STEPS.length - 1, x + 1));
  const back = () => setI((x) => Math.max(0, x - 1));
  const pick = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    set(k, v);
    setTimeout(next, 180);
  };

  const h = parseNum(d.height), w = parseNum(d.weight), t = parseNum(d.target);
  const plan = useMemo(() => (w && t ? buildPlan(w, t, d.days.length) : null), [w, t, d.days.length]);

  useEffect(() => {
    if (step !== "analyzing") return;
    setProgress(0);
    const id = setInterval(() => setProgress((p) => (p >= 100 ? 100 : p + 2)), 50);
    return () => clearInterval(id);
  }, [step]);
  useEffect(() => {
    if (step === "analyzing" && progress >= 100) {
      const id = setTimeout(next, 400);
      return () => clearTimeout(id);
    }
  }, [step, progress]);

  const validity: Partial<Record<Step, boolean>> = {
    days: d.days.length > 0,
    time: /^\d{2}:\d{2}$/.test(d.time),
    birth: !!d.birth && age(d.birth) >= 12 && age(d.birth) <= 100,
    height: h !== undefined && h >= 100 && h <= 250,
    weight: w !== undefined && w >= 30 && w <= 300,
    target: t !== undefined && t >= 30 && t <= 300,
  };
  const errors: Partial<Record<Step, string>> = {
    days: "Escolha pelo menos um dia.",
    birth: "Informe uma data válida (idade entre 12 e 100 anos).",
    height: "Altura entre 100 e 250 cm.",
    weight: "Peso entre 30 e 300 kg.",
    target: "Peso entre 30 e 300 kg.",
  };
  const [touched, setTouched] = useState(false);
  useEffect(() => setTouched(false), [i]);
  const tryNext = () => {
    if (validity[step] === false) return setTouched(true);
    next();
  };

  const finish = () =>
    onDone({
      goal: (d.goal || "definir") as Anamnesis["goal"], challenge: d.challenge, focus: d.focus || "Equilibrado",
      experience: d.experience, gym: d.gym, cardio: d.cardio, days: [...d.days].sort(), time: d.time,
      sex: d.sex, birth: d.birth, heightCm: h!, weightKg: w!, targetKg: t!, completedAt: new Date().toISOString(),
    });

  const autoAdvance = ["goal", "challenge", "focus", "experience", "gym", "cardio", "sex"].includes(step);
  const hideChrome = step === "analyzing";
  const pct = Math.round(((i + 1) / STEPS.length) * 100);

  let body: ReactNode = null;
  switch (step) {
    case "goal":
      body = (
        <Question title="Qual seu objetivo?">
          <div role="radiogroup" className="space-y-3">
            {GOALS.map((g) => <OptionCard key={g.v} title={g.l} desc={g.d} selected={d.goal === g.v} onClick={() => pick("goal", g.v)} />)}
          </div>
        </Question>
      );
      break;
    case "challenge":
      body = (
        <Question title="Qual seu maior desafio?">
          <div role="radiogroup" className="space-y-3">
            {CHALLENGES.map((c) => <OptionCard key={c.v} title={c.l} desc={c.d} selected={d.challenge === c.v} onClick={() => pick("challenge", c.v)} />)}
          </div>
        </Question>
      );
      break;
    case "insight":
      body = (
        <Question title="A dúvida na hora de executar é comum na academia" subtitle="60% de quem treina diz que a maior preocupação é não saber usar os aparelhos corretamente — e essa insegurança faz muita gente desistir.">
          <div className="rounded-2xl border bg-card p-5">
            <div className="flex items-end gap-3">
              <span className="text-6xl font-bold text-primary tabular">60%</span>
              <span className="pb-2 text-sm text-muted-foreground">sentem insegurança na execução</span>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-elevated"><div className="h-full w-[60%] rounded-full bg-primary" /></div>
            <p className="mt-4 text-sm text-muted-foreground">Aqui você vê como executar cada exercício antes de cada série.</p>
          </div>
        </Question>
      );
      break;
    case "focus":
      body = (
        <Question title="Qual músculo você quer priorizar?">
          <div role="radiogroup" className="grid grid-cols-2 gap-3">
            {FOCUS.map((f) => (
              <button key={f} type="button" role="radio" aria-checked={d.focus === f} onClick={() => pick("focus", f)}
                className={cn("h-16 rounded-2xl border font-semibold transition-colors duration-150", f === "Equilibrado" && "col-span-2", d.focus === f ? "border-primary bg-primary/10 text-primary" : "bg-card hover:bg-elevated")}>
                {f}
              </button>
            ))}
          </div>
        </Question>
      );
      break;
    case "experience":
      body = (
        <Question title="Qual sua experiência com treino?">
          <div role="radiogroup" className="space-y-3">
            {EXPERIENCE.map((x) => <OptionCard key={x.v} title={x.l} desc={x.d} selected={d.experience === x.v} onClick={() => pick("experience", x.v)} />)}
          </div>
        </Question>
      );
      break;
    case "gym":
      body = (
        <Question title="Como é a sua academia?">
          <div role="radiogroup" className="space-y-3">
            {GYMS.map((x) => <OptionCard key={x.v} title={x.l} desc={x.d} selected={d.gym === x.v} onClick={() => pick("gym", x.v)} />)}
          </div>
        </Question>
      );
      break;
    case "cardio":
      body = (
        <Question title="Quer incluir cardio nos treinos?" subtitle="Esteira, bicicleta, elíptico e semelhantes">
          <div role="radiogroup" className="space-y-3">
            <OptionCard title="Incluir cardio" desc="Exercícios de cardio antes ou depois dos treinos" selected={d.cardio} onClick={() => pick("cardio", true)} />
            <OptionCard title="Sem cardio" desc="Nenhum exercício de cardio no plano" selected={!d.cardio} onClick={() => pick("cardio", false)} />
          </div>
        </Question>
      );
      break;
    case "days":
      body = (
        <Question title="Quantos dias você quer treinar?" subtitle={`${d.days.length} dia(s) por semana`}>
          <div className="space-y-2" role="group" aria-label="Dias de treino">
            {WEEK.map((day, idx) => {
              const on = d.days.includes(idx);
              return (
                <button key={day} type="button" aria-pressed={on}
                  onClick={() => set("days", on ? d.days.filter((x) => x !== idx) : [...d.days, idx])}
                  className={cn("flex h-14 w-full items-center justify-between rounded-2xl border px-4 font-medium transition-colors duration-150", on ? "border-primary bg-primary/10" : "bg-card hover:bg-elevated")}>
                  {day}
                  <span className={cn("flex size-6 items-center justify-center rounded-md border", on && "border-primary bg-primary text-primary-foreground")}>{on && <Check className="size-4" aria-hidden="true" />}</span>
                </button>
              );
            })}
          </div>
        </Question>
      );
      break;
    case "time":
      body = (
        <Question title="Que horas você quer treinar?" subtitle="Todos os dias de treino">
          <div className="flex justify-center py-8">
            <Input type="time" aria-label="Horário do treino" value={d.time} onChange={(e) => set("time", e.target.value)}
              className="h-20 w-48 border-0 border-b-2 border-primary bg-transparent text-center text-4xl font-bold tabular shadow-none focus-visible:ring-0 md:text-4xl" />
          </div>
        </Question>
      );
      break;
    case "ready":
      body = (
        <Question title="A base do seu plano está pronta" subtitle="87% das pessoas que chegam até aqui treinam pelo menos 3 vezes por semana. Agora só faltam alguns dados para ajustar sua meta.">
          <div className="flex justify-center py-6">
            <span className="flex size-28 items-center justify-center rounded-full bg-primary/15 text-primary"><Dumbbell className="size-12" aria-hidden="true" /></span>
          </div>
        </Question>
      );
      break;
    case "sex":
      body = (
        <Question title="Qual seu sexo?" subtitle="O sexo altera o gasto calórico e a tolerância a volume de treino.">
          <div role="radiogroup" className="space-y-3">
            {SEXES.map((s) => <OptionCard key={s} title={s} selected={d.sex === s} onClick={() => pick("sex", s)} />)}
          </div>
        </Question>
      );
      break;
    case "birth":
      body = (
        <Question title="Quando você nasceu?" subtitle="Metabolismo e recuperação mudam com a idade. Seu plano acompanha isso.">
          <div className="flex justify-center py-8">
            <Input type="date" aria-label="Data de nascimento" value={d.birth} onChange={(e) => set("birth", e.target.value)} className="h-14 w-60 text-center text-lg" />
          </div>
        </Question>
      );
      break;
    case "height":
      body = <Question title="Qual sua altura?" subtitle="Junto com o peso, determina a base do seu gasto energético."><NumberField id="ob-h" value={d.height} onChange={(v) => set("height", v)} unit="cm" placeholder="173" /></Question>;
      break;
    case "weight":
      body = <Question title="Qual seu peso atual?" subtitle="É a partir dele que estimamos as calorias de cada treino."><NumberField id="ob-w" value={d.weight} onChange={(v) => set("weight", v)} unit="kg" placeholder="70,0" /></Question>;
      break;
    case "target":
      body = <Question title="Qual seu peso ideal?" subtitle="Permite traçar um caminho realista, com prazo e ritmo definidos."><NumberField id="ob-t" value={d.target} onChange={(v) => set("target", v)} unit="kg" placeholder="65,0" /></Question>;
      break;
    case "analyzing": {
      const lines = [
        `Analisando perfil ${d.sex ? d.sex.toLowerCase() : ""}, ${age(d.birth)} anos, nível ${EXPERIENCE.find((x) => x.v === d.experience)?.l.toLowerCase() ?? "iniciante"}`,
        `Calculando taxa metabólica para ${d.height} cm e ${d.weight} kg`,
        `Definindo volume semanal para ${GOAL_LABEL[(d.goal || "definir") as Anamnesis["goal"]]}`,
        `Distribuindo ${d.days.length} treinos com foco em ${(d.focus || "Equilibrado").toLowerCase()}`,
      ];
      body = (
        <div className="flex min-h-[60vh] flex-col justify-center space-y-8">
          <div className="text-center">
            <div className="text-6xl font-bold text-primary tabular" aria-live="polite">{progress}%</div>
            <div className="mx-auto mt-4 h-2 max-w-xs overflow-hidden rounded-full bg-elevated"><div className="h-full rounded-full bg-primary transition-[width] duration-100" style={{ width: `${progress}%` }} /></div>
          </div>
          <ul className="space-y-3">
            {lines.map((l, k) => {
              const done = progress >= (k + 1) * 25;
              return (
                <li key={l} className={cn("flex items-center gap-3 text-sm transition-opacity", done ? "opacity-100" : "opacity-40")}>
                  <span className={cn("flex size-5 shrink-0 items-center justify-center rounded-full border", done && "border-primary bg-primary text-primary-foreground")}>{done && <Check className="size-3" aria-hidden="true" />}</span>
                  {l}
                </li>
              );
            })}
          </ul>
        </div>
      );
      break;
    }
    case "plan":
      body = plan && (
        <Question title={`Seu plano para ${GOAL_LABEL[(d.goal || "definir") as Anamnesis["goal"]]} está pronto`} subtitle={`São ${plan.workoutsPerWeek} treinos por semana com foco em ${(d.focus || "Equilibrado").toLowerCase()}, e você vê como executar antes de cada série.`}>
          <div className="grid grid-cols-3 gap-2">
            <Stat icon={Dumbbell} label="Treinos/sem" value={String(plan.workoutsPerWeek)} />
            <Stat icon={plan.diffKg < 0 ? TrendingDown : TrendingUp} label="Meta" value={`${plan.diffKg > 0 ? "+" : ""}${plan.diffKg.toFixed(1).replace(".", ",")} kg`} />
            <Stat icon={Target} label="Prazo" value={`${plan.weeks} sem`} />
          </div>
          <PlanCurve from={w!} to={t!} weeks={plan.weeks} />
          <p className="text-xs text-muted-foreground">Calculado a partir da sua frequência de treino e da meta que você definiu. Estimativa geral; não substitui orientação profissional.</p>
        </Question>
      );
      break;
    case "commit":
      body = (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
          <span className="flex size-24 items-center justify-center rounded-full bg-primary/15 text-primary"><Flame className="size-12" aria-hidden="true" /></span>
          <h1 className="text-3xl font-bold tracking-tight">Toda transformação começa com uma decisão.</h1>
          <p className="text-lg text-muted-foreground">Você se compromete com a sua?</p>
        </div>
      );
      break;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background">
      <div className="mx-auto flex min-h-full max-w-md flex-col px-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-[calc(env(safe-area-inset-top)+1rem)]">
        {!hideChrome && (
          <div className="mb-8 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={back} disabled={i === 0} aria-label="Voltar" className="-ml-2"><ArrowLeft className="size-5" /></Button>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-elevated" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progresso do questionário">
              <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${pct}%` }} />
            </div>
            <Logo className="hidden sm:flex" />
          </div>
        )}
        <div key={step} className="flex-1 page-enter">{body}</div>
        {touched && errors[step] && <p role="alert" className="mt-3 text-sm text-destructive">{errors[step]}</p>}
        {!hideChrome && !autoAdvance && (
          <Button size="lg" className="mt-8 h-14 w-full rounded-2xl text-base" onClick={step === "commit" ? finish : tryNext}>
            {step === "commit" ? "Sim, eu me comprometo" : step === "plan" ? "Começar meu plano" : "Continuar"}
          </Button>
        )}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Dumbbell; label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-card p-3 text-center">
      <Icon className="mx-auto size-5 text-primary" aria-hidden="true" />
      <div className="mt-1 text-lg font-bold tabular">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function PlanCurve({ from, to, weeks }: { from: number; to: number; weeks: number }) {
  const W = 300, H = 140, pad = 16;
  const hi = Math.max(from, to), lo = Math.min(from, to), range = hi - lo || 1;
  const y = (v: number) => pad + ((hi - v) / range) * (H - pad * 2);
  const pts = Array.from({ length: 21 }, (_, k) => {
    const p = k / 20;
    const eased = 1 - Math.pow(1 - p, 2);
    return `${pad + p * (W - pad * 2)},${y(from + (to - from) * eased)}`;
  });
  return (
    <div className="rounded-2xl border bg-card p-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Curva de ${from} kg para ${to} kg em ${weeks} semanas`}>
        <polyline points={pts.join(" ")} fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
        <circle cx={pad} cy={y(from)} r="5" fill="var(--muted-foreground)" />
        <circle cx={W - pad} cy={y(to)} r="6" fill="var(--primary)" />
      </svg>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>Semana 1 · {String(from).replace(".", ",")} kg</span>
        <span className="font-semibold text-primary">Semana {weeks} · {String(to).replace(".", ",")} kg</span>
      </div>
    </div>
  );
}
