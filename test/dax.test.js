// Testes do motor de DAX (public/dax.js + public/daxlib.js) com um modelo minúsculo, cujos resultados são conferidos à mão.
const test = require('node:test'), assert = require('node:assert/strict');
const DAX = require('../public/dax.js');
const { serial } = DAX;

// P: produtos (A,B em X; C em Y)   V: vendas   C: calendário 2023–2024
const cal = () => { const rows = []; for (let d = serial(2023, 1, 1); d <= serial(2024, 12, 31); d++) { const [y, m] = DAX.ymd(d); rows.push([d, y, m]); } return { cols: [{ n: 'Data', t: 'date' }, { n: 'Ano', t: 'int' }, { n: 'Mes', t: 'int' }], rows }; };
const spec = () => ({
  tables: {
    P: { cols: [{ n: 'id', t: 'int' }, { n: 'nome', t: 'text' }, { n: 'cat', t: 'text' }, { n: 'preco', t: 'dec' }], rows: [[1, 'A', 'X', 10], [2, 'B', 'X', 20], [3, 'C', 'Y', 30]] },
    C: cal(),
    V: {
      cols: [{ n: 'id', t: 'int' }, { n: 'data', t: 'date' }, { n: 'pid', t: 'int' }, { n: 'qtd', t: 'int' }, { n: 'entrega', t: 'date' }],
      rows: [[1, serial(2023, 1, 15), 1, 2, serial(2023, 1, 25)], [2, serial(2023, 2, 10), 2, 1, serial(2023, 2, 20)], [3, serial(2023, 3, 5), 3, 4, serial(2023, 3, 15)], [4, serial(2024, 1, 20), 1, 3, serial(2024, 1, 30)],
        [5, serial(2024, 2, 14), 2, 5, serial(2024, 2, 24)], [6, serial(2024, 3, 9), 3, 1, serial(2024, 3, 19)], [7, serial(2024, 3, 22), 1, 2, serial(2024, 4, 1)]]
    }
  },
  rels: [['V[pid]', 'P[id]'], ['V[data]', 'C[Data]'], ['V[entrega]', 'C[Data]', { active: false }]],
  calc: { 'V[valor]': 'V[qtd] * RELATED(P[preco])' },
  measures: { Total: 'SUM(V[valor])', Qtd: 'SUM(V[qtd])' }
});
const M = new DAX.Model(spec());
const ev = (e, f, m) => { const v = DAX.evalExpr(m || M, e, f); return DAX.isTbl(v) && v.rows.length === 1 && v.cols.length === 1 ? v.rows[0][0] : v; };
const near = (a, b, msg) => { if (a === b) return; if (typeof b === 'number' && typeof a === 'number') assert.ok(Math.abs(a - b) < 1e-9, `${msg || ''} ${a} != ${b}`); else assert.deepEqual(a, b, msg); };
const is = (e, want, f) => near(ev(e, f), want, e + (f ? ' ' + JSON.stringify(f) : ''));
const bad = (e, re) => assert.throws(() => ev(e), err => err instanceof DAX.DaxErr && re.test(err.message), e);
const col = (e, f) => DAX.evalExpr(M, e, f).rows.map(r => r[0]);

test('agregações e coluna calculada', () => {
  is('SUM(V[valor])', 340); is('SUM(V[qtd])', 18); is('COUNTROWS(V)', 7); is('AVERAGE(V[qtd])', 18 / 7); is('MIN(V[valor])', 20); is('MAX(V[valor])', 120);
  is('DISTINCTCOUNT(V[pid])', 3); is('COUNT(V[id])', 7); is('SUMX(V, V[qtd] * RELATED(P[preco]))', 340); is('[Total]', 340);
  is('MAX(5, 8)', 8); is('MIN(5, 8)', 5); is('MEDIAN(V[qtd])', 2);
});
test('filtro vindo do relacionamento e CALCULATE', () => {
  is('SUM(V[valor])', 190, { 'P[cat]': 'X' }); is('SUM(V[valor])', 150, { 'P[cat]': 'Y' }); is('SUM(V[valor])', 180, { 'C[Ano]': 2024 });
  is('CALCULATE(SUM(V[valor]), P[cat] = "X")', 190); is('CALCULATE(SUM(V[valor]), P[cat] = "X", C[Ano] = 2024)', 150);
  is('CALCULATE([Total], P[cat] = "X")', 190); is('CALCULATE([Total], P[cat] = "X")', 190, { 'P[cat]': 'Y' });          // CALCULATE substitui o filtro da coluna
  is('CALCULATE([Total], KEEPFILTERS(P[cat] = "X"))', null, { 'P[cat]': 'Y' });                              // KEEPFILTERS: soma os filtros (X e Y → nada)
  is('CALCULATE([Total], ALL(P))', 340, { 'P[cat]': 'X' }); is('CALCULATE([Total], REMOVEFILTERS(P[cat]))', 340, { 'P[cat]': 'X' });
  is('CALCULATE([Total], ALL(P[cat]))', 340, { 'P[cat]': 'X' }); is('CALCULATE([Total], ALLEXCEPT(P, P[cat]))', 190, { 'P[cat]': 'X', 'P[nome]': 'A' });
  is('CALCULATE([Total], P[cat] <> "X")', 150); is('CALCULATE([Total], P[cat] IN {"X", "Y"})', 340); is('CALCULATE([Total], V[qtd] > 2)', 120 + 30 + 100); is('CALCULATE([Total], FILTER(V, V[qtd] >= 3))', 120 + 30 + 100);
  is('CALCULATE([Total], FILTER(ALL(P), P[preco] > 15))', 270);
  is('CALCULATE([Total], C[Ano] = 2023 || C[Ano] = 2024)', 340); is('CALCULATE([Total], C[Ano] = 2024 && C[Mes] = 3)', 50);
  is('DIVIDE([Total], CALCULATE([Total], ALL(P)))', 190 / 340, { 'P[cat]': 'X' });
  is('CALCULATE([Total], ALL(P[cat]), P[nome] = "A")', 70);
});
test('iteradores, contexto de linha e transição de contexto', () => {
  is('SUMX(V, V[valor])', 340); is('AVERAGEX(VALUES(P[cat]), [Total])', 170); is('MAXX(VALUES(P[nome]), [Total])', 150); is('MINX(VALUES(P[nome]), [Total])', 70);
  is('COUNTX(V, V[qtd])', 7); is('SUMX(FILTER(V, V[qtd] > 2), V[valor])', 250); is('SUMX(P, [Total])', 340); is('SUMX(P, SUM(V[valor]))', 3 * 340);   // sem CALCULATE não há transição: cada linha soma tudo
  is('SUMX(P, CALCULATE(SUM(V[valor])))', 340);
  const M2 = new DAX.Model({ ...spec(), calc: { 'V[valor]': 'V[qtd] * RELATED(P[preco])', 'P[tot]': 'CALCULATE(SUM(V[valor]))', 'P[tot2]': 'SUM(V[valor])', 'P[cnt]': 'COUNTROWS(RELATEDTABLE(V))' } });
  assert.deepEqual(M2.T.get('p').rows.map(r => r[4]), [70, 120, 150]); assert.deepEqual(M2.T.get('p').rows.map(r => r[5]), [340, 340, 340]); assert.deepEqual(M2.T.get('p').rows.map(r => r[6]), [3, 2, 2]);
});
test('valores, vazio e operadores', () => {
  is('BLANK() + 5', 5); is('BLANK() * 5', null); is('5 - BLANK()', 5); is('1 / 0', Infinity); is('DIVIDE(1, 0)', null); is('DIVIDE(1, 0, -1)', -1); is('DIVIDE(10, 4)', 2.5);
  is('"a" & "b" & 1', 'ab1'); is('2 + 3 * 4', 14); is('(2 + 3) * 4', 20); is('2 ^ 3', 8); is('-2 ^ 2', -4); is('10 - 2 - 3', 5);
  is('"abc" = "ABC"', true); is('BLANK() = 0', true); is('BLANK() == 0', false); is('1 <> 2', true); is('1 < 2 && 2 < 3', true); is('1 > 2 || 3 > 2', true); is('NOT(1 > 2)', true); is('3 IN {1, 2, 3}', true); is('4 IN {1, 2, 3}', false); is('4 NOT IN {1, 2, 3}', true);
  is('IF(1 > 2, "x", "y")', 'y'); is('IF(1 > 2, "x")', null); is('SWITCH(2, 1, "um", 2, "dois", "outro")', 'dois'); is('SWITCH(9, 1, "um", 2, "dois", "outro")', 'outro'); is('SWITCH(TRUE(), 5 > 10, "a", 5 > 3, "b", "c")', 'b');
  is('COALESCE(BLANK(), 7)', 7); is('ISBLANK(BLANK())', true); is('ISBLANK(0)', false); is('IFERROR(1 / 0, 99)', 99); is('IFERROR(5, 99)', 5);
  is('ROUND(2.567, 2)', 2.57); is('ROUND(2.5, 0)', 3); is('ROUND(-2.5, 0)', -3); is('INT(-2.5)', -3); is('MOD(-7, 3)', 2); is('ABS(-4)', 4); is('SQRT(16)', 4); is('ROUNDUP(2.121, 2)', 2.13); is('ROUNDDOWN(2.129, 2)', 2.12); is('POWER(2, 10)', 1024);
});
test('texto', () => {
  is('UPPER("ab")', 'AB'); is('LEFT("Power BI", 5)', 'Power'); is('RIGHT("Power BI", 2)', 'BI'); is('MID("Power BI", 7, 2)', 'BI'); is('LEN("abc")', 3); is('TRIM("  a   b ")', 'a b');
  is('SUBSTITUTE("a-b-c", "-", "/")', 'a/b/c'); is('FIND("b", "abc")', 2); is('SEARCH("B", "abc")', 2); is('REPT("ab", 3)', 'ababab'); is('CONCATENATE("a", "b")', 'ab');
  is('FORMAT(1234.5, "#,##0.00")', '1.234,50'); is('FORMAT(0.256, "0.0%")', '25,6%'); is('FORMAT(5, "000")', '005'); is('FORMAT(DATE(2024, 3, 5), "dd/mm/yyyy")', '05/03/2024'); is('FORMAT(DATE(2024, 3, 5), "mmmm")', 'março'); is('FORMAT(DATE(2024, 3, 5), "yyyy-mm")', '2024-03');
  is('FORMAT(1234.5, "R$ #,##0.00")', 'R$ 1.234,50'); is('FORMAT(7, "0.0")', '7,0'); is('FORMAT(0.5, "#.##")', ',5'); is('CONTAINSSTRING("Power BI", "bi")', true); is('VALUE("12,5")', 12.5);
  is('CONCATENATEX(P, P[nome], ", ")', 'A, B, C'); is('CONCATENATEX(P, P[nome], ", ", P[nome], DESC)', 'C, B, A');
});
test('datas', () => {
  is('YEAR(DATE(2024, 3, 5))', 2024); is('MONTH(DATE(2024, 3, 5))', 3); is('DAY(DATE(2024, 3, 5))', 5); is('QUARTER(DATE(2024, 5, 5))', 2); is('DATE(2024, 14, 1)', serial(2025, 2, 1));
  is('EOMONTH(DATE(2024, 1, 15), 0)', serial(2024, 1, 31)); is('EOMONTH(DATE(2024, 1, 15), 1)', serial(2024, 2, 29)); is('EDATE(DATE(2024, 1, 31), 1)', serial(2024, 2, 29));
  is('DATEDIFF(DATE(2024, 1, 1), DATE(2024, 3, 1), MONTH)', 2); is('DATEDIFF(DATE(2024, 1, 1), DATE(2024, 1, 31), DAY)', 30); is('DATEDIFF(DATE(2023, 12, 31), DATE(2024, 1, 1), YEAR)', 1);
  is('WEEKDAY(DATE(2024, 3, 3))', 1); is('WEEKDAY(DATE(2024, 3, 3), 2)', 7); is('DATEVALUE("05/03/2024")', serial(2024, 3, 5));
  is('MAX(C[Data])', serial(2024, 12, 31)); is('MIN(V[data])', serial(2023, 1, 15)); is('MAX(V[data])', serial(2024, 3, 22));
});
test('inteligência de tempo', () => {
  const mar24 = { 'C[Ano]': 2024, 'C[Mes]': 3 };
  is('TOTALYTD([Total], C[Data])', 180, mar24); is('TOTALYTD([Total], C[Data])', 130, { 'C[Ano]': 2024, 'C[Mes]': 2 }); is('CALCULATE([Total], DATESYTD(C[Data]))', 180, mar24); is('TOTALQTD([Total], C[Data])', 180, mar24); is('TOTALMTD([Total], C[Data])', 50, mar24);
  is('CALCULATE([Total], SAMEPERIODLASTYEAR(C[Data]))', 120, mar24); is('CALCULATE([Total], DATEADD(C[Data], -1, YEAR))', 120, mar24); is('CALCULATE([Total], PARALLELPERIOD(C[Data], -1, YEAR))', 160, { 'C[Ano]': 2024 });
  is('CALCULATE([Total], PREVIOUSMONTH(C[Data]))', 100, mar24); is('CALCULATE([Total], DATEADD(C[Data], -1, MONTH))', 100, mar24); is('CALCULATE([Total], NEXTMONTH(C[Data]))', null, mar24);
  is('CALCULATE([Total], DATESBETWEEN(C[Data], DATE(2023, 2, 1), DATE(2023, 3, 31)))', 140); is('CALCULATE([Total], DATESINPERIOD(C[Data], DATE(2024, 3, 31), -2, MONTH))', 100 + 30 + 20);
  is('CALCULATE([Total], FILTER(ALL(C[Data]), C[Data] <= MAX(C[Data])))', 120, { 'C[Ano]': 2023, 'C[Mes]': 3 });      // pegadinha: o filtro de Mes continua valendo, então o acumulado só enxerga março
  is('CALCULATE([Total], FILTER(ALL(C), C[Data] <= MAX(C[Data])))', 160, { 'C[Ano]': 2023, 'C[Mes]': 3 });
  is('CALCULATE([Total], USERELATIONSHIP(V[entrega], C[Data]))', 30, mar24); is('CALCULATE([Total], USERELATIONSHIP(V[entrega], C[Data]))', 20, { 'C[Ano]': 2024, 'C[Mes]': 4 }); is('[Total]', null, { 'C[Ano]': 2024, 'C[Mes]': 4 });
  is('MAXX(ALL(C), C[Data])', serial(2024, 12, 31)); is('CALCULATE(MAX(C[Data]), ALL(C))', serial(2024, 12, 31)); is('LASTDATE(C[Data])', serial(2024, 3, 31), mar24); is('FIRSTDATE(C[Data])', serial(2024, 3, 1), mar24);
  is('ENDOFMONTH(C[Data])', serial(2024, 3, 31), mar24); is('STARTOFYEAR(C[Data])', serial(2024, 1, 1), mar24);
});
test('ordenação e tabelas', () => {
  is('RANKX(ALL(P[nome]), [Total])', 3, { 'P[nome]': 'A' }); is('RANKX(ALL(P[nome]), [Total])', 1, { 'P[nome]': 'C' }); is('RANKX(ALL(P[nome]), [Total], , ASC)', 1, { 'P[nome]': 'A' });
  assert.deepEqual(col('TOPN(2, ALL(P[nome]), [Total])'), ['C', 'B']); assert.deepEqual(col('TOPN(1, ALL(P[nome]), [Total], ASC)'), ['A']);
  is('COUNTROWS(TOPN(2, ALL(P[nome]), [Total]))', 2); is('COUNTROWS(VALUES(P[cat]))', 2); is('COUNTROWS(ALL(P))', 3); is('COUNTROWS(P)', 3); is('COUNTROWS(P)', 2, { 'P[cat]': 'X' });
  is('SELECTEDVALUE(P[cat])', 'X', { 'P[cat]': 'X' }); is('SELECTEDVALUE(P[cat], "vários")', 'vários'); is('HASONEVALUE(P[cat])', true, { 'P[cat]': 'X' }); is('HASONEVALUE(P[cat])', false);
  is('ISFILTERED(P[cat])', true, { 'P[cat]': 'X' }); is('ISFILTERED(P[cat])', false); is('ISFILTERED(P[nome])', false, { 'P[cat]': 'X' }); is('ISCROSSFILTERED(V)', true, { 'P[cat]': 'X' });
  is('COUNTROWS(ADDCOLUMNS(P, "x", P[preco] * 2))', 3); is('SUMX(ADDCOLUMNS(P, "x", P[preco] * 2), [x])', 120); is('MAXX(SELECTCOLUMNS(P, "dobro", P[preco] * 2), [dobro])', 60);
  is('COUNTROWS(SUMMARIZE(V, P[cat]))', 2); is('SUMX(SUMMARIZE(V, P[cat], "t", SUM(V[valor])), [t])', 340); is('COUNTROWS(SUMMARIZECOLUMNS(P[cat], "t", [Total]))', 2);
  is('COUNTROWS(UNION(VALUES(P[cat]), VALUES(P[cat])))', 4); is('COUNTROWS(EXCEPT(ALL(P[nome]), ROW("n", "A")))', 2); is('COUNTROWS(CROSSJOIN(ALL(P[nome]), VALUES(P[cat])))', 6); is('COUNTROWS(GENERATESERIES(1, 10, 3))', 4);
  is('LOOKUPVALUE(P[cat], P[nome], "C")', 'Y'); is('CONTAINS(P, P[nome], "B")', true); is('CONTAINS(P, P[nome], "Z")', false);
  is('ISEMPTY(FILTER(P, P[preco] > 100))', true); is('COUNTROWS(FILTER(P, P[preco] >= 20))', 2);
  is('CALCULATE([Total], TREATAS({"X"}, P[cat]))', 190);
  is('SUMX(FILTER(ALL(P), P[preco] > 10), [Total])', 270);
});
test('VAR / RETURN, parte inteira do script e português', () => {
  is('VAR a = SUM(V[valor]) VAR b = 4 RETURN a / b', 85); is('VAR a = 3 RETURN VAR b = a * 2 RETURN a + b', 9); is('VAR t = [Total] RETURN CALCULATE(t, P[cat] = "X")', 340, {});
  is('DIVIDE(10; 4)', 2.5); is('0,15 * 100', 15); is('IF(1 > 2; "a"; "b")', 'b'); is('0.5 + 0.25', 0.75);
  const s = DAX.parse('Total Geral = SUM(V[valor])\n\nMargem % = DIVIDE([Total Geral] - 1; [Total Geral])\nV[Dobro] = V[qtd] * 2'); assert.equal(s.ptbr, true);
  assert.deepEqual(s.defs.map(d => [d.name, d.kind, d.table]), [['Total Geral', 'measure', null], ['Margem %', 'measure', null], ['Dobro', 'column', 'V']]);
  const t = DAX.parse('Vendas Altas =\n  CALCULATE(\n    [Total],\n    V[qtd] >= 3\n  )'); assert.equal(t.defs.length, 1); assert.equal(t.defs[0].name, 'Vendas Altas');
  const u = DAX.parse('SUM(V[valor])'); assert.equal(u.defs[0].name, null); const w = DAX.parse('// comentário\nA = 1 /* x */ + 2'); assert.equal(w.defs[0].name, 'A');
  const v2 = DAX.parse('Lucro =\n VAR r = SUM(V[valor])\n RETURN r - 1\nOutra = 5'); assert.equal(v2.defs.length, 2);
});
test('erros em português', () => {
  bad('SUM(V[valorr])', /não existe.*Você quis dizer V\[valor\]/); bad('SUMM(V[valor])', /não existe no DAX.*SUM/); bad('SUM(Z[valor])', /tabela 'Z'/); bad('SUM(V[valor]', /parêntese/); bad('SUM(V[valor]))', /parêntese/);
  bad('SUM(V[valor] * 2)', /só aceita uma coluna.*SUMX/); bad('[Nada]', /medida \[Nada\]/); bad('CALCULATE([Total], [Total] > 5)', /precisa falar de uma coluna/); bad('V[qtd]', /único|valores/); bad('1 +', /terminou antes/);
  bad('"a" + 1', /texto "a"/); bad('IF(1)', /pelo menos 2/); bad('SUM(V[valor], 1)', /espera 1 argumento/); bad('RELATED(P[nome])', /precisa de uma linha/); bad('FOO', /não é uma variável nem uma tabela/); bad('1 2', /sintaxe/);
  bad('CALCULATE(', /terminou|Faltou/); bad('EARLIER(V[qtd])', /dois contextos/); bad('VAR x = 1', /RETURN/);
  const loop = new DAX.Model({ ...spec(), measures: { A: '[B] + 1', B: '[A] + 1' } }); assert.throws(() => DAX.evalExpr(loop, '[A]'), /chama a si mesma/);
});
test('visual: linhas, totais, segmentação e ALLSELECTED', () => {
  const run = (spec, defs, m) => DAX.runVisual(m || M, spec, defs.map(([name, e]) => ({ name, ast: DAX.expr(e) })));
  let r = run({ by: ['P[cat]'] }, [['T', '[Total]']]); assert.deepEqual(r.rows.map(x => [x.g[0], x.v[0]]), [['X', 190], ['Y', 150]]); assert.deepEqual(r.total, [340]);
  r = run({ by: ['C[Ano]'] }, [['T', '[Total]'], ['Pct', 'DIVIDE([Total], CALCULATE([Total], ALL(C)))']]); assert.deepEqual(r.rows.map(x => x.v[0]), [160, 180]); near(r.rows[0].v[1], 160 / 340);
  r = run({ by: ['P[cat]'], slicers: { 'C[Ano]': [2024] } }, [['T', '[Total]'], ['Todos', 'CALCULATE([Total], ALL(P[cat]))'], ['Sel', 'CALCULATE([Total], ALLSELECTED(P[cat]))']]);
  assert.deepEqual(r.rows.map(x => x.v), [[150, 180, 180], [30, 180, 180]]);
  r = run({ by: ['C[Mes]'] , slicers: { 'C[Ano]': [2023] } }, [['T', '[Total]']]); assert.deepEqual(r.rows.map(x => x.g[0]), [1, 2, 3]);     // meses sem venda não aparecem
  r = run({ by: ['P[cat]', 'C[Ano]'] }, [['T', '[Total]']]); assert.deepEqual(r.rows.map(x => [x.g[0], x.g[1], x.v[0]]), [['X', 2023, 40], ['X', 2024, 150], ['Y', 2023, 120], ['Y', 2024, 30]]);
  r = run({ by: [] }, [['A', '[Total]'], ['B', '[Qtd]']]); assert.deepEqual(r.rows[0].v, [340, 18]);
  r = run({ by: ['P[cat]'] }, [['Pct', 'DIVIDE([Total], CALCULATE([Total], ALL(P)))'], ['EmEscopo', 'ISINSCOPE(P[cat])']]); assert.equal(r.rows[0].v[1], true); assert.equal(r.total[1], false);
  const m3 = M.with([['Dobro', DAX.expr('[Total] * 2')]]); r = DAX.runVisual(m3, { by: ['P[cat]'] }, [{ name: 'D', ast: DAX.expr('[Dobro]') }]); assert.deepEqual(r.rows.map(x => x.v[0]), [380, 300]);
});
test('limite de cálculo', () => {
  const t0 = Date.now(); assert.throws(() => DAX.evalExpr(M, 'SUMX(CROSSJOIN(ALL(C[Data]), ALL(C[Data])), 1)'), /pesada|grande/); assert.ok(Date.now() - t0 < 5000);
  assert.throws(() => DAX.evalExpr(M, 'REPT("abcdefghij", 99999999)'), /repetições demais/);
});
