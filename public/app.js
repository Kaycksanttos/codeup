'use strict';
try { const sk = localStorage.getItem('skin'), cl = document.body.classList; if (sk === 'rose') { cl.add('wild'); if (localStorage.getItem('tk')) cl.add('rose'); } else if (sk === 'neo') cl.add('neo'); else if (sk !== '') cl.add('wild'); } catch { document.body.classList.add('wild'); }   // Azul (a floresta azul) é o padrão; '' = Azul escuro; o Rosa só aparece dentro do app (quem ainda não entrou vê sempre o Azul)
const SQLJS_V = '1.10.3', PYO_V = '0.26.4';           // versões das bibliotecas que rodam no navegador
const $ = s => document.querySelector(s), A = $('#app');
const S = { tk: localStorage.tk || null, me: null, ls: [], cfg: { contact: '', company: 'CodeUp', ads: null }, cur: null, h: 0, hearts: 5, tries: 0, errs: 0, gained: 0, lvlUp: 0,
  tab: 'home', rkp: 'semana', rk: null, tierUp: 0, lv: 0, scroll: true, auth: 'login', resetToken: null, SQL: null, pw: null, pyReady: false, busy: false };
const esc = t => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ============================================================ ÍCONES, MASCOTE E DESTAQUE DE CÓDIGO
const IC = {
  brief: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18M11 13v2h2v-2"/>',
  gem: '<path d="M6 3h12l4 6-10 13L2 9z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/>',
  home: '<path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M10 20v-6h4v6"/>',
  map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H4v2a3 3 0 0 0 4 3M16 6h4v2a3 3 0 0 1-4 3"/><path d="M12 13v4M8 20h8M10 17h4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  unlock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.6-1.7"/>',
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
  crown: '<path d="m3 8 4.5 4L12 5l4.5 7L21 8l-2 11H5z"/><path d="M5 19h14"/>',
  shield: '<path d="M12 3 4 6v6c0 4.5 3.2 8 8 9 4.8-1 8-4.5 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  chev: '<path d="m9 6 6 6-6 6"/>',
  users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 5.2a3.2 3.2 0 0 1 0 5.6M18 14.3c1.8.8 3 2.6 3 4.7"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  volume: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
  palette: '<path d="M12 3a9 9 0 1 0 0 18c1.2 0 2-.8 2-1.8 0-.5-.2-.9-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1 .8-1.8 1.8-1.8H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10.5" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>',
  smile: '<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5a4.5 4.5 0 0 0 7 0M9 9.5h.01M15 9.5h.01"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
  table: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 4v16M15 4v16"/>',
  chat: '<path d="M20 15a2 2 0 0 1-2 2H9l-5 4V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z"/><path d="M8.5 9h7M8.5 12.5h4.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'
};
const ic = (n, s = 18) => `<svg class=i width=${s} height=${s} viewBox="0 0 24 24" fill=none stroke=currentColor stroke-width=1.8 stroke-linecap=round stroke-linejoin=round aria-hidden=true>${IC[n] || ''}</svg>`;
const LS = { get: k => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch { } } };
// Aberto dentro do app das lojas? (Capacitor com "CodeUpApp" no user agent, ou Android TWA, que abre com referrer android-app://)
// Lá o AdSense não vale (o Google proíbe anúncios de site dentro de apps) e o login do Google não funciona no WebView (o Google bloqueia): o app esconde os dois.
const IN_WEBVIEW = /CodeUpApp/.test(navigator.userAgent) || !!window.Capacitor;
const IN_STORE = IN_WEBVIEW || (() => { try { if (/^android-app:\/\//.test(document.referrer)) sessionStorage.setItem('twa', '1'); return sessionStorage.getItem('twa') === '1'; } catch { return false; } })();
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
// expressões do personagem (poses da folha em img/pose/<guia>-<pose>.webp): [pose, nome no botão do Perfil]
const EXPR = {
  tay: [['oi', 'Estudando'], ['piscada', 'Piscadinha'], ['pulo', 'Pulo'], ['apaixonado', 'Apaixonada'], ['pensando', 'Pensativa'], ['ideia', 'Ideia!'], ['codando', 'Codando'], ['vitoria', 'Vitória!'], ['coracao', 'Coração'], ['apontando', 'Rindo'], ['estiloso', 'Estilosa'], ['bravo', 'Brava'], ['ops', 'Ops!'], ['dormindo', 'Dormindo'], ['tchau', 'Oi/Tchau!'], ['aponta2', 'Olha ali'], ['explica', 'Explicando'], ['joinha', 'Joinha']],
  cut: [['tchau', 'Oi/Tchau!'], ['piscada', 'Piscadinha'], ['pulo', 'Dançando'], ['pensando', 'Pensativo'], ['ideia', 'Ideia!'], ['apontando', 'Apontando'], ['estiloso', 'Estiloso'], ['ops', 'Ops!'], ['joinha', 'Joinha'], ['codando', 'Codando'], ['apaixonado', 'Curtindo'], ['explica', 'De boa'], ['vitoria', 'Vitória!'], ['coracao', 'Coração'], ['bravo', 'Bravo'], ['dormindo', 'Dormindo'], ['serio', 'Marrento'], ['celular', 'No celular'], ['tedio', 'Entediado'], ['deitado', 'Deitado'], ['dab', 'Dab!'], ['correndo', 'Correndo'], ['chorando', 'Chorando']]
};
// fantasia que a pessoa está vestindo (só a Tay tem hoje); o servidor já manda `me.cos` conferido. Com fantasia o personagem é uma imagem (sem o corpo animado em WebGL).
const COS = () => S.me && S.me.cos ? S.me.cos : null;                       // o servidor só devolve a fantasia que combina com o personagem atual
const cosPic = (k, v = '') => `/img/fan/${k}${v ? '-' + v : ''}.webp`;
const cosName = k => (CR.costume(k) || {}).name || '';
const IMG = () => { const k = COS(); if (k) return { face: cosPic(k, 'face'), full: cosPic(k) }; const g = gid(), c = S.me && S.me.color; return { face: CR.colorFile(g, c, true), full: CR.colorFile(g, c, false) }; };   // cor escolhida (ou a de fábrica)
// fundo do círculo do rosto: o que a pessoa escolheu; sem escolha, acompanha a cor da roupa (a cor de fábrica usa o degradê original)
const bgCss = (bg, color) => { const b = CR.item(CR.BACKS, bg), c = CR.item(CR.COLORS, color); return b ? `radial-gradient(circle at 50% 28%,${b.c1},${b.c2} 78%)` : c ? `radial-gradient(circle at 50% 28%,hsl(${c.hue} 95% 72%),hsl(${c.hue} 62% 36%) 78%)` : ''; };
// atributo style do aro/fundo: moldura conquistada pelo XP (só no aro) e fundo
const cosStyle = (ring, o = S.me, guide = gid()) => { if (!o) return ''; const fr = ring ? CR.frameOf(o.xp, o.frame) : 0, bg = bgCss(o.bg, o.color && !(o === S.me && COS()) && o.color !== CR.BASE[guide] ? o.color : ''); const v = (fr ? `--fr:${CR.TIERS[fr].color};` : '') + (bg ? `--bgc:${bg};` : ''); return v ? ` style="${v}"` : ''; };
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
// cls: 'good' (passou), 'bad' (errou), 'epic'/'epic2' (conquista: nível novo, prova, título novo → pulo grande, brilho e faíscas na cor fxc), 'pop' (acabou de trocar um item)
const bodyMode = cls => /\bepic2?\b/.test(cls) ? 'epic' : /\bpop\b/.test(cls) ? 'pop' : (/\b(jump|clap|dance|wave)\b/.exec(cls) || [])[1] || (/\bgood\b/.test(cls) ? 'good' : /\bbad\b/.test(cls) ? 'bad' : '');
// reel: a sequência de expressões da folha (poses) que esta tela pede: win | cp | big | think | oops | intro (veja REELS em anim.js); sem poses, vale o movimento do corpo (cls)
const HUE = () => CR.hueShift(gid(), S.me && S.me.color);   // a cor escolhida também vale nas poses
// reel 'fail' (prova reprovada): o personagem chorando. O Cut usa a pose "chorando" da folha de expressões; a Tay, a imagem dela (img/fail-tay.webp)
const failImg = () => gid() == 'cut' ? '/img/pose/cut-chorando.webp' : '/img/fail-tay.webp';
const cosImg = (h, cls) => `<img class="body cstm ${cls}" src="${cosPic(COS())}" style="height:${h}px" alt="${esc(gnm())}, de fantasia de ${esc(cosName(COS()))}">`;
const body = (h = 200, cls = '', extra = '', fxc = '', reel = '') => COS() ? cosImg(h, (cls + ' ' + extra).trim()) : reel == 'fail' ? `<img class="body fimg" src="${failImg()}" style="height:${h}px" alt="${esc(gnm())} chorando">` : window.CodeUpAnim ? CodeUpAnim.html({ g: gid(), src: IMG().full, o: OUTF(), h, cls: (cls + ' ' + extra).trim(), mode: bodyMode(cls), fx: /\bepic2\b/.test(cls) ? 2 : /\bepic\b/.test(cls) ? 1 : 0, fxc, reel, hue: HUE(), alt: esc(gnm()) }) : `<img class="body ${cls}" src="${IMG().full}" style="height:${h}px" alt="${esc(gnm())}">`;
const stage = (h, text, cls = '', fxc = '', reel = '') => `<div class="stage ${cls}"${(b => { const v = [b ? '--gl:' + b.c1 : '', /^#[0-9a-f]{6}$/i.test(fxc) ? '--fx:' + fxc : ''].filter(Boolean).join(';'); return v ? ` style="${v}"` : ''; })(CR.item(CR.BACKS, S.me && S.me.bg))}><div class=sb>${text}</div><div class=glow></div>${body(h, cls, '', fxc, reel)}<span class=gn>${esc(gnm())}</span></div>`;
// personagem do mapa: de frente, com o corpo animado (respira, pisca) e, de tempos em tempos, uma expressãozinha (reel 'mapa')
const walker = () => COS() ? `<img class=pm src="${cosPic(COS())}" alt="">` : window.CodeUpAnim ? CodeUpAnim.html({ g: gid(), src: IMG().full, o: OUTF(), h: 120, cls: 'pm', reel: 'mapa', hue: HUE(), alt: '' }) : `<img class=pm src="${IMG().full}" alt="">`;
// personagem do resultado de uma conquista: título novo (cor do título) > curso concluído > nível novo > só passou (ou prova aprovada, que também é conquista)
// cada comemoração sorteia uma das sequências de expressões (anim.js, REELS): lição = 'win', checkpoint = 'cp', conquista (título, nível, prova, curso) = 'big'
const winStage = (h, text, base = 'win', big = false) => {
  const t = S.tierUp ? CR.TIERS[S.tierUp] : null;
  if (t) return stage(h, `Agora você é ${t.title}!`, 'good epic2', t.color, 'big');
  if (big) return stage(h, text, 'good epic2', '#fbbf24', 'big');
  if (S.lvlUp) return stage(h, 'Subiu de nível!', 'good epic', '#fbbf24', 'big');
  if (/epic/.test(base)) return stage(h, text, 'good epic', '#fbbf24', 'big');
  return stage(h, text, 'good', '', base == 'cp' ? 'cp' : 'win');
};
const tg = (t, s = 40) => `<img class=lgo src="/img/logo-${['python', 'excel', 'powerbi', 'dados'].includes(t) ? t : 'sql'}.webp" width=${s} height=${s} alt="" style="--s:${s}px">`;   // logo do curso (Python, SQL, Excel, Power BI ou Análise de Dados)
const bars = n => `<span class=lb>${[1, 2, 3].map(i => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span>`;

// destaque de sintaxe simples (só para exemplos e soluções exibidos)
const PY_KW = 'def return if elif else for while in import from as class try except finally raise with yield lambda and or not is pass break continue nonlocal global None True False'.split(' ');
const PY_FN = 'print len range sum max min sorted list dict set tuple int float str bool type enumerate zip map filter any all abs round reversed isinstance super iter next'.split(' ');
const SQ_KW = 'select from where and or not in between like order by group having limit distinct as join left right inner outer on union all except intersect case when then else end insert into values update set delete create table view index with over partition rows preceding current row asc desc is null exists offset unbounded following'.split(' ');
const SQ_FN = 'count sum avg min max round upper lower length coalesce row_number rank dense_rank lag lead ntile first_value strftime julianday substr cast date integer text real'.split(' ');
function hlXl(code) {   // fórmulas do Excel: funções, células/intervalos, textos e números
  const re = /("(?:[^"]|"")*")|(\$?[A-Za-z]{1,3}\$?\d+(?::\$?[A-Za-z]{1,3}\$?\d+)?)|([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ0-9._]*)(?=\()|(\d+(?:,\d+)?%?)/g;
  let out = '', last = 0, m; code = String(code ?? '');
  while ((m = re.exec(code))) {
    out += esc(code.slice(last, m.index)); last = re.lastIndex;
    out += m[1] ? `<span class=s>${esc(m[1])}</span>` : m[2] ? `<span class=k>${esc(m[2])}</span>` : m[3] ? `<span class=f>${esc(m[3])}</span>` : `<span class=n>${esc(m[4])}</span>`;
  }
  return out + esc(code.slice(last));
}
function hl(code, type) {
  if (type == 'excel') return hlXl(code);
  if (type == 'dax') return hlDax(code);
  if (type == 'm') return hlM(code);
  if (type == 'text' || type == 'quiz') return esc(code);
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

function confetti(n = 46) { const w = document.createElement('div'); w.className = 'confetti'; const cs = ['#ffd43b', '#4b8bbe', '#22d3ee', '#34d399', '#f87171', '#fff'];
  for (let i = 0; i < n; i++) { const p = document.createElement('i'); p.style.cssText = `left:${Math.random() * 100}%;background:${cs[i % 6]};animation-delay:${Math.random() * .6}s;animation-duration:${1.8 + Math.random() * 1.6}s;transform:rotate(${Math.random() * 360}deg)`; w.appendChild(p); }
  document.body.appendChild(w); setTimeout(() => w.remove(), 4200); }
// ============================================================ COMEMORAÇÕES POR ACONTECIMENTO (telas cheias, com som)
// acerto → "Acertou!/De primeira!/Combo" · prova aprovada → troféu · sequência de dias → chama (e marcos) · erro → personagem pensando na dica
const sfx = (n, a) => { try { window.CodeUpSfx && CodeUpSfx.play(n, a); } catch { } };
// o personagem só com a pose (sem o corpo animado por baixo); sem poses/WebGL ou com "reduzir movimento" aparece o corpo parado
const ovHero = (h, reel, fxc) => COS() ? cosImg(h, 'fxh') : window.CodeUpAnim ? CodeUpAnim.html({ g: gid(), src: IMG().full, o: OUTF(), h, cls: 'fxh', reel, hue: HUE(), rig: 0, fxc, alt: esc(gnm()) }) : `<img class="body fxh" src="${IMG().full}" style="height:${h}px" alt="${esc(gnm())}">`;
const ovH = k => Math.round(Math.max(120, Math.min(k, innerHeight * .24)));
// carinha da expressão como figurinha (a imagem da pose tem o recorte no alto e os desenhinhos embaixo: mostra só o alto)
const poseChip = (id, h = 64) => { const g = gid(), P = window.CodeUpPoses && CodeUpPoses.poses[g] && CodeUpPoses.poses[g][id]; if (!P) return ''; const hu = HUE(); return `<i class=pzc style="width:${Math.round(h * P.w / P.h)}px;height:${h}px;background-image:url(/img/pose/${g}-${id}.webp);${hu ? `filter:hue-rotate(${hu}deg)` : ''}"></i>`; };
const sparks = (n, big) => Array.from({ length: n }, (_, k) => `<i class=spk style="--a:${Math.round(360 / n * k + (k % 2) * 9)}deg;--d:${(big ? 130 : 105) + (k % 3) * 22}px;--s:${11 + (k % 4) * 4}px;--dl:${(k % 5) * .05}s"></i>`).join('');
function closeOv(now) {
  const d = document.getElementById('fxo'); if (!d || d._x) return; d._x = 1; clearTimeout(d._t);
  const fin = () => { d.remove(); const f = d._done; if (f) f(); };
  if (now) fin(); else { d.classList.add('out'); setTimeout(fin, 230); }
}
// abre a tela cheia; done() roda quando ela fecha (toque, botão "Continuar" ou tempo)
function openOv(kind, inner, o = {}) {
  closeOv(true);
  const d = document.createElement('div'); d.className = 'fxo ' + kind; d.id = 'fxo'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', o.label || 'Comemoração');
  d.innerHTML = `<div class=rays></div><div class=fxin>${inner}</div>${o.auto ? `<i class=fxbar style="--t:${o.auto}ms"></i>` : ''}`;
  d._done = o.done; document.body.appendChild(d);
  d.addEventListener('click', e => { if (o.tap !== false || e.target.closest('[data-go]')) closeOv(); });
  if (o.auto) d._t = setTimeout(closeOv, o.auto);
  const key = e => { if (!document.getElementById('fxo')) return document.removeEventListener('keydown', key); if (e.key == 'Escape') closeOv(); };
  document.addEventListener('keydown', key);
  const go = d.querySelector('[data-go]'); if (go) setTimeout(() => { if (go.isConnected) go.focus({ preventScroll: true }); }, 1500);
  return d;
}
// acerto de uma lição/checkpoint: "Acertou!" (ou "De primeira!" / "Combo ×N") + XP, personagem comemorando, faíscas e som. Devolve uma Promise que resolve quando fecha.
function okFx(s) {
  const first = (s.tries || 1) == 1; S.combo = first ? (S.combo || 0) + 1 : 0;
  const combo = S.combo >= 2 ? S.combo : 0, title = combo ? `Combo ×${combo}!` : first ? 'De primeira!' : 'Acertou!', reel = first ? 'perfect' : 'ok', fxc = first ? '#fbbf24' : '#34d399';
  const sub = s.gained ? `<div class=fxxp><b>+${s.gained}</b> XP</div>` : '<div class=fxxp style="--fg:#475569;--fd:#334155"><b>Já feita</b> · sem XP novo</div>';
  const chips = [first && !combo ? 'Sem errar nenhuma vez' : '', combo ? `${combo} lições seguidas de primeira` : ''].filter(Boolean).map(t => `<span class=fxchip>${t}</span>`).join('');
  return new Promise(res => {
    openOv('ok' + (first ? ' gold' : ''), `<div class=fxch>${sparks(first ? 16 : 11, first)}${ovHero(ovH(230), reel, fxc)}</div><h2 class=fxt>${title}</h2>${sub}${chips}`, { auto: window.matchMedia('(prefers-reduced-motion:reduce)').matches ? 900 : 2100, label: 'Acertou', done: res });
    sfx(combo ? 'combo' : first ? 'perfect' : 'ok', combo);
  });
}
// prova aprovada: troféu dourado, confete, personagem pulando e fanfarra; o botão "Continuar" aparece depois de um instante
const TROPHY = `<svg class=trophy viewBox="0 0 120 130" aria-hidden=true><defs><linearGradient id=tgd x1=0 y1=0 x2=1 y2=1><stop offset=0 stop-color=#fff3b0 /><stop offset=.45 stop-color=#fbbf24 /><stop offset=1 stop-color=#d97706 /></linearGradient><clipPath id=tcl><path d="M30 14h60v32c0 20-13 34-30 34S30 66 30 46z"/></clipPath></defs>
  <path d="M31 24H14v10c0 13 9 23 22 26M89 24h17v10c0 13-9 23-22 26" fill=none stroke=#f59e0b stroke-width=7 stroke-linecap=round /><path d="M54 78h12v18H54z" fill=url(#tgd) /><path d="M38 96h44l6 14H32z" fill=url(#tgd) stroke=#b45309 stroke-width=3 stroke-linejoin=round /><rect x=29 y=110 width=62 height=11 rx=4 fill=#92400e />
  <path d="M30 14h60v32c0 20-13 34-30 34S30 66 30 46z" fill=url(#tgd) stroke=#b45309 stroke-width=3 stroke-linejoin=round /><g clip-path="url(#tcl)"><rect class=shn x=-50 y=6 width=26 height=84 fill=#fff opacity=.6 /></g>
  <path d="m60 26 5.2 11 12 1.5-8.8 8.3 2.3 11.9L60 52.8l-10.7 5.9 2.3-11.9-8.8-8.3 12-1.5z" fill=#fff7d6 stroke=#d97706 stroke-width=1.6 stroke-linejoin=round /></svg>`;
function passFx(r, l, done) {   // prova final aprovada: r = resposta do /api/submit, l = a prova
  const fin = !!r.trackComplete, title = fin ? 'Curso concluído!' : 'Nível aprovado!';
  openOv('pass', `<div class=trw>${TROPHY}</div><h2 class=fxt>${title}</h2><div class=fxscore><b>${TN[l.track]} ${esc(l.level)}</b> · prova final</div><div class=fxch>${sparks(14, true)}${ovHero(ovH(190), 'pass', '#fbbf24')}</div>${fin ? '<span class=fxchip>Você concluiu o curso. Parabéns!</span>' : r.gained ? `<span class=fxchip>+${r.gained} XP de bônus</span>` : ''}<button class="btn pri block fxbtn" data-go style="--bd:1.9s">Continuar</button>`, { tap: false, label: title, done });
  confetti(70); setTimeout(() => confetti(60), 650); sfx('pass');
}
// sequência de dias (frequência): chama + número rolando + semana com os dias feitos; marcos (3, 7, 14, 30…) ganham destaque e fanfarra
const MARCOS = [3, 7, 14, 30, 50, 100, 200, 365];
function streakFx(n, done) {
  const mk = MARCOS.includes(n), W = 'DSTQQSS', now = new Date(), days = Array.from({ length: 7 }, (_, k) => { const d = new Date(now); d.setDate(d.getDate() - (6 - k)); return { l: W[d.getDay()], on: 6 - k < n, td: k == 6 }; });
  const title = n == 1 ? 'Sequência iniciada!' : mk ? `Marco: ${n} dias seguidos!` : `${n} dias seguidos!`;
  const msg = n == 1 ? 'Estude todo dia para a chama não apagar.' : mk ? 'Constância é o que faz você aprender de verdade.' : ['Volte amanhã para manter a chama acesa.', 'Mais um dia de treino no bolso.', 'Você está pegando o ritmo!'][n % 3];
  const flame = `<svg class=flm viewBox="0 0 120 150" aria-hidden=true><defs><linearGradient id=fg1 x1=0 y1=1 x2=0 y2=0><stop offset=0 stop-color=#ea580c /><stop offset=.55 stop-color=#fb923c /><stop offset=1 stop-color=#fde047 /></linearGradient><linearGradient id=fg2 x1=0 y1=1 x2=0 y2=0><stop offset=0 stop-color=#fbbf24 /><stop offset=1 stop-color=#fff7ed /></linearGradient></defs>
    <path class=f1 d="M60 5C65 34 97 52 97 95c0 28-17 48-37 48S23 123 23 95c0-18 8-29 17-39 2 12 8 18 14 20-3-26 0-51 6-71z" fill=url(#fg1) /><path class=f2 d="M60 68c3 16 22 28 22 52 0 16-10 25-22 25s-22-9-22-25c0-10 4-16 10-22 2 8 5 10 8 10-1-16 0-30 4-40z" fill=url(#fg2) /></svg>`;
  const num = n > 1 ? `<span class=o>${n - 1}</span><span class=n>${n}</span>` : `<span class="n one">${n}</span>`;
  openOv('streak' + (mk ? ' mk' : ''), `<div class=flw>${flame}<div class=sn>${num}</div></div><h2 class=fxt>${title}</h2><p class=fxm>${msg}</p><div class=wk>${days.map(d => `<div class="wd${d.on ? ' on' : ''}${d.td ? ' td' : ''}"><small>${d.l}</small><i>${d.on ? ic('check', 15) : ''}</i></div>`).join('')}</div>
    <div class=fxch>${sparks(mk ? 14 : 8, mk)}${ovHero(ovH(mk ? 200 : 170), mk ? 'streak7' : 'streak', '#fb923c')}</div><button class="btn pri block fxbtn" data-go style="--bd:1.5s">Continuar</button>`, { tap: false, label: title, done });
  if (mk) confetti(60); sfx(mk ? 'streak7' : 'streak');
}
// depois da tela de resultado: se hoje foi o primeiro dia de treino, mostra a sequência (só se a pessoa ainda estiver nela)
function streakLater(s) {
  if (!s || !s.streakUp) return; const id = S.cur && S.cur.id;
  setTimeout(() => { if (document.querySelector('.res') && S.cur && S.cur.id == id && !document.getElementById('fxo')) streakFx(s.streakUp); }, 2600);
}
function setSfx(v) { const on = window.CodeUpSfx ? CodeUpSfx.set(v) : false; if (on) sfx('ok'); render(); }

function toast(m, err) { document.querySelectorAll('.toast').forEach(x => x.remove()); const d = document.createElement('div'); d.className = 'toast' + (err ? ' err' : ''); d.innerHTML = ic(err ? 'info' : 'check', 18) + '<span></span>'; d.lastChild.textContent = m; document.body.appendChild(d); setTimeout(() => d.remove(), 4500); }
const fail = e => { if (!e.silent) toast(e.error || e.message || 'Algo deu errado.', true); };
const theme = t => { document.body.classList.remove('t-python', 't-sql', 't-excel', 't-powerbi', 't-dados'); if (t) document.body.classList.add('t-' + t); };

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
  theme(null); applySkin(entrySkin());
  const m = S.auth, legal = `<p class=legal><a href="/guias" target="_blank">Guias gratuitos</a> · <a href="/termos" target="_blank">Termos de Uso</a> · <a href="/privacidade" target="_blank">Política de Privacidade</a></p>`;
  const F = {
    login: { t: 'Entre na sua conta', s: 'Continue de onde parou.', btn: 'Entrar',
      body: `<input class=in type=email id=em placeholder="E-mail" autocomplete=email><input class=in type=password id=pw placeholder="Senha" autocomplete=current-password>`,
      links: `<div class=lnk><a onclick="S.auth='forgot';showAuth()">Esqueci minha senha</a></div><div class=lnk>Ainda não tem conta? <a onclick="goRegister()">Criar conta grátis</a></div>` },
    register: { t: 'Crie sua conta grátis', s: 'Grátis, do básico ao avançado, com provas e ranking.', btn: 'Criar conta grátis',
      body: `<input class=in type=text id=nm placeholder="Seu nome" maxlength=30 autocomplete=name><input class=in type=email id=em placeholder="E-mail" autocomplete=email><input class=in type=password id=pw placeholder="Senha (mín. 8 caracteres)" autocomplete=new-password>
        <label class=chk><input type=checkbox id=ac><span>Li e aceito os <a href="/termos" target="_blank">Termos de Uso</a> e a <a href="/privacidade" target="_blank">Política de Privacidade</a>.</span></label>`,
      links: `<div class=lnk>Já tem conta? <a onclick="S.auth='login';showAuth()">Entrar</a></div>` },
    forgot: { t: 'Recuperar senha', s: 'Informe seu e-mail e enviaremos um link para criar uma nova senha.', btn: 'Enviar link',
      body: `<input class=in type=email id=em placeholder="E-mail" autocomplete=email>`, links: `<div class=lnk><a onclick="S.auth='login';showAuth()">Voltar para o login</a></div>` },
    reset: { t: 'Nova senha', s: 'Crie sua nova senha.', btn: 'Salvar nova senha', body: `<input class=in type=password id=pw placeholder="Nova senha (mín. 8 caracteres)" autocomplete=new-password>`, links: '' }
  }[m];
  const g = S.cfg.googleClientId && (m === 'login' || m === 'register') ? `<div class=gwrap><div id=gbtn></div></div><div class=or><span>ou</span></div>` : '';
  const hero = m === 'login' || m === 'register' ? `<div class=hero><div class=glow></div><div class=hbrand><h1 class=logo aria-label="CodeUp"><b>Code</b><span>Up</span></h1><p>Python, SQL, Excel, Power BI e Análise de Dados, com provas.</p></div></div>
    <div class=feat><span>${ic('code', 16)} 270 lições práticas</span><span>${ic('cap', 16)} Níveis com provas</span><span>${ic('gem', 16)} Diamantes e fantasias</span></div>` : `<div class=hero-sm>${mascot(84, 'ring')}<h1 class=logo aria-label="CodeUp"><b>Code</b><span>Up</span></h1></div>`;
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
    saveTk(r.token); boot();
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
      const r = await api(m, { body }); saveTk(r.token); if (m === 'register') S.reg = null; boot();
    } else if (m === 'forgot') {
      const r = await api('forgot', { body: { email: v('em') } });
      if (r.devLink) { toast('Modo teste: abrindo o link de redefinição…'); return void (location.href = r.devLink); }
      S.auth = 'login'; showAuth(); toast('Se esse e-mail tiver conta, enviamos um link para criar uma nova senha. Pode levar alguns minutos; olhe também o spam.');
    } else {
      const r = await api('reset', { body: { token: S.resetToken, password: v('pw') } });
      history.replaceState({}, '', '/'); S.resetToken = null; saveTk(r.token); toast('Senha alterada! Você já está conectado.'); boot();
    }
  } catch (e) { fail(e); if (m === 'reset' && e.status === 400 && /Link/.test(e.error || '')) { S.auth = 'forgot'; showAuth(); } } finally { b.disabled = false; }
}

// Modo teste (npm run teste): faixa no topo e botão que apaga os dados de teste e deste aparelho para recomeçar como visitante novo.
function testBar() {
  if (document.querySelector('.tbar')) return;
  const d = document.createElement('div'); d.className = 'tbar'; d.innerHTML = '<span>MODO TESTE · dados fictícios</span><button type=button id=tzzz>Simular ausência</button><button type=button id=tzero>Começar do zero</button>';
  d.querySelector('#tzzz').onclick = async () => {
    if (!S.tk) return toast('Entre numa conta primeiro.', true);
    try { await api('teste/ausente', { method: 'POST' }); S.awaySeen = 0; go(S.tab || 'home'); } catch (e) { fail(e); }
  };
  d.querySelector('#tzero').onclick = async () => {
    if (!confirm('Apagar todas as contas de teste e recomeçar como um visitante novo?')) return;
    try { await fetch('/api/teste/reset', { method: 'POST' }); } catch { }
    try { localStorage.clear(); sessionStorage.clear(); } catch { }
    location.href = '/';
  };
  document.body.insertBefore(d, document.body.firstChild);
}
// Guarda o login. O servidor também deixa um cookie seguro de reserva (HttpOnly): se o navegador apagar o armazenamento local, o boot() recupera a sessão sem pedir senha.
function saveTk(t) { S.tk = t; LS.set('tk', t); LS.set('nologin', ''); }
async function boot() {
  const q = new URLSearchParams(location.search);
  try { S.cfg = await api('config'); } catch { }
  if (S.cfg && IN_STORE) S.cfg.ads = null;                                // no app das lojas: sem anúncios do AdSense
  if (S.cfg && IN_WEBVIEW) S.cfg.googleClientId = '';                      // e sem o botão do Google (bloqueado em WebView)
  if (S.cfg && S.cfg.teste) testBar();
  if (q.get('reset')) {
    S.resetToken = q.get('reset'); let ok = false;
    try { ok = (await api('reset/check?token=' + encodeURIComponent(S.resetToken))).valid; } catch { }
    if (!ok) { history.replaceState({}, '', '/'); S.resetToken = null; S.auth = 'forgot'; showAuth(); return toast('Este link expirou ou já foi usado. Peça um novo.', true); }
    S.auth = 'reset'; return showAuth();
  }
  if (q.get('verificado')) { const ok = q.get('verificado') == '1'; history.replaceState({}, '', '/'); setTimeout(() => toast(ok ? 'E-mail confirmado! Obrigado.' : 'Este link de confirmação expirou ou já foi usado. Entre e peça um novo.', !ok), 400); }
  if (!S.tk && !LS.get('nologin')) { try { const r = await api('session/restore', { body: {} }); if (r.token) saveTk(r.token); } catch { } }   // o navegador apagou o armazenamento local (comum no Safari do iPhone)? o cookie de reserva devolve o login
  if (!S.tk) return LS.get('guide') || S.skipGuide ? showAuth() : startWizard(['sex', 'guide', 'gname'], false);   // quem chega pela primeira vez já começa o cadastro: feminino ou masculino e depois o personagem
  applySkin(skinOf()); go('home');                // dentro do app vale o visual salvo (Azul, Rosa da Tay, Claro...)
}

// ---------- Primeiros passos no cadastro: 1) feminino ou masculino  2) qual personagem (Tay ou Cut) vai guiar a jornada ----------
// need = quais perguntas fazer ('sex', 'guide'); logged = a conta já existe (então só salva no fim).
const hiFor = (g, n) => GUIDES[g].hi.replace('{n}', n || GUIDES[g].name).replace('{j}', ((S.wz && S.wz.sex) || (S.me && S.me.sex)) === 'f' ? 'juntas' : 'juntos');
function startWizard(need, logged) { const me = logged && S.me || {}; S.wz = { need, logged: !!logged, i: 0, sex: (S.reg && S.reg.sex) || me.sex || null, guide: (S.reg && S.reg.guide) || me.guide || null, gname: (S.reg && S.reg.gname) || me.gname || null }; S.skin0 = skinOf(); wizard(); }
function goRegister() { if (S.reg) { S.auth = 'register'; return showAuth(); } startWizard(['sex', 'guide', 'gname'], false); }
function wizard() {
  const w = S.wz, st = w.need[w.i]; theme(null); if (!w.logged) applySkin(entrySkin());
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
  const w = S.wz; w.guide = g; if (w.logged) applySkin(g === 'tay' ? 'rose' : S.skin0 === 'rose' ? 'wild' : S.skin0);   // quem já está no app vê na hora o visual que vem junto; no cadastro a tela de entrada continua azul
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
  if (w.guide && w.need.includes('guide')) { const sk = w.guide === 'tay' ? 'rose' : S.skin0 === 'rose' ? 'wild' : S.skin0; LS.set('guide', w.guide); LS.set('skin', sk); applySkin(w.logged ? sk : entrySkin()); }   // a Tay traz o visual Rosa para dentro do app; o Cut mantém o visual que a pessoa já usava
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
    let cf; [S.me, S.ls, S.cps, S.projs, cf] = await Promise.all([api('me'), api('lessons'), api('checkpoints'), api('projects'), api('config').catch(() => null)]);
    if (cf && S.cfg) { S.cfg.announce = cf.announce; S.cfg.courses = cf.courses; S.cfg.mural = cf.mural; }   // comunicado e cursos ativos do dono: atualizam sem precisar recarregar a página
    const g = S.me.guide, l = LS.get('guide');
    if (g && g !== l) LS.set('guide', g);                                   // a conta manda: o mesmo personagem em todos os aparelhos
    const need = [!S.me.sex && 'sex', !S.me.guide && 'guide', !S.me.gname && 'gname'].filter(Boolean);
    if (need.length) return startWizard(need, true);                        // conta sem gênero, personagem e/ou nome do personagem (conta antiga ou criada pelo Google): pergunta uma vez
    if (S.tab == 'rk') { try { S.rk = await api('ranking?p=' + S.rkp); } catch { S.rk = null; } }
    if (S.tab == 'mu' && muOn()) await muFetch();
    render();
    if (S.me.away && !S.awaySeen && !document.getElementById('fxo')) { S.awaySeen = 1; showAway(); }
  }
  catch (e) {
    if (e.silent) return;                                                   // sessão expirada: api() já abriu a tela de entrada
    if (e.status === 401) { S.tk = null; localStorage.removeItem('tk'); S.auth = 'login'; return showAuth(); }
    if (S.me) return fail(e);                                              // já estava dentro: só avisa
    A.innerHTML = `<div class="c auth"><div class="boot err" role=alert><h1 class=logo aria-label="CodeUp"><b>Code</b><span>Up</span></h1><div class=bootm>${ic('info', 24)}<b>Não foi possível carregar</b><small>${esc(e.error || 'Verifique sua internet e tente de novo.')}</small></div><button class="btn pri" onclick="go('home')">Tentar de novo</button></div></div>`; }
}
const done = l => S.me.done[l.id];
// As atividades de cada lição (x executar · r ler o código · e explicar o código, só Python/SQL Intermediário e Avançado): a ORDEM é sorteada pelo servidor para cada lição
// e vem em `l.ord` (ex.: 'rxe'); `l.dn` diz quais já estão feitas. A próxima atividade é sempre a primeira da ordem que ainda falta.
const ACT_NM = { c: 'Como funciona', x: 'Executar o código', r: 'Ler o código', e: 'Explicar o código' }, ACT_SH = { c: 'ver como funciona', x: 'executar', r: 'ler', e: 'explicar' };
const actOrd = l => (l && l.cf ? ['c'] : []).concat(String(l && l.ord || '').split('').filter(Boolean));      // 'c' = "Como funciona": 1ª parte do círculo, sempre antes das outras
const actDn = (l, a) => !!(l && (S.me.done[l.id] || (a == 'c' ? l.cd : String(l.dn || '').includes(a))));
const actNext = l => actOrd(l).find(a => !actDn(l, a)) || null;
const actPos = (l, a) => actOrd(l).indexOf(a) + 1;
const rowOf = id => (S.ls || []).find(x => x.id == id);
// os nomes das atividades mudam com o tipo da lição: DAX (escrever a fórmula / ler a fórmula) e quiz (praticar / ler e interpretar)
const ACT_BY = { dax: { x: ['Escrever a fórmula', 'escrever a fórmula', 'Hora de escrever uma fórmula DAX por conta própria: primeiro uma explicação rápida, depois a prática.'], r: ['Ler a fórmula', 'ler a fórmula', 'Você vai ver uma fórmula pronta e dizer o que ela devolve. Ler bem é metade de escrever bem.'] },
  quiz: { x: ['Praticar com perguntas', 'praticar', 'Hora de responder umas perguntas sobre o que você acabou de aprender: primeiro uma explicação rápida, depois a prática.'], r: ['Ler e interpretar', 'ler e interpretar', 'Você vai olhar um gráfico, uma tabela ou uma fórmula e responder o que ela mostra.'] } };
const actNm = (l, a) => ((ACT_BY[l && l.type] || {})[a] || [])[0] || ACT_NM[a], actSh = (l, a) => ((ACT_BY[l && l.type] || {})[a] || [])[1] || ACT_SH[a];
const actTag = (l, a) => { const m = rowOf(l.id); return m && (m.rd || m.cf) ? `Atividade ${actPos(m, a)} de ${actOrd(m).length} · ${actNm(l, a)}` : actNm(l, a); };
const fm = (m, f) => S.me && S.me.sex === 'f' ? f : m;                    // palavra no masculino ou no feminino, conforme o que a pessoa informou
const LV = ['Básico', 'Intermediário', 'Avançado'], TN = { python: 'Python', sql: 'SQL', excel: 'Excel', powerbi: 'Power BI e DAX', dados: 'Análise de Dados e Storytelling' };
const COURSES = ['python', 'sql', 'excel', 'powerbi', 'dados'];                                   // ordem dos cursos na tela Cursos
const courseOn = t => !S.cfg || !S.cfg.courses || S.cfg.courses[t] !== false;   // o dono pode desativar cursos no painel (Ajustes → Cursos)
const ACTIVE = () => COURSES.filter(courseOn);
const lvs = t => { const n = Math.max(1, ...(S.ls || []).filter(l => l.track == t).map(l => l.lv)); return Array.from({ length: n }, (_, i) => i + 1); };   // níveis que o curso tem hoje (o Excel começa só com o Básico)
const lessonsOf = (t, lv) => S.ls.filter(l => l.track == t && l.lv == lv);
const lvDone = (t, lv) => lessonsOf(t, lv).filter(done).length;
const passedLv = (t, lv) => !!S.me.passed[t + '-' + lv];
const unl = t => !!(S.me && S.me.unlocked && S.me.unlocked[t]);               // curso liberado pelo dono (sem bloqueio de nível, sequência ou checkpoint)
const lvOpen = (t, lv) => lv == 1 || unl(t) || passedLv(t, lv - 1);
const trackPassed = t => lvs(t).every(lv => passedLv(t, lv));
const lvPct = (t, lv) => Math.round((lvDone(t, lv) + (passedLv(t, lv) ? 1 : 0)) / 31 * 100);
const trackPct = t => Math.round(lvs(t).reduce((a, lv) => a + lvDone(t, lv) + (passedLv(t, lv) ? 1 : 0), 0) / (lvs(t).length * 31) * 100);
const curLevel = t => lvs(t).find(lv => !passedLv(t, lv)) || lvs(t).length;
const nextLesson = t => S.ls.find(l => l.track == t && !done(l) && !l.lock);
const cpBefore = l => (S.cps || []).find(c => !c.fin && c.track == l.track && c.lv == l.lv && c.after == l.n - 1);   // checkpoint que vem logo antes da lição l (só antes da 11 e da 21)
const pjOf = (t, lv, n) => (S.projs || []).find(p => p.track == t && p.lv == lv && p.after == n);                        // projeto que vem depois da lição n (5, 10, 15, 20, 25 e 30)
const chTxt = c => c.left == 1 ? 'última chance' : `${c.left} chances`;                                              // chances que ainda restam numa prova
const finOf = (t, lv) => (S.cps || []).find(c => c.fin && c.track == t && c.lv == lv);                               // prova final do nível
// próximo passo do curso: a lição livre, o projeto (a cada 5 lições), o checkpoint que precisa ser feito antes das lições 11 e 21 ou, com as 30 lições feitas, o projeto final e a prova final do nível
const nextStep = t => {
  const l = S.ls.find(x => x.track == t && !done(x) && (!x.lock || x.lock == 'cp' || x.lock == 'pj'));
  if (!l) { const f = (S.cps || []).find(c => c.fin && c.track == t && !passedLv(t, c.lv) && !c.lock); if (f) return { cp: f }; const p = (S.projs || []).find(p => p.track == t && p.after == 30 && !(S.me.cps || []).includes(p.id) && !p.lock); return p ? { cp: p } : null; }
  if (l.lock == 'pj') { const p = pjOf(l.track, l.lv, l.n - 1); return p && !p.lock ? { cp: p } : null; }
  if (l.lock == 'cp') { const c = cpBefore(l); return c && !c.lock ? { cp: c } : null; }
  return l;
};

const nav = () => {
  const t = [['home', 'home', 'Início'], ['tr', 'map', 'Cursos'], ['rk', 'crown', 'Ranking']].concat(muOn() ? [['mu', 'chat', 'Mural']] : [], [['ch', 'trophy', 'Desafios'], ['pf', 'user', 'Perfil']]);   // o dono pode desligar o Mural (Ajustes no painel)
  return `<nav class="nav${t.length > 5 ? ' n6' : ''}">${t.map(x => `<button class="${S.tab == x[0] ? 'on' : ''}" onclick="go('${x[0]}')">${ic(x[1], 22)}<span>${x[2]}</span></button>`).join('')}</nav>`;
};

async function resendVerify() { try { const r = await api('resend-verification', { body: {} }); if (r.devVerifyLink) { toast('Modo teste: abrindo o link de confirmação…'); return void (location.href = r.devVerifyLink); } toast(r.already ? 'Seu e-mail já está confirmado.' : 'E-mail enviado! Olhe também a caixa de spam.'); if (r.already) go(); } catch (e) { fail(e); } }
function chooseTrack() {
  theme(null);
  A.innerHTML = `<div class="c auth"><div class=hero-sm><h1 class=logo aria-label="CodeUp"><b>Code</b><span>Up</span></h1></div>${stage(210, 'Qual curso você quer fazer?', '', '', 'think')}
  <h2 style="text-align:center;margin:6px 0 4px">O que você quer aprender?</h2><p class="sub" style="text-align:center">Escolha seu primeiro curso. Cada nível tem 30 lições, um projeto a cada 5 lições, 2 checkpoints e uma prova final. O progresso de cada curso é separado: você pode estudar os outros depois.</p>
  <div class=crl>${ACTIVE().map(courseRow).join('')}</div></div>`;
}
async function studyTrack(t) { try { S.me = await api('track', { body: { track: t } }); S.lv = 0; S.scroll = true; S.tab = 'home'; go('home'); } catch (e) { fail(e); } }
const pickTrack = studyTrack;

// ---------- tela Cursos: lista de cursos com busca e categorias ----------
const CRS = {
  python: { d: 'Da lógica de programação à análise de dados com Pandas.', c: 'Programação' },
  sql: { d: 'Do primeiro SELECT às funções de janela e CTEs.', c: 'Dados' },
  excel: { d: 'Fórmulas, SOMA, SE e PROCV na prática, com uma planilha de verdade.', c: 'Produtividade' },
  powerbi: { d: 'Modelo de dados, visuais e fórmulas DAX: medidas, CALCULATE e relatórios que contam histórias.', c: 'Dados' },
  dados: { d: 'Do olhar para os números a contar a história com eles: gráficos, insights e apresentação.', c: 'Dados' }
};
const SOON = [];                                                                     // cursos "em breve" (hoje não há nenhum): { n, d, c, i }
const CATI = { Todos: 'grid', Programação: 'code', Dados: 'db', Produtividade: 'chart', Outros: 'smile' };
const CATS = () => ['Todos', ...['Programação', 'Dados', 'Produtividade', 'Outros'].filter(c => [...ACTIVE().map(t => CRS[t].c), ...SOON.map(x => x.c)].includes(c))];   // só aparecem categorias que têm curso
const cnorm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const xpTotal = t => S.ls.filter(l => l.track == t).reduce((a, l) => a + l.xp, 0) + (S.cps || []).filter(c => c.track == t && !c.fin).reduce((a, c) => a + c.xp, 0) + (S.projs || []).filter(p => p.track == t).reduce((a, p) => a + p.xp, 0) + lvs(t).reduce((a, lv) => a + 50 * lv, 0);
const xpGot = t => S.ls.filter(l => l.track == t && done(l)).reduce((a, l) => a + l.xp, 0) + (S.cps || []).filter(c => c.track == t && !c.fin && (S.me.cps || []).includes(c.id)).reduce((a, c) => a + c.xp, 0) + (S.projs || []).filter(p => p.track == t && (S.me.cps || []).includes(p.id)).reduce((a, p) => a + p.xp, 0) + lvs(t).filter(lv => passedLv(t, lv)).reduce((a, lv) => a + 50 * lv, 0);
// a "ilha" de cada curso: uma plataforma de pedra com brilho na cor do curso e capim nas pontas; o logo fica em cima
const island = () => `<svg class=isl viewBox="0 0 160 100" aria-hidden=true><ellipse class=ig cx=80 cy=72 rx=74 ry=24 /><path class=iw d="M16 64v13c0 11 29 20 64 20s64-9 64-20V64z"/><ellipse class=it cx=80 cy=64 rx=64 ry=20 /><ellipse class=ir cx=80 cy=64 rx=54 ry=15 />
  <g class=gs><path d="M20 66q-6-9-3-17q4 7 7 15zM28 69q-3-10 1-17q3 7 3 16zM140 66q6-9 3-17q-4 7-7 15zM132 69q3-10-1-17q-3 7-3 16z"/></g></svg>`;
function courseRow(t) {
  const m = S.me, p = trackPct(t), cur = m.track == t, n = S.ls.filter(l => l.track == t).length, c = CRS[t], k = lvs(t).length;
  return `<div class="cr ${t}${cur ? ' cur' : ''}" data-c="${c.c}" data-q="${esc(cnorm(TN[t] + ' ' + c.d + ' ' + c.c))}" onclick="studyTrack('${t}')" onkeydown="if(event.key=='Enter')studyTrack('${t}')" role=button tabindex=0 aria-label="${TN[t]}: ${p}% concluído">
    <span class=crisl>${island()}${tg(t, 84)}</span>
    <div class=crb><div class=crt1><b>${TN[t]}${cur ? ' <span class=badge>Atual</span>' : ''}</b><span class=crx>${ic('crown', 15)} ${nf(xpGot(t))}/${nf(xpTotal(t))} XP</span></div><small class=crd>${c.d}</small>
      <div class=crtg><span><i class=dg style="--d:#34d399"></i>${k > 1 ? 'Básico ao Avançado' : 'Básico'}</span><span><i class=dg style="--d:${CATC[c.c] || '#38bdf8'}"></i>${c.c}</span><span>${ic('layers', 13)} ${n} lições</span></div>
      <div class=crf><div class=crbar><i style="width:${p}%"></i></div><b class=crp>${p}%</b><span class=crgo>${ic('arrow', 20)}</span></div></div></div>`;
}
const CATC = { Programação: '#a78bfa', Dados: '#38bdf8', Produtividade: '#fb923c', Outros: '#f472b6' };
const soonRow = x => `<div class="cr soon" data-c="${x.c}" data-q="${esc(cnorm(x.n + ' ' + x.d + ' ' + x.c))}" aria-disabled=true>
  <span class=crisl>${island()}<span class=cis>${ic(x.i, 44)}</span></span><div class=crb><div class=crt1><b>${x.n}</b><span class=sbadge>Em breve</span></div><small class=crd>${x.d}</small>
  <div class=crtg><span><i class=dg style="--d:${CATC[x.c] || '#38bdf8'}"></i>${x.c}</span></div></div></div>`;
function cfilter() {
  const i = $('#cq'); if (i) S.cq = i.value; const q = cnorm(S.cq || '').trim(), c = S.cc || 'Todos'; let n = 0;
  document.querySelectorAll('#crl .cr').forEach(r => { const ok = (c == 'Todos' || r.dataset.c == c) && (!q || r.dataset.q.includes(q)); r.hidden = !ok; if (ok) n++; });
  const z = $('#crnone'); if (z) z.hidden = n > 0;
}
function ccat(c) { S.cc = c; document.querySelectorAll('.crc button').forEach(b => b.classList.toggle('on', b.dataset.cat == c)); cfilter(); }

// ============================================================ TELAS
// Caminho do mapa: curvas suaves (estilo caminho de jogo) passando pelo centro de cada botão. A parte já percorrida fica acesa.
function mapSvg(X, upto, M) {
  const y = i => M.top + 41 + i * M.row, H = M.top + X.length * M.row + 10;
  const seg = (a, b) => { const ym = (y(a) + y(b)) / 2; return ` C${X[a]} ${ym} ${X[b]} ${ym} ${X[b]} ${y(b)}`; };
  let all = `M${X[0]} ${y(0)}`, got = all; for (let i = 1; i < X.length; i++) { all += seg(i - 1, i); if (i <= upto) got += seg(i - 1, i); }
  return `<svg class=pth viewBox="0 0 100 ${H}" preserveAspectRatio="none" style="height:${H}px" aria-hidden="true"><path class=rd d="${all}"/><path class=bs d="${all}"/>${upto > 0 ? `<path class=pg d="${got}"/>` : ''}</svg>`;
}
function render() {
  delete document.body.dataset.calm; S.step = '';
  const m = S.me, L = S.ls;
  if (!m.track || !courseOn(m.track)) return chooseTrack();       // sem curso (ou o dono desativou o curso dele): escolhe outro
  const T = m.track; theme(T); let h = '';
  if (!S.lv) S.lv = curLevel(T);
  const an = (a => a && LS.get('ann') != a.id ? `<div class="note ${a.kind}" style="margin-top:10px">${ic(a.kind == 'ok' ? 'check' : 'info', 18)}<div style="flex:1">${esc(a.text)}</div><button class=ibtn aria-label="Fechar aviso" onclick="LS.set('ann',${+a.id});render()">${ic('x', 16)}</button></div>` : '')(S.cfg && S.cfg.announce);
  const vb = m.verified ? '' : `<div class=note style="margin-top:10px">${ic('info', 18)}<div><b>Confirme seu e-mail</b><br>Enviamos um link para ${esc(m.email)}. Você já pode estudar. Confirme para proteger sua conta e poder recuperar a senha. <a onclick=resendVerify() style="cursor:pointer;font-weight:800">Reenviar e-mail</a></div></div>`;
  const head = `<header class=hd>${mascot(46, 'ring')}<div class=who><b>${document.body.classList.contains('wild') ? 'Olá, ' + esc(String(m.name).split(' ')[0]) + '!' : esc(m.name)}</b><small>${document.body.classList.contains('wild') ? 'Vamos continuar seus estudos?' : 'Estudando ' + TN[m.track]}</small></div><div class=chips-r><span class="pill fire" title="Dias seguidos">${ic('flame', 16)} <b class=n data-k=streak data-v="${m.streak}">${m.streak}</b></span><span class="pill xp" title="Pontos de experiência">${ic('bolt', 16)} <b class=n data-k=xp data-v="${m.xp}">${m.xp}</b></span><button class="pill gem" onclick="openWardrobe()" title="Seus diamantes: toque para ver o guarda-roupa" aria-label="${m.gems || 0} diamantes. Abrir o guarda-roupa">${ic('gem', 16)} <b class=n data-k=gems data-v="${m.gems || 0}">${m.gems || 0}</b></button></div></header>`;
  if (S.tab == 'home') {
    const lv = S.lv, ls = lessonsOf(T, lv), open = lvOpen(T, lv), cur = ls.findIndex(l => !done(l) && !l.lock), nd = lvDone(T, lv), fin = finOf(T, lv), finReady = !!fin && !fin.lock && open && !passedLv(T, lv), pct = trackPct(T), nx = nextStep(T);
    // mapa em curva: cada lição ganha uma posição horizontal (onda suave) e um caminho desenhado liga os botões.
    // Depois de cada 5 lições entra um PROJETO (obrigatório, sem perder vidas), depois das lições 10 e 20 também um CHECKPOINT (prova obrigatória, 2 chances) e, no fim, a PROVA FINAL do nível (3 chances).
    const cpOk = c => (m.cps || []).includes(c.id), cpsLv = (S.cps || []).filter(c => !c.fin && c.track == T && c.lv == lv), pjsLv = (S.projs || []).filter(p => p.track == T && p.lv == lv);
    const rows = []; ls.forEach((l, i) => { rows.push({ l, i }); const p = pjsLv.find(p => p.after == l.n); if (p) rows.push({ p }); const c = cpsLv.find(c => c.after == l.n); if (c) rows.push({ c }); });
    const NR = rows.length + 1, MAP = { row: document.body.classList.contains('wild') ? 140 : 170, top: document.body.classList.contains('wild') ? 128 : 100 };
    const X = Array.from({ length: NR }, (_, r) => r < rows.length ? +(50 + 26 * Math.sin((r - 1) * Math.PI / 4)).toFixed(1) : 50);
    const okRow = [...rows.map(r => r.l ? !!done(r.l) : false), passedLv(T, lv)];
    rows.forEach((r, k) => { if (r.c || r.p) okRow[k] = cpOk(r.c || r.p) || !!okRow[k + 1]; });          // checkpoint ou projeto pulado (quem já tinha avançado antes deles existirem) não "trava" o caminho aceso
    let pi = 0; while (pi < NR && okRow[pi]) pi++; pi = Math.min(pi, NR - 1);
    const pathSvg = mapSvg(X, pi, MAP);
    const curK = cur >= 0 ? rows.findIndex(r => r.l && r.i == cur) : (c => c >= 0 ? c : finReady ? rows.length : -1)(rows.findIndex(r => (r.c || r.p) && !cpOk(r.c || r.p) && !(r.c || r.p).lock && !done(ls.find(l => l.n == (r.c || r.p).after + 1) || {})));
    const scene = window.mapScene && document.body.classList.contains('wild') ? mapScene({ X, M: MAP, NR, track: T, cur: curK, W: Math.min(488, innerWidth - 32) }) : '';
    S.rw = innerWidth;
    const WL = document.body.classList.contains('wild'), Wm = Math.min(488, innerWidth - 32), lcard = (k, kick, title) => `<div class=lc style="--lw:${Math.max(96, Math.round((X[k] > 50.5 ? X[k] : 100 - X[k]) * Wm / 100 - 58))}px"><small>${kick}</small><b>${esc(String(title).replace(/^(Checkpoint|Projeto):\s*/i, ''))}</b><em class=lcb>INICIAR</em></div>`;
    const pips = l => {                                                           // o ANEL em volta do círculo: um arco por atividade, na ordem sorteada (2 arcos, ou 3 no Intermediário/Avançado). Arco cheio = atividade feita; anel inteiro = lição completa
      if (!l.rd && !l.cf) return ''; const ord = actOrd(l), dn = !!done(l), nx = dn ? null : actNext(l), nd = ord.filter(a => actDn(l, a)).length;
      const cls = ord.map((a, i) => `r${i + 1}${actDn(l, a) ? 'ok' : a == nx && !l.lock ? 'cur' : ''}`).join(' ');
      return `<i class="rdr-ring n${ord.length} ${cls}" role=img aria-label="${dn ? `As ${ord.length} atividades feitas` : `${nd} de ${ord.length} atividades feitas. Falta ${actSh(l, nx) || ''}`}"></i>`;
    };
    const rowHtml = (r, k) => r.l ? (l => { const i = r.i; return `<div class="ti ${done(l) ? 'ok' : i == cur ? 'cur' : l.lock ? 'lk' : ''}${X[k] > 50.5 ? ' rs' : ''}" style="--i:${k};--x:${X[k]}%" onclick="openL('${l.id}')"><div class=rail>${i == cur && !WL ? '<span class=start>COMEÇAR</span>' : ''}<span class=nd>${done(l) ? ic('check', 28) : l.lock ? ic('lock', 24) : ic('star', 28)}<i class=nn>${l.n}</i>${pips(l)}</span>${i == cur ? walker() + lcard(k, 'Lição ' + l.n + (l.rd ? ' · ' + actOrd(l).length + ' atividades' : ''), l.title) : ''}</div><div class=tb><b>${esc(l.title)}</b><small>Lição ${l.n}${done(l) ? '' : ' · +' + l.xp + ' XP'}</small></div></div>`; })(r.l)
      : r.p ? (p => { const need = !cpOk(p) && !p.lock && !done(ls.find(l => l.n == p.after + 1) || {}); return `<div class="ti cp pj ${cpOk(p) ? 'ok' : p.lock ? 'lk' : 'av'}${need ? ' cur' : ''}${X[k] > 50.5 ? ' rs' : ''}" style="--i:${k};--x:${X[k]}%" onclick="openProj('${p.id}')"><div class=rail>${need && !WL ? '<span class=start>COMEÇAR</span>' : ''}<span class=nd>${cpOk(p) ? ic('check', 28) : p.lock ? ic('lock', 24) : ic('brief', 28)}</span>${need ? walker() + lcard(k, 'Projeto', p.title) : ''}</div><div class=tb><b>${esc(p.title)}</b><small>${cpOk(p) ? 'Projeto concluído' : p.lock ? 'Projeto · depois da lição ' + p.after : 'Projeto · sem perder vidas · +' + p.xp + ' XP'}</small></div></div>`; })(r.p)
      : (c => { const need = !cpOk(c) && !c.lock && !done(ls.find(l => l.n == c.after + 1) || {}); return `<div class="ti cp ${cpOk(c) ? 'ok' : c.lock ? 'lk' : 'av'}${need ? ' cur' : ''}${X[k] > 50.5 ? ' rs' : ''}" style="--i:${k};--x:${X[k]}%" onclick="openTest('${c.id}')"><div class=rail>${need && !WL ? '<span class=start>COMEÇAR</span>' : ''}<span class=nd>${cpOk(c) ? ic('check', 28) : c.lock ? ic('lock', 24) : ic('flag', 28)}</span>${need ? walker() + lcard(k, 'Checkpoint', c.title) : ''}</div><div class=tb><b>${esc(c.title)}</b><small>${cpOk(c) ? 'Checkpoint concluído' : c.lock ? 'Checkpoint · depois da lição ' + c.after : 'Checkpoint · ' + chTxt(c) + ' · +' + c.xp + ' XP'}</small></div></div>`; })(r.c);
    const prog = `<div class=cprog><div class=ph><span>Progresso em ${TN[T]}</span><b>${pct}%</b></div><div class=segs>${lvs(T).map(x => `<div class=seg><i style="width:${lvPct(T, x)}%"></i></div>`).join('')}</div><div class=sl>${lvs(T).map(x => `<span>${LV[x - 1]}</span>`).join('')}</div></div>`;
    const cont = nx ? (nx.cp ? `<div class="card cont" onclick="openTest('${nx.cp.id}')">${tg(T, 44)}<div class=bd><small class=up>${nx.cp.proj ? 'Projeto · obrigatório' : nx.cp.fin ? 'Prova final · libera o próximo nível' : 'Checkpoint · obrigatório'}</small><b>${esc(nx.cp.title)}</b><small>${TN[T]} · ${LV[nx.cp.lv - 1]} · ${nx.cp.proj ? (nx.cp.after < 30 ? 'libera a lição ' + (nx.cp.after + 1) : 'libera a prova final') : nx.cp.fin ? 'todas as 30 lições' : 'libera a lição ' + (nx.cp.after + 1)}</small></div><span class=go>${ic('arrow', 20)}</span>${prog}</div>`
      : `<div class="card cont" onclick="openL('${nx.id}')">${tg(T, 44)}<div class=bd><small class=up>Continuar</small><b>${esc(nx.title)}</b><small>${TN[T]} · ${LV[nx.lv - 1]} · lição ${nx.n} de 30${(nx.rd || nx.cf) && actNext(nx) ? ` · atividade ${actPos(nx, actNext(nx))} de ${actOrd(nx).length}: ${actSh(nx, actNext(nx))}` : ''}</small></div><span class=go>${ic('arrow', 20)}</span>${prog}</div>`) : '';
    const trk = `<div class="card cont tkc"${nx ? ` onclick="${nx.cp ? `openTest('${nx.cp.id}')` : `openL('${nx.id}')`}"` : ''}>${tg(T, 58)}<div class=bd><b>${TN[T]}</b><small>Nível ${lv} · ${LV[lv - 1]}</small><div class=tkb><i style="width:${Math.round(nd / 30 * 100)}%"></i></div></div><div class=tkn><b>${nd}</b>/30</div>${nx ? `<span class=go>${ic('arrow', 20)}</span>` : ''}</div>`;
    h = `${head}${an}${vb}
    ${document.body.classList.contains('wild') ? trk : cont || `<div class=panel>${prog}</div>`}
    <div class=tabs>${[1, 2, 3].map(x => x > lvs(T).length ? `<button class=soon onclick="toast('${LV[x - 1]} de ${TN[T]} chega em breve.')">${ic('lock', 15)}<span>${LV[x - 1]}</span><small>em breve</small></button>` : `<button class="${lv == x ? 'on' : ''}" onclick="S.lv=${x};render()">${lvOpen(T, x) ? (passedLv(T, x) ? ic('check', 15) : bars(x)) : ic('lock', 15)}<span>${LV[x - 1]}</span><small>${lvDone(T, x)}/30</small></button>`).join('')}</div>
    <div class="unit slim"><span class=uflag>${ic('flag', 18)}</span><div><small>NÍVEL ${lv}</small><b>${LV[lv - 1]}</b></div><div class=uc>${nd}/30</div></div>
    ${!open ? `<div class="note">${ic('lock', 18)}<div><b>Nível bloqueado</b><br>Passe na prova final de ${LV[lv - 2]} (30 lições + a prova) para entrar aqui.</div></div>` : ''}
    <div class=tl style="--n:${NR};--row:${MAP.row}px;--top:${MAP.top}px">${scene}${pathSvg}${rows.map(rowHtml).join('')}
    <div class="ti exam ${passedLv(T, lv) ? 'ok' : finReady ? 'cur' : 'lk'}" style="--i:${rows.length};--x:50%" onclick="${fin ? `openTest('${fin.id}')` : ''}"><div class=rail>${finReady && !WL ? '<span class=start>COMEÇAR</span>' : ''}<span class=nd>${passedLv(T, lv) ? ic('check', 28) : ic('cap', 28)}</span>${finReady && cur < 0 ? walker() + lcard(rows.length, 'Prova final', LV[lv - 1]) : ''}</div><div class=tb><b>Prova final · ${LV[lv - 1]}</b><small>${passedLv(T, lv) ? 'Aprovado' : finReady ? 'Liberada · ' + (fin ? chTxt(fin) : '3 chances') + ' · libera o próximo nível' : 'Libera ao concluir as 30 lições'}</small></div></div>
</div>`;
  }
  if (S.tab == 'ch') {
    const cpS = c => (m.cps || []).includes(c.id);
    h = `<h2 class=ttl>Desafios</h2><p class=sub>Um projeto a cada 5 lições e uma prova a cada 10. Passando na prova final, o próximo nível abre.</p>
    <div class="panel rules2"><div class=rl><span class=ri>${ic('brief', 20)}</span><div><b>Projeto · lições 5, 10, 15, 20, 25 e 30</b><small>Você monta algo com o que aprendeu. Tem dica e solução, não perde vidas e é obrigatório para seguir.</small></div></div><div class=rl><span class=ri>${ic('flag', 20)}</span><div><b>Checkpoint · lições 10 e 20</b><small>2 chances. Errou as duas, volta 5 lições.</small></div></div><div class=rl><span class=ri>${ic('cap', 20)}</span><div><b>Prova final · lição 30</b><small>3 chances, com tudo desde o começo. Errou as três, volta 10 lições.</small></div></div></div>`
      + ACTIVE().map(t => `<div class=sec>${tg(t, 22)} ${TN[t]}</div>` + lvs(t).map(lv => `<div class=lvh>${bars(lv)} ${LV[lv - 1]}</div>` + [...(S.projs || []), ...(S.cps || [])].filter(c => c.track == t && c.lv == lv).sort((a, b) => a.after - b.after || (b.proj ? 1 : 0) - (a.proj ? 1 : 0)).map(c => {
        if (c.proj) { const ok = cpS(c), lk = !ok && c.lock; return `<div class="card ${lk ? 'lk' : ''}" onclick="openProj('${c.id}')"><span class="ib ${ok ? 'ok' : ''}">${ok ? ic('check', 20) : ic('brief', 20)}</span><div class=bd><b>Projeto · lição ${c.after}</b><small>${ok ? 'Concluído' : lk ? 'Libera ao concluir a lição ' + c.after : esc(c.title.replace(/^Projeto: /, '')) + ' · +' + c.xp + ' XP'}</small></div><span class=r>${ok ? 'Feito' : lk ? ic('lock', 16) : 'Fazer'}</span></div>`; }
        const ok = c.fin ? passedLv(t, lv) : cpS(c), fl = m.fails[c.fin ? t + '-' + lv : c.id] || 0, lk = !ok && c.lock;
        const st = ok ? (c.fin ? 'Aprovado' : 'Concluído') : lk ? (c.fin ? 'Libera ao concluir as 30 lições' : 'Libera ao concluir a lição ' + c.after) : `${chTxt(c)} de ${c.chances}`;
        return `<div class="card ${lk ? 'lk' : ''}" onclick="openTest('${c.id}')"><span class="ib ${ok ? 'ok' : ''}">${ok ? ic('check', 20) : ic(c.fin ? 'cap' : 'flag', 20)}</span><div class=bd><b>${c.fin ? 'Prova final' : 'Checkpoint · lição ' + c.after}</b><small>${st}${fl ? ' · voltou ' + fl + (fl == 1 ? ' vez' : ' vezes') : ''}</small></div><span class=r>${ok ? 'Feito' : lk ? ic('lock', 16) : 'Fazer'}</span></div>`;
      }).join('')).join('')).join('');
  }
  if (S.tab == 'rk') h = rankView();
  if (S.tab == 'mu') h = muView();
  if (S.tab == 'tr') {
    const lvl = Math.floor(m.xp / 100) + 1;
    h = `<header class="crtop"><span class=cravw>${mascot(56, 'ring')}</span><div class=crw><b>${esc(String(m.name).split(' ')[0])}</b><small>Nível ${lvl}</small><div class=crxp><i style="width:${m.xp % 100}%"></i></div></div><span class=crxl>${m.xp % 100}/100 XP</span>
      <div class=chips-r><span class="pill fire" title="Dias seguidos">${ic('flame', 16)} <b class=n data-k=streak data-v="${m.streak}">${m.streak}</b></span><button class="pill gem" onclick="openWardrobe()" aria-label="${m.gems || 0} diamantes. Abrir o guarda-roupa">${ic('gem', 16)} <b class=n data-k=gems data-v="${m.gems || 0}">${m.gems || 0}</b></button></div></header>
    <section class=crh><div class=crh1><h2 class=ttl>Cursos</h2><p class=sub><b>Escolha um curso para estudar.</b><br>Aprenda jogando, ganhe XP e evolua no seu ritmo!</p></div><div class=crm><span class=bub>Aprender também pode ser divertido!</span><span class=crbust><img src="${IMG().full}" alt="${esc(gnm())}"></span></div></section>
    <label class=crs>${ic('search', 20)}<input id=cq type=search placeholder="Buscar curso..." value="${esc(S.cq || '')}" oninput="cfilter()" autocomplete=off aria-label="Buscar curso"></label>
    <div class=crc role=group aria-label="Categorias">${CATS().map(c => `<button class="${c == (S.cc || 'Todos') ? 'on' : ''}" data-cat="${c}" onclick="ccat('${c}')">${ic(CATI[c], 17)}<span>${c}</span></button>`).join('')}</div>
    <div class=crl id=crl>${ACTIVE().map(courseRow).join('')}${SOON.map(soonRow).join('')}</div><p class="tn crnone" id=crnone hidden>Nenhum curso encontrado. Tente outra palavra.</p>`;
  }
  if (S.tab == 'pf') h = profileView(L, T);
  A.innerHTML = `<div class=c>${h}</div>${nav()}`; countUp(); if (S.tab == 'tr') cfilter(); if (S.tab == 'home') setTimeout(startTour, 700);
  if (S.tab == 'home' && S.scroll) { S.scroll = false; const c = document.querySelector('.ti.cur'); if (c) c.scrollIntoView({ block: 'center' }); }
}


// ============================================================ ANIMAÇÕES E TOUR DO PRIMEIRO ACESSO
// números sobem até o valor novo (XP e dias seguidos) e a "pílula" dá um pulinho
const skinOf = () => { const v = LS.get('skin'); return v === 'rose' || v === 'neo' || v === '' ? v : 'wild'; };   // Azul (a floresta azul) é o padrão
// telas de entrada (login, cadastro, senha): nunca o cenário Rosa; quem escolheu Claro ou Azul escuro continua com o seu
const entrySkin = () => { const v = skinOf(); return v === 'rose' ? 'wild' : v; };
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
  { t: 'Seu menu', p: 'Em Cursos você escolhe entre Python, SQL, Excel, Power BI e Análise de Dados. No Ranking você vê sua posição e no Mural a turma mostra projetos e conquistas. Em Desafios ficam as provas. No Perfil estão suas conquistas e molduras.', sel: '.nav' }
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
// o rosto de outra pessoa (ranking e Mural): personagem + moldura + cor + adesivo, nunca mais que isso
const faceOf = (r, s) => { const fr = r.frame ? `--fr:${CR.TIERS[r.frame].color};` : '', bg = bgCss(r.bg, r.color && !r.cos && r.color !== CR.BASE[r.guide] ? r.color : ''), st = fr + (bg ? `--bgc:${bg};` : ''); return `<span class=av style="width:${s}px;height:${s}px"><img class="mascot rkav g-${r.guide}${r.frame ? ' fr' : ''}"${st ? ` style="${st}"` : ''} src="${r.cos ? cosPic(r.cos, 'face') : CR.colorFile(r.guide, r.color, true)}" width=${s} height=${s} alt="">${stkBadge(r.sticker, Math.round(s * .45))}</span>`; };
function rankView() {
  const k = S.rk, per = S.rkp, m = S.me, unit = per == 'semana' ? 'nesta semana' : 'no total';
  const head = `<h2 class=ttl>Ranking</h2><p class=sub>${per == 'semana' ? 'Quem mais ganhou XP nesta semana. Recomeça toda segunda-feira.' : 'Quem mais ganhou XP desde o começo.'}</p>
    <div class=pseg role=tablist aria-label="Período do ranking">${[['semana', 'Esta semana'], ['geral', 'Geral']].map(([p, t]) => `<button role=tab aria-selected=${per == p} class="${per == p ? 'on' : ''}" onclick="rkPer('${p}')">${t}</button>`).join('')}</div>`;
  if (!k) return head + `<div class=panel><p>Não foi possível carregar o ranking agora.</p><button class="btn pri block" onclick="go('rk')">Tentar de novo</button></div>`;
  const top = k.top || [], pos = k.me.pos, ahead = pos && pos > 1 ? top.find(r => r.pos == pos - 1) : null, lead = Math.max(1, top.length ? top[0].xp : 1);
  // cartão "sua posição"
  let big, sub = '', extra = '';
  if (k.me.hidden) { big = 'Fora do ranking'; sub = 'Ninguém vê o seu nome. Quer voltar?'; extra = `<button class="btn pri" onclick="rkVis(true)">Aparecer no ranking</button>`; }
  else if (!m.verified) { big = 'Confirme seu e-mail'; sub = 'Só contas com e-mail confirmado aparecem no ranking.'; }
  else if (pos) {
    big = `Você está em ${pos}º lugar`; sub = `${nf(k.me.xp)} XP ${unit}`;
    if (pos == 1) extra = `<p class=rkup>${ic('crown', 15)} Você lidera ${unit}. Continue assim!</p>`;
    else if (ahead) { const d = ahead.xp - k.me.xp; extra = `<div class=rkup><div class=ph><span>${d > 0 ? `Faltam ${nf(d)} XP para o ${pos - 1}º lugar` : `Empate em XP com o ${pos - 1}º lugar`}</span><b>${nf(k.me.xp)} / ${nf(ahead.xp)}</b></div><div class=bar><i style="width:${Math.min(100, Math.round(k.me.xp / Math.max(1, ahead.xp) * 100))}%"></i></div></div>`; }
  } else { big = `Você ainda não pontuou${per == 'semana' ? ' nesta semana' : ''}`; sub = 'Conclua uma lição para entrar no ranking.'; }
  let fim = ''; if (per == 'semana' && k.resets) { const ms = Math.max(0, Date.parse(k.resets) - Date.now()), d = Math.floor(ms / 864e5), hh = Math.floor(ms % 864e5 / 36e5); fim = `<span>${ic('clock', 14)} Recomeça em ${d ? d + (d == 1 ? ' dia e ' : ' dias e ') : ''}${hh} h</span>`; }
  const meta = fim || k.total ? `<div class=rkmeta>${fim}${k.total ? `<span>${ic('users', 14)} ${nf(k.total)} ${k.total == 1 ? 'aluno' : 'alunos'}</span>` : ''}</div>` : '';
  const av = faceOf;
  const pod = r => `<div class="pdc p${r.pos}${r.me ? ' me' : ''}">${r.pos == 1 ? `<span class=cr>${ic('crown', 22)}</span>` : ''}${av(r, r.pos == 1 ? 68 : 54)}<b class=nm>${esc(r.name)}</b><small class=tt>${r.me ? 'você · ' : ''}${esc(CR.TIERS[r.tier].title)}</small><span class=px>${nf(r.xp)} XP</span><div class=stp><b>${r.pos}º</b></div></div>`;
  const row = r => `<div class="rkx${r.me ? ' me' : ''}"><b class=pn>${r.pos}º</b>${av(r, 42)}<div class=bd><b>${esc(r.name)}${r.me ? ' <span class=badge>você</span>' : ''}</b><small>${esc(CR.TIERS[r.tier].title)}</small><span class=rbar><i style="width:${Math.max(3, Math.round(r.xp / lead * 100))}%"></i></span></div><span class=rxp><b>${nf(r.xp)}</b><small>XP</small></span></div>`;
  const rest = top.slice(3);
  const list = top.length
    ? `<div class=podium>${[top[1], top[0], top[2]].filter(Boolean).map(pod).join('')}</div>${rest.length || k.me.row ? `<div class="panel rkl">${rest.map(row).join('')}${k.me.row ? `<div class=rkgap aria-hidden=true>· · ·</div>${row(k.me.row)}` : ''}</div>` : ''}`
    : `<div class="panel rkem">${poseChip('pensando', 76)}<b>Ninguém pontuou${per == 'semana' ? ' nesta semana' : ''} ainda</b><small>Conclua uma lição e seja ${fm('o primeiro', 'a primeira')}!</small></div>`;
  return head + meta + `<div class="panel rkme"><div class=rkh><span class=rkv>${avatar(56, 'ring')}</span><div class=bd><small class=lbl>Sua posição</small><b>${big}</b>${sub ? `<small>${sub}</small>` : ''}</div></div>${extra}</div>${list}
    <div class="panel rkpv">${ic('shield', 20)}<div class=bd><b>Sua privacidade</b><small>Aparecem só o primeiro nome, a inicial do sobrenome, o personagem e o XP.</small></div>${k.me.hidden ? '' : `<button class="btn ghost" onclick="rkVis(false)">Ocultar meu nome do ranking</button>`}</div>`;
}
function rkPer(p) { if (S.rkp === p) return; S.rkp = p; go('rk'); }
async function rkVis(show) {
  if (!show && !confirm('Sair do ranking? Seu nome deixa de aparecer para os outros alunos. Você pode voltar quando quiser, em Ranking ou no Perfil.')) return;
  try { S.me = await api('ranking/visibility', { body: { show } }); toast(show ? 'Você voltou ao ranking.' : 'Pronto! Você saiu do ranking.'); go(S.tab); } catch (e) { fail(e); }
}
// ============================================================ PERFIL: cabeçalho com progresso + 3 abas (Resumo, Personagem e Ajustes)
// ============================================================ MURAL DA TURMA
// A turma posta projetos, conquistas e dicas: só texto (até 500 letras) e, se quiser, UM link https. Tudo que vem do servidor passa por esc() e o link só
// vira <a> se começar com https://. O dono pode desligar o Mural no painel (S.cfg.mural) e 3 denúncias escondem o post até ele revisar.
const MU_MAX = 500, MU_KIND = {
  projeto: ['Projeto', 'brief', 'Conte o que você montou e o que aprendeu. Ex.: "Fiz um painel de vendas em Power BI com 3 gráficos."'],
  conquista: ['Conquista', 'trophy', 'Comemore! Ex.: "Passei na prova final do Básico de SQL!"'],
  dica: ['Dica', 'bulb', 'Ensine algo que ajudou você. Ex.: "Use LIMIT 5 para espiar a tabela antes de rodar tudo."']
};
const muOn = () => !S.cfg || S.cfg.mural !== false;
const muSt = () => S.mu || (S.mu = { items: [], more: false, next: null, k: '', mine: false, on: true, err: false, open: false, draft: { kind: 'projeto', text: '', link: '' } });
const muAgo = iso => { const t = Date.parse(iso || ''); if (!t) return ''; const m = Math.max(0, Math.round((Date.now() - t) / 6e4)); if (m < 1) return 'agora'; if (m < 60) return `há ${m} min`; if (m < 1440) return `há ${Math.round(m / 60)} h`; if (m < 2880) return 'ontem'; if (m < 43200) return `há ${Math.round(m / 1440)} dias`; return new Date(t).toLocaleDateString('pt-BR'); };
async function muFetch(more) {
  const s = muSt(), q = new URLSearchParams(); if (s.k) q.set('k', s.k); if (s.mine) q.set('mine', '1'); if (more && s.next) q.set('before', s.next);
  try { const r = await api('mural' + (q.toString() ? '?' + q : '')); s.on = r.on !== false; s.items = more ? s.items.concat(r.items || []) : (r.items || []); s.more = !!r.more; s.next = r.next || null; s.err = false; }
  catch (e) { if (e.silent) throw e; if (more) return fail(e); s.err = true; s.items = []; s.more = false; }
}
async function muReload() { try { await muFetch(); render(); } catch (e) { } }
function muFilter(k) { const s = muSt(); s.mine = k == 'mine'; s.k = k == 'mine' ? '' : k; muReload(); }
async function muMore() { const b = $('#mumore'); if (b) b.disabled = true; try { await muFetch(true); render(); } catch (e) { } }
// ideias para o post, tiradas do que a pessoa já fez: projetos concluídos e conquistas do perfil
function muIdeas() {
  const m = S.me, nm = p => p.title.replace(/^Projeto:\s*/i, ''), out = [];
  (S.projs || []).filter(p => (m.cps || []).includes(p.id)).slice(-3).reverse().forEach(p => out.push({ kind: 'projeto', label: 'Projeto: ' + nm(p), text: `Concluí o projeto "${nm(p)}" no curso de ${TN[p.track]}. ` }));
  achList().filter(a => a[2]).slice(-3).reverse().forEach(a => out.push({ kind: 'conquista', label: a[1], text: `Conquista desbloqueada no CodeUp: ${a[1]}! ` }));
  return out;
}
function muComposer() {
  const m = S.me, s = muSt(), d = s.draft;
  if (!m.verified) return `<div class="panel mucv">${ic('info', 20)}<div class=bd><b>Confirme seu e-mail para postar</b><small>Você já pode ler o Mural. Enviamos um link para ${esc(m.email)}.</small></div><button class="btn ghost" onclick=resendVerify()>Reenviar e-mail</button></div>`;
  if (!s.open) return `<button class="panel muopen" onclick=muOpen()>${avatar(44, 'ring')}<span class=bd><b>Compartilhe com a turma</b><small>Projeto, conquista ou dica</small></span><span class=muplus>${ic('plus', 20)}</span></button>`;
  const ideas = muIdeas();
  return `<div class="panel mucomp"><div class=mukinds role=tablist aria-label="Tipo do post">${Object.entries(MU_KIND).map(([k, v]) => `<button role=tab aria-selected=${d.kind == k} class="${d.kind == k ? 'on' : ''}" onclick="muKind('${k}')">${ic(v[1], 16)}<span>${v[0]}</span></button>`).join('')}</div>
    ${ideas.length ? `<div class=muid><small>Preencher com o que você fez:</small><div class=much>${ideas.map((x, i) => `<button onclick="muIdea(${i})">${esc(x.label)}</button>`).join('')}</div></div>` : ''}
    <textarea id=mut class=muta maxlength=${MU_MAX} rows=4 placeholder="${esc(MU_KIND[d.kind][2])}" oninput="muType(this)" aria-label="Texto do post">${esc(d.text)}</textarea>
    <div class=mucnt><span id=mucn>${d.text.length}/${MU_MAX}</span></div>
    <input class="in mulin" id=mulk type=url inputmode=url maxlength=200 placeholder="Link https:// (opcional): GitHub, Drive, painel publicado…" value="${esc(d.link)}" oninput="muSt().draft.link=this.value" autocomplete=off aria-label="Link do projeto (opcional)">
    <p class=munote>${ic('shield', 13)} Aparecem só o seu primeiro nome, a inicial do sobrenome e o seu personagem. O e-mail nunca aparece. Não poste senhas nem dados pessoais.</p>
    <div class=mucs><button class="btn ghost" onclick=muCancel()>Cancelar</button><button class="btn pri" id=musend onclick=muSend()>Publicar</button></div></div>`;
}
function muCard(r) {
  const K = MU_KIND[r.kind] || MU_KIND.dica, link = typeof r.link == 'string' && /^https:\/\//i.test(r.link) ? r.link : '', host = (() => { try { return new URL(link).hostname.replace(/^www\./, ''); } catch { return ''; } })(), id = esc(r.id);
  return `<article class="panel muc k-${esc(r.kind)}${r.hidden ? ' hid' : ''}" id="mu-${id}"><header class=muh>${faceOf(r, 44)}<div class=bd><b>${esc(r.name)}${r.mine ? ' <span class=badge>você</span>' : ''}</b><small>${esc((CR.TIERS[r.tier] || CR.TIERS[0]).title)} · ${esc(muAgo(r.at))}</small></div><span class=muk>${ic(K[1], 14)} ${K[0]}</span></header>
    ${r.hidden ? `<div class=muhid>${ic('info', 15)}<span>Este post está escondido e em análise. Só você o vê por enquanto.</span></div>` : ''}
    <p class=mup>${esc(r.text)}</p>${link && host ? `<a class=mul href="${esc(link)}" target=_blank rel="noopener noreferrer nofollow ugc">${ic('link', 15)}<span>${esc(host)}</span></a>` : ''}
    <footer class=muf><button class="mulk${r.liked ? ' on' : ''}" onclick="muLike('${id}')" aria-pressed=${!!r.liked} aria-label="${r.liked ? 'Descurtir' : 'Curtir'} (${r.likes} ${r.likes == 1 ? 'curtida' : 'curtidas'})">${ic('heart', 19)}<b>${r.likes}</b></button><span class=grow></span>
    ${r.mine ? `<button class=mua onclick="muDel('${id}')">${ic('trash', 15)} Apagar</button>` : r.reported ? `<span class=mua>${ic('check', 15)} Denunciado</span>` : `<button class=mua onclick="muRep('${id}')">${ic('flag', 15)} Denunciar</button>`}</footer></article>`;
}
function muView() {
  const s = muSt(), head = `<h2 class=ttl>Mural</h2><p class=sub>A turma mostra o que construiu e conquistou. Poste o seu e inspire quem está começando.</p>`;
  if (!muOn() || !s.on) return head + `<div class="panel rkem">${poseChip('pensando', 76)}<b>O Mural está em pausa</b><small>Volte daqui a pouco. Os posts ficam guardados.</small></div>`;
  const F = [['', 'Tudo'], ['projeto', 'Projetos'], ['conquista', 'Conquistas'], ['dica', 'Dicas'], ['mine', 'Meus posts']], cur = s.mine ? 'mine' : s.k;
  const list = s.err ? `<div class=panel><p>Não foi possível carregar o Mural agora.</p><button class="btn pri block" onclick=muReload()>Tentar de novo</button></div>`
    : s.items.length ? s.items.map(muCard).join('') + (s.more ? `<button class="btn ghost block" id=mumore onclick=muMore()>Ver mais posts</button>` : '')
    : `<div class="panel rkem">${poseChip('pensando', 76)}<b>${s.mine ? 'Você ainda não postou' : 'Ainda não há posts aqui'}</b><small>${s.mine ? 'Compartilhe seu primeiro projeto, conquista ou dica!' : `Seja ${fm('o primeiro', 'a primeira')} a compartilhar algo com a turma!`}</small></div>`;
  return head + muComposer() + `<div class=mufl role=tablist aria-label="Filtrar posts">${F.map(([k, n]) => `<button role=tab aria-selected=${cur == k} class="${cur == k ? 'on' : ''}" onclick="muFilter('${k}')">${n}</button>`).join('')}</div>` + list
    + `<div class="panel rkpv">${ic('shield', 20)}<div class=bd><b>Combinado da turma</b><small>Aparecem só o seu primeiro nome, a inicial do sobrenome e o personagem, nunca o e-mail. Não poste senhas nem dados pessoais. Post ofensivo pode ser denunciado e removido.</small></div></div>`;
}
const muFocus = () => setTimeout(() => { const t = $('#mut'); if (t) { t.focus(); t.setSelectionRange(t.value.length, t.value.length); } }, 60);
function muOpen() { muSt().open = true; render(); muFocus(); }
function muCancel() { muSt().open = false; render(); }
function muKind(k) { if (MU_KIND[k]) { muSt().draft.kind = k; render(); muFocus(); } }
function muType(el) { muSt().draft.text = el.value; const c = $('#mucn'); if (c) c.textContent = el.value.length + '/' + MU_MAX; }
function muIdea(i) { const x = muIdeas()[i]; if (!x) return; const d = muSt().draft; d.kind = x.kind; d.text = x.text; render(); muFocus(); }
async function muSend() {
  const s = muSt(), d = s.draft, text = d.text.trim(), b = $('#musend');
  if (text.length < 5) return toast('Escreva pelo menos uma frase.', true);
  if (b) b.disabled = true;
  try { await api('mural/new', { body: { kind: d.kind, text, link: d.link.trim() } }); s.draft = { kind: d.kind, text: '', link: '' }; s.open = false; s.k = ''; s.mine = false; await muFetch(); render(); window.scrollTo(0, 0); toast('Publicado no Mural!'); }
  catch (e) { fail(e); if (b) b.disabled = false; }
}
function muPaint(id) { const r = muSt().items.find(x => x.id == id), el = document.getElementById('mu-' + id); if (r && el) el.outerHTML = muCard(r); }
async function muLike(id) {
  const r = muSt().items.find(x => x.id == id); if (!r) return;
  try { const j = await api(`mural/${id}/like`, { body: {} }); r.likes = j.likes; r.liked = j.liked; muPaint(id); } catch (e) { fail(e); if (e.status == 404) muReload(); }
}
async function muRep(id) {
  if (!confirm('Denunciar este post? Se várias pessoas denunciarem, ele fica escondido até o dono do app revisar.')) return;
  try { const j = await api(`mural/${id}/report`, { body: {} }), s = muSt(), r = s.items.find(x => x.id == id); toast(j.already ? 'Você já denunciou este post.' : 'Obrigado! Vamos revisar este post.'); if (j.hidden) s.items = s.items.filter(x => x.id != id); else if (r) r.reported = true; render(); } catch (e) { fail(e); if (e.status == 404) muReload(); }
}
async function muDel(id) {
  if (!confirm('Apagar este post? Isso não pode ser desfeito.')) return;
  try { await api('mural/' + id, { method: 'DELETE' }); const s = muSt(); s.items = s.items.filter(x => x.id != id); toast('Post apagado.'); render(); } catch (e) { fail(e); }
}
// botão "Compartilhar no Mural" do perfil: abre o Mural com um texto pronto sobre as conquistas
async function muShare() {
  const s = muSt(), got = achList().filter(a => a[2]).map(a => a[1]); if (!got.length) return;
  s.draft = { kind: 'conquista', text: `Minhas conquistas no CodeUp: ${got.join(', ')}.`.slice(0, MU_MAX), link: '' }; s.open = true; s.k = ''; s.mine = false; await go('mu'); muFocus();
}

function profileView(L, T) {
  const t = ['res', 'per', 'aju'].includes(S.pft) ? S.pft : 'res';
  return `${pfHero()}<div class="pseg pft" role=tablist aria-label="Seções do perfil">${[['res', 'Resumo'], ['per', 'Personagem'], ['aju', 'Ajustes']].map(([k, n]) => `<button role=tab aria-selected=${t == k} class="${t == k ? 'on' : ''}" onclick="pfTab('${k}')">${n}</button>`).join('')}</div>${t == 'res' ? pfRes(L, T) : t == 'per' ? pfChar() : pfSet(T)}`;
}
function pfTab(k) {
  if (S.pft === k) return; S.pft = k; render();
  const b = document.querySelector('.pft'); if (b && window.scrollY > b.offsetTop - 8) window.scrollTo(0, Math.max(0, b.offsetTop - 8));
}
function pfHero() {
  const m = S.me, lvl = Math.floor(m.xp / 100) + 1, tier = CR.TIERS[CR.tierOf(m.xp)], cur = CR.frameOf(m.xp, m.frame);
  return `<div class="panel pfh" style="--fr:${CR.TIERS[cur].color}"><div class=pfi>${avatar(80, 'ring big')}<div class=bd><h2>${esc(m.name)}<button class=ibtn onclick=editName() aria-label="Editar nome">${ic('pencil', 16)}</button></h2><small class=mut>${esc(m.email)}</small>
      <div class=pfb><span class="badge gold">${ic('crown', 12)} ${tier.title}</span><span class=badge>Nível ${lvl}</span><span class=badge>${nf(m.xp)} XP</span></div></div></div></div>`;
}
// progresso até o próximo título e até o próximo nível (primeiro cartão da aba Resumo)
function pfProg() {
  const m = S.me, lvl = Math.floor(m.xp / 100) + 1, tier = CR.TIERS[CR.tierOf(m.xp)], nxt = CR.nextTier(m.xp);
  return `<div class="panel pfg"><div class=pfp><div class=ph><span>${nxt ? 'Próximo título: ' + nxt.title : 'Você chegou ao topo: Lenda!'}</span><b>${nxt ? 'faltam ' + nf(nxt.xp - m.xp) + ' XP' : nf(m.xp) + ' XP'}</b></div><div class=bar><i style="width:${nxt ? Math.round((m.xp - tier.xp) / (nxt.xp - tier.xp) * 100) : 100}%"></i></div></div>
    <div class=pfp><div class=ph><span>Nível ${lvl} → ${lvl + 1}</span><b>${m.xp % 100} / 100 XP</b></div><div class="bar thin"><i style="width:${m.xp % 100}%"></i></div></div></div>`;
}
// as conquistas do perfil: [ícone, nome, já ganhou?] (o Mural usa a mesma lista para sugerir posts)
function achList() {
  const m = S.me, n = (S.ls || []).filter(done).length, np = Object.keys(m.passed).length, T = m.track;
  return [['target', 'Primeira lição', n >= 1], ['flame', 'Sequência de 3 dias', m.streak >= 3], ['cap', 'Básico aprovado', np >= 1], ['code', 'Intermediário aprovado', COURSES.some(t => passedLv(t, 2))],
    ['trophy', 'Avançado aprovado', COURSES.some(t => passedLv(t, 3))], ['award', 'Curso concluído', COURSES.some(trackPassed)], ['chart', 'Meio caminho', T ? trackPct(T) >= 50 : false], ['bolt', '1.000 XP', m.xp >= 1000]];
}
function pfRes(L, T) {
  const m = S.me, n = L.filter(done).length, np = Object.keys(m.passed).length, ach = achList();
  const kp = (i, v, l) => `<div class=kp><span class=kpi>${ic(i, 17)}</span><b>${v}</b><small>${l}</small></div>`;
  return `${pfProg()}<div class=kpg>${kp('flame', m.streak, 'dias de treino') + kp('file', n, 'lições feitas') + kp('cap', np, 'provas aprovadas') + kp('bolt', nf(m.xp), 'XP total') + kp('chart', nf(m.wk), 'XP na semana') + kp('gem', nf(m.gems || 0), 'diamantes')}</div>
    <div class=sec>Conquistas <span class=cnt>${ach.filter(a => a[2]).length} de ${ach.length}</span></div><div class=ach>${ach.map(a => `<div class="${a[2] ? 'on' : ''}">${ic(a[0], 20)}<span>${a[1]}</span></div>`).join('')}</div>
    ${muOn() && ach.some(a => a[2]) ? `<button class="btn ghost block" onclick=muShare()>${ic('chat', 17)} Compartilhar no Mural</button>` : ''}
    ${tiersView()}`;
}
function pfChar() {
  const m = S.me;
  return `<div class=sec>Meu personagem</div>
    <div class="panel setc">
      <div class=set><div class=sl>Eu sou</div><div class=sg>${[['f', 'Feminino'], ['m', 'Masculino']].map(([k, n]) => `<button class="${m.sex == k ? 'on' : ''}" aria-pressed=${m.sex == k} onclick="setSex('${k}')">${n}</button>`).join('')}</div></div>
      <div class=set><div class=sl>Personagem</div><div class="sg gsw">${['tay', 'cut'].map(g => `<button class="${gid() == g ? 'on' : ''}" aria-pressed=${gid() == g} onclick="setGuide('${g}')"><img src="/img/${g}-face.webp" class="g-${g}" alt="" width=26 height=26> ${GUIDES[g].name}</button>`).join('')}</div></div>
      <button class=lrow onclick=editGname()><span class=si>${ic('pencil', 17)}</span><span class=bd><small>Nome do personagem</small><b>${esc(gnm())}</b></span>${ic('chev', 16)}</button>
    </div>
    ${czView()}`;
}
function pfSet(T) {
  const m = S.me, sf = window.CodeUpSfx ? CodeUpSfx.enabled() : true, sk = ['rose', 'neo', ''].includes(LS.get('skin')) ? LS.get('skin') : 'wild';
  const sh = (i, t, d) => `<div class=sh><span class=si>${ic(i, 18)}</span><div class=bd><b>${t}</b><small>${d}</small></div></div>`;
  const row = (i, t, fn, d) => `<button class=lrow onclick="${fn}"><span class=si>${ic(i, 17)}</span><span class=bd><b>${t}</b>${d ? `<small>${d}</small>` : ''}</span>${ic('chev', 16)}</button>`;
  return `<div class=sec>Preferências</div>
    <div class="panel setc">
      <div class=set>${sh('crown', 'Ranking', 'No ranking aparecem só o seu primeiro nome, a inicial do sobrenome, o personagem e o XP.')}<div class=sg>${[[true, 'Aparecer'], [false, 'Ficar de fora']].map(([k, n]) => `<button class="${!m.rankOff == k ? 'on' : ''}" onclick="rkVis(${k})">${n}</button>`).join('')}</div></div>
      <div class=set>${sh('volume', 'Sons', 'Efeitos sonoros quando você acerta, passa na prova ou mantém a sequência de dias. Fica salvo neste aparelho.')}<div class=sg>${[[true, 'Ligados'], [false, 'Desligados']].map(([k, n]) => `<button class="${sf == k ? 'on' : ''}" onclick="setSfx(${k})">${n}</button>`).join('')}</div></div>
      <div class=set>${sh('palette', 'Aparência', 'Escolha as cores do aplicativo.')}<div class="sg sk">${[['wild', 'Azul', '#2f63b8'], ['rose', 'Rosa', '#c0398f'], ['', 'Azul escuro', '#111a2e'], ['neo', 'Claro', '#eef1ff']].map(x => `<button class="${sk == x[0] ? 'on' : ''}" onclick="setSkin('${x[0]}')"><i style="background:${x[2]}"></i>${x[1]}</button>`).join('')}</div></div>
    </div>
    <div class=sec>Minha conta</div>
    <div class="panel lst">
      ${row('swap', 'Trocar de curso', "go('tr')", 'Python, SQL, Excel, Power BI…')}
      ${row('key', m.hasPassword ? 'Alterar senha' : 'Criar senha', 'changePw()')}
      ${row('bulb', 'Rever o tour', "go('home').then(() => startTour(true))")}
      ${row('down', 'Baixar meus dados', 'exportData()')}
      ${row('out', 'Sair', 'logout()')}
    </div>
    <div class=sec>Zona de perigo</div>
    <div class="panel dz"><div class=bd><b>Excluir minha conta</b><small>Apaga seu progresso. Não dá para desfazer.</small></div><button class="btn danger" onclick=delAccount()>${ic('trash', 16)} Excluir</button></div>
    <p class=legal>${S.cfg.contact ? `Precisa de ajuda? <a href="mailto:${esc(S.cfg.contact)}">${esc(S.cfg.contact)}</a><br>` : ''}<a href="/guias" target="_blank">Guias gratuitos</a> · <a href="/termos" target="_blank">Termos de Uso</a> · <a href="/privacidade" target="_blank">Política de Privacidade</a></p>`;
}
// Títulos e molduras: cada título novo chega com um XP; a moldura aparece no aro do personagem (topo, perfil e ranking). Dá para escolher qualquer moldura já conquistada.
function tiersView() {
  const m = S.me, cur = CR.frameOf(m.xp, m.frame);
  return `<div class=sec>Títulos e molduras</div>
    <p class=tn style="margin:0 2px 8px">Toque numa moldura conquistada para usá-la no seu personagem.</p>
    <div class=tgr>${CR.TIERS.map((t, k) => { const on = m.xp >= t.xp, use = cur == k, bx = `<span class=sw2>${on ? '' : ic('lock', 14)}</span><b>${t.title}</b><small>${k == 0 ? 'Início' : nf(t.xp) + ' XP'}</small>${use && k ? `<span class=ck>${ic('check', 11)}</span>` : ''}`;
      return k == 0 || !on ? `<div class="tgi ${on ? 'on' : 'lk'}${use ? ' use' : ''}" style="--fr:${t.color}" title="${t.frame ? 'Moldura ' + t.frame + ' · ' + nf(t.xp) + ' XP' : 'Título inicial'}">${bx}</div>` : `<button class="tgi on${use ? ' use' : ''}" style="--fr:${t.color}" onclick="setFrame('${t.key}')" aria-pressed=${use} aria-label="Moldura ${t.frame}${use ? ' (em uso)' : ''}">${bx}</button>`; }).join('')}</div>`;
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
  const CZG = [['fan', 'Fantasias'], ['ex', 'Expressões'], ['color', 'Cor'], ['outfit', 'Estilo'], ['sticker', 'Adesivo'], ['bg', 'Fundo']], gt = CZG.some(x => x[0] == S.czt) ? S.czt : 'fan';
  const dressed = COS() && ['ex', 'color', 'outfit'].includes(gt) ? `<div class="panel wdn"><div class=bd><b>Você está de fantasia: ${esc(cosName(COS()))}</b><small>Cor, estilo e expressões são do visual normal. Tire a fantasia para usá-los.</small></div><button class="btn ghost" onclick="cosWear('nenhuma')">Tirar fantasia</button></div>` : '';
  return `<div class=sec>Personalizar personagem</div>
    <div class=czp${pbg ? ` style="--bgc:${pbg}"` : ''}><div class=czb>${body(190, S.pop ? 'pop' : '', '', '#ffd43b')}</div>${stkBadge(m.sticker, 46)}<span class=gn>${esc(gnm())}</span></div>
    <p class=tn style="margin:8px 2px 0">${free == all ? 'Você liberou todos os itens. É uma lenda!' : `${free} de ${all} itens liberados. Ganhe XP para subir de título e liberar o resto.`}</p>
    <div class=czt role=tablist aria-label="O que personalizar">${CZG.map(([k, n]) => `<button role=tab aria-selected=${gt == k} class="${gt == k ? 'on' : ''}" onclick="czTab('${k}')">${n}</button>`).join('')}</div>
    ${gt == 'fan' ? wardrobe() : ''}${dressed}
    ${gt == 'ex' && !dressed ? `<div class=czh>Expressões <small style="font-weight:700">(tocar no personagem também sorteia uma)</small></div><div class="czg ex">${EXPR[g].map(([k, n]) => `<button class=czi onclick="playMove('p:${k}')" aria-label="${n}"><i class="sw pz" style="background-image:url(/img/pose/${g}-${k}.webp);${HUE() ? `filter:hue-rotate(${HUE()}deg)` : ''}"></i><small>${n}</small></button>`).join('')}</div>` : ''}
    ${gt == 'color' && !dressed ? `<div class=czh>Cor da roupa</div><div class=czg>${colors}</div>` : ''}
    ${gt == 'outfit' && !dressed ? `<div class=czh>Estilo da roupa</div><div class=czg>${outs}</div>` : ''}
    ${gt == 'sticker' ? `<div class=czh>Adesivo</div><div class=czg>${stk}</div>` : ''}
    ${gt == 'bg' ? `<div class=czh>Fundo</div><div class=czg>${bgs}</div>` : ''}`;
}
// ============================================================ GUARDA-ROUPA: fantasias da Tay
// Cada fantasia pede um título. As de "conquista" vêm de graça com o título + dias de estudo; as da "loja" se compram com diamantes (lição +5, checkpoint +5, prova final +20, marcos da sequência).
// Quem confere tudo é o servidor (/api/costume/buy e /wear); aqui só se mostra o estado e se pede a ação.
const gemGot = () => S.gemsGot ? `<p class=gemgot>${ic('gem', 15)} <b>+${S.gemsGot}</b> ${S.gemsGot == 1 ? 'diamante' : 'diamantes'}</p>` : '';
const cosP = () => ({ xp: S.me.xp, days: S.me.days || 0, own: Object.fromEntries((S.me.own || []).map(k => [k, 1])), gems: S.me.gems || 0 });
function wardrobe() {
  const m = S.me, g = gid(), list = CR.costumesOf(g), P = cosP(), worn = COS();
  if (!list.length) return `<div class="panel rkem"><b>As fantasias de ${esc(GUIDES[g].name)} estão chegando</b><small>Enquanto isso, use as cores, estilos, adesivos e fundos.</small></div>`;
  const have = list.filter(c => CR.costumeState(c, P) == 'own').length;
  const st = c => CR.costumeState(c, P);
  const sub = c => { const s = st(c), T = CR.TIERS[c.tier];
    return worn == c.key ? `<span class=wst>${ic('check', 11)} Vestindo</span>` : s == 'own' ? '<span class=wst>Vestir</span>'
      : s == 'tier' ? `<span class="wst lk">${ic('lock', 11)} ${T.title}</span>` : s == 'days' ? `<span class="wst lk">${ic('lock', 11)} ${P.days}/${c.days} dias</span>`
      : `<span class="wst gm${s == 'poor' ? ' lk' : ''}">${ic('gem', 11)} ${c.price}</span>`; };
  const card = c => { const s = st(c), on = worn == c.key, lock = s == 'tier' || s == 'days'; return `<button class="wdc${on ? ' on' : ''}${lock ? ' lk' : ''}" onclick="cosOpen('${c.key}')" aria-label="${esc(c.name)}: ${on ? 'vestindo' : s == 'own' ? 'sua, toque para vestir' : s == 'tier' ? 'bloqueada, precisa do título ' + CR.TIERS[c.tier].title : s == 'days' ? 'bloqueada, faltam dias de estudo' : 'à venda por ' + c.price + ' diamantes'}"><span class=wdp><img loading=lazy decoding=async src="${cosPic(c.key, 't')}" alt="" width=160 height=200></span><b>${esc(c.name)}</b>${sub(c)}${s == 'own' && c.days ? `<i class=wtag>Conquista</i>` : ''}</button>`; };
  const normal = `<button class="wdc${worn ? '' : ' on'}" onclick="cosWear('nenhuma')" aria-label="Visual normal${worn ? ', toque para tirar a fantasia' : ' (em uso)'}"><span class="wdp nm"><img src="/img/${g}-face.webp" alt="" width=128 height=128></span><b>Visual normal</b><span class=wst>${worn ? 'Vestir' : `${ic('check', 11)} Vestindo`}</span></button>`;
  return `<div class="panel wdh"><span class=wgi>${ic('gem', 22)}</span><div class=bd><b>${nf(P.gems)} ${P.gems == 1 ? 'diamante' : 'diamantes'}</b><small>${nf(P.days)} ${P.days == 1 ? 'dia' : 'dias'} de estudo · ${have} de ${list.length} fantasias</small></div></div>
    <p class=tn style="margin:8px 2px 0">Estude com frequência: as fantasias de <b>conquista</b> chegam com o título e os dias de estudo, e as da <b>loja</b> se compram com diamantes. Toque numa para ver os detalhes.</p>
    <div class=wdg>${normal}${list.map(card).join('')}</div>`;
}
function cosOpen(key) {
  const c = CR.costume(key); if (!c) return; closeCos();
  const m = S.me, P = cosP(), s = CR.costumeState(c, P), worn = COS() == key, T = CR.TIERS[c.tier], falta = c.price ? c.price - P.gems : 0;
  const how = c.days ? `<b>Conquista:</b> chegue ao título ${T.title} (${nf(T.xp)} XP) e estude em ${c.days} dias diferentes. Você tem ${P.days} ${P.days == 1 ? 'dia' : 'dias'}.`
    : `<b>Loja:</b> libera com o título ${T.title} (${nf(T.xp)} XP) e custa ${c.price} diamantes. Diamantes vêm de estudar: lição +5, checkpoint +5, prova final +20 e bônus nos marcos da sequência de dias.`;
  const btn = worn ? `<button class="btn ghost block" onclick="cosWear('nenhuma')">Tirar fantasia</button>`
    : s == 'own' ? `<button class="btn pri block" onclick="cosWear('${key}')">Vestir</button>`
    : s == 'buy' ? `<button class="btn pri block" onclick="cosBuy('${key}')">${ic('gem', 16)} Comprar por ${c.price}</button>`
    : `<button class="btn block" disabled>${s == 'poor' ? `Faltam ${falta} ${falta == 1 ? 'diamante' : 'diamantes'}` : s == 'tier' ? `Libera com o título ${T.title}` : `Faltam ${c.days - P.days} ${c.days - P.days == 1 ? 'dia' : 'dias'} de estudo`}</button>`;
  const o = document.createElement('div'); o.className = 'ov'; o.id = 'cosov'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-label', `Fantasia ${c.name}`);
  o.innerHTML = `<div class="modal wsh"><span class="wpv${s == 'tier' || s == 'days' ? ' lk' : ''}"><img src="${cosPic(key)}" alt="${esc(c.name)}"></span><h2>${esc(c.name)}</h2><p class=wdesc>${how}</p>${btn}<button class="btn ghost block" style="margin-top:8px" onclick="closeCos()">Fechar</button></div>`;
  o.addEventListener('click', e => { if (e.target === o) closeCos(); });
  document.body.appendChild(o);
  const f = o.querySelector('.btn.pri') || o.querySelector('.btn'); if (f) setTimeout(() => f.focus({ preventScroll: true }), 60);
}
function closeCos() { const o = document.getElementById('cosov'); if (o) o.remove(); }
async function cosWear(key) {
  const y = window.scrollY; closeCos();
  try { S.me = await api('costume/wear', { body: { key } }); S.pop = 1; sfx('pop'); render(); S.pop = 0; window.scrollTo(0, y); toast(key == 'nenhuma' ? 'Visual normal de volta!' : `${gnm()} vestiu a fantasia ${cosName(key)}!`); } catch (e) { fail(e); }
}
async function cosBuy(key) {
  const y = window.scrollY; closeCos();
  try { S.me = await api('costume/buy', { body: { key } }); S.pop = 1; sfx('streak'); confetti(36); render(); S.pop = 0; window.scrollTo(0, y); toast(`Fantasia ${cosName(key)} comprada! ${gnm()} já está vestindo.`); } catch (e) { fail(e); }
}
function openWardrobe() { closeCos(); S.pft = 'per'; S.czt = 'fan'; go('pf'); }
function czTab(k) { if (S.czt === k) return; S.czt = k; const y = window.scrollY; render(); window.scrollTo(0, y); }
async function czSet(kind, key) {
  const it = key == 'auto' ? null : CR.item(CR.LISTS[kind], key);
  if (it && it.tier > CR.tierOf(S.me.xp)) { const t = CR.TIERS[it.tier]; return toast(`Libera com o título ${t.title} (${nf(t.xp)} XP).`); }
  const y = window.scrollY;
  try { S.me = await api('guide', { body: { [kind]: key } }); S.pop = 1; render(); S.pop = 0; window.scrollTo(0, y); } catch (e) { fail(e); }
}
// botões "Expressões" do Perfil: o personagem do preview faz a expressão escolhida ('p:<pose>', veja as poses em img/pose/)
function playMove(k) { const el = document.querySelector('.czp .abody'); if (window.CodeUpAnim && el && CodeUpAnim.play(el, k)) return; toast('Este aparelho não mostra o personagem animado (ou o movimento reduzido está ligado).', true); }
async function setFrame(key) { try { S.me = await api('guide', { body: { frame: key } }); toast('Moldura trocada!'); render(); } catch (e) { fail(e); } }
// "Desbloqueado!": o que a conquista acabou de abrir. Lições, checkpoint, prova final e nível (o que estava com cadeado e agora está livre)
// e, quando o XP chega a um título novo, o título, a moldura e os itens de personalização (cor, adesivo, fundo e estampa) que ele libera
function unlocksOf(lk0, xb, s) {
  const opened = x => lk0[x.id] && !x.lock, g = [], cur = S.cur;
  S.ls.filter(opened).forEach(x => g.push(x.n == 1 && x.lv > 1 ? { i: 'flag', t: `Nível ${LV[x.lv - 1]}`, d: `${TN[x.track]} · a lição 1 já está livre` } : { i: 'play', t: `Lição ${x.n}`, d: x.title }));
  (S.cps || []).filter(opened).forEach(c => g.push(c.fin ? { i: 'cap', t: 'Prova final', d: `${TN[c.track]} ${LV[c.lv - 1]} · 3 chances` } : { i: 'flag', t: `Checkpoint da lição ${c.after}`, d: `${c.title.replace(/^Checkpoint: /, '')} · 2 chances` }));
  (S.projs || []).filter(opened).forEach(p => g.push({ i: 'brief', t: `Projeto da lição ${p.after}`, d: p.title.replace(/^Projeto: /, '') }));
  if (s.trackComplete && cur) g.push({ i: 'award', t: `Curso de ${TN[cur.track]} concluído`, d: 'Você terminou todos os níveis. Parabéns!' });
  (s.newCos || []).forEach(k => g.push({ i: 'star', t: `Nova fantasia: ${cosName(k)}`, d: 'Já está no guarda-roupa, em Perfil › Personagem', cos: k }));
  if (s.gemBonus) g.push({ i: 'gem', t: `+${s.gemBonus} diamantes de bônus`, d: `Pela sequência de ${s.streak} dias seguidos` });
  const tiers = []; for (let k = CR.tierOf(xb) + 1; k <= CR.tierOf(s.xp); k++) tiers.push({ k, items: [['color', 'Cor', CR.COLORS], ['sticker', 'Adesivo', CR.STICKERS], ['bg', 'Fundo', CR.BACKS], ['outfit', 'Estampa', CR.OUTFITS]].flatMap(([kind, nm, list]) => list.filter(x => x.tier == k).map(it => ({ kind, nm, it }))) });
  return { g, tiers };
}
const unlockCard = () => {
  const u = S.unl; if (!u || !(u.g.length || u.tiers.length)) return '';
  const m = S.me, hue = (CR.item(CR.COLORS, m.color) || CR.item(CR.COLORS, CR.BASE[gid()]) || { hue: 222 }).hue;
  const sw = ({ kind, it }) => kind == 'color' ? `<i class=sw style="background:hsl(${it.hue} 80% 58%)"></i>` : kind == 'sticker' ? `<i class=sw style="--sc:${it.color}">${stkIcon(it.key, 22)}</i>` : kind == 'bg' ? `<i class=sw style="background:${bgCss(it.key)}"></i>` : `<i class=sw style="background:${outBg(it.key, hue)}"></i>`;
  const tier = t => { const T = CR.TIERS[t.k]; return `<div class=ut style="--fr:${T.color}"><div class=ui><span class=tring>${ic('crown', 20)}</span><div class=bd><b>Novo título: ${T.title}</b><small>Moldura ${T.frame} liberada</small></div></div>${t.items.length ? `<div class=uig>${t.items.map(x => `<span class=uic>${sw(x)}<small>${x.nm}<b>${esc(x.it.name)}</b></small></span>`).join('')}</div>` : ''}</div>`; };
  const row = x => `<div class=ui><span class=ux>${x.cos ? `<img src="${cosPic(x.cos, 't')}" alt="">` : ic(x.i, 18)}</span><div class=bd><b>${esc(x.t)}</b><small>${esc(x.d)}</small></div></div>`;
  return `<div class=unl role=status aria-live=polite><span class=unlc aria-hidden=true>${poseChip('apontando', 64)}</span><div class=uh>${ic('unlock', 20)}<b>Desbloqueado!</b><span>${u.g.length + u.tiers.length > 1 ? 'veja o que você abriu' : 'você abriu algo novo'}</span></div>${u.tiers.map(tier).join('')}${u.g.map(row).join('')}${u.tiers.some(t => t.items.length) ? `<a class=ulk onclick="go('pf')">${ic('pencil', 14)} Personalizar meu personagem</a>` : ''}${u.g.some(x => x.cos) ? `<a class=ulk onclick="openWardrobe()">${ic('star', 14)} Ver o guarda-roupa</a>` : ''}</div>`;
};

// ============================================================ ALUNO QUE VOLTOU DEPOIS DE DIAS: o personagem estava dormindo
// O servidor marca `me.away` quando a pessoa fica AWAY_DAYS (padrão 3) sem entrar. A tela mostra o personagem dormindo (expressão "dormindo" + "zzz"); ao tocar em
// "Acordar" ele acorda assustado e dá oi (reel 'wake'). Com movimento reduzido ou sem o personagem animado, aparece a imagem parada.
const zH = () => Math.round(Math.max(170, Math.min(300, innerHeight * .34)));
const sleepHero = (reel, h) => window.CodeUpAnim && CodeUpAnim.ok() && !window.matchMedia('(prefers-reduced-motion:reduce)').matches ? ovHero(h, reel) : (poseChip(reel == 'sleep' ? 'dormindo' : 'tchau', Math.round(h * .8)) || ovHero(h, ''));
const awayFor = n => n >= 60 ? `mais de ${Math.floor(n / 30)} meses` : n >= 30 ? 'mais de um mês' : n >= 14 ? `${Math.floor(n / 7)} semanas` : n == 1 ? '1 dia' : `${n} dias`;
function showAway() {
  const n = (S.me.away && S.me.away.days) || 3, nm = esc(gnm()), art = gid() == 'tay' ? 'a' : 'o', first = esc(String(S.me.name || '').split(' ')[0]);
  let acked = false; const ack = () => { if (acked) return; acked = true; api('away/ack', { method: 'POST' }).catch(() => { }); };
  const d = openOv('sleep', `<div class=zsky></div><i class=zmoon></i><div class="fxch zzh">${sleepHero('sleep', zH())}</div><h2 class=fxt id=zt>Shhh… ${nm} dormiu!</h2>
    <p class=zzs id=zs>Faz ${awayFor(n)} que você não aparece e ${nm} cochilou esperando. Que tal acordar ${art} ${nm}?</p>
    <button class="btn pri block fxbtn" id=zwake style="--bd:.7s">Acordar ${nm}</button>`, { tap: false, label: 'Seu personagem está dormindo', done: ack });
  const wake = () => {
    if (!d.isConnected || d.classList.contains('awake')) return; d.classList.add('awake'); ack(); sfx('pop');
    d.querySelector('.zzh').innerHTML = sleepHero('wake', zH());
    d.querySelector('#zt').textContent = `Oi, ${first || 'de novo'}!`;
    d.querySelector('#zs').innerHTML = `${nm} acordou e já quer estudar com você. Bora retomar?`;
    const b = d.querySelector('#zwake'); b.textContent = 'Bora estudar!'; b.onclick = () => closeOv();
    d._t = setTimeout(closeOv, 5200);
  };
  d.querySelector('#zwake').onclick = wake;
  setTimeout(() => { const b = d.querySelector('#zwake'); if (b && b.isConnected) b.focus({ preventScroll: true }); }, 900);
}
// o app pode ficar aberto na memória do celular (PWA) por dias: quando a pessoa volta para ele depois de um tempo, recarrega os dados e confere se ela estava ausente
let hiddenAt = 0;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { hiddenAt = Date.now(); return; }
  if (S.tk && S.me && hiddenAt && Date.now() - hiddenAt > 30 * 60e3 && !S.step && !S.wz && !document.getElementById('fxo')) go(S.tab);
  hiddenAt = 0;
});

// ============================================================ ANÚNCIOS
// O app NÃO mostra anúncios: o AdSense não permite anúncio em telas de navegação (mapa, abas, resultados) nem em telas sem conteúdo do dono do site.
// Os anúncios ficam só nos guias públicos (/guias, feitos no servidor por guides.js), que têm texto de verdade.

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
// Sem internet na hora de sair, o cookie de reserva continua válido: a marca 'nologin' impede o app de restaurar o login sozinho.
async function logout() { try { await api('logout', { body: {} }); } catch (e) { if (e && ((!e.status && !e.silent) || e.status >= 500)) LS.set('nologin', '1'); } S.tk = null; S.awaySeen = 0; localStorage.removeItem('tk'); S.auth = 'login'; showAuth(); }
function changePw() {
  const has = S.me.hasPassword;
  dialog(has ? 'Alterar senha' : 'Criar senha', [...(has ? [{ id: 'cur', ph: 'Senha atual', ac: 'current-password' }] : []), { id: 'new', ph: 'Nova senha (mín. 8 caracteres)', ac: 'new-password' }], 'Salvar', async v => {
    try { S.me = await api('password', { body: { current: v.cur || '', password: v.new } }); toast('Senha atualizada.'); render(); } catch (e) { fail(e); return false; }
  });
}
function delAccount() {
  if (!confirm('Excluir sua conta apaga seu progresso. Isso não pode ser desfeito.')) return;
  const has = S.me.hasPassword;
  dialog('Excluir conta', [{ id: 'c', type: has ? 'password' : 'text', ph: has ? 'Digite sua senha para confirmar' : 'Digite EXCLUIR para confirmar' }], 'Excluir para sempre', async v => {
    try { await api('account', { method: 'DELETE', body: has ? { password: v.c } : { confirm: v.c } }); S.tk = null; localStorage.removeItem('tk'); S.auth = 'register'; showAuth(); toast('Conta excluída.'); }
    catch (e) { fail(e); return false; }
  });
}

// ============================================================ LIÇÃO
// avisa por que a lição está bloqueada (devolve true se está)
function lockToast(m) {
  if (m.lock == 'level') { toast('Passe na prova final do nível anterior para liberar este nível.', true); return true; }
  if (m.lock == 'seq') { toast('Conclua a lição anterior para liberar esta.', true); return true; }
  if (m.lock == 'pj') { const p = pjOf(m.track, m.lv, m.n - 1); if (p && !p.lock) { toast('Antes, faça o projeto: monte algo com o que você aprendeu nas últimas 5 lições.'); openProj(p.id); return true; } toast('Faça o projeto para liberar esta lição.', true); return true; }
  if (m.lock == 'cp') { const c = cpBefore(m); if (c && !c.lock) { toast('Antes, faça o checkpoint: uma consulta com o que você aprendeu.'); openTest(c.id); return true; } toast('Faça o checkpoint para liberar esta lição.', true); return true; }
  return false;
}
// abrir uma lição: abre a próxima atividade que falta, na ordem sorteada daquela lição (executar, ler ou explicar)
async function openL(id) {
  const m = S.ls.find(l => l.id == id); if (!m) return;
  if (lockToast(m)) return;
  const nx = !S.me.done[id] ? actNext(m) : null;   // a lição ainda não feita abre na próxima parte do círculo: o "Como funciona" vem sempre primeiro
  openAct(id, nx || 'x');
}
const openAct = (id, a) => a == 'c' ? openC(id) : a == 'r' ? openR(id) : a == 'e' ? openE(id) : openX(id);
const resetLs = () => { S.h = 0; S.hearts = 5; S.tries = 0; S.errs = 0; S.lastRes = null; S.unl = null; S.rdMode = false; };
async function openC(id) {   // 1ª parte: para que serve e como funciona (animado)
  try { S.cur = await api('lessons/' + id); } catch (e) { return fail(e); }
  resetLs(); intro();
}
async function openX(id) {
  try { S.cur = await api('lessons/' + id); } catch (e) { return fail(e); }
  resetLs(); lesson();
}
const isTest = l => !!(l && (l.cp || l.fin));
// Enunciado em passos: parágrafos, listas ("- item" e "1. item"), `código`, **negrito** e destaque para "Dica:" / "Atenção:" (o texto vem de content/enunciados.txt; enunciado curto de lição é um parágrafo só)
const inlTxt = t => esc(t).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
function taskHtml(t) {
  const out = []; let list = null;
  const close = () => { if (list) { out.push(`<${list.tag}${list.start > 1 ? ' start=' + list.start : ''}>${list.items.map(i => `<li>${inlTxt(i)}</li>`).join('')}</${list.tag}>`); list = null; } };
  for (const raw of String(t || '').split('\n')) {
    const line = raw.trim(); let m;
    if (!line) { close(); continue; }
    if ((m = line.match(/^- (.+)$/))) { if (!list || list.tag != 'ul') { close(); list = { tag: 'ul', items: [] }; } list.items.push(m[1]); }
    else if ((m = line.match(/^(\d+)\. (.+)$/))) { if (!list || list.tag != 'ol') { close(); list = { tag: 'ol', start: +m[1], items: [] }; } list.items.push(m[2]); }
    else { close(); out.push(/^(Dica|Atenção):/.test(line) ? `<p class=tnote>${inlTxt(line)}</p>` : `<p>${inlTxt(line)}</p>`); }
  }
  close(); return out.join('');
}
// resultado que o aluno acabou de acertar (a tabela do SQL ou a saída do Python), mostrado na tela de conclusão
const resBox = () => S.lastRes ? `<div class="ob resbox"><div class=obh>${ic('check', 14)}<span>${S.cur && (S.cur.type == 'sql' || S.cur.type == 'dax') ? 'Seu resultado' : S.cur && S.cur.type == 'excel' ? 'Sua planilha' : S.cur && S.cur.type == 'quiz' ? 'Suas respostas' : 'Sua saída'}</span></div><div class=out>${S.lastRes}</div></div>` : '';
// Provas: os 2 checkpoints de cada nível (depois das lições 10 e 20, 2 chances) e a prova final (depois da 30, 3 chances). Uma tarefa completa com o que se aprendeu,
// sem teoria, dica nem solução. Acabaram as chances: o aluno volta 5 lições (checkpoint) ou 10 (prova final) para relembrar.
// Projeto (depois de cada 5 lições): um mini-projeto com o que o aluno aprendeu nas últimas 5. Não gasta chance nem faz voltar lição, e tem dica e solução, mas é obrigatório para seguir.
// Abre na tela de explicação (o que vai montar) e depois na prática, igual a uma lição.
async function openProj(id) {
  const p = (S.projs || []).find(x => x.id == id); if (!p) return;
  if (p.lock) return toast(p.lock == 'level' ? 'Passe na prova final do nível anterior para liberar este nível.' : `Conclua a lição ${p.after} para liberar este projeto.`, true);
  try { S.cur = await api('lessons/' + id); } catch (e) { return fail(e); }
  S.h = 0; S.hearts = 5; S.tries = 0; S.errs = 0; S.lastRes = null; S.unl = null; S.rdMode = false; lesson();
}
async function openTest(id) {
  if (/^pj-/.test(id)) return openProj(id);
  const c = (S.cps || []).find(x => x.id == id); if (!c) return;
  if (c.lock) return toast(c.lock == 'level' ? 'Passe na prova final do nível anterior para liberar este nível.' : c.fin ? `Conclua as 30 lições de ${LV[c.lv - 1]} (${TN[c.track]}) para liberar a prova final.` : `Conclua a lição ${c.after} para liberar este checkpoint.`, true);
  try { S.cur = await api('lessons/' + id); } catch (e) { return fail(e); }
  S.h = 0; S.tries = 0; S.lastRes = null; S.unl = null; testIntro();
}
// corações = chances que ainda restam numa prova
const chHearts = (n, max, sz = 22) => Array.from({ length: max }, (_, i) => `<span class="ht ${i < n ? 'on' : ''}">${ic('heart', sz)}</span>`).join('');
const testDone = l => l.fin ? passedLv(l.track, l.lv) : (S.me.cps || []).includes(l.id);
const whatT = l => l.type == 'sql' ? 'uma consulta completa' : l.type == 'excel' ? 'uma planilha completa' : l.type == 'dax' ? 'um conjunto de fórmulas DAX' : l.type == 'quiz' ? 'uma sequência de perguntas' : 'um programa completo';
function testIntro() {
  delete document.body.dataset.calm;
  const l = S.cur, fin = !!l.fin, ok = testDone(l), left = l.left ?? l.chances, nxt = l.lv < lvs(l.track).length ? `o nível ${LV[l.lv]}` : 'a conclusão do curso';
  theme(l.track);
  A.innerHTML = `<div class="c res">${stage(220, fm('Pronto', 'Pronta') + ' para ' + (fin ? 'a prova final' : 'o checkpoint') + '? Você consegue!', '', '', 'intro')}<h1>${fin ? 'Prova final' : 'Checkpoint'} · ${TN[l.track]} ${esc(l.level)}</h1>
  <p class=sub>${fin ? 'Tudo o que você aprendeu desde a lição 1' : `Tudo o que você aprendeu da lição 1 até a ${l.after}`}</p>
  <div class=chances>${chHearts(ok ? l.chances : left, l.chances, 26)}<small>${ok ? 'Você já passou: pode treinar sem perder nada' : left == 1 ? 'Última chance' : `${left} de ${l.chances} chances`}</small></div>
  <div class="panel rules"><b>Como funciona</b><ul><li>É uma tarefa só: você monta ${whatT(l)} com o que aprendeu.</li><li>Sem dica, sem solução e sem teoria durante a prova.</li>
    <li>Cada resposta errada gasta uma chance. ${l.type == 'quiz' ? 'Todas as perguntas precisam estar certas; nas provas não mostramos qual errou.' : l.type == 'dax' ? 'Fórmula com erro de digitação ou medida com o resultado errado também conta como resposta errada.' : l.type == 'excel' ? 'Célula vazia ou fórmula com erro também conta como resposta errada.' : 'Código que dá erro (erro de digitação, tabela que não existe) também conta como resposta errada e gasta uma chance.'} Confira bem antes de tocar em Concluído.</li>
    <li><b>Acertou:</b> ${fin ? `abre ${nxt} (+${50 * l.lv} XP de bônus na 1ª vez)` : `abre a lição ${l.after + 1} (+${l.xp} XP na 1ª vez)`}.</li>
    <li><b>Gastou as ${l.chances} chances:</b> você volta ${l.back} lições (da ${l.backFrom} à ${l.after}) para relembrar. O XP que já ganhou continua seu.</li></ul></div>
  ${infoCards(l.info)}
  ${l.cobre && l.cobre.length ? `<div class=cover><small>Temas das lições ${l.after - 9} a ${l.after}</small>${l.cobre.map(t => `<span>${esc(t)}</span>`).join('')}</div>` : ''}
  <button class="btn pri block" onclick=practice()>${ok ? 'Treinar' : 'Começar'}</button><button class="btn ghost block" onclick="go('home')">Agora não</button></div>`;
  window.scrollTo(0, 0);
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
    if ((e.ctrlKey || e.metaKey) && e.key == 'Enter') { e.preventDefault(); concluir(); }
  };
}
const edBox = (q, value) => `<div class=ed><div class=edh><i></i><i></i><i></i><span>${q.type == 'sql' ? 'consulta.sql' : q.type == 'dax' ? 'medida.dax' : 'main.py'}</span></div>
  <div class=edb><div class=gut id=gut>1</div><pre class=hlp id=hlp aria-hidden=true></pre><textarea id=ed wrap=off spellcheck=false autocapitalize=off autocomplete=off autocorrect=off>${esc(value)}</textarea></div></div>`;
const OUT0 = 'O resultado do seu código aparece aqui depois que você tocar em <b>Concluído</b>.<div class=tn>Atalhos: Ctrl+Enter conclui · Tab indenta</div>', OUT0D = 'Escreva a fórmula e toque em <b>Concluído</b>: o corretor calcula a sua medida e compara com o resultado esperado.<div class=tn>Atalhos: Ctrl+Enter conclui · Tab indenta · "Dados" mostra as tabelas</div>', OUT0Q = 'Responda as perguntas e toque em <b>Concluído</b> para conferir. Errou? A explicação aparece e você pode tentar de novo.', OUT0X = 'Escreva as fórmulas nas células <b>verdes</b> e toque em <b>Concluído</b> para conferir.<div class=tn>Toque numa célula para escolher · Enter confirma · depois de = ou ( toque nas células para apontar</div>', DONE_BTN = `${ic('check', 18)} Concluído`;
const outBox = (inner) => `<div class=ob><div class=obh><span>${S.cur.type == 'sql' ? 'Resultado' : S.cur.type == 'excel' || S.cur.type == 'quiz' ? 'Ajuda' : S.cur.type == 'dax' ? 'Conferência' : 'Saída'}</span></div><div id=out class=out>${inner}</div></div>`;

// as etapas da lição: 1 Como funciona · 2 Teoria · 3 Prática (projetos têm só Projeto · Prática). Tocar numa etapa vai até ela.
const steps = (n, proj, two) => {
  if (proj || two) return `<div class=steps><span class="${n == 1 ? 'on' : 'ok'}">${n == 1 ? '1' : ic('check', 14)} ${proj ? 'Projeto' : 'Teoria'}</span><i></i><span class="${n == 2 ? 'on' : ''}">2 Prática</span></div>`;
  const P = [['Como funciona', 'intro'], ['Teoria', 'lesson'], ['Prática', 'practice']];
  return `<div class="steps st3">${P.map(([t, f], i) => `${i ? '<i></i>' : ''}<span class="${n == i + 1 ? 'on' : n > i + 1 ? 'ok' : ''}" role=button tabindex=0 onclick="${f}()" onkeydown="if(event.key=='Enter'||event.key==' '){event.preventDefault();${f}()}">${n > i + 1 ? ic('check', 14) : i + 1} ${t}</span>`).join('')}</div>`;
};
// As 4 explicações de cada atividade (em linguagem de criança de 10 anos): o que é, para que serve, como você vai usar aqui e o que vai aparecer na tela
const INFO_K = { oque: ['O que é', 'info'], serve: ['Para que serve', 'target'], como: ['Como você vai usar aqui', 'pencil'], retorno: ['O que vai aparecer na tela', 'out'] };
const infoCards = (info, keys, title) => { const ks = (keys || Object.keys(INFO_K)).filter(k => info && info[k]); return ks.length ? `${title ? `<div class=infot>${title}</div>` : ''}<div class=infos>${ks.map(k => `<div class="inf ${k}"><div class=ih><span class=ii>${ic(INFO_K[k][1], 17)}</span><b>${INFO_K[k][0]}</b></div><p>${esc(info[k])}</p></div>`).join('')}</div>` : ''; };
// ============================================================ TABELAS DO SQL
// O nome da tabela e as colunas aparecem num cartão em cada atividade de SQL, para o aluno saber em qual tabela a lição trabalha.
function seedSchema(seed) {   // lê os CREATE TABLE do banco de treino: [{ name, cols }]
  const out = [], re = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["`\[]?(\w+)["`\]]?\s*\(([\s\S]*?)\)\s*;/gi; let m;
  while ((m = re.exec(String(seed || '')))) {
    const cols = []; let d = 0, cur = '';
    for (const ch of m[2] + ',') {
      if (ch == ',' && !d) { const w = cur.trim().split(/\s+/)[0].replace(/["`\[\]]/g, ''); if (w && !/^(PRIMARY|FOREIGN|UNIQUE|CHECK|CONSTRAINT)$/i.test(w)) cols.push(w); cur = ''; continue; }
      if (ch == '(') d++; else if (ch == ')') d--;
      cur += ch;
    }
    out.push({ name: m[1], cols });
  }
  return out;
}
const listPt = a => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' e ' + a[a.length - 1];
const tblCard = (tabs, o = {}) => `<div class=tbc><div class=tbh>${ic('db', 16)}<small>${o.title || (tabs.length > 1 ? 'Tabelas desta atividade' : 'Tabela desta atividade')}</small></div>${tabs.map(t => `<div class=tbi><b class=tbn>${esc(t.name)}</b><span class=tbcols>${t.cols.map(c => `<i>${esc(c)}</i>`).join('')}</span></div>`).join('')}${o.rest && o.rest.length ? `<p class=tbr>Também existe no banco: ${listPt(o.rest.map(t => `<b>${esc(t.name)}</b>`))}.</p>` : ''}${o.more ? `<p class=tbr>${o.more}</p>` : ''}</div>`;
// lição e prática: as tabelas que a solução usa ficam em destaque; as outras do mesmo banco aparecem só como aviso. Nas provas (sem solução) mostra todas.
const tblFor = (l, title, more) => {
  if (!l || l.type != 'sql') return '';
  const all = seedSchema(l.seed); if (!all.length) return '';
  const src = isTest(l) ? '' : String(l.solution || ''), used = src ? all.filter(t => new RegExp('\\b' + t.name + '\\b', 'i').test(src)) : [], show = used.length ? used : all;
  return tblCard(show, { title: used.length ? title : show.length > 1 ? 'Tabelas do banco' : 'Tabela do banco', rest: used.length ? all.filter(t => !used.includes(t)) : [], more });
};
// projeto: os temas das 5 lições que ele usa
const coverBox = l => l.cobre && l.cobre.length ? `<div class=cover><small>Temas das lições ${l.after - 4} a ${l.after}</small>${l.cobre.map(t => `<span>${esc(t)}</span>`).join('')}</div>` : '';
// teoria de SQL: logo abaixo do código do exemplo vem a tabelinha com o que ele devolve (gerada no servidor rodando o exemplo de verdade; veja tools/build-content.js)
const exResult = l => {
  const o = l && l.exampleOut; if (!o || !o.cols || !o.rows) return '';
  const rest = o.total - o.rows.length;
  return `<div class=exr><div class=exh>${ic('out', 16)}<small>${esc(o.label || 'Resultado do exemplo')}</small></div>${table({ columns: o.cols, values: o.rows })}<p class=exm>${rest > 0 ? `… e mais ${rest} ${rest == 1 ? 'linha' : 'linhas'} (${o.total} no total)` : `${o.total} ${o.total == 1 ? 'linha' : 'linhas'}`}</p></div>`;
};
// ============================================================ EXEMPLO AO VIVO (teoria de SQL e Python)
// O exemplo da lição é um editor de verdade: o aluno muda o código, toca em Rodar e vê o resultado na hora (SQL no navegador; Python no Pyodide). Nada aqui vale nota.
// "Experimente" sugere uma mudança (content/tente-sql.js e tente-py.js): "Ver a mudança" aplica, roda e explica o que mudou.
const labOn = l => !!l && !!l.example && (l.type == 'sql' || l.type == 'python') && !isTest(l);
const labOrig = l => l.type == 'sql' ? niceSql(l.example, 'sql') : String(l.example);
const labDf = l => l.type == 'python' && /\bdf\s*=/.test(l.prelude || '');
const labTbl = (cols, vals, total) => { const rest = total - vals.length; return table({ columns: cols, values: vals }) + `<p class=exm>${rest > 0 ? `… e mais ${rest} ${rest == 1 ? 'linha' : 'linhas'} (${total} no total)` : `${total} ${total == 1 ? 'linha' : 'linhas'}`}</p>`; };
const labFirst = l => {
  const o = l.exampleOut;
  if (l.type == 'sql') return o && o.cols && o.rows ? { t: o.label || 'Resultado do exemplo', h: labTbl(o.cols, o.rows, o.total) } : { t: 'Resultado', h: '<p class=labe>Toque em <b>Rodar</b> para ver o resultado.</p>' };
  return o && o.out != null ? { t: 'Saída do exemplo', h: `<pre class=inl>${esc(o.out) || '(sem saída)'}</pre>` } : { t: 'Saída', h: '<p class=labe>Toque em <b>Rodar</b> para ver a saída.</p>' };
};
function labHtml(l) {
  const sql = l.type == 'sql', t = l.tente, f = labFirst(l), txt = labOrig(l), parts = sql && typeof sqlParts == 'function' ? sqlParts(txt).slice(0, 7) : [];
  const names = labDf(l) ? ['df', ...(/\bmetas\s*=/.test(l.prelude) ? ['metas'] : [])].map(n => `<code>${n}</code>`).join(' e ') : '';
  return `<div class=lab id=lab><div class=labh><span>${ic('play', 15)}Exemplo ao vivo</span><small>Mude o código e rode</small></div>
  ${names ? `<p class=labn>${ic('db', 15)}<span>${names.includes(' e ') ? 'As tabelas' : 'A tabela'} ${names} já ${names.includes(' e ') ? 'estão carregadas' : 'está carregada'}. Toque em <b>Ver os dados</b> para olhar.</span></p>` : ''}
  ${edBox(l, txt)}
  <div class=labb><button class="btn pri" id=labRun onclick=labRun()>${ic('play', 16)}Rodar</button><button class="btn ghost" id=labReset onclick=labReset() disabled>${ic('back', 16)}Original</button>${sql || labDf(l) ? `<button class="btn ghost" onclick=labPeek()>${ic('eye', 16)}Ver os dados</button>` : ''}</div>
  ${t ? `<div class=labt><b>${ic('bulb', 16)}Experimente</b><p>${inlTxt(t.q)}</p><button class="btn ghost" id=labTry onclick=labTry()>Ver a mudança</button></div>` : ''}
  <div class=exr><div class=exh>${ic('out', 16)}<small id=labTit>${esc(f.t)}</small></div><p class=labhint id=labHint hidden>Você mudou o código. Toque em <b>Rodar</b> para atualizar o resultado.</p><div id=out class=out>${f.h}</div></div>
  <div class=labw id=labWhy hidden></div>
  ${parts.length > 1 ? `<div class="cbp labl"><small>Como ler o exemplo</small>${parts.map(p => `<div><b class=k>${esc(p.k)}</b><span>${esc(p.d)}</span></div>`).join('')}</div>` : ''}</div>`;
}
function labInit(l) {
  editor(l); const ed = $('#ed'); if (!ed) return;
  ed.onkeydown = e => {
    if (e.key == 'Tab') { e.preventDefault(); ed.setRangeText(l.type == 'sql' ? '  ' : '    ', ed.selectionStart, ed.selectionEnd, 'end'); labSync(); }
    if ((e.ctrlKey || e.metaKey) && e.key == 'Enter') { e.preventDefault(); labRun(); }
  };
  ed.addEventListener('input', labSync);
  if (l.type == 'python') ed.addEventListener('focus', labWarm, { once: true });
  S.lab = { orig: labOrig(l), ran: labOrig(l), first: labFirst(l), busy: false }; labSync();
}
// Python: ao tocar no editor já começa a carregar o Pyodide, para o 1º Rodar não demorar
function labWarm() {
  if (S.pyReady) return;
  pq = pq.catch(() => { }).then(async () => { if (!S.pyReady) { await pyCall({ t: 'init' }, 90000); S.pyReady = true; } }); pq.catch(() => { });
}
function labSync() {
  const ed = $('#ed'), L = S.lab; if (!ed || !L) return;
  const n = ed.value.split('\n').length; ed.style.height = Math.min(380, Math.max(96, n * 25 + 28)) + 'px';
  const r = $('#labReset'), h = $('#labHint'), w = $('#labWhy'), t = S.cur && S.cur.tente;
  if (r) r.disabled = ed.value === L.orig;
  if (h) h.hidden = ed.value === L.ran;
  if (w && !w.hidden && t && ed.value.trim() !== (S.cur.type == 'sql' ? niceSql(t.code, 'sql') : t.code).trim()) w.hidden = true;
  if (S.sync) S.sync();
}
async function labSql(l, code) {
  await loadSql(); const db = new S.SQL.Database();
  try {
    db.run(l.seed); const res = db.exec(code); let last = res[res.length - 1], note = '';
    const stmt = code.trim().replace(/;+\s*$/, '').split(';').pop();
    if (!last && /^\s*(select|with|values)\b/i.test(stmt)) return '<p class=labe>A consulta rodou, mas nenhuma linha atende ao que você pediu. Mude o filtro e rode de novo.</p>';
    if (!last && l.exampleAfter) { last = db.exec(l.exampleAfter).pop(); note = '<p class=labn2>O comando mudou a tabela. Veja como ela ficou:</p>'; }
    if (!last) return '<p class=labe>Comando executado. Ele não devolve uma tabela: rode um <b>SELECT</b> depois para ver o efeito.</p>';
    return note + labTbl(last.columns, last.values.slice(0, 12), last.values.length);
  } finally { db.close(); }
}
async function labRun() {
  const l = S.cur, L = S.lab, ed = $('#ed'), o = $('#out'), b = $('#labRun'); if (!labOn(l) || !L || !ed || !o || L.busy) return;
  const code = ed.value; L.busy = true; if (b) b.disabled = true; o.className = 'out';
  try {
    if (!code.trim()) o.innerHTML = '<p class=labe>Escreva alguma coisa para rodar.</p>';
    else if (l.type == 'sql') o.innerHTML = await labSql(l, code);
    else { o.textContent = 'Executando…'; o.innerHTML = (await runPy(l, code)).html; }
    L.ran = code; const t = $('#labTit'); if (t) t.textContent = code === L.orig ? L.first.t : 'Resultado do seu código';
  } catch (e) { if ($('#out')) { showErr(e); L.ran = code; const t = $('#labTit'); if (t) t.textContent = 'Erro no seu código'; } }
  finally { L.busy = false; const b2 = $('#labRun'); if (b2) b2.disabled = false; labSync(); }
}
function labTry() {
  const l = S.cur, t = l && l.tente, ed = $('#ed'), w = $('#labWhy'); if (!t || !ed || !w) return;
  ed.value = l.type == 'sql' ? niceSql(t.code, 'sql') : t.code; ed.scrollTop = 0;
  w.innerHTML = `<b>${ic('check', 16)}O que mudou</b><p>${inlTxt(t.why)}</p>`; w.hidden = false; labSync();
  labRun().then(() => { const e = $('.exr'); if (e) e.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); });
}
function labReset() {
  const L = S.lab, ed = $('#ed'), o = $('#out'); if (!L || !ed || !o) return;
  ed.value = L.orig; ed.scrollTop = 0; o.className = 'out'; o.innerHTML = L.first.h; L.ran = L.orig;
  const t = $('#labTit'), w = $('#labWhy'); if (t) t.textContent = L.first.t; if (w) w.hidden = true; labSync();
}
async function labPeek() {
  const l = S.cur, o = $('#out'); if (!labOn(l) || !o) return; o.className = 'out'; const t = $('#labTit');
  try {
    if (l.type == 'sql') {
      await loadSql(); const db = new S.SQL.Database();
      try { db.run(l.seed); o.innerHTML = db.exec("SELECT name FROM sqlite_master WHERE type='table'")[0].values.flat().map(n => `<div class=tname>${ic('db', 14)} ${esc(n)}</div>` + table(db.exec(`SELECT * FROM ${n}`)[0])).join(''); } finally { db.close(); }
    } else if (l.peek) { o.textContent = 'Executando…'; o.innerHTML = (await runPy(l, l.peek)).html; }
    else return;
    if (t) t.textContent = 'Os dados desta lição';
  } catch (e) { showErr(e); }
}
// ============================================================ PARTE 1 DA LIÇÃO: COMO FUNCIONA
// Antes da teoria: "Para que serve" (cartão) e "Como funciona" (animado, em 3 passos): 1) o exemplo é escrito na tela; 2) cada pedaço dele acende, um por vez, com uma explicação curta;
// 3) aparece o que ele devolve. As explicações vêm de content/como-*.js (l.como já traz o trecho [a, b) de cada pedaço no código). Tocar num passo ou num pedaço para o autoplay.
const HW_LB = { sql: ['Você pede', 'O banco procura', 'A tabela aparece'], python: ['Você escreve', 'O Python lê', 'A saída aparece'], excel: ['Você escreve', 'O Excel calcula', 'O resultado aparece'], dax: ['Você escreve', 'O Power BI calcula', 'O valor aparece'], quiz: ['Você olha', 'Você pensa', 'Você vê o porquê'] };
const HW_FN = { sql: 'consulta.sql', python: 'main.py', excel: 'formula', dax: 'medida.dax', quiz: 'exemplo' };
const hwCode = l => l.type == 'sql' ? niceSql(l.example, 'sql') : String(l.example);
const hwReduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const hwAlive = () => S.step == 'intro' && !!S.hw && !!S.cur && S.hw.id == S.cur.id && !!$('#hwPre');
const hwHas = l => !!(l.como && l.como.length);
const hwMarks = (code, tp, como, on) => {   // o código com os pedaços marcados (o resto fica apagado)
  let out = '', pos = 0;
  como.forEach((c, j) => { out += `<span class=hdm>${hl(code.slice(pos, c.a), tp)}</span><mark class="hm${j == on ? ' on' : ''}" onclick="hwFocus(${j},1)">${hl(code.slice(c.a, c.b), tp)}</mark>`; pos = c.b; });
  return out + `<span class=hdm>${hl(code.slice(pos), tp)}</span>`;
};
// o texto do passo 3 vem do próprio exemplo (info.retorno é do exercício da prática, não deste exemplo)
const hwRet = l => {
  const o = l.exampleOut, t = l.type;
  if (t == 'sql' && o && o.rows) { const n = o.total != null ? o.total : o.rows.length, c = (o.cols || []).length; return `Voltaram ${n} ${n == 1 ? 'linha' : 'linhas'} e ${c} ${c == 1 ? 'coluna' : 'colunas'}: é só o que você pediu, nada a mais.`; }
  if (t == 'python' && o && o.out != null) return 'Isto é o que o programa escreveu na tela. Cada print faz uma linha aparecer.';
  if (t == 'excel') return 'A célula mostra só o resultado da conta, não a fórmula. Se um número de que ela depende mudar, o resultado muda sozinho.';
  if (t == 'dax') return 'A medida vira um número no relatório e se recalcula sozinha conforme os filtros da página.';
  return 'Na prática você escolhe a resposta. Se errar, o app explica o porquê e você tenta de novo.';
};
const hwResHtml = l => {
  const o = l.exampleOut;
  if (l.type == 'sql' && o && o.cols && o.rows) return `<div class=exr><div class=exh>${ic('out', 16)}<small>${esc(o.label || 'O que aparece')}</small></div>${labTbl(o.cols, o.rows, o.total)}</div>`;
  if (l.type == 'python' && o && o.out != null) return `<div class=exr><div class=exh>${ic('out', 16)}<small>O que aparece na tela</small></div><pre class=inl>${esc(o.out) || '(sem saída)'}</pre></div>`;
  return '';
};
// ---- "Como funciona" visual: o mecanismo animado em tabelas e setas (JOIN, WHERE, ORDER BY, GROUP BY, if, for, PROCV). Cada animação tem 4 passos; o texto de cada passo vem em `cap`.
// Marcas no HTML: data-s="n" (aparece a partir do passo n) · data-a="n:classe" (ganha a classe a partir do passo n) · data-a="n=classe" (só no passo n).
const vzT = (title, cols, rows, at) => `<div class=vzb ${at || ''}><small>${title}</small><table class=vzt><thead><tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr></thead><tbody>${rows.map(([cs, a]) => `<tr ${a || ''}>${cs.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const VZ = {
  inner: { t: 'Duas tabelas se encaixando', cap: ['<b>Duas tabelas separadas.</b> A de vendas só anota o <i>número</i> do produto, não o nome.', 'O <code>ON</code> liga as duas: onde <b>produto_id</b> é igual ao <b>id</b>. Cada par ganha uma cor.', 'O <code>JOIN</code> mantém só as linhas que têm par nas duas tabelas. As sem par saem.', '<b>Resultado:</b> cada venda agora mostra o nome do produto.'],
    h: () => `<div class=vzr>${vzT('vendas', ['produto_id', 'qtd'], [[['1', '3'], 'data-a="2:k1 3:out"'], [['2', '5'], 'data-a="2:k2"'], [['4', '2'], 'data-a="2:nop 3:gone"']])}<span class=vzl data-s=2>⇄</span>${vzT('produtos', ['id', 'nome'], [[['1', 'Caneta'], 'data-a="2:k1"'], [['2', 'Caderno'], 'data-a="2:k2"'], [['3', 'Mochila'], 'data-a="2:nop 3:gone"']])}</div><div class=vzd data-s=2><i>🟦 produto 1</i><i>🟩 produto 2</i><i>⬜ sem par</i></div><div class=vzr1 data-s=4>${vzT('resultado', ['nome', 'qtd'], [[['Caneta', '3'], 'class=k1'], [['Caderno', '5'], 'class=k2']])}</div>` },
  left: { t: 'LEFT JOIN: ninguém fica de fora', cap: ['<b>Duas tabelas.</b> A de produtos é a da <b>esquerda</b>: ela é a que vamos manter inteira.', 'O <code>ON</code> liga as duas pelo número do produto. A Mochila não tem nenhuma venda.', 'O <code>LEFT JOIN</code> mantém <b>todos</b> os produtos, mesmo os que não têm par.', '<b>Resultado:</b> a Mochila aparece com a quantidade <b>vazia</b> (NULL).'],
    h: () => `<div class=vzr>${vzT('produtos (esquerda)', ['id', 'nome'], [[['1', 'Caneta'], 'data-a="2:k1"'], [['2', 'Caderno'], 'data-a="2:k2"'], [['3', 'Mochila'], 'data-a="2:nop 3=keep"']])}<span class=vzl data-s=2>⇄</span>${vzT('vendas', ['produto_id', 'qtd'], [[['1', '3'], 'data-a="2:k1"'], [['2', '5'], 'data-a="2:k2"']])}</div><div class=vzd data-s=2><i>🟦 produto 1</i><i>🟩 produto 2</i><i>⬜ sem par</i></div><div class=vzr1 data-s=4>${vzT('resultado', ['nome', 'qtd'], [[['Caneta', '3'], 'class=k1'], [['Caderno', '5'], 'class=k2'], [['Mochila', '<em>vazio</em>'], 'class=nop']])}</div>` },
  where: { t: 'O WHERE é uma peneira', cap: ['<b>A tabela inteira</b>, com todas as linhas.', 'O <code>WHERE preco &gt; 50</code> testa a regra em <b>cada linha</b>: passa (✓) ou não passa (✗).', 'As linhas que não passam na regra saem do resultado.', '<b>Resultado:</b> só ficaram as linhas que passaram.'],
    h: () => `<div class=vzr1>${vzT('produtos', ['nome', 'preco', 'regra'], [[['Caneta', '3', '<b data-s=2>✗</b>'], 'data-a="3:gone"'], [['Caderno', '12', '<b data-s=2>✗</b>'], 'data-a="3:gone"'], [['Mochila', '90', '<b data-s=2>✓</b>'], 'data-a="2:k2"'], [['Fone', '120', '<b data-s=2>✓</b>'], 'data-a="2:k2"']])}</div>` },
  order: { t: 'ORDER BY coloca em fila', cap: ['<b>Antes:</b> as linhas estão fora de ordem.', 'O <code>ORDER BY preco</code> compara os preços e dá uma posição a cada linha: do menor para o maior.', 'As linhas vão para a posição que ganharam.', '<b>Depois:</b> do mais barato para o mais caro. Com <code>DESC</code> seria o contrário.'],
    h: () => `<div class=vzr>${vzT('antes', ['nome', 'preco', 'pos'], [[['Mochila', '90', '<b data-s=2>3º</b>']], [['Caneta', '3', '<b data-s=2>1º</b>']], [['Fone', '120', '<b data-s=2>4º</b>']], [['Caderno', '12', '<b data-s=2>2º</b>']]])}<span class=vzl data-s=3>➜</span><div data-s=3 class=vzb2>${vzT('depois', ['nome', 'preco'], [[['Caneta', '3'], 'class=k1'], [['Caderno', '12'], 'class=k2'], [['Mochila', '90'], 'class=k3'], [['Fone', '120'], 'class=k4']])}</div></div>` },
  group: { t: 'GROUP BY junta em grupos', cap: ['<b>A tabela:</b> cada linha é um produto com a sua categoria.', 'O <code>GROUP BY categoria</code> separa as linhas por categoria. Cada categoria ganha uma cor.', 'As linhas da mesma cor vão para o <b>mesmo grupo</b>.', '<b>Resultado:</b> uma linha por grupo, e o <code>COUNT(*)</code> conta quantas linhas há em cada um.'],
    h: () => `<div class=vzr>${vzT('produtos', ['nome', 'categoria'], [[['Caneta', 'Papelaria'], 'data-a="2:k1"'], [['Mesa', 'Moveis'], 'data-a="2:k2"'], [['Lapis', 'Papelaria'], 'data-a="2:k1"'], [['Cadeira', 'Moveis'], 'data-a="2:k2"'], [['Caderno', 'Papelaria'], 'data-a="2:k1"']])}<div class=vzg data-s=3><div class=k1><b>Papelaria</b><span>Caneta</span><span>Lapis</span><span>Caderno</span></div><div class=k2><b>Moveis</b><span>Mesa</span><span>Cadeira</span></div></div></div><div class=vzr1 data-s=4>${vzT('resultado', ['categoria', 'COUNT(*)'], [[['Papelaria', '3'], 'class=k1'], [['Moveis', '2'], 'class=k2']])}</div>` },
  if: { t: 'O if decide o caminho', cap: ['<b>O Python guarda</b> o valor: <code>nota = 8</code>.', 'Chega no <code>if</code> e faz a pergunta: <code>nota &gt;= 7</code>?', '8 é maior ou igual a 7: a resposta é <b>verdadeira</b>, então segue pelo caminho do <b>sim</b>.', 'O que está dentro do <code>if</code> roda e aparece na tela. O caminho do <b>não</b> é pulado.'],
    h: () => `<div class=vzf><div class="vzx" data-a="1=e">nota = 8</div><div class=vzar>↓</div><div class="vzx q" data-a="2=e 3=e">nota &gt;= 7 ?</div><div class=vzy><div class=vzbr data-a="3:yes"><b>sim</b><div class=vzx data-a="4=e">print("Aprovado")</div></div><div class=vzbr data-a="3:no"><b>não</b><div class=vzx>(pula)</div></div></div><div class=vzo data-s=4>Aprovado</div></div>` },
  for: { t: 'O for repete para cada item', cap: ['<b>Uma lista</b> com 3 itens e um bloco para repetir.', 'O <code>for</code> pega o <b>1º item</b> e roda o bloco com ele.', 'Volta e pega o <b>2º item</b>. Roda o bloco de novo.', 'Pega o <b>3º item</b>. Os itens acabaram: o <code>for</code> termina. Foram 3 voltas.'],
    h: () => `<div class=vzf><code class=vzcd>for fruta in ["maca", "banana", "uva"]:<br>&nbsp;&nbsp;print(fruta)</code><div class=vzch><i data-a="2=e 3:ok 4:ok">maca</i><i data-a="3=e 4:ok">banana</i><i data-a="4=e">uva</i></div><div class=vzo2><b>Tela:</b><span data-s=2>maca</span><span data-s=3>banana</span><span data-s=4>uva</span></div></div>` },
  procv: { t: 'PROCV procura numa tabela', cap: ['<b>A tabela:</b> a 1ª coluna tem os códigos dos produtos.', 'Na célula você escreveu <code>=PROCV(102; tabela; 2; FALSO)</code>. Ele desce pela 1ª coluna procurando o <b>102</b>.', 'Achou o 102! Agora anda até a <b>coluna 2</b>, que foi o número que você pediu.', '<b>Resposta:</b> a célula mostra <b>Caderno</b>.'],
    h: () => `<div class=vzr1>${vzT('tabela', ['código', 'produto', 'preço'], [[['101', 'Caneta', '3']], [['102', '<span data-a="3:cel">Caderno</span>', '12'], 'data-a="2:k2"'], [['103', 'Mochila', '90']]])}<div class=vzo3 data-s=4>=PROCV(102; …; 2; FALSO) → <b>Caderno</b></div></div>` }
};
Object.assign(VZ, {
  agg: { t: 'Muitas linhas viram um valor só', cap: ['<b>A tabela</b> tem 4 linhas.', 'Uma função como <code>SUM(preco)</code> olha <b>todas</b> as linhas da coluna.', 'Ela junta tudo, as linhas somem e sobra <b>um valor só</b>.', '<b>Resultado:</b> <code>COUNT</code> conta (4), <code>SUM</code> soma (225), <code>AVG</code> tira a média (56,25), <code>MIN</code> e <code>MAX</code> dão o menor (3) e o maior (120).'],
    h: () => `<div class=vzr1>${vzT('produtos', ['nome', 'preco'], [[['Caneta', '3'], 'data-a="2:k1 3:gone"'], [['Caderno', '12'], 'data-a="2:k1 3:gone"'], [['Mochila', '90'], 'data-a="2:k1 3:gone"'], [['Fone', '120'], 'data-a="2:k1 3:gone"']])}</div><div class=vzt4 data-s=4><i><small>COUNT(*)</small><b>4</b></i><i><small>SUM</small><b>225</b></i><i><small>AVG</small><b>56,25</b></i><i><small>MIN</small><b>3</b></i><i><small>MAX</small><b>120</b></i></div>` },
  distinct: { t: 'DISTINCT tira as repetidas', cap: ['<b>A coluna</b> categoria tem valores repetidos.', 'O <code>DISTINCT</code> guarda a <b>primeira vez</b> que cada valor aparece. As repetições ficam de fora.', 'As repetidas saem.', '<b>Resultado:</b> cada categoria aparece uma vez só.'],
    h: () => `<div class=vzr>${vzT('produtos', ['categoria'], [[['Papelaria'], 'data-a="2:k1"'], [['Moveis'], 'data-a="2:k2"'], [['Papelaria'], 'data-a="2:nop 3:gone"'], [['Moveis'], 'data-a="2:nop 3:gone"'], [['Papelaria'], 'data-a="2:nop 3:gone"']])}<div class=vzb2 data-s=4>${vzT('resultado', ['categoria'], [[['Papelaria'], 'class=k1'], [['Moveis'], 'class=k2']])}</div></div>` },
  limit: { t: 'LIMIT corta depois de N linhas', cap: ['<b>A tabela</b> tem 5 linhas (aqui já em ordem, do mais caro ao mais barato).', 'O <code>LIMIT 3</code> conta as linhas de cima para baixo: 1, 2, 3.', 'Depois da 3ª linha, o resto fica de fora.', '<b>Resultado:</b> só 3 linhas. Com <code>ORDER BY preco DESC</code> antes, são as 3 mais caras.'],
    h: () => `<div class=vzr1>${vzT('produtos', ['nome', 'preco', 'conta'], [[['Fone', '120', '<b data-s=2>1</b>'], 'data-a="2:k1"'], [['Mochila', '90', '<b data-s=2>2</b>'], 'data-a="2:k1"'], [['Caderno', '12', '<b data-s=2>3</b>'], 'data-a="2:k1"'], [['Caneta', '3', ''], 'data-a="3:gone"'], [['Lapis', '2', ''], 'data-a="3:gone"']])}</div>` },
  having: { t: 'HAVING filtra os grupos', cap: ['O <code>GROUP BY</code> já separou em grupos e o <code>COUNT(*)</code> contou cada um.', 'O <code>HAVING COUNT(*) &gt; 2</code> testa cada <b>grupo</b> (e não cada linha).', 'Os grupos que não passam saem.', '<b>Resultado:</b> só as categorias com mais de 2 produtos. O <code>WHERE</code> filtra linhas <i>antes</i> de agrupar; o <code>HAVING</code> filtra grupos <i>depois</i>.'],
    h: () => `<div class=vzr1>${vzT('depois do GROUP BY', ['categoria', 'COUNT(*)', '&gt; 2 ?'], [[['Papelaria', '3', '<b data-s=2>✓</b>'], 'data-a="2:k2"'], [['Moveis', '2', '<b data-s=2>✗</b>'], 'data-a="3:gone"'], [['Eletronicos', '4', '<b data-s=2>✓</b>'], 'data-a="2:k2"'], [['Roupas', '1', '<b data-s=2>✗</b>'], 'data-a="3:gone"']])}</div>` },
  case: { t: 'CASE WHEN cria uma etiqueta', cap: ['<b>A tabela</b> ainda não tem a coluna faixa.', 'O <code>CASE WHEN preco &gt; 100</code> faz a pergunta em <b>cada linha</b>.', 'Cada linha ganha a etiqueta do caminho certo: <code>THEN</code> (sim) ou <code>ELSE</code> (não).', '<b>Resultado:</b> uma coluna nova, <b>faixa</b>, criada na hora. A tabela original não muda.'],
    h: () => `<div class=vzr1>${vzT('produtos', ['nome', 'preco', 'preco &gt; 100 ?', 'faixa'], [[['Caneta', '3', '<b data-s=2>não</b>', '<b data-s=3>barato</b>'], 'data-a="3:k1"'], [['Mochila', '90', '<b data-s=2>não</b>', '<b data-s=3>barato</b>'], 'data-a="3:k1"'], [['Fone', '120', '<b data-s=2>sim</b>', '<b data-s=3>caro</b>'], 'data-a="3:k3"']])}</div>` },
  subq: { t: 'A consulta de dentro roda primeiro', cap: ['A consulta de <b>dentro</b> (entre parênteses) roda primeiro: <code>SELECT AVG(preco)</code>.', 'Ela devolve um valor: <b>56,25</b>. Agora a consulta de fora vira <code>WHERE preco &gt; 56,25</code>.', 'A consulta de fora testa cada linha com esse valor.', '<b>Resultado:</b> só os produtos acima do preço médio.'],
    h: () => `<div class=vzf><div class=vzx data-a="1=e 2=e">(SELECT AVG(preco)) → <b data-s=2>56,25</b></div><div class=vzar>↓</div>${vzT('produtos', ['nome', 'preco', 'preco &gt; 56,25 ?'], [[['Caneta', '3', '<b data-s=3>✗</b>'], 'data-a="4:gone"'], [['Caderno', '12', '<b data-s=3>✗</b>'], 'data-a="4:gone"'], [['Mochila', '90', '<b data-s=3>✓</b>'], 'data-a="3:k2"'], [['Fone', '120', '<b data-s=3>✓</b>'], 'data-a="3:k2"']], 'style="width:100%"')}</div>` },
  cte: { t: 'WITH cria uma tabelinha temporária', cap: ['Você quer dar nome a um pedaço: <code>WITH altos AS (SELECT … WHERE salario &gt; 8000)</code>.', 'Esse pedaço roda primeiro e vira uma <b>tabelinha temporária</b> chamada <b>altos</b>.', 'A consulta principal usa o nome <code>altos</code> como se fosse uma tabela de verdade.', '<b>Resultado:</b> o que a consulta principal pediu da tabelinha. Ela some quando a consulta termina.'],
    h: () => `<div class=vzr>${vzT('funcionarios', ['nome', 'salario'], [[['Ana', '9000'], 'data-a="2:k1"'], [['Leo', '7000'], 'data-a="2:nop"'], [['Bia', '8500'], 'data-a="2:k1"'], [['Caio', '5000'], 'data-a="2:nop"']])}<span class=vzl data-s=2>➜</span><div class=vzb2 data-s=2 data-a="3=e">${vzT('altos (temporária)', ['nome', 'salario'], [[['Ana', '9000'], 'class=k1'], [['Bia', '8500'], 'class=k1']])}</div></div><div class=vzr1 data-s=4>${vzT('SELECT nome FROM altos', ['nome'], [[['Ana'], 'class=k2'], [['Bia'], 'class=k2']])}</div>` },
  rank: { t: 'Numerando em ordem e nos empates', cap: ['<b>A tabela</b>, do maior salário ao menor. Leo e Ana empatam com 7000.', 'O <code>OVER (ORDER BY salario DESC)</code> diz a ordem em que as linhas serão numeradas.', '<code>ROW_NUMBER</code> numera <b>1, 2, 3, 4</b>: nunca repete, mesmo no empate.', 'No empate, o <code>RANK</code> dá <b>2, 2</b> e pula o 3 (vai para 4). O <code>DENSE_RANK</code> dá 2, 2 e segue com 3.'],
    h: () => `<div class=vzr1>${vzT('funcionarios', ['nome', 'salario', 'ROW_NUMBER', 'RANK', 'DENSE_RANK'], [[['Bia', '9000', '<b data-s=3>1</b>', '<b data-s=4>1</b>', '<b data-s=4>1</b>']], [['Leo', '7000', '<b data-s=3>2</b>', '<b data-s=4>2</b>', '<b data-s=4>2</b>'], 'data-a="4:k3"'], [['Ana', '7000', '<b data-s=3>3</b>', '<b data-s=4>2</b>', '<b data-s=4>2</b>'], 'data-a="4:k3"'], [['Caio', '5000', '<b data-s=3>4</b>', '<b data-s=4>4</b>', '<b data-s=4>3</b>']]])}</div>` },
  partition: { t: 'PARTITION BY: um grupo de cada vez', cap: ['<b>A tabela</b>: cada pessoa tem um departamento.', 'O <code>PARTITION BY depto</code> separa em grupos (uma cor por depto), mas <b>sem juntar</b> as linhas.', 'Dentro de cada grupo, o <code>ORDER BY salario DESC</code> põe do maior para o menor.', '<b>Resultado:</b> a numeração <b>recomeça</b> em cada grupo: 1, 2 no depto A e 1, 2 no depto B.'],
    h: () => `<div class=vzr1>${vzT('funcionarios', ['depto', 'nome', 'salario', 'n'], [[['A', 'Ana', '8000', '<b data-s=4>1</b>'], 'data-a="2:k1"'], [['A', 'Bia', '6000', '<b data-s=4>2</b>'], 'data-a="2:k1"'], [['B', 'Leo', '7000', '<b data-s=4>1</b>'], 'data-a="2:k2"'], [['B', 'Caio', '5000', '<b data-s=4>2</b>'], 'data-a="2:k2"']])}</div>` },
  running: { t: 'Soma acumulada, linha a linha', cap: ['<b>A tabela</b> de vendas por mês.', 'Em <b>jan</b>, a soma até aqui é só 100.', 'Em <b>fev</b>, soma tudo até aqui: 100 + 150 = <b>250</b>.', 'Em <b>mar</b>: 250 + 120 = <b>370</b>. O <code>SUM(valor) OVER (ORDER BY mes)</code> acumula linha a linha.'],
    h: () => `<div class=vzr1>${vzT('vendas', ['mes', 'valor', 'acumulado'], [[['jan', '100', '<b data-s=2>100</b>'], 'data-a="2=k1"'], [['fev', '150', '<b data-s=3>250</b>'], 'data-a="3=k1"'], [['mar', '120', '<b data-s=4>370</b>'], 'data-a="4=k1"']])}</div>` },
  lag: { t: 'LAG olha a linha de cima', cap: ['<b>A tabela</b> de vendas por mês.', 'O <code>LAG(valor)</code> olha a <b>linha de cima</b>. Em jan não há linha de cima: vem vazio.', 'Em fev, a linha de cima é jan: 100. Em mar, a de cima é fev: 150.', 'Com isso dá para calcular a <b>variação</b>: <code>valor - LAG(valor)</code> dá +50 e −30.'],
    h: () => `<div class=vzr1>${vzT('vendas', ['mes', 'valor', 'anterior', 'variação'], [[['jan', '100', '<b data-s=2><em>vazio</em></b>', '<b data-s=4><em>vazio</em></b>'], 'data-a="2=k1"'], [['fev', '150', '<b data-s=3>100</b>', '<b data-s=4>+50</b>'], 'data-a="3=k1"'], [['mar', '120', '<b data-s=3>150</b>', '<b data-s=4>−30</b>'], 'data-a="3=k1"']])}</div>` },
  while: { t: 'O while repete enquanto for verdade', cap: ['<b>x</b> começa valendo 0.', 'O <code>while</code> pergunta: <code>x &lt; 2</code>? Sim, então roda o bloco e faz <code>x += 1</code>: agora x vale 1.', 'Volta ao começo e pergunta de novo: 1 &lt; 2? Sim: roda o bloco e x vale 2.', 'Pergunta outra vez: 2 &lt; 2? <b>Não</b>. O while termina. Se nada mudasse o x, ele nunca terminaria.'],
    h: () => `<div class=vzf><div class=vzx data-a="1=e">x = 0</div><div class=vzx data-s=2 data-a="2=e">x &lt; 2 ? sim → x vira <b>1</b></div><div class=vzx data-s=3 data-a="3=e">x &lt; 2 ? sim → x vira <b>2</b></div><div class=vzx data-s=4 data-a="4=e">x &lt; 2 ? não → o while <b>termina</b></div></div>` },
  func: { t: 'A função é uma máquina', cap: ['<b>A função é uma máquina</b> que você montou com <code>def</code>: ela recebe um valor (x) e faz uma conta.', 'Você <b>chama</b> <code>triplo(2)</code>: o valor 2 entra na máquina e vira x.', 'Dentro da máquina, o Python faz <code>x * 3</code>.', 'O <code>return</code> devolve o <b>6</b> para quem chamou. Dá para usar de novo com outro valor.'],
    h: () => `<div class=vzf><div class=vzm><div class=vzx data-a="2=e">2</div><span class=vzar2>➜</span><div class=vzx data-a="3=e"><small>triplo(x)</small><br>x * 3</div><span class=vzar2>➜</span><div class=vzx data-s=4 data-a="4=e">6</div></div><code class=vzcd>def triplo(x):<br>&nbsp;&nbsp;return x * 3</code></div>` },
  dict: { t: 'O dicionário busca pela chave', cap: ['<b>O dicionário</b> guarda pares: cada <b>chave</b> aponta para um <b>valor</b>.', 'Ao escrever <code>aluno["nome"]</code>, o Python procura a <b>chave</b> "nome".', 'Achou! Ele pega o valor que está ao lado da chave: "Ana".', '<b>Resultado:</b> o <code>print</code> mostra Ana. Você busca pela chave, não pela posição.'],
    h: () => `<div class=vzr1>${vzT('aluno', ['chave', 'valor'], [[['"nome"', '<span data-a="3:cel">"Ana"</span>'], 'data-a="2:k1"'], [['"idade"', '10']], [['"cidade"', '"Rio"']]])}<div class=vzo3 data-s=4>print(aluno["nome"]) → <b>Ana</b></div></div>` },
  list: { t: 'A lista guarda itens em posições', cap: ['<b>Uma lista</b> guarda vários itens em fila: <code>frutas = ["maca", "banana", "uva"]</code>.', 'Cada item tem uma <b>posição</b>, e a contagem começa do <b>0</b>.', '<code>frutas[0]</code> pega a posição 0: <b>maca</b>.', 'Posição negativa conta de trás para frente: <code>frutas[-1]</code> é o último item, <b>uva</b>.'],
    h: () => `<div class=vzf><div class=vzch><i data-a="3=e"><span>"maca"</span><small data-s=2>0</small><small class=ng data-s=4>-3</small></i><i><span>"banana"</span><small data-s=2>1</small><small class=ng data-s=4>-2</small></i><i data-a="4=e"><span>"uva"</span><small data-s=2>2</small><small class=ng data-s=4>-1</small></i></div><div class=vzo2><b>Tela:</b><span data-s=3>maca</span><span data-s=4>uva</span></div></div>` },
  comp: { t: 'A lista nova feita em uma linha', cap: ['<b>A lista de partida:</b> <code>[1, 2, 3]</code>.', 'O <code>for x in …</code> pega cada item, um de cada vez, e chama de <b>x</b>.', 'Para cada x, faz a conta <code>x * 2</code> e coloca o resultado numa lista nova.', '<b>Resultado:</b> <code>[2, 4, 6]</code>. A lista original não muda.'],
    h: () => `<div class=vzf><code class=vzcd>[x * 2 for x in [1, 2, 3]]</code><div class=vzch><i data-a="2=e">1</i><i data-a="2=e">2</i><i data-a="2=e">3</i></div><div class=vzar data-s=3>↓ x * 2</div><div class=vzch data-s=3 data-a="4=e"><i>2</i><i>4</i><i>6</i></div></div>` },
  compif: { t: 'A lista nova só com quem passa', cap: ['<b>A lista de partida:</b> <code>[1, 2, 3, 4]</code>.', 'O <code>for x in …</code> pega cada item. Depois vem o <code>if x &gt; 2</code>: ele é um filtro.', 'Só os itens que passam no teste (3 e 4, em verde) seguem. Os outros ficam de fora.', '<b>Resultado:</b> <code>[3, 4]</code>.'],
    h: () => `<div class=vzf><code class=vzcd>[x for x in [1, 2, 3, 4] if x &gt; 2]</code><div class=vzch><i data-a="3:ok">1</i><i data-a="3:ok">2</i><i data-a="3:pass">3</i><i data-a="3:pass">4</i></div><div class=vzar data-s=4>↓</div><div class=vzch data-s=4><i class=pass>3</i><i class=pass>4</i></div></div>` },
  try: { t: 'try e except seguram o erro', cap: ['O Python entra no <code>try</code> e <b>tenta</b> rodar <code>int("a")</code>.', 'O texto "a" não vira número: dá <b>erro</b> (ValueError). Sem o try, o programa pararia aqui.', 'O erro é pego pelo <code>except ValueError</code>: o Python vai direto para o plano B.', 'O plano B roda (<code>print("erro")</code>) e o programa <b>continua</b> normalmente.'],
    h: () => `<div class=vzf><div class=vzx data-a="1=e">try: int("a")</div><div class=vzar data-s=2>↓</div><div class="vzx err" data-s=2 data-a="2=e">⚠ ValueError: "a" não é um número</div><div class=vzar data-s=3>↓</div><div class=vzx data-s=3 data-a="3=e">except ValueError: print("erro")</div><div class=vzo data-s=4>erro</div></div>` },
  class: { t: 'A classe é o molde dos objetos', cap: ['A <b>classe</b> é um <b>molde</b>: ela diz o que todo gato terá, como nome e idade.', 'Cada vez que você escreve <code>Gato("Mimi", 2)</code>, o Python faz um <b>objeto</b> novo a partir do molde.', 'Cada objeto guarda os <b>seus próprios dados</b>: a Mimi tem 2 anos e o Tom tem 5.', 'Se o molde tem um <b>método</b> (como <code>falar</code>), todos os objetos podem usar: <code>mimi.falar()</code>.'],
    h: () => `<div class=vzf><div class=vzx data-a="1=e">class Gato<br><small>molde: tem nome e idade</small></div><div class=vzar data-s=2>↓ Gato("Mimi", 2) &nbsp; ↓ Gato("Tom", 5)</div><div class=vzr data-s=2><div class=vzx data-a="3=e">Mimi<br><small>idade 2</small></div><div class=vzx data-a="3=e">Tom<br><small>idade 5</small></div></div><div class=vzo data-s=4>mimi.falar() → miau</div></div>` },
  se: { t: 'O SE escolhe entre duas respostas', cap: ['<b>A planilha</b> tem uma nota em cada linha. Na coluna C você escreve a fórmula abaixo.', 'O <code>SE</code> começa pela <b>pergunta</b>: a nota (B2) é maior ou igual a 7?', 'Ana tem 8: <b>verdade</b> (✓), vale a 1ª resposta. Bruno tem 5: <b>falso</b> (✗), vale a 2ª.', '<b>Resultado:</b> a célula mostra a resposta escolhida. Copiando para baixo, cada linha decide sozinha.'],
    h: () => `<div class=vzf><code class=vzcd data-a="2=e">=SE(B2&gt;=7;"Aprovado";"Reprovado")</code>${vzT('planilha', ['A: nome', 'B: nota', 'C: resultado'], [[['Ana', '8 <b data-s=3>✓</b>', '<b data-s=4>Aprovado</b>'], 'data-a="3:k2"'], [['Bruno', '5 <b data-s=3>✗</b>', '<b data-s=4>Reprovado</b>'], 'data-a="3:nop"']], 'style="width:100%"')}</div>` },
  somase: { t: 'SOMASE soma só o que combina', cap: ['<b>A tabela</b> de vendas por região. Fórmula: <code>=SOMASE(A2:A5; "Sul"; B2:B5)</code>.', 'O <code>SOMASE</code> olha a coluna A e procura as células iguais a <b>"Sul"</b>.', 'Só as linhas que combinam entram na soma. As outras ficam de fora.', '<b>Resultado:</b> 100 + 150 = <b>250</b>, só das vendas do Sul.'],
    h: () => `<div class=vzr1>${vzT('vendas', ['A: região', 'B: venda'], [[['Sul', '100'], 'data-a="2:k1"'], [['Norte', '200'], 'data-a="3:nop"'], [['Sul', '150'], 'data-a="2:k1"'], [['Norte', '50'], 'data-a="3:nop"']])}<div class=vzo3 data-s=4>100 + 150 = <b>250</b></div></div>` },
  dollar: { t: 'O $ trava a célula ao copiar', cap: ['A taxa está na célula <b>F1</b>. Você escreve na linha 2: <code>=B2*F1</code>.', '<b>Sem $</b>, ao copiar para baixo o Excel anda uma linha em tudo: <code>F1</code> vira <code>F2</code>, <code>F3</code>… e a taxa se perde (essas células estão vazias).', 'Com <b>$</b>, a fórmula fica <code>=B2*$F$1</code>. O $ <b>trava</b> a célula.', 'Copiando para baixo, o <code>B</code> anda (B3, B4), mas o <code>$F$1</code> <b>fica parado</b>. Todas as linhas usam a mesma taxa.'],
    h: () => `<div class=vzr><div class=vzb2>${vzT('sem $', ['linha', 'fórmula'], [[['2', '=B2*F1'], 'data-a="2:k1"'], [['3', '=B3*<b>F2</b>'], 'data-s=2 data-a="2:bad"'], [['4', '=B4*<b>F3</b>'], 'data-s=2 data-a="2:bad"']])}</div><div class=vzb2>${vzT('com $', ['linha', 'fórmula'], [[['2', '=B2*$F$1'], 'data-s=3 class=k2'], [['3', '=B3*<b>$F$1</b>'], 'data-s=4 class=k2'], [['4', '=B4*<b>$F$1</b>'], 'data-s=4 class=k2']])}</div></div>` },
  calculate: { t: 'CALCULATE muda o filtro da conta', cap: ['<b>A tabela</b> de vendas. Sem filtro, <code>SUM(Vendas[Valor])</code> soma tudo: <b>250</b>.', 'O <code>CALCULATE</code> troca o filtro: <code>Vendas[Canal] = "Online"</code>. Só as linhas Online continuam valendo.', 'A soma agora só enxerga as linhas que passaram no filtro. As outras ficam apagadas.', '<b>Resultado:</b> 100 + 50 = <b>150</b>: as vendas só do canal Online.'],
    h: () => `<div class=vzr1>${vzT('Vendas', ['canal', 'valor'], [[['Online', '100'], 'data-a="2:k1"'], [['Loja', '80'], 'data-a="2:nop"'], [['Online', '50'], 'data-a="2:k1"'], [['Loja', '20'], 'data-a="2:nop"']])}<div class=vzo3 data-a="2:gone">SUM(Vendas[Valor]) = <b>250</b></div><div class=vzo3 data-s=4>CALCULATE(SUM(…); canal = "Online") = <b>150</b></div></div>` }
});
Object.assign(VZ, {
  contse: { t: 'CONT.SE conta só o que passa', cap: ['<b>A tabela</b> tem os valores das vendas. A fórmula: <code>=CONT.SE(C2:C5; "&gt;1000")</code>.', 'O <code>CONT.SE</code> testa cada célula do intervalo com a condição <code>&gt;1000</code>: passa (✓) ou não passa (✗).', 'Só as células que passam entram na contagem.', '<b>Resultado:</b> <b>2</b>. O <code>CONT.SE</code> conta quantas células passaram; o <code>MÉDIASE</code> tiraria a média delas.'],
    h: () => `<div class=vzr1>${vzT('vendas', ['A: vendedor', 'C: valor', '&gt;1000 ?'], [[['Ana', '1500', '<b data-s=2>✓</b>'], 'data-a="2:k2"'], [['Bruno', '800', '<b data-s=2>✗</b>'], 'data-a="3:nop"'], [['Carla', '2000', '<b data-s=2>✓</b>'], 'data-a="2:k2"'], [['Davi', '300', '<b data-s=2>✗</b>'], 'data-a="3:nop"']])}<div class=vzo3 data-s=4>=CONT.SE(C2:C5; "&gt;1000") → <b>2</b></div></div>` },
  senest: { t: 'SE dentro de SE: um teste de cada vez', cap: ['<b>Fórmula:</b> <code>=SE(B2&gt;=9; "A"; SE(B2&gt;=7; "B"; "C"))</code>. Um SE dentro de outro.', 'O 1º <code>SE</code> pergunta: a nota é 9 ou mais? Quem passa já fecha com <b>A</b> e não olha mais nada.', 'Quem não passou cai no <b>2º SE</b> (o de dentro): 7 ou mais? Sim → <b>B</b>. Não → <b>C</b>.', '<b>Resultado:</b> cada linha segue o seu caminho. O Excel testa em ordem e para no primeiro verdadeiro.'],
    h: () => `<div class=vzr1>${vzT('planilha', ['nome', 'nota', '≥ 9 ?', '≥ 7 ?', 'letra'], [[['Ana', '9,5', '<b data-s=2>✓</b>', '<b data-s=3>—</b>', '<b data-s=4>A</b>'], 'data-a="4:k1"'], [['Bruno', '8', '<b data-s=2>✗</b>', '<b data-s=3>✓</b>', '<b data-s=4>B</b>'], 'data-a="4:k2"'], [['Caio', '5', '<b data-s=2>✗</b>', '<b data-s=3>✗</b>', '<b data-s=4>C</b>'], 'data-a="4:k3"']])}</div>` },
  indice: { t: 'CORRESP acha a posição, ÍNDICE traz o item', cap: ['<b>A tabela</b>: o produto está na coluna A e o código na coluna B. Você tem o código <b>102</b> e quer o produto.', 'O <code>CORRESP(102; B2:B4; 0)</code> procura o 102 na coluna B e devolve a <b>posição</b>: 2.', 'O <code>ÍNDICE(A2:A4; 2)</code> vai à coluna A e traz o <b>2º item</b>.', '<b>Resultado:</b> Caderno. Juntos, os dois buscam até uma coluna que fica à esquerda, o que o PROCV não faz.'],
    h: () => `<div class=vzr1>${vzT('tabela', ['A: produto', 'B: código', 'posição'], [[['Caneta', '101', '<b data-s=2>1</b>']], [['<span data-a="3:cel">Caderno</span>', '<span data-a="2:cel">102</span>', '<b data-s=2>2</b>'], 'data-a="2:k2"'], [['Mochila', '103', '<b data-s=2>3</b>']]])}<div class=vzo3 data-s=4>=ÍNDICE(A2:A4; CORRESP(102; B2:B4; 0)) → <b>Caderno</b></div></div>` },
  eou: { t: 'E exige as duas perguntas', cap: ['<b>Fórmula:</b> <code>=SE(E(B2&gt;=7; C2&lt;=5); "Sim"; "Nao")</code>. O <code>E</code> junta duas perguntas.', 'Primeira pergunta: a nota é 7 ou mais?', 'Segunda pergunta: as faltas são 5 ou menos?', 'O <code>E</code> só dá verdade se <b>as duas</b> forem ✓. Se uma falhar, vale a 2ª resposta. Com <code>OU</code>, uma só já bastaria.'],
    h: () => `<div class=vzr1>${vzT('planilha', ['nome', 'nota', 'faltas', '≥ 7', '≤ 5', 'E'], [[['Ana', '8', '2', '<b data-s=2>✓</b>', '<b data-s=3>✓</b>', '<b data-s=4>Sim</b>'], 'data-a="4:k2"'], [['Bruno', '9', '8', '<b data-s=2>✓</b>', '<b data-s=3>✗</b>', '<b data-s=4>Nao</b>'], 'data-a="4:nop"'], [['Caio', '5', '1', '<b data-s=2>✗</b>', '<b data-s=3>✓</b>', '<b data-s=4>Nao</b>'], 'data-a="4:nop"']])}</div>` },
  seerro: { t: 'SEERRO esconde o erro feio', cap: ['<b>A tabela</b> só tem os códigos 101 e 102. Você procura o <b>999</b>.', 'O <code>PROCV</code> não acha o 999 e devolve o erro <b>#N/D</b>, que aparece feio na planilha.', 'O <code>SEERRO</code> vigia a conta: se ela der erro, ele usa a <b>2ª resposta</b> que você escolheu.', '<b>Resultado:</b> a célula mostra <b>Nao encontrado</b> em vez do erro.'],
    h: () => `<div class=vzr1>${vzT('tabela', ['código', 'produto'], [[['101', 'Caneta']], [['102', 'Caderno']]])}<div class="vzo3 err" data-s=2 data-a="3:gone">=PROCV(999; …) → <b>#N/D</b></div><div class=vzo3 data-s=4>=SEERRO(PROCV(999; …); "Nao encontrado") → <b>Nao encontrado</b></div></div>` },
  rangexl: { t: 'Um intervalo vira um valor só', cap: ['<b>As células</b> B2 até B5 têm números.', 'Na fórmula, <code>B2:B5</code> quer dizer "de B2 <b>até</b> B5". A função olha todas as células desse intervalo.', 'Ela junta tudo e devolve <b>um valor só</b>.', '<b>Resultado:</b> <code>SOMA</code> = 225, <code>MÉDIA</code> = 56,25, <code>MÁXIMO</code> = 120, <code>MÍNIMO</code> = 3 e <code>CONT.NÚM</code> = 4.'],
    h: () => `<div class=vzr1>${vzT('planilha', ['célula', 'valor'], [[['B2', '3'], 'data-a="2:k1 3:gone"'], [['B3', '12'], 'data-a="2:k1 3:gone"'], [['B4', '90'], 'data-a="2:k1 3:gone"'], [['B5', '120'], 'data-a="2:k1 3:gone"']])}</div><div class=vzt4 data-s=4><i><small>SOMA</small><b>225</b></i><i><small>MÉDIA</small><b>56,25</b></i><i><small>MÁXIMO</small><b>120</b></i><i><small>MÍNIMO</small><b>3</b></i><i><small>CONT.NÚM</small><b>4</b></i></div>` },
  calculate2: { t: 'CALCULATE com dois filtros', cap: ['<b>A tabela</b> de vendas. Sem filtro, a soma é <b>280</b>.', 'O <b>1º filtro</b> do <code>CALCULATE</code>: <code>Canal = "Online"</code>. Só as linhas Online ficam valendo.', 'O <b>2º filtro</b>: <code>Categoria = "Lanches"</code>. Os filtros trabalham juntos: a linha precisa passar nos <b>dois</b>.', '<b>Resultado:</b> 100 + 40 = <b>140</b>: só as vendas Online <i>e</i> de Lanches.'],
    h: () => `<div class=vzr1>${vzT('Vendas', ['canal', 'categoria', 'valor'], [[['Online', 'Lanches', '100'], 'data-a="2:k1 3:k2"'], [['Online', 'Bebidas', '60'], 'data-a="2:k1 3:nop"'], [['Loja', 'Lanches', '80'], 'data-a="2:nop"'], [['Online', 'Lanches', '40'], 'data-a="2:k1 3:k2"']])}<div class=vzo3 data-a="2:gone">SUM(Vendas[Valor]) = <b>280</b></div><div class=vzo3 data-s=4>CALCULATE(SUM(…); Online; Lanches) = <b>140</b></div></div>` },
  related: { t: 'RELATED busca em outra tabela', cap: ['<b>Duas tabelas</b> ligadas no modelo: Vendas e Produtos. Você quer o preço dentro da tabela de vendas.', 'As tabelas têm uma <b>relação</b> pelo produto. Cada cor é um produto.', 'O <code>RELATED(Produtos[Preco])</code> olha o produto da linha e busca o preço na outra tabela. Na 1ª linha: Caneta → 3,00.', '<b>Resultado:</b> a coluna nova foi preenchida linha por linha. Sem a relação entre as tabelas, o RELATED não sabe onde buscar.'],
    h: () => `<div class=vzr1>${vzT('Vendas', ['produto', 'qtd', 'Preco de Tabela'], [[['Caneta', '3', '<b data-s=3>3,00</b>'], 'data-a="2:k1"'], [['Mochila', '1', '<b data-s=4>90,00</b>'], 'data-a="2:k2"'], [['Caneta', '5', '<b data-s=4>3,00</b>'], 'data-a="2:k1"']])}${vzT('Produtos', ['produto', 'preco'], [[['Caneta', '3,00'], 'data-a="2:k1"'], [['Mochila', '90,00'], 'data-a="2:k2"']])}</div>` },
  medida: { t: 'A medida recalcula sozinha', cap: ['<b>A tabela</b> de vendas. A medida <code>Total Qtd = SUM(Vendas[Qtd])</code> soma tudo: <b>10</b>.', 'Uma <b>medida</b> não guarda um número fixo: ela guarda a <b>fórmula</b> e refaz a conta sempre que o relatório muda.', 'Você clica no filtro <b>Online</b> do relatório. As linhas da Loja saem do jogo.', '<b>Resultado:</b> a mesma medida recalcula sozinha: 3 + 4 = <b>7</b>.'],
    h: () => `<div class=vzr1>${vzT('Vendas', ['canal', 'qtd'], [[['Online', '3'], 'data-a="3:k1"'], [['Loja', '2'], 'data-a="3:nop"'], [['Online', '4'], 'data-a="3:k1"'], [['Loja', '1'], 'data-a="3:nop"']])}<div class=vzch data-s=3><i data-a="3=e 4=e">Filtro: Online</i><i>Loja</i></div><div class=vzo3 data-a="3:gone">Total Qtd = <b>10</b></div><div class=vzo3 data-s=4>Total Qtd = <b>7</b></div></div>` },
  selfjoin: { t: 'A tabela se liga a ela mesma', cap: ['<b>A mesma tabela</b> aparece duas vezes, com dois apelidos: <b>f</b> (o funcionário) e <b>g</b> (o gerente dele).', 'O <code>ON g.id = f.gerente_id</code> liga: o gerente_id de quem trabalha aponta para o id do gerente. Cada par ganha uma cor.', 'A Ana não tem gerente: sem par, ela fica de fora do <code>JOIN</code> (com <code>LEFT JOIN</code> ela ficaria, com o gerente vazio).', '<b>Resultado:</b> cada funcionário ao lado do nome do seu gerente.'],
    h: () => `<div class=vzr>${vzT('f (funcionário)', ['nome', 'gerente_id'], [[['Ana', '—'], 'data-a="2:nop 3:gone"'], [['Leo', '1'], 'data-a="2:k1"'], [['Bia', '1'], 'data-a="2:k1"'], [['Caio', '2'], 'data-a="2:k2"']])}<span class=vzl data-s=2>⇄</span>${vzT('g (gerente)', ['id', 'nome'], [[['1', 'Ana'], 'data-a="2:k1"'], [['2', 'Leo'], 'data-a="2:k2"'], [['3', 'Bia'], 'data-a="2:nop"'], [['4', 'Caio'], 'data-a="2:nop"']])}</div><div class=vzr1 data-s=4>${vzT('resultado', ['f.nome', 'g.nome'], [[['Leo', 'Ana'], 'class=k1'], [['Bia', 'Ana'], 'class=k1'], [['Caio', 'Leo'], 'class=k2']])}</div>` }
});
Object.assign(VZ, {
  union: { t: 'UNION junta e tira as repetidas', cap: ['<b>Dois SELECT</b>, cada um com o seu resultado: os móveis (1º) e os produtos com estoque acima de 500 (2º).', 'O <code>UNION</code> coloca um resultado <b>embaixo do outro</b>, numa lista só. Os dois SELECT precisam ter o mesmo número de colunas.', 'A <b>Mesa</b> veio nos dois. O <code>UNION</code> não deixa linha repetida: uma delas sai.', '<b>Resultado:</b> 3 linhas. Com <code>UNION ALL</code> as repetidas ficariam, e seriam 4.'],
    h: () => `<div class=vzr>${vzT('1º SELECT', ['nome'], [[['Mesa'], 'class=k1'], [['Cadeira'], 'class=k1']])}${vzT('2º SELECT', ['nome'], [[['Mesa'], 'class=k2'], [['Lapis'], 'class=k2']])}</div><div class=vzr1 data-s=2>${vzT('UNION', ['nome'], [[['Mesa'], 'class=k1'], [['Cadeira'], 'class=k1'], [['Mesa'], 'class=k2 data-a="3:gone"'], [['Lapis'], 'class=k2']])}</div><div class=vzo3 data-s=4>UNION: 3 linhas &nbsp;·&nbsp; UNION ALL: 4 linhas</div>` },
  except: { t: 'EXCEPT tira o que está no segundo', cap: ['<b>Dois SELECT</b>: os eletrônicos (1º) e os produtos com preço acima de 1000 (2º).', 'O <code>EXCEPT</code> parte da lista do <b>1º</b> e olha o 2º. O <b>Notebook</b> aparece nos dois. Sofa e Fogao só estão no 2º e não fazem diferença.', 'Tudo o que também está no 2º SELECT é <b>tirado</b> da lista do 1º.', '<b>Resultado:</b> só o que está no 1º e <b>não</b> está no 2º: Fone e Mouse.'],
    h: () => `<div class=vzr>${vzT('1º SELECT', ['nome'], [[['Fone']], [['Notebook'], 'data-a="2:k2 3:gone"'], [['Mouse']]])}${vzT('2º SELECT', ['nome'], [[['Notebook'], 'data-a="2:k2"'], [['Sofa']], [['Fogao']]])}</div><div class=vzr1 data-s=4>${vzT('EXCEPT', ['nome'], [[['Fone'], 'class=k1'], [['Mouse'], 'class=k1']])}</div>` },
  correl: { t: 'A pergunta de dentro roda para cada linha', cap: ['<b>A tabela</b> de funcionários. Você quer quem ganha <b>mais que a média do próprio departamento</b>.', 'Para <b>cada linha</b>, a subconsulta roda de novo e olha só o departamento <i>daquela</i> linha. Cada departamento tem a sua média.', 'A consulta de fora compara o salário com a média da <b>sua turma</b>: passa (✓) ou não (✗).', '<b>Resultado:</b> Ana e Caio. A mesma pergunta deu respostas diferentes porque olhou para linhas diferentes.'],
    h: () => `<div class=vzr1>${vzT('funcionarios', ['nome', 'dep', 'salario', 'media', '&gt;?'], [[['Ana', '1', '5000', '<b data-s=2>4000</b>', '<b data-s=3>✓</b>'], 'data-a="2:k1"'], [['Leo', '1', '3000', '<b data-s=2>4000</b>', '<b data-s=3>✗</b>'], 'data-a="2:k1 4:gone"'], [['Bia', '2', '4000', '<b data-s=2>5000</b>', '<b data-s=3>✗</b>'], 'data-a="2:k2 4:gone"'], [['Caio', '2', '6000', '<b data-s=2>5000</b>', '<b data-s=3>✓</b>'], 'data-a="2:k2"']])}</div>` },
  exists: { t: 'EXISTS pergunta: achou alguma linha?', cap: ['<b>Duas tabelas</b>: produtos e vendas. Você quer só os produtos com alguma venda de <b>20 unidades ou mais</b>.', 'Para <b>cada produto</b>, o <code>EXISTS</code> roda a pergunta de dentro: "existe venda deste produto com qtd &gt;= 20?". Na Caneta ele achou (mesma cor).', 'A resposta é <b>sim</b> (✓) se achou pelo menos uma linha. O Caderno só vendeu 5 e a Mochila não vendeu nada: <b>não</b> (✗).', '<b>Resultado:</b> só a Caneta fica.'],
    h: () => `<div class=vzr1>${vzT('produtos p', ['id', 'nome', 'existe?'], [[['1', 'Caneta', '<b data-s=3>✓</b>'], 'data-a="2:k1"'], [['2', 'Caderno', '<b data-s=3>✗</b>'], 'data-a="3:bad 4:gone"'], [['3', 'Mochila', '<b data-s=3>✗</b>'], 'data-a="3:bad 4:gone"']])}${vzT('vendas v', ['produto_id', 'qtd'], [[['1', '30'], 'data-a="2:k1"'], [['2', '5'], 'data-a="3:nop"']])}</div>` },
  notexists: { t: 'NOT EXISTS: só quem não achou nada', cap: ['<b>Duas tabelas</b>: clientes e pedidos. Você quer os clientes que <b>nunca fizeram pedido</b>.', 'Para <b>cada cliente</b>, a pergunta de dentro procura pedidos dele. Ana e Carla têm pedido (mesma cor). O Bruno não tem nenhum.', 'O <code>NOT EXISTS</code> responde <b>sim</b> (✓) só quando a busca <b>não acha nada</b>. Bruno: ✓. As outras duas: ✗.', '<b>Resultado:</b> só o Bruno. Com <code>EXISTS</code> seria o contrário: Ana e Carla.'],
    h: () => `<div class=vzr1>${vzT('clientes c', ['id', 'nome', 'sem pedido?'], [[['1', 'Ana', '<b data-s=3>✗</b>'], 'data-a="2:k1 4:gone"'], [['2', 'Bruno', '<b data-s=3>✓</b>'], 'data-a="3:keep"'], [['3', 'Carla', '<b data-s=3>✗</b>'], 'data-a="2:k2 4:gone"']])}${vzT('pedidos p', ['cliente_id', 'valor'], [[['1', '80'], 'data-a="2:k1"'], [['3', '35'], 'data-a="2:k2"']])}</div>` },
  insert: { t: 'INSERT acrescenta uma linha no fim', cap: ['<b>A tabela</b> produtos já tem as suas linhas.', 'O <code>INSERT INTO produtos VALUES (…)</code> traz os valores da linha nova, <b>na ordem das colunas</b>.', 'A linha nova entra no <b>fim</b> da tabela.', 'Um <code>SELECT</code> depois mostra a tabela com uma linha a mais. As outras linhas não mudam.'],
    h: () => `<div class=vzr1><code class=vzcd data-s=2>INSERT INTO produtos VALUES (11, 'Fone', 120, 'Eletronicos', 40);</code>${vzT('produtos', ['id', 'nome', 'preco', 'categoria', 'estoque'], [[['9', 'Mesa', '450', 'Moveis', '12']], [['10', 'Cadeira', '280', 'Moveis', '30']], [['11', 'Fone', '120', 'Eletronicos', '40'], 'data-s=3 data-a="3:k2"']])}</div>` },
  update: { t: 'UPDATE muda só as linhas do WHERE', cap: ['<b>A tabela</b> com os preços de agora.', 'O <code>WHERE id = 2</code> escolhe <b>quais linhas</b> vão mudar: só a do Caderno.', 'O <code>SET preco = 100</code> troca o valor antigo (12) pelo novo (100), só nessa linha.', '<b>Resultado:</b> uma linha mudou e as outras ficaram iguais. Sem o <code>WHERE</code>, as 3 linhas virariam 100.'],
    h: () => `<div class=vzr1>${vzT('produtos', ['id', 'nome', 'preco'], [[['1', 'Caneta', '3'], 'data-a="2:nop"'], [['2', 'Caderno', '<span class=vzold data-a="3:gone">12</span> <b data-s=3>100</b>'], 'data-a="2:k1"'], [['3', 'Mochila', '90'], 'data-a="2:nop"']])}<div class="vzo3 err" data-s=4>Sem o WHERE: as 3 linhas virariam 100</div></div>` },
  delete: { t: 'DELETE apaga as linhas do WHERE', cap: ['<b>A tabela</b> com 3 linhas.', 'O <code>WHERE id = 9</code> escolhe <b>qual linha</b> vai sair: a da Mesa.', 'O <code>DELETE</code> remove essa linha inteira, como riscar um item da lista.', '<b>Resultado:</b> sobraram 2 linhas. Sem o <code>WHERE</code>, todas elas seriam apagadas.'],
    h: () => `<div class=vzr1>${vzT('produtos', ['id', 'nome', 'preco'], [[['8', 'Lapis', '2'], 'data-a="2:nop"'], [['9', 'Mesa', '450'], 'data-a="2:k1 3:gone"'], [['10', 'Cadeira', '280'], 'data-a="2:nop"']])}<div class="vzo3 err" data-s=4>Sem o WHERE: a tabela inteira seria apagada</div></div>` },
  slice: { t: 'Fatiar corta um pedaço da lista', cap: ['<b>Uma lista</b> com 4 itens. Cada item tem uma posição, começando do 0.', 'Em <code>x[1:3]</code>, o número da esquerda é onde a fatia <b>começa</b> (posição 1) e o da direita é onde ela <b>para</b> (posição 3).', 'Entram os itens das posições 1 e 2. A posição 3 <b>fica de fora</b>: a fatia vai até <i>antes</i> dela.', '<b>Resultado:</b> <code>[20, 30]</code>. Também existe <code>x[::-1]</code>, que vira a lista do avesso.'],
    h: () => `<div class=vzf><code class=vzcd data-s=2>print(x[1:3])</code><div class=vzch><i data-a="3:ok"><span>10</span><small>0</small></i><i data-a="3:pass"><span>20</span><small>1</small><small data-s=2>começa</small></i><i data-a="3:pass"><span>30</span><small>2</small></i><i data-a="3:ok"><span>40</span><small>3</small><small class=ng data-s=2>para antes</small></i></div><div class=vzo2 data-s=4><b>Tela:</b><span>[20, 30]</span></div></div>` },
  splitjoin: { t: 'split corta, join cola', cap: ['<b>Um texto</b> com hífens no meio: <code>"a-b-c"</code>.', 'O <code>.split("-")</code> procura o <b>separador</b> e corta o texto em cada um.', 'Os pedaços viram uma <b>lista</b>: <code>["a", "b", "c"]</code>. O hífen some.', 'O <code>.join()</code> faz o caminho de volta: cola os itens da lista com o que você escolher no meio. Com <code>"+"</code> sai <b>a+b+c</b>.'],
    h: () => `<div class=vzf><div class=vzch><i><span>a</span></i><i data-a="2=e 3:ok"><span>-</span></i><i><span>b</span></i><i data-a="2=e 3:ok"><span>-</span></i><i><span>c</span></i></div><div class=vzar data-s=3>↓ split("-")</div><div class=vzch data-s=3><i class=pass><span>"a"</span></i><i class=pass><span>"b"</span></i><i class=pass><span>"c"</span></i></div><div class=vzo2 data-s=4><b>Tela:</b><span>a+b+c</span></div></div>` },
  heranca: { t: 'A filha herda o que a mãe tem', cap: ['<b>A classe mãe</b> (Animal) já sabe fazer uma coisa: o método <code>falar()</code>.', 'Você cria a classe filha escrevendo a mãe entre parênteses: <code>class Cao(Animal)</code>. Dentro dela não há nada (<code>pass</code>).', 'Mesmo assim a <b>Cao ganha o falar()</b> da mãe, sem copiar nada. Isso é a herança.', '<b>Resultado:</b> <code>Cao().falar()</code> funciona e devolve o que a mãe escreveu.'],
    h: () => `<div class=vzf><div class=vzx data-a="1=e">class Animal<br><small>falar() → "..."</small></div><div class=vzar data-s=2>↓ herda: class Cao(Animal)</div><div class=vzx data-s=2 data-a="2=e 3=e">class Cao<br><small>só tem pass</small><br><small data-s=3>mas também faz falar()</small></div><div class=vzo2 data-s=4><b>Tela:</b><span>...</span></div></div>` },
  switch: { t: 'SWITCH testa em ordem e para no primeiro', cap: ['<b>A tabela</b> de vendas. A coluna nova Tamanho terá uma de 3 respostas.', 'Para cada linha, o <code>SWITCH(TRUE(), …)</code> faz o <b>1º teste</b> (<code>Qtd = 1</code>). Quem passa já recebe <b>"Uma"</b> e não olha mais nada.', 'Quem não passou faz o <b>2º teste</b> (<code>Qtd &lt;= 3</code>). Passou: "Poucas". Não passou em nenhum: vale o <b>último valor</b>.', '<b>Resultado:</b> cada linha ganhou a primeira resposta cujo teste deu verdade, ou o valor padrão.'],
    h: () => `<div class=vzr1>${vzT('Vendas', ['qtd', '= 1 ?', '&lt;= 3 ?', 'Tamanho'], [[['1', '<b data-s=2>✓</b>', '<b data-s=3>—</b>', '<b data-s=4>Uma</b>'], 'data-a="4:k1"'], [['3', '<b data-s=2>✗</b>', '<b data-s=3>✓</b>', '<b data-s=4>Poucas</b>'], 'data-a="4:k2"'], [['7', '<b data-s=2>✗</b>', '<b data-s=3>✗</b>', '<b data-s=4>Muitas</b>'], 'data-a="4:k3"']])}</div>` },
  colcalc: { t: 'A coluna calculada faz uma conta por linha', cap: ['<b>A tabela</b> Vendas tem a coluna Valor. Você vai criar a coluna <code>Dobro = Vendas[Valor] * 2</code>.', 'O DAX pega a <b>1ª linha</b>: Valor 10, vezes 2, dá <b>20</b>. A conta fica guardada naquela linha.', 'Depois repete para <b>cada linha</b>, cada uma com o seu valor. É como copiar a fórmula para baixo no Excel.', '<b>Resultado:</b> a coluna nova já faz parte da tabela. Ela foi calculada <b>uma vez</b>, quando os dados carregaram.'],
    h: () => `<div class=vzr1>${vzT('Vendas', ['produto', 'Valor', 'Dobro'], [[['Caneta', '10', '<b data-s=2>20</b>'], 'data-a="2=k1"'], [['Caderno', '25', '<b data-s=3>50</b>'], 'data-a="3=k1"'], [['Mochila', '90', '<b data-s=3>180</b>'], 'data-a="3=k1"']])}<div class=vzo3 data-s=4>Vendas[Dobro] = Vendas[Valor] * 2</div></div>` },
  medcol: { t: 'Coluna: uma por linha. Medida: uma por visual', cap: ['<b>A mesma tabela</b> serve para dois tipos de conta: a coluna calculada e a medida.', 'A <b>coluna calculada</b> (<code>Valor / Qtd</code>) faz a conta <b>em cada linha</b> e guarda o resultado na tabela.', 'A <b>medida</b> (<code>SUM(Valor)</code>) não guarda nada na tabela: ela calcula <b>na hora</b>, para o que está filtrado. Agora: 200.', 'Você filtra por <b>Online</b>: a medida recalcula (140), mas a coluna calculada continua com os mesmos valores em cada linha.'],
    h: () => `<div class=vzr1>${vzT('Vendas', ['canal', 'valor', 'qtd', 'Valor Unit.'], [[['Online', '100', '4', '<b data-s=2>25</b>'], 'data-a="4:k1"'], [['Loja', '60', '3', '<b data-s=2>20</b>'], 'data-a="4:nop"'], [['Online', '40', '2', '<b data-s=2>20</b>'], 'data-a="4:k1"']])}<div class=vzch data-s=4><i class=e>Filtro: Online</i></div><div class=vzo3 data-s=3 data-a="4:gone">Total Vendas = SUM(Valor) → <b>200</b></div><div class=vzo3 data-s=4>Total Vendas (Online) → <b>140</b></div></div>` },
  ifcol: { t: 'O IF escolhe uma resposta em cada linha', cap: ['<b>A tabela</b> tem o Canal de cada venda. A coluna nova é <code>IF(Canal = "Online", "Sim", "Nao")</code>.', 'Em <b>cada linha</b>, o <code>IF</code> faz a pergunta: o Canal é "Online"? Passa (✓) ou não (✗).', 'Verdade: vale a <b>1ª resposta</b> ("Sim"). Falso: vale a <b>2ª</b> ("Nao").', '<b>Resultado:</b> a coluna nova fica guardada na tabela, linha por linha.'],
    h: () => `<div class=vzr1>${vzT('Vendas', ['canal', 'é Online ?', 'Online?'], [[['Online', '<b data-s=2>✓</b>', '<b data-s=3>Sim</b>'], 'data-a="3:k2"'], [['Loja', '<b data-s=2>✗</b>', '<b data-s=3>Nao</b>'], 'data-a="3:nop"'], [['Online', '<b data-s=2>✓</b>', '<b data-s=3>Sim</b>'], 'data-a="3:k2"']])}<div class=vzo3 data-s=4>Vendas[Online?] = IF(…) → coluna nova</div></div>` }
});
Object.assign(VZ, {
  nulo: { t: 'NULL é a falta de valor', cap: ['<b>A tabela</b> de funcionários. Dois deles estão com o salário <b>vazio</b> (NULL): ninguém preencheu.', 'O <code>IS NULL</code> faz a pergunta em <b>cada linha</b>: o salário está vazio? Sim (✓) ou não (✗).', 'Só as linhas com ✓ passam pelo <code>WHERE</code>. As outras saem.', '<b>Resultado:</b> Bia e Duda. Cuidado: <code>= NULL</code> nunca acha nada, porque vazio não é igual a nada. Use sempre <code>IS NULL</code>.'],
    h: () => `<div class=vzr1>${vzT('funcionarios', ['nome', 'salario', 'IS NULL ?'], [[['Ana', '5000', '<b data-s=2>✗</b>'], 'data-a="3:gone"'], [['Bia', '<em>NULL</em>', '<b data-s=2>✓</b>'], 'data-a="3:k2"'], [['Caio', '3000', '<b data-s=2>✗</b>'], 'data-a="3:gone"'], [['Duda', '<em>NULL</em>', '<b data-s=2>✓</b>'], 'data-a="3:k2"']])}</div>` },
  coalesce: { t: 'COALESCE usa o primeiro que não está vazio', cap: ['<b>A tabela</b> tem salários e alguns estão vazios (NULL). Você escreve <code>COALESCE(salario, 0)</code>.', 'O <code>COALESCE</code> olha o <b>1º valor</b> da lista: o salario. Se ele <b>não</b> estiver vazio, é esse que vale.', 'Se o salario estiver <b>vazio</b>, ele passa para o <b>2º valor</b>: o 0.', '<b>Resultado:</b> nenhuma linha ficou vazia. Quem tinha salário continua igual e os vazios viraram 0.'],
    h: () => `<div class=vzr1>${vzT('funcionarios', ['nome', 'salario', 'COALESCE'], [[['Ana', '5000', '<b data-s=2>5000</b>'], 'data-a="2:k1"'], [['Bia', '<em>NULL</em>', '<b data-s=3>0</b>'], 'data-a="3:k2"'], [['Caio', '3000', '<b data-s=2>3000</b>'], 'data-a="2:k1"'], [['Duda', '<em>NULL</em>', '<b data-s=3>0</b>'], 'data-a="3:k2"']])}</div>` },
  createtable: { t: 'CREATE TABLE cria uma tabela vazia', cap: ['Você escreve o comando <code>CREATE TABLE tarefas(id INTEGER, titulo TEXT)</code>. Por enquanto não existe nenhuma tabela.', 'Depois de <code>CREATE TABLE</code> vem o <b>nome</b> da tabela nova: <b>tarefas</b>.', 'Entre parênteses, cada coluna com o seu <b>tipo</b>: <code>id</code> guarda números inteiros e <code>titulo</code> guarda texto.', '<b>Resultado:</b> a tabela existe, com as colunas prontas, mas <b>sem nenhuma linha</b>. Para guardar dados, use o <code>INSERT</code>.'],
    h: () => `<div class=vzr1><code class=vzcd>CREATE TABLE tarefas(id INTEGER, titulo TEXT);</code>${vzT('tarefas', ['id <span class=vzty data-s=3>INTEGER</span>', 'titulo <span class=vzty data-s=3>TEXT</span>'], [[['<em>sem linhas</em>', '<em>sem linhas</em>'], 'data-s=4']], 'data-s=2')}</div>` },
  view: { t: 'A view é uma consulta com nome', cap: ['<b>A tabela</b> usuarios mostra o plano de cada pessoa. Você sempre precisa só dos premium.', 'O <code>CREATE VIEW premium AS SELECT …</code> <b>guarda a consulta</b> com um nome. Nenhum dado é copiado.', 'Agora você usa o nome como se fosse uma tabela: <code>SELECT * FROM premium</code>. O banco roda a consulta guardada.', '<b>Resultado:</b> só os premium. Se a tabela mudar, a view já mostra o dado novo.'],
    h: () => `<div class=vzr1>${vzT('usuarios', ['nome', 'plano'], [[['Ana', 'premium'], 'data-a="3:k1"'], [['Bia', 'gratis'], 'data-a="3:nop"'], [['Caio', 'premium'], 'data-a="3:k1"'], [['Duda', 'gratis'], 'data-a="3:nop"']])}<div class=vzx style="margin-top:8px" data-s=2 data-a="2=e 3=e">VIEW premium<br><small>guarda a consulta: WHERE plano = 'premium'</small></div>${vzT('SELECT * FROM premium', ['nome', 'plano'], [[['Ana', 'premium'], 'class=k1'], [['Caio', 'premium'], 'class=k1']], 'data-s=4')}</div>` },
  ntile: { t: 'NTILE reparte a fila em faixas iguais', cap: ['<b>A tabela</b> de funcionários. Você quer dividir todos em <b>3 faixas</b> do mesmo tamanho, do menor ao maior salário.', 'O <code>OVER (ORDER BY salario)</code> coloca as linhas em <b>fila</b>, do menor salário ao maior.', 'O <code>NTILE(3)</code> corta a fila em <b>3 pedaços iguais</b>: 6 linhas, 2 em cada. Cada pedaço ganha uma cor.', '<b>Resultado:</b> a coluna nova mostra a faixa de cada pessoa: 1, 2 ou 3. Com <code>NTILE(4)</code> seriam 4 faixas.'],
    h: () => `<div class=vzr1>${vzT('funcionarios', ['pos', 'nome', 'salario', 'faixa'], [[['<b data-s=2>1º</b>', 'Leo', '2000', '<b data-s=4>1</b>'], 'data-a="3:k1"'], [['<b data-s=2>2º</b>', 'Bia', '2500', '<b data-s=4>1</b>'], 'data-a="3:k1"'], [['<b data-s=2>3º</b>', 'Caio', '3000', '<b data-s=4>2</b>'], 'data-a="3:k2"'], [['<b data-s=2>4º</b>', 'Eva', '4000', '<b data-s=4>2</b>'], 'data-a="3:k2"'], [['<b data-s=2>5º</b>', 'Ana', '5000', '<b data-s=4>3</b>'], 'data-a="3:k3"'], [['<b data-s=2>6º</b>', 'Gil', '8000', '<b data-s=4>3</b>'], 'data-a="3:k3"']])}</div>` },
  superm: { t: 'super() chama a mãe', cap: ['A classe <b>mãe</b> (A) já sabe guardar o <b>x</b>. A filha (B) quer guardar o x <i>e</i> o y.', 'Você cria <code>B(1, 2)</code>. O Python roda o <code>__init__</code> da <b>filha</b>, com x = 1 e y = 2.', 'A 1ª linha é <code>super().__init__(x)</code>: ela <b>chama a mãe</b> para guardar o x. Você não precisa escrever isso de novo.', '<b>Resultado:</b> a mãe guardou o x e a filha guardou o y. O objeto tem os dois: <code>1 2</code>.'],
    h: () => `<div class=vzf><div class=vzx data-a="1=e 3=e">class A (mãe)<br><small>__init__(x): guarda o x</small></div><div class=vzar>↑ <span data-s=3>super().__init__(x)</span></div><div class=vzx data-a="2=e 4=e">class B (filha)<br><small>__init__(x, y)</small><br><small data-s=2>B(1, 2)</small><br><small data-s=4>depois guarda o y</small></div><div class=vzo2 data-s=4><b>Tela:</b><span>1 2</span></div></div>` },
  poli: { t: 'Mesmo nome, cada um faz do seu jeito', cap: ['<b>Dois objetos</b>: um da classe A e um da B. Os dois têm um método chamado <code>falar()</code>, mas a B escreveu o seu.', 'O <code>for</code> pega o <b>1º objeto</b> e chama <code>o.falar()</code>. Como é um A, roda o falar do A.', 'Pega o <b>2º objeto</b> e chama <code>o.falar()</code>. Como é um B, roda o falar do B.', '<b>Resultado:</b> a mesma linha de código, <code>o.falar()</code>, deu resultados diferentes. Isso é o polimorfismo.'],
    h: () => `<div class=vzf><code class=vzcd>for o in [A(), B()]:<br>&nbsp;&nbsp;o.falar()</code><div class=vzch><i data-a="2=e 3=ok 4=e"><span>A()</span></i><i data-a="3=e 4=e"><span>B()</span></i></div><div class=vzo2><b>Tela:</b><span data-s=2>A fala</span><span data-s=3>B fala</span></div></div>` },
  gerador: { t: 'O gerador entrega um valor de cada vez', cap: ['<b>A função</b> tem dois <code>yield</code>. Ela ainda não rodou: só foi escrita.', 'O <code>list(g())</code> pede o 1º valor. A função roda até o primeiro <code>yield</code>, <b>entrega o 1</b> e fica <b>pausada</b> ali.', 'Pede de novo: a função <b>continua de onde parou</b>, vai até o próximo <code>yield</code> e entrega o <b>2</b>.', 'Não há mais <code>yield</code>: o gerador acaba. O <code>list()</code> juntou o que foi entregue: <code>[1, 2]</code>.'],
    h: () => `<div class=vzf><div class=vzx style="text-align:left">def g():<br>&nbsp;&nbsp;<span class=vzln data-a="2=e">yield 1</span><br>&nbsp;&nbsp;<span class=vzln data-a="3=e">yield 2</span></div><div class=vzo2><b>Entregue:</b><span data-s=2>1</span><span data-s=3>2</span></div><div class=vzo data-s=4>[1, 2]</div></div>` },
  genexp: { t: 'Calcula só quando alguém pede', cap: ['O <code>range(4)</code> entrega os números 0, 1, 2 e 3. Você quer a soma dos quadrados.', 'A expressão com parênteses calcula <code>x * x</code> <b>só na hora</b> em que alguém pede um valor: 0, 1, 4 e 9, um de cada vez.', 'O <code>sum()</code> vai pegando cada valor e somando: 0 + 1 + 4 + 9. Nenhuma lista é montada na memória.', '<b>Resultado:</b> <code>14</code>. Com colchetes seria uma lista pronta; com parênteses, um gerador que entrega sob demanda.'],
    h: () => `<div class=vzf><div class=vzch><i><span>0</span></i><i><span>1</span></i><i><span>2</span></i><i><span>3</span></i></div><div class=vzar data-s=2>↓ x * x, um de cada vez</div><div class=vzch data-s=2><i class=pass><span>0</span></i><i class=pass><span>1</span></i><i class=pass><span>4</span></i><i class=pass><span>9</span></i></div><div class=vzar data-s=3>↓ sum() soma tudo</div><div class=vzo2 data-s=4><b>Tela:</b><span>14</span></div></div>` },
  iter: { t: 'next entrega o próximo item', cap: ['<b>Uma lista</b> com 2 itens. O <code>iter()</code> cria um marcador de página no <b>começo</b>, antes do 1º item.', 'O <code>next(it)</code> anda o marcador para o 1º item e <b>entrega o 1</b>.', 'Outro <code>next(it)</code>: o marcador anda mais um e entrega o <b>2</b>.', 'Mais um <code>next(it)</code>: a lista <b>acabou</b>, não há nada para entregar e o Python avisa com um erro (<code>StopIteration</code>).'],
    h: () => `<div class=vzf><div class=vzch><i data-a="2=e 3=ok 4=ok"><span>1</span></i><i data-a="3=e 4=ok"><span>2</span></i></div><div class=vzo2><b>Tela:</b><span data-s=2>1</span><span data-s=3>2</span></div><div class="vzo3 err" data-s=4>StopIteration: acabou a lista</div></div>` },
  decorator: { t: 'O decorator embrulha a função', cap: ['<b>A função</b> soma(a, b) faz uma conta e devolve o resultado.', 'O <code>@deco</code> em cima dela <b>embrulha</b> a função dentro de outra, a <code>novo</code>. O nome <code>soma</code> passa a apontar para o embrulho.', 'Ao chamar <code>soma(1, 2)</code>, quem roda primeiro é o <b>embrulho</b>: ele faz o seu extra (<code>print("antes")</code>) e só então chama a função de dentro.', '<b>Resultado:</b> aparece <code>antes</code> e depois <code>3</code>. A função de dentro não foi alterada.'],
    h: () => `<div class=vzf><div class="vzx vzwp" data-a="2:on"><span data-s=2>novo</span><br><small data-s=2>o embrulho</small><br><small data-s=3>print("antes")</small><div class=vzx style="margin-top:6px" data-a="1=e 3=e">soma(a, b)<br><small>return a + b</small></div></div><div class=vzo2 data-s=4><b>Tela:</b><span>antes</span><span>3</span></div></div>` },
  pdframe: { t: 'O DataFrame é uma tabela', cap: ['<b>Um DataFrame</b> é uma tabela com linhas e colunas, como uma planilha. Cada linha tem um número de posição à esquerda.', 'O <code>df.shape</code> conta o tamanho: <b>4 linhas</b> e <b>3 colunas</b>, no formato <code>(4, 3)</code>.', 'O <code>df.head(3)</code> mostra só as <b>3 primeiras</b> linhas, para você espiar a tabela sem ver tudo.', '<b>Resultado:</b> o <code>shape</code> é <code>(4, 3)</code> e o <code>head(3)</code> trouxe as 3 primeiras linhas.'],
    h: () => `<div class=vzr1>${vzT('df', ['#', 'produto', 'qtd', 'preco'], [[['0', 'Caneta', '8', '3'], 'data-a="2=k1 3:k2"'], [['1', 'Caderno', '3', '12'], 'data-a="2=k1 3:k2"'], [['2', 'Mochila', '6', '90'], 'data-a="2=k1 3:k2"'], [['3', 'Fone', '2', '120'], 'data-a="2=k1 3:gone"']])}<div class=vzo3 data-s=2 data-a="3:gone">df.shape → <b>(4, 3)</b></div><div class=vzo3 data-s=4>df.shape → (4, 3) &nbsp;·&nbsp; head(3) → 3 linhas</div></div>` },
  pdfilter: { t: 'df[condição] é uma peneira', cap: ['<b>O DataFrame</b> com a quantidade vendida de cada produto.', 'O <code>df["qtd"] &gt; 5</code> testa <b>cada linha</b> e devolve <code>True</code> ou <code>False</code>.', 'O <code>df[…]</code> fica só com as linhas <b>True</b>. As outras saem.', '<b>Resultado:</b> sobraram 2 linhas, e o <code>.shape[0]</code> conta quantas são: <b>2</b>.'],
    h: () => `<div class=vzr1>${vzT('df', ['produto', 'qtd', 'qtd &gt; 5'], [[['Caneta', '8', '<b data-s=2>True</b>'], 'data-a="3:k2"'], [['Caderno', '3', '<b data-s=2>False</b>'], 'data-a="3:gone"'], [['Mochila', '6', '<b data-s=2>True</b>'], 'data-a="3:k2"'], [['Fone', '2', '<b data-s=2>False</b>'], 'data-a="3:gone"']])}<div class=vzo3 data-s=4>.shape[0] → <b>2</b></div></div>` },
  pdnew: { t: 'Coluna nova: uma conta por linha', cap: ['<b>O DataFrame</b> tem produto e qtd. Você escreve <code>df["x"] = df["qtd"] * 2</code>.', 'O Pandas pega a <b>1ª linha</b>: qtd 3, vezes 2, dá <b>6</b>, e guarda na coluna nova <b>x</b>.', 'Faz o mesmo em <b>todas as linhas</b>, sozinho, sem você escrever um <code>for</code>.', '<b>Resultado:</b> a coluna <b>x</b> agora faz parte da tabela e aparece no <code>print</code>.'],
    h: () => `<div class=vzr1>${vzT('df', ['produto', 'qtd', 'x'], [[['Caneta', '3', '<b data-s=2>6</b>'], 'data-a="2=k1"'], [['Caderno', '5', '<b data-s=3>10</b>'], 'data-a="3=k1"'], [['Mochila', '1', '<b data-s=3>2</b>'], 'data-a="3=k1"']])}<div class=vzo3 data-s=4>df["x"] = df["qtd"] * 2</div></div>` },
  pdgroup: { t: 'groupby separa em montinhos', cap: ['<b>A tabela</b>: cada linha é um produto, com categoria e quantidade.', 'O <code>groupby("categoria")</code> separa as linhas por categoria. Cada categoria ganha uma cor.', 'Cada montinho <b>soma</b> a sua coluna <code>qtd</code>: Papelaria 3 + 5 = 8 e Moveis 2 + 4 = 6.', '<b>Resultado:</b> uma linha por categoria, com a soma de cada uma. Dá para trocar <code>sum</code> por <code>mean</code>, <code>max</code>, <code>count</code>…'],
    h: () => `<div class=vzr1>${vzT('df', ['produto', 'categoria', 'qtd'], [[['Caneta', 'Papelaria', '3'], 'data-a="2:k1"'], [['Mesa', 'Moveis', '2'], 'data-a="2:k2"'], [['Lapis', 'Papelaria', '5'], 'data-a="2:k1"'], [['Cadeira', 'Moveis', '4'], 'data-a="2:k2"']])}${vzT('resultado', ['categoria', 'qtd'], [[['Papelaria', '8'], 'class=k1'], [['Moveis', '6'], 'class=k2']], 'data-s=3')}<div class=vzo3 data-s=4>df.groupby("categoria")["qtd"].sum()</div></div>` },
  pdmerge: { t: 'merge junta duas tabelas por uma coluna', cap: ['<b>Duas tabelas</b>: as vendas e as metas. As duas têm a coluna <b>categoria</b>.', 'O <code>on="categoria"</code> liga as linhas que têm a <b>mesma categoria</b> nas duas tabelas. Cada par ganha uma cor.', 'O <code>merge</code> mantém só as linhas que têm par nas duas (como o <code>INNER JOIN</code> do SQL). A linha sem par sai.', '<b>Resultado:</b> cada produto agora mostra também a meta da sua categoria.'],
    h: () => `<div class=vzr style="align-items:flex-start">${vzT('df (vendas)', ['produto', 'categoria'], [[['Mesa', 'Moveis'], 'data-a="2:k1"'], [['Camisa', 'Roupas'], 'data-a="2:k2"'], [['Fone', 'Audio'], 'data-a="2:nop 3:gone"']])}<span class=vzl style="align-self:center" data-s=2>⇄</span>${vzT('metas', ['categoria', 'meta'], [[['Moveis', '50'], 'data-a="2:k1"'], [['Roupas', '80'], 'data-a="2:k2"']])}</div><div class=vzr1 data-s=4>${vzT('resultado', ['produto', 'categoria', 'meta'], [[['Mesa', 'Moveis', '50'], 'class=k1'], [['Camisa', 'Roupas', '80'], 'class=k2']])}</div>` },
  contexto: { t: 'Cada célula tem o seu filtro', cap: ['<b>A tabela</b> de vendas e a medida <code>Total Vendas = SUM(Valor)</code>. O visual abaixo mostra a medida em cada célula.', 'Na célula <b>Lanches / Online</b>, o Power BI aplica os dois filtros: só entram as linhas Lanches <i>e</i> Online. Soma: <b>100</b>.', 'Na célula <b>Lanches / Loja</b> o contexto é outro: só as linhas Lanches e Loja. Soma: <b>80</b>.', '<b>Resultado:</b> a mesma medida deu valores diferentes porque cada célula calcula com o <b>seu</b> contexto de filtro.'],
    h: () => `<div class=vzr1>${vzT('Vendas', ['categoria', 'canal', 'valor'], [[['Lanches', 'Online', '100'], 'data-a="2=k1 4:k1"'], [['Lanches', 'Loja', '80'], 'data-a="3=k2 4:k2"'], [['Bebidas', 'Online', '60'], 'data-a="4:k3"'], [['Bebidas', 'Loja', '40'], 'data-a="4:k4"']])}${vzT('visual: Total Vendas', ['', 'Online', 'Loja'], [[['Lanches', '<b data-s=2>100</b>', '<b data-s=3>80</b>']], [['Bebidas', '<b data-s=4>60</b>', '<b data-s=4>40</b>']]])}</div>` },
  totaldax: { t: 'O total é a medida sem filtro', cap: ['<b>A tabela</b> mostra quem comprou em cada categoria. A medida é <code>DISTINCTCOUNT(Cliente)</code>: conta clientes diferentes.', 'Na linha <b>Lanches</b> o filtro deixa Ana e Bia: <b>2</b> clientes. Na linha <b>Bebidas</b>, Ana e Caio: <b>2</b>.', 'A linha <b>Total</b> não tem filtro nenhum: o Power BI conta os clientes diferentes da tabela toda. A Ana comprou nas duas categorias, mas conta <b>uma vez só</b>: 3.', '<b>Resultado:</b> 2 + 2 = 4, mas o total é <b>3</b>. O total não soma as linhas: ele calcula a medida de novo.'],
    h: () => `<div class=vzr1>${vzT('Vendas', ['cliente', 'categoria'], [[['Ana', 'Lanches'], 'data-a="2:k1"'], [['Bia', 'Lanches'], 'data-a="2:k1"'], [['Ana', 'Bebidas'], 'data-a="2:k2"'], [['Caio', 'Bebidas'], 'data-a="2:k2"']])}${vzT('visual', ['categoria', 'Clientes'], [[['Lanches', '<b data-s=2>2</b>'], 'data-a="2:k1"'], [['Bebidas', '<b data-s=2>2</b>'], 'data-a="2:k2"'], [['Total', '<b data-s=3>3</b>'], 'data-a="3:keep"']])}<div class="vzo3 err" data-s=4>2 + 2 = 4, mas o Total mostra 3</div></div>` },
  calendar: { t: 'O calendário tem todos os dias', cap: ['<b>A tabela de vendas</b> só tem linha nos dias em que vendeu algo: 01/01 e 03/01.', 'A <b>tabela Calendário</b> tem uma linha para <b>cada dia</b>, vendendo ou não: de 01/01 a 04/01.', 'As duas se ligam pela <b>data</b>. Os dias com venda ganham um par (cor). Os outros ficam sem par.', '<b>Resultado:</b> o relatório mostra todos os dias, e os sem venda aparecem vazios. Sem o calendário, esses dias nem apareceriam.'],
    h: () => `<div class=vzr style="align-items:flex-start">${vzT('Vendas', ['Data', 'Valor'], [[['01/01', '50'], 'data-a="3:k1"'], [['03/01', '30'], 'data-a="3:k2"']])}<span class=vzl style="align-self:center" data-s=3>⇄</span>${vzT('Calendario', ['Data'], [[['01/01'], 'data-a="3:k1"'], [['02/01'], 'data-a="3:nop"'], [['03/01'], 'data-a="3:k2"'], [['04/01'], 'data-a="3:nop"']], 'data-s=2')}</div><div class=vzf data-s=4><small class=vzcap>relatório por dia</small><div class=vzch><i class=pass><span>01/01</span><small>50</small></i><i class=ok><span>02/01</span><small>vazio</small></i><i class=pass><span>03/01</span><small>30</small></i><i class=ok><span>04/01</span><small>vazio</small></i></div></div>` },
  divide: { t: 'DIVIDE não dá erro', cap: ['<b>A tabela</b> tem o total e a quantidade de vendas de cada canal. A Loja ainda não vendeu: total 0 e quantidade 0.', 'Com a divisão comum (<code>total / qtd</code>), a Loja vira <b>0 ÷ 0</b>: conta impossível, e o relatório mostra um <b>erro</b>.', 'O <code>DIVIDE</code> <b>olha o divisor antes</b>. Se ele for zero, nem tenta dividir.', '<b>Resultado:</b> no lugar do erro aparece o 3º valor que você escolheu: <code>DIVIDE(total, qtd, 0)</code> mostra <b>0</b>.'],
    h: () => `<div class=vzr1>${vzT('Vendas', ['canal', 'total', 'qtd', '/', 'DIVIDE'], [[['Online', '200', '4', '<b data-s=2>50</b>', '<b data-s=4>50</b>']], [['Loja', '0', '<span data-a="3=cel">0</span>', '<b data-s=2>erro</b>', '<b data-s=4>0</b>'], 'data-a="2=bad 4=keep"']])}</div>` },
  medmed: { t: 'Uma medida chama outras medidas', cap: ['<b>Duas medidas</b> já criadas: <b>Total Vendas</b> vale 300 e <b>Qtd de Vendas</b> vale 4.', 'Você escreve uma medida nova, <code>Ticket Medio</code>, usando os <b>nomes</b> delas entre colchetes: <code>[Total Vendas] / [Qtd de Vendas]</code>.', 'Ao calcular, o Power BI <b>chama cada medida</b> e pega o valor que ela tem.', '<b>Resultado:</b> 300 ÷ 4 = <b>75</b>. Se o Total Vendas mudar, o Ticket Medio acompanha sozinho.'],
    h: () => `<div class=vzf><div class=vzr><div class=vzx data-a="1=e 3=e">[Total Vendas]<br><small>300</small></div><div class=vzx data-a="1=e 3=e">[Qtd de Vendas]<br><small>4</small></div></div><div class=vzar data-s=2>↓ [Total Vendas] / [Qtd de Vendas]</div><div class=vzx data-s=2 data-a="2=e 4=e">Ticket Medio<br><small data-s=4>300 ÷ 4 = 75</small></div></div>` },
  medconta: { t: 'A medida faz contas com o resultado', cap: ['<b>A coluna Valor</b> tem 3 vendas: 100, 60 e 40.', 'O <code>SUM(Vendas[Valor])</code> soma tudo e entrega <b>um número</b>: 200.', 'Depois da soma, a medida segue a conta: <code>* 0.05</code> multiplica o 200 por 5%.', '<b>Resultado:</b> a medida <b>Comissao</b> vale <b>10</b>. A taxa vai com ponto (0.05), não com vírgula.'],
    h: () => `<div class=vzr1>${vzT('Vendas', ['produto', 'Valor'], [[['Caneta', '100'], 'data-a="2:k1"'], [['Caderno', '60'], 'data-a="2:k1"'], [['Mochila', '40'], 'data-a="2:k1"']])}<div class=vzo3 data-s=2>SUM(Vendas[Valor]) = <b>200</b></div><div class=vzo3 data-s=3>200 * 0.05 = <b>10</b></div><div class=vzo3 data-s=4>Comissao = SUM(Vendas[Valor]) * 0.05 → <b>10</b></div></div>` }
});
// quais lições mostram qual animação (ids separados por espaço)
const VIZ_IDS = {
  where: 'sql-1-04 sql-1-05 sql-1-06 sql-1-07 sql-1-08 sql-1-10 sql-1-11 sql-1-12 sql-1-13', order: 'sql-1-14 sql-1-15 sql-1-16 sql-1-18', group: 'sql-1-25 sql-1-26 sql-2-05 sql-2-10', having: 'sql-1-27',
  inner: 'sql-2-01 sql-2-03 sql-2-04 sql-2-09 sql-2-12', left: 'sql-2-07 sql-2-08 sql-2-13', agg: 'sql-1-20 sql-1-21 sql-1-22 sql-1-23', distinct: 'sql-1-19', limit: 'sql-1-17',
  case: 'sql-2-19 sql-2-20', subq: 'sql-2-14 sql-2-15', cte: 'sql-3-01 sql-3-02 sql-3-03', rank: 'sql-3-09 sql-3-10 sql-3-11', partition: 'sql-3-12 sql-3-13', running: 'sql-3-14', lag: 'sql-3-16 sql-3-18',
  if: 'py-1-16 py-1-17 py-1-18', for: 'py-1-23 py-1-24 py-1-25', while: 'py-1-26', func: 'py-1-28 py-1-30', dict: 'py-1-29 py-2-13', list: 'py-1-19 py-1-20', comp: 'py-2-04', compif: 'py-2-05', try: 'py-2-25', class: 'py-3-01 py-3-02 py-3-03',
  procv: 'xl-1-26', se: 'xl-1-15', somase: 'xl-1-19', dollar: 'xl-1-12 xl-1-13', calculate: 'pbi-1-19',
  contse: 'xl-1-20', senest: 'xl-1-18', indice: 'xl-1-28', eou: 'xl-1-17', seerro: 'xl-1-27', rangexl: 'xl-1-08 xl-1-09 xl-1-10 xl-1-11', calculate2: 'pbi-1-20', related: 'pbi-1-24', medida: 'pbi-1-11 pbi-1-12 pbi-1-13 pbi-1-14', selfjoin: 'sql-3-07 sql-3-08',
  union: 'sql-2-17', except: 'sql-2-18', correl: 'sql-3-04', exists: 'sql-3-05', notexists: 'sql-3-06', insert: 'sql-2-26', update: 'sql-2-27', delete: 'sql-2-28', slice: 'py-2-08', splitjoin: 'py-2-17', heranca: 'py-3-05', switch: 'pbi-1-23', colcalc: 'pbi-1-21', medcol: 'pbi-1-10', ifcol: 'pbi-1-22',
  nulo: 'sql-1-29', coalesce: 'sql-2-21', createtable: 'sql-2-29', view: 'sql-3-26', ntile: 'sql-3-20', superm: 'py-3-06', poli: 'py-3-07', gerador: 'py-3-11', genexp: 'py-3-12', iter: 'py-3-13', decorator: 'py-3-14',
  pdframe: 'py-3-21 py-3-22', pdfilter: 'py-3-23', pdnew: 'py-3-24', pdgroup: 'py-3-25', pdmerge: 'py-3-28', contexto: 'pbi-1-27', totaldax: 'pbi-1-28', calendar: 'pbi-1-29', divide: 'pbi-1-17', medmed: 'pbi-1-16', medconta: 'pbi-1-15'
};
const VIZ_OF = {}; Object.keys(VIZ_IDS).forEach(k => VIZ_IDS[k].split(' ').forEach(id => { VIZ_OF[id] = k; }));
const vizOf = l => VZ[VIZ_OF[l && l.id]] ? VIZ_OF[l.id] : null;
function vzApply(root, n) {
  root.dataset.n = n;
  root.querySelectorAll('[data-s]').forEach(e => e.classList.toggle('show', n >= +e.dataset.s));
  root.querySelectorAll('[data-a]').forEach(e => {   // cada classe fica ligada se QUALQUER regra dela valer neste passo
    const on = {}; String(e.dataset.a).split(' ').forEach(r => { const m = r.match(/^(\d)([:=])(.+)$/); if (m) on[m[3]] = on[m[3]] || (m[2] == ':' ? n >= +m[1] : n == +m[1]); });
    Object.keys(on).forEach(c => e.classList.toggle(c, on[c]));
  });
}
const vzAlive = () => S.step == 'intro' && !!S.vz && !!S.cur && S.vz.id == S.cur.id && !!$('#vzBox');
function vzGo(n, auto) {
  if (!vzAlive()) return; const v = S.vz, k = VZ[v.kind]; clearTimeout(v.t); v.gen++; const g = v.gen; v.n = n; if (!auto) v.auto = false;
  vzApply($('#vzBox'), n);
  document.querySelectorAll('.vzdot').forEach((d, i) => { d.classList.toggle('on', i + 1 == n); d.classList.toggle('ok', i + 1 < n); });
  $('#vzCap').innerHTML = `<small>Passo ${n} de 4</small><p>${k.cap[n - 1]}</p>`;
  const p = $('#vzPrev'), q = $('#vzNext'); if (p) p.disabled = n <= 1; if (q) q.disabled = n >= 4;
  if (v.auto && !hwReduce()) v.t = setTimeout(() => { if (!vzAlive() || v.gen != g || !v.auto) return; if (n < 4) vzGo(n + 1, true); else vzEnd(); }, n == 4 ? 3200 : 2800);
}
function vzEnd() { const v = S.vz; v.auto = false; if (hwAlive() && S.hw.gen == 0) hwGo(0, !hwReduce()); }   // terminou a animação visual: começa o código passo a passo
function vzPlay() { if (!vzAlive()) return; S.vz.auto = !hwReduce(); vzGo(1, true); }
function vzManual(n) { if (!vzAlive()) return; const v = S.vz; v.auto = false; vzGo(Math.max(1, Math.min(4, n))); if (hwAlive() && S.hw.gen == 0) hwGo(0, false); }
// ---- "Quando usar" e "Como usar" (molde para preencher) de cada lição (l.usar vem do servidor)
function usarHtml(l) {
  const u = l.usar; if (!u) return '';
  const code = hwCode(l), steps = hwHas(l) ? l.como.map(c => `<li><code>${esc(code.slice(c.a, c.b).replace(/\s+/g, ' ').trim())}</code><span>${esc(c.d)}</span></li>`).join('') : '';
  return `<div class=infos><div class="inf oque"><div class=ih><span class=ii>${ic('bulb', 17)}</span><b>Quando usar</b></div><p>${esc(u.q)}</p>${u.c ? `<p class=hwcu><b>Cuidado:</b> ${esc(u.c)}</p>` : ''}</div>
  <div class="inf como"><div class=ih><span class=ii>${ic('pencil', 17)}</span><b>Como usar</b></div><p>Este é o molde. Troque as palavras em minúsculas pelo que você precisa:</p><pre class=hwm>${hl(u.m, lang(l))}</pre>${steps ? `<details class=hwdt><summary>Ver o passo a passo do exemplo</summary><ol class=hwol>${steps}</ol></details>` : ''}</div></div>`;
}
// a atividade que vem depois do "Como funciona": a próxima do círculo que falta (lição já feita ou só a de executar: a teoria)
const introNext = l => { const m = rowOf(l.id); return S.me.done[l.id] || !m ? 'x' : actOrd(m).find(a => a != 'c' && !actDn(m, a)) || 'x'; };
async function introGo() {   // "Entendi": marca a 1ª parte do círculo como vista e segue para a próxima atividade
  const l = S.cur, m = rowOf(l.id), nx = introNext(l); if (S.step != 'intro' || S.hw && S.hw.busy) return;
  if (S.hw) { S.hw.busy = true; clearTimeout(S.hw.t); S.hw.gen++; }
  if (m && m.cf && !actDn(m, 'c')) { try { await api('lessons/' + l.id + '/intro', { method: 'POST' }); m.cd = 1; } catch { } }   // sem internet: segue mesmo assim e marca na próxima vez
  nx == 'x' ? lesson() : openAct(l.id, nx);
}
function intro() {   // parte 1: para que serve e como funciona
  delete document.body.dataset.calm;
  const l = S.cur; theme(l.track); S.step = 'intro'; clearTimeout(LT); if (S.hw) { clearTimeout(S.hw.t); S.hw.gen = (S.hw.gen || 0) + 1; }
  const T = HW_LB[l.type] || HW_LB.quiz, code = hwCode(l), nl = code.split('\n').length;
  S.hw = { id: l.id, step: 0, i: 0, gen: 0, t: 0, auto: !hwReduce(), busy: false };
  if (S.vz) clearTimeout(S.vz.t); const kind = vizOf(l); S.vz = kind ? { id: l.id, kind, n: 1, gen: 0, t: 0, auto: !hwReduce() } : null;
  const m = rowOf(l.id), nx = introNext(l), nm = nx == 'x' ? '' : actNm(l, nx).toLowerCase();
  A.innerHTML = `<div class="c itr"><div class=top><button class=ibtn onclick="go('home')" aria-label="Fechar">${ic('x', 20)}</button><div class=bar><i style="width:${(l.n - 1) / 30 * 100}%"></i></div><b class=hearts style="color:var(--acc)">${l.n}/30</b></div>
  ${nx == 'x' ? steps(1) : ''}<div class=crumb>${tg(l.track, 24)}<span>${TN[l.track]} · ${esc(l.level)} · Lição ${l.n} de 30</span></div>${m && m.cf ? `<div class=hwtag>${esc(actTag(l, 'c'))}</div>` : ''}<h2 class=ttl>${esc(l.title)}</h2>
  <div class=tutor>${poseChip('explica', 124) ? `<span class=tpz role=img aria-label="${esc(gnm())}">${poseChip('explica', 124)}</span>` : `<img src="${IMG().full}" alt="${esc(gnm())}">`}<div class=sb>Antes da teoria, veja <b>para que isso serve</b> e <b>como funciona</b>. Toque nos passos ou deixe rodar sozinho.</div></div>
  ${infoCards(l.info, ['serve'])}
  ${kind ? `<div class="hw vz"><div class=hwh><span>${ic('play', 15)}Como funciona</span><button class=hwre onclick="vzPlay()">${ic('swap', 15)}Ver de novo</button></div><div class=vzt0>${esc(VZ[kind].t)}</div><div class=vzbox id=vzBox data-n=1>${VZ[kind].h()}</div><div class=vzdots>${[1, 2, 3, 4].map(i => `<button class=vzdot onclick="vzManual(${i})" aria-label="Passo ${i}"><i>${i}</i></button>`).join('')}</div><div class=hwn><div class=hws id=vzCap></div><div class=hwnav><button class="btn ghost" id=vzPrev onclick="vzManual(S.vz.n-1)">${ic('back', 15)}Antes</button><button class="btn ghost" id=vzNext onclick="vzManual(S.vz.n+1)">Depois${ic('arrow', 15)}</button></div></div></div>` : ''}
  <div class=hw id=hw><div class=hwh><span>${ic('play', 15)}${kind ? 'O código, parte por parte' : 'Como funciona'}</span><button class=hwre onclick=hwPlay()>${ic('swap', 15)}Ver de novo</button></div>
    <div class=hwtabs role=tablist>${T.map((t, i) => `<button class=hwtb id=hwt${i} role=tab onclick="hwGo(${i})"><i>${i + 1}</i><span>${esc(t)}</span></button>`).join('')}</div>
    <div class=hwc><div class=edh><i></i><i></i><i></i><span>${HW_FN[l.type] || 'exemplo'}</span></div><pre class=hwpre id=hwPre style="min-height:${nl * 24 + 28}px"></pre></div>
    <div class=hwn id=hwNote aria-live=polite></div><div class=hwres id=hwRes></div></div>
  ${usarHtml(l)}
  <button class="btn pri block" onclick=introGo()>Entendi, ir para ${nx == 'x' ? 'a teoria' : esc(nm)} ${ic('arrow', 16)}</button>
  <p class=tn style="text-align:center">${nx == 'x' ? `Na próxima etapa você lê a teoria${l.type == 'sql' || l.type == 'python' ? ' e pode mexer neste exemplo' : ''}; depois vai para a prática.` : `Depois vem a atividade ${actPos(m, nx)}: ${esc(nm)}.`}</p></div>`;
  window.scrollTo(0, 0);
  setTimeout(() => { if (!hwAlive()) return; if (kind) { vzGo(1, !hwReduce()); if (hwReduce() && S.hw.gen == 0) hwGo(0, false); } else if (S.hw.gen == 0) hwGo(0, !hwReduce()); }, hwReduce() ? 0 : 450);
}
function hwPlay() { if (hwAlive()) { S.hw.auto = !hwReduce(); hwGo(0, true); } }
function hwType(g, done) {   // o código aparece sendo digitado
  const h = S.hw, l = S.cur, pre = $('#hwPre'), code = hwCode(l), tp = lang(l), n = code.length;
  if (hwReduce() || l.type == 'quiz') { pre.innerHTML = hl(code, tp); return done && done(); }
  const k = Math.max(1, Math.ceil(n / 55)); let at = 0;
  const tick = () => { if (!hwAlive() || h.gen != g) return; at = Math.min(n, at + k); pre.innerHTML = hl(code.slice(0, at), tp) + (at < n ? '<span class=hcur></span>' : ''); if (at < n) h.t = setTimeout(tick, 30); else if (done) done(); };
  tick();
}
function hwGo(k, auto) {
  if (!hwAlive()) return;
  const h = S.hw, l = S.cur, pre = $('#hwPre'), note = $('#hwNote'), res = $('#hwRes'), code = hwCode(l), tp = lang(l), como = hwHas(l) ? l.como : [], info = l.info || {}, rdc = hwReduce();
  clearTimeout(h.t); const g = ++h.gen; h.step = k; if (!auto) h.auto = false;
  document.querySelectorAll('.hwtb').forEach((b, i) => { b.classList.toggle('on', i == k); b.classList.toggle('ok', i < k); b.setAttribute('aria-selected', i == k ? 'true' : 'false'); });
  res.innerHTML = ''; res.classList.remove('on');
  const nxt = (fn, ms) => { if (h.auto && !rdc) h.t = setTimeout(() => { if (hwAlive() && h.gen == g && h.auto) fn(); }, ms); };
  if (k == 0) {
    note.innerHTML = `<div class=hws><small>${esc((HW_LB[l.type] || HW_LB.quiz)[0])}</small><p>${esc(info.oque || l.explain || '')}</p></div>`;
    hwType(g, () => nxt(() => hwGo(1, true), 1100));
  } else if (k == 1) {
    if (como.length) { pre.innerHTML = hwMarks(code, tp, como, -1); hwFocus(0); }
    else { pre.innerHTML = hl(code, tp); note.innerHTML = `<div class=hws><small>${esc((HW_LB[l.type] || HW_LB.quiz)[1])}</small><p>${l.type == 'quiz' ? 'Leia o exemplo e pense em como as partes se ligam. Não precisa decorar: na prática você escolhe a resposta.' : esc(l.explain || '')}</p></div>`; nxt(() => hwGo(2, true), 3200); }
  } else {
    pre.innerHTML = hl(code, tp); const r = hwResHtml(l);
    note.innerHTML = `<div class=hws><small>${esc((HW_LB[l.type] || HW_LB.quiz)[2])}</small><p>${esc(hwRet(l))}</p>${l.type == 'sql' || l.type == 'python' ? '<p class=hwtip>Na teoria você pode mudar este código e rodar de verdade.</p>' : ''}</div>`;
    res.innerHTML = r; requestAnimationFrame(() => res.classList.add('on')); h.auto = false;
  }
}
function hwFocus(i, manual) {   // acende o pedaço i do código e mostra o que ele faz
  if (!hwAlive()) return; const h = S.hw, l = S.cur, como = hwHas(l) ? l.como : [], c = como[i]; if (!c) return;
  if (manual) { h.auto = false; clearTimeout(h.t); h.gen++; }
  h.i = i; document.querySelectorAll('.hm').forEach((m, j) => m.classList.toggle('on', j == i));
  const last = i == como.length - 1;
  $('#hwNote').innerHTML = `<div class=hws><small>Parte ${i + 1} de ${como.length}</small><p>${inlTxt(c.d)}</p></div>
  <div class=hwnav><button class="btn ghost" onclick="hwFocus(${i - 1},1)"${i ? '' : ' disabled'}>${ic('back', 15)}Antes</button><button class="btn ghost" onclick="${last ? 'hwGo(2)' : `hwFocus(${i + 1},1)`}">${last ? 'Ver o resultado' : 'Depois'}${ic('arrow', 15)}</button></div>`;
  if (h.auto && !hwReduce()) { const g = h.gen; h.t = setTimeout(() => { if (!hwAlive() || h.gen != g || !h.auto) return; last ? hwGo(2, true) : hwFocus(i + 1); }, 2300 + c.d.length * 30); }
}
// "Na atividade de prática": a tabela em que o aluno vai trabalhar (só aqui, longe do exemplo) e as explicações de como usar e do que vai aparecer na tela
const praticaInfo = l => { const t = tblFor(l, 'A tabela desta lição'), c = infoCards(l.info, ['como', 'retorno']); return t || c ? `<div class=infot>Na atividade de prática</div>${t}${c}` : ''; };
// ler / explicar o código: as tabelas que o código usa (o servidor já separa) e onde estão os dados
const tblRd = r => r && r.tables && r.tables.length ? tblCard(r.tables, { title: r.tables.length > 1 ? 'Tabelas usadas no código' : 'Tabela usada no código', more: 'Os dados dela aparecem logo abaixo do código.' }) : '';

// ============================================================ TUTORIAL DA PRIMEIRA ATIVIDADE
// Na primeira vez que o aluno abre cada tela de uma lição 1 (teoria, executar, ler, explicar), o guia mostra onde fica cada coisa e como funciona.
// Quem já concluiu lições daquele curso não vê. O botão "?" no topo da tela reabre o tutorial quando o aluno quiser.
const tutBtn = '<button class="ibtn tuthelp" onclick="tutorial(true)" aria-label="Como funciona esta tela (tutorial)">?</button>';
const tutId = () => S.step == 'ler' ? 'r' : S.step == 'exp' ? 'e' : S.step == 'teoria' ? 't' : 'x';
const tutKey = l => 'tut-' + l.type + '-' + tutId();
const tutDue = l => !!l && !isTest(l) && l.n == 1 && !LS.get(tutKey(l)) && !(S.ls || []).some(m => m.track == l.track && S.me.done[m.id]);
const tutAuto = () => { const l = S.cur; if (tutDue(l)) setTimeout(() => { if (S.cur === l && !$('.tour')) tutorial(); }, 450); };
function tutSteps(l) {
  const id = tutId(), T = l.type, py = T == 'python', sql = T == 'sql', ed = py || sql || T == 'dax', m = rowOf(l.id) || {}, N = actOrd(m).length, nms = actOrd(m).map(a => actNm(l, a).toLowerCase());
  const what = py ? 'código em Python' : sql ? 'consulta em SQL' : T == 'dax' ? 'fórmula em DAX' : T == 'excel' ? 'planilha com fórmulas' : 'resposta';
  const hi = { t: 'Oi! Eu sou ' + esc(gnm()), p: {
    t: 'Toda lição começa com uma <b>teoria rápida</b>. Em menos de 1 minuto eu mostro onde fica cada coisa. Se preferir, toque em <b>Pular</b>: dá para rever depois no botão <b>?</b> do topo.',
    x: `Esta é a <b>prática</b>: aqui você escreve ${/^[aeiou]/.test(what) ? 'uma' : 'um'} ${what} de verdade. Vou mostrar onde fica cada coisa e como funciona. Se preferir, toque em <b>Pular</b>: dá para rever depois no botão <b>?</b> do topo.`,
    r: 'Nesta atividade você <b>lê um código que já está pronto</b> e responde o que ele faz. Vou mostrar onde fica cada coisa. Dá para rever depois no botão <b>?</b> do topo.',
    e: 'Nesta atividade você <b>explica com as suas palavras</b> o que um código faz. Vou mostrar onde fica cada coisa. Dá para rever depois no botão <b>?</b> do topo.' }[id] };
  const top = { sel: '.c .top', t: 'Seu progresso', p: `O <b>X</b> fecha a lição e volta ao mapa. A barra mostra quanto do curso você já andou, e o número é a lição em que você está: <b>${l.n} de 30</b>.` };
  const stp = { sel: '.steps', t: 'Teoria e prática', p: id == 't' ? 'Toda lição tem três etapas: <b>Como funciona</b> (que você já viu), a <b>Teoria</b> (onde você está agora) e a <b>Prática</b>, onde você escreve e confere. Tocar numa etapa leva até ela.' : 'Toda lição tem três etapas: <b>Como funciona</b> e <b>Teoria</b>, que você já viu, e a <b>Prática</b>, onde você está agora. O botão <b>Teoria</b>, logo abaixo, leva de volta se precisar relembrar.' };
  const task = { sel: '.task', t: id == 'x' ? 'O desafio' : 'A pergunta', p: id == 'x' ? 'Aqui fica o que você precisa fazer. Leia com calma antes de começar a escrever.' : 'Aqui está o que querem saber sobre o código. Leia com calma antes de responder.' };
  const names = [...document.querySelectorAll('.tbc .tbn')].map(n => `<b>${esc(n.textContent)}</b>`);   // as tabelas que o cartão da tela está mostrando
  const tbl = { sel: '.tbc', t: names.length > 1 ? 'As tabelas' : 'A tabela', p: `Em SQL, os dados ficam guardados em <b>tabelas</b>, como as da planilha. Este cartão mostra ${names.length ? 'o nome ' + (names.length > 1 ? 'das tabelas' : 'da tabela') + ' (' + listPt(names) + ') e' : 'o nome da tabela e'} as <b>colunas</b> dela, que são os campos que você pode pedir. ${id == 'x' || id == 't' ? 'O nome da tabela vai logo depois da palavra <b>FROM</b>.' : 'O nome dela aparece depois da palavra <b>FROM</b> no código.'}` };
  const fin = { sel: null, t: 'Agora é com você!', p: (N > 1 ? `Esta lição tem <b>${N} atividades</b>: ${listPt(nms)}. Quando as ${N} estiverem feitas, a lição conclui e a próxima abre. ` : '') + 'Ficou com dúvida? Toque no <b>?</b> lá em cima para rever este tutorial.' };
  const relembrar = { sel: '.rdr-th', t: 'Precisa relembrar?', p: 'Toque aqui para abrir de novo a explicação da lição, sem sair da atividade.' };
  if (id == 't') return [hi, top, stp, { sel: '.tutor', t: 'A explicação', p: 'Aqui o guia explica o assunto em poucas palavras. Leia com calma, sem pressa.' },
    labOn(l) ? { sel: '.lab', t: 'O exemplo ao vivo', p: 'Este exemplo é de verdade: <b>mude o código</b> e toque em <b>Rodar</b> para ver o que acontece. Em <b>Experimente</b> eu sugiro uma mudança. Aqui nada vale nota: errar e testar é a melhor forma de aprender.' } : { sel: '.cb', t: 'O exemplo', p: 'Este é um exemplo pronto do que a lição ensina. Ele serve só para ler: na próxima etapa é você quem faz.' }, ...(sql ? [tbl] : []),
    { sel: '.c > .btn.pri.block', t: 'Entendeu? Siga em frente', p: 'Quando terminar de ler, toque em <b>Entendi, ir para a prática</b>. A prática vem com outro tutorial, bem rapidinho.' }];
  if (id == 'x') {
    const AJ = { 'Dica': 'uma pista, sem entregar a resposta', 'Dados': py ? 'os dados da atividade, quando houver' : T == 'dax' ? 'o modelo de dados, com as tabelas' : 'as tabelas com todos os dados que você pode usar', 'Fórmulas': 'mostra as fórmulas das células', 'Solução': 'a resposta pronta (deixe por último!)', 'Teoria': 'volta à explicação da lição', 'Limpar': 'apaga o que você escreveu' };
    const labs = [...document.querySelectorAll('.acts .btn span')].map(s => s.textContent.trim()).filter(k => AJ[k]);
    const box = T == 'excel' ? { sel: '.xs', t: 'A planilha', p: 'As células <b>verdes</b> são as que você preenche. Toque numa célula, escreva a fórmula na barra (<b>fx</b>) e confirme com o ✓ ou com Enter. Depois de <b>=</b> ou <b>(</b>, dá para tocar em outras células para apontar para elas.' }
      : T == 'quiz' ? { sel: '#qzi0', t: 'As perguntas', p: 'Cada pergunta é um cartão numerado. Responda tocando na alternativa certa ou digitando a resposta, quando a pergunta pedir. Pode responder na ordem que quiser.' }
      : { sel: '.ed', t: sql ? 'Onde você escreve a consulta' : py ? 'Onde você escreve o código' : 'Onde você escreve a fórmula', p: py ? 'Toque aqui e escreva o seu código Python. Os números mostram as linhas e as cores ajudam a ler. A tecla <b>Tab</b> faz o recuo.' : sql ? 'Toque aqui e escreva a sua consulta SQL. O que começa com <b>--</b> é só um comentário: o SQL ignora, pode apagar. A tecla <b>Tab</b> faz o recuo.' : 'Toque aqui e escreva a fórmula DAX da medida. Os números mostram as linhas e as cores ajudam a ler.' };
    return [hi, top, stp, task, ...(sql ? [tbl] : []), box,
      { sel: '.acts', t: 'As ajudas', p: labs.map(k => `<b>${k}</b>: ${AJ[k]}`).join('<br>') },
      { sel: '.ob', t: py ? 'A saída' : sql ? 'O resultado' : 'Resultado e ajuda', p: py ? 'Aqui aparece a <b>saída</b> do seu código, o que ele mostra na tela. Nada aparece enquanto você digita: só depois de tocar em <b>Concluído</b>.' : sql ? 'Aqui aparece o <b>resultado</b> da sua consulta, em forma de tabela. Nada aparece enquanto você digita: só depois de tocar em <b>Concluído</b>.' : 'Aqui aparecem o resultado e as explicações. Nada aparece enquanto você trabalha: só depois de tocar em <b>Concluído</b>.' },
      { sel: '#bdone', t: 'Concluído: é aqui que roda', p: `Quando terminar, toque em <b>Concluído</b>${ed ? ' (no computador: Ctrl+Enter)' : ''}. Só nesse momento o app ${py || sql ? 'roda o seu código e ' : ''}confere a resposta. <b>Acertou:</b> você ganha XP e segue em frente. <b>Errou:</b> eu mostro o que faltou e você tenta de novo, sem perder nada.` }, fin];
  }
  const code = { sel: '.cb, .xs', t: 'O código', p: 'Ele já está pronto: você não escreve nada aqui. Leia linha por linha e pense no que ele faz.' + (sql ? ' Os dados da tabela aparecem logo abaixo.' : '') };
  if (id == 'r') return [hi, task, ...(sql ? [tbl] : []), code,
    { sel: '.rdr-opts, .qz-num, #rdin', t: 'A sua resposta', p: S.rd && S.rd.k == 'mc' ? 'Toque na alternativa que você acha certa.' : 'Digite a resposta aqui, do jeito que o código mostraria.' },
    { sel: '#bdone', t: 'Conferir', p: 'Marque a resposta e toque em <b>Conferir</b>. Se errar, aparece uma explicação e você pode tentar de novo: aqui errar não gasta nada.' }, relembrar, fin];
  return [hi, task, ...(sql ? [tbl] : []), code,
    { sel: '#exin', t: 'Sua explicação', p: `Escreva com as suas palavras, como se explicasse para um amigo. Não copie o código. Precisa de pelo menos <b>${(S.rd && S.rd.minw) || 5} palavras</b>.` },
    { sel: '#bdone', t: 'Conferir', p: 'O app confere se você citou as ideias principais e mostra o que ainda falta. Pode tentar de novo: aqui errar não gasta nada.' }, relembrar, fin];
}
function tutorial(force) {
  const l = S.cur; if (!l || $('.tour') || !['teoria', 'pratica', 'ler', 'exp'].includes(S.step) || (isTest(l) && !force)) return;
  const key = tutKey(l), steps = tutSteps(l).filter(s => !s.sel || $(s.sel)), anchor = A.firstElementChild; if (!steps.length || !anchor) return;
  let i = 0, ob; const o = document.createElement('div'); o.className = 'tour tut'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-label', 'Tutorial desta tela');
  document.body.appendChild(o); document.body.classList.add('tutmode');
  const clear = () => document.querySelectorAll('.hl').forEach(x => x.classList.remove('hl'));
  const key2 = e => { if (e.key == 'Escape') end(); else if (e.key == 'ArrowRight') go1(1); else if (e.key == 'ArrowLeft') go1(-1); };
  function end() { LS.set(key, '1'); document.removeEventListener('keydown', key2, true); if (ob) ob.disconnect(); clear(); o.remove(); document.body.classList.remove('tutmode'); if (anchor.isConnected) window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function go1(d) { const n = i + d; if (n < 0) return; if (n >= steps.length) return end(); i = n; show(); }
  function show() {
    const s = steps[i], el = s.sel && $(s.sel), last = i == steps.length - 1; clear();
    o.classList.toggle('up', !!(el && el.closest('.dbar')));   // o botão Concluído fica fixo embaixo: o cartão do guia vai para cima
    o.innerHTML = `<div class=tb2><button class=tutx id=tkSkip>${last ? 'Fechar' : 'Pular'}</button><div class=tr1>${mascot(56, 'ring')}<div><h3>${s.t}</h3><p>${s.p}</p></div></div>
      <div class=dots>${steps.map((_, k) => `<i class="${k == i ? 'on' : ''}"></i>`).join('')}</div>
      <div class=row>${i ? '<button class="btn ghost" id=tkBack>Voltar</button>' : ''}<button class="btn pri" id=tkNext>${last ? 'Entendi, vamos lá!' : i ? 'Próximo' : 'Mostrar onde fica cada coisa'}</button></div></div>`;
    $('#tkNext').onclick = () => go1(1); $('#tkSkip').onclick = end; const bk = $('#tkBack'); if (bk) bk.onclick = () => go1(-1);
    if (el) {
      el.classList.add('hl');
      if (!el.closest('.dbar')) {   // leva o item para a parte de cima da tela, acima do cartão do guia
        const r = el.getBoundingClientRect(), avail = innerHeight - o.firstElementChild.offsetHeight - 56, want = r.height <= avail ? 16 + (avail - r.height) / 2 : 16;
        window.scrollTo({ top: Math.max(0, r.top + scrollY - want), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      }
    }
  }
  ob = new MutationObserver(() => { if (!anchor.isConnected) end(); }); ob.observe(A, { childList: true });
  document.addEventListener('keydown', key2, true);
  show();
}

function lesson() {   // etapa 1: teoria
  delete document.body.dataset.calm;
  const l = S.cur; theme(l.track); S.step = 'teoria'; clearTimeout(LT);
  A.innerHTML = `<div class=c><div class=top><button class=ibtn onclick="go('home')" aria-label="Fechar">${ic('x', 20)}</button><div class=bar><i style="width:${(l.proj ? l.n : l.n - 1) / 30 * 100}%"></i></div><b class=hearts style="color:var(--acc)">${l.n}/30</b>${tutBtn}</div>
  ${l.proj ? steps(1, true) : steps(2)}<div class=crumb>${tg(l.track, 24)}<span>${TN[l.track]} · ${esc(l.level)} · ${l.proj ? 'Projeto · depois da lição ' + l.after : 'Lição ' + l.n + ' de 30'}</span></div><h2 class=ttl>${esc(l.title)}</h2>
  <div class=tutor>${poseChip('explica', 124) ? `<span class=tpz role=img aria-label="${esc(gnm())}">${poseChip('explica', 124)}</span>` : `<img src="${IMG().full}" alt="${esc(gnm())}">`}<div class=sb>${esc(l.info && l.info.oque || l.explain)}</div></div>${infoCards(l.info, ['serve'])}${l.proj ? coverBox(l) : ''}${l.example ? (labOn(l) ? labHtml(l) : codeBox(l.example, lang(l), 'Exemplo') + exResult(l)) : ''}${l.mat ? matHtml(l.mat) : ''}${praticaInfo(l)}${l.type == 'excel' ? `<div class=infot>A planilha da prática</div>${xlPreview(l)}<p class=tn style="text-align:center">As células <b class=gr>verdes</b> são as que você vai preencher.</p>` : ''}
  <p class=tn style="text-align:center">Leia com calma. Na próxima etapa você pratica e, quando terminar, toca em <b>Concluído</b> para conferir.</p>
  <button class="btn pri block" onclick=practice()>Entendi, ir para a prática ${ic('arrow', 16)}</button></div>`;
  window.scrollTo(0, 0); if (labOn(l)) labInit(l); tutAuto();
}
function practice() {   // etapa 2: prática. Nada é executado nem mostrado enquanto o aluno digita: resultado, erro e dicas de correção só aparecem depois que ele toca em Concluído (botão fixo no rodapé)
  document.body.dataset.calm = '1';   // fundo 3D mais leve enquanto o aluno digita
  const l = S.cur, T = isTest(l), ok = T && testDone(l), X = l.type == 'excel', Q = l.type == 'quiz', DX = l.type == 'dax'; theme(l.track); S.step = 'pratica'; S.lt = 0; S.t0 = Date.now(); S.h = 0; clearTimeout(LT);
  const left = l.left ?? l.chances;
  A.innerHTML = `<div class="c pr"><div class=top><button class=ibtn onclick="go('home')" aria-label="Fechar">${ic('x', 20)}</button><div class=bar><i style="width:${(T ? l.after : l.n) / 30 * 100}%"></i></div>${T ? `<b class=hearts id=chh aria-label="${ok ? 'Treino' : left + ' chances'}">${ok ? '' : chHearts(left, l.chances, 20)}</b>` : `<b class=hearts style="color:var(--acc)">${l.n}/30</b>${tutBtn}`}</div>
  ${T ? '' : l.proj ? steps(2, false, true) : steps(3)}<div class=crumb>${tg(l.track, 24)}<span>${esc(l.title)}</span><span class=cdp aria-hidden=true>${poseChip('codando', 40)}</span></div>
  <div class=task>${ic(T ? 'flag' : 'target', 20)}<div><small>${T ? (l.fin ? 'Prova final: use tudo o que você aprendeu desde a lição 1' : `Checkpoint: use o que você aprendeu até a lição ${l.after}`) : l.proj ? 'Projeto' : (rowOf(l.id) || {}).rd ? actTag(l, 'x') : 'Desafio'}</small><div class="tk${String(l.task).length > 170 ? ' long' : ''}">${taskHtml(l.task)}</div></div></div>
  ${tblFor(l, '', 'Toque em <b>Dados</b> para ver as linhas de cada tabela.')}
  ${T ? `<div class=chnote id=chn>${ok ? 'Você já passou nesta prova: pode treinar sem perder nada.' : chanceMsg(left, l)}</div>` : ''}
  ${DX ? daxViewsNote(l) : ''}${X ? xlBox(l) : Q ? qzBox(l) : edBox(l, l.starter)}
  <div class=acts role=toolbar aria-label="Ajudas">${T ? '' : `<button class="btn ghost" onclick=hint()>${ic('bulb', 20)}<span>Dica</span></button>`}${X ? `<button class="btn ghost" id=bfx onclick=xlToggleF() aria-label="Mostrar as fórmulas">${ic('eye', 20)}<span>Fórmulas</span></button>` : Q ? '' : `<button class="btn ghost" onclick=peek() aria-label="Ver dados">${ic('eye', 20)}<span>Dados</span></button>`}${T ? '' : `${Q ? '' : `<button class="btn ghost" onclick=sol()>${ic('key', 20)}<span>Solução</span></button>`}<button class="btn ghost" onclick=lesson()>${ic('file', 20)}<span>Teoria</span></button>`}<button class="btn ghost" onclick=limpar() aria-label="Limpar o código">${ic('eraser', 20)}<span>Limpar</span></button></div>
  ${outBox(X ? OUT0X : Q ? OUT0Q : DX ? OUT0D : OUT0)}
  <div id=fb class="fb idle" aria-live=polite></div></div>
  <div class=dbar><button class="btn ok block" id=bdone onclick=concluir()>${DONE_BTN}</button></div>`;

  if (X) xlInit(l); else if (Q) qzInit(); else {
    editor(l); const ed = $('#ed');
    ed.addEventListener('focus', () => {
      // o texto-guia ("-- escreva sua consulta aqui") some assim que o aluno toca para escrever; se o campo só tem comentários, esvazia
      if (ed.value.split('\n').every(x => /^\s*((--|#|\/\/).*)?$/.test(x))) { ed.value = ''; ed.dispatchEvent(new Event('input')); }
      else if (ed.selectionStart == 0 && ed.selectionEnd == 0) ed.setSelectionRange(ed.value.length, ed.value.length);
    }, { once: true });
  }
  window.scrollTo(0, 0); tutAuto();
}
// texto das chances restantes de uma prova
const chanceMsg = (n, l) => n <= 1 ? `<b>Última chance.</b> Se não acertar, você volta ${l.back} lições para relembrar.` : `Você tem <b>${n} chances</b>. Cada resposta errada gasta uma; sem chances, você volta ${l.back} lições.`;
function hint() { const l = S.cur, o = $('#out'); o.className = 'out'; o.innerHTML = `<div class=hintb>${poseChip('ideia', 52)}${ic('bulb', 16)} <span></span></div>`; o.querySelector('span').textContent = l.hints[Math.min(S.h++, l.hints.length - 1)]; }
function sol() { const o = $('#out'); o.className = 'out'; o.innerHTML = `<div class=tn style="margin:0 0 6px">Solução</div><pre class=inl>${hl(niceSql(S.cur.solution, S.cur.type), S.cur.type)}</pre>`; }   // no Excel, a solução mostra as fórmulas das células

// ---------- correção: o código só é executado e conferido quando o aluno toca em "Concluído" ----------
let LT;
const norm = x => x === null ? 'NULL' : String(x);
function lev(a, b) { const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]); for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] == b[j - 1] ? 0 : 1)); return d[a.length][b.length]; }
function similar(w, list) { w = w.toLowerCase(); let best = null, bd = 3; for (const x of list) { if (x.toLowerCase() == w) return null; const d = lev(w, x.toLowerCase()); if (d < bd) { bd = d; best = x; } } return best; }
function setFb(st, html, extra) {
  const f = $('#fb'); if (!f) return; f.className = 'fb ' + st;
  if (st == 'idle') f.innerHTML = '';
  else f.innerHTML = `<div class=fbh>${ic(st == 'err' ? 'x' : 'info', 22)} <b>${st == 'err' ? 'Tem um erro no código' : st == 'srv' ? 'O corretor não respondeu' : 'Ainda não está certo'}</b>${st == 'bad' || st == 'err' ? `<span class=fbc>${poseChip(st == 'err' ? 'ops' : 'pensando', 70)}</span>` : ''}</div>${html}`;
  if (st == 'bad' || st == 'err') { S.combo = 0; sfx('bad'); }
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
async function diagSql(l, code, raw, missing, view) {   // view: resultado esperado vindo do servidor (nas provas a solução não vem para o navegador)
  let exp = view; if (!exp) { await loadSql(); const db = new S.SQL.Database(); db.run(l.seed); const ex = db.exec(l.solution); exp = ex[ex.length - 1] || { columns: [], values: [] }; }
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
  const l = S.cur, X = l.type == 'excel', Q = l.type == 'quiz', DX = l.type == 'dax', SRV = X || Q || DX, ed = X ? $('#xin') : Q ? $('#qzbox') : $('#ed'); if (!ed || S.step != 'pratica' || S.busy) return;
  if (X && !xlCommit()) return;                                   // o que está sendo digitado na barra de fórmulas entra na célula antes de conferir
  const code = X ? xlCode() : Q ? qzCode() : ed.value, id = ++S.lt, o = $('#out'), b = $('#bdone'), fb = $('#fb'); if (DX) S.daxCode = code;
  if (X ? xlEmpty() : Q ? qzEmpty() : !code.replace(DX ? /(--|\/\/)[^\n]*/g : /(--|#)[^\n]*/g, '').trim()) return setFb('bad', fixit(0, '', [X ? 'Preencha as células <b>verdes</b> com fórmulas e depois toque em <b>Concluído</b>.' : Q ? 'Responda pelo menos uma pergunta e depois toque em <b>Concluído</b>.' : 'Escreva sua resposta no editor e depois toque em <b>Concluído</b>.']));
  S.busy = true; if (b) { b.disabled = true; b.innerHTML = '<span class=spin></span> Conferindo…'; } if (fb) fb.classList.add('stale');   // o botão só troca o texto: não muda de tamanho nem de lugar
  try {
    let r, err = null;
    try { r = SRV ? { out: '', html: '' } : l.type == 'sql' ? await runSql(l, code) : await runPy(l, code, () => id != S.lt); }   // Excel, DAX e quiz: nada roda aqui, o servidor calcula e confere
    catch (e) {
      if (e.message == 'STALE') return setFb('idle');
      showErr(e);
      // Lição comum (ou prova já vencida): só mostra o erro. Prova valendo: o código que dá erro também é uma resposta errada e gasta uma chance
      // (o servidor reexecuta o código e confirma). Só não gasta quando o ambiente de código nem carregou (OFFLINE): aí a culpa não é do aluno.
      if (!isTest(l) || testDone(l) || e.message == 'OFFLINE') return setFb('err', diagErr(e, code, l));
      err = e; r = { out: '', html: '' };
    }
    if (!err && !SRV) { o.className = 'out'; o.innerHTML = r.html; }
    let s;
    try { s = await api('submit', { body: { id: l.id, code, out: r.out || '' } }); }
    catch (e) { if (e.engine || e.status == 503) return setFb('srv', fixit(0, '', [esc(e.error || 'O servidor não respondeu agora. Toque em Concluído de novo.')])); throw e; }
    const T = isTest(l), before0 = l.left ?? l.chances;
    if (!s.ok) {
      if (T && s.rewind) {                                                             // gastou a última chance: volta algumas lições para relembrar
        if (S.xlKeep) delete S.xlKeep[l.id]; Object.assign(S.me, { done: s.done, cps: s.cps, fails: s.fails }); try { [S.ls, S.cps, S.projs] = await Promise.all([api('lessons'), api('checkpoints'), api('projects')]); } catch { }
        return testFail(s);
      }
      if (X) xlMark(s);
      const tip = err ? diagErr(err, code, l) : X ? (xlDiag(l, s) || fixit(0, '', ['Não consegui ler a planilha. Toque em Concluído de novo.'])) : Q ? qzDiag(l, s) : DX ? daxDiag(l, s) : l.type == 'sql' ? await diagSql(l, code, r.raw, s.missing, s.view) : diagPy(l, r.out, s.expected, s.missing), kind = (err || (DX && s.dx && s.dx.err)) ? 'err' : 'bad';
      if (!T || s.left === undefined || testDone(l)) return setFb(kind, tip);        // lição comum, ou prova já vencida (treino sem perder chance)
      l.left = s.left; const h = $('#chh'), n = $('#chn'); if (h) h.innerHTML = chHearts(s.left, l.chances, 20); if (n) n.innerHTML = chanceMsg(s.left, l);
      return setFb(kind, `<p class=tip>${chHearts(s.left, l.chances, 16)} <b>${s.left == 1 ? 'Resta 1 chance.' : `Restam ${s.left} chances.`}</b></p>` + tip);
    }
    S.lastRes = X ? xlStatic() : Q ? qzStatic() : DX ? daxStatic(l, code) : r.html; if (X && S.xlKeep) delete S.xlKeep[l.id];     // o resultado que o aluno acabou de acertar aparece na tela de conclusão (no Excel, a planilha preenchida)
    const lk0 = {}; [...S.ls, ...(S.cps || []), ...(S.projs || [])].forEach(x => { lk0[x.id] = x.lock; });                                              // o que estava com cadeado antes desta conquista
    const xb = S.me.xp, before = Math.floor(S.me.xp / 100); S.gemsGot = s.gemsGot || 0; Object.assign(S.me, { xp: s.xp, gems: s.gems, days: s.days, own: s.own, cos: s.cos, streak: s.streak, done: s.done, ex: s.ex, cps: s.cps, passed: s.passed, fails: s.fails }); S.tierUp = CR.tierOf(s.xp) > CR.tierOf(xb) ? CR.tierOf(s.xp) : 0;
    S.rdMode = false; S.gained = s.gained; S.used = T ? l.chances - before0 + 1 : 0; S.lvlUp = Math.floor(s.xp / 100) > before ? Math.floor(s.xp / 100) + 1 : 0; try { [S.ls, S.cps, S.projs] = await Promise.all([api('lessons'), api('checkpoints'), api('projects')]); } catch { }
    S.unl = unlocksOf(lk0, xb, s);                                                   // o cartão "Desbloqueado!" da tela de conclusão
    if (l.fin) { try { await new Promise(res => passFx(s, l, res)); } catch { closeOv(true); } testPass(s); return streakLater(s); }   // prova final: tela do troféu e depois o resultado
    try { await okFx(s); } catch { closeOv(true); }          // tela do acerto (1–2 s, toque para pular) e só então o resultado da lição (se a tela falhar, o resultado vem do mesmo jeito)
    S.nAct = 0; if (s.next) resultAct('x', s.next); else result();
    streakLater(s);
  } catch (e) { setFb('idle'); fail(e); }
  finally { S.busy = false; const bb = $('#bdone'); if (bb) { bb.disabled = false; bb.innerHTML = DONE_BTN; } }
}
// Limpar: esvazia o editor e volta ao estado inicial (sem executar nada)
function limpar() {
  if (S.cur && S.cur.type == 'excel') { if (S.busy) return; xlClear(); const o = $('#out'); o.className = 'out'; o.innerHTML = OUT0X; setFb('idle'); return; }
  if (S.cur && S.cur.type == 'quiz') { if (S.busy) return; qzClear(); const o = $('#out'); o.className = 'out'; o.innerHTML = OUT0Q; setFb('idle'); return; }
  const ed = $('#ed'); if (!ed || S.busy) return; ++S.lt; ed.value = ''; ed.dispatchEvent(new Event('input')); ed.focus();
  const o = $('#out'); o.className = 'out'; o.innerHTML = S.cur && S.cur.type == 'dax' ? OUT0D : OUT0; setFb('idle');
}
// O botão Concluído (e o Conferir das outras atividades) fica PARADO no rodapé da tela: é só CSS (position: fixed), sem nenhum código que o mova.
// Quando o teclado do celular está aberto ele fica atrás do teclado, no mesmo lugar; tocar fora do editor fecha o teclado e o botão aparece de novo (veja tapFora).
function tapFora(e) {
  const ed = $('#ed'); if (!ed || document.activeElement !== ed || e.target.closest('.ed, button, a, input, textarea, select, label, [onclick]')) return;
  ed.blur();
}
document.addEventListener('click', tapFora);

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
  const l = S.cur, o = $('#out'); o.className = 'out'; if (l.type == 'excel') return xlToggleF();
  if (l.type == 'dax') { try { o.innerHTML = daxPeek(l); } catch (e) { o.textContent = 'Não consegui mostrar os dados agora.'; } return; }
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

// ============================================================ ATIVIDADE 2 DA LIÇÃO: LER O CÓDIGO
// A lição tem duas atividades: 1) executar (teoria + prática: o aluno escreve e roda) e 2) ler (vê um código pronto e diz o que ele faz).
// A 2 só abre depois da 1; acertando, a lição conclui e a próxima abre. Errar na leitura não gasta nada: dá para tentar de novo.
// uma atividade feita e ainda faltam outras: mostra quantas já foram e leva à próxima (a ordem foi sorteada para esta lição)
const ACT_TX = {
  x: ['executar o código', 'Hora de escrever e rodar um código por conta própria: primeiro uma explicação rápida, depois a prática.', 'pencil'],
  r: ['ler o código', 'Você vai ver um código pronto e dizer o que ele faz. Ler bem é metade de programar bem.', 'eye'],
  e: ['explicar o código', 'Você vai explicar, com as suas palavras, o que um código faz ou o que ele traz como resultado.', 'bulb']
};
function resultAct(a, nxt) {
  delete document.body.dataset.calm;
  const l = S.cur, m = rowOf(l.id) || {}, N = actOrd(m).length || 2, dn = actOrd(m).filter(b => actDn(m, b)).length || 1, [nt, nd, ni] = ACT_BY[l.type] ? [ACT_BY[l.type][nxt][0], ACT_BY[l.type][nxt][2], ACT_TX[nxt][2]] : ACT_TX[nxt];
  const tries = a == 'x' ? `<div><b>${S.h}</b><small>dicas usadas</small></div>` : `<div><b>${S.rtries || 1}</b><small>${(S.rtries || 1) == 1 ? 'tentativa' : 'tentativas'}</small></div>`;
  sfx('done'); confetti(30); A.innerHTML = `<div class="c res">${winStage(210, 'Mandou bem!')}<h1>${dn} de ${N} atividades feitas!</h1><p class=sub>Lição ${l.n} de 30 · ${TN[l.track]} ${esc(l.level)} · ${actSh(l, a)}</p>
  <div class=rdr-next><span class=rdr-ni>${ic(ni, 22)}</span><div><b>Agora vem a atividade ${actPos(m, nxt)}: ${nt}</b><small>${nd} Quando as ${N} atividades estiverem feitas, a lição conclui e a próxima abre.</small></div></div>
  <div class=stats3><div><b>+${S.gained}</b><small>XP</small></div>${tries}<div><b>${Math.max(1, Math.round((Date.now() - S.t0) / 1000))}s</b><small>${a == 'x' ? 'na prática' : a == 'r' ? 'lendo' : 'explicando'}</small></div></div>
  ${gemGot()}
  ${resBox()}
  ${S.gained ? '' : '<p class=tn>Você já tinha ganhado os pontos desta atividade.</p>'}
  <button class="btn pri block" onclick="openAct('${l.id}','${nxt}')">Atividade ${actPos(m, nxt)}: ${nt} ${ic('arrow', 16)}</button><button class="btn ghost block" onclick="go('home')">Voltar ao mapa</button><button class="btn ghost block" onclick=lesson()>Rever explicação</button></div>`;
}
// "Precisa relembrar?": a teoria da lição, escondida até o aluno abrir (a ordem das atividades é sorteada, então ele pode cair em ler/explicar antes de executar)
const theoryBox = l => `<details class=rdr-th><summary>${ic('file', 16)} Precisa relembrar? Veja a explicação da lição</summary><div class=rdr-thb><div class=sb>${esc(l.info && l.info.oque || l.explain)}</div>${infoCards(l.info, ['serve', 'como'])}${l.example ? codeBox(l.example, lang(l), 'Exemplo') : ''}${l.mat ? matHtml(l.mat) : ''}</div></details>`;
async function openR(id) {
  const m = S.ls.find(l => l.id == id); if (!m) return;
  if (lockToast(m)) return;
  try { [S.cur, S.rd] = await Promise.all([api('lessons/' + id), api('lessons/' + id + '/read')]); } catch (e) { return fail(e); }
  S.h = 0; S.tries = 0; S.errs = 0; S.lastRes = null; S.unl = null; S.rsel = null; S.rbad = []; S.rtries = 0; S.t0 = Date.now(); readAct();
}
// o texto "por quê" do servidor: `código` vira destaque e quebra de linha vira parágrafo
const whyHtml = t => String(t || '').split('\n').filter(x => x.trim()).map(x => `<p>${esc(x).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')}</p>`).join('');
const dataTables = r => (r.tables || []).map(t => `<div class=rdr-tb><small>Dados da tabela <b>${esc(t.name)}</b></small>${table({ columns: t.cols, values: t.rows })}</div>`).join('');
function readAct() {
  delete document.body.dataset.calm;
  const l = S.cur, r = S.rd, X = l.type == 'excel'; theme(l.track); S.step = 'ler'; S.busy = false; clearTimeout(LT);
  const body = r.k == 'mc'
    ? `<div class=rdr-opts role=group aria-label="Escolha a resposta">${r.opts.map((o, i) => `<button class=rdr-o data-i=${i} onclick="rdPick(${i})"><i class=rdr-k>${'ABCD'[i]}</i><span>${esc(o)}</span></button>`).join('')}</div>`
    : r.k == 'num' ? `<label class=rdr-lb for=rdin>Digite o número:</label><div class=qz-num><input id=rdin class="in rdr-in1" inputmode=decimal autocomplete=off autocapitalize=off spellcheck=false placeholder="Só o número" oninput="rdBtn()">${r.unit ? `<span class=qz-u>${esc(r.unit)}</span>` : ''}</div>`
    : `<label class=rdr-lb for=rdin>Digite a resposta:</label><textarea id=rdin class=rdr-in rows=3 spellcheck=false autocapitalize=off autocomplete=off autocorrect=off placeholder="Escreva exatamente o que o código mostra" oninput="rdBtn()"></textarea>`;
  A.innerHTML = `<div class="c pr"><div class=top><button class=ibtn onclick="go('home')" aria-label="Fechar">${ic('x', 20)}</button><div class=bar><i style="width:${l.n / 30 * 100}%"></i></div><b class=hearts style="color:var(--acc)">${l.n}/30</b>${tutBtn}</div>
  <div class=crumb>${tg(l.track, 24)}<span>${esc(l.title)}</span><span class=cdp aria-hidden=true>${poseChip('pensando', 40)}</span></div>
  <div class=task>${ic('eye', 20)}<div><small>${actTag(l, 'r')}</small>${esc(r.q)}</div></div>
  ${tblRd(r)}
  ${X ? xlRead(r) : (r.code ? codeBox(r.code, r.lang || lang(l), 'Código') : '') + matHtml({ ...r, code: null })}${dataTables(r)}
  ${body}
  <div id=fb class="fb idle" aria-live=polite></div><div id=rdwhy></div>${theoryBox(l)}</div>
  <div class=dbar><button class="btn ok block" id=bdone onclick=rdCheck() disabled>${ic('check', 18)} Conferir</button></div>`;
  window.scrollTo(0, 0); tutAuto();
  const t = $('#rdin'); if (t) t.onkeydown = e => { if ((e.ctrlKey || e.metaKey) && e.key == 'Enter') { e.preventDefault(); rdCheck(); } };
}
function rdBtn() { const b = $('#bdone'), t = $('#rdin'); if (b && S.step == 'ler') b.disabled = S.rd.k == 'mc' ? S.rsel == null : !(t && t.value.trim()); }
function rdPick(i) {
  if (S.busy || S.step != 'ler' || (S.rbad || []).includes(i)) return;
  S.rsel = i; document.querySelectorAll('.rdr-o').forEach(b => b.classList.toggle('sel', +b.dataset.i == i)); rdBtn(); setFb('idle');
}
// terminou uma atividade (ler ou explicar): guarda XP/diamantes/lições que a resposta do servidor trouxe e atualiza o mapa
async function actWon(a, s) {
  const lk0 = {}; [...S.ls, ...(S.cps || []), ...(S.projs || [])].forEach(x => { lk0[x.id] = x.lock; });
  const xb = S.me.xp, before = Math.floor(S.me.xp / 100); S.gemsGot = s.gemsGot || 0;
  Object.assign(S.me, { xp: s.xp, gems: s.gems, days: s.days, own: s.own, cos: s.cos, streak: s.streak, done: s.done, ex: s.ex, cps: s.cps, passed: s.passed, fails: s.fails });
  S.tierUp = CR.tierOf(s.xp) > CR.tierOf(xb) ? CR.tierOf(s.xp) : 0; S.gained = s.gained; S.used = 0; S.lvlUp = Math.floor(s.xp / 100) > before ? Math.floor(s.xp / 100) + 1 : 0; S.rdMode = true; S.lastAct = a; S.rnext = s.next || null;
  try { [S.ls, S.cps, S.projs] = await Promise.all([api('lessons'), api('checkpoints'), api('projects')]); } catch { }
  S.unl = unlocksOf(lk0, xb, s);
}
const actContinue = a => S.rnext ? resultAct(a, S.rnext) : result();
async function rdCheck() {
  const l = S.cur, r = S.rd, b = $('#bdone'); if (S.busy || S.step != 'ler') return;
  const a = r.k == 'mc' ? (S.rsel == null ? null : r.opts[S.rsel]) : ($('#rdin') || {}).value;
  if (a == null || !String(a).trim()) return setFb('bad', fixit(0, '', [r.k == 'mc' ? 'Escolha uma das respostas e toque em <b>Conferir</b>.' : 'Digite a resposta e toque em <b>Conferir</b>.']));
  S.busy = true; if (b) { b.disabled = true; b.innerHTML = '<span class=spin></span> Conferindo…'; }
  try {
    const s = await api('read', { body: { id: l.id, a } });
    S.rtries = s.tries;
    if (!s.ok) {
      S.errs++;
      if (r.k == 'mc') { (S.rbad = S.rbad || []).push(S.rsel); const ob = document.querySelector(`.rdr-o[data-i="${S.rsel}"]`); if (ob) { ob.classList.remove('sel'); ob.classList.add('bad'); ob.disabled = true; } S.rsel = null; }
      setFb('bad', fixit(0, '', [esc(s.hint || 'Leia o código de novo, linha por linha, de cima para baixo, e imagine o que o computador faz em cada uma.')]));
      const f = $('#fb'); if (f) f.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    await actWon('r', s);
    setFb('idle');
    try { await okFx(s); } catch { closeOv(true); }
    rdOk(s); streakLater(s);
  } catch (e) { fail(e); if (b) { b.innerHTML = `${ic('check', 18)} Conferir`; rdBtn(); } }
  finally { S.busy = false; }
}
function rdOk(s) {   // acertou: mostra o porquê (a explicação linha a linha) antes de ir para o resultado
  const r = S.rd; S.step = 'ler-ok';
  if (r.k == 'mc') document.querySelectorAll('.rdr-o').forEach(b => { b.disabled = true; b.classList.remove('sel', 'bad'); if (r.opts[+b.dataset.i] != null && b.dataset.i == String(S.rsel ?? -1)) b.classList.add('good'); });
  const ans = r.k == 'mc' ? null : $('#rdin'); if (ans) ans.readOnly = true;
  const w = $('#rdwhy'); if (w) w.innerHTML = `<div class=rdr-why><div class=rdr-wh>${ic('check', 20)}<b>Isso mesmo!</b>${s.gained ? `<span>+${s.gained} XP</span>` : ''}</div>${whyHtml(s.why)}</div>`;
  const b = $('#bdone'); if (b) { b.disabled = false; b.innerHTML = `Continuar ${ic('arrow', 16)}`; b.onclick = () => actContinue('r'); }
  if (w) w.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ---------- explicar o código (Python/SQL, Intermediário e Avançado): o aluno escreve com as próprias palavras; o servidor confere as ideias principais ----------
async function openE(id) {
  const m = S.ls.find(l => l.id == id); if (!m) return;
  if (lockToast(m)) return;
  try { [S.cur, S.rd] = await Promise.all([api('lessons/' + id), api('lessons/' + id + '/explain')]); } catch (e) { return fail(e); }
  S.h = 0; S.tries = 0; S.errs = 0; S.lastRes = null; S.unl = null; S.rtries = 0; S.exTxt = ''; S.t0 = Date.now(); expAct();
}
const wordsIn = t => (String(t || '').trim().match(/\S+/g) || []).length;
function expAct() {
  delete document.body.dataset.calm;
  const l = S.cur, r = S.rd; theme(l.track); S.step = 'exp'; S.busy = false; clearTimeout(LT);
  A.innerHTML = `<div class="c pr"><div class=top><button class=ibtn onclick="go('home')" aria-label="Fechar">${ic('x', 20)}</button><div class=bar><i style="width:${l.n / 30 * 100}%"></i></div><b class=hearts style="color:var(--acc)">${l.n}/30</b>${tutBtn}</div>
  <div class=crumb>${tg(l.track, 24)}<span>${esc(l.title)}</span><span class=cdp aria-hidden=true>${poseChip('explica', 40)}</span></div>
  <div class=task>${ic('bulb', 20)}<div><small>${actTag(l, 'e')}</small>${esc(r.q)}</div></div>
  ${tblRd(r)}
  ${codeBox(r.code, l.type, 'Código')}${dataTables(r)}
  <label class=rdr-lb for=exin>Sua explicação${r.kind == 'traz' ? ' (o que ele mostra ou traz)' : ' (o que ele faz)'}:</label>
  <textarea id=exin class="rdr-in rdr-ex" rows=5 maxlength=600 spellcheck=true autocapitalize=sentences autocomplete=off placeholder="Escreva como se estivesse explicando para um amigo, com suas palavras. Não copie o código." oninput="expBtn()"></textarea>
  <p class="tn rdr-exn" id=exn>Escreva pelo menos ${r.minw} palavras. Não precisa estar perfeito: errar aqui não gasta nada, e o app mostra o que ainda falta explicar.</p>
  <div id=fb class="fb idle" aria-live=polite></div><div id=rdwhy></div>${theoryBox(l)}</div>
  <div class=dbar><button class="btn ok block" id=bdone onclick=expCheck() disabled>${ic('check', 18)} Conferir</button></div>`;
  window.scrollTo(0, 0); tutAuto();
  const t = $('#exin'); if (t) t.onkeydown = e => { if ((e.ctrlKey || e.metaKey) && e.key == 'Enter') { e.preventDefault(); expCheck(); } };
}
function expBtn() { const b = $('#bdone'), t = $('#exin'); if (b && S.step == 'exp') b.disabled = wordsIn(t && t.value) < 2; }
async function expCheck() {
  const l = S.cur, r = S.rd, b = $('#bdone'), t = $('#exin'); if (S.busy || S.step != 'exp' || !t) return;
  const a = t.value.trim(); if (wordsIn(a) < 2) return setFb('bad', fixit(0, '', ['Escreva a sua explicação e toque em <b>Conferir</b>.']));
  S.busy = true; if (b) { b.disabled = true; b.innerHTML = '<span class=spin></span> Conferindo…'; }
  try {
    const s = await api('explain', { body: { id: l.id, a } });
    S.rtries = s.tries || S.rtries;
    if (!s.ok) {
      S.errs++;
      const tips = s.short ? [`Escreva um pouco mais: use pelo menos ${r.minw} palavras, em uma ou duas frases completas.`]
        : s.copy ? ['Isso é o próprio código. Explique com <b>palavras suas</b> o que ele faz, como se fosse para um amigo que nunca viu programação.']
        : [`<b>Você já cobriu ${s.got} de ${s.total} ideias.</b> ${s.miss.length ? 'Ainda falta explicar:' : ''}`, ...s.miss.map(m => `• ${esc(m)}`), 'Pode editar o texto acima e conferir de novo, sem perder nada.'];
      if (s.model) tips.push(`<b>Um exemplo de boa explicação:</b> ${esc(s.model)}<br><small>Agora escreva a sua, com as suas palavras.</small>`);
      setFb('bad', fixit(0, '', tips));
      const f = $('#fb'); if (f) f.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    await actWon('e', s);
    setFb('idle');
    try { await okFx(s); } catch { closeOv(true); }
    expOk(s); streakLater(s);
  } catch (e) { fail(e); if (b) { b.innerHTML = `${ic('check', 18)} Conferir`; expBtn(); } }
  finally { S.busy = false; }
}
function expOk(s) {
  S.step = 'exp-ok';
  const t = $('#exin'); if (t) t.readOnly = true; const n = $('#exn'); if (n) n.remove();
  const w = $('#rdwhy'); if (w) w.innerHTML = `<div class=rdr-why><div class=rdr-wh>${ic('check', 20)}<b>Boa explicação!</b>${s.gained ? `<span>+${s.gained} XP</span>` : ''}</div><p><b>Um exemplo de como dizer:</b> ${esc(s.model)}</p></div>`;
  const b = $('#bdone'); if (b) { b.disabled = false; b.innerHTML = `Continuar ${ic('arrow', 16)}`; b.onclick = () => actContinue('e'); }
  if (w) w.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function result() {
  delete document.body.dataset.calm;
  if (S.cur.cp) return resultCp();
  if (S.cur.proj) return resultProj();
  const l = S.cur, i = S.ls.findIndex(x => x.id == l.id), nx = S.ls[i + 1] && S.ls[i + 1].track == l.track && S.ls[i + 1].lv == l.lv ? S.ls[i + 1] : null;
  const last = !nx, fin = last ? finOf(l.track, l.lv) : null, needCp = nx && nx.lock == 'cp' ? cpBefore(nx) : null, what = l.type == 'sql' ? 'uma consulta' : l.type == 'excel' ? 'uma planilha' : l.type == 'dax' ? 'fórmulas DAX' : l.type == 'quiz' ? 'uma sequência de perguntas' : 'um programa';
  const btn = last ? (fin && !fin.lock ? `<button class="btn pri block" onclick="openTest('${fin.id}')">${ic('cap', 16)} Fazer a prova final</button>` : '')
    : needCp ? `<button class="btn pri block" onclick="openTest('${needCp.id}')">${ic('flag', 16)} Fazer o checkpoint</button>`
    : `<button class="btn pri block" onclick="openL('${nx.id}')">Próxima lição ${ic('arrow', 16)}</button>`;
  sfx(S.lvlUp || S.tierUp ? 'level' : 'done'); confetti(); A.innerHTML = `<div class="c res">${winStage(230, 'Mandou bem!')}<h1>Lição concluída!</h1><p class=sub>Lição ${l.n} de 30 · ${TN[l.track]} ${esc(l.level)}${(rowOf(l.id) || {}).rd ? ` · as ${actOrd(rowOf(l.id)).length} atividades feitas` : ''}</p>${S.lvlUp ? `<p class=gl>Você subiu para o nível ${S.lvlUp}.</p>` : ''}${unlockCard()}
  ${last ? `<p class=gl>Você terminou as 30 lições de ${esc(l.level)}. Agora faça a <b>prova final</b>: ${what} com tudo o que aprendeu desde o começo. São 3 chances${l.lv < lvs(l.track).length ? ' e, passando, o próximo nível abre' : ' e, passando, você conclui o curso'}.</p>` : ''}
  ${needCp ? `<p class=gl>Checkpoint liberado! Monte ${what} com o que você aprendeu nas lições 1 a ${needCp.after} para abrir a lição ${nx.n}. São 2 chances.</p>` : ''}
  <div class=stats3><div><b>+${S.gained}</b><small>XP</small></div>${S.rdMode ? `<div><b>${S.rtries || 1}</b><small>${(S.rtries || 1) == 1 ? 'tentativa' : 'tentativas'}</small></div>` : `<div><b>${S.h}</b><small>dicas usadas</small></div>`}<div><b>${Math.max(1, Math.round((Date.now() - S.t0) / 1000))}s</b><small>${S.rdMode ? (S.lastAct == 'e' ? 'explicando' : 'lendo') : 'na prática'}</small></div></div>
  ${gemGot()}
  ${resBox()}
  ${S.gained ? '' : '<p class=tn>Você já tinha ganhado os pontos desta lição.</p>'}
  ${btn}<button class="btn ghost block" onclick="go('home')">Voltar ao mapa</button><button class="btn ghost block" onclick=lesson()>Rever explicação</button></div>`;
}

// projeto concluído: o botão leva ao que ele abriu (checkpoint, prova final ou a próxima lição)
function resultProj() {
  const l = S.cur, nx = S.ls.find(x => x.track == l.track && x.lv == l.lv && x.n == l.after + 1), cp = (S.cps || []).find(c => !c.fin && c.track == l.track && c.lv == l.lv && c.after == l.after), fin = l.after == 30 ? finOf(l.track, l.lv) : null;
  const btn = cp && !cp.lock ? `<button class="btn pri block" onclick="openTest('${cp.id}')">${ic('flag', 16)} Fazer o checkpoint</button>` : fin && !fin.lock ? `<button class="btn pri block" onclick="openTest('${fin.id}')">${ic('cap', 16)} Fazer a prova final</button>` : nx && !nx.lock ? `<button class="btn pri block" onclick="openL('${nx.id}')">Próxima lição ${ic('arrow', 16)}</button>` : '';
  sfx(S.lvlUp || S.tierUp ? 'level' : 'cp'); confetti(); A.innerHTML = `<div class="c res">${winStage(230, 'Projeto concluído!', 'cp')}<h1>Projeto concluído!</h1><p class=sub>${TN[l.track]} ${esc(l.level)} · depois da lição ${l.after}</p>${S.lvlUp ? `<p class=gl>Você subiu para o nível ${S.lvlUp}.</p>` : ''}${unlockCard()}
  ${cp && !cp.lock ? `<p class=gl>Agora vem o checkpoint: ${whatT(cp)} com o que você aprendeu. São ${cp.chances} chances.</p>` : fin && !fin.lock ? `<p class=gl>Você terminou as 30 lições e o projeto de ${esc(l.level)}. Agora faça a <b>prova final</b>.</p>` : ''}
  <div class=stats3><div><b>+${S.gained}</b><small>XP</small></div><div><b>${S.h}</b><small>dicas usadas</small></div><div><b>${Math.max(1, Math.round((Date.now() - S.t0) / 1000))}s</b><small>no projeto</small></div></div>
  ${gemGot()}
  ${resBox()}
  ${S.gained ? '' : '<p class=tn>Você já tinha ganhado os pontos deste projeto.</p>'}
  ${btn}<button class="btn ghost block" onclick="go('home')">Voltar ao mapa</button><button class="btn ghost block" onclick=lesson()>Rever o projeto</button></div>`;
}

function resultCp() {
  const l = S.cur, nx = S.ls.find(x => x.track == l.track && x.lv == l.lv && x.n == l.after + 1);
  sfx(S.lvlUp || S.tierUp ? 'level' : 'cp'); confetti(); A.innerHTML = `<div class="c res">${winStage(230, 'Checkpoint conquistado!', 'cp')}<h1>Checkpoint concluído!</h1><p class=sub>${TN[l.track]} ${esc(l.level)} · depois da lição ${l.after}</p>${S.lvlUp ? `<p class=gl>Você subiu para o nível ${S.lvlUp}.</p>` : ''}${unlockCard()}
  <div class=stats3><div><b>+${S.gained}</b><small>XP extra</small></div><div><b>${S.used || 1}/${l.chances}</b><small>tentativas</small></div><div><b>${Math.max(1, Math.round((Date.now() - S.t0) / 1000))}s</b><small>no desafio</small></div></div>
  ${gemGot()}
  ${resBox()}
  ${S.gained ? '' : '<p class=tn>Você já tinha ganhado os pontos deste checkpoint.</p>'}
  ${nx ? `<button class="btn pri block" onclick="openL('${nx.id}')">Próxima lição ${ic('arrow', 16)}</button>` : ''}<button class="btn ghost block" onclick="go('home')">Voltar ao mapa</button></div>`;
}

// ============================================================ PROVAS (resultado)
// prova final aprovada (depois da tela do troféu): libera o próximo nível ou, no último nível, conclui o curso
function testPass(r) {
  delete document.body.dataset.calm;
  const l = S.cur, t = l.track, lv = l.lv, next = lv < lvs(t).length, fin = !!r.trackComplete;
  confetti(); A.innerHTML = `<div class="c res">${winStage(240, fin ? 'Curso concluído! Que orgulho!' : 'Aprovado! Que orgulho!', 'good epic', fin)}<h1>Prova final aprovada!</h1><p class=sub>${TN[t]} ${esc(l.level)}</p>${unlockCard()}
  <div class=stats3><div><b>+${S.gained}</b><small>XP bônus</small></div><div><b>${S.used || 1}/${l.chances}</b><small>tentativas</small></div><div><b>${lvDone(t, lv)}/30</b><small>lições feitas</small></div></div>
  ${gemGot()}
  ${resBox()}
  ${S.gained ? '' : '<p class=tn>Você já tinha ganhado o bônus desta prova.</p>'}
  ${fin ? `<p class=gl>Você concluiu todos os níveis do curso ${TN[t]}. Parabéns!</p>` : ''}
  <button class="btn ${fin ? 'ghost' : 'pri'} block" onclick="S.lv=${next ? lv + 1 : lv};S.scroll=true;go('home')">${next ? 'Ir para o nível ' + LV[lv] : 'Voltar ao mapa'}</button></div>`;
}
// as chances de uma prova acabaram: mostra quais lições voltaram a ficar pendentes
function testFail(s) {
  delete document.body.dataset.calm;
  const l = S.cur, r = s.rewind, ls = S.ls.filter(x => x.track == l.track && x.lv == l.lv && x.n >= r.from && x.n <= r.to), first = ls[0];
  sfx('fail'); window.scrollTo(0, 0); A.innerHTML = `<div class="c res">${stage(270, 'Calma, vamos relembrar!', 'bad', '', 'fail')}<h1 class=bad>Não foi dessa vez</h1><p class=sub>${TN[l.track]} ${esc(l.level)} · ${l.fin ? 'prova final' : 'checkpoint da lição ' + l.after}</p>
  <div class=chances>${chHearts(0, l.chances, 26)}<small>As ${l.chances} chances acabaram</small></div>
  <p class=gl>Para fixar o conteúdo, você volta <b>${r.back} lições</b>: da ${r.from} à ${r.to}. O XP que você já ganhou continua seu e, quando terminar, a prova abre de novo com ${l.chances} chances novas.</p>
  <div class="panel backl"><b>Lições para refazer</b>${ls.map(x => `<div class=bk><span>${x.n}</span>${esc(x.title)}</div>`).join('')}</div>
  ${first ? `<button class="btn pri block" onclick="openL('${first.id}')">Refazer a lição ${r.from} ${ic('arrow', 16)}</button>` : ''}<button class="btn ghost block" onclick="S.lv=${l.lv};S.scroll=true;go('home')">Voltar ao mapa</button></div>`;
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
    const avisoNovo = !!(cf && S.cfg && ann(cf) != ann(S.cfg)), cursosNovo = !!(cf && S.cfg && JSON.stringify(cf.courses) != JSON.stringify(S.cfg.courses));
    if (avisoNovo) S.cfg.announce = cf.announce;
    if (mudou || avisoNovo || cursosNovo) {
      const [ls, cps, pjs] = await Promise.all([api('lessons'), api('checkpoints'), api('projects')]);
      if (!$('.nav')) return;                                               // a pessoa abriu uma lição enquanto buscávamos: deixa para a próxima rodada
      if (cursosNovo) S.cfg.courses = cf.courses;
      const y = scrollY; S.me = me; S.ls = ls; S.cps = cps; S.projs = pjs; render(); scrollTo(0, y);
      if (novo) toast('Seus cursos foram liberados! Todas as lições estão abertas.');
    }
  } catch { } finally { syncing = false; }
}
document.addEventListener('visibilitychange', () => { if (!document.hidden) syncAccess(true); });
// girou o celular ou mudou o tamanho da janela: o mapa (cenário e cartão da lição) é desenhado para a largura da tela, então se refaz na tela do mapa
let rzT = 0;
addEventListener('resize', () => { clearTimeout(rzT); rzT = setTimeout(() => { if (S.tab == 'home' && $('.nav') && $('.tl') && Math.abs(innerWidth - (S.rw || innerWidth)) >= 40) { const y = scrollY; render(); scrollTo(0, y); } }, 300); });
addEventListener('focus', () => syncAccess());
addEventListener('online', () => syncAccess(true));
setInterval(() => syncAccess(), 60e3);

if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => { }));
boot();
