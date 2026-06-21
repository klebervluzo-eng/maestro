# 02 — Gates que leem o estado REAL (não o relato do agente)

## O problema
O agente diz: "marquei tudo como concluído." Você confia. Mas ele **não marcou** — a UI tinha um cache, ou o clique não pegou, ou a página travou. O relato do agente **não é evidência**.

## O princípio
Um gate confiável **relê o estado real** da fonte da verdade — nunca confia no que o próprio agente afirma ter feito.

```
RUIM:  agente diz "feito" → sistema marca como feito
CERTO: agente diz "feito" → gate relê o estado real → bate? então feito. não bate? bloqueia.
```

Exemplo concreto: depois de uma ação que deveria zerar uma fila, o gate **recarrega a fonte e conta**. Se o contador não está em zero, a tarefa **não terminou** — independente do que o agente relatou.

## Por que cache quebra tudo
Muitos sistemas (painéis web, contadores, tabelas) **cacheiam**. Se você lê logo após agir, lê o valor velho e acha que "não tem nada" ou que "já deu certo". Regra: **recarregue a fonte antes de ler** qualquer estado de decisão. Toda leitura de gate é leitura fresca.

## Gate crítico vs informativo
- **Crítico** → BLOQUEIA o fluxo se falhar (ex: emitir, salvar, enviar dinheiro).
- **Informativo** → ALERTA mas deixa seguir.

Escolha conscientemente. Bloquear demais trava a operação; bloquear de menos deixa o erro passar.

## Fail-closed nas operações de risco
Em ação de risco (financeiro, emissão, estoque), o default na dúvida é **negar/parar**, não seguir. "Não tenho certeza" nunca pode virar "deixa passar".

## A armadilha do falso verde
O pior cenário não é o gate vermelho — é o **falso verde**: o relatório diz "tudo certo" quando não está. Isso acontece quando o gate observa a coisa errada. **"Ter gate" ≠ "o gate observa o estado certo."** Audite o que o gate realmente lê.

## Anti-padrões
- Rodar a tarefa em background e tratar "processo não deu erro" como "tarefa concluída" (mata o processo = falso verde).
- Log sem id de execução / versão do gate — depois ninguém sabe o que rodou.
- Gate que lê o relato do agente em vez do estado do sistema.
