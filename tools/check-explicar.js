#!/usr/bin/env node
// Confere as atividades de EXPLICAR o código (3ª atividade das lições do Intermediário e do Avançado de Python e SQL): npm run check:explicar
//  • toda lição de Python/SQL dos níveis 2 e 3 tem a sua, e nenhuma está sobrando (nem no Básico, nem no Excel);
//  • o formato está certo (código, tipo faz/traz, 2 ou 3 grupos com pista, modelo e alternativa);
//  • o código RODA (Python no python3, SQL no sql.js com o banco de treino da lição) e, nas de "traz", os fatos que a explicação modelo afirma aparecem no que o código realmente mostra;
//  • o corretor aceita a explicação modelo e a alternativa (outro jeito de dizer a mesma coisa), e RECUSA: respostas vagas, o próprio código copiado e as explicações das outras lições da mesma linguagem.
//   node tools/check-explicar.js [prefixo do id, ex.: py-2]   (sem o prefixo confere tudo)
const { spawnSync } = require('child_process'), path = require('path');
const lessons = require(path.join(__dirname, '..', 'lessons')), EXPLAIN = require(path.join(__dirname, '..', 'explain'));
const only = process.argv[2] || '';
const bad = [], say = (l, m) => bad.push(`${l.id || l}: ${m}`);
const show = v => v === null || v === undefined ? 'NULL' : String(v);
const low = s => String(s).toLowerCase();
const VAGAS = [
  'O código faz uma coisa e mostra o resultado na tela.', 'Ele pega os dados, faz o cálculo e depois mostra o resultado final para a pessoa.', 'Esse programa executa as instruções e imprime o que foi pedido.',
  'Mostra uma lista com os valores.', 'Ele funciona e traz as informações certas do banco de dados.', 'Não sei explicar direito mas acho que ele mostra alguma coisa na tela.'
];
function pyRun(code) { const r = spawnSync('python3', ['-I', '-c', code], { encoding: 'utf8', timeout: 8000 }); return { out: (r.stdout || '').trim(), err: r.stderr || '', status: r.status }; }

async function main() {
  let initSqlJs; try { initSqlJs = require('../vendor/sql/sql-wasm.js'); } catch { initSqlJs = require('sql.js'); }
  const SQL = await initSqlJs(), stat = { items: 0, python: 0, sql: 0 };
  const want = lessons.filter(l => l.type !== 'excel' && l.lv >= 2), ids = new Set(lessons.map(l => l.id));
  for (const id of Object.keys(lessons.EX)) { const l = lessons.find(x => x.id === id); if (!l) bad.push(`${id}: atividade de explicar sem lição correspondente`); else if (l.type === 'excel' || l.lv < 2) bad.push(`${id}: o Básico e o Excel não têm a atividade de explicar`); }
  const acts = want.filter(l => !only || l.id.startsWith(only));
  const models = [];
  for (const l of acts) {
    const e = l.expl; stat.items++;
    if (!e) { say(l, 'falta a atividade de explicar'); continue; }
    l.type === 'python' ? stat.python++ : stat.sql++;
    if (!e.code || !String(e.code).trim()) say(l, 'falta o código');
    if (!['faz', 'traz'].includes(e.kind)) say(l, `tipo "${e.kind}" inválido (use 'faz' ou 'traz')`);
    if (!Array.isArray(e.groups) || e.groups.length < 2 || e.groups.length > 3) say(l, 'precisa de 2 ou 3 grupos de ideias');
    else for (const [i, g] of e.groups.entries()) {
      if (!g.label || g.label.length < 8) say(l, `grupo ${i + 1}: falta a pista (rótulo)`);
      if (g.stems.length < 3) say(l, `grupo ${i + 1} (${g.label}): poucas raízes de palavras (${g.stems.length}); outros jeitos de dizer a mesma coisa seriam recusados`);
    }
    if (!e.model || e.model.length < 60) say(l, 'a explicação modelo está curta ou vazia');
    if (!e.alt || e.alt.length < 25) say(l, 'falta a alternativa (outro jeito de dizer o mesmo)');
    if (e.kind === 'traz' && !(e.facts && e.facts.length)) say(l, "tipo 'traz' precisa de fatos que a conferência prove rodando o código");
    if (e.code && String(e.code).trim() === String(l.solution || '').trim()) say(l, 'o código é igual à solução da lição (o aluno poderia ver a resposta na prática)');
    if (l.read && e.code && l.read.code && String(e.code).trim() === String(l.read.code).trim()) say(l, 'o código é igual ao da atividade de ler');
    // ---- roda o código e prova os fatos
    let out = '';
    try {
      if (l.type === 'python') {
        const x = pyRun(e.code); if (x.status !== 0) say(l, 'o código deu erro: ' + x.err.trim().split('\n').pop()); out = x.out;
      } else {
        const seed = e.seed || l.seed, db = new SQL.Database();
        try {
          db.run(seed); let res; try { res = db.exec(e.code); } catch (er) { say(l, 'a consulta deu erro: ' + er.message); continue; }
          const t = res[res.length - 1] || { columns: [], values: [] }; out = [t.columns.join(' | '), ...t.values.map(r => r.map(show).join(' | '))].join('\n');
        } finally { db.close(); }
      }
    } catch (er) { say(l, 'falha ao rodar: ' + er.message); }
    for (const f of (e.facts || [])) if (!low(out).includes(low(f))) say(l, `fato "${f}" não aparece no que o código mostra:\n${out.split('\n').slice(0, 8).join('\n')}`);
    // ---- o corretor
    for (const [nome, txt] of [['modelo', e.model], ['alternativa', e.alt]]) {
      const g = EXPLAIN.grade(e, txt || ''); if (!g.ok) say(l, `o corretor recusa a ${nome}: cobriu ${g.got}/${g.total}${g.short ? ' (curta)' : ''}${g.copy ? ' (parece código)' : ''}; falta: ${g.miss.join(' / ')}`);
    }
    if (EXPLAIN.grade(e, e.code).ok) say(l, 'o corretor aceita o próprio código copiado');
    VAGAS.forEach((v, i) => { if (EXPLAIN.grade(e, v).ok) say(l, `o corretor aceita uma resposta vaga: "${v}"`); });
    models.push(l);
  }
  // explicações de OUTRAS lições da MESMA linguagem não podem passar aqui (o aluno só vê uma linguagem por vez)
  for (const a of models) for (const b of models) {
    if (a === b || a.type !== b.type) continue;
    if (EXPLAIN.grade(a.expl, b.expl.model).ok) say(a, `o corretor aceita a explicação modelo de ${b.id}`);
  }
  return stat;
}
module.exports = { main, bad };
if (require.main === module) main().then(st => {
  if (bad.length) { console.error(bad.map(x => '✗ ' + x).join('\n')); console.error(`\n${bad.length} problema(s) em ${st.items} atividades.`); process.exit(1); }
  console.log(`Explicar o código: ${st.items} atividades conferidas (${st.python} de Python, ${st.sql} de SQL), tudo certo.`);
}).catch(e => { console.error(e); process.exit(1); });
