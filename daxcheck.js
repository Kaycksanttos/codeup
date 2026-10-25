// Correção das atividades de DAX (roda no servidor; o navegador nunca recebe a resposta).
//
// O aluno escreve uma ou mais definições («Nome = fórmula»). A correção:
//   1. lê a fórmula (erro de sintaxe volta com a linha e o trecho) e confere se usou as funções exigidas (need) e nenhuma proibida (forbid);
//   2. calcula as medidas do aluno e as da resposta oficial em cada VISUAL da lição (por exemplo "por categoria" ou "por ano com segmentação")
//      e compara os RESULTADOS: qualquer fórmula que dê os mesmos números vale;
//   3. repete tudo com outros números nas tabelas ("dados alternativos"): uma fórmula que só acerta porque o número foi digitado à mão falha aqui.
// Modos: 'measure' (medidas, o normal), 'column' (coluna calculada: compara linha a linha) e 'table' (expressão de tabela).
const DAX = require('./public/dax.js'), DD = require('./public/daxdata.js');

const MAXDEFS = 8, MAXROWS_SHOWN = 12;
const nn = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const lineCol = (code, pos) => { if (pos == null || pos < 0) return {}; const t = String(code).slice(0, pos), line = t.split('\n').length; return { line, col: pos - t.lastIndexOf('\n') }; };
const errOf = (e, code) => e instanceof DAX.DaxErr ? { msg: e.message, ...lineCol(code, e.pos) } : null;

// funções e operadores usados numa árvore
function usage(ast, out = { fn: new Set(), op: new Set() }) {
  if (!ast || typeof ast !== 'object') return out;
  switch (ast.k) {
    case 'call': out.fn.add(ast.f); ast.a.forEach(x => usage(x, out)); break;
    case 'bin': out.op.add(ast.op); usage(ast.l, out); usage(ast.r, out); break;
    case 'un': out.op.add(ast.op === '!' ? 'NOT' : 'NEG'); usage(ast.e, out); break;
    case 'in': out.op.add('IN'); usage(ast.l, out); usage(ast.r, out); break;
    case 'let': out.op.add('VAR'); ast.vars.forEach(v => usage(v.e, out)); usage(ast.ret, out); break;
    case 'tcons': ast.rows.forEach(r => r.forEach(x => usage(x, out))); break;
  }
  return out;
}
const same = (a, b) => {
  if (a === b) return true; if (a === null || b === null || a === undefined || b === undefined) return false;
  if (typeof a === 'number' && typeof b === 'number') { if (Number.isNaN(a) && Number.isNaN(b)) return true; if (!isFinite(a) || !isFinite(b)) return a === b; return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b)); }
  if (typeof a === 'string' && typeof b === 'string') return a === b;
  return false;
};
const fmtOf = (view, name) => (view.fmt && (view.fmt[name] || view.fmt['*'])) || undefined;
const showV = (v, f) => DAX.show(v, f);

// as definições esperadas (resposta oficial) já lidas
const expectedDefs = l => Object.entries(l.answer).map(([name, text]) => { const s = DAX.parse(text); return { name, ast: s.defs[0].ast, text }; });
const viewsOf = l => l.views && l.views.length ? l.views : [{ by: [] }];

function modelFor(l, alt) { return DD.get(l.model, l.extra, alt); }

// emparelha as definições do aluno com as esperadas (pelo nome; com uma só definição esperada e uma só escrita, o nome não importa)
function pair(l, mine, want) {
  const mode = l.mode || 'measure', defs = mine.defs;
  const cand = mode === 'column' ? defs.filter(d => d.kind === 'column' || !d.table) : mode === 'table' ? defs : defs.filter(d => d.kind === 'measure');
  const pairs = [], missing = [];
  for (const w of want) {
    let d = cand.find(x => x.name && nn(x.name) === nn(w.name));
    if (!d && want.length === 1 && cand.length === 1) d = cand[0];
    if (d) pairs.push({ w, d }); else missing.push(w.name);
  }
  return { pairs, missing, wrongKind: !cand.length && defs.length ? defs[0].kind : null };
}

// compara um visual: devolve { ok, rows: [{ g, got: [..], want: [..], ok }], total }
function cmpVisual(rs, rw, view, names) {
  const key = r => r.g.map(DAX.vkey).join(DAX.SEP), ms = new Map(rs.rows.map(r => [key(r), r])), rows = [];
  let ok = true;
  const mk = (g, got, want) => { const okRow = got && want ? want.every((x, i) => same(got[i], x)) : false; if (!okRow) ok = false; rows.push({ g, got, want, ok: okRow }); };
  for (const r of rw.rows) { const m = ms.get(key(r)); mk(r.g, m ? m.v : null, r.v); ms.delete(key(r)); }
  for (const r of ms.values()) mk(r.g, r.v, null);
  const tot = rw.total.every((x, i) => same(rs.total[i], x)); if (!tot) ok = false;
  return { ok, rows, total: { got: rs.total, want: rw.total, ok: tot } };
}

function runViews(l, mine, pairs, alt) {
  const M = modelFor(l, alt), want = pairs.map(p => p.w), res = [];
  const Ms = M.with(mine.defs.filter(d => d.name).map(d => [d.name, d.ast])), Me = M.with(want.map(d => [d.name, d.ast]));
  for (const v of viewsOf(l)) {
    const rs = DAX.runVisual(Ms, v, pairs.map(p => ({ name: p.w.name, ast: p.d.ast, local: false }))), rw = DAX.runVisual(Me, v, want.map(w => ({ name: w.name, ast: w.ast, local: false })));
    res.push({ view: v, ...cmpVisual(rs, rw, v, want.map(w => w.name)), names: want.map(w => w.name), by: rw.by });
  }
  return res;
}
function colValues(M, tableName, ast) {
  const T = M.tbl(tableName), R = DAX.newRun(M), out = [], K = DAX.K;
  for (let i = 0; i < T.rows.length; i++) out.push(K.scalar(K.ev(ast, K.ST(R, K.rootCtx(), [K.frameBase(T, i)])), ast));
  return out;
}
const tblKey = r => r.map(DAX.vkey).join(DAX.SEP);
function tableOf(M, ast) { const v = DAX.evalExpr(M, ast); if (!DAX.isTbl(v)) throw new DAX.DaxErr('A fórmula precisa devolver uma tabela (por exemplo FILTER, TOPN, ADDCOLUMNS, SUMMARIZE).'); return v; }

// devolve { ok, missing?, dx }
function grade(l, code) {
  let mine;
  try { mine = DAX.parse(String(code)); } catch (e) { const er = errOf(e, code); if (er) return { ok: false, dx: { err: er } }; throw e; }
  if (!mine.defs.length || mine.defs.length > MAXDEFS) return { ok: false, dx: { err: { msg: 'Escreva de 1 a ' + MAXDEFS + ' definições.' } } };
  const want = expectedDefs(l), mode = l.mode || 'measure';
  const used = { fn: new Set(), op: new Set() }; mine.defs.forEach(d => usage(d.ast, used));        // funções e operadores usados
  const has = n => used.fn.has(String(n).toUpperCase()) || used.op.has(String(n).toUpperCase()) || used.op.has(n);
  const miss = (l.need || []).find(n => !has(n)); if (miss) return { ok: false, missing: miss, dx: { need: miss } };
  const bad = (l.forbid || []).find(n => has(n)); if (bad) return { ok: false, dx: { forbid: bad } };
  const { pairs, missing, wrongKind } = pair(l, mine, want);
  if (wrongKind) return { ok: false, dx: { kind: wrongKind, mode } };
  if (missing.length) return { ok: false, dx: { missing } };
  try {
    if (mode === 'column') return gradeColumn(l, mine, pairs);
    if (mode === 'table') return gradeTable(l, mine, pairs);
    const base = runViews(l, mine, pairs, false);
    if (!base.every(v => v.ok)) return { ok: false, dx: dxOf(l, base) };
    if (!l.noAlt) { const alt = runViews(l, mine, pairs, true); if (!alt.every(v => v.ok)) return { ok: false, dx: { alt: true, ...dxOf(l, alt) } }; }
    return { ok: true };
  } catch (e) { const er = errOf(e, code); if (er) return { ok: false, dx: { err: er } }; throw e; }
}
// para a tela: por visual, as linhas com o que o aluno obteve e o que era esperado (já formatados)
function dxOf(l, res) {
  return {
    defs: res.map(r => ({
      title: r.view.title || null, by: r.by, names: r.names, ok: r.ok,
      rows: r.rows.slice(0, MAXROWS_SHOWN).map(x => ({ g: x.g.map(v => showV(v)), got: x.got ? x.got.map((v, i) => showV(v, fmtOf(r.view, r.names[i]))) : null, want: x.want ? x.want.map((v, i) => showV(v, fmtOf(r.view, r.names[i]))) : null, ok: x.ok })),
      more: Math.max(0, r.rows.length - MAXROWS_SHOWN),
      total: { got: r.total.got.map((v, i) => showV(v, fmtOf(r.view, r.names[i]))), want: r.total.want.map((v, i) => showV(v, fmtOf(r.view, r.names[i]))), ok: r.total.ok }
    }))
  };
}
function gradeColumn(l, mine, pairs) {
  const tn = l.table, out = [];
  for (const alt of l.noAlt ? [false] : [false, true]) {
    const M = modelFor(l, alt);
    for (const p of pairs) {
      const w = colValues(M, tn, p.w.ast), g = colValues(M, tn, p.d.ast), T = M.tbl(tn), shown = [];
      let ok = true;
      w.forEach((x, i) => { const o = same(g[i], x); if (!o) ok = false; shown.push({ i, got: g[i], want: x, ok: o }); });
      if (!ok) {
        const lab = T.cols[0].n, bad = shown.filter(x => !x.ok).slice(0, 4), first = shown.slice(0, 4);
        const rows = [...first, ...bad.filter(b => !first.includes(b))].slice(0, 8).sort((a, b) => a.i - b.i);
        return { ok: false, dx: { col: { name: p.w.name, table: tn, alt, label: lab, rows: rows.map(x => ({ n: x.i + 1, key: showV(T.rows[x.i][0]), got: showV(x.got), want: showV(x.want), ok: x.ok })), bad: shown.filter(x => !x.ok).length, total: shown.length } } };
      }
    }
  }
  return { ok: true };
}
function gradeTable(l, mine, pairs) {
  for (const alt of l.noAlt ? [false] : [false, true]) {
    const M = modelFor(l, alt), p = pairs[0], w = tableOf(M, p.w.ast), g = tableOf(M, p.d.ast);
    const order = l.ordered ? x => x : x => [...x].sort(), kx = t => order(t.rows.map(r => tblKey(r.map(v => typeof v === 'number' ? Math.round(v * 1e9) / 1e9 : v))));
    const colsOk = g.cols.length === w.cols.length && (!l.names || g.cols.every((c, i) => nn(c.n) === nn(w.cols[i].n)));
    const ok = colsOk && JSON.stringify(kx(g)) === JSON.stringify(kx(w));
    if (!ok) {
      const cut = t => ({ cols: t.cols.map(c => c.n), rows: t.rows.slice(0, 8).map(r => r.map(v => showV(v))), n: t.rows.length });
      return { ok: false, dx: { tbl: { alt, got: cut(g), want: cut(w), colsOk } } };
    }
  }
  return { ok: true };
}

// ---- usadas nos testes e na conferência do conteúdo ----
function solved(l, alt) {                          // as medidas oficiais calculadas em cada visual
  const M = modelFor(l, alt), want = expectedDefs(l), Me = M.with(want.map(d => [d.name, d.ast])), out = [];
  for (const v of viewsOf(l)) out.push(DAX.runVisual(Me, v, want.map(d => ({ name: d.name, ast: d.ast, local: false }))));
  return out;
}
module.exports = { grade, solved, expectedDefs, viewsOf, modelFor, usage, same, colValues, nn };
