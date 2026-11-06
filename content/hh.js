// Ajudantes para escrever as lições de HTML e CSS (corrigidas pelo servidor com o htmlcheck.js, que lê o HTML e calcula o CSS como o navegador).
// L(título, explicação, exemplo, tarefa, solução, [verificações], dica, {edit, starter, page, css, exPage})
//   edit 'html' (padrão): o aluno escreve o HTML (pode trazer <style>)  ·  'doc': escreve a página inteira (<!DOCTYPE html>...)  ·  'css': escreve só o CSS e a página pronta vem em `page`
//   css:    um CSS já pronto que vale junto com o HTML do aluno (lições de HTML que mostram uma página estilizada)
//   exPage: o HTML em que o EXEMPLO de uma lição de CSS é aplicado na teoria (se faltar, usa `page`)
// As verificações (checks) ficam descritas no começo do htmlcheck.js: { s: 'h1', text: 'Oi' }, { s: 'li', n: 3 }, { s: '.card', css: { padding: '10px' } }, { doctype: true }, { src: 'regex' } ...
const LEVELS = ['Básico', 'Intermediário', 'Avançado'];
const XP = [10, 15, 20];
const STARTER = { html: '<!-- escreva seu HTML aqui -->\n', doc: '<!-- escreva seu HTML aqui -->\n', css: '/* escreva seu CSS aqui */\n' };

module.exports = lv => {
  const level = LEVELS[lv - 1]; let n = 0;
  const L = (title, explain, example, task, solution, checks, hint, o = {}) => {
    n++;
    const edit = o.edit || 'html', r = { id: `html-${lv}-${String(n).padStart(2, '0')}`, n, xp: XP[lv - 1], title, explain, example, task, type: 'html', track: 'html', level, lv, edit };
    r.starter = o.starter !== undefined ? o.starter : STARTER[edit];
    if (edit === 'css') { r.page = o.page; r.exLang = 'css'; if (o.exPage) r.exPage = o.exPage; }
    else if (o.css) r.css = o.css;
    if (edit !== 'css' && o.exCss) r.exCss = o.exCss;
    return Object.assign(r, { checks, hints: [hint, solution], solution });
  };
  return { L };
};
module.exports.LEVELS = LEVELS; module.exports.XP = XP; module.exports.STARTER = STARTER;
