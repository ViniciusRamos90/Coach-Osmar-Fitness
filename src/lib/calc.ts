import type {
  Attendance,
  BodyMeasurement,
  FinancialTransaction,
  MuscleGroup,
  UserProfile,
  Workout,
} from "./types";
import { MUSCLE_GROUPS, groupLabel } from "./types";
import { addDays, daysBetween, toISODate } from "./format";

/** Monday of the week containing `d` (local time). */
export function startOfWeek(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const offset = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - offset);
  return x;
}

/** Attendance derived from past workouts: completed = presence, not done = absence. Planned/future never count. */
export function deriveAttendance(workouts: Workout[], today: Date = new Date()): Attendance[] {
  const t = toISODate(today);
  return workouts
    .filter((w) => w.date <= t && (w.status === "concluido" || w.status === "nao_realizado"))
    .map((w) => ({
      id: `att-${w.id}`,
      date: w.date,
      status: w.status === "concluido" ? "presente" : "falta",
      workoutId: w.id,
    }));
}

export function weekStats(workouts: Workout[], today: Date = new Date()) {
  const ws = toISODate(startOfWeek(today));
  const t = toISODate(today);
  const att = deriveAttendance(workouts, today).filter((a) => a.date >= ws && a.date <= t);
  const presentDays = new Set(att.filter((a) => a.status === "presente").map((a) => a.date));
  const absentDays = new Set(
    att.filter((a) => a.status === "falta" && !presentDays.has(a.date)).map((a) => a.date),
  );
  const completed = workouts.filter((w) => w.status === "concluido" && w.date >= ws && w.date <= t).length;
  return { present: presentDays.size, absent: absentDays.size, completed };
}

export function sortedMeasurements(ms: BodyMeasurement[]) {
  return [...ms].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/** Latest weight record wins; profile initial weight is only a fallback and is never overwritten. */
export function currentWeight(profile: UserProfile, ms: BodyMeasurement[]): number {
  return latestWeightRecord(ms)?.weightKg ?? profile.initialWeightKg;
}

export function latestWeightRecord(ms: BodyMeasurement[]) {
  return sortedMeasurements(ms).find((m) => m.weightKg != null);
}

export function financialTotals(ts: FinancialTransaction[]) {
  let income = 0;
  let expense = 0;
  for (const t of ts) {
    if (t.type === "entrada") income += t.amount;
    else expense += t.amount;
  }
  income = Math.round(income * 100) / 100;
  expense = Math.round(expense * 100) / 100;
  return { income, expense, balance: Math.round((income - expense) * 100) / 100 };
}

export function inPeriod(dateIso: string, days: number | null, today: Date = new Date()) {
  if (days == null) return true;
  const from = toISODate(addDays(today, -(days - 1)));
  return dateIso >= from && dateIso <= toISODate(today);
}

export function weightSeries(ms: BodyMeasurement[], days: number, today = new Date()) {
  return [...ms]
    .filter((m) => m.weightKg != null && inPeriod(m.date, days, today))
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .map((m) => ({ date: m.date, weight: m.weightKg as number }));
}

export function caloriesSeries(ws: Workout[], days: number, today = new Date()) {
  return ws
    .filter((w) => w.status === "concluido" && w.estimatedCalories != null && inPeriod(w.date, days, today))
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .map((w) => ({ date: w.date, name: w.name, calories: w.estimatedCalories as number }));
}

export function countByGroup(ws: Workout[]) {
  const counts = Object.fromEntries(MUSCLE_GROUPS.map((g) => [g.value, 0])) as Record<MuscleGroup, number>;
  for (const w of ws) for (const g of w.muscleGroups) counts[g]++;
  return counts;
}

export function insights(
  workouts: Workout[],
  ms: BodyMeasurement[],
  today: Date = new Date(),
): string[] {
  const t = toISODate(today);
  const done = workouts.filter((w) => w.status === "concluido" && w.date <= t);
  if (done.length === 0) return [];
  const out: string[] = [];

  const { completed } = weekStats(workouts, today);
  out.push(
    completed > 0
      ? `Você concluiu ${completed} ${completed === 1 ? "treino" : "treinos"} nesta semana. Continue acompanhando sua consistência.`
      : "Nenhum treino concluído nesta semana ainda. Que tal planejar a próxima sessão?",
  );

  const lastW = latestWeightRecord(ms);
  if (!lastW) out.push("Você ainda não registrou seu peso. Adicione uma medição para acompanhar a evolução.");
  else {
    const gap = daysBetween(lastW.date, t);
    if (gap >= 7)
      out.push(`Seu último registro de peso foi há ${gap} dias. Atualize sua medida para acompanhar a evolução.`);
  }

  const recent = done.filter((w) => inPeriod(w.date, 30, today));
  const counts = countByGroup(recent);
  const main: MuscleGroup[] = ["peito", "costas", "pernas", "ombros"];
  const least = main.reduce((a, b) => (counts[b] < counts[a] ? b : a));
  if (recent.length >= 3 && counts[least] < Math.max(...main.map((g) => counts[g])))
    out.push(`O grupo muscular ${groupLabel(least).toLowerCase()} recebeu menos registros nos últimos 30 dias.`);

  if (out.length < 3)
    out.push("Considere respeitar os intervalos de recuperação entre sessões do mesmo grupo muscular.");

  return out.slice(0, 3);
}
