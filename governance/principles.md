# Governança do Maestro

O que separa um orquestrador de brinquedo de um que aguenta produção não é o roteamento — é a **governança**. O Maestro embute estes princípios direto no núcleo (`src/orchestrator.mjs`, função `runGates`):

| Princípio | Como o Maestro aplica |
|---|---|
| **Gates leem o estado real** | `runGates` inspeciona o plano montado, não o relato dos agentes. |
| **Fail-closed** | Gate crítico que falha → status `BLOCKED`, nunca `OK` (e exit code 1). |
| **Verificação obrigatória** | Quem produz artefato passa por um agente verificador a jusante, ou é bloqueado. |
| **Sem invenção** | Roteamento sem match → aviso explícito + escalar pra humano, em vez de chutar. |
| **Delegação declarada** | Cada agente declara `delegatesTo`; o orquestrador expande a cadeia. |

Estes gates são o ponto de partida. A força do framework é que **adicionar um gate novo é adicionar uma função pura** — testável, determinística, que lê o estado e devolve pass/fail.

> Para os padrões completos de engenharia de agentes em produção (learning loop, freshness gate, raiz-primeiro, memória que evolui, proatividade), veja o conjunto de field notes que acompanha este projeto.
