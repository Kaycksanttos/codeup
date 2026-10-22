// ============================================================================
// CURSO DO CODEUP: 2 trilhas (Python e SQL) x 3 níveis x 30 lições + prova de cada nível.
// O conteúdo fica em ./content (py1..py3, sql1..sql3). O gabarito dos Python (expectedOut) é
// gerado por `npm run build:content`, que roda cada solução no python3 e grava content/expected.json.
// Para editar uma lição: mude o arquivo em ./content, rode `npm run build:content` e `npm test`.
// ============================================================================
const fs = require('fs'), path = require('path');
let expected = {};
try { expected = JSON.parse(fs.readFileSync(path.join(__dirname, 'content', 'expected.json'), 'utf8')); } catch { }
let expectedSql = {};   // linhas esperadas de cada atividade SQL (reserva para quando o servidor não roda o sql.js)
try { expectedSql = JSON.parse(fs.readFileSync(path.join(__dirname, 'content', 'expected-sql.json'), 'utf8')); } catch { }

const FILES = { python: ['py1', 'py2', 'py3'], sql: ['sql1', 'sql2', 'sql3'] };
const TRACKS = ['python', 'sql'];
const LEVEL_NAMES = ['Básico', 'Intermediário', 'Avançado'];
const PASS_PCT = 70;               // nota mínima na prova
const EXAM_SIZE = 10;              // questões sorteadas do banco por tentativa

const lessons = [], exams = [];
const fill = x => { if (x.type === 'python') x.expectedOut = expected[x.id] ?? ''; else if (expectedSql[x.id]) x.expectedRows = expectedSql[x.id]; return x; };
for (const tr of TRACKS) FILES[tr].forEach(f => {
  const m = require('./content/' + f);
  m.lessons.forEach(x => lessons.push(fill(x)));
  m.exam.forEach(x => exams.push(fill(x)));
});

// checkpoints: desafio extra a cada 5 lições (opcional, não trava o caminho). Ficam fora de `lessons` para não mudar a contagem das 30 lições do nível.
const checkpoints = require('./content/checkpoints').map(fill);

module.exports = lessons;
Object.assign(module.exports, { exams, checkpoints, TRACKS, LEVEL_NAMES, PASS_PCT, EXAM_SIZE });
