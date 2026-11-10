// Modelos locais da Fase 1 (IndexedDB). Sem dados pessoais obrigatórios.
export type LoadUnit = "kg" | "lb";
export type RoutineStatus = "active" | "draft" | "archived";

export const MUSCLES = ["peito", "costas", "ombros", "biceps", "triceps", "quadriceps", "posteriores", "gluteos", "panturrilhas", "abdomen"] as const;
export type Muscle = (typeof MUSCLES)[number];
export const MUSCLE_LABEL: Record<Muscle, string> = {
  peito: "Peito", costas: "Costas", ombros: "Ombros", biceps: "Bíceps", triceps: "Tríceps",
  quadriceps: "Quadríceps", posteriores: "Posteriores", gluteos: "Glúteos", panturrilhas: "Panturrilhas", abdomen: "Abdômen",
};

export const EQUIPMENT = ["peso-corporal", "halteres", "barra", "maquina", "polia", "elastico", "kettlebell"] as const;
export type Equipment = (typeof EQUIPMENT)[number];
export const EQUIPMENT_LABEL: Record<Equipment, string> = {
  "peso-corporal": "Peso corporal", halteres: "Halteres", barra: "Barra", maquina: "Máquina", polia: "Polia", elastico: "Elástico", kettlebell: "Kettlebell",
};

export interface Exercise {
  id: string;
  name: string;
  muscleGroups: Muscle[];
  equipment: Equipment;
  instructions: string[];
  caution: string;
  imageUrl?: string;
  isFavorite: boolean;
}

export interface RoutineExercise {
  id: string;
  exerciseId: string;
  order: number;
  targetSets: number;
  repMin: number;
  repMax: number;
  restSeconds: number;
  note?: string;
}

export interface RoutineSession {
  id: string;
  name: string;
  exercises: RoutineExercise[];
}

export interface Routine {
  id: string;
  name: string;
  status: RoutineStatus;
  order: number;
  createdAt: string;
  updatedAt: string;
  sessions: RoutineSession[];
}

export interface SetLog {
  id: string;
  exerciseId: string;
  setNumber: number;
  reps: number;
  load: number;
  loadUnit: LoadUnit;
  status: "done" | "skipped";
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutSession {
  id: string;
  routineId?: string;
  routineSessionId?: string;
  name: string;
  plan?: { exerciseId: string; targetSets: number; repMin: number; repMax: number; restSeconds: number; note?: string }[];
  startedAt: string;
  endedAt?: string;
  status: "in_progress" | "completed" | "interrupted" | "cancelled";
  setLogs: SetLog[];
}

export interface UserPreferences {
  id: "prefs";
  loadUnit: LoadUnit;
  theme: "light" | "dark" | "system";
  weekStart: "monday" | "sunday";
  defaultRestSeconds: number;
}

export const newId = () => crypto.randomUUID();
