'use strict';
// Cenário do mapa de lições (visual Azul): uma clareira de floresta à noite desenhada ao longo da trilha, com pinheiros, pedras, moitas,
// lago, coruja dormindo, placa com a logo da trilha, lampião e vaga-lumes. Fica atrás do caminho e rola junto com ele.
// Tudo é SVG desenhado aqui (sem imagens externas, só a logo da placa). As posições são sorteadas com semente fixa: o mapa não "muda de lugar" a cada abertura.
(() => {
  const rg = s => () => (s = s * 16807 % 2147483647) / 2147483647;
  const n1 = v => +v.toFixed(1);

  // ---------------------------------------------------------------- desenhos (símbolos reaproveitados)
  // pinheiro: andares em triângulo com as pontas dos galhos caindo, barra recortada, sombra por andar e brilho da lua no lado esquerdo
  const TIERS = {
    a: [[4, 54, 22], [26, 84, 31], [50, 114, 39], [74, 141, 47]],
    b: [[2, 42, 16], [20, 66, 23], [40, 90, 30], [60, 114, 37], [82, 141, 45]],
    c: [[6, 70, 32], [34, 108, 42], [66, 141, 49]],
  };
  const side = (ap, base, hw, r, k) => {
    const hh = base - ap, out = [];
    for (let j = 1; j <= k; j++) {
      const f = j / k, fn = (j - .55) / k;
      out.push([hw * fn * (.7 + r() * .1) - 1, ap + hh * fn + 2], [hw * f * (j == k ? 1 : .9 + r() * .1), ap + hh * f]);
    }
    return out;
  };
  const tier = (ap, base, hw, r) => {
    const k = hw > 36 ? 4 : 3, R = side(ap, base, hw, r, k), L = side(ap, base, hw, r, k);
    let d = `M50 ${ap}`; R.forEach(([x, y]) => { d += `L${n1(50 + x)} ${n1(y)}`; });
    const m = 4, w = 2 * hw / m;
    for (let s = 0; s < m; s++) { const xr = 50 + hw - s * w; d += `Q${n1(xr - w / 2)} ${n1(base - 8 - r() * 3)} ${n1(xr - w)} ${base}`; }
    for (let i = L.length - 1; i >= 0; i--) d += `L${n1(50 - L[i][0])} ${n1(L[i][1])}`;
    let e = `M50 ${ap}`; L.forEach(([x, y]) => { e += `L${n1(50 - x)} ${n1(y)}`; });
    return { d: d + 'Z', e };
  };
  const pine = (id, lit, seed, tiers) => {
    const r = rg(seed); let s = `<symbol id="${id}" viewBox="0 0 100 150"><ellipse cx="50" cy="146" rx="40" ry="5" fill="#010a24" opacity=".5"/><path d="M44 118h12v28H44z" fill="url(#msTrunk)"/>`;
    const T = tiers.map(([a, b, h]) => tier(a, b, h, r));
    for (let i = T.length - 1; i >= 0; i--) {
      s += `<path d="${T[i].d}" fill="url(#${lit ? 'msPineL' : 'msPineD'})"/><path d="${T[i].d}" fill="url(#msPineV)"/>`;
      if (lit) s += `<path d="${T[i].e}" fill="none" stroke="#8cf2dc" stroke-opacity=".5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    return s + '</symbol>';
  };

  // pedras com 3 faces (topo claro, lado mais escuro) e brilho na quina
  const rock = (id, vb, base, top, left, right, hi, sh) => `<symbol id="${id}" viewBox="${vb}">${sh}${base}${left}${right}${top}${hi}</symbol>`;
  const ROCKS = [
    rock('msRockA', '0 0 100 66', '<path d="M4 58L10 34Q14 18 34 12L62 10Q84 14 92 34L97 58Q50 67 4 58Z" fill="#2a50bb"/>',
      '<path d="M10 34Q14 18 34 12L62 10Q84 14 92 34L70 39L40 41Z" fill="#6490f6"/>', '<path d="M4 58L10 34L40 41L46 61Q22 63 4 58Z" fill="#3b69de"/>', '<path d="M97 58L92 34L70 39L58 62Q80 62 97 58Z" fill="#1c3993"/>',
      '<path d="M14 27Q20 17 36 13L60 11" stroke="#b4ccff" stroke-opacity=".6" stroke-width="2" fill="none" stroke-linecap="round"/>', '<ellipse cx="50" cy="62" rx="48" ry="4.5" fill="#010a24" opacity=".5"/>'),
    rock('msRockB', '0 0 100 66', '<path d="M2 58L14 30Q26 12 52 12Q80 14 90 36L98 58Q50 66 2 58Z" fill="#274cb6"/>',
      '<path d="M14 30Q26 12 52 12Q80 14 90 36L64 40L34 38Z" fill="#5d8bf3"/>', '<path d="M2 58L14 30L34 38L40 61Q18 62 2 58Z" fill="#3764d8"/>', '<path d="M98 58L90 36L64 40L54 62Q80 62 98 58Z" fill="#1b3790"/>',
      '<path d="M18 26Q28 15 50 13" stroke="#b4ccff" stroke-opacity=".55" stroke-width="2" fill="none" stroke-linecap="round"/>', '<ellipse cx="50" cy="62" rx="48" ry="4.5" fill="#010a24" opacity=".5"/>'),
    rock('msRockC', '0 0 100 66', '<path d="M6 58L18 24Q30 8 50 8Q72 10 82 28L94 58Q50 66 6 58Z" fill="#2b53c2"/>',
      '<path d="M18 24Q30 8 50 8Q72 10 82 28L62 34L36 33Z" fill="#6a96f8"/>', '<path d="M6 58L18 24L36 33L42 61Q20 62 6 58Z" fill="#3e6de2"/>', '<path d="M94 58L82 28L62 34L52 62Q76 62 94 58Z" fill="#1e3c98"/>',
      '<path d="M22 21Q32 10 50 9" stroke="#b9d0ff" stroke-opacity=".6" stroke-width="2" fill="none" stroke-linecap="round"/>', '<ellipse cx="50" cy="62" rx="46" ry="4.5" fill="#010a24" opacity=".5"/>'),
  ].join('');

  // tufos de capim
  const tuft = (id, grad, n, seed) => {
    const r = rg(seed); let s = `<symbol id="${id}" viewBox="0 0 60 46">`;
    for (let i = 0; i < n; i++) {
      const o = i - (n - 1) / 2, bx = 30 + o * 4.6, h = 18 + r() * 22 - Math.abs(o) * 2.2, tx = bx + o * 6.5 + (r() - .5) * 6;
      s += `<path d="M${n1(bx - 3.2)} 46Q${n1(bx - 1)} ${n1(46 - h * .6)} ${n1(tx)} ${n1(46 - h)}Q${n1(bx + 1.5)} ${n1(46 - h * .5)} ${n1(bx + 3.2)} 46Z" fill="url(#${grad})"/>`;
    }
    return s + '</symbol>';
  };

  // moita: massa escura de folhas com luz suave no alto e florzinhas
  const bush = (id, c1, c2, flower) => `<symbol id="${id}" viewBox="0 0 120 76"><ellipse cx="60" cy="70" rx="54" ry="5" fill="#010a24" opacity=".45"/>
    <g fill="${c1}"><circle cx="30" cy="50" r="23"/><circle cx="92" cy="51" r="23"/><circle cx="62" cy="42" r="30"/><circle cx="44" cy="30" r="19"/><circle cx="80" cy="28" r="17"/><rect x="10" y="52" width="100" height="17" rx="8"/></g>
    <g fill="${c2}" opacity=".62"><circle cx="27" cy="44" r="14"/><circle cx="58" cy="33" r="20"/><circle cx="41" cy="23" r="11"/><circle cx="77" cy="21" r="9"/><circle cx="90" cy="44" r="11"/></g>
    <ellipse cx="60" cy="64" rx="50" ry="8" fill="#041f2c" opacity=".45"/>
    <path d="M34 20Q44 12 56 15M64 17Q74 12 84 17M14 42Q18 34 26 31" stroke="#a8f0d0" stroke-opacity=".3" stroke-width="2" fill="none" stroke-linecap="round"/>
    <circle cx="50" cy="48" r="2.3" fill="${flower}"/><circle cx="78" cy="40" r="2.1" fill="${flower}"/><circle cx="33" cy="58" r="1.9" fill="${flower}"/><circle cx="97" cy="56" r="2.1" fill="${flower}"/><circle cx="64" cy="26" r="1.8" fill="${flower}"/></symbol>`;

  // cogumelos que brilham e florzinhas
  const SMALL = `<symbol id="msShroom" viewBox="0 0 70 42"><ellipse cx="35" cy="39" rx="30" ry="3.5" fill="#010a24" opacity=".4"/>
    <path d="M14 38Q13 31 15 22L21 22Q22 31 22 38Z" fill="#dbe9ff"/><path d="M5 24Q6 8 18 8Q30 8 31 24Q18 27 5 24Z" fill="#7ee8ff"/><circle cx="12" cy="17" r="2.2" fill="#fff" opacity=".85"/><circle cx="21" cy="14" r="1.8" fill="#fff" opacity=".85"/>
    <path d="M44 38Q43 33 45 26L50 26Q51 33 51 38Z" fill="#dbe9ff"/><path d="M36 28Q37 17 47 17Q58 17 58 28Q47 30 36 28Z" fill="#ff9be6"/><circle cx="43" cy="23" r="1.8" fill="#fff" opacity=".85"/><circle cx="51" cy="22" r="1.5" fill="#fff" opacity=".85"/>
    <path d="M60 39Q60 35 61 31L64 31Q65 35 65 39Z" fill="#dbe9ff"/><path d="M55 32Q56 24 62 24Q69 24 69 32Q62 34 55 32Z" fill="#7ee8ff"/></symbol>
    <symbol id="msFlow" viewBox="0 0 44 40"><ellipse cx="22" cy="37" rx="18" ry="2.6" fill="#010a24" opacity=".35"/>
    <path d="M10 38Q10 26 8 16M22 38Q22 24 24 10M34 38Q34 28 36 20" stroke="#2f9d62" stroke-width="2" fill="none" stroke-linecap="round"/>
    <g fill="#cfe4ff"><circle cx="8" cy="12" r="3"/><circle cx="4.6" cy="15" r="3"/><circle cx="11.4" cy="15" r="3"/><circle cx="8" cy="18" r="3"/></g><circle cx="8" cy="15" r="2" fill="#ffd36b"/>
    <g fill="#8fbaff"><circle cx="24" cy="6" r="3.3"/><circle cx="20.4" cy="9.4" r="3.3"/><circle cx="27.6" cy="9.4" r="3.3"/><circle cx="24" cy="12.8" r="3.3"/></g><circle cx="24" cy="9.4" r="2.2" fill="#fff6c9"/>
    <g fill="#ffe08a"><circle cx="36" cy="16" r="2.7"/><circle cx="33" cy="19" r="2.7"/><circle cx="39" cy="19" r="2.7"/><circle cx="36" cy="22" r="2.7"/></g><circle cx="36" cy="19" r="1.7" fill="#fff"/></symbol>`;

  // colina de musgo com capim e samambaias (canto da clareira)
  const mound = () => {
    const r = rg(91); let b = '';
    for (let i = 0; i < 26; i++) { const x = 14 + r() * 192, topy = 34 + 28 * Math.abs((x - 110) / 100) ** 1.6 + r() * 6, h = 8 + r() * 12, l = (r() - .5) * 10; b += `<path d="M${n1(x - 2.4)} ${n1(topy + 5)}Q${n1(x + l * .3)} ${n1(topy - h * .5)} ${n1(x + l)} ${n1(topy - h)}Q${n1(x + 1)} ${n1(topy - h * .4)} ${n1(x + 2.4)} ${n1(topy + 5)}Z" fill="url(#msGr)"/>`; }
    return `<symbol id="msMound" viewBox="0 0 220 110"><ellipse cx="110" cy="105" rx="106" ry="7" fill="#010a24" opacity=".45"/>
      <path d="M0 106Q8 54 58 38Q110 20 162 40Q212 56 220 106Z" fill="url(#msMound)"/><path d="M16 74Q58 40 110 34Q156 36 198 66" stroke="#a6ec8e" stroke-opacity=".5" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M0 106Q8 54 58 38Q40 70 44 106Z" fill="#063a3a" opacity=".35"/>${b}</symbol>`;
  };

  const DEFS = `<defs>
    <linearGradient id="msPineL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#37a398"/><stop offset=".45" stop-color="#1d7a82"/><stop offset="1" stop-color="#0e476a"/></linearGradient>
    <linearGradient id="msPineD" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1d6c79"/><stop offset=".5" stop-color="#114c68"/><stop offset="1" stop-color="#0a2f58"/></linearGradient>
    <linearGradient id="msPineV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a6fff0" stop-opacity=".16"/><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#01122e" stop-opacity=".55"/></linearGradient>
    <linearGradient id="msTrunk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4a4a8f"/><stop offset="1" stop-color="#1e2150"/></linearGradient>
    <linearGradient id="msGr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#63d58a"/><stop offset="1" stop-color="#1b6b49"/></linearGradient>
    <linearGradient id="msGt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3cb3b0"/><stop offset="1" stop-color="#145a6e"/></linearGradient>
    <radialGradient id="msBush" cx=".4" cy=".3" r=".9"><stop offset="0" stop-color="#3a9f78"/><stop offset=".6" stop-color="#1a6a56"/><stop offset="1" stop-color="#0d3f45"/></radialGradient>
    <radialGradient id="msBushT" cx=".4" cy=".3" r=".9"><stop offset="0" stop-color="#3fb5ad"/><stop offset=".6" stop-color="#1b7285"/><stop offset="1" stop-color="#0d3f63"/></radialGradient>
    <linearGradient id="msMound" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#58b35c"/><stop offset=".55" stop-color="#2a7a4c"/><stop offset="1" stop-color="#0f3f45"/></linearGradient>
    <linearGradient id="msWood" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9a6a3f"/><stop offset="1" stop-color="#5a3a2a"/></linearGradient>
    <linearGradient id="msWoodB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b98550"/><stop offset=".5" stop-color="#8a5a35"/><stop offset="1" stop-color="#5f3c2a"/></linearGradient>
    <radialGradient id="msPond" cx=".5" cy=".42" r=".6"><stop offset="0" stop-color="#3b84ff"/><stop offset=".65" stop-color="#1b55d6"/><stop offset="1" stop-color="#0f3499"/></radialGradient>
    <linearGradient id="msOwl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7f9bff"/><stop offset="1" stop-color="#3d58cf"/></linearGradient>
    <radialGradient id="msLamp" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff0b0"/><stop offset=".55" stop-color="#ffc247"/><stop offset="1" stop-color="#e0781c"/></radialGradient>
  </defs>`;
  const SPRITE = DEFS + [pine('msPineA', 1, 5, TIERS.a), pine('msPineB', 1, 17, TIERS.b), pine('msPineC', 1, 29, TIERS.c), pine('msPineDA', 0, 41, TIERS.a), pine('msPineDB', 0, 53, TIERS.b), pine('msPineDC', 0, 67, TIERS.c)].join('')
    + ROCKS + tuft('msTuftA', 'msGr', 7, 3) + tuft('msTuftB', 'msGr', 5, 8) + tuft('msTuftC', 'msGt', 6, 13) + bush('msBushA', '#15594f', '#2f9a80', '#bff0ff') + bush('msBushB', '#124f68', '#2b88a4', '#ffe08a') + SMALL + mound();

  // ---------------------------------------------------------------- peças com movimento (SVG próprio)
  const POND = () => `<svg class="sp pond" viewBox="0 0 250 118" aria-hidden="true">
    <ellipse cx="125" cy="72" rx="122" ry="44" fill="#1d4fc8" opacity=".3"/><ellipse cx="125" cy="68" rx="114" ry="40" fill="url(#msPond)"/>
    <path d="M26 62Q60 30 126 28Q196 30 226 60" stroke="#79b4ff" stroke-opacity=".55" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <ellipse cx="122" cy="62" rx="92" ry="28" fill="#3f8bff" opacity=".28"/>
    <g class="rip" fill="none" stroke="#d6e8ff" stroke-linecap="round"><ellipse cx="88" cy="62" rx="30" ry="7" stroke-opacity=".34" stroke-width="1.6"/><ellipse cx="88" cy="62" rx="16" ry="3.4" stroke-opacity=".3" stroke-width="1.4"/>
      <ellipse cx="170" cy="76" rx="26" ry="6" stroke-opacity=".28" stroke-width="1.5"/><path d="M120 50Q140 46 160 50" stroke-opacity=".3" stroke-width="1.5"/></g>
    <ellipse cx="150" cy="56" rx="15" ry="4" fill="#e6f2ff" opacity=".5"/><ellipse cx="150" cy="56" rx="26" ry="7" fill="#cfe4ff" opacity=".12"/>
    <g transform="translate(58 78)"><ellipse rx="15" ry="5.5" fill="#2da56c"/><path d="M0 0L15 -2" stroke="#0e5a40" stroke-width="1.4"/><ellipse rx="15" ry="5.5" fill="none" stroke="#8ff0b8" stroke-opacity=".45"/></g>
    <g transform="translate(196 60) scale(.8)"><ellipse rx="15" ry="5.5" fill="#2da56c"/><path d="M0 0L-14 -3" stroke="#0e5a40" stroke-width="1.4"/></g>
    <g transform="translate(70 70)"><circle r="4.2" fill="#ffb3e8"/><circle r="2" fill="#fff6c9"/></g>
    <use href="#msRockC" x="176" y="22" width="52" height="34"/><use href="#msRockA" x="14" y="74" width="40" height="26"/>
    <g stroke-linecap="round" fill="none"><path d="M214 96Q212 70 206 52M222 98Q224 74 230 58M206 98Q202 80 196 66" stroke="#2fa163" stroke-width="3"/><path d="M230 58L230 46" stroke="#7a4a2a" stroke-width="5"/><path d="M206 52L206 42" stroke="#7a4a2a" stroke-width="5"/></g>
  </svg>`;

  const OWL = () => `<svg class="sp owl" viewBox="0 0 130 124" aria-hidden="true">
    <ellipse cx="65" cy="116" rx="54" ry="5" fill="#010a24" opacity=".5"/>
    <path d="M10 112L18 84Q26 66 52 64L88 64Q110 68 116 88L122 112Q66 120 10 112Z" fill="#2a50bb"/><path d="M18 84Q26 66 52 64L88 64Q110 68 116 88L86 94L48 92Z" fill="#6a96f8"/><path d="M10 112L18 84L48 92L54 116Q28 116 10 112Z" fill="#3b69de"/><path d="M122 112L116 88L86 94L74 117Q100 116 122 112Z" fill="#1c3993"/>
    <path d="M24 78Q32 68 52 66L84 65" stroke="#b9d0ff" stroke-opacity=".5" stroke-width="2" fill="none" stroke-linecap="round"/>
    <g class="br"><path d="M40 70L44 28L58 40Z M90 70L86 28L72 40Z" fill="#5774e2"/><path d="M42 26L50 34L44 38ZM88 26L80 34L86 38Z" fill="#9db6ff" opacity=".55"/>
      <ellipse cx="65" cy="52" rx="28" ry="30" fill="url(#msOwl)"/><ellipse cx="65" cy="62" rx="17" ry="19" fill="#b9c8ff" opacity=".9"/>
      <path d="M54 58Q58 62 62 58M64 64Q68 68 72 64M56 70Q60 74 64 70M68 72Q72 76 76 72" stroke="#7e95ea" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <path d="M38 52Q32 66 40 80L46 72Q40 62 44 54ZM92 52Q98 66 90 80L84 72Q90 62 86 54Z" fill="#3a54c8"/>
      <circle cx="53" cy="44" r="11" fill="#9db4ff"/><circle cx="77" cy="44" r="11" fill="#9db4ff"/>
      <path d="M46 45Q53 51 60 45M70 45Q77 51 84 45" stroke="#15246e" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M45 41L48 43M61 41L58 43M69 41L72 43M85 41L82 43" stroke="#15246e" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M61 51L65 58L69 51Z" fill="#ffb020"/></g>
    <path d="M52 66l-4 8h8zM78 66l-4 8h8z" fill="#ffa21a"/>
    <g class="zz" font-family="Nunito,system-ui,sans-serif" font-weight="900" fill="#cfe0ff"><text class="z1" x="98" y="30" font-size="13">z</text><text class="z2" x="108" y="18" font-size="17">z</text><text class="z3" x="120" y="4" font-size="21">Z</text></g>
  </svg>`;

  const SIGN = logo => `<div class="sp sign"><svg viewBox="0 0 130 156" aria-hidden="true"><ellipse cx="38" cy="150" rx="34" ry="5" fill="#010a24" opacity=".5"/>
    <rect x="30" y="26" width="12" height="122" rx="2" fill="url(#msWood)"/><path d="M30 30h4v116h-4z" fill="#d9a56f" opacity=".35"/>
    <path d="M6 24L92 14L124 42L92 70L6 62Z" fill="url(#msWoodB)" stroke="#3b2418" stroke-width="2.2" stroke-linejoin="round"/><path d="M10 28L92 19L118 42" stroke="#e4b27a" stroke-opacity=".55" stroke-width="2" fill="none" stroke-linecap="round"/>
    <circle cx="14" cy="30" r="2" fill="#3b2418"/><circle cx="14" cy="56" r="2" fill="#3b2418"/><path d="M12 140Q20 128 30 140M44 142Q52 130 60 142" stroke="#2f9d62" stroke-width="3" fill="none" stroke-linecap="round"/></svg>
    <img src="/img/logo-${logo}.webp" alt="" width="44" height="44"></div>`;

  const LAMP = () => `<div class="sp lamp"><i class="lgl"></i><svg viewBox="0 0 90 160" aria-hidden="true"><ellipse cx="22" cy="154" rx="24" ry="4.5" fill="#010a24" opacity=".5"/>
    <rect x="18" y="14" width="8" height="140" rx="2" fill="url(#msWood)"/><path d="M22 18H64" stroke="#4d3022" stroke-width="5" stroke-linecap="round"/><path d="M26 34L40 20" stroke="#4d3022" stroke-width="3.4" stroke-linecap="round"/><path d="M62 18V32" stroke="#2c2018" stroke-width="2"/>
    <path d="M52 32H72L70 38H54Z" fill="#2c2018"/><rect x="54" y="38" width="16" height="26" rx="3" fill="url(#msLamp)"/><path d="M62 38V64M54 51H70" stroke="#3b2a1d" stroke-width="1.6"/><path d="M53 64H71L69 69H55Z" fill="#2c2018"/>
    <path d="M10 148Q14 134 20 148M28 150Q34 136 40 150" stroke="#2f9d62" stroke-width="3" fill="none" stroke-linecap="round"/></svg></div>`;

  // ---------------------------------------------------------------- montagem ao longo da trilha
  const SYM = {
    pine: [['msPineA', 100, 150], ['msPineB', 100, 150], ['msPineC', 100, 150]], dpine: [['msPineDA', 100, 150], ['msPineDB', 100, 150], ['msPineDC', 100, 150]],
    rock: [['msRockA', 100, 66], ['msRockB', 100, 66], ['msRockC', 100, 66]], tuft: [['msTuftA', 60, 46], ['msTuftB', 60, 46], ['msTuftC', 60, 46]],
    bush: [['msBushA', 120, 76], ['msBushB', 120, 76]], shroom: [['msShroom', 70, 42]], flow: [['msFlow', 44, 40]], mound: [['msMound', 220, 110]],
  };
  const FEATS_WIDE = ['pond', 'sign', 'mound', 'lamp', 'pond', 'pines'];
  const FEATS_MID = ['owl', 'pines', 'rocks', 'lamp', 'bush', 'owl', 'rocks', 'pines'];

  function build(o) {
    const { X, M, NR, track, cur = -1, W = 358 } = o, H = M.top + NR * M.row + 10, r = rg(track == 'sql' ? 77 : 31);
    const cy = k => M.top + 41 + k * M.row;
    const pathX = yy => { const t = (yy - cy(0)) / M.row, k = Math.max(0, Math.min(NR - 2, Math.floor(t))), f = Math.max(0, Math.min(1, t - k)), s = f * f * (3 - 2 * f); return X[k] + (X[Math.min(k + 1, NR - 1)] - X[k]) * s; };
    const items = [], put = (y, html) => items.push([y, html]);
    const pick = a => a[Math.floor(r() * a.length)];
    // peça reaproveitada (símbolo): centro em xPct, base em yb, largura w
    const sp = (kind, xPct, yb, w, flip, cls = '') => { const [id, vw, vh] = pick(SYM[kind]), h = w * vh / vw; put(yb, `<svg class="sp${flip ? ' f' : ''} ${cls}" style="left:${n1(xPct)}%;top:${n1(yb - h)}px;width:${n1(w)}px;margin-left:${n1(-w / 2)}px" viewBox="0 0 ${vw} ${vh}" aria-hidden="true"><use href="#${id}"/></svg>`); };
    const box = (html, xPct, yb, w, h, flip, dx = 0) => put(yb, html.replace('class="sp', `style="left:${n1(xPct)}%;top:${n1(yb - h)}px;width:${n1(w)}px;margin-left:${n1(-w / 2 + dx)}px" class="sp${flip ? ' f' : ''}`));
    let nw = 0, nm = 0;
    for (let k = 0; k < NR; k++) {
      const x = X[k], dxm = Math.abs(x - 50), left = x > 50, y0 = cy(k);
      const room = (left ? x - 27 : 100 - x - 27) * W / 100;                       // espaço livre ao lado do caminho (px)
      const cx = left ? (x - 27) / 2 : 100 - (100 - x - 27) / 2, sgn = left ? -1 : 1;  // centro do espaço livre (%)
      const yb = y0 + 44 + r() * 26;
      const big = dxm >= 12 && room > 70 && k != cur && k != cur - 1 && (dxm > 22 || (k + (track == 'sql' ? 1 : 0)) % 2 == 0);
      if (big) {
        const wide = dxm > 22, f = wide ? FEATS_WIDE[nw++ % FEATS_WIDE.length] : FEATS_MID[nm++ % FEATS_MID.length];
        if (f == 'pond') { const w = Math.min(250, room * 1.3 + 30); box(POND(), cx + sgn * 2, yb + 4, w, w * 118 / 250, !left, 0); }
        else if (f == 'sign') box(SIGN(track == 'sql' ? 'sql' : 'python'), cx, yb + 4, 104, 125, false);
        else if (f == 'mound') { const w = Math.min(230, room * 1.5 + 30); sp('mound', cx + sgn * 6, yb + 6, w, !left); sp('flow', cx - sgn * 8, yb - 4, 40, !left); }
        else if (f == 'lamp') box(LAMP(), cx, yb + 10, 66, 118, false, 6);
        else if (f == 'owl') box(OWL(), cx, yb + 2, Math.min(118, room), Math.min(118, room) * 124 / 130, !left);
        else if (f == 'pines') { const n = room > 120 ? 3 : 2; for (let i = 0; i < n; i++) sp('pine', cx + sgn * (i - (n - 1) / 2) * 11 + (r() - .5) * 4, yb - 14 + (i % 2 ? 22 : 0) - r() * 8, 62 + r() * 34 + (i == 1 ? 14 : 0), r() > .5); }
        else if (f == 'rocks') { sp('rock', cx - 3, yb + 4, 54 + r() * 30, r() > .5); sp('rock', cx + 11, yb + 12, 30 + r() * 16, r() > .5); sp('tuft', cx + 4, yb + 6, 36, r() > .5, 'sway'); }
        else if (f == 'bush') { sp('bush', cx, yb + 8, 78 + r() * 22, r() > .5); sp('tuft', cx - 12, yb + 12, 32, false, 'sway'); }
      }
      // árvores grandes cortadas pela borda da tela (moldura)
      if (dxm < 14 || r() > .45) { const lp = r() > .5, wd = 96 + r() * 46, ys = y0 + 56 + r() * 30; sp(r() > .4 ? 'dpine' : 'pine', lp ? -2 : 102, ys + wd * .55, wd, lp); }
      // capim, flores, pedrinhas, cogumelos, moitas e pinheirinhos de fundo soltos, fora do caminho
      for (let i = 0; i < 5; i++) {
        for (let t = 0; t < 8; t++) {
          const px = 3 + r() * 94, py = y0 - 30 + r() * M.row;
          if (Math.abs(px - pathX(py)) < 20) continue;
          const kk = r();
          if (kk < .32) sp('tuft', px, py + 22, 28 + r() * 16, r() > .5, r() > .66 ? 'sway' : ''); else if (kk < .46) sp('flow', px, py + 18, 28 + r() * 8, r() > .5); else if (kk < .62) sp('rock', px, py + 14, 24 + r() * 18, r() > .5);
          else if (kk < .70) sp('shroom', px, py + 14, 36 + r() * 10, r() > .5, 'glow'); else if (kk < .82) sp('bush', px, py + 20, 58 + r() * 26, r() > .5); else sp('dpine', px, py + 30, 44 + r() * 30, r() > .5);
          break;
        }
      }
    }
    items.sort((a, b) => a[0] - b[0]);
    let ff = ''; for (let i = 0; i < Math.round(NR * 1.6); i++) ff += `<i class="ffl" style="left:${n1(r() * 100)}%;top:${Math.round(r() * H)}px;--dx:${Math.round((r() - .5) * 40)}px;--dy:${Math.round(-10 - r() * 34)}px;--d:${n1(5 + r() * 6)}s;animation-delay:-${n1(r() * 8)}s"></i>`;
    return `<div class="scn" aria-hidden="true">${items.map(i => i[1]).join('')}${ff}</div>`;
  }

  // o sprite (gradientes e símbolos) entra uma vez só na página
  const sprite = () => { if (document.getElementById('msSprite')) return; const d = document.createElement('div'); d.id = 'msSprite'; d.setAttribute('aria-hidden', 'true'); d.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden'; d.innerHTML = `<svg width="0" height="0" xmlns="http://www.w3.org/2000/svg">${SPRITE}</svg>`; document.body.prepend(d); };
  window.mapScene = o => { sprite(); return build(o); };
})();
