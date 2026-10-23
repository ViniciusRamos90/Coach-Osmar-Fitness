import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Activity, Compass, Dumbbell, Library, ListChecks, Search } from "lucide-react";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { EXERCISES } from "@/data/mock";
import { FormHost } from "./forms";
import { LoadingState, Logo } from "./common";
import { AuthScreen } from "./auth";

const NAV = [
  { to: "/treinos", label: "Treinos", icon: Dumbbell },
  { to: "/atividades", label: "Atividades", icon: ListChecks },
  { to: "/explorar", label: "Explorar", icon: Compass },
  { to: "/exercicios", label: "Exercícios", icon: Library },
  { to: "/corpo", label: "Corpo", icon: Activity },
] as const;

export function UserAvatar({ name, size = "md" }: { name: string; size?: "md" | "lg" }) {
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
  return (
    <span className={size === "lg" ? "flex size-16 items-center justify-center rounded-full border-2 border-primary bg-elevated text-xl font-semibold" : "flex size-9 items-center justify-center rounded-full border border-primary/60 bg-elevated text-sm font-semibold"} aria-hidden="true">
      {initials || "?"}
    </span>
  );
}

function AppHeader({ onSearch }: { onSearch: () => void }) {
  const { data } = useStore();
  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
        <Link to="/treinos" aria-label="Coach Osmar — início">
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onSearch} aria-label="Busca rápida (Ctrl+K)" className="text-muted-foreground">
            <Search className="size-4" />
            <span className="hidden sm:inline">Buscar</span>
            <kbd className="hidden rounded border px-1.5 text-[10px] sm:inline">Ctrl K</kbd>
          </Button>
          <Link to="/perfil" aria-label="Abrir meu perfil" className="rounded-full transition-opacity hover:opacity-80">
            <UserAvatar name={data.profile.name} />
          </Link>
        </div>
      </div>
    </header>
  );
}

function BottomNavigation() {
  return (
    <nav aria-label="Navegação principal" className="fixed inset-x-0 bottom-0 z-30 border-t bg-surface/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto grid max-w-xl grid-cols-5">
        {NAV.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              className="group relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground data-[status=active]:text-primary"
            >
              {({ isActive }) => (
                <>
                  <span className={isActive ? "absolute top-0 h-0.5 w-8 rounded-full bg-primary" : "hidden"} aria-hidden="true" />
                  <Icon className={isActive ? "size-5 scale-110 transition-transform" : "size-5 transition-transform"} strokeWidth={isActive ? 2.5 : 1.75} aria-hidden="true" />
                  <span>{label}</span>
                </>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function QuickSearch({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const navigate = useNavigate();
  const { openForm } = useStore();
  const go = (fn: () => void) => {
    onOpenChange(false);
    fn();
  };
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Buscar páginas, ações ou exercícios…" />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        <CommandGroup heading="Ações">
          <CommandItem onSelect={() => go(() => openForm({ kind: "workout" }))}>Registrar treino</CommandItem>
          <CommandItem onSelect={() => go(() => openForm({ kind: "measurement" }))}>Registrar medidas</CommandItem>
        </CommandGroup>
        <CommandGroup heading="Páginas">
          {[...NAV, { to: "/perfil" as const, label: "Meu perfil" }].map((n) => (
            <CommandItem key={n.to} onSelect={() => go(() => navigate({ to: n.to }))}>{n.label}</CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Exercícios">
          {EXERCISES.map((e) => (
            <CommandItem key={e.id} value={`exercicio ${e.name}`} onSelect={() => go(() => navigate({ to: "/exercicios", search: { ex: e.id } }))}>
              {e.name}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const { hydrated, signedOut } = useStore();
  const { pathname } = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (pathname === "/reset-password") return <>{children}</>;
  if (!hydrated) return <LoadingState />;
  if (signedOut) return <AuthScreen />;

  return (
    <div className="min-h-screen">
      <AppHeader onSearch={() => setSearchOpen(true)} />
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6">{children}</main>
      <BottomNavigation />
      <FormHost />
      <QuickSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
