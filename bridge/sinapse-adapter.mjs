// sinapse-adapter.mjs — casca FINA que deixa o SINAPSE (ou qualquer sistema)
// consultar o Maestro como conselho. NÃO replica a lógica do Maestro — só chama
// a ponte e devolve o veredito. O Maestro continua a fonte da verdade.
//
// Uso a partir de outro processo (ex: um agente do SINAPSE):
//   import { askMaestro } from "../bridge/sinapse-adapter.mjs";
//   const verdict = askMaestro({ action: "deploy prod" }); // sem aprovação → BLOCKED
//   if (verdict.verdict === "BLOCKED") { /* não prosseguir */ }
//   // para aprovar risco: { action: "deploy prod", approval: { by, at } }
//
// Ou via shell (sem importar nada):
//   echo '{"action":"deploy prod"}' | node maestro.mjs govern

import { govern } from "../src/governance.mjs";

/**
 * Pergunta ao conselho (Maestro) se uma decisão pode prosseguir.
 * Chamada in-process — zero rede, zero spawn.
 * @param {object} decision
 * @returns {{schemaVersion:string, verdict:"APPROVED"|"BLOCKED", gates:Array, reasons:string[]}}
 */
export function askMaestro(decision) {
  return govern(decision);
}

/**
 * Versão "guarda": lança se a decisão for bloqueada. Útil pra embutir num fluxo
 * onde o bloqueio deve interromper a execução.
 */
export function enforce(decision) {
  const verdict = askMaestro(decision);
  if (verdict.verdict === "BLOCKED") {
    const reasons = verdict.reasons.join("; ");
    throw new Error(`Maestro bloqueou a decisão: ${reasons}`);
  }
  return verdict;
}
