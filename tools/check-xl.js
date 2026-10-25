// Confere o conteúdo das atividades de Excel (roda em `npm run check:excel` e dentro de `npm test`).
// Para cada lição e prova: a resposta oficial calcula sem erro, passa na própria correção, falha se virar número digitado à mão
// (a "planilha alternativa" muda o resultado) e as células pedidas começam em branco.
const path = require('path');
const lessons = require(path.join(__dirname, '..', 'lessons'));
const XL = require(path.join(__dirname, '..', 'public', 'xl.js'));
const X = require(path.join(__dirname, '..', 'xlcheck'));

function check() {
  const bad = [], acts = [...lessons.filter(l => l.type === 'excel'), ...lessons.tests.filter(t => t.type === 'excel')];
  const say = (l, m) => bad.push(`${l.id}: ${m}`);
  for (const l of acts) {
    if (!l.targets.length || l.targets.length > X.MAXCELLS) say(l, 'quantidade de células pedidas inválida');
    const base = X.baseRaw(l);
    for (const a of l.targets) {
      if (base[a] !== undefined) say(l, `a célula ${a} já vem preenchida na planilha`);
      if (!String(l.answer[a]).startsWith('=')) say(l, `a resposta de ${a} não é uma fórmula`);
      else { const c = XL.check(l.answer[a]); if (!c.ok) say(l, `a fórmula de ${a} não é válida: ${c.msg}`); }
    }
    const v0 = X.solved(l, false), v1 = X.solved(l, true);
    for (const a of l.targets) {
      if (XL.isErr(v0[a])) say(l, `${a} dá erro ${v0[a].code} com os números da planilha`);
      if (XL.isErr(v1[a])) say(l, `${a} dá erro ${v1[a].code} com a planilha alternativa`);
    }
    if (!l.noAlt && !l.targets.some(a => !XL.same(v0[a], v1[a]))) say(l, 'a planilha alternativa não muda nenhum resultado (use altSet ou noAlt)');
    const miss = X.needMissing(l, l.answer); if (miss) say(l, `a resposta oficial não usa «${miss}»`);
    const g = X.grade(l, JSON.stringify(l.answer)); if (!g.ok) say(l, 'a resposta oficial não passa na correção: ' + JSON.stringify(g));
    if (!l.noAlt) {                                   // valores digitados à mão (sem fórmula) NÃO podem passar
      const lit = {}; for (const a of l.targets) lit[a] = typeof v0[a] === 'number' ? String(v0[a]).replace('.', ',') : String(v0[a]);
      const g2 = X.grade(l, JSON.stringify(lit)); if (g2.ok) say(l, 'valores digitados à mão passaram na correção');
    }
    const empty = X.grade(l, '{}'); if (empty.ok) say(l, 'resposta vazia passou');
    if (!l.info || !['oque', 'serve', 'como', 'retorno'].every(k => l.info[k] && l.info[k].length > 20)) say(l, 'faltam as 4 explicações');
    if (!l.task || !l.title) say(l, 'falta título ou tarefa');
    const w = Math.max(...l.sheet.rows.map(r => r.length)); if (w > 9) say(l, 'planilha com colunas demais para o celular (' + w + ')');
    if (l.sheet.rows.length > 16) say(l, 'planilha com linhas demais (' + l.sheet.rows.length + ')');
  }
  return { bad, n: acts.length };
}
module.exports = check;
if (require.main === module) { const r = check(); console.log(r.bad.length ? r.bad.join('\n') : `Excel: ${r.n} atividades conferidas, tudo certo.`); process.exit(r.bad.length ? 1 : 0); }
