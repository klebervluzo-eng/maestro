# Guia — Sistemas Multi-Agente

> **Linhagem (crédito honesto):** padrões multi-agente (orquestrador-trabalhador, debate, roteamento) são discutidos por Anthropic, OpenAI e frameworks como CrewAI, AutoGen e LangGraph. Este guia é síntese original dos princípios, com exemplos próprios e conexão com o framework Maestro. Conceitos públicos; redação e exemplos aqui são originais.

## A tese central

Multi-agente é dividir um problema entre **vários agentes pequenos e especializados** em vez de um agente gigante que tenta fazer tudo. A vantagem: cada agente tem contexto enxuto e foco claro. O risco: coordenação vira caos se ninguém manda.

A pergunta certa nunca é "quantos agentes?". É **"este problema realmente precisa ser dividido?"**. Às vezes um agente só, bem feito, ganha de cinco mal coordenados.

---

## Quando usar multi-agente (e quando NÃO)

| Use multi-agente | Fique com um agente só |
|---|---|
| Subtarefas realmente distintas (pesquisar ≠ codar ≠ revisar) | tarefa simples e linear |
| Dá pra paralelizar trabalho independente | passos que dependem um do outro em sequência rígida |
| Você quer um verificador separado de quem executa | overhead de coordenação > ganho |
| O contexto de um agente só ficaria gigante demais | cabe tudo num contexto enxuto |

**Regra:** multi-agente paga o preço da coordenação. Só vale quando a divisão **rende mais** do que esse preço.

---

## Os padrões principais

### 1. Orquestrador–trabalhador (o mais comum)
Um agente **coordena** (decide quem faz o quê) e delega pra agentes especialistas. O orquestrador não executa o trabalho de domínio — ele roteia e junta os resultados. *(É exatamente o Maestro: o maestro roteia, Scout/Forge/Litmus executam.)*

### 2. Pipeline (linha de montagem)
Cada agente faz uma etapa e passa pro próximo: pesquisar → construir → revisar. Ordem fixa, cada um especialista na sua fase. *(O Maestro ordena por fase — descobrir → construir → verificar.)*

### 3. Debate / painel
Vários agentes resolvem o mesmo problema de ângulos diferentes e um juiz escolhe (ou eles convergem). Bom quando a resposta é incerta e múltiplas perspectivas reduzem o erro.

### 4. Executor + verificador
Um faz, outro **checa lendo o estado real** — separando quem produz de quem aprova. *(É a ponte de governança do Maestro: o executivo propõe, o conselho aprova.)*

---

## A regra de ouro: um maestro por vez

Dois agentes tentando **mandar na mesma tarefa** ao mesmo tempo = caos (brigam pela decisão). A coordenação só funciona com **autoridade clara**:

- **Um** orquestra; os outros executam ou opinam em papéis definidos.
- Papéis **não conflitantes**: quem executa ≠ quem verifica. Os dois podem estar sempre ativos porque **não competem** — fazem coisas diferentes.

É a diferença entre uma orquestra (um maestro, muitos músicos) e uma gritaria (todos regendo).

---

## Os 5 perigos reais (e o conserto)

| Perigo | O que acontece | Conserto |
|---|---|---|
| **Agente órfão** | um agente fica rodando sem supervisão, gastando recurso | todo agente tem dono e fim claro (morre quando a tarefa acaba) |
| **Telefone sem fio** | informação se degrada a cada handoff entre agentes | handoff com contrato estruturado, não texto solto |
| **Custo explode** | N agentes = N× chamadas ao modelo | só divida quando rende; meça custo por tarefa |
| **Loop infinito** | agentes se chamando sem convergir | limite de passos + condição de parada clara |
| **Ninguém manda** | decisões conflitantes, trabalho duplicado | autoridade única + delegação cirúrgica |

---

## Delegação que funciona

Delegação ruim é vaga ("cuida disso aí"). Delegação boa é **cirúrgica**:
- **objetivo claro** (o que entregar)
- **contexto suficiente** (o que o agente precisa saber — nem mais, nem menos)
- **contrato de saída** (o formato do resultado)
- **escopo fechado** (o que NÃO é pra fazer)

Quanto mais preciso o pedido, menos o agente "inventa".

---

## Checklist

- [ ] Esse problema realmente precisa de múltiplos agentes (ou um só resolve)?
- [ ] Tem UMA autoridade que coordena (não dois mandando)?
- [ ] Os papéis são não-conflitantes (executar ≠ verificar)?
- [ ] Cada agente tem objetivo, contexto e contrato de saída claros?
- [ ] Existe limite de passos e condição de parada (anti-loop)?
- [ ] O handoff entre agentes é estruturado (não texto solto)?
- [ ] Você mede o custo por tarefa (multi-agente não saiu caro demais)?

---

## Conexão com o resto do material

- **Maestro** é um sistema multi-agente do padrão orquestrador–trabalhador + pipeline por fases.
- **Ponte de governança** é o padrão executor + verificador (o conselho sempre-ativo).
- **Guia 12-Factor (princípios 7 e 8)**: "agente pequeno e focado" + "controle o fluxo você mesmo".

Multi-agente em uma frase: **dividir só vale quando a coordenação rende mais do que custa — e sempre com um maestro só.**
