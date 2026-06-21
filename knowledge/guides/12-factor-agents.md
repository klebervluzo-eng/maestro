# Guia — Engenharia de Agentes Confiáveis (estilo 12-Factor)

> **Sobre a linhagem (crédito honesto):** a ideia "12 fatores" vem do [12-Factor App](https://12factor.net) (Heroku, 2011), que definiu como escrever software-as-a-service robusto. A comunidade de IA adaptou isso para agentes — notadamente o **12-Factor Agents** da HumanLayer. Este guia **não é a lista deles**: é a minha síntese dos princípios, com exemplos próprios e conexão com o framework Maestro. Os conceitos são públicos; a redação e os exemplos aqui são originais.

## A tese central

Um agente que funciona em produção **não é um prompt esperto** — é **software de engenharia** com IA dentro. A diferença entre um demo que impressiona e um agente que aguenta produção está nas decisões de arquitetura, não no tamanho do prompt. Os princípios abaixo são essas decisões.

---

## Os princípios (agrupados em 4 blocos)

### Bloco 1 — Controle do que entra (contexto)

**1. Você é o dono do contexto, não o framework.**
Não terceirize pra uma abstração mágica o que vai dentro da janela. Monte o contexto explicitamente: o que entra, em que ordem, quanto ocupa. Contexto é orçamento — gaste no que decide a resposta.

**2. Contexto é construído, não despejado.**
Em vez de jogar o arquivo/histórico inteiro, entregue só o trecho relevante à tarefa. Menos tokens, menos ruído, mais acerto. *(É exatamente o que uma camada tipo "mapa de código" faz: entrega o símbolo certo, não a biblioteca inteira.)*

**3. Prompts são código.** Versione, revise, teste. Um prompt que muda o comportamento de produção merece o mesmo cuidado de um deploy — não um edit no escuro.

### Bloco 2 — Controle do que sai (saída estruturada)

**4. Force saída estruturada (JSON/schema), não texto livre.**
Texto livre você tem que parsear e torcer. Saída validada por schema falha cedo e claro — o modelo reescreve até bater. A saída do agente é um **contrato**, não uma redação.

**5. Ferramentas são funções tipadas, não mágica.**
Uma "tool" é só uma função com entrada e saída definidas. Trate como API: contrato claro, validação na borda, erro explícito. O modelo escolhe *qual* chamar; o seu código garante que a chamada é válida.

### Bloco 3 — Controle do fluxo (estado e orquestração)

**6. O estado é seu, não do modelo.**
O modelo não "lembra". Quem lembra é a sua máquina de estado (banco, fila, plano). O modelo lê o estado e propõe o próximo passo — ele não **é** o estado. Se a sessão cair, o estado sobrevive.

**7. Um agente pequeno e focado > um agente que faz tudo.**
Vários especialistas com escopo estreito, orquestrados, batem um monólito que tenta resolver qualquer coisa. *(É o coração do Maestro: roteador → especialistas → delegação em cadeia.)*

**8. Controle o fluxo você mesmo.**
Não deixe o loop "agente decide tudo sozinho" sem trilho. Defina as fases (descobrir → construir → verificar), a ordem, e os pontos onde o humano entra. Autonomia sem trilho vira agente perdido.

### Bloco 4 — Confiança (o que separa demo de produção)

**9. Pause para o humano nos pontos de risco.**
Ação destrutiva, pagamento, dado sensível → o agente para e pede confirmação. Persistência é virtude; teimosia em ação irreversível é defeito.

**10. Trate erro como dado, não como exceção fatal.**
Compacte o erro, devolva pro modelo como informação ("isso falhou, tente outra rota"), com retry e limite. Um erro tratado é uma chance de recuperação; um erro engolido é um falso "deu certo".

**11. Verifique lendo o estado real — não o relato do agente.**
"Marquei como feito" não é evidência. O gate relê a fonte da verdade e confirma. O pior cenário não é o erro visível — é o **falso verde**. *(Princípio central dos field notes que acompanham este guia.)*

**12. Comece sem estado (stateless) e adicione estado conscientemente.**
Quanto menos memória oculta, mais previsível e testável o agente. Estado é poder e é risco — adicione onde precisa, não por padrão.

---

## Checklist de produção (use antes de chamar um agente de "pronto")

- [ ] O contexto é montado explicitamente (não despejado)?
- [ ] A saída é validada por schema?
- [ ] Cada ferramenta tem contrato tipado e validação na borda?
- [ ] O estado vive fora do modelo (sobrevive a um crash)?
- [ ] As fases têm ordem garantida (não acidental)?
- [ ] Existe pausa humana nos pontos irreversíveis?
- [ ] Erro vira dado com retry e limite?
- [ ] Há um gate que **relê o estado real** antes de declarar sucesso?
- [ ] Existe teste automatizado para os caminhos críticos?

Se você marcou todos, você tem um agente de produção. Se faltou algum, você tem um demo — e demo quebra na primeira vez que importa.

---

## Como isso conversa com o resto deste material

- **Maestro** implementa os princípios 7 e 8 (especialistas + fluxo por fases) e o 11 (gates que leem o plano real).
- **Field notes 02 e 05** aprofundam o princípio 11 (estado real) e o 6/12 (memória que não está no modelo).
- **Field note 06** aprofunda o 9 (pausa humana) e a antecipação de problema.

A ideia não é decorar 12 regras. É internalizar uma postura: **agente confiável é engenharia, não sorte.**
