// Ajudantes para escrever atividades de forma curta.
// L(titulo, explicacao, exemplo, tarefa, solucao, [palavras obrigatorias], dica, {seed|prelude|peek|starter})
const LEVELS = ['Básico', 'Intermediário', 'Avançado'];
const XP = { python: [10, 15, 20], sql: [15, 20, 25], js: [10, 15, 20] };
const PRE = { python: 'py', sql: 'sql', js: 'js' };
const STARTER = { python: '# escreva seu código aqui\n', sql: '-- escreva sua consulta aqui\n', js: '// escreva seu código aqui\n' };

module.exports = (track, lv, defSeed, defPrelude) => {
  const type = track, t = PRE[track], level = LEVELS[lv - 1];
  let n = 0;
  const base = (o, solution) => {
    const r = { type, track, level, lv };
    if (type === 'sql') { r.seed = o.seed || defSeed; r.expectedSql = solution; }
    else { const pre = o.prelude !== undefined ? o.prelude : defPrelude; if (pre) r.prelude = pre; if (o.peek) r.peek = o.peek; }
    r.starter = o.starter !== undefined ? o.starter : STARTER[type];
    return r;
  };
  const L = (title, explain, example, task, solution, need, hint, o = {}) => {
    n++;
    return { id: `${t}-${lv}-${String(n).padStart(2, '0')}`, n, xp: XP[track][lv - 1], title, explain, example, task, ...base(o, solution), need, hints: [hint, solution], solution };
  };
  return { L };
};
