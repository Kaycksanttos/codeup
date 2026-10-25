// Gráficos, tabelas e diagramas de modelo de dados em SVG/HTML puro (sem biblioteca), para as lições de Power BI e de Análise de Dados.
// Funciona no navegador e no Node (os testes montam todos os gráficos das lições para conferir que nenhum quebra).
//
//   chart({ type, title?, cats, series: [{ name, values }], fmt?, stack?, label?, min? })        min: onde o eixo de valores começa (colunas e linhas); sem ele começa no zero        type: column | bar | line | area | pie | donut | scatter | card
//   chart({ type: 'scatter', series: [{ name, points: [[x, y], ...] }], xlabel?, ylabel? })
//   chart({ type: 'card', label, value, fmt? })                                             um cartão com um número grande (KPI)
//   table({ cols, rows, title?, fmt? })                                                     fmt: { índiceDaColuna: 'moeda' | 'int' | 'pct0' | 'pct1' | 'dec1' | 'dec2' }
//   diagram({ tables: [{ name, cols: [...], fact? }], rels: [['Vendas[ProdutoID]', 'Produtos[ProdutoID]']] })   modelo de dados: tabelas e relacionamentos (muitos → um)
// As cores vêm das variáveis CSS --ch0 … --ch5 (veja style.css).
(function (root, factory) { if (typeof module === 'object' && module.exports) module.exports = factory(); else root.CH = factory(); })(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const grp = (n, d) => { const f = Math.abs(n).toFixed(d), [i, dec] = f.split('.'); return (n < 0 && +f !== 0 ? '-' : '') + i.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (dec ? ',' + dec : ''); };
  // número no jeito brasileiro: 1.234,5 · R$ 1.234,50 · 25,3%
  function nf(v, fmt) {
    if (v === null || v === undefined || v === '') return '';
    if (typeof v !== 'number') return String(v);
    switch (fmt) {
      case 'moeda': return (v < 0 ? '-' : '') + 'R$ ' + grp(Math.abs(v), 2);
      case 'int': return grp(Math.round(v), 0);
      case 'dec1': return grp(v, 1);
      case 'dec2': return grp(v, 2);
      case 'pct0': return grp(v * 100, 0) + '%';
      case 'pct1': return grp(v * 100, 1) + '%';
      case 'pct2': return grp(v * 100, 2) + '%';
      case 'mil': return Math.abs(v) >= 1e6 ? grp(v / 1e6, 1) + ' mi' : Math.abs(v) >= 1e3 ? grp(v / 1e3, 1) + ' mil' : grp(v, Number.isInteger(v) ? 0 : 1);
    }
    return Number.isInteger(v) ? grp(v, 0) : grp(Math.round(v * 1e4) / 1e4, Math.abs(v) < 10 ? 2 : 1).replace(/,00$/, '');
  }
  // eixo "bonito": máximo redondo e 4 intervalos
  function nice(lo, hi) {
    if (hi === lo) { hi = lo + 1; }
    const span = hi - lo, p = Math.pow(10, Math.floor(Math.log10(span))), f = span / p, step = (f <= 1 ? 0.25 : f <= 2 ? 0.5 : f <= 5 ? 1 : 2) * p;
    const a = Math.floor(lo / step) * step, b = Math.ceil(hi / step) * step, t = []; for (let v = a; v <= b + step / 1e6; v += step) t.push(Math.round(v / step) * step);
    return { lo: a, hi: b, ticks: t };
  }
  const cut = (s, n) => { s = String(s); return s.length > n ? s.slice(0, n - 1) + '…' : s; };
  const W = 360, H = 230;
  const sum = (d) => d.series.map(s => `${s.name ? s.name + ': ' : ''}${d.cats.map((c, i) => `${c} ${nf(s.values[i], d.fmt)}`).join(', ')}`).join('; ');
  const legend = d => d.series.length > 1 || d.type === 'pie' || d.type === 'donut' ? `<div class=chl>${(d.type === 'pie' || d.type === 'donut' ? d.cats : d.series.map(s => s.name)).map((n, i) => `<span><i class=f${i % 6}></i>${esc(n)}</span>`).join('')}</div>` : '';
  const wrap = (d, svg, alt) => `<figure class="chw ct-${d.type}" role=img aria-label="${esc(alt)}">${d.title ? `<figcaption class=cht>${esc(d.title)}</figcaption>` : ''}${svg}${legend(d)}</figure>`;
  const num = v => Math.round(v * 100) / 100;

  function axes(d, lo, hi, M, horiz) {                                  // linhas de grade + rótulos do eixo de valores
    const A = nice(lo, hi), pw = W - M.l - M.r, ph = H - M.t - M.b; let s = '';
    for (const t of A.ticks) {
      if (horiz) { const x = num(M.l + (t - A.lo) / (A.hi - A.lo) * pw); s += `<line class=gl x1=${x} x2=${x} y1=${M.t} y2=${H - M.b} /><text class=at x=${x} y=${H - M.b + 13} text-anchor=middle>${esc(nf(t, d.fmt === 'moeda' ? 'mil' : d.fmt))}</text>`; }
      else { const y = num(H - M.b - (t - A.lo) / (A.hi - A.lo) * ph); s += `<line class=gl x1=${M.l} x2=${W - M.r} y1=${y} y2=${y} /><text class=at x=${M.l - 5} y=${y + 3} text-anchor=end>${esc(nf(t, d.fmt === 'moeda' ? 'mil' : d.fmt))}</text>`; }
    }
    return { A, svg: s };
  }

  function column(d) {
    const n = d.cats.length, m = d.series.length, M = { l: 46, r: 10, t: 14, b: n > 6 ? 56 : 30 }, pw = W - M.l - M.r, ph = H - M.t - M.b;
    const vals = d.series.flatMap(s => s.values.filter(v => typeof v === 'number'));
    let lo = typeof d.min === 'number' ? d.min : Math.min(0, ...vals), hi = Math.max(0, ...vals); if (d.stack) { hi = Math.max(0, ...d.cats.map((_, i) => d.series.reduce((a, s) => a + (s.values[i] > 0 ? s.values[i] : 0), 0))); }
    const { A, svg: grid } = axes(d, lo, hi, M, false), Y = v => num(H - M.b - (v - A.lo) / (A.hi - A.lo) * ph), band = pw / n, bw = d.stack ? band * 0.62 : Math.min(band * 0.72 / m, 46);
    let bars = '', labels = '';
    d.cats.forEach((c, i) => {
      const cx = M.l + band * (i + 0.5); let acc = 0;
      d.series.forEach((s, k) => {
        const v = s.values[i]; if (typeof v !== 'number') return;
        const x = d.stack ? cx - bw / 2 : cx - (bw * m) / 2 + bw * k, y0 = d.stack ? Y(acc) : Y(Math.max(0, A.lo)), y1 = d.stack ? Y(acc + v) : Y(v);
        bars += `<rect class="b f${k % 6}" x=${num(x)} y=${Math.min(y0, y1)} width=${num(bw - 1)} height=${Math.max(1, Math.abs(y0 - y1))} rx=2 />`;
        if (d.stack) acc += v; else if (n * m <= 10) labels += `<text class=vl x=${num(x + (bw - 1) / 2)} y=${v >= 0 ? y1 - 3 : y1 + 10} text-anchor=middle>${esc(nf(v, d.fmt))}</text>`;
      });
      const lx = num(cx), ly = H - M.b + 14;
      labels += n > 6 ? `<text class=at transform="rotate(-40 ${lx} ${ly})" x=${lx} y=${ly} text-anchor=end>${esc(cut(c, 12))}</text>` : `<text class=at x=${lx} y=${ly} text-anchor=middle>${esc(cut(c, n > 4 ? 9 : 13))}</text>`;
    });
    return `<svg viewBox="0 0 ${W} ${H}" class=chs>${grid}<line class=ax x1=${M.l} x2=${W - M.r} y1=${Y(Math.max(0, A.lo))} y2=${Y(Math.max(0, A.lo))} />${bars}${labels}</svg>`;
  }
  function bar(d) {
    const n = d.cats.length, m = d.series.length, M = { l: 86, r: 34, t: 8, b: 24 }, pw = W - M.l - M.r, ph = H - M.t - M.b, H2 = Math.max(H, n * (12 + m * 8) + M.t + M.b);
    const vals = d.series.flatMap(s => s.values.filter(v => typeof v === 'number')), lo = Math.min(0, ...vals), hi = Math.max(0, ...vals);
    const A = nice(lo, hi), X = v => num(M.l + (v - A.lo) / (A.hi - A.lo) * pw), band = (H2 - M.t - M.b) / n, bh = Math.min(band * 0.74 / m, 22);
    let s = '';
    for (const t of A.ticks) s += `<line class=gl x1=${X(t)} x2=${X(t)} y1=${M.t} y2=${H2 - M.b} /><text class=at x=${X(t)} y=${H2 - M.b + 13} text-anchor=middle>${esc(nf(t, d.fmt === 'moeda' ? 'mil' : d.fmt))}</text>`;
    d.cats.forEach((c, i) => {
      const cy = M.t + band * (i + 0.5); s += `<text class=at x=${M.l - 6} y=${num(cy + 3)} text-anchor=end>${esc(cut(c, 14))}</text>`;
      d.series.forEach((sr, k) => {
        const v = sr.values[i]; if (typeof v !== 'number') return; const y = cy - (bh * m) / 2 + bh * k, x0 = X(Math.max(0, A.lo)), x1 = X(v);
        s += `<rect class="b f${k % 6}" x=${Math.min(x0, x1)} y=${num(y)} width=${Math.max(1, Math.abs(x1 - x0))} height=${num(bh - 1)} rx=2 /><text class=vl x=${Math.max(x0, x1) + 4} y=${num(y + bh / 2 + 3)}>${esc(nf(v, d.fmt))}</text>`;
      });
    });
    return `<svg viewBox="0 0 ${W} ${H2}" class=chs>${s}<line class=ax x1=${X(0)} x2=${X(0)} y1=${M.t} y2=${H2 - M.b} /></svg>`;
  }
  function line(d, area) {
    const n = d.cats.length, M = { l: 46, r: 12, t: 14, b: n > 7 ? 50 : 30 }, pw = W - M.l - M.r, ph = H - M.t - M.b;
    const vals = d.series.flatMap(s => s.values.filter(v => typeof v === 'number')), lo = typeof d.min === 'number' ? d.min : Math.min(area ? 0 : Math.min(...vals) >= 0 ? 0 : Math.min(...vals), ...vals), hi = Math.max(...vals, 0);
    const { A, svg: grid } = axes(d, lo, hi, M, false), Y = v => num(H - M.b - (v - A.lo) / (A.hi - A.lo) * ph), X = i => num(M.l + (n === 1 ? pw / 2 : pw * i / (n - 1)));
    let s = '';
    d.series.forEach((sr, k) => {
      const pts = sr.values.map((v, i) => typeof v === 'number' ? [X(i), Y(v), v] : null).filter(Boolean); if (!pts.length) return;
      if (area) s += `<path class="ar f${k % 6}" d="M${pts[0][0]} ${Y(0)} ${pts.map(p => `L${p[0]} ${p[1]}`).join(' ')} L${pts[pts.length - 1][0]} ${Y(0)}Z" />`;
      s += `<polyline class="ln s${k % 6}" points="${pts.map(p => p[0] + ',' + p[1]).join(' ')}" />${pts.map(p => `<circle class="dt f${k % 6}" cx=${p[0]} cy=${p[1]} r=3 />`).join('')}`;
      if (n <= 8 && d.series.length === 1) s += pts.map(p => `<text class=vl x=${p[0]} y=${p[1] - 7} text-anchor=middle>${esc(nf(p[2], d.fmt))}</text>`).join('');
    });
    d.cats.forEach((c, i) => { const lx = X(i), ly = H - M.b + 14; s += n > 7 ? `<text class=at transform="rotate(-40 ${lx} ${ly})" x=${lx} y=${ly} text-anchor=end>${esc(cut(c, 10))}</text>` : `<text class=at x=${lx} y=${ly} text-anchor=middle>${esc(cut(c, 9))}</text>`; });
    return `<svg viewBox="0 0 ${W} ${H}" class=chs>${grid}${s}</svg>`;
  }
  function pie(d, hole) {
    const vals = d.series[0].values.map(v => Math.max(0, +v || 0)), tot = vals.reduce((a, b) => a + b, 0) || 1, cx = 110, cy = 112, R = 90, r = hole ? 52 : 0; let a0 = -Math.PI / 2, s = '';
    vals.forEach((v, i) => {
      const a1 = a0 + v / tot * Math.PI * 2, big = a1 - a0 > Math.PI ? 1 : 0, P = (a, rr) => [num(cx + Math.cos(a) * rr), num(cy + Math.sin(a) * rr)];
      if (v / tot > 0.9999) s += `<circle class="b f${i % 6}" cx=${cx} cy=${cy} r=${R} />${hole ? `<circle class=hole cx=${cx} cy=${cy} r=${r} />` : ''}`;
      else if (v > 0) { const p0 = P(a0, R), p1 = P(a1, R), q1 = P(a1, r), q0 = P(a0, r); s += `<path class="b f${i % 6}" d="M${p0} A${R} ${R} 0 ${big} 1 ${p1} ${hole ? `L${q1} A${r} ${r} 0 ${big} 0 ${q0}` : `L${cx} ${cy}`}Z" />`; }
      if (v / tot >= 0.06) { const am = (a0 + a1) / 2, p = [cx + Math.cos(am) * (R + r) / 2, cy + Math.sin(am) * (R + r) / 2]; s += `<text class="pl" x=${num(p[0])} y=${num(p[1] + 4)} text-anchor=middle>${esc(grp(v / tot * 100, 0))}%</text>`; }
      a0 = a1;
    });
    // legenda ao lado, com os valores
    const lg = d.cats.map((c, i) => `<g transform="translate(222 ${20 + i * 22})"><rect class="b f${i % 6}" width=11 height=11 rx=2 /><text class=at x=17 y=10>${esc(cut(c, 13))}</text></g>`).join('');
    return `<svg viewBox="0 0 ${W} ${Math.max(224, 30 + d.cats.length * 22)}" class=chs>${s}${lg}</svg>`;
  }
  function scatter(d) {
    const pts = d.series.flatMap(s => s.points), M = { l: 46, r: 12, t: 14, b: 34 }, pw = W - M.l - M.r, ph = H - M.t - M.b;
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), AX = nice(Math.min(...xs), Math.max(...xs)), AY = nice(Math.min(0, ...ys), Math.max(...ys));
    const X = v => num(M.l + (v - AX.lo) / (AX.hi - AX.lo) * pw), Y = v => num(H - M.b - (v - AY.lo) / (AY.hi - AY.lo) * ph); let s = '';
    for (const t of AY.ticks) s += `<line class=gl x1=${M.l} x2=${W - M.r} y1=${Y(t)} y2=${Y(t)} /><text class=at x=${M.l - 5} y=${Y(t) + 3} text-anchor=end>${esc(nf(t))}</text>`;
    for (const t of AX.ticks) s += `<text class=at x=${X(t)} y=${H - M.b + 14} text-anchor=middle>${esc(nf(t))}</text>`;
    d.series.forEach((sr, k) => { s += sr.points.map(p => `<circle class="dt f${k % 6}" cx=${X(p[0])} cy=${Y(p[1])} r=4 style="opacity:.85" />`).join(''); });
    if (d.xlabel) s += `<text class=al x=${W / 2} y=${H - 3} text-anchor=middle>${esc(d.xlabel)}</text>`;
    if (d.ylabel) s += `<text class=al transform="rotate(-90 11 ${H / 2})" x=11 y=${H / 2} text-anchor=middle>${esc(d.ylabel)}</text>`;
    return `<svg viewBox="0 0 ${W} ${H}" class=chs>${s}</svg>`;
  }
  function chart(d) {
    if (!d || !d.type) return '';
    if (d.type === 'card') return `<figure class="chw ct-card" role=img aria-label="${esc(d.label)}: ${esc(typeof d.value === 'number' ? nf(d.value, d.fmt) : d.value)}"><div class=kpi><small>${esc(d.label)}</small><b>${esc(typeof d.value === 'number' ? nf(d.value, d.fmt) : d.value)}</b>${d.note ? `<em>${esc(d.note)}</em>` : ''}</div></figure>`;
    if (d.type === 'scatter') return wrap(d, scatter(d), `Gráfico de dispersão${d.title ? ': ' + d.title : ''} com ${d.series.reduce((a, s) => a + s.points.length, 0)} pontos`);
    const x = { ...d, series: d.series.map(s => ({ ...s })) }, name = { column: 'colunas', bar: 'barras', line: 'linhas', area: 'área', pie: 'pizza', donut: 'rosca' }[d.type] || d.type;
    const svg = d.type === 'column' ? column(x) : d.type === 'bar' ? bar(x) : d.type === 'line' ? line(x) : d.type === 'area' ? line(x, true) : d.type === 'pie' ? pie(x) : d.type === 'donut' ? pie(x, true) : null;
    if (svg === null) throw new Error('tipo de gráfico desconhecido: ' + d.type);
    return wrap(d, svg, `Gráfico de ${name}${d.title ? ': ' + d.title : ''}. ${sum(d)}`);
  }

  function table(t) {
    if (!t) return '';
    const isNum = i => t.rows.some(r => typeof r[i] === 'number') && t.rows.every(r => r[i] === null || r[i] === undefined || typeof r[i] === 'number');
    return `<div class=chtb>${t.title ? `<small>${esc(t.title)}</small>` : ''}<div class=tw><table><tr>${t.cols.map((c, i) => `<th${isNum(i) ? ' class=r' : ''}>${esc(c)}</th>`).join('')}</tr>${t.rows.map(r => `<tr>${r.map((v, i) => `<td${isNum(i) ? ' class=r' : ''}>${v === null || v === undefined ? '<i>vazio</i>' : esc(nf(v, t.fmt && t.fmt[i]))}</td>`).join('')}</tr>`).join('')}</table></div></div>`;
  }

  // modelo de dados: tabelas (fato no meio, dimensões em volta) e relacionamentos (1 na ponta da dimensão, * na ponta da fato)
  function diagram(d) {
    const T = d.tables, facts = T.filter(t => t.fact), dims = T.filter(t => !t.fact), BW = 104, rowH = 13, hd = 18;
    const bh = t => hd + Math.min(t.cols.length, 6) * rowH + 6;
    const pos = {}; let svgH;
    if (facts.length === 1) {
      const top = dims.filter((_, i) => i % 2 === 0), bot = dims.filter((_, i) => i % 2 === 1), hTop = top.length ? Math.max(...top.map(bh)) : 0, hBot = bot.length ? Math.max(...bot.map(bh)) : 0, gap = 54;
      const place = (arr, y) => arr.forEach((t, i) => { pos[t.name] = { x: Math.round((W - arr.length * BW) / (arr.length + 1) * (i + 1) + BW * i), y }; });
      place(top, 6); const fy = 6 + (hTop ? hTop + gap : 0); pos[facts[0].name] = { x: Math.round((W - BW) / 2), y: fy }; place(bot, fy + bh(facts[0]) + gap); svgH = fy + bh(facts[0]) + (hBot ? gap + hBot : 0) + 6;
    } else {                                                       // vários: uma linha de cada
      const per = Math.max(1, Math.min(3, T.length)); let y = 6, rowMax = 0;
      T.forEach((t, i) => { const c = i % per; if (!c && i) { y += rowMax + 40; rowMax = 0; } pos[t.name] = { x: Math.round((W - per * BW) / (per + 1) * (c + 1) + BW * c), y }; rowMax = Math.max(rowMax, bh(t)); }); svgH = y + rowMax + 6;
    }
    const byName = Object.fromEntries(T.map(t => [t.name, t]));
    let s = '';
    (d.rels || []).forEach(rel => {
      const [a, b] = rel.map(x => String(x).split('[')[0]); if (!pos[a] || !pos[b]) return;
      const A = pos[a], B = pos[b], ah = bh(byName[a]), bhh = bh(byName[b]);
      const ac = [A.x + BW / 2, A.y + ah / 2], bc = [B.x + BW / 2, B.y + bhh / 2], below = bc[1] > ac[1];
      const p0 = Math.abs(ac[1] - bc[1]) < 4 ? [ac[0] < bc[0] ? A.x + BW : A.x, ac[1]] : [ac[0], below ? A.y + ah : A.y], p1 = Math.abs(ac[1] - bc[1]) < 4 ? [ac[0] < bc[0] ? B.x : B.x + BW, bc[1]] : [bc[0], below ? B.y : B.y + bhh];
      const off = d.rels.filter(r => r[0].split('[')[0] === a).indexOf(rel) - (d.rels.filter(r => r[0].split('[')[0] === a).length - 1) / 2;
      s += `<line class=rl x1=${num(p0[0] + off * 12)} y1=${num(p0[1])} x2=${num(p1[0] + off * 12)} y2=${num(p1[1])} />`;
      const dash = rel[2] && rel[2].active === false ? ' stroke-dasharray="4 3"' : '';
      if (dash) s = s.replace(/<line class=rl ([^>]*) \/>$/, `<line class=rl $1${dash} />`);
      s += `<text class=rn x=${num(p0[0] + off * 12 + 4)} y=${num(p0[1] + (below ? 11 : -4))}>*</text><text class=rn x=${num(p1[0] + off * 12 + 4)} y=${num(p1[1] + (below ? -4 : 11))}>1</text>`;
    });
    for (const t of T) {
      const p = pos[t.name], h = bh(t);
      s += `<g><rect class="tb${t.fact ? ' fact' : ''}" x=${p.x} y=${p.y} width=${BW} height=${h} rx=6 /><text class=th x=${p.x + BW / 2} y=${p.y + 13} text-anchor=middle>${esc(cut(t.name, 15))}</text>`;
      t.cols.slice(0, 6).forEach((c, i) => { s += `<text class="tc${t.key === c ? ' k' : ''}" x=${p.x + 7} y=${p.y + hd + 10 + i * rowH}>${esc(cut(c, 16))}</text>`; });
      if (t.cols.length > 6) s += `<text class=tc x=${p.x + 7} y=${p.y + h - 1}>…</text>`;
      s += '</g>';
    }
    return `<figure class="chw dgm" role=img aria-label="Modelo de dados com as tabelas ${esc(T.map(t => t.name).join(', '))}. Relacionamentos: ${esc((d.rels || []).map(r => r[0] + ' para ' + r[1]).join('; '))}"><svg viewBox="0 0 ${W} ${svgH}" class=chs>${s}</svg><div class=chl><span><b>*</b> lado "muitos"</span><span><b>1</b> lado "um"</span></div></figure>`;
  }
  return { chart, table, diagram, nf, esc };
});
