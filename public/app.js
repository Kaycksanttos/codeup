'use strict';
try { const sk = localStorage.getItem('skin'), cl = document.body.classList; if (sk === 'rose') { cl.add('wild'); if (localStorage.getItem('tk')) cl.add('rose'); } else if (sk === 'neo') cl.add('neo'); else if (sk !== '') cl.add('wild'); } catch { document.body.classList.add('wild'); }   // Azul (a floresta azul) é o padrão; '' = Azul escuro; o Rosa só aparece dentro do app (quem ainda não entrou vê sempre o Azul)
const SQLJS_V = '1.10.3', PYO_V = '0.26.4';           // versões das bibliotecas que rodam no navegador
const $ = s => document.querySelector(s), A = $('#app');
const S = { tk: localStorage.tk || null, me: null, ls: [], cfg: { contact: '', company: 'CodeUp', ads: null }, cur: null, h: 0, hearts: 5, tries: 0, errs: 0, gained: 0, lvlUp: 0,
  tab: 'home', rkp: 'semana', rk: null, tierUp: 0, lv: 0, scroll: true, auth: 'login', resetToken: null, SQL: null, pw: null, pyReady: false, busy: false };
const esc = t => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ============================================================ ÍCONES, MASCOTE E DESTAQUE DE CÓDIGO
const IC = {
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
  table: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 4v16M15 4v16"/>'
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
  const m = S.auth, legal = `<p class=legal><a href="/termos" target="_blank">Termos de Uso</a> · <a href="/privacidade" target="_blank">Política de Privacidade</a></p>`;
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
  const hero = m === 'login' || m === 'register' ? `<div class=hero><div class=glow></div><div class=hbrand><h1 class=logo aria-label="CodeUp"><b>Code</b><span>Up</span></h1><p>Python, SQL e Excel do básico ao avançado, com provas.</p></div></div>
    <div class=feat><span>${ic('code', 16)} 210 lições práticas</span><span>${ic('cap', 16)} Níveis com provas</span><span>${ic('gem', 16)} Diamantes e fantasias</span></div>` : `<div class=hero-sm>${mascot(84, 'ring')}<h1 class=logo aria-label="CodeUp"><b>Code</b><span>Up</span></h1></div>`;
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
    let cf; [S.me, S.ls, S.cps, cf] = await Promise.all([api('me'), api('lessons'), api('checkpoints'), api('config').catch(() => null)]);
    if (cf && S.cfg) { S.cfg.announce = cf.announce; S.cfg.courses = cf.courses; }   // comunicado e cursos ativos do dono: atualizam sem precisar recarregar a página
    const g = S.me.guide, l = LS.get('guide');
    if (g && g !== l) LS.set('guide', g);                                   // a conta manda: o mesmo personagem em todos os aparelhos
    const need = [!S.me.sex && 'sex', !S.me.guide && 'guide', !S.me.gname && 'gname'].filter(Boolean);
    if (need.length) return startWizard(need, true);                        // conta sem gênero, personagem e/ou nome do personagem (conta antiga ou criada pelo Google): pergunta uma vez
    if (S.tab == 'rk') { try { S.rk = await api('ranking?p=' + S.rkp); } catch { S.rk = null; } }
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
const ACT_NM = { x: 'Executar o código', r: 'Ler o código', e: 'Explicar o código' }, ACT_SH = { x: 'executar', r: 'ler', e: 'explicar' };
const actOrd = l => String(l && l.ord || '').split('').filter(Boolean);
const actDn = (l, a) => !!(l && (S.me.done[l.id] || String(l.dn || '').includes(a)));
const actNext = l => actOrd(l).find(a => !actDn(l, a)) || null;
const actPos = (l, a) => actOrd(l).indexOf(a) + 1;
const rowOf = id => (S.ls || []).find(x => x.id == id);
// os nomes das atividades mudam com o tipo da lição: DAX (escrever a fórmula / ler a fórmula) e quiz (praticar / ler e interpretar)
const ACT_BY = { dax: { x: ['Escrever a fórmula', 'escrever a fórmula', 'Hora de escrever uma fórmula DAX por conta própria: primeiro uma explicação rápida, depois a prática.'], r: ['Ler a fórmula', 'ler a fórmula', 'Você vai ver uma fórmula pronta e dizer o que ela devolve. Ler bem é metade de escrever bem.'] },
  quiz: { x: ['Praticar com perguntas', 'praticar', 'Hora de responder umas perguntas sobre o que você acabou de aprender: primeiro uma explicação rápida, depois a prática.'], r: ['Ler e interpretar', 'ler e interpretar', 'Você vai olhar um gráfico, uma tabela ou uma fórmula e responder o que ela mostra.'] } };
const actNm = (l, a) => ((ACT_BY[l && l.type] || {})[a] || [])[0] || ACT_NM[a], actSh = (l, a) => ((ACT_BY[l && l.type] || {})[a] || [])[1] || ACT_SH[a];
const actTag = (l, a) => { const m = rowOf(l.id); return m && m.rd ? `Atividade ${actPos(m, a)} de ${actOrd(m).length} · ${actNm(l, a)}` : actNm(l, a); };
const fm = (m, f) => S.me && S.me.sex === 'f' ? f : m;                    // palavra no masculino ou no feminino, conforme o que a pessoa informou
const LV = ['Básico', 'Intermediário', 'Avançado'], TN = { python: 'Python', sql: 'SQL', excel: 'Excel', powerbi: 'Power BI e DAX', dados: 'Análise de Dados e Storytelling' };
const COURSES = ['python', 'sql', 'excel', 'powerbi'];                                   // ordem dos cursos na tela Cursos
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
const chTxt = c => c.left == 1 ? 'última chance' : `${c.left} chances`;                                              // chances que ainda restam numa prova
const finOf = (t, lv) => (S.cps || []).find(c => c.fin && c.track == t && c.lv == lv);                               // prova final do nível
// próximo passo do curso: a lição livre, o checkpoint que precisa ser feito antes das lições 11 e 21 ou, com as 30 lições feitas, a prova final do nível
const nextStep = t => {
  const l = S.ls.find(x => x.track == t && !done(x) && (!x.lock || x.lock == 'cp'));
  if (!l) { const f = (S.cps || []).find(c => c.fin && c.track == t && !passedLv(t, c.lv) && !c.lock); return f ? { cp: f } : null; }
  if (l.lock == 'cp') { const c = cpBefore(l); return c && !c.lock ? { cp: c } : null; }
  return l;
};

const nav = () => `<nav class=nav>${[['home', 'home', 'Início'], ['tr', 'map', 'Cursos'], ['rk', 'crown', 'Ranking'], ['ch', 'trophy', 'Desafios'], ['pf', 'user', 'Perfil']].map(x => `<button class="${S.tab == x[0] ? 'on' : ''}" onclick="go('${x[0]}')">${ic(x[1], 22)}<span>${x[2]}</span></button>`).join('')}</nav>`;

async function resendVerify() { try { const r = await api('resend-verification', { body: {} }); if (r.devVerifyLink) { toast('Modo teste: abrindo o link de confirmação…'); return void (location.href = r.devVerifyLink); } toast(r.already ? 'Seu e-mail já está confirmado.' : 'E-mail enviado! Olhe também a caixa de spam.'); if (r.already) go(); } catch (e) { fail(e); } }
function chooseTrack() {
  theme(null);
  A.innerHTML = `<div class="c auth"><div class=hero-sm><h1 class=logo aria-label="CodeUp"><b>Code</b><span>Up</span></h1></div>${stage(210, 'Qual curso você quer fazer?', '', '', 'think')}
  <h2 style="text-align:center;margin:6px 0 4px">O que você quer aprender?</h2><p class="sub" style="text-align:center">Escolha seu primeiro curso. Cada nível tem 30 lições, 2 checkpoints e uma prova final. O progresso de cada curso é separado: você pode estudar os outros depois.</p>
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
const SOON = [{ n: 'Análise de Dados e Storytelling', d: 'Pandas, gráficos e dados que contam histórias.', c: 'Dados', i: 'code' }];
const CATI = { Todos: 'grid', Programação: 'code', Dados: 'db', Produtividade: 'chart', Outros: 'smile' };
const CATS = () => ['Todos', ...['Programação', 'Dados', 'Produtividade', 'Outros'].filter(c => [...ACTIVE().map(t => CRS[t].c), ...SOON.map(x => x.c)].includes(c))];   // só aparecem categorias que têm curso
const cnorm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const xpTotal = t => S.ls.filter(l => l.track == t).reduce((a, l) => a + l.xp, 0) + (S.cps || []).filter(c => c.track == t && !c.fin).reduce((a, c) => a + c.xp, 0) + lvs(t).reduce((a, lv) => a + 50 * lv, 0);
const xpGot = t => S.ls.filter(l => l.track == t && done(l)).reduce((a, l) => a + l.xp, 0) + (S.cps || []).filter(c => c.track == t && !c.fin && (S.me.cps || []).includes(c.id)).reduce((a, c) => a + c.xp, 0) + lvs(t).filter(lv => passedLv(t, lv)).reduce((a, lv) => a + 50 * lv, 0);
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
    // Depois das lições 10 e 20 entra um CHECKPOINT (prova obrigatória: uma consulta com o que se aprendeu, 2 chances) e, no fim, a PROVA FINAL do nível (3 chances).
    const cpOk = c => (m.cps || []).includes(c.id), cpsLv = (S.cps || []).filter(c => !c.fin && c.track == T && c.lv == lv);
    const rows = []; ls.forEach((l, i) => { rows.push({ l, i }); const c = cpsLv.find(c => c.after == l.n); if (c) rows.push({ c }); });
    const NR = rows.length + 1, MAP = { row: document.body.classList.contains('wild') ? 140 : 170, top: document.body.classList.contains('wild') ? 128 : 100 };
    const X = Array.from({ length: NR }, (_, r) => r < rows.length ? +(50 + 26 * Math.sin((r - 1) * Math.PI / 4)).toFixed(1) : 50);
    const okRow = [...rows.map(r => r.l ? !!done(r.l) : false), passedLv(T, lv)];
    rows.forEach((r, k) => { if (r.c) okRow[k] = cpOk(r.c) || !!okRow[k + 1]; });          // checkpoint pulado não "trava" o caminho aceso
    let pi = 0; while (pi < NR && okRow[pi]) pi++; pi = Math.min(pi, NR - 1);
    const pathSvg = mapSvg(X, pi, MAP);
    const curK = cur >= 0 ? rows.findIndex(r => r.l && r.i == cur) : (c => c >= 0 ? c : finReady ? rows.length : -1)(rows.findIndex(r => r.c && !cpOk(r.c) && !r.c.lock && !done(ls.find(l => l.n == r.c.after + 1) || {})));
    const scene = window.mapScene && document.body.classList.contains('wild') ? mapScene({ X, M: MAP, NR, track: T, cur: curK, W: Math.min(488, innerWidth - 32) }) : '';
    S.rw = innerWidth;
    const WL = document.body.classList.contains('wild'), Wm = Math.min(488, innerWidth - 32), lcard = (k, kick, title) => `<div class=lc style="--lw:${Math.max(96, Math.round((X[k] > 50.5 ? X[k] : 100 - X[k]) * Wm / 100 - 58))}px"><small>${kick}</small><b>${esc(String(title).replace(/^Checkpoint:\s*/i, ''))}</b><em class=lcb>INICIAR</em></div>`;
    const pips = l => {                                                           // o ANEL em volta do círculo: um arco por atividade, na ordem sorteada (2 arcos, ou 3 no Intermediário/Avançado). Arco cheio = atividade feita; anel inteiro = lição completa
      if (!l.rd) return ''; const ord = actOrd(l), dn = !!done(l), nx = dn ? null : actNext(l), nd = ord.filter(a => actDn(l, a)).length;
      const cls = ord.map((a, i) => `r${i + 1}${actDn(l, a) ? 'ok' : a == nx && !l.lock ? 'cur' : ''}`).join(' ');
      return `<i class="rdr-ring n${ord.length} ${cls}" role=img aria-label="${dn ? `As ${ord.length} atividades feitas` : `${nd} de ${ord.length} atividades feitas. Falta ${actSh(l, nx) || ''}`}"></i>`;
    };
    const rowHtml = (r, k) => r.l ? (l => { const i = r.i; return `<div class="ti ${done(l) ? 'ok' : i == cur ? 'cur' : l.lock ? 'lk' : ''}${X[k] > 50.5 ? ' rs' : ''}" style="--i:${k};--x:${X[k]}%" onclick="openL('${l.id}')"><div class=rail>${i == cur && !WL ? '<span class=start>COMEÇAR</span>' : ''}<span class=nd>${done(l) ? ic('check', 28) : l.lock ? ic('lock', 24) : ic('star', 28)}<i class=nn>${l.n}</i>${pips(l)}</span>${i == cur ? walker() + lcard(k, 'Lição ' + l.n + (l.rd ? ' · ' + actOrd(l).length + ' atividades' : ''), l.title) : ''}</div><div class=tb><b>${esc(l.title)}</b><small>Lição ${l.n}${done(l) ? '' : ' · +' + l.xp + ' XP'}</small></div></div>`; })(r.l)
      : (c => { const need = !cpOk(c) && !c.lock && !done(ls.find(l => l.n == c.after + 1) || {}); return `<div class="ti cp ${cpOk(c) ? 'ok' : c.lock ? 'lk' : 'av'}${need ? ' cur' : ''}${X[k] > 50.5 ? ' rs' : ''}" style="--i:${k};--x:${X[k]}%" onclick="openTest('${c.id}')"><div class=rail>${need && !WL ? '<span class=start>COMEÇAR</span>' : ''}<span class=nd>${cpOk(c) ? ic('check', 28) : c.lock ? ic('lock', 24) : ic('flag', 28)}</span>${need ? walker() + lcard(k, 'Checkpoint', c.title) : ''}</div><div class=tb><b>${esc(c.title)}</b><small>${cpOk(c) ? 'Checkpoint concluído' : c.lock ? 'Checkpoint · depois da lição ' + c.after : 'Checkpoint · ' + chTxt(c) + ' · +' + c.xp + ' XP'}</small></div></div>`; })(r.c);
    const prog = `<div class=cprog><div class=ph><span>Progresso em ${TN[T]}</span><b>${pct}%</b></div><div class=segs>${lvs(T).map(x => `<div class=seg><i style="width:${lvPct(T, x)}%"></i></div>`).join('')}</div><div class=sl>${lvs(T).map(x => `<span>${LV[x - 1]}</span>`).join('')}</div></div>`;
    const cont = nx ? (nx.cp ? `<div class="card cont" onclick="openTest('${nx.cp.id}')">${tg(T, 44)}<div class=bd><small class=up>${nx.cp.fin ? 'Prova final · libera o próximo nível' : 'Checkpoint · obrigatório'}</small><b>${esc(nx.cp.title)}</b><small>${TN[T]} · ${LV[nx.cp.lv - 1]} · ${nx.cp.fin ? 'todas as 30 lições' : 'libera a lição ' + (nx.cp.after + 1)}</small></div><span class=go>${ic('arrow', 20)}</span>${prog}</div>`
      : `<div class="card cont" onclick="openL('${nx.id}')">${tg(T, 44)}<div class=bd><small class=up>Continuar</small><b>${esc(nx.title)}</b><small>${TN[T]} · ${LV[nx.lv - 1]} · lição ${nx.n} de 30${nx.rd && actNext(nx) ? ` · atividade ${actPos(nx, actNext(nx))} de ${actOrd(nx).length}: ${ACT_SH[actNext(nx)]}` : ''}</small></div><span class=go>${ic('arrow', 20)}</span>${prog}</div>`) : '';
    const trk = `<div class="card cont tkc"${nx ? ` onclick="${nx.cp ? `openTest('${nx.cp.id}')` : `openL('${nx.id}')`}"` : ''}>${tg(T, 58)}<div class=bd><b>${TN[T]}</b><small>Nível ${lv} · ${LV[lv - 1]}</small><div class=tkb><i style="width:${Math.round(nd / 30 * 100)}%"></i></div></div><div class=tkn><b>${nd}</b>/30</div>${nx ? `<span class=go>${ic('arrow', 20)}</span>` : ''}</div>`;
    h = `${head}${an}${vb}
    ${document.body.classList.contains('wild') ? trk : cont || `<div class=panel>${prog}</div>`}
    <div class=tabs>${[1, 2, 3].map(x => x > lvs(T).length ? `<button class=soon onclick="toast('${LV[x - 1]} de ${TN[T]} chega em breve.')">${ic('lock', 15)}<span>${LV[x - 1]}</span><small>em breve</small></button>` : `<button class="${lv == x ? 'on' : ''}" onclick="S.lv=${x};render()">${lvOpen(T, x) ? (passedLv(T, x) ? ic('check', 15) : bars(x)) : ic('lock', 15)}<span>${LV[x - 1]}</span><small>${lvDone(T, x)}/30</small></button>`).join('')}</div>
    <div class="unit slim"><span class=uflag>${ic('flag', 18)}</span><div><small>NÍVEL ${lv}</small><b>${LV[lv - 1]}</b></div><div class=uc>${nd}/30</div></div>
    ${!open ? `<div class="note">${ic('lock', 18)}<div><b>Nível bloqueado</b><br>Passe na prova final de ${LV[lv - 2]} (30 lições + a prova) para entrar aqui.</div></div>` : ''}
    ${adSlot()}<div class=tl style="--n:${NR};--row:${MAP.row}px;--top:${MAP.top}px">${scene}${pathSvg}${rows.map(rowHtml).join('')}
    <div class="ti exam ${passedLv(T, lv) ? 'ok' : finReady ? 'cur' : 'lk'}" style="--i:${rows.length};--x:50%" onclick="${fin ? `openTest('${fin.id}')` : ''}"><div class=rail>${finReady && !WL ? '<span class=start>COMEÇAR</span>' : ''}<span class=nd>${passedLv(T, lv) ? ic('check', 28) : ic('cap', 28)}</span>${finReady && cur < 0 ? walker() + lcard(rows.length, 'Prova final', LV[lv - 1]) : ''}</div><div class=tb><b>Prova final · ${LV[lv - 1]}</b><small>${passedLv(T, lv) ? 'Aprovado' : finReady ? 'Liberada · ' + (fin ? chTxt(fin) : '3 chances') + ' · libera o próximo nível' : 'Libera ao concluir as 30 lições'}</small></div></div>
</div>`;
  }
  if (S.tab == 'ch') {
    const cpS = c => (m.cps || []).includes(c.id);
    h = `<h2 class=ttl>Desafios</h2><p class=sub>Prova a cada 10 lições, sem dica e sem solução. Passando na prova final, o próximo nível abre.</p>
    <div class="panel rules2"><div class=rl><span class=ri>${ic('flag', 20)}</span><div><b>Checkpoint · lições 10 e 20</b><small>2 chances. Errou as duas, volta 5 lições.</small></div></div><div class=rl><span class=ri>${ic('cap', 20)}</span><div><b>Prova final · lição 30</b><small>3 chances, com tudo desde o começo. Errou as três, volta 10 lições.</small></div></div></div>`
      + ACTIVE().map(t => `<div class=sec>${tg(t, 22)} ${TN[t]}</div>` + lvs(t).map(lv => `<div class=lvh>${bars(lv)} ${LV[lv - 1]}</div>` + (S.cps || []).filter(c => c.track == t && c.lv == lv).sort((a, b) => a.after - b.after).map(c => {
        const ok = c.fin ? passedLv(t, lv) : cpS(c), fl = m.fails[c.fin ? t + '-' + lv : c.id] || 0, lk = !ok && c.lock;
        const st = ok ? (c.fin ? 'Aprovado' : 'Concluído') : lk ? (c.fin ? 'Libera ao concluir as 30 lições' : 'Libera ao concluir a lição ' + c.after) : `${chTxt(c)} de ${c.chances}`;
        return `<div class="card ${lk ? 'lk' : ''}" onclick="openTest('${c.id}')"><span class="ib ${ok ? 'ok' : ''}">${ok ? ic('check', 20) : ic(c.fin ? 'cap' : 'flag', 20)}</span><div class=bd><b>${c.fin ? 'Prova final' : 'Checkpoint · lição ' + c.after}</b><small>${st}${fl ? ' · voltou ' + fl + (fl == 1 ? ' vez' : ' vezes') : ''}</small></div><span class=r>${ok ? 'Feito' : lk ? ic('lock', 16) : 'Fazer'}</span></div>`;
      }).join('')).join('')).join('');
  }
  if (S.tab == 'rk') h = rankView();
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
  A.innerHTML = `<div class=c>${h}${S.tab == 'home' ? '' : adSlot()}</div>${nav()}`; loadAds(); countUp(); if (S.tab == 'tr') cfilter(); if (S.tab == 'home') setTimeout(startTour, 700);
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
  { t: 'Seu menu', p: 'Em Cursos você escolhe entre Python, SQL e Excel. No Ranking você vê sua posição. Em Desafios ficam as provas. No Perfil estão suas conquistas e molduras.', sel: '.nav' }
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
  const av = (r, s) => { const fr = r.frame ? `--fr:${CR.TIERS[r.frame].color};` : '', bg = bgCss(r.bg, r.color && !r.cos && r.color !== CR.BASE[r.guide] ? r.color : ''), st = fr + (bg ? `--bgc:${bg};` : ''); return `<span class=av style="width:${s}px;height:${s}px"><img class="mascot rkav g-${r.guide}${r.frame ? ' fr' : ''}"${st ? ` style="${st}"` : ''} src="${r.cos ? cosPic(r.cos, 'face') : CR.colorFile(r.guide, r.color, true)}" width=${s} height=${s} alt="">${stkBadge(r.sticker, Math.round(s * .45))}</span>`; };
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
function pfRes(L, T) {
  const m = S.me, n = L.filter(done).length, np = Object.keys(m.passed).length;
  const ach = [['target', 'Primeira lição', n >= 1], ['flame', 'Sequência de 3 dias', m.streak >= 3], ['cap', 'Básico aprovado', np >= 1], ['code', 'Intermediário aprovado', COURSES.some(t => passedLv(t, 2))],
    ['trophy', 'Avançado aprovado', COURSES.some(t => passedLv(t, 3))], ['award', 'Curso concluído', COURSES.some(trackPassed)], ['chart', 'Meio caminho', trackPct(T) >= 50], ['bolt', '1.000 XP', m.xp >= 1000]];
  const kp = (i, v, l) => `<div class=kp><span class=kpi>${ic(i, 17)}</span><b>${v}</b><small>${l}</small></div>`;
  return `${pfProg()}<div class=kpg>${kp('flame', m.streak, 'dias de treino') + kp('file', n, 'lições feitas') + kp('cap', np, 'provas aprovadas') + kp('bolt', nf(m.xp), 'XP total') + kp('chart', nf(m.wk), 'XP na semana') + kp('gem', nf(m.gems || 0), 'diamantes')}</div>
    <div class=sec>Conquistas <span class=cnt>${ach.filter(a => a[2]).length} de ${ach.length}</span></div><div class=ach>${ach.map(a => `<div class="${a[2] ? 'on' : ''}">${ic(a[0], 20)}<span>${a[1]}</span></div>`).join('')}</div>
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
      ${row('swap', 'Trocar de curso', "go('tr')", 'Python, SQL, Excel…')}
      ${row('key', m.hasPassword ? 'Alterar senha' : 'Criar senha', 'changePw()')}
      ${row('bulb', 'Rever o tour', "go('home').then(() => startTour(true))")}
      ${row('down', 'Baixar meus dados', 'exportData()')}
      ${row('out', 'Sair', 'logout()')}
    </div>
    <div class=sec>Zona de perigo</div>
    <div class="panel dz"><div class=bd><b>Excluir minha conta</b><small>Apaga seu progresso. Não dá para desfazer.</small></div><button class="btn danger" onclick=delAccount()>${ic('trash', 16)} Excluir</button></div>
    <p class=legal>${S.cfg.contact ? `Precisa de ajuda? <a href="mailto:${esc(S.cfg.contact)}">${esc(S.cfg.contact)}</a><br>` : ''}<a href="/termos" target="_blank">Termos de Uso</a> · <a href="/privacidade" target="_blank">Política de Privacidade</a></p>`;
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

// ============================================================ ANÚNCIOS (Google AdSense)
// Só aparecem se os anúncios estiverem ligados (painel do dono → Ajustes → Anúncios, ou ADSENSE_CLIENT/ADSENSE_SLOT no servidor) e houver o ID do bloco. Ficam em telas de "pausa" (início, cursos, perfil, fim de lição) e NUNCA durante a lição ou a prova.
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
async function logout() { try { await api('logout', { body: {} }); } catch { } S.tk = null; S.awaySeen = 0; localStorage.removeItem('tk'); S.auth = 'login'; showAuth(); }
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
  if (m.lock == 'cp') { const c = cpBefore(m); if (c && !c.lock) { toast('Antes, faça o checkpoint: uma consulta com o que você aprendeu.'); openTest(c.id); return true; } toast('Faça o checkpoint para liberar esta lição.', true); return true; }
  return false;
}
// abrir uma lição: abre a próxima atividade que falta, na ordem sorteada daquela lição (executar, ler ou explicar)
async function openL(id) {
  const m = S.ls.find(l => l.id == id); if (!m) return;
  if (lockToast(m)) return;
  const nx = m.rd && !S.me.done[id] ? actNext(m) : null;
  openAct(id, nx || 'x');
}
const openAct = (id, a) => a == 'r' ? openR(id) : a == 'e' ? openE(id) : openX(id);
async function openX(id) {
  try { S.cur = await api('lessons/' + id); } catch (e) { return fail(e); }
  S.h = 0; S.hearts = 5; S.tries = 0; S.errs = 0; S.lastRes = null; S.unl = null; S.rdMode = false; lesson();
}
const isTest = l => !!(l && (l.cp || l.fin));
// resultado que o aluno acabou de acertar (a tabela do SQL ou a saída do Python), mostrado na tela de conclusão
const resBox = () => S.lastRes ? `<div class="ob resbox"><div class=obh>${ic('check', 14)}<span>${S.cur && (S.cur.type == 'sql' || S.cur.type == 'dax') ? 'Seu resultado' : S.cur && S.cur.type == 'excel' ? 'Sua planilha' : S.cur && S.cur.type == 'quiz' ? 'Suas respostas' : 'Sua saída'}</span></div><div class=out>${S.lastRes}</div></div>` : '';
// Provas: os 2 checkpoints de cada nível (depois das lições 10 e 20, 2 chances) e a prova final (depois da 30, 3 chances). Uma tarefa completa com o que se aprendeu,
// sem teoria, dica nem solução. Acabaram as chances: o aluno volta 5 lições (checkpoint) ou 10 (prova final) para relembrar.
async function openTest(id) {
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

const steps = n => `<div class=steps><span class="${n == 1 ? 'on' : 'ok'}">${n == 1 ? '1' : ic('check', 14)} Teoria</span><i></i><span class="${n == 2 ? 'on' : ''}">2 Prática</span></div>`;
// As 4 explicações de cada atividade (em linguagem de criança de 10 anos): o que é, para que serve, como você vai usar aqui e o que vai aparecer na tela
const INFO_K = { oque: ['O que é', 'info'], serve: ['Para que serve', 'target'], como: ['Como você vai usar aqui', 'pencil'], retorno: ['O que vai aparecer na tela', 'out'] };
const infoCards = (info, keys, title) => { const ks = (keys || Object.keys(INFO_K)).filter(k => info && info[k]); return ks.length ? `${title ? `<div class=infot>${title}</div>` : ''}<div class=infos>${ks.map(k => `<div class="inf ${k}"><div class=ih><span class=ii>${ic(INFO_K[k][1], 17)}</span><b>${INFO_K[k][0]}</b></div><p>${esc(info[k])}</p></div>`).join('')}</div>` : ''; };
function lesson() {   // etapa 1: teoria
  delete document.body.dataset.calm;
  const l = S.cur; theme(l.track); S.step = 'teoria'; clearTimeout(LT);
  A.innerHTML = `<div class=c><div class=top><button class=ibtn onclick="go('home')" aria-label="Fechar">${ic('x', 20)}</button><div class=bar><i style="width:${(l.n - 1) / 30 * 100}%"></i></div><b class=hearts style="color:var(--acc)">${l.n}/30</b></div>
  ${steps(1)}<div class=crumb>${tg(l.track, 24)}<span>${TN[l.track]} · ${esc(l.level)} · Lição ${l.n} de 30</span></div><h2 class=ttl>${esc(l.title)}</h2>
  <div class=tutor>${poseChip('explica', 124) ? `<span class=tpz role=img aria-label="${esc(gnm())}">${poseChip('explica', 124)}</span>` : `<img src="${IMG().full}" alt="${esc(gnm())}">`}<div class=sb>${esc(l.info && l.info.oque || l.explain)}</div></div>${infoCards(l.info, ['serve'])}${l.example ? codeBox(l.example, lang(l), 'Exemplo') : ''}${l.mat ? matHtml(l.mat) : ''}${infoCards(l.info, ['como', 'retorno'], 'Na atividade de prática')}${l.type == 'excel' ? `<div class=infot>A planilha da prática</div>${xlPreview(l)}<p class=tn style="text-align:center">As células <b class=gr>verdes</b> são as que você vai preencher.</p>` : ''}
  <p class=tn style="text-align:center">Leia com calma. Na próxima etapa você pratica e, quando terminar, toca em <b>Concluído</b> para conferir.</p>
  <button class="btn pri block" onclick=practice()>Entendi, ir para a prática ${ic('arrow', 16)}</button></div>`;
  window.scrollTo(0, 0);
}
function practice() {   // etapa 2: prática. Nada é executado nem mostrado enquanto o aluno digita: resultado, erro e dicas de correção só aparecem depois que ele toca em Concluído (botão fixo no rodapé)
  document.body.dataset.calm = '1';   // fundo 3D mais leve enquanto o aluno digita
  const l = S.cur, T = isTest(l), ok = T && testDone(l), X = l.type == 'excel', Q = l.type == 'quiz', DX = l.type == 'dax'; theme(l.track); S.step = 'pratica'; S.lt = 0; S.t0 = Date.now(); S.h = 0; clearTimeout(LT);
  const left = l.left ?? l.chances;
  A.innerHTML = `<div class="c pr"><div class=top><button class=ibtn onclick="go('home')" aria-label="Fechar">${ic('x', 20)}</button><div class=bar><i style="width:${(T ? l.after : l.n) / 30 * 100}%"></i></div>${T ? `<b class=hearts id=chh aria-label="${ok ? 'Treino' : left + ' chances'}">${ok ? '' : chHearts(left, l.chances, 20)}</b>` : `<b class=hearts style="color:var(--acc)">${l.n}/30</b>`}</div>
  ${T ? '' : steps(2)}<div class=crumb>${tg(l.track, 24)}<span>${esc(l.title)}</span><span class=cdp aria-hidden=true>${poseChip('codando', 40)}</span></div>
  <div class=task>${ic(T ? 'flag' : 'target', 20)}<div><small>${T ? (l.fin ? 'Prova final: use tudo o que você aprendeu desde a lição 1' : `Checkpoint: use o que você aprendeu até a lição ${l.after}`) : (rowOf(l.id) || {}).rd ? actTag(l, 'x') : 'Desafio'}</small>${esc(l.task)}</div></div>
  ${T ? `<div class=chnote id=chn>${ok ? 'Você já passou nesta prova: pode treinar sem perder nada.' : chanceMsg(left, l)}</div>` : ''}
  ${DX ? daxViewsNote(l) : ''}${X ? xlBox(l) : Q ? qzBox(l) : edBox(l, l.starter)}
  <div class=acts role=toolbar aria-label="Ajudas">${T ? '' : `<button class="btn ghost" onclick=hint()>${ic('bulb', 20)}<span>Dica</span></button>`}${X ? `<button class="btn ghost" id=bfx onclick=xlToggleF() aria-label="Mostrar as fórmulas">${ic('eye', 20)}<span>Fórmulas</span></button>` : Q ? '' : `<button class="btn ghost" onclick=peek() aria-label="Ver dados">${ic('eye', 20)}<span>Dados</span></button>`}${T ? '' : `${Q ? '' : `<button class="btn ghost" onclick=sol()>${ic('key', 20)}<span>Solução</span></button>`}<button class="btn ghost" onclick=lesson()>${ic('file', 20)}<span>Teoria</span></button>`}<button class="btn ghost" onclick=limpar() aria-label="Limpar o código">${ic('eraser', 20)}<span>Limpar</span></button></div>
  ${outBox(X ? OUT0X : Q ? OUT0Q : DX ? OUT0D : OUT0)}
  <div id=fb class="fb idle" aria-live=polite></div></div>
  <div class=dbar><button class="btn ok block" id=bdone onclick=concluir()>${DONE_BTN}</button></div>`;
  dockBar();
  if (X) xlInit(l); else if (Q) qzInit(); else { editor(l); const ed = $('#ed'); ed.addEventListener('focus', () => { if (ed.selectionStart == 0 && ed.selectionEnd == 0) ed.setSelectionRange(ed.value.length, ed.value.length); }, { once: true }); }
  window.scrollTo(0, 0);
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
        if (S.xlKeep) delete S.xlKeep[l.id]; Object.assign(S.me, { done: s.done, cps: s.cps, fails: s.fails }); try { [S.ls, S.cps] = await Promise.all([api('lessons'), api('checkpoints')]); } catch { }
        return testFail(s);
      }
      if (X) xlMark(s);
      const tip = err ? diagErr(err, code, l) : X ? (xlDiag(l, s) || fixit(0, '', ['Não consegui ler a planilha. Toque em Concluído de novo.'])) : Q ? qzDiag(l, s) : DX ? daxDiag(l, s) : l.type == 'sql' ? await diagSql(l, code, r.raw, s.missing, s.view) : diagPy(l, r.out, s.expected, s.missing), kind = (err || (DX && s.dx && s.dx.err)) ? 'err' : 'bad';
      if (!T || s.left === undefined || testDone(l)) return setFb(kind, tip);        // lição comum, ou prova já vencida (treino sem perder chance)
      l.left = s.left; const h = $('#chh'), n = $('#chn'); if (h) h.innerHTML = chHearts(s.left, l.chances, 20); if (n) n.innerHTML = chanceMsg(s.left, l);
      return setFb(kind, `<p class=tip>${chHearts(s.left, l.chances, 16)} <b>${s.left == 1 ? 'Resta 1 chance.' : `Restam ${s.left} chances.`}</b></p>` + tip);
    }
    S.lastRes = X ? xlStatic() : Q ? qzStatic() : DX ? daxStatic(l, code) : r.html; if (X && S.xlKeep) delete S.xlKeep[l.id];     // o resultado que o aluno acabou de acertar aparece na tela de conclusão (no Excel, a planilha preenchida)
    const lk0 = {}; [...S.ls, ...(S.cps || [])].forEach(x => { lk0[x.id] = x.lock; });                                              // o que estava com cadeado antes desta conquista
    const xb = S.me.xp, before = Math.floor(S.me.xp / 100); S.gemsGot = s.gemsGot || 0; Object.assign(S.me, { xp: s.xp, gems: s.gems, days: s.days, own: s.own, cos: s.cos, streak: s.streak, done: s.done, ex: s.ex, cps: s.cps, passed: s.passed, fails: s.fails }); S.tierUp = CR.tierOf(s.xp) > CR.tierOf(xb) ? CR.tierOf(s.xp) : 0;
    S.rdMode = false; S.gained = s.gained; S.used = T ? l.chances - before0 + 1 : 0; S.lvlUp = Math.floor(s.xp / 100) > before ? Math.floor(s.xp / 100) + 1 : 0; try { [S.ls, S.cps] = await Promise.all([api('lessons'), api('checkpoints')]); } catch { }
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
  <button class="btn pri block" onclick="openAct('${l.id}','${nxt}')">Atividade ${actPos(m, nxt)}: ${nt} ${ic('arrow', 16)}</button><button class="btn ghost block" onclick="go('home')">Voltar ao mapa</button><button class="btn ghost block" onclick=lesson()>Rever explicação</button>${adSlot()}</div>`;
  loadAds();
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
  A.innerHTML = `<div class="c pr"><div class=top><button class=ibtn onclick="go('home')" aria-label="Fechar">${ic('x', 20)}</button><div class=bar><i style="width:${l.n / 30 * 100}%"></i></div><b class=hearts style="color:var(--acc)">${l.n}/30</b></div>
  <div class=crumb>${tg(l.track, 24)}<span>${esc(l.title)}</span><span class=cdp aria-hidden=true>${poseChip('pensando', 40)}</span></div>
  <div class=task>${ic('eye', 20)}<div><small>${actTag(l, 'r')}</small>${esc(r.q)}</div></div>
  ${X ? xlRead(r) : (r.code ? codeBox(r.code, r.lang || lang(l), 'Código') : '') + matHtml({ ...r, code: null })}${dataTables(r)}
  ${body}
  <div id=fb class="fb idle" aria-live=polite></div><div id=rdwhy></div>${theoryBox(l)}</div>
  <div class=dbar><button class="btn ok block" id=bdone onclick=rdCheck() disabled>${ic('check', 18)} Conferir</button></div>`;
  dockBar(); window.scrollTo(0, 0);
  const t = $('#rdin'); if (t) t.onkeydown = e => { if ((e.ctrlKey || e.metaKey) && e.key == 'Enter') { e.preventDefault(); rdCheck(); } };
}
function rdBtn() { const b = $('#bdone'), t = $('#rdin'); if (b && S.step == 'ler') b.disabled = S.rd.k == 'mc' ? S.rsel == null : !(t && t.value.trim()); }
function rdPick(i) {
  if (S.busy || S.step != 'ler' || (S.rbad || []).includes(i)) return;
  S.rsel = i; document.querySelectorAll('.rdr-o').forEach(b => b.classList.toggle('sel', +b.dataset.i == i)); rdBtn(); setFb('idle');
}
// terminou uma atividade (ler ou explicar): guarda XP/diamantes/lições que a resposta do servidor trouxe e atualiza o mapa
async function actWon(a, s) {
  const lk0 = {}; [...S.ls, ...(S.cps || [])].forEach(x => { lk0[x.id] = x.lock; });
  const xb = S.me.xp, before = Math.floor(S.me.xp / 100); S.gemsGot = s.gemsGot || 0;
  Object.assign(S.me, { xp: s.xp, gems: s.gems, days: s.days, own: s.own, cos: s.cos, streak: s.streak, done: s.done, ex: s.ex, cps: s.cps, passed: s.passed, fails: s.fails });
  S.tierUp = CR.tierOf(s.xp) > CR.tierOf(xb) ? CR.tierOf(s.xp) : 0; S.gained = s.gained; S.used = 0; S.lvlUp = Math.floor(s.xp / 100) > before ? Math.floor(s.xp / 100) + 1 : 0; S.rdMode = true; S.lastAct = a; S.rnext = s.next || null;
  try { [S.ls, S.cps] = await Promise.all([api('lessons'), api('checkpoints')]); } catch { }
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
  A.innerHTML = `<div class="c pr"><div class=top><button class=ibtn onclick="go('home')" aria-label="Fechar">${ic('x', 20)}</button><div class=bar><i style="width:${l.n / 30 * 100}%"></i></div><b class=hearts style="color:var(--acc)">${l.n}/30</b></div>
  <div class=crumb>${tg(l.track, 24)}<span>${esc(l.title)}</span><span class=cdp aria-hidden=true>${poseChip('explica', 40)}</span></div>
  <div class=task>${ic('bulb', 20)}<div><small>${actTag(l, 'e')}</small>${esc(r.q)}</div></div>
  ${codeBox(r.code, l.type, 'Código')}${dataTables(r)}
  <label class=rdr-lb for=exin>Sua explicação${r.kind == 'traz' ? ' (o que ele mostra ou traz)' : ' (o que ele faz)'}:</label>
  <textarea id=exin class="rdr-in rdr-ex" rows=5 maxlength=600 spellcheck=true autocapitalize=sentences autocomplete=off placeholder="Escreva como se estivesse explicando para um amigo, com suas palavras. Não copie o código." oninput="expBtn()"></textarea>
  <p class="tn rdr-exn" id=exn>Escreva pelo menos ${r.minw} palavras. Não precisa estar perfeito: errar aqui não gasta nada, e o app mostra o que ainda falta explicar.</p>
  <div id=fb class="fb idle" aria-live=polite></div><div id=rdwhy></div>${theoryBox(l)}</div>
  <div class=dbar><button class="btn ok block" id=bdone onclick=expCheck() disabled>${ic('check', 18)} Conferir</button></div>`;
  dockBar(); window.scrollTo(0, 0);
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
  ${btn}<button class="btn ghost block" onclick="go('home')">Voltar ao mapa</button><button class="btn ghost block" onclick=lesson()>Rever explicação</button>${adSlot()}</div>`;
  loadAds();
}

function resultCp() {
  const l = S.cur, nx = S.ls.find(x => x.track == l.track && x.lv == l.lv && x.n == l.after + 1);
  sfx(S.lvlUp || S.tierUp ? 'level' : 'cp'); confetti(); A.innerHTML = `<div class="c res">${winStage(230, 'Checkpoint conquistado!', 'cp')}<h1>Checkpoint concluído!</h1><p class=sub>${TN[l.track]} ${esc(l.level)} · depois da lição ${l.after}</p>${S.lvlUp ? `<p class=gl>Você subiu para o nível ${S.lvlUp}.</p>` : ''}${unlockCard()}
  <div class=stats3><div><b>+${S.gained}</b><small>XP extra</small></div><div><b>${S.used || 1}/${l.chances}</b><small>tentativas</small></div><div><b>${Math.max(1, Math.round((Date.now() - S.t0) / 1000))}s</b><small>no desafio</small></div></div>
  ${gemGot()}
  ${resBox()}
  ${S.gained ? '' : '<p class=tn>Você já tinha ganhado os pontos deste checkpoint.</p>'}
  ${nx ? `<button class="btn pri block" onclick="openL('${nx.id}')">Próxima lição ${ic('arrow', 16)}</button>` : ''}<button class="btn ghost block" onclick="go('home')">Voltar ao mapa</button>${adSlot()}</div>`;
  loadAds();
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
      const [ls, cps] = await Promise.all([api('lessons'), api('checkpoints')]);
      if (!$('.nav')) return;                                               // a pessoa abriu uma lição enquanto buscávamos: deixa para a próxima rodada
      if (cursosNovo) S.cfg.courses = cf.courses;
      const y = scrollY; S.me = me; S.ls = ls; S.cps = cps; render(); scrollTo(0, y);
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
