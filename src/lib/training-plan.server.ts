// Server-only: Lovable AI Gateway call that turns a student's goals/limitations into a training plan.
import { createOpenAI } from "@ai-sdk/openai";
import { NoObjectGeneratedError, Output, streamText } from "ai";
import { z } from "zod";
import type { PlanRequest, TrainingPlan } from "./training-plan";

const RUN_ID = "X-Lovable-AIG-Run-ID";
const MODEL = "openai/gpt-6-astra";

const exerciseSchema = z.object({
  name: z.string(),
  sets: z.number(),
  reps: z.string(),
  restSeconds: z.number(),
  notes: z.string().nullable(),
});
const planSchema = z.object({
  title: z.string(),
  summary: z.string(),
  weeks: z.number(),
  days: z.array(
    z.object({
      name: z.string(),
      focus: z.string(),
      muscleGroups: z.array(z.enum(["peito", "costas", "pernas", "ombros", "biceps", "triceps", "abdomen", "cardio", "corpo_inteiro"])),
      durationMinutes: z.number(),
      exercises: z.array(exerciseSchema),
    }),
  ),
  safetyNotes: z.array(z.string()),
  progression: z.string(),
});

export class PlanError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export async function generateTrainingPlan(input: PlanRequest): Promise<TrainingPlan> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new PlanError("Serviço de IA não configurado.", 500);

  let runId: string | undefined;
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: async (url, init) => {
      const headers = new Headers(init?.headers);
      if (runId) headers.set(RUN_ID, runId);
      const res = await fetch(url, { ...init, headers });
      runId ??= res.headers.get(RUN_ID) ?? undefined;
      return res;
    },
  });

  const prompt = [
    `Aluno: ${input.studentName || "não informado"}`,
    `Idade: ${input.age ?? "não informada"} | Sexo: ${input.sex || "não informado"} | Nível: ${input.level}`,
    `Objetivos: ${input.goals}`,
    `Limitações, lesões ou restrições: ${input.limitations || "nenhuma informada"}`,
    `Dias por semana: ${input.daysPerWeek} | Minutos por sessão: ${input.minutesPerSession}`,
    `Equipamentos disponíveis: ${input.equipment}`,
  ].join("\n");

  let streamError: unknown;
  const result = streamText({
    model: provider.responses(MODEL),
    instructions:
      "Você é um treinador de musculação experiente. Monte um plano de treino semanal em português do Brasil, seguro e personalizado. " +
      `Crie exatamente ${input.daysPerWeek} dias de treino, cada um com 4 a 8 exercícios cabendo em ${input.minutesPerSession} minutos. ` +
      "Respeite rigorosamente as limitações: evite ou substitua exercícios que as agravem e explique as adaptações em safetyNotes. " +
      "reps é texto como '8-12' ou '30 s'. weeks entre 4 e 12. Seja objetivo.",
    messages: [{ role: "user", content: prompt }],
    output: Output.object({ schema: planSchema }),
    maxRetries: 0,
    onError: ({ error }) => {
      streamError = error;
    },
    providerOptions: {
      openai: {
        store: false,
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  try {
    const plan = await result.output;
    return {
      ...plan,
      weeks: Math.min(12, Math.max(4, Math.round(plan.weeks))),
      days: plan.days.slice(0, 7).map((d) => ({ ...d, durationMinutes: Math.round(d.durationMinutes) })),
    };
  } catch (e) {
    const err = streamError ?? e;
    const status = (err as { statusCode?: number })?.statusCode;
    console.error("training plan generation failed", status, err);
    if (status === 429) throw new PlanError("Muitas solicitações agora. Aguarde um pouco e tente novamente.", 429);
    if (status === 402) throw new PlanError("Os créditos de IA acabaram. Adicione créditos para continuar gerando planos.", 402);
    if (status === 403) throw new PlanError("O uso de IA está bloqueado para este espaço de trabalho.", 403);
    if (NoObjectGeneratedError.isInstance(e)) throw new PlanError("A IA não conseguiu montar o plano. Tente novamente.", 502);
    throw new PlanError("Não foi possível gerar o plano agora. Tente novamente.", 500);
  }
}
