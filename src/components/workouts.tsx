import { Clock, Eye, Flame, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Workout } from "@/lib/types";
import { groupLabel } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { StatusBadge, Tag } from "./common";

export function WorkoutDetails({ workout, onClose, onEdit }: { workout: Workout | null; onClose: () => void; onEdit: (w: Workout) => void }) {
  return (
    <Dialog open={!!workout} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        {workout && (
          <>
            <DialogHeader>
              <DialogTitle>{workout.name}</DialogTitle>
              <DialogDescription>
                {formatDate(workout.date)}
                {workout.startTime ? ` às ${workout.startTime}` : ""}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={workout.status} />
              {workout.muscleGroups.map((g) => <Tag key={g}>{groupLabel(g)}</Tag>)}
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-surface p-3">
                <div className="text-xs text-muted-foreground">Duração</div>
                <div className="font-semibold tabular">{workout.durationMinutes} min</div>
              </div>
              <div className="rounded-lg bg-surface p-3">
                <div className="text-xs text-muted-foreground">Calorias estimadas</div>
                <div className="font-semibold tabular">{workout.estimatedCalories != null ? `${workout.estimatedCalories} kcal` : "—"}</div>
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium">Exercícios</h3>
              {workout.exercises.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum exercício registrado.</p>
              ) : (
                <ul className="divide-y rounded-lg border">
                  {workout.exercises.map((e) => (
                    <li key={e.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                      <span>{e.name}</span>
                      <span className="tabular text-muted-foreground">
                        {e.sets}×{e.reps}
                        {e.loadKg != null ? ` · ${e.loadKg} kg` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {workout.notes && (
              <div>
                <h3 className="mb-1 text-sm font-medium">Observações</h3>
                <p className="text-sm text-muted-foreground">{workout.notes}</p>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>Fechar</Button>
              <Button onClick={() => onEdit(workout)}><Pencil className="size-4" /> Editar</Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function WorkoutCard({ workout, onView, onEdit, onDelete }: { workout: Workout; onView: () => void; onEdit?: () => void; onDelete?: () => void }) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <button type="button" onClick={onView} className="min-w-0 text-left">
          <div className="truncate font-medium hover:text-primary">{workout.name}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">{formatDate(workout.date)}</div>
        </button>
        <StatusBadge status={workout.status} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {workout.muscleGroups.map((g) => <Tag key={g}>{groupLabel(g)}</Tag>)}
        <span className="inline-flex items-center gap-1"><Clock className="size-3.5" aria-hidden="true" />{workout.durationMinutes} min</span>
        {workout.estimatedCalories != null && (
          <span className="inline-flex items-center gap-1"><Flame className="size-3.5" aria-hidden="true" />{workout.estimatedCalories} kcal</span>
        )}
      </div>
      {(onEdit || onDelete) && (
        <div className="mt-3 flex justify-end gap-1 border-t pt-2">
          <Button variant="ghost" size="sm" onClick={onView}><Eye className="size-4" /> Detalhes</Button>
          {onEdit && <Button variant="ghost" size="sm" onClick={onEdit}><Pencil className="size-4" /> Editar</Button>}
          {onDelete && <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={onDelete}><Trash2 className="size-4" /> Excluir</Button>}
        </div>
      )}
    </div>
  );
}
