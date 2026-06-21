// analyze.mjs — lê o log de decisões e produz um veredito objetivo da janela.
// Uso: MAESTRO_LOG_DIR=/caminho node scripts/analyze.mjs [janelaDias]
// Saída: JSON com métricas + veredito (GOOD | BAD | INSUFFICIENT).

import { readFile } from "node:fs/promises";
import { join } from "node:path";

const LOG_DIR = process.env.MAESTRO_LOG_DIR;
const WINDOW_DAYS = Number(process.argv[2] || 1);

async function main() {
  if (!LOG_DIR) {
    console.log(JSON.stringify({ verdict: "INSUFFICIENT", reason: "MAESTRO_LOG_DIR não definido" }));
    return;
  }

  let lines = [];
  try {
    const raw = await readFile(join(LOG_DIR, "decisions.jsonl"), "utf8");
    lines = raw.split("\n").filter(Boolean);
  } catch {
    console.log(JSON.stringify({ verdict: "INSUFFICIENT", reason: "sem log de decisões ainda" }));
    return;
  }

  const cutoff = Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const recs = [];
  for (const l of lines) {
    try {
      const r = JSON.parse(l);
      if (new Date(r.ts).getTime() >= cutoff) recs.push(r);
    } catch { /* ignora linha corrompida */ }
  }

  const total = recs.length;
  const blocked = recs.filter((r) => r.verdict === "BLOCKED").length;
  const approved = total - blocked;
  const blockRate = total ? blocked / total : 0;

  // Critério objetivo:
  // - INSUFFICIENT: poucos dados pra concluir
  // - BAD: bloqueando quase tudo (provável falso-positivo / atrapalhando)
  // - GOOD: bloqueou alguma coisa e deixou o resto passar (agrega sem travar)
  let verdict, reason;
  if (total < 5) {
    verdict = "INSUFFICIENT";
    reason = `apenas ${total} decisões na janela — pouco pra concluir`;
  } else if (blockRate >= 0.6) {
    verdict = "BAD";
    reason = `bloqueou ${(blockRate * 100).toFixed(0)}% — provável falso-positivo, atrapalhando o fluxo`;
  } else if (blocked === 0) {
    verdict = "INSUFFICIENT";
    reason = "não bloqueou nada — não dá pra dizer que está agregando (nem atrapalhando)";
  } else {
    verdict = "GOOD";
    reason = `bloqueou ${blocked} de ${total} (${(blockRate * 100).toFixed(0)}%) — pega risco sem travar o resto`;
  }

  console.log(JSON.stringify({
    windowDays: WINDOW_DAYS,
    total, approved, blocked,
    blockRate: Number(blockRate.toFixed(3)),
    verdict, reason,
  }, null, 2));
}

main();
