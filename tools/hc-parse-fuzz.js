// compara a árvore de elementos que o htmlcheck monta com a do Chromium, em trechos pequenos e bagunçados (erros comuns de aluno)
const { chromium } = require('playwright'); const H = require('../htmlcheck');
let seed = +process.env.SEED || 1; const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296, pick = a => a[Math.floor(rnd() * a.length)], ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const T = (process.env.TAGS || 'div p span ul ol li h1 h2 a b i em strong section blockquote table tr td th thead tbody caption pre code nav small label br hr img button dl dt dd form input select option textarea').split(' ');
const VOID = new Set(['br', 'hr', 'img', 'input']);
function gen(d) { const t = pick(T); if (VOID.has(t)) return `<${t}>`; let inner = rnd() < .5 ? 'x' : ''; for (let i = ri(0, d < 2 ? 2 : 0); i > 0; i--) inner += gen(d + 1); return `<${t}>${inner}${rnd() < .75 ? `</${t}>` : (rnd() < .3 ? `</${pick(T)}>` : '')}`; }
const snippets = Array.from({ length: +process.env.N || 400 }, () => { let s = ''; for (let i = ri(1, 3); i > 0; i--) s += gen(0); return s; });
const mine = html => { const page = H.makePage('<!doctype html>' + html); const out = []; (function w(e) { for (const k of e.kids) if (k.t !== 3) { out.push(k.tag + '['); w(k); out.push(']'); } else if (k.s.trim()) out.push('"'); })(page.dom.body); return out.join(''); };
(async () => {
  const b = await chromium.launch(); const p = await b.newPage(); let bad = 0; const seen = new Set();
  for (const s of snippets) {
    await p.setContent('<!doctype html>' + s);
    const ch = await p.evaluate(() => { const out = []; (function w(e) { for (const k of e.childNodes) if (k.nodeType === 1) { out.push(k.tagName.toLowerCase() + '['); w(k); out.push(']'); } else if (k.nodeType === 3 && k.data.trim()) out.push('"'); })(document.body); return out.join(''); });
    let me; try { me = mine(s); } catch (e) { me = 'ERRO ' + e.message; }
    if (me !== ch) { bad++; if (bad <= (+process.env.SHOW || 12)) console.log('✗', s.slice(0, 160), '\n   eu    :', me.slice(0, 200), '\n   chrome:', ch.slice(0, 200)); }
  }
  console.log(bad ? `${bad} diferença(s) em ${snippets.length}` : `OK: ${snippets.length} trechos iguais ao Chromium`); await b.close();
})();
