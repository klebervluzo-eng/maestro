# Guia — RAG (Retrieval-Augmented Generation) que não alucina

> **Linhagem (crédito honesto):** RAG foi formalizado em pesquisa (Lewis et al., 2020) e virou padrão da indústria. Este guia é síntese original dos princípios práticos, com exemplos próprios e conexão com o framework Maestro. Conceito público; redação e exemplos aqui são originais.

## A tese central

RAG é dar ao modelo **a fonte antes da resposta**. Em vez de confiar no que ele "lembra" do treino (que envelhece e alucina), você **recupera** a informação certa e manda junto com a pergunta. O modelo responde **baseado na fonte**, não na memória.

É o mesmo princípio do **Freshness Gate** dos field notes: não afirme do que está na cabeça — leia a fonte viva primeiro.

---

## Quando usar RAG (e quando NÃO)

| Use RAG | Não use RAG |
|---|---|
| Conhecimento que muda (preços, docs, políticas) | Conhecimento estável e geral (o modelo já sabe) |
| Dados privados/internos que o modelo nunca viu | Tarefa de raciocínio puro (matemática, lógica) |
| Precisa de fonte citável ("de onde veio isso?") | Quando fine-tuning resolve melhor (estilo, formato fixo) |
| Base grande demais pra caber no contexto | Base pequena que cabe inteira no prompt |

**Regra:** RAG é para **fatos que mudam ou são privados**. Não é bala de prata — é uma ferramenta com lugar certo.

---

## O pipeline, honesto (onde cada etapa quebra)

```
Documento → Chunk → Embed → Indexar → [pergunta] → Recuperar → Reordenar → Gerar
```

### 1. Chunking (dividir) — onde a maioria erra primeiro
- Pedaço **grande demais** → traz ruído junto com o sinal.
- Pedaço **pequeno demais** → perde o contexto que dá sentido.
- **Quebrar no meio de uma ideia** → recupera metade de uma frase.
- Melhor: quebrar por **estrutura semântica** (seção, parágrafo, função), com leve sobreposição pra não perder a borda.

### 2. Embedding (vetorizar) — escolha importa
O embedding define o que "parece parecido". Modelo ruim de embedding = recuperação ruim, e nenhum LLM bom depois conserta. Lixo que entra, lixo que sai.

### 3. Recuperação — só similaridade não basta
- **Híbrido** (vetor + palavra-chave) supera só-vetor na maioria dos casos reais.
- **Reranking**: recupere mais candidatos (ex: 20), reordene por relevância, mande os melhores (ex: 5). Recuperar muito e refinar bate recuperar pouco e torcer.
- **Filtro por metadado** (data, fonte, tipo) antes da similaridade — recall dirigido, não cego.

### 4. Geração — amarre o modelo à fonte
- Instrua: "responda **apenas** com base no contexto; se não estiver lá, diga que não sabe."
- Peça **citação da fonte** — assim você audita e o modelo se segura.
- Isso mata a alucinação: sem fonte, sem afirmação.

---

## Os erros clássicos (e o conserto)

| Sintoma | Causa raiz | Conserto |
|---|---|---|
| Recupera trecho errado | chunking ruim ou embedding fraco | requebrar por semântica; trocar embedding |
| Responde certo às vezes, errado outras | só similaridade, sem rerank | adicionar reranking + híbrido |
| Inventa o que não está na fonte | geração não amarrada | instruir "só com base no contexto" + citar fonte |
| Ignora a melhor fonte | ela caiu no "meio" do contexto | reordenar: relevante nas pontas |
| Fonte desatualizada | índice velho | reindexar; tratar frescor por evidência |

---

## RAG e Agentes (o nível seguinte)

RAG não precisa ser um passo único. Num agente, ele vira uma **ferramenta**:
- O agente decide **se** precisa buscar, **o que** buscar e **quando** buscar de novo.
- Recuperação **iterativa**: busca → lê → percebe que falta algo → refina a busca.
- *(No Maestro, isso seria um agente "researcher" cuja ferramenta é o retriever — a governança garante que a evidência vem antes da decisão.)*

---

## Checklist de um RAG que você confia

- [ ] Os chunks respeitam a estrutura semântica (não cortam ideias)?
- [ ] O modelo de embedding foi escolhido (não o default por acaso)?
- [ ] A recuperação é híbrida (vetor + keyword)?
- [ ] Tem reranking (recupera muitos, refina pros melhores)?
- [ ] A geração é instruída a usar **só** a fonte e a **citar**?
- [ ] O índice é reindexado quando a fonte muda?
- [ ] Você testou com perguntas reais e mediu acerto (não "achismo")?

---

## Conexão com o resto do material

- **Field note 03 (Freshness Gate)**: RAG é a versão técnica de "leia a fonte viva antes de afirmar".
- **Guia Context Engineering**: recuperar é o movimento #1 da engenharia de contexto.
- **Maestro**: RAG entra como ferramenta de um agente especialista, sob governança.

RAG em uma frase: **fonte antes da resposta — e cita de onde veio.**
