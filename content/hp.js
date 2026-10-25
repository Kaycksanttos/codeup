// Ajudantes para escrever as lições dos cursos POWER BI E DAX e ANÁLISE DE DADOS E STORYTELLING.
//
// Dois tipos de lição:
//   D(...)  lição de DAX: o aluno escreve uma ou mais medidas (ou uma coluna calculada, ou uma tabela) e o servidor compara os RESULTADOS
//           com os da resposta oficial em cada "visual" da lição (daxcheck.js). Veja public/daxdata.js para os modelos de dados.
//   Q(...)  lição de QUIZ: várias perguntas numa tela (escolher, marcar, ordenar, ligar, número, montar um visual, escrever). Veja quizcheck.js.
//
//   D(título, explicação, exemplo (DAX), tarefa, { model, extra?, views?, mode?, table?, answer: { Nome: 'fórmula' }, need?, forbid?, hint, starter?, noAlt?, ordered?, names? })
//   Q(título, explicação, exemplo, tarefa, [perguntas], { hint?, lang? ('dax' | 'm' | 'text'), mat? ({ table | chart | diagram }) })
const LEVELS = ['Básico', 'Intermediário', 'Avançado'];
const XP = [15, 20, 25];
const PFX = { powerbi: 'pbi', dados: 'da' };
const START = { measure: '-- escreva a sua medida aqui\n', column: '-- escreva a coluna calculada aqui\n', table: '-- escreva a tabela aqui\n' };

// o texto da resposta oficial, como o aluno a escreveria
function solText(o) {
  const mode = o.mode || 'measure', t = o.table;
  return Object.entries(o.answer).map(([name, expr]) => {
    const lines = String(expr).split('\n');
    const head = mode === 'column' ? `${t}[${name}] =` : `${name} =`;
    return lines.length === 1 ? `${head} ${expr}` : `${head}\n${lines.map(x => '  ' + x).join('\n')}`;
  }).join('\n\n');
}

module.exports = (track, lv) => {
  let n = 0;
  const id = () => { n++; return `${PFX[track]}-${lv}-${String(n).padStart(2, '0')}`; };
  const base = (title, explain, example, task) => ({ id: id(), n, xp: XP[lv - 1], title, explain, example, task, track, level: LEVELS[lv - 1], lv });
  const D = (title, explain, example, task, o) => {
    const mode = o.mode || 'measure', sol = solText(o);
    return {
      ...base(title, explain, example, task), type: 'dax', model: o.model, extra: o.extra, views: o.views, mode: o.mode, table: o.table, answer: o.answer, need: o.need || [], forbid: o.forbid,
      noAlt: o.noAlt, ordered: o.ordered, names: o.names, starter: o.starter ?? START[mode], hints: [o.hint, sol], solution: sol, peek: o.peek, exLang: 'dax'
    };
  };
  const Q = (title, explain, example, task, quiz, o = {}) => ({
    ...base(title, explain, example, task), type: 'quiz', quiz, need: [], hints: [o.hint || 'Leia cada pergunta com calma. Se errar, a explicação aparece e você pode tentar de novo.'], solution: '', exLang: o.lang || 'text', mat: o.mat
  });
  return { D, Q, solText };
};
// perguntas dos quizzes (veja quizcheck.js). Qualquer pergunta aceita material: { code, lang, table, chart, text, diagram } e `calc` (função que confere a resposta no `npm run check:pbi`)
const mc = (q, ok, no, why, o = {}) => ({ t: 'mc', q, ok, no, why, ...o });
const multi = (q, ok, no, why, o = {}) => ({ t: 'multi', q, ok, no, why, ...o });
const order = (q, steps, why, o = {}) => ({ t: 'order', q, steps, why, ...o });
const match = (q, pairs, why, o = {}) => ({ t: 'match', q, pairs, why, ...o });
const num = (q, ok, why, o = {}) => ({ t: 'num', q, ok, why, ...o });
const build = (q, model, fields, measures, visuals, ok, why, o = {}) => ({ t: 'build', q, model, fields, measures, visuals, ok, why, ...o });
const write = (q, groups, model, why, o = {}) => ({ t: 'write', q, groups, model, why, ...o });
// uma tabela / um gráfico para usar como material
const tab = (cols, rows, o = {}) => ({ cols, rows, ...o });
const col = (cats, values, o = {}) => ({ type: 'column', cats, series: [{ name: o.name || '', values }], ...o });
const info = a => ({ oque: a[0], serve: a[1], como: a[2], retorno: a[3] });
// calcula uma expressão DAX no modelo (só para os `calc` que o `npm run check:pbi` usa para conferir o gabarito; nada disso vai para o navegador)
function dax(expr, filters, model = 'loja', extra) {
  const D = require('../public/dax.js'); require('../public/daxlib.js'); const DD = require('../public/daxdata.js');
  const v = D.evalExpr(DD.get(model, extra), expr, filters); return D.isTbl(v) ? v : D.K.scalar(v);
}
Object.assign(module.exports, { LEVELS, XP, PFX, solText, mc, multi, order, match, num, build, write, tab, col, info, dax });
