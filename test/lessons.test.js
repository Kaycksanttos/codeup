// Confere TODO o curso: estrutura (2 trilhas x 3 níveis x 30 lições + 2 checkpoints e 1 prova final por nível), as 4 explicações de cada atividade e a solução de cada uma.
// SQL: roda a solução e o gabarito (sql.js). Python: roda a solução com o python3 do computador.
const test = require('node:test'), assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const initSqlJs = require('sql.js');
const lessons = require('../lessons'), { checkpoints, finals, tests, TRACKS, CHANCES, BACK, KEYS } = lessons;

const norm = (r, ordered) => { const v = (r ? r.values : []).map(x => JSON.stringify(x)); return ordered ? v : v.sort(); };

test('estrutura do curso: 2 trilhas x 3 níveis x 30 lições', () => {
  assert.deepEqual(TRACKS, ['python', 'sql']);
  for (const t of TRACKS) for (const lv of [1, 2, 3]) {
    const ls = lessons.filter(l => l.track === t && l.lv === lv);
    assert.equal(ls.length, 30, `${t} nível ${lv} deveria ter 30 lições`);
    assert.deepEqual(ls.map(l => l.n), Array.from({ length: 30 }, (_, i) => i + 1), 'numeração em ordem');
  }
  // as lições de cada nível precisam estar juntas e em ordem no arquivo (a ordem define a sequência)
  lessons.forEach((l, i) => { if (l.n > 1) assert.equal(lessons[i - 1].id.slice(0, -2), l.id.slice(0, -2), 'lições de um nível devem ser contíguas'); });
  assert.equal(lessons.exams, undefined, 'a antiga prova de 10 questões não existe mais');
});

test('provas: 2 checkpoints por nível (depois das lições 10 e 20) e 1 prova final (depois da 30), em SQL e Python', () => {
  assert.equal(checkpoints.length, 12);
  assert.equal(finals.length, 6);
  assert.equal(tests.length, 18);
  assert.deepEqual(CHANCES, { cp: 2, fin: 3 });
  assert.deepEqual(BACK, { cp: 5, fin: 10 });
  for (const t of TRACKS) for (const lv of [1, 2, 3]) {
    const cs = checkpoints.filter(c => c.track === t && c.lv === lv);
    assert.deepEqual(cs.map(c => c.after), [10, 20], `${t} nível ${lv}`);
    assert.deepEqual(cs.map(c => c.k), [1, 2]);
    assert.deepEqual(cs.map(c => c.id), [`cp-${t === 'python' ? 'py' : 'sql'}-${lv}-10`, `cp-${t === 'python' ? 'py' : 'sql'}-${lv}-20`]);
    for (const c of cs) {
      for (const k of ['id', 'title', 'task', 'solution', 'need', 'starter', 'xp']) assert.ok(c[k] !== undefined, `${c.id} sem "${k}"`);
      assert.equal(c.cp, true); assert.ok(!c.fin); assert.equal(c.chances, 2); assert.equal(c.back, 5); assert.equal(c.backFrom, c.after - 4, 'volta 5 lições (6 a 10 ou 16 a 20)');
      assert.equal(c.cobre.length, 10, 'lista os temas das últimas 10 lições');
    }
    const fs = finals.filter(f => f.track === t && f.lv === lv);
    assert.equal(fs.length, 1, `${t} nível ${lv} precisa de 1 prova final`);
    const f = fs[0];
    assert.equal(f.id, `fin-${t === 'python' ? 'py' : 'sql'}-${lv}`); assert.equal(f.after, 30); assert.equal(f.k, 3);
    assert.equal(f.fin, true); assert.ok(!f.cp); assert.equal(f.chances, 3); assert.equal(f.back, 10); assert.equal(f.backFrom, 21, 'volta 10 lições (21 a 30)');
    for (const k of ['title', 'task', 'solution', 'need', 'starter']) assert.ok(f[k] !== undefined, `${f.id} sem "${k}"`);
  }
});

test('explicações: toda lição e toda prova tem "o que é", "para que serve", "como você vai usar aqui" e "o que vai aparecer na tela"', () => {
  assert.deepEqual(KEYS, ['oque', 'serve', 'como', 'retorno']);
  for (const l of [...lessons, ...tests]) {
    assert.ok(l.info, `${l.id} sem explicações (content/info-*.js)`);
    for (const k of KEYS) {
      assert.equal(typeof l.info[k], 'string', `${l.id}: faltou "${k}"`);
      assert.ok(l.info[k].trim().length >= 25, `${l.id}: "${k}" muito curto`);
      assert.ok(!/TODO|XXX|\$\{/.test(l.info[k]), `${l.id}: "${k}" com texto pendente`);
    }
  }
  const o = lessons.map(l => l.info.oque); assert.equal(new Set(o).size, o.length, 'há lições com o mesmo "o que é"');
});

test('ids únicos e campos obrigatórios', () => {
  const all = [...lessons, ...tests], ids = all.map(l => l.id);
  assert.equal(new Set(ids).size, ids.length, 'há ids repetidos');
  for (const l of all) {
    for (const k of ['id', 'type', 'track', 'level', 'lv', 'xp', 'title', 'task', 'solution', 'need', 'starter'])
      assert.ok(l[k] !== undefined, `atividade ${l.id} sem "${k}"`);
    assert.ok(l.type === 'sql' ? l.seed && l.expectedSql : l.expectedOut !== undefined, `atividade ${l.id} sem gabarito`);
    if (!l.cp && !l.fin) for (const k of ['explain', 'example', 'hints']) assert.ok(l[k], `lição ${l.id} sem "${k}"`);
  }
});

for (const l of [...lessons, ...tests]) {
  test(`${l.fin ? 'prova final' : l.cp ? 'checkpoint' : 'lição'} ${l.id} — ${l.title}`, async t => {
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
  const py = [...lessons, ...tests].filter(x => x.type === 'python');
  assert.equal(py.length, 99);
  for (const x of py) { const r = await pysandbox.run(x.prelude || '', x.solution); assert.ok(r.ok && r.out.trim() === x.expectedOut, `${x.id} divergiu no sandbox: ${r.err}`); }
  const atk = ['print(open("/etc/passwd").read())', 'open("x","w").write("a")', 'import socket', 'import subprocess', 'import os\nos.system("id")', '__import__("ctypes")', 'import os\nos.listdir("/")', 'while True: pass'];
  for (const c of atk) { const r = await pysandbox.run('', c); assert.equal(r.ok, false, 'deveria falhar: ' + c); }
});
