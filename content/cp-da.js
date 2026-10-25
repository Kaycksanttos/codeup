// PROVAS DO CURSO ANÁLISE DE DADOS E STORYTELLING (nível Básico): checkpoint depois da lição 10 (pensar com dados), checkpoint depois da 20 (resumir e comparar)
// e prova final depois da 30 (visualizar e contar a história). Mesmas regras de chances do resto do app (lessons.js). Conferidas por `npm run check:pbi`.
const mk = require('./hp');
const { mc, multi, order, match, num, build, write, tab, col, info } = mk;
const { Q } = mk('dados', 1);

const med = a => { const s = [...a].sort((x, y) => x - y), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
const mil = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const MES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const FIELDS = ['Produtos[Categoria]', 'Produtos[Produto]', 'Clientes[Cidade]', 'Calendario[Ano]', 'Vendas[Canal]'];
const MEAS = { 'Total Vendas': 'SUM(Vendas[Valor])', 'Qtd Vendida': 'SUM(Vendas[Qtd])' };

const strip = ({ explain, example, ...b }) => b;
const cp = (k, title, task, base, inf, o = {}) => ({ ...strip(base), id: `cp-da-1-${k * 10}`, cp: true, k, after: k * 10, n: k * 10, xp: 60, title, task, test: true, info: info(inf), ...o });
const fin = (title, task, base, inf, o = {}) => ({ ...strip(base), id: 'fin-da-1', fin: true, k: 3, after: 30, n: 30, xp: 0, title, task, test: true, info: info(inf), ...o });

module.exports = [
  cp(1, 'Checkpoint: pensando com dados',
    'Responda as perguntas sobre o que você aprendeu nas lições 1 a 10: etapas da análise, tipos de dados, tabelas, limpeza e as medidas de média, mediana e moda.',
    Q('x', '', '', 'x', [
      mc('Qual etapa vem logo depois de reunir os dados?', 'Limpar e organizar', ['Visualizar', 'Fazer a pergunta', 'Recomendar'], 'A ordem é: perguntar, reunir, **limpar**, analisar e visualizar. Antes de calcular, é preciso arrumar os dados.'),
      match('Ligue cada dado ao seu tipo:', [['Nome do bairro', 'Categórico nominal'], ['Tamanho do tênis: pequeno, médio ou grande', 'Categórico ordinal'], ['Número de irmãos', 'Numérico discreto'], ['Peso em quilos (62,4)', 'Numérico contínuo']], '**Nominal** não tem ordem, **ordinal** tem; **discreto** se conta e **contínuo** se mede.'),
      num('Quantos pedidos DIFERENTES existem na tabela de itens?', 3, 'Os números de pedido são 7, 8 e 9: **3 pedidos**. A tabela tem 6 linhas, porque cada linha é um item.', { table: tab(['Pedido', 'Item', 'Qtd'], [[7, 'Bolo', 1], [7, 'Café', 2], [8, 'Café', 1], [9, 'Bolo', 2], [9, 'Suco', 1], [9, 'Pão', 3]], { title: 'Itens dos pedidos' }), calc: () => new Set([7, 7, 8, 9, 9, 9]).size }),
      num('Depois de remover a cópia repetida, qual é a soma da coluna Valor? (o valor vazio não conta)', 125, '40 + 25 + 60 = **125**. O Caio entra uma vez só e o Ivo, sem valor, fica de fora.', { unit: 'reais', table: tab(['ID', 'Cliente', 'Valor'], [[1, 'Rita', 40], [2, 'Caio', 25], [2, 'Caio', 25], [3, 'Ivo', null], [4, 'Lara', 60]], { title: 'Clientes e valores', fmt: { 2: 'moeda' } }), calc: () => 40 + 25 + 60 }),
      mc('A coluna Cidade tem "Recife", "recife" e "RECIFE ". Qual é a melhor correção?', 'Padronizar tudo para "Recife"', ['Manter os três jeitos e contar cada um', 'Apagar a coluna Cidade', 'Deixar só a primeira linha'], '**Padronizar** é escolher uma forma só. Para o computador, os três textos eram cidades diferentes.'),
      num('Quantas vezes a uva aparece na lista de frutas vendidas?', 4, 'Contando na lista: uva aparece **4 vezes**.', { text: 'Frutas vendidas: maçã, uva, maçã, pera, uva, maçã, uva, uva', calc: () => ['maçã', 'uva', 'maçã', 'pera', 'uva', 'maçã', 'uva', 'uva'].filter(x => x === 'uva').length }),
      num('Qual é a mediana destes tempos de entrega, em minutos?', 7, 'Em ordem: 4, 6, **7**, 9, 14. O valor do meio é **7**. (A média seria 8.)', { unit: 'minutos', text: 'Tempos de entrega (min): 9, 4, 14, 7, 6', calc: () => med([9, 4, 14, 7, 6]) }),
      mc('Numa empresa, 9 pessoas ganham R$ 2.000 e o dono ganha R$ 52.000. Qual medida mostra melhor o salário típico?', 'A mediana: R$ 2.000', ['A média: R$ 7.000', 'O maior salário: R$ 52.000', 'A soma de todos os salários'], 'O salário do dono é um valor extremo e puxa a média para R$ 7.000. A **mediana** (R$ 2.000) mostra o salário típico.', { calc: () => 'A mediana: R$ ' + mil(med([2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 52000])) })
    ]),
    [`É o primeiro checkpoint do curso de Análise de Dados: um quiz que junta as lições 1 a 10. Você mostra que sabe pensar com dados: as etapas da análise, os tipos de dados, como ler uma tabela, limpar e resumir.`,
      `Serve para conferir se a base está firme antes de entrar nas comparações, nas porcentagens e nos gráficos, que usam tudo o que você viu até aqui.`,
      `Leia cada pergunta com calma, olhe a tabela ou a lista quando houver uma, faça as contas e digite os resultados.`,
      `Oito perguntas numa só tela. Passando, você libera as lições 11 a 20.`]),

  cp(2, 'Checkpoint: resumindo e comparando',
    'Responda as perguntas sobre as lições 11 a 20: mínimo e máximo, porcentagem, variação, comparações justas, agrupamento, tendência, causa, amostra e escolha de gráfico, e monte um gráfico.',
    Q('x', '', '', 'x', [
      num('Qual é a amplitude das vendas nesses seis meses (maior menos menor)?', 30, 'Maior: 60. Menor: 30. Amplitude: 60 − 30 = **30**.', { unit: 'reais', chart: col(MES.slice(0, 6), [30, 42, 36, 55, 48, 60], { title: 'Vendas por mês', fmt: 'moeda' }), calc: () => 60 - 30 }),
      num('Qual é a participação dos Grãos no total de vendas, em %?', 50, 'Total: 120 + 80 + 200 = 400. Grãos: 200 ÷ 400 = **50%**.', { unit: '%', table: tab(['Categoria', 'Vendas'], [['Frutas', 120], ['Verduras', 80], ['Grãos', 200]], { title: 'Vendas por categoria', fmt: { 1: 'moeda' } }), calc: () => 200 / (120 + 80 + 200) * 100 }),
      num('Uma loja foi de R$ 800 para R$ 1.000 de vendas. Qual foi o aumento percentual, em %?', 25, '(1.000 − 800) ÷ 800 = 0,25, ou **+25%**.', { unit: '%', calc: () => (1000 - 800) / 800 * 100 }),
      mc('Qual loja vende mais POR FUNCIONÁRIO?', 'Y', ['X', 'As duas vendem igual por funcionário', 'Não dá para saber'], 'X: 9.000 ÷ 30 = 300. **Y: 4.000 ÷ 10 = 400**. A menor loja é a mais produtiva por pessoa.', { table: tab(['Loja', 'Vendas', 'Funcionários'], [['X', 9000, 30], ['Y', 4000, 10]], { title: 'Lojas', fmt: { 1: 'moeda' } }), calc: () => (9000 / 30 > 4000 / 10 ? 'X' : 'Y') }),
      num('Qual é o total da região Norte?', 90, '30 + 50 + 10 = **90**.', { unit: 'reais', table: tab(['Região', 'Produto', 'Valor'], [['Norte', 'A', 30], ['Sul', 'B', 20], ['Norte', 'B', 50], ['Sul', 'A', 40], ['Norte', 'A', 10]], { title: 'Vendas', fmt: { 2: 'moeda' } }), calc: () => 30 + 50 + 10 }),
      mc('As vendas de panetone sobem todo mês de dezembro, ano após ano. Isso é:', 'Sazonalidade', ['Tendência de queda', 'Um erro nos dados', 'Um valor extremo sem explicação'], 'Um padrão que **se repete** em épocas parecidas é sazonalidade.'),
      mc('Em cidades com mais bombeiros há mais incêndios grandes. Os bombeiros causam os incêndios?', 'Não: a causa pode ser inversa ou outra, como o tamanho da cidade', ['Sim: onde há bombeiros, há mais fogo, sem dúvida', 'Sim: duas coisas que sobem juntas sempre têm relação de causa', 'Não dá para dizer nada, nem em teoria, sobre essa relação'], 'Cidades grandes têm mais bombeiros **e** mais incêndios, e incêndios grandes chamam mais bombeiros. Correlação não é causa.'),
      num('Foram pesquisados 25 de 500 clientes e 20 aprovam o serviço. Se a amostra for representativa, quantos dos 500 devem aprovar?', 400, '20 ÷ 25 = 80%. E 80% de 500 = **400 clientes**. É uma estimativa.', { calc: () => 20 / 25 * 500 }),
      build('Monte um gráfico de BARRAS com o Total de Vendas de cada cidade.', 'loja', FIELDS, MEAS, ['bar', 'line', 'pie', 'card'], { v: 'bar', axis: 'Clientes[Cidade]', values: 'Total Vendas' }, 'Comparar cidades pede **barras**: a cidade vai no eixo e a medida nos valores.'),
      match('Ligue cada pergunta ao gráfico mais indicado:', [['Como as vendas mudaram ao longo do ano?', 'Linhas'], ['Quanto cada canal pesa no total (poucas fatias)?', 'Pizza'], ['Qual categoria vende mais?', 'Colunas'], ['Altura e peso andam juntos?', 'Dispersão']], 'O **tempo** pede linhas, **partes de um todo** pedem pizza, **comparar categorias** pede colunas e **relações** pedem dispersão.')
    ]),
    [`É o segundo checkpoint: um quiz que junta as lições 11 a 20. Você resume e compara dados com contas de porcentagem, variação, grupos e médias, e escolhe o gráfico certo.`,
      `Serve para mostrar que você sabe tirar números de uma tabela e compará-los de um jeito justo, que é a parte de calcular de toda análise.`,
      `Faça as contas com calma, digite os resultados, ligue cada pergunta ao seu gráfico e monte um gráfico de barras com os campos certos.`,
      `Dez perguntas numa só tela. Passando, você libera as lições 21 a 30, sobre contar a história.`]),

  fin('Prova final: contando a história com dados',
    'Responda as perguntas finais do curso: gráficos que enganam, títulos, insights, recomendações, painel e ética. Algumas perguntas pedem que você escreva com as suas palavras.',
    Q('x', '', '', 'x', [
      num('Neste gráfico, qual foi o aumento REAL entre 2025 e 2026, em %?', 3, '(206 − 200) ÷ 200 = 0,03, ou **+3%**. O eixo cortado em 190 fez a diferença parecer enorme.', { unit: '%', chart: col(['2025', '2026'], [200, 206], { min: 190, title: 'Vendas (R$)', fmt: 'moeda' }), calc: () => (206 - 200) / 200 * 100 }),
      mc('Qual é o principal defeito do gráfico acima?', 'O eixo começa em 190, e não em zero', ['As colunas estão com cores demais e muito fortes', 'Falta uma terceira coluna para comparar os anos', 'O gráfico de colunas não serve para comparar dois anos'], 'Em gráficos de colunas o eixo deve começar no **zero**. Cortado, ele faz um aumento de 3% parecer um salto.', { chart: col(['2025', '2026'], [200, 206], { min: 190, title: 'Vendas (R$)', fmt: 'moeda' }) }),
      mc('O gráfico mostra que as reclamações caíram de 80 para 56 em um trimestre. Qual título conta a conclusão?', 'As reclamações caíram 30% em um trimestre', ['Quantidade de reclamações recebidas por trimestre', 'Gráfico das reclamações do atendimento', 'Os números das reclamações do período'], '(56 − 80) ÷ 80 = −30%. O título de **conclusão** traz o número; os outros só descrevem o assunto.', { calc: () => 'As reclamações caíram ' + Math.round((80 - 56) / 80 * 100) + '% em um trimestre' }),
      multi('A diretoria só tem 5 minutos. O que levar para a reunião?', ['Uma ou duas conclusões claras', 'A decisão que elas pedem', 'Os detalhes de apoio guardados num anexo'], ['Todas as tabelas, uma por uma', 'O passo a passo de cada conta feita'], 'Para quem tem **pouco tempo**, vale o essencial e a decisão. O detalhe fica à mão, mas não ocupa a apresentação.'),
      mc('Qual frase é um insight, e não só um dado?', 'Os atrasos subiram 50%: vale rever o transporte', ['Houve 15 atrasos de entrega no mês de março', 'A tabela de atrasos tem 30 linhas e 4 colunas no total', 'Março vem depois de fevereiro no calendário'], 'O insight **compara** (de 10 para 15, +50%) e diz **o que fazer** (rever o transporte).'),
      num('Cada cliente retido vale R$ 50 por mês. Uma ação custa R$ 300 e retém 12 clientes. Quanto sobra no 1º mês depois de pagar a ação?', 300, '12 × 50 = R$ 600 de receita. Menos o custo de R$ 300, sobram **R$ 300,00**.', { unit: 'reais', calc: () => 12 * 50 - 300 }),
      order('Coloque as partes da apresentação na ordem:', ['Contexto e pergunta', 'Descobertas com gráficos', 'Conclusão', 'Recomendação e próximos passos'], 'Situar o público, **provar**, concluir e dizer **o que fazer**.'),
      write('Escreva, com as suas palavras, um título de conclusão para o dado: as entregas atrasadas subiram de 10 para 15 em um mês.', ['!o que mudou :: atras|entreg', '!em que direção ou quanto :: sub|aument|cresc|alta|50|mais'], 'Os atrasos nas entregas subiram 50% em um mês', 'O título de conclusão diz **o que mudou** (os atrasos) e **para onde** (subiram, 50%).'),
      write('Escreva uma recomendação com base neste fato: o WhatsApp responde aos clientes em 2 minutos e o e-mail em 2 horas, e os clientes preferem respostas rápidas.', ['!o que fazer :: priori|invest|ampli|incentiv|usar|ofere|aument|foc|migrar|direcion', '!qual canal :: whatsapp|zap', '!por quê :: rapid|veloc|minuto|tempo|demor'], 'Priorizar o WhatsApp no atendimento, porque ele responde em 2 minutos, bem mais rápido que o e-mail', 'A recomendação diz **o que fazer**, **em qual canal** e **por quê**, com o dado que a sustenta.'),
      write('Seu chefe pede que você esconda um resultado ruim. Explique, com as suas palavras, o que você faria e por quê.', ['!o que fazer :: mostr|apresent|explic|cont|incluir|avis', '!por quê :: confian|engan|decis|honest|verdad|credib|errad'], 'Eu mostraria o resultado ruim e explicaria o contexto, porque esconder engana quem decide e destrói a confiança', 'Mostrar também o resultado ruim é **honestidade**: esconder engana quem decide e destrói a confiança nas próximas análises.'),
      build('Monte um CARTÃO com a Qtd Vendida.', 'loja', FIELDS, MEAS, ['column', 'card', 'table', 'slicer'], { v: 'card', values: 'Qtd Vendida' }, 'O **cartão** mostra um número só: basta a medida Qtd Vendida.'),
      mc('Seu relatório tem o CPF de cada cliente, mas a análise só precisa de totais por cidade. O que fazer?', 'Tirar o CPF do relatório e deixar só o necessário', ['Manter o CPF, porque mais dado é sempre melhor', 'Enviar a planilha completa por mensagem para todo mundo', 'Trocar o CPF pelo telefone do cliente'], 'Dados pessoais só devem aparecer **quando são necessários**. Para totais por cidade, o CPF fica de fora.')
    ]),
    [`É a PROVA FINAL do curso de Análise de Dados e Storytelling: um quiz que junta as lições 21 a 30 e o que veio antes. Você mostra que sabe contar uma história com dados de forma clara e honesta.`,
      `É o trabalho de quem apresenta uma análise: não se deixar enganar por um gráfico, dar títulos que contam algo, tirar insights, recomendar o que fazer e ser honesto com o público.`,
      `Responda as perguntas de escolher e de calcular, monte um cartão e escreva três respostas com as suas palavras: um título, uma recomendação e uma explicação.`,
      `Doze perguntas numa só tela. Nas respostas escritas, a tela mostra o que faltou. Passando, você conclui o curso.`])
];
