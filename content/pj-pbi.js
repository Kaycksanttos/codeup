// PROJETOS DE POWER BI E DAX (nível Básico): um depois de cada 5 lições (5, 10, 15, 20, 25 e 30). Veja content/pj.js.
//   • Projetos 1 e 2 (lições 1 a 10): quizzes de planejamento e de montagem de visuais.
//   • Projetos 3 a 6 (lições 11 a 30): o aluno escreve medidas e colunas calculadas em DAX; o servidor compara os resultados com os da resposta oficial (daxcheck.js).
// Conferidos por `npm run check:pbi`.
const mk = require('./hp');
const { mc, multi, order, match, num, build, tab, col } = mk;
const { D, Q } = mk('powerbi', 1);
const { base } = require('./pj');

let k = 0;
// projeto de DAX: pjD(título, tarefa, { model, extra, views, mode, table, answer, need, hint... }, [4 explicações], [3 dicas])
const pjD = (title, task, o, info, hints) => {
  k++;
  const d = D('x', '', '', task, o);
  return { ...base('powerbi', 1, k, title, task, info, hints), type: 'dax', model: d.model, extra: d.extra, views: d.views, mode: d.mode, table: d.table, answer: d.answer, need: d.need, forbid: d.forbid, noAlt: d.noAlt, ordered: d.ordered, names: d.names, starter: d.starter, peek: d.peek, exLang: 'dax', solution: d.solution };
};
// projeto de quiz: pjQ(título, tarefa, [perguntas], [4 explicações], [3 dicas], { mat })
const pjQ = (title, task, quiz, info, hints, o = {}) => {
  k++;
  return { ...base('powerbi', 1, k, title, task, info, hints), type: 'quiz', quiz, need: [], solution: '', exLang: 'text', mat: o.mat };
};

const FIELDS = ['Produtos[Categoria]', 'Produtos[Produto]', 'Clientes[Cidade]', 'Calendario[Ano]', 'Vendas[Canal]'];
const MEAS = { 'Total Vendas': 'SUM(Vendas[Valor])', 'Qtd Vendida': 'SUM(Vendas[Qtd])' };
const DG4 = { tables: [{ name: 'Vendas', cols: ['VendaID', 'Data', 'ProdutoID', 'ClienteID', 'Valor'], fact: true, key: 'VendaID' }, { name: 'Produtos', cols: ['ProdutoID', 'Produto', 'Categoria'], key: 'ProdutoID' }, { name: 'Clientes', cols: ['ClienteID', 'Cliente', 'Cidade'], key: 'ClienteID' }, { name: 'Calendario', cols: ['Data', 'Ano', 'Mes'], key: 'Data' }], rels: [['Vendas[ProdutoID]', 'Produtos[ProdutoID]'], ['Vendas[ClienteID]', 'Clientes[ClienteID]'], ['Vendas[Data]', 'Calendario[Data]']] };
const CANAL = ['Loja', 'Online'], CANAL_V = [548, 199];
const PEDIDOS = tab(['PedidoID', 'Item', 'Qtd', 'Valor'], [[1, 'Salgado', 3, 15], [2, 'Suco', 1, 6], [3, 'Bolo', 2, 36], [4, 'Pastel', 4, 28], [5, 'Café', 2, 10]], { title: 'Tabela Pedidos (amostra)', fmt: { 3: 'moeda' } });

module.exports = [
  pjQ('planejando o painel da lanchonete',
    'A dona de uma lanchonete quer o primeiro painel de vendas. Responda às perguntas para planejar o projeto: a ordem das etapas, os tipos de dados, a leitura de uma tabela e as ligações entre as tabelas.',
    [
      order('Coloque o caminho do projeto na ordem certa:', ['Obter as planilhas de vendas e de produtos', 'Limpar: tirar linhas em branco e acertar os tipos', 'Ligar as tabelas pelo código do produto', 'Montar o gráfico de vendas por produto', 'Publicar para a dona consultar no celular'],
        'Primeiro **obtém** os dados, depois **limpa**, depois **liga** as tabelas (modelo), só então **desenha** o gráfico e, por fim, **publica**.'),
      match('Ligue cada coluna da lanchonete ao melhor tipo de dado:', [['Quantidade de salgados vendidos', 'Número inteiro'], ['Preço do suco (R$ 6,50)', 'Número decimal'], ['Nome do funcionário', 'Texto'], ['Dia do pedido', 'Data'], ['O pedido já foi entregue? (sim ou não)', 'Verdadeiro/falso']],
        'Contagens são **inteiros**, dinheiro é **decimal**, nomes são **texto**, dias são **data** e sim/não é **verdadeiro/falso**.'),
      num('Quantas linhas (pedidos) tem a tabela?', 5, 'Cada linha é um pedido: são **5 linhas** (o cabeçalho não conta).', { table: PEDIDOS, calc: () => PEDIDOS.rows.length }),
      mc('Qual é o Item do pedido número 4?', 'Pastel', ['Bolo', 'Café', 'Salgado'], 'Ache a linha do pedido 4 e olhe a coluna Item: **Pastel**.', { table: PEDIDOS }),
      multi('Quais destas ligações o Power BI aceitaria como relacionamentos corretos (muitos para um)?', ['Vendas[ClienteID] com Clientes[ClienteID]', 'Vendas[Data] com Calendario[Data]'], ['Clientes[Cidade] com Produtos[Categoria]', 'Vendas[Valor] com Calendario[Ano]'],
        'Um relacionamento liga **a mesma informação** nas duas tabelas: o código do cliente e a data. Cidade com categoria, ou valor com ano, não têm nada a ver.', { diagram: DG4 }),
      mc('Por que guardar os clientes numa tabela própria, em vez de repetir nome e cidade em toda venda?', 'Cada informação fica guardada uma vez só, sem repetição e sem risco de ficar diferente em cada linha', ['Porque o Power BI não aceita texto na tabela de vendas', 'Porque assim o relatório fica sempre mais lento', 'Porque tabelas grandes são proibidas'],
        'Separar em tabelas evita repetir dados. Se um cliente muda de cidade, você corrige **uma linha** e todas as vendas dele já ficam certas.'),
      mc('Uma coluna de preços chegou do arquivo como texto. O que fazer antes de somar?', 'Mudar o tipo da coluna para número decimal na etapa de transformação', ['Somar mesmo assim, o Power BI converte sozinho', 'Apagar a coluna', 'Trocar os preços por nomes'], 'Texto não soma. Na etapa de **transformação** (Power Query) você muda o tipo da coluna para número decimal.')
    ],
    [`O primeiro projeto do Power BI: planejar o painel de uma lanchonete. Ele junta as lições 1 a 5: o que é o Power BI, do dado ao relatório, tabelas, linhas e colunas, tipos de dados e relacionamentos.`,
      `Antes de desenhar qualquer gráfico, quem trabalha com BI planeja: de onde vêm os dados, de que tipo é cada coluna e como as tabelas se ligam. Um bom plano evita números errados no painel.`,
      `Leia cada pergunta com calma. Quando houver uma tabela ou um desenho, olhe para ele antes de responder. Se errar, a explicação aparece e você pode tentar de novo.`,
      `Sete perguntas numa só tela (ordenar, ligar, número, escolher e marcar). Acertando tudo, o projeto está concluído.`],
    ['Pense como numa receita: ingredientes (obter), preparo (limpar), montagem (ligar as tabelas) e servir (desenhar e publicar).',
      'Linhas são os registros (cada pedido); colunas são as características (item, quantidade, valor). Conte só as linhas de dados, sem o cabeçalho.',
      'Um relacionamento sempre liga a mesma informação nas duas tabelas (como o código do cliente). Valores e textos diferentes não se ligam.']),

  pjQ('montando a página de vendas',
    'Agora você monta a página do relatório da lanchonete. Escolha os campos e os visuais certos, diga o que é fato e o que é dimensão, o que é medida e o que é coluna calculada, e leia o gráfico.',
    [
      mc('Em qual tabela ficam os números que somamos nas análises (como Valor e Qtd)?', 'Vendas, a tabela fato', ['Produtos, uma tabela dimensão', 'Clientes, uma tabela dimensão', 'Calendario, uma tabela dimensão'], 'Os acontecimentos e os números a somar ficam na **tabela fato** (Vendas). As dimensões só descrevem produtos, clientes e datas.', { diagram: DG4 }),
      build('Monte um gráfico de COLUNAS com a Quantidade Vendida de cada categoria de produto.', 'loja', FIELDS, MEAS, ['column', 'pie', 'card', 'table'], { v: 'column', axis: 'Produtos[Categoria]', values: 'Qtd Vendida' }, 'A categoria é o **eixo** (as colunas) e **Qtd Vendida** é a medida (os **valores**).'),
      build('Monte um CARTÃO com o Total de Vendas.', 'loja', FIELDS, MEAS, ['column', 'card', 'table', 'slicer'], { v: 'card', values: 'Total Vendas' }, 'O **cartão** recebe só a medida e mostra um número grande, sem categorias.'),
      build('Monte uma SEGMENTAÇÃO para o usuário filtrar o relatório por cidade do cliente.', 'loja', FIELDS, MEAS, ['column', 'card', 'table', 'slicer'], { v: 'slicer', axis: 'Clientes[Cidade]' }, 'A **segmentação** recebe só o campo que será usado como filtro: a Cidade.'),
      mc('Você quer comparar o total de vendas de 3 categorias lado a lado. Qual visual escolhe?', 'Gráfico de colunas', ['Cartão', 'Segmentação', 'Tabela com 200 linhas'], 'Para **comparar poucas categorias**, colunas deixam a diferença óbvia. O cartão mostra só um número e a segmentação filtra, mas não mostra valores.'),
      mc('Esta fórmula é uma medida ou uma coluna calculada?', 'Coluna calculada', ['Medida', 'Segmentação', 'Relacionamento'], 'Ela tem o nome da tabela antes do nome (Vendas[Margem]) e faz a conta **linha a linha**: é uma coluna calculada.', { code: 'Vendas[Margem] = Vendas[Valor] - Vendas[Qtd] * RELATED(Produtos[Custo])', lang: 'dax' }),
      mc('E esta, é uma medida ou uma coluna calculada?', 'Medida', ['Coluna calculada', 'Segmentação', 'Relacionamento'], 'Não tem tabela antes do nome e resume muitas linhas de uma vez (AVERAGE): é uma **medida**, que muda conforme os filtros.', { code: 'Venda Média = AVERAGE(Vendas[Valor])', lang: 'dax' }),
      num('Quantos reais a loja física (Loja) vendeu a mais do que o canal Online?', 349, 'Loja (R$ 548,00) menos Online (R$ 199,00) = **R$ 349,00**.', { chart: col(CANAL, CANAL_V, { title: 'Vendas por canal', fmt: 'moeda' }), unit: 'reais', calc: () => CANAL_V[0] - CANAL_V[1] })
    ],
    [`O segundo projeto do Power BI: a página de vendas da lanchonete. Ele junta as lições 6 a 10: fato e dimensão, o primeiro visual de colunas, escolher o visual certo, cartão, tabela e segmentação, e medida × coluna calculada.`,
      `Montar uma página boa é escolher o campo certo no eixo, a medida certa nos valores e o visual que deixa a resposta óbvia. Também é saber quando um cálculo é uma medida ou uma coluna.`,
      `Nos visuais, arraste os campos: categorias vão no eixo (ou nas linhas da tabela) e as medidas vão nos valores. Cartão e segmentação aceitam um campo só. Para classificar as fórmulas, veja se há tabela antes do nome.`,
      `Oito perguntas numa só tela: algumas para escolher, outras para montar um visual com os campos certos. Acertando tudo, o projeto está concluído.`],
    ['Categorias (texto, datas) vão no eixo ou na segmentação; números que se somam vão em valores, como medidas.',
      'Medida: resume muitas linhas e muda com os filtros (não tem tabela antes do nome). Coluna calculada: faz a conta linha a linha e leva o nome da tabela.',
      'No gráfico, compare as alturas das colunas e calcule a diferença com os valores mostrados.']),

  pjD('números do dia a dia',
    'Crie as seis medidas básicas da lanchonete: Total Vendas (a soma do Valor), Qtd de Vendas (quantas vendas existem), Venda Média (a média do Valor), Maior Venda (o maior Valor), Clientes Atendidos (quantos clientes diferentes compraram) e Comissão (5% do total das vendas).',
    {
      model: 'loja',
      views: [{ by: ['Produtos[Categoria]'], title: 'Por categoria', fmt: { 'Total Vendas': 'moeda', 'Venda Média': 'moeda', 'Maior Venda': 'moeda', 'Comissão': 'moeda' } }, { by: ['Calendario[Ano]'], title: 'Por ano', fmt: { 'Total Vendas': 'moeda', 'Venda Média': 'moeda', 'Maior Venda': 'moeda', 'Comissão': 'moeda' } }],
      answer: { 'Total Vendas': 'SUM(Vendas[Valor])', 'Qtd de Vendas': 'COUNTROWS(Vendas)', 'Venda Média': 'AVERAGE(Vendas[Valor])', 'Maior Venda': 'MAX(Vendas[Valor])', 'Clientes Atendidos': 'DISTINCTCOUNT(Vendas[ClienteID])', 'Comissão': 'SUM(Vendas[Valor]) * 0.05' },
      need: ['SUM', 'COUNTROWS', 'AVERAGE', 'MAX', 'DISTINCTCOUNT'], hint: 'x'
    },
    [`Suas primeiras medidas em DAX, todas de uma vez. O projeto usa as lições 11 a 15: SUM, COUNTROWS, AVERAGE / MIN / MAX, DISTINCTCOUNT e contas dentro da medida.`,
      `Estes seis números aparecem em quase todo painel de vendas: quanto vendeu, quantas vendas, quanto vale a venda típica, a maior venda, quantos clientes e quanto vai de comissão.`,
      `Escreva uma medida por linha, no formato Nome = fórmula. Use SUM para somar, COUNTROWS(Vendas) para contar as linhas, AVERAGE e MAX para a média e o maior valor, DISTINCTCOUNT para clientes diferentes e uma conta simples para a comissão.`,
      `Seis medidas conferidas por categoria de produto e por ano. Se algum número não bater, a tela mostra o seu resultado ao lado do esperado.`],
    ['Comece pelas mais simples: Total Vendas = SUM(Vendas[Valor]) e Qtd de Vendas = COUNTROWS(Vendas). Cada medida fica numa linha, no formato Nome = fórmula.',
      'Venda Média usa AVERAGE(Vendas[Valor]) e Maior Venda usa MAX(Vendas[Valor]). Para contar clientes sem repetir, DISTINCTCOUNT(Vendas[ClienteID]).',
      'A comissão é uma conta dentro da medida: SUM(Vendas[Valor]) * 0.05 (5% é 0,05). Use ponto nos decimais, como no DAX.']),

  pjD('painel de indicadores',
    'O Total Vendas e a Qtd de Vendas já estão prontos no modelo. Crie as cinco medidas do painel: Ticket Médio (Total Vendas dividido pela Qtd de Vendas, mostrando 0 se não houver vendas), Vendas Online (Total Vendas só do canal Online), % Online (Vendas Online dividido pelo Total Vendas), Online de Lanches (Total Vendas do canal Online e da categoria Lanches) e Vendas Grandes (quantas vendas têm Valor maior que 20).',
    {
      model: 'loja', extra: { measures: { 'Total Vendas': 'SUM(Vendas[Valor])', 'Qtd de Vendas': 'COUNTROWS(Vendas)' } },
      views: [{ by: ['Produtos[Categoria]'], title: 'Por categoria', fmt: { 'Total Vendas': 'moeda', 'Ticket Médio': 'moeda', 'Vendas Online': 'moeda', '% Online': 'pct1', 'Online de Lanches': 'moeda' } }, { by: ['Calendario[Ano]'], title: 'Por ano', fmt: { 'Total Vendas': 'moeda', 'Ticket Médio': 'moeda', 'Vendas Online': 'moeda', '% Online': 'pct1', 'Online de Lanches': 'moeda' } }],
      answer: {
        'Ticket Médio': 'DIVIDE([Total Vendas], [Qtd de Vendas], 0)', 'Vendas Online': 'CALCULATE([Total Vendas], Vendas[Canal] = "Online")', '% Online': 'DIVIDE([Vendas Online], [Total Vendas])',
        'Online de Lanches': 'CALCULATE([Total Vendas], Vendas[Canal] = "Online", Produtos[Categoria] = "Lanches")', 'Vendas Grandes': 'CALCULATE(COUNTROWS(Vendas), Vendas[Valor] > 20)'
      },
      need: ['DIVIDE', 'CALCULATE'], hint: 'x'
    },
    [`Um painel de indicadores completo. O projeto usa as lições 16 a 20: medidas que usam medidas, DIVIDE, nomes e formatos das medidas, CALCULATE e CALCULATE com mais de um filtro.`,
      `Ticket médio, participação de cada canal e vendas de um recorte específico (Online de Lanches) são indicadores que gestores acompanham toda semana.`,
      `Use as medidas prontas entre colchetes, como [Total Vendas]. DIVIDE(a, b, 0) divide sem dar erro. CALCULATE(medida, filtro1, filtro2) muda o filtro: cada filtro é uma coluna igual a um valor.`,
      `Cinco medidas conferidas por categoria e por ano. A tela mostra o seu resultado ao lado do esperado se algum número não bater.`],
    ['Você já tem [Total Vendas] e [Qtd de Vendas]. O Ticket Médio é DIVIDE([Total Vendas], [Qtd de Vendas], 0). O último número é o que aparece se a divisão não puder ser feita.',
      'Vendas Online = CALCULATE([Total Vendas], Vendas[Canal] = "Online"). O % Online usa a medida que você acabou de criar: DIVIDE([Vendas Online], [Total Vendas]).',
      'Com dois filtros: CALCULATE([Total Vendas], Vendas[Canal] = "Online", Produtos[Categoria] = "Lanches"). Para contar vendas grandes: CALCULATE(COUNTROWS(Vendas), Vendas[Valor] > 20).']),

  pjD('colunas da tabela de vendas',
    'Na tabela Vendas, crie cinco colunas calculadas: Preço Pago (Valor dividido pela Qtd), Tipo de Venda ("Entrega" se o Canal for Online, senão "Balcão"), Tamanho do Pedido ("Grande" se a Qtd for 4 ou mais, "Médio" se for 2 ou mais, senão "Pequeno"), Categoria da Venda (a categoria do produto vendido) e Local (a cidade do cliente, " - " e o canal; por exemplo: São Paulo - Online).',
    {
      model: 'loja', mode: 'column', table: 'Vendas',
      answer: {
        'Preço Pago': 'DIVIDE(Vendas[Valor], Vendas[Qtd])', 'Tipo de Venda': 'IF(Vendas[Canal] = "Online", "Entrega", "Balcão")', 'Tamanho do Pedido': 'SWITCH(TRUE(), Vendas[Qtd] >= 4, "Grande", Vendas[Qtd] >= 2, "Médio", "Pequeno")',
        'Categoria da Venda': 'RELATED(Produtos[Categoria])', 'Local': 'RELATED(Clientes[Cidade]) & " - " & Vendas[Canal]'
      },
      need: ['IF', 'SWITCH', 'RELATED'], starter: '-- escreva as 5 colunas calculadas aqui, uma depois da outra\n', hint: 'x'
    },
    [`Colunas calculadas na tabela de vendas. O projeto usa as lições 21 a 25: sua primeira coluna calculada, IF, SWITCH, RELATED e texto.`,
      `Colunas calculadas criam informação nova para cada linha: um tipo de venda, um tamanho de pedido, a categoria que vem de outra tabela. Depois dá para usá-las em filtros e gráficos.`,
      `Cada coluna começa com Vendas[Nome da coluna] = fórmula. Use IF para dois caminhos, SWITCH(TRUE(), ...) para vários, RELATED(Tabela[Coluna]) para buscar em outra tabela e & para juntar textos.`,
      `Cinco colunas conferidas linha a linha, com os valores calculados para cada venda.`],
    ['Cada coluna fica numa linha: Vendas[Preço Pago] = DIVIDE(Vendas[Valor], Vendas[Qtd]). Textos entre aspas duplas.',
      'O IF tem 3 partes: IF(teste, se verdadeiro, se falso). Para vários casos, SWITCH(TRUE(), teste1, resultado1, teste2, resultado2, resultado se nenhum). Comece pelo maior limite.',
      'RELATED traz um valor da tabela do outro lado do relacionamento: RELATED(Produtos[Categoria]). Para o Local, junte com &: RELATED(Clientes[Cidade]) & " - " & Vendas[Canal].']),

  pjD('comparando os anos',
    'O dono quer comparar 2023 com 2024. Crie as cinco medidas: Vendas 2023 (o total das vendas só do ano 2023), Vendas 2024 (o mesmo para 2024), Variação (Vendas 2024 menos Vendas 2023), % de Variação (a variação dividida pelas Vendas 2023, usando DIVIDE) e Maior Venda 2024 (o maior Valor de uma venda só em 2024).',
    {
      model: 'loja',
      views: [{ by: ['Produtos[Categoria]'], title: 'Por categoria', fmt: { 'Vendas 2023': 'moeda', 'Vendas 2024': 'moeda', 'Variação': 'moeda', '% de Variação': 'pct1', 'Maior Venda 2024': 'moeda' } }, { by: ['Vendas[Canal]'], title: 'Por canal', fmt: { 'Vendas 2023': 'moeda', 'Vendas 2024': 'moeda', 'Variação': 'moeda', '% de Variação': 'pct1', 'Maior Venda 2024': 'moeda' } }],
      answer: {
        'Vendas 2023': 'CALCULATE(SUM(Vendas[Valor]), Calendario[Ano] = 2023)', 'Vendas 2024': 'CALCULATE(SUM(Vendas[Valor]), Calendario[Ano] = 2024)', 'Variação': '[Vendas 2024] - [Vendas 2023]',
        '% de Variação': 'DIVIDE([Vendas 2024] - [Vendas 2023], [Vendas 2023])', 'Maior Venda 2024': 'CALCULATE(MAX(Vendas[Valor]), Calendario[Ano] = 2024)'
      },
      need: ['CALCULATE', 'DIVIDE'], hint: 'x'
    },
    [`O projeto final do Power BI Básico: uma comparação entre anos. Ele usa as lições 26 a 30: datas, contexto de filtro, o total que não é a soma das linhas, a tabela Calendário e a revisão do Básico.`,
      `"Vendemos mais ou menos que no ano passado?" é a pergunta mais comum de quem lê um relatório. Responder com medidas fixa o ano e deixa o painel comparar sozinho, por categoria ou por canal.`,
      `Use a tabela Calendario para fixar o ano: CALCULATE(SUM(Vendas[Valor]), Calendario[Ano] = 2023). Depois monte a variação com as medidas que você criou, entre colchetes, e divida com DIVIDE.`,
      `Cinco medidas conferidas por categoria de produto e por canal. A tela mostra o seu resultado ao lado do esperado se algum número não bater.`],
    ['Para fixar o ano use o filtro na tabela Calendario: CALCULATE(SUM(Vendas[Valor]), Calendario[Ano] = 2023). Faça igual para 2024.',
      'A Variação usa as duas medidas que você acabou de criar: [Vendas 2024] - [Vendas 2023]. A % de Variação divide essa diferença pelas Vendas 2023, com DIVIDE.',
      'A maior venda de 2024 troca o SUM por MAX dentro do CALCULATE: CALCULATE(MAX(Vendas[Valor]), Calendario[Ano] = 2024).'])
];
