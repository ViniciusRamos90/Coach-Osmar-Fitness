import { useEffect, useMemo, useState } from "react";
import { Heart, SearchX } from "lucide-react";
import { ExerciseVisual } from "@/components/exercise-visual";
import { Chip, EmptyState, SearchInput, Button } from "@/components/common";
import { EQUIPMENT, EQUIPMENT_LABEL, MUSCLES, MUSCLE_LABEL, type Equipment, type Exercise, type Muscle } from "@/lib/local/models";
import { exerciseRepo } from "@/lib/local/db";

export function filterExercises(list: Exercise[], q: string, muscle: Muscle | null, equip: Equipment | null, favOnly: boolean) {
  const term = q.trim().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
  return list.filter((e) =>
    (!term || e.name.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").includes(term)) &&
    (!muscle || e.muscleGroups.includes(muscle)) && (!equip || e.equipment === equip) && (!favOnly || e.isFavorite));
}

export function ExerciseBrowser({ exercises, onSelect, actionLabel }: { exercises: Exercise[]; onSelect: (e: Exercise) => void; actionLabel?: string }) {
  const [q, setQ] = useState("");
  const [muscle, setMuscle] = useState<Muscle | null>(null);
  const [equip, setEquip] = useState<Equipment | null>(null);
  const [fav, setFav] = useState(false);
  const [sort, setSort] = useState<"az" | "za">("az");
  const list = useMemo(() => {
    const f = filterExercises(exercises, q, muscle, equip, fav);
    return sort === "az" ? f : [...f].reverse();
  }, [exercises, q, muscle, equip, fav, sort]);
  const [limit, setLimit] = useState(60);
  useEffect(() => setLimit(60), [q, muscle, equip, fav, sort]);
  const clear = () => { setQ(""); setMuscle(null); setEquip(null); setFav(false); };

  return (
    <div className="space-y-3">
      <SearchInput value={q} onChange={setQ} placeholder="Buscar exercício…" label="Buscar exercício por nome" />
      <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filtrar por grupo muscular">
        <Chip active={!muscle} onClick={() => setMuscle(null)}>Todos</Chip>
        {MUSCLES.map((m) => <Chip key={m} active={muscle === m} onClick={() => setMuscle(muscle === m ? null : m)}>{MUSCLE_LABEL[m]}</Chip>)}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filtrar por equipamento">
        <Chip active={fav} onClick={() => setFav(!fav)}>★ Favoritos</Chip>
        {EQUIPMENT.map((e) => <Chip key={e} active={equip === e} onClick={() => setEquip(equip === e ? null : e)}>{EQUIPMENT_LABEL[e]}</Chip>)}
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{list.length} exercício(s)</span>
        <button className="min-h-12 px-2 underline-offset-4 hover:underline" onClick={() => setSort(sort === "az" ? "za" : "az")}>Ordenar: {sort === "az" ? "A→Z" : "Z→A"}</button>
      </div>
      {list.length === 0 ? (
        <EmptyState icon={SearchX} title="Nenhum exercício encontrado" description="Tente outros termos ou remova filtros." action={<Button variant="outline" onClick={clear}>Limpar filtros</Button>} />
      ) : (
        <ul className="divide-y rounded-xl border bg-card">
          {list.slice(0, limit).map((e) => (
            <li key={e.id} className="flex items-center gap-2 pr-2">
              <button onClick={() => onSelect(e)} className="flex min-h-14 flex-1 items-center gap-3 px-3 py-2 text-left hover:bg-accent/40 focus-visible:outline-2">
                <span className="flex h-14 w-16 shrink-0 items-center justify-center rounded-lg bg-surface" aria-hidden="true"><ExerciseVisual exercise={e} /></span>
                <span className="min-w-0">
                  <span className="block truncate font-medium">{e.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{e.muscleGroups.map((m) => MUSCLE_LABEL[m]).join(", ")} · {EQUIPMENT_LABEL[e.equipment]}</span>
                </span>
                {actionLabel && <span className="ml-auto text-xs font-medium text-primary">{actionLabel}</span>}
              </button>
              <button onClick={() => void exerciseRepo.toggleFavorite(e)} aria-pressed={e.isFavorite} aria-label={e.isFavorite ? `Remover ${e.name} dos favoritos` : `Favoritar ${e.name}`} className="flex size-12 items-center justify-center rounded-lg hover:bg-accent/40">
                <Heart className={e.isFavorite ? "size-5 fill-primary text-primary" : "size-5 text-muted-foreground"} />
              </button>
            </li>
          ))}
        </ul>
      )}
      {list.length > limit && (
        <Button variant="outline" className="w-full" onClick={() => setLimit(limit + 60)}>Mostrar mais ({list.length - limit} restantes)</Button>
      )}
    </div>
  );
}
