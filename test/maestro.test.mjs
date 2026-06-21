// Testes do núcleo — runner nativo do Node (node --test). Zero dependência.
import { test } from "node:test";
import assert from "node:assert/strict";
import { route } from "../src/router.mjs";
import { buildPlan, runGates, orchestrate } from "../src/orchestrator.mjs";
import { loadAgents } from "../src/registry.mjs";
import { govern } from "../src/governance.mjs";

const AGENTS = await loadAgents();

test("registry carrega e valida os agentes", () => {
  assert.ok(AGENTS.length >= 3);
  for (const a of AGENTS) {
    assert.ok(a.id && a.name && a.role);
    assert.ok(Number.isInteger(a.phase));
  }
});

test("router ranqueia por relevância e ignora ruído", () => {
  const r = route("pesquise o mercado", AGENTS);
  assert.equal(r[0].agent.id, "researcher");
});

test("router sinaliza fallback quando nada bate", () => {
  const r = route("previsão do tempo amanhã", AGENTS);
  assert.equal(r[0].fallback, true);
});

test("plano respeita a ORDEM das fases (descobrir → construir → verificar)", () => {
  // mesmo com 'revise' citado primeiro, a fase ordena corretamente
  const plan = buildPlan("revise e construa e pesquise", AGENTS);
  const phases = plan.steps.map((s) => s.phase);
  const ordenado = [...phases].sort((a, b) => a - b);
  assert.deepEqual(phases, ordenado, "passos devem estar em ordem de fase");
  assert.equal(plan.steps[0].agentId, "researcher");
});

test("gate de causalidade: build sem review posterior é BLOQUEADO", () => {
  // agente builder isolado (sem o reviewer delegado) deve bloquear
  const soBuilder = AGENTS.filter((a) => a.id === "builder").map((a) => ({ ...a, delegatesTo: [] }));
  const plan = buildPlan("crie o código", soBuilder);
  const { blocked } = runGates(plan);
  assert.equal(blocked, true);
});

test("fluxo completo passa todos os gates", () => {
  const res = orchestrate("pesquise o mercado e construa um relatório, depois revise", AGENTS);
  assert.equal(res.status, "OK");
});

test("pedido sem match é BLOCKED (não inventa)", () => {
  const res = orchestrate("previsão do tempo amanhã", AGENTS);
  assert.equal(res.status, "BLOCKED");
});

test("orquestrador é defensivo contra agente com 'produces' não-string", () => {
  // mesmo se um agente malformado escapar, o gate não pode quebrar
  const malformado = [{ id: "x", name: "X", role: "r", phase: 2, keywords: ["crie"], delegatesTo: [], produces: 123 }];
  assert.doesNotThrow(() => buildPlan("crie algo", malformado));
  assert.doesNotThrow(() => runGates(buildPlan("crie algo", malformado)));
});

// ── Ponte de governança (Maestro como conselho sempre-ativo) ──

test("govern APROVA ação simples sem risco", () => {
  const v = govern({ action: "gerar um resumo de texto" });
  assert.equal(v.verdict, "APPROVED");
  assert.equal(v.schemaVersion, "1.0");
});

test("govern BLOQUEIA ação de risco sem aprovação humana", () => {
  const v = govern({ action: "deploy para produção" });
  assert.equal(v.verdict, "BLOCKED");
});

test("govern APROVA risco só com aprovação ESTRUTURADA (by+at), não booleano autodeclarado", () => {
  // booleano autodeclarado NÃO basta
  assert.equal(govern({ action: "deploy para produção", humanApproved: true }).verdict, "BLOCKED");
  // aprovação estruturada (quem + quando) aprova
  const v = govern({ action: "deploy para produção", approval: { by: "kleber", at: "2026-06-21T10:00:00Z" } });
  assert.equal(v.verdict, "APPROVED");
});

test("govern BLOQUEIA artefato não verificado", () => {
  const v = govern({ action: "escrever módulo", produces: "código" });
  assert.equal(v.verdict, "BLOCKED");
});

test("govern detecta risco escondido em context/target (não só em action)", () => {
  const v = govern({ action: "executar plano", context: "delete prod database" });
  assert.equal(v.verdict, "BLOCKED");
});

test("govern rejeita 'risk' malformado (não-array)", () => {
  assert.equal(govern({ action: "x", risk: "production" }).verdict, "BLOCKED");
});

test("govern é defensivo contra payload inválido (null, string, array)", () => {
  assert.equal(govern(null).verdict, "BLOCKED");
  assert.equal(govern("texto solto").verdict, "BLOCKED");
  assert.equal(govern([]).verdict, "BLOCKED");
  assert.equal(govern([]).gates[0].id, "payload-valido");
});
