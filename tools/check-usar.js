// Confere o "Quando usar" e o "Como usar" (molde) de toda lição de SQL, Python, Excel e DAX com exemplo: node tools/check-usar.js (ou npm run check:usar)
const lessons = require('../lessons'), USAR = require('../content/usar');
function check() {
  const erros = []; let n = 0;
  for (const l of lessons) {
    if (!['sql', 'python', 'excel', 'dax'].includes(l.type) || !l.example) continue; n++;
    const u = USAR[l.id], p = t => erros.push(`${l.id}: ${t}`);
    if (!u) { p('faltam o "quando usar" e o molde'); continue; }
    const [q, m, c] = u;
    if (!q || q.length < 30 || q.length > 230) p(`"quando usar" com ${q ? q.length : 0} letras (esperado de 30 a 230)`);
    else if (!/^Use quando /.test(q)) p('"quando usar" precisa começar com "Use quando "');
    if (!m || m.length < 5 || m.length > 280) p(`molde com ${m ? m.length : 0} letras`);
    if (c !== undefined && (c.length < 10 || c.length > 150)) p(`cuidado com ${c.length} letras (esperado de 10 a 150)`);
    if (/`/.test([q, m, c || ''].join(''))) p('não use crase (`)');
    if ((l.type === 'sql' || l.type === 'python') && /[áàâãéêíóôõúç]/i.test(m)) p('o molde de SQL e Python não leva acento');
  }
  for (const id of Object.keys(USAR)) if (!lessons.some(l => l.id === id)) erros.push(`${id}: não existe lição com esse id`);
  return { n, erros };
}
module.exports = check;
if (require.main === module) { const { n, erros } = check(); if (erros.length) { console.error(erros.join('\n')); process.exit(1); } console.log(`Quando usar e Como usar: ${n} de ${n} lições conferidas`); }
