'use strict';
try { const sk = localStorage.getItem('skin'), cl = document.body.classList; if (sk === 'rose') cl.add('wild', 'rose'); else if (sk === 'neo') cl.add('neo'); else if (sk !== '') cl.add('wild'); } catch { document.body.classList.add('wild'); }   // Azul (a floresta azul) é o padrão; '' = Azul escuro; estilos antigos voltam para o Azul
const SQLJS_V = '1.10.3', PYO_V = '0.26.4';           // versões das bibliotecas que rodam no navegador
const $ = s => document.querySelector(s), A = $('#app');
const S = { tk: localStorage.tk || null, me: null, ls: [], cfg: { contact: '', company: 'CodeUp', ads: null }, cur: null, h: 0, hearts: 5, tries: 0, errs: 0, gained: 0, lvlUp: 0,
  tab: 'home', rkp: 'semana', rk: null, tierUp: 0, lv: 0, scroll: true, ex: null, auth: 'login', resetToken: null, SQL: null, pw: null, pyReady: false, busy: false };
const esc = t => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ============================================================ ÍCONES, MASCOTE E DESTAQUE DE CÓDIGO
const IC = {
  home: '<path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M10 20v-6h4v6"/>',
  map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H4v2a3 3 0 0 0 4 3M16 6h4v2a3 3 0 0 1-4 3"/><path d="M12 13v4M8 20h8M10 17h4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  play: '<path d="M7 4.5v15l12-7.5z" fill="currentColor"/>',
  bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.8 10.6c.7.7 1.1 1.5 1.1 2.4h5.4c0-.9.4-1.7 1.1-2.4A6 6 0 0 0 12 3z"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  heart: '<path d="M12 20.5s-8-5-8-10.7A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.8c0 5.7-8 10.7-8 10.7z"/>',
  flame: '<path d="M12 3s5.5 4 5.5 9.5a5.5 5.5 0 0 1-11 0c0-2 .8-3.3 2-4.5 0 2 1 3 2 3 .3-3-1-5 1.5-8z"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  cap: '<path d="m2 9 10-5 10 5-10 5z"/><path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5"/>',
  award: '<circle cx="12" cy="9" r="6"/><path d="m8.5 14-1.5 8 5-3 5 3-1.5-8"/>',
  db: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  code: '<path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  chart: '<path d="M4 20V4M4 20h16"/><path d="M8 16v-5M13 16V8M18 16v-9"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
  pencil: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
  eraser: '<path d="M4 17 15 6a2 2 0 0 1 3 0l1 1a2 2 0 0 1 0 3L10 19H6z"/><path d="M10 19h10"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M16 7l3 3"/>',
  down: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
  out: '<path d="M9 4H5v16h4M16 8l4 4-4 4M20 12H9"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  star: '<path d="m12 3 2.7 5.6 6.2.9-4.5 4.3 1.1 6.1L12 17l-5.5 2.9 1.1-6.1L3 9.5l6.2-.9z"/>',
  swap: '<path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>',
  flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  file: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 13h6M9 17h6"/>',
  crown: '<path d="m3 8 4.5 4L12 5l4.5 7L21 8l-2 11H5z"/><path d="M5 19h14"/>'
};
const ic = (n, s = 18) => `<svg class=i width=${s} height=${s} viewBox="0 0 24 24" fill=none stroke=currentColor stroke-width=1.8 stroke-linecap=round stroke-linejoin=round aria-hidden=true>${IC[n] || ''}</svg>`;
const LS = { get: k => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch { } } };
// Personagem que acompanha a pessoa: Tay (rosa, feminino) ou Cut (azul, masculino). A escolha fica na conta e neste aparelho.
const GUIDES = {
  tay: { name: 'Tay', sex: 'Feminino', art: 'a Tay', hi: 'Oi! Eu sou {n}. Vamos aprender {j}?', intro: 'Oi! Eu sou {n}, sua guia no CodeUp', sugg: ['Luna', 'Nina', 'Mel'] },
  cut: { name: 'Cut', sex: 'Masculino', art: 'o Cut', hi: 'E aí! Eu sou {n}. Bora aprender {j}?', intro: 'E aí! Eu sou {n}, seu guia no CodeUp', sugg: ['Bit', 'Max', 'Zeca'] }
};
const CR = window.CodeUpRewards;                                          // títulos e molduras por XP (rewards.js)
const GN_RE = /^[\p{L}\p{N}][\p{L}\p{N} .'’-]{1,13}$/u, gnClean = v => String(v ?? '').normalize('NFC').replace(/\s+/g, ' ').trim();   // mesma regra do servidor: 2 a 14 caracteres
const nf = n => Number(n || 0).toLocaleString('pt-BR');
// nome que a pessoa deu ao personagem (ou o nome original, se ainda não escolheu)
const gnm = () => (S.me && S.me.gname) || (S.reg && S.reg.gname) || GUIDES[gid()].name;
const gid = () => { const g = (S.me && S.me.guide) || LS.get('guide'); return g === 'tay' ? 'tay' : 'cut'; };
const IMG = () => { const g = gid(), c = S.me && S.me.color; return { face: CR.colorFile(g, c, true), full: CR.colorFile(g, c, false) }; };   // cor escolhida (ou a de fábrica)
// fundo do círculo do rosto: o que a pessoa escolheu; sem escolha, acompanha a cor da roupa (a cor de fábrica usa o degradê original)
const bgCss = (bg, color) => { const b = CR.item(CR.BACKS, bg), c = CR.item(CR.COLORS, color); return b ? `radial-gradient(circle at 50% 28%,${b.c1},${b.c2} 78%)` : c ? `radial-gradient(circle at 50% 28%,hsl(${c.hue} 95% 72%),hsl(${c.hue} 62% 36%) 78%)` : ''; };
// atributo style do aro/fundo: moldura conquistada pelo XP (só no aro) e fundo
const cosStyle = (ring, o = S.me, guide = gid()) => { if (!o) return ''; const fr = ring ? CR.frameOf(o.xp, o.frame) : 0, bg = bgCss(o.bg, o.color && o.color !== CR.BASE[guide] ? o.color : ''); const v = (fr ? `--fr:${CR.TIERS[fr].color};` : '') + (bg ? `--bgc:${bg};` : ''); return v ? ` style="${v}"` : ''; };
const mascot = (s = 56, cls = '') => `<img class="mascot g-${gid()} ${cls}"${cosStyle(/\bring\b/.test(cls))} src="${IMG().face}" width=${s} height=${s} alt="${esc(gnm())}, seu guia no CodeUp">`;
// adesivos: ícones cheios, desenhados em 24×24; a cor vem do item (--sc)
const STK = {
  estrela: '<path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2 6.3 20.3l1.2-6.4L2.8 9.5l6.4-.8z"/>',
  raio: '<path d="M13.5 2 5 13.5h5.8L9.5 22 19 9.8h-5.9z"/>',
  coracao: '<path d="M12 21.2S3.5 16 3.5 9.7A4.7 4.7 0 0 1 12 7a4.7 4.7 0 0 1 8.5 2.7c0 6.3-8.5 11.5-8.5 11.5z"/>',
  foguete: '<path d="M12 2c3.3 2.2 5.2 5.6 5.2 9.6 0 1.4-.3 2.7-.8 3.9H7.6c-.5-1.2-.8-2.5-.8-3.9C6.8 7.6 8.7 4.2 12 2z"/><circle cx="12" cy="9.5" r="1.9" fill="#0b1030"/><path d="M7.4 14.6 4.6 18l.4-4.6zM16.6 14.6 19.4 18l-.4-4.6zM10.4 17h3.2L12 22z"/>',
  chama: '<path d="M12.4 2.2c.5 3.2-2.9 5-2.9 8.4 0 1.2.6 2.2 1.6 2.7-.3-1.5.4-2.8 1.7-4 .9 1.1 3.3 2.2 3.3 5A5.1 5.1 0 0 1 12 19.3a5.5 5.5 0 0 1-5.5-5.5c0-2.2.9-3.7 2-5 .1 1.6.8 2.4 1.7 2.7-.4-3.6.5-7.1 2.2-9.3z"/><path d="M12 22c-2.600 0-4.600-1.300-4.600-3.200h9.200C16.600 20.700 14.600 22 12 22z"/>',
  capelo: '<path d="M12 4 1.8 9 12 14l8.200-4v6h1.600V9z"/><path d="M5.800 12.300v4c0 1.500 2.700 3 6.200 3s6.200-1.500 6.200-3v-4L12 15.600z"/>',
  ideia: '<path d="M12 2.200a6.300 6.300 0 0 0-3.700 11.400c.7.600 1.100 1.300 1.200 2.200h5c.1-.9.5-1.600 1.200-2.200A6.300 6.300 0 0 0 12 2.200z"/><path d="M9.600 17.600h4.800v1.200a2.400 2.400 0 0 1-4.800 0z"/>',
  trofeu: '<path d="M7 3h10v6.200a5 5 0 0 1-10 0z"/><path d="M7 5H3.200v1.800A3.600 3.600 0 0 0 7 10.400V8.800a2 2 0 0 1-2.200-2V6.600H7zM17 5h3.800v1.800a3.600 3.600 0 0 1-3.800 3.600V8.800a2 2 0 0 0 2.200-2V6.600H17z"/><path d="M11 14h2v3h-2zM8 18h8v2.500H8z"/>',
  coroa: '<path d="M2.800 7.500l4.700 4.200L12 4.500l4.500 7.200 4.700-4.200-1.800 11H4.600z"/>',
  diamante: '<path d="M6.200 3h11.600l4.200 6.200L12 21.500 2 9.200z"/><path d="M2 9.200h20M9 3 7.600 9.200 12 21.500 16.400 9.200 15 3" fill="none" stroke="#0b1030" stroke-opacity=".45"/>',
  cometa: '<path d="M16.500 3.500l1.600 3.400 3.700.5-2.700 2.600.7 3.700-3.300-1.800-3.300 1.800.7-3.700-2.700-2.600 3.700-.5z"/><path d="M2.800 20.500 11 11.800M3 14.500l5-5M8.500 21l5-5" fill="none" stroke="currentColor" stroke-width="1.800" stroke-linecap="round"/>'
};
const stkIcon = (k, s) => `<svg width=${s} height=${s} viewBox="0 0 24 24" fill=currentColor stroke-width=1 aria-hidden=true>${STK[k] || ''}</svg>`;
const stkBadge = (k, size) => { const it = CR.item(CR.STICKERS, k); return it && STK[k] ? `<i class=stk style="--sc:${it.color};width:${size}px;height:${size}px">${stkIcon(k, Math.round(size * .62))}</i>` : ''; };
// rosto com adesivo no canto (perfil e ranking); o resto do app usa só mascot()
const avatar = (s, cls = '') => `<span class=av style="width:${s}px;height:${s}px">${mascot(s, cls)}${stkBadge(S.me && S.me.sticker, Math.round(s * .42))}</span>`;
// personagem de corpo inteiro: animado em WebGL (anim.js) com a estampa da roupa escolhida; sem WebGL cai na <img> normal
const OUTF = () => CR.outfitId(S.me && S.me.outfit);
const body = (h = 200, cls = '', extra = '') => window.CodeUpAnim ? CodeUpAnim.html({ g: gid(), src: IMG().full, o: OUTF(), h, cls: (cls + ' ' + extra).trim(), mode: /\bgood\b/.test(cls) ? 'good' : /\bbad\b/.test(cls) ? 'bad' : '', alt: esc(gnm()) }) : `<img class="body ${cls}" src="${IMG().full}" style="height:${h}px" alt="${esc(gnm())}">`;
const stage = (h, text, cls = '') => `<div class="stage ${cls}"${(b => b ? ` style="--gl:${b.c1}"` : '')(CR.item(CR.BACKS, S.me && S.me.bg))}><div class=sb>${text}</div><div class=glow></div>${body(h, cls)}<span class=gn>${esc(gnm())}</span></div>`;
const tg = (t, s = 40) => t == 'python' ? `<span class="tg py" style="--s:${s}px">py</span>` : `<span class="tg sq" style="--s:${s}px">${ic('db', Math.round(s * .5))}</span>`;
const bars = n => `<span class=lb>${[1, 2, 3].map(i => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span>`;

// destaque de sintaxe simples (só para exemplos e soluções exibidos)
const PY_KW = 'def return if elif else for while in import from as class try except finally raise with yield lambda and or not is pass break continue nonlocal global None True False'.split(' ');
const PY_FN = 'print len range sum max min sorted list dict set tuple int float str bool type enumerate zip map filter any all abs round reversed isinstance super iter next'.split(' ');
const SQ_KW = 'select from where and or not in between like order by group having limit distinct as join left right inner outer on union all except intersect case when then else end insert into values update set delete create table view index with over partition rows preceding current row asc desc is null exists offset unbounded following'.split(' ');
const SQ_FN = 'count sum avg min max round upper lower length coalesce row_number rank dense_rank lag lead ntile first_value strftime julianday substr cast date integer text real'.split(' ');
function hl(code, type) {
  const sql = type == 'sql', kw = new Set(sql ? SQ_KW : PY_KW), fn = new Set(sql ? SQ_FN : PY_FN);
  const re = sql ? /(--[^\n]*)|('(?:[^'\n]|'')*')|\b(\d+(?:\.\d+)?)\b|\b([A-Za-z_][A-Za-z_0-9]*)\b/g : /(#[^\n]*)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')|\b(\d+(?:\.\d+)?)\b|\b([A-Za-z_][A-Za-z_0-9]*)\b/g;
  let out = '', last = 0, m; code = String(code ?? '');
  while ((m = re.exec(code))) {
    out += esc(code.slice(last, m.index)); last = re.lastIndex;
    const w = m[4] && (sql ? m[4].toLowerCase() : m[4]);
    if (m[1]) out += `<span class=cm>${esc(m[1])}</span>`;
    else if (m[2]) out += `<span class=s>${esc(m[2])}</span>`;
    else if (m[3]) out += `<span class=n>${m[3]}</span>`;
    else if (kw.has(w)) out += `<span class=k>${esc(m[4])}</span>`;
    else if (fn.has(w)) out += `<span class=f>${esc(m[4])}</span>`;
    else out += esc(m[4]);
  }
  return out + esc(code.slice(last));
}
const KW_ALL = [...new Set([...SQ_KW, ...SQ_FN])];
// Exemplo bem organizado: o SQL vem em linhas (uma parte do comando por linha, recuos nas subconsultas) e, embaixo, a legenda "Como ler" explica cada parte.
const niceSql = (code, type) => type == 'sql' && typeof fmtSql == 'function' ? fmtSql(code) : String(code ?? '');
const codeBox = (code, type, label) => {
  const txt = niceSql(code, type), parts = type == 'sql' && label == 'Exemplo' && typeof sqlParts == 'function' ? sqlParts(txt).slice(0, 7) : [];
  return `<div class=cb><div class=cbh><span>${esc(label)}</span></div><pre>${hl(txt, type)}</pre>${parts.length > 1 ? `<div class=cbp><small>Como ler</small>${parts.map(p => `<div><b class=k>${esc(p.k)}</b><span>${esc(p.d)}</span></div>`).join('')}</div>` : ''}</div>`;
};

function confetti() { const w = document.createElement('div'); w.className = 'confetti'; const cs = ['#ffd43b', '#4b8bbe', '#22d3ee', '#34d399', '#f87171', '#fff'];
  for (let i = 0; i < 46; i++) { const p = document.createElement('i'); p.style.cssText = `left:${Math.random() * 100}%;background:${cs[i % 6]};animation-delay:${Math.random() * .6}s;animation-duration:${1.8 + Math.random() * 1.6}s;transform:rotate(${Math.random() * 360}deg)`; w.appendChild(p); }
  document.body.appendChild(w); setTimeout(() => w.remove(), 4200); }
function toast(m, err) { document.querySelectorAll('.toast').forEach(x => x.remove()); const d = document.createElement('div'); d.className = 'toast' + (err ? ' err' : ''); d.innerHTML = ic(err ? 'info' : 'check', 18) + '<span></span>'; d.lastChild.textContent = m; document.body.appendChild(d); setTimeout(() => d.remove(), 4500); }
const fail = e => { if (!e.silent) toast(e.error || e.message || 'Algo deu errado.', true); };
const theme = t => { document.body.classList.remove('t-python', 't-sql'); if (t) document.body.classList.add('t-' + t); };

async function api(p, o = {}) {
  let r;
  try {
    r = await fetch('/api/' + p, { method: o.method || (o.body ? 'POST' : 'GET'), headers: { 'Content-Type': 'application/json', 'x-token': S.tk || '' }, body: o.body ? JSON.stringify(o.body) : undefined });
  } catch { throw { error: 'Sem conexão com o servidor. Verifique sua internet.' }; }
  if (r.status === 401 && S.tk) { S.tk = null; localStorage.removeItem('tk'); S.auth = 'login'; showAuth(); throw { error: 'login', silent: true }; }
  let j = {}; try { j = await r.json(); } catch { }
  if (!r.ok) throw { ...j, status: r.status };
  return j;
}

// ============================================================ AUTENTICAÇÃO
function showAuth() {
  theme(null);
  const m = S.auth, legal = `<p class=legal><a href="/termos" target="_blank">Termos de Uso</a> · <a href="/privacidade" target="_blank">Política de Privacidade</a></p>`;
  const F = {
    login: { t: 'Entre na sua conta', s: 'Continue de onde parou.', btn: 'Entrar',
      body: `<input class=in type=email id=em placeholder="E-mail" autocomplete=email><input class=in type=password id=pw placeholder="Senha" autocomplete=current-password>`,
      links: `<div class=lnk><a onclick="S.auth='forgot';showAuth()">Esqueci minha senha</a></div><div class=lnk>Ainda não tem conta? <a onclick="goRegister()">Criar conta grátis</a></div>` },
    register: { t: 'Crie sua conta grátis', s: 'Grátis, do básico ao avançado, com prova e certificado.', btn: 'Criar conta grátis',
      body: `<input class=in type=text id=nm placeholder="Seu nome" maxlength=30 autocomplete=name><input class=in type=email id=em placeholder="E-mail" autocomplete=email><input class=in type=password id=pw placeholder="Senha (mín. 8 caracteres)" autocomplete=new-password>
        <label class=chk><input type=checkbox id=ac><span>Li e aceito os <a href="/termos" target="_blank">Termos de Uso</a> e a <a href="/privacidade" target="_blank">Política de Privacidade</a>.</span></label>`,
      links: `<div class=lnk>Já tem conta? <a onclick="S.auth='login';showAuth()">Entrar</a></div>` },
    forgot: { t: 'Recuperar senha', s: 'Informe seu e-mail e enviaremos um link para criar uma nova senha.', btn: 'Enviar link',
      body: `<input class=in type=email id=em placeholder="E-mail" autocomplete=email>`, links: `<div class=lnk><a onclick="S.auth='login';showAuth()">Voltar para o login</a></div>` },
    reset: { t: 'Nova senha', s: 'Crie sua nova senha.', btn: 'Salvar nova senha', body: `<input class=in type=password id=pw placeholder="Nova senha (mín. 8 caracteres)" autocomplete=new-password>`, links: '' }
  }[m];
  const g = S.cfg.googleClientId && (m === 'login' || m === 'register') ? `<div class=gwrap><div id=gbtn></div></div><div class=or><span>ou</span></div>` : '';
  const hero = m === 'login' || m === 'register' ? `<div class=hero><div class=glow></div>${window.CodeUpAnim ? body(285, '', 'hb') : `<img class=hb src="${IMG().full}" alt="${esc(gnm())}">`}<div class=hbrand><h1 class=logo aria-label="CodeUp"><b>Code</b><span>Up</span></h1><p>Python e SQL do básico ao avançado, com prova e certificado.</p></div></div>
    <div class=feat><span>${ic('code', 16)} 180 lições práticas</span><span>${ic('cap', 16)} 3 níveis com prova</span><span>${ic('award', 16)} Certificado</span></div>` : `<div class=hero-sm>${mascot(84, 'ring')}<h1 class=logo aria-label="CodeUp"><b>Code</b><span>Up</span></h1></div>`;
  A.innerHTML = `<div class="c auth">${hero}<div class=panel><h2>${F.t}</h2><p class=sub>${F.s}</p>${m === 'register' && S.reg ? `<div class=chosen>${esc(S.reg.sex == 'f' ? 'Feminino' : 'Masculino')} · guia: <b>${esc(S.reg.gname || GUIDES[S.reg.guide].name)}</b> <a onclick="S.reg=null;goRegister()">alterar</a></div>` : ''}${g}<form id=af>${F.body}<button class="btn pri block" id=ab style="margin-top:14px">${F.btn}</button></form>${F.links}</div>${legal}</div>`;
  $('#af').onsubmit = e => { e.preventDefault(); doAuth(); };
  if (g) googleBtn();
}

// ---------- Login com Google ----------
const loadGsi = () => new Promise((ok, no) => {
  if (window.google && google.accounts) return ok();
  const s = document.createElement('script'); s.src = 'https://accounts.google.com/gsi/client'; s.async = true; s.onload = ok; s.onerror = no; document.head.appendChild(s);
});
async function googleBtn() {
  const el = $('#gbtn'); if (!el) return;
  try {
    await loadGsi();
    google.accounts.id.initialize({ client_id: S.cfg.googleClientId, callback: r => onGoogle(r), ux_mode: 'popup' });
    google.accounts.id.renderButton(el, { theme: 'filled_black', size: 'large', shape: 'rectangular', text: 'continue_with', locale: 'pt-BR', width: Math.min(340, innerWidth - 64) });
  } catch { const w = $('.gwrap'); if (w) w.remove(); const o = $('.or'); if (o) o.remove(); }
}
async function onGoogle(resp, accept) {
  try {
    const r = await api('google', { body: { credential: resp.credential, accept: accept === true, ...(S.reg || {}) } });
    if (r.needsTerms) return googleTerms(resp, r);
    S.tk = r.token; localStorage.tk = r.token; boot();
  } catch (e) { fail(e); }
}
function googleTerms(resp, r) {
  const o = document.createElement('div'); o.className = 'ov';
  o.innerHTML = `<div class=modal>${mascot(64, 'ring')}<h2>Quase lá, ${esc(String(r.name).split(' ')[0])}</h2><p class=sub>Vamos criar sua conta com ${esc(r.email)}.</p>
    <label class=chk style="text-align:left"><input type=checkbox id=gac><span>Li e aceito os <a href="/termos" target="_blank">Termos de Uso</a> e a <a href="/privacidade" target="_blank">Política de Privacidade</a>.</span></label>
    <button class="btn pri block" id=gok>Criar minha conta</button><button class="btn ghost block" id=gno>Cancelar</button></div>`;
  document.body.appendChild(o);
  $('#gno').onclick = () => o.remove();
  $('#gok').onclick = () => { if (!$('#gac').checked) return toast('Aceite os Termos para continuar.', true); o.remove(); onGoogle(resp, true); };
}

// caixa de diálogo com campos (o prompt() do navegador mostra a senha na tela)
function dialog(title, fields, okText, onOk) {
  const o = document.createElement('div'); o.className = 'ov';
  o.innerHTML = `<form class=modal><h2>${title}</h2>${fields.map(f => `<input class=in type=${f.type || 'password'} id=d_${f.id} placeholder="${esc(f.ph)}" autocomplete=${f.ac || 'off'}>`).join('')}<button class="btn pri block" style="margin-top:14px">${okText}</button><button type=button class="btn ghost block" id=dno>Cancelar</button></form>`;
  document.body.appendChild(o);
  $('#dno').onclick = () => o.remove();
  o.querySelector('form').onsubmit = async e => { e.preventDefault(); const v = {}; fields.forEach(f => v[f.id] = $('#d_' + f.id).value); if ((await onOk(v)) !== false) o.remove(); };
  setTimeout(() => { const i = o.querySelector('input'); if (i) i.focus(); }, 50);
}

async function doAuth() {
  const m = S.auth, v = id => ($('#' + id) || {}).value || '', b = $('#ab');
  b.disabled = true;
  try {
    if (m === 'login' || m === 'register') {
      const body = m === 'login' ? { email: v('em'), password: v('pw') } : { name: v('nm'), email: v('em'), password: v('pw'), accept: $('#ac').checked, ...(S.reg || {}) };
      const r = await api(m, { body }); S.tk = r.token; localStorage.tk = r.token; if (m === 'register') S.reg = null; boot();
    } else if (m === 'forgot') {
      const r = await api('forgot', { body: { email: v('em') } });
      if (r.devLink) { toast('Modo teste: abrindo o link de redefinição…'); return void (location.href = r.devLink); }
      S.auth = 'login'; showAuth(); toast('Se esse e-mail tiver conta, enviamos um link para criar uma nova senha. Pode levar alguns minutos; olhe também o spam.');
    } else {
      const r = await api('reset', { body: { token: S.resetToken, password: v('pw') } });
      history.replaceState({}, '', '/'); S.resetToken = null; S.tk = r.token; localStorage.tk = r.token; toast('Senha alterada! Você já está conectado.'); boot();
    }
  } catch (e) { fail(e); if (m === 'reset' && e.status === 400 && /Link/.test(e.error || '')) { S.auth = 'forgot'; showAuth(); } } finally { b.disabled = false; }
}

// Modo teste (npm run teste): faixa no topo e botão que apaga os dados de teste e deste aparelho para recomeçar como visitante novo.
function testBar() {
  if (document.querySelector('.tbar')) return;
  const d = document.createElement('div'); d.className = 'tbar'; d.innerHTML = '<span>MODO TESTE · dados fictícios</span><button type=button>Começar do zero</button>';
  d.querySelector('button').onclick = async () => {
    if (!confirm('Apagar todas as contas de teste e recomeçar como um visitante novo?')) return;
    try { await fetch('/api/teste/reset', { method: 'POST' }); } catch { }
    try { localStorage.clear(); sessionStorage.clear(); } catch { }
    location.href = '/';
  };
  document.body.insertBefore(d, document.body.firstChild);
}
async function boot() {
  const q = new URLSearchParams(location.search);
  try { S.cfg = await api('config'); } catch { }
  if (S.cfg && S.cfg.teste) testBar();
  if (q.get('reset')) {
    S.resetToken = q.get('reset'); let ok = false;
    try { ok = (await api('reset/check?token=' + encodeURIComponent(S.resetToken))).valid; } catch { }
    if (!ok) { history.replaceState({}, '', '/'); S.resetToken = null; S.auth = 'forgot'; showAuth(); return toast('Este link expirou ou já foi usado. Peça um novo.', true); }
    S.auth = 'reset'; return showAuth();
  }
  if (q.get('verificado')) { const ok = q.get('verificado') == '1'; history.replaceState({}, '', '/'); setTimeout(() => toast(ok ? 'E-mail confirmado! Obrigado.' : 'Este link de confirmação expirou ou já foi usado. Entre e peça um novo.', !ok), 400); }
  if (!S.tk) return LS.get('guide') || S.skipGuide ? showAuth() : startWizard(['sex', 'guide', 'gname'], false);   // quem chega pela primeira vez já começa o cadastro: feminino ou masculino e depois o personagem
  go('home');
}

// ---------- Primeiros passos no cadastro: 1) feminino ou masculino  2) qual personagem (Tay ou Cut) vai guiar a jornada ----------
// need = quais perguntas fazer ('sex', 'guide'); logged = a conta já existe (então só salva no fim).
const hiFor = (g, n) => GUIDES[g].hi.replace('{n}', n || GUIDES[g].name).replace('{j}', ((S.wz && S.wz.sex) || (S.me && S.me.sex)) === 'f' ? 'juntas' : 'juntos');
function startWizard(need, logged) { const me = logged && S.me || {}; S.wz = { need, logged: !!logged, i: 0, sex: (S.reg && S.reg.sex) || me.sex || null, guide: (S.reg && S.reg.guide) || me.guide || null, gname: (S.reg && S.reg.gname) || me.gname || null }; S.skin0 = skinOf(); wizard(); }
function goRegister() { if (S.reg) { S.auth = 'register'; return showAuth(); } startWizard(['sex', 'guide', 'gname'], false); }
function wizard() {
  const w = S.wz, st = w.need[w.i]; theme(null);
  const dots = w.need.length > 1 ? `<div class=wdots aria-label="Passo ${w.i + 1} de ${w.need.length}">${w.need.map((_, k) => `<i class="${k <= w.i ? 'on' : ''}"></i>`).join('')}</div>` : '';
  const back = w.i > 0 ? `<div class=lnk><a onclick="wizBack()">Voltar</a></div>` : w.logged ? '' : `<div class=lnk>Já tem conta? <a onclick="S.wz=null;S.skipGuide=1;S.auth='login';showAuth()">Entrar</a></div>`;
  const logo = `<div class=hero-sm><h1 class=logo aria-label="CodeUp"><b>Code</b><span>Up</span></h1></div>`, last = w.i === w.need.length - 1;
  if (st === 'sex') {
    A.innerHTML = `<div class="c auth gpick">${logo}${dots}<h2 style="text-align:center">Você é feminino ou masculino?</h2>
      <p class=sub style="text-align:center">É para o CodeUp falar com você do jeito certo.</p>
      <div class=sexes>${[['f', 'Feminino', '♀'], ['m', 'Masculino', '♂']].map(([k, n, g]) => `<button class="sexb ${k}${w.sex == k ? ' sel' : ''}" data-s=${k} onclick="pickSex('${k}')" aria-pressed=${w.sex == k}><span aria-hidden=true>${g}</span><b>${n}</b></button>`).join('')}</div>
      <button class="btn pri block" id=wok ${w.sex ? '' : 'disabled'} onclick=wizNext()>Continuar</button>${back}</div>`;
  } else if (st === 'gname') {
    const g = w.guide, def = GUIDES[g].name; w.gname = w.gname || def;
    A.innerHTML = `<div class="c auth gpick">${logo}${dots}<h2 style="text-align:center">Que nome você quer dar ${g === 'tay' ? 'à' : 'ao'} ${def}?</h2>
      <p class=sub style="text-align:center">É o nome que ${GUIDES[g].art} vai usar com você. Pode trocar depois, no Perfil.</p>
      <div class=gnbox><img class="mascot g-${g}" src="/img/${g}-face.webp" width=84 height=84 alt=""><input class=in id=gn maxlength=14 value="${esc(w.gname)}" autocomplete=off autocapitalize=words spellcheck=false aria-label="Nome do personagem"></div>
      <div class=gsug>${GUIDES[g].sugg.concat([def]).map(n => `<button type=button class=chip onclick="gnPick('${n}')">${n}</button>`).join('')}</div>
      <div class="gsay on ${g}" id=gsay aria-live=polite></div><div class=gerr id=gnerr role=alert></div>
      <button class="btn pri block" id=wok onclick=wizNext()>Continuar</button>${back}</div>`;
    $('#gn').oninput = gnInput; gnInput();
  } else {
    const card = g => `<button class="gcard ${g}" data-g=${g} onclick="pickGuide('${g}')" aria-pressed=false><img src="/img/${g}.webp" alt="${GUIDES[g].name}"><b>${GUIDES[g].name}</b></button>`;
    A.innerHTML = `<div class="c auth gpick">${logo}${dots}<h2 style="text-align:center">Quem vai te guiar na jornada?</h2>
      <p class=sub style="text-align:center">Escolha o personagem que vai te acompanhar em cada lição. Você pode trocar depois, no Perfil.</p>
      <div class=gcards>${card('tay')}${card('cut')}</div>
      <div class=gsay id=gsay aria-live=polite>Toque em um personagem para escolher.</div>
      <button class="btn pri block" id=wok disabled onclick=wizNext()>Continuar</button>${back}</div>`;
    if (w.guide) pickGuide(w.guide);
  }
}
function pickSex(k) {
  S.wz.sex = k; document.querySelectorAll('.sexb').forEach(b => { const on = b.dataset.s === k; b.classList.toggle('sel', on); b.setAttribute('aria-pressed', on); });
  $('.sexes').classList.add('has'); $('#wok').disabled = false;
}
function pickGuide(g) {
  const w = S.wz; w.guide = g; applySkin(g === 'tay' ? 'rose' : S.skin0 === 'rose' ? 'wild' : S.skin0);   // mostra na hora o visual que vem junto
  document.querySelectorAll('.gcard').forEach(b => { const on = b.dataset.g === g; b.classList.toggle('sel', on); b.setAttribute('aria-pressed', on); });
  $('.gcards').classList.add('has'); const s = $('#gsay'); s.className = 'gsay on ' + g; s.innerHTML = `<b>${GUIDES[g].name}</b> ${esc(hiFor(g))}`;
  const b = $('#wok'); b.disabled = false; b.textContent = 'Continuar com ' + GUIDES[g].art;
}
// passo 3: o nome do personagem (validação igual à do servidor; a fala do personagem muda enquanto a pessoa digita)
function gnInput() {
  const w = S.wz, v = gnClean($('#gn').value), ok = GN_RE.test(v); w.gname = ok ? v : null;
  $('#gsay').innerHTML = ok ? `<b>${esc(v)}</b> ${esc(hiFor(w.guide, v))}` : 'Escolha um nome para continuar.';
  $('#gnerr').textContent = v && !ok ? 'Use de 2 a 14 caracteres: letras, números, espaço, ponto, apóstrofo ou hífen.' : ''; $('#wok').disabled = !ok;
}
function gnPick(n) { const i = $('#gn'); i.value = n; gnInput(); i.focus(); }
function wizBack() { if (S.wz && S.wz.i > 0) { S.wz.i--; wizard(); } }
async function wizNext() {
  const w = S.wz; if (!w || !w[w.need[w.i]]) return;
  if (w.i < w.need.length - 1) { w.i++; return wizard(); }
  const b = $('#wok'); b.disabled = true;
  if (w.guide && w.need.includes('guide')) { const sk = w.guide === 'tay' ? 'rose' : S.skin0 === 'rose' ? 'wild' : S.skin0; LS.set('guide', w.guide); LS.set('skin', sk); applySkin(sk); }   // a Tay traz o visual Rosa; o Cut mantém o visual que a pessoa já usava
  if (w.logged) {
    try { const body = {}; w.need.forEach(k => body[k] = w[k]); S.me = await api('guide', { body }); } catch (e) { b.disabled = false; return fail(e); }
    S.wz = null; S.scroll = true; return go('home');
  }
  S.reg = { sex: w.sex, guide: w.guide, gname: w.gname }; S.wz = null; S.skipGuide = false; S.auth = 'register'; showAuth();   // segue para o cadastro já com as escolhas
}
async function setGuide(g) {
  if (g === gid()) return; LS.set('guide', g);
  const body = { guide: g }; if (!S.me.gname || S.me.gname === GUIDES[gid()].name) body.gname = GUIDES[g].name;   // se o nome ainda era o original, acompanha o novo personagem
  try { S.me = await api('guide', { body }); toast(`${gnm()} agora é ${g === 'tay' ? 'sua guia' : 'seu guia'}.`); render(); } catch (e) { fail(e); }
}
function editGname() {
  dialog('Nome do personagem', [{ id: 'n', type: 'text', ph: 'De 2 a 14 caracteres', ac: 'off' }], 'Salvar', async v => {
    const n = gnClean(v.n); if (!GN_RE.test(n)) { toast('Use de 2 a 14 caracteres: letras, números, espaço, ponto, apóstrofo ou hífen.', true); return false; }
    try { S.me = await api('guide', { body: { gname: n } }); toast(`Agora ${gid() === 'tay' ? 'ela' : 'ele'} se chama ${n}.`); render(); } catch (e) { fail(e); return false; }
  });
  setTimeout(() => { const i = $('#d_n'); if (i) { i.value = gnm(); i.maxLength = 14; i.select(); } }, 80);
}
async function setSex(k) {
  if (S.me.sex === k) return;
  try { S.me = await api('guide', { body: { sex: k } }); toast(`Pronto! O CodeUp agora fala com você no ${k == 'f' ? 'feminino' : 'masculino'}.`); render(); } catch (e) { fail(e); }
}

// ============================================================ DADOS DO CURSO
async function go(t) {
  if (t) S.tab = t;
  try {
    let cf; [S.me, S.ls, S.cps, cf] = await Promise.all([api('me'), api('lessons'), api('checkpoints'), api('config').catch(() => null)]);
    if (cf && S.cfg) S.cfg.announce = cf.announce;                          // comunicado do dono: atualiza sem precisar recarregar a página
    const g = S.me.guide, l = LS.get('guide');
    if (g && g !== l) LS.set('guide', g);                                   // a conta manda: o mesmo personagem em todos os aparelhos
    const need = [!S.me.sex && 'sex', !S.me.guide && 'guide', !S.me.gname && 'gname'].filter(Boolean);
    if (need.length) return startWizard(need, true);                        // conta sem gênero, personagem e/ou nome do personagem (conta antiga ou criada pelo Google): pergunta uma vez
    if (S.tab == 'rk') { try { S.rk = await api('ranking?p=' + S.rkp); } catch { S.rk = null; } }
    render();
  }
  catch (e) { fail(e); if (!S.me) A.innerHTML = `<div class="c auth"><div class=panel><p>Não foi possível carregar.</p><button class="btn pri block" onclick="go('home')">Tentar de novo</button></div></div>`; }
}
const done = l => S.me.done[l.id];
const fm = (m, f) => S.me && S.me.sex === 'f' ? f : m;                    // palavra no masculino ou no feminino, conforme o que a pessoa informou
const LV = ['Básico', 'Intermediário', 'Avançado'], TN = { python: 'Python', sql: 'SQL' };
const lessonsOf = (t, lv) => S.ls.filter(l => l.track == t && l.lv == lv);
const lvDone = (t, lv) => lessonsOf(t, lv).filter(done).length;
const passedLv = (t, lv) => !!S.me.passed[t + '-' + lv];
const unl = t => !!(S.me && S.me.unlocked && S.me.unlocked[t]);               // trilha liberada pelo dono (sem bloqueio de nível, sequência ou checkpoint)
const lvOpen = (t, lv) => lv == 1 || unl(t) || passedLv(t, lv - 1);
const trackPassed = t => [1, 2, 3].every(lv => passedLv(t, lv));
const lvPct = (t, lv) => Math.round((lvDone(t, lv) + (passedLv(t, lv) ? 1 : 0)) / 31 * 100);
const trackPct = t => Math.round([1, 2, 3].reduce((a, lv) => a + lvDone(t, lv) + (passedLv(t, lv) ? 1 : 0), 0) / 93 * 100);
const curLevel = t => [1, 2, 3].find(lv => !passedLv(t, lv)) || 3;
const nextLesson = t => S.ls.find(l => l.track == t && !done(l) && !l.lock);
const cpBefore = l => (S.cps || []).find(c => c.track == l.track && c.lv == l.lv && c.after == l.n - 1);   // checkpoint que vem logo antes da lição l
// próximo passo da trilha: a lição livre ou, nas lições 6, 11, 16, 21 e 26, o checkpoint que precisa ser feito antes
const nextStep = t => { const l = S.ls.find(x => x.track == t && !done(x) && (!x.lock || x.lock == 'cp')); if (!l) return null; if (l.lock == 'cp') { const c = cpBefore(l); return c && !c.lock ? { cp: c } : null; } return l; };

const nav = () => `<nav class=nav>${[['home', 'home', 'Início'], ['tr', 'map', 'Trilhas'], ['rk', 'crown', 'Ranking'], ['ch', 'trophy', 'Desafios'], ['pf', 'user', 'Perfil']].map(x => `<button class="${S.tab == x[0] ? 'on' : ''}" onclick="go('${x[0]}')">${ic(x[1], 22)}<span>${x[2]}</span></button>`).join('')}</nav>`;

async function resendVerify() { try { const r = await api('resend-verification', { body: {} }); if (r.devVerifyLink) { toast('Modo teste: abrindo o link de confirmação…'); return void (location.href = r.devVerifyLink); } toast(r.already ? 'Seu e-mail já está confirmado.' : 'E-mail enviado! Olhe também a caixa de spam.'); if (r.already) go(); } catch (e) { fail(e); } }
function chooseTrack() {
  theme(null);
  A.innerHTML = `<div class="c auth"><div class=hero-sm><h1 class=logo aria-label="CodeUp"><b>Code</b><span>Up</span></h1></div>${stage(210, 'Qual trilha você quer fazer?')}
  <h2 style="text-align:center;margin:6px 0 4px">O que você quer aprender?</h2><p class="sub" style="text-align:center">Escolha sua trilha. Você passa pelos níveis Básico, Intermediário e Avançado, cada um com 30 lições e uma prova, e recebe um certificado no final.</p>
  ${['python', 'sql'].map(t => `<div class="card pick ${t}" onclick="pickTrack('${t}')">${tg(t, 52)}<div class=bd><b>${TN[t]}</b><small>${t == 'python' ? 'Da lógica de programação à análise de dados com Pandas' : 'Do primeiro SELECT às funções de janela e CTEs'}</small><small class=mut>90 lições · 3 provas · certificado</small></div>${ic('arrow', 20)}</div>`).join('')}
  <p class=tn style="text-align:center">Você pode estudar a outra trilha depois: o progresso de cada uma é separado.</p></div>`;
}
async function pickTrack(t) { try { S.me = await api('track', { body: { track: t } }); S.lv = 0; S.scroll = true; go('home'); } catch (e) { fail(e); } }
async function studyTrack(t) { try { S.me = await api('track', { body: { track: t } }); S.lv = 0; S.scroll = true; S.tab = 'home'; go('home'); } catch (e) { fail(e); } }

// ============================================================ TELAS
// Trilha do mapa: curvas suaves (estilo caminho de jogo) passando pelo centro de cada botão. A parte já percorrida fica acesa.
function mapSvg(X, upto, M) {
  const y = i => M.top + 41 + i * M.row, H = M.top + X.length * M.row + 10;
  const seg = (a, b) => { const ym = (y(a) + y(b)) / 2; return ` C${X[a]} ${ym} ${X[b]} ${ym} ${X[b]} ${y(b)}`; };
  let all = `M${X[0]} ${y(0)}`, got = all; for (let i = 1; i < X.length; i++) { all += seg(i - 1, i); if (i <= upto) got += seg(i - 1, i); }
  return `<svg class=pth viewBox="0 0 100 ${H}" preserveAspectRatio="none" style="height:${H}px" aria-hidden="true"><path class=rd d="${all}"/><path class=bs d="${all}"/>${upto > 0 ? `<path class=pg d="${got}"/>` : ''}</svg>`;
}
function render() {
  delete document.body.dataset.calm;
  const m = S.me, L = S.ls;
  if (!m.track) return chooseTrack();
  const T = m.track; theme(T); let h = '';
  if (!S.lv) S.lv = curLevel(T);
  const an = (a => a && LS.get('ann') != a.id ? `<div class="note ${a.kind}" style="margin-top:10px">${ic(a.kind == 'ok' ? 'check' : 'info', 18)}<div style="flex:1">${esc(a.text)}</div><button class=ibtn aria-label="Fechar aviso" onclick="LS.set('ann',${+a.id});render()">${ic('x', 16)}</button></div>` : '')(S.cfg && S.cfg.announce);
  const vb = m.verified ? '' : `<div class=note style="margin-top:10px">${ic('info', 18)}<div><b>Confirme seu e-mail</b><br>Enviamos um link para ${esc(m.email)}. Você já pode estudar, mas precisa confirmar para emitir o certificado. <a onclick=resendVerify() style="cursor:pointer;font-weight:800">Reenviar e-mail</a></div></div>`;
  const head = `<header class=hd>${mascot(46, 'ring')}<div class=who><b>${document.body.classList.contains('wild') ? 'Olá, ' + esc(String(m.name).split(' ')[0]) + '!' : esc(m.name)}</b><small>Estudando ${TN[m.track]}</small></div><div class=chips-r><span class="pill fire" title="Dias seguidos">${ic('flame', 16)} <b class=n data-k=streak data-v="${m.streak}">${m.streak}</b></span><span class="pill xp" title="Pontos de experiência">${ic('bolt', 16)} <b class=n data-k=xp data-v="${m.xp}">${m.xp}</b></span></div></header>`;
  if (S.tab == 'home') {
    const lv = S.lv, ls = lessonsOf(T, lv), open = lvOpen(T, lv), cur = ls.findIndex(l => !done(l) && !l.lock), nd = lvDone(T, lv), examReady = (nd == 30 || unl(T)) && open && !passedLv(T, lv), pct = trackPct(T), nx = nextStep(T);
    // mapa em curva: cada lição ganha uma posição horizontal (onda suave) e uma trilha desenhada liga os botões.
    // A cada 5 lições entra um CHECKPOINT (desafio extra, opcional) no caminho.
    const cpOk = c => (m.cps || []).includes(c.id), cpsLv = (S.cps || []).filter(c => c.track == T && c.lv == lv);
    const rows = []; ls.forEach((l, i) => { rows.push({ l, i }); const c = cpsLv.find(c => c.after == l.n); if (c) rows.push({ c }); });
    const NR = rows.length + 1 + (lv == 3 ? 1 : 0), MAP = { row: 170, top: 44 };
    const X = Array.from({ length: NR }, (_, r) => r < rows.length ? +(50 + 26 * Math.sin(r * Math.PI / 4)).toFixed(1) : 50);
    const okRow = [...rows.map(r => r.l ? !!done(r.l) : false), passedLv(T, lv), !!m.certs[T]];
    rows.forEach((r, k) => { if (r.c) okRow[k] = cpOk(r.c) || !!okRow[k + 1]; });          // checkpoint pulado não "trava" a trilha acesa
    let pi = 0; while (pi < NR && okRow[pi]) pi++; pi = Math.min(pi, NR - 1);
    const pathSvg = mapSvg(X, pi, MAP);
    const rowHtml = (r, k) => r.l ? (l => { const i = r.i; return `<div class="ti ${done(l) ? 'ok' : i == cur ? 'cur' : l.lock ? 'lk' : ''}${X[k] > 50.5 ? ' rs' : ''}" style="--i:${k};--x:${X[k]}%" onclick="openL('${l.id}')"><div class=rail>${i == cur ? '<span class=start>COMEÇAR</span>' : ''}<span class=nd>${done(l) ? ic('check', 28) : l.lock ? ic('lock', 24) : ic('star', 28)}</span>${i == cur ? `<img class=pm src="${IMG().full}" alt="">` : ''}</div><div class=tb><b>${esc(l.title)}</b><small>Lição ${l.n}${done(l) ? '' : ' · +' + l.xp + ' XP'}</small></div></div>`; })(r.l)
      : (c => { const need = !cpOk(c) && !c.lock && !done(ls.find(l => l.n == c.after + 1) || {}); return `<div class="ti cp ${cpOk(c) ? 'ok' : c.lock ? 'lk' : 'av'}${need ? ' cur' : ''}${X[k] > 50.5 ? ' rs' : ''}" style="--i:${k};--x:${X[k]}%" onclick="openCp('${c.id}')"><div class=rail>${need ? '<span class=start>COMEÇAR</span>' : ''}<span class=nd>${cpOk(c) ? ic('check', 28) : c.lock ? ic('lock', 24) : ic('flag', 28)}</span>${need ? `<img class=pm src="${IMG().full}" alt="">` : ''}</div><div class=tb><b>${esc(c.title)}</b><small>${cpOk(c) ? 'Checkpoint concluído' : need ? 'Checkpoint · libera a lição ' + (c.after + 1) : 'Checkpoint · +' + c.xp + ' XP'}</small></div></div>`; })(r.c);
    const cont = nx ? (nx.cp ? `<div class="card cont" onclick="openCp('${nx.cp.id}')">${tg(T, 44)}<div class=bd><small class=up>Checkpoint · obrigatório</small><b>${esc(nx.cp.title)}</b><small>${TN[T]} · ${LV[nx.cp.lv - 1]} · libera a lição ${nx.cp.after + 1}</small></div><span class=go>${ic('arrow', 20)}</span></div>`
      : `<div class="card cont" onclick="openL('${nx.id}')">${tg(T, 44)}<div class=bd><small class=up>Continuar</small><b>${esc(nx.title)}</b><small>${TN[T]} · ${LV[nx.lv - 1]} · lição ${nx.n} de 30</small></div><span class=go>${ic('arrow', 20)}</span></div>`) : '';
    h = `${head}${an}${vb}
    <div class=panel><div class=ph><span>Progresso na trilha ${TN[T]}</span><b>${pct}%</b></div><div class=segs>${[1, 2, 3].map(x => `<div class=seg><i style="width:${lvPct(T, x)}%"></i></div>`).join('')}</div><div class=sl><span>Básico</span><span>Intermediário</span><span>Avançado</span></div></div>
    ${cont}
    <div class=unit><span class=uflag>${ic('flag', 22)}</span><div><small>NÍVEL ${lv} DE 3</small><b>${LV[lv - 1]}</b></div><div class=uc>${nd}/30</div></div>
    <div class=tabs>${[1, 2, 3].map(x => `<button class="${lv == x ? 'on' : ''}" onclick="S.lv=${x};render()">${lvOpen(T, x) ? (passedLv(T, x) ? ic('check', 15) : bars(x)) : ic('lock', 15)}<span>${LV[x - 1]}</span><small>${lvDone(T, x)}/30</small></button>`).join('')}</div>
    ${!open ? `<div class="note">${ic('lock', 18)}<div><b>Nível bloqueado</b><br>Termine as 30 lições de ${LV[lv - 2]} e passe na prova (70%) para entrar aqui.</div></div>` : ''}
    ${adSlot()}<div class=tl style="--n:${NR}">${pathSvg}${rows.map(rowHtml).join('')}
    <div class="ti exam ${passedLv(T, lv) ? 'ok' : examReady ? 'cur' : 'lk'}" style="--i:${rows.length};--x:50%" onclick="examIntro(${lv})"><div class=rail><span class=nd>${passedLv(T, lv) ? ic('check', 28) : ic('cap', 28)}</span></div><div class=tb><b>Prova do nível ${LV[lv - 1]}</b><small>${passedLv(T, lv) ? 'Aprovado' : examReady ? 'Liberada: 10 questões, nota mínima 70%' : 'Libera ao concluir as 30 lições'}</small></div></div>
    ${lv == 3 ? `<div class="ti exam ${m.certs[T] ? 'ok' : trackPassed(T) ? 'cur' : 'lk'}" style="--i:${rows.length + 1};--x:50%" onclick="certFlow('${T}')"><div class=rail><span class=nd>${ic('award', 28)}</span></div><div class=tb><b>Certificado ${TN[T]}</b><small>${m.certs[T] ? 'Emitido. Toque para abrir' : trackPassed(T) ? fm('Pronto', 'Pronta') + ' para emitir' : 'Passe nas 3 provas'}</small></div></div>` : ''}</div>`;
  }
  if (S.tab == 'ch') {
    h = `<h2 class=ttl>Provas e certificados</h2><p class=sub>Cada nível termina com uma prova de 10 questões. Nota mínima: 70%. Quem não passar refaz as 30 lições do nível.</p>`
      + ['python', 'sql'].map(t => `<div class=sec>${tg(t, 22)} ${TN[t]}</div>` + [1, 2, 3].map(lv => {
        const p = passedLv(t, lv), nd = lvDone(t, lv), ready = (nd == 30 || unl(t)) && lvOpen(t, lv) && !p, fl = m.fails[t + '-' + lv] || 0;
        return `<div class="card ${!p && !ready ? 'lk' : ''}" onclick="${p || ready || m.exams.includes(t + '-' + lv) ? `examIntro(${lv},'${t}')` : `toast('Conclua as 30 lições de ${LV[lv - 1]} (${TN[t]}) para liberar a prova.')`}"><span class="ib ${p ? 'ok' : ''}">${p ? ic('check', 20) : ic('cap', 20)}</span><div class=bd><b>Prova ${LV[lv - 1]}</b><small>${p ? 'Aprovado' : ready ? 'Liberada: faça agora' : nd + ' de 30 lições concluídas'}${fl ? ' · ' + fl + (fl == 1 ? ' reprovação' : ' reprovações') : ''}</small></div><span class=r>${p ? 'Aprovado' : ready ? 'Fazer' : ic('lock', 16)}</span></div>`;
      }).join('') + `<div class="card ${trackPassed(t) ? '' : 'lk'}" onclick="certFlow('${t}')"><span class="ib gold">${ic('award', 20)}</span><div class=bd><b>Certificado ${TN[t]}</b><small>${m.certs[t] ? 'Emitido · ' + esc(m.certs[t].code) : trackPassed(t) ? fm('Pronto', 'Pronta') + ' para emitir' : 'Passe nas 3 provas'}</small></div><span class=r>${m.certs[t] ? 'Abrir' : trackPassed(t) ? 'Emitir' : ic('lock', 16)}</span></div>`).join('');
  }
  if (S.tab == 'rk') h = rankView();
  if (S.tab == 'tr') {
    h = `<h2 class=ttl>Trilhas</h2><p class=sub>Escolha onde estudar. O progresso de cada trilha é separado.</p>` + ['python', 'sql'].map(t => {
      const p = trackPct(t);
      return `<div class="panel trk ${t}">
        <div class=trh>${tg(t, 46)}<div class=bd><b>${TN[t]}${m.track == t ? ' <span class=badge>Atual</span>' : ''}</b><small>${p}% concluído</small></div></div>
        ${[1, 2, 3].map(lv => `<div class=lr><span>${bars(lv)} ${LV[lv - 1]}</span><div class=bar><i style="width:${lvPct(t, lv)}%"></i></div><small>${passedLv(t, lv) ? 'Aprovado' : lvDone(t, lv) + '/30'}</small></div>`).join('')}
        <button class="btn ${m.track == t ? 'ghost' : 'pri'} block" onclick="studyTrack('${t}')">${m.track == t ? 'Continuar estudando' : 'Estudar ' + TN[t]}</button></div>`;
    }).join('') + `<div class="card lk"><span class=ib>${ic('chart', 20)}</span><div class=bd><b>Dashboards e Visualização</b><small>Gráficos e Power BI</small></div><span class=r>Em breve</span></div>`;
  }
  if (S.tab == 'pf') {
    const n = L.filter(done).length, np = Object.keys(m.passed).length, lvl = Math.floor(m.xp / 100) + 1,
      ach = [['target', 'Primeira lição', n >= 1], ['flame', 'Sequência de 3 dias', m.streak >= 3], ['cap', 'Básico aprovado', np >= 1], ['code', 'Intermediário aprovado', ['python', 'sql'].some(t => passedLv(t, 2))],
        ['trophy', 'Avançado aprovado', ['python', 'sql'].some(t => passedLv(t, 3))], ['award', 'Certificado', Object.keys(m.certs).length > 0], ['chart', 'Meio caminho', trackPct(T) >= 50]];
    h = `<div class=prof>${avatar(88, 'ring big')}<div><h2>${esc(m.name)} <button class=ibtn onclick=editName() aria-label="Editar nome">${ic('pencil', 16)}</button></h2><small class=mut>${esc(m.email)}</small><div style="margin-top:6px"><span class=badge>Nível ${lvl}</span><span class="badge gold">${CR.TIERS[CR.tierOf(m.xp)].title}</span></div></div></div>
    <div class=panel><div class=ph><span>XP do nível ${lvl}</span><b>${m.xp % 100} / 100</b></div><div class=bar><i style="width:${m.xp % 100}%"></i></div></div>
    <div class=stats><div>${ic('flame', 20)}<b>${m.streak}</b><small>dias de treino</small></div><div>${ic('file', 20)}<b>${n}</b><small>lições feitas</small></div><div>${ic('cap', 20)}<b>${np}</b><small>provas aprovadas</small></div><div>${ic('bolt', 20)}<b>${m.xp}</b><small>pontos totais</small></div></div>
    <div class=sec>Conquistas</div><div class=ach>${ach.map(a => `<div class="${a[2] ? 'on' : ''}">${ic(a[0], 20)}<span>${a[1]}</span></div>`).join('')}</div>
    ${tiersView()}
    <div class=sec>Eu sou</div><div class='skins s4 gsw'>${[['f', 'Feminino'], ['m', 'Masculino']].map(([k, n]) => `<button class="btn ${m.sex == k ? 'pri' : 'ghost'}" onclick="setSex('${k}')">${n}</button>`).join('')}</div>
    <div class=sec>Personagem</div><div class='skins s4 gsw'>${['tay', 'cut'].map(g => `<button class="btn ${gid() == g ? 'pri' : 'ghost'}" onclick="setGuide('${g}')"><img src="/img/${g}-face.webp" class="g-${g}" alt="" width=28 height=28> ${GUIDES[g].name}</button>`).join('')}</div>
    <button class="btn ghost block" onclick=editGname()>${ic('pencil', 16)} Nome do personagem: <b>${esc(gnm())}</b></button>
    ${czView()}
    <div class=sec>Ranking</div><div class='skins s4 gsw'>${[[true, 'Aparecer'], [false, 'Ficar de fora']].map(([k, n]) => `<button class="btn ${!m.rankOff == k ? 'pri' : 'ghost'}" onclick="rkVis(${k})">${n}</button>`).join('')}</div>
    <p class=tn style="margin:4px 2px 0">No ranking aparecem só o seu primeiro nome, a inicial do sobrenome, o personagem e o XP.</p>
    <div class=sec>Aparência</div><div class='skins s4'>${[['wild', 'Azul'], ['rose', 'Rosa'], ['', 'Azul escuro'], ['neo', 'Claro']].map(x => `<button class="btn ${(['rose', 'neo', ''].includes(LS.get('skin')) ? LS.get('skin') : 'wild') == x[0] ? 'pri' : 'ghost'}" onclick="setSkin('${x[0]}')">${x[1]}</button>`).join('')}</div>
    <div class=sec>Minha conta</div>
    <button class="btn ghost block" onclick="studyTrack('${T == 'python' ? 'sql' : 'python'}')">${ic('swap', 16)} Estudar ${T == 'python' ? 'SQL' : 'Python'}</button>
    <button class="btn ghost block" onclick=changePw()>${ic('key', 16)} ${m.hasPassword ? 'Alterar senha' : 'Criar senha'}</button>
    <button class="btn ghost block" onclick="go('home').then(() => startTour(true))">${ic('bulb', 16)} Rever o tour</button>
    <button class="btn ghost block" onclick=exportData()>${ic('down', 16)} Baixar meus dados</button>
    <button class="btn ghost block" onclick=logout()>${ic('out', 16)} Sair</button>
    <button class="btn danger block" onclick=delAccount()>${ic('trash', 16)} Excluir minha conta</button>
    <p class=legal>${S.cfg.contact ? `Precisa de ajuda? <a href="mailto:${esc(S.cfg.contact)}">${esc(S.cfg.contact)}</a><br>` : ''}<a href="/termos" target="_blank">Termos de Uso</a> · <a href="/privacidade" target="_blank">Política de Privacidade</a></p>`;
  }
  A.innerHTML = `<div class=c>${h}${S.tab == 'home' ? '' : adSlot()}</div>${nav()}`; loadAds(); countUp(); if (S.tab == 'home') setTimeout(startTour, 700);
  if (S.tab == 'home' && S.scroll) { S.scroll = false; const c = document.querySelector('.ti.cur'); if (c) c.scrollIntoView({ block: 'center' }); }
}


// ============================================================ ANIMAÇÕES E TOUR DO PRIMEIRO ACESSO
// números sobem até o valor novo (XP e dias seguidos) e a "pílula" dá um pulinho
const skinOf = () => { const v = LS.get('skin'); return v === 'rose' || v === 'neo' || v === '' ? v : 'wild'; };   // Azul (a floresta azul) é o padrão
function applySkin(v) {
  const cl = document.body.classList; cl.toggle('wild', v === 'wild' || v === 'rose'); cl.toggle('rose', v === 'rose'); cl.toggle('neo', v === 'neo');
  const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = v === 'rose' ? '#2b0f3d' : v === 'wild' ? '#0a1c40' : v === 'neo' ? '#f1f4ff' : '#0a0f1c';
}
function setSkin(v) { LS.set('skin', v); applySkin(v); render(); }
function countUp() {
  document.querySelectorAll('.pill b.n').forEach(el => {
    const k = el.dataset.k, to = +el.dataset.v, from = S.shown && S.shown[k] != null ? S.shown[k] : to;
    (S.shown ||= {})[k] = to; if (from === to || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t0 = performance.now(), d = 700; el.parentNode.classList.add('bump');
    const step = n => { const p = Math.min(1, (n - t0) / d); el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); else setTimeout(() => el.parentNode.classList.remove('bump'), 300); };
    requestAnimationFrame(step);
  });
}
const TOUR = [
  { t: 'Oi! Eu sou o guia do CodeUp', p: 'Aqui você aprende Python e SQL escrevendo código de verdade, um passo de cada vez. Quer um tour de 20 segundos?', sel: null },
  { t: 'Este é o seu próximo passo', p: 'Toque na lição que brilha no mapa. Primeiro você lê a teoria, depois pratica, e quando terminar, você toca em Concluído para conferir.', sel: '.ti.cur' },
  { t: 'Estude todo dia', p: 'Cada dia seguido aumenta sua sequência, e cada lição dá XP. Pequenos treinos diários vencem maratonas.', sel: '.hd .chips-r' },
  { t: 'Seu menu', p: 'Em Trilhas você troca entre Python e SQL. No Ranking você vê sua posição. Em Desafios ficam as provas e os certificados. No Perfil estão suas conquistas e molduras.', sel: '.nav' }
];
function startTour(force) {
  if ($('.tour') || S.tab != 'home' || !S.me) return;
  if (!force && (LS.get('tour') || Object.keys(S.me.done || {}).length)) return;
  let i = 0; const o = document.createElement('div'); o.className = 'tour'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-label', 'Tour do aplicativo');
  document.body.appendChild(o);
  const end = () => { LS.set('tour', '1'); document.querySelectorAll('.hl').forEach(x => x.classList.remove('hl')); o.remove(); };
  const show = () => {
    const st = TOUR[i]; document.querySelectorAll('.hl').forEach(x => x.classList.remove('hl'));
    const el = st.sel && $(st.sel); if (el) { el.classList.add('hl'); if (i == 1) el.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
    o.innerHTML = `<div class=tb2><div class=tr1>${mascot(72, 'ring')}<div><h3>${i == 0 ? esc(GUIDES[gid()].intro.replace('{n}', gnm())) : st.t}</h3><p>${st.p}</p></div></div>
      <div class=dots>${TOUR.map((_, k) => `<i class="${k == i ? 'on' : ''}"></i>`).join('')}</div>
      <div class=row>${i ? '' : '<button class="btn ghost" id=tkSkip>Pular</button>'}<button class="btn pri" id=tkNext>${i == TOUR.length - 1 ? 'Vamos lá!' : 'Próximo'}</button></div></div>`;
    $('#tkNext').onclick = () => { if (++i >= TOUR.length) end(); else show(); };
    const sk = $('#tkSkip'); if (sk) sk.onclick = end;
  };
  show();
}

// ============================================================ RANKING E CONQUISTAS POR XP
// Ranking: semanal (recomeça na segunda-feira) e geral. Mostra só primeiro nome + inicial do sobrenome; quem não quer aparecer sai em Ranking ou Perfil.
function rankView() {
  const k = S.rk, per = S.rkp, m = S.me;
  const head = `<h2 class=ttl>Ranking</h2><p class=sub>${per == 'semana' ? 'Quem mais ganhou XP nesta semana. Recomeça toda segunda-feira.' : 'Quem mais ganhou XP desde o começo.'}</p>
    <div class=pseg role=tablist aria-label="Período do ranking">${[['semana', 'Esta semana'], ['geral', 'Geral']].map(([p, t]) => `<button role=tab aria-selected=${per == p} class="${per == p ? 'on' : ''}" onclick="rkPer('${p}')">${t}</button>`).join('')}</div>`;
  if (!k) return head + `<div class=panel><p>Não foi possível carregar o ranking agora.</p><button class="btn pri block" onclick="go('rk')">Tentar de novo</button></div>`;
  let me;
  if (k.me.hidden) me = `<b>Você está fora do ranking</b><small>Ninguém vê o seu nome. Quer voltar?</small><button class="btn pri" onclick="rkVis(true)">Aparecer no ranking</button>`;
  else if (!m.verified) me = `<b>Confirme seu e-mail</b><small>Só contas com e-mail confirmado aparecem no ranking.</small>`;
  else if (k.me.pos) me = `<b>Você está em ${k.me.pos}º lugar</b><small>${nf(k.me.xp)} XP ${per == 'semana' ? 'nesta semana' : 'no total'}</small>`;
  else me = `<b>Você ainda não pontuou${per == 'semana' ? ' nesta semana' : ''}</b><small>Conclua uma lição para entrar no ranking.</small>`;
  let fim = ''; if (per == 'semana' && k.resets) { const ms = Math.max(0, Date.parse(k.resets) - Date.now()), d = Math.floor(ms / 864e5), hh = Math.floor(ms % 864e5 / 36e5); fim = `<small class=mut>Recomeça em ${d ? d + (d == 1 ? ' dia e ' : ' dias e ') : ''}${hh} h</small>`; }
  const av = r => { const fr = r.frame ? `--fr:${CR.TIERS[r.frame].color};` : '', bg = bgCss(r.bg, r.color && r.color !== CR.BASE[r.guide] ? r.color : ''), st = fr + (bg ? `--bgc:${bg};` : ''); return `<span class=av style="width:44px;height:44px"><img class="mascot rkav g-${r.guide}${r.frame ? ' fr' : ''}"${st ? ` style="${st}"` : ''} src="${CR.colorFile(r.guide, r.color, true)}" width=44 height=44 alt="">${stkBadge(r.sticker, 20)}</span>`; };
  const row = r => `<div class="rkr${r.me ? ' me' : ''}${r.pos <= 3 ? ' p' + r.pos : ''}"><span class=pos>${r.pos <= 3 ? ic('crown', 16) : ''}<b>${r.pos}º</b></span>${av(r)}<div class=bd><b>${esc(r.name)}${r.me ? ' <span class=badge>você</span>' : ''}</b><small>${esc(CR.TIERS[r.tier].title)}</small></div><span class=rxp><b>${nf(r.xp)}</b><small>XP</small></span></div>`;
  const list = k.top.length ? k.top.map(row).join('') + (k.me.row ? `<div class=rkgap aria-hidden=true>· · ·</div>${row(k.me.row)}` : '')
    : `<div class=panel><p style="margin:0">Ninguém pontuou${per == 'semana' ? ' nesta semana' : ''} ainda. Conclua uma lição e seja ${fm('o primeiro', 'a primeira')}!</p></div>`;
  return head + `<div class="panel rkme">${avatar(54, 'ring')}<div class=bd>${me}</div></div>${fim ? `<div class=rkfim>${fim}${k.total ? `<small class=mut>${nf(k.total)} ${k.total == 1 ? 'aluno' : 'alunos'}</small>` : ''}</div>` : ''}${list}
    <p class=tn style="margin-top:14px">Aparecem só o primeiro nome, a inicial do sobrenome, o personagem e o XP.${k.me.hidden ? '' : ' <a onclick="rkVis(false)">Sair do ranking</a>'}</p>`;
}
function rkPer(p) { if (S.rkp === p) return; S.rkp = p; go('rk'); }
async function rkVis(show) {
  if (!show && !confirm('Sair do ranking? Seu nome deixa de aparecer para os outros alunos. Você pode voltar quando quiser, em Ranking ou no Perfil.')) return;
  try { S.me = await api('ranking/visibility', { body: { show } }); toast(show ? 'Você voltou ao ranking.' : 'Pronto! Você saiu do ranking.'); go(S.tab); } catch (e) { fail(e); }
}
// Títulos e molduras: cada título novo chega com um XP; a moldura aparece no aro do personagem (topo, perfil e ranking). Dá para escolher qualquer moldura já conquistada.
function tiersView() {
  const m = S.me, top = CR.tierOf(m.xp), tier = CR.TIERS[top], nxt = CR.nextTier(m.xp), cur = CR.frameOf(m.xp, m.frame);
  return `<div class=sec>Títulos e molduras</div>
    <div class=panel><div class=ph><span>${nxt ? 'Próximo título: ' + nxt.title : 'Você chegou ao topo: Lenda!'}</span><b>${nxt ? 'faltam ' + nf(nxt.xp - m.xp) + ' XP' : nf(m.xp) + ' XP'}</b></div><div class=bar><i style="width:${nxt ? Math.round((m.xp - tier.xp) / (nxt.xp - tier.xp) * 100) : 100}%"></i></div></div>
    <div class=tiers>${CR.TIERS.map((t, k) => { const on = m.xp >= t.xp; return `<div class="tri ${on ? 'on' : 'lk'}" style="--fr:${t.color}"><span class=sw2></span><div class=bd><b>${t.title}</b><small>${t.frame ? 'Moldura ' + t.frame : 'Título inicial'} · ${nf(t.xp)} XP</small></div>${k == 0 ? '' : on ? `<button class="btn ${cur == k ? 'pri' : 'ghost'}" onclick="setFrame('${t.key}')">${cur == k ? 'Em uso' : 'Usar'}</button>` : `<span class=r>${ic('lock', 16)}</span>`}</div>`; }).join('')}</div>`;
}
// miniatura (só CSS) de cada estilo de roupa, na cor escolhida
const STAR_SVG = c => `url(data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'><path fill='${c}' d='M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2 6.3 20.3l1.2-6.4L2.8 9.5l6.4-.8z'/></svg>`).replace(/'/g, '%27')})`;
const outBg = (k, hue) => { const c = `hsl(${hue} 78% 52%)`, l = `hsl(${hue} 80% 92%)`, d = `hsl(${hue} 70% 30%)`, m2 = `hsl(${hue} 70% 40%)`; return ({
  liso: c, listrado: `repeating-linear-gradient(0deg,${l} 0 3px,${c} 3px 7px)`, bolinhas: `radial-gradient(${l} 24%,transparent 27%) 0 0/9px 9px,${c}`,
  xadrez: `conic-gradient(${l} 25%,${c} 0 50%,${l} 0 75%,${c} 0) 0 0/12px 12px`, degrade: `linear-gradient(180deg,${c},hsl(${(hue + 70) % 360} 90% 62%))`,
  estrelas: `${STAR_SVG('#ffe97a')} 0 0/12px 12px,${c}`, camuflado: `radial-gradient(circle at 25% 30%,${d} 28%,transparent 30%),radial-gradient(circle at 75% 65%,${l} 22%,transparent 24%),radial-gradient(circle at 60% 20%,${m2} 25%,transparent 27%),${c}`,
  tiedye: 'conic-gradient(#ff6b6b,#ffc94a,#f4f45a,#58e07a,#4ab4ff,#b07bff,#ff6b6b)', galaxia: 'radial-gradient(circle at 28% 30%,#ec4899cc,transparent 52%),radial-gradient(circle at 72% 72%,#38bdf8cc,transparent 52%),radial-gradient(#fff 8%,transparent 10%) 6px 4px/13px 13px,#1b0b4d',
  ouro: 'linear-gradient(135deg,#a8780a,#ffd95a 38%,#b8860b 62%,#ffe48a)', holo: 'conic-gradient(from 30deg,#ff9ad5,#a0f0ff,#fff0a0,#b8ffb0,#d6a8ff,#ff9ad5)'
})[k] || c; };
// Personalizar o personagem: cor da roupa, estilo da roupa, adesivo e fundo. O que ainda não foi liberado aparece com cadeado e o título que libera.
function czView() {
  const m = S.me, top = CR.tierOf(m.xp), g = gid(), lk = it => it.tier > top;
  const need = it => `Libera com o título ${CR.TIERS[it.tier].title} (${nf(CR.TIERS[it.tier].xp)} XP)`;
  const chip = (kind, key, on, icon, label, it) => `<button class="czi${on ? ' on' : ''}${it && lk(it) ? ' lk' : ''}" onclick="czSet('${kind}','${key}')" aria-pressed=${on} aria-label="${esc(label)}${it && lk(it) ? ' (bloqueado: ' + need(it) + ')' : ''}">${icon}<small>${esc(label)}</small>${it && lk(it) ? `<span class=lkb>${ic('lock', 12)}</span>` : ''}</button>`;
  const baseC = CR.COLORS.find(c => c.key == CR.BASE[g]);
  const colors = chip('color', 'auto', !m.color, `<i class=sw style="background:hsl(${baseC.hue} 80% 60%)"></i>`, 'Original') + CR.COLORS.filter(c => c.key != CR.BASE[g]).map(c => chip('color', c.key, m.color == c.key, `<i class=sw style="background:hsl(${c.hue} 80% 58%)"></i>`, c.name, c)).join('');
  const stk = chip('sticker', 'auto', !m.sticker, `<i class="sw nn"></i>`, 'Nenhum') + CR.STICKERS.map(x => chip('sticker', x.key, m.sticker == x.key, `<i class=sw style="--sc:${x.color}">${stkIcon(x.key, 22)}</i>`, x.name, x)).join('');
  const bgs = chip('bg', 'auto', !m.bg, `<i class="sw g-${g}"></i>`, 'Padrão') + CR.BACKS.map(x => chip('bg', x.key, m.bg == x.key, `<i class=sw style="background:${bgCss(x.key)}"></i>`, x.name, x)).join('');
  const hue = (CR.item(CR.COLORS, m.color) || baseC).hue;
  const outs = chip('outfit', 'auto', !m.outfit, `<i class=sw style="background:${outBg('liso', hue)}"></i>`, 'Liso') + CR.OUTFITS.filter(o => o.id).map(o => chip('outfit', o.key, m.outfit == o.key, `<i class=sw style="background:${outBg(o.key, hue)}"></i>`, o.name, o)).join('');
  const pbg = bgCss(m.bg, m.color && m.color != CR.BASE[g] ? m.color : '');
  const free = [CR.COLORS.filter(c => c.key != CR.BASE[g]), CR.STICKERS, CR.BACKS, CR.OUTFITS.filter(o => o.id)].reduce((a, l) => a + l.filter(x => !lk(x)).length, 0), all = CR.COLORS.length - 1 + CR.STICKERS.length + CR.BACKS.length + CR.OUTFITS.length - 1;
  return `<div class=sec>Personalizar personagem</div>
    <div class=czp${pbg ? ` style="--bgc:${pbg}"` : ''}><div class=czb>${body(190)}</div>${stkBadge(m.sticker, 46)}<span class=gn>${esc(gnm())}</span></div>
    <p class=tn style="margin:8px 2px 0">${free == all ? 'Você liberou todos os itens. É uma lenda!' : `${free} de ${all} itens liberados. Ganhe XP para subir de título e liberar o resto.`}</p>
    <div class=czh>Cor da roupa</div><div class=czg>${colors}</div>
    <div class=czh>Estilo da roupa</div><div class=czg>${outs}</div>
    <div class=czh>Adesivo</div><div class=czg>${stk}</div>
    <div class=czh>Fundo</div><div class=czg>${bgs}</div>`;
}
async function czSet(kind, key) {
  const it = key == 'auto' ? null : CR.item(CR.LISTS[kind], key);
  if (it && it.tier > CR.tierOf(S.me.xp)) { const t = CR.TIERS[it.tier]; return toast(`Libera com o título ${t.title} (${nf(t.xp)} XP).`); }
  const y = window.scrollY;
  try { S.me = await api('guide', { body: { [kind]: key } }); render(); window.scrollTo(0, y); } catch (e) { fail(e); }
}
async function setFrame(key) { try { S.me = await api('guide', { body: { frame: key } }); toast('Moldura trocada!'); render(); } catch (e) { fail(e); } }
// aviso de "nova conquista" na tela de resultado quando o XP faz a pessoa chegar a um novo título
const tierCard = () => { if (!S.tierUp) return ''; const t = CR.TIERS[S.tierUp]; return `<div class=tup style="--fr:${t.color}"><span class=tring>${ic('crown', 22)}</span><div class=bd><b>Nova conquista!</b><small>Você virou <b>${t.title}</b> e ganhou a moldura <b>${t.frame}</b>.</small></div><a onclick="go('pf')">Ver</a></div>`; };

// ============================================================ ANÚNCIOS (Google AdSense)
// Só aparecem se os anúncios estiverem ligados (painel do dono → Ajustes → Anúncios, ou ADSENSE_CLIENT/ADSENSE_SLOT no servidor) e houver o ID do bloco. Ficam em telas de "pausa" (início, trilhas, perfil, fim de lição) e NUNCA durante a lição ou a prova.
// O aluno NÃO escolhe o tipo de anúncio: os anúncios carregam direto e são sempre não personalizados (não usam o histórico da pessoa).
// O aviso de cookies é só informativo (um botão "Entendi") e não trava nada.
const adPref = () => { try { return localStorage.adpref || ''; } catch { return ''; } };
const adSlot = () => S.cfg.ads && (S.cfg.ads.preview || S.cfg.ads.slot) ? `<div class=ad aria-label="Publicidade"><small>Publicidade</small>${S.cfg.ads.preview ? '<div class=adfake>Espaço do anúncio</div>' : `<ins class=adsbygoogle style="display:block" data-ad-client="${esc(S.cfg.ads.client)}"${S.cfg.ads.slot ? ` data-ad-slot="${esc(S.cfg.ads.slot)}"` : ''} data-ad-format="auto" data-full-width-responsive="true"></ins>`}</div>` : '';
function adNotice() {
  if (adPref() || $('.cookie')) return;
  const d = document.createElement('div'); d.className = 'cookie'; d.setAttribute('role', 'region'); d.setAttribute('aria-label', 'Aviso sobre anúncios e cookies');
  d.innerHTML = `<p><b>Anúncios e cookies.</b> O ${esc(S.cfg.company)} é gratuito graças aos anúncios. O Google usa cookies para mostrá-los, sem usar o seu histórico de navegação. <a href="/privacidade" target="_blank">Saiba mais</a></p>
    <div class=row><button class="btn pri" id=ckOk>Entendi</button></div>`;
  document.body.appendChild(d);
  $('#ckOk').onclick = () => { try { localStorage.adpref = 'ok'; } catch { } d.remove(); };
}
function loadAds() {
  const ads = S.cfg.ads; if (!ads || ads.preview) return;
  adNotice();
  window.adsbygoogle = window.adsbygoogle || [];
  window.adsbygoogle.requestNonPersonalizedAds = 1;
  if (!document.getElementById('adsjs')) { const sc = document.createElement('script'); sc.id = 'adsjs'; sc.async = true; sc.crossOrigin = 'anonymous'; sc.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(ads.client); sc.onerror = () => { document.querySelectorAll('.ad').forEach(x => x.remove()); }; document.head.appendChild(sc); }
  document.querySelectorAll('ins.adsbygoogle:not([data-done])').forEach(el => { el.dataset.done = 1; try { window.adsbygoogle.push({}); } catch { } });
}

// ============================================================ CONTA
function editName() {
  dialog('Seu nome', [{ id: 'n', type: 'text', ph: 'Nome', ac: 'name' }], 'Salvar', async v => {
    if (!v.n.trim()) return false;
    try { S.me = await api('profile', { body: { name: v.n } }); render(); } catch (e) { fail(e); return false; }
  });
  setTimeout(() => { const i = $('#d_n'); if (i) i.value = S.me.name; }, 80);
}
async function exportData() {
  try {
    const r = await fetch('/api/export', { headers: { 'x-token': S.tk } }); if (!r.ok) throw { error: 'Não foi possível baixar seus dados.' };
    const a = document.createElement('a'); a.href = URL.createObjectURL(await r.blob()); a.download = 'meus-dados-codeup.json'; a.click();
  } catch (e) { fail(e); }
}
async function logout() { try { await api('logout', { body: {} }); } catch { } S.tk = null; localStorage.removeItem('tk'); S.auth = 'login'; showAuth(); }
function changePw() {
  const has = S.me.hasPassword;
  dialog(has ? 'Alterar senha' : 'Criar senha', [...(has ? [{ id: 'cur', ph: 'Senha atual', ac: 'current-password' }] : []), { id: 'new', ph: 'Nova senha (mín. 8 caracteres)', ac: 'new-password' }], 'Salvar', async v => {
    try { S.me = await api('password', { body: { current: v.cur || '', password: v.new } }); toast('Senha atualizada.'); render(); } catch (e) { fail(e); return false; }
  });
}
function delAccount() {
  if (!confirm('Excluir sua conta apaga seu progresso e seus certificados. Isso não pode ser desfeito.')) return;
  const has = S.me.hasPassword;
  dialog('Excluir conta', [{ id: 'c', type: has ? 'password' : 'text', ph: has ? 'Digite sua senha para confirmar' : 'Digite EXCLUIR para confirmar' }], 'Excluir para sempre', async v => {
    try { await api('account', { method: 'DELETE', body: has ? { password: v.c } : { confirm: v.c } }); S.tk = null; localStorage.removeItem('tk'); S.auth = 'register'; showAuth(); toast('Conta excluída.'); }
    catch (e) { fail(e); return false; }
  });
}

// ============================================================ LIÇÃO
async function openL(id) {
  const m = S.ls.find(l => l.id == id); if (!m) return;
  if (m.lock == 'level') return toast('Passe na prova do nível anterior para liberar este nível.', true);
  if (m.lock == 'seq') return toast('Conclua a lição anterior para liberar esta.', true);
  if (m.lock == 'cp') { const c = cpBefore(m); if (c && !c.lock) { toast('Antes, faça o checkpoint: uma consulta com o que você aprendeu.'); return openCp(c.id); } return toast('Faça o checkpoint para liberar esta lição.', true); }
  try { S.cur = await api('lessons/' + id); } catch (e) { return fail(e); }
  S.ex = null; S.h = 0; S.hearts = 5; S.tries = 0; S.errs = 0; lesson();
}
// Checkpoint: desafio obrigatório que aparece a cada 5 lições (uma consulta com o que se aprendeu). Libera a lição seguinte. Vai direto para a prática, sem teoria.
async function openCp(id) {
  const c = (S.cps || []).find(x => x.id == id); if (!c) return;
  if (c.lock) return toast(`Conclua a lição ${c.after} para liberar este checkpoint.`, true);
  try { S.cur = await api('lessons/' + id); } catch (e) { return fail(e); }
  S.ex = null; S.h = 0; practice();
}
function editor(l) {
  const ed = $('#ed'), gut = $('#gut'), hp = $('#hlp'); let lastV = null;
  const sync = () => {                                   // números de linha + "Ln, Col" na barra de status
    if (hp) { if (lastV !== ed.value) { lastV = ed.value; hp.innerHTML = hl(ed.value, l.type) + '\n'; } hp.scrollTop = ed.scrollTop; hp.scrollLeft = ed.scrollLeft; }   // texto colorido (a caixa de texto fica transparente por cima)
    if (gut) { const n = ed.value.split('\n').length; if (gut.dataset.n != n) { gut.dataset.n = n; gut.textContent = Array.from({ length: n }, (_, i) => i + 1).join('\n'); } gut.scrollTop = ed.scrollTop; }
  };
  ['input', 'scroll', 'keyup', 'click', 'focus'].forEach(ev => ed.addEventListener(ev, sync)); setTimeout(sync, 0); S.sync = sync;
  ed.onkeydown = e => {
    if (e.key == 'Tab') { e.preventDefault(); ed.setRangeText(l.type == 'sql' ? '  ' : '    ', ed.selectionStart, ed.selectionEnd, 'end'); }
    if ((e.ctrlKey || e.metaKey) && e.key == 'Enter') { e.preventDefault(); S.ex ? runExam() : concluir(); }
  };
}
const edBox = (q, value) => `<div class=ed><div class=edh><i></i><i></i><i></i><span>${q.type == 'sql' ? 'consulta.sql' : 'main.py'}</span></div>
  <div class=edb><div class=gut id=gut>1</div><pre class=hlp id=hlp aria-hidden=true></pre><textarea id=ed wrap=off spellcheck=false autocapitalize=off autocomplete=off autocorrect=off>${esc(value)}</textarea></div></div>`;
const OUT0 = 'O resultado do seu código aparece aqui depois que você tocar em <b>Concluído</b>.<div class=tn>Atalhos: Ctrl+Enter conclui · Tab indenta</div>', DONE_BTN = `${ic('check', 18)} Concluído`;
const outBox = (inner) => `<div class=ob><div class=obh><span>${S.cur.type == 'sql' ? 'Resultado' : 'Saída'}</span></div><div id=out class=out>${inner}</div></div>`;

const steps = n => `<div class=steps><span class="${n == 1 ? 'on' : 'ok'}">${n == 1 ? '1' : ic('check', 14)} Teoria</span><i></i><span class="${n == 2 ? 'on' : ''}">2 Prática</span></div>`;
function lesson() {   // etapa 1: teoria
  delete document.body.dataset.calm;
  const l = S.cur; theme(l.track); S.step = 'teoria'; clearTimeout(LT);
  A.innerHTML = `<div class=c><div class=top><button class=ibtn onclick="go('home')" aria-label="Fechar">${ic('x', 20)}</button><div class=bar><i style="width:${(l.n - 1) / 30 * 100}%"></i></div><b class=hearts style="color:var(--acc)">${l.n}/30</b></div>
  ${steps(1)}<div class=crumb>${tg(l.track, 24)}<span>${TN[l.track]} · ${esc(l.level)} · Lição ${l.n} de 30</span></div><h2 class=ttl>${esc(l.title)}</h2>
  <div class=tutor><img src="${IMG().full}" alt="${esc(gnm())}"><div class=sb>${esc(l.explain)}</div></div>${codeBox(l.example, l.type, 'Exemplo')}
  <p class=tn style="text-align:center">Leia com calma. Na próxima etapa você pratica e, quando terminar, toca em <b>Concluído</b> para conferir.</p>
  <button class="btn pri block" onclick=practice()>Entendi, ir para a prática ${ic('arrow', 16)}</button></div>`;
  window.scrollTo(0, 0);
}
function practice() {   // etapa 2: prática. Nada é executado nem mostrado enquanto o aluno digita: resultado, erro e dicas de correção só aparecem depois que ele toca em Concluído (botão fixo no rodapé)
  document.body.dataset.calm = '1';   // fundo 3D mais leve enquanto o aluno digita
  const l = S.cur; theme(l.track); S.step = 'pratica'; S.lt = 0; S.t0 = Date.now(); S.h = 0; clearTimeout(LT);
  A.innerHTML = `<div class="c pr"><div class=top><button class=ibtn onclick="go('home')" aria-label="Fechar">${ic('x', 20)}</button><div class=bar><i style="width:${l.n / 30 * 100}%"></i></div><b class=hearts style="color:var(--acc)">${l.n}/30</b></div>
  ${l.cp ? '' : steps(2)}<div class=crumb>${tg(l.track, 24)}<span>${l.cp ? 'Checkpoint · ' : ''}${esc(l.title)}</span></div>
  <div class=task>${ic(l.cp ? 'flag' : 'target', 20)}<div><small>${l.cp ? 'Checkpoint: use o que aprendeu nas últimas 5 lições' : 'Desafio'}</small>${esc(l.task)}</div></div>
  ${edBox(l, l.starter)}
  <div class=acts><button class="btn ghost" onclick=hint()>${ic('bulb', 16)} Dica</button><button class="btn ghost" onclick=peek()>${ic('eye', 16)} Ver dados</button><button class="btn ghost" onclick=sol()>Solução</button>${l.cp ? '' : `<button class="btn ghost" onclick=lesson()>${ic('file', 16)} Teoria</button>`}<button class="btn ghost" onclick=limpar() aria-label="Limpar">${ic('eraser', 16)}</button></div>
  ${outBox(OUT0)}
  <div id=fb class="fb idle" aria-live=polite></div></div>
  <div class=dbar><button class="btn ok block" id=bdone onclick=concluir()>${DONE_BTN}</button></div>`;
  dockBar();
  editor(l); const ed = $('#ed'); ed.addEventListener('focus', () => { if (ed.selectionStart == 0 && ed.selectionEnd == 0) ed.setSelectionRange(ed.value.length, ed.value.length); }, { once: true }); window.scrollTo(0, 0);
}
function hint() { const l = S.cur, o = $('#out'); o.className = 'out'; o.innerHTML = `<div class=hintb>${ic('bulb', 16)} <span></span></div>`; o.querySelector('span').textContent = l.hints[Math.min(S.h++, l.hints.length - 1)]; }
function sol() { const o = $('#out'); o.className = 'out'; o.innerHTML = `<div class=tn style="margin:0 0 6px">Solução</div><pre class=inl>${hl(niceSql(S.cur.solution, S.cur.type), S.cur.type)}</pre>`; }

// ---------- correção: o código só é executado e conferido quando o aluno toca em "Concluído" ----------
let LT;
const norm = x => x === null ? 'NULL' : String(x);
function lev(a, b) { const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]); for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] == b[j - 1] ? 0 : 1)); return d[a.length][b.length]; }
function similar(w, list) { w = w.toLowerCase(); let best = null, bd = 3; for (const x of list) { if (x.toLowerCase() == w) return null; const d = lev(w, x.toLowerCase()); if (d < bd) { bd = d; best = x; } } return best; }
function setFb(st, html, extra) {
  const f = $('#fb'); if (!f) return; f.className = 'fb ' + st;
  if (st == 'idle') f.innerHTML = '';
  else f.innerHTML = `<div class=fbh>${ic(st == 'err' ? 'x' : 'info', 22)} <b>${st == 'err' ? 'Tem um erro no código' : st == 'srv' ? 'O corretor não respondeu' : 'Ainda não está certo'}</b></div>${html}`;
  const ob = st != 'idle' && $('#out') && $('#out').closest('.ob'); if (ob) ob.scrollIntoView({ behavior: 'smooth', block: 'start' });   // leva o aluno ao resultado + explicação (o botão Concluído não sai do lugar)
}
const fixit = (line, code, tips) => `${line ? `<div class=where><small>Onde corrigir · linha ${line}</small><code>${esc(code)}</code></div>` : ''}${tips.map(t => `<p class=tip>${t}</p>`).join('')}`;
function diagErr(e, code, l) {
  const m = String(e.message || e), lines = code.split('\n'); let line = 0, tips = [];
  if (l.type == 'python') {
    const ln = [...m.matchAll(/line (\d+)/g)].pop(); if (ln) line = +ln[1];
    const nm = m.match(/name '([^']+)' is not defined/);
    if (nm) { const ids = [...new Set([...code.matchAll(/[A-Za-z_]\w*/g)].map(x => x[0]))].filter(x => x != nm[1]); const sg = similar(nm[1], [...ids, ...PY_FN]); line = line || lines.findIndex(x => x.includes(nm[1])) + 1;
      tips.push(`O nome <b>${esc(nm[1])}</b> não existe.${sg ? ` Você quis dizer <b>${esc(sg)}</b>?` : ' Confira se digitou igual ao que você criou antes.'}`); }
    else tips.push(esc(friendly(m).split('\n\n')[0]));
    if (/IndentationError|unexpected indent/.test(m)) tips.push('Use 4 espaços no começo das linhas de dentro de if, for e def.');
    if (/SyntaxError/.test(m) && !tips.length) tips.push('Revise parênteses, aspas e dois-pontos no fim de if/for/def.');
  } else {
    const nr = m.match(/near "([^"]+)"/), nc = m.match(/no such column: (\S+)/), nt = m.match(/no such table: (\S+)/);
    const tok = (nr || nc || nt || [])[1]; if (tok) line = lines.findIndex(x => x.toLowerCase().includes(tok.toLowerCase())) + 1;
    if (nr) { const sg = similar(nr[1], KW_ALL); tips.push(`Algo está errado perto de <b>${esc(nr[1])}</b>.${sg ? ` Você quis dizer <b>${esc(sg.toUpperCase())}</b>?` : ' Confira vírgulas, aspas e a ordem das palavras (SELECT, FROM, WHERE…).'}`); }
    else if (nc || nt) { const words = [...new Set([...(l.seed || '').matchAll(/[A-Za-z_]\w*/g)].map(x => x[0]))]; const sg = similar(tok, words);
      tips.push(`${nc ? 'A coluna' : 'A tabela'} <b>${esc(tok)}</b> não existe.${sg ? ` Você quis dizer <b>${esc(sg)}</b>?` : ' Use "Ver dados" para conferir os nomes.'}`); }
    else tips.push(esc(friendly(m).split('\n\n')[0]));
  }
  return fixit(line, line ? lines[line - 1] : '', tips);
}
function sameRows(a, b) { return JSON.stringify(a) == JSON.stringify(b); }
async function diagSql(l, code, raw, missing) {
  await loadSql(); const db = new S.SQL.Database(); db.run(l.seed); const ex = db.exec(l.solution), exp = ex[ex.length - 1] || { columns: [], values: [] };
  const got = raw || { columns: [], values: [] }, tips = [];
  const ec = exp.columns.map(x => x.toLowerCase()), gc = got.columns.map(x => x.toLowerCase());
  if (missing) tips.push(`Falta usar <b>${esc(missing.toUpperCase())}</b> na sua consulta.`);
  if (!sameRows(ec, gc)) tips.push(`<b>Colunas diferentes.</b> Você trouxe: ${esc(got.columns.join(', ') || '(nada)')}. O esperado é: ${esc(exp.columns.join(', '))}. Ajuste a lista logo depois do SELECT (e os apelidos com AS).`);
  else if (got.values.length != exp.values.length) tips.push(`<b>Quantidade de linhas diferente.</b> Sua consulta retornou ${got.values.length}; o esperado são ${exp.values.length}. ${got.values.length > exp.values.length ? 'Está sobrando linha: revise o <b>WHERE</b>, o <b>HAVING</b> ou o <b>LIMIT</b>.' : 'Está faltando linha: seu filtro (<b>WHERE</b>/<b>JOIN</b>) está restringindo demais.'}`);
  else {
    const S1 = x => x.values.map(v => JSON.stringify(v.map(norm))).sort();
    const U1 = x => x.values.map(v => JSON.stringify(v.map(norm)));
    if (sameRows(U1(got), U1(exp))) tips.push('<b>Seu resultado está igual ao esperado</b>, mas o servidor não conseguiu confirmar agora. Tente de novo em instantes; se continuar, avise quem administra o site.');
    else if (sameRows(S1(got), S1(exp))) tips.push('<b>As linhas estão certas, mas na ordem errada.</b> Revise o <b>ORDER BY</b> (e ASC/DESC).');
    else { let k = -1, c = -1; for (let i = 0; i < exp.values.length && k < 0; i++) for (let j = 0; j < exp.columns.length; j++) if (norm(got.values[i][j]) != norm(exp.values[i][j])) { k = i; c = j; break; }
      tips.push(k < 0 ? 'Os valores estão diferentes do esperado.' : `<b>Valor diferente</b> na linha ${k + 1}, coluna <b>${esc(exp.columns[c])}</b>: você tem <b>${esc(norm(got.values[k][c]))}</b>, o esperado é <b>${esc(norm(exp.values[k][c]))}</b>. Confira a conta, a função ou o filtro dessa coluna.`); }
  }
  return fixit(0, '', tips) + `<div class=exp><small>Resultado esperado${exp.values.length > 4 ? ` (primeiras 4 de ${exp.values.length} linhas)` : ''}</small>${table({ columns: exp.columns, values: exp.values.slice(0, 4) })}</div>`;
}
function diagPy(l, out, expected, missing) {
  const tips = [], g = String(out || '').trim().split('\n'), e = String(expected || '').split('\n'); let html = '';
  if (missing) tips.push(`Falta usar <b>${esc(missing)}</b> no seu código.`);
  if (!String(out || '').trim()) tips.push('Seu código ainda não <b>imprimiu nada</b>. Use <b>print(...)</b> para mostrar o resultado.');
  else {
    const n = Math.max(g.length, e.length); let k = -1; for (let i = 0; i < n; i++) if ((g[i] ?? '') != (e[i] ?? '')) { k = i; break; }
    if (k >= 0) tips.push(`<b>Saída diferente na linha ${k + 1}:</b> você imprimiu <code>${esc(g[k] ?? '(nada)')}</code> e o esperado é <code>${esc(e[k] ?? '(nada)')}</code>.`);
    if (g.length != e.length) tips.push(`Você imprimiu ${g.length} linha(s); o esperado são ${e.length}. ${g.length > e.length ? 'Tem <b>print</b> sobrando.' : 'Falta algum <b>print</b>.'}`);
    else tips.push('Confira o cálculo, o texto (maiúsculas, espaços e pontuação) e a ordem em que você imprime.');
  }
  return fixit(0, '', tips) + `<div class=exp><small>Saída esperada</small><pre class=inl>${esc(expected)}</pre></div>`;
}
// Botão "Concluído" (fixo no rodapé): só agora o código é executado e conferido. Certo → tela da lição concluída (e dali, próxima lição); errado → mostra o resultado e explica o que ajustar.
async function concluir() {
  const l = S.cur, ed = $('#ed'); if (!ed || S.ex || S.step != 'pratica' || S.busy) return;
  const code = ed.value, id = ++S.lt, o = $('#out'), b = $('#bdone'), fb = $('#fb');
  if (!code.replace(/(--|#)[^\n]*/g, '').trim()) return setFb('bad', fixit(0, '', ['Escreva sua resposta no editor e depois toque em <b>Concluído</b>.']));
  S.busy = true; if (b) { b.disabled = true; b.innerHTML = '<span class=spin></span> Conferindo…'; } if (fb) fb.classList.add('stale');   // o botão só troca o texto: não muda de tamanho nem de lugar
  try {
    let r;
    try { r = l.type == 'sql' ? await runSql(l, code) : await runPy(l, code, () => id != S.lt); }
    catch (e) { if (e.message == 'STALE') return setFb('idle'); showErr(e); return setFb('err', diagErr(e, code, l)); }
    o.className = 'out'; o.innerHTML = r.html;
    let s;
    try { s = await api('submit', { body: { id: l.id, code, out: r.out || '' } }); }
    catch (e) { if (e.engine || e.status == 503) return setFb('srv', fixit(0, '', [esc(e.error || 'O servidor não respondeu agora. Toque em Concluído de novo.')])); throw e; }
    if (!s.ok) return setFb('bad', l.type == 'sql' ? await diagSql(l, code, r.raw, s.missing) : diagPy(l, r.out, s.expected, s.missing));
    const xb = S.me.xp, before = Math.floor(S.me.xp / 100); Object.assign(S.me, { xp: s.xp, gems: s.gems, streak: s.streak, done: s.done, cps: s.cps }); S.tierUp = CR.tierOf(s.xp) > CR.tierOf(xb) ? CR.tierOf(s.xp) : 0;
    S.gained = s.gained; S.lvlUp = Math.floor(s.xp / 100) > before ? Math.floor(s.xp / 100) + 1 : 0; try { [S.ls, S.cps] = await Promise.all([api('lessons'), api('checkpoints')]); } catch { }
    result();
  } catch (e) { setFb('idle'); fail(e); }
  finally { S.busy = false; const bb = $('#bdone'); if (bb) { bb.disabled = false; bb.innerHTML = DONE_BTN; } }
}
// Limpar: esvazia o editor e volta ao estado inicial (sem executar nada)
function limpar() {
  const ed = $('#ed'); if (!ed || S.busy) return; ++S.lt; ed.value = ''; ed.dispatchEvent(new Event('input')); ed.focus();
  const o = $('#out'); o.className = 'out'; o.innerHTML = OUT0; setFb('idle');
}
// O botão Concluído fica preso ao rodapé da tela; quando o teclado do celular abre, ele sobe junto e continua à vista.
let dockOn = false;
function dockBar() {
  const fit = () => { const bar = $('.dbar'), vv = window.visualViewport; if (!bar || !vv) return; const kb = Math.max(0, Math.round(innerHeight - vv.height - vv.offsetTop)); bar.style.transform = kb > 40 ? `translateY(${-kb}px)` : ''; };
  if (!dockOn && window.visualViewport) { dockOn = true; visualViewport.addEventListener('resize', fit); visualViewport.addEventListener('scroll', fit); }
  fit();
}

const table = r => !r ? '<i>(tabela vazia)</i>' : `<div class=tw><table><tr>${r.columns.map(c => `<th>${esc(c)}</th>`).join('')}</tr>${r.values.slice(0, 200).map(v => `<tr>${v.map(x => `<td>${x === null ? '<i>NULL</i>' : esc(x)}</td>`).join('')}</tr>`).join('')}</table></div>`;

async function loadSql() {
  if (S.SQL) return;
  // 1º tenta o sql.js do próprio servidor; se não vier, tenta o CDN (assim o SQL não para por causa de uma instalação incompleta)
  const BASES = ['/vendor/sql/', `https://cdn.jsdelivr.net/npm/sql.js@${SQLJS_V}/dist/`]; let base = null;
  if (typeof initSqlJs == 'undefined') {
    for (const b of BASES) {
      try { await new Promise((ok, no) => { const s = document.createElement('script'); s.src = b + 'sql-wasm.js'; s.onload = ok; s.onerror = () => { s.remove(); no(new Error('OFFLINE')); }; document.head.appendChild(s); }); base = b; break; } catch { }
    }
    if (!base) throw new Error('OFFLINE');
  } else base = BASES[0];
  S.SQL = await initSqlJs({ locateFile: f => base + f });
}
async function runSql(l, code) {
  await loadSql(); const db = new S.SQL.Database(); db.run(l.seed); const res = db.exec(code), last = res[res.length - 1];
  const rows = JSON.stringify(last ? last.values : []);
  return { out: rows.length < 40000 ? rows : '', raw: last, html: last ? table(last) : '<i>Comando executado (sem tabela de resultado).</i>' };
}

// Python roda num Web Worker: um loop infinito não trava a página (o worker é encerrado após 10 s).
const WSRC = `importScripts('https://cdn.jsdelivr.net/pyodide/v${PYO_V}/full/pyodide.js');
let py;
onmessage = async e => { const m = e.data;
  try {
    if (m.t == 'init') { py = await loadPyodide(); postMessage({ t: 'ready' }); }
    else if (m.t == 'load') { await py.loadPackagesFromImports(m.src); postMessage({ t: 'loaded' }); }
    else if (m.t == 'run') {
      const out = []; py.setStdout({ batched: s => out.push(s) }); py.setStderr({ batched: s => out.push(s) });
      const g = py.globals.get('dict')();
      try { if (m.pre) await py.runPythonAsync(m.pre, { globals: g }); await py.runPythonAsync(m.code, { globals: g }); postMessage({ t: 'done', out: out.join('\\n') }); }
      catch (err) { postMessage({ t: 'err', msg: String(err.message || err), out: out.join('\\n') }); }
      finally { g.destroy(); }
    }
  } catch (err) { postMessage({ t: 'fatal', msg: String(err.message || err) }); }
};`;
function pyCall(msg, ms) {
  return new Promise((ok, no) => {
    if (!S.pw) S.pw = new Worker(URL.createObjectURL(new Blob([WSRC], { type: 'text/javascript' })));
    const w = S.pw, tm = ms && setTimeout(() => { w.terminate(); S.pw = null; S.pyReady = false; no(new Error('TIMEOUT')); }, ms);
    w.onmessage = e => { clearTimeout(tm); e.data.t == 'fatal' ? no(new Error('OFFLINE')) : ok(e.data); };
    w.onerror = () => { clearTimeout(tm); S.pw = null; S.pyReady = false; no(new Error('OFFLINE')); };
    w.postMessage(msg);
  });
}
let pq = Promise.resolve();
function runPy(l, code, stale) {   // uma execução por vez no mesmo worker
  const job = pq.catch(() => { }).then(async () => {
    if (stale && stale()) throw new Error('STALE');
    const o = $('#out'), pre = l.prelude || '', say = t => { if (o && !(stale && S.pyReady)) o.textContent = t; };
    if (!S.pyReady) { say('Carregando Python (só na 1ª vez, pode levar alguns segundos)…'); await pyCall({ t: 'init' }, 90000); S.pyReady = true; }
    if (/import\s/.test(pre + code)) { if (!stale) say('Preparando bibliotecas…'); await pyCall({ t: 'load', src: pre + '\n' + code }, 180000); }
    if (stale && stale()) throw new Error('STALE');
    if (!stale) say('Executando…');
    const r = await pyCall({ t: 'run', pre, code }, 10000);
    if (r.t == 'err') { const e = new Error(r.msg); e.out = r.out; throw e; }
    return { out: r.out, html: `<pre class=inl>${esc(r.out) || '(sem saída)'}</pre>` };
  });
  pq = job; return job;
}
async function peek() {
  const l = S.cur, o = $('#out'); o.className = 'out';
  try {
    if (l.type == 'sql') {
      await loadSql(); const db = new S.SQL.Database(); db.run(l.seed);
      o.innerHTML = db.exec("SELECT name FROM sqlite_master WHERE type='table'")[0].values.flat().map(t => `<div class=tname>${ic('db', 14)} ${esc(t)}</div>` + table(db.exec(`SELECT * FROM ${t}`)[0])).join('');
    } else if (l.peek) { o.innerHTML = (await runPy(l, l.peek)).html; }
    else o.textContent = 'Esta atividade não tem dados para mostrar.';
  } catch (e) { showErr(e); }
}

function friendly(m) {
  const x = [[/no such table/, 'Tabela não encontrada. Confira o nome da tabela.'], [/no such column/, 'Coluna não encontrada. Confira os nomes das colunas.'],
    [/syntax error|incomplete input/i, 'Erro de sintaxe: revise vírgulas, aspas, parênteses e a ordem das palavras.'], [/NameError/, 'Nome não definido: você usou algo que ainda não criou ou digitou errado.'],
    [/IndentationError/, 'Erro de indentação: alinhe o código com espaços.'], [/SyntaxError/, 'Erro de sintaxe: revise parênteses, aspas e dois-pontos.'],
    [/KeyError/, 'Chave não encontrada: confira o nome da coluna ou da chave.'], [/TypeError/, 'Tipos incompatíveis: confira o que você está somando, comparando ou chamando.'],
    [/ZeroDivisionError/, 'Divisão por zero.'], [/AttributeError/, 'Esse objeto não tem esse recurso. Confira o nome do método.'], [/ModuleNotFoundError/, 'Biblioteca não encontrada.'], [/EOFError/, 'O comando input() não funciona aqui.']];
  const f = x.find(r => r[0].test(m));
  return (f ? f[1] + '\n\n' : '') + 'Detalhe técnico: ' + m.trim().split('\n').slice(-1)[0];
}
function showErr(e) {
  const o = $('#out'), m = String(e.message || e); o.className = 'out er';
  if (m == 'TIMEOUT') return void (o.textContent = 'Seu código demorou demais e foi interrompido. Verifique se há um loop infinito.');
  if (m == 'OFFLINE') return void (o.textContent = 'Não foi possível carregar o ambiente de código. Verifique sua internet e tente de novo.');
  o.textContent = (e.out ? e.out + '\n\n' : '') + friendly(m);
}

function result() {
  delete document.body.dataset.calm;
  if (S.cur.cp) return resultCp();
  const l = S.cur, i = S.ls.findIndex(x => x.id == l.id), nx = S.ls[i + 1] && S.ls[i + 1].track == l.track && S.ls[i + 1].lv == l.lv ? S.ls[i + 1] : null;
  const last = !nx, needCp = nx && nx.lock == 'cp' ? cpBefore(nx) : null;
  const btn = last ? `<button class="btn pri block" onclick="examIntro(${l.lv})">${ic('cap', 16)} Fazer a prova do nível</button>`
    : needCp ? `<button class="btn pri block" onclick="openCp('${needCp.id}')">${ic('flag', 16)} Fazer o checkpoint</button>`
    : `<button class="btn pri block" onclick="openL('${nx.id}')">Próxima lição ${ic('arrow', 16)}</button>`;
  confetti(); A.innerHTML = `<div class="c res">${stage(230, 'Mandou bem!', 'good')}<h1>Lição concluída!</h1><p class=sub>Lição ${l.n} de 30 · ${TN[l.track]} ${esc(l.level)}</p>${S.lvlUp ? `<p class=gl>Você subiu para o nível ${S.lvlUp}.</p>` : ''}${tierCard()}
  ${last ? `<p class=gl>Você terminou as 30 lições de ${esc(l.level)}. Agora faça a prova para liberar o próximo nível.</p>` : ''}
  ${needCp ? `<p class=gl>Checkpoint liberado! Faça uma consulta com o que você aprendeu nas últimas 5 lições para abrir a lição ${nx.n}.</p>` : ''}
  <div class=stats3><div><b>+${S.gained}</b><small>XP</small></div><div><b>${S.h}</b><small>dicas usadas</small></div><div><b>${Math.max(1, Math.round((Date.now() - S.t0) / 1000))}s</b><small>na prática</small></div></div>
  ${S.gained ? '' : '<p class=tn>Você já tinha ganhado os pontos desta lição.</p>'}
  ${btn}<button class="btn ghost block" onclick="go('home')">Voltar ao mapa</button><button class="btn ghost block" onclick=lesson()>Rever explicação</button>${adSlot()}</div>`;
  loadAds();
}

function resultCp() {
  const l = S.cur, nx = S.ls.find(x => x.track == l.track && x.lv == l.lv && x.n == l.after + 1);
  confetti(); A.innerHTML = `<div class="c res">${stage(230, 'Checkpoint conquistado!', 'good')}<h1>Checkpoint concluído!</h1><p class=sub>${TN[l.track]} ${esc(l.level)} · depois da lição ${l.after}</p>${S.lvlUp ? `<p class=gl>Você subiu para o nível ${S.lvlUp}.</p>` : ''}${tierCard()}
  <div class=stats3><div><b>+${S.gained}</b><small>XP extra</small></div><div><b>${S.h}</b><small>dicas usadas</small></div><div><b>${Math.max(1, Math.round((Date.now() - S.t0) / 1000))}s</b><small>no desafio</small></div></div>
  ${S.gained ? '' : '<p class=tn>Você já tinha ganhado os pontos deste checkpoint.</p>'}
  ${nx ? `<button class="btn pri block" onclick="openL('${nx.id}')">Próxima lição ${ic('arrow', 16)}</button>` : ''}<button class="btn ghost block" onclick="go('home')">Voltar ao mapa</button>${adSlot()}</div>`;
  loadAds();
}

// ============================================================ PROVA
function examIntro(lv, t) {
  t = t || S.me.track; const k = t + '-' + lv, nd = lvDone(t, lv); theme(t);
  if (passedLv(t, lv)) return toast('Você já foi aprovado nesta prova.');
  if ((nd < 30 && !unl(t)) || !lvOpen(t, lv)) return toast(`Conclua as 30 lições de ${LV[lv - 1]} (${TN[t]}) para liberar a prova. Você fez ${nd}.`, true);
  const going = S.me.exams.includes(k);
  A.innerHTML = `<div class="c res">${stage(220, fm('Pronto', 'Pronta') + ' para a prova? Você consegue!')}<h1>Prova ${TN[t]} ${LV[lv - 1]}</h1>
  <div class="panel rules"><b>Antes de começar</b><ul><li>10 questões de código, sorteadas de um banco maior.</li><li>Nota mínima para passar: <b>70%</b> (7 acertos).</li><li>Sem dicas e sem ver a solução. O resultado só aparece no final.</li><li>Você pode pular e voltar às questões antes de entregar.</li><li><b>Se não passar, você refaz as 30 lições do nível</b> antes de tentar de novo.</li></ul></div>
  <button class="btn pri block" onclick="examStart(${lv},'${t}')">${going ? 'Continuar a prova' : 'Começar a prova'}</button><button class="btn ghost block" onclick="go('home')">Agora não</button></div>`;
}
async function examStart(lv, t) {
  try {
    const r = await api('exam/start', { body: { track: t, level: lv } });
    S.ex = { t, lv, qs: r.questions, i: 0, saved: Object.fromEntries(r.answered.map(id => [id, true])), draft: {} };
    examQ();
  } catch (e) { fail(e); }
}
function examQ() {
  document.body.dataset.calm = '1';
  const x = S.ex, q = x.qs[x.i]; S.cur = q; theme(x.t);
  const dots = x.qs.map((z, j) => `<span class="dt ${j == x.i ? 'on' : x.saved[z.id] ? 'ok' : ''}" onclick="examGo(${j})">${j + 1}</span>`).join('');
  A.innerHTML = `<div class=c><div class=top><button class=ibtn onclick="examLeave()" aria-label="Sair da prova">${ic('x', 20)}</button><div class=bar><i style="width:${Object.keys(x.saved).length / x.qs.length * 100}%"></i></div><b class=hearts>${x.i + 1}/${x.qs.length}</b></div>
  <div class=dots>${dots}</div><div class=crumb>${tg(x.t, 24)}<span>Prova · ${TN[x.t]} ${LV[x.lv - 1]}</span></div><h2 class=ttl>Questão ${x.i + 1}</h2>
  <div class=task>${ic('target', 20)}<div><small>Enunciado</small>${esc(q.task)}</div></div>
  ${edBox(q, x.draft[q.id] ?? q.starter)}
  <div class=acts><button class="btn ghost" id=bx onclick=runExam()>${ic('play', 16)} Testar</button><button class="btn ghost" onclick=peek()>${ic('eye', 16)} Ver dados</button></div>
  ${outBox(`Teste seu código aqui. Depois toque em "Salvar resposta".${x.saved[q.id] ? '<div class=tn>Você já salvou uma resposta para esta questão (pode trocar).</div>' : ''}`)}
  <button class="btn ok block" style="margin-top:12px" id=bsv onclick=examSave()>Salvar resposta ${x.i < x.qs.length - 1 ? 'e continuar' : ''}</button>
  <div class=pair><button class="btn ghost" ${x.i == 0 ? 'disabled' : ''} onclick="examGo(${x.i - 1})">${ic('back', 16)} Anterior</button><button class="btn ghost" onclick="${x.i < x.qs.length - 1 ? `examGo(${x.i + 1})` : 'examSummary()'}">${x.i < x.qs.length - 1 ? 'Pular ' + ic('arrow', 16) : 'Revisar e entregar'}</button></div></div>`;
  editor(q); window.scrollTo(0, 0);
}
function examGo(j) { const x = S.ex; const ed = $('#ed'); if (ed) x.draft[x.qs[x.i].id] = ed.value; x.i = j; examQ(); }
function examLeave() { if (confirm('Sair da prova? Suas respostas salvas ficam guardadas e você pode continuar depois.')) { S.ex = null; go('home'); } }
async function execOnly() {   // roda o código atual e devolve a saída (para enviar à correção); null se deu erro
  const l = S.cur, code = $('#ed').value, o = $('#out'); o.className = 'out'; o.textContent = 'Executando…';
  try { const r = l.type == 'sql' ? await runSql(l, code) : await runPy(l, code); o.innerHTML = r.html; return { code, out: r.out || '' }; }
  catch (e) { showErr(e); return null; }
}
async function runExam() {
  if (S.busy) return; S.busy = true; const b = $('#bx'); b.disabled = true;
  try { if (!$('#ed').value.trim()) $('#out').textContent = 'Escreva seu código primeiro.'; else await execOnly(); } finally { S.busy = false; b.disabled = false; }
}
async function examSave() {
  if (S.busy) return; const x = S.ex, q = x.qs[x.i]; S.busy = true; const b = $('#bsv'); b.disabled = true;
  try {
    if (!$('#ed').value.trim()) { $('#out').textContent = 'Escreva seu código primeiro.'; return; }
    const r = await execOnly(); if (!r) return;     // com erro de código: não salva, deixa corrigir
    await api('exam/answer', { body: { track: x.t, level: x.lv, qid: q.id, code: r.code, out: r.out } });
    x.saved[q.id] = true; x.draft[q.id] = r.code;
    if (x.i < x.qs.length - 1) { x.i++; examQ(); } else examSummary();
  } catch (e) { fail(e); } finally { S.busy = false; const bb = $('#bsv'); if (bb) bb.disabled = false; }
}
function examSummary() {
  const x = S.ex, ed = $('#ed'); if (ed) x.draft[x.qs[x.i].id] = ed.value;
  const n = Object.keys(x.saved).length, miss = x.qs.length - n;
  A.innerHTML = `<div class="c res"><h1>Revisar e entregar</h1><p class=sub>${n} de ${x.qs.length} questões com resposta salva.${miss ? ` <b>${miss} sem resposta contam como erro.</b>` : ''}</p>
  ${x.qs.map((z, j) => `<div class=card onclick="examGo(${j})"><span class="ib ${x.saved[z.id] ? 'ok' : ''}">${x.saved[z.id] ? ic('check', 20) : j + 1}</span><div class=bd><b>Questão ${j + 1}</b><small>${x.saved[z.id] ? 'Resposta salva' : 'Sem resposta'}</small></div><span class=r>Abrir</span></div>`).join('')}
  <button class="btn ok block" onclick=examFinish()>Entregar a prova</button><button class="btn ghost block" onclick="examGo(${x.qs.length - 1})">Voltar às questões</button></div>`;
}
async function examFinish() {
  const x = S.ex;
  if (!confirm('Entregar a prova agora? Depois não dá para mudar as respostas.')) return;
  try { const r = await api('exam/finish', { body: { track: x.t, level: x.lv } }), xb = S.me.xp; Object.assign(S.me, { xp: r.xp, gems: r.gems, done: r.done, passed: r.passedMap, fails: r.fails, exams: r.exams, certs: r.certs }); S.tierUp = CR.tierOf(r.xp) > CR.tierOf(xb) ? CR.tierOf(r.xp) : 0; S.ex = null; examResult(r, x); }
  catch (e) { fail(e); }
}
function examResult(r, x) {
  delete document.body.dataset.calm;
  const t = x.t, lv = x.lv;
  if (r.passed) {
    const next = lv < 3, fin = r.trackComplete;
    confetti(); A.innerHTML = `<div class="c res">${stage(240, 'Aprovado! Que orgulho!', 'good')}<h1>Aprovado!</h1><p class=sub>${r.score} de ${r.total} (${r.pct}%)</p>${tierCard()}
    <div class=stats3><div><b>${r.score}/${r.total}</b><small>acertos</small></div><div><b>+${r.bonus || 0}</b><small>XP bônus</small></div><div><b>${r.passPct}%</b><small>nota mínima</small></div></div>
    <p class=gl>${fin ? `Você concluiu toda a trilha ${TN[t]}. Seu certificado está pronto.` : next ? `O nível <b>${LV[lv]}</b> foi liberado.` : ''}</p>
    ${fin ? `<button class="btn pri block" onclick="certFlow('${t}')">${ic('award', 16)} Emitir meu certificado</button>` : ''}
    <button class="btn ${fin ? 'ghost' : 'pri'} block" onclick="S.lv=${next ? lv + 1 : lv};S.scroll=true;go('home')">${next ? 'Ir para o nível ' + LV[lv] : 'Voltar ao mapa'}</button></div>`;
  } else {
    A.innerHTML = `<div class="c res">${stage(220, 'Calma, vamos de novo!', 'bad')}<h1>Não foi dessa vez</h1><p class=sub>${r.score} de ${r.total} (${r.pct}%)</p>
    <p class=gl>A nota mínima é ${r.passPct}%. Para tentar de novo você precisa <b>refazer as 30 lições</b> de ${LV[lv - 1]}, que é o que fixa o conteúdo de verdade. Os pontos que você já ganhou continuam seus.</p>
    <button class="btn pri block" onclick="S.lv=${lv};S.scroll=true;go('home')">Recomeçar o nível</button></div>`;
  }
}

// ============================================================ CERTIFICADO
function certFlow(t) {
  if (!trackPassed(t)) return toast(`Passe nas 3 provas de ${TN[t]} para receber o certificado.`, true);
  const c = S.me.certs[t];
  if (c) return void window.open('/certificado/' + c.code, '_blank');
  dialog('Seu certificado', [{ id: 'nm', type: 'text', ph: 'Nome completo como deve aparecer', ac: 'name' }], 'Emitir certificado', async v => {
    try {
      const r = await api('certificate', { body: { track: t, name: v.nm || S.me.name } }); S.me.certs = r.certs;
      toast('Certificado emitido!'); window.open('/certificado/' + r.code, '_blank'); render();
    } catch (e) { fail(e); return false; }
  });
  setTimeout(() => { const i = $('#d_nm'); if (i) i.value = S.me.name; }, 80);
}

// Mantém o app em dia sozinho: se o dono liberar os cursos (ou publicar um aviso) enquanto a pessoa está com o app aberto, ela vê na hora,
// sem precisar recarregar. Só mexe na tela quando ela está no mapa/abas (nunca no meio de uma lição ou prova) e só a cada ~1 minuto.
let syncAt = 0, syncing = false;
async function syncAccess(force) {
  if (syncing || !S.tk || !S.me || document.hidden || !$('.nav')) return;
  if (!force && Date.now() - syncAt < 20e3) return;
  syncing = true; syncAt = Date.now();
  try {
    const [me, cf] = await Promise.all([api('me'), api('config').catch(() => null)]);
    const keys = o => Object.keys((o && o.unlocked) || {}).filter(k => o.unlocked[k]).sort().join(), ann = c => (c && c.announce && c.announce.id) || 0;
    const novo = keys(me).split(',').filter(k => k && !keys(S.me).split(',').includes(k)).length > 0;
    const mudou = keys(me) != keys(S.me) || me.track != S.me.track;
    const avisoNovo = !!(cf && S.cfg && ann(cf) != ann(S.cfg));
    if (avisoNovo) S.cfg.announce = cf.announce;
    if (mudou || avisoNovo) {
      const [ls, cps] = await Promise.all([api('lessons'), api('checkpoints')]);
      if (!$('.nav')) return;                                               // a pessoa abriu uma lição enquanto buscávamos: deixa para a próxima rodada
      const y = scrollY; S.me = me; S.ls = ls; S.cps = cps; render(); scrollTo(0, y);
      if (novo) toast('Seus cursos foram liberados! Todas as lições estão abertas.');
    }
  } catch { } finally { syncing = false; }
}
document.addEventListener('visibilitychange', () => { if (!document.hidden) syncAccess(true); });
addEventListener('focus', () => syncAccess());
addEventListener('online', () => syncAccess(true));
setInterval(() => syncAccess(), 60e3);

if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => { }));
boot();
