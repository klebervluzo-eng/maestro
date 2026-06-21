// registry.mjs — carrega e VALIDA as definições de agentes do diretório agents/
// Sem dependência externa: lê arquivos .json nativos do Node.
// Validação forte: falha cedo e claro (tipos, id único, delegação resolvível).

import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const AGENTS_DIR = join(__dirname, "..", "agents");

/**
 * Carrega todos os agentes registrados, validados e prontos para o orquestrador.
 * @returns {Promise<Array>} lista de definições de agente
 */
export async function loadAgents() {
  const files = (await readdir(AGENTS_DIR)).filter((f) => f.endsWith(".json"));
  const agents = [];
  for (const file of files) {
    const raw = await readFile(join(AGENTS_DIR, file), "utf8");
    let def;
    try {
      def = JSON.parse(raw);
    } catch (err) {
      throw new Error(`Agente inválido (${file}): JSON malformado — ${err.message}`);
    }
    validateShape(def, file);
    agents.push(def);
  }
  if (agents.length === 0) {
    throw new Error("Nenhum agente registrado em agents/. O maestro precisa de pelo menos um.");
  }
  validateGraph(agents);
  return agents;
}

const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;

/** Valida o contrato e os TIPOS de um agente isolado. */
function validateShape(def, file) {
  for (const field of ["id", "name", "role"]) {
    if (!isNonEmptyString(def[field])) {
      throw new Error(`Agente inválido (${file}): "${field}" deve ser uma string não-vazia.`);
    }
  }
  if (!Array.isArray(def.keywords) || def.keywords.length === 0 || !def.keywords.every(isNonEmptyString)) {
    throw new Error(`Agente inválido (${file}): "keywords" deve ser uma lista não-vazia de strings.`);
  }
  if ("phase" in def && (!Number.isInteger(def.phase) || def.phase < 0)) {
    throw new Error(`Agente inválido (${file}): "phase" deve ser um inteiro >= 0.`);
  }
  if (!("phase" in def)) def.phase = 99; // sem fase declarada = roda por último
  if (!Array.isArray(def.delegatesTo)) def.delegatesTo = [];
  if (!def.delegatesTo.every(isNonEmptyString)) {
    throw new Error(`Agente inválido (${file}): "delegatesTo" deve conter apenas ids (strings).`);
  }
  if ("produces" in def && typeof def.produces !== "string") {
    throw new Error(`Agente inválido (${file}): "produces" deve ser string (ou ser omitido).`);
  }
}

/** Valida o GRAFO: ids únicos e delegação que aponta para agente existente. */
function validateGraph(agents) {
  const ids = new Set();
  for (const a of agents) {
    if (ids.has(a.id)) {
      throw new Error(`Registro inválido: id de agente duplicado "${a.id}".`);
    }
    ids.add(a.id);
  }
  for (const a of agents) {
    for (const dep of a.delegatesTo) {
      if (!ids.has(dep)) {
        throw new Error(`Registro inválido: agente "${a.id}" delega para "${dep}", que não existe.`);
      }
    }
  }
}
