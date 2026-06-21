# 04 — Raiz primeiro + sistema autossuficiente

## Lei 1 — Nunca corrigir no sintoma. Sempre pela raiz.
Apareceu um problema? É **proibido** ir direto no lugar e arrumar na mão. Isso "resolve" na hora e o erro **volta**. O caminho, sem exceção:

```
1. DESCOBRIR A RAIZ   — por que ocorreu de verdade (ler estado/log real, não chutar)
2. ENTENDER A CORREÇÃO — como consertar a CAUSA, não o sintoma
3. APLICAR NO SISTEMA  — a correção entra na automação, não na mão
4. O SISTEMA EXECUTA   — ele aplica e propaga sozinho
5. NUNCA MAIS          — trava com gate/teste pra a causa não reincidir
```

Se você corrigiu algo manualmente, **ainda não terminou** — falta transformar a correção em algo que o sistema faz sozinho.

## Lei 2 — O sistema é autossuficiente. A IA é auxílio, não motor.
A IA **ajuda** a descobrir, projetar e validar. Mas a operação **não pode depender da IA pra rodar**. Se desligar a IA, a máquina continua funcionando.

- Tudo que a IA fizer manualmente **uma vez** deve virar código/automação determinística (cron, robô, gate, serviço).
- A IA conserta e melhora a engrenagem — **não é** a engrenagem.
- Fluxo que depende de "a IA lembrar de rodar" ou "a IA clicar toda vez" = **falha de design**.

## Paliativo só estanca risco — e SEMPRE seguido da raiz
Quando há risco imediato (ex: vender sem estoque) e a correção-raiz vai demorar, é permitido um paliativo manual **imediato** só pra estancar o risco. Mas:

- O paliativo **não fecha** o incidente. Ele cria uma obrigação `root_fix` aberta.
- O incidente só fecha com **prova de que o fluxo automático foi corrigido** — nunca com "o sintoma sumiu".
- Sintoma sumiu por correção manual ≠ resolvido. Na próxima vez, volta.

## Proibido ver problema e não resolver
Quem vê um problema vai **até o fim** e resolve a raiz. Ver e só reportar = falha. Não existe "vi mas não era comigo".

## Anti-padrões
- Ir direto na produção e "consertar" o sintoma na mão.
- Deixar a operação dependente da IA pra funcionar.
- Fechar incidente porque o sintoma sumiu (sem prova de raiz corrigida).
- Dizer "resolvido" quando só estancou o sintoma.
