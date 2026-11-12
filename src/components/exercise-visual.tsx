import { useEffect, useState } from "react";
import { MuscleMap } from "@/components/muscle-map";
import { cn } from "@/lib/utils";
import type { Exercise } from "@/lib/local/models";
import { resolveVisual } from "@/lib/local/exercise-media";

/** Mostra a animação licenciada quando associada; mantém o mapa como alternativa offline. */
export function ExerciseVisual({ exercise, size = "sm" }: { exercise: Exercise; size?: "sm" | "lg" }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [exercise.imageUrl]);

  if (!exercise.imageUrl || failed) return <MuscleMap muscles={exercise.muscleGroups} size={size} />;
  return (
    <img
      src={exercise.imageUrl}
      alt={resolveVisual(exercise.id, exercise.name)?.alt ?? `Demonstração do movimento: ${exercise.name}`}
      className={cn("rounded-lg bg-surface object-contain", size === "lg" ? "mx-auto max-h-64 w-full" : "h-14 w-16")}
      loading={size === "sm" ? "lazy" : "eager"}
      onError={() => setFailed(true)}
    />
  );
}
