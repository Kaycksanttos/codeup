// SQL — NÍVEL INTERMEDIÁRIO: as 4 explicações de cada lição, na ordem:
//   [ O que é ,  Para que serve ,  Como se faz ,  Qual o retorno esperado ]
module.exports = {
  'sql-2-01': [
    `JOIN junta duas tabelas usando uma coluna que as liga. O ON diz qual coluna de uma combina com qual coluna da outra.`,
    `Os dados ficam divididos em tabelas. Para ver o nome do produto em cada venda, é preciso juntar vendas e produtos.`,
    `Escreva FROM vendas JOIN produtos ON produtos.id = vendas.produto_id. Depois, no SELECT, use tabela.coluna para cada campo.`,
    `2 colunas (nome do produto e qtd) e 14 linhas, uma para cada venda.`],
  'sql-2-02': [
    `Apelidos de tabela são nomes curtos que você dá às tabelas na consulta (p para produtos, v para vendas).`,
    `Para escrever menos e deixar a consulta mais legível, principalmente com várias tabelas.`,
    `Escreva o apelido logo depois do nome da tabela: FROM vendas v JOIN produtos p. Daí em diante use p.nome e v.qtd.`,
    `3 colunas (nome, qtd e data) e 14 linhas: o mesmo resultado do JOIN, com a consulta mais curta.`],
  'sql-2-03': [
    `Depois do JOIN, o WHERE funciona normalmente e pode filtrar colunas de qualquer uma das tabelas.`,
    `Para recortar o resultado juntado: só as vendas de uma categoria, de um período, de um cliente.`,
    `O WHERE vem depois do JOIN: ... JOIN produtos p ON p.id = v.produto_id WHERE p.categoria = 'Eletrônicos'.`,
    `2 colunas (nome e qtd) e 8 linhas: só as vendas de produtos Eletrônicos.`],
  'sql-2-04': [
    `Com JOIN dá para ordenar por colunas de qualquer tabela envolvida.`,
    `Para relatórios em ordem cronológica ou alfabética, mesmo com dados vindos de várias tabelas.`,
    `Escreva o ORDER BY no final, com o apelido da tabela: ORDER BY v.data DESC (DESC coloca a mais recente primeiro).`,
    `3 colunas (data, nome e qtd) e 14 linhas, da venda mais recente (2026-10-06) para a mais antiga.`],
  'sql-2-05': [
    `JOIN seguido de GROUP BY: primeiro as tabelas são juntadas e depois as linhas são agrupadas e resumidas.`,
    `Para relatórios com nomes legíveis: vendas por nome do produto em vez de por número de id.`,
    `Faça o JOIN, agrupe pela coluna de nome e use a função de agregação: SELECT p.nome, SUM(v.qtd) ... GROUP BY p.nome.`,
    `2 colunas (nome e a soma de qtd) e 9 linhas, uma por produto vendido.`],
  'sql-2-06': [
    `Receita é preço vezes quantidade. Dá para fazer essa conta dentro do SUM, linha a linha, e somar tudo.`,
    `Para saber quanto cada produto realmente faturou, e não só quantas unidades vendeu.`,
    `Escreva SUM(p.preco * v.qtd) AS receita, agrupe por p.nome e ordene pelo apelido: ORDER BY receita DESC.`,
    `2 colunas (nome e receita) e 9 linhas, da maior receita (Notebook, 10500) para a menor.`],
  'sql-2-07': [
    `LEFT JOIN mantém todas as linhas da tabela da esquerda, mesmo as que não têm par na direita (a coluna da direita fica NULL).`,
    `Para não perder itens sem relação: produtos que nunca foram vendidos continuam na lista.`,
    `Escreva FROM produtos p LEFT JOIN vendas v ON v.produto_id = p.id. A tabela que você quer manter inteira fica antes do LEFT JOIN.`,
    `2 colunas (nome e qtd) e 15 linhas: as 14 vendas e mais 1 produto sem venda (Estante, com qtd vazia).`],
  'sql-2-08': [
    `Depois de um LEFT JOIN, filtrar com WHERE coluna IS NULL mostra as linhas que não tiveram correspondência.`,
    `Para achar o que "falta": produtos que nunca venderam, clientes que nunca compraram.`,
    `Faça o LEFT JOIN e acrescente WHERE v.id IS NULL, usando uma coluna da tabela da direita.`,
    `1 linha com o nome do produto sem nenhuma venda: Estante.`],
  'sql-2-09': [
    `Os mesmos conceitos de JOIN, agora em outro banco de dados: o de RH, com funcionarios e departamentos.`,
    `Para ver que a técnica serve para qualquer assunto: basta saber qual coluna liga as tabelas (depto_id e id).`,
    `Escreva FROM funcionarios f JOIN departamentos d ON d.id = f.depto_id e dê um apelido à coluna nome do departamento: d.nome AS departamento.`,
    `2 colunas (nome e departamento) e 12 linhas, uma por funcionário.`],
  'sql-2-10': [
    `JOIN junto com GROUP BY e AVG: um resumo por departamento. O AVG ignora salários NULL.`,
    `Para comparar grupos: qual departamento paga mais em média.`,
    `Junte as tabelas, agrupe por d.nome, calcule AVG(f.salario) AS media e ordene com ORDER BY media DESC.`,
    `2 colunas (nome e media) e 4 linhas, da maior média (TI, com 8675) para a menor.`],
  'sql-2-11': [
    `HAVING filtra os grupos depois de calculados, inclusive depois de um JOIN.`,
    `Para manter só os grupos relevantes: departamentos grandes, clientes com muitos pedidos.`,
    `Escreva o HAVING depois do GROUP BY com a função: HAVING COUNT(*) >= 3. O apelido (total) pode ser usado no SELECT.`,
    `2 colunas (nome e total) e 2 linhas: TI (4 pessoas) e Vendas (4 pessoas).`],
  'sql-2-12': [
    `Um banco novo, de clientes e pedidos, para praticar filtro, JOIN e resumo juntos.`,
    `Para descobrir quanto cada cliente realmente pagou, ignorando pedidos cancelados ou pendentes.`,
    `JOIN entre clientes c e pedidos p, WHERE p.status = 'pago', GROUP BY c.nome, SUM(p.valor) AS total e ORDER BY total DESC.`,
    `2 colunas (nome e total) e 5 linhas, da cliente que mais pagou (Carla Dias, 1260) para a que menos pagou.`],
  'sql-2-13': [
    `Combinar LEFT JOIN com IS NULL mostra quem nunca aparece na outra tabela.`,
    `Para achar clientes que ainda não compraram, ou seja, oportunidades para campanhas.`,
    `Parta de clientes, faça LEFT JOIN pedidos ... ON p.cliente_id = c.id e filtre com WHERE p.id IS NULL.`,
    `O nome dos clientes sem nenhum pedido: 2 linhas (Gabi Torres e Hugo Alves).`],
  'sql-2-14': [
    `Uma subconsulta é um SELECT dentro de outro SELECT, escrito entre parênteses.`,
    `Para comparar cada linha com um valor calculado: produtos mais caros que a média, vendas acima do normal.`,
    `Escreva a subconsulta no lugar do valor: WHERE preco > (SELECT AVG(preco) FROM produtos). Ela é executada primeiro.`,
    `2 colunas (nome e preco) e 3 linhas: os produtos acima do preço médio (Notebook, Cadeira e Monitor).`],
  'sql-2-15': [
    `IN pode receber uma subconsulta que devolve uma lista de valores, em vez de uma lista escrita à mão.`,
    `Para filtrar por uma lista que vem de outra tabela: produtos que aparecem nas vendas.`,
    `Escreva WHERE id IN (SELECT produto_id FROM vendas). A subconsulta deve devolver uma única coluna.`,
    `O nome dos produtos vendidos pelo menos uma vez: 9 linhas (todos, menos a Estante).`],
  'sql-2-16': [
    `Uma subconsulta no FROM vira uma "tabela temporária" que a consulta de fora usa em seguida.`,
    `Para filtrar ou usar o resultado de um resumo: primeiro calcula o total por produto, depois filtra os totais.`,
    `Coloque o SELECT com GROUP BY entre parênteses, dê um apelido (AS t) e filtre fora: SELECT ... FROM (...) AS t WHERE total > 10.`,
    `2 colunas (produto_id e total) e 4 linhas: os produtos com mais de 10 unidades vendidas.`],
  'sql-2-17': [
    `UNION junta o resultado de dois SELECT que têm o mesmo número de colunas e remove as linhas repetidas. UNION ALL mantém todas.`,
    `Para empilhar listas de origens diferentes, ou de filtros diferentes, em um só resultado.`,
    `Escreva um SELECT completo, a palavra UNION e outro SELECT completo, cada um com seu WHERE.`,
    `1 coluna com os nomes das duas categorias juntas: 6 linhas (3 Móveis e 3 Papelaria).`],
  'sql-2-18': [
    `EXCEPT devolve o que está no primeiro SELECT mas não aparece no segundo.`,
    `Para achar diferenças entre duas listas: produtos cadastrados que nunca foram vendidos.`,
    `Escreva SELECT id FROM produtos EXCEPT SELECT produto_id FROM vendas. Os dois SELECT precisam ter o mesmo número de colunas.`,
    `1 linha com o id do produto que não tem venda: 9.`],
  'sql-2-19': [
    `CASE WHEN cria uma coluna com regras do tipo "se... então... senão...".`,
    `Para classificar dados em faixas ou categorias: caro, médio e barato; aprovado e reprovado.`,
    `Escreva CASE WHEN condição THEN valor WHEN outra THEN valor ELSE valor END AS faixa. As regras são testadas na ordem.`,
    `2 colunas (nome e faixa) e 10 linhas, cada produto classificado como caro, medio ou barato.`],
  'sql-2-20': [
    `Dá para agrupar por uma coluna criada com CASE, e assim contar quantos itens há em cada faixa.`,
    `Para relatórios por faixa: quantos produtos caros, médios e baratos existem.`,
    `Crie a faixa com CASE ... END AS faixa, conte com COUNT(*) e escreva GROUP BY faixa.`,
    `2 colunas (faixa e total) e 3 linhas: barato (4), caro (2) e medio (4).`],
  'sql-2-21': [
    `COALESCE(a, b) devolve o primeiro valor que não é NULL.`,
    `Para trocar vazios por um valor padrão, como 0 ou "sem informação", antes de somar ou mostrar.`,
    `Escreva COALESCE(salario, 0) AS salario_ok: se o salário for NULL, aparece 0.`,
    `2 colunas (nome e salario_ok) e 12 linhas. Quem não tinha salário (Camila) aparece com 0.`],
  'sql-2-22': [
    `O operador || junta textos; SUBSTR(texto, início, tamanho) pega um pedaço; UPPER e LOWER mudam a caixa das letras.`,
    `Para montar textos prontos para exibir: etiquetas, nomes completos, códigos.`,
    `Ligue as partes com || e coloque os textos fixos entre aspas simples: nome || ' (' || cargo || ')'.`,
    `1 coluna (etiqueta) e 12 linhas, no formato Nome (Cargo), por exemplo: Carlos (Diretor de TI).`],
  'sql-2-23': [
    `strftime('%Y-%m', data) extrai o ano e o mês de uma data. '%m' é só o mês e '%Y' é só o ano.`,
    `Para agrupar dados por período: vendas por mês, cadastros por ano.`,
    `Escreva strftime('%Y-%m', data) AS mes, some a quantidade e agrupe com GROUP BY mes.`,
    `2 colunas (mes e total) e 2 linhas: 2026-09 (70) e 2026-10 (137).`],
  'sql-2-24': [
    `Combina datas, JOIN e GROUP BY para acompanhar a evolução do faturamento mês a mês.`,
    `Para ver se a receita está crescendo ou caindo ao longo do tempo.`,
    `Junte vendas e produtos, calcule SUM(p.preco * v.qtd), agrupe pelo mês com strftime e ordene com ORDER BY mes.`,
    `2 colunas (mes e receita) e 2 linhas, em ordem de mês: 2026-09 (11120) e 2026-10 (11190).`],
  'sql-2-25': [
    `julianday(a) - julianday(b) dá a diferença em dias entre duas datas. Aqui se usa uma data fixa para o resultado não mudar.`,
    `Para medir intervalos de tempo: há quantos dias o cliente se cadastrou, quanto tempo falta para um prazo.`,
    `Escreva CAST(julianday('2026-10-18') - julianday(cadastro) AS INTEGER) AS dias. O CAST tira a parte decimal.`,
    `2 colunas (nome e dias) e 8 linhas, do cliente mais antigo (Ana Souza, 349 dias) ao mais novo.`],
  'sql-2-26': [
    `INSERT INTO adiciona linhas novas a uma tabela. Depois, um SELECT mostra como ficou.`,
    `Para cadastrar dados: um produto novo, um cliente novo, um pedido novo.`,
    `Escreva INSERT INTO produtos VALUES (11, 'Fone', 120, 'Eletrônicos', 40); com os valores na mesma ordem das colunas. Termine o comando com ponto e vírgula e faça o SELECT.`,
    `A lista dos produtos Eletrônicos, agora com o novo: 5 linhas em ordem alfabética (Fone, Monitor, Mouse, Notebook e Teclado).`],
  'sql-2-27': [
    `UPDATE altera linhas que já existem. Sempre use WHERE, senão altera a tabela inteira!`,
    `Para corrigir ou atualizar dados: reajustar preços, mudar um status.`,
    `Escreva UPDATE produtos SET preco = preco * 1.1 WHERE categoria = 'Papelaria'; e depois um SELECT para conferir.`,
    `3 linhas (nome e preco) dos produtos de Papelaria, com o preço 10% maior que antes.`],
  'sql-2-28': [
    `DELETE remove linhas de uma tabela. Também exige WHERE: sem ele, apaga tudo!`,
    `Para limpar dados: apagar registros antigos, duplicados ou inválidos.`,
    `Escreva DELETE FROM produtos WHERE estoque = 0; e depois SELECT COUNT(*) para conferir quantos sobraram.`,
    `1 linha e 1 coluna: 9 produtos restaram (o de estoque zero foi apagado).`],
  'sql-2-29': [
    `CREATE TABLE cria uma tabela nova, definindo o nome e o tipo de cada coluna.`,
    `Para guardar um novo conjunto de dados: metas, cadastros, qualquer lista própria.`,
    `Escreva CREATE TABLE metas(categoria TEXT, valor REAL); depois INSERT INTO metas VALUES (...), (...); e termine com um SELECT.`,
    `A tabela nova, ordenada por categoria: 2 linhas (Móveis, 2000 e Papelaria, 300).`],
  'sql-2-30': [
    `Projeto do nível: um relatório de verdade que junta JOIN, GROUP BY, HAVING e ORDER BY.`,
    `Para treinar o que um analista entrega ao chefe: uma análise pronta de receita por categoria.`,
    `Junte vendas e produtos, agrupe por p.categoria, calcule as duas somas, filtre os grupos com HAVING e ordene pela receita.`,
    `3 colunas (categoria, unidades e receita) e 2 linhas: Eletrônicos (31 unidades, 16950) e Móveis (6 unidades, 4650).`]
};
