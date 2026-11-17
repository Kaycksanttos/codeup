// HACKER E CIBERSEGURANÇA — NÍVEL BÁSICO (30 lições, todas de quiz: golpes, senhas, redes, criptografia, defesa na prática).
// Foco ÉTICO e DEFENSIVO: o aluno aprende como os ataques funcionam para saber se proteger. Nada de código de ataque; só se testa o que é seu ou o que se tem autorização por escrito para testar.
// Bloco 1 (1–10): fundamentos e golpes: tríade CIA, ética e lei, risco, internet, senhas, MFA, phishing, engenharia social, malware, atualizações e backup.  Checkpoint depois da 10.
// Bloco 2 (11–20): redes e criptografia: IP, Wi-Fi, portas, firewall, cifras, hash, chaves, HTTPS, autenticação, LGPD.  Checkpoint depois da 20.
// Bloco 3 (21–30): defesa na prática: terminal, permissões, logs, pegada digital, varredura, OWASP, injeção de SQL, incidentes, checklist, carreira e ética.  Prova final depois da 30.
// As contas e os gabaritos das perguntas (`calc`) são refeitos em JavaScript por `npm run check:pbi`.
const mk = require('./hp'), H = require('./ci-h');
const { Q } = mk('ciber', 1);

exports.lessons = [
  ...require('./ci1a')(Q, H),
  ...require('./ci1b')(Q, H),
  ...require('./ci1c')(Q, H)
];
