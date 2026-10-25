// Motor da planilha do curso de Excel (public/xl.js): fórmulas em português, erros, copiar fórmula, formatos e correção (xlcheck.js).
const test = require('node:test'), assert = require('node:assert/strict');
const XL = require('../public/xl.js'), X = require('../xlcheck');

const t = (raw, a, want) => {
  const v = new XL.Sheet(raw).value(a), got = XL.isErr(v) ? v.code : v;
  if (typeof want === 'number') assert.ok(typeof got === 'number' && Math.abs(got - want) < 1e-9, `${JSON.stringify(raw)} ${a}: esperado ${want}, veio ${got}`);
  else assert.equal(got, want, `${a} de ${JSON.stringify(raw)}`);
};

test('motor do Excel: contas, funções em português e erros como o Excel', () => {
const S1 = { A1: 10, A2: 20, A3: 30, A4: 'x', A5: null, B1: 'maçã', B2: 'pera', B3: 'maçã', B4: 'uva', C1: 1, C2: 2, C3: 3, C4: 4 };
const f = (fx, want, extra = {}) => t({ ...S1, ...extra, Z1: fx }, 'Z1', want);
f('=1+2*3', 7); f('=(1+2)*3', 9); f('=2^3^2', 64); f('=-2^2', 4); f('=10%', 0.1); f('=50%*200', 100); f('=1,5+1', 2.5);
f('=SOMA(A1:A3)', 60); f('=SOMA(A1:A5)', 60); f('=SOMA(A1;A2;5)', 35); f('=MÉDIA(A1:A3)', 20); f('=MEDIA(A1:A3)', 20);
f('=MÁXIMO(A1:A3)', 30); f('=MÍNIMO(A1:A3)', 10); f('=CONT.NÚM(A1:A5)', 3); f('=CONT.VALORES(A1:A5)', 4); f('=CONTAR.VAZIO(A1:A5)', 1);
f('=SE(A1>5;"sim";"não")', 'sim'); f('=SE(A1>50;"sim";"não")', 'não'); f('=SE(E(A1>5;A2>5);1;0)', 1); f('=SE(OU(A1>50;A2>5);1;0)', 1);
f('=SOMASE(B1:B4;"maçã";A1:A4)', 40); f('=CONT.SE(B1:B4;"maçã")', 2); f('=CONT.SE(A1:A3;">15")', 2); f('=MÉDIASE(B1:B4;"maçã";A1:A4)', 20);
f('=SOMASES(A1:A4;B1:B4;"maçã";C1:C4;">1")', 30); f('=CONT.SES(B1:B4;"maçã";C1:C4;">1")', 1);
f('=PROCV("pera";B1:C4;2;FALSO)', 2); f('=PROCV("zzz";B1:C4;2;FALSO)', '#N/D'); f('=SEERRO(PROCV("zzz";B1:C4;2;FALSO);"nada")', 'nada');
f('=ÍNDICE(A1:A3;2)', 20); f('=CORRESP("uva";B1:B4;0)', 4); f('=ÍNDICE(A1:A3;CORRESP(30;A1:A3;0))', 30);
f('=PROCX("uva";B1:B4;C1:C4)', 4); f('=PROCX("zz";B1:B4;C1:C4;"não achou")', 'não achou');
f('=A1/0', '#DIV/0!'); f('=A4+1', '#VALOR!'); f('=ABC(1)', '#NOME?'); f('=A1&" e "&A2', '10 e 20'); f('=1,5&"x"', '1,5x');
f('=ESQUERDA("abcdef";3)', 'abc'); f('=DIREITA("abcdef";2)', 'ef'); f('=EXT.TEXTO("abcdef";2;3)', 'bcd'); f('=NÚM.CARACT("abc")', 3);
f('=MAIÚSCULA("ab")', 'AB'); f('=PRI.MAIÚSCULA("joão da silva")', 'João Da Silva'); f('=ARRUMAR("  a   b ")', 'a b');
f('=ARRED(2,345;2)', 2.35); f('=ARRED(-2,5;0)', -3); f('=ARREDONDAR.PARA.CIMA(2,11;1)', 2.2); f('=ARREDONDAR.PARA.BAIXO(2,99;1)', 2.9); f('=INT(-1,5)', -2); f('=TRUNCAR(-1,59;1)', -1.5);
f('=TEXTO(1234,5;"#.##0,00")', '1.234,50'); f('=TEXTO(0,256;"0,0%")', '25,6%'); f('=TEXTO(DATA(2024;3;5);"dd/mm/aaaa")', '05/03/2024'); f('=TEXTO(DATA(2024;3;5);"mmmm")', 'março'); f('=TEXTO(5;"000")', '005'); f('=TEXTO(1234;"R$ #.##0,00")', 'R$ 1.234,00');
f('=ANO(DATA(2024;3;5))', 2024); f('=MÊS(DATA(2024;3;5))', 3); f('=DIA(DATA(2024;3;5))', 5); f('=DATA(2024;14;1)-DATA(2025;2;1)', 0); f('=DIAS(DATA(2024;3;5);DATA(2024;3;1))', 4);
f('=DATADIF(DATA(2020;5;10);DATA(2024;3;5);"Y")', 3); f('=DATADIF(DATA(2020;5;10);DATA(2024;3;5);"M")', 45); f('=DIA.DA.SEMANA(DATA(2024;3;5))', 3); f('=FIMMÊS(DATA(2024;1;15);1)', XL.serial(2024, 2, 29));
f('=SOMARPRODUTO(A1:A3;C1:C3)', 140); f('=SOMARPRODUTO((B1:B4="maçã")*A1:A4)', 40, { A4: 5 }); f('=SOMARPRODUTO((B1:B4="maçã")*A1:A4)', '#VALOR!');   // texto numa conta dá #VALOR!, como no Excel
f('=MED(A1:A3)', 20); f('=MAIOR(A1:A3;2)', 20); f('=MENOR(A1:A3;1)', 10); f('=ORDEM(20;A1:A3)', 2); f('=RESTO(10;3)', 1); f('=RAIZ(16)', 4); f('=POTÊNCIA(2;10)', 1024);
f('=SES(A1>50;"a";A1>5;"b")', 'b'); f('=SE(A1>5;;3)', 0); f('=ESCOLHER(2;"a";"b";"c")', 'b'); f('=SUBSTITUIR("a-b-c";"-";"/")', 'a/b/c'); f('=LOCALIZAR("b";"abc")', 2); f('=UNIRTEXTO(", ";VERDADEIRO;B1:B4)', 'maçã, pera, maçã, uva');
f('=VALOR("12,5")+1', 13.5); f('=A1=10', true); f('=B1="MAÇÃ"', true); f('=NÃO(A1=10)', false); f('=SE(A5="";"vazio";"cheio")', 'vazio');
f('=SOMA(A1:A3)*10%', 6); f('=PROCV(25;A1:C3;3;VERDADEIRO)', 2); f('=CORRESP(25;A1:A3;1)', 2);
f('=SOMA(A:A)', 60); f('=CONT.NÚM(A:A)', 3);
t({ A1: '=B1', B1: '=A1' }, 'A1', '#REF!');
});

test('motor do Excel: copiar fórmula (preencher) ajusta as referências e respeita o $', () => {
  const sh = (src, dr, dc, w) => assert.equal(XL.shift(src, dr, dc), w, src);
  sh('=B2*C2', 1, 0, '=B3*C3'); sh('=B2*$F$1', 3, 0, '=B5*$F$1'); sh('=SOMA(B$2:B5)', 2, 1, '=SOMA(C$2:C7)'); sh('=A1&"A1"', 1, 1, '=B2&"A1"'); sh('=$A1', 1, 1, '=$A2');
  assert.equal(XL.shift('texto', 1, 0), 'texto');
});

test('motor do Excel: fórmula mal escrita é avisada antes de calcular, e nomes em inglês ganham dica', () => {
  for (const s of ['=SOMA(A1,A2)', '=1.5+1', '=SOMA(A1:A2', '=(1+2))', '=1+', '=2 3', '="ab', '=A1 B1']) assert.equal(XL.check(s).ok, false, s);
  for (const s of ['=SOMA(A1;A2)', '=1,5+1', '=SOMA(A1:A2)', '=SE(A1>1;"a";"b")', 'texto', '=']) assert.equal(XL.check(s).ok, true, s);
  const h = XL.hint('=SUM(A1:A3)+IF(A1;1;2)+FOO(1)').join(' '); assert.match(h, /SOMA/); assert.match(h, /SE/); assert.match(h, /FOO/);
});

test('motor do Excel: formatos de exibição e o que o aluno digita', () => {
  assert.equal(XL.show(1234.5, 'moeda'), 'R$ 1.234,50'); assert.equal(XL.show(0.256, 'pct1'), '25,6%'); assert.equal(XL.show(45356, 'data'), '05/03/2024');
  assert.equal(XL.show(1 / 3), '0,3333333333'); assert.equal(XL.show(0.1 + 0.2), '0,3'); assert.equal(XL.show(true), 'VERDADEIRO'); assert.equal(XL.show(new XL.XlErr('#N/D')), '#N/D');
  assert.deepEqual(XL.parseInput('10%'), { raw: 0.1, fmt: 'pct0' }); assert.deepEqual(XL.parseInput('12,5'), { raw: 12.5 });
  assert.equal(XL.parseInput('05/03/2024').fmt, 'data'); assert.deepEqual(XL.parseInput('oi'), { raw: 'oi' }); assert.deepEqual(XL.parseInput('=A1+1'), { raw: '=A1+1' });
});

test('motor do Excel: o motor não executa código (sem eval) e aguenta fórmulas absurdas', () => {
  const sh = new XL.Sheet({ A1: '=SOMA(A1)', B1: '=' + '('.repeat(500) + '1' + ')'.repeat(500), C1: '=1+' + '1+'.repeat(3000) + '1', D1: '=SOMA(A1:ZZ5000)', E1: '=__proto__(1)', F1: '=constructor' });
  for (const a of ['A1', 'B1', 'C1', 'D1', 'E1', 'F1']) { const v = sh.value(a); assert.ok(XL.isErr(v) || typeof v === 'number', a + ' deve dar erro ou número, nunca travar'); }
});

test('correção do Excel: aceita qualquer fórmula certa, mostra o que errou e barra valor digitado à mão', () => {
  const l = { type: 'excel', sheet: { rows: [['Produto', 'Preço', 'Qtd', 'Total'], ['Caneta', 2.5, 10, null], ['Caderno', 18, 4, null]], fmt: { D: 'moeda' } }, answer: { D2: '=B2*C2', D3: '=B3*C3' }, targets: ['D2', 'D3'], need: [] };
  assert.equal(X.grade(l, JSON.stringify({ D2: '=B2*C2', D3: '=B3*C3' })).ok, true);
  assert.equal(X.grade(l, JSON.stringify({ D2: '=C2*B2', D3: '=C3*B3' })).ok, true, 'a ordem da conta não importa');
  assert.equal(X.grade(l, JSON.stringify({ D2: '=B2*C2' })).ok, false, 'faltou uma célula');
  let g = X.grade(l, JSON.stringify({ D2: '=B2*C2', D3: '=B3+C3' })); assert.equal(g.ok, false); assert.equal(g.xl.cells[1].why, 'valor'); assert.equal(g.xl.cells[1].got, 'R$ 22,00'); assert.equal(g.xl.cells[1].want, 'R$ 72,00');
  g = X.grade(l, JSON.stringify({ D2: '25', D3: '72' })); assert.equal(g.ok, false); assert.equal(g.xl.cells[0].why, 'fixo', 'número digitado no lugar da fórmula');
  g = X.grade(l, JSON.stringify({ D2: '=2,5*10', D3: '=18*4' })); assert.equal(g.ok, false); assert.equal(g.xl.cells[0].why, 'alt', 'dá certo hoje, mas não acompanha os dados');
  g = X.grade(l, JSON.stringify({ D2: '=B2*(C2', D3: '=B3*C3' })); assert.equal(g.xl.cells[0].why, 'sintaxe');
  assert.equal(X.grade(l, '{}').ok, false); assert.equal(X.grade(l, 'não é json').ok, false); assert.equal(X.grade(l, '[1,2]').ok, false);
  g = X.grade({ ...l, need: ['SOMA'] }, JSON.stringify({ D2: '=B2*C2', D3: '=B3*C3' })); assert.equal(g.ok, false); assert.equal(g.missing, 'SOMA');
  assert.equal(X.needMissing({ need: ['SE'] }, { A1: '=SOMASE(A1:A2;"a";B1:B2)' }), 'SE', 'SE não é confundido com SOMASE');
  assert.equal(X.needMissing({ need: ['E'] }, { A1: '=SE(B1>1;1;0)' }), 'E', 'E não é confundido com SE');
  assert.equal(X.needMissing({ need: ['$'] }, { A1: '=B1*$F$1' }), null);
});
