// Single data-access layer between the app types and Lovable Cloud tables.
import { supabase } from "@/integrations/supabase/client";
import type { AppData, BodyMeasurement, FinancialTransaction, MuscleGroup, UserProfile, Workout, WorkoutStatus, TransactionCategory } from "./types";

const num = (v: unknown) => (v === null || v === undefined ? undefined : Number(v));
const opt = <T,>(v: T | null | undefined) => (v === null ? undefined : v);
const toCents = (amount: number) => Math.round(amount * 100);

function check<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

export async function loadAll(userId: string): Promise<AppData> {
  const [p, w, m, t] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("workouts").select("*, workout_exercises(*)").order("workout_date", { ascending: false }),
    supabase.from("body_measurements").select("*").order("measured_on", { ascending: false }),
    supabase.from("financial_transactions").select("*").order("transaction_date", { ascending: false }),
  ]);
  const prof = check(p);
  const profile: UserProfile = {
    id: userId,
    name: prof?.name ?? "",
    email: prof?.email ?? "",
    heightCm: num(prof?.height_cm) ?? 0,
    initialWeightKg: num(prof?.initial_weight_kg) ?? 0,
    goal: prof?.goal ?? "",
    startDate: prof?.start_date ?? new Date().toISOString().slice(0, 10),
  };
  const workouts: Workout[] = check(w).map((r) => ({
    id: r.id,
    name: r.name,
    date: r.workout_date,
    startTime: opt(r.start_time),
    durationMinutes: r.duration_minutes,
    muscleGroups: r.muscle_groups as MuscleGroup[],
    estimatedCalories: opt(r.estimated_calories),
    status: r.status as WorkoutStatus,
    notes: opt(r.notes),
    exercises: [...(r.workout_exercises ?? [])]
      .sort((a, b) => a.position - b.position)
      .map((e) => ({ id: e.id, exerciseId: opt(e.exercise_ref), name: e.name, sets: e.sets, reps: e.reps, loadKg: num(e.load_kg) })),
  }));
  const measurements: BodyMeasurement[] = check(m).map((r) => ({
    id: r.id, date: r.measured_on, notes: opt(r.notes),
    weightKg: num(r.weight_kg), waistCm: num(r.waist_cm), abdomenCm: num(r.abdomen_cm), chestCm: num(r.chest_cm),
    hipCm: num(r.hip_cm), armCm: num(r.arm_cm), thighCm: num(r.thigh_cm),
  }));
  const transactions: FinancialTransaction[] = check(t).map((r) => ({
    id: r.id, type: r.type as FinancialTransaction["type"], description: r.description,
    category: (r.category ?? "Outros") as TransactionCategory, amount: Number(r.amount_cents) / 100,
    date: r.transaction_date, notes: opt(r.notes),
  }));
  return { profile, workouts, measurements, transactions };
}

const workoutRow = (w: Workout) => ({
  id: w.id, name: w.name.trim(), workout_date: w.date, start_time: w.startTime ?? null,
  duration_minutes: w.durationMinutes, muscle_groups: w.muscleGroups, estimated_calories: w.estimatedCalories ?? null,
  status: w.status, notes: w.notes ?? null,
});

export async function saveWorkout(w: Workout, isNew: boolean) {
  if (isNew) check(await supabase.from("workouts").insert(workoutRow(w)));
  else check(await supabase.from("workouts").update(workoutRow(w)).eq("id", w.id));
  // Exercises are replaced as a set so order/edits/removals stay consistent.
  if (!isNew) check(await supabase.from("workout_exercises").delete().eq("workout_id", w.id));
  if (w.exercises.length) {
    check(await supabase.from("workout_exercises").insert(
      w.exercises.map((e, i) => ({
        workout_id: w.id, exercise_ref: e.exerciseId ?? null, name: e.name, sets: e.sets, reps: e.reps,
        load_kg: e.loadKg ?? null, position: i,
      })),
    ));
  }
}
export async function deleteWorkout(id: string) {
  check(await supabase.from("workouts").delete().eq("id", id));
}

const measurementRow = (m: BodyMeasurement) => ({
  id: m.id, measured_on: m.date, notes: m.notes ?? null,
  weight_kg: m.weightKg ?? null, waist_cm: m.waistCm ?? null, abdomen_cm: m.abdomenCm ?? null, chest_cm: m.chestCm ?? null,
  hip_cm: m.hipCm ?? null, arm_cm: m.armCm ?? null, thigh_cm: m.thighCm ?? null,
});
export async function saveMeasurement(m: BodyMeasurement, isNew: boolean) {
  if (isNew) check(await supabase.from("body_measurements").insert(measurementRow(m)));
  else check(await supabase.from("body_measurements").update(measurementRow(m)).eq("id", m.id));
}
export async function deleteMeasurement(id: string) {
  check(await supabase.from("body_measurements").delete().eq("id", id));
}

const txRow = (t: FinancialTransaction) => ({
  id: t.id, type: t.type, description: t.description.trim(), amount_cents: toCents(t.amount),
  transaction_date: t.date, category: t.category, notes: t.notes ?? null,
});
export async function saveTransaction(t: FinancialTransaction, isNew: boolean) {
  if (isNew) check(await supabase.from("financial_transactions").insert(txRow(t)));
  else check(await supabase.from("financial_transactions").update(txRow(t)).eq("id", t.id));
}
export async function deleteTransaction(id: string) {
  check(await supabase.from("financial_transactions").delete().eq("id", id));
}

export async function saveProfile(p: UserProfile) {
  check(await supabase.from("profiles").update({
    name: p.name, email: p.email, height_cm: p.heightCm || null, initial_weight_kg: p.initialWeightKg || null,
    goal: p.goal, start_date: p.startDate,
  }).eq("id", p.id));
}

/** Replaces all of the signed-in user's records with the demo set (explicit user action only). */
export async function replaceWithDemo(demo: AppData, userId: string) {
  check(await supabase.from("workouts").delete().eq("coach_id", userId));
  check(await supabase.from("body_measurements").delete().eq("coach_id", userId));
  check(await supabase.from("financial_transactions").delete().eq("coach_id", userId));
  for (const w of demo.workouts) await saveWorkout(w, true);
  if (demo.measurements.length) check(await supabase.from("body_measurements").insert(demo.measurements.map(measurementRow)));
  if (demo.transactions.length) check(await supabase.from("financial_transactions").insert(demo.transactions.map(txRow)));
}
