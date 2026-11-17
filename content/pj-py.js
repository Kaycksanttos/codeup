// PROJETOS DE PYTHON: 6 por nível (depois das lições 5, 10, 15, 20, 25 e 30). Veja content/pj.js.
// pj(título, tarefa, solução, [palavras obrigatórias], [o que é, para que serve, como se faz, retorno esperado], [3 dicas], {prelude, peek})
// A saída do programa do aluno é comparada com a da solução (content/expected.json, gerado por `npm run build:content`).
const { code } = require('./pj');
const { boot, PEEK } = require('./lab');            // Automações: o computador de treino com os arquivos de cada projeto

const DF = `import pandas as pd, io
df = pd.read_csv(io.StringIO("""produto,categoria,qtd,preco,mes
Notebook,Eletronicos,2,3500,jan
Mouse,Eletronicos,10,80,jan
Cadeira,Moveis,1,900,fev
Caneta,Papelaria,50,3,fev
Mouse,Eletronicos,4,80,mar
Mesa,Moveis,3,650,mar
Caderno,Papelaria,20,18,mar
"""))
`;

const out = [];

// ---------------------------------------------------------------- Básico (lições 1 a 30)
{
  const P = code('python', 1);
  out.push(
    P('recibo da lanchonete',
      'Você trabalha numa lanchonete e vai imprimir o recibo de um cliente. Um salgado custa 6 reais, um suco custa 4 reais e o cliente pediu 3 salgados e 1 suco. Crie as variáveis salgado (o preço), suco (o preço) e qtd (quantos salgados) e imprima exatamente 4 linhas: (1) o texto Recibo da lanchonete; (2) o total dos salgados; (3) o preço do suco; (4) o total do pedido (salgados + suco). Faça as contas com as variáveis, sem digitar os resultados prontos.',
      'salgado = 6\nsuco = 4\nqtd = 3\nprint("Recibo da lanchonete")\nprint(salgado * qtd)\nprint(suco)\nprint(salgado * qtd + suco)',
      ['salgado', 'suco', 'qtd', '*', '+', 'print('],
      [`Um mini programa que imprime o recibo de uma lanchonete. Ele junta tudo das lições 1 a 5: print, vários prints, contas, variáveis (as caixinhas com nome) e contas usando variáveis.`,
        `Todo sistema de vendas faz isto: guarda os preços em variáveis e calcula o total. Se um preço mudar, você muda só uma linha e o resto se ajusta sozinho.`,
        `Crie as três variáveis (salgado = 6, suco = 4 e qtd = 3). Depois use print() quatro vezes: uma para o título e as outras para os valores, sempre calculando com as variáveis.`,
        `Quatro linhas: o título Recibo da lanchonete e, embaixo, os números 18, 4 e 22.`],
      ['Comece criando as três variáveis: salgado = 6, suco = 4 e qtd = 3. Depois é só usar print() quatro vezes.',
        'O total dos salgados é salgado * qtd. O total do pedido é salgado * qtd + suco. Nada de digitar 18 ou 22 à mão!',
        'A ordem dos prints: print("Recibo da lanchonete"), print(salgado * qtd), print(suco) e, por último, print(salgado * qtd + suco).']),

    P('ficha da aluna',
      'A escola de inglês precisa da ficha de uma aluna. As variáveis aluno, duracao (em minutos), valor_texto (o preço de UMA aula, em texto) e aulas_texto (quantas aulas, também em texto) já existem. Imprima 5 linhas: (1) Aluna: Bia (use uma f-string); (2) Duracao: 2h15min (use // para as horas e % para os minutos que sobram); (3) Total: R$ 50.0 (converta com float() e int() e multiplique); (4) o tipo do total, usando type(); (5) Pontos: 8, que é 2 elevado a 3.',
      'horas = duracao // 60\nminutos = duracao % 60\ntotal = float(valor_texto) * int(aulas_texto)\nprint(f"Aluna: {aluno}")\nprint(f"Duracao: {horas}h{minutos}min")\nprint(f"Total: R$ {total}")\nprint(type(total))\nprint(f"Pontos: {2 ** 3}")',
      ['//', '%', 'float(', 'int(', 'type(', '**'],
      [`Um programa que monta a ficha de uma aluna. Ele usa o que você viu nas lições 6 a 10: divisão inteira, resto, potência, tipos de dados, conversão de texto em número, junção de textos e f-strings.`,
        `Dados chegam como texto o tempo todo (formulários, planilhas). Saber converter para número, fazer a conta e montar uma frase bonita é o dia a dia de quem programa.`,
        `Calcule horas = duracao // 60 e minutos = duracao % 60. Converta o preço com float() e a quantidade com int(), multiplique e use f-strings com {chaves} para montar cada frase.`,
        `Cinco linhas: Aluna: Bia, Duracao: 2h15min, Total: R$ 50.0, o tipo <class 'float'> e Pontos: 8.`],
      ['As horas inteiras são duracao // 60 e os minutos que sobram são duracao % 60. Guarde os dois em variáveis.',
        'Para o total: float(valor_texto) * int(aulas_texto). O resultado é um número com vírgula (float), por isso o type() mostra float.',
        'Monte as frases com f-string: print(f"Aluna: {aluno}") e print(f"Duracao: {horas}h{minutos}min"). Os pontos são 2 ** 3.'],
      { prelude: 'aluno = "Bia"\nduracao = 135\nvalor_texto = "12.50"\naulas_texto = "4"', peek: 'print(aluno, duracao, valor_texto, aulas_texto)' }),

    P('validador de cadastro',
      'O site está validando um cadastro novo. As variáveis usuario (com espaços sobrando), senha e idade já existem. Imprima 5 linhas: (1) Login: mariasilva (guarde em login o usuário sem espaços nas pontas e em minúsculas); (2) Inicial: M (a primeira letra do login, em maiúscula); (3) se a senha tem 8 ou mais caracteres (True ou False); (4) se a pessoa é maior de idade (18 ou mais) E a senha tem 8 ou mais caracteres; (5) se a pessoa NÃO é maior de idade (use not).',
      'login = usuario.strip().lower()\nprint(f"Login: {login}")\nprint(f"Inicial: {login[0].upper()}")\nsenha_ok = len(senha) >= 8\nprint(senha_ok)\nprint(idade >= 18 and senha_ok)\nprint(not idade >= 18)',
      ['strip(', 'lower(', 'upper(', 'len(', ' and ', 'not '],
      [`Um programa que valida um cadastro. Ele usa as lições 11 a 15: len(), upper(), strip(), lower(), posições de um texto, comparações e os operadores and, or e not.`,
        `Todo site confere se o texto digitado está limpo e se as regras foram cumpridas (idade mínima, tamanho da senha). Isso evita contas erradas e senhas fracas.`,
        `Limpe com usuario.strip().lower(). Pegue a primeira letra com login[0]. Compare len(senha) >= 8 e combine as regras com and e not.`,
        `Cinco linhas: Login: mariasilva, Inicial: M e depois True, False e True (um valor por linha).`],
      ['Comece limpando o usuário: login = usuario.strip().lower(). Isso tira os espaços das pontas e deixa tudo em minúsculas.',
        'A primeira letra de um texto está na posição 0: login[0]. Para deixar em maiúscula, use .upper().',
        'Guarde senha_ok = len(senha) >= 8. Depois imprima senha_ok, idade >= 18 and senha_ok e not idade >= 18.'],
      { prelude: 'usuario = "  MariaSilva  "\nsenha = "abc12345"\nidade = 17', peek: 'print(repr(usuario), senha, idade)' }),

    P('fechando o pedido',
      'A loja virtual está fechando um pedido. A lista itens e o valor do pedido já existem. Imprima 4 linhas: (1) o primeiro item da lista; (2) o último item da lista; (3) o frete: se o valor for 200 ou mais, imprima Frete gratis; se for 100 ou mais, imprima Frete: R$ 15; senão, imprima Frete: R$ 30; (4) Pedido grande se a lista tem 3 itens ou mais, senão Pedido pequeno (use len).',
      'print(itens[0])\nprint(itens[-1])\nif valor >= 200:\n    print("Frete gratis")\nelif valor >= 100:\n    print("Frete: R$ 15")\nelse:\n    print("Frete: R$ 30")\nif len(itens) >= 3:\n    print("Pedido grande")\nelse:\n    print("Pedido pequeno")',
      ['[0]', '[-1]', 'if ', 'elif', 'else', 'len('],
      [`Um programa que fecha um pedido de loja virtual. Ele usa as lições 16 a 20: if, if e else, elif (vários caminhos), listas e as posições de uma lista.`,
        `Calcular frete, desconto e classificação é decidir com if / elif / else. E ler itens de listas pelas posições é o jeito de acessar qualquer dado guardado em sequência.`,
        `Use itens[0] para o primeiro e itens[-1] para o último. No frete, comece pelo limite maior (200), depois o do meio (100) e deixe o else para o resto. Compare len(itens) com 3.`,
        `Quatro linhas: caneta, mochila, Frete: R$ 15 e Pedido grande.`],
      ['O primeiro item de uma lista fica na posição 0 e o último na posição -1.',
        'No frete, comece pelo maior limite: if valor >= 200, depois elif valor >= 100 e, no fim, else. Só um dos caminhos é executado.',
        'Para o tamanho do pedido, use um segundo if: if len(itens) >= 3: imprima Pedido grande, senão (else) imprima Pedido pequeno.'],
      { prelude: 'itens = ["caneta", "caderno", "mochila"]\nvalor = 150', peek: 'print(itens, valor)' }),

    P('resumo da semana',
      'A lanchonete anotou as vendas dos 5 primeiros dias da semana na lista vendas. Faltam o sábado (75) e o domingo (60): adicione os dois com append. Depois imprima 6 linhas: (1) Total: 715 (use sum); (2) Maior: 220; (3) Menor: 40; (4) Dias bons: 3 (quantos dias venderam mais de 100, contando com um for e um if); (5) Vendido nos dias bons: 450 (some só esses dias com um acumulador que começa em 0); (6) Media: 102 (o total dividido pela quantidade de dias, usando // e len).',
      'vendas.append(75)\nvendas.append(60)\ntotal = sum(vendas)\ndias_bons = 0\nsoma_bons = 0\nfor v in vendas:\n    if v > 100:\n        dias_bons += 1\n        soma_bons += v\nprint(f"Total: {total}")\nprint(f"Maior: {max(vendas)}")\nprint(f"Menor: {min(vendas)}")\nprint(f"Dias bons: {dias_bons}")\nprint(f"Vendido nos dias bons: {soma_bons}")\nprint(f"Media: {total // len(vendas)}")',
      ['append(', 'sum(', 'max(', 'min(', 'for ', 'if ', '//', 'len('],
      [`Um programa que resume as vendas de uma semana. Ele usa as lições 21 a 25: append, sum, max e min, o laço for, for com range e o acumulador (uma variável que vai somando).`,
        `Resumir uma lista de números (total, maior, menor, quantos passaram de uma meta) é a primeira coisa que se faz ao analisar vendas, notas ou qualquer série de valores.`,
        `Adicione os dois dias com vendas.append(...). Crie dois acumuladores começando em 0 (dias_bons e soma_bons) e use for v in vendas com um if dentro. Depois mostre tudo com f-strings.`,
        `Seis linhas: Total: 715, Maior: 220, Menor: 40, Dias bons: 3, Vendido nos dias bons: 450 e Media: 102.`],
      ['Primeiro adicione os dois dias que faltam: vendas.append(75) e vendas.append(60). Só depois some e conte.',
        'Crie dias_bons = 0 e soma_bons = 0 antes do laço. Dentro de for v in vendas, use if v > 100 para somar 1 em dias_bons e v em soma_bons.',
        'Total: sum(vendas). Maior: max(vendas). Menor: min(vendas). Media: total // len(vendas). Mostre cada resultado com uma f-string.'],
      { prelude: 'vendas = [120, 40, 90, 220, 110]', peek: 'print(vendas)' }),

    P('boletim do aluno',
      'O professor quer o boletim do Caio. O dicionário aluno e a lista notas já existem. Crie a função media(lista), que soma os itens usando um while e devolve a soma dividida pela quantidade de itens, e a função situacao(m), que devolve Aprovado se m for 7 ou mais, Recuperacao se for 5 ou mais e Reprovado nos outros casos. Depois imprima 4 linhas: (1) Caio (7B), usando o nome e a turma do dicionário; (2) Nota baixa: 4.5 (use for e if para achar as notas abaixo de 6 e imprima uma linha por nota); (3) Media: 6.625; (4) Situacao: Recuperacao.',
      'def media(lista):\n    soma = 0\n    i = 0\n    while i < len(lista):\n        soma += lista[i]\n        i += 1\n    return soma / len(lista)\n\ndef situacao(m):\n    if m >= 7:\n        return "Aprovado"\n    elif m >= 5:\n        return "Recuperacao"\n    return "Reprovado"\n\nprint(f\'{aluno["nome"]} ({aluno["turma"]})\')\nfor n in notas:\n    if n < 6:\n        print(f"Nota baixa: {n}")\nm = media(notas)\nprint(f"Media: {m}")\nprint(f"Situacao: {situacao(m)}")',
      ['def media', 'def situacao', 'while ', 'for ', 'if ', 'return'],
      [`O projeto final do Básico: um boletim completo. Ele junta o while, for com if, funções com return e dicionários, das lições 26 a 30.`,
        `Funções guardam um passo que você usa várias vezes (calcular média, decidir a situação) e dicionários guardam os dados de uma pessoa com nomes claros. É assim que programas de verdade são organizados.`,
        `Crie media() com um while (soma e índice começando em 0) e situacao() com if / elif. Leia o dicionário com aluno["nome"], percorra as notas com for e if e mostre tudo com f-strings.`,
        `Quatro linhas: Caio (7B), Nota baixa: 4.5, Media: 6.625 e Situacao: Recuperacao.`],
      ['Dentro da media(), crie soma = 0 e i = 0. Enquanto i < len(lista), some lista[i] e aumente i em 1. No fim, devolva soma / len(lista).',
        'A situacao(m) usa if m >= 7, elif m >= 5 e um return final para Reprovado. O return encerra a função na hora.',
        'Para o título, leia o dicionário: aluno["nome"] e aluno["turma"]. As notas baixas saem de for n in notas com if n < 6. Chame media(notas) uma vez e guarde em m.'],
      { prelude: 'aluno = {"nome": "Caio", "turma": "7B"}\nnotas = [7, 4.5, 9, 6]', peek: 'print(aluno)\nprint(notas)' })
  );
}

// ---------------------------------------------------------------- Intermediário
{
  const P = code('python', 2);
  out.push(
    P('ranking da turma',
      'A professora tem as listas nomes e notas (a mesma posição é da mesma pessoa). Imprima, nesta ordem: (1) a lista aprovados, só com os nomes de quem tirou 6 ou mais, montada com zip e uma compreensão de lista; (2) uma linha para cada aprovado, no formato 1. Ana, 2. Carla... (use enumerate começando em 1); (3) a lista dos nomes que estão nas posições 0, 2 e 4 (use range com passo 2 dentro de uma compreensão); (4) a lista das notas abaixo de 6, cada uma com meio ponto de bônus (compreensão com filtro).',
      'aprovados = [n for n, x in zip(nomes, notas) if x >= 6]\nprint(aprovados)\nfor i, n in enumerate(aprovados, 1):\n    print(f"{i}. {n}")\nprint([nomes[i] for i in range(0, len(nomes), 2)])\nprint([x + 0.5 for x in notas if x < 6])',
      ['zip(', 'enumerate(', 'range(', 'for ', ' if '],
      [`Um programa que monta o ranking de uma turma. Junta as lições 1 a 5 do Intermediário: range com passo, enumerate, zip, compreensão de lista e compreensão com filtro.`,
        `Juntar duas listas, escolher só alguns itens e numerar o resultado é uma tarefa comum quando se analisam resultados que chegam separados.`,
        `Una as listas com zip(nomes, notas) e filtre com um if dentro dos colchetes. Numere com enumerate(lista, 1). Para pular de 2 em 2, use range(0, len(nomes), 2).`,
        `Seis linhas: a lista dos aprovados, quatro linhas numeradas, a lista dos nomes das posições pares e, por fim, a lista das notas com bônus.`],
      ['Para os aprovados: [n for n, x in zip(nomes, notas) if x >= 6]. O zip entrega um par (nome, nota) de cada vez.',
        'Para numerar: for i, n in enumerate(aprovados, 1): e imprima com f"{i}. {n}". Os nomes das posições pares saem de nomes[i] com i vindo de range(0, len(nomes), 2).',
        'A última lista é [x + 0.5 for x in notas if x < 6]: o if dentro da compreensão escolhe só as notas menores que 6.'],
      { prelude: 'nomes = ["Ana", "Bruno", "Carla", "Davi", "Eva", "Fabio"]\nnotas = [8, 5, 9, 4, 6, 7.5]', peek: 'print(nomes)\nprint(notas)' }),

    P('placar do campeonato',
      'O campeonato guarda a tabela em listas dentro de listas: cada linha é [nome, pontos]. A tabela e a lista apelidos já existem. Imprima 5 linhas: (1) os 3 maiores pontos, do maior para o menor (monte a lista pontos com uma compreensão, ordene com sorted e pegue os 3 primeiros com uma fatia); (2) Primeiro da tabela: Leo (12 pontos), desempacotando a primeira linha em nome e pts; (3) adicione ["Gui", 18] à tabela com append e imprima quantos jogadores há agora; (4) os apelidos ordenados pelo tamanho (sorted com key=len); (5) Soma dos 2 ultimos: 26 (some os pontos das 2 últimas linhas da tabela, usando uma fatia).',
      'pontos = [linha[1] for linha in tabela]\nprint(sorted(pontos, reverse=True)[:3])\nnome, pts = tabela[0]\nprint(f"Primeiro da tabela: {nome} ({pts} pontos)")\ntabela.append(["Gui", 18])\nprint(len(tabela))\nprint(sorted(apelidos, key=len))\nprint(f"Soma dos 2 ultimos: {sum([l[1] for l in tabela[-2:]])}")',
      ['sorted(', 'append(', 'key=len', 'for '],
      [`Um programa que organiza o placar de um campeonato. Ele usa as lições 6 a 10: métodos de lista, sorted com key, fatias, listas dentro de listas e tuplas com desempacotamento.`,
        `Tabelas viram listas de linhas o tempo todo. Saber pegar uma coluna, ordenar, cortar o Top 3 e somar um trecho é o básico de qualquer ranking.`,
        `Pegue a coluna dos pontos com [linha[1] for linha in tabela]. Ordene com sorted(..., reverse=True) e corte com [:3]. Desempacote com nome, pts = tabela[0]. Fatias negativas pegam o final: tabela[-2:].`,
        `Cinco linhas: [30, 28, 25], Primeiro da tabela: Leo (12 pontos), 6, ['Ze', 'Tati', 'Dinho', 'Cacau'] e Soma dos 2 ultimos: 26.`],
      ['A coluna dos pontos é [linha[1] for linha in tabela]. Ordene do maior para o menor com sorted(pontos, reverse=True) e corte os 3 primeiros com [:3].',
        'nome, pts = tabela[0] separa a primeira linha em duas variáveis. Depois tabela.append(["Gui", 18]) e len(tabela) mostra 6.',
        'Os apelidos ficam em ordem de tamanho com sorted(apelidos, key=len). Para os 2 últimos, use tabela[-2:] dentro de uma compreensão que pega o item 1 de cada linha, e some.'],
      { prelude: 'tabela = [["Leo", 12], ["Ana", 30], ["Rui", 25], ["Bia", 28], ["Edu", 8]]\napelidos = ["Dinho", "Ze", "Cacau", "Tati"]', peek: 'print(tabela)\nprint(apelidos)' }),

    P('quem comprou o quê',
      'A loja anotou os clientes que passaram de manhã e à tarde (um cliente pode aparecer várias vezes) e uma tabela de preços. As listas manha e tarde e o dicionário precos já existem. Imprima 6 linhas: (1) quantos clientes DIFERENTES vieram de manhã; (2) em ordem alfabética (sorted), quem veio de manhã E à tarde; (3) em ordem alfabética, todos que vieram em algum dos dois horários; (4) o preço do "Monitor" usando get com padrão 0; (5) se "Mouse" existe em precos (use in). Depois mude o Mouse para 90, adicione o Monitor por 1200 e (6) imprima um novo dicionário com 10% de desconto em cada preço, arredondado com round(valor, 2), feito com dict comprehension.',
      'print(len(set(manha)))\nprint(sorted(set(manha) & set(tarde)))\nprint(sorted(set(manha) | set(tarde)))\nprint(precos.get("Monitor", 0))\nprint("Mouse" in precos)\nprecos["Mouse"] = 90\nprecos["Monitor"] = 1200\nprint({k: round(v * 0.9, 2) for k, v in precos.items()})',
      ['set(', 'get(', ' in ', 'round(', 'for '],
      [`Um programa que cruza clientes e preços. Ele usa as lições 11 a 15: conjuntos (set), operações com conjuntos, get e in em dicionários, alterar dicionários e dict comprehension.`,
        `Saber quem aparece nas duas listas, quantos são únicos e como atualizar uma tabela de preços resolve problemas reais de vendas e cadastros.`,
        `Transforme as listas em conjuntos com set() para tirar repetidos. Use & para quem está nos dois e | para a união. Use precos.get("Monitor", 0) e "Mouse" in precos. O desconto sai de {k: round(v * 0.9, 2) for k, v in precos.items()}.`,
        `Seis linhas: 4, ['Bia', 'Davi'], ['Ana', 'Bia', 'Caio', 'Davi', 'Eva'], 0, True e o dicionário com os preços com desconto.`],
      ['set(manha) tira os clientes repetidos; len() conta quantos sobraram. Para quem veio nos dois horários, use set(manha) & set(tarde) e coloque em ordem com sorted().',
        'A união é set(manha) | set(tarde). O get devolve o padrão se a chave não existe: precos.get("Monitor", 0). O in dá True ou False.',
        'Mude e acrescente: precos["Mouse"] = 90 e precos["Monitor"] = 1200. O desconto é uma dict comprehension: {k: round(v * 0.9, 2) for k, v in precos.items()}.'],
      { prelude: 'manha = ["Ana", "Bia", "Caio", "Ana", "Davi"]\ntarde = ["Bia", "Eva", "Davi", "Eva"]\nprecos = {"Mouse": 80, "Teclado": 250, "Caneta": 5}', peek: 'print(manha)\nprint(tarde)\nprint(precos)' }),

    P('analisador de texto',
      'Você vai analisar um texto. A variável texto já existe. Imprima: (1) quantas palavras o texto tem (use split); (2) as palavras que aparecem mais de uma vez, em ordem alfabética, uma por linha, no formato python: 3 (conte com um dicionário e get; antes de contar, deixe tudo em minúsculas e tire os pontos com replace); (3) a posição onde começa a palavra "facil" (find); (4) crie a função destaque(palavra, simbolo="*") que devolve a palavra com o símbolo dos dois lados e imprima destaque("python") e destaque("python", "#"); (5) uma frase com a porcentagem de palavras que são "python", com 1 casa decimal: Python aparece em 30.0% das palavras.',
      'palavras = texto.lower().replace(".", "").split()\nprint(len(palavras))\ncontagem = {}\nfor p in palavras:\n    contagem[p] = contagem.get(p, 0) + 1\nfor p in sorted(contagem):\n    if contagem[p] > 1:\n        print(f"{p}: {contagem[p]}")\nprint(texto.find("facil"))\n\ndef destaque(palavra, simbolo="*"):\n    return f"{simbolo}{palavra}{simbolo}"\n\nprint(destaque("python"))\nprint(destaque("python", "#"))\nprint(f"Python aparece em {contagem[\'python\'] / len(palavras) * 100:.1f}% das palavras")',
      ['split(', 'find(', 'get(', 'def destaque', 'replace('],
      [`Um programa que analisa um texto. Ele usa as lições 16 a 20: contar com dicionário, split e join, replace, find e count, formatação de números e parâmetros opcionais.`,
        `Contar palavras e achar trechos é a base da análise de textos: avaliações, comentários, mensagens. O que mais aparece costuma dizer o que mais importa.`,
        `Prepare o texto com texto.lower().replace(".", "").split(). Conte com contagem[p] = contagem.get(p, 0) + 1. Depois percorra sorted(contagem) e use if para mostrar só quem passou de 1. Formate a porcentagem com :.1f.`,
        `Sete linhas: 10, e: 3, python: 3, 23 (a posição onde começa "facil"), *python* e #python# e, por fim, a frase com 30.0%.`],
      ['Primeiro limpe: palavras = texto.lower().replace(".", "").split(). O len(palavras) já responde quantas palavras existem.',
        'Conte: crie contagem = {} e, para cada palavra p, contagem[p] = contagem.get(p, 0) + 1. Depois percorra sorted(contagem) e imprima só os que têm contagem[p] > 1.',
        'A função fica def destaque(palavra, simbolo="*"): return f"{simbolo}{palavra}{simbolo}". A porcentagem é contagem["python"] / len(palavras) * 100, formatada com :.1f dentro da f-string.'],
      { prelude: 'texto = "Python e bom. Python e facil. Aprender Python e divertido"', peek: 'print(texto)' }),

    P('limpando as leituras',
      'Um sensor mandou as leituras como texto e algumas vieram quebradas. A lista leituras já existe. Crie a função converter(texto) que tenta devolver float(texto) e, se der ValueError, devolve None. Depois imprima 5 linhas: (1) a lista numeros, com as leituras convertidas e sem os None (use map e filter com lambda); (2) se TODOS os números são maiores que 5 (all); (3) se ALGUM número passa de 15 (any); (4) os números do maior para o menor (sorted com reverse=True); (5) Descartadas: 2 (quantas leituras foram jogadas fora).',
      'def converter(texto):\n    try:\n        return float(texto)\n    except ValueError:\n        return None\n\nnumeros = list(filter(lambda x: x is not None, map(converter, leituras)))\nprint(numeros)\nprint(all([n > 5 for n in numeros]))\nprint(any([n > 15 for n in numeros]))\nprint(sorted(numeros, reverse=True))\nprint(f"Descartadas: {len(leituras) - len(numeros)}")',
      ['def converter', 'try', 'except', 'map(', 'filter(', 'lambda', 'all(', 'any(', 'reverse='],
      [`Um programa que limpa dados sujos. Ele usa as lições 21 a 25: argumentos nomeados, lambda, map e filter, any e all, e try / except para tratar erros.`,
        `Dados do mundo real vêm quebrados (vazios, com letras no lugar de números). Um programa que não se assusta com isso e continua funcionando é essencial.`,
        `Em converter(), tente float(texto) dentro de try e devolva None no except ValueError. Aplique em tudo com map(converter, leituras) e tire os None com filter(lambda x: x is not None, ...). Lembre de list(...) no resultado.`,
        `Cinco linhas: [12.5, 8.0, 15.2, 9.8], True, True, [15.2, 12.5, 9.8, 8.0] e Descartadas: 2.`],
      ['A função converter usa try: return float(texto) e except ValueError: return None. O try tenta; se der erro, o except assume.',
        'Para limpar: list(filter(lambda x: x is not None, map(converter, leituras))). O map converte todas; o filter joga fora os None.',
        'all([n > 5 for n in numeros]) e any([n > 15 for n in numeros]) respondem True ou False. Para ordenar, sorted(numeros, reverse=True). Descartadas é len(leituras) - len(numeros).'],
      { prelude: 'leituras = ["12.5", "8", "abc", "15.2", "", "9.8"]', peek: 'print(leituras)' }),

    P('relatório do mês',
      'Hora de fechar o mês. As variáveis vendas (dicionário com o total de cada produto), pedidos (lista com o produto de cada pedido) e inicio / fim (datas em texto) já existem. Crie a função parcela(total, vezes): se vezes for 0 ou menos, ela levanta ValueError("vezes deve ser positivo"); senão devolve total / vezes arredondado com round(..., 2). Imprima: (1) a mensagem do erro, chamando parcela(3600, 0) dentro de try / except; (2) parcela(3600, 7); (3) Caixas necessarias: 2 (com math.ceil, 4 pedidos por caixa); (4) Dias no mes: 31 (diferença entre as datas, mais 1, com datetime); (5) Mais pedido: Mouse (3 vezes), com Counter; (6) uma linha por produto no formato Mouse: R$ 960.00; (7) Total do mes: R$ 6110.00, usando uma função recursiva soma(lista) para somar os valores.',
      'import math\nfrom collections import Counter\nfrom datetime import date\n\ndef parcela(total, vezes):\n    if vezes <= 0:\n        raise ValueError("vezes deve ser positivo")\n    return round(total / vezes, 2)\n\ntry:\n    parcela(3600, 0)\nexcept ValueError as e:\n    print(e)\nprint(parcela(3600, 7))\nprint(f"Caixas necessarias: {math.ceil(len(pedidos) / 4)}")\ndias = (date.fromisoformat(fim) - date.fromisoformat(inicio)).days + 1\nprint(f"Dias no mes: {dias}")\nnome, qtd = Counter(pedidos).most_common(1)[0]\nprint(f"Mais pedido: {nome} ({qtd} vezes)")\nfor produto, valor in vendas.items():\n    print(f"{produto}: R$ {valor:.2f}")\n\ndef soma(lista):\n    if not lista:\n        return 0\n    return lista[0] + soma(lista[1:])\n\nprint(f"Total do mes: R$ {soma(list(vendas.values())):.2f}")',
      ['raise', 'try', 'except', 'math.ceil', 'counter', 'def soma', 'items()'],
      [`O projeto final do Intermediário: um relatório do mês. Ele junta raise, os módulos math e datetime, Counter, recursão e o laço com .items(), das lições 26 a 30.`,
        `Relatórios mensais juntam várias contas: parcelas, datas, produtos mais vendidos e totais. Saber usar as ferramentas prontas do Python (módulos) economiza horas de trabalho.`,
        `Crie parcela() com if e raise ValueError. Teste o erro com try / except ValueError as e. Use math.ceil, date.fromisoformat e Counter(pedidos).most_common(1). Percorra vendas.items() e faça soma() chamar a si mesma com lista[1:].`,
        `Dez linhas: a mensagem do erro, 514.29, Caixas necessarias: 2, Dias no mes: 31, Mais pedido: Mouse (3 vezes), quatro linhas de produtos e Total do mes: R$ 6110.00.`],
      ['Em parcela(): if vezes <= 0: raise ValueError("vezes deve ser positivo"); depois return round(total / vezes, 2). Chame com 0 dentro de try e imprima o e no except ValueError as e.',
        'Caixas: math.ceil(len(pedidos) / 4). Dias: (date.fromisoformat(fim) - date.fromisoformat(inicio)).days + 1. O mais pedido é Counter(pedidos).most_common(1)[0], que devolve (nome, vezes).',
        'A soma recursiva: se a lista está vazia devolva 0; senão devolva lista[0] + soma(lista[1:]). Passe list(vendas.values()) e formate o total com :.2f.'],
      { prelude: 'vendas = {"Mouse": 960, "Teclado": 1250, "Caneta": 300, "Monitor": 3600}\npedidos = ["Mouse", "Caneta", "Mouse", "Teclado", "Mouse", "Caneta"]\ninicio = "2026-10-01"\nfim = "2026-10-31"', peek: 'print(vendas)\nprint(pedidos)\nprint(inicio, fim)' })
  );
}

// ---------------------------------------------------------------- Avançado
{
  const P = code('python', 3);
  out.push(
    P('contas do banco',
      'Monte o sistema de um banco pequeno. (1) Crie a classe Conta com __init__(self, titular, saldo=0) guardando os dois valores; o método depositar(valor), que soma o valor ao saldo; o método sacar(valor), que só tira o dinheiro se o saldo for suficiente e devolve True (ou devolve False e não mexe no saldo); e __str__, que devolve um texto como Ana: R$ 150. (2) Crie a classe Poupanca, que herda de Conta e tem o método render(), que soma ao saldo um décimo dele (use // 10). Depois imprima: c = Conta("Ana", 100) depositando 50 e mostre c; mostre o resultado de c.sacar(500) e de c.sacar(30); mostre c de novo; crie p = Poupanca("Bia", 200), deposite 100, chame render() e mostre p; por fim, mostre isinstance(p, Conta).',
      'class Conta:\n    def __init__(self, titular, saldo=0):\n        self.titular = titular\n        self.saldo = saldo\n\n    def depositar(self, valor):\n        self.saldo += valor\n\n    def sacar(self, valor):\n        if valor > self.saldo:\n            return False\n        self.saldo -= valor\n        return True\n\n    def __str__(self):\n        return f"{self.titular}: R$ {self.saldo}"\n\nclass Poupanca(Conta):\n    def render(self):\n        self.saldo += self.saldo // 10\n\nc = Conta("Ana", 100)\nc.depositar(50)\nprint(c)\nprint(c.sacar(500))\nprint(c.sacar(30))\nprint(c)\np = Poupanca("Bia", 200)\np.depositar(100)\np.render()\nprint(p)\nprint(isinstance(p, Conta))',
      ['class conta', 'class poupanca(conta)', '__init__', '__str__', 'def depositar', 'def sacar', 'def render', 'isinstance('],
      [`O primeiro projeto do Avançado: o sistema de um banco. Ele usa as lições 1 a 5: classes e objetos, __init__ e atributos, métodos, __str__ e herança.`,
        `Programas grandes organizam o mundo em classes: cada coisa (conta, cliente, produto) vira um modelo com dados e ações. A herança evita copiar código: a Poupanca aproveita tudo da Conta.`,
        `Escreva a classe Conta com __init__, depositar, sacar e __str__. Depois class Poupanca(Conta): com o método render(). Por fim, crie os objetos, chame os métodos e imprima.`,
        `Seis linhas: Ana: R$ 150, False, True, Ana: R$ 120, Bia: R$ 330 e True.`],
      ['Dentro de __init__, guarde self.titular = titular e self.saldo = saldo. Os outros métodos usam self.saldo para ler e mudar o dinheiro.',
        'No sacar(): se valor > self.saldo, devolva False; senão desconte do saldo e devolva True. O __str__ devolve f"{self.titular}: R$ {self.saldo}".',
        'class Poupanca(Conta): herda tudo. Só adicione def render(self): self.saldo += self.saldo // 10. Para a Bia: 200 + 100 = 300, e o rendimento é 30, então 330.']),

    P('catálogo de produtos',
      'Monte o catálogo de uma loja. (1) Crie a classe Produto com __init__(self, nome, preco), uma @property chamada preco_final (o preço mais 10%, arredondado com round(..., 2)), o método descricao() que devolve algo como Mouse: R$ 110.00 (preço final com 2 casas), um @classmethod de_texto(cls, texto) que cria o produto a partir de um texto como "Teclado;250" (separando no ponto e vírgula e convertendo o preço com int) e um @staticmethod eh_valido(preco) que devolve True se o preço é maior que 0. (2) Crie a classe Perecivel, que herda de Produto, recebe também os dias de validade (use super().__init__) e muda o descricao() para acrescentar (vence em 3 dias) no fim. (3) Crie, com @dataclass, a classe Pedido com cliente (texto) e itens (inteiro, padrão 1). Imprima a descricao() de Produto("Mouse", 100), de Perecivel("Leite", 5, 3) e de Produto.de_texto("Teclado;250"); depois Produto.eh_valido(-1) e, por fim, o Pedido("Ana").',
      'from dataclasses import dataclass\n\nclass Produto:\n    def __init__(self, nome, preco):\n        self.nome = nome\n        self.preco = preco\n\n    @property\n    def preco_final(self):\n        return round(self.preco * 1.1, 2)\n\n    def descricao(self):\n        return f"{self.nome}: R$ {self.preco_final:.2f}"\n\n    @classmethod\n    def de_texto(cls, texto):\n        nome, preco = texto.split(";")\n        return cls(nome, int(preco))\n\n    @staticmethod\n    def eh_valido(preco):\n        return preco > 0\n\nclass Perecivel(Produto):\n    def __init__(self, nome, preco, validade):\n        super().__init__(nome, preco)\n        self.validade = validade\n\n    def descricao(self):\n        return super().descricao() + f" (vence em {self.validade} dias)"\n\n@dataclass\nclass Pedido:\n    cliente: str\n    itens: int = 1\n\nprint(Produto("Mouse", 100).descricao())\nprint(Perecivel("Leite", 5, 3).descricao())\nprint(Produto.de_texto("Teclado;250").descricao())\nprint(Produto.eh_valido(-1))\nprint(Pedido("Ana"))',
      ['class produto', 'class perecivel(produto)', '@property', '@classmethod', '@staticmethod', '@dataclass', 'super()'],
      [`Um catálogo de loja feito com classes. Ele usa as lições 6 a 10: super(), polimorfismo, @property, @classmethod, @staticmethod e dataclass.`,
        `Em programas reais, uma classe esconde detalhes (como calcular o preço final), cria objetos de várias formas (a partir de um texto) e pode ser especializada sem mexer na original.`,
        `Escreva Produto com a @property preco_final, descricao(), @classmethod de_texto e @staticmethod eh_valido. Depois class Perecivel(Produto) com super().__init__ e uma descricao() que aproveita a da classe mãe. Termine com o @dataclass Pedido.`,
        `Cinco linhas: Mouse: R$ 110.00, Leite: R$ 5.50 (vence em 3 dias), Teclado: R$ 275.00, False e Pedido(cliente='Ana', itens=1).`],
      ['A property se escreve como um método com @property em cima, mas se usa como um atributo: self.preco_final (sem parênteses).',
        'No de_texto, quebre o texto com split(";") e devolva cls(nome, int(preco)). No Perecivel, chame super().__init__(nome, preco) e guarde a validade.',
        'A descricao() do Perecivel pode ser super().descricao() + f" (vence em {self.validade} dias)". O dataclass precisa de @dataclass em cima e dos campos cliente: str e itens: int = 1.']),

    P('pipeline de números',
      'Monte um pequeno pipeline de números. Imprima, nesta ordem: (1) list(pares(10)), onde pares(limite) é um gerador (com yield) que devolve os números pares de 2 até o limite; (2) a soma dos quadrados de 1 a 5, feita com uma generator expression dentro do sum; (3) e (4) os dois primeiros valores de iter([10, 20, 30]), usando next duas vezes; (5) crie o decorator avisar, que imprime Chamando e o nome da função (func.__name__) antes de executá-la e devolve o resultado, e aplique em soma(a, b) que devolve a + b; chame print(soma(2, 3)); (6) crie o decorator com argumento repetir(vezes), que executa a função essa quantidade de vezes, e aplique com @repetir(3) numa função ola() que imprime Oi.',
      'def pares(limite):\n    for n in range(2, limite + 1, 2):\n        yield n\n\nprint(list(pares(10)))\nprint(sum(x * x for x in range(1, 6)))\nit = iter([10, 20, 30])\nprint(next(it))\nprint(next(it))\n\ndef avisar(func):\n    def interno(*args):\n        print(f"Chamando {func.__name__}")\n        return func(*args)\n    return interno\n\n@avisar\ndef soma(a, b):\n    return a + b\n\nprint(soma(2, 3))\n\ndef repetir(vezes):\n    def decorator(func):\n        def interno(*args):\n            for _ in range(vezes):\n                func(*args)\n        return interno\n    return decorator\n\n@repetir(3)\ndef ola():\n    print("Oi")\n\nola()',
      ['yield', 'iter(', 'next(', 'def avisar', 'def repetir', '@avisar', '@repetir(3)'],
      [`Um pipeline de números com geradores e decorators. Ele junta as lições 11 a 15: geradores com yield, generator expression, iter e next, decorators e decorators com argumento.`,
        `Geradores entregam um valor de cada vez sem guardar tudo na memória (ótimos para muitos dados), e decorators acrescentam comportamento a uma função sem mexer nela, como avisos e repetições.`,
        `Escreva pares() com for e yield. Use sum(x * x for x in range(1, 6)). Chame next(it) duas vezes. Para os decorators, uma função que recebe a função, cria uma interna e a devolve; no repetir() há uma camada a mais.`,
        `Nove linhas: [2, 4, 6, 8, 10], 55, 10, 20, Chamando soma, 5 e três linhas com Oi.`],
      ['O gerador usa yield no lugar de return: for n in range(2, limite + 1, 2): yield n. Para ver todos de uma vez, use list(pares(10)).',
        'Decorator simples: def avisar(func): def interno(*args): print(...); return func(*args) e, no fim, return interno. Aplique com @avisar em cima da soma.',
        'Decorator com argumento tem 3 níveis: repetir(vezes) devolve decorator(func), que devolve interno(). Dentro do interno, um for _ in range(vezes) chama func.']),

    P('caixa de ferramentas',
      'Teste a sua caixa de ferramentas de funções. Imprima, nesta ordem: (1) um contador feito com closure: crie contador() que guarda um número começando em 0 e devolve uma função que soma 1 (use nonlocal) a cada chamada; chame c = contador() e depois c() duas vezes e imprima o resultado da 3ª chamada; (2) fib(30), com fib recursiva e @lru_cache(maxsize=None); (3) list(combinations(["A", "B", "C"], 2)), de itertools; (4) o produto de [1, 2, 3, 4, 5] com functools.reduce e lambda; (5) uma classe Caixa que funciona com with: __enter__ imprime Abriu e devolve self, __exit__(self, tipo, valor, tb) imprime Fechou; use with Caixa(): e imprima Trabalhando lá dentro.',
      'from functools import lru_cache, reduce\nfrom itertools import combinations\n\ndef contador():\n    n = 0\n    def somar():\n        nonlocal n\n        n += 1\n        return n\n    return somar\n\nc = contador()\nc()\nc()\nprint(c())\n\n@lru_cache(maxsize=None)\ndef fib(n):\n    if n < 2:\n        return n\n    return fib(n - 1) + fib(n - 2)\n\nprint(fib(30))\nprint(list(combinations(["A", "B", "C"], 2)))\nprint(reduce(lambda a, b: a * b, [1, 2, 3, 4, 5]))\n\nclass Caixa:\n    def __enter__(self):\n        print("Abriu")\n        return self\n\n    def __exit__(self, tipo, valor, tb):\n        print("Fechou")\n\nwith Caixa():\n    print("Trabalhando")',
      ['nonlocal', 'lru_cache', 'combinations', 'reduce(', 'lambda', '__enter__', '__exit__', 'with caixa'],
      [`Uma caixa de ferramentas com o que há de mais poderoso nas funções. Ela usa as lições 16 a 20: closures, memoização com lru_cache, itertools, functools.reduce e o with (context manager).`,
        `Closures guardam estado sem classes; o lru_cache faz funções lentas ficarem rápidas; itertools e reduce resolvem combinações e acumulações em uma linha; o with garante que algo seja aberto e fechado direito.`,
        `Escreva o contador() com uma função interna e nonlocal. Use @lru_cache(maxsize=None) em cima da fib. Importe combinations e reduce. Faça a classe Caixa com __enter__ e __exit__ e use com with Caixa():.`,
        `Sete linhas: 3, 832040, [('A', 'B'), ('A', 'C'), ('B', 'C')], 120, Abriu, Trabalhando e Fechou.`],
      ['Closure: def contador(): n = 0, uma função interna que usa nonlocal n, soma 1 e devolve n, e o contador devolve essa função (sem parênteses).',
        'fib com cache: from functools import lru_cache e @lru_cache(maxsize=None) acima de def fib(n). Se n < 2 devolva n; senão fib(n - 1) + fib(n - 2).',
        'reduce(lambda a, b: a * b, [1, 2, 3, 4, 5]) multiplica tudo. A classe Caixa precisa de __enter__(self) e __exit__(self, tipo, valor, tb); o with chama os dois sozinho.']),

    P('análise de vendas com Pandas',
      'O DataFrame df já existe, com as vendas de uma loja (produto, categoria, qtd, preco e mes). Imprima 5 linhas: (1) o formato da tabela (df.shape); (2) crie a coluna total (qtd vezes preco) e imprima a lista dela (tolist()); (3) filtre as linhas com total maior que 500 e imprima a lista dos produtos (tolist()); (4) o total vendido por categoria, usando groupby e sum, como dicionário (to_dict()); (5) o nome da categoria que mais vendeu (idxmax()).',
      'print(df.shape)\ndf["total"] = df["qtd"] * df["preco"]\nprint(df["total"].tolist())\nprint(df[df["total"] > 500]["produto"].tolist())\nresumo = df.groupby("categoria")["total"].sum()\nprint(resumo.to_dict())\nprint(resumo.idxmax())',
      ['df.shape', 'groupby(', 'sum()', 'idxmax('],
      [`Uma análise de vendas com Pandas. Ela junta as lições 21 a 25: DataFrame, shape, filtros, coluna nova e groupby.`,
        `Pandas é a ferramenta de quem analisa dados com Python: em poucas linhas você calcula totais, filtra linhas e descobre qual grupo vendeu mais, sem planilha nenhuma.`,
        `Veja o tamanho com df.shape. Crie df["total"] = df["qtd"] * df["preco"]. Filtre com df[df["total"] > 500]. Agrupe com df.groupby("categoria")["total"].sum() e use .idxmax() para o nome do campeão.`,
        `Cinco linhas: (7, 5), a lista dos 7 totais, a lista dos 4 produtos com total acima de 500, o dicionário por categoria e o nome da categoria campeã.`],
      ['df.shape devolve (linhas, colunas). A coluna nova nasce de uma conta entre colunas: df["total"] = df["qtd"] * df["preco"].',
        'Para filtrar: df[df["total"] > 500]. Escolha a coluna produto e transforme em lista com .tolist().',
        'Guarde resumo = df.groupby("categoria")["total"].sum(). Imprima resumo.to_dict() e, na linha seguinte, resumo.idxmax() (o nome do maior valor).'],
      { prelude: DF, peek: 'print(df.to_string())' }),

    P('metas por categoria com Pandas',
      'Um segundo projeto com Pandas. O DataFrame df e a tabela metas (categoria e meta) já existem. Crie a coluna total (qtd vezes preco) e imprima 5 linhas: (1) os 3 produtos com maior total, em lista (sort_values com ascending=False e head); (2) o número de vendas de cada categoria como dicionário (use groupby com agg e a função count, e pegue a coluna count com to_dict()); (3) a lista das categorias que bateram a meta (junte o total somado por categoria com a tabela metas usando merge e filtre as que somaram a meta ou mais); (4) quantas vendas aconteceram em mar (value_counts); (5) o total de Moveis em mar, vindo de uma pivot_table (index categoria, columns mes, values total, aggfunc sum, fill_value 0).',
      'df["total"] = df["qtd"] * df["preco"]\nprint(df.sort_values("total", ascending=False).head(3)["produto"].tolist())\nresumo = df.groupby("categoria")["total"].agg(["sum", "count"])\nprint(resumo["count"].to_dict())\nr = resumo.reset_index().merge(metas, on="categoria")\nprint(r[r["sum"] >= r["meta"]]["categoria"].tolist())\nprint(df["mes"].value_counts()["mar"])\npiv = df.pivot_table(index="categoria", columns="mes", values="total", aggfunc="sum", fill_value=0)\nprint(piv.loc["Moveis", "mar"])',
      ['sort_values(', 'agg(', 'merge(', 'value_counts(', 'pivot_table('],
      [`O projeto final do curso de Python: um segundo relatório com Pandas. Ele usa as lições 26 a 30: sort_values, agg com várias métricas, merge, value_counts e pivot.`,
        `Ordenar, resumir com várias métricas, juntar duas tabelas e montar um cruzamento (linhas x colunas) é o que analistas fazem todo dia para responder se a meta foi batida e onde o dinheiro entra.`,
        `Crie a coluna total. Ordene com sort_values("total", ascending=False). Resuma com groupby("categoria")["total"].agg(["sum", "count"]). Junte com metas usando merge(..., on="categoria"). Conte meses com value_counts() e cruze com pivot_table.`,
        `Cinco linhas: a lista dos 3 produtos mais vendidos, o dicionário da contagem por categoria, a lista das categorias que bateram a meta, o número 3 e o total de Moveis em mar (1950).`],
      ['Depois de criar a coluna total, ordene com df.sort_values("total", ascending=False), pegue as 3 primeiras linhas com .head(3) e a coluna produto com .tolist().',
        'Resuma com resumo = df.groupby("categoria")["total"].agg(["sum", "count"]). Use resumo.reset_index().merge(metas, on="categoria") para trazer a meta de cada categoria e filtre r["sum"] >= r["meta"].',
        'df["mes"].value_counts()["mar"] dá quantas vendas houve em mar. A pivot_table(index="categoria", columns="mes", values="total", aggfunc="sum", fill_value=0) vira uma tabela cruzada; .loc["Moveis", "mar"] pega uma célula.'],
      { prelude: DF + 'metas = pd.DataFrame({"categoria": ["Eletronicos", "Moveis", "Papelaria"], "meta": [8000, 3000, 500]})\n', peek: 'print(df.to_string())\nprint(metas.to_string())' })
  );
}

// ---------------------------------------------------------------- Automações (lições 1 a 30; tudo roda no computador de treino, veja content/lab.js)
{
  const P = code('python', 4);
  const R = String.raw;
  out.push(
    P('agenda de contatos em arquivo',
      'O arquivo contatos.txt guarda um contato por linha, no formato nome;telefone. Faça um programa com a função nomes() que lê o arquivo linha por linha (use strip() e ignore linhas vazias) e devolve a lista só com os nomes (o pedaço antes do ponto e vírgula). Imprima 4 linhas: (1) Contatos: e a quantidade; (2) a lista de nomes em ordem alfabética (sorted); (3) depois de acrescentar no final do arquivo a linha Duda;96666-4444, imprima Agora: e a nova quantidade; (4) com Path, o nome do arquivo sem extensão (stem) e a extensão (suffix), separados por espaço.',
      R`from pathlib import Path
def nomes():
    lista = []
    with open('contatos.txt') as f:
        for linha in f:
            linha = linha.strip()
            if linha:
                lista.append(linha.split(';')[0])
    return lista
print(f'Contatos: {len(nomes())}')
print(sorted(nomes()))
with open('contatos.txt', 'a') as f:
    f.write('Duda;96666-4444\n')
print(f'Agora: {len(nomes())}')
p = Path('contatos.txt')
print(p.stem, p.suffix)`,
      ['open(', 'strip(', 'split(', 'sorted(', 'write(', 'Path('],
      [`Uma agenda de contatos guardada em arquivo. Ela junta as lições 1 a 5: ler um arquivo, percorrer linha por linha, escrever, acrescentar no final e usar Path.`,
        `Guardar dados num arquivo é o primeiro passo de qualquer automação: o programa termina, mas os dados continuam lá para a próxima vez.`,
        `Crie a função nomes() com with open('contatos.txt') e um for linha in f. Use linha.strip() e linha.split(';')[0]. Para acrescentar, abra com o modo 'a' e use write() com \\n no fim. No final, Path('contatos.txt') tem .stem e .suffix.`,
        `Quatro linhas: Contatos: 3, a lista com Ana, Bia e Caio, Agora: 4 e contatos .txt.`],
      ['Dentro de with open(...) as f, o for linha in f: entrega uma linha por volta. Use linha.strip() para tirar a quebra de linha e pule as linhas vazias com um if.',
        'linha.split(";") devolve uma lista com o nome na posição 0. Guarde os nomes numa lista e devolva no fim. Para a segunda linha, use sorted(nomes()).',
        "Para acrescentar, abra com open('contatos.txt', 'a') e escreva 'Duda;96666-4444\\n'. Depois chame nomes() de novo. Para a última linha: p = Path('contatos.txt') e print(p.stem, p.suffix)."],
      { prelude: boot({ files: { 'contatos.txt': 'Caio;99111-2222\nAna;98888-1111\nBia;97777-3333\n' } }), peek: PEEK }),

    P('organizador de downloads',
      'A pasta downloads está bagunçada. Crie as subpastas e mova cada arquivo para a certa, pela extensão (suffix): .jpg e .png vão para imagens; .pdf e .txt vão para documentos; .csv vai para planilhas. Percorra os arquivos em ordem alfabética (guarde a lista com sorted antes de mover), crie cada subpasta com mkdir(exist_ok=True) dentro de downloads e mova com shutil.move. Depois grave organizacao.csv (csv.writer) com o cabeçalho arquivo,pasta e uma linha por arquivo movido. Imprima: (1) Organizados: e a quantidade; (2) a lista ordenada do que sobrou em downloads (só as 3 subpastas); (3) uma linha arquivo -> pasta para cada linha do organizacao.csv (leia com csv.DictReader).',
      R`import csv, shutil
from pathlib import Path
destinos = {'.jpg': 'imagens', '.png': 'imagens', '.pdf': 'documentos', '.txt': 'documentos', '.csv': 'planilhas'}
base = Path('downloads')
linhas = []
for arq in sorted(p for p in base.iterdir() if p.is_file()):
    pasta = destinos[arq.suffix]
    (base / pasta).mkdir(exist_ok=True)
    shutil.move(str(arq), str(base / pasta / arq.name))
    linhas.append([arq.name, pasta])
with open('organizacao.csv', 'w', newline='') as f:
    w = csv.writer(f)
    w.writerow(['arquivo', 'pasta'])
    w.writerows(linhas)
print('Organizados:', len(linhas))
print(sorted(p.name for p in base.iterdir()))
with open('organizacao.csv', newline='') as f:
    for l in csv.DictReader(f):
        print(l['arquivo'], '->', l['pasta'])`,
      ['suffix', 'mkdir(', 'shutil.move(', 'csv.writer(', 'DictReader'],
      [`Um robô que arruma uma pasta bagunçada e deixa um registro do que fez. Ele junta as lições 6 a 10: listar e filtrar arquivos, criar e mover, subpastas, renomear e CSV.`,
        `Todo mundo tem uma pasta de downloads cheia. Um robô assim arruma tudo em segundos, e o CSV de registro mostra para onde cada arquivo foi (ótimo para desfazer se precisar).`,
        `Faça um dicionário que liga cada extensão a uma pasta. No for, pegue arq.suffix, crie a pasta com (base / pasta).mkdir(exist_ok=True) e mova com shutil.move(str(arq), str(base / pasta / arq.name)). Guarde [nome, pasta] numa lista e grave com csv.writer.`,
        `Sete linhas: Organizados: 5, a lista das 3 pastas e uma linha arquivo -> pasta para cada um dos 5 arquivos.`],
      ['Monte destinos = {".jpg": "imagens", ...}. Use sorted(...) para fechar a lista de arquivos ANTES de mover (assim as subpastas novas não entram na volta do for).',
        'Dentro do for: pasta = destinos[arq.suffix]; (base / pasta).mkdir(exist_ok=True); shutil.move(str(arq), str(base / pasta / arq.name)). Guarde linhas.append([arq.name, pasta]).',
        'Com csv.writer: w.writerow(["arquivo", "pasta"]) e w.writerows(linhas) (abra o arquivo com newline=""). Para ler de volta, csv.DictReader e l["arquivo"], l["pasta"].'],
      { prelude: boot({ files: { 'downloads/ferias.jpg': 'img1', 'downloads/contrato.pdf': 'pdf1', 'downloads/ata.txt': 'ata da reuniao', 'downloads/logo.png': 'img2', 'downloads/dados.csv': 'a,b\n1,2\n' } }), peek: PEEK }),

    P('analisador de log do servidor',
      'O arquivo servidor.log tem uma linha por evento, no formato 2025-03-14 08:01:10 INFO login usuario=ana (data, hora, nível e mensagem). Use uma expressão regular com grupos (re.compile e match) para separar data, hora, nível e mensagem de cada linha. Conte quantas linhas existem de cada nível (dicionário com get) e guarde os nomes de usuário que aparecem na mensagem como usuario=nome (re.search; use um conjunto para não repetir). Imprima: (1) uma linha por nível, em ordem alfabética, com o nível alinhado à esquerda em 8 colunas e a quantidade alinhada à direita em 3 (:<8 e :>3); (2) Usuarios: e a lista ordenada. Depois grave a contagem em resumo.json (json.dump com sort_keys=True), leia o arquivo de volta com json.load e imprima o dicionário.',
      R`import json, re
padrao = re.compile(r'(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}) (\w+) (.*)')
contagem = {}
usuarios = set()
with open('servidor.log') as f:
    for linha in f:
        m = padrao.match(linha.strip())
        if not m:
            continue
        data, hora, nivel, msg = m.groups()
        contagem[nivel] = contagem.get(nivel, 0) + 1
        u = re.search(r'usuario=(\w+)', msg)
        if u:
            usuarios.add(u.group(1))
for nivel in sorted(contagem):
    print(f'{nivel:<8}{contagem[nivel]:>3}')
print('Usuarios:', sorted(usuarios))
with open('resumo.json', 'w') as f:
    json.dump(contagem, f, indent=2, sort_keys=True)
with open('resumo.json') as f:
    print(json.load(f))`,
      ['groups(', 'json.dump(', 'json.load(', 'sorted('],
      [`Um analisador de log: ele lê um arquivo de eventos, separa cada linha com regex, conta por nível e guarda o resumo em JSON. Junta as lições 11 a 15: JSON, agrupar e somar, relatório formatado e regex com grupos.`,
        `Servidores geram milhares de linhas de log por dia. Um robô que conta os erros e lista quem entrou responde em segundos o que ninguém consegue ler a olho.`,
        `Crie o padrão com re.compile(r'(\\d{4}-\\d{2}-\\d{2}) (\\d{2}:\\d{2}:\\d{2}) (\\w+) (.*)') e use m.groups() para abrir os 4 pedaços. Conte com contagem[nivel] = contagem.get(nivel, 0) + 1. Alinhe com f'{nivel:<8}{n:>3}'. Grave com json.dump e leia com json.load.`,
        `Cinco linhas: AVISO 1, ERRO 2 e INFO 4 (alinhados), Usuarios: ['ana', 'caio'] e o dicionário {'AVISO': 1, 'ERRO': 2, 'INFO': 4}.`],
      ['O padrão tem 4 grupos: data, hora, nível (\\w+) e o resto da linha (.*). m = padrao.match(linha.strip()) e depois data, hora, nivel, msg = m.groups().',
        'Para contar: contagem[nivel] = contagem.get(nivel, 0) + 1. Para o usuário: re.search(r"usuario=(\\w+)", msg) e, se achou, u.group(1) vai para um set.',
        'Imprima com for nivel in sorted(contagem): print(f"{nivel:<8}{contagem[nivel]:>3}"). Grave com json.dump(contagem, f, indent=2, sort_keys=True) e leia com json.load(f).'],
      { prelude: boot({ files: { 'servidor.log': '2025-03-14 08:01:10 INFO login usuario=ana\n2025-03-14 08:05:42 ERRO disco cheio\n2025-03-14 08:07:00 INFO login usuario=caio\n2025-03-14 08:15:31 AVISO memoria alta\n2025-03-14 08:20:12 ERRO sem rede\n2025-03-14 08:30:00 INFO login usuario=ana\n2025-03-14 08:45:09 INFO logout usuario=caio\n' } }), peek: PEEK }),

    P('backup com limpeza e zip',
      'A pasta documentos precisa de backup na pasta backup. (1) Ache os arquivos duplicados de documentos: percorra em ordem alfabética, calcule o hash de cada arquivo (hashlib.sha256 sobre read_bytes) e, se o hash já foi visto, o arquivo é duplicado. Imprima Duplicados: e a lista dos nomes duplicados. (2) Para cada arquivo NÃO duplicado, copie com shutil.copy para backup só se ele ainda não existir lá ou se o conteúdo (hash) for diferente; imprima copiado: nome ou igual: nome. (3) Percorra a pasta backup em ordem alfabética e apague (unlink) os arquivos com mais de 30 dias (idade = (time.time() - st_mtime) / 86400), imprimindo apagado: nome. (4) Crie um zip chamado backup_AAAA-MM-DD.zip, com a data de hoje (datetime.now().strftime("%Y-%m-%d")), com tudo o que sobrou em backup (arcname=nome) e imprima Zip: com o nome do zip e a lista namelist().',
      R`import hashlib, shutil, time, zipfile
from datetime import datetime
from pathlib import Path
def hash_de(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()
origem, backup = Path('documentos'), Path('backup')
vistos, duplicados, unicos = set(), [], []
for arq in sorted(origem.iterdir()):
    h = hash_de(arq)
    if h in vistos:
        duplicados.append(arq.name)
    else:
        vistos.add(h)
        unicos.append(arq)
print('Duplicados:', duplicados)
for arq in unicos:
    destino = backup / arq.name
    if destino.exists() and hash_de(destino) == hash_de(arq):
        print('igual:', arq.name)
    else:
        shutil.copy(arq, destino)
        print('copiado:', arq.name)
for arq in sorted(backup.iterdir()):
    idade = (time.time() - arq.stat().st_mtime) / 86400
    if idade > 30:
        arq.unlink()
        print('apagado:', arq.name)
nome_zip = f'backup_{datetime.now().strftime("%Y-%m-%d")}.zip'
with zipfile.ZipFile(nome_zip, 'w') as z:
    for arq in sorted(backup.iterdir()):
        z.write(arq, arcname=arq.name)
with zipfile.ZipFile(nome_zip) as z:
    print('Zip:', nome_zip, z.namelist())`,
      ['hashlib.', 'shutil.copy', 'unlink(', 'st_mtime', 'strftime(', 'zipfile.ZipFile('],
      [`Um robô de backup completo: acha duplicados, copia só o que mudou, apaga o que está velho demais e compacta tudo num zip com a data no nome. Junta as lições 16 a 20: datas, arquivos velhos, duplicados, zip e backup incremental.`,
        `Backup bem feito não copia tudo toda vez (gasta tempo e espaço) e não guarda lixo para sempre. É exatamente a rotina que empresas deixam rodando toda madrugada.`,
        `Crie uma função hash_de(p) com hashlib.sha256(p.read_bytes()).hexdigest(). Guarde os hashes vistos num set. Para copiar só o que mudou, compare hash_de(destino) com hash_de(arq). A idade vem de time.time() menos st_mtime, dividido por 86400. O nome do zip usa datetime.now().strftime("%Y-%m-%d").`,
        `Seis linhas: Duplicados: ['b.txt'], igual: a.txt, copiado: c.txt, copiado: d.txt, apagado: velho.txt e Zip: backup_2025-03-14.zip com os três nomes (a.txt, c.txt e d.txt).`],
      ['Percorra sorted(origem.iterdir()). Se hash_de(arq) já está em vistos, o nome vai para a lista de duplicados; senão, entra em vistos e o arquivo vai para a lista de únicos.',
        'Para cada único: destino = backup / arq.name. Se destino.exists() e hash_de(destino) == hash_de(arq), imprima igual; senão, shutil.copy(arq, destino) e imprima copiado. Depois, em sorted(backup.iterdir()), apague quem tem idade maior que 30.',
        'nome_zip = f"backup_{datetime.now().strftime(\'%Y-%m-%d\')}.zip". Com zipfile.ZipFile(nome_zip, "w") grave cada arquivo com z.write(arq, arcname=arq.name). Para listar, abra de novo (modo leitura) e use z.namelist().'],
      { prelude: boot({ files: { 'documentos/a.txt': 'contrato assinado', 'documentos/b.txt': 'contrato assinado', 'documentos/c.txt': 'versao nova do plano', 'documentos/d.txt': 'rascunho', 'backup/a.txt': 'contrato assinado', 'backup/c.txt': 'versao antiga do plano', 'backup/velho.txt': 'arquivo de 2024' }, dias: { 'documentos/a.txt': 2, 'documentos/b.txt': 2, 'documentos/c.txt': 1, 'documentos/d.txt': 5, 'backup/a.txt': 2, 'backup/c.txt': 40, 'backup/velho.txt': 100 } }), peek: PEEK }),

    P('robô de boletos com diário e retentativas',
      'O arquivo clientes.csv tem nome, email e valor. A função checar_servidor() já existe: ela falha com ConnectionError nas duas primeiras chamadas e na terceira devolve True. (1) Configure o logging com basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s", stream=sys.stdout). (2) Chame checar_servidor() em até 4 tentativas: a cada falha, registre logging.warning com tentativa N falhou (N começa em 1) e espere 1 segundo (time.sleep); quando funcionar, registre logging.info com servidor ok e pare. (3) Leia clientes.csv com DictReader e, para cada cliente, monte o texto com string.Template (Ola, $nome! Seu boleto de $valor reais vence amanha.), crie um EmailMessage de robo@exemplo.com para o e-mail do cliente com assunto Seu boleto e envie por smtplib.SMTP("smtp.exemplo.com", 587), com starttls() e login usando a senha da variável de ambiente SENHA_SMTP. A cada envio, registre logging.info com enviado para e o e-mail. (4) No final, imprima N e-mails na caixa (N é len(smtplib.caixa)) e, na linha de baixo, o texto da última mensagem (get_content()).',
      R`import csv, logging, os, smtplib, sys, time
from email.message import EmailMessage
from string import Template
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s', stream=sys.stdout)
for n in range(1, 5):
    try:
        checar_servidor()
        logging.info('servidor ok')
        break
    except ConnectionError:
        logging.warning(f'tentativa {n} falhou')
        time.sleep(1)
modelo = Template('Ola, $nome! Seu boleto de $valor reais vence amanha.')
with open('clientes.csv', newline='') as f:
    clientes = list(csv.DictReader(f))
with smtplib.SMTP('smtp.exemplo.com', 587) as s:
    s.starttls()
    s.login('robo@exemplo.com', os.environ['SENHA_SMTP'])
    for c in clientes:
        msg = EmailMessage()
        msg['From'] = 'robo@exemplo.com'
        msg['To'] = c['email']
        msg['Subject'] = 'Seu boleto'
        msg.set_content(modelo.substitute(nome=c['nome'], valor=c['valor']))
        s.send_message(msg)
        logging.info(f'enviado para {c["email"]}')
print(len(smtplib.caixa), 'e-mails na caixa')
print(smtplib.caixa[-1].get_content())`,
      ['logging.', 'sleep(', 'Template(', 'starttls(', 'login(', 'send_message('],
      [`Um robô de cobrança que avisa os clientes por e-mail, deixa um diário do que fez e tenta de novo quando o servidor falha. Junta as lições 21 a 25: modelo de mensagem, e-mail, envio, logging e tentar de novo.`,
        `Robôs de verdade precisam de três coisas: um texto bem montado, um registro (log) para você saber o que aconteceu de madrugada e paciência para tentar de novo quando a rede falha.`,
        `Faça um for n in range(1, 5) com try/except ConnectionError em volta de checar_servidor(): no except, logging.warning e time.sleep(1); no sucesso, logging.info e break. Depois, com o SMTP aberto, um for por cliente: Template.substitute, EmailMessage, send_message e logging.info.`,
        `Primeiro o diário (WARNING: tentativa 1 falhou, WARNING: tentativa 2 falhou, INFO: servidor ok e um INFO: enviado para por cliente), depois 2 e-mails na caixa e o texto da mensagem do Caio.`],
      ['Configure o logging primeiro. Depois for n in range(1, 5): try: checar_servidor(); logging.info("servidor ok"); break; except ConnectionError: logging.warning(f"tentativa {n} falhou"); time.sleep(1).',
        'Leia os clientes com list(csv.DictReader(f)). O modelo é Template("Ola, $nome! Seu boleto de $valor reais vence amanha.") e o texto vem de modelo.substitute(nome=c["nome"], valor=c["valor"]).',
        'Abra o SMTP com with smtplib.SMTP("smtp.exemplo.com", 587) as s, chame s.starttls() e s.login("robo@exemplo.com", os.environ["SENHA_SMTP"]). Dentro do for dos clientes, monte o EmailMessage e use s.send_message(msg). No final, smtplib.caixa[-1].get_content().'],
      { prelude: boot({ files: { 'clientes.csv': 'nome,email,valor\nAna,ana@exemplo.com,120\nCaio,caio@exemplo.com,250\n' }, env: { SENHA_SMTP: 'senha123' }, contas: { 'robo@exemplo.com': 'senha123' }, depois: "_tent = {'n': 0}\ndef checar_servidor():\n    _tent['n'] += 1\n    if _tent['n'] < 3:\n        raise ConnectionError('servidor ocupado')\n    return True\n" }), peek: PEEK }),

    P('coletor de preços agendado',
      'Monte um coletor de preços com linha de comando e agenda. (1) Crie a classe Precos (herda de HTMLParser) que lê a página https://loja.exemplo.com/produtos: cada nome está num span de class nome e cada preço num span de class preco (guarde nomes e precos, os preços como float). (2) Crie a função coletar(limite) que baixa a página com requests.get, usa a classe e devolve a lista de pares (nome, preco) só dos produtos com preço menor ou igual ao limite. (3) Crie main(argv=None) com argparse: a opção --limite (float, padrão 1000). Dentro de main, crie um sched.scheduler e uma função rodar(nome) que imprime Xs nome: N produtos (X = segundos desde o início, N = quantos coletar devolveu) e, abaixo, uma linha com dois espaços, o nome e o preço (  Mouse: 80.5) de cada produto; depois consulta https://loja.exemplo.com/promocoes com raise_for_status() e, se der HTTPError, imprime dois espaços e promocoes fora do ar: e o código (e.response.status_code). (4) Agende rodar("manha") para 0 segundo e rodar("tarde") para 60 segundos, execute a agenda e imprima Total: N segundos. Dentro de if __name__ == "__main__": chame main(["--limite", "200"]).',
      R`import argparse, requests, sched, time
from html.parser import HTMLParser
class Precos(HTMLParser):
    def __init__(self):
        super().__init__()
        self.campo = None
        self.nomes = []
        self.precos = []
    def handle_starttag(self, tag, attrs):
        if tag == 'span':
            self.campo = dict(attrs).get('class')
    def handle_data(self, data):
        if self.campo == 'nome':
            self.nomes.append(data)
        elif self.campo == 'preco':
            self.precos.append(float(data))
        self.campo = None
def coletar(limite):
    p = Precos()
    p.feed(requests.get('https://loja.exemplo.com/produtos').text)
    return [(n, v) for n, v in zip(p.nomes, p.precos) if v <= limite]
def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument('--limite', type=float, default=1000)
    args = ap.parse_args(argv)
    inicio = time.time()
    agenda = sched.scheduler(time.time, time.sleep)
    def rodar(nome):
        achados = coletar(args.limite)
        print(f'{int(time.time() - inicio)}s {nome}: {len(achados)} produtos')
        for n, v in achados:
            print(f'  {n}: {v}')
        try:
            requests.get('https://loja.exemplo.com/promocoes').raise_for_status()
        except requests.exceptions.HTTPError as e:
            print('  promocoes fora do ar:', e.response.status_code)
    agenda.enter(0, 1, rodar, ('manha',))
    agenda.enter(60, 1, rodar, ('tarde',))
    agenda.run()
    print('Total:', int(time.time() - inicio), 'segundos')
if __name__ == '__main__':
    main(['--limite', '200'])`,
      ['HTMLParser', 'argparse', 'raise_for_status(', 'sched.scheduler(', 'enter(', '__main__'],
      [`O projeto final do nível Automações: um coletor de preços que lê uma página web, aceita opções de linha de comando e roda sozinho em horários marcados. Junta as lições 26 a 30: internet, erros de API, HTML, argparse e agendamento.`,
        `Acompanhar preços, estoque ou notícias é uma das automações mais comuns. Com opções de linha de comando e uma agenda, o mesmo programa serve para qualquer pessoa e roda sem ninguém por perto.`,
        `Escreva a classe Precos como na lição do HTML (handle_starttag guarda a class do span e handle_data guarda o texto). Em main, crie o ArgumentParser, o sched.scheduler(time.time, time.sleep) e a função rodar com try/except requests.exceptions.HTTPError. Agende com enter(0, 1, rodar, ("manha",)) e enter(60, 1, rodar, ("tarde",)).`,
        `Nove linhas: o relatório da manhã (2 produtos: Mouse e Teclado, e o aviso das promoções fora do ar com o código 500), o relatório da tarde (60s) e, no fim, Total: 60 segundos.`],
      ['Em coletar(limite): p = Precos(); p.feed(requests.get(url).text) e devolva [(n, v) for n, v in zip(p.nomes, p.precos) if v <= limite]. O Monitor (900) fica de fora por causa do limite 200.',
        'Em main(argv=None): ap = argparse.ArgumentParser(); ap.add_argument("--limite", type=float, default=1000); args = ap.parse_args(argv). Guarde inicio = time.time() e crie agenda = sched.scheduler(time.time, time.sleep).',
        'A função rodar(nome) vive dentro de main (assim enxerga args e inicio). Dentro dela use try: requests.get(...).raise_for_status() e except requests.exceptions.HTTPError as e: print("  promocoes fora do ar:", e.response.status_code). Depois agenda.enter(...) duas vezes e agenda.run().'],
      { prelude: boot({ rotas: R`{'https://loja.exemplo.com/produtos': '''<ul>
<li class="item"><span class="nome">Mouse</span> <span class="preco">80.50</span></li>
<li class="item"><span class="nome">Teclado</span> <span class="preco">150.00</span></li>
<li class="item"><span class="nome">Monitor</span> <span class="preco">900.00</span></li>
</ul>''', 'https://loja.exemplo.com/promocoes': (500, 'erro interno')}` }), peek: PEEK })
  );
}

module.exports = out;
