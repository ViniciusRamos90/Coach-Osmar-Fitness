import { describe, expect, it } from "vitest";
import { buildPlan, currentWeight, weekStats } from "./calc";
import type { UserProfile, Workout } from "./types";

const profile: UserProfile = { id: "u", name: "T", email: "t@example.com", heightCm: 178, initialWeightKg: 86, goal: "", startDate: "2026-07-01" };

describe("current weight", () => {
  it("follows the most recent measurement and keeps initial weight as fallback", () => {
    expect(currentWeight(profile, [
      { id: "a", date: "2026-09-01", weightKg: 84 },
      { id: "b", date: "2026-10-01", weightKg: 82.5 },
    ])).toBe(82.5);
    expect(currentWeight(profile, [])).toBe(86);
  });
});

describe("week stats", () => {
  const w = (date: string, status: Workout["status"]): Workout => ({ id: date + status, name: "x", date, durationMinutes: 30, muscleGroups: ["cardio"], exercises: [], status });
  it("counts Monday–Sunday and ignores planned or future workouts", () => {
    const today = new Date(2026, 9, 21); // Wed 21/10/2026
    const r = weekStats([
      w("2026-10-18", "concluido"), // previous Sunday
      w("2026-10-19", "concluido"),
      w("2026-10-20", "nao_realizado"),
      w("2026-10-21", "planejado"),
      w("2026-10-23", "concluido"), // future
    ], today);
    expect(r).toEqual({ present: 1, absent: 1, completed: 1 });
  });
});

describe("onboarding plan", () => {
  it("loses 0,5 kg per week and gains 0,25 kg per week, between 4 and 52 weeks", () => {
    expect(buildPlan(70, 65, 4)).toEqual({ diffKg: -5, weeks: 10, workoutsPerWeek: 4 });
    expect(buildPlan(60, 63, 3).weeks).toBe(12);
    expect(buildPlan(70, 69.5, 3).weeks).toBe(4);
    expect(buildPlan(120, 70, 5).weeks).toBe(52);
  });
});
