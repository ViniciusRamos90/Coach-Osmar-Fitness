import type { MuscleGroup } from "./types";

export interface PlanRequest {
  studentName: string;
  age: number | null;
  sex: string;
  level: "iniciante" | "intermediario" | "avancado";
  goals: string;
  limitations: string;
  daysPerWeek: number;
  minutesPerSession: number;
  equipment: string;
}

export interface TrainingPlan {
  title: string;
  summary: string;
  weeks: number;
  days: {
    name: string;
    focus: string;
    muscleGroups: MuscleGroup[];
    durationMinutes: number;
    exercises: { name: string; sets: number; reps: string; restSeconds: number; notes: string | null }[];
  }[];
  safetyNotes: string[];
  progression: string;
}

/** Validation for the coach's form; returns field → message. */
export function validatePlanRequest(r: PlanRequest): Record<string, string> {
  const e: Record<string, string> = {};
  if (r.goals.trim().length < 5) e["goals"] = "Descreva os objetivos do aluno (mín. 5 caracteres).";
  if (r.goals.length > 1000) e["goals"] = "Máximo de 1000 caracteres.";
  if (r.limitations.length > 1000) e["limitations"] = "Máximo de 1000 caracteres.";
  if (!Number.isInteger(r.daysPerWeek) || r.daysPerWeek < 1 || r.daysPerWeek > 7) e["daysPerWeek"] = "Entre 1 e 7 dias.";
  if (!Number.isFinite(r.minutesPerSession) || r.minutesPerSession < 20 || r.minutesPerSession > 180) e["minutesPerSession"] = "Entre 20 e 180 minutos.";
  if (r.age !== null && (r.age < 12 || r.age > 100)) e["age"] = "Idade entre 12 e 100 anos.";
  return e;
}
