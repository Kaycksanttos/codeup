// Ajudantes comuns dos arquivos do curso Hacker e Cibersegurança (perguntas, material e contas para conferir os gabaritos).
const hp = require('./hp');
const sum = a => a.reduce((x, y) => x + y, 0), avg = a => sum(a) / a.length;
// cifra de César: desloca cada letra (A–Z) k posições; mantém o resto
const caesar = (t, k) => String(t).replace(/[A-Z]/g, c => String.fromCharCode((c.charCodeAt(0) - 65 + k + 26 * 10) % 26 + 65));
const T = (cols, rows, o) => hp.tab(cols, rows, o);
module.exports = { ...hp, sum, avg, caesar, T };
