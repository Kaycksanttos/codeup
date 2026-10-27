// Confere o CONTEÚDO dos cursos Power BI e DAX e Análise de Dados (lições de DAX, quizzes, leituras e provas): `npm run check:pbi`.
//   DAX:  a resposta oficial passa na correção (nos dados normais e nos alternativos) · usa o que a lição exige e nada do que ela proíbe · os visuais têm linhas ·
//         uma resposta vazia, uma medida "= 0" e um valor digitado à mão NÃO passam · o exemplo da teoria é DAX válido e roda no modelo.
//   Quiz: cada pergunta tem a estrutura certa (3 erradas diferentes, resposta fora das erradas, explicação) · gráficos e tabelas montam · o gabarito confere com `calc` quando existe ·
//         visual montado (build) funciona no motor de DAX · o texto modelo de uma resposta escrita passa e a resposta vazia não.
//   Leitura: pergunta, resposta e explicação; se tem `eval`, o resultado calculado pelo motor de DAX é exatamente a resposta certa.
const DAX = require('../public/dax.js'); require('../public/daxlib.js');
const DD = require('../public/daxdata.js'), CH = require('../public/charts.js');
const daxcheck = require('../daxcheck'), quizcheck = require('../quizcheck'), EXPLAIN = require('../explain');
const lessons = require('../lessons');

const IS = l => l.type === 'dax' || l.type === 'quiz';
const nz = s => String(s ?? '').replace(/\s+/g, ' ').trim();

// ---------- DAX ----------
function checkDax(l, bad, warn) {
  const id = l.id, B = m => bad.push(`${id}: ${m}`), W = m => warn.push(`${id}: ${m}`);
  for (const k of ['model', 'answer', 'starter', 'hints', 'solution']) if (l[k] === undefined) return B(`falta "${k}"`);
  if (!l.hints[0] || nz(l.hints[0]).length < 15) B('dica (hints[0]) vazia ou curta demais');
  if (!DD.ids.includes(l.model)) return B('modelo desconhecido ' + l.model);
  const mode = l.mode || 'measure'; if (mode === 'column' && !l.table) B('lição de coluna calculada sem "table"');
  // a resposta oficial
  let sol; try { sol = daxcheck.grade(l, l.solution); } catch (e) { return B('a correção quebrou com a resposta oficial: ' + e.message); }
  if (!sol.ok) return B('a resposta oficial NÃO passa na correção: ' + JSON.stringify(sol.dx || sol).slice(0, 300));
  const flat = l.solution.toUpperCase(); const used = new Set(); try { DAX.parse(l.solution).defs.forEach(d => daxcheck.usage(d.ast, { fn: used, op: used })); } catch { }
  for (const n of l.need || []) if (!used.has(String(n).toUpperCase()) && !used.has(n)) B(`a resposta oficial não usa "${n}"`);
  for (const n of l.forbid || []) if (used.has(String(n).toUpperCase())) B(`a resposta oficial usa "${n}", que é proibido`);
  // os visuais têm linhas e números
  if (mode === 'measure') {
    for (const alt of [false, true]) {
      let rs; try { rs = daxcheck.solved(l, alt); } catch (e) { return B('os visuais não calculam: ' + e.message); }
      rs.forEach((r, i) => {
        if (!r.rows.length && (l.views || [])[i] && (l.views[i].by || []).length) B(`visual ${i + 1} sem linhas${alt ? ' (dados alternativos)' : ''}`);
        if (r.rows.length && r.rows.every(x => x.v.every(v => v === null))) B(`visual ${i + 1} só tem valores vazios`);
        if (!alt && r.rows.length && r.rows.every(x => x.v.every(v => v === 0))) W(`visual ${i + 1} só tem zeros`);
      });
    }
  }
  // respostas que NÃO podem passar
  const no = (code, why) => { let g; try { g = daxcheck.grade(l, code); } catch (e) { return B(`a correção quebrou com "${why}": ${e.message}`); } if (g.ok) B(`passa mesmo sendo ${why}`); };
  no('', 'uma resposta vazia'); no('-- só um comentário', 'só um comentário');
  const names = Object.keys(l.answer);
  if (mode === 'measure') {
    no(names.map(n => `${n} = 0`).join('\n'), 'medidas "= 0"');
    if (!l.noAlt) {                                                  // valor digitado à mão (o total de cada medida nos dados normais)
      const tot = daxcheck.solved(l, false)[0], vals = tot.total;
      if (vals.every(v => typeof v === 'number')) { const ok = daxcheck.grade(l, names.map((n, i) => `${n} = ${vals[i]}`).join('\n')); if (ok.ok && !(l.need || []).length) B('um valor digitado à mão PASSA e a lição não exige nenhuma função (use "need" ou um visual agrupado)'); }
    }
  }
  if ((l.need || []).length) no(names.map(n => `${n} = 1`).join('\n'), 'uma fórmula sem a função exigida');
  // o exemplo da teoria é DAX válido (e roda no modelo, se são medidas)
  if (l.example) {
    try {
      const s = DAX.parse(l.example), M = DD.get(l.model, l.extra);
      for (const d of s.defs) if (d.kind === 'measure' && d.name) { const Mx = M.with([[d.name, d.ast]]); DAX.evalExpr(Mx, d.ast); }
    } catch (e) { B('o exemplo da teoria não é DAX válido neste modelo: ' + e.message); }
  }
}

// ---------- quiz ----------
const dupes = a => new Set(a.map(nz)).size !== a.length;
function checkMaterial(it, B) {
  try {
    if (it.chart) { const h = CH.chart(it.chart); if (!h) B('gráfico vazio'); if (it.chart.series) for (const s of it.chart.series) { if (it.chart.cats && s.values && s.values.length !== it.chart.cats.length) B('gráfico: quantidade de valores diferente da de categorias'); } }
    if (it.table) { const t = it.table; if (!t.cols || !t.rows || t.rows.some(r => r.length !== t.cols.length)) B('tabela com linhas de tamanho diferente das colunas'); CH.table(t); }
    if (it.diagram) { const d = it.diagram, nm = d.tables.map(t => t.name); for (const r of d.rels || []) for (const x of r.slice(0, 2)) { const t = String(x).split('[')[0]; if (!nm.includes(t)) B('diagrama: relacionamento com tabela que não existe: ' + x); } CH.diagram(d); }
    if (it.code && it.lang !== 'm' && it.lang !== 'text' && (it.lang === 'dax' || it.lang === undefined)) { try { DAX.parse(it.code); } catch (e) { if (!/^\s*(\/\/|--|\/\*)/.test(it.code) && it.codeCheck !== false) B('código DAX do material não é válido: ' + e.message); } }
  } catch (e) { B('material quebrou: ' + e.message); }
}
function checkItem(l, it, i, bad, warn) {
  const B = m => bad.push(`${l.id} pergunta ${i + 1}: ${m}`), W = m => warn.push(`${l.id} pergunta ${i + 1}: ${m}`);
  if (!it.q || nz(it.q).length < 8) B('texto da pergunta curto');
  if (!it.why || nz(it.why).length < 20) B('explicação ("why") ausente ou curta');
  checkMaterial(it, B);
  const clean = x => nz(x).length > 0 && !/TODO|XXX/.test(x);
  switch (it.t) {
    case 'mc': {
      if (!Array.isArray(it.no) || it.no.length !== 3) return B('mc precisa de exatamente 3 respostas erradas');
      const all = [it.ok, ...it.no]; if (!all.every(clean)) B('opção vazia/pendente'); if (dupes(all)) B('opções repetidas');
      if (it.calc) { const v = it.calc(); if (nz(v) !== nz(it.ok)) B(`calc() dá "${v}" mas a resposta certa é "${it.ok}"`); }
      break;
    }
    case 'multi': {
      if (!Array.isArray(it.ok) || it.ok.length < 2) B('multi precisa de 2 ou mais respostas certas'); if (!Array.isArray(it.no) || it.no.length < 1) return B('multi precisa de erradas');
      if (dupes([...it.ok, ...it.no])) B('opções repetidas'); if (it.ok.length + it.no.length > 7) W('muitas opções');
      break;
    }
    case 'order': { if (!Array.isArray(it.steps) || it.steps.length < 3 || it.steps.length > 7) B('ordenar precisa de 3 a 7 passos'); else if (dupes(it.steps)) B('passos repetidos'); break; }
    case 'match': { if (!Array.isArray(it.pairs) || it.pairs.length < 3 || it.pairs.length > 6) B('ligar precisa de 3 a 6 pares'); else { if (dupes(it.pairs.map(p => p[0])) || dupes(it.pairs.map(p => p[1]))) B('itens repetidos nos pares'); } break; }
    case 'num': {
      if (typeof it.ok !== 'number' || !isFinite(it.ok)) return B('num precisa de "ok" numérico');
      if (it.calc) { const v = it.calc(); if (Math.abs(v - it.ok) > 1e-6 * Math.max(1, Math.abs(it.ok))) B(`calc() dá ${v} mas a resposta certa é ${it.ok}`); }
      if (quizcheck.gradeItem(it, 'abc') === true) B('texto qualquer passou');
      break;
    }
    case 'write': {
      if (!it.model || !Array.isArray(it.groups) || it.groups.length < 2) return B('write precisa de "model" e de 2+ grupos');
      const c = EXPLAIN.compile(it); if (!EXPLAIN.grade(c, it.model).ok) B('o texto modelo NÃO passa na própria correção');
      if (EXPLAIN.grade(c, 'não sei dizer bem o que isso quer dizer').ok) B('uma resposta sem sentido passa');
      if (EXPLAIN.grade(c, '').ok) B('resposta vazia passa');
      break;
    }
    case 'build': {
      if (!DD.ids.includes(it.model)) return B('modelo desconhecido');
      const M = DD.get(it.model), ok = it.ok;
      if (!it.visuals.includes(ok.v)) B('o visual certo não está entre os permitidos');
      const defs = Object.entries(it.measures || {}).map(([n, f]) => { try { return [n, DAX.parse(f).defs[0].ast]; } catch (e) { B(`medida ${n} inválida: ${e.message}`); return null; } }).filter(Boolean), Mx = M.with(defs);
      for (const f of it.fields) { try { DAX.evalExpr(Mx, `VALUES(${f})`); } catch { B('campo inexistente no modelo: ' + f); } }
      const pool = [...it.fields, ...Object.keys(it.measures || {})];
      for (const k of ['axis', 'legend', 'rows', 'cols']) if (ok[k] && !it.fields.includes(ok[k])) B(`${k} "${ok[k]}" não está nos campos`);
      if (ok.values && !(ok.values in (it.measures || {}))) B(`values "${ok.values}" não é uma das medidas`);
      for (const f of ok.fields || []) if (!pool.includes(f)) B(`campo "${f}" não existe`);
      const by = [ok.axis, ok.legend, ok.rows, ok.cols].filter(Boolean);
      if (ok.values) { try { const r = DAX.runVisual(Mx, { by }, [{ name: ok.values, ast: defs.find(d => d[0] === ok.values)[1], local: false }]); if (by.length && !r.rows.length) B('o visual montado fica vazio'); } catch (e) { B('o visual montado não calcula: ' + e.message); } }
      break;
    }
    default: B('tipo de pergunta desconhecido: ' + it.t);
  }
  // a pergunta aceita a própria resposta certa
  try { const g = quizcheck.gradeItem(it, quizcheck.solution({ quiz: [it] })[0]); if (g !== true) B('a resposta certa não passa na correção'); } catch (e) { B('a correção quebrou: ' + e.message); }
}
function checkQuiz(l, bad, warn) {
  const B = m => bad.push(`${l.id}: ${m}`);
  if (!Array.isArray(l.quiz) || l.quiz.length < 3 || l.quiz.length > 12) return B('um quiz precisa de 3 a 12 perguntas');
  l.quiz.forEach((it, i) => checkItem(l, it, i, bad, warn));
  const g = quizcheck.grade(l, quizcheck.solution(l)); if (!g.ok) B('as respostas certas não passam na correção do quiz');
  if (quizcheck.grade(l, []).ok) B('um quiz vazio passa');
  // a resposta certa não pode ser sempre a mais longa (pista fácil demais)
  const mcs = l.quiz.filter(x => x.t === 'mc'); if (mcs.length >= 3 && mcs.filter(x => x.ok.length > Math.max(...x.no.map(y => y.length))).length / mcs.length > 0.7) warn.push(`${l.id}: a resposta certa é quase sempre a mais comprida`);
  // o que vai para o navegador não pode ter gabarito
  const pub = JSON.stringify(quizcheck.pub(l, 'u1')); for (const it of l.quiz) { if (it.t === 'mc' && it.no.length && pub.includes('"ok"')) B('o gabarito vazou para o navegador'); if (it.why && pub.includes(JSON.stringify(it.why).slice(1, -1))) B('a explicação vazou para o navegador'); }
}
// ---------- leitura (content/rd-*.js) ----------
function modelOf(data) {
  const tables = {}; for (const [n, t] of Object.entries(data.tables)) { tables[n] = { cols: t.cols.map((c, i) => ({ n: c, t: t.types && t.types[i] || (t.rows.every(r => r[i] === null || typeof r[i] === 'number') ? (t.rows.every(r => r[i] === null || Number.isInteger(r[i])) ? 'int' : 'dec') : 'text'), key: i === 0 })), rows: t.rows }; }
  return new DAX.Model({ tables, rels: data.rels || [], calc: data.calc || {}, measures: {} });
}
function checkRead(l, r, bad, warn) {
  const B = m => bad.push(`${l.id} (leitura): ${m}`);
  if (!['mc', 'num', 'type'].includes(r.k)) return B('tipo de leitura inválido: ' + r.k);
  if (!r.q || nz(r.q).length < 8) B('pergunta curta'); if (!r.why || nz(r.why).length < 20) B('explicação ("why") ausente ou curta');
  if (r.k === 'mc') { if (!Array.isArray(r.no) || r.no.length !== 3) return B('mc precisa de 3 erradas'); if (dupes([r.ok, ...r.no])) B('opções repetidas'); }
  if (r.k === 'num' && typeof r.ok !== 'number') B('num precisa de "ok" numérico');
  if (!r.code && !r.table && !r.chart && !r.text && !r.data && !r.diagram) B('leitura sem nada para ler');
  checkMaterial(r, B);
  if (r.eval) {
    try {
      const M = r.data ? modelOf(r.data) : DD.get(r.model || l.model, r.extra), s = r.code ? DAX.parse(r.code) : { defs: [] };
      const Mx = M.with(s.defs.filter(d => d.kind === 'measure' && d.name).map(d => [d.name, d.ast]));
      const v = DAX.evalExpr(Mx, r.eval, r.filters), got = DAX.isTbl(v) ? null : DAX.K.scalar(v);
      if (r.k === 'num') { if (typeof got !== 'number' || Math.abs(got - r.ok) > 1e-6 * Math.max(1, Math.abs(r.ok))) B(`o motor calcula ${got} mas a resposta certa é ${r.ok}`); }
      else { const sh = DAX.show(got, r.fmt); if (nz(sh) !== nz(r.ok)) B(`o motor calcula "${sh}" mas a resposta certa é "${r.ok}"`); }
    } catch (e) { B('não calculou: ' + e.message); }
  }
  if (r.calc) { const v = r.calc(); if (r.k === 'num' ? Math.abs(v - r.ok) > 1e-6 * Math.max(1, Math.abs(r.ok)) : nz(v) !== nz(r.ok)) B(`calc() dá "${v}" mas a resposta certa é "${r.ok}"`); }
  if (r.code && /dax|DAX/.test(l.exLang || '') && !r.lang) { try { DAX.parse(r.code); } catch (e) { B('código DAX da leitura não é válido: ' + e.message); } }
}

function check() {
  const bad = [], warn = []; let n = 0;
  const all = [...lessons, ...lessons.tests, ...lessons.projects].filter(IS);
  for (const l of all) {
    n++;
    if (l.type === 'dax') checkDax(l, bad, warn); else checkQuiz(l, bad, warn);
    if (l.read) checkRead(l, l.read, bad, warn);
    else if (!l.cp && !l.fin && !l.proj) bad.push(`${l.id}: sem atividade de leitura (content/rd-*.js)`);
  }
  return { n, bad, warn };
}
module.exports = check;
if (require.main === module) {
  const r = check(); r.warn.forEach(w => console.log('aviso:', w)); r.bad.forEach(b => console.log('ERRO:', b));
  console.log(`${r.n} atividades conferidas · ${r.bad.length} erros · ${r.warn.length} avisos`); process.exit(r.bad.length ? 1 : 0);
}
