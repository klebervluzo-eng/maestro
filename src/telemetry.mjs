// telemetry.mjs — registro opcional de decisões (modo observação).
// Só ativa se MAESTRO_LOG_DIR estiver definido no ambiente. Nunca lança erro
// para o chamador: telemetria que quebra a operação é pior que telemetria nenhuma.

import { appendFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const LOG_DIR = process.env.MAESTRO_LOG_DIR || null;
const LOG_FILE = "decisions.jsonl";

/**
 * Registra uma decisão governada. Fail-open: qualquer erro é engolido.
 * @param {object} record - { ts, action, verdict, risky, reasons }
 */
export async function logDecision(record) {
  if (!LOG_DIR) return; // telemetria desligada
  try {
    await mkdir(LOG_DIR, { recursive: true });
    await appendFile(join(LOG_DIR, LOG_FILE), JSON.stringify(record) + "\n", "utf8");
  } catch {
    // nunca propaga — observar não pode atrapalhar operar
  }
}

export const TELEMETRY_ENABLED = Boolean(LOG_DIR);
