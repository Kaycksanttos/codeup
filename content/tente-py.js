// "Experimente" do Python: uma mudança sugerida para o exemplo de cada lição. { q: o convite, code: o exemplo já alterado, why: o que aconteceu }.
// O código usa String.raw para o `\n` do Python continuar sendo barra + n. O teste (tools/check-tente.js) roda cada `code` e exige uma saída diferente da do exemplo.
const R = String.raw;
module.exports = {
  'py-1-01': { q: 'Troque o texto entre aspas por outra mensagem.', code: R`print("Ola, mundo!")`, why: 'O `print` mostra exatamente o que está entre as aspas. Mudou o texto, mudou o que aparece.' },
  'py-1-02': { q: 'Acrescente um terceiro `print` com a letra C.', code: R`print("A")
print("B")
print("C")`, why: 'Cada `print` escreve uma linha nova, na ordem em que estão no código.' },
  'py-1-03': { q: 'Troque a conta por `2 + 3 * 4`. Qual conta o Python faz primeiro?', code: R`print(2 + 3 * 4)`, why: 'A multiplicação vem antes da soma, igual na matemática: 3 * 4 = 12, e depois 2 + 12 = 14.' },
  'py-1-04': { q: 'Mude o número guardado em `idade` e rode de novo.', code: R`idade = 45
print(idade)`, why: 'Uma variável é uma caixinha com nome. O `print(idade)` mostra o que está dentro dela agora.' },
  'py-1-05': { q: 'Mude o valor de `a` para 7.', code: R`a = 7
b = 5
print(a * b)`, why: 'A conta usa os valores que as variáveis guardam. Mudando a variável, o resultado muda junto.' },
  'py-1-06': { q: 'Troque `//` por `%` (o resto da divisão) e o expoente 3 por 10.', code: R`print(17 % 5)
print(2 ** 10)`, why: '`%` devolve o que sobra da divisão (17 dividido por 5 dá 3 e sobra 2). `**` é a potência: 2 elevado a 10 é 1024.' },
  'py-1-07': { q: 'Descubra o tipo de um número com vírgula e o de um texto.', code: R`print(type(10.5))
print(type("oi"))`, why: '`int` é número inteiro, `float` é número com vírgula e `str` é texto.' },
  'py-1-08': { q: 'Converta dois textos em número e some os dois.', code: R`print(int("12") + int("30"))`, why: 'O `int()` transforma texto em número. Sem ele, o `+` juntaria os textos em vez de somar.' },
  'py-1-09': { q: 'Cole mais um pedaço no final: `+ "!"`.', code: R`print("Ola, " + "Ana" + "!")`, why: 'O `+` entre textos cola um no outro. Os espaços e a pontuação precisam estar dentro das aspas.' },
  'py-1-10': { q: 'Coloque duas variáveis dentro do mesmo texto.', code: R`nome = "Leo"
idade = 12
print(f"{nome} tem {idade} anos")`, why: 'No f-string, tudo o que está entre chaves vira o valor da variável. O `f` antes das aspas é obrigatório.' },
  'py-1-11': { q: 'Use outra palavra e troque `upper()` por `capitalize()`.', code: R`print(len("computador"))
print("casa".capitalize())`, why: '`len` conta as letras. `capitalize` deixa só a primeira letra maiúscula.' },
  'py-1-12': { q: 'Encadeie dois métodos: `.strip().lower()`.', code: R`print("  OLA  ".strip().lower())`, why: 'Cada método devolve um texto novo, então dá para encadear: primeiro tira os espaços das pontas e depois deixa tudo minúsculo.' },
  'py-1-13': { q: 'Peça a última letra com `[-1]` e um pedaço do meio com `[2:5]`.', code: R`p = "banana"
print(p[-1])
print(p[2:5])`, why: 'Contando de trás para a frente, `-1` é a última letra. No pedaço `[2:5]` a letra da posição 5 fica de fora.' },
  'py-1-14': { q: 'Compare se dois números são iguais (`==`) e se são diferentes (`!=`).', code: R`print(10 == 5)
print(10 != 5)`, why: 'Uma comparação sempre devolve `True` (verdadeiro) ou `False` (falso). Repare: `=` guarda valor e `==` compara.' },
  'py-1-15': { q: 'Teste `not False` e `True and True`.', code: R`print(not False)
print(True and True)`, why: '`not` inverte o valor. O `and` só dá `True` quando os dois lados são verdadeiros.' },
  'py-1-16': { q: 'Troque `x` para 3 e rode: o que aparece?', code: R`x = 3
if x > 5:
    print("grande")
print("fim")`, why: 'O que está recuado dentro do `if` só roda se a condição for verdadeira. O `print("fim")` está fora, por isso aparece sempre.' },
  'py-1-17': { q: 'Troque o `3` por `8` na condição.', code: R`if 8 > 5:
    print("A")
else:
    print("B")`, why: 'O `if` roda quando a condição é verdadeira e o `else` roda quando não é. Nunca os dois juntos.' },
  'py-1-18': { q: 'Mude `n` para 1 e veja qual caminho o Python escolhe.', code: R`n = 1
if n > 10:
    print("A")
elif n > 3:
    print("B")
else:
    print("C")`, why: 'O Python testa de cima para baixo e para no primeiro verdadeiro. Com n = 1, nenhum teste passa e cai no `else`.' },
  'py-1-19': { q: 'Acrescente uma terceira cor e mostre também o tamanho da lista.', code: R`cores = ["azul", "verde", "rosa"]
print(cores)
print(len(cores))`, why: 'A lista fica entre colchetes, com os itens separados por vírgula. O `len` conta quantos itens existem.' },
  'py-1-20': { q: 'Peça o item da posição 1 e o da posição -2.', code: R`frutas = ["maca", "banana", "uva"]
print(frutas[1])
print(frutas[-2])`, why: 'A posição começa em 0. Numa lista de 3 itens, a posição 1 e a posição -2 apontam para o mesmo item.' },
  'py-1-21': { q: 'Adicione mais uma letra com outro `append`.', code: R`letras = ["a"]
letras.append("b")
letras.append("c")
print(letras)`, why: 'O `append` coloca o item sempre no final da lista.' },
  'py-1-22': { q: 'Troque `sum` por `max` e `min` numa lista nova.', code: R`print(max([4, 9, 2]))
print(min([4, 9, 2]))`, why: '`max` devolve o maior item e `min` o menor. Funcionam com qualquer lista de números.' },
  'py-1-23': { q: 'Acrescente o 3 na lista e multiplique por 10 dentro do `print`.', code: R`for x in [1, 2, 3]:
    print(x * 10)`, why: 'O `for` repete o bloco recuado uma vez para cada item. O `x` vale um item diferente a cada volta.' },
  'py-1-24': { q: 'Troque `range(3)` por `range(5)`.', code: R`for i in range(5):
    print(i)`, why: '`range(5)` gera 0, 1, 2, 3 e 4. Ele para antes do 5.' },
  'py-1-25': { q: 'Some até 5 em vez de 3.', code: R`total = 0
for i in range(5):
    total += i
print(total)`, why: 'O acumulador começa em 0 e, a cada volta, recebe mais um número: 0+1+2+3+4 = 10.' },
  'py-1-26': { q: 'Mova o `print` para dentro do `while` e suba o limite para 3.', code: R`x = 0
while x < 3:
    x += 1
    print(x)`, why: 'O `while` repete enquanto a condição for verdadeira. Se nada mudasse o `x`, ele nunca pararia.' },
  'py-1-27': { q: 'Use a lista de 1 a 5 e troque a regra para `n > 3`.', code: R`for n in [1, 2, 3, 4, 5]:
    if n > 3:
        print(n)`, why: 'O `if` dentro do `for` decide, item por item, quem aparece.' },
  'py-1-28': { q: 'Chame a função uma segunda vez com outro número.', code: R`def triplo(x):
    return x * 3
print(triplo(2))
print(triplo(10))`, why: 'A função é escrita uma vez e pode ser chamada quantas vezes quiser, com valores diferentes.' },
  'py-1-29': { q: 'Acrescente a chave `idade` e peça os dois valores.', code: R`aluno = {"nome": "Ana", "idade": 20}
print(aluno["nome"])
print(aluno["idade"])`, why: 'O dicionário guarda pares chave: valor. Você pede o valor pela chave, e não pela posição.' },
  'py-1-30': { q: 'Crie uma função que devolve a média de dois números.', code: R`def media(a, b):
    return (a + b) / 2

print(media(6, 8))`, why: 'Os parênteses garantem que a soma é feita antes da divisão. Sem eles, o resultado seria outro.' },

  'py-2-01': { q: 'Troque o passo de 5 para 2.', code: R`for i in range(0, 10, 2):
    print(i)`, why: 'O terceiro número do `range` é o passo: de quanto em quanto ele conta.' },
  'py-2-02': { q: 'Acrescente um item e comece a contar do 1 com `start=1`.', code: R`for i, x in enumerate(["a", "b", "c"], start=1):
    print(i, x)`, why: 'O `enumerate` entrega a posição e o item juntos. O `start` muda o número da primeira posição.' },
  'py-2-03': { q: 'Acrescente um terceiro item nas duas listas.', code: R`for a, b in zip([1, 2, 3], ["x", "y", "z"]):
    print(a, b)`, why: 'O `zip` emparelha os itens de mesma posição das duas listas.' },
  'py-2-04': { q: 'Troque a conta por `x ** 2` e use `range(5)`.', code: R`print([x ** 2 for x in range(5)])`, why: 'A list comprehension é um `for` e uma conta escritos numa linha só, dentro de colchetes.' },
  'py-2-05': { q: 'Filtre só os pares: `if x % 2 == 0`.', code: R`print([x for x in [1, 2, 3, 4, 5, 6] if x % 2 == 0])`, why: 'O `if` no final deixa passar só quem cumpre a regra. Um número é par quando o resto da divisão por 2 é zero.' },
  'py-2-06': { q: 'Ordene do maior para o menor com `reverse=True`.', code: R`l = [3, 1, 2]
l.sort(reverse=True)
print(l)`, why: 'O `sort` reorganiza a própria lista. Com `reverse=True`, a ordem é decrescente.' },
  'py-2-07': { q: 'Acrescente `reverse=True` para a maior palavra vir primeiro.', code: R`print(sorted(["bb", "a", "ccc"], key=len, reverse=True))`, why: 'O `key=len` manda ordenar pelo tamanho. O `reverse=True` inverte a ordem.' },
  'py-2-08': { q: 'Peça o começo com `[:2]` e o final com `[2:]`.', code: R`x = [10, 20, 30, 40]
print(x[:2])
print(x[2:])`, why: 'Sem número antes dos dois-pontos, o corte começa do início. Sem número depois, vai até o fim.' },
  'py-2-09': { q: 'Peça uma linha inteira e um item de outra linha.', code: R`m = [[1, 2], [3, 4]]
print(m[1])
print(m[0][1])`, why: 'O primeiro número escolhe a linha e o segundo escolhe o item dentro dela.' },
  'py-2-10': { q: 'Troque os valores e multiplique em vez de somar.', code: R`x, y = (3, 4)
print(x * y)`, why: 'O desempacotamento distribui cada item da tupla numa variável, na ordem.' },
  'py-2-11': { q: 'Coloque mais valores repetidos na lista.', code: R`print(len(set([1, 1, 2, 2, 3])))`, why: 'O `set` guarda cada valor uma vez só. O `len` mostra quantos valores diferentes existem.' },
  'py-2-12': { q: 'Troque `&` por `|` (a união dos dois conjuntos).', code: R`print({1, 2} | {2, 3})`, why: '`&` fica só com o que está nos dois conjuntos. `|` junta tudo, sem repetir.' },
  'py-2-13': { q: 'Peça uma chave que existe e teste uma que não existe.', code: R`d = {"a": 1}
print(d.get("a", 0))
print("b" in d)`, why: 'O `get` devolve o valor da chave, ou o padrão (0) se ela não existir. O `in` responde `True` ou `False`.' },
  'py-2-14': { q: 'Acrescente a chave `y` com o valor 2.', code: R`d = {}
d["x"] = 1
d["y"] = 2
print(d)`, why: 'Atribuir a uma chave nova cria o par. Se a chave já existir, o valor é trocado.' },
  'py-2-15': { q: 'Troque `x * x` por `x * 2`.', code: R`print({x: x * 2 for x in [1, 2, 3]})`, why: 'A dict comprehension monta chave: valor para cada item da lista.' },
  'py-2-16': { q: 'Conte as letras de `"banana"`.', code: R`c = {}
for x in "banana":
    c[x] = c.get(x, 0) + 1
print(c)`, why: 'A cada letra, o `get` pega a contagem atual (ou 0, na primeira vez) e soma 1.' },
  'py-2-17': { q: 'Separe pelos espaços e junte com hífen.', code: R`print("um dois tres".split(" "))
print("-".join(["a", "b"]))`, why: 'O `split` quebra o texto em uma lista. O `join` faz o contrário: cola a lista, com o separador que você escolher.' },
  'py-2-18': { q: 'Conte `"an"` e troque `a` por `o`.', code: R`print("banana".count("an"))
print("banana".replace("a", "o"))`, why: 'O `count` conta quantas vezes o pedaço aparece. O `replace` devolve o texto com a troca feita.' },
  'py-2-19': { q: 'Troque `.2f` por `.3f`.', code: R`x = 3.14159
print(f"{x:.3f}")`, why: 'O número depois do ponto é a quantidade de casas decimais.' },
  'py-2-20': { q: 'Passe a saudação pelo nome do parâmetro.', code: R`def oi(nome, saudacao="Ola"):
    return f"{saudacao}, {nome}"

print(oi("Ana"))
print(oi("Bia", saudacao="Boa noite"))`, why: 'O parâmetro com valor padrão é opcional. Se você não passar nada, ele usa o padrão.' },
  'py-2-21': { q: 'Passe os dois argumentos pelo nome, em outra ordem.', code: R`def f(a, b=2):
    return a + b
print(f(b=10, a=1))`, why: 'Com o nome na chamada, a ordem deixa de importar.' },
  'py-2-22': { q: 'Crie uma lambda com dois parâmetros.', code: R`soma = lambda a, b: a + b
print(soma(2, 3))`, why: 'Uma lambda é uma função de uma linha só. O que vem depois dos dois-pontos é o que ela devolve.' },
  'py-2-23': { q: 'Troque o `map` por `filter` com uma regra.', code: R`print(list(filter(lambda x: x > 2, [1, 2, 3, 4])))`, why: 'O `map` transforma todos os itens. O `filter` mantém só os que passam na regra.' },
  'py-2-24': { q: 'Teste uma lista toda falsa no `any` e uma toda verdadeira no `all`.', code: R`print(any([False, False]))
print(all([True, True]))`, why: '`any` é `True` se pelo menos um item for verdadeiro. `all` só é `True` se todos forem.' },
  'py-2-25': { q: 'Provoque outro erro: divida por zero.', code: R`try:
    print(10 / 0)
except ZeroDivisionError:
    print("nao da para dividir por zero")`, why: 'Se der erro dentro do `try`, o Python pula para o `except` que combina com esse tipo de erro e o programa continua.' },
  'py-2-26': { q: 'Chame a função com um valor bom antes do ruim.', code: R`def f(x):
    if x < 0:
        raise ValueError("negativo")
    return x

try:
    print(f(5))
    print(f(-1))
except ValueError as e:
    print("Erro:", e)`, why: 'O primeiro `print` funciona. No segundo o `raise` dispara o erro e o código pula direto para o `except`.' },
  'py-2-27': { q: 'Calcule outra raiz e mostre o valor de pi.', code: R`import math
print(math.sqrt(81))
print(math.pi)`, why: 'Um módulo é uma caixa de ferramentas. Depois do `import`, você usa `modulo.ferramenta`.' },
  'py-2-28': { q: 'Conte as letras de `"banana"` e peça a mais comum.', code: R`from collections import Counter
print(Counter("banana").most_common(1))`, why: 'O `Counter` já faz a contagem para você. O `most_common(1)` devolve a que mais aparece.' },
  'py-2-29': { q: 'Troque `conta(3)` por `conta(5)`.', code: R`def conta(n):
    if n == 0:
        return 0
    return n + conta(n - 1)

print(conta(5))`, why: 'A função chama a si mesma, cada vez com um número menor, até chegar no caso de parada (n == 0).' },
  'py-2-30': { q: 'Acrescente mais um par no dicionário.', code: R`for k, v in {"a": 1, "b": 2}.items():
    print(k, v)`, why: 'O `.items()` entrega a chave e o valor juntos a cada volta.' },

  'py-3-01': { q: 'Crie uma segunda classe e compare os nomes.', code: R`class Gato:
    pass

class Cao:
    pass

print(type(Gato()).__name__)
print(type(Cao()).__name__)`, why: 'A classe é o molde. Cada vez que você escreve `Gato()`, nasce um objeto novo feito desse molde.' },
  'py-3-02': { q: 'Crie dois objetos com valores diferentes.', code: R`class A:
    def __init__(self, x):
        self.x = x

a = A(5)
b = A(9)
print(a.x)
print(b.x)`, why: 'O `__init__` roda quando o objeto nasce. Cada objeto guarda os seus próprios valores.' },
  'py-3-03': { q: 'Chame o método em dois objetos diferentes.', code: R`class A:
    def __init__(self, x):
        self.x = x

    def dobro(self):
        return self.x * 2

print(A(4).dobro())
print(A(10).dobro())`, why: 'O método usa o `self` para pegar os dados do objeto que o chamou.' },
  'py-3-04': { q: 'Mude o texto devolvido pelo `__str__`.', code: R`class A:
    def __str__(self):
        return "Ola, eu sou um A"

print(A())`, why: 'O `print` pede o texto do objeto, e o `__str__` define qual texto aparece.' },
  'py-3-05': { q: 'Faça o `Cao` sobrescrever o `falar` para devolver `"Au!"`.', code: R`class Animal:
    def falar(self):
        return "..."

class Cao(Animal):
    def falar(self):
        return "Au!"

print(Cao().falar())`, why: 'A classe filha herda tudo da mãe, mas pode trocar um método por uma versão própria.' },
  'py-3-06': { q: 'Crie o objeto com outros valores.', code: R`class A:
    def __init__(self, x):
        self.x = x

class B(A):
    def __init__(self, x, y):
        super().__init__(x)
        self.y = y

b = B(10, 20)
print(b.x, b.y)`, why: 'O `super().__init__(x)` chama o `__init__` da classe mãe, que guarda o `x`. Depois a filha guarda o `y`.' },
  'py-3-07': { q: 'Crie uma classe `C` que também fala do seu jeito.', code: R`class A:
    def falar(self):
        print("A fala")

class B(A):
    def falar(self):
        print("B fala")

class C(A):
    def falar(self):
        print("C fala")

for o in [A(), B(), C()]:
    o.falar()`, why: 'No polimorfismo, o mesmo comando (`o.falar()`) faz coisas diferentes, de acordo com a classe do objeto.' },
  'py-3-08': { q: 'Mude o `x` depois de criar o objeto e peça o `dobro` de novo.', code: R`class A:
    def __init__(self, x):
        self.x = x

    @property
    def dobro(self):
        return self.x * 2

a = A(5)
print(a.dobro)
a.x = 20
print(a.dobro)`, why: 'A `@property` é calculada na hora em que você pede, então acompanha o valor atual do `x`. E repare: sem parênteses.' },
  'py-3-09': { q: 'Acrescente um segundo método estático, de multiplicação.', code: R`class A:
    @staticmethod
    def soma(a, b):
        return a + b

    @staticmethod
    def mult(a, b):
        return a * b

print(A.soma(10, 20))
print(A.mult(3, 4))`, why: 'O método estático não precisa de objeto: você chama direto pela classe.' },
  'py-3-10': { q: 'Acrescente um segundo campo, `y: int`.', code: R`from dataclasses import dataclass

@dataclass
class P:
    x: int
    y: int

print(P(5, 7))`, why: 'A `dataclass` escreve o `__init__` e o texto do objeto para você, a partir dos campos que você listar.' },
  'py-3-11': { q: 'Acrescente um terceiro `yield 3`.', code: R`def g():
    yield 1
    yield 2
    yield 3

print(list(g()))`, why: 'O `yield` entrega um valor e pausa a função. A próxima chamada continua de onde parou.' },
  'py-3-12': { q: 'Aumente o `range` para 10.', code: R`print(sum(x * x for x in range(10)))`, why: 'A expressão geradora entrega um valor por vez, sem montar a lista inteira na memória.' },
  'py-3-13': { q: 'Peça o próximo item duas vezes.', code: R`it = iter([1, 2])
print(next(it))
print(next(it))`, why: 'O `next` pega o próximo item do iterador. Quando acabam os itens, o Python avisa com um erro `StopIteration`.' },
  'py-3-14': { q: 'Faça o decorator também mostrar `depois`.', code: R`def deco(f):
    def novo(*a):
        print("antes")
        r = f(*a)
        print("depois")
        return r
    return novo

@deco
def soma(a, b):
    return a + b

print(soma(1, 2))`, why: 'O decorator embrulha a função: faz algo antes, chama a original e faz algo depois.' },
  'py-3-15': { q: 'Mostre também o nome da função decorada.', code: R`from functools import wraps

def log(f):
    @wraps(f)
    def novo(*args, **kwargs):
        print("chamando", f.__name__)
        return f(*args, **kwargs)
    return novo

@log
def soma(a, b):
    return a + b

print(soma(2, 3))
print(soma.__name__)`, why: 'O `@wraps` preserva o nome original. Sem ele, o nome apareceria como `novo`.' },
  'py-3-16': { q: 'Crie também um `triplo` com `mult(3)`.', code: R`def mult(n):
    def f(x):
        return x * n
    return f

dobro = mult(2)
triplo = mult(3)
print(dobro(5))
print(triplo(5))`, why: 'Cada função criada lembra o `n` do momento em que nasceu. Isso é uma closure.' },
  'py-3-17': { q: 'Chame com um número novo e depois repita o 4.', code: R`from functools import lru_cache

@lru_cache(maxsize=None)
def quadrado(n):
    print("calculando", n)
    return n * n

print(quadrado(4))
print(quadrado(5))
print(quadrado(4))`, why: 'O cache guarda o resultado de cada número. A segunda vez que você pede o 4, ele não recalcula (o `calculando` não aparece).' },
  'py-3-18': { q: 'Troque `combinations` por `permutations`.', code: R`from itertools import permutations
print(list(permutations([1, 2, 3], 2)))`, why: 'Em `combinations` a ordem não importa ((1, 2) e (2, 1) são o mesmo par). Em `permutations` ela importa.' },
  'py-3-19': { q: 'Troque a soma por multiplicação e use 4 números.', code: R`from functools import reduce
print(reduce(lambda a, b: a * b, [1, 2, 3, 4]))`, why: 'O `reduce` junta os itens dois a dois, acumulando o resultado: ((1*2)*3)*4.' },
  'py-3-20': { q: 'Leia o texto linha por linha com um `for`.', code: R`import io
with io.StringIO("a\nb\nc") as f:
    for linha in f:
        print(linha.strip())`, why: 'O `with` abre o recurso e fecha sozinho no final. Ler linha por linha é o jeito de tratar arquivos grandes.' },
  'py-3-21': { q: 'Veja o nome das colunas e quantas linhas existem.', code: R`print(df.columns.tolist())
print(len(df))`, why: 'O `df.columns` lista as colunas da tabela e o `len` conta as linhas.' },
  'py-3-22': { q: 'Veja também as últimas linhas com `tail`.', code: R`print(df.head(2))
print(df.tail(2))`, why: '`head` mostra o começo da tabela e `tail` mostra o final.' },
  'py-3-23': { q: 'Filtre por categoria em vez de quantidade.', code: R`print(df[df["categoria"] == "Moveis"])`, why: 'O filtro `df[condição]` mantém só as linhas em que a condição é verdadeira.' },
  'py-3-24': { q: 'Crie a coluna `bruto` com quantidade vezes preço.', code: R`df["bruto"] = df["qtd"] * df["preco"]
print(df[["produto", "bruto"]])`, why: 'A conta é feita linha a linha, coluna contra coluna.' },
  'py-3-25': { q: 'Troque `sum` por `mean` e a coluna `qtd` por `preco`.', code: R`print(df.groupby("categoria")["preco"].mean())`, why: 'O `groupby` separa as linhas por categoria e a função resume cada grupo. Aqui, a média de preço.' },
  'py-3-26': { q: 'Ordene do mais caro para o mais barato.', code: R`print(df.sort_values("preco", ascending=False)[["produto", "preco"]])`, why: 'O `sort_values` ordena de forma crescente. Com `ascending=False` a ordem inverte.' },
  'py-3-27': { q: 'Agrupe por categoria e peça `sum` e `max`.', code: R`print(df.groupby("categoria")["qtd"].agg(["sum", "max"]))`, why: 'O `agg` calcula várias métricas de uma vez, uma coluna para cada.' },
  'py-3-28': { q: 'Junte as duas tabelas e mostre a meta de cada produto.', code: R`m = pd.merge(df, metas, on="categoria")
print(m[["produto", "qtd", "meta"]].head(4))`, why: 'O `merge` junta duas tabelas pela coluna em comum, igual a um `JOIN` do SQL.' },
  'py-3-29': { q: 'Conte as linhas por categoria em vez de por mês.', code: R`print(df["categoria"].value_counts())`, why: 'O `value_counts` conta quantas vezes cada valor aparece, do mais frequente para o menos.' },
  'py-3-30': { q: 'Some o total por produto e ordene do maior para o menor.', code: R`df["total"] = df["qtd"] * df["preco"]
print(df.groupby("produto")["total"].sum().sort_values(ascending=False))`, why: 'Este é o caminho completo de uma análise: criar a coluna, agrupar, somar e ordenar. O primeiro da lista é o campeão.' },
};
