// Roda dentro de um worker_thread isolado (com limite de tempo e memória definidos no server.js):
// 1) carrega o sql.js e avisa "pronto"  2) recebe o SQL do aluno e o do gabarito, roda os dois no mesmo banco de treino e compara.
const { parentPort } = require('worker_threads');

const norm = (r, ordered) => {
  const v = (r ? r.values : []).map(x => JSON.stringify(x));
  return ordered ? v : v.sort();
};

(async () => {
  // 1º a cópia que vem junto do projeto (vendor/sql); se não existir, o pacote instalado com "npm install"
  let initSqlJs; try { initSqlJs = require('./vendor/sql/sql-wasm.js'); } catch { initSqlJs = require('sql.js'); }
  const SQL = await initSqlJs();
  parentPort.postMessage({ ready: true });
  parentPort.once('message', ({ seed, code, expected }) => {
    try {
      const a = new SQL.Database(); a.run(seed); const ra = a.exec(code);
      const b = new SQL.Database(); b.run(seed); const rb = b.exec(expected);
      const ordered = /order by/i.test(expected);
      parentPort.postMessage({ result: JSON.stringify(norm(ra[ra.length - 1], ordered)) === JSON.stringify(norm(rb[rb.length - 1], ordered)) });
    } catch { parentPort.postMessage({ result: false });   // erro no SQL do aluno = resposta errada (não é falha do servidor)
    }
  });
})().catch(e => parentPort.postMessage({ engineError: String(e && e.message || e) }));
