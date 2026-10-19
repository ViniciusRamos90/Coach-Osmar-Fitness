import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Search, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { WorkoutStatus } from "@/lib/types";
import { STATUS_LABEL } from "@/lib/types";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <svg viewBox="0 0 24 24" className="size-6 text-primary" aria-hidden="true">
        <path d="M3 18 L9 10 L13 14 L21 5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="21" cy="5" r="1.8" fill="currentColor" />
      </svg>
      <span>
        Coach <span className="text-primary">Osmar</span>
      </span>
    </span>
  );
}

export function PageHeader({ title, description, action }: { title: string; description?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-base font-semibold tracking-tight">{children}</h2>
      {action}
    </div>
  );
}

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn("rounded-xl border bg-card p-4 shadow-card md:p-5", className)}>{children}</section>;
}

export function MetricCard({ label, value, hint, icon: Icon, accent }: { label: string; value: ReactNode; hint?: ReactNode; icon?: LucideIcon; accent?: boolean }) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-card">
      <div className="flex items-center justify-between gap-2 text-xs font-medium text-muted-foreground">
        <span>{label}</span>
        {Icon && <Icon className={cn("size-4", accent && "text-primary")} aria-hidden="true" />}
      </div>
      <div className={cn("mt-2 text-xl font-semibold tabular md:text-2xl", accent && "text-primary")}>{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }: { icon: LucideIcon; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed bg-surface px-6 py-10 text-center">
      <div className="mb-3 rounded-full bg-elevated p-3">
        <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
      </div>
      <p className="font-medium">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Excluir",
  onConfirm,
  destructive = true,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  destructive?: boolean;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className={cn(destructive && "bg-destructive text-destructive-foreground hover:bg-destructive/90")}
            onClick={onConfirm}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function SearchInput({ value, onChange, placeholder, label }: { value: string; onChange: (v: string) => void; placeholder: string; label: string }) {
  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <Input aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-10 bg-surface pl-9 pr-9" />
      {value && (
        <button type="button" onClick={() => onChange("")} aria-label="Limpar busca" className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground">
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

export function Chip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1 rounded-full border px-3 text-sm transition-colors duration-150",
        active ? "border-primary bg-primary text-primary-foreground" : "bg-surface text-muted-foreground hover:bg-elevated hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

export function PeriodFilter<T extends number | null>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div role="group" aria-label="Período" className="inline-flex rounded-lg border bg-surface p-0.5">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-150",
            o.value === value ? "bg-elevated text-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export const DAY_OPTIONS = [
  { value: 7, label: "7 dias" },
  { value: 30, label: "30 dias" },
  { value: 90, label: "90 dias" },
];

export function StatusBadge({ status }: { status: WorkoutStatus }) {
  const cls = {
    concluido: "border-success/40 text-success",
    nao_realizado: "border-destructive/40 text-destructive",
    planejado: "border-warning/40 text-warning",
  }[status];
  const dot = { concluido: "●", nao_realizado: "✕", planejado: "○" }[status];
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium", cls)}>
      <span aria-hidden="true">{dot}</span>
      {STATUS_LABEL[status]}
    </span>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return <span className="inline-flex items-center rounded-md bg-elevated px-2 py-0.5 text-xs text-muted-foreground">{children}</span>;
}

export function Field({ id, label, error, children, hint }: { id: string; label: string; error?: string; children: ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" aria-busy="true">
      <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <span className="sr-only">Carregando</span>
    </div>
  );
}

export { Button };
