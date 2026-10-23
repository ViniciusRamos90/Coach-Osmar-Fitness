import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/common";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nova senha — Coach Osmar" },
      { name: "description", content: "Crie uma nova senha para sua conta Coach Osmar." },
      { property: "og:title", content: "Nova senha — Coach Osmar" },
      { property: "og:description", content: "Crie uma nova senha para sua conta Coach Osmar." },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 6) { toast.error("A senha precisa ter pelo menos 6 caracteres."); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) { toast.error("Link inválido ou expirado. Solicite outro."); return; }
    toast.success("Senha atualizada.");
    navigate({ to: "/treinos", replace: true });
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 page-enter">
      <Logo className="text-2xl" />
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-xl border bg-card p-6">
        <h1 className="text-xl font-semibold">Criar nova senha</h1>
        <div className="space-y-1.5">
          <Label htmlFor="new-password">Nova senha</Label>
          <Input id="new-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={busy}>{busy ? "Salvando..." : "Salvar senha"}</Button>
      </form>
    </main>
  );
}
