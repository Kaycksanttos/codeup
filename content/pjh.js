// Ajudante dos PROJETOS e PROVAS de HTML e CSS (o formato é o de pj.js, mais edit/page/css/checks como nas lições; veja content/hh.js).
const { base } = require('./pj'), { STARTER } = require('./hh');
// pj(título, tarefa, solução, [verificações], [o que é, para que serve, como se faz, retorno esperado], [3 dicas], {edit, page, css})
exports.project = lv => {
  let k = 0;
  return (title, task, solution, checks, info, hints, o = {}) => {
    k++;
    const r = base('html', lv, k, title, task, info, hints), edit = o.edit || 'html';
    r.edit = edit; r.starter = o.starter !== undefined ? o.starter : STARTER[edit];
    if (edit === 'css') { r.page = o.page; r.exLang = 'css'; } else if (o.css) r.css = o.css;
    r.checks = checks; r.solution = solution;
    return r;
  };
};
