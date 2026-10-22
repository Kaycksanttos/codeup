'use strict';
// Cenário do visual "Azul" (a floresta azul): céu de noite com estrelas e lua, montanhas, floresta de pinheiros azuis, uma coruja e vaga-lumes.
// É só enfeite (fica atrás do conteúdo e só aparece com body.wild). Desenhado em SVG, leve e sem imagens externas.
// O desenho tem 1000 de largura (de -300 a 700) para preencher também telas largas (computador) sem esticar.
(() => {
  const host = document.createElement('div'); host.id = 'scene'; host.setAttribute('aria-hidden', 'true');
  let seed = 11; const rnd = (a = 0, b = 1) => a + ((seed = seed * 16807 % 2147483647) / 2147483647) * (b - a);   // sorteio sempre igual (cenário não muda a cada abertura)
  const X0 = -300, X1 = 700;

  // pinheiro: 3 "andares" em triângulo (x, y = base, s = tamanho)
  const pine = (x, y, s, f) => `<path fill="${f}" d="M${x} ${y - 46 * s}L${x + 10 * s} ${y - 28 * s}H${x + 5 * s}L${x + 14 * s} ${y - 14 * s}H${x + 7 * s}L${x + 18 * s} ${y}H${x - 18 * s}L${x - 7 * s} ${y - 14 * s}H${x - 14 * s}L${x - 5 * s} ${y - 28 * s}H${x - 10 * s}Z"/>`;
  const row = (y, s, f, step, jitter) => { let h = ''; for (let x = X0 - 10; x < X1 + 20; x += step) h += pine(+(x + rnd(-jitter, jitter)).toFixed(1), +(y + rnd(-6, 6)).toFixed(1), +(s * rnd(.85, 1.2)).toFixed(2), f); return h; };
  // cordilheira: repete o mesmo desenho de 400 em 400 (o 1º e o último ponto têm a mesma altura, então emenda sem degrau)
  const ridge = pts => { let d = `M${X0 - 100} 800`; for (let t = -1; t <= 2; t++) pts.forEach(([x, y]) => { d += `L${x + t * 400} ${y}`; }); return d + `L${X1 + 100} 800Z`; };
  const caps = pts => { let d = ''; for (let t = -1; t <= 1; t++) pts.forEach(([x, y, w]) => { const X = x + t * 400; d += `M${X} ${y}L${X - w} ${y + w * 1.4}L${X - w * .3} ${y + w * 1.2}L${X} ${y + w * 1.7}L${X + w * .3} ${y + w * 1.2}L${X + w} ${y + w * 1.4}Z`; }); return d; };
  // colina ondulada: onda suave de ponta a ponta
  const hill = (y, amp) => { let d = `M${X0 - 100} ${y}Q${X0 - 25} ${y - amp} ${X0 + 50} ${y}`; for (let x = X0 + 200; x <= X1 + 200; x += 150) d += `T${x} ${y}`; return d + `V800H${X0 - 100}Z`; };

  let stars = ''; for (let i = 0; i < 46; i++) stars += `<circle class="${i % 3 ? '' : 'tw'}" style="animation-delay:${rnd(0, 3).toFixed(1)}s" cx="${rnd(-20, 420).toFixed(0)}" cy="${rnd(6, 300).toFixed(0)}" r="${rnd(.5, 1.5).toFixed(1)}" fill="#fff" opacity="${rnd(.4, .95).toFixed(2)}"/>`;
  let flies = ''; for (let i = 0; i < 26; i++) { const x = rnd(-250, 650).toFixed(0), y = rnd(430, 770).toFixed(0); flies += `<g class="ff" style="--dx:${rnd(-26, 26).toFixed(0)}px;--dy:${rnd(-30, 14).toFixed(0)}px;--d:${rnd(6, 12).toFixed(1)}s;animation-delay:${rnd(0, 6).toFixed(1)}s"><circle cx="${x}" cy="${y}" r="5" fill="#8fe3ff" opacity=".2"/><circle cx="${x}" cy="${y}" r="1.8" fill="#d6f6ff"/></g>`; }

  const m1 = [[0, 310], [58, 296], [98, 338], [168, 236], [238, 336], [296, 270], [352, 330], [400, 310]];
  const m2 = [[0, 430], [66, 392], [132, 446], [214, 368], [296, 438], [356, 398], [400, 430]];

  host.innerHTML = `
  <svg class="sky" viewBox="-100 0 600 420" preserveAspectRatio="xMidYMin slice">
    <defs><radialGradient id="mg"><stop offset="0" stop-color="#cfe8ff" stop-opacity=".5"/><stop offset="1" stop-color="#cfe8ff" stop-opacity="0"/></radialGradient></defs>
    ${stars}<circle cx="312" cy="96" r="70" fill="url(#mg)"/><circle cx="312" cy="96" r="18" fill="#eef6ff"/><circle cx="305" cy="91" r="3" fill="#cfe0f5" opacity=".7"/><circle cx="319" cy="102" r="2.2" fill="#cfe0f5" opacity=".6"/>
  </svg>
  <svg class="land" viewBox="${X0} 0 ${X1 - X0} 800" preserveAspectRatio="xMidYMax slice">
    <defs>
      <linearGradient id="m1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a7bb8"/><stop offset="1" stop-color="#1c3a6e"/></linearGradient>
      <linearGradient id="m2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f66c4"/><stop offset="1" stop-color="#10295f"/></linearGradient>
      <linearGradient id="mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fc2ff" stop-opacity="0"/><stop offset=".6" stop-color="#8fc2ff" stop-opacity=".2"/><stop offset="1" stop-color="#8fc2ff" stop-opacity="0"/></linearGradient>
    </defs>
    <path fill="url(#m1)" d="${ridge(m1)}"/>
    <path fill="#e3f0ff" opacity=".8" d="${caps([[168, 236, 20], [296, 270, 14], [58, 296, 13]])}"/>
    <rect x="${X0 - 100}" y="330" width="${X1 - X0 + 200}" height="120" fill="url(#mist)"/>
    <path fill="url(#m2)" d="${ridge(m2)}"/>
    <path fill="#1d52a6" d="${hill(486, 30)}"/>${row(500, .55, '#1d52a6', 21, 5)}
    <rect x="${X0 - 100}" y="508" width="${X1 - X0 + 200}" height="300" fill="#194787"/>
    <path fill="#143c7e" d="${hill(552, 32)}"/>${row(578, .85, '#143c7e', 25, 7)}
    <rect x="${X0 - 100}" y="586" width="${X1 - X0 + 200}" height="220" fill="#10316b"/>
    <path fill="#0c2859" d="${hill(642, 30)}"/>${row(676, 1.15, '#0c2859', 31, 9)}
    <rect x="${X0 - 100}" y="684" width="${X1 - X0 + 200}" height="130" fill="#0a2049"/>${row(800, 1.7, '#071a3c', 46, 12)}
    <g transform="translate(362 604)">
      <path d="M-30 30Q0 22 34 28" stroke="#0c2859" stroke-width="5" fill="none" stroke-linecap="round"/>
      <ellipse cx="0" cy="8" rx="13" ry="17" fill="#5878d6"/><ellipse cx="0" cy="13" rx="8" ry="11" fill="#c3d2ff" opacity=".7"/>
      <path d="M-12 -6L-9 -20L-2 -10ZM12 -6L9 -20L2 -10Z" fill="#5878d6"/>
      <circle cx="0" cy="-5" r="12" fill="#6b8be8"/>
      <g class="eye"><circle cx="-5" cy="-6" r="4.6" fill="#fff6d6"/><circle cx="-5" cy="-6" r="2.1" fill="#f59e0b"/></g>
      <g class="eye"><circle cx="5" cy="-6" r="4.6" fill="#fff6d6"/><circle cx="5" cy="-6" r="2.1" fill="#f59e0b"/></g>
      <path d="M0 -3L-2 1L2 1Z" fill="#fbbf24"/>
    </g>
    ${flies}
  </svg>`;
  document.body.prepend(host);
})();

// Cenário do visual "Rosa": jardim de cerejeiras ao entardecer, com um gatinho, borboletas e pétalas caindo.
(() => {
  const host = document.createElement('div'); host.id = 'scene2'; host.setAttribute('aria-hidden', 'true');
  let seed = 23; const rnd = (a = 0, b = 1) => a + ((seed = seed * 16807 % 2147483647) / 2147483647) * (b - a);
  const X0 = -300, X1 = 700;
  const hillY = (y0, amp, per, ph) => x => y0 + amp * Math.sin((x + ph) / per * Math.PI * 2);
  const hill = (f, fill) => { let d = `M${X0 - 100} 800`; for (let x = X0 - 100; x <= X1 + 100; x += 14) d += `L${x} ${f(x).toFixed(1)}`; return `<path fill="${fill}" d="${d}L${X1 + 100} 800Z"/>`; };
  const PAL = [['#f9a6cf', '#ffbcdb', '#ffcce3', '#ffd9ea'], ['#e98bbd', '#f19bc8', '#f7acd3', '#fbbddd'], ['#cf5f9f', '#da72ac', '#e386b9', '#ea9ac6'], ['#b44a8c', '#c25b9a', '#cd6ca7', '#d87db4']];   // mais longe = mais claro; mais perto = mais escuro
  const tree = (x, y, s, pl) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-4 0L-3 -44L3 -44L4 0Z" fill="#3d1a3f"/><path d="M0 -30L-14 -44M0 -34L12 -48" stroke="#3d1a3f" stroke-width="3" stroke-linecap="round"/>
    <circle cx="0" cy="-66" r="30" fill="${PAL[pl][0]}"/><circle cx="-24" cy="-50" r="22" fill="${PAL[pl][1]}"/><circle cx="25" cy="-52" r="24" fill="${PAL[pl][2]}"/><circle cx="2" cy="-84" r="21" fill="${PAL[pl][3]}"/>
    <circle cx="-10" cy="-72" r="3" fill="#fff" opacity=".7"/><circle cx="14" cy="-60" r="2.6" fill="#fff" opacity=".7"/><circle cx="-26" cy="-54" r="2.4" fill="#ff7ab8" opacity=".6"/><circle cx="8" cy="-90" r="2.4" fill="#ff7ab8" opacity=".6"/></g>`;
  const trees = (f, s0, step, jit, pl) => { let h = ''; for (let x = X0; x < X1; x += step) { const xx = x + rnd(-jit, jit); h += tree(+xx.toFixed(1), +(f(xx) + 6).toFixed(1), +(s0 * rnd(.8, 1.25)).toFixed(2), pl); } return h; };
  const spark = (x, y, r, o) => `<path class="tw" style="animation-delay:${rnd(0, 3).toFixed(1)}s" d="M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z" fill="#fff" opacity="${o}"/>`;

  let stars = ''; for (let i = 0; i < 40; i++) stars += `<circle class="${i % 3 ? '' : 'tw'}" style="animation-delay:${rnd(0, 3).toFixed(1)}s" cx="${rnd(-20, 420).toFixed(0)}" cy="${rnd(6, 280).toFixed(0)}" r="${rnd(.5, 1.4).toFixed(1)}" fill="#fff" opacity="${rnd(.4, .9).toFixed(2)}"/>`;
  let sparks = ''; for (let i = 0; i < 9; i++) sparks += spark(+rnd(-10, 410).toFixed(0), +rnd(20, 250).toFixed(0), +rnd(5, 9).toFixed(1), .85);
  const cloud = (x, y, s, o) => `<g transform="translate(${x} ${y}) scale(${s})" opacity="${o}" fill="#ffd9ec"><ellipse cx="0" cy="0" rx="46" ry="12"/><ellipse cx="-16" cy="-9" rx="22" ry="14"/><ellipse cx="14" cy="-12" rx="26" ry="16"/></g>`;

  const h1 = hillY(470, 22, 380, 40), h2 = hillY(548, 26, 330, 160), h3 = hillY(630, 28, 300, 90), h4 = hillY(716, 24, 360, 10);
  let flies = ''; const cols = ['#ffd27a', '#ff9ccb', '#c79bff', '#fff'];
  for (let i = 0; i < 14; i++) { const x = rnd(-250, 650), y = rnd(430, 770), c = cols[i % 4]; flies += `<g class="bf" style="--dx:${rnd(-30, 30).toFixed(0)}px;--dy:${rnd(-26, 12).toFixed(0)}px;--d:${rnd(5, 9).toFixed(1)}s;animation-delay:-${rnd(0, 6).toFixed(1)}s"><g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) rotate(${rnd(-25, 25).toFixed(0)})"><ellipse cx="-5" cy="-2" rx="6" ry="4" transform="rotate(-25 -5 -2)" fill="${c}"/><ellipse cx="5" cy="-2" rx="6" ry="4" transform="rotate(25 5 -2)" fill="${c}"/><ellipse cx="-4" cy="3" rx="4" ry="3" fill="${c}" opacity=".8"/><ellipse cx="4" cy="3" rx="4" ry="3" fill="${c}" opacity=".8"/><path d="M0 -4V6" stroke="#4a2146" stroke-width="1.6" stroke-linecap="round"/></g></g>`; }
  let petals = ''; for (let i = 0; i < 20; i++) petals += `<ellipse class="petal" style="--dx:${rnd(-70, 70).toFixed(0)}px;--d:${rnd(10, 18).toFixed(1)}s;animation-delay:-${rnd(0, 16).toFixed(1)}s" cx="${rnd(-250, 650).toFixed(0)}" cy="0" rx="${rnd(3, 5).toFixed(1)}" ry="${rnd(2, 3).toFixed(1)}" fill="${i % 2 ? '#ffd0e6' : '#ff9ccb'}"/>`;
  const catY = h3(362);

  host.innerHTML = `
  <svg class="sky" viewBox="-100 0 600 420" preserveAspectRatio="xMidYMin slice">
    <defs><radialGradient id="rmg"><stop offset="0" stop-color="#ffe3f3" stop-opacity=".55"/><stop offset="1" stop-color="#ffe3f3" stop-opacity="0"/></radialGradient>
    <mask id="rcm"><rect x="200" y="0" width="240" height="200" fill="#fff"/><circle cx="326" cy="86" r="19" fill="#000"/></mask></defs>
    ${stars}${sparks}${cloud(60, 150, 1.1, .35)}${cloud(250, 190, .9, .28)}${cloud(380, 120, 1, .3)}
    <circle cx="308" cy="98" r="74" fill="url(#rmg)"/><circle cx="308" cy="98" r="24" fill="#fff2d6" mask="url(#rcm)"/>
  </svg>
  <svg class="land" viewBox="${X0} 0 ${X1 - X0} 800" preserveAspectRatio="xMidYMax slice">
    ${hill(h1, '#a8457f')}${trees(h1, .34, 34, 10, 0)}
    ${hill(h2, '#853880')}${trees(h2, .46, 46, 12, 1)}
    ${hill(h3, '#672d7a')}${trees(h3, .6, 62, 16, 2)}
    ${hill(h4, '#47216b')}${trees(h4, .8, 86, 22, 3)}
    <rect x="${X0 - 100}" y="740" width="${X1 - X0 + 200}" height="80" fill="#3a1a5c"/>
    <g transform="translate(362 ${catY.toFixed(1)})">
      <path d="M16 -6C42 -8 46 -34 34 -46" stroke="#24103f" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M-19 0C-25 -30 -11 -46 0 -46C11 -46 25 -30 19 0Z" fill="#24103f"/>
      <circle cx="0" cy="-55" r="15" fill="#24103f"/>
      <path d="M-14 -62L-13 -80L-2 -67ZM14 -62L13 -80L2 -67Z" fill="#24103f"/><path d="M-11 -66L-11 -75L-5 -68ZM11 -66L11 -75L5 -68Z" fill="#ff7ab8"/>
      <g class="eye"><circle cx="-6" cy="-56" r="3.6" fill="#ffe08a"/><ellipse cx="-6" cy="-56" rx="1.2" ry="3" fill="#24103f"/></g><g class="eye"><circle cx="6" cy="-56" r="3.6" fill="#ffe08a"/><ellipse cx="6" cy="-56" rx="1.2" ry="3" fill="#24103f"/></g>
      <path d="M0 -52L-2 -50L2 -50Z" fill="#ff7ab8"/>
      <path d="M-4 -70L-12 -75L-12 -66ZM-4 -70L4 -75L4 -66Z" fill="#ff5fa8" transform="translate(14 -2)"/><circle cx="10" cy="-72" r="2.4" fill="#ffd27a"/>
    </g>
    ${flies}${petals}
  </svg>`;
  document.body.prepend(host);
})();
