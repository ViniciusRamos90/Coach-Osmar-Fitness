import type { Muscle } from "@/lib/local/models";

type Shape = { m: Muscle | null; d: string };
// Silhueta autoral simplificada (viewBox 0 0 60 120). m=null = corpo base.
const BASE: Shape[] = [
  { m: null, d: "M30 4a7 7 0 1 1 0 14a7 7 0 1 1 0-14z" },
  { m: null, d: "M18 22h24l4 30h-32z" },
  { m: null, d: "M12 24l6-2-2 34h-6z M48 24l-6-2 2 34h6z" },
  { m: null, d: "M18 54h11l-1 60h-8z M31 54h11l-2 60h-8z" },
];
const FRONT: Shape[] = [
  { m: "ombros", d: "M13 22a6 6 0 0 1 8 0l-2 7h-7z M47 22a6 6 0 0 0-8 0l2 7h7z" },
  { m: "peito", d: "M21 25h8.5v9h-9z M30.5 25h8.5l1 9h-9.5z" },
  { m: "biceps", d: "M11 31h6l-1 12h-6z M43 31h6l1 12h-6z" },
  { m: "abdomen", d: "M23 36h14l-1 16h-12z" },
  { m: "quadriceps", d: "M19 58h9l-1 22h-7z M32 58h9l-1 22h-7z" },
  { m: "panturrilhas", d: "M21 88h6l-1 18h-4z M33 88h6l-1 18h-4z" },
];
const BACK: Shape[] = [
  { m: "ombros", d: "M13 22a6 6 0 0 1 8 0l-2 7h-7z M47 22a6 6 0 0 0-8 0l2 7h7z" },
  { m: "costas", d: "M21 24h18l-2 24h-14z" },
  { m: "triceps", d: "M11 31h6l-1 12h-6z M43 31h6l1 12h-6z" },
  { m: "gluteos", d: "M19 52h10.5v9h-10z M30.5 52h10.5v9h-10.5z" },
  { m: "posteriores", d: "M19 63h9l-1 18h-7z M32 63h9l-1 18h-7z" },
  { m: "panturrilhas", d: "M20 86h7l-1 18h-5z M33 86h7l-1 18h-5z" },
];

function Body({ shapes, active, label }: { shapes: Shape[]; active: Set<Muscle>; label: string }) {
  return (
    <svg viewBox="0 0 60 120" className="h-full w-auto" role="img" aria-label={label}>
      {BASE.map((s, i) => <path key={`b${i}`} d={s.d} className="fill-elevated" />)}
      {shapes.map((s, i) => (
        <path key={i} d={s.d} className={s.m && active.has(s.m) ? "fill-primary drop-shadow-[0_0_3px_var(--color-primary)]" : "fill-border"} />
      ))}
    </svg>
  );
}

export function MuscleMap({ muscles, size = "sm" }: { muscles: Muscle[]; size?: "sm" | "lg" }) {
  const active = new Set(muscles);
  const h = size === "lg" ? "h-48" : "h-12";
  return (
    <div className={`flex items-center justify-center gap-1 ${h}`}>
      <Body shapes={FRONT} active={active} label="Vista frontal" />
      <Body shapes={BACK} active={active} label="Vista dorsal" />
    </div>
  );
}
