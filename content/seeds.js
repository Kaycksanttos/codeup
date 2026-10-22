// Bancos de treino usados nas atividades de SQL.
exports.LOJA = `
CREATE TABLE produtos(id INTEGER, nome TEXT, preco REAL, categoria TEXT, estoque INTEGER);
INSERT INTO produtos VALUES (1,'Notebook',3500,'Eletrônicos',12),(2,'Mouse',80,'Eletrônicos',150),(3,'Cadeira',900,'Móveis',30),(4,'Mesa',650,'Móveis',18),(5,'Caneta',3,'Papelaria',900),(6,'Monitor',1200,'Eletrônicos',25),(7,'Caderno',18,'Papelaria',300),(8,'Teclado',250,'Eletrônicos',60),(9,'Estante',480,'Móveis',0),(10,'Lápis',2,'Papelaria',1200);
CREATE TABLE vendas(id INTEGER, produto_id INTEGER, qtd INTEGER, data TEXT);
INSERT INTO vendas VALUES (1,1,2,'2026-09-01'),(2,2,10,'2026-09-02'),(3,3,1,'2026-09-02'),(4,5,50,'2026-09-03'),(5,2,4,'2026-09-04'),(6,4,3,'2026-09-05'),(7,6,2,'2026-10-01'),(8,7,20,'2026-10-02'),(9,8,5,'2026-10-02'),(10,1,1,'2026-10-03'),(11,3,2,'2026-10-04'),(12,10,100,'2026-10-04'),(13,2,6,'2026-10-05'),(14,6,1,'2026-10-06');
`;
exports.T_LOJA = 'Tabelas: produtos(id, nome, preco, categoria, estoque) e vendas(id, produto_id, qtd, data).';

exports.RH = `
CREATE TABLE departamentos(id INTEGER, nome TEXT, cidade TEXT);
INSERT INTO departamentos VALUES (1,'Vendas','São Paulo'),(2,'TI','Recife'),(3,'RH','São Paulo'),(4,'Financeiro','Curitiba'),(5,'Marketing','Recife');
CREATE TABLE funcionarios(id INTEGER, nome TEXT, depto_id INTEGER, cargo TEXT, salario REAL, admissao TEXT, gerente_id INTEGER);
INSERT INTO funcionarios VALUES
(1,'Carlos',2,'Diretor de TI',15000,'2018-03-10',NULL),
(2,'Marina',2,'Desenvolvedora',9000,'2020-07-01',1),
(3,'Paulo',2,'Desenvolvedor',8500,'2021-02-15',1),
(4,'Renata',1,'Gerente de Vendas',12000,'2019-05-20',NULL),
(5,'Tiago',1,'Vendedor',4500,'2022-01-10',4),
(6,'Larissa',1,'Vendedora',5200,'2021-09-05',4),
(7,'Bruno',3,'Analista de RH',5800,'2020-11-30',NULL),
(8,'Fernanda',4,'Contadora',7000,'2019-08-12',NULL),
(9,'Diego',4,'Auxiliar',3200,'2023-04-03',8),
(10,'Julia',2,'Estagiária',2200,'2024-02-19',2),
(11,'Otávio',1,'Vendedor',4800,'2023-06-26',4),
(12,'Camila',3,'Analista de RH',NULL,'2024-05-06',7);
`;
exports.T_RH = 'Tabelas: funcionarios(id, nome, depto_id, cargo, salario, admissao, gerente_id) e departamentos(id, nome, cidade).';

exports.CLI = `
CREATE TABLE clientes(id INTEGER, nome TEXT, cidade TEXT, estado TEXT, cadastro TEXT);
INSERT INTO clientes VALUES (1,'Ana Souza','São Paulo','SP','2025-11-03'),(2,'Bruno Lima','Recife','PE','2025-12-14'),(3,'Carla Dias','São Paulo','SP','2026-01-20'),(4,'Diego Rocha','Curitiba','PR','2026-02-08'),(5,'Elisa Prado','Campinas','SP','2026-03-17'),(6,'Fábio Nunes','Recife','PE','2026-05-02'),(7,'Gabi Torres','Salvador','BA','2026-06-25'),(8,'Hugo Alves','Curitiba','PR','2026-08-30');
CREATE TABLE pedidos(id INTEGER, cliente_id INTEGER, valor REAL, status TEXT, data TEXT);
INSERT INTO pedidos VALUES (1,1,200,'pago','2026-09-02'),(2,1,350,'pago','2026-09-18'),(3,2,120,'cancelado','2026-09-05'),(4,3,900,'pago','2026-09-12'),(5,3,100,'pago','2026-10-01'),(6,4,50,'pendente','2026-10-03'),(7,5,640,'pago','2026-10-04'),(8,2,300,'pago','2026-10-06'),(9,6,75,'pago','2026-10-07'),(10,1,420,'pendente','2026-10-08'),(11,3,260,'pago','2026-10-10'),(12,5,180,'cancelado','2026-10-11'),(13,2,90,'pago','2026-10-12'),(14,6,510,'pago','2026-10-13');
`;
exports.T_CLI = 'Tabelas: clientes(id, nome, cidade, estado, cadastro) e pedidos(id, cliente_id, valor, status, data).';

// vendas mensais por vendedor (24 linhas) — usado em funções de janela
const vend = [['Ana', 'Sul'], ['Bruno', 'Norte'], ['Carla', 'Sul'], ['Diego', 'Norte']];
const meses = ['2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10'];
const val = [[1200, 1500, 1100, 1800, 2100, 2000], [900, 950, 1300, 1250, 1000, 1600], [2000, 1800, 2200, 2400, 2300, 2900], [700, 800, 650, 900, 1100, 1050]];
exports.VM = `
CREATE TABLE vendas_mes(vendedor TEXT, regiao TEXT, mes TEXT, valor REAL);
INSERT INTO vendas_mes VALUES ${vend.flatMap((v, i) => meses.map((m, j) => `('${v[0]}','${v[1]}','${m}',${val[i][j]})`)).join(',')};
`;
exports.T_VM = 'Tabela: vendas_mes(vendedor, regiao, mes, valor) — 4 vendedores, de 2026-05 a 2026-10.';

exports.WEB = `
CREATE TABLE usuarios(id INTEGER, nome TEXT, plano TEXT, criado_em TEXT);
INSERT INTO usuarios VALUES (1,'Ana','premium','2026-10-01'),(2,'Bruno','gratis','2026-10-01'),(3,'Carla','premium','2026-10-02'),(4,'Diego','gratis','2026-10-03'),(5,'Elisa','gratis','2026-10-03'),(6,'Fábio','premium','2026-10-05');
CREATE TABLE acessos(usuario_id INTEGER, data TEXT);
INSERT INTO acessos VALUES (1,'2026-10-01'),(1,'2026-10-02'),(1,'2026-10-03'),(1,'2026-10-05'),(2,'2026-10-01'),(2,'2026-10-04'),(3,'2026-10-02'),(3,'2026-10-03'),(3,'2026-10-04'),(3,'2026-10-05'),(3,'2026-10-06'),(4,'2026-10-03'),(5,'2026-10-03'),(5,'2026-10-04'),(6,'2026-10-05'),(6,'2026-10-06');
`;
exports.T_WEB = 'Tabelas: usuarios(id, nome, plano, criado_em) e acessos(usuario_id, data).';
