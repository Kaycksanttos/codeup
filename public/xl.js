// ============================================================================
// MOTOR DE FÓRMULAS DO EXCEL EM PORTUGUÊS (usado pelo curso Excel do CodeUp)
//
// Roda igual no navegador (global XL) e no servidor (require). Não usa eval: lê a fórmula, monta uma árvore e calcula.
// Regras do Excel em português que ele segue: "=" no começo, ";" separando argumentos, vírgula nos decimais (1,5),
// nomes de função em português (SOMA, SE, PROCV...), referências A1 / $A$1 / A1:B5 / A:A, operadores + - * / ^ & % = <> < > <= >=.
// Aceita os nomes das funções com ou sem acento (MÉDIA ou MEDIA). Não é o Excel de verdade: cobre as funções mais usadas
// e pode diferir em casos de borda raros (veja a lista em FUNCS e o README).
// ============================================================================
(function (root, factory) { if (typeof module === 'object' && module.exports) module.exports = factory(); else root.XL = factory(); })(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ---------------------------------------------------------------- erros e utilitários
  class XlErr { constructor(code) { this.code = code; } toString() { return this.code; } }
  const E = { DIV0: '#DIV/0!', VALUE: '#VALOR!', REF: '#REF!', NAME: '#NOME?', NA: '#N/D', NUM: '#NÚM!' };
  const err = c => new XlErr(c), isErr = v => v instanceof XlErr;
  const strip = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '');
  const normName = s => strip(s).toUpperCase();
  const MAXLEN = 600, MAXDEPTH = 60, MAXCELLS = 60000;

  const colN = s => { let n = 0; for (const ch of s.toUpperCase()) n = n * 26 + ch.charCodeAt(0) - 64; return n; };
  const colL = n => { let s = ''; while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; };
  const addr = (c, r) => colL(c) + r;
  const parseAddr = a => { const m = /^\$?([A-Za-z]{1,3})\$?(\d{1,7})$/.exec(String(a)); return m ? { c: colN(m[1]), r: +m[2] } : null; };

  // número "como o Excel escreve" (até 15 dígitos, vírgula decimal)
  const gen = n => {
    if (!isFinite(n)) return '#NÚM!'; if (n === 0) return '0';
    const a = Math.abs(n);
    if (a >= 1e15 || a < 1e-9) return n.toExponential(5).replace(/\.?0+e/, 'e').replace('e+', 'E+').replace('e-', 'E-').replace('.', ',');
    return String(+n.toPrecision(15)).replace('.', ',');
  };
  const shift10 = (x, k) => { const s = String(x); return s.includes('e') ? x * Math.pow(10, k) : Number(s + 'e' + k); };
  const rnd = (x, d) => { const s = Math.abs(x), r = shift10(Math.round(shift10(s, d)), -d); return x < 0 ? -r : r; };   // arredonda 0,5 para longe do zero, como o Excel
  const grp = (v, d, sep = true) => {
    const a = rnd(Math.abs(v), d), t = a.toFixed(d), [i, f] = t.split('.');
    return (v < 0 && a !== 0 ? '-' : '') + (sep ? i.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : i) + (f ? ',' + f : '');
  };

  // texto -> número (aceita 12, 12,5, 1.234,56, 10%, 01/02/2024)
  const parseNum = s => {
    s = String(s).trim(); if (s === '') return null;
    let m;
    if ((m = /^([+-]?)(\d+|\d{1,3}(?:\.\d{3})+)(?:,(\d+))?\s*(%?)$/.exec(s))) {
      let n = parseFloat(m[2].replace(/\./g, '') + (m[3] ? '.' + m[3] : '')); if (m[1] === '-') n = -n; return m[4] ? n / 100 : n;
    }
    if ((m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s))) { const d = +m[1], mo = +m[2], y = +m[3]; if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31) return serial(y, mo, d); }
    return null;
  };

  // datas (sistema 1900 do Excel): número de dias desde 30/12/1899
  const EPOCH = Date.UTC(1899, 11, 30);
  const serial = (y, m, d) => { const t = new Date(0); t.setUTCFullYear(y, m - 1, d); t.setUTCHours(0, 0, 0, 0); return Math.round((t.getTime() - EPOCH) / 864e5); };
  const fromSerial = s => new Date(EPOCH + Math.floor(s) * 864e5);
  const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const DIAS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  const p2 = n => String(n).padStart(2, '0');
  const daysIn = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();

  // ---------------------------------------------------------------- conversões
  const num = v => {                                  // para contas: vazio vale 0, VERDADEIRO vale 1, texto de número vira número
    if (isErr(v)) throw v;
    if (v === null) return 0;
    if (typeof v === 'number') return v;
    if (typeof v === 'boolean') return v ? 1 : 0;
    if (Array.isArray(v)) return num(sc(v));
    const n = parseNum(v); if (n === null) throw err(E.VALUE); return n;
  };
  const txt = v => {
    if (isErr(v)) throw v;
    if (v === null) return '';
    if (typeof v === 'string') return v;
    if (typeof v === 'number') return gen(v);
    if (typeof v === 'boolean') return v ? 'VERDADEIRO' : 'FALSO';
    return '';
  };
  const bool = v => {
    if (isErr(v)) throw v;
    if (v === null) return false;
    if (typeof v === 'boolean') return v;
    if (typeof v === 'number') return v !== 0;
    const t = normName(v); if (t === 'VERDADEIRO' || t === 'TRUE') return true; if (t === 'FALSO' || t === 'FALSE') return false;
    throw err(E.VALUE);
  };
  const sc = x => { if (!Array.isArray(x)) return x; if (x.length === 1 && x[0].length === 1) return x[0][0]; throw err(E.VALUE); };

  // comparação do Excel: números < textos < lógicos; texto sem diferenciar maiúsculas
  const rank = v => typeof v === 'number' ? 0 : typeof v === 'string' ? 1 : 2;
  const cmp = (a, b) => {
    if (isErr(a)) throw a; if (isErr(b)) throw b;
    if (a === null && b === null) return 0;
    if (a === null) a = typeof b === 'string' ? '' : typeof b === 'boolean' ? false : 0;
    if (b === null) b = typeof a === 'string' ? '' : typeof a === 'boolean' ? false : 0;
    if (rank(a) !== rank(b)) return rank(a) < rank(b) ? -1 : 1;
    if (typeof a === 'string') { a = a.toLowerCase(); b = b.toLowerCase(); }
    return a < b ? -1 : a > b ? 1 : 0;
  };
  const eqv = (a, b) => { if (isErr(a) || isErr(b)) return false; if (a === null || b === null) return a === b; if (rank(a) !== rank(b)) return false; return cmp(a, b) === 0; };

  // ---------------------------------------------------------------- leitura da fórmula (tokens)
  const parseFail = (msg, pos) => { throw { parse: true, msg, pos: pos || 0 }; };
  function tokenize(src) {
    const out = []; let i = 0; const n = src.length;
    while (i < n) {
      const ch = src[i];
      if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') { i++; continue; }
      if (ch === '"') {
        let j = i + 1, s = '';
        for (; ;) { if (j >= n) parseFail('Faltou fechar as aspas (") do texto.', i); if (src[j] === '"') { if (src[j + 1] === '"') { s += '"'; j += 2; continue; } break; } s += src[j++]; }
        out.push({ t: 'str', v: s, s: i, e: j + 1 }); i = j + 1; continue;
      }
      if (ch >= '0' && ch <= '9') {
        const rest = src.slice(i);
        if (/^\d+\.\d/.test(rest)) parseFail('Em português o decimal usa vírgula: escreva 1,5 em vez de 1.5.', i);
        const m = /^\d+(?:,\d+)?/.exec(rest); out.push({ t: 'num', v: parseFloat(m[0].replace(',', '.')), s: i, e: i + m[0].length }); i += m[0].length; continue;
      }
      if (ch === '$' || ch === '_' || /[A-Za-zÀ-ÿ]/.test(ch)) {
        const rest = src.slice(i); let m;
        if ((m = /^[A-Za-zÀ-ÿ_][A-Za-zÀ-ÿ0-9_.]*(?=\s*\()/.exec(rest))) { out.push({ t: 'fn', v: m[0], s: i, e: i + m[0].length }); i += m[0].length; continue; }
        if ((m = /^\$?[A-Za-z]{1,3}\$?\d{1,7}(?![A-Za-zÀ-ÿ0-9_.])/.exec(rest))) {
          const q = /^(\$?)([A-Za-z]{1,3})(\$?)(\d+)$/.exec(m[0]);
          out.push({ t: 'ref', ac: !!q[1], c: colN(q[2]), ar: !!q[3], r: +q[4], s: i, e: i + m[0].length }); i += m[0].length; continue;
        }
        if ((m = /^(\$?)([A-Za-z]{1,3}):(\$?)([A-Za-z]{1,3})(?![A-Za-zÀ-ÿ0-9_.(])/.exec(rest))) {
          out.push({ t: 'cols', ac1: !!m[1], c1: colN(m[2]), ac2: !!m[3], c2: colN(m[4]), s: i, e: i + m[0].length }); i += m[0].length; continue;
        }
        if ((m = /^[A-Za-zÀ-ÿ_][A-Za-zÀ-ÿ0-9_.]*/.exec(rest))) {
          const nm = normName(m[0]);
          if (nm === 'VERDADEIRO' || nm === 'TRUE') out.push({ t: 'bool', v: true, s: i, e: i + m[0].length });
          else if (nm === 'FALSO' || nm === 'FALSE') out.push({ t: 'bool', v: false, s: i, e: i + m[0].length });
          else out.push({ t: 'name', v: m[0], s: i, e: i + m[0].length });
          i += m[0].length; continue;
        }
        parseFail('Não entendi «' + ch + '».', i);
      }
      const two = src.substr(i, 2);
      if (two === '<=' || two === '>=' || two === '<>') { out.push({ t: 'op', v: two, s: i, e: i + 2 }); i += 2; continue; }
      if ('+-*/^&=<>%():;'.includes(ch)) { out.push({ t: 'op', v: ch, s: i, e: i + 1 }); i++; continue; }
      if (ch === ',') parseFail('No Excel em português os argumentos são separados por ponto e vírgula (;), e a vírgula é só para decimais (1,5).', i);
      if (ch === '.') parseFail('Em português o decimal usa vírgula: escreva 1,5 em vez de 1.5.', i);
      parseFail('Caractere não reconhecido: «' + ch + '».', i);
    }
    return out;
  }

  // ---------------------------------------------------------------- árvore da fórmula
  let FUNCS;                                               // definido mais abaixo
  function parse(src) {
    if (src.length > MAXLEN) parseFail('Fórmula grande demais.', 0);
    const tk = tokenize(src); let p = 0;
    const peek = () => tk[p], isOp = (t, v) => t && t.t === 'op' && (v === undefined || t.v === v);
    const show = t => t ? '«' + src.slice(t.s, t.e) + '»' : 'o fim da fórmula';
    let depth = 0;
    const need = (op, why) => { const t = peek(); if (!isOp(t, op)) parseFail(why || `Esperava «${op}» antes de ${show(t)}.`, t ? t.s : src.length); p++; };
    function expr() { if (++depth > MAXDEPTH) parseFail('Fórmula complicada demais.', 0); const r = comparison(); depth--; return r; }
    function comparison() {
      let a = concat();
      for (; ;) { const t = peek(); if (isOp(t) && ['=', '<>', '<', '>', '<=', '>='].includes(t.v)) { p++; a = { t: 'bin', op: t.v, a, b: concat() }; } else return a; }
    }
    function concat() { let a = add(); for (; ;) { const t = peek(); if (isOp(t, '&')) { p++; a = { t: 'bin', op: '&', a, b: add() }; } else return a; } }
    function add() { let a = mul(); for (; ;) { const t = peek(); if (isOp(t, '+') || isOp(t, '-')) { p++; a = { t: 'bin', op: t.v, a, b: mul() }; } else return a; } }
    function mul() { let a = pow(); for (; ;) { const t = peek(); if (isOp(t, '*') || isOp(t, '/')) { p++; a = { t: 'bin', op: t.v, a, b: pow() }; } else return a; } }
    function pow() { let a = unary(); for (; ;) { const t = peek(); if (isOp(t, '^')) { p++; a = { t: 'bin', op: '^', a, b: unary() }; } else return a; } }
    function unary() {
      const t = peek();
      if (isOp(t, '-') || isOp(t, '+')) { p++; const x = unary(); return t.v === '-' ? { t: 'un', x } : x; }
      return postfix();
    }
    function postfix() { let a = primary(); while (isOp(peek(), '%')) { p++; a = { t: 'pct', x: a }; } return a; }
    function ref(t) { return { t: 'ref', c: t.c, r: t.r, ac: t.ac, ar: t.ar }; }
    function primary() {
      const t = peek();
      if (!t) parseFail('A fórmula está incompleta: falta um valor no final.', src.length);
      p++;
      if (t.t === 'num') return { t: 'num', v: t.v };
      if (t.t === 'str') return { t: 'str', v: t.v };
      if (t.t === 'bool') return { t: 'bool', v: t.v };
      if (t.t === 'cols') return { t: 'range', a: { c: Math.min(t.c1, t.c2), r: 1 }, b: { c: Math.max(t.c1, t.c2), r: null } };
      if (t.t === 'ref') {
        if (isOp(peek(), ':')) { p++; const u = peek(); if (!u || u.t !== 'ref') parseFail('Depois dos dois-pontos (:) vem uma célula, como em A1:B5.', u ? u.s : src.length); p++; return { t: 'range', a: { c: Math.min(t.c, u.c), r: Math.min(t.r, u.r) }, b: { c: Math.max(t.c, u.c), r: Math.max(t.r, u.r) } }; }
        return ref(t);
      }
      if (t.t === 'name') return { t: 'name', v: t.v };
      if (t.t === 'fn') {
        need('(', 'Depois do nome da função vem um parêntese «(».');
        const args = [];
        if (isOp(peek(), ')')) p++;
        else for (; ;) {
          const u = peek();
          if (isOp(u, ';') || isOp(u, ')')) args.push({ t: 'empty' }); else args.push(expr());
          const w = peek();
          if (isOp(w, ';')) { p++; continue; }
          if (isOp(w, ')')) { p++; break; }
          if (!w) parseFail('Faltou fechar um parêntese «)».', src.length);
          parseFail(`Não entendi ${show(w)}: falta um operador (como + - * /) ou um «;» entre os valores?`, w.s);
        }
        const nm = normName(t.v), f = FUNCS[nm];
        if (f) {
          if (args.length < f.min) parseFail(`A função ${t.v.toUpperCase()} precisa de pelo menos ${f.min} argumento${f.min > 1 ? 's' : ''} (você deu ${args.length}).`, t.s);
          if (args.length > f.max) parseFail(`A função ${t.v.toUpperCase()} aceita no máximo ${f.max} argumento${f.max > 1 ? 's' : ''} (você deu ${args.length}).`, t.s);
        }
        return { t: 'fn', name: nm, raw: t.v, args };
      }
      if (isOp(t, '(')) { const x = expr(); need(')', 'Faltou fechar um parêntese «)».'); return x; }
      if (isOp(t, ')')) parseFail('Há um parêntese «)» sobrando ou faltando um valor antes dele.', t.s);
      parseFail(`Faltou um valor antes de ${show(t)}.`, t.s);
    }
    const r = expr();
    if (p < tk.length) { const t = tk[p]; parseFail(isOp(t, ')') ? 'Há um parêntese «)» a mais.' : `Não entendi ${show(t)}: falta um operador (como + - * /) ou um «;» entre os valores?`, t.s); }
    return r;
  }
  const AST = new Map();
  function parseCached(src) {
    let a = AST.get(src);
    if (!a) { a = parse(src); if (AST.size > 3000) AST.clear(); AST.set(src, a); }
    return a;
  }

  // ---------------------------------------------------------------- cálculo
  function zip(a, b, f) {
    const A = Array.isArray(a), B = Array.isArray(b);
    if (!A && !B) return f(a, b);
    const ra = A ? a.length : 1, ca = A ? a[0].length : 1, rb = B ? b.length : 1, cb = B ? b[0].length : 1;
    const R = Math.max(ra, rb), C = Math.max(ca, cb), out = [];
    for (let i = 0; i < R; i++) {
      const row = [];
      for (let j = 0; j < C; j++) {
        const x = A ? (ra === 1 ? a[0] : a[i]) : null, y = B ? (rb === 1 ? b[0] : b[i]) : null;
        const xv = A ? (x && (ca === 1 ? x[0] : x[j])) : a, yv = B ? (y && (cb === 1 ? y[0] : y[j])) : b;
        if ((A && ra > 1 && i >= ra) || (B && rb > 1 && i >= rb) || (A && ca > 1 && j >= ca) || (B && cb > 1 && j >= cb)) { row.push(err(E.NA)); continue; }
        try { row.push(f(xv === undefined ? null : xv, yv === undefined ? null : yv)); } catch (e) { if (isErr(e)) row.push(e); else throw e; }
      }
      out.push(row);
    }
    return out;
  }
  const mapM = (a, f) => Array.isArray(a) ? a.map(r => r.map(v => { try { return f(v); } catch (e) { if (isErr(e)) return e; throw e; } })) : f(a);
  const BIN = {
    '+': (a, b) => num(a) + num(b), '-': (a, b) => num(a) - num(b), '*': (a, b) => num(a) * num(b),
    '/': (a, b) => { const d = num(b), n = num(a); if (d === 0) throw err(E.DIV0); return n / d; },
    '^': (a, b) => { const x = num(a), y = num(b); if (x === 0 && y === 0) throw err(E.NUM); const r = Math.pow(x, y); if (!isFinite(r) || isNaN(r)) throw err(E.NUM); return r; },
    '&': (a, b) => txt(a) + txt(b),
    '=': (a, b) => cmp(a, b) === 0, '<>': (a, b) => cmp(a, b) !== 0, '<': (a, b) => cmp(a, b) < 0, '>': (a, b) => cmp(a, b) > 0, '<=': (a, b) => cmp(a, b) <= 0, '>=': (a, b) => cmp(a, b) >= 0
  };
  const fin = x => { if (typeof x === 'number' && !isFinite(x)) throw err(E.NUM); return x; };

  function ev(n, sh, d) {
    switch (n.t) {
      case 'num': case 'str': case 'bool': return n.v;
      case 'empty': return null;
      case 'name': throw err(E.NAME);
      case 'ref': return sh.value(addr(n.c, n.r));
      case 'range': return sh.matrix(n);
      case 'un': return mapM(ev(n.x, sh, d), v => -num(v));
      case 'pct': return mapM(ev(n.x, sh, d), v => num(v) / 100);
      case 'bin': {
        const f = BIN[n.op], a = ev(n.a, sh, d), b = ev(n.b, sh, d);
        if (!Array.isArray(a) && !Array.isArray(b)) return fin(f(a, b));
        return zip(a, b, (x, y) => fin(f(x, y)));
      }
      case 'fn': {
        const f = FUNCS[n.name]; if (!f) throw err(E.NAME);
        if (d > MAXDEPTH) throw err(E.VALUE);
        return f.fn(n.args, { sh, d: d + 1, v: x => sc(ev(x, sh, d + 1)), m: x => { const r = ev(x, sh, d + 1); return Array.isArray(r) ? r : [[r]]; }, raw: x => ev(x, sh, d + 1) });
      }
    }
    throw err(E.VALUE);
  }

  class Sheet {
    constructor(raw) {
      this.raw = Object.create(null); this.cache = new Map(); this.stack = new Set(); this._used = null;
      if (raw) for (const k of Object.keys(raw)) this.set(k, raw[k]);
    }
    set(a, v) {
      a = String(a).toUpperCase(); const p = parseAddr(a); if (!p || p.c > 702 || p.r > 5000) return;
      if (v === null || v === undefined || v === '') delete this.raw[a]; else this.raw[a] = v;
      this.cache.clear(); this._used = null;
    }
    used() {
      if (this._used) return this._used;
      let r = 0, c = 0; for (const k in this.raw) { const p = parseAddr(k); if (p) { if (p.r > r) r = p.r; if (p.c > c) c = p.c; } }
      return this._used = { r, c };
    }
    isFormula(a) { const v = this.raw[a]; return typeof v === 'string' && v[0] === '=' && v.length > 1; }
    value(a) {
      if (this.cache.has(a)) return this.cache.get(a);
      const rw = this.raw[a]; let v;
      if (rw === undefined) v = null;
      else if (typeof rw === 'string' && rw[0] === '=' && rw.length > 1) {
        if (this.stack.has(a)) return err(E.REF);                                  // referência circular
        this.stack.add(a);
        try { v = ev(parseCached(rw.slice(1)), this, 0); if (Array.isArray(v)) v = v[0][0]; }
        catch (e) { if (isErr(e)) v = e; else if (e && e.parse) v = err(E.NAME); else throw e; }
        finally { this.stack.delete(a); }
        if (v === undefined) v = null;
      } else v = rw;
      this.cache.set(a, v); return v;
    }
    matrix(n) {
      const u = this.used(), c1 = n.a.c, c2 = n.b.c, r1 = n.a.r, r2 = n.b.r === null ? Math.max(u.r, 1) : n.b.r;
      if ((c2 - c1 + 1) * (r2 - r1 + 1) > MAXCELLS) throw err(E.REF);
      const m = [];
      for (let r = r1; r <= r2; r++) { const row = []; for (let c = c1; c <= c2; c++) row.push(this.value(addr(c, r))); m.push(row); }
      return m;
    }
  }

  // ---------------------------------------------------------------- funções
  FUNCS = Object.create(null);
  const def = (names, min, max, fn) => { for (const nm of names.split('|')) FUNCS[normName(nm)] = { min, max, fn }; };

  // junta números de uma lista de argumentos, na regra de SOMA/MÉDIA/MÁXIMO...: em intervalos e células só contam números
  const nums = (a, c) => {
    const out = [];
    for (const n of a) {
      if (n.t === 'empty') continue;
      const x = c.raw(n);
      if (Array.isArray(x)) { for (const row of x) for (const v of row) { if (isErr(v)) throw v; if (typeof v === 'number') out.push(v); } }
      else if (n.t === 'ref') { if (isErr(x)) throw x; if (typeof x === 'number') out.push(x); }
      else out.push(num(x));
    }
    return out;
  };
  const flatM = m => [].concat(...m);

  def('SOMA', 1, 255, (a, c) => nums(a, c).reduce((s, x) => s + x, 0));
  def('MÉDIA', 1, 255, (a, c) => { const n = nums(a, c); if (!n.length) throw err(E.DIV0); return n.reduce((s, x) => s + x, 0) / n.length; });
  def('MÁXIMO', 1, 255, (a, c) => { const n = nums(a, c); return n.length ? Math.max(...n) : 0; });
  def('MÍNIMO', 1, 255, (a, c) => { const n = nums(a, c); return n.length ? Math.min(...n) : 0; });
  def('CONT.NÚM', 1, 255, (a, c) => {
    let k = 0;
    for (const n of a) { if (n.t === 'empty') continue; const x = c.raw(n); if (Array.isArray(x)) { for (const v of flatM(x)) if (typeof v === 'number') k++; } else if (typeof x === 'number' || (n.t !== 'ref' && (typeof x === 'boolean' || (typeof x === 'string' && parseNum(x) !== null)))) k++; }
    return k;
  });
  def('CONT.VALORES', 1, 255, (a, c) => { let k = 0; for (const n of a) { const x = c.raw(n); if (Array.isArray(x)) k += flatM(x).filter(v => v !== null).length; else if (x !== null) k++; } return k; });
  def('CONTAR.VAZIO', 1, 1, (a, c) => flatM(c.m(a[0])).filter(v => v === null || v === '').length);
  def('MED', 1, 255, (a, c) => { const n = nums(a, c).sort((x, y) => x - y); if (!n.length) throw err(E.NUM); const h = n.length >> 1; return n.length % 2 ? n[h] : (n[h - 1] + n[h]) / 2; });
  def('MAIOR', 2, 2, (a, c) => { const n = nums([a[0]], c).sort((x, y) => y - x), k = Math.floor(num(c.v(a[1]))); if (k < 1 || k > n.length) throw err(E.NUM); return n[k - 1]; });
  def('MENOR', 2, 2, (a, c) => { const n = nums([a[0]], c).sort((x, y) => x - y), k = Math.floor(num(c.v(a[1]))); if (k < 1 || k > n.length) throw err(E.NUM); return n[k - 1]; });
  def('ORDEM|ORDEM.EQ', 2, 3, (a, c) => {
    const x = num(c.v(a[0])), n = nums([a[1]], c), asc = a[2] ? num(c.v(a[2])) !== 0 : false;
    if (!n.includes(x)) throw err(E.NA); return 1 + n.filter(v => asc ? v < x : v > x).length;
  });
  def('SOMARPRODUTO', 1, 30, (a, c) => {
    const ms = a.map(n => c.m(n)); const R = ms[0].length, C = ms[0][0].length;
    if (ms.some(m => m.length !== R || m[0].length !== C)) throw err(E.VALUE);
    let s = 0;
    for (let i = 0; i < R; i++) for (let j = 0; j < C; j++) { let p = 1; for (const m of ms) { const v = m[i][j]; if (isErr(v)) throw v; p *= typeof v === 'number' ? v : typeof v === 'boolean' ? 0 : 0; } s += p; }
    return s;
  });
  def('ABS', 1, 1, (a, c) => Math.abs(num(c.v(a[0]))));
  def('INT', 1, 1, (a, c) => Math.floor(num(c.v(a[0]))));
  def('SINAL', 1, 1, (a, c) => Math.sign(num(c.v(a[0]))));
  def('RAIZ', 1, 1, (a, c) => { const x = num(c.v(a[0])); if (x < 0) throw err(E.NUM); return Math.sqrt(x); });
  def('POTÊNCIA', 2, 2, (a, c) => BIN['^'](c.v(a[0]), c.v(a[1])));
  def('PI', 0, 0, () => Math.PI);
  def('RESTO', 2, 2, (a, c) => { const x = num(c.v(a[0])), d = num(c.v(a[1])); if (d === 0) throw err(E.DIV0); return x - d * Math.floor(x / d); });
  def('ARRED', 2, 2, (a, c) => rnd(num(c.v(a[0])), Math.trunc(num(c.v(a[1])))));
  def('ARREDONDAR.PARA.CIMA', 2, 2, (a, c) => { const x = num(c.v(a[0])), d = Math.trunc(num(c.v(a[1]))), s = shift10(Math.abs(x), d), r = shift10(Math.ceil(+s.toPrecision(14)), -d); return x < 0 ? -r : r; });
  def('ARREDONDAR.PARA.BAIXO', 2, 2, (a, c) => { const x = num(c.v(a[0])), d = Math.trunc(num(c.v(a[1]))), s = shift10(Math.abs(x), d), r = shift10(Math.floor(+s.toPrecision(14)), -d); return x < 0 ? -r : r; });
  def('TRUNCAR', 1, 2, (a, c) => { const x = num(c.v(a[0])), d = a[1] ? Math.trunc(num(c.v(a[1]))) : 0, s = shift10(Math.abs(x), d), r = shift10(Math.floor(+s.toPrecision(14)), -d); return x < 0 ? -r : r; });

  // lógicas
  def('SE', 2, 3, (a, c) => bool(c.v(a[0])) ? (a[1].t === 'empty' ? 0 : c.raw(a[1])) : (a[2] ? (a[2].t === 'empty' ? 0 : c.raw(a[2])) : false));
  def('SES', 2, 254, (a, c) => {
    if (a.length % 2) throw err(E.NA);
    for (let i = 0; i < a.length; i += 2) if (bool(c.v(a[i]))) return c.raw(a[i + 1]);
    throw err(E.NA);
  });
  const logicals = (a, c) => {
    const out = [];
    for (const n of a) {
      const x = c.raw(n);
      if (Array.isArray(x)) { for (const v of flatM(x)) { if (isErr(v)) throw v; if (typeof v === 'boolean') out.push(v); else if (typeof v === 'number') out.push(v !== 0); } }
      else out.push(bool(x));
    }
    if (!out.length) throw err(E.VALUE); return out;
  };
  def('E', 1, 255, (a, c) => logicals(a, c).every(Boolean));
  def('OU', 1, 255, (a, c) => logicals(a, c).some(Boolean));
  def('NÃO', 1, 1, (a, c) => !bool(c.v(a[0])));
  def('VERDADEIRO', 0, 0, () => true);
  def('FALSO', 0, 0, () => false);
  const trap = (a, c, only) => { try { const x = c.v(a[0]); if (isErr(x) && (!only || x.code === only)) return c.raw(a[1]); return x; } catch (e) { if (isErr(e) && (!only || e.code === only)) return c.raw(a[1]); throw e; } };
  def('SEERRO', 2, 2, (a, c) => trap(a, c));
  def('SEND', 2, 2, (a, c) => trap(a, c, E.NA));
  def('ESCOLHER', 2, 254, (a, c) => { const i = Math.floor(num(c.v(a[0]))); if (i < 1 || i >= a.length) throw err(E.VALUE); return c.raw(a[i]); });
  def('É.NÚM', 1, 1, (a, c) => { const x = c.v(a[0]); return typeof x === 'number'; });
  def('É.TEXTO', 1, 1, (a, c) => { const x = c.v(a[0]); return typeof x === 'string'; });
  def('É.NÃO.TEXTO', 1, 1, (a, c) => { const x = c.v(a[0]); return typeof x !== 'string'; });
  def('É.LÓGICO', 1, 1, (a, c) => typeof c.v(a[0]) === 'boolean');
  def('ÉCÉL.VAZIA', 1, 1, (a, c) => c.v(a[0]) === null);
  def('ÉERRO', 1, 1, (a, c) => { try { return isErr(c.v(a[0])); } catch (e) { if (isErr(e)) return true; throw e; } });
  def('É.NÃO.DISP', 1, 1, (a, c) => { try { const x = c.v(a[0]); return isErr(x) && x.code === E.NA; } catch (e) { if (isErr(e)) return e.code === E.NA; throw e; } });
  def('ÉPAR', 1, 1, (a, c) => Math.floor(num(c.v(a[0]))) % 2 === 0);
  def('ÉIMPAR', 1, 1, (a, c) => Math.abs(Math.floor(num(c.v(a[0])))) % 2 === 1);

  // critérios de SOMASE / CONT.SE / MÉDIASE
  const wild = s => new RegExp('^' + s.replace(/~([*?~])|[.+^${}()|[\]\\]|\*|\?/g, (m, lit) => lit ? '\\' + lit : m === '*' ? '[\\s\\S]*' : m === '?' ? '[\\s\\S]' : '\\' + m) + '$', 'i');
  function crit(cr) {
    if (isErr(cr)) throw cr;
    if (typeof cr === 'boolean') return v => v === cr;
    if (typeof cr === 'number') return v => (typeof v === 'number' && v === cr) || (typeof v === 'string' && parseNum(v) === cr);
    if (cr === null) return v => typeof v === 'number' && v === 0;
    const m = /^(<=|>=|<>|<|>|=)?([\s\S]*)$/.exec(cr), op = m[1] || '=', val = m[2];
    const nv = val === '' ? null : parseNum(val);
    if (nv !== null) {
      if (op === '=') return v => (typeof v === 'number' && v === nv) || (typeof v === 'string' && parseNum(v) === nv);
      if (op === '<>') return v => !((typeof v === 'number' && v === nv) || (typeof v === 'string' && parseNum(v) === nv));
      return v => typeof v === 'number' && (op === '<' ? v < nv : op === '>' ? v > nv : op === '<=' ? v <= nv : v >= nv);
    }
    if (val === '') return op === '=' ? v => v === null || v === '' : op === '<>' ? v => v !== null && v !== '' : () => false;
    if (op === '=' || op === '<>') { const re = wild(val); return op === '=' ? v => typeof v === 'string' && re.test(v) : v => !(typeof v === 'string' && re.test(v)); }
    const lv = val.toLowerCase();
    return v => typeof v === 'string' && (op === '<' ? v.toLowerCase() < lv : op === '>' ? v.toLowerCase() > lv : op === '<=' ? v.toLowerCase() <= lv : v.toLowerCase() >= lv);
  }
  const shape = m => [m.length, m[0].length];
  // aplica pares (intervalo, critério) e devolve os índices que passam em todos
  function matches(a, c, from) {
    const ms = [], ps = [];
    for (let i = from; i < a.length; i += 2) { ms.push(c.m(a[i])); ps.push(crit(c.v(a[i + 1]))); }
    const [R, C] = shape(ms[0]); if (ms.some(m => m.length !== R || m[0].length !== C)) throw err(E.VALUE);
    const hit = []; for (let i = 0; i < R; i++) for (let j = 0; j < C; j++) if (ms.every((m, k) => ps[k](m[i][j]))) hit.push([i, j]);
    return { hit, R, C };
  }
  const sumRange = (a, c, hit, R, C) => {
    const m = c.m(a); const out = [];
    for (const [i, j] of hit) { const v = (m[i] || [])[j]; if (isErr(v)) throw v; if (typeof v === 'number') out.push(v); }
    return out;
  };
  def('SOMASE', 2, 3, (a, c) => { const { hit, R, C } = matches([a[0], a[1]], c, 0); return sumRange(a[2] || a[0], c, hit, R, C).reduce((s, x) => s + x, 0); });
  def('SOMASES', 3, 255, (a, c) => { if (a.length % 2 === 0) throw err(E.VALUE); const { hit, R, C } = matches(a, c, 1); return sumRange(a[0], c, hit, R, C).reduce((s, x) => s + x, 0); });
  def('CONT.SE', 2, 2, (a, c) => matches(a, c, 0).hit.length);
  def('CONT.SES', 2, 254, (a, c) => { if (a.length % 2) throw err(E.VALUE); return matches(a, c, 0).hit.length; });
  def('MÉDIASE', 2, 3, (a, c) => { const { hit, R, C } = matches([a[0], a[1]], c, 0), n = sumRange(a[2] || a[0], c, hit, R, C); if (!n.length) throw err(E.DIV0); return n.reduce((s, x) => s + x, 0) / n.length; });
  def('MÉDIASES', 3, 255, (a, c) => { if (a.length % 2 === 0) throw err(E.VALUE); const { hit, R, C } = matches(a, c, 1), n = sumRange(a[0], c, hit, R, C); if (!n.length) throw err(E.DIV0); return n.reduce((s, x) => s + x, 0) / n.length; });
  def('MÁXIMOSES', 3, 255, (a, c) => { const { hit, R, C } = matches(a, c, 1), n = sumRange(a[0], c, hit, R, C); return n.length ? Math.max(...n) : 0; });
  def('MÍNIMOSES', 3, 255, (a, c) => { const { hit, R, C } = matches(a, c, 1), n = sumRange(a[0], c, hit, R, C); return n.length ? Math.min(...n) : 0; });

  // procura
  const find = (v, list, mode) => {                    // mode 0 exato (com curingas); 1 maior valor <=; -1 menor valor >=; devolve o índice ou -1
    if (mode === 0) {
      if (typeof v === 'string' && /[*?]/.test(v)) { const re = wild(v); return list.findIndex(x => typeof x === 'string' && re.test(x)); }
      return list.findIndex(x => eqv(x, v));
    }
    let lo = 0, hi = list.length - 1, best = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1, x = list[mid];
      if (x === null || rank(x) !== rank(v === null ? 0 : v)) { // célula de outro tipo: Excel segue procurando na vizinhança; aqui andamos para a esquerda
        let k = mid - 1; while (k >= lo && (list[k] === null || rank(list[k]) !== rank(v === null ? 0 : v))) k--; if (k < lo) { lo = mid + 1; continue; } hi = k; continue;
      }
      const d = cmp(x, v);
      if (mode === 1) { if (d <= 0) { best = mid; lo = mid + 1; } else hi = mid - 1; }
      else { if (d >= 0) { best = mid; lo = mid + 1; } else hi = mid - 1; }
    }
    return best;
  };
  const lookupVal = (c, n) => { const v = c.v(n); if (isErr(v)) throw v; return v; };
  def('PROCV', 3, 4, (a, c) => {
    const v = lookupVal(c, a[0]), m = c.m(a[1]), col = Math.floor(num(c.v(a[2]))), approx = a[3] && a[3].t !== 'empty' ? bool(c.v(a[3])) : true;
    if (col < 1) throw err(E.VALUE); if (col > m[0].length) throw err(E.REF);
    const keys = m.map(r => r[0]), i = approx ? find(v, keys, 1) : find(v, keys, 0);
    if (i < 0) throw err(E.NA); return m[i][col - 1];
  });
  def('PROCH', 3, 4, (a, c) => {
    const v = lookupVal(c, a[0]), m = c.m(a[1]), row = Math.floor(num(c.v(a[2]))), approx = a[3] && a[3].t !== 'empty' ? bool(c.v(a[3])) : true;
    if (row < 1) throw err(E.VALUE); if (row > m.length) throw err(E.REF);
    const i = find(v, m[0], approx ? 1 : 0); if (i < 0) throw err(E.NA); return m[row - 1][i];
  });
  def('CORRESP', 2, 3, (a, c) => {
    const v = lookupVal(c, a[0]), m = c.m(a[1]), t = a[2] ? Math.sign(num(c.v(a[2]))) : 1;
    if (m.length !== 1 && m[0].length !== 1) throw err(E.NA);
    const list = flatM(m); let i;
    if (t === 0) i = find(v, list, 0); else if (t === 1) i = find(v, list, 1); else i = find(v, list, -1);
    if (i < 0) throw err(E.NA); return i + 1;
  });
  def('ÍNDICE', 2, 3, (a, c) => {
    const m = c.m(a[0]); let r = Math.floor(num(c.v(a[1]))), k = a[2] && a[2].t !== 'empty' ? Math.floor(num(c.v(a[2]))) : null;
    if (k === null) { if (m.length === 1) { k = r; r = 1; } else if (m[0].length === 1) k = 1; else k = 0; }
    if (r < 0 || k < 0 || r > m.length || k > m[0].length) throw err(E.REF);
    if (r === 0 && k === 0) return m;
    if (r === 0) return m.map(row => [row[k - 1]]);
    if (k === 0) return [m[r - 1].slice()];
    return m[r - 1][k - 1];
  });
  def('PROCX', 3, 6, (a, c) => {
    const v = lookupVal(c, a[0]), look = flatM(c.m(a[1])), ret = c.m(a[2]);
    const mode = a[4] && a[4].t !== 'empty' ? Math.trunc(num(c.v(a[4]))) : 0, dir = a[5] && a[5].t !== 'empty' ? Math.trunc(num(c.v(a[5]))) : 1;
    let i = -1;
    const order = look.map((_, k) => k); if (dir < 0) order.reverse();
    const test = mode === 2 && typeof v === 'string' ? (re => x => typeof x === 'string' && re.test(x))(wild(v)) : x => eqv(x, v);
    for (const k of order) if (test(look[k])) { i = k; break; }
    if (i < 0 && (mode === 1 || mode === -1)) {
      let best = -1;
      look.forEach((x, k) => { if (x === null || rank(x) !== rank(v)) return; const d = cmp(x, v); if (mode === -1 ? d < 0 : d > 0) { if (best < 0 || (mode === -1 ? cmp(x, look[best]) > 0 : cmp(x, look[best]) < 0)) best = k; } });
      i = best;
    }
    if (i < 0) { if (a[3] && a[3].t !== 'empty') return c.raw(a[3]); throw err(E.NA); }
    const vert = ret[0].length === 1 || ret.length === look.length && ret[0].length !== look.length;
    return (look.length === ret.length && ret[0].length >= 1 && (ret.length > 1 || ret[0].length === 1)) ? (ret[0].length === 1 ? ret[i][0] : [ret[i].slice()]) : ret[0][i];
  });
  def('LIN', 0, 1, (a, c) => a[0] && a[0].t === 'ref' ? a[0].r : a[0] && a[0].t === 'range' ? a[0].a.r : 1);
  def('COL', 0, 1, (a, c) => a[0] && a[0].t === 'ref' ? a[0].c : a[0] && a[0].t === 'range' ? a[0].a.c : 1);

  // texto
  def('CONCATENAR', 1, 255, (a, c) => a.map(n => txt(c.v(n))).join(''));
  def('CONCAT', 1, 254, (a, c) => a.map(n => { const x = c.raw(n); return Array.isArray(x) ? flatM(x).map(txt).join('') : txt(x); }).join(''));
  def('UNIRTEXTO', 3, 254, (a, c) => {
    const d = txt(c.v(a[0])), skip = bool(c.v(a[1])), parts = [];
    for (const n of a.slice(2)) { const x = c.raw(n); (Array.isArray(x) ? flatM(x) : [x]).forEach(v => { const s = txt(v); if (!(skip && s === '')) parts.push(s); }); }
    return parts.join(d);
  });
  def('MAIÚSCULA', 1, 1, (a, c) => txt(c.v(a[0])).toUpperCase());
  def('MINÚSCULA', 1, 1, (a, c) => txt(c.v(a[0])).toLowerCase());
  def('PRI.MAIÚSCULA', 1, 1, (a, c) => txt(c.v(a[0])).toLowerCase().replace(/(^|[^A-Za-zÀ-ÿ])([A-Za-zÀ-ÿ])/g, (m, p, l) => p + l.toUpperCase()));
  def('ARRUMAR', 1, 1, (a, c) => txt(c.v(a[0])).replace(/ +/g, ' ').trim());
  def('NÚM.CARACT', 1, 1, (a, c) => txt(c.v(a[0])).length);
  def('ESQUERDA', 1, 2, (a, c) => { const n = a[1] ? Math.floor(num(c.v(a[1]))) : 1; if (n < 0) throw err(E.VALUE); return txt(c.v(a[0])).slice(0, n); });
  def('DIREITA', 1, 2, (a, c) => { const n = a[1] ? Math.floor(num(c.v(a[1]))) : 1; if (n < 0) throw err(E.VALUE); const s = txt(c.v(a[0])); return n === 0 ? '' : s.slice(-n); });
  def('EXT.TEXTO', 3, 3, (a, c) => { const s = txt(c.v(a[0])), i = Math.floor(num(c.v(a[1]))), n = Math.floor(num(c.v(a[2]))); if (i < 1 || n < 0) throw err(E.VALUE); return s.substr(i - 1, n); });
  def('LOCALIZAR', 2, 3, (a, c) => {
    const f = txt(c.v(a[0])), s = txt(c.v(a[1])), st = a[2] ? Math.floor(num(c.v(a[2]))) : 1; if (st < 1 || st > s.length + 1) throw err(E.VALUE);
    const re = new RegExp(wild(f).source.slice(1, -1), 'i'), m = re.exec(s.slice(st - 1)); if (!m) throw err(E.VALUE); return st + m.index;
  });
  def('PROCURAR', 2, 3, (a, c) => {
    const f = txt(c.v(a[0])), s = txt(c.v(a[1])), st = a[2] ? Math.floor(num(c.v(a[2]))) : 1; if (st < 1 || st > s.length + 1) throw err(E.VALUE);
    const i = s.indexOf(f, st - 1); if (i < 0) throw err(E.VALUE); return i + 1;
  });
  def('SUBSTITUIR', 3, 4, (a, c) => {
    const s = txt(c.v(a[0])), o = txt(c.v(a[1])), nw = txt(c.v(a[2])); if (o === '') return s;
    if (!a[3]) return s.split(o).join(nw);
    const k = Math.floor(num(c.v(a[3]))); if (k < 1) throw err(E.VALUE);
    let idx = -1, pos = 0; for (let t = 0; t < k; t++) { idx = s.indexOf(o, pos); if (idx < 0) return s; pos = idx + o.length; }
    return s.slice(0, idx) + nw + s.slice(idx + o.length);
  });
  def('REPT', 2, 2, (a, c) => { const n = Math.floor(num(c.v(a[1]))); if (n < 0 || n > 500) throw err(E.VALUE); return txt(c.v(a[0])).repeat(n); });
  def('EXATO', 2, 2, (a, c) => txt(c.v(a[0])) === txt(c.v(a[1])));
  def('VALOR', 1, 1, (a, c) => { const x = c.v(a[0]); if (typeof x === 'number') return x; const n = parseNum(txt(x)); if (n === null) throw err(E.VALUE); return n; });
  def('MOEDA', 1, 2, (a, c) => { const d = a[1] ? Math.trunc(num(c.v(a[1]))) : 2; return 'R$ ' + grp(num(c.v(a[0])), Math.max(0, d)); });
  def('TEXTO', 2, 2, (a, c) => textFmt(c.v(a[0]), txt(c.v(a[1]))));

  // datas
  const dateOf = v => { const n = Math.floor(num(v)); if (n < 0) throw err(E.NUM); return fromSerial(n); };
  def('DATA', 3, 3, (a, c) => { let y = Math.trunc(num(c.v(a[0]))); const m = Math.trunc(num(c.v(a[1]))), d = Math.trunc(num(c.v(a[2]))); if (y < 0 || y > 9999) throw err(E.NUM); if (y < 1900) y += 1900; const s = serial(y, m, d); if (s < 0) throw err(E.NUM); return s; });
  def('ANO', 1, 1, (a, c) => dateOf(c.v(a[0])).getUTCFullYear());
  def('MÊS', 1, 1, (a, c) => dateOf(c.v(a[0])).getUTCMonth() + 1);
  def('DIA', 1, 1, (a, c) => dateOf(c.v(a[0])).getUTCDate());
  def('HOJE', 0, 0, () => { const d = new Date(); return serial(d.getFullYear(), d.getMonth() + 1, d.getDate()); });
  def('AGORA', 0, 0, () => { const d = new Date(); return serial(d.getFullYear(), d.getMonth() + 1, d.getDate()) + (d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds()) / 86400; });
  def('DIAS', 2, 2, (a, c) => Math.floor(num(c.v(a[0]))) - Math.floor(num(c.v(a[1]))));
  def('DIA.DA.SEMANA', 1, 2, (a, c) => { const w = dateOf(c.v(a[0])).getUTCDay(), t = a[1] ? num(c.v(a[1])) : 1; if (t === 1) return w + 1; if (t === 2) return (w + 6) % 7 + 1; if (t === 3) return (w + 6) % 7; throw err(E.NUM); });
  def('DATAM', 2, 2, (a, c) => { const d = dateOf(c.v(a[0])), k = Math.trunc(num(c.v(a[1]))); const t = d.getUTCFullYear() * 12 + d.getUTCMonth() + k, y = Math.floor(t / 12), m = t % 12; return serial(y, m + 1, Math.min(d.getUTCDate(), daysIn(y, m + 1))); });
  def('FIMMÊS', 2, 2, (a, c) => { const d = dateOf(c.v(a[0])), k = Math.trunc(num(c.v(a[1]))); const t = d.getUTCFullYear() * 12 + d.getUTCMonth() + k, y = Math.floor(t / 12), m = t % 12; return serial(y, m + 1, daysIn(y, m + 1)); });
  def('DATADIF', 3, 3, (a, c) => {
    const s = Math.floor(num(c.v(a[0]))), e = Math.floor(num(c.v(a[1]))), u = normName(txt(c.v(a[2]))); if (s > e) throw err(E.NUM);
    const A = fromSerial(s), B = fromSerial(e), ay = A.getUTCFullYear(), am = A.getUTCMonth() + 1, ad = A.getUTCDate(), by = B.getUTCFullYear(), bm = B.getUTCMonth() + 1, bd = B.getUTCDate();
    let months = (by - ay) * 12 + (bm - am); if (bd < ad) months--;
    if (u === 'D') return e - s;
    if (u === 'M') return months;
    if (u === 'Y') return Math.floor(months / 12);
    if (u === 'YM') return months % 12;
    if (u === 'MD') { if (bd >= ad) return bd - ad; const pm = bm === 1 ? 12 : bm - 1, py = bm === 1 ? by - 1 : by; return daysIn(py, pm) - ad + bd; }
    if (u === 'YD') { let y = by; if (serial(by, bm, bd) < serial(by, am, ad)) y--; return e - serial(y, am, Math.min(ad, daysIn(y, am))); }
    throw err(E.NUM);
  });

  // ---------------------------------------------------------------- TEXTO() e formatos de exibição
  function textFmt(v, f) {
    if (isErr(v)) throw v;
    if (typeof v === 'string') { const n = parseNum(v); if (n === null) return v; v = n; }
    if (typeof v === 'boolean') return txt(v);
    v = v === null ? 0 : v;
    const bare = f.replace(/"[^"]*"/g, '');
    if (/^[^0#]*$/.test(bare) && /[dmasyh]/i.test(bare)) {
      if (v < 0) throw err(E.VALUE);
      const d = fromSerial(v), Y = d.getUTCFullYear(), M = d.getUTCMonth(), D = d.getUTCDate(), W = d.getUTCDay();
      return f.replace(/"([^"]*)"|dddd|ddd|dd|d|mmmm|mmm|mm|m|aaaa|aa|yyyy|yy/gi, (m, q) => {
        if (q !== undefined) return q; const k = m.toLowerCase();
        switch (k) { case 'dddd': return DIAS[W]; case 'ddd': return DIAS[W].slice(0, 3); case 'dd': return p2(D); case 'd': return String(D);
          case 'mmmm': return MESES[M]; case 'mmm': return MESES[M].slice(0, 3); case 'mm': return p2(M + 1); case 'm': return String(M + 1);
          case 'aaaa': case 'yyyy': return String(Y); default: return String(Y).slice(-2); }
      });
    }
    // número: texto antes + padrão + texto depois
    const lit = s => s.replace(/"([^"]*)"|\\(.)/g, (m, q, ch) => q !== undefined ? q : ch);
    const m = /[#0][#0.,]*/.exec(f.replace(/"[^"]*"/g, s => ' '.repeat(s.length)));
    if (!m) return lit(f);
    const pre = lit(f.slice(0, m.index)), post = lit(f.slice(m.index + m[0].length)), pat = m[0];
    const ci = pat.lastIndexOf(','), dec = ci >= 0 ? pat.length - ci - 1 : 0, intp = ci >= 0 ? pat.slice(0, ci) : pat;
    const minInt = (intp.match(/0/g) || []).length, thou = intp.includes('.');
    const pct = /%/.test(post) || /%/.test(pre);
    const val = pct ? v * 100 : v, a = rnd(Math.abs(val), dec), t = a.toFixed(dec).split('.');
    let I = t[0]; if (I.length < minInt) I = I.padStart(minInt, '0'); if (minInt === 0 && I === '0' && dec > 0) I = '';
    if (thou) I = I.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return (val < 0 && a !== 0 ? '-' : '') + pre + I + (dec ? ',' + t[1] : '') + post;
  }
  // formatos de célula usados nas atividades
  const FMT = { geral: null, moeda: '"R$" #.##0,00', num0: '#.##0', num2: '#.##0,00', pct0: '0%', pct1: '0,0%', pct2: '0,00%', data: 'dd/mm/aaaa', mesano: 'mm/aaaa', texto: null };
  function show(v, fmt) {
    if (isErr(v)) return v.code;
    if (v === null || v === undefined) return '';
    if (typeof v === 'boolean') return v ? 'VERDADEIRO' : 'FALSO';
    if (typeof v === 'string') return v;
    if (!isFinite(v)) return '#NÚM!';
    const f = FMT[fmt];
    if (f) { try { return fmt === 'moeda' ? (v < 0 ? '-' : '') + 'R$ ' + grp(Math.abs(v), 2) : textFmt(v, f); } catch { return '#######'; } }
    if (v !== 0 && (Math.abs(v) >= 1e11 || Math.abs(v) < 1e-9)) return gen(v);
    return String(+v.toPrecision(10)).replace('.', ',');
  }

  // ---------------------------------------------------------------- copiar fórmula (arrastar a alça para baixo/direita)
  function shift(src, dr, dc) {
    if (typeof src !== 'string' || src[0] !== '=') return src;
    let tk; try { tk = tokenize(src.slice(1)); } catch { return src; }
    let out = '=', last = 0; const body = src.slice(1);
    for (const t of tk) {
      if (t.t !== 'ref' && t.t !== 'cols') continue;
      let rep;
      if (t.t === 'ref') {
        const c = t.ac ? t.c : t.c + dc, r = t.ar ? t.r : t.r + dr;
        rep = c < 1 || r < 1 ? '#REF!' : (t.ac ? '$' : '') + colL(c) + (t.ar ? '$' : '') + r;
      } else {
        const c1 = t.ac1 ? t.c1 : t.c1 + dc, c2 = t.ac2 ? t.c2 : t.c2 + dc;
        rep = c1 < 1 || c2 < 1 ? '#REF!' : (t.ac1 ? '$' : '') + colL(c1) + ':' + (t.ac2 ? '$' : '') + colL(c2);
      }
      out += body.slice(last, t.s) + rep; last = t.e;
    }
    return out + body.slice(last);
  }

  // texto digitado pelo aluno numa célula -> valor guardado (+ formato sugerido, como o Excel faz com 10% ou datas)
  function parseInput(s) {
    s = String(s).replace(/ /g, ' ');
    if (s[0] === '=') return { raw: s.trim() };
    const t = s.trim(); if (t === '') return { raw: null };
    const up = normName(t);
    if (up === 'VERDADEIRO') return { raw: true }; if (up === 'FALSO') return { raw: false };
    let m;
    if ((m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(t))) { const n = parseNum(t); if (n !== null) return { raw: n, fmt: 'data' }; }
    if (/^[+-]?\d+(?:\.\d{3})*(?:,\d+)?%$/.test(t)) return { raw: parseNum(t), fmt: 'pct' + (/,/.test(t) ? '2' : '0') };
    if (/^R\$\s*[\d.,]+$/.test(t)) { const n = parseNum(t.replace(/^R\$\s*/, '')); if (n !== null) return { raw: n, fmt: 'moeda' }; }
    const n = parseNum(t); if (n !== null && !/\//.test(t)) return { raw: n };
    return { raw: s };
  }

  // confere a fórmula sem calcular (para avisar ao digitar, como o Excel faz ao dar Enter)
  function check(src) {
    if (typeof src !== 'string' || src[0] !== '=' || src.length < 2) return { ok: true };
    try { parseCached(src.slice(1)); return { ok: true }; } catch (e) { if (e && e.parse) return { ok: false, msg: e.msg, pos: e.pos }; throw e; }
  }

  // dicas para quem escreve o nome da função em inglês
  const EN = { SUM: 'SOMA', AVERAGE: 'MÉDIA', IF: 'SE', MAX: 'MÁXIMO', MIN: 'MÍNIMO', COUNT: 'CONT.NÚM', COUNTA: 'CONT.VALORES', COUNTBLANK: 'CONTAR.VAZIO', ROUND: 'ARRED', ROUNDUP: 'ARREDONDAR.PARA.CIMA', ROUNDDOWN: 'ARREDONDAR.PARA.BAIXO', TRUNC: 'TRUNCAR',
    SUMIF: 'SOMASE', SUMIFS: 'SOMASES', COUNTIF: 'CONT.SE', COUNTIFS: 'CONT.SES', AVERAGEIF: 'MÉDIASE', AND: 'E', OR: 'OU', NOT: 'NÃO', IFERROR: 'SEERRO', IFNA: 'SEND', VLOOKUP: 'PROCV', HLOOKUP: 'PROCH', XLOOKUP: 'PROCX', INDEX: 'ÍNDICE', MATCH: 'CORRESP',
    CONCATENATE: 'CONCATENAR', TEXTJOIN: 'UNIRTEXTO', LEFT: 'ESQUERDA', RIGHT: 'DIREITA', MID: 'EXT.TEXTO', LEN: 'NÚM.CARACT', UPPER: 'MAIÚSCULA', LOWER: 'MINÚSCULA', PROPER: 'PRI.MAIÚSCULA', TRIM: 'ARRUMAR', TEXT: 'TEXTO', VALUE: 'VALOR', SUBSTITUTE: 'SUBSTITUIR',
    FIND: 'PROCURAR', SEARCH: 'LOCALIZAR', TODAY: 'HOJE', NOW: 'AGORA', YEAR: 'ANO', MONTH: 'MÊS', DAY: 'DIA', DATE: 'DATA', DAYS: 'DIAS', WEEKDAY: 'DIA.DA.SEMANA', DATEDIF: 'DATADIF', EDATE: 'DATAM', EOMONTH: 'FIMMÊS', SQRT: 'RAIZ', POWER: 'POTÊNCIA', MOD: 'RESTO',
    SUMPRODUCT: 'SOMARPRODUTO', MEDIAN: 'MED', LARGE: 'MAIOR', SMALL: 'MENOR', RANK: 'ORDEM', CHOOSE: 'ESCOLHER', SWITCH: 'SES (ou SE aninhado)', ISNUMBER: 'É.NÚM', ISTEXT: 'É.TEXTO', ISERROR: 'ÉERRO', ISBLANK: 'ÉCÉL.VAZIA', REPT: 'REPT', EXACT: 'EXATO', ROW: 'LIN', COLUMN: 'COL' };
  function hint(src) {
    const out = [];
    for (const m of String(src).matchAll(/([A-Za-z][A-Za-z0-9_.]*)\s*\(/g)) {
      const up = m[1].toUpperCase();
      if (EN[up] && !FUNCS[normName(up)]) out.push(`No Excel em português a função <b>${up}</b> se chama <b>${EN[up]}</b>.`);
      else if (!FUNCS[normName(up)]) out.push(`Não existe a função <b>${up}</b>. Confira o nome (o Excel mostra a lista quando você começa a digitar).`);
    }
    return out;
  }

  function evalRaw(raw, a) { return new Sheet(raw).value(a); }
  // iguais? (para corrigir): erros pelo código, números com tolerância, textos exatos
  const same = (a, b) => {
    if (a === undefined) a = null; if (b === undefined) b = null;
    if (isErr(a) || isErr(b)) return isErr(a) && isErr(b) && a.code === b.code;
    if (a === '' ) a = null; if (b === '') b = null;
    if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
    return a === b;
  };

  return { Sheet, XlErr, E, isErr, parse: parseCached, check, shift, show, FMT, parseInput, parseNum, textFmt, hint, same, evalRaw, colN, colL, addr, parseAddr, normName, serial, fromSerial, gen, FUNCS, EN, rnd };
});
