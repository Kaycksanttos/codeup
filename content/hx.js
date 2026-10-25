// Ajudantes para escrever as atividades de EXCEL de forma curta.
//
// Uma atividade de Excel é uma pequena planilha com algumas células em branco que o aluno preenche com fórmulas.
//   sheet.rows  → a planilha, a partir de A1 (null = célula vazia; texto começando com "=" = fórmula que já vem pronta e fica travada)
//   answer      → as células que o aluno preenche e a fórmula correta de cada uma (o servidor compara o RESULTADO, não o texto da fórmula)
//   need        → funções/símbolos que a resposta precisa usar (ex.: ['SOMA'] ou ['$'])
// A correção roda a fórmula do aluno com os números da planilha e de novo com números diferentes: assim uma fórmula "digitada à mão"
// (um valor fixo) não passa. Detalhes em xlcheck.js.
const XL = require('../public/xl.js');
const LEVELS = ['Básico', 'Intermediário', 'Avançado'];
const XP = [10, 15, 20];
const date = (d, m, y) => XL.serial(y, m, d);

// preenche uma coluna: col('D', 2, 6, '=B{r}*C{r}') -> { D2: '=B2*C2', ..., D6: '=B6*C6' }
const col = (c, from, to, tpl) => { const o = {}; for (let r = from; r <= to; r++) o[c + r] = tpl.replace(/\{r\}/g, r); return o; };
const merge = (...a) => Object.assign({}, ...a);

// texto mostrado no botão "Solução": as primeiras fórmulas e, se forem muitas, um aviso de que as outras seguem o mesmo padrão
function solText(answer) {
  const e = Object.entries(answer), same = e.length > 3 && e.every(([a], i) => i === 0 || a.replace(/\d+/, '') === e[0][0].replace(/\d+/, ''));
  if (e.length <= 3) return e.map(([a, f]) => `${a}:  ${f}`).join('\n');
  const first = same ? e.slice(0, 1) : e.slice(0, 3);
  return first.map(([a, f]) => `${a}:  ${f}`).join('\n') + (same ? '\n…e copie para baixo até ' + e[e.length - 1][0] : '\n…as outras seguem o mesmo padrão');
}

module.exports = lv => {
  let n = 0;
  const L = (title, explain, example, task, sheet, answer, need, hint, o = {}) => {
    n++;
    return {
      id: `xl-${lv}-${String(n).padStart(2, '0')}`, n, xp: XP[lv - 1], title, explain, example, task,
      type: 'excel', track: 'excel', level: LEVELS[lv - 1], lv, sheet, answer, targets: Object.keys(answer), need, hints: [hint, solText(answer)], solution: solText(answer), ...o
    };
  };
  return { L };
};
Object.assign(module.exports, { col, merge, date, solText, LEVELS, XP });
