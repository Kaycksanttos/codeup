// Gera os gabaritos:
//  - Python: roda a solução no python3 e grava a saída esperada em content/expected.json
//  - SQL: roda a solução no sql.js e grava as linhas esperadas em content/expected-sql.json
//    (usado só como reserva quando o servidor não consegue rodar o sql.js; o normal é o servidor rodar o SQL do aluno)
const { spawnSync } = require('child_process'), fs = require('fs'), path = require('path');
const out = {}, sqlOut = {};
const CPS = require('../content/checkpoints');   // checkpoints e provas finais (têm lv e track)
for (const f of ['py1', 'py2', 'py3']) {
  const m = require('../content/' + f);
  for (const x of [...m.lessons, ...CPS.filter(c => c.track === 'python' && c.lv === +f.slice(2))]) {
    const r = spawnSync('python3', ['-I', '-c', (x.prelude || '') + '\n' + x.solution], { encoding: 'utf8', timeout: 30000 });
    if (r.status !== 0) { console.error(`✗ ${x.id} (${x.title})\n${r.stderr}`); process.exitCode = 1; continue; }
    out[x.id] = r.stdout.trim();
  }
}
fs.writeFileSync(path.join(__dirname, '..', 'content', 'expected.json'), JSON.stringify(out, null, 1));
console.log('gabaritos Python gerados:', Object.keys(out).length);

(async () => {
  let initSqlJs; try { initSqlJs = require('../vendor/sql/sql-wasm.js'); } catch { initSqlJs = require('sql.js'); }
  const SQL = await initSqlJs();
  const defSeeds = {};
  for (const f of ['sql1', 'sql2', 'sql3']) {
    const m = require('../content/' + f);
    for (const x of [...m.lessons, ...CPS.filter(c => c.track === 'sql' && c.lv === +f.slice(3))]) {
      try {
        const db = new SQL.Database(); db.run(x.seed); const r = db.exec(x.expectedSql || x.solution); const last = r[r.length - 1];
        sqlOut[x.id] = { ordered: /order by/i.test(x.solution), rows: (last ? last.values : []).map(v => JSON.stringify(v)) }; db.close();
      } catch (e) { console.error(`✗ ${x.id}: ${e.message}`); process.exitCode = 1; }
    }
  }
  fs.writeFileSync(path.join(__dirname, '..', 'content', 'expected-sql.json'), JSON.stringify(sqlOut));
  console.log('gabaritos SQL gerados:', Object.keys(sqlOut).length);
})();
