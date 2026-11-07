// SQL INTERMEDIÁRIO — ATIVIDADES ESPECIAIS de cada lição (as duas últimas do círculo; veja lessons.js e tools/check-sp.js):
//   d) DESAFIO NOVO: um problema novo com a mesma ideia da lição, em outra situação (outras tabelas, outro objetivo), escrito do zero;
//   f) CONSERTE O ERRO: um código quase certo com UM erro escondido; o aluno roda, descobre o que está errado e conserta.
// Cada item: task (o que fazer), solution (uma resposta certa), need (palavras que a resposta precisa ter), hint (1ª dica; a 2ª dica é a solução), why (o "para que serve" / "qual era o erro", mostrado depois do acerto).
// O código (solução e erro) não tem acento; os textos para ler podem ter. Para o código do "conserte o erro" ser escrito em linhas, use `bug`.
const { LOJA, RH, CLI, WEB } = require('./seeds');

// Dois bancos novos, só para os desafios (assuntos diferentes dos das lições):
const ESC = `
CREATE TABLE alunos(id INTEGER, nome TEXT, turma TEXT);
INSERT INTO alunos VALUES (1,'Lia','A'),(2,'Davi','A'),(3,'Mara','B'),(4,'Ivo','B'),(5,'Noa','B'),(6,'Cris','A');
CREATE TABLE notas(aluno_id INTEGER, materia TEXT, nota REAL);
INSERT INTO notas VALUES (1,'Matematica',9),(1,'Portugues',8),(2,'Matematica',6),(2,'Portugues',7),(3,'Matematica',10),(3,'Portugues',9),(4,'Matematica',5),(5,'Portugues',4);
`;
const BIB = `
CREATE TABLE livros(id INTEGER, titulo TEXT, autor TEXT, ano INTEGER);
INSERT INTO livros VALUES (1,'Dom Casmurro','Machado',1899),(2,'Iracema','Alencar',1865),(3,'O Cortico','Azevedo',1890),(4,'Vidas Secas','Ramos',1938),(5,'Capitaes da Areia','Amado',1937),(6,'A Hora da Estrela','Lispector',1977);
CREATE TABLE emprestimos(id INTEGER, livro_id INTEGER, leitor TEXT, data TEXT);
INSERT INTO emprestimos VALUES (1,1,'Ana','2026-10-02'),(2,1,'Beto','2026-10-09'),(3,4,'Ana','2026-10-10'),(4,2,'Caio','2026-10-11'),(5,4,'Beto','2026-10-12'),(6,6,'Caio','2026-10-14');
`;
// O código do "conserte o erro" aparece no editor do celular, que não quebra linha: linhas longas escondem o fim. Aqui quebramos (só espaços mudam) em até MAXL letras,
// de preferência antes de uma palavra-chave (ON, AND, WHEN, FROM...) e senão depois de uma vírgula, sem mexer no que está entre aspas.
const MAXL = 36, BRK = /^(ON|WHEN|THEN|ELSE|AND|OR|AS|FROM|WHERE|GROUP|ORDER|VALUES|UNION|EXCEPT|JOIN|LEFT|HAVING|SET)\b/i;
function wrapLine(line, base) {
  if (line.length <= MAXL) return [line];
  const ind = line.match(/^ */)[0]; base ??= ind; let q = false; const cands = [];
  for (let i = 0; i < line.length; i++) { if (line[i] === "'") q = !q; if (!q && line[i] === ' ' && i > ind.length) cands.push(i); }
  const last = a => a.filter(i => i <= MAXL).pop(), at = last(cands.filter(i => BRK.test(line.slice(i + 1)))) ?? last(cands.filter(i => line[i - 1] === ',')) ?? last(cands);
  return at === undefined ? [line] : [line.slice(0, at), ...wrapLine(base + '  ' + line.slice(at + 1), base)];
}
const wrapSql = code => code.split('\n').flatMap(ln => wrapLine(ln)).join('\n');
const D = (task, solution, need, hint, why, seed) => ({ task, solution, need, hint, why, ...(seed ? { seed } : {}) });
const F = (task, bug, solution, need, hint, why, seed) => ({ task, bug: wrapSql(bug), solution, need, hint, why, ...(seed ? { seed } : {}) });
const SP = {};

SP['sql-2-01'] = {
  d: D("O site quer um registro de atividade: mostre o nome do usuário e a data de cada acesso (junte as tabelas usuarios e acessos).",
    "SELECT usuarios.nome, acessos.data FROM acessos JOIN usuarios ON usuarios.id = acessos.usuario_id", ['join', 'on'],
    "O nome está em usuarios e a data está em acessos. O que liga as duas é o id do usuário: acessos.usuario_id.",
    "O JOIN serve para juntar informações que ficam em tabelas diferentes. Aqui o nome da pessoa está em `usuarios` e a data de cada acesso está em `acessos`; o ON diz como elas se ligam (`usuarios.id = acessos.usuario_id`). Sempre que o que você quer mostrar está espalhado em mais de uma tabela, é hora de usar JOIN.", WEB),
  f: F("Este código deveria mostrar o nome do cliente e o valor de cada pedido, mas o resultado está estranho: tem pedidos de menos e nomes trocados. Rode, ache o erro e conserte.",
    `SELECT clientes.nome, pedidos.valor
FROM pedidos
JOIN clientes ON clientes.id = pedidos.id`,
    "SELECT clientes.nome, pedidos.valor FROM pedidos JOIN clientes ON clientes.id = pedidos.cliente_id", ['join', 'on'],
    "Olhe o ON: ele precisa ligar o id do cliente com a coluna do pedido que guarda qual cliente fez o pedido. Será que é essa coluna que está lá?",
    "O erro estava no ON: ele comparava `clientes.id` com `pedidos.id` (o número do próprio pedido), que não tem nada a ver com o cliente. A ligação certa é com `pedidos.cliente_id`, a coluna que guarda qual cliente fez o pedido. Ligar pela coluna errada não dá erro: o SQL só junta linhas erradas. Por isso é bom sempre conferir o resultado.", CLI)
};
SP['sql-2-02'] = {
  d: D("Mostre o nome de cada funcionário, o cargo e a cidade do departamento dele. Use os apelidos f (funcionarios) e d (departamentos) em todas as colunas.",
    "SELECT f.nome, f.cargo, d.cidade FROM funcionarios f JOIN departamentos d ON d.id = f.depto_id", ['join', 'f.nome', 'd.cidade'],
    "Depois do nome de cada tabela escreva o apelido (funcionarios f) e use f. e d. antes das colunas.",
    "Apelidos deixam a consulta curta e mostram de qual tabela vem cada coluna: `f.nome` é o nome do funcionário e `d.cidade` é a cidade do departamento. Em consultas com JOIN isso evita confusão, principalmente quando as duas tabelas têm colunas com o mesmo nome (aqui as duas têm id e nome).", RH),
  f: F("Este código deveria mostrar o nome do cliente e o valor de cada pedido usando os apelidos c e p, mas dá erro. Rode, leia a mensagem, ache o erro e conserte.",
    `SELECT c.nome, p.valor
FROM clientes c
JOIN pedidos p ON c.id = pedido.cliente_id`,
    "SELECT c.nome, p.valor FROM clientes c JOIN pedidos p ON c.id = p.cliente_id", ['join', 'c.nome', 'p.valor'],
    "A mensagem de erro cita um nome que não existe na consulta. Que apelido você deu para a tabela pedidos?",
    "O erro era `pedido.cliente_id`: a tabela pedidos ganhou o apelido `p`, então depois de dar o apelido só ele vale. Quem cria um apelido precisa usá-lo em todos os lugares (SELECT, ON, WHERE...). Usar o nome antigo, ou um nome parecido, faz o SQL dizer que a coluna não existe.", CLI)
};
SP['sql-2-03'] = {
  d: D("O time comercial quer ver quanto os clientes de São Paulo (estado = 'SP') pagaram: mostre o nome do cliente e o valor dos pedidos com status 'pago' feitos por esses clientes.",
    "SELECT c.nome, p.valor FROM clientes c JOIN pedidos p ON p.cliente_id = c.id WHERE c.estado = 'SP' AND p.status = 'pago'", ['join', 'where'],
    "Primeiro junte clientes e pedidos. Depois, no WHERE, use as duas condições ligadas por AND: uma sobre o estado e outra sobre o status.",
    "Depois do JOIN o WHERE funciona normalmente e pode usar colunas das duas tabelas: aqui `c.estado` vem de clientes e `p.status` vem de pedidos. Isso permite filtrar o resultado juntado com informações de qualquer lado, como 'só os pedidos pagos de quem mora em SP'.", CLI),
  f: F("Este código deveria mostrar o nome do funcionário e o nome do departamento só de quem trabalha em Recife, mas dá erro. Rode, ache o erro e conserte.",
    `SELECT f.nome, d.nome
FROM funcionarios f
WHERE d.cidade = 'Recife'
JOIN departamentos d ON d.id = f.depto_id`,
    "SELECT f.nome, d.nome FROM funcionarios f JOIN departamentos d ON d.id = f.depto_id WHERE d.cidade = 'Recife'", ['join', 'where'],
    "O SQL é exigente com a ordem das partes da consulta. Qual vem primeiro: o JOIN ou o WHERE?",
    "O erro era a ordem: o WHERE estava antes do JOIN. No SQL as partes têm uma ordem fixa: SELECT, FROM, JOIN, WHERE, GROUP BY, ORDER BY. Primeiro você monta a tabela juntada (FROM + JOIN) e só depois filtra as linhas com o WHERE.", RH)
};
SP['sql-2-04'] = {
  d: D("Mostre o nome do departamento, o nome do funcionário e o salário de todos, do maior salário para o menor.",
    "SELECT d.nome, f.nome, f.salario FROM funcionarios f JOIN departamentos d ON d.id = f.depto_id ORDER BY f.salario DESC", ['join', 'order by', 'desc'],
    "O ORDER BY pode usar a coluna de qualquer tabela do JOIN. Para ir do maior para o menor, termine com DESC.",
    "O ORDER BY funciona depois do JOIN e pode usar colunas de qualquer uma das tabelas. Assim você ordena pelo que importa (aqui, o salário) mesmo mostrando também dados de outra tabela (o departamento). O DESC inverte a ordem: do maior para o menor.", RH),
  f: F("Este código deveria mostrar o nome do cliente, a data e o valor dos pedidos, do pedido mais recente para o mais antigo, mas a ordem saiu invertida. Rode, ache o erro e conserte.",
    `SELECT c.nome, p.data, p.valor
FROM pedidos p
JOIN clientes c ON c.id = p.cliente_id
ORDER BY p.data`,
    "SELECT c.nome, p.data, p.valor FROM pedidos p JOIN clientes c ON c.id = p.cliente_id ORDER BY p.data DESC", ['join', 'order by'],
    "Confira a ordem das datas no resultado: a mais recente precisa vir primeiro. O que falta no ORDER BY?",
    "Sem nada depois da coluna, o ORDER BY ordena do menor para o maior (ASC), então as datas mais antigas vinham primeiro. Para o mais recente primeiro é preciso escrever `DESC`. Datas no formato ano-mês-dia ordenam certo, até como texto.", CLI)
};
SP['sql-2-05'] = {
  d: D("A biblioteca quer saber quais livros são os mais procurados: mostre o título de cada livro que já foi emprestado e quantas vezes ele foi emprestado (apelido emprestimos). Livros que nunca saíram não precisam aparecer.",
    "SELECT l.titulo, COUNT(*) AS emprestimos FROM emprestimos e JOIN livros l ON l.id = e.livro_id GROUP BY l.titulo", ['join', 'group by', 'count'],
    "Junte emprestimos com livros e agrupe pelo título. O COUNT(*) conta quantas linhas (empréstimos) cada título tem.",
    "O JOIN traz o título (que está em `livros`) para junto de cada empréstimo, e o GROUP BY junta as linhas do mesmo livro para o `COUNT(*)` contar. Juntar e depois agrupar é a receita para resumos como 'quantas vezes', 'quanto no total' ou 'qual a média' de cada coisa, mostrando o nome em vez do número do id.", BIB),
  f: F("Este código deveria mostrar o nome de cada departamento e a soma dos salários dele, mas só aparece uma linha. Rode, ache o erro e conserte.",
    `SELECT d.nome, SUM(f.salario)
FROM funcionarios f
JOIN departamentos d ON d.id = f.depto_id`,
    "SELECT d.nome, SUM(f.salario) FROM funcionarios f JOIN departamentos d ON d.id = f.depto_id GROUP BY d.nome", ['join', 'sum'],
    "Você quer um resultado para cada departamento. Falta dizer ao SQL como separar as linhas em grupos.",
    "Faltava o `GROUP BY d.nome`. Sem ele o SUM soma todos os salários da empresa de uma vez e o SQL mostra uma linha só (com um nome qualquer). Com `GROUP BY d.nome` as linhas são separadas por departamento e o SUM é calculado dentro de cada grupo.", RH)
};
SP['sql-2-06'] = {
  d: D("Quanto cada departamento custa por ano? Mostre o nome do departamento e o custo anual dele (SUM de salario * 12) com o apelido custo_anual, do maior para o menor.",
    "SELECT d.nome, SUM(f.salario * 12) AS custo_anual FROM funcionarios f JOIN departamentos d ON d.id = f.depto_id GROUP BY d.nome ORDER BY custo_anual DESC", ['join', 'group by', 'sum', 'custo_anual'],
    "A conta salario * 12 entra dentro do SUM(...). Dê o apelido com AS e use esse apelido no ORDER BY.",
    "Dentro do SUM você pode fazer contas com colunas: `SUM(f.salario * 12)` calcula cada linha e soma tudo por grupo. É a mesma ideia de 'receita = preço × quantidade', só que em outro assunto: sempre que o valor que você quer somar precisa de uma conta antes (por 12 meses, por quantidade, por imposto), faça a conta dentro do SUM.", RH),
  f: F("Este código deveria mostrar a categoria e a receita dela (preço × quantidade de cada venda, somados), da maior para a menor, mas os valores estão altos demais. Rode, ache o erro e conserte.",
    `SELECT p.categoria, SUM(p.preco) * SUM(v.qtd) AS receita
FROM vendas v
JOIN produtos p ON p.id = v.produto_id
GROUP BY p.categoria
ORDER BY receita DESC`,
    "SELECT p.categoria, SUM(p.preco * v.qtd) AS receita FROM vendas v JOIN produtos p ON p.id = v.produto_id GROUP BY p.categoria ORDER BY receita DESC", ['join', 'group by', 'sum'],
    "Compare os números com o resultado esperado. A multiplicação preço × quantidade precisa acontecer venda por venda, antes de somar.",
    "O erro era somar tudo e só depois multiplicar: `SUM(preco) * SUM(qtd)` multiplica o total dos preços pelo total das quantidades, misturando vendas diferentes. O certo é multiplicar em cada venda e somar os resultados: `SUM(preco * qtd)`. A ordem das operações muda o número!", LOJA)
};
SP['sql-2-07'] = {
  d: D("A empresa quer a lista de todos os departamentos com os funcionários de cada um, inclusive o departamento que ainda não tem ninguém (esse deve aparecer com o nome do funcionário NULL). Mostre o nome do departamento e o nome do funcionário.",
    "SELECT d.nome, f.nome FROM departamentos d LEFT JOIN funcionarios f ON f.depto_id = d.id", ['left join'],
    "A tabela que não pode perder linhas é a da esquerda (a que vem logo depois do FROM). Qual tabela precisa aparecer inteira?",
    "O LEFT JOIN mantém todas as linhas da tabela da esquerda, mesmo quando não existe par na da direita (as colunas dela vêm como NULL). Use quando a pergunta é sobre 'todos os X, tenham ou não Y': aqui, todos os departamentos, tenham ou não funcionários. Com um JOIN comum, o departamento vazio sumiria.", RH),
  f: F("Este código deveria mostrar todos os clientes com o valor dos pedidos deles, inclusive quem nunca comprou (valor NULL), mas um cliente está faltando. Rode, ache o erro e conserte.",
    `SELECT c.nome, p.valor
FROM pedidos p
LEFT JOIN clientes c ON c.id = p.cliente_id`,
    "SELECT c.nome, p.valor FROM clientes c LEFT JOIN pedidos p ON p.cliente_id = c.id", ['left join'],
    "Veja quem está faltando no resultado. O LEFT JOIN protege a tabela que vem ANTES dele. Essa é a tabela certa?",
    "O erro era a ordem das tabelas: com `FROM pedidos LEFT JOIN clientes`, quem é protegido é a tabela pedidos (todos os pedidos aparecem), e o cliente sem pedido some. Para ver todos os clientes, a tabela clientes precisa ficar à esquerda: `FROM clientes LEFT JOIN pedidos`.", CLI)
};
SP['sql-2-08'] = {
  d: D("Quais departamentos ainda não têm nenhum funcionário? Liste o nome desses departamentos.",
    "SELECT d.nome FROM departamentos d LEFT JOIN funcionarios f ON f.depto_id = d.id WHERE f.id IS NULL", ['left join', 'is null'],
    "Faça um LEFT JOIN de departamentos com funcionarios e fique só com as linhas em que o funcionário veio NULL.",
    "`LEFT JOIN` + `IS NULL` responde 'quem não tem par': o LEFT JOIN mantém todos os departamentos e, para os que não têm funcionário, as colunas de funcionarios vêm NULL. O `WHERE f.id IS NULL` deixa só esses. É o jeito de achar o que 'não aconteceu': clientes sem compra, produtos sem venda, departamentos vazios.", RH),
  f: F("Este código deveria listar o nome e a cidade dos clientes que nunca fizeram um pedido, mas não aparece nenhuma linha. Rode, ache o erro e conserte.",
    `SELECT c.nome, c.cidade
FROM clientes c
LEFT JOIN pedidos p ON p.cliente_id = c.id
WHERE p.id = NULL`,
    "SELECT c.nome, c.cidade FROM clientes c LEFT JOIN pedidos p ON p.cliente_id = c.id WHERE p.id IS NULL", ['left join'],
    "Comparar com NULL usando o sinal de = nunca funciona. Existe uma expressão própria para testar se algo é NULL.",
    "O erro era `p.id = NULL`. NULL significa 'sem valor', e nenhuma comparação com `=` (ou `<>`) é verdadeira para NULL, então o WHERE não deixava passar linha nenhuma. Para testar se está vazio, use `IS NULL` (e `IS NOT NULL` para o contrário).", CLI)
};
SP['sql-2-09'] = {
  d: D("Mostre o nome do cliente (apelido cliente), a cidade dele e o valor de cada pedido (apelido valor_pedido).",
    "SELECT c.nome AS cliente, c.cidade, p.valor AS valor_pedido FROM clientes c JOIN pedidos p ON p.cliente_id = c.id", ['join', 'cliente', 'valor_pedido'],
    "Use AS depois de cada coluna que precisa de apelido, por exemplo: c.nome AS cliente.",
    "Em um JOIN é comum duas tabelas terem colunas com o mesmo nome (como `id` e `nome`). O apelido de coluna (`AS`) deixa o resultado claro: `cliente` e `valor_pedido` dizem exatamente o que cada coluna é. Quem lê o resultado depois (um relatório, um gráfico) agradece.", CLI),
  f: F("Este código deveria mostrar o nome de cada funcionário (apelido funcionario) e o nome do departamento dele (apelido departamento), mas dá erro. Rode, leia a mensagem, ache o erro e conserte.",
    `SELECT nome AS funcionario, nome AS departamento
FROM funcionarios f
JOIN departamentos d ON d.id = f.depto_id`,
    "SELECT f.nome AS funcionario, d.nome AS departamento FROM funcionarios f JOIN departamentos d ON d.id = f.depto_id", ['join', 'funcionario', 'departamento'],
    "As duas tabelas têm uma coluna chamada nome. O SQL precisa saber de qual tabela você quer cada uma.",
    "O erro era 'ambiguous column name: nome' (nome ambíguo): as duas tabelas têm uma coluna `nome` e o SQL não sabe qual escolher. A solução é dizer de qual tabela vem cada coluna (`f.nome` e `d.nome`) e usar `AS` para dar um apelido claro a cada uma.", RH)
};
SP['sql-2-10'] = {
  d: D("A escola quer ver o desempenho dos alunos: mostre o nome de cada aluno e a média das notas dele (apelido media), da maior média para a menor. Aluno sem nota não precisa aparecer.",
    "SELECT a.nome, AVG(n.nota) AS media FROM alunos a JOIN notas n ON n.aluno_id = a.id GROUP BY a.nome ORDER BY media DESC", ['join', 'group by', 'avg', 'order by'],
    "Junte alunos e notas, agrupe pelo nome do aluno e use AVG(n.nota). Ordene pelo apelido, do maior para o menor.",
    "O `AVG` calcula a média de cada grupo. Com JOIN + GROUP BY você tira a média por aluno, por departamento, por cidade... sempre que a pergunta é 'qual a média de cada X'. O `ORDER BY ... DESC` coloca o melhor primeiro.", ESC),
  f: F("Este código deveria mostrar a cidade e o valor médio dos pedidos dos clientes de cada cidade, da maior média para a menor, mas dá erro. Rode, leia a mensagem, ache o erro e conserte.",
    `SELECT c.cidade, AVG(c.valor) AS media
FROM clientes c
JOIN pedidos p ON p.cliente_id = c.id
GROUP BY c.cidade
ORDER BY media DESC`,
    "SELECT c.cidade, AVG(p.valor) AS media FROM clientes c JOIN pedidos p ON p.cliente_id = c.id GROUP BY c.cidade ORDER BY media DESC", ['join', 'group by', 'avg'],
    "A mensagem diz que uma coluna não existe. Em qual tabela fica a coluna valor?",
    "O erro era `AVG(c.valor)`: o valor do pedido fica na tabela pedidos (apelido `p`), não em clientes (`c`). Com JOIN, sempre confira de qual tabela cada coluna vem: o prefixo antes do ponto precisa ser a tabela que realmente tem a coluna.", CLI)
};

SP['sql-2-11'] = {
  d: D("Quem são os clientes mais valiosos? Mostre o nome e o total gasto (apelido total, somando todos os pedidos) apenas dos clientes que gastaram mais de 800 no total.",
    "SELECT c.nome, SUM(p.valor) AS total FROM clientes c JOIN pedidos p ON p.cliente_id = c.id GROUP BY c.nome HAVING SUM(p.valor) > 800", ['group by', 'having', 'sum'],
    "O filtro é sobre o total de cada cliente, que só existe depois do GROUP BY. Esse tipo de filtro vai no HAVING.",
    "O WHERE filtra linhas antes de agrupar; o `HAVING` filtra os grupos depois que o SUM, o COUNT ou o AVG foram calculados. Quando a condição fala do total de cada cliente (ou da contagem de cada departamento), ela só pode ser avaliada depois de agrupar, então o lugar dela é o HAVING.", CLI),
  f: F("Este código deveria mostrar as categorias que têm mais de 3 produtos, com a quantidade (apelido total), mas dá erro. Rode, leia a mensagem, ache o erro e conserte.",
    `SELECT categoria, COUNT(*) AS total
FROM produtos
WHERE COUNT(*) > 3
GROUP BY categoria`,
    "SELECT categoria, COUNT(*) AS total FROM produtos GROUP BY categoria HAVING COUNT(*) > 3", ['group by', 'count'],
    "A mensagem fala em 'misuse of aggregate' (uso errado de uma função de agrupamento). O WHERE consegue enxergar o COUNT(*) de cada grupo?",
    "O erro era usar `COUNT(*)` dentro do WHERE. O WHERE roda antes do agrupamento, quando os grupos ainda não existem, então não dá para contar nada ali. Condições sobre COUNT, SUM, AVG... vão no `HAVING`, depois do GROUP BY.", LOJA)
};
SP['sql-2-12'] = {
  d: D("Quais produtos mais saíram em outubro de 2026? Mostre o nome do produto e a quantidade total vendida (apelido total) só nas vendas com data a partir de '2026-10-01', da maior quantidade para a menor.",
    "SELECT p.nome, SUM(v.qtd) AS total FROM vendas v JOIN produtos p ON p.id = v.produto_id WHERE v.data >= '2026-10-01' GROUP BY p.nome ORDER BY total DESC", ['join', 'where', 'group by'],
    "O WHERE vem antes do GROUP BY: ele escolhe as vendas de outubro e só depois o SUM soma cada produto.",
    "Quando você quer somar só um pedaço dos dados (um mês, um status, uma região), o filtro vai no WHERE: ele descarta as linhas antes de o GROUP BY formar os grupos e o SUM calcular. Essa é a ordem de um resumo completo: JOIN junta, WHERE filtra, GROUP BY agrupa, SUM calcula e ORDER BY ordena.", LOJA),
  f: F("Este código deveria mostrar a cidade e o total dos pedidos pagos (status 'pago') dos clientes de cada cidade, mas não aparece nenhuma linha. Rode, ache o erro e conserte.",
    `SELECT c.cidade, SUM(p.valor) AS total
FROM clientes c
JOIN pedidos p ON p.cliente_id = c.id
WHERE p.status = 'Pago'
GROUP BY c.cidade`,
    "SELECT c.cidade, SUM(p.valor) AS total FROM clientes c JOIN pedidos p ON p.cliente_id = c.id WHERE p.status = 'pago' GROUP BY c.cidade", ['join', 'where', 'group by'],
    "O filtro parece certo, mas nenhuma linha passa por ele. Confira o texto entre aspas: ele é igual ao que está guardado na tabela?",
    "O erro era o texto `'Pago'`: na tabela o status está escrito `'pago'`, tudo em minúsculas. Para o SQL, textos com maiúsculas diferentes são valores diferentes, então nenhuma linha passava pelo WHERE. Antes de filtrar por um texto, olhe como ele está escrito nos dados (o botão Dados ajuda).", CLI)
};
SP['sql-2-13'] = {
  d: D("Quais livros da biblioteca nunca foram emprestados? Liste o título desses livros.",
    "SELECT l.titulo FROM livros l LEFT JOIN emprestimos e ON e.livro_id = l.id WHERE e.id IS NULL", ['left join', 'is null'],
    "Junte livros com emprestimos usando LEFT JOIN e fique só com os livros em que o empréstimo veio NULL.",
    "É o mesmo padrão de 'clientes sem pedido', numa situação nova: `LEFT JOIN` para manter todos os livros e `IS NULL` para ficar só com os que não têm nenhum empréstimo. Esse padrão serve sempre que você quer achar quem ficou de fora: alunos sem nota, produtos sem venda, usuários que nunca entraram.", BIB),
  f: F("Este código deveria listar os alunos que ainda não têm nenhuma nota, mas não aparece ninguém. Rode, ache o erro e conserte.",
    `SELECT a.nome
FROM alunos a
LEFT JOIN notas n ON n.aluno_id = a.id
WHERE a.id IS NULL`,
    "SELECT a.nome FROM alunos a LEFT JOIN notas n ON n.aluno_id = a.id WHERE n.aluno_id IS NULL", ['left join'],
    "Qual coluna fica NULL para um aluno sem nota: a da tabela de alunos ou a da tabela de notas?",
    "O erro era testar `a.id IS NULL`: o id do aluno nunca é NULL, ele sempre existe. Quem fica NULL, quando não há par no LEFT JOIN, são as colunas da tabela da direita (notas). O teste certo é `n.aluno_id IS NULL`.", ESC)
};
SP['sql-2-14'] = {
  d: D("Quem ganha mais que a média da empresa? Liste o nome e o salário dos funcionários com salário maior que a média de todos os salários (use uma subconsulta).",
    "SELECT nome, salario FROM funcionarios WHERE salario > (SELECT AVG(salario) FROM funcionarios)", ['(select avg'],
    "A subconsulta calcula a média: (SELECT AVG(salario) FROM funcionarios). Use ela dentro do WHERE como se fosse um número.",
    "Uma subconsulta entre parênteses devolve um valor que o WHERE usa para comparar. Assim você compara cada linha com um número que ainda não conhecia (a média, o maior valor, a data mais recente) sem precisar calcular antes e digitar à mão. Se os salários mudarem, a consulta continua certa.", RH),
  f: F("Este código deveria listar o id e o valor dos pedidos acima do valor médio dos pedidos, mas não aparece nenhuma linha. Rode, ache o erro e conserte.",
    `SELECT id, valor
FROM pedidos
WHERE valor > (SELECT SUM(valor) FROM pedidos)`,
    "SELECT id, valor FROM pedidos WHERE valor > (SELECT AVG(valor) FROM pedidos)", ['(select'],
    "Nenhum pedido passa por um filtro que compara com o TOTAL de todos os pedidos. Qual função calcula a média?",
    "O erro era `SUM` no lugar de `AVG`: a subconsulta devolvia a soma de todos os pedidos, que é maior que qualquer pedido sozinho, então nenhum passava no filtro. Para a média a função é `AVG`. Quando um filtro devolve nada (ou tudo), confira primeiro o valor que a subconsulta devolve.", CLI)
};
SP['sql-2-15'] = {
  d: D("Quais clientes já pagaram algum pedido? Liste o nome dos clientes que têm pelo menos um pedido com status 'pago' (use IN com uma subconsulta).",
    "SELECT nome FROM clientes WHERE id IN (SELECT cliente_id FROM pedidos WHERE status = 'pago')", ['in (select'],
    "A subconsulta devolve a lista dos cliente_id dos pedidos pagos. O IN confere se o id do cliente está nessa lista.",
    "O `IN` com subconsulta confere se o valor está numa lista que o próprio banco monta. Aqui a lista é 'os ids de quem tem pedido pago'. Isso evita juntar tabelas quando você só quer filtrar uma tabela usando informação de outra, e não repete o cliente que tem vários pedidos.", CLI),
  f: F("Este código deveria listar o nome dos clientes que têm algum pedido cancelado, mas apareceu a pessoa errada. Rode, ache o erro e conserte.",
    `SELECT nome
FROM clientes
WHERE id IN (SELECT id FROM pedidos WHERE status = 'cancelado')`,
    "SELECT nome FROM clientes WHERE id IN (SELECT cliente_id FROM pedidos WHERE status = 'cancelado')", ['in (select'],
    "A lista da subconsulta precisa ter ids de CLIENTES. A coluna id da tabela pedidos é o número de quê?",
    "O erro era a coluna da subconsulta: `SELECT id FROM pedidos` devolve o número do pedido, não o do cliente, e o IN comparava o id do cliente com números de pedidos (que só coincidiam por acaso). A subconsulta precisa devolver a mesma coisa que está sendo comparada: `SELECT cliente_id FROM pedidos ...`.", CLI)
};
SP['sql-2-16'] = {
  d: D("Calcule o salário médio de cada departamento (depto_id) numa subconsulta e mostre só os departamentos com média acima de 6000 (colunas depto_id e media).",
    "SELECT depto_id, media FROM (SELECT depto_id, AVG(salario) AS media FROM funcionarios GROUP BY depto_id) AS t WHERE media > 6000", ['from (select', 'where'],
    "A subconsulta no FROM vira uma tabelinha com depto_id e media. Depois o WHERE de fora filtra essa tabelinha.",
    "Uma subconsulta no FROM funciona como uma tabela temporária: você primeiro calcula um resumo (a média de cada departamento) e depois consulta esse resumo como se fosse uma tabela, filtrando pelo resultado do cálculo. É útil quando o filtro depende de um número que só existe depois de agrupar.", RH),
  f: F("Este código deveria somar os pedidos de cada cliente (cliente_id) numa subconsulta e mostrar só quem gastou mais de 800 (colunas cliente_id e total), mas dá erro. Rode, leia a mensagem, ache o erro e conserte.",
    `SELECT cliente_id, total
FROM (SELECT cliente_id, SUM(valor) FROM pedidos GROUP BY cliente_id) AS t
WHERE total > 800`,
    "SELECT cliente_id, total FROM (SELECT cliente_id, SUM(valor) AS total FROM pedidos GROUP BY cliente_id) AS t WHERE total > 800", ['from (select', 'where'],
    "A mensagem diz que a coluna total não existe. Que nome tem a coluna que o SUM criou dentro da subconsulta?",
    "O erro era que o `SUM(valor)` da subconsulta não tinha apelido, então a tabelinha não tinha nenhuma coluna chamada `total` para o SELECT e o WHERE de fora usarem. Dentro de uma subconsulta no FROM, tudo o que será usado lá fora precisa de um nome: dê `AS total` aos cálculos.", CLI)
};
SP['sql-2-17'] = {
  d: D("Liste num só resultado o nome dos funcionários do departamento 2 (depto_id = 2) e o nome de quem ganha mais de 8000. Quem se encaixa nas duas regras deve aparecer uma vez só (use UNION entre dois SELECT).",
    "SELECT nome FROM funcionarios WHERE depto_id = 2 UNION SELECT nome FROM funcionarios WHERE salario > 8000", ['union'],
    "Escreva um SELECT para cada regra e ligue os dois com UNION. O UNION já tira os nomes repetidos.",
    "O `UNION` junta o resultado de dois SELECT em uma lista só e remove as linhas repetidas. Serve quando você tem duas regras diferentes para escolher pessoas (ou produtos, clientes...) e quer uma lista única, sem repetir quem cai nas duas. (O `UNION ALL` mantém as repetidas.)", RH),
  f: F("Este código deveria listar, numa lista só, as cidades dos clientes cadastrados antes de 2026 e as cidades dos clientes do estado PR, mas dá erro. Rode, leia a mensagem, ache o erro e conserte.",
    `SELECT cidade FROM clientes WHERE cadastro < '2026-01-01'
UNION
SELECT cidade, estado FROM clientes WHERE estado = 'PR'`,
    "SELECT cidade FROM clientes WHERE cadastro < '2026-01-01' UNION SELECT cidade FROM clientes WHERE estado = 'PR'", ['union'],
    "A mensagem fala do número de colunas. Os dois SELECT precisam devolver a mesma quantidade de colunas.",
    "O erro era que o segundo SELECT trazia duas colunas (`cidade, estado`) e o primeiro só uma. No UNION (e no EXCEPT) os dois SELECT precisam ter o mesmo número de colunas, na mesma ordem e com o mesmo tipo de dado, porque as linhas vão ser empilhadas numa tabela só.", CLI)
};
SP['sql-2-18'] = {
  d: D("Quem acessou o site em 2026-10-01 mas não voltou em 2026-10-02? Liste o usuario_id dessas pessoas usando EXCEPT entre dois SELECT da tabela acessos.",
    "SELECT usuario_id FROM acessos WHERE data = '2026-10-01' EXCEPT SELECT usuario_id FROM acessos WHERE data = '2026-10-02'", ['except'],
    "O primeiro SELECT traz quem acessou em 2026-10-01; o segundo, quem acessou em 2026-10-02. O EXCEPT deixa o que está no primeiro e não está no segundo.",
    "O `EXCEPT` devolve o que está no primeiro resultado e não aparece no segundo: 'estava aqui, mas não está lá'. É ótimo para comparar dois momentos (quem veio ontem e não veio hoje), duas listas (inscritos que não pagaram) ou dois períodos.", WEB),
  f: F("Este código deveria listar quem acessou o site em 2026-10-03 mas não voltou em 2026-10-04, mas o resultado está errado. Rode, ache o erro e conserte.",
    `SELECT usuario_id FROM acessos WHERE data = '2026-10-04'
EXCEPT
SELECT usuario_id FROM acessos WHERE data = '2026-10-03'`,
    "SELECT usuario_id FROM acessos WHERE data = '2026-10-03' EXCEPT SELECT usuario_id FROM acessos WHERE data = '2026-10-04'", ['except'],
    "Compare com o resultado esperado. O EXCEPT guarda o que está no PRIMEIRO SELECT e não está no segundo: a ordem importa.",
    "O erro era a ordem dos SELECT: o EXCEPT não é simétrico. `A EXCEPT B` traz o que tem em A e não tem em B; trocar os lados responde outra pergunta (quem acessou em 10-04 e não em 10-03). Pense assim: o que eu quero manter vem primeiro.", WEB)
};
SP['sql-2-19'] = {
  d: D("Classifique os funcionários pelo salário: mostre o nome e uma coluna faixa com 'alto' se salario >= 9000, 'medio' se salario >= 5000 e 'baixo' nos outros casos (inclusive quando o salário é NULL).",
    "SELECT nome, CASE WHEN salario >= 9000 THEN 'alto' WHEN salario >= 5000 THEN 'medio' ELSE 'baixo' END AS faixa FROM funcionarios", ['case', 'when', 'end'],
    "O CASE confere as regras em ordem. Comece pela faixa mais alta e deixe o ELSE para todos os outros casos.",
    "O `CASE WHEN` cria uma coluna nova com uma regra 'se... então...' para cada linha. Ele confere as condições de cima para baixo e usa a primeira que for verdadeira; o `ELSE` cuida de todo o resto (até do NULL). É a ferramenta para transformar números em categorias que as pessoas entendem, como faixas de salário, de preço ou de idade.", RH),
  f: F("Este código deveria classificar cada pedido: 'alto' se valor >= 500, 'medio' se valor >= 100 e 'baixo' nos outros casos. Mas nenhum pedido sai como 'alto'. Rode, ache o erro e conserte.",
    `SELECT id,
  CASE
    WHEN valor >= 100 THEN 'medio'
    WHEN valor >= 500 THEN 'alto'
    ELSE 'baixo'
  END AS faixa
FROM pedidos`,
    "SELECT id, CASE WHEN valor >= 500 THEN 'alto' WHEN valor >= 100 THEN 'medio' ELSE 'baixo' END AS faixa FROM pedidos", ['case', 'when', 'end'],
    "O CASE para na primeira condição que for verdadeira. Um pedido de 900 cai em qual WHEN primeiro?",
    "O erro era a ordem das regras. O CASE confere de cima para baixo e para na primeira verdadeira: um pedido de 900 já era `>= 100`, então virava 'medio' e nunca chegava à regra do 'alto'. Em faixas, escreva sempre da condição mais exigente para a menos exigente.", CLI)
};
SP['sql-2-20'] = {
  d: D("Conte quantos pedidos há em cada faixa de valor: 'grande' (valor >= 500), 'medio' (valor >= 100) ou 'pequeno' nos outros casos. Mostre as colunas faixa e total.",
    "SELECT CASE WHEN valor >= 500 THEN 'grande' WHEN valor >= 100 THEN 'medio' ELSE 'pequeno' END AS faixa, COUNT(*) AS total FROM pedidos GROUP BY faixa", ['case', 'group by'],
    "Crie a faixa com CASE na lista do SELECT, dê o apelido faixa e agrupe por ele com GROUP BY faixa.",
    "Juntar `CASE` e `GROUP BY` transforma números em categorias e depois conta ou soma cada categoria, a base de muitos relatórios (clientes por faixa de gasto, vendas por faixa de preço, notas por conceito). Primeiro o CASE cria a faixa em cada linha; depois o GROUP BY agrupa por ela.", CLI),
  f: F("Este código deveria contar quantos funcionários há em cada faixa salarial ('alto' a partir de 9000, 'medio' a partir de 5000 e 'baixo' nos outros casos), mas aparecem faixas repetidas e contagens 1. Rode, ache o erro e conserte.",
    `SELECT
  CASE
    WHEN salario >= 9000 THEN 'alto'
    WHEN salario >= 5000 THEN 'medio'
    ELSE 'baixo'
  END AS faixa,
  COUNT(*) AS total
FROM funcionarios
GROUP BY salario`,
    "SELECT CASE WHEN salario >= 9000 THEN 'alto' WHEN salario >= 5000 THEN 'medio' ELSE 'baixo' END AS faixa, COUNT(*) AS total FROM funcionarios GROUP BY faixa", ['case', 'group by'],
    "Cada salário diferente virou um grupo. O que deveria ser o grupo: o salário ou a faixa?",
    "O erro era `GROUP BY salario`: cada salário diferente formava um grupo próprio, então a contagem era 1 e as faixas se repetiam. Para contar por faixa é preciso agrupar pela própria faixa: `GROUP BY faixa`.", RH)
};

SP['sql-2-21'] = {
  d: D("Quanto cada departamento gasta com salários? Mostre o nome do departamento e a soma dos salários (apelido folha), com 0 no departamento que não tem ninguém. Todos os departamentos devem aparecer.",
    "SELECT d.nome, COALESCE(SUM(f.salario), 0) AS folha FROM departamentos d LEFT JOIN funcionarios f ON f.depto_id = d.id GROUP BY d.nome", ['coalesce', 'left join'],
    "O LEFT JOIN mantém o departamento vazio, mas a soma dele vem NULL. Envolva o SUM com COALESCE(..., 0).",
    "O `COALESCE` devolve o primeiro valor que não é NULL, então `COALESCE(x, 0)` troca 'sem valor' por 0. Isso evita buracos em relatórios e contas: um NULL numa soma ou num cálculo faz o resultado inteiro virar NULL. Aqui, o departamento sem funcionários mostra 0 de folha em vez de ficar vazio.", RH),
  f: F("Este código deveria mostrar o nome e o salário de cada funcionário, trocando o salário NULL por 1000 (apelido salario_ok), mas todo mundo aparece com 1000. Rode, ache o erro e conserte.",
    `SELECT nome, COALESCE(1000, salario) AS salario_ok
FROM funcionarios`,
    "SELECT nome, COALESCE(salario, 1000) AS salario_ok FROM funcionarios", ['coalesce'],
    "O COALESCE devolve o primeiro valor da lista que não for NULL. Qual valor precisa vir primeiro?",
    "O erro era a ordem dos valores. `COALESCE(1000, salario)` devolve o primeiro que não é NULL, e o 1000 nunca é NULL, então ele sempre ganhava. O valor que você quer manter vem primeiro e o 'plano B' (o valor de reserva) vem depois: `COALESCE(salario, 1000)`.", RH)
};
SP['sql-2-22'] = {
  d: D("Monte o contato de cada cliente numa coluna só, no formato 'Nome - Cidade/UF' (por exemplo: Ana Souza - Sao Paulo/SP). Use o apelido contato.",
    "SELECT nome || ' - ' || cidade || '/' || estado AS contato FROM clientes", ['||', 'contato'],
    "Una os pedaços com || e coloque os textos fixos (' - ' e '/') entre aspas.",
    "O operador `||` cola textos, colunas e pedaços fixos numa coluna só. Serve para montar etiquetas, endereços, nomes completos e mensagens direto na consulta, sem mexer nos dados guardados. Lembre dos espaços e dos sinais entre aspas: eles também fazem parte do resultado.", CLI),
  f: F("Este código deveria montar uma etiqueta para cada produto no formato 'Nome: R$ preço' (por exemplo: Mouse: R$ 80.0), mas as etiquetas saem com números estranhos. Rode, ache o erro e conserte.",
    `SELECT nome + ': R$ ' + preco AS etiqueta
FROM produtos`,
    "SELECT nome || ': R$ ' || preco AS etiqueta FROM produtos", ['etiqueta'],
    "No SQL, o sinal de + é para somar números. Qual operador cola textos?",
    "O erro era usar `+` para juntar textos. No SQL o `+` soma números: ele tentava transformar 'Mouse' e ': R$ ' em números, o que dava 0. Para colar textos, o operador certo é `||`.", LOJA)
};
SP['sql-2-23'] = {
  d: D("Quantos pedidos foram feitos em cada mês? Mostre o mês (ano-mês, apelido mes) e a quantidade de pedidos (apelido total).",
    "SELECT strftime('%Y-%m', data) AS mes, COUNT(*) AS total FROM pedidos GROUP BY mes", ['strftime', 'group by'],
    "strftime('%Y-%m', data) transforma a data em ano-mês. Dê o apelido mes e agrupe por ele.",
    "O `strftime` extrai pedaços de uma data (ano, mês, dia) ou muda o formato dela. Com ele dá para agrupar por mês, por ano ou por dia da semana mesmo com a data completa guardada na tabela. `'%Y-%m'` é o código de 'ano-mês' (por exemplo, 2026-10).", CLI),
  f: F("Este código deveria somar as quantidades vendidas em outubro (mês 10), mas o resultado vem vazio (NULL). Rode, ache o erro e conserte.",
    `SELECT SUM(qtd) AS total
FROM vendas
WHERE strftime('%m', data) = 10`,
    "SELECT SUM(qtd) AS total FROM vendas WHERE strftime('%m', data) = '10'", ['strftime'],
    "O strftime devolve TEXTO, como '10', mesmo quando parece número. Como se escreve um texto no SQL?",
    "O erro era comparar com o número `10`. O `strftime` sempre devolve texto, então o resultado é `'10'` (com aspas), e o SQL não considera o texto `'10'` igual ao número 10. Compare com o mesmo tipo: `= '10'`.", LOJA)
};
SP['sql-2-24'] = {
  d: D("Quanto os clientes pagaram por mês? Mostre o mês (ano-mês, apelido mes) e o total dos pedidos com status 'pago' (apelido total), em ordem de mês.",
    "SELECT strftime('%Y-%m', data) AS mes, SUM(valor) AS total FROM pedidos WHERE status = 'pago' GROUP BY mes ORDER BY mes", ['strftime', 'group by', 'order by'],
    "Filtre o status no WHERE, agrupe pelo mês criado com strftime e ordene pelo próprio mês.",
    "Um relatório mensal junta várias peças: o `strftime` cria o mês, o `WHERE` escolhe só o que interessa (pedidos pagos), o `GROUP BY` agrupa por mês, o `SUM` calcula o total e o `ORDER BY` coloca os meses em ordem. É um dos relatórios mais comuns do dia a dia de quem analisa dados.", CLI),
  f: F("Este código deveria mostrar o mês (ano-mês, apelido mes) e a quantidade total vendida em cada mês (apelido total), em ordem de mês. Mas todos os meses aparecem juntos numa linha só. Rode, ache o erro e conserte.",
    `SELECT strftime('%Y-%M', data) AS mes, SUM(qtd) AS total
FROM vendas
GROUP BY mes
ORDER BY mes`,
    "SELECT strftime('%Y-%m', data) AS mes, SUM(qtd) AS total FROM vendas GROUP BY mes ORDER BY mes", ['strftime', 'group by', 'order by'],
    "Olhe o texto do mês no resultado: ele se parece com 2026-09? Os códigos do strftime diferenciam letras maiúsculas e minúsculas.",
    "O erro era `%M` no lugar de `%m`: no strftime os códigos fazem diferença entre maiúscula e minúscula. `%m` é o mês, mas `%M` são os minutos, que nas datas guardadas sem hora são sempre 00, então todos os meses caíam no mesmo grupo. Os principais: `%Y` ano, `%m` mês e `%d` dia.", LOJA)
};
SP['sql-2-25'] = {
  d: D("Há quantos dias cada funcionário trabalha na empresa? Mostre o nome e a quantidade de dias entre a admissão e '2026-10-18' (apelido dias_casa), do mais antigo para o mais novo.",
    "SELECT nome, CAST(julianday('2026-10-18') - julianday(admissao) AS INTEGER) AS dias_casa FROM funcionarios ORDER BY dias_casa DESC", ['julianday', 'order by'],
    "julianday transforma uma data num número de dias. Subtraia a admissão da data final e use CAST(... AS INTEGER) para tirar as casas decimais.",
    "O `julianday` transforma uma data num número (os dias contados a partir de um ponto fixo), e por isso dá para subtrair uma data da outra e obter a diferença em dias. Serve para calcular idade de conta, tempo de casa, dias de atraso ou prazo de entrega. Quanto mais antiga a admissão, mais dias: por isso o mais antigo vem primeiro.", RH),
  f: F("Este código deveria mostrar o nome de cada usuário e há quantos dias a conta foi criada até '2026-10-18' (apelido dias), mas os números saem negativos. Rode, ache o erro e conserte.",
    `SELECT nome, CAST(julianday(criado_em) - julianday('2026-10-18') AS INTEGER) AS dias
FROM usuarios`,
    "SELECT nome, CAST(julianday('2026-10-18') - julianday(criado_em) AS INTEGER) AS dias FROM usuarios", ['julianday'],
    "Uma data mais antiga tem um número menor. Para o resultado dar positivo, quem vem primeiro na subtração: a data mais nova ou a mais antiga?",
    "O erro era a ordem da subtração. Na conta `data_nova - data_antiga` o resultado é positivo; invertida, fica negativo. Aqui a data final ('2026-10-18') é a mais nova, então ela vem primeiro: `julianday('2026-10-18') - julianday(criado_em)`.", WEB)
};
SP['sql-2-26'] = {
  d: D("Cadastre o departamento (6, 'Juridico', 'Recife') e depois mostre o nome dos departamentos de Recife, ordenados por nome.",
    "INSERT INTO departamentos VALUES (6, 'Juridico', 'Recife'); SELECT nome FROM departamentos WHERE cidade = 'Recife' ORDER BY nome", ['insert into', 'select'],
    "Escreva o INSERT INTO ... VALUES (...); e, depois do ponto e vírgula, o SELECT que confere o resultado.",
    "O `INSERT INTO` adiciona uma linha nova numa tabela: os valores vêm na mesma ordem das colunas. Depois de inserir, vale sempre conferir com um `SELECT` para ter certeza de que o dado entrou. Os comandos são separados por ponto e vírgula.", RH),
  f: F("Este código deveria cadastrar o cliente (9, 'Iris Costa', 'Recife', 'PE', '2026-09-10') e depois contar quantos clientes há em PE, mas dá erro. Rode, leia a mensagem, ache o erro e conserte.",
    `INSERT INTO clientes VALUES (9, 'Iris Costa', 'Recife', '2026-09-10');
SELECT COUNT(*) FROM clientes WHERE estado = 'PE'`,
    "INSERT INTO clientes VALUES (9, 'Iris Costa', 'Recife', 'PE', '2026-09-10'); SELECT COUNT(*) FROM clientes WHERE estado = 'PE'", ['insert into', 'select'],
    "A mensagem compara o número de colunas da tabela com o número de valores. Quantas colunas tem a tabela clientes e quantos valores foram dados?",
    "O erro era a falta de um valor: a tabela clientes tem 5 colunas (id, nome, cidade, estado, cadastro), mas o INSERT trazia só 4 valores. Sem listar as colunas, o `INSERT ... VALUES` precisa de um valor para cada coluna, na ordem da tabela.", CLI)
};
SP['sql-2-27'] = {
  d: D("Dê um aumento fixo de 500 no salário dos funcionários do departamento 1 (depto_id = 1) e depois mostre nome e salário deles, ordenados por nome.",
    "UPDATE funcionarios SET salario = salario + 500 WHERE depto_id = 1; SELECT nome, salario FROM funcionarios WHERE depto_id = 1 ORDER BY nome", ['update', 'set', 'where'],
    "UPDATE tabela SET coluna = novo valor WHERE condição. A condição escolhe quem muda.",
    "O `UPDATE` muda dados que já existem. O `SET` diz o que muda (aqui, `salario = salario + 500`, usando o valor antigo) e o `WHERE` escolhe quem muda. O WHERE é o seu freio de segurança: garante que só o departamento 1 recebe o aumento.", RH),
  f: F("Este código deveria zerar o estoque só dos produtos da categoria 'Papelaria' e depois mostrar nome e estoque de todos os produtos, ordenados por nome. Mas todos os produtos ficaram com estoque 0. Rode, ache o erro e conserte.",
    `UPDATE produtos SET estoque = 0;
SELECT nome, estoque FROM produtos ORDER BY nome`,
    "UPDATE produtos SET estoque = 0 WHERE categoria = 'Papelaria'; SELECT nome, estoque FROM produtos ORDER BY nome", ['update', 'set'],
    "Sem uma condição, o UPDATE muda TODAS as linhas da tabela. Que parte falta para escolher só a Papelaria?",
    "O erro era a falta do `WHERE`. Um UPDATE sem WHERE muda todas as linhas da tabela, e foi o que aconteceu: todos os estoques viraram 0. Antes de rodar um UPDATE (ou um DELETE), confira sempre se ele tem o WHERE certo. Dica de segurança: teste a condição num SELECT antes.", LOJA)
};
SP['sql-2-28'] = {
  d: D("Apague os pedidos cancelados (status = 'cancelado') e depois mostre quantos pedidos restaram (COUNT).",
    "DELETE FROM pedidos WHERE status = 'cancelado'; SELECT COUNT(*) FROM pedidos", ['delete from', 'where'],
    "DELETE FROM tabela WHERE condição; e depois um SELECT COUNT(*) para conferir.",
    "O `DELETE FROM` apaga linhas, e o `WHERE` escolhe quais. Sem WHERE, a tabela inteira seria esvaziada. Depois de apagar, conferir com um `COUNT(*)` mostra quantas linhas sobraram e confirma que a limpeza fez o que você esperava.", CLI),
  f: F("Este código deveria apagar os funcionários que estão sem salário cadastrado (salario NULL) e depois contar quantos funcionários restaram, mas nada foi apagado. Rode, ache o erro e conserte.",
    `DELETE FROM funcionarios WHERE salario = NULL;
SELECT COUNT(*) FROM funcionarios`,
    "DELETE FROM funcionarios WHERE salario IS NULL; SELECT COUNT(*) FROM funcionarios", ['delete from', 'where'],
    "Lembra como se testa um valor vazio? O sinal de = não funciona com NULL.",
    "O erro era `salario = NULL`. Nenhuma comparação com `=` é verdadeira para NULL, então o WHERE nunca escolhia ninguém e o DELETE não apagava nada. Para achar valores vazios use `IS NULL`: `WHERE salario IS NULL`.", RH)
};
SP['sql-2-29'] = {
  d: D("Crie a tabela avaliacoes(produto_id INTEGER, nota INTEGER), insira as avaliações (1, 5), (2, 4) e (1, 3) e mostre a nota média de cada produto (colunas produto_id e media), ordenado por produto_id.",
    "CREATE TABLE avaliacoes(produto_id INTEGER, nota INTEGER); INSERT INTO avaliacoes VALUES (1, 5), (2, 4), (1, 3); SELECT produto_id, AVG(nota) AS media FROM avaliacoes GROUP BY produto_id ORDER BY produto_id", ['create table', 'insert into', 'avg'],
    "Em ordem: CREATE TABLE para criar, INSERT INTO para guardar as linhas e SELECT para conferir, tudo separado por ponto e vírgula.",
    "O `CREATE TABLE` cria uma tabela nova: você escolhe o nome, as colunas e o tipo de cada uma (`INTEGER`, `TEXT`, `REAL`). Só depois que ela existe o `INSERT INTO` consegue guardar linhas e o `SELECT` consegue consultá-las. É assim que nasce qualquer base de dados: primeiro a estrutura, depois os dados.", LOJA),
  f: F("Este código deveria criar a tabela tarefas(titulo TEXT, feito INTEGER), guardar duas tarefas e mostrar o título das tarefas feitas (feito = 1), mas dá erro. Rode, leia a mensagem, ache o erro e conserte.",
    `CREATE TABLE tarefas(titulo TEXT, feito INTEGER);
INSERT INTO tarefa VALUES ('estudar SQL', 1), ('treinar', 0);
SELECT titulo FROM tarefas WHERE feito = 1`,
    "CREATE TABLE tarefas(titulo TEXT, feito INTEGER); INSERT INTO tarefas VALUES ('estudar SQL', 1), ('treinar', 0); SELECT titulo FROM tarefas WHERE feito = 1", ['create table', 'insert into'],
    "A mensagem diz que uma tabela não existe. Compare o nome da tabela criada com o nome usado no INSERT.",
    "O erro era o nome da tabela no INSERT: `tarefa` no lugar de `tarefas`. O nome precisa ser escrito exatamente como foi criado no `CREATE TABLE`; com uma letra diferente o SQL entende que é outra tabela, que não existe. Quando aparecer 'no such table', confira o nome.", LOJA)
};
SP['sql-2-30'] = {
  d: D("Mostre cada estado (coluna estado), a quantidade de pedidos pagos (apelido pedidos) e o total pago (apelido total), apenas dos estados com total acima de 500, do maior total para o menor.",
    "SELECT c.estado, COUNT(*) AS pedidos, SUM(p.valor) AS total FROM clientes c JOIN pedidos p ON p.cliente_id = c.id WHERE p.status = 'pago' GROUP BY c.estado HAVING SUM(p.valor) > 500 ORDER BY total DESC", ['join', 'where', 'group by', 'having', 'order by'],
    "Monte por etapas: JOIN, WHERE (só os pagos), GROUP BY estado, HAVING (total acima de 500) e ORDER BY.",
    "Este desafio junta tudo o que você aprendeu: `JOIN` liga as tabelas, `WHERE` escolhe as linhas, `GROUP BY` forma os grupos, `COUNT` e `SUM` calculam, `HAVING` filtra os grupos e `ORDER BY` organiza o resultado. Quando você escreve uma consulta assim sem se perder, sabe de verdade usar o SQL do nível intermediário.", CLI),
  f: F("Este código deveria mostrar o nome de cada departamento, quantos funcionários ele tem (apelido total) e a soma dos salários (apelido folha), só dos departamentos com folha acima de 10000, da maior folha para a menor. Mas dá erro. Rode, leia a mensagem, ache o erro e conserte.",
    `SELECT d.nome, COUNT(*) AS total, SUM(f.salario) AS folha
FROM funcionarios f
JOIN departamentos d ON d.id = f.depto_id
GROUP BY d.nome
WHERE SUM(f.salario) > 10000
ORDER BY folha DESC`,
    "SELECT d.nome, COUNT(*) AS total, SUM(f.salario) AS folha FROM funcionarios f JOIN departamentos d ON d.id = f.depto_id GROUP BY d.nome HAVING SUM(f.salario) > 10000 ORDER BY folha DESC", ['join', 'group by', 'sum'],
    "A condição é sobre a SOMA de cada departamento, não sobre cada funcionário. Que parte da consulta filtra grupos?",
    "O erro era usar `WHERE` para filtrar a soma. O WHERE só enxerga linhas soltas, antes do agrupamento, e vem antes do GROUP BY. Condições sobre `SUM`, `COUNT` ou `AVG` de cada grupo vão no `HAVING`, logo depois do `GROUP BY`.", RH)
};

module.exports = SP;
