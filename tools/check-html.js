#!/usr/bin/env node
// Confere o CONTEÚDO do curso HTML e CSS (lições, projetos e provas): `npm run check:html`   (com `--browser` também compara com o Chromium de verdade: precisa do Playwright)
//  • cada atividade tem o formato certo (modo, ponto de partida, verificações, descrições, dicas, solução);
//  • a SOLUÇÃO passa em todas as verificações, e continua passando se o código for escrito de outro jeito (tags em maiúsculas, aspas simples, tudo em uma linha);
//  • o PONTO DE PARTIDA, uma resposta vazia, só comentários e um texto qualquer NÃO passam;
//  • cada verificação sozinha é possível de cumprir e nenhuma passa "de graça" no ponto de partida junto com o resto (avisa);
//  • o código de exemplo e a página da lição não têm acento (os dados dos cursos não têm), e nada de script ou iframe.
//   node tools/check-html.js [prefixo do id, ex.: html-1-0 ou pj-html]   [--browser]
const path = require('path'), os = require('os'), fs = require('fs'), { spawnSync } = require('child_process');
const lessons = require(path.join(__dirname, '..', 'lessons')), H = require(path.join(__dirname, '..', 'htmlcheck'));
const nz = s => String(s ?? '').replace(/\s+/g, ' ').trim();
const ASCII = s => !/[^\x00-\x7f]/.test(s);
const grade = (x, code) => { try { return H.grade(x, code); } catch (e) { return { ok: false, err: e.message, hc: { items: [] } }; } };

// ---- outras formas de escrever a mesma resposta (precisam continuar passando)
const upper = c => c.replace(/<(\/?)([a-z][a-z0-9]*)/g, (m, s, t) => '<' + s + t.toUpperCase());
const single = c => c.replace(/="([^"'\n]*)"/g, "='$1'");
const oneLine = c => c.replace(/>\s*\n\s*</g, '><').replace(/\n\s*/g, m => m);
const cssMin = c => c.replace(/\s*\n\s*/g, ' ').replace(/\s*([{};:])\s*/g, '$1');
const cssUp = c => c.replace(/([{;]\s*)([a-z-]+)(\s*:)/g, (m, a, p, b) => a + p.toUpperCase() + b);
const variants = x => x.edit === 'css' ? [['CSS em uma linha, sem espaços', cssMin(x.solution)], ['propriedades em maiúsculas', cssUp(x.solution)], ['com linhas em branco e comentário', '/* oi */\n\n' + x.solution.replace(/\n/g, '\n\n')]]
  : [['tags em maiúsculas', upper(x.solution)], ['aspas simples', single(x.solution)], ['sem as quebras entre as tags', oneLine(x.solution)], ['com linhas em branco', x.solution.replace(/\n/g, '\n\n')]];

function run(only = '', BROWSER = false) {
  const bad = [], warn = [], all = [...lessons, ...lessons.tests, ...lessons.projects].filter(x => x.track === 'html' && (!only || x.id.startsWith(only)));
  const B = (x, m) => bad.push(`${x.id}: ${m}`), W = (x, m) => warn.push(`${x.id}: ${m}`);
for (const x of all) {
  const isT = x.cp || x.fin, kind = x.proj ? 'projeto' : isT ? 'prova' : 'lição';
  if (!['html', 'doc', 'css'].includes(x.edit)) { B(x, `modo de edição "${x.edit}" inválido`); continue; }
  if (!Array.isArray(x.checks) || !x.checks.length) { B(x, 'faltam as verificações (checks)'); continue; }
  if (!x.solution || !nz(x.solution)) { B(x, 'falta a solução'); continue; }
  if (typeof x.starter !== 'string') B(x, 'falta o ponto de partida (starter)');
  if (!Array.isArray(x.req) || x.req.length !== x.checks.length || x.req.some(r => !r || r.length < 8)) B(x, 'req (descrição de cada verificação) está faltando ou curto');
  if (x.edit === 'css' && !nz(x.page)) B(x, 'lição de CSS sem a página (page)');
  if (x.edit !== 'css' && x.page) B(x, 'só lição de CSS tem page');
  if (!x.task || nz(x.task).length < 20) B(x, 'tarefa curta ou vazia');
  if (!x.info || ['oque', 'serve', 'como', 'retorno'].some(k => !nz((x.info || {})[k]))) B(x, 'faltam as 4 explicações (info)');
  if (!isT) {
    if (!Array.isArray(x.hints) || x.hints.length < 2 || x.hints.some(h => !nz(h))) B(x, 'precisa de dicas (hints)');
    else if (!x.proj && x.hints[x.hints.length - 1] !== x.solution) B(x, 'a última dica precisa ser a solução');
    else if (x.proj && x.hints.length !== 3) B(x, 'projeto precisa de 3 dicas');
    else if (x.proj && x.hints[2] !== x.solution) B(x, 'a 3ª dica do projeto precisa ser a solução');
  }
  if (!x.proj && !isT) { if (!nz(x.explain) || !nz(x.example)) B(x, 'faltam a explicação (explain) e o exemplo (example)'); if (!x.read) B(x, 'falta a atividade de ler'); }
  // ---- a solução passa
  const g = grade(x, x.solution);
  if (g.err) { B(x, 'a correção quebrou: ' + g.err); continue; }
  if (!g.ok) { B(x, 'a SOLUÇÃO não passa: ' + g.hc.items.filter(i => !i.ok).map(i => `${i.d} (${i.why})`).join(' | ')); continue; }
  // ---- outras formas de escrever
  for (const [nome, code] of variants(x)) { const v = grade(x, code); if (!v.ok) B(x, `a solução ${nome} NÃO passa: ` + v.hc.items.filter(i => !i.ok).map(i => `${i.d} (${i.why})`).join(' | ')); }
  // ---- o que não pode passar
  for (const [nome, code] of [['o ponto de partida', x.starter], ['uma resposta vazia', ''], ['só comentários', x.edit === 'css' ? '/* nada */' : '<!-- nada -->'], ['um texto qualquer', 'oi, tudo bem?']]) if (grade(x, code).ok) B(x, `passa mesmo sendo ${nome}`);
  const gs = grade(x, x.starter);
  if (gs.hc.items.length && gs.hc.items.every(i => i.ok)) B(x, 'o ponto de partida já cumpre todas as verificações');
  const free = gs.hc.items.map((i, k) => i.ok ? k : -1).filter(k => k >= 0);
  if (free.length > Math.ceil(x.checks.length / 2)) W(x, `${free.length} de ${x.checks.length} verificações já passam só com o ponto de partida`);
  // ---- cada verificação deve poder falhar: tira o elemento mais importante da solução? (reconhecimento simples: a solução sem as tags de abertura e fechamento não pode passar)
  if (x.edit !== 'css') { const stripped = x.solution.replace(/<[^>]*>/g, ''); if (grade(x, stripped).ok) B(x, 'a solução sem nenhuma tag passa'); }
  // ---- texto: sem acento no código; sem script/iframe
  const code = [['exemplo', x.example], ['solução', x.solution], ['ponto de partida', x.starter], ['página', x.page], ['exPage', x.exPage], ['css', x.css], ['exCss', x.exCss]];
  for (const [nome, c] of code) {
    if (c == null) continue;
    if (!ASCII(String(c))) B(x, `${nome} tem acento ou símbolo (o código dos cursos não tem acento): ` + (String(c).match(/[^\x00-\x7f]/) || [''])[0]);
    if (/<\s*(script|iframe|object|embed|base|link)\b|javascript:|@import|on[a-z]+\s*=/i.test(String(c))) B(x, `${nome} tem script, iframe, link, @import ou on...=`);
  }
  for (const c of x.checks) for (const k of ['text', 'has']) if (c[k] !== undefined && !ASCII(String(c[k]))) B(x, `verificação com acento em ${k}: ${c[k]}`);
  if (x.read) { if (x.read.code && !ASCII(String(x.read.code))) B(x, 'o código da atividade de ler tem acento'); }
}

// ---- comparação com o Chromium: a página de cada solução tem de ter o mesmo estilo calculado
if (BROWSER && !bad.length) {
  const page = x => x.edit === 'css' ? `<!DOCTYPE html><html><head><style>${x.solution}</style></head><body>${x.page}</body></html>` : x.edit === 'doc' ? x.solution : (x.css ? `<style>${x.css}</style>` : '') + x.solution;
  const file = path.join(os.tmpdir(), 'hc-solutions-' + process.pid + '.js');
  fs.writeFileSync(file, 'module.exports = ' + JSON.stringify(all.map(x => page(x))) + ';');
  const r = spawnSync('node', [path.join(__dirname, 'hc-diff.js'), file], { stdio: 'inherit' }); fs.unlinkSync(file);
  if (r.status) bad.push('as soluções têm estilo diferente do Chromium (veja acima)');
}
  return { n: all.length, bad, warn, lessons: all.filter(x => !x.proj && !x.cp && !x.fin).length, projects: all.filter(x => x.proj).length, tests: all.filter(x => x.cp || x.fin).length };
}
module.exports = run;
if (require.main === module) {
  const args = process.argv.slice(2), BROWSER = args.includes('--browser'), r = run(args.find(a => !a.startsWith('--')) || '', BROWSER);
  if (r.warn.length) console.warn(r.warn.map(x => '⚠ ' + x).join('\n'));
  if (r.bad.length) { console.error(r.bad.map(x => '✗ ' + x).join('\n')); console.error(`\n${r.bad.length} problema(s) em ${r.n} atividades de HTML e CSS.`); process.exit(1); }
  console.log(`HTML e CSS: ${r.n} atividades conferidas (${r.lessons} lições, ${r.projects} projetos, ${r.tests} provas), tudo certo${BROWSER ? ' e igual ao Chromium' : ''}.`);
}
