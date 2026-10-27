require('dotenv').config({ path: require('path').join(__dirname, '.env'), quiet: true });   // lê o .env da pasta do projeto, mesmo que o servidor seja iniciado de outra pasta
require('dotenv').config({ quiet: true });                                                   // e o da pasta atual, se houver (nunca sobrescreve o que já foi lido)
const express = require('express'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const { Worker } = require('worker_threads');
const lessons = require('./lessons');
const EXPLAIN = require('./explain');
const R = require('./public/rewards.js');   // títulos e molduras por XP (o mesmo arquivo roda no navegador)
const { checkpoints, finals, tests, projects, TRACKS, LEVEL_NAMES, LEVELS_OF } = lessons;
const TRACK_NAMES = { python: 'Python', sql: 'SQL', excel: 'Excel', powerbi: 'Power BI e DAX', dados: 'Análise de Dados e Storytelling' };
const xlcheck = require('./xlcheck');   // correção das atividades de Excel (compara os resultados das fórmulas)
const daxcheck = require('./daxcheck'), quizcheck = require('./quizcheck');   // Power BI e DAX: medidas DAX (compara os resultados nos visuais) e quizzes (escolher, ordenar, ligar, número, montar visual, escrever)

const PORT = process.env.PORT || 3000;
const BASE = (process.env.BASE_URL || `http://localhost:${PORT}`).replace(/\/$/, '');
const CONTACT = process.env.CONTACT_EMAIL || '';
const COMPANY = process.env.COMPANY_NAME || 'CodeUp';
const PROD = process.env.NODE_ENV === 'production';
// Flags SÓ para testes. Em produção são ignoradas (senão qualquer pessoa veria links de redefinição de senha).
const devFlag = n => { const on = process.env[n] === '1'; if (on && PROD) console.error(`⚠⚠ ${n}=1 IGNORADO em produção (NODE_ENV=production). Remova do seu .env!`); return on && !PROD; };
const DEV_LINK = devFlag('DEV_SHOW_RESET_LINK'), ADS_PREVIEW = devFlag('ADS_PREVIEW');
// Modo teste (npm run teste): mostra uma faixa na tela, tem o botão "Começar do zero" e afrouxa os limites. Nunca liga em produção nem com banco de verdade (DATABASE_URL).
const TESTE = devFlag('CODEUP_TESTE') && !process.env.DATABASE_URL;
if (process.env.CODEUP_TESTE === '1' && !TESTE && !PROD) console.error('⚠⚠ CODEUP_TESTE=1 IGNORADO: há um DATABASE_URL (banco de verdade) configurado e o botão "Começar do zero" apagaria tudo.');
// Anúncios (Google AdSense). Sem ADSENSE_CLIENT o site não mostra anúncio nenhum.
const ADS_CLIENT = /^ca-pub-\d{10,20}$/.test(process.env.ADSENSE_CLIENT || '') ? process.env.ADSENSE_CLIENT : '';
const ADS_SLOT = /^\d{6,20}$/.test(process.env.ADSENSE_SLOT || '') ? process.env.ADSENSE_SLOT : '';
// Os anúncios também podem ser definidos pelo painel do dono (Ajustes → Anúncios; fica gravado no banco). O que foi salvo no painel vale mais que as variáveis;
// "voltar ao padrão do servidor" apaga o ajuste e volta a valer ADSENSE_CLIENT/ADSENSE_SLOT. Só os números dos IDs são aceitos (nunca código HTML colado).
const adsClientOf = v => { const t = String(v ?? '').trim().toLowerCase().replace(/^ca-/, ''); return /^pub-\d{10,20}$/.test(t) ? 'ca-' + t : ''; };
const adsSlotOf = v => { const t = String(v ?? '').trim(); return /^\d{6,20}$/.test(t) ? t : ''; };
function adsNow() {
  const a = settingsMain().ads;
  if (a && typeof a === 'object') { const client = adsClientOf(a.client), slot = adsSlotOf(a.slot); return { from: 'painel', on: a.on === true && !!client, client, slot }; }
  return { from: ADS_CLIENT ? 'ambiente' : 'nenhum', on: !!ADS_CLIENT, client: ADS_CLIENT, slot: ADS_SLOT };
}
const GOOGLE_ID = process.env.GOOGLE_CLIENT_ID || '';
const google = GOOGLE_ID ? new (require('google-auth-library').OAuth2Client)(GOOGLE_ID) : null;
// Sessão longa e renovável: quem entrou continua conectado (1 ano por padrão, SESSION_DAYS muda) e cada uso renova o prazo, então só desconecta quem ficar um ano sem abrir o app ou tocar em "Sair".
const SESSION_MS = (+process.env.SESSION_DAYS > 0 ? +process.env.SESSION_DAYS : 365) * 864e5, RENEW_MS = Math.min(864e5, SESSION_MS / 10), RESET_MS = 60 * 60e3;

const app = express();
app.set('trust proxy', 1);                               // atrás de Render/Railway/Nginx

// Painel em endereço separado: com ADMIN_HOST=admin.seusite.com.br o painel só existe nesse endereço
// (no site público /admin e /api/admin respondem 404) e, nesse endereço, só o painel funciona. Sem ADMIN_HOST, tudo no mesmo endereço.
const ADMIN_HOST = String(process.env.ADMIN_HOST || '').trim().toLowerCase().replace(/^[a-z]+:\/\//, '').replace(/[/:?#].*$/, '');
if (ADMIN_HOST) {
  const ADMIN_PATH = /^\/(admin(\.html|\.js|\.css)?|api\/admin)(\/|$)/, ADMIN_HOST_OK = /^\/(admin(\.html|\.js|\.css)?|api\/admin|icons\/|health$)/;
  app.use((req, res, next) => {
    const onAdmin = String(req.headers.host || '').toLowerCase().replace(/:\d+$/, '') === ADMIN_HOST;
    if (!onAdmin) return ADMIN_PATH.test(req.path) ? res.sendStatus(404) : next();
    if (req.path === '/') return res.redirect('/admin');
    return ADMIN_HOST_OK.test(req.path) ? next() : res.sendStatus(404);
  });
}

// ============================================================================
// "Banco de dados": o servidor trabalha com um objeto em memória (rápido) e grava as mudanças
// a cada segundo. Com DATABASE_URL grava no PostgreSQL (uma linha por usuário/sessão/etc.);
// sem ela usa o arquivo DATA_FILE (bom para testar no seu computador).
// ============================================================================
const { createStore } = require('./store');
const F = process.env.DATA_FILE || path.join(__dirname, 'data.json');
const store = createStore({ file: F, url: process.env.DATABASE_URL });
const DB = {};
let dirty = false, flushing = false;
const save = () => { dirty = true; };
async function flush() {
  if (!dirty || flushing) return; dirty = false; flushing = true;
  try { await store.save(DB); } catch (e) { dirty = true; console.error('Falha ao gravar no banco:', e.message); } finally { flushing = false; }
}
function prune() {
  const now = Date.now();
  for (const k in DB.sessions) if (DB.sessions[k].exp < now) delete DB.sessions[k];
  for (const k in DB.resets) if (DB.resets[k].exp < now) delete DB.resets[k];
  for (const k in DB.verifies) if (DB.verifies[k].exp < now) delete DB.verifies[k];
  for (const k in DB.asessions) if (DB.asessions[k].exp < now) delete DB.asessions[k];
  save();
}
async function initDb() {
  Object.assign(DB, await store.load());
  DB.users ??= {}; DB.sessions ??= {}; DB.resets ??= {}; DB.verifies ??= {}; DB.asessions ??= {}; DB.audit ??= {}; DB.settings ??= {}; DB.meta ??= {};
  delete DB.certs;                                           // o certificado foi retirado do app: apaga os registros antigos (eles guardavam o nome da pessoa)
  for (const u of Object.values(DB.users)) delete u.certs;
  prune(); await flush(); store.backup();
  setInterval(flush, 1000).unref(); setInterval(() => flush().then(() => store.backup()), 3600e3).unref(); setInterval(prune, 6 * 3600e3).unref();
  console.log(`Dados em: ${store.kind}`);
}
['SIGINT', 'SIGTERM'].forEach(s => process.on(s, async () => { dirty = true; flushing = false; await flush(); process.exit(0); }));

// ============================================================================
// Utilidades
// ============================================================================
const sha = s => crypto.createHash('sha256').update(s).digest('hex');
const hash = (pw, salt = crypto.randomBytes(16).toString('hex')) => salt + ':' + crypto.scryptSync(pw, salt, 64).toString('hex');
const checkPw = (pw, stored) => {
  if (!stored) return false;                              // conta criada só com Google não tem senha
  const [salt, h] = stored.split(':'), a = Buffer.from(h, 'hex'), b = crypto.scryptSync(pw, salt, 64);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};
const DUMMY_HASH = hash('senha-que-nao-existe-' + crypto.randomBytes(8).toString('hex'));
const same = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); };
const WEAK = new Set(['12345678', '123456789', '1234567890', 'password', 'senha123', 'qwertyui', '11111111', '00000000', 'abcd1234', 'senha1234', 'brasil123', 'iloveyou', 'password1', 'qwerty123', '12341234', '87654321', 'mudar123']);
const pwProblem = (pw, email) => pw.length < 8 || pw.length > 100 ? 'A senha precisa ter entre 8 e 100 caracteres.' : WEAK.has(pw.toLowerCase()) || pw.toLowerCase() === String(email || '').split('@')[0] ? 'Essa senha é fácil de adivinhar. Escolha outra.' : null;
const day = d => d.toISOString().slice(0, 10);
// ---------- ranking e XP ----------
// A semana do ranking começa na segunda-feira às 00:00 no horário de Brasília (UTC-3, sem horário de verão). O id da semana é a data dessa segunda.
const BRT = 3 * 36e5;
const weekStart = (t = Date.now()) => { const d = new Date(t - BRT), dow = (d.getUTCDay() + 6) % 7; return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - dow) + BRT; };
const weekId = (t = Date.now()) => new Date(weekStart(t)).toISOString().slice(0, 10);
const RANK_TTL = process.env.RANK_TTL_MS !== undefined && +process.env.RANK_TTL_MS >= 0 ? +process.env.RANK_TTL_MS : 5000;   // o ranking é recalculado no máximo a cada 5 s (nos testes: sempre)
const RANK = { at: 0, w: '', m: new Map() };
// XP ganho: soma no total e na semana, e guarda a hora para desempatar o ranking (quem chegou primeiro fica na frente)
function gainXp(u, n) {
  if (!(n > 0)) return; const now = Date.now(), w = weekId(now);
  u.xp = (u.xp || 0) + n; u.xpAt = now; if (!u.wk || u.wk.w !== w) u.wk = { w, xp: 0 }; u.wk.xp += n; RANK.at = 0;
}
// ---------- ajustes do dono (painel /admin): cadastros abertos, comunicado e modo livre ----------
const settingsMain = () => { DB.settings ??= {}; const m = DB.settings.main ??= {}; m.signupsOpen ??= true; m.announce ??= { on: false, text: '', kind: 'info', id: 0 }; m.unlockAll ??= { on: false, until: null }; m.courses ??= {}; return m; };
// curso ativo/inativo (painel /admin → Ajustes → Cursos): curso desligado some do app e fica bloqueado. Sem registro = ativo.
const courseOn = t => settingsMain().courses[t] !== false;
const coursesCfg = () => Object.fromEntries(TRACKS.map(t => [t, courseOn(t)]));
const unlockAllOn = () => { const a = settingsMain().unlockAll; return !!(a.on && (!a.until || Date.parse(a.until) > Date.now())); };
// curso liberado: o dono liberou o curso para esta pessoa (ou para todo mundo, no modo livre). Sem bloqueio de nível, sequência ou checkpoint.
const unlocked = (u, track) => unlockAllOn() || !!(u.unlock && u.unlock[track]);
// ---------- guarda-roupa: dias de estudo, fantasias que a pessoa tem e a que está vestindo ----------
// "dias de estudo" = dias diferentes em que ela acertou algo (contas antigas, sem o contador, partem da sequência atual)
const daysOf = u => Math.max(u.days || 0, u.streak || 0);
const cosState = u => ({ xp: u.xp, days: daysOf(u), own: u.own, gems: u.gems || 0 });
const cosOwned = u => R.ownedCostumes(cosState(u)).filter(k => R.costume(k).guide === u.guide);   // as de outro personagem ficam guardadas, mas não valem
const cosWorn = u => { const c = R.costume(u.cost); return c && c.guide === u.guide && R.costumeState(c, cosState(u)) === 'own' ? c.key : null; };
const pub = u => ({
  name: u.name, email: u.email, sex: u.sex || null, verified: u.verified !== false, xp: u.xp, done: u.done, ex: u.ex || {}, cps: Object.keys(u.cpdone || {}).filter(id => ACT.has(id)), gems: u.gems || 0, streak: u.streak || 0, days: daysOf(u), own: cosOwned(u), cos: cosWorn(u), hasPassword: !!u.pass, google: !!u.googleId,
  track: u.track || null, guide: u.guide || null, gname: u.gname || null, frame: u.frame || null, color: R.pick('color', u.xp, u.color, u.guide), sticker: R.pick('sticker', u.xp, u.sticker), bg: R.pick('bg', u.xp, u.bg), outfit: R.pick('outfit', u.xp, u.outfit), rankOff: !!u.rankOff, wk: u.wk && u.wk.w === weekId() ? u.wk.xp : 0, passed: u.passed || {}, fails: u.fails || {},
  unlocked: Object.fromEntries(TRACKS.filter(t => unlocked(u, t)).map(t => [t, true])),
  away: u.away ? { days: Math.max(1, Math.floor((Date.now() - Date.parse(u.away.from)) / 864e5)) } : null          // dias sem entrar (só enquanto a tela "dormindo" não foi vista)
});
// ---------- as ATIVIDADES de cada lição: x) executar (teoria + prática) · r) ler o código · e) explicar o código (só Python/SQL Intermediário e Avançado) ----------
// A ORDEM em que aparecem é sorteada por aluno e por lição (e fica guardada: o sorteio é sempre o mesmo para a mesma pessoa e lição). Cada atividade só abre quando as que vêm
// antes dela na ordem estão feitas. `u.ex[id]` = executar feita · `u.ler[id]` = ler feita · `u.exp[id]` = explicar feita · `u.done[id]` = lição concluída (todas feitas; é o que libera
// a próxima lição). Quem já tinha a lição concluída antes de existirem as atividades novas continua concluído (e já tinha ganhado o XP). O XP da lição se divide entre as atividades.
const hasRead = l => !!(l && l.read && !l.cp && !l.fin);
const hasExpl = l => !!(l && l.expl && hasRead(l));
const actsOf = l => !hasRead(l) ? [] : hasExpl(l) ? ['x', 'r', 'e'] : ['x', 'r'];
const ACT_NAME = { x: 'executar o código', r: 'ler o código', e: 'explicar o código' };
const ACT_FLAG = { x: 'ex', r: 'ler', e: 'exp' };
const actDone = (u, l, a) => !!(u.done[l.id] || (u[ACT_FLAG[a]] || {})[l.id]);
const exDone = (u, l) => actDone(u, l, 'x');
const FIXED_ORDER = process.env.FIXED_ACT_ORDER === '1' && !PROD;                      // só nos testes automáticos: ordem fixa (executar, ler, explicar) em vez de sorteada
const ordOf = (u, l) => { const a = actsOf(l); return a.length > 1 && !FIXED_ORDER ? shuffled(a, u.id + ':ord:' + l.id) : a; };      // a ordem sorteada das atividades desta lição para esta pessoa
const nextAct = (u, l) => ordOf(u, l).find(a => !actDone(u, l, a)) || null;           // a próxima atividade que falta (null = lição completa)
function actBefore(u, l, a) {                                                          // a atividade que precisa ser feita antes de `a` (ou null se `a` já pode abrir)
  if (u.done[l.id]) return null;                                                       // lição concluída: pode treinar qualquer uma
  for (const b of ordOf(u, l)) { if (b === a) return null; if (!actDone(u, l, b)) return b; }
  return null;
}
const ordMsg = b => `Antes, faça a atividade de ${ACT_NAME[b]}.`;
const xpShare = (l, a) => {                                                            // 2 atividades: metade (arredondada para cima) para executar e o resto para ler · 3: um terço, depois o resto dividido
  const n = actsOf(l).length, x = Math.ceil(l.xp / n); if (n < 3) return a === 'x' ? x : l.xp - x;
  const r = Math.ceil((l.xp - x) / 2); return a === 'x' ? x : a === 'r' ? r : l.xp - x - r;
};
const GEMS = { 2: { x: 2, r: 3 }, 3: { x: 2, r: 2, e: 1 } };                          // diamantes: 5 por lição, divididos entre as atividades
function award(u, l, a) {                                                              // XP e diamantes de uma atividade, só na 1ª vez (devolve o XP ganho)
  const f = l.id + ':' + a; if (u.xpd[l.id] || u.xpd[f]) return 0;
  u.xpd[f] = 1; const g = xpShare(l, a); gainXp(u, g); u.gems = (u.gems || 0) + GEMS[actsOf(l).length][a]; return g;
}
function finishLesson(u, l, code) {                                                    // todas as atividades feitas? então a lição conclui (libera a próxima)
  if (u.done[l.id] || !actsOf(l).every(a => actDone(u, l, a))) return false;
  u.done[l.id] = { code: code ?? ((u.ex || {})[l.id] || {}).code ?? '', date: new Date().toISOString() }; return true;
}
const clearActs = (u, id) => { delete u.done[id]; for (const f of Object.values(ACT_FLAG)) delete (u[f] || {})[id]; };   // recomeçar a lição: apaga todas as atividades
function tickStreak(u) {                                                                // a sequência de dias vale uma vez por dia, na 1ª atividade certa do dia
  const today = day(new Date()), yest = day(new Date(Date.now() - 864e5)); let streakUp = 0, gemBonus = 0;
  if (u.last !== today) {
    const d0 = daysOf(u); u.streak = u.last === yest ? (u.streak || 0) + 1 : 1; u.last = today; streakUp = u.streak; u.days = d0 + 1;     // mais um dia de estudo
    const sb = R.STREAK_GEMS[u.streak];                                               // marco da sequência (3, 7, 14, 30, 60, 100 dias): diamantes de bônus, uma vez só
    if (sb && !u.xpd['sg' + u.streak]) { u.xpd['sg' + u.streak] = 1; u.gems = (u.gems || 0) + sb; gemBonus = sb; }
  }
  return { streakUp, gemBonus };
}
const norm = s => String(s ?? '').replace(/\r/g, '').split('\n').map(x => x.trim().replace(/\s+/g, ' ')).join('\n').trim();
const shuffled = (arr, seed) => { const a = [...arr]; let h = parseInt(sha(seed).slice(0, 8), 16) || 1; const rnd = () => (h = (Math.imul(h, 1664525) + 1013904223) >>> 0) / 4294967296; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const readMeta = l => ({ id: l.id, title: l.title, type: l.type, track: l.track, lv: l.lv, n: l.n, level: l.level, xp: l.xp });
function readPub(u, l) {                                                                // o que o navegador recebe: sem a resposta certa; as opções vêm numa ordem fixa por aluno e lição
  const r = l.read, code = r.code || '', names = l.type === 'sql' ? (lessons.seedTables[r.seedKey] || []).filter(t => new RegExp('\\b' + t.name + '\\b', 'i').test(code)) : [];
  return { ...readMeta(l), k: r.k, q: r.q, code: r.code, sheet: r.sheet, ask: r.ask, table: r.table, chart: r.chart, text: r.text, diagram: r.diagram, data: r.data, lang: r.lang, model: r.model, unit: r.unit, tables: names.length ? names : undefined, opts: r.k === 'mc' ? shuffled([r.ok, ...r.no], u.id + l.id) : undefined, done: !!u.done[l.id] };
}
const idx = id => lessons.findIndex(l => l.id === String(id));
const ACT = new Map([...lessons, ...tests, ...projects].map(l => [l.id, l]));       // lições + checkpoints + provas finais + projetos
const CP_AFTER = new Map(checkpoints.map(c => [`${c.track}-${c.lv}-${c.after}`, c]));   // checkpoint que vem depois da lição 10 e da 20
const actOf = id => ACT.get(String(id));
const PJ_AT = new Map(projects.map(p => [`${p.track}-${p.lv}-${p.after}`, p]));          // projeto que vem depois da lição 5, 10, 15, 20, 25 e 30
const pjDone = (u, track, lv, n) => { const p = PJ_AT.get(`${track}-${lv}-${n}`); return !p || !!(u.cpdone || {})[p.id]; };   // o projeto feito fica guardado junto com os checkpoints (cpdone)
const strip = ({ expectedSql, expectedOut, expectedRows, need, forbid, answer, altSet, keep, noAlt, ordered, names, quiz, read, expl, ...rest }) => rest;   // o gabarito nunca vai para o navegador
const stripExam = ({ expectedSql, expectedOut, expectedRows, need, forbid, answer, altSet, keep, noAlt, ordered, names, quiz, solution, hints, explain, example, exampleOut, mat, read, expl, ...rest }) => rest;   // nas provas (checkpoint e final) também não vai solução nem dica
const ensure = u => { u.track ??= null; u.passed ??= {}; u.exams ??= {}; u.xpd ??= {}; u.fails ??= {}; u.done ??= {}; u.ex ??= {}; u.ler ??= {}; u.exp ??= {}; u.cpdone ??= {}; u.cptry ??= {}; u.attempts ??= {}; return u; };

// ---------- regras do curso: curso -> nível -> lições (em ordem) ----------
const key = (track, lv) => `${track}-${lv}`;
const levelLessons = (track, lv) => lessons.filter(l => l.track === track && l.lv === lv);
const levelOpen = (u, track, lv) => lv === 1 || unlocked(u, track) || !!u.passed[key(track, lv - 1)];
// motivo de uma lição (ou prova) estar bloqueada: 'level' (nível anterior sem aprovação) | 'seq' (lição anterior não concluída) | 'cp' (falta passar no checkpoint) | null
function lockOf(u, l) {
  if (!courseOn(l.track)) return 'off';                     // curso desligado pelo dono: ninguém abre (nem quem tinha liberado)
  if (unlocked(u, l.track)) return null;                    // liberado pelo dono
  if (!levelOpen(u, l.track, l.lv)) return 'level';
  if (l.fin) { if (u.passed[key(l.track, l.lv)]) return null; return !levelDone(u, l.track, l.lv) ? 'seq' : pjDone(u, l.track, l.lv, 30) ? null : 'pj'; }   // a prova final libera depois das 30 lições e do projeto da lição 30 (quem já passou pode treinar)
  if (l.cp) {                                                                              // checkpoint libera depois da lição 10 (ou 20) e do projeto dela
    if (u.cpdone[l.id]) return null;
    const prev = lessons.find(x => x.track === l.track && x.lv === l.lv && x.n === l.after); if (!(prev && u.done[prev.id])) return 'seq';
    return pjDone(u, l.track, l.lv, l.after) ? null : 'pj';
  }
  if (l.proj) { const prev = lessons.find(x => x.track === l.track && x.lv === l.lv && x.n === l.after); return prev && u.done[prev.id] ? null : 'seq'; }   // o projeto libera quando a lição dele (5, 10, 15...) está feita
  if (l.n > 1 && !u.done[lessons[idx(l.id) - 1].id]) return 'seq';
  if (!u.done[l.id] && l.n > 1 && (l.n - 1) % 5 === 0) {                                   // as lições 6, 11, 16, 21 e 26 só liberam com o projeto da lição anterior; a 11 e a 21 também com o checkpoint
    const c = (l.n - 1) % 10 === 0 ? cpBefore(l) : null;
    if (!(c && u.cpdone[c.id]) && !pjDone(u, l.track, l.lv, l.n - 1)) return 'pj';         // (quem já passou no checkpoint antes de existirem os projetos não é barrado)
    if (c && !u.cpdone[c.id]) return 'cp';
  }
  return null;
}
const cpBefore = l => CP_AFTER.get(`${l.track}-${l.lv}-${l.n - 1}`);   // checkpoint que vem logo antes da lição l (ou undefined)
const LOCK_MSG = { off: 'Este curso não está disponível no momento.', level: 'Passe na prova final do nível anterior para liberar este nível.', seq: 'Conclua a lição anterior para liberar esta.', pj: 'Faça o projeto das últimas 5 lições para liberar esta lição.', cp: 'Passe no checkpoint (a prova com o que você aprendeu nas últimas 10 lições) para liberar esta lição.' };
const lockMsg = (lock, l) => lock === 'seq' && (l.cp || l.fin || l.proj) ? (l.fin ? 'Conclua as 30 lições do nível para liberar a prova final.' : l.proj ? `Conclua a lição ${l.after} para liberar este projeto.` : `Conclua a lição ${l.after} para liberar este checkpoint.`)
  : lock === 'pj' && (l.cp || l.fin) ? `Faça o projeto da lição ${l.after} para liberar ${l.fin ? 'a prova final' : 'este checkpoint'}.` : LOCK_MSG[lock];
const isTest = l => !!(l.cp || l.fin);
const chancesLeft = (u, l) => Math.max(0, l.chances - ((u.cptry || {})[l.id] || 0));    // chances que ainda restam nesta prova
const levelDone = (u, track, lv) => levelLessons(track, lv).every(l => u.done[l.id]);
const trackDone = (u, track) => Array.from({ length: LEVELS_OF[track] || 3 }, (_, i) => i + 1).every(lv => u.passed[key(track, lv)]);   // curso concluído = prova final de todos os níveis que ele tem
const findUser = email => Object.values(DB.users).find(u => u.email === email);
const MAX_SESSIONS = 10;
const tokOf = req => sha(String(req.headers['x-token'] || ''));
// Cookie de reserva (HttpOnly: o JavaScript da página não lê): se o navegador apagar o armazenamento local (o Safari do iPhone faz isso depois de ~7 dias sem abrir o site), o app recupera o login por /api/session/restore.
// Ele NÃO autentica as demais rotas (só o cabeçalho x-token autentica), então não abre brecha de CSRF.
const COOKIE = 'cu_sid';
const cookieOf = req => { const m = String(req.headers.cookie || '').match(/(?:^|;\s*)cu_sid=([0-9a-f]{64})(?:;|$)/); return m ? m[1] : ''; };
const putCookie = (req, res, t) => res.append('Set-Cookie', `${COOKIE}=${t}; Max-Age=${Math.floor(SESSION_MS / 1000)}; Path=/; HttpOnly; SameSite=Lax${req.secure ? '; Secure' : ''}`);
const dropCookie = (req, res) => res.append('Set-Cookie', `${COOKIE}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax${req.secure ? '; Secure' : ''}`);
const newSession = (id, req, res) => {                    // no banco fica só o HASH do token: vazar o banco não permite entrar nas contas
  const t = crypto.randomBytes(32).toString('hex');
  const mine = Object.entries(DB.sessions).filter(([, v]) => v.id === id).sort((a, b) => a[1].exp - b[1].exp);
  while (mine.length >= MAX_SESSIONS) delete DB.sessions[mine.shift()[0]];
  DB.sessions[sha(t)] = { id, exp: Date.now() + SESSION_MS }; save(); if (res) putCookie(req, res, t); return t;
};
const dropSessions = id => { for (const k in DB.sessions) if (DB.sessions[k].id === id) delete DB.sessions[k]; };

// limite de tentativas por IP (protege login, cadastro e recuperação de senha)
const RELAX = (process.env.RELAX_SUBMIT_LIMIT === '1' || TESTE) && !PROD ? 100 : 1;   // só para os testes automáticos
const hits = new Map();
const limit = (max, ms) => (req, res, next) => {
  const k = req.ip + req.path, now = Date.now(), a = (hits.get(k) || []).filter(t => now - t < ms);
  if (a.length >= max) return res.status(429).json({ error: 'Muitas tentativas. Aguarde alguns minutos e tente de novo.' });
  a.push(now); hits.set(k, a); next();
};
setInterval(() => hits.clear(), 3600e3).unref();

// ---------- e-mail: Resend (RESEND_API_KEY) ou SMTP. Sem nenhum dos dois, o link aparece só no console ----------
const MAIL_FROM = process.env.MAIL_FROM || process.env.SMTP_USER || '';
const mailer = process.env.SMTP_HOST ? require('nodemailer').createTransport({
  host: process.env.SMTP_HOST, port: +(process.env.SMTP_PORT || 587), secure: +(process.env.SMTP_PORT || 587) === 465,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
}) : null;
const mailReady = !!(process.env.RESEND_API_KEY || mailer);
const escH = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
async function sendMail(to, subject, text, html) {
  if (process.env.RESEND_API_KEY) {
    const r = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: MAIL_FROM, to: [to], subject, text, html }) });
    if (!r.ok) throw new Error(`Resend ${r.status}: ${await r.text()}`);
    return;
  }
  if (mailer) { await mailer.sendMail({ from: MAIL_FROM, to, subject, text, html }); return; }
  if (PROD) { console.error('E-mail não enviado: configure RESEND_API_KEY ou SMTP_*.'); return; }   // em produção nunca escreve links/tokens no log
  console.log(`\n[E-MAIL NÃO CONFIGURADO] Para: ${to}\nAssunto: ${subject}\n${text}\n`);
}
const mailHtml = (title, body, btn, link) => `<div style="font-family:system-ui,Segoe UI,sans-serif;max-width:480px;margin:auto;padding:24px;color:#0b1b3f"><h2 style="margin:0 0 12px">${title}</h2><p style="line-height:1.55">${body}</p>${link ? `<p style="margin:26px 0"><a href="${link}" style="background:#2f7cff;color:#fff;padding:14px 24px;border-radius:12px;text-decoration:none;font-weight:700;display:inline-block">${btn}</a></p><p style="font-size:13px;color:#566">Se o botão não funcionar, copie e cole este link no navegador:<br>${link}</p>` : ''}<p style="font-size:12px;color:#889;margin-top:28px">${escH(COMPANY)}</p></div>`;
const tooMany = (key, max, ms) => { const now = Date.now(), a = (hits.get(key) || []).filter(t => now - t < ms); if (a.length >= max) return true; a.push(now); hits.set(key, a); return false; };
if (!mailReady) console.warn('⚠ E-mail NÃO configurado: a recuperação de senha só mostra o link aqui no console. Configure RESEND_API_KEY ou SMTP_* (veja o README).');

// cria um link de redefinição de senha (vale 1 hora) e invalida os anteriores do mesmo usuário
function makeResetLink(u) {
  for (const k in DB.resets) if (DB.resets[k].id === u.id) delete DB.resets[k];
  const token = crypto.randomBytes(32).toString('hex');
  DB.resets[sha(token)] = { id: u.id, exp: Date.now() + RESET_MS }; save();
  return `${BASE}/?reset=${token}`;
}
// ---------- confirmação de e-mail ----------
const VERIFY_MS = 48 * 3600e3, VERIFY_ON = mailReady || DEV_LINK;   // sem e-mail configurado não dá para exigir confirmação
if (!VERIFY_ON) console.warn('⚠ Sem e-mail configurado: contas novas serão aceitas SEM confirmação de e-mail.');
function makeVerifyLink(u) {
  for (const k in DB.verifies) if (DB.verifies[k].id === u.id) delete DB.verifies[k];
  const token = crypto.randomBytes(32).toString('hex');
  DB.verifies[sha(token)] = { id: u.id, exp: Date.now() + VERIFY_MS }; save();
  return `${BASE}/verificar?token=${token}`;
}
async function sendVerify(u) {
  const link = makeVerifyLink(u), first = u.name.split(' ')[0];
  try {
    await sendMail(u.email, `${COMPANY} — confirme seu e-mail`,
      `Olá, ${first}!\n\nBem-vindo(a)! Confirme seu e-mail abrindo o link abaixo (vale por 48 horas):\n${link}\n\nSe não foi você, ignore este e-mail.`,
      mailHtml('Confirme seu e-mail', `Olá, ${escH(first)}! Falta só um passo: confirme que este e-mail é seu. O link vale por 48 horas.`, 'Confirmar e-mail', link));
  } catch (e) { console.error('Falha ao enviar e-mail de confirmação:', e.message); }
  return link;
}
const needVerify = (u, res) => u.verified === false ? (res.status(403).json({ error: 'Confirme seu e-mail antes de continuar. Enviamos um link para ' + u.email + '.', needsVerify: true }), true) : false;

// cabeçalhos de segurança. A CSP só deixa carregar código da própria página, do CDN do Pyodide, do login do Google
// e (só quando os anúncios estão ligados, pelo painel ou por ADSENSE_CLIENT) dos domínios de anúncio do Google.
// ('unsafe-inline' porque o app usa onclick; 'unsafe-eval'/'wasm-unsafe-eval' porque o Python do navegador (Pyodide) precisa).
const ADS_HOST_LIST = ' https://*.googlesyndication.com https://*.google.com https://*.doubleclick.net https://*.adtrafficquality.google https://www.googletagservices.com https://*.googleadservices.com';
const cspOf = ADS_HOSTS => ["default-src 'self'", "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' https://cdn.jsdelivr.net https://accounts.google.com" + ADS_HOSTS,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com", "font-src 'self' https://fonts.gstatic.com data:", "img-src 'self' data: https:",
  "connect-src 'self' https://cdn.jsdelivr.net https://accounts.google.com" + ADS_HOSTS, "worker-src 'self' blob:", "frame-src https://accounts.google.com" + ADS_HOSTS,
  "form-action 'self'", "base-uri 'self'", "object-src 'none'", "frame-ancestors 'none'"].join('; ');
const CSP_ADS = cspOf(ADS_HOST_LIST), CSP_NOADS = cspOf('');
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.set({ 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(self), usb=(), interest-cohort=()',
    'Content-Security-Policy': adsNow().on ? CSP_ADS : CSP_NOADS });
  if (BASE.startsWith('https')) res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

app.get('/health', (req, res) => res.json({ ok: true }));
// App Android na Play Store (TWA): o Android só abre o app em tela cheia, sem a barra do navegador, se o site provar que pertence ao app.
// Preencha ANDROID_PACKAGE (ex.: com.seusite.codeup) e ANDROID_SHA256 (impressão digital SHA-256 do certificado de assinatura do app; várias separadas por vírgula).
app.get('/.well-known/assetlinks.json', (req, res) => {
  const pkg = String(process.env.ANDROID_PACKAGE || '').trim(), fps = String(process.env.ANDROID_SHA256 || '').split(',').map(x => x.trim().toUpperCase()).filter(Boolean);
  if (!/^[A-Za-z][\w]*(\.[A-Za-z][\w]*)+$/.test(pkg) || !fps.length || !fps.every(x => /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/.test(x))) return res.status(404).json({ error: 'Não encontrado.' });
  res.set('Cache-Control', 'public, max-age=3600').json([{ relation: ['delegate_permission/common.handle_all_urls'], target: { namespace: 'android_app', package_name: pkg, sha256_cert_fingerprints: fps } }]);
});

app.use(express.json({ limit: '50kb' }));
// sql.js próprio (sem depender de CDN de terceiros). O caminho é descoberto pelo Node: funciona mesmo se o node_modules estiver numa pasta acima do projeto.
// sql.js: a cópia dentro do projeto (vendor/sql) vem primeiro; sem ela, usa o pacote do "npm install".
let SQLJS_DIST = path.join(__dirname, 'vendor', 'sql');
if (!fs.existsSync(path.join(SQLJS_DIST, 'sql-wasm.js'))) {
  try { SQLJS_DIST = path.dirname(require.resolve('sql.js')); }
  catch { console.error('⚠⚠ O sql.js não foi encontrado (nem em vendor/sql, nem em node_modules): as lições de SQL não serão corrigidas. Rode: npm install'); }
}
app.use('/vendor/sql', express.static(SQLJS_DIST, { maxAge: '7d' }));
app.use('/api', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });   // respostas da API nunca vão para o cache (liberações e avisos valem na hora)
// página inicial: com os anúncios ligados leva a meta tag que o AdSense aceita para verificar o site (o aluno não escolhe o tipo de anúncio: o app pede ao Google só anúncios não personalizados)
let idxCache = { m: 0, html: '' };
const indexHtml = () => {
  const f = path.join(__dirname, 'public', 'index.html'), m = fs.statSync(f).mtimeMs; if (m !== idxCache.m) idxCache = { m, html: fs.readFileSync(f, 'utf8') };
  const a = adsNow(); return a.on ? idxCache.html.replace('</head>', `<meta name="google-adsense-account" content="${a.client}">\n</head>`) : idxCache.html;
};
app.get(['/', '/index.html'], (req, res) => res.set('Cache-Control', 'no-cache').type('html').send(indexHtml()));
app.use(express.static(path.join(__dirname, 'public'), { setHeaders: (res, p) => { if (p.endsWith('sw.js')) res.set('Cache-Control', 'no-cache'); } }));

// páginas legais (editáveis em ./legal; nome da empresa e contato vêm do .env)
const legal = name => (req, res) => {
  const html = fs.readFileSync(path.join(__dirname, 'legal', name + '.html'), 'utf8')
    .replace(/{{COMPANY}}/g, COMPANY).replace(/{{CONTACT}}/g, CONTACT || '(e-mail de contato)');
  res.type('html').send(html);
};
app.get('/termos', legal('termos')); app.get('/privacidade', legal('privacidade'));
// guias públicos (texto das lições, sem login): é aqui — e só aqui — que ficam os anúncios; o app em si (mapa, abas, resultados) não mostra anúncio
// porque o AdSense não permite anúncio em telas de navegação ou sem conteúdo do dono do site
require('./guides').mount(app, { lessons, projects, env: () => ({ base: BASE, company: COMPANY, contact: CONTACT }), ads: () => adsNow() });

// ads.txt: o AdSense exige este arquivo na raiz do site para pagar pelos anúncios
app.get('/ads.txt', (req, res) => { const a = adsNow(); return a.client ? res.set('Cache-Control', 'public, max-age=300').type('text/plain').send(`google.com, ${a.client.replace('ca-', '')}, DIRECT, f08c47fec0942fa0\n`) : res.sendStatus(404); });

app.get('/api/config', (req, res) => res.json({ teste: TESTE, contact: CONTACT, company: COMPANY, googleClientId: GOOGLE_ID, courses: coursesCfg(), ads: (a => a.on ? { client: a.client, slot: a.slot } : ADS_PREVIEW ? { preview: true } : null)(adsNow()),
  announce: (a => a.on && a.text ? { id: a.id, text: a.text, kind: a.kind } : null)(settingsMain().announce) }));

// "Começar do zero" do modo teste: apaga contas, sessões, ajustes e histórico (só existe com CODEUP_TESTE=1 e arquivo local).
if (TESTE) app.post('/api/teste/reset', (req, res) => {
  for (const k of ['users', 'sessions', 'resets', 'verifies', 'settings']) for (const id of Object.keys(DB[k] || {})) delete DB[k][id];
  if (Array.isArray(DB.audit)) DB.audit.length = 0; else for (const id of Object.keys(DB.audit || {})) delete DB.audit[id];
  hits.clear(); save(); res.json({ ok: true });
});

// ============================================================================
// Autenticação
// ============================================================================
const BAN_MSG = () => 'Sua conta foi suspensa.' + (CONTACT ? ' Fale com ' + CONTACT + '.' : ' Fale com o suporte.');
// Aluno que ficou dias sem entrar: quando volta, o personagem aparece dormindo (tela "Acordar"). Vale a partir de AWAY_DAYS dias sem acessar (padrão 3).
const AWAY_MS = (+process.env.AWAY_DAYS > 0 ? +process.env.AWAY_DAYS : 3) * 864e5;
function auth(req, res, next) {
  const s = DB.sessions[tokOf(req)], u = s && s.exp > Date.now() && DB.users[s.id];
  if (!u) return res.status(401).json({ error: 'login' });
  if (u.banned) return res.status(403).json({ error: BAN_MSG(), banned: true });
  const renew = s.exp - Date.now() < SESSION_MS - RENEW_MS;                                    // usou o app: renova o prazo (grava no máximo 1 vez por dia por aparelho)
  if (renew) { s.exp = Date.now() + SESSION_MS; save(); }
  if (renew || (req.path === '/api/me' && !cookieOf(req))) putCookie(req, res, String(req.headers['x-token']));   // mantém o cookie de reserva em dia (e cria para quem já estava conectado antes dele existir)
  const gap = u.seen ? Date.now() - Date.parse(u.seen) : 0;
  if (u.seen && !u.away && gap > AWAY_MS) { u.away = { from: u.seen }; u.seen = new Date().toISOString(); save(); }   // voltou depois de muito tempo: a tela do personagem dormindo fica pendente até ele tocar em "Acordar"
  else if (!u.seen || gap > 10 * 60e3) { u.seen = new Date().toISOString(); save(); }   // "último acesso" (gravado no máximo a cada 10 min)
  req.u = ensure(u); next();
}

app.post('/api/register', limit(20 * RELAX, 3600e3), async (req, res) => {
  const name = String(req.body.name || '').trim().slice(0, 30);
  const email = String(req.body.email || '').trim().toLowerCase().slice(0, 120);
  const pw = String(req.body.password || '');
  if (!settingsMain().signupsOpen) return res.status(403).json({ error: 'Os cadastros estão temporariamente fechados. Volte em breve!' });
  if (!name) return res.status(400).json({ error: 'Informe seu nome.' });
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'E-mail inválido.' });
  { const pp = pwProblem(pw, email); if (pp) return res.status(400).json({ error: pp }); }
  if (req.body.accept !== true) return res.status(400).json({ error: 'Aceite os Termos de Uso e a Política de Privacidade para continuar.' });
  if (findUser(email)) return res.status(409).json({ error: 'Este e-mail já tem conta. Faça login.' });
  const id = crypto.randomUUID(), now = new Date().toISOString();
  const u = DB.users[id] = { id, name, email, pass: hash(pw), verified: !VERIFY_ON, xp: 0, gems: 0, streak: 0, done: {}, attempts: {}, created: now, acceptedTerms: now, ...profileOf(req.body) };
  const out = { token: newSession(id, req, res) };
  if (VERIFY_ON) { const link = await sendVerify(u); if (DEV_LINK) out.devVerifyLink = link; }
  res.json(out);
});

app.post('/api/login', limit(10, 15 * 60e3), (req, res) => {
  const em = String(req.body.email || '').trim().toLowerCase().slice(0, 120), u = findUser(em);
  if (tooMany('login:' + em, 10, 15 * 60e3)) return res.status(429).json({ error: 'Muitas tentativas para esta conta. Aguarde alguns minutos ou use "Esqueci minha senha".' });   // freia ataque vindo de vários IPs
  const okPw = checkPw(String(req.body.password || ''), u && u.pass ? u.pass : DUMMY_HASH);   // gasta o mesmo tempo mesmo se a conta não existir
  if (!u || !u.pass || !okPw) return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
  if (u.banned) return res.status(403).json({ error: BAN_MSG(), banned: true });
  res.json({ token: newSession(u.id, req, res) });
});

app.post('/api/logout', auth, (req, res) => {
  delete DB.sessions[tokOf(req)];
  const c = cookieOf(req), cs = c && DB.sessions[sha(c)]; if (cs && cs.id === req.u.id) delete DB.sessions[sha(c)];
  dropCookie(req, res); save(); res.json({ ok: true });
});

// O app chama quando abre sem token no armazenamento local: se o cookie de reserva ainda vale, devolve o token e a pessoa continua conectada.
app.post('/api/session/restore', (req, res) => {          // sem limite de tentativas: o cookie tem 256 bits aleatórios, não dá para adivinhar
  const t = cookieOf(req), s = t && DB.sessions[sha(t)], u = s && s.exp > Date.now() && DB.users[s.id];
  if (!u || u.banned) { if (t) dropCookie(req, res); return res.json({ token: null }); }
  if (s.exp - Date.now() < SESSION_MS - RENEW_MS) { s.exp = Date.now() + SESSION_MS; save(); }
  putCookie(req, res, t); res.json({ token: t });
});

app.post('/api/forgot', limit(10, 15 * 60e3), async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase(), u = findUser(email), out = { ok: true };   // resposta igual exista ou não a conta
  if (u && !tooMany('forgot:' + email, 3, 3600e3)) {       // no máximo 3 e-mails por hora para o mesmo endereço (evita spam)
    const link = makeResetLink(u), first = u.name.split(' ')[0];
    const extra = u.googleId ? ' Sua conta também entra com o Google; criar uma senha é opcional.' : '';
    try {
      await sendMail(u.email, `${COMPANY} — redefinir sua senha`,
        `Olá, ${first}!\n\nRecebemos um pedido para redefinir sua senha. Abra o link abaixo (vale por 1 hora):\n${link}\n\nSe não foi você, ignore este e-mail: sua senha continua a mesma.${extra}`,
        mailHtml('Redefinir sua senha', `Olá, ${escH(first)}! Recebemos um pedido para redefinir sua senha. O link vale por 1 hora. Se não foi você, ignore este e-mail.${extra}`, 'Criar nova senha', link));
    } catch (e) { console.error('Falha ao enviar e-mail de recuperação:', e.message); }
    if (DEV_LINK) out.devLink = link;
  }
  res.json(out);
});

app.get('/api/reset/check', limit(30, 15 * 60e3), (req, res) => {
  const r = DB.resets[sha(String(req.query.token || ''))];
  res.json({ valid: !!(r && r.exp > Date.now() && DB.users[r.id]) });
});

app.post('/api/reset', limit(10, 15 * 60e3), async (req, res) => {
  const tk = String(req.body.token || ''), r = DB.resets[sha(tk)], pw = String(req.body.password || '');
  if (!r || r.exp < Date.now() || !DB.users[r.id]) return res.status(400).json({ error: 'Link inválido ou expirado. Peça um novo.' });
  { const pp = pwProblem(pw, DB.users[r.id].email); if (pp) return res.status(400).json({ error: pp }); }
  const u = DB.users[r.id];
  if (u.banned) return res.status(403).json({ error: BAN_MSG(), banned: true });
  u.pass = hash(pw); dropSessions(u.id); delete DB.resets[sha(tk)];
  const token = newSession(u.id, req, res);                // já deixa a pessoa conectada
  res.json({ ok: true, token });
  sendMail(u.email, `${COMPANY} — sua senha foi alterada`, `Olá! A senha da sua conta foi alterada agora. Se não foi você, peça uma nova senha em ${BASE} e fale com ${CONTACT || 'o suporte'}.`,
    mailHtml('Senha alterada', 'A senha da sua conta foi alterada agora. Se não foi você, peça uma nova senha no app e fale com o suporte.')).catch(() => { });
});

// alterar senha logado (quem entrou só com Google pode criar uma senha, sem informar a atual)
app.post('/api/password', auth, limit(10, 15 * 60e3), (req, res) => {
  const u = req.u, pw = String(req.body.password || '');
  if (u.pass && !checkPw(String(req.body.current || ''), u.pass)) return res.status(403).json({ error: 'Senha atual incorreta.' });
  { const pp = pwProblem(pw, u.email); if (pp) return res.status(400).json({ error: pp }); }
  u.pass = hash(pw);
  for (const k in DB.sessions) if (DB.sessions[k].id === u.id && k !== tokOf(req)) delete DB.sessions[k];   // derruba os outros aparelhos
  save(); res.json(pub(u));
});

// ---------- Login com Google (Google Identity Services): o navegador manda um token e o servidor confere ----------
app.post('/api/google', limit(20, 15 * 60e3), async (req, res) => {
  if (!google) return res.status(503).json({ error: 'Login com Google ainda não está configurado.' });
  let p;
  try { p = (await google.verifyIdToken({ idToken: String(req.body.credential || ''), audience: GOOGLE_ID })).getPayload(); }
  catch { return res.status(401).json({ error: 'Não foi possível entrar com o Google. Tente de novo.' }); }
  if (!p || !p.email || p.email_verified !== true) return res.status(401).json({ error: 'O e-mail da sua conta Google não está verificado.' });
  const email = String(p.email).toLowerCase();
  let u = Object.values(DB.users).find(x => x.googleId === p.sub) || findUser(email);
  if (!u) {
    const name = String(p.name || email.split('@')[0]).trim().slice(0, 30) || 'Aluno';
    if (!settingsMain().signupsOpen) return res.status(403).json({ error: 'Os cadastros estão temporariamente fechados. Volte em breve!' });
    if (req.body.accept !== true) return res.json({ needsTerms: true, name, email });   // conta nova: precisa aceitar os Termos
    const id = crypto.randomUUID(), now = new Date().toISOString();
    u = DB.users[id] = { id, name, email, pass: null, googleId: p.sub, xp: 0, gems: 0, streak: 0, done: {}, attempts: {}, created: now, acceptedTerms: now, verified: true, ...profileOf(req.body) };
  } else if (!u.googleId) { u.googleId = p.sub; if (u.verified === false) u.pass = null; }   // conta não confirmada: descarta a senha (evita sequestro por quem cadastrou o e-mail de outra pessoa)               // já tinha conta com esse e-mail: vincula
  if (u.banned) return res.status(403).json({ error: BAN_MSG(), banned: true });
  u.verified = true; save(); res.json({ token: newSession(u.id, req, res) });
});

// confirmação de e-mail
app.get('/verificar', limit(60, 15 * 60e3), (req, res) => {
  const t = DB.verifies[sha(String(req.query.token || ''))];
  if (!t || t.exp < Date.now() || !DB.users[t.id]) return res.redirect('/?verificado=0');
  DB.users[t.id].verified = true; delete DB.verifies[sha(String(req.query.token))]; save(); res.redirect('/?verificado=1');
});
app.post('/api/resend-verification', auth, limit(10, 3600e3), async (req, res) => {
  const u = req.u; if (u.verified !== false) return res.json({ ok: true, already: true });
  if (tooMany('verify:' + u.id, 3, 3600e3)) return res.status(429).json({ error: 'Você já pediu o e-mail várias vezes. Aguarde um pouco e olhe também o spam.' });
  const link = await sendVerify(u); res.json(DEV_LINK ? { ok: true, devVerifyLink: link } : { ok: true });
});

app.get('/api/me', auth, (req, res) => res.json(pub(req.u)));
// o aluno acordou o personagem: a tela "dormindo" não volta até ele ficar outro tempo sem entrar
app.post('/api/away/ack', auth, (req, res) => { if (req.u.away) { delete req.u.away; save(); } res.json({ ok: true }); });
// modo teste: finge que a pessoa ficou 5 dias sem entrar (para ver a tela do personagem dormindo sem esperar)
if (TESTE) app.post('/api/teste/ausente', auth, (req, res) => { req.u.away = { from: new Date(Date.now() - 5 * 864e5).toISOString() }; save(); res.json(pub(req.u)); });

app.post('/api/profile', auth, (req, res) => {
  const name = String(req.body.name || '').trim().slice(0, 30);
  if (!name) return res.status(400).json({ error: 'Informe um nome.' });
  req.u.name = name; RANK.at = 0; save(); res.json(pub(req.u));
});

// personagem que acompanha a pessoa no curso: Tay (rosa, feminino) ou Cut (azul, masculino)
const GUIDES = ['tay', 'cut'], SEXES = ['f', 'm'];
// no cadastro a pessoa diz se é feminino (f) ou masculino (m) e qual personagem vai guiá-la; valores fora da lista são ignorados
// nome que a pessoa dá ao personagem: 2 a 14 caracteres (letras, números, espaço, ponto, apóstrofo e hífen); é mostrado só para ela
const gnameOf = v => { const t = String(v ?? '').normalize('NFC').replace(/\s+/g, ' ').trim(); return /^[\p{L}\p{N}][\p{L}\p{N} .'’-]{1,13}$/u.test(t) ? t : ''; };
const GNAME_MSG = 'O nome do personagem precisa ter de 2 a 14 caracteres: letras, números, espaço, ponto, apóstrofo ou hífen.';
const profileOf = b => ({ ...(SEXES.includes(b && b.sex) ? { sex: b.sex } : {}), ...(GUIDES.includes(b && b.guide) ? { guide: b.guide } : {}), ...(gnameOf(b && b.gname) ? { gname: gnameOf(b.gname) } : {}) });
app.post('/api/guide', auth, (req, res) => {
  const b = req.body || {}, has = k => b[k] !== undefined && b[k] !== null;
  if (!['guide', 'sex', 'gname', 'frame', 'color', 'sticker', 'bg', 'outfit'].some(has)) return res.status(400).json({ error: 'Escolha a Tay ou o Cut.' });
  if (has('guide') && !GUIDES.includes(String(b.guide))) return res.status(400).json({ error: 'Escolha a Tay ou o Cut.' });
  if (has('sex') && !SEXES.includes(String(b.sex))) return res.status(400).json({ error: 'Escolha feminino ou masculino.' });
  if (has('gname') && !gnameOf(b.gname)) return res.status(400).json({ error: GNAME_MSG });
  // moldura: só uma que a pessoa já conquistou pelo XP ('auto' volta a usar a mais alta)
  const fk = has('frame') && b.frame !== 'auto' ? R.TIERS.findIndex(t => t.key === String(b.frame)) : 0;
  if (has('frame') && b.frame !== 'auto' && (fk < 1 || fk > R.tierOf(req.u.xp))) return res.status(400).json({ error: 'Essa moldura ainda não foi conquistada.' });
  // personalizar o personagem (cor da roupa, adesivo, fundo): só itens que o título atual já libera; 'auto' volta ao padrão
  const CZ = [['color', 'Essa cor ainda não foi conquistada.'], ['sticker', 'Esse adesivo ainda não foi conquistado.'], ['bg', 'Esse fundo ainda não foi conquistado.'], ['outfit', 'Esse estilo de roupa ainda não foi conquistado.']];
  for (const [k, msg] of CZ) {
    if (!has(k) || b[k] === 'auto') continue;
    const it = R.item(R.LISTS[k], String(b[k])); if (!it) return res.status(400).json({ error: 'Opção inválida.' });
    if (it.tier > R.tierOf(req.u.xp)) return res.status(400).json({ error: msg });
  }
  if (has('guide')) req.u.guide = String(b.guide);
  if (has('sex')) req.u.sex = String(b.sex);
  if (has('gname')) req.u.gname = gnameOf(b.gname);
  if (has('frame')) { if (b.frame === 'auto') delete req.u.frame; else req.u.frame = R.TIERS[fk].key; }
  for (const [k] of CZ) if (has(k)) { if (b[k] === 'auto') delete req.u[k]; else req.u[k] = String(b[k]); }
  RANK.at = 0; save(); res.json(pub(req.u));
});

// ---------- guarda-roupa ----------
// Comprar: só fantasia à venda (tem preço), do personagem da pessoa, com o título já conquistado e diamantes suficientes. O servidor confere tudo: o navegador só pede.
// Vestir: só uma que a pessoa tem ('nenhuma' volta ao visual normal, que aceita cor, estilo e expressões).
const CMSG = { tier: c => `Libera com o título ${R.TIERS[c.tier].title} (${R.TIERS[c.tier].xp.toLocaleString('pt-BR')} XP).`, days: c => `Libera com o título ${R.TIERS[c.tier].title} e ${c.days} dias de estudo.` };
app.post('/api/costume/buy', auth, limit(30 * RELAX, 60e3), (req, res) => {
  const u = req.u, c = R.costume(String((req.body || {}).key || ''));
  if (!c || c.guide !== u.guide) return res.status(400).json({ error: 'Essa fantasia não existe para o seu personagem.' });
  const st = R.costumeState(c, cosState(u));
  if (st === 'own') return res.status(400).json({ error: 'Você já tem essa fantasia.' });
  if (!c.price) return res.status(400).json({ error: CMSG[st] ? CMSG[st](c) : 'Essa fantasia não está à venda.' });
  if (st === 'tier') return res.status(403).json({ error: CMSG.tier(c) });
  if ((u.gems || 0) < c.price) return res.status(400).json({ error: `Faltam ${c.price - (u.gems || 0)} diamantes para comprar a fantasia ${c.name}.` });
  u.gems -= c.price; (u.own ??= {})[c.key] = new Date().toISOString(); u.cost = c.key;     // comprou: já sai vestindo
  RANK.at = 0; save(); res.json(pub(u));
});
app.post('/api/costume/wear', auth, limit(60 * RELAX, 60e3), (req, res) => {
  const u = req.u, k = String((req.body || {}).key || '');
  if (k === 'nenhuma') { delete u.cost; RANK.at = 0; save(); return res.json(pub(u)); }
  const c = R.costume(k);
  if (!c || c.guide !== u.guide || R.costumeState(c, cosState(u)) !== 'own') return res.status(400).json({ error: 'Você ainda não tem essa fantasia.' });
  u.cost = c.key; RANK.at = 0; save(); res.json(pub(u));
});

// ---------- ranking de alunos ----------
// Mostra só o primeiro nome + a inicial do sobrenome, o personagem, o título e o XP (nunca e-mail). Quem não quer aparecer sai em Perfil.
// Só entram contas ativas, com e-mail confirmado (quando a confirmação está ligada) e com XP no período.
const shortName = n => { const p = String(n || '').trim().split(/\s+/).filter(Boolean); if (!p.length) return 'Aluno'; const f = p[0].slice(0, 16), l = p.length > 1 ? p[p.length - 1] : ''; return f.charAt(0).toUpperCase() + f.slice(1) + (l ? ' ' + l.charAt(0).toUpperCase() + '.' : ''); };
function rankRows(period) {
  const now = Date.now(), w = weekId(now);
  if (now - RANK.at >= RANK_TTL || RANK.w !== w) { RANK.m.clear(); RANK.at = now; RANK.w = w; }
  let c = RANK.m.get(period); if (c) return c;
  const score = u => period === 'semana' ? (u.wk && u.wk.w === w ? u.wk.xp : 0) : (u.xp || 0), at = u => u.xpAt || Date.parse(u.created) || 0;
  const rows = Object.values(DB.users).filter(u => !u.banned && u.verified !== false && !u.rankOff && score(u) > 0)
    .sort((a, b) => score(b) - score(a) || at(a) - at(b) || (a.id < b.id ? -1 : 1))
    .map((u, i) => ({ id: u.id, pos: i + 1, name: shortName(u.name), guide: GUIDES.includes(u.guide) ? u.guide : 'cut', xp: score(u), tier: R.tierOf(u.xp), frame: R.frameOf(u.xp, u.frame), color: R.pick('color', u.xp, u.color, u.guide), sticker: R.pick('sticker', u.xp, u.sticker), bg: R.pick('bg', u.xp, u.bg), cos: cosWorn(u) }));
  c = { rows, by: new Map(rows.map(r => [r.id, r])) }; RANK.m.set(period, c); return c;
}
app.get('/api/ranking', auth, limit(60 * RELAX, 60e3), (req, res) => {
  const period = req.query.p === 'geral' ? 'geral' : 'semana', u = req.u, { rows, by } = rankRows(period), mine = by.get(u.id) || null;
  const out = r => ({ pos: r.pos, name: r.name, guide: r.guide, xp: r.xp, tier: r.tier, frame: r.frame, color: r.color, sticker: r.sticker, bg: r.bg, cos: r.cos, me: r.id === u.id });
  res.json({
    period, total: rows.length, top: rows.slice(0, 20).map(out),
    me: { pos: mine ? mine.pos : null, hidden: !!u.rankOff, xp: period === 'semana' ? (u.wk && u.wk.w === weekId() ? u.wk.xp : 0) : (u.xp || 0), row: mine && mine.pos > 20 ? out(mine) : null },
    resets: period === 'semana' ? new Date(weekStart() + 7 * 864e5).toISOString() : null
  });
});
app.post('/api/ranking/visibility', auth, (req, res) => {
  if (typeof (req.body || {}).show !== 'boolean') return res.status(400).json({ error: 'Escolha aparecer ou ocultar.' });
  if (req.body.show) delete req.u.rankOff; else req.u.rankOff = true;
  RANK.at = 0; save(); res.json(pub(req.u));
});

// LGPD: portabilidade e exclusão
app.get('/api/export', auth, (req, res) => {
  const { pass, id, googleId, ...data } = req.u;
  res.set('Content-Disposition', 'attachment; filename="meus-dados-codeup.json"').json(data);
});

app.delete('/api/account', auth, async (req, res) => {
  if (req.u.pass ? !checkPw(String(req.body.password || ''), req.u.pass) : req.body.confirm !== 'EXCLUIR')
    return res.status(403).json({ error: req.u.pass ? 'Senha incorreta.' : 'Digite EXCLUIR para confirmar.' });
  dropSessions(req.u.id); delete DB.users[req.u.id]; RANK.at = 0; dropCookie(req, res); save(); res.json({ ok: true });
});

// ============================================================================
// Cursos: escolha do curso, lições e provas
// ============================================================================
app.post('/api/track', auth, (req, res) => {
  const t = String(req.body.track || '');
  if (!TRACKS.includes(t)) return res.status(400).json({ error: 'Escolha um dos cursos.' });
  if (!courseOn(t)) return res.status(409).json({ error: LOCK_MSG.off, lock: 'off' });
  req.u.track = t; save(); res.json(pub(req.u));
});

app.get('/api/lessons', auth, (req, res) =>
  res.json(lessons.map(l => ({ id: l.id, title: l.title, type: l.type, track: l.track, lv: l.lv, n: l.n, xp: l.xp, rd: hasRead(l) ? 1 : 0, ord: ordOf(req.u, l).join('') || undefined, dn: actsOf(l).filter(a => actDone(req.u, l, a)).join('') || undefined, lock: lockOf(req.u, l) }))));

// provas: os 2 checkpoints de cada nível (depois das lições 10 e 20) e a prova final (depois da 30), com as chances que ainda restam
app.get('/api/checkpoints', auth, (req, res) =>
  res.json(tests.map(c => ({ id: c.id, title: c.title, type: c.type, track: c.track, lv: c.lv, k: c.k, after: c.after, xp: c.xp, fin: !!c.fin, chances: c.chances, left: chancesLeft(req.u, c), back: c.back, backFrom: c.backFrom, lock: lockOf(req.u, c) }))));

// projetos: um depois de cada 5 lições (5, 10, 15, 20, 25 e 30). A conclusão fica em `cps` do perfil (junto com os checkpoints)
app.get('/api/projects', auth, (req, res) =>
  res.json(projects.map(p => ({ id: p.id, title: p.title, type: p.type, track: p.track, lv: p.lv, k: p.k, after: p.after, xp: p.xp, proj: true, lock: lockOf(req.u, p) }))));

app.get('/api/lessons/:id', auth, (req, res) => {
  const l = actOf(req.params.id);
  if (!l) return res.sendStatus(404);
  const lock = lockOf(req.u, l);
  if (lock) return res.status(409).json({ error: lockMsg(lock, l), lock });
  const qz = l.type === 'quiz' ? { qz: quizcheck.pub(l, req.u.id) } : {};              // quiz: as perguntas sem gabarito (opções embaralhadas do mesmo jeito para a mesma pessoa)
  if (isTest(l)) return res.json({ ...stripExam(l), ...qz, left: chancesLeft(req.u, l) });    // prova: sem solução, sem dica e sem teoria
  res.json({ ...strip(l), ...qz });
});

// Correção feita NO SERVIDOR. SQL é reexecutado aqui, num worker isolado com limite de tempo/memória.
// Devolve true/false (certo/errado) ou null quando o PRÓPRIO SERVIDOR não consegue rodar o SQL (ex.: pacote sql.js não instalado):
// nesse caso a resposta não pode ser tratada como "errada", senão o aluno acerta e é reprovado sem saber por quê.
let SQL_ENGINE_ERR = '';
function sqlCheck(l, code, show) {
  return new Promise(resolve => {
    const w = new Worker(path.join(__dirname, 'sqlcheck.js'), { resourceLimits: { maxOldGenerationSizeMb: 128 } });
    let done = false, t;
    const end = v => { if (done) return; done = true; clearTimeout(t); w.terminate(); resolve(v); };
    t = setTimeout(() => { SQL_ENGINE_ERR = 'o sql.js demorou demais para iniciar'; end(null); }, 15000);        // só a inicialização (não conta no tempo da consulta)
    w.on('message', m => {
      if (m.ready) { clearTimeout(t); t = setTimeout(() => end(false), 3000); w.postMessage({ seed: l.seed, code, expected: l.expectedSql, show }); }   // 3 s só para rodar a consulta
      else if (m.engineError) { SQL_ENGINE_ERR = m.engineError; end(null); }
      else if ('view' in m) { SQL_ENGINE_ERR = ''; end(m.view); }
      else if ('result' in m) { SQL_ENGINE_ERR = ''; end(m.result === true); }
    });
    w.on('error', e => { SQL_ENGINE_ERR = String(e && e.message || e); end(null); });
    w.on('exit', () => end(null));
  });
}
// Resultado esperado (colunas e linhas) de uma prova de SQL. O gabarito não vai para o navegador: só depois de uma resposta errada o aluno recebe
// o resultado esperado (nunca o código da solução), para entender o que ajustar. Fica em cache porque é sempre o mesmo.
const SQL_VIEW = new Map();
async function sqlView(l) {
  if (!SQL_VIEW.has(l.id)) SQL_VIEW.set(l.id, (await sqlCheck(l, l.solution, true)) || null);
  return SQL_VIEW.get(l.id);
}
const BAD_SQL = /\b(recursive|randomblob|zeroblob|attach|pragma|load_extension)\b/i;

// confere uma resposta (lição ou questão de prova): { ok, missing }
const pysandbox = require('./pysandbox'), PY_SERVER = pysandbox.available();
console.log(PY_SERVER ? 'Correção de Python no servidor: ATIVA (código do aluno roda em ambiente restrito)' : '⚠ Correção de Python no servidor: DESATIVADA (sem python3). O resultado do Python virá do navegador do aluno e pode ser forjado.');
// authoritative = true (envio final e provas): no Python, o servidor roda o código; o "out" enviado pelo navegador é ignorado
async function grade(l, code, out, authoritative) {
  if (l.type === 'dax') return daxcheck.grade(l, code);                   // DAX: calcula as medidas do aluno e as da resposta oficial em cada visual (e com outros números) e compara
  if (l.type === 'quiz') { let a; try { a = JSON.parse(code); } catch { a = []; } return quizcheck.grade(l, a, isTest(l)); }   // quiz: as respostas vão em JSON
  if (l.type === 'excel') return xlcheck.grade(l, code);                  // Excel: compara o resultado das fórmulas (com os números da planilha e com outros)
  const flat = code.toLowerCase().replace(/\s+/g, ' ');
  const missing = (l.need || []).find(t => !flat.includes(t));
  if (missing) return { ok: false, missing };
  if (l.type === 'python') {
    if (authoritative && PY_SERVER) { const r = await pysandbox.run(l.prelude || '', code); if (r.err === 'BUSY') return { ok: false, busy: true }; return { ok: r.ok && r.out.trim() === l.expectedOut }; }
    return { ok: String(out || '').trim() === l.expectedOut };
  }
  if (BAD_SQL.test(code)) return { ok: false };
  const r = await sqlCheck(l, code);
  if (r !== null) return { ok: r };
  // O servidor não conseguiu rodar o sql.js: faz como no Python sem Linux e confere o resultado que o navegador enviou
  // contra as linhas esperadas (content/expected-sql.json). Sem esse resultado, avisa que o corretor está indisponível.
  const fb = sqlRowsFallback(l, out);
  if (fb === undefined) return { ok: false, engine: true };
  if (!SQL_FALLBACK_WARNED) { SQL_FALLBACK_WARNED = true; console.error('⚠ Correção de SQL usando o resultado enviado pelo navegador (o sql.js não rodou no servidor: ' + (SQL_ENGINE_ERR || 'motivo desconhecido') + '). Isso é menos seguro; rode "npm install".'); }
  return { ok: fb };
}
let SQL_FALLBACK_WARNED = false;
function sqlRowsFallback(l, out) {
  const e = l.expectedRows; if (!e || typeof out !== 'string' || !out) return undefined;
  let rows; try { rows = JSON.parse(out); } catch { return undefined; }
  if (!Array.isArray(rows) || !rows.every(Array.isArray)) return undefined;
  const k = rows.map(r => JSON.stringify(r)), a = e.ordered ? k : [...k].sort(), b = e.ordered ? e.rows : [...e.rows].sort();
  return JSON.stringify(a) === JSON.stringify(b);
}
const cleanCode = (c, l) => String(c || '').slice(0, l && (l.type === 'excel' || l.type === 'quiz') ? 20000 : 5000);   // Excel: as fórmulas de várias células vão juntas, em JSON
const ENGINE_MSG = 'O corretor de SQL do servidor não está funcionando agora (no seu computador, rode "npm install" na pasta do projeto e reinicie com "npm start"). Sua resposta não foi marcada como errada.';

// Conferência ao vivo enquanto o aluno digita: corrige igual ao /api/submit, mas NÃO grava nada (sem XP, sem tentativa).
app.post('/api/check', auth, limit(900 * RELAX, 60e3), async (req, res) => {
  const l = actOf(req.body.id);
  if (!l) return res.sendStatus(404);
  const lock = lockOf(req.u, l);
  if (lock) return res.status(409).json({ error: lockMsg(lock, l), lock });
  if (isTest(l)) return res.status(403).json({ error: 'Nas provas a conferência só acontece quando você entrega a resposta.' });   // sem conferência livre: cada entrega gasta uma chance
  const { ok, missing, engine, xl, dx, quiz } = await grade(l, cleanCode(req.body.code, l), req.body.out);
  if (engine) return res.status(503).json({ error: ENGINE_MSG, engine: true });
  res.json({ ok, missing: ok ? undefined : missing, xl: ok ? undefined : xl, dx: ok ? undefined : dx, quiz, expected: !ok && l.type === 'python' ? l.expectedOut : undefined });
});

app.post('/api/submit', auth, limit(120 * RELAX, 60e3), async (req, res) => {
  const l = actOf(req.body.id);
  if (!l) return res.sendStatus(404);
  const u = req.u, k = l.id, lock = lockOf(u, l), test = isTest(l), lk = key(l.track, l.lv);
  if (lock) return res.status(409).json({ error: lockMsg(lock, l), lock });
  const before = !test && hasRead(l) ? actBefore(u, l, 'x') : null;                    // lição com várias atividades: a de executar só abre depois das que vêm antes dela na ordem sorteada
  if (before) return res.status(409).json({ error: ordMsg(before), lock: 'ord', need: before });
  const already = test && (l.fin ? !!u.passed[lk] : !!u.cpdone[k]);                    // prova já vencida: pode refazer só para treinar, sem perder chance nem voltar lições
  u.attempts[k] = (u.attempts[k] || 0) + 1;
  const code = cleanCode(req.body.code, l), { ok, missing, busy, engine, xl, dx, quiz } = await grade(l, code, req.body.out, true);
  if (engine) { u.attempts[k]--; return res.status(503).json({ error: ENGINE_MSG, engine: true }); }
  if (busy) { u.attempts[k]--; return res.status(503).json({ error: 'O servidor está ocupado corrigindo outros alunos. Tente de novo em instantes.' }); }

  let gained = 0, streakUp = 0, rewind = null, gemBonus = 0; const gems0 = u.gems || 0, own0 = new Set(cosOwned(u));     // streakUp: a sequência de dias valeu hoje pela 1ª vez (a tela de comemoração da sequência usa isso)
  const two = !test && hasRead(l);                                                       // lição com várias atividades: aqui é a de executar; a lição só conclui quando todas estiverem feitas
  if (ok) {
    ({ streakUp, gemBonus } = tickStreak(u));
    if (l.fin) {                                                                       // prova final aprovada: libera o próximo nível e dá o bônus (uma vez só)
      u.passed[lk] ||= new Date().toISOString();
      if (!u.xpd['exam-' + lk]) { u.xpd['exam-' + lk] = 1; gained = 50 * l.lv; gainXp(u, gained); u.gems = (u.gems || 0) + 20; }
    } else {
      const date = new Date().toISOString();
      if (two) {
        (u.ex ??= {})[k] = { code, date }; if (u.done[k]) u.done[k] = { code, date };                // lição já concluída (treino): só atualiza o código
        gained = award(u, l, 'x'); finishLesson(u, l, code);                           // a parte do XP desta atividade, só na 1ª vez; e conclui a lição se era a última
      } else {
        (l.cp || l.proj ? u.cpdone : u.done)[k] = { code, date };
        if (!u.xpd[k]) { u.xpd[k] = 1; gained = l.xp; gainXp(u, gained); u.gems = (u.gems || 0) + (l.proj ? 10 : 5); }   // pontos só na 1ª vez, mesmo se o nível for refeito (projeto vale 10 diamantes)
      }
    }
    if (test) delete u.cptry[k];
  } else if (test && !already) {
    if (l.fin) { u.tries = u.tries || {}; u.tries[lk] = (u.tries[lk] || 0) + 1; }
    u.cptry[k] = (u.cptry[k] || 0) + 1;
    if (u.cptry[k] >= l.chances) {                                                     // acabaram as chances: volta `back` lições para relembrar (o XP já ganho fica)
      levelLessons(l.track, l.lv).filter(x => x.n >= l.backFrom && x.n <= l.after).forEach(x => clearActs(u, x.id));
      delete u.cptry[k]; u.fails[l.fin ? lk : k] = (u.fails[l.fin ? lk : k] || 0) + 1;
      rewind = { from: l.backFrom, to: l.after, back: l.back };
    }
  }
  save();
  const lvDone = ok && !test && !!u.done[k] && levelDone(u, l.track, l.lv);
  res.json({
    ok, gained, tries: u.attempts[k], streakUp: streakUp || undefined, missing: ok ? undefined : missing, xl: ok ? undefined : xl, dx: ok ? undefined : dx, quiz, expected: !ok && l.type === 'python' ? l.expectedOut : undefined,
    view: !ok && test && l.type === 'sql' && !rewind ? await sqlView(l) || undefined : undefined,
    levelComplete: lvDone || undefined, next: ok && two ? nextAct(u, l) || undefined : undefined, test: test ? (l.fin ? 'fin' : 'cp') : undefined, left: test ? chancesLeft(u, l) : undefined, chances: test ? l.chances : undefined, rewind: rewind || undefined,
    trackComplete: ok && l.fin && trackDone(u, l.track) || undefined, gemsGot: (u.gems || 0) - gems0 || undefined, gemBonus: gemBonus || undefined, newCos: cosOwned(u).filter(k => !own0.has(k)), ...pub(u)
  });
});

// ---------- atividade de LER o código ----------
// O aluno vê um código pronto e responde o que ele faz (escolher ou digitar). Só abre quando as atividades que vêm antes dela, na ordem sorteada da lição, estão feitas.
// A resposta certa nunca vai para o navegador; as erradas não gastam nada (é treino de leitura), então dá para tentar de novo.
function actLesson(req, res, a) {                                                       // confere lição, bloqueios e ordem; devolve a lição ou responde o erro
  const l = actOf(req.params.id || req.body.id);
  if (!l || !(a === 'e' ? hasExpl(l) : hasRead(l))) { res.sendStatus(404); return null; }
  const lock = lockOf(req.u, l);
  if (lock) { res.status(409).json({ error: lockMsg(lock, l), lock }); return null; }
  const before = actBefore(req.u, l, a);
  if (before) { res.status(409).json({ error: ordMsg(before), lock: 'ord', need: before }); return null; }
  return l;
}
// o que sobra depois de uma atividade (r/e): se a lição concluiu, a próxima atividade que falta, XP, diamantes e fim de nível
function actDoneRes(req, l, a, extra) {
  const u = req.u, k = l.id, gems0 = u.gems || 0, own0 = new Set(cosOwned(u)), first = !actDone(u, l, a);
  const { streakUp, gemBonus } = tickStreak(u); let gained = 0;
  if (first) { (u[ACT_FLAG[a]] ??= {})[k] = { date: new Date().toISOString(), ...(extra || {}) }; gained = award(u, l, a); finishLesson(u, l); }
  save();
  return {
    ok: true, gained, streakUp: streakUp || undefined, next: nextAct(u, l) || undefined, levelComplete: !!u.done[k] && levelDone(u, l.track, l.lv) || undefined,
    gemsGot: (u.gems || 0) - gems0 || undefined, gemBonus: gemBonus || undefined, newCos: cosOwned(u).filter(x => !own0.has(x)), ...pub(u)
  };
}
app.get('/api/lessons/:id/read', auth, (req, res) => { const l = actLesson(req, res, 'r'); if (l) res.json(readPub(req.u, l)); });
app.post('/api/read', auth, limit(240 * RELAX, 60e3), (req, res) => {
  const l = actLesson(req, res, 'r'); if (!l) return;
  const u = req.u, k = l.id, r = l.read, a = String(req.body.a ?? '').slice(0, 2000);
  const okAns = r.k === 'mc' ? a === r.ok : r.k === 'num' ? quizcheck.gradeItem({ t: 'num', ok: r.ok, tol: r.tol }, a) === true : (Array.isArray(r.ok) ? r.ok : [r.ok]).some(x => norm(x) === norm(a));
  u.rtries ??= {}; u.rtries[k] = (u.rtries[k] || 0) + 1;
  if (!okAns) { save(); return res.json({ ok: false, tries: u.rtries[k], hint: r.hint || undefined }); }
  res.json({ ...actDoneRes(req, l, 'r'), tries: u.rtries[k], why: r.why });
});

// ---------- atividade de EXPLICAR o código (só Python/SQL, Intermediário e Avançado) ----------
// O aluno escreve com as próprias palavras o que o código faz (ou o que ele traz). O servidor confere os conceitos (explain.js). Errar não gasta nada: mostra o que faltou e,
// depois de 3 tentativas, uma explicação de exemplo. Acertou = mostra uma boa explicação e conta a atividade.
function explainPub(u, l) {
  const e = l.expl, code = e.code || '', names = l.type === 'sql' ? (lessons.seedTables[e.seedKey] || []).filter(t => new RegExp('\\b' + t.name + '\\b', 'i').test(code)) : [];
  return { ...readMeta(l), kind: e.kind, q: e.q || (e.kind === 'traz' ? (l.type === 'sql' ? 'Explique com suas palavras o que esta consulta traz como resultado.' : 'Explique com suas palavras o que aparece na tela quando este código roda.') : 'Explique com suas palavras o que este código faz.'), code, tables: names.length ? names : undefined, minw: EXPLAIN.MINW, done: !!u.done[l.id] };
}
app.get('/api/lessons/:id/explain', auth, (req, res) => { const l = actLesson(req, res, 'e'); if (l) res.json(explainPub(req.u, l)); });
app.post('/api/explain', auth, limit(240 * RELAX, 60e3), (req, res) => {
  const l = actLesson(req, res, 'e'); if (!l) return;
  const u = req.u, k = l.id, e = l.expl, txt = String(req.body.a ?? '').slice(0, EXPLAIN.MAXC).trim();
  const g = EXPLAIN.grade(e, txt);
  u.etries ??= {};
  if (!g.ok) {
    if (!g.short && !g.copy) u.etries[k] = (u.etries[k] || 0) + 1;                       // texto curto demais ou código copiado não contam como tentativa
    save();
    return res.json({ ok: false, tries: u.etries[k] || 0, short: g.short || undefined, copy: g.copy || undefined, got: g.got, total: g.total, miss: g.miss, model: (u.etries[k] || 0) >= 3 ? e.model : undefined });
  }
  u.etries[k] = (u.etries[k] || 0) + 1;
  res.json({ ...actDoneRes(req, l, 'e', { txt }), tries: u.etries[k], model: e.model });
});

// ============================================================================
// Painel do dono (admin): tela em /admin e API em /api/admin/* (veja admin.js)
// ============================================================================
let SQL_SELF = null;                                      // resultado do autoteste do corretor de SQL (true/false)
const admin = require('./admin')(app, {
  DB, save, limit, tooMany, sha, same, lessons, checkpoints, projects, TRACKS, TRACK_NAMES, actOf, finals, PROD, BASE, dropSessions, makeResetLink, sendVerify, settingsMain, unlockAllOn, courseOn, coursesCfg, store, ensure, adminHost: ADMIN_HOST, adsNow, adsClientOf, adsSlotOf,
  info: () => { const a = adsNow(); return { mail: mailReady, verifyOn: VERIFY_ON, google: !!GOOGLE_ID, ads: a.on ? 'on' : ADS_PREVIEW ? 'preview' : 'off', adsFrom: a.from, adsClient: a.client, adsSlot: !!a.slot, pyServer: PY_SERVER, sqlServer: SQL_SELF, company: COMPANY, contact: CONTACT }; }
});

app.use('/api', (req, res) => res.status(404).json({ error: 'Não encontrado.' }));
app.use((err, req, res, next) => {
  if (err && (err.type === 'entity.parse.failed' || err.type === 'entity.too.large')) return res.status(err.type === 'entity.too.large' ? 413 : 400).json({ error: 'Requisição inválida.' });
  console.error(err.message); res.status(500).json({ error: 'Erro interno.' });
});

// Autoteste: se o corretor de SQL não funciona (ex.: "npm install" não foi rodado), avisa já na inicialização em vez de reprovar alunos em silêncio.
async function sqlSelfTest() {
  const l = { seed: 'CREATE TABLE t(a INT); INSERT INTO t VALUES (1),(2);', expectedSql: 'SELECT * FROM t ORDER BY a' };
  const ok = await sqlCheck(l, 'SELECT * FROM t ORDER BY a');
  SQL_SELF = ok === true;
  if (ok === true) console.log('Correção de SQL no servidor: ATIVA');
  else console.error('⚠⚠ Correção de SQL no servidor: FALHOU (' + (SQL_ENGINE_ERR || 'resultado inesperado') + '). As lições de SQL serão conferidas só pelo resultado enviado pelo navegador (menos seguro). Rode "npm install" na pasta onde está o package.json e reinicie.');
}
initDb().then(() => app.listen(PORT, () => { console.log(`CodeUp rodando em ${BASE}${adsNow().on ? ' (anúncios ligados)' : ADS_PREVIEW ? ' (anúncios em PRÉVIA)' : ' (sem anúncios: ligue em Ajustes → Anúncios no painel, ou defina ADSENSE_CLIENT)'}`); sqlSelfTest(); admin.banner(); })).catch(e => { console.error('Não foi possível iniciar o banco de dados:', e.message); process.exit(1); });
