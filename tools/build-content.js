// Gera os gabaritos:
//  - Python: roda a solução no python3 e grava a saída esperada em content/expected.json
//  - JavaScript: roda a solução no executor do app (jsrunner.js) e grava a saída no mesmo arquivo
//  - SQL: roda a solução no sql.js e grava as linhas esperadas em content/expected-sql.json
//    (usado só como reserva quando o servidor não consegue rodar o sql.js; o normal é o servidor rodar o SQL do aluno)
const { spawnSync } = require('child_process'), fs = require('fs'), path = require('path');
const out = {}, sqlOut = {}, exPy = {};
const CPS = [...require('../content/checkpoints'), ...require('../content/cp-js')];   // checkpoints e provas finais (têm lv e track)
const PJS = require('../content/projects');        // projetos (um depois de cada 5 lições; têm lv e track)
const jsrunner = require('../jsrunner');
const exists = f => fs.existsSync(path.join(__dirname, '..', 'content', f + '.js'));
// Python e JavaScript: roda cada solução (e o exemplo de cada lição) e grava o que ela imprime
for (const f of ['py1', 'py2', 'py3', 'js1', 'js2', 'js3']) {
  if (!exists(f)) continue;
  const js = f.startsWith('js'), track = js ? 'js' : 'python', lv = +f.slice(2);
  const runIt = (pre, code) => {
    if (js) { const r = jsrunner.runSync(pre, code); return r.ok ? { ok: true, out: r.out } : { ok: false, err: r.err }; }
    const r = spawnSync('python3', ['-I', '-c', pre + '\n' + code], { encoding: 'utf8', timeout: 30000 });
    return r.status === 0 ? { ok: true, out: r.stdout } : { ok: false, err: r.stderr };
  };
  const m = require('../content/' + f);
  for (const x of [...m.lessons, ...CPS.filter(c => c.track === track && c.lv === lv), ...PJS.filter(c => c.track === track && c.lv === lv)]) {
    const r = runIt(x.prelude || '', x.solution);
    if (!r.ok) { console.error(`✗ ${x.id} (${x.title})\n${r.err}`); process.exitCode = 1; continue; }
    out[x.id] = r.out.trim();
  }
  // Saída do EXEMPLO de cada lição (a teoria mostra o código e, logo abaixo, o que ele imprime; o aluno pode mudar e rodar de novo)
  for (const x of m.lessons) {
    if (!x.example) continue;
    const r = runIt(x.prelude || '', x.example);
    if (!r.ok || !r.out.trim()) { console.error(`✗ exemplo de ${x.id}: ${!r.ok ? r.err : 'não imprime nada (use ' + (js ? 'console.log' : 'print') + ')'}`); process.exitCode = 1; continue; }
    exPy[x.id] = r.out.replace(/\s+$/, "");   // só tira o fim: o começo importa (o DataFrame começa com espaços para alinhar as colunas)
  }
}
fs.writeFileSync(path.join(__dirname, '..', 'content', 'example-py.json'), JSON.stringify(exPy));
console.log('saídas dos exemplos (Python e JavaScript) geradas:', Object.keys(exPy).length);
fs.writeFileSync(path.join(__dirname, '..', 'content', 'expected.json'), JSON.stringify(out, null, 1));
console.log('gabaritos Python e JavaScript gerados:', Object.keys(out).length);

(async () => {
  let initSqlJs; try { initSqlJs = require('../vendor/sql/sql-wasm.js'); } catch { initSqlJs = require('sql.js'); }
  const SQL = await initSqlJs();
  const defSeeds = {};
  for (const f of ['sql1', 'sql2', 'sql3']) {
    const m = require('../content/' + f);
    for (const x of [...m.lessons, ...CPS.filter(c => c.track === 'sql' && c.lv === +f.slice(3)), ...PJS.filter(c => c.track === 'sql' && c.lv === +f.slice(3))]) {
      try {
        const db = new SQL.Database(); db.run(x.seed); const r = db.exec(x.expectedSql || x.solution); const last = r[r.length - 1];
        sqlOut[x.id] = { ordered: /order by/i.test(x.solution), rows: (last ? last.values : []).map(v => JSON.stringify(v)) }; db.close();
      } catch (e) { console.error(`✗ ${x.id}: ${e.message}`); process.exitCode = 1; }
    }
  }
  fs.writeFileSync(path.join(__dirname, '..', 'content', 'expected-sql.json'), JSON.stringify(sqlOut));
  console.log('gabaritos SQL gerados:', Object.keys(sqlOut).length);

  // Tabela de resultado do EXEMPLO de cada lição de SQL (a teoria mostra o código e, logo abaixo, o que ele devolve).
  // O exemplo roda de verdade no banco da lição; se não devolve linhas (INSERT, UPDATE, CREATE...), roda a consulta de content/example-after.js depois dele.
  const AFTER = require('../content/example-after'), exOut = {}, MAXR = 8;
  for (const f of ['sql1', 'sql2', 'sql3']) for (const x of require('../content/' + f).lessons) {
    if (!x.example) continue;
    try {
      const db = new SQL.Database(); db.run(x.seed); const r = db.exec(x.example); let last = r[r.length - 1], label = '';
      if (!last && AFTER[x.id]) { last = db.exec(AFTER[x.id][0]).pop(); label = AFTER[x.id][1]; }
      if (!last) throw new Error('o exemplo não devolve linhas (use content/example-after.js)');
      exOut[x.id] = { cols: last.columns, rows: last.values.slice(0, MAXR), total: last.values.length, ...(label ? { label } : {}) }; db.close();
    } catch (e) { console.error(`✗ exemplo de ${x.id}: ${e.message}`); process.exitCode = 1; }
  }
  fs.writeFileSync(path.join(__dirname, '..', 'content', 'example-sql.json'), JSON.stringify(exOut));
  console.log('resultados dos exemplos SQL gerados:', Object.keys(exOut).length);
})();
