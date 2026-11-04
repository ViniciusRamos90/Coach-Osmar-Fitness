import Dexie, { type Table } from "dexie";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";
import { buildCatalog } from "./catalog";
import type { Exercise, Routine, UserPreferences, WorkoutSession } from "./models";

// IndexedDB é a fonte local de verdade da Fase 1. Interfaces simples para futura sincronização.
class LocalDB extends Dexie {
  exercises!: Table<Exercise, string>;
  routines!: Table<Routine, string>;
  sessions!: Table<WorkoutSession, string>;
  prefs!: Table<UserPreferences, string>;
  constructor() {
    super("treino-local");
    this.version(1).stores({ exercises: "id, name", routines: "id, status, order", sessions: "id, status, startedAt", prefs: "id" });
    this.on("populate", (tx) => { void tx.table("exercises").bulkAdd(buildCatalog()); });
  }
}

let instance: LocalDB | null = null;
export function localDB(): LocalDB {
  if (!instance) instance = new LocalDB();
  return instance;
}

/** Executa uma escrita; em falha mostra erro claro e não indica "salvo". */
export async function safeWrite(fn: () => Promise<unknown>, okMsg?: string): Promise<boolean> {
  try {
    await fn();
    if (okMsg) toast.success(okMsg, { description: "Salvo neste dispositivo." });
    return true;
  } catch (e) {
    const full = e instanceof Error && /quota/i.test(e.name + e.message);
    toast.error(full ? "Armazenamento do aparelho cheio." : "Não foi possível salvar neste dispositivo.", { description: "Seus dados atuais foram mantidos." });
    return false;
  }
}

export const exerciseRepo = {
  toggleFavorite: (ex: Exercise) => safeWrite(() => localDB().exercises.update(ex.id, { isFavorite: !ex.isFavorite })),
};

export const routineRepo = {
  save: (r: Routine, msg = "Rotina salva") => safeWrite(() => localDB().routines.put({ ...r, updatedAt: new Date().toISOString() }), msg),
  remove: (id: string) => safeWrite(() => localDB().routines.delete(id), "Rotina excluída"),
  saveMany: (list: Routine[]) => safeWrite(() => localDB().routines.bulkPut(list)),
};

export const useExercises = () => useLiveQuery(() => localDB().exercises.orderBy("name").toArray(), []);
export const useRoutines = () => useLiveQuery(() => localDB().routines.toArray(), []);
export const useExerciseHistory = (exerciseId: string | null) =>
  useLiveQuery(async () => {
    if (!exerciseId) return [];
    const all = await localDB().sessions.toArray();
    return all.flatMap((s) => s.setLogs.filter((l) => l.exerciseId === exerciseId && l.status === "done").map((l) => ({ ...l, date: s.startedAt }))).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  }, [exerciseId]);
