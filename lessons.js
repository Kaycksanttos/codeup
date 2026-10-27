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

const FILES = { python: ['py1', 'py2', 'py3'], sql: ['sql1', 'sql2', 'sql3'], excel: ['xl1'], powerbi: ['pbi1'], dados: ['da1'] };
const TRACKS = ['python', 'sql', 'excel', 'powerbi', 'dados'];
const LEVELS_OF = { python: 3, sql: 3, excel: 1, powerbi: 1, dados: 1 };      // quantos níveis cada curso tem hoje (o Excel, o Power BI e a Análise de Dados começam só com o Básico; os outros níveis entram depois)
const LEVEL_NAMES = ['Básico', 'Intermediário', 'Avançado'];
const CHANCES = { cp: 2, fin: 3 };       // chances em cada tipo de prova
const BACK = { cp: 5, fin: 10 };         // quantas lições voltam quando as chances acabam

const lessons = [];
const fill = x => { if (x.type === 'python') x.expectedOut = expected[x.id] ?? ''; else if (expectedSql[x.id]) x.expectedRows = expectedSql[x.id]; return x; };
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

// 3ª ATIVIDADE (só Python e SQL, níveis Intermediário e Avançado): "explicar o código" com as próprias palavras. Os itens ficam em content/ex-*.js (um por lição, pelo id),
// são corrigidos por conceitos (veja explain.js) e conferidos por `npm run check:explicar`.
//   { code, kind: 'faz' | 'traz', q?, groups: ['!rótulo :: raiz|raiz', ...], need?, model, alt?, facts?, seed? (SQL) }
const EXPLAIN = require('./explain');
const EX = {};
for (const tr of TRACKS) FILES[tr].forEach(f => {
  try { Object.assign(EX, require('./content/ex-' + f)); } catch (e) { if (e.code !== 'MODULE_NOT_FOUND' || !/ex-/.test(e.message)) throw e; }
});
lessons.forEach(x => { const r = EX[x.id]; if (r && x.read && x.lv >= 2 && (x.type === 'python' || x.type === 'sql')) { x.expl = EXPLAIN.compile(r); if (x.type === 'sql') x.expl.seedKey = seedKey(r.seed || x.seed); } });

// provas de checkpoint e prova final: ficam fora de `lessons` para não mudar a contagem das 30 lições do nível
const tests = [...require('./content/checkpoints'), ...require('./content/cp-xl'), ...require('./content/cp-pbi'), ...require('./content/cp-da')].map(fill);
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

module.exports = lessons;
Object.assign(module.exports, { checkpoints, finals, tests, projects, TRACKS, LEVELS_OF, LEVEL_NAMES, CHANCES, BACK, KEYS, RD, EX, seedTables, seedKey });
