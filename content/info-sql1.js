// SQL — NÍVEL BÁSICO: as 4 explicações de cada lição, na ordem:
//   [ O que é ,  Para que serve ,  Como se faz ,  Qual o retorno esperado ]
module.exports = {
  'sql-1-01': [
    `SELECT é o comando que pede dados ao banco. FROM diz de qual tabela eles vêm. O asterisco (*) significa "todas as colunas".`,
    `Para ver o que existe dentro de uma tabela. É o primeiro passo para conhecer qualquer banco de dados.`,
    `Escreva SELECT * FROM produtos: SELECT (o que mostrar), * (todas as colunas) e FROM (a tabela).`,
    `A tabela produtos inteira: 5 colunas (id, nome, preco, categoria e estoque) e 10 linhas.`],
  'sql-1-02': [
    `Em vez do *, você lista só as colunas que quer, separadas por vírgula.`,
    `Para trazer apenas o que interessa, deixando o resultado mais limpo e mais rápido.`,
    `Escreva os nomes das colunas depois do SELECT, com vírgula entre eles e sem vírgula no último: SELECT nome, preco FROM produtos.`,
    `Uma tabela com só 2 colunas (nome e preco) e as mesmas 10 linhas.`],
  'sql-1-03': [
    `AS dá um novo nome (apelido) para a coluna no resultado.`,
    `Para deixar o resultado mais claro ou com o nome que o relatório pede, sem mudar a tabela original.`,
    `Escreva a coluna, depois AS e o apelido: preco AS valor. A coluna só muda de nome no resultado.`,
    `2 colunas: nome e valor (era preco), com as 10 linhas.`],
  'sql-1-04': [
    `WHERE filtra as linhas por uma condição. Com números, use >, <, >=, <= ou =.`,
    `Para trazer só o que interessa: produtos caros, vendas grandes, estoque baixo.`,
    `O WHERE vem depois do FROM: SELECT nome FROM produtos WHERE preco > 500.`,
    `Só os nomes dos produtos com preço acima de 500: 4 linhas (Notebook, Cadeira, Mesa e Monitor).`],
  'sql-1-05': [
    `Para filtrar por texto, a comparação usa aspas simples em volta do valor.`,
    `Para trazer itens de uma categoria, uma cidade, um status.`,
    `Escreva WHERE categoria = 'Papelaria' com aspas simples (não use aspas duplas). A grafia precisa ser igual à do banco.`,
    `Os nomes dos produtos da categoria Papelaria: 3 linhas (Caneta, Caderno e Lápis).`],
  'sql-1-06': [
    `<> (ou !=) significa "diferente de". Traz as linhas que NÃO são iguais ao valor.`,
    `Para excluir um grupo: tudo que não é de uma categoria, todos os pedidos que não foram cancelados.`,
    `Escreva WHERE categoria <> 'Eletrônicos': a coluna, o sinal <> e o valor entre aspas.`,
    `2 colunas (nome e categoria) e 6 linhas: todos os produtos, menos os Eletrônicos.`],
  'sql-1-07': [
    `AND liga duas condições e exige que as DUAS sejam verdadeiras ao mesmo tempo.`,
    `Para filtros mais específicos: eletrônicos E baratos, pedidos pagos E do mês atual.`,
    `Escreva as duas condições no WHERE com AND no meio: categoria = 'Eletrônicos' AND preco < 300.`,
    `Só os nomes que cumprem as duas regras: 2 linhas (Mouse e Teclado).`],
  'sql-1-08': [
    `OR liga duas condições e basta que UMA delas seja verdadeira.`,
    `Para aceitar mais de uma possibilidade: móveis ou itens baratos, clientes de SP ou RJ.`,
    `Escreva as duas condições no WHERE com OR no meio: categoria = 'Móveis' OR preco < 10.`,
    `Os nomes que cumprem pelo menos uma das regras: 5 linhas (Cadeira, Mesa, Caneta, Estante e Lápis).`],
  'sql-1-09': [
    `Quando AND e OR aparecem juntos, os parênteses deixam claro quais condições são avaliadas primeiro.`,
    `Para evitar resultados errados: AND "gruda" mais forte que OR, então sem parênteses a regra pode ser lida de outro jeito.`,
    `Coloque entre parênteses a parte do OR e depois ligue o resto com AND: WHERE (categoria = 'Móveis' OR categoria = 'Papelaria') AND preco < 100.`,
    `Os nomes dos itens baratos dessas duas categorias: 3 linhas (Caneta, Caderno e Lápis).`],
  'sql-1-10': [
    `IN testa se o valor está dentro de uma lista de opções.`,
    `Para filtrar por vários valores sem escrever vários OR: ids 1, 3 e 5, estados SP, RJ e MG.`,
    `Escreva a coluna, IN e a lista entre parênteses separada por vírgula: WHERE id IN (1, 3, 5).`,
    `Os nomes dos produtos de id 1, 3 e 5: 3 linhas (Notebook, Cadeira e Caneta).`],
  'sql-1-11': [
    `BETWEEN a AND b pega os valores de a até b, incluindo as duas pontas.`,
    `Para filtrar faixas: preços entre dois valores, datas dentro de um período.`,
    `Escreva WHERE preco BETWEEN 80 AND 700: o menor valor primeiro e o maior depois do AND.`,
    `2 colunas (nome e preco) e 4 linhas: Mouse (80), Mesa (650), Teclado (250) e Estante (480).`],
  'sql-1-12': [
    `LIKE busca padrões em textos. O símbolo % significa "qualquer coisa": 'C%' é tudo que começa com C.`,
    `Para buscar por começo de nome, como em uma busca de contatos ou produtos.`,
    `Escreva WHERE nome LIKE 'C%': a letra entre aspas e o % depois dela, para aceitar o resto do texto.`,
    `Os nomes que começam com C: 3 linhas (Cadeira, Caneta e Caderno).`],
  'sql-1-13': [
    `Com %texto% o LIKE encontra o texto em qualquer posição do valor: no começo, no meio ou no fim.`,
    `Para buscas do tipo "contém": produtos com certa palavra, e-mails de um domínio.`,
    `Coloque o % dos dois lados do pedaço procurado: WHERE nome LIKE '%ado%'.`,
    `O nome que contém "ado": 1 linha (Teclado).`],
  'sql-1-14': [
    `ORDER BY ordena o resultado. Sem mais nada, o padrão é crescente (ASC): do menor para o maior.`,
    `Para organizar relatórios: do mais barato para o mais caro, em ordem alfabética, da data mais antiga.`,
    `O ORDER BY fica no final da consulta, com a coluna de referência: ORDER BY preco.`,
    `Os mesmos 10 produtos, do mais barato para o mais caro (Lápis primeiro, Notebook por último).`],
  'sql-1-15': [
    `DESC ordena do maior para o menor (decrescente).`,
    `Para rankings: o maior estoque, a maior venda, o mais recente.`,
    `Acrescente DESC depois da coluna: ORDER BY estoque DESC.`,
    `Os 10 produtos com o maior estoque no topo (Lápis, com 1200, vem primeiro).`],
  'sql-1-16': [
    `Dá para ordenar por mais de uma coluna: o segundo critério desempata o primeiro.`,
    `Para relatórios agrupados: primeiro por categoria e, dentro de cada uma, do mais caro para o mais barato.`,
    `Separe os critérios por vírgula, cada um com seu sentido: ORDER BY categoria, preco DESC.`,
    `3 colunas e 10 linhas, em blocos por categoria (A a Z), com o preço decrescente dentro de cada bloco.`],
  'sql-1-17': [
    `LIMIT n devolve só as n primeiras linhas do resultado.`,
    `Para espiar uma tabela grande ou limitar uma lista (os 10 primeiros, os 5 últimos).`,
    `Escreva LIMIT e o número no final da consulta: SELECT * FROM produtos LIMIT 4.`,
    `Todas as colunas, mas só 4 linhas.`],
  'sql-1-18': [
    `ORDER BY junto com LIMIT forma o ranking "Top N": primeiro ordena, depois corta.`,
    `Para responder "quais são os 3 mais caros?", "quem mais vendeu?".`,
    `Ordene do maior para o menor (DESC) e limite: ORDER BY preco DESC LIMIT 3. A ordem das palavras importa.`,
    `2 colunas (nome e preco) e 3 linhas: Notebook, Monitor e Cadeira.`],
  'sql-1-19': [
    `DISTINCT remove as linhas repetidas do resultado.`,
    `Para listar os valores diferentes que existem: categorias, cidades, status.`,
    `Escreva DISTINCT logo depois do SELECT: SELECT DISTINCT categoria FROM produtos.`,
    `Cada categoria aparece uma única vez: 3 linhas (Eletrônicos, Móveis e Papelaria).`],
  'sql-1-20': [
    `As funções de agregação resumem várias linhas em uma só. COUNT(*) conta quantas linhas existem.`,
    `Para responder "quantos?": quantos clientes, quantos pedidos, quantos produtos de uma categoria.`,
    `Escreva SELECT COUNT(*) FROM produtos e acrescente um WHERE para contar só parte das linhas.`,
    `Uma tabela de 1 linha e 1 coluna com o número: 3 (produtos de Móveis).`],
  'sql-1-21': [
    `SUM soma os valores de uma coluna numérica.`,
    `Para responder "quanto no total?": total vendido, estoque somado, valor arrecadado.`,
    `Escreva o nome da coluna entre os parênteses: SELECT SUM(qtd) FROM vendas.`,
    `1 linha e 1 coluna com a soma: 207 unidades.`],
  'sql-1-22': [
    `AVG calcula a média dos valores de uma coluna.`,
    `Para saber o valor típico: preço médio, nota média, ticket médio.`,
    `Escreva AVG(preco) e, se quiser só um grupo, acrescente WHERE: ... WHERE categoria = 'Eletrônicos'.`,
    `1 linha e 1 coluna com a média dos preços dos eletrônicos: 1257.5.`],
  'sql-1-23': [
    `MIN pega o menor valor e MAX o maior. Dá para usar várias funções no mesmo SELECT.`,
    `Para achar os extremos: o menor e o maior preço, a primeira e a última data.`,
    `Separe as funções por vírgula: SELECT MIN(estoque), MAX(estoque) FROM produtos.`,
    `1 linha com 2 colunas, nessa ordem: 0 (menor estoque) e 1200 (maior estoque).`],
  'sql-1-24': [
    `COUNT(DISTINCT coluna) conta quantos valores diferentes existem, ignorando as repetições.`,
    `Para contar itens únicos: quantos clientes diferentes compraram, quantos produtos já foram vendidos.`,
    `Coloque DISTINCT dentro do COUNT, antes do nome da coluna: COUNT(DISTINCT produto_id).`,
    `1 linha e 1 coluna: 9 produtos diferentes já foram vendidos (mesmo com 14 vendas).`],
  'sql-1-25': [
    `GROUP BY separa as linhas em grupos, e a função de agregação roda dentro de cada grupo.`,
    `Para resumos por categoria: quantos produtos por categoria, vendas por mês, gasto por cliente.`,
    `Coloque a coluna do grupo no SELECT e no GROUP BY: SELECT categoria, COUNT(*) FROM produtos GROUP BY categoria.`,
    `Uma linha por categoria, com o total: Eletrônicos (4), Móveis (3) e Papelaria (3).`],
  'sql-1-26': [
    `No mesmo GROUP BY dá para calcular várias métricas por grupo, como soma e média.`,
    `Para montar um resumo completo de cada grupo em uma única consulta.`,
    `Liste as funções no SELECT, separadas por vírgula, depois da coluna do grupo: SELECT categoria, SUM(estoque), AVG(preco) ... GROUP BY categoria.`,
    `3 colunas e 3 linhas (uma por categoria): a categoria, o estoque total e o preço médio dela.`],
  'sql-1-27': [
    `WHERE filtra as linhas ANTES de agrupar; HAVING filtra os grupos DEPOIS de calculados.`,
    `Para filtrar pelo resultado de uma função de agregação: categorias com estoque acima de 500, clientes com mais de 3 pedidos.`,
    `Escreva o HAVING depois do GROUP BY, com a função: HAVING SUM(estoque) > 500.`,
    `Só as categorias que passaram no teste, com o estoque total: 1 linha (Papelaria, 2400).`],
  'sql-1-28': [
    `Dá para fazer contas direto no SELECT, entre colunas, e dar um apelido ao resultado.`,
    `Para criar valores calculados sem alterar a tabela: valor em estoque, preço com desconto, total da compra.`,
    `Escreva a conta com o apelido: preco * estoque AS valor_estoque. No ORDER BY dá para usar o apelido.`,
    `2 colunas (nome e valor_estoque) e 10 linhas, do maior valor para o menor (Notebook, com 42000, vem primeiro).`],
  'sql-1-29': [
    `NULL significa "sem valor". Não é zero nem texto vazio: é a ausência de dado.`,
    `Para encontrar dados que faltam: funcionários sem salário cadastrado, clientes sem telefone.`,
    `Não use = NULL (não funciona). Escreva IS NULL para "está vazio" ou IS NOT NULL para "está preenchido".`,
    `O nome de quem está sem salário: 1 linha (Camila).`],
  'sql-1-30': [
    `Funções prontas tratam os valores: ROUND(x, n) arredonda, UPPER() deixa em maiúsculas e LENGTH() conta caracteres.`,
    `Para apresentar os dados no formato certo: média com 2 casas, nomes padronizados.`,
    `Coloque a função em volta da coluna ou da outra função: ROUND(AVG(preco), 2) AS media. O número depois da vírgula é a quantidade de casas.`,
    `1 linha e 1 coluna (media) com o preço médio dos móveis arredondado: 676.67.`]
};
