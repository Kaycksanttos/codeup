#!/usr/bin/env node
// Confere as sugestões "Experimente" (content/tente-sql.js e content/tente-py.js):
//  - SQL: o código sugerido roda sem erro no banco da lição e o resultado é diferente do exemplo original.
//  - Python: o código sugerido roda sem erro, imprime algo e a saída é diferente da do exemplo original.
// Uso: node tools/check-tente.js   (sai com código 1 se algo estiver errado)
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
const root = path.join(__dirname, '..');
let bad = 0;
const fail = (id, msg) => { console.error(`✗ ${id}: ${msg}`); bad++; };

async function sqlPart() {
  let initSqlJs; try { initSqlJs = require('../vendor/sql/sql-wasm.js'); } catch { initSqlJs = require('sql.js'); }
  const SQL = await initSqlJs();
  const T = require('../content/tente-sql');
  const AFTER = require('../content/example-after');
  let n = 0;
  for (const f of ['sql1', 'sql2', 'sql3']) for (const x of require('../content/' + f).lessons) {
    if (!x.example) continue;
    const t = T[x.id];
    if (!t) { fail(x.id, 'sem sugestão em tente-sql.js'); continue; }
    if (!t.q || !t.code || !t.why) { fail(x.id, 'faltam q/code/why'); continue; }
    if (/[áàâãéêíóôõúç]/i.test(t.code)) fail(x.id, 'o código sugerido tem acento');
    const run = code => {
      const db = new SQL.Database(); db.run(x.seed);
      let r = db.exec(code), last = r[r.length - 1];
      if (!last && AFTER[x.id]) last = db.exec(AFTER[x.id][0]).pop();
      db.close();
      return JSON.stringify(last ? [last.columns, last.values] : []);
    };
    try {
      const a = run(x.example), b = run(t.code);
      if (a === b) fail(x.id, 'a sugestão devolve o mesmo resultado do exemplo');
      else if (b === '[]') fail(x.id, 'a sugestão não devolve linhas');
      else n++;
    } catch (e) { fail(x.id, 'a sugestão dá erro: ' + e.message); }
  }
  console.log(`SQL: ${n} sugestões ok`);
}

function pyPart() {
  const file = path.join(root, 'content', 'tente-py.js');
  if (!fs.existsSync(file)) { console.log('Python: content/tente-py.js ainda não existe'); return; }
  const T = require(file);
  let n = 0;
  for (const f of ['py1', 'py2', 'py3']) for (const x of require('../content/' + f).lessons) {
    if (!x.example) continue;
    const t = T[x.id];
    if (!t) { fail(x.id, 'sem sugestão em tente-py.js'); continue; }
    if (!t.q || !t.code || !t.why) { fail(x.id, 'faltam q/code/why'); continue; }
    if (/[áàâãéêíóôõúç]/i.test(t.code)) fail(x.id, 'o código sugerido tem acento');
    const run = code => {
      const r = spawnSync('python3', ['-c', (x.prelude ? x.prelude + '\n' : '') + code], { encoding: 'utf8', timeout: 60000, cwd: root });
      if (r.status !== 0) throw new Error((r.stderr || '').trim().split('\n').pop());
      return r.stdout;
    };
    try {
      const a = run(x.example), b = run(t.code);
      if (!b.trim()) fail(x.id, 'a sugestão não imprime nada');
      else if (a === b) fail(x.id, 'a sugestão imprime o mesmo que o exemplo');
      else n++;
    } catch (e) { fail(x.id, 'a sugestão dá erro: ' + e.message); }
  }
  console.log(`Python: ${n} sugestões ok`);
}

(async () => {
  await sqlPart();
  pyPart();
  if (bad) { console.error(`\n${bad} problema(s)`); process.exit(1); }
  console.log('tudo certo');
})();
