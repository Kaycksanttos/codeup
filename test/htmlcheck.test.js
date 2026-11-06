// Corretor de HTML e CSS (htmlcheck.js): a árvore e os estilos são iguais aos do Chromium (conferidos antes, em tools/hc-diff.js e guardados em test/fixtures),
// as verificações das lições funcionam e entradas maldosas não travam o servidor.
const test = require('node:test'), assert = require('node:assert/strict');
const H = require('../htmlcheck'), D = require('../tools/hc-dump'), G = require('./fixtures/hc-golden.json');

test('HTML bagunçado: a árvore de elementos é a do navegador (tags sem fechar, mal aninhadas, tabelas, listas)', () => {
  assert.ok(G.parse.length > 300);
  for (const { s, t } of G.parse) assert.equal(D.tree(H, s), t, s);
});
test('CSS: o estilo calculado de cada elemento é o do navegador (cascata, herança, unidades, atalhos, fontes, display)', () => {
  assert.ok(G.style.length > 60);
  G.style.forEach(({ h, d }, i) => assert.equal(D.dump(H, h), d, 'caso ' + i + ': ' + JSON.stringify(h).slice(0, 120)));
});

const g = (l, code) => H.grade(l, code);
const okOf = r => r.hc.items.map(i => i.ok);

test('verificações de HTML: texto, quantidade, atributos, ordem do código e dicas', () => {
  const l = { edit: 'html', checks: [{ s: 'h1', text: 'Minha pagina' }, { s: 'li', n: 3 }, { s: 'a', a: { href: 'https://exemplo.com', target: '_blank' }, text: 'Visite' }, { s: 'img', a: { src: '*', alt: '*' } }] };
  const certo = '<h1>Minha pagina</h1><ul><li>a</li><li>b</li><li>c</li></ul><a href="https://exemplo.com" target="_blank">Visite</a><img src="foto.png" alt="foto">';
  let r = g(l, certo); assert.equal(r.ok, true); assert.deepEqual(okOf(r), [true, true, true, true]);
  r = g(l, '<h1>  Minha   PAGINA </h1>'); assert.deepEqual(okOf(r), [true, false, false, false]);                  // texto: não liga para maiúsculas, acentos nem espaços sobrando
  r = g(l, '<h1>Minha pagin</h1>'); assert.equal(r.hc.items[0].ok, false); assert.match(r.hc.items[0].why, /Minha pagin/);
  r = g(l, certo.replace('Minha pagina', ' Minha   pagina ')); assert.equal(r.ok, true);
  r = g(l, certo.replace('<li>c</li>', '')); assert.deepEqual(okOf(r), [true, false, true, true]); assert.match(r.hc.items[1].why, /2.*precisa de pelo menos 3/);
  r = g(l, certo.replace('_blank', '_self')); assert.equal(r.hc.items[2].ok, false); assert.match(r.hc.items[2].why, /target/);
  r = g(l, certo.replace(' alt="foto"', '')); assert.equal(r.hc.items[3].ok, false);
  r = g(l, '<h1>Minha pagina<ul><li>a<li>b<li>c</ul>'); assert.equal(r.hc.items[0].ok, false); assert.ok(r.hc.hints.some(h => /<h1>/.test(h)));   // h1 sem fechar → dica
  r = g(l, '<h1>x</h1></div>'); assert.ok(r.hc.hints.some(h => /<\/div>/.test(h)));
  assert.equal(g({ edit: 'html', checks: [] }, '<p>x</p>').ok, false);                                                // lição sem verificações nunca passa
});

test('verificações de CSS: valores calculados (cores em qualquer forma, unidades, atalhos), seletores, :hover, @media e pseudo-elementos', () => {
  const page = '<div class="card"><h2 id="t">Oi</h2><p>texto</p></div><a href="#">link</a>';
  const l = { edit: 'css', page, checks: [
    { s: '.card', css: { 'background-color': '#ff0000', padding: '10px 20px' } }, { s: '#t', css: { color: 'rgb(0, 128, 0)', 'font-size': '2rem' } },
    { s: 'a', css: { color: 'blue' }, hover: true }, { s: 'p::before', css: { content: '"> "' } }, { at: 'media' }] };
  const css = '.card { background: red; padding: 10px 20px; }\nh2#t { color: green; font-size: 32px; }\na:hover { color: #00f; }\np::before { content: "> "; }\n@media (max-width: 600px) { .card { padding: 0 } }';
  let r = g(l, css); assert.deepEqual(okOf(r), [true, true, true, true, true], JSON.stringify(r.hc.items));
  r = g(l, css.replace('red', 'tomato')); assert.equal(r.hc.items[0].ok, false); assert.match(r.hc.items[0].why, /background-color/);
  r = g(l, css.replace('a:hover', 'a:active')); assert.equal(r.hc.items[2].ok, false);
  r = g(l, css.replace(/\n@media.*/, '')); assert.equal(r.hc.items[4].ok, false);
  r = g(l, css.replace('p::before { content: "> "; }', 'p::before { color: red; }')); assert.equal(r.hc.items[3].ok, false);
  r = g(l, css + '\n.card { padding: 0 }'); assert.equal(r.hc.items[0].ok, false);                                       // a última regra vence
  r = g(l, css.replace('.card {', '.card { color: red;;; broken')); assert.ok(r.hc.items.length === 5);               // CSS quebrado não derruba
  r = g(l, css.replace('padding: 10px 20px; }', 'padding: 10px 20px;')); assert.equal(r.ok, false); assert.ok(r.hc.hints.some(h => /Falta fechar uma chave/.test(h)));
  r = g(l, '}' + css.replace('.card', '.cardx')); assert.ok(r.hc.hints.some(h => /chave `}` sobrando/.test(h)));
  // especificidade, !important, herança e em/rem
  const l2 = { edit: 'css', page: '<div id="a" class="b"><p class="c">x</p></div>', checks: [{ s: 'p', css: { color: 'red' } }, { s: 'p', css: { 'font-size': '24px' } }, { s: 'div', css: { 'font-weight': '700' } }] };
  r = g(l2, 'p { color: blue } .c { color: red } div p { color: green } #a p { color: red } p { font-size: 1.5em !important } div { font-weight: bold }'); assert.equal(r.ok, true, JSON.stringify(r.hc.items));
  r = g(l2, 'p.c { color: blue } #a .c { color: red } div { font-size: 12px }'); assert.deepEqual(okOf(r), [true, false, false]);
});

test('HTML + CSS na mesma lição (l.css já pronto) e documento completo', () => {
  const l = { edit: 'doc', checks: [{ doctype: true }, { s: 'html', a: { lang: 'pt-BR' } }, { s: 'title', text: 'Oi' }, { s: 'meta', a: { charset: 'UTF-8' } }, { s: 'h1', css: { color: 'red' } }] };
  const doc = '<!DOCTYPE html>\n<html lang="pt-BR">\n<head>\n<meta charset="UTF-8">\n<title>Oi</title>\n<style>h1 { color: red }</style>\n</head>\n<body><h1>a</h1></body>\n</html>';
  let r = g(l, doc); assert.equal(r.ok, true, JSON.stringify(r.hc.items));
  r = g(l, doc.replace('<!DOCTYPE html>\n', '')); assert.equal(r.hc.items[0].ok, false);
  r = g(l, doc.replace(' lang="pt-BR"', '')); assert.equal(r.hc.items[1].ok, false);
  r = g({ edit: 'html', css: 'h1 { color: red }', checks: [{ s: 'h1', css: { color: 'red' } }, { s: 'h1', css: { color: 'blue' } }] }, '<h1>x</h1>'); assert.deepEqual(okOf(r), [true, false]);
});

test('JavaScript e atributos perigosos não rodam nem vazam no corretor: só texto e estilo são lidos', () => {
  const l = { edit: 'html', checks: [{ s: 'p', text: 'oi' }] };
  assert.equal(g(l, '<p onclick="alert(1)">oi</p><script>throw new Error("x")</script>').ok, true);
  assert.equal(g(l, '<p>oi</p><style>@import url(http://evil.example/x.css); p { background: url(http://evil.example/a.png) }</style>').ok, true);
});

test('entradas maldosas: aninhamento enorme, seletores pesados, CSS gigante e erros ficam rápidos e sem exceção', () => {
  const t0 = Date.now(), l = { edit: 'html', checks: [{ s: 'div div div div div div', css: { color: 'red' } }, { s: 'p:nth-child(2n+1) ~ p:not(.a) *', n: 2 }, { s: 'div', n: 3 }] };
  const deep = '<div>'.repeat(4000) + 'x', tags = '<b><i><u><s>'.repeat(1200), css = '<style>' + 'div div div div div div *:not(:nth-child(2n+1)) ~ * { color: red } '.repeat(100) + '</style>';
  for (const code of [deep, tags, css + deep.slice(0, 1500), '<'.repeat(5000), '<p ' + 'a=1 '.repeat(2000), '<style>' + '{'.repeat(5000), '<table>'.repeat(800), '<p>'.repeat(5000), '&amp;'.repeat(5000) + '<p>', '\u0000<p>￿</p>']) {
    const r = g(l, code); assert.equal(typeof r.ok, 'boolean');
  }
  assert.ok(Date.now() - t0 < 6000, 'demorou ' + (Date.now() - t0) + 'ms');
  assert.throws(() => g({ edit: 'html', checks: [{ s: 'p!!' }] }, '<p>x</p>'), /seletor inválido/);                      // erro nas verificações da lição aparece (a ferramenta de conferência pega)
});
