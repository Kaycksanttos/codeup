// Ajudantes para escrever as atividades de LER o código (2ª atividade de cada lição). Cada uma devolve um item:
//   k: 'mc' (escolher: `ok` é a certa e `no` são 3 erradas; o servidor embaralha) ou 'type' (digitar: `ok` é o texto ou uma lista de textos aceitos)
//   code: o código mostrado · q: a pergunta · why: o "por quê", linha por linha, mostrado depois de acertar · hint: dica depois de errar (opcional)
//   v: como `npm run check:ler` prova a resposta rodando o código (sem v = pergunta de conceito, conferida na revisão):
//        Python: 'out' (a saída é `ok`) · 'err:NomeDoErro' (o código dá esse erro)
//        SQL:    'nrows' (nº de linhas) · 'first' (1ª célula) · 'cols' (colunas separadas por ", ") · 'row0' (1ª linha, valores separados por " | ")
//                'col0' (1ª coluna, separada por ", ") · 'cell:L:C' (linha L, coluna C, a partir de 1) · 'err' (a consulta dá erro)
//        Excel:  'cell' (o valor mostrado na célula `ask` é `ok`)
const mc = (code, q, ok, no, why, o = {}) => ({ k: 'mc', code, q, ok, no, why, ...o });
const ty = (code, q, ok, why, o = {}) => ({ k: 'type', code, q, ok, why, ...o });
const mo = (code, q, ok, no, why, o = {}) => mc(code, q, ok, no, why, { v: 'out', ...o });     // Python: a saída é a resposta
const to = (code, q, ok, why, o = {}) => ty(code, q, ok, why, { v: 'out', ...o });
const me = (code, q, ok, no, why, err, o = {}) => mc(code, q, ok, no, why, { v: 'err:' + err, ...o });   // Python: o código dá erro
module.exports = { mc, ty, mo, to, me };
