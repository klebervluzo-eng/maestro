// knowledge-watch.mjs — relatório do VIGIA de conhecimento.
// Responde: o agente está CONSULTANDO o conhecimento, ou trabalhando sem olhar?
// Não mede se USOU (não é lixo obrigatório) — mede se ANALISOU.
//
// Sinal honesto: houve trabalho (operações) mas ZERO consulta = alerta vermelho.

import { readFile } from "node:fs/promises";
import { join } from "node:path";

const LOG_DIR = process.env.MAESTRO_LOG_DIR;
const DAY = 24 * 60 * 60 * 1000;
const WINDOW = Number(process.argv[2] || 1);

async function jsonl(name) {
  if (!LOG_DIR) return [];
  try {
    const raw = await readFile(join(LOG_DIR, name), "utf8");
    return raw.split("\n").filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  } catch { return []; }
}
const recent = (recs) => recs.filter((r) => Date.now() - new Date(r.ts).getTime() <= WINDOW * DAY);

async function main() {
  const ops = recent(await jsonl("decisions.jsonl")).length;       // trabalho feito
  const consults = recent(await jsonl("knowledge-consults.jsonl")); // consultas a conhecimento
  const nConsult = consults.length;

  const taxa = ops > 0 ? (nConsult / ops) * 100 : 0;
  let verdict, reason;
  if (ops < 5) {
    verdict = "INSUFFICIENT";
    reason = `pouca atividade (${ops} operações) — sem base pra julgar`;
  } else if (nConsult === 0) {
    verdict = "ALERTA";
    reason = `trabalhou em ${ops} ações e NÃO consultou o conhecimento NENHUMA vez`;
  } else if (taxa < 1) {
    verdict = "ATENCAO";
    reason = `consultou só ${nConsult}x em ${ops} ações (${taxa.toFixed(1)}/100) — consulta rara, provavelmente desenvolvendo sem olhar a base`;
  } else {
    verdict = "OK";
    reason = `consultou o conhecimento ${nConsult}x em ${ops} ações (${taxa.toFixed(1)}/100)`;
  }

  console.log(JSON.stringify({
    janelaDias: WINDOW,
    operacoes: ops,
    consultasConhecimento: nConsult,
    consultasPor100ops: ops > 0 ? Number(((nConsult / ops) * 100).toFixed(1)) : null,
    verdict, reason,
  }, null, 2));
}

main();
