import type { Equipment, Exercise, Muscle } from "./models";

// Catálogo original de demonstração (textos próprios deste projeto).
type Seed = [id: string, name: string, muscles: Muscle[], equipment: Equipment, steps: string[], caution: string];

const GENERAL = "Pare se sentir dor aguda. Em caso de lesão ou condição de saúde, busque orientação profissional.";

const SEEDS: Seed[] = [
  ["ex-supino-reto-barra", "Supino reto com barra", ["peito", "triceps", "ombros"], "barra", ["Deite no banco com os pés firmes no chão.", "Desça a barra até a linha do peito com controle.", "Empurre até estender os braços sem travar os cotovelos."], "Use apoio de segurança ou parceiro em cargas altas."],
  ["ex-supino-inclinado-halteres", "Supino inclinado com halteres", ["peito", "ombros"], "halteres", ["Ajuste o banco entre 30° e 45°.", "Desça os halteres ao lado do peito.", "Suba aproximando-os levemente no alto."], "Mantenha os punhos alinhados aos antebraços."],
  ["ex-flexao", "Flexão de braços", ["peito", "triceps", "abdomen"], "peso-corporal", ["Mãos um pouco além da largura dos ombros.", "Corpo alinhado da cabeça aos pés.", "Desça o peito perto do chão e empurre de volta."], "Apoie os joelhos para reduzir a intensidade."],
  ["ex-crucifixo-polia", "Crucifixo na polia", ["peito"], "polia", ["Fique entre as polias com um passo à frente.", "Com cotovelos levemente flexionados, una as mãos à frente.", "Retorne abrindo os braços devagar."], "Evite abrir além do confortável para o ombro."],
  ["ex-remada-curvada", "Remada curvada com barra", ["costas", "biceps"], "barra", ["Incline o tronco à frente com coluna neutra.", "Puxe a barra em direção ao umbigo.", "Desça com controle."], "Não arredonde a lombar."],
  ["ex-puxada-frente", "Puxada frontal na polia", ["costas", "biceps"], "polia", ["Segure a barra um pouco além dos ombros.", "Puxe até a parte alta do peito.", "Volte estendendo os braços sem soltar o peso."], "Não puxe atrás da nuca."],
  ["ex-barra-fixa", "Barra fixa", ["costas", "biceps"], "peso-corporal", ["Pendure-se com as mãos em pronação.", "Puxe até o queixo passar a barra.", "Desça até estender os braços."], "Use elástico de assistência se necessário."],
  ["ex-remada-unilateral", "Remada unilateral com halter", ["costas"], "halteres", ["Apoie joelho e mão no banco.", "Puxe o halter em direção ao quadril.", "Desça alongando as costas."], "Mantenha o tronco estável, sem girar."],
  ["ex-remada-maquina", "Remada sentada na máquina", ["costas", "biceps"], "maquina", ["Ajuste o apoio do peito.", "Puxe as alças levando os cotovelos para trás.", "Retorne devagar."], GENERAL],
  ["ex-desenvolvimento-halteres", "Desenvolvimento com halteres", ["ombros", "triceps"], "halteres", ["Sente com as costas apoiadas.", "Empurre os halteres acima da cabeça.", "Desça até a altura das orelhas."], "Evite arquear excessivamente a lombar."],
  ["ex-elevacao-lateral", "Elevação lateral", ["ombros"], "halteres", ["Em pé, halteres ao lado do corpo.", "Eleve os braços até a altura dos ombros.", "Desça devagar."], "Use cargas leves e movimentos controlados."],
  ["ex-face-pull", "Puxada para o rosto na polia", ["ombros", "costas"], "polia", ["Use a corda na altura dos olhos.", "Puxe em direção ao rosto abrindo os cotovelos.", "Retorne com controle."], GENERAL],
  ["ex-rosca-direta", "Rosca direta com barra", ["biceps"], "barra", ["Em pé, barra à frente das coxas.", "Flexione os cotovelos sem mover os ombros.", "Desça até estender."], "Não balance o tronco para subir."],
  ["ex-rosca-martelo", "Rosca martelo", ["biceps"], "halteres", ["Palmas voltadas uma para a outra.", "Flexione os cotovelos alternadamente ou juntos.", "Desça com controle."], GENERAL],
  ["ex-rosca-elastico", "Rosca com elástico", ["biceps"], "elastico", ["Pise no elástico com os dois pés.", "Flexione os cotovelos.", "Retorne devagar."], "Verifique se o elástico não tem rasgos."],
  ["ex-triceps-polia", "Tríceps na polia", ["triceps"], "polia", ["Cotovelos junto ao corpo.", "Empurre a barra ou corda para baixo.", "Volte até 90° sem afastar os cotovelos."], GENERAL],
  ["ex-triceps-frances", "Tríceps acima da cabeça com halter", ["triceps"], "halteres", ["Segure um halter com as duas mãos acima da cabeça.", "Desça atrás da nuca flexionando os cotovelos.", "Estenda os braços."], "Use carga moderada para proteger os cotovelos."],
  ["ex-mergulho-banco", "Mergulho no banco", ["triceps", "peito"], "peso-corporal", ["Mãos no banco atrás do corpo.", "Desça flexionando os cotovelos.", "Empurre de volta."], "Evite descer além do confortável para os ombros."],
  ["ex-agachamento-livre", "Agachamento com barra", ["quadriceps", "gluteos"], "barra", ["Barra apoiada no alto das costas.", "Desça empurrando o quadril para trás e para baixo.", "Suba mantendo o peito aberto."], "Use suportes de segurança no rack."],
  ["ex-agachamento-goblet", "Agachamento goblet", ["quadriceps", "gluteos"], "kettlebell", ["Segure o peso junto ao peito.", "Agache mantendo os calcanhares no chão.", "Suba estendendo quadril e joelhos."], GENERAL],
  ["ex-leg-press", "Leg press", ["quadriceps", "gluteos"], "maquina", ["Pés na plataforma na largura do quadril.", "Desça até um ângulo confortável.", "Empurre sem travar os joelhos."], "Não tire a lombar do encosto."],
  ["ex-cadeira-extensora", "Cadeira extensora", ["quadriceps"], "maquina", ["Ajuste o rolo acima dos tornozelos.", "Estenda os joelhos.", "Desça com controle."], GENERAL],
  ["ex-afundo", "Afundo alternado", ["quadriceps", "gluteos"], "halteres", ["Dê um passo à frente.", "Desça até os dois joelhos formarem cerca de 90°.", "Volte e troque a perna."], "Use apoio para equilíbrio se precisar."],
  ["ex-levantamento-romeno", "Levantamento terra romeno", ["posteriores", "gluteos", "costas"], "barra", ["Segure a barra à frente das coxas.", "Leve o quadril para trás com joelhos semiflexionados.", "Volte contraindo os glúteos."], "Mantenha a coluna neutra o tempo todo."],
  ["ex-mesa-flexora", "Mesa flexora", ["posteriores"], "maquina", ["Deite de bruços com o rolo nos tornozelos.", "Flexione os joelhos.", "Desça devagar."], GENERAL],
  ["ex-ponte-gluteo", "Ponte de glúteo", ["gluteos", "posteriores"], "peso-corporal", ["Deite com joelhos flexionados.", "Eleve o quadril contraindo os glúteos.", "Desça sem encostar totalmente."], GENERAL],
  ["ex-kettlebell-swing", "Balanço com kettlebell", ["gluteos", "posteriores"], "kettlebell", ["Pés afastados, kettlebell entre as pernas.", "Projete o quadril à frente para balançar o peso.", "Deixe descer e repita."], "Aprenda o movimento com carga leve."],
  ["ex-abducao-elastico", "Abdução com elástico", ["gluteos"], "elastico", ["Elástico acima dos joelhos.", "Afaste os joelhos contra a resistência.", "Retorne devagar."], GENERAL],
  ["ex-panturrilha-pe", "Elevação de panturrilha em pé", ["panturrilhas"], "maquina", ["Ponta dos pés na plataforma.", "Suba o máximo possível.", "Desça alongando."], GENERAL],
  ["ex-panturrilha-halter", "Panturrilha unilateral com halter", ["panturrilhas"], "halteres", ["Apoie uma das mãos para equilíbrio.", "Suba na ponta de um pé.", "Desça devagar."], GENERAL],
  ["ex-prancha", "Prancha", ["abdomen"], "peso-corporal", ["Apoie antebraços e pontas dos pés.", "Mantenha o corpo alinhado.", "Respire de forma contínua."], "Não deixe o quadril cair."],
  ["ex-abdominal-polia", "Abdominal ajoelhado na polia", ["abdomen"], "polia", ["Ajoelhe segurando a corda junto à cabeça.", "Flexione o tronco para baixo.", "Retorne com controle."], GENERAL],
  ["ex-elevacao-pernas", "Elevação de pernas deitado", ["abdomen"], "peso-corporal", ["Deite com as mãos ao lado do corpo.", "Eleve as pernas estendidas.", "Desça sem tocar o chão."], "Flexione os joelhos se sentir a lombar."],
  ["ex-dead-bug", "Inseto morto", ["abdomen"], "peso-corporal", ["Deite com braços e joelhos elevados.", "Estenda braço e perna opostos.", "Volte e alterne."], GENERAL],
];

export function buildCatalog(): Exercise[] {
  return SEEDS.map(([id, name, muscleGroups, equipment, instructions, caution]) => ({ id, name, muscleGroups, equipment, instructions, caution, isFavorite: false }));
}
