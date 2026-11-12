// Associações das animações licenciadas (revisão visual). Chave = ID do exercício.
import m0 from "@/assets/exercises/supino-reto-barra.gif.asset.json";
import m1 from "@/assets/exercises/supino-inclinado-halteres.gif.asset.json";
import m2 from "@/assets/exercises/flexao.gif.asset.json";
import m3 from "@/assets/exercises/crucifixo-polia.gif.asset.json";
import m4 from "@/assets/exercises/remada-curvada.gif.asset.json";
import m5 from "@/assets/exercises/puxada-frente.gif.asset.json";
import m6 from "@/assets/exercises/barra-fixa.gif.asset.json";
import m7 from "@/assets/exercises/remada-unilateral.gif.asset.json";
import m8 from "@/assets/exercises/remada-maquina.gif.asset.json";
import m9 from "@/assets/exercises/desenvolvimento-halteres.gif.asset.json";
import m10 from "@/assets/exercises/elevacao-lateral.gif.asset.json";
import m11 from "@/assets/exercises/rosca-direta.gif.asset.json";
import m12 from "@/assets/exercises/rosca-martelo.gif.asset.json";
import m13 from "@/assets/exercises/triceps-polia.gif.asset.json";
import m14 from "@/assets/exercises/triceps-frances.gif.asset.json";
import m15 from "@/assets/exercises/mergulho-banco.gif.asset.json";
import m16 from "@/assets/exercises/agachamento-livre.gif.asset.json";
import m17 from "@/assets/exercises/leg-press.gif.asset.json";
import m18 from "@/assets/exercises/cadeira-extensora.gif.asset.json";
import m19 from "@/assets/exercises/afundo.gif.asset.json";
import m20 from "@/assets/exercises/levantamento-romeno.gif.asset.json";
import m21 from "@/assets/exercises/mesa-flexora.gif.asset.json";
import m22 from "@/assets/exercises/panturrilha-pe.gif.asset.json";
import m23 from "@/assets/exercises/panturrilha-halter.gif.asset.json";
import m24 from "@/assets/exercises/prancha.gif.asset.json";
import m25 from "@/assets/exercises/elevacao-pernas.gif.asset.json";

export const EXERCISE_MEDIA: Partial<Record<string, string>> = {
  "ex-supino-reto-barra": m0.url,
  "ex-supino-inclinado-halteres": m1.url,
  "ex-flexao": m2.url,
  "ex-crucifixo-polia": m3.url,
  "ex-remada-curvada": m4.url,
  "ex-puxada-frente": m5.url,
  "ex-barra-fixa": m6.url,
  "ex-remada-unilateral": m7.url,
  "ex-remada-maquina": m8.url,
  "ex-desenvolvimento-halteres": m9.url,
  "ex-elevacao-lateral": m10.url,
  "ex-rosca-direta": m11.url,
  "ex-rosca-martelo": m12.url,
  "ex-triceps-polia": m13.url,
  "ex-triceps-frances": m14.url,
  "ex-mergulho-banco": m15.url,
  "ex-agachamento-livre": m16.url,
  "ex-leg-press": m17.url,
  "ex-cadeira-extensora": m18.url,
  "ex-afundo": m19.url,
  "ex-levantamento-romeno": m20.url,
  "ex-mesa-flexora": m21.url,
  "ex-panturrilha-pe": m22.url,
  "ex-panturrilha-halter": m23.url,
  "ex-prancha": m24.url,
  "ex-elevacao-pernas": m25.url,
};

// Ilustrações originais (estáticas) criadas para os 8 seeds sem animação licenciada.
import o0 from "@/assets/exercises/face-pull.jpg";
import o1 from "@/assets/exercises/rosca-elastico.jpg";
import o2 from "@/assets/exercises/agachamento-goblet.jpg";
import o3 from "@/assets/exercises/ponte-gluteo.jpg";
import o4 from "@/assets/exercises/kettlebell-swing.jpg";
import o5 from "@/assets/exercises/abducao-elastico.jpg";
import o6 from "@/assets/exercises/abdominal-polia.jpg";
import o7 from "@/assets/exercises/dead-bug.jpg";
import { LIBRARY_MEDIA } from "./library-media";

export type ReviewStatus = "approved" | "pending";
export interface VisualEntry {
  /** URL do asset; dois exercícios podem apontar para o mesmo asset sem duplicar o arquivo. */
  src: string;
  alt: string;
  source: "licensed" | "original";
  reviewStatus: ReviewStatus;
  reviewedAt?: string;
  reviewedBy?: string;
}

const ORIGINAL: Record<string, [string, string]> = {
  "ex-face-pull": [o0, "Ilustração: puxada da corda na polia em direção ao rosto, cotovelos altos"],
  "ex-rosca-elastico": [o1, "Ilustração: rosca de bíceps em pé pisando no elástico"],
  "ex-agachamento-goblet": [o2, "Ilustração: agachamento segurando kettlebell junto ao peito"],
  "ex-ponte-gluteo": [o3, "Ilustração: deitado de costas elevando o quadril na ponte de glúteo"],
  "ex-kettlebell-swing": [o4, "Ilustração: balanço do kettlebell à frente com quadril estendido"],
  "ex-abducao-elastico": [o5, "Ilustração: meio agachamento afastando os joelhos contra mini elástico"],
  "ex-abdominal-polia": [o6, "Ilustração: ajoelhado na polia alta flexionando o tronco com a corda"],
  "ex-dead-bug": [o7, "Ilustração: inseto morto estendendo braço e perna opostos"],
};

/** Registro de revisão visual. Sem resultado detalhado persistido → "pending" (nunca inventar aprovação). */
export const REVIEW_LOG: Partial<Record<string, Pick<VisualEntry, "reviewStatus" | "reviewedAt" | "reviewedBy">>> = {};

/** Manifesto central: resolve a imagem por exerciseId estável. */
export function resolveVisual(id: string, name = ""): VisualEntry | undefined {
  const review = REVIEW_LOG[id] ?? { reviewStatus: "pending" as const };
  const original = ORIGINAL[id];
  if (original) return { src: original[0], alt: original[1], source: "original", ...review };
  const licensed = EXERCISE_MEDIA[id] ?? (id.startsWith("lib-") ? LIBRARY_MEDIA[Number(id.slice(4))] : undefined);
  if (licensed) return { src: licensed, alt: `Demonstração do movimento: ${name}`.trim(), source: "licensed", ...review };
  return undefined;
}
