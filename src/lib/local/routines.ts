import { newId, type Routine, type RoutineExercise, type RoutineSession, type RoutineStatus } from "./models";

// Lógica pura de rotinas (testável, sem IndexedDB).
export function createRoutine(name: string, order: number, now = new Date().toISOString()): Routine {
  return { id: newId(), name: name.trim() || "Nova rotina", status: "draft", order, createdAt: now, updatedAt: now, sessions: [{ id: newId(), name: "Sessão A", exercises: [] }] };
}

export function duplicateRoutine(r: Routine, order: number, now = new Date().toISOString()): Routine {
  return {
    ...r, id: newId(), name: `${r.name} (cópia)`, status: "draft", order, createdAt: now, updatedAt: now,
    sessions: r.sessions.map((s) => ({ ...s, id: newId(), exercises: s.exercises.map((e) => ({ ...e, id: newId() })) })),
  };
}

export function makeRoutineExercise(exerciseId: string, order: number, restSeconds = 90): RoutineExercise {
  return { id: newId(), exerciseId, order, targetSets: 3, repMin: 8, repMax: 12, restSeconds };
}

export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length || from === to) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item!);
  return next;
}

export function reorderExercises(s: RoutineSession, from: number, to: number): RoutineSession {
  return { ...s, exercises: moveItem(s.exercises, from, to).map((e, i) => ({ ...e, order: i })) };
}

export function validateRoutineExercise(e: RoutineExercise): string | null {
  if (!Number.isInteger(e.targetSets) || e.targetSets < 1 || e.targetSets > 20) return "Séries devem ficar entre 1 e 20.";
  if (!Number.isInteger(e.repMin) || !Number.isInteger(e.repMax) || e.repMin < 1 || e.repMax > 100) return "Repetições devem ficar entre 1 e 100.";
  if (e.repMin > e.repMax) return "Repetição mínima não pode passar da máxima.";
  if (!Number.isInteger(e.restSeconds) || e.restSeconds < 0 || e.restSeconds > 900) return "Descanso deve ficar entre 0 e 900 segundos.";
  return null;
}

export function validateRoutine(r: Routine): string | null {
  if (!r.name.trim()) return "Dê um nome à rotina.";
  if (r.sessions.length === 0) return "A rotina precisa de pelo menos uma sessão.";
  for (const s of r.sessions) {
    if (!s.name.trim()) return "Toda sessão precisa de um nome.";
    for (const e of s.exercises) { const err = validateRoutineExercise(e); if (err) return `${s.name}: ${err}`; }
  }
  return null;
}

export const STATUS_ORDER: RoutineStatus[] = ["active", "draft", "archived"];
export const STATUS_LABEL: Record<RoutineStatus, string> = { active: "Ativas", draft: "Rascunhos", archived: "Arquivadas" };

export function sortRoutines(list: Routine[]): Routine[] {
  return [...list].sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) || a.order - b.order);
}

export const exerciseCount = (r: Routine) => r.sessions.reduce((n, s) => n + s.exercises.length, 0);
