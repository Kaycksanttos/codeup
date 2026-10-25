// ============================================================================
// FUNÇÕES DO DAX (curso Power BI e DAX). Registra as funções no motor de dax.js.
// Cada função recebe os ARGUMENTOS COMO ÁRVORE (a[0], a[1]…) e o estado st = { R, ctx, fr, env }:
//   ctx = contexto de filtro, fr = pilha de contextos de linha, env = variáveis (VAR).
// ============================================================================
(function (root, factory) { if (typeof module === 'object' && module.exports) module.exports = factory; else factory(root.DAX); })(typeof self !== 'undefined' ? self : this, function (D) {
  'use strict';
  const { fail, lc, vkey, SEP, isTbl, similar, serial, ymd, dim, addMonths, MESES, DIAS, p2, dow, rnd, gen, grp, def, FN, lib, DaxErr, MAXROWS, MAXSTR } = D;
  const { ev, evT, sv, scalar, num, str, bool, cmpv, arith, mkT, metaOf, tableVal, colVals, frameOf, transition, tableFilter, nctx, dropCols, addCon, setFilter, colNode, frameLookup, newRun } = D.K;

  const kw = n => n && n.k === 'id' ? n.n.toUpperCase() : n && n.k === 'str' ? n.v.toUpperCase() : n && n.k === 'num' ? n.v : null;
  const sub = (st, fr, ctx) => ({ R: st.R, ctx: ctx || st.ctx, fr: fr ? st.fr.concat([fr]) : st.fr, env: st.env });
  const isEmpty = n => n.k === 'empty';
  const nonNum = v => v !== null && typeof v === 'number';
  const dedupe = (rows, key) => { const s = new Set(), o = []; for (const r of rows) { const k = key(r); if (!s.has(k)) { s.add(k); o.push(r); } } return o; };

  // ---------------------------------------------------------------- colunas e tabelas
  lib.valuesOf = (node, st) => { const [T, ci] = colNode(st, node), M = st.R.M; return colVals(M, T, ci, M.visible(T, st.ctx)); };
  function colArg(node, st, fname) {
    if (node.k !== 'col') fail(`A função ${fname} só aceita uma coluna (como Vendas[Valor]). Para fazer a conta linha a linha, use a versão com X (por exemplo ${fname}X).`, node);
    const [T, ci] = colNode(st, node), ids = st.R.M.visible(T, st.ctx);
    return { T, ci, ids, vals: ids.map(i => T.rows[i][ci]) };
  }
  const tableArg = (node, st) => node.k === 'col' ? lib.valuesOf(node, st) : evT(node, st);
  function allOf(node, st) {                         // ALL(tabela) / ALL(coluna): valores ignorando os filtros
    const M = st.R.M;
    if (node.k === 'col') { const [T, ci] = colNode(st, node); return colVals(M, T, ci, T.all); }
    if (node.k === 'id' && !(lc(node.n) in st.env)) { const T = M.tbl(node.n, node); return tableVal(M, T, T.all); }
    fail('ALL espera o nome de uma tabela ou uma coluna (por exemplo ALL(Produtos) ou ALL(Produtos[Categoria])).', node);
  }
  def('ALL', 0, 99, (a, st, n) => {
    if (!a.length) fail('ALL() sem argumentos só funciona dentro do CALCULATE.', n);
    if (a.length === 1) return allOf(a[0], st);
    const M = st.R.M, cols = a.map(x => { if (x.k !== 'col') fail('Com várias colunas, ALL espera só colunas (ALL(T[a], T[b])).', x); return colNode(st, x); });
    if (cols.some(c => c[0] !== cols[0][0])) fail('ALL com várias colunas exige colunas da mesma tabela.', n);
    const T = cols[0][0], cs = cols.map(c => c[1]), rows = dedupe(T.all.map(i => cs.map(c => T.rows[i][c])), r => r.map(vkey).join(SEP));
    return mkT(cs.map(c => ({ n: T.cols[c].n, lin: T.name + '[' + T.cols[c].n + ']' })), rows);
  });
  FN.ALLNOBLANKROW = FN.ALL;
  def('VALUES', 1, 1, (a, st) => { if (a[0].k === 'col') return lib.valuesOf(a[0], st); const tv = evT(a[0], st); return tv; });
  def('DISTINCT', 1, 1, (a, st) => {
    if (a[0].k === 'col') return lib.valuesOf(a[0], st);
    const tv = evT(a[0], st), rows = dedupe(tv.rows, r => r.map(vkey).join(SEP)); return mkT(tv.cols, rows);
  });
  def('ALLEXCEPT', 2, 99, (a, st, n) => {
    const M = st.R.M, T = M.tbl(a[0].n || '', a[0]); const keep = a.slice(1).map(x => { if (x.k !== 'col') fail('ALLEXCEPT espera colunas depois da tabela.', x); return colNode(st, x)[1]; });
    const ctx = dropCols(st.ctx, T, T.cols.map((_, i) => i).filter(i => !keep.includes(i)));
    return tableVal(M, T, M.visible(T, ctx));
  });
  def('ALLSELECTED', 0, 99, (a, st) => {
    if (!a.length) fail('Use ALLSELECTED(Tabela[Coluna]) ou ALLSELECTED(Tabela).', null);
    const M = st.R.M, ctx = reselect(M, st, a);
    if (a[0].k === 'col') { const [T, ci] = colNode(st, a[0]); return colVals(M, T, ci, M.visible(T, ctx)); }
    const T = M.tbl(a[0].n, a[0]); return tableVal(M, T, M.visible(T, ctx));
  });
  function reselect(M, st, a) {                      // contexto "como o visual o recebeu": volta aos filtros de fora (segmentações) nas colunas/tabelas citadas
    let ctx = st.ctx; const vis = st.ctx.vis || { f: [] };
    if (!a.length) return nctx(ctx, vis.f.slice());
    for (const x of a) {
      if (x.k === 'col') { const [T, ci] = colNode(st, x); ctx = dropCols(ctx, T, [ci]); for (const c of vis.f) if (c.t === T && c.cs.includes(ci)) ctx = addCon(ctx, c.t, c.cs, c.set); }
      else { const T = M.tbl(x.n, x); ctx = dropCols(ctx, T, null); for (const c of vis.f) if (c.t === T) ctx = addCon(ctx, c.t, c.cs, c.set); }
    }
    return ctx;
  }
  def('FILTER', 2, 2, (a, st) => {
    const M = st.R.M, tv = tableArg(a[0], st), rows = [], ids = tv.ids ? [] : null;
    for (let k = 0; k < tv.rows.length; k++) { const s2 = sub(st, frameOf(M, tv, k)); if (bool(sv(a[1], s2), a[1])) { rows.push(tv.rows[k]); if (ids) ids.push(tv.ids[k]); } }
    return mkT(tv.cols, rows, ids ? { ids, bt: tv.bt } : null);
  });
  def('RELATED', 1, 1, (a, st, n) => {
    if (a[0].k !== 'col') fail('RELATED espera uma coluna: RELATED(Produtos[Categoria]).', a[0]);
    const M = st.R.M, [T, ci] = colNode(st, a[0]);
    for (let k = st.fr.length - 1; k >= 0; k--) {
      const fr = st.fr[k]; if (!fr.base) continue;
      const v = M.related(fr.base.t, fr.base.i, T, ci, st.ctx); if (v !== undefined) return v;
    }
    fail(`RELATED(${T.name}[${T.cols[ci].n}]) precisa de uma linha de uma tabela ligada a ${T.name} (use dentro de uma coluna calculada ou de um iterador como SUMX).`, n);
  });
  def('RELATEDTABLE', 1, 1, (a, st, n) => {
    const M = st.R.M, T = M.tbl(a[0].n || '', a[0]); if (!st.fr.length) fail('RELATEDTABLE precisa de um contexto de linha (coluna calculada ou iterador).', n);
    const ctx = transition(M, st); return tableVal(M, T, M.visible(T, ctx));
  });
  def('LOOKUPVALUE', 3, 99, (a, st, n) => {
    const M = st.R.M, [T, rc] = colNode(st, a[0]); let alt = null, end = a.length;
    if ((a.length - 1) % 2 === 1) { alt = sv(a[a.length - 1], st); end--; }
    const conds = []; for (let k = 1; k + 1 < end + 0 && k < end; k += 2) { const [T2, c2] = colNode(st, a[k]); if (T2 !== T) fail('LOOKUPVALUE: todas as colunas devem ser da mesma tabela do resultado.', a[k]); conds.push([c2, sv(a[k + 1], st)]); }
    let res, found = false;
    for (const i of T.all) { if (conds.every(([c, v]) => cmpv(T.rows[i][c], v) === 0)) { const v = T.rows[i][rc]; if (found && cmpv(res, v) !== 0) fail('LOOKUPVALUE encontrou mais de um resultado diferente. Confira as colunas de busca.', n); res = v; found = true; } }
    return found ? res : alt;
  });
  def('ADDCOLUMNS', 3, 99, (a, st, n) => {
    const M = st.R.M, tv = tableArg(a[0], st), names = [], exprs = [];
    for (let k = 1; k + 1 < a.length; k += 2) { if (a[k].k !== 'str') fail('Em ADDCOLUMNS, o nome da nova coluna vai entre aspas: ADDCOLUMNS(Tabela, "Nome", expressão).', a[k]); names.push(a[k].v); exprs.push(a[k + 1]); }
    if (a.length % 2 === 0) fail('Em ADDCOLUMNS, cada nome de coluna ("Nome") precisa de uma expressão depois dele.', n);
    const rows = tv.rows.map((r, k) => { const s2 = sub(st, frameOf(M, tv, k)); return r.concat(exprs.map(e => sv(e, s2))); });
    return mkT(tv.cols.concat(names.map(x => ({ n: x, lin: null }))), rows, tv.ids ? { ids: tv.ids, bt: tv.bt } : null);
  });
  def('SELECTCOLUMNS', 3, 99, (a, st, n) => {
    const M = st.R.M, tv = tableArg(a[0], st), names = [], exprs = [];
    for (let k = 1; k + 1 < a.length; k += 2) { if (a[k].k !== 'str') fail('Em SELECTCOLUMNS, o nome da coluna vai entre aspas: SELECTCOLUMNS(Tabela, "Nome", expressão).', a[k]); names.push(a[k].v); exprs.push(a[k + 1]); }
    const lins = exprs.map(e => { if (e.k !== 'col') return null; const [T, ci] = colNode(st, e); return T.name + '[' + T.cols[ci].n + ']'; });
    const rows = tv.rows.map((r, k) => { const s2 = sub(st, frameOf(M, tv, k)); return exprs.map(e => sv(e, s2)); });
    return mkT(names.map((x, i) => ({ n: x, lin: lins[i] })), rows);
  });
  def('ROW', 2, 99, (a, st) => { const names = [], vals = []; for (let k = 0; k + 1 < a.length; k += 2) { names.push(a[k].v); vals.push(sv(a[k + 1], st)); } return mkT(names.map(x => ({ n: x, lin: null })), [vals]); });
  def('GENERATESERIES', 2, 3, (a, st, n) => {
    const s = num(sv(a[0], st)), e = num(sv(a[1], st)), p = a[2] ? num(sv(a[2], st)) : 1; if (!p) fail('O passo de GENERATESERIES não pode ser zero.', n);
    const rows = []; for (let x = s; p > 0 ? x <= e + 1e-12 : x >= e - 1e-12; x += p) { rows.push([rnd(x, 10)]); if (rows.length > MAXROWS) fail('Série grande demais.', n); }
    return mkT([{ n: 'Value', lin: null }], rows);
  });
  def('CALENDAR', 2, 2, (a, st, n) => {
    const s = num(sv(a[0], st)), e = num(sv(a[1], st)); if (e - s > 40000) fail('Calendário grande demais.', n);
    const rows = []; for (let x = Math.floor(s); x <= e; x++) rows.push([x]); return mkT([{ n: 'Date', lin: null }], rows);
  });
  const sameCols = (x, y, n) => { if (x.cols.length !== y.cols.length) fail('As tabelas precisam ter o mesmo número de colunas.', n); };
  def('UNION', 2, 99, (a, st, n) => { const ts = a.map(x => tableArg(x, st)); ts.forEach(t => sameCols(ts[0], t, n)); return mkT(ts[0].cols, [].concat(...ts.map(t => t.rows))); });
  def('EXCEPT', 2, 2, (a, st, n) => { const x = tableArg(a[0], st), y = tableArg(a[1], st); sameCols(x, y, n); const s = new Set(y.rows.map(r => r.map(vkey).join(SEP))); return mkT(x.cols, x.rows.filter(r => !s.has(r.map(vkey).join(SEP)))); });
  def('INTERSECT', 2, 2, (a, st, n) => { const x = tableArg(a[0], st), y = tableArg(a[1], st); sameCols(x, y, n); const s = new Set(y.rows.map(r => r.map(vkey).join(SEP))); return mkT(x.cols, x.rows.filter(r => s.has(r.map(vkey).join(SEP)))); });
  def('CROSSJOIN', 2, 99, (a, st, n) => {
    const ts = a.map(x => tableArg(x, st)); let rows = [[]]; for (const t of ts) { const nr = []; for (const r of rows) for (const q of t.rows) nr.push(r.concat(q)); rows = nr; if (rows.length > MAXROWS) fail('CROSSJOIN grande demais.', n); }
    return mkT([].concat(...ts.map(t => t.cols)), rows);
  });
  def('GENERATE', 2, 2, (a, st) => {
    const M = st.R.M, t1 = tableArg(a[0], st), out = []; let cols = null;
    t1.rows.forEach((r, k) => { const t2 = evT(a[1], sub(st, frameOf(M, t1, k), transition(M, sub(st, frameOf(M, t1, k))))); cols = cols || t1.cols.concat(t2.cols); for (const q of t2.rows) out.push(r.concat(q)); });
    return mkT(cols || t1.cols, out);
  });
  def('ISEMPTY', 1, 1, (a, st) => tableArg(a[0], st).rows.length === 0);
  def('CONTAINS', 3, 99, (a, st, n) => {
    const M = st.R.M, tv = tableArg(a[0], st), cs = [];
    for (let k = 1; k + 1 < a.length; k += 2) { const [T, ci] = colNode(st, a[k]), lin = T.name + '[' + T.cols[ci].n + ']', j = tv.cols.findIndex(c => c.lin && lc(c.lin) === lc(lin) || lc(c.n) === lc(T.cols[ci].n)); if (j < 0) fail(`A coluna ${lin} não faz parte da tabela.`, a[k]); cs.push([j, sv(a[k + 1], st)]); }
    return tv.rows.some(r => cs.every(([j, v]) => cmpv(r[j], v) === 0));
  });
  def('CONTAINSROW', 2, 99, (a, st) => { const tv = tableArg(a[0], st), vs = a.slice(1).map(x => sv(x, st)); return tv.rows.some(r => vs.every((v, j) => cmpv(r[j], v) === 0)); });
  def('TREATAS', 2, 99, (a, st, n) => {
    const tv = tableArg(a[0], st), tg = a.slice(1).map(x => { const [T, ci] = colNode(st, x); return { n: T.cols[ci].n, lin: T.name + '[' + T.cols[ci].n + ']' }; });
    if (tg.length !== tv.cols.length) fail('TREATAS: o número de colunas de destino precisa ser igual ao da tabela.', n);
    return mkT(tg, tv.rows);
  });

  // ---------------------------------------------------------------- agregações
  const numsOf = vals => vals.filter(nonNum);
  def('SUM', 1, 1, (a, st) => { const v = numsOf(colArg(a[0], st, 'SUM').vals); return v.length ? v.reduce((x, y) => x + y, 0) : null; });
  def('AVERAGE', 1, 1, (a, st) => { const v = numsOf(colArg(a[0], st, 'AVERAGE').vals); return v.length ? v.reduce((x, y) => x + y, 0) / v.length : null; });
  def('PRODUCT', 1, 1, (a, st) => { const v = numsOf(colArg(a[0], st, 'PRODUCT').vals); return v.length ? v.reduce((x, y) => x * y, 1) : null; });
  def('MEDIAN', 1, 1, (a, st) => median(numsOf(colArg(a[0], st, 'MEDIAN').vals)));
  const median = v => { if (!v.length) return null; const s = [...v].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
  const varOf = (v, pop) => { if (v.length < (pop ? 1 : 2)) return null; const m = v.reduce((x, y) => x + y, 0) / v.length; return v.reduce((x, y) => x + (y - m) * (y - m), 0) / (pop ? v.length : v.length - 1); };
  def('STDEV.P', 1, 1, (a, st) => { const x = varOf(numsOf(colArg(a[0], st, 'STDEV.P').vals), true); return x === null ? null : Math.sqrt(x); });
  def('STDEV.S', 1, 1, (a, st) => { const x = varOf(numsOf(colArg(a[0], st, 'STDEV.S').vals), false); return x === null ? null : Math.sqrt(x); });
  def('VAR.P', 1, 1, (a, st) => varOf(numsOf(colArg(a[0], st, 'VAR.P').vals), true));
  def('VAR.S', 1, 1, (a, st) => varOf(numsOf(colArg(a[0], st, 'VAR.S').vals), false));
  const pctile = (v, k) => { if (!v.length) return null; const s = [...v].sort((x, y) => x - y), p = k * (s.length - 1), lo = Math.floor(p), hi = Math.ceil(p); return s[lo] + (s[hi] - s[lo]) * (p - lo); };
  def('PERCENTILE.INC', 2, 2, (a, st) => { const k = num(sv(a[1], st)); if (k < 0 || k > 1) fail('O percentil precisa estar entre 0 e 1.', a[1]); return pctile(numsOf(colArg(a[0], st, 'PERCENTILE.INC').vals), k); });
  const minmax = (name, pick) => def(name, 1, 2, (a, st) => {
    if (a.length === 2) { const x = sv(a[0], st), y = sv(a[1], st); if (x === null) return y; if (y === null) return x; return pick(cmpv(x, y)) ? x : y; }
    const v = colArg(a[0], st, name).vals.filter(x => x !== null); if (!v.length) return null; return v.reduce((m, x) => pick(cmpv(x, m)) ? x : m);
  });
  minmax('MIN', c => c < 0); minmax('MAX', c => c > 0);
  def('COUNT', 1, 1, (a, st) => { const n = numsOf(colArg(a[0], st, 'COUNT').vals).length; return n || null; });
  def('COUNTA', 1, 1, (a, st) => { const n = colArg(a[0], st, 'COUNTA').vals.filter(x => x !== null).length; return n || null; });
  def('COUNTBLANK', 1, 1, (a, st) => { const n = colArg(a[0], st, 'COUNTBLANK').vals.filter(x => x === null || x === '').length; return n || null; });
  def('DISTINCTCOUNT', 1, 1, (a, st) => { const n = new Set(colArg(a[0], st, 'DISTINCTCOUNT').vals.map(vkey)).size; return n || null; });
  def('DISTINCTCOUNTNOBLANK', 1, 1, (a, st) => { const n = new Set(colArg(a[0], st, 'DISTINCTCOUNTNOBLANK').vals.filter(x => x !== null).map(vkey)).size; return n || null; });
  def('COUNTROWS', 1, 1, (a, st) => { const t = tableArg(a[0], st); return t.rows.length || null; });
  function iter(a, st, name) {                        // iteradores: tabela, expressão → lista de valores (um por linha)
    if (a.length < 2) fail(`A função ${name} espera uma tabela e uma expressão: ${name}(Tabela, expressão).`, null);
    const M = st.R.M, tv = tableArg(a[0], st), out = [];
    for (let k = 0; k < tv.rows.length; k++) out.push(sv(a[1], sub(st, frameOf(M, tv, k))));
    return out;
  }
  def('SUMX', 2, 2, (a, st) => { const v = numsOf(iter(a, st, 'SUMX')); return v.length ? v.reduce((x, y) => x + y, 0) : null; });
  def('AVERAGEX', 2, 2, (a, st) => { const v = numsOf(iter(a, st, 'AVERAGEX')); return v.length ? v.reduce((x, y) => x + y, 0) / v.length : null; });
  def('PRODUCTX', 2, 2, (a, st) => { const v = numsOf(iter(a, st, 'PRODUCTX')); return v.length ? v.reduce((x, y) => x * y, 1) : null; });
  def('MEDIANX', 2, 2, (a, st) => median(numsOf(iter(a, st, 'MEDIANX'))));
  def('MINX', 2, 2, (a, st) => { const v = iter(a, st, 'MINX').filter(x => x !== null); return v.length ? v.reduce((m, x) => cmpv(x, m) < 0 ? x : m) : null; });
  def('MAXX', 2, 2, (a, st) => { const v = iter(a, st, 'MAXX').filter(x => x !== null); return v.length ? v.reduce((m, x) => cmpv(x, m) > 0 ? x : m) : null; });
  def('COUNTX', 2, 2, (a, st) => numsOf(iter(a, st, 'COUNTX')).length || null);
  def('COUNTAX', 2, 2, (a, st) => iter(a, st, 'COUNTAX').filter(x => x !== null).length || null);
  def('STDEVX.P', 2, 2, (a, st) => { const x = varOf(numsOf(iter(a, st, 'STDEVX.P')), true); return x === null ? null : Math.sqrt(x); });
  def('STDEVX.S', 2, 2, (a, st) => { const x = varOf(numsOf(iter(a, st, 'STDEVX.S')), false); return x === null ? null : Math.sqrt(x); });
  def('CONCATENATEX', 2, 5, (a, st) => {
    const M = st.R.M, tv = tableArg(a[0], st), delim = a[2] && !isEmpty(a[2]) ? str(sv(a[2], st)) : '';
    let rows = tv.rows.map((r, k) => { const s2 = sub(st, frameOf(M, tv, k)); return { t: str(sv(a[1], s2)), o: a[3] && !isEmpty(a[3]) ? sv(a[3], s2) : null }; });
    if (a[3] && !isEmpty(a[3])) { const desc = kw(a[4]) === 'DESC' || kw(a[4]) === 0; rows = rows.map((x, i) => ({ ...x, i })).sort((x, y) => (desc ? -1 : 1) * cmpv(x.o, y.o) || x.i - y.i); }
    const s = rows.map(x => x.t).join(delim); if (s.length > MAXSTR) fail('Texto grande demais.', a[0]); return s;
  });

  // ---------------------------------------------------------------- lógicas
  def('IF', 2, 3, (a, st) => { const c = bool(sv(a[0], st), a[0]); return c ? sv(a[1], st) : a[2] ? sv(a[2], st) : null; });
  def('IFERROR', 2, 2, (a, st) => { try { const v = sv(a[0], st); return typeof v === 'number' && !isFinite(v) ? sv(a[1], st) : v; } catch (e) { if (e instanceof DaxErr && !/pesada/.test(e.message)) return sv(a[1], st); throw e; } });
  def('ISERROR', 1, 1, (a, st) => { try { const v = sv(a[0], st); return typeof v === 'number' && !isFinite(v); } catch (e) { if (e instanceof DaxErr) return true; throw e; } });
  def('SWITCH', 3, 99, (a, st) => {
    const v = sv(a[0], st), isT = a[0].k === 'bool' || (a[0].k === 'call' && a[0].f === 'TRUE');
    let k = 1;
    for (; k + 1 < a.length; k += 2) { const w = sv(a[k], st); if (isT ? (v === true && w === true) : cmpv(v, w) === 0) return sv(a[k + 1], st); }
    return k < a.length ? sv(a[k], st) : null;
  });
  def('AND', 2, 2, (a, st) => bool(sv(a[0], st)) && bool(sv(a[1], st)));
  def('OR', 2, 2, (a, st) => bool(sv(a[0], st)) || bool(sv(a[1], st)));
  def('NOT', 1, 1, (a, st) => !bool(sv(a[0], st)));
  def('TRUE', 0, 0, () => true); def('FALSE', 0, 0, () => false); def('BLANK', 0, 0, () => null);
  def('ISBLANK', 1, 1, (a, st) => sv(a[0], st) === null);
  def('ISNUMBER', 1, 1, (a, st) => typeof sv(a[0], st) === 'number');
  def('ISTEXT', 1, 1, (a, st) => typeof sv(a[0], st) === 'string');
  def('ISLOGICAL', 1, 1, (a, st) => typeof sv(a[0], st) === 'boolean');
  def('COALESCE', 2, 99, (a, st) => { for (const x of a) { const v = sv(x, st); if (v !== null) return v; } return null; });
  def('HASONEVALUE', 1, 1, (a, st) => tableArg(a[0], st).rows.length === 1);
  def('HASONEFILTER', 1, 1, (a, st) => { const [T, ci] = colNode(st, a[0]); return st.ctx.f.some(x => x.t === T && x.cs.length === 1 && x.cs[0] === ci && x.set.size === 1); });
  def('SELECTEDVALUE', 1, 2, (a, st) => { const t = tableArg(a[0], st); return t.rows.length === 1 ? t.rows[0][0] : a[1] ? sv(a[1], st) : null; });
  def('ISFILTERED', 1, 1, (a, st) => {
    if (a[0].k === 'col') { const [T, ci] = colNode(st, a[0]); return st.ctx.f.some(x => x.t === T && x.cs.includes(ci)); }
    const T = st.R.M.tbl(a[0].n || '', a[0]); return st.ctx.f.some(x => x.t === T);
  });
  def('ISCROSSFILTERED', 1, 1, (a, st) => {
    const M = st.R.M; if (a[0].k === 'col') return M.filtered(colNode(st, a[0])[0], st.ctx);
    return M.filtered(M.tbl(a[0].n || '', a[0]), st.ctx);
  });
  def('ISINSCOPE', 1, 1, (a, st) => { const [T, ci] = colNode(st, a[0]); return !!(st.ctx.scope && st.ctx.scope.has(lc(T.name + '[' + T.cols[ci].n + ']'))); });

  // ---------------------------------------------------------------- matemática
  const n0 = (x, node) => num(x, node) || 0;
  const m1 = (name, f) => def(name, 1, 1, (a, st, n) => f(n0(sv(a[0], st), a[0]), n));
  m1('ABS', Math.abs); m1('INT', Math.floor); m1('SIGN', Math.sign); m1('EXP', Math.exp); m1('FACT', (x, n) => { if (x < 0 || x > 170) fail('FACT espera um número entre 0 e 170.', n); let r = 1; for (let i = 2; i <= x; i++) r *= i; return r; });
  m1('SQRT', (x, n) => { if (x < 0) fail('SQRT não aceita número negativo.', n); return Math.sqrt(x); });
  m1('LN', (x, n) => { if (x <= 0) fail('LN só aceita números maiores que zero.', n); return Math.log(x); });
  m1('LOG10', (x, n) => { if (x <= 0) fail('LOG10 só aceita números maiores que zero.', n); return Math.log10(x); });
  def('LOG', 1, 2, (a, st, n) => { const x = n0(sv(a[0], st)), b = a[1] ? n0(sv(a[1], st)) : 10; if (x <= 0 || b <= 0 || b === 1) fail('LOG: números inválidos.', n); return Math.log(x) / Math.log(b); });
  def('PI', 0, 0, () => Math.PI);
  def('ROUND', 2, 2, (a, st) => rnd(n0(sv(a[0], st)), Math.trunc(n0(sv(a[1], st)))));
  def('ROUNDUP', 2, 2, (a, st) => { const x = n0(sv(a[0], st)), d = Math.trunc(n0(sv(a[1], st))), f = Math.pow(10, d); return Math.sign(x) * Math.ceil(Math.abs(x) * f - 1e-9) / f; });
  def('ROUNDDOWN', 2, 2, (a, st) => { const x = n0(sv(a[0], st)), d = Math.trunc(n0(sv(a[1], st))), f = Math.pow(10, d); return Math.sign(x) * Math.floor(Math.abs(x) * f + 1e-9) / f; });
  def('TRUNC', 1, 2, (a, st) => { const x = n0(sv(a[0], st)), d = a[1] ? Math.trunc(n0(sv(a[1], st))) : 0, f = Math.pow(10, d); return Math.trunc(x * f) / f; });
  def('MOD', 2, 2, (a, st, n) => { const x = n0(sv(a[0], st)), y = n0(sv(a[1], st)); if (y === 0) fail('MOD: o divisor não pode ser zero.', n); return x - y * Math.floor(x / y); });
  def('POWER', 2, 2, (a, st) => Math.pow(n0(sv(a[0], st)), n0(sv(a[1], st))));
  def('CEILING', 2, 2, (a, st) => { const x = n0(sv(a[0], st)), s = n0(sv(a[1], st)); return s ? Math.ceil(x / s - 1e-12) * s : 0; });
  def('FLOOR', 2, 2, (a, st) => { const x = n0(sv(a[0], st)), s = n0(sv(a[1], st)); return s ? Math.floor(x / s + 1e-12) * s : 0; });
  def('MROUND', 2, 2, (a, st) => { const x = n0(sv(a[0], st)), s = n0(sv(a[1], st)); return s ? Math.round(x / s) * s : 0; });
  def('ISEVEN', 1, 1, (a, st) => Math.floor(n0(sv(a[0], st))) % 2 === 0); def('ISODD', 1, 1, (a, st) => Math.abs(Math.floor(n0(sv(a[0], st)))) % 2 === 1);
  def('DIVIDE', 2, 3, (a, st) => {
    const x = num(sv(a[0], st), a[0]), y = num(sv(a[1], st), a[1]);
    if (y === null || y === 0) return a[2] ? sv(a[2], st) : null;
    return x === null ? null : x / y;
  });
  def(['RAND', 'RANDBETWEEN'], 0, 2, (a, st, n) => fail(`${n.f} dá números diferentes a cada cálculo, por isso não está disponível aqui.`, n));

  // ---------------------------------------------------------------- texto
  const t1 = (name, f) => def(name, 1, 1, (a, st) => f(str(sv(a[0], st), a[0])));
  t1('LEN', s => s.length); t1('UPPER', s => s.toUpperCase()); t1('LOWER', s => s.toLowerCase()); t1('TRIM', s => s.replace(/\s+/g, ' ').trim());
  def('CONCATENATE', 2, 2, (a, st) => str(sv(a[0], st)) + str(sv(a[1], st)));
  def('LEFT', 1, 2, (a, st) => str(sv(a[0], st)).slice(0, a[1] ? Math.max(0, Math.trunc(n0(sv(a[1], st)))) : 1));
  def('RIGHT', 1, 2, (a, st) => { const s = str(sv(a[0], st)), k = a[1] ? Math.max(0, Math.trunc(n0(sv(a[1], st)))) : 1; return k ? s.slice(-k) : ''; });
  def('MID', 3, 3, (a, st, n) => { const s = str(sv(a[0], st)), i = Math.trunc(n0(sv(a[1], st))), k = Math.trunc(n0(sv(a[2], st))); if (i < 1 || k < 0) fail('MID: posição inicial e quantidade precisam ser positivas.', n); return s.substr(i - 1, k); });
  def('REPT', 2, 2, (a, st, n) => { const s = str(sv(a[0], st)), k = Math.trunc(n0(sv(a[1], st))); if (k < 0 || s.length * k > MAXSTR) fail('REPT: repetições demais.', n); return s.repeat(k); });
  def('SUBSTITUTE', 3, 4, (a, st) => {
    const s = str(sv(a[0], st)), o = str(sv(a[1], st)), w = str(sv(a[2], st)); if (!o) return s;
    if (!a[3]) return s.split(o).join(w);
    let k = Math.trunc(n0(sv(a[3], st))), i = -1; while (k-- > 0) { i = s.indexOf(o, i + 1); if (i < 0) return s; } return s.slice(0, i) + w + s.slice(i + o.length);
  });
  def('REPLACE', 4, 4, (a, st) => { const s = str(sv(a[0], st)), i = Math.max(1, Math.trunc(n0(sv(a[1], st)))), k = Math.max(0, Math.trunc(n0(sv(a[2], st)))); return s.slice(0, i - 1) + str(sv(a[3], st)) + s.slice(i - 1 + k); });
  const find = (name, ci) => def(name, 2, 4, (a, st) => {
    let f = str(sv(a[0], st)), s = str(sv(a[1], st)); const st0 = a[2] ? Math.trunc(n0(sv(a[2], st))) : 1;
    if (ci) { f = f.toLowerCase(); s = s.toLowerCase(); }
    const i = s.indexOf(f, Math.max(0, st0 - 1)); if (i >= 0) return i + 1; if (a[3]) return sv(a[3], st); return fail(`${name}: o texto «${f}» não foi encontrado (use o 4º argumento para devolver outro valor).`, a[0]);
  });
  find('FIND', false); find('SEARCH', true);
  def('EXACT', 2, 2, (a, st) => str(sv(a[0], st)) === str(sv(a[1], st)));
  def('CONTAINSSTRING', 2, 2, (a, st) => str(sv(a[0], st)).toLowerCase().includes(str(sv(a[1], st)).toLowerCase()));
  def('CONTAINSSTRINGEXACT', 2, 2, (a, st) => str(sv(a[0], st)).includes(str(sv(a[1], st))));
  def('COMBINEVALUES', 3, 99, (a, st) => { const d = str(sv(a[0], st)); return a.slice(1).map(x => str(sv(x, st))).join(d); });
  def('VALUE', 1, 1, (a, st, n) => { const v = sv(a[0], st); if (typeof v === 'number') return v; const s = str(v).trim(); if (!s) return null; const m = /^([+-]?)(\d+|\d{1,3}(?:\.\d{3})+)(?:,(\d+))?(%?)$/.exec(s) || /^([+-]?)(\d+(?:,\d{3})*)(?:\.(\d+))?(%?)$/.exec(s); if (!m) fail(`VALUE não conseguiu converter «${s}» em número.`, n); const x = parseFloat(m[1] + m[2].replace(/[.,]/g, '') + (m[3] ? '.' + m[3] : '')); return m[4] ? x / 100 : x; });
  def('FIXED', 1, 3, (a, st) => { const v = n0(sv(a[0], st)), d = a[1] ? Math.trunc(n0(sv(a[1], st))) : 2; return grp(v, Math.max(0, d), !(a[2] && bool(sv(a[2], st)))); });
  def('UNICHAR', 1, 1, (a, st) => String.fromCodePoint(Math.trunc(n0(sv(a[0], st)))));

  // FORMAT: números ("0.00", "#,##0", "0%", "R$ #,##0.00"…) e datas ("dd/mm/yyyy", "mmmm", "yyyy")
  const NAMED = { 'general number': v => gen(v), currency: v => (v < 0 ? '-' : '') + 'R$ ' + grp(Math.abs(v), 2), fixed: v => grp(v, 2, false), standard: v => grp(v, 2), percent: v => grp(v * 100, 2) + '%', scientific: v => v.toExponential(2).replace('.', ',').toUpperCase().replace('E+', 'E+0'), 'short date': v => D.dateTxt(v), 'long date': v => { const [y, m, d] = ymd(v); return DIAS[dow(v)] + ', ' + d + ' de ' + MESES[m - 1] + ' de ' + y; }, 'general date': v => D.dateTxt(v), 'yes/no': v => v ? 'Sim' : 'Não', 'true/false': v => v ? 'True' : 'False', 'on/off': v => v ? 'On' : 'Off' };
  function fmtDate(v, f) {
    const [y, m, d] = ymd(v);
    return f.replace(/"([^"]*)"|\\(.)|yyyy|yy|mmmm|mmm|mm|m|dddd|ddd|dd|d/gi, (t, lit, esc) => {
      if (lit !== undefined) return lit; if (esc !== undefined) return esc;
      switch (t.toLowerCase()) {
        case 'yyyy': return String(y); case 'yy': return String(y).slice(-2); case 'mmmm': return MESES[m - 1]; case 'mmm': return MESES[m - 1].slice(0, 3);
        case 'mm': return p2(m); case 'm': return String(m); case 'dddd': return DIAS[dow(v)]; case 'ddd': return DIAS[dow(v)].slice(0, 3); case 'dd': return p2(d); case 'd': return String(d);
      }
      return t;
    });
  }
  function fmtNum(v, f) {
    const secs = f.split(';'); let pat = secs[0], neg = false;
    if (v < 0 && secs[1] !== undefined) { pat = secs[1]; v = -v; neg = true; } else if (v === 0 && secs[2] !== undefined) pat = secs[2];
    const pc = (pat.match(/%/g) || []).length; v = v * Math.pow(100, pc);
    const m = /[#0][#0,.]*|[,.][#0,.]*/.exec(pat); if (!m) return pat.replace(/"/g, '');
    const pre = pat.slice(0, m.index).replace(/"|\\/g, ''), suf = pat.slice(m.index + m[0].length).replace(/"|\\/g, ''), core = m[0], dot = core.indexOf('.');
    const ip = dot < 0 ? core : core.slice(0, dot), fp = dot < 0 ? '' : core.slice(dot + 1), dec = fp.replace(/,/g, '').length, minDec = (fp.match(/0/g) || []).length, minInt = (ip.match(/0/g) || []).length, thou = ip.includes(',');
    let t = rnd(Math.abs(v), dec).toFixed(dec), [i, fr = ''] = t.split('.');
    while (fr.length > minDec && fr.endsWith('0')) fr = fr.slice(0, -1);
    if (minInt === 0 && /^0+$/.test(i)) i = ''; else i = i.padStart(minInt, '0');
    if (thou) i = i.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const sign = v < 0 && !neg && rnd(Math.abs(v), dec) !== 0 ? '-' : '';
    return sign + pre + i + (fr ? ',' + fr : '') + suf;
  }
  def('FORMAT', 1, 3, (a, st, n) => {
    const v = sv(a[0], st), f = a[1] ? str(sv(a[1], st)) : 'General Number';
    if (v === null) return ''; if (typeof v === 'string') return v; if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
    const named = NAMED[f.toLowerCase()]; if (named) return named(v);
    const bare = f.replace(/"[^"]*"|\\./g, ''); if (/[dmyhs]/i.test(bare) && !/^[#0,.%;\s$R]*$/.test(bare)) return fmtDate(v, f);
    return fmtNum(v, f);
  });

  // ---------------------------------------------------------------- datas
  def('DATE', 3, 3, (a, st) => serial(Math.trunc(n0(sv(a[0], st))), Math.trunc(n0(sv(a[1], st))), Math.trunc(n0(sv(a[2], st)))));
  const dp = (name, f) => def(name, 1, 1, (a, st) => { const v = sv(a[0], st); return v === null ? null : f(ymd(num(v, a[0])), num(v)); });
  dp('YEAR', p => p[0]); dp('MONTH', p => p[1]); dp('DAY', p => p[2]); dp('QUARTER', p => Math.ceil(p[1] / 3));
  def('TODAY', 0, 0, () => { const d = new Date(); return serial(d.getFullYear(), d.getMonth() + 1, d.getDate()); });
  def('NOW', 0, 0, () => { const d = new Date(); return serial(d.getFullYear(), d.getMonth() + 1, d.getDate()) + (d.getHours() * 3600 + d.getMinutes() * 60) / 86400; });
  def('WEEKDAY', 1, 2, (a, st) => { const v = num(sv(a[0], st)); if (v === null) return null; const t = a[1] ? n0(sv(a[1], st)) : 1, w = dow(v); return t === 2 ? (w + 6) % 7 + 1 : t === 3 ? (w + 6) % 7 : w + 1; });
  def('WEEKNUM', 1, 2, (a, st) => {
    const v = num(sv(a[0], st)); if (v === null) return null; const t = a[1] ? n0(sv(a[1], st)) : 1, y = ymd(v)[0], j1 = serial(y, 1, 1);
    if (t === 21) { const wd = (dow(v) + 6) % 7, th = v - wd + 3, ty = ymd(th)[0], f = serial(ty, 1, 4); return 1 + Math.floor((th - (f - ((dow(f) + 6) % 7) + 3)) / 7); }
    const first = t === 2 ? (dow(j1) + 6) % 7 : dow(j1); return Math.floor((v - j1 + first) / 7) + 1;
  });
  def('EOMONTH', 2, 2, (a, st) => { const v = num(sv(a[0], st)); if (v === null) return null; const s = addMonths(serial(ymd(v)[0], ymd(v)[1], 1), Math.trunc(n0(sv(a[1], st)))), [y, m] = ymd(s); return serial(y, m, dim(y, m)); });
  def('EDATE', 2, 2, (a, st) => { const v = num(sv(a[0], st)); return v === null ? null : addMonths(v, Math.trunc(n0(sv(a[1], st)))); });
  def('DATEDIFF', 3, 3, (a, st, n) => {
    const d1 = num(sv(a[0], st)), d2 = num(sv(a[1], st)), u = kw(a[2]); if (d1 === null || d2 === null) return null;
    const A = ymd(d1), B = ymd(d2);
    switch (u) {
      case 'DAY': return Math.floor(d2) - Math.floor(d1);
      case 'WEEK': return Math.trunc((Math.floor(d2) - Math.floor(d1)) / 7);
      case 'MONTH': return (B[0] - A[0]) * 12 + (B[1] - A[1]);
      case 'QUARTER': return (B[0] - A[0]) * 4 + (Math.ceil(B[1] / 3) - Math.ceil(A[1] / 3));
      case 'YEAR': return B[0] - A[0];
    }
    return fail('DATEDIFF: o intervalo deve ser DAY, WEEK, MONTH, QUARTER ou YEAR.', a[2]);
  });
  def('DATEVALUE', 1, 1, (a, st, n) => {
    const s = str(sv(a[0], st)).trim(); let m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s); if (m) return serial(+m[1], +m[2], +m[3]);
    m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s); if (m) return serial(+m[3], +m[2], +m[1]); return fail(`DATEVALUE não entendeu a data «${s}». Use 31/12/2024 ou 2024-12-31.`, n);
  });

  // ---------------------------------------------------------------- CALCULATE e os filtros
  const refsOf = (node, st, out = new Map()) => {                       // colunas citadas numa condição
    switch (node.k) {
      case 'col': { const [T, ci] = colNode(st, node); out.set(T.name + '|' + ci, [T, ci]); break; }
      case 'bin': refsOf(node.l, st, out); refsOf(node.r, st, out); break;
      case 'un': refsOf(node.e, st, out); break;
      case 'in': refsOf(node.l, st, out); if (node.r.k === 'col') refsOf(node.r, st, out); break;
      case 'call': if (!['CALCULATE', 'CALCULATETABLE', 'FILTER', 'SUMX', 'AVERAGEX', 'MAXX', 'MINX', 'COUNTX', 'COUNTROWS', 'TOPN'].includes(node.f)) node.a.forEach(x => refsOf(x, st, out)); break;
    }
    return out;
  };
  const BOOLISH = n => n.k === 'bin' || n.k === 'un' || n.k === 'in' || n.k === 'bool' || (n.k === 'call' && ['NOT', 'AND', 'OR', 'ISBLANK', 'CONTAINSSTRING', 'HASONEVALUE'].includes(n.f));
  function filterItem(node, st, keep) {              // um argumento de filtro → { kind: 'tbl', tv, keep } ou { kind: 'set', T, cs, set, keep }
    const M = st.R.M;
    if (node.k === 'call' && node.f === 'KEEPFILTERS') return filterItem(node.a[0], st, true);
    if (BOOLISH(node) && node.k !== 'bool') {
      const refs = [...refsOf(node, st).values()];
      if (!refs.length) fail('O filtro do CALCULATE precisa falar de uma coluna (por exemplo Produtos[Categoria] = "Bebidas"). Uma conta com medidas não funciona como filtro simples: use FILTER.', node);
      const T = refs[0][0]; if (refs.some(r => r[0] !== T)) fail('Um filtro simples só pode citar colunas de uma tabela. Para usar duas tabelas, separe em dois filtros ou use FILTER.', node);
      const cs = refs.map(r => r[1]), combos = dedupe(T.all.map(i => cs.map(c => T.rows[i][c])), r => r.map(vkey).join(SEP)), set = new Set();
      for (const combo of combos) {
        const fr = { base: null, vals: new Map(), lin: [] }; cs.forEach((c, j) => fr.vals.set(lc(T.name + '[' + T.cols[c].n + ']'), combo[j]));
        if (bool(sv(node, sub(st, fr)), node)) set.add(combo.map(vkey).join(SEP));
      }
      return { kind: 'set', T, cs, set, keep: !!keep };
    }
    const v = ev(node, st);
    if (isTbl(v)) return { kind: 'tbl', tv: v, keep: !!keep };
    return fail('Cada filtro do CALCULATE precisa ser uma condição sobre uma coluna (Tabela[Coluna] = valor) ou uma tabela (FILTER, ALL, VALUES…).', node);
  }
  const MOD = new Set(['ALL', 'REMOVEFILTERS', 'ALLEXCEPT', 'ALLSELECTED', 'ALLNOBLANKROW']);
  function relOf(st, c1, c2, node) {
    const M = st.R.M, [T1, i1] = colNode(st, c1), [T2, i2] = colNode(st, c2);
    const r = M.rels.find(r => (r.m.t === T1 && r.m.ci === i1 && r.o.t === T2 && r.o.ci === i2) || (r.m.t === T2 && r.m.ci === i2 && r.o.t === T1 && r.o.ci === i1));
    if (!r) fail(`Não existe relacionamento entre ${T1.name}[${T1.cols[i1].n}] e ${T2.name}[${T2.cols[i2].n}].`, node); return r;
  }
  function removeOne(M, st, ctx, x) {                // ALL / REMOVEFILTERS / ALLEXCEPT / ALLSELECTED como modificador
    const f = x.f, a = x.a;
    if (f === 'ALLSELECTED') return reselect(M, { ...st, ctx }, a);
    if (f === 'ALLEXCEPT') { const T = M.tbl(a[0].n || '', a[0]), keep = a.slice(1).map(y => colNode(st, y)[1]); return dropCols(ctx, T, T.cols.map((_, i) => i).filter(i => !keep.includes(i))); }
    if (!a.length) return nctx(ctx, []);
    for (const y of a) {
      if (y.k === 'col') { const [T, ci] = colNode(st, y); ctx = dropCols(ctx, T, [ci]); }
      else if (y.k === 'id') ctx = dropCols(ctx, M.tbl(y.n, y), null);
      else fail(`${f} espera uma tabela ou colunas.`, y);
    }
    return ctx;
  }
  function applyItems(M, ctx, items) {
    for (const it of items) {
      if (it.kind === 'set') ctx = it.keep ? addCon(ctx, it.T, it.cs, it.set) : setFilter(ctx, it.T, it.cs, it.set);
      else { if (it.tv.clear) ctx = dropCols(ctx, it.tv.clear, null); ctx = tableFilter(M, ctx, it.tv, it.keep); }
    }
    return ctx;
  }
  // monta o novo contexto: (1) filtros avaliados no contexto de fora, (2) linhas viram filtros, (3) remoções, (4) novos filtros
  function calcCtx(st, filterNodes, extraItems) {
    const M = st.R.M, items = [], mods = []; let ur = null;
    for (const x of filterNodes) {
      if (x.k === 'call' && MOD.has(x.f)) { mods.push(x); continue; }
      if (x.k === 'call' && (x.f === 'USERELATIONSHIP' || x.f === 'CROSSFILTER')) {
        if (x.a.length < 2) fail(`${x.f} espera duas colunas.`, x);
        const r = relOf(st, x.a[0], x.a[1], x);
        if (x.f === 'USERELATIONSHIP') (ur = ur || []).push(r);
        else { const d = kw(x.a[2]), c = Object.assign(Object.create(Object.getPrototypeOf(r)), r); if (d === 'BOTH') c.both = true; else if (d === 'NONE') c.none = true; else c.both = false; c.active = true; (ur = ur || []).push(c); }
        continue;
      }
      items.push(filterItem(x, st, false));
    }
    let ctx = st.fr.length ? transition(M, st) : st.ctx;
    if (ur) ctx = nctx(ctx, ctx.f, { ur: (ctx.ur || []).concat(ur) });
    for (const m of mods) ctx = removeOne(M, st, ctx, m);
    return applyItems(M, ctx, items.concat(extraItems || []));
  }
  def('CALCULATE', 1, 99, (a, st) => ev(a[0], { R: st.R, ctx: calcCtx(st, a.slice(1)), fr: [], env: st.env }));
  def('CALCULATETABLE', 1, 99, (a, st) => evT(a[0], { R: st.R, ctx: calcCtx(st, a.slice(1)), fr: [], env: st.env }));
  def(['REMOVEFILTERS', 'KEEPFILTERS', 'USERELATIONSHIP', 'CROSSFILTER'], 0, 99, (a, st, n) => fail(`${n.f} só funciona dentro do CALCULATE (como filtro).`, n));

  // ---------------------------------------------------------------- ordenação: TOPN, RANKX
  def('TOPN', 2, 99, (a, st, n) => {
    const M = st.R.M, k = Math.trunc(n0(sv(a[0], st))), tv = tableArg(a[1], st);
    const keys = []; for (let i = 2; i < a.length; i += 2) keys.push({ e: a[i], desc: !(a[i + 1] && (kw(a[i + 1]) === 'ASC' || kw(a[i + 1]) === 1)) });
    if (!keys.length) keys.push({ e: null, desc: true });
    const rows = tv.rows.map((r, j) => ({ r, id: tv.ids ? tv.ids[j] : null, v: keys.map(q => q.e ? sv(q.e, sub(st, frameOf(M, tv, j))) : null), j }));
    const cmp = (x, y) => { for (let q = 0; q < keys.length; q++) { const c = cmpv(x.v[q], y.v[q]); if (c) return keys[q].desc ? -c : c; } return x.j - y.j; };
    rows.sort(cmp); if (k <= 0) return mkT(tv.cols, [], tv.ids ? { ids: [], bt: tv.bt } : null);
    let cut = Math.min(k, rows.length); while (cut < rows.length && keys.every((q, i) => cmpv(rows[cut].v[i], rows[cut - 1].v[i]) === 0)) cut++;
    const out = rows.slice(0, cut);
    return mkT(tv.cols, out.map(x => x.r), tv.ids ? { ids: out.map(x => x.id), bt: tv.bt } : null);
  });
  def('RANKX', 2, 5, (a, st, n) => {
    const M = st.R.M, tv = tableArg(a[0], st), asc = a[3] && !isEmpty(a[3]) && (kw(a[3]) === 'ASC' || kw(a[3]) === 1), dense = a[4] && kw(a[4]) === 'DENSE';
    const xs = tv.rows.map((r, j) => sv(a[1], sub(st, frameOf(M, tv, j))));
    const v = a[2] && !isEmpty(a[2]) ? sv(a[2], st) : sv(a[1], st);
    if (v === null) return null;
    const better = xs.filter(x => x !== null && (asc ? cmpv(x, v) < 0 : cmpv(x, v) > 0));
    return 1 + (dense ? new Set(better.map(vkey)).size : better.length);
  });
  def('EARLIER', 1, 2, (a, st, n) => {
    const [T, ci] = colNode(st, a[0]), k = a[1] ? Math.trunc(n0(sv(a[1], st))) : 1, f = frameLookup(st, T, ci, k);
    if (!f) fail('EARLIER precisa de dois contextos de linha (um dentro do outro), por exemplo dentro de FILTER ou de uma coluna calculada.', n); return f.v;
  });
  def('EARLIEST', 1, 1, (a, st, n) => {
    const [T, ci] = colNode(st, a[0]); let last = null; for (let k = 0; k < 20; k++) { const f = frameLookup(st, T, ci, k); if (!f) break; last = f; }
    if (!last) fail('EARLIEST precisa de um contexto de linha.', n); return last.v;
  });

  // ---------------------------------------------------------------- SUMMARIZE, SUMMARIZECOLUMNS, GROUPBY
  function colInRow(st, node, fr) {                  // valor de uma coluna na linha (inclusive de tabelas relacionadas)
    const M = st.R.M, [T, ci] = colNode(st, node), key = lc(T.name) + '[' + lc(T.cols[ci].n) + ']';
    if (fr.vals.has(key)) return fr.vals.get(key);
    if (fr.base) { if (fr.base.t === T) return T.rows[fr.base.i][ci]; const v = M.related(fr.base.t, fr.base.i, T, ci, st.ctx); if (v !== undefined) return v; }
    return fail(`A coluna ${T.name}[${T.cols[ci].n}] não está ligada à tabela usada no agrupamento.`, node);
  }
  function extPairs(a, from, n) {
    const names = [], exprs = [];
    for (let k = from; k < a.length; k += 2) { if (a[k].k !== 'str' || !a[k + 1]) fail('As colunas calculadas levam um nome entre aspas e uma expressão: "Nome", expressão.', a[k]); names.push(a[k].v); exprs.push(a[k + 1]); }
    return { names, exprs };
  }
  def('SUMMARIZE', 2, 99, (a, st, n) => {
    const M = st.R.M, tv = tableArg(a[0], st); let k = 1; const gcols = [];
    while (k < a.length && a[k].k === 'col') gcols.push(a[k++]);
    const { names, exprs } = extPairs(a, k, n), groups = new Map();
    tv.rows.forEach((r, j) => { const fr = frameOf(M, tv, j), vals = gcols.map(g => colInRow(st, g, fr)), key = vals.map(vkey).join(SEP); if (!groups.has(key)) groups.set(key, vals); });
    const metas = gcols.map(g => { const [T, ci] = colNode(st, g); return { n: T.cols[ci].n, lin: T.name + '[' + T.cols[ci].n + ']' }; });
    const rows = [];
    for (const vals of groups.values()) {
      let ctx = st.ctx; gcols.forEach((g, i) => { const [T, ci] = colNode(st, g); ctx = setFilter(ctx, T, [ci], new Set([vkey(vals[i])])); });
      rows.push(vals.concat(exprs.map(e => sv(e, { R: st.R, ctx, fr: [], env: st.env }))));
    }
    return mkT(metas.concat(names.map(x => ({ n: x, lin: null }))), rows);
  });
  def('SUMMARIZECOLUMNS', 2, 99, (a, st, n) => {
    const M = st.R.M; let k = 0; const gcols = []; while (k < a.length && a[k].k === 'col') gcols.push(a[k++]);
    let ctx = st.ctx; const items = [];
    while (k < a.length && a[k].k !== 'str') { items.push(filterItem(a[k], st, false)); k++; }
    ctx = applyItems(M, ctx, items);
    const { names, exprs } = extPairs(a, k, n), groups = new Map();
    for (const g of gcols) { const [T, ci] = colNode(st, g); if (!groups.has(T)) groups.set(T, []); groups.get(T).push({ g, ci }); }
    let combos = [[]];
    for (const [T, bs] of groups) {
      const seen = new Map(); for (const i of M.visible(T, ctx)) { const key = bs.map(b => vkey(T.rows[i][b.ci])).join(SEP); if (!seen.has(key)) seen.set(key, bs.map(b => T.rows[i][b.ci])); }
      const nc = []; for (const c of combos) for (const op of seen.values()) nc.push(c.concat([[T, bs, op]])); combos = nc; if (combos.length > 5000) fail('Combinações demais.', n);
    }
    const metas = gcols.map(g => { const [T, ci] = colNode(st, g); return { n: T.cols[ci].n, lin: T.name + '[' + T.cols[ci].n + ']' }; }), rows = [];
    for (const c of combos) {
      let cx = ctx; const gv = new Array(gcols.length);
      for (const [T, bs, op] of c) { cx = setFilter(cx, T, bs.map(b => b.ci), new Set([bs.map((b, i) => vkey(op[i])).join(SEP)])); bs.forEach((b, i) => { gv[gcols.indexOf(b.g)] = op[i]; }); }
      const ex = exprs.map(e => sv(e, { R: st.R, ctx: cx, fr: [], env: st.env }));
      if (exprs.length && ex.every(x => x === null)) continue;
      rows.push(gv.concat(ex));
    }
    return mkT(metas.concat(names.map(x => ({ n: x, lin: null }))), rows);
  });

  // ---------------------------------------------------------------- inteligência de tempo
  // Estas funções devolvem datas da tabela calendário; ao entrarem no CALCULATE elas substituem TODOS os filtros da tabela calendário
  // (é o que o Power BI faz quando a tabela é marcada como "tabela de datas").
  const allDates = (T, ci) => { const c = T.dc || (T.dc = new Map()); if (!c.has(ci)) c.set(ci, [...new Set(T.rows.map(r => r[ci]).filter(nonNum))].sort((x, y) => x - y)); return c.get(ci); };
  function datesOf(node, st) {
    const M = st.R.M; let T, ci, vals;
    if (node.k === 'col') { [T, ci] = colNode(st, node); vals = [...new Set(M.visible(T, st.ctx).map(i => T.rows[i][ci]).filter(nonNum))].sort((x, y) => x - y); }
    else { const tv = tableArg(node, st); if (!tv.cols[0] || !tv.cols[0].lin) fail('A função de datas espera uma coluna de datas do calendário (por exemplo Calendario[Data]).', node); [T, ci] = M.colRef(tv.cols[0].lin); vals = [...new Set(tv.rows.map(r => r[0]).filter(nonNum))].sort((x, y) => x - y); }
    return { T, ci, vals, all: allDates(T, ci) };
  }
  const dtab = (d, arr) => mkT([{ n: d.T.cols[d.ci].n, lin: d.T.name + '[' + d.T.cols[d.ci].n + ']' }], arr.map(x => [x]), { clear: d.T });
  const between = (d, s, e) => dtab(d, d.all.filter(x => x >= s && x <= e));
  const firstOf = (unit, v) => { const [y, m] = ymd(v); return unit === 'YEAR' ? serial(y, 1, 1) : unit === 'QUARTER' ? serial(y, Math.floor((m - 1) / 3) * 3 + 1, 1) : serial(y, m, 1); };
  const lastOf = (unit, v) => { const [y, m] = ymd(v); return unit === 'YEAR' ? serial(y, 12, 31) : unit === 'QUARTER' ? serial(y, Math.floor((m - 1) / 3) * 3 + 3, dim(y, Math.floor((m - 1) / 3) * 3 + 3)) : serial(y, m, dim(y, m)); };
  const shiftBy = (unit, v, k) => unit === 'DAY' ? v + k : unit === 'WEEK' ? v + 7 * k : unit === 'MONTH' ? addMonths(v, k) : unit === 'QUARTER' ? addMonths(v, 3 * k) : unit === 'YEAR' ? addMonths(v, 12 * k) : null;
  const UNITS = ['DAY', 'WEEK', 'MONTH', 'QUARTER', 'YEAR'];
  const unitOf = (node, ok) => { const u = kw(node); if (!UNITS.includes(u) || (ok && !ok.includes(u))) fail(`O intervalo precisa ser ${(ok || UNITS.slice(0, 1).concat(UNITS.slice(2))).join(', ')}.`, node); return u; };
  const dateFn = (name, unit) => def(name, 1, 2, (a, st) => { const d = datesOf(a[0], st); if (!d.vals.length) return dtab(d, []); const last = d.vals[d.vals.length - 1]; return between(d, firstOf(unit, last), last); });
  dateFn('DATESYTD', 'YEAR'); dateFn('DATESQTD', 'QUARTER'); dateFn('DATESMTD', 'MONTH');
  const totalFn = (name, unit) => def(name, 2, 4, (a, st) => {
    const d = datesOf(a[1], st), last = d.vals[d.vals.length - 1], tv = d.vals.length ? between(d, firstOf(unit, last), last) : dtab(d, []);
    const f = a[2] && !isEmpty(a[2]) ? [a[2]] : [];
    return ev(a[0], { R: st.R, ctx: calcCtx(st, f, [{ kind: 'tbl', tv, keep: false }]), fr: [], env: st.env });
  });
  totalFn('TOTALYTD', 'YEAR'); totalFn('TOTALQTD', 'QUARTER'); totalFn('TOTALMTD', 'MONTH');
  def('SAMEPERIODLASTYEAR', 1, 1, (a, st) => { const d = datesOf(a[0], st), set = new Set(d.all); return dtab(d, d.vals.map(v => addMonths(v, -12)).filter(x => set.has(x))); });
  def('DATEADD', 3, 3, (a, st) => { const d = datesOf(a[0], st), k = Math.trunc(n0(sv(a[1], st))), u = unitOf(a[2], ['DAY', 'MONTH', 'QUARTER', 'YEAR']), set = new Set(d.all); return dtab(d, [...new Set(d.vals.map(v => shiftBy(u, v, k)).filter(x => set.has(x)))].sort((x, y) => x - y)); });
  def('PARALLELPERIOD', 3, 3, (a, st) => {
    const d = datesOf(a[0], st), k = Math.trunc(n0(sv(a[1], st))), u = unitOf(a[2], ['MONTH', 'QUARTER', 'YEAR']); if (!d.vals.length) return dtab(d, []);
    const s = firstOf(u, shiftBy(u, d.vals[0], k)), e = lastOf(u, shiftBy(u, d.vals[d.vals.length - 1], k)); return between(d, s, e);
  });
  def('DATESBETWEEN', 3, 3, (a, st) => { const d = datesOf(a[0], st), s = num(sv(a[1], st)), e = num(sv(a[2], st)); return between(d, s === null ? -Infinity : s, e === null ? Infinity : e); });
  def('DATESINPERIOD', 4, 4, (a, st) => {
    const d = datesOf(a[0], st), s = num(sv(a[1], st)), k = Math.trunc(n0(sv(a[2], st))), u = unitOf(a[3], ['DAY', 'MONTH', 'QUARTER', 'YEAR']);
    if (s === null) return dtab(d, []); const t = shiftBy(u, s, k); return k < 0 ? between(d, t + 1, s) : between(d, s, t - 1);
  });
  const prevFn = (name, unit, dir) => def(name, 1, 1, (a, st) => {
    const d = datesOf(a[0], st); if (!d.vals.length) return dtab(d, []);
    if (unit === 'DAY') { const x = dir < 0 ? d.vals[0] - 1 : d.vals[d.vals.length - 1] + 1; return dtab(d, d.all.includes(x) ? [x] : []); }
    const ref = dir < 0 ? d.vals[0] : d.vals[d.vals.length - 1], t = shiftBy(unit, ref, dir); return between(d, firstOf(unit, t), lastOf(unit, t));
  });
  prevFn('PREVIOUSDAY', 'DAY', -1); prevFn('PREVIOUSMONTH', 'MONTH', -1); prevFn('PREVIOUSQUARTER', 'QUARTER', -1); prevFn('PREVIOUSYEAR', 'YEAR', -1);
  prevFn('NEXTDAY', 'DAY', 1); prevFn('NEXTMONTH', 'MONTH', 1); prevFn('NEXTQUARTER', 'QUARTER', 1); prevFn('NEXTYEAR', 'YEAR', 1);
  const edge = (name, unit, last) => def(name, 1, 1, (a, st) => {
    const d = datesOf(a[0], st); if (!d.vals.length) return dtab(d, []);
    const ref = last ? d.vals[d.vals.length - 1] : d.vals[0], s = firstOf(unit, ref), e = lastOf(unit, ref), within = d.all.filter(x => x >= s && x <= e);
    return dtab(d, within.length ? [last ? within[within.length - 1] : within[0]] : []);
  });
  edge('STARTOFMONTH', 'MONTH', false); edge('ENDOFMONTH', 'MONTH', true); edge('STARTOFQUARTER', 'QUARTER', false); edge('ENDOFQUARTER', 'QUARTER', true); edge('STARTOFYEAR', 'YEAR', false); edge('ENDOFYEAR', 'YEAR', true);
  def('FIRSTDATE', 1, 1, (a, st) => { const d = datesOf(a[0], st); return dtab(d, d.vals.length ? [d.vals[0]] : []); });
  def('LASTDATE', 1, 1, (a, st) => { const d = datesOf(a[0], st); return dtab(d, d.vals.length ? [d.vals[d.vals.length - 1]] : []); });
  const nonBlank = (name, last) => def(name, 2, 2, (a, st) => {
    const M = st.R.M, tv = tableArg(a[0], st), order = tv.rows.map((r, j) => j).sort((x, y) => cmpv(tv.rows[x][0], tv.rows[y][0])); if (last) order.reverse();
    for (const j of order) { const s2 = sub(st, frameOf(M, tv, j)); if (sv(a[1], { ...s2, ctx: s2.fr.length ? transition(M, s2) : s2.ctx, fr: [] }) !== null) return mkT(tv.cols, [tv.rows[j]]); }
    return mkT(tv.cols, []);
  });
  nonBlank('FIRSTNONBLANK', false); nonBlank('LASTNONBLANK', true);

  // utilidades usadas pelas conferências
  lib.nonNum = nonNum;
});
