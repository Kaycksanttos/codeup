// PROVAS DE CHECKPOINT E PROVA FINAL DE CADA NÍVEL.
//
// Cada nível tem 30 lições e 3 "provas". Cada uma é UMA tarefa completa (uma consulta SQL ou um programa Python) que junta tudo o que foi aprendido até ali:
//   • Checkpoint depois da lição 10  → 2 chances. Errou as duas: volta 5 lições (6 a 10) para relembrar.
//   • Checkpoint depois da lição 20  → 2 chances. Errou as duas: volta 5 lições (16 a 20) para relembrar.
//   • Prova final (depois da lição 30) → 3 chances. Acertou: passa para o próximo nível. Errou as três: volta 10 lições (21 a 30).
// Sem dica e sem ver a solução (a solução nunca vai para o navegador). Total: 2 cursos x 3 níveis x (2 checkpoints + 1 final) = 18 tarefas.
// As regras (chances e quantas lições voltam) ficam em lessons.js. Para editar: mude aqui, rode `npm run build:content` e `npm test`.
const { LOJA, RH, CLI, VM } = require('./seeds');

const XP = { python: [60, 80, 100], sql: [70, 90, 110] };            // XP de cada checkpoint (a prova final dá o bônus de 50 x nível, no servidor)
const LEVELS = ['Básico', 'Intermediário', 'Avançado'];

// cp(título, tarefa, solução, [palavras obrigatórias], [o que é, para que serve, como se faz, retorno esperado], {seed|prelude|peek})
// fin(...) tem os mesmos parâmetros e é a prova final do nível (depois da lição 30)
const factory = (track, lv, defSeed) => {
  const t = track === 'python' ? 'py' : 'sql'; let k = 0;
  const base = (o, solution) => {
    const r = { type: track, track, level: LEVELS[lv - 1], lv, test: true };
    if (track === 'sql') { r.seed = o.seed || defSeed; r.expectedSql = solution; }
    else { if (o.prelude) r.prelude = o.prelude; if (o.peek) r.peek = o.peek; }
    r.starter = track === 'sql' ? '-- escreva sua consulta aqui\n' : '# escreva seu código aqui\n';
    return r;
  };
  const info = a => ({ oque: a[0], serve: a[1], como: a[2], retorno: a[3] });
  return {
    cp: (title, task, solution, need, inf, o = {}) => {
      k++; const after = k * 10;
      return { id: `cp-${t}-${lv}-${after}`, cp: true, k, after, n: after, xp: XP[track][lv - 1], title, task, ...base(o, solution), need, solution, info: info(inf) };
    },
    fin: (title, task, solution, need, inf, o = {}) =>
      ({ id: `fin-${t}-${lv}`, fin: true, k: 3, after: 30, n: 30, xp: 0, title, task, ...base(o, solution), need, solution, info: info(inf) })
  };
};

const DF = `import pandas as pd, io
df = pd.read_csv(io.StringIO("""produto,categoria,qtd,preco,mes
Notebook,Eletrônicos,2,3500,jan
Mouse,Eletrônicos,10,80,jan
Cadeira,Móveis,1,900,fev
Caneta,Papelaria,50,3,fev
Mouse,Eletrônicos,4,80,mar
Mesa,Móveis,3,650,mar
Caderno,Papelaria,20,18,mar
"""))
`;

const out = [];

// ---------------------------------------------------------------- SQL básico (tabelas da loja)
{
  const P = factory('sql', 1, LOJA);
  out.push(
    P.cp('Checkpoint: filtros', "Mostre o nome e o preço (com o apelido valor) dos produtos das categorias 'Eletrônicos' ou 'Móveis' que custam menos de 1000, exceto o produto de id 4.",
      "SELECT nome, preco AS valor FROM produtos WHERE categoria IN ('Eletrônicos', 'Móveis') AND preco < 1000 AND id <> 4", ['where', 'as valor', 'and'],
      [`É a sua primeira provinha! Você vai escrever uma consulta completa usando o que aprendeu nas lições 1 a 10: escolher colunas, dar um apelido com AS e peneirar as linhas com WHERE, AND, OR/IN e "diferente de".`,
        `Serve para mostrar que você já consegue pedir ao banco de dados exatamente o que precisa, sozinho, sem ter um exemplo pronto para copiar.`,
        `Monte a frase na ordem: SELECT (as colunas e o apelido), FROM (a tabela) e WHERE com todas as regras ligadas por AND. Se usar OR, lembre dos parênteses!`,
        `Uma tabelinha com 2 colunas (nome e valor) e só as linhas que cumprem TODAS as regras.`]),
    P.cp('Checkpoint: ranking e busca', 'Mostre o nome e o preço dos 3 produtos mais caros entre os que custam de 100 a 4000 (inclusive) e têm a letra e no nome. O mais caro vem primeiro.',
      "SELECT nome, preco FROM produtos WHERE preco BETWEEN 100 AND 4000 AND nome LIKE '%e%' ORDER BY preco DESC LIMIT 3", ['between', 'like', 'order by', 'desc', 'limit'],
      [`Aqui você monta um ranking: separa os produtos por uma faixa de preço, procura um pedacinho no nome e fica só com os 3 primeiros. Vale tudo o que você aprendeu nas lições 1 a 20.`,
        `Serve para fazer listas "Top 3" (os mais caros, os mais vendidos) e para procurar coisas pelo nome, o que se faz o tempo todo.`,
        `Primeiro peneire com o WHERE (BETWEEN para a faixa de preço e LIKE para a letra), depois coloque em fila com ORDER BY ... DESC e só no final corte com LIMIT. A ordem das palavras importa!`,
        `Uma tabelinha com 2 colunas (nome e preco) e exatamente 3 linhas, do preço mais alto para o mais baixo.`]),
    P.fin('Prova final: resumo por categoria', 'Considere só os produtos com estoque maior que 0. Para cada categoria, mostre: a categoria, quantos produtos ela tem (total), o preço médio arredondado em 2 casas (media) e o valor total parado em estoque, preço vezes estoque somados (valor_estoque). Mostre só as categorias com 3 produtos ou mais, da maior para a menor valor_estoque.',
      'SELECT categoria, COUNT(*) AS total, ROUND(AVG(preco), 2) AS media, SUM(preco * estoque) AS valor_estoque FROM produtos WHERE estoque > 0 GROUP BY categoria HAVING COUNT(*) >= 3 ORDER BY valor_estoque DESC',
      ['where', 'group by', 'having', 'round(', 'avg(', 'sum(', 'order by'],
      [`É a PROVA FINAL do nível Básico: um relatório completo que usa tudo o que você aprendeu desde a lição 1. Peneirar linhas, fazer contas nas colunas, contar, somar, tirar média, agrupar e ordenar.`,
        `É o tipo de relatório que uma pessoa analista entrega de verdade: um resumo por grupo, já filtrado e em ordem. Passando aqui, você abre o nível Intermediário!`,
        `Peneire as linhas com WHERE, separe em montinhos com GROUP BY, calcule COUNT, AVG e SUM, escolha os grupos com HAVING e ordene com ORDER BY usando o apelido da coluna.`,
        `Uma tabelinha com 4 colunas (categoria, total, media e valor_estoque) e uma linha para cada categoria que passou no HAVING, do maior valor_estoque para o menor.`])
  );
}

// ---------------------------------------------------------------- SQL intermediário (JOIN, subconsulta, CASE, datas)
{
  const P = factory('sql', 2, LOJA);
  out.push(
    P.cp('Checkpoint: receita por produto', 'Mostre o nome de cada produto vendido, as unidades vendidas (soma de qtd, apelido unidades) e a receita (soma de preco vezes qtd, apelido receita). Só entram produtos com receita acima de 1500, da maior para a menor receita.',
      'SELECT p.nome, SUM(v.qtd) AS unidades, SUM(p.preco * v.qtd) AS receita FROM vendas v JOIN produtos p ON p.id = v.produto_id GROUP BY p.nome HAVING SUM(p.preco * v.qtd) > 1500 ORDER BY receita DESC',
      ['join', 'group by', 'having', 'sum(', 'order by'],
      [`Uma consulta que junta duas tabelas (vendas e produtos) e faz um resumo por produto. Reúne o que você aprendeu nas lições 1 a 10 do nível: JOIN, apelidos de tabela, GROUP BY e ordenação.`,
        `Os dados de verdade ficam espalhados em várias listas. Juntar e resumir é a base de qualquer relatório de vendas.`,
        `Cole as tabelas com JOIN ... ON, agrupe pelo nome do produto, some com SUM(preco * qtd), escolha os grupos com HAVING e ordene pelo apelido receita.`,
        `Uma tabelinha com 3 colunas (nome, unidades e receita) e uma linha para cada produto que rendeu mais de 1500, da maior receita para a menor.`]),
    P.cp('Checkpoint: perfil de clientes', "Considere só os pedidos com status 'pago'. Mostre o nome de cada cliente, o total pago (soma de valor, apelido total_pago) e uma coluna perfil com 'VIP' se o total pago for 600 ou mais e 'comum' nos outros casos. Do maior para o menor total_pago.",
      "SELECT c.nome, SUM(p.valor) AS total_pago, CASE WHEN SUM(p.valor) >= 600 THEN 'VIP' ELSE 'comum' END AS perfil FROM clientes c JOIN pedidos p ON p.cliente_id = c.id WHERE p.status = 'pago' GROUP BY c.nome ORDER BY total_pago DESC",
      ['join', 'where', 'group by', 'case', 'when'],
      [`Uma consulta que junta clientes e pedidos, olha só os pedidos pagos e dá uma etiqueta para cada cliente com o CASE WHEN ("se... então..."). Vale tudo das lições 1 a 20.`,
        `Colocar clientes em grupos (VIP, comum...) é a base das promoções e das análises de quem mais compra.`,
        `Faça o JOIN entre clientes e pedidos, peneire o status com WHERE, agrupe por cliente, some o valor e crie a coluna perfil com CASE WHEN ... THEN ... ELSE ... END.`,
        `Uma tabelinha com 3 colunas (nome, total_pago e perfil), uma linha para cada cliente que tem pedido pago, do maior total para o menor.`], { seed: CLI }),
    P.fin('Prova final: resumo por estado', "Considere só os pedidos com status 'pago'. Para cada estado, mostre: o estado, a quantidade de pedidos (pedidos), o total pago (total), o ticket médio, que é a média do valor dos pedidos, arredondada em 1 casa (ticket), e uma coluna classe com 'forte' se o total for 2000 ou mais e 'em crescimento' nos outros casos. Mostre só os estados com total acima de 900, do maior para o menor total.",
      "SELECT c.estado, COUNT(*) AS pedidos, SUM(p.valor) AS total, ROUND(AVG(p.valor), 1) AS ticket, CASE WHEN SUM(p.valor) >= 2000 THEN 'forte' ELSE 'em crescimento' END AS classe FROM clientes c JOIN pedidos p ON p.cliente_id = c.id WHERE p.status = 'pago' GROUP BY c.estado HAVING SUM(p.valor) > 900 ORDER BY total DESC",
      ['join', 'where', 'group by', 'having', 'case', 'round(', 'avg(', 'order by'],
      [`É a PROVA FINAL do nível Intermediário: um relatório de gerente que junta tabelas, peneira, agrupa, dá etiquetas com CASE e arredonda. Usa tudo o que você aprendeu desde a lição 1.`,
        `É o formato de um painel de vendas por região. Passando aqui, você abre o nível Avançado!`,
        `Use JOIN para ligar as tabelas, WHERE para os pedidos pagos, GROUP BY estado, COUNT, SUM e AVG para as contas, CASE para a classe, HAVING para escolher os estados e ORDER BY para a fila.`,
        `Uma tabelinha com 5 colunas (estado, pedidos, total, ticket e classe) e uma linha para cada estado que passou no HAVING, do maior total para o menor.`], { seed: CLI })
  );
}

// ---------------------------------------------------------------- SQL avançado (CTE, janelas, EXISTS)
{
  const P = factory('sql', 3, RH);
  out.push(
    P.cp('Checkpoint: acima da média', "Mostre o nome, o salário e o nome do gerente (apelido gerente, ou 'Sem gerente' quando não tiver) de cada funcionário que ganha mais que a média salarial do próprio departamento. Ordene pelo nome do funcionário.",
      "WITH media AS (SELECT depto_id, AVG(salario) AS m FROM funcionarios GROUP BY depto_id) SELECT f.nome, f.salario, COALESCE(g.nome, 'Sem gerente') AS gerente FROM funcionarios f JOIN media ON media.depto_id = f.depto_id LEFT JOIN funcionarios g ON g.id = f.gerente_id WHERE f.salario > media.m ORDER BY f.nome",
      ['left join', 'coalesce(', 'avg('],
      [`Uma consulta avançada que compara cada pessoa com a média do departamento dela e ainda descobre o gerente de cada uma na mesma tabela (a auto-junção). Reúne as lições 1 a 10 do nível: CTE, subconsulta, auto-junção e COALESCE.`,
        `Comparar cada um com a média do próprio grupo é um clássico da análise de dados: quem está acima do normal?`,
        `Calcule a média por departamento numa CTE (ou numa subconsulta), junte com funcionarios, faça um LEFT JOIN da tabela com ela mesma para achar o gerente e troque o vazio por 'Sem gerente' com COALESCE.`,
        `Uma tabelinha com 3 colunas (nome, salario e gerente), uma linha para cada pessoa que ganha acima da média do departamento, em ordem alfabética.`]),
    P.cp('Checkpoint: variação e acumulado', "Só para os vendedores 'Ana' e 'Carla': mostre vendedor, mes, valor, a variação em relação ao mês anterior do mesmo vendedor (variacao) e a soma acumulada dos valores do vendedor até aquele mês (acumulado). Ordene por vendedor e mes.",
      "SELECT vendedor, mes, valor, valor - LAG(valor) OVER (PARTITION BY vendedor ORDER BY mes) AS variacao, SUM(valor) OVER (PARTITION BY vendedor ORDER BY mes) AS acumulado FROM vendas_mes WHERE vendedor IN ('Ana', 'Carla') ORDER BY vendedor, mes",
      ['lag(', 'sum(', 'over', 'partition by'],
      [`Uma consulta com funções de janela que mede como cada vendedor foi evoluindo mês a mês. Vale tudo das lições 1 a 20, principalmente LAG, SUM OVER e PARTITION BY.`,
        `Mostra se as vendas cresceram ou caíram a cada mês e quanto já foi vendido até agora, sem perder nenhuma linha.`,
        `Use LAG(valor) OVER (PARTITION BY vendedor ORDER BY mes) para o mês anterior e SUM(valor) OVER (PARTITION BY vendedor ORDER BY mes) para o acumulado. Escolha os vendedores com WHERE.`,
        `Uma tabelinha com 5 colunas (vendedor, mes, valor, variacao e acumulado) e 12 linhas. Na primeira linha de cada vendedor, a variacao fica vazia (NULL), porque não existe mês anterior.`], { seed: VM }),
    P.fin('Prova final: painel de funcionários', 'Considere só os funcionários com salário cadastrado. Mostre: o departamento (apelido departamento, o nome dele), o nome do funcionário, o salário, o gerente (apelido gerente, ou "Sem gerente" quando não tiver), a posição do salário dentro do departamento (pos_depto, com RANK, do maior para o menor) e a diferença para a média do departamento arredondada sem casas decimais (dif). Ordene por departamento e pos_depto.',
      "SELECT d.nome AS departamento, f.nome, f.salario, COALESCE(g.nome, 'Sem gerente') AS gerente, RANK() OVER (PARTITION BY f.depto_id ORDER BY f.salario DESC) AS pos_depto, ROUND(f.salario - AVG(f.salario) OVER (PARTITION BY f.depto_id), 0) AS dif FROM funcionarios f JOIN departamentos d ON d.id = f.depto_id LEFT JOIN funcionarios g ON g.id = f.gerente_id WHERE f.salario IS NOT NULL ORDER BY departamento, pos_depto",
      ['join', 'left join', 'coalesce(', 'rank(', 'avg(', 'over', 'partition by', 'round('],
      [`É a PROVA FINAL do nível Avançado: um painel completo de RH que junta tabelas, acha o gerente de cada pessoa na mesma tabela, trata os campos vazios e calcula posição e média com funções de janela. Usa tudo desde a lição 1.`,
        `É o tipo de análise que responde "quem ganha mais em cada departamento e quanto cada pessoa está acima ou abaixo da média?". Passando aqui, você conclui o curso de SQL!`,
        `JOIN com departamentos, LEFT JOIN da tabela com ela mesma para o gerente, COALESCE para o 'Sem gerente', RANK() e AVG() com OVER (PARTITION BY ...), ROUND para a diferença, WHERE para o salário e ORDER BY no final.`,
        `Uma tabelinha com 6 colunas (departamento, nome, salario, gerente, pos_depto e dif) e uma linha para cada pessoa com salário, separada por departamento e na ordem da posição.`])
  );
}

// ---------------------------------------------------------------- Python básico
{
  const P = factory('python', 1, null);
  out.push(
    P.cp('Checkpoint: nota fiscal', 'As variáveis produto, preco e qtd já existem, mas preco e qtd são TEXTO. Converta para número, calcule o total (preco vezes qtd) e imprima exatamente: 4 x Caneta = R$ 14.0 (use uma f-string).',
      'total = float(preco) * int(qtd)\nprint(f"{qtd} x {produto} = R$ {total}")', ['float(', 'int(', 'print('],
      [`Um programa curtinho que junta o que você aprendeu nas lições 1 a 10: variáveis (as caixinhas), tipos, transformar texto em número com int() e float(), contas e f-strings.`,
        `Os dados chegam como texto o tempo todo (formulários, arquivos). Saber transformar em número e fazer a conta é o primeiro passo de qualquer programa.`,
        `Transforme cada valor (float(preco) e int(qtd)), guarde o total numa variável e monte a frase com uma f-string: f"...{variavel}...".`,
        `Uma única linha de texto, exatamente assim: 4 x Caneta = R$ 14.0`],
      { prelude: 'produto = "Caneta"\npreco = "3.5"\nqtd = "4"', peek: 'print(produto, preco, qtd)' }),
    P.cp('Checkpoint: boletim', 'A variável nome tem espaços sobrando nas pontas e notas é uma lista de 3 notas. Na 1ª linha, imprima o nome sem os espaços e em maiúsculas. Na 2ª linha, calcule a média (some as 3 notas e divida por 3) e imprima Aprovado se for 7 ou mais, Recuperação se for 5 ou mais, e Reprovado nos outros casos.',
      'print(nome.strip().upper())\nmedia = (notas[0] + notas[1] + notas[2]) / 3\nif media >= 7:\n    print("Aprovado")\nelif media >= 5:\n    print("Recuperação")\nelse:\n    print("Reprovado")', ['strip(', 'upper(', 'if ', 'elif', 'print('],
      [`Um programa que limpa um texto, lê itens de uma lista e toma uma decisão. Vale tudo das lições 1 a 20: textos, listas, comparações e if / elif / else.`,
        `Todo sistema que classifica alguém ou alguma coisa (aprovado, VIP, atrasado) faz isto: calcula um número e decide pelo valor dele.`,
        `Use nome.strip().upper() para limpar o nome. Pegue cada nota pela posição (notas[0], notas[1]...), calcule a média e faça if / elif / else, começando pelo limite maior.`,
        `Duas linhas: o nome limpo, MARIANA, e embaixo a classificação da média.`],
      { prelude: 'nome = "  mariana  "\nnotas = [8, 5.5, 6]', peek: 'print(repr(nome))\nprint(notas)' }),
    P.fin('Prova final: semana de vendas', 'A lista vendas guarda quanto se vendeu em cada dia da semana. Use um laço para contar os "dias bons" (vendas acima de 100) e somar o que foi vendido nesses dias. Imprima na 1ª linha, exatamente neste formato: Dias bons: 3 | Total: 450 | Maior: 220 | Menor: 40 (o maior e o menor valem para TODOS os dias). Na 2ª linha, imprima Semana ótima se o total dos dias bons passar de 400, senão Semana normal.',
      'dias_bons = 0\ntotal = 0\nfor v in vendas:\n    if v > 100:\n        dias_bons += 1\n        total += v\nprint(f"Dias bons: {dias_bons} | Total: {total} | Maior: {max(vendas)} | Menor: {min(vendas)}")\nif total > 400:\n    print("Semana ótima")\nelse:\n    print("Semana normal")', ['for ', 'if ', 'max(', 'min(', 'print('],
      [`É a PROVA FINAL do nível Básico: um programa de verdade que anda por uma lista, vai somando e contando, toma decisões e usa funções prontas. Usa tudo o que você aprendeu desde a lição 1.`,
        `Resumir uma lista de números (contar, somar, achar o maior e o menor) é o dia a dia de quem analisa dados. Passando aqui, você abre o nível Intermediário!`,
        `Crie os "cofrinhos" que começam em 0, ande pela lista com for, use um if dentro do repetidor e depois mostre tudo com uma f-string, usando max() e min(). Termine com if / else.`,
        `Duas linhas de texto: o resumo no formato pedido e, embaixo, a classificação da semana.`],
      { prelude: 'vendas = [120, 40, 90, 220, 110, 60, 95]', peek: 'print(vendas)' })
  );
}

// ---------------------------------------------------------------- Python intermediário
{
  const P = factory('python', 2, null);
  out.push(
    P.cp('Checkpoint: ranking de aprovados', 'As listas nomes e notas andam juntas (a mesma posição é da mesma pessoa). Com zip e uma compreensão de lista, monte uma lista de tuplas (nota, nome) só de quem tirou 6 ou mais. Ordene da maior nota para a menor (sorted com reverse=True) e imprima uma linha por pessoa, numerada a partir de 1, neste formato: 1. Carla - 9',
      'aprovados = [(x, n) for n, x in zip(nomes, notas) if x >= 6]\nfor i, (x, n) in enumerate(sorted(aprovados, reverse=True), 1):\n    print(f"{i}. {n} - {x}")', ['zip(', 'enumerate(', 'sorted(', 'for '],
      [`Um programa que junta duas listas, escolhe só alguns itens, coloca em ordem e numera o resultado. Reúne as lições 1 a 10 do nível: zip, enumerate, compreensão de lista, sorted e tuplas.`,
        `Montar um ranking a partir de dados que estão separados é uma das tarefas mais comuns ao analisar resultados.`,
        `Una as listas com zip, escolha com um if dentro da compreensão, ordene com sorted(..., reverse=True) e percorra com enumerate(..., 1) para numerar a partir de 1.`,
        `Três linhas, da maior nota para a menor, no formato "posição. nome - nota".`],
      { prelude: 'nomes = ["Ana", "Bruno", "Carla", "Davi", "Eva"]\nnotas = [8, 5, 9, 4, 6]', peek: 'print(nomes)\nprint(notas)' }),
    P.cp('Checkpoint: contador de palavras', 'A variável frase tem um texto. Conte quantas vezes cada palavra aparece (ignorando maiúsculas e minúsculas) usando um dicionário. Imprima, em ordem alfabética, só as palavras que aparecem mais de uma vez, no formato ola: 3. Na última linha imprima Palavras diferentes: 4 (com o número certo).',
      'palavras = frase.lower().split()\ncontagem = {}\nfor p in palavras:\n    contagem[p] = contagem.get(p, 0) + 1\nfor p in sorted(contagem):\n    if contagem[p] > 1:\n        print(f"{p}: {contagem[p]}")\nprint(f"Palavras diferentes: {len(set(palavras))}")', ['split(', 'get(', 'sorted(', 'print('],
      [`Um programa que quebra um texto em palavras, conta cada uma usando um dicionário e usa conjuntos. Vale tudo das lições 1 a 20: split, get, set, sorted e f-strings.`,
        `Contar quantas vezes cada coisa aparece é a base de qualquer análise de texto, de registros e de pesquisas.`,
        `Use frase.lower().split() para ter a lista de palavras, conte com contagem[p] = contagem.get(p, 0) + 1, ponha as palavras em ordem com sorted() e conte as diferentes com len(set(...)).`,
        `Três linhas: as duas palavras que se repetem, em ordem alfabética e com a contagem, e embaixo o total de palavras diferentes.`],
      { prelude: 'frase = "Ola mundo ola Python mundo OLA dados"', peek: 'print(frase)' }),
    P.fin('Prova final: total por produto', 'A lista pedidos tem textos no formato "produto:quantidade", e alguns têm quantidade inválida. Crie a função total_por_produto(lista) que devolve um dicionário com a soma das quantidades de cada produto, ignorando os registros inválidos (use try/except). Depois, em ordem alfabética, imprima uma linha por produto no formato mouse: 7 e, na última linha, Mais vendido: seguido do nome do produto com maior total.',
      'def total_por_produto(lista):\n    totais = {}\n    for item in lista:\n        nome, qtd = item.split(":")\n        try:\n            totais[nome] = totais.get(nome, 0) + int(qtd)\n        except ValueError:\n            pass\n    return totais\n\ntotais = total_por_produto(pedidos)\nfor nome in sorted(totais):\n    print(f"{nome}: {totais[nome]}")\nprint("Mais vendido:", max(totais, key=totais.get))', ['def ', 'try', 'except', 'split(', 'sorted(', 'print('],
      [`É a PROVA FINAL do nível Intermediário: uma função completa que lê dados bagunçados, não se assusta com os erros e monta um relatório. Usa tudo o que você aprendeu desde a lição 1.`,
        `Dados de verdade vêm sujos. Saber ignorar o que está errado sem derrubar o programa é essencial. Passando aqui, você abre o nível Avançado!`,
        `Dentro da função: ande pela lista, separe com split(":"), tente somar com int() dentro de try / except ValueError e devolva o dicionário. Fora dela: sorted() para a ordem e max(totais, key=totais.get) para achar o campeão.`,
        `Quatro linhas: monitor: 1, mouse: 7, teclado: 6 e Mais vendido: mouse.`],
      { prelude: 'pedidos = ["mouse:3", "teclado:2", "mouse:x", "monitor:1", "teclado:4", "cabo:", "mouse:4"]', peek: 'print(pedidos)' })
  );
}

// ---------------------------------------------------------------- Python avançado
{
  const P = factory('python', 3, null);
  out.push(
    P.cp('Checkpoint: produtos perecíveis', 'Crie a classe Produto com __init__(nome, preco) e __str__ devolvendo "nome - R$ preco". Crie a classe Perecivel, filha de Produto, com __init__(nome, preco, dias) usando super() e a @property vencido, que é True quando dias for menor que 0. Percorra Perecivel("Leite", 6, 2) e Perecivel("Iogurte", 4, -1) e, para cada um, imprima o produto e, embaixo, o valor de vencido.',
      'class Produto:\n    def __init__(self, nome, preco):\n        self.nome = nome\n        self.preco = preco\n    def __str__(self):\n        return f"{self.nome} - R$ {self.preco}"\n\nclass Perecivel(Produto):\n    def __init__(self, nome, preco, dias):\n        super().__init__(nome, preco)\n        self.dias = dias\n    @property\n    def vencido(self):\n        return self.dias < 0\n\nfor p in [Perecivel("Leite", 6, 2), Perecivel("Iogurte", 4, -1)]:\n    print(p)\n    print(p.vencido)', ['class produto', 'class perecivel', 'super()', '@property', '__str__'],
      [`Um programa com classes (os moldes) e herança (a filha herda da mãe). Reúne as lições 1 a 10 do nível: classe, __init__, métodos, __str__, herança, super() e @property.`,
        `Classes organizam programas grandes: cada coisa do mundo real (produto, cliente, conta) vira um molde que dá para usar de novo e de novo.`,
        `Escreva primeiro a classe Produto. Depois, class Perecivel(Produto), chame super().__init__(nome, preco) para aproveitar a mãe e crie a property vencido, que devolve uma comparação (verdadeiro ou falso).`,
        `Quatro linhas: Leite - R$ 6, False, Iogurte - R$ 4 e True.`]),
    P.cp('Checkpoint: decorator de registro', 'Crie o decorator registrar: toda vez que a função decorada for chamada, ele imprime "chamou" e o nome da função (por exemplo: chamou soma_quadrados) e devolve o resultado normal dela. Decore a função soma_quadrados(n), que usa uma generator expression para devolver a soma dos quadrados de 1 até n, e imprima soma_quadrados(3) e soma_quadrados(4).',
      'def registrar(f):\n    def novo(*args, **kwargs):\n        print("chamou " + f.__name__)\n        return f(*args, **kwargs)\n    return novo\n\n@registrar\ndef soma_quadrados(n):\n    return sum(x * x for x in range(1, n + 1))\n\nprint(soma_quadrados(3))\nprint(soma_quadrados(4))', ['def registrar', '@registrar', 'sum(', 'for '],
      [`Um programa que cria um decorator (um "embrulho" para funções) e usa uma generator expression. Vale tudo das lições 1 a 20: funções dentro de funções, *args/**kwargs, decorators e geradores.`,
        `Decorators acrescentam comportamento (como anotar um aviso, medir o tempo ou guardar respostas) sem mexer no código da função original.`,
        `Escreva registrar(f) com uma função de dentro que recebe *args e **kwargs, mostra o aviso e devolve f(*args, **kwargs). Depois use @registrar em cima da função e sum(x * x for x in range(...)) dentro dela.`,
        `Quatro linhas: chamou soma_quadrados, 14, chamou soma_quadrados e 30.`]),
    P.fin('Prova final: relatório com pandas', 'O DataFrame df tem as colunas produto, categoria, qtd, preco e mes. Crie a coluna total (qtd vezes preco). Imprima uma linha por categoria, da maior receita para a menor, no formato Eletrônicos: R$ 8120 em 3 vendas (receita da categoria e número de linhas dela). Na última linha imprima Melhor mês: seguido do mês com maior receita.',
      'df["total"] = df["qtd"] * df["preco"]\nr = df.groupby("categoria")["total"].agg(["sum", "count"]).sort_values("sum", ascending=False)\nfor cat, linha in r.iterrows():\n    print(f"{cat}: R$ {int(linha[\'sum\'])} em {int(linha[\'count\'])} vendas")\npor_mes = df.groupby("mes")["total"].sum()\nprint(f"Melhor mês: {por_mes.idxmax()}")', ['groupby(', 'print('],
      [`É a PROVA FINAL do nível Avançado: uma análise de dados completa com pandas, que cria colunas, agrupa, ordena e resume uma tabela. Usa tudo o que você aprendeu desde a lição 1.`,
        `É o trabalho de uma pessoa analista: transformar uma tabela solta em respostas de verdade (qual categoria rende mais? qual mês foi o melhor?). Passando aqui, você conclui o curso de Python!`,
        `Crie a coluna total, agrupe por categoria com groupby e agg (soma e contagem), ordene com sort_values, percorra com iterrows() e mostre com f-string. Para o mês, use groupby("mes") e idxmax().`,
        `Quatro linhas: as três categorias, da maior para a menor receita, e embaixo o melhor mês.`],
      { prelude: DF, peek: 'print(df)' })
  );
}

module.exports = out;
