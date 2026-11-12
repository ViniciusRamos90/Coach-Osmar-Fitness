// Metadados controlados dos exercícios da biblioteca (lib-*). IDs internos em inglês, rótulos em pt-BR.
import type { Exercise } from "./models";

export const MUSCLE_GROUP_IDS = ["chest", "back", "shoulders", "biceps", "triceps", "forearms", "core", "lower_back", "glutes", "quadriceps", "hamstrings", "calves", "adductors", "abductors"] as const;
export type MuscleGroupId = (typeof MUSCLE_GROUP_IDS)[number];
export const MUSCLE_GROUP_LABEL: Record<MuscleGroupId, string> = {
  chest: "Peito", back: "Costas", shoulders: "Ombros", biceps: "Bíceps", triceps: "Tríceps", forearms: "Antebraços", core: "Core/Abdômen",
  lower_back: "Lombar", glutes: "Glúteos", quadriceps: "Quadríceps", hamstrings: "Posteriores de coxa", calves: "Panturrilhas", adductors: "Adutores", abductors: "Abdutores",
};

export const EQUIPMENT_IDS = ["bodyweight", "barbell", "dumbbells", "kettlebell", "machine", "cable", "resistance_band", "smith_machine", "bench", "pull_up_bar", "suspension_trainer", "medicine_ball", "weight_plate", "box_step", "ankle_strap", "other"] as const;
export type EquipmentId = (typeof EQUIPMENT_IDS)[number];
export const EQUIPMENT_ID_LABEL: Record<EquipmentId, string> = {
  bodyweight: "Peso corporal", barbell: "Barra", dumbbells: "Halteres", kettlebell: "Kettlebell", machine: "Máquina", cable: "Polia/Cabo",
  resistance_band: "Elástico", smith_machine: "Smith", bench: "Banco", pull_up_bar: "Barra fixa", suspension_trainer: "Fita de suspensão",
  medicine_ball: "Medicine ball", weight_plate: "Anilha", box_step: "Caixa/Step", ankle_strap: "Tornozeleira", other: "Outro",
};

export const TECHNICAL_LEVELS = ["beginner", "intermediate", "advanced"] as const;
export type TechnicalLevel = (typeof TECHNICAL_LEVELS)[number];
export const TECHNICAL_LEVEL_LABEL: Record<TechnicalLevel, string> = { beginner: "Iniciante", intermediate: "Intermediário", advanced: "Avançado" };

export const MOVEMENT_PATTERNS = ["horizontal_push", "vertical_push", "horizontal_pull", "vertical_pull", "squat", "hinge", "lunge", "hip_extension", "knee_extension", "knee_flexion", "hip_abduction", "hip_adduction", "core_flexion", "core_stability", "rotation", "carry", "calf_raise", "other"] as const;
export type MovementPattern = (typeof MOVEMENT_PATTERNS)[number];
export const MOVEMENT_PATTERN_LABEL: Record<MovementPattern, string> = {
  horizontal_push: "Empurrar horizontal", vertical_push: "Empurrar vertical", horizontal_pull: "Puxar horizontal", vertical_pull: "Puxar vertical",
  squat: "Agachar", hinge: "Dobradiça de quadril", lunge: "Avanço", hip_extension: "Extensão de quadril", knee_extension: "Extensão de joelho",
  knee_flexion: "Flexão de joelho", hip_abduction: "Abdução de quadril", hip_adduction: "Adução de quadril", core_flexion: "Flexão de tronco",
  core_stability: "Estabilidade do core", rotation: "Rotação", carry: "Carregar", calf_raise: "Elevação de panturrilha", other: "Outro",
};

export const METADATA_STATUSES = ["unclassified", "candidate", "reviewed"] as const;
export type MetadataStatus = (typeof METADATA_STATUSES)[number];
export const METADATA_STATUS_LABEL: Record<MetadataStatus, string> = { unclassified: "Não classificado", candidate: "Rascunho", reviewed: "Revisado" };
export type MuscleRole = "primary" | "secondary";
export const METADATA_SOURCES = ["manual", "rule_suggestion", "import"] as const;
export type MetadataSource = (typeof METADATA_SOURCES)[number];

export interface ExerciseMetadata {
  muscleGroups: Array<{ id: MuscleGroupId; role: MuscleRole }>;
  equipment: EquipmentId[];
  technicalLevel: TechnicalLevel | null;
  movementPattern: MovementPattern | null;
  status: MetadataStatus;
  source: MetadataSource | null;
  confidence: number | null;
  reviewedAt: string | null;
}

export const UNCLASSIFIED = "Não classificado";
export const emptyMetadata = (): ExerciseMetadata => ({ muscleGroups: [], equipment: [], technicalLevel: null, movementPattern: null, status: "unclassified", source: null, confidence: null, reviewedAt: null });
export const isLibraryId = (id: string) => /^lib-\d{4}$/.test(id);

/** Completa só os campos ausentes; nunca sobrescreve valores existentes. */
export function migrateMetadata(m: Partial<ExerciseMetadata> | undefined): ExerciseMetadata {
  return { ...emptyMetadata(), ...(m ?? {}) } as ExerciseMetadata;
}
/** Retorna as atualizações necessárias (somente lib-*). Idempotente: segunda execução retorna []. */
export function pendingMigrations(list: Exercise[]): { id: string; metadata: ExerciseMetadata }[] {
  return list.filter((e) => isLibraryId(e.id)).flatMap((e) => {
    const next = migrateMetadata(e.metadata);
    return JSON.stringify(next) === JSON.stringify(e.metadata) ? [] : [{ id: e.id, metadata: next }];
  });
}

/** Regras: no máximo 1 primário; sem primário não pode ser "revisado"; ids válidos e sem repetição. */
export function validateMetadata(m: ExerciseMetadata): string[] {
  const errs: string[] = [];
  const prim = m.muscleGroups.filter((g) => g.role === "primary");
  if (prim.length > 1) errs.push("Mais de um grupo muscular principal");
  if (m.muscleGroups.some((g) => !MUSCLE_GROUP_IDS.includes(g.id))) errs.push("Grupo muscular inválido");
  if (new Set(m.muscleGroups.map((g) => g.id)).size !== m.muscleGroups.length) errs.push("Grupo muscular repetido");
  if (m.equipment.some((e) => !EQUIPMENT_IDS.includes(e))) errs.push("Equipamento inválido");
  if (m.technicalLevel && !TECHNICAL_LEVELS.includes(m.technicalLevel)) errs.push("Nível técnico inválido");
  if (m.movementPattern && !MOVEMENT_PATTERNS.includes(m.movementPattern)) errs.push("Padrão de movimento inválido");
  if (!METADATA_STATUSES.includes(m.status)) errs.push("Status inválido");
  if (m.status === "reviewed" && prim.length !== 1) errs.push("Para marcar como revisado, defina um grupo principal");
  return errs;
}

export interface MetaFilter { muscles: (MuscleGroupId | "none")[]; equipment: (EquipmentId | "none")[]; levels: (TechnicalLevel | "none")[]; statuses: MetadataStatus[] }
export const emptyMetaFilter = (): MetaFilter => ({ muscles: [], equipment: [], levels: [], statuses: [] });
/** AND entre categorias, OR dentro da categoria. Exercícios sem metadados (ex-*) contam como não classificados. */
export function matchesMetaFilter(e: Exercise, f: MetaFilter): boolean {
  const m = e.metadata ?? emptyMetadata();
  const ok = <T,>(sel: (T | "none")[], vals: T[]) => !sel.length || sel.some((s) => (s === "none" ? vals.length === 0 : vals.includes(s as T)));
  return ok(f.muscles, m.muscleGroups.map((g) => g.id)) && ok(f.equipment, m.equipment) &&
    ok(f.levels, m.technicalLevel ? [m.technicalLevel] : []) && (!f.statuses.length || f.statuses.includes(m.status));
}

// ---------- CSV versionado ----------
export const CSV_VERSION = "coach-osmar-metadata-v1";
const COLS = ["id", "name", "primary_muscle", "secondary_muscles", "equipment", "technical_level", "movement_pattern", "status", "source", "confidence", "reviewed_at"] as const;
const q = (v: string) => (/[",\n;]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

export function exportCsv(list: Exercise[]): string {
  const rows = list.filter((e) => isLibraryId(e.id)).map((e) => {
    const m = migrateMetadata(e.metadata);
    return [e.id, e.name, m.muscleGroups.find((g) => g.role === "primary")?.id ?? "", m.muscleGroups.filter((g) => g.role === "secondary").map((g) => g.id).join("|"),
      m.equipment.join("|"), m.technicalLevel ?? "", m.movementPattern ?? "", m.status, m.source ?? "", m.confidence?.toString() ?? "", m.reviewedAt ?? ""].map(q).join(",");
  });
  return [`# ${CSV_VERSION}`, COLS.join(","), ...rows].join("\n");
}

function parseLine(line: string): string[] {
  const out: string[] = []; let cur = ""; let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) { if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') inQ = false; else cur += c; }
    else if (c === '"') inQ = true; else if (c === ",") { out.push(cur); cur = ""; } else cur += c;
  }
  out.push(cur); return out;
}

export interface ImportRow { id: string; metadata: ExerciseMetadata; overwritesReviewed: boolean }
export interface ImportPreview { rows: ImportRow[]; errors: string[] }

export function parseImportCsv(text: string, existing: Exercise[]): ImportPreview {
  const lines = text.replace(/\r/g, "").split("\n").filter((l) => l.trim());
  const errors: string[] = [];
  if (lines[0]?.trim() !== `# ${CSV_VERSION}`) return { rows: [], errors: [`Versão do arquivo não reconhecida (esperado "${CSV_VERSION}")`] };
  if (lines[1]?.trim() !== COLS.join(",")) return { rows: [], errors: ["Cabeçalho de colunas inválido"] };
  const byId = new Map(existing.map((e) => [e.id, e]));
  const seen = new Set<string>(); const rows: ImportRow[] = [];
  lines.slice(2).forEach((line, i) => {
    const n = i + 3; const c = parseLine(line);
    const [id, , prim, sec, eq, lvl, mp, st, src, conf, rev] = c.map((v) => v.trim());
    if (!isLibraryId(id ?? "") || !byId.has(id!)) { errors.push(`Linha ${n}: ID desconhecido "${id}"`); return; }
    if (seen.has(id!)) { errors.push(`Linha ${n}: ID duplicado ${id}`); return; } seen.add(id!);
    const groups = [...(prim ? [{ id: prim as MuscleGroupId, role: "primary" as const }] : []), ...(sec ? sec.split("|").map((g) => ({ id: g as MuscleGroupId, role: "secondary" as const })) : [])];
    if (src && !METADATA_SOURCES.includes(src as MetadataSource)) { errors.push(`Linha ${n}: origem inválida "${src}"`); return; }
    const confN = conf ? Number(conf) : null;
    if (confN !== null && (Number.isNaN(confN) || confN < 0 || confN > 1)) { errors.push(`Linha ${n}: confiança deve estar entre 0 e 1`); return; }
    const md: ExerciseMetadata = { muscleGroups: groups, equipment: eq ? (eq.split("|") as EquipmentId[]) : [], technicalLevel: (lvl || null) as TechnicalLevel | null,
      movementPattern: (mp || null) as MovementPattern | null, status: (st || "unclassified") as MetadataStatus, source: (src || "import") as MetadataSource, confidence: confN, reviewedAt: rev || null };
    const errs = validateMetadata(md);
    if (errs.length) { errors.push(`Linha ${n} (${id}): ${errs.join("; ")}`); return; }
    const cur = byId.get(id!)!.metadata;
    rows.push({ id: id!, metadata: md, overwritesReviewed: cur?.status === "reviewed" && JSON.stringify(cur) !== JSON.stringify(md) });
  });
  return { rows, errors };
}
