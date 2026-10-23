// Recompensas por XP: quanto mais XP a pessoa ganha nas lições, checkpoints e provas, mais títulos e molduras ela conquista.
// Um só arquivo para o navegador (window.CodeUpRewards) e para o servidor/testes (require): assim a regra nunca fica diferente nos dois lados.
// O XP máximo do curso inteiro (Python + SQL) é 5.025, então a "Lenda" só chega para quem termina tudo.
(function (root) {
  'use strict';
  const TIERS = [
    { key: 'ini', xp: 0,    title: 'Iniciante',  frame: null,        color: '#94a3b8' },
    { key: 'apr', xp: 100,  title: 'Aprendiz',   frame: 'Bronze',    color: '#cd7f32' },
    { key: 'pra', xp: 300,  title: 'Praticante', frame: 'Prata',     color: '#cbd5e1' },
    { key: 'des', xp: 700,  title: 'Destaque',   frame: 'Ouro',      color: '#fbbf24' },
    { key: 'cra', xp: 1200, title: 'Craque',     frame: 'Esmeralda', color: '#34d399' },
    { key: 'exp', xp: 2000, title: 'Expert',     frame: 'Safira',    color: '#60a5fa' },
    { key: 'mes', xp: 3200, title: 'Mestre',     frame: 'Ametista',  color: '#c084fc' },
    { key: 'len', xp: 4500, title: 'Lenda',      frame: 'Diamante',  color: '#67e8f9' }
  ];
  const num = v => (Number.isFinite(+v) && +v > 0 ? Math.floor(+v) : 0);
  // posição (0 a 7) do maior título que o XP já alcançou
  const tierOf = xp => { const x = num(xp); let i = 0; TIERS.forEach((t, k) => { if (x >= t.xp) i = k; }); return i; };
  // próximo título ainda não conquistado (ou null, se já é Lenda)
  const nextTier = xp => TIERS[tierOf(xp) + 1] || null;
  // moldura que aparece no personagem: a escolhida pela pessoa, se ela já conquistou; senão a mais alta que ela tem
  const frameOf = (xp, chosen) => { const top = tierOf(xp), k = TIERS.findIndex(t => t.key === chosen); return k > 0 && k <= top ? k : top; };
  const api = { TIERS, tierOf, nextTier, frameOf };
  if (typeof module === 'object' && module.exports) module.exports = api; else root.CodeUpRewards = api;
})(typeof window !== 'undefined' ? window : globalThis);
