// Python — NÍVEL BÁSICO: as 4 explicações de cada lição, escritas como se a pessoa tivesse 10 anos e estivesse vendo isso pela primeira vez.
//   [ O que é ,  Para que serve ,  Como você vai usar aqui ,  O que vai aparecer na tela ]
// A chave é o id da lição. `npm test` confere que toda lição tem as 4 explicações.
module.exports = {
  'py-1-01': [
    `Programar é dar ordens para o computador, escrevendo numa língua que ele entende. Python é uma dessas línguas. A ordem print() quer dizer "escreva isto na tela". O texto que você quer escrever vai entre aspas.`,
    `Serve para o programa "falar" com você: mostrar resultados, avisos e mensagens. Quase todo programa começa assim.`,
    `Escreva a palavra print, abra um parêntese, coloque o texto entre aspas e feche o parêntese. Fica assim: print("Olá, mundo!").`,
    `A mensagem aparece na área de saída (é o lugar onde o programa mostra o que ele fez), sem as aspas: Olá, mundo!`],
  'py-1-02': [
    `Um programa é uma lista de ordens. O Python lê a lista de cima para baixo, uma ordem de cada vez, como você segue uma receita de bolo.`,
    `Serve para mostrar várias coisas em ordem, uma embaixo da outra.`,
    `Escreva um print() em cada linha, na ordem em que você quer que as mensagens apareçam.`,
    `Cada print vira uma linha nova na saída: primeiro Bom dia e, embaixo, Vamos programar.`],
  'py-1-03': [
    `O Python também é uma calculadora: + soma, - subtrai, * multiplica e / divide. Os números não levam aspas.`,
    `Serve para fazer as contas do dia a dia: preço, troco, média, total.`,
    `Ponha a conta dentro do print, assim: print(7 * 6). O Python faz a conta e mostra a resposta.`,
    `Aparece o resultado da conta, e não a conta escrita: 42.`],
  'py-1-04': [
    `Variável é uma caixinha com etiqueta, onde você guarda uma informação para usar depois. Exemplo: cidade = "Recife" quer dizer "guarde a palavra Recife na caixinha chamada cidade".`,
    `Serve para guardar um dado e usar de novo quando precisar, sem escrever tudo outra vez. E, se o dado mudar, você muda em um lugar só.`,
    `Escreva o nome da caixinha, o sinal = e o valor: cidade = "Recife". Depois, para ver o que tem dentro, escreva só o nome (sem aspas) dentro do print: print(cidade).`,
    `O print mostra o que está guardado na caixinha, e não o nome dela: Recife.`],
  'py-1-05': [
    `Você pode usar as caixinhas (variáveis) dentro de contas, como numa fórmula de matemática: preco * qtd.`,
    `Serve para calcular totais que mudam. Se você trocar o valor guardado, a conta se acerta sozinha.`,
    `Crie as caixinhas nas linhas de cima (preco = 50 e qtd = 3) e escreva os nomes delas na conta, dentro do print: print(preco * qtd).`,
    `Aparece o resultado da conta: 150.`],
  'py-1-06': [
    `Além de + - * /, existem três contas especiais: % dá o resto da divisão (17 dividido por 5 dá 3 e sobram 2), // faz a divisão sem a parte quebrada e ** é a potência (2 ** 10 é 2 vezes ele mesmo, 10 vezes).`,
    `O resto serve para saber se um número é par ou ímpar. A potência serve para juros e áreas. O // serve para repartir em grupos inteiros.`,
    `Escreva cada conta no seu print: print(17 % 5) e, na linha de baixo, print(2 ** 10).`,
    `Duas linhas: 2 (sobram 2 quando você divide 17 por 5) e 1024 (o resultado de 2 elevado a 10).`],
  'py-1-07': [
    `Todo valor tem um tipo, como as coisas têm categorias. int é número inteiro, float é número com vírgula, str é texto e bool é verdadeiro ou falso.`,
    `O tipo diz o que dá para fazer com o valor: somar números é diferente de juntar textos.`,
    `Coloque o valor dentro de type() e mostre com o print: print(type(3.5)). O type() responde "de que tipo é isso?".`,
    `O nome do tipo, escrito assim: <class 'float'>. Quer dizer que 3.5 é um número com vírgula.`],
  'py-1-08': [
    `Dá para transformar um tipo em outro. int() faz virar número inteiro, float() faz virar número com vírgula e str() faz virar texto. "20" com aspas é um texto, e não um número!`,
    `Serve porque tudo que uma pessoa digita chega como texto. Para fazer contas com esses dados, é preciso transformar em número antes.`,
    `Envolva o valor com a função do tipo que você quer: int("20"). Agora já dá para somar: print(int("20") + 5).`,
    `Aparece o número já somado: 25. Sem converter, "20" + 5 daria erro.`],
  'py-1-09': [
    `O sinal + entre dois textos cola um no outro e forma um texto só. Isso se chama concatenar (é como juntar dois vagões de trem).`,
    `Serve para montar mensagens, nomes completos e frases usando pedaços separados.`,
    `Ligue os textos e as variáveis com +, assim: "Olá, " + nome. Cuidado com os espaços: o espaço depois da vírgula está dentro das aspas.`,
    `Uma frase só, com os pedaços colados: Olá, Ana`],
  'py-1-10': [
    `f-string é um texto com a letra f antes das aspas. Dentro dele, o que estiver entre chaves { } vira o valor da variável: f"{nome} tem {idade} anos". É como uma frase com lacunas que o Python preenche.`,
    `Serve para montar frases com dados que mudam, de um jeito limpo, sem ficar emendando tudo com +.`,
    `Coloque o f antes das aspas e escreva o nome de cada variável entre { }, no lugar do texto onde ela deve aparecer: print(f"{nome} tem {idade} anos").`,
    `A frase pronta, com os valores no lugar das chaves: Bia tem 25 anos`],
  'py-1-11': [
    `len() conta quantas letras (caracteres) tem um texto. O .upper() devolve o texto com LETRAS MAIÚSCULAS.`,
    `Serve para conferir o tamanho de uma coisa (como uma senha) e para deixar os textos todos no mesmo formato.`,
    `O len recebe o texto dentro dos parênteses: len(palavra). O upper vem depois de um ponto, colado na variável: palavra.upper().`,
    `Duas linhas: 6 (as letras de "python") e PYTHON.`],
  'py-1-12': [
    `.strip() tira os espaços das pontas do texto (como cortar as bordas de uma folha), e .lower() deixa tudo em letras minúsculas. Dá para usar um depois do outro.`,
    `Serve para limpar o que as pessoas digitam, que muitas vezes vem com espaço sobrando e letra maiúscula, antes de comparar ou guardar.`,
    `Escreva um depois do outro, da esquerda para a direita: texto.strip().lower().`,
    `O texto limpo, sem espaços nas pontas e em minúsculas: data science`],
  'py-1-13': [
    `Cada letra de um texto tem um número de posição, e a contagem começa no 0 (e não no 1). Em "analise", a letra 0 é o "a". palavra[0:3] pega do 0 até antes do 3.`,
    `Serve para tirar um pedaço de um texto: as iniciais, o começo de um código, o final de um nome.`,
    `Use colchetes depois do texto. Uma letra: palavra[0]. Um trecho: palavra[0:3] (o último número não entra).`,
    `Duas linhas: a primeira letra (a) e as 3 primeiras letras (ana).`],
  'py-1-14': [
    `Comparar é fazer uma pergunta ao Python: ==, !=, >, <, >=, <=. A resposta é sempre True (verdadeiro) ou False (falso).`,
    `É a base de toda decisão de um programa: maior ou menor? igual ou diferente?`,
    `Escreva os dois valores com o sinal no meio: print(10 > 5). Atenção: um = guarda um valor numa caixinha; dois == comparam dois valores.`,
    `Duas linhas: True (10 é maior que 5) e False (3 não é igual a 4).`],
  'py-1-15': [
    `and quer dizer "e": só dá verdadeiro se as DUAS coisas forem verdadeiras. or quer dizer "ou": basta UMA. E not vira o resultado do avesso.`,
    `Serve para juntar regras: "maior de idade E com conta", "sábado OU domingo".`,
    `Escreva cada comparação inteira e ligue com and ou or: idade >= 18 and tem_conta.`,
    `True ou False. Aqui sai True, porque 20 >= 18 é verdade e tem_conta também é verdade.`],
  'py-1-16': [
    `O if quer dizer "se". O programa só faz o que está dentro do if quando a condição é verdadeira. O que está dentro fica um pouco para a direita (4 espaços), como um parágrafo.`,
    `Serve para o programa tomar decisões: só aprovar se a nota for boa, só avisar se o estoque acabar.`,
    `Escreva if nota >= 7: com dois-pontos no final e, na linha de baixo, a ordem com 4 espaços na frente: print("Aprovado").`,
    `Se a condição for verdadeira, aparece Aprovado. Se fosse falsa, não apareceria nada.`],
  'py-1-17': [
    `O else quer dizer "senão". É o plano B: roda quando a condição do if é falsa.`,
    `Serve para o programa sempre ter uma resposta: um caminho para o "sim" e outro para o "não".`,
    `Depois do bloco do if, escreva else: bem alinhado com o if e, embaixo, a ordem com 4 espaços na frente.`,
    `Aparece só um dos dois textos. Com 15 graus, a condição >= 20 é falsa, então sai Frio.`],
  'py-1-18': [
    `O elif é um "senão, se...". Ele testa uma nova pergunta quando a anterior deu falso, e assim você consegue mais de dois caminhos.`,
    `Serve para colocar em faixas: aprovado, recuperação ou reprovado.`,
    `A ordem é: if, depois um ou mais elif e, no final, o else para o que sobrou. O Python para na primeira condição que for verdadeira.`,
    `Aparece só uma mensagem. Com nota 6.5 não vale >= 7, mas vale >= 5: Recuperação.`],
  'py-1-19': [
    `Lista é uma fila de coisas guardadas numa caixinha só, dentro de colchetes e separadas por vírgula, como uma lista de compras.`,
    `Serve para trabalhar com vários dados juntos: nomes, notas, preços, itens de um pedido.`,
    `Escreva o nome da lista, o sinal = e os itens entre colchetes: frutas = ["maçã", "banana", "uva"]. Textos levam aspas; números não.`,
    `A lista inteira, com colchetes e aspas simples: ['maçã', 'banana', 'uva']`],
  'py-1-20': [
    `Cada item da lista tem uma posição, e a contagem começa no 0: o primeiro é o 0, o segundo é o 1. A posição -1 é um truque para pegar o último item.`,
    `Serve para pegar um item específico: o primeiro, o último, o terceiro.`,
    `Escreva o nome da lista e a posição entre colchetes: print(frutas[0]) e print(frutas[-1]). A lista frutas já está pronta para você.`,
    `Duas linhas: maçã (o primeiro) e uva (o último).`],
  'py-1-21': [
    `.append() quer dizer "acrescente no final". Ele coloca um item novo no fim da lista.`,
    `Serve para ir montando uma lista aos poucos: novos pedidos, novos alunos, resultados de contas.`,
    `Escreva lista.append(valor) e depois mostre a lista com o print para ver como ficou: numeros.append(4) e print(numeros).`,
    `A lista com o item novo no final: [1, 2, 3, 4]`],
  'py-1-22': [
    `sum() soma todos os números de uma lista, max() acha o maior e min() acha o menor.`,
    `Serve para resumir uma lista de números numa linha só: o total, o melhor e o pior resultado.`,
    `Passe a lista entre parênteses: sum(notas), max(notas) e min(notas), cada um no seu print. A lista notas já está pronta para você.`,
    `Três linhas: 31 (a soma), 10 (o maior) e 5 (o menor).`],
  'py-1-23': [
    `O for é um repetidor: ele faz a mesma coisa para cada item de uma lista, um de cada vez. "Para cada fruta da lista, faça isto."`,
    `Serve para tratar todos os itens sem copiar e colar o mesmo código várias vezes.`,
    `Escreva for fruta in frutas: e, na linha de baixo com 4 espaços na frente, o que fazer com cada um: print(fruta.upper()).`,
    `Uma linha para cada fruta, já em maiúsculas: MAÇÃ, BANANA e UVA.`],
  'py-1-24': [
    `range(1, 6) cria os números de 1 até 5. O último número que você escreve (o 6) NÃO entra.`,
    `Serve para repetir algo um número exato de vezes, ou para andar por uma sequência de números.`,
    `Escreva for i in range(1, 6): e use o i lá dentro. Para ir até o 5, o número final é 6.`,
    `Os números de 1 a 5, um por linha.`],
  'py-1-25': [
    `Acumulador é uma caixinha que começa em 0 e vai ficando maior a cada volta do repetidor, como um cofrinho: total += i quer dizer "ponha mais i no total".`,
    `Serve para somar e contar enquanto você percorre uma sequência.`,
    `Crie total = 0 antes do for, some dentro dele com total += i e mostre o resultado depois (sem os 4 espaços na frente), para aparecer só uma vez.`,
    `O valor final: 55, que é a soma de 1 até 10.`],
  'py-1-26': [
    `O while quer dizer "enquanto". Ele repete o que está dentro dele ENQUANTO a condição for verdadeira. Cuidado: se a condição nunca ficar falsa, o programa nunca para!`,
    `Serve para repetir quando você não sabe quantas vezes vai precisar: até acertar a senha, até acabar a lista.`,
    `Crie o contador antes (contador = 1), escreva while contador <= 3: e, lá dentro, mostre o contador e some 1 a ele: contador += 1.`,
    `Os números 1, 2 e 3, um por linha. Se você esquecer de somar 1 ao contador, o programa nunca termina.`],
  'py-1-27': [
    `Dentro de um repetidor você pode colocar um if para decidir o que fazer com cada item. O if fica dentro do for, com mais 4 espaços para a direita.`,
    `Serve para escolher só alguns itens enquanto percorre a lista: só os pares, só os maiores que um valor, só os aprovados.`,
    `Escreva o for e, dentro dele, um if com a pergunta: n % 2 == 0 quer dizer "o resto da divisão por 2 é zero", ou seja, é par. O print vai dentro do if.`,
    `Só os números que passaram no teste, um por linha: 8, 12 e 6.`],
  'py-1-28': [
    `Função é uma receita com nome, que você escreve uma vez e usa quantas vezes quiser. O def cria a função e o return devolve a resposta dela.`,
    `Serve para não repetir código: você escreve a regra uma única vez e chama a função sempre que precisar.`,
    `Escreva def dobro(x): e, com 4 espaços na frente, return x * 2. Depois use a função: print(dobro(7)).`,
    `O valor que o return devolveu, mostrado pelo print: 14.`],
  'py-1-29': [
    `Dicionário é como uma ficha, com etiquetas e valores: entre chaves { }, cada dado tem um nome (a chave) e um valor, no formato chave: valor.`,
    `Serve para descrever uma coisa com vários dados: um aluno com nome e nota, um produto com preço e estoque.`,
    `Escreva aluno = {"nome": "Ana", "nota": 9} e leia cada valor pela etiqueta, entre colchetes: aluno["nome"].`,
    `Dois valores, um por linha: Ana e 9.`],
  'py-1-30': [
    `Um mini desafio que junta tudo: uma função, uma soma e uma contagem de itens para calcular uma média. Média é somar tudo e dividir pela quantidade.`,
    `Serve para transformar uma lista de números em um único número que resume todos eles, algo que se faz o tempo todo com dados.`,
    `Crie def media(numeros): e devolva sum(numeros) / len(numeros). Depois chame a função com uma lista: print(media([8, 6, 10])).`,
    `A média como número com vírgula: 8.0 (a soma, 24, dividida por 3 itens).`]
};
