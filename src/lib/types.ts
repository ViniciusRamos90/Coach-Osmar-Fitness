export type MuscleGroup =
  | "peito"
  | "costas"
  | "pernas"
  | "ombros"
  | "biceps"
  | "triceps"
  | "abdomen"
  | "cardio"
  | "corpo_inteiro";

export const MUSCLE_GROUPS: { value: MuscleGroup; label: string }[] = [
  { value: "peito", label: "Peito" },
  { value: "costas", label: "Costas" },
  { value: "pernas", label: "Pernas" },
  { value: "ombros", label: "Ombros" },
  { value: "biceps", label: "Bíceps" },
  { value: "triceps", label: "Tríceps" },
  { value: "abdomen", label: "Abdômen" },
  { value: "cardio", label: "Cardio" },
  { value: "corpo_inteiro", label: "Corpo inteiro" },
];

export const groupLabel = (g: MuscleGroup) =>
  MUSCLE_GROUPS.find((m) => m.value === g)?.label ?? g;

export type WorkoutStatus = "concluido" | "nao_realizado" | "planejado";
export const STATUS_LABEL: Record<WorkoutStatus, string> = {
  concluido: "Concluído",
  nao_realizado: "Não realizado",
  planejado: "Planejado",
};

export type Difficulty = "iniciante" | "intermediario" | "avancado";
export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  heightCm: number;
  initialWeightKg: number;
  goal: string;
  startDate: string; // YYYY-MM-DD
}

export interface WorkoutExercise {
  id: string;
  exerciseId?: string;
  name: string;
  sets: number;
  reps: number;
  loadKg?: number;
}

export interface Workout {
  id: string;
  name: string;
  date: string;
  startTime?: string;
  durationMinutes: number;
  muscleGroups: MuscleGroup[];
  exercises: WorkoutExercise[];
  estimatedCalories?: number;
  status: WorkoutStatus;
  notes?: string;
}

export interface BodyMeasurement {
  id: string;
  date: string;
  weightKg?: number;
  waistCm?: number;
  abdomenCm?: number;
  chestCm?: number;
  hipCm?: number;
  armCm?: number;
  thighCm?: number;
  notes?: string;
}

export type TransactionType = "entrada" | "saida";
export const TRANSACTION_CATEGORIES = [
  "Mensalidade recebida",
  "Consultoria",
  "Equipamentos",
  "Academia",
  "Suplementação",
  "Transporte",
  "Outros",
] as const;
export type TransactionCategory = (typeof TRANSACTION_CATEGORIES)[number];

export interface FinancialTransaction {
  id: string;
  type: TransactionType;
  description: string;
  category: TransactionCategory;
  amount: number; // always positive; sign comes from type
  date: string;
  notes?: string;
}

export type ExerciseType = "Força" | "Cardio" | "Mobilidade" | "Isométrico";

export interface Exercise {
  id: string;
  name: string;
  primaryMuscleGroup: MuscleGroup;
  secondaryMuscleGroups: MuscleGroup[];
  type: ExerciseType;
  equipment: string;
  difficulty: Difficulty;
  instructions: string;
  suggestedSets?: number;
  suggestedReps?: string;
}

export interface Attendance {
  id: string;
  date: string;
  status: "presente" | "falta";
  workoutId?: string;
}

export type SuggestionCategory =
  | "Força"
  | "Hipertrofia"
  | "Resistência"
  | "Mobilidade"
  | "Cardio"
  | "Corpo inteiro";

export interface SuggestedWorkout {
  id: string;
  name: string;
  description: string;
  category: SuggestionCategory;
  difficulty: Difficulty;
  durationMinutes: number;
  muscleGroups: MuscleGroup[];
  estimatedCalories: number;
  exercises: { exerciseId: string; sets: number; reps: number }[];
}

export interface AppData {
  profile: UserProfile;
  workouts: Workout[];
  measurements: BodyMeasurement[];
  transactions: FinancialTransaction[];
}

export const MEASUREMENT_FIELDS: { key: keyof BodyMeasurement; label: string; unit: string }[] = [
  { key: "weightKg", label: "Peso", unit: "kg" },
  { key: "waistCm", label: "Cintura", unit: "cm" },
  { key: "abdomenCm", label: "Abdômen", unit: "cm" },
  { key: "chestCm", label: "Peito", unit: "cm" },
  { key: "hipCm", label: "Quadril", unit: "cm" },
  { key: "armCm", label: "Braço", unit: "cm" },
  { key: "thighCm", label: "Coxa", unit: "cm" },
];
