#!/usr/bin/env node
// MODO TESTE do CodeUp:  npm run teste   (ou  npm run teste:demo  para já vir com alunos de exemplo)
//
// Sobe uma cópia do app com dados NOVOS a cada vez, numa porta separada (3100), sem tocar no seu data.json nem no banco de verdade:
//  - começa do zero (nenhuma conta, nenhum certificado);
//  - o e-mail de confirmação e o de "esqueci a senha" abrem na hora (nenhum e-mail real é enviado);
//  - os anúncios aparecem em PRÉVIA (caixas de exemplo) e os limites de tentativas ficam folgados;
//  - uma faixa laranja no topo avisa "MODO TESTE" e tem o botão "Começar do zero".
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const root = path.join(__dirname, '..'), dir = path.join(root, 'teste-dados'), file = path.join(dir, 'data.json');
const demo = process.argv.includes('--demo'), port = String(process.env.TESTE_PORT || 3100), KEY = process.env.TESTE_ADMIN_KEY || 'admin-teste', SENHA = 'teste1234';

// apaga os dados do teste anterior (só desta pasta) e recomeça
fs.mkdirSync(dir, { recursive: true });
for (const f of [file, file + '.tmp']) { try { fs.rmSync(f); } catch { } }
try { fs.rmSync(path.join(dir, 'backups'), { recursive: true, force: true }); } catch { }

// o que for do ambiente de verdade não pode vazar para o teste (banco, e-mail real, anúncios reais, painel em endereço separado)
Object.assign(process.env, {
  NODE_ENV: 'development', CODEUP_TESTE: '1', DEV_SHOW_RESET_LINK: '1', ADS_PREVIEW: '1', DATABASE_URL: '', RESEND_API_KEY: '', SMTP_HOST: '', ADSENSE_CLIENT: '', ADSENSE_SLOT: '',
  ADMIN_HOST: '', DATA_FILE: file, PORT: port, BASE_URL: `http://localhost:${port}`, ADMIN_KEY: KEY
});

if (demo) seed();
require('../server.js');

// quando o servidor estiver de pé, mostra o roteiro
let tries = 0;
const t = setInterval(async () => {
  if (++tries > 120) return clearInterval(t);
  try { if (!(await fetch(`http://localhost:${port}/health`)).ok) return; } catch { return; }
  clearInterval(t);
  const L = [
    '', '════════════════════════════════════════════════════════════',
    '  CodeUp — MODO TESTE (dados fictícios; seus dados reais não são tocados)',
    '════════════════════════════════════════════════════════════',
    `  App dos alunos : http://localhost:${port}`,
    `  Painel do dono : http://localhost:${port}/admin      chave: ${KEY}`,
    '',
    '  Como testar tudo do começo:',
    '   1. Abra o app numa JANELA ANÔNIMA (Ctrl+Shift+N) — assim você entra como visitante novo.',
    '   2. Siga o roteiro do arquivo TESTAR.md (cadastro, personagem, lições, provas, certificado, painel).',
    '   3. Quer recomeçar? Clique em "Começar do zero" na faixa laranja do topo — ou Ctrl+C aqui e rode de novo.',
    demo ? `\n  Contas de exemplo (senha ${SENHA}): marina@exemplo.com · joao@exemplo.com · julia@exemplo.com (já com certificado) · ana@exemplo.com (curso liberado)` : '\n  Dica: "npm run teste:demo" já traz alunos de exemplo para você ver o painel cheio.',
    '════════════════════════════════════════════════════════════', ''
  ];
  console.log(L.join('\n'));
}, 500);

function seed() {
  const L = require('../lessons'), cps = L.checkpoints, DAY = 864e5, now = Date.now(), iso = ms => new Date(ms).toISOString();
  const salt = crypto.randomBytes(16).toString('hex'), pass = salt + ':' + crypto.scryptSync(SENHA, salt, 64).toString('hex');
  const db = { users: {}, sessions: {}, resets: {}, certs: {}, verifies: {}, asessions: {}, audit: [], settings: {}, meta: {} };
  // nome, e-mail, trilha, lições feitas, dias desde o último acesso, dias desde o cadastro
  const people = [
    ['Marina Souza', 'marina@exemplo.com', 'python', 34, 3, 1], ['João Pedro', 'joao@exemplo.com', 'sql', 20, 1, 0], ['Ana Clara Lima', 'ana@exemplo.com', 'python', 60, 5, 0],
    ['Bruno Teixeira', 'bruno@exemplo.com', null, 0, 0, 0], ['Camila Ribeiro', 'camila@exemplo.com', 'sql', 12, 2, 3], ['Diego Alves', 'diego@exemplo.com', 'python', 3, 9, 4],
    ['Eduarda Nunes', 'edu@exemplo.com', 'python', 0, 12, 5], ['Felipe Costa', 'felipe@exemplo.com', 'sql', 45, 0, 6], ['Gabi Martins', 'gabi@exemplo.com', 'python', 8, 1, 7],
    ['Helena Prado', 'helena@exemplo.com', null, 0, 15, 11], ['Igor Santos', 'igor@exemplo.com', 'python', 15, 2, 13], ['Julia Mendes', 'julia@exemplo.com', 'sql', 90, 0, 20]
  ];
  people.forEach(([name, email, track, nl, seenDays, age], i) => {
    const id = 'demo' + (1000 + i), created = now - (age * DAY + 3.6e6 * (i + 1));
    const u = { id, name, email, pass, verified: i !== 3 && i !== 6, xp: nl * 14, gems: 0, streak: nl ? Math.min(nl, 5) : 0, done: {}, cpdone: {}, attempts: {}, passed: {}, exams: {}, certs: {}, fails: {}, xpd: {}, created: iso(created), acceptedTerms: iso(created), track, seen: iso(now - seenDays * DAY) };
    const ls = L.filter(l => l.track === track);
    ls.slice(0, Math.min(nl, 30)).forEach((l, k) => { u.done[l.id] = { date: iso(now - (seenDays + (nl - k) * 0.3) * DAY), xp: 10 }; u.attempts[l.id] = 1 + (k % 3); });
    if (nl >= 5 && track) { const c = cps.find(c => c.track === track && c.lv === 1 && c.after === 5); if (c) u.cpdone[c.id] = { date: iso(now - seenDays * DAY) }; }
    if (nl >= 30) { u.passed[track + '-1'] = iso(now - seenDays * DAY); u.xp += 100; }
    if (track && ls[nl]) u.attempts[ls[nl].id] = 4;                                   // tentou a próxima e não conseguiu
    if (i === 6) u.fails[track + '-1'] = 2;
    if (i === 2) u.unlock = { python: iso(now - DAY) };                               // curso liberado pelo dono
    db.users[id] = u;
  });
  const j = db.users.demo1011; ['1', '2', '3'].forEach(lv => j.passed['sql-' + lv] = iso(now - 5 * DAY)); j.certs.sql = { code: 'CUP-DEMO-0001', date: iso(now - 4 * DAY) };
  db.certs['CUP-DEMO-0001'] = { uid: 'demo1011', track: 'sql', name: 'Julia Mendes', date: iso(now - 4 * DAY) };
  fs.writeFileSync(file, JSON.stringify(db));
}
