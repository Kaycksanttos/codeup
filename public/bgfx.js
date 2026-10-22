'use strict';
// Fundo do CodeUp: aurora de cores suaves (segue a trilha) + rede de pontos de dados que se ligam por linhas finas e reagem ao toque/mouse.
// Leve: aurora é só CSS (placa de vídeo), a rede usa poucos pontos; pausa com a aba escondida, respeita "reduzir movimento" e fica mais calma na prática.
(() => {
  const fx = document.createElement('div'); fx.id = 'bgfx'; fx.setAttribute('aria-hidden', 'true');
  fx.innerHTML = '<i class=b1></i><i class=b2></i><i class=b3></i><canvas></canvas><i class=vg></i>';
  document.body.prepend(fx);
  const cv = fx.querySelector('canvas'), ctx = cv.getContext('2d');
  if (!ctx) return;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const weak = (navigator.deviceMemory && navigator.deviceMemory <= 2) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) || (navigator.connection && navigator.connection.saveData);
  let W = 0, H = 0, dpr = 1, pts = [], c1 = [75, 139, 190], c2 = [255, 212, 59], raf = 0, last = 0;
  const mouse = { x: -999, y: -999 }, rnd = (a, b) => a + Math.random() * (b - a);

  function colors() {
    const cs = getComputedStyle(document.body), p = v => { const m = /^#?([0-9a-f]{6})$/i.exec(String(cs.getPropertyValue(v)).trim()); return m ? [0, 2, 4].map(i => parseInt(m[1].substr(i, 2), 16)) : null; };
    c1 = p('--acc') || c1; c2 = p('--acc2') || c2;
  }
  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, weak ? 1 : 1.5); W = innerWidth; H = innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.width = W + 'px'; cv.style.height = H + 'px';
    const n = Math.min(weak ? 26 : 64, Math.round(W * H / 10500));
    pts = Array.from({ length: n }, () => ({ x: rnd(0, W), y: rnd(0, H), vx: rnd(-.18, .18), vy: rnd(-.18, .18), r: rnd(1.1, 2.6), k: Math.random() < .22 ? 1 : 0, ph: rnd(0, 6.28) }));
  }
  const col = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a.toFixed(3)})`;

  function draw(dt, t, calm) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    const L = W < 600 ? 105 : 140, L2 = L * L;
    for (const p of pts) {
      p.x += p.vx * dt * 60 * (calm ? .5 : 1); p.y += p.vy * dt * 60 * (calm ? .5 : 1);
      if (p.x < -20) p.x = W + 20; else if (p.x > W + 20) p.x = -20; if (p.y < -20) p.y = H + 20; else if (p.y > H + 20) p.y = -20;
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;      // o dedo/mouse empurra os pontos de leve
      if (d2 < 14000) { const f = (1 - d2 / 14000) * .9; p.x += dx / (Math.sqrt(d2) + 1) * f * 2; p.y += dy / (Math.sqrt(d2) + 1) * f * 2; }
    }
    ctx.lineWidth = 1;
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      const a = pts[i], b = pts[j], dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
      if (d2 < L2) { ctx.strokeStyle = col(a.k || b.k ? c2 : c1, (1 - d2 / L2) * .42); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
    }
    for (const p of pts) {                                                         // pontos com brilho que "respira"
      const pulse = .6 + .4 * Math.sin(t * 1.4 + p.ph), c = p.k ? c2 : c1;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6); g.addColorStop(0, col(c, .38 * pulse)); g.addColorStop(1, col(c, 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 6, 0, 6.283); ctx.fill();
      ctx.fillStyle = col(c, .85 * pulse + .1); ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
    }
  }
  const t0 = performance.now();
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (document.body.classList.contains('wild')) return;                 // no visual Floresta o cenário substitui a rede de pontos
    const calm = !!document.body.dataset.calm, gap = calm ? 50 : weak ? 40 : 20;
    if (now - last < gap) return; const dt = Math.min(.1, (now - last) / 1000 || .016); last = now; draw(dt, (now - t0) / 1000, calm);
  }
  const start = () => { if (!raf && !still) raf = requestAnimationFrame(frame); };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };
  addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  addEventListener('pointerleave', () => { mouse.x = mouse.y = -999; });
  addEventListener('pointerup', () => { mouse.x = mouse.y = -999; }, { passive: true });
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { size(); if (still) draw(0, 0, false); }, 150); });
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
  let cls = document.body.className;
  new MutationObserver(() => { if (document.body.className !== cls) { cls = document.body.className; colors(); if (still) draw(0, 0, false); } }).observe(document.body, { attributes: true, attributeFilter: ['class'] });

  colors(); size(); if (still) draw(0, 0, false); else start();
})();
