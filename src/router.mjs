// router.mjs — decide quais agentes um pedido aciona.
// Roteamento determinístico por intenção (score de palavras-chave).
// É a primeira camada — barata e previsível. Uma camada de LLM pode
// entrar acima disto quando o pedido for ambíguo, mas o núcleo não depende dela.

/**
 * Normaliza texto: minúsculas, sem acento, sem pontuação.
 */
function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove diacríticos combinantes
    .replace(/[^\p{L}\p{N}\s]/gu, " ");
}

/**
 * Pontua um agente contra o pedido: quantas keywords batem.
 */
function scoreAgent(agent, normalizedRequest) {
  const tokens = new Set(normalizedRequest.split(/\s+/).filter(Boolean));
  let score = 0;
  const hits = [];
  for (const kw of agent.keywords) {
    const nkw = normalize(kw);
    if (tokens.has(nkw)) {
      score += 1;
      hits.push(kw);
    }
  }
  return { score, hits };
}

/**
 * Roteia um pedido para os agentes relevantes, ordenados por relevância.
 * @returns {Array<{agent, score, hits}>} sempre devolve ao menos 1 (o de maior score, ou fallback).
 */
export function route(request, agents) {
  const norm = normalize(request);
  const ranked = agents
    .map((agent) => ({ agent, ...scoreAgent(agent, norm) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  if (ranked.length === 0) {
    // Fallback explícito: nada bateu. Não inventa — sinaliza incerteza.
    return [{ agent: null, score: 0, hits: [], fallback: true }];
  }
  return ranked;
}
