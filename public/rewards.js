// Recompensas por XP: quanto mais XP a pessoa ganha nas lições, checkpoints e provas, mais títulos, molduras e itens de personalização ela conquista.
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

  // ---- Personalizar o personagem: cor da roupa, adesivo e fundo. Cada item pede um título (posição em TIERS): 0 = livre desde o começo.
  // As imagens coloridas ficam em /img/<guia>-<cor>.webp e <guia>-<cor>-face.webp; a cor "de fábrica" de cada guia (Tay = rosa, Cut = azul) usa as imagens originais.
  const BASE = { tay: 'rosa', cut: 'azul' };
  const COLORS = [
    { key: 'rosa', name: 'Rosa', hue: 338, tier: 0 }, { key: 'azul', name: 'Azul', hue: 222, tier: 0 }, { key: 'verde', name: 'Verde', hue: 140, tier: 0 }, { key: 'roxo', name: 'Roxo', hue: 268, tier: 0 },
    { key: 'laranja', name: 'Laranja', hue: 24, tier: 1 }, { key: 'vermelho', name: 'Vermelho', hue: 356, tier: 2 }, { key: 'amarelo', name: 'Amarelo', hue: 48, tier: 3 }, { key: 'ciano', name: 'Ciano', hue: 186, tier: 4 }
  ];
  const STICKERS = [
    { key: 'estrela', name: 'Estrela', color: '#fbbf24', tier: 0 }, { key: 'raio', name: 'Raio', color: '#facc15', tier: 0 }, { key: 'coracao', name: 'Coração', color: '#fb7185', tier: 0 },
    { key: 'foguete', name: 'Foguete', color: '#67e8f9', tier: 1 }, { key: 'chama', name: 'Chama', color: '#fb923c', tier: 2 }, { key: 'capelo', name: 'Capelo', color: '#93c5fd', tier: 2 },
    { key: 'ideia', name: 'Ideia', color: '#fde047', tier: 3 }, { key: 'trofeu', name: 'Troféu', color: '#fbbf24', tier: 4 }, { key: 'coroa', name: 'Coroa', color: '#fcd34d', tier: 5 },
    { key: 'diamante', name: 'Diamante', color: '#67e8f9', tier: 6 }, { key: 'cometa', name: 'Cometa', color: '#c4b5fd', tier: 7 }
  ];
  const BACKS = [
    { key: 'sol', name: 'Pôr do sol', c1: '#ffb36b', c2: '#c2417a', tier: 0 }, { key: 'oceano', name: 'Oceano', c1: '#4fd1c5', c2: '#134e6f', tier: 0 },
    { key: 'floresta', name: 'Floresta', c1: '#6ee7a0', c2: '#14532d', tier: 1 }, { key: 'aurora', name: 'Aurora', c1: '#7cf0d4', c2: '#5b3fc4', tier: 2 },
    { key: 'doce', name: 'Algodão-doce', c1: '#ffc2e8', c2: '#8b5cf6', tier: 3 }, { key: 'lava', name: 'Lava', c1: '#ffb347', c2: '#b91c1c', tier: 4 },
    { key: 'galaxia', name: 'Galáxia', c1: '#a78bfa', c2: '#0f0a3c', tier: 5 }, { key: 'ouro', name: 'Ouro', c1: '#fde68a', c2: '#b45309', tier: 6 }, { key: 'diamante', name: 'Diamante', c1: '#cffafe', c2: '#0e7490', tier: 7 }
  ];
  // Estilo da roupa (estampa do moletom e da calça, desenhada em tempo real no personagem animado). `id` é o número que o desenho (anim.js) entende; 0 = liso (o padrão).
  const OUTFITS = [
    { key: 'liso', name: 'Liso', id: 0, tier: 0 }, { key: 'listrado', name: 'Listrado', id: 1, tier: 0 }, { key: 'bolinhas', name: 'Bolinhas', id: 2, tier: 1 },
    { key: 'xadrez', name: 'Xadrez', id: 3, tier: 2 }, { key: 'degrade', name: 'Degradê', id: 4, tier: 2 }, { key: 'estrelas', name: 'Estrelas', id: 5, tier: 3 },
    { key: 'camuflado', name: 'Camuflado', id: 6, tier: 3 }, { key: 'tiedye', name: 'Tie-dye', id: 7, tier: 4 }, { key: 'galaxia', name: 'Galáxia', id: 8, tier: 5 },
    { key: 'ouro', name: 'Dourado', id: 9, tier: 6 }, { key: 'holo', name: 'Holográfico', id: 10, tier: 7 }
  ];
  const LISTS = { color: COLORS, sticker: STICKERS, bg: BACKS, outfit: OUTFITS };
  const item = (list, key) => list.find(x => x.key === key) || null;
  // o que realmente vale para esta pessoa: a escolha só vale se o item existe e o título já foi conquistado; senão volta ao padrão (null)
  const pick = (kind, xp, key, guide) => { const it = item(LISTS[kind], key); return it && it.tier <= tierOf(xp) && !(kind === 'color' && it.key === BASE[guide]) && !(kind === 'outfit' && !it.id) ? it.key : null; };
  const outfitId = key => { const it = item(OUTFITS, key); return it ? it.id : 0; };
  const colorFile = (guide, color, face) => { const g = guide === 'tay' ? 'tay' : 'cut'; return `/img/${g}${color && color !== BASE[g] && item(COLORS, color) ? '-' + color : ''}${face ? '-face' : ''}.webp`; };
  // quantos graus o matiz da cor escolhida está da cor de fábrica do guia (-180 a 180): é a mesma conta que gerou as imagens coloridas, e o que recolore as poses (anim.js)
  const hueShift = (guide, color) => { const g = guide === 'tay' ? 'tay' : 'cut', c = item(COLORS, color), b = item(COLORS, BASE[g]); return c && b && c.key !== b.key ? ((c.hue - b.hue) % 360 + 540) % 360 - 180 : 0; };

  // ---- Guarda-roupa: fantasias do personagem (imagens em /img/fan/<chave>.webp, -t.webp miniatura e -face.webp rostinho).
  // Hoje só a Tay tem fantasias (guide: 'tay'); quando o Cut ganhar as dele, basta somar à lista com guide: 'cut'.
  // Dois jeitos de ter uma fantasia, sempre exigindo um TÍTULO (tier = posição em TIERS):
  //   • conquista (campo days): é dada de graça quando a pessoa chega ao título E já estudou `days` dias diferentes (a frequência conta, não só o XP);
  //   • loja (campo price): depois do título, compra-se com diamantes (que só vêm de estudar: lição, checkpoint, prova final e sequência de dias).
  const COSTUMES = [
    { key: 'gatinha',     name: 'Gatinha',      guide: 'tay', tier: 1, days: 3 },
    { key: 'dino',        name: 'Dino',         guide: 'tay', tier: 2, days: 6 },
    { key: 'doutora',     name: 'Doutora',      guide: 'tay', tier: 3, days: 12 },
    { key: 'astronauta',  name: 'Astronauta',   guide: 'tay', tier: 4, days: 21 },
    { key: 'maga',        name: 'Maga',         guide: 'tay', tier: 5, days: 30 },
    { key: 'princesa',    name: 'Princesa',     guide: 'tay', tier: 6, days: 45 },
    { key: 'anjo',        name: 'Anjinha',      guide: 'tay', tier: 7, days: 60 },
    { key: 'unicornio',   name: 'Unicórnio',    guide: 'tay', tier: 1, price: 60 },
    { key: 'panda',       name: 'Pandinha',     guide: 'tay', tier: 1, price: 60 },
    { key: 'vaquinha',    name: 'Vaquinha',     guide: 'tay', tier: 2, price: 80 },
    { key: 'azulzinho',   name: 'Azulzinho',    guide: 'tay', tier: 2, price: 90 },
    { key: 'eletrica',    name: 'Faísca',       guide: 'tay', tier: 2, price: 90 },
    { key: 'confeiteira', name: 'Confeiteira',  guide: 'tay', tier: 3, price: 120 },
    { key: 'skatista',    name: 'Skatista',     guide: 'tay', tier: 3, price: 120 },
    { key: 'cafezinho',   name: 'Café fofo',    guide: 'tay', tier: 3, price: 130 },
    { key: 'policial',    name: 'Policial',     guide: 'tay', tier: 4, price: 150 },
    { key: 'exploradora', name: 'Exploradora',  guide: 'tay', tier: 4, price: 150 },
    { key: 'vaqueira',    name: 'Vaqueira',     guide: 'tay', tier: 5, price: 180 },
    { key: 'pirata',      name: 'Pirata',       guide: 'tay', tier: 5, price: 180 },
    { key: 'diabinha',    name: 'Diabinha',     guide: 'tay', tier: 6, price: 220 }
  ];
  // diamantes de bônus quando a sequência de dias chega a estes números (uma vez só para cada marco)
  const STREAK_GEMS = { 3: 5, 7: 10, 14: 20, 30: 40, 60: 80, 100: 120 };
  const costume = key => COSTUMES.find(c => c.key === key) || null;
  const costumesOf = guide => COSTUMES.filter(c => c.guide === guide);
  // p = { xp, days, own: { chave: data } | null, gems }. Estado de uma fantasia para esta pessoa:
  // 'own' (já é dela) | 'buy' (à venda e dá para pagar) | 'poor' (à venda, falta diamante) | 'tier' (falta o título) | 'days' (conquista: título ok, faltam dias de estudo)
  const costumeState = (c, p) => {
    const own = p && p.own && Object.prototype.hasOwnProperty.call(p.own, c.key);
    if (own) return 'own';
    if (c.days) return tierOf(p && p.xp) < c.tier ? 'tier' : num(p && p.days) >= c.days ? 'own' : 'days';
    if (tierOf(p && p.xp) < c.tier) return 'tier';
    return num(p && p.gems) >= c.price ? 'buy' : 'poor';
  };
  const ownedCostumes = p => COSTUMES.filter(c => costumeState(c, p) === 'own').map(c => c.key);
  const api = { TIERS, tierOf, nextTier, frameOf, BASE, COLORS, STICKERS, BACKS, OUTFITS, LISTS, item, pick, outfitId, colorFile, hueShift, COSTUMES, STREAK_GEMS, costume, costumesOf, costumeState, ownedCostumes };
  if (typeof module === 'object' && module.exports) module.exports = api; else root.CodeUpRewards = api;
})(typeof window !== 'undefined' ? window : globalThis);
