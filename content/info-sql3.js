// SQL — NÍVEL AVANÇADO: as 4 explicações de cada lição, escritas como se a pessoa tivesse 10 anos e estivesse vendo isso pela primeira vez.
//   [ O que é ,  Para que serve ,  Como você vai usar aqui ,  O que vai aparecer na tela ]
module.exports = {
  'sql-3-01': [
    `CTE (a gente escreve WITH) é dar um nome a uma consulta pequena, como se ela fosse uma tabela de rascunho. A consulta principal usa esse rascunho logo em seguida.`,
    `Serve para quebrar uma consulta grande e complicada em pedaços, como resolver um problema de matemática em etapas. Fica mais fácil de ler e de consertar.`,
    `Escreva WITH ti AS (SELECT * FROM funcionarios WHERE depto_id = 2) e logo depois o SELECT principal, usando o nome que você criou: SELECT nome, salario FROM ti ORDER BY salario DESC.`,
    `2 colunas (nome e salario) e 4 linhas: as pessoas do departamento 2, do maior salário (Carlos, 15000) ao menor.`],
  'sql-3-02': [
    `Uma CTE também pode guardar um número só, como a média geral, para você comparar com cada linha. Se tiver mais de uma CTE, separe uma da outra com vírgula.`,
    `Serve para calcular um valor uma única vez e usá-lo para comparar com todo mundo: quem ganha acima da média?`,
    `Crie WITH media_geral AS (SELECT AVG(salario) AS m FROM funcionarios) e depois peneire com FROM funcionarios, media_geral WHERE salario > m.`,
    `2 colunas (nome e salario) e 4 linhas: Carlos, Marina, Paulo e Renata, as pessoas que ganham acima da média.`],
  'sql-3-03': [
    `Você pode fazer um resumo dentro de uma CTE e depois juntar esse resumo com outra tabela, como colocar o nome certo em cima de uma conta que já está pronta.`,
    `Serve para trocar um número de id por um nome fácil de ler num resultado que já foi resumido: o total de cada departamento, com o nome dele.`,
    `Crie a CTE com GROUP BY: WITH folha AS (SELECT depto_id, SUM(salario) AS total FROM funcionarios GROUP BY depto_id). Depois faça JOIN dela com departamentos pelo id.`,
    `2 colunas (nome e total) e 4 linhas, da maior folha de pagamento (TI, 34700) para a menor.`],
  'sql-3-04': [
    `Subconsulta correlacionada é uma perguntinha que olha para a linha de fora. Ela roda uma vez para cada linha, como o professor perguntar a cada aluno: "e a média da SUA turma?".`,
    `Serve para comparar cada linha com o seu próprio grupo: quem ganha mais que a média do próprio departamento, e não da empresa toda.`,
    `Dê um apelido à tabela de fora (f) e use esse apelido lá dentro da subconsulta: (SELECT AVG(salario) FROM funcionarios WHERE depto_id = f.depto_id).`,
    `2 colunas (nome e salario) e 4 linhas: Carlos, Marina, Renata e Fernanda, cada um acima da média do seu departamento.`],
  'sql-3-05': [
    `EXISTS quer dizer "existe". Ele dá resposta "sim" quando a subconsulta encontra pelo menos uma linha, e "não" quando não encontra nada.`,
    `Serve para perguntar "tem algum...?" de um jeito rápido: este produto tem pelo menos uma venda?`,
    `Escreva WHERE EXISTS (SELECT 1 FROM vendas v WHERE v.produto_id = p.id). A subconsulta liga as duas tabelas pela coluna em comum, e o 1 só quer dizer "tanto faz o que mostrar, só me diga se achou".`,
    `1 coluna (nome) e 9 linhas: os produtos que têm pelo menos uma venda.`],
  'sql-3-06': [
    `NOT EXISTS é o contrário: dá "sim" quando NÃO existe nenhuma linha que cumpra a condição.`,
    `Serve para achar quem está faltando: clientes que não têm nenhum pedido pago, produtos que nunca foram vendidos.`,
    `Escreva WHERE NOT EXISTS (SELECT 1 FROM pedidos p WHERE p.cliente_id = c.id AND p.status = 'pago'). Quer dizer: "não existe nenhum pedido pago desse cliente".`,
    `1 coluna (nome) e 3 linhas: Diego Rocha, Gabi Torres e Hugo Alves.`],
  'sql-3-07': [
    `Auto-junção (em inglês, self join) é quando uma tabela se junta com ela mesma. Aqui, a coluna gerente_id guarda o id de OUTRO funcionário: o chefe. É como uma lista de pessoas em que cada uma aponta para o seu chefe, que também está na lista.`,
    `Serve para trabalhar com hierarquias: funcionário e chefe, pasta e subpasta, categoria e subcategoria.`,
    `Use a mesma tabela duas vezes, com apelidos diferentes: FROM funcionarios f JOIN funcionarios g ON g.id = f.gerente_id. O f é o funcionário e o g é o gerente dele.`,
    `2 colunas (nome e gerente) e 8 linhas: só quem tem gerente, em ordem alfabética (Camila, com o gerente Bruno, vem primeiro).`],
  'sql-3-08': [
    `Com LEFT JOIN na auto-junção, quem não tem chefe continua na lista, e o campo do gerente fica vazio (NULL).`,
    `Serve para mostrar todo mundo, inclusive quem está no topo da hierarquia, e escrever um texto bonito no lugar do vazio.`,
    `Troque o JOIN por LEFT JOIN e use COALESCE(g.nome, 'Sem gerente') AS gerente. O COALESCE é o "se estiver vazio, use este texto".`,
    `2 colunas (nome e gerente) e 12 linhas: todos os funcionários; quem não tem chefe aparece com "Sem gerente".`],
  'sql-3-09': [
    `Funções de janela fazem contas olhando para um conjunto de linhas, mas sem juntar as linhas numa só. ROW_NUMBER() é a mais simples: ela escreve 1, 2, 3... ao lado de cada linha, como a senha de uma fila.`,
    `Serve para criar posições e rankings sem perder os detalhes de cada linha: o 1º, o 2º, o 3º maior salário.`,
    `Escreva ROW_NUMBER() OVER (ORDER BY salario DESC) AS pos. O que fica dentro do OVER diz em que ordem numerar. Aqui só entram quem tem salário (WHERE salario IS NOT NULL).`,
    `3 colunas (nome, salario e pos) e 11 linhas, numeradas de 1 a 11 (Carlos, com 15000, é o número 1).`],
  'sql-3-10': [
    `RANK() numera como o ROW_NUMBER, mas, se duas linhas empatam, as duas ganham a mesma posição, e a próxima posição "pula" o número. É como numa corrida: dois segundos lugares e depois vem o quarto.`,
    `Serve para rankings justos, em que empate é empate.`,
    `Escreva RANK() OVER (ORDER BY valor DESC) AS pos e peneire só o mês que você quer com WHERE mes = '2026-10'.`,
    `4 colunas (vendedor, mes, valor e pos) e 4 linhas: Carla (2900) em 1º, depois Ana, Bruno e Diego.`],
  'sql-3-11': [
    `DENSE_RANK() também dá a mesma posição para empates, mas NÃO pula números depois deles: depois de dois primeiros lugares, vem o segundo.`,
    `Serve para classificações em degraus seguidos (1º, 2º, 3º), mesmo quando há empates.`,
    `Escreva DENSE_RANK() OVER (ORDER BY depto_id) AS pos e, no fim, ordene o resultado por pos e nome.`,
    `3 colunas (nome, depto_id e pos) e 12 linhas. Quem é do mesmo departamento recebe a mesma posição, e as posições vão de 1 a 4 sem buracos.`],
  'sql-3-12': [
    `PARTITION BY quer dizer "separe em grupos". A função de janela recomeça do zero em cada grupo, como uma contagem separada para cada turma da escola.`,
    `Serve para rankings dentro de cada grupo: o melhor salário de cada departamento, a venda mais alta de cada vendedor.`,
    `Escreva RANK() OVER (PARTITION BY depto_id ORDER BY salario DESC) AS pos. O PARTITION BY diz qual é o grupo, e o ORDER BY diz como ordenar dentro dele.`,
    `4 colunas (depto_id, nome, salario e pos) e 11 linhas. A posição volta ao 1 a cada departamento novo.`],
  'sql-3-13': [
    `Top N por grupo é pegar os melhores de CADA grupo. A receita: numerar as linhas dentro de cada grupo (numa CTE) e depois ficar só com as primeiras posições.`,
    `Serve para responder "quem é o maior de cada grupo?", como o maior salário de cada departamento.`,
    `Crie WITH r AS (SELECT ..., ROW_NUMBER() OVER (PARTITION BY depto_id ORDER BY salario DESC) AS pos FROM funcionarios WHERE salario IS NOT NULL) e depois SELECT depto_id, nome, salario FROM r WHERE pos = 1.`,
    `3 colunas (depto_id, nome e salario) e 4 linhas, uma por departamento: Renata, Carlos, Bruno e Fernanda.`],
  'sql-3-14': [
    `SUM() OVER (ORDER BY ...) faz uma soma que vai crescendo linha a linha, o "acumulado". É como o cofrinho: a cada mês você soma o que já tinha com o que entrou.`,
    `Serve para acompanhar quanto já foi vendido até cada mês, ou como o saldo de uma conta vai mudando ao longo do tempo.`,
    `Escreva SUM(valor) OVER (ORDER BY mes) AS acumulado e escolha a vendedora com WHERE vendedor = 'Ana'.`,
    `3 colunas (mes, valor e acumulado) e 6 linhas. O acumulado cresce a cada mês: 1200, 2700, 3800...`],
  'sql-3-15': [
    `AVG() OVER (PARTITION BY ...) calcula a média de cada grupo e escreve o resultado ao lado de cada linha, sem esconder nenhuma linha.`,
    `Serve para comparar cada valor com a média do seu grupo, lado a lado, sem fazer duas consultas.`,
    `Escreva AVG(valor) OVER (PARTITION BY vendedor) AS media_vendedor e escolha os meses com WHERE mes IN ('2026-09', '2026-10').`,
    `4 colunas (vendedor, mes, valor e media_vendedor) e 8 linhas. A média se repete nas linhas do mesmo vendedor.`],
  'sql-3-16': [
    `LAG quer dizer "atrasado": LAG(coluna) traz o valor da linha de cima (a anterior), como olhar a nota da prova passada.`,
    `Serve para comparar tempos diferentes: o valor deste mês com o do mês passado.`,
    `Escreva LAG(valor) OVER (ORDER BY mes) AS anterior. A primeira linha não tem ninguém antes dela, então fica vazia (NULL).`,
    `3 colunas (mes, valor e anterior) e 6 linhas. Na primeira linha o anterior fica vazio; nas outras aparece o valor do mês de antes.`],
  'sql-3-17': [
    `LEAD quer dizer "à frente": LEAD(coluna) traz o valor da próxima linha. É o contrário do LAG.`,
    `Serve para olhar para frente: comparar o mês atual com o mês seguinte.`,
    `Escreva LEAD(valor) OVER (ORDER BY mes) AS proximo. A última linha não tem próxima, então fica vazia (NULL).`,
    `3 colunas (mes, valor e proximo) e 6 linhas. Cada linha mostra o valor do mês seguinte; a última fica vazia.`],
  'sql-3-18': [
    `Juntando o LAG com uma subtração você descobre a variação: o valor de agora menos o valor de antes, para cada vendedor.`,
    `Serve para saber se cada vendedor está crescendo ou caindo de um mês para o outro.`,
    `Escreva valor - LAG(valor) OVER (PARTITION BY vendedor ORDER BY mes) AS variacao. O PARTITION BY evita misturar um vendedor com outro.`,
    `3 colunas (vendedor, mes e variacao) e 24 linhas. O primeiro mês de cada vendedor fica vazio (NULL), porque não tem mês anterior.`],
  'sql-3-19': [
    `SUM() OVER () com o parênteses vazio calcula o total geral e escreve esse total ao lado de cada linha. Com ele dá para descobrir que fatia do bolo cada pessoa comeu.`,
    `Serve para saber quanto cada item representa do todo: qual a fatia de cada vendedor nas vendas do mês.`,
    `Escreva ROUND(valor * 100.0 / SUM(valor) OVER (), 1) AS pct. Use 100.0 (com ponto) para a conta sair com vírgula, e o 1 dentro do ROUND mantém uma casa depois da vírgula.`,
    `3 colunas (vendedor, valor e pct) e 4 linhas, da maior fatia (Carla, 38.4%) para a menor.`],
  'sql-3-20': [
    `NTILE(n) corta a fila em n pedaços do mesmo tamanho, como repartir a turma em 3 times iguais, do mais baixo ao mais alto.`,
    `Serve para colocar as linhas em faixas: salários baixos, médios e altos.`,
    `Escreva NTILE(3) OVER (ORDER BY salario) AS faixa. Cada linha recebe o número da faixa dela, de 1 a 3.`,
    `3 colunas (nome, salario e faixa) e 11 linhas, em ordem de salário: a faixa 1 para os menores salários e a faixa 3 para os maiores.`],
  'sql-3-21': [
    `FIRST_VALUE pega o primeiro valor da fila de um grupo. Se a fila estiver ordenada do maior para o menor, o primeiro é o campeão do grupo.`,
    `Serve para escrever, ao lado de cada linha, quem é o melhor do grupo dela: o nome de quem ganha mais no departamento.`,
    `Escreva FIRST_VALUE(nome) OVER (PARTITION BY depto_id ORDER BY salario DESC) AS maior_salario.`,
    `4 colunas (nome, depto_id, salario e maior_salario) e 11 linhas. Em cada departamento, o nome de quem ganha mais se repete.`],
  'sql-3-22': [
    `Média móvel é uma média que anda junto com a linha: ela usa a linha de agora e as 2 de antes. ROWS BETWEEN 2 PRECEDING AND CURRENT ROW quer dizer "das 2 anteriores até esta".`,
    `Serve para alisar os altos e baixos e enxergar a tendência, em vez de olhar um mês isolado.`,
    `Escreva AVG(valor) OVER (ORDER BY mes ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) e arredonde com ROUND(..., 1).`,
    `3 colunas (mes, valor e media_movel) e 6 linhas. No começo a média usa menos meses, porque ainda não tem 3 (1200, depois 1350...).`],
  'sql-3-23': [
    `Pivot é virar a tabela de lado: valores que estavam em linhas viram colunas. O truque aqui usa o CASE ("se... então...") dentro de um SUM.`,
    `Serve para montar tabelas cruzadas, como uma linha para cada vendedor e uma coluna para cada mês, igual numa planilha.`,
    `Para cada coluna nova, escreva SUM(CASE WHEN mes = '2026-09' THEN valor END) AS setembro, faça o mesmo para outubro e agrupe com GROUP BY vendedor.`,
    `3 colunas (vendedor, setembro e outubro) e 4 linhas, uma por vendedor.`],
  'sql-3-24': [
    `Um relatório de clientes que voltam a comprar: junta JOIN, GROUP BY e HAVING para achar os clientes mais valiosos.`,
    `Serve para descobrir quem comprou mais de uma vez e quanto dinheiro cada um trouxe.`,
    `Junte clientes e pedidos, peneire só os pagos, agrupe pelo nome, conte com COUNT(*), some com SUM(p.valor) e escolha os grupos com HAVING COUNT(*) >= 2.`,
    `3 colunas (nome, qtd e total) e 4 linhas, do maior total (Carla Dias, 1260) para o menor.`],
  'sql-3-25': [
    `COUNT(DISTINCT usuario_id) agrupado por data conta, em cada dia, quantas pessoas DIFERENTES entraram, sem contar a mesma pessoa duas vezes no mesmo dia.`,
    `Serve para medir quantos usuários ativos um app teve por dia. É uma das contas mais usadas em apps e sites de verdade.`,
    `Agrupe por data e conte os usuários diferentes: SELECT data, COUNT(DISTINCT usuario_id) AS usuarios_ativos FROM acessos GROUP BY data ORDER BY data.`,
    `2 colunas (data e usuarios_ativos) e 6 linhas, uma por dia, em ordem de data.`],
  'sql-3-26': [
    `View (CREATE VIEW) é salvar uma consulta com um nome. Depois você usa esse nome como se fosse uma tabela, como um atalho para uma receita que você já escreveu.`,
    `Serve para reaproveitar uma consulta comprida sem escrever tudo de novo, e para entregar aos outros uma "tabela" já pronta.`,
    `Escreva CREATE VIEW dias_por_usuario AS SELECT usuario_id, COUNT(*) AS dias FROM acessos GROUP BY usuario_id; e depois faça um SELECT que junta usuarios com o nome da view.`,
    `2 colunas (nome e dias) e 6 linhas, de quem acessou em mais dias (Carla, 5) para quem acessou em menos.`],
  'sql-3-27': [
    `Índice (CREATE INDEX) é um atalho, como o índice no final de um livro: em vez de ler página por página, você vai direto ao lugar. O resultado da consulta é o mesmo, só fica mais rápido.`,
    `Serve para manter o banco rápido quando a tabela fica enorme e você procura sempre pela mesma coluna.`,
    `Escreva CREATE INDEX idx_acesso_usuario ON acessos(usuario_id); e depois faça a consulta normalmente: SELECT COUNT(*) FROM acessos WHERE usuario_id = 3.`,
    `1 linha e 1 coluna com a contagem: 5 (o usuário 3 acessou 5 vezes).`],
  'sql-3-28': [
    `Aqui você junta função de janela com CTE para achar quem está acima da média do próprio grupo, sem precisar de subconsulta correlacionada.`,
    `Serve para achar os destaques de cada grupo: as vendas que foram melhores que o normal daquele vendedor.`,
    `Calcule a média de cada vendedor com AVG(valor) OVER (PARTITION BY vendedor) AS m dentro de uma CTE e depois peneire do lado de fora com WHERE valor > m.`,
    `3 colunas (vendedor, mes e valor) e 12 linhas: só os meses em que o vendedor vendeu acima da própria média.`],
  'sql-3-29': [
    `Curva ABC: coloca em ordem do maior para o menor e vai somando o percentual do total, para ver onde está a maior parte do resultado.`,
    `Serve para descobrir quem concentra a maior parte das vendas (a famosa regra do 80/20: poucos itens fazem a maior parte do resultado).`,
    `Escreva ROUND(SUM(valor) OVER (ORDER BY valor DESC) * 100.0 / SUM(valor) OVER (), 1) AS pct_acumulado. A primeira soma vai crescendo e a segunda é o total geral.`,
    `3 colunas (vendedor, valor e pct_acumulado) e 4 linhas. O percentual vai subindo até chegar a 100 na última linha.`],
  'sql-3-30': [
    `É o projeto final do nível: um painel de clientes que junta CTE, JOIN e funções de janela no mesmo relatório.`,
    `Serve para treinar o que uma pessoa analista entrega de verdade: o ranking dos clientes e o quanto cada um representa do total.`,
    `Crie a CTE com o total pago de cada cliente (só status 'pago'). Depois use RANK() OVER (ORDER BY total DESC) para a posição e ROUND(total * 100.0 / SUM(total) OVER (), 1) para a participação.`,
    `4 colunas (nome, total, pos e pct) e 5 linhas, da primeira posição (Carla Dias, 1260, 36.8%) até a última.`]
};
