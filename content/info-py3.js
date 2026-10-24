// Python — NÍVEL AVANÇADO: as 4 explicações de cada lição, na ordem:
//   [ O que é ,  Para que serve ,  Como se faz ,  Qual o retorno esperado ]
module.exports = {
  'py-3-01': [
    `Uma classe é um molde; cada objeto criado a partir dela é uma instância. Por convenção, o nome da classe começa com letra maiúscula.`,
    `Para organizar programas grandes: cada "coisa" do mundo real (produto, cliente, conta) vira um tipo próprio.`,
    `Escreva class Produto: com um corpo (pass, se ainda estiver vazio). Crie um objeto chamando a classe: p = Produto().`,
    `O nome da classe do objeto criado: Produto.`],
  'py-3-02': [
    `__init__ é o método que roda sozinho quando o objeto é criado e guarda os dados dele em self.`,
    `Para que cada objeto já nasça com suas informações: nome e preço do produto, titular da conta.`,
    `Escreva def __init__(self, nome, preco): e guarde cada dado com self.nome = nome. Ao criar, passe os valores: Produto("Mouse", 80).`,
    `Dois valores lidos do objeto, um por linha: Mouse e 80.`],
  'py-3-03': [
    `Métodos são funções que pertencem à classe. O primeiro parâmetro é sempre self, o próprio objeto.`,
    `Para que o objeto saiba fazer coisas com os próprios dados: calcular desconto, depositar, sacar.`,
    `Dentro da classe, escreva def com_desconto(self, pct): e use self.preco no cálculo. Chame com ponto: objeto.com_desconto(10).`,
    `O preço calculado pelo método: 585.0 (650 menos 10%).`],
  'py-3-04': [
    `__str__ define como o objeto aparece quando é impresso com print().`,
    `Para que o objeto mostre um texto amigável, em vez de algo como <__main__.Produto object>.`,
    `Dentro da classe, escreva def __str__(self): e use return com o texto montado, por exemplo f"{self.nome} - R$ {self.preco}".`,
    `O texto que você definiu, no lugar do endereço do objeto: Mouse - R$ 80.`],
  'py-3-05': [
    `Herança: uma classe filha recebe tudo da classe mãe. Escreve-se class Filha(Mae).`,
    `Para reaproveitar código: o que é comum fica na mãe, e cada filha só acrescenta o que é dela.`,
    `Coloque o nome da mãe entre parênteses na filha: class Cachorro(Animal). Ela já terá o método falar() sem você reescrevê-lo.`,
    `O resultado do método herdado: ... (o que a classe mãe devolve).`],
  'py-3-06': [
    `super() chama o método da classe mãe, para reaproveitar o que ela já faz.`,
    `Para a filha completar a mãe em vez de duplicar código: a mãe guarda o nome, a filha guarda o curso.`,
    `No __init__ da filha, chame super().__init__(nome) e depois guarde o dado novo com self.curso = curso.`,
    `Dois valores do objeto Aluno, um por linha: Ana (guardado pela mãe) e SQL (guardado pela filha).`],
  'py-3-07': [
    `Polimorfismo: classes diferentes têm métodos com o mesmo nome, cada uma com seu comportamento.`,
    `Para tratar objetos diferentes do mesmo jeito: quem chama não precisa saber de qual classe é cada um.`,
    `Escreva o mesmo método (som) em cada classe com retornos diferentes e percorra uma lista com um objeto de cada: for a in [Gato(), Pato()]: print(a.som()).`,
    `Cada objeto responde do seu jeito, uma linha para cada: Miau e Quack.`],
  'py-3-08': [
    `@property transforma um método em um atributo calculado: objeto.area em vez de objeto.area().`,
    `Para valores que dependem de outros e devem ser lidos como se fossem dados simples (área, total, idade).`,
    `Escreva @property na linha acima do def area(self): e devolva o cálculo com return self.l * self.a. Ao ler, não use parênteses.`,
    `O valor calculado, lido sem parênteses: 12 (3 × 4).`],
  'py-3-09': [
    `@classmethod recebe a própria classe (cls) e serve para criar objetos de outras formas; @staticmethod é uma função solta que mora dentro da classe.`,
    `Para ter "construtores alternativos" (uma conta vazia, um produto vindo de texto) e funções utilitárias agrupadas na classe.`,
    `Escreva @classmethod, depois def vazia(cls): e devolva cls(0). Chame direto na classe: Conta.vazia().`,
    `O saldo do objeto criado pelo método de classe: 0.`],
  'py-3-10': [
    `@dataclass cria sozinho o __init__ e a representação em texto, a partir dos campos declarados.`,
    `Para classes que só guardam dados, com bem menos código e sem esquecer nada.`,
    `Importe com from dataclasses import dataclass, escreva @dataclass antes da classe e declare cada campo com tipo: nome: str.`,
    `O objeto impresso já com todos os campos: Produto(nome='Mouse', preco=80.0).`],
  'py-3-11': [
    `Um gerador é uma função com yield: ele entrega um valor de cada vez e lembra onde parou. Não cria a lista toda na memória.`,
    `Para trabalhar com sequências enormes (ou infinitas) gastando pouca memória.`,
    `Escreva uma função com um laço e use yield i para entregar cada valor. Para ver tudo de uma vez, use list(pares(10)).`,
    `A lista dos valores entregues: [0, 2, 4, 6, 8, 10].`],
  'py-3-12': [
    `Generator expression é parecida com a list comprehension, mas com parênteses: calcula cada valor só quando precisa.`,
    `Para somar, contar ou procurar em muitos itens sem criar uma lista intermediária.`,
    `Escreva a expressão dentro do parêntese da função, sem colchetes: sum(x * x for x in range(1, 101)).`,
    `Um único número: 338350, a soma dos quadrados de 1 a 100.`],
  'py-3-13': [
    `iter() cria um iterador a partir de uma lista e next() entrega o próximo item cada vez que é chamado.`,
    `Para entender como o for funciona por baixo e para ler um item de cada vez, quando precisar.`,
    `Crie it = iter(lista) e chame next(it) uma vez para cada item que quiser pegar. Ao acabar os itens, dá erro (StopIteration).`,
    `Os dois primeiros itens, um por linha: a e b.`],
  'py-3-14': [
    `Um decorator é uma função que envolve outra função para acrescentar comportamento, sem mudar o código dela.`,
    `Para repetir um comportamento (log, tempo, validação, formatação) em várias funções com uma linha só: @nome_do_decorator.`,
    `Escreva uma função que recebe a função original, define uma função interna que a chama e devolve o resultado ajustado, e devolva a interna. Aplique com @em_maiusculas.`,
    `O resultado da função decorada: OLÁ (o texto original "olá" passou pela regra do decorator).`],
  'py-3-15': [
    `Um decorator mais geral: *args e **kwargs deixam o decorator funcionar com qualquer função, e functools.wraps preserva o nome original.`,
    `Para criar decorators reutilizáveis, que servem tanto para funções com 1 parâmetro como com 10.`,
    `Defina a função interna com (*args, **kwargs), faça o que precisar (como imprimir) e devolva f(*args, **kwargs).`,
    `Duas linhas: chamando soma (o aviso do decorator) e 5 (o resultado normal da soma).`],
  'py-3-16': [
    `Closure: uma função criada dentro de outra "lembra" das variáveis da função de fora, mesmo depois que ela terminou.`,
    `Para criar funções personalizadas por configuração, como um desconto de 10% e outro de 20%, sem repetir código.`,
    `A função externa recebe o dado (pct) e devolve a interna, que o usa: fabrica_desconto(10) devolve uma função que aplica 10%.`,
    `O preço com o desconto da função criada: 180.0 (200 menos 10%).`],
  'py-3-17': [
    `@lru_cache guarda os resultados já calculados de uma função. Chamar de novo com o mesmo valor devolve o resultado guardado.`,
    `Para acelerar muito funções recursivas que repetem os mesmos cálculos, como a sequência de Fibonacci.`,
    `Importe com from functools import lru_cache e escreva @lru_cache(maxsize=None) na linha acima do def.`,
    `O resultado, instantâneo mesmo sendo grande: 102334155 (o 40º número de Fibonacci).`],
  'py-3-18': [
    `itertools é um módulo de ferramentas para combinar e agrupar: permutations, combinations, chain...`,
    `Para gerar todas as combinações possíveis (duplas de uma equipe, trocas de ordem) sem escrever laços.`,
    `Importe combinations, chame combinations(equipe, 2) e converta para lista com list() para contar com len().`,
    `A quantidade de duplas possíveis entre 5 pessoas: 10.`],
  'py-3-19': [
    `reduce() combina todos os itens de uma lista em um único valor, aplicando uma função de dois em dois.`,
    `Para acumular um resultado qualquer: multiplicar tudo, juntar textos, achar um máximo.`,
    `Importe com from functools import reduce e escreva reduce(lambda a, b: a * b, lista): a lambda diz como juntar dois itens.`,
    `Um único valor: 120 (2 × 3 × 4 × 5).`],
  'py-3-20': [
    `O with garante que algo seja aberto e fechado corretamente (arquivos, conexões). io.StringIO simula um arquivo dentro da memória.`,
    `Para nunca esquecer de fechar um recurso, mesmo se ocorrer um erro no meio do caminho.`,
    `Escreva with io.StringIO(texto) as f: e, recuado, leia o conteúdo com f.readlines(). Fora do bloco, use o resultado.`,
    `A quantidade de linhas lidas: 3.`],
  'py-3-21': [
    `Pandas é a principal biblioteca de análise de dados do Python. Um DataFrame é uma tabela, com linhas e colunas.`,
    `Para trabalhar com tabelas grandes (como uma planilha), filtrando, somando e agrupando em poucas linhas de código.`,
    `O df desta atividade já vem carregado. Use len(df) para contar as linhas e df.columns.tolist() para listar os nomes das colunas.`,
    `Duas linhas: 7 (linhas da tabela) e a lista dos nomes: ['produto', 'categoria', 'qtd', 'preco', 'mes'].`],
  'py-3-22': [
    `df.head(n) mostra as primeiras n linhas; df.shape devolve (linhas, colunas); df.describe() resume os números.`,
    `Para dar uma primeira olhada em uma tabela: o tamanho, o formato e como são os dados.`,
    `Escreva print(df.shape). Para pegar uma coluna, use colchetes com o nome: df.head(3)["produto"], e converta com .tolist().`,
    `Duas linhas: (7, 5), que são 7 linhas e 5 colunas, e a lista dos 3 primeiros produtos.`],
  'py-3-23': [
    `df[condição] devolve só as linhas que atendem à condição. Várias condições se combinam com & (e) e | (ou), cada uma entre parênteses.`,
    `Para recortar a tabela: só eletrônicos, só vendas acima de um valor, só um mês.`,
    `Escreva df[(df["categoria"] == "Eletrônicos") & (df["qtd"] > 3)] e depois escolha a coluna ["produto"] com .tolist().`,
    `A lista dos produtos que passaram nas duas condições: ['Mouse', 'Mouse'].`],
  'py-3-24': [
    `Criar uma coluna nova com cálculos: df["total"] = df["qtd"] * df["preco"]. A conta é feita linha por linha.`,
    `Para acrescentar indicadores à tabela: total da venda, margem, preço com desconto.`,
    `Escreva df["nome_da_coluna_nova"] = conta com as colunas existentes. Depois, df["total"].tolist() lista os valores.`,
    `A lista com o total de cada uma das 7 linhas: [7000, 800, 900, 150, 320, 1950, 360].`],
  'py-3-25': [
    `groupby agrupa as linhas por uma coluna e permite somar, contar ou tirar a média de cada grupo.`,
    `Para responder "quanto por categoria?", "quantos por mês?": o resumo de uma tabela por grupo.`,
    `Escreva df.groupby("categoria")["qtd"].sum(): primeiro o agrupamento, depois a coluna, depois a conta. Use .to_dict() para ver como dicionário.`,
    `Um dicionário com a soma de cada grupo: {'Eletrônicos': 16, 'Móveis': 4, 'Papelaria': 70}.`],
  'py-3-26': [
    `sort_values("coluna", ascending=False) ordena a tabela por uma coluna, do maior para o menor.`,
    `Para montar rankings: os produtos mais caros, os clientes que mais compraram.`,
    `Escreva df.sort_values("preco", ascending=False).head(3) para ordenar e pegar os 3 primeiros; depois ["produto"].tolist().`,
    `A lista dos 3 produtos mais caros, do mais caro para o mais barato: ['Notebook', 'Cadeira', 'Mesa'].`],
  'py-3-27': [
    `.agg() calcula várias estatísticas de uma vez, e dá para combinar com groupby para resumir cada grupo.`,
    `Para tirar soma, média, máximo e mínimo de cada grupo em uma só chamada.`,
    `Crie a coluna total, agrupe por categoria e escolha a conta: df.groupby("categoria")["total"].max().to_dict().`,
    `Um dicionário com a maior venda de cada categoria: {'Eletrônicos': 7000, 'Móveis': 1950, 'Papelaria': 360}.`],
  'py-3-28': [
    `merge() junta duas tabelas por uma coluna em comum, igual ao JOIN do SQL.`,
    `Para cruzar informações que estão em tabelas separadas: vendas com metas, pedidos com clientes.`,
    `Escreva pd.merge(df, metas, on="categoria") e depois escolha a coluna ["meta"].tolist().`,
    `A meta correspondente a cada linha da tabela de vendas: [5000, 5000, 2000, 300, 5000, 2000, 300].`],
  'py-3-29': [
    `value_counts() conta quantas vezes cada valor aparece; pivot_table() resume os dados em formato de tabela dinâmica.`,
    `Para ver a frequência de cada categoria e para montar resumos cruzados como os da planilha.`,
    `Use df["mes"].value_counts().to_dict() e df.pivot_table(index="mes", values="qtd", aggfunc="sum"): o index é o que fica nas linhas.`,
    `Dois dicionários: quantas vendas houve em cada mês e o total de qtd de cada mês.`],
  'py-3-30': [
    `Projeto final do nível: transformar dados brutos em uma resposta de negócio (qual produto rendeu mais?).`,
    `Para treinar o fluxo completo de um analista: calcular, agrupar, achar o melhor e apresentar o resultado.`,
    `Crie a coluna total, agrupe por produto com groupby e some, use idxmax() para o nome do campeão e max() para o valor, e monte a frase com f-string.`,
    `Uma linha: Campeão: Notebook com 7000.`]
};
