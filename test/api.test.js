// Teste de ponta a ponta: sobe o servidor de verdade (porta e arquivo de dados temporários) e usa a API.
const test = require('node:test'), assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path = require('node:path'), fs = require('node:fs'), os = require('node:os');
const lessons = require('../lessons');

process.env.FIXED_ACT_ORDER = '1';      // ordem das atividades fixa (executar, ler, explicar) nos servidores de teste; os testes da ordem sorteada desligam isto
const PORT = 3300 + Math.floor(Math.random() * 500), U = `http://localhost:${PORT}`;
const DATA = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'codeup-')), 'data.json');
let srv, log = '';

const call = async (p, { method, body, token, headers } = {}) => {
  const r = await fetch(U + p, { method: method || (body ? 'POST' : 'GET'), headers: { 'Content-Type': 'application/json', ...(token ? { 'x-token': token } : {}), ...headers }, body: body ? JSON.stringify(body) : undefined });
  let j = null; try { j = await r.clone().json(); } catch { } return { status: r.status, j, r };
};
const confirm = async link => fetch(link.replace(U, U), { redirect: 'manual' });
const reg = async (email, name = 'Teste') => { const j = (await call('/api/register', { body: { name, email, password: 'segredo1', accept: true } })).j; if (j.devVerifyLink) await confirm(j.devVerifyLink); return j.token; };

test.before(async () => {
  srv = spawn('node', ['-r', path.join(__dirname, 'mock-google.js'), 'server.js'], { cwd: path.join(__dirname, '..'), env: { ...process.env, PORT, DATA_FILE: DATA, BASE_URL: U, ADMIN_KEY: 'chave-admin', COMPANY_NAME: 'Empresa Teste', CONTACT_EMAIL: 'ajuda@teste.com', DEV_SHOW_RESET_LINK: '1', RELAX_SUBMIT_LIMIT: '1', GOOGLE_CLIENT_ID: 'test-client-id', RANK_TTL_MS: '0' } });
  srv.stdout.on('data', d => log += d); srv.stderr.on('data', d => log += d);
  for (let i = 0; i < 450 && !/rodando/.test(log); i++) await new Promise(r => setTimeout(r, 100));
  assert.match(log, /rodando/, 'servidor não iniciou: ' + log);
});
test.after(() => srv && srv.kill());

test('conferência ao vivo não grava progresso', async () => {
  const tk = await reg('live@teste.com');
  let r = (await call('/api/check', { token: tk, body: { id: 'py-1-01', code: 'print("Olá, mundo!")', out: 'Olá, mundo!' } })).j; assert.equal(r.ok, true);
  r = (await call('/api/check', { token: tk, body: { id: 'py-1-01', code: 'print("x")', out: 'x' } })).j; assert.equal(r.ok, false); assert.equal(r.expected, 'Olá, mundo!');
  assert.equal((await call('/api/me', { token: tk })).j.xp, 0, 'check não pode dar XP');
  assert.equal((await call('/api/check', { token: tk, body: { id: 'py-1-03', code: 'print(42)', out: '42' } })).status, 409);
});

test('confirmação de e-mail: dá para estudar sem confirmar e o link só vale uma vez', async () => {
  const j = (await call('/api/register', { body: { name: 'Vera', email: 'vera@teste.com', password: 'segredo1', accept: true } })).j;
  assert.ok(j.devVerifyLink, 'em modo de teste devolve o link'); const tk = j.token;
  assert.equal((await call('/api/me', { token: tk })).j.verified, false);
  assert.equal((await call('/api/submit', { token: tk, body: { id: 'py-1-01', code: 'print("Olá, mundo!")', out: 'Olá, mundo!' } })).j.ok, true, 'pode estudar sem confirmar');
  const bad = await fetch(U + '/verificar?token=errado', { redirect: 'manual' }); assert.match(bad.headers.get('location'), /verificado=0/);
  const ok = await confirm(j.devVerifyLink); assert.match(ok.headers.get('location'), /verificado=1/);
  assert.equal((await call('/api/me', { token: tk })).j.verified, true);
  assert.equal((await confirm(j.devVerifyLink)).headers.get('location'), '/?verificado=0', 'link só funciona uma vez');
  assert.equal((await call('/api/resend-verification', { token: tk, body: {} })).j.already, true);
});

test('Python: o servidor roda o código e ignora a saída enviada pelo navegador', async () => {
  const tk = await reg('forja@teste.com');
  let r = (await call('/api/submit', { token: tk, body: { id: 'py-1-01', code: 'print("errado")', out: 'Olá, mundo!' } })).j;
  assert.equal(r.ok, false, 'saída forjada não pode passar'); assert.equal(r.expected, 'Olá, mundo!', 'resposta errada mostra a saída esperada (igual ao /api/check)');
  r = (await call('/api/submit', { token: tk, body: { id: 'py-1-01', code: 'print("Olá, mundo!")', out: 'qualquer coisa' } })).j;
  assert.equal(r.ok, true, 'o servidor usa a própria execução'); assert.equal(r.next, 'r', 'a 1ª atividade acertou: falta a de ler');
  assert.equal((await call('/api/submit', { token: tk, body: { id: 'py-1-02', code: 'print(1)', out: '1' } })).status, 409, 'a lição 2 só abre depois das 2 atividades da lição 1');
  assert.equal((await doRead(tk, lessons.find(l => l.id === 'py-1-01'))).j.ok, true);
  r = (await call('/api/submit', { token: tk, body: { id: 'py-1-02', code: 'import os\nprint(open("/etc/passwd").read())', out: '' } })).j; assert.equal(r.ok, false);
});

test('segurança: cabeçalhos, CSP, JSON inválido, senha fraca e protótipo', async () => {
  const r = await call('/health'); const h = r.r.headers;
  assert.match(h.get('content-security-policy'), /frame-ancestors 'none'/); assert.match(h.get('content-security-policy'), /object-src 'none'/);
  assert.equal(h.get('x-powered-by'), null); assert.equal(h.get('x-frame-options'), 'DENY'); assert.match(h.get('permissions-policy'), /camera=\(\)/);
  const bad = await fetch(U + '/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{quebrado' }); assert.equal(bad.status, 400);
  const b = { name: 'Fraca', email: 'fraca@teste.com', accept: true };
  assert.equal((await call('/api/register', { body: { ...b, password: '1234567' } })).status, 400, '7 caracteres');
  assert.equal((await call('/api/register', { body: { ...b, password: '12345678' } })).status, 400, 'senha comum');
  assert.equal((await call('/certificado/__proto__')).status, 404); assert.equal((await call('/api/certificate', { body: {} })).status, 404, 'o certificado não existe mais');
  const sql = await fetch(U + '/vendor/sql/sql-wasm.js'); assert.equal(sql.status, 200);
  assert.equal((await call('/api/me', { token: '__proto__' })).status, 401);
});

test('segurança: no banco só fica o hash da sessão e o sw não guarda dados privados', async () => {
  const tk = await reg('hash@teste.com'); await new Promise(r => setTimeout(r, 1600));
  const db = JSON.parse(fs.readFileSync(DATA, 'utf8'));
  assert.ok(!(tk in db.sessions), 'token puro não pode estar no banco');
  assert.ok(Object.keys(db.sessions).every(k => /^[0-9a-f]{64}$/.test(k)));
  assert.equal((await call('/api/me', { token: tk })).status, 200);
  const sw = fs.readFileSync(path.join(__dirname, '..', 'public', 'sw.js'), 'utf8'); assert.match(sw, /cacheable/);
});

test('segurança: em produção as flags de teste são ignoradas (links de senha e prévia de anúncios)', async () => {
  const port = PORT + 700, d = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'prod-')), 'data.json'); let lg = '';
  const p = spawn('node', ['server.js'], { cwd: path.join(__dirname, '..'), env: { ...process.env, NODE_ENV: 'production', PORT: port, DATA_FILE: d, BASE_URL: 'http://localhost:' + port, DEV_SHOW_RESET_LINK: '1', ADS_PREVIEW: '1', DATABASE_URL: '' } });
  p.stdout.on('data', x => lg += x); p.stderr.on('data', x => lg += x);
  try {
    for (let i = 0; i < 150 && !/rodando/.test(lg); i++) await new Promise(r => setTimeout(r, 100));
    assert.match(lg, /IGNORADO em produção/);
    const u2 = 'http://localhost:' + port, j = async (pth, body, token) => { const r = await fetch(u2 + pth, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', ...(token ? { 'x-token': token } : {}) }, body: body ? JSON.stringify(body) : undefined }); return { status: r.status, j: await r.json().catch(() => null) }; };
    const tk = (await j('/api/register', { name: 'Prod', email: 'prod@teste.com', password: 'segredo123', accept: true })).j.token;
    assert.equal((await j('/api/config')).j.ads, null, 'ADS_PREVIEW é só para teste');
    assert.equal((await j('/api/checkout', {}, tk)).status, 404, 'não existe mais cobrança');
    const f = await j('/api/forgot', { email: 'prod@teste.com' }); assert.equal(f.j.devLink, undefined, 'não pode devolver link de senha');
    // sem ADMIN_KEY em produção o painel fica desligado (nenhuma chave "de teste" é inventada)
    assert.match(lg, /Painel admin DESLIGADO/);
    assert.equal((await j('/api/admin/login', { key: 'qualquer' })).status, 503);
    assert.equal((await fetch(u2 + '/api/admin/overview', { headers: { 'x-admin-key': 'qualquer' } })).status, 404);
  } finally { p.kill(); }
});

test('saúde, cabeçalhos de segurança e páginas legais', async () => {
  const h = await call('/health'); assert.equal(h.j.ok, true);
  assert.equal(h.r.headers.get('x-content-type-options'), 'nosniff');
  for (const p of ['/termos', '/privacidade']) {
    const t = await (await fetch(U + p)).text();
    assert.match(t, /Empresa Teste/); assert.match(t, /ajuda@teste\.com/); assert.ok(!t.includes('{{'));
  }
  for (const f of ['/', '/app.js', '/style.css', '/manifest.webmanifest', '/sw.js', '/icons/icon-192.png']) assert.equal((await fetch(U + f)).status, 200, f);
});

test('cadastro: validações, duplicidade e login', async () => {
  const b = { name: 'Ana', email: 'ana@t.com', password: 'segredo1', accept: true };
  assert.equal((await call('/api/register', { body: { ...b, accept: false } })).status, 400);
  assert.equal((await call('/api/register', { body: { ...b, password: '123' } })).status, 400);
  assert.equal((await call('/api/register', { body: { ...b, email: 'xx' } })).status, 400);
  assert.equal((await call('/api/register', { body: b })).status, 200);
  assert.equal((await call('/api/register', { body: b })).status, 409);
  assert.equal((await call('/api/login', { body: { email: 'ana@t.com', password: 'errada' } })).status, 401);
  assert.equal((await call('/api/login', { body: { email: 'ana@t.com', password: 'segredo1' } })).status, 200);
  assert.equal((await call('/api/me')).status, 401);
  await new Promise(r => setTimeout(r, 1300));   // o banco grava a cada 1 s
  assert.ok(!fs.readFileSync(DATA, 'utf8').includes('segredo1'), 'senha apareceu em texto puro no arquivo');
});

test('gabarito não vaza, ordem das lições e correção no servidor', async () => {
  const tk = await reg('bia@t.com');
  const list = (await call('/api/lessons', { token: tk })).j;
  assert.equal(list.length, lessons.length); assert.equal(list.length, 270);
  const py1 = list.filter(l => l.track === 'python' && l.lv === 1).slice(0, 8).map(l => l.lock);
  assert.deepEqual(py1, [null, 'seq', 'seq', 'seq', 'seq', 'seq', 'seq', 'seq'], 'tudo gratuito; só a sequência das lições bloqueia');
  assert.equal((await call('/api/lessons/py-1-02', { token: tk })).status, 409, 'não pode pular lição');
  const l1 = (await call('/api/lessons/py-1-01', { token: tk })).j;
  assert.ok(!('expectedSql' in l1) && !('need' in l1) && !('expectedOut' in l1) && !('expectedRows' in l1));
  // Python: certo, repetido (sem XP extra) e com saída forjada
  let r = (await call('/api/submit', { token: tk, body: { id: 'py-1-01', code: 'print("Olá, mundo!")', out: 'Olá, mundo!' } })).j;
  assert.equal(r.ok, true); assert.equal(r.gained, 5, 'a 1ª atividade (executar) vale metade do XP da lição'); assert.equal(r.next, 'r');
  r = (await call('/api/submit', { token: tk, body: { id: 'py-1-01', code: 'print("Olá, mundo!")', out: 'Olá, mundo!' } })).j; assert.equal(r.gained, 0, 'não pode ganhar XP duas vezes');
  assert.equal((await call('/api/submit', { token: tk, body: { id: 'py-1-02', code: 'print(1)', out: '1' } })).status, 409, 'a lição 2 só abre com as 2 atividades da lição 1');
  r = (await doRead(tk, lessons.find(l => l.id === 'py-1-01'))).j; assert.equal(r.ok, true); assert.equal(r.gained, 5, 'a 2ª atividade (ler) vale a outra metade'); assert.ok(r.done['py-1-01']);
  assert.equal((await call('/api/submit', { token: tk, body: { id: 'py-1-02', code: 'preco=1\nqtd=1\nprint(preco*qtd)', out: '999' } })).j.ok, false);
  assert.equal((await call('/api/submit', { token: tk, body: { id: 'py-1-03', code: 'print(42)', out: '42' } })).status, 409, 'lição 3 ainda bloqueada');
  // SQL: escrito de outro jeito, "chute" sem usar o comando pedido e resultado errado
  assert.equal((await call('/api/submit', { token: tk, body: { id: 'sql-1-01', code: 'select   *\nfrom produtos' } })).j.ok, true);
  assert.equal((await doRead(tk, lessons.find(l => l.id === 'sql-1-01'))).j.ok, true);
  r = (await call('/api/submit', { token: tk, body: { id: 'sql-1-02', code: 'SELECT 1' } })).j; assert.equal(r.ok, false); assert.equal(r.missing, 'from produtos');
  assert.equal((await call('/api/submit', { token: tk, body: { id: 'sql-1-02', code: 'SELECT nome FROM produtos' } })).j.ok, false);
  assert.equal((await call('/api/submit', { token: tk, body: { id: 'sql-1-02', code: 'SELECT nome, preco FROM produtos' } })).j.ok, true);
  assert.equal((await doRead(tk, lessons.find(l => l.id === 'sql-1-02'))).j.ok, true);
  const me = (await call('/api/me', { token: tk })).j; assert.equal(me.xp, 10 + 15 + 15); assert.equal(me.gems, 15);
  assert.equal((await call('/api/submit', { token: tk, body: { id: 'prova-inexistente', code: 'x' } })).status, 404);
});

test('curso: escolher Python, SQL ou Excel', async () => {
  const tk = await reg('tito@t.com');
  assert.equal((await call('/api/me', { token: tk })).j.track, null);
  assert.equal((await call('/api/track', { token: tk, body: { track: 'java' } })).status, 400);
  assert.equal((await call('/api/track', { token: tk, body: { track: 'sql' } })).j.track, 'sql');
  assert.equal((await call('/api/me', { token: tk })).j.track, 'sql');
  assert.equal((await call('/api/track', { token: tk, body: { track: 'excel' } })).j.track, 'excel');
});

test('Sem cobrança: tudo gratuito, só a ordem bloqueia; proteção contra SQL pesado', async () => {
  const tk = await reg('caio@t.com');
  assert.equal((await call('/api/lessons/py-1-07', { token: tk })).status, 409, 'bloqueio é por sequência, não por plano');
  assert.equal((await call('/api/submit', { token: tk, body: { id: 'py-1-07', code: 'x', out: 'x' } })).status, 409);
  assert.equal((await call('/api/lessons/fin-py-1', { token: tk })).status, 409, 'prova final só depois das 30 lições');
  for (const p of ['/api/checkout', '/api/portal', '/api/webhook']) assert.equal((await call(p, { token: tk, body: {} })).status, 404);
  assert.equal((await call('/api/me', { token: tk })).j.premium, undefined);
  const t0 = Date.now();
  const rec = (await call('/api/submit', { token: tk, body: { id: 'sql-1-01', code: 'WITH RECURSIVE t(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM t) SELECT COUNT(*) FROM t, produtos' } })).j;
  assert.equal(rec.ok, false);
  const heavy = 'SELECT COUNT(*) FROM produtos, ' + Array.from({ length: 13 }, (_, i) => 'vendas v' + i).join(', ');
  const [h, mid] = await Promise.all([call('/api/submit', { token: tk, body: { id: 'sql-1-01', code: heavy } }), (async () => { await new Promise(r => setTimeout(r, 500)); const s = Date.now(); await call('/health'); return Date.now() - s; })()]);
  assert.equal(h.j.ok, false); assert.ok(mid < 1000, 'o servidor travou durante um SQL pesado'); assert.ok(Date.now() - t0 < 8000);
});

// ---------------- Curso: lições -> prova -> próximo nível -> curso concluído ----------------
const lessonsOf = (track, lv) => lessons.filter(l => l.track === track && l.lv === lv);
const premiumUser = (email, name) => reg(email, name);
const quizcheck = require('../quizcheck');
const codeOf = l => l.type === 'excel' ? JSON.stringify(l.answer) : l.type === 'quiz' ? JSON.stringify(quizcheck.solution(l)) : l.solution;           // no Excel a resposta é o JSON das fórmulas das células; no quiz, o JSON das respostas
// Cada lição tem 2 atividades (3 no Intermediário e Avançado de Python/SQL): executar (/api/submit), ler (/api/read) e explicar (/api/explain). A ORDEM é sorteada por aluno e lição
// (vem em `ord` de /api/lessons). doLesson faz as que faltam, na ordem, e devolve o resultado somado (gained = XP de todas, ok = a lição ficou concluída).
// Quem quiser testar uma atividade só usa doExec / doRead / doExpl.
const readAnswer = l => { const o = l.read && l.read.ok; return Array.isArray(o) ? o[0] : typeof o === 'number' ? String(o) : o; };
const doExec = (tk, l) => call('/api/submit', { token: tk, body: { id: l.id, code: codeOf(l), out: l.expectedOut } });
const doRead = (tk, l, a = readAnswer(l)) => call('/api/read', { token: tk, body: { id: l.id, a } });
const doExpl = (tk, l, a = l.expl && l.expl.model) => call('/api/explain', { token: tk, body: { id: l.id, a } });
const rowOfL = async (tk, l) => ((await call('/api/lessons', { token: tk })).j || []).find(x => x.id === l.id) || {};
const actCall = { x: doExec, r: doRead, e: doExpl };
const doLesson = async (tk, l) => {
  const row = await rowOfL(tk, l), ord = (row.ord || '').split('').filter(Boolean), dn = row.dn || '', todo = ord.filter(a => !dn.includes(a));
  if (!ord.length || !todo.length) return doExec(tk, l);                                 // lição sem atividades extras, ou já concluída (treino)
  let j = {}, last, parts = {}, gained = 0, gemsGot = 0, streakUp;
  for (const a of todo) {
    last = await actCall[a](tk, l); if (!last.j || last.j.ok !== true) return last;
    j = { ...j, ...last.j }; parts[a] = last.j.gained || 0; gained += last.j.gained || 0; gemsGot += last.j.gemsGot || 0; streakUp = streakUp || last.j.streakUp;
  }
  return { status: last.status, r: last.r, j: { ...j, ok: true, gained, gemsGot, streakUp, exGained: parts.x, readGained: parts.r, expGained: parts.e, ord } };
};
const cpBefore = l => lessons.checkpoints.find(c => c.track === l.track && c.lv === l.lv && c.after === l.n - 1);   // só existe antes das lições 11 e 21
const finOf = (track, lv) => lessons.finals.find(f => f.track === track && f.lv === lv);
const doTest = (tk, t) => call('/api/submit', { token: tk, body: { id: t.id, code: codeOf(t), out: t.expectedOut } });
const missTest = (tk, t) => call('/api/submit', { token: tk, body: { id: t.id, code: t.type === 'sql' ? 'SELECT 1' : t.type === 'quiz' ? '[]' : t.type === 'dax' ? 'Errado = 1' : 'print("errado")', out: 'x' } });
const doCp = doTest, doFinal = (tk, track, lv) => doTest(tk, finOf(track, lv));
const LEAK = ['solution', 'expectedSql', 'expectedOut', 'expectedRows', 'need', 'hints', 'explain', 'example', 'answer', 'altSet', 'keep', 'noAlt'];   // nada disso pode chegar ao navegador numa prova
const doneOf = async (tk, prefix) => Object.keys((await call('/api/me', { token: tk })).j.done).filter(k => k.startsWith(prefix)).sort();
const idsOf = (prefix, a, b) => Array.from({ length: b - a + 1 }, (_, i) => prefix + String(a + i).padStart(2, '0'));
// faz as 30 lições do nível; antes das lições 11 e 21 é preciso passar no checkpoint (a prova com o que se aprendeu)
const doLevelLessons = async (tk, track, lv) => { let last; for (const l of lessonsOf(track, lv)) { const c = cpBefore(l); if (c) { const r = (await doCp(tk, c)).j; assert.equal(r.ok, true, `checkpoint ${c.id} deveria passar`); } last = (await doLesson(tk, l)).j; assert.equal(last.ok, true, `lição ${l.id} deveria passar`); } return last; };
const levelXp = (track, lv) => lessonsOf(track, lv).reduce((a, l) => a + l.xp, 0) + lessons.checkpoints.filter(c => c.track === track && c.lv === lv).reduce((a, c) => a + c.xp, 0);

test('prova final: só libera com as 30 lições; 3 chances; errou as 3 volta 10 lições; acertou libera o próximo nível', async () => {
  const tk = await premiumUser('prova@t.com', 'Paula Prova'), F = finOf('python', 1);
  assert.equal(F.id, 'fin-py-1');
  assert.equal((await call('/api/lessons/fin-py-1', { token: tk })).status, 409, 'sem as 30 lições não faz a prova final');
  assert.equal((await doFinal(tk, 'python', 1)).status, 409);
  assert.equal((await call('/api/lessons/py-2-01', { token: tk })).status, 409, 'nível 2 fechado até passar na prova final do 1');
  const last = await doLevelLessons(tk, 'python', 1); assert.equal(last.levelComplete, true);
  const xpAfter = (await call('/api/me', { token: tk })).j.xp; assert.equal(xpAfter, levelXp('python', 1));

  // a prova não entrega solução nem dica, e não tem conferência livre
  const g = await call('/api/lessons/fin-py-1', { token: tk }); assert.equal(g.status, 200);
  for (const k of LEAK) assert.ok(!(k in g.j), `a prova vazou "${k}"`);
  assert.equal(g.j.fin, true); assert.equal(g.j.chances, 3); assert.equal(g.j.left, 3); assert.equal(g.j.back, 10); assert.equal(g.j.backFrom, 21); assert.ok(g.j.task && g.j.info && g.j.cobre);
  assert.equal((await call('/api/check', { token: tk, body: { id: 'fin-py-1', code: F.solution, out: F.expectedOut } })).status, 403, 'conferir de graça não vale nas provas');

  // 1ª e 2ª respostas erradas gastam chance, mas nada volta
  let r = (await missTest(tk, F)).j; assert.equal(r.ok, false); assert.equal(r.test, 'fin'); assert.equal(r.left, 2); assert.equal(r.chances, 3); assert.equal(r.rewind, undefined); assert.equal(r.expected, F.expectedOut);
  r = (await missTest(tk, F)).j; assert.equal(r.left, 1); assert.equal(r.rewind, undefined);
  assert.equal((await call('/api/checkpoints', { token: tk })).j.find(c => c.id === 'fin-py-1').left, 1);
  assert.equal((await doneOf(tk, 'py-1-')).length, 30, 'ainda com as 30 lições');
  // 3ª errada: volta 10 lições (21 a 30) e as 3 chances se renovam
  r = (await missTest(tk, F)).j; assert.equal(r.ok, false); assert.deepEqual(r.rewind, { from: 21, to: 30, back: 10 }); assert.equal(r.left, 3);
  assert.deepEqual(await doneOf(tk, 'py-1-'), idsOf('py-1-', 1, 20), 'as lições 21 a 30 voltam a ficar pendentes');
  let me = (await call('/api/me', { token: tk })).j;
  assert.equal(me.fails['python-1'], 1); assert.equal(me.xp, xpAfter, 'não perde os pontos já ganhos'); assert.ok(me.cps.includes('cp-py-1-10') && me.cps.includes('cp-py-1-20'), 'os checkpoints continuam vencidos');
  assert.equal((await call('/api/lessons/py-1-21', { token: tk })).status, 200, 'a lição 21 abre direto (o checkpoint 20 já foi vencido)');
  assert.equal((await call('/api/checkpoints', { token: tk })).j.find(c => c.id === 'fin-py-1').lock, 'seq');
  assert.equal((await doFinal(tk, 'python', 1)).status, 409, 'precisa refazer as lições 21 a 30 antes de tentar de novo');
  assert.equal((await call('/api/lessons/py-2-01', { token: tk })).status, 409);

  // refaz as lições 21 a 30 (sem pontos repetidos) e passa
  for (const l of lessonsOf('python', 1).filter(l => l.n > 20)) { const x = (await doLesson(tk, l)).j; assert.equal(x.ok, true); assert.equal(x.gained, 0, 'pontos das lições só valem uma vez'); }
  assert.equal((await call('/api/me', { token: tk })).j.xp, xpAfter);
  const p = (await doFinal(tk, 'python', 1)).j;
  assert.equal(p.ok, true); assert.equal(p.test, 'fin'); assert.equal(p.gained, 50, 'bônus 50 x nível'); assert.ok(p.passed['python-1']); assert.equal(p.xp, xpAfter + 50);
  assert.equal((await call('/api/lessons/py-2-01', { token: tk })).status, 200, 'nível 2 liberado');
  // prova já vencida: dá para treinar sem gastar chance, sem voltar lições e sem XP repetido
  r = (await missTest(tk, F)).j; assert.equal(r.ok, false); assert.equal(r.rewind, undefined); assert.equal(r.left, 3);
  assert.equal((await doneOf(tk, 'py-1-')).length, 30);
  assert.equal((await doFinal(tk, 'python', 1)).j.gained, 0, 'bônus só na 1ª vez');
  assert.equal(p.trackComplete, undefined, 'o curso só termina depois dos 3 níveis');
});

test('checkpoints: as lições 11 e 21 só abrem depois de passar; 2 chances; errou as 2 volta 5 lições; XP só na 1ª vez', async () => {
  const tk = await reg('cp@teste.com'), C10 = lessons.checkpoints.find(c => c.id === 'cp-py-1-10'), C20 = lessons.checkpoints.find(c => c.id === 'cp-py-1-20'), L1 = lessonsOf('python', 1);
  let list = (await call('/api/checkpoints', { token: tk })).j; assert.equal(list.length, 27, '18 checkpoints + 9 provas finais');
  assert.ok(list.every(c => !LEAK.some(k => k in c)), 'a lista de provas não entrega gabarito');
  const c1 = list.find(c => c.id === 'cp-py-1-10'); assert.equal(c1.after, 10); assert.equal(c1.chances, 2); assert.equal(c1.left, 2); assert.equal(c1.back, 5); assert.equal(c1.backFrom, 6); assert.equal(c1.lock, 'seq'); assert.equal(c1.fin, false);
  assert.deepEqual(list.filter(c => c.track === 'python' && c.lv === 1).map(c => c.after), [10, 20, 30]);
  assert.equal((await call('/api/lessons/cp-py-1-10', { token: tk })).status, 409, 'checkpoint bloqueado antes da lição 10');
  for (const l of L1.slice(0, 10)) assert.equal((await doLesson(tk, l)).j.ok, true);
  assert.equal((await call('/api/checkpoints', { token: tk })).j.find(c => c.id === 'cp-py-1-10').lock, null, 'liberado depois da lição 10');
  const cp = (await call('/api/lessons/cp-py-1-10', { token: tk })).j;
  for (const k of LEAK) assert.ok(!(k in cp), `o checkpoint vazou "${k}"`);
  assert.equal(cp.cp, true); assert.ok(cp.task && cp.info && cp.cobre.length === 10); assert.equal(cp.left, 2);
  // obrigatório: enquanto o checkpoint não for feito, a lição 11 fica bloqueada (lista, abertura e envio)
  assert.equal((await call('/api/lessons', { token: tk })).j.find(x => x.id === 'py-1-11').lock, 'cp', 'a lição 11 só libera depois do checkpoint');
  const g11 = await call('/api/lessons/py-1-11', { token: tk }); assert.equal(g11.status, 409); assert.equal(g11.j.lock, 'cp'); assert.match(g11.j.error, /checkpoint/i);
  assert.equal((await call('/api/submit', { token: tk, body: { id: 'py-1-11', code: 'x', out: 'x' } })).status, 409);
  assert.equal((await call('/api/lessons', { token: tk })).j.find(x => x.id === 'py-1-06').lock, null, 'as lições 6 a 10 seguem a ordem normal (sem checkpoint no meio)');
  const xp0 = (await call('/api/me', { token: tk })).j.xp;

  // 1ª errada: sobra 1 chance, nada volta. 2ª errada: volta 5 lições (6 a 10)
  let r = (await missTest(tk, C10)).j; assert.equal(r.ok, false); assert.equal(r.test, 'cp'); assert.equal(r.left, 1); assert.equal(r.rewind, undefined); assert.equal(r.expected, C10.expectedOut);
  assert.equal((await call('/api/lessons/cp-py-1-10', { token: tk })).j.left, 1);
  r = (await missTest(tk, C10)).j; assert.deepEqual(r.rewind, { from: 6, to: 10, back: 5 }); assert.equal(r.left, 2, 'chances renovadas');
  assert.deepEqual(await doneOf(tk, 'py-1-'), idsOf('py-1-', 1, 5), 'as lições 6 a 10 voltam a ficar pendentes');
  let me = (await call('/api/me', { token: tk })).j; assert.equal(me.fails['cp-py-1-10'], 1); assert.equal(me.xp, xp0, 'não perde pontos'); assert.deepEqual(me.cps, []);
  assert.equal((await call('/api/checkpoints', { token: tk })).j.find(c => c.id === 'cp-py-1-10').lock, 'seq', 'precisa refazer as lições antes');
  assert.equal((await call('/api/lessons/cp-py-1-10', { token: tk })).status, 409);
  for (const l of L1.slice(5, 10)) { const x = (await doLesson(tk, l)).j; assert.equal(x.ok, true); assert.equal(x.gained, 0); }
  assert.equal((await call('/api/checkpoints', { token: tk })).j.find(c => c.id === 'cp-py-1-10').lock, null);

  // passa: XP uma vez, não entra no mapa de lições e abre a lição 11
  r = (await doTest(tk, C10)).j; assert.equal(r.ok, true); assert.equal(r.gained, C10.xp);
  assert.deepEqual(r.cps, ['cp-py-1-10']); assert.ok(!('cp-py-1-10' in r.done), 'checkpoint não entra no mapa de lições concluídas'); assert.equal(r.xp, xp0 + C10.xp);
  r = (await doTest(tk, C10)).j; assert.equal(r.gained, 0, 'XP só na 1ª vez');
  assert.equal((await call('/api/lessons', { token: tk })).j.find(x => x.id === 'py-1-11').lock, null, 'checkpoint feito: a lição 11 abre');
  assert.equal((await call('/api/lessons/py-1-11', { token: tk })).status, 200);
  assert.equal((await call('/api/lessons', { token: tk })).j.find(x => x.id === 'py-1-12').lock, 'seq', 'a lição 12 segue a ordem normal');
  assert.equal((await call('/api/lessons/cp-py-1-20', { token: tk })).status, 409, 'o próximo checkpoint só libera depois da lição 20');

  // checkpoint 2 (depois da lição 20): errou as duas, volta 5 lições (16 a 20)
  for (const l of L1.slice(10, 20)) assert.equal((await doLesson(tk, l)).j.ok, true);
  await missTest(tk, C20); r = (await missTest(tk, C20)).j; assert.deepEqual(r.rewind, { from: 16, to: 20, back: 5 });
  assert.deepEqual(await doneOf(tk, 'py-1-'), idsOf('py-1-', 1, 15));
  assert.equal((await call('/api/lessons', { token: tk })).j.find(x => x.id === 'py-1-21').lock, 'seq');
  for (const l of L1.slice(15, 20)) assert.equal((await doLesson(tk, l)).j.ok, true);
  r = (await doTest(tk, C20)).j; assert.equal(r.ok, true); assert.equal(r.gained, C20.xp); assert.deepEqual(r.cps, ['cp-py-1-10', 'cp-py-1-20']);
  assert.equal((await call('/api/lessons/py-1-21', { token: tk })).status, 200, 'checkpoint 2 feito: a lição 21 abre');
  assert.equal((await call('/api/lessons/cp-xx', { token: tk })).status, 404);
  assert.equal((await call('/api/lessons', { token: tk })).j.length, 270);
});

test('SQL: numa prova errada o aluno recebe o resultado esperado (nunca a solução) e a mesma regra de chances vale', async () => {
  const tk = await reg('sqlcp@teste.com', 'Sara SQL'), C = lessons.checkpoints.find(c => c.id === 'cp-sql-1-10');
  await call('/api/track', { token: tk, body: { track: 'sql' } });
  for (const l of lessonsOf('sql', 1).slice(0, 10)) assert.equal((await doLesson(tk, l)).j.ok, true, l.id);
  const g = await call('/api/lessons/cp-sql-1-10', { token: tk }); assert.equal(g.status, 200); for (const k of LEAK) assert.ok(!(k in g.j), `vazou "${k}"`); assert.ok(g.j.seed, 'o navegador precisa do banco de treino');
  let r = (await call('/api/submit', { token: tk, body: { id: C.id, code: 'SELECT nome FROM produtos WHERE preco < 1000' } })).j;
  assert.equal(r.ok, false); assert.equal(r.left, 1); assert.ok(r.view && r.view.columns.length >= 1 && r.view.values.length >= 1, 'mostra o resultado esperado para explicar o erro');
  assert.ok(!JSON.stringify(r).replace(/\s+/g, '').toLowerCase().includes(C.solution.replace(/\s+/g, '').toLowerCase().slice(-24)), 'a solução não pode aparecer');
  r = (await missTest(tk, C)).j; assert.deepEqual(r.rewind, { from: 6, to: 10, back: 5 }); assert.equal(r.view, undefined);
  assert.deepEqual(await doneOf(tk, 'sql-1-'), idsOf('sql-1-', 1, 5));
  for (const l of lessonsOf('sql', 1).slice(5, 10)) assert.equal((await doLesson(tk, l)).j.ok, true);
  r = (await doTest(tk, C)).j; assert.equal(r.ok, true); assert.equal(r.view, undefined);
});

test('prova: código que dá erro (sintaxe, tabela inexistente) também gasta uma chance; com as chances no fim, volta as lições', async () => {
  const tk = await reg('errprova@teste.com', 'Erica Erro'), C = lessons.checkpoints.find(c => c.id === 'cp-sql-1-10');
  await call('/api/track', { token: tk, body: { track: 'sql' } });
  for (const l of lessonsOf('sql', 1).slice(0, 10)) assert.equal((await doLesson(tk, l)).j.ok, true, l.id);
  let r = (await call('/api/submit', { token: tk, body: { id: C.id, code: 'SELEC nome FROM produtos', out: '' } })).j;
  assert.equal(r.ok, false); assert.equal(r.left, 1, 'erro de digitação no SQL gasta a 1ª chance');
  assert.equal((await call('/api/lessons/' + C.id, { token: tk })).j.left, 1, 'a chance gasta fica salva no servidor');
  r = (await call('/api/submit', { token: tk, body: { id: C.id, code: 'SELECT nome FROM produtoss', out: '' } })).j;
  assert.equal(r.ok, false); assert.deepEqual(r.rewind, { from: 6, to: 10, back: 5 }, 'tabela inexistente gasta a última chance e volta as lições');
  // o Python também: código que nem roda (sintaxe) não passa e gasta chance
  const tp = await reg('errprova2@teste.com', 'Paulo Py'), P = lessons.checkpoints.find(c => c.id === 'cp-py-1-10');
  for (const l of lessonsOf('python', 1).slice(0, 10)) assert.equal((await doLesson(tp, l)).j.ok, true, l.id);
  r = (await call('/api/submit', { token: tp, body: { id: P.id, code: 'print("oi"', out: '' } })).j;
  assert.equal(r.ok, false); assert.equal(r.left, 1, 'erro de sintaxe no Python gasta a 1ª chance');
});

test('curso completo: os 3 níveis aprovados concluem o curso (sem certificado) e a conta pode ser excluída', async () => {
  const tk = await premiumUser('cert@t.com', 'Carol');
  for (const lv of [1, 2, 3]) {
    await doLevelLessons(tk, 'python', lv);
    const r = (await doFinal(tk, 'python', lv)).j;
    assert.equal(r.ok, true, 'nível ' + lv); assert.ok(r.passed['python-' + lv]); assert.equal(r.trackComplete, lv === 3 ? true : undefined);
  }
  const me = (await call('/api/me', { token: tk })).j; assert.equal(me.certs, undefined, 'não existe mais certificado no perfil');
  assert.equal((await call('/api/certificate', { token: tk, body: { track: 'python', name: 'Carolina Silva' } })).status, 404, 'a rota do certificado foi removida');
  assert.equal((await fetch(U + '/certificado/CUP-AAAA-BBBB-CCCC')).status, 404);
  assert.equal((await call('/api/account', { method: 'DELETE', token: tk, body: { password: 'segredo1' } })).status, 200);
});

test('recuperação de senha, perfil, exportação e exclusão de conta', async () => {
  const tk = await reg('dani@t.com', 'Dani');
  assert.equal((await call('/api/forgot', { body: { email: 'ninguem@t.com' } })).status, 200);   // não revela se existe
  assert.equal((await call('/api/forgot', { body: { email: 'dani@t.com' } })).status, 200);
  let m; for (let i = 0; i < 30 && !(m = log.match(/\?reset=([a-f0-9]{64})/g)); i++) await new Promise(r => setTimeout(r, 100));
  const token = m[m.length - 1].split('=')[1];
  assert.equal((await call('/api/reset', { body: { token: 'x'.repeat(64), password: 'novasenha1' } })).status, 400);
  assert.equal((await call('/api/reset', { body: { token, password: 'novasenha1' } })).status, 200);
  assert.equal((await call('/api/reset', { body: { token, password: 'outra123' } })).status, 400, 'link só pode ser usado uma vez');
  assert.equal((await call('/api/me', { token: tk })).status, 401, 'sessões antigas devem cair');
  const tk2 = (await call('/api/login', { body: { email: 'dani@t.com', password: 'novasenha1' } })).j.token;
  assert.equal((await call('/api/profile', { token: tk2, body: { name: 'Daniela' } })).j.name, 'Daniela');
  const ex = (await call('/api/export', { token: tk2 })).j; assert.equal(ex.email, 'dani@t.com'); assert.ok(!('pass' in ex));
  assert.equal((await call('/api/account', { method: 'DELETE', token: tk2, body: { password: 'errada' } })).status, 403);
  assert.equal((await call('/api/account', { method: 'DELETE', token: tk2, body: { password: 'novasenha1' } })).status, 200);
  assert.equal((await call('/api/login', { body: { email: 'dani@t.com', password: 'novasenha1' } })).status, 401);
});

const sleep = ms => new Promise(r => setTimeout(r, ms));
const gtok = (o = {}) => Buffer.from(JSON.stringify({ aud: 'test-client-id', sub: 'g-123', email: 'gabi@t.com', email_verified: true, name: 'Gabi Google', ...o })).toString('base64url');
const resetTokens = email => [...log.matchAll(new RegExp('Para: ' + email.replace('.', '\\.') + '[\\s\\S]*?\\?reset=([a-f0-9]{64})', 'g'))].map(m => m[1]);
const waitToken = async (email, n) => { for (let i = 0; i < 30; i++) { const l = resetTokens(email); if (l.length >= n) return l[n - 1]; await sleep(100); } throw new Error('o e-mail de recuperação não chegou'); };

test('Google: token inválido, conta nova com Termos, novo login e vínculo com conta existente', async () => {
  assert.equal((await call('/api/config')).j.googleClientId, 'test-client-id');
  assert.equal((await call('/api/google', { body: { credential: 'lixo' } })).status, 401);
  assert.equal((await call('/api/google', { body: { credential: gtok({ aud: 'outro-app' }) } })).status, 401);
  assert.equal((await call('/api/google', { body: { credential: gtok({ email_verified: false }) } })).status, 401);
  let r = (await call('/api/google', { body: { credential: gtok() } })).j;
  assert.equal(r.needsTerms, true); assert.equal(r.email, 'gabi@t.com'); assert.ok(!r.token, 'não pode criar conta sem aceitar os Termos');
  r = (await call('/api/google', { body: { credential: gtok(), accept: true } })).j; assert.ok(r.token);
  const me = (await call('/api/me', { token: r.token })).j; assert.equal(me.name, 'Gabi Google'); assert.equal(me.hasPassword, false); assert.equal(me.google, true);
  const again = (await call('/api/google', { body: { credential: gtok() } })).j; assert.ok(again.token, 'segundo login não pede Termos');
  assert.equal((await call('/api/login', { body: { email: 'gabi@t.com', password: 'qualquer1' } })).status, 401, 'conta só-Google não tem senha');
  await reg('hugo@t.com', 'Hugo');
  const h = (await call('/api/google', { body: { credential: gtok({ sub: 'g-999', email: 'hugo@t.com', name: 'Hugo G' }) } })).j;
  assert.ok(h.token, 'deveria vincular à conta existente'); assert.equal((await call('/api/me', { token: h.token })).j.name, 'Hugo');
  assert.equal((await call('/api/login', { body: { email: 'hugo@t.com', password: 'segredo1' } })).status, 200, 'a senha antiga continua valendo');
});

test('quem entrou só com Google consegue criar senha pela recuperação e é conectado na hora', async () => {
  assert.equal((await call('/api/forgot', { body: { email: 'gabi@t.com' } })).status, 200);
  const t = await waitToken('gabi@t.com', 1);
  assert.equal((await call('/api/reset/check?token=' + t)).j.valid, true);
  assert.equal((await call('/api/reset/check?token=abc')).j.valid, false);
  const r = (await call('/api/reset', { body: { token: t, password: 'minhasenha1' } })).j; assert.ok(r.token, 'deve conectar automaticamente');
  assert.equal((await call('/api/reset/check?token=' + t)).j.valid, false, 'link só vale uma vez');
  assert.equal((await call('/api/me', { token: r.token })).j.hasPassword, true);
  assert.equal((await call('/api/login', { body: { email: 'gabi@t.com', password: 'minhasenha1' } })).status, 200);
});

test('conta só-Google se exclui digitando EXCLUIR', async () => {
  const t = (await call('/api/google', { body: { credential: gtok({ sub: 'g-777', email: 'ze@t.com', name: 'Zé' }), accept: true } })).j.token;
  assert.equal((await call('/api/account', { method: 'DELETE', token: t, body: { confirm: 'sim' } })).status, 403);
  assert.equal((await call('/api/account', { method: 'DELETE', token: t, body: { confirm: 'EXCLUIR' } })).status, 200);
  assert.equal((await call('/api/me', { token: t })).status, 401);
});

test('recuperação: no máximo 3 e-mails por hora por endereço e link antigo deixa de valer', async () => {
  await reg('lia@t.com', 'Lia');
  for (let i = 0; i < 4; i++) await call('/api/forgot', { body: { email: 'lia@t.com' } });
  await sleep(400);
  const l = resetTokens('lia@t.com'); assert.equal(l.length, 3, 'só 3 e-mails por hora');
  assert.equal((await call('/api/reset/check?token=' + l[0])).j.valid, false, 'link antigo deve ser invalidado');
  assert.equal((await call('/api/reset/check?token=' + l[2])).j.valid, true);
});

test('alterar senha derruba outros aparelhos; admin gera link manual de redefinição', async () => {
  const t1 = await reg('mia@t.com', 'Mia'), t2 = (await call('/api/login', { body: { email: 'mia@t.com', password: 'segredo1' } })).j.token;
  assert.equal((await call('/api/password', { token: t1, body: { current: 'errada', password: 'novasenha9' } })).status, 403);
  assert.equal((await call('/api/password', { token: t1, body: { current: 'segredo1', password: 'curta' } })).status, 400);
  assert.equal((await call('/api/password', { token: t1, body: { current: 'segredo1', password: 'novasenha9' } })).status, 200);
  assert.equal((await call('/api/me', { token: t1 })).status, 200); assert.equal((await call('/api/me', { token: t2 })).status, 401);
  assert.equal((await call('/api/login', { body: { email: 'mia@t.com', password: 'novasenha9' } })).status, 200);
  assert.equal((await call('/api/admin/reset-link', { body: { email: 'mia@t.com' } })).status, 404);
  assert.equal((await call('/api/admin/reset-link', { headers: { 'x-admin-key': 'chave-admin' }, body: { email: 'ninguem@t.com' } })).status, 404);
  const link = (await call('/api/admin/reset-link', { headers: { 'x-admin-key': 'chave-admin' }, body: { email: 'mia@t.com' } })).j.link;
  assert.match(link, /\?reset=[a-f0-9]{64}$/);
  assert.equal((await call('/api/reset', { body: { token: link.split('=')[1], password: 'outrasenha1' } })).status, 200);
});

test('painel do dono e limite de tentativas de login', async () => {
  assert.equal((await call('/api/admin/stats')).status, 404);
  assert.equal((await call('/api/admin/stats', { headers: { 'x-admin-key': 'chave-admin' } })).status, 200);
  const s = (await call('/api/admin/stats', { headers: { 'x-admin-key': 'chave-admin' } })).j; assert.ok(s.usuarios >= 3 && s.premium === undefined);
  let blocked = false;
  for (let i = 0; i < 15 && !blocked; i++) blocked = (await call('/api/login', { body: { email: 'ana@t.com', password: 'x' + i } })).status === 429;
  assert.ok(blocked, 'deveria bloquear após muitas tentativas');
});


// ---------------- Anúncios ----------------
test('anúncios: desligados sem ADSENSE_CLIENT; ligados com ads.txt e CSP só quando configurados', async () => {
  const cfg = (await call('/api/config')).j; assert.equal(cfg.ads, null);
  assert.equal((await call('/ads.txt')).status, 404);
  const h = await fetch(U + '/'); assert.ok(!/googlesyndication/.test(h.headers.get('content-security-policy')), 'sem anúncios, a CSP não abre domínios do Google Ads');
  const port = PORT + 800, d = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'ads-')), 'data.json'); let lg = '';
  const p = spawn('node', ['server.js'], { cwd: path.join(__dirname, '..'), env: { ...process.env, PORT: port, DATA_FILE: d, BASE_URL: 'http://localhost:' + port, ADSENSE_CLIENT: 'ca-pub-1234567890123456', ADSENSE_SLOT: '1234567890', DATABASE_URL: '' } });
  p.stdout.on('data', x => lg += x); p.stderr.on('data', x => lg += x);
  try {
    for (let i = 0; i < 150 && !/rodando/.test(lg); i++) await new Promise(r => setTimeout(r, 100));
    const u2 = 'http://localhost:' + port;
    assert.deepEqual((await (await fetch(u2 + '/api/config')).json()).ads, { client: 'ca-pub-1234567890123456', slot: '1234567890' });
    const t = await fetch(u2 + '/ads.txt'); assert.equal(t.status, 200); assert.equal(await t.text(), 'google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0\n');
    assert.match((await fetch(u2 + '/')).headers.get('content-security-policy'), /googlesyndication\.com/);
  } finally { p.kill(); }
  const port2 = PORT + 801; let lg2 = '';
  const q = spawn('node', ['server.js'], { cwd: path.join(__dirname, '..'), env: { ...process.env, PORT: port2, DATA_FILE: d + '2', BASE_URL: 'http://localhost:' + port2, ADSENSE_CLIENT: '"><script>alert(1)</script>', DATABASE_URL: '' } });
  q.stdout.on('data', x => lg2 += x);
  try {
    for (let i = 0; i < 150 && !/rodando/.test(lg2); i++) await new Promise(r => setTimeout(r, 100));
    assert.equal((await (await fetch('http://localhost:' + port2 + '/api/config')).json()).ads, null, 'ID de anúncio inválido é ignorado');
  } finally { q.kill(); }
});

// ---------------- sql.js servido pelo próprio servidor (as lições de SQL dependem disso no navegador) ----------------
test('SQL no navegador: /vendor/sql entrega o JS e o wasm do sql.js', async () => {
  const j = await fetch(U + '/vendor/sql/sql-wasm.js'); assert.equal(j.status, 200); assert.match(j.headers.get('content-type'), /javascript/);
  const w = await fetch(U + '/vendor/sql/sql-wasm.wasm'); assert.equal(w.status, 200); assert.ok((await w.arrayBuffer()).byteLength > 100000);
});

// ---------------- Correção de SQL no servidor ----------------
test('SQL: resposta certa é aprovada (inclusive várias de uma vez) e o autoteste de inicialização passou', async () => {
  const port = PORT + 811, base = 'http://localhost:' + port, d = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'sqlok-')), 'data.json'); let lg = '';
  const p = spawn('node', ['server.js'], { cwd: path.join(__dirname, '..'), env: { ...process.env, PORT: port, DATA_FILE: d, BASE_URL: base, RELAX_SUBMIT_LIMIT: '1', DEV_SHOW_RESET_LINK: '1', DATABASE_URL: '' } });
  p.stdout.on('data', x => lg += x); p.stderr.on('data', x => lg += x);
  try {
    for (let i = 0; i < 150 && !/rodando/.test(lg); i++) await new Promise(r => setTimeout(r, 100));
    for (let i = 0; i < 100 && !/Correção de SQL no servidor/.test(lg); i++) await new Promise(r => setTimeout(r, 100));
    assert.match(lg, /Correção de SQL no servidor: ATIVA/, lg);
    const post = async (u, body, tk) => { const r = await fetch(base + u, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(tk ? { 'x-token': tk } : {}) }, body: JSON.stringify(body) }); return { status: r.status, j: await r.json().catch(() => ({})) }; };
    const tk = (await post('/api/register', { name: 'Sql Ok', email: 'sqlok@teste.com', password: 'segredo1', accept: true })).j.token; assert.ok(tk);
    const rs = await Promise.all(Array.from({ length: 6 }, () => post('/api/check', { id: 'sql-1-01', code: 'SELECT * FROM produtos' }, tk)));
    for (const r of rs) { assert.equal(r.status, 200); assert.equal(r.j.ok, true); }
    assert.equal((await post('/api/check', { id: 'sql-1-01', code: 'SELECT nome FROM produtos' }, tk)).j.ok, false, 'resposta errada continua errada');
    const bad = await post('/api/check', { id: 'sql-1-01', code: 'SELEC * FROM' }, tk); assert.equal(bad.status, 200); assert.equal(bad.j.ok, false, 'erro de sintaxe do aluno = errado (não é falha do servidor)');
  } finally { p.kill(); }
});

test('SQL: se o servidor não consegue rodar o sql.js, avisa (503) em vez de marcar como errado', async () => {
  const root = path.join(__dirname, '..'), tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'nosql-'));
  for (const f of ['server.js', 'admin.js', 'totp.js', 'qr.js', 'store.js', 'lessons.js', 'pysandbox.js', 'sqlcheck.js', 'xlcheck.js', 'daxcheck.js', 'quizcheck.js', 'explain.js', 'package.json']) fs.copyFileSync(path.join(root, f), path.join(tmp, f));
  for (const d of ['content', 'public', 'legal', 'tools']) fs.cpSync(path.join(root, d), path.join(tmp, d), { recursive: true });
  fs.mkdirSync(path.join(tmp, 'node_modules'));
  for (const m of fs.readdirSync(path.join(root, 'node_modules'))) if (m !== 'sql.js') try { fs.symlinkSync(path.join(root, 'node_modules', m), path.join(tmp, 'node_modules', m), 'dir'); } catch { }
  const port = PORT + 810, base = 'http://localhost:' + port; let lg = '';
  const p = spawn('node', ['server.js'], { cwd: tmp, env: { ...process.env, PORT: port, DATA_FILE: path.join(tmp, 'data.json'), BASE_URL: base, RELAX_SUBMIT_LIMIT: '1', DEV_SHOW_RESET_LINK: '1', DATABASE_URL: '' } });
  p.stdout.on('data', x => lg += x); p.stderr.on('data', x => lg += x);
  try {
    for (let i = 0; i < 150 && !/rodando/.test(lg); i++) await new Promise(r => setTimeout(r, 100));
    for (let i = 0; i < 100 && !/Correção de SQL no servidor/.test(lg); i++) await new Promise(r => setTimeout(r, 100));
    assert.match(lg, /Correção de SQL no servidor: FALHOU/, 'o autoteste deveria avisar no log: ' + lg);
    const post = async (u, body, tk) => { const r = await fetch(base + u, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(tk ? { 'x-token': tk } : {}) }, body: JSON.stringify(body) }); return { status: r.status, j: await r.json().catch(() => ({})) }; };
    const reg1 = (await post('/api/register', { name: 'Sem Sql', email: 'nosql@teste.com', password: 'segredo1', accept: true })).j;
    const tk = reg1.token; assert.ok(tk, 'cadastro falhou: ' + JSON.stringify(reg1));
    let r = await post('/api/check', { id: 'sql-1-01', code: 'SELECT * FROM produtos' }, tk); assert.equal(r.status, 503); assert.equal(r.j.engine, true); assert.match(r.j.error, /npm install/);
    r = await post('/api/submit', { id: 'sql-1-01', code: 'SELECT * FROM produtos' }, tk); assert.equal(r.status, 503); assert.equal(r.j.engine, true);
    let me = await (await fetch(base + '/api/me', { headers: { 'x-token': tk } })).json(); assert.equal(me.xp, 0);
    // com o resultado enviado pelo navegador (como no Python sem Linux), a resposta certa é aceita e a errada não
    const SQLJS = require('sql.js'), SQL = await SQLJS(), L = lessons.find(x => x.id === 'sql-1-01'), db = new SQL.Database(); db.run(L.seed);
    const rows = c => { const e = db.exec(c); return JSON.stringify(e[e.length - 1].values); };
    r = await post('/api/submit', { id: 'sql-1-01', code: 'SELECT nome FROM produtos', out: rows('SELECT nome FROM produtos') }, tk); assert.equal(r.status, 200); assert.equal(r.j.ok, false, 'resultado diferente do esperado');
    r = await post('/api/submit', { id: 'sql-1-01', code: 'SELECT * FROM produtos', out: rows('SELECT * FROM produtos') }, tk); assert.equal(r.status, 200); assert.equal(r.j.ok, true); assert.equal(r.j.ex['sql-1-01'] !== undefined, true, 'a atividade 1 fica registrada');
    assert.match(lg, /usando o resultado enviado pelo navegador/);
    r = await post('/api/read', { id: 'sql-1-01', a: L.read.ok }, tk); assert.equal(r.j.ok, true, 'a atividade de ler não depende do sql.js'); assert.ok(r.j.done['sql-1-01']);
    r = await post('/api/submit', { id: 'sql-1-02', code: 'SELECT nome, preco FROM produtos', out: 'não é json' }, tk); assert.equal(r.status, 503, 'sem resultado válido não há como corrigir');
    r = await post('/api/submit', { id: 'py-1-01', code: 'print("Olá, mundo!")', out: 'Olá, mundo!' }, tk); assert.equal(r.j.ok, true, 'Python não depende do sql.js');
  } finally { if (p.exitCode === null) { p.kill(); await new Promise(r => p.once('exit', r)); } try { fs.rmSync(tmp, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); } catch { } }
});

test('SQL: com a cópia vendor/sql do projeto, corrige mesmo sem o pacote sql.js instalado (caso do "npm install" não rodado)', async () => {
  const root = path.join(__dirname, '..'), tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vend-'));
  for (const f of ['server.js', 'admin.js', 'totp.js', 'qr.js', 'store.js', 'lessons.js', 'pysandbox.js', 'sqlcheck.js', 'xlcheck.js', 'daxcheck.js', 'quizcheck.js', 'explain.js', 'package.json']) fs.copyFileSync(path.join(root, f), path.join(tmp, f));
  for (const d of ['content', 'public', 'legal', 'tools', 'vendor']) fs.cpSync(path.join(root, d), path.join(tmp, d), { recursive: true });
  fs.mkdirSync(path.join(tmp, 'node_modules'));
  for (const m of fs.readdirSync(path.join(root, 'node_modules'))) if (m !== 'sql.js') try { fs.symlinkSync(path.join(root, 'node_modules', m), path.join(tmp, 'node_modules', m), 'dir'); } catch { }
  const port = PORT + 812, base = 'http://localhost:' + port; let lg = '';
  const p = spawn('node', ['server.js'], { cwd: tmp, env: { ...process.env, PORT: port, DATA_FILE: path.join(tmp, 'data.json'), BASE_URL: base, RELAX_SUBMIT_LIMIT: '1', DEV_SHOW_RESET_LINK: '1', DATABASE_URL: '' } });
  p.stdout.on('data', x => lg += x); p.stderr.on('data', x => lg += x);
  try {
    for (let i = 0; i < 150 && !/rodando/.test(lg); i++) await new Promise(r => setTimeout(r, 100));
    for (let i = 0; i < 100 && !/Correção de SQL no servidor/.test(lg); i++) await new Promise(r => setTimeout(r, 100));
    assert.match(lg, /Correção de SQL no servidor: ATIVA/, lg);
    const post = async (u, body, tk) => { const r = await fetch(base + u, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(tk ? { 'x-token': tk } : {}) }, body: JSON.stringify(body) }); return { status: r.status, j: await r.json().catch(() => ({})) }; };
    const tk = (await post('/api/register', { name: 'Vend', email: 'vend@teste.com', password: 'segredo1', accept: true })).j.token; assert.ok(tk);
    const r = await post('/api/submit', { id: 'sql-1-01', code: 'SELECT * FROM produtos' }, tk); assert.equal(r.status, 200); assert.equal(r.j.ok, true);
    assert.equal(r.j.ex['sql-1-01'] !== undefined, true, 'a atividade 1 da lição precisa ficar registrada como concluída');
    const w = await fetch(base + '/vendor/sql/sql-wasm.wasm'); assert.equal(w.status, 200);
  } finally { if (p.exitCode === null) { p.kill(); await new Promise(r => p.once('exit', r)); } try { fs.rmSync(tmp, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); } catch { } }
});

// ---------------- Provas: checkpoints (lições 10 e 20) e prova final (lição 30): testes na seção do curso, acima ----------------
test('personagem: Tay (feminino) ou Cut (masculino) fica salvo na conta, valor inválido é recusado e as imagens são servidas', async () => {
  const tk = await reg('guia@t.com');
  assert.equal((await call('/api/me', { token: tk })).j.guide, null, 'conta nova ainda não escolheu');
  assert.equal((await call('/api/guide', { token: tk, body: { guide: 'robo' } })).status, 400);
  assert.equal((await call('/api/guide', { token: tk, body: {} })).status, 400);
  assert.equal((await call('/api/guide', { body: { guide: 'tay' } })).status, 401, 'precisa estar logado');
  assert.equal((await call('/api/guide', { token: tk, body: { guide: 'tay' } })).j.guide, 'tay');
  assert.equal((await call('/api/me', { token: tk })).j.guide, 'tay');
  assert.equal((await call('/api/guide', { token: tk, body: { guide: 'cut' } })).j.guide, 'cut', 'dá para trocar depois');
  for (const f of ['tay', 'tay-face', 'cut', 'cut-face']) {
    const r = await fetch(`${U}/img/${f}.webp`);
    assert.equal(r.status, 200, f); assert.match(r.headers.get('content-type') || '', /webp/, f);
  }
});

test('cadastro: gênero (feminino/masculino) e personagem escolhidos antes da conta ficam salvos; valores inválidos são ignorados; contas antigas respondem depois; o painel mostra', async () => {
  const cad = async (email, extra, ip) => { const r = await call('/api/register', { body: { name: 'Quem É', email, password: 'segredo1', accept: true, ...extra }, headers: { 'x-forwarded-for': `10.9.${ip}.1` } }); if (r.j && r.j.devVerifyLink) await confirm(r.j.devVerifyLink); assert.equal(r.status, 200); return { token: r.j.token, ...(await call('/api/me', { token: r.j.token })).j }; };
  // as duas escolhas vêm junto com o cadastro e voltam no perfil
  const a = await cad('sexo-f@t.com', { sex: 'f', guide: 'cut' }, 1);
  assert.equal(a.sex, 'f'); assert.equal(a.guide, 'cut', 'o gênero e o personagem são escolhas independentes');
  const me = (await call('/api/me', { token: a.token })).j; assert.equal(me.sex, 'f'); assert.equal(me.guide, 'cut');
  const b = await cad('sexo-m@t.com', { sex: 'm', guide: 'tay' }, 2); assert.equal(b.sex, 'm'); assert.equal(b.guide, 'tay');
  // lixo no corpo é ignorado e a conta nasce "sem resposta", para o app perguntar uma vez
  const c = await cad('sexo-x@t.com', { sex: 'robo', guide: '<b>x</b>' }, 3); assert.equal(c.sex ?? null, null); assert.equal(c.guide ?? null, null);
  const d = await cad('sexo-nada@t.com', {}, 4); assert.equal(d.sex ?? null, null); assert.equal(d.guide ?? null, null);
  // conta antiga (sem as respostas) responde depois, uma coisa de cada vez ou as duas juntas
  assert.equal((await call('/api/guide', { token: d.token, body: { sex: 'x' } })).status, 400, 'gênero inválido é recusado');
  assert.equal((await call('/api/guide', { token: d.token, body: { sex: 'm', guide: 'robo' } })).status, 400, 'personagem inválido recusa o pedido todo');
  assert.equal((await call('/api/me', { token: d.token })).j.sex ?? null, null, 'pedido recusado não grava nada');
  let r = (await call('/api/guide', { token: d.token, body: { sex: 'm' } })).j; assert.equal(r.sex, 'm'); assert.equal(r.guide ?? null, null, 'só o gênero: personagem continua em aberto');
  r = (await call('/api/guide', { token: d.token, body: { guide: 'tay' } })).j; assert.equal(r.sex, 'm', 'escolher o personagem não mexe no gênero'); assert.equal(r.guide, 'tay');
  r = (await call('/api/guide', { token: c.token, body: { sex: 'f', guide: 'tay' } })).j; assert.equal(r.sex, 'f'); assert.equal(r.guide, 'tay');
  // o painel do dono enxerga (lista, ficha, CSV, contagem) — e quem exporta os próprios dados também
  const row = (await A('users?q=sexo-f@t.com')).j.rows.find(x => x.email === 'sexo-f@t.com'); assert.equal(row.sex, 'f'); assert.equal(row.guide, 'cut');
  const det = (await A('users/' + row.id)).j; assert.equal(det.sex, 'f'); assert.equal(det.guide, 'cut');
  const csv = await (await fetch(U + '/api/admin/users.csv?q=sexo-', { headers: { 'x-admin-token': await atok() } })).text();
  assert.match(csv.split('\n')[0], /;Gênero;Personagem/); assert.match(csv, /sexo-f@t\.com;.*;feminino;Cut/); assert.match(csv, /sexo-m@t\.com;.*;masculino;Tay/);
  const ov = (await A('overview')).j; assert.ok(ov.counts.sex && typeof ov.counts.sex.f === 'number' && typeof ov.counts.sex.m === 'number' && typeof ov.counts.sex.none === 'number');
  assert.ok(ov.counts.guides && typeof ov.counts.guides.tay === 'number' && typeof ov.counts.guides.cut === 'number');
  const ex = await (await fetch(U + '/api/export', { headers: { 'x-token': a.token } })).json(); assert.equal(ex.sex, 'f'); assert.equal(ex.guide, 'cut');
  // o app: três perguntas no cadastro (gênero, personagem e nome do personagem), uma vez só para conta antiga, e as frases mudam para o gênero escolhido
  const app = fs.readFileSync(path.join(__dirname, '..', 'public', 'app.js'), 'utf8');
  assert.match(app, /startWizard\(\['sex', 'guide', 'gname'\], false\)/, 'visitante novo começa pelas três perguntas');
  assert.match(app, /!S\.me\.sex && 'sex', !S\.me\.guide && 'guide', !S\.me\.gname && 'gname'/, 'conta antiga é perguntada uma vez (só o que falta)');
  assert.match(app, /\.\.\.\(S\.reg \|\| \{\}\)/, 'as escolhas seguem junto com o cadastro');
  assert.match(app, /Você é feminino ou masculino\?/); assert.match(app, /Quem vai te guiar na jornada\?/);
  assert.match(app, /Eu sou/, 'dá para mudar no Perfil');
  assert.ok(!/chooseGuide/.test(app), 'o seletor antigo de personagem saiu');
});


// ---------------- Painel admin ----------------
// O token de admin é criado uma vez só (o login tem limite de tentativas por IP).
// O teste antigo de "limite de tentativas" bloqueia o login deste IP; aqui cada login usa um IP de mentira (o servidor confia em x-forwarded-for).
let lgnN = 0; const lgn = body => call('/api/login', { body, headers: { 'x-forwarded-for': `10.7.${++lgnN}.1` } });
let AT = null;
const atok = async () => AT ??= (await call('/api/admin/login', { body: { key: 'chave-admin' } })).j.token;
const A = async (p, body, method) => call('/api/admin/' + p, { method, body, headers: { 'x-admin-token': await atok() } });
const uidOf = async email => { const r = (await A('users?q=' + encodeURIComponent(email))).j.rows.find(x => x.email === email); assert.ok(r, 'usuário ' + email + ' não achado no painel'); return r.id; };
const act = async (id, body) => A(`users/${id}/action`, body);
const setSettings = async body => { const r = await A('settings', body); assert.equal(r.status, 200, JSON.stringify(r.j)); return r.j; };

test('admin: sem credencial o painel "não existe" (404), chave errada 401, login dá token de 12 h e logout o encerra', async () => {
  for (const p of ['overview', 'users', 'users.csv', 'learning', 'settings', 'system', 'audit']) assert.equal((await call('/api/admin/' + p)).status, 404, p);
  assert.equal((await call('/api/admin/overview', { headers: { 'x-admin-key': 'errada' } })).status, 404);
  assert.equal((await call('/api/admin/overview', { headers: { 'x-admin-token': 'lixo' } })).status, 401, 'token inválido pede novo login');
  const aluno = await reg('curioso@t.com');
  assert.equal((await call('/api/admin/overview', { token: aluno })).status, 404, 'a sessão de aluno não abre o painel');
  assert.equal((await call('/api/admin/login', { body: { key: 'errada' } })).status, 401);
  const r = await call('/api/admin/login', { body: { key: 'chave-admin' } });
  assert.equal(r.status, 200); assert.match(r.j.token, /^[a-f0-9]{64}$/); assert.ok(r.j.exp - Date.now() > 11 * 36e5 && r.j.exp - Date.now() <= 12 * 36e5);
  const h = { 'x-admin-token': r.j.token };
  assert.equal((await call('/api/admin/overview', { headers: h })).status, 200);
  assert.equal((await call('/api/admin/ping', { headers: h })).status, 200);
  assert.equal((await call('/api/admin/logout', { headers: h, body: {} })).status, 200);
  assert.equal((await call('/api/admin/overview', { headers: h })).status, 401, 'token encerrado');
  const page = await fetch(U + '/admin'); assert.equal(page.status, 200);
  assert.match(page.headers.get('x-robots-tag'), /noindex/); assert.match(page.headers.get('cache-control'), /no-store/);
  assert.match(await page.text(), /admin\.js/);
  for (const f of ['/admin.js', '/admin.css']) assert.equal((await fetch(U + f)).status, 200, f);
});

test('admin: visão geral, lista com busca/filtro/ordem/página e detalhe do aluno (nomes maliciosos ficam como texto)', async () => {
  await reg('xss-admin@t.com', '<img src=x onerror=alert(1)>'); const v = await reg('lista1@t.com', 'Zeca Lista'); await reg('lista2@t.com', 'Ana Lista');
  assert.equal((await doLesson(v, lessons.find(l => l.id === 'py-1-01'))).j.ok, true);
  await call('/api/track', { token: v, body: { track: 'python' } });
  const o = (await A('overview')).j;
  assert.ok(o.counts.total >= 4 && o.counts.verified >= 1); assert.equal(o.series.length, 30); assert.ok(o.new.today >= 4);
  assert.ok(o.series[29].signups >= 4, 'cadastros de hoje aparecem no último ponto do gráfico'); assert.ok(o.series[29].active >= 1);
  assert.equal(o.funnel[0][0], 'Cadastros'); assert.equal(o.funnel[0][1], o.counts.total); assert.ok(o.totals.lessonsDone >= 1 && o.totals.xp >= 1);
  assert.ok(Array.isArray(o.recent) && o.recent.length <= 10 && o.recent[0].email, 'últimos cadastros');
  assert.ok(!JSON.stringify(o).includes('"pass"'), 'nada de senha no painel');

  let l = (await A('users?q=lista')).j; assert.equal(l.total, 2); assert.deepEqual(l.rows.map(r => r.name).sort(), ['Ana Lista', 'Zeca Lista']);
  l = (await A('users?q=lista&sort=name&dir=asc')).j; assert.deepEqual(l.rows.map(r => r.name), ['Ana Lista', 'Zeca Lista']);
  l = (await A('users?q=lista&sort=lessons&dir=desc')).j; assert.equal(l.rows[0].name, 'Zeca Lista'); assert.equal(l.rows[0].lessons, 1); assert.equal(l.rows[0].track, 'python');
  assert.equal((await A('users?q=lista&status=started')).j.total, 1); assert.equal((await A('users?q=lista&status=never')).j.total, 1);
  assert.equal((await A('users?q=lista&track=python')).j.total, 1); assert.equal((await A('users?q=lista&track=none')).j.total, 1);
  l = (await A('users?size=5&page=1')).j; assert.equal(l.rows.length, 5); assert.ok(l.pages >= 1 && l.size === 5);
  assert.equal((await A('users?page=9999')).j.page, (await A('users')).j.pages, 'página fora do limite volta para a última');
  assert.equal((await A('users?sort=__proto__&dir=asc')).status, 200, 'ordenação inválida não quebra');
  const x = (await A('users?q=xss-admin')).j.rows[0]; assert.equal(x.name, '<img src=x onerror=alert(1)>', 'o dado vem cru: a tela é quem escapa');
  const d = (await A('users/' + x.id)).j; assert.equal(d.email, 'xss-admin@t.com'); assert.equal(d.byTrack.python.levels.length, 3); assert.equal(d.byTrack.python.levels[0].total, 30);
  assert.ok(!('pass' in d), 'detalhe sem senha'); assert.equal((await A('users/nao-existe')).status, 404); assert.equal((await A('users/__proto__')).status, 404);
  const ui = await (await fetch(U + '/admin.js')).text(); assert.match(ui, /const esc = /, 'a tela escapa texto dos usuários');
  assert.ok(!/\$\{\s*(u|r|c|x)\.(name|email|note)\s*\}/.test(ui), 'nenhum nome/e-mail/nota entra no HTML sem esc()');
});

test('admin: liberar curso tira os bloqueios daquele curso (inclusive a prova), mas não conclui nada de graça', async () => {
  const tk = await reg('liberar@t.com', 'Lia Liberada'), id = await uidOf('liberar@t.com');
  assert.equal((await call('/api/lessons/py-1-20', { token: tk })).status, 409, 'antes: bloqueada por sequência');
  assert.equal((await call('/api/lessons/fin-py-1', { token: tk })).status, 409);
  assert.deepEqual((await call('/api/me', { token: tk })).j.unlocked, {});
  assert.equal((await act(id, { action: 'unlock', tracks: ['xx'], on: true })).status, 400, 'curso inválido');
  assert.equal((await act(id, { action: 'unlock', tracks: [], on: true })).status, 400);
  let r = (await act(id, { action: 'unlock', tracks: ['python'], on: true })).j;
  assert.equal(r.user.byTrack.python.unlocked, true); assert.equal(r.user.byTrack.sql.unlocked, false); assert.deepEqual(r.user.unlock, ['python']);
  assert.equal((await call('/api/me', { token: tk })).j.unlocked.python, true);
  assert.equal((await call('/api/lessons/py-1-20', { token: tk })).status, 200, 'depois: abre qualquer lição');
  assert.equal((await call('/api/lessons/py-3-30', { token: tk })).status, 200, 'inclusive de outros níveis');
  const lk = (await call('/api/lessons', { token: tk })).j; assert.ok(lk.filter(x => x.track === 'python').every(x => x.lock === null), 'nenhum cadeado em Python');
  assert.ok(lk.some(x => x.track === 'sql' && x.lock), 'SQL continua com cadeado (só Python foi liberado)');
  assert.equal((await call('/api/lessons/sql-1-12', { token: tk })).status, 409);
  assert.equal((await doLesson(tk, lessons.find(l => l.id === 'py-1-07'))).j.ok, true, 'faz a lição fora de ordem');
  assert.equal((await call('/api/lessons/fin-py-1', { token: tk })).status, 200, 'prova final sem ter feito as 30 lições');
  assert.equal((await call('/api/lessons/cp-py-1-20', { token: tk })).status, 200, 'checkpoint também abre');
  assert.equal((await call('/api/me', { token: tk })).j.passed['python-1'], undefined, 'liberar não aprova a prova final');
  r = (await act(id, { action: 'unlock', tracks: 'all', on: true })).j; assert.deepEqual(r.user.unlock.sort(), ['dados', 'excel', 'powerbi', 'python', 'sql']);
  assert.equal((await call('/api/lessons/sql-1-12', { token: tk })).status, 200, 'agora SQL também');
  assert.equal((await A('users?status=unlocked&q=liberar')).j.total, 1);
  r = (await act(id, { action: 'unlock', tracks: 'all', on: false })).j; assert.deepEqual(r.user.unlock, []);
  assert.equal((await call('/api/lessons/py-1-22', { token: tk })).status, 409, 'tirou a liberação: voltam os bloqueios');
  assert.equal((await A('users?status=unlocked&q=liberar')).j.total, 0);
});

test('admin: com o curso liberado dá para fazer as 3 provas e o curso conclui (não existe mais certificado no painel)', async () => {
  const tk = await reg('certadm@t.com', 'Cris Concluida'), id = await uidOf('certadm@t.com');
  await act(id, { action: 'unlock', tracks: ['python'], on: true });
  let r; for (const lv of [1, 2, 3]) { r = (await doFinal(tk, 'python', lv)).j; assert.equal(r.ok, true, 'nível ' + lv); }
  assert.equal(r.trackComplete, true, 'as 3 provas finais concluem o curso');
  assert.equal((await A('certs?q=cris')).status, 404, 'a lista de certificados do painel foi removida');
  const ov = (await A('overview')).j; assert.equal(ov.totals.certs, undefined);
});

test('admin: suspender derruba as sessões e impede login; reativar volta ao normal', async () => {
  const t1 = await reg('banido@t.com', 'Beto Banido'), t2 = (await lgn({ email: 'banido@t.com', password: 'segredo1' })).j.token, id = await uidOf('banido@t.com');
  assert.equal((await A('users/' + id)).j.sessions, 2);
  const r = (await act(id, { action: 'ban', reason: 'spam' })).j; assert.equal(r.user.banned.reason, 'spam');
  for (const t of [t1, t2]) assert.equal((await call('/api/me', { token: t })).status, 401, 'sessões encerradas');
  const lg = await lgn({ email: 'banido@t.com', password: 'segredo1' }); assert.equal(lg.status, 403); assert.equal(lg.j.banned, true); assert.match(lg.j.error, /suspensa/); assert.match(lg.j.error, /ajuda@teste\.com/);
  const link = (await act(id, { action: 'reset-link' })).j.link; assert.match(link, /\?reset=[a-f0-9]{64}$/);
  assert.equal((await call('/api/reset', { body: { token: link.split('=')[1], password: 'outrasenha1' } })).status, 403, 'nem recuperando a senha a conta suspensa entra');
  assert.equal((await lgn({ email: 'banido@t.com', password: 'outrasenha1' })).status, 401, 'a senha não mudou (a recuperação foi recusada); senha errada não revela que a conta está suspensa');
  assert.equal((await A('users?status=banned&q=banido')).j.total, 1); assert.ok((await A('overview')).j.counts.banned >= 1);
  await act(id, { action: 'unban' });
  const ok = await lgn({ email: 'banido@t.com', password: 'segredo1' }); assert.equal(ok.status, 200, 'reativada volta a entrar (a senha não mudou)');
  assert.equal((await call('/api/me', { token: ok.j.token })).status, 200); assert.equal((await A('users/' + id)).j.banned, null);
});

test('admin: ações de suporte (nome, XP, nota, confirmar e-mail, zerar nível, encerrar sessões) e exclusão só digitando o e-mail', async () => {
  const j = (await call('/api/register', { body: { name: 'Sara Suporte', email: 'sup@t.com', password: 'segredo1', accept: true } })).j, tk = j.token, id = await uidOf('sup@t.com');
  assert.equal((await A('users/' + id)).j.verified, false);
  assert.equal((await act(id, { action: 'resend-verify' })).status, 200);
  assert.equal((await act(id, { action: 'verify' })).j.user.verified, true); assert.equal((await act(id, { action: 'resend-verify' })).status, 409, 'já confirmado');
  assert.equal((await call('/api/me', { token: tk })).j.verified, true);
  assert.equal((await act(id, { action: 'rename', name: '   ' })).status, 400); assert.equal((await act(id, { action: 'rename', name: 'Sara S.' })).j.user.name, 'Sara S.');
  assert.equal((await call('/api/me', { token: tk })).j.name, 'Sara S.');
  assert.equal((await act(id, { action: 'xp', mode: 'set', value: 500 })).j.user.xp, 500); assert.equal((await act(id, { action: 'xp', mode: 'add', value: -100 })).j.user.xp, 400);
  assert.equal((await act(id, { action: 'xp', mode: 'add', value: -9999 })).j.user.xp, 0, 'XP nunca fica negativo');
  assert.equal((await act(id, { action: 'xp', mode: 'add', value: 'abc' })).status, 400); assert.equal((await act(id, { action: 'xp', mode: 'set', value: 1e9 })).status, 400);
  assert.equal((await act(id, { action: 'note', text: 'Pediu ajuda no WhatsApp' })).j.user.note, 'Pediu ajuda no WhatsApp');
  await doLevelLessons(tk, 'python', 1);
  assert.equal((await A('users/' + id)).j.byTrack.python.levels[0].done, 30);
  assert.equal((await act(id, { action: 'reset-level', track: 'python', level: 1 })).j.user.byTrack.python.levels[0].done, 0, 'zerou o nível 1');
  assert.equal((await act(id, { action: 'reset-level', track: 'python', level: 7 })).status, 400); assert.equal((await act(id, { action: 'reset-level', track: 'java', level: 1 })).status, 400);
  assert.equal((await act(id, { action: 'logout' })).status, 200); assert.equal((await call('/api/me', { token: tk })).status, 401);
  assert.equal((await act(id, { action: 'dança' })).status, 400, 'ação desconhecida');
  assert.equal((await act(id, { action: 'delete', confirm: 'outro@t.com' })).status, 400); assert.equal((await A('users/' + id)).status, 200, 'e-mail errado não exclui');
  assert.equal((await act(id, { action: 'delete', confirm: ' SUP@t.com ' })).j.deleted, true);
  assert.equal((await A('users/' + id)).status, 404); assert.equal((await lgn({ email: 'sup@t.com', password: 'segredo1' })).status, 401);
});

test('admin: cadastros fechados (e-mail e Google), comunicado do dono e modo livre; tudo volta ao normal ao desligar', async () => {
  // cadastros
  let s = await setSettings({ signupsOpen: false }); assert.equal(s.signupsOpen, false);
  const closed = await call('/api/register', { body: { name: 'Novo', email: 'fechado@t.com', password: 'segredo1', accept: true } }); assert.equal(closed.status, 403); assert.match(closed.j.error, /fechados/);
  assert.equal((await call('/api/google', { body: { credential: gtok({ email: 'fechado-g@t.com', sub: 'g-fechado', name: 'Fechado G' }), accept: true } })).status, 403, 'nem pelo Google');
  assert.equal((await lgn({ email: 'liberar@t.com', password: 'segredo1' })).status, 200, 'quem já tem conta continua entrando');
  s = await setSettings({ signupsOpen: true }); assert.equal(s.signupsOpen, true);
  assert.equal((await call('/api/register', { body: { name: 'Novo', email: 'fechado@t.com', password: 'segredo1', accept: true } })).status, 200);

  // comunicado
  assert.equal((await A('settings', { announce: { on: true, text: '   ', kind: 'info' } })).status, 400, 'não publica texto vazio');
  assert.equal((await call('/api/config')).j.announce, null);
  await setSettings({ announce: { on: true, text: 'Manutenção às 22h <b>hoje</b>', kind: 'warn' } });
  const a1 = (await call('/api/config')).j.announce; assert.equal(a1.text, 'Manutenção às 22h <b>hoje</b>'); assert.equal(a1.kind, 'warn'); assert.ok(a1.id > 0);
  await new Promise(r => setTimeout(r, 5)); await setSettings({ announce: { on: true, text: 'Novo texto', kind: 'nope' } });
  const a2 = (await call('/api/config')).j.announce; assert.equal(a2.kind, 'info', 'tipo inválido vira informação'); assert.ok(a2.id > a1.id, 'texto novo = aviso novo (quem fechou o antigo vê de novo)');
  await setSettings({ announce: { on: false, text: 'Novo texto', kind: 'info' } }); assert.equal((await call('/api/config')).j.announce, null);
  const long = await setSettings({ announce: { on: true, text: 'x'.repeat(900), kind: 'ok' } }); assert.equal(long.announce.text.length, 280); await setSettings({ announce: { on: false, text: '', kind: 'info' } });

  // modo livre para todos
  const tk = await reg('livre@t.com', 'Livia Livre');
  assert.equal((await call('/api/lessons/py-1-20', { token: tk })).status, 409);
  s = await setSettings({ unlockAll: { on: true, days: 7 } }); assert.equal(s.unlockAll.on, true); assert.ok(Date.parse(s.unlockAll.until) - Date.now() > 6.9 * 864e5);
  assert.equal((await call('/api/lessons/py-1-20', { token: tk })).status, 200, 'modo livre abre para todos'); assert.equal((await call('/api/lessons/sql-3-30', { token: tk })).status, 200);
  assert.equal((await call('/api/lessons/fin-sql-1', { token: tk })).status, 200);
  const me = (await call('/api/me', { token: tk })).j; assert.deepEqual(Object.keys(me.unlocked).sort(), ['dados', 'excel', 'powerbi', 'python', 'sql']);
  assert.equal((await A('overview')).j.settings.unlockAll.on, true);
  s = await setSettings({ unlockAll: { on: false } }); assert.equal(s.unlockAll.on, false);
  assert.equal((await call('/api/lessons/py-1-20', { token: tk })).status, 409, 'desligou: bloqueios voltam');
  s = await setSettings({ unlockAll: { on: true, days: 0 } }); assert.equal(s.unlockAll.until, null, 'sem prazo'); await setSettings({ unlockAll: { on: false } });
  assert.equal((await A('settings', {})).status, 400, 'nada para salvar');
});

test('admin: cursos ativos no aplicativo: desligar esconde e bloqueia o curso (mesmo com tudo liberado), religar volta ao normal e o último curso não desliga', async () => {
  const tk = await reg('cursos-onoff@t.com', 'Cris Cursos');
  assert.deepEqual((await call('/api/config')).j.courses, { python: true, sql: true, excel: true, powerbi: true, dados: true }, 'começa tudo ativo');
  const painel = (await A('settings')).j.courses; assert.deepEqual(painel.map(c => c.id), ['python', 'sql', 'excel', 'powerbi', 'dados']);
  assert.ok(painel.every(c => c.on === true && c.lessons > 0 && typeof c.students === 'number' && c.name), 'o painel lista nome, lições e alunos de cada curso');
  assert.equal((await call('/api/track', { token: tk, body: { track: 'excel' } })).status, 200);
  assert.equal((await call('/api/lessons/xl-1-01', { token: tk })).status, 200, 'Excel aberto');

  // validações
  for (const bad of [{ courses: { java: false } }, { courses: { excel: 'nao' } }, { courses: {} }, { courses: [] }, { courses: 'excel' }]) assert.equal((await A('settings', bad)).status, 400, JSON.stringify(bad));
  const all = await A('settings', { courses: { python: false, sql: false, excel: false, powerbi: false, dados: false } }); assert.equal(all.status, 400); assert.match(all.j.error, /pelo menos um curso/);
  assert.equal((await call('/api/config')).j.courses.excel, true, 'pedido inválido não muda nada');

  // desliga o Excel
  let s = await setSettings({ courses: { excel: false } });
  assert.equal(s.courses.find(c => c.id === 'excel').on, false); assert.equal(s.courses.find(c => c.id === 'python').on, true);
  assert.deepEqual((await call('/api/config')).j.courses, { python: true, sql: true, excel: false, powerbi: true, dados: true });
  const r = await call('/api/lessons/xl-1-01', { token: tk }); assert.equal(r.status, 409); assert.equal(r.j.lock, 'off');
  assert.equal((await call('/api/track', { token: tk, body: { track: 'excel' } })).status, 409, 'ninguém escolhe curso desligado');
  assert.equal((await call('/api/lessons/py-1-01', { token: tk })).status, 200, 'os outros cursos seguem normais');
  const lk = (await call('/api/lessons', { token: tk })).j; assert.ok(lk.filter(x => x.track === 'excel').every(x => x.lock === 'off'), 'todas as lições do Excel aparecem como desligadas');
  assert.ok(lk.filter(x => x.track === 'python').every(x => x.lock !== 'off'));
  // nem o modo livre nem a liberação individual religam um curso desligado
  await setSettings({ unlockAll: { on: true, days: 0 } });
  assert.equal((await call('/api/lessons/xl-1-30', { token: tk })).status, 409, 'modo livre não abre curso desligado');
  assert.equal((await call('/api/lessons/py-1-30', { token: tk })).status, 200);
  await setSettings({ unlockAll: { on: false } });
  assert.equal((await A('users/' + (await uidOf('cursos-onoff@t.com')) + '/action', { action: 'unlock', tracks: ['excel'], on: true })).status, 200);
  assert.equal((await call('/api/lessons/xl-1-30', { token: tk })).status, 409, 'liberação individual também não');
  assert.ok((await A('audit')).j.rows.some(x => /curso Excel desativado/.test(JSON.stringify(x))), 'a mudança fica no registro de ações do painel');

  // não deixa desligar o último ativo
  await setSettings({ courses: { sql: false, powerbi: false, dados: false } });
  const last = await A('settings', { courses: { python: false } }); assert.equal(last.status, 400);
  assert.equal((await call('/api/lessons/py-1-01', { token: tk })).status, 200);

  // religa
  s = await setSettings({ courses: { excel: true, sql: true, powerbi: true, dados: true } }); assert.ok(s.courses.every(c => c.on));
  assert.deepEqual((await call('/api/config')).j.courses, { python: true, sql: true, excel: true, powerbi: true, dados: true });
  assert.equal((await call('/api/lessons/xl-1-30', { token: tk })).status, 200, 'liberação individual volta a valer ao religar');
  assert.equal((await call('/api/track', { token: tk, body: { track: 'excel' } })).status, 200);
});

test('telas: a aba Cursos tem o visual de lista (busca, categorias, ilha com logo) e o admin tem o card "Cursos do aplicativo"; ninguém vê mais "trilha" nem certificado', async () => {
  const app = await (await fetch(U + '/app.js')).text(), css = await (await fetch(U + '/style.css')).text(), adm = await (await fetch(U + '/admin.js')).text();
  for (const k of ['crtop', 'crbust', 'island(', 'courseRow', 'soonRow', 'cfilter', 'ACTIVE', 'Buscar curso']) assert.ok(app.includes(k), 'app.js tem ' + k);
  for (const k of ['.crl .cr', '.crisl', '.crc button', '.bub', '.crs']) assert.ok(css.includes(k), 'style.css tem ' + k);
  assert.match(adm, /Cursos do aplicativo/); assert.match(adm, /data-course/); assert.match(adm, /layers:/, 'o ícone usado no card existe');
  assert.ok(!/certificad/i.test(app), 'o certificado saiu do app'); assert.ok(!/\btrilhas?\b/i.test(app.replace(/\/\/.*$/gm, '').replace(/['"`]\w*trilha\w*['"`]/g, '')), 'a palavra trilha não aparece para o aluno');
});

test('admin: anúncios (AdSense) pelo painel: IDs validados, liga/desliga, ads.txt, meta tag e CSP seguem o que foi salvo; o painel manda mais que o ambiente e "voltar ao padrão" limpa', async () => {
  const cfg = async () => (await call('/api/config')).j.ads, csp = async () => (await fetch(U + '/')).headers.get('content-security-policy'), home = async () => (await fetch(U + '/')).text();
  const ID = 'ca-pub-1234567890123456';
  // começa desligado (o servidor de teste não tem ADSENSE_*)
  assert.equal(await cfg(), null); assert.equal((await call('/ads.txt')).status, 404); assert.ok(!/googlesyndication/.test(await csp())); assert.ok(!/google-adsense-account/.test(await home()));
  assert.deepEqual((await A('settings')).j.ads, { on: false, client: '', slot: '', from: 'nenhum', adsTxt: '' });
  // validações: ID torto, HTML colado, bloco com letras, ligar sem ID
  for (const [ads, re] of [[{ on: true, client: 'ca-pub-12' }, /ID do editor/], [{ on: true, client: '<script>alert(1)</script>' }, /ID do editor/], [{ on: true, client: ID, slot: 'abc' }, /bloco/], [{ on: true, client: '' }, /Para ligar/]]) {
    const r = await A('settings', { ads }); assert.equal(r.status, 400, JSON.stringify(ads)); assert.match(r.j.error, re);
  }
  assert.equal(await cfg(), null, 'pedido recusado não muda nada');
  // fase de aprovação do Google: só o ID do editor (aceita sem o "ca-") → ads.txt, meta tag e CSP; sem bloco ainda não há quadros
  let r = await A('settings', { ads: { on: true, client: ' PUB-1234567890123456 ' } }); assert.equal(r.status, 200);
  assert.deepEqual(r.j.ads, { on: true, client: ID, slot: '', from: 'painel', adsTxt: U + '/ads.txt' });
  assert.deepEqual(await cfg(), { client: ID, slot: '' });
  assert.equal(await (await fetch(U + '/ads.txt')).text(), 'google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0\n');
  assert.match(await home(), /<meta name="google-adsense-account" content="ca-pub-1234567890123456">\s*<\/head>/); assert.match(await csp(), /googlesyndication\.com/);
  // com o ID do bloco
  r = await A('settings', { ads: { on: true, client: ID, slot: '9876543210' } }); assert.deepEqual(await cfg(), { client: ID, slot: '9876543210' });
  const sys = (await A('system')).j; assert.equal(sys.ads, 'on'); assert.equal(sys.adsFrom, 'painel'); assert.equal(sys.adsClient, ID); assert.equal(sys.adsSlot, true);
  // desligar: some do app, da página e da CSP; o ads.txt continua (o Google pode conferir de novo)
  await A('settings', { ads: { on: false, client: ID, slot: '9876543210' } });
  assert.equal(await cfg(), null); assert.ok(!/google-adsense-account/.test(await home())); assert.ok(!/googlesyndication/.test(await csp()));
  assert.equal((await call('/ads.txt')).status, 200); assert.equal((await A('settings')).j.ads.client, ID, 'os IDs ficam guardados');
  // auditoria registra o que mudou
  const au = (await A('audit?limit=60')).j.rows.filter(x => x.action === 'ajustes').map(x => x.detail);
  assert.ok(au.some(d => d.includes(`anúncios ligados (${ID}, bloco 9876543210)`)) && au.some(d => d.includes(`anúncios ligados (${ID}, sem bloco)`)) && au.some(d => d.includes('anúncios desligados')));
  // só o dono mexe: sem credencial ou com sessão de aluno o painel "não existe"
  const aluno = await reg('ads-aluno@t.com');
  assert.equal((await call('/api/admin/settings', { body: { ads: { on: true, client: ID } } })).status, 404);
  assert.equal((await call('/api/admin/settings', { token: aluno, body: { ads: { on: true, client: ID } } })).status, 404);
  assert.equal(await cfg(), null);
  // voltar ao padrão do servidor apaga o ajuste
  r = await A('settings', { ads: { reset: true } }); assert.equal(r.j.ads.from, 'nenhum'); assert.equal(r.j.ads.client, ''); assert.equal((await call('/ads.txt')).status, 404);
  // servidor COM variáveis ADSENSE_*: o painel manda mais; "voltar ao padrão" devolve o ambiente
  const port = PORT + 810, base = 'http://localhost:' + port, d = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'adsp-')), 'data.json'); let lg = '';
  const p = spawn('node', ['server.js'], { cwd: path.join(__dirname, '..'), env: { ...process.env, PORT: port, DATA_FILE: d, BASE_URL: base, ADSENSE_CLIENT: 'ca-pub-1111111111111111', ADSENSE_SLOT: '2222222222', ADMIN_KEY: 'chave-ads-1234567890', DATABASE_URL: '' } });
  p.stdout.on('data', x => lg += x); p.stderr.on('data', x => lg += x);
  try {
    for (let i = 0; i < 150 && !/rodando/.test(lg); i++) await sleep(100);
    const j = async (pth, body, tok) => { const x = await fetch(base + pth, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.55.0.1', ...(tok ? { 'x-admin-token': tok } : {}) }, body: body ? JSON.stringify(body) : undefined }); return { status: x.status, j: await x.json().catch(() => null) }; };
    const tok = (await j('/api/admin/login', { key: 'chave-ads-1234567890' })).j.token, cf = async () => (await j('/api/config')).j.ads;
    assert.deepEqual(await cf(), { client: 'ca-pub-1111111111111111', slot: '2222222222' }); assert.equal((await j('/api/admin/settings', null, tok)).j.ads.from, 'ambiente');
    assert.match(await (await fetch(base + '/')).text(), /content="ca-pub-1111111111111111"/, 'as variáveis do servidor também põem a meta tag');
    await j('/api/admin/settings', { ads: { on: true, client: ID, slot: '3333333333' } }, tok); assert.deepEqual(await cf(), { client: ID, slot: '3333333333' }, 'o que foi salvo no painel vale mais');
    assert.equal(await (await fetch(base + '/ads.txt')).text(), 'google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0\n');
    await j('/api/admin/settings', { ads: { on: false, client: ID } }, tok); assert.equal(await cf(), null, 'desligar no painel desliga mesmo com a variável do servidor');
    const r2 = await j('/api/admin/settings', { ads: { reset: true } }, tok); assert.equal(r2.j.ads.from, 'ambiente'); assert.deepEqual(await cf(), { client: 'ca-pub-1111111111111111', slot: '2222222222' });
  } finally { p.kill(); }
  // o app não desenha quadros sem ID de bloco e o painel tem o cartão
  const app = fs.readFileSync(path.join(__dirname, '..', 'public', 'app.js'), 'utf8'), adm = fs.readFileSync(path.join(__dirname, '..', 'public', 'admin.js'), 'utf8');
  assert.match(app, /const adSlot = \(\) => S\.cfg\.ads && \(S\.cfg\.ads\.preview \|\| S\.cfg\.ads\.slot\)/);
  assert.match(adm, /Anúncios \(Google AdSense\)/); assert.match(adm, /'ad-save'/); assert.match(adm, /'ad-reset'/); assert.match(adm, /data-ad-slot/);
});

test('admin: CSV abre no Excel (BOM, ponto e vírgula), respeita filtros e neutraliza fórmulas', async () => {
  await reg('csv-formula@t.com', '=HYPERLINK("http://x")'); await reg('csv-ok@t.com', 'Carlos; "Csv"');
  const r = await fetch(U + '/api/admin/users.csv?q=csv-', { headers: { 'x-admin-token': await atok() } });
  assert.equal(r.status, 200); assert.match(r.headers.get('content-type'), /text\/csv/); assert.match(r.headers.get('content-disposition'), /attachment; filename="usuarios-codeup-\d{4}-\d{2}-\d{2}\.csv"/);
  const buf = Buffer.from(await r.arrayBuffer()); assert.deepEqual([...buf.subarray(0, 3)], [0xEF, 0xBB, 0xBF], 'BOM para o Excel entender os acentos'); const t = buf.toString('utf8');
  const lines = t.slice(1).split('\r\n'); assert.match(lines[0], /^Nome;E-mail;Cadastro;/); assert.equal(lines.length, 3, 'cabeçalho + 2 usuários filtrados');
  assert.ok(t.includes('"\'=HYPERLINK(""http://x"")"'), 'fórmula vira texto'); assert.ok(!/(^|;)=HYPERLINK/m.test(t), 'nenhuma célula começa com =');
  assert.ok(t.includes('"Carlos; ""Csv"""'), 'ponto e vírgula e aspas escapados');
  assert.equal((await fetch(U + '/api/admin/users.csv')).status, 404, 'sem credencial não baixa');
});

test('admin: aprendizado, sistema e auditoria (registra quem fez o quê, sem guardar senhas)', async () => {
  const tk = await reg('trava@t.com', 'Tito Trava');
  await call('/api/submit', { token: tk, body: { id: 'py-1-01', code: 'print("errado")', out: 'x' } });
  const l = (await A('learning')).j; assert.ok(l.stuck.some(r => r.id === 'py-1-01' && r.stuck >= 1), 'lição com tentativa sem conclusão aparece como "travada"');
  assert.equal(l.exams.length, 9); assert.ok(l.exams.every(e => e.passRate === null || (e.passRate >= 0 && e.passRate <= 100)));
  const sy = (await A('system')).j; assert.equal(sy.db, 'arquivo'); assert.equal(typeof sy.pyServer, 'boolean'); assert.equal(sy.keyFromEnv, true); assert.ok(sy.users >= 1 && sy.memMB > 0 && sy.uptime >= 0);
  assert.ok(!JSON.stringify(sy).includes('chave-admin'), 'a chave nunca aparece no painel');
  const au = (await A('audit?limit=300')).j.rows, acts = new Set(au.map(r => r.action));
  for (const a of ['login', 'login-falhou', 'liberou-curso', 'tirou-liberacao', 'suspendeu', 'reativou', 'excluiu-conta', 'ajustes', 'exportou-csv', 'ajustou-xp', 'zerou-progresso']) assert.ok(acts.has(a), 'auditoria sem "' + a + '"');
  assert.ok(au.every((r, i) => i === 0 || au[i - 1].at >= r.at), 'mais recentes primeiro');
  assert.ok(au.find(r => r.action === 'liberou-curso').target.includes('@t.com'));
  assert.ok(!JSON.stringify(au).includes('segredo1') && !JSON.stringify(au).includes('chave-admin'), 'auditoria não guarda senhas');
  assert.ok((await A('stats')).j.usuarios >= 5, 'rota antiga continua');
});

test('admin: com ADMIN_HOST o painel só existe no endereço do admin, e esse endereço não serve o app dos alunos', async () => {
  const http = require('node:http'), port = PORT + 730, d = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'host-')), 'data.json'); let lg = '';
  const p = spawn('node', ['server.js'], { cwd: path.join(__dirname, '..'), env: { ...process.env, PORT: port, DATA_FILE: d, BASE_URL: 'http://localhost:' + port, ADMIN_KEY: 'chave-host', ADMIN_HOST: 'https://Painel.Exemplo.com/', DATABASE_URL: '' } });
  p.stdout.on('data', x => lg += x); p.stderr.on('data', x => lg += x);
  // o fetch do Node não deixa trocar o cabeçalho Host; por isso http.request
  const rq = (host, pth, body) => new Promise((ok, bad) => {
    const r = http.request({ host: '127.0.0.1', port, path: pth, method: body ? 'POST' : 'GET', headers: { Host: host, ...(body ? { 'Content-Type': 'application/json' } : {}) } }, resp => { let b = ''; resp.on('data', c => b += c); resp.on('end', () => { let j = null; try { j = JSON.parse(b); } catch { } ok({ status: resp.statusCode, loc: resp.headers.location, j }); }); });
    r.on('error', bad); if (body) r.write(JSON.stringify(body)); r.end();
  });
  try {
    for (let i = 0; i < 200 && !/Painel admin:/.test(lg); i++) await sleep(100);
    assert.match(lg, /Painel admin: http:\/\/painel\.exemplo\.com\/admin/, 'o terminal mostra o endereço do painel: ' + lg);
    const pub = 'localhost:' + port;
    assert.equal((await rq(pub, '/')).status, 200); assert.equal((await rq(pub, '/api/config')).status, 200);
    for (const x of ['/admin', '/admin/', '/admin.html', '/admin.js', '/admin.css', '/api/admin/ping', '/api/admin/overview']) assert.equal((await rq(pub, x)).status, 404, 'no site público: ' + x);
    assert.equal((await rq(pub, '/api/admin/login', { key: 'chave-host' })).status, 404, 'nem o login do painel existe no site público');
    assert.equal((await rq('painel.exemplo.com.outro.com', '/admin')).status, 404, 'endereço parecido não vale');
    for (const host of ['painel.exemplo.com', 'PAINEL.exemplo.com:443']) {
      const r = await rq(host, '/'); assert.equal(r.status, 302); assert.equal(r.loc, '/admin');
      for (const x of ['/admin', '/admin.js', '/admin.css', '/icons/icon-192.png', '/health']) assert.equal((await rq(host, x)).status, 200, host + ' ' + x);
      for (const x of ['/api/config', '/app.js', '/termos', '/api/me']) assert.equal((await rq(host, x)).status, 404, 'no endereço do painel não existe: ' + x);
      for (const x of ['/api/login', '/api/register']) assert.equal((await rq(host, x, { email: 'a@b.com', password: 'x' })).status, 404, x);
    }
    assert.equal((await rq('painel.exemplo.com', '/api/admin/login', { key: 'errada' })).status, 401);
    const ok = await rq('painel.exemplo.com', '/api/admin/login', { key: 'chave-host' }); assert.equal(ok.status, 200); assert.match(ok.j.token, /^[a-f0-9]{64}$/);
    const ping = await new Promise((res, bad) => { const r = http.request({ host: '127.0.0.1', port, path: '/api/admin/system', headers: { Host: 'painel.exemplo.com', 'x-admin-token': ok.j.token } }, resp => { let b = ''; resp.on('data', c => b += c); resp.on('end', () => res({ status: resp.statusCode, j: JSON.parse(b) })); }); r.on('error', bad); r.end(); });
    assert.equal(ping.status, 200); assert.equal(ping.j.adminHost, 'painel.exemplo.com', 'a aba Sistema mostra o endereço configurado (sem https:// nem barra)');
  } finally { if (p.exitCode === null) { p.kill(); await new Promise(r => p.once('exit', r)); } }
});

test('liberação chega a quem está com o app aberto: API nunca é guardada em cache e o app confere sozinho (ao voltar para a aba e a cada minuto)', async () => {
  const tk = await reg('aberto@teste.com');
  const me = await call('/api/me', { token: tk }); assert.match(me.r.headers.get('cache-control') || '', /no-store/, '/api/me não pode ser servida do cache do navegador');
  assert.match((await call('/api/lessons', { token: tk })).r.headers.get('cache-control') || '', /no-store/);
  assert.match((await call('/api/config')).r.headers.get('cache-control') || '', /no-store/);
  const app = fs.readFileSync(path.join(__dirname, '..', 'public', 'app.js'), 'utf8');
  assert.match(app, /async function syncAccess/, 'o app confere liberações sozinho');
  assert.match(app, /visibilitychange[\s\S]{0,120}syncAccess/, 'ao voltar para o app');
  assert.match(app, /setInterval\(\(\) => syncAccess\(\), 60e3\)/, 'e de minuto em minuto');
  assert.match(app, /if \(syncing \|\| !S\.tk \|\| !S\.me \|\| document\.hidden \|\| !\$\('\.nav'\)\) return/, 'nunca interrompe uma lição ou prova em andamento');
  const sw = fs.readFileSync(path.join(__dirname, '..', 'public', 'sw.js'), 'utf8');
  assert.match(sw, /codeup-v(2[3-9]|[3-9]\d)/, 'versão do cache do app foi trocada para quem já tinha a versão antiga instalada');
});

test('exemplos de SQL: organizados em linhas (nada escondido atrás de rolagem), texto do comando intacto e legenda "Como ler"', async () => {
  const { fmtSql, sqlParts } = require('../public/fmt.js');
  const todas = [...lessons, ...lessons.tests].filter(l => l.type === 'sql'); let n = 0;
  for (const l of todas) for (const f of ['example', 'solution']) {
    const s = l[f]; if (!s) continue; n++;
    const o = fmtSql(s);
    assert.equal(o.replace(/\s+/g, ''), s.replace(/\s+/g, ''), `${l.id}/${f}: o formato não pode mudar o comando`);
    assert.equal(fmtSql(o), o, `${l.id}/${f}: formatar de novo não muda nada`);
    if (/ (FROM|WHERE|JOIN|GROUP BY|ORDER BY) /.test(s) && !/\n/.test(s)) assert.match(o, /\n/, `${l.id}/${f}: comando com várias partes vira várias linhas`);
    for (const ln of o.split('\n')) assert.ok(ln.length <= 60, `${l.id}/${f}: linha comprida demais (${ln.length}): ${ln}`);
  }
  assert.ok(n > 150, 'conferiu os exemplos e as soluções de SQL');
  assert.equal(fmtSql('SELECT p.nome, COUNT(*) FROM vendas v JOIN produtos p ON p.id = v.produto_id GROUP BY p.nome'),
    'SELECT p.nome, COUNT(*)\nFROM vendas v\nJOIN produtos p ON p.id = v.produto_id\nGROUP BY p.nome');
  assert.equal(fmtSql('WITH altos AS (SELECT * FROM funcionarios WHERE salario > 8000) SELECT nome FROM altos'),
    'WITH altos AS (\n  SELECT *\n  FROM funcionarios\n  WHERE salario > 8000\n)\nSELECT nome\nFROM altos');
  assert.equal(fmtSql("UPDATE produtos SET preco = 100 WHERE id = 2;"), 'UPDATE produtos\nSET preco = 100\nWHERE id = 2;');
  assert.equal(fmtSql("SELECT 'a  b' FROM t"), "SELECT 'a  b'\nFROM t", 'texto entre aspas não é mexido');
  assert.equal(fmtSql('SELECT (1 + FROM'), 'SELECT (1 + FROM', 'parênteses quebrados: devolve o original');
  assert.equal(fmtSql('SELECT *\n  FROM t'), 'SELECT *\n  FROM t', 'o que já está em várias linhas fica como o autor escreveu');
  assert.deepEqual(sqlParts('SELECT nome FROM produtos WHERE preco > 10 ORDER BY nome').map(p => p.k), ['SELECT', 'FROM', 'WHERE', 'ORDER BY']);
  assert.deepEqual(sqlParts("SELECT 'from where' FROM t LEFT JOIN u ON u.id = t.id").map(p => p.k), ['SELECT', 'FROM', 'JOIN', 'ON']);
  // o app usa isso nos exemplos e nas soluções, e entrega o arquivo
  const app = fs.readFileSync(path.join(__dirname, '..', 'public', 'app.js'), 'utf8'), html = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8'), sw = fs.readFileSync(path.join(__dirname, '..', 'public', 'sw.js'), 'utf8');
  assert.match(app, /codeBox = \(code, type, label\) => \{\s*const txt = niceSql\(code, type\)/);
  assert.match(app, /hl\(niceSql\(S\.cur\.solution, S\.cur\.type\), S\.cur\.type\)/);
  assert.ok(html.indexOf('/fmt.js') > 0 && html.indexOf('/fmt.js') < html.indexOf('/app.js'), 'fmt.js carrega antes do app.js');
  assert.match(sw, /'\/fmt\.js'/); assert.match(sw, /codeup-v(2[4-9]|[3-9]\d)/);
  const r = await fetch(U + '/fmt.js'); assert.equal(r.status, 200); assert.match(await r.text(), /function fmtSql/);
});

test('prática: o botão Concluído fica fixo no rodapé e nada é executado nem mostrado enquanto o aluno digita (resultado, erro e dicas só depois de Concluído)', async () => {
  const dir = path.join(__dirname, '..', 'public'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8'), css = fs.readFileSync(path.join(dir, 'style.css'), 'utf8');
  const pr = app.slice(app.indexOf('function practice()'), app.indexOf('function hint()'));
  assert.ok(!/addEventListener\('input'/.test(pr), 'digitar não dispara execução');
  assert.ok(!/liveSoon|liveNow|async function live\(/.test(app), 'a execução automática ao digitar foi removida');
  assert.match(app, /e\.key == 'Enter'\) \{ e\.preventDefault\(\); concluir\(\); \}/, 'Ctrl+Enter é o mesmo que tocar em Concluído');
  assert.match(pr, /<\/div>\s*<div class=dbar><button class="btn ok block" id=bdone onclick=concluir\(\)>/, 'o botão fica numa barra própria, fora do conteúdo que cresce e encolhe');
  assert.ok(pr.indexOf('id=fb') < pr.indexOf('class=dbar'), 'o aviso de erro/dica fica no conteúdo, acima do botão, e não dentro da barra');
  assert.match(pr, /OUT0/); assert.match(app, /O resultado do seu código aparece aqui depois que você tocar em <b>Concluído<\/b>/);
  assert.match(css, /\.dbar\{position:fixed;left:0;right:0;bottom:0;/, 'barra presa ao rodapé da tela');
  assert.match(css, /\.dbar \.btn,\.dbar \.btn:hover,\.dbar \.btn:active\{transform:none/, 'o botão não sobe nem desce ao passar o mouse ou apertar');
  assert.ok(!/\.fb\{position:sticky/.test(css) && !/\.dbar \.fb/.test(css), 'o aviso não cresce por cima do editor');
  assert.match(css, /\.c\.pr\{padding-bottom:calc\(112px/, 'o fim da página não fica escondido atrás do botão');
  assert.match(app, /function concluir\(\)|async function concluir\(\)/); assert.match(app, /Conferindo…/);
  assert.match(fs.readFileSync(path.join(dir, 'sw.js'), 'utf8'), /codeup-v(2[7-9]|[3-9]\d)/, 'versão nova do cache para o app atualizar');
});

test('anúncios: o aluno não escolhe o tipo — sempre não personalizados, carregam direto, aviso só informativo (um botão) e escondido na lição/prova', async () => {
  const dir = path.join(__dirname, '..'), app = fs.readFileSync(path.join(dir, 'public', 'app.js'), 'utf8'), css = fs.readFileSync(path.join(dir, 'public', 'style.css'), 'utf8');
  const ad = app.slice(app.indexOf('function adNotice()'), app.indexOf('// ====', app.indexOf('function adNotice()')));
  assert.ok(ad.length > 200, 'trecho dos anúncios encontrado');
  assert.ok(!/ckA|ckN|Aceitar anúncios personalizados|Só anúncios não personalizados|adConsent/.test(app), 'não existe mais botão para escolher o tipo de anúncio');
  assert.equal((ad.match(/<button/g) || []).length, 1, 'o aviso tem um botão só'); assert.match(ad, /id=ckOk>Entendi</);
  assert.match(ad, /window\.adsbygoogle\.requestNonPersonalizedAds = 1;/, 'sempre pede anúncios não personalizados');
  assert.ok(!/if \(adPref\(\) ==|adPref\(\)\) return/.test(ad), 'carregar os anúncios não depende de nenhuma escolha');
  assert.ok(ad.indexOf('adNotice();') < ad.indexOf('createElement(\'script\')'), 'o aviso é mostrado, mas o script do Google carrega sem esperar clique');
  assert.match(css, /body\[data-calm\] \.cookie\{display:none\}/, 'o aviso some durante a prática e a prova');
  for (const f of ['termos', 'privacidade']) { const t = fs.readFileSync(path.join(dir, 'legal', f + '.html'), 'utf8'); assert.ok(!/você escolhe|Só ligam se você aceitar|escolhe entre anúncios/.test(t), f + ': não promete escolha ao aluno'); assert.match(t, /não personalizados/); }
  // o que a API entrega ao app não traz nenhuma opção de tipo de anúncio
  const tk = await atok();
  try {
    await call('/api/admin/settings', { method: 'POST', headers: { 'x-admin-token': tk }, body: { ads: { on: true, client: 'ca-pub-1234567890123456', slot: '9876543210' } } });
    const cfg = (await call('/api/config')).j.ads; assert.deepEqual(Object.keys(cfg).sort(), ['client', 'slot']);
  } finally { await call('/api/admin/settings', { method: 'POST', headers: { 'x-admin-token': tk }, body: { ads: { reset: true } } }); }
});

test('modo teste: fora dele nada aparece; com "npm run teste:demo" começa limpo, e-mail abre na hora, alunos de exemplo entram e "Começar do zero" apaga tudo', async () => {
  // servidor normal: não existe faixa de teste nem rota de apagar
  assert.equal((await call('/api/config')).j.teste, false);
  assert.equal((await call('/api/teste/reset', { method: 'POST', body: {} })).status, 404);
  const wait = async (get, re) => { for (let i = 0; i < 300 && !re.test(get()); i++) await sleep(100); };
  const up = async (port, get) => { for (let i = 0; i < 300; i++) { try { if ((await fetch(`http://localhost:${port}/health`)).ok) return; } catch { } await sleep(100); } throw new Error('o servidor de teste não subiu: ' + get()); };
  const spawnT = (env, args) => { let lg = ''; const p = spawn('node', args, { cwd: path.join(__dirname, '..'), env: { ...process.env, ...env } }); p.stdout.on('data', x => lg += x); p.stderr.on('data', x => lg += x); return { p, log: () => lg }; };
  const stop = async p => { if (p.exitCode === null) { p.kill(); await new Promise(r => p.once('exit', r)); } };
  // em produção a bandeira é ignorada
  const port0 = PORT + 745, d0 = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'prodt-')), 'data.json');
  const pr = spawnT({ NODE_ENV: 'production', CODEUP_TESTE: '1', PORT: port0, DATA_FILE: d0, BASE_URL: 'http://localhost:' + port0, DATABASE_URL: '', ADMIN_KEY: 'x'.repeat(20) }, ['server.js']);
  try {
    await up(port0, pr.log); const c0 = await (await fetch(`http://localhost:${port0}/api/config`)).json();
    assert.equal(c0.teste, false, 'em produção o modo teste nunca liga'); assert.equal((await fetch(`http://localhost:${port0}/api/teste/reset`, { method: 'POST' })).status, 404);
  } finally { await stop(pr.p); }
  // o script de verdade, mesmo com um banco "de verdade" no ambiente (ele precisa ser ignorado)
  const port = PORT + 746, base = `http://localhost:${port}`, T = spawnT({ TESTE_PORT: port, DATABASE_URL: 'postgres://alguem:senha@banco-que-nao-pode-ser-usado.exemplo/db', RESEND_API_KEY: 're_nao_pode_enviar' }, ['tools/teste.js', '--demo']);
  try {
    await wait(T.log, /chave: admin-teste/); await up(port, T.log);
    assert.match(T.log(), /MODO TESTE/); assert.match(T.log(), /Dados em: arquivo/, 'usa só o arquivo de teste, nunca o banco do ambiente');
    const j = async (p, o = {}) => { const r = await fetch(base + p, { method: o.body ? 'POST' : (o.method || 'GET'), headers: { 'Content-Type': 'application/json', ...(o.h || {}) }, body: o.body ? JSON.stringify(o.body) : undefined }); let b = null; try { b = await r.json(); } catch { } return { status: r.status, j: b }; };
    assert.equal((await j('/api/config')).j.teste, true); assert.equal((await j('/api/config')).j.ads.preview, true);
    const adm = (await j('/api/admin/login', { body: { key: 'admin-teste' } })).j.token; assert.ok(adm);
    const lista = async () => (await j('/api/admin/users?size=100', { h: { 'x-admin-token': adm } })).j;
    assert.equal((await lista()).total, 12, 'alunos de exemplo');
    const ent = await j('/api/login', { body: { email: 'marina@exemplo.com', password: 'teste1234' } }); assert.equal(ent.status, 200, 'dá para entrar numa conta de exemplo (senha teste1234)');
    assert.ok(Object.keys((await j('/api/me', { h: { 'x-token': ent.j.token } })).j.done).length >= 30, 'a conta de exemplo já tem lições feitas');
    // cadastro novo: o link de confirmação vem na resposta (nenhum e-mail real sai)
    const r = await j('/api/register', { body: { name: 'Teste Novo', email: 'novo@teste.com', password: 'segredo123', accept: true } });
    assert.equal(r.status, 200); assert.match(r.j.devVerifyLink || '', /\/verificar\?/, 'link de confirmação à mão');
    assert.equal((await j('/api/me', { h: { 'x-token': r.j.token } })).j.verified, false);
    assert.equal((await fetch(r.j.devVerifyLink, { redirect: 'manual' })).status, 302);
    assert.equal((await j('/api/me', { h: { 'x-token': r.j.token } })).j.verified, true, 'e-mail confirmado pelo link');
    // começar do zero
    assert.deepEqual((await j('/api/teste/reset', { body: {} })).j, { ok: true });
    assert.equal((await lista()).total, 0, 'não sobra nenhuma conta');
    assert.equal((await j('/api/me', { h: { 'x-token': r.j.token } })).status, 401, 'as sessões antigas deixam de valer');
    assert.equal((await j('/api/admin/ping', { h: { 'x-admin-token': adm } })).status, 200, 'o painel do dono continua aberto');
    assert.equal((await j('/api/register', { body: { name: 'Depois', email: 'depois@teste.com', password: 'segredo123', accept: true } })).status, 200, 'dá para cadastrar de novo');
  } finally { await stop(T.p); }
  const ui = fs.readFileSync(path.join(__dirname, '..', 'public', 'app.js'), 'utf8');
  assert.match(ui, /S\.cfg && S\.cfg\.teste\) testBar\(\)/); assert.match(ui, /api\/teste\/reset/); assert.match(ui, /r\.devVerifyLink\) \{ toast\('Modo teste/);
  assert.match(ui, /<h1 class=logo aria-label="CodeUp"><b>Code<\/b><span>Up<\/span><\/h1>/, 'o nome na tela é CodeUp'); assert.ok(!/<b>C<\/b><i>U<\/i>/.test(ui), 'o logo CUP de letras soltas saiu da tela');
});

// ---------------- Ranking, nome do personagem e recompensas por XP ----------------
const Rw = require('../public/rewards.js');
const regP = async (email, name, extra = {}) => { const j = (await call('/api/register', { body: { name, email, password: 'segredo1', accept: true, ...extra } })).j; if (j.devVerifyLink) await confirm(j.devVerifyLink); return j.token; };
const setXp = async (email, v) => { const r = await act(await uidOf(email), { action: 'xp', mode: 'set', value: v }); assert.equal(r.status, 200, JSON.stringify(r.j)); };
const rk = async (tk, p = 'geral') => { const r = await call('/api/ranking?p=' + p, { token: tk }); assert.equal(r.status, 200); return { j: r.j, mine: r.j.top.find(x => x.me) || r.j.me.row || null }; };

test('recompensas: a tabela de títulos é crescente, alcançável e a moldura só vale se conquistada', () => {
  const T = Rw.TIERS; assert.equal(T.length, 8); assert.equal(T[0].xp, 0); assert.equal(T[0].frame, null, 'o título inicial não tem moldura');
  for (let i = 1; i < T.length; i++) { assert.ok(T[i].xp > T[i - 1].xp, 'XP exigido sempre cresce'); assert.ok(T[i].frame && /^#[0-9a-f]{6}$/i.test(T[i].color)); }
  assert.equal(new Set(T.map(t => t.key)).size, T.length, 'chaves únicas');
  const maxXp = lessons.reduce((a, l) => a + l.xp, 0) + lessons.checkpoints.reduce((a, c) => a + c.xp, 0) + 2 * (50 + 100 + 150);
  assert.ok(T[T.length - 1].xp <= maxXp, `a Lenda (${T[T.length - 1].xp} XP) precisa ser possível: o curso inteiro dá ${maxXp} XP`);
  assert.equal(Rw.tierOf(0), 0); assert.equal(Rw.tierOf(99), 0); assert.equal(Rw.tierOf(100), 1); assert.equal(Rw.tierOf(4499), 6); assert.equal(Rw.tierOf(4500), 7); assert.equal(Rw.tierOf(1e9), 7);
  assert.equal(Rw.tierOf(-5), 0); assert.equal(Rw.tierOf('abc'), 0); assert.equal(Rw.tierOf(undefined), 0);
  assert.equal(Rw.nextTier(0).key, 'apr'); assert.equal(Rw.nextTier(4500), null);
  assert.equal(Rw.frameOf(1300, 'len'), 4, 'moldura não conquistada cai para a mais alta que a pessoa tem');
  assert.equal(Rw.frameOf(1300, 'apr'), 1, 'moldura menor escolhida é respeitada'); assert.equal(Rw.frameOf(1300, undefined), 4); assert.equal(Rw.frameOf(1300, 'ini'), 4); assert.equal(Rw.frameOf(0, 'len'), 0);
});

test('nome do personagem: cadastro e /api/guide validam e limpam o texto', async () => {
  const tk = await regP('gn1@teste.com', 'Gabi Nome', { sex: 'f', guide: 'tay', gname: '  Luna  ' });
  let me = (await call('/api/me', { token: tk })).j; assert.equal(me.gname, 'Luna'); assert.equal(me.guide, 'tay'); assert.equal(me.sex, 'f');
  const bad = await regP('gn2@teste.com', 'Gabi Dois', { sex: 'm', guide: 'cut', gname: '<b>x</b>' });
  me = (await call('/api/me', { token: bad })).j; assert.equal(me.gname, null, 'nome inválido no cadastro é ignorado (o aluno escolhe de novo)'); assert.equal(me.guide, 'cut');
  const g = body => call('/api/guide', { token: tk, body });
  for (const v of ['A', '', '   ', 'x'.repeat(15), '<img>', 'a;b', '😀😀', '-ab', 'a\nb<']) { const r = await g({ gname: v }); assert.equal(r.status, 400, JSON.stringify(v)); assert.match(r.j.error, /2 a 14 caracteres/); }
  assert.equal((await call('/api/me', { token: tk })).j.gname, 'Luna', 'tentativa inválida não muda o nome');
  assert.equal((await g({ gname: '  Nina   Mel ' })).j.gname, 'Nina Mel', 'espaços repetidos viram um só');
  for (const v of ["D'Artagnan", 'João-Pedro', 'Zé', 'Bit 2', 'Ana.B', 'Ça va', 'X'.repeat(14)]) assert.equal((await g({ gname: v })).j.gname, v.normalize('NFC'), v);
  assert.equal((await g({})).status, 400, 'sem nada para mudar'); assert.equal((await g({ guide: 'outro' })).status, 400); assert.equal((await g({ sex: 'x' })).status, 400);
  assert.equal((await g({ gname: 'Bit' })).j.guide, 'tay', 'mudar só o nome não mexe no personagem');
  assert.equal((await call('/api/guide', { body: { gname: 'Bit' } })).status, 401, 'precisa estar logado');
});

test('molduras: só as conquistadas pelo XP podem ser usadas', async () => {
  const em = 'fr1@teste.com', tk = await regP(em, 'Fran Moldura', { sex: 'f', guide: 'cut', gname: 'Fran' }), g = body => call('/api/guide', { token: tk, body });
  for (const f of ['apr', 'pra', 'len']) { const r = await g({ frame: f }); assert.equal(r.status, 400, f + ' sem XP'); assert.match(r.j.error, /ainda não foi conquistada/); }
  assert.equal((await g({ frame: 'ini' })).status, 400, 'o título inicial não tem moldura'); assert.equal((await g({ frame: 'zzz' })).status, 400); assert.equal((await g({ frame: 7 })).status, 400);
  await setXp(em, 350);
  assert.equal((await g({ frame: 'pra' })).j.frame, 'pra', '350 XP já têm a Prata'); assert.equal((await g({ frame: 'apr' })).j.frame, 'apr');
  assert.equal((await g({ frame: 'des' })).status, 400, 'Ouro pede 700 XP'); assert.equal((await call('/api/me', { token: tk })).j.frame, 'apr', 'erro não troca a moldura');
  assert.equal((await g({ frame: 'auto' })).j.frame, null, '"auto" volta a usar a mais alta');
  await g({ frame: 'pra' }); await setXp(em, 150);                                                 // o dono tirou XP: a moldura escolhida deixou de valer
  assert.equal((await rk(tk)).mine.frame, 1, 'no ranking vale a mais alta que ele realmente tem (Bronze)');
});

test('ranking: mostra só nome + inicial, ordena por XP e desempata por quem chegou primeiro', async () => {
  const mk = async (email, name, xp, extra = {}) => { const t = await regP(email, name, { sex: 'f', guide: 'tay', ...extra }); await setXp(email, xp); return t; };
  const lara = await mk('rk-lara@teste.com', 'Lara Zanetti Quintanilha', 5000, { gname: 'Raio Secreto' });
  const pedro = await mk('rk-pedro@teste.com', 'pedro', 4900);
  const zoe = await mk('rk-zoe@teste.com', 'Zoe Quintela', 4900);
  const a = await rk(lara), p = await rk(pedro), z = await rk(zoe);
  assert.equal(a.mine.name, 'Lara Q.'); assert.equal(p.mine.name, 'Pedro'); assert.equal(z.mine.name, 'Zoe Q.');
  assert.ok(a.mine.pos < p.mine.pos && p.mine.pos < z.mine.pos, 'mais XP primeiro; empate → quem tem a conta mais antiga fica na frente');
  assert.equal(a.mine.xp, 5000); assert.equal(a.mine.tier, 7); assert.equal(a.mine.frame, 7); assert.equal(a.mine.guide, 'tay'); assert.equal(p.mine.tier, 7);
  assert.equal(a.j.me.xp, 5000); assert.equal(a.j.me.hidden, false); assert.equal(a.j.me.pos, a.mine.pos);
  assert.ok(a.j.top.length <= 20 && a.j.total >= 3 && a.j.period === 'geral'); assert.equal(a.j.resets, null, 'o geral nunca zera');
  for (const x of a.j.top) { assert.deepEqual(Object.keys(x).sort(), ['bg', 'color', 'cos', 'frame', 'guide', 'me', 'name', 'pos', 'sticker', 'tier', 'xp']); assert.ok(x.xp > 0); }
  for (let i = 1; i < a.j.top.length; i++) assert.ok(a.j.top[i].xp <= a.j.top[i - 1].xp && a.j.top[i].pos === a.j.top[i - 1].pos + 1, 'lista em ordem e posições seguidas');
  assert.equal(a.j.top.filter(x => x.me).length, 1, 'só uma linha é "você"');
  const txt = JSON.stringify([a.j, p.j, z.j]);
  assert.ok(!/@|teste\.com|Zanetti|Quintanilha|Quintela|Secreto/.test(txt), 'nem e-mail, nem sobrenome inteiro, nem o nome que o aluno deu ao personagem aparecem para os outros');
  assert.equal((await call('/api/ranking')).status, 401, 'precisa estar logado');
});

test('ranking: semana x geral, parâmetro p e o dia em que zera', async () => {
  const em = 'rk-sem@teste.com', tk = await regP(em, 'Sara Semana', { sex: 'f', guide: 'cut', gname: 'Sol' });
  await setXp(em, 400);                                                                           // XP ajustado pelo dono conta no geral, mas não é "ganho nesta semana"
  let s = await rk(tk, 'semana'), g = await rk(tk, 'geral');
  assert.equal(s.j.period, 'semana'); assert.equal(s.mine, null, 'sem XP ganho na semana não entra no ranking semanal'); assert.equal(s.j.me.pos, null); assert.equal(s.j.me.xp, 0);
  assert.equal(g.mine.xp, 400); assert.equal(g.j.me.xp, 400);
  const l = lessons.find(x => x.id === 'py-1-01'); assert.equal((await doLesson(tk, l)).j.ok, true);
  s = await rk(tk, 'semana'); g = await rk(tk, 'geral');
  assert.equal(s.mine.xp, l.xp, 'a semana conta só o XP ganho nas lições'); assert.equal(g.mine.xp, 400 + l.xp);
  assert.equal((await call('/api/me', { token: tk })).j.wk, l.xp);
  assert.ok(s.mine.pos >= 1 && s.mine.pos <= s.j.total);
  const when = new Date(s.j.resets), ms = when - Date.now();
  assert.ok(ms > 0 && ms <= 7 * 864e5, 'zera em até 7 dias'); assert.equal(when.getUTCDay(), 1, 'numa segunda-feira'); assert.equal(when.getUTCHours(), 3, 'à meia-noite de Brasília (UTC-3)'); assert.equal(when.getUTCMinutes(), 0);
  assert.equal((await call('/api/ranking?p=qualquer', { token: tk })).j.period, 'semana', 'valor desconhecido usa a semana');
  assert.equal((await call('/api/ranking', { token: tk })).j.period, 'semana');
});

test('ranking: quem sai, é suspenso, não confirmou o e-mail ou apagou a conta não aparece', async () => {
  const viewerEm = 'rk-viewer@teste.com', viewer = await regP(viewerEm, 'Vera Visão', { sex: 'f', guide: 'tay', gname: 'Vi' }); await setXp(viewerEm, 123);
  const total = async () => (await rk(viewer)).j.total, t0 = await total();
  // sair e voltar
  const oEm = 'rk-out@teste.com', o = await regP(oEm, 'Otávio Fora', { sex: 'm', guide: 'cut', gname: 'Oto' }); await setXp(oEm, 777);
  assert.equal(await total(), t0 + 1); assert.ok((await rk(o)).mine);
  assert.equal((await call('/api/ranking/visibility', { token: o, body: { show: 'sim' } })).status, 400); assert.equal((await call('/api/ranking/visibility', { token: o, body: {} })).status, 400);
  const off = await call('/api/ranking/visibility', { token: o, body: { show: false } }); assert.equal(off.j.rankOff, true);
  let r = await rk(o); assert.equal(r.mine, null); assert.equal(r.j.me.hidden, true); assert.equal(r.j.me.pos, null); assert.equal(r.j.me.xp, 777, 'ele ainda vê o próprio XP'); assert.equal(await total(), t0);
  assert.equal((await call('/api/me', { token: o })).j.rankOff, true);
  assert.equal((await call('/api/ranking/visibility', { token: o, body: { show: true } })).j.rankOff, false); assert.ok((await rk(o)).mine); assert.equal(await total(), t0 + 1);
  // suspenso
  const id = await uidOf(oEm); assert.equal((await act(id, { action: 'ban', reason: 'teste' })).status, 200); assert.equal(await total(), t0, 'conta suspensa some do ranking');
  assert.equal((await act(id, { action: 'unban' })).status, 200); assert.equal(await total(), t0 + 1, 'reativada volta');
  // e-mail não confirmado
  const uEm = 'rk-unv@teste.com', un = (await call('/api/register', { body: { name: 'Ugo Sem Email', email: uEm, password: 'segredo1', accept: true } })).j; assert.equal(un.devVerifyLink !== undefined, true);
  await setXp(uEm, 888); assert.equal(await total(), t0 + 1, 'sem confirmar o e-mail não entra'); assert.equal((await call('/api/ranking', { token: un.token })).status, 200, 'mas ele pode abrir a tela');
  assert.equal((await act(await uidOf(uEm), { action: 'verify' })).status, 200); assert.equal(await total(), t0 + 2, 'confirmou → entra');
  // apagar a conta
  const del = await call('/api/account', { method: 'DELETE', token: un.token, body: { password: 'segredo1' } }); assert.equal(del.status, 200); assert.equal(await total(), t0 + 1, 'conta apagada sai da lista na hora');
});

test('ranking: arquivos do app — passo do nome, aba Ranking, rewards.js servido e no cache offline', async () => {
  const rd = f => fs.readFileSync(path.join(__dirname, '..', ...f.split('/')), 'utf8'), ui = rd('public/app.js'), css = rd('public/style.css'), html = rd('public/index.html'), sw = rd('public/sw.js');
  assert.match(ui, /id=gn\b/, 'campo do nome do personagem'); assert.match(ui, /S\.reg = \{ sex: w\.sex, guide: w\.guide, gname: w\.gname \}/, 'o nome escolhido no assistente segue para o cadastro'); assert.match(ui, /startWizard\(\['sex', 'guide', 'gname'\]/); assert.match(ui, /\['rk', 'crown', 'Ranking'\]/); assert.match(ui, /function rankView\(/); assert.match(ui, /class=pseg\b/);
  assert.ok(!/class=seg\b[^>]*aria-label="Período/.test(ui), 'o seletor de período não usa .seg (é a barra de progresso)'); assert.match(css, /\.pseg\b/);
  assert.match(html, /<script src="\/rewards\.js"><\/script>/); assert.ok(html.indexOf('/rewards.js') < html.indexOf('/app.js'), 'rewards.js carrega antes do app'); assert.match(sw, /'\/rewards\.js'/);
  const r = await fetch(U + '/rewards.js'); assert.equal(r.status, 200); assert.match(r.headers.get('content-type'), /javascript/);
  const served = new Function('window', 'module', (await r.text()) + '; return window.CodeUpRewards;')({}, undefined); assert.equal(served.TIERS.length, Rw.TIERS.length, 'o navegador recebe a mesma tabela do servidor');
});

// ---------------- Personalizar o personagem: cor, adesivo e fundo ----------------
test('personalização: tabelas de itens, imagens coloridas existem e a regra de desbloqueio por título', () => {
  const pub = path.join(__dirname, '..', 'public');
  for (const [kind, list] of Object.entries(Rw.LISTS)) {
    assert.ok(list.length >= 5, kind); assert.equal(new Set(list.map(x => x.key)).size, list.length, 'chaves únicas em ' + kind);
    for (const it of list) { assert.ok(Number.isInteger(it.tier) && it.tier >= 0 && it.tier < Rw.TIERS.length, kind + ' ' + it.key + ': título válido'); assert.ok(/^[a-z]+$/.test(it.key) && it.name); }
    assert.ok(list.some(x => x.tier === 0), 'sempre há algo livre desde o começo em ' + kind);
    if (kind !== 'color') assert.ok(list.some(x => x.tier >= 5), 'e algo raro para quem chega longe em ' + kind);
  }
  assert.equal(new Set(Rw.COLORS.map(c => c.hue)).size, Rw.COLORS.length, 'matizes diferentes'); for (const b of Rw.BACKS) assert.ok(/^#[0-9a-f]{6}$/i.test(b.c1) && /^#[0-9a-f]{6}$/i.test(b.c2)); for (const x of Rw.STICKERS) assert.ok(/^#[0-9a-f]{6}$/i.test(x.color));
  assert.deepEqual(Rw.BASE, { tay: 'rosa', cut: 'azul' }); assert.ok(Rw.item(Rw.COLORS, Rw.BASE.tay) && Rw.item(Rw.COLORS, Rw.BASE.cut));
  for (const g of ['tay', 'cut']) for (const c of Rw.COLORS) for (const face of [false, true]) { const f = Rw.colorFile(g, c.key, face); assert.ok(fs.existsSync(path.join(pub, f)), 'falta a imagem ' + f); assert.equal(f === `/img/${g}${face ? '-face' : ''}.webp`, c.key === Rw.BASE[g], 'a cor de fábrica usa a imagem original'); }
  assert.equal(Rw.colorFile('tay', null, true), '/img/tay-face.webp'); assert.equal(Rw.colorFile('cut', '../x', false), '/img/cut.webp', 'cor desconhecida não vira caminho de arquivo'); assert.equal(Rw.colorFile('zzz', 'verde', false), '/img/cut-verde.webp');
  assert.equal(Rw.pick('color', 0, 'verde', 'tay'), 'verde'); assert.equal(Rw.pick('color', 0, 'laranja', 'tay'), null, 'laranja pede o título Aprendiz'); assert.equal(Rw.pick('color', 100, 'laranja', 'tay'), 'laranja');
  assert.equal(Rw.pick('color', 9999, 'rosa', 'tay'), null, 'a cor de fábrica não conta como escolha'); assert.equal(Rw.pick('color', 9999, 'rosa', 'cut'), 'rosa', 'mas para o outro personagem é uma cor a mais');
  assert.equal(Rw.pick('sticker', 4499, 'cometa', 'cut'), null); assert.equal(Rw.pick('sticker', 4500, 'cometa', 'cut'), 'cometa'); assert.equal(Rw.pick('bg', 0, 'nao-existe', 'cut'), null); assert.equal(Rw.pick('bg', 0, undefined, 'cut'), null);
  const ui = fs.readFileSync(path.join(pub, 'app.js'), 'utf8'); for (const x of Rw.STICKERS) assert.match(ui, new RegExp(`\\b${x.key}: '<`), 'ícone do adesivo ' + x.key + ' desenhado no app');
});

test('personalização: /api/guide só aceita itens que o título já libera e o ranking mostra o que vale', async () => {
  const em = 'cz1@teste.com', tk = await regP(em, 'Dani Custom Pires', { sex: 'f', guide: 'tay', gname: 'Dani' }), g = body => call('/api/guide', { token: tk, body });
  let me = (await call('/api/me', { token: tk })).j; assert.equal(me.color, null); assert.equal(me.sticker, null); assert.equal(me.bg, null);
  // livres desde o começo
  assert.equal((await g({ color: 'verde' })).j.color, 'verde'); assert.equal((await g({ sticker: 'estrela' })).j.sticker, 'estrela'); assert.equal((await g({ bg: 'oceano' })).j.bg, 'oceano');
  assert.equal((await g({ color: 'azul', sticker: 'raio', bg: 'sol' })).j.color, 'azul', 'dá para mudar várias coisas de uma vez');
  // bloqueados
  const lk = async (body, re) => { const r = await g(body); assert.equal(r.status, 400, JSON.stringify(body)); assert.match(r.j.error, re); };
  await lk({ color: 'laranja' }, /cor ainda não foi conquistada/); await lk({ sticker: 'cometa' }, /adesivo ainda não foi conquistado/); await lk({ bg: 'diamante' }, /fundo ainda não foi conquistado/);
  await lk({ color: 'xx' }, /Opção inválida/); await lk({ sticker: '' }, /Opção inválida/); await lk({ bg: 123 }, /Opção inválida/); await lk({ color: 'verde', sticker: 'cometa' }, /adesivo/);
  me = (await call('/api/me', { token: tk })).j; assert.equal(me.color, 'azul', 'um pedido recusado não muda nada'); assert.equal(me.sticker, 'raio');
  assert.equal((await call('/api/guide', { body: { color: 'verde' } })).status, 401, 'precisa estar logado');
  // sobe de título: libera
  await setXp(em, 100); assert.equal((await g({ color: 'laranja' })).j.color, 'laranja'); await lk({ color: 'vermelho' }, /cor ainda/);
  await setXp(em, 4500); assert.equal((await g({ sticker: 'cometa', bg: 'diamante' })).j.sticker, 'cometa');
  // no ranking os outros veem a cor, o adesivo e o fundo (e só isso)
  let r = (await rk(tk)).mine; assert.equal(r.color, 'laranja'); assert.equal(r.sticker, 'cometa'); assert.equal(r.bg, 'diamante');
  // o dono tirou XP: o que deixou de ser liberado volta ao padrão (nada fica "preso")
  await setXp(em, 120); me = (await call('/api/me', { token: tk })).j; assert.equal(me.color, 'laranja'); assert.equal(me.sticker, null, 'cometa pede Lenda'); assert.equal(me.bg, null);
  r = (await rk(tk)).mine; assert.equal(r.color, 'laranja'); assert.equal(r.sticker, null); assert.equal(r.bg, null);
  // voltar ao padrão
  me = (await g({ color: 'auto', sticker: 'auto', bg: 'auto' })).j; assert.equal(me.color, null); assert.equal(me.sticker, null); assert.equal(me.bg, null);
  // a cor de fábrica do personagem não é uma "escolha"; trocar de personagem mantém uma cor que continua valendo
  assert.equal((await g({ color: 'rosa' })).j.color, null, 'Tay já é rosa'); assert.equal((await g({ color: 'verde' })).j.color, 'verde');
  assert.equal((await g({ guide: 'cut' })).j.color, 'verde'); assert.equal((await g({ color: 'rosa' })).j.color, 'rosa', 'no Cut, rosa é uma cor a mais'); assert.equal((await g({ guide: 'tay' })).j.color, null, 'voltando à Tay, rosa é a cor de fábrica');
  assert.equal((await rk(tk)).mine.guide, 'tay');
  const exp = (await call('/api/export', { token: tk })).j; assert.ok(!('pass' in exp), 'exportação continua sem senha');
});

test('personalização: o app tem a tela, usa as imagens coloridas e o cache offline foi trocado', () => {
  const rd = f => fs.readFileSync(path.join(__dirname, '..', ...f.split('/')), 'utf8'), ui = rd('public/app.js'), css = rd('public/style.css'), sw = rd('public/sw.js');
  assert.match(ui, /function czView\(/); assert.match(ui, /async function czSet\(/); assert.match(ui, /CR\.colorFile\(g, c, true\)/, 'todas as telas usam a imagem da cor escolhida'); assert.match(ui, /\$\{czView\(\)\}/);
  assert.match(ui, /avatar\(\d+, 'ring big'\)/, 'perfil mostra o adesivo'); assert.match(ui, /stkBadge\(r\.sticker, Math\.round\(s \* \.45\)\)/, 'ranking mostra o adesivo dos outros alunos'); assert.match(ui, /colorFile\(r\.guide, r\.color, true\)/);
  assert.match(ui, /aria-pressed=\$\{on\}/, 'botões de escolha dizem se estão marcados'); assert.match(ui, /bloqueado: /, 'e leem o bloqueio em voz alta');
  for (const c of ['.czi', '.czp', '.czg', '.stk', '.av']) assert.ok(css.includes(c), 'CSS de ' + c); assert.match(sw, /codeup-v(3[1-9]|[4-9]\d)/, 'cache novo para quem já tinha o app instalado');
});

// ---------------- Personagem animado (WebGL) + estilo da roupa ----------------
test('animação: estilos de roupa (tabela, regra de desbloqueio) e as máscaras existem para os dois personagens', () => {
  const pubDir = path.join(__dirname, '..', 'public'), anim = fs.readFileSync(path.join(pubDir, 'anim.js'), 'utf8');
  assert.deepEqual(Rw.OUTFITS.map(o => o.id), Rw.OUTFITS.map((_, i) => i), 'ids 0..N em sequência (o desenho em anim.js usa o número)');
  assert.equal(Rw.OUTFITS[0].key, 'liso'); assert.equal(Rw.OUTFITS[0].tier, 0); assert.ok(Rw.OUTFITS.length >= 11);
  assert.equal(Rw.pick('outfit', 9999, 'liso'), null, 'liso é o padrão, não uma escolha'); assert.equal(Rw.pick('outfit', 0, 'listrado'), 'listrado');
  assert.equal(Rw.pick('outfit', 0, 'bolinhas'), null, 'bolinhas pedem Aprendiz'); assert.equal(Rw.pick('outfit', 100, 'bolinhas'), 'bolinhas');
  assert.equal(Rw.pick('outfit', 4499, 'holo'), null); assert.equal(Rw.pick('outfit', 4500, 'holo'), 'holo'); assert.equal(Rw.pick('outfit', 9999, 'nao-existe'), null);
  assert.equal(Rw.outfitId('ouro'), 9); assert.equal(Rw.outfitId('liso'), 0); assert.equal(Rw.outfitId(undefined), 0); assert.equal(Rw.outfitId('../x'), 0);
  const top = Math.max(...Rw.OUTFITS.map(o => o.id)); assert.match(anim, new RegExp(`st<${top - 0.5}\\b`), 'o shader entende o último estilo'); assert.equal(Rw.LISTS.outfit, Rw.OUTFITS);
  // máscaras do desenho: roupa (R moletom, G calça, B tênis), movimento (R cabeça, G cabelo, B braço) e olhos
  const dim = f => { const b = fs.readFileSync(path.join(pubDir, 'img', f)); assert.equal(b.toString('latin1', 1, 4), 'PNG', f); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };
  for (const g of ['tay', 'cut']) { assert.deepEqual(dim(g + '-parts.png'), [320, 480]); assert.deepEqual(dim(g + '-eye.png'), [320, 480]); assert.deepEqual(dim(g + '-rig.png'), [160, 240]); }
  // o desenho usa exatamente as imagens 640x960 (a máscara é desenhada em cima delas)
  for (const f of ['tay.webp', 'cut.webp']) { const b = fs.readFileSync(path.join(pubDir, 'img', f)); assert.equal(b.toString('latin1', 8, 12), 'WEBP'); }
});

test('animação: /api/guide valida o estilo da roupa e o app mostra só o que vale', async () => {
  const em = 'an1@teste.com', tk = await regP(em, 'Ana Estilo Pires', { sex: 'f', guide: 'tay', gname: 'Ana' }), g = body => call('/api/guide', { token: tk, body });
  let me = (await call('/api/me', { token: tk })).j; assert.equal(me.outfit, null, 'começa liso');
  assert.equal((await g({ outfit: 'listrado' })).j.outfit, 'listrado');
  const lk = async (body, re) => { const r = await g(body); assert.equal(r.status, 400, JSON.stringify(body)); assert.match(r.j.error, re); };
  await lk({ outfit: 'galaxia' }, /estilo de roupa ainda não foi conquistado/); await lk({ outfit: 'xx' }, /Opção inválida/); await lk({ outfit: '' }, /Opção inválida/); await lk({ outfit: 5 }, /Opção inválida/);
  assert.equal((await call('/api/me', { token: tk })).j.outfit, 'listrado', 'pedido recusado não muda nada');
  await setXp(em, 3200); assert.equal((await g({ outfit: 'galaxia', color: 'verde' })).j.outfit, 'galaxia', 'dá para trocar estilo e cor juntos');
  await setXp(em, 100); me = (await call('/api/me', { token: tk })).j; assert.equal(me.outfit, null, 'o dono tirou XP: o estilo que deixou de ser liberado volta ao liso'); assert.equal(me.color, 'verde');
  await setXp(em, 100); assert.equal((await g({ outfit: 'bolinhas' })).j.outfit, 'bolinhas');
  me = (await g({ outfit: 'auto' })).j; assert.equal(me.outfit, null); assert.equal((await g({ outfit: 'liso' })).j.outfit, null, 'liso volta ao padrão');
  assert.equal((await call('/api/guide', { body: { outfit: 'listrado' } })).status, 401);
  // o ranking mostra só o rosto: não precisa do estilo da roupa
  assert.ok(!('outfit' in (await rk(tk)).mine), 'ranking não carrega o estilo');
});

test('animação: o app carrega anim.js, usa o personagem animado, tem fallback e o cache offline foi trocado', async () => {
  const pubDir = path.join(__dirname, '..', 'public'), rd = f => fs.readFileSync(path.join(pubDir, f), 'utf8'), html = rd('index.html'), ui = rd('app.js'), css = rd('style.css'), sw = rd('sw.js'), anim = rd('anim.js');
  assert.match(html, /<script src="\/anim\.js"><\/script>/); assert.ok(html.indexOf('/poses.js') > 0 && html.indexOf('/poses.js') < html.indexOf('/anim.js') && html.indexOf('/anim.js') < html.indexOf('/app.js'), 'poses.js e anim.js carregam antes do app'); assert.match(sw, /'\/anim\.js'/); assert.match(sw, /'\/poses\.js'/); assert.match(sw, /codeup-v(3[2-9]|[4-9]\d)/);
  assert.match(ui, /CodeUpAnim\.html\(/); assert.match(ui, /window\.CodeUpAnim \?/, 'sem anim.js ainda aparece a imagem normal'); assert.match(ui, /Estilo da roupa/); assert.match(ui, /function outBg|const outBg/);
  assert.match(css, /\.abody>canvas/); assert.match(css, /\.abody/);
  // segurança e boas práticas do motor
  assert.match(anim, /prefers-reduced-motion/, 'respeita "reduzir movimento"'); assert.match(anim, /IntersectionObserver/, 'não desenha o que está fora da tela'); assert.match(anim, /document\.hidden/, 'pausa com a aba escondida'); assert.match(anim, /webglcontextlost/, 'trata perda do contexto');
  assert.ok(!/eval\(|new Function\(|innerHTML\s*=/.test(anim), 'sem eval/innerHTML'); assert.ok(!/https?:\/\//.test(anim.replace(/\/\*[\s\S]*?\*\//g, '')), 'não busca nada de fora');
  assert.doesNotThrow(() => new Function(anim), 'anim.js é JavaScript válido');
  const r = await fetch(U + '/anim.js'); assert.equal(r.status, 200); assert.match(r.headers.get('content-type'), /javascript/);
  for (const f of ['tay-parts.png', 'cut-rig.png', 'cut-eye.png']) assert.equal((await fetch(U + '/img/' + f)).status, 200, f);
});

test('animação: conquistas (título novo, nível novo, prova, trilha) e troca de item têm animação própria', () => {
  const pubDir = path.join(__dirname, '..', 'public'), rd = f => fs.readFileSync(path.join(pubDir, f), 'utf8'), ui = rd('app.js'), anim = rd('anim.js'), css = rd('style.css');
  // as telas de resultado usam o personagem de conquista: título novo > trilha concluída > nível novo > só passou
  assert.match(ui, /const winStage = /); assert.match(ui, /winStage\(230, 'Mandou bem!'\)/); assert.match(ui, /winStage\(230, 'Checkpoint conquistado!', 'cp'\)/); assert.match(ui, /winStage\(240, fin \?/);
  assert.match(ui, /Agora você é \$\{t\.title\}!/); assert.match(ui, /Subiu de nível!/); assert.match(ui, /'good epic2', t\.color/, 'título novo usa a cor do título'); assert.match(ui, /S\.pop = 1; render\(\); S\.pop = 0;/, 'trocar um item faz o personagem dar um pulinho com brilho');
  assert.ok(!/stage\((230|240), '(Mandou bem!|Checkpoint conquistado!|Aprovado! Que orgulho!)', 'good'\)/.test(ui), 'nenhuma tela de resultado ficou com o personagem comum');
  assert.match(ui, /bodyMode = /); assert.match(ui, /fx: \/\\bepic2\\b\/\.test\(cls\) \? 2/);
  // o motor entende os modos novos e só aceita cor #rrggbb (vem do HTML)
  assert.match(anim, /mode == 'epic'/); assert.match(anim, /mode == 'pop'/); assert.match(anim, /\^#\[0-9a-f\]\{6\}\$/i, 'cor das faíscas validada'); assert.match(anim, /fxDraw/); assert.match(anim, /uShine/);
  assert.match(css, /\.stage\.epic \.glow/); assert.match(css, /canvas\.afx/); assert.match(css, /@keyframes fxglow/);
  // com "reduzir movimento" não há faíscas nem pulo
  assert.match(anim, /if \(reduce\) return;/);
  assert.match(fs.readFileSync(path.join(pubDir, 'sw.js'), 'utf8'), /codeup-v(3[3-9]|[4-9]\d)/, 'cache novo para quem já tinha a versão anterior');
});

test('animação: expressões da folha (poses) valem no motor, nas comemorações, no toque, no mapa e no Perfil', async () => {
  const pubDir = path.join(__dirname, '..', 'public'), rd = f => fs.readFileSync(path.join(pubDir, f), 'utf8'), ui = rd('app.js'), anim = rd('anim.js'), sw = rd('sw.js'), css = rd('style.css'), CRw = require('../public/rewards.js');
  // tabela das poses (gerada por tools/anim/pacote.py): Tay 18 expressões; Cut as mesmas 18 + 7 só dele (serio, celular, tedio, deitado, dab, correndo, chorando) = 25 arquivos (43 no total)
  const win = {}; new Function('window', rd('poses.js'))(win); const T = win.CodeUpPoses.poses;
  const IDS18 = ['oi', 'piscada', 'pulo', 'apaixonado', 'pensando', 'ideia', 'codando', 'vitoria', 'coracao', 'apontando', 'estiloso', 'bravo', 'ops', 'dormindo', 'tchau', 'aponta2', 'explica', 'joinha'], CUT_EXTRA = ['serio', 'celular', 'tedio', 'deitado', 'dab', 'correndo', 'chorando'], expected = { tay: IDS18, cut: IDS18.concat(CUT_EXTRA) }, SIT = { tay: ['codando', 'dormindo'], cut: ['codando', 'dormindo', 'celular', 'apaixonado', 'tedio', 'deitado'] };
  for (const g of ['tay', 'cut']) {
    assert.deepEqual(Object.keys(T[g]).sort(), expected[g].slice().sort(), 'poses de ' + g);
    for (const id of expected[g]) {
      const m = T[g][id], f = path.join(pubDir, 'img', 'pose', `${g}-${id}.webp`), b = fs.readFileSync(f);
      assert.equal(b.slice(0, 4).toString(), 'RIFF'); assert.equal(b.slice(8, 12).toString(), 'WEBP'); assert.ok(b.length > 8000 && b.length < 90000, `${g}-${id} tem um tamanho razoável (${b.length})`);
      assert.ok(m.w > 300 && m.h > 300 && ['full', 'sit', 'bust'].includes(m.k), `${g}-${id} tem tamanho (qualidade nova: poses grandes) e tipo`); assert.equal(m.k, SIT[g].includes(id) ? 'sit' : 'full', `${g}-${id} tipo`); assert.ok(Array.isArray(m.d) && m.d.every(d => d.length === 6 && d[2] > 0 && d[3] > 0), `${g}-${id} rabiscos bem formados`);
      assert.equal((await fetch(`${U}/img/pose/${g}-${id}.webp`)).status, 200, `${g}-${id} é servida`);
    }
  }
  // os botões do Perfil cobrem exatamente as poses que existem
  const ex = new Function('return ' + /const EXPR = (\{[\s\S]*?\n\});/.exec(ui)[1])();
  // Tay: 18 botões; Cut: 23 (as poses 'oi' e 'aponta2' do Cut repetem 'tchau' e 'estiloso', então não ganham botão próprio)
  assert.deepEqual(ex.tay.map(x => x[0]).sort(), expected.tay.slice().sort(), 'botões do Perfil da Tay (as 18 expressões)');
  assert.deepEqual(ex.cut.map(x => x[0]).sort(), expected.cut.filter(k => k != 'oi' && k != 'aponta2').sort(), 'botões do Perfil do Cut (23 expressões sem repetidas)'); assert.equal(ex.cut.length, 23);
  assert.equal(new Set(ex.cut.map(x => x[1])).size, 23, 'cada botão tem um nome diferente');
  assert.match(anim, /var SEQ_CUT = /); assert.match(anim, /REELS = \{ tay: SEQ, cut: SEQ_CUT \}/, 'o Cut tem sequências próprias (dab, correndo, celular, tédio→deitado→dormindo)');
  assert.match(ui, /function playMove\(/); assert.match(ui, /playMove\('p:\$\{k\}'\)/); assert.match(ui, /Expressões/);
  // a cor escolhida vale nas poses: mesma conta do matiz que gerou as imagens coloridas do corpo
  assert.equal(CRw.hueShift('tay', 'verde'), 162); assert.equal(CRw.hueShift('tay', 'azul'), -116); assert.equal(CRw.hueShift('cut', 'verde'), -82); assert.equal(CRw.hueShift('cut', 'vermelho'), 134);
  assert.equal(CRw.hueShift('tay', 'rosa'), 0); assert.equal(CRw.hueShift('cut', 'azul'), 0); assert.equal(CRw.hueShift('tay', null), 0); assert.equal(CRw.hueShift('tay', 'inexistente'), 0);
  assert.match(ui, /hue: HUE\(\)/); assert.match(anim, /function hueRotate\(/); assert.match(anim, /data-hue/);
  // motor: sequências, movimentos, rabiscos, balão, toque, brincadeira dos muitos toques e respeito a "reduzir movimento"
  for (const f of ['function poseLoad(', 'function startReel(', 'function pzState(', 'function pzDraw(', 'function mot(', 'function preload(', 'function kick(']) assert.ok(anim.includes(f), f);
  for (const k of ['hop', 'jump2', 'beat', 'shake', 'tilt', 'nod', 'snap', 'startle', 'walk', 'snooze', 'wave']) assert.match(anim, new RegExp(`n == '${k}'`), 'movimento ' + k);
  for (const k of ['win', 'cp', 'big', 'think', 'oops', 'intro', 'mapa', 'ok', 'perfect', 'pass', 'streak', 'streak7', 'sleep', 'wake', 'idea', 'explain']) assert.match(anim, new RegExp(`\\b${k}: \\[\\[\\[`), 'sequência ' + k);
  assert.match(anim, /i\.taps\.length >= 5/, 'muitos toques seguidos deixam bravinho'); assert.match(anim, /CALM/); assert.match(anim, /k\.indexOf\('p:'\) == 0/); assert.match(anim, /_pose: function/);
  assert.match(anim, /if \(reduce \|\| !PZ/, 'com "reduzir movimento" as poses não entram'); assert.match(anim, /if \(reduce\) return false;/);
  assert.ok(!/eval\(|new Function\(|innerHTML\s*=/.test(anim), 'sem eval/innerHTML');
  // telas: cada situação pede a sua sequência de expressões
  assert.match(ui, /winStage\(230, 'Mandou bem!'\)/); assert.match(ui, /'good epic2', t\.color, 'big'/); assert.ok(!/const hero = [^\n]*(body\(|class=hb\b|<img)/.test(ui) && !/'hello'/.test(ui), 'a tela de entrada (login/cadastro) não tem personagem: só a marca CodeUp'); assert.match(ui, /'Qual curso você quer fazer\?', '', '', 'think'/);
  assert.match(ui, /Você consegue!', '', '', 'intro'/); assert.match(ui, /'Calma, vamos relembrar!', 'bad', '', 'fail'/); assert.match(ui, /const walker = /); assert.match(ui, /reel: 'mapa'/, 'o personagem do mapa fica de frente'); assert.ok(!/reel: 'walk'/.test(ui) && !/'back'/.test(ui.slice(ui.indexOf('const EXPR'), ui.indexOf('const IMG'))), 'sem personagem de costas'); assert.equal((ui.match(/walker\(\)/g) || []).length, 3, 'o mapa usa o personagem nas três paradas (lição, checkpoint e prova final)');
  assert.ok(!/<img class=pm/.test(ui.replace(/const walker[^\n]*\n/, '')), 'sem a imagem parada no mapa (só o fallback do walker)');
  assert.match(css, /span\.abody\.pm/); assert.match(css, /\.czg\.ex/); assert.match(css, /canvas\.ac\{filter:grayscale/, 'o cinza da prova não pega as poses');
  assert.match(sw, /codeup-v(3[6-9]|[4-9]\d)/, 'cache novo para quem já tinha a versão anterior');
  // cada uma das 18 expressões tem uma ação no app (anim.js: movimento padrão e/ou sequência; app.js: cartões e telas)
  const seq = anim.slice(anim.indexOf('var SEQ = {'), anim.indexOf('var REELS')), used = new Set([...seq.matchAll(/\['([a-z0-9]+)', [\d.]+/g)].map(m => m[1]));
  for (const k of ['poseChip(st == \'err\' ? \'ops\' : \'pensando\'', 'poseChip(\'ideia\'', 'poseChip(\'explica\'', 'poseChip(\'codando\'', 'poseChip(\'apontando\'']) assert.ok(ui.includes(k), 'ação no app: ' + k);
  for (const k of ['ops', 'pensando', 'ideia', 'explica', 'codando', 'apontando']) used.add(k);
  const taps = anim.slice(anim.indexOf('var TAPS'), anim.indexOf('var CALM')); for (const m of taps.matchAll(/'([a-z0-9]+)'/g)) used.add(m[1]); used.add('bravo');
  used.add('chorando');   // prova reprovada (app.js: failImg)
  for (const k of expected.cut) assert.ok(used.has(k), 'a expressão ' + k + ' tem uma ação no app');
  for (const k of expected.cut) assert.match(anim, new RegExp(`\\b${k}: '[a-z0-9]+'`), 'movimento padrão de ' + k);
});

test('aluno que ficou dias sem entrar: o servidor marca a ausência uma vez e o app mostra o personagem dormindo', async () => {
  // servidor com limite de ausência de ~2 s (AWAY_DAYS=0.00002) para não esperar dias
  const port = PORT + 955, base = 'http://localhost:' + port, d = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'away-')), 'data.json'); let lg = '';
  const p = spawn('node', ['server.js'], { cwd: path.join(__dirname, '..'), env: { ...process.env, PORT: port, DATA_FILE: d, BASE_URL: base, RELAX_SUBMIT_LIMIT: '1', DEV_SHOW_RESET_LINK: '1', AWAY_DAYS: '0.00002', DATABASE_URL: '' } });
  p.stdout.on('data', x => lg += x); p.stderr.on('data', x => lg += x);
  try {
    for (let i = 0; i < 150 && !/rodando/.test(lg); i++) await new Promise(r => setTimeout(r, 100));
    const post = async (u, body, tk) => { const r = await fetch(base + u, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(tk ? { 'x-token': tk } : {}) }, body: JSON.stringify(body || {}) }); return { status: r.status, j: await r.json().catch(() => ({})) }; };
    const get = async (u, tk) => { const r = await fetch(base + u, { headers: { 'x-token': tk } }); return { status: r.status, j: await r.json().catch(() => ({})) }; };
    const tk = (await post('/api/register', { name: 'Dorminhoco', email: 'zzz@teste.com', password: 'segredo1', accept: true, sex: 'm', guide: 'cut', gname: 'Cut' })).j.token; assert.ok(tk);
    assert.equal((await get('/api/me', tk)).j.away, null, 'quem acabou de entrar não está ausente');
    await new Promise(r => setTimeout(r, 2600));
    // a primeira volta depois de um bom tempo marca a ausência e ela segue pendente até ele acordar o personagem
    const back = (await get('/api/me', tk)).j; assert.ok(back.away && back.away.days >= 1, 'voltou: tela do personagem dormindo pendente');
    assert.ok((await get('/api/me', tk)).j.away, 'continua pendente até ele tocar em Acordar (recarregar a página não some com ela)');
    assert.equal((await post('/api/away/ack', {}, tk)).j.ok, true);
    assert.equal((await get('/api/me', tk)).j.away, null, 'depois de acordar o personagem, não aparece de novo');
    assert.equal((await post('/api/away/ack', {})).status, 401, 'precisa estar logado');
    assert.equal((await post('/api/teste/ausente', {}, tk)).status, 404, 'o atalho de teste não existe fora do modo teste');
  } finally { p.kill(); }
  // app: a tela, o clique em "Acordar", o ack e o atalho do modo teste
  const pubDir = path.join(__dirname, '..', 'public'), rd = f => fs.readFileSync(path.join(pubDir, f), 'utf8'), ui = rd('app.js'), anim = rd('anim.js'), css = rd('style.css'), srvSrc = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
  for (const f of ['function showAway(', 'const sleepHero', 'const awayFor', "api('away/ack'", "sleepHero('sleep'", "sleepHero('wake'", "openOv('sleep'"]) assert.ok(ui.includes(f), f);
  assert.match(ui, /S\.me\.away && !S\.awaySeen/, 'aparece uma vez por visita, depois de desenhar o app'); assert.match(ui, /visibilitychange/, 'app aberto na memória do celular também confere ao voltar'); assert.match(ui, /teste\/ausente/, 'botão "Simular ausência" no modo teste');
  assert.match(ui, /S\.awaySeen = 0/, 'sair da conta zera a flag');
  assert.match(css, /\.fxo\.sleep/); assert.match(css, /\.zsky/); assert.match(css, /\.zmoon/);
  assert.match(srvSrc, /AWAY_DAYS/); assert.match(srvSrc, /\/api\/away\/ack/); assert.match(srvSrc, /if \(TESTE\) app\.post\('\/api\/teste\/ausente'/);
  assert.match(anim, /sleep: \[\[\['dormindo'/); assert.match(anim, /wake: \[\[\['ops'/); assert.match(anim, /sleep: \{ delay/);
});

test('comemorações por acontecimento: acerto, erro, prova aprovada, sequência de dias e efeitos sonoros', async () => {
  const pubDir = path.join(__dirname, '..', 'public'), rd = f => fs.readFileSync(path.join(pubDir, f), 'utf8'), ui = rd('app.js'), anim = rd('anim.js'), sfx = rd('sfx.js'), css = rd('style.css'), sw = rd('sw.js'), html = rd('index.html');
  // servidor: a 1ª lição do dia acende a sequência (streakUp) e devolve quantas tentativas foram feitas (acerto de primeira)
  const em = `fx${Date.now()}@exemplo.com`, reg = await call('/api/register', { body: { name: 'Fx Teste', email: em, password: 'segredo123', accept: true, sex: 'f', guide: 'tay', gname: 'Luna' } }), tk = reg.j.token;
  await call('/api/track', { token: tk, body: { track: 'python' } });
  let r = (await call('/api/submit', { token: tk, body: { id: 'py-1-01', code: 'print("errado")', out: 'errado' } })).j;
  assert.equal(r.ok, false); assert.equal(r.streakUp, undefined, 'errar não acende a sequência'); assert.equal(r.tries, 1);
  r = (await call('/api/submit', { token: tk, body: { id: 'py-1-01', code: 'print("Olá, mundo!")', out: 'Olá, mundo!' } })).j;
  assert.equal(r.ok, true); assert.equal(r.tries, 2, 'conta as tentativas (acerto de primeira = 1)'); assert.equal(r.streakUp, 1, 'primeiro dia de treino: sequência iniciada'); assert.equal(r.streak, 1);
  r = (await call('/api/submit', { token: tk, body: { id: 'py-1-02', code: 'print("Bom dia")\nprint("Vamos programar")', out: 'Bom dia\nVamos programar' } })).j;
  if (r.ok) { assert.equal(r.streakUp, undefined, 'no mesmo dia a sequência não sobe de novo'); assert.equal(r.tries, 1); }
  // efeitos sonoros: arquivo próprio, sem áudio para baixar, com liga/desliga salvo no aparelho
  assert.equal((await fetch(`${U}/sfx.js`)).status, 200); assert.ok(html.indexOf('/sfx.js') > 0 && html.indexOf('/sfx.js') < html.indexOf('/anim.js') && html.indexOf('/anim.js') < html.indexOf('/app.js'), 'sfx.js carrega antes do app');
  for (const n of ['ok', 'perfect', 'combo', 'bad', 'done', 'cp', 'pass', 'fail', 'streak', 'streak7', 'level', 'pop']) assert.match(sfx, new RegExp(`\\b${n}: function`), 'som ' + n);
  assert.match(sfx, /AudioContext/); assert.match(sfx, /cu_sfx/); assert.match(sfx, /document\.hidden/, 'não toca com a aba escondida'); assert.ok(!/\.mp3|\.wav|\.ogg|fetch\(|XMLHttpRequest/.test(sfx), 'sons sintetizados, nada para baixar'); assert.ok(sw.includes('/sfx.js'), 'sw guarda o sfx.js');
  // app: cada acontecimento tem a sua tela e o seu som
  for (const f of ['function okFx(', 'function passFx(', 'function streakFx(', 'function streakLater(', 'function openOv(', 'function closeOv(', 'function setSfx(', 'const poseChip', 'const ovHero']) assert.ok(ui.includes(f), f);
  assert.match(ui, /await okFx\(s\)/, 'o acerto aparece antes do resultado'); assert.match(ui, /else result\(\);\s*\n\s*streakLater\(s\)/, 'a sequência aparece depois do resultado');
  assert.match(ui, /await new Promise\(res => passFx\(s, l, res\)\)[^\n]*testPass\(s\)/, 'prova final aprovada: troféu e depois o resultado');
  assert.match(ui, /sfx\('fail'\)/); assert.match(ui, /sfx\('bad'\)/); assert.match(ui, /sfx\(S\.lvlUp \|\| S\.tierUp \? 'level' : 'done'\)/); assert.match(ui, /sfx\(mk \? 'streak7' : 'streak'\)/); assert.match(ui, /sfx\('pass'\)/);
  assert.match(ui, /const MARCOS = \[3, 7, 14, 30, 50, 100, 200, 365\]/); assert.match(ui, /Combo ×\$\{combo\}!/); assert.match(ui, /De primeira!/); assert.match(ui, /Sequência iniciada!/); assert.match(ui, /Marco: \$\{n\} dias seguidos!/);
  assert.match(ui, /onclick="setSfx\(\$\{k\}\)"/, 'Perfil tem o botão Sons'); assert.match(ui, /cls: 'fxh'/, 'a classe do personagem não colide com .ov');
  assert.ok(!/eval\(/.test(ui.slice(ui.indexOf('COMEMORAÇÕES POR ACONTECIMENTO'), ui.indexOf('function toast('))), 'sem eval nas telas');
  // anim.js: sequências em laço para as telas que esperam o toque; toque no personagem faz um "pop"
  assert.match(anim, /period == 'loop'/); assert.match(anim, /CodeUpSfx\.play\('pop'\)/);
  // visual
  for (const c of ['.fxo{', '.fxo .rays', '.trophy', '.flw', '.sn .n', '.wk{', '.spk{', '.fb .fbc', '@keyframes fxSpark', '@keyframes fxTrophy', '@keyframes fxFl']) assert.ok(css.includes(c), 'css ' + c);
});

test('app: cartões de explicação, provas com chances, tela de voltar lições e mapa com checkpoints e prova final', async () => {
  const pubDir = path.join(__dirname, '..', 'public'), ui = fs.readFileSync(path.join(pubDir, 'app.js'), 'utf8'), css = fs.readFileSync(path.join(pubDir, 'style.css'), 'utf8'), sw = fs.readFileSync(path.join(pubDir, 'sw.js'), 'utf8');
  // as 4 explicações aparecem na teoria ("o que é" dentro do balão do personagem; "para que serve" antes do exemplo; como você vai usar aqui e o que vai aparecer na tela depois) e a prática fica limpa (só o desafio, o editor e os botões)
  for (const k of ['O que é', 'Para que serve', 'Como você vai usar aqui', 'O que vai aparecer na tela']) assert.ok(ui.includes(`'${k}'`), k);
  assert.match(ui, /infoCards\(l\.info, \['serve'\]\)\}\$\{l\.example \? codeBox\(l\.example, lang\(l\), 'Exemplo'\) : ''\}\$\{l\.mat \? matHtml\(l\.mat\) : ''\}\$\{infoCards\(l\.info, \['como', 'retorno'\]/);
  assert.ok(!/class=infod/.test(ui), 'a prática não tem o bloco "como fazer e o que esperar"');
  // provas: abertura com regras, chances em corações, sem dica/solução/teoria, tela de voltar lições e de prova final aprovada
  for (const f of ['async function openTest(', 'function testIntro(', 'function testFail(', 'function testPass(', 'const chHearts', 'const chanceMsg', 'const finOf', 'const isTest']) assert.ok(ui.includes(f), f);
  assert.match(ui, /\$\{T \? '' : `<button class="btn ghost" onclick=hint\(\)>/, 'prova não tem Dica');
  assert.match(ui, /\$\{T \? '' : `\$\{Q \? '' : `<button class="btn ghost" onclick=sol\(\)>\$\{ic\('key', 20\)\}<span>Solução<\/span><\/button>`\}<button class="btn ghost" onclick=lesson\(\)>/, 'prova não tem Solução nem Teoria');
  assert.match(ui, /err = e; r = \{ out: '', html: '' \}/, 'prova: código que dá erro também é enviado ao servidor e gasta chance'); assert.match(ui, /e\.message == 'OFFLINE'\) return setFb\('err'/, 'só o ambiente offline não gasta chance');
  // prova reprovada: o personagem chorando (Cut azul / Tay rosa) aparece na tela "Não foi dessa vez"
  assert.match(ui, /reel == 'fail' \? `<img class="body fimg" src="\$\{failImg\(\)\}"/); assert.match(ui, /stage\(270, 'Calma, vamos relembrar!', 'bad', '', 'fail'\)/);
  assert.match(ui, /gid\(\) == 'cut' \? '\/img\/pose\/cut-chorando\.webp' : '\/img\/fail-tay\.webp'/, 'Cut chora com a pose da folha; Tay com a imagem dela');
  for (const f of ['fail-tay.webp', 'pose/cut-chorando.webp']) { const b = fs.readFileSync(path.join(pubDir, 'img', f)); assert.equal(b.slice(8, 12).toString(), 'WEBP'); assert.ok(b.length > 10000 && b.length < 200000, `${f} tem tamanho razoável`); assert.equal((await fetch(`${U}/img/${f}`)).status, 200, `${f} é servida`); }
  assert.ok(!fs.existsSync(path.join(pubDir, 'img', 'fail-cut.webp')), 'a imagem antiga do Cut chorando saiu (agora é a pose da folha)');
  assert.ok(!ui.includes('nada é gasto: você corrige'), 'a regra antiga (erro não gasta chance) saiu das regras da prova');
  assert.match(ui, /if \(T && s\.rewind\)/, 'acabaram as chances: tela de voltar lições'); assert.match(ui, /voltar|volta \$\{r\.back\} lições|você volta/i);
  assert.match(ui, /openTest\('\$\{fin\.id\}'\)/, 'o mapa tem o nó da prova final'); assert.match(ui, /Prova final · \$\{LV\[lv - 1\]\}/);
  assert.match(ui, /const cpBefore = l => \(S\.cps \|\| \[\]\)\.find\(c => !c\.fin && /, 'checkpoint antes da lição não inclui a prova final');
  assert.match(ui, /c\.fin && c\.track == t && !passedLv\(t, c\.lv\) && !c\.lock/, 'com as 30 lições feitas o "Continuar" leva à prova final');
  assert.ok(!/examIntro|examStart|examQ\(|examFinish|execOnly|api\('exam\//.test(ui), 'a prova antiga de 10 questões saiu do app');
  assert.ok(!/S\.me\.exams/.test(ui));
  assert.match(ui, /Passando na prova final, o próximo nível abre/);
  for (const c of ['.infos{', '.inf{', '.inf.oque', '.inf.retorno', '.chances{', '.ht.on', '.backl', '.bk span']) assert.ok(css.includes(c), 'css ' + c);
  assert.match(sw, /codeup-v(3[7-9]|[4-9]\d)/, 'cache novo para quem já tinha a versão anterior');
  // quem acerta vê o resultado (tabela do SQL ou saída do Python) na tela de conclusão: lição, checkpoint e prova final
  assert.match(ui, /S\.lastRes = X \? xlStatic\(\) : Q \? qzStatic\(\) : DX \? daxStatic\(l, code\) : r\.html/); assert.equal((ui.match(/\$\{resBox\(\)\}/g) || []).length, 4, 'as 4 telas de acerto (lição inteira, 1ª atividade, checkpoint e prova final) mostram o resultado'); assert.ok(css.includes('.resbox'));
  // ao conquistar algo a tela mostra o que foi desbloqueado: lição, checkpoint, prova final, nível, certificado e (por XP) título, moldura e itens de personalização
  assert.match(ui, /function unlocksOf\(lk0, xb, s\)/); assert.match(ui, /S\.unl = unlocksOf\(lk0, xb, s\)/); assert.match(ui, /Desbloqueado!/);
  assert.equal((ui.match(/\$\{unlockCard\(\)\}/g) || []).length, 3, 'as 3 telas de acerto mostram o cartão "Desbloqueado!"'); assert.ok(!/tierCard/.test(ui));
  for (const c of ['.unl{', '.unl .uig', '.unl .uic', '.unl .sw']) assert.ok(css.includes(c), 'css ' + c);
});

test('Perfil em abas e Ranking com pódio: telas, estilos e regras de privacidade no app', () => {
  const pub = path.join(__dirname, '..', 'public'), ui = fs.readFileSync(path.join(pub, 'app.js'), 'utf8'), css = fs.readFileSync(path.join(pub, 'style.css'), 'utf8');
  // Perfil: cabeçalho + 3 abas (Resumo, Personagem, Ajustes), cada uma com o que já existia
  for (const f of ['function profileView(', 'function pfTab(', 'function pfHero(', 'function pfProg(', 'function pfRes(', 'function pfChar(', 'function pfSet(', 'function tiersView(', 'function czTab(']) assert.ok(ui.includes(f), f);
  assert.match(ui, /\['res', 'Resumo'\], \['per', 'Personagem'\], \['aju', 'Ajustes'\]/, 'as 3 abas do Perfil');
  for (const a of ['editName()', 'editGname()', "setSex('", "setGuide('", "setFrame('", 'rkVis(${k})', 'setSfx(${k})', "setSkin('", 'changePw()', 'exportData()', 'logout()', 'delAccount()', "studyTrack('"]) assert.ok(ui.includes(a), 'o Perfil continua com ' + a);
  assert.match(ui, /Eu sou/); assert.match(ui, /Zona de perigo/); assert.match(ui, /class="czg ex"/, 'as expressões continuam no Perfil'); assert.match(ui, /playMove\('p:\$\{k\}'\)/);
  assert.match(ui, /CZG = \[\['fan', 'Fantasias'\], \['ex', 'Expressões'\], \['color', 'Cor'\], \['outfit', 'Estilo'\], \['sticker', 'Adesivo'\], \['bg', 'Fundo'\]\]/, 'personalizar em grupos');
  // Ranking: pódio, linhas, "sua posição" e privacidade
  for (const f of ['function rankView(', 'class=podium', 'class="panel rkme"', 'class="panel rkpv"', 'class=rbar', 'Faltam ${nf(d)} XP para o']) assert.ok(ui.includes(f), f);
  assert.match(ui, /\[top\[1\], top\[0\], top\[2\]\]\.filter\(Boolean\)/, 'pódio com 2º, 1º e 3º (funciona com menos de 3)');
  assert.match(ui, /r\.name/); assert.ok(!/r\.email|\.email\b[^;]{0,40}rkx/.test(ui.slice(ui.indexOf('function rankView('), ui.indexOf('function rkPer('))), 'o ranking nunca usa e-mail de outros alunos');
  assert.ok(!/r\.gname|r\.surname|r\.fullName/.test(ui.slice(ui.indexOf('function rankView('), ui.indexOf('function rkPer('))), 'nem o nome dado ao personagem');
  for (const c of ['.pfh', '.pft', '.kpg', '.kp ', '.tgr{', '.tgi', '.setc', '.sg ', '.lrow', '.dz', '.czt', '.podium', '.pdc', '.rkx', '.rkl', '.rkpv', '.rkme']) assert.ok(css.includes(c), 'CSS de ' + c);
  assert.ok(!/\.rkr\b|\.tri\b/.test(css), 'sem estilos velhos do ranking/títulos');
  for (const t of ['neo', 'wild']) assert.match(css, new RegExp('body\\.' + t + ' \\.kp'), 'tema ' + t + ' cobre os cartões novos');
});

test('acabamento: abertura com a marca, falha de carregamento, sessão expirada, tela Início enxuta, barra de ajudas e logo da Python', async () => {
  const pubDir = path.join(__dirname, '..', 'public'), rd = f => fs.readFileSync(path.join(pubDir, f), 'utf8'), ui = rd('app.js'), css = rd('style.css'), html = rd('index.html');
  // enquanto o app carrega aparece a marca com uma barrinha (e não uma tela vazia)
  assert.match(html, /<div id="app"><div class="c"><div class="boot" role="status"/); assert.match(css, /\.boot\{min-height/); assert.match(css, /prefers-reduced-motion:reduce\)\{\.boot/);
  // falha ao carregar: mensagem de verdade + "Tentar de novo"; sessão expirada vai para o login (antes mostrava "Não foi possível carregar")
  assert.match(ui, /class="boot err" role=alert/); assert.match(ui, /Tentar de novo/); assert.match(ui, /if \(e\.silent\) return;/); assert.match(ui, /e\.status === 401\) \{ S\.tk = null; localStorage\.removeItem\('tk'\); S\.auth = 'login'; return showAuth\(\)/);
  assert.equal((await fetch(`${U}/api/me`, { headers: { 'x-token': 'token-invalido' } })).status, 401, 'token inválido: 401 (o app abre o login)');
  // Início: o progresso fica dentro do cartão "Continuar" e a faixa do nível é enxuta (o mapa aparece na primeira tela)
  assert.match(ui, /class=cprog/); assert.ok(!ui.includes('Progresso na trilha'), 'sem o bloco de progresso solto'); assert.match(ui, /<div class="unit slim">/);
  assert.match(css, /\.card\.cont \.cprog\{/); assert.match(css, /\.unit\.slim/);
  // Desafios: título igual ao da aba e regras em linhas com ícone
  assert.match(ui, /<h2 class=ttl>Desafios<\/h2>/); assert.match(ui, /class="panel rules2"/); assert.ok(!ui.includes('<h2 class=ttl>Provas e certificados</h2>'));
  // prática: barra de ajudas com ícone e texto em todos os botões (antes o "limpar" era só um ícone sem nome)
  assert.match(ui, /class=acts role=toolbar/); for (const n of ['Dica', 'Dados', 'Solução', 'Teoria', 'Limpar']) assert.ok(ui.includes(`<span>${n}</span>`), 'botão ' + n);
  assert.match(css, /\.acts\{display:grid;grid-auto-flow:column/);
  // o logo da Python (.tg) não pode ser sobrescrito pela grade de títulos do Perfil (.tgr): era isso que cortava o "py"
  assert.ok(!/(^|\n)\.tg\{display:grid/.test(css), '.tg do logo não vira grade'); assert.match(css, /\.tgr\{display:grid/); assert.match(ui, /<div class=tgr>/);
});

test('cursos: logos de Python, SQL e Excel e a tela Cursos em lista (busca, categorias, XP e progresso)', async () => {
  const pubDir = path.join(__dirname, '..', 'public'), rd = f => fs.readFileSync(path.join(pubDir, f), 'utf8'), ui = rd('app.js'), css = rd('style.css'), sw = rd('sw.js');
  // as logos (fundo transparente) valem em todas as telas no lugar do "py" e do ícone de banco; a do Excel é um desenho original
  for (const f of ['logo-python.webp', 'logo-sql.webp', 'logo-excel.webp', 'logo-powerbi.webp', 'logo-dados.webp']) {
    const b = fs.readFileSync(path.join(pubDir, 'img', f)); assert.equal(b.slice(0, 4).toString(), 'RIFF'); assert.equal(b.slice(8, 12).toString(), 'WEBP'); assert.ok(b.length > 8000 && b.length < 80000, `${f} tem tamanho razoável (${b.length})`);
    assert.equal((await fetch(`${U}/img/${f}`)).status, 200, f + ' é servida'); assert.ok(sw.includes(`/img/${f}`), f + ' fica no cache offline');
  }
  assert.match(ui, /const tg = \(t, s = 40\) => `<img class=lgo src="\/img\/logo-\$\{\['python', 'excel', 'powerbi', 'dados'\]\.includes\(t\) \? t : 'sql'\}\.webp"/); assert.match(css, /\.lgo\{width:var\(--s\)/);
  assert.ok(!/\.tg\.py|\.tg\.sq/.test(css), 'sem o CSS antigo do "py" e do ícone de banco');
  // tela Cursos: cabeçalho com mascote e balão, busca, categorias e a lista (um cartão por curso + os que estão "em breve")
  for (const k of ['class=crh', 'class=crm', 'class=bub', 'class=crs', 'id=cq', 'oninput="cfilter()"', 'class=crc', "onclick=\"ccat('${c}')\"", 'class=crl id=crl', 'class=crx', 'class=crbar', 'class=crgo', "onclick=\"studyTrack('${t}')\"", 'class=sbadge', 'Em breve']) assert.ok(ui.includes(k), 'Cursos: ' + k);
  for (const k of ['.crh{', '.crs{', '.crc{', '.crl{', '.crl .cr{', '.crbar{', '.crgo{', '.sbadge{', 'body.t-excel{', 'body.wild.t-excel{', 'body.neo.t-excel', 'body.rose.t-excel']) assert.ok(css.includes(k), 'CSS de ' + k);
  for (const x of ['Todos', 'Programação', 'Dados', 'Produtividade']) assert.ok(ui.includes(`'${x}'`), 'categoria ' + x);
  assert.match(ui, /Power BI e DAX/); assert.match(ui, /Análise de Dados e Storytelling/); assert.ok(!/Projetos Reais/.test(ui), 'só aparecem cursos que existem ou que estão no roteiro');
  // a palavra "trilha" saiu da tela: agora é "curso"
  assert.ok(!/trilha/i.test(ui.replace(/\/\/[^\n]*/g, '')), 'a palavra "trilha" não aparece mais no texto do app');
  assert.ok(!/certific/i.test(ui), 'o app não fala mais de certificado');
});

test('mapa com cenário: floresta ao longo da trilha, personagem no pedestal e cartão da lição (visual Azul)', async () => {
  const pubDir = path.join(__dirname, '..', 'public'), rd = f => fs.readFileSync(path.join(pubDir, f), 'utf8'), ui = rd('app.js'), css = rd('style.css'), sw = rd('sw.js'), ms = rd('mapscene.js'), html = rd('index.html');
  // o cenário é um arquivo próprio, carregado antes do app e guardado para uso offline
  assert.ok(html.includes('<script src="/mapscene.js"></script>') && html.indexOf('/mapscene.js') < html.indexOf('/app.js'));
  assert.ok(sw.includes("'/mapscene.js'")); assert.equal((await fetch(`${U}/mapscene.js`)).status, 200);
  // peças desenhadas: pinheiros (claros e escuros), pedras, capim, moitas, cogumelos, flores, colina, lago, coruja dormindo, placa com a logo da trilha e lampião
  for (const k of ['msPineA', 'msPineDC', 'msRockA', 'msTuftC', 'msBushB', 'msShroom', 'msFlow', 'msMound', 'class="sp pond"', 'class="sp owl"', 'class="sp sign"', '/img/logo-${logo}.webp', 'class="sp lamp"', 'class="ffl"', 'window.mapScene']) assert.ok(ms.includes(k), 'mapscene.js: ' + k);
  assert.match(ms, /const rg = s => \(\) => \(s = s \* 16807 % 2147483647\)/, 'sorteio com semente fixa (o cenário não muda de lugar a cada abertura)');
  // o app só usa o cenário no visual Azul e passa a linha da lição atual para o cartão não ficar em cima de uma peça grande
  assert.match(ui, /window\.mapScene && document\.body\.classList\.contains\('wild'\) \? mapScene\(\{ X, M: MAP, NR, track: T, cur: curK/);
  assert.match(ui, /<div class=tl style="--n:\$\{NR\};--row:\$\{MAP\.row\}px;--top:\$\{MAP\.top\}px">\$\{scene\}\$\{pathSvg\}/);
  assert.match(ui, /Math\.sin\(\(r - 1\) \* Math\.PI \/ 4\)/, 'a trilha começa à esquerda, como no modelo');
  // lição, checkpoint e prova final do momento: personagem em pé no pedestal e cartão "INICIAR" (nos outros visuais continua o "COMEÇAR")
  assert.equal((ui.match(/walker\(\) \+ lcard\(/g) || []).length, 3, 'os três tipos de passo têm o cartão');
  assert.equal((ui.match(/<span class=start>COMEÇAR<\/span>/g) || []).length, 3); assert.match(ui, /<em class=lcb>INICIAR<\/em>/);
  assert.match(ui, /<i class=nn>\$\{l\.n\}<\/i>/, 'número da lição no botão (os títulos saem do mapa no visual Azul)');
  assert.match(ui, /class="card cont tkc"/); assert.match(ui, /<div class=tkb><i style="width:/); assert.match(ui, /Vamos continuar seus estudos\?/);
  assert.match(ui, /class=cprog/, 'os outros visuais mantêm o cartão Continuar com o progresso');
  // se ajusta ao tamanho do celular: posições em %, cartão com largura calculada (mínimo 96 px, nunca passa da borda), refaz o mapa ao girar a tela
  assert.match(ui, /Math\.max\(96, Math\.round\(\(X\[k\] > 50\.5 \? X\[k\] : 100 - X\[k\]\) \* Wm \/ 100 - 58\)\)/);
  assert.match(ui, /addEventListener\('resize'[\s\S]{0,260}Math\.abs\(innerWidth - \(S\.rw \|\| innerWidth\)\) >= 40[\s\S]{0,80}render\(\); scrollTo\(0, y\)/);
  assert.match(css, /@media \(max-width:340px\)\{\.nav button\{font-size:10\.5px\}/, 'menu de baixo cabe em 320 px');
  for (const k of ['body.wild .scn{display:block;position:absolute', '.scn .sp{position:absolute', '.scn .f{scale:-1 1}', 'body.wild .tl .ti.cur .rail span.nd,', 'body.wild .tl .ti.cur .lc{display:block', '.lcb{display:block', 'body.wild .card.tkc{display:flex', 'body.wild .unit.slim{display:none}', 'body.rose .scn{filter:hue-rotate']) assert.ok(css.includes(k), 'CSS: ' + k);
  assert.ok(css.includes('@media (prefers-reduced-motion:reduce){.scn *{animation:none!important}}'), 'sem animação quando o aparelho pede menos movimento');
  assert.match(css, /\.tl\{--row:170px;--top:100px;/);
  // o texto de cada passo continua na página (escondido só da vista) para leitores de tela
  assert.match(css, /body\.wild \.tl \.ti \.tb,body\.wild \.tl \.ti\.rs \.tb\{position:absolute;[^}]*clip:rect\(0 0 0 0\)/);
  // a lógica do mapa não mudou: lição, checkpoint e prova continuam abrindo pelo toque na linha toda
  assert.ok(ui.includes("onclick=\"openL('${l.id}')\"") && ui.includes("onclick=\"openTest('${c.id}')\""));
});

test('admin: autenticador (código de 6 dígitos) — TOTP, QR Code, uma vez só, bloqueio e recuperação', async () => {
  const totp = require('../totp'), qr = require('../qr');
  // a conta do código bate com os exemplos oficiais da RFC 6238 (segredo "12345678901234567890")
  const sec = totp.b32enc(Buffer.from('12345678901234567890'));
  assert.equal(sec, 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ'); assert.equal(totp.hotp(Buffer.from('12345678901234567890'), 1, 8), '94287082');
  assert.equal(totp.code(sec, 59e3), '287082'); assert.equal(totp.code(sec, 1111111109e3), '081804'); assert.equal(totp.code(sec, 1234567890e3), '005924');
  assert.equal(totp.b32dec(sec).toString(), '12345678901234567890');
  assert.ok(totp.check(sec, '287082', 59e3) >= 0 && totp.check(sec, '287082', 59e3 + 30e3) >= 0 && totp.check(sec, '287082', 59e3 + 95e3) < 0, 'aceita só o passo anterior e o seguinte');
  assert.equal(totp.check(sec, '12345', 59e3), -1); assert.equal(totp.check(sec, 'abcdef', 59e3), -1); assert.equal(totp.check(sec, '', 59e3), -1);
  const ns = totp.newSecret(); assert.match(ns, /^[A-Z2-7]{32}$/); assert.notEqual(ns, totp.newSecret());
  assert.match(totp.uri(ns, 'admin@site.com', 'CodeUp'), /^otpauth:\/\/totp\/CodeUp:admin%40site\.com\?secret=[A-Z2-7]{32}&issuer=CodeUp&algorithm=SHA1&digits=6&period=30$/);
  // QR Code: tamanho certo por versão, três quadrados de canto, sem dependência externa
  const m = qr.matrix(totp.uri(ns, 'admin@localhost', 'CodeUp')); assert.ok(m.length >= 41 && m.length <= 57 && (m.length - 17) % 4 == 0);
  for (const [x, y] of [[0, 0], [m.length - 7, 0], [0, m.length - 7]]) { assert.ok(m[y][x] && m[y][x + 6] && m[y + 6][x] && m[y + 6][x + 6] && !m[y + 1][x + 1] && m[y + 3][x + 3], 'quadrado de canto'); }
  const sv = qr.svg('https://exemplo.com'); assert.match(sv, /^<svg [^>]*viewBox="0 0 \d+ \d+"[^>]*>/); assert.ok(sv.includes('<path d="M') && !sv.includes('<script'));
  assert.throws(() => qr.matrix('x'.repeat(400), 'M'), /grande demais/);

  const port = PORT + 860, base = 'http://localhost:' + port, d = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'tfa-')), 'data.json'), KEY = 'chave-2fa-1234567890';
  const boot = async env => { let lg = ''; const p = spawn('node', ['server.js'], { cwd: path.join(__dirname, '..'), env: { ...process.env, PORT: port, DATA_FILE: d, BASE_URL: base, ADMIN_KEY: KEY, DATABASE_URL: '', ADMIN_2FA_OFF: '', ...env } }); p.stdout.on('data', x => lg += x); p.stderr.on('data', x => lg += x); for (let i = 0; i < 150 && !/rodando/.test(lg); i++) await sleep(100); return p; };
  const j = async (pth, body, tok, hd) => { const x = await fetch(base + pth, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.77.' + (++IP % 200) + '.1', ...(tok ? { 'x-admin-token': tok } : {}), ...hd }, body: body ? JSON.stringify(body) : undefined }); return { status: x.status, j: await x.json().catch(() => ({})) }; };
  let IP = 0;
  const at = k => totp.code(SEC, Date.now() + k * 30e3);                         // código do passo de agora + k
  let SEC = '', p = await boot({ ADMIN_WHATSAPP: '(11) 99999-0000' });
  try {
    // 1) sem autenticador: só a chave (como sempre) e a tela sabe disso
    assert.deepEqual((await j('/api/admin/login-info')).j, { ready: true, twofa: false, needKey: true });
    const t1 = (await j('/api/admin/login', { key: KEY })).j.token, t2 = (await j('/api/admin/login', { key: KEY })).j.token; assert.ok(t1 && t2);
    assert.equal((await j('/api/admin/2fa', null, t1)).j.on, false);
    assert.equal((await j('/api/admin/2fa/start', {})).status, 404, 'sem sessão do painel não existe'); assert.equal((await j('/api/admin/2fa/start', {}, null, { 'x-admin-key': KEY })).status, 404, 'a chave de scripts não liga o autenticador');
    assert.equal((await j('/api/admin/stats', null, null, { 'x-admin-key': KEY })).status, 200, 'scripts com a chave seguem valendo enquanto o autenticador está desligado');
    // 2) ligar: QR + chave em texto; código errado não liga
    const st = (await j('/api/admin/2fa/start', {}, t1)).j; assert.match(st.secret, /^[A-Z2-7]{32}$/); assert.match(st.svg, /^<svg /); assert.match(st.uri, /^otpauth:\/\/totp\/CodeUp:admin%40localhost\?secret=/); assert.equal(st.pretty.replace(/ /g, ''), st.secret);
    assert.equal(st.wa, '5511999990000', 'ADMIN_WHATSAPP vira o número do botão "Enviar pelo WhatsApp" (só para quem está no painel; (11) 99999-0000 → 55 + DDD + número)');
    assert.equal((await j('/api/admin/2fa/start', {}, t1)).j.secret, st.secret, 'o mesmo QR vale por uns minutos (dá para errar o código sem refazer)');
    SEC = st.secret; assert.equal((await j('/api/admin/2fa/enable', { code: '000000', needKey: true }, t1)).status, 400);
    assert.equal((await j('/api/admin/2fa/enable', { code: at(-1), needKey: true }, t1)).status, 200);
    assert.equal((await j('/api/admin/ping', null, t2)).status, 401, 'quem estava logado só com a chave sai quando o autenticador liga'); assert.equal((await j('/api/admin/ping', null, t1)).status, 200);
    assert.equal((await j('/api/admin/stats', null, null, { 'x-admin-key': KEY })).status, 404, 'com o autenticador ligado a chave sozinha não abre mais nada');
    // 3) entrar: chave + código
    assert.deepEqual((await j('/api/admin/login-info')).j, { ready: true, twofa: true, needKey: true });
    assert.equal((await j('/api/admin/login', { key: KEY })).status, 401, 'só a chave não entra'); assert.equal((await j('/api/admin/login', { code: at(0) })).status, 401, 'só o código não entra neste modo');
    assert.equal((await j('/api/admin/login', { key: 'errada', code: at(0) })).status, 401);
    const bad = (await j('/api/admin/login', { key: KEY, code: '123456' })); assert.equal(bad.status, 401); assert.equal(bad.j.error, 'Chave ou código incorreto.', 'a mensagem não diz qual dos dois errou');
    const ok = await j('/api/admin/login', { key: KEY, code: at(0) }); assert.equal(ok.status, 200); assert.match(ok.j.token, /^[a-f0-9]{64}$/);
    const re = await j('/api/admin/login', { key: KEY, code: at(0) }); assert.equal(re.status, 401); assert.match(re.j.error, /já foi usado/, 'o mesmo código não vale duas vezes');
    assert.equal((await j('/api/admin/login', { key: KEY, code: at(-1) })).status, 401, 'nem um código mais antigo que o último usado');
    assert.equal((await j('/api/admin/stats', null, ok.j.token)).status, 200);
    const sys = (await j('/api/admin/system', null, ok.j.token)).j; assert.equal(sys.twofa, true); assert.equal(sys.twofaKey, true);
    // 4) desligar pede o código do app (um código novo, não o que acabou de entrar)
    assert.equal((await j('/api/admin/2fa/disable', { code: at(0) }, ok.j.token)).status, 400); assert.equal((await j('/api/admin/2fa/disable', { code: '111111' }, ok.j.token)).status, 400);
    assert.equal((await j('/api/admin/2fa/disable', { code: at(1) }, ok.j.token)).status, 200);
    assert.deepEqual((await j('/api/admin/login-info')).j, { ready: true, twofa: false, needKey: true }); assert.equal((await j('/api/admin/login', { key: KEY })).status, 200);
    // 5) "só o código": a chave deixa de ser pedida
    const t3 = (await j('/api/admin/login', { key: KEY })).j.token, s2 = (await j('/api/admin/2fa/start', {}, t3)).j; assert.notEqual(s2.secret, SEC, 'ligar de novo gera outro segredo'); SEC = s2.secret;
    assert.equal((await j('/api/admin/2fa/enable', { code: at(-1), needKey: false }, t3)).j.needKey, false);
    assert.deepEqual((await j('/api/admin/login-info')).j, { ready: true, twofa: true, needKey: false });
    assert.equal((await j('/api/admin/login', { code: '000000' })).status, 401); const o2 = await j('/api/admin/login', { code: at(0) }); assert.equal(o2.status, 200); assert.ok(o2.j.token);
    assert.equal((await j('/api/admin/login', { code: at(0) })).status, 401, 'também não repete');
    const au = (await j('/api/admin/audit?limit=60', null, o2.j.token)).j.rows.map(r => r.action); assert.ok(['ligou-autenticador', 'desligou-autenticador', 'login'].every(a => au.includes(a)), 'tudo fica na auditoria'); assert.ok(!JSON.stringify((await j('/api/admin/audit?limit=60', null, o2.j.token)).j).includes(SEC), 'o segredo nunca vai para a auditoria');
  } finally { p.kill(); await sleep(300); }
  // 6) perdeu o celular: ADMIN_2FA_OFF=1 no servidor volta a pedir só a chave (os dados continuam salvos)
  p = await boot({ ADMIN_2FA_OFF: '1' });
  try {
    assert.deepEqual((await j('/api/admin/login-info')).j, { ready: true, twofa: false, needKey: true });
    const t = (await j('/api/admin/login', { key: KEY })).j.token; assert.ok(t);
    const s = (await j('/api/admin/2fa', null, t)).j; assert.equal(s.on, false); assert.equal(s.stored, true); assert.equal(s.envOff, true);
    assert.match((await j('/api/admin/2fa/start', {}, t)).j.error, /ADMIN_2FA_OFF/);
  } finally { p.kill(); await sleep(300); }
  // 7) servidor normal de novo: o autenticador volta a valer, e 5 códigos errados seguidos travam o painel por 15 minutos
  p = await boot();
  try {
    assert.equal((await j('/api/admin/login-info')).j.twofa, true);
    for (let i = 0; i < 5; i++) assert.equal((await j('/api/admin/login', { code: '00000' + i })).status, 401);
    const lk = await j('/api/admin/login', { code: at(0) }); assert.equal(lk.status, 429); assert.match(lk.j.error, /Aguarde/, 'travado mesmo com o código certo');
  } finally { p.kill(); await sleep(300); }
  // a tela do painel
  const adm = fs.readFileSync(path.join(__dirname, '..', 'public', 'admin.js'), 'utf8'), acss = fs.readFileSync(path.join(__dirname, '..', 'public', 'admin.css'), 'utf8');
  for (const k of ["fetch('/api/admin/login-info'", 'autocomplete="one-time-code"', 'inputmode="numeric"', "'2fa-on'", "'2fa-off'", "api('2fa/start'", "api('2fa/enable'", "api('2fa/disable'", 'class="qrbox"', 'data-q="copy"', 'Abrir no app autenticador', 'Enviar pelo WhatsApp', 'https://wa.me/', 'navigator.clipboard.writeText(s.secret)', 'apague a mensagem', 'Chave + código (mais seguro, recomendado)', 'Só o código (mais prático)', 'Autenticador (código de 6 dígitos)', 'ADMIN_2FA_OFF']) assert.ok(adm.includes(k), 'admin.js: ' + k);
  assert.ok(acss.includes('.qrbox{') && acss.includes('.lg .in.code{') && acss.includes('.qrbt{'));
  assert.ok(!/\b55\d{10,11}\b/.test(adm) && !fs.readFileSync(path.join(__dirname, '..', 'admin.js'), 'utf8').match(/\b55\d{10,11}\b/), 'nenhum número de telefone fixo no código (o repositório é público)');
});

test('guarda-roupa: regras das fantasias, imagens, compra com diamantes e dias de estudo', async () => {
  const pubd = path.join(__dirname, '..', 'public'), C = Rw.COSTUMES;
  // tabela: Tay (7 de conquista + 13 na loja) e Cut (7 + 12). Conquista = título + dias de estudo; loja = título + diamantes. Cada uma com as 3 imagens
  assert.equal(C.length, 39); assert.equal(new Set(C.map(c => c.key)).size, 39, 'chaves únicas entre os dois personagens');
  for (const c of C) {
    assert.match(c.key, /^[a-z]+$/); assert.ok(c.name && (c.guide === 'tay' || c.guide === 'cut')); assert.ok(Number.isInteger(c.tier) && c.tier >= 1 && c.tier < Rw.TIERS.length, c.key + ': título válido');
    assert.ok(!!c.days !== !!c.price, c.key + ': ou é conquista (dias) ou é da loja (preço), nunca os dois');
    for (const f of ['', '-t', '-face']) assert.ok(fs.existsSync(path.join(pubd, 'img', 'fan', c.key + f + '.webp')), 'falta a imagem ' + c.key + f);
  }
  const oneTrack = lessons.filter(l => l.track === 'python').length * 5 + lessons.checkpoints.filter(c => c.track === 'python').length * 5 + lessons.finals.filter(f => f.track === 'python').length * 20;
  for (const [g, nGift, nShop] of [['tay', 7, 13], ['cut', 7, 12]]) {
    const mine = Rw.costumesOf(g), gifts = mine.filter(c => c.days), shop = mine.filter(c => c.price);
    assert.equal(gifts.length, nGift, g); assert.equal(shop.length, nShop, g);
    assert.deepEqual(gifts.map(c => c.tier).sort(), [1, 2, 3, 4, 5, 6, 7], g + ': uma conquista para cada título, de Aprendiz a Lenda');
    const gs = [...gifts].sort((a, b) => a.tier - b.tier); for (let i = 1; i < gs.length; i++) assert.ok(gs[i].days > gs[i - 1].days, g + ': quanto mais alto o título, mais dias de estudo');
    for (const a of shop) for (const b of shop) if (a.tier < b.tier) assert.ok(a.price <= b.price, `${g}: ${a.key} (título menor) não pode custar mais que ${b.key}`);
    assert.ok(Math.min(...shop.map(c => c.price)) <= 60, g + ': a primeira fantasia sai com poucas lições (5 diamantes cada)');
    // quanto de diamante o curso inteiro dá: uma trilha compra boa parte da loja, mas não tudo
    assert.ok(oneTrack >= 450 && oneTrack < shop.reduce((s, c) => s + c.price, 0), g + ': diamantes de uma trilha: ' + oneTrack);
  }
  assert.deepEqual(Object.keys(Rw.STREAK_GEMS).map(Number), [3, 7, 14, 30, 60, 100]);
  // estados (mesma regra no navegador e no servidor)
  const P = (xp, days, gems, own) => ({ xp, days, gems, own: own || null }), st = (k, p) => Rw.costumeState(Rw.costume(k), p);
  assert.equal(st('gatinha', P(99, 99, 0)), 'tier'); assert.equal(st('gatinha', P(100, 2, 0)), 'days'); assert.equal(st('gatinha', P(100, 3, 0)), 'own'); assert.equal(st('gatinha', P(9999, 2, 0)), 'days', 'XP sozinho não basta: precisa da frequência');
  assert.equal(st('unicornio', P(99, 0, 999)), 'tier', 'diamantes sozinhos não compram: precisa do título'); assert.equal(st('unicornio', P(100, 0, 59)), 'poor'); assert.equal(st('unicornio', P(100, 0, 60)), 'buy'); assert.equal(st('unicornio', P(0, 0, 0, { unicornio: 'x' })), 'own', 'o que foi comprado fica');
  assert.equal(Rw.costume('toString'), null, 'chave inventada não existe'); assert.equal(Rw.costume('__proto__'), null);
  const mine = g => Rw.ownedCostumes(P(300, 6, 0)).filter(k => Rw.costume(k).guide === g); assert.deepEqual(mine('tay'), ['gatinha', 'dino']); assert.deepEqual(mine('cut'), ['gatinho', 'dinossauro'], 'as conquistas valem igual para os dois personagens');

  // servidor: a Tay compra, veste e o ranking mostra
  const em = 'gr1@teste.com', tk = await regP(em, 'Gabi Roupa', { sex: 'f', guide: 'tay', gname: 'Nina' }), me = async () => (await call('/api/me', { token: tk })).j;
  const buy = k => call('/api/costume/buy', { token: tk, body: { key: k } }), wear = k => call('/api/costume/wear', { token: tk, body: { key: k } });
  await call('/api/track', { token: tk, body: { track: 'python' } });
  let m = await me(); assert.deepEqual([m.gems, m.days, m.own, m.cos], [0, 0, [], null]);
  assert.equal((await call('/api/costume/buy', { body: { key: 'unicornio' } })).status, 401);
  let r = await buy('unicornio'); assert.equal(r.status, 403); assert.match(r.j.error, /Libera com o título Aprendiz/);
  const L1 = lessonsOf('python', 1), cp10 = lessons.checkpoints.find(c => c.track === 'python' && c.lv === 1 && c.after === 10);
  for (const l of L1.slice(0, 10)) assert.equal((await doLesson(tk, l)).j.ok, true);
  r = await doTest(tk, cp10); assert.equal(r.j.ok, true); assert.equal(r.j.gemsGot, 5, 'checkpoint dá 5 diamantes');
  for (const l of L1.slice(10, 12)) assert.equal((await doLesson(tk, l)).j.ok, true);
  m = await me(); assert.equal(m.gems, 65); assert.equal(m.days, 1, 'vários acertos no mesmo dia contam um dia só'); assert.equal(m.streak, 1);
  r = await buy('gatinha'); assert.equal(r.status, 400); assert.match(r.j.error, /dias de estudo/, 'conquista não se compra');
  r = await wear('gatinha'); assert.equal(r.status, 400); assert.match(r.j.error, /ainda não tem/);
  r = await buy('vaquinha'); assert.equal(r.status, 403, 'precisa do título Praticante'); assert.equal((await buy('naoexiste')).status, 400); assert.equal((await buy('__proto__')).status, 400); assert.equal((await buy(7)).status, 400); assert.equal((await buy('')).status, 400);
  r = await buy('unicornio'); assert.equal(r.status, 200); assert.deepEqual([r.j.gems, r.j.own, r.j.cos], [5, ['unicornio'], 'unicornio'], 'pagou 60 e já saiu vestindo');
  r = await buy('unicornio'); assert.equal(r.status, 400); assert.match(r.j.error, /já tem/); assert.equal((await me()).gems, 5, 'comprar de novo não cobra');
  r = await buy('panda'); assert.equal(r.status, 400); assert.match(r.j.error, /Faltam 55 diamantes/); assert.equal((await me()).gems, 5, 'sem saldo não tira nada');
  const rkr = (await rk(tk)).mine; assert.equal(rkr.cos, 'unicornio', 'o ranking mostra o rostinho de fantasia');
  assert.equal((await wear('nenhuma')).j.cos, null); assert.equal((await wear('dino')).status, 400); assert.equal((await wear('unicornio')).j.cos, 'unicornio'); assert.equal((await wear('')).status, 400);
  // a fantasia é da Tay: com o Cut ela fica guardada e não vale; ao voltar para a Tay, volta
  r = await call('/api/guide', { token: tk, body: { guide: 'cut' } }); assert.deepEqual([r.j.cos, r.j.own], [null, []]);
  r = await buy('panda'); assert.equal(r.status, 400); assert.match(r.j.error, /não existe para o seu personagem/);
  r = await call('/api/guide', { token: tk, body: { guide: 'tay' } }); assert.deepEqual([r.j.cos, r.j.own], ['unicornio', ['unicornio']]);
  // o Cut tem as dele: mesmas regras, outras fantasias; a da Tay não vale para ele e vice-versa
  const tc = await regP('gr3@teste.com', 'Caio Roupa', { sex: 'm', guide: 'cut', gname: 'Beto' }), cbuy = (k, t = tc) => call('/api/costume/buy', { token: t, body: { key: k } });
  await call('/api/track', { token: tc, body: { track: 'python' } });
  for (const l of L1.slice(0, 10)) assert.equal((await doLesson(tc, l)).j.ok, true);
  assert.equal((await doTest(tc, cp10)).j.ok, true); for (const l of L1.slice(10, 12)) assert.equal((await doLesson(tc, l)).j.ok, true);
  m = (await call('/api/me', { token: tc })).j; assert.deepEqual([m.guide, m.gems, m.own, m.cos], ['cut', 65, [], null]);
  r = await cbuy('unicornio', tc); assert.equal(r.status, 400); assert.match(r.j.error, /não existe para o seu personagem/, 'fantasia da Tay não vale para o Cut');
  r = await cbuy('gatinho'); assert.equal(r.status, 400, 'conquista não se compra'); r = await cbuy('ursinho'); assert.equal(r.status, 403, 'precisa do título Praticante');
  r = await cbuy('tubarao'); assert.equal(r.status, 200); assert.deepEqual([r.j.gems, r.j.own, r.j.cos], [5, ['tubarao'], 'tubarao']);
  assert.equal((await rk(tc)).mine.cos, 'tubarao'); r = await call('/api/costume/wear', { token: tc, body: { key: 'unicornio' } }); assert.equal(r.status, 400);
  r = await call('/api/guide', { token: tc, body: { guide: 'tay' } }); assert.deepEqual([r.j.cos, r.j.own], [null, []], 'trocar de personagem guarda as fantasias do outro');
  r = await call('/api/guide', { token: tc, body: { guide: 'cut' } }); assert.deepEqual([r.j.cos, r.j.own], ['tubarao', ['tubarao']]);

  // dias de estudo, bônus de sequência e conquista de fantasia: servidor à parte, com a data de "ontem" ajustada no arquivo
  const port = PORT + 870, base = 'http://localhost:' + port, d = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'gr-')), 'data.json');
  const boot = async () => { let lg = ''; const p = spawn('node', ['server.js'], { cwd: path.join(__dirname, '..'), env: { ...process.env, PORT: port, DATA_FILE: d, BASE_URL: base, RELAX_SUBMIT_LIMIT: '1', DEV_SHOW_RESET_LINK: '1', DATABASE_URL: '' } }); p.stdout.on('data', x => lg += x); p.stderr.on('data', x => lg += x); for (let i = 0; i < 450 && !/rodando/.test(lg); i++) await new Promise(z => setTimeout(z, 100)); assert.match(lg, /rodando/, lg); return p; };
  let ip = 0; const j = async (pth, body, t) => { const x = await fetch(base + pth, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.88.' + (++ip % 200) + '.1', ...(t ? { 'x-token': t } : {}) }, body: body ? JSON.stringify(body) : undefined }); return { status: x.status, j: await x.json().catch(() => null) }; };
  const ydIso = () => new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  const setUser = fn => { const D = JSON.parse(fs.readFileSync(d, 'utf8')), u = Object.values(D.users).find(x => x.email === 'gr2@teste.com'); fn(u); fs.writeFileSync(d, JSON.stringify(D)); };
  let p = await boot(), t2;
  try {
    const rg = await j('/api/register', { name: 'Dani Dias', email: 'gr2@teste.com', password: 'segredo1', accept: true, sex: 'f', guide: 'tay' }); t2 = rg.j.token; await j('/api/track', { track: 'python' }, t2);
    const sub = async l => {                                     // as 2 atividades da lição (executar + ler); checkpoint tem uma só
      const a = await j('/api/submit', { id: l.id, code: l.solution, out: l.expectedOut }, t2); if (!a.j || a.j.next !== 'r') return a;
      const b = await j('/api/read', { id: l.id, a: Array.isArray(l.read.ok) ? l.read.ok[0] : l.read.ok }, t2);
      return { ...b, j: { ...a.j, ...b.j, gemsGot: (a.j.gemsGot || 0) + (b.j.gemsGot || 0), gemBonus: a.j.gemBonus ?? b.j.gemBonus, newCos: [...(a.j.newCos || []), ...(b.j.newCos || [])] } };
    };
    for (const l of L1.slice(0, 10)) assert.equal((await sub(l)).j.ok, true);
    let x = (await sub(cp10)).j; assert.equal(x.ok, true); assert.deepEqual([x.days, x.streak, x.gemBonus, x.newCos], [1, 1, undefined, []]); assert.equal(x.gems, 55);
    p.kill(); await new Promise(z => setTimeout(z, 400));
    setUser(u => { u.last = ydIso(); u.streak = 2; u.days = 2; });             // estudou ontem e anteontem: hoje fecha 3 dias seguidos
    p = await boot();
    x = (await sub(L1[10])).j; assert.equal(x.ok, true); assert.deepEqual([x.days, x.streak, x.gemBonus, x.newCos, x.gemsGot], [3, 3, 5, ['gatinha'], 10], 'dia 3: +5 de bônus, +5 da lição e a fantasia Gatinha (título Aprendiz + 3 dias)');
    assert.deepEqual([x.own, x.gems], [['gatinha'], 65]); assert.equal(x.cos, null, 'ganhar não veste sozinha');
    x = (await sub(L1[11])).j; assert.deepEqual([x.days, x.newCos, x.gemBonus, x.gemsGot], [3, [], undefined, 5], 'mais uma lição no mesmo dia não conta outro dia nem repete o bônus');
    assert.equal((await j('/api/costume/wear', { key: 'gatinha' }, t2)).j.cos, 'gatinha');
    p.kill(); await new Promise(z => setTimeout(z, 400));
    setUser(u => { u.last = ydIso(); u.streak = 6; u.days = 3; });           // sequência de 6 → hoje vira 7 (+10 de bônus, só uma vez); dias nunca ficam abaixo da sequência
    p = await boot(); x = (await sub(L1[11])).j; assert.deepEqual([x.streak, x.days, x.gemBonus], [7, 7, 10], 'dias = max(dias, sequência) + 1');
    p.kill(); await new Promise(z => setTimeout(z, 400));
    setUser(u => { u.last = ydIso(); u.streak = 6; });                         // quebrou e chegou de novo ao 7: o bônus daquele marco não se repete
    p = await boot(); x = (await sub(L1[11])).j; assert.deepEqual([x.streak, x.gemBonus], [7, undefined]);
    // conta antiga (sem o contador de dias): parte da sequência que já tinha
    p.kill(); await new Promise(z => setTimeout(z, 400));
    setUser(u => { delete u.days; u.last = ydIso(); u.streak = 9; u.xp = 700; });
    p = await boot(); const mm = (await j('/api/me', null, t2)).j; assert.equal(mm.days, 9, 'sem contador: vale a sequência'); assert.ok(mm.own.includes('dino'), 'Praticante com 9 dias já ganha o Dino (6 dias)'); assert.ok(!mm.own.includes('doutora'), 'Doutora pede Destaque e 12 dias');
  } finally { p.kill(); }

  // o app: aba Fantasias, compra/vestir, contador de diamantes, imagens no lugar do corpo animado e cache offline novo
  const app = fs.readFileSync(path.join(pubd, 'app.js'), 'utf8'), css = fs.readFileSync(path.join(pubd, 'style.css'), 'utf8'), sw = fs.readFileSync(path.join(pubd, 'sw.js'), 'utf8');
  for (const s of ['function wardrobe()', 'function cosOpen(', "api('costume/buy'", "api('costume/wear'", 'function openWardrobe()', 'const COS = ', 'data-k=gems', "['fan', 'Fantasias']", 'gem: ']) assert.ok(app.includes(s), 'app.js sem ' + s);
  assert.match(app, /const body = \([^)]*\) => COS\(\) \?/); assert.match(app, /const walker = \(\) => COS\(\) \?/); assert.match(app, /const ovHero = \([^)]*\) => COS\(\) \?/, 'com fantasia o personagem é a imagem (sem WebGL)');
  for (const s of ['.wdg{', '.wdc{', '.pill.gem', '.wsh .wpv', '@keyframes cjump']) assert.ok(css.includes(s), 'style.css sem ' + s);
  assert.match(sw, /codeup-v(5[2-9]|[6-9]\d)/, 'o cache offline foi trocado');
});

test('admin: entrada fixa com e-mail e senha (ADMIN_EMAIL + ADMIN_PASSWORD), sem autenticador', async () => {
  const port = PORT + 880, base = 'http://localhost:' + port, d = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'ae-')), 'data.json'), EM = 'Dono.Do.Site@Exemplo.com', PW = 'senha-fixa-do-dono-123';
  const boot = async env => { let lg = ''; const p = spawn('node', ['server.js'], { cwd: path.join(__dirname, '..'), env: { ...process.env, PORT: port, DATA_FILE: d, BASE_URL: base, DATABASE_URL: '', ADMIN_KEY: '', ADMIN_PASSWORD: '', ADMIN_EMAIL: '', ADMIN_2FA_OFF: '', ...env } }); p.stdout.on('data', x => lg += x); p.stderr.on('data', x => lg += x); for (let i = 0; i < 450 && !/rodando/.test(lg); i++) await new Promise(z => setTimeout(z, 100)); assert.match(lg, /rodando/, lg); return p; };
  let ip = 0; const j = async (pth, body, tok, hd) => { const x = await fetch(base + pth, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.66.' + (++ip % 200) + '.1', ...(tok ? { 'x-admin-token': tok } : {}), ...hd }, body: body ? JSON.stringify(body) : undefined }); return { status: x.status, j: await x.json().catch(() => null) }; };
  let p = await boot({ ADMIN_EMAIL: EM, ADMIN_PASSWORD: PW });
  try {
    assert.deepEqual((await j('/api/admin/login-info')).j, { ready: true, twofa: false, needKey: true, email: true }, 'a tela sabe que deve pedir e-mail + senha');
    let r = await j('/api/admin/login', { key: PW }); assert.equal(r.status, 401, 'só a senha, sem o e-mail, não entra'); assert.equal(r.j.error, 'E-mail ou senha incorretos.');
    r = await j('/api/admin/login', { email: 'outro@exemplo.com', key: PW }); assert.equal(r.status, 401); assert.equal(r.j.error, 'E-mail ou senha incorretos.', 'a mensagem é a mesma para e-mail errado e senha errada');
    r = await j('/api/admin/login', { email: EM, key: 'senha-errada' }); assert.equal(r.status, 401); assert.equal(r.j.error, 'E-mail ou senha incorretos.');
    r = await j('/api/admin/login', { email: EM }); assert.equal(r.status, 401);
    r = await j('/api/admin/login', { email: '  dono.do.site@exemplo.COM ', key: PW }); assert.equal(r.status, 200, 'e-mail sem diferenciar maiúsculas e espaços nas pontas'); assert.ok(r.j.token);
    assert.equal((await j('/api/admin/ping', null, r.j.token)).status, 200);
    const sys = (await j('/api/admin/system', null, r.j.token)).j; assert.equal(sys.keyFromEnv, true); assert.equal(sys.emailFromEnv, true); assert.equal(sys.twofa, false, 'sem autenticador');
    assert.equal((await j('/api/admin/stats', null, null, { 'x-admin-key': PW })).status, 200, 'rotas de script continuam com a senha no cabeçalho x-admin-key');
    assert.equal((await j('/api/admin/stats', null, null, { 'x-admin-key': 'errada' })).status, 404);
    const au = (await j('/api/admin/audit', null, r.j.token)).j, txt = JSON.stringify(au); assert.ok(/login-falhou/.test(txt) && !txt.includes(PW) && !txt.includes(EM.toLowerCase()), 'a auditoria registra a falha sem guardar senha nem e-mail');
  } finally { p.kill(); }
  await new Promise(z => setTimeout(z, 400));
  // se houver ADMIN_KEY antiga E ADMIN_PASSWORD, só a senha nova vale (nem o painel nem as rotas de script aceitam a chave velha)
  p = await boot({ ADMIN_EMAIL: EM, ADMIN_PASSWORD: PW, ADMIN_KEY: 'chave-antiga-que-nao-vale-mais' });
  try {
    assert.equal((await j('/api/admin/login', { email: EM, key: 'chave-antiga-que-nao-vale-mais' })).status, 401, 'a chave antiga não entra mais');
    assert.equal((await j('/api/admin/login', { email: EM, key: PW })).status, 200, 'a senha nova entra');
    assert.equal((await j('/api/admin/stats', null, null, { 'x-admin-key': 'chave-antiga-que-nao-vale-mais' })).status, 404);
  } finally { p.kill(); }
  await new Promise(z => setTimeout(z, 400));
  // sem ADMIN_EMAIL: continua só a chave, como antes (e ADMIN_PASSWORD vale como a chave)
  p = await boot({ ADMIN_PASSWORD: PW });
  try {
    assert.deepEqual((await j('/api/admin/login-info')).j, { ready: true, twofa: false, needKey: true });
    assert.equal((await j('/api/admin/login', { key: 'x' })).j.error, 'Chave incorreta.'); assert.equal((await j('/api/admin/login', { key: PW })).status, 200);
  } finally { p.kill(); }
  // a tela e os textos
  const adm = fs.readFileSync(path.join(__dirname, '..', 'public', 'admin.js'), 'utf8'), env = fs.readFileSync(path.join(__dirname, '..', '.env.example'), 'utf8'), rd = fs.readFileSync(path.join(__dirname, '..', 'README.md'), 'utf8');
  for (const k of ['li.email', 'id="em"', 'autocomplete="username"', "email: e1 ? e1.value : ''", 'Entre com o e-mail e a senha de administrador.', 'ADMIN_EMAIL', 'ADMIN_PASSWORD']) assert.ok(adm.includes(k), 'admin.js: ' + k);
  assert.ok(env.includes('ADMIN_EMAIL=') && env.includes('ADMIN_PASSWORD=') && rd.includes('ADMIN_EMAIL') && rd.includes('ADMIN_PASSWORD'), 'documentado');
});

test('telas de entrada: nunca o cenário Rosa; o Rosa da Tay só vale dentro do app', () => {
  const app = fs.readFileSync(path.join(__dirname, '..', 'public', 'app.js'), 'utf8');
  assert.match(app, /if \(sk === 'rose'\) \{ cl\.add\('wild'\); if \(localStorage\.getItem\('tk'\)\) cl\.add\('rose'\); \}/, 'antes da primeira pintura: sem conta aberta, o rosa não aparece');
  assert.ok(app.includes("const entrySkin = () => { const v = skinOf(); return v === 'rose' ? 'wild' : v; };"), 'entrySkin troca só o Rosa pelo Azul');
  assert.match(app, /function showAuth\(\) \{\n  theme\(null\); applySkin\(entrySkin\(\)\);/, 'login, cadastro e senha usam o visual de entrada');
  assert.match(app, /function wizard\(\) \{\n  const w = S\.wz, st = w\.need\[w\.i\]; theme\(null\); if \(!w\.logged\) applySkin\(entrySkin\(\)\);/, 'o assistente do cadastro também');
  assert.ok(app.includes('if (w.logged) applySkin(g === \'tay\' ? \'rose\' : S.skin0'), 'escolher a Tay no cadastro não troca o cenário na hora');
  assert.ok(app.includes("applySkin(w.logged ? sk : entrySkin())"), 'ao terminar o cadastro a tela de entrada continua azul');
  assert.ok(app.includes("applySkin(skinOf()); go('home');"), 'ao entrar no app vale o visual salvo');
});

// ---------------- Excel ----------------
test('Excel: o servidor entrega a planilha sem o gabarito, corrige as fórmulas e barra valor digitado à mão', async () => {
  const tk = await reg('excel1@t.com', 'Exa');
  assert.equal((await call('/api/track', { token: tk, body: { track: 'excel' } })).j.track, 'excel');
  const list = (await call('/api/lessons', { token: tk })).j, ex = list.filter(l => l.track === 'excel');
  assert.equal(ex.length, 30); assert.deepEqual(ex.map(l => l.n), Array.from({ length: 30 }, (_, i) => i + 1)); assert.ok(ex.every(l => l.lv === 1 && l.type === 'excel'));
  assert.deepEqual(ex.slice(0, 3).map(l => l.lock), [null, 'seq', 'seq']);
  const l1 = (await call('/api/lessons/xl-1-01', { token: tk })).j;
  assert.ok(l1.sheet && l1.sheet.rows.length && l1.targets.length, 'a planilha e as células pedidas chegam ao navegador');
  for (const k of ['answer', 'altSet', 'keep', 'noAlt', 'need']) assert.ok(!(k in l1), `o gabarito (${k}) não pode chegar ao navegador`);
  assert.equal((await call('/api/lessons/xl-1-02', { token: tk })).status, 409, 'não pula lição');
  assert.equal((await call('/api/lessons/xl-2-01', { token: tk })).status, 404, 'o Excel Intermediário ainda não existe');
  // errado: o resultado de cada célula volta com o valor que veio e o esperado
  let r = (await call('/api/submit', { token: tk, body: { id: 'xl-1-01', code: JSON.stringify({ B2: '=15+26' }) } })).j;
  assert.equal(r.ok, false); assert.equal(r.xl.cells[0].why, 'valor'); assert.equal(r.xl.cells[0].got, '41'); assert.equal(r.xl.cells[0].want, '42'); assert.equal((await call('/api/me', { token: tk })).j.xp, 0);
  r = (await call('/api/submit', { token: tk, body: { id: 'xl-1-01', code: '' } })).j; assert.equal(r.ok, false, 'resposta vazia');
  r = (await call('/api/submit', { token: tk, body: { id: 'xl-1-01', code: JSON.stringify({ B2: '42' }) } })).j; assert.equal(r.ok, false); assert.equal(r.xl.cells[0].why, 'fixo', 'número digitado no lugar da fórmula');
  r = (await call('/api/submit', { token: tk, body: { id: 'xl-1-01', code: JSON.stringify({ B2: '=15+(27' }) } })).j; assert.equal(r.xl.cells[0].why, 'sintaxe');
  // certo
  r = (await doLesson(tk, lessons.find(l => l.id === 'xl-1-01'))).j; assert.equal(r.ok, true); assert.equal(r.gained, 10); assert.equal(r.xp, 10);
  assert.equal((await call('/api/lessons/xl-1-02', { token: tk })).status, 200, 'a lição seguinte abre');
  // a lição 3: usar o valor em vez da célula dá o número certo hoje, mas não passa na planilha alternativa
  assert.equal((await doLesson(tk, lessons.find(l => l.id === 'xl-1-02'))).j.ok, true);
  r = (await call('/api/submit', { token: tk, body: { id: 'xl-1-03', code: JSON.stringify({ D2: '=2,5*10' }) } })).j; assert.equal(r.ok, false); assert.equal(r.xl.cells[0].why, 'alt', 'fórmula que não acompanha os dados');
  r = (await call('/api/submit', { token: tk, body: { id: 'xl-1-03', code: JSON.stringify({ D2: '=C2*B2' }) } })).j; assert.equal(r.ok, true, 'qualquer fórmula certa vale');
  // conferência ao vivo não dá XP
  const before = (await call('/api/me', { token: tk })).j.xp; r = (await call('/api/check', { token: tk, body: { id: 'xl-1-04', code: '{}' } }));
  assert.ok([200, 409].includes(r.status)); assert.equal((await call('/api/me', { token: tk })).j.xp, before);
});

test('Excel: provas (checkpoints e prova final) sem gabarito, com chances e o curso conclui no nível Básico', async () => {
  const tk = await reg('excel2@t.com', 'Xavier');
  const cps = (await call('/api/checkpoints', { token: tk })).j.filter(c => c.track === 'excel');
  assert.deepEqual(cps.map(c => c.id), ['cp-xl-1-10', 'cp-xl-1-20', 'fin-xl-1']); assert.ok(cps.every(c => !LEAK.some(k => k in c)), 'a lista de provas não entrega gabarito');
  const C10 = (await call('/api/lessons/cp-xl-1-10', { token: tk }));
  assert.equal(C10.status, 409, 'o checkpoint só abre depois da lição 10');
  for (const l of lessonsOf('excel', 1).slice(0, 10)) assert.equal((await doLesson(tk, l)).j.ok, true, l.id);
  const c = (await call('/api/lessons/cp-xl-1-10', { token: tk })).j; assert.ok(c.sheet && c.targets.length); assert.ok(!LEAK.some(k => k in c), 'a prova aberta não tem gabarito nem solução');
  let r = (await missTest(tk, lessons.checkpoints.find(x => x.id === 'cp-xl-1-10'))).j; assert.equal(r.ok, false); assert.equal(r.left, 1);
  r = (await call('/api/submit', { token: tk, body: { id: 'cp-xl-1-10', code: JSON.stringify({ D2: '=B2*C2' }) } })).j; assert.equal(r.ok, false); assert.deepEqual(r.rewind, { from: 6, to: 10, back: 5 }, 'gastou as 2 chances: volta 5 lições');
  // faz o curso inteiro (o nível Básico): lições, checkpoints e prova final
  const tk2 = await reg('excel3@t.com', 'Xuxa');
  await doLevelLessons(tk2, 'excel', 1);
  assert.equal((await call('/api/lessons/fin-xl-1', { token: tk2 })).status, 200);
  r = (await doFinal(tk2, 'excel', 1)).j; assert.equal(r.ok, true); assert.equal(r.test, 'fin'); assert.equal(r.gained, 50); assert.ok(r.passed['excel-1']); assert.equal(r.trackComplete, true, 'o Excel tem só o nível Básico por enquanto: passar nele conclui o curso');
  const me = (await call('/api/me', { token: tk2 })).j; assert.equal(me.certs, undefined);
});

test('Excel: arquivos da planilha no navegador (motor, tela, logo) e carregados antes do app', async () => {
  const pubDir = path.join(__dirname, '..', 'public'), rd = f => fs.readFileSync(path.join(pubDir, f), 'utf8'), html = rd('index.html'), sw = rd('sw.js'), ui = rd('app.js'), xu = rd('xlui.js'), css = rd('style.css');
  assert.ok(html.indexOf('/xl.js') > 0 && html.indexOf('/xl.js') < html.indexOf('/xlui.js') && html.indexOf('/xlui.js') < html.indexOf('/app.js'), 'xl.js, xlui.js e só depois o app');
  for (const f of ['/xl.js', '/xlui.js']) { assert.equal((await fetch(U + f)).status, 200); assert.ok(sw.includes(`'${f}'`), f + ' fica no cache offline'); }
  assert.match(sw, /codeup-v(5[5-9]|[6-9]\d)/, 'cache novo para quem já tinha a versão anterior');
  assert.ok(!/(^|[^.\w])eval\s*\(|new Function|Function\s*\(/.test(rd('xl.js').replace(/\/\/[^\n]*/g, '')), 'o motor da planilha não executa código do aluno');
  for (const k of ['xlBox', 'xlInit', 'xlCode', 'xlCommit', 'xlStatic', 'xlPreview', 'xlDiag', 'xlMark', 'xlFill', 'xlTap', 'xlIns']) assert.ok(new RegExp('(function|const) ' + k + '\\b').test(xu), 'função ' + k);
  for (const k of ['.xs{', '.xfb{', '.xsym', '.xk{', '.xt{', '.xt td.xtg', '.xt td.xsel', '.xt td.xvok', '.xt td.xvno']) assert.ok(css.includes(k), 'CSS ' + k);
  // a prática de Excel usa a planilha, e o botão Concluído manda o JSON das células
  for (const k of ["X = l.type == 'excel'", 'xlBox(l)', 'xlInit(l)', 'xlCode()', 'xlDiag(l, s)', 'xlMark(s)', 'OUT0X']) assert.ok(ui.includes(k), 'app.js: ' + k);
  assert.equal((await fetch(U + '/img/logo-excel.webp')).status, 200);
});

// ---------------- Duas atividades por lição: 1 executar + 2 ler o código ----------------
test('ler o código: toda lição tem a sua atividade e a resposta certa é provada rodando o código (npm run check:ler)', async () => {
  const lerCheck = require('../tools/check-ler'), st = await lerCheck.main();
  assert.deepEqual(lerCheck.bad, [], 'atividades de ler com problema:\n' + lerCheck.bad.join('\n'));
  assert.equal(st.items, 210); assert.ok(st.proved >= 200, 'quase todas precisam de prova por execução: ' + st.proved);
  assert.equal(lessons.filter(l => !l.read).length, 0, 'toda lição (Python, SQL, Excel e Power BI) tem a 2ª atividade');
  assert.equal(lessons.filter(l => l.type === 'python').length, 90); assert.equal(lessons.filter(l => l.type === 'sql').length, 90); assert.equal(lessons.filter(l => l.type === 'excel').length, 30);
  assert.equal(lessons.filter(l => l.track === 'powerbi').length, 30, 'o Power BI e DAX tem 30 lições (dax ou quiz), conferidas em npm run check:pbi');
  const kinds = {}; for (const l of lessons) kinds[l.read.k] = (kinds[l.read.k] || 0) + 1; assert.ok(kinds.mc > 100 && kinds.type >= 10, 'mistura de escolher e digitar: ' + JSON.stringify(kinds));
  // as provas (checkpoints e prova final) continuam com uma atividade só
  for (const t of [...lessons.checkpoints, ...lessons.finals]) assert.ok(!t.read, t.id + ': prova não tem atividade de ler');
  const fs2 = require('node:fs'), tb = JSON.parse(fs2.readFileSync(path.join(__dirname, '..', 'content', 'seed-tables.json'), 'utf8'));
  for (const l of lessons.filter(x => x.type === 'sql')) assert.ok(tb[l.read.seedKey] && tb[l.read.seedKey].length, l.id + ': o aluno vê as tabelas enquanto lê o SQL');
});

test('duas atividades: ler só abre depois de executar; o XP e os diamantes se dividem; a lição só conclui e libera a próxima com as duas', async () => {
  const tk = await reg('duas@teste.com', 'Duas'), l1 = lessons.find(l => l.id === 'py-1-01'), l2 = lessons.find(l => l.id === 'py-1-02');
  const list = (await call('/api/lessons', { token: tk })).j; assert.ok(list.every(r => r.rd === 1), 'o mapa sabe que toda lição tem 2 atividades');
  // ler antes de executar: barrado (leitura e envio)
  let r = await call('/api/lessons/py-1-01/read', { token: tk }); assert.equal(r.status, 409); assert.equal(r.j.lock, 'ord'); assert.equal(r.j.need, 'x');
  r = await doRead(tk, l1); assert.equal(r.status, 409); assert.equal(r.j.lock, 'ord'); assert.equal((await call('/api/me', { token: tk })).j.xp, 0);
  // atividade 1: metade do XP, +2 diamantes, e a lição 2 continua trancada
  r = await doExec(tk, l1); assert.equal(r.j.ok, true); assert.equal(r.j.gained, 5); assert.equal(r.j.next, 'r'); assert.ok(r.j.ex['py-1-01']); assert.equal(r.j.done['py-1-01'], undefined);
  assert.equal(r.j.gems - 0, 2 + (r.j.gemBonus || 0), 'a 1ª atividade dá 2 diamantes');
  assert.equal((await doExec(tk, l2)).status, 409, 'lição 2 trancada até as duas atividades da lição 1'); assert.equal(((await call('/api/lessons', { token: tk })).j.find(x => x.id === 'py-1-02') || {}).lock, 'seq');
  // a tela de ler: sem a resposta certa e com 4 opções (ordem fixa para o mesmo aluno)
  r = await call('/api/lessons/py-1-01/read', { token: tk }); assert.equal(r.status, 200);
  for (const k of ['ok', 'no', 'why', 'v', 'seed', 'hint']) assert.ok(!(k in r.j), 'a atividade de ler não pode entregar "' + k + '"');
  assert.equal(r.j.k, 'mc'); assert.equal(r.j.opts.length, 4); assert.ok(r.j.opts.includes(l1.read.ok)); assert.equal(new Set(r.j.opts).size, 4);
  assert.deepEqual((await call('/api/lessons/py-1-01/read', { token: tk })).j.opts, r.j.opts, 'a ordem das opções não muda ao reabrir');
  assert.ok(!JSON.stringify((await call('/api/lessons/py-1-01', { token: tk })).j).includes('"read"'), 'a lição comum não carrega a atividade de ler');
  // resposta errada: grátis e sem pontos; sem resposta nenhuma também não passa
  for (const bad of [l1.read.no[0], l1.read.no[1], '', 'qualquer coisa']) { r = await doRead(tk, l1, bad); assert.equal(r.status, 200); assert.equal(r.j.ok, false); assert.ok(!('why' in r.j), 'a explicação só vem quando acerta'); }
  assert.equal((await call('/api/me', { token: tk })).j.xp, 5, 'errar não custa nem dá nada');
  // acertou: outra metade do XP, +3 diamantes, explicação, lição concluída e a próxima liberada
  const g0 = (await call('/api/me', { token: tk })).j.gems; r = await doRead(tk, l1); assert.equal(r.j.ok, true); assert.equal(r.j.gained, 5); assert.equal(r.j.tries, 5, 'conta as tentativas'); assert.ok(r.j.why && r.j.why.length > 40);
  assert.ok(r.j.done['py-1-01']); assert.equal(r.j.xp, 10); assert.equal(r.j.gems - g0, 3);
  assert.equal(((await call('/api/lessons', { token: tk })).j.find(x => x.id === 'py-1-02') || {}).lock, null, 'lição 2 liberada');
  // repetir não rende XP nem diamantes de novo
  r = await doRead(tk, l1); assert.equal(r.j.ok, true); assert.equal(r.j.gained, 0); assert.equal(r.j.xp, 10); assert.equal(r.j.gems - g0, 3);
  r = await doExec(tk, l1); assert.equal(r.j.gained, 0); assert.equal(r.j.next, undefined);
  assert.equal((await doLesson(tk, l2)).j.ok, true);
});

test('ler o código: cada formato (escolher, digitar, SQL com tabelas, Excel com planilha) é entregue sem a resposta e corrigido no servidor', async () => {
  const tk = await reg('formatos@teste.com', 'Formatos'); await call('/api/track', { token: tk, body: { track: 'sql' } });
  const find = (pred) => lessons.find(pred);
  // digitar: espaços a mais e quebras de linha diferentes não atrapalham; aceita só o que bate
  for (const id of ['py-1-01', 'py-1-02', 'py-1-03', 'py-1-04']) assert.equal((await doLesson(tk, find(l => l.id === id))).j.ok, true);
  const ty = find(l => l.id === 'py-1-05'); assert.equal(ty.read.k, 'type'); assert.equal((await doExec(tk, ty)).j.next, 'r');
  let r = await call('/api/lessons/py-1-05/read', { token: tk }); assert.equal(r.j.k, 'type'); assert.equal(r.j.opts, undefined, 'digitar não tem opções para escolher');
  assert.equal((await doRead(tk, ty, '12')).j.ok, false); assert.equal((await doRead(tk, ty, '')).j.ok, false); assert.equal((await doRead(tk, ty, '  ' + ty.read.ok + ' \n')).j.ok, true, 'espaços e quebra de linha sobrando não atrapalham');
  // SQL: a atividade de ler traz as tabelas usadas na consulta (sem entregar nada além dos dados de treino)
  const sq = lessons.find(l => l.id === 'sql-1-01'); assert.equal((await doExec(tk, sq)).j.ok, true);
  r = await call('/api/lessons/sql-1-01/read', { token: tk }); assert.equal(r.status, 200); assert.equal(r.j.type, 'sql');
  assert.deepEqual(r.j.tables.map(t => t.name), ['produtos']); assert.equal(r.j.tables[0].rows.length, 10); assert.ok(r.j.tables[0].cols.includes('preco'));
  assert.equal((await doRead(tk, sq, '14')).j.ok, false); assert.equal((await doRead(tk, sq)).j.ok, true);
  // Excel: a planilha vai com as fórmulas à mostra e a célula da pergunta
  await call('/api/track', { token: tk, body: { track: 'excel' } });
  const xl = lessons.find(l => l.id === 'xl-1-01'); assert.equal((await doExec(tk, xl)).j.ok, true);
  r = await call('/api/lessons/xl-1-01/read', { token: tk }); assert.equal(r.status, 200); assert.ok(r.j.sheet.rows.length >= 2); assert.equal(r.j.ask, 'B3'); assert.ok(!('code' in r.j) || !r.j.code);
  assert.equal((await doRead(tk, xl, '20')).j.ok, false, 'o texto sem = não é conta'); assert.equal((await doRead(tk, xl)).j.ok, true);
  // lição que não existe, prova (sem atividade de ler) e visitante sem login
  assert.equal((await call('/api/lessons/inexistente/read', { token: tk })).status, 404); assert.equal((await call('/api/lessons/cp-py-1-10/read', { token: tk })).status, 404);
  assert.equal((await call('/api/read', { body: { id: 'py-1-01', a: 'x' } })).status, 401);
});

test('duas atividades: o progresso de quem já tinha concluído a lição (antes das 2 atividades) continua valendo e o recomeço apaga as duas', async () => {
  const port = PORT + 871, base = 'http://localhost:' + port, d = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'dup-')), 'data.json');
  const boot = async () => { let lg = ''; const p = spawn('node', ['server.js'], { cwd: path.join(__dirname, '..'), env: { ...process.env, PORT: port, DATA_FILE: d, BASE_URL: base, RELAX_SUBMIT_LIMIT: '1', DATABASE_URL: '' } }); p.stdout.on('data', x => lg += x); p.stderr.on('data', x => lg += x); for (let i = 0; i < 450 && !/rodando/.test(lg); i++) await new Promise(z => setTimeout(z, 100)); assert.match(lg, /rodando/, lg); return p; };
  let ip = 0; const j = async (pth, body, t) => { const x = await fetch(base + pth, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.99.' + (++ip % 200) + '.1', ...(t ? { 'x-token': t } : {}) }, body: body ? JSON.stringify(body) : undefined }); return { status: x.status, j: await x.json().catch(() => null) }; };
  let p = await boot();
  try {
    const rg = await j('/api/register', { name: 'Antiga Aluna', email: 'antiga@teste.com', password: 'segredo1', accept: true, sex: 'f', guide: 'tay' }); const t = rg.j.token; await j('/api/track', { track: 'python' }, t);
    p.kill(); await new Promise(z => setTimeout(z, 400));
    // como o arquivo de uma aluna que concluiu 3 lições na versão anterior: `done` e XP, sem `ex`
    const D = JSON.parse(fs.readFileSync(d, 'utf8')), u = Object.values(D.users).find(x => x.email === 'antiga@teste.com');
    for (const id of ['py-1-01', 'py-1-02', 'py-1-03']) { u.done[id] = { code: 'x', date: '2026-10-01T10:00:00.000Z' }; u.xpd[id] = 1; } u.xp = 30; delete u.ex; fs.writeFileSync(d, JSON.stringify(D));
    p = await boot();
    let m = (await j('/api/me', null, t)).j; assert.deepEqual(Object.keys(m.done).sort(), ['py-1-01', 'py-1-02', 'py-1-03']); assert.equal(m.xp, 30);
    const ls = (await j('/api/lessons', null, t)).j; assert.ok(!ls.find(x => x.id === 'py-1-04').lock, 'a lição 4 continua liberada');
    let r = await j('/api/submit', { id: 'py-1-01', code: lessons[0].solution, out: lessons[0].expectedOut }, t); assert.equal(r.j.ok, true); assert.equal(r.j.gained, 0, 'sem XP em dobro para quem já tinha feito'); assert.equal(r.j.next, undefined, 'e nada a mais para fazer');
    r = await j('/api/read', { id: 'py-1-02', a: lessons[1].read.ok }, t); assert.equal(r.j.ok, true); assert.equal(r.j.gained, 0); assert.equal(r.j.xp, 30, 'a leitura é opcional para quem já tinha a lição');
    // lição nova, ainda sem nenhuma atividade: precisa das duas
    r = await j('/api/submit', { id: 'py-1-04', code: lessons[3].solution, out: lessons[3].expectedOut }, t); assert.equal(r.j.next, 'r'); assert.equal(r.j.gained, 5);
    p.kill(); await new Promise(z => setTimeout(z, 400));
  } finally { if (p.exitCode === null) { p.kill(); await new Promise(r => p.once('exit', r)); } try { fs.rmSync(path.dirname(d), { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); } catch { } }
});

test('duas atividades: o app mostra o anel no círculo, a tela de ler, a de explicar e o resultado de cada atividade', () => {
  const pub = path.join(__dirname, '..', 'public'), ui = fs.readFileSync(path.join(pub, 'app.js'), 'utf8'), css = fs.readFileSync(path.join(pub, 'style.css'), 'utf8'), xui = fs.readFileSync(path.join(pub, 'xlui.js'), 'utf8');
  for (const f of ['function resultAct(', 'function openR(', 'function openE(', 'function readAct(', 'function expAct(', 'function expCheck(', 'function expOk(', 'function rdPick(', 'function rdCheck(', 'function rdOk(', 'const whyHtml', 'const pips = l =>', 'const theoryBox', 'const actNext', 'async function openL(']) assert.ok(ui.includes(f), 'app.js: ' + f);
  assert.match(ui, /class="rdr-ring n\$\{ord\.length\} \$\{cls\}"/, 'o anel do círculo: um arco por atividade (2 ou 3)'); assert.match(ui, /<i class=nn>\$\{l\.n\}<\/i>\$\{pips\(l\)\}<\/span>/, 'o anel fica dentro do círculo');
  assert.match(ui, /if \(s\.next\) resultAct\('x', s\.next\)/, 'depois de executar, se falta atividade, vem a tela que leva à próxima'); assert.ok(ui.includes("api('read'") && ui.includes("api('explain'"), 'o app chama as APIs de ler e de explicar');
  assert.ok(ui.includes('openAct(id, nx || \'x\')'), 'abrir a lição leva à próxima atividade da ordem sorteada');
  for (const k of ['.rdr-ring{', '.rdr-ring.n3', '.rdr-ring.r1ok', '.rdr-ring.r2ok', '.rdr-ring.r3ok', '.rdr-tb', '.rdr-opts', '.rdr-o', '.rdr-in', '.rdr-ex', '.rdr-th', '.rdr-why', '.rdr-next']) assert.ok(css.includes(k), 'css ' + k);
  assert.ok(xui.includes('function xlRead('), 'xlui.js: a planilha de ler com as fórmulas à mostra');
  // sem texto do tipo "trilha"/"certificado" nas telas novas
  const bloco = ui.slice(ui.indexOf('function resultAct(')); assert.ok(!/certificado/i.test(bloco.slice(0, 14000)));
});

// ---------------- 3ª atividade (explicar o código) e ordem sorteada das atividades ----------------
test('explicar o código: toda lição de Python e SQL do Intermediário e do Avançado tem a sua, e só elas (npm run check:explicar)', async () => {
  // roda a conferência em outro processo (ela executa 60 códigos de Python e travaria o servidor de teste enquanto o teste espera)
  const out = await new Promise(res => { let o = ''; const c = spawn('node', ['tools/check-explicar.js'], { cwd: path.join(__dirname, '..') }); c.stdout.on('data', x => o += x); c.stderr.on('data', x => o += x); c.on('close', code => res({ code, o })); });
  assert.equal(out.code, 0, 'atividades de explicar com problema:\n' + out.o); assert.match(out.o, /120 atividades conferidas \(60 de Python, 60 de SQL\)/);
  const com = lessons.filter(l => l.expl);
  assert.equal(com.length, 120, '60 de Python (níveis 2 e 3) + 60 de SQL (níveis 2 e 3)');
  for (const l of lessons) {
    const deve = l.type !== 'excel' && l.lv >= 2;
    assert.equal(!!l.expl, deve, `${l.id}: ${deve ? 'precisa da atividade de explicar' : 'o Básico e o Excel ficam com 2 atividades'}`);
  }
  for (const t of [...lessons.checkpoints, ...lessons.finals]) assert.ok(!t.expl, t.id + ': prova não tem atividade de explicar');
  for (const l of com) { assert.ok(l.expl.groups.length >= 2 && l.expl.groups.length <= 3, l.id); assert.ok(l.expl.groups.every(g => g.stems.length >= 3 && g.label.length >= 8), l.id + ': pistas'); }
  const kinds = {}; for (const l of com) kinds[l.expl.kind] = (kinds[l.expl.kind] || 0) + 1; assert.ok(kinds.faz > 20 && kinds.traz > 20, 'mistura de "o que faz" e "o que traz": ' + JSON.stringify(kinds));
});

test('explicar o código: o corretor confere ideias (não letras), ignora acento e maiúscula e recusa texto curto, código copiado e respostas vagas', () => {
  const X = require('../explain'), { e } = require('../content/exh');
  const item = X.compile(e('for n in range(3):\n    print(n)', 'traz', ['!conta de quanto a quanto :: 0 a 2|de 0|zero a dois|ate 2', '!o que aparece na tela :: tres linhas|3 linhas|um numero por linha|cada numero', 'imprime :: print|imprime|mostra'], 'modelo qualquer com mais de sessenta caracteres para passar na conferência de formato', 'alt qualquer de mais de vinte e cinco letras', ['0']));
  assert.equal(item.need, 2, '3 grupos: precisa de 2 (os obrigatórios sempre)'); assert.equal(item.groups[0].req, true); assert.equal(item.groups[2].req, false);
  // acento e maiúscula não importam; a raiz vale para o começo da palavra
  assert.equal(X.grade(item, 'Conta DE ZERO A DOIS e mostra UM NÚMERO por linha').ok, true);
  assert.equal(X.grade(item, 'ele vai do zero ao dois e imprime cada número').ok, false, 'faltou o grupo "conta de quanto a quanto" com as palavras certas');
  // os dois obrigatórios têm de aparecer: um só não basta, mesmo com o opcional
  let g = X.grade(item, 'Ele imprime e mostra algo importante bem legal'); assert.equal(g.ok, false); assert.deepEqual(g.miss.length, 2); assert.equal(g.got, 1);
  g = X.grade(item, 'Conta de zero a dois e depois imprime isso aí'); assert.equal(g.ok, false, 'falta o obrigatório do que aparece na tela'); assert.deepEqual(g.miss, ['o que aparece na tela']);
  // "$" = palavra inteira
  const w = X.compile(e('x = 1', 'faz', ['!valor :: 50$|cinquenta', '!onde :: lista|vetor'], 'm'.repeat(70), 'a'.repeat(30)));
  assert.equal(X.grade(w, 'guarda 500 numa lista bem grande').ok, false, '50$ não casa com 500'); assert.equal(X.grade(w, 'guarda 50 numa lista bem grande').ok, true);
  // curto, copiado e vago
  assert.equal(X.grade(item, 'ok').short, true); assert.equal(X.grade(item, 'um dois três').short, true, 'menos de ' + X.MINW + ' palavras');
  assert.equal(X.grade(item, 'for n in range(3): print(n)').copy, true, 'copiar o código não vale');
  assert.equal(X.grade(item, 'não sei explicar isso direito mas é um programa').ok, false);
  // texto enorme é cortado em MAXC e não derruba o corretor
  assert.equal(X.grade(item, 'conta de zero a dois '.repeat(5000)).ok, false, 'depois do corte só há "conta de zero a dois" e faltou o outro grupo');
});

test('explicar o código: a tela só abre depois das outras atividades, não entrega a resposta, errar é de graça e acertar conta uma vez', async () => {
  const tk = await reg('explicar@teste.com', 'Explicadora'), id = await uidOf('explicar@teste.com');
  assert.equal((await act(id, { action: 'unlock', tracks: ['python', 'sql'], on: true })).status, 200);
  const l = lessons.find(x => x.id === 'py-2-01'), s = lessons.find(x => x.id === 'sql-2-01'), E = l.expl;
  const me0 = (await call('/api/me', { token: tk })).j;
  // trancada pela ordem: precisa executar e ler antes (ordem fixa nos testes: x, r, e)
  let r = await call('/api/lessons/py-2-01/explain', { token: tk }); assert.equal(r.status, 409); assert.equal(r.j.lock, 'ord'); assert.equal(r.j.need, 'x');
  r = await doExpl(tk, l); assert.equal(r.status, 409); assert.equal(r.j.lock, 'ord');
  assert.equal((await doExec(tk, l)).j.next, 'r'); r = await call('/api/lessons/py-2-01/explain', { token: tk }); assert.equal(r.status, 409); assert.equal(r.j.need, 'r');
  r = await doRead(tk, l); assert.equal(r.j.ok, true); assert.equal(r.j.next, 'e', 'depois de executar e ler, falta explicar'); assert.equal(r.j.done['py-2-01'], undefined, 'ainda não concluiu: falta a 3ª');
  // a tela de explicar: o código e a pergunta, nunca o gabarito
  r = await call('/api/lessons/py-2-01/explain', { token: tk }); assert.equal(r.status, 200);
  assert.equal(r.j.code, E.code); assert.ok(['faz', 'traz'].includes(r.j.kind)); assert.ok(r.j.q.length > 20); assert.equal(r.j.minw, 4);
  const body = JSON.stringify(r.j); for (const k of ['groups', 'stems', 'alt', 'facts', 'need']) assert.ok(!(k in r.j), 'não pode entregar "' + k + '"');
  assert.ok(!body.includes(E.model.slice(0, 40)) && !body.includes(E.alt.slice(0, 20)), 'a explicação modelo não vai junto');
  const list = JSON.stringify((await call('/api/lessons', { token: tk })).j); assert.ok(!list.includes('"model"') && !list.includes('stems') && !list.includes('"groups"'), 'o mapa não leva nada do corretor');
  assert.ok(!JSON.stringify((await call('/api/lessons/py-2-01', { token: tk })).j).includes('"expl"'), 'a lição comum não carrega a atividade de explicar');
  // texto curto e código copiado não contam como tentativa
  r = (await doExpl(tk, l, 'não sei')).j; assert.equal(r.ok, false); assert.equal(r.short, true); assert.equal(r.tries, 0); assert.equal(r.model, undefined);
  r = (await doExpl(tk, l, E.code)).j; assert.equal(r.ok, false); assert.equal(r.copy, true); assert.equal(r.tries, 0);
  // uma ideia só: diz o que ainda falta (a pista, não a resposta) e não custa nada
  const vago = 'Ele faz uma coisa bem interessante com os dados que estão ali dentro';
  r = (await doExpl(tk, l, vago)).j; assert.equal(r.ok, false); assert.equal(r.tries, 1); assert.equal(r.got, 0); assert.equal(r.total, E.groups.length); assert.ok(r.miss.length >= 1 && r.miss.length <= 2);
  for (const m of r.miss) assert.ok(E.groups.some(g => g.label === m), 'a pista é o rótulo do grupo'); assert.equal(r.model, undefined, 'com 1 tentativa ainda não mostra o exemplo');
  r = (await doExpl(tk, l, vago + ' outra vez')).j; assert.equal(r.tries, 2); assert.equal(r.model, undefined);
  r = (await doExpl(tk, l, vago + ' e de novo')).j; assert.equal(r.tries, 3); assert.equal(r.model, E.model, 'depois de 3 tentativas mostra uma explicação de exemplo');
  const me1 = (await call('/api/me', { token: tk })).j; assert.equal(me1.xp - me0.xp, 10, 'errar não rende nem custa: só os 5+5 de executar e ler'); assert.equal(me1.done['py-2-01'], undefined);
  // acertou: o resto do XP (15 pontos = 5 + 5 + 5), 1 diamante, lição concluída, próxima liberada, e o texto fica guardado
  const gems0 = me1.gems; r = await doExpl(tk, l, E.alt); assert.equal(r.j.ok, true); assert.equal(r.j.gained, 5); assert.equal(r.j.gems - gems0, 1 + (r.j.gemBonus || 0)); assert.equal(r.j.tries, 4);
  assert.equal(r.j.model, E.model); assert.ok(r.j.done['py-2-01']); assert.equal(r.j.xp - me0.xp, 15); assert.equal(r.j.next, undefined);
  assert.equal(((await call('/api/lessons', { token: tk })).j.find(x => x.id === 'py-2-02') || {}).lock, null);
  await new Promise(z => setTimeout(z, 1600));                                       // o arquivo de dados é gravado com um pequeno atraso
  const dbx = JSON.parse(fs.readFileSync(DATA, 'utf8')), ux = Object.values(dbx.users).find(x => x.email === 'explicar@teste.com');
  assert.ok(ux && ux.exp['py-2-01'].txt === E.alt && ux.exp['py-2-01'].date, 'guarda o que o aluno escreveu');
  // repetir: continua certo, sem XP nem diamantes de novo
  r = await doExpl(tk, l, E.model); assert.equal(r.j.ok, true); assert.equal(r.j.gained, 0); assert.equal(r.j.xp - me0.xp, 15);
  // SQL: a tela traz as tabelas usadas, para o aluno ver os dados
  assert.equal((await doExec(tk, s)).j.next, 'r'); assert.equal((await doRead(tk, s)).j.next, 'e');
  r = await call('/api/lessons/sql-2-01/explain', { token: tk }); assert.equal(r.status, 200); assert.deepEqual(r.j.tables.map(t => t.name).sort(), ['produtos', 'vendas']); assert.ok(r.j.tables[0].rows.length > 5);
  assert.equal((await doExpl(tk, s, s.expl.model)).j.ok, true);
  // onde não existe a atividade: Básico, Excel, provas, lição inexistente, sem login
  for (const p of ['py-1-01', 'sql-1-01', 'xl-1-01', 'cp-py-1-10', 'fin-py-1', 'nao-existe']) assert.equal((await call(`/api/lessons/${p}/explain`, { token: tk })).status, 404, p);
  assert.equal((await call('/api/explain', { token: tk, body: { id: 'py-1-01', a: 'uma resposta qualquer com varias palavras' } })).status, 404);
  assert.equal((await call('/api/explain', { body: { id: 'py-2-01', a: 'x' } })).status, 401);
});

test('explicar o código: o recomeço de uma lição apaga as 3 atividades e o XP já ganho fica', async () => {
  const tk = await reg('recomeco3@teste.com', 'Recomeço'), id = await uidOf('recomeco3@teste.com');
  await act(id, { action: 'unlock', tracks: ['python'], on: true });
  const l = lessons.find(x => x.id === 'py-2-03'); assert.equal((await doLesson(tk, l)).j.ok, true);
  let m = (await call('/api/me', { token: tk })).j; assert.ok(m.done['py-2-03']); assert.equal(m.xp, l.xp, 'as três atividades somam o XP da lição'); const xp = m.xp;
  const r = await act(id, { action: 'reset-level', track: 'python', level: 2 }); assert.equal(r.status, 200);
  const db = await new Promise(z => setTimeout(z, 1600)).then(() => JSON.parse(fs.readFileSync(DATA, 'utf8'))), u = Object.values(db.users).find(x => x.email === 'recomeco3@teste.com');
  assert.ok(!u.done['py-2-03'] && !(u.ex || {})['py-2-03'] && !(u.ler || {})['py-2-03'] && !(u.exp || {})['py-2-03'], 'as três atividades zeradas');
  m = (await call('/api/me', { token: tk })).j; assert.equal(m.xp, xp, 'o XP já ganho fica'); assert.equal((await doLesson(tk, l)).j.gained, 0, 'refazer não rende XP de novo');
  assert.ok((await call('/api/me', { token: tk })).j.done['py-2-03']);
});

test('ordem sorteada: cada aluno cai numa ordem diferente, ela não muda, o Básico e o Excel ficam com 2 atividades e o XP e os diamantes se dividem', async () => {
  const port = PORT + 877, base = 'http://localhost:' + port, d = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'ord-')), 'data.json');
  let lg = ''; const p = spawn('node', ['server.js'], { cwd: path.join(__dirname, '..'), env: { ...process.env, FIXED_ACT_ORDER: '', PORT: port, DATA_FILE: d, BASE_URL: base, RELAX_SUBMIT_LIMIT: '1', ADMIN_KEY: 'chave-ordem-123456', DATABASE_URL: '' } });
  p.stdout.on('data', x => lg += x); p.stderr.on('data', x => lg += x);
  try {
    for (let i = 0; i < 450 && !/rodando/.test(lg); i++) await new Promise(z => setTimeout(z, 100)); assert.match(lg, /rodando/, lg);
    let ip = 0; const j = async (pth, body, t, h) => { const x = await fetch(base + pth, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.88.' + (++ip % 250) + '.1', ...(t ? { 'x-token': t } : {}), ...h }, body: body ? JSON.stringify(body) : undefined }); return { status: x.status, j: await x.json().catch(() => null) }; };
    const at = (await j('/api/admin/login', { key: 'chave-ordem-123456' })).j.token, ah = { 'x-admin-token': at };
    const N = 40, users = [];
    for (let i = 0; i < N; i++) {
      const email = `ord${i}@teste.com`, rg = await j('/api/register', { name: 'Ord ' + i, email, password: 'segredo1', accept: true }); assert.ok(rg.j.token, JSON.stringify(rg.j));
      const row = (await j('/api/admin/users?q=' + encodeURIComponent(email), null, null, ah)).j.rows.find(x => x.email === email);
      if (i < 25) assert.equal((await j(`/api/admin/users/${row.id}/action`, { action: 'unlock', tracks: 'all', on: true }, null, ah)).status, 200);
      users.push({ tk: rg.j.token, id: row.id, email });
    }
    const ordOf = async (u, id) => { const r = (await j('/api/lessons', null, u.tk)).j.find(x => x.id === id); return r && r.ord; };
    // Básico (Python/SQL) e Excel: 2 atividades, a ordem varia entre "xr" e "rx" e nunca tem "e"
    for (const id of ['py-1-01', 'sql-1-01', 'xl-1-01']) {
      const seen = new Set(); for (const u of users) { const o = await ordOf(u, id); assert.match(o, /^(xr|rx)$/, id + ' → ' + o); seen.add(o); } assert.equal(seen.size, 2, id + ': com 40 alunos aparecem as duas ordens ' + [...seen]);
    }
    // Intermediário e Avançado de Python e SQL: 3 atividades em qualquer ordem
    const perms = new Set(); const first = { x: 0, r: 0, e: 0 };
    for (const id of ['py-2-01', 'py-3-07', 'sql-2-05', 'sql-3-12']) for (const u of users.slice(0, 25)) { const o = await ordOf(u, id); assert.match(o, /^(?!.*(.).*\1)[xre]{3}$/, id + ' → ' + o); perms.add(o); first[o[0]]++; }
    assert.ok(perms.size >= 5, 'quase todas as 6 ordens possíveis aparecem: ' + [...perms]); assert.ok(first.x > 10 && first.r > 10 && first.e > 10, 'cada atividade cai na frente de vez em quando: ' + JSON.stringify(first));
    // a ordem de um aluno numa lição é sempre a mesma (reabrir, outra sessão, outra chamada)
    const u0 = users[0], o0 = await ordOf(u0, 'py-2-01'); for (let i = 0; i < 3; i++) assert.equal(await ordOf(u0, 'py-2-01'), o0);
    const lg2 = await j('/api/login', { email: u0.email, password: 'segredo1' }); assert.equal((await j('/api/lessons', null, lg2.j.token)).j.find(x => x.id === 'py-2-01').ord, o0, 'outra sessão do mesmo aluno vê a mesma ordem');
    // a ordem muda de lição para lição (não é sempre a mesma para o mesmo aluno)
    const mesma = new Set(); for (const n of ['01', '02', '03', '04', '05', '06', '07', '08']) mesma.add(await ordOf(u0, 'py-2-' + n)); assert.ok(mesma.size >= 2, 'o mesmo aluno cai em ordens diferentes em lições diferentes: ' + [...mesma]);
    // a lista inteira: só Python/SQL dos níveis 2 e 3 têm "e"
    const rows = (await j('/api/lessons', null, users[1].tk)).j; for (const r of rows) assert.equal(/e/.test(r.ord || ''), r.lv >= 2 && r.type !== 'excel', r.id + ' ' + r.ord); assert.equal(rows.filter(r => /e/.test(r.ord)).length, 120);
    // faz uma lição de 3 atividades na ordem sorteada: errar a ordem é barrado, XP 5+5+5 (15), diamantes 2+2+1
    const L = lessons.find(x => x.id === 'py-2-01'), act = { x: () => j('/api/submit', { id: L.id, code: L.solution, out: L.expectedOut }, u.tk), r: () => j('/api/read', { id: L.id, a: readAnswer(L) }, u.tk), e: () => j('/api/explain', { id: L.id, a: L.expl.model }, u.tk) };
    const lessonOrd = {}; let u; const perm = new Set();
    for (const cand of users.slice(0, 25)) { const o = await ordOf(cand, L.id); lessonOrd[o] ??= cand; perm.add(o); } u = lessonOrd[[...perm][0]];
    const ord = (await ordOf(u, L.id)).split(''), certo = ord[0], errada = ord[1];
    let r = await act[errada](); assert.equal(r.status, 409); assert.equal(r.j.lock, 'ord'); assert.equal(r.j.need, certo, 'a atividade que está na frente da fila');
    r = await act[ord[2]](); assert.equal(r.status, 409); assert.equal(r.j.need, certo);
    const part = {}, g0 = (await j('/api/me', null, u.tk)).j.gems; let gemsGot = 0, last;
    for (let i = 0; i < 3; i++) { last = await act[ord[i]](); assert.equal(last.j.ok, true, ord[i]); part[ord[i]] = last.j.gained; gemsGot = last.j.gems - g0; assert.equal(last.j.done && !!last.j.done[L.id], i === 2, 'só conclui na última'); assert.equal(last.j.next, ord[i + 1], 'next aponta a seguinte da fila'); }
    assert.equal(part.x + part.r + part.e, L.xp, 'as 3 partes somam o XP da lição'); assert.deepEqual([part.x, part.r, part.e], [5, 5, 5]);
    assert.equal(gemsGot - (last.j.gemBonus || 0), 5, 'diamantes: 2 (executar) + 2 (ler) + 1 (explicar)');
    assert.equal(((await j('/api/lessons', null, u.tk)).j.find(x => x.id === 'py-2-02') || {}).lock, null, 'a próxima lição abre com as 3');
    // uma lição de 2 atividades continua 50/50 em qualquer ordem
    const B = lessons.find(x => x.id === 'py-1-01'), ordB = (await ordOf(users[30], B.id)).split(''), ba = { x: () => j('/api/submit', { id: B.id, code: B.solution, out: B.expectedOut }, users[30].tk), r: () => j('/api/read', { id: B.id, a: readAnswer(B) }, users[30].tk) };
    assert.equal((await ba[ordB[1]]()).status, 409); const b1 = await ba[ordB[0]](), b2 = await ba[ordB[1]](); assert.equal(b1.j.gained, 5); assert.equal(b2.j.gained, 5); assert.ok(b2.j.done[B.id]);
  } finally { p.kill(); await new Promise(z => setTimeout(z, 300)); try { fs.rmSync(path.dirname(d), { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); } catch { } }
});

test('explicar o código: quem já tinha concluído a lição (antes da 3ª atividade) continua com ela concluída, sem XP em dobro', async () => {
  const port = PORT + 879, base = 'http://localhost:' + port, d = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'dup3-')), 'data.json');
  const boot = async () => { let lg = ''; const p = spawn('node', ['server.js'], { cwd: path.join(__dirname, '..'), env: { ...process.env, PORT: port, DATA_FILE: d, BASE_URL: base, RELAX_SUBMIT_LIMIT: '1', DATABASE_URL: '' } }); p.stdout.on('data', x => lg += x); p.stderr.on('data', x => lg += x); for (let i = 0; i < 450 && !/rodando/.test(lg); i++) await new Promise(z => setTimeout(z, 100)); assert.match(lg, /rodando/, lg); return p; };
  let ip = 0; const j = async (pth, body, t) => { const x = await fetch(base + pth, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.77.' + (++ip % 200) + '.1', ...(t ? { 'x-token': t } : {}) }, body: body ? JSON.stringify(body) : undefined }); return { status: x.status, j: await x.json().catch(() => null) }; };
  let p = await boot();
  try {
    const rg = await j('/api/register', { name: 'Antiga Intermediária', email: 'antiga3@teste.com', password: 'segredo1', accept: true }); const t = rg.j.token; await j('/api/track', { track: 'python' }, t);
    p.kill(); await new Promise(z => setTimeout(z, 400));
    // aluna que concluiu 3 lições do Intermediário na versão com 2 atividades: `done` e `ler`, sem `exp`
    const D = JSON.parse(fs.readFileSync(d, 'utf8')), u = Object.values(D.users).find(x => x.email === 'antiga3@teste.com');
    u.unlock = { python: new Date().toISOString() }; u.ex = {}; u.ler = {}; u.xp = 90;
    for (const id of ['py-2-01', 'py-2-02', 'py-2-03']) { u.done[id] = { code: 'x', date: '2026-10-01T10:00:00.000Z' }; u.xpd[id] = 1; u.ex[id] = { date: '2026-10-01', code: 'x' }; u.ler[id] = { date: '2026-10-01' }; } fs.writeFileSync(d, JSON.stringify(D));
    p = await boot();
    const ls = (await j('/api/lessons', null, t)).j, a = ls.find(x => x.id === 'py-2-01'); assert.equal(a.dn.split('').sort().join(''), 'erx', 'lição antiga conta como feita nas 3');
    assert.equal(a.lock, null); assert.equal(ls.find(x => x.id === 'py-2-04').lock, null, 'a lição 4 continua liberada');
    let r = await j('/api/explain', { id: 'py-2-01', a: lessons.find(x => x.id === 'py-2-01').expl.model }, t); assert.equal(r.status, 200); assert.equal(r.j.ok, true); assert.equal(r.j.gained, 0, 'sem XP em dobro'); assert.equal(r.j.xp, 90);
    // a lição nova (4) precisa das três
    const l4 = lessons.find(x => x.id === 'py-2-04'), row = (await j('/api/lessons', null, t)).j.find(x => x.id === l4.id); assert.equal(row.ord.length, 3); assert.equal(row.dn, undefined);
    p.kill(); await new Promise(z => setTimeout(z, 400));
  } finally { if (p.exitCode === null) { p.kill(); await new Promise(r => p.once('exit', r)); } try { fs.rmSync(path.dirname(d), { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); } catch { } }
});

test('ordem sorteada: a variável de teste que fixa a ordem é ignorada em produção e a versão do app foi atualizada', () => {
  const srvSrc = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
  assert.match(srvSrc, /const FIXED_ORDER = process\.env\.FIXED_ACT_ORDER === '1' && !PROD;/, 'só vale fora de produção');
  assert.match(srvSrc, /ordOf = \(u, ?l\) => \{ const a = actsOf\(l\); return a\.length > 1 && !FIXED_ORDER \? shuffled\(a, u\.id \+ ':ord:' \+ l\.id\) : a; \}/, 'a ordem sorteada depende só do aluno e da lição (não muda sozinha)');
  const sw = fs.readFileSync(path.join(__dirname, '..', 'public', 'sw.js'), 'utf8'); assert.match(sw, /codeup-v(60|[6-9]\d)/, 'a versão do cache subiu para o app novo chegar ao celular');
});


// ---------------- Power BI e DAX: lições de DAX (o aluno escreve medidas e colunas) e de quiz (várias perguntas numa tela) ----------------
test('Power BI e DAX: o servidor entrega as lições sem gabarito, mostra a comparação do que errou e corrige qualquer fórmula certa', async () => {
  const tk = await reg('pbi1@t.com', 'Pri');
  assert.equal((await call('/api/track', { token: tk, body: { track: 'powerbi' } })).j.track, 'powerbi');
  const list = (await call('/api/lessons', { token: tk })).j, pb = list.filter(l => l.track === 'powerbi');
  assert.equal(pb.length, 30); assert.deepEqual(pb.map(l => l.n), Array.from({ length: 30 }, (_, i) => i + 1)); assert.ok(pb.every(l => l.lv === 1 && (l.type === 'quiz' || l.type === 'dax')));
  assert.equal(pb.filter(l => l.type === 'quiz').length, 15); assert.equal(pb.filter(l => l.type === 'dax').length, 15);
  assert.deepEqual(pb.slice(0, 3).map(l => l.lock), [null, 'seq', 'seq']);
  assert.equal((await call('/api/lessons/pbi-1-02', { token: tk })).status, 409, 'não pula lição');
  assert.equal((await call('/api/lessons/pbi-2-01', { token: tk })).status, 404, 'o Power BI Intermediário ainda não existe');
  // quiz: as perguntas chegam sem a resposta certa e sem explicação
  const q1 = (await call('/api/lessons/pbi-1-01', { token: tk })).j; assert.equal(q1.type, 'quiz'); assert.ok(Array.isArray(q1.qz) && q1.qz.length >= 4);
  for (const k of ['quiz', 'answer', 'need']) assert.ok(!(k in q1), `o gabarito (${k}) não pode chegar ao navegador`);
  const pubTxt = JSON.stringify(q1.qz); assert.ok(!/"ok"|"why"|"no"|"pairs"|"steps"/.test(pubTxt), 'perguntas sem gabarito nem explicação');
  // quiz: errado devolve a conferência pergunta a pergunta; vazio não passa; certo passa (qualquer ordem das opções)
  let r = (await call('/api/submit', { token: tk, body: { id: 'pbi-1-01', code: '[]' } })).j; assert.equal(r.ok, false);
  const ql = lessons.find(x => x.id === 'pbi-1-01'), sol = quizcheck.solution(ql), wrong = sol.map((a, i) => i === 0 ? 'qualquer coisa' : a);
  r = (await call('/api/submit', { token: tk, body: { id: 'pbi-1-01', code: JSON.stringify(wrong) } })).j; assert.equal(r.ok, false); assert.equal(r.quiz.right, ql.quiz.length - 1); assert.equal(r.quiz.items[0].ok, false); assert.ok(r.quiz.items[0].why, 'a explicação aparece nas erradas'); assert.ok(r.quiz.items.slice(1).every(x => x.ok === true));
  assert.equal((await call('/api/me', { token: tk })).j.xp, 0, 'errar não dá XP');
  r = (await doLesson(tk, ql)).j; assert.equal(r.ok, true); assert.ok(r.gained > 0);
  // DAX: faz as lições 2 a 10 e abre a 11
  for (const l of lessonsOf('powerbi', 1).slice(1, 10)) assert.equal((await doLesson(tk, l)).j.ok, true, l.id);
  assert.equal((await call('/api/lessons/pbi-1-11', { token: tk })).status, 409, 'o checkpoint (lição 10) vem antes da 11');
  assert.equal((await doCp(tk, lessons.checkpoints.find(c => c.id === 'cp-pbi-1-10'))).j.ok, true);
  const d = (await call('/api/lessons/pbi-1-11', { token: tk })).j; assert.equal(d.type, 'dax'); assert.equal(d.model, 'loja'); assert.ok(d.starter && d.views.length);
  for (const k of ['answer', 'need', 'forbid', 'noAlt']) assert.ok(!(k in d), `o gabarito (${k}) não pode chegar ao navegador`);
  // erro de sintaxe: volta a linha e o trecho, não é falha do servidor
  r = (await call('/api/submit', { token: tk, body: { id: 'pbi-1-11', code: 'Total Vendas = SUM(Vendas[Valor]' } })).j; assert.equal(r.ok, false); assert.ok(r.dx.err && r.dx.err.msg && r.dx.err.line === 1);
  // medida errada: a comparação mostra o que veio e o que era esperado em cada linha do visual
  r = (await call('/api/submit', { token: tk, body: { id: 'pbi-1-11', code: 'Total Vendas = SUM(Vendas[Qtd])' } })).j; assert.equal(r.ok, false); assert.equal(r.dx.defs[0].ok, false); assert.ok(r.dx.defs[0].rows.some(x => x.got && x.want && x.got[0] !== x.want[0]));
  r = (await call('/api/submit', { token: tk, body: { id: 'pbi-1-11', code: 'Total Vendas = 747' } })).j; assert.equal(r.ok, false, 'valor digitado à mão não passa');
  r = (await call('/api/submit', { token: tk, body: { id: 'pbi-1-11', code: 'Total Vendas = 1' } })).j; assert.equal(r.ok, false);
  r = (await call('/api/submit', { token: tk, body: { id: 'pbi-1-11', code: '-- só um comentário' } })).j; assert.equal(r.ok, false);
  // fórmula diferente mas certa passa (SUMX faz a mesma conta), com nome de medida sem acento ou maiúsculas diferentes
  const d11 = lessons.find(x => x.id === 'pbi-1-11');
  r = (await call('/api/submit', { token: tk, body: { id: 'pbi-1-11', code: 'total vendas = SUMX(Vendas, Vendas[Valor])' } })).j; assert.equal(r.ok, false, 'a lição exige SUM (need)'); assert.equal(r.dx.need, 'SUM');
  r = (await doExec(tk, d11)).j; assert.equal(r.ok, true);
  // a conferência ao vivo não dá XP
  const before = (await call('/api/me', { token: tk })).j.xp; await call('/api/check', { token: tk, body: { id: 'pbi-1-12', code: 'x = 1' } }); assert.equal((await call('/api/me', { token: tk })).j.xp, before);
});

test('Power BI e DAX: ler a fórmula aceita número com vírgula e ponto, e coluna calculada é corrigida linha a linha', async () => {
  const tk = await reg('pbi2@t.com', 'Priscila');
  await call('/api/track', { token: tk, body: { track: 'powerbi' } });
  const L = lessonsOf('powerbi', 1);
  for (const l of L.slice(0, 10)) assert.equal((await doLesson(tk, l)).j.ok, true, l.id);
  assert.equal((await doCp(tk, lessons.checkpoints.find(c => c.id === 'cp-pbi-1-10'))).j.ok, true);
  for (const l of L.slice(10, 14)) assert.equal((await doLesson(tk, l)).j.ok, true, l.id);
  // lição de ler com resposta numérica (pbi-1-15: 17,5): "17,5" e "17.5" valem, 17 não vale
  const l15 = lessons.find(x => x.id === 'pbi-1-15'); assert.equal(l15.read.ok, 17.5);
  assert.equal((await doExec(tk, l15)).j.ok, true);
  const r0 = (await call('/api/lessons/pbi-1-15/read', { token: tk })).j; assert.equal(r0.k, 'num'); assert.ok(!('ok' in r0) && !('why' in r0), 'a leitura chega sem resposta');
  let r = (await call('/api/read', { token: tk, body: { id: 'pbi-1-15', a: '17' } })).j; assert.equal(r.ok, false);
  r = (await call('/api/read', { token: tk, body: { id: 'pbi-1-15', a: '17,5' } })).j; assert.equal(r.ok, true);
  for (const l of L.slice(15, 20)) assert.equal((await doLesson(tk, l)).j.ok, true, l.id);
  // checkpoint de DAX: faltando medidas perde uma chance e mostra o que falta; sem gabarito na prova aberta
  const c20 = lessons.checkpoints.find(c => c.id === 'cp-pbi-1-20');
  const c = (await call('/api/lessons/cp-pbi-1-20', { token: tk })).j; assert.equal(c.type, 'dax'); assert.equal(c.left, 2); assert.ok(!LEAK.some(k => k in c), 'a prova aberta não tem gabarito nem solução');
  r = (await call('/api/submit', { token: tk, body: { id: 'cp-pbi-1-20', code: 'Total Vendas = SUM(Vendas[Valor])' } })).j; assert.equal(r.ok, false); assert.equal(r.left, 1); assert.ok(r.dx.need, 'mostra a função que faltou');
  assert.equal((await doCp(tk, c20)).j.ok, true);
  // lições 21 a 30 (colunas calculadas): coluna errada mostra as linhas que não batem
  assert.equal((await call('/api/lessons/pbi-1-21', { token: tk })).status, 200);
  r = (await call('/api/submit', { token: tk, body: { id: 'pbi-1-21', code: 'Vendas[Valor Unitário] = Vendas[Valor]' } })).j; assert.equal(r.ok, false); assert.ok(r.dx.col && r.dx.col.rows.length && r.dx.col.bad > 0);
  for (const l of L.slice(20, 30)) assert.equal((await doLesson(tk, l)).j.ok, true, l.id);
  assert.equal((await call('/api/lessons/fin-pbi-1', { token: tk })).status, 200);
  const fin = (await doFinal(tk, 'powerbi', 1)).j; assert.equal(fin.ok, true); assert.equal(fin.test, 'fin'); assert.equal(fin.trackComplete, true, 'o Power BI tem só o nível Básico por enquanto: passar nele conclui o curso');
});

test('Análise de Dados e Storytelling: o servidor entrega as lições (quiz) sem gabarito, corrige números negativos, escrita com as próprias palavras e as provas', async () => {
  const tk = await reg('dados1@t.com', 'Dani');
  assert.equal((await call('/api/track', { token: tk, body: { track: 'dados' } })).j.track, 'dados');
  const list = (await call('/api/lessons', { token: tk })).j, da = list.filter(l => l.track === 'dados');
  assert.equal(da.length, 30); assert.deepEqual(da.map(l => l.n), Array.from({ length: 30 }, (_, i) => i + 1)); assert.ok(da.every(l => l.lv === 1 && l.type === 'quiz' && /^da-1-\d\d$/.test(l.id)));
  assert.deepEqual(da.slice(0, 3).map(l => l.lock), [null, 'seq', 'seq']);
  assert.equal((await call('/api/lessons/da-1-02', { token: tk })).status, 409, 'não pula lição');
  assert.equal((await call('/api/lessons/da-2-01', { token: tk })).status, 404, 'o nível Intermediário de Análise de Dados ainda não existe');
  // as perguntas chegam sem a resposta certa, sem a explicação e sem os grupos de ideias da pergunta escrita
  const q1 = (await call('/api/lessons/da-1-01', { token: tk })).j; assert.equal(q1.type, 'quiz'); assert.ok(Array.isArray(q1.qz) && q1.qz.length >= 4);
  for (const k of ['quiz', 'answer', 'need']) assert.ok(!(k in q1), `o gabarito (${k}) não pode chegar ao navegador`);
  const pubTxt = JSON.stringify(q1.qz); assert.ok(!/"ok"|"why"|"no"|"groups"|"model"/.test(pubTxt), 'perguntas sem gabarito nem explicação');
  // quiz errado devolve a conferência pergunta a pergunta e não dá XP; certo passa
  const ql = lessons.find(x => x.id === 'da-1-01'), sol = quizcheck.solution(ql);
  let r = (await call('/api/submit', { token: tk, body: { id: 'da-1-01', code: JSON.stringify(sol.map((a, i) => i === 1 ? 'qualquer coisa' : a)) } })).j;
  assert.equal(r.ok, false); assert.equal(r.quiz.right, ql.quiz.length - 1); assert.equal(r.quiz.items[1].ok, false); assert.ok(r.quiz.items[1].why);
  assert.equal((await call('/api/me', { token: tk })).j.xp, 0, 'errar não dá XP');
  for (const l of lessonsOf('dados', 1).slice(0, 10)) assert.equal((await doLesson(tk, l)).j.ok, true, l.id);
  assert.equal((await call('/api/lessons/da-1-11', { token: tk })).status, 409, 'o checkpoint (lição 10) vem antes da 11');
  const c10 = lessons.checkpoints.find(c => c.id === 'cp-da-1-10'); assert.ok(c10 && c10.quiz.length === 8);
  const c = (await call('/api/lessons/cp-da-1-10', { token: tk })).j; assert.equal(c.left, 2); assert.ok(!LEAK.some(k => k in c), 'a prova aberta não tem gabarito');
  r = (await call('/api/submit', { token: tk, body: { id: 'cp-da-1-10', code: '[]' } })).j; assert.equal(r.ok, false); assert.equal(r.left, 1, 'errar gasta uma chance');
  assert.equal((await doCp(tk, c10)).j.ok, true);
  assert.equal((await call('/api/lessons/da-1-11', { token: tk })).status, 200);
});

test('Análise de Dados e Storytelling: resposta negativa e com vírgula, escrita com as próprias palavras, prova final e conclusão do curso', async () => {
  const tk = await reg('dados2@t.com', 'Daniela');
  await call('/api/track', { token: tk, body: { track: 'dados' } });
  const L = lessonsOf('dados', 1);
  for (const l of L.slice(0, 10)) assert.equal((await doLesson(tk, l)).j.ok, true, l.id);
  assert.equal((await doCp(tk, lessons.checkpoints.find(c => c.id === 'cp-da-1-10'))).j.ok, true);
  for (const l of L.slice(10, 20)) assert.equal((await doLesson(tk, l)).j.ok, true, l.id);
  assert.equal((await doCp(tk, lessons.checkpoints.find(c => c.id === 'cp-da-1-20'))).j.ok, true);
  // números: vírgula ou ponto, sinal de menos "bonito" e % no fim valem; só o número certo passa
  const num = (id, i) => { const l = lessons.find(x => x.id === id); return { l, i, ok: l.quiz[i].ok, sol: quizcheck.solution(l) }; };
  const l9 = num('da-1-09', 0); assert.equal(l9.ok, 6.14);                     // média 43 ÷ 7
  const send = async (x, a) => (await call('/api/submit', { token: tk, body: { id: x.l.id, code: JSON.stringify(x.sol.map((s, k) => k === x.i ? a : s)) } })).j;
  for (const a of ['6,14', '6.14', ' 6,14 ']) { const r = await send(l9, a); assert.equal(r.quiz.items[0].ok, true, `"${a}" vale`); }
  for (const a of ['6', '7,14', 'seis', '']) { const r = await send(l9, a); assert.equal(r.quiz.items[0].ok, false, `"${a}" não vale`); }
  assert.equal(require('../quizcheck').gradeItem({ t: 'num', ok: -45 }, '−45'), true, 'o sinal de menos tipográfico também vale');
  assert.equal(require('../quizcheck').gradeItem({ t: 'num', ok: -45 }, '-45,0'), true);
  assert.equal(require('../quizcheck').gradeItem({ t: 'num', ok: -45 }, '45'), false);
  // a variação (lição 13) pede a queda sem sinal: assim o teclado numérico do celular basta
  assert.ok(lessons.find(x => x.id === 'da-1-13').quiz.filter(q => q.t === 'num').every(q => q.ok >= 0), 'nenhuma resposta negativa no curso (o teclado numérico do iPhone não tem o sinal de menos)');
  for (const t of lessons.filter(x => x.track === 'dados')) for (const q of t.quiz) if (q.t === 'num') assert.ok(q.ok >= 0, t.id);
  for (const t of lessons.tests.filter(x => x.track === 'dados')) for (const q of t.quiz) if (q.t === 'num') assert.ok(q.ok >= 0, t.id);
  // escrita com as próprias palavras: texto sem sentido não passa e mostra o que falta; o texto modelo passa
  const l23 = lessons.find(x => x.id === 'da-1-23'), iw = l23.quiz.findIndex(q => q.t === 'write'); assert.ok(iw >= 0);
  for (const l of L.slice(20, 22)) assert.equal((await doLesson(tk, l)).j.ok, true, l.id);
  let r = (await call('/api/submit', { token: tk, body: { id: 'da-1-23', code: JSON.stringify(quizcheck.solution(l23).map((a, k) => k === iw ? 'isto não tem nada a ver com o gráfico' : a)) } })).j;
  assert.equal(r.ok, false); assert.equal(r.quiz.items[iw].ok, false); assert.ok(r.quiz.items[iw].miss && r.quiz.items[iw].miss.length, 'diz o que ainda falta explicar');
  r = (await call('/api/submit', { token: tk, body: { id: 'da-1-23', code: JSON.stringify(quizcheck.solution(l23).map((a, k) => k === iw ? 'x' : a)) } })).j;
  assert.equal(r.quiz.items[iw].ok, false); assert.equal(r.quiz.items[iw].short, true, 'resposta curta demais');
  for (const l of L.slice(22, 30)) assert.equal((await doLesson(tk, l)).j.ok, true, l.id);
  // prova final: aberta sem gabarito, 3 chances, e passar conclui o curso
  const f = (await call('/api/lessons/fin-da-1', { token: tk })); assert.equal(f.status, 200); assert.equal(f.j.left, 3); assert.ok(!LEAK.some(k => k in f.j));
  assert.ok(f.j.qz.some(q => q.t === 'write'), 'a prova final tem perguntas escritas');
  const fin = (await doFinal(tk, 'dados', 1)).j; assert.equal(fin.ok, true); assert.equal(fin.test, 'fin'); assert.equal(fin.trackComplete, true, 'o curso de Análise de Dados tem só o nível Básico por enquanto: passar nele conclui o curso');
});
