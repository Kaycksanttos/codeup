// Gerador de QR Code sem dependências (modo bytes, correção de erros L ou M, versões 1 a 10 — cabe um link de autenticador com folga).
// Uso: qr.matrix('texto') devolve uma matriz de true/false; qr.svg('texto') devolve o desenho pronto (SVG) para mostrar na tela.
'use strict';

const ECC = { L: { fmt: 1, cw: [7, 10, 15, 20, 26, 18, 20, 24, 30, 18], bl: [1, 1, 1, 1, 1, 2, 2, 2, 2, 4] }, M: { fmt: 0, cw: [10, 16, 26, 18, 24, 16, 18, 22, 22, 26], bl: [1, 1, 1, 2, 2, 4, 4, 4, 5, 5] } };
const ALIGN = [[], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50]];   // posições dos quadradinhos de alinhamento, versões 2 a 10

const bit = (v, i) => ((v >>> i) & 1) != 0;
const rawModules = v => { const na = v >= 2 ? Math.floor(v / 7) + 2 : 0; return (16 * v + 128) * v + 64 - (v >= 2 ? (25 * na - 10) * na - 55 : 0) - (v >= 7 ? 36 : 0); };

// campo de Galois 256 (polinômio 0x11D) e Reed-Solomon
const gmul = (x, y) => { let z = 0; for (let i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11d); z ^= ((y >>> i) & 1) * x; } return z; };
const rsDiv = d => { const r = Array(d).fill(0); r[d - 1] = 1; let root = 1; for (let i = 0; i < d; i++) { for (let j = 0; j < d; j++) { r[j] = gmul(r[j], root); if (j + 1 < d) r[j] ^= r[j + 1]; } root = gmul(root, 2); } return r; };
const rsRem = (data, div) => { const r = Array(div.length).fill(0); for (const b of data) { const f = b ^ r.shift(); r.push(0); div.forEach((c, i) => { r[i] ^= gmul(c, f); }); } return r; };

function encode(text, level) {
  const E = ECC[level], bytes = [...Buffer.from(String(text), 'utf8')];
  let ver = 0, cap = 0;
  for (let v = 1; v <= 10; v++) { const dc = Math.floor(rawModules(v) / 8) - E.cw[v - 1] * E.bl[v - 1]; if (4 + (v <= 9 ? 8 : 16) + 8 * bytes.length <= dc * 8) { ver = v; cap = dc; break; } }
  if (!ver) throw new Error('Texto grande demais para o QR Code.');
  const bits = []; const put = (val, n) => { for (let i = n - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
  put(4, 4); put(bytes.length, ver <= 9 ? 8 : 16); bytes.forEach(b => put(b, 8));
  put(0, Math.min(4, cap * 8 - bits.length)); while (bits.length % 8) bits.push(0);
  for (let pad = 0xec; bits.length < cap * 8; pad ^= 0xec ^ 0x11) put(pad, 8);
  const data = []; for (let i = 0; i < bits.length; i += 8) data.push(parseInt(bits.slice(i, i + 8).join(''), 2));
  // blocos + correção de erros, intercalados
  const nb = E.bl[ver - 1], eb = E.cw[ver - 1], raw = Math.floor(rawModules(ver) / 8), nShort = nb - raw % nb, shortLen = Math.floor(raw / nb), div = rsDiv(eb), blocks = [];
  for (let i = 0, k = 0; i < nb; i++) { const dat = data.slice(k, k + shortLen - eb + (i < nShort ? 0 : 1)); k += dat.length; const ecc = rsRem(dat, div); if (i < nShort) dat.push(0); blocks.push(dat.concat(ecc)); }
  const out = []; for (let i = 0; i < blocks[0].length; i++) blocks.forEach((b, j) => { if (i != shortLen - eb || j >= nShort) out.push(b[i]); });
  return { ver, words: out };
}

function matrix(text, level = 'M') {
  const { ver, words } = encode(text, level), size = ver * 4 + 17, E = ECC[level];
  const M = Array.from({ length: size }, () => Array(size).fill(false)), F = Array.from({ length: size }, () => Array(size).fill(false));
  const setF = (x, y, d) => { M[y][x] = d; F[y][x] = true; };
  for (let i = 0; i < size; i++) { setF(6, i, i % 2 == 0); setF(i, 6, i % 2 == 0); }                       // linhas de tempo
  const finder = (cx, cy) => { for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) { const x = cx + dx, y = cy + dy, d = Math.max(Math.abs(dx), Math.abs(dy)); if (x >= 0 && x < size && y >= 0 && y < size) setF(x, y, d != 2 && d != 4); } };
  finder(3, 3); finder(size - 4, 3); finder(3, size - 4);
  const ap = ALIGN[ver - 1];
  for (const ay of ap) for (const ax of ap) { if ((ax == 6 && ay == 6) || (ax == 6 && ay == ap[ap.length - 1]) || (ax == ap[ap.length - 1] && ay == 6)) continue; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) setF(ax + dx, ay + dy, Math.max(Math.abs(dx), Math.abs(dy)) != 1); }
  const fmtBits = mask => { const d = (E.fmt << 3) | mask; let r = d; for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537); return ((d << 10) | r) ^ 0x5412; };
  const drawFmt = mask => {
    const b = fmtBits(mask);
    for (let i = 0; i <= 5; i++) setF(8, i, bit(b, i)); setF(8, 7, bit(b, 6)); setF(8, 8, bit(b, 7)); setF(7, 8, bit(b, 8)); for (let i = 9; i < 15; i++) setF(14 - i, 8, bit(b, i));
    for (let i = 0; i < 8; i++) setF(size - 1 - i, 8, bit(b, i)); for (let i = 8; i < 15; i++) setF(8, size - 15 + i, bit(b, i)); setF(8, size - 8, true);
  };
  drawFmt(0);
  if (ver >= 7) { let r = ver; for (let i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11) * 0x1f25); const b = (ver << 12) | r; for (let i = 0; i < 18; i++) { const a = size - 11 + i % 3, c = Math.floor(i / 3); setF(a, c, bit(b, i)); setF(c, a, bit(b, i)); } }
  // dados em zigue-zague
  for (let i = 0, right = size - 1; right >= 1; right -= 2) {
    if (right == 6) right = 5;
    for (let v = 0; v < size; v++) for (let j = 0; j < 2; j++) { const x = right - j, y = ((right + 1) & 2) == 0 ? size - 1 - v : v; if (!F[y][x] && i < words.length * 8) { M[y][x] = bit(words[i >>> 3], 7 - (i & 7)); i++; } }
  }
  const MASK = [(x, y) => (x + y) % 2 == 0, (x, y) => y % 2 == 0, (x, y) => x % 3 == 0, (x, y) => (x + y) % 3 == 0, (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 == 0, (x, y) => x * y % 2 + x * y % 3 == 0, (x, y) => (x * y % 2 + x * y % 3) % 2 == 0, (x, y) => ((x + y) % 2 + x * y % 3) % 2 == 0];
  const flip = m => { for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!F[y][x] && MASK[m](x, y)) M[y][x] = !M[y][x]; };
  const penalty = () => {
    let p = 0, dark = 0;
    const line = get => { let run = 1; for (let i = 1; i < size; i++) { if (get(i) == get(i - 1)) { run++; if (run == 5) p += 3; else if (run > 5) p++; } else run = 1; } };
    for (let a = 0; a < size; a++) {
      line(i => M[a][i]); line(i => M[i][a]);
      for (const g of [i => M[a][i], i => M[i][a]]) for (let i = 0; i + 11 <= size; i++) { let s = ''; for (let k = 0; k < 11; k++) s += g(i + k) ? '1' : '0'; if (s == '10111010000' || s == '00001011101') p += 40; }
    }
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) { if (M[y][x]) dark++; if (x + 1 < size && y + 1 < size && M[y][x] == M[y][x + 1] && M[y][x] == M[y + 1][x] && M[y][x] == M[y + 1][x + 1]) p += 3; }
    return p + (Math.ceil(Math.abs(dark * 20 - size * size * 10) / (size * size)) - 1) * 10;
  };
  let best = 0, bp = Infinity;
  for (let m = 0; m < 8; m++) { flip(m); drawFmt(m); const p = penalty(); if (p < bp) { bp = p; best = m; } flip(m); }
  flip(best); drawFmt(best);
  return M;
}

// desenho em SVG (quadro de 4 módulos em volta, como manda o padrão), cada linha de quadradinhos pretos vira um traço só
function svg(text, o = {}) {
  const M = matrix(text, o.level || 'M'), n = M.length, q = 4;
  let d = '';
  for (let y = 0; y < n; y++) for (let x = 0; x < n;) { if (!M[y][x]) { x++; continue; } let e = x; while (e < n && M[y][e]) e++; d += `M${x + q} ${y + q}h${e - x}v1h-${e - x}z`; x = e; }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n + 2 * q} ${n + 2 * q}" shape-rendering="crispEdges" role="img" aria-label="${o.label || 'QR Code'}"><rect width="100%" height="100%" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
}

module.exports = { matrix, svg };
