# 05 — Memória que não esquece + auto-evolução + auto-correção

## O problema central
O modelo não aprende entre sessões. Então duas falhas aparecem o tempo todo:
1. **Esquecer** — a base cresce todo dia, mas o agente não ativa o que sabe na hora certa.
2. **Não evoluir** — o conhecimento fica parado, vira arquivo morto, e o mesmo erro se repete.

Resolver isso é arquitetura, não sorte.

## Os 4 tipos de memória (modelo CoALA aplicado)

| Tipo | O que é | Onde mora |
|---|---|---|
| **Working** | o que está na janela agora | contexto da sessão |
| **Episódica** | eventos brutos: cada ação, finding, erro | banco/JSONL (alto volume) — não no git |
| **Semântica** | fatos/padrões destilados, generalizados | base curada, pequena, versionada |
| **Procedural** | como fazer: regras, runbooks, gates | regras/skills/código |

## Parte 1 — ATIVAR NA HORA (não esquecer)
- **Índice sempre carregado**: um arquivo-índice pequeno entra em toda sessão. Toda memória nova ganha 1 linha nele — sem isso, ela "existe mas não é ativada".
- **Retrieval escopado por domínio** ANTES de agir: recupera o domínio certo, depois similaridade. Recall dirigido, não busca cega.
- **Tiered**: índice pequeno sempre disponível; o detalhe profundo entra sob demanda.
- **Persistir**: episódico → banco; semântico/procedural → destinos redundantes. Nada importante vive só na sessão.

## Parte 2 — AUTO-EVOLUÇÃO (a base melhora sozinha)
- **Consolidação episódica → semântica (diária)**: o bruto do dia é destilado em poucas lições curadas (1 fato, com evidência + escopo). Bruto **não** é memória final.
- **Curva de esquecimento por evidência**: a lição perde peso quando o **resultado real cai**, não por calendário.
- **Reflexão ao recuperar**: sintetizar (conectar lições), não só listar.

## Parte 3 — AUTO-CORREÇÃO (resolução de conflito)
- Lição contradita por dado novo vira `superseded`/`deprecated` — **não apaga**, registra que mudou.
- Reincidência do mesmo erro = a correção anterior errou a raiz → o sistema sobe a prioridade e refaz, em vez de repetir o conserto ruim.
- Auto-correção **com revisão humana** nos pontos sensíveis — regra errada institucionalizada vira erro em escala.

## A regra dura (anti-contaminação — o maior risco)
> Nada vira memória semântica sem **EVIDÊNCIA + ESCOPO + STATUS**.

Toda lição carrega: `escopo` (onde vale), `contraescopo` (onde NÃO vale), `status` (hipótese | validado | superseded), `verified_at`, `fonte`. Lição sem escopo vira "regra geral" e **piora** a acertividade — uma verdade do produto X virando lei pra tudo. Proibido.

## Auto-vigilância (heartbeat)
O sistema confere o **próprio estado** todo dia: os jobs rodaram? a consolidação passou? a persistência sincronizou? Se algo parou → alerta na hora + tenta religar. O dono não pode ser quem descobre que parou.

## Anti-padrões
- Memória que existe mas não entra no índice (não é ativada).
- Versionar bruto/ruído (incha tudo, degrada o retrieval). Bruto → banco.
- Lição sem escopo/evidência. Lição velha tratada como dogma.
- Auto-evolução sem revisão humana nos pontos críticos.
- Depender do agente "lembrar de salvar/consultar" — é automação, não intenção.
