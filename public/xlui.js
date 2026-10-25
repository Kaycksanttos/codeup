// Planilha de EXCEL da prática: grade com células, barra de fórmulas, símbolos rápidos, "Preencher" para baixo/direita e toque nas células para apontar.
// O navegador calcula as fórmulas com o motor xl.js só para MOSTRAR o resultado na célula; quem corrige é o servidor (xlcheck.js), que nunca
// envia a resposta oficial antes da hora. O que vai para a correção é um JSON com o que o aluno digitou nas células pedidas: {"D2":"=B2*C2", ...}.
// Funções globais (usadas pelo app.js e pelos botões da tela): xlBox, xlInit, xlCode, xlEmpty, xlCommit, xlStatic, xlPreview, xlDiag, xlMark, xlClear, xlTap, xlIns, xlFill, xlToggleF.

const XQ = ['=', '(', ')', ';', ':', '$', '"', '+', '-', '*', '/', '^', '%', '&', '<', '>', ',', '<>'];   // teclas que faltam no teclado do celular
const XDEF_W = 56, XRH_W = 28;

function xlRaw(x) {                                              // planilha inteira: o que já vem pronto + o que o aluno digitou
  const raw = {};
  (x.l.sheet.rows || []).forEach((row, i) => row.forEach((v, j) => { if (v !== null && v !== undefined && v !== '') raw[XL.addr(j + 1, i + 1)] = v; }));
  for (const a of x.l.targets) { const t = x.edits[a]; if (t && String(t).trim()) raw[a] = XL.parseInput(t).raw; }
  return raw;
}
function xlDims(x) {
  const rows = x.l.sheet.rows || []; let R = rows.length, C = 0; rows.forEach(r => { C = Math.max(C, r.length); });
  x.l.targets.forEach(a => { const p = XL.parseAddr(a); R = Math.max(R, p.r); C = Math.max(C, p.c); });
  return { R: Math.max(R, 1), C: Math.max(C, 1) };
}
const xlFmtOf = (x, a) => { const p = XL.parseAddr(a), s = x.l.sheet; return (s.cfmt || {})[a] || (s.fmt || {})[XL.colL(p.c)] || x.afmt[a] || null; };
// largura das colunas: a da atividade ou, na falta dela, a que cabe o texto que já está na planilha
function xlWidths(l) {
  const w = {}, rows = l.sheet.rows || [], fmt = l.sheet.fmt || {}, given = l.sheet.widths || {}; let C = 0; rows.forEach(r => { C = Math.max(C, r.length); }); l.targets.forEach(a => { C = Math.max(C, XL.parseAddr(a).c); });
  for (let c = 1; c <= C; c++) {
    const L = XL.colL(c); if (given[L]) { w[L] = given[L]; continue; }
    let n = 0; rows.forEach(r => { const v = r[c - 1]; if (typeof v === 'string' && v[0] !== '=') n = Math.max(n, v.length); });
    const f = fmt[L]; w[L] = Math.max(XDEF_W, f === 'moeda' ? 84 : f === 'data' ? 90 : f === 'mesano' ? 76 : f === 'num2' ? 74 : 0, Math.min(230, Math.round(n * 8 + 18)));
  }
  return w;
}

function xlCellHtml(x, a, sh, interactive) {
  const v = sh.value(a), tg = x.l.targets.includes(a), fm = xlFmtOf(x, a), p = XL.parseAddr(a), raw = sh.raw[a], isF = typeof raw === 'string' && raw[0] === '=';
  let t = XL.show(v, fm), cls = ['xc'];
  if (x.showF && isF) { t = raw; cls.push('xtx', 'xfm'); }
  else if (XL.isErr(v)) cls.push('xe'); else if (typeof v === 'number') cls.push('xn'); else if (typeof v === 'boolean') cls.push('xb'); else if (v !== null) cls.push('xtx');
  if (tg) cls.push('xtg'); if (!tg && isF) cls.push('xlf');
  if (p.r === 1 && x.hdr) cls.push('xhd');
  if (interactive && x.sel === a) cls.push('xsel');
  const r = x.res && x.res[a]; if (r) cls.push(r.ok ? 'xvok' : 'xvno');
  if (interactive && x.sel === a && x.editing && tg) { t = x.draft; cls.push('xed'); }
  return `<td class="${cls.join(' ')}" data-a="${a}" role=gridcell${interactive && x.sel === a ? ' aria-selected=true' : ''}>${esc(t)}${r ? `<i class=xmk>${ic(r.ok ? 'check' : 'x', 12)}</i>` : ''}</td>`;
}
function xlGridHtml(x, interactive) {
  const { R, C } = xlDims(x), sh = x.sh = new XL.Sheet(xlRaw(x)), W = x.w, total = XRH_W + Array.from({ length: C }, (_, i) => W[XL.colL(i + 1)] || XDEF_W).reduce((s, n) => s + n, 0);
  let h = `<table class=xt style="width:${total}px"><colgroup><col style="width:${XRH_W}px">${Array.from({ length: C }, (_, i) => `<col style="width:${W[XL.colL(i + 1)] || XDEF_W}px">`).join('')}</colgroup><thead><tr><th class=xcorner></th>${Array.from({ length: C }, (_, i) => `<th class="xh${x.sel && interactive && XL.parseAddr(x.sel).c == i + 1 ? ' xon' : ''}">${XL.colL(i + 1)}</th>`).join('')}</tr></thead><tbody>`;
  for (let r = 1; r <= R; r++) {
    h += `<tr><th class="xr${x.sel && interactive && XL.parseAddr(x.sel).r == r ? ' xon' : ''}">${r}</th>`;
    for (let c = 1; c <= C; c++) h += xlCellHtml(x, XL.addr(c, r), sh, interactive);
    h += '</tr>';
  }
  return h + '</tbody></table>';
}

// ---------------------------------------------------------------- estado
function xlState(l, edits) {
  const rows = l.sheet.rows || [], r1 = rows[0] || [];
  return { l, edits: { ...(edits || {}) }, afmt: {}, sel: l.targets[0] || 'A1', draft: '', editing: false, res: null, showF: false, last: null, w: xlWidths(l), hdr: r1.length > 0 && r1.every(v => v === null || typeof v === 'string') };
}
function xlInit(l) {
  S.xlKeep = S.xlKeep || {};
  const x = S.xl = xlState(l, S.xlKeep[l.id]);
  for (const a of l.targets) { const t = x.edits[a]; if (t) { const p = XL.parseInput(t); if (p.fmt && !xlFmtOf(x, a)) x.afmt[a] = p.fmt; } }
  x.draft = x.edits[x.sel] || '';
  xlPaint(); xlWire();
  return x;
}
const xlKeep = () => { const x = S.xl; if (x) { S.xlKeep = S.xlKeep || {}; S.xlKeep[x.l.id] = { ...x.edits }; } };
const xlEmpty = () => { const x = S.xl; return !x || x.l.targets.every(a => !String(x.edits[a] || '').trim()); };
const xlCode = () => { const x = S.xl, o = {}; for (const a of x.l.targets) o[a] = String(x.edits[a] || ''); return JSON.stringify(o); };

// ---------------------------------------------------------------- tela
function xlBox(l) {
  return `<div class=xs id=xs><div class=xfb><span class=xnm id=xnm>A1</span><span class=xfxl>fx</span><input id=xin type=text enterkeyhint=done autocapitalize=off autocomplete=off autocorrect=off spellcheck=false aria-label="Barra de fórmulas">
    <button class="xbtn xok" onclick="xlEnter()" aria-label="Confirmar">${ic('check', 18)}</button><button class="xbtn xno" onclick="xlCancel()" aria-label="Cancelar">${ic('x', 18)}</button></div>
    <div class=xsym id=xsym role=toolbar aria-label="Símbolos">${XQ.map(k => `<button type=button class=xk onpointerdown="event.preventDefault()" onclick="xlIns('${k.replace(/"/g, '&quot;')}')">${esc(k)}</button>`).join('')}</div>
    <div class=xtl><button type=button class="xk wide" id=xfd onpointerdown="event.preventDefault()" onclick="xlFill('d')">Preencher ↓</button><button type=button class="xk wide" id=xfr onpointerdown="event.preventDefault()" onclick="xlFill('r')">Preencher →</button><span id=xhelp class=xhelp></span></div>
    <div class=xmsg id=xmsg hidden></div><div class=xg id=xg role=grid aria-label="Planilha"></div></div>`;
}
function xlPaint() {
  const x = S.xl, g = $('#xg'); if (!g) return;
  const sc = [g.scrollLeft, g.scrollTop]; g.innerHTML = xlGridHtml(x, true); g.scrollLeft = sc[0]; g.scrollTop = sc[1];
  const tg = x.l.targets.includes(x.sel), ip = $('#xin'), p = XL.parseAddr(x.sel);
  $('#xnm').textContent = x.sel; ip.readOnly = !tg; ip.classList.toggle('lk', !tg);
  if (document.activeElement !== ip || !x.editing) ip.value = tg ? x.draft : xlShowRaw(x, x.sel);
  ip.placeholder = tg ? 'Digite aqui (fórmulas começam com =)' : 'Célula travada: você só olha';
  const dn = XL.addr(p.c, p.r + 1), rt = XL.addr(p.c + 1, p.r), has = tg && String(x.edits[x.sel] || '').trim();
  $('#xfd').disabled = !(has && x.l.targets.includes(dn)); $('#xfr').disabled = !(has && x.l.targets.includes(rt));
  $('#xhelp').textContent = tg ? '' : 'travada';
  document.querySelectorAll('#xsym .xk').forEach(b => { b.disabled = !tg; });
  const ref = tg && xlRefCtx(ip.value.slice(0, ip.selectionStart ?? ip.value.length)); $('#xs').classList.toggle('xpt', !!ref);
}
const xlShowRaw = (x, a) => { const r = x.sh && x.sh.raw[a]; if (typeof r === 'string') return r; const v = x.sh ? x.sh.value(a) : null; return v === null ? '' : XL.show(v, xlFmtOf(x, a)); };
function xlMsg(html, kind) { const m = $('#xmsg'); if (!m) return; if (!html) { m.hidden = true; m.innerHTML = ''; return; } m.hidden = false; m.className = 'xmsg ' + (kind || ''); m.innerHTML = html; }
function xlWire() {
  const x = S.xl, ip = $('#xin'), g = $('#xg');
  ip.addEventListener('input', () => { x.draft = ip.value; x.editing = true; x.last = null; xlLive(); });
  ip.addEventListener('keyup', () => xlRefHint()); ip.addEventListener('click', () => { x.last = null; xlRefHint(); });
  ip.addEventListener('focus', () => { if (x.l.targets.includes(x.sel)) { x.editing = true; xlRefHint(); } });
  ip.addEventListener('keydown', e => {
    if (e.key == 'Enter') { e.preventDefault(); if ((e.ctrlKey || e.metaKey)) return concluir(); xlEnter(); }
    else if (e.key == 'Escape') { e.preventDefault(); xlCancel(); }
    else if (e.key == 'Tab') { e.preventDefault(); xlEnter('r'); }
  });
  g.addEventListener('pointerdown', e => { const td = e.target.closest('td.xc'); if (td && document.activeElement === ip && xlRefOk()) e.preventDefault(); });   // em modo "apontar" o campo não perde o foco (o teclado do celular fica aberto)
  g.addEventListener('click', e => { const td = e.target.closest('td.xc'); if (td) xlTap(td.dataset.a); });
  xlSelect(x.sel, false);
}
// ao digitar, só a célula selecionada é atualizada (mostra o texto que está sendo digitado)
function xlLive() { const x = S.xl, td = $(`#xg td[data-a="${x.sel}"]`); if (td) { td.className = td.className.replace(/\b(xn|xtx|xb|xe|xvok|xvno|xed)\b/g, '').trim() + ' xed xtx'; td.textContent = x.draft; } xlRefHint(); }
// o campo está num ponto em que dá para apontar uma célula? (depois de =, (, ;, operador ou ":")
function xlRefCtx(before) {
  if (before[0] !== '=') return false; if ((before.match(/"/g) || []).length % 2) return false;
  return /(^=|[(;+\-*\/^&<>=:,])$/.test(before);
}
const xlRefOk = () => { const ip = $('#xin'); return !!ip && !ip.readOnly && (xlRefCtx(ip.value.slice(0, ip.selectionStart ?? ip.value.length)) || (S.xl.last && (ip.selectionStart ?? -1) === S.xl.last.e)); };
function xlRefHint() { const ok = xlRefOk(), s = $('#xs'); if (s) s.classList.toggle('xpt', ok); const h = $('#xhelp'); if (h && S.xl.l.targets.includes(S.xl.sel)) h.textContent = ok ? 'Toque numa célula para apontar' : ''; }

function xlSelect(a, focus) {
  const x = S.xl; x.sel = a; x.editing = false; x.last = null; x.draft = x.edits[a] || ''; xlPaint();
  const tg = x.l.targets.includes(a), ip = $('#xin');
  if (tg && focus) { ip.focus({ preventScroll: true }); const n = ip.value.length; try { ip.setSelectionRange(n, n); } catch { } x.editing = true; xlRefHint(); }
  else if (!tg) { ip.blur(); xlMsg(''); }
  if (focus) { const td = $(`#xg td[data-a="${a}"]`), g = $('#xg'); if (td && g) { const l = td.offsetLeft, r = l + td.offsetWidth; if (l < g.scrollLeft + XRH_W) g.scrollLeft = Math.max(0, l - XRH_W); else if (r > g.scrollLeft + g.clientWidth) g.scrollLeft = r - g.clientWidth + 6; } }
}
// guarda o que está na barra de fórmulas na célula selecionada (false = a fórmula tem erro de escrita, a edição continua)
function xlCommit() {
  const x = S.xl, a = x.sel; if (!x.l.targets.includes(a)) return true;
  const t = String(x.draft || '').replace(/\s+$/, '');
  if (t[0] == '=' && t.length > 1) { const c = XL.check(t); if (!c.ok) { xlMsg(`${ic('info', 15)} <span>Esta fórmula tem um problema: <b>${esc(c.msg || 'confira parênteses, aspas e ponto e vírgula')}</b>. Corrija e confirme de novo.</span>`, 'err'); return false; } }
  if (t === (x.edits[a] || '')) { x.editing = false; return true; }
  if (t) x.edits[a] = t; else delete x.edits[a];
  if (x.res && x.res[a]) { delete x.res[a]; }
  const p = XL.parseInput(t); if (p.fmt && !xlFmtOf(x, a)) x.afmt[a] = p.fmt;
  x.editing = false; xlKeep();
  const hs = t[0] == '=' ? XL.hint(t) : []; xlMsg(hs.length ? `${ic('info', 15)} <span>${hs.join(' ')}</span>` : '', 'warn');
  return true;
}
function xlEnter(dir) {   // ✓ / Enter: confirma e desce (Tab: vai para a direita)
  const x = S.xl; if (!x.l.targets.includes(x.sel)) return; if (!xlCommit()) return;
  const p = XL.parseAddr(x.sel), nx = dir == 'r' ? XL.addr(p.c + 1, p.r) : XL.addr(p.c, p.r + 1);
  if (x.l.targets.includes(nx)) xlSelect(nx, true); else { x.draft = x.edits[x.sel] || ''; xlPaint(); $('#xin').blur(); }
}
function xlCancel() { const x = S.xl; x.draft = x.edits[x.sel] || ''; x.editing = false; x.last = null; xlMsg(''); xlPaint(); $('#xin').blur(); }
function xlTap(a) {
  const x = S.xl, ip = $('#xin'), tg = x.l.targets.includes(x.sel);
  if (tg && document.activeElement === ip && !ip.readOnly) {
    const caret = ip.selectionStart ?? ip.value.length, before = ip.value.slice(0, caret);
    if (x.last && caret === x.last.e && ip.value[0] == '=') {                       // segundo toque logo depois de um toque: vira intervalo (D2:D6)
      const rng = x.last.first == a ? a : `${x.last.first}:${a}`; ip.setRangeText(rng, x.last.s, x.last.e, 'end'); x.last.e = x.last.s + rng.length;
      x.draft = ip.value; x.editing = true; xlLive(); xlPaintSel(); return;
    }
    if (xlRefCtx(before)) { ip.setRangeText(a, caret, ip.selectionEnd ?? caret, 'end'); x.last = { s: caret, e: caret + a.length, first: a }; x.draft = ip.value; x.editing = true; xlLive(); xlPaintSel(); return; }
  }
  if (a == x.sel) { if (tg) xlPaintSel(); return; }
  if (!xlCommit()) return;
  xlSelect(a, true);
}
function xlPaintSel() { const ip = $('#xin'); try { ip.focus({ preventScroll: true }); } catch { } xlRefHint(); }
function xlIns(s) {
  const x = S.xl, ip = $('#xin'); if (!ip || ip.readOnly) return;
  ip.focus({ preventScroll: true }); const a = ip.selectionStart ?? ip.value.length, b = ip.selectionEnd ?? a; ip.setRangeText(s, a, b, 'end');
  x.draft = ip.value; x.editing = true; x.last = null; xlLive();
}
// Preencher para baixo/direita: copia a fórmula da célula (ajustando as referências, como a alça do Excel) até onde houver células para preencher
function xlFill(dir) {
  const x = S.xl; if (!xlCommit()) return; const src = String(x.edits[x.sel] || '').trim();
  if (!src) return toast('Escreva a fórmula nesta célula primeiro.', true);
  const p = XL.parseAddr(x.sel); let n = 0;
  for (let k = 1; k < 200; k++) { const a = dir == 'd' ? XL.addr(p.c, p.r + k) : XL.addr(p.c + k, p.r); if (!x.l.targets.includes(a)) break; x.edits[a] = XL.shift(src, dir == 'd' ? k : 0, dir == 'r' ? k : 0); if (x.res) delete x.res[a]; const pi = XL.parseInput(x.edits[a]); if (pi.fmt && !xlFmtOf(x, a)) x.afmt[a] = pi.fmt; n++; }
  if (!n) return toast(dir == 'd' ? 'Não há células para preencher logo abaixo.' : 'Não há células para preencher logo ao lado.', true);
  xlKeep(); x.draft = x.edits[x.sel]; xlPaint(); $('#xin').value = x.draft; toast(`Fórmula copiada para ${n} ${n == 1 ? 'célula' : 'células'}.`);
}
function xlToggleF() { const x = S.xl; if (!xlCommit()) return; x.showF = !x.showF; xlPaint(); const b = $('#bfx'); if (b) b.classList.toggle('on', x.showF); }
function xlClear() { const x = S.xl; x.edits = {}; x.afmt = {}; x.res = null; x.draft = ''; x.last = null; xlKeep(); xlMsg(''); const t = x.l.targets[0]; if (t) xlSelect(t, false); else xlPaint(); }

// ---------------------------------------------------------------- planilha só para ver (lição concluída e prévia na teoria)
function xlStatic() { const x = S.xl; if (!x) return ''; const y = { ...x, sel: null, res: null, showF: false }; return `<div class="xs xro"><div class=xg>${xlGridHtml(y, false)}</div></div>`; }
function xlPreview(l) { const x = xlState(l, {}); x.showF = false; return `<div class="xs xro"><div class=xg>${xlGridHtml(x, false)}</div></div>`; }

// ---------------------------------------------------------------- correção: marcas nas células e explicação do que ajustar
function xlMark(s) { const x = S.xl; if (!x) return; x.res = {}; (s.xl && s.xl.cells || []).forEach(c => { x.res[c.a] = c; }); xlPaint(); }
function xlDiag(l, s) {
  const cells = (s.xl && s.xl.cells) || [], bad = cells.filter(c => !c.ok), tips = [];
  if (s.missing) tips.push(`Falta usar <b>${esc(s.missing)}</b> na sua resposta.`);
  if (cells.length > 1) tips.push(`<b>${cells.length - bad.length} de ${cells.length}</b> células estão certas.${bad.length ? ' As com ✗ vermelho precisam de ajuste.' : ''}`);
  for (const c of bad.slice(0, 6)) {
    const a = `<b>${c.a}</b>`;
    if (c.why == 'vazio') tips.push(`${a} está vazia. Escreva uma fórmula nessa célula verde.`);
    else if (c.why == 'faltou') { if (!s.missing) tips.push(`${a}: confira se usou as funções que a atividade pede.`); }
    else if (c.why == 'sintaxe') tips.push(`${a}: a fórmula tem um erro de escrita${c.msg ? ` (${esc(c.msg)})` : ''}. Confira parênteses, aspas e <b>;</b> entre os argumentos.`);
    else if (c.why == 'valor') tips.push(`${a}: seu resultado é <code>${esc(c.got)}</code>, mas o esperado é <code>${esc(c.want)}</code>. Confira as células, a conta e a função usadas.`);
    else if (c.why == 'fixo') tips.push(`${a}: você digitou um valor pronto. Escreva uma <b>fórmula</b> (começando com =) para o Excel calcular sozinho.`);
    else if (c.why == 'alt') tips.push(`${a}: o resultado está certo hoje, mas a fórmula <b>não acompanha os dados</b>: se os números da planilha mudarem, ela erra. Use as células em vez de digitar números, e confira as referências fixas ($).`);
  }
  if (bad.length > 6) tips.push(`…e mais ${bad.length - 6} ${bad.length - 6 == 1 ? 'célula' : 'células'} para revisar.`);
  return fixit(0, '', tips);
}
