// resumo do estilo de uma página no motor do CodeUp (htmlcheck.js): usado por tools/hc-golden.js e por test/htmlcheck.test.js
const crypto = require('crypto');
const SKIP_TAGS = new Set(['input', 'button', 'textarea', 'select', 'img', 'option', 'optgroup']);
const SKIP = new Set(['box-shadow', 'text-shadow', 'transform', 'transform-origin', 'filter', 'backdrop-filter', 'clip-path', 'content', 'quotes', 'tab-size', 'text-wrap', 'will-change', 'overflow-anchor', 'accent-color']);
function dump(H, html) {
  const page = H.makePage(html), ctx = { vw: 1024, vh: 768, st: null, key: 'x' }, out = [];
  for (const el of page.dom.all) {
    out.push(el.tag);
    if (SKIP_TAGS.has(el.tag)) continue;
    const st = H.styleOf(page, el, null, ctx); for (const p of Object.keys(H.INIT)) if (!SKIP.has(p)) out.push(p + ':' + st[p]);
  }
  return crypto.createHash('sha1').update(out.join('\n')).digest('hex');
}
// a árvore de elementos como texto:  div[p["]b[]]   (" = tem texto)
function tree(H, html) {
  const page = H.makePage('<!doctype html>' + html), out = [];
  (function w(e) { for (const k of e.kids) if (k.t !== 3) { out.push(k.tag + '['); w(k); out.push(']'); } else if (k.s.trim()) out.push('"'); })(page.dom.body);
  return out.join('');
}
module.exports = { dump, tree };
