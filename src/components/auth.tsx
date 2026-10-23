import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "./common";

type Mode = "login" | "signup" | "forgot";

function authError(msg: string) {
  if (/invalid login/i.test(msg)) return "E-mail ou senha incorretos.";
  if (/not confirmed/i.test(msg)) return "Confirme seu e-mail antes de entrar.";
  if (/already registered/i.test(msg)) return "Este e-mail já possui conta.";
  if (/password/i.test(msg)) return "A senha precisa ter pelo menos 6 caracteres.";
  return "Não foi possível concluir. Tente novamente.";
}

export function AuthScreen() {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { toast.error("Informe um e-mail válido."); return; }
    if (mode !== "forgot" && password.length < 6) { toast.error("A senha precisa ter pelo menos 6 caracteres."); return; }
    if (mode === "signup" && !name.trim()) { toast.error("Informe seu nome."); return; }
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: window.location.origin, data: { name: name.trim() } },
        });
        if (error) throw error;
        if (!data.session) setSent("Enviamos um link de confirmação para o seu e-mail. Confirme para entrar.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setSent("Se houver uma conta com esse e-mail, você receberá um link para criar uma nova senha.");
      }
    } catch (err) {
      toast.error(authError(err instanceof Error ? err.message : String(err)));
    } finally {
      setBusy(false);
    }
  }

  const title = mode === "login" ? "Entrar" : mode === "signup" ? "Criar conta" : "Recuperar senha";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 page-enter">
      <Logo className="text-2xl" />
      <div className="w-full max-w-sm rounded-xl border bg-card p-6">
        <h1 className="mb-4 text-xl font-semibold">{title}</h1>
        {sent ? (
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>{sent}</p>
            <Button variant="outline" className="w-full" onClick={() => { setSent(null); setMode("login"); }}>Voltar para entrar</Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4" noValidate>
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="auth-name">Nome</Label>
                <Input id="auth-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="auth-email">E-mail</Label>
              <Input id="auth-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </div>
            {mode !== "forgot" && (
              <div className="space-y-1.5">
                <Label htmlFor="auth-password">Senha</Label>
                <Input id="auth-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} />
              </div>
            )}
            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? "Aguarde..." : mode === "login" ? "Entrar" : mode === "signup" ? "Criar conta" : "Enviar link"}
            </Button>
          </form>
        )}
        {!sent && (
          <div className="mt-4 flex flex-col gap-1 text-center text-sm">
            {mode === "login" && (
              <>
                <button type="button" className="text-primary hover:underline" onClick={() => setMode("signup")}>Criar uma conta</button>
                <button type="button" className="text-muted-foreground hover:underline" onClick={() => setMode("forgot")}>Esqueci minha senha</button>
              </>
            )}
            {mode !== "login" && (
              <button type="button" className="text-primary hover:underline" onClick={() => setMode("login")}>Já tenho conta</button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
