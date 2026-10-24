// Python — NÍVEL INTERMEDIÁRIO: as 4 explicações de cada lição, escritas como se a pessoa tivesse 10 anos e estivesse vendo isso pela primeira vez.
//   [ O que é ,  Para que serve ,  Como você vai usar aqui ,  O que vai aparecer na tela ]
module.exports = {
  'py-2-01': [
    `range(início, fim, passo) cria uma fila de números pulando de passo em passo, como subir uma escada de 2 em 2 degraus. Com passo negativo, ele conta de trás para frente, como numa contagem regressiva.`,
    `Serve para contagens regressivas, para pegar só de 2 em 2 ou de 5 em 5, e para andar por uma sequência para frente ou para trás.`,
    `Escreva for i in range(10, 0, -2): e mostre o i com print. O primeiro número é onde começa, o segundo é onde para (esse NÃO entra) e o terceiro é o tamanho do pulo.`,
    `Os números, um por linha: 10, 8, 6, 4 e 2.`],
  'py-2-02': [
    `enumerate() entrega, junto com cada item da lista, o número da vez dele, como a senha de uma fila: 1, 2, 3...`,
    `Serve para numerar linhas e rankings sem criar um contador à mão.`,
    `Escreva for i, nome in enumerate(nomes, 1): . O i recebe o número (o 1 faz a contagem começar em 1) e o nome recebe o item. Depois: print(f"{i} - {nome}"). A lista nomes já está pronta.`,
    `Uma linha por pessoa, no formato pedido: 1 - Ana, 2 - Bruno e 3 - Carla.`],
  'py-2-03': [
    `zip() é um zíper: ele junta duas listas e entrega os itens em pares, o primeiro com o primeiro, o segundo com o segundo...`,
    `Serve para andar por dados que combinam entre si: produtos e preços, nomes e notas.`,
    `Escreva for p, v in zip(produtos, precos): . A cada volta, p é o produto e v é o preço que estava na mesma posição. As listas produtos e precos já estão prontas.`,
    `Uma linha para cada par: Mouse: 80 e Teclado: 250.`],
  'py-2-04': [
    `List comprehension (compreensão de lista) é um jeito curtinho de criar uma lista nova a partir de outra, tudo numa linha só: [o que fazer for item in lista].`,
    `Serve para transformar todos os itens de uma lista (multiplicar, converter, formatar) sem escrever um for comprido.`,
    `Escreva entre colchetes o que fazer com cada item e depois o for: print([n * 10 for n in notas]). A lista notas já está pronta.`,
    `Uma lista nova do mesmo tamanho, com cada nota vezes 10: [80, 50, 90, 40, 70, 100].`],
  'py-2-05': [
    `É a compreensão de lista com um if no final, que funciona como uma peneira: só entra na lista nova o item que passar no teste.`,
    `Serve para filtrar uma lista: só as notas altas, só os pedidos pagos, só os clientes ativos.`,
    `Escreva print([n for n in notas if n >= 7]). O if no final decide quais itens entram na lista nova.`,
    `Uma lista menor, só com as notas 7 ou mais: [8, 9, 7, 10].`],
  'py-2-06': [
    `Toda lista vem com ferramentas prontas, chamadas métodos: .sort() coloca em ordem, .reverse() vira do avesso, .insert() coloca um item numa posição, .pop() tira o último e .remove() tira um valor.`,
    `Serve para arrumar e editar uma lista que já existe, sem criar outra.`,
    `Chame o método com um ponto depois do nome da lista: notas.sort() e notas.pop(). Eles mudam a própria lista, por isso você não precisa de um = para guardar. Depois mostre: print(notas).`,
    `A lista já mexida, em ordem e sem o último item (o maior, que era o 10): [4, 5, 7, 8, 9].`],
  'py-2-07': [
    `sorted() devolve uma lista nova em ordem, sem mexer na original. Com key= você escolhe o critério da ordem e com reverse=True a ordem fica do maior para o menor.`,
    `Serve para ordenar por qualquer característica: pelo tamanho da palavra, pelo preço, pela data.`,
    `Escreva print(sorted(palavras, key=len, reverse=True)). Aqui o critério é len (o tamanho da palavra), escrito sem parênteses.`,
    `Uma lista nova, das palavras maiores para as menores: ['python', 'dados', 'sql', 'api'].`],
  'py-2-08': [
    `Fatiar é cortar um pedaço da lista, como cortar uma fatia de bolo: lista[a:b] vai da posição a até antes da b, lista[::2] pega de dois em dois e lista[::-1] vira a lista do avesso.`,
    `Serve para pegar só os primeiros ou os últimos itens, ou para ler a lista de trás para frente.`,
    `Escreva as posições entre colchetes, separadas por dois-pontos: notas[:3] pega os 3 primeiros e notas[::-1] inverte tudo. Mostre cada um com um print.`,
    `Duas linhas: [8, 5, 9] (os 3 primeiros) e [10, 7, 4, 9, 5, 8] (a lista de trás para frente).`],
  'py-2-09': [
    `Uma matriz é uma lista que tem outras listas dentro dela. Cada lista de dentro é uma linha, como as linhas de uma planilha.`,
    `Serve para representar tabelas: as linhas e colunas de uma planilha, um tabuleiro, as notas de cada aluno em cada prova.`,
    `Use dois pares de colchetes: tabela[1][2] é a 2ª linha e a 3ª coluna (lembre que a contagem começa no 0). E sum(tabela[0]) soma a primeira linha inteira.`,
    `Dois números, um por linha: 6 (o item da 2ª linha e 3ª coluna) e 6 (a soma de 1 + 2 + 3, a primeira linha).`],
  'py-2-10': [
    `Tupla é uma lista trancada com cadeado: depois de criada, não dá para mudar. Escreve-se com parênteses. Desempacotar é espalhar os valores dela em variáveis, de uma vez: x, y = (6, 7).`,
    `Serve para guardar dados que não devem mudar (como as coordenadas de um ponto) e para receber vários valores de uma vez.`,
    `Escreva as variáveis do lado esquerdo do = e a tupla do lado direito: x, y = ponto. Depois use x e y normalmente, como em print(x * y).`,
    `O resultado da conta com os valores desempacotados: 42 (6 vezes 7).`],
  'py-2-11': [
    `Set (conjunto) é uma sacola que só aceita um de cada: se você tentar colocar um valor repetido, ele é descartado. E a ordem dos itens não importa.`,
    `Serve para tirar repetidos e contar o que é diferente: clientes únicos, categorias distintas.`,
    `Transforme a lista em conjunto com set(compras) e conte os itens com len(): print(len(set(compras))).`,
    `Um número só: 3 (ana, bia e caio, mesmo que alguns tenham comprado várias vezes).`],
  'py-2-12': [
    `Conjuntos têm contas próprias, como nos diagramas da escola: & mostra o que está nos dois, | junta tudo e - mostra o que está só no primeiro.`,
    `Serve para comparar grupos: quem está numa turma e na outra não, o que os dois têm em comum.`,
    `Escreva turma_a - turma_b. Como o conjunto não tem ordem, coloque sorted() em volta para mostrar em ordem alfabética: print(sorted(turma_a - turma_b)).`,
    `Uma lista em ordem com quem está só na turma A: ['Ana', 'Caio'].`],
  'py-2-13': [
    `O .get() procura uma etiqueta no dicionário e, se ela não existir, devolve um valor de reserva em vez de dar erro. Sem o get, procurar uma chave que não existe quebra o programa.`,
    `Serve para consultar dados que podem estar faltando sem derrubar o programa.`,
    `Use vendas["Mouse"] quando a chave existe e vendas.get("Tablet", 0) quando ela pode não existir (o 0 é o valor de reserva). O dicionário vendas já está pronto.`,
    `Dois números, um por linha: 80 (o valor de "Mouse") e 0 (o valor de reserva, porque "Tablet" não existe).`],
  'py-2-14': [
    `Dicionário[chave] = valor cria um item novo ou troca o valor de um que já existe. E del dicionário[chave] apaga um item.`,
    `Serve para manter os dados em dia: mudar um preço, cadastrar um produto novo, apagar um que saiu.`,
    `Escreva uma linha para cada ação: vendas["Mouse"] = 90, vendas["Teclado"] = 250 e del vendas["Caneta"]. No final, mostre o dicionário: print(vendas).`,
    `O dicionário já atualizado: {'Notebook': 3500, 'Mouse': 90, 'Cadeira': 900, 'Teclado': 250}. O Mouse custa 90, o Teclado entrou e a Caneta saiu.`],
  'py-2-15': [
    `Dict comprehension é criar um dicionário inteiro numa linha só: {chave: valor for ... in ...}. É a versão do dicionário daquele jeito curtinho de criar listas.`,
    `Serve para montar um dicionário novo a partir de outro, aplicando uma regra em cada item, como dar um desconto em todos os preços.`,
    `Escreva print({p: v * 0.9 for p, v in vendas.items()}). O .items() entrega a etiqueta (p) e o valor (v) de cada item, e vezes 0.9 é o mesmo que tirar 10%.`,
    `Um dicionário novo com os mesmos produtos e os preços 10% menores: {'Notebook': 2700.0, 'Mouse': 90.0}.`],
  'py-2-16': [
    `Um padrão muito usado: andar por uma lista e, para cada item, somar 1 no placar dele dentro de um dicionário, como marcar tracinhos numa votação.`,
    `Serve para contar quantas vezes cada coisa aparece: cada cor, cada palavra, cada produto.`,
    `Crie contagem = {} (vazio) e, dentro do for, escreva contagem[cor] = contagem.get(cor, 0) + 1. O get(cor, 0) evita o erro na primeira vez que a cor aparece, porque ela ainda não tem placar.`,
    `Um dicionário com cada cor e quantas vezes ela apareceu: {'azul': 3, 'verde': 2, 'rosa': 1}.`],
  'py-2-17': [
    `.split() corta um texto em pedaços e devolve uma lista de palavras. O .join() faz o contrário: cola os pedaços de uma lista num texto só, com o que você escolher no meio.`,
    `Serve para separar as palavras de uma frase ou os campos de uma linha de dados, e para montar um texto a partir de uma lista.`,
    `frase.split() separa nos espaços. "-".join(palavras) cola as palavras usando o hífen no meio. Use len(palavras) para contar quantas são.`,
    `Duas linhas: 3 (o número de palavras) e dados-contam-histórias (as palavras coladas com hífen).`],
  'py-2-18': [
    `Três ferramentas de texto: .replace(a, b) troca um pedaço por outro, .find(x) diz em que posição x aparece e .count(x) conta quantas vezes x aparece.`,
    `Serve para consertar, procurar e contar dentro de textos: trocar vírgula por ponto, achar uma palavra, contar letras.`,
    `Chame o método depois do texto: texto.count("a") e texto.replace("a", "o"). O texto original não muda sozinho: o replace devolve uma cópia nova.`,
    `Duas linhas: 5 (quantos "a" tem em "casa amarela") e coso omorelo (o texto com cada "a" trocado por "o").`],
  'py-2-19': [
    `Dentro de uma f-string dá para dizer como o número deve aparecer: {x:.2f} mostra com 2 casas depois da vírgula e {x:,} coloca vírgulas para separar os milhares.`,
    `Serve para mostrar dinheiro, porcentagens e relatórios sempre com a mesma quantidade de casas, bem arrumadinhos.`,
    `Depois do nome da variável, ponha dois-pontos e o formato: print(f"Total: {total:.2f}"). O .2f quer dizer "2 casas decimais".`,
    `Uma linha com o número arrumado: Total: 1234.50 (repare que o zero no final aparece).`],
  'py-2-20': [
    `Um parâmetro pode ter um valor padrão, como texto="Olá": se quem chamar a função não disser nada, vale o padrão. É como o tamanho médio que vem de brinde se você não escolher.`,
    `Serve para criar funções flexíveis: a mesma função funciona com ou sem a informação extra.`,
    `Na criação da função, escreva o parâmetro com = e o valor padrão: def saudacao(nome, texto="Olá"). Ao chamar, o segundo valor é opcional: saudacao("Ana") ou saudacao("Bia", "Oi").`,
    `Duas linhas: Olá, Ana! (usou o padrão) e Oi, Bia! (usou o valor que você mandou).`],
  'py-2-21': [
    `Argumento nomeado é quando você diz o nome do parâmetro ao chamar a função: desconto=0.1. Assim ninguém se confunde com a ordem dos valores.`,
    `Serve para deixar a chamada fácil de entender e para pular parâmetros opcionais sem errar a ordem.`,
    `Chame com nome=valor: preco_final(200, desconto=0.1). Na criação da função, desconto=0 é o valor padrão, que vale quando você não escreve nada.`,
    `O preço com o desconto, como número com vírgula: 180.0 (200 menos 10%).`],
  'py-2-22': [
    `lambda é uma função bem pequenininha, sem nome, escrita numa linha só: lambda x: x * 2 quer dizer "pegue x e devolva x vezes 2". Muito usada para dizer como ordenar.`,
    `Serve para entregar uma regra rápida para outra função (como sorted, map e filter) sem escrever um def inteiro.`,
    `Escreva lambda, o nome do parâmetro, dois-pontos e o resultado: key=lambda x: x[1]. Isso quer dizer "ordene pelo segundo valor de cada tupla" (o preço). A lista itens já está pronta.`,
    `A lista de tuplas em ordem de preço, do menor para o maior: [('Caneta', 3), ('Mouse', 80), ('Mesa', 650)].`],
  'py-2-23': [
    `map(f, lista) aplica uma função em cada item da lista, e filter(f, lista) fica só com os itens que passam num teste. Coloque list() em volta para ver o resultado.`,
    `Serve para transformar e filtrar listas usando funções, um jeito muito usado quando se analisa dados.`,
    `Escreva list(map(lambda x: x * x, numeros)) e list(filter(lambda x: x > 10, q)). A lambda diz o que fazer com cada item (aqui, elevar ao quadrado e depois testar se é maior que 10).`,
    `Duas listas: os quadrados [1, 4, 9, 16, 25] e, dentre eles, só os maiores que 10: [16, 25].`],
  'py-2-24': [
    `any() responde "existe algum?": dá True se pelo menos um item for verdadeiro. all() responde "são todos?": dá True só se todos forem.`,
    `Serve para responder "tem algum aluno abaixo da média?" ou "todos passaram?" sem escrever um for inteiro.`,
    `Use uma compreensão dentro do parêntese: any(n < 5 for n in notas) e all(n >= 4 for n in notas). A lista notas já está pronta.`,
    `Duas linhas: True (tem uma nota abaixo de 5) e True (todas as notas são 4 ou mais).`],
  'py-2-25': [
    `try quer dizer "tente". O Python tenta rodar o código, e se algo der errado, o except ("exceto se der erro") pega o problema e segue em frente, sem o programa quebrar.`,
    `Serve para lidar com dados bagunçados ou digitados errado: transformar em número um texto que talvez não seja número.`,
    `Escreva try: com o código arriscado (print(int(texto))) e except ValueError: com o que fazer se der erro (print("Valor inválido")). Cada parte tem 4 espaços na frente.`,
    `A sua mensagem, no lugar daquele erro vermelho feio: Valor inválido. (O texto "abc" não vira número.)`],
  'py-2-26': [
    `raise quer dizer "levante": ele cria um erro de propósito, para barrar valores que não fazem sentido, como o professor que não aceita uma resposta absurda.`,
    `Serve para proteger suas funções: recusar um número negativo, um campo vazio, uma idade impossível.`,
    `Dentro da função, escreva if x < 0: raise ValueError("negativo"). Quem chama a função usa try / except ValueError as e para pegar o erro e mostrar a mensagem com print(e).`,
    `A mensagem do erro que você criou, mostrada na tela: negativo.`],
  'py-2-27': [
    `import traz ferramentas prontas de outros "pacotes". O módulo math tem contas de matemática e o datetime sabe trabalhar com datas.`,
    `Serve para não ter que inventar tudo do zero: arredondar para cima ou para baixo, descobrir quantos dias existem entre duas datas.`,
    `Escreva import math e use math.ceil(7.2) e math.floor(7.8). Para as datas, escreva from datetime import date, subtraia as duas datas e leia o .days, como em (date(2026, 12, 25) - date(2026, 10, 18)).days.`,
    `Três números, um por linha: 8 (7.2 arredondado para cima), 7 (7.8 arredondado para baixo) e 68 (os dias entre as duas datas).`],
  'py-2-28': [
    `Counter é um contador automático: você entrega a lista e ele conta quantas vezes cada item aparece. O .most_common() mostra os que mais aparecem primeiro.`,
    `Serve para descobrir o campeão de repetições: a cor mais usada, a palavra mais repetida.`,
    `Escreva from collections import Counter e depois print(Counter(cores).most_common(1)[0][0]). O most_common(1) pega só o primeiro lugar e os [0][0] tiram só o nome dele.`,
    `Só o nome do item que mais aparece: azul.`],
  'py-2-29': [
    `Função recursiva é uma função que chama ela mesma, como duas espelhos frente a frente, e por isso precisa de uma regra de parada, o "caso base", ou nunca acabaria.`,
    `Serve para problemas que se repetem em versões menores de si mesmos, como o fatorial, as pastas dentro de pastas e as sequências.`,
    `Escreva primeiro o caso base: if n == 0: return 1. Depois, a função chamando ela mesma com um número menor: return n * fatorial(n - 1).`,
    `O fatorial de 5: 120 (que é 5 × 4 × 3 × 2 × 1).`],
  'py-2-30': [
    `Um mini projeto que junta dicionário, repetidor e formatação para montar um relatório de vendas, como o de uma lojinha de verdade.`,
    `Serve para treinar o que uma pessoa analista faz de verdade: andar pelos dados e mostrar tudo bem organizado.`,
    `Use for produto, valor in vendas.items(): com uma f-string e :.2f para cada linha. Depois, mostre o total somando tudo com sum(vendas.values()).`,
    `Uma linha por produto, como Mouse: R$ 80.00, e na última o total: Total: R$ 4483.00.`]
};
