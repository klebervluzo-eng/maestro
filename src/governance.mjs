// governance.mjs — o Maestro como CONSELHO sempre-ativo.
// Recebe uma DECISÃO proposta por outro sistema (ex: SINAPSE) e devolve um veredito
// (aprovado/bloqueado) lendo a POLÍTICA — nunca o relato de quem propôs.
// É o "diretor" que opina em toda decisão, não só quando é chamado.

export const SCHEMA_VERSION = "1.0";

// Marcadores de ação de RISCO REAL — específicos, pra não acusar ação rotineira
// (um `git push` de feature ou um Write comum não são risco; force-push, rm -rf,
// drop de banco, mexer em produção e credencial/dinheiro são).
const RISKY = [
  // destrutivo irreversível
  "rm -rf", "rm -r ", "drop table", "drop database", "delete from", "truncate",
  "format ", "del /f", "remove-item -recurse",
  // produção / branch protegida
  "production", "produção", "producao", "prod ", "deploy prod",
  "push origin main", "push origin master", "to production",
  // força / sobrescrita
  "--force", "force push", "push -f", "reset --hard",
  // credencial / dinheiro
  "payment", "charge", "credential", "private key", "secret key", "api key",
];

const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;
const isPlainObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

/**
 * Aprovação só vale se for ESTRUTURADA: quem aprovou e quando.
 * Um booleano autodeclarado pelo próprio chamador não basta (o executivo não
 * pode assinar a própria aprovação).
 */
function isApproved(approval) {
  return isPlainObject(approval) && isNonEmptyString(approval.by) && isNonEmptyString(approval.at);
}

/**
 * Governa uma decisão proposta.
 * @param {object} decision - { action, produces?, risk?[], approval?{by,at}, verified?, context?, target?, environment? }
 * @returns {object} veredito versionado: { schemaVersion, verdict, gates, reasons }
 */
export function govern(decision) {
  if (!isPlainObject(decision)) {
    return reject("payload de decisão inválido (esperado objeto JSON)");
  }
  if ("risk" in decision && !Array.isArray(decision.risk)) {
    return reject('"risk" deve ser uma lista (array) quando presente');
  }

  const action = isNonEmptyString(decision.action) ? decision.action : "";
  // Risco é avaliado no texto COMBINADO — não dá pra esconder em "context"/"target".
  const haystack = [action, decision.context, decision.target, decision.environment]
    .filter(isNonEmptyString)
    .join(" ")
    .toLowerCase();

  const gates = [];

  // Gate 1 (crítico): a decisão descreve uma ação.
  gates.push(gate("tem-acao", true, action.trim().length > 0,
    action.trim().length > 0 ? "ação descrita" : "ação vazia — nada a avaliar"));

  // Gate 2 (crítico): ação de risco exige aprovação ESTRUTURADA (by + at).
  const flaggedRisk = Array.isArray(decision.risk) && decision.risk.length > 0;
  const looksRisky = RISKY.some((w) => haystack.includes(w));
  const isRisky = flaggedRisk || looksRisky;
  const approved = isApproved(decision.approval);
  gates.push(gate("risco-precisa-aprovacao", true, !isRisky || approved,
    isRisky
      ? (approved ? "ação de risco com aprovação estruturada (by+at)" : "ação de risco SEM aprovação estruturada — bloqueado")
      : "ação sem risco elevado"));

  // Gate 3 (crítico): quem produz artefato precisa de verificação.
  const produz = isNonEmptyString(decision.produces);
  gates.push(gate("artefato-precisa-verificacao", true, !produz || decision.verified === true,
    produz
      ? (decision.verified === true ? "artefato verificado" : "artefato NÃO verificado — bloqueado")
      : "não produz artefato; verificação não exigida"));

  const blocked = gates.some((g) => g.critical && !g.pass);
  return {
    schemaVersion: SCHEMA_VERSION,
    verdict: blocked ? "BLOCKED" : "APPROVED",
    gates,
    reasons: gates.filter((g) => !g.pass).map((g) => g.detail),
  };
}

function gate(id, critical, pass, detail) {
  return { id, critical, pass, detail };
}

/** Veredito BLOCKED versionado para payloads inválidos — sempre machine-readable. */
export function reject(detail) {
  return {
    schemaVersion: SCHEMA_VERSION,
    verdict: "BLOCKED",
    gates: [{ id: "payload-valido", critical: true, pass: false, detail }],
    reasons: [detail],
  };
}
