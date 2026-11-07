// Confere TODOS os cursos: estrutura (Python e SQL com 3 níveis, Excel com o nível Básico; 30 lições + 2 checkpoints e 1 prova final por nível), as 4 explicações de cada atividade e a solução de cada uma.
// SQL: roda a solução e o gabarito (sql.js). Python: roda a solução com o python3 do computador. Excel: calcula as fórmulas com o motor da planilha e confere com a correção.
const test = require('node:test'), assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const initSqlJs = require('sql.js');
const lessons = require('../lessons'), { checkpoints, finals, tests, projects, TRACKS, LEVELS_OF, CHANCES, BACK, KEYS } = lessons;
const xlcheck = require('../xlcheck'), checkExcel = require('../tools/check-xl'), checkPbi = require('../tools/check-pbi');
const daxcheck = require('../daxcheck'), quizcheck = require('../quizcheck'), htmlcheck = require('../htmlcheck'), checkHtml = require('../tools/check-html');
const PFX = { python: 'py', sql: 'sql', js: 'js', html: 'html', excel: 'xl', powerbi: 'pbi', dados: 'da' };
// campos obrigatórios de cada tipo de atividade (provas e lições)
const REQ = { html: ['id', 'type', 'track', 'level', 'lv', 'xp', 'title', 'task', 'solution', 'checks', 'req', 'starter', 'edit'], excel: ['id', 'type', 'track', 'level', 'lv', 'xp', 'title', 'task', 'solution', 'need', 'sheet', 'answer', 'targets'], dax: ['id', 'type', 'track', 'level', 'lv', 'xp', 'title', 'task', 'solution', 'need', 'starter', 'model', 'answer'], quiz: ['id', 'type', 'track', 'level', 'lv', 'xp', 'title', 'task', 'quiz'], other: ['id', 'type', 'track', 'level', 'lv', 'xp', 'title', 'task', 'solution', 'need', 'starter'] };
const reqOf = l => REQ[l.type] || REQ.other;

const norm = (r, ordered) => { const v = (r ? r.values : []).map(x => JSON.stringify(x)); return ordered ? v : v.sort(); };

test('estrutura dos cursos: Python e SQL (3 níveis), JavaScript, HTML e CSS, Excel, Power BI e DAX e Análise de Dados e Storytelling (nível Básico), 30 lições por nível', () => {
  assert.deepEqual(TRACKS, ['python', 'sql', 'js', 'html', 'excel', 'powerbi', 'dados']);
  assert.deepEqual(LEVELS_OF, { python: 3, sql: 3, js: 1, html: 1, excel: 1, powerbi: 1, dados: 1 });
  for (const t of TRACKS) for (let lv = 1; lv <= LEVELS_OF[t]; lv++) {
    const ls = lessons.filter(l => l.track === t && l.lv === lv);
    assert.equal(ls.length, 30, `${t} nível ${lv} deveria ter 30 lições`);
    assert.deepEqual(ls.map(l => l.n), Array.from({ length: 30 }, (_, i) => i + 1), 'numeração em ordem');
  }
  // as lições de cada nível precisam estar juntas e em ordem no arquivo (a ordem define a sequência)
  lessons.forEach((l, i) => { if (l.n > 1) assert.equal(lessons[i - 1].id.slice(0, -2), l.id.slice(0, -2), 'lições de um nível devem ser contíguas'); });
  assert.equal(lessons.exams, undefined, 'a antiga prova de 10 questões não existe mais');
  for (const t of TRACKS) assert.equal(lessons.filter(l => l.track === t).length, 30 * LEVELS_OF[t], t);
  assert.ok(lessons.filter(l => l.track === 'js').every(l => l.type === 'js' && l.expectedOut !== undefined), 'o curso de JavaScript é todo de código com saída esperada');
  assert.ok(lessons.filter(l => l.track === 'html').every(l => l.type === 'html' && ['html', 'doc', 'css'].includes(l.edit) && l.checks.length > 0), 'o curso de HTML e CSS é todo de código corrigido por verificações');
  assert.ok(lessons.filter(l => l.track === 'excel').every(l => l.type === 'excel' && l.lv === 1 && l.level === 'Básico'));
  assert.ok(lessons.filter(l => l.track === 'powerbi').every(l => (l.type === 'dax' || l.type === 'quiz') && l.lv === 1 && l.level === 'Básico'));
  assert.ok(lessons.filter(l => l.track === 'dados').every(l => l.type === 'quiz' && l.lv === 1 && l.level === 'Básico'), 'o curso de Análise de Dados é todo de quizzes');
});

test('provas: 2 checkpoints por nível (depois das lições 10 e 20) e 1 prova final (depois da 30), em Python, SQL, JavaScript, HTML e CSS, Excel, Power BI e Análise de Dados', () => {
  assert.equal(checkpoints.length, 22);
  assert.equal(finals.length, 11);
  assert.equal(tests.length, 33);
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

test('projetos: 6 por nível (depois das lições 5, 10, 15, 20, 25 e 30), em todos os cursos, com 5 temas cada e sem prova nem chance', () => {
  assert.equal(projects.length, 66, '18 de Python, 18 de SQL e 6 de JavaScript, de HTML e CSS, de Excel, de Power BI e de Análise de Dados');
  for (const t of TRACKS) for (let lv = 1; lv <= LEVELS_OF[t]; lv++) {
    const ps = projects.filter(p => p.track === t && p.lv === lv);
    assert.deepEqual(ps.map(p => p.after), [5, 10, 15, 20, 25, 30], `${t} nível ${lv}`);
    assert.deepEqual(ps.map(p => p.k), [1, 2, 3, 4, 5, 6]);
    assert.deepEqual(ps.map(p => p.id), [5, 10, 15, 20, 25, 30].map(n => `pj-${PFX[t]}-${lv}-${n}`));
    for (const p of ps) {
      for (const k of reqOf(p)) assert.ok(p[k] !== undefined, `${p.id} sem "${k}"`);
      assert.equal(p.proj, true); assert.ok(!p.cp && !p.fin && !p.test, 'projeto não é prova');
      assert.equal(p.n, p.after); assert.ok(p.xp >= 40, `${p.id}: XP`); assert.match(p.title, /^Projeto: .{4,}/);
      assert.equal(p.chances, undefined, 'projeto não tem chances'); assert.equal(p.back, undefined, 'projeto não faz voltar lição');
      assert.equal(p.cobre.length, 5, `${p.id}: lista os temas das 5 últimas lições`);
      assert.ok(String(p.task).length >= 120, `${p.id}: a tarefa precisa contar a história e listar o que fazer`);
      assert.ok(Array.isArray(p.hints) && p.hints.length === 3, `${p.id}: 3 dicas`);
      assert.ok(new Set(p.hints).size === 3);
      if (p.type === 'python' || p.type === 'sql' || p.type === 'js') assert.ok(p.starter && p.need.length >= 2, `${p.id}: starter e palavras obrigatórias`);
      if (p.type === 'python' || p.type === 'js') assert.ok(String(p.expectedOut).trim().length > 0, `${p.id}: rode "npm run build:content"`);
    }
    assert.equal(new Set(ps.map(p => p.title)).size, 6, 'títulos diferentes');
  }
  // os temas de cada projeto são os das 5 lições dele
  const p = projects.find(x => x.id === 'pj-py-1-10');
  assert.deepEqual(p.cobre, lessons.filter(l => l.track === 'python' && l.lv === 1 && l.n >= 6 && l.n <= 10).map(l => l.title));
  // XP: cada projeto vale mais que um checkpoint do mesmo curso? (não: é um passo do caminho, o checkpoint continua valendo mais)
  for (const pj of projects) { const cp = checkpoints.find(c => c.track === pj.track && c.lv === pj.lv); assert.ok(pj.xp <= cp.xp, `${pj.id} não deve valer mais que o checkpoint`); }
});

test('explicações: toda lição, toda prova e todo projeto tem "o que é", "para que serve", "como você vai usar aqui" e "o que vai aparecer na tela"', () => {
  assert.deepEqual(KEYS, ['oque', 'serve', 'como', 'retorno']);
  for (const l of [...lessons, ...tests, ...projects]) {
    assert.ok(l.info, `${l.id} sem explicações (content/info-*.js)`);
    for (const k of KEYS) {
      assert.equal(typeof l.info[k], 'string', `${l.id}: faltou "${k}"`);
      assert.ok(l.info[k].trim().length >= 25, `${l.id}: "${k}" muito curto`);
      assert.ok(!(l.track === 'js' ? /TODO|XXX|undefined/ : /TODO|XXX|\$\{/).test(l.info[k]), `${l.id}: "${k}" com texto pendente`);   // em JavaScript, ${ } é assunto das lições (template literal)
    }
  }
  const o = lessons.map(l => l.info.oque); assert.equal(new Set(o).size, o.length, 'há lições com o mesmo "o que é"');
});

test('ids únicos e campos obrigatórios', () => {
  const all = [...lessons, ...tests, ...projects], ids = all.map(l => l.id);
  assert.equal(new Set(ids).size, ids.length, 'há ids repetidos');
  for (const l of all) {
    for (const k of reqOf(l)) assert.ok(l[k] !== undefined, `atividade ${l.id} sem "${k}"`);
    assert.ok(l.type === 'sql' ? l.seed && l.expectedSql : l.type === 'excel' ? l.targets.length > 0 : l.type === 'dax' ? Object.keys(l.answer).length > 0 : l.type === 'quiz' ? l.quiz.length >= 3 : l.type === 'html' ? l.checks.length > 0 : l.expectedOut !== undefined, `atividade ${l.id} sem gabarito`);
    if (!l.cp && !l.fin && !l.proj) for (const k of ['explain', 'example', 'hints']) assert.ok(l[k], `lição ${l.id} sem "${k}"`);
    if (l.proj) assert.ok(Array.isArray(l.hints) && l.hints.length === 3 && l.hints.every(h => String(h).trim().length >= 25), `projeto ${l.id}: precisa de 3 dicas`);
  }
});

for (const l of [...lessons, ...tests, ...projects]) {
  test(`${l.fin ? 'prova final' : l.cp ? 'checkpoint' : l.proj ? 'projeto' : 'lição'} ${l.id} — ${l.title}`, async t => {
    if (l.type !== 'excel' && l.type !== 'quiz' && l.type !== 'html' && l.type !== 'dax') {
      assert.equal(lessons.needMissing(l, l.solution), undefined, `a solução não contém a palavra obrigatória "${lessons.needMissing(l, l.solution)}"`);
      for (const v of [String(l.solution).replace(/\s+/g, ' '), String(l.solution).replace(/([(),])/g, '\n  $1  \n'), String(l.solution).replace(/ /g, '   ')]) assert.equal(lessons.needMissing(l, v), undefined, 'o mesmo código escrito com outros espaços e quebras de linha também vale: ' + JSON.stringify(v.slice(0, 60)));
    }
    if (l.type === 'html') {
      const g = htmlcheck.grade(l, l.solution); assert.equal(g.ok, true, 'a solução oficial deve passar nas verificações: ' + JSON.stringify(g.hc.items.filter(i => !i.ok)));
      assert.equal(htmlcheck.grade(l, l.starter).ok, false, 'o ponto de partida não pode passar');
    } else if (l.type === 'excel') {
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
    } else if (l.type === 'js') {
      const r = require('../jsrunner').runSync(l.prelude || '', l.solution);
      assert.equal(r.ok, true, r.err);
      assert.equal(r.out.trim(), l.expectedOut, 'rode "npm run build:content" para atualizar os gabaritos JavaScript');
      assert.notEqual(l.expectedOut, '', 'a solução precisa mostrar alguma coisa com console.log');
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
  const py = [...lessons, ...tests, ...projects].filter(x => x.type === 'python');
  assert.equal(py.length, 117, '90 lições + 9 provas + 18 projetos');
  for (const x of py) { const r = await pysandbox.run(x.prelude || '', x.solution); assert.ok(r.ok && r.out.trim() === x.expectedOut, `${x.id} divergiu no sandbox: ${r.err}`); }
  const atk = ['print(open("/etc/passwd").read())', 'open("x","w").write("a")', 'import socket', 'import subprocess', 'import os\nos.system("id")', '__import__("ctypes")', 'import os\nos.listdir("/")', 'while True: pass'];
  for (const c of atk) { const r = await pysandbox.run('', c); assert.equal(r.ok, false, 'deveria falhar: ' + c); }
});

// ---- Excel: conteúdo e correção ----
test('Excel: todas as atividades passam na conferência de conteúdo (tools/check-xl.js)', () => {
  const r = checkExcel();
  assert.equal(r.n, 39, '30 lições + 2 checkpoints + 1 prova final + 6 projetos');
  assert.deepEqual(r.bad, []);
});

test('HTML e CSS: todas as atividades passam na conferência de conteúdo (tools/check-html.js): solução certa, ponto de partida errado, outras formas de escrever', () => {
  const r = checkHtml();
  assert.equal(r.n, 39, '30 lições + 2 checkpoints + 1 prova final + 6 projetos');
  assert.deepEqual(r.bad, []);
  assert.deepEqual(r.warn, [], 'nenhum aviso de conteúdo');
});

test('Power BI e DAX e Análise de Dados: todas as atividades passam na conferência de conteúdo (tools/check-pbi.js)', () => {
  const r = checkPbi();
  assert.equal(r.n, 78, '2 cursos × (30 lições + 2 checkpoints + 1 prova final + 6 projetos)');
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
  [...lessons, ...tests, ...projects].forEach(l => { if (l.type === 'sql' && l.seed) seeds.add(l.seed); });
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

// SQL: o EXEMPLO da teoria é uma consulta completa (nada de "SELECT ..." ou "WITH a AS (...)") que roda no banco da lição, e logo abaixo dele a teoria mostra a
// tabelinha do que ele devolve (exampleOut, gerado por `npm run build:content`). Exemplos que não devolvem linhas (INSERT, UPDATE, CREATE...) mostram o efeito via content/example-after.js.
test('SQL: exemplo completo e executável em cada lição, com a tabela do resultado (exampleOut) em dia', async () => {
  const SQL = await initSqlJs(), AFTER = require('../content/example-after');
  const sqls = lessons.filter(l => l.type === 'sql' && l.example);
  assert.equal(sqls.length, 90, '90 lições de SQL com exemplo');
  for (const l of sqls) {
    assert.ok(!/\.\.\.|…/.test(l.example), `${l.id}: o exemplo está abreviado ("..."), escreva a consulta completa: ${l.example}`);
    const db = new SQL.Database(); db.run(l.seed);
    let r = db.exec(l.example).pop(), label = '';
    if (!r) { assert.ok(AFTER[l.id], `${l.id}: o exemplo não devolve linhas; crie a consulta de depois em content/example-after.js`); r = db.exec(AFTER[l.id][0]).pop(); label = AFTER[l.id][1]; }
    assert.ok(r && r.values.length > 0, `${l.id}: a tabela do exemplo não pode ficar vazia`);
    const o = l.exampleOut; assert.ok(o, `${l.id} sem exampleOut: rode "npm run build:content"`);
    assert.deepEqual(o.cols, r.columns, `${l.id}: colunas do resultado do exemplo desatualizadas (rode "npm run build:content")`);
    assert.deepEqual(o.rows, r.values.slice(0, 8), `${l.id}: linhas do resultado do exemplo desatualizadas (rode "npm run build:content")`);
    assert.equal(o.total, r.values.length); assert.equal(o.label || '', label);
  }
  assert.ok(!tests.some(t => 'exampleOut' in t) && !projects.some(t => 'exampleOut' in t), 'as provas e os projetos não têm exemplo nem resultado dele');
});

// Dados que o aluno digita ou vê nas atividades (tabelas, textos, resultados, nomes de colunas e medidas) ficam SEM acento e sem símbolos especiais.
// As explicações continuam em português normal, e os nomes reais de funções do Excel (MÉDIA, ÍNDICE…) continuam com acento.
test('dados das lições, provas e projetos: sem acento (tabelas, textos, resultados, nomes de colunas e medidas)', () => {
  const seeds = require('../content/seeds.js'), DD = require('../public/daxdata.js');
  const NA = /[^\x00-\x7f]/, bad = [];
  const chk = (where, s) => { if (typeof s === 'string' && NA.test(s)) bad.push(where + ': ' + (s.match(/.{0,30}[^\x00-\x7f]+.{0,30}/) || [s])[0].replace(/\n/g, '\\n')); };
  const deep = (where, v) => { if (v == null) return; if (typeof v === 'string') chk(where, v); else if (typeof v === 'object') for (const [k, x] of Object.entries(v)) deep(where + '.' + k, x); };
  // fórmula do Excel: o nome da função pode ter acento (é o nome oficial), mas o texto entre aspas não
  const formula = (where, f) => { if (typeof f !== 'string') return; if (f[0] !== '=') return chk(where, f); chk(where, f.replace(/[A-ZÀ-Ý.]+(?=\()/g, '')); };
  const semComentario = (s, re) => String(s).split('\n').map(l => l.replace(re, '')).join('\n');
  for (const [k, v] of Object.entries(seeds)) if (!k.startsWith('T_')) chk('seeds.' + k, v);
  for (const l of [...lessons, ...tests, ...projects]) {
    if (l.track === 'dados') continue;   // Análise de Dados: exemplos de conceito, em português normal
    const id = l.id;
    chk(id + '.expectedOut', l.expectedOut); chk(id + '.prelude', l.prelude);
    if (l.exampleOut) deep(id + '.exampleOut', { cols: l.exampleOut.cols, rows: l.exampleOut.rows });
    deep(id + '.expectedRows', l.expectedRows);
    if (l.track === 'python' || l.track === 'sql' || l.track === 'js') {
      (l.need || []).forEach(n => chk(id + '.need', n));
      chk(id + '.solution', semComentario(l.solution, l.track === 'python' ? /\s*#.*$/ : l.track === 'js' ? /\s*\/\/.*$/ : /\s*--.*$/));
    }
    if (l.track === 'html') for (const f of ['solution', 'starter', 'example', 'page', 'css', 'exPage', 'exCss']) chk(id + '.' + f, l[f]);
    if (l.track === 'excel') {
      for (const r of (l.sheet && l.sheet.rows) || []) for (const c of r) formula(id + '.sheet', c);
      if (typeof l.answer === 'string') formula(id + '.answer', l.answer);
      else deep(id + '.answer', Object.fromEntries(Object.entries(l.answer || {}).filter(([, x]) => typeof x !== 'string' || x[0] !== '=')));
      for (const f of Object.values(l.targets || {})) formula(id + '.targets', typeof f === 'string' ? f : JSON.stringify(f));
    }
    if (l.track === 'powerbi') {
      for (const f of ['extra', 'answer', 'names', 'table', 'model', 'views', 'forbid', 'peek']) deep(id + '.' + f, l[f]);
      (l.need || []).forEach(n => chk(id + '.need', n));
      for (const f of ['solution', 'starter']) chk(id + '.' + f, semComentario(l[f], /\s*(\/\/|--).*$/));
    }
  }
  deep('daxdata', JSON.parse(JSON.stringify(DD, (k, v) => typeof v === 'function' ? undefined : v)));
  assert.deepEqual(bad, [], 'dados com acento ou símbolo especial:\n' + bad.slice(0, 30).join('\n'));
});

// ---------------------------------------------------------------------------------------------------------------------------
// Exemplo ao vivo da teoria (SQL e Python) e enunciados em passos
// ---------------------------------------------------------------------------------------------------------------------------
test('exemplo ao vivo (SQL): cada lição tem uma sugestão "Experimente" que roda, muda o resultado e continua igual depois de formatada', async () => {
  const SQL = await initSqlJs(), fmt = require('../public/fmt.js'), AFTER = require('../content/example-after');
  const ex = lessons.filter(l => l.type === 'sql' && l.example);
  assert.equal(ex.length, 90, 'as 90 lições de SQL têm exemplo');
  const last = (db, id, code) => { const r = db.exec(code), x = r[r.length - 1] || (AFTER[id] ? db.exec(AFTER[id][0]).pop() : undefined); return JSON.stringify(x ? [x.columns, x.values] : []); };
  const run = (l, code) => { const db = new SQL.Database(); try { db.run(l.seed); return last(db, l.id, code); } finally { db.close(); } };
  for (const l of ex) {
    const t = l.tente; assert.ok(t && t.q && t.code && t.why, `${l.id}: falta a sugestão Experimente (q, code e why)`);
    assert.ok(!/[áàâãéêíóôõúç]/i.test(t.code), `${l.id}: código da sugestão com acento`);
    const a = run(l, l.example), b = run(l, t.code);
    assert.notEqual(a, b, `${l.id}: a sugestão devolve o mesmo resultado do exemplo`);
    assert.notEqual(b, '[]', `${l.id}: a sugestão não devolve linhas`);
    // o editor mostra o SQL organizado em linhas (fmtSql): isso não pode mudar o que o código faz
    assert.equal(run(l, fmt.fmtSql(l.example)), a, `${l.id}: o exemplo formatado muda o resultado`);
    assert.equal(run(l, fmt.fmtSql(t.code)), b, `${l.id}: a sugestão formatada muda o resultado`);
    assert.ok(l.exampleOut && l.exampleOut.cols && l.exampleOut.rows.length > 0, `${l.id}: falta o resultado inicial do exemplo`);
  }
});

test('exemplo ao vivo (Python): exemplos completos que imprimem algo, com a saída pronta, e sugestões que rodam e mudam a saída', () => {
  const ex = lessons.filter(l => l.type === 'python' && l.example);
  assert.equal(ex.length, 90, 'as 90 lições de Python têm exemplo');
  const run = (l, code) => { const r = spawnSync('python3', ['-c', (l.prelude ? l.prelude + '\n' : '') + code], { encoding: 'utf8', timeout: 60000 }); assert.equal(r.status, 0, `${l.id}: ${r.stderr.trim().split('\n').pop()}`); return r.stdout; };
  for (const l of ex) {
    const t = l.tente; assert.ok(t && t.q && t.code && t.why, `${l.id}: falta a sugestão Experimente (q, code e why)`);
    assert.ok(!/[áàâãéêíóôõúç]/i.test(t.code), `${l.id}: código da sugestão com acento`);
    const a = run(l, l.example), b = run(l, t.code);
    assert.ok(a.trim(), `${l.id}: o exemplo não imprime nada`);
    assert.ok(b.trim() && b !== a, `${l.id}: a sugestão precisa imprimir uma saída diferente do exemplo`);
    assert.ok(l.exampleOut && l.exampleOut.out === a.replace(/\n$/, ''), `${l.id}: a saída pronta do exemplo está desatualizada (rode npm run build:content)`);
    // só as lições de pandas usam dados escondidos (df); os outros exemplos precisam funcionar sozinhos
    if (!/\bdf\s*=/.test(l.prelude || '')) { const r = spawnSync('python3', ['-c', l.example], { encoding: 'utf8', timeout: 30000 }); assert.equal(r.status, 0, `${l.id}: o exemplo depende de dados escondidos`); }
  }
});

const jsrunner = require('../jsrunner');
test('exemplo ao vivo (JavaScript): exemplos completos que imprimem algo, sozinhos, com a saída pronta em dia', () => {
  const ex = lessons.filter(l => l.type === 'js' && l.example);
  assert.equal(ex.length, 30 * LEVELS_OF.js, 'todas as lições de JavaScript têm exemplo');
  for (const l of ex) {
    const r = jsrunner.runSync('', l.example);
    assert.ok(r.ok && r.out.trim(), `${l.id}: o exemplo precisa rodar sozinho e mostrar algo com console.log (${r.err})`);
    assert.ok(l.exampleOut && l.exampleOut.out === r.out.replace(/\s+$/, ''), `${l.id}: a saída pronta do exemplo está desatualizada (rode npm run build:content)`);
  }
});

test('enunciados: todo projeto e prova que não é quiz tem o enunciado em passos, e todo enunciado aponta para uma atividade que existe', () => {
  const ENUN = require('../content/enunciados'), todos = [...lessons, ...tests, ...projects], ids = new Set(todos.map(x => x.id));
  for (const id of Object.keys(ENUN)) assert.ok(ids.has(id), `enunciado de ${id} não aponta para nenhuma atividade`);
  const sem = [...tests, ...projects].filter(x => x.type !== 'quiz' && x.type !== 'dax' && !ENUN[x.id]).map(x => x.id);
  assert.deepEqual(sem.filter(id => /^(pj|cp|fin)-(sql|py|xl)/.test(id)), [], 'projetos e provas sem enunciado em passos');
  for (const x of todos) if (ENUN[x.id]) { assert.equal(x.task, ENUN[x.id], `${x.id}: o enunciado não foi aplicado`); assert.ok(x.task.length > 60, `${x.id}: enunciado curto demais`); }
});

test('como funciona: toda lição com exemplo (SQL, Python, Excel e DAX) traz as partes explicadas, e cada parte acende um trecho certo do código', () => {
  const { fmtSql } = require('../public/fmt'), COMO = require('../content/como');
  const com = lessons.filter(l => ['sql', 'python', 'excel', 'dax'].includes(l.type) && l.example);
  assert.equal(com.length, 225, 'esperava 225 lições com exemplo para explicar');
  for (const l of com) {
    assert.ok(Array.isArray(l.como) && l.como.length >= 1, `${l.id}: faltam as partes de "Como funciona"`);
    const code = l.type === 'sql' ? fmtSql(l.example) : String(l.example); let fim = 0;
    for (const c of l.como) {
      assert.ok(c.a >= fim && c.b > c.a && c.b <= code.length, `${l.id}: trecho fora de ordem ou fora do código (${c.a}-${c.b})`); fim = c.b;
      assert.ok(c.d && c.d.length <= 190 && !/`/.test(c.d), `${l.id}: explicação vazia, longa ou com crase`);
      assert.ok(code.slice(c.a, c.b).trim(), `${l.id}: trecho vazio`);
    }
    if (l.example.split(/\s+/).length > 4) assert.ok(l.como.length >= 2, `${l.id}: exemplo longo com uma parte só`);
  }
  const ids = new Set(lessons.map(l => l.id));
  for (const id of Object.keys(COMO)) assert.ok(ids.has(id), `explicação de ${id} não aponta para nenhuma lição`);
});

test('quando usar e como usar: toda lição com exemplo (SQL, Python, Excel e DAX) tem o "use quando", o molde para preencher e, se houver, o cuidado', () => {
  const { n, erros } = require('../tools/check-usar')();
  assert.equal(n, 225, 'esperava 225 lições com exemplo');
  assert.deepEqual(erros, []);
  for (const l of lessons.filter(x => ['sql', 'python', 'excel', 'dax'].includes(x.type) && x.example)) assert.ok(l.usar && l.usar.q && l.usar.m, `${l.id}: o servidor precisa mandar l.usar`);
  assert.equal(lessons.filter(x => x.type === 'quiz').every(x => !x.usar), true, 'lição de quiz não tem molde');
});

test('palavras obrigatórias: ignoram maiúsculas, quebras de linha e espaços ao redor dos sinais, mas continuam exigindo o que a lição pede', () => {
  const l = id => [...lessons, ...lessons.tests, ...lessons.projects].find(x => x.id === id);
  const sub = l('sql-2-14');                                                                    // exige "select" e "(select avg"
  assert.deepEqual(sub.need, ['select', '(select avg']);
  for (const ok of ['SELECT nome, preco FROM produtos WHERE preco > (SELECT AVG(preco) FROM produtos)', 'SELECT nome, preco\nFROM produtos\nWHERE preco > (\n  SELECT AVG(preco)\n  FROM produtos\n)', 'select nome,preco from produtos where preco>( select  avg ( preco ) from produtos )', 'SELECT nome, preco FROM produtos WHERE preco > (\n\tSELECT\n\tAVG(preco) FROM produtos)'])
    assert.equal(lessons.needMissing(sub, ok), undefined, ok);
  assert.equal(lessons.needMissing(sub, 'SELECT nome, preco FROM produtos WHERE preco > 1000'), '(select avg', 'sem a subconsulta continua faltando');
  assert.equal(lessons.needMissing(sub, 'SELECT nome FROM produtos WHERE preco > (SELECT MAX(preco) FROM produtos)'), '(select avg', 'outra função não vale');
  assert.equal(lessons.needMissing(sub, 'SELECT AVG(preco) FROM produtos'), '(select avg', 'AVG fora de uma subconsulta não vale');
  // espaço na ponta da palavra = palavra inteira
  const w = { need: ['for ', ' and ', 'if '] };
  assert.equal(lessons.needMissing(w, 'for x in y:\n  if(x>3 and x<9): pass'), undefined, 'for x / if(x...) / and entre condições');
  assert.equal(lessons.needMissing(w, 'format(1) android(2) gift(3)'), 'for ', 'palavra dentro de outra não vale');
  assert.equal(lessons.needMissing({ need: ['print('] }, 'print ( "oi" )'), undefined); assert.equal(lessons.needMissing({ need: ['print('] }, 'imprimir("oi")'), 'print(');
  assert.equal(lessons.needMissing({ need: ['x = ['] }, 'x=[1,2]'), undefined, 'espaços ao redor do = e do [ não importam'); assert.equal(lessons.needMissing({ need: [] }, ''), undefined);
});

test('atividades especiais (SQL Intermediário): toda lição tem um desafio novo e um conserte o erro; a solução passa, o ponto de partida não e o gabarito não vaza', async () => {
  const r = await require('../tools/check-sp')();
  assert.deepEqual(r.erros, [], 'npm run check:sp precisa passar');
  assert.equal(r.d, 30); assert.equal(r.f, 30);
  assert.ok(r.fErr >= 5 && r.fWrong >= 5, 'o conserte o erro mistura erros que quebram a consulta e erros que só deixam o resultado errado');
  const sql2 = lessons.filter(l => l.track === 'sql' && l.lv === 2);
  assert.ok(sql2.every(l => l.sp && l.sp.d && l.sp.f), 'as 30 lições do SQL Intermediário têm as duas atividades especiais');
  assert.ok(lessons.filter(l => !(l.track === 'sql' && l.lv === 2)).every(l => !l.sp), 'por enquanto só o SQL Intermediário tem atividades especiais');
  const SQL = await initSqlJs();
  for (const l of sql2) for (const a of ['d', 'f']) {
    const g = l.sp[a], tag = l.id + ':' + a;
    assert.equal(g.id, l.id); assert.equal(g.sp, undefined); assert.equal(g.a, a); assert.equal(g.type, 'sql');
    assert.deepEqual(g.hints, [g.hint ?? g.hints[0], g.solution], tag + ': a 2ª dica é a solução');
    const exp = g.expectedRows; assert.ok(exp && Array.isArray(exp.rows) && exp.rows.length > 0, tag + ': falta o gabarito em content/expected-sql.json (rode npm run build:content)');
    // o gabarito gravado é o que a solução devolve de verdade
    const db = new SQL.Database(); db.run(g.seed); const res = db.exec(g.solution), last = res[res.length - 1];
    assert.deepEqual(exp.rows, last.values.map(v => JSON.stringify(v)), tag + ': gabarito desatualizado'); assert.equal(exp.ordered, /order by/i.test(g.solution));
    assert.equal(lessons.needMissing(g, g.solution), undefined, tag + ': a solução cumpre as palavras obrigatórias');
    if (a === 'f') assert.notEqual(g.starter.trim(), g.solution.trim(), tag + ': o código com erro começa diferente da solução');
    else assert.match(g.starter, /^--/, tag + ': o desafio começa em branco (só o comentário)');
  }
});
