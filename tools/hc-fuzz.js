// gera páginas aleatórias (com semente fixa) para o tools/hc-diff.js: node tools/hc-diff.js tools/hc-fuzz.js
let seed = +process.env.SEED || 12345; const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296, pick = a => a[Math.floor(rnd() * a.length)], ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const TAGS = ['div', 'p', 'span', 'ul', 'ol', 'li', 'h1', 'h2', 'a', 'b', 'i', 'em', 'strong', 'section', 'article', 'blockquote', 'table', 'tr', 'td', 'pre', 'code', 'nav', 'small', 'label'];
const CLS = ['a', 'b', 'c', 'd'], IDS = ['x', 'y'];
const VALUES = {
  color: ['red', '#0f0', '#12345678', 'rgb(1,2,3)', 'rgba(10 20 30 / .5)', 'hsl(200,50%,50%)', 'inherit', 'currentColor', 'bogus', '#12'], 'background-color': ['blue', '#abc', 'transparent', 'initial', 'rgb(255,0,0)'],
  'font-size': ['12px', '1.5em', '120%', 'larger', 'smaller', 'small', '2rem', '14', 'calc(10px + 1em)', 'inherit'], 'font-weight': ['bold', 'normal', '300', 'bolder', 'lighter', '700', '1200'], 'font-style': ['italic', 'normal', 'oblique'],
  'line-height': ['1.5', '20px', '150%', 'normal', '2em', 'inherit'], margin: ['10px', '0 auto', '1em 2em', '5px 10px 15px', '1px 2px 3px 4px', 'auto', '-5px', '10'], padding: ['5px', '1em 2em', '0', '3px 6px 9px', '-1px'],
  border: ['1px solid red', '2px dashed', 'none', 'thick double #00f', '0', 'solid', '1px'], 'border-radius': ['4px', '50%', '1px 2px 3px 4px', '10px 20px'], display: ['block', 'inline', 'flex', 'none', 'inline-block', 'grid', 'bogus', 'list-item'],
  width: ['50%', '100px', 'auto', '10em', 'calc(100% - 10px)', 'min(10px, 5px)'], height: ['20px', 'auto', '5em'], 'text-align': ['center', 'left', 'right', 'justify'], 'text-decoration': ['underline', 'none', 'line-through red', 'underline overline'],
  'text-transform': ['uppercase', 'none'], 'letter-spacing': ['1px', 'normal', '.1em'], 'font-family': ['Arial, sans-serif', '"Times New Roman", serif', 'monospace', 'Georgia'], opacity: ['.5', '1', '0', '2'], position: ['relative', 'absolute', 'static', 'fixed'],
  float: ['left', 'right', 'none'], 'z-index': ['1', '-1', 'auto'], 'list-style': ['none', 'square inside', 'decimal'], 'list-style-type': ['circle', 'none'], 'vertical-align': ['middle', 'top'], 'white-space': ['nowrap', 'pre'], 'box-sizing': ['border-box'], 'overflow': ['hidden', 'auto', 'scroll hidden'],
  background: ['red', 'url(x.png) no-repeat', '#fff url(y.jpg)', 'linear-gradient(red, #00f)'], flex: ['1', 'none', 'auto', '1 1 100px', '2 0'], gap: ['10px', '5px 15px'], 'justify-content': ['center', 'space-between'], 'align-items': ['center', 'flex-end'], 'flex-direction': ['column'],
  cursor: ['pointer'], 'text-indent': ['2em', '10px'], outline: ['1px solid red'], 'border-top': ['3px solid #333'], 'border-color': ['red blue'], 'border-width': ['1px 2px'], 'margin-top': ['1em', '10px', 'auto'], 'padding-left': ['2em', '10%'], top: ['10px', '2em'], left: ['5%', 'auto'],
  font: ['italic 12px Arial', 'bold 1.2em/1.5 serif', '16px sans-serif'], visibility: ['hidden', 'visible'], 'object-fit': ['cover'], 'border-collapse': ['collapse'], 'word-break': ['break-all'], 'min-height': ['10px'], 'max-width': ['100%', '300px']
};
const SELS = [() => pick(TAGS), () => '.' + pick(CLS), () => '#' + pick(IDS), () => pick(TAGS) + '.' + pick(CLS), () => pick(TAGS) + ' ' + pick(TAGS), () => pick(TAGS) + ' > ' + pick(TAGS), () => '.' + pick(CLS) + ' ' + pick(TAGS), () => pick(TAGS) + ':first-child', () => pick(TAGS) + ':nth-child(' + pick(['2', '2n', 'odd', '2n+1', '-n+2']) + ')', () => pick(TAGS) + ':last-child', () => pick(TAGS) + ':not(.' + pick(CLS) + ')', () => '.' + pick(CLS) + '.' + pick(CLS), () => pick(TAGS) + '+' + pick(TAGS), () => pick(TAGS) + '~' + pick(TAGS), () => '*', () => 'body ' + pick(TAGS), () => pick(TAGS) + ':only-child', () => pick(TAGS) + ':empty', () => '[class]', () => pick(TAGS) + '[id]', () => 'li:nth-of-type(2)', () => 'p:first-of-type', () => 'bogus!!'];
const INL = ['span', 'b', 'i', 'em', 'strong', 'small', 'label', 'code'], BLK = ['div', 'section', 'article', 'blockquote', 'nav', 'ul', 'ol', 'p', 'h1', 'h2', 'pre', 'table'];
const attrs = () => { let a = ''; if (rnd() < .5) a += ` class="${[...new Set([pick(CLS), rnd() < .3 ? pick(CLS) : ''])].join(' ').trim()}"`; if (rnd() < .2) a += ` id="${pick(IDS)}"`; if (rnd() < .15) { const p = pick(Object.keys(VALUES)); a += ` style="${p}: ${pick(VALUES[p])}${rnd() < .2 ? ' !important' : ''}"`; } return a; };
const txt = () => pick(['x', 'texto', '1']);
function inl(d) { const t = pick(INL.concat(d < 2 ? ['a'] : [])); let inner = rnd() < .6 ? txt() : ''; if (d < 2) for (let i = ri(0, 2); i > 0; i--) inner += (t === 'a' ? inl2(d + 1) : inl(d + 1)); return `<${t}${attrs()}>${inner}</${t}>`; }
function inl2(d) { const t = pick(INL); return `<${t}${attrs()}>${rnd() < .6 ? txt() : ''}</${t}>`; }
function el(d) {
  const t = pick(BLK); let inner = '';
  if (t === 'ul' || t === 'ol') { for (let i = ri(1, 3); i > 0; i--) inner += `<li${attrs()}>${rnd() < .5 ? txt() : ''}${rnd() < .5 ? inl(2) : ''}${d < 2 && rnd() < .2 ? el(d + 1) : ''}</li>`; }
  else if (t === 'table') { for (let r = ri(1, 2); r > 0; r--) { inner += `<tr${attrs()}>`; for (let c = ri(1, 3); c > 0; c--) inner += `<${pick(['td', 'td', 'th'])}${attrs()}>${txt()}</${'td'}>`.replace(/<th/, '<td'); inner += '</tr>'; } inner = `<tbody>${inner}</tbody>`; }
  else if (['p', 'h1', 'h2', 'pre'].includes(t)) { if (rnd() < .6) inner += txt(); for (let i = ri(0, 2); i > 0; i--) inner += inl(1); }
  else { if (rnd() < .4) inner += txt(); for (let i = ri(0, 3); i > 0; i--) inner += (d < 2 && rnd() < .6 ? el(d + 1) : inl(1)); }
  return `<${t}${attrs()}>${inner}</${t}>`;
}
// MESSY=1: HTML "bagunçado" como o de aluno: tags sem fechar, p com div dentro, td/li soltos...
const MTAGS = ['div', 'p', 'span', 'ul', 'ol', 'li', 'h1', 'h2', 'a', 'b', 'i', 'em', 'strong', 'section', 'article', 'blockquote', 'table', 'tr', 'td', 'th', 'pre', 'code', 'nav', 'small', 'label', 'br', 'hr', 'img', 'button', 'dl', 'dt', 'dd', 'thead', 'tbody'];
const VOID = new Set(['br', 'hr', 'img']);
function elm(d) { const t = pick(MTAGS); let a = attrs(); if (t === 'img') a += ' src="x.png"'; if (VOID.has(t)) return `<${t}${a}>`; let inner = ''; const n = d < 3 ? ri(0, 3) : 0; for (let i = 0; i < n; i++) inner += elm(d + 1); if (rnd() < .6) inner = pick(['x', 'texto', '1']) + inner; return `<${t}${a}>${inner}${rnd() < .8 ? `</${t}>` : ''}`; }
function page() { let css = ''; const n = ri(2, 8); for (let i = 0; i < n; i++) { let d = ''; for (let j = ri(1, 4); j > 0; j--) { const p = pick(Object.keys(VALUES)); d += `${p}: ${pick(VALUES[p])}${rnd() < .1 ? ' !important' : ''}; `; } css += `${pick(SELS)()} { ${d}}\n`; } let body = ''; for (let i = ri(1, 4); i > 0; i--) body += process.env.MESSY ? elm(0) : el(0); return `<style>\n${css}</style>${body}`; }
module.exports = Array.from({ length: +process.env.N || 150 }, page);
