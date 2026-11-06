#!/usr/bin/env node
// Compara o motor de HTML e CSS do CodeUp (htmlcheck.js) com o Chromium de verdade: para cada página de teste, o estilo calculado de cada elemento
// tem de ser igual ao do navegador. Uso: node tools/hc-diff.js [arquivo-de-casos.js]   (precisa do Playwright e do Chromium)
// Só confere propriedades que não dependem de layout (cores, fontes, medidas escritas, display, flex, etc.): o iframe fica com display:none.
const path = require('path'), H = require(path.join(__dirname, '..', 'htmlcheck'));
const cases = require(process.argv[2] ? path.resolve(process.argv[2]) : './hc-cases');
const SKIP_TAGS = new Set(['input', 'button', 'textarea', 'select', 'img', 'option', 'optgroup']);   // controles de formulário têm estilos nativos que o corretor não imita
const SKIP = new Set(['box-shadow', 'text-shadow', 'transform', 'transform-origin', 'filter', 'backdrop-filter', 'clip-path', 'content', 'quotes', 'tab-size', 'text-wrap', 'will-change', 'overflow-anchor', 'accent-color', 'mix-blend-mode', 'scroll-behavior', 'user-select', 'resize', 'aspect-ratio', 'background-size', 'background-position', 'object-position', 'grid-template-columns', 'grid-template-rows', 'grid-template-areas', 'grid-auto-columns', 'grid-auto-rows', 'grid-column', 'grid-row', 'grid-area', 'text-underline-offset', 'justify-items', 'font-variant', 'word-spacing', 'outline-width', 'transition-property', 'animation-name', 'list-style-image', 'cursor', 'pointer-events', 'text-decoration-color', 'caption-side', 'border-spacing', 'overflow-wrap', 'text-indent']);
(async () => {
  const { chromium } = require('playwright'); const br = await chromium.launch(), pg = await br.newPage(); await pg.setContent('<body></body>');
  let bad = 0, total = 0; const seen = new Set();
  for (const c of cases) {
    const html = typeof c === 'string' ? c : c.html, vw = c.vw || 1024;
    const rows = await pg.evaluate(async ({ html, vw, props }) => {
      const f = document.createElement('iframe'); f.setAttribute('style', vw === 'none' ? 'display:none' : `position:absolute;left:-9999px;width:${vw}px;height:768px;border:0`);
      f.srcdoc = html; document.body.appendChild(f); await new Promise(r => f.onload = r);
      const d = f.contentDocument, w = f.contentWindow, out = [];
      d.querySelectorAll('*').forEach((el, i) => { const cs = w.getComputedStyle(el), o = {}; for (const p of props) o[p] = cs.getPropertyValue(p); out.push({ tag: el.tagName.toLowerCase(), i, o }); });
      f.remove(); return out;
    }, { html, vw: c.layout ? vw : 'none', props: Object.keys(H.INIT) });
    const page = H.makePage(typeof c === 'string' ? c : c.html), ctx = { vw: c.layout ? vw : 1024, vh: 768, st: null, key: 'x' }, els = page.dom.all;
    const only = c.only ? new Set(c.only) : null;
    if (els.length !== rows.length) { console.log('✗ nº de elementos: eu=' + els.length + ' chrome=' + rows.length + ' em ' + JSON.stringify(html).slice(0, 80)); bad++; continue; }
    els.forEach((el, i) => {
      if (rows[i].tag !== el.tag) { console.log('✗ elemento ' + i + ': eu=' + el.tag + ' chrome=' + rows[i].tag + ' em ' + JSON.stringify(html).slice(0, 80)); bad++; return; }
      if (SKIP_TAGS.has(el.tag)) return;
      const st = H.styleOf(page, el, null, ctx);
      for (const p of Object.keys(H.INIT)) {
        if (SKIP.has(p) || (only && !only.has(p)) || (c.layout && /^(width|height|margin-|padding-|top|right|bottom|left|min-|max-|border-.*-width)/.test(p) && !(only && only.has(p)))) continue;
        let want = rows[i].o[p]; if (want === '' || want === undefined) continue; if (p === 'text-align') want = want.replace('-webkit-', '');
        const cx = { fs: parseFloat(rows[i].o['font-size']) || 16, pfs: 16, rfs: 16, vw: 1024, vh: 768, pw: 400 };
        let norm; try { norm = H.canon(p, want, cx); } catch { norm = null; } if (norm === null) norm = want;
        total++; if (norm !== st[p]) { bad++; const k = `<${el.tag}> ${p}: eu="${st[p]}" chrome="${norm}"`; if (!seen.has(k)) { seen.add(k); console.log('✗ ' + k + `   (${JSON.stringify(html).slice(0, 70)})`); } }
      }
    });
  }
  console.log(bad ? `\n${bad} diferença(s) em ${total} comparações` : `\nOK: ${total} comparações iguais ao Chromium`);
  await br.close(); process.exit(bad ? 1 : 0);
})();
