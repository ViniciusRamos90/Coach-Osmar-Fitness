import type {
  AppData,
  Exercise,
  FinancialTransaction,
  MuscleGroup,
  SuggestedWorkout,
  Workout,
  WorkoutStatus,
} from "@/lib/types";
import { addDays, toISODate } from "@/lib/format";

export const EXERCISES: Exercise[] = [
  { id: "ex-supino-reto", name: "Supino reto", primaryMuscleGroup: "peito", secondaryMuscleGroups: ["triceps", "ombros"], type: "Força", equipment: "Barra", difficulty: "intermediario", instructions: "Deite no banco, desça a barra até a linha do peito com controle e empurre até estender os braços, mantendo as escápulas retraídas.", suggestedSets: 4, suggestedReps: "8–12" },
  { id: "ex-supino-inclinado", name: "Supino inclinado", primaryMuscleGroup: "peito", secondaryMuscleGroups: ["ombros", "triceps"], type: "Força", equipment: "Halteres", difficulty: "intermediario", instructions: "Com o banco a 30–45°, desça os halteres ao lado do peito e empurre para cima unindo-os levemente no topo.", suggestedSets: 3, suggestedReps: "10–12" },
  { id: "ex-flexao", name: "Flexão de braço", primaryMuscleGroup: "peito", secondaryMuscleGroups: ["triceps", "abdomen"], type: "Força", equipment: "Peso corporal", difficulty: "iniciante", instructions: "Mãos um pouco mais abertas que os ombros, corpo alinhado. Desça até quase tocar o chão e empurre de volta.", suggestedSets: 3, suggestedReps: "10–15" },
  { id: "ex-puxada", name: "Puxada frontal", primaryMuscleGroup: "costas", secondaryMuscleGroups: ["biceps"], type: "Força", equipment: "Máquina", difficulty: "iniciante", instructions: "Puxe a barra em direção ao peito levando os cotovelos para baixo, sem balançar o tronco. Retorne devagar.", suggestedSets: 4, suggestedReps: "10–12" },
  { id: "ex-remada-baixa", name: "Remada baixa", primaryMuscleGroup: "costas", secondaryMuscleGroups: ["biceps"], type: "Força", equipment: "Cabo", difficulty: "iniciante", instructions: "Sentado, puxe o triângulo até o abdômen aproximando as escápulas. Mantenha a coluna neutra.", suggestedSets: 3, suggestedReps: "10–12" },
  { id: "ex-agachamento", name: "Agachamento livre", primaryMuscleGroup: "pernas", secondaryMuscleGroups: ["abdomen"], type: "Força", equipment: "Barra", difficulty: "avancado", instructions: "Barra apoiada no trapézio, pés na largura dos ombros. Desça com o quadril para trás mantendo o tronco firme e suba empurrando o chão.", suggestedSets: 4, suggestedReps: "6–10" },
  { id: "ex-leg-press", name: "Leg press", primaryMuscleGroup: "pernas", secondaryMuscleGroups: [], type: "Força", equipment: "Máquina", difficulty: "iniciante", instructions: "Pés no centro da plataforma, desça até 90° nos joelhos e empurre sem travar as articulações.", suggestedSets: 4, suggestedReps: "10–15" },
  { id: "ex-terra", name: "Levantamento terra", primaryMuscleGroup: "pernas", secondaryMuscleGroups: ["costas", "abdomen"], type: "Força", equipment: "Barra", difficulty: "avancado", instructions: "Barra próxima às canelas, coluna neutra. Estenda quadril e joelhos juntos até ficar em pé, e retorne com controle.", suggestedSets: 3, suggestedReps: "5–8" },
  { id: "ex-cadeira-extensora", name: "Cadeira extensora", primaryMuscleGroup: "pernas", secondaryMuscleGroups: [], type: "Força", equipment: "Máquina", difficulty: "iniciante", instructions: "Estenda os joelhos até o alto, segure por um instante e desça devagar.", suggestedSets: 3, suggestedReps: "12–15" },
  { id: "ex-desenvolvimento", name: "Desenvolvimento de ombros", primaryMuscleGroup: "ombros", secondaryMuscleGroups: ["triceps"], type: "Força", equipment: "Halteres", difficulty: "intermediario", instructions: "Sentado, empurre os halteres da altura das orelhas até acima da cabeça, sem arquear a lombar.", suggestedSets: 3, suggestedReps: "8–12" },
  { id: "ex-elevacao-lateral", name: "Elevação lateral", primaryMuscleGroup: "ombros", secondaryMuscleGroups: [], type: "Força", equipment: "Halteres", difficulty: "iniciante", instructions: "Eleve os halteres lateralmente até a altura dos ombros com os cotovelos levemente flexionados.", suggestedSets: 3, suggestedReps: "12–15" },
  { id: "ex-rosca-direta", name: "Rosca direta", primaryMuscleGroup: "biceps", secondaryMuscleGroups: [], type: "Força", equipment: "Barra", difficulty: "iniciante", instructions: "Cotovelos junto ao corpo, flexione os braços levando a barra até os ombros e desça devagar.", suggestedSets: 3, suggestedReps: "10–12" },
  { id: "ex-rosca-martelo", name: "Rosca martelo", primaryMuscleGroup: "biceps", secondaryMuscleGroups: [], type: "Força", equipment: "Halteres", difficulty: "iniciante", instructions: "Com pegada neutra, flexione os cotovelos alternando os braços, sem balançar o tronco.", suggestedSets: 3, suggestedReps: "10–12" },
  { id: "ex-triceps-polia", name: "Tríceps na polia", primaryMuscleGroup: "triceps", secondaryMuscleGroups: [], type: "Força", equipment: "Cabo", difficulty: "iniciante", instructions: "Cotovelos fixos ao lado do corpo, estenda os braços para baixo e retorne até 90°.", suggestedSets: 3, suggestedReps: "12–15" },
  { id: "ex-triceps-frances", name: "Tríceps francês", primaryMuscleGroup: "triceps", secondaryMuscleGroups: [], type: "Força", equipment: "Halteres", difficulty: "intermediario", instructions: "Segure o halter acima da cabeça, flexione os cotovelos descendo atrás da nuca e estenda novamente.", suggestedSets: 3, suggestedReps: "10–12" },
  { id: "ex-prancha", name: "Prancha abdominal", primaryMuscleGroup: "abdomen", secondaryMuscleGroups: ["ombros"], type: "Isométrico", equipment: "Peso corporal", difficulty: "iniciante", instructions: "Apoie antebraços e pés, mantenha o corpo alinhado e o abdômen contraído pelo tempo indicado.", suggestedSets: 3, suggestedReps: "30–45 s" },
  { id: "ex-abdominal", name: "Abdominal supra", primaryMuscleGroup: "abdomen", secondaryMuscleGroups: [], type: "Força", equipment: "Peso corporal", difficulty: "iniciante", instructions: "Deitado com joelhos flexionados, eleve o tronco contraindo o abdômen e desça com controle.", suggestedSets: 3, suggestedReps: "15–20" },
  { id: "ex-esteira", name: "Caminhada na esteira", primaryMuscleGroup: "cardio", secondaryMuscleGroups: ["pernas"], type: "Cardio", equipment: "Esteira", difficulty: "iniciante", instructions: "Caminhe em ritmo moderado, com leve inclinação se desejar, mantendo respiração confortável.", suggestedSets: 1, suggestedReps: "20–40 min" },
  { id: "ex-bike", name: "Bicicleta ergométrica", primaryMuscleGroup: "cardio", secondaryMuscleGroups: ["pernas"], type: "Cardio", equipment: "Bicicleta", difficulty: "iniciante", instructions: "Pedale em cadência constante, ajustando a carga para manter intensidade moderada.", suggestedSets: 1, suggestedReps: "20–30 min" },
  { id: "ex-burpee", name: "Burpee", primaryMuscleGroup: "corpo_inteiro", secondaryMuscleGroups: ["pernas", "peito", "cardio"], type: "Cardio", equipment: "Peso corporal", difficulty: "intermediario", instructions: "Agache, apoie as mãos, estenda as pernas, volte e salte. Mantenha ritmo constante.", suggestedSets: 4, suggestedReps: "10–12" },
  { id: "ex-mobilidade-quadril", name: "Mobilidade de quadril", primaryMuscleGroup: "pernas", secondaryMuscleGroups: [], type: "Mobilidade", equipment: "Peso corporal", difficulty: "iniciante", instructions: "Em posição 90/90, alterne lentamente a rotação dos quadris, respirando de forma controlada.", suggestedSets: 2, suggestedReps: "8 por lado" },
];

export const SUGGESTIONS: SuggestedWorkout[] = [
  { id: "sg-peito-triceps", name: "Treino de peito e tríceps", description: "Sessão clássica de empurrar com foco em volume para peitoral e tríceps.", category: "Hipertrofia", difficulty: "intermediario", durationMinutes: 55, muscleGroups: ["peito", "triceps"], estimatedCalories: 380, exercises: [{ exerciseId: "ex-supino-reto", sets: 4, reps: 10 }, { exerciseId: "ex-supino-inclinado", sets: 3, reps: 12 }, { exerciseId: "ex-flexao", sets: 3, reps: 12 }, { exerciseId: "ex-triceps-polia", sets: 3, reps: 12 }, { exerciseId: "ex-triceps-frances", sets: 3, reps: 10 }] },
  { id: "sg-costas-biceps", name: "Treino de costas e bíceps", description: "Puxadas e remadas para dorsais, finalizando com flexores do cotovelo.", category: "Hipertrofia", difficulty: "intermediario", durationMinutes: 60, muscleGroups: ["costas", "biceps"], estimatedCalories: 400, exercises: [{ exerciseId: "ex-puxada", sets: 4, reps: 10 }, { exerciseId: "ex-remada-baixa", sets: 4, reps: 10 }, { exerciseId: "ex-rosca-direta", sets: 3, reps: 10 }, { exerciseId: "ex-rosca-martelo", sets: 3, reps: 12 }] },
  { id: "sg-pernas", name: "Treino completo de pernas", description: "Exercícios compostos e isolados para quadríceps, posteriores e glúteos.", category: "Força", difficulty: "avancado", durationMinutes: 65, muscleGroups: ["pernas"], estimatedCalories: 480, exercises: [{ exerciseId: "ex-agachamento", sets: 4, reps: 8 }, { exerciseId: "ex-leg-press", sets: 4, reps: 12 }, { exerciseId: "ex-terra", sets: 3, reps: 6 }, { exerciseId: "ex-cadeira-extensora", sets: 3, reps: 15 }] },
  { id: "sg-circuito", name: "Circuito de corpo inteiro", description: "Circuito dinâmico com pouco descanso para elevar a frequência cardíaca.", category: "Corpo inteiro", difficulty: "intermediario", durationMinutes: 45, muscleGroups: ["corpo_inteiro"], estimatedCalories: 420, exercises: [{ exerciseId: "ex-burpee", sets: 4, reps: 10 }, { exerciseId: "ex-flexao", sets: 4, reps: 12 }, { exerciseId: "ex-leg-press", sets: 3, reps: 15 }, { exerciseId: "ex-prancha", sets: 3, reps: 1 }] },
  { id: "sg-cardio", name: "Cardio moderado", description: "Sessão contínua em intensidade moderada para condicionamento.", category: "Cardio", difficulty: "iniciante", durationMinutes: 35, muscleGroups: ["cardio"], estimatedCalories: 300, exercises: [{ exerciseId: "ex-esteira", sets: 1, reps: 1 }, { exerciseId: "ex-bike", sets: 1, reps: 1 }] },
  { id: "sg-mobilidade", name: "Mobilidade e recuperação", description: "Movimentos leves para amplitude articular e recuperação ativa.", category: "Mobilidade", difficulty: "iniciante", durationMinutes: 25, muscleGroups: ["pernas", "abdomen"], estimatedCalories: 110, exercises: [{ exerciseId: "ex-mobilidade-quadril", sets: 2, reps: 8 }, { exerciseId: "ex-prancha", sets: 2, reps: 1 }] },
  { id: "sg-ombros-abdomen", name: "Ombros e abdômen", description: "Deltoides e core com cargas moderadas.", category: "Resistência", difficulty: "iniciante", durationMinutes: 45, muscleGroups: ["ombros", "abdomen"], estimatedCalories: 300, exercises: [{ exerciseId: "ex-desenvolvimento", sets: 3, reps: 10 }, { exerciseId: "ex-elevacao-lateral", sets: 3, reps: 15 }, { exerciseId: "ex-abdominal", sets: 3, reps: 20 }, { exerciseId: "ex-prancha", sets: 3, reps: 1 }] },
];

export const exerciseById = (id?: string) => EXERCISES.find((e) => e.id === id);

/** Builds demo data relative to `today` so the dashboard always looks current. */
export function createSeedData(today: Date = new Date()): AppData {
  const d = (offset: number) => toISODate(addDays(today, offset));
  let n = 0;
  const wk = (
    daysAgo: number,
    name: string,
    groups: MuscleGroup[],
    duration: number,
    calories: number | undefined,
    status: WorkoutStatus,
    exIds: string[],
    startTime = "07:00",
    notes?: string,
  ): Workout => {
    const id = `w-seed-${++n}`;
    return {
      id,
      name,
      date: d(-daysAgo),
      startTime,
      durationMinutes: status === "concluido" ? duration : status === "planejado" ? duration : 0,
      muscleGroups: groups,
      estimatedCalories: status === "concluido" ? calories : undefined,
      status,
      notes,
      exercises: exIds.map((eid, i) => {
        const ex = exerciseById(eid)!;
        return { id: `${id}-e${i}`, exerciseId: eid, name: ex.name, sets: ex.suggestedSets ?? 3, reps: 10, loadKg: ex.type === "Força" ? 20 + i * 5 : undefined };
      }),
    };
  };

  const workouts: Workout[] = [
    wk(-3, "Pernas", ["pernas"], 65, undefined, "planejado", ["ex-agachamento", "ex-leg-press"]),
    wk(-1, "Cardio", ["cardio"], 30, undefined, "planejado", ["ex-esteira"]),
    wk(0, "Peito e tríceps", ["peito", "triceps"], 55, 390, "concluido", ["ex-supino-reto", "ex-supino-inclinado", "ex-triceps-polia"], "07:10", "Boa disposição, carga mantida."),
    wk(1, "Cardio", ["cardio"], 30, 260, "concluido", ["ex-esteira"], "18:30"),
    wk(2, "Pernas", ["pernas"], 65, undefined, "nao_realizado", ["ex-agachamento", "ex-leg-press"], "07:00", "Compromisso no trabalho."),
    wk(3, "Costas e bíceps", ["costas", "biceps"], 60, 410, "concluido", ["ex-puxada", "ex-remada-baixa", "ex-rosca-direta"]),
    wk(4, "Ombros e abdômen", ["ombros", "abdomen"], 45, 300, "concluido", ["ex-desenvolvimento", "ex-elevacao-lateral", "ex-prancha"]),
    wk(6, "Corpo inteiro", ["corpo_inteiro"], 50, 430, "concluido", ["ex-burpee", "ex-flexao", "ex-leg-press"]),
    wk(8, "Peito e tríceps", ["peito", "triceps"], 55, 370, "concluido", ["ex-supino-reto", "ex-triceps-frances"]),
    wk(9, "Pernas", ["pernas"], 65, 470, "concluido", ["ex-agachamento", "ex-terra", "ex-cadeira-extensora"]),
    wk(11, "Cardio", ["cardio"], 35, 290, "concluido", ["ex-bike"], "19:00"),
    wk(13, "Costas e bíceps", ["costas", "biceps"], 60, 400, "concluido", ["ex-puxada", "ex-rosca-martelo"]),
    wk(15, "Ombros e abdômen", ["ombros", "abdomen"], 45, undefined, "nao_realizado", ["ex-desenvolvimento"]),
    wk(17, "Peito e tríceps", ["peito", "triceps"], 50, 350, "concluido", ["ex-supino-reto", "ex-flexao"]),
    wk(20, "Corpo inteiro", ["corpo_inteiro"], 50, 420, "concluido", ["ex-burpee", "ex-prancha"]),
    wk(24, "Cardio", ["cardio"], 30, 250, "concluido", ["ex-esteira"]),
    wk(31, "Costas e bíceps", ["costas", "biceps"], 55, 380, "concluido", ["ex-remada-baixa"]),
    wk(45, "Pernas", ["pernas"], 60, 450, "concluido", ["ex-leg-press"]),
  ];

  const measurements = [
    { id: "m-seed-1", date: d(-84), weightKg: 86, waistCm: 98, abdomenCm: 101, chestCm: 108, hipCm: 106, armCm: 36, thighCm: 60, notes: "Medição inicial." },
    { id: "m-seed-2", date: d(-63), weightKg: 85.1, waistCm: 96.5, abdomenCm: 99.5, chestCm: 107.5, hipCm: 105, armCm: 36, thighCm: 59.5 },
    { id: "m-seed-3", date: d(-42), weightKg: 84.2, waistCm: 95, abdomenCm: 98, chestCm: 107, hipCm: 104.5, armCm: 36.5, thighCm: 59 },
    { id: "m-seed-4", date: d(-28), weightKg: 83.6, waistCm: 94, abdomenCm: 97 },
    { id: "m-seed-5", date: d(-14), weightKg: 83, waistCm: 93, abdomenCm: 96, chestCm: 106.5, hipCm: 103.5, armCm: 37, thighCm: 58.5 },
    { id: "m-seed-6", date: d(-7), weightKg: 82.5, waistCm: 92.5, abdomenCm: 95 },
  ];

  const transactions: FinancialTransaction[] = [
    { id: "t-seed-1", type: "entrada", description: "Mensalidade aluno A", category: "Mensalidade recebida", amount: 250, date: d(-2) },
    { id: "t-seed-2", type: "saida", description: "Mensalidade da academia", category: "Academia", amount: 129.9, date: d(-4) },
    { id: "t-seed-3", type: "saida", description: "Whey protein 900 g", category: "Suplementação", amount: 159.9, date: d(-6) },
    { id: "t-seed-4", type: "entrada", description: "Consultoria de treino online", category: "Consultoria", amount: 180, date: d(-9) },
    { id: "t-seed-5", type: "saida", description: "Par de halteres 10 kg", category: "Equipamentos", amount: 220, date: d(-15) },
    { id: "t-seed-6", type: "saida", description: "Combustível até a academia", category: "Transporte", amount: 60, date: d(-18) },
    { id: "t-seed-7", type: "entrada", description: "Mensalidade aluno B", category: "Mensalidade recebida", amount: 250, date: d(-25) },
    { id: "t-seed-8", type: "saida", description: "Creatina 300 g", category: "Suplementação", amount: 89.9, date: d(-33) },
    { id: "t-seed-9", type: "saida", description: "Faixa elástica", category: "Outros", amount: 45, date: d(-50) },
  ];

  return {
    profile: {
      id: "u-demo",
      name: "Vinícius",
      email: "vinicius.demo@example.com",
      heightCm: 178,
      initialWeightKg: 86,
      goal: "Redução de gordura e condicionamento",
      startDate: d(-90),
    },
    workouts,
    measurements,
    transactions,
  };
}
