// Correção das atividades de EXCEL (roda no servidor; o navegador nunca recebe a resposta).
//
// O aluno manda as fórmulas que escreveu nas células em branco. A correção:
//   1. confere se todas as células pedidas foram preenchidas e se usou as funções exigidas (need);
//   2. calcula a planilha com as fórmulas DELE e com as fórmulas da resposta oficial e compara os RESULTADOS (qualquer fórmula correta vale);
//   3. repete a conta com números diferentes na planilha ("planilha alternativa"): uma fórmula que só dá o número certo porque ele foi
//      digitado à mão (ou que não acompanha os dados) falha aqui.
const XL = require('./public/xl.js');

const MAXCELLS = 60, MAXLEN = 400;
const FACTORS = [2, 3, 1.5, 0.5, 4, 2.5];

// planilha-base da atividade: tudo o que vem pronto (textos, números, fórmulas travadas)
function baseRaw(l) {
  const raw = {};
  (l.sheet.rows || []).forEach((row, i) => row.forEach((v, j) => { if (v !== null && v !== undefined && v !== '') raw[XL.addr(j + 1, i + 1)] = v; }));
  return raw;
}
// números diferentes: multiplica cada número digitado por um fator (menos datas, colunas "keep" e células que são respostas)
function altRaw(l) {
  const raw = baseRaw(l), keep = new Set((l.keep || []).map(c => c.toUpperCase())), fmt = l.sheet.fmt || {}, cfmt = l.sheet.cfmt || {};
  for (const a of Object.keys(raw)) {
    const v = raw[a], p = XL.parseAddr(a), L = XL.colL(p.c);
    if (typeof v !== 'number' || keep.has(L) || l.answer[a] !== undefined) continue;
    if ((cfmt[a] || fmt[L]) === 'data') continue;
    const f = FACTORS[(p.r * 7 + p.c * 3) % FACTORS.length];
    raw[a] = XL.rnd(v * f, 4);
  }
  Object.assign(raw, l.altSet || {});
  return raw;
}
const texts = edits => Object.values(edits).join(' ');
const norm = s => XL.normName(s).toLowerCase().replace(/\s+/g, '');

// as funções/símbolos exigidos aparecem na resposta? (função: nome seguido de "(", sem confundir SE( com E( nem MAIÚSCULA( com PRI.MAIÚSCULA()
function needMissing(l, edits) {
  const t = norm(texts(edits));
  for (const n of l.need || []) {
    const k = norm(n);
    const ok = /^[a-z][a-z0-9.]*$/.test(k) ? new RegExp('(^|[^a-z0-9_.])' + k.replace(/\./g, '\\.') + '\\(').test(t) : t.includes(k);
    if (!ok) return n;
  }
  return null;
}
function cleanEdits(l, code) {
  let o; try { o = JSON.parse(String(code)); } catch { return null; }
  if (!o || typeof o !== 'object' || Array.isArray(o)) return null;
  const out = {};
  for (const a of l.targets) { const v = o[a]; out[a] = typeof v === 'string' ? v.slice(0, MAXLEN) : (typeof v === 'number' ? String(v) : ''); }
  return out;
}
const inputOf = s => XL.parseInput(s).raw;
const showV = (v, l, a) => {
  const p = XL.parseAddr(a), L = XL.colL(p.c), fmt = (l.sheet.cfmt || {})[a] || (l.sheet.fmt || {})[L];
  const t = XL.show(v, fmt);
  return typeof v === 'string' ? '"' + t + '"' : t;     // textos aparecem entre aspas (para não confundir "2024" com 2024)
};

// devolve { ok, missing?, xl: { cells: [{ a, ok, got, want, why }] } }
function grade(l, code) {
  const edits = cleanEdits(l, code);
  if (!edits) return { ok: false };
  const cells = [];
  const empty = l.targets.filter(a => !String(edits[a]).trim());
  if (empty.length === l.targets.length) return { ok: false, xl: { cells: l.targets.map(a => ({ a, ok: false, why: 'vazio' })) } };
  const miss = needMissing(l, edits);
  if (miss) return { ok: false, missing: miss, xl: { cells: l.targets.map(a => ({ a, ok: false, why: String(edits[a]).trim() ? 'faltou' : 'vazio' })) } };

  const base = baseRaw(l), mine = { ...base }, ref = { ...base };
  for (const a of l.targets) { mine[a] = inputOf(edits[a]); ref[a] = l.answer[a]; }
  const A = new XL.Sheet(mine), B = new XL.Sheet(ref);
  let ok = true;
  for (const a of l.targets) {
    const txt = String(edits[a]).trim(), got = A.value(a), want = B.value(a), c = { a, ok: true };
    if (!txt) { c.ok = false; c.why = 'vazio'; }
    else if (txt[0] === '=' && !XL.check(txt).ok) { c.ok = false; c.why = 'sintaxe'; c.msg = XL.check(txt).msg; }
    else if (!XL.same(got, want)) { c.ok = false; c.why = 'valor'; c.got = showV(got, l, a); c.want = showV(want, l, a); }
    else if (txt[0] !== '=' && String(l.answer[a])[0] === '=') { c.ok = false; c.why = 'fixo'; }
    if (!c.ok) ok = false; cells.push(c);
  }
  if (ok && !l.noAlt) {                                                     // a mesma fórmula com outros números precisa continuar certa
    const ar = altRaw(l), am = { ...ar }, aa = { ...ar };
    for (const a of l.targets) { am[a] = mine[a]; aa[a] = l.answer[a]; }
    const A2 = new XL.Sheet(am), B2 = new XL.Sheet(aa);
    for (const c of cells) if (!XL.same(A2.value(c.a), B2.value(c.a))) { c.ok = false; c.why = 'alt'; ok = false; }
  }
  return { ok, xl: ok ? undefined : { cells } };
}

// usada nos testes e na conferência do conteúdo: calcula a planilha com a resposta oficial (e com a alternativa)
function solved(l, alt) {
  const raw = alt ? altRaw(l) : baseRaw(l); for (const a of l.targets) raw[a] = l.answer[a];
  const sh = new XL.Sheet(raw), out = {}; for (const a of l.targets) out[a] = sh.value(a); return out;
}
module.exports = { grade, baseRaw, altRaw, solved, needMissing, MAXCELLS };
