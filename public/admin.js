'use strict';
// Painel admin do CodeUp. Tudo que vem de usuários (nomes, e-mails) passa por esc() antes de ir para a tela.
const $ = (s, r = document) => r.querySelector(s);
const esc = t => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const IC = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5V21h16"/>',
  award: '<circle cx="12" cy="9" r="6"/><path d="m8.5 14-1.5 8 5-3 5 3-1.5-8"/>',
  sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  server: '<rect x="3" y="3" width="18" height="7" rx="2"/><rect x="3" y="14" width="18" height="7" rx="2"/><path d="M7 6.5h.01M7 17.5h.01"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>', down: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>', check: '<path d="M20 6 9 17l-5-5"/>', lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  unlock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/>', bolt: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>', refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>', key: '<circle cx="8" cy="15" r="4"/><path d="m10.8 12.2 9-9M17 6l3 3"/>', trash: '<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
  ban: '<circle cx="12" cy="12" r="9"/><path d="m5.6 5.6 12.8 12.8"/>', user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>', ext: '<path d="M14 3h7v7M10 14 21 3M19 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5"/>',
  flame: '<path d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-4-1-6 1-10z"/>', cap: '<path d="m22 9-10-5L2 9l10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>', pencil: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  mega: '<path d="m3 11 18-5v12L3 14zM11.6 16.8a3 3 0 1 1-5.8-1.6"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/>', plus: '<path d="M12 5v14M5 12h14"/>', coin: '<circle cx="12" cy="12" r="9"/><path d="M14.6 9.3c-.5-.8-1.4-1.3-2.6-1.3-1.5 0-2.6.8-2.6 2s1 1.7 2.6 2 2.6.8 2.6 2-1.1 2-2.6 2c-1.2 0-2.1-.5-2.6-1.3M12 6.5V8m0 8v1.5"/>', copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>'
};
const ic = (n, s = 18) => `<svg class="i" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n] || ''}</svg>`;
const TN = { python: 'Python', sql: 'SQL' }, LV = ['Básico', 'Intermediário', 'Avançado'];
const TZ = 'America/Sao_Paulo';
const num = n => Number(n || 0).toLocaleString('pt-BR');
const dt = (iso, long) => { const t = Date.parse(iso || ''); if (!t) return '—'; return new Date(t).toLocaleString('pt-BR', long ? { timeZone: TZ, day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' } : { timeZone: TZ, day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }); };
const dd = iso => { const t = Date.parse(iso || ''); return t ? new Date(t).toLocaleDateString('pt-BR', { timeZone: TZ, day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'; };
const ago = iso => {
  const t = Date.parse(iso || ''); if (!t) return 'nunca'; const m = Math.round((Date.now() - t) / 6e4);
  if (m < 1) return 'agora'; if (m < 60) return `há ${m} min`; if (m < 1440) return `há ${Math.round(m / 60)} h`; if (m < 2880) return 'ontem'; if (m < 43200) return `há ${Math.round(m / 1440)} dias`; return dd(iso);
};
const pct = (a, b) => b ? Math.round(a / b * 100) : 0;

// ---------------------------------------------------------------- estado e API
const ST = { tab: 'overview', token: (() => { try { return sessionStorage.getItem('adm') || ''; } catch { return ''; } })(), users: { q: '', track: '', status: '', sort: 'created', dir: 'desc', page: 1 }, certQ: '', open: null };
const root = $('#root');
async function api(p, o = {}) {
  let r;
  try { r = await fetch('/api/admin/' + p, { method: o.method || (o.body ? 'POST' : 'GET'), headers: { 'Content-Type': 'application/json', 'x-admin-token': ST.token }, body: o.body ? JSON.stringify(o.body) : undefined }); }
  catch { throw { error: 'Sem conexão com o servidor.' }; }
  if (r.status === 401) { logout(true); throw { error: 'Sessão expirada. Entre de novo.', silent: true }; }
  if (o.raw && r.ok) return r;
  let j = {}; try { j = await r.json(); } catch { }
  if (!r.ok) throw { error: j.error || 'Algo deu errado.', status: r.status };
  return j;
}
function toast(m, err) { document.querySelectorAll('.toast').forEach(x => x.remove()); const d = document.createElement('div'); d.className = 'toast ' + (err ? 'err' : 'ok'); d.innerHTML = ic(err ? 'info' : 'check', 18) + '<span></span>'; d.lastChild.textContent = m; document.body.appendChild(d); setTimeout(() => d.remove(), 4200); }
const fail = e => { if (!e.silent) toast(e.error || 'Algo deu errado.', true); };

// janela de confirmação/entrada (sem usar os alertas do navegador)
function ask({ title, text, fields = [], ok = 'Confirmar', danger = false, html = '' }) {
  return new Promise(resolve => {
    const m = document.createElement('div'); m.className = 'md'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
    const F = fields.map(f => `<label for="f_${f.id}">${esc(f.label)}</label>` + (f.type === 'select'
      ? `<select class="sel" id="f_${f.id}">${f.options.map(o => `<option value="${esc(o[0])}"${String(o[0]) === String(f.value) ? ' selected' : ''}>${esc(o[1])}</option>`).join('')}</select>`
      : f.type === 'textarea' ? `<textarea class="in" id="f_${f.id}" maxlength="${f.max || 500}" placeholder="${esc(f.ph || '')}">${esc(f.value || '')}</textarea>`
        : `<input class="in" id="f_${f.id}" type="${f.type || 'text'}" value="${esc(f.value ?? '')}" placeholder="${esc(f.ph || '')}" autocomplete="off">`)).join('');
    m.innerHTML = `<div class="box"><h3>${esc(title)}</h3>${text ? `<p>${esc(text)}</p>` : ''}${html}${F}<div class="row"><button class="btn ghost" data-r="0">Cancelar</button><button class="btn ${danger ? 'danger' : 'pri'}" data-r="1">${esc(ok)}</button></div></div>`;
    const done = v => { m.remove(); document.removeEventListener('keydown', kd); resolve(v); };
    const kd = e => { if (e.key === 'Escape') done(null); if (e.key === 'Enter' && e.target.tagName === 'INPUT') done(get()); };
    const get = () => Object.fromEntries(fields.map(f => [f.id, $('#f_' + f.id, m).value]));
    m.addEventListener('click', e => { const b = e.target.closest('[data-r]'); if (b) done(b.dataset.r === '1' ? get() : null); else if (e.target === m) done(null); });
    document.addEventListener('keydown', kd); document.body.appendChild(m); const f = m.querySelector('input,textarea,select'); if (f) f.focus(); else m.querySelector('[data-r="1"]').focus();
  });
}

// ---------------------------------------------------------------- login
async function showLogin(msg, setup) {
  let li = { twofa: false, needKey: true };                                                  // o servidor diz o que pedir: só a chave, chave + código ou só o código
  try { const r = await fetch('/api/admin/login-info', { cache: 'no-store' }); if (r.ok) li = await r.json(); } catch { }
  const key = li.needKey !== false, two = !!li.twofa, em = key && !!li.email;                 // com e-mail fixo configurado a tela pede e-mail + senha
  root.innerHTML = `<div class="lg"><form class="box" id="lf"><h1 class="logo"><b>Code</b><span>Up</span></h1><h2>Painel admin</h2><p>${two ? (key ? `Entre com ${em ? 'o e-mail e a senha' : 'a chave'} de administrador e o código do aplicativo autenticador.` : 'Entre com o código do aplicativo autenticador.') : em ? 'Entre com o e-mail e a senha de administrador.' : 'Entre com a chave de administrador.'}</p>
    ${msg ? `<div class="err">${esc(msg)}</div>` : ''}
    ${em ? `<input class="in" type="email" id="em" placeholder="E-mail" autocomplete="username" autocapitalize="none" spellcheck="false" aria-label="E-mail do administrador" autofocus><div style="height:12px"></div>` : ''}
    ${key ? `<input class="in" type="password" id="key" placeholder="${em ? 'Senha' : 'ADMIN_KEY'}" autocomplete="current-password" aria-label="${em ? 'Senha' : 'Chave'} do administrador"${two || em ? '' : ' autofocus'}><div style="height:12px"></div>` : ''}
    ${two ? `<input class="in code" type="text" id="code" inputmode="numeric" pattern="[0-9 ]*" maxlength="7" placeholder="000 000" autocomplete="one-time-code" aria-label="Código de 6 dígitos do autenticador"${key ? '' : ' autofocus'}><div class="hint">O código muda a cada 30 segundos.</div><div style="height:12px"></div>` : ''}
    <button class="btn pri" style="width:100%" id="lb">${ic('lock', 16)} Entrar</button>
    ${setup ? `<div class="help"><b>Como ligar o painel:</b><br>Abra o arquivo <span class="mono">.env</span> na pasta do projeto, escreva <span class="mono">ADMIN_EMAIL=seu@email.com</span> e <span class="mono">ADMIN_PASSWORD=uma-senha-longa-sua</span> (ou só <span class="mono">ADMIN_KEY=...</span>, sem e-mail) e reinicie o servidor. No Render, são as mesmas variáveis.</div>` : ''}</form></div>`;
  const k = $('#key'), c = $('#code'), e1 = $('#em'); if (e1) e1.focus(); else if (k && !two) k.focus(); else if (c && !key) c.focus(); else if (k) k.focus();
  $('#lf').onsubmit = async e => {
    e.preventDefault(); const b = $('#lb'); b.disabled = true;
    try { const r = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: k ? k.value : '', code: c ? c.value : '', email: e1 ? e1.value : '' }) }), j = await r.json().catch(() => ({}));
      if (!r.ok) { showLogin(j.error || 'Não foi possível entrar.', r.status === 503); return; }
      ST.token = j.token; try { sessionStorage.setItem('adm', j.token); } catch { } shell();
    } catch { showLogin('Sem conexão com o servidor.'); }
  };
}
async function logout(expired) { try { if (!expired) await api('logout', { body: {} }); } catch { } ST.token = ''; try { sessionStorage.removeItem('adm'); } catch { } showLogin(expired ? 'Sua sessão expirou. Entre de novo.' : ''); }

// ---------------------------------------------------------------- estrutura
const TABS = [['overview', 'grid', 'Visão geral'], ['users', 'users', 'Usuários'], ['learning', 'book', 'Aprendizado'], ['certs', 'award', 'Certificados'], ['settings', 'sliders', 'Ajustes'], ['system', 'server', 'Sistema'], ['audit', 'list', 'Auditoria']];
function shell() {
  root.innerHTML = `<div class="app"><aside class="side"><h1 class="logo"><b>Code</b><span>Up</span></h1><small>Painel admin</small>
    <nav class="nav">${TABS.map(t => `<button data-tab="${t[0]}">${ic(t[1], 19)}<span>${t[2]}</span></button>`).join('')}</nav>
    <div class="foot"><a class="btn ghost sm" href="/" target="_blank" rel="noopener">${ic('ext', 15)}<span>Abrir o app</span></a><button class="btn ghost sm" data-a="logout">${ic('out', 15)}<span>Sair</span></button></div></aside>
    <main class="main" id="main"></main></div><div class="ov" id="ov"></div><aside class="dr" id="dr" aria-label="Detalhes do usuário"></aside>`;
  go(ST.tab);
}
async function go(tab) {
  ST.tab = tab; closeUser();
  document.querySelectorAll('.nav button').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
  const m = $('#main'); m.innerHTML = '<div class="load"><span class="spin"></span></div>';
  try { await VIEWS[tab](m); } catch (e) { if (!e.silent) m.innerHTML = `<div class="card empty">${esc(e.error || 'Não foi possível carregar.')}<br><br><button class="btn" data-a="reload">Tentar de novo</button></div>`; }
  window.scrollTo(0, 0);
}
const head = (title, extra = '') => `<div class="hd"><h1>${title}</h1>${extra}<button class="btn ghost sm" data-a="reload" title="Atualizar">${ic('refresh', 15)} Atualizar</button></div>`;

// ---------------------------------------------------------------- visão geral
function chart(S) {
  const W = 720, H = 230, L = 34, B = 26, T = 10, R = 8, n = S.length, bw = (W - L - R) / n, max = Math.max(4, ...S.map(s => Math.max(s.signups, s.active))), niceMax = Math.ceil(max / 4) * 4;
  const y = v => T + (H - T - B) * (1 - v / niceMax), x = i => L + bw * i + bw / 2;
  let g = ''; for (let i = 0; i <= 4; i++) { const v = niceMax / 4 * i; g += `<line class="gl" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text x="${L - 6}" y="${y(v) + 3.5}" text-anchor="end">${Math.round(v)}</text>`; }
  const bars = S.map((s, i) => `<rect class="cb" x="${x(i) - bw * .3}" y="${y(s.signups)}" width="${bw * .6}" height="${Math.max(0, H - B - y(s.signups))}" rx="3"><title>${esc(s.d.split('-').reverse().slice(0, 2).join('/'))}: ${s.signups} cadastro(s), ${s.active} aluno(s) estudando</title></rect>`).join('');
  const line = S.map((s, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(s.active).toFixed(1)}`).join(' ');
  const dots = S.map((s, i) => s.active ? `<circle class="cd" cx="${x(i).toFixed(1)}" cy="${y(s.active).toFixed(1)}" r="3"/>` : '').join('');
  const lab = S.map((s, i) => i % 5 === 0 || i === n - 1 ? `<text x="${x(i)}" y="${H - 7}" text-anchor="middle">${s.d.slice(8)}/${s.d.slice(5, 7)}</text>` : '').join('');
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Cadastros e alunos ativos por dia">${g}${bars}<path class="cl" d="${line}"/>${dots}${lab}</svg>
    <div class="lgd"><span><i style="background:var(--acc)"></i>Cadastros por dia</span><span><i style="background:var(--or)"></i>Alunos que concluíram lições</span></div>`;
}
const userRow = u => `<div class="li" data-a="open" data-id="${esc(u.id)}"><span class="av">${esc((u.name || '?').trim().charAt(0))}</span><div class="grow"><b>${esc(u.name)}</b><span>${esc(u.email)}</span></div><span class="xs mut">${esc(ago(u.created))}</span></div>`;
const VIEWS = {
  async overview(m) {
    const d = await api('overview'), c = d.counts, t = d.totals, s = d.settings, al = [];
    if (s.unlockAll.on) al.push(`<div class="al warn">${ic('unlock', 18)}<div class="grow"><b>Modo livre ligado:</b> todos os cursos estão liberados para todos${s.unlockAll.until ? ' até ' + dt(s.unlockAll.until) : ', sem prazo'}.</div><button class="btn sm" data-tab="settings">Ajustes</button></div>`);
    if (!s.signupsOpen) al.push(`<div class="al warn">${ic('ban', 18)}<div class="grow"><b>Cadastros fechados:</b> ninguém novo consegue criar conta.</div><button class="btn sm" data-tab="settings">Ajustes</button></div>`);
    if (s.announce.on) al.push(`<div class="al info">${ic('mega', 18)}<div class="grow"><b>Comunicado no ar:</b> ${esc(s.announce.text)}</div></div>`);
    const maxT = Math.max(1, ...Object.values(c.tracks), c.noTrack);
    m.innerHTML = head('Visão geral') + (al.length ? `<div class="alerts">${al.join('')}</div>` : '') + `
    <div class="kpis">
      <div class="kpi hi"><small>${ic('users', 15)} Cadastros</small><b>${num(c.total)}</b><span><span class="up">+${num(d.new.today)} hoje</span> · +${num(d.new.d7)} em 7 dias</span></div>
      <div class="kpi"><small>${ic('bolt', 15)} Ativos hoje</small><b>${num(d.active.today)}</b><span>${num(d.active.d7)} em 7 dias · ${num(d.active.d30)} em 30</span></div>
      <div class="kpi"><small>${ic('book', 15)} Lições concluídas</small><b>${num(t.lessonsDone)}</b><span>${num(t.cpsDone)} checkpoints</span></div>
      <div class="kpi"><small>${ic('cap', 15)} Provas aprovadas</small><b>${num(t.examsPassed)}</b><span>${num(t.examFails)} reprovação(ões)</span></div>
      <div class="kpi"><small>${ic('award', 15)} Certificados</small><b>${num(t.certs)}</b><span>emitidos e válidos</span></div>
      <div class="kpi"><small>${ic('flame', 15)} XP total</small><b>${num(t.xp)}</b><span>somando todos os alunos</span></div></div>
    <div class="grid g2"><div class="card"><h3>Cadastros e atividade <small>últimos 30 dias</small></h3>${chart(d.series)}</div>
      <div class="card"><h3>Do cadastro ao certificado</h3>${d.funnel.map((f, i) => `<div class="hb ${i === 4 ? 'or' : i > 1 ? 'gr' : ''}" style="flex-wrap:wrap"><span style="width:100%">${esc(f[0])}</span><div class="t"><i style="width:${pct(f[1], d.funnel[0][1])}%"></i></div><b>${num(f[1])}</b><em>${pct(f[1], d.funnel[0][1])}%</em></div>`).join('')}</div></div>
    <div class="grid g3" style="margin-top:16px">
      <div class="card"><h3>Últimos cadastros <small><a href="#" data-tab="users" style="color:inherit">ver todos</a></small></h3><div class="list">${d.recent.length ? d.recent.map(userRow).join('') : '<div class="empty">Ninguém se cadastrou ainda.</div>'}</div></div>
      <div class="card"><h3>Mais pontos (XP)</h3><div class="list">${d.top.filter(u => u.xp).length ? d.top.filter(u => u.xp).map(u => `<div class="li" data-a="open" data-id="${esc(u.id)}"><span class="av">${esc((u.name || '?').trim().charAt(0))}</span><div class="grow"><b>${esc(u.name)}</b><span>${num(u.lessons)} lições${u.track ? ' · ' + esc(TN[u.track] || u.track) : ''}</span></div><b>${num(u.xp)}</b></div>`).join('') : '<div class="empty">Ainda sem pontos.</div>'}</div></div>
      <div class="card"><h3>Quem é quem</h3>
        ${Object.entries(c.tracks).map(([k, v]) => `<div class="hb"><span>${esc(TN[k] || k)}</span><div class="t"><i style="width:${pct(v, maxT)}%"></i></div><b>${num(v)}</b></div>`).join('')}
        <div class="hb or"><span>Sem trilha ainda</span><div class="t"><i style="width:${pct(c.noTrack, maxT)}%"></i></div><b>${num(c.noTrack)}</b></div>
        <div class="sec" style="margin-top:14px">Gênero (informado no cadastro)</div>
        ${[['Feminino', c.sex.f, ''], ['Masculino', c.sex.m, ''], ['Não informou', c.sex.none, 'or']].map(([n, v, k]) => `<div class="hb ${k}"><span>${n}</span><div class="t"><i style="width:${pct(v, c.total)}%"></i></div><b>${num(v)}</b></div>`).join('')}
        <div class="sec" style="margin-top:14px">Personagem que guia</div>
        ${[['Tay', c.guides.tay, ''], ['Cut', c.guides.cut, ''], ['Ainda não escolheu', c.guides.none, 'or']].map(([n, v, k]) => `<div class="hb ${k}"><span>${n}</span><div class="t"><i style="width:${pct(v, c.total)}%"></i></div><b>${num(v)}</b></div>`).join('')}
        <div class="bdgs" style="margin-top:14px"><span class="bdg ok">${num(c.verified)} e-mail confirmado</span><span class="bdg warn">${num(c.unverified)} sem confirmar</span><span class="bdg blue">${num(c.google)} com Google</span>${c.unlocked ? `<span class="bdg or">${num(c.unlocked)} com curso liberado</span>` : ''}${c.banned ? `<span class="bdg err">${num(c.banned)} suspensa(s)</span>` : ''}</div></div></div>`;
  },

  // ---------------------------------------------------------------- usuários
  async users(m) {
    const u = ST.users, qs = new URLSearchParams({ q: u.q, track: u.track, status: u.status, sort: u.sort, dir: u.dir, page: u.page, size: 25 });
    const d = await api('users?' + qs); u.page = d.page;
    const th = (k, label, cls = '') => `<th class="${cls}" data-sort="${k}">${label}${u.sort === k ? `<span class="ar"> ${u.dir === 'asc' ? '↑' : '↓'}</span>` : ''}</th>`;
    const status = [['', 'Todos'], ['started', 'Já estudaram'], ['never', 'Nunca estudaram'], ['active7', 'Ativos (7 dias)'], ['inactive7', 'Sumidos (7+ dias)'], ['unverified', 'E-mail sem confirmar'], ['verified', 'E-mail confirmado'], ['google', 'Entram com Google'], ['unlocked', 'Curso liberado'], ['cert', 'Com certificado'], ['banned', 'Suspensos']];
    m.innerHTML = head('Usuários', `<button class="btn blue sm" data-a="csv">${ic('down', 15)} Baixar CSV</button>`) + `
    <div class="tools"><div style="position:relative;flex:1;min-width:220px;max-width:340px"><input class="in" id="uq" placeholder="Buscar por nome ou e-mail" value="${esc(u.q)}" style="padding-left:38px;max-width:none"><span style="position:absolute;left:12px;top:11px;color:var(--mute)">${ic('search', 18)}</span></div>
      <select class="sel" id="ut"><option value="">Todas as trilhas</option>${Object.entries(TN).map(([k, v]) => `<option value="${k}"${u.track === k ? ' selected' : ''}>${v}</option>`).join('')}<option value="none"${u.track === 'none' ? ' selected' : ''}>Sem trilha</option></select>
      <select class="sel" id="us">${status.map(s => `<option value="${s[0]}"${u.status === s[0] ? ' selected' : ''}>${s[1]}</option>`).join('')}</select>
      <span class="mut sm" style="margin-left:auto"><b>${num(d.total)}</b> usuário(s)</span></div>
    <div class="card" style="padding:8px 14px 14px"><div class="tw"><table><thead><tr>${th('name', 'Usuário')}<th class="hide-m">Trilha</th>${th('lessons', 'Lições', 'r hide-m')}${th('xp', 'XP', 'r hide-m')}${th('created', 'Cadastro', 'hide-m')}${th('seen', 'Último acesso', 'hide-m')}<th>Situação</th></tr></thead><tbody>
      ${d.rows.map(r => `<tr data-a="open" data-id="${esc(r.id)}"><td><div class="who"><span class="av">${esc((r.name || '?').trim().charAt(0))}</span><div><b>${esc(r.name)}</b><span>${esc(r.email)}</span></div></div></td>
        <td class="hide-m">${r.track ? `<span class="bdg blue">${esc(TN[r.track] || r.track)}</span>` : '<span class="mut xs">—</span>'}</td><td class="n hide-m">${num(r.lessons)}</td><td class="n hide-m">${num(r.xp)}</td><td class="sm hide-m" title="${esc(dt(r.created))}">${esc(ago(r.created))}</td><td class="sm hide-m" title="${esc(dt(r.seen))}">${esc(ago(r.seen || r.created))}</td>
        <td><div class="bdgs">${r.banned ? '<span class="bdg err">Suspenso</span>' : ''}${r.unlock.length ? '<span class="bdg or">Curso liberado</span>' : ''}${r.verified ? '' : '<span class="bdg warn">Sem confirmar</span>'}${r.google ? '<span class="bdg blue">Google</span>' : ''}${r.certs ? `<span class="bdg ok">${ic('award', 11)} ${r.certs}</span>` : ''}</div></td></tr>`).join('')}
      </tbody></table></div>${d.rows.length ? '' : '<div class="empty">Nenhum usuário com esses filtros.</div>'}
      <div class="pager"><span>Página ${d.page} de ${d.pages}</span><div class="row"><button class="btn sm" data-a="pg" data-d="-1" ${d.page <= 1 ? 'disabled' : ''}>← Anterior</button><button class="btn sm" data-a="pg" data-d="1" ${d.page >= d.pages ? 'disabled' : ''}>Próxima →</button></div></div></div>`;
    let tm; $('#uq').oninput = e => { clearTimeout(tm); tm = setTimeout(() => { u.q = e.target.value.trim(); u.page = 1; go('users').then(() => { const i = $('#uq'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }); }, 350); };
    $('#ut').onchange = e => { u.track = e.target.value; u.page = 1; go('users'); }; $('#us').onchange = e => { u.status = e.target.value; u.page = 1; go('users'); };
  },

  // ---------------------------------------------------------------- aprendizado
  async learning(m) {
    const d = await api('learning');
    const lr = r => `<tr class="nohov"><td><b>${esc(r.title)}</b><div class="xs mut">${esc(TN[r.track] || r.track)} · ${esc(LV[r.lv - 1] || '')} · ${r.fin ? 'prova final do nível' : r.cp ? 'checkpoint após a lição ' + r.n : 'lição ' + r.n}</div></td><td class="n">${num(r.started)}</td><td class="n">${num(r.done)}</td><td class="n"><span class="bdg ${r.stuck ? 'warn' : 'ok'}">${num(r.stuck)}</span></td><td class="n">${r.avgTries.toLocaleString('pt-BR')}</td></tr>`;
    const tb = rows => `<div class="tw"><table><thead><tr><th>Lição</th><th class="r">Tentaram</th><th class="r">Concluíram</th><th class="r">Travados</th><th class="r">Tentativas (média)</th></tr></thead><tbody>${rows.map(lr).join('')}</tbody></table></div>`;
    m.innerHTML = head('Aprendizado') + `<p class="mut" style="margin:-8px 0 16px">Descubra onde os alunos empacam. “Travados” são os que já tentaram a lição e ainda não concluíram. Lição com muitos travados costuma pedir uma dica melhor ou uma explicação mais simples.</p>
    <div class="card"><h3>${ic('flame', 18)} Onde os alunos mais travam</h3>${d.stuck.length ? tb(d.stuck) : '<div class="empty">Ainda não há tentativas suficientes.</div>'}</div>
    <div class="card" style="margin-top:16px"><h3>${ic('bolt', 18)} Lições que mais exigem tentativas</h3>${d.hardest.length ? tb(d.hardest) : '<div class="empty">Sem dados ainda.</div>'}</div>
    <div class="card" style="margin-top:16px"><h3>${ic('cap', 18)} Prova final por nível</h3><div class="tw"><table><thead><tr><th>Prova</th><th class="r">Aprovados</th><th class="r">Reprovações (3 chances gastas)</th><th class="r">Taxa de aprovação</th></tr></thead><tbody>
      ${d.exams.map(e => `<tr class="nohov"><td><b>${esc(TN[e.track] || e.track)}</b> · ${esc(LV[e.lv - 1])}</td><td class="n">${num(e.passed)}</td><td class="n">${num(e.fails)}</td><td class="n">${e.passRate === null ? '<span class="mut">—</span>' : `<span class="bdg ${e.passRate >= 70 ? 'ok' : 'warn'}">${e.passRate}%</span>`}</td></tr>`).join('')}</tbody></table></div></div>`;
  },

  // ---------------------------------------------------------------- certificados
  async certs(m) {
    const d = await api('certs?q=' + encodeURIComponent(ST.certQ));
    m.innerHTML = head('Certificados') + `<div class="tools"><div style="position:relative;flex:1;max-width:340px"><input class="in" id="cq" placeholder="Código, nome ou e-mail" value="${esc(ST.certQ)}" style="padding-left:38px"><span style="position:absolute;left:12px;top:11px;color:var(--mute)">${ic('search', 18)}</span></div><span class="mut sm" style="margin-left:auto"><b>${num(d.total)}</b> certificado(s)</span></div>
    <div class="card" style="padding:8px 14px 14px"><div class="tw"><table><thead><tr><th>Código</th><th>Nome no certificado</th><th>E-mail</th><th>Trilha</th><th>Emitido em</th><th>Situação</th><th></th></tr></thead><tbody>
      ${d.rows.map(c => `<tr class="nohov"><td class="mono">${esc(c.code)}</td><td><b>${esc(c.name)}</b></td><td class="sm">${esc(c.email)}</td><td>${esc(TN[c.track] || c.track)}</td><td class="sm">${esc(dd(c.date))}</td>
        <td>${c.revoked ? `<span class="bdg err" title="${esc(c.revoked.reason || '')}">Revogado</span>` : '<span class="bdg ok">Válido</span>'}</td>
        <td class="r"><a class="btn sm ghost" href="/certificado/${esc(c.code)}" target="_blank" rel="noopener">${ic('ext', 14)}</a> <button class="btn sm ${c.revoked ? 'ghost' : 'danger'}" data-a="${c.revoked ? 'restore-cert' : 'revoke-cert'}" data-code="${esc(c.code)}">${c.revoked ? 'Restaurar' : 'Revogar'}</button></td></tr>`).join('')}</tbody></table></div>${d.rows.length ? '' : '<div class="empty">Nenhum certificado ainda.</div>'}</div>`;
    let tm; $('#cq').oninput = e => { clearTimeout(tm); tm = setTimeout(() => { ST.certQ = e.target.value.trim(); go('certs').then(() => { const i = $('#cq'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }); }, 350); };
  },

  // ---------------------------------------------------------------- ajustes
  async settings(m) {
    const s = await api('settings'), an = s.announce, ad = s.ads;
    m.innerHTML = head('Ajustes') + `<div class="grid g2e">
    <div class="card"><h3>${ic('users', 18)} Cadastros</h3><div class="row"><label class="sw"><input type="checkbox" id="so" ${s.signupsOpen ? 'checked' : ''}><i></i></label><div class="grow"><b>${s.signupsOpen ? 'Cadastros abertos' : 'Cadastros fechados'}</b><div class="mut sm">Fechando, ninguém novo consegue criar conta (nem pelo Google). Quem já tem conta continua entrando normalmente.</div></div></div></div>
    <div class="card"><h3>${ic('unlock', 18)} Modo livre <small>${s.unlockAll.on ? '<span class="bdg warn">LIGADO</span>' : '<span class="bdg">desligado</span>'}</small></h3>
      <p class="mut sm" style="margin:0 0 10px">Libera todos os cursos para <b>todos</b> os alunos: sem bloqueio de nível, sequência ou checkpoint. Bom para uma semana promocional ou uma demonstração. Os certificados continuam exigindo as 3 provas.</p>
      ${s.unlockAll.on ? `<p class="sm">${s.unlockAll.until ? 'Desliga sozinho em <b>' + esc(dt(s.unlockAll.until)) + '</b>.' : 'Sem prazo para acabar.'}</p><button class="btn danger" data-a="free-off">Desligar o modo livre</button>`
        : `<div class="row"><select class="sel" id="fd" style="max-width:200px"><option value="1">Por 1 dia</option><option value="7" selected>Por 7 dias</option><option value="30">Por 30 dias</option><option value="0">Sem prazo</option></select><button class="btn pri" data-a="free-on">${ic('unlock', 16)} Ligar</button></div>`}</div></div>
    <div class="card" style="margin-top:16px"><h3>${ic('mega', 18)} Comunicado para os alunos <small>${an.on ? '<span class="bdg ok">NO AR</span>' : '<span class="bdg">desligado</span>'}</small></h3>
      <p class="mut sm" style="margin:0 0 10px">Aparece como um aviso no topo da tela inicial do app. O aluno pode fechar; se você mudar o texto, ele volta a aparecer. Use para novidades, manutenção e promoções.</p>
      <div class="grid g2e" style="align-items:start"><div><textarea class="in" id="at" maxlength="280" placeholder="Ex.: Chegou a trilha de Dados! Abra a aba Trilhas para conhecer.">${esc(an.text)}</textarea><div class="row" style="margin-top:10px"><select class="sel" id="ak" style="max-width:180px"><option value="info"${an.kind === 'info' ? ' selected' : ''}>Informação (azul)</option><option value="ok"${an.kind === 'ok' ? ' selected' : ''}>Novidade (verde)</option><option value="warn"${an.kind === 'warn' ? ' selected' : ''}>Aviso (amarelo)</option></select><span class="xs mut" id="ac"></span><span class="grow"></span>${an.on ? '<button class="btn ghost" data-a="ann-off">Desligar</button>' : ''}<button class="btn pri" data-a="ann-on">${an.on ? 'Atualizar' : 'Publicar'}</button></div></div>
        <div><div class="xs mut b" style="text-transform:uppercase;letter-spacing:.7px;margin-bottom:6px">Prévia</div><div id="apv"></div></div></div></div>
    <div class="card" style="margin-top:16px"><h3>${ic('coin', 18)} Anúncios (Google AdSense) <small>${ad.on ? '<span class="bdg ok">LIGADOS</span>' : '<span class="bdg">desligados</span>'}</small></h3>
      <p class="mut sm" style="margin:0 0 12px">O CodeUp é gratuito e ganha com anúncios. Cole aqui os dados do seu AdSense e ligue: vale na hora, sem mexer no servidor. Os anúncios aparecem só em telas de pausa (início, trilhas, perfil e fim de lição), <b>nunca durante a lição ou a prova</b>. O aluno não escolhe nada: os anúncios são sempre <b>não personalizados</b> (não usam o histórico de navegação dele) e o aviso de cookies tem só o botão “Entendi”.</p>
      ${ad.on && !ad.slot ? `<div class="al warn" style="margin-bottom:12px">${ic('info', 18)}<div class="grow"><b>Falta o ID do bloco de anúncios.</b> Já dá para o Google verificar o site, mas os quadros de anúncio ainda não aparecem no app (veja o passo 4 ao lado).</div></div>` : ''}
      <div class="grid g2e" style="align-items:start">
        <div>
          <div class="xs mut b" style="margin-bottom:4px">Colar o código do Google <span style="font-weight:600">(opcional)</span></div>
          <textarea class="in mono" id="adcode" style="min-height:70px" placeholder='Cole aqui o código que o AdSense gerou (começa com &lt;script async src=&quot;…adsbygoogle.js?client=ca-pub-…). Eu separo os números para você.'></textarea>
          <div class="xs mut" id="adfound" style="min-height:18px;margin:4px 0 8px"></div>
          <div class="xs mut b" style="margin-bottom:4px">ID do editor</div><input class="in mono" id="adc" maxlength="40" placeholder="ca-pub-0000000000000000" value="${esc(ad.client)}" autocomplete="off" spellcheck="false">
          <div class="xs mut b" style="margin:10px 0 4px">ID do bloco de anúncios</div><input class="in mono" id="ads" maxlength="24" placeholder="0000000000" value="${esc(ad.slot)}" autocomplete="off" spellcheck="false" inputmode="numeric">
          <div class="row" style="margin-top:14px"><label class="sw"><input type="checkbox" id="adon" ${ad.on ? 'checked' : ''}><i></i></label><div class="grow"><b>Mostrar anúncios no app</b></div></div>
          <div class="row" style="margin-top:12px"><button class="btn pri" data-a="ad-save">${ic('check', 16)} Salvar</button>${ad.from === 'painel' ? '<button class="btn ghost" data-a="ad-reset">Voltar ao padrão do servidor</button>' : ''}</div>
          <p class="xs mut" style="margin:10px 0 0">${ad.from === 'painel' ? 'Definido aqui no painel.' : ad.from === 'ambiente' ? 'Hoje vem do servidor (variável ADSENSE_CLIENT). O que você salvar aqui passa a valer no lugar dela.' : 'Ainda não configurado.'}${ad.adsTxt ? ` O arquivo <a href="${esc(ad.adsTxt)}" target="_blank" rel="noopener">ads.txt</a> é gerado sozinho com o seu ID.` : ''}</p>
        </div>
        <div><div class="xs mut b" style="text-transform:uppercase;letter-spacing:.7px;margin-bottom:6px">Como ligar, passo a passo</div>
          <ol class="sm" style="margin:0;padding-left:20px;line-height:1.5">
            <li>Crie a conta em <b>adsense.google.com</b> e adicione o endereço do site. O Google só aprova sites públicos, com Termos e Privacidade (o CodeUp já tem as duas páginas).</li>
            <li>No AdSense, em <b>Conta → Informações da conta</b>, copie o <b>ID do editor</b> (parece <span class="mono">pub-1234567890123456</span>), cole aqui e ligue. A página inicial passa a levar a meta tag de verificação e o <span class="mono">ads.txt</span> fica no ar.</li>
            <li>No AdSense, em <b>Sites</b>, peça a verificação pelo método <b>Metatag</b> (ou ads.txt). A aprovação do Google leva de alguns dias a algumas semanas.</li>
            <li>Depois de aprovado: <b>Anúncios → Por bloco de anúncios → Display responsivo</b>, crie o bloco e copie o número do <span class="mono">data-ad-slot</span> para o campo <b>ID do bloco</b>.</li>
            <li>Deixe os <b>Anúncios automáticos</b> desligados no AdSense: assim os anúncios aparecem só onde o app escolheu.</li>
          </ol></div></div></div>`;
    const parseAd = () => { const t = $('#adcode').value, c = (t.match(/ca-pub-\d{10,20}/) || t.match(/\bpub-\d{10,20}/) || [])[0], sl = (t.match(/data-ad-slot\s*=\s*["']?(\d{6,20})/) || [])[1];
      if (c) $('#adc').value = c.startsWith('ca-') ? c : 'ca-' + c; if (sl) $('#ads').value = sl;
      $('#adfound').textContent = !t.trim() ? '' : c || sl ? 'Achei: ' + [c && 'ID do editor ' + (c.startsWith('ca-') ? c : 'ca-' + c), sl && 'bloco ' + sl].filter(Boolean).join(' e ') + '. Confira os campos abaixo e salve.' : 'Não achei nenhum ID nesse texto.'; };
    $('#adcode').oninput = parseAd;
    const pv = () => { const t = $('#at').value.trim(), k = $('#ak').value; $('#ac').textContent = `${$('#at').value.length}/280`; $('#apv').innerHTML = t ? `<div class="al ${k}" style="align-items:flex-start">${ic(k === 'ok' ? 'check' : 'info', 18)}<div class="grow">${esc(t)}</div></div>` : '<div class="mut sm">Escreva o texto para ver como fica.</div>'; };
    $('#at').oninput = pv; $('#ak').onchange = pv; pv();
    $('#so').onchange = async e => { try { await api('settings', { body: { signupsOpen: e.target.checked } }); toast(e.target.checked ? 'Cadastros abertos.' : 'Cadastros fechados.'); go('settings'); } catch (er) { fail(er); e.target.checked = !e.target.checked; } };
  },

  // ---------------------------------------------------------------- sistema
  async system(m) {
    const s = await api('system'), it = (st, t, d) => `<div class="sysi ${st}"><span class="dot"></span><div><b>${esc(t)}</b><span>${d}</span></div></div>`, up = s.uptime;
    m.innerHTML = head('Sistema') + `<p class="mut" style="margin:-8px 0 16px">Confira se tudo que o app precisa está ligado. Amarelo é um aviso, vermelho é algo que atrapalha os alunos.</p><div class="sys">
      ${it(s.db === 'PostgreSQL' ? 'ok' : s.prod ? 'err' : 'warn', 'Banco de dados: ' + s.db, s.db === 'PostgreSQL' ? 'Os dados ficam seguros no PostgreSQL.' : s.prod ? 'Em produção os dados precisam ficar no PostgreSQL (defina DATABASE_URL); arquivos podem ser apagados quando o servidor reinicia.' : 'Gravando em arquivo (ok no seu computador). Em produção use o PostgreSQL.')}
      ${it(s.mail ? 'ok' : 'warn', 'E-mail', s.mail ? 'Configurado: confirmação de e-mail e recuperação de senha funcionam.' : 'Não configurado. Sem ele, ninguém recebe o e-mail de confirmação nem de “esqueci a senha”. Defina RESEND_API_KEY ou SMTP_*.')}
      ${it(s.google ? 'ok' : 'warn', 'Login com Google', s.google ? 'Ligado.' : 'Desligado (opcional). Defina GOOGLE_CLIENT_ID para mostrar o botão.')}
      ${it(s.ads === 'on' ? (s.adsSlot ? 'ok' : 'warn') : 'warn', 'Anúncios (AdSense)', s.ads === 'on' ? (s.adsSlot ? `Ligados (<span class="mono">${esc(s.adsClient)}</span>, ${s.adsFrom === 'painel' ? 'definido no painel' : 'definido no servidor'}).` : 'Ligados, mas falta o ID do bloco: os quadros ainda não aparecem. <a href="#" data-tab="settings">Abrir Ajustes</a>.') : s.ads === 'preview' ? 'Em prévia (só para teste).' : 'Desligados: o app é gratuito, então os anúncios são a sua receita. <a href="#" data-tab="settings">Ligue em Ajustes → Anúncios</a>.')}
      ${it(s.pyServer ? 'ok' : 'err', 'Correção de Python no servidor', s.pyServer ? 'Ativa: o código do aluno roda em ambiente restrito.' : 'Desativada (sem python3). O resultado vem do navegador do aluno e pode ser forjado.')}
      ${it(s.sqlServer === true ? 'ok' : s.sqlServer === false ? 'err' : 'warn', 'Correção de SQL no servidor', s.sqlServer === true ? 'Ativa.' : s.sqlServer === false ? 'Falhou no autoteste. Rode “npm install” e reinicie.' : 'Ainda testando…')}
      ${it(s.prod ? 'ok' : 'warn', s.prod ? 'Modo produção' : 'Modo de teste', s.prod ? 'NODE_ENV=production.' : 'Você está rodando localmente. Tudo bem para testar.')}
      ${it(/^https:/.test(s.base) || !s.prod ? 'ok' : 'err', 'Endereço do site (BASE_URL)', `<span class="mono">${esc(s.base)}</span>${/^https:/.test(s.base) || !s.prod ? '' : '<br>Em produção use https://.'}`)}
      ${it(s.adminHost || !s.prod ? 'ok' : 'warn', 'Endereço do painel', s.adminHost ? `Só abre em <span class="mono">${esc(s.adminHost)}</span>; no site público ele não existe.` : s.prod ? 'Abre no mesmo endereço do site (…/admin). Para separar, defina ADMIN_HOST=admin.seu-dominio.com.br (veja o README).' : 'No seu computador tudo fica no mesmo endereço. Tudo bem.')}
      ${it(s.keyFromEnv ? 'ok' : 'warn', 'Acesso do admin', s.keyFromEnv ? (s.emailFromEnv ? 'Entrada fixa com e-mail e senha (ADMIN_EMAIL e ADMIN_PASSWORD, variáveis do servidor).' : 'Vem de ADMIN_KEY (variável do servidor).') : 'Chave temporária gerada para este computador. Para fixar a sua, defina ADMIN_EMAIL e ADMIN_PASSWORD (ou só ADMIN_KEY) no .env.')}
      ${it(s.twofa ? 'ok' : s.twofaStored ? 'warn' : s.prod ? 'warn' : 'ok', 'Autenticador (código de 6 dígitos)', s.twofa ? `Ligado: o painel pede ${s.twofaKey ? 'a chave e o código' : 'só o código'} do aplicativo autenticador. <a href="#" data-a="2fa-off">Desligar</a>` : s.twofaStored ? 'Está ligado, mas a variável ADMIN_2FA_OFF no servidor desliga a exigência. Tire a variável e reinicie para voltar a usar.' : 'Desligado: só a chave protege o painel. <a href="#" data-a="2fa-on">Ligar o autenticador</a> (Google Authenticator, Microsoft Authenticator, Authy…).')}</div>
    <div class="card" style="margin-top:16px"><h3>Números do servidor</h3><dl class="kv"><dt>Usuários</dt><dd>${num(s.users)}</dd><dt>Sessões abertas</dt><dd>${num(s.sessions)}</dd><dt>Certificados</dt><dd>${num(s.certs)}</dd><dt>Registros de auditoria</dt><dd>${num(s.audit)}</dd><dt>Memória em uso</dt><dd>${s.memMB} MB</dd><dt>Ligado há</dt><dd>${up >= 86400 ? Math.floor(up / 86400) + ' dia(s) ' : ''}${Math.floor(up % 86400 / 3600)} h ${Math.floor(up % 3600 / 60)} min</dd><dt>Node.js</dt><dd>${esc(s.node)}</dd><dt>Hora do servidor</dt><dd>${esc(dt(s.now, true))}</dd></dl></div>`;
  },

  // ---------------------------------------------------------------- auditoria
  async audit(m) {
    const d = await api('audit?limit=200');
    m.innerHTML = head('Auditoria') + `<p class="mut" style="margin:-8px 0 16px">Tudo o que foi feito pelo painel fica registrado aqui (últimos 200 registros).</p><div class="card" style="padding:8px 14px 14px"><div class="tw"><table><thead><tr><th>Quando</th><th>Ação</th><th>Sobre</th><th>Detalhe</th><th class="hide-m">IP</th></tr></thead><tbody>
      ${d.rows.map(r => `<tr class="nohov"><td class="sm" style="white-space:nowrap">${esc(dt(r.at))}</td><td><span class="bdg ${/falhou|excluiu|suspendeu|revogou/.test(r.action) ? 'err' : /liberou|login$/.test(r.action) ? 'or' : 'blue'}">${esc(String(r.action).replace(/-/g, ' '))}</span></td><td class="sm">${esc(r.target)}</td><td class="sm mut">${esc(r.detail)}</td><td class="mono mut hide-m">${esc(r.ip)}</td></tr>`).join('')}</tbody></table></div>${d.rows.length ? '' : '<div class="empty">Nada registrado ainda.</div>'}</div>`;
  }
};

// ---------------------------------------------------------------- gaveta do usuário
function closeUser() { ST.open = null; const d = $('#dr'), o = $('#ov'); if (d) d.classList.remove('on'); if (o) o.classList.remove('on'); }
async function openUser(id) {
  ST.open = id; $('#ov').classList.add('on'); const d = $('#dr'); d.classList.add('on'); d.innerHTML = '<div class="load"><span class="spin"></span></div>';
  try { drawUser(await api('users/' + encodeURIComponent(id))); } catch (e) { fail(e); closeUser(); }
}
function drawUser(u) {
  const d = $('#dr'), tr = Object.entries(u.byTrack), allOn = tr.every(([, t]) => t.unlocked);
  d.innerHTML = `<div class="top"><span class="av big">${esc((u.name || '?').trim().charAt(0))}</span><div class="grow"><h2>${esc(u.name)}</h2><div class="mut sm">${esc(u.email)}</div>
      <div class="bdgs" style="margin-top:6px">${u.banned ? '<span class="bdg err">Suspenso</span>' : ''}${u.unlock.length ? '<span class="bdg or">Curso liberado</span>' : ''}${u.verified ? '<span class="bdg ok">E-mail confirmado</span>' : '<span class="bdg warn">E-mail sem confirmar</span>'}${u.google ? '<span class="bdg blue">Google</span>' : ''}${u.hasPass ? '' : '<span class="bdg">Sem senha</span>'}</div></div>
      <button class="btn ghost sm x" data-a="close" aria-label="Fechar">${ic('x', 16)}</button></div>
    ${u.banned ? `<div class="note" style="border:1px solid #fb718566">${ic('ban', 14)} Suspenso em ${esc(dt(u.banned.at))}${u.banned.reason ? ': ' + esc(u.banned.reason) : ''}</div>` : ''}
    <div class="facts"><div class="fact"><small>XP</small><b>${num(u.xp)}</b></div><div class="fact"><small>Lições</small><b>${num(u.lessons)}</b></div><div class="fact"><small>Provas aprovadas</small><b>${num(u.passed)}</b></div>
      <div class="fact"><small>Sequência</small><b>${num(u.streak)} dia(s)</b></div><div class="fact"><small>Tentativas</small><b>${num(u.attempts)}</b></div><div class="fact"><small>Aparelhos logados</small><b>${num(u.sessions)}</b></div></div>
    <div class="sec">Acesso aos cursos</div><div class="acc"><p>Liberar tira os bloqueios de nível, de sequência e de checkpoint: a pessoa entra em qualquer lição e já pode fazer as provas. O certificado continua exigindo passar nas 3 provas de cada trilha.</p>
      <div class="acts">${tr.map(([k, t]) => `<button class="btn sm ${t.unlocked ? 'ok' : ''}" data-a="unlock" data-track="${k}" data-on="${t.unlocked ? 0 : 1}">${ic(t.unlocked ? 'check' : 'unlock', 15)} ${esc(t.name)}: ${t.unlocked ? 'liberado' : 'liberar'}</button>`).join('')}
      <button class="btn sm pri" data-a="unlock" data-track="all" data-on="${allOn ? 0 : 1}">${ic(allOn ? 'lock' : 'unlock', 15)} ${allOn ? 'Tirar liberação de tudo' : 'Liberar todos os cursos'}</button></div></div>
    <div class="sec">Progresso</div>${tr.map(([k, t]) => `<div class="trk"><h4>${esc(t.name)}${u.track === k ? ' <span class="bdg blue">trilha atual</span>' : ''}${t.cert ? ` <span class="bdg ok">${ic('award', 11)} certificado ${esc(t.cert.code)}</span>` : ''}</h4>
      ${t.levels.map(l => `<div class="lv"><span>${esc(LV[l.lv - 1])}</span><div class="t"><i style="width:${pct(l.done, l.total)}%"></i></div><span class="xs mut" style="white-space:nowrap;min-width:150px;text-align:right">${l.done}/${l.total} · ${l.cps}/${l.cpTotal} cp ${l.passed ? '· <b style="color:var(--ok)">prova ✓</b>' : l.fails ? `· ${l.fails} reprov.` : ''}</span></div>`).join('')}</div>`).join('')}
    <div class="sec">Conta</div><dl class="kv"><dt>Cadastro</dt><dd>${esc(dt(u.created, true))}</dd><dt>Último acesso</dt><dd>${esc(dt(u.seen))} <span class="mut">(${esc(ago(u.seen))})</span></dd><dt>Aceitou os termos</dt><dd>${esc(dt(u.accepted))}</dd><dt>Gênero</dt><dd>${u.sex === 'f' ? 'Feminino' : u.sex === 'm' ? 'Masculino' : '—'}</dd><dt>Personagem</dt><dd>${u.guide ? esc(u.guide === 'tay' ? 'Tay' : 'Cut') : '—'}</dd><dt>Gemas</dt><dd>${num(u.gems)}</dd><dt>ID</dt><dd class="mono">${esc(u.id)}</dd></dl>
    <div class="sec">Atividade recente</div>${u.recent.length ? u.recent.map(r => `<div class="rec"><span>${esc(r.title)}</span><span>${esc(ago(r.date))}</span></div>`).join('') : '<div class="mut sm">Ainda não concluiu nenhuma lição.</div>'}
    <div class="sec">Nota interna <span class="xs" style="text-transform:none;letter-spacing:0">(só você vê)</span></div>${u.note ? `<div class="note">${esc(u.note)}</div>` : ''}<div class="acts" style="margin-top:8px"><button class="btn sm" data-a="note">${ic('pencil', 14)} ${u.note ? 'Editar nota' : 'Adicionar nota'}</button></div>
    <div class="sec">Suporte</div><div class="acts">
      ${u.verified ? '' : `<button class="btn sm" data-a="verify">${ic('check', 14)} Confirmar e-mail</button><button class="btn sm" data-a="resend">${ic('mail', 14)} Reenviar confirmação</button>`}
      <button class="btn sm" data-a="resetlink">${ic('key', 14)} Gerar link de nova senha</button><button class="btn sm" data-a="logoutall">${ic('out', 14)} Encerrar sessões</button>
      <button class="btn sm" data-a="rename">${ic('pencil', 14)} Mudar nome</button><button class="btn sm" data-a="xp">${ic('bolt', 14)} Ajustar XP</button><button class="btn sm" data-a="resetlv">${ic('refresh', 14)} Zerar progresso</button></div>
    <div class="danger-z"><div class="acts">${u.banned ? `<button class="btn sm ok" data-a="unban">${ic('check', 14)} Reativar conta</button>` : `<button class="btn sm danger" data-a="ban">${ic('ban', 14)} Suspender conta</button>`}<button class="btn sm danger" data-a="del">${ic('trash', 14)} Excluir conta</button></div></div>`;
  ST.cur = u;
}
async function act(action, extra = {}, okMsg) {
  const u = ST.cur; if (!u) return;
  try { const r = await api(`users/${encodeURIComponent(u.id)}/action`, { body: { action, ...extra } }); if (r.deleted) { closeUser(); toast('Conta excluída.'); if (ST.tab === 'users' || ST.tab === 'overview') go(ST.tab); return r; } drawUser(r.user); toast(okMsg || 'Pronto.'); refreshBehind(); return r; }
  catch (e) { fail(e); }
}
const refreshBehind = () => { if (ST.tab === 'users' || ST.tab === 'overview') { const y = window.scrollY; VIEWS[ST.tab]($('#main')).then(() => window.scrollTo(0, y)).catch(() => { }); } };
const showLink = (title, link) => ask({ title, text: 'Copie e envie para a pessoa (WhatsApp, e-mail...). Vale por pouco tempo e só pode ser usado uma vez.', html: `<div class="pre mono">${esc(link)}</div>`, ok: 'Copiar link' }).then(async v => { if (v) { try { await navigator.clipboard.writeText(link); toast('Link copiado.'); } catch { toast('Selecione o link e copie à mão.', true); } } });

// ---------------------------------------------------------------- cliques
const H = {
  logout: () => logout(), reload: () => go(ST.tab), close: () => closeUser(),
  open: t => openUser(t.dataset.id),
  pg: t => { ST.users.page += +t.dataset.d; go('users'); },
  csv: async () => { try { const u = ST.users, r = await api('users.csv?' + new URLSearchParams({ q: u.q, track: u.track, status: u.status, sort: u.sort, dir: u.dir }), { raw: true }), b = await r.blob(), a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `usuarios-codeup-${new Date().toISOString().slice(0, 10)}.csv`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); } catch (e) { fail(e); } },
  unlock: async t => {
    const on = t.dataset.on === '1', tk = t.dataset.track, nm = tk === 'all' ? 'todos os cursos' : (TN[tk] || tk);
    if (on) { const v = await ask({ title: 'Liberar ' + nm + '?', text: `${ST.cur.name} poderá abrir qualquer lição e fazer as provas sem cumprir os bloqueios.`, ok: 'Liberar' }); if (!v) return; }
    act('unlock', { tracks: tk === 'all' ? 'all' : [tk], on }, on ? 'Curso liberado. A pessoa vê na hora ao abrir o app (ou em até 1 minuto, se já estiver com ele aberto).' : 'Liberação removida.');
  },
  ban: async () => { const v = await ask({ title: 'Suspender conta?', text: 'A pessoa é desconectada na hora e não consegue mais entrar. Dá para reativar depois.', fields: [{ id: 'reason', label: 'Motivo (só você vê)', type: 'text', ph: 'Ex.: abuso, pedido do próprio aluno...' }], ok: 'Suspender', danger: true }); if (v) act('ban', { reason: v.reason }, 'Conta suspensa.'); },
  unban: () => act('unban', {}, 'Conta reativada.'),
  verify: () => act('verify', {}, 'E-mail confirmado.'),
  resend: async () => { const r = await act('resend-verify', {}, 'Confirmação reenviada.'); if (r && r.link && !location.protocol.startsWith('https')) showLink('Link de confirmação', r.link); },
  resetlink: async () => { const r = await act('reset-link', {}, 'Link gerado.'); if (r && r.link) showLink('Link para criar nova senha', r.link); },
  logoutall: async () => { if (await ask({ title: 'Encerrar sessões?', text: 'Desconecta a pessoa de todos os aparelhos.', ok: 'Encerrar' })) act('logout', {}, 'Sessões encerradas.'); },
  rename: async () => { const v = await ask({ title: 'Mudar nome', fields: [{ id: 'name', label: 'Nome (até 30 letras)', value: ST.cur.name }], ok: 'Salvar' }); if (v) act('rename', { name: v.name }, 'Nome atualizado.'); },
  xp: async () => { const v = await ask({ title: 'Ajustar XP', text: `XP atual: ${num(ST.cur.xp)}.`, fields: [{ id: 'mode', label: 'O que fazer', type: 'select', value: 'add', options: [['add', 'Somar (use negativo para tirar)'], ['set', 'Definir o valor exato']] }, { id: 'value', label: 'Valor', type: 'number', value: '50' }], ok: 'Aplicar' }); if (v) act('xp', { mode: v.mode, value: v.value }, 'XP atualizado.'); },
  note: async () => { const v = await ask({ title: 'Nota interna', fields: [{ id: 'text', label: 'Anotação (o aluno não vê)', type: 'textarea', value: ST.cur.note, max: 500 }], ok: 'Salvar' }); if (v) act('note', { text: v.text }, 'Nota salva.'); },
  resetlv: async () => { const v = await ask({ title: 'Zerar progresso', text: 'Devolve lições, checkpoints e prova ao começo. O XP já ganho não muda. Use para ajudar quem pediu para recomeçar.', fields: [{ id: 'track', label: 'Trilha', type: 'select', value: ST.cur.track || 'python', options: Object.entries(TN) }, { id: 'level', label: 'Nível', type: 'select', value: 'all', options: [['all', 'Todos os níveis'], [1, 'Básico'], [2, 'Intermediário'], [3, 'Avançado']] }], ok: 'Zerar', danger: true }); if (v) act('reset-level', { track: v.track, level: v.level }, 'Progresso zerado.'); },
  del: async () => { const v = await ask({ title: 'Excluir conta?', text: 'Apaga a conta, o progresso e os certificados. Não dá para desfazer. Digite o e-mail da pessoa para confirmar.', fields: [{ id: 'confirm', label: ST.cur.email, ph: 'Digite o e-mail' }], ok: 'Excluir para sempre', danger: true }); if (v) act('delete', { confirm: v.confirm }); },
  'revoke-cert': async t => { const v = await ask({ title: 'Revogar certificado?', text: 'A página pública do certificado passa a dizer que ele não é mais válido.', fields: [{ id: 'reason', label: 'Motivo', ph: 'Ex.: fraude' }], ok: 'Revogar', danger: true }); if (v) try { await api('certs/' + encodeURIComponent(t.dataset.code), { body: { revoke: true, reason: v.reason } }); toast('Certificado revogado.'); go('certs'); } catch (e) { fail(e); } },
  'restore-cert': async t => { try { await api('certs/' + encodeURIComponent(t.dataset.code), { body: { revoke: false } }); toast('Certificado restaurado.'); go('certs'); } catch (e) { fail(e); } },
  'free-on': async () => { const d = +$('#fd').value; if (!await ask({ title: 'Ligar o modo livre?', text: 'Todos os alunos passam a ter todos os cursos liberados' + (d ? ` por ${d} dia(s).` : ', sem prazo.'), ok: 'Ligar' })) return; try { await api('settings', { body: { unlockAll: { on: true, days: d } } }); toast('Modo livre ligado.'); go('settings'); } catch (e) { fail(e); } },
  'free-off': async () => { try { await api('settings', { body: { unlockAll: { on: false } } }); toast('Modo livre desligado.'); go('settings'); } catch (e) { fail(e); } },
  'ann-on': async () => { try { await api('settings', { body: { announce: { on: true, text: $('#at').value, kind: $('#ak').value } } }); toast('Comunicado publicado.'); go('settings'); } catch (e) { fail(e); } },
  'ad-save': async () => {
    const on = $('#adon').checked, client = $('#adc').value.trim(), slot = $('#ads').value.trim();
    try { await api('settings', { body: { ads: { on, client, slot } } }); toast(on ? (slot ? 'Anúncios ligados.' : 'Ligado. Falta o ID do bloco para os quadros aparecerem.') : 'Salvo. Os anúncios estão desligados.'); go('settings'); } catch (e) { fail(e); }
  },
  'ad-reset': async () => { if (!await ask({ title: 'Voltar ao padrão do servidor?', text: 'Apaga o que foi salvo aqui. Os anúncios passam a seguir as variáveis ADSENSE_CLIENT e ADSENSE_SLOT do servidor (se não existirem, ficam desligados).', ok: 'Voltar ao padrão' })) return; try { await api('settings', { body: { ads: { reset: true } } }); toast('Voltou ao padrão do servidor.'); go('settings'); } catch (e) { fail(e); } },
  '2fa-on': async () => {
    let s; try { s = await api('2fa/start', { body: {} }); } catch (e) { return fail(e); }
    const html = `<div class="qrbox">${s.svg}</div><p class="qrtx"><b>1.</b> No celular, abra o aplicativo autenticador (Google Authenticator, Microsoft Authenticator, Authy…).<br><b>2.</b> Toque em <b>+</b> e escaneie o QR Code acima.<br><b>3.</b> Digite aqui o código de 6 dígitos que aparecer no app.<br><span class="qrsm">Sem câmera, ou abrindo o painel no próprio celular? Use os botões abaixo ou digite esta chave no app: <span class="mono">${esc(s.pretty)}</span></span></p>
      <div class="qrbt"><a class="btn ghost" href="${esc(s.uri)}">Abrir no app autenticador</a><button type="button" class="btn ghost" data-q="copy">Copiar chave</button><a class="btn ghost" target="_blank" rel="noopener" href="https://wa.me/${s.wa || ''}?text=${encodeURIComponent('Chave do autenticador do painel CodeUp (apague esta mensagem depois de colar no app):\n' + s.secret)}">Enviar pelo WhatsApp</a></div>
      <p class="qrsm">No app: <b>+</b> → <b>Inserir chave de configuração</b> → cole a chave (tipo: baseado em tempo). Depois de ligar, <b>apague a mensagem</b> do WhatsApp: quem tiver essa chave gera os seus códigos.</p>`;
    const pr = ask({ title: 'Ligar o autenticador', html, fields: [{ id: 'code', label: 'Código de 6 dígitos', ph: '000 000' }, { id: 'mode', label: 'Como entrar no painel', type: 'select', value: '1', options: [['1', 'Chave + código (mais seguro, recomendado)'], ['0', 'Só o código (mais prático)']] }], ok: 'Ligar' });
    const md = [...document.querySelectorAll('.md')].pop();
    if (md) md.addEventListener('click', async e => {
      if (!e.target.closest('[data-q="copy"]')) return;
      const okc = () => toast('Chave copiada. Cole no app autenticador.');
      try { await navigator.clipboard.writeText(s.secret); okc(); }
      catch { const t = document.createElement('textarea'); t.value = s.secret; document.body.appendChild(t); t.select(); try { document.execCommand('copy') ? okc() : toast('Não consegui copiar: digite a chave mostrada acima.', true); } catch { toast('Não consegui copiar: digite a chave mostrada acima.', true); } t.remove(); }
    });
    const v = await pr;
    if (!v) return;
    try { await api('2fa/enable', { body: { code: v.code, needKey: v.mode === '1' } }); toast('Autenticador ligado. Guarde o app: sem ele você só entra com a variável ADMIN_2FA_OFF (veja o README).'); go('system'); } catch (e) { fail(e); }
  },
  '2fa-off': async () => {
    const v = await ask({ title: 'Desligar o autenticador?', text: 'Depois disso o painel volta a pedir só a chave. Digite o código atual do aplicativo para confirmar (se acabou de entrar, espere o próximo código).', fields: [{ id: 'code', label: 'Código de 6 dígitos', ph: '000 000' }], ok: 'Desligar', danger: true });
    if (!v) return;
    try { await api('2fa/disable', { body: { code: v.code } }); toast('Autenticador desligado.'); go('system'); } catch (e) { fail(e); }
  },
  'ann-off': async () => { try { await api('settings', { body: { announce: { on: false, text: $('#at').value, kind: $('#ak').value } } }); toast('Comunicado desligado.'); go('settings'); } catch (e) { fail(e); } }
};
document.addEventListener('click', e => {
  const tb = e.target.closest('[data-tab]'); if (tb) { e.preventDefault(); return go(tb.dataset.tab); }
  const th = e.target.closest('th[data-sort]'); if (th) { const u = ST.users, k = th.dataset.sort; u.dir = u.sort === k && u.dir === 'desc' ? 'asc' : 'desc'; u.sort = k; u.page = 1; return go('users'); }
  if (e.target.id === 'ov') return closeUser();
  const a = e.target.closest('[data-a]'); if (a && H[a.dataset.a]) { e.preventDefault(); H[a.dataset.a](a, e); }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && ST.open && !$('.md')) closeUser(); });

// ---------------------------------------------------------------- início
(async function boot() {
  if (!ST.token) return showLogin();
  try { await api('ping'); shell(); } catch (e) { if (!e.silent) showLogin(); }
})();
