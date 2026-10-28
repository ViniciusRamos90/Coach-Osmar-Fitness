# Coach Osmar Fitness

# PRD — Coach Osmar
## Prompt inicial para criação de aplicativo no Lovable — UI-First

### 1. Visão geral do projeto

Crie um aplicativo web responsivo chamado Coach Osmar, uma plataforma pessoal de gerenciamento de treinos, acompanhamento da evolução física e organização de registros de atividades e movimentações financeiras relacionadas aos treinos.

O objetivo é oferecer uma experiência simples, moderna e personalizada para acompanhar o progresso físico, organizar os treinos realizados, visualizar indicadores de evolução e manter um histórico organizado.

O aplicativo deverá funcionar como um protótipo frontend completo, utilizando dados fictícios e estado local. Nesta primeira fase, não implementar backend, banco de dados, autenticação, APIs externas ou integrações com serviços de terceiros.

O foco principal é entregar uma interface navegável, com telas consistentes, componentes reutilizáveis, interações funcionais e experiência de uso próxima à de um produto real.

### 2. Objetivos do produto

- Centralizar informações pessoais e registros de treino.
- Facilitar o acompanhamento da frequência semanal.
- Registrar duração, grupos musculares trabalhados e gasto calórico estimado.
- Acompanhar peso, altura, medidas corporais e objetivos.
- Visualizar a evolução física por meio de gráficos.
- Identificar tendências e apresentar sugestões de melhoria.
- Permitir cadastrar, visualizar, editar e excluir registros.
- Controlar entradas e saídas financeiras relacionadas às atividades.
- Oferecer navegação intuitiva, principalmente em dispositivos móveis.

Princípio fundamental: simplicidade acima de complexidade. Não criar funcionalidades desnecessárias, fluxos extensos ou telas excessivamente carregadas.

### 3. Escopo da primeira versão

Implementar somente o frontend.

Tecnologias e diretrizes sugeridas:

- React com TypeScript.
- Vite, caso seja compatível com a estrutura padrão do projeto gerado.
- Tailwind CSS.
- Componentes shadcn/ui.
- Ícones Lucide.
- Recharts para gráficos.
- Tipografia Inter.
- Estado local com React hooks e componentes reutilizáveis.
- Dados mockados em arquivos separados da interface.
- Sem serviços externos, backend, banco de dados, autenticação ou chamadas de API.

Todos os botões e formulários apresentados devem executar ações coerentes dentro do protótipo.

Não criar botões decorativos sem comportamento. Quando uma funcionalidade não estiver implementada nesta etapa, não apresentar uma falsa confirmação de que ela foi executada em um sistema externo.

### 4. Identidade visual e design system

Criar uma identidade visual esportiva, tecnológica, elegante e minimalista.

Nome oficial: Coach Osmar.

Logotipo: criar um wordmark tipográfico simples com o nome Coach Osmar e um pequeno símbolo geométrico relacionado a movimento, evolução ou desempenho. Não depender de imagens externas para exibir a marca.

Tema: exclusivamente dark mode. Não implementar alternância para tema claro.

Paleta sugerida:

- Fundo principal: #0B0D10.
- Fundo secundário: #11151B.
- Superfície dos cards: #171C24.
- Superfície elevada: #1E2530.
- Bordas: #2A313D.
- Texto principal: #F3F5F7.
- Texto secundário: #9BA5B4.
- Cor de destaque: verde-lima #B6F36B.
- Cor de sucesso: verde.
- Cor de alerta: âmbar.
- Cor de erro: vermelho.

Usar as cores sem exagero. A cor verde-lima deve destacar ações principais, progresso positivo e indicadores importantes.

Tipografia: Inter, com hierarquia clara entre títulos, valores numéricos, subtítulos e textos auxiliares. Evitar excesso de pesos tipográficos e priorizar legibilidade.

Componentes:

- Cards com cantos arredondados moderados.
- Bordas discretas.
- Sombras sutis, sem efeitos exagerados.
- Ícones Lucide com tamanhos consistentes.
- Botões com estados hover, focus, active e disabled.
- Inputs com rótulos claros.
- Gráficos com cores compatíveis com o tema.
- Animações discretas de aproximadamente 150 a 250 ms.
- Espaçamentos consistentes em múltiplos de 4 ou 8 pixels.

Não utilizar gradientes intensos, excesso de cores, glassmorphism exagerado ou elementos decorativos que prejudiquem a leitura.

### 5. Layout e navegação

A aplicação deverá funcionar em celulares, tablets e computadores.

No celular:

- Utilizar uma área principal com rolagem vertical.
- Criar um menu fixo na parte inferior.
- Reservar espaço inferior para que o menu não cubra o conteúdo.
- Manter formulários e botões confortáveis para interação por toque.
- Utilizar cards empilhados e gráficos adaptados à largura disponível.

No desktop:

- Aproveitar melhor a largura da tela.
- Manter o menu inferior fixo, conforme a identidade solicitada.
- Centralizar o conteúdo quando necessário, evitando linhas excessivamente largas.
- Organizar cards em colunas quando houver espaço.
- Preservar a mesma hierarquia visual utilizada no celular.

O menu inferior deverá conter cinco itens:

1. Treinos — painel principal e acompanhamento.
2. Atividades — histórico e registros de atividades.
3. Explorar — exercícios e sugestões de treinamento.
4. Exercícios — catálogo de exercícios.
5. Corpo — medidas e evolução física.

Cada item deverá ter um ícone Lucide, um rótulo curto e um estado visual para indicar a seção ativa.

O item selecionado deve ser facilmente identificável pela cor de destaque e por uma alteração sutil no ícone.

Acessar o perfil por meio de um avatar ou botão de perfil localizado no cabeçalho. Não criar um sexto item no menu inferior.

### 6. Estrutura das telas

#### 6.1. Tela Treinos — Dashboard principal

Esta será a tela inicial do aplicativo.

Cabeçalho:

- Logotipo Coach Osmar.
- Saudação dinâmica, como “Bom dia, Vinícius”.
- Data atual.
- Avatar do usuário.
- Ação para abrir o perfil.

Utilizar um nome fictício de usuário nos dados de demonstração. A saudação deve utilizar o horário local do dispositivo.

Linha 1 — Resumo do usuário e indicadores.

Criar cards com os seguintes indicadores:

- Nome do usuário.
- Peso inicial.
- Peso atual.
- Altura.
- Objetivo principal.
- Presenças na semana.
- Faltas na semana.
- Total de treinos concluídos na semana.

Exemplo de apresentação:

- Peso inicial: 86 kg.
- Peso atual: 82,5 kg.
- Altura: 1,78 m.
- Objetivo: redução de gordura e condicionamento.
- Presenças na semana: 4.
- Faltas na semana: 1.
- Treinos concluídos: 4.

Os dados devem ser fictícios e consistentes entre todas as telas.

Permitir a visualização de um resumo compacto dos dados corporais, sem sobrecarregar o dashboard.

Linha 2 — Gráficos de evolução.

Gráfico A: evolução do peso.

- Tipo: gráfico de barras.
- Exibir os valores registrados ao longo do tempo.
- Permitir selecionar períodos de 7 dias, 30 dias e 90 dias.
- Apresentar data e peso ao passar o cursor ou tocar em um ponto.
- Utilizar cores discretas e destacar o último registro.
- Exibir uma mensagem quando não houver dados suficientes.

Gráfico B: gasto calórico dos treinos.

- Tipo: gráfico de linha.
- Exibir as calorias estimadas de cada treino.
- Apresentar os últimos treinos registrados.
- Mostrar data, nome do treino e calorias estimadas ao interagir com o gráfico.
- Permitir filtrar o período.
- Informar que os valores calóricos são estimativas fictícias no protótipo.

Os gráficos deverão ser responsivos e utilizar Recharts. Não criar gráficos estáticos que não respondam às mudanças dos dados locais.

Linha 3 — Insights e recomendações.

Criar uma seção chamada “Insights do seu treino”.

Exibir até três recomendações contextuais baseadas nos dados mockados e nos registros adicionados pelo usuário.

Exemplos:

- “Você treinou quatro vezes nesta semana. Continue acompanhando sua consistência.”
- “Seu último registro de peso foi há sete dias. Atualize sua medida para acompanhar a evolução.”
- “O grupo muscular pernas recebeu menos registros neste período.”
- “Considere respeitar os intervalos de recuperação entre sessões do mesmo grupo muscular.”

Os insights devem utilizar regras simples executadas no frontend.

Não apresentar recomendações como diagnósticos médicos ou afirmar que o usuário possui uma condição de saúde.

Quando não existirem registros suficientes, exibir uma orientação para adicionar o primeiro treino.

Linha 4 — Filtros e grupos musculares.

Criar uma seção com o título “Treinos por grupo muscular”.

Disponibilizar filtros:

- Todos.
- Peito.
- Costas.
- Pernas.
- Ombros.
- Bíceps.
- Tríceps.
- Abdômen.
- Cardio.
- Corpo inteiro.

Os filtros devem atualizar a lista de treinos exibida na tela sem recarregar a aplicação.

Mostrar um resumo da quantidade de sessões registradas por grupo muscular no período selecionado.

Linha 5 — Próximas ações.

Adicionar atalhos para:

- Registrar treino.
- Registrar peso ou medidas.
- Ver histórico.
- Adicionar entrada ou saída financeira.

O botão principal da tela deve ser “Registrar treino”.

Ao clicar, abrir um modal ou painel lateral com o formulário de registro, respeitando o espaço disponível em dispositivos móveis.

### 7. Tela Atividades — Histórico e registros

Esta tela centralizará os treinos realizados e as movimentações financeiras.

Organizar o conteúdo em duas abas:

- Treinos.
- Financeiro.

#### 7.1. Aba Treinos

Exibir uma tabela ou lista responsiva com:

- Data.
- Nome do treino.
- Grupo muscular.
- Duração.
- Calorias estimadas.
- Status.
- Ações.

Status possíveis:

- Concluído.
- Não realizado.
- Planejado.

No celular, transformar cada linha em um card compacto, sem exigir rolagem horizontal.

Disponibilizar filtros simples:

- Período.
- Grupo muscular.
- Status.
- Busca por nome do treino.

Permitir ordenar os registros por data e duração.

Ações de cada registro:

- Visualizar detalhes.
- Editar.
- Excluir.

Ao visualizar detalhes, mostrar os exercícios associados, a duração, a data, o grupo muscular e as observações.

Ao editar, preencher o formulário com os valores existentes.

Ao excluir, solicitar confirmação antes de remover o registro do estado local.

Adicionar botão “Novo treino”.

#### 7.2. Formulário de treino

Campos:

- Nome do treino.
- Data.
- Horário de início, opcional.
- Duração em minutos.
- Grupo muscular.
- Exercícios realizados.
- Calorias estimadas, opcional.
- Status.
- Observações, opcional.

Validar campos obrigatórios e valores numéricos.

A duração deve ser maior que zero quando o treino estiver concluído.

Permitir adicionar vários exercícios ao mesmo treino por meio de uma lista simples com nome, séries, repetições e carga opcional.

Os exercícios poderão ser selecionados no catálogo local ou digitados manualmente.

Ao salvar:

- Criar um novo registro no estado local.
- Atualizar a lista de atividades.
- Atualizar os indicadores do dashboard.
- Atualizar os gráficos quando houver dados aplicáveis.
- Exibir uma notificação de sucesso.

Ao cancelar, fechar o formulário sem alterar os dados.

#### 7.3. Aba Financeiro

Criar uma interface simples para controle de entradas e saídas financeiras pessoais relacionadas à atividade física.

Exibir cards de resumo:

- Total de entradas.
- Total de saídas.
- Saldo do período.

O saldo deve ser calculado como entradas menos saídas.

Criar uma lista ou tabela com:

- Data.
- Descrição.
- Categoria.
- Tipo.
- Valor.
- Ações.

Tipos de movimentação:

- Entrada.
- Saída.

Categorias sugeridas:

- Mensalidade recebida.
- Consultoria.
- Equipamentos.
- Academia.
- Suplementação.
- Transporte.
- Outros.

Permitir cadastrar, visualizar, editar e excluir movimentações.

Formulário financeiro:

- Tipo de movimentação.
- Descrição.
- Categoria.
- Valor em reais.
- Data.
- Observações opcionais.

Regras:

- O valor deve ser maior que zero.
- Utilizar formatação brasileira de moeda, como R$ 150,00.
- Não armazenar entradas e saídas como valores indistintos.
- Calcular o saldo de forma consistente.
- Solicitar confirmação antes de excluir.
- Atualizar os cards e a lista após cada operação.

Disponibilizar filtros por período, categoria e tipo.

Adicionar estado vazio com a mensagem “Nenhuma movimentação encontrada” e botão para adicionar uma movimentação.

### 8. Tela Explorar

Criar uma tela de descoberta com sugestões de treinos e atividades disponíveis localmente.

A tela não deverá depender de serviços externos ou conteúdo online.

Elementos:

- Campo de busca.
- Categorias de treinamento.
- Cards de treinos sugeridos.
- Duração estimada.
- Nível de dificuldade.
- Grupos musculares trabalhados.
- Número de exercícios.
- Botão “Ver treino”.

Categorias:

- Força.
- Hipertrofia.
- Resistência.
- Mobilidade.
- Cardio.
- Corpo inteiro.

Criar pelo menos seis sugestões fictícias, com nomes, descrições e informações coerentes.

Exemplos:

- Treino de peito e tríceps.
- Treino de costas e bíceps.
- Treino completo de pernas.
- Circuito de corpo inteiro.
- Cardio moderado.
- Mobilidade e recuperação.

Ao abrir um treino sugerido, exibir seus detalhes e a lista de exercícios.

Disponibilizar a ação “Registrar como treino” ou “Adicionar aos meus treinos”.

Essa ação deverá criar um registro planejado no estado local e permitir sua posterior edição.

Adicionar filtros por categoria e nível de dificuldade.

Quando a busca não retornar resultados, mostrar uma mensagem amigável e uma ação para limpar os filtros.

### 9. Tela Exercícios — Catálogo

Criar um catálogo local de exercícios para consulta e seleção durante o registro de treinos.

Cada exercício deverá conter:

- Nome.
- Grupo muscular principal.
- Grupos musculares secundários, quando aplicável.
- Tipo de exercício.
- Equipamento utilizado.
- Nível de dificuldade.
- Instruções resumidas.
- Séries e repetições sugeridas, quando aplicável.

Exemplos de exercícios:

- Supino reto.
- Supino inclinado.
- Flexão de braço.
- Puxada frontal.
- Remada baixa.
- Agachamento livre.
- Leg press.
- Levantamento terra.
- Desenvolvimento de ombros.
- Rosca direta.
- Tríceps na polia.
- Prancha abdominal.
- Caminhada na esteira.

Utilizar pelo menos 15 exercícios fictícios.

Filtros:

- Grupo muscular.
- Equipamento.
- Dificuldade.
- Tipo de exercício.

Disponibilizar busca por nome.

Ao selecionar um exercício, abrir uma tela de detalhes ou modal com as instruções e as informações principais.

Adicionar botão “Adicionar ao treino”, que deverá abrir um seletor de treino existente ou permitir iniciar um novo registro.

Não é necessário utilizar vídeos ou imagens externas. Priorizar ícones, etiquetas e componentes visuais simples.

### 10. Tela Corpo — Evolução física

Esta tela deverá centralizar o histórico de peso, altura e medidas corporais.

Cabeçalho com o título “Minha evolução”.

Exibir indicadores:

- Peso inicial.
- Peso atual.
- Diferença de peso no período.
- Altura.
- Última atualização.
- Objetivo atual.

Criar gráfico de evolução do peso com filtros de 7, 30 e 90 dias.

Adicionar uma seção de medidas corporais:

- Cintura.
- Abdômen.
- Peito.
- Quadril.
- Braço.
- Coxa.

Cada medida deverá ser armazenada em um registro com data.

Criar uma lista de histórico mostrando os valores registrados e a data da medição.

Disponibilizar o botão “Registrar medidas”.

Formulário de medidas:

- Data da medição.
- Peso em kg.
- Cintura em cm.
- Abdômen em cm.
- Peito em cm.
- Quadril em cm.
- Braço em cm.
- Coxa em cm.
- Observações opcionais.

A altura deverá ser cadastrada no perfil e poderá ser exibida nesta tela. Não permitir que um novo registro de peso altere automaticamente a altura.

Todos os campos de medidas devem ser opcionais, exceto a data e pelo menos uma medida preenchida.

Permitir editar e excluir registros de medidas.

Atualizar automaticamente o peso atual com base no registro mais recente. Preservar o peso inicial como referência histórica, sem substituí-lo automaticamente por uma medição nova.

Exibir mensagens contextuais:

- Quando houver evolução registrada.
- Quando não houver medições suficientes para comparar.
- Quando o usuário ainda não tiver cadastrado medidas.

Não presumir que toda perda de peso representa melhora ou que todo ganho de peso representa piora.

### 11. Tela Meu Perfil

Acessível pelo avatar no cabeçalho.

Exibir informações fictícias do usuário:

- Nome completo.
- E-mail.
- Altura.
- Peso inicial.
- Objetivo.
- Data de início do acompanhamento.

Permitir editar os dados pessoais básicos no estado local.

O perfil deverá oferecer:

- Editar informações.
- Atualizar objetivo.
- Visualizar preferências.
- Encerrar sessão demonstrativa.

Como não haverá autenticação, a opção “Sair” deverá ser tratada apenas como uma simulação de logout. Exibir uma confirmação e retornar à tela inicial ou a uma tela demonstrativa de boas-vindas, sem solicitar credenciais reais.

Não implementar login, cadastro de contas, recuperação de senha ou integração de identidade nesta etapa.

### 12. Modelo de dados mockados

Criar arquivos de dados separados dos componentes de interface, com tipos TypeScript definidos.

Entidades sugeridas:

UserProfile:

- id.
- name.
- email.
- heightCm.
- initialWeightKg.
- goal.
- startDate.

Workout:

- id.
- name.
- date.
- startTime.
- durationMinutes.
- muscleGroups.
- exercises.
- estimatedCalories.
- status.
- notes.

WorkoutExercise:

- id.
- exerciseId, opcional.
- name.
- sets.
- reps.
- loadKg, opcional.

BodyMeasurement:

- id.
- date.
- weightKg, opcional.
- waistCm, opcional.
- abdomenCm, opcional.
- chestCm, opcional.
- hipCm, opcional.
- armCm, opcional.
- thighCm, opcional.
- notes.

FinancialTransaction:

- id.
- type.
- description.
- category.
- amount.
- date.
- notes.

Exercise:

- id.
- name.
- primaryMuscleGroup.
- secondaryMuscleGroups.
- equipment.
- difficulty.
- instructions.

Attendance:

- id.
- date.
- status.
- workoutId, opcional.

Os registros deverão ter identificadores estáveis e datas coerentes entre si.

Não utilizar nomes, e-mails ou informações pessoais reais de terceiros.

### 13. Dados iniciais de demonstração

Criar um conjunto de dados suficiente para demonstrar todas as telas sem exigir cadastro manual.

Perfil inicial:

- Nome: Vinícius.
- E-mail: vinicius.demo@example.com.
- Altura: 178 cm.
- Peso inicial: 86 kg.
- Objetivo: redução de gordura e condicionamento.
- Início do acompanhamento: aproximadamente três meses antes da data atual.

Criar pelo menos 12 registros de treino distribuídos ao longo das últimas semanas, com diferentes grupos musculares e durações.

Exemplos de treinos:

- Peito e tríceps — 55 minutos.
- Costas e bíceps — 60 minutos.
- Pernas — 65 minutos.
- Cardio — 30 minutos.
- Ombros e abdômen — 45 minutos.
- Corpo inteiro — 50 minutos.

Variar as datas, calorias estimadas e status para permitir testar filtros, gráficos e indicadores.

Criar pelo menos cinco registros de medidas corporais com datas diferentes, demonstrando evolução ao longo do tempo.

Criar pelo menos oito movimentações financeiras, incluindo entradas e saídas de diferentes categorias.

Criar ao menos 15 exercícios no catálogo e seis treinos sugeridos na tela Explorar.

Os dados deverão ser consistentes. Por exemplo, o peso atual deverá corresponder à medição mais recente e o peso inicial deverá permanecer fixo como referência.

Os números de presença e falta deverão ser calculados a partir dos registros de frequência, sem misturar treinos futuros com treinos concluídos.

A semana deverá ser calculada de segunda-feira a domingo, considerando o horário local do dispositivo.

As datas exibidas deverão utilizar o formato brasileiro DD/MM/AAAA e a moeda deverá seguir o padrão brasileiro.

### 14. Estado local e regras de atualização

Implementar um gerenciamento de estado simples, centralizado e previsível.

Usar React Context ou uma solução equivalente somente se realmente facilitar o compartilhamento de dados entre telas. Evitar bibliotecas de estado desnecessárias.

Criar funções reutilizáveis para:

- Adicionar treino.
- Atualizar treino.
- Excluir treino.
- Adicionar medição.
- Atualizar medição.
- Excluir medição.
- Adicionar movimentação financeira.
- Atualizar movimentação financeira.
- Excluir movimentação financeira.
- Atualizar perfil.
- Filtrar e ordenar registros.
- Calcular os indicadores do dashboard.
- Calcular entradas, saídas e saldo.
- Preparar os dados dos gráficos.

As alterações devem aparecer imediatamente em todas as telas que utilizam os mesmos dados.

Não duplicar informações derivadas em estados independentes quando elas puderem ser calculadas a partir dos registros existentes.

Exemplo: o total de entradas financeiras deverá ser calculado somando as movimentações do tipo entrada, e não mantido em um valor fixo separado.

Nesta primeira versão, os dados poderão ser reiniciados ao atualizar a página. Se for simples e compatível com a implementação, utilizar localStorage para preservar os dados no mesmo navegador, deixando claro que se trata de armazenamento local, sem sincronização entre dispositivos.

Não usar localStorage para simular um backend ou uma conta autenticada.

Criar uma ação de demonstração para restaurar os dados iniciais, com confirmação antes de descartar as alterações locais.

### 15. Componentes reutilizáveis

Organizar a interface em componentes consistentes.

Componentes sugeridos:

- AppLayout.
- BottomNavigation.
- AppHeader.
- UserAvatar.
- PageHeader.
- MetricCard.
- WorkoutCard.
- WorkoutTable.
- WorkoutForm.
- WorkoutDetails.
- MuscleGroupFilter.
- PeriodFilter.
- WeightChart.
- CaloriesChart.
- InsightCard.
- MeasurementCard.
- MeasurementForm.
- FinancialSummaryCard.
- TransactionList.
- TransactionForm.
- ExerciseCard.
- ExerciseDetails.
- SearchInput.
- EmptyState.
- LoadingState.
- ConfirmDialog.
- ToastProvider ou mecanismo equivalente.
- ProfileForm.

Evitar duplicar componentes semelhantes em telas diferentes.

Manter nomes claros, tipagem consistente e separação entre componentes, dados mockados, regras de negócio e utilitários.

### 16. Microinterações e feedback

Implementar feedback visual para todas as ações relevantes.

Toasts:

- “Treino registrado com sucesso.”
- “Treino atualizado.”
- “Treino excluído.”
- “Medidas atualizadas.”
- “Movimentação adicionada.”
- “Movimentação atualizada.”
- “Alterações salvas.”
- Mensagens claras para erros de validação.

Estados vazios:

- Nenhum treino registrado.
- Nenhuma medida cadastrada.
- Nenhuma movimentação financeira.
- Nenhum exercício encontrado.
- Nenhum resultado para os filtros selecionados.

Cada estado vazio deverá explicar brevemente a situação e oferecer uma ação adequada.

Estados de carregamento:

Como os dados serão locais, não simular longos carregamentos artificiais. Utilizar indicadores breves somente quando fizerem sentido para a experiência ou para operações simuladas.

Confirmações:

- Exclusão de registros.
- Restauração dos dados iniciais.
- Encerramento da sessão demonstrativa quando aplicável.

Interações adicionais:

- Transições suaves entre telas.
- Realce discreto dos botões ao passar o cursor.
- Indicadores visuais de filtros ativos.
- Animação leve ao abrir modais.
- Validação imediata de campos quando apropriado.

### 17. Atalhos de teclado e acessibilidade

Implementar atalhos simples, sem interferir na digitação dos formulários:

- Ctrl/Cmd + K: abrir busca rápida, se disponível.
- Escape: fechar modal ou painel aberto.
- Enter: confirmar formulários quando o contexto permitir.
- Tab e Shift + Tab: navegação consistente entre elementos.

Acessibilidade:

- Contraste adequado entre texto e fundo.
- Rótulos associados aos campos.
- Estados de foco visíveis.
- Botões com nomes acessíveis.
- Ícones decorativos sem duplicar informações para leitores de tela.
- Confirmações que possam ser operadas por teclado.
- Respeito à preferência por redução de movimento do sistema.

Não depender exclusivamente de cores para indicar sucesso, erro ou estado ativo.

### 18. Regras de UX e validação

Os formulários devem apresentar erros próximos dos campos correspondentes.

Não permitir salvar treinos sem os campos obrigatórios.

Não permitir valores financeiros negativos ou iguais a zero.

Não aceitar durações inválidas.

Impedir submissões duplicadas enquanto uma ação estiver sendo processada.

Ao editar um registro, preservar os campos não modificados.

Ao excluir um registro, atualizar imediatamente os indicadores, gráficos e listas dependentes.

Filtros devem poder ser limpos facilmente.

A interface deve explicar como voltar à tela anterior quando necessário.

Não criar páginas sem conteúdo ou links que levem a rotas inexistentes.

Não utilizar mensagens genéricas de sucesso para ações que não foram executadas.

### 19. Rotas e organização das páginas

Criar as seguintes rotas ou páginas equivalentes:

- /treinos — dashboard.
- /atividades — histórico e financeiro.
- /explorar — sugestões de treinos.
- /exercicios — catálogo.
- /corpo — medidas e evolução.
- /perfil — informações pessoais.

Garantir que o carregamento direto de cada rota funcione dentro da estrutura frontend do projeto.

Manter o menu inferior visível nas páginas principais e identificar corretamente a seção ativa.

O perfil poderá utilizar o mesmo layout, sem necessidade de adicionar um item extra ao menu inferior.

### 20. Critérios de aceitação

A primeira versão será considerada funcional quando:

1. Todas as páginas estiverem implementadas e navegáveis.
2. A aplicação utilizar exclusivamente o tema escuro.
3. A navegação inferior funcionar em dispositivos móveis e desktops.
4. O dashboard exibir dados mockados coerentes.
5. Os gráficos refletirem os registros locais.
6. Os filtros atualizarem as listas corretamente.
7. O usuário puder criar, visualizar, editar e excluir treinos.
8. O usuário puder cadastrar, editar e excluir medidas corporais.
9. O peso atual acompanhar o registro de medição mais recente.
10. O peso inicial permanecer preservado como referência.
11. O usuário puder cadastrar, editar e excluir entradas e saídas financeiras.
12. O saldo financeiro for calculado corretamente.
13. A tela Explorar permitir consultar e adicionar treinos sugeridos.
14. O catálogo de exercícios permitir busca e filtragem.
15. A tela de perfil permitir editar os dados locais.
16. Os formulários apresentarem validação e feedback.
17. As exclusões exigirem confirmação.
18. Os estados vazios estiverem implementados.
19. Não houver botões sem função ou links quebrados.
20. A interface funcionar sem backend, banco de dados ou APIs externas.
21. O layout não apresentar rolagem horizontal indesejada em telas pequenas.
22. Os componentes compartilharem os mesmos dados locais, sem divergências entre telas.

### 21. Fora do escopo

Não implementar nesta etapa:

- Backend.
- Banco de dados.
- Autenticação real.
- Cadastro real de usuários.
- Sincronização entre dispositivos.
- Integrações com relógios inteligentes.
- Integrações com aplicativos de saúde.
- APIs externas.
- Pagamentos.
- Notificações push.
- Inteligência artificial conectada a serviços externos.
- Planos pagos ou assinaturas.
- Gestão de múltiplos alunos.
- Painel administrativo.
- Permissões complexas.
- Upload de imagens.
- Armazenamento de vídeos.
- Publicação de treinos para outras pessoas.

A arquitetura poderá ser organizada para facilitar futuras integrações, mas não implementar antecipadamente essas funcionalidades.

### 22. Orientações de implementação para o Lovable

Antes de criar os componentes, organizar mentalmente a estrutura das páginas, os modelos de dados e os fluxos de navegação.

Implementar o projeto em etapas internas, mantendo a consistência visual entre elas:

Etapa A — Design system, layout global, cabeçalho e navegação inferior.

Etapa B — Dashboard, cards de indicadores e gráficos.

Etapa C — Histórico de treinos e formulários CRUD.

Etapa D — Controle financeiro e cálculos.

Etapa E — Explorar e catálogo de exercícios.

Etapa F — Evolução corporal e perfil.

Etapa G — Validações, filtros, feedbacks, responsividade e testes manuais.

Não interromper a implementação após criar apenas a tela inicial. O objetivo é gerar um protótipo navegável com todas as páginas descritas.

Priorizar componentes funcionais e consistentes em vez de elementos visuais complexos.

Não adicionar recursos que não estejam descritos neste documento sem necessidade.

Se alguma decisão de implementação for necessária, escolher a alternativa mais simples, previsível e fácil de manter.

### 23. Resultado esperado

Entregar um protótipo frontend completo do Coach Osmar, com aparência de produto profissional, interface escura, navegação simples e foco em acompanhamento de treinos e evolução física.

O resultado deverá permitir navegar entre todas as telas, experimentar os filtros, registrar e editar informações, visualizar gráficos e testar o controle financeiro com dados fictícios.

Todas as operações deverão funcionar no próprio navegador, com estado local compartilhado e cálculos consistentes.

A prioridade máxima é entregar uma experiência simples, fluida, responsiva e funcional, pronta para avaliação de usabilidade antes da futura integração com backend.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/933b08f9-db2a-40eb-b770-6af3a68e0e37).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
