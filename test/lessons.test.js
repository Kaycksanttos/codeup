// Confere TODO o curso: estrutura (2 trilhas x 3 níveis x 30 lições + banco de prova) e a solução de cada atividade.
// SQL: roda a solução e o gabarito (sql.js). Python: roda a solução com o python3 do computador.
const test = require('node:test'), assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const initSqlJs = require('sql.js');
const lessons = require('../lessons'), { exams, checkpoints, TRACKS, EXAM_SIZE } = lessons;

const norm = (r, ordered) => { const v = (r ? r.values : []).map(x => JSON.stringify(x)); return ordered ? v : v.sort(); };

test('estrutura do curso: 2 trilhas x 3 níveis x 30 lições e banco de questões por prova', () => {
  assert.deepEqual(TRACKS, ['python', 'sql']);
  for (const t of TRACKS) for (const lv of [1, 2, 3]) {
    const ls = lessons.filter(l => l.track === t && l.lv === lv);
    assert.equal(ls.length, 30, `${t} nível ${lv} deveria ter 30 lições`);
    assert.deepEqual(ls.map(l => l.n), Array.from({ length: 30 }, (_, i) => i + 1), 'numeração em ordem');
    assert.ok(exams.filter(q => q.track === t && q.lv === lv).length >= EXAM_SIZE, `${t} nível ${lv}: poucas questões de prova`);
  }
  // as lições de cada nível precisam estar juntas e em ordem no arquivo (a ordem define a sequência)
  lessons.forEach((l, i) => { if (l.n > 1) assert.equal(lessons[i - 1].id.slice(0, -2), l.id.slice(0, -2), 'lições de um nível devem ser contíguas'); });
});

test('checkpoints: 5 por nível (depois das lições 5, 10, 15, 20 e 25), em SQL e Python', () => {
  assert.equal(checkpoints.length, 30);
  for (const t of TRACKS) for (const lv of [1, 2, 3]) {
    const cs = checkpoints.filter(c => c.track === t && c.lv === lv);
    assert.deepEqual(cs.map(c => c.after), [5, 10, 15, 20, 25], `${t} nível ${lv}`);
    assert.deepEqual(cs.map(c => c.k), [1, 2, 3, 4, 5]);
    for (const c of cs) for (const k of ['id', 'title', 'task', 'solution', 'need', 'starter', 'xp', 'hints']) assert.ok(c[k] !== undefined, `${c.id} sem "${k}"`);
  }
});

test('ids únicos e campos obrigatórios', () => {
  const all = [...lessons, ...exams, ...checkpoints], ids = all.map(l => l.id);
  assert.equal(new Set(ids).size, ids.length, 'há ids repetidos');
  for (const l of all) {
    for (const k of ['id', 'type', 'track', 'level', 'lv', 'xp', 'title', 'task', 'solution', 'need', 'starter'])
      assert.ok(l[k] !== undefined, `atividade ${l.id} sem "${k}"`);
    assert.ok(l.type === 'sql' ? l.seed && l.expectedSql : l.expectedOut !== undefined, `atividade ${l.id} sem gabarito`);
    if (!l.exam && !l.cp) for (const k of ['explain', 'example', 'hints']) assert.ok(l[k], `lição ${l.id} sem "${k}"`);
  }
});

for (const l of [...lessons, ...exams, ...checkpoints]) {
  test(`${l.exam ? 'prova' : l.cp ? 'checkpoint' : 'lição'} ${l.id} — ${l.title}`, async t => {
    const flat = l.solution.toLowerCase().replace(/\s+/g, ' ');
    for (const w of l.need) assert.ok(flat.includes(w), `a solução não contém a palavra obrigatória "${w}"`);
    if (l.type === 'sql') {
      const SQL = await initSqlJs();
      const a = new SQL.Database(); a.run(l.seed); const ra = a.exec(l.solution);
      const b = new SQL.Database(); b.run(l.seed); const rb = b.exec(l.expectedSql);
      const ordered = /order by/i.test(l.expectedSql);
      assert.deepEqual(norm(ra[ra.length - 1], ordered), norm(rb[rb.length - 1], ordered));
      assert.ok(rb.length > 0 && rb[rb.length - 1].values.length > 0, 'o gabarito não devolve linhas');
      // reserva do servidor (content/expected-sql.json) precisa estar igual ao que a solução devolve
      assert.ok(l.expectedRows, `${l.id} sem linhas esperadas: rode "npm run build:content"`);
      assert.deepEqual(l.expectedRows.rows, rb[rb.length - 1].values.map(v => JSON.stringify(v)), 'rode "npm run build:content" para atualizar os gabaritos SQL');
      assert.equal(l.expectedRows.ordered, ordered);
    } else {
      const r = spawnSync('python3', ['-I', '-c', (l.prelude || '') + '\n' + l.solution], { encoding: 'utf8', timeout: 30000 });
      if (r.status !== 0 && /ModuleNotFoundError/.test(r.stderr)) return t.skip('biblioteca (pandas) não instalada neste computador');
      assert.equal(r.status, 0, r.stderr);
      assert.equal(r.stdout.trim(), l.expectedOut, 'rode "npm run build:content" para atualizar os gabaritos Python');
    }
  });
}


// ---- Correção de Python no servidor (ambiente restrito) ----
const pysandbox = require('../pysandbox');
test('sandbox Python: todas as soluções passam e os ataques são barrados', { skip: !pysandbox.available() && 'sem python3' }, async () => {
  const py = [...lessons, ...exams].filter(x => x.type === 'python');
  assert.ok(py.length >= 126);
  for (const x of py) { const r = await pysandbox.run(x.prelude || '', x.solution); assert.ok(r.ok && r.out.trim() === x.expectedOut, `${x.id} divergiu no sandbox: ${r.err}`); }
  const atk = ['print(open("/etc/passwd").read())', 'open("x","w").write("a")', 'import socket', 'import subprocess', 'import os\nos.system("id")', '__import__("ctypes")', 'import os\nos.listdir("/")', 'while True: pass'];
  for (const c of atk) { const r = await pysandbox.run('', c); assert.equal(r.ok, false, 'deveria falhar: ' + c); }
});
