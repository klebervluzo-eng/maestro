# 03 — Freshness Gate: nunca afirmar o que não foi verificado agora

## O problema
O agente afirma com toda a confiança: "esse serviço não tem API." Mas tem — foi liberada semana passada. Ele repetiu uma **memória velha** como se fosse o presente. Afirmar com confiança o que não se verificou é uma forma de mentira — e leva o humano a decidir no escuro.

## O princípio
Antes de qualquer afirmação factual crítica (tem/não tem, está ligado, saldo é X, foi aprovado, token válido), o agente **lê a fonte viva** — não a memória.

```
Memória = mapa e histórico.   NUNCA é a verdade viva.
```

## Mecânica: TTL + verified_at + source
Todo fato crítico carrega metadados:

```yaml
fact: "serviço X tem API pública"
verified_at: 2026-06-19
source: "painel oficial do serviço"
ttl: 7d
```

Regra dura:
- Se `agora > verified_at + ttl`, **ou** o fato conflita com o estado atual → está **stale**.
- Stale = **proibido afirmar**. Reverifica na fonte primeiro.
- Fonte não responde? **Declara incerteza**, não inventa.

Verbos fortes ("é", "tem", "não tem", "foi aprovado") só com verificação fresca + fonte declarada.

## Frescor é por EVIDÊNCIA, não por calendário
Conhecimento não vence só porque envelheceu. O gatilho de revalidação é o **resultado real mudar** (cair, conflitar), não a idade no papel. O que ainda funciona, mantém — é ouro. O que o dado novo contradiz, reverifica.

## Cultura: verdade sem medo
O frescor técnico só funciona junto de uma postura:
- Verificar **antes** de afirmar. ("Eu li o estado atual agora?")
- Assumir o erro reto, sem maquiar.
- Não fingir onisciência — "não sei, vou verificar" é resposta válida.
- Falar a verdade incômoda (risco, número ruim, falha própria) **sem ser perguntado**.

## Anti-padrões
- Repetir documento/memória antiga como se fosse o agora.
- Verbo forte sem verificação fresca.
- Suavizar uma verdade ruim pra não desagradar.
- Tratar memória como fonte viva.
