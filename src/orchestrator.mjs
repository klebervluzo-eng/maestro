// orchestrator.mjs — o maestro.
// Recebe um pedido, roteia para os agentes, ORDENA por fase (descobrir → construir →
// verificar), monta o plano de delegação e aplica os gates de governança ANTES de
// declarar conclusão. Os gates leem o estado real do plano — não confiam no relato
// de nenhum agente.

import { route } from "./router.mjs";

/**
 * Monta o plano de execução a partir do pedido.
 * Coleta os agentes (match + delegação) e os ORDENA por fase — assim a ordem
 * lógica (pesquisa antes de build, verificação depois) é garantida, não acidental.
 */
export function buildPlan(request, agents) {
  const ranked = route(request, agents);
  const plan = { request, steps: [], warnings: [] };

  if (ranked[0]?.fallback) {
    plan.warnings.push("Nenhum agente especialista bateu com o pedido. Roteamento incerto — escalar para humano em vez de inventar.");
    return plan;
  }

  const chosen = new Map(); // id -> { agent, reason, score }
  const consider = (agent, reason, score) => {
    if (!agent || chosen.has(agent.id)) return;
    chosen.set(agent.id, { agent, reason, score });
    for (const depId of agent.delegatesTo) {
      const dep = agents.find((a) => a.id === depId);
      if (dep) consider(dep, `delegado por ${agent.name}`, 0);
    }
  };

  for (const r of ranked) consider(r.agent, `match: ${r.hits.join(", ")}`, r.score);

  // Ordena por fase (asc); dentro da mesma fase, maior score primeiro.
  plan.steps = [...chosen.values()]
    .sort((a, b) => a.agent.phase - b.agent.phase || b.score - a.score)
    .map(({ agent, reason }) => ({
      agentId: agent.id,
      name: agent.name,
      role: agent.role,
      phase: agent.phase,
      reason,
      produces: agent.produces || null,
    }));

  return plan;
}

/**
 * Gates de governança. Cada gate LÊ o estado real do plano e devolve pass/fail.
 * Gate crítico que falha => o orquestrador NÃO declara sucesso.
 */
export function runGates(plan) {
  const results = [];

  // Gate 1 (crítico): todo pedido tem ao menos um executor roteado.
  results.push({
    id: "tem-executor",
    critical: true,
    pass: plan.steps.length > 0,
    detail: plan.steps.length > 0 ? `${plan.steps.length} agente(s) no plano` : "nenhum agente roteado",
  });

  // Gate 2 (crítico): quem produz artefato tem verificação DEPOIS dele (causalidade real).
  const builders = plan.steps.filter((s) => typeof s.produces === "string" && s.produces.includes("implementado"));
  let verificacaoOk = true;
  let verifDetail = "não produz artefato; verificação não exigida";
  if (builders.length > 0) {
    const lastBuildPhase = Math.max(...builders.map((b) => b.phase));
    const reviewAfter = plan.steps.find((s) => s.agentId === "reviewer" && s.phase > lastBuildPhase);
    verificacaoOk = Boolean(reviewAfter);
    verifDetail = verificacaoOk
      ? "construção tem verificação a jusante (fase posterior)"
      : "construção SEM verificação posterior — bloqueado";
  }
  results.push({ id: "verificacao-obrigatoria", critical: true, pass: verificacaoOk, detail: verifDetail });

  // Gate 3 (informativo): roteamento sem ambiguidade.
  results.push({
    id: "sem-incerteza",
    critical: false,
    pass: plan.warnings.length === 0,
    detail: plan.warnings.length === 0 ? "roteamento confiante" : plan.warnings.join(" | "),
  });

  const blocked = results.some((g) => g.critical && !g.pass);
  return { results, blocked };
}

/**
 * Orquestra de ponta a ponta: plano + gates.
 * Fail-closed: se um gate crítico falha, status = BLOCKED (não SUCCESS).
 */
export const SCHEMA_VERSION = "1.0";

export function orchestrate(request, agents) {
  const plan = buildPlan(request, agents);
  const gates = runGates(plan);
  return {
    schemaVersion: SCHEMA_VERSION,
    request,
    plan,
    gates: gates.results,
    status: gates.blocked ? "BLOCKED" : "OK",
  };
}
