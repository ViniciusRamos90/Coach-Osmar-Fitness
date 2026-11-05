import { describe, expect, it } from "vitest";
import { createRoutine, makeRoutineExercise } from "./routines";
import { logSet, nextSession, skipExercise, startSession, volume, weekSummary } from "./session";

const routine = () => {
  const r = { ...createRoutine("ABC", 0), status: "active" as const };
  r.sessions = [
    { id: "a", name: "A", exercises: [makeRoutineExercise("supino", 0)] },
    { id: "b", name: "B", exercises: [makeRoutineExercise("remada", 0)] },
  ];
  return r;
};

describe("sessão ativa", () => {
  it("volume soma carga × reps só das séries concluídas", () => {
    let s = startSession(routine(), 0);
    s = logSet(s, "supino", 1, 10, 40, "kg");
    s = logSet(s, "supino", 2, 8, 50, "kg");
    s = logSet(s, "supino", 2, 8, 45, "kg"); // edição substitui
    s = skipExercise(s, "supino", "kg");
    expect(s.setLogs).toHaveLength(3);
    expect(volume(s.setLogs)).toBe(400 + 360);
  });
  it("próxima sessão alterna após concluir A", () => {
    const r = routine();
    expect(nextSession([r], [])?.index).toBe(0);
    const done = { ...startSession(r, 0), status: "completed" as const };
    expect(nextSession([r], [done])?.index).toBe(1);
  });
  it("semana segunda a domingo conta só sessões concluídas", () => {
    const r = routine();
    const mon = { ...startSession(r, 0, "2026-11-02T10:00:00"), status: "completed" as const };
    const prevSun = { ...startSession(r, 0, "2026-11-01T10:00:00"), status: "completed" as const };
    const open = startSession(r, 0, "2026-11-03T10:00:00");
    const w = weekSummary([mon, prevSun, open], new Date("2026-11-05T12:00:00"));
    expect(w.completed).toBe(1);
    expect(w.days[0]!.trained).toBe(true);
    expect(w.days[1]!.trained).toBe(false);
  });
});
