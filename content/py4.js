// PYTHON — NÍVEL AUTOMAÇÕES (30 lições práticas: arquivos e pastas, dados e relatórios, e-mail, internet, logs e agendamento)
// As lições rodam no "computador de treino" (public/lab.py): um disco virtual, um relógio parado em 14/03/2025 09:00, e-mail e internet de mentira.
// Nada toca o computador de verdade e o resultado é sempre o mesmo. Veja content/lab.js para montar os arquivos de cada lição.
const mkH = require('./h'), { boot, PEEK } = require('./lab');
const { L } = mkH('python', 4, null, '');
// F(arquivos, opções): o prelúdio da lição (computador de treino + arquivos) e o botão "Ver os arquivos"
const F = (files, o = {}) => ({ prelude: boot({ files, ...o }), peek: PEEK });
exports.lessons = [...require('./py4a')(L, F), ...require('./py4b')(L, F), ...require('./py4c')(L, F)];
