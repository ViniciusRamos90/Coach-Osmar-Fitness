import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import type { AppData, BodyMeasurement, UserProfile, Workout } from "./types";
import { createSeedData } from "@/data/mock";
import { supabase } from "@/integrations/supabase/client";
import * as db from "./db";
import { todayISO } from "./format";

type FormState =
  | { kind: "workout"; initial?: Partial<Workout> }
  | { kind: "measurement"; initial?: BodyMeasurement }
  | null;

interface Store {
  data: AppData;
  /** True once the session is known and (if signed in) the user's data has loaded. */
  hydrated: boolean;
  /** True when there is no authenticated session. */
  signedOut: boolean;
  session: Session | null;
  setSignedOut: (v: boolean) => void;
  addWorkout: (w: Omit<Workout, "id">) => Workout;
  updateWorkout: (w: Workout) => void;
  deleteWorkout: (id: string) => void;
  addMeasurement: (m: Omit<BodyMeasurement, "id">) => void;
  updateMeasurement: (m: BodyMeasurement) => void;
  deleteMeasurement: (id: string) => void;
  updateProfile: (p: Partial<UserProfile>) => void;
  resetData: () => void;
  form: FormState;
  openForm: (f: FormState) => void;
}

const Ctx = createContext<Store | null>(null);

const emptyData = (): AppData => ({
  profile: { id: "", name: "", email: "", heightCm: 0, initialWeightKg: 0, goal: "", startDate: todayISO() },
  workouts: [],
  measurements: [],
});

const newId = () => crypto.randomUUID();

function errorMessage(e: unknown) {
  const msg = e instanceof Error ? e.message : String(e);
  if (/JWT|session|auth/i.test(msg)) return "Sua sessão expirou. Entre novamente.";
  if (/fetch|network/i.test(msg)) return "Sem conexão com o servidor. Verifique sua internet.";
  return "Não foi possível salvar. Tente novamente.";
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(emptyData);
  const [session, setSession] = useState<Session | null>(null);
  const [authKnown, setAuthKnown] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [form, openForm] = useState<FormState>(null);
  const userIdRef = useRef<string | null>(null);

  const reload = useCallback(async (userId: string) => {
    try {
      setData(await db.loadAll(userId));
    } catch (e) {
      toast.error("Não foi possível carregar seus dados.", { description: errorMessage(e) });
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      setAuthKnown(true);
      const uid = s?.user.id ?? null;
      if (uid !== userIdRef.current) {
        userIdRef.current = uid;
        setData(emptyData());
        setLoaded(false);
        openForm(null);
        if (uid) void reload(uid);
      }
      if (event === "SIGNED_OUT") setLoaded(false);
    });
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!s) setAuthKnown(true);
    });
    return () => sub.subscription.unsubscribe();
  }, [reload]);

  /** Apply an optimistic change locally, persist it, and resync from the server on failure. */
  const persist = useCallback(
    (apply: (d: AppData) => AppData, op: () => Promise<void>) => {
      setData(apply);
      op().catch((e) => {
        toast.error(errorMessage(e));
        if (userIdRef.current) void reload(userIdRef.current);
      });
    },
    [reload],
  );

  const addWorkout = useCallback(
    (w: Omit<Workout, "id">) => {
      const created: Workout = { ...w, id: newId(), exercises: w.exercises.map((e) => ({ ...e, id: newId() })) };
      persist((d) => ({ ...d, workouts: [created, ...d.workouts] }), () => db.saveWorkout(created, true));
      return created;
    },
    [persist],
  );

  const value = useMemo<Store>(
    () => ({
      data,
      hydrated: authKnown && (!session || loaded),
      signedOut: authKnown && !session,
      session,
      setSignedOut: (v) => {
        if (v) void supabase.auth.signOut();
      },
      addWorkout,
      updateWorkout: (w) =>
        persist((d) => ({ ...d, workouts: d.workouts.map((x) => (x.id === w.id ? w : x)) }), () => db.saveWorkout(w, false)),
      deleteWorkout: (id) =>
        persist((d) => ({ ...d, workouts: d.workouts.filter((x) => x.id !== id) }), () => db.deleteWorkout(id)),
      addMeasurement: (m) => {
        const created = { ...m, id: newId() };
        persist((d) => ({ ...d, measurements: [created, ...d.measurements] }), () => db.saveMeasurement(created, true));
      },
      updateMeasurement: (m) =>
        persist((d) => ({ ...d, measurements: d.measurements.map((x) => (x.id === m.id ? m : x)) }), () => db.saveMeasurement(m, false)),
      deleteMeasurement: (id) =>
        persist((d) => ({ ...d, measurements: d.measurements.filter((x) => x.id !== id) }), () => db.deleteMeasurement(id)),
      updateProfile: (p) => {
        const next = { ...data.profile, ...p };
        persist((d) => ({ ...d, profile: next }), () => db.saveProfile(next));
      },
      resetData: () => {
        const uid = userIdRef.current;
        if (!uid) return;
        const seed = createSeedData();
        const demo: AppData = {
          profile: data.profile,
          workouts: seed.workouts.map((w) => ({ ...w, id: newId(), exercises: w.exercises.map((e) => ({ ...e, id: newId() })) })),
          measurements: seed.measurements.map((m) => ({ ...m, id: newId() })),
        };
        persist(() => demo, () => db.replaceWithDemo(demo, uid));
      },
      form,
      openForm,
    }),
    [data, authKnown, session, loaded, form, addWorkout, persist],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used inside StoreProvider");
  return s;
}
