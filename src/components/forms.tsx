import { useEffect, useState, type FormEvent, type SelectHTMLAttributes } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import { EXERCISES } from "@/data/mock";
import {
  MEASUREMENT_FIELDS,
  MUSCLE_GROUPS,
  STATUS_LABEL,
  TRANSACTION_CATEGORIES,
  type BodyMeasurement,
  type FinancialTransaction,
  type MuscleGroup,
  type TransactionCategory,
  type TransactionType,
  type Workout,
  type WorkoutStatus,
} from "@/lib/types";
import { parseNum, todayISO, uid } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Chip, Field } from "./common";

export function NativeSelect({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    />
  );
}

type Errors = Record<string, string>;

/* ---------------- Workout ---------------- */

interface ExRow { id: string; exerciseId?: string; name: string; sets: string; reps: string; loadKg: string }

function WorkoutForm({ initial, onClose }: { initial?: Partial<Workout>; onClose: () => void }) {
  const { addWorkout, updateWorkout } = useStore();
  const editing = !!initial?.id;
  const [name, setName] = useState(initial?.name ?? "");
  const [date, setDate] = useState(initial?.date ?? todayISO());
  const [startTime, setStartTime] = useState(initial?.startTime ?? "");
  const [duration, setDuration] = useState(initial?.durationMinutes != null ? String(initial.durationMinutes) : "");
  const [groups, setGroups] = useState<MuscleGroup[]>(initial?.muscleGroups ?? []);
  const [calories, setCalories] = useState(initial?.estimatedCalories != null ? String(initial.estimatedCalories) : "");
  const [status, setStatus] = useState<WorkoutStatus>(initial?.status ?? "concluido");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [rows, setRows] = useState<ExRow[]>(
    (initial?.exercises ?? []).map((e) => ({ id: e.id, exerciseId: e.exerciseId, name: e.name, sets: String(e.sets), reps: String(e.reps), loadKg: e.loadKg != null ? String(e.loadKg) : "" })),
  );
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  const updateRow = (id: string, patch: Partial<ExRow>) => setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  function validate(): Errors {
    const e: Errors = {};
    if (!name.trim()) e.name = "Informe o nome do treino.";
    if (!date) e.date = "Informe a data.";
    const d = parseNum(duration);
    if (d === undefined && status === "concluido") e.duration = "Informe a duração.";
    else if (d !== undefined && (!Number.isFinite(d) || d < 0 || !Number.isInteger(d))) e.duration = "Use um número inteiro de minutos.";
    else if (status === "concluido" && (d ?? 0) <= 0) e.duration = "A duração deve ser maior que zero para treinos concluídos.";
    else if (d !== undefined && d > 600) e.duration = "Duração máxima de 600 minutos.";
    if (groups.length === 0) e.groups = "Selecione ao menos um grupo muscular.";
    const c = parseNum(calories);
    if (c !== undefined && (!Number.isFinite(c) || c < 0)) e.calories = "Calorias devem ser um número positivo.";
    rows.forEach((r) => {
      const s = Number(r.sets), rp = Number(r.reps), l = parseNum(r.loadKg);
      if (!r.name.trim() || !Number.isInteger(s) || s <= 0 || !Number.isInteger(rp) || rp <= 0 || (l !== undefined && (!Number.isFinite(l) || l < 0)))
        e.exercises = "Cada exercício precisa de nome, séries e repetições válidas (carga opcional, não negativa).";
    });
    return e;
  }

  function submit(ev: FormEvent) {
    ev.preventDefault();
    if (saving) return;
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      toast.error("Revise os campos destacados.");
      return;
    }
    setSaving(true);
    const payload: Omit<Workout, "id"> = {
      name: name.trim(),
      date,
      startTime: startTime || undefined,
      durationMinutes: parseNum(duration) ?? 0,
      muscleGroups: groups,
      estimatedCalories: parseNum(calories),
      status,
      notes: notes.trim() || undefined,
      exercises: rows.map((r) => ({ id: r.id, exerciseId: EXERCISES.find((x) => x.name === r.name.trim())?.id, name: r.name.trim(), sets: Number(r.sets), reps: Number(r.reps), loadKg: parseNum(r.loadKg) })),
    };
    if (editing) {
      updateWorkout({ ...(initial as Workout), ...payload });
      toast.success("Treino atualizado.");
    } else {
      addWorkout(payload);
      toast.success("Treino registrado com sucesso.");
    }
    onClose();
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Field id="w-name" label="Nome do treino" error={errors.name}>
        <Input id="w-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Peito e tríceps" aria-invalid={!!errors.name} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field id="w-date" label="Data" error={errors.date}>
          <Input id="w-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-invalid={!!errors.date} />
        </Field>
        <Field id="w-time" label="Início (opcional)">
          <Input id="w-time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        </Field>
        <Field id="w-dur" label="Duração (min)" error={errors.duration}>
          <Input id="w-dur" inputMode="numeric" value={duration} onChange={(e) => setDuration(e.target.value)} aria-invalid={!!errors.duration} />
        </Field>
        <Field id="w-cal" label="Calorias (opcional)" error={errors.calories}>
          <Input id="w-cal" inputMode="numeric" value={calories} onChange={(e) => setCalories(e.target.value)} placeholder="kcal" aria-invalid={!!errors.calories} />
        </Field>
      </div>
      <Field id="w-status" label="Status">
        <NativeSelect id="w-status" value={status} onChange={(e) => setStatus(e.target.value as WorkoutStatus)}>
          {Object.entries(STATUS_LABEL).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </NativeSelect>
      </Field>
      <div className="space-y-1.5">
        <span className="text-sm font-medium">Grupo muscular</span>
        <div className="flex flex-wrap gap-2">
          {MUSCLE_GROUPS.map((g) => (
            <Chip key={g.value} active={groups.includes(g.value)} onClick={() => setGroups((s) => (s.includes(g.value) ? s.filter((x) => x !== g.value) : [...s, g.value]))}>
              {g.label}
            </Chip>
          ))}
        </div>
        {errors.groups && <p className="text-xs text-destructive" role="alert">{errors.groups}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Exercícios realizados</span>
          <Button type="button" variant="outline" size="sm" onClick={() => setRows((r) => [...r, { id: uid("we"), name: "", sets: "3", reps: "10", loadKg: "" }])}>
            <Plus className="size-4" /> Adicionar
          </Button>
        </div>
        <datalist id="exercise-catalog">
          {EXERCISES.map((e) => <option key={e.id} value={e.name} />)}
        </datalist>
        {rows.length === 0 && <p className="text-xs text-muted-foreground">Nenhum exercício adicionado. Escolha do catálogo ou digite manualmente.</p>}
        {rows.map((r, i) => (
          <div key={r.id} className="grid grid-cols-[1fr_auto] gap-2 rounded-lg border bg-surface p-2">
            <Input aria-label={`Exercício ${i + 1}`} list="exercise-catalog" value={r.name} onChange={(e) => updateRow(r.id, { name: e.target.value })} placeholder="Nome do exercício" />
            <Button type="button" variant="ghost" size="icon" aria-label={`Remover exercício ${i + 1}`} onClick={() => setRows((s) => s.filter((x) => x.id !== r.id))}>
              <Trash2 className="size-4" />
            </Button>
            <div className="col-span-2 grid grid-cols-3 gap-2">
              <Input aria-label="Séries" inputMode="numeric" value={r.sets} onChange={(e) => updateRow(r.id, { sets: e.target.value })} placeholder="Séries" />
              <Input aria-label="Repetições" inputMode="numeric" value={r.reps} onChange={(e) => updateRow(r.id, { reps: e.target.value })} placeholder="Reps" />
              <Input aria-label="Carga em kg (opcional)" inputMode="decimal" value={r.loadKg} onChange={(e) => updateRow(r.id, { loadKg: e.target.value })} placeholder="Carga kg" />
            </div>
          </div>
        ))}
        {errors.exercises && <p className="text-xs text-destructive" role="alert">{errors.exercises}</p>}
      </div>

      <Field id="w-notes" label="Observações (opcional)">
        <Textarea id="w-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      </Field>
      <DialogFooter className="gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit" disabled={saving}>{editing ? "Salvar alterações" : "Registrar treino"}</Button>
      </DialogFooter>
    </form>
  );
}

/* ---------------- Measurement ---------------- */

function MeasurementForm({ initial, onClose }: { initial?: BodyMeasurement; onClose: () => void }) {
  const { addMeasurement, updateMeasurement } = useStore();
  const [date, setDate] = useState(initial?.date ?? todayISO());
  const [vals, setVals] = useState<Record<string, string>>(() =>
    Object.fromEntries(MEASUREMENT_FIELDS.map((f) => [f.key, initial?.[f.key] != null ? String(initial[f.key]) : ""])),
  );
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  function submit(ev: FormEvent) {
    ev.preventDefault();
    if (saving) return;
    const e: Errors = {};
    if (!date) e.date = "Informe a data da medição.";
    const parsed: Record<string, number | undefined> = {};
    for (const f of MEASUREMENT_FIELDS) {
      const n = parseNum(vals[f.key]);
      if (n !== undefined && (!Number.isFinite(n) || n <= 0 || n > 400)) e[f.key] = "Valor inválido.";
      parsed[f.key] = n;
    }
    if (Object.values(parsed).every((v) => v === undefined)) e.form = "Preencha pelo menos uma medida.";
    setErrors(e);
    if (Object.keys(e).length) {
      toast.error(e.form ?? "Revise os campos destacados.");
      return;
    }
    setSaving(true);
    const payload = { date, ...parsed, notes: notes.trim() || undefined } as Omit<BodyMeasurement, "id">;
    if (initial) updateMeasurement({ ...initial, ...payload });
    else addMeasurement(payload);
    toast.success("Medidas atualizadas.");
    onClose();
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Field id="m-date" label="Data da medição" error={errors.date}>
        <Input id="m-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        {MEASUREMENT_FIELDS.map((f) => (
          <Field key={f.key} id={`m-${f.key}`} label={`${f.label} (${f.unit})`} error={errors[f.key]}>
            <Input id={`m-${f.key}`} inputMode="decimal" value={vals[f.key]} onChange={(e) => setVals((v) => ({ ...v, [f.key]: e.target.value }))} aria-invalid={!!errors[f.key]} />
          </Field>
        ))}
      </div>
      {errors.form && <p className="text-xs text-destructive" role="alert">{errors.form}</p>}
      <p className="text-xs text-muted-foreground">Todas as medidas são opcionais, mas ao menos uma deve ser preenchida. A altura é editada no perfil.</p>
      <Field id="m-notes" label="Observações (opcional)">
        <Textarea id="m-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      </Field>
      <DialogFooter className="gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit" disabled={saving}>Salvar medidas</Button>
      </DialogFooter>
    </form>
  );
}

/* ---------------- Transaction ---------------- */

function TransactionForm({ initial, onClose }: { initial?: FinancialTransaction; onClose: () => void }) {
  const { addTransaction, updateTransaction } = useStore();
  const [type, setType] = useState<TransactionType>(initial?.type ?? "saida");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState<TransactionCategory>(initial?.category ?? "Academia");
  const [amount, setAmount] = useState(initial ? String(initial.amount).replace(".", ",") : "");
  const [date, setDate] = useState(initial?.date ?? todayISO());
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  function submit(ev: FormEvent) {
    ev.preventDefault();
    if (saving) return;
    const e: Errors = {};
    if (!description.trim()) e.description = "Informe uma descrição.";
    const a = parseNum(amount);
    if (a === undefined || !Number.isFinite(a) || a <= 0) e.amount = "O valor deve ser maior que zero.";
    if (!date) e.date = "Informe a data.";
    setErrors(e);
    if (Object.keys(e).length) {
      toast.error("Revise os campos destacados.");
      return;
    }
    setSaving(true);
    const payload = { type, description: description.trim(), category, amount: Math.round((a as number) * 100) / 100, date, notes: notes.trim() || undefined };
    if (initial) {
      updateTransaction({ ...initial, ...payload });
      toast.success("Movimentação atualizada.");
    } else {
      addTransaction(payload);
      toast.success("Movimentação adicionada.");
    }
    onClose();
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div role="radiogroup" aria-label="Tipo de movimentação" className="grid grid-cols-2 gap-2">
        {(["entrada", "saida"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={type === t}
            onClick={() => setType(t)}
            className={cn(
              "h-10 rounded-md border text-sm font-medium transition-colors duration-150",
              type === t ? (t === "entrada" ? "border-success bg-success/15 text-success" : "border-destructive bg-destructive/15 text-destructive") : "bg-surface text-muted-foreground hover:text-foreground",
            )}
          >
            {t === "entrada" ? "↑ Entrada" : "↓ Saída"}
          </button>
        ))}
      </div>
      <Field id="t-desc" label="Descrição" error={errors.description}>
        <Input id="t-desc" value={description} onChange={(e) => setDescription(e.target.value)} aria-invalid={!!errors.description} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field id="t-cat" label="Categoria">
          <NativeSelect id="t-cat" value={category} onChange={(e) => setCategory(e.target.value as TransactionCategory)}>
            {TRANSACTION_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </NativeSelect>
        </Field>
        <Field id="t-amount" label="Valor (R$)" error={errors.amount}>
          <Input id="t-amount" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="150,00" aria-invalid={!!errors.amount} />
        </Field>
      </div>
      <Field id="t-date" label="Data" error={errors.date}>
        <Input id="t-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </Field>
      <Field id="t-notes" label="Observações (opcional)">
        <Textarea id="t-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      </Field>
      <DialogFooter className="gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit" disabled={saving}>Salvar</Button>
      </DialogFooter>
    </form>
  );
}

/** Renders whichever global form is open in the store. */
export function FormHost() {
  const { form, openForm } = useStore();
  const [key, setKey] = useState(0);
  useEffect(() => {
    if (form) setKey((k) => k + 1);
  }, [form]);
  const close = () => openForm(null);
  const meta = !form
    ? null
    : form.kind === "workout"
      ? { title: form.initial?.id ? "Editar treino" : "Registrar treino", desc: "Preencha os dados da sessão." }
      : form.kind === "measurement"
        ? { title: form.initial ? "Editar medidas" : "Registrar medidas", desc: "Peso e medidas corporais com data." }
        : { title: form.initial ? "Editar movimentação" : "Nova movimentação", desc: "Entrada ou saída financeira." };

  return (
    <Dialog open={!!form} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        {meta && (
          <DialogHeader>
            <DialogTitle>{meta.title}</DialogTitle>
            <DialogDescription>{meta.desc}</DialogDescription>
          </DialogHeader>
        )}
        {form?.kind === "workout" && <WorkoutForm key={key} initial={form.initial} onClose={close} />}
        {form?.kind === "measurement" && <MeasurementForm key={key} initial={form.initial} onClose={close} />}
        {form?.kind === "transaction" && <TransactionForm key={key} initial={form.initial} onClose={close} />}
      </DialogContent>
    </Dialog>
  );
}
