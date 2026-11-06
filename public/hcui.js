'use strict';
// ============================================================================
// HTML E CSS NO NAVEGADOR: a PRÉVIA da página do aluno e a lista de verificações (✓/✗). Quem decide se acertou é o servidor (htmlcheck.js).
//
// A página do aluno aparece num <iframe sandbox="" srcdoc="..."> que NÃO consegue fazer nada além de mostrar a página:
//   • sandbox vazio: sem script, sem formulário enviado, sem janela nova, sem acesso ao CodeUp (origem própria e isolada);
//   • uma tag <meta> de Content-Security-Policy no começo ('default-src none'): nada de rede, só estilo e imagem embutida (data:);
//   • antes disso o HTML passa por uma limpeza (DOMParser): sem <script>, <iframe>, <object>, <embed>, <link>, <base>, <meta http-equiv>, sem atributos on...= e sem javascript:;
//     links viram "#" e toda imagem vira um desenho com o nome do arquivo (as lições usam imagens de exemplo que não existem).
// As três camadas valem sozinhas: se uma falhar, as outras ainda impedem qualquer código de rodar.
// ============================================================================
const HC = (() => {
  const CSP = "default-src 'none'; style-src 'unsafe-inline'; img-src data:";
  const BAD = 'script,iframe,frame,frameset,object,embed,applet,link,base,noscript,audio,video,source,track,portal,template,slot,dialog[open]';
  const EV = /^on/i, URLATTR = /^(href|src|xlink:href|data|poster|action|formaction|cite|background|longdesc|usemap|srcset|ping|codebase|manifest)$/i;
  const attrEsc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  const xml = s => String(s).replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c]));

  // desenho no lugar de uma imagem: cinza com montanhas e o nome do arquivo
  const ph = name => {
    const t = String(name || 'imagem').replace(/[?#].*$/, '').split('/').pop().slice(0, 26) || 'imagem';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="150" viewBox="0 0 240 150"><rect width="240" height="150" fill="#e6ebf5"/><circle cx="188" cy="38" r="14" fill="#d3dbec"/><path d="M0 150 70 78l38 40 46-52 86 84z" fill="#c4cfe6"/><text x="120" y="139" font-family="sans-serif" font-size="13" text-anchor="middle" fill="#55648a">${xml(t)}</text></svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  };

  // monta o documento da prévia (texto para srcdoc). cfg: { edit: 'html'|'doc'|'css', code, page (css), pre (css pronto antes do código) }
  function build(cfg) {
    const css = cfg.edit === 'css', code = String(cfg.code == null ? '' : cfg.code).slice(0, 20000);
    const d = new DOMParser().parseFromString(css ? String(cfg.page || '') : code, 'text/html');
    d.querySelectorAll(BAD).forEach(e => e.remove());
    d.querySelectorAll('meta').forEach(m => { if (m.hasAttribute('http-equiv')) m.remove(); });
    d.querySelectorAll('style').forEach(s => { s.textContent = s.textContent.replace(/@import[^;{]*;?/gi, ''); });
    d.querySelectorAll('*').forEach(el => {
      for (const a of Array.from(el.attributes)) {
        const n = a.name;
        if (EV.test(n) || n === 'srcdoc' || n === 'style' && /expression\s*\(|javascript:/i.test(a.value)) { el.removeAttribute(n); continue; }
        if (!URLATTR.test(n)) continue;
        const tag = el.tagName.toLowerCase(), v = String(a.value).trim();
        if (tag === 'img' && n === 'src') { el.setAttribute('src', /^data:image\/(png|jpe?g|gif|webp|svg\+xml);/i.test(v) ? v : ph(v)); continue; }
        if (/^(href|xlink:href)$/i.test(n)) { if (v[0] === '#') continue; if (tag === 'a' || tag === 'area') { el.setAttribute(n, '#'); continue; } }
        el.removeAttribute(n);
      }
      if (el.tagName === 'A' || el.tagName === 'AREA') el.removeAttribute('target');
      if (el.tagName === 'FORM') el.removeAttribute('target');
    });
    d.querySelectorAll('img:not([src])').forEach(i => i.setAttribute('src', ph(i.getAttribute('alt') || 'imagem')));
    if (css) {                                                                              // lição de CSS: a página pronta + o CSS do aluno por último (como o corretor faz)
      const st = d.createElement('style'); st.textContent = String(code).replace(/@import[^;{]*;?/gi, ''); (d.body || d.documentElement).appendChild(st);
    }
    const head = d.head || d.documentElement.insertBefore(d.createElement('head'), d.documentElement.firstChild);
    if (cfg.pre) { const st = d.createElement('style'); st.textContent = String(cfg.pre).replace(/@import[^;{]*;?/gi, ''); head.insertBefore(st, head.firstChild); }   // CSS pronto da lição: vem antes do que o aluno escreveu
    const m1 = d.createElement('meta'); m1.setAttribute('http-equiv', 'Content-Security-Policy'); m1.setAttribute('content', CSP);
    const m2 = d.createElement('meta'); m2.setAttribute('name', 'color-scheme'); m2.setAttribute('content', 'light');
    const m3 = d.createElement('meta'); m3.setAttribute('charset', 'utf-8');
    head.insertBefore(m2, head.firstChild); head.insertBefore(m1, head.firstChild); head.insertBefore(m3, head.firstChild);   // a política de segurança vem antes de qualquer coisa do aluno
    return (d.doctype ? '<!DOCTYPE html>' : '') + d.documentElement.outerHTML;
  }

  // a configuração de uma atividade (lição, projeto ou prova) + o código que se quer mostrar. o: { example: true } mostra o EXEMPLO da teoria
  const cfgOf = (l, code, o) => {
    o = o || {}; const edit = l && l.edit || 'html';
    if (edit === 'css') return { edit, code, page: o.example ? (l.exPage || l.page) : l.page };
    return { edit, code, pre: o.example ? l.exCss : l.css };
  };
  // o <iframe> pronto para colocar na tela (devolve texto HTML)
  function frame(code, l, o) {
    o = o || {}; let doc;
    try { doc = build(cfgOf(l, code, o)); } catch (e) { return '<p class=labe>Não consegui mostrar a página agora.</p>'; }
    return `<div class="hcv"><div class="hcvh"><i></i><i></i><i></i><span>${o.title || 'sua página'}</span></div><iframe class="hcf${o.tall ? ' tall' : o.sm ? ' sm' : ''}" sandbox="" referrerpolicy="no-referrer" title="Prévia da página" srcdoc="${attrEsc(doc)}"></iframe></div>`;
  }
  // `crase` vira <code>
  const inl = t => xml(t).replace(/`([^`]+)`/g, '<code>$1</code>');
  // a lista de verificações: items = [{ ok, d, why? }]
  function list(items, o) {
    o = o || {};
    return `<ul class="hcl${o.exam ? ' exam' : ''}" aria-label="O que a tarefa pede">${items.map(i => `<li class="${i.ok ? 'ok' : 'no'}"><span class=hci aria-hidden=true>${i.ok ? '✓' : '✗'}</span><span class=hct>${inl(i.d)}${!i.ok && i.why ? `<small>${inl(i.why)}</small>` : ''}<b class=sr> ${i.ok ? '(feito)' : '(falta)'}</b></span></li>`).join('')}</ul>`;
  }
  return { build, frame, list, inl, ph };
})();
if (typeof module !== 'undefined') module.exports = HC;
