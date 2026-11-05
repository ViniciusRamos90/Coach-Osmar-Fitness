import { newId, type LoadUnit, type Routine, type SetLog, type WorkoutSession } from "./models";

// Lógica pura da sessão ativa e da tela Hoje (testável, sem IndexedDB).
export function startSession(routine: Routine, sessionIndex: number, now = new Date().toISOString()): WorkoutSession {
  const rs = routine.sessions[sessionIndex]!;
  return {
    id: newId(), routineId: routine.id, routineSessionId: rs.id, name: `${routine.name} · ${rs.name}`,
    startedAt: now, status: "in_progress", setLogs: [],
    plan: [...rs.exercises].sort((a, b) => a.order - b.order).map((e) => ({ exerciseId: e.exerciseId, targetSets: e.targetSets, repMin: e.repMin, repMax: e.repMax, restSeconds: e.restSeconds, note: e.note })),
  };
}

export function logSet(s: WorkoutSession, exerciseId: string, setNumber: number, reps: number, load: number, unit: LoadUnit, status: SetLog["status"] = "done", now = new Date().toISOString()): WorkoutSession {
  const existing = s.setLogs.find((l) => l.exerciseId === exerciseId && l.setNumber === setNumber);
  const log: SetLog = { id: existing?.id ?? newId(), exerciseId, setNumber, reps, load, loadUnit: unit, status, createdAt: existing?.createdAt ?? now, updatedAt: now };
  return { ...s, setLogs: existing ? s.setLogs.map((l) => (l.id === existing.id ? log : l)) : [...s.setLogs, log] };
}

export function skipExercise(s: WorkoutSession, exerciseId: string, unit: LoadUnit): WorkoutSession {
  const p = s.plan?.find((x) => x.exerciseId === exerciseId);
  let next = s;
  for (let n = 1; n <= (p?.targetSets ?? 0); n++) if (!s.setLogs.some((l) => l.exerciseId === exerciseId && l.setNumber === n)) next = logSet(next, exerciseId, n, 0, 0, unit, "skipped");
  return next;
}

/** Volume = soma de carga × repetições das séries concluídas. */
export const volume = (logs: SetLog[]) => logs.reduce((t, l) => (l.status === "done" ? t + l.load * l.reps : t), 0);

/** Próxima sessão: primeira rotina ativa, sessão seguinte à última concluída dela. */
export function nextSession(routines: Routine[], sessions: WorkoutSession[]): { routine: Routine; index: number } | null {
  const routine = [...routines].filter((r) => r.status === "active" && r.sessions.some((s) => s.exercises.length)).sort((a, b) => a.order - b.order)[0];
  if (!routine) return null;
  const last = sessions.filter((s) => s.status === "completed" && s.routineId === routine.id).sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];
  const lastIdx = last ? routine.sessions.findIndex((s) => s.id === last.routineSessionId) : -1;
  for (let i = 1; i <= routine.sessions.length; i++) {
    const idx = (lastIdx + i) % routine.sessions.length;
    if (routine.sessions[idx]!.exercises.length) return { routine, index: idx };
  }
  return null;
}

export function weekStart(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}

/** Semana segunda–domingo: dias treinados, sessões concluídas, séries e volume reais. */
export function weekSummary(sessions: WorkoutSession[], now = new Date()) {
  const start = weekStart(now);
  const end = new Date(start); end.setDate(end.getDate() + 7);
  const done = sessions.filter((s) => s.status === "completed" && new Date(s.startedAt) >= start && new Date(s.startedAt) < end);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start); d.setDate(d.getDate() + i);
    return { date: d, trained: done.some((s) => new Date(s.startedAt).toDateString() === d.toDateString()) };
  });
  const logs = done.flatMap((s) => s.setLogs);
  return { days, completed: done.length, sets: logs.filter((l) => l.status === "done").length, volume: volume(logs) };
}

export const formatClock = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.max(0, sec) % 60).padStart(2, "0")}`;
