// ============================================================================
// Painel do dono (admin): API segura em /api/admin/* e a tela em /admin.
//
// Como funciona o acesso:
//  - Você entra em /admin com a ADMIN_KEY (variável de ambiente). O servidor devolve um token de sessão
//    que vale 12 horas e só fica na aba do navegador (sessionStorage). A chave em si nunca é guardada.
//  - Autenticador (opcional): em Sistema você liga o código de 6 dígitos do Google/Microsoft Authenticator, Authy etc.
//    Dá para entrar com "chave + código" (mais seguro) ou "só o código". Cada código só vale uma vez, 5 erros bloqueiam por 15 min,
//    e a variável ADMIN_2FA_OFF=1 desliga a exigência (se você perder o celular).
//  - Sem credenciais, qualquer rota /api/admin/* responde 404 (ninguém descobre que o painel existe).
//  - Cada ação importante (liberar curso, suspender, excluir...) fica registrada na Auditoria.
//  - No seu computador (fora de produção), se ADMIN_KEY não estiver definida, uma chave é gerada
//    sozinha e mostrada no terminal quando o servidor inicia.
// ============================================================================
'use strict';
const crypto = require('crypto'), path = require('path'), totp = require('./totp'), qr = require('./qr');

module.exports = function mountAdmin(app, X) {
  const { DB, save, limit, tooMany, sha, same, lessons, checkpoints, TRACKS, TRACK_NAMES, actOf, finals, PROD, BASE, dropSessions,
    makeResetLink, sendVerify, settingsMain, unlockAllOn, courseOn, coursesCfg, store, ensure, adminHost, info, adsNow, adsClientOf, adsSlotOf } = X;
  const lvs = t => Array.from({ length: (lessons.LEVELS_OF || {})[t] || 3 }, (_, i) => i + 1);   // níveis que o curso tem hoje (o Excel começa só com o Básico)
  const DAY = 864e5, TZ = -3 * 36e5;                                   // Brasil (sem horário de verão)
  const dk = ms => new Date(ms + TZ).toISOString().slice(0, 10);       // "2026-10-20" no horário de Brasília
  const msOf = iso => { const t = Date.parse(iso || ''); return Number.isFinite(t) ? t : 0; };
  const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

  // ---------- chave do admin ----------
  function adminKey() {
    if (process.env.ADMIN_PASSWORD || process.env.ADMIN_KEY) return process.env.ADMIN_PASSWORD || process.env.ADMIN_KEY;   // ADMIN_PASSWORD é a senha da tela de e-mail e senha; se existir, uma ADMIN_KEY antiga deixa de valer (em qualquer entrada)
    if (PROD) return '';
    DB.meta ??= {}; DB.meta.admin ??= {};
    if (!DB.meta.admin.devKey) { DB.meta.admin.devKey = crypto.randomBytes(12).toString('base64url'); save(); }   // só para uso local
    return DB.meta.admin.devKey;
  }
  const keyOk = k => { const K = adminKey(); return !!K && same(sha(String(k || '')), sha(K)); };
  // e-mail fixo do administrador (opcional): com ADMIN_EMAIL definido a tela pede e-mail + senha (a senha é a ADMIN_KEY/ADMIN_PASSWORD)
  const adminEmail = () => String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const emailOk = e => { const E = adminEmail(); return !E || same(sha(String(e || '').trim().toLowerCase()), sha(E)); };
  const credOk = b => { const a = emailOk(b.email), c = keyOk(b.key); return a && c; };     // sempre testa os dois (sem revelar qual errou)
  const WHAT = () => adminEmail() ? 'E-mail ou senha' : 'Chave';

  // ---------- autenticador (código de 6 dígitos) ----------
  // guardado em DB.meta.admin.totp = { secret, needKey, on, last (último passo aceito: um código não vale duas vezes), at }
  const tf = () => { const t = DB.meta && DB.meta.admin && DB.meta.admin.totp; return t && t.on && !process.env.ADMIN_2FA_OFF ? t : null; };
  const bad = { n: 0, t: 0, until: 0 };                                        // erros seguidos de código: 5 erros travam por 15 minutos
  const lockLeft = () => Math.max(0, bad.until - Date.now());
  const badCode = () => { const now = Date.now(); if (now - bad.t > 15 * 60e3) bad.n = 0; bad.t = now; if (++bad.n >= 5) { bad.until = now + 15 * 60e3; bad.n = 0; } };
  const dropOtherTokens = keep => { for (const k in DB.asessions) if (k !== keep) delete DB.asessions[k]; };

  // ---------- auditoria ----------
  function audit(req, action, target, detail) {
    DB.audit ??= {};
    const at = new Date().toISOString();
    DB.audit[at + '-' + crypto.randomBytes(3).toString('hex')] = { at, ip: req.ip, action, target: String(target || '').slice(0, 120), detail: String(detail || '').slice(0, 300) };
    const ids = Object.keys(DB.audit);
    if (ids.length > 1200) ids.sort().slice(0, ids.length - 1000).forEach(k => delete DB.audit[k]);
    save();
  }

  // ---------- autenticação das rotas ----------
  DB.asessions ??= {};
  const adm = (req, res, next) => {
    const t = req.headers['x-admin-token'];
    if (t) {
      const s = has(DB.asessions, sha(String(t))) ? DB.asessions[sha(String(t))] : null;
      if (s && s.exp > Date.now()) { req.admin = 'token'; return next(); }
      return res.status(401).json({ error: 'admin-login' });
    }
    const k = req.headers['x-admin-key'];
    if (k && !tf()) {                                                           // com o autenticador ligado, só entra quem tem o código (sessão do painel)
      if (tooMany('admkey:' + req.ip, 20, 15 * 60e3)) return res.status(429).json({ error: 'Muitas tentativas.' });
      if (keyOk(k)) { req.admin = 'key'; return next(); }
    }
    return res.sendStatus(404);
  };
  const guard = [limit(600, 15 * 60e3), adm];

  // a tela de entrada precisa saber o que pedir (só a chave, chave + código ou só o código)
  app.get('/api/admin/login-info', limit(120, 15 * 60e3), (req, res) => { const T = tf(); res.set('Cache-Control', 'no-store').json({ ready: !!adminKey(), twofa: !!T, needKey: T ? T.needKey !== false : true, ...(adminEmail() ? { email: true } : {}) }); });
  app.post('/api/admin/login', limit(8, 15 * 60e3), (req, res) => {
    if (!adminKey()) return res.status(503).json({ error: 'O painel admin está desligado: defina ADMIN_KEY (ou ADMIN_EMAIL e ADMIN_PASSWORD) nas variáveis do servidor (veja o README).' });
    if (tooMany('admlogin', 40, 15 * 60e3)) return res.status(429).json({ error: 'Muitas tentativas. Aguarde alguns minutos.' });
    const T = tf(); let used = -1;
    if (!T) { if (!credOk(req.body)) { audit(req, 'login-falhou', '', adminEmail() ? 'e-mail ou senha' : ''); return res.status(401).json({ error: WHAT() + (adminEmail() ? ' incorretos.' : ' incorreta.') }); } }
    else {
      const wait = lockLeft(); if (wait > 0) { audit(req, 'login-bloqueado', '', 'código errado várias vezes'); return res.status(429).json({ error: `Muitos códigos errados. Aguarde ${Math.ceil(wait / 60e3)} min e tente de novo.` }); }
      if (T.needKey !== false && !credOk(req.body)) { audit(req, 'login-falhou', '', adminEmail() ? 'e-mail ou senha' : 'chave'); return res.status(401).json({ error: WHAT() + ' ou código incorreto.' }); }
      used = totp.check(T.secret, req.body.code);
      if (used < 0) { badCode(); audit(req, 'login-falhou', '', 'código'); return res.status(401).json({ error: T.needKey !== false ? WHAT() + ' ou código incorreto.' : 'Código incorreto. Ele muda a cada 30 segundos.' }); }
      if (used <= (T.last ?? -1)) { audit(req, 'login-falhou', '', 'código repetido'); return res.status(401).json({ error: 'Esse código já foi usado. Espere o próximo (muda a cada 30 segundos).' }); }
      T.last = used; bad.n = 0;
    }
    const now = Date.now();
    for (const k in DB.asessions) if (DB.asessions[k].exp < now) delete DB.asessions[k];
    const token = crypto.randomBytes(32).toString('hex'), exp = now + 12 * 36e5;
    DB.asessions[sha(token)] = { exp, ip: req.ip };
    audit(req, 'login', '', T ? 'com autenticador' : ''); res.json({ token, exp });
  });
  app.post('/api/admin/logout', ...guard, (req, res) => { const t = req.headers['x-admin-token']; if (t) delete DB.asessions[sha(String(t))]; save(); res.json({ ok: true }); });
  app.get('/api/admin/ping', ...guard, (req, res) => res.json({ ok: true }));

  // ligar/desligar o autenticador (precisa estar com a sessão do painel aberta)
  const tokenOnly = (req, res, next) => req.admin === 'token' ? next() : res.sendStatus(404);
  const A = () => { DB.meta ??= {}; DB.meta.admin ??= {}; return DB.meta.admin; };
  const label = req => 'admin@' + String(adminHost || req.hostname || 'codeup').replace(/:\d+$/, '');
  app.get('/api/admin/2fa', ...guard, tokenOnly, (req, res) => { const t = A().totp, T = tf(); res.json({ on: !!T, needKey: T ? T.needKey !== false : true, since: T ? T.at || null : null, stored: !!(t && t.on), envOff: !!process.env.ADMIN_2FA_OFF }); });
  app.post('/api/admin/2fa/start', limit(20, 15 * 60e3), ...guard, tokenOnly, async (req, res) => {
    if (A().totp && A().totp.on) return res.status(409).json({ error: process.env.ADMIN_2FA_OFF ? 'O autenticador está desligado pela variável ADMIN_2FA_OFF. Tire essa variável do servidor e reinicie para voltar a usá-lo.' : 'O autenticador já está ligado.' });
    let p = A().pending; const now = Date.now();
    if (!p || now - msOf(p.at) > 15 * 60e3) { p = A().pending = { secret: totp.newSecret(), at: new Date().toISOString() }; save(); }   // mesmo segredo por 15 min: dá para errar o código sem refazer o QR
    const uri = totp.uri(p.secret, label(req), 'CodeUp');
    let wa = String(process.env.ADMIN_WHATSAPP || '').replace(/\D/g, ''); if (wa.length === 10 || wa.length === 11) wa = '55' + wa;   // número do dono (variável do servidor, nunca no código): o botão "Enviar pelo WhatsApp" abre a conversa com ele
    res.json({ secret: p.secret, pretty: totp.pretty(p.secret), uri, wa: /^\d{12,15}$/.test(wa) ? wa : null, svg: qr.svg(uri, { label: 'QR Code para o aplicativo autenticador' }) });
  });
  app.post('/api/admin/2fa/enable', limit(20, 15 * 60e3), ...guard, tokenOnly, (req, res) => {
    const p = A().pending; if (A().totp && A().totp.on) return res.status(409).json({ error: 'O autenticador já está ligado.' });
    if (!p || Date.now() - msOf(p.at) > 15 * 60e3) return res.status(400).json({ error: 'O QR Code expirou. Feche e abra “Ligar o autenticador” de novo.' });
    if (lockLeft() > 0) return res.status(429).json({ error: 'Muitos códigos errados. Aguarde alguns minutos.' });
    const hit = totp.check(p.secret, req.body.code);
    if (hit < 0) { badCode(); return res.status(400).json({ error: 'Código incorreto. Confira se o relógio do celular está no horário automático e digite o código atual do app.' }); }
    A().totp = { secret: p.secret, needKey: req.body.needKey !== false && req.body.needKey !== 'false' && req.body.needKey !== 0, on: true, last: hit, at: new Date().toISOString() }; delete A().pending; bad.n = 0;
    dropOtherTokens(sha(String(req.headers['x-admin-token'])));                 // quem estava logado só com a chave sai
    audit(req, 'ligou-autenticador', '', A().totp.needKey ? 'chave + código' : 'só o código'); res.json({ ok: true, needKey: A().totp.needKey });
  });
  app.post('/api/admin/2fa/disable', limit(20, 15 * 60e3), ...guard, tokenOnly, (req, res) => {
    const T = tf(); if (!T) return res.status(409).json({ error: 'O autenticador não está ligado.' });
    if (lockLeft() > 0) return res.status(429).json({ error: 'Muitos códigos errados. Aguarde alguns minutos.' });
    const hit = totp.check(T.secret, req.body.code);
    if (hit < 0) { badCode(); return res.status(400).json({ error: 'Código incorreto.' }); }
    if (hit <= (T.last ?? -1)) return res.status(400).json({ error: 'Esse código acabou de ser usado. Espere o próximo (muda a cada 30 segundos) e tente de novo.' });
    delete A().totp; bad.n = 0; dropOtherTokens(sha(String(req.headers['x-admin-token'])));
    audit(req, 'desligou-autenticador', '', ''); res.json({ ok: true });
  });

  // a tela
  app.get('/admin', (req, res) => { res.set({ 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store' }).sendFile(path.join(__dirname, 'public', 'admin.html')); });

  // ---------- resumo de um usuário ----------
  const nLessons = u => Object.keys(u.done || {}).length;
  const seenMs = u => Math.max(msOf(u.seen), u.last ? msOf(u.last + 'T12:00:00Z') : 0, msOf(u.created));
  const row = u => ({
    id: u.id, name: u.name, email: u.email, sex: u.sex || null, guide: u.guide || null, created: u.created || null, seen: u.seen || null, last: u.last || null, track: u.track || null, xp: u.xp || 0,
    lessons: nLessons(u), cps: Object.keys(u.cpdone || {}).length, verified: u.verified !== false, google: !!u.googleId, hasPass: !!u.pass, banned: !!u.banned,
    unlock: Object.keys(u.unlock || {}), passed: Object.keys(u.passed || {}).length, streak: u.streak || 0
  });
  function detail(u) {
    const byTrack = {};
    for (const t of TRACKS) byTrack[t] = {
      name: TRACK_NAMES[t] || t, unlocked: !!(u.unlock && u.unlock[t]),
      levels: lvs(t).map(lv => ({
        lv, total: lessons.filter(l => l.track === t && l.lv === lv).length, done: lessons.filter(l => l.track === t && l.lv === lv && u.done[l.id]).length,
        cps: checkpoints.filter(c => c.track === t && c.lv === lv && u.cpdone[c.id]).length, cpTotal: checkpoints.filter(c => c.track === t && c.lv === lv).length,
        passed: u.passed[`${t}-${lv}`] || null, fails: (u.fails || {})[`${t}-${lv}`] || 0
      }))
    };
    const recent = [...Object.entries(u.done || {}), ...Object.entries(u.cpdone || {})].map(([id, e]) => ({ id, title: (actOf(id) || {}).title || id, date: e && e.date || null }))
      .sort((a, b) => msOf(b.date) - msOf(a.date)).slice(0, 8);
    let sessions = 0; for (const k in DB.sessions) if (DB.sessions[k].id === u.id && DB.sessions[k].exp > Date.now()) sessions++;
    return {
      ...row(u), accepted: u.acceptedTerms || null, gems: u.gems || 0, note: u.note || '', banned: u.banned || null, unlockMap: u.unlock || {},
      attempts: Object.values(u.attempts || {}).reduce((a, b) => a + b, 0), sessions, byTrack, recent
    };
  }
  const getUser = (req, res) => { const id = String(req.params.id || ''); if (!has(DB.users, id)) { res.status(404).json({ error: 'Usuário não encontrado.' }); return null; } return ensure(DB.users[id]); };   // ensure: contas que nunca entraram ainda não têm todos os campos

  // ---------- visão geral ----------
  let ovCache = null;
  function overview() {
    if (ovCache && Date.now() - ovCache.at < 20e3) return ovCache.v;
    const us = Object.values(DB.users), now = Date.now(), today = dk(now);
    const c = { total: us.length, verified: 0, unverified: 0, google: 0, banned: 0, unlocked: 0, noTrack: 0, tracks: {}, sex: { f: 0, m: 0, none: 0 }, guides: { tay: 0, cut: 0, none: 0 } };
    TRACKS.forEach(t => c.tracks[t] = 0);
    const days = Array.from({ length: 30 }, (_, i) => dk(now - (29 - i) * DAY)), idx = Object.fromEntries(days.map((d, i) => [d, i]));
    const S = days.map(d => ({ d, signups: 0, active: new Set(), lessons: 0 }));
    let lessonsDone = 0, cpsDone = 0, examsPassed = 0, examFails = 0, xp = 0, started = 0, lvl1 = 0;
    const act = { today: 0, d7: 0, d30: 0 }, nw = { today: 0, d7: 0, d30: 0 };
    for (const u of us) {
      if (u.verified !== false) c.verified++; else c.unverified++;
      if (u.googleId) c.google++; if (u.banned) c.banned++; if (u.unlock && Object.keys(u.unlock).length) c.unlocked++;
      if (u.track && has(c.tracks, u.track)) c.tracks[u.track]++; else c.noTrack++;
      c.sex[u.sex === 'f' || u.sex === 'm' ? u.sex : 'none']++; c.guides[u.guide === 'tay' || u.guide === 'cut' ? u.guide : 'none']++;
      xp += u.xp || 0;
      const cr = msOf(u.created), sn = seenMs(u);
      if (dk(cr) === today) nw.today++; if (now - cr < 7 * DAY) nw.d7++; if (now - cr < 30 * DAY) nw.d30++;
      if (dk(sn) === today) act.today++; if (now - sn < 7 * DAY) act.d7++; if (now - sn < 30 * DAY) act.d30++;
      if (cr && has(idx, dk(cr))) S[idx[dk(cr)]].signups++;
      const ld = Object.keys(u.done || {}).length; lessonsDone += ld; cpsDone += Object.keys(u.cpdone || {}).length; if (ld) started++;
      for (const e of [...Object.values(u.done || {}), ...Object.values(u.cpdone || {})]) { const d = dk(msOf(e && e.date)); if (has(idx, d)) { S[idx[d]].active.add(u.id); S[idx[d]].lessons++; } }
      const ps = Object.keys(u.passed || {}); examsPassed += ps.length; if (ps.some(k => k.endsWith('-1'))) lvl1++;
      examFails += Object.values(u.fails || {}).reduce((a, b) => a + b, 0);
    }
    const v = {
      counts: c, new: nw, active: act, series: S.map(s => ({ d: s.d, signups: s.signups, active: s.active.size, lessons: s.lessons })),
      totals: { lessonsDone, cpsDone, examsPassed, examFails, xp },
      funnel: [['Cadastros', us.length], ['E-mail confirmado', c.verified], ['Fizeram 1 lição', started], ['Passaram na prova do Básico', lvl1]],
      top: [...us].sort((a, b) => (b.xp || 0) - (a.xp || 0)).slice(0, 8).map(row),
      recent: [...us].sort((a, b) => msOf(b.created) - msOf(a.created)).slice(0, 10).map(row),
      settings: publicSettings()
    };
    ovCache = { at: now, v }; return v;
  }
  function publicSettings() { const s = settingsMain(), a = adsNow(); return { signupsOpen: s.signupsOpen !== false, announce: s.announce, courses: TRACKS.map(t => ({ id: t, name: TRACK_NAMES[t], on: courseOn(t), levels: lvs(t), lessons: lessons.filter(l => l.track === t).length, students: Object.values(DB.users).filter(u => u.track === t).length })), unlockAll: { on: unlockAllOn(), until: s.unlockAll.until || null }, ads: { on: a.on, client: a.client, slot: a.slot, from: a.from, adsTxt: a.client ? BASE + '/ads.txt' : '' } }; }
  app.get('/api/admin/overview', ...guard, (req, res) => res.json(overview()));

  // ---------- lista de usuários ----------
  const SORTS = { created: u => msOf(u.created), seen: u => seenMs(u), xp: u => u.xp || 0, lessons: u => nLessons(u), name: u => String(u.name || '').toLowerCase() };
  function filterUsers(qs) {
    const q = String(qs.q || '').trim().toLowerCase().slice(0, 60), track = String(qs.track || ''), status = String(qs.status || ''), now = Date.now();
    let rows = Object.values(DB.users);
    if (q) rows = rows.filter(u => String(u.name || '').toLowerCase().includes(q) || String(u.email || '').includes(q) || String(u.id).startsWith(q));
    if (track === 'none') rows = rows.filter(u => !u.track); else if (TRACKS.includes(track)) rows = rows.filter(u => u.track === track);
    const F = {
      verified: u => u.verified !== false, unverified: u => u.verified === false, banned: u => !!u.banned, google: u => !!u.googleId,
      unlocked: u => !!(u.unlock && Object.keys(u.unlock).length), active7: u => now - seenMs(u) < 7 * DAY, inactive7: u => now - seenMs(u) >= 7 * DAY,
      started: u => nLessons(u) > 0, never: u => nLessons(u) === 0
    };
    if (F[status]) rows = rows.filter(F[status]);
    const sk = has(SORTS, qs.sort) ? qs.sort : 'created', dir = qs.dir === 'asc' ? 1 : -1, f = SORTS[sk];
    return rows.sort((a, b) => { const x = f(a), y = f(b); return (x < y ? -1 : x > y ? 1 : 0) * dir; });
  }
  app.get('/api/admin/users', ...guard, (req, res) => {
    const all = filterUsers(req.query), size = Math.min(100, Math.max(5, +req.query.size || 25)), pages = Math.max(1, Math.ceil(all.length / size)), page = Math.min(pages, Math.max(1, +req.query.page || 1));
    res.json({ total: all.length, page, pages, size, rows: all.slice((page - 1) * size, page * size).map(row) });
  });
  app.get('/api/admin/users/:id', ...guard, (req, res) => { const u = getUser(req, res); if (u) res.json(detail(u)); });

  // CSV (abre direto no Excel em português: separador ";" e acentos corretos)
  const cell = v => { let s = String(v ?? ''); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return /[";\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  app.get('/api/admin/users.csv', ...guard, (req, res) => {
    const head = ['Nome', 'E-mail', 'Cadastro', 'Último acesso', 'Curso atual', 'XP', 'Lições concluídas', 'Checkpoints', 'Provas aprovadas', 'E-mail confirmado', 'Entra com Google', 'Suspenso', 'Cursos liberados', 'Gênero', 'Personagem'];
    const lines = filterUsers(req.query).map(u => { const r = row(u); return [r.name, r.email, r.created, r.seen || r.last || '', r.track ? TRACK_NAMES[r.track] : '', r.xp, r.lessons, r.cps, r.passed, r.verified ? 'sim' : 'não', r.google ? 'sim' : 'não', r.banned ? 'sim' : 'não', r.unlock.map(t => TRACK_NAMES[t] || t).join(' + '), r.sex === 'f' ? 'feminino' : r.sex === 'm' ? 'masculino' : '', r.guide === 'tay' ? 'Tay' : r.guide === 'cut' ? 'Cut' : ''].map(cell).join(';'); });
    audit(req, 'exportou-csv', '', lines.length + ' usuários');
    res.type('text/csv; charset=utf-8').set('Content-Disposition', `attachment; filename="usuarios-codeup-${dk(Date.now())}.csv"`).send('﻿' + [head.map(cell).join(';'), ...lines].join('\r\n'));
  });

  // ---------- ações sobre um usuário ----------
  app.post('/api/admin/users/:id/action', ...guard, async (req, res) => { try {
    const u = getUser(req, res); if (!u) return;
    const b = req.body || {}, a = String(b.action || ''), who = `${u.name} <${u.email}>`, out = {};
    switch (a) {
      case 'unlock': {                                                  // libera (ou tira a liberação de) cursos inteiros: sem bloqueio de nível, sequência ou checkpoint
        const ts = b.tracks === 'all' ? TRACKS : (Array.isArray(b.tracks) ? b.tracks : []).filter(t => TRACKS.includes(t));
        if (!ts.length) return res.status(400).json({ error: 'Escolha um curso.' });
        u.unlock ??= {};
        for (const t of ts) { if (b.on === false) delete u.unlock[t]; else u.unlock[t] = new Date().toISOString(); }
        audit(req, b.on === false ? 'tirou-liberacao' : 'liberou-curso', who, ts.join(', ')); break;
      }
      case 'ban': u.banned = { at: new Date().toISOString(), reason: String(b.reason || '').slice(0, 200) }; dropSessions(u.id); audit(req, 'suspendeu', who, u.banned.reason); break;
      case 'unban': delete u.banned; audit(req, 'reativou', who, ''); break;
      case 'verify': u.verified = true; for (const k in DB.verifies) if (DB.verifies[k].id === u.id) delete DB.verifies[k]; audit(req, 'confirmou-email', who, ''); break;
      case 'resend-verify': if (u.verified !== false) return res.status(409).json({ error: 'Este e-mail já está confirmado.' }); out.link = await sendVerify(u); audit(req, 'reenviou-confirmacao', who, ''); break;
      case 'reset-link': out.link = makeResetLink(u); audit(req, 'gerou-link-de-senha', who, ''); break;
      case 'logout': dropSessions(u.id); audit(req, 'encerrou-sessoes', who, ''); break;
      case 'rename': { const n = String(b.name || '').trim().slice(0, 30); if (!n) return res.status(400).json({ error: 'Informe um nome.' }); audit(req, 'renomeou', who, `${u.name} → ${n}`); u.name = n; break; }
      case 'xp': {
        const v = Math.trunc(+b.value); if (!Number.isFinite(v) || Math.abs(v) > 1e6) return res.status(400).json({ error: 'Informe um número de XP válido.' });
        const before = u.xp || 0; u.xp = Math.min(1e6, Math.max(0, b.mode === 'set' ? v : before + v)); audit(req, 'ajustou-xp', who, `${before} → ${u.xp}`); break;
      }
      case 'note': u.note = String(b.text || '').slice(0, 500); audit(req, 'nota', who, ''); break;
      case 'reset-level': {                                             // suporte: devolve um nível (ou o curso todo) ao começo. O XP já ganho fica.
        const t = String(b.track || ''), all = b.level === 'all', lv = +b.level;
        if (!TRACKS.includes(t) || (!all && !lvs(t).includes(lv))) return res.status(400).json({ error: 'Curso ou nível inválido.' });
        for (const L of all ? lvs(t) : [lv]) {
          lessons.filter(l => l.track === t && l.lv === L).forEach(l => { delete u.done[l.id]; for (const f of ['ex', 'ler', 'exp']) delete (u[f] || {})[l.id]; delete u.attempts[l.id]; });
          [...checkpoints, ...finals].filter(c => c.track === t && c.lv === L).forEach(c => { delete u.cpdone[c.id]; delete u.attempts[c.id]; delete u.cptry[c.id]; });
          delete u.passed[`${t}-${L}`]; delete u.exams[`${t}-${L}`];
        }
        audit(req, 'zerou-progresso', who, `${t} ${all ? 'todos os níveis' : 'nível ' + lv}`); break;
      }
      case 'delete': {
        if (String(b.confirm || '').trim().toLowerCase() !== String(u.email).toLowerCase()) return res.status(400).json({ error: 'Digite o e-mail do usuário para confirmar.' });
        dropSessions(u.id); for (const k in DB.resets) if (DB.resets[k].id === u.id) delete DB.resets[k]; for (const k in DB.verifies) if (DB.verifies[k].id === u.id) delete DB.verifies[k];
        delete DB.users[u.id]; audit(req, 'excluiu-conta', who, ''); save(); ovCache = null; return res.json({ ok: true, deleted: true });
      }
      default: return res.status(400).json({ error: 'Ação desconhecida.' });
    }
    save(); ovCache = null; res.json({ ok: true, ...out, user: detail(u) });
  } catch (e) { console.error('admin action', e); if (!res.headersSent) res.status(500).json({ error: 'Não foi possível concluir a ação.' }); } });

  // ---------- aprendizado: onde os alunos travam e como vão as provas ----------
  app.get('/api/admin/learning', ...guard, (req, res) => {
    const st = new Map(); [...lessons, ...checkpoints, ...finals].forEach(l => st.set(l.id, { started: 0, done: 0, tries: 0, stuck: 0, track: l.track, lv: l.lv }));
    const ex = {}; TRACKS.forEach(t => lvs(t).forEach(lv => ex[`${t}-${lv}`] = { track: t, lv, passed: 0, fails: 0, tries: 0 }));
    for (const u of Object.values(DB.users)) {
      // "travado" = este aluno já tentou a lição e ainda não concluiu (não conta quem foi reprovado na prova do nível: aí as lições voltam por regra)
      for (const [id, n] of Object.entries(u.attempts || {})) { const s = st.get(id); if (s && n > 0) { s.started++; s.tries += n; if (!(u.done || {})[id] && !(u.cpdone || {})[id] && !(u.fails || {})[`${s.track}-${s.lv}`]) s.stuck++; } }
      for (const id of Object.keys(u.done || {})) { const s = st.get(id); if (s) s.done++; }
      for (const id of Object.keys(u.cpdone || {})) { const s = st.get(id); if (s) s.done++; }
      for (const k of Object.keys(u.passed || {})) { if (ex[k]) ex[k].passed++; const f = finals.find(x => `${x.track}-${x.lv}` === k); const sf = f && st.get(f.id); if (sf) sf.done++; }
      for (const [k, n] of Object.entries(u.fails || {})) if (ex[k]) ex[k].fails += n;
      for (const [k, n] of Object.entries(u.tries || {})) if (ex[k]) ex[k].tries += n;
    }
    const rows = [...st.entries()].map(([id, s]) => { const l = actOf(id); return { id, title: l.title, track: l.track, lv: l.lv, n: l.n || l.after, cp: !!l.cp, fin: !!l.fin, started: s.started, done: s.done, stuck: s.stuck, avgTries: s.started ? +(s.tries / s.started).toFixed(1) : 0 }; })
      .filter(r => r.started > 0);
    res.json({
      stuck: [...rows].sort((a, b) => b.stuck - a.stuck || b.avgTries - a.avgTries).slice(0, 15),
      hardest: [...rows].filter(r => r.done > 0).sort((a, b) => b.avgTries - a.avgTries || b.started - a.started).slice(0, 10),
      exams: Object.values(ex).map(e => ({ ...e, passRate: e.passed + e.fails ? Math.round(e.passed / (e.passed + e.fails) * 100) : null }))
    });
  });

  // ---------- ajustes: cadastros, comunicado, modo livre e anúncios (AdSense) ----------
  app.get('/api/admin/settings', ...guard, (req, res) => res.json(publicSettings()));
  app.post('/api/admin/settings', ...guard, (req, res) => {
    const s = settingsMain(), b = req.body || {}, did = [];
    if (typeof b.signupsOpen === 'boolean') { s.signupsOpen = b.signupsOpen; did.push('cadastros ' + (b.signupsOpen ? 'abertos' : 'fechados')); }
    if (b.courses && typeof b.courses === 'object' && !Array.isArray(b.courses)) {                       // quais cursos ficam ativos no aplicativo
      const ks = Object.keys(b.courses); if (!ks.length || ks.some(k => !TRACKS.includes(k) || typeof b.courses[k] !== 'boolean')) return res.status(400).json({ error: 'Curso inválido.' });
      const next = { ...coursesCfg(), ...b.courses }; if (!TRACKS.some(t => next[t])) return res.status(400).json({ error: 'Deixe pelo menos um curso ativo, senão o aplicativo fica sem nada para estudar.' });
      for (const k of ks) if (courseOn(k) !== b.courses[k]) { s.courses[k] = b.courses[k]; did.push(`curso ${TRACK_NAMES[k]} ${b.courses[k] ? 'ativado' : 'desativado'}`); }
      if (!did.length) did.push('cursos: nada mudou');
    }
    if (b.announce && typeof b.announce === 'object') {
      const text = String(b.announce.text || '').trim().slice(0, 280), kind = ['info', 'warn', 'ok'].includes(b.announce.kind) ? b.announce.kind : 'info', on = b.announce.on === true && !!text;
      if (b.announce.on === true && !text) return res.status(400).json({ error: 'Escreva o texto do comunicado.' });
      if (text !== s.announce.text || kind !== s.announce.kind || on !== s.announce.on) s.announce = { on, text, kind, id: Date.now() };   // novo id = quem tinha fechado o aviso volta a ver
      did.push('comunicado ' + (on ? 'ligado' : 'desligado'));
    }
    if (b.unlockAll && typeof b.unlockAll === 'object') {
      const on = b.unlockAll.on === true, days = Math.min(365, Math.max(0, Math.trunc(+b.unlockAll.days) || 0));
      s.unlockAll = { on, until: on && days ? new Date(Date.now() + days * DAY).toISOString() : null };
      did.push('modo livre ' + (on ? (days ? `por ${days} dia(s)` : 'ligado') : 'desligado'));
    }
    if (b.ads && typeof b.ads === 'object') {
      if (b.ads.reset === true) { delete s.ads; did.push('anúncios: voltou ao padrão do servidor'); }
      else {
        const rawC = String(b.ads.client ?? '').trim(), rawS = String(b.ads.slot ?? '').trim(), client = adsClientOf(rawC), slot = adsSlotOf(rawS), on = b.ads.on === true;
        if (rawC && !client) return res.status(400).json({ error: 'O ID do editor não parece certo. Ele começa com ca-pub- e tem só números depois (ex.: ca-pub-1234567890123456). Você o encontra no AdSense, em Conta → Informações da conta.' });
        if (rawS && !slot) return res.status(400).json({ error: 'O ID do bloco de anúncios tem só números (de 6 a 20). Ele está no AdSense, em Anúncios → Por bloco de anúncios → Gerar código (data-ad-slot).' });
        if (on && !client) return res.status(400).json({ error: 'Para ligar os anúncios, preencha o ID do editor (ca-pub-…).' });
        s.ads = { on, client, slot };
        did.push(`anúncios ${on ? 'ligados' : 'desligados'}${client ? ` (${client}${slot ? ', bloco ' + slot : ', sem bloco'})` : ''}`);
      }
    }
    if (!did.length) return res.status(400).json({ error: 'Nada para salvar.' });
    audit(req, 'ajustes', '', did.join('; ')); save(); res.json(publicSettings());
  });

  // ---------- sistema e auditoria ----------
  app.get('/api/admin/system', ...guard, (req, res) => {
    const m = process.memoryUsage();
    res.json({
      db: store.kind, node: process.version, uptime: Math.round(process.uptime()), memMB: Math.round(m.rss / 1048576), prod: PROD, base: BASE,
      users: Object.keys(DB.users).length, sessions: Object.keys(DB.sessions).length, audit: Object.keys(DB.audit || {}).length,
      keyFromEnv: !!(process.env.ADMIN_KEY || process.env.ADMIN_PASSWORD), emailFromEnv: !!adminEmail(), twofa: !!tf(), twofaKey: tf() ? tf().needKey !== false : null, twofaStored: !!(DB.meta && DB.meta.admin && DB.meta.admin.totp && DB.meta.admin.totp.on), twofaEnvOff: !!process.env.ADMIN_2FA_OFF, adminHost: adminHost || '', now: new Date().toISOString(), ...info()
    });
  });
  app.get('/api/admin/audit', ...guard, (req, res) => {
    const n = Math.min(300, Math.max(10, +req.query.limit || 100));
    res.json({ rows: Object.values(DB.audit || {}).sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, n) });
  });

  // ---------- compatibilidade com as rotas antigas ----------
  app.get('/api/admin/stats', ...guard, (req, res) => {
    const us = Object.values(DB.users), today = new Date().toISOString().slice(0, 10);
    res.json({ usuarios: us.length, ativosHoje: us.filter(u => u.last === today).length, novosUltimos7dias: us.filter(u => Date.now() - Date.parse(u.created) < 7 * DAY).length });
  });
  app.post('/api/admin/reset-link', ...guard, (req, res) => {
    const em = String(req.body.email || '').trim().toLowerCase(), u = Object.values(DB.users).find(x => x.email === em);
    if (!u) return res.status(404).json({ error: 'Usuário não encontrado.' });
    audit(req, 'gerou-link-de-senha', `${u.name} <${u.email}>`, ''); res.json({ link: makeResetLink(u) });
  });

  // mensagem de início no terminal
  return {
    banner() {
      const K = adminKey(), WHERE = adminHost ? (PROD ? 'https://' : 'http://') + adminHost : BASE;
      if (!K) { console.warn('⚠ Painel admin DESLIGADO: defina ADMIN_EMAIL e ADMIN_PASSWORD (ou só ADMIN_KEY) nas variáveis do servidor para usar /admin.'); return; }
      if (adminEmail() && !process.env.ADMIN_PASSWORD && !process.env.ADMIN_KEY) console.warn('⚠ ADMIN_EMAIL está definido, mas falta ADMIN_PASSWORD no .env: sem ela o painel não terá a senha que você espera.');
      if (process.env.ADMIN_KEY || process.env.ADMIN_PASSWORD) { console.log(`Painel admin: ${WHERE}/admin  (${adminEmail() ? 'entre com o e-mail e a senha que você definiu' : 'use a chave ADMIN_KEY; para entrar com e-mail e senha defina ADMIN_EMAIL e ADMIN_PASSWORD no .env e reinicie'})`); if (PROD && K.length < 16) console.warn('⚠ Senha do admin curta: use pelo menos 16 caracteres.'); }
      else console.log(`\n  Painel admin: ${WHERE}/admin\n  Chave de acesso (gerada só para este computador): ${K}\n  Para fixar a sua, coloque ADMIN_KEY=... no arquivo .env\n`);
    }
  };
};
