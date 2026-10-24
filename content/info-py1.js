// Python — NÍVEL BÁSICO: as 4 explicações de cada lição, na ordem:
//   [ O que é ,  Para que serve ,  Como se faz ,  Qual o retorno esperado ]
// A chave é o id da lição. `npm test` confere que toda lição tem as 4 explicações.
module.exports = {
  'py-1-01': [
    `print() é um comando que mostra uma mensagem na tela. O texto vai entre aspas.`,
    `Para o programa "falar" com você: mostrar resultados, avisos e qualquer informação.`,
    `Escreva print, abra parênteses, coloque o texto entre aspas e feche os parênteses: print("Oi!").`,
    `O texto aparece na saída, sem as aspas. Aqui: Olá, mundo!`],
  'py-1-02': [
    `Um programa é uma lista de comandos. O Python lê de cima para baixo, um comando de cada vez.`,
    `Para mostrar várias informações em ordem, uma embaixo da outra.`,
    `Escreva um print() por linha, na ordem em que as mensagens devem aparecer.`,
    `Cada print vira uma linha nova na saída: Bom dia e, embaixo, Vamos programar.`],
  'py-1-03': [
    `O Python funciona como uma calculadora: + soma, - subtrai, * multiplica e / divide.`,
    `Para fazer cálculos de preços, médias, totais e qualquer conta do dia a dia.`,
    `Coloque a conta dentro do print, como em print(7 * 6). Números não levam aspas.`,
    `O resultado da conta (e não a conta escrita): 42.`],
  'py-1-04': [
    `Uma variável é uma "caixinha" com nome que guarda um valor. Exemplo: cidade = "Recife".`,
    `Para guardar um dado e reutilizá-lo depois, sem repetir o valor em vários lugares.`,
    `Escreva o nome, o sinal = e o valor. Depois use só o nome: print(cidade).`,
    `O print mostra o valor guardado, não o nome da variável: Recife.`],
  'py-1-05': [
    `Variáveis entram em contas como em uma fórmula: preco * qtd.`,
    `Para calcular totais que mudam: troque o valor da variável e a conta se ajusta sozinha.`,
    `Crie as variáveis nas linhas de cima e use os nomes dentro da conta, no print.`,
    `O resultado numérico da conta: 150.`],
  'py-1-06': [
    `Além de + - * /, existem // (divisão sem a parte decimal), % (resto da divisão) e ** (potência).`,
    `O resto serve para saber se um número é par ou ímpar; a potência, para juros e áreas; o // para dividir em grupos inteiros.`,
    `Escreva a conta com o operador certo, cada uma em seu print: 17 % 5 e 2 ** 10.`,
    `Duas linhas: 2 (sobra 2 ao dividir 17 por 5) e 1024 (2 multiplicado por ele mesmo 10 vezes).`],
  'py-1-07': [
    `Todo valor tem um tipo: int (inteiro), float (decimal), str (texto) e bool (verdadeiro/falso).`,
    `O tipo define o que dá para fazer com o valor: somar números é diferente de juntar textos.`,
    `Coloque o valor dentro de type() e imprima: print(type(3.5)).`,
    `O nome do tipo, escrito assim: <class 'float'>.`],
  'py-1-08': [
    `int() e float() transformam texto em número; str() transforma número em texto.`,
    `Dados de formulários e arquivos chegam como texto. Para fazer contas com eles, é preciso converter.`,
    `Envolva o valor com a função do tipo desejado: int("20"). Depois já dá para somar: int("20") + 5.`,
    `O número já somado: 25. Sem converter, "20" + 5 daria erro.`],
  'py-1-09': [
    `O sinal + entre textos junta os pedaços em um só (isso se chama concatenação).`,
    `Para montar mensagens, nomes completos e frases usando partes separadas.`,
    `Ligue os textos e as variáveis com +, como em "Olá, " + nome. Cuide dos espaços dentro das aspas.`,
    `Uma única frase, com os pedaços colados: Olá, Ana`],
  'py-1-10': [
    `Uma f-string é um texto com a letra f antes das aspas, que aceita variáveis entre chaves: f"{nome} tem {idade} anos".`,
    `Para montar frases com dados variáveis de forma limpa, sem ficar emendando com +.`,
    `Coloque o f antes das aspas e escreva o nome de cada variável entre { }, no ponto do texto onde ela deve aparecer.`,
    `A frase pronta, com os valores no lugar das chaves: Bia tem 25 anos`],
  'py-1-11': [
    `len() conta quantos caracteres tem um texto; .upper() devolve o texto em letras maiúsculas.`,
    `Para validar tamanhos (senha, CPF) e padronizar textos antes de comparar ou mostrar.`,
    `len(palavra) recebe o texto entre parênteses; palavra.upper() usa um ponto depois da variável.`,
    `Duas linhas: 6 (letras de "python") e PYTHON.`],
  'py-1-12': [
    `.strip() tira os espaços das pontas de um texto; .lower() deixa tudo em minúsculas. Dá para usar um depois do outro.`,
    `Para limpar dados digitados por pessoas (espaços e maiúsculas a mais) antes de comparar ou guardar.`,
    `Escreva um método depois do outro, da esquerda para a direita: texto.strip().lower().`,
    `O texto limpo, sem espaços nas pontas e em minúsculas: data science`],
  'py-1-13': [
    `Cada letra de um texto tem uma posição, e a contagem começa no 0. texto[0] é a primeira letra; texto[0:3] pega do 0 até antes do 3.`,
    `Para extrair partes de um texto: iniciais, prefixos, códigos dentro de uma sequência.`,
    `Use colchetes depois do texto. Uma posição: palavra[0]. Um trecho: palavra[0:3] (o último número não entra).`,
    `Duas linhas: a primeira letra (a) e as 3 primeiras letras (ana).`],
  'py-1-14': [
    `Comparar dois valores (==, !=, >, <, >=, <=) sempre devolve True (verdadeiro) ou False (falso).`,
    `É a base de toda decisão do programa: maior ou menor? igual ou diferente?`,
    `Escreva os dois valores com o operador no meio. Atenção: = guarda um valor, == compara dois valores.`,
    `Duas linhas: True (10 é maior que 5) e False (3 não é igual a 4).`],
  'py-1-15': [
    `and exige que as duas condições sejam verdadeiras, or aceita que apenas uma seja e not inverte o resultado.`,
    `Para combinar regras: "maior de idade E com conta", "sábado OU domingo".`,
    `Escreva cada comparação completa e ligue com and/or: idade >= 18 and tem_conta.`,
    `True ou False. Aqui: True, porque 20 >= 18 e tem_conta também é verdadeira.`],
  'py-1-16': [
    `O if executa um bloco de código somente quando a condição é verdadeira. O bloco é o trecho recuado (4 espaços).`,
    `Para o programa tomar decisões: só aprovar se a nota for suficiente, só avisar se o estoque acabar.`,
    `Escreva if condição: com dois-pontos no fim e, na linha de baixo, o comando recuado com 4 espaços.`,
    `Se a condição for verdadeira, o bloco roda e aparece Aprovado; se for falsa, nada aparece.`],
  'py-1-17': [
    `O else é o caminho alternativo: roda quando a condição do if é falsa.`,
    `Para sempre ter uma resposta: um caminho para o "sim" e outro para o "não".`,
    `Depois do bloco do if, escreva else: (alinhado com o if) e, embaixo, o bloco recuado.`,
    `Só um dos dois textos aparece. Com 15 graus, a condição >= 20 é falsa e sai Frio.`],
  'py-1-18': [
    `O elif testa uma nova condição quando as anteriores falharam, o que permite mais de dois caminhos.`,
    `Para classificar em faixas: aprovado, recuperação, reprovado.`,
    `A ordem é if, depois um ou mais elif e, no fim, o else para o que sobrou. O Python para na primeira condição verdadeira.`,
    `Apenas uma mensagem. Com nota 6.5 não vale >= 7, mas vale >= 5: Recuperação.`],
  'py-1-19': [
    `Uma lista guarda vários valores em uma só variável, entre colchetes e separados por vírgula.`,
    `Para trabalhar com conjuntos de dados: nomes, notas, preços, itens de um pedido.`,
    `Escreva nome = [valor1, valor2, valor3]. Textos levam aspas; números não.`,
    `A lista inteira, com colchetes e aspas simples: ['maçã', 'banana', 'uva']`],
  'py-1-20': [
    `Os itens de uma lista têm uma posição, que começa no 0. O índice -1 pega o último item.`,
    `Para ler um item específico: o primeiro, o último, o terceiro...`,
    `Escreva a lista seguida da posição entre colchetes: frutas[0] e frutas[-1].`,
    `Dois itens, um por linha: maçã (o primeiro) e uva (o último).`],
  'py-1-21': [
    `.append(x) coloca um item novo no final da lista.`,
    `Para ir montando uma lista aos poucos: novos pedidos, novos alunos, resultados de um cálculo.`,
    `Escreva lista.append(valor) e depois imprima a lista para ver o resultado.`,
    `A lista com o item novo no fim: [1, 2, 3, 4]`],
  'py-1-22': [
    `sum() soma todos os itens de uma lista, max() acha o maior e min() acha o menor.`,
    `Para resumir uma lista de números em uma linha: total, melhor e pior resultado.`,
    `Passe a lista entre parênteses: sum(notas), max(notas) e min(notas), cada um em um print.`,
    `Três linhas: 31 (a soma), 10 (o maior) e 5 (o menor).`],
  'py-1-23': [
    `O for repete um bloco de código para cada item de uma lista.`,
    `Para processar todos os itens sem copiar o mesmo código várias vezes.`,
    `Escreva for fruta in frutas: e, recuado na linha de baixo, o que fazer com cada item.`,
    `Uma linha para cada fruta, já em maiúsculas: MAÇÃ, BANANA e UVA.`],
  'py-1-24': [
    `range(1, 6) gera os números de 1 a 5: o último valor nunca entra.`,
    `Para repetir algo um número exato de vezes ou percorrer uma sequência de números.`,
    `Escreva for i in range(início, fim): e use o i dentro do bloco. Para ir até 5, o fim é 6.`,
    `Os números de 1 a 5, um por linha.`],
  'py-1-25': [
    `Um acumulador é uma variável que começa em 0 e vai crescendo a cada volta do laço: total += i.`,
    `Para somar, contar e acumular resultados enquanto se percorre uma sequência.`,
    `Crie total = 0 antes do laço, some dentro dele com += e imprima depois do laço (sem recuo).`,
    `O valor final acumulado: 55, que é a soma de 1 até 10.`],
  'py-1-26': [
    `O while repete um bloco enquanto a condição for verdadeira. Cuidado para não criar um laço infinito!`,
    `Para repetir quando não se sabe quantas vezes: até acertar a senha, até a lista esvaziar.`,
    `Crie o contador antes (contador = 1), escreva while contador <= 3: e, dentro do bloco, faça o que precisa e some 1 ao contador.`,
    `Os números 1, 2 e 3, um por linha. Se esquecer de somar ao contador, o programa nunca termina.`],
  'py-1-27': [
    `Dentro de um laço você pode usar um if para decidir o que fazer com cada item.`,
    `Para filtrar enquanto percorre: só os pares, só os maiores que um valor, só os aprovados.`,
    `Escreva o for e, dentro dele, um if com a condição (n % 2 == 0 para par). O print vai dentro do if.`,
    `Só os números que passam no teste, um por linha: 8, 12 e 6.`],
  'py-1-28': [
    `def cria uma função, um bloco de código com nome que pode ser usado várias vezes. O return devolve o resultado.`,
    `Para não repetir código: escreva a regra uma vez e use sempre que precisar.`,
    `Escreva def dobro(x): e, recuado, return x * 2. Depois chame a função: print(dobro(7)).`,
    `O valor devolvido pelo return, mostrado pelo print: 14.`],
  'py-1-29': [
    `Um dicionário guarda pares chave: valor entre chaves { }. Cada dado tem um nome (a chave).`,
    `Para descrever uma coisa com vários dados: um aluno com nome e nota, um produto com preço e estoque.`,
    `Escreva aluno = {"nome": "Ana", "nota": 9} e leia cada valor pela chave: aluno["nome"].`,
    `Dois valores, um por linha: Ana e 9.`],
  'py-1-30': [
    `Um mini desafio que junta função, soma e contagem de itens para calcular uma média.`,
    `Para transformar uma lista de números em um único indicador, algo que se faz o tempo todo com dados.`,
    `Crie def media(numeros): e devolva sum(numeros) / len(numeros). Depois chame com uma lista: media([8, 6, 10]).`,
    `A média como número decimal: 8.0 (a soma 24 dividida por 3 itens).`]
};
