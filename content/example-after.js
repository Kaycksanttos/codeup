// Exemplos de SQL que não devolvem linhas (INSERT, UPDATE, DELETE, CREATE...): para a teoria mostrar "o que mudou", cada um traz uma consulta
// que roda DEPOIS do exemplo e prova o efeito dele. O texto é o título da tabelinha de resultado. `npm run build:content` roda tudo e grava content/example-sql.json.
module.exports = {
  'sql-2-26': ['SELECT * FROM produtos WHERE id = 11', 'A linha nova na tabela produtos'],
  'sql-2-27': ['SELECT id, nome, preco FROM produtos WHERE id = 2', 'A linha do Mouse depois do UPDATE (o preço era 80)'],
  'sql-2-28': ['SELECT id, nome FROM produtos WHERE id BETWEEN 8 AND 10', 'Produtos de 8 a 10 depois do DELETE (o 9 sumiu)'],
  'sql-2-29': ["SELECT name AS coluna, type AS tipo FROM pragma_table_info('tarefas')", 'A tabela nova, sem linhas ainda: suas colunas e tipos'],
  'sql-3-27': ["SELECT name AS indice, tbl_name AS tabela FROM sqlite_master WHERE type = 'index'", 'O índice criado'],
};
