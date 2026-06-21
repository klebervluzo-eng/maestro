#!/usr/bin/env node
// maestro.mjs — CLI do Maestro.
//
// Modos:
//   maestro "pedido"                 → orquestra (texto legível)
//   maestro --json "pedido"          → orquestra (JSON, pra outro sistema ler)
//   maestro govern  (decisão no stdin) → governa uma decisão externa, devolve veredito JSON
//
// O modo `govern` é a PONTE: o SINAPSE (ou qualquer sistema) manda uma decisão
// proposta no stdin e recebe um veredito (APPROVED/BLOCKED). É o Maestro como
// conselho sempre-ativo — não só quando chamado pra executar.

import { loadAgents } from "./src/registry.mjs";
import { orchestrate } from "./src/orchestrator.mjs";
import { govern, reject } from "./src/governance.mjs";
import { logDecision } from "./src/telemetry.mjs";

const MAX_STDIN_BYTES = 1_000_000; // 1 MB — ponte é pra decisões, não pra payload gigante

async function readStdin(maxBytes = MAX_STDIN_BYTES) {
  const chunks = [];
  let total = 0;
  for await (const chunk of process.stdin) {
    total += chunk.length;
    if (total > maxBytes) return { tooLarge: true };
    chunks.push(chunk);
  }
  return { text: Buffer.concat(chunks).toString("utf8").trim() };
}

// Todo caminho do govern devolve veredito JSON versionado (contrato machine-readable).
function emitVerdict(verdict) {
  console.log(JSON.stringify(verdict, null, 2));
  process.exit(verdict.verdict === "APPROVED" ? 0 : 1);
}

async function runGovern() {
  const { text, tooLarge } = await readStdin();
  if (tooLarge) return emitVerdict(reject(`payload excede o limite de ${MAX_STDIN_BYTES} bytes`));
  if (!text) return emitVerdict(reject("nenhuma decisão recebida no stdin"));
  let decision;
  try {
    decision = JSON.parse(text);
  } catch {
    return emitVerdict(reject("JSON inválido no stdin"));
  }
  const verdict = govern(decision);
  // Telemetria de observação (fail-open; só grava se MAESTRO_LOG_DIR estiver setado).
  await logDecision({
    ts: new Date().toISOString(),
    action: typeof decision?.action === "string" ? decision.action.slice(0, 200) : null,
    verdict: verdict.verdict,
    reasons: verdict.reasons,
  });
  emitVerdict(verdict);
}

async function runOrchestrate(args) {
  const asJson = args.includes("--json");
  const request = args.filter((a) => a !== "--json").join(" ").trim();
  if (!request) {
    console.error('Uso: maestro "seu pedido"  |  maestro --json "seu pedido"  |  maestro govern < decisao.json');
    process.exit(2);
  }

  let agents;
  try {
    agents = await loadAgents();
  } catch (err) {
    console.error(`Falha ao carregar agentes: ${err.message}`);
    process.exit(1);
  }

  const result = orchestrate(request, agents);

  if (asJson) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.status === "OK" ? 0 : 1);
  }

  console.log(`\n🎼  Maestro — pedido: "${result.request}"`);
  console.log("─".repeat(60));
  if (result.plan.steps.length === 0) {
    console.log("Nenhum agente roteado.");
  } else {
    console.log("Plano de delegação:");
    result.plan.steps.forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.name} (${s.role})  ← ${s.reason}`);
    });
  }
  console.log("\nGates de governança:");
  for (const g of result.gates) {
    const icon = g.pass ? "✅" : (g.critical ? "⛔" : "⚠️");
    console.log(`  ${icon} ${g.id}: ${g.detail}`);
  }
  console.log("─".repeat(60));
  console.log(`Status: ${result.status === "OK" ? "✅ OK" : "⛔ BLOCKED (gate crítico falhou)"}\n`);
  process.exit(result.status === "OK" ? 0 : 1);
}

async function main() {
  const args = process.argv.slice(2);
  const isGovern = args[0] === "govern";
  try {
    if (isGovern) await runGovern();
    else await runOrchestrate(args);
  } catch (err) {
    // No modo govern, até erro inesperado sai como JSON versionado (contrato consistente).
    if (isGovern) console.log(JSON.stringify(reject(`erro inesperado: ${err.message}`), null, 2));
    else console.error(`Erro inesperado: ${err.message}`);
    process.exit(1);
  }
}

main();
