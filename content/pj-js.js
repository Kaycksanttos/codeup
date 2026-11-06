// PROJETOS DE JAVASCRIPT: 6 por nível (depois das lições 5, 10, 15, 20, 25 e 30). Veja content/pj.js.
// pj(título, tarefa, solução, [palavras obrigatórias], [o que é, para que serve, como se faz, retorno esperado], [3 dicas], {prelude, peek})
// A saída do programa do aluno é comparada com a da solução (content/expected.json, gerado por `npm run build:content`).
const { code } = require('./pj');

const out = [];

// ---------------------------------------------------------------- Básico (lições 1 a 30)
{
  const P = code('js', 1);
  out.push(
    P('recibo da lanchonete',
      'Você trabalha numa lanchonete e vai mostrar o recibo de um cliente. Um salgado custa 6 reais, um suco custa 4 reais e o cliente pediu 3 salgados e 1 suco. Crie as constantes salgado (o preço), suco (o preço) e qtd (quantos salgados) e mostre exatamente 4 linhas: (1) o texto Recibo da lanchonete; (2) o total dos salgados; (3) o preço do suco; (4) o total do pedido (salgados + suco). Faça as contas com as variáveis, sem digitar os resultados prontos.',
      'const salgado = 6;\nconst suco = 4;\nconst qtd = 3;\nconsole.log("Recibo da lanchonete");\nconsole.log(salgado * qtd);\nconsole.log(suco);\nconsole.log(salgado * qtd + suco);',
      ['const salgado', 'const suco', 'const qtd', '*', '+', 'console.log('],
      [`Um mini programa que mostra o recibo de uma lanchonete. Ele junta tudo das lições 1 a 5: console.log, vários console.log, contas, let e const (as caixinhas com nome) e contas usando variáveis.`,
        `Todo sistema de vendas faz isto: guarda os preços em variáveis e calcula o total. Se um preço mudar, você muda só uma linha e o resto se ajusta sozinho.`,
        `Crie as três constantes (salgado = 6, suco = 4 e qtd = 3). Depois use console.log quatro vezes: uma para o título e as outras para os valores, sempre calculando com as variáveis.`,
        `Quatro linhas: o título Recibo da lanchonete e, embaixo, os números 18, 4 e 22.`],
      ['Comece criando as três constantes: const salgado = 6; const suco = 4; const qtd = 3; Depois é só usar console.log quatro vezes.',
        'O total dos salgados é salgado * qtd. O total do pedido é salgado * qtd + suco. Nada de digitar 18 ou 22 à mão!',
        'A ordem: console.log("Recibo da lanchonete"), console.log(salgado * qtd), console.log(suco) e, por último, console.log(salgado * qtd + suco).']),

    P('cofrinho e cartão',
      'Um cofrinho começa com 50 reais (use let cofrinho). Some 25 e depois 15 com +=, e tire 10 com -=. O valor do cartão chegou como texto: const cartao = "120". Mostre 5 linhas: (1) o valor do cofrinho; (2) o tipo do texto cartao (typeof); (3) o tipo do cartão depois de convertido com Number(); (4) o total final, que é o cofrinho mais o cartão convertido (guarde em const total); (5) o resto da divisão do total por 7.',
      'let cofrinho = 50;\ncofrinho += 25;\ncofrinho += 15;\ncofrinho -= 10;\nconsole.log(cofrinho);\nconst cartao = "120";\nconsole.log(typeof cartao);\nconsole.log(typeof Number(cartao));\nconst total = cofrinho + Number(cartao);\nconsole.log(total);\nconsole.log(total % 7);',
      ['let cofrinho', '+=', '-=', 'typeof', 'number(', '%'],
      [`Um programa que controla um cofrinho e converte um valor que veio como texto. Ele usa as lições 6 a 10: mudar o valor de um let, resto da divisão, tipos de dados, conversão e a diferença entre soma de números e junção de textos.`,
        `Valores de formulários chegam como texto. Se você somar sem converter, o JavaScript cola os textos em vez de somar. Converter é um cuidado que todo programa precisa ter.`,
        `Use +=, +=, -= no cofrinho. Mostre o typeof do texto, converta com Number() e mostre o typeof de novo. Some o cofrinho com Number(cartao) e use % 7 no total.`,
        `Cinco linhas: 80, string, number, 200 e 4.`],
      ['O cofrinho vai assim: 50, depois 75, depois 90 e por fim 80. Escreva uma linha de += ou -= para cada mudança.',
        'typeof cartao dá string; typeof Number(cartao) dá number. O total é cofrinho + Number(cartao), uma soma de números (200), não uma junção de textos.',
        'Guarde o total em uma constante: const total = cofrinho + Number(cartao); e depois use console.log(total) e console.log(total % 7).']),

    P('ficha do cadastro',
      'O formulário de um site guardou o nome assim: const bruto = "  ana PAULA souza  ". Limpe o texto (sem espaços nas pontas e tudo em minúsculas) e guarde em const nome. Mostre 5 linhas: (1) Nome: ana paula souza (use um template literal); (2) a inicial do nome em maiúscula, que é a primeira letra; (3) quantas letras o nome tem (com os espaços do meio); (4) se o nome inclui "paula"; (5) o nome com "souza" trocado por "lima".',
      'const bruto = "  ana PAULA souza  ";\nconst nome = bruto.trim().toLowerCase();\nconsole.log(`Nome: ${nome}`);\nconsole.log(nome[0].toUpperCase());\nconsole.log(nome.length);\nconsole.log(nome.includes("paula"));\nconsole.log(nome.replace("souza", "lima"));',
      ['trim()', 'tolowercase()', '`', 'nome[0]', 'length', 'includes(', 'replace('],
      [`Um programa que limpa e consulta o nome de um cadastro. Ele usa as lições 11 a 15: template literals, métodos de texto (trim, toLowerCase, toUpperCase, length), posições do texto, includes e replace.`,
        `Gente digita nome de qualquer jeito: espaço sobrando, letra maiúscula no lugar errado. Limpar e consultar textos é uma tarefa diária em qualquer sistema.`,
        `Limpe com bruto.trim().toLowerCase() e guarde em nome. Depois use nome[0].toUpperCase(), nome.length, nome.includes("paula") e nome.replace("souza", "lima"). A 1ª linha é um template literal.`,
        `Cinco linhas: Nome: ana paula souza, A, 15, true e ana paula lima.`],
      ['Os dois métodos podem ser encadeados: bruto.trim().toLowerCase(). Guarde o resultado em const nome.',
        'A inicial é nome[0] (posição zero) e, para virar maiúscula, junte .toUpperCase(). A 1ª linha é console.log(`Nome: ${nome}`);',
        'Para as outras: nome.length (sem parênteses), nome.includes("paula") e nome.replace("souza", "lima"). Cada um dentro do seu console.log.']),

    P('ingresso do cinema',
      'Crie const idade = 25 e const estudante = true. O ingresso base custa 10 reais para quem tem até 12 anos, 20 reais de 13 a 59 anos e 10 reais a partir de 60 (use if / else if / else e guarde em let preco). Se a pessoa for estudante E o preço for 20, o preço cai para 12. Mostre 2 linhas: (1) Preco: 12 (com template literal); (2) Tipo: Estudante, ou Tipo: Comum para quem não é estudante (use o operador ternário).',
      'const idade = 25;\nconst estudante = true;\nlet preco;\nif (idade <= 12) {\n  preco = 10;\n} else if (idade < 60) {\n  preco = 20;\n} else {\n  preco = 10;\n}\nif (estudante && preco === 20) {\n  preco = 12;\n}\nconsole.log(`Preco: ${preco}`);\nconsole.log(estudante ? "Tipo: Estudante" : "Tipo: Comum");',
      ['let preco', 'else if', '&&', '===', '?', '`'],
      [`Um programa que calcula o preço de um ingresso. Ele usa as lições 16 a 20: comparações, && e ||, if, else, else if e o operador ternário.`,
        `Regras de preço (idade, estudante, promoção) são o tipo de decisão que todo sistema de vendas toma, milhões de vezes por dia.`,
        `Crie let preco; e preencha com if / else if / else conforme a idade. Depois um segundo if com idade && para o desconto de estudante. Mostre o preço com template literal e o tipo com ternário.`,
        `Duas linhas: Preco: 12 e Tipo: Estudante.`],
      ['Declare o preço sem valor (let preco;) e preencha dentro do if: idade <= 12 dá 10; idade < 60 dá 20 (já sabemos que é maior que 12); o resto dá 10.',
        'O desconto é um if separado: if (estudante && preco === 20) { preco = 12; }. Use três sinais de igual para comparar.',
        'A última linha é um ternário dentro do console.log: console.log(estudante ? "Tipo: Estudante" : "Tipo: Comum");']),

    P('lista de compras',
      'Crie const compras = ["pao", "leite"]. Adicione "cafe" e "ovos" com push e depois retire o último item com pop, guardando em const retirado. Com um laço for, mostre cada item que sobrou numerado, no formato 1. pao (uma linha por item). Depois mostre Retirado: ovos e Total: 3 (use compras.length). Por fim, crie const dia = 6 e use switch: no caso 6 mostre Sabado: dia de feira, no caso 7 mostre Domingo: dia de descanso e nos outros casos mostre Dia comum.',
      'const compras = ["pao", "leite"];\ncompras.push("cafe");\ncompras.push("ovos");\nconst retirado = compras.pop();\nfor (let i = 0; i < compras.length; i++) {\n  console.log(`${i + 1}. ${compras[i]}`);\n}\nconsole.log(`Retirado: ${retirado}`);\nconsole.log(`Total: ${compras.length}`);\nconst dia = 6;\nswitch (dia) {\n  case 6:\n    console.log("Sabado: dia de feira");\n    break;\n  case 7:\n    console.log("Domingo: dia de descanso");\n    break;\n  default:\n    console.log("Dia comum");\n}',
      ['push(', 'pop()', 'for (', 'compras.length', 'switch', 'case 6', 'default'],
      [`Um programa que cuida de uma lista de compras. Ele usa as lições 21 a 25: switch, arrays, push e pop, o laço for e o for...of.`,
        `Listas que crescem e encolhem e laços que passam por todos os itens estão em quase todo programa: carrinhos de compra, tarefas, mensagens.`,
        `Crie o array, use push duas vezes e pop uma vez. Percorra com for (let i = 0; i < compras.length; i++) e use i + 1 para numerar. Termine com um switch no valor de dia.`,
        `Seis linhas: 1. pao, 2. leite, 3. cafe, Retirado: ovos, Total: 3 e Sabado: dia de feira.`],
      ['Depois dos dois push o array é pao, leite, cafe, ovos. O pop tira o último (ovos) e devolve ele: guarde em const retirado.',
        'O laço: for (let i = 0; i < compras.length; i++). Como i começa em 0, mostre `${i + 1}. ${compras[i]}` para numerar a partir do 1.',
        'O switch compara dia com os cases: case 6, case 7 e default. Não esqueça o break no fim de cada case.']),

    P('loja de camisetas',
      'Crie o objeto const produto = { nome: "Camiseta", preco: 40 }. Crie a função total(preco, qtd), que devolve preco * qtd e, quando qtd for 3 ou mais, aplica 10% de desconto (multiplique por 0.9). Crie a arrow function formatar, que recebe um valor e devolve o texto "R$ " junto com o valor. Com um while, para qtd de 1 até 4, mostre uma linha no formato 3 x Camiseta: R$ 108 (use o nome do objeto, a função total e a formatar).',
      'const produto = { nome: "Camiseta", preco: 40 };\nfunction total(preco, qtd) {\n  const bruto = preco * qtd;\n  return qtd >= 3 ? bruto * 0.9 : bruto;\n}\nconst formatar = valor => "R$ " + valor;\nlet qtd = 1;\nwhile (qtd <= 4) {\n  console.log(`${qtd} x ${produto.nome}: ${formatar(total(produto.preco, qtd))}`);\n  qtd++;\n}',
      ['const produto', 'function total', 'return', '=>', 'while', 'produto.nome', 'produto.preco'],
      [`Um mini sistema de preços de uma loja. Ele junta as lições 26 a 30: while, funções, parâmetros e return, arrow functions e objetos.`,
        `Calcular um total com desconto por quantidade é o dia a dia de uma loja online, e separar isso em funções deixa o programa fácil de mudar.`,
        `Guarde os dados no objeto produto. A função total devolve o valor com ou sem desconto. A formatar é uma arrow function. O while repete de qtd = 1 até 4 e mostra uma linha por volta.`,
        `Quatro linhas: 1 x Camiseta: R$ 40, 2 x Camiseta: R$ 80, 3 x Camiseta: R$ 108 e 4 x Camiseta: R$ 144.`],
      ['Dentro da função total, calcule o valor bruto (preco * qtd) e devolva com desconto se qtd >= 3: return qtd >= 3 ? bruto * 0.9 : bruto;',
        'A arrow function é uma linha: const formatar = valor => "R$ " + valor; Ela só junta o texto com o número.',
        'No while, comece com let qtd = 1; e termine cada volta com qtd++; Em cada volta: console.log(`${qtd} x ${produto.nome}: ${formatar(total(produto.preco, qtd))}`);'])
  );
}

module.exports = out;
