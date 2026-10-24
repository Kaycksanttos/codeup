// Python — NÍVEL AVANÇADO: as 4 explicações de cada lição, escritas como se a pessoa tivesse 10 anos e estivesse vendo isso pela primeira vez.
//   [ O que é ,  Para que serve ,  Como você vai usar aqui ,  O que vai aparecer na tela ]
module.exports = {
  'py-3-01': [
    `Classe é um molde, como a forma de fazer biscoitos. Cada biscoito feito com o molde é um objeto. Por regra, o nome da classe começa com letra maiúscula.`,
    `Serve para organizar programas grandes: cada "coisa" do mundo real (produto, cliente, conta) vira um molde próprio.`,
    `Escreva class Produto: e, na linha de baixo com 4 espaços, pass (que quer dizer "ainda está vazio"). Para fazer um objeto, chame o molde como uma função: p = Produto().`,
    `O nome do molde do objeto que você criou: Produto.`],
  'py-3-02': [
    `__init__ é uma função especial que roda sozinha no momento em que o objeto nasce. Ela guarda as informações dele dentro de self, que quer dizer "eu mesmo".`,
    `Serve para que cada objeto já nasça com os seus dados: o nome e o preço do produto, o dono da conta.`,
    `Escreva def __init__(self, nome, preco): e guarde cada dado com self.nome = nome e self.preco = preco. Para criar o objeto, mande os valores: Produto("Mouse", 80).`,
    `Dois valores lidos do objeto, um por linha: Mouse e 80.`],
  'py-3-03': [
    `Métodos são funções que moram dentro da classe, são "as coisas que o objeto sabe fazer". O primeiro parâmetro é sempre self, o próprio objeto.`,
    `Serve para o objeto saber fazer coisas com os próprios dados: calcular um desconto, depositar, sacar.`,
    `Dentro da classe, escreva def com_desconto(self, pct): e use self.preco na conta. Chame com ponto: Produto("Mesa", 650).com_desconto(10).`,
    `O preço calculado pelo método: 585.0 (650 menos 10%).`],
  'py-3-04': [
    `__str__ é a função especial que diz como o objeto aparece quando você manda imprimir com print().`,
    `Serve para o objeto mostrar um texto bonito, em vez de algo estranho como <__main__.Produto object at ...>.`,
    `Dentro da classe, escreva def __str__(self): e devolva o texto pronto com return, por exemplo f"{self.nome} - R$ {self.preco}".`,
    `O texto que você montou, no lugar do código estranho: Mouse - R$ 80.`],
  'py-3-05': [
    `Herança é como filho que herda os olhos da mãe: a classe filha recebe tudo o que a classe mãe tem. Escreve-se class Filha(Mae).`,
    `Serve para reaproveitar código: o que é igual para todos fica na mãe, e cada filha só acrescenta o que é só dela.`,
    `Escreva o nome da mãe entre parênteses depois do nome da filha: class Cachorro(Animal). Mesmo com a classe vazia (pass), ela já sabe o método falar() herdado.`,
    `O que o método herdado devolve: ... (três pontinhos, que é o que a classe Animal manda falar).`],
  'py-3-06': [
    `super() quer dizer "chame a mãe". Ele usa o que a classe mãe já sabe fazer, para você não escrever tudo de novo.`,
    `Serve para a filha completar a mãe, e não copiar: a mãe guarda o nome e a filha guarda o curso.`,
    `No __init__ da filha, escreva super().__init__(nome) para a mãe guardar o nome, e depois self.curso = curso para a filha guardar o dado novo.`,
    `Dois valores do objeto Aluno, um por linha: Ana (guardado pela mãe) e SQL (guardado pela filha).`],
  'py-3-07': [
    `Polimorfismo é uma palavra grande para uma ideia simples: bichos diferentes têm uma ação com o mesmo nome, mas cada um faz do seu jeito. O gato "faz som" miando, e o pato "faz som" fazendo quack.`,
    `Serve para tratar objetos diferentes do mesmo jeito: quem chama não precisa saber de que classe cada um é.`,
    `Escreva o mesmo método (som) nas duas classes, cada uma com um retorno. Depois passe por uma lista com um de cada: for a in [Gato(), Pato()]: print(a.som()).`,
    `Cada objeto responde do seu jeito, uma linha para cada: Miau e Quack.`],
  'py-3-08': [
    `@property transforma uma função em um "dado calculado": você lê objeto.area como se fosse um dado guardado, mas ela é calculada na hora. Fica objeto.area, e não objeto.area().`,
    `Serve para valores que dependem de outros e que devem parecer dados simples: a área, o total, a idade.`,
    `Escreva @property na linha de cima do def area(self): e devolva a conta: return self.l * self.a. Ao ler, não use parênteses: Retangulo(3, 4).area.`,
    `O valor calculado: 12 (3 vezes 4).`],
  'py-3-09': [
    `@classmethod é um método que recebe a própria classe (cls), e serve para criar objetos de outros jeitos. @staticmethod é uma função solta que só mora dentro da classe para ficar organizada.`,
    `Serve para ter "jeitos extras de criar": uma conta já vazia, um produto montado a partir de um texto.`,
    `Escreva @classmethod, depois def vazia(cls): e devolva cls(0), que cria uma Conta com saldo 0. Chame direto no molde, sem criar objeto antes: Conta.vazia().`,
    `O saldo da conta que o método criou: 0.`],
  'py-3-10': [
    `@dataclass é um atalho que escreve sozinho o __init__ e a forma de imprimir, só olhando os campos que você declarou. É como um formulário já pronto para preencher.`,
    `Serve para classes que só guardam dados: você escreve bem menos e não esquece nada.`,
    `Escreva from dataclasses import dataclass, depois @dataclass em cima da classe e liste os campos com o tipo: nome: str e preco: float.`,
    `O objeto impresso já com todos os campos: Produto(nome='Mouse', preco=80.0).`],
  'py-3-11': [
    `Gerador é uma função com yield ("entregue"): em vez de entregar tudo de uma vez, ele entrega um valor de cada vez e lembra onde parou, como distribuir figurinhas uma por uma.`,
    `Serve para trabalhar com sequências enormes (ou sem fim) gastando pouca memória do computador.`,
    `Escreva uma função com um for e use yield i para entregar cada valor. Para ver tudo de uma vez, coloque list() em volta: print(list(pares(10))).`,
    `A lista dos valores entregues: [0, 2, 4, 6, 8, 10].`],
  'py-3-12': [
    `Generator expression é parecida com aquele jeito curtinho de criar lista, mas com parênteses: ela calcula cada valor só na hora em que ele é preciso, sem montar a lista toda antes.`,
    `Serve para somar, contar ou procurar em muitos itens sem guardar a lista inteira na memória.`,
    `Escreva a expressão direto dentro do parêntese da função, sem colchetes: print(sum(x * x for x in range(1, 101))).`,
    `Um número só: 338350, a soma dos quadrados de 1 até 100.`],
  'py-3-13': [
    `iter() cria um "marcador de página" para uma lista, e next() entrega o próximo item toda vez que você pede, até acabar.`,
    `Serve para entender como o for funciona por baixo dos panos, e para ler um item de cada vez quando precisar.`,
    `Crie it = iter(["a", "b", "c"]) e chame next(it) uma vez para cada item que quiser pegar. Se pedir mais do que existe, o Python dá o erro StopIteration.`,
    `Os dois primeiros itens, um por linha: a e b.`],
  'py-3-14': [
    `Decorator é uma função que "embrulha" outra função, como papel de presente: acrescenta algo a ela sem mexer no código que está dentro.`,
    `Serve para repetir um comportamento (anotar um aviso, medir o tempo, conferir um dado) em várias funções com uma linha só: @nome_do_decorator.`,
    `Escreva uma função que recebe a função original, cria por dentro uma função nova que chama a original e muda o resultado (.upper()), e devolve a nova. Aplique escrevendo @em_maiusculas em cima de saudacao().`,
    `O resultado da função embrulhada: OLÁ (o "olá" original passou pela regra do decorator).`],
  'py-3-15': [
    `É um decorator para qualquer função. O *args e o **kwargs querem dizer "aceite quantos valores vierem", e assim o mesmo decorator serve para função com 1 ou com 10 parâmetros.`,
    `Serve para criar embrulhos reutilizáveis, que funcionam com qualquer função.`,
    `Defina a função de dentro com (*args, **kwargs), faça o que precisa (aqui, mostrar um aviso com print) e devolva f(*args, **kwargs), que chama a função de verdade com os mesmos valores.`,
    `Duas linhas: chamando soma (o aviso que o decorator escreveu) e 5 (o resultado normal da soma 2 + 3).`],
  'py-3-16': [
    `Closure é uma função criada dentro de outra que "lembra" das coisas da função de fora, mesmo depois que a de fora já acabou, como uma mochila que a função leva consigo.`,
    `Serve para fabricar funções personalizadas: uma que dá 10% de desconto e outra que dá 20%, sem repetir código.`,
    `A função de fora recebe o dado (pct) e devolve a função de dentro, que usa esse dado. Crie d10 = fabrica_desconto(10) e depois use d10(200).`,
    `O preço com o desconto da função que você fabricou: 180.0 (200 menos 10%).`],
  'py-3-17': [
    `@lru_cache dá à função uma memória: ela guarda as respostas que já calculou. Se alguém pedir de novo o mesmo cálculo, ela responde na hora, sem refazer.`,
    `Serve para acelerar muito as funções recursivas que repetem os mesmos cálculos, como a sequência de Fibonacci.`,
    `Escreva from functools import lru_cache e, na linha acima do def, @lru_cache(maxsize=None). Depois escreva a função normalmente e chame fib(40).`,
    `O resultado, instantâneo mesmo sendo um número grande: 102334155 (o 40º número de Fibonacci).`],
  'py-3-18': [
    `itertools é uma caixa de ferramentas para combinar coisas: permutations, combinations, chain e outras.`,
    `Serve para criar todas as combinações possíveis (todas as duplas de uma equipe, todas as ordens de uma fila) sem escrever repetidores.`,
    `Escreva from itertools import combinations, chame combinations(equipe, 2) para formar duplas e coloque list() em volta para poder contar com len(). A lista equipe já está pronta.`,
    `A quantidade de duplas possíveis entre 5 pessoas: 10.`],
  'py-3-19': [
    `reduce() pega uma lista inteira e vai juntando os itens dois a dois até sobrar um único valor, como dobrar uma folha até virar um quadradinho.`,
    `Serve para acumular um resultado: multiplicar tudo, juntar textos, achar o maior.`,
    `Escreva from functools import reduce e depois reduce(lambda a, b: a * b, lista). A lambda diz como juntar dois itens (aqui, multiplicar). A lista já está pronta.`,
    `Um único valor: 120 (2 × 3 × 4 × 5).`],
  'py-3-20': [
    `O with é um "abre e fecha" automático: ele abre uma coisa (um arquivo, por exemplo), deixa você usar e fecha sozinho no fim. O io.StringIO faz um texto na memória fingir que é um arquivo.`,
    `Serve para nunca esquecer de fechar um arquivo ou uma conexão, nem quando dá erro no meio do caminho.`,
    `Escreva import io e depois with io.StringIO(texto) as f: e, com 4 espaços na frente, linhas = f.readlines() para ler as linhas. Fora do bloco, use o resultado: print(len(linhas)).`,
    `A quantidade de linhas lidas: 3.`],
  'py-3-21': [
    `Pandas é a ferramenta mais usada no Python para analisar dados. Um DataFrame é uma tabela, com linhas e colunas, igual a uma planilha.`,
    `Serve para trabalhar com tabelas grandes (como uma planilha), filtrando, somando e agrupando em poucas linhas de código.`,
    `A tabela df já vem carregada nesta atividade. Use len(df) para contar as linhas e df.columns.tolist() para listar os nomes das colunas.`,
    `Duas linhas: 7 (as linhas da tabela) e a lista com os nomes das colunas: ['produto', 'categoria', 'qtd', 'preco', 'mes'].`],
  'py-3-22': [
    `Três jeitos de dar uma espiada na tabela: df.head(n) mostra as n primeiras linhas, df.shape diz o tamanho (linhas, colunas) e df.describe() resume os números.`,
    `Serve para a primeira olhada numa tabela nova: quantas linhas e colunas tem, e como são os dados.`,
    `Escreva print(df.shape). Para pegar só uma coluna, use colchetes com o nome dela: df.head(3)["produto"], e transforme em lista com .tolist().`,
    `Duas linhas: (7, 5), que quer dizer 7 linhas e 5 colunas, e a lista com os 3 primeiros produtos: ['Notebook', 'Mouse', 'Cadeira'].`],
  'py-3-23': [
    `df[condição] funciona como uma peneira: devolve só as linhas que passam na condição. Para usar duas condições juntas, use & (e) ou | (ou), com cada condição entre parênteses.`,
    `Serve para recortar a tabela: só os eletrônicos, só as vendas acima de um valor, só um mês.`,
    `Escreva df[(df["categoria"] == "Eletrônicos") & (df["qtd"] > 3)] e depois escolha a coluna ["produto"] e transforme em lista com .tolist().`,
    `A lista dos produtos que passaram nas duas regras: ['Mouse', 'Mouse'] (o Mouse aparece duas vezes porque houve duas vendas dele).`],
  'py-3-24': [
    `Dá para criar uma coluna nova na tabela fazendo uma conta com as que já existem: df["total"] = df["qtd"] * df["preco"]. A conta é feita linha por linha, sozinha.`,
    `Serve para acrescentar informação nova à tabela: o total de cada venda, a margem, o preço com desconto.`,
    `Escreva df["total"] = df["qtd"] * df["preco"] e depois mostre os valores com print(df["total"].tolist()).`,
    `A lista com o total de cada uma das 7 linhas: [7000, 800, 900, 150, 320, 1950, 360].`],
  'py-3-25': [
    `groupby quer dizer "agrupe por": ele separa as linhas em montinhos (um para cada categoria, por exemplo) e depois você soma, conta ou tira a média de cada montinho. É o GROUP BY do SQL!`,
    `Serve para responder "quanto de cada categoria?" e "quantos em cada mês?": um resumo da tabela por grupo.`,
    `Escreva df.groupby("categoria")["qtd"].sum(): primeiro o agrupamento, depois a coluna e depois a conta. Coloque .to_dict() no final para ver como dicionário.`,
    `Um dicionário com a soma de cada grupo: {'Eletrônicos': 16, 'Móveis': 4, 'Papelaria': 70}.`],
  'py-3-26': [
    `sort_values("coluna", ascending=False) coloca a tabela em fila pela coluna que você escolher, do maior para o menor. É o ORDER BY ... DESC do SQL!`,
    `Serve para montar rankings: os produtos mais caros, os clientes que mais compraram.`,
    `Escreva df.sort_values("preco", ascending=False).head(3) para ordenar e ficar só com as 3 primeiras linhas. Depois escolha ["produto"] e coloque .tolist().`,
    `A lista dos 3 produtos mais caros, do mais caro para o mais barato: ['Notebook', 'Cadeira', 'Mesa'].`],
  'py-3-27': [
    `Dá para calcular uma conta diferente (soma, média, maior, menor) em cada grupo da tabela. Aqui você vai criar a coluna total, separar por categoria e pedir o maior total de cada uma.`,
    `Serve para tirar a soma, a média, o máximo e o mínimo de cada grupo, tudo com poucas linhas.`,
    `Crie a coluna total, agrupe por categoria e peça o máximo: df.groupby("categoria")["total"].max().to_dict().`,
    `Um dicionário com a maior venda de cada categoria: {'Eletrônicos': 7000, 'Móveis': 1950, 'Papelaria': 360}.`],
  'py-3-28': [
    `merge() cola duas tabelas usando uma coluna que aparece nas duas, igual ao JOIN do SQL. Aqui, a tabela de vendas se junta com a tabela de metas pela coluna categoria.`,
    `Serve para cruzar informações que estão em tabelas separadas: vendas com metas, pedidos com clientes.`,
    `Escreva r = pd.merge(df, metas, on="categoria") (o on diz qual coluna é igual nas duas) e depois mostre print(r["meta"].tolist()). As tabelas df e metas já estão prontas.`,
    `A meta que corresponde a cada linha da tabela de vendas: [5000, 5000, 2000, 300, 5000, 2000, 300].`],
  'py-3-29': [
    `value_counts() conta quantas vezes cada valor aparece, e pivot_table() resume os dados numa tabela cruzada, como as "tabelas dinâmicas" das planilhas.`,
    `Serve para ver quantas vezes cada coisa aparece e para montar resumos cruzados.`,
    `Use df["mes"].value_counts().to_dict() para contar e df.pivot_table(index="mes", values="qtd", aggfunc="sum")["qtd"].to_dict() para somar. O index é o que fica nas linhas da tabela nova.`,
    `Dois dicionários, um por linha: quantas vendas houve em cada mês ({'mar': 3, 'jan': 2, 'fev': 2}) e o total de qtd de cada mês ({'fev': 51, 'jan': 12, 'mar': 27}).`],
  'py-3-30': [
    `É o projeto final do nível: transformar dados soltos numa resposta de verdade, tipo "qual produto trouxe mais dinheiro?".`,
    `Serve para treinar o trabalho completo de uma pessoa analista de dados: calcular, agrupar, achar o melhor e mostrar o resultado numa frase.`,
    `Crie a coluna total, agrupe por produto e some com groupby. Use idxmax() para pegar o nome do campeão e max() para o valor dele, e monte a frase com uma f-string.`,
    `Uma linha só: Campeão: Notebook com 7000.`]
};
