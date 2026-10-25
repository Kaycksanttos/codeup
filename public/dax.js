// ============================================================================
// MOTOR DE DAX DO CODEUP (curso Power BI e DAX)
//
// Roda igual no navegador (global DAX) e no servidor (require). Não usa eval: lê a fórmula, monta uma árvore e calcula
// sobre um pequeno modelo de dados (tabelas, relacionamentos 1:N, colunas calculadas e medidas), com CONTEXTO DE LINHA e
// CONTEXTO DE FILTRO como no Power BI. As funções ficam em daxlib.js (este arquivo é o núcleo).
//
// Regras que ele segue:
//  • Fórmula: «Nome da medida = expressão». Vários nomes no mesmo texto viram várias medidas. VAR / RETURN valem.
//  • Separador de argumentos: «,» ou «;». Se a fórmula tiver «;» em algum lugar, ela é lida como no Power BI em português
//    (argumentos com «;» e decimais com vírgula: 0,15). Sem «;», os decimais usam ponto (0.15).
//  • BLANK() é nulo: vale 0 nas somas e subtrações, e BLANK()*5 é BLANK. Texto não diferencia maiúsculas de minúsculas.
//  • Cada linha de um visual (tabela, matriz, gráfico) é um contexto de filtro; linhas em que todas as medidas são vazias somem.
// Não é o Power BI de verdade: cobre o que o curso ensina e pode diferir em casos de borda raros (veja README).
// ============================================================================
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { const D = factory(); require('./daxlib.js')(D); module.exports = D; } else root.DAX = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ---------------------------------------------------------------- erros e utilitários
  class DaxErr extends Error { constructor(m, pos, extra) { super(m); this.name = 'DaxErr'; this.pos = pos == null ? -1 : pos; if (extra) Object.assign(this, extra); } }
  const fail = (m, node, extra) => { throw new DaxErr(m, node && node.p != null ? node.p : -1, extra); };
  const lc = s => String(s).toLowerCase();
  const SEP = '\u0001';
  const vkey = v => v === null || v === undefined ? '\u0000' : typeof v === 'number' ? 'n' + (v === 0 ? 0 : v) : typeof v === 'boolean' ? (v ? 'T' : 'F') : 's' + String(v).toLowerCase();
  const isTbl = v => v !== null && typeof v === 'object' && v.T === 1;
  const MAXROWS = 100000, MAXSTR = 100000;

  const lev = (a, b) => { const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]); for (let j = 1; j <= b.length; j++) d[0][j] = j; for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[a.length][b.length]; };
  const similar = (w, list) => { w = lc(w); let best = null, bd = 3; for (const x of list) { const d = lev(w, lc(x)); if (d < bd) { bd = d; best = x; } } return best; };

  // datas: número de dias desde 30/12/1899 (igual ao Excel); as colunas do tipo data guardam esse número
  const EPOCH = Date.UTC(1899, 11, 30);
  const serial = (y, m, d) => { const t = new Date(0); t.setUTCFullYear(y, m - 1, d); t.setUTCHours(0, 0, 0, 0); return Math.round((t.getTime() - EPOCH) / 864e5); };
  const ymd = s => { const d = new Date(EPOCH + Math.floor(s) * 864e5); return [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()]; };
  const dim = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();
  const addMonths = (s, k) => { const [y, m, d] = ymd(s), t = y * 12 + (m - 1) + k, ny = Math.floor(t / 12), nm = t - ny * 12 + 1; return serial(ny, nm, Math.min(d, dim(ny, nm))); };
  const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const DIAS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  const p2 = n => String(n).padStart(2, '0');
  const dow = s => new Date(EPOCH + Math.floor(s) * 864e5).getUTCDay();

  const shift10 = (x, k) => { const s = String(x); return s.includes('e') ? x * Math.pow(10, k) : Number(s + 'e' + k); };
  const rnd = (x, d) => { const s = Math.abs(x), r = shift10(Math.round(shift10(s, d)), -d); return x < 0 ? -r : r; };   // arredonda 0,5 para longe do zero
  const gen = n => {                                  // número como texto, com vírgula decimal (até 15 dígitos)
    if (Number.isNaN(n)) return 'NaN'; if (!isFinite(n)) return n > 0 ? 'Infinito' : '-Infinito'; if (n === 0) return '0';
    const a = Math.abs(n); if (a >= 1e15 || a < 1e-9) return n.toExponential(5).replace(/\.?0+e/, 'e').replace('e+', 'E+').replace('e-', 'E-').replace('.', ',');
    return String(+n.toPrecision(15)).replace('.', ',');
  };
  const grp = (v, d, sep = true) => { const a = rnd(Math.abs(v), d), t = a.toFixed(d), [i, f] = t.split('.'); return (v < 0 && a !== 0 ? '-' : '') + (sep ? i.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : i) + (f ? ',' + f : ''); };
  const dateTxt = s => { const [y, m, d] = ymd(s); return p2(d) + '/' + p2(m) + '/' + y; };
  // como um resultado aparece na tela: fmt = 'moeda' | 'int' | 'dec1' | 'dec2' | 'pct0' | 'pct1' | 'pct2' | 'data' | 'mesano' | undefined
  function show(v, f) {
    if (v === null || v === undefined) return '(vazio)';
    if (typeof v === 'boolean') return v ? 'Verdadeiro' : 'Falso';
    if (typeof v === 'string') return v;
    if (Number.isNaN(v) || !isFinite(v)) return gen(v);
    switch (f) {
      case 'moeda': return (v < 0 ? '-' : '') + 'R$ ' + grp(Math.abs(v), 2);
      case 'int': return grp(v, 0); case 'dec1': return grp(v, 1); case 'dec2': return grp(v, 2);
      case 'pct0': return grp(v * 100, 0) + '%'; case 'pct1': return grp(v * 100, 1) + '%'; case 'pct2': return grp(v * 100, 2) + '%';
      case 'data': return dateTxt(v);
      case 'mesano': { const [y, m] = ymd(v); return p2(m) + '/' + y; }
    }
    return Number.isInteger(v) ? grp(v, 0) : grp(rnd(v, 4), 4).replace(/,?0+$/, '');
  }

  // ---------------------------------------------------------------- leitura: tokens
  // devolve a lista de tokens: { t: 'num'|'str'|'id'|'br'|'q'|'op', v, p, line, nl } (nl: primeiro da linha)
  function lex(src, ptbr, off = 0, line0 = 1) {
    const T = [], n = src.length; let i = 0, line = line0, nl = true;
    const push = (t, v, p, extra) => { T.push(Object.assign({ t, v, p: p + off, line, nl }, extra)); nl = false; };
    while (i < n) {
      const c = src[i], d = src[i + 1];
      if (c === '\n') { line++; nl = true; i++; continue; }
      if (c === ' ' || c === '\t' || c === '\r' || c === ' ') { i++; continue; }
      if ((c === '/' && d === '/') || (c === '-' && d === '-')) { while (i < n && src[i] !== '\n') i++; continue; }
      if (c === '/' && d === '*') { const e = src.indexOf('*/', i + 2); if (e < 0) fail('Faltou fechar o comentário (*/).', { p: i + off }); for (let k = i; k < e; k++) if (src[k] === '\n') { line++; } i = e + 2; continue; }
      if (c === '"') {
        let j = i + 1, s = '';
        for (; ;) { if (j >= n) fail('Faltou fechar as aspas (") do texto.', { p: i + off }); if (src[j] === '"') { if (src[j + 1] === '"') { s += '"'; j += 2; continue; } break; } s += src[j++]; }
        push('str', s, i); i = j + 1; continue;
      }
      if (c === "'") {
        let j = i + 1, s = '';
        for (; ;) { if (j >= n || src[j] === '\n') fail("Faltou fechar o apóstrofo (') do nome da tabela.", { p: i + off }); if (src[j] === "'") { if (src[j + 1] === "'") { s += "'"; j += 2; continue; } break; } s += src[j++]; }
        push('q', s, i); i = j + 1; continue;
      }
      if (c === '[') {
        let j = i + 1, s = '';
        for (; ;) { if (j >= n || src[j] === '\n') fail('Faltou fechar o colchete (]).', { p: i + off }); if (src[j] === ']') { if (src[j + 1] === ']') { s += ']'; j += 2; continue; } break; } s += src[j++]; }
        push('br', s, i, { adj: i > 0 && !/\s/.test(src[i - 1]) }); i = j + 1; continue;
      }
      if ((c >= '0' && c <= '9') || (c === '.' && d >= '0' && d <= '9')) {
        const m = (ptbr ? /^(?:\d+(?:[.,]\d+)?|[.,]\d+)(?:[eE][+-]?\d+)?/ : /^(?:\d+(?:\.\d+)?|\.\d+)(?:[eE][+-]?\d+)?/).exec(src.slice(i, i + 40));
        push('num', parseFloat(m[0].replace(',', '.')), i); i += m[0].length;
        if (/[A-Za-zÀ-ÿ_]/.test(src[i] || '')) fail('Número seguido de letras: confira se faltou um operador ou um espaço.', { p: i + off });
        continue;
      }
      if (/[A-Za-zÀ-ÿ_Ā-ſ]/.test(c)) {
        let j = i + 1; while (j < n && /[A-Za-zÀ-ÿ_Ā-ſ0-9.]/.test(src[j])) j++;
        while (src[j - 1] === '.') j--;
        push('id', src.slice(i, j), i); i = j; continue;
      }
      const two = src.substr(i, 2);
      if (['<>', '<=', '>=', '==', '&&', '||'].includes(two)) { push('op', two, i); i += 2; continue; }
      if ('+-*/^&=<>(),;{}'.includes(c)) { push('op', c, i); i++; continue; }
      if (c === '.' ) fail('Em DAX o decimal usa ponto (0.15); se você usa ponto e vírgula (;) entre os argumentos, use vírgula (0,15).', { p: i + off });
      fail(`Não entendi o caractere «${c}».`, { p: i + off });
    }
    return T;
  }

  // ---------------------------------------------------------------- leitura: expressões
  const KW = new Set(['VAR', 'RETURN']);
  function parseTokens(T, endPos) {
    let i = 0;
    const peek = () => T[i], next = () => T[i++];
    const isOp = (v, t = T[i]) => !!t && t.t === 'op' && t.v === v;
    const isKw = (v, t = T[i]) => !!t && t.t === 'id' && t.v.toUpperCase() === v;
    const show = t => t ? '«' + (t.t === 'br' ? '[' + t.v + ']' : t.t === 'str' ? '"' + t.v + '"' : t.v) + '»' : 'o fim da fórmula';
    const syn = (t, why) => fail(why || (t ? `Erro de sintaxe perto de ${show(t)}.` : 'A fórmula terminou antes da hora: falta fechar um parêntese ou completar a expressão.'), t || { p: endPos });
    const need = (v, why) => { const t = peek(); if (!isOp(v, t)) syn(t, why); return next(); };
    const isSep = t => isOp(',', t) || isOp(';', t);

    function top() {
      const t0 = peek();
      if (isKw('VAR')) {
        const vars = [];
        while (isKw('VAR')) {
          next(); const nt = next();
          if (!nt || nt.t !== 'id' || KW.has(nt.v.toUpperCase())) syn(nt, 'Depois de VAR vem o nome da variável (sem espaços).');
          need('=', 'Depois do nome da variável vem o sinal de igual (=).');
          vars.push({ n: lc(nt.v), e: top1() });
        }
        if (!isKw('RETURN')) syn(peek(), 'Depois das variáveis (VAR) falta o RETURN com o resultado.');
        next(); return { k: 'let', vars, ret: top(), p: t0.p };
      }
      return or();
    }
    const top1 = () => { const e = or(); return e; };       // o valor de uma VAR termina no próximo VAR/RETURN (que o parser de operadores não consome)
    function or() { let a = and(); while (isOp('||')) { const t = next(); a = { k: 'bin', op: '||', l: a, r: and(), p: t.p }; } return a; }
    function and() { let a = cmp(); while (isOp('&&')) { const t = next(); a = { k: 'bin', op: '&&', l: a, r: cmp(), p: t.p }; } return a; }
    function cmp() {
      let a = cat();
      for (; ;) {
        const t = peek();
        if (t && t.t === 'op' && ['=', '==', '<>', '<', '>', '<=', '>='].includes(t.v)) { next(); a = { k: 'bin', op: t.v, l: a, r: cat(), p: t.p }; }
        else if (isKw('IN')) { next(); a = { k: 'in', l: a, r: cat(), p: t.p }; }
        else if (isKw('NOT') && isKw('IN', T[i + 1])) { next(); next(); a = { k: 'un', op: '!', e: { k: 'in', l: a, r: cat(), p: t.p }, p: t.p }; }
        else break;
      }
      return a;
    }
    function cat() { let a = add(); while (isOp('&')) { const t = next(); a = { k: 'bin', op: '&', l: a, r: add(), p: t.p }; } return a; }
    function add() { let a = mul(); while (isOp('+') || isOp('-')) { const t = next(); a = { k: 'bin', op: t.v, l: a, r: mul(), p: t.p }; } return a; }
    function mul() { let a = una(); while (isOp('*') || isOp('/')) { const t = next(); a = { k: 'bin', op: t.v, l: a, r: una(), p: t.p }; } return a; }
    function una() { if (isOp('-')) { const t = next(); return { k: 'un', op: '-', e: una(), p: t.p }; } if (isOp('+')) { next(); return una(); } return pow(); }
    function pow() { const a = prim(); if (isOp('^')) { const t = next(); return { k: 'bin', op: '^', l: a, r: una(), p: t.p }; } return a; }
    function args() {                                    // já consumiu o "("
      const out = [];
      if (isOp(')')) { next(); return out; }
      for (; ;) {
        if (isSep(peek())) out.push({ k: 'empty', p: peek().p }); else out.push(top());
        const t = peek();
        if (isSep(t)) { next(); if (isOp(')')) { out.push({ k: 'empty', p: peek().p }); next(); return out; } continue; }
        if (isOp(')')) { next(); return out; }
        if (!t) syn(null, 'Faltou fechar um parêntese «)».');
        syn(t, `Erro de sintaxe perto de ${show(t)}: falta um operador (+ - * /) ou um separador (, ou ;) entre os valores?`);
      }
    }
    function prim() {
      const t = next();
      if (!t) syn(null);
      if (t.t === 'num') return { k: 'num', v: t.v, p: t.p };
      if (t.t === 'str') return { k: 'str', v: t.v, p: t.p };
      if (t.t === 'br') return { k: 'ref', n: t.v, p: t.p };
      if (t.t === 'q') { const b = peek(); if (b && b.t === 'br' && b.adj) { next(); return { k: 'col', t: t.v, c: b.v, p: t.p }; } syn(b, `Depois do nome da tabela '${t.v}' vem a coluna entre colchetes, como '${t.v}'[Coluna].`); }
      if (t.t === 'id') {
        const b = peek(), up = t.v.toUpperCase();
        if (isOp('(', b)) { next(); const a = args(); return { k: 'call', f: up, a, p: t.p, raw: t.v }; }
        if (b && b.t === 'br' && b.adj) { next(); return { k: 'col', t: t.v, c: b.v, p: t.p }; }
        if (up === 'TRUE') return { k: 'bool', v: true, p: t.p };
        if (up === 'FALSE') return { k: 'bool', v: false, p: t.p };
        if (KW.has(up)) syn(t, `«${t.v}» aqui está fora do lugar: VAR vem antes do RETURN, e o RETURN só uma vez.`);
        return { k: 'id', n: t.v, p: t.p };
      }
      if (t.t === 'op' && t.v === '(') { const e = top(); need(')', 'Faltou fechar um parêntese «)».'); return e; }
      if (t.t === 'op' && t.v === '{') {
        const rows = []; let w = 1;
        if (isOp('}')) syn(peek(), 'A lista { } está vazia.');
        for (; ;) {
          let row;
          if (isOp('(')) { const save = i; next(); const first = top(); if (isSep(peek())) { row = [first]; while (isSep(peek())) { next(); row.push(top()); } need(')', 'Faltou fechar um parêntese «)».'); } else { i = save; row = [top()]; } }
          else row = [top()];
          w = Math.max(w, row.length); rows.push(row);
          if (isSep(peek())) { next(); continue; }
          if (isOp('}')) { next(); break; }
          syn(peek(), 'Na lista { }, separe os valores com vírgula (ou ponto e vírgula) e feche com }.');
        }
        return { k: 'tcons', rows, w, p: t.p };
      }
      if (t.t === 'op' && t.v === ')') syn(t, 'Há um parêntese «)» sobrando ou faltando um valor antes dele.');
      syn(t, `Faltou um valor antes de ${show(t)}.`);
    }
    const r = top();
    if (i < T.length) { const t = T[i]; syn(t, isOp(')', t) ? 'Há um parêntese «)» a mais.' : `Erro de sintaxe perto de ${show(t)}: falta um operador (+ - * /) ou um separador entre os valores?`); }
    return r;
  }

  // Script com uma ou várias definições: "Nome = expressão" (medida), "Tabela[Coluna] = expressão" (coluna calculada).
  // Uma definição começa numa linha, fora de parênteses, com «texto =». Sem nome nenhum, vale como uma expressão só.
  function scanLines(src) {                           // por linha: profundidade de parênteses/chaves no começo e se está dentro de texto/colchete/comentário
    const n = src.length, starts = [{ p: 0, depth: 0, ok: true }]; let depth = 0, i = 0, semi = false;
    while (i < n) {
      const c = src[i], d = src[i + 1];
      if (c === '"' || c === "'" || c === '[') {
        const close = c === '[' ? ']' : c; let j = i + 1;
        for (; j < n; j++) { if (src[j] === close) { if (src[j + 1] === close) { j++; continue; } break; } if (c !== '"' && src[j] === '\n') { j--; break; } if (src[j] === '\n') starts.push({ p: j + 1, depth, ok: false }); }
        i = j + 1; continue;
      }
      if ((c === '/' && d === '/') || (c === '-' && d === '-')) { while (i < n && src[i] !== '\n') i++; continue; }
      if (c === '/' && d === '*') { const e = src.indexOf('*/', i + 2); const end = e < 0 ? n : e + 2; for (let k = i; k < end; k++) if (src[k] === '\n') starts.push({ p: k + 1, depth, ok: false }); i = end; continue; }
      if (c === '(' || c === '{') depth++; else if (c === ')' || c === '}') depth = Math.max(0, depth - 1);
      else if (c === ';') semi = true;
      else if (c === '\n') starts.push({ p: i + 1, depth, ok: true });
      i++;
    }
    return { starts, semi };
  }
  const HEAD = /^[ \t]*([^\n=<>(){}",;&|]+?)[ \t]*=(?![=<>])/;
  function parseScript(src) {                         // sem «;» a fórmula usa ponto nos decimais; se der erro e tiver «0,15», tenta de novo no modo português
    src = String(src == null ? '' : src);
    try { return parseScriptIn(src, false); } catch (e) {
      if (e instanceof DaxErr && !scanLines(src).semi && /\d,\d/.test(src)) { try { return parseScriptIn(src, true); } catch (e2) { /* fica o erro do primeiro modo */ } }
      throw e;
    }
  }
  function parseScriptIn(src, force) {
    const { starts, semi } = scanLines(src), ptbr = semi || force, heads = [];
    for (const s of starts) {
      if (!s.ok || s.depth !== 0) continue;
      const eol = src.indexOf('\n', s.p), line = src.slice(s.p, eol < 0 ? src.length : eol), m = HEAD.exec(line);
      if (!m) continue;
      const nm = m[1].trim();
      if (!nm || /^[+\-*/^!]/.test(nm) || /^(VAR|RETURN|EVALUATE|DEFINE)\b/i.test(nm) || /^\/\/|^--/.test(nm)) continue;
      heads.push({ at: s.p, bodyAt: s.p + m[0].length, name: nm });
    }
    const lineOf = p => { let k = 1; for (let j = 0; j < p && j < src.length; j++) if (src[j] === '\n') k++; return k; };
    const defs = [];
    if (!heads.length) {
      const toks = lex(src, ptbr);
      if (!toks.length) fail('Escreva a fórmula no formato «Nome da medida = expressão».', { p: 0 });
      return { ptbr, defs: [{ name: null, kind: 'measure', ast: parseTokens(toks, src.length), text: src.trim(), line: 1 }] };
    }
    const before = src.slice(0, heads[0].at).replace(/(\/\/|--)[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
    if (before) fail('A fórmula deve começar com o nome da medida e um sinal de igual: «Nome = expressão».', { p: 0 });
    heads.forEach((h, k) => {
      const end = k + 1 < heads.length ? heads[k + 1].at : src.length, body = src.slice(h.bodyAt, end);
      let name = h.name, table = null, kind = 'measure', m;
      if ((m = /^(?:'([^']+)'|([A-Za-zÀ-ÿ_][\wÀ-ÿ.]*))\s*\[([^\]]+)\]$/.exec(name))) { table = m[1] || m[2]; name = m[3]; kind = 'column'; }
      else if ((m = /^\[(.+)\]$/.exec(name))) name = m[1];
      else if ((m = /^'(.+)'$/.exec(name))) name = m[1];
      const toks = lex(body, ptbr, h.bodyAt, lineOf(h.bodyAt));
      if (!toks.length) fail(`A medida «${name}» está sem fórmula depois do igual.`, { p: h.bodyAt });
      defs.push({ name, table, kind, ast: parseTokens(toks, end), text: body.trim(), line: lineOf(h.at) });
    });
    return { ptbr, defs };
  }
  const expr = text => { const s = parseScript(text); if (s.defs.length !== 1) fail('Esperava uma única expressão.'); return s.defs[0].ast; };
  const PCACHE = new Map();
  function parseCached(src) { let a = PCACHE.get(src); if (!a) { a = parseScript(src); if (PCACHE.size > 2000) PCACHE.clear(); PCACHE.set(src, a); } return a; }

  // ---------------------------------------------------------------- modelo de dados
  const guessType = vals => { let t = null; for (const v of vals) { if (v === null) continue; const x = typeof v === 'number' ? 'num' : typeof v === 'boolean' ? 'bool' : 'text'; if (t && t !== x) return 'text'; t = x; } return t === 'num' ? 'dec' : t || 'text'; };
  class Model {
    constructor(spec) {
      this.spec = spec; this.T = new Map(); this.rels = []; this.M = new Map(); this.dateCol = spec.dateCol || null;
      for (const [name, t] of Object.entries(spec.tables)) this.addTable(name, t);
      (spec.rels || []).forEach((r, i) => this.addRel(r, i));
      for (const [ref, text] of Object.entries(spec.calc || {})) this.addCalc(ref, text);
      for (const [name, text] of Object.entries(spec.measures || {})) this.addMeasure(name, text);
    }
    addTable(name, t) {
      const cols = t.cols.map(c => typeof c === 'string' ? { n: c, t: 'text' } : { ...c });
      const T = { name, cols, ci: new Map(cols.map((c, i) => [lc(c.n), i])), rows: t.rows.map(r => r.slice()), kc: new Map() };
      if (t.rows.some(r => r.length !== cols.length)) throw new Error(`modelo: a tabela ${name} tem linha com número de colunas diferente`);
      T.all = T.rows.map((_, i) => i); this.T.set(lc(name), T); return T;
    }
    tbl(name, node) {
      const T = this.T.get(lc(name));
      if (!T) fail(`A tabela '${name}' não existe no modelo.${(s => s ? ` Você quis dizer '${s}'?` : '')(similar(name, [...this.T.values()].map(x => x.name)))}`, node);
      return T;
    }
    col(tname, cname, node) {
      const T = this.tbl(tname, node), ci = T.ci.get(lc(cname));
      if (ci === undefined) fail(`A coluna ${T.name}[${cname}] não existe.${(s => s ? ` Você quis dizer ${T.name}[${s}]?` : '')(similar(cname, T.cols.map(c => c.n)))}`, node);
      return [T, ci];
    }
    colRef(ref, node) { const m = /^(?:'([^']+)'|([^'\[\]]+))\[([^\]]+)\]$/.exec(String(ref).trim()); if (!m) fail(`Referência de coluna inválida: ${ref}`, node); return this.col(m[1] || m[2], m[3], node); }
    addRel(r, i) {
      const [a, b, o] = Array.isArray(r) ? [r[0], r[1], r[2] || {}] : [r.from, r.to, r];
      const [T1, c1] = this.colRef(a), [T2, c2] = this.colRef(b), rel = { id: i, m: { t: T1, ci: c1 }, o: { t: T2, ci: c2 }, active: o.active !== false, both: !!o.both, name: o.name || null, idx: new Map() };
      T2.rows.forEach((row, j) => { const k = vkey(row[c2]); if (!rel.idx.has(k)) rel.idx.set(k, j); });
      this.rels.push(rel);
    }
    addCalc(ref, text) {
      const m = /^(?:'([^']+)'|([^'\[\]]+))\[([^\]]+)\]$/.exec(ref); if (!m) throw new Error('modelo: coluna calculada inválida ' + ref);
      const T = this.tbl(m[1] || m[2]), cn = m[3], ast = expr(text), R = newRun(this), vals = [];
      for (let i = 0; i < T.rows.length; i++) { const st = { R, ctx: rootCtx(), fr: [frameBase(T, i)], env: Object.create(null) }; vals.push(scalar(ev(ast, st), ast)); }
      vals.forEach((v, i) => T.rows[i].push(v)); T.ci.set(lc(cn), T.cols.length); T.cols.push({ n: cn, t: guessType(vals), calc: true }); T.kc.clear(); T.meta = null;
    }
    addMeasure(name, text) { const s = parseCached(text); if (s.defs.length !== 1) fail('Esperava uma única expressão.'); this.M.set(lc(name), { name, text, ast: s.defs[0].ast }); }
    with(measures) {                                  // cópia do modelo com medidas a mais (as definições do aluno)
      const m = Object.create(this); m.M = new Map(this.M);
      for (const [name, ast] of measures) m.M.set(lc(name), { name, ast });
      return m;
    }
    activeRels(ctx) {
      if (!ctx.ur || !ctx.ur.length) return this.rels.filter(r => r.active);
      return this.rels.filter(r => (r.active && !ctx.ur.some(u => u !== r && ((u.m.t === r.m.t && u.o.t === r.o.t) || (u.m.t === r.o.t && u.o.t === r.m.t)))) || ctx.ur.includes(r));
    }
    rkey(T, cs, i) { const r = T.rows[i]; let s = vkey(r[cs[0]]); for (let k = 1; k < cs.length; k++) s += SEP + vkey(r[cs[k]]); return s; }
    filtered(T, ctx) {                                // a tabela T tem filtro (próprio ou vindo de outra tabela)?
      const c = ctx._fl || (ctx._fl = new Map()); if (c.has(T)) return c.get(T);
      const walk = (t, seen) => {
        if (seen.has(t)) return false; seen.add(t);
        if (ctx.f.some(x => x.t === t)) return true;
        for (const x of this.activeRels(ctx)) if ((x.m.t === t && walk(x.o.t, seen)) || (x.both && x.o.t === t && walk(x.m.t, seen))) return true;
        return false;
      };
      const r = walk(T, new Set()); c.set(T, r); return r;
    }
    // linhas da tabela T que "passam" pelo contexto de filtro (filtros da própria tabela e os que chegam pelos relacionamentos)
    visible(T, ctx, skip) {
      const cache = skip ? null : (ctx._v || (ctx._v = new Map())); if (cache && cache.has(T)) return cache.get(T);
      let ids = null;
      for (const x of ctx.f) if (x.t === T) { const base = ids || T.all; ids = base.filter(i => x.set.has(this.rkey(T, x.cs, i))); }
      for (const r of this.activeRels(ctx)) {
        if (skip && skip.has(r.id)) continue;
        if (r.m.t === T && this.filtered(r.o.t, ctx)) {
          const D = r.o.t, ks = new Set(); for (const j of this.visible(D, ctx, skip)) ks.add(vkey(D.rows[j][r.o.ci]));
          ids = (ids || T.all).filter(i => ks.has(vkey(T.rows[i][r.m.ci])));
        } else if (r.both && r.o.t === T && this.filtered(r.m.t, ctx)) {
          const sk = new Set(skip || []); sk.add(r.id); const Mt = r.m.t, ks = new Set(); for (const j of this.visible(Mt, ctx, sk)) ks.add(vkey(Mt.rows[j][r.m.ci]));
          ids = (ids || T.all).filter(i => ks.has(vkey(T.rows[i][r.o.ci])));
        }
      }
      ids = ids || T.all; if (cache) cache.set(T, ids); return ids;
    }
    // caminho (lista de relacionamentos "muitos → um") para ir de uma tabela a outra
    path(from, to, ctx) {
      if (from === to) return [];
      const rels = this.activeRels(ctx), seen = new Set([from]); let q = [[from, []]];
      while (q.length) { const nq = []; for (const [t, p] of q) for (const r of rels) if (r.m.t === t && !seen.has(r.o.t)) { const np = p.concat(r); if (r.o.t === to) return np; seen.add(r.o.t); nq.push([r.o.t, np]); } q = nq; }
      return null;
    }
    related(T0, i0, T1, ci, ctx) { const p = this.path(T0, T1, ctx); if (!p) return undefined; let cur = T0, i = i0; for (const r of p) { const j = r.idx.get(vkey(cur.rows[i][r.m.ci])); if (j === undefined) return null; cur = r.o.t; i = j; } return T1.rows[i][ci]; }
  }

  // ---------------------------------------------------------------- contexto de filtro
  // ctx = { f: [{ t: tabela, cs: [colunas], set: Set de chaves }], ur: [relacionamentos ativados], vis: contexto do visual (ALLSELECTED), scope: colunas em agrupamento }
  const rootCtx = () => ({ f: [], ur: null, vis: null, scope: null });
  const nctx = (c, f, over) => Object.assign({ f, ur: c.ur, vis: c.vis, scope: c.scope }, over || null);
  function dropCols(ctx, T, cols) {                  // tira os filtros das colunas `cols` (null = a tabela toda) da tabela T
    const f = []; let ch = false;
    for (const x of ctx.f) {
      if (x.t !== T) { f.push(x); continue; }
      if (cols === null) { ch = true; continue; }
      const keep = x.cs.filter(c => !cols.includes(c));
      if (keep.length === x.cs.length) { f.push(x); continue; }
      ch = true; if (!keep.length) continue;
      const pos = keep.map(c => x.cs.indexOf(c)), set = new Set();
      for (const k of x.set) { const parts = x.cs.length === 1 ? [k] : k.split(SEP); set.add(pos.map(p => parts[p]).join(SEP)); }
      f.push({ t: T, cs: keep, set });
    }
    return ch ? nctx(ctx, f) : ctx;
  }
  const addCon = (ctx, T, cs, set) => nctx(ctx, ctx.f.concat([{ t: T, cs, set }]));
  const setFilter = (ctx, T, cs, set) => addCon(dropCols(ctx, T, cs), T, cs, set);
  const colSet = (ctx, T, cs) => ctx.f.filter(x => x.t === T && x.cs.some(c => cs.includes(c)));

  // ---------------------------------------------------------------- valores
  const mkT = (cols, rows, o) => Object.assign({ T: 1, cols, rows }, o);
  const metaOf = T => T.meta || (T.meta = T.cols.map(c => ({ n: c.n, lin: T.name + '[' + c.n + ']' })));
  const tableVal = (M, T, ids) => mkT(metaOf(T), ids.map(i => T.rows[i]), { ids, bt: T });
  function colVals(M, T, ci, ids) {                  // valores distintos de uma coluna (na ordem em que aparecem)
    const seen = new Set(), rows = [];
    for (const i of ids) { const v = T.rows[i][ci], k = vkey(v); if (!seen.has(k)) { seen.add(k); rows.push([v]); } }
    return mkT([{ n: T.cols[ci].n, lin: T.name + '[' + T.cols[ci].n + ']' }], rows);
  }
  const frameBase = (T, i) => ({ base: { t: T, i }, vals: new Map(), lin: [] });
  function frameOf(M, tv, k) {
    const row = tv.rows[k], fr = { base: tv.bt && tv.ids ? { t: tv.bt, i: tv.ids[k] } : null, vals: new Map(), lin: [] };
    tv.cols.forEach((c, j) => {
      if (c.lin && tv.bt && c.lin.startsWith(tv.bt.name + '[') && fr.base) return;
      if (c.lin) { fr.vals.set(lc(c.lin), row[j]); fr.lin.push([c.lin, row[j]]); } else fr.vals.set('[' + lc(c.n) + ']', row[j]);
    });
    return fr;
  }
  // linhas de contexto viram filtros (transição de contexto)
  function transition(M, st) {
    let ctx = st.ctx;
    for (const fr of st.fr) {
      if (fr.base) { const T = fr.base.t, cs = T.cols.map((_, i) => i); ctx = setFilter(ctx, T, cs, new Set([M.rkey(T, cs, fr.base.i)])); }
      for (const [lin, v] of fr.lin) { const [T, ci] = M.colRef(lin); ctx = setFilter(ctx, T, [ci], new Set([vkey(v)])); }
    }
    return ctx;
  }
  // tabela usada como filtro: vira filtros por tabela (colunas com linhagem) – substitui os filtros dessas colunas
  function tableFilter(M, ctx, tv, keep) {
    const by = new Map();
    tv.cols.forEach((c, j) => { if (!c.lin) return; const [T, ci] = M.colRef(c.lin); if (!by.has(T)) by.set(T, []); by.get(T).push([ci, j]); });
    if (!by.size) fail('A tabela usada como filtro não tem colunas ligadas ao modelo.');
    for (const [T, pairs] of by) {
      const cs = [], js = []; for (const [ci, j] of pairs) if (!cs.includes(ci)) { cs.push(ci); js.push(j); }
      const set = new Set(); for (const r of tv.rows) set.add(js.map(j => vkey(r[j])).join(SEP));
      ctx = keep ? addCon(ctx, T, cs, set) : setFilter(ctx, T, cs, set);
    }
    return ctx;
  }

  // ---------------------------------------------------------------- conversões e operadores
  const num = (v, node) => {
    if (v === null || v === undefined) return null;
    if (typeof v === 'number') return v;
    if (typeof v === 'boolean') return v ? 1 : 0;
    if (typeof v === 'string') { const m = /^\s*[+-]?(\d+([.,]\d+)?|[.,]\d+)\s*$/.exec(v); if (m) return parseFloat(v.replace(',', '.')); fail(`Não dá para fazer conta com o texto "${v}".`, node); }
    fail('Era esperado um número, mas veio uma tabela.', node);
  };
  const str = (v, node) => {
    if (v === null || v === undefined) return '';
    if (typeof v === 'string') return v;
    if (typeof v === 'number') return gen(v);
    if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
    fail('Era esperado um texto, mas veio uma tabela.', node);
  };
  const bool = (v, node) => {
    if (v === null || v === undefined) return false;
    if (typeof v === 'boolean') return v;
    if (typeof v === 'number') return v !== 0;
    if (typeof v === 'string') { const t = lc(v); if (t === 'true') return true; if (t === 'false') return false; fail(`Não dá para usar o texto "${v}" como verdadeiro/falso.`, node); }
    fail('Era esperado verdadeiro/falso, mas veio uma tabela.', node);
  };
  function scalar(v, node) {
    if (!isTbl(v)) return v;
    if (v.cols.length === 1 && v.rows.length === 1) return v.rows[0][0];
    if (v.cols.length === 1 && v.rows.length === 0) return null;
    fail(v.cols.length > 1 ? 'A expressão devolve uma tabela com várias colunas, mas era esperado um valor só.' : `A expressão devolve ${v.rows.length} valores, mas era esperado um só. Use uma agregação (SUM, MAX…) ou SELECTEDVALUE.`, node);
  }
  const cmpv = (a, b) => {                           // -1, 0, 1 (BLANK vale 0, "" ou FALSO conforme o outro lado; texto sem diferenciar maiúsculas)
    if (a === null && b === null) return 0;
    if (a === null) a = typeof b === 'string' ? '' : typeof b === 'boolean' ? false : 0;
    if (b === null) b = typeof a === 'string' ? '' : typeof a === 'boolean' ? false : 0;
    const ra = typeof a === 'number' ? 0 : typeof a === 'string' ? 1 : 2, rb = typeof b === 'number' ? 0 : typeof b === 'string' ? 1 : 2;
    if (ra !== rb) return ra < rb ? -1 : 1;
    if (ra === 1) { const x = lc(a), y = lc(b); return x === y ? 0 : x.localeCompare(y, 'pt-BR') < 0 ? -1 : 1; }
    return a < b ? -1 : a > b ? 1 : 0;
  };
  function arith(op, a, b, node) {
    a = num(a, node); b = num(b, node);
    switch (op) {
      case '+': return a === null && b === null ? null : (a || 0) + (b || 0);
      case '-': return a === null && b === null ? null : (a || 0) - (b || 0);
      case '*': return a === null || b === null ? null : a * b;
      case '/': if (b === null) return a === null ? null : a === 0 ? NaN : Infinity; if (b === 0) return a === null ? Infinity : a === 0 ? NaN : a > 0 ? Infinity : -Infinity; return a === null ? null : a / b;
      case '^': return a === null && b === null ? null : Math.pow(a || 0, b || 0);
    }
  }

  // ---------------------------------------------------------------- execução
  const newRun = (M, o) => ({ M, ops: 0, max: (o && o.max) || 4e6, depth: 0 });
  const FN = Object.create(null);
  const def = (names, min, max, f) => { for (const n of [].concat(names)) FN[n] = { min, max, f }; };
  const RUNLIM = 'A fórmula ficou pesada demais para calcular (muitas linhas ou cálculos repetidos). Simplifique-a.';

  function colNode(st, node) {                        // resolve Tabela[Coluna] no modelo (com cache no nó)
    const M = st.R.M; if (node._m === M) return node._r;
    const [T, ci] = M.col(node.t, node.c, node); node._m = M; node._r = [T, ci]; return node._r;
  }
  function frameLookup(st, T, ci, skip) {             // valor de T[coluna] no contexto de linha mais interno (skip: quantos pular, para EARLIER)
    const key = lc(T.name) + '[' + lc(T.cols[ci].n) + ']';
    for (let k = st.fr.length - 1; k >= 0; k--) {
      const fr = st.fr[k];
      if (fr.vals.has(key)) { if (skip-- > 0) continue; return { v: fr.vals.get(key) }; }
      if (fr.base && fr.base.t === T) { if (skip-- > 0) continue; return { v: T.rows[fr.base.i][ci] }; }
    }
    return null;
  }
  function distinctScalar(st, T, ci, node) {          // coluna fora de um contexto de linha: vale o único valor visível (como VALUES)
    const ids = st.R.M.visible(T, st.ctx), tv = colVals(st.R.M, T, ci, ids);
    if (tv.rows.length === 1) return tv.rows[0][0]; if (!tv.rows.length) return null;
    fail(`Não dá para saber um valor único para ${T.name}[${T.cols[ci].n}]: ela tem ${tv.rows.length} valores neste contexto. Use uma agregação como SUM, MAX, MIN, COUNT ou SELECTEDVALUE.`, node);
  }
  function callMeasure(st, m, node) {
    const R = st.R; if (++R.depth > 40) fail(`A medida [${m.name}] chama a si mesma (ou há um ciclo entre medidas).`, node);
    try { const ctx = st.fr.length ? transition(R.M, st) : st.ctx; return ev(m.ast, { R, ctx, fr: [], env: Object.create(null) }); } finally { R.depth--; }
  }
  function ev(node, st) {
    if (++st.R.ops > st.R.max) fail(RUNLIM, node);
    switch (node.k) {
      case 'num': case 'str': case 'bool': return node.v;
      case 'empty': return null;
      case 'un': { if (node.op === '!') return !bool(scalar(ev(node.e, st), node), node); const v = num(scalar(ev(node.e, st), node), node); return v === null ? null : -v; }
      case 'bin': {
        const op = node.op;
        if (op === '&&') { const a = bool(scalar(ev(node.l, st), node), node); return a ? bool(scalar(ev(node.r, st), node), node) : false; }
        if (op === '||') { const a = bool(scalar(ev(node.l, st), node), node); return a ? true : bool(scalar(ev(node.r, st), node), node); }
        const a = scalar(ev(node.l, st), node.l), b = scalar(ev(node.r, st), node.r);
        switch (op) {
          case '+': case '-': case '*': case '/': case '^': return arith(op, a, b, node);
          case '&': { const s = str(a, node) + str(b, node); if (s.length > MAXSTR) fail('Texto grande demais.', node); return s; }
          case '=': return cmpv(a, b) === 0;
          case '==': return a === null || b === null ? a === b : cmpv(a, b) === 0 && typeof a === typeof b;
          case '<>': return cmpv(a, b) !== 0;
          case '<': return cmpv(a, b) < 0; case '>': return cmpv(a, b) > 0; case '<=': return cmpv(a, b) <= 0; case '>=': return cmpv(a, b) >= 0;
        }
        fail('Operador desconhecido.', node);
      }
      case 'in': {
        const a = scalar(ev(node.l, st), node.l), t = node.r.k === 'col' ? lib.valuesOf(node.r, st) : ev(node.r, st);
        if (!isTbl(t)) return cmpv(a, t) === 0;
        return t.rows.some(r => cmpv(a, r[0]) === 0);
      }
      case 'col': {
        const [T, ci] = colNode(st, node), f = frameLookup(st, T, ci, 0);
        return f ? f.v : distinctScalar(st, T, ci, node);
      }
      case 'ref': {
        const nm = lc(node.n);
        for (let k = st.fr.length - 1; k >= 0; k--) if (st.fr[k].vals.has('[' + nm + ']')) return st.fr[k].vals.get('[' + nm + ']');
        const m = st.R.M.M.get(nm); if (m) return callMeasure(st, m, node);
        for (let k = st.fr.length - 1; k >= 0; k--) { const b = st.fr[k].base; if (b && b.t.ci.has(nm)) return b.t.rows[b.i][b.t.ci.get(nm)]; }
        const names = [...st.R.M.M.values()].map(x => x.name);
        fail(`Não achei a medida [${node.n}].${(s => s ? ` Você quis dizer [${s}]?` : '')(similar(node.n, names))} Se for uma coluna, escreva Tabela[Coluna].`, node);
      }
      case 'id': {
        const nm = lc(node.n); let e = st.env; if (nm in e) return e[nm];
        const T = st.R.M.T.get(nm);
        if (T) return tableVal(st.R.M, T, st.R.M.visible(T, st.ctx));
        const vs = []; for (const k in e) vs.push(k);
        fail(`«${node.n}» não é uma variável nem uma tabela do modelo.${(s => s ? ` Você quis dizer ${s}?` : '')(similar(node.n, [...vs, ...[...st.R.M.T.values()].map(x => x.name)]))}`, node);
      }
      case 'let': {
        const env = Object.create(st.env), s2 = { R: st.R, ctx: st.ctx, fr: st.fr, env };
        for (const v of node.vars) env[v.n] = ev(v.e, s2);
        return ev(node.ret, s2);
      }
      case 'tcons': {
        const rows = node.rows.map(r => { const o = r.map(e => scalar(ev(e, st), e)); while (o.length < node.w) o.push(null); return o; });
        return mkT(Array.from({ length: node.w }, (_, i) => ({ n: node.w === 1 ? 'Value' : 'Value' + (i + 1), lin: null })), rows);
      }
      case 'call': {
        const f = FN[node.f];
        if (!f) fail(`A função ${node.raw} não existe no DAX.${(s => s ? ` Você quis dizer ${s}?` : '')(similar(node.f, Object.keys(FN)))}`, node);
        if (node.a.length < f.min || node.a.length > f.max) fail(f.min === f.max ? `A função ${node.f} espera ${f.min} argumento${f.min === 1 ? '' : 's'}, mas recebeu ${node.a.length}.` : node.a.length < f.min ? `A função ${node.f} precisa de pelo menos ${f.min} argumento${f.min === 1 ? '' : 's'}, mas recebeu ${node.a.length}.` : `A função ${node.f} aceita no máximo ${f.max} argumentos, mas recebeu ${node.a.length}.`, node);
        return f.f(node.a, st, node);
      }
    }
    fail('Expressão não suportada.', node);
  }
  const evT = (node, st) => {
    if (node.k === 'col') return lib.valuesOf(node, st);
    const v = ev(node, st); if (!isTbl(v)) fail('Aqui era esperada uma tabela (por exemplo o nome de uma tabela, FILTER, VALUES, ALL…).', node); return v;
  };
  const sv = (node, st) => scalar(ev(node, st), node);          // valor único
  const lib = {};                                                // preenchido pelo daxlib.js

  // ---------------------------------------------------------------- visual (tabela / matriz / cartão): cada linha é um contexto de filtro
  // spec: { by: ['Tabela[Coluna]', ...], slicers: { 'Tabela[Coluna]': [valores] } }; defs: [{ name, ast }]
  function runVisual(M0, spec, defs, o) {
    const M = defs && defs.length ? M0.with(defs.filter(d => d.local !== false).map(d => [d.name, d.ast])) : M0, R = newRun(M, o);
    let ctx0 = rootCtx(); ctx0.scope = new Set();
    for (const [ref, vals] of Object.entries(spec.slicers || {})) { const [T, ci] = M.colRef(ref); ctx0 = setFilter(ctx0, T, [ci], new Set(vals.map(vkey))); }
    ctx0.vis = ctx0;
    const by = (spec.by || []).map(r => { const [T, ci] = M.colRef(r); return { ref: r, T, ci }; });
    const evalAt = ctx => defs.map(d => scalar(ev(d.ast, { R, ctx, fr: [], env: Object.create(null) }), d.ast));
    const total = evalAt(ctx0);
    if (!by.length) return { by: [], names: defs.map(d => d.name), rows: [{ g: [], v: total }], total };
    const groups = new Map();                          // por tabela: combinações das colunas de agrupamento que existem nos dados
    for (const b of by) { if (!groups.has(b.T)) groups.set(b.T, []); groups.get(b.T).push(b); }
    let combos = [[]];
    for (const [T, bs] of groups) {
      const ids = M.visible(T, ctx0), seen = new Map();
      for (const i of ids) { const key = bs.map(b => vkey(T.rows[i][b.ci])).join(SEP); if (!seen.has(key)) seen.set(key, bs.map(b => T.rows[i][b.ci])); }
      const opts = [...seen.values()]; const nc = [];
      for (const c of combos) for (const op of opts) nc.push(c.concat([[T, bs, op]]));
      combos = nc; if (combos.length > 5000) fail('Combinações demais no visual.');
    }
    const rows = [];
    for (const c of combos) {
      let ctx = ctx0; const g = new Array(by.length);
      for (const [T, bs, op] of c) {
        ctx = setFilter(ctx, T, bs.map(b => b.ci), new Set([bs.map((b, k) => vkey(op[k])).join(SEP)]));
        bs.forEach((b, k) => { g[by.indexOf(b)] = op[k]; });
      }
      ctx = nctx(ctx, ctx.f, { scope: new Set(by.map(b => lc(b.ref))) });
      const v = evalAt(ctx);
      if (v.every(x => x === null)) continue;
      rows.push({ g, v });
    }
    rows.sort((a, b) => { for (let k = 0; k < by.length; k++) { const c = cmpv(a.g[k], b.g[k]); if (c) return c; } return 0; });
    return { by: by.map(b => b.ref), names: defs.map(d => d.name), rows, total };
  }

  return {
    DaxErr, fail, lc, vkey, SEP, isTbl, similar, lev, MAXROWS, MAXSTR,
    serial, ymd, dim, addMonths, MESES, DIAS, p2, dow, EPOCH, rnd, gen, grp, show, dateTxt,
    lex, parseScript, parse: parseCached, parseTokens, expr, Model, FN, def, lib,
    K: { ev, evT, sv, scalar, num, str, bool, cmpv, arith, mkT, metaOf, tableVal, colVals, frameOf, frameBase, transition, tableFilter, rootCtx, nctx, dropCols, addCon, setFilter, colSet, colNode, frameLookup, newRun, isTbl, ST: (R, ctx, fr, env) => ({ R, ctx, fr: fr || [], env: env || Object.create(null) }) },
    runVisual, newRun,
    fnNames: () => Object.keys(FN),
    // avalia uma expressão sozinha (testes e conferências): ctx opcional { 'Tabela[Coluna]': [valores] }
    evalExpr(M, text, filters) {
      const ast = typeof text === 'string' ? expr(text) : text, R = newRun(M); let ctx = rootCtx(); ctx.scope = new Set();
      for (const [ref, vals] of Object.entries(filters || {})) { const [T, ci] = M.colRef(ref); ctx = setFilter(ctx, T, [ci], new Set([].concat(vals).map(vkey))); }
      ctx.vis = ctx;
      return ev(ast, { R, ctx, fr: [], env: Object.create(null) });
    }
  };
});
