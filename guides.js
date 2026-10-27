// Guias públicos (páginas de texto, sem login): uma página para cada bloco de 5 lições de cada curso.
// Existem por dois motivos: (1) ajudar quem procura "como usar o SELECT" ou "o que é uma variável" a aprender de graça e (2) dar ao Google
// conteúdo de verdade para ler — o AdSense só aceita anúncios em páginas com conteúdo do dono do site, NUNCA em telas de navegação do app.
// Tudo vem das próprias lições (explicação, exemplo e as 4 partes "o que é / para que serve / como usar / o que aparece").
// Gabaritos, soluções, dicas e perguntas de leitura NÃO entram aqui: continuam só dentro do app.
const NAMES = { python: 'Python', sql: 'SQL', excel: 'Excel', powerbi: 'Power BI e DAX', dados: 'Análise de Dados e Storytelling' };
const TRACK_SLUG = { python: 'python', sql: 'sql', excel: 'excel', powerbi: 'power-bi-e-dax', dados: 'analise-de-dados-e-storytelling' };
const LEVEL_SLUG = ['basico', 'intermediario', 'avancado'];
const INTRO = {
  python: 'Python é uma das linguagens de programação mais usadas para automatizar tarefas, analisar dados e criar sistemas. Aqui você aprende do zero, com frases simples e exemplos curtos.',
  sql: 'SQL é a linguagem que conversa com bancos de dados: com poucas palavras você pergunta ao banco o que quer saber e ele responde com uma tabela. É a base do trabalho de quem analisa dados.',
  excel: 'O Excel é a ferramenta de planilhas mais usada nas empresas. Dominar fórmulas e funções poupa horas de trabalho manual e evita erros nas contas.',
  powerbi: 'O Power BI transforma tabelas cheias de números em painéis visuais, e o DAX é a linguagem das fórmulas que calculam os indicadores desses painéis.',
  dados: 'Analisar dados é fazer boas perguntas, olhar os números com cuidado e contar a história que eles mostram, de um jeito que qualquer pessoa entenda e use para decidir.'
};

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// texto simples das lições -> HTML seguro (`código` vira <code>, linha em branco separa parágrafos)
const para = s => String(s || '').split(/\n{2,}/).map(t => t.trim()).filter(Boolean).map(t => `<p>${esc(t).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\n/g, '<br>')}</p>`).join('');
const cut = (s, n) => s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…';

function build(lessons, projects, levelNames) {
  const guides = [];
  for (const track of lessons.TRACKS) {
    const levels = lessons.LEVELS_OF[track];
    for (let lv = 1; lv <= levels; lv++) {
      const ls = lessons.filter(l => l.track === track && l.lv === lv).sort((a, b) => a.n - b.n);
      for (let a = 1; a <= ls.length; a += 5) {
        const part = ls.filter(l => l.n >= a && l.n < a + 5), b = part[part.length - 1].n;
        guides.push({
          slug: `${TRACK_SLUG[track]}-${LEVEL_SLUG[lv - 1]}-licoes-${a}-a-${b}`, track, lv, from: a, to: b, lessons: part,
          level: levelNames[lv - 1], course: NAMES[track], project: projects.find(p => p.track === track && p.lv === lv && p.after === b) || null
        });
      }
    }
  }
  guides.forEach((g, i) => {
    g.title = `${g.course} ${g.level}: ${g.lessons.map(l => l.title).slice(0, 3).join(', ')}${g.lessons.length > 3 ? ' e mais' : ''} (lições ${g.from} a ${g.to})`;
    g.desc = cut(`Guia gratuito de ${g.course} (${g.level}), lições ${g.from} a ${g.to}: ${g.lessons.map(l => l.title).join(', ')}. Explicação passo a passo, exemplos e um projeto para praticar.`, 158);
    g.prev = guides[i - 1] && guides[i - 1].track === g.track ? guides[i - 1] : null;
    g.next = guides[i + 1] && guides[i + 1].track === g.track ? guides[i + 1] : null;
  });
  return guides;
}

const CSS = `*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}body{margin:0;font:17px/1.7 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:#1c2540;background:#f5f7fd}
header.top{background:#0a1c40;color:#fff}header.top div{max-width:760px;margin:0 auto;padding:14px 18px;display:flex;align-items:center;justify-content:space-between;gap:12px}
header.top a{color:#fff;text-decoration:none}.logo{font-weight:900;font-size:22px;letter-spacing:.2px}.logo span{color:#58cc02}.cta{background:#58cc02;color:#08210a!important;padding:9px 16px;border-radius:12px;font-weight:800;font-size:15px}
main{max-width:760px;margin:0 auto;padding:22px 18px 40px}h1{font-size:28px;line-height:1.25;margin:6px 0 12px}h2{font-size:22px;line-height:1.3;margin:34px 0 8px}h3{font-size:16px;margin:18px 0 2px;color:#2a3a78}
p{margin:8px 0}a{color:#1d4ed8}code{background:#e8edfb;padding:1px 6px;border-radius:6px;font:15px ui-monospace,Menlo,Consolas,monospace}
pre{background:#0d1426;color:#e9eefc;padding:14px 16px;border-radius:12px;overflow:auto;font:14.5px/1.55 ui-monospace,Menlo,Consolas,monospace;margin:10px 0}pre code{background:none;padding:0;color:inherit;font:inherit}
.crumb{font-size:14px;color:#5a6690}.crumb a{color:#5a6690}.toc{background:#fff;border:1px solid #dfe5f7;border-radius:14px;padding:12px 18px;margin:16px 0}.toc ol{margin:6px 0;padding-left:22px}
section.l{background:#fff;border:1px solid #dfe5f7;border-radius:16px;padding:6px 20px 18px;margin:18px 0}section.l h2{margin-top:14px}.lead{font-weight:600}
.pj{background:#eef6e5;border:1px solid #cfe6b6;border-radius:16px;padding:6px 20px 16px;margin:26px 0}.box{background:#fff;border:1px solid #dfe5f7;border-radius:16px;padding:14px 20px;margin:20px 0;text-align:center}
.nav2{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin:22px 0}.nav2 a{flex:1 1 240px;background:#fff;border:1px solid #dfe5f7;border-radius:14px;padding:12px 16px;text-decoration:none;font-weight:700;font-size:15px}
.nav2 small{display:block;color:#5a6690;font-weight:600}ul.gl{list-style:none;padding:0}ul.gl li{background:#fff;border:1px solid #dfe5f7;border-radius:14px;padding:12px 16px;margin:10px 0}ul.gl a{font-weight:800;text-decoration:none}ul.gl small{display:block;color:#5a6690;line-height:1.5;margin-top:2px}
.ad{margin:26px 0;text-align:center;min-height:90px}.ad small{display:block;font-size:11px;letter-spacing:.8px;text-transform:uppercase;color:#7a85ad;margin-bottom:4px}
footer{max-width:760px;margin:0 auto;padding:10px 18px 40px;font-size:14px;color:#5a6690}footer a{color:#5a6690}
@media (max-width:480px){h1{font-size:24px}body{font-size:16.5px}}`;

function page({ title, desc, path, body, ads, ctx, jsonld }) {
  const url = ctx.base + path, a = ads && ads.on ? ads : null;
  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} | ${esc(ctx.company)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${esc(url)}">
<meta property="og:type" content="article"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${esc(url)}"><meta name="theme-color" content="#0a1c40">
<link rel="icon" href="/icons/icon-192.png">${a ? `<meta name="google-adsense-account" content="${esc(a.client)}"><script>window.adsbygoogle=window.adsbygoogle||[];window.adsbygoogle.requestNonPersonalizedAds=1;</script><script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(a.client)}" crossorigin="anonymous"></script>` : ''}
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>` : ''}<style>${CSS}</style></head>
<body><header class="top"><div><a class="logo" href="/guias"><b>Code</b><span>Up</span> <small style="font-size:13px;font-weight:600;opacity:.8">Guias</small></a><a class="cta" href="/">Abrir o app</a></div></header>
<main>${body}</main>
<footer><p>${esc(ctx.company)} é um app gratuito para aprender Python, SQL, Excel, Power BI e Análise de Dados na prática. ${a ? 'O site é mantido com anúncios do Google, sempre não personalizados. ' : ''}<a href="/guias">Todos os guias</a> · <a href="/termos">Termos de Uso</a> · <a href="/privacidade">Política de Privacidade</a>${ctx.contact ? ` · <a href="mailto:${esc(ctx.contact)}">${esc(ctx.contact)}</a>` : ''}</p></footer>
</body></html>`;
}

const adUnit = ads => ads && ads.on && ads.slot ? `<div class="ad" aria-label="Publicidade"><small>Publicidade</small><ins class="adsbygoogle" style="display:block" data-ad-client="${esc(ads.client)}" data-ad-slot="${esc(ads.slot)}" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(window.adsbygoogle=window.adsbygoogle||[]).push({});</script></div>` : '';

function renderGuide(g, ctx, ads) {
  const lessonHtml = (l, i) => {
    const info = l.info || {};
    const parts = [['O que é', info.oque], ['Para que serve', info.serve], ['Como você vai usar', info.como], ['O que vai aparecer', info.retorno]].filter(x => x[1]);
    return `<section class="l" id="licao-${l.n}"><h2>Lição ${l.n}: ${esc(l.title)}</h2>${l.explain ? `<p class="lead">${esc(l.explain).replace(/`([^`]+)`/g, '<code>$1</code>')}</p>` : ''}
${parts.map(([h, t]) => `<h3>${h}</h3>${para(t)}`).join('')}
${typeof l.example === 'string' && l.example.trim() ? `<h3>Exemplo</h3><pre><code>${esc(l.example.trim())}</code></pre>` : ''}</section>${i === 2 ? adUnit(ads) : ''}`;
  };
  const p = g.project;
  const body = `<p class="crumb"><a href="/guias">Guias</a> › ${esc(g.course)} › ${esc(g.level)}</p>
<h1>${esc(g.title)}</h1>
<p>${esc(INTRO[g.track])}</p>
<p>Neste guia você vai ver as lições ${g.from} a ${g.to} do curso de ${esc(g.course)} (nível ${esc(g.level)}). Cada lição explica o assunto em quatro partes: o que é, para que serve, como usar e o que você vai ver na tela. No final, há um projeto para juntar tudo o que aprendeu.</p>
<nav class="toc" aria-label="Lições deste guia"><b>Neste guia</b><ol start="${g.from}">${g.lessons.map(l => `<li><a href="#licao-${l.n}">${esc(l.title)}</a></li>`).join('')}</ol></nav>
${g.lessons.map(lessonHtml).join('\n')}
${p ? `<section class="pj" id="projeto"><h2>${esc(p.title)}</h2>${para(p.task)}${p.cobre && p.cobre.length ? `<p><b>O que este projeto usa:</b> ${p.cobre.map(esc).join(', ')}.</p>` : ''}<p>No ${esc(ctx.company)} esse projeto é feito no próprio app, com dicas e correção automática, e não tira vidas de ninguém.</p></section>` : ''}
${adUnit(ads)}
<div class="box"><p><b>Pratique de verdade.</b> Ler é só o começo: no ${esc(ctx.company)} você escreve o código, recebe a correção na hora e ganha pontos.</p><p><a class="cta" style="display:inline-block;text-decoration:none" href="/">Começar grátis</a></p></div>
<div class="nav2">${g.prev ? `<a href="/guias/${g.prev.slug}"><small>← Anterior</small>${esc(g.prev.course)} ${esc(g.prev.level)}, lições ${g.prev.from} a ${g.prev.to}</a>` : '<span></span>'}${g.next ? `<a href="/guias/${g.next.slug}"><small>Próximo →</small>${esc(g.next.course)} ${esc(g.next.level)}, lições ${g.next.from} a ${g.next.to}</a>` : ''}</div>`;
  return page({
    title: g.title, desc: g.desc, path: '/guias/' + g.slug, body, ads, ctx,
    jsonld: { '@context': 'https://schema.org', '@type': 'Article', headline: g.title, description: g.desc, inLanguage: 'pt-BR', mainEntityOfPage: ctx.base + '/guias/' + g.slug, publisher: { '@type': 'Organization', name: ctx.company } }
  });
}

function renderHub(guides, ctx, ads) {
  const byTrack = {};
  guides.forEach(g => (byTrack[g.track] ||= []).push(g));
  const body = `<h1>Guias gratuitos de Python, SQL, Excel, Power BI e Análise de Dados</h1>
<p>Aqui estão as explicações das lições do ${esc(ctx.company)} em formato de leitura. Cada guia reúne 5 lições, com exemplos e um projeto para praticar. Escolha um curso, comece pelo nível Básico e avance no seu ritmo.</p>
<p>Para escrever o código, receber correção automática, ganhar pontos e fazer as provas, abra o app: ele é gratuito.</p>
${Object.keys(byTrack).map(t => `<h2>${esc(NAMES[t])}</h2><p>${esc(INTRO[t])}</p><ul class="gl">${byTrack[t].map(g => `<li><a href="/guias/${g.slug}">${esc(g.level)} · lições ${g.from} a ${g.to}</a><small>${esc(g.lessons.map(l => l.title).join(' · '))}</small></li>`).join('')}</ul>`).join('\n')}`;
  return page({
    title: 'Guias gratuitos de Python, SQL, Excel, Power BI e Análise de Dados', desc: 'Aprenda Python, SQL, Excel, Power BI e Análise de Dados do zero, com explicações simples, exemplos e projetos. Guias gratuitos em português.',
    path: '/guias', body, ads: null, ctx   // a lista é só navegação: sem anúncios (o AdSense não aceita anúncio em página de navegação)
  });
}

// monta as rotas /guias, /guias/:slug, /sitemap.xml e /robots.txt. `env()` devolve { base, company, contact } e `ads()` o estado dos anúncios (lidos a cada pedido, pois o dono liga e desliga no painel)
function mount(app, { lessons, projects, env, ads }) {
  const guides = build(lessons, projects, lessons.LEVEL_NAMES), by = new Map(guides.map(g => [g.slug, g]));
  const send = (res, html) => res.set('Cache-Control', 'public, max-age=600').type('html').send(html);
  app.get('/guias', (req, res) => send(res, renderHub(guides, env(), ads())));
  app.get('/guias/:slug', (req, res) => {
    const g = by.get(req.params.slug);
    if (!g) return res.status(404).type('html').send(page({ title: 'Guia não encontrado', desc: 'Este guia não existe.', path: '/guias', body: '<h1>Guia não encontrado</h1><p><a href="/guias">Ver todos os guias</a></p>', ads: null, ctx: env() }));
    send(res, renderGuide(g, env(), ads()));
  });
  app.get('/sitemap.xml', (req, res) => {
    const c = env(), urls = ['/', '/guias', ...guides.map(g => '/guias/' + g.slug), '/termos', '/privacidade'];
    res.set('Cache-Control', 'public, max-age=3600').type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `<url><loc>${esc(c.base + u)}</loc></url>`).join('\n')}\n</urlset>\n`);
  });
  app.get('/robots.txt', (req, res) => res.set('Cache-Control', 'public, max-age=3600').type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin\n\nSitemap: ${env().base}/sitemap.xml\n`));
  return guides;
}

module.exports = { mount, build, renderGuide, renderHub, NAMES };
