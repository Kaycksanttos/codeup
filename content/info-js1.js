// JavaScript — NÍVEL BÁSICO: as 4 explicações de cada lição, escritas como se a pessoa tivesse 10 anos e estivesse vendo isso pela primeira vez.
//   [ O que é ,  Para que serve ,  Como você vai usar aqui ,  O que vai aparecer na tela ]
// A chave é o id da lição. `npm test` confere que toda lição tem as 4 explicações.
module.exports = {
  'js-1-01': [
    `Programar é dar ordens para o computador, escrevendo numa língua que ele entende. JavaScript é uma dessas línguas, e é a que faz os sites ganharem vida. A ordem console.log() quer dizer "escreva isto na tela". O texto que você quer escrever vai entre aspas.`,
    `Serve para o programa "falar" com você: mostrar resultados, avisos e mensagens. Quase todo programa começa assim.`,
    `Escreva console.log, abra um parêntese, coloque o texto entre aspas e feche o parêntese. Fica assim: console.log("Ola, mundo!");`,
    `A mensagem aparece na área de saída (é o lugar onde o programa mostra o que ele fez), sem as aspas: Ola, mundo!`],
  'js-1-02': [
    `O computador lê o seu programa de cima para baixo, uma linha de cada vez, como você lê uma página. Cada console.log() escreve uma linha nova.`,
    `Serve para mostrar várias informações em ordem: um título, depois uma explicação, depois um resultado.`,
    `Escreva um console.log embaixo do outro. A primeira linha de código vira a primeira linha na tela.`,
    `Duas linhas na saída, na mesma ordem em que você escreveu: Bom dia e, embaixo, Vamos programar.`],
  'js-1-03': [
    `O JavaScript sabe fazer contas como uma calculadora. Para somar usa +, para subtrair usa -, para multiplicar usa * (asterisco) e para dividir usa /.`,
    `Serve para calcular preços, médias, quantidades... qualquer número que um programa precise descobrir.`,
    `Coloque a conta dentro do console.log: console.log(7 * 6); O computador faz a conta e mostra só o resultado.`,
    `O resultado da conta, sem a conta: o número 42.`],
  'js-1-04': [
    `Uma variável é uma caixinha com um nome, onde você guarda um valor. A palavra let diz ao JavaScript: "crie uma caixinha nova". Depois você usa o nome da caixinha em vez do valor.`,
    `Serve para guardar uma informação e usar de novo sem escrever tudo outra vez. Se o valor mudar, você muda em um lugar só.`,
    `Escreva let, o nome da variável, o sinal = e o valor: let cidade = "Recife"; Depois use console.log(cidade); sem aspas, porque é o nome da caixinha.`,
    `O que estava guardado na caixinha aparece na saída: Recife, sem aspas.`],
  'js-1-05': [
    `const também cria uma caixinha com nome, mas uma caixinha trancada: o valor guardado não pode ser trocado depois. É ótima para coisas que não mudam, como o preço de um produto.`,
    `Serve para proteger valores importantes de mudarem sem querer, e deixa o programa mais fácil de entender.`,
    `Escreva const, o nome, = e o valor. Depois use os nomes numa conta: console.log(preco * qtd);`,
    `O resultado da multiplicação dos dois valores guardados: 150.`],
  'js-1-06': [
    `Uma caixinha criada com let pode ganhar outro valor depois. O atalho += soma um número ao que já está guardado, e -= tira um número. Fica como "saldo = saldo + 50".`,
    `Serve para valores que mudam ao longo do programa: pontos de um jogo, saldo de uma conta, contador.`,
    `Crie let saldo = 100; depois escreva saldo += 50; e saldo -= 30; Só no final mostre o saldo com console.log.`,
    `O valor final da caixinha, depois das duas mudanças: 120.`],
  'js-1-07': [
    `Além de somar e multiplicar, o JavaScript tem o resto da divisão (%) e a potência (**). O resto é o que sobra depois de dividir: 17 dividido por 5 dá 3 e sobram 2. A potência multiplica o número por ele mesmo várias vezes.`,
    `O resto serve para descobrir se um número é par ou ímpar. A potência serve para contas de crescimento e de área.`,
    `Escreva console.log(17 % 5); e, embaixo, console.log(2 ** 10); Repare que o % não é porcentagem aqui.`,
    `Duas linhas: o resto da divisão, que é 2, e a potência, que é 1024.`],
  'js-1-08': [
    `Todo valor tem um tipo, que é a "espécie" dele. Número é number, texto é string e verdadeiro ou falso é boolean. A palavra typeof pergunta ao JavaScript qual é o tipo de um valor.`,
    `Serve para entender por que uma conta deu errado: o número 3.5 e o texto "3.5" parecem iguais, mas se comportam diferente.`,
    `Escreva console.log(typeof 3.5); e depois console.log(typeof "3.5"); O que está entre aspas é sempre texto.`,
    `O nome do tipo, em palavras: primeiro number e, embaixo, string.`],
  'js-1-09': [
    `Converter é trocar o tipo de um valor. Number("20") transforma o texto "20" no número 20, e String(20) faz o contrário. Isso importa porque "5" + 1 junta os dois como texto e dá "51".`,
    `Serve quando a informação chega como texto (de um formulário, por exemplo) e você precisa fazer conta com ela.`,
    `Escreva console.log(Number("20") + 5); O Number() fica por dentro e a soma por fora.`,
    `A soma de verdade, como número: 25.`],
  'js-1-10': [
    `Concatenar quer dizer juntar textos, como colar pedaços de papel. O sinal + faz isso quando os dois lados são texto.`,
    `Serve para montar frases com dados que mudam, como o nome de quem está usando o programa.`,
    `Guarde o nome numa variável e junte: console.log("Ola, " + nome); Coloque o espaço dentro das aspas, depois da vírgula.`,
    `Uma frase só, com as partes coladas: Ola, Ana`],
  'js-1-11': [
    'O template literal é um texto entre crases (`) onde você pode encaixar variáveis usando ${ }. É um jeito mais fácil de montar frases do que usar vários +.',
    'Serve para escrever mensagens com vários dados sem se perder entre aspas e sinais de mais.',
    'Use a crase no começo e no fim e coloque cada variável dentro de ${ }: `${nome} tem ${idade} anos`. Dentro de ${ } também cabe uma conta.',
    'A frase pronta, com os valores no lugar: Bia tem 25 anos'],
  'js-1-12': [
    `Um texto tem "superpoderes" chamados métodos. length diz quantas letras o texto tem, toUpperCase() e toLowerCase() trocam o tamanho das letras e trim() tira os espaços das pontas. O ponto liga o texto ao poder.`,
    `Serve para limpar o que a pessoa digita: tirar espaços sobrando, deixar tudo no mesmo tamanho de letra, contar caracteres.`,
    `Escreva o texto, um ponto e o método. Dá para encadear: texto.trim().toLowerCase(). Cada método trabalha no resultado do anterior.`,
    `Duas linhas: o texto limpo e em minúsculas (data science) e o tamanho dele sem os espaços (12).`],
  'js-1-13': [
    `Cada letra de um texto ocupa uma posição, e a contagem começa do zero. Em "analise", o "a" está na posição 0. texto[0] pega uma letra. slice(0, 3) corta um pedaço: da posição 0 até antes da 3.`,
    `Serve para pegar as iniciais de um nome, os primeiros números de um código ou um pedaço de uma frase.`,
    `Escreva palavra[0] para a primeira letra e palavra.slice(0, 3) para as três primeiras. O número final do slice não entra no pedaço.`,
    `Primeiro uma letra só (a) e, embaixo, três letras (ana).`],
  'js-1-14': [
    `includes() pergunta: "este texto tem este pedaço dentro?" e responde true (sim) ou false (não). replace() troca a primeira vez que encontra um pedaço por outro.`,
    `Serve para buscar palavras num texto e para corrigir ou trocar partes de uma frase.`,
    `Escreva frase.includes("cafe") e frase.replace("cafe", "cha"). O replace não muda a variável original: ele devolve um texto novo.`,
    `Duas linhas: true (a frase tem a palavra) e a frase nova: eu gosto de cha`],
  'js-1-15': [
    `Comparar é fazer uma pergunta ao computador: este número é maior? Esses dois valores são iguais? A resposta é sempre true (verdadeiro) ou false (falso). Para "igual" use três sinais: ===.`,
    `Serve para o programa decidir coisas: a pessoa já é maior de idade? A senha confere? O saldo é suficiente?`,
    `Escreva a comparação dentro do console.log: console.log(10 > 5); e console.log(3 === 4); Um só = guarda valor, três === comparam.`,
    `Duas linhas: true (10 é maior que 5) e false (3 não é igual a 4).`],
  'js-1-16': [
    `Os operadores lógicos juntam perguntas. && quer dizer "e" (as duas precisam ser verdade), || quer dizer "ou" (basta uma) e ! quer dizer "não" (inverte).`,
    `Serve para regras com mais de uma condição: "maior de 18 E com conta cadastrada".`,
    `Crie as variáveis e junte as perguntas com &&: console.log(idade >= 18 && temConta); Cada lado vira true ou false e depois o && decide.`,
    `Um valor só: true, porque as duas condições são verdadeiras.`],
  'js-1-17': [
    `O if ("se", em inglês) faz o computador decidir. Se a condição entre parênteses for verdadeira, o bloco entre chaves { } roda. Se for falsa, ele é pulado.`,
    `Serve para o programa se comportar de um jeito ou de outro, conforme a situação: aprovar ou não, liberar ou bloquear.`,
    `Escreva if, a condição entre parênteses e o que fazer entre chaves: if (nota >= 7) { console.log("Aprovado"); }`,
    `Como a nota 8 passa da condição, o bloco roda e aparece: Aprovado`],
  'js-1-18': [
    `O else ("senão") é o plano B do if. Se a condição for falsa, o bloco do else roda no lugar. Sempre roda um dos dois, nunca os dois.`,
    `Serve quando você precisa de uma resposta para os dois casos: quente ou frio, aberto ou fechado.`,
    `Escreva o if com o primeiro caso e, logo depois da chave que fecha, else { ... } com o segundo caso.`,
    `Com a temperatura 15 a condição é falsa, então o else roda: Frio`],
  'js-1-19': [
    `Quando existem mais de dois caminhos, use else if ("senão se"). O computador testa as condições na ordem e roda só o primeiro bloco que der verdadeiro; o else final pega o que sobrou.`,
    `Serve para faixas: notas (aprovado, recuperação, reprovado), idades, faixas de preço.`,
    `Escreva if, depois quantos else if precisar e termine com else. Ponha primeiro a condição mais difícil, como nota >= 7.`,
    `Só um texto aparece. Com nota 6.5 não passa de 7, mas passa de 5: Recuperacao`],
  'js-1-20': [
    `O operador ternário é um if escrito em uma linha só e que devolve um valor: condição ? valor se verdadeiro : valor se falso. Lê-se "se isso, então aquilo, senão aquilo outro".`,
    `Serve para escolher entre dois valores de um jeito curto, principalmente na hora de guardar o resultado numa variável.`,
    `Escreva const tipo = idade >= 18 ? "Maior" : "Menor"; e depois mostre o tipo. A pergunta vem antes do ?.`,
    `Com idade 16 a pergunta dá false e vale o texto depois dos dois-pontos: Menor`],
  'js-1-21': [
    `O switch é um if com muitos casos escolhidos por um valor exato. Ele compara a variável com cada case, e o break diz "pare aqui". O default é o caso para quando nenhum outro bateu.`,
    `Serve para escolher entre muitas opções fixas, como dia da semana, mês ou opção de um menu.`,
    `Escreva switch (dia) { case 1: ...; break; ... default: ... } Sem o break, o JavaScript continua rodando os casos de baixo.`,
    `Com o dia 3 roda o terceiro caso: Terca`],
  'js-1-22': [
    `Um array é uma lista: vários valores guardados numa variável só, entre colchetes. Cada item tem uma posição, começando do zero. frutas[1] é o segundo item. length diz quantos itens existem.`,
    `Serve para guardar coisas parecidas juntas: nomes, preços, notas de uma turma.`,
    `Use o nome do array com a posição entre colchetes: frutas[1]. Para o tamanho, escreva frutas.length (sem parênteses).`,
    `Duas linhas: o segundo item (banana) e a quantidade de itens (3).`],
  'js-1-23': [
    `O array pode crescer e encolher. push() coloca um item no fim e pop() tira o último e devolve ele. Se você mostrar o array inteiro, o JavaScript escreve ele entre colchetes, com espaços.`,
    `Serve para listas que mudam: itens de um carrinho de compras, tarefas, fila de espera.`,
    `Escreva notas.push(10); para adicionar, mostre o array e depois mostre notas.pop(), que devolve o item retirado.`,
    `Duas linhas: o array já com o 10 no fim ( [ 7, 9, 10 ] ) e o item que saiu: 10`],
  'js-1-24': [
    'O for é um laço: repete um bloco quantas vezes você mandar. Entre parênteses ele tem três partes separadas por ponto e vírgula: onde começa (let i = 1), até quando vai (i <= 5) e como avança (i++, que soma 1).',
    'Serve para não escrever a mesma coisa muitas vezes: tabuadas, listas, contagens.',
    'Escreva for (let i = 1; i <= 5; i++) { ... } e use o i dentro do bloco. Com template literal dá para escrever `3 x ${i} = ${3 * i}`.',
    'Cinco linhas, uma por volta do laço, de 3 x 1 = 3 até 3 x 5 = 15.'],
  'js-1-25': [
    `O for...of percorre um array item por item, sem precisar de contador. A cada volta, a variável do laço guarda um item da lista.`,
    `Serve para fazer a mesma coisa com cada elemento: mostrar, somar, transformar.`,
    `Escreva for (const fruta of frutas) { ... } e use o nome fruta dentro do bloco. Aqui use fruta.toUpperCase().`,
    `Uma linha para cada item do array, em maiúsculas: MACA, BANANA e UVA.`],
  'js-1-26': [
    `O while ("enquanto") repete um bloco enquanto a condição for verdadeira. Se a condição nunca ficar falsa, o laço nunca para, por isso você precisa mudar algo dentro do bloco.`,
    `Serve quando você não sabe quantas voltas serão necessárias, ou quando quer contar de trás para frente.`,
    `Crie let n = 3; escreva while (n > 0) { ... } e dentro mostre o n e faça n--; (que tira 1). O Fogo! vem depois do laço.`,
    `Quatro linhas: 3, 2, 1 e, no final, Fogo!`],
  'js-1-27': [
    `Uma função é uma receita com nome: um grupo de ordens guardado para usar quando quiser. Declarar é escrever a receita com a palavra function. Chamar é pedir para ela rodar, escrevendo o nome com parênteses.`,
    `Serve para não repetir código: escreva uma vez e chame quantas vezes precisar.`,
    `Escreva function saudar() { ... } e depois chame com saudar(); Declarar não executa nada, só chamar.`,
    `A função roda duas vezes porque foi chamada duas vezes: Bom dia! aparece duas vezes.`],
  'js-1-28': [
    `Uma função pode receber valores, os parâmetros, que ficam entre os parênteses, e devolver um resultado com return. É como uma máquina: entra um valor, sai outro.`,
    `Serve para criar contas e regras reutilizáveis, como calcular o dobro, o imposto ou a média.`,
    `Escreva function dobro(x) { return x * 2; } e mostre o resultado da chamada com console.log(dobro(7));`,
    `O valor devolvido pela função: 14`],
  'js-1-29': [
    `A arrow function (função de seta) é um jeito curto de escrever uma função: n => n * n. À esquerda da seta ficam os parâmetros e à direita o que ela devolve. Em geral é guardada numa const.`,
    `Serve para escrever funções pequenas em uma linha. Você vai vê-las o tempo todo em códigos modernos.`,
    `Escreva const quadrado = n => n * n; e use como qualquer função: console.log(quadrado(6));`,
    `Uma linha só, com o quadrado de 6 calculado pela função de seta: 36`],
  'js-1-30': [
    `Um objeto guarda várias informações sobre uma coisa só, em pares chave: valor entre chaves. Para ler, use o ponto: aluno.nome. Para criar ou trocar uma chave, também: aluno.cidade = "Recife".`,
    `Serve para representar coisas do mundo real: uma pessoa, um produto, um pedido, cada um com suas características.`,
    `Escreva const aluno = { nome: "Ana", nota: 9 }; leia com aluno.nome e crie a chave nova com aluno.cidade = "Recife";`,
    `Três linhas: o nome (Ana), a nota (9) e o objeto inteiro: { nome: 'Ana', nota: 9, cidade: 'Recife' }`],
};
