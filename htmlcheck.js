'use strict';
// ============================================================================
// CORRETOR DE HTML E CSS (curso "HTML e CSS"): roda só no servidor e nas ferramentas (tools/check-html.js).
// O navegador do aluno só mostra a prévia da página (iframe isolado); quem decide se acertou é este arquivo.
//
// Como funciona (sem biblioteca nenhuma, sem eval e sem expressões regulares perigosas):
//   1) parseHtml()  lê o HTML como o navegador lê: html/head/body implícitos, tags que fecham sozinhas (p, li, td...), tbody automático, entidades;
//   2) parseCss()   lê o CSS: regras, @media, @keyframes, !important, variáveis (var(--x)), calc();
//   3) a cascata calcula o estilo de cada elemento (especificidade, ordem, herança, atalhos como margin/border/background, cores e medidas normalizadas);
//   4) grade() confere a lista de verificações da lição (l.checks) e devolve um item por verificação, com o motivo quando falha.
// Uma verificação (check) é um objeto simples:
//   { s: 'h1', text: 'Meu site' }                                  existe um <h1> com esse texto (sem ligar para acento, maiúscula e espaços)
//   { s: 'li', n: 3 }  { s: 'p', eq: 2 }  { s: 'font', eq: 0 }      pelo menos 3 / exatamente 2 / nenhum
//   { s: 'a', a: { href: 'https://...', target: '_blank' } }       atributos ('*' = qualquer valor não vazio, true = só precisa existir)
//   { s: '.card', css: { 'background-color': 'red', 'padding': '10px' } }   estilo calculado (cores em qualquer forma; atalhos valem; >=, <=, !, ~, ^ comparam)
//   { s: 'a', css: { color: 'red' }, hover: true }                 estilo quando o mouse está em cima
//   { s: 'h1::before', css: { content: '"*"' } }                   pseudo-elemento
//   { s: 'p', all: true, css: {...} }                              TODOS os <p> precisam cumprir
//   { doctype: true }  { src: 'regex' }                             <!DOCTYPE html> / texto no código-fonte (ex.: comentário)
//   { at: 'media' } { at: 'keyframes', name: 'x' }                 existe @media / @keyframes
//   vw: largura da tela simulada (padrão 1024) para testar @media;  d: descrição própria;  m: mensagem própria quando falha.
// ============================================================================

const nt = s => String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();   // texto comparável: sem acento, maiúscula nem espaços sobrando
const MAXLEN = 20000, MAXEL = 3000, MAXRULES = 1500;
const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

// ------------------------------------------------------------------ HTML
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', copy: '©', reg: '®', trade: '™', hellip: '…', mdash: '—', ndash: '–', laquo: '«', raquo: '»', bull: '•', middot: '·', times: '×', divide: '÷', deg: '°', euro: '€', pound: '£', yen: '¥', cent: '¢', hearts: '♥', larr: '←', rarr: '→', uarr: '↑', darr: '↓', check: '✓',
  aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó', uacute: 'ú', Aacute: 'Á', Eacute: 'É', Iacute: 'Í', Oacute: 'Ó', Uacute: 'Ú', agrave: 'à', Agrave: 'À', acirc: 'â', ecirc: 'ê', ocirc: 'ô', Acirc: 'Â', Ecirc: 'Ê', Ocirc: 'Ô', atilde: 'ã', otilde: 'õ', Atilde: 'Ã', Otilde: 'Õ', ccedil: 'ç', Ccedil: 'Ç', uuml: 'ü', ntilde: 'ñ' };
function decode(s) {
  if (s.indexOf('&') < 0) return s;
  return s.replace(/&(#[xX][0-9a-fA-F]{1,6}|#[0-9]{1,7}|[A-Za-z][A-Za-z0-9]{1,9});/g, (m, e) => {
    if (e[0] === '#') { const c = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); return c > 0 && c < 0x110000 && !(c >= 0xd800 && c < 0xe000) ? String.fromCodePoint(c) : '�'; }
    return own(ENT, e) ? ENT[e] : m;
  });
}
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
const RAWTXT = new Set(['script', 'style', 'textarea', 'title']);
const isAl = c => (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');
const isWs = c => c === ' ' || c === '\n' || c === '\t' || c === '\r' || c === '\f';

function tokenize(src) {
  const toks = [], n = src.length; let i = 0;
  const text = s => { if (s) toks.push({ k: 'text', s }); };
  while (i < n) {
    const lt = src.indexOf('<', i);
    if (lt < 0) { text(src.slice(i)); break; }
    if (lt > i) text(src.slice(i, lt));
    i = lt;
    const c1 = src[i + 1] || '';
    if (src.startsWith('<!--', i)) { const e = src.indexOf('-->', i + 4); toks.push({ k: 'comment' }); i = e < 0 ? n : e + 3; continue; }
    if (c1 === '!' || c1 === '?') { const e = src.indexOf('>', i), body = src.slice(i + 2, e < 0 ? n : e); toks.push(/^doctype/i.test(body) ? { k: 'doctype', s: body } : { k: 'comment' }); i = e < 0 ? n : e + 1; continue; }
    if (c1 === '/') {
      if (isAl(src[i + 2] || '')) { let j = i + 2; while (j < n && !isWs(src[j]) && src[j] !== '>' && src[j] !== '/') j++; const e = src.indexOf('>', j); toks.push({ k: 'close', tag: src.slice(i + 2, j).toLowerCase() }); i = e < 0 ? n : e + 1; continue; }
      if (src[i + 2] === '>') { i += 3; continue; }
      const e = src.indexOf('>', i); toks.push({ k: 'comment' }); i = e < 0 ? n : e + 1; continue;
    }
    if (isAl(c1)) {
      let j = i + 1; while (j < n && !isWs(src[j]) && src[j] !== '>' && src[j] !== '/') j++;
      const tag = src.slice(i + 1, j).toLowerCase(), attrs = Object.create(null);
      for (;;) {
        while (j < n && (isWs(src[j]) || src[j] === '/')) j++;
        if (j >= n) break;
        if (src[j] === '>') { j++; break; }
        let a = j; while (j < n && !isWs(src[j]) && src[j] !== '=' && src[j] !== '>' && src[j] !== '/') j++;
        if (j === a) { j++; continue; }
        const name = src.slice(a, j).toLowerCase(); let val = '';
        while (j < n && isWs(src[j])) j++;
        if (src[j] === '=') {
          j++; while (j < n && isWs(src[j])) j++;
          if (src[j] === '"' || src[j] === "'") { const q = src[j], e = src.indexOf(q, j + 1); val = src.slice(j + 1, e < 0 ? n : e); j = e < 0 ? n : e + 1; }
          else { a = j; while (j < n && !isWs(src[j]) && src[j] !== '>') j++; val = src.slice(a, j); }
        }
        if (!(name in attrs)) attrs[name] = decode(val);
      }
      toks.push({ k: 'open', tag, attrs }); i = j;
      if (RAWTXT.has(tag)) {                                      // style, script, title e textarea: o conteúdo é texto puro até a tag de fechamento
        const re = new RegExp('</' + tag + '(?=[\\s/>]|$)', 'ig'); re.lastIndex = i; const m = re.exec(src), e = m ? m.index : n;
        const raw = src.slice(i, e); if (raw) toks.push({ k: 'text', s: tag === 'script' || tag === 'style' ? raw : decode(raw), raw: true });
        if (m) { const g = src.indexOf('>', e); toks.push({ k: 'close', tag }); i = g < 0 ? n : g + 1; } else i = n;
      }
      continue;
    }
    text('<'); i++;
  }
  return toks;
}

const OPT_END = new Set(['p', 'li', 'dt', 'dd', 'tr', 'td', 'th', 'thead', 'tbody', 'tfoot', 'option', 'optgroup', 'colgroup', 'caption', 'html', 'head', 'body', 'rt', 'rp']);
const SPECIAL = new Set('address applet area article aside base basefont bgsound blockquote body br button caption center col colgroup dd details dir div dl dt embed fieldset figcaption figure footer form frame frameset h1 h2 h3 h4 h5 h6 head header hgroup hr html iframe img input keygen li link listing main marquee menu meta nav noembed noframes noscript object ol p param plaintext pre script search section select source style summary table tbody td template textarea tfoot th thead title tr track ul wbr xmp'.split(' '));
const SCOPE_DEF = new Set(['applet', 'caption', 'html', 'table', 'td', 'th', 'marquee', 'object', 'template']);          // "escopo" padrão do HTML5
const SCOPE_STOP = new Set([...SCOPE_DEF, 'button', 'select']);                                                                      // escopo do <p> (o botão também é parede)
const P_CLOSERS = new Set('address article aside blockquote details div dl fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 header hgroup hr main menu nav ol p pre section table ul dd dt li'.split(' '));
const HEAD_TAGS = new Set(['title', 'meta', 'link', 'style', 'script', 'base', 'noscript', 'template']);
const SCOPED_END = new Set('address article aside blockquote button center details dialog dir div dl fieldset figcaption figure footer header hgroup listing main menu nav ol pre search section summary ul'.split(' '));
const FORMAT = new Set(['a', 'b', 'big', 'code', 'em', 'font', 'i', 'nobr', 's', 'small', 'strike', 'strong', 'tt', 'u']);
const NO_RECON = new Set([...P_CLOSERS, 'li', 'dd', 'dt', 'tr', 'td', 'th', 'tbody', 'thead', 'tfoot', 'caption', 'colgroup', 'col', 'option', 'optgroup', 'html', 'body', 'head', 'table']);
const SECTION_OR_TABLE = new Set(['table', 'tbody', 'thead', 'tfoot']), ROW_OR_UP = new Set(['table', 'tbody', 'thead', 'tfoot', 'tr']);
const TABLE_PARTS = new Set(['thead', 'tbody', 'tfoot', 'tr', 'td', 'th', 'caption', 'colgroup']);

// devolve { html, head, body, doctype, errs, all }   (all = os elementos na ordem do documento; errs = tags fechadas errado, para dar dica)
function parseHtml(src) {
  src = String(src == null ? '' : src).slice(0, MAXLEN).replace(/^﻿/, '');
  let ids = 0;
  const mk = (tag, attrs) => ({ t: 1, tag, a: attrs || Object.create(null), kids: [], parent: null, id: ++ids });
  const add = (p, c) => { c.parent = p; p.kids.push(c); return c; };
  const html = mk('html'), head = mk('head'), body = mk('body'); add(html, head); add(html, body);
  const errs = [], stack = [], afl = []; let doctype = false, mode = 0, count = 0, headOpen = null, formPtr = null;   // afl: elementos de formatação (b, i, a...) que o navegador reabre sozinho quando foram fechados fora de ordem   // modo: 0 antes do head, 1 no head, 2 depois do head, 3 no body
  const cur = () => stack.length ? stack[stack.length - 1] : body;
  const merge = (el, attrs) => { for (const k in attrs) if (!(k in el.a)) el.a[k] = attrs[k]; };
  // "marcadores" (null) na lista de formatação: células, legendas e objetos isolam o que foi aberto antes (um <b> de fora não reabre dentro da célula)
  const MARKER_TAGS = new Set(['td', 'th', 'caption', 'applet', 'marquee', 'object']);
  const pop = () => { const e = stack.pop(); if (MARKER_TAGS.has(e.tag)) afl.length = Math.max(0, afl.lastIndexOf(null)); return e; };
  const popTo = (i, fromEnd) => { while (stack.length > i) { const e = pop(); if (fromEnd && !OPT_END.has(e.tag) && !VOID.has(e.tag)) errs.push({ k: 'unclosed', tag: e.tag }); } };
  const closeP = () => { for (let i = stack.length - 1; i >= 0; i--) { const e = stack[i]; if (e.tag === 'p') { popTo(i); return; } if (SCOPE_STOP.has(e.tag)) return; } };
  // dentro de <table>/<tbody>/<tr> só cabem peças de tabela: o resto (texto, <a>, <div>...) o navegador joga para ANTES da tabela ("foster parenting")
  const TBL_CTX = new Set(['table', 'tbody', 'thead', 'tfoot', 'tr']), NOFOSTER = new Set([...TABLE_PARTS, 'col', 'style', 'script', 'template', 'form']);
  const nearMode = () => { for (let i = stack.length - 1; i >= 0; i--) { const t = stack[i].tag; if (t === 'table' || t === 'td' || t === 'th' || t === 'caption') return t; } return null; };   // em que parte da tabela estamos
  const fosterTable = () => { for (let i = stack.length - 1; i >= 0; i--) if (stack[i].tag === 'table') return stack[i]; return null; };
  const push = (tag, attrs) => {
    if (++count > MAXEL) return null;
    const e = mk(tag, attrs), c = cur(); let tb;
    if (TBL_CTX.has(c.tag) && !NOFOSTER.has(tag) && (tb = fosterTable()) && tb.parent) { e.parent = tb.parent; tb.parent.kids.splice(tb.parent.kids.indexOf(tb), 0, e); }
    else add(c, e);
    if (!VOID.has(tag)) stack.push(e); if (MARKER_TAGS.has(tag)) afl.push(null); return e;
  };
  const reconstruct = () => {
    let k = afl.length - 1; if (k < 0 || afl[k] === null || stack.includes(afl[k])) return;
    while (k > 0 && afl[k - 1] !== null && !stack.includes(afl[k - 1])) k--;
    for (; k < afl.length; k++) { const old = afl[k], e = push(old.tag, Object.assign(Object.create(null), old.a)); if (!e) return; afl[k] = e; }
  };
  // "agência de adoção" do HTML5: o que o navegador faz quando uma tag de formatação (b, i, a...) é fechada com outros elementos abertos no meio
  const ADOPT_STOP = new Set(['applet', 'caption', 'html', 'table', 'td', 'th', 'marquee', 'object', 'template']);
  const detach = n => { if (n.parent) { const k = n.parent.kids.indexOf(n); if (k >= 0) n.parent.kids.splice(k, 1); n.parent = null; } };
  const clone = e => mk(e.tag, Object.assign(Object.create(null), e.a));
  const adopt = tag => {                                          // 'none' = não há elemento de formatação ativo; 'ok'; 'err' = erro (fecha-tag sobrando)
    for (let outer = 0; outer < 8; outer++) {
      let fi = -1; for (let k = afl.length - 1; k >= 0 && afl[k] !== null; k--) if (afl[k].tag === tag) { fi = k; break; }
      if (fi < 0) return outer ? 'ok' : 'none';
      const fe = afl[fi], si = stack.indexOf(fe);
      if (si < 0) { afl.splice(fi, 1); return 'err'; }
      for (let k = stack.length - 1; k > si; k--) if (ADOPT_STOP.has(stack[k].tag)) return 'err';
      let fb = -1; for (let k = si + 1; k < stack.length; k++) if (SPECIAL.has(stack[k].tag)) { fb = k; break; }
      if (fb < 0) { popTo(si + 1, true); pop(); const j = afl.indexOf(fe); if (j >= 0) afl.splice(j, 1); return 'ok'; }
      for (let k = si + 1; k < stack.length; k++) if (!OPT_END.has(stack[k].tag) && !VOID.has(stack[k].tag) && !FORMAT.has(stack[k].tag)) errs.push({ k: 'unclosed', tag: stack[k].tag });
      const fbEl = stack[fb], ca = stack[si - 1] || body; let bookmark = fi, last = fbEl, idx = fb, counter = 0;
      for (;;) {
        counter++; idx--; const node = stack[idx];
        if (node === fe) break;
        let j = afl.indexOf(node);
        if (counter > 3 && j >= 0) { afl.splice(j, 1); if (j < bookmark) bookmark--; j = -1; }
        if (j < 0) { stack.splice(idx, 1); continue; }
        const nn = clone(node); afl[j] = nn; stack[idx] = nn;
        if (last === fbEl) bookmark = j + 1;
        detach(last); add(nn, last); last = nn;
      }
      detach(last); { let tb; if (TBL_CTX.has(ca.tag) && (tb = fosterTable()) && tb.parent) { last.parent = tb.parent; tb.parent.kids.splice(tb.parent.kids.indexOf(tb), 0, last); } else add(ca, last); }
      const nfe = clone(fe); for (const k of fbEl.kids) k.parent = nfe; nfe.kids = fbEl.kids; fbEl.kids = []; add(fbEl, nfe);
      const f2 = afl.indexOf(fe); if (f2 >= 0) { afl.splice(f2, 1); if (f2 < bookmark) bookmark--; } afl.splice(bookmark, 0, nfe);
      stack.splice(stack.indexOf(fe), 1); stack.splice(stack.indexOf(fbEl) + 1, 0, nfe);
    }
    return 'ok';
  };
  const stopAt = e => SPECIAL.has(e.tag) && e.tag !== 'address' && e.tag !== 'div' && e.tag !== 'p';
  const startBody = tok => {
    const tag = tok.tag;
    if (tag === 'html') { merge(html, tok.attrs); return; }
    if (tag === 'body') { merge(body, tok.attrs); return; }
    if (tag === 'head') return;
    if (TABLE_PARTS.has(tag)) {                                    // peças de tabela: fora de uma tabela o navegador ignora; dentro, fecha o que estiver aberto até o lugar certo
      const near = nearMode();
      if (!near) { errs.push({ k: 'stray', tag }); return; }
      const upTo = set => { while (stack.length && !set.has(cur().tag)) pop(); };
      if (tag === 'tr') { upTo(SECTION_OR_TABLE); if (cur().tag === 'table') push('tbody', null); }
      else if (tag === 'td' || tag === 'th') { upTo(ROW_OR_UP); if (cur().tag === 'table') { push('tbody', null); push('tr', null); } else if (cur().tag !== 'tr') push('tr', null); }
      else upTo(new Set(['table']));
      push(tag, tok.attrs); return;
    }
    if (tag === 'table' && nearMode() === 'table') { for (let i = stack.length - 1; i >= 0; i--) if (stack[i].tag === 'table') { popTo(i); break; } }
    if (tag === 'form' && formPtr) { errs.push({ k: 'stray', tag }); return; }                          // não existe <form> dentro de <form>
    if (tag === 'select') { for (let i = stack.length - 1; i >= 0; i--) { if (stack[i].tag === 'select') { popTo(i); return; } if (SCOPE_DEF.has(stack[i].tag)) break; } }
    if (P_CLOSERS.has(tag)) closeP();
    if (/^h[1-6]$/.test(tag) && /^h[1-6]$/.test(cur().tag)) popTo(stack.length - 1);
    if (tag === 'li') { for (let i = stack.length - 1; i >= 0; i--) { const e = stack[i]; if (e.tag === 'li') { popTo(i); break; } if (stopAt(e)) break; } }
    else if (tag === 'dd' || tag === 'dt') { for (let i = stack.length - 1; i >= 0; i--) { const e = stack[i]; if (e.tag === 'dd' || e.tag === 'dt') { popTo(i); break; } if (stopAt(e)) break; } }
    else if (tag === 'option' || tag === 'optgroup') { if (cur().tag === 'option' || (tag === 'optgroup' && cur().tag === 'optgroup')) popTo(stack.length - 1); }
    else if (tag === 'button') { for (let i = stack.length - 1; i >= 0; i--) if (stack[i].tag === tag) { popTo(i); break; } }
    else if (tag === 'a') { let old = null; for (let k = afl.length - 1; k >= 0 && afl[k] !== null; k--) if (afl[k].tag === 'a') { old = afl[k]; break; } if (old) { adopt('a'); const k = afl.indexOf(old); if (k >= 0) afl.splice(k, 1); const j = stack.indexOf(old); if (j >= 0) stack.splice(j, 1); } }
    if (!NO_RECON.has(tag)) reconstruct();
    const e = push(tag, tok.attrs); if (e && FORMAT.has(tag)) afl.push(e); if (e && tag === 'form') formPtr = e;
  };
  const closeIn = (match, stops) => {                         // fecha o elemento de baixo para cima até achar o que combina, sem atravessar as "paredes" (stops)
    for (let i = stack.length - 1; i >= 0; i--) { const e = stack[i]; if (match(e)) { popTo(i + 1, true); pop(); return true; } if (stops.has(e.tag)) return false; }
    return false;
  };
  const LI_STOP = new Set([...SCOPE_DEF, 'ol', 'ul']), TBL_STOP = new Set(['html', 'table', 'template']), HEADING = e => /^h[1-6]$/.test(e.tag);
  const endBody = tag => {
    if (tag === 'body' || tag === 'html') return;
    if (tag === 'p') { if (!closeIn(e => e.tag === 'p', SCOPE_STOP)) { errs.push({ k: 'stray', tag }); push('p', null); pop(); } return; }
    if (tag === 'br') { reconstruct(); push('br', null); return; }
    let ok;
    if (tag === 'li') ok = closeIn(e => e.tag === 'li', LI_STOP);
    else if (tag === 'dd' || tag === 'dt') ok = closeIn(e => e.tag === tag, SCOPE_DEF);
    else if (/^h[1-6]$/.test(tag)) ok = closeIn(HEADING, SCOPE_DEF);
    else if (tag === 'form') { const node = formPtr; formPtr = null; const i = node ? stack.indexOf(node) : -1; ok = false; if (i >= 0) { let inScope = true; for (let k = stack.length - 1; k > i; k--) if (SCOPE_DEF.has(stack[k].tag)) { inScope = false; break; } if (inScope) { stack.splice(i, 1); ok = true; } } }
    else if (SCOPED_END.has(tag)) ok = closeIn(e => e.tag === tag, SCOPE_DEF);
    else if (tag === 'table') ok = closeIn(e => e.tag === 'table', new Set(['html', 'template']));
    else if (['td', 'th', 'tr', 'tbody', 'thead', 'tfoot', 'caption', 'colgroup'].includes(tag)) ok = closeIn(e => e.tag === tag, TBL_STOP);
    else if (FORMAT.has(tag) && (ok = adopt(tag)) !== 'none') ok = ok === 'ok';
    else { ok = false; for (let i = stack.length - 1; i >= 0; i--) { const e = stack[i]; if (e.tag === tag) { popTo(i + 1, true); pop(); ok = true; break; } if (SPECIAL.has(e.tag)) break; } }
    if (!ok) errs.push({ k: 'stray', tag });
  };
  for (const tok of tokenize(src)) {
    if (tok.k === 'comment') continue;
    if (tok.k === 'doctype') { if (mode === 0 && /^doctype\s+html/i.test(tok.s.trim())) doctype = true; continue; }
    if (tok.k === 'text') {
      if (headOpen) { if (tok.raw) add(headOpen, { t: 3, s: tok.s }); continue; }
      if (mode < 3) { if (!tok.s.trim()) continue; mode = 3; }
      if (!tok.raw) reconstruct();
      let p = cur(), at = p.kids.length; const tb = TBL_CTX.has(p.tag) && /\S/.test(tok.s) && fosterTable();
      if (tb && tb.parent) { p = tb.parent; at = p.kids.indexOf(tb); }
      const last = p.kids[at - 1];
      if (last && last.t === 3 && !tok.raw && !last.raw) last.s += tok.s; else { const n = { t: 3, s: tok.s, raw: !!tok.raw, parent: p }; p.kids.splice(at, 0, n); }
      continue;
    }
    if (tok.k === 'open') {
      const tag = tok.tag;
      if (mode < 3) {
        if (tag === 'html') { merge(html, tok.attrs); continue; }
        if (tag === 'head') { if (mode === 0) mode = 1; continue; }
        if (tag === 'body') { merge(body, tok.attrs); mode = 3; continue; }
        if (HEAD_TAGS.has(tag)) { if (mode === 0) mode = 1; if (++count > MAXEL) continue; const e = add(head, mk(tag, tok.attrs)); headOpen = RAWTXT.has(tag) ? e : null; continue; }
        mode = 3;
      }
      startBody(tok);
      continue;
    }
    if (tok.k === 'close') {
      const tag = tok.tag;
      if (mode < 3) {
        if (headOpen && tag === headOpen.tag) { headOpen = null; continue; }
        if (tag === 'head') { mode = 2; continue; }
        if (tag === 'body' || tag === 'html' || HEAD_TAGS.has(tag)) continue;
        if (tag === 'br') { mode = 3; endBody(tag); continue; }
        errs.push({ k: 'stray', tag }); continue;
      }
      endBody(tag);
    }
  }
  for (let i = stack.length - 1; i >= 0; i--) if (!OPT_END.has(stack[i].tag) && !VOID.has(stack[i].tag)) errs.push({ k: 'unclosed', tag: stack[i].tag });
  const all = []; (function w(e) { all.push(e); for (const k of e.kids) if (k.t === 1) w(k); })(html);
  return { html, head, body, doctype, errs, all };
}

// ------------------------------------------------------------------ seletores
function splitTop(s, sep) {                       // divide o texto em `sep` fora de parênteses, colchetes e aspas
  const out = []; let d = 0, q = '', last = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === '\\') i++; else if (c === q) q = ''; continue; }
    if (c === '"' || c === "'") q = c; else if (c === '(' || c === '[' || c === '{') d++; else if (c === ')' || c === ']' || c === '}') d--;
    else if (c === sep && d === 0) { out.push(s.slice(last, i)); last = i + 1; }
  }
  out.push(s.slice(last)); return out;
}
const isIdent = c => c !== undefined && (isAl(c) || (c >= '0' && c <= '9') || c === '-' || c === '_' || c > '\x7f' || c === '\\');
function readIdent(s, i) {
  let j = i, out = '';
  while (j < s.length && isIdent(s[j])) { if (s[j] === '\\' && j + 1 < s.length) { out += s[j + 1]; j += 2; } else out += s[j++]; }
  if (j === i) throw new Error('seletor inválido: ' + s);
  return [out, j];
}
function parseNth(a) {
  a = a.trim().toLowerCase().replace(/\s+/g, '');
  if (a === 'odd') return { a: 2, b: 1 }; if (a === 'even') return { a: 2, b: 0 };
  const m = /^([+-]?\d*)n([+-]\d+)?$/.exec(a);
  if (m) return { a: m[1] === '' || m[1] === '+' ? 1 : m[1] === '-' ? -1 : +m[1], b: m[2] ? +m[2] : 0 };
  if (/^[+-]?\d+$/.test(a)) return { a: 0, b: +a };
  throw new Error('nth inválido: ' + a);
}
const PSEUDO_EL = new Set(['before', 'after', 'first-line', 'first-letter', 'placeholder', 'selection', 'marker', 'backdrop']);
const PSEUDO_OK = new Set(['first-child', 'last-child', 'only-child', 'first-of-type', 'last-of-type', 'only-of-type', 'nth-child', 'nth-last-child', 'nth-of-type', 'nth-last-of-type', 'empty', 'root', 'hover', 'active', 'focus', 'focus-within', 'focus-visible', 'link', 'any-link', 'visited', 'checked', 'disabled', 'enabled', 'required', 'optional', 'not', 'is', 'where', 'matches', 'has', 'target', 'read-only', 'read-write', 'placeholder-shown']);
function parseComplex(src) {
  src = src.trim(); if (!src) throw new Error('seletor vazio');
  const parts = [], combs = [], n = src.length; let i = 0, cur = null, pe = null, sa = 0, sb = 0, sc = 0;
  const fresh = () => ({ tag: null, id: null, cls: [], at: [], ps: [] });
  while (i < n) {
    let ws = false; while (i < n && isWs(src[i])) { i++; ws = true; }
    if (i >= n) break;
    const c = src[i];
    if (c === '>' || c === '+' || c === '~') { if (!cur) throw new Error('seletor inválido'); parts.push(cur); combs.push(c); cur = null; i++; continue; }
    if (ws && cur) { parts.push(cur); combs.push(' '); cur = null; }
    if (pe) throw new Error('nada pode vir depois de um pseudo-elemento');
    if (!cur) cur = fresh();
    if (c === '*') { if (cur.tag || cur.id !== null || cur.cls.length || cur.at.length || cur.ps.length) throw new Error('seletor inválido'); cur.tag = '*'; i++; }
    else if (isAl(c) || c === '\\' || c === '_' || c > '\x7f') { if (cur.tag || cur.id !== null || cur.cls.length || cur.at.length || cur.ps.length) throw new Error('seletor inválido'); const [id, j] = readIdent(src, i); cur.tag = id.toLowerCase(); sc++; i = j; }
    else if (c === '#') { const [id, j] = readIdent(src, i + 1); cur.id = id; sa++; i = j; }
    else if (c === '.') { const [id, j] = readIdent(src, i + 1); cur.cls.push(id); sb++; i = j; }
    else if (c === '[') {
      let j = i + 1, d = 0, q = ''; for (; j < n; j++) { const x = src[j]; if (q) { if (x === '\\') j++; else if (x === q) q = ''; } else if (x === '"' || x === "'") q = x; else if (x === ']') break; }
      if (j >= n) throw new Error('colchete sem fechar');
      const m = /^\s*([^\s~|^$*=\]]+)\s*(?:([~|^$*]?=)\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|[^\s\]]+)\s*([is])?)?\s*$/i.exec(src.slice(i + 1, j));
      if (!m) throw new Error('atributo inválido'); let v = m[3]; if (v && (v[0] === '"' || v[0] === "'")) v = v.slice(1, -1);
      cur.at.push({ n: m[1].toLowerCase(), op: m[2] || '', v: v === undefined ? '' : v, ci: /i/i.test(m[4] || '') }); sb++; i = j + 1;
    } else if (c === ':') {
      if (src[i + 1] === ':') { const [id, j] = readIdent(src, i + 2); if (!PSEUDO_EL.has(id.toLowerCase())) throw new Error('pseudo-elemento desconhecido'); pe = id.toLowerCase(); sc++; i = j; continue; }
      const [id0, j0] = readIdent(src, i + 1), id = id0.toLowerCase(); let arg = null, j = j0;
      if ((id === 'before' || id === 'after' || id === 'first-line' || id === 'first-letter') && src[j] !== '(') { pe = id; sc++; i = j; continue; }
      if (src[j] === '(') { let d = 1, q = ''; const a = j + 1; for (j = a; j < n && d > 0; j++) { const x = src[j]; if (q) { if (x === '\\') j++; else if (x === q) q = ''; } else if (x === '"' || x === "'") q = x; else if (x === '(') d++; else if (x === ')') d--; } if (d) throw new Error('parêntese sem fechar'); arg = src.slice(a, j - 1); }
      if (!PSEUDO_OK.has(id)) throw new Error('pseudo-classe desconhecida: ' + id);
      const p = { n: id };
      if (id === 'nth-child' || id === 'nth-last-child' || id === 'nth-of-type' || id === 'nth-last-of-type') { if (arg === null) throw new Error('falta o argumento'); Object.assign(p, parseNth(arg.replace(/\s+of\s+.*$/i, ''))); sb++; }
      else if (id === 'not' || id === 'is' || id === 'matches' || id === 'where') { if (arg === null) throw new Error('falta o argumento'); p.list = splitTop(arg, ',').map(parseComplex); const sp = p.list.map(x => x.spec); if (id !== 'where') { const mx = sp.reduce((m, s) => cmpSpec(s, m) > 0 ? s : m, [0, 0, 0]); sa += mx[0]; sb += mx[1]; sc += mx[2]; } }
      else if (id === 'has') { if (arg === null) throw new Error('falta o argumento'); p.list = splitTop(arg, ',').map(x => { x = x.trim(); const m = /^([>+~])?\s*(.+)$/.exec(x); return { comb: m[1] || ' ', cx: parseComplex(m[2]) }; }); sb++; }
      else { if (arg !== null) throw new Error('essa pseudo-classe não leva argumento'); sb++; }
      cur.ps.push(p); i = j; continue;
    } else throw new Error('seletor inválido perto de "' + src.slice(i, i + 6) + '"');
  }
  if (!cur) throw new Error('seletor termina em combinador');
  parts.push(cur);
  return { parts, combs, pe, spec: [sa, sb, sc], text: src };
}
const cmpSpec = (a, b) => { for (let i = 0; i < Math.max(a.length, b.length); i++) { const d = (a[i] || 0) - (b[i] || 0); if (d) return d; } return 0; };
const parseSelectors = s => splitTop(String(s), ',').map(parseComplex);

const elKids = e => e.kids.filter(k => k.t === 1);
function nthOk(p, idx) { if (p.a === 0) return idx === p.b; const k = (idx - p.b) / p.a; return Number.isInteger(k) && k >= 0; }
function sibIndex(el, ofType, fromEnd) {
  if (!el.parent) return 0;
  let sibs = elKids(el.parent); if (ofType) sibs = sibs.filter(x => x.tag === el.tag); if (fromEnd) sibs = sibs.slice().reverse();
  return sibs.indexOf(el) + 1;
}
function matchPseudo(el, p, ctx) {
  switch (p.n) {
    case 'first-child': return !!el.parent && sibIndex(el, false, false) === 1;
    case 'last-child': return !!el.parent && sibIndex(el, false, true) === 1;
    case 'only-child': return !!el.parent && elKids(el.parent).length === 1;
    case 'first-of-type': return !!el.parent && sibIndex(el, true, false) === 1;
    case 'last-of-type': return !!el.parent && sibIndex(el, true, true) === 1;
    case 'only-of-type': return !!el.parent && elKids(el.parent).filter(x => x.tag === el.tag).length === 1;
    case 'nth-child': return !!el.parent && nthOk(p, sibIndex(el, false, false));
    case 'nth-last-child': return !!el.parent && nthOk(p, sibIndex(el, false, true));
    case 'nth-of-type': return !!el.parent && nthOk(p, sibIndex(el, true, false));
    case 'nth-last-of-type': return !!el.parent && nthOk(p, sibIndex(el, true, true));
    case 'empty': return el.kids.length === 0;
    case 'root': return el.tag === 'html';
    case 'hover': case 'active': case 'focus': return !!(ctx.st && ctx.st.name === p.n && ctx.st.set.has(el));
    case 'focus-visible': return !!(ctx.st && ctx.st.name === 'focus' && ctx.st.set.has(el));
    case 'focus-within': return !!(ctx.st && ctx.st.name === 'focus' && [...ctx.st.set].some(x => { for (let e = x; e; e = e.parent) if (e === el) return true; return false; }));
    case 'link': case 'any-link': return (el.tag === 'a' || el.tag === 'area') && 'href' in el.a;
    case 'visited': case 'target': case 'placeholder-shown': return false;
    case 'checked': return ('checked' in el.a && el.tag === 'input') || (el.tag === 'option' && 'selected' in el.a);
    case 'disabled': return 'disabled' in el.a && ['input', 'button', 'select', 'textarea', 'fieldset', 'option', 'optgroup'].includes(el.tag);
    case 'enabled': return ['input', 'button', 'select', 'textarea', 'fieldset', 'option', 'optgroup'].includes(el.tag) && !('disabled' in el.a);
    case 'required': return 'required' in el.a && ['input', 'select', 'textarea'].includes(el.tag);
    case 'optional': return !('required' in el.a) && ['input', 'select', 'textarea'].includes(el.tag);
    case 'read-only': return !(['input', 'textarea'].includes(el.tag) && !('readonly' in el.a) && !('disabled' in el.a));
    case 'read-write': return ['input', 'textarea'].includes(el.tag) && !('readonly' in el.a) && !('disabled' in el.a);
    case 'not': return !p.list.some(cx => matchComplex(el, cx, cx.parts.length - 1, ctx));
    case 'is': case 'where': case 'matches': return p.list.some(cx => matchComplex(el, cx, cx.parts.length - 1, ctx));
    case 'has': return p.list.some(h => {
      const pool = [];
      if (h.comb === ' ') (function w(e) { for (const k of elKids(e)) { pool.push(k); w(k); } })(el);
      else if (h.comb === '>') pool.push(...elKids(el));
      else if (el.parent) { const sibs = elKids(el.parent), i = sibs.indexOf(el); if (h.comb === '+') { if (sibs[i + 1]) pool.push(sibs[i + 1]); } else pool.push(...sibs.slice(i + 1)); }
      return pool.some(x => matchComplex(x, h.cx, h.cx.parts.length - 1, ctx));
    });
  }
  return false;
}
function matchCompound(el, c, ctx) {
  if (c.tag && c.tag !== '*' && el.tag !== c.tag) return false;
  if (c.id !== null && el.a.id !== c.id) return false;
  if (c.cls.length) { const cl = (el.a.class || '').split(/\s+/); for (const x of c.cls) if (!cl.includes(x)) return false; }
  for (const t of c.at) {
    let v = el.a[t.n]; if (v === undefined) return false;
    if (!t.op) continue;
    let w = t.v; if (t.ci) { v = v.toLowerCase(); w = w.toLowerCase(); }
    if (t.op === '=') { if (v !== w) return false; }
    else if (t.op === '~=') { if (!w || /\s/.test(w) || !v.split(/\s+/).includes(w)) return false; }
    else if (t.op === '|=') { if (v !== w && !v.startsWith(w + '-')) return false; }
    else if (t.op === '^=') { if (!w || !v.startsWith(w)) return false; }
    else if (t.op === '$=') { if (!w || !v.endsWith(w)) return false; }
    else if (t.op === '*=') { if (!w || !v.includes(w)) return false; }
  }
  for (const p of c.ps) if (!matchPseudo(el, p, ctx)) return false;
  return true;
}
function matchComplex(el, cx, i, ctx) {
  if (!matchCompound(el, cx.parts[i], ctx)) return false;
  if (i === 0) return true;
  const comb = cx.combs[i - 1];
  if (comb === '>') return !!el.parent && matchComplex(el.parent, cx, i - 1, ctx);
  if (comb === ' ') { for (let p = el.parent; p; p = p.parent) if (matchComplex(p, cx, i - 1, ctx)) return true; return false; }
  if (!el.parent) return false;
  const sibs = elKids(el.parent), k = sibs.indexOf(el);
  if (comb === '+') return k > 0 && matchComplex(sibs[k - 1], cx, i - 1, ctx);
  for (let j = k - 1; j >= 0; j--) if (matchComplex(sibs[j], cx, i - 1, ctx)) return true;
  return false;
}
function query(page, sel, ctx) {                  // querySelectorAll: elementos na ordem do documento (o pseudo-elemento do final é ignorado)
  const list = parseSelectors(sel); ctx = ctx || {};
  return page.dom.all.filter(el => list.some(cx => matchComplex(el, cx, cx.parts.length - 1, ctx)));
}

// ------------------------------------------------------------------ CSS (leitura)
function stripComments(s) {
  let out = '', i = 0, q = ''; const n = s.length;
  while (i < n) {
    const c = s[i];
    if (q) { out += c; if (c === '\\' && i + 1 < n) { out += s[i + 1]; i += 2; continue; } if (c === q) q = ''; i++; continue; }
    if (c === '"' || c === "'") { q = c; out += c; i++; continue; }
    if (c === '/' && s[i + 1] === '*') { const e = s.indexOf('*/', i + 2); i = e < 0 ? n : e + 2; out += ' '; continue; }
    out += c; i++;
  }
  return out;
}
function scanTo(s, i, stops) {                    // anda até um dos caracteres `stops` fora de aspas e parênteses
  let d = 0, q = '';
  for (; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === '\\') i++; else if (c === q) q = ''; continue; }
    if (c === '"' || c === "'") q = c; else if (c === '(' || c === '[') d++; else if (c === ')' || c === ']') { if (d > 0) d--; }
    else if (d === 0 && stops.includes(c)) return i;
  }
  return s.length;
}
function blockEnd(s, i) {                         // i está em "{": devolve a posição do "}" que fecha
  let d = 0, q = '';
  for (; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === '\\') i++; else if (c === q) q = ''; continue; }
    if (c === '"' || c === "'") q = c; else if (c === '{') d++; else if (c === '}') { d--; if (d === 0) return i; }
  }
  return s.length;
}
function parseDecls(text) {
  const out = [];
  for (const part of splitTop(text, ';')) {
    if (part.indexOf('{') >= 0) continue;
    const k = part.indexOf(':'); if (k < 0) continue;
    let p = part.slice(0, k).trim(), v = part.slice(k + 1).trim(); if (!p || !v) continue;
    if (!p.startsWith('--')) p = p.toLowerCase();
    let imp = false; const m = /!\s*important\s*$/i.exec(v); if (m) { imp = true; v = v.slice(0, m.index).trim(); }
    if (v) out.push({ p, v, imp });
  }
  return out;
}
function parseCss(src) {
  const out = { rules: [], keyframes: Object.create(null), ats: [] }; let ord = 0;
  const run = (s, media) => {
    let i = 0; const n = s.length;
    while (i < n) {
      while (i < n && (isWs(s[i]) || s[i] === '}')) i++;
      if (i >= n) break;
      const j = scanTo(s, i, ';{}'), pre = s.slice(i, j).trim();
      if (j >= n || s[j] !== '{') { i = j + 1; continue; }
      const e = blockEnd(s, j), inner = s.slice(j + 1, e); i = e + 1;
      if (pre[0] === '@') {
        const m = /^@([\w-]+)\s*([\s\S]*)$/.exec(pre); if (!m) continue; const name = m[1].toLowerCase().replace(/^-\w+-/, ''), arg = m[2].trim();
        if (name === 'media') { out.ats.push({ n: 'media', cond: arg }); run(inner, (media || []).concat([arg])); }
        else if (name === 'supports' || name === 'layer' || name === 'container' || name === 'document') run(inner, media);
        else if (name === 'keyframes') { const steps = []; let k = 0; const ks = inner; while (k < ks.length) { while (k < ks.length && (isWs(ks[k]) || ks[k] === '}')) k++; const b = scanTo(ks, k, '{'); if (b >= ks.length) break; const be = blockEnd(ks, b); steps.push({ k: ks.slice(k, b).trim().toLowerCase(), decls: parseDecls(ks.slice(b + 1, be)) }); k = be + 1; } out.keyframes[arg.replace(/^["']|["']$/g, '')] = steps; out.ats.push({ n: 'keyframes', name: arg.replace(/^["']|["']$/g, '') }); }
        else out.ats.push({ n: name });
        continue;
      }
      let sels; try { sels = parseSelectors(pre); } catch { continue; }                 // seletor inválido: o navegador ignora a regra inteira
      const decls = parseDecls(inner);
      for (const cx of sels) { if (out.rules.length >= MAXRULES) break; out.rules.push({ sel: cx, pe: cx.pe, decls, media, ord: ord++ }); }
    }
  };
  run(stripComments(String(src == null ? '' : src).slice(0, MAXLEN)), null);
  return out;
}

// @media: avalia (min-width, max-width, orientation...) para a largura simulada
function lenPx(v, fs) { const m = /^([+-]?(?:\d+\.?\d*|\.\d+))([a-z%]*)$/i.exec(String(v).trim()); if (!m) return null; const u = m[2].toLowerCase(), x = +m[1]; const f = { '': 1, px: 1, pt: 4 / 3, pc: 16, in: 96, cm: 96 / 2.54, mm: 96 / 25.4, q: 96 / 101.6, em: fs || 16, rem: 16, ex: (fs || 16) / 2, ch: (fs || 16) / 2 }[u]; return f === undefined ? null : x * f; }
function mediaOk(conds, vw, vh) { return conds.every(c => splitTop(c.toLowerCase(), ',').some(q => mediaQ(q.trim(), vw, vh))); }
function mediaQ(q, vw, vh) {
  let neg = false; if (/^not\s/.test(q)) { neg = true; q = q.slice(4).trim(); } q = q.replace(/^only\s+/, '');
  if (!q) return !neg;
  let ok = true;
  for (let part of q.split(/\s+and\s+/)) {
    part = part.trim();
    if (!part.startsWith('(')) { if (!['all', 'screen'].includes(part)) ok = false; continue; }
    const f = part.slice(1, part.lastIndexOf(')')).trim();
    let m = /^([a-z-]+)\s*:\s*(.+)$/.exec(f);
    if (m) {
      const n = m[1], v = m[2].trim();
      if (n === 'min-width') ok = ok && vw >= (lenPx(v) ?? Infinity); else if (n === 'max-width') ok = ok && vw <= (lenPx(v) ?? -1); else if (n === 'width') ok = ok && vw === lenPx(v);
      else if (n === 'min-height') ok = ok && vh >= (lenPx(v) ?? Infinity); else if (n === 'max-height') ok = ok && vh <= (lenPx(v) ?? -1);
      else if (n === 'orientation') ok = ok && (v === 'landscape' ? vw >= vh : vw < vh);
      else if (n === 'prefers-color-scheme') ok = ok && v === 'light'; else if (n === 'prefers-reduced-motion') ok = ok && v === 'no-preference';
      else if (n === 'hover') ok = ok && v === 'hover'; else if (n === 'pointer') ok = ok && v === 'fine'; else ok = false;
      continue;
    }
    m = /^(width|height)\s*(>=|<=|>|<|=)\s*(.+)$/.exec(f);
    if (m) { const x = m[1] === 'width' ? vw : vh, y = lenPx(m[3]); ok = ok && y !== null && (m[2] === '>=' ? x >= y : m[2] === '<=' ? x <= y : m[2] === '>' ? x > y : m[2] === '<' ? x < y : x === y); continue; }
    m = /^(.+?)\s*(<=|<)\s*(width|height)\s*(?:(<=|<)\s*(.+))?$/.exec(f);
    if (m) { const x = m[3] === 'width' ? vw : vh, a = lenPx(m[1]); ok = ok && a !== null && (m[2] === '<=' ? a <= x : a < x); if (m[5]) { const b = lenPx(m[5]); ok = ok && b !== null && (m[4] === '<=' ? x <= b : x < b); } continue; }
    if (f === 'hover' || f === 'any-hover') continue;
    ok = false;
  }
  return neg ? !ok : ok;
}

// ------------------------------------------------------------------ cores, medidas e valores
const NAMED = {};
('aliceblue f0f8ff antiquewhite faebd7 aqua 00ffff aquamarine 7fffd4 azure f0ffff beige f5f5dc bisque ffe4c4 black 000000 blanchedalmond ffebcd blue 0000ff blueviolet 8a2be2 brown a52a2a burlywood deb887 cadetblue 5f9ea0 chartreuse 7fff00 chocolate d2691e coral ff7f50 cornflowerblue 6495ed cornsilk fff8dc crimson dc143c cyan 00ffff darkblue 00008b darkcyan 008b8b darkgoldenrod b8860b darkgray a9a9a9 darkgreen 006400 darkgrey a9a9a9 darkkhaki bdb76b darkmagenta 8b008b darkolivegreen 556b2f darkorange ff8c00 darkorchid 9932cc darkred 8b0000 darksalmon e9967a darkseagreen 8fbc8f darkslateblue 483d8b darkslategray 2f4f4f darkslategrey 2f4f4f darkturquoise 00ced1 darkviolet 9400d3 deeppink ff1493 deepskyblue 00bfff dimgray 696969 dimgrey 696969 dodgerblue 1e90ff firebrick b22222 floralwhite fffaf0 forestgreen 228b22 fuchsia ff00ff gainsboro dcdcdc ghostwhite f8f8ff gold ffd700 goldenrod daa520 gray 808080 green 008000 greenyellow adff2f grey 808080 honeydew f0fff0 hotpink ff69b4 indianred cd5c5c indigo 4b0082 ivory fffff0 khaki f0e68c lavender e6e6fa lavenderblush fff0f5 lawngreen 7cfc00 lemonchiffon fffacd lightblue add8e6 lightcoral f08080 lightcyan e0ffff lightgoldenrodyellow fafad2 lightgray d3d3d3 lightgreen 90ee90 lightgrey d3d3d3 lightpink ffb6c1 lightsalmon ffa07a lightseagreen 20b2aa lightskyblue 87cefa lightslategray 778899 lightslategrey 778899 lightsteelblue b0c4de lightyellow ffffe0 lime 00ff00 limegreen 32cd32 linen faf0e6 magenta ff00ff maroon 800000 mediumaquamarine 66cdaa mediumblue 0000cd mediumorchid ba55d3 mediumpurple 9370db mediumseagreen 3cb371 mediumslateblue 7b68ee mediumspringgreen 00fa9a mediumturquoise 48d1cc mediumvioletred c71585 midnightblue 191970 mintcream f5fffa mistyrose ffe4e1 moccasin ffe4b5 navajowhite ffdead navy 000080 oldlace fdf5e6 olive 808000 olivedrab 6b8e23 orange ffa500 orangered ff4500 orchid da70d6 palegoldenrod eee8aa palegreen 98fb98 paleturquoise afeeee palevioletred db7093 papayawhip ffefd5 peachpuff ffdab9 peru cd853f pink ffc0cb plum dda0dd powderblue b0e0e6 purple 800080 rebeccapurple 663399 red ff0000 rosybrown bc8f8f royalblue 4169e1 saddlebrown 8b4513 salmon fa8072 sandybrown f4a460 seagreen 2e8b57 seashell fff5ee sienna a0522d silver c0c0c0 skyblue 87ceeb slateblue 6a5acd slategray 708090 slategrey 708090 snow fffafa springgreen 00ff7f steelblue 4682b4 tan d2b48c teal 008080 thistle d8bfd8 tomato ff6347 turquoise 40e0d0 violet ee82ee wheat f5deb3 white ffffff whitesmoke f5f5f5 yellow ffff00 yellowgreen 9acd32').split(' ').forEach((x, i, a) => { if (i % 2 === 0) NAMED[x] = a[i + 1]; });
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const fmtNum = x => { const r = +x.toPrecision(6); return String(Object.is(r, -0) ? 0 : r); };   // o Chrome escreve 6 algarismos significativos
function parseColor(v) {                           // [r, g, b, a] | 'cc' (currentcolor) | {raw} (função de cor moderna) | null (inválida)
  v = String(v).trim().toLowerCase();
  if (v === 'currentcolor') return 'cc';
  if (v === 'transparent') return [0, 0, 0, 0];
  if (own(NAMED, v)) { const h = NAMED[v]; return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), 1]; }
  if (v[0] === '#') {
    if (!/^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.test(v)) return null;
    let h = v.slice(1); if (h.length <= 4) h = h.split('').map(c => c + c).join('');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1];
  }
  const m = /^(rgba?|hsla?)\(([^()]*)\)$/.exec(v);
  if (!m) return /^(hwb|lab|lch|oklab|oklch|color|color-mix|light-dark)\(.*\)$/.test(v) ? { raw: v.replace(/\s+/g, ' ') } : null;
  const toks = m[2].replace(/\//g, ' / ').split(/[\s,]+/).filter(Boolean); let alpha = 1;
  const si = toks.indexOf('/');
  if (si >= 0) { if (toks.length !== si + 2) return null; alpha = toks[si + 1]; toks.length = si; } else if (toks.length === 4) alpha = toks.pop();
  if (toks.length !== 3) return null;
  const num = (t, pctMax) => { const q = /^([+-]?(?:\d+\.?\d*|\.\d+))(%?)$/.exec(t); if (!q) return NaN; return q[2] ? +q[1] / 100 * pctMax : +q[1]; };
  const a = typeof alpha === 'string' ? clamp(num(alpha, 1), 0, 1) : 1; if (Number.isNaN(a)) return null;
  if (m[1][0] === 'r') { const c = toks.map(t => num(t, 255)); if (c.some(Number.isNaN)) return null; return [...c.map(x => Math.round(clamp(x, 0, 255))), a]; }
  const hq = /^([+-]?(?:\d+\.?\d*|\.\d+))(deg|grad|rad|turn)?$/.exec(toks[0]); if (!hq) return null;
  let h = +hq[1]; if (hq[2] === 'grad') h *= 0.9; else if (hq[2] === 'rad') h *= 180 / Math.PI; else if (hq[2] === 'turn') h *= 360;
  h = ((h % 360) + 360) % 360; const s = num(toks[1], 1), l = num(toks[2], 1); if (Number.isNaN(s) || Number.isNaN(l)) return null;
  const S = clamp(s, 0, 1), Lg = clamp(l, 0, 1), k = n => (n + h / 30) % 12, A = S * Math.min(Lg, 1 - Lg), f = n => Lg - A * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255), a];
}
function fmtColor(c) { if (c.raw) return c.raw; const a = Math.round(c[3] * 100) / 100; return a >= 1 ? `rgb(${c[0]}, ${c[1]}, ${c[2]})` : `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${fmtNum(a)})`; }
const rgbOf = s => { const c = parseColor(s); return Array.isArray(c) ? c : null; };

function splitWs(s) {                              // divide em espaços fora de parênteses e aspas
  const out = []; let d = 0, q = '', cur = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) { cur += c; if (c === '\\') { cur += s[++i] || ''; } else if (c === q) q = ''; continue; }
    if (c === '"' || c === "'") { q = c; cur += c; } else if (c === '(') { d++; cur += c; } else if (c === ')') { d--; cur += c; }
    else if (isWs(c) && d === 0) { if (cur) { out.push(cur); cur = ''; } } else cur += c;
  }
  if (cur) out.push(cur); return out;
}
const splitComma = s => splitTop(s, ',').map(x => x.trim()).filter(x => x !== '');
const cssWide = v => /^(inherit|initial|unset|revert|revert-layer)$/i.test(v.trim());

// texto de um valor sem significado especial: minúsculas (menos dentro de aspas e url), espaços arrumados
function rawNorm(v) {
  let out = '', q = '', d = 0, inUrl = false;
  for (let i = 0; i < v.length; i++) {
    const c = v[i];
    if (q) { out += c; if (c === '\\') out += v[++i] || ''; else if (c === q) q = ''; continue; }
    if (c === '"' || c === "'") { q = c; out += '"'; continue; }
    out += c.toLowerCase();
  }
  out = out.replace(/\s+/g, ' ').replace(/\s*,\s*/g, ', ').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').trim();
  return out.replace(/'/g, '"');
}

// ---- propriedades que o corretor conhece: valor inicial e se herdam
const S4 = ['top', 'right', 'bottom', 'left'], CORN = ['top-left', 'top-right', 'bottom-right', 'bottom-left'];
const INIT = {
  display: 'inline', position: 'static', top: 'auto', right: 'auto', bottom: 'auto', left: 'auto', float: 'none', clear: 'none', 'z-index': 'auto',
  width: 'auto', height: 'auto', 'min-width': '0px', 'min-height': '0px', 'max-width': 'none', 'max-height': 'none', 'box-sizing': 'content-box',
  color: 'rgb(0, 0, 0)', 'background-color': 'rgba(0, 0, 0, 0)', 'background-image': 'none', 'background-repeat': 'repeat', 'background-position': '0% 0%', 'background-size': 'auto', 'background-attachment': 'scroll',
  'font-family': 'times new roman', 'font-size': '16px', 'font-style': 'normal', 'font-weight': '400', 'font-variant': 'normal', 'line-height': 'normal', 'letter-spacing': 'normal', 'word-spacing': '0px',
  'text-align': 'start', 'text-indent': '0px', 'text-transform': 'none', 'text-decoration-line': 'none', 'text-decoration-style': 'solid', 'text-decoration-color': 'currentcolor', 'text-shadow': 'none', 'text-overflow': 'clip',
  'white-space': 'normal', 'word-break': 'normal', 'overflow-wrap': 'normal', 'vertical-align': 'baseline', 'list-style-type': 'disc', 'list-style-position': 'outside', 'list-style-image': 'none',
  visibility: 'visible', cursor: 'auto', opacity: '1', 'overflow-x': 'visible', 'overflow-y': 'visible',
  'flex-direction': 'row', 'flex-wrap': 'nowrap', 'flex-grow': '0', 'flex-shrink': '1', 'flex-basis': 'auto', 'justify-content': 'normal', 'align-items': 'normal', 'align-content': 'normal', 'align-self': 'auto', 'justify-items': 'legacy', 'justify-self': 'auto', order: '0', 'row-gap': 'normal', 'column-gap': 'normal',
  'grid-template-columns': 'none', 'grid-template-rows': 'none', 'grid-template-areas': 'none', 'grid-auto-flow': 'row', 'grid-auto-columns': 'auto', 'grid-auto-rows': 'auto', 'grid-column': 'auto', 'grid-row': 'auto', 'grid-area': 'auto',
  'box-shadow': 'none', transform: 'none', 'transform-origin': '50% 50%', filter: 'none', 'backdrop-filter': 'none', 'object-fit': 'fill', 'object-position': '50% 50%', 'aspect-ratio': 'auto', resize: 'none', 'pointer-events': 'auto', 'user-select': 'auto',
  'transition-property': 'all', 'transition-duration': '0s', 'transition-timing-function': 'ease', 'transition-delay': '0s',
  'animation-name': 'none', 'animation-duration': '0s', 'animation-timing-function': 'ease', 'animation-delay': '0s', 'animation-iteration-count': '1', 'animation-direction': 'normal', 'animation-fill-mode': 'none', 'animation-play-state': 'running',
  content: 'normal', 'outline-width': '3px', 'outline-style': 'none', 'outline-color': 'currentcolor', 'outline-offset': '0px',
  'border-collapse': 'separate', 'border-spacing': '0px 0px', 'table-layout': 'auto', 'caption-side': 'top', 'scroll-behavior': 'auto', 'accent-color': 'auto', 'mix-blend-mode': 'normal', 'clip-path': 'none', 'tab-size': '8', quotes: 'auto', 'text-underline-offset': 'auto', 'will-change': 'auto', 'overflow-anchor': 'auto', 'text-wrap': 'wrap'
};
for (const s of S4) { INIT['margin-' + s] = '0px'; INIT['padding-' + s] = '0px'; INIT['border-' + s + '-width'] = '3px'; INIT['border-' + s + '-style'] = 'none'; INIT['border-' + s + '-color'] = 'currentcolor'; }
for (const c of CORN) INIT['border-' + c + '-radius'] = '0px';
const INH = new Set(['color', 'font-family', 'font-size', 'font-style', 'font-weight', 'font-variant', 'line-height', 'letter-spacing', 'word-spacing', 'text-align', 'text-indent', 'text-transform', 'text-shadow', 'white-space', 'word-break', 'overflow-wrap', 'list-style-type', 'list-style-position', 'list-style-image', 'visibility', 'cursor', 'border-collapse', 'border-spacing', 'caption-side', 'pointer-events', 'quotes', 'tab-size', 'text-wrap', 'accent-color']);
const COLOR_P = new Set(['color', 'background-color', 'text-decoration-color', 'outline-color', ...S4.map(s => 'border-' + s + '-color')]);
const NONNEG = new Set(['width', 'height', 'min-width', 'min-height', 'max-width', 'max-height', 'row-gap', 'column-gap', 'flex-basis', 'outline-width', ...S4.map(s => 'padding-' + s), ...S4.map(s => 'border-' + s + '-width'), ...CORN.map(c => 'border-' + c + '-radius')]);
const NOPCT = new Set(['letter-spacing', 'word-spacing', 'outline-width', 'outline-offset', 'text-underline-offset', ...S4.map(s => 'border-' + s + '-width')]);
const SIZEKW = ['min-content', 'max-content', 'fit-content', 'stretch'];
const LENP = { width: ['auto', ...SIZEKW], height: ['auto', ...SIZEKW], 'min-width': ['auto', ...SIZEKW], 'min-height': ['auto', ...SIZEKW], 'max-width': ['none', ...SIZEKW], 'max-height': ['none', ...SIZEKW], 'letter-spacing': ['normal'], 'word-spacing': ['normal'], 'text-indent': [], 'row-gap': ['normal'], 'column-gap': ['normal'], 'flex-basis': ['auto', 'content', ...SIZEKW], 'outline-width': ['thin', 'medium', 'thick'], 'outline-offset': [], 'text-underline-offset': ['auto'] };
for (const s of S4) { LENP['margin-' + s] = ['auto']; LENP['padding-' + s] = []; LENP[s] = ['auto']; LENP['border-' + s + '-width'] = ['thin', 'medium', 'thick']; }
for (const c of CORN) LENP['border-' + c + '-radius'] = [];
const BSTYLES = ['none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset'];
const ALIGN = ['normal', 'stretch', 'flex-start', 'flex-end', 'center', 'baseline', 'start', 'end', 'self-start', 'self-end', 'first baseline', 'last baseline'];
const KW = {
  display: ['block', 'inline', 'inline-block', 'flex', 'inline-flex', 'grid', 'inline-grid', 'none', 'contents', 'list-item', 'table', 'inline-table', 'table-row', 'table-cell', 'table-row-group', 'table-header-group', 'table-footer-group', 'table-column', 'table-column-group', 'table-caption', 'flow-root', 'ruby'],
  position: ['static', 'relative', 'absolute', 'fixed', 'sticky'], float: ['left', 'right', 'none', 'inline-start', 'inline-end'], clear: ['none', 'left', 'right', 'both', 'inline-start', 'inline-end'],
  'text-align': ['left', 'right', 'center', 'justify', 'start', 'end', 'match-parent'], 'font-style': ['normal', 'italic', 'oblique'], 'text-transform': ['none', 'uppercase', 'lowercase', 'capitalize', 'full-width'],
  'text-decoration-style': ['solid', 'double', 'dotted', 'dashed', 'wavy'], 'white-space': ['normal', 'nowrap', 'pre', 'pre-wrap', 'pre-line', 'break-spaces'], 'overflow-x': ['visible', 'hidden', 'clip', 'scroll', 'auto'], 'overflow-y': ['visible', 'hidden', 'clip', 'scroll', 'auto'],
  'box-sizing': ['content-box', 'border-box'], visibility: ['visible', 'hidden', 'collapse'], 'flex-direction': ['row', 'row-reverse', 'column', 'column-reverse'], 'flex-wrap': ['nowrap', 'wrap', 'wrap-reverse'],
  'justify-content': ['normal', 'start', 'end', 'flex-start', 'flex-end', 'center', 'left', 'right', 'space-between', 'space-around', 'space-evenly', 'stretch'], 'align-items': ALIGN, 'align-content': [...ALIGN, 'space-between', 'space-around', 'space-evenly'], 'align-self': ['auto', ...ALIGN],
  'justify-items': [...ALIGN, 'legacy', 'left', 'right'], 'justify-self': ['auto', ...ALIGN, 'left', 'right'], 'list-style-position': ['inside', 'outside'], 'word-break': ['normal', 'break-all', 'keep-all', 'break-word'], 'overflow-wrap': ['normal', 'break-word', 'anywhere'], 'text-overflow': ['clip', 'ellipsis'],
  'object-fit': ['fill', 'contain', 'cover', 'none', 'scale-down'], resize: ['none', 'both', 'horizontal', 'vertical', 'block', 'inline'], 'pointer-events': ['auto', 'none', 'all'], 'user-select': ['auto', 'none', 'text', 'all', 'contain'],
  'border-collapse': ['separate', 'collapse'], 'table-layout': ['auto', 'fixed'], 'caption-side': ['top', 'bottom'], 'scroll-behavior': ['auto', 'smooth'], 'background-attachment': ['scroll', 'fixed', 'local'], 'grid-auto-flow': ['row', 'column', 'dense', 'row dense', 'column dense'],
  'animation-direction': ['normal', 'reverse', 'alternate', 'alternate-reverse'], 'animation-fill-mode': ['none', 'forwards', 'backwards', 'both'], 'animation-play-state': ['running', 'paused'], 'outline-style': ['auto', ...BSTYLES]
};
for (const s of S4) KW['border-' + s + '-style'] = BSTYLES;
const VALIGN = ['baseline', 'sub', 'super', 'top', 'text-top', 'middle', 'bottom', 'text-bottom'];
const UNITS = { px: 1, pt: 4 / 3, pc: 16, in: 96, cm: 96 / 2.54, mm: 96 / 25.4, q: 96 / 101.6 };
const FSKW = { 'xx-small': 9, 'x-small': 10, small: 13, medium: 16, large: 18, 'x-large': 24, 'xx-large': 32, 'xxx-large': 48 };

// ---- calc(), min(), max(), clamp(): devolve { px } | { num } | null (não dá para calcular sem layout, ex.: 100% - 20px); lança erro se a conta for inválida
function calcEval(s, cx) {
  const toks = []; const re = /\s*(?:(\d+\.?\d*|\.\d+)([a-z%]*)|([a-z-]+)\(|([-+*/(),]))/iy; let m; re.lastIndex = 0; let pos = 0;
  while (pos < s.length) { re.lastIndex = pos; m = re.exec(s); if (!m) { if (/^\s*$/.test(s.slice(pos))) break; throw new Error('calc'); } pos = re.lastIndex; if (m[1] !== undefined) toks.push({ n: +m[1], u: m[2].toLowerCase() }); else if (m[3]) toks.push({ f: m[3].toLowerCase() }); else toks.push({ o: m[4] }); }
  let i = 0, unres = false, depth = 0;
  const val = t => {
    if (t.u === '') return { k: 'n', v: t.n };
    if (t.u === '%') return { k: 'p', v: t.n };
    if (own(UNITS, t.u)) return { k: 'l', v: t.n * UNITS[t.u] };
    const fs = cx.fs || 16;
    if (t.u === 'em') return { k: 'l', v: t.n * fs }; if (t.u === 'rem') return { k: 'l', v: t.n * (cx.rfs || 16) };
    if (t.u === 'vw') return { k: 'l', v: t.n * (cx.vw || 1024) / 100 }; if (t.u === 'vh') return { k: 'l', v: t.n * (cx.vh || 768) / 100 };
    if (t.u === 'vmin') return { k: 'l', v: t.n * Math.min(cx.vw || 1024, cx.vh || 768) / 100 }; if (t.u === 'vmax') return { k: 'l', v: t.n * Math.max(cx.vw || 1024, cx.vh || 768) / 100 };
    if (t.u === 'ex' || t.u === 'ch') return { k: 'l', v: t.n * fs / 2 };
    throw new Error('unidade');
  };
  const expr = () => { let a = term(); while (toks[i] && (toks[i].o === '+' || toks[i].o === '-')) { const op = toks[i++].o, b = term(); a = bin(a, b, op); } return a; };
  const term = () => { let a = fac(); while (toks[i] && (toks[i].o === '*' || toks[i].o === '/')) { const op = toks[i++].o, b = fac(); a = bin(a, b, op); } return a; };
  const bin = (a, b, op) => {
    if (op === '+' || op === '-') { if (a.k !== b.k) { unres = true; return a; } return { k: a.k, v: op === '+' ? a.v + b.v : a.v - b.v }; }
    if (op === '*') { if (a.k === 'n') return { k: b.k, v: a.v * b.v }; if (b.k === 'n') return { k: a.k, v: a.v * b.v }; throw new Error('calc'); }
    if (b.k !== 'n' || b.v === 0) throw new Error('calc'); return { k: a.k, v: a.v / b.v };
  };
  const fac = () => {
    const t = toks[i++]; if (!t) throw new Error('calc');
    if (t.n !== undefined) return val(t);
    if (t.o === '-') { const a = fac(); return { k: a.k, v: -a.v }; } if (t.o === '+') return fac();
    if (t.o === '(') { if (++depth > 20) throw new Error('calc'); const a = expr(); if (!toks[i] || toks[i].o !== ')') throw new Error('calc'); i++; depth--; return a; }
    if (t.f !== undefined) {
      if (++depth > 20) throw new Error('calc');
      const args = []; for (;;) { args.push(expr()); const x = toks[i++]; if (!x) throw new Error('calc'); if (x.o === ')') break; if (x.o !== ',') throw new Error('calc'); } depth--;
      if (t.f === 'calc') return args[0];
      if (!args.every(a => a.k === args[0].k)) { unres = true; return args[0]; }
      const vs = args.map(a => a.v), k = args[0].k;
      if (t.f === 'min') return { k, v: Math.min(...vs) }; if (t.f === 'max') return { k, v: Math.max(...vs) };
      if (t.f === 'clamp' && vs.length === 3) return { k, v: Math.min(Math.max(vs[1], vs[0]), vs[2]) };
      throw new Error('calc');
    }
    throw new Error('calc');
  };
  const r = expr(); if (i < toks.length) throw new Error('calc');
  if (unres) return null; if (r.k === 'l') return { px: r.v }; if (r.k === 'n') return { num: r.v }; return null;
}
const normCalc = t => rawNorm(t).replace(/\s*([*/])\s*/g, ' $1 ').replace(/(\S)\s*([+-])\s+/g, '$1 $2 ').replace(/\s+/g, ' ');
const isFn = t => /^(calc|min|max|clamp)\(/i.test(t) && t.endsWith(')');

function oneLen(p, t, cx) {
  const F = cx.raw ? (x => String(x)) : fmtNum;
  const l = t.toLowerCase();
  if (isFn(l)) {
    let r; try { r = calcEval(l, cx); } catch { return null; }
    if (r && r.px !== undefined) { if (NONNEG.has(p) && r.px < 0) return '0px'; return F(r.px) + 'px'; }
    return r && r.num === 0 ? '0px' : normCalc(l);
  }
  const m = /^([+-]?(?:\d+\.?\d*|\.\d+))([a-z%]*)$/.exec(l); if (!m) return null;
  const n = +m[1], u = m[2];
  if (n < 0 && NONNEG.has(p)) return null;
  if (u === '') return n === 0 ? '0px' : null;
  if (u === '%') return NOPCT.has(p) ? null : F(n) + '%';
  if (own(UNITS, u)) return F(n * UNITS[u]) + 'px';
  const fs = cx.fs || 16;
  if (u === 'em') return F(Math.fround(n * fs)) + 'px'; if (u === 'rem') return F(Math.fround(n * (cx.rfs || 16))) + 'px';
  if (u === 'vw') return F(n * (cx.vw || 1024) / 100) + 'px'; if (u === 'vh') return F(n * (cx.vh || 768) / 100) + 'px';
  if (u === 'vmin') return F(n * Math.min(cx.vw || 1024, cx.vh || 768) / 100) + 'px'; if (u === 'vmax') return F(n * Math.max(cx.vw || 1024, cx.vh || 768) / 100) + 'px';
  if (u === 'ex' || u === 'ch') return F(Math.fround(n * fs / 2)) + 'px';
  return null;
}
const BW = { thin: '1px', medium: '3px', thick: '5px' };
function lenCanon(p, v, cx) {
  const lv = v.toLowerCase(), kws = LENP[p];
  if (kws.includes(lv)) return /border-.*-width|outline-width/.test(p) ? BW[lv] : lv;
  const toks = splitWs(v), max = /radius/.test(p) ? 2 : 1; if (toks.length > max) return null;
  const out = toks.map(t => oneLen(p, t, cx)); return out.includes(null) ? null : out.join(' ');
}
function fontSizeCanon(v, cx) {
  const l = v.toLowerCase(), pfs = cx.pfs || 16;
  if (own(FSKW, l)) return FSKW[l] + 'px'; if (l === 'smaller') return fmtNum(pfs / 1.2) + 'px'; if (l === 'larger') return fmtNum(pfs * 1.2) + 'px';
  const m = /^([+-]?(?:\d+\.?\d*|\.\d+))%$/.exec(l); if (m) return +m[1] < 0 ? null : fmtNum(pfs * +m[1] / 100) + 'px';
  const r = oneLen('font-size', l, { ...cx, fs: pfs }); return r && !r.endsWith('%') && !r.startsWith('calc') ? r : r && r.startsWith('calc') ? r : null;
}
const FSK = ['xx-small', 'x-small', 'small', 'medium', 'large', 'x-large', 'xx-large', 'xxx-large'], FSTAB = [9, 10, 13, 16, 18, 24, 32, 48], FSTAB_M = [9, 10, 12, 13, 16, 20, 26, 39];
// font-size que não é palavra: devolve o número (sem arredondar) ou null se for inválido
function fontSizeNum(v, cx) {
  const l = v.toLowerCase().trim(), pfs = cx.pfs;
  const fr = Math.fround; if (l === 'smaller') return fr(pfs / 1.2); if (l === 'larger') return fr(pfs * 1.2);
  const m = /^([+-]?(?:\d+\.?\d*|\.\d+))(%?)$/.exec(l);
  if (m) { if (+m[1] < 0) return null; return m[2] ? fr(pfs * +m[1] / 100) : +m[1] === 0 ? 0 : null; }
  const r = oneLen('font-size', l, { ...cx, fs: pfs, raw: true }); if (r === null) return null;
  const q = /^([+-]?(?:\d+\.?\d*|\.\d+))px$/.exec(r); return q ? +q[1] : null;
}
function lineHeightCanon(v, cx) {
  const l = v.toLowerCase(); if (l === 'normal') return { s: 'normal' };
  if (/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(l)) { const n = +l; return n < 0 ? null : { s: fmtNum(n * cx.fs) + 'px', n }; }
  const m = /^([+-]?(?:\d+\.?\d*|\.\d+))%$/.exec(l); if (m) return +m[1] < 0 ? null : { s: fmtNum(cx.fs * +m[1] / 100) + 'px' };
  const r = oneLen('line-height', l, cx); return r && !(+r.replace('px', '') < 0) ? { s: r } : null;
}
const timeCanon = t => { const m = /^([+-]?(?:\d+\.?\d*|\.\d+))(ms|s)$/i.exec(t.trim()); return m ? fmtNum(m[2].toLowerCase() === 'ms' ? +m[1] / 1000 : +m[1]) + 's' : null; };
const FAMGEN = new Set(['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui', 'ui-serif', 'ui-sans-serif', 'ui-monospace', 'ui-rounded', 'emoji', 'math', 'fangsong']);
function familyCanon(v) { const parts = splitComma(v).map(x => x.replace(/^["']|["']$/g, '').replace(/\s+/g, ' ').trim().toLowerCase()); return parts.length && parts.every(Boolean) ? parts.join(', ') : null; }
function colorCanon(v, cx) { const c = parseColor(v); if (c === null) return null; if (c === 'cc') return 'currentcolor'; return fmtColor(c); }
function shadowCanon(v) {                         // box-shadow / text-shadow: normaliza as cores e os espaços
  if (v.toLowerCase().trim() === 'none') return 'none';
  const items = splitComma(v).map(it => splitWs(it).map(t => { const c = parseColor(t); return Array.isArray(c) ? fmtColor(c) : t.toLowerCase(); }).join(' '));
  return items.join(', ');
}
// devolve o valor normalizado de uma propriedade, ou null se o valor é inválido (o navegador ignoraria a declaração)
function canon(p, v, cx) {
  v = String(v).trim(); if (!v) return null;
  const lv = v.toLowerCase();
  if (p === 'font-style') return lv === 'normal' || lv === 'italic' ? lv : lv === 'oblique' ? 'italic' : null;
  if (COLOR_P.has(p)) return colorCanon(v, cx);
  if (own(LENP, p)) return lenCanon(p, v, cx);
  if (own(KW, p)) return KW[p].includes(lv) ? lv : null;
  switch (p) {
    case 'font-size': return fontSizeCanon(v, cx);
    case 'font-weight': { if (lv === 'normal') return '400'; if (lv === 'bold') return '700'; if (lv === 'bolder') { const w = cx.pw || 400; return String(w < 400 ? 400 : w < 600 ? 700 : 900); } if (lv === 'lighter') { const w = cx.pw || 400; return String(w < 600 ? 100 : w < 800 ? 400 : 700); } return /^\d+(\.\d+)?$/.test(lv) && +lv >= 1 && +lv <= 1000 ? fmtNum(+lv) : null; }
    case 'font-family': return familyCanon(v);
    case 'line-height': { const r = lineHeightCanon(v, cx); return r && r.s; }
    case 'opacity': { const m = /^([+-]?(?:\d+\.?\d*|\.\d+))(%?)$/.exec(lv); return m ? fmtNum(clamp(m[2] ? +m[1] / 100 : +m[1], 0, 1)) : null; }
    case 'z-index': return lv === 'auto' ? 'auto' : /^[+-]?\d+$/.test(lv) ? String(+lv) : null;
    case 'order': return /^[+-]?\d+$/.test(lv) ? String(+lv) : null;
    case 'flex-grow': case 'flex-shrink': return /^(?:\d+\.?\d*|\.\d+)$/.test(lv) ? fmtNum(+lv) : null;
    case 'animation-iteration-count': return lv === 'infinite' ? lv : /^(?:\d+\.?\d*|\.\d+)$/.test(lv) ? fmtNum(+lv) : null;
    case 'tab-size': return /^\d+$/.test(lv) ? lv : null;
    case 'font-variant': return rawNorm(v);
    case 'vertical-align': return VALIGN.includes(lv) ? lv : lenCanon('text-indent', v, cx) && (/%$/.test(lv) ? rawNorm(v) : lenCanon('text-indent', v, cx));
    case 'text-decoration-line': { const t = lv.split(/\s+/); return t.every(x => ['none', 'underline', 'overline', 'line-through', 'blink'].includes(x)) && (t.length === 1 || !t.includes('none')) ? t.join(' ') : null; }
    case 'text-shadow': case 'box-shadow': return shadowCanon(v);
    case 'list-style-type': return /^[a-z-]+$/.test(lv) || /^["']/.test(v) ? rawNorm(v) : null;
    case 'background-repeat': { const t = lv.split(/\s+/); const ok = x => ['repeat', 'no-repeat', 'space', 'round', 'repeat-x', 'repeat-y'].includes(x); return t.length <= 2 && t.every(ok) ? (t.length === 2 && t[0] === t[1] ? t[0] : t.join(' ')) : null; }
    case 'border-spacing': { const t = splitWs(v); if (t.length > 2) return null; const o = t.map(x => oneLen('padding-top', x, cx)); return o.includes(null) ? null : (o.length === 1 ? o[0] + ' ' + o[0] : o.join(' ')); }
    case 'transition-duration': case 'transition-delay': case 'animation-duration': case 'animation-delay': { const o = splitComma(v).map(timeCanon); return o.length && !o.includes(null) ? o.join(', ') : null; }
    case 'content': { if (lv === 'normal' || lv === 'none') return lv; if (/^["']/.test(v)) return rawNorm(v); return rawNorm(v); }
    case 'grid-template-columns': case 'grid-template-rows': case 'grid-auto-columns': case 'grid-auto-rows': return gridCanon(v, cx);
    case 'background-image': case 'list-style-image': return imageCanon(v);
    default: return rawNorm(v);
  }
}
function imageCanon(v) {                           // url(a.png) vira url("a.png") e as cores dentro de gradientes ficam em rgb()
  let out = rawNorm(v).replace(/url\(\s*([^")\s][^)]*?)\s*\)/g, (m, u) => 'url("' + u.replace(/'/g, '') + '")');
  if (/gradient\(/.test(out)) out = out.replace(/#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?)\([^()]*\)|\b[a-z]+\b/g, t => { if (/^(?:to|at|deg|turn|rad|grad|closest|farthest|side|corner|circle|ellipse|top|bottom|left|right|center|in)$/.test(t)) return t; const c = parseColor(t); return Array.isArray(c) ? fmtColor(c) : t; });
  return out;
}
function gridCanon(v, cx) {                        // repeat(3, 1fr) vira 1fr 1fr 1fr; medidas viram px
  let s = rawNorm(v); if (s === 'none' || s === 'auto') return s;
  for (let k = 0; k < 4; k++) s = s.replace(/repeat\(\s*(\d+)\s*,\s*([^()]*(?:\([^()]*\)[^()]*)*)\)/g, (m, n, body) => +n <= 100 ? Array(+n).fill(body.trim()).join(' ') : m);
  return splitWs(s).map(t => { const m = /^([+-]?(?:\d+\.?\d*|\.\d+))(em|rem|pt|pc|in|cm|mm|vw|vh)$/.exec(t); return m ? oneLen('width', t, cx) || t : t; }).join(' ');
}

// ---- atalhos (margin, border, background, font, flex...): viram propriedades separadas. f(valor, parcial) devolve [[propriedade, valor]] ou null se o valor é inválido.
// parcial = true só devolve o que foi escrito (usado ao ler o que a verificação espera); false reinicia o resto para o valor inicial, como o navegador.
const SH = {}, ALIAS = { 'grid-gap': 'gap', 'grid-row-gap': 'row-gap', 'grid-column-gap': 'column-gap', 'margin-block-start': 'margin-top', 'margin-block-end': 'margin-bottom', 'margin-inline-start': 'margin-left', 'margin-inline-end': 'margin-right', 'padding-block-start': 'padding-top', 'padding-block-end': 'padding-bottom', 'padding-inline-start': 'padding-left', 'padding-inline-end': 'padding-right', 'inset-block-start': 'top', 'inset-block-end': 'bottom', 'inset-inline-start': 'left', 'inset-inline-end': 'right', 'border-start-start-radius': 'border-top-left-radius', 'border-start-end-radius': 'border-top-right-radius', 'border-end-start-radius': 'border-bottom-left-radius', 'border-end-end-radius': 'border-bottom-right-radius', 'text-decoration-thickness': 'text-underline-offset' };
const sh = (name, longs, f) => { SH[name] = { longs, f }; };
const side4 = t => t.length === 1 ? [t[0], t[0], t[0], t[0]] : t.length === 2 ? [t[0], t[1], t[0], t[1]] : t.length === 3 ? [t[0], t[1], t[2], t[1]] : t.length === 4 ? t : null;
const pair = (v, a, b) => { const t = splitWs(v); return t.length >= 1 && t.length <= 2 ? [[a, t[0]], [b, t[1] || t[0]]] : null; };
for (const k of ['margin', 'padding']) sh(k, S4.map(s => k + '-' + s), v => { const q = side4(splitWs(v)); return q && S4.map((s, i) => [k + '-' + s, q[i]]); });
sh('inset', S4, v => { const q = side4(splitWs(v)); return q && S4.map((s, i) => [s, q[i]]); });
for (const k of ['margin', 'padding']) { sh(k + '-block', [k + '-top', k + '-bottom'], v => pair(v, k + '-top', k + '-bottom')); sh(k + '-inline', [k + '-left', k + '-right'], v => pair(v, k + '-left', k + '-right')); }
sh('inset-block', ['top', 'bottom'], v => pair(v, 'top', 'bottom')); sh('inset-inline', ['left', 'right'], v => pair(v, 'left', 'right'));
const isWTok = l => own(BW, l) || /^[+-]?(\d|\.\d)/.test(l) || isFn(l);
function borderParts(v) {
  const t = splitWs(v); if (!t.length || t.length > 3) return null; let w, s, c;
  for (const x of t) { const l = x.toLowerCase(); if (BSTYLES.includes(l)) { if (s !== undefined) return null; s = l; } else if (isWTok(l)) { if (w !== undefined) return null; w = x; } else if (parseColor(l) !== null) { if (c !== undefined) return null; c = x; } else return null; }
  return { w, s, c };
}
const bpairs = (pre, b, part) => [[pre + '-width', b.w !== undefined ? b.w : part ? undefined : 'medium'], [pre + '-style', b.s !== undefined ? b.s : part ? undefined : 'none'], [pre + '-color', b.c !== undefined ? b.c : part ? undefined : 'currentcolor']].filter(x => x[1] !== undefined);
sh('border', S4.flatMap(s => ['width', 'style', 'color'].map(x => 'border-' + s + '-' + x)), (v, part) => { const b = borderParts(v); return b && S4.flatMap(s => bpairs('border-' + s, b, part)); });
for (const s of S4) sh('border-' + s, ['width', 'style', 'color'].map(x => 'border-' + s + '-' + x), (v, part) => { const b = borderParts(v); return b && bpairs('border-' + s, b, part); });
for (const x of ['width', 'style', 'color']) sh('border-' + x, S4.map(s => 'border-' + s + '-' + x), v => { const q = side4(splitWs(v)); return q && S4.map((s, i) => ['border-' + s + '-' + x, q[i]]); });
sh('border-radius', CORN.map(c => 'border-' + c + '-radius'), v => { const q = side4(splitWs(v.split('/')[0])); return q && CORN.map((c, i) => ['border-' + c + '-radius', q[i]]); });
sh('outline', ['outline-width', 'outline-style', 'outline-color'], (v, part) => { const b = borderParts(v.replace(/\bauto\b/i, 'solid')); return b && bpairs('outline', b, part); });
sh('overflow', ['overflow-x', 'overflow-y'], v => pair(v, 'overflow-x', 'overflow-y'));
sh('gap', ['row-gap', 'column-gap'], v => pair(v, 'row-gap', 'column-gap'));
sh('place-items', ['align-items', 'justify-items'], v => pair(v, 'align-items', 'justify-items'));
sh('place-content', ['align-content', 'justify-content'], v => pair(v, 'align-content', 'justify-content'));
sh('place-self', ['align-self', 'justify-self'], v => pair(v, 'align-self', 'justify-self'));
sh('flex-flow', ['flex-direction', 'flex-wrap'], (v, part) => {
  const t = splitWs(v.toLowerCase()); if (!t.length || t.length > 2) return null; let d, w;
  for (const x of t) { if (KW['flex-direction'].includes(x)) { if (d) return null; d = x; } else if (KW['flex-wrap'].includes(x)) { if (w) return null; w = x; } else return null; }
  return [['flex-direction', d || (part ? undefined : 'row')], ['flex-wrap', w || (part ? undefined : 'nowrap')]].filter(x => x[1] !== undefined);
});
sh('flex', ['flex-grow', 'flex-shrink', 'flex-basis'], (v, part) => {
  const l = v.toLowerCase().trim();
  if (l === 'none') return [['flex-grow', '0'], ['flex-shrink', '0'], ['flex-basis', 'auto']]; if (l === 'auto') return [['flex-grow', '1'], ['flex-shrink', '1'], ['flex-basis', 'auto']]; if (l === 'initial') return [['flex-grow', '0'], ['flex-shrink', '1'], ['flex-basis', 'auto']];
  const t = splitWs(v); if (t.length > 3) return null; const nums = []; let b;
  for (const x of t) { if (/^(?:\d+\.?\d*|\.\d+)$/.test(x)) nums.push(x); else if (b === undefined) b = x; else return null; }
  if (nums.length > 2 || (!nums.length && b === undefined)) return null;
  return [['flex-grow', nums[0] !== undefined ? nums[0] : '1'], ['flex-shrink', nums[1] !== undefined ? nums[1] : part && nums[0] !== undefined ? undefined : '1'], ['flex-basis', b !== undefined ? b : part ? undefined : '0%']].filter(x => x[1] !== undefined);
});
const slashSp = s => { let o = '', d = 0, q = ''; for (const c of s) { if (q) { o += c; if (c === q) q = ''; continue; } if (c === '"' || c === "'") q = c; if (c === '(') d++; if (c === ')') d--; o += c === '/' && d === 0 ? ' / ' : c; } return o; };
sh('background', ['background-color', 'background-image', 'background-repeat', 'background-position', 'background-size', 'background-attachment'], (v, part) => {
  const layers = splitComma(v); if (!layers.length) return null; const imgs = [], reps = [], poss = [], sizes = []; let color, att, hImg = false, hRep = false, hPos = false, hSize = false;
  for (let li = 0; li < layers.length; li++) {
    let img = 'none', rep, pos = [], size = [], inSize = false;
    for (const t of splitWs(slashSp(layers[li]))) {
      const l = t.toLowerCase();
      if (t === '/') { inSize = true; continue; }
      if (l.startsWith('url(') || /^(repeating-)?(linear|radial|conic)-gradient\(/.test(l) || l.startsWith('image-set(')) { img = t; hImg = true; }
      else if (l === 'none') { img = 'none'; hImg = true; }
      else if (['repeat', 'no-repeat', 'repeat-x', 'repeat-y', 'space', 'round'].includes(l)) { rep = (rep ? rep + ' ' : '') + l; hRep = true; }
      else if (['scroll', 'fixed', 'local'].includes(l)) att = l;
      else if (['border-box', 'padding-box', 'content-box', 'text'].includes(l)) { }
      else if (parseColor(l) !== null) { if (li !== layers.length - 1 || color !== undefined) return null; color = t; }
      else if (/^(left|right|top|bottom|center|auto|cover|contain)$/.test(l) || /^[+-]?(\d|\.\d)/.test(l) || isFn(l)) { (inSize ? size : pos).push(t); if (inSize) hSize = true; else hPos = true; }
      else return null;
    }
    imgs.push(img); reps.push(rep || 'repeat'); poss.push(pos.join(' ') || '0% 0%'); sizes.push(size.join(' ') || 'auto');
  }
  const out = [['background-color', color !== undefined ? color : part ? undefined : 'transparent'], ['background-image', hImg || !part ? imgs.join(', ') : undefined], ['background-repeat', hRep || !part ? reps.join(', ') : undefined], ['background-position', hPos || !part ? poss.join(', ') : undefined], ['background-size', hSize || !part ? sizes.join(', ') : undefined], ['background-attachment', att !== undefined ? att : part ? undefined : 'scroll']];
  return out.filter(x => x[1] !== undefined);
});
const FWK = /^(bold|bolder|lighter|[1-9]00)$/;
sh('font', ['font-style', 'font-variant', 'font-weight', 'font-size', 'line-height', 'font-family'], (v, part) => {
  let rest = v.trim(), style, weight, variant;
  if (/^(caption|icon|menu|message-box|small-caption|status-bar)$/i.test(rest)) return null;
  for (;;) {
    const m = /^(\S+)\s+([\s\S]*)$/.exec(rest); if (!m) break; const l = m[1].toLowerCase();
    if (l === 'normal') { rest = m[2]; continue; }
    if (l === 'italic' || l === 'oblique') { style = l; rest = m[2]; continue; }
    if (l === 'small-caps') { variant = l; rest = m[2]; continue; }
    if (FWK.test(l)) { weight = l; rest = m[2]; continue; }
    break;
  }
  const m = /^([^\s/]+)\s*(?:\/\s*([^\s]+))?\s+([\s\S]+)$/.exec(rest); if (!m) return null;
  return [['font-style', style || (part ? undefined : 'normal')], ['font-variant', variant || (part ? undefined : 'normal')], ['font-weight', weight || (part ? undefined : 'normal')], ['font-size', m[1]], ['line-height', m[2] || (part ? undefined : 'normal')], ['font-family', m[3]]].filter(x => x[1] !== undefined);
});
sh('list-style', ['list-style-type', 'list-style-position', 'list-style-image'], (v, part) => {
  const t = splitWs(v); if (!t.length || t.length > 3) return null; let ty, po, im;
  for (const x of t) { const l = x.toLowerCase(); if (l === 'inside' || l === 'outside') po = l; else if (/^url\(/.test(l) || /gradient\(/.test(l)) im = x; else if (l === 'none') { if (ty === undefined) ty = 'none'; else im = 'none'; } else if (/^[a-z-]+$/.test(l) || /^["']/.test(x)) ty = x; else return null; }
  return [['list-style-type', ty || (part ? undefined : 'disc')], ['list-style-position', po || (part ? undefined : 'outside')], ['list-style-image', im || (part ? undefined : 'none')]].filter(x => x[1] !== undefined);
});
sh('text-decoration', ['text-decoration-line', 'text-decoration-style', 'text-decoration-color'], (v, part) => {
  const t = splitWs(v); if (!t.length) return null; const lines = []; let st, co;
  for (const x of t) { const l = x.toLowerCase(); if (['none', 'underline', 'overline', 'line-through', 'blink'].includes(l)) lines.push(l); else if (['solid', 'double', 'dotted', 'dashed', 'wavy'].includes(l)) st = l; else if (parseColor(l) !== null) co = x; else if (/^[+-]?(\d|\.\d)/.test(l) || l === 'auto' || l === 'from-font') { } else return null; }
  return [['text-decoration-line', lines.length ? lines.join(' ') : (part ? undefined : 'none')], ['text-decoration-style', st || (part ? undefined : 'solid')], ['text-decoration-color', co || (part ? undefined : 'currentcolor')]].filter(x => x[1] !== undefined);
});
const EASES = ['ease', 'linear', 'ease-in', 'ease-out', 'ease-in-out', 'step-start', 'step-end'];
sh('transition', ['transition-property', 'transition-duration', 'transition-timing-function', 'transition-delay'], (v, part) => {
  const P = [], D = [], T = [], Dl = [];
  for (const it of splitComma(v)) {
    let prop, dur, tim, del;
    for (const t of splitWs(it)) { const l = t.toLowerCase(); if (timeCanon(l)) { if (dur === undefined) dur = l; else if (del === undefined) del = l; else return null; } else if (EASES.includes(l) || /^(cubic-bezier|steps|linear)\(/.test(l)) { if (tim) return null; tim = l; } else if (l === 'allow-discrete' || l === 'normal') { } else if (/^[a-z_-][\w-]*$/.test(l)) { if (prop !== undefined) return null; prop = l; } else return null; }
    P.push(prop === undefined ? 'all' : prop); D.push(dur || '0s'); T.push(tim || 'ease'); Dl.push(del || '0s');
  }
  return [['transition-property', P.join(', ')], ['transition-duration', D.join(', ')], ['transition-timing-function', T.join(', ')], ['transition-delay', Dl.join(', ')]];
});
const ANIKW = new Set(['none', 'infinite', 'normal', 'reverse', 'alternate', 'alternate-reverse', 'forwards', 'backwards', 'both', 'running', 'paused', ...EASES]);
sh('animation', ['animation-name', 'animation-duration', 'animation-timing-function', 'animation-delay', 'animation-iteration-count', 'animation-direction', 'animation-fill-mode', 'animation-play-state'], (v, part) => {
  const R = { n: [], d: [], t: [], l: [], c: [], r: [], f: [], p: [] };
  for (const it of splitComma(v)) {
    let name, dur, tim, del, cnt, dir, fill, play;
    for (const t of splitWs(it)) {
      const l = t.toLowerCase();
      if (timeCanon(l)) { if (dur === undefined) dur = l; else if (del === undefined) del = l; else return null; }
      else if (EASES.includes(l) || /^(cubic-bezier|steps|linear)\(/.test(l)) tim = l;
      else if (l === 'infinite' || /^(?:\d+\.?\d*|\.\d+)$/.test(l)) cnt = l;
      else if (['normal', 'reverse', 'alternate', 'alternate-reverse'].includes(l)) dir = l;
      else if (['forwards', 'backwards', 'both'].includes(l)) fill = l;
      else if (l === 'running' || l === 'paused') play = l;
      else if (l === 'none') name = 'none';
      else if (/^[a-z_-][\w-]*$/.test(l) && !ANIKW.has(l)) { if (name !== undefined && name !== 'none') return null; name = t; }
      else return null;
    }
    R.n.push(name || 'none'); R.d.push(dur || '0s'); R.t.push(tim || 'ease'); R.l.push(del || '0s'); R.c.push(cnt || '1'); R.r.push(dir || 'normal'); R.f.push(fill || 'none'); R.p.push(play || 'running');
  }
  return [['animation-name', R.n.join(', ')], ['animation-duration', R.d.join(', ')], ['animation-timing-function', R.t.join(', ')], ['animation-delay', R.l.join(', ')], ['animation-iteration-count', R.c.join(', ')], ['animation-direction', R.r.join(', ')], ['animation-fill-mode', R.f.join(', ')], ['animation-play-state', R.p.join(', ')]];
});
// lista de propriedades separadas que um atalho cobre (para "inherit", "initial" e variáveis sem valor)
const longsOf = p => SH[p] ? SH[p].longs : own(INIT, p) ? [p] : null;
function expandDecl(p, v, part) {
  p = ALIAS[p] || p;
  if (SH[p]) { if (cssWide(v)) return SH[p].longs.map(l => [l, v.trim().toLowerCase()]); return SH[p].f(v, part); }
  if (own(INIT, p)) return [[p, v]];
  return null;
}

// ---- var(--nome, reserva)
function subVars(v, customs, depth) {
  if (depth > 8) return null;
  let out = '', i = 0;
  while (i < v.length) {
    const k = v.toLowerCase().indexOf('var(', i);
    if (k < 0) { out += v.slice(i); break; }
    out += v.slice(i, k);
    let d = 1, j = k + 4; for (; j < v.length && d > 0; j++) { if (v[j] === '(') d++; else if (v[j] === ')') d--; }
    if (d) return null;
    const inner = v.slice(k + 4, j - 1), ci = scanTo(inner, 0, ','), name = inner.slice(0, ci).trim(), fb = ci < inner.length ? inner.slice(ci + 1) : null;
    let val = name in customs ? subVars(customs[name], customs, depth + 1) : undefined;
    if (val === undefined || val === null) { if (fb === null) return null; val = subVars(fb.trim(), customs, depth + 1); if (val === null) return null; }
    out += val; i = j;
  }
  return out;
}

// ---- folha de estilo padrão do navegador (o que a página tem antes de qualquer CSS)
const UA_CSS = `
html{display:block} head,link,meta,script,style,title,base,template,noscript,area,param,datalist{display:none}
body{display:block;margin:8px}
address,blockquote,center,dialog,div,figure,figcaption,footer,form,header,hr,legend,main,p,pre,article,aside,h1,h2,h3,h4,h5,h6,hgroup,nav,section,dl,dd,dt,menu,ol,ul,details,summary,fieldset,optgroup,search{display:block}
li{display:list-item}
table{display:table;border-collapse:separate;border-spacing:2px;box-sizing:border-box;border-color:gray} thead,tbody,tfoot,tr{border-color:inherit}  caption{display:table-caption;text-align:center}
colgroup{display:table-column-group} col{display:table-column}
thead{display:table-header-group;vertical-align:middle} tbody{display:table-row-group;vertical-align:middle} tfoot{display:table-footer-group;vertical-align:middle}
tr{display:table-row;vertical-align:inherit} td,th{display:table-cell;vertical-align:inherit;padding:1px} th{font-weight:bold;text-align:center}
h1{font-size:2em;margin-top:.67em;margin-bottom:.67em;font-weight:bold} h2{font-size:1.5em;margin-top:.83em;margin-bottom:.83em;font-weight:bold}
h3{font-size:1.17em;margin-top:1em;margin-bottom:1em;font-weight:bold} h4{margin-top:1.33em;margin-bottom:1.33em;font-weight:bold}
h5{font-size:.83em;margin-top:1.67em;margin-bottom:1.67em;font-weight:bold} h6{font-size:.67em;margin-top:2.33em;margin-bottom:2.33em;font-weight:bold}
p,dl,ul,ol,menu,pre{margin-top:1em;margin-bottom:1em}
blockquote,figure{margin-top:1em;margin-bottom:1em;margin-left:40px;margin-right:40px}
ul,ol,menu{padding-left:40px} dd{margin-left:40px}
ul{list-style-type:disc} ol{list-style-type:decimal} ul ul,ol ul{list-style-type:circle} ul ul ul,ol ul ul,ul ol ul,ol ol ul{list-style-type:square}
ul ul,ul ol,ol ul,ol ol{margin-top:0;margin-bottom:0}
pre{font-family:monospace;white-space:pre} code,kbd,samp,tt{font-family:monospace}
b,strong{font-weight:bolder} i,em,cite,var,dfn,address{font-style:italic} u,ins{text-decoration-line:underline} s,strike,del{text-decoration-line:line-through}
small{font-size:smaller} big{font-size:larger} sub{font-size:smaller;vertical-align:sub} sup{font-size:smaller;vertical-align:super}
a[href]{color:rgb(0,0,238);text-decoration-line:underline;cursor:pointer}
mark{background-color:yellow;color:black} center{text-align:center}
hr{color:gray;margin-top:.5em;margin-bottom:.5em;margin-left:auto;margin-right:auto;border-top-style:inset;border-right-style:inset;border-bottom-style:inset;border-left-style:inset;border-top-width:1px;border-right-width:1px;border-bottom-width:1px;border-left-width:1px;overflow-x:hidden;overflow-y:hidden}
input,textarea,select,button,img,video,canvas,svg,iframe{display:inline-block} img{display:inline}
button,input[type=button],input[type=submit],input[type=reset]{text-align:center}
`;
const UA = parseCss(UA_CSS).rules;

// ---- página: HTML lido + todas as folhas de estilo na ordem em que valem
function textOfStyle(el) { return el.kids.map(k => k.t === 3 ? k.s : '').join(''); }
function makePage(htmlSrc, o) {
  o = o || {}; const dom = parseHtml(htmlSrc), rules = [], keyframes = Object.create(null), ats = []; let base = 0;
  for (const r of UA) rules.push({ ...r, origin: 0, ord: r.ord, media: null });
  const add = (css, mediaAttr) => {
    const sh = parseCss(css); let mx = 0;
    for (const r of sh.rules) { rules.push({ ...r, origin: 1, ord: base + r.ord, media: mediaAttr ? [mediaAttr].concat(r.media || []) : r.media }); mx = Math.max(mx, r.ord + 1); }
    Object.assign(keyframes, sh.keyframes); ats.push(...sh.ats); base += mx;
  };
  for (const c of o.pre || []) add(c);
  for (const el of dom.all) if (el.tag === 'style') add(textOfStyle(el), el.a.media || null);
  for (const c of o.post || []) add(c);
  return { dom, rules, keyframes, ats, cache: new Map() };
}

// ---- cascata: o estilo calculado de um elemento (ou do pseudo-elemento ::before/::after)
const cmpRank = (a, b) => { for (let i = 0; i < a.length; i++) { const d = a[i] - b[i]; if (d) return d; } return 0; };
const VCX = { fs: 16, pfs: 16, rfs: 16, vw: 1024, vh: 768, pw: 400 };
function styleOf(page, el, pe, ctx) {
  const key = ctx.key + '|' + el.id + '|' + (pe || '');
  const hit = page.cache.get(key); if (hit) return hit;
  const parentSt = pe ? styleOf(page, el, null, ctx) : el.parent ? styleOf(page, el.parent, null, ctx) : null;
  const ds = [];
  for (const r of page.rules) {
    if (r.media && !mediaOk(r.media, ctx.vw, ctx.vh)) continue;
    if ((r.pe || null) !== (pe || null)) continue;
    if (!matchComplex(el, r.sel, r.sel.parts.length - 1, ctx)) continue;
    const sp = r.sel.spec;
    for (const d of r.decls) ds.push({ p: d.p, v: d.v, rank: [d.imp ? 1 : 0, r.origin, 0, sp[0], sp[1], sp[2], r.ord] });
  }
  if (!pe && el.a.style) for (const d of parseDecls(el.a.style)) ds.push({ p: d.p, v: d.v, rank: [d.imp ? 1 : 0, 1, 1, 0, 0, 0, 0] });
  // variáveis (--x): herdam e podem ser trocadas em cada elemento
  const customs = Object.assign(Object.create(null), parentSt ? parentSt.__c : null), bc = Object.create(null);
  for (const d of ds) if (d.p.startsWith('--') && (!bc[d.p] || cmpRank(d.rank, bc[d.p].rank) >= 0)) bc[d.p] = d;
  for (const k in bc) customs[k] = bc[k].v;
  // vence a declaração válida de maior prioridade; declaração inválida o navegador ignora
  const win = Object.create(null);
  for (const d of ds) {
    if (d.p.startsWith('--')) continue;
    let v = d.v, pairs;
    if (/var\(/i.test(v)) { v = subVars(v, customs, 0); if (v === null) { const ls = longsOf(ALIAS[d.p] || d.p); pairs = ls && ls.map(l => [l, 'unset']); } }
    if (!pairs) pairs = expandDecl(d.p, v, false);
    if (!pairs) continue;
    for (const [lp, lv] of pairs) { if (!cssWide(lv) && canon(lp, lv, VCX) === null) continue; const cur = win[lp]; if (!cur || cmpRank(d.rank, cur.rank) >= 0) win[lp] = { v: lv, rank: d.rank }; }
  }
  const st = Object.create(null); st.__c = customs;
  const pFs = parentSt ? parentSt.__fs : 16, pFk = parentSt ? parentSt.__fk : 3, pFa = parentSt ? parentSt.__fa : false, pMono = parentSt ? parentSt.__mono : false, pW = parentSt ? +parentSt['font-weight'] : 400;
  const inherit = p => parentSt ? parentSt[p] : INIT[p];
  const pick = (p, cx) => {
    const w = win[p]; if (!w) return INH.has(p) ? inherit(p) : INIT[p];
    const kw = w.v.toLowerCase().trim();
    if (kw === 'inherit') return inherit(p); if (kw === 'initial') return INIT[p]; if (cssWide(kw)) return INH.has(p) ? inherit(p) : INIT[p];
    const r = canon(p, w.v, cx); return r === null ? (INH.has(p) ? inherit(p) : INIT[p]) : r;
  };
  // tamanho da fonte: palavras (medium, large...) mudam de tamanho se a família for só "monospace" (13px em vez de 16px) e esse "jeito de palavra" é herdado;
  // tamanhos que não são palavra nem px (em, %, smaller...) são reduzidos/aumentados em 13/16 quando a família entra ou sai de "monospace"
  const rootFs = el.tag === 'html' && !pe ? 16 : styleOf(page, page.dom.html, null, ctx).__fs;
  const fam = pick('font-family', { pfs: pFs, fs: pFs }), mono = fam === 'monospace', tab = mono ? FSTAB_M : FSTAB;
  let fs, fk, fa;
  {
    const w = win['font-size'], kw = w && w.v.toLowerCase().trim(), ki = kw ? FSK.indexOf(kw) : -1;
    const inh = () => { fa = pFa; if (pFk >= 0) { fk = pFk; fs = tab[pFk]; fa = false; } else { fk = -1; fs = pFs; } };
    if (!w || kw === 'inherit' || (kw && cssWide(kw) && kw !== 'initial')) inh();
    else if (kw === 'initial') { fk = 3; fs = tab[3]; fa = false; }
    else if (ki >= 0) { fk = ki; fs = tab[ki]; fa = false; }
    else {
      fk = -1; fs = fontSizeNum(w.v, { pfs: pFs, fs: pFs, rfs: rootFs, vw: ctx.vw, vh: ctx.vh, pw: pW });
      if (fs === null) inh(); else fa = pFa || !/(?:(?<!r)em|ex|ch|%)$|^(?:smaller|larger)$/i.test(w.v.trim());
    }
    if (fk < 0 && !fa && mono !== pMono) fs = Math.fround(fs * (mono ? 13 / 16 : 16 / 13));
    if (fs > 0 && fs < 6 && !fa) fs = 6;   // o navegador não deixa um tamanho relativo (em, %, smaller) ficar menor que 6px
  }
  st.__fs = fs; st.__fk = fk; st.__fa = fa; st.__mono = mono; st['font-size'] = fmtNum(fs) + 'px';
  const base = { pfs: pFs, rfs: rootFs, vw: ctx.vw, vh: ctx.vh, pw: pW };
  const cx = { ...base, fs };
  st.color = pick('color', cx); if (st.color === 'currentcolor') st.color = inherit('color');
  for (const p in INIT) {
    if (p === 'font-size' || p === 'color') continue;
    if (p === 'font-family') { st[p] = fam; continue; }
    if (p === 'line-height') {
      const w = win[p]; const kw = w && w.v.toLowerCase().trim();
      if (!w || kw === 'inherit' || kw === 'unset') { if (parentSt && parentSt.__lh !== undefined) { st.__lh = parentSt.__lh; st[p] = fmtNum(parentSt.__lh * fs) + 'px'; } else st[p] = inherit(p); }
      else if (kw === 'initial') st[p] = 'normal';
      else { const r = lineHeightCanon(w.v, cx); st[p] = r ? r.s : 'normal'; if (r && r.n !== undefined) st.__lh = r.n; }
      continue;
    }
    st[p] = pick(p, cx);
  }
  for (const p of COLOR_P) if (st[p] === 'currentcolor') st[p] = st.color;
  for (const s of S4) { const b = 'border-' + s; if (st[b + '-style'] === 'none' || st[b + '-style'] === 'hidden') st[b + '-width'] = '0px'; }
  if (st['outline-style'] === 'none') st['outline-width'] = '0px';
  // elementos soltos (float, position absolute/fixed), itens de flex/grid e a raiz (html) viram "bloco"; position absolute também anula o float
  const abs = st.position === 'absolute' || st.position === 'fixed'; if (abs) st.float = 'none';
  if ((st.float !== 'none' || abs || (parentSt && /^(?:inline-)?(?:flex|grid)$/.test(parentSt.display)) || (el.tag === 'html' && !pe)) && st.display !== 'none' && st.display !== 'contents') { if (own(BLOCKIFY, st.display)) st.display = BLOCKIFY[st.display]; }
  // overflow: tabelas ignoram; se um dos eixos rola/corta, o outro "visible" vira "auto" e "clip" vira "hidden"
  if (st.display === 'table' || st.display === 'inline-table') { const x = st['overflow-x'], y = st['overflow-y']; if (!((x === y && (x === 'visible' || x === 'hidden' || x === 'clip')) || (x === 'visible' && y === 'clip') || (x === 'clip' && y === 'visible'))) st['overflow-x'] = st['overflow-y'] = 'visible'; }
  else { const vc = v => v === 'visible' || v === 'clip', x = st['overflow-x'], y = st['overflow-y']; if (!vc(x) || !vc(y)) { const f = v => v === 'visible' ? 'auto' : v === 'clip' ? 'hidden' : v; st['overflow-x'] = f(x); st['overflow-y'] = f(y); } }
  for (const k of ['background-position', 'object-position', 'transform-origin']) if (typeof st[k] === 'string') st[k] = posCanon(st[k], cx);
  page.cache.set(key, st); return st;
}
const BLOCKIFY = { inline: 'block', 'inline-block': 'block', 'inline-flex': 'flex', 'inline-grid': 'grid', 'inline-table': 'table', 'table-row': 'block', 'table-cell': 'block', 'table-row-group': 'block', 'table-header-group': 'block', 'table-footer-group': 'block', 'table-column': 'block', 'table-column-group': 'block', 'table-caption': 'block', ruby: 'block' };
const POSK = { left: '0%', center: '50%', right: '100%', top: '0%', bottom: '100%' };
function posCanon(v, cx) {
  return splitComma(v).map(layer => {
    let t = splitWs(layer); if (t.length > 2 || !t.length) return layer;
    const m = x => own(POSK, x) ? POSK[x] : oneLen('width', x, cx) || x;
    if (t.length === 1) t = (t[0] === 'top' || t[0] === 'bottom') ? ['center', t[0]] : [t[0], 'center'];
    if (t[0] === 'top' || t[0] === 'bottom' || t[1] === 'left' || t[1] === 'right') t = [t[1], t[0]];
    return m(t[0]) + ' ' + m(t[1]);
  }).join(', ');
}

// ------------------------------------------------------------------ verificações
const BLOCKS = new Set('address article aside blockquote body dd details dialog div dl dt fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hgroup hr html li main nav ol p pre section table td th tr ul summary caption thead tbody tfoot'.split(' '));
function textOf(el, raw) {
  let s = '';
  (function w(e) { for (const k of e.kids) { if (k.t === 3) s += k.s; else if (k.tag === 'br') s += ' '; else if (k.tag !== 'script' && k.tag !== 'style') { const b = BLOCKS.has(k.tag); if (b) s += ' '; w(k); if (b) s += ' '; } } })(el);
  return raw ? s.replace(/\s+/g, ' ').trim() : nt(s);
}
const short = (s, n) => { s = String(s); return s.length > (n || 40) ? s.slice(0, n || 40) + '…' : s; };
const tagName = sel => /^[a-z][a-z0-9]*$/i.test(sel.trim()) ? '`<' + sel.trim().toLowerCase() + '>`' : '`' + sel.trim() + '`';
const cssShow = v => Array.isArray(v) ? v.join(' ou ') : String(v);
function describe(c) {
  if (c.d) return c.d;
  if (c.doctype) return 'A primeira linha `<!DOCTYPE html>`';
  if (c.src) return 'Texto pedido no código';
  if (c.at) return c.at === 'media' ? 'Uma regra `@media`' : c.at === 'keyframes' ? 'Uma animação `@keyframes' + (c.name ? ' ' + c.name : '') + '`' : 'Uma regra `@' + c.at + '`';
  const t = tagName(c.s), parts = [];
  if (c.text !== undefined) parts.push('com o texto “' + c.text + '”');
  if (c.has !== undefined) parts.push('com “' + c.has + '” no texto');
  if (c.re !== undefined) parts.push('com o texto no formato pedido');
  if (c.a) parts.push('com ' + Object.entries(c.a).map(([k, v]) => v === true ? 'o atributo `' + k + '`' : v === '*' ? '`' + k + '` preenchido' : '`' + k + '="' + cssShow(v) + '"`').join(' e '));
  if (c.css) parts.push('com ' + Object.entries(c.css).map(([k, v]) => '`' + k + ': ' + cssShow(v) + '`').join(' e ') + (c.hover ? ' ao passar o mouse' : c.state ? ' no estado ' + c.state : '') + (c.vw ? ` (tela de ${c.vw}px)` : ''));
  const tail = parts.length ? ' ' + parts.join(' ') : '';
  if (c.eq === 0) return 'Nenhum ' + t + tail;
  if (c.eq !== undefined) return 'Exatamente ' + c.eq + ' ' + t + tail;
  if (c.all) return 'Todos os ' + t + tail;
  if (c.n > 1) return 'Pelo menos ' + c.n + ' ' + t + tail;
  if (c.max !== undefined) return 'No máximo ' + c.max + ' ' + t + tail;
  return (c.css && !c.a && c.text === undefined ? '' : 'Um ') + t + tail;
}
// compara um valor de estilo: igual, ou com operador no começo (>= <= > < ! ~ ^ *)
function cssTest(p, want, el, page, ctx, st) {
  const alts = Array.isArray(want) ? want : [want];
  const cx = { fs: st.__fs, pfs: el.parent ? styleOf(page, el.parent, null, ctx).__fs : 16, rfs: styleOf(page, page.dom.html, null, ctx).__fs, vw: ctx.vw, vh: ctx.vh, pw: 400 };
  let last = '';
  for (let w of alts) {
    w = String(w); let op = ''; const m = /^(>=|<=|>|<|!|~|\^|\*)\s*(.*)$/.exec(w); if (m) { op = m[1]; w = m[2]; }
    p = ALIAS[p] || p;
    if (SH[p]) {                                                      // atalho: confere cada pedaço que foi escrito
      const pairs = SH[p].f(w, true); if (!pairs) throw new Error('verificação inválida: ' + p + ': ' + w);
      const bad = pairs.find(([lp, lv]) => { const e = cssWide(lv) ? lv : canon(lp, lv, cx); if (e === null) throw new Error('verificação inválida: ' + lp + ': ' + lv); return posNorm(lp, e, cx) !== st[lp]; });
      if (!bad) return { ok: op !== '!' };
      last = st[bad[0]]; if (op === '!') return { ok: true };
      continue;
    }
    let want2 = p === 'text-decoration' ? null : canon(p, w, cx);
    if (!own(INIT, p)) throw new Error('propriedade desconhecida na verificação: ' + p);
    if (op === '*') { if (st[p] !== INIT[p]) return { ok: true }; last = st[p]; continue; }
    if (want2 === null) throw new Error('valor inválido na verificação: ' + p + ': ' + w);
    want2 = posNorm(p, want2, cx);
    const got = st[p]; last = got; let ok;
    if (op === '') ok = got === want2;
    else if (op === '!') ok = got !== want2;
    else if (op === '~') ok = got.includes(want2);
    else if (op === '^') ok = got.startsWith(want2);
    else { const a = parseFloat(got), b = parseFloat(want2); ok = !Number.isNaN(a) && !Number.isNaN(b) && (op === '>=' ? a >= b : op === '<=' ? a <= b : op === '>' ? a > b : a < b); }
    if (ok) return { ok: true };
  }
  return { ok: false, got: last };
}
const posNorm = (p, v, cx) => p === 'background-position' || p === 'object-position' || p === 'transform-origin' ? posCanon(v, cx) : v;
function attrTest(el, name, want) {
  const v = el.a[name]; const alts = Array.isArray(want) ? want : [want];
  return alts.some(w => {
    if (w === true) return v !== undefined; if (v === undefined) return false;
    if (w === '*') return v.trim() !== '';
    w = String(w); const op = /^[~^$]/.test(w) && w.length > 1 ? w[0] : ''; if (op) w = w.slice(1);
    if (name === 'class' && !op) { const a = nt(v).split(' ').sort().join(' '), b = nt(w).split(' ').sort().join(' '); return a === b; }
    const x = nt(v), y = nt(w);
    return op === '~' ? x.includes(y) : op === '^' ? x.startsWith(y) : op === '$' ? x.endsWith(y) : (name === 'href' || name === 'src' ? v.trim() === w : x === y);
  });
}
function runCheck(page, c, src) {
  const d = describe(c), item = (ok, why) => ({ ok, d, why: ok ? undefined : why });
  if (c.doctype) return item(page.dom.doctype, 'Não achei a linha `<!DOCTYPE html>` no começo do código.');
  if (c.src) { const re = new RegExp(c.src, 'i'); return item(re.test(src), c.m || 'Não achei o que a tarefa pede no código.'); }
  if (c.at) { const f = page.ats.filter(a => a.n === c.at && (c.name === undefined || a.name === c.name)); return item(f.length >= (c.n || 1), c.m || (c.at === 'keyframes' ? 'Não achei essa animação `@keyframes`.' : 'Não achei uma regra `@' + c.at + '`.')); }
  const vw = c.vw || 1024, vh = c.vh || 768, sel = c.s;
  let list; try { list = parseSelectors(sel); } catch (e) { throw new Error('seletor inválido na verificação (' + sel + '): ' + e.message); }
  const pe = list.map(x => x.pe).find(Boolean) || null;
  const found = page.dom.all.filter(el => list.some(cx => matchComplex(el, cx, cx.parts.length - 1, {})));
  const n = c.n === undefined ? 1 : c.n, why = [];
  const okEls = found.filter(el => {
    if (c.text !== undefined && textOf(el) !== nt(c.text)) { why.push(['text', el]); return false; }
    if (c.has !== undefined && !textOf(el).includes(nt(c.has))) { why.push(['has', el]); return false; }
    if (c.re !== undefined && !new RegExp(c.re, 'i').test(textOf(el))) { why.push(['re', el]); return false; }
    if (c.a) for (const k of Object.keys(c.a)) if (!attrTest(el, k, c.a[k])) { why.push(['a:' + k, el]); return false; }
    if (c.css) {
      const stn = c.hover ? 'hover' : c.state || null, set = new Set();
      if (stn) for (let e = el; e; e = stn === 'focus' ? null : e.parent) set.add(e);
      const ctx = { vw, vh, st: stn ? { name: stn, set } : null, key: vw + 'x' + vh + '|' + (stn ? stn + el.id : '') };
      const st = styleOf(page, el, pe, ctx);
      if (pe && (st.content === 'normal' || st.content === 'none')) { why.push(['pe', el]); return false; }
      for (const k of Object.keys(c.css)) { const r = cssTest(k, c.css[k], el, page, ctx, st); if (!r.ok) { why.push(['css:' + k, el, r.got]); return false; } }
    }
    return true;
  });
  if (c.eq !== undefined) { const ok = c.eq === 0 && !c.css && c.text === undefined && c.has === undefined && !c.a ? found.length === 0 : okEls.length === c.eq; return item(ok, c.m || (c.eq === 0 ? 'Não era para ter ' + tagName(sel) + ' aqui, mas achei ' + found.length + '.' : 'Achei ' + okEls.length + ' certo(s), mas precisa ser exatamente ' + c.eq + '.')); }
  if (c.max !== undefined) return item(okEls.length <= c.max, c.m || 'Tem mais de ' + c.max + ' ' + tagName(sel) + '.');
  if (c.all) { const good = found.length > 0 && okEls.length === found.length; return item(good, c.m || (found.length ? whyText(c, sel, why[0], found) : 'Não encontrei ' + tagName(sel) + '.')); }
  const ok = okEls.length >= n;
  if (ok) return item(true);
  if (c.m) return item(false, c.m);
  if (!found.length) return item(false, (pe ? 'Não encontrei ' + tagName(sel.replace(/::?(before|after)$/, '')) + '.' : 'Não encontrei ' + tagName(sel) + '.'));
  if (okEls.length && okEls.length < n) return item(false, 'Achei ' + okEls.length + ' ' + tagName(sel) + ' certo(s), mas precisa de pelo menos ' + n + '.');
  return item(false, whyText(c, sel, why[0], found));
}
function whyText(c, sel, w, found) {
  if (!w) return 'Confira ' + tagName(sel) + '.';
  const [k, el, got] = w, t = tagName(sel);
  if (k === 'text') return 'O texto do ' + t + ' está “' + short(textOf(el, true)) + '”.';
  if (k === 'has') return 'O texto do ' + t + ' não tem o que a tarefa pede (está “' + short(textOf(el, true)) + '”).';
  if (k === 're') return 'O texto do ' + t + ' (“' + short(textOf(el, true)) + '”) não está no formato pedido.';
  if (k === 'pe') return 'O pseudo-elemento ainda não aparece: falta a propriedade `content`.';
  if (k.startsWith('a:')) { const n = k.slice(2), v = el.a[n]; return v === undefined ? 'O ' + t + ' não tem o atributo `' + n + '`.' : 'O atributo `' + n + '` do ' + t + ' está “' + short(v) + '”.'; }
  if (k.startsWith('css:')) { const n = k.slice(4); return '`' + n + '` do ' + t + ' está valendo `' + short(got === undefined ? '' : got, 50) + '`.'; }
  return 'Confira ' + t + '.';
}

// dicas sobre tags e chaves que ficaram abertas (só ajudam; não reprovam sozinhas)
function hints(dom, cssTexts) {
  const out = [], seen = new Set();
  for (const e of dom.errs) { const key = e.k + e.tag; if (seen.has(key)) continue; seen.add(key); out.push(e.k === 'unclosed' ? 'Você abriu `<' + e.tag + '>` mas não fechou com `</' + e.tag + '>`.' : 'Tem um `</' + e.tag + '>` sobrando, sem o `<' + e.tag + '>` que ele fecha.'); if (out.length >= 3) break; }
  for (const t of cssTexts) {
    const s = stripComments(t); let d = 0, q = ''; for (const c of s) { if (q) { if (c === q) q = ''; continue; } if (c === '"' || c === "'") q = c; else if (c === '{') d++; else if (c === '}') d--; }
    if (d > 0) { out.push('Falta fechar uma chave `}` no CSS.'); break; } if (d < 0) { out.push('Tem uma chave `}` sobrando no CSS.'); break; }
  }
  return out.slice(0, 4);
}

// grade(lição, código do aluno) -> { ok, hc: { items: [{ ok, d, why }], hints: [] } }
//   edit 'html' | 'doc': o aluno escreve o HTML (a lição pode trazer l.css, um CSS já pronto)   ·   edit 'css': o aluno escreve só o CSS, e a página pronta vem em l.page
function grade(l, code) {
  code = String(code == null ? '' : code).slice(0, MAXLEN);
  const css = l.edit === 'css', page = css ? makePage(l.page || '', { post: [code] }) : makePage(code, { pre: l.css ? [l.css] : [] });
  const items = (l.checks || []).map(c => runCheck(page, c, code)), ok = items.length > 0 && items.every(i => i.ok);
  const cssTexts = css ? [code] : page.dom.all.filter(e => e.tag === 'style').map(textOfStyle);
  return { ok, hc: { items, hints: ok ? [] : hints(css ? { errs: [] } : page.dom, cssTexts) } };
}
const pageOf = (l, code) => l.edit === 'css' ? makePage(l.page || '', { post: [String(code)] }) : makePage(code, { pre: l.css ? [l.css] : [] });
// o resultado de um estilo: usado pelas atividades de ler (tools/check-ler.js) e pelos testes
function computed(page, sel, prop, o) {
  o = o || {}; const el = query(page, sel)[0]; if (!el) return undefined;
  const vw = o.vw || 1024, vh = o.vh || 768, stn = o.hover ? 'hover' : null, set = new Set(); if (stn) for (let e = el; e; e = e.parent) set.add(e);
  const ctx = { vw, vh, st: stn ? { name: stn, set } : null, key: vw + 'x' + vh + '|' + (stn ? stn + el.id : '') };
  return styleOf(page, el, o.pe || null, ctx)[prop];
}

module.exports = { parseHtml, parseCss, parseSelectors, makePage, pageOf, styleOf, query, grade, runCheck, describe, textOf, computed, canon, parseColor, fmtColor, nt, expandDecl, matchComplex, INIT, MAXLEN };
