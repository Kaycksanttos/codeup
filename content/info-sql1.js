// SQL — NÍVEL BÁSICO: as 4 explicações de cada lição, escritas como se a pessoa tivesse 10 anos e estivesse vendo isso pela primeira vez.
//   [ O que é ,  Para que serve ,  Como você vai usar aqui ,  O que vai aparecer na tela ]
module.exports = {
  'sql-1-01': [
    `Um banco de dados é como um armário cheio de listas, e cada lista se chama tabela. SELECT quer dizer "mostre pra mim", FROM quer dizer "de onde" e o asterisco (*) quer dizer "tudo".`,
    `Serve para abrir uma lista e ver o que tem dentro dela, como abrir um caderno para ler tudo que está anotado. É sempre o primeiro passo antes de qualquer outra coisa.`,
    `Você vai escrever uma frase em 3 pedaços: SELECT (mostre) + * (tudo) + FROM produtos (da lista chamada produtos). Fica assim: SELECT * FROM produtos.`,
    `Vai aparecer a lista de produtos inteira, como uma tabelinha: 5 colunas (cada coluna é um tipo de informação: id, nome, preco, categoria e estoque) e 10 linhas (cada linha é um produto).`],
  'sql-1-02': [
    `Em vez de pedir tudo, você pode escolher só as colunas que quer ver. Coluna é um tipo de informação da tabela, como "nome" ou "preço".`,
    `Serve para ver só o que importa, sem bagunça. Se você só quer saber o nome e o preço das coisas, não precisa ver o resto. É como ler só duas linhas de uma ficha.`,
    `Troque o * pelos nomes das colunas que você quer, com uma vírgula entre eles. Atenção: depois da última coluna não vai vírgula. Fica assim: SELECT nome, preco FROM produtos.`,
    `Uma tabelinha com só 2 colunas (nome e preco) e as mesmas 10 linhas.`],
  'sql-1-03': [
    `AS é como colar uma etiqueta nova numa coluna. O apelido que você escolher aparece no resultado no lugar do nome antigo.`,
    `Serve para deixar o resultado com nomes mais fáceis de entender, como mostrar "valor" em vez de "preco". O nome na tabela original continua igualzinho, só o que aparece na tela muda.`,
    `Escreva a coluna, depois a palavrinha AS e o apelido: preco AS valor. Fica assim: SELECT nome, preco AS valor FROM produtos.`,
    `2 colunas: nome e valor (que antes se chamava preco), com as 10 linhas.`],
  'sql-1-04': [
    `WHERE quer dizer "onde". Ele funciona como uma peneira: só deixa passar as linhas que cumprem a regra que você escrever. Com números, a regra usa sinais como > (maior que), < (menor que) e = (igual a).`,
    `Serve para achar só o que você procura no meio de muita coisa, como "só os produtos caros" ou "só os que estão acabando".`,
    `O WHERE vem depois do FROM, com a regra: WHERE preco > 500 quer dizer "onde o preço é maior que 500". Fica assim: SELECT nome FROM produtos WHERE preco > 500.`,
    `Uma lista só com os nomes dos produtos que custam mais de 500: 4 linhas (Notebook, Cadeira, Mesa e Monitor).`],
  'sql-1-05': [
    `Quando a regra usa uma palavra (um texto) em vez de um número, a palavra vai entre aspas simples, assim: 'Papelaria'. As aspas avisam o computador: "isto aqui é um texto".`,
    `Serve para pegar tudo de um grupo: os produtos de uma categoria, as pessoas de uma cidade, os pedidos de um tipo.`,
    `Escreva WHERE categoria = 'Papelaria'. Use aspas simples (') e escreva a palavra igualzinha à da tabela, com a mesma letra maiúscula e o mesmo acento. Fica assim: SELECT nome FROM produtos WHERE categoria = 'Papelaria'.`,
    `Os nomes dos produtos de Papelaria: 3 linhas (Caneta, Caderno e Lápis).`],
  'sql-1-06': [
    `O sinal <> quer dizer "diferente de". Ele pega tudo que NÃO é igual ao que você escreveu. É o contrário do sinal de igual.`,
    `Serve para deixar um grupo de fora: "todos os produtos, menos os eletrônicos".`,
    `Escreva a coluna, o sinal <> (um menor e um maior colados) e o valor entre aspas: WHERE categoria <> 'Eletrônicos'. Fica assim: SELECT nome, categoria FROM produtos WHERE categoria <> 'Eletrônicos'.`,
    `2 colunas (nome e categoria) e 6 linhas: todos os produtos, menos os Eletrônicos.`],
  'sql-1-07': [
    `AND quer dizer "e". Ele junta duas regras, e a linha só passa se cumprir as DUAS ao mesmo tempo. É como "só entra no parque quem tem ingresso E está de pulseira".`,
    `Serve para procurar com mais capricho: "eletrônicos E baratos", "pedidos pagos E de hoje".`,
    `Escreva uma regra, a palavra AND e a outra regra: WHERE categoria = 'Eletrônicos' AND preco < 300. Fica assim: SELECT nome FROM produtos WHERE categoria = 'Eletrônicos' AND preco < 300.`,
    `Só os nomes dos produtos que passaram nas duas regras: 2 linhas (Mouse e Teclado).`],
  'sql-1-08': [
    `OR quer dizer "ou". Ele junta duas regras, e a linha passa se cumprir PELO MENOS UMA delas. É como "pode brincar quem trouxe bola OU quem trouxe corda".`,
    `Serve para aceitar mais de uma possibilidade: "móveis ou coisas bem baratas", "clientes de SP ou do RJ".`,
    `Escreva uma regra, a palavra OR e a outra regra: WHERE categoria = 'Móveis' OR preco < 10. Fica assim: SELECT nome FROM produtos WHERE categoria = 'Móveis' OR preco < 10.`,
    `Os nomes dos produtos que cumprem uma das regras (ou as duas): 5 linhas (Cadeira, Mesa, Caneta, Estante e Lápis).`],
  'sql-1-09': [
    `Parênteses são como uma caixinha que diz "resolva isto primeiro". Quando você mistura AND e OR na mesma frase, eles evitam confusão.`,
    `Serve para o computador entender exatamente o que você quer. Sem parênteses, o AND é resolvido antes do OR e o resultado pode ficar errado sem você perceber.`,
    `Coloque a parte do OR dentro de parênteses e depois ligue o resto com AND: WHERE (categoria = 'Móveis' OR categoria = 'Papelaria') AND preco < 100. Quer dizer: "é Móveis ou Papelaria, e além disso custa menos de 100".`,
    `Só os nomes dos itens baratos dessas duas categorias: 3 linhas (Caneta, Caderno e Lápis).`],
  'sql-1-10': [
    `IN quer dizer "está dentro de". Você escreve uma lista de opções entre parênteses, e passa quem estiver na lista.`,
    `Serve para escolher vários de uma vez sem repetir OR, OR, OR. Por exemplo: "os produtos número 1, 3 e 5" ou "clientes de SP, RJ e MG".`,
    `Escreva a coluna, a palavra IN e a lista entre parênteses, com vírgulas: WHERE id IN (1, 3, 5). Fica assim: SELECT nome FROM produtos WHERE id IN (1, 3, 5).`,
    `Os nomes dos produtos de id 1, 3 e 5: 3 linhas (Notebook, Cadeira e Caneta).`],
  'sql-1-11': [
    `BETWEEN quer dizer "entre". Ele pega tudo que está dentro de uma faixa, de um número até outro, incluindo os dois números das pontas.`,
    `Serve para pegar uma faixa: "preços de 80 a 700", "datas de janeiro".`,
    `Escreva a coluna, BETWEEN, o número menor, a palavra AND e o número maior: WHERE preco BETWEEN 80 AND 700. O menor sempre vem primeiro. Fica assim: SELECT nome, preco FROM produtos WHERE preco BETWEEN 80 AND 700.`,
    `2 colunas (nome e preco) e 4 linhas: Mouse (80), Mesa (650), Teclado (250) e Estante (480).`],
  'sql-1-12': [
    `LIKE é uma busca por "parecido com". O símbolo % é um coringa: ele vale por qualquer quantidade de letras. Então 'C%' quer dizer "começa com C e o resto pode ser qualquer coisa".`,
    `Serve para procurar pelo começo de uma palavra, como quando você digita as primeiras letras de um nome na lista de contatos do celular.`,
    `Escreva a coluna, LIKE e a letra seguida do % entre aspas: WHERE nome LIKE 'C%'. Fica assim: SELECT nome FROM produtos WHERE nome LIKE 'C%'.`,
    `Os nomes que começam com C: 3 linhas (Cadeira, Caneta e Caderno).`],
  'sql-1-13': [
    `Se você põe o % dos dois lados, o LIKE procura o pedacinho em qualquer lugar da palavra: no começo, no meio ou no fim. '%ado%' quer dizer "tem ado em algum lugar".`,
    `Serve para achar uma palavra quando você só lembra um pedaço dela, como procurar "pão" e achar "pão de queijo" e "sanduíche de pão".`,
    `Escreva o pedaço entre dois %: WHERE nome LIKE '%ado%'. Fica assim: SELECT nome FROM produtos WHERE nome LIKE '%ado%'.`,
    `O nome que tem "ado" no meio: 1 linha (Teclado).`],
  'sql-1-14': [
    `ORDER BY quer dizer "ordene por". Ele arruma as linhas do resultado em fila, como organizar os alunos por altura. Se você não disser nada, a fila vai do menor para o maior.`,
    `Serve para deixar a lista arrumada: do mais barato ao mais caro, em ordem alfabética, da data mais antiga à mais nova.`,
    `O ORDER BY fica sempre no final, com a coluna que manda na fila: ORDER BY preco. Fica assim: SELECT nome, preco FROM produtos ORDER BY preco.`,
    `Os 10 produtos em fila, do mais barato para o mais caro (o Lápis primeiro e o Notebook por último).`],
  'sql-1-15': [
    `DESC quer dizer "decrescente": a fila vai do maior para o menor. É o contrário do jeito normal.`,
    `Serve para fazer ranking, como "quem tem mais", "o que mais vendeu", "o mais novo".`,
    `Escreva DESC logo depois da coluna: ORDER BY estoque DESC. Fica assim: SELECT nome, estoque FROM produtos ORDER BY estoque DESC.`,
    `Os 10 produtos com o maior estoque lá em cima (o Lápis, com 1200, aparece primeiro).`],
  'sql-1-16': [
    `Dá para ordenar por duas coisas. A primeira manda na fila, e a segunda só entra para desempatar quando a primeira for igual. É como arrumar a turma: primeiro por sala e, dentro de cada sala, por altura.`,
    `Serve para listas organizadas em grupos, como "cada categoria junta e, dentro dela, do mais caro ao mais barato".`,
    `Escreva as duas colunas separadas por vírgula, cada uma com seu sentido: ORDER BY categoria, preco DESC. A categoria vai de A a Z e o preço do maior para o menor. Fica assim: SELECT categoria, nome, preco FROM produtos ORDER BY categoria, preco DESC.`,
    `3 colunas e 10 linhas, em blocos por categoria (de A a Z) e, dentro de cada bloco, o preço do maior para o menor.`],
  'sql-1-17': [
    `LIMIT quer dizer "limite". Ele diz quantas linhas você quer ver, no máximo, e corta o resto. É como dizer "só me mostre as 4 primeiras páginas".`,
    `Serve para dar uma espiada numa tabela enorme sem encher a tela, ou para pegar só os primeiros itens de uma lista.`,
    `Escreva LIMIT e o número lá no final: SELECT * FROM produtos LIMIT 4.`,
    `Todas as colunas, mas só 4 linhas (as 4 primeiras da tabela).`],
  'sql-1-18': [
    `Juntando ORDER BY com LIMIT você monta um pódio: primeiro coloca todo mundo em fila, depois pega só os primeiros. É assim que se descobre "os 3 mais caros".`,
    `Serve para responder perguntas como "quais são os 3 mais caros?" e "quem são os 5 que mais venderam?".`,
    `Ordene do maior para o menor com DESC e depois corte com LIMIT: ORDER BY preco DESC LIMIT 3. A ordem das palavras importa: primeiro ORDER BY, depois LIMIT. Fica assim: SELECT nome, preco FROM produtos ORDER BY preco DESC LIMIT 3.`,
    `2 colunas (nome e preco) e 3 linhas: Notebook, Monitor e Cadeira, do mais caro para o menos caro.`],
  'sql-1-19': [
    `DISTINCT quer dizer "diferente, sem repetir". Ele tira as repetições do resultado e deixa cada valor aparecer uma vez só.`,
    `Serve para saber quais opções existem: quais categorias, quais cidades, quais tipos. Sem ele, cada categoria apareceria uma vez para cada produto.`,
    `Escreva DISTINCT logo depois do SELECT: SELECT DISTINCT categoria FROM produtos.`,
    `Cada categoria uma vez só: 3 linhas (Eletrônicos, Móveis e Papelaria).`],
  'sql-1-20': [
    `COUNT quer dizer "conte". Ele junta várias linhas e devolve só um número: quantas linhas existem. É como uma calculadora que conta pra você.`,
    `Serve para responder "quantos?": quantos produtos, quantos clientes, quantos pedidos.`,
    `Escreva COUNT(*) no lugar das colunas. Se quiser contar só uma parte, use o WHERE que você já aprendeu. Fica assim: SELECT COUNT(*) FROM produtos WHERE categoria = 'Móveis'.`,
    `Uma tabelinha com 1 linha e 1 coluna, só com o número: 3 (os produtos de Móveis).`],
  'sql-1-21': [
    `SUM quer dizer "soma". Ele pega todos os números de uma coluna e soma, como somar todas as notas de uma prova.`,
    `Serve para responder "quanto deu no total?": total vendido, total em estoque, total arrecadado.`,
    `Escreva o nome da coluna dentro dos parênteses: SUM(qtd). Agora a tabela é outra, a vendas. Fica assim: SELECT SUM(qtd) FROM vendas.`,
    `1 linha e 1 coluna com o total: 207 (as unidades vendidas, somadas).`],
  'sql-1-22': [
    `AVG quer dizer "média" (do inglês "average"). A média é o valor do meio do caminho: você soma tudo e divide pela quantidade de itens.`,
    `Serve para saber o valor "normal" de uma coisa: o preço médio, a nota média da turma.`,
    `Escreva AVG(preco). Para fazer a média só de um grupo, junte um WHERE. Fica assim: SELECT AVG(preco) FROM produtos WHERE categoria = 'Eletrônicos'.`,
    `1 linha e 1 coluna com a média de preço dos eletrônicos: 1257.5.`],
  'sql-1-23': [
    `MIN é o menor valor e MAX é o maior. Dá para pedir os dois ao mesmo tempo no mesmo SELECT.`,
    `Serve para achar os extremos: o produto mais barato e o mais caro, a menor e a maior nota.`,
    `Escreva as duas funções separadas por vírgula, na ordem em que você quer ver: SELECT MIN(estoque), MAX(estoque) FROM produtos.`,
    `1 linha com 2 colunas, nessa ordem: 0 (o menor estoque) e 1200 (o maior).`],
  'sql-1-24': [
    `COUNT(DISTINCT ...) conta quantos valores DIFERENTES existem, sem contar o mesmo valor duas vezes. Junta o "conte" com o "sem repetir".`,
    `Serve para contar sem repetir: quantos clientes diferentes compraram, mesmo que alguns tenham comprado várias vezes.`,
    `Ponha DISTINCT dentro do COUNT, antes do nome da coluna: COUNT(DISTINCT produto_id). Fica assim: SELECT COUNT(DISTINCT produto_id) FROM vendas.`,
    `1 linha e 1 coluna: 9 (nove produtos diferentes já foram vendidos, mesmo havendo mais vendas do que isso).`],
  'sql-1-25': [
    `GROUP BY quer dizer "agrupe por". Ele separa as linhas em montinhos (um montinho para cada categoria, por exemplo), e a conta de contar ou somar trabalha dentro de cada montinho.`,
    `Serve para fazer resumos por grupo: quantos produtos em cada categoria, quanto vendeu cada mês, quanto cada cliente gastou.`,
    `Escreva a coluna do grupo no SELECT e também depois do GROUP BY, e ponha a conta ao lado. Fica assim: SELECT categoria, COUNT(*) FROM produtos GROUP BY categoria.`,
    `Uma linha para cada categoria, com o total de produtos dela: Eletrônicos (4), Móveis (3) e Papelaria (3).`],
  'sql-1-26': [
    `Em cada montinho do GROUP BY você pode fazer várias contas ao mesmo tempo, como somar uma coisa e tirar a média de outra.`,
    `Serve para montar um resumo completo de cada grupo numa consulta só, como o boletim de cada turma.`,
    `Liste as contas no SELECT, separadas por vírgula, depois da coluna do grupo. Fica assim: SELECT categoria, SUM(estoque), AVG(preco) FROM produtos GROUP BY categoria.`,
    `3 colunas e 3 linhas (uma por categoria): o nome da categoria, o estoque total e o preço médio dela.`],
  'sql-1-27': [
    `HAVING quer dizer "tendo". Ele é um WHERE para montinhos: o WHERE escolhe as linhas ANTES de montar os grupos, e o HAVING escolhe os grupos DEPOIS que as contas já foram feitas.`,
    `Serve para filtrar pelo resultado de uma conta: "só as categorias com mais de 500 em estoque", "só os clientes com mais de 3 pedidos".`,
    `Escreva o HAVING depois do GROUP BY, repetindo a conta: HAVING SUM(estoque) > 500. Fica assim: SELECT categoria, SUM(estoque) FROM produtos GROUP BY categoria HAVING SUM(estoque) > 500.`,
    `Só a categoria que passou no teste, com o estoque total dela: 1 linha (Papelaria, 2400).`],
  'sql-1-28': [
    `O SQL também faz contas: + (mais), - (menos), * (vezes) e / (dividido). Você pode multiplicar duas colunas e dar um apelido ao resultado com AS.`,
    `Serve para criar uma informação nova a partir das que já existem, sem mexer na tabela: quanto dinheiro está parado no estoque, o preço com desconto, o total da compra.`,
    `Escreva a conta e o apelido: preco * estoque AS valor_estoque. No ORDER BY dá para usar o apelido. Fica assim: SELECT nome, preco * estoque AS valor_estoque FROM produtos ORDER BY valor_estoque DESC.`,
    `2 colunas (nome e valor_estoque) e 10 linhas, do maior valor para o menor (o Notebook, com 42000, aparece primeiro).`],
  'sql-1-29': [
    `NULL quer dizer "vazio": ninguém preencheu aquele campo. Não é zero e não é um texto em branco, é a falta de informação, como uma linha da ficha que ficou sem resposta.`,
    `Serve para achar o que está faltando: funcionários sem salário anotado, clientes sem telefone.`,
    `Cuidado: não escreva = NULL, porque não funciona! Use IS NULL para "está vazio" ou IS NOT NULL para "está preenchido". Fica assim: SELECT nome FROM funcionarios WHERE salario IS NULL. Repare que agora a tabela é outra: funcionarios.`,
    `O nome de quem está sem salário: 1 linha (Camila).`],
  'sql-1-30': [
    `Funções prontas mexem no valor antes de mostrar: ROUND arredonda o número, UPPER deixa o texto em LETRAS MAIÚSCULAS e LENGTH conta quantas letras ele tem.`,
    `Serve para mostrar os dados bonitinhos: uma média com só 2 casas depois da vírgula, nomes todos no mesmo formato.`,
    `Envolva a coluna (ou outra função) com a função: ROUND(AVG(preco), 2). O número depois da vírgula é quantas casas você quer. Fica assim: SELECT ROUND(AVG(preco), 2) AS media FROM produtos WHERE categoria = 'Móveis'.`,
    `1 linha e 1 coluna chamada media: 676.67 (o preço médio dos móveis, arredondado).`]
};
