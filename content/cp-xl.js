// PROVAS DO CURSO DE EXCEL (nível Básico): checkpoint depois da lição 10, checkpoint depois da 20 e prova final depois da 30.
// Cada prova é UMA planilha completa, com várias células para preencher. Mesmas regras de chances do resto do app (lessons.js).
const { col, merge, solText } = require('./hx');

const base = (o, answer) => ({ type: 'excel', track: 'excel', level: 'Básico', lv: 1, test: true, sheet: o.sheet, answer, targets: Object.keys(answer), solution: solText(answer) });
const info = a => ({ oque: a[0], serve: a[1], como: a[2], retorno: a[3] });
const cp = (k, title, task, sheet, answer, need, inf, o = {}) => ({ id: `cp-xl-1-${k * 10}`, cp: true, k, after: k * 10, n: k * 10, xp: 60, title, task, ...base({ sheet }, answer), need, info: info(inf), ...o });
const fin = (title, task, sheet, answer, need, inf, o = {}) => ({ id: 'fin-xl-1', fin: true, k: 3, after: 30, n: 30, xp: 0, title, task, ...base({ sheet }, answer), need, info: info(inf), ...o });

module.exports = [
  cp(1, 'Checkpoint: relatório de vendas',
    'Preencha o Total de cada produto (preço vezes quantidade). Depois, nas células de resumo, calcule o total geral, a média, a maior e a menor venda e o total geral com 10% de desconto.',
    { rows: [['Produto', 'Preço', 'Qtd', 'Total'], ['Caneta', 2.5, 40, null], ['Caderno', 18, 12, null], ['Mochila', 120, 5, null], ['Régua', 4.5, 25, null], ['Lápis', 1.2, 60, null],
      ['Total geral', null, null, null], ['Média dos totais', null, null, null], ['Maior venda', null, null, null], ['Menor venda', null, null, null], ['Total com 10% de desconto', null, null, null]],
      fmt: { B: 'moeda', D: 'moeda' }, widths: { A: 170 } },
    merge(col('D', 2, 6, '=B{r}*C{r}'), { D7: '=SOMA(D2:D6)', D8: '=MÉDIA(D2:D6)', D9: '=MÁXIMO(D2:D6)', D10: '=MÍNIMO(D2:D6)', D11: '=D7*(1-10%)' }),
    ['SOMA', 'MÉDIA', 'MÁXIMO', 'MÍNIMO'],
    [`É a sua primeira provinha de Excel! Você vai montar um relatório de vendas inteiro usando o que aprendeu nas lições 1 a 10: contas com células, copiar fórmula para baixo, porcentagem, SOMA, MÉDIA, MÁXIMO e MÍNIMO.`,
      `Serve para mostrar que você já consegue transformar uma lista de números em respostas (quanto vendeu, qual foi a melhor venda...) sem ter um exemplo pronto para copiar.`,
      `Primeiro, em D2, multiplique o preço pela quantidade e copie para baixo até D6. Depois, nas linhas de resumo, use as funções em cima do intervalo D2:D6. O desconto de 10% é o total vezes (1 - 10%).`,
      `A coluna Total toda preenchida e, embaixo, cinco números: total geral, média, maior, menor e total com desconto.`]),
  cp(2, 'Checkpoint: metas da equipe',
    'Na coluna E, escreva "Sim" quando as vendas bateram a meta (vendas maiores ou iguais à meta) e "Não" quando não bateram. No resumo: total vendido no Sul, quantos bateram a meta, média das vendas e quanto o Sul representa do total de vendas (em porcentagem).',
    { rows: [['Vendedor', 'Região', 'Vendas', 'Meta', 'Bateu a meta?', null, 'Resumo', 'Resultado'], ['Ana', 'Sul', 1100, 1000, null, null, 'Total vendido no Sul', null], ['Bruno', 'Norte', 800, 900, null, null, 'Quantos bateram a meta', null],
      ['Carla', 'Sul', 1200, 1000, null, null, 'Média das vendas', null], ['Davi', 'Leste', 500, 600, null, null, 'Parte do Sul no total', null], ['Elisa', 'Norte', 950, 900], ['Fábio', 'Sul', 900, 1000]],
      fmt: { C: 'moeda', D: 'moeda' }, cfmt: { H2: 'moeda', H3: 'num0', H4: 'moeda', H5: 'pct1' }, widths: { E: 110, G: 170, H: 100 } },
    merge(col('E', 2, 7, '=SE(C{r}>=D{r};"Sim";"Não")'), { H2: '=SOMASE(B2:B7;"Sul";C2:C7)', H3: '=CONT.SE(E2:E7;"Sim")', H4: '=MÉDIA(C2:C7)', H5: '=H2/SOMA(C2:C7)' }),
    ['SE', 'SOMASE', 'CONT.SE', 'MÉDIA'],
    [`É o segundo checkpoint: agora você usa decisões (SE) e somas e contagens com condição (SOMASE e CONT.SE), além do que já sabia de médias e porcentagens. Vale tudo das lições 1 a 20.`,
      `Serve para acompanhar metas, como uma gerente faz: quem bateu a meta, quanto cada região vendeu e quanto ela pesa no total.`,
      `Em E2 escreva um SE que compara C2 com D2 e copie para baixo. Depois use SOMASE para o Sul, CONT.SE para contar os "Sim", MÉDIA nas vendas e divida o total do Sul pela SOMA de todas as vendas.`,
      `A coluna E com "Sim" e "Não" e, no resumo, quatro resultados: um valor em reais, uma contagem, outra média em reais e uma porcentagem.`]),
  fin('Prova final: fechamento da loja',
    'Preencha o Total de cada produto (preço vezes quantidade) e a Situação: "Alta" se o total for 1000 ou mais, "Média" se for 500 ou mais e "Baixa" nos outros casos. No resumo: total geral, maior venda, quantas vendas Altas, soma das vendas Baixas, o produto da maior venda (use ÍNDICE e CORRESP), o nome do produto do código que está em I7 ("Não encontrado" se não existir) e a etiqueta do primeiro produto no formato Mouse - R$ 50,00.',
    { rows: [['Código', 'Produto', 'Preço', 'Qtd', 'Total', 'Situação', null, 'Resumo', 'Resultado'], [101, 'Mouse', 50, 12, null, null, null, 'Total geral', null], [102, 'Teclado', 120, 3, null, null, null, 'Maior venda', null], [103, 'Monitor', 900, 3, null, null, null, 'Vendas Altas', null],
      [104, 'Webcam', 150, 8, null, null, null, 'Total das Baixas', null], [105, 'Cabo', 15, 10, null, null, null, 'Produto da maior venda', null], [null, null, null, null, null, null, null, 'Código procurado', 103], [null, null, null, null, null, null, null, 'Produto do código', null], [null, null, null, null, null, null, null, 'Etiqueta', null]],
      fmt: { C: 'moeda', E: 'moeda' }, cfmt: { I2: 'moeda', I3: 'moeda', I4: 'num0', I5: 'moeda', I7: 'num0' }, widths: { H: 170, I: 130 } },
    merge(col('E', 2, 6, '=C{r}*D{r}'), col('F', 2, 6, '=SE(E{r}>=1000;"Alta";SE(E{r}>=500;"Média";"Baixa"))'), {
      I2: '=SOMA(E2:E6)', I3: '=MÁXIMO(E2:E6)', I4: '=CONT.SE(F2:F6;"Alta")', I5: '=SOMASE(F2:F6;"Baixa";E2:E6)', I6: '=ÍNDICE(B2:B6;CORRESP(I3;E2:E6;0))',
      I8: '=SEERRO(PROCV(I7;A2:B6;2;FALSO);"Não encontrado")', I9: '=B2&" - "&TEXTO(C2;"R$ 0,00")' }),
    ['SOMA', 'MÁXIMO', 'CONT.SE', 'SOMASE', 'ÍNDICE', 'CORRESP', 'SEERRO', 'PROCV', 'TEXTO', 'SE'],
    [`É a PROVA FINAL do nível Básico de Excel: um fechamento de loja completo, usando tudo o que você aprendeu desde a lição 1: contas, SE, SOMASE, CONT.SE, ÍNDICE com CORRESP, PROCV com SEERRO, textos e TEXTO.`,
      `É o trabalho de quem cuida dos números de uma loja: calcular o total de cada produto, classificar as vendas e responder perguntas rápidas olhando o resumo. Passando aqui, você conclui o Excel Básico!`,
      `Comece pelo Total (E2) e pela Situação (F2, com um SE dentro de outro) e copie para baixo. Depois responda cada linha do resumo com a função certa. Para a etiqueta, junte o nome, " - " e o preço formatado com TEXTO.`,
      `As colunas Total e Situação preenchidas e, no resumo, sete respostas: reais, reais, uma contagem, reais, um nome de produto, o nome do código procurado e a etiqueta.`],
    { keep: ['A', 'I'] })
];
