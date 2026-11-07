#!/usr/bin/env node
// Confere as ATIVIDADES ESPECIAIS das lições (desafio novo e conserte o erro): npm run check:sp
//   node tools/check-sp.js [prefixo do id, ex.: sql-2-0]   (sem o prefixo confere tudo)
// Para cada lição que tem content/sp-*.js:
//  • as duas atividades existem e estão completas (tarefa, solução, palavras obrigatórias, dica e o "por quê");
//  • a SOLUÇÃO roda no banco de treino e devolve linhas, e contém as palavras obrigatórias;
//  • o ponto de partida NÃO passa (o desafio começa em branco; o "conserte o erro" começa com o código quebrado de verdade: dá erro ou devolve o resultado errado);
//  • o desafio é mesmo NOVO (a solução não é a da lição nem devolve o mesmo resultado) e o "conserte o erro" tem UM erro (o código com erro é parecido com a solução);
//  • toda lição de SQL do Intermediário tem as duas (nenhuma sobrando, nenhuma faltando).
const path = require('path');
const lessons = require(path.join(__dirname, '..', 'lessons'));
const ws = s => String(s).replace(/\s+/g, ' ').trim(), lc = s => ws(s).toLowerCase();
const lev = (a, b) => { const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]); for (let j = 1; j <= b.length; j++) d[0][j] = j; for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[a.length][b.length]; };

async function check(only = '') {
  const bad = [], warn = [], stat = { d: 0, f: 0, fErr: 0, fWrong: 0 };
  const say = (id, m) => bad.push(`${id}: ${m}`), wrn = (id, m) => warn.push(`${id}: ${m}`);
  let initSqlJs; try { initSqlJs = require('../vendor/sql/sql-wasm.js'); } catch { initSqlJs = require('sql.js'); }
  const SQL = await initSqlJs();
  const run = (seed, code) => { const db = new SQL.Database(); try { db.run(seed); const r = db.exec(code); const last = r[r.length - 1]; return { rows: (last ? last.values : []).map(v => JSON.stringify(v)), cols: last ? last.columns : [] }; } catch (e) { return { err: e.message }; } finally { db.close(); } };
  const same = (a, b, ordered) => JSON.stringify(ordered ? a : [...a].sort()) === JSON.stringify(ordered ? b : [...b].sort());
  const sqlLessons = lessons.filter(l => l.type === 'sql' && l.lv === 2 && (!only || l.id.startsWith(only)));
  const SPALL = {}; for (const f of ['sql1', 'sql2', 'sql3']) { try { Object.assign(SPALL, require('../content/sp-' + f)); } catch (e) { if (e.code !== 'MODULE_NOT_FOUND') throw e; } }
  const ids = new Set(lessons.map(l => l.id)); for (const id of Object.keys(SPALL)) if (!ids.has(id)) bad.push(`${id}: atividade especial sem lição correspondente`);

  for (const l of sqlLessons) {
    if (!l.sp) { say(l.id, 'falta o desafio novo e o conserte o erro (content/sp-sql2.js)'); continue; }
    const ownRows = run(l.seed, l.solution);
    for (const a of ['d', 'f']) {
      const g = l.sp[a], tag = `${l.id}:${a}`; stat[a]++;
      if (g.task.length < 30) say(tag, 'a tarefa está curta demais');
      if (g.why.length < 50) say(tag, 'o "por quê" está curto demais');
      if (!Array.isArray(g.need) || !g.need.length) say(tag, 'faltam as palavras obrigatórias (need)');
      if (g.hints[0].trim() === g.solution.trim()) say(tag, 'a dica não pode ser igual à solução');
      if (/[áàâãéêíóôõúç]/i.test(g.solution) || (a === 'f' && /[áàâãéêíóôõúç]/i.test(g.starter))) say(tag, 'o código (solução/erro) não pode ter acento');
      const sol = run(g.seed, g.solution);
      if (sol.err) { say(tag, 'a solução deu erro: ' + sol.err); continue; }
      if (!sol.rows.length) say(tag, 'a solução não devolve nenhuma linha (o aluno não teria como conferir)');
      if (lessons.needMissing(g, g.solution)) say(tag, `a solução não tem a palavra obrigatória "${lessons.needMissing(g, g.solution)}"`);
      const ordered = /order by/i.test(g.solution);
      // o ponto de partida não pode passar
      const st = run(g.seed, g.starter);
      if (a === 'd') {
        if (!st.err && st.rows.length && same(st.rows, sol.rows, ordered)) say(tag, 'o ponto de partida já passa');
        if (lc(g.solution) === lc(l.solution)) say(tag, 'o desafio é igual à solução da lição');
        if (g.seed === l.seed && !ownRows.err && same(ownRows.rows, sol.rows, ordered) && JSON.stringify(ownRows.cols) === JSON.stringify(sol.cols)) say(tag, 'o desafio devolve o mesmo resultado da lição (não é novo)');
        if (lc(g.task) === lc(l.task)) say(tag, 'a tarefa é igual à da lição');
      } else {
        if (!st.err && same(st.rows, sol.rows, ordered)) say(tag, 'o código com erro já passa (não tem erro!)');
        if (st.err) stat.fErr++; else stat.fWrong++;
        const dist = lev(ws(g.starter), ws(g.solution)), rel = dist / Math.max(ws(g.solution).length, 1);
        if (dist < 1) say(tag, 'o código com erro é igual à solução');
        if (rel > 0.35) wrn(tag, `o código com erro está bem diferente da solução (${Math.round(rel * 100)}%): deveria ser UM erro só`);
        if (lessons.needMissing({ need: g.need }, g.starter)) wrn(tag, `o código com erro já não tem "${lessons.needMissing({ need: g.need }, g.starter)}": o aluno vê "Falta usar…" em vez de achar o erro rodando`);
        if (!/\b(erro|errad|quebrad|bug|conserte|corrija|ajuste)\b/i.test(g.task)) wrn(tag, 'a tarefa deveria dizer que o código tem um erro para consertar');
      }
    }
  }
  return { ...stat, erros: bad, avisos: warn };
}
module.exports = check;
if (require.main === module) {
  check(process.argv[2] || '').then(r => {
    console.log(`atividades conferidas: desafios novos ${r.d}, conserte o erro ${r.f} (${r.fErr} dão erro ao rodar, ${r.fWrong} rodam e devolvem o resultado errado)`);
    r.avisos.forEach(w => console.log('  ⚠ ' + w));
    if (r.erros.length) { console.error(`\n✗ ${r.erros.length} problema(s):`); r.erros.forEach(b => console.error('  ' + b)); process.exit(1); }
    console.log('✓ tudo certo');
  }).catch(e => { console.error(e); process.exit(1); });
}
