// ============================================================================
// CURSOS DO CODEUP: Python e SQL (3 níveis x 30 lições cada), Excel e Power BI e DAX (os níveis que já existem, 30 lições cada).
// O conteúdo fica em ./content (py1..py3, sql1..sql3, xl1, pbi1...). O gabarito dos Python (expectedOut) é
// gerado por `npm run build:content`, que roda cada solução no python3 e grava content/expected.json.
// Para editar uma lição: mude o arquivo em ./content, rode `npm run build:content` e `npm test`.
// O EXEMPLO de cada lição de SQL precisa ser uma consulta completa: o build roda o exemplo e grava a tabela do resultado em content/example-sql.json (a teoria mostra abaixo do código).
// Exemplo sem linhas de resposta (INSERT, UPDATE, CREATE...) ganha uma consulta de "depois" em content/example-after.js.
//
// Além das lições, cada nível tem 3 PROVAS (content/checkpoints.js), cada uma é uma tarefa completa:
//   • checkpoint depois da lição 10: 2 chances; se errar as duas, volta 5 lições (6 a 10);
//   • checkpoint depois da lição 20: 2 chances; se errar as duas, volta 5 lições (16 a 20);
//   • prova final do nível (depois da 30): 3 chances; se errar as três, volta 10 lições (21 a 30).
// Cada lição também tem as 4 explicações (o que é, para que serve, como se faz, retorno esperado) em content/info-*.js.
// ============================================================================
const fs = require('fs'), path = require('path');
let expected = {};
try { expected = JSON.parse(fs.readFileSync(path.join(__dirname, 'content', 'expected.json'), 'utf8')); } catch { }
let expectedSql = {};   // linhas esperadas de cada atividade SQL (reserva para quando o servidor não roda o sql.js)
try { expectedSql = JSON.parse(fs.readFileSync(path.join(__dirname, 'content', 'expected-sql.json'), 'utf8')); } catch { }

const FILES = { python: ['py1', 'py2', 'py3'], sql: ['sql1', 'sql2', 'sql3'], js: ['js1'], html: ['html1'], excel: ['xl1'], powerbi: ['pbi1'], dados: ['da1'] };
const TRACKS = ['python', 'sql', 'js', 'html', 'excel', 'powerbi', 'dados'];
const LEVELS_OF = { python: 3, sql: 3, js: 1, html: 1, excel: 1, powerbi: 1, dados: 1 };      // quantos níveis cada curso tem hoje (o Excel, o Power BI e a Análise de Dados começam só com o Básico; os outros níveis entram depois)
const LEVEL_NAMES = ['Básico', 'Intermediário', 'Avançado'];
const CHANCES = { cp: 2, fin: 3 };       // chances em cada tipo de prova
const BACK = { cp: 5, fin: 10 };         // quantas lições voltam quando as chances acabam

const lessons = [];
const fill = x => { if (x.type === 'python' || x.type === 'js') x.expectedOut = expected[x.id] ?? ''; else if (expectedSql[x.id]) x.expectedRows = expectedSql[x.id]; return x; };
const INFO = {};                         // as 4 explicações de cada lição, pelo id
for (const tr of TRACKS) FILES[tr].forEach(f => {
  Object.assign(INFO, require('./content/info-' + f));
  require('./content/' + f).lessons.forEach(x => lessons.push(fill(x)));
});
const KEYS = ['oque', 'serve', 'como', 'retorno'];
lessons.forEach(x => { const a = INFO[x.id]; if (a) x.info = Object.fromEntries(KEYS.map((k, i) => [k, a[i]])); });
// tabelinha com o que o EXEMPLO de cada lição de SQL devolve (gerada por `npm run build:content`, que roda o exemplo no banco da lição; só a teoria usa)
let EXOUT = {}; try { EXOUT = JSON.parse(fs.readFileSync(path.join(__dirname, 'content', 'example-sql.json'), 'utf8')); } catch { }
lessons.forEach(x => { if (EXOUT[x.id]) x.exampleOut = EXOUT[x.id]; });
// Python: a saída do exemplo (content/example-py.json, gerada por `npm run build:content`) aparece abaixo do código na teoria. SQL que não devolve linhas: a consulta que mostra o efeito (content/example-after.js)
let EXPY = {}; try { EXPY = JSON.parse(fs.readFileSync(path.join(__dirname, 'content', 'example-py.json'), 'utf8')); } catch { }
const EXAFTER = require('./content/example-after');
lessons.forEach(x => { if (EXPY[x.id] != null) x.exampleOut = { out: EXPY[x.id] }; if (EXAFTER[x.id]) x.exampleAfter = EXAFTER[x.id][0]; });
// "Experimente": uma mudança sugerida para o exemplo (content/tente-sql.js e tente-py.js). A teoria mostra o exemplo editável e o botão que aplica a sugestão.
const TENTE = { ...require('./content/tente-sql'), ...require('./content/tente-py') };
lessons.forEach(x => { if (TENTE[x.id]) x.tente = TENTE[x.id]; });
// "Como funciona" (1ª parte de cada lição): content/como-*.js diz o que cada pedaço do exemplo faz; aqui já calculamos onde cada pedaço está no código que a tela mostra
// (o SQL aparece organizado em linhas pelo fmtSql). A tela só precisa acender os trechos [a, b) na ordem.
const COMO = require('./content/como'), comoMatch = require('./content/comoMatch'), FMT = require('./public/fmt.js');
lessons.forEach(x => {
  if (!COMO[x.id] || !x.example) return;
  try { x.como = comoMatch(x.type === 'sql' ? FMT.fmtSql(x.example) : String(x.example), COMO[x.id]).map(({ a, b, d }) => ({ a, b, d })); } catch (e) { console.error(`como de ${x.id}: ${e.message}`); }
});
// "Quando usar" e "Como usar" (o molde para preencher) da mesma tela: content/usar-*.js
const USAR = require('./content/usar');
lessons.forEach(x => { const u = USAR[x.id]; if (u && x.example) x.usar = { q: u[0], m: u[1], c: u[2] || undefined }; });

// 2ª ATIVIDADE DE CADA LIÇÃO: "ler o código". A lição tem duas atividades: 1) executar (teoria + prática: o aluno escreve e roda) e
// 2) ler (o aluno vê um código pronto e diz o que ele faz). Os itens ficam em content/rd-*.js (um por lição, pelo id) e são conferidos
// por `npm run check:ler`, que executa cada código e prova que a resposta certa é mesmo o que o código faz.
//   { k: 'mc' | 'type', code, q, ok, no: [3 erradas] (só no mc), why, hint?, v? (como o validador confere), seed? (SQL), sheet/ask (Excel) }
const RD = {};
for (const tr of TRACKS) FILES[tr].forEach(f => {
  try { Object.assign(RD, require('./content/rd-' + f)); } catch (e) { if (e.code !== 'MODULE_NOT_FOUND' || !/rd-/.test(e.message)) throw e; }
});
let seedTables = {};                     // tabelas de cada banco de treino (para o aluno ver os dados enquanto lê o SQL): gerado por `npm run check:ler`
try { seedTables = JSON.parse(fs.readFileSync(path.join(__dirname, 'content', 'seed-tables.json'), 'utf8')); } catch { }
const seedKey = s => require('crypto').createHash('sha1').update(String(s || '')).digest('hex').slice(0, 10);
lessons.forEach(x => { const r = RD[x.id]; if (r) { x.read = r; if (x.type === 'sql') x.read.seedKey = seedKey(r.seed || x.seed); } });

// ATIVIDADES ESPECIAIS (hoje só no SQL Intermediário): duas atividades a mais em cada lição, para a pessoa provar que entendeu PARA QUE SERVE o que aprendeu:
//   d) "Desafio novo": um problema novo com a mesma ideia da lição, em outra situação (outras tabelas ou outro objetivo), escrito do zero;
//   f) "Conserte o erro": um código quase certo com UM erro escondido; a pessoa roda, descobre o que está errado e conserta.
// Os itens ficam em content/sp-*.js (um por lição, pelo id) e são conferidos por `npm run check:sp` (a solução passa, o código com erro falha, as palavras obrigatórias valem).
//   { d: { task, solution, need, hint, why, seed? }, f: { task, bug, solution, need, hint, why, seed? } }   (seed = outro banco de treino; sem ele vale o da lição)
// Cada item vira um objeto parecido com uma lição de SQL (corrigido pelo mesmo corretor); as linhas esperadas vêm de content/expected-sql.json, na chave "id:d" / "id:f".
const SP = {};
for (const tr of TRACKS) FILES[tr].forEach(f => {
  try { Object.assign(SP, require('./content/sp-' + f)); } catch (e) { if (e.code !== 'MODULE_NOT_FOUND' || !/sp-/.test(e.message)) throw e; }
});
const SP_STARTER = '-- escreva sua consulta aqui\n';
lessons.forEach(x => {
  const s = SP[x.id]; if (!s || x.type !== 'sql' || !x.read) return;
  x.sp = {};
  for (const a of ['d', 'f']) {
    const i = s[a]; if (!i || !i.task || !i.solution || !i.need || !i.why || !i.hint || (a === 'f' && !i.bug)) throw new Error(`atividade especial ${x.id}:${a} incompleta`);
    x.sp[a] = { id: x.id, a, type: 'sql', track: x.track, lv: x.lv, n: x.n, level: x.level, xp: x.xp, title: x.title, seed: i.seed || x.seed, task: i.task, starter: a === 'f' ? i.bug : SP_STARTER,
      hints: [i.hint, i.solution], solution: i.solution, expectedSql: i.solution, need: i.need, why: i.why, ...(expectedSql[x.id + ':' + a] ? { expectedRows: expectedSql[x.id + ':' + a] } : {}) };
  }
});

// EXPLICAR O CÓDIGO (só Python e SQL, níveis Intermediário e Avançado): o aluno escreve com as próprias palavras o que um código faz. Não é atividade de dentro da lição: é um CÍRCULO PRÓPRIO
// no mapa, de uma lição só, a cada 6 ou 7 lições (depois das lições 6, 13, 19 e 26 — veja EC_AFTER). Os itens ficam em content/ex-*.js (um por lição, pelo id; cada círculo usa o item da
// lição em que ele aparece), são corrigidos por conceitos (veja explain.js) e conferidos por `npm run check:explicar`.
//   { code, kind: 'faz' | 'traz', q?, groups: ['!rótulo :: raiz|raiz', ...], need?, model, alt?, facts?, seed? (SQL) }
const EXPLAIN = require('./explain');
const EX = {};
for (const tr of TRACKS) FILES[tr].forEach(f => {
  try { Object.assign(EX, require('./content/ex-' + f)); } catch (e) { if (e.code !== 'MODULE_NOT_FOUND' || !/ex-/.test(e.message)) throw e; }
});
lessons.forEach(x => { const r = EX[x.id]; if (r && x.read && x.lv >= 2 && (x.type === 'python' || x.type === 'sql')) { x.expl = EXPLAIN.compile(r); if (x.type === 'sql') x.expl.seedKey = seedKey(r.seed || x.seed); } });   // o item compilado de cada lição (a lição em si não tem atividade de explicar)
const EC_AFTER = [6, 13, 19, 26];        // o círculo de explicar vem depois das lições 6, 13, 19 e 26 (a cada 6 ou 7 lições); fica longe dos projetos (5, 10, 15...) e dos checkpoints (10 e 20)
const EC_XP = 25, EC_GEMS = 3;           // pontos e diamantes do círculo (uma vez só)
const explains = [];
for (const x of lessons) {
  if (!x.expl || !EC_AFTER.includes(x.n)) continue;
  const bl = lessons.filter(l => l.track === x.track && l.lv === x.lv && l.n > (EC_AFTER[EC_AFTER.indexOf(x.n) - 1] || 0) && l.n <= x.n);   // as lições que vieram desde o círculo anterior
  explains.push({ id: x.id.replace(/^([a-z]+-\d+-)0*(\d+)$/, 'ec-$1$2'), ec: true, src: x.id, k: EC_AFTER.indexOf(x.n) + 1, after: x.n, xp: EC_XP, title: 'Explicar o código', type: x.type, track: x.track, level: x.level, lv: x.lv, expl: x.expl, cobre: bl.map(l => l.title) });
}

// provas de checkpoint e prova final: ficam fora de `lessons` para não mudar a contagem das 30 lições do nível
const tests = [...require('./content/checkpoints'), ...require('./content/cp-js'), ...require('./content/cp-html'), ...require('./content/cp-xl'), ...require('./content/cp-pbi'), ...require('./content/cp-da')].map(fill);
for (const t of tests) {
  const kind = t.fin ? 'fin' : 'cp';
  t.chances = CHANCES[kind]; t.back = BACK[kind]; t.backFrom = t.after - t.back + 1;
  t.cobre = lessons.filter(l => l.track === t.track && l.lv === t.lv && l.n > t.after - 10 && l.n <= t.after).map(l => l.title);   // temas das últimas 10 lições
}
const checkpoints = tests.filter(t => t.cp), finals = tests.filter(t => t.fin);

// PROJETOS: depois das lições 5, 10, 15, 20, 25 e 30 de cada nível o aluno faz um projeto com o que aprendeu nas 5 últimas lições (content/projects.js).
// Não são provas: não gastam chance, não fazem voltar lição e têm dica e solução. Mas são obrigatórios: a lição seguinte (e a prova que vem depois do projeto das lições 10, 20 e 30) só libera com o projeto feito.
const projects = require('./content/projects').map(fill);
for (const p of projects) p.cobre = lessons.filter(l => l.track === p.track && l.lv === p.lv && l.n > p.after - 5 && l.n <= p.after).map(l => l.title);   // temas das 5 lições do projeto

// ENUNCIADOS: o texto do que fazer em cada projeto e prova fica em content/enunciados.txt (em passos, para ser fácil de ler) e vale no lugar do `task` curto dos arquivos de cada curso
const ENUN = require('./content/enunciados');
for (const x of [...lessons, ...tests, ...projects]) if (ENUN[x.id]) x.task = ENUN[x.id];

// HTML E CSS: a lista de verificações (checks) fica só no servidor; o aluno recebe `req`, a descrição de cada item (a tela mostra a lista e marca ✓/✗ conforme o corretor responde)
const htmlcheck = require('./htmlcheck');
for (const x of [...lessons, ...tests, ...projects]) if (x.checks) x.req = x.checks.map(htmlcheck.describe);

module.exports = lessons;
Object.assign(module.exports, { checkpoints, finals, tests, projects, explains, EC_AFTER, EC_XP, EC_GEMS, TRACKS, LEVELS_OF, LEVEL_NAMES, CHANCES, BACK, KEYS, RD, EX, seedTables, seedKey });

// ---- Palavras obrigatórias de uma lição (campo `need`, só Python, SQL e JavaScript). Quem corrige é o servidor.
// O aluno escreve do jeito dele: "(\n  SELECT AVG(preco)\n  FROM produtos\n)" tem que valer como "(select avg(preco) from produtos)".
// Por isso a conferência ignora maiúsculas e minúsculas e os espaços/quebras de linha ao redor de qualquer sinal: ( ) [ ] , . = + - * etc.
// Um espaço na ponta da palavra ("for ", " and ", "if ") quer dizer "palavra inteira": vale "for x", "if(x > 3)" e "a and b", mas não "format" nem "android".
const NEED_W = '[\\p{L}\\p{N}_]';
const needFlat = s => String(s == null ? '' : s).toLowerCase().replace(/\s+/g, ' ').replace(/\s*([^\p{L}\p{N}_\s])\s*/gu, '$1');
const needHas = (flat, term) => {
  const t = needFlat(term); if (!t.trim()) return true;
  if (flat.includes(t)) return true;                                       // jeito simples: o texto aparece como está
  const core = t.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp((/^\s/.test(t) ? `(?<!${NEED_W})` : '') + core + (/\s$/.test(t) ? `(?!${NEED_W})` : ''), 'u').test(flat);
};
const needMissing = (l, code) => { const flat = needFlat(code); return (l.need || []).find(t => !needHas(flat, t)); };
Object.assign(module.exports, { needFlat, needHas, needMissing });
