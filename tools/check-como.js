#!/usr/bin/env node
// Confere o "Como funciona" de cada lição (content/como-*.js): todo pedaço existe no exemplo, na ordem e sem se repetir, e as explicações são curtas.
const lessons = require('../lessons'), match = require('../content/comoMatch'), fmt = require('../public/fmt.js');
const COMO = require('../content/como');
let bad = 0, n = 0;
const fail = (id, m) => { console.error(`✗ ${id}: ${m}`); bad++; };
const ex = lessons.filter(l => l.example && (l.type === 'sql' || l.type === 'python' || l.type === 'excel' || l.type === 'dax'));
for (const l of ex) {
  const a = COMO[l.id];
  if (!a || !a.length) { fail(l.id, 'sem "Como funciona" em content/como-*.js'); continue; }
  const code = l.type === 'sql' ? fmt.fmtSql(l.example) : l.example;
  try { match(code, a); n++; } catch (e) { fail(l.id, e.message); }
  for (const [t, d] of a) { if (!d || d.length > 190) fail(l.id, `explicação de "${t}" vazia ou longa demais (${(d || '').length})`); if (/`/.test(d)) fail(l.id, 'explicação com crase'); }
  if (a.length < 2 && l.example.split(/\s+/).length > 4) fail(l.id, 'só 1 pedaço: explique pelo menos 2');
}
for (const id of Object.keys(COMO)) if (!ex.some(l => l.id === id)) fail(id, 'não existe lição com exemplo com esse id');
console.log(`Como funciona: ${n} de ${ex.length} lições conferidas`);
if (bad) { console.error(`${bad} problema(s)`); process.exit(1); }
