// CHECKPOINTS: a cada 5 lições (5, 10, 15, 20 e 25) de cada nível aparece uma parada especial no mapa, com um desafio NOVO
// que mistura os comandos das 5 lições anteriores. É opcional (não trava o caminho), dá XP extra e vale para SQL e Python.
// Total: 2 trilhas x 3 níveis x 5 checkpoints = 30 desafios. Para editar: mude aqui, rode `npm run build:content` e `npm test`.
const { LOJA, RH, CLI, VM, WEB } = require('./seeds');

const XP = { python: [30, 40, 50], sql: [35, 45, 55] };
const LEVELS = ['Básico', 'Intermediário', 'Avançado'];

// P(título, tarefa, solução, [palavras obrigatórias], dica, {seed|prelude|peek})
const factory = (track, lv, defSeed) => {
  const t = track === 'python' ? 'py' : 'sql'; let k = 0;
  return (title, task, solution, need, hint, o = {}) => {
    k++;
    const r = { id: `cp-${t}-${lv}-${k}`, cp: true, k, after: k * 5, n: k * 5, type: track, track, level: LEVELS[lv - 1], lv, xp: XP[track][lv - 1], title, task };
    if (track === 'sql') { r.seed = o.seed || defSeed; r.expectedSql = solution; }
    else { if (o.prelude) r.prelude = o.prelude; if (o.peek) r.peek = o.peek; }
    r.starter = track === 'sql' ? '-- escreva sua consulta aqui\n' : '# escreva seu código aqui\n';
    return { ...r, need, hints: [hint, solution], solution };
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
    P('Filtrar e renomear', 'Mostre o nome e o preço (com o apelido valor) dos produtos da categoria Móveis.',
      "SELECT nome, preco AS valor FROM produtos WHERE categoria = 'Móveis'", ['select', 'from produtos', 'where', ' as '], "SELECT nome, preco AS valor FROM produtos WHERE categoria = 'Móveis'"),
    P('Vários filtros juntos', 'Mostre o nome e a categoria dos produtos que NÃO são da categoria Papelaria e que custam menos de 1000.',
      "SELECT nome, categoria FROM produtos WHERE categoria <> 'Papelaria' AND preco < 1000", ['select', 'from produtos', 'where', ' and '], "Use <> para 'diferente de' e AND para juntar as duas condições."),
    P('Faixa de preço ordenada', 'Mostre o nome e o preço dos produtos que custam de 80 a 1000 (inclusive), do mais caro para o mais barato.',
      'SELECT nome, preco FROM produtos WHERE preco BETWEEN 80 AND 1000 ORDER BY preco DESC', ['select', 'from produtos', 'between', 'order by', 'desc'], 'WHERE preco BETWEEN 80 AND 1000 ORDER BY preco DESC'),
    P('Categorias sem repetir', 'Mostre as categorias diferentes (sem repetir), em ordem alfabética, mas só as 2 primeiras.',
      'SELECT DISTINCT categoria FROM produtos ORDER BY categoria LIMIT 2', ['select distinct', 'from produtos', 'order by', 'limit'], 'SELECT DISTINCT categoria FROM produtos ORDER BY categoria LIMIT 2'),
    P('Resumo por categoria', 'Para cada categoria, mostre a categoria, a quantidade de produtos (apelido total) e o maior preço (apelido maior).',
      'SELECT categoria, COUNT(*) AS total, MAX(preco) AS maior FROM produtos GROUP BY categoria', ['select', 'from produtos', 'group by', 'count(', 'max('], 'SELECT categoria, COUNT(*) AS total, MAX(preco) AS maior FROM produtos GROUP BY categoria')
  );
}

// ---------------------------------------------------------------- SQL intermediário (JOIN, subconsulta, CASE, datas)
{
  const P = factory('sql', 2, LOJA);
  out.push(
    P('Os 2 mais vendidos', 'Mostre o nome do produto e o total vendido (soma de qtd, apelido total) dos 2 produtos que mais venderam, do maior para o menor.',
      'SELECT p.nome, SUM(v.qtd) AS total FROM vendas v JOIN produtos p ON p.id = v.produto_id GROUP BY p.nome ORDER BY total DESC LIMIT 2', ['join', 'group by', 'sum(', 'order by', 'limit'],
      'JOIN vendas com produtos, GROUP BY p.nome, SUM(v.qtd), ORDER BY total DESC e LIMIT 2.'),
    P('Departamentos, até os vazios', 'Mostre o nome de cada departamento e quantos funcionários ele tem (apelido total). Departamentos sem ninguém devem aparecer com 0.',
      'SELECT d.nome, COUNT(f.id) AS total FROM departamentos d LEFT JOIN funcionarios f ON f.depto_id = d.id GROUP BY d.nome', ['left join', 'group by', 'count('],
      'LEFT JOIN mantém os departamentos sem funcionário. Conte f.id (e não *) para dar 0 neles.', { seed: RH }),
    P('Clientes que já pagaram', 'Mostre o nome dos clientes que têm pelo menos um pedido com status pago (sem repetir cliente).',
      "SELECT nome FROM clientes WHERE id IN (SELECT cliente_id FROM pedidos WHERE status = 'pago')", ['select', 'clientes', 'pedidos', 'pago'],
      "Uma subconsulta: WHERE id IN (SELECT cliente_id FROM pedidos WHERE status = 'pago').", { seed: CLI }),
    P('Caro ou barato', "Mostre o nome do produto e uma coluna faixa com o texto 'caro' se o preço for 1000 ou mais e 'barato' nos outros casos.",
      "SELECT nome, CASE WHEN preco >= 1000 THEN 'caro' ELSE 'barato' END AS faixa FROM produtos", ['case', 'when', 'then', 'else', 'end'],
      "CASE WHEN preco >= 1000 THEN 'caro' ELSE 'barato' END AS faixa"),
    P('Vendas por mês', 'Mostre o mês (no formato AAAA-MM, apelido mes) e quantas vendas aconteceram em cada mês (apelido total).',
      "SELECT strftime('%Y-%m', data) AS mes, COUNT(*) AS total FROM vendas GROUP BY mes", ['strftime', 'group by', 'count('],
      "strftime('%Y-%m', data) corta a data no formato AAAA-MM; depois é só GROUP BY mes.")
  );
}

// ---------------------------------------------------------------- SQL avançado (CTE, janelas, EXISTS)
{
  const P = factory('sql', 3, RH);
  out.push(
    P('Acima da média com CTE', 'Use uma CTE (WITH) para calcular o salário médio (apelido media) e mostre o nome e o salário de quem ganha acima dessa média.',
      'WITH m AS (SELECT AVG(salario) AS media FROM funcionarios) SELECT f.nome, f.salario FROM funcionarios f, m WHERE f.salario > m.media', ['with', 'avg(', 'select', 'from funcionarios'],
      'WITH m AS (SELECT AVG(salario) AS media FROM funcionarios) e depois compare salario > m.media.'),
    P('Ranking de salários', 'Numere os funcionários do maior para o menor salário com ROW_NUMBER (coluna posicao). Mostre posicao, nome e salario.',
      'SELECT ROW_NUMBER() OVER (ORDER BY salario DESC) AS posicao, nome, salario FROM funcionarios', ['row_number()', 'over', 'order by', 'desc'],
      'ROW_NUMBER() OVER (ORDER BY salario DESC) AS posicao'),
    P('Soma acumulada por vendedor', 'Mostre vendedor, mes, valor e a soma acumulada dos valores de cada vendedor até aquele mês (apelido acumulado). Ordene por vendedor e mes.',
      'SELECT vendedor, mes, valor, SUM(valor) OVER (PARTITION BY vendedor ORDER BY mes) AS acumulado FROM vendas_mes ORDER BY vendedor, mes', ['sum(', 'over', 'partition by', 'order by'],
      'SUM(valor) OVER (PARTITION BY vendedor ORDER BY mes) AS acumulado', { seed: VM }),
    P('Variação mês a mês', 'Mostre vendedor, mes, valor e a variação em relação ao mês anterior do mesmo vendedor (apelido variacao, use LAG). Ordene por vendedor e mes.',
      'SELECT vendedor, mes, valor, valor - LAG(valor) OVER (PARTITION BY vendedor ORDER BY mes) AS variacao FROM vendas_mes ORDER BY vendedor, mes', ['lag(', 'over', 'partition by'],
      'valor - LAG(valor) OVER (PARTITION BY vendedor ORDER BY mes) AS variacao', { seed: VM }),
    P('Usuários ativos por dia', 'Mostre cada data de acesso e quantos usuários diferentes acessaram nela (apelido ativos), em ordem de data.',
      'SELECT data, COUNT(DISTINCT usuario_id) AS ativos FROM acessos GROUP BY data ORDER BY data', ['count(distinct', 'group by', 'order by'],
      'COUNT(DISTINCT usuario_id) AS ativos ... GROUP BY data ORDER BY data', { seed: WEB })
  );
}

// ---------------------------------------------------------------- Python básico
{
  const P = factory('python', 1, null);
  out.push(
    P('Variáveis e contas', 'Crie as variáveis preco = 20 e qtd = 3 e imprima o total (preco vezes qtd).',
      'preco = 20\nqtd = 3\nprint(preco * qtd)', ['print(', '*'], 'Duas variáveis e um print(preco * qtd).'),
    P('Frase com f-string', 'Crie nome = "Ana" e idade = 25 e imprima exatamente: Ana tem 25 anos (use uma f-string).',
      'nome = "Ana"\nidade = 25\nprint(f"{nome} tem {idade} anos")', ['print(', '{'], 'print(f"{nome} tem {idade} anos")'),
    P('Limpando um texto', 'A variável texto já existe. Imprima o texto sem os espaços das pontas e em minúsculas (1ª linha). Na 2ª linha, imprima True se esse texto limpo tem mais de 5 letras.',
      'limpo = texto.strip().lower()\nprint(limpo)\nprint(len(limpo) > 5)', ['strip(', 'lower(', 'len(', 'print('], 'texto.strip().lower() limpa o texto; len(limpo) > 5 dá True ou False.',
      { prelude: 'texto = "  Code Up  "', peek: 'print(repr(texto))' }),
    P('Primeira nota e decisão', 'A lista notas já existe. Imprima a primeira nota. Depois imprima Aprovado se a segunda nota for 6 ou mais; senão, imprima Recuperação.',
      'print(notas[0])\nif notas[1] >= 6:\n    print("Aprovado")\nelse:\n    print("Recuperação")', ['[0]', 'if ', 'else', 'print('], 'notas[0] é a primeira; notas[1] é a segunda. Depois um if/else.',
      { prelude: 'notas = [8, 5, 9]', peek: 'print(notas)' }),
    P('Somando com for', 'A lista numeros já existe. Some todos os números usando um for e imprima o total.',
      'total = 0\nfor n in numeros:\n    total += n\nprint(total)', ['for ', 'print('], 'Comece com total = 0 e some cada n dentro do for.',
      { prelude: 'numeros = [3, 8, 12, 5]', peek: 'print(numeros)' })
  );
}

// ---------------------------------------------------------------- Python intermediário
{
  const P = factory('python', 2, null);
  out.push(
    P('Quadrados dos pares', 'A lista numeros já existe. Com uma compreensão de lista, imprima a lista dos quadrados só dos números pares.',
      'print([n * n for n in numeros if n % 2 == 0])', ['for ', 'if ', '[', 'print('], '[n * n for n in numeros if n % 2 == 0]',
      { prelude: 'numeros = [1, 2, 3, 4, 5, 6]', peek: 'print(numeros)' }),
    P('Ordenar e fatiar', 'A lista palavras já existe. Imprima a lista ordenada pelo tamanho das palavras (sorted com key=len) e, na linha de baixo, só as 2 primeiras palavras dela.',
      'ordem = sorted(palavras, key=len)\nprint(ordem)\nprint(ordem[:2])', ['sorted(', 'key=', ':'], 'sorted(palavras, key=len) e depois ordem[:2].',
      { prelude: 'palavras = ["uva", "banana", "kiwi", "maçã"]', peek: 'print(palavras)' }),
    P('Só o que tem estoque', 'O dicionário estoque já existe. Com uma compreensão de dicionário, imprima um novo dicionário só com os itens que têm quantidade maior que 0.',
      'print({k: v for k, v in estoque.items() if v > 0})', ['for ', 'if ', '{', 'items()'], '{k: v for k, v in estoque.items() if v > 0}',
      { prelude: 'estoque = {"maçã": 5, "uva": 0, "pera": 8}', peek: 'print(estoque)' }),
    P('Contando palavras', 'A variável frase já existe. Conte quantas vezes cada palavra aparece usando um dicionário e imprima o dicionário.',
      'contagem = {}\nfor p in frase.split():\n    contagem[p] = contagem.get(p, 0) + 1\nprint(contagem)', ['split(', 'for ', 'print('], 'frase.split() separa as palavras; contagem.get(p, 0) + 1 soma 1 a cada vez.',
      { prelude: 'frase = "ola mundo ola"', peek: 'print(frase)' }),
    P('Somar sem quebrar', 'A lista valores tem textos, alguns não são números. Some só os que viram número (use try/except para ignorar os inválidos) e imprima o total.',
      'total = 0\nfor v in valores:\n    try:\n        total += int(v)\n    except ValueError:\n        pass\nprint(total)', ['try', 'except', 'int(', 'print('], 'Dentro do for: try: total += int(v) / except ValueError: pass.',
      { prelude: 'valores = ["10", "x", "7", "abc", "3"]', peek: 'print(valores)' })
  );
}

// ---------------------------------------------------------------- Python avançado
{
  const P = factory('python', 3, null);
  out.push(
    P('Sua primeira classe', 'Crie a classe Pet com __init__(self, nome) e um método falar() que devolve o nome seguido de " faz barulho". Crie Pet("Rex") e imprima o resultado de falar().',
      'class Pet:\n    def __init__(self, nome):\n        self.nome = nome\n    def falar(self):\n        return self.nome + " faz barulho"\nprint(Pet("Rex").falar())', ['class pet', '__init__', 'def falar', 'print('],
      'class Pet: com __init__ guardando self.nome e def falar(self): return ...'),
    P('Dataclass', 'Com @dataclass, crie a classe Produto com os campos nome (str) e preco (float). Crie Produto("Mouse", 80.0) e imprima o objeto.',
      'from dataclasses import dataclass\n\n@dataclass\nclass Produto:\n    nome: str\n    preco: float\n\nprint(Produto("Mouse", 80.0))', ['@dataclass', 'class produto', 'print('],
      'from dataclasses import dataclass, depois @dataclass e os campos com tipo.'),
    P('Gerador de contagem', 'Crie um gerador contagem(n) que entrega (yield) os números de 1 até n. Imprima list(contagem(4)).',
      'def contagem(n):\n    for i in range(1, n + 1):\n        yield i\n\nprint(list(contagem(4)))', ['def contagem', 'yield', 'list(', 'print('], 'def contagem(n): com um for e yield i.'),
    P('Multiplicando com reduce', 'Use functools.reduce para multiplicar todos os números da lista [1, 2, 3, 4] e imprima o resultado.',
      'from functools import reduce\n\nprint(reduce(lambda a, b: a * b, [1, 2, 3, 4]))', ['reduce(', 'print('], 'from functools import reduce; reduce(lambda a, b: a * b, [1, 2, 3, 4])'),
    P('Total por categoria', 'No DataFrame df, crie a coluna total (qtd vezes preco) e imprima a soma de total por categoria (groupby).',
      'df["total"] = df["qtd"] * df["preco"]\nprint(df.groupby("categoria")["total"].sum())', ['groupby(', 'total', 'print('], 'df["total"] = df["qtd"] * df["preco"] e depois df.groupby("categoria")["total"].sum()',
      { prelude: DF, peek: 'print(df)' })
  );
}

module.exports = out;
