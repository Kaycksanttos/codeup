// HACKER E CIBERSEGURANÇA — NÍVEL INTERMEDIÁRIO (30 lições, todas de quiz): redes a fundo, sistemas e web, teste e análise.
// Mesmo foco ÉTICO e DEFENSIVO do Básico: o aluno aprende como os ataques funcionam para saber detectar e se defender; nada de código de ataque.
// Bloco 1 (1–10): redes a fundo: OSI e TCP/IP, endereçamento e CIDR, ARP/DHCP/ICMP, DNS, TCP e UDP, HTTP, ataques de rede e defesas, segmentação, VPN/proxy/Tor, IDS e IPS.  Checkpoint depois da 10.
// Bloco 2 (11–20): sistemas e web: Linux, serviços, hardening, Windows e AD, sessões e cookies, XSS, CSRF, controle de acesso, injeção, APIs.  Checkpoint depois da 20.
// Bloco 3 (21–30): teste e análise: metodologia, reconhecimento, CVE e CVSS, priorização, criptografia aplicada, codificações, CTF, forense, SIEM, ética e lei.  Prova final depois da 30.
// As contas e os gabaritos das perguntas (`calc`) são refeitos em JavaScript por `npm run check:pbi`.
const mk = require('./hp'), H = require('./ci-h');
const { Q } = mk('ciber', 2);

exports.lessons = [
  ...require('./ci2a')(Q, H),
  ...require('./ci2b')(Q, H),
  ...require('./ci2c')(Q, H)
];
