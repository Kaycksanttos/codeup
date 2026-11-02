// Lê content/enunciados.txt: o texto do que o aluno precisa fazer em cada projeto e prova ("## id" + o enunciado).
// Troca o `task` curto dos arquivos de cada curso por um enunciado em passos (veja as regras de escrita no topo do .txt).
const fs = require('fs'), path = require('path');
const out = {};
let id = null, buf = [];
const flush = () => { if (id) out[id] = buf.join('\n').trim(); id = null; buf = []; };
for (const line of fs.readFileSync(path.join(__dirname, 'enunciados.txt'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^## (\S+)\s*$/);
  if (m) { flush(); id = m[1]; }
  else if (id) buf.push(line);
}
flush();
module.exports = out;
