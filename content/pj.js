// Ajudantes para escrever os PROJETOS (um depois de cada 5 lições: 5, 10, 15, 20, 25 e 30 de cada nível).
// Um projeto é uma tarefa maior que junta as 5 últimas lições. Não é prova: tem dica (3 níveis) e solução, não gasta chance e não faz voltar lição.
//
// código (Python e SQL):  code(track, lv, seedPadrão)  ->  pj(título, tarefa, solução, [palavras obrigatórias], [o que é, para que serve, como se faz, retorno esperado], [3 dicas], {seed|prelude|peek})
// Excel, Power BI e Dados usam os próprios ajudantes (pj-xl.js, pj-pbi.js, pj-da.js) mas devolvem o mesmo formato (veja `base`).
const LEVELS = ['Básico', 'Intermediário', 'Avançado'];
const XP = { python: [40, 55, 70], sql: [45, 60, 75], excel: [40, 55, 70], powerbi: [40, 55, 70], dados: [40, 55, 70] };   // XP de cada projeto, por nível
const PRE = { python: 'py', sql: 'sql', excel: 'xl', powerbi: 'pbi', dados: 'da' };
const KEYS = ['oque', 'serve', 'como', 'retorno'];

// campos que todo projeto tem; o contador k (1 a 6) define depois de qual lição ele vem (5 x k)
const base = (track, lv, k, title, task, info, hints) => ({
  id: `pj-${PRE[track]}-${lv}-${k * 5}`, proj: true, k, after: k * 5, n: k * 5, xp: XP[track][lv - 1],
  title: 'Projeto: ' + title, task, type: track, track, level: LEVELS[lv - 1], lv,
  info: Object.fromEntries(KEYS.map((x, i) => [x, info[i]])), hints
});

const code = (track, lv, defSeed) => {
  let k = 0;
  return (title, task, solution, need, info, hints, o = {}) => {
    k++;
    const r = base(track, lv, k, title, task, info, hints);
    if (track === 'sql') { r.seed = o.seed || defSeed; r.expectedSql = solution; }
    else { if (o.prelude) r.prelude = o.prelude; if (o.peek) r.peek = o.peek; }
    r.starter = track === 'sql' ? '-- escreva sua consulta aqui\n' : '# escreva seu código aqui\n';
    r.need = need; r.solution = solution;
    return r;
  };
};

module.exports = { code, base, XP, LEVELS, PRE, KEYS };
