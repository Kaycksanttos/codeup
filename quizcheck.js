// Atividades de QUIZ (cursos Power BI e Análise de Dados): várias perguntas numa tela, corrigidas no servidor.
// Tipos de pergunta (cada item de `l.quiz`):
//   mc     { q, ok, no: [3 erradas], why }                     escolher uma resposta
//   multi  { q, ok: [certas], no: [erradas], why }              marcar todas as certas
//   order  { q, steps: [na ordem certa], why }                  colocar em ordem (aparecem embaralhados)
//   match  { q, pairs: [[esquerda, direita], ...], why }        ligar cada item da esquerda ao da direita
//   num    { q, ok: número, tol?, why }                         digitar um número (aceita 1.234,5 e 1234.5)
//   build  { q, model, fields, measures: {nome: fórmula}, visuals, ok: { v, axis?, legend?, values?, rows?, cols?, fields? }, why }   montar um visual do Power BI com os campos
//   write  { q, groups, need?, model (texto de exemplo), why }  escrever com as próprias palavras (conferido por conceitos, veja explain.js)
// Material opcional em qualquer pergunta: code (DAX), table { cols, rows }, chart (veja public/charts.js), diagram (modelo de dados), text.
// A resposta certa nunca vai para o navegador: `pub` embaralha as opções (sempre do mesmo jeito para a mesma pessoa) e tira o gabarito.
const crypto = require('crypto'), EXPLAIN = require('./explain');
const sha = s => crypto.createHash('sha1').update(String(s)).digest('hex');
const shuffled = (arr, seed) => { const a = [...arr]; let h = parseInt(sha(seed).slice(0, 8), 16) || 1; const rnd = () => (h = (Math.imul(h, 1664525) + 1013904223) >>> 0) / 4294967296; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const nz = s => String(s ?? '').replace(/\s+/g, ' ').trim();
const nk = s => nz(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const MATERIAL = ['code', 'table', 'chart', 'text', 'diagram', 'lang', 'codeLabel'];
function pubItem(it, seed) {
  const o = { t: it.t, q: it.q };
  for (const k of MATERIAL) if (it[k] !== undefined) o[k] = it[k];
  switch (it.t) {
    case 'mc': o.opts = shuffled([it.ok, ...it.no], seed); break;
    case 'multi': o.opts = shuffled([...it.ok, ...it.no], seed); break;
    case 'order': o.steps = shuffled(it.steps, seed); break;
    case 'match': o.left = it.pairs.map(p => p[0]); o.right = shuffled(it.pairs.map(p => p[1]), seed); break;
    case 'num': o.unit = it.unit; break;
    case 'build': o.model = it.model; o.fields = it.fields; o.measures = it.measures; o.visuals = it.visuals; break;
    case 'write': o.minw = EXPLAIN.MINW; break;
  }
  return o;
}
const pub = (l, uid) => l.quiz.map((it, i) => pubItem(it, uid + ':' + l.id + ':' + i));

const parseNum = s => { s = nz(s).replace(/^R\$\s*/i, '').replace(/%$/, ''); if (!s) return null; if (/^[+-]?\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) s = s.replace(/\./g, '').replace(',', '.'); else if (/^[+-]?\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) s = s.replace(/,/g, ''); else s = s.replace(',', '.'); return /^[+-]?(\d+\.?\d*|\.\d+)$/.test(s) ? parseFloat(s) : null; };
const eqSet = (a, b) => { const x = (a || []).map(nk).sort(), y = (b || []).map(nk).sort(); return x.length === y.length && x.every((v, i) => v === y[i]); };
const BUILD_KEYS = ['axis', 'legend', 'values', 'rows', 'cols', 'fields'];
const WR = new WeakMap(); const compiled = it => { let c = WR.get(it); if (!c) { c = EXPLAIN.compile(it); WR.set(it, c); } return c; };
// devolve true/false (ou, em `write`, { ok, miss, short })
function gradeItem(it, a) {
  if (a === undefined || a === null) return false;
  switch (it.t) {
    case 'write': { const g = EXPLAIN.grade(compiled(it), a); return g.ok ? true : { ok: false, miss: g.miss, short: g.short, copy: g.copy }; }
    case 'mc': return nz(a) === nz(it.ok);
    case 'multi': return Array.isArray(a) && eqSet(a, it.ok) && a.every(x => [...it.ok, ...it.no].some(y => nz(y) === nz(x)));
    case 'order': return Array.isArray(a) && a.length === it.steps.length && a.every((x, i) => nz(x) === nz(it.steps[i]));
    case 'match': return Array.isArray(a) && a.length === it.pairs.length && it.pairs.every((p, i) => nz(a[i]) === nz(p[1]));
    case 'num': { const n = parseNum(a); return n !== null && Math.abs(n - it.ok) <= (it.tol !== undefined ? it.tol : 1e-9 * Math.max(1, Math.abs(it.ok)) + 0.005 * (Number.isInteger(it.ok) ? 0 : 1)); }
    case 'build': {
      if (!a || typeof a !== 'object' || a.v !== it.ok.v) return false;
      return BUILD_KEYS.every(k => { const w = it.ok[k], g = a[k]; if (Array.isArray(w) || Array.isArray(g)) return eqSet([].concat(w || []), [].concat(g || []).filter(Boolean)); return nk(w || '') === nk(g || ''); });
    }
  }
  return false;
}
// answers: lista (uma resposta por pergunta). Devolve { ok, items: [{ ok, why? }], right, n }; `why` só aparece nas erradas (e só fora das provas)
function grade(l, answers, test) {
  const as = Array.isArray(answers) ? answers : [];
  const items = l.quiz.map((it, i) => {
    const g = gradeItem(it, as[i]), ok = g === true; if (test) return { ok };
    if (ok) return { ok, model: it.t === 'write' ? it.model : undefined };
    return { ok, why: it.why, hint: it.hint, miss: (g && g.miss) || undefined, short: g && g.short || undefined, copy: g && g.copy || undefined };
  });
  const right = items.filter(x => x.ok).length;
  return { ok: right === l.quiz.length, quiz: { items: test ? undefined : items, right, n: l.quiz.length } };
}
// resposta certa de cada pergunta no formato que o navegador manda (usado nos testes)
function solution(l) {
  return l.quiz.map(it => it.t === 'mc' ? it.ok : it.t === 'multi' ? [...it.ok] : it.t === 'order' ? [...it.steps] : it.t === 'match' ? it.pairs.map(p => p[1]) : it.t === 'num' ? String(it.ok).replace('.', ',') : it.t === 'write' ? it.model : { ...it.ok });
}
module.exports = { pub, grade, solution, gradeItem, shuffled, parseNum };
