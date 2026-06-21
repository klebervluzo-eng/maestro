#!/usr/bin/env node
// maestro.mjs — CLI do Maestro.
// Uso: node maestro.mjs "seu pedido em linguagem natural"

import { loadAgents } from "./src/registry.mjs";
import { orchestrate } from "./src/orchestrator.mjs";

async function main() {
  const request = process.argv.slice(2).join(" ").trim();
  if (!request) {
    console.error('Uso: maestro "seu pedido"\nEx.: maestro "pesquise o mercado e construa um relatório, depois revise"');
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

  // exit code reflete o status — útil pra automação encadear
  process.exit(result.status === "OK" ? 0 : 1);
}

main().catch((err) => {
  console.error(`Erro inesperado: ${err.message}`);
  process.exit(1);
});
