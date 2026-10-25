// PROVAS DO CURSO POWER BI E DAX (nível Básico): checkpoint depois da lição 10 (perguntas), checkpoint depois da 20 (medidas em DAX) e prova final depois da 30 (colunas calculadas).
// Mesmas regras de chances do resto do app (lessons.js). Conferidas por `npm run check:pbi`.
const mk = require('./hp');
const { mc, multi, order, match, num, build, tab, col, info, dax } = mk;
const { D, Q } = mk('powerbi', 1);

const CAT = ['Bebidas', 'Doces', 'Lanches'], CAT_V = [215, 192, 340];
const FIELDS = ['Produtos[Categoria]', 'Produtos[Produto]', 'Clientes[Cidade]', 'Calendario[Ano]', 'Vendas[Canal]'];
const MEAS = { 'Total Vendas': 'SUM(Vendas[Valor])', 'Qtd Vendida': 'SUM(Vendas[Qtd])' };
const DG4 = { tables: [{ name: 'Vendas', cols: ['VendaID', 'Data', 'ProdutoID', 'ClienteID', 'Valor'], fact: true, key: 'VendaID' }, { name: 'Produtos', cols: ['ProdutoID', 'Produto', 'Categoria'], key: 'ProdutoID' }, { name: 'Clientes', cols: ['ClienteID', 'Cliente', 'Cidade'], key: 'ClienteID' }, { name: 'Calendario', cols: ['Data', 'Ano', 'Mes'], key: 'Data' }], rels: [['Vendas[ProdutoID]', 'Produtos[ProdutoID]'], ['Vendas[ClienteID]', 'Clientes[ClienteID]'], ['Vendas[Data]', 'Calendario[Data]']] };

const strip = ({ explain, example, ...b }) => b;
const cp = (k, title, task, base, inf, o = {}) => ({ ...strip(base), id: `cp-pbi-1-${k * 10}`, cp: true, k, after: k * 10, n: k * 10, xp: 60, title, task, test: true, info: info(inf), ...o });
const fin = (title, task, base, inf, o = {}) => ({ ...strip(base), id: 'fin-pbi-1', fin: true, k: 3, after: 30, n: 30, xp: 0, title, task, test: true, info: info(inf), ...o });

module.exports = [
  cp(1, 'Checkpoint: montando o relatório',
    'Responda as perguntas e monte um visual: o que você aprendeu nas lições 1 a 10 sobre etapas do projeto, tabelas, relacionamentos, visuais e a diferença entre medida e coluna calculada.',
    Q('x', '', '', 'x', [
      mc('Em qual etapa do projeto você liga as tabelas com relacionamentos?', 'Modelar', ['Obter os dados', 'Visualizar', 'Publicar'], 'É no **modelo** que se criam os relacionamentos entre as tabelas.'),
      num('No gráfico, quantos reais a categoria que mais vendeu vendeu a mais do que a que menos vendeu?', 148, 'Lanches (R$ 340,00) menos Doces (R$ 192,00) = **R$ 148,00**.', { chart: col(CAT, CAT_V, { title: 'Vendas por categoria', fmt: 'moeda' }), unit: 'reais', calc: () => Math.max(...CAT_V) - Math.min(...CAT_V) }),
      match('Ligue cada coluna ao melhor tipo de dado:', [['Idade do cliente (32)', 'Número inteiro'], ['Preço (R$ 8,50)', 'Número decimal'], ['Cidade do cliente', 'Texto'], ['Dia da venda', 'Data'], ['O pedido já foi pago? (sim ou não)', 'Verdadeiro/falso']], 'Contagens são **inteiros**, dinheiro é **decimal**, nomes são **texto**, dias são **data** e sim/não é **verdadeiro/falso**.'),
      multi('Quais destas ligações são relacionamentos corretos neste modelo?', ['Vendas[ProdutoID] com Produtos[ProdutoID]', 'Vendas[ClienteID] com Clientes[ClienteID]'], ['Vendas[Valor] com Produtos[Produto]', 'Clientes[Cidade] com Calendario[Ano]'], 'Os relacionamentos ligam **códigos que existem nas duas tabelas** (ProdutoID e ClienteID). Valor e cidade não identificam nada do outro lado.', { diagram: DG4 }),
      build('Monte um gráfico de COLUNAS com o Total de Vendas de cada canal.', 'loja', FIELDS, MEAS, ['column', 'pie', 'card', 'table'], { v: 'column', axis: 'Vendas[Canal]', values: 'Total Vendas' }, 'O canal é a categoria (**eixo**) e Total Vendas é a medida (**valores**).'),
      mc('Você quer mostrar o total de vendas de cada mês do ano. Qual visual escolhe?', 'Gráfico de linhas', ['Cartão', 'Gráfico de pizza com 12 fatias', 'Segmentação'], 'Evolução no tempo pede **linhas**. A pizza com 12 fatias fica ilegível e o cartão mostra um número só.'),
      mc('Esta fórmula é uma medida ou uma coluna calculada?', 'Medida', ['Coluna calculada', 'Segmentação', 'Tabela nova'], 'Não tem tabela antes do nome e usa SUM: é uma **medida**, que muda com os filtros.', { code: 'Qtd Total = SUM(Vendas[Qtd])', lang: 'dax' }),
      mc('Para que serve uma segmentação?', 'Para filtrar o relatório inteiro com um clique', ['Para guardar os dados das vendas', 'Para somar uma coluna', 'Para ligar duas tabelas'], 'A segmentação é um **filtro clicável**: ao escolher um valor, todos os visuais da página mudam.')
    ], { lang: 'dax' }),
    [`É o primeiro checkpoint do Power BI e DAX: um quiz que junta as lições 1 a 10. Você mostra que entendeu as etapas de um projeto, como as tabelas se ligam e como montar visuais.`,
      `Serve para conferir se a base está firme antes de entrar nas medidas em DAX, que é a parte que mais usa o que você viu até aqui.`,
      `Leia cada pergunta com calma, olhe o gráfico ou o desenho quando houver um, e monte o visual pedido escolhendo os campos certos.`,
      `Oito perguntas numa só tela. Passando, você libera as lições 11 a 20.`]),

  cp(2, 'Checkpoint: o painel da lanchonete',
    'Crie as cinco medidas do painel: Total Vendas (soma do Valor), Clientes Atendidos (clientes diferentes que compraram), Ticket Médio (Total Vendas dividido pela quantidade de vendas, mostrando 0 se não houver vendas), Vendas Online (Total Vendas só do canal Online) e % Online (Vendas Online dividido pelo Total Vendas).',
    D('x', '', '', 'x', {
      model: 'loja',
      views: [{ by: ['Produtos[Categoria]'], title: 'Por categoria', fmt: { 'Total Vendas': 'moeda', 'Ticket Médio': 'moeda', 'Vendas Online': 'moeda', '% Online': 'pct1' } }, { by: ['Calendario[Ano]'], title: 'Por ano', fmt: { 'Total Vendas': 'moeda', 'Ticket Médio': 'moeda', 'Vendas Online': 'moeda', '% Online': 'pct1' } }],
      answer: {
        'Total Vendas': 'SUM(Vendas[Valor])', 'Clientes Atendidos': 'DISTINCTCOUNT(Vendas[ClienteID])', 'Ticket Médio': 'DIVIDE([Total Vendas], COUNTROWS(Vendas), 0)',
        'Vendas Online': 'CALCULATE([Total Vendas], Vendas[Canal] = "Online")', '% Online': 'DIVIDE([Vendas Online], [Total Vendas])'
      },
      need: ['SUM', 'DISTINCTCOUNT', 'DIVIDE', 'CALCULATE'], hint: 'Comece pelas simples (Total Vendas e Clientes Atendidos) e depois use os nomes entre colchetes, como [Total Vendas], nas outras.'
    }),
    [`É o segundo checkpoint: você cria um painel de medidas completo, usando o que aprendeu nas lições 11 a 20 (SUM, COUNTROWS, DISTINCTCOUNT, medidas que usam medidas, DIVIDE e CALCULATE).`,
      `Serve para mostrar que você sabe escrever as medidas que quase todo relatório de vendas precisa: total, clientes, ticket médio e fatias do total.`,
      `Escreva uma medida por linha, no formato Nome = fórmula. Use [Total Vendas] dentro das outras medidas, DIVIDE para as divisões e CALCULATE para o filtro Online.`,
      `Cinco medidas conferidas por categoria e por ano. Se algum número não bater, a tela mostra o seu resultado ao lado do esperado.`]),

  fin('Prova final: a tabela de vendas completa',
    'Na tabela Vendas, crie seis colunas calculadas: Valor Unitário (Valor dividido pela Qtd), Lucro da Venda (Valor menos Qtd vezes o Custo do produto), Porte ("Grande" se o Valor for 20 ou mais, senão "Pequena"), Tamanho ("Uma" se a Qtd for 1, "Poucas" se for até 3, senão "Muitas"), Ano e Mês (a data no formato 2024-03) e Etiqueta (as 3 primeiras letras do Canal em maiúsculas, " - " e o nome do produto; por exemplo: LOJ - Pastel).',
    D('x', '', '', 'x', {
      model: 'loja', mode: 'column', table: 'Vendas',
      answer: {
        'Valor Unitário': 'DIVIDE(Vendas[Valor], Vendas[Qtd])', 'Lucro da Venda': 'Vendas[Valor] - Vendas[Qtd] * RELATED(Produtos[Custo])', 'Porte': 'IF(Vendas[Valor] >= 20, "Grande", "Pequena")',
        'Tamanho': 'SWITCH(TRUE(), Vendas[Qtd] = 1, "Uma", Vendas[Qtd] <= 3, "Poucas", "Muitas")', 'Ano e Mês': 'FORMAT(Vendas[Data], "yyyy-mm")', 'Etiqueta': 'UPPER(LEFT(Vendas[Canal], 3)) & " - " & RELATED(Produtos[Produto])'
      },
      need: ['RELATED', 'IF', 'SWITCH', 'FORMAT', 'UPPER', 'LEFT'], starter: '-- escreva as 6 colunas calculadas aqui, uma depois da outra\n', hint: 'Cada coluna começa com Vendas[Nome da coluna] = fórmula. O Custo e o nome do produto estão em Produtos: busque com RELATED.'
    }),
    [`É a PROVA FINAL do Power BI e DAX Básico: você cria seis colunas calculadas na tabela Vendas usando o que aprendeu desde a lição 21 (IF, SWITCH, RELATED, texto e datas), além das contas que já conhecia.`,
      `É o trabalho de quem prepara uma tabela para o relatório: separar vendas grandes e pequenas, calcular o lucro de cada venda e criar etiquetas e meses prontos para usar nos visuais.`,
      `Escreva uma coluna por vez, no formato Vendas[Nome] = fórmula. Para o lucro e a etiqueta você precisa de RELATED, porque o Custo e o nome do produto moram na tabela Produtos.`,
      `Seis colunas novas na tabela Vendas, conferidas linha por linha. Se alguma estiver diferente, a tela mostra as linhas em que o seu resultado não bate.`])
];
