#!/usr/bin/env node
// Confere as atividades de LER o código (2ª atividade de cada lição): npm run check:ler
//  • toda lição tem a sua, e nenhuma está sobrando;
//  • o formato está certo (3 erradas diferentes da certa, explicação, pergunta, código ou planilha);
//  • a resposta certa é PROVADA rodando o código: Python no python3, SQL no sql.js (com o banco de treino da lição) e Excel no motor de fórmulas.
// Também grava content/seed-tables.json (os dados de cada banco de treino, mostrados ao aluno enquanto ele lê o SQL).
//   node tools/check-ler.js [prefixo do id, ex.: py-1]   (sem o prefixo confere tudo)
const { spawnSync } = require('child_process'), fs = require('fs'), path = require('path');
const lessons = require(path.join(__dirname, '..', 'lessons'));
const XL = require(path.join(__dirname, '..', 'public', 'xl.js'));
const only = process.argv[2] || '';
const bad = [], norm = s => String(s ?? '').replace(/\r/g, '').split('\n').map(x => x.trim().replace(/\s+/g, ' ')).join('\n').trim();
const say = (l, m) => bad.push(`${l.id}: ${m}`);
const show = v => v === null || v === undefined ? 'NULL' : String(v);

function pyRun(code) { const r = spawnSync('python3', ['-I', '-c', code], { encoding: 'utf8', timeout: 8000 }); return { out: (r.stdout || '').trim(), err: r.stderr || '', status: r.status }; }

async function main() {
  let initSqlJs; try { initSqlJs = require('../vendor/sql/sql-wasm.js'); } catch { initSqlJs = require('sql.js'); }
  const SQL = await initSqlJs(), tables = {}, stat = { items: 0, proved: 0, concept: 0 };
  const acts = lessons.filter(l => !only || l.id.startsWith(only));
  // sobras: itens que não pertencem a nenhuma lição
  const ids = new Set(lessons.map(l => l.id)); for (const id of Object.keys(lessons.RD)) if (!ids.has(id)) bad.push(`${id}: atividade de ler sem lição correspondente`);

  for (const l of acts) {
    const r = l.read; stat.items++;
    if (!r) { say(l, 'falta a atividade de ler'); continue; }
    if (!['mc', 'type'].includes(r.k)) say(l, `formato "${r.k}" inválido`);
    if (!r.q || r.q.length < 8) say(l, 'falta a pergunta');
    if (!r.why || r.why.length < 40) say(l, 'a explicação (why) está curta ou vazia');
    if (l.type === 'excel') { if (!r.sheet || !r.sheet.rows || !r.ask) say(l, 'Excel: faltam a planilha (sheet.rows) e a célula perguntada (ask)'); }
    else if (!r.code || !String(r.code).trim()) say(l, 'falta o código');
    if (r.k === 'mc') {
      if (typeof r.ok !== 'string' || !r.ok.trim()) say(l, 'mc: a resposta certa (ok) precisa ser um texto');
      if (!Array.isArray(r.no) || r.no.length !== 3) say(l, 'mc: precisa de exatamente 3 respostas erradas');
      else { const all = [r.ok, ...r.no].map(norm); if (new Set(all).size !== 4) say(l, 'mc: as 4 respostas precisam ser diferentes'); if (all.some(x => !x)) say(l, 'mc: resposta vazia'); }
    } else if (r.k === 'type') {
      const ok = Array.isArray(r.ok) ? r.ok : [r.ok]; if (!ok.length || ok.some(x => typeof x !== 'string' || !x.trim())) say(l, 'type: ok precisa ser um texto (ou uma lista de textos aceitos)');
    }
    const want = Array.isArray(r.ok) ? r.ok[0] : r.ok;
    // ---- prova: roda o código
    if (!r.v) { stat.concept++; continue; }
    stat.proved++;
    try {
      if (l.type === 'python') {
        const x = pyRun(r.code);
        if (r.v === 'out') { if (x.status !== 0) say(l, 'o código deu erro: ' + x.err.trim().split('\n').pop()); else if (norm(x.out) !== norm(want)) say(l, `a saída real é ${JSON.stringify(x.out)} e a resposta certa diz ${JSON.stringify(want)}`); }
        else if (r.v.startsWith('err:')) { const n = r.v.slice(4); if (x.status === 0) say(l, `o código deveria dar ${n}, mas rodou sem erro`); else if (!new RegExp('^' + n + ':?', 'm').test(x.err)) say(l, `o erro real é outro: ${x.err.trim().split('\n').pop()}`); }
        else say(l, `validador "${r.v}" não existe para Python`);
      } else if (l.type === 'sql') {
        const seed = r.seed || l.seed, db = new SQL.Database();
        try {
          db.run(seed);
          if (!tables[lessons.seedKey(seed)]) tables[lessons.seedKey(seed)] = (db.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY rowid")[0]?.values || []).map(([name]) => { const t = db.exec(`SELECT * FROM ${name}`)[0]; return { name, cols: t ? t.columns : [], rows: t ? t.values.map(v => v.map(show)) : [] }; });
          if (r.v === 'err') { let e = null; try { db.exec(r.code); } catch (er) { e = er; } if (!e) say(l, 'a consulta deveria dar erro, mas rodou'); }
          else {
            let res; try { res = db.exec(r.code); } catch (er) { say(l, 'a consulta deu erro: ' + er.message); continue; }
            const t = res[res.length - 1] || { columns: [], values: [] };
            const v = r.v; let got;
            if (v === 'nrows') got = String(t.values.length); else if (v === 'first') got = show((t.values[0] || [])[0]);
            else if (v === 'cols') got = t.columns.join(', '); else if (v === 'row0') got = (t.values[0] || []).map(show).join(' | ');
            else if (v === 'col0') got = t.values.map(x => show(x[0])).join(', ');
            else if (/^cell:\d+:\d+$/.test(v)) { const [, a, b] = v.split(':'); got = show(((t.values[+a - 1]) || [])[+b - 1]); }
            else { say(l, `validador "${v}" não existe para SQL`); continue; }
            if (norm(got) !== norm(want)) say(l, `o resultado real é ${JSON.stringify(got)} e a resposta certa diz ${JSON.stringify(want)}`);
          }
        } finally { db.close(); }
      } else if (l.type === 'excel') {
        const raw = {}; (r.sheet.rows || []).forEach((row, i) => row.forEach((val, j) => { if (val !== null && val !== undefined && val !== '') raw[XL.addr(j + 1, i + 1)] = val; }));
        const sh = new XL.Sheet(raw), p = XL.parseAddr(r.ask), fm = (r.sheet.cfmt || {})[r.ask] || (r.sheet.fmt || {})[XL.colL(p.c)] || null, got = XL.show(sh.value(r.ask), fm);
        if (r.v !== 'cell') say(l, `validador "${r.v}" não existe para Excel`); else if (norm(got) !== norm(want)) say(l, `${r.ask} mostra ${JSON.stringify(got)} e a resposta certa diz ${JSON.stringify(want)}`);
      }
    } catch (e) { say(l, 'falha ao conferir: ' + e.message); }
  }
  if (!only && Object.keys(tables).length) fs.writeFileSync(path.join(__dirname, '..', 'content', 'seed-tables.json'), JSON.stringify(tables));
  return stat;
}
module.exports = { main, bad };
if (require.main === module) main().then(st => {
  if (bad.length) { console.error(bad.map(x => '✗ ' + x).join('\n')); console.error(`\n${bad.length} problema(s) em ${st.items} atividades.`); process.exit(1); }
  console.log(`Ler o código: ${st.items} atividades conferidas (${st.proved} provadas rodando o código, ${st.concept} de conceito), tudo certo.`);
}).catch(e => { console.error(e); process.exit(1); });
