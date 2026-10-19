import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AppData, BodyMeasurement, FinancialTransaction, UserProfile, Workout } from "./types";
import { createSeedData } from "@/data/mock";
import { uid } from "./format";

const STORAGE_KEY = "coach-osmar:v1";

type FormState =
  | { kind: "workout"; initial?: Partial<Workout> }
  | { kind: "measurement"; initial?: BodyMeasurement }
  | { kind: "transaction"; initial?: FinancialTransaction }
  | null;

interface Store {
  data: AppData;
  hydrated: boolean;
  signedOut: boolean;
  setSignedOut: (v: boolean) => void;
  addWorkout: (w: Omit<Workout, "id">) => Workout;
  updateWorkout: (w: Workout) => void;
  deleteWorkout: (id: string) => void;
  addMeasurement: (m: Omit<BodyMeasurement, "id">) => void;
  updateMeasurement: (m: BodyMeasurement) => void;
  deleteMeasurement: (id: string) => void;
  addTransaction: (t: Omit<FinancialTransaction, "id">) => void;
  updateTransaction: (t: FinancialTransaction) => void;
  deleteTransaction: (id: string) => void;
  updateProfile: (p: Partial<UserProfile>) => void;
  resetData: () => void;
  form: FormState;
  openForm: (f: FormState) => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => createSeedData());
  const [hydrated, setHydrated] = useState(false);
  const [signedOut, setSignedOut] = useState(false);
  const [form, openForm] = useState<FormState>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { data: AppData; signedOut?: boolean };
        if (parsed.data?.profile) setData(parsed.data);
        setSignedOut(!!parsed.signedOut);
      } else {
        setData(createSeedData());
      }
    } catch {
      /* corrupted local data: keep demo seed */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, signedOut }));
  }, [data, signedOut, hydrated]);

  const addWorkout = useCallback((w: Omit<Workout, "id">) => {
    const created = { ...w, id: uid("w") };
    setData((d) => ({ ...d, workouts: [created, ...d.workouts] }));
    return created;
  }, []);

  const value = useMemo<Store>(
    () => ({
      data,
      hydrated,
      signedOut,
      setSignedOut,
      addWorkout,
      updateWorkout: (w) => setData((d) => ({ ...d, workouts: d.workouts.map((x) => (x.id === w.id ? w : x)) })),
      deleteWorkout: (id) => setData((d) => ({ ...d, workouts: d.workouts.filter((x) => x.id !== id) })),
      addMeasurement: (m) => setData((d) => ({ ...d, measurements: [{ ...m, id: uid("m") }, ...d.measurements] })),
      updateMeasurement: (m) => setData((d) => ({ ...d, measurements: d.measurements.map((x) => (x.id === m.id ? m : x)) })),
      deleteMeasurement: (id) => setData((d) => ({ ...d, measurements: d.measurements.filter((x) => x.id !== id) })),
      addTransaction: (t) => setData((d) => ({ ...d, transactions: [{ ...t, id: uid("t") }, ...d.transactions] })),
      updateTransaction: (t) => setData((d) => ({ ...d, transactions: d.transactions.map((x) => (x.id === t.id ? t : x)) })),
      deleteTransaction: (id) => setData((d) => ({ ...d, transactions: d.transactions.filter((x) => x.id !== id) })),
      updateProfile: (p) => setData((d) => ({ ...d, profile: { ...d.profile, ...p } })),
      resetData: () => setData(createSeedData()),
      form,
      openForm,
    }),
    [data, hydrated, signedOut, form, addWorkout],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used inside StoreProvider");
  return s;
}
