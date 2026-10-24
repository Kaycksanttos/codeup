// Python — NÍVEL INTERMEDIÁRIO: as 4 explicações de cada lição, na ordem:
//   [ O que é ,  Para que serve ,  Como se faz ,  Qual o retorno esperado ]
module.exports = {
  'py-2-01': [
    `range(início, fim, passo) gera números pulando de passo em passo. Com passo negativo, conta de trás para frente.`,
    `Para contagens regressivas, para pegar só de 2 em 2 ou de 5 em 5, e para percorrer posições em qualquer direção.`,
    `Escreva for i in range(10, 0, -2): ... O primeiro número é onde começa, o segundo é onde para (sem incluir) e o terceiro é o passo.`,
    `Os números gerados, um por linha: 10, 8, 6, 4 e 2.`],
  'py-2-02': [
    `enumerate() entrega o número da posição junto com cada item da lista.`,
    `Para numerar linhas e rankings sem criar um contador à mão.`,
    `Escreva for i, nome in enumerate(nomes, 1): — o i recebe o número (o 1 faz a contagem começar em 1) e o nome recebe o item.`,
    `Uma linha por pessoa, no formato pedido: 1 - Ana, 2 - Bruno e 3 - Carla.`],
  'py-2-03': [
    `zip() junta duas listas e entrega os itens em pares, na mesma posição.`,
    `Para percorrer dados que andam juntos: produtos e preços, nomes e notas.`,
    `Escreva for p, v in zip(produtos, precos): — a cada volta, p é o produto e v é o preço da mesma posição.`,
    `Uma linha por par: Mouse: 80 e Teclado: 250.`],
  'py-2-04': [
    `List comprehension é um jeito curto de criar uma lista nova a partir de outra: [expressão for item in lista].`,
    `Para transformar todos os itens de uma lista (multiplicar, converter, formatar) em uma linha só.`,
    `Escreva entre colchetes o que fazer com cada item, depois for item in lista: [n * 10 for n in notas].`,
    `Uma lista nova com o mesmo tamanho da original, cada valor transformado: [80, 50, 90, 40, 70, 100].`],
  'py-2-05': [
    `É a compreensão de lista com um if no final, que deixa passar só os itens que cumprem a condição.`,
    `Para filtrar uma lista: só as notas altas, só os pedidos pagos, só os clientes ativos.`,
    `Escreva [n for n in notas if n >= 7]: o if no fim decide quais itens entram na lista nova.`,
    `Uma lista menor, só com os itens aprovados no teste: [8, 9, 7, 10].`],
  'py-2-06': [
    `Listas têm métodos prontos: .sort() ordena, .reverse() inverte, .insert(pos, x) insere, .pop() remove o último e .remove(x) remove um valor.`,
    `Para organizar e editar uma lista que já existe, sem criar outra.`,
    `Chame cada método com ponto depois do nome da lista: notas.sort() e notas.pop(). Eles alteram a própria lista, por isso não precisa de =.`,
    `A lista já alterada, ordenada e sem o último item: [4, 5, 7, 8, 9].`],
  'py-2-07': [
    `sorted() devolve uma lista nova ordenada, sem mexer na original. Com key= você escolhe o critério e com reverse=True inverte a ordem.`,
    `Para ordenar por qualquer característica: tamanho da palavra, preço, data.`,
    `Escreva sorted(palavras, key=len, reverse=True). Use o nome da função (len) sem parênteses no key.`,
    `Uma lista nova, das palavras maiores para as menores: ['python', 'dados', 'sql', 'api'].`],
  'py-2-08': [
    `Fatiar é pegar um pedaço da lista: lista[a:b] vai do índice a até antes de b; lista[::2] pega de dois em dois; lista[::-1] inverte.`,
    `Para extrair os primeiros ou últimos itens, ou virar a lista de trás para frente.`,
    `Escreva as posições entre colchetes separadas por dois-pontos: notas[:3] pega os 3 primeiros e notas[::-1] inverte tudo.`,
    `Duas listas: [8, 5, 9] (os 3 primeiros) e [10, 7, 4, 9, 5, 8] (a lista invertida).`],
  'py-2-09': [
    `Uma matriz é uma lista de listas: cada item da lista maior é uma linha, e cada linha é outra lista.`,
    `Para representar tabelas: linhas e colunas de uma planilha, um tabuleiro, notas por aluno e por prova.`,
    `Use dois pares de colchetes: tabela[1][2] é a 2ª linha e a 3ª coluna (a contagem começa no 0). sum(tabela[0]) soma a 1ª linha.`,
    `Dois números, um por linha: o item da posição pedida (6) e a soma da primeira linha (6).`],
  'py-2-10': [
    `Tupla é uma lista que não pode ser alterada, escrita com parênteses. Desempacotar é espalhar seus valores em variáveis: x, y = (6, 7).`,
    `Para guardar dados que não devem mudar (coordenadas, datas) e para receber vários valores de uma vez.`,
    `Escreva as variáveis na esquerda do = e a tupla na direita: x, y = ponto. Depois use x e y normalmente.`,
    `O resultado da conta com os valores desempacotados: 42.`],
  'py-2-11': [
    `Um set (conjunto) guarda valores únicos: repetidos são descartados, e a ordem não importa.`,
    `Para remover duplicados e contar valores diferentes: clientes únicos, categorias distintas.`,
    `Converta a lista com set(compras) e conte com len(): print(len(set(compras))).`,
    `Um número: a quantidade de valores diferentes, 3.`],
  'py-2-12': [
    `Conjuntos têm operações próprias: & (interseção, o que está nos dois), | (união, tudo) e - (diferença, o que está só no primeiro).`,
    `Para comparar grupos: quem está em um e não no outro, o que os dois têm em comum.`,
    `Escreva turma_a - turma_b. Como conjunto não tem ordem, use sorted() para mostrar em ordem alfabética.`,
    `Uma lista ordenada com quem só está na turma A: ['Ana', 'Caio'].`],
  'py-2-13': [
    `dicionario.get(chave, padrão) lê um valor sem dar erro quando a chave não existe; "in" testa se a chave existe.`,
    `Para consultar dados que podem faltar sem derrubar o programa.`,
    `Use vendas["Mouse"] quando a chave existe e vendas.get("Tablet", 0) quando pode não existir (o 0 é o valor de reserva).`,
    `Dois números: 80 (o valor de "Mouse") e 0 (o valor padrão, pois "Tablet" não existe).`],
  'py-2-14': [
    `dicionario[chave] = valor cria ou altera um item; del dicionario[chave] remove um item.`,
    `Para manter dados atualizados: mudar um preço, cadastrar um produto novo, apagar um que saiu.`,
    `Use uma linha para cada ação: vendas["Mouse"] = 90, vendas["Teclado"] = 250 e del vendas["Caneta"]. Depois imprima o dicionário.`,
    `O dicionário já atualizado, com o Mouse a 90, o Teclado novo e sem a Caneta.`],
  'py-2-15': [
    `Dict comprehension cria um dicionário de uma vez: {chave: valor for ... in ...}.`,
    `Para montar um dicionário novo a partir de outro, aplicando uma regra a cada item (por exemplo, um desconto).`,
    `Escreva {p: v * 0.9 for p, v in vendas.items()}: .items() entrega a chave e o valor de cada item.`,
    `Um dicionário novo com os mesmos produtos e os preços com 10% de desconto.`],
  'py-2-16': [
    `Um padrão clássico: percorrer uma lista e somar 1 na contagem de cada item em um dicionário.`,
    `Para contar ocorrências: quantas vezes cada cor, palavra ou produto aparece.`,
    `Crie contagem = {} e, dentro do for, escreva contagem[cor] = contagem.get(cor, 0) + 1. O get evita erro na primeira vez.`,
    `Um dicionário com cada item e quantas vezes ele apareceu: {'azul': 3, 'verde': 2, 'rosa': 1}.`],
  'py-2-17': [
    `.split() quebra um texto em uma lista de pedaços; "sep".join(lista) faz o contrário e junta uma lista em um texto.`,
    `Para separar palavras ou campos de um texto (como uma linha de CSV) e para montar um texto a partir de uma lista.`,
    `frase.split() separa nos espaços. "-".join(palavras) junta usando o hífen entre as palavras.`,
    `Duas linhas: o número de palavras (3) e o texto unido por hífen: dados-contam-histórias.`],
  'py-2-18': [
    `.replace(a, b) troca trechos de um texto, .find(x) devolve a posição onde x aparece e .count(x) conta quantas vezes aparece.`,
    `Para corrigir, procurar e contar dentro de textos: trocar vírgula por ponto, achar uma palavra, contar letras.`,
    `Chame o método depois do texto: texto.count("a") e texto.replace("a", "o"). Textos não mudam sozinhos: o replace devolve uma cópia.`,
    `Duas linhas: a contagem (5) e o texto com todos os "a" trocados por "o".`],
  'py-2-19': [
    `Dentro de uma f-string, {x:.2f} mostra o número com 2 casas decimais e {x:,} coloca separador de milhar.`,
    `Para mostrar valores em reais, percentuais e relatórios sempre com o mesmo número de casas.`,
    `Depois da variável, coloque dois-pontos e o formato: f"Total: {total:.2f}". O .2f significa 2 casas decimais.`,
    `Uma linha com o valor formatado: Total: 1234.50`],
  'py-2-20': [
    `Um parâmetro pode ter valor padrão (texto="Olá"): se quem chamar não passar nada, vale o padrão. *args recebe quantos valores forem passados.`,
    `Para funções flexíveis: o mesmo código serve com ou sem o parâmetro opcional.`,
    `Na definição, escreva o parâmetro com = e o valor: def saudacao(nome, texto="Olá"). Ao chamar, o segundo argumento é opcional.`,
    `Duas linhas: Olá, Ana! (usou o padrão) e Oi, Bia! (usou o valor informado).`],
  'py-2-21': [
    `Argumentos nomeados: você chama a função dizendo o nome do parâmetro. **kwargs recebe qualquer parâmetro nomeado.`,
    `Para deixar a chamada clara e poder pular parâmetros opcionais sem errar a ordem.`,
    `Chame com nome=valor: preco_final(200, desconto=0.1). Na definição, desconto=0 é o valor padrão.`,
    `O preço com o desconto aplicado, como decimal: 180.0.`],
  'py-2-22': [
    `lambda cria uma função pequena, sem nome, em uma linha: lambda x: x * 2. É muito usada para escolher critérios de ordenação.`,
    `Para passar uma regra rápida a outra função (sorted, map, filter) sem precisar de um def inteiro.`,
    `Escreva lambda, o parâmetro, dois-pontos e o resultado: key=lambda x: x[1] ordena pelo segundo valor de cada tupla.`,
    `A lista de tuplas ordenada pelo preço, do menor para o maior: Caneta, Mouse e Mesa.`],
  'py-2-23': [
    `map(f, lista) aplica uma função em cada item; filter(f, lista) mantém só os itens que passam no teste. Use list() para ver o resultado.`,
    `Para transformar e filtrar listas com funções, um estilo muito usado em análise de dados.`,
    `Escreva list(map(lambda x: x * x, numeros)) e list(filter(lambda x: x > 10, q)). A lambda diz o que fazer com cada item.`,
    `Duas listas: os quadrados [1, 4, 9, 16, 25] e, dentre eles, só os maiores que 10: [16, 25].`],
  'py-2-24': [
    `any() é True se algum item for verdadeiro; all() é True só se todos forem.`,
    `Para responder "existe algum...?" e "todos são...?" sem escrever um laço.`,
    `Use uma compreensão dentro do parêntese: any(n < 5 for n in notas) e all(n >= 4 for n in notas).`,
    `Duas linhas com True ou False: True (há uma nota abaixo de 5) e True (todas são 4 ou mais).`],
  'py-2-25': [
    `try tenta executar um código; se ocorrer um erro, o except trata o problema sem derrubar o programa.`,
    `Para lidar com dados sujos ou entradas erradas: converter um texto que pode não ser número, abrir algo que pode não existir.`,
    `Escreva try: com o código arriscado e except ValueError: com a reação ao erro. Cada bloco vem recuado.`,
    `A mensagem do tratamento, em vez do erro vermelho: Valor inválido.`],
  'py-2-26': [
    `raise lança um erro de propósito, para barrar valores que não fazem sentido.`,
    `Para proteger funções: recusar um valor negativo, um campo vazio, uma idade impossível.`,
    `Dentro da função, escreva if x < 0: raise ValueError("negativo"). Quem chama usa try/except ... as e para ler a mensagem.`,
    `A mensagem do erro, capturada e impressa: negativo.`],
  'py-2-27': [
    `import traz ferramentas prontas. O módulo math tem funções matemáticas e datetime trabalha com datas.`,
    `Para não reinventar a roda: arredondar para cima ou para baixo, calcular raiz, contar dias entre datas.`,
    `Escreva import math e use math.ceil(7.2). Para datas, from datetime import date e subtraia duas datas, lendo .days.`,
    `Três números, um por linha: 8 (arredondado para cima), 7 (para baixo) e 68 (dias entre as duas datas).`],
  'py-2-28': [
    `collections.Counter conta itens automaticamente e tem o método .most_common() para listar os mais frequentes.`,
    `Para descobrir o item mais comum em uma lista de forma rápida: a cor mais usada, a palavra mais repetida.`,
    `Escreva from collections import Counter e use Counter(cores).most_common(1)[0][0]: o [0][0] pega só o nome do primeiro lugar.`,
    `Só o nome do item mais frequente: azul.`],
  'py-2-29': [
    `Uma função recursiva chama a si mesma, sempre com um caso base que a faz parar.`,
    `Para problemas que se repetem em versões menores de si mesmos: fatorial, árvores de pastas, sequências.`,
    `Escreva primeiro o caso base (if n == 0: return 1) e depois a chamada da própria função com um valor menor: n * fatorial(n - 1).`,
    `O resultado do fatorial: 120 (5 × 4 × 3 × 2 × 1).`],
  'py-2-30': [
    `Um mini projeto que junta dicionários, laços e formatação para montar um relatório de vendas.`,
    `Para treinar o que um analista faz de verdade: percorrer os dados e apresentá-los de forma organizada.`,
    `Use for produto, valor in vendas.items(): com f-string e :.2f para cada linha. Depois some tudo com sum(vendas.values()).`,
    `Uma linha por produto, como Mouse: R$ 80.00, e na última o total: Total: R$ 4483.00.`]
};
