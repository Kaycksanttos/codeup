// Organiza o SQL dos exemplos e das soluções para leitura: cada parte do comando (SELECT, FROM, JOIN, WHERE...) numa linha,
// listas longas uma por linha e subconsultas com recuo. Só mexe em espaços e quebras de linha, nunca no texto do comando.
// Também gera a legenda "Como ler" (o que cada parte faz). Roda no navegador (window.fmtSql) e no Node (testes).
(function (root) {
  'use strict';
  const W0 = 40;                                                      // largura alvo: cabe em celular sem rolar para o lado

  const TOK = /(\s+)|('(?:[^']|'')*'|"[^"]*")|(\.\.\.)|(\d+(?:\.\d+)?)|([A-Za-z_][A-Za-z_0-9]*)|(<=|>=|<>|!=|\|\|)|([\s\S])/g;
  function parse(src) {                                               // texto -> árvore (parênteses viram grupos)
    const root = { items: [] }, st = [root]; let sp = false, m; TOK.lastIndex = 0;
    while ((m = TOK.exec(src))) {
      if (m[1]) { sp = true; continue; }
      const top = st[st.length - 1];
      if (m[7] === '(') { const g = { k: 'g', items: [], sp }; top.items.push(g); st.push(g); }
      else if (m[7] === ')') { if (st.length < 2) throw new Error('parênteses'); st.pop(); }
      else top.items.push({ k: m[5] ? 'w' : m[2] ? 's' : m[4] ? 'n' : m[3] ? 'w' : 'p', v: m[0], sp });
      sp = false;
    }
    if (st.length !== 1) throw new Error('parênteses');
    return root.items;
  }

  const isW = (n, w) => !!n && n.k === 'w' && n.v.toUpperCase() === w;
  const isP = (n, v) => !!n && n.k === 'p' && n.v === v;
  const gap = (p, c) => !p || isP(c, ',') || isP(c, ';') || isP(c, '.') || isP(p, '.') ? '' : isP(p, ',') ? ' ' : c.sp ? ' ' : '';
  const txt = n => n.k === 'g' ? '(' + flat(n.items) + ')' : n.v;
  function flat(ns) { let o = ''; ns.forEach((n, i) => { o += (i ? gap(ns[i - 1], n) : '') + txt(n); }); return o; }

  const SINGLE = new Set(['SELECT', 'FROM', 'WHERE', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'INTERSECT', 'EXCEPT', 'WITH', 'VALUES', 'UPDATE', 'SET']);
  function headAt(ns, i) {                                            // quantas palavras formam o início de uma parte do comando (0 = não é)
    const w = k => ns[i + k] && ns[i + k].k === 'w' ? ns[i + k].v.toUpperCase() : '';
    const a = w(0), b = w(1);
    if (!a) return 0;
    if ((a === 'GROUP' || a === 'ORDER') && b === 'BY') return 2;
    if ((a === 'INSERT' && b === 'INTO') || (a === 'DELETE' && b === 'FROM') || (a === 'UNION' && b === 'ALL')) return 2;
    if (a === 'CREATE' && (b === 'TABLE' || b === 'VIEW' || b === 'INDEX')) return 2;
    if (a === 'DROP' && b === 'TABLE') return 2;
    if (SINGLE.has(a)) return 1;
    let j = 0; if (w(j) === 'NATURAL') j++; if (['INNER', 'LEFT', 'RIGHT', 'FULL', 'CROSS'].includes(w(j))) j++; if (w(j) === 'OUTER') j++;
    return w(j) === 'JOIN' ? j + 1 : 0;
  }
  function splitClauses(ns) {
    const out = []; let cur = { head: '', body: [] };
    for (let i = 0; i < ns.length;) {
      const h = headAt(ns, i);
      if (h) { if (cur.head || cur.body.length) out.push(cur); cur = { head: ns.slice(i, i + h).map(x => x.v).join(' '), body: [] }; i += h; }
      else cur.body.push(ns[i++]);
    }
    if (cur.head || cur.body.length) out.push(cur);
    return out;
  }
  function splitAt(ns, test) {                                        // divide em pontos de nível superior (fora de parênteses e de CASE)
    const parts = [[]]; let cs = 0;
    ns.forEach(n => {
      if (isW(n, 'CASE')) cs++; else if (isW(n, 'END') && cs) cs--;
      if (!cs && test(n)) parts.push([]);
      parts[parts.length - 1].push(n);
    });
    return parts.filter(p => p.length);
  }
  const splitCommas = ns => { const parts = [[]]; let cs = 0; ns.forEach(n => { if (isW(n, 'CASE')) cs++; else if (isW(n, 'END') && cs) cs--; if (!cs && isP(n, ',')) parts.push([]); else parts[parts.length - 1].push(n); }); return parts.filter(p => p.length); };
  function splitConds(ns) {                                           // AND / OR (o AND do BETWEEN x AND y fica junto)
    let between = false;
    return splitAt(ns, n => { if (isW(n, 'BETWEEN')) { between = true; return false; } if (isW(n, 'AND')) { if (between) { between = false; return false; } return true; } return isW(n, 'OR'); });
  }
  const tail = (lines, s) => { if (lines.length) lines[lines.length - 1] += s; return lines; };

  function make(W) {
    function render(ns, ind) { const out = []; splitClauses(ns).forEach(c => out.push(...clause(c, ind))); return out; }

    function inner(g, prev, ind) {                                    // conteúdo de um grupo que não coube em uma linha
      const it = g.items;
      if (!isW(it[0], 'SELECT') && !isW(it[0], 'WITH') && !isW(prev, 'OVER') && !it.some(x => isP(x, ',')) && (ind + flat(it)).length <= W + 6) return [ind + flat(it)];
      if (isW(it[0], 'SELECT') || isW(it[0], 'WITH')) return render(it, ind);
      if (isW(prev, 'OVER') || it.some(x => isW(x, 'PARTITION') || isW(x, 'ROWS') || isW(x, 'RANGE'))) {
        let o = []; splitAt(it, n => isW(n, 'PARTITION') || isW(n, 'ROWS') || isW(n, 'RANGE') || isW(n, 'ORDER')).forEach(p => o.push(...expr(p, ind, ''))); return o;
      }
      if (it.some(x => isW(x, 'AND') || isW(x, 'OR')) && !it.some(x => isP(x, ','))) { const cs = splitConds(it); if (cs.length > 1) return cs.flatMap(c => expr(c, ind, '')); }
      const parts = splitCommas(it); if (parts.length < 2) return expr(it, ind, '');
      const o = []; parts.forEach((p, i) => { const ls = expr(p, ind, ''); o.push(...(i < parts.length - 1 ? tail(ls, ',') : ls)); }); return o;
    }

    function expr(ns, ind, first) {                                   // uma expressão que começa depois de `first` e, se não couber, quebra no CASE ou no parêntese
      const flatTxt = ind + first + flat(ns);
      if (flatTxt.length <= W) return [flatTxt];
      const ci = ns.findIndex(n => isW(n, 'CASE'));
      if (ci >= 0) {
        let d = 0, ei = -1; for (let i = ci; i < ns.length; i++) { if (isW(ns[i], 'CASE')) d++; else if (isW(ns[i], 'END') && --d === 0) { ei = i; break; } }
        if (ei > 0) {
          const pre = ns.slice(0, ci), body = ns.slice(ci + 1, ei), post = ns.slice(ei + 1);
          const segs = splitAt(body, n => isW(n, 'WHEN') || isW(n, 'ELSE')), head = segs.length && !isW(segs[0][0], 'WHEN') && !isW(segs[0][0], 'ELSE') ? segs.shift() : [];
          const o = [ind + first + flat(pre) + (pre.length ? ' ' : '') + 'CASE' + (head.length ? ' ' + flat(head) : '')];
          segs.forEach(s => o.push(...expr(s, ind + '  ', '')));
          return o.concat(expr(post, ind, 'END' + (post[0] && gap({ k: 'w' }, post[0]) ? ' ' : '')));
        }
      }
      // só vale quebrar parênteses que ganham com isso: subconsulta, janela (OVER), vários argumentos, CASE ou condições com AND/OR
      const worth = (n, i) => n.k === 'g' && n.items.length && (isW(n.items[0], 'SELECT') || isW(n.items[0], 'WITH') || isW(ns[i - 1], 'OVER') || flat(n.items).length > 28 || n.items.some(x => isP(x, ',') || isW(x, 'CASE') || isW(x, 'AND') || isW(x, 'OR')));
      const gs = ns.map((n, i) => worth(n, i) ? i : -1).filter(i => i >= 0);
      if (!gs.length) return [flatTxt];
      if (gs.length === 1 && isW(ns[gs[0] - 1], 'OVER') && flatTxt.length <= W + 12) return [flatTxt];   // janela curta fica em uma linha
      const pref = i => ind + first + flat(ns.slice(0, i)) + (i && ns[i].sp ? ' ' : '') + '(';
      const gi = gs.find(i => pref(i).length <= W) ?? gs[0], g = ns[gi], post = ns.slice(gi + 1);
      const o = [pref(gi), ...inner(g, ns[gi - 1], ind + '  ')];
      return o.concat(expr(post, ind, ')' + (post[0] && gap(g, post[0]) ? ' ' : '')));
    }

    function clause(c, ind) {
      let head = c.head, body = c.body; const H = head.toUpperCase();
      if (!head) return expr(body, ind, '');
      if (H === 'WITH') {
        const items = splitCommas(body), o = [];
        items.forEach((it, i) => { const ls = expr(it, ind, i ? '' : head + ' '); o.push(...(i < items.length - 1 ? tail(ls, ',') : ls)); }); return o;
      }
      if (H === 'SELECT' && isW(body[0], 'DISTINCT')) { head += ' ' + body[0].v; body = body.slice(1); }
      const one = ind + head + (body.length ? ' ' + flat(body) : '');
      if (one.length <= W || !body.length) return [one];
      if (H === 'VALUES') { const ts = splitCommas(body), o = [ind + head]; ts.forEach((t, i) => { const ls = expr(t, ind + '  ', ''); o.push(...(i < ts.length - 1 ? tail(ls, ',') : ls)); }); return o; }
      if (['SELECT', 'GROUP BY', 'ORDER BY', 'SET', 'PARTITION BY'].includes(H)) {
        const items = splitCommas(body);
        if (items.length > 1) { const o = [ind + head]; items.forEach((it, i) => { const ls = expr(it, ind + '  ', ''); o.push(...(i < items.length - 1 ? tail(ls, ',') : ls)); }); return o; }
      }
      if (H === 'WHERE' || H === 'HAVING') {
        const cs = splitConds(body);
        if (cs.length > 1) { const o = expr(cs[0], ind, head + ' '); cs.slice(1).forEach(x => o.push(...expr(x, ind + '  ', ''))); return o; }
      }
      if (H === 'CREATE INDEX') { const oi = body.findIndex(n => isW(n, 'ON')); if (oi > 0) return [ind + head + ' ' + flat(body.slice(0, oi)), ind + '  ' + flat(body.slice(oi))]; }
      if (H.endsWith('JOIN')) {
        const oi = body.findIndex(n => isW(n, 'ON'));
        if (oi > 0) {
          const o = [ind + head + ' ' + flat(body.slice(0, oi))], cs = splitConds(body.slice(oi + 1));
          o.push(...expr(cs[0] || [], ind + '  ', 'ON ')); cs.slice(1).forEach(x => o.push(...expr(x, ind + '    ', ''))); return o;
        }
      }
      const r = expr(body, ind, head + ' ');
      if (r.length === 1 && r[0].length > W && ['SELECT', 'GROUP BY', 'ORDER BY'].includes(H) && (ind + '  ' + flat(body)).length < r[0].length) return [ind + head, ind + '  ' + flat(body)];   // expressão única que não quebra: desce para a linha de baixo
      return r;
    }
    return { render };
  }

  function fmtSql(code, width) {
    const orig = String(code == null ? '' : code), src = orig.trim();
    if (!src || /\n|--|\/\*/.test(src)) return orig;                  // já está em várias linhas ou tem comentário: respeita o autor
    try {
      const { render } = make(width || W0), ns = parse(src), stmts = [[]], lines = [];
      ns.forEach(n => { stmts[stmts.length - 1].push(n); if (isP(n, ';')) stmts.push([]); });         // cada ';' fecha um comando
      stmts.forEach(s => { const semi = isP(s[s.length - 1], ';'), body = semi ? s.slice(0, -1) : s; if (!body.length) return; const ls = render(body, ''); lines.push(...(semi ? tail(ls, ';') : ls)); });
      const out = lines.join('\n');
      return out.replace(/\s+/g, '') === src.replace(/\s+/g, '') ? out : orig;     // trava de segurança: o texto do comando tem de sair idêntico
    } catch { return orig; }
  }

  // legenda "Como ler": o que cada parte do comando faz, na ordem em que aparece
  const MEANS = {
    'SELECT': 'escolhe o que mostrar', 'FROM': 'de qual tabela vêm os dados', 'JOIN': 'junta com outra tabela', 'ON': 'diz como as tabelas se ligam',
    'WHERE': 'filtra as linhas', 'GROUP BY': 'agrupa linhas iguais', 'HAVING': 'filtra os grupos', 'ORDER BY': 'ordena o resultado', 'LIMIT': 'limita quantas linhas aparecem',
    'WITH': 'cria uma tabela temporária para usar abaixo', 'UNION': 'empilha dois resultados', 'OVER': 'calcula numa "janela", sem juntar linhas', 'PARTITION BY': 'separa a janela por grupo',
    'CASE': 'escolhe um valor conforme a condição', 'INSERT INTO': 'adiciona uma linha', 'VALUES': 'os valores que entram', 'UPDATE': 'altera linhas que já existem', 'SET': 'define o novo valor',
    'DELETE FROM': 'apaga linhas', 'CREATE TABLE': 'cria uma tabela', 'CREATE VIEW': 'guarda uma consulta com nome', 'DISTINCT': 'tira repetidos', 'EXISTS': 'testa se a subconsulta devolve algo'
  };
  function sqlParts(code) {
    const words = []; String(code == null ? '' : code).replace(/'(?:[^']|'')*'|"[^"]*"|--[^\n]*|[A-Za-z_][A-Za-z_0-9]*/g, m => { if (/^[A-Za-z_]/.test(m)) words.push(m.toUpperCase()); });
    const seen = new Set(), out = [];
    for (let i = 0; i < words.length; i++) {
      const a = words[i], b = words[i + 1]; let k = '';
      if ((a === 'GROUP' || a === 'ORDER' || a === 'PARTITION') && b === 'BY') k = a + ' BY';
      else if ((a === 'INSERT' && b === 'INTO') || (a === 'DELETE' && b === 'FROM')) k = a + ' ' + b;
      else if (a === 'CREATE' && (b === 'TABLE' || b === 'VIEW')) k = a + ' ' + b;
      else if (a === 'JOIN') k = 'JOIN';
      else if (a === 'DELETE' || a === 'INSERT' || a === 'CREATE' || a === 'GROUP' || a === 'ORDER' || a === 'PARTITION') continue;
      else if (MEANS[a] && !(a === 'FROM' && words[i - 1] === 'DELETE')) k = a;
      if (k && MEANS[k] && !seen.has(k)) { seen.add(k); out.push({ k, d: MEANS[k] }); }
    }
    return out;
  }

  const api = { fmtSql, sqlParts };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else { root.fmtSql = fmtSql; root.sqlParts = sqlParts; }
})(typeof window !== 'undefined' ? window : globalThis);
