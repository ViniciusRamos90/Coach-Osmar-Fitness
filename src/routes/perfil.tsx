import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ClipboardList, Database, LogOut, Pencil, RotateCcw, Target } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import { formatDate, formatHeight, formatKg, parseNum } from "@/lib/format";
import { Button, ConfirmDialog, Field, PageHeader, Panel, SectionTitle } from "@/components/common";
import { UserAvatar } from "@/components/layout";
import { useAnamnesis } from "@/components/onboarding";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Meu perfil — Coach Osmar" },
      { name: "description", content: "Dados pessoais, objetivo e preferências do acompanhamento." },
      { property: "og:title", content: "Meu perfil — Coach Osmar" },
      { property: "og:description", content: "Dados pessoais, objetivo e preferências." },
    ],
  }),
  component: Perfil,
});

function Perfil() {
  const { data, updateProfile, resetData, setSignedOut } = useStore();
  const p = data.profile;
  const [editing, setEditing] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmOut, setConfirmOut] = useState(false);
  const { reset: redoAnamnesis } = useAnamnesis();

  const rows: [string, string][] = [
    ["Nome completo", p.name],
    ["E-mail", p.email],
    ["Altura", formatHeight(p.heightCm)],
    ["Peso inicial", formatKg(p.initialWeightKg)],
    ["Objetivo", p.goal],
    ["Início do acompanhamento", formatDate(p.startDate)],
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-5 page-enter">
      <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
        <Link to="/treinos"><ArrowLeft className="size-4" /> Voltar aos treinos</Link>
      </Button>
      <PageHeader title="Meu perfil" />
      <Panel>
        <div className="mb-4 flex items-center gap-4">
          <UserAvatar name={p.name} size="lg" />
          <div>
            <div className="text-lg font-semibold">{p.name}</div>
            <div className="text-sm text-muted-foreground">{p.email}</div>
          </div>
        </div>
        <dl className="divide-y">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-2.5 text-sm">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="text-right font-medium">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => setEditing(true)}><Pencil className="size-4" /> Editar informações</Button>
          <Button variant="outline" onClick={() => setGoalOpen(true)}><Target className="size-4" /> Atualizar objetivo</Button>
          <Button variant="outline" onClick={redoAnamnesis}><ClipboardList className="size-4" /> Refazer anamnese</Button>
        </div>
      </Panel>

      <Panel>
        <SectionTitle>Preferências</SectionTitle>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>Tema: escuro</li>
          <li>Unidades: kg e cm (padrão brasileiro)</li>
          <li>Semana: segunda a domingo</li>
          <li className="flex gap-2"><Database className="mt-0.5 size-4 shrink-0" aria-hidden="true" />Dados salvos na sua conta e sincronizados entre dispositivos.</li>
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setConfirmReset(true)}><RotateCcw className="size-4" /> Restaurar dados iniciais</Button>
          <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setConfirmOut(true)}><LogOut className="size-4" /> Sair</Button>
        </div>
      </Panel>

      <ProfileDialog open={editing} onOpenChange={setEditing} />
      <GoalDialog open={goalOpen} onOpenChange={setGoalOpen} current={p.goal} onSave={(goal) => { updateProfile({ goal }); toast.success("Alterações salvas."); }} />
      <ConfirmDialog open={confirmReset} onOpenChange={setConfirmReset} title="Restaurar dados iniciais?" description="Seus treinos e medições serão substituídos pelos dados de demonstração." confirmLabel="Restaurar" onConfirm={() => { resetData(); toast.success("Dados de demonstração restaurados."); }} />
      <ConfirmDialog open={confirmOut} onOpenChange={setConfirmOut} title="Sair da conta?" description="Você poderá entrar novamente com seu e-mail e senha." confirmLabel="Sair" destructive={false} onConfirm={() => setSignedOut(true)} />
    </div>
  );
}

function ProfileDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar informações</DialogTitle>
          <DialogDescription>Dados pessoais básicos.</DialogDescription>
        </DialogHeader>
        {open && <ProfileForm onClose={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function ProfileForm({ onClose }: { onClose: () => void }) {
  const { data, updateProfile } = useStore();
  const p = data.profile;
  const [v, setV] = useState({ name: p.name, email: p.email, height: String(p.heightCm), initial: String(p.initialWeightKg).replace(".", ","), startDate: p.startDate });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit(ev: FormEvent) {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!v.name.trim()) e.name = "Informe o nome.";
    if (!/^\S+@\S+\.\S+$/.test(v.email.trim())) e.email = "E-mail inválido.";
    const h = parseNum(v.height), w = parseNum(v.initial);
    if (h === undefined || !Number.isFinite(h) || h < 100 || h > 250) e.height = "Altura entre 100 e 250 cm.";
    if (w === undefined || !Number.isFinite(w) || w < 30 || w > 300) e.initial = "Peso entre 30 e 300 kg.";
    if (!v.startDate) e.startDate = "Informe a data.";
    setErrors(e);
    if (Object.keys(e).length) return;
    updateProfile({ name: v.name.trim(), email: v.email.trim(), heightCm: h!, initialWeightKg: w!, startDate: v.startDate });
    toast.success("Alterações salvas.");
    onClose();
  }

  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => setV((s) => ({ ...s, [k]: e.target.value }));
  return (
    <form onSubmit={submit} noValidate className="space-y-3">
      <Field id="p-name" label="Nome completo" error={errors.name}><Input id="p-name" value={v.name} onChange={set("name")} /></Field>
      <Field id="p-email" label="E-mail" error={errors.email}><Input id="p-email" type="email" value={v.email} onChange={set("email")} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field id="p-h" label="Altura (cm)" error={errors.height}><Input id="p-h" inputMode="numeric" value={v.height} onChange={set("height")} /></Field>
        <Field id="p-w" label="Peso inicial (kg)" error={errors.initial}><Input id="p-w" inputMode="decimal" value={v.initial} onChange={set("initial")} /></Field>
      </div>
      <Field id="p-start" label="Início do acompanhamento" error={errors.startDate}><Input id="p-start" type="date" value={v.startDate} onChange={set("startDate")} /></Field>
      <DialogFooter className="gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit">Salvar</Button>
      </DialogFooter>
    </form>
  );
}

function GoalDialog({ open, onOpenChange, current, onSave }: { open: boolean; onOpenChange: (o: boolean) => void; current: string; onSave: (g: string) => void }) {
  const [goal, setGoal] = useState(current);
  const [err, setErr] = useState("");
  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (o) { setGoal(current); setErr(""); } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Atualizar objetivo</DialogTitle>
          <DialogDescription>Descreva seu objetivo principal.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!goal.trim()) return setErr("Informe um objetivo.");
            onSave(goal.trim());
            onOpenChange(false);
          }}
          className="space-y-3"
        >
          <Field id="g-goal" label="Objetivo" error={err}>
            <Textarea id="g-goal" value={goal} onChange={(e) => setGoal(e.target.value)} rows={3} />
          </Field>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
