// SQL — NÍVEL AVANÇADO: as 4 explicações de cada lição, na ordem:
//   [ O que é ,  Para que serve ,  Como se faz ,  Qual o retorno esperado ]
module.exports = {
  'sql-3-01': [
    `Uma CTE (WITH) dá um nome a uma consulta intermediária, como se fosse uma tabela temporária, que a consulta principal usa em seguida.`,
    `Para quebrar uma consulta complicada em partes e deixar o código mais fácil de ler e de revisar.`,
    `Escreva WITH ti AS (SELECT ... ) e, logo depois, o SELECT principal, usando o nome: SELECT nome, salario FROM ti.`,
    `2 colunas (nome e salario) e 4 linhas, as pessoas do departamento 2, do maior salário (Carlos, 15000) ao menor.`],
  'sql-3-02': [
    `Uma CTE pode guardar um número de referência, como a média geral, para comparar com cada linha. Com mais de uma CTE, separe por vírgula.`,
    `Para comparar cada linha com um valor calculado uma única vez: quem ganha acima da média?`,
    `Crie WITH media_geral AS (SELECT AVG(salario) AS m FROM funcionarios) e filtre com FROM funcionarios, media_geral WHERE salario > m.`,
    `2 colunas (nome e salario) e 4 linhas: Carlos, Marina, Paulo e Renata, as pessoas acima da média.`],
  'sql-3-03': [
    `Você resume os dados numa CTE e depois junta esse resumo com outra tabela.`,
    `Para trocar um id por um nome legível em um resultado já resumido: o total por departamento com o nome dele.`,
    `Crie a CTE com GROUP BY (WITH folha AS (SELECT depto_id, SUM(salario) AS total ...)) e faça JOIN com departamentos pelo id.`,
    `2 colunas (nome e total) e 4 linhas, da maior folha (TI, 34700) para a menor.`],
  'sql-3-04': [
    `Uma subconsulta correlacionada usa uma coluna da consulta de fora e roda uma vez para cada linha.`,
    `Para comparar cada linha com o seu próprio grupo: quem ganha mais que a média do próprio departamento.`,
    `Dê um apelido à tabela de fora (f) e use-o dentro da subconsulta: WHERE depto_id = f.depto_id.`,
    `2 colunas (nome e salario) e 4 linhas: Carlos, Marina, Renata e Fernanda, cada um acima da média do seu departamento.`],
  'sql-3-05': [
    `EXISTS é verdadeiro quando a subconsulta devolve pelo menos uma linha.`,
    `Para perguntar "tem algum...?" de forma eficiente: produtos com ao menos uma venda.`,
    `Escreva WHERE EXISTS (SELECT 1 FROM vendas v WHERE v.produto_id = p.id): a subconsulta liga as duas tabelas pela coluna em comum.`,
    `1 coluna (nome) e 9 linhas: os produtos que têm venda.`],
  'sql-3-06': [
    `NOT EXISTS pega quem NÃO tem nenhuma linha relacionada que cumpra a condição.`,
    `Para achar quem falta: clientes sem pedido pago, produtos sem venda.`,
    `Escreva WHERE NOT EXISTS (SELECT 1 FROM pedidos p WHERE p.cliente_id = c.id AND p.status = 'pago').`,
    `1 coluna (nome) e 3 linhas: Diego Rocha, Gabi Torres e Hugo Alves.`],
  'sql-3-07': [
    `Auto-junção (self join): uma tabela se junta com ela mesma. A coluna gerente_id aponta para o id de outro funcionário.`,
    `Para trabalhar com hierarquias: funcionário e chefe, categoria e subcategoria.`,
    `Use a mesma tabela duas vezes com apelidos diferentes: FROM funcionarios f JOIN funcionarios g ON g.id = f.gerente_id. O f é o funcionário e o g, o gerente.`,
    `2 colunas (nome e gerente) e 8 linhas: só quem tem gerente, em ordem de nome (Camila, gerente Bruno, vem primeiro).`],
  'sql-3-08': [
    `O LEFT JOIN na auto-junção mantém também quem não tem gerente (o gerente fica NULL).`,
    `Para listar todos, inclusive quem está no topo da hierarquia, e mostrar um texto no lugar do vazio.`,
    `Troque o JOIN por LEFT JOIN e use COALESCE(g.nome, 'Sem gerente') AS gerente para preencher os vazios.`,
    `2 colunas (nome e gerente) e 12 linhas: todos os funcionários; quem não tem chefe aparece com Sem gerente.`],
  'sql-3-09': [
    `Funções de janela calculam sobre um conjunto de linhas sem juntá-las em uma só. ROW_NUMBER() numera as linhas em ordem.`,
    `Para criar posições e rankings sem perder o detalhe de cada linha.`,
    `Escreva ROW_NUMBER() OVER (ORDER BY salario DESC) AS pos: o que vem dentro do OVER define a ordem da numeração.`,
    `3 colunas (nome, salario e pos) e 11 linhas, numeradas de 1 a 11 (Carlos, 15000, é o 1).`],
  'sql-3-10': [
    `RANK() numera como o ROW_NUMBER, mas dá a mesma posição aos empates e pula os números seguintes.`,
    `Para rankings justos: se duas pessoas empatam em 2º lugar, as duas são 2º e a próxima é 4º.`,
    `Escreva RANK() OVER (ORDER BY valor DESC) AS pos e filtre o mês com WHERE mes = '2026-10'.`,
    `4 colunas (vendedor, mes, valor e pos) e 4 linhas: Carla (2900) em 1º, depois Ana, Bruno e Diego.`],
  'sql-3-11': [
    `DENSE_RANK() também dá a mesma posição aos empates, mas sem pular números depois deles.`,
    `Para classificações em níveis consecutivos: 1º, 2º, 3º, mesmo com empates.`,
    `Escreva DENSE_RANK() OVER (ORDER BY depto_id) AS pos e ordene o resultado por pos e nome.`,
    `3 colunas (nome, depto_id e pos) e 12 linhas. Quem é do mesmo departamento recebe a mesma posição, e as posições vão de 1 a 4 sem buracos.`],
  'sql-3-12': [
    `PARTITION BY reinicia a função de janela para cada grupo, como uma contagem separada por departamento.`,
    `Para rankings dentro de cada grupo: o melhor salário de cada departamento, a venda mais alta de cada vendedor.`,
    `Escreva RANK() OVER (PARTITION BY depto_id ORDER BY salario DESC) AS pos: o PARTITION BY diz qual é o grupo.`,
    `4 colunas (depto_id, nome, salario e pos) e 11 linhas. A posição volta ao 1 em cada departamento.`],
  'sql-3-13': [
    `Top N por grupo: numere as linhas com a função de janela dentro de uma CTE e depois filtre as primeiras posições.`,
    `Para responder "qual é o maior de cada grupo?": o maior salário de cada departamento.`,
    `Crie WITH r AS (SELECT ..., ROW_NUMBER() OVER (PARTITION BY depto_id ORDER BY salario DESC) AS pos ...) e depois SELECT ... FROM r WHERE pos = 1.`,
    `3 colunas (depto_id, nome e salario) e 4 linhas, uma por departamento: Renata, Carlos, Bruno e Fernanda.`],
  'sql-3-14': [
    `SUM() OVER (ORDER BY ...) calcula o total corrente (acumulado) linha a linha.`,
    `Para acompanhar quanto já foi vendido até cada mês, ou o saldo de uma conta ao longo do tempo.`,
    `Escreva SUM(valor) OVER (ORDER BY mes) AS acumulado e filtre a vendedora com WHERE vendedor = 'Ana'.`,
    `3 colunas (mes, valor e acumulado) e 6 linhas. O acumulado cresce a cada mês: 1200, 2700, 3800...`],
  'sql-3-15': [
    `AVG() OVER (PARTITION BY ...) coloca a média do grupo ao lado de cada linha, sem perder as linhas.`,
    `Para comparar cada valor com a média do seu grupo, lado a lado.`,
    `Escreva AVG(valor) OVER (PARTITION BY vendedor) AS media_vendedor e filtre os meses com WHERE mes IN ('2026-09', '2026-10').`,
    `4 colunas (vendedor, mes, valor e media_vendedor) e 8 linhas. A média se repete nas linhas do mesmo vendedor.`],
  'sql-3-16': [
    `LAG(coluna) traz o valor da linha anterior.`,
    `Para comparar períodos: o valor deste mês com o do mês passado.`,
    `Escreva LAG(valor) OVER (ORDER BY mes) AS anterior. A primeira linha não tem anterior e fica NULL.`,
    `3 colunas (mes, valor e anterior) e 6 linhas. Na primeira linha o anterior fica vazio; nas outras traz o valor do mês anterior.`],
  'sql-3-17': [
    `LEAD(coluna) traz o valor da próxima linha, o contrário do LAG.`,
    `Para olhar para frente: comparar o mês atual com o seguinte.`,
    `Escreva LEAD(valor) OVER (ORDER BY mes) AS proximo. A última linha não tem próximo e fica NULL.`,
    `3 colunas (mes, valor e proximo) e 6 linhas. Cada linha mostra o valor do mês seguinte; a última fica vazia.`],
  'sql-3-18': [
    `Combina LAG com uma conta para medir a variação: valor atual menos valor anterior do mesmo vendedor.`,
    `Para saber se cada vendedor está crescendo ou caindo de um mês para outro.`,
    `Escreva valor - LAG(valor) OVER (PARTITION BY vendedor ORDER BY mes) AS variacao. O PARTITION BY evita misturar vendedores.`,
    `3 colunas (vendedor, mes e variacao) e 24 linhas. O primeiro mês de cada vendedor fica NULL.`],
  'sql-3-19': [
    `SUM() OVER () sem partição devolve o total geral ao lado de cada linha, o que permite calcular a participação de cada uma.`,
    `Para saber quanto cada item representa do todo: a fatia de cada vendedor nas vendas do mês.`,
    `Escreva ROUND(valor * 100.0 / SUM(valor) OVER (), 1) AS pct: multiplicar por 100.0 (com ponto) evita divisão inteira.`,
    `3 colunas (vendedor, valor e pct) e 4 linhas, da maior fatia (Carla, 38.4%) para a menor.`],
  'sql-3-20': [
    `NTILE(n) divide as linhas ordenadas em n grupos do mesmo tamanho (tercis, quartis, decis...).`,
    `Para classificar em faixas: a faixa mais baixa, a média e a mais alta de salários.`,
    `Escreva NTILE(3) OVER (ORDER BY salario) AS faixa. Cada linha recebe o número da faixa, de 1 a 3.`,
    `3 colunas (nome, salario e faixa) e 11 linhas, em ordem de salário, com a faixa 1 para os menores salários e a 3 para os maiores.`],
  'sql-3-21': [
    `FIRST_VALUE pega o primeiro valor de uma janela ordenada, por exemplo o melhor do grupo.`,
    `Para colocar ao lado de cada linha quem é o melhor do seu grupo: o nome de quem mais ganha no departamento.`,
    `Escreva FIRST_VALUE(nome) OVER (PARTITION BY depto_id ORDER BY salario DESC) AS maior_salario.`,
    `4 colunas (nome, depto_id, salario e maior_salario) e 11 linhas. Em cada departamento o nome do topo se repete.`],
  'sql-3-22': [
    `Média móvel: ROWS BETWEEN 2 PRECEDING AND CURRENT ROW cria uma janela deslizante com a linha atual e as 2 anteriores.`,
    `Para suavizar oscilações e enxergar a tendência, em vez de olhar um mês isolado.`,
    `Escreva AVG(valor) OVER (ORDER BY mes ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) e arredonde com ROUND(..., 1).`,
    `3 colunas (mes, valor e media_movel) e 6 linhas. No começo a média usa menos meses (1200, depois 1350...).`],
  'sql-3-23': [
    `Pivot com CASE: transforma valores de linhas em colunas, uma coluna para cada categoria.`,
    `Para montar tabelas cruzadas, como um vendedor por linha e um mês por coluna.`,
    `Para cada coluna nova, escreva SUM(CASE WHEN mes = '2026-09' THEN valor END) AS setembro e agrupe por vendedor.`,
    `3 colunas (vendedor, setembro e outubro) e 4 linhas, uma por vendedor.`],
  'sql-3-24': [
    `Um relatório de clientes recorrentes: combina JOIN, GROUP BY e HAVING para achar o público mais valioso.`,
    `Para encontrar quem compra mais de uma vez e quanto cada um gerou de receita.`,
    `Junte clientes e pedidos, filtre o status pago, agrupe pelo nome, conte, some e use HAVING COUNT(*) >= 2.`,
    `3 colunas (nome, qtd e total) e 4 linhas, do maior total (Carla Dias, 1260) para o menor.`],
  'sql-3-25': [
    `COUNT(DISTINCT usuario_id) agrupado por data mostra o engajamento diário: quantas pessoas diferentes acessaram.`,
    `Para medir usuários ativos por dia, uma das métricas mais usadas em produtos digitais.`,
    `Agrupe por data e conte os usuários distintos: COUNT(DISTINCT usuario_id) AS usuarios_ativos ... GROUP BY data ORDER BY data.`,
    `2 colunas (data e usuarios_ativos) e 6 linhas, uma por dia, em ordem de data.`],
  'sql-3-26': [
    `Uma view (CREATE VIEW) salva uma consulta com um nome, e depois você a usa como se fosse uma tabela.`,
    `Para reaproveitar uma consulta complexa, sem reescrever, e dar aos outros uma tabela pronta.`,
    `Escreva CREATE VIEW dias_por_usuario AS SELECT ...; e depois faça um SELECT usando o nome da view em um JOIN.`,
    `2 colunas (nome e dias) e 6 linhas, de quem acessou em mais dias (Carla, 5) para quem acessou em menos.`],
  'sql-3-27': [
    `CREATE INDEX cria um índice, um "atalho" que acelera buscas em colunas muito consultadas. O resultado da consulta não muda, só a velocidade.`,
    `Para manter o banco rápido quando a tabela cresce e a mesma coluna é filtrada o tempo todo.`,
    `Escreva CREATE INDEX idx_acesso_usuario ON acessos(usuario_id); e depois faça a consulta normalmente.`,
    `1 linha e 1 coluna com a contagem: 5 acessos do usuário 3.`],
  'sql-3-28': [
    `Função de janela com CTE resolve "quem está acima da média do seu grupo" sem subconsulta correlacionada.`,
    `Para encontrar os destaques de cada grupo: vendas acima do padrão do próprio vendedor.`,
    `Calcule a média com AVG(valor) OVER (PARTITION BY vendedor) AS m numa CTE e filtre fora: WHERE valor > m.`,
    `3 colunas (vendedor, mes e valor) e 12 linhas: só os meses em que o vendedor vendeu acima da própria média.`],
  'sql-3-29': [
    `A curva ABC ordena do maior para o menor e calcula o percentual acumulado do total, para ver onde está a maior parte do resultado.`,
    `Para descobrir quem concentra a maior parte das vendas (a regra 80/20).`,
    `Escreva SUM(valor) OVER (ORDER BY valor DESC) * 100.0 / SUM(valor) OVER () e arredonde com ROUND(..., 1).`,
    `3 colunas (vendedor, valor e pct_acumulado) e 4 linhas. O percentual sobe até chegar a 100 na última linha.`],
  'sql-3-30': [
    `Projeto final do nível: um painel de clientes com CTE, JOIN e funções de janela no mesmo relatório.`,
    `Para treinar o que um analista entrega: ranking de clientes e a participação de cada um no total.`,
    `Crie a CTE com o total pago por cliente, depois use RANK() OVER (ORDER BY total DESC) para a posição e ROUND(total * 100.0 / SUM(total) OVER (), 1) para a participação.`,
    `4 colunas (nome, total, pos e pct) e 5 linhas, da primeira posição (Carla Dias, 1260, 36.8%) para a última.`]
};
