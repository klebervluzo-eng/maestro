// metrics.mjs — métrica honesta de qualidade: ERROS GRAVES POR 100 OPERAÇÕES.
// Lê os logs de observação e calcula a taxa por janela móvel, com tendência.
// O valor absoluto importa menos que a CURVA: ela sobe ou desce ao longo do tempo?
//
// Fontes (todas em MAESTRO_LOG_DIR, fail-open se faltarem):
//   decisions.jsonl  — operações observadas (denominador)
//   failures.jsonl   — ações que FALHARAM de verdade (numerador automático)
//   incidents.jsonl  — erros graves marcados à mão (numerador curado, opcional)

import { readFile } from "node:fs/promises";
import { join } from "node:path";

const LOG_DIR = process.env.MAESTRO_LOG_DIR;

async function readJsonl(name) {
  if (!LOG_DIR) return [];
  try {
    const raw = await readFile(join(LOG_DIR, name), "utf8");
    return raw.split("\n").filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  } catch { return []; }
}

function inWindow(recs, startMsAgo, endMsAgo = 0) {
  const now = Date.now();
  const lo = now - startMsAgo;
  const hi = now - endMsAgo;
  return recs.filter((r) => {
    const t = new Date(r.ts).getTime();
    return t >= lo && t <= hi;
  });
}

const per100 = (num, den) => (den > 0 ? Number(((num / den) * 100).toFixed(2)) : null);
const DAY = 24 * 60 * 60 * 1000;

async function main() {
  const ops = await readJsonl("decisions.jsonl");
  const fails = await readJsonl("failures.jsonl");
  const incidents = await readJsonl("incidents.jsonl");

  function windowStats(days, offsetDays = 0) {
    const start = (days + offsetDays) * DAY;
    const end = offsetDays * DAY;
    const o = inWindow(ops, start, end).length;
    const f = inWindow(fails, start, end).length;
    const i = inWindow(incidents, start, end).length;
    return {
      operacoes: o,
      falhas: f,
      incidentesGraves: i,
      errosPor100ops: per100(f, o),
      incidentesGravesPor100ops: per100(i, o),
    };
  }

  const last7 = windowStats(7);
  const prev7 = windowStats(7, 7); // dias 8–14, pra tendência
  const last14 = windowStats(14);

  // Tendência da curva de erro (o que mais importa)
  let tendencia = "sem base de comparação ainda";
  if (last7.errosPor100ops !== null && prev7.errosPor100ops !== null) {
    const d = last7.errosPor100ops - prev7.errosPor100ops;
    tendencia = d < 0 ? `MELHORANDO (caiu ${Math.abs(d).toFixed(2)})` : d > 0 ? `PIORANDO (subiu ${d.toFixed(2)})` : "estável";
  }

  const report = {
    geradoEm: new Date().toISOString(),
    metrica: "erros graves por 100 operações",
    janela7d: last7,
    janela7dAnterior: prev7,
    janela14d: last14,
    tendencia,
    nota: ops.length < 20 ? "POUCOS DADOS — a métrica ganha confiança com o uso (alvo: >=100 operações)" : "ok",
  };
  console.log(JSON.stringify(report, null, 2));
}

main();
