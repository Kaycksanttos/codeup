// HACKER E CIBERSEGURANÇA — NÍVEL AVANÇADO (30 lições, todas de quiz): ameaças e frameworks, SOC e resposta a incidentes, segurança moderna e governança.
// Mesmo foco ÉTICO e DEFENSIVO dos outros níveis: o aluno aprende como os ataques funcionam para saber detectar e se defender; nada de código de ataque.
// Bloco 1 (1–10): ameaças e arquitetura de defesa: STRIDE, MITRE ATT&CK, Kill Chain, risco (ALE), ISO 27001/NIST/CIS, Zero Trust, IAM e PAM, EDR/XDR, SPF/DKIM/DMARC, continuidade (RPO/RTO).  Checkpoint depois da 10.
// Bloco 2 (11–20): SOC, detecção e resposta: MTTD/MTTR, eventos do Windows, regras Sigma, inteligência de ameaças e IOCs, malware (conceitual), engenharia reversa (conceitual), forense, tráfego de rede, ransomware, playbooks e SOAR.  Checkpoint depois da 20.
// Bloco 3 (21–30): segurança moderna: nuvem, contêineres, DevSecOps, APIs, TLS/PKI, segurança de memória, mobile e IoT, red/blue/purple, governança e LGPD, carreira e ética.  Prova final depois da 30.
// As contas e os gabaritos das perguntas (`calc`) são refeitos em JavaScript por `npm run check:pbi`.
const mk = require('./hp'), H = require('./ci-h');
const { Q } = mk('ciber', 3);

exports.lessons = [
  ...require('./ci3a')(Q, H),
  ...require('./ci3b')(Q, H),
  ...require('./ci3c')(Q, H)
];
