// PROVAS DE HTML E CSS: 2 checkpoints (depois das lições 10 e 20) e a prova final (depois da 30) de cada nível. Mesmas regras de chances do resto do app (lessons.js).
// cp(título, tarefa, solução, [verificações], [o que é, para que serve, como se faz, retorno esperado], {edit, page, css, starter})   ·   fin(...) igual
// As verificações são as do htmlcheck.js (veja content/hh.js). Nas provas o aluno não vê a lista de dicas e a solução só aparece depois de gastar as chances.
const { STARTER } = require('./hh');
const XP = [60, 80, 100];                                      // XP de cada checkpoint (a prova final dá o bônus de 50 x nível, no servidor)
const LEVELS = ['Básico', 'Intermediário', 'Avançado'];

const factory = lv => {
  let k = 0;
  const base = o => {
    const edit = o.edit || 'html', r = { type: 'html', track: 'html', level: LEVELS[lv - 1], lv, test: true, edit, starter: o.starter !== undefined ? o.starter : STARTER[edit] };
    if (edit === 'css') { r.page = o.page; r.exLang = 'css'; } else if (o.css) r.css = o.css;
    return r;
  };
  const info = a => ({ oque: a[0], serve: a[1], como: a[2], retorno: a[3] });
  return {
    cp: (title, task, solution, checks, inf, o = {}) => { k++; const after = k * 10; return { id: `cp-html-${lv}-${after}`, cp: true, k, after, n: after, xp: XP[lv - 1], title, task, ...base(o), checks, solution, info: info(inf) }; },
    fin: (title, task, solution, checks, inf, o = {}) => ({ id: `fin-html-${lv}`, fin: true, k: 3, after: 30, n: 30, xp: 0, title, task, ...base(o), checks, solution, info: info(inf) })
  };
};

const out = [];

// ---------------------------------------------------------------- Básico
{
  const P = factory(1);
  out.push(
    P.cp('Checkpoint: página de um animal',
      'Monte a página de um animal, usando o que você aprendeu nas lições 1 a 10:\n- Um título <h1> com o texto Tartaruga.\n- Um parágrafo com o texto A tartaruga vive muito tempo., com a palavra muito em itálico (<em>).\n- Um título <h2> com o texto O que ela come e, embaixo, uma lista com marcadores com 3 itens: Folhas, Frutas e Flores.\n- A imagem tartaruga.jpg com o texto alternativo Uma tartaruga.\n- Um link com o texto Saiba mais para https://animais.com.',
      '<h1>Tartaruga</h1>\n<p>A tartaruga vive <em>muito</em> tempo.</p>\n<h2>O que ela come</h2>\n<ul>\n  <li>Folhas</li>\n  <li>Frutas</li>\n  <li>Flores</li>\n</ul>\n<img src="tartaruga.jpg" alt="Uma tartaruga">\n<a href="https://animais.com">Saiba mais</a>',
      [{ s: 'h1', text: 'Tartaruga' }, { s: 'p', text: 'A tartaruga vive muito tempo.' }, { s: 'p em', text: 'muito' }, { s: 'h2', text: 'O que ela come' }, { s: 'ul > li', eq: 3 }, { s: 'li', text: 'Folhas' }, { s: 'li', text: 'Frutas' }, { s: 'li', text: 'Flores' },
        { s: 'img', a: { src: 'tartaruga.jpg', alt: 'Uma tartaruga' } }, { s: 'a', text: 'Saiba mais', a: { href: ['https://animais.com', 'https://animais.com/'] } }],
      ['É a sua primeira provinha de HTML! Você vai montar uma página completa com o que aprendeu nas lições 1 a 10: títulos, parágrafos, itálico, listas, imagens e links.',
        'Serve para mostrar que você já consegue escrever uma página sozinho, sem um exemplo pronto para copiar.',
        'Escreva de cima para baixo: o <h1>, o parágrafo com o <em>, o <h2> com a lista <ul>, a imagem <img> e o link <a>.',
        'Uma página com o título Tartaruga, uma frase com a palavra muito inclinada, uma lista de três comidas, uma imagem e um link.']),
    P.cp('Checkpoint: página de contato',
      'Escreva a página inteira de uma escola, usando o que você aprendeu nas lições 11 a 20:\n- A linha <!DOCTYPE html> e as partes <html lang="pt-BR">, <head> e <body>.\n- No <head>: o <title> com o texto Escola Nova e uma tag <style> com uma regra que deixe os títulos h1 vermelhos (color: red).\n- No <body>: um <h1> com Escola Nova; uma tabela com a primeira linha de cabeçalhos (<th>) Curso e Vagas e uma linha com Ingles e 20; e um formulário com um <label for="email"> com E-mail, uma caixa <input type="email" id="email"> e um botão <button> com Enviar.',
      '<!DOCTYPE html>\n<html lang="pt-BR">\n<head>\n  <title>Escola Nova</title>\n  <style>\n    h1 { color: red; }\n  </style>\n</head>\n<body>\n  <h1>Escola Nova</h1>\n  <table>\n    <tr>\n      <th>Curso</th>\n      <th>Vagas</th>\n    </tr>\n    <tr>\n      <td>Ingles</td>\n      <td>20</td>\n    </tr>\n  </table>\n  <form>\n    <label for="email">E-mail</label>\n    <input type="email" id="email">\n    <button>Enviar</button>\n  </form>\n</body>\n</html>',
      [{ doctype: true }, { s: 'html', a: { lang: 'pt-BR' } }, { src: '<head[\\s>][\\s\\S]*</head>[\\s\\S]*<body[\\s>][\\s\\S]*</body>', d: 'As partes `<head>` e `<body>`, abertas e fechadas, nessa ordem', m: 'Escreva o <head> e o <body>, cada um com a sua tag de fechamento.' }, { s: 'head > title', text: 'Escola Nova' }, { s: 'head > style', n: 1 }, { s: 'h1', text: 'Escola Nova', css: { color: 'red' } },
        { s: 'table th', eq: 2 }, { s: 'th', text: 'Curso' }, { s: 'th', text: 'Vagas' }, { s: 'td', text: 'Ingles' }, { s: 'td', text: '20' },
        { s: 'form label', text: 'E-mail', a: { for: 'email' } }, { s: 'form input', a: { type: 'email', id: 'email' } }, { s: 'form button', text: 'Enviar' }],
      ['Aqui você junta as lições 11 a 20: a estrutura da página (DOCTYPE, html, head, body), o <style> com o primeiro CSS, uma tabela e um formulário.',
        'Serve para mostrar que você sabe montar uma página completa do zero, do <!DOCTYPE html> ao </html>, como as de qualquer site de verdade.',
        'Faça primeiro o esqueleto. Depois preencha o <head> (title e style) e, no <body>, o <h1>, a tabela e o formulário.',
        'Uma página com o título Escola Nova em vermelho, uma tabelinha de cursos e vagas e um campo de e-mail com o botão Enviar.'],
      { edit: 'doc' }),
    P.fin('Prova final: cartão da loja',
      'É a prova final do Básico! Monte o cartão de uma loja com HTML e CSS (dentro de uma tag <style>):\n- HTML: uma <div class="loja"> com um <h2> com Loja da Ana, um parágrafo com Roupas e acessorios e uma <div class="botoes"> com dois links <a class="btn" href="#">: Ver produtos e Contato.\n- CSS: .loja com largura (width) de 320px, padding de 20px, borda (border) de 2px solid gray, cantos arredondados (border-radius) de 10px e fundo (background-color) whitesmoke.\n- .botoes com display flex e gap de 10px.\n- .btn com fundo (background-color) seagreen, texto branco (color: white), padding de 8px 14px e sem sublinhado (text-decoration: none).\n- .btn ao passar o mouse (:hover): fundo darkgreen.',
      '<style>\n  .loja {\n    width: 320px;\n    padding: 20px;\n    border: 2px solid gray;\n    border-radius: 10px;\n    background-color: whitesmoke;\n  }\n  .botoes {\n    display: flex;\n    gap: 10px;\n  }\n  .btn {\n    background-color: seagreen;\n    color: white;\n    padding: 8px 14px;\n    text-decoration: none;\n  }\n  .btn:hover {\n    background-color: darkgreen;\n  }\n</style>\n<div class="loja">\n  <h2>Loja da Ana</h2>\n  <p>Roupas e acessorios</p>\n  <div class="botoes">\n    <a class="btn" href="#">Ver produtos</a>\n    <a class="btn" href="#">Contato</a>\n  </div>\n</div>',
      [{ s: 'div.loja > h2', text: 'Loja da Ana' }, { s: 'div.loja > p', text: 'Roupas e acessorios' }, { s: 'div.loja > div.botoes', n: 1 }, { s: '.botoes a.btn', eq: 2, d: 'Dois links `<a class="btn">` dentro da `<div class="botoes">`' }, { s: 'a.btn', text: 'Ver produtos' }, { s: 'a.btn', text: 'Contato' },
        { s: '.loja', css: { width: '320px', padding: '20px', border: '2px solid gray', 'border-radius': '10px', 'background-color': 'whitesmoke' } },
        { s: '.botoes', css: { display: 'flex', gap: '10px' } },
        { s: '.btn', all: true, css: { 'background-color': 'seagreen', color: 'white', padding: '8px 14px', 'text-decoration': 'none' } },
        { s: '.btn', all: true, hover: true, css: { 'background-color': 'darkgreen' }, d: 'Todos os `.btn` com `background-color: darkgreen` ao passar o mouse' }],
      ['É a PROVA FINAL do nível Básico: uma página pequena que usa quase tudo o que você aprendeu em HTML e em CSS: div, classes, links, cores, tamanho, espaços, borda, flexbox e hover.',
        'É assim que se monta um componente de verdade, como um cartão de loja ou de perfil. Passando aqui, você abre o nível Intermediário!',
        'Escreva o <style> com as quatro regras e o HTML do cartão: a div.loja com o título, o parágrafo e a div.botoes com os dois links da classe btn.',
        'Um cartão cinza-claro com cantos arredondados, o nome da loja, uma frase e dois botões verdes lado a lado que escurecem com o mouse em cima.'])
  );
}

module.exports = out;
