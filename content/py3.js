// PYTHON — NÍVEL AVANÇADO (20 lições de linguagem + 10 de análise de dados com Pandas)
const mkH = require('./h');
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
const { L } = mkH('python', 3, null, '');
const PD = { prelude: DF, peek: 'print(df.to_string())' };

exports.lessons = [
  L('Classes e objetos', 'Uma classe é um molde; cada objeto criado a partir dela é uma instância. Por convenção, o nome da classe começa com letra maiúscula.', 'class Gato:\n    pass\ng = Gato()',
    'Crie a classe Produto (pode usar pass), crie um objeto p e imprima type(p).__name__.', 'class Produto:\n    pass\np = Produto()\nprint(type(p).__name__)', ['class'], 'class Produto: pass'),
  L('__init__ e atributos', '__init__ roda ao criar o objeto e guarda os dados em self.', 'class A:\n    def __init__(self, x):\n        self.x = x',
    'Crie Produto com __init__(self, nome, preco). Crie Produto("Mouse", 80) e imprima o nome e o preço (uma linha cada).', 'class Produto:\n    def __init__(self, nome, preco):\n        self.nome = nome\n        self.preco = preco\np = Produto("Mouse", 80)\nprint(p.nome)\nprint(p.preco)', ['__init__', 'self'], 'self.nome = nome'),
  L('Métodos', 'Métodos são funções da classe. O primeiro parâmetro é sempre self.', 'class A:\n    def dobro(self):\n        return self.x * 2',
    'Na classe Produto (nome, preco), crie o método com_desconto(self, pct) que devolve o preço menos pct%. Imprima Produto("Mesa", 650).com_desconto(10).', 'class Produto:\n    def __init__(self, nome, preco):\n        self.nome = nome\n        self.preco = preco\n    def com_desconto(self, pct):\n        return self.preco * (1 - pct / 100)\nprint(Produto("Mesa", 650).com_desconto(10))', ['def com_desconto', 'self'], 'return self.preco * (1 - pct / 100)'),
  L('__str__', '__str__ define como o objeto aparece no print.', 'class A:\n    def __str__(self):\n        return "A!"',
    'Faça Produto("Mouse", 80) aparecer no print como "Mouse - R$ 80".', 'class Produto:\n    def __init__(self, nome, preco):\n        self.nome = nome\n        self.preco = preco\n    def __str__(self):\n        return f"{self.nome} - R$ {self.preco}"\nprint(Produto("Mouse", 80))', ['__str__'], 'def __str__(self): return f"..."'),
  L('Herança', 'Uma classe filha herda tudo da classe mãe: class Filha(Mae).', 'class Animal: pass\nclass Cao(Animal): pass',
    'Crie Animal com o método falar() que devolve "..." e Cachorro(Animal) sem método próprio. Imprima Cachorro().falar().', 'class Animal:\n    def falar(self):\n        return "..."\nclass Cachorro(Animal):\n    pass\nprint(Cachorro().falar())', ['class cachorro(animal)'], 'class Cachorro(Animal):'),
  L('super()', 'super() chama o método da classe mãe, para reaproveitar o que ela já faz.', 'class B(A):\n    def __init__(self, x, y):\n        super().__init__(x)',
    'Crie Pessoa(nome) e Aluno(Pessoa) com __init__(nome, curso) usando super(). Imprima aluno.nome e aluno.curso para Aluno("Ana", "SQL").', 'class Pessoa:\n    def __init__(self, nome):\n        self.nome = nome\nclass Aluno(Pessoa):\n    def __init__(self, nome, curso):\n        super().__init__(nome)\n        self.curso = curso\na = Aluno("Ana", "SQL")\nprint(a.nome)\nprint(a.curso)', ['super()'], 'super().__init__(nome)'),
  L('Polimorfismo', 'Classes diferentes podem ter o mesmo método, cada uma com seu comportamento.', 'for o in [A(), B()]:\n    o.falar()',
    'Crie Gato e Pato com método som() ("Miau" e "Quack"). Percorra uma lista com um de cada e imprima o som.', 'class Gato:\n    def som(self):\n        return "Miau"\nclass Pato:\n    def som(self):\n        return "Quack"\nfor a in [Gato(), Pato()]:\n    print(a.som())', ['def som', 'for'], 'Dois métodos som() em classes diferentes.'),
  L('@property', '@property transforma um método em atributo calculado: objeto.area em vez de objeto.area().', 'class A:\n    @property\n    def dobro(self):\n        return 2',
    'Crie Retangulo(l, a) com a property area. Imprima Retangulo(3, 4).area.', 'class Retangulo:\n    def __init__(self, l, a):\n        self.l = l\n        self.a = a\n    @property\n    def area(self):\n        return self.l * self.a\nprint(Retangulo(3, 4).area)', ['@property'], '@property antes do def area(self)'),
  L('@classmethod e @staticmethod', '@classmethod recebe a classe (cls) e serve para criar objetos de outras formas; @staticmethod é uma função solta dentro da classe.', 'class A:\n    @staticmethod\n    def soma(a, b):\n        return a + b',
    'Em Conta(saldo), crie o @classmethod vazia(cls) que devolve Conta(0). Imprima Conta.vazia().saldo.', 'class Conta:\n    def __init__(self, saldo):\n        self.saldo = saldo\n    @classmethod\n    def vazia(cls):\n        return cls(0)\nprint(Conta.vazia().saldo)', ['@classmethod', 'cls'], 'return cls(0)'),
  L('dataclass', '@dataclass cria __init__ e __repr__ sozinho a partir dos campos declarados.', 'from dataclasses import dataclass\n@dataclass\nclass P:\n    x: int',
    'Crie a dataclass Produto com nome: str e preco: float. Imprima Produto("Mouse", 80.0).', 'from dataclasses import dataclass\n@dataclass\nclass Produto:\n    nome: str\n    preco: float\nprint(Produto("Mouse", 80.0))', ['@dataclass'], '@dataclass antes da classe'),
  L('Geradores (yield)', 'Uma função com yield entrega um valor por vez e lembra onde parou. Economiza memória.', 'def g():\n    yield 1\n    yield 2',
    'Crie o gerador pares(n) que entrega os pares de 0 até n. Imprima list(pares(10)).', 'def pares(n):\n    for i in range(0, n + 1, 2):\n        yield i\nprint(list(pares(10)))', ['yield'], 'yield i dentro de um for'),
  L('Generator expression', 'Parecida com list comprehension, mas com parênteses: calcula sob demanda.', 'print(sum(x * x for x in range(4)))',
    'Imprima a soma dos quadrados dos números de 1 a 100 sem criar lista (generator expression).', 'print(sum(x * x for x in range(1, 101)))', ['sum', 'for'], 'sum(x * x for x in range(1, 101))'),
  L('Iteradores: next e iter', 'iter() cria um iterador e next() pega o próximo item.', 'it = iter([1, 2])\nprint(next(it))',
    'Crie um iterador de ["a","b","c"] e imprima os dois primeiros itens com next (uma linha cada).', 'it = iter(["a", "b", "c"])\nprint(next(it))\nprint(next(it))', ['iter', 'next'], 'next(it) duas vezes'),
  L('Decorators', 'Um decorator envolve uma função para acrescentar comportamento, sem mudar o código dela.', 'def deco(f):\n    def novo(*a):\n        return f(*a)\n    return novo',
    'Crie o decorator em_maiusculas que transforma o texto devolvido pela função em maiúsculas. Aplique em saudacao() que devolve "olá" e imprima o resultado.', 'def em_maiusculas(f):\n    def novo():\n        return f().upper()\n    return novo\n@em_maiusculas\ndef saudacao():\n    return "olá"\nprint(saudacao())', ['def em_maiusculas', '@em_maiusculas'], '@em_maiusculas acima do def saudacao'),
  L('Decorator com argumentos', '*args e **kwargs deixam o decorator funcionar com qualquer função; functools.wraps preserva o nome original.', 'from functools import wraps',
    'Crie o decorator log que imprime "chamando soma" antes de executar a função com *args. Decore soma(a, b) e imprima soma(2, 3).', 'def log(f):\n    def novo(*args, **kwargs):\n        print("chamando " + f.__name__)\n        return f(*args, **kwargs)\n    return novo\n@log\ndef soma(a, b):\n    return a + b\nprint(soma(2, 3))', ['*args', '@log'], 'print dentro de novo(*args, **kwargs)'),
  L('Closures', 'Uma função interna lembra as variáveis da função externa, mesmo depois dela terminar.', 'def mult(n):\n    def f(x):\n        return x * n\n    return f',
    'Crie fabrica_desconto(pct) que devolve uma função que aplica o desconto a um preço. Crie d10 = fabrica_desconto(10) e imprima d10(200).', 'def fabrica_desconto(pct):\n    def aplicar(preco):\n        return preco * (1 - pct / 100)\n    return aplicar\nd10 = fabrica_desconto(10)\nprint(d10(200))', ['def fabrica_desconto', 'return'], 'A função interna usa pct da externa.'),
  L('Memoização com lru_cache', '@lru_cache guarda os resultados já calculados, tornando funções recursivas muito mais rápidas.', 'from functools import lru_cache',
    'Crie fib(n) recursiva com @lru_cache(maxsize=None) e imprima fib(40).', 'from functools import lru_cache\n@lru_cache(maxsize=None)\ndef fib(n):\n    if n < 2:\n        return n\n    return fib(n - 1) + fib(n - 2)\nprint(fib(40))', ['lru_cache'], '@lru_cache(maxsize=None)'),
  L('itertools', 'itertools tem ferramentas para combinar e agrupar: permutations, combinations, chain...', 'from itertools import combinations\nprint(list(combinations([1, 2, 3], 2)))',
    'Imprima quantas combinações de 2 pessoas existem em equipe (use combinations e len).', 'from itertools import combinations\nprint(len(list(combinations(equipe, 2))))', ['combinations'], 'len(list(combinations(equipe, 2)))', { prelude: 'equipe = ["Ana", "Bia", "Caio", "Dani", "Edu"]' }),
  L('functools.reduce', 'reduce() combina todos os itens em um só valor, aplicando a função de dois em dois.', 'from functools import reduce\nprint(reduce(lambda a, b: a + b, [1, 2, 3]))',
    'Use reduce com lambda para multiplicar todos os números de lista e imprima.', 'from functools import reduce\nprint(reduce(lambda a, b: a * b, lista))', ['reduce', 'lambda'], 'reduce(lambda a, b: a * b, lista)', { prelude: 'lista = [2, 3, 4, 5]' }),
  L('Context manager (with)', 'O with garante que algo seja aberto e fechado direito (arquivos, conexões). io.StringIO simula um arquivo na memória.', 'import io\nwith io.StringIO("a\\nb") as f:\n    print(f.read())',
    'Com with e io.StringIO(texto), leia o conteúdo linha a linha e imprima quantas linhas existem.', 'import io\nwith io.StringIO(texto) as f:\n    linhas = f.readlines()\nprint(len(linhas))', ['with', 'io.stringio'], 'f.readlines()', { prelude: 'texto = "linha 1\\nlinha 2\\nlinha 3"' }),
  L('Pandas: DataFrame', 'Pandas é a principal biblioteca de análise de dados. Um DataFrame é uma tabela. O df desta atividade já está carregado com as colunas produto, categoria, qtd, preco e mes.', 'print(df.shape)',
    'Imprima o número de linhas do df e, embaixo, a lista dos nomes das colunas (df.columns.tolist()).', 'print(len(df))\nprint(df.columns.tolist())', ['len', 'columns'], 'len(df) e df.columns.tolist()', PD),
  L('Pandas: head e shape', 'df.head(n) mostra as primeiras linhas; df.shape devolve (linhas, colunas); df.describe() resume os números.', 'print(df.shape)',
    'Imprima o shape do df e, embaixo, a lista dos 3 primeiros produtos (df.head(3)["produto"].tolist()).', 'print(df.shape)\nprint(df.head(3)["produto"].tolist())', ['shape', 'head'], 'df.head(3)["produto"].tolist()', PD),
  L('Pandas: filtrando', 'df[condição] devolve só as linhas que atendem. Combine condições com & e | (cada uma entre parênteses).', 'print(df[df["qtd"] > 5].shape[0])',
    'Imprima a lista dos produtos de Eletrônicos com qtd maior que 3.', 'print(df[(df["categoria"] == "Eletrônicos") & (df["qtd"] > 3)]["produto"].tolist())', ['df[', '&'], 'Duas condições entre parênteses ligadas por &.', PD),
  L('Pandas: nova coluna', 'Crie colunas com cálculos: df["total"] = df["qtd"] * df["preco"].', 'df["x"] = df["qtd"] * 2',
    'Crie a coluna total (qtd * preco) e imprima a lista df["total"].tolist().', 'df["total"] = df["qtd"] * df["preco"]\nprint(df["total"].tolist())', ['df["total"]'], 'df["total"] = df["qtd"] * df["preco"]', PD),
  L('Pandas: groupby', 'groupby agrupa linhas e permite somar, contar ou tirar a média de cada grupo.', 'df.groupby("categoria")["qtd"].sum()',
    'Calcule a qtd total por categoria e imprima como dicionário (.to_dict()).', 'print(df.groupby("categoria")["qtd"].sum().to_dict())', ['groupby', 'sum'], 'df.groupby("categoria")["qtd"].sum().to_dict()', PD),
  L('Pandas: sort_values', 'sort_values("coluna", ascending=False) ordena a tabela.', 'df.sort_values("preco")',
    'Imprima a lista dos 3 produtos mais caros (ordem do mais caro para o mais barato): sort_values + head.', 'print(df.sort_values("preco", ascending=False).head(3)["produto"].tolist())', ['sort_values', 'head'], 'df.sort_values("preco", ascending=False).head(3)', PD),
  L('Pandas: agg com várias métricas', '.agg() calcula várias estatísticas de uma vez.', 'df.groupby("mes")["qtd"].agg(["sum", "mean"])',
    'Crie a coluna total (qtd * preco), agrupe por categoria, e imprima o dicionário da receita máxima por categoria (max do total).', 'df["total"] = df["qtd"] * df["preco"]\nprint(df.groupby("categoria")["total"].max().to_dict())', ['groupby', 'max'], 'Crie total antes, depois groupby("categoria")["total"].max()', PD),
  L('Pandas: merge', 'merge() junta duas tabelas por uma coluna em comum, como um JOIN do SQL.', 'pd.merge(a, b, on="chave")',
    'Junte df com a tabela metas pela coluna categoria e imprima a lista das metas (coluna meta) na ordem das linhas do df.', 'r = pd.merge(df, metas, on="categoria")\nprint(r["meta"].tolist())', ['merge'], 'pd.merge(df, metas, on="categoria")', { prelude: DF + 'metas = pd.DataFrame({"categoria": ["Eletrônicos", "Móveis", "Papelaria"], "meta": [5000, 2000, 300]})\n', peek: 'print(df.to_string())\nprint(metas.to_string())' }),
  L('Pandas: value_counts e pivot', 'value_counts() conta quantas vezes cada valor aparece; pivot_table() resume em formato de tabela dinâmica.', 'df["mes"].value_counts()',
    'Imprima como dicionário a quantidade de vendas por mês (value_counts().to_dict()), e a seguir o total de qtd por mês com pivot_table (índice mes, values qtd, aggfunc sum) em dicionário.', 'print(df["mes"].value_counts().to_dict())\nprint(df.pivot_table(index="mes", values="qtd", aggfunc="sum")["qtd"].to_dict())', ['value_counts', 'pivot_table'], 'df.pivot_table(index="mes", values="qtd", aggfunc="sum")', PD),
  L('Projeto: produto campeão', 'Projeto final do nível: transforme dados brutos em uma resposta de negócio.', 'df["total"] = df["qtd"] * df["preco"]',
    'Crie a coluna total (qtd * preco). Descubra qual produto gerou mais receita somando por produto e imprima: "Campeão: Notebook com 7000".', 'df["total"] = df["qtd"] * df["preco"]\nr = df.groupby("produto")["total"].sum()\nprint(f"Campeão: {r.idxmax()} com {r.max()}")', ['groupby', 'idxmax'], 'r.idxmax() devolve o nome; r.max() o valor.', PD),
];
