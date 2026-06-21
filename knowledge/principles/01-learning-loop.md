# 01 — Learning Loop: todo erro vira trava permanente

## O problema
Você corrige um erro do agente. Semana que vem, o mesmo erro volta. Por quê? Porque o conserto foi um **paliativo** — você arrumou o sintoma, não a causa, e nada impede de acontecer de novo.

## O princípio
Um aprendizado só conta como **ATIVO** quando vira algo que o sistema relê e executa sozinho. Toda vez que aparece um erro (ou um acerto que vale repetir), rode o ciclo:

```
1. INCIDENTE  — registra no ledger: o que houve, causa-raiz, severidade, escopo
2. MEMÓRIA    — escreve UM fato curto (com "por quê" + "como aplicar")
3. TRAVA      — vira um GATE de código + um caso de teste
4. CHANGELOG  — registra o que mudou
5. COMMIT     — salva
```

Sem memória + gate + teste + entrada no ledger + evidência de execução em log, é só **intenção**, não aprendizado.

## A parte que quase todo mundo erra: ESCOPO
Não jogue toda lição como regra global. Lição de um domínio vira lei de tudo = o agente fica **rígido e burro**, e a acertividade cai.

| Escopo | Onde a lição vive |
|---|---|
| Global | conduta de todos os agentes |
| Conta | preferências do dono |
| Domínio | regra de uma área específica |
| Projeto | caminhos, seletores, fluxos locais |
| Agente | regra de um agente só |

Promoção entre escopos só com **revisão consciente** — nunca automático.

## Reincidência = diagnóstico, não retrabalho
Quando o mesmo erro volta, não investigue do zero. O fato de ter voltado já te diz uma coisa: **o conserto anterior errou a raiz** (senão não voltaria). Parta de "por que voltou mesmo já tendo sido corrigido?". Por isso todo erro resolvido é gravado **com a solução aplicada** e um contador de reincidência.

## Métrica honesta (com denominador)
Não meça "sensação". Meça **erros de alta severidade por 100 operações**, em janela móvel, **separado por tarefa**. Acompanhe: taxa de repetição de causa (a que mais importa), escape rate (erro que passou o gate e o humano pegou), cobertura de gates.

## Anti-padrões
- Memória virar cemitério de markdown (200 regras redundantes que ninguém usa).
- Gate que depende do agente "lembrar de chamar" — isso não é gate, é sugestão. Embuta no fluxo.
- Testar só função pura e achar o fluxo seguro — o erro real mora na integração.
- Aprendizado sem expiração — regra envelhece quando a realidade (UI, API, processo) muda.
