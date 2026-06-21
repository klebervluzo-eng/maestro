# 🎼 Maestro

> Um **agente completo**: um núcleo original de orquestração multi-agente **+** o corpo de conhecimento de engenharia de agentes que sustenta decisões de produção.

Não é clone de framework nenhum. É uma implementação do zero de uma ideia que a indústria inteira usa (orquestrador → agentes especialistas → delegação), com um diferencial: a **governança vem antes da conclusão**. O maestro não declara "pronto" sem passar pelos gates — e os gates leem o **estado real**, não o relato dos agentes.

## Duas camadas, um agente

### 🧩 O núcleo executável (`/src`, `/agents`)
Roda de verdade, hoje, sem dependência (Node 18+):

```bash
node maestro.mjs "pesquise o mercado e construa um relatório, depois revise"
node --test        # 8 testes passando
```

- **Roteamento determinístico** por intenção — barato, previsível, não depende de LLM pra rodar.
- **Delegação em fases** — descobrir → construir → verificar, em ordem garantida (não acidental).
- **Gates fail-closed** — gate crítico que falha bloqueia, com exit code que a automação respeita.
- **Sem invenção** — pedido ambíguo vira aviso + escalada, não chute.

### 📚 O conhecimento (`/knowledge`)
O que separa um agente de demo de um agente de produção — escrito do zero, creditando a origem de cada conceito:

**Field notes de produção** (`knowledge/principles/`)
| # | Princípio |
|---|---|
| 01 | Learning Loop — todo erro vira trava permanente |
| 02 | Gates que leem o estado real |
| 03 | Freshness Gate — nunca afirmar o que não verificou |
| 04 | Raiz primeiro + sistema autossuficiente |
| 05 | Memória + auto-evolução + auto-correção |
| 06 | Proativo — busca solução sem esperar, antecipa |

**Guias de fundamentos** (`knowledge/guides/`)
| Guia | Tema |
|---|---|
| 12-Factor Agents | princípios de um agente confiável |
| Context Engineering | montar o contexto certo em vez de despejar |
| RAG | recuperação que não alucina — fonte antes da resposta |

## Por que isso junto

Código sem doutrina vira gambiarra; doutrina sem código vira slide. O Maestro é os dois: o **núcleo** demonstra os princípios em código rodando, e o **conhecimento** explica por que cada decisão existe. O código aponta pra doutrina; a doutrina aponta pro código.

## Estrutura

```
maestro.mjs            # CLI
src/registry.mjs       # carrega + valida agentes (contrato forte)
src/router.mjs         # roteamento por intenção
src/orchestrator.mjs   # plano por fases + gates de governança
agents/*.json          # definições de agentes
governance/            # os gates que o orquestrador aplica
knowledge/             # princípios de produção + guias de fundamentos
test/                  # testes nativos (node --test)
```

## Estender

- **Novo agente** = um `agents/x.json` com `id`, `name`, `role`, `phase`, `keywords`. O registry valida o contrato.
- **Novo gate** = uma função pura em `runGates` que lê o plano e devolve `{ pass, critical, detail }`.

Cada extensão é testável isoladamente. Governança que você confia é governança que você consegue testar.

## Filosofia

> A IA é quem **conserta e melhora** a engrenagem — nunca a engrenagem que move a máquina. Se desligar a IA, a operação continua rodando.

## Licença

MIT. Criado do zero. Use, melhore, quebre, conte o que aprendeu.
