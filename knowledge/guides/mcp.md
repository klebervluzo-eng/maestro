# Guia — MCP (Model Context Protocol)

> **Linhagem (crédito honesto):** o MCP é um protocolo aberto criado pela Anthropic (final de 2024) para conectar modelos de IA a ferramentas e dados de forma padronizada. Este guia é síntese original dos conceitos práticos, com exemplos próprios e conexão com o framework Maestro. Especificação pública; redação e exemplos aqui são originais.

## A tese central

Antes do MCP, cada integração de IA com uma ferramenta (banco, API, arquivo, navegador) era um **conector sob medida** — você reescrevia a cola pra cada combinação modelo × ferramenta. O MCP resolve isso como um **padrão**: uma "porta USB" para IA. A ferramenta fala MCP uma vez; qualquer modelo que fala MCP se conecta.

Em uma frase: **MCP é o protocolo que deixa o modelo usar ferramentas externas sem cola sob medida pra cada uma.**

---

## A arquitetura (3 papéis)

| Papel | O que é | Exemplo |
|---|---|---|
| **Host** | o app de IA onde você conversa | um assistente, uma IDE com IA |
| **Client** | o conector dentro do host que fala MCP | a camada que traduz pro protocolo |
| **Server** | quem expõe a ferramenta/dado via MCP | um servidor que dá acesso a um banco, ao GitHub, a arquivos |

O host roda um client; o client conversa com um ou vários servers. Cada server publica o que sabe fazer — e o modelo descobre isso em tempo de execução.

---

## O que um MCP server expõe (3 primitivas)

| Primitiva | O que é | Exemplo |
|---|---|---|
| **Tools** | ações que o modelo pode executar | "criar issue", "rodar query", "enviar email" |
| **Resources** | dados que o modelo pode ler | um arquivo, uma tabela, uma página |
| **Prompts** | modelos de prompt reutilizáveis | "revise este PR seguindo X" |

A diferença que importa: **tool age** (faz algo, pode ter efeito colateral), **resource informa** (só leitura). Tratar os dois igual é pedir problema.

---

## Por que isso importa pra quem constrói agentes

1. **Reuso:** escreveu um server MCP pro seu banco uma vez → todo agente, em qualquer host, usa.
2. **Desacoplamento:** o agente não precisa saber COMO a ferramenta funciona por dentro — só o contrato MCP.
3. **Ecossistema:** dá pra plugar servers que outros já fizeram (GitHub, navegador, sistemas de arquivo) em vez de reescrever.
4. **Descoberta dinâmica:** o modelo pergunta ao server "o que você sabe fazer?" e se adapta — sem você hardcodar cada ferramenta.

---

## Os cuidados (onde MCP vira risco)

MCP dá ao modelo **poder de agir no mundo** — então a borda de segurança é tudo:

- **Confiança no server:** um MCP server malicioso pode expor uma "tool" que faz dano. Só conecte servers em que você confia.
- **Permissão na ação:** tool que apaga, paga ou publica precisa de **aprovação** antes de rodar — não autonomia cega. *(É exatamente o que a ponte de governança do Maestro faz: toda ação de risco passa por aprovação estruturada.)*
- **Validação na borda:** trate a saída de um resource como entrada não-confiável (pode conter instrução maliciosa — "prompt injection" via dado).
- **Menor privilégio:** o server expõe só o que o agente precisa, não o banco inteiro.

---

## MCP e o Maestro

No modelo do Maestro, um MCP server é como o **braço** de um agente especialista:
- O agente "researcher" pode ter um server MCP de busca como sua ferramenta.
- O agente "deployer" teria um server MCP de deploy — mas a **governança** (o conselho) exige aprovação estruturada antes de qualquer ação de risco que esse server execute.

Ou seja: **MCP dá o poder de agir; a governança decide se a ação pode acontecer.** Os dois juntos = agente capaz E seguro.

---

## Checklist pra usar MCP com responsabilidade

- [ ] Os servers conectados são de fonte confiável?
- [ ] Tools de risco (apagar/pagar/publicar) exigem aprovação antes de executar?
- [ ] A saída de resources é tratada como entrada não-confiável (anti-injection)?
- [ ] Cada server expõe só o mínimo necessário (menor privilégio)?
- [ ] Há log de qual tool foi chamada, com quais argumentos?

---

## Conexão com o resto do material

- **Guia 12-Factor (princípio 5)**: "ferramentas são funções tipadas" — MCP é o padrão que formaliza isso.
- **Ponte de governança do Maestro**: o controle de aprovação que toda ação MCP de risco deveria passar.
- **Field note 02 (gates que leem o estado real)**: depois que uma tool MCP roda, verifique o resultado real — não confie no relato.

MCP em uma frase: **o padrão que conecta IA a ferramentas — poderoso, e por isso mesmo precisa de governança na borda.**
