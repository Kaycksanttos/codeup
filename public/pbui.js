// ============================================================================
// TELAS DOS CURSOS "POWER BI E DAX" E "ANÁLISE DE DADOS E STORYTELLING" (usa as funções e o estado `S` do app.js)
//   • realce de sintaxe do DAX e do Power Query (M)
//   • materiais das lições: texto, código, gráfico, tabela e diagrama do modelo (matHtml)
//   • prática de DAX: o aluno escreve a medida, o servidor compara os resultados; aqui só mostramos o que ele trouxe e o esperado (daxDiag)
//   • quiz: várias perguntas numa tela (escolher, marcar, ordenar, ligar, número, escrever) e montagem de um visual com os campos (build)
// ============================================================================
const lang = l => l.exLang || l.type;                                     // linguagem do exemplo/código da lição: dax | m | text | python | sql
const PB_TYPES = ['dax', 'quiz'];
const isPb = l => !!l && PB_TYPES.includes(l.type);
const paras = t => String(t || '').split('\n').filter(x => x.trim()).map(x => `<p>${esc(x).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')}</p>`).join('');

// ---------- realce ----------
function hlDax(code) {
  const re = /(--[^\n]*|\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"]|"")*")|((?:'[^'\n]+'|[A-Za-zÀ-ÿ_][\w.À-ÿ]*)?\[[^\]\n]+\])|(\d+(?:[.,]\d+)?)|([A-Za-zÀ-ÿ_][\w.À-ÿ]*)(?=\s*\()|\b(VAR|RETURN|DEFINE|MEASURE|EVALUATE|ORDER|BY|ASC|DESC|IN|NOT|TRUE|FALSE|BLANK)\b/gi;
  let out = '', last = 0, m; code = String(code ?? '');
  while ((m = re.exec(code))) {
    out += esc(code.slice(last, m.index)); last = re.lastIndex;
    out += m[1] ? `<span class=cm>${esc(m[1])}</span>` : m[2] ? `<span class=s>${esc(m[2])}</span>` : m[3] ? `<span class=rf>${esc(m[3])}</span>` : m[4] ? `<span class=n>${esc(m[4])}</span>` : m[5] ? `<span class=f>${esc(m[5])}</span>` : `<span class=k>${esc(m[6])}</span>`;
  }
  return out + esc(code.slice(last));
}
function hlM(code) {                                                       // Power Query (linguagem M)
  const re = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"]|"")*")|(#"[^"]*")|(\d+(?:\.\d+)?)|\b(let|in|each|if|then|else|and|or|not|type|true|false|null|as|try|otherwise)\b|([A-Z][A-Za-z]*\.[A-Za-z.]+)(?=\()/g;
  let out = '', last = 0, m; code = String(code ?? '');
  while ((m = re.exec(code))) {
    out += esc(code.slice(last, m.index)); last = re.lastIndex;
    out += m[1] ? `<span class=cm>${esc(m[1])}</span>` : m[2] ? `<span class=s>${esc(m[2])}</span>` : m[3] ? `<span class=rf>${esc(m[3])}</span>` : m[4] ? `<span class=n>${m[4]}</span>` : m[5] ? `<span class=k>${m[5]}</span>` : `<span class=f>${esc(m[6])}</span>`;
  }
  return out + esc(code.slice(last));
}

// ---------- materiais (texto, código, gráfico, tabela, diagrama) ----------
function matHtml(m) {
  if (!m) return '';
  let h = '';
  if (m.text) h += `<div class=qz-text>${paras(m.text)}</div>`;
  if (m.code) h += codeBox(m.code, m.lang || 'dax', m.codeLabel || 'Código');
  if (m.diagram) h += CH.diagram(m.diagram);
  if (m.chart) h += CH.chart(m.chart);
  if (m.table) h += CH.table(m.table);
  if (m.data) h += Object.entries(m.data.tables).map(([n, t]) => CH.table({ title: 'Tabela ' + n, cols: t.cols, rows: t.rows })).join('');
  return h;
}

// ============================================================ DAX
// os dados do modelo da lição (as tabelas e as medidas que já existem) para a tela "Dados"
function daxPeek(l) {
  const sp = DAXDATA.spec(l.model), ex = l.extra || {}, T = sp.tables;
  const names = Object.keys(T), dg = { tables: names.map(n => ({ name: n, cols: T[n].cols.map(c => c.n), fact: T[n].rows.length >= 20 && n != 'Calendario', key: (T[n].cols.find(c => c.key) || {}).n })), rels: sp.rels };
  const shown = n => { const t = T[n], k = n == 'Calendario' ? 5 : 8; return CH.table({ title: `Tabela ${n} (${t.rows.length} linhas${t.rows.length > k ? '; mostrando as primeiras ' + k : ''})`, cols: t.cols.map(c => c.n), rows: t.rows.slice(0, k).map(r => r.map((v, i) => t.cols[i].t == 'date' && typeof v == 'number' ? DAX.show(v, 'data') : v)) }); };
  const ms = Object.entries(ex.measures || {}), cc = Object.entries(ex.calc || {});
  return `<div class=tname>${ic('db', 14)} Modelo de dados</div>${CH.diagram(dg)}${ms.length ? `<div class=tn style="margin:8px 0 2px">Medidas que já existem:</div><pre class=inl>${hlDax(ms.map(([n, f]) => `${n} = ${f}`).join('\n'))}</pre>` : ''}${cc.length ? `<div class=tn style="margin:8px 0 2px">Colunas calculadas que já existem:</div><pre class=inl>${hlDax(cc.map(([n, f]) => `${n} = ${f}`).join('\n'))}</pre>` : ''}${names.map(shown).join('')}`;
}
// o que o aluno vai ver: em que visual(is) a medida dele aparece
function daxViewsNote(l) {
  const vs = l.views && l.views.length ? l.views : [{ by: [] }], md = l.mode || 'measure';
  if (md == 'column') return `<div class=dxn>${ic('info', 16)}<span>Você vai escrever uma <b>coluna calculada</b> na tabela <b>${esc(l.table)}</b>. Ela é calculada <b>linha por linha</b>.</span></div>`;
  if (md == 'table') return `<div class=dxn>${ic('info', 16)}<span>Você vai escrever uma <b>tabela</b> (uma fórmula que devolve linhas e colunas).</span></div>`;
  const one = v => v.by && v.by.length ? `uma linha para cada <b>${v.by.map(esc).join(' e ')}</b>` : 'um <b>cartão</b> com o total';
  const sl = v => v.slicers && Object.keys(v.slicers).length ? ` (com a segmentação ${Object.entries(v.slicers).map(([k, a]) => `${esc(k)} = ${a.map(x => esc(String(x))).join(', ')}`).join('; ')})` : '';
  return `<div class=dxn>${ic('info', 16)}<span>Sua medida vai aparecer num visual: ${vs.map(v => one(v) + sl(v)).join(' · ')}. Toque em <b>Dados</b> para ver o modelo.</span></div>`;
}
// resultado local da medida do aluno no 1º visual (aparece na tela "lição concluída"); se algo falhar, não mostra nada
function daxStatic(l, code) {
  try {
    const mine = DAX.parse(code), M = DAXDATA.get(l.model, l.extra), md = l.mode || 'measure';
    if (md == 'measure') {
      const ds = mine.defs.filter(d => d.kind == 'measure' && d.name), v = (l.views && l.views[0]) || { by: [] }, Mx = M.with(ds.map(d => [d.name, d.ast])), r = DAX.runVisual(Mx, v, ds.map(d => ({ name: d.name, ast: d.ast, local: false })));
      const fm = n => (v.fmt && (v.fmt[n] || v.fmt['*'])) || undefined;
      return `${v.title ? `<small class=tn>${esc(v.title)}</small>` : ''}${CH.table({ cols: [...r.by.map(b => b.replace(/^.*\[|\]$/g, '')), ...r.names], rows: [...r.rows.map(x => [...x.g.map(a => DAX.show(a)), ...x.v.map((a, i) => DAX.show(a, fm(r.names[i])))]), ...(r.by.length ? [['Total', ...r.by.slice(1).map(() => ''), ...r.total.map((a, i) => DAX.show(a, fm(r.names[i])))]] : [])] })}`;
    }
  } catch { }
  return '';
}
const dxCell = (g, ok) => `<td class="${ok ? 'dxok' : 'dxbad'}">${esc(g)}</td>`;
function dxView(v, mineLbl) {                                                // um visual: coluna do aluno × coluna esperada
  const names = v.names, by = (v.by || []).map(b => b.replace(/^.*\[|\]$/g, '')), head = `<tr>${by.map(b => `<th>${esc(b)}</th>`).join('')}${names.map(n => `<th>${esc(n)}<small>Você</small></th><th><small>Esperado</small></th>`).join('')}</tr>`;
  const row = (r, tot) => `<tr class="${r.ok ? 'dxr-ok' : 'dxr-bad'}">${tot ? `<td colspan=${Math.max(1, by.length)}><b>Total</b></td>` : r.g.map(x => `<td>${esc(x)}</td>`).join('')}${names.map((n, i) => `${dxCell(r.got ? r.got[i] ?? '' : '(não apareceu)', r.ok || (r.got && r.want && r.got[i] == r.want[i]))}<td>${esc(r.want ? r.want[i] ?? '' : '(não deveria aparecer)')}</td>`).join('')}</tr>`;
  const tot = { ok: v.total.ok, got: v.total.got, want: v.total.want };
  return `<div class=dxv>${v.title ? `<small class=dxt>${esc(v.title)}</small>` : ''}<div class=tw><table class=dxt2>${head}${v.rows.map(r => row(r)).join('')}${by.length ? row(tot, true) : ''}</table></div>${v.more ? `<small class=tn>…e mais ${v.more} linhas.</small>` : ''}</div>`;
}
function daxDiag(l, s) {
  const d = s.dx || {}, code = S.daxCode || '', lines = code.split('\n');
  if (d.err) { const ln = d.err.line || 0; return fixit(ln, ln ? lines[ln - 1] || '' : '', [esc(d.err.msg) + (d.err.col ? ` (coluna ${d.err.col})` : '')]); }
  if (d.need) return fixit(0, '', [`Falta usar <b>${esc(d.need)}</b> na sua fórmula. Releia a explicação da lição.`]);
  if (d.forbid) return fixit(0, '', [`Nesta lição, não use <b>${esc(d.forbid)}</b>: a ideia é treinar o que você acabou de aprender.`]);
  if (d.kind) { const md = l.mode || 'measure'; return fixit(0, '', [md == 'column' ? `Esta lição pede uma <b>coluna calculada</b>: escreva <code>${esc(l.table)}[NomeDaColuna] = fórmula</code>.` : md == 'measure' ? `Esta lição pede uma <b>medida</b>: escreva só <code>Nome = fórmula</code>, sem o nome de uma tabela antes dos colchetes.` : 'Escreva uma fórmula que devolva uma tabela.']); }
  if (d.missing) return fixit(0, '', [`Falta definir ${d.missing.length > 1 ? 'estas medidas' : 'esta definição'}: ${d.missing.map(m => `<b>${esc(m)}</b>`).join(', ')}. Use exatamente esse nome, seguido de <code>=</code> e da fórmula.`]);
  if (d.col) { const c = d.col; return fixit(0, '', [`A coluna <b>${esc(c.name)}</b> não deu o valor esperado em ${c.bad} de ${c.total} linhas${c.alt ? ' quando os números da tabela mudam. Parece que sua fórmula usa um valor digitado à mão em vez de usar as colunas' : ''}.`]) + `<div class=exp><small>Linha a linha (a primeira coluna da tabela é ${esc(c.label)})</small><div class=tw><table class=dxt2><tr><th>#</th><th>${esc(c.label)}</th><th>Você</th><th>Esperado</th></tr>${c.rows.map(r => `<tr class="${r.ok ? 'dxr-ok' : 'dxr-bad'}"><td>${r.n}</td><td>${esc(r.key)}</td><td class="${r.ok ? 'dxok' : 'dxbad'}">${esc(r.got)}</td><td>${esc(r.want)}</td></tr>`).join('')}</table></div></div>`; }
  if (d.tbl) { const t = d.tbl, one = (x, nm) => `<div class=exp><small>${nm} (${x.n} linhas)</small>${table({ columns: x.cols, values: x.rows })}</div>`; return fixit(0, '', [t.colsOk ? 'A tabela que você montou tem linhas diferentes das esperadas.' : 'As colunas da sua tabela são diferentes das esperadas (quantidade ou nomes).' + (t.alt ? ' (conferido com outros números)' : '')]) + one(t.got, 'Sua tabela') + one(t.want, 'Tabela esperada'); }
  if (d.defs) {
    const bad = d.defs.filter(x => !x.ok), tip = d.alt ? 'Com os números certos a sua fórmula funciona, mas <b>com uma planilha parecida (outros números) o resultado muda</b>: ela está usando um valor digitado à mão ou uma regra que só serve para estes dados. Use as colunas e funções do modelo.' : 'O resultado da sua medida está diferente do esperado. As células <span class=dxbad>vermelhas</span> são as que não bateram.';
    return fixit(0, '', [tip]) + `<div class=exp>${(bad.length ? bad : d.defs).map(v => dxView(v)).join('')}</div>`;
  }
  return fixit(0, '', ['Não consegui conferir agora. Toque em Concluído de novo.']);
}

// ============================================================ QUIZ
// S.qz = { l, items, ans, lock }
const QZ_VIS = { column: 'Colunas', bar: 'Barras', line: 'Linhas', area: 'Área', pie: 'Pizza', donut: 'Rosca', card: 'Cartão', table: 'Tabela', matrix: 'Matriz', slicer: 'Segmentação', scatter: 'Dispersão' };
const QZ_SLOTS = { column: ['axis', 'legend', 'values'], bar: ['axis', 'legend', 'values'], line: ['axis', 'legend', 'values'], area: ['axis', 'legend', 'values'], pie: ['axis', 'values'], donut: ['axis', 'values'], card: ['values'], table: ['fields'], matrix: ['rows', 'cols', 'values'], slicer: ['axis'] };
const QZ_LBL = (v, k) => ({ axis: v == 'pie' || v == 'donut' ? 'Legenda (as fatias)' : v == 'slicer' ? 'Campo' : 'Eixo (categorias)', legend: 'Legenda (opcional)', values: v == 'card' ? 'Campo' : 'Valores (medida)', rows: 'Linhas', cols: 'Colunas (opcional)', fields: 'Colunas da tabela (toque para marcar)' }[k]);
const qzRaw = (it, v) => String(v ?? '');
function qzState(l) { return { l, items: l.qz || [], ans: (l.qz || []).map(it => it.t == 'multi' ? [] : it.t == 'order' ? [] : it.t == 'match' ? Array((it.left || []).length).fill('') : it.t == 'build' ? { v: '' } : ''), lock: {}, left: 0 }; }
const qzBuildModel = it => { try { return DAXDATA.get(it.model); } catch { return null; } };
function qzOpt(i, v, on, kind, k) { return `<button type=button class="rdr-o qz-o${on ? ' sel' : ''}" data-i=${i} data-v="${esc(v)}" aria-pressed=${on ? 'true' : 'false'} onclick="qzTap(${i},this)"><i class="rdr-k${kind == 'multi' ? ' sq' : ''}">${kind == 'multi' ? (on ? '✓' : '') : 'ABCDEFGH'[k] || ''}</i><span>${esc(v)}</span></button>`; }
function qzItemBody(it, i, st) {
  const a = st.ans[i];
  switch (it.t) {
    case 'mc': return `<div class=rdr-opts role=group>${it.opts.map((o, k) => qzOpt(i, o, a === o, 'mc', k)).join('')}</div>`;
    case 'multi': return `<div class=rdr-opts role=group aria-label="Marque todas as certas">${it.opts.map(o => qzOpt(i, o, a.includes(o), 'multi')).join('')}</div><p class=tn>Marque <b>todas</b> as respostas certas.</p>`;
    case 'order': return `<div class=qz-ord role=group aria-label="Toque na ordem certa">${it.steps.map(s => { const p = a.indexOf(s); return `<button type=button class="rdr-o qz-o${p >= 0 ? ' sel' : ''}" data-i=${i} data-v="${esc(s)}" onclick="qzTap(${i},this)"><i class=rdr-k>${p >= 0 ? p + 1 : ''}</i><span>${esc(s)}</span></button>`; }).join('')}</div><p class=tn>Toque nos itens na ordem certa. Tocou errado? Toque no item de novo para tirar. <button type=button class="lnk" onclick="qzClearOne(${i})">Limpar ordem</button></p>`;
    case 'match': return `<div class=qz-mt>${it.left.map((x, k) => `<label class=qz-mr><span>${esc(x)}</span><select onchange="qzSel(${i},${k},this.value)" aria-label="${esc(x)}"><option value="">Escolha…</option>${it.right.map(o => `<option value="${esc(o)}"${a[k] === o ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select></label>`).join('')}</div>`;
    case 'num': return `<div class=qz-num><input class=in inputmode=decimal autocomplete=off autocapitalize=off spellcheck=false placeholder="Digite o número" value="${esc(a)}" oninput="qzTxt(${i},this.value)" aria-label="Resposta numérica">${it.unit ? `<span class=qz-u>${esc(it.unit)}</span>` : ''}</div>`;
    case 'write': return `<textarea class=in rows=4 spellcheck=true placeholder="Escreva com as suas palavras…" oninput="qzTxt(${i},this.value)" aria-label="Sua resposta escrita">${esc(a)}</textarea><p class=tn>Escreva uma ou duas frases. O corretor procura as ideias principais, não as palavras exatas.</p>`;
    case 'build': return qzBuildHtml(it, i, st);
  }
  return '';
}
function qzBox(l) {
  const st = S.qz = qzState(l);
  return `<div id=qzbox class=qzb>${st.items.map((it, i) => `<section class=qzi id=qzi${i} data-i=${i}><div class=qzh><i class=qzn>${i + 1}</i><div class=qzq>${esc(it.q)}</div></div>${matHtml(it)}<div class=qzbody id=qzb${i}>${qzItemBody(it, i, st)}</div><div class=qzres id=qzr${i}></div></section>`).join('')}</div>`;
}
const qzInit = () => { };
const qzRedraw = i => { const st = S.qz, b = $('#qzb' + i); if (b) b.innerHTML = qzItemBody(st.items[i], i, st); };
function qzTap(i, el) {
  const st = S.qz; if (!st || st.lock[i] || S.busy) return; const it = st.items[i], v = el.dataset.v;
  if (it.t == 'mc') st.ans[i] = v;
  else if (it.t == 'multi') { const a = st.ans[i], k = a.indexOf(v); k >= 0 ? a.splice(k, 1) : a.push(v); }
  else if (it.t == 'order') { const a = st.ans[i], k = a.indexOf(v); k >= 0 ? a.splice(k, 1) : a.push(v); }
  qzRedraw(i); qzClearMark(i);
}
function qzClearOne(i) { const st = S.qz; if (!st || st.lock[i]) return; st.ans[i] = []; qzRedraw(i); qzClearMark(i); }
function qzSel(i, k, v) { const st = S.qz; if (!st || st.lock[i]) return; st.ans[i][k] = v; qzClearMark(i); }
function qzTxt(i, v) { const st = S.qz; if (!st || st.lock[i]) return; st.ans[i] = v; qzClearMark(i); }
function qzClearMark(i) { const c = $('#qzi' + i); if (c && c.classList.contains('bad')) { c.classList.remove('bad'); const r = $('#qzr' + i); if (r) r.innerHTML = ''; } }
const qzEmptyAns = (it, a) => it.t == 'build' ? !(a && a.v) : Array.isArray(a) ? !a.some(x => String(x || '').trim()) : !String(a || '').trim();
const qzEmpty = () => { const st = S.qz; return !st || st.items.every((it, i) => qzEmptyAns(it, st.ans[i])); };
const qzCode = () => JSON.stringify(S.qz.ans);
function qzClear() { const st = S.qz; if (!st) return; const f = qzState(st.l); st.ans = f.ans; st.lock = {}; st.items.forEach((_, i) => { qzRedraw(i); const c = $('#qzi' + i); if (c) c.classList.remove('bad', 'ok'); const r = $('#qzr' + i); if (r) r.innerHTML = ''; }); }
// resposta do servidor: marca cada pergunta (certa trava; errada mostra o porquê) — nas provas só vem a contagem
function qzMark(s) {
  const st = S.qz, q = s.quiz; if (!st || !q || !q.items) return;
  q.items.forEach((r, i) => {
    const c = $('#qzi' + i), res = $('#qzr' + i); if (!c || !res) return; c.classList.toggle('ok', !!r.ok); c.classList.toggle('bad', !r.ok);
    if (r.ok) { st.lock[i] = 1; res.innerHTML = `<div class="qzv ok">${ic('check', 16)}<b>Certo!</b>${r.model ? `<p><b>Um exemplo de como dizer:</b> ${esc(r.model)}</p>` : ''}</div>`; qzRedraw(i); const b = $('#qzb' + i); if (b) b.querySelectorAll('button,select,input,textarea').forEach(x => { x.disabled = true; }); }
    else {
      const miss = r.short ? 'Escreva um pouco mais: uma frase completa.' : r.copy ? 'Escreva com as suas palavras, não copie o código.' : r.miss && r.miss.length ? `Falta falar de: <b>${r.miss.map(esc).join('</b>; <b>')}</b>.` : '';
      res.innerHTML = `<div class="qzv bad">${ic('x', 16)}<b>Ainda não.</b>${miss ? `<p>${miss}</p>` : ''}${r.why ? `<div class=qzw>${whyHtml(r.why)}</div>` : ''}${r.hint ? `<p class=tn>Dica: ${esc(r.hint)}</p>` : ''}</div>`;
    }
  });
}
function qzDiag(l, s) {
  const q = s.quiz || {}, n = q.n || (S.qz ? S.qz.items.length : 0), r = q.right ?? 0;
  if (q.items) { qzMark(s); const first = q.items.findIndex(x => !x.ok); if (first >= 0) { const c = $('#qzi' + first); if (c) setTimeout(() => c.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60); } return fixit(0, '', [`Você acertou <b>${r} de ${n}</b>. As perguntas em vermelho têm a explicação; corrija e toque em <b>Concluído</b> de novo.`]); }
  return fixit(0, '', [`Você acertou <b>${r} de ${n}</b> perguntas. Nas provas não mostramos quais erraram: revise o conteúdo e confira com calma.`]);
}
function qzStatic() { const st = S.qz; return st ? `<b>${st.items.length} de ${st.items.length}</b> perguntas certas.` : ''; }

// ---------- montar um visual (build) ----------
function qzBuildHtml(it, i, st) {
  const a = st.ans[i], v = a.v, slots = QZ_SLOTS[v] || [], ms = Object.keys(it.measures || {});
  const sel = (k, opts, ph) => `<label class=qz-bs><span>${QZ_LBL(v, k)}</span><select onchange="qzBuildSet(${i},'${k}',this.value)" aria-label="${QZ_LBL(v, k)}"><option value="">${ph || 'Escolha…'}</option>${opts.map(o => `<option value="${esc(o)}"${a[k] === o ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select></label>`;
  const pick = `<div class=qz-vis role=group aria-label="Tipo de visual">${it.visuals.map(x => `<button type=button class="qz-v${v == x ? ' sel' : ''}" onclick="qzBuildSet(${i},'v','${x}')" aria-pressed=${v == x}>${QZ_VIS[x] || x}</button>`).join('')}</div>`;
  const wells = !v ? '<p class=tn>Escolha o tipo de visual.</p>' : slots.map(k => k == 'values' ? sel(k, ms) : k == 'fields' ? `<div class=qz-bs><span>${QZ_LBL(v, k)}</span><div class=qz-fl>${[...it.fields, ...ms].map(f => `<button type=button class="qz-f${(a.fields || []).includes(f) ? ' sel' : ''}" onclick="qzBuildSet(${i},'fields','${esc(f).replace(/'/g, "\\'")}')">${esc(f)}</button>`).join('')}</div></div>` : sel(k, it.fields, k == 'legend' || k == 'cols' ? '(nenhuma)' : 'Escolha…')).join('');
  return `${pick}<div class=qz-wells>${wells}</div><div class=qz-pv id=qzpv${i}>${qzBuildPreview(it, a)}</div>`;
}
function qzBuildSet(i, k, val) {
  const st = S.qz; if (!st || st.lock[i]) return; const a = st.ans[i];
  if (k == 'v') { if (a.v != val) st.ans[i] = { v: val }; }
  else if (k == 'fields') { const f = a.fields || (a.fields = []), p = f.indexOf(val); p >= 0 ? f.splice(p, 1) : f.push(val); }
  else a[k] = val;
  qzRedraw(i); qzClearMark(i);
}
// prévia do visual com o motor de DAX (os mesmos números que o Power BI mostraria com esses campos)
function qzBuildPreview(it, a) {
  try {
    const v = a.v; if (!v) return '';
    const M0 = qzBuildModel(it); if (!M0) return '';
    const defs = Object.entries(it.measures || {}).map(([n, f]) => [n, DAX.parse(f).defs[0].ast]), M = M0.with(defs), run = (by, names) => DAX.runVisual(M, { by }, names.map(n => ({ name: n, ast: defs.find(d => d[0] == n)[1], local: false })));
    const lbl = x => String(x).replace(/^.*\[|\]$/g, '');
    if (v == 'slicer') return a.axis ? `<div class=qz-sl><small>${esc(lbl(a.axis))}</small>${qzDistinct(M, a.axis).map(x => `<span>${esc(DAX.show(x))}</span>`).join('')}</div>` : '';
    if (v == 'table') { const f = (a.fields || []), cols = f.filter(x => it.fields.includes(x)), meas = f.filter(x => !it.fields.includes(x)); if (!f.length) return ''; if (!cols.length) { const r = run([], meas); return CH.table({ cols: meas, rows: [r.total.map(x => x)] }); } const r = run(cols, meas); return CH.table({ cols: [...cols.map(lbl), ...meas], rows: r.rows.slice(0, 12).map(x => [...x.g.map(g => DAX.show(g)), ...x.v]), fmt: undefined }); }
    if (v == 'card') { if (!a.values) return ''; const r = run([], [a.values]); return CH.chart({ type: 'card', label: a.values, value: r.total[0], fmt: fmtGuess(a.values) }); }
    if (v == 'matrix') { if (!a.rows || !a.values) return ''; const by = [a.rows, ...(a.cols ? [a.cols] : [])], r = run(by, [a.values]); if (!a.cols) return CH.table({ cols: [lbl(a.rows), a.values], rows: r.rows.map(x => [DAX.show(x.g[0]), x.v[0]]).concat([['Total', r.total[0]]]) }); const cs = [...new Set(r.rows.map(x => x.g[1]))], rs = [...new Set(r.rows.map(x => x.g[0]))]; return CH.table({ cols: [lbl(a.rows) + ' \\ ' + lbl(a.cols), ...cs.map(c => DAX.show(c))], rows: rs.map(rv => [DAX.show(rv), ...cs.map(c => { const f = r.rows.find(x => x.g[0] === rv && x.g[1] === c); return f ? f.v[0] : null; })]) }); }
    if (!a.axis || !a.values) return '';
    const by = a.legend ? [a.axis, a.legend] : [a.axis], r = run(by, [a.values]);
    if (v == 'pie' || v == 'donut') return CH.chart({ type: v, cats: r.rows.map(x => DAX.show(x.g[0])), series: [{ values: r.rows.map(x => x.v[0]) }] });
    const cats = [...new Set(r.rows.map(x => x.g[0]))], lg = a.legend ? [...new Set(r.rows.map(x => x.g[1]))] : [a.values];
    return CH.chart({ type: v, cats: cats.map(c => DAX.show(c)), series: lg.map(g => ({ name: DAX.show(g), values: cats.map(c => { const f = r.rows.find(x => x.g[0] === c && (!a.legend || x.g[1] === g)); return f ? f.v[0] : null; }) })), fmt: fmtGuess(a.values) });
  } catch (e) { return ''; }
}
const fmtGuess = n => /R\$|valor|receita|venda|total|lucro|custo|ticket|faturamento/i.test(n) && !/qtd|quantidade|clientes|n[ºo]|contagem/i.test(n) ? 'moeda' : undefined;
function qzDistinct(M, ref) { const v = DAX.evalExpr(M, 'VALUES(' + ref + ')'); return v.rows.map(r => r[0]).sort((x, y) => typeof x == 'number' && typeof y == 'number' ? x - y : String(x).localeCompare(String(y), 'pt-BR')); }
