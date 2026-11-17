// O "computador de treino" das lições de Automações (Python): o texto vem de public/lab.py (o navegador baixa o mesmo arquivo em /lab.py).
// Cada lição monta o seu computador com boot({ files, dias, env, rotas, contas, pastas, depois }):
//   files:  { 'pasta/arquivo.txt': 'conteúdo' }  (arquivos que já existem; sem acento nos nomes e nos dados)
//   dias:   { 'arquivo': 45 }                    (há quantos dias o arquivo foi mexido; o relógio de treino começa em 14/03/2025 09:00)
//   env:    { NOME: 'valor' }                    (variáveis de ambiente)
//   rotas:  texto Python de um dict { 'https://...': resposta }   (a internet de mentira; veja lab.py)
//   contas: { 'e-mail': 'senha' }                (quem consegue entrar no servidor de e-mail de mentira)
//   pastas: ['pasta/vazia']                      (pastas sem arquivos)
//   antes:  texto Python que roda logo antes de montar os arquivos (funções usadas pelas rotas)
//   depois: texto Python que roda logo depois (funções e dados do exercício)
// O `prelude` da lição é LAB + boot(...). O servidor troca o começo (LAB) por "#lab" ao mandar para o navegador, que expande de /lab.py.
const fs = require('fs'), path = require('path');
const LAB = fs.readFileSync(path.join(__dirname, '..', 'public', 'lab.py'), 'utf8').replace(/\r/g, '').replace(/\s*$/, '\n');
const py = o => JSON.stringify(o).replace(/[\u007f-￿]/g, c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));
const boot = (o = {}) => `${LAB}${o.antes ? o.antes.replace(/\s*$/, '\n') : ''}_lab_boot(${py(o.files || {})}, dias=${py(o.dias || {})}, env=${py(o.env || {})}, rotas=${o.rotas || '{}'}, contas=${py(o.contas || {})}, pastas=${py(o.pastas || [])})\n${o.depois ? o.depois.replace(/\s*$/, '\n') : ''}`;
module.exports = { LAB, boot, PEEK: 'lab_ver()' };
