// Procura os pedaços do "Como funciona" dentro do código do exemplo, na ordem e sem se repetir.
// Espaços e quebras de linha não contam (o SQL aparece organizado em linhas, então "WHERE preco > 100" precisa casar mesmo com quebras no meio).
// Usado pelo navegador (public/como.js é uma cópia fina) e pelo teste. Devolve [{ a, b, d }] (início, fim e explicação) ou lança erro dizendo qual pedaço não casou.
(function (root) {
  // palavras precisam de espaço entre si; ao redor de pontuação o espaço é opcional ("(SELECT" casa com "(\n  SELECT")
  const rx = t => { const toks = String(t).match(/\w+|[^\w\s]/g) || []; let src = ''; toks.forEach((k, i) => { if (i) src += /\w$/.test(toks[i - 1]) && /^\w/.test(k) ? '\\s+' : '\\s*'; src += k.replace(/[.*+?^${}()|[\]\\\/-]/g, '\\$&'); }); return new RegExp(src); };
  function comoMatch(code, anns) {
    const out = []; let pos = 0;
    for (const [t, d] of anns || []) {
      const m = rx(t).exec(code.slice(pos));
      if (!m) throw new Error(`pedaço "${t}" não aparece no exemplo (ou está fora de ordem)`);
      const a = pos + m.index, b = a + m[0].length; out.push({ a, b, d, t }); pos = b;
    }
    return out;
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = comoMatch; else root.comoMatch = comoMatch;
})(typeof self !== 'undefined' ? self : this);
