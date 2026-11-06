#!/usr/bin/env node
// Gera test/fixtures/hc-golden.json a partir do Chromium de verdade (precisa do Playwright): o teste test/htmlcheck.test.js roda sem navegador e confere
// que o motor continua escrevendo igual. Rode de novo (depois de `node tools/hc-diff.js` dar OK) quando mudar o motor de propósito.
const fs = require('fs'), path = require('path'), H = require('../htmlcheck'), D = require('./hc-dump');
const { chromium } = require('playwright');
let seed = 4242; const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296, pick = a => a[Math.floor(rnd() * a.length)], ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const T = 'div p span ul ol li h1 h2 a b i em strong section blockquote table tr td th thead tbody caption pre code nav small label br hr img button dl dt dd'.split(' '), VOID = new Set(['br', 'hr', 'img']);
const gen = d => { const t = pick(T); if (VOID.has(t)) return `<${t}>`; let inner = rnd() < .5 ? 'x' : ''; for (let i = ri(0, d < 2 ? 2 : 0); i > 0; i--) inner += gen(d + 1); return `<${t}>${inner}${rnd() < .75 ? `</${t}>` : (rnd() < .3 ? `</${pick(T)}>` : '')}`; };
(async () => {
  const br = await chromium.launch(), pg = await br.newPage(), parse = [];
  const hand = ['<b><i>x</b></i>', '<p>um<p>dois<ul><li>a<li>b</ul>', '<table><tr><td>a<td>b<tr><td>c</table>', '<table>texto<a href=1>l</a><tr><td>x</table>', '<a href=1>x<a href=2>y</a></a>', '<b><p>x</b>y</p>', '<h1>a<h2>b</h2>c</h1>', '<div><p>x</div>y</p>', '<ul><li>a<ul><li>b</ul><li>c</ul>', '<dl><dt>a<dd>b<dt>c<dd>d</dl>', '<table><tr><th>a<th>b<tr><td>1<td>2</table>', '<select><option>a<option>b</select>'];
  const snippets = hand.concat(Array.from({ length: 400 }, () => { let s = ''; for (let i = ri(1, 3); i > 0; i--) s += gen(0); return s; }));
  for (const s of snippets) {
    await pg.setContent('<!doctype html>' + s);
    const ch = await pg.evaluate(() => { const out = []; (function w(e) { for (const k of e.childNodes) if (k.nodeType === 1) { out.push(k.tagName.toLowerCase() + '['); w(k); out.push(']'); } else if (k.nodeType === 3 && k.data.trim()) out.push('"'); })(document.body); return out.join(''); });
    if (D.tree(H, s) === ch) parse.push({ s, t: ch });          // só guarda o que o motor acerta (o resto são casos raros de <select> e <form> dentro de tabela)
  }
  await br.close();
  const cases = require('./hc-cases').filter(c => typeof c === 'string' || !c.layout).map(c => typeof c === 'string' ? c : c.html);
  process.env.SEED = '99'; process.env.N = '40'; const fuzz = require('./hc-fuzz');
  const style = cases.concat(fuzz).map(html => ({ h: html, d: D.dump(H, html) }));
  fs.writeFileSync(path.join(__dirname, '..', 'test', 'fixtures', 'hc-golden.json'), JSON.stringify({ parse, style }));
  console.log('parse:', parse.length, ' style:', style.length);
})();
