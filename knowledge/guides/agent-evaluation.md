# Guia — Avaliação de Agentes (evals)

> **Linhagem (crédito honesto):** "evals" para sistemas de LLM viraram prática difundida por OpenAI, Anthropic e a comunidade (LLM-as-judge, benchmarks de tarefa). Este guia é síntese original dos princípios práticos, com exemplos próprios e conexão com o framework Maestro. Conceitos públicos; redação e exemplos aqui são originais.

## A tese central

Você não pode melhorar o que não mede. Um agente "parece bom" numa demo e quebra em produção porque **demo não é métrica**. Avaliação de agente é montar um jeito **repetível e numérico** de responder: *este agente está melhorando ou piorando?*

A diferença entre amador e profissional aqui é simples: o amador testa "na mão" e confia na sensação; o profissional tem **uma suíte de avaliação que roda sozinha** e dá um número.

---

## Por que avaliar agente é mais difícil que testar código normal

1. **Não-determinismo:** o mesmo input pode dar saídas diferentes. Teste tradicional (igualdade exata) não serve.
2. **Não tem "uma" resposta certa:** muitas tarefas têm várias respostas boas. Você avalia **qualidade**, não igualdade.
3. **O erro é em cadeia:** um agente dá vários passos; um passo errado no meio contamina o resto. Você precisa avaliar o **caminho**, não só o destino.
4. **Caro:** rodar evals chama o modelo muitas vezes. Tem que ser eficiente.

---

## Os 3 níveis do que avaliar

| Nível | Pergunta | Como medir |
|---|---|---|
| **Componente** | a ferramenta/retrieval/parser funciona? | teste determinístico normal (rápido, barato) |
| **Passo** | o agente escolheu a ação certa neste passo? | comparar a ação escolhida com a esperada |
| **Trajetória** | o agente chegou ao objetivo final? | avaliar o resultado completo da tarefa |

**Regra:** comece pelos componentes (baratos e determinísticos), depois passos, depois trajetória. A maioria dos bugs mora nos componentes — e lá o teste é fácil.

---

## Como dar nota quando não há "resposta certa"

| Método | Como funciona | Quando usar |
|---|---|---|
| **Determinístico** | regra exata (contém X? formato Y? exit code?) | sempre que der — é o mais confiável |
| **LLM-as-judge** | um modelo avalia a saída com um critério | qualidade subjetiva (clareza, tom, correção) |
| **Humano** | pessoa avalia uma amostra | calibrar o judge e os casos difíceis |

**Cuidado com o LLM-as-judge:** ele tem vieses (favorece resposta longa, a primeira opção, o próprio estilo). Calibre contra avaliação humana numa amostra antes de confiar. Um judge não-calibrado dá um número que **parece** ciência e não é.

---

## A espinha dorsal: o dataset de avaliação

Tudo gira em torno de um conjunto de **casos** (input + o que se espera). Como montar:

1. **Comece pequeno e real:** 20–50 casos de uso reais valem mais que 1000 sintéticos.
2. **Inclua os casos que já quebraram:** todo bug de produção vira um caso de eval — assim ele nunca volta sem você saber. *(É o Learning Loop aplicado a evals.)*
3. **Cubra as bordas:** input vazio, ambíguo, malicioso, gigante. O agente não pode quebrar feio neles.
4. **Versione o dataset:** ele cresce e é o ativo mais valioso da sua avaliação.

---

## As métricas que importam (com denominador)

Não meça "sensação". Meça:
- **Taxa de sucesso da tarefa** (% de trajetórias que atingem o objetivo)
- **Acerto por passo** (% de ações corretas)
- **Custo e latência** (tokens e tempo por tarefa — qualidade que custa caro demais não escala)
- **Taxa de erro por severidade** — erros graves por 100 execuções, em janela móvel
- **Regressão** — piorou em relação à versão anterior?

A métrica mais honesta acompanha **erros graves por 100 execuções ao longo do tempo** — se essa curva cai, você está melhorando de verdade.

---

## Erros clássicos

| Erro | Por que é ruim |
|---|---|
| Avaliar "no olho", sem dataset | não é repetível; você não sabe se melhorou |
| Só medir o resultado final | esconde onde no caminho quebrou |
| Confiar no LLM-judge sem calibrar | número que parece ciência e não é |
| Dataset só com casos fáceis | passa em tudo e quebra em produção |
| Não versionar o dataset | não dá pra comparar versões |

---

## Checklist

- [ ] Existe um dataset de casos reais (não só sintéticos)?
- [ ] Todo bug de produção virou um caso novo no dataset?
- [ ] Avalio componente, passo E trajetória (não só o final)?
- [ ] Uso determinístico onde dá, e judge calibrado onde não dá?
- [ ] Meço custo e latência junto com qualidade?
- [ ] Acompanho regressão entre versões?
- [ ] A curva de erro grave por 100 execuções está caindo?

---

## Conexão com o resto do material

- **Field note 01 (Learning Loop)**: todo erro vira caso de eval + gate.
- **Field note 02 (estado real)**: o eval de trajetória lê o resultado real, não o relato do agente.
- **Maestro**: os 15 testes do núcleo são a forma mais básica de eval — determinística, sobre os componentes.

Avaliação em uma frase: **sem um número repetível, "melhorou" é só opinião.**
