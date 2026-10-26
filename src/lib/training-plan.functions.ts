import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { validatePlanRequest, type PlanRequest, type TrainingPlan } from "./training-plan";

export const generatePlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: PlanRequest) => {
    const errors = validatePlanRequest(input);
    if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]);
    return input;
  })
  .handler(async ({ data }): Promise<{ plan: TrainingPlan | null; error: string | null }> => {
    const { generateTrainingPlan, PlanError } = await import("./training-plan.server");
    try {
      return { plan: await generateTrainingPlan(data), error: null };
    } catch (e) {
      return { plan: null, error: e instanceof PlanError ? e.message : "Não foi possível gerar o plano agora." };
    }
  });
