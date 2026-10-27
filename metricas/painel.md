# Painel de Métricas — Clean-Financy

## 1. Identificação

- **Produto:** Clean-Financy.
- **Objetivo:** ajudar pequenos comerciantes a organizar e acompanhar suas movimentações financeiras.
- **Público-alvo:** pequenos comerciantes e responsáveis pela gestão financeira de pequenos negócios.
- **Período de referência:** 21/10/2026 a 22/10/2026, para os exemplos ilustrativos.
- **Situação dos dados:** os dados de ativação e retenção são hipotéticos. O NPS é um exemplo de pesquisa. As métricas de código devem ser conferidas no GitHub.

## 2. Métricas escolhidas

A equipe selecionou cinco métricas: três de produto e duas de código.

| Métrica | Tipo | Valor atual | Período | Se piorar, vamos... |
|---|---|---|---|---|
| Taxa de ativação | Produto | 30% | Exemplo de 5 visitantes | Revisar o cadastro e as orientações do primeiro acesso |
| Retenção | Produto | 66,7% — ilustrativo | Investigar por que os usuários não retornam |
| NPS | Produto | +40 — exemplo hipotético | Analisar as opiniões e conversar com usuários insatisfeitos |
| Bugs em aberto | Código | A conferir no GitHub | Situação atual | Priorizar e corrigir os erros mais importantes |
| Commits por semana | Código | A conferir no GitHub | Semana de referência | Investigar bloqueios e revisar a divisão das tarefas |

## 3. Cálculos das métricas de produto

### 3.1. Taxa de ativação

A taxa de ativação mede a proporção de visitantes que realizam a ação principal do produto. Na Clean-Financy, considera-se ativado o usuário que conclui o cadastro e registra sua primeira movimentação financeira.

**Dados:**

- Visitantes: 5.
- Usuários ativados: 3.
- Usuários não ativados: 2.

**Fórmula:**

Taxa de ativação = (usuários ativados ÷ total de visitantes) × 100

**Cálculo:**

(3 ÷ 20) × 100 = **60%**

**Interpretação:** no exemplo, 60% dos visitantes chegaram à primeira movimentação financeira. Os outros 40% não concluíram essa etapa.

**Se este número piorar, a nossa equipe vai:** revisar os campos do cadastro, melhorar as orientações do primeiro acesso e testar o processo com participantes externos.

**Valor real:** a medir com dados reais de visitantes e usuários ativados no mesmo período.

### 3.2. Retenção

A retenção mede a proporção de usuários de uma mesma coorte que retornam para utilizar o produto durante um período definido.

**Dados ilustrativos:**

- Usuários no início da coorte: 5.
- Usuários que retornaram: 3.
- Usuários que não retornaram: 2.

**Fórmula:**

Retenção = (usuários que retornaram ÷ usuários no início da coorte) × 100

**Cálculo:**

(3 ÷ 5) × 100 = **60%**

**Interpretação:** no exemplo, três dos cinco usuários voltaram a utilizar a Clean-Financy durante o período observado.

**Se este número piorar, a nossa equipe vai:** investigar as dificuldades de uso e verificar se o painel financeiro facilita o acompanhamento das entradas e saídas do comércio.

**Valor real:** a medir após acompanhar uma coorte real durante um período definido.

### 3.3. NPS — Net Promoter Score

O NPS mede a disposição dos usuários para recomendar a Clean-Financy a outras pessoas.

**Pergunta da pesquisa:** “De 0 a 10, quanto você recomendaria a Clean-Financy a outro comerciante?”

As respostas são classificadas da seguinte forma:

- **Promotores:** notas 9 e 10.
- **Passivos:** notas 7 e 8.
- **Detratores:** notas de 0 a 6.

**Exemplo de 4 respostas:**

10, 7, 8, 4

- Promotores: 2 pessoas — 80%.
- Passivos:1 pessoas — 10%.
- Detratores: 1 pessoas — 10%.

**Fórmula:**

NPS = percentual de promotores − percentual de detratores

**Cálculo:**

80% − 10% = **+70**

O resultado do NPS varia de −100 a +100.

**Interpretação:** o resultado é positivo. Entretanto, as seis respostas passivas indicam que ainda podem existir oportunidades de melhoria na experiência.

**Se este número piorar, a nossa equipe vai:** analisar os comentários e conversar com os usuários para identificar dificuldades e priorizar melhorias.

**Valor real:** a coletar por meio de uma pesquisa com usuários reais.

## 4. Métricas de código

### 4.1. Bugs em aberto

Essa métrica representa a quantidade de erros identificados que ainda não foram corrigidos.

- **Valor atual:** a conferir no GitHub ou no sistema de tarefas.
- **Como medir:** contar as Issues abertas classificadas como bugs na data da análise.
- **Interpretação:** avaliar a quantidade de erros junto à gravidade e ao impacto de cada problema.
- **Se este número piorar, a nossa equipe vai:** priorizar as correções dos erros que impedem o acesso, o cadastro ou o registro correto das movimentações financeiras.

A equipe deve dar prioridade aos problemas que comprometem as funções essenciais do sistema, mesmo que outros bugs menos graves também estejam abertos.

### 4.2. Commits por semana

Essa métrica representa a quantidade de commits registrados no repositório durante uma semana.

- **Valor atual:** a conferir no histórico do GitHub.
- **Período:** semana de referência a definir.
- **Como medir:** contar os commits realizados no repositório durante o intervalo escolhido.
- **Interpretação:** observar a atividade de desenvolvimento em conjunto com as tarefas concluídas, as correções e as funcionalidades entregues.
- **Se este número piorar, a nossa equipe vai:** verificar se algum integrante está bloqueado, revisar a divisão das tarefas e combinar os próximos passos.

A quantidade de commits, isoladamente, não comprova produtividade ou qualidade do código. Ela deve ser analisada junto ao andamento real do projeto.

## 5. Funil AARRR

O funil AARRR organiza a jornada do usuário em cinco etapas: aquisição, ativação, retenção, receita e recomendação.

| Etapa | Aplicação na Clean-Financy | Indicador sugerido |
|---|---|---|
| Aquisição | Pessoas acessam a plataforma | Número de visitantes e origem dos acessos |
| Ativação | Usuários concluem o cadastro e registram a primeira movimentação | Taxa de ativação |
| Retenção | Comerciantes retornam para registrar ou consultar movimentações | Retenção por coorte |
| Receita | Usuários contratam o Plano Pro | Conversão paga e receita recorrente mensal |
| Recomendação | Usuários recomendam a plataforma a outros comerciantes | NPS e quantidade de indicações |

### Exemplo do funil

Considerando o exemplo de 5 visitantes e 3 usuários ativados:

- **Aquisição:** 5 visitantes.
- **Ativação:** 3 usuários.
- **Não ativados:** 2 visitantes.
- **Conversão de visitantes em usuários ativados:** 60%.
- **Queda entre aquisição e ativação:** 40%.

**Fórmula da taxa de queda:**

Taxa de queda = ((visitantes − usuários ativados) ÷ visitantes) × 100

**Cálculo:**

((5 − 3) ÷ 5) × 100 = **40%**

**Análise:** no exemplo, a maior perda observada ocorre entre a visita e a primeira movimentação financeira. A equipe deve investigar o cadastro e as orientações iniciais antes de decidir quais mudanças implementar.

Os dados de retenção e NPS apresentados neste documento são exemplos independentes. Não devem ser tratados como resultados observados necessariamente nas mesmas pessoas do funil.

## 6. Decisão coletiva

### Duas opções de ação

| Opção | O que ganhamos | O que abrimos mão |
|---|---|---|
| **A — Simplificar o cadastro e melhorar o primeiro acesso** | Pode facilitar a ativação de novos usuários e reduzir dificuldades iniciais | Parte do tempo de desenvolvimento será dedicada ao cadastro e às orientações |
| **B — Corrigir bugs e melhorar a estabilidade** | Pode tornar o sistema mais confiável e evitar falhas nas movimentações financeiras | As melhorias no primeiro acesso podem ficar para depois |

### Número que orienta a escolha

No exemplo, **2 de 5 visitantes não se ativaram**, representando uma queda de 40% entre aquisição e ativação.

Por esse motivo, a opção A é uma prioridade sugerida. Entretanto, se existirem bugs críticos que comprometam o uso seguro e correto do sistema, a equipe deverá considerar sua gravidade antes de definir a ordem das tarefas.

**Registro do voto:** a equipe deve discutir as duas alternativas, realizar a votação e registrar a decisão final, incluindo eventuais discordâncias, no arquivo `metricas/decisao.md`.

## 7. Plano de acompanhamento

1. Registrar os dados reais disponíveis e definir o período de medição.
2. Conferir os bugs em aberto e os commits no GitHub.
3. Aplicar uma pesquisa de NPS e documentar as respostas.
4. Acompanhar uma coorte de usuários para medir a retenção.
5. Registrar a melhoria escolhida em uma Issue do GitHub.
6. Implementar a mudança e testar o funcionamento com participantes externos.
7. Repetir a medição após a implementação, utilizando critérios e períodos comparáveis.
8. Registrar os resultados e decidir se a melhoria deve ser mantida ou ajustada.

## 8. Resumo dos indicadores

| Métrica | Tipo | Valor atual | Próxima ação se piorar |
|---|---|---|---|
| Taxa de ativação | Produto | 60% — exemplo hipotético | Simplificar cadastro e primeiro acesso |
| Retenção | Produto | 60% — coorte ilustrativa | Investigar por que os usuários não retornam |
| NPS | Produto | +70 — exemplo hipotético | Analisar opiniões e conversar com usuários |
| Bugs em aberto | Código | A conferir no GitHub | Priorizar correções por gravidade |
| Commits por semana | Código | A conferir no GitHub | Investigar bloqueios e revisar tarefas |


## 9. Conclusão

O painel reúne três métricas de produto — taxa de ativação, retenção e NPS — e duas métricas de código — bugs em aberto e commits por semana.

Cada indicador possui uma ação definida para orientar a equipe caso seu resultado piore, evitando o uso de métricas sem uma finalidade prática.

A principal oportunidade de melhoria indicada pelo exemplo de ativação é facilitar o primeiro acesso: 2 dos 5 visitantes não chegaram à primeira movimentação financeira. A equipe deverá validar essa hipótese com dados reais, confirmar coletivamente a prioridade e acompanhar os resultados após a implementação.

**Próxima revisão:** a definir após a coleta dos dados e a implementação da melhoria.
