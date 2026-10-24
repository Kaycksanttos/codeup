// SQL — NÍVEL INTERMEDIÁRIO: as 4 explicações de cada lição, escritas como se a pessoa tivesse 10 anos e estivesse vendo isso pela primeira vez.
//   [ O que é ,  Para que serve ,  Como você vai usar aqui ,  O que vai aparecer na tela ]
module.exports = {
  'sql-2-01': [
    `JOIN quer dizer "juntar". Ele cola duas tabelas lado a lado usando uma coluna que aparece nas duas, como ligar dois pedaços de um quebra-cabeça. O ON diz qual coluna de uma combina com qual coluna da outra.`,
    `Os dados ficam guardados em listas separadas. A lista de vendas só anota o número do produto (tipo "produto 3"); para saber o NOME, é preciso juntar com a lista de produtos.`,
    `Escreva FROM vendas JOIN produtos ON produtos.id = vendas.produto_id, que quer dizer "junte onde o id do produto é igual ao produto_id da venda". No SELECT, escreva tabela.coluna para dizer de qual lista vem cada informação: SELECT produtos.nome, vendas.qtd.`,
    `2 colunas (nome do produto e qtd) e 14 linhas, uma para cada venda, agora com o nome em vez do número.`],
  'sql-2-02': [
    `Apelido de tabela é um nome curtinho que você dá para uma tabela só dentro da consulta, como chamar o "Guilherme" de "Gui". Aqui, p é o apelido de produtos e v é o apelido de vendas.`,
    `Serve para escrever menos e deixar a consulta mais fácil de ler, principalmente quando tem várias tabelas.`,
    `Escreva o apelido logo depois do nome da tabela: FROM vendas v JOIN produtos p. Daí em diante, use p.nome e v.qtd. Fica assim: SELECT p.nome, v.qtd, v.data FROM vendas v JOIN produtos p ON p.id = v.produto_id.`,
    `3 colunas (nome, qtd e data) e 14 linhas: o mesmo resultado do JOIN, só que com a consulta mais curta.`],
  'sql-2-03': [
    `Depois do JOIN, o WHERE funciona do mesmo jeito de sempre, como uma peneira. E ele pode peneirar usando colunas de qualquer uma das tabelas juntadas.`,
    `Serve para recortar só a parte que você quer do resultado juntado: só as vendas de uma categoria, de um dia, de um cliente.`,
    `O WHERE vem depois do JOIN: ... JOIN produtos p ON p.id = v.produto_id WHERE p.categoria = 'Eletrônicos'. A categoria mora na tabela produtos, por isso usamos p.categoria.`,
    `2 colunas (nome e qtd) e 8 linhas: só as vendas de produtos Eletrônicos.`],
  'sql-2-04': [
    `Depois de juntar as tabelas, o ORDER BY pode arrumar a fila usando uma coluna de qualquer tabela.`,
    `Serve para fazer relatórios em ordem, como do dia mais novo ao mais antigo, mesmo quando as informações vêm de listas diferentes.`,
    `Escreva o ORDER BY no final, com o apelido da tabela: ORDER BY v.data DESC. O DESC faz a data mais recente aparecer primeiro.`,
    `3 colunas (data, nome e qtd) e 14 linhas, da venda mais nova (2026-10-06) para a mais antiga.`],
  'sql-2-05': [
    `JOIN com GROUP BY: primeiro as tabelas são coladas, depois as linhas são separadas em montinhos (um por produto) e cada montinho é somado.`,
    `Serve para fazer relatórios com nomes de verdade: quanto cada produto vendeu, em vez de "o produto 3 vendeu tanto".`,
    `Faça o JOIN, agrupe pela coluna do nome e use a conta de somar: SELECT p.nome, SUM(v.qtd) FROM vendas v JOIN produtos p ON p.id = v.produto_id GROUP BY p.nome.`,
    `2 colunas (nome e a soma de qtd) e 9 linhas, uma para cada produto que foi vendido.`],
  'sql-2-06': [
    `Receita é o dinheiro que entrou: preço vezes quantidade vendida. Dá para fazer essa multiplicação dentro do SUM, linha por linha, e depois somar tudo.`,
    `Serve para saber quanto dinheiro cada produto realmente trouxe, e não só quantas unidades saíram. Um produto pode vender pouco e mesmo assim render muito se for caro.`,
    `Escreva SUM(p.preco * v.qtd) AS receita, agrupe por p.nome e ordene pelo apelido: ORDER BY receita DESC.`,
    `2 colunas (nome e receita) e 9 linhas, da maior receita (Notebook, 10500) para a menor.`],
  'sql-2-07': [
    `LEFT JOIN quer dizer "junte, mas não esqueça ninguém da esquerda". Ele mantém TODAS as linhas da primeira tabela, mesmo as que não têm par na segunda. Onde não há par, o campo fica NULL (vazio).`,
    `Serve para não perder itens só porque eles não têm relação: um produto que nunca foi vendido continua aparecendo na lista.`,
    `Escreva FROM produtos p LEFT JOIN vendas v ON v.produto_id = p.id. A tabela que você quer manter inteira fica antes do LEFT JOIN.`,
    `2 colunas (nome e qtd) e 15 linhas: as 14 vendas e mais 1 produto sem venda (a Estante, com a qtd vazia).`],
  'sql-2-08': [
    `Depois de um LEFT JOIN, quem não tem par fica com campo vazio. Se você peneirar com WHERE ... IS NULL, sobram só os que não têm par.`,
    `Serve para descobrir o que está faltando: produtos que nunca venderam, clientes que nunca compraram.`,
    `Faça o LEFT JOIN e acrescente WHERE v.id IS NULL, usando uma coluna da tabela da direita (a de vendas). Se ela está vazia, é porque nunca teve venda.`,
    `1 linha com o nome do produto que nunca foi vendido: Estante.`],
  'sql-2-09': [
    `É o mesmo JOIN de antes, só que agora em outro banco de dados: o de uma empresa, com a lista de funcionários e a lista de departamentos.`,
    `Serve para você ver que a técnica funciona em qualquer assunto: basta descobrir qual coluna liga as duas tabelas (aqui, depto_id e id).`,
    `Escreva FROM funcionarios f JOIN departamentos d ON d.id = f.depto_id. Como as duas tabelas têm uma coluna nome, dê um apelido para a do departamento: d.nome AS departamento.`,
    `2 colunas (nome e departamento) e 12 linhas, uma para cada funcionário.`],
  'sql-2-10': [
    `JOIN junto com GROUP BY e AVG: um resumo por departamento, com a média dos salários de cada um. O AVG ignora os salários vazios (NULL).`,
    `Serve para comparar grupos, como descobrir qual departamento paga mais em média.`,
    `Junte as tabelas, agrupe por d.nome, calcule AVG(f.salario) AS media e ordene com ORDER BY media DESC.`,
    `2 colunas (nome e media) e 4 linhas, da maior média (TI, com 8675) para a menor.`],
  'sql-2-11': [
    `O HAVING continua sendo o "WHERE dos montinhos": ele escolhe os grupos depois de as contas estarem feitas, mesmo quando houve um JOIN antes.`,
    `Serve para ficar só com os grupos que importam: departamentos grandes, clientes com muitos pedidos.`,
    `Escreva o HAVING depois do GROUP BY, repetindo a conta: HAVING COUNT(*) >= 3. O apelido total pode ser usado no SELECT: COUNT(*) AS total.`,
    `2 colunas (nome e total) e 2 linhas: TI (4 pessoas) e Vendas (4 pessoas).`],
  'sql-2-12': [
    `Um banco novo, com uma lista de clientes e uma lista de pedidos. Aqui você junta tudo o que aprendeu: JOIN, filtro, soma e ordem.`,
    `Serve para descobrir quanto cada cliente realmente pagou, ignorando os pedidos cancelados ou ainda pendentes.`,
    `Junte clientes c com pedidos p, filtre WHERE p.status = 'pago', agrupe com GROUP BY c.nome, some com SUM(p.valor) AS total e ordene com ORDER BY total DESC.`,
    `2 colunas (nome e total) e 5 linhas, da cliente que mais pagou (Carla Dias, 1260) para a que menos pagou.`],
  'sql-2-13': [
    `Juntar LEFT JOIN com IS NULL mostra quem nunca aparece na outra lista, como descobrir quem foi convidado e nunca apareceu na festa.`,
    `Serve para achar clientes que ainda não compraram nada. Essas pessoas são uma boa oportunidade para uma promoção.`,
    `Comece pela tabela de clientes, faça LEFT JOIN pedidos p ON p.cliente_id = c.id e peneire com WHERE p.id IS NULL.`,
    `Os nomes dos clientes sem nenhum pedido: 2 linhas (Gabi Torres e Hugo Alves).`],
  'sql-2-14': [
    `Subconsulta é um SELECT dentro de outro SELECT, escrito entre parênteses. É como fazer uma perguntinha para responder uma pergunta maior.`,
    `Serve para comparar cada linha com um valor que precisa ser calculado antes: produtos mais caros que a média, notas acima da média da turma.`,
    `Escreva a subconsulta no lugar do valor: WHERE preco > (SELECT AVG(preco) FROM produtos). O computador resolve primeiro o que está entre parênteses e depois usa a resposta.`,
    `2 colunas (nome e preco) e 3 linhas: os produtos acima do preço médio (Notebook, Cadeira e Monitor).`],
  'sql-2-15': [
    `O IN também aceita uma subconsulta: em vez de uma lista que você escreve à mão, a lista é montada por outro SELECT.`,
    `Serve para filtrar usando uma lista que vem de outra tabela, como "produtos que aparecem na lista de vendas".`,
    `Escreva WHERE id IN (SELECT produto_id FROM vendas). A subconsulta precisa devolver uma coluna só.`,
    `Os nomes dos produtos que já foram vendidos pelo menos uma vez: 9 linhas (todos, menos a Estante).`],
  'sql-2-16': [
    `Uma subconsulta no FROM vira uma "tabela de rascunho": primeiro ela é montada, e a consulta de fora usa o resultado dela como se fosse uma tabela de verdade.`,
    `Serve para usar o resultado de um resumo em outra conta: primeiro calcula o total de cada produto, depois escolhe só os totais grandes.`,
    `Coloque o SELECT com GROUP BY entre parênteses, dê um apelido (AS t) e filtre do lado de fora: SELECT produto_id, total FROM (...) AS t WHERE total > 10.`,
    `2 colunas (produto_id e total) e 4 linhas: os produtos que venderam mais de 10 unidades.`],
  'sql-2-17': [
    `UNION quer dizer "união": junta o resultado de dois SELECT, um embaixo do outro, e tira as linhas repetidas. Os dois SELECT precisam ter o mesmo número de colunas. (UNION ALL deixa as repetidas.)`,
    `Serve para juntar numa lista só coisas que vêm de filtros ou de lugares diferentes, como a lista de amigos da escola e a lista de amigos do prédio.`,
    `Escreva um SELECT completo, depois a palavra UNION e outro SELECT completo, cada um com o seu WHERE.`,
    `1 coluna com os nomes das duas categorias juntas: 6 linhas (3 de Móveis e 3 de Papelaria).`],
  'sql-2-18': [
    `EXCEPT quer dizer "exceto": devolve o que está no primeiro SELECT, mas NÃO aparece no segundo. É como tirar de uma lista tudo o que também está na outra.`,
    `Serve para achar diferenças entre duas listas, como os produtos cadastrados que nunca foram vendidos.`,
    `Escreva SELECT id FROM produtos EXCEPT SELECT produto_id FROM vendas. Os dois SELECT precisam ter o mesmo número de colunas.`,
    `1 linha com o id do produto que não tem nenhuma venda: 9.`],
  'sql-2-19': [
    `CASE WHEN é o "se... então... senão..." do SQL. Ele cria uma coluna nova escolhendo um valor de acordo com regras que você escreve.`,
    `Serve para colocar as coisas em grupos: caro, médio e barato; aprovado e reprovado; criança, adulto e idoso.`,
    `Escreva CASE WHEN regra THEN valor WHEN outra regra THEN valor ELSE valor END AS faixa. As regras são testadas na ordem, e a primeira que for verdadeira ganha. Aqui: preço de 1000 ou mais é 'caro', de 100 ou mais é 'medio' e o resto é 'barato'.`,
    `2 colunas (nome e faixa) e 10 linhas, cada produto com a sua etiqueta: caro, medio ou barato.`],
  'sql-2-20': [
    `Dá para agrupar por uma coluna que foi criada com CASE, e assim contar quantos itens existem em cada grupo.`,
    `Serve para relatórios por faixa: quantos produtos caros, médios e baratos a loja tem.`,
    `Crie a faixa com CASE ... END AS faixa, conte com COUNT(*) AS total e escreva GROUP BY faixa.`,
    `2 colunas (faixa e total) e 3 linhas: barato (4), caro (2) e medio (4).`],
  'sql-2-21': [
    `COALESCE(a, b) olha os valores na ordem e devolve o primeiro que NÃO está vazio. Se a estiver vazio (NULL), ele usa o b.`,
    `Serve para trocar vazios por um valor padrão, como 0 ou "sem informação", antes de somar ou mostrar.`,
    `Escreva COALESCE(salario, 0) AS salario_ok: se o salário estiver vazio, aparece 0 no lugar. Fica assim: SELECT nome, COALESCE(salario, 0) AS salario_ok FROM funcionarios.`,
    `2 colunas (nome e salario_ok) e 12 linhas. Quem estava sem salário (a Camila) agora aparece com 0.`],
  'sql-2-22': [
    `Dá para montar textos: o sinal || cola um texto no outro, como grudar duas peças de Lego. SUBSTR pega um pedaço do texto, e UPPER e LOWER mudam as letras para maiúsculas ou minúsculas.`,
    `Serve para criar textos prontos para mostrar: etiquetas, nomes completos, códigos.`,
    `Ligue as partes com || e ponha o texto fixo entre aspas simples: nome || ' (' || cargo || ')'. Repare que os espaços e os parênteses também são texto.`,
    `1 coluna (etiqueta) e 12 linhas, no formato Nome (Cargo), por exemplo: Carlos (Diretor de TI).`],
  'sql-2-23': [
    `strftime é uma função que recorta pedaços de uma data. Com '%Y-%m' ela devolve só o ano e o mês (como 2026-10); '%m' dá só o mês e '%Y' só o ano.`,
    `Serve para agrupar por período: vendas por mês, cadastros por ano.`,
    `Escreva strftime('%Y-%m', data) AS mes, some a quantidade com SUM(qtd) e agrupe com GROUP BY mes.`,
    `2 colunas (mes e total) e 2 linhas: 2026-09 (70) e 2026-10 (137).`],
  'sql-2-24': [
    `Aqui você junta tudo: datas, JOIN, conta de receita e GROUP BY, para acompanhar quanto dinheiro entrou em cada mês.`,
    `Serve para ver se a loja está crescendo ou caindo ao longo do tempo.`,
    `Junte vendas e produtos, calcule SUM(p.preco * v.qtd) AS receita, agrupe pelo mês com strftime('%Y-%m', v.data) e ordene com ORDER BY mes.`,
    `2 colunas (mes e receita) e 2 linhas, em ordem de mês: 2026-09 (11120) e 2026-10 (11190).`],
  'sql-2-25': [
    `julianday transforma uma data em um número (os dias contados desde uma data muito antiga). Se você subtrai dois desses números, descobre quantos dias existem entre as duas datas. Aqui usamos uma data fixa para o resultado nunca mudar.`,
    `Serve para medir tempo: há quantos dias o cliente se cadastrou, quantos dias faltam para um prazo.`,
    `Escreva CAST(julianday('2026-10-18') - julianday(cadastro) AS INTEGER) AS dias. O CAST joga fora a parte quebrada (depois da vírgula) e deixa só dias inteiros.`,
    `2 colunas (nome e dias) e 8 linhas, do cliente mais antigo (Ana Souza, 349 dias) ao mais novo.`],
  'sql-2-26': [
    `INSERT INTO quer dizer "insira em". Ele coloca uma linha nova dentro de uma tabela, como escrever mais um nome no fim de uma lista. Depois, um SELECT mostra como a lista ficou.`,
    `Serve para cadastrar coisas novas: um produto novo, um cliente novo, um pedido novo.`,
    `Escreva INSERT INTO produtos VALUES (11, 'Fone', 120, 'Eletrônicos', 40); com os valores na mesma ordem das colunas. Termine o comando com ponto e vírgula e escreva o SELECT logo depois.`,
    `A lista dos produtos Eletrônicos agora com o novo: 5 linhas em ordem alfabética (Fone, Monitor, Mouse, Notebook e Teclado).`],
  'sql-2-27': [
    `UPDATE quer dizer "atualize". Ele muda linhas que já existem, como apagar um preço na etiqueta e escrever outro. Sempre use WHERE, senão ele muda a tabela INTEIRA!`,
    `Serve para corrigir ou atualizar dados: aumentar preços, mudar o status de um pedido.`,
    `Escreva UPDATE produtos SET preco = preco * 1.1 WHERE categoria = 'Papelaria'; (multiplicar por 1.1 aumenta 10%). Depois, escreva um SELECT para conferir.`,
    `3 linhas (nome e preco) dos produtos de Papelaria, cada um com o preço 10% maior que antes.`],
  'sql-2-28': [
    `DELETE quer dizer "apague". Ele remove linhas de uma tabela, como riscar itens de uma lista. Também precisa do WHERE: sem ele, apaga tudo!`,
    `Serve para fazer limpeza: apagar registros antigos, repetidos ou errados.`,
    `Escreva DELETE FROM produtos WHERE estoque = 0; e depois SELECT COUNT(*) FROM produtos para conferir quantos sobraram.`,
    `1 linha e 1 coluna: 9 (sobraram 9 produtos, porque o que estava com estoque zero foi apagado).`],
  'sql-2-29': [
    `CREATE TABLE quer dizer "crie uma tabela". Você dá um nome a uma lista nova e diz o tipo de cada coluna: TEXT para texto e REAL para números com vírgula.`,
    `Serve para guardar um conjunto novo de dados: metas, cadastros, qualquer lista só sua.`,
    `Escreva CREATE TABLE metas(categoria TEXT, valor REAL); depois INSERT INTO metas VALUES ('Móveis', 2000), ('Papelaria', 300); e termine com um SELECT * FROM metas ORDER BY categoria.`,
    `A tabela nova, em ordem de categoria: 2 linhas (Móveis, 2000 e Papelaria, 300).`],
  'sql-2-30': [
    `É o projeto do nível: um relatório de verdade, que junta JOIN, GROUP BY, HAVING e ORDER BY numa consulta só.`,
    `Serve para treinar o que uma pessoa analista entrega ao chefe: uma análise pronta de quanto cada categoria rendeu.`,
    `Junte vendas e produtos, agrupe por p.categoria, calcule as duas somas (unidades e receita), escolha os grupos com HAVING e ordene pela receita do maior para o menor.`,
    `3 colunas (categoria, unidades e receita) e 2 linhas: Eletrônicos (31 unidades, 16950) e Móveis (6 unidades, 4650).`]
};
