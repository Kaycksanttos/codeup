// SQL no estilo BigQuery (public/bq.js): o aluno escreve BigQuery, o app traduz para o SQLite do sql.js.
const test = require('node:test'), assert = require('node:assert/strict');
const BQ = require('../public/bq.js'), initSqlJs = require('sql.js');
const { LOJA, CLI } = require('../content/seeds');

let SQL;
const db = async seed => { SQL = SQL || BQ.install(await initSqlJs()); const d = new SQL.Database(); d.run(seed || LOJA); return d; };
const rows = (d, q) => { const r = d.exec(q); const l = r[r.length - 1]; return l ? l.values : []; };
const cols = (d, q) => { const r = d.exec(q); const l = r[r.length - 1]; return l ? l.columns : []; };
const err = (d, q) => { try { d.exec(q); return null; } catch (e) { return e.message; } };

test('BigQuery: nomes de tabela (projeto.dataset.tabela, com ou sem crase) e crase em colunas', async () => {
  const d = await db();
  const base = JSON.stringify(rows(d, 'SELECT nome FROM produtos ORDER BY id'));
  for (const q of ['SELECT nome FROM loja.produtos ORDER BY id', 'SELECT nome FROM `loja.produtos` ORDER BY id', 'SELECT nome FROM `meu-projeto.loja.produtos` ORDER BY id', 'SELECT `nome` FROM `meu-projeto`.loja.produtos ORDER BY id'])
    assert.equal(JSON.stringify(rows(d, q)), base, q);
  assert.equal(rows(d, 'SELECT p.nome FROM loja.produtos AS p JOIN loja.vendas v ON v.produto_id = p.id WHERE v.id = 1')[0][0], 'Notebook');
});

test('BigQuery: texto com aspas duplas, barra invertida e comentário com #', async () => {
  const d = await db();
  assert.deepEqual(rows(d, `SELECT "dq", 'it\\'s', 'a\\nb' # comentário\n`)[0], ['dq', "it's", 'a\nb']);
  assert.deepEqual(rows(d, "SELECT r'\\d+' AS x")[0], ['\\d+']);
  assert.equal(rows(d, "SELECT nome, FROM produtos WHERE id = 1")[0][0], 'Notebook');      // vírgula sobrando antes do FROM
});

test('BigQuery: a divisão devolve casas decimais; DIV e MOD; SAFE_DIVIDE; ROUND', async () => {
  const d = await db();
  assert.deepEqual(rows(d, 'SELECT 7 / 2, DIV(7, 2), MOD(7, 3), SAFE_DIVIDE(1, 0), SAFE_DIVIDE(9, 4), ROUND(2.567, 1), CEIL(2.1), FLOOR(2.9), POW(2, 10), SQRT(81)')[0], [3.5, 3, 1, null, 2.25, 2.6, 3, 2, 1024, 9]);
  assert.match(err(d, 'SELECT MOD(5, 0)'), /division by zero/);
});

test('BigQuery: CAST, SAFE_CAST e os tipos INT64, FLOAT64, STRING, BOOL, DATE', async () => {
  const d = await db();
  assert.deepEqual(rows(d, "SELECT CAST('12' AS INT64), CAST(2.5 AS INT64), CAST(7 AS STRING), CAST('3.5' AS FLOAT64), CAST('true' AS BOOL), CAST('2026-01-05' AS DATE), SAFE_CAST('x' AS INT64), SAFE_CAST('12' AS INT64), SAFE_CAST('2026-13-45' AS DATE)")[0], ['12'.length && 12, 3, '7', 3.5, 1, '2026-01-05', null, 12, null]);
  assert.match(err(d, "SELECT CAST('abc' AS INT64)"), /Bad int64/);
  assert.match(err(d, 'SELECT CAST(1 AS WIDGET)'), /Tipo desconhecido/);
});

test('BigQuery: COUNTIF, IF, STRING_AGG, IFNULL, ANY_VALUE', async () => {
  const d = await db();
  assert.deepEqual(rows(d, "SELECT COUNTIF(preco > 100), COUNTIF(preco > 99999), IF(1 < 2, 'a', 'b'), IFNULL(NULL, 5) FROM produtos")[0], [rows(d, 'SELECT COUNT(*) FROM produtos WHERE preco > 100')[0][0], 0, 'a', 5]);
  assert.equal(rows(d, "SELECT STRING_AGG(nome, ', ' ORDER BY nome) FROM produtos WHERE categoria = 'Moveis'")[0][0], 'Cadeira, Estante, Mesa');
  assert.equal(rows(d, 'SELECT COUNTIF(estoque > 20) AS c FROM produtos GROUP BY categoria ORDER BY categoria').length, 3);
});

test('BigQuery: datas (FORMAT_DATE, EXTRACT, DATE_DIFF, DATE_ADD, DATE_SUB, DATE_TRUNC, LAST_DAY, PARSE_DATE)', async () => {
  const d = await db();
  assert.deepEqual(rows(d, `SELECT FORMAT_DATE('%Y-%m', DATE '2026-09-15'), FORMAT_DATE('%d/%m/%Y', '2026-09-05'), FORMAT_DATE('%B %A', DATE '2026-09-15'),
    EXTRACT(YEAR FROM DATE '2026-09-15'), EXTRACT(MONTH FROM '2026-09-15'), EXTRACT(DAYOFWEEK FROM DATE '2026-09-15'), EXTRACT(QUARTER FROM DATE '2026-09-15'),
    DATE_DIFF(DATE '2026-10-18', DATE '2026-10-01', DAY), DATE_DIFF(DATE '2026-10-01', DATE '2026-01-31', MONTH), DATE_DIFF(DATE '2027-01-01', DATE '2026-12-31', YEAR),
    DATE_ADD(DATE '2026-01-31', INTERVAL 1 MONTH), DATE_SUB(DATE '2026-03-01', INTERVAL 1 DAY), DATE_ADD(DATE '2026-09-15', INTERVAL 2 WEEK),
    DATE_TRUNC(DATE '2026-09-15', MONTH), DATE_TRUNC(DATE '2026-09-15', YEAR), LAST_DAY(DATE '2026-02-10'), PARSE_DATE('%d/%m/%Y', '05/09/2026'), DATE(2026, 9, 5)`)[0],
  ['2026-09', '05/09/2026', 'September Tuesday', 2026, 9, 3, 3, 17, 9, 1, '2026-02-28', '2026-02-28', '2026-09-29', '2026-09-01', '2026-01-01', '2026-02-28', '2026-09-05', '2026-09-05']);
  assert.match(err(d, "SELECT DATE_DIFF('not a date', DATE '2026-01-01', DAY)"), /Invalid date/);
  assert.equal(rows(d, 'SELECT CURRENT_DATE() = DATE(CURRENT_DATE())')[0][0], 1);
  assert.deepEqual(rows(d, "SELECT FORMAT_DATE('%Y-%m', data) AS mes, COUNT(*) FROM vendas GROUP BY mes ORDER BY mes").map(r => r[0]), ['2026-09', '2026-10']);
});

test('BigQuery: funções de texto', async () => {
  const d = await db();
  assert.deepEqual(rows(d, "SELECT CONCAT('a', 'b', 'c'), UPPER('ação'), LOWER('ÁB'), LENGTH('ação'), STARTS_WITH('Ana', 'A'), ENDS_WITH('Ana', 'x'), STRPOS('banana', 'nan'), LPAD('7', 3, '0'), RPAD('ab', 5, '*'), INITCAP('ola mundo'), REVERSE('abc'), REPEAT('ab', 2), LEFT('abcdef', 2), RIGHT('abcdef', 2), SUBSTR('abcdef', 2, 3), REGEXP_CONTAINS('abc123', r'\\d+'), REGEXP_EXTRACT('id=42;', r'id=(\\d+)'), REGEXP_REPLACE('a1b22', r'\\d+', '#'), FORMAT('%s tem %d itens (%.2f)', 'Ana', 3, 2.5), CONTAINS_SUBSTR('Banana', 'NAN')")[0],
  ['abc', 'AÇÃO', 'áb', 4, 1, 0, 3, '007', 'ab***', 'Ola Mundo', 'cba', 'abab', 'ab', 'ef', 'bcd', 1, '42', 'a#b#', 'Ana tem 3 itens (2.50)', 1]);
  assert.equal(rows(d, "SELECT 'a' || 'b'")[0][0], 'ab');
  assert.equal(rows(d, "SELECT CONCAT('a', NULL)")[0][0], null);
  assert.match(err(d, "SELECT CONCAT('a', 1)"), /CAST\(coluna AS STRING\)/);
});

test('BigQuery: LIKE diferencia maiúsculas de minúsculas', async () => {
  const d = await db();
  assert.deepEqual(rows(d, "SELECT 'Ana' LIKE 'a%', 'Ana' LIKE 'A%', 'Ana' LIKE '_na'")[0], [0, 1, 1]);
});

test('BigQuery: UNION, EXCEPT e INTERSECT exigem DISTINCT (ou ALL no UNION)', async () => {
  const d = await db();
  assert.equal(rows(d, 'SELECT 1 UNION ALL SELECT 1').length, 2);
  assert.equal(rows(d, 'SELECT 1 UNION DISTINCT SELECT 1').length, 1);
  assert.equal(rows(d, 'SELECT id FROM produtos EXCEPT DISTINCT SELECT produto_id FROM vendas').length > 0, true);
  assert.equal(rows(d, 'SELECT 1 INTERSECT DISTINCT SELECT 1').length, 1);
  assert.match(err(d, 'SELECT 1 UNION SELECT 2'), /UNION precisa de ALL ou DISTINCT/);
  assert.match(err(d, 'SELECT 1 EXCEPT SELECT 2'), /EXCEPT precisa de DISTINCT/);
  assert.match(err(d, 'SELECT 1 INTERSECT SELECT 2'), /INTERSECT precisa de DISTINCT/);
});

test('BigQuery: colunas sem apelido se chamam f0_, f1_...', async () => {
  const d = await db();
  assert.deepEqual(cols(d, 'SELECT COUNT(*), nome, preco * 2, SUM(preco) AS total FROM produtos GROUP BY nome, preco'), ['f0_', 'nome', 'f2_', 'total']);
  assert.deepEqual(cols(d, 'SELECT p.nome, p.id FROM produtos p'), ['nome', 'id']);
});

test('BigQuery: SELECT * EXCEPT(...) e SELECT * REPLACE(...)', async () => {
  const d = await db();
  assert.deepEqual(cols(d, 'SELECT * EXCEPT (id, estoque) FROM produtos'), ['nome', 'preco', 'categoria']);
  assert.deepEqual(cols(d, 'SELECT p.* EXCEPT (id) FROM loja.produtos p'), ['nome', 'preco', 'categoria', 'estoque']);
  assert.equal(rows(d, 'SELECT * REPLACE (UPPER(nome) AS nome) FROM produtos WHERE id = 1')[0][1], 'NOTEBOOK');
});

test('BigQuery: QUALIFY filtra pelo resultado da função de janela (e não aparece coluna extra)', async () => {
  const d = await db();
  const r = d.exec('SELECT categoria, nome FROM produtos QUALIFY ROW_NUMBER() OVER (PARTITION BY categoria ORDER BY preco DESC) = 1 ORDER BY categoria');
  assert.deepEqual(r[0].columns, ['categoria', 'nome']);
  assert.deepEqual(r[0].values, [['Eletronicos', 'Notebook'], ['Moveis', 'Cadeira'], ['Papelaria', 'Caderno']]);
  assert.equal(rows(d, "SELECT nome FROM produtos WHERE categoria = 'Moveis' QUALIFY RANK() OVER (ORDER BY preco DESC) <= 2").length, 2);
  assert.equal(rows(d, 'WITH t AS (SELECT categoria, preco FROM produtos QUALIFY ROW_NUMBER() OVER (PARTITION BY categoria ORDER BY preco) = 1) SELECT COUNT(*) FROM t')[0][0], 3);
});

test('BigQuery: UPDATE e DELETE precisam de WHERE; CREATE OR REPLACE TABLE, TRUNCATE TABLE e tipos no CREATE TABLE', async () => {
  const d = await db();
  assert.match(err(d, 'UPDATE produtos SET preco = 1'), /UPDATE precisa de WHERE/);
  assert.match(err(d, 'DELETE FROM produtos'), /DELETE precisa de WHERE/);
  assert.equal(err(d, 'UPDATE produtos SET preco = 1 WHERE id = 1'), null);
  assert.equal(err(d, 'DELETE FROM loja.produtos WHERE true'), null);
  assert.equal(rows(d, 'SELECT COUNT(*) FROM produtos')[0][0], 0);
  const d2 = await db();
  d2.exec('CREATE TABLE loja.t (id INT64, nome STRING, nota FLOAT64, ativo BOOL, dia DATE)');
  d2.exec("INSERT INTO loja.t VALUES (1, '007', 9.5, TRUE, '2026-01-01')");
  assert.deepEqual(rows(d2, 'SELECT id, nome, nota, ativo, dia FROM t')[0], [1, '007', 9.5, 1, '2026-01-01']);
  d2.exec("CREATE OR REPLACE TABLE t AS SELECT 2 AS id");
  d2.exec("CREATE OR REPLACE TABLE t AS SELECT 3 AS id");
  assert.deepEqual(rows(d2, 'SELECT id FROM t'), [[3]]);
  d2.exec('TRUNCATE TABLE loja.t');
  assert.equal(rows(d2, 'SELECT COUNT(*) FROM t')[0][0], 0);
  d2.exec('CREATE TABLE IF NOT EXISTS t (id INT64)');
  assert.equal(err(d2, 'DROP TABLE IF EXISTS loja.t'), null);
});

test('BigQuery: o que só existe no SQLite é recusado, com o caminho certo', async () => {
  const d = await db();
  assert.match(err(d, "SELECT strftime('%Y', data) FROM vendas"), /Function not found: strftime.*FORMAT_DATE/);
  assert.match(err(d, 'SELECT julianday(data) FROM vendas'), /DATE_DIFF/);
  assert.match(err(d, 'SELECT GROUP_CONCAT(nome) FROM produtos'), /STRING_AGG/);
  assert.match(err(d, 'SELECT IIF(1, 2, 3)'), /use IF/);
  assert.match(err(d, 'CREATE INDEX i ON produtos(nome)'), /não tem CREATE INDEX/);
  assert.match(err(d, 'PRAGMA table_info(produtos)'), /PRAGMA é do SQLite/);
  assert.match(err(d, 'SELECT ARRAY_AGG(nome) FROM produtos'), /ARRAY_AGG ainda não funciona/);
  assert.ok(d.execRaw('PRAGMA table_info(produtos)')[0].values.length > 0, 'execRaw continua cru, para o uso interno do app');
});

test('BigQuery: erros do SQLite continuam chegando (para o diagnóstico do app) e os dados de treino (db.run) continuam crus', async () => {
  const d = await db(CLI);
  assert.match(err(d, 'SELECT * FROM nao_existe'), /no such table/);
  assert.match(err(d, 'SELECT coluna_que_nao_existe FROM clientes'), /no such column/);
  assert.match(err(d, 'SELEC * FROM clientes'), /syntax error/);
  assert.ok(rows(d, 'SELECT COUNT(*) FROM clientes')[0][0] > 0);
});
