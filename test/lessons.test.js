// Confere TODOS os cursos: estrutura (Python e SQL com 3 níveis, Excel com o nível Básico; 30 lições + 2 checkpoints e 1 prova final por nível), as 4 explicações de cada atividade e a solução de cada uma.
// SQL: roda a solução e o gabarito (sql.js). Python: roda a solução com o python3 do computador. Excel: calcula as fórmulas com o motor da planilha e confere com a correção.
const test = require('node:test'), assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const initSqlJs = require('sql.js');
const lessons = require('../lessons'), { checkpoints, finals, tests, TRACKS, LEVELS_OF, CHANCES, BACK, KEYS } = lessons;
const xlcheck = require('../xlcheck'), checkExcel = require('../tools/check-xl'), checkPbi = require('../tools/check-pbi');
const daxcheck = require('../daxcheck'), quizcheck = require('../quizcheck');
const PFX = { python: 'py', sql: 'sql', excel: 'xl', powerbi: 'pbi', dados: 'da' };
// campos obrigatórios de cada tipo de atividade (provas e lições)
const REQ = { excel: ['id', 'type', 'track', 'level', 'lv', 'xp', 'title', 'task', 'solution', 'need', 'sheet', 'answer', 'targets'], dax: ['id', 'type', 'track', 'level', 'lv', 'xp', 'title', 'task', 'solution', 'need', 'starter', 'model', 'answer'], quiz: ['id', 'type', 'track', 'level', 'lv', 'xp', 'title', 'task', 'quiz'], other: ['id', 'type', 'track', 'level', 'lv', 'xp', 'title', 'task', 'solution', 'need', 'starter'] };
const reqOf = l => REQ[l.type] || REQ.other;

const norm = (r, ordered) => { const v = (r ? r.values : []).map(x => JSON.stringify(x)); return ordered ? v : v.sort(); };

test('estrutura dos cursos: Python e SQL (3 níveis), Excel, Power BI e DAX e Análise de Dados e Storytelling (nível Básico), 30 lições por nível', () => {
  assert.deepEqual(TRACKS, ['python', 'sql', 'excel', 'powerbi', 'dados']);
  assert.deepEqual(LEVELS_OF, { python: 3, sql: 3, excel: 1, powerbi: 1, dados: 1 });
  for (const t of TRACKS) for (let lv = 1; lv <= LEVELS_OF[t]; lv++) {
    const ls = lessons.filter(l => l.track === t && l.lv === lv);
    assert.equal(ls.length, 30, `${t} nível ${lv} deveria ter 30 lições`);
    assert.deepEqual(ls.map(l => l.n), Array.from({ length: 30 }, (_, i) => i + 1), 'numeração em ordem');
  }
  // as lições de cada nível precisam estar juntas e em ordem no arquivo (a ordem define a sequência)
  lessons.forEach((l, i) => { if (l.n > 1) assert.equal(lessons[i - 1].id.slice(0, -2), l.id.slice(0, -2), 'lições de um nível devem ser contíguas'); });
  assert.equal(lessons.exams, undefined, 'a antiga prova de 10 questões não existe mais');
  for (const t of TRACKS) assert.equal(lessons.filter(l => l.track === t).length, 30 * LEVELS_OF[t], t);
  assert.ok(lessons.filter(l => l.track === 'excel').every(l => l.type === 'excel' && l.lv === 1 && l.level === 'Básico'));
  assert.ok(lessons.filter(l => l.track === 'powerbi').every(l => (l.type === 'dax' || l.type === 'quiz') && l.lv === 1 && l.level === 'Básico'));
  assert.ok(lessons.filter(l => l.track === 'dados').every(l => l.type === 'quiz' && l.lv === 1 && l.level === 'Básico'), 'o curso de Análise de Dados é todo de quizzes');
});

test('provas: 2 checkpoints por nível (depois das lições 10 e 20) e 1 prova final (depois da 30), em Python, SQL, Excel, Power BI e Análise de Dados', () => {
  assert.equal(checkpoints.length, 18);
  assert.equal(finals.length, 9);
  assert.equal(tests.length, 27);
  assert.deepEqual(CHANCES, { cp: 2, fin: 3 });
  assert.deepEqual(BACK, { cp: 5, fin: 10 });
  for (const t of TRACKS) for (let lv = 1; lv <= LEVELS_OF[t]; lv++) {
    const cs = checkpoints.filter(c => c.track === t && c.lv === lv);
    assert.deepEqual(cs.map(c => c.after), [10, 20], `${t} nível ${lv}`);
    assert.deepEqual(cs.map(c => c.k), [1, 2]);
    assert.deepEqual(cs.map(c => c.id), [`cp-${PFX[t]}-${lv}-10`, `cp-${PFX[t]}-${lv}-20`]);
    for (const c of cs) {
      for (const k of reqOf(c)) assert.ok(c[k] !== undefined, `${c.id} sem "${k}"`);
      assert.equal(c.cp, true); assert.ok(!c.fin); assert.equal(c.chances, 2); assert.equal(c.back, 5); assert.equal(c.backFrom, c.after - 4, 'volta 5 lições (6 a 10 ou 16 a 20)');
      assert.equal(c.cobre.length, 10, 'lista os temas das últimas 10 lições');
    }
    const fs = finals.filter(f => f.track === t && f.lv === lv);
    assert.equal(fs.length, 1, `${t} nível ${lv} precisa de 1 prova final`);
    const f = fs[0];
    assert.equal(f.id, `fin-${PFX[t]}-${lv}`); assert.equal(f.after, 30); assert.equal(f.k, 3);
    assert.equal(f.fin, true); assert.ok(!f.cp); assert.equal(f.chances, 3); assert.equal(f.back, 10); assert.equal(f.backFrom, 21, 'volta 10 lições (21 a 30)');
    for (const k of reqOf(f)) assert.ok(f[k] !== undefined, `${f.id} sem "${k}"`);
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
    for (const k of reqOf(l)) assert.ok(l[k] !== undefined, `atividade ${l.id} sem "${k}"`);
    assert.ok(l.type === 'sql' ? l.seed && l.expectedSql : l.type === 'excel' ? l.targets.length > 0 : l.type === 'dax' ? Object.keys(l.answer).length > 0 : l.type === 'quiz' ? l.quiz.length >= 3 : l.expectedOut !== undefined, `atividade ${l.id} sem gabarito`);
    if (!l.cp && !l.fin) for (const k of ['explain', 'example', 'hints']) assert.ok(l[k], `lição ${l.id} sem "${k}"`);
  }
});

for (const l of [...lessons, ...tests]) {
  test(`${l.fin ? 'prova final' : l.cp ? 'checkpoint' : 'lição'} ${l.id} — ${l.title}`, async t => {
    const flat = String(l.solution || '').toLowerCase().replace(/\s+/g, ' ');
    if (l.type !== 'excel' && l.type !== 'quiz') for (const w of l.need) assert.ok(flat.includes(String(w).toLowerCase()), `a solução não contém a palavra obrigatória "${w}"`);
    if (l.type === 'excel') {
      assert.equal(xlcheck.needMissing(l, l.answer), null, 'a resposta oficial precisa usar as funções exigidas');
      const g = xlcheck.grade(l, JSON.stringify(l.answer)); assert.equal(g.ok, true, 'a resposta oficial deve passar na correção: ' + JSON.stringify(g));
    } else if (l.type === 'dax') {
      const g = daxcheck.grade(l, l.solution); assert.equal(g.ok, true, 'a resposta oficial deve passar na correção: ' + JSON.stringify(g.dx || g).slice(0, 300));
    } else if (l.type === 'quiz') {
      const g = quizcheck.grade(l, quizcheck.solution(l)); assert.equal(g.ok, true, 'as respostas certas devem passar na correção do quiz');
      assert.equal(quizcheck.grade(l, []).ok, false, 'um quiz em branco não pode passar');
    } else if (l.type === 'sql') {
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

// ---- Excel: conteúdo e correção ----
test('Excel: todas as atividades passam na conferência de conteúdo (tools/check-xl.js)', () => {
  const r = checkExcel();
  assert.equal(r.n, 33, '30 lições + 2 checkpoints + 1 prova final');
  assert.deepEqual(r.bad, []);
});

test('Power BI e DAX e Análise de Dados: todas as atividades passam na conferência de conteúdo (tools/check-pbi.js)', () => {
  const r = checkPbi();
  assert.equal(r.n, 66, '2 cursos × (30 lições + 2 checkpoints + 1 prova final)');
  assert.deepEqual(r.bad, []);
  assert.deepEqual(r.warn, [], 'nenhum aviso de conteúdo');
});

// O cartão "Tabela desta atividade" (public/app.js) lê o nome e as colunas dos CREATE TABLE do banco de treino: tem de bater com o que o sql.js realmente cria
test('SQL: o cartão da tabela mostra o nome e as colunas certos em todos os bancos de treino (lições, provas, ler e explicar)', async () => {
  const fs = require('node:fs'), path = require('node:path');
  const src = fs.readFileSync(path.join(__dirname, '..', 'public', 'app.js'), 'utf8');
  const a = src.indexOf('function seedSchema'), b = src.indexOf('const listPt');
  assert.ok(a > 0 && b > a, 'seedSchema precisa existir no app.js');
  const seedSchema = new Function(src.slice(a, b) + '; return seedSchema;')();
  const SQL = await initSqlJs(), seeds = new Set();
  [...lessons, ...tests].forEach(l => { if (l.type === 'sql' && l.seed) seeds.add(l.seed); });
  Object.values(lessons.RD).concat(Object.values(lessons.EX)).forEach(r => { if (r.seed) seeds.add(r.seed); });
  assert.ok(seeds.size >= 3, 'há vários bancos de treino de SQL');
  for (const s of seeds) {
    const db = new SQL.Database(); db.run(s);
    const names = (db.exec("SELECT name FROM sqlite_master WHERE type='table'")[0] || { values: [] }).values.flat();
    const real = Object.fromEntries(names.map(t => [t, db.exec(`PRAGMA table_info(${t})`)[0].values.map(r => r[1])]));
    db.close();
    assert.deepEqual(Object.fromEntries(seedSchema(s).map(t => [t.name, t.cols])), real);
  }
});
