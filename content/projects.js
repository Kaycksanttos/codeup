// PROJETOS: um depois de cada 5 lições (5, 10, 15, 20, 25 e 30) de cada nível: 6 por nível, 54 no total (Python 3 níveis, SQL 3, Excel, Power BI e DAX e Análise de Dados 1 cada).
// O aluno monta um mini-projeto com o que aprendeu nas 5 últimas lições. Não é prova: não gasta chance e não faz voltar lição, e tem dica e solução.
// Mas é obrigatório: a lição seguinte (e o checkpoint/prova final que vem depois do projeto das lições 10, 20 e 30) só libera com o projeto feito.
// Um arquivo por curso: pj-py.js, pj-sql.js, pj-xl.js, pj-pbi.js, pj-da.js (os ajudantes ficam em pj.js). Para editar: mude lá, rode `npm run build:content` e `npm test`.
module.exports = [...require('./pj-py'), ...require('./pj-sql'), ...require('./pj-xl'), ...require('./pj-pbi'), ...require('./pj-da')];
