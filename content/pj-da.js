// PROJETOS DE ANÁLISE DE DADOS E STORYTELLING (nível Básico): um depois de cada 5 lições (5, 10, 15, 20, 25 e 30). Veja content/pj.js.
// Cada projeto é um estudo de caso em forma de quiz (várias perguntas numa tela, sobre os mesmos dados). Conferidos por `npm run check:pbi`.
const mk = require('./hp');
const { mc, multi, order, match, num, build, write, tab, col } = mk;
const { Q } = mk('dados', 1);
const { base } = require('./pj');

let k = 0;
// pjQ(título, tarefa, [perguntas], [o que é, para que serve, como se faz, retorno esperado], [3 dicas])
const pjQ = (title, task, quiz, info, hints) => {
  k++;
  const q = Q('x', '', '', task, quiz, {});
  return { ...base('dados', 1, k, title, task, info, hints), type: 'quiz', quiz: q.quiz, need: [], solution: '', exLang: 'text' };
};

const FIELDS = ['Produtos[Categoria]', 'Produtos[Produto]', 'Clientes[Cidade]', 'Calendario[Ano]', 'Vendas[Canal]'];
const MEAS = { 'Total Vendas': 'SUM(Vendas[Valor])', 'Qtd Vendida': 'SUM(Vendas[Qtd])' };
const MES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const med = a => { const s = [...a].sort((x, y) => x - y), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };

// ---- dados dos casos
const VEND = tab(['Dia', 'Produto', 'Qtd', 'Valor'], [['Sáb', 'Pão francês', 50, 25], ['Sáb', 'Bolo', 3, 45], ['Dom', 'Pão francês', 40, 20], ['Dom', 'Café', 20, 60], ['Dom', 'Bolo', 2, 30], ['Seg', 'Pão francês', 35, 17.5]], { title: 'Vendas da padaria (amostra)', fmt: { 3: 'moeda' } });
const PESQ = tab(['ID', 'Cliente', 'Cidade', 'Nota'], [[1, 'Ana', 'Recife', 9], [2, 'Bruno', 'recife', 7], [3, 'Carla', 'Recife', null], [3, 'Carla', 'Recife', null], [4, 'Davi', 'Olinda', 8], [5, 'Eva', 'OLINDA', 10]], { title: 'Pesquisa de satisfação' });
const FIL = tab(['Filial', 'Vendas', 'Funcionários', 'Vendas ano passado'], [['Centro', 120000, 12, 120000], ['Norte', 90000, 5, 80000], ['Sul', 90000, 6, 75000]], { title: 'Filiais da rede', fmt: { 1: 'moeda', 3: 'moeda' } });
const MES_V = [100, 95, 98, 102, 105, 100, 104, 110, 108, 115, 140, 190];
const CANAL = ['Loja', 'Online', 'Telefone'], CANAL_V = [60, 30, 10];

module.exports = [
  pjQ('a pergunta da padaria',
    'O Seu Marcos tem uma padaria e quer vender mais. Ajude-o a começar a análise: faça uma boa pergunta, coloque as etapas na ordem, classifique os dados, leia a tabela de vendas e escolha as fontes de dados.',
    [
      mc('Qual destas é uma boa pergunta para começar a análise do Seu Marcos?', 'Quais produtos vendem mais nos fins de semana?', ['Vende bem?', 'Os dados estão bonitos?', 'Como ganhar mais dinheiro com tudo?'], 'Uma boa pergunta é **específica** e dá para responder com os dados. "Vende bem?" e "como ganhar mais dinheiro?" são vagas demais.'),
      order('Coloque as etapas da análise na ordem certa:', ['Fazer a pergunta', 'Reunir os dados', 'Limpar e organizar', 'Analisar: calcular e comparar', 'Mostrar o resultado'], 'Sempre se começa pela **pergunta**; depois vêm os dados, a limpeza, a análise e, por fim, a apresentação.'),
      match('Ligue cada dado da padaria ao seu tipo:', [['Nome da rua do cliente', 'Categórico nominal'], ['Avaliação do pão: ruim, boa ou ótima', 'Categórico ordinal'], ['Quantidade de pães vendidos', 'Numérico discreto'], ['Peso de um pão em gramas (52,5)', 'Numérico contínuo']], '**Nominal** não tem ordem; **ordinal** tem; o que se **conta** é discreto; o que se **mede** é contínuo.'),
      num('Quantas linhas (vendas) tem a tabela?', 6, 'Cada linha é a venda de um produto num dia. São **6 linhas** (o cabeçalho não conta).', { table: VEND, calc: () => VEND.rows.length }),
      num('Quantos pães franceses foram vendidos no total, somando todos os dias?', 125, '50 + 40 + 35 = **125 pães franceses**.', { unit: 'pães', table: VEND, calc: () => 50 + 40 + 35 }),
      multi('Quais destas são boas fontes de dados para o Seu Marcos?', ['O caderno de vendas do caixa', 'A planilha de controle de estoque', 'Uma pesquisa de satisfação com os clientes'], ['Um palpite sobre as vendas do mês que vem', 'A lembrança de um vizinho que nunca comprou na padaria'], 'Boas fontes são **registros reais** do negócio ou uma pesquisa feita com os clientes. Palpites e lembranças de quem não conhece a loja não são dados confiáveis.'),
      mc('Antes de usar uma planilha que um amigo enviou, o que é mais importante conferir?', 'Se a fonte é atual, completa e confiável', ['Se o arquivo tem um nome bonito', 'Se tem muitas cores', 'Se ele está em ordem alfabética'], 'Uma análise só é boa se os dados forem bons. Confira se são **atuais, completos e confiáveis** antes de usar.')
    ],
    [`O primeiro projeto de Análise de Dados: a padaria do Seu Marcos. Ele junta as lições 1 a 5: o que é análise de dados, como fazer boas perguntas, tipos de dados, linhas, colunas e tabelas, e de onde vêm os dados.`,
      `Toda análise começa com uma boa pergunta e com dados de boa qualidade. Saber ler uma tabela e classificar cada coluna evita erros logo no começo.`,
      `Leia cada pergunta com calma e olhe a tabela quando houver uma. Para os números, conte as linhas e some só o que foi pedido. Se errar, a explicação aparece e você pode tentar de novo.`,
      `Sete perguntas numa só tela (escolher, ordenar, ligar, número e marcar). Acertando tudo, o projeto está concluído.`],
    ['Uma boa pergunta é específica (fala de quê, quando ou onde) e pode ser respondida com números.',
      'Ordem da análise: pergunta, dados, limpeza, análise e resultado. Nominal não tem ordem, ordinal tem; o que se conta é discreto e o que se mede é contínuo.',
      'Na tabela, filtre só as linhas do produto pedido e some a coluna Qtd. Para as fontes, pense: isso é um registro real do negócio?']),

  pjQ('limpando a pesquisa',
    'A padaria fez uma pesquisa de satisfação e a tabela veio bagunçada. Encontre os problemas, limpe os dados e resuma as notas e os tempos de espera.',
    [
      multi('Quais problemas esta tabela tem?', ['Uma linha repetida (a Carla aparece duas vezes)', 'Um valor vazio na coluna Nota', 'A cidade escrita de jeitos diferentes (Recife e recife)'], ['Há notas negativas', 'A tabela não tem cabeçalho'], 'Há **repetição** (Carla), **valor vazio** (nota da Carla) e **formatos diferentes** (Recife, recife, OLINDA). Notas negativas e falta de cabeçalho não acontecem aqui.', { table: PESQ }),
      num('Depois de remover a linha repetida, quantos clientes sobram na tabela?', 5, 'Eram 6 linhas, mas a Carla aparecia duas vezes. Sem a repetida: **5 clientes**.', { table: PESQ, calc: () => new Set(PESQ.rows.map(r => r[0])).size }),
      num('Qual é a média das notas, ignorando o valor vazio e sem contar a Carla duas vezes?', 8.5, '(9 + 7 + 8 + 10) ÷ 4 = 34 ÷ 4 = **8,5**. A nota vazia da Carla não entra na conta.', { tol: 0.01, table: PESQ, calc: () => (9 + 7 + 8 + 10) / 4 }),
      mc('Qual é a melhor forma de arrumar a coluna Cidade?', 'Padronizar: escrever Recife e Olinda sempre do mesmo jeito', ['Manter os textos como estão e contar cada um separado', 'Apagar a coluna Cidade', 'Deixar só as cidades escritas em maiúsculas'], '**Padronizar** deixa tudo igual. Para o computador, "Recife" e "recife" são textos diferentes e seriam contados separado.', { table: PESQ }),
      num('Depois de padronizar, quantos clientes diferentes são de Recife?', 3, 'Ana, Bruno ("recife") e Carla: **3 clientes** de Recife (a Carla conta uma vez só).', { table: PESQ, calc: () => new Set(PESQ.rows.filter(r => String(r[2]).toLowerCase() === 'recife').map(r => r[0])).size }),
      num('Qual é a mediana destes tempos de espera, em minutos?', 5, 'Em ordem: 3, 4, **5**, 6, 30. O valor do meio é **5**.', { unit: 'minutos', text: 'Tempos de espera (min): 5, 3, 30, 4, 6', calc: () => med([5, 3, 30, 4, 6]) }),
      mc('Qual medida mostra melhor o tempo de espera típico dessa fila?', 'A mediana: 5 minutos', ['A média: 9,6 minutos', 'O maior tempo: 30 minutos', 'A soma: 48 minutos'], 'O 30 é um valor extremo e puxa a média para cima (9,6). A **mediana** mostra a espera típica: 5 minutos.', { text: 'Tempos de espera (min): 5, 3, 30, 4, 6' })
    ],
    [`O segundo projeto de Análise de Dados: limpar e resumir uma pesquisa. Ele usa as lições 6 a 10: limpeza de vazios, repetidos, erros e formatos, contar e somar, média, mediana, moda e quando a média engana.`,
      `Dados reais chegam sujos: linhas repetidas, campos vazios e textos escritos de jeitos diferentes. Se você não limpar, as contas saem erradas sem você perceber.`,
      `Primeiro ache os problemas, depois limpe (tire a repetição, ignore o vazio, padronize os textos) e só então calcule. Para a tabela de tempos, ponha os números em ordem para achar a mediana.`,
      `Sete perguntas numa só tela, sobre a mesma pesquisa. Acertando tudo, o projeto está concluído.`],
    ['Olhe linha por linha: tem alguma igual a outra? Algum campo vazio? Algum texto escrito de outro jeito?',
      'Remova a repetição antes de contar e ignore o vazio antes de tirar a média: some só os valores que existem e divida pela quantidade deles.',
      'A mediana é o valor do meio com os números em ordem. Se existe um valor extremo (como o 30), a mediana representa melhor o típico do que a média.']),

  pjQ('comparando as filiais',
    'Uma rede tem três filiais e o dono quer saber qual vai melhor. Calcule a amplitude, a participação de cada uma, a variação sobre o ano passado e compare com justiça, levando em conta o tamanho de cada equipe.',
    [
      num('Qual é a amplitude das vendas (maior venda menos menor venda) entre as filiais?', 30000, 'A maior é Centro (R$ 120.000) e a menor é Norte e Sul (R$ 90.000): 120.000 − 90.000 = **R$ 30.000**.', { unit: 'reais', table: FIL, calc: () => 120000 - 90000 }),
      num('Qual é a participação da filial Centro no total de vendas, em %?', 40, 'O total é 120.000 + 90.000 + 90.000 = 300.000. O Centro: 120.000 ÷ 300.000 × 100 = **40%**.', { unit: '%', table: FIL, calc: () => 120000 / 300000 * 100 }),
      num('Qual foi a variação percentual das vendas da filial Sul em relação ao ano passado?', 20, '(90.000 − 75.000) ÷ 75.000 × 100 = 15.000 ÷ 75.000 × 100 = **20%**. A base da conta é o valor de antes.', { unit: '%', table: FIL, calc: () => (90000 - 75000) / 75000 * 100 }),
      mc('Qual filial vendeu mais POR FUNCIONÁRIO?', 'Norte: R$ 18.000 por funcionário', ['Centro: R$ 10.000 por funcionário', 'Sul: R$ 15.000 por funcionário', 'As três vendem igual por funcionário'], 'Divida as vendas pelos funcionários: Centro 120.000 ÷ 12 = 10.000; Norte 90.000 ÷ 5 = **18.000**; Sul 90.000 ÷ 6 = 15.000.', { table: FIL }),
      mc('Por que comparar só os totais de vendas pode enganar?', 'As filiais têm equipes de tamanhos diferentes; uma taxa (como vendas por funcionário) compara com mais justiça', ['Porque o total de vendas nunca está certo', 'Porque só vale comparar filiais com o mesmo nome', 'Porque as taxas sempre dão o mesmo resultado que o total'], 'Comparar **totais** de grupos de tamanhos diferentes é injusto. Uma **taxa** (por funcionário, por visita) coloca todo mundo na mesma régua.'),
      num('Quanto vendeu, em média, cada filial?', 100000, 'Total ÷ quantidade de filiais: 300.000 ÷ 3 = **R$ 100.000**.', { unit: 'reais', table: FIL, calc: () => 300000 / 3 }),
      mc('Você tem uma lista com todas as vendas da rede e quer o total de cada filial. O que fazer?', 'Agrupar as vendas por filial e somar cada grupo', ['Somar todas as vendas num número só', 'Ordenar a lista pelo valor e pegar a primeira linha', 'Apagar as vendas repetidas de todas as filiais'], '**Agrupar e resumir** é juntar as linhas por uma característica (a filial) e resumir cada grupo com uma soma. É o que faz uma tabela dinâmica.')
    ],
    [`O terceiro projeto de Análise de Dados: comparar as filiais de uma rede. Ele usa as lições 11 a 15: maior, menor e amplitude, porcentagem e participação, variação, comparar com justiça e agrupar e resumir.`,
      `Gerentes e donos comparam grupos o tempo todo (filiais, equipes, regiões). Saber calcular participação e variação, e comparar com taxas em vez de totais, evita conclusões injustas.`,
      `Use as contas: amplitude = maior − menor; participação = parte ÷ total × 100; variação % = (novo − antigo) ÷ antigo × 100; taxa = valor ÷ tamanho do grupo (por funcionário, por exemplo).`,
      `Sete perguntas numa só tela, todas sobre a tabela das filiais. Acertando tudo, o projeto está concluído.`],
    ['Amplitude é a diferença entre o maior e o menor valor. Participação é a parte dividida pelo total, vezes 100.',
      'Na variação, a conta divide pela base, que é o valor de ANTES (o do ano passado): (90.000 − 75.000) ÷ 75.000.',
      'Para comparar com justiça, divida as vendas pelo número de funcionários de cada filial e compare os resultados.']),

  pjQ('lendo os sinais',
    'O gerente de uma loja olha o gráfico de vendas do ano e tem várias dúvidas: o que é tendência e o que é sazonalidade, o que significa duas coisas andarem juntas, quando uma pesquisa pode enganar e qual gráfico escolher.',
    [
      mc('Em que mês a loja vendeu mais?', 'Dezembro', ['Janeiro', 'Junho', 'Outubro'], 'A linha chega ao ponto mais alto em **dezembro** (R$ 190).', { chart: col(MES, MES_V, { type: 'line', title: 'Vendas por mês (R$ mil)' }), calc: () => ({ 190: 'Dezembro' })[Math.max(...MES_V)] }),
      num('Quantos mil reais as vendas de dezembro foram maiores que as de janeiro?', 90, 'Dezembro (190) menos janeiro (100) = **90 mil reais**.', { unit: 'mil reais', chart: col(MES, MES_V, { type: 'line', title: 'Vendas por mês (R$ mil)' }), calc: () => MES_V[11] - MES_V[0] }),
      mc('O pico de dezembro se repete todo ano. Como se chama esse padrão?', 'Sazonalidade', ['Tendência de queda', 'Erro de digitação', 'Correlação sem causa'], 'Um padrão que **se repete** em épocas parecidas (como as vendas de fim de ano) é **sazonalidade**. Tendência é o rumo geral, subindo ou caindo.'),
      mc('No verão, as vendas de sorvete e os casos de insolação sobem juntos. O que isso quer dizer?', 'Existe uma terceira causa: o calor aumenta as duas coisas', ['O sorvete causa insolação', 'A insolação faz as pessoas comprarem sorvete', 'Isso nunca pode ser explicado'], 'Duas coisas podem andar juntas (**correlação**) sem que uma cause a outra. Aqui, o **calor** é a causa escondida das duas.'),
      mc('Uma pesquisa de satisfação foi feita só com quem foi à loja no sábado de manhã. Qual é o problema?', 'A amostra pode ser enviesada: ela não representa todos os clientes', ['Pesquisas só funcionam com mais de mil perguntas', 'Sábado de manhã é um horário proibido', 'Não há problema nenhum, qualquer grupo vale'], 'A **amostra** precisa representar a **população** (todos os clientes). Só quem vai no sábado de manhã pode pensar diferente de quem vai à noite.'),
      num('Uma amostra de 50 clientes representa 10% de todos os clientes da loja. Quantos clientes a loja tem no total?', 500, '50 é 10% do total, então o total é 50 ÷ 0,10 = **500 clientes**.', { unit: 'clientes', calc: () => 50 / 0.1 }),
      mc('Qual gráfico é o melhor para mostrar a evolução das vendas mês a mês?', 'Gráfico de linhas', ['Gráfico de pizza com 12 fatias', 'Cartão com um número só', 'Tabela sem gráfico nenhum'], 'Evolução no tempo pede **linhas**: elas mostram o rumo e os picos. A pizza com 12 fatias fica ilegível.')
    ],
    [`O quarto projeto de Análise de Dados: ler os sinais escondidos nos números. Ele junta as lições 16 a 20: tendência e sazonalidade, relação não é causa, amostra e população, escolher o gráfico e a revisão.`,
      `Quem analisa dados precisa evitar armadilhas: confundir um pico com tendência, achar que duas coisas que andam juntas se causam, ou tirar conclusões de uma amostra ruim.`,
      `Olhe o gráfico antes de responder. Procure o rumo geral e o que se repete. Pergunte sempre: existe uma terceira causa? Quem foi ouvido na pesquisa representa todo mundo?`,
      `Sete perguntas numa só tela. Acertando tudo, o projeto está concluído.`],
    ['Tendência é o rumo geral (subindo, caindo, parado). Sazonalidade é um padrão que volta em épocas parecidas, como o Natal.',
      'Correlação é duas coisas andarem juntas; causa é uma provocar a outra. Muitas vezes existe uma terceira causa escondida, como o calor.',
      'Uma boa amostra é sorteada e representa o grupo todo. Para achar o total quando você sabe uma parte e a porcentagem, divida a parte pela porcentagem.']),

  pjQ('melhorando o painel',
    'Você vai melhorar o painel de vendas de uma empresa: ache o que engana e o que atrapalha nos gráficos, escolha títulos que contam algo, pense em quem vai ouvir e transforme números em um insight.',
    [
      mc('O eixo vertical de um gráfico de colunas começa em 90 (e não em 0), e as colunas valem 92 e 100. O que isso causa?', 'Uma diferença pequena parece enorme', ['A diferença desaparece', 'O gráfico fica mais honesto', 'Nada, o eixo não influencia a leitura'], 'Cortar o eixo faz a coluna de 100 parecer muito maior que a de 92, embora a diferença seja de **8%**. Em colunas, o eixo deve começar em **zero**.'),
      multi('O que você tiraria de um gráfico para deixá-lo mais claro?', ['O efeito 3D', 'As cores demais, sem significado', 'As linhas de grade pesadas'], ['O título que diz a conclusão', 'A indicação da fonte dos dados'], 'Retire o que **distrai** (3D, cores demais, grades pesadas). O título que conta algo e a fonte ajudam, então ficam.'),
      mc('Qual destes é um título que CONTA algo?', 'As vendas online cresceram 20% e já são 1 de cada 4 vendas', ['Vendas online', 'Gráfico de vendas por canal', 'Resultados do ano'], 'Um título de conclusão diz **o que o gráfico mostra**. Os outros só dizem o assunto.'),
      match('Ligue cada público ao que ele mais precisa:', [['Diretoria', 'Poucas conclusões e a decisão a tomar'], ['Time técnico', 'O método, os detalhes e as limitações'], ['Cliente final', 'Linguagem simples, sem jargão']], 'A mesma análise é contada de jeitos diferentes: a diretoria quer a **decisão**, o time técnico quer o **método** e o cliente quer **clareza**.'),
      order('Coloque os passos do dado ao insight na ordem:', ['Olhar os números e ver o que chama a atenção', 'Perguntar por que isso acontece', 'Conferir com outros dados se a explicação faz sentido', 'Escrever o insight: o que significa e por que importa'], 'Primeiro **observe**, depois **pergunte por quê**, **confira** com outros dados e só então escreva o insight.'),
      num('Quantos por cento das vendas vêm do canal Online?', 30, 'O total é 60 + 30 + 10 = 100, então o Online (30) responde por **30%**.', { unit: '%', chart: col(CANAL, CANAL_V, { title: 'Vendas por canal (R$ mil)' }), calc: () => 30 / (60 + 30 + 10) * 100 })
    ],
    [`O quinto projeto de Análise de Dados: melhorar um painel. Ele usa as lições 21 a 25: gráficos que enganam, gráfico limpo e claro, títulos que contam algo, conhecer o público e do dado ao insight.`,
      `Um gráfico mal feito pode enganar sem querer. Um bom título, um gráfico limpo e uma fala adaptada ao público fazem a mesma análise ser entendida e usada.`,
      `Pergunte para cada gráfico: o que engana ou distrai? O título diz a conclusão? Quem vai ler precisa de qual nível de detalhe? Siga sempre a ordem: observar, perguntar por quê, conferir e escrever o insight.`,
      `Seis perguntas numa só tela. Acertando tudo, o projeto está concluído.`],
    ['Em gráficos de colunas, o eixo precisa começar em zero. Se ele é cortado, as diferenças parecem maiores do que são.',
      'Tire o que distrai (3D, cores demais, grades pesadas) e mantenha o que ajuda (título de conclusão, fonte).',
      'Diretoria quer a decisão; time técnico quer o método; cliente quer linguagem simples. E um bom insight diz o que os números significam, não só quais são.']),

  pjQ('contando a história completa',
    'Chegou a hora de contar a história inteira: coloque a estrutura da apresentação na ordem, escreva uma recomendação, monte uma tabela do painel, escolha um painel bem feito e pense na ética de mostrar os dados.',
    [
      order('Coloque a estrutura da história na ordem certa:', ['Contexto: por que estamos olhando para isso', 'O problema ou a pergunta', 'O que os dados mostram', 'A recomendação: o que fazer', 'Os próximos passos'], 'Uma boa história tem **começo** (contexto e problema), **meio** (o que os dados mostram) e **fim** (a recomendação e os próximos passos).'),
      write('Escreva uma recomendação para a loja com base nestes números (venda média no Online R$ 21,25 contra R$ 18,75 na loja física).', ['!o que fazer :: invest|ampli|aument|incentiv|promov|priori|foc|expand|divulg|cresc', '!em qual canal :: online', '!por que, com o dado :: ticket|valor medio|venda media|vale mais|21|18|maior|mais|receita'], 'Incentivar o canal Online, porque cada venda lá vale mais, R$ 21,25, do que na loja física', 'Uma recomendação diz **o que fazer** (incentivar), **onde** (Online) e **por quê** (venda mais valiosa).'),
      mc('Qual destas é uma recomendação bem feita?', 'Aumentar em 20% o estoque de lanches em dezembro, porque eles foram 45% das vendas e dezembro é o mês de maior pico', ['Melhorar as vendas', 'Os lanches vendem bem', 'Seria interessante pensar em fazer algo'], 'Uma boa recomendação diz **o que fazer**, **quanto** e **por quê**, apoiada nos dados. As outras são vagas ou só descrevem.'),
      build('Monte uma TABELA com a cidade do cliente e a Quantidade Vendida em cada cidade.', 'loja', FIELDS, MEAS, ['column', 'card', 'table', 'slicer'], { v: 'table', fields: ['Clientes[Cidade]', 'Qtd Vendida'] }, 'Na **tabela** você marca as colunas que quer ver: a cidade e a medida Qtd Vendida.'),
      multi('O que um painel bem montado costuma ter?', ['Poucos visuais, que respondem a pergunta do público', 'Os números mais importantes no alto e à esquerda', 'O mesmo estilo e as mesmas cores em tudo'], ['Um gráfico diferente para cada curiosidade', 'Visuais sem título para ficar mais limpo'], 'Um painel junta **poucos** visuais, com os números principais em destaque e um estilo único. Excesso de gráficos e falta de títulos atrapalham.'),
      mc('Um gráfico mostra só os 3 meses bons do ano e esconde os outros 9. Isso é:', 'Desonesto: escolhe só o que convém', ['Uma boa prática, porque deixa o gráfico mais limpo', 'Aceitável, desde que as cores sejam bonitas', 'Obrigatório em apresentações para a diretoria'], 'Ser honesto é mostrar o que os dados dizem, **inclusive o que não convém**. Escolher só os meses bons engana quem lê.'),
      mc('Antes de publicar um painel com nome e CPF dos clientes, o que fazer?', 'Remover ou ocultar os dados pessoais que não são necessários', ['Publicar mesmo assim, ninguém vai olhar', 'Colocar os dados pessoais em letras maiores', 'Enviar o painel a todos os clientes'], 'Quem conta histórias com dados **protege os dados pessoais**: se a informação não é necessária para a conclusão, ela não deve aparecer.')
    ],
    [`O projeto final de Análise de Dados: contar a história completa. Ele junta as lições 26 a 30: a estrutura da história, da conclusão à recomendação, montar um painel, ética e honestidade e a revisão final.`,
      `Análise sem história não vira decisão. Quem sabe organizar a fala (contexto, problema, dados e recomendação) e agir com honestidade é quem consegue mudar o que a empresa faz.`,
      `Pense como quem vai apresentar: o que o público precisa saber primeiro? O que fazer com esses dados? E o que deve ficar de fora (dados pessoais, escolhas que só convêm)? Na escrita, cite o dado que sustenta a ideia.`,
      `Sete perguntas numa só tela, incluindo uma resposta escrita com as suas palavras. Acertando tudo, você conclui o curso de Análise de Dados!`],
    ['Uma história tem começo (contexto e problema), meio (o que os dados mostram) e fim (a recomendação e os próximos passos).',
      'Uma recomendação responde três perguntas: o que fazer, onde ou com quem, e por quê (com o dado que prova). Use palavras como incentivar, investir ou priorizar.',
      'Ser honesto é mostrar o que os dados dizem, inclusive o que não convém, citar a fonte e proteger dados pessoais.'])
];
