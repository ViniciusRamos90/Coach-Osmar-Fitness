import { describe, expect, it } from "vitest";
import { buildCatalog } from "./catalog";
import { createRoutine, duplicateRoutine, makeRoutineExercise, reorderExercises, sortRoutines, validateRoutine } from "./routines";

describe("rotinas locais", () => {
  it("catálogo tem pelo menos 30 exercícios com ids únicos", () => {
    const c = buildCatalog();
    expect(c.length).toBeGreaterThanOrEqual(30);
    expect(new Set(c.map((e) => e.id)).size).toBe(c.length);
  });

  it("cria rotina como rascunho com uma sessão", () => {
    const r = createRoutine("Força", 0);
    expect(r.status).toBe("draft");
    expect(r.sessions).toHaveLength(1);
  });

  it("duplica com novos ids e mesmo conteúdo", () => {
    const r = createRoutine("Força", 0);
    r.sessions[0]!.exercises.push(makeRoutineExercise("ex-prancha", 0));
    const d = duplicateRoutine(r, 1);
    expect(d.id).not.toBe(r.id);
    expect(d.sessions[0]!.exercises[0]!.exerciseId).toBe("ex-prancha");
    expect(d.sessions[0]!.exercises[0]!.id).not.toBe(r.sessions[0]!.exercises[0]!.id);
  });

  it("reordena exercícios e atualiza order", () => {
    const r = createRoutine("A", 0);
    const s = { ...r.sessions[0]!, exercises: [makeRoutineExercise("a", 0), makeRoutineExercise("b", 1)] };
    const next = reorderExercises(s, 1, 0);
    expect(next.exercises.map((e) => [e.exerciseId, e.order])).toEqual([["b", 0], ["a", 1]]);
  });

  it("rejeita repetição mínima maior que a máxima", () => {
    const r = createRoutine("A", 0);
    r.sessions[0]!.exercises.push({ ...makeRoutineExercise("a", 0), repMin: 12, repMax: 8 });
    expect(validateRoutine(r)).toMatch(/mínima/);
  });

  it("ordena ativas antes de rascunhos e arquivadas", () => {
    const a = { ...createRoutine("x", 0), status: "archived" as const };
    const b = { ...createRoutine("y", 0), status: "active" as const };
    const c = createRoutine("z", 0);
    expect(sortRoutines([a, c, b]).map((r) => r.status)).toEqual(["active", "draft", "archived"]);
  });
});
