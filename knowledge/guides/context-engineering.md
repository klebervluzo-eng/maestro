# Guia — Context Engineering (engenharia de contexto)

> **Linhagem (crédito honesto):** "context engineering" virou termo da comunidade de IA em 2024–2025 (Shopify, Anthropic, e vários praticantes popularizaram). Este guia é síntese original dos princípios, com exemplos próprios e conexão com o framework Maestro. Conceitos públicos; redação e exemplos aqui são originais.

## A tese central

A janela de contexto não é uma caixa onde você joga tudo — é um **palco com lugares limitados**. Context engineering é a disciplina de decidir **o que sobe ao palco, em que ordem, e o que fica de fora**. Quem domina isso tira respostas melhores de modelos menores; quem não domina desperdiça modelo grande e ainda erra.

A virada de chave: deixou de ser "prompt engineering" (a frase mágica) e virou **engenharia de informação** (o sistema que monta o contexto certo, toda vez).

---

## Por que importa (a física do problema)

1. **Contexto é finito e caro.** Cada token ocupa espaço e custa. Encheu de ruído, sobrou pouco pro que decide.
2. **"Lost in the middle".** O modelo presta mais atenção no começo e no fim do contexto. O que está enterrado no meio de um despejo gigante é praticamente ignorado.
3. **Ruído compete com sinal.** Informação irrelevante não é neutra — ela **atrapalha**, puxa o modelo pra respostas erradas.
4. **Mais contexto ≠ melhor.** Existe um ponto ótimo. Passou dele, a qualidade **cai** (context rot).

---

## Os 5 movimentos da engenharia de contexto

### 1. Selecionar (retrieval) — trazer só o relevante
Em vez de despejar o documento/histórico inteiro, recupere o **trecho** que a tarefa pede. Recuperação dirigida por **domínio primeiro, similaridade depois** — não busca cega. *(Um "mapa de código" que entrega o símbolo certo em vez do arquivo inteiro é isso na prática: já vi reduzir 250 mil tokens para algumas centenas.)*

### 2. Comprimir — caber sem perder o sinal
- **Resumir** o que é histórico/contexto de fundo.
- **Destilar** conversas longas em fatos-chave (não a transcrição).
- **Referenciar** em vez de inline: às vezes basta "o arquivo X define Y", não o arquivo X inteiro.

### 3. Ordenar — onde a informação senta importa
Coloque o crítico no **começo e no fim** (onde o modelo olha mais). Instrução-chave e o pedido atual nas pontas; material de apoio no meio.

### 4. Isolar — não deixe tarefas contaminarem o contexto uma da outra
Cada tarefa/subagente recebe um contexto **limpo e escopado**. Sobrou lixo de uma tarefa anterior na janela, a próxima decide pior. Memória de trabalho mínima por tarefa.

### 5. Persistir o que vale, descartar o resto
O que é efêmero (estado da tarefa de hoje) **não** precisa virar memória permanente. O que é fato durável vira memória semântica — **com escopo e evidência** (senão vira "regra geral" que piora tudo). Bruto vai pro banco, não pro contexto.

---

## Os 4 baldes do que pode ocupar contexto

Pensar em "tipos" ajuda a orçar:

| Balde | Exemplo | Regra de orçamento |
|---|---|---|
| **Instruções** | system prompt, regras, persona | enxuto e estável; não reescreva a cada turno |
| **Conhecimento** | docs, fatos recuperados (RAG) | só o trecho relevante, comprimido |
| **Histórico** | turnos anteriores da conversa | resuma o antigo, mantenha o recente |
| **Ferramentas** | definições e resultados de tools | carregue sob demanda, não tudo de uma vez |

Quando a janela aperta, você sabe **de qual balde cortar** — em vez de cortar no susto.

---

## Sinais de que seu contexto está mal-engenheirado

- A qualidade cai conforme a conversa cresce (você está acumulando ruído).
- Você cola arquivos inteiros "pra garantir".
- O modelo ignora uma instrução que está no meio de um bloco gigante.
- Custo por resposta sobe sem a qualidade subir junto.
- Trocar pro modelo maior "resolve" — sinal de que você está compensando contexto ruim com força bruta.

---

## Checklist

- [ ] Eu trago o trecho relevante, não o documento inteiro?
- [ ] O histórico antigo é resumido em vez de carregado cru?
- [ ] O crítico está nas pontas (começo/fim) do contexto?
- [ ] Cada tarefa/subagente tem contexto isolado e escopado?
- [ ] Tenho um teto de "working memory" e sei de qual balde cortar?
- [ ] O efêmero fica fora da memória permanente?

---

## Conexão com o resto do material

- **Maestro** isola contexto por agente (princípio 4 daqui) e roteia por intenção (seleção).
- **Field note 05 (memória)** detalha o "persistir o que vale com escopo e evidência".
- **Guia 12-Factor** trata os baldes "instruções" e "ferramentas" do ângulo de arquitetura.

Context engineering em uma frase: **o modelo é tão bom quanto o contexto que você monta pra ele.**
