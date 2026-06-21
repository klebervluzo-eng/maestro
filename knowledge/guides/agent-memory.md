# Guia — Memória de Agentes

> **Linhagem (crédito honesto):** a divisão da memória de agentes em tipos (working, episódica, semântica, procedural) vem do framework **CoALA** (Cognitive Architectures for Language Agents) e de sistemas como MemGPT/Letta e Mem0. Este guia é síntese original dos princípios práticos, com exemplos próprios e conexão com o framework Maestro. Conceitos públicos; redação e exemplos aqui são originais.

## A tese central

Um modelo de linguagem **não lembra de nada** entre uma conversa e outra — ele não atualiza os próprios pesos. Então toda "memória" de um agente é **externa**: arquivos, banco, índice que você relê e injeta de volta no contexto. Memória de agente não é mágica do modelo — é **engenharia de armazenamento e recuperação**.

Quem ignora isso constrói um agente com amnésia que repete os mesmos erros. Quem domina isso constrói um agente que **fica melhor a cada uso**.

---

## Os 4 tipos de memória (e onde cada um mora)

| Tipo | O que é | Onde guardar | Tamanho |
|---|---|---|---|
| **Working** | o que está no contexto agora | a própria janela do modelo | pequena |
| **Episódica** | eventos brutos: cada ação, erro, evento | banco / arquivo de log (JSONL) | enorme |
| **Semântica** | fatos e padrões já destilados | base curada, versionada | pequena |
| **Procedural** | como fazer: regras, runbooks, gates | código / regras | média |

A regra de ouro: **bruto vai pro banco; destilado vai pra base curada.** Versionar o bruto incha tudo e piora a busca.

---

## O ciclo de vida de uma memória

```
Acontece algo  →  registra bruto (episódica)  →  destila (semântica)  →  ativa quando relevante
```

### 1. Capturar
Todo evento relevante (erro, decisão, resultado) vira um registro bruto no banco — com data, contexto, resultado. Volume alto, sem filtro fino. É a matéria-prima.

### 2. Destilar (consolidação)
Periodicamente (ex: 1×/dia), o bruto do dia vira **poucas lições curadas** — 1 fato cada, com evidência. Não é a transcrição do dia; é o aprendizado dele. O bruto **não** é a memória final.

### 3. Ativar (recuperação)
Quando uma tarefa nova chega, você recupera **só o relevante** — por domínio primeiro, similaridade depois. E o **índice** das memórias entra sempre no contexto (pequeno), pra a memória "existir e ser lembrada". Memória que não entra no índice **existe mas nunca é usada**.

---

## A regra que evita o maior desastre: ESCOPO

> Nada vira memória semântica sem **evidência + escopo + status**.

Toda lição carrega:
- **escopo** — onde ela vale (domínio, tipo, canal)
- **contraescopo** — onde NÃO vale
- **status** — `hipótese` | `validado` | `superseded`
- **verified_at** + **fonte**

Por quê? Uma lição sem escopo vira "regra geral" e **piora** o agente: uma verdade do caso X vira lei pra tudo. O erro mais comum e mais caro de memória de agente é esse — generalizar demais.

---

## Auto-evolução e auto-correção

- **Curva de esquecimento por evidência:** uma lição perde peso quando o **resultado real cai** — não pela idade no calendário. O que ainda funciona, mantém.
- **Conflito:** lição contradita por dado novo vira `superseded` — **não apaga**, registra que mudou. Apagar perde o histórico de por que mudou.
- **Reincidência:** se o mesmo erro volta, a lição/conserto anterior errou a raiz → sobe a prioridade, refaz. (Conecta com o field note 01, Learning Loop.)

---

## Erros clássicos (e o conserto)

| Sintoma | Causa raiz | Conserto |
|---|---|---|
| Agente repete erro já "aprendido" | memória não entra no índice / não é recuperada | índice sempre carregado + retrieval por domínio |
| Memória virou cemitério de markdown | tudo virou regra, nada com escopo | destilar com escopo + status; podar o redundante |
| Lição boa de um caso piora outros | generalização sem escopo | escopo + contraescopo obrigatórios |
| Base incha e a busca piora | versionou o bruto | bruto → banco; só o destilado é versionado |
| Agente afirma fato velho como atual | sem frescor | verified_at + ttl (ver guia/field note de Freshness) |

---

## Checklist

- [ ] Existe um índice pequeno de memórias que entra em toda sessão?
- [ ] O bruto vai pro banco e só o destilado é curado/versionado?
- [ ] Tem consolidação periódica (bruto → lições)?
- [ ] Toda lição tem escopo + evidência + status?
- [ ] A recuperação é por domínio (não busca cega)?
- [ ] Lição contradita vira `superseded` em vez de ser apagada?
- [ ] Fatos críticos têm frescor (verified_at + ttl)?

---

## Conexão com o resto do material

- **Field note 05** é a versão-resumo disto; este guia aprofunda o ciclo de vida.
- **Guia Context Engineering** trata de COMO injetar a memória recuperada sem estourar o contexto.
- **Field note 01 (Learning Loop)** usa a memória semântica como destino do aprendizado.

Memória de agente em uma frase: **o modelo esquece; o seu sistema é que lembra — com escopo, evidência e na hora certa.**
