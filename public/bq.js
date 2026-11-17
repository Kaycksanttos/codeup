// SQL NO ESTILO BIGQUERY (GoogleSQL) em cima do sql.js (SQLite).
// O aluno escreve BigQuery; este arquivo traduz para o SQLite antes de rodar e registra as funções do BigQuery que o SQLite não tem.
// Roda igual no navegador (global BQ) e no servidor (require), então a conferência do servidor vê exatamente o que o aluno viu.
//
//   BQ.install(SQL)      deixa SQL.Database.exec() falar BigQuery (db.run() continua cru: é só para os dados de treino, que são SQLite)
//   BQ.translate(sql)    BigQuery -> SQLite (texto)
//   BQ.setup(db)         registra as funções (FORMAT_DATE, DATE_DIFF, SAFE_DIVIDE...) e deixa o LIKE com maiúsculas/minúsculas como no BigQuery
//
// O que vale (resumo): `projeto.dataset.tabela` (com ou sem crase), tipos INT64/FLOAT64/STRING/BOOL/DATE, CAST e SAFE_CAST, COUNTIF, IF, SAFE_DIVIDE,
// STRING_AGG, funções de data (CURRENT_DATE, DATE_ADD, DATE_SUB, DATE_DIFF, DATE_TRUNC, EXTRACT, FORMAT_DATE, PARSE_DATE, LAST_DAY), de texto
// (CONCAT, STARTS_WITH, REGEXP_CONTAINS, LPAD, INITCAP...), de número (CEIL, FLOOR, POW, MOD, DIV...), `/` sempre com casas decimais, UNION ALL/DISTINCT,
// EXCEPT DISTINCT, SELECT * EXCEPT(...) / REPLACE(...), QUALIFY, vírgula sobrando antes do FROM, strings com \n e "aspas duplas", comentários com #,
// CREATE OR REPLACE TABLE, TRUNCATE TABLE e a regra de que UPDATE e DELETE precisam de WHERE.
// Ainda não: ARRAY, STRUCT, UNNEST, MERGE, variáveis (DECLARE/SET) e tipos de hora além de texto 'AAAA-MM-DD [HH:MM:SS]'.
(function (root, factory) { if (typeof module == 'object' && module.exports) module.exports = factory(); else root.BQ = factory(); })(typeof self != 'undefined' ? self : this, function () {
  'use strict';
  class BQError extends Error { }

  // ---------------------------------------------------------------- separar o texto em pedaços (tokens)
  const where = (s, p) => { const a = s.slice(0, p).split('\n'); return `[${a.length}:${a[a.length - 1].length + 1}]`; };
  function lex(s) {
    const out = [], n = s.length; let i = 0;
    const push = (k, v, p, x) => out.push(Object.assign({ k, v, p }, x));
    while (i < n) {
      const c = s[i], d = s[i + 1];
      if (/\s/.test(c)) { let j = i; while (j < n && /\s/.test(s[j])) j++; push('ws', s.slice(i, j), i); i = j; continue; }
      if ((c == '-' && d == '-') || c == '#') { let j = s.indexOf('\n', i); if (j < 0) j = n; push('cm', s.slice(i, j), i); i = j; continue; }
      if (c == '/' && d == '*') { const j = s.indexOf('*/', i + 2); if (j < 0) throw new BQError('Comentário /* ... */ sem o */ no final ' + where(s, i)); push('cm', s.slice(i, j + 2), i); i = j + 2; continue; }
      let m = /^(?:[rR][bB]?|[bB][rR]?)?(?=['"])/.exec(s.slice(i, i + 3));
      if (m && (m[0] || c == "'" || c == '"')) {
        const raw = /r/i.test(m[0]); let j = i + m[0].length; const q = s[j], tri = s.slice(j, j + 3) == q.repeat(3), ql = tri ? 3 : 1; j += ql; let v = '', ok = false;
        while (j < n) {
          if (s.slice(j, j + ql) == q.repeat(ql)) { ok = true; j += ql; break; }
          if (!tri && s[j] == '\n') break;
          if (s[j] == '\\' && !raw && j + 1 < n) {
            const e = s[j + 1]; j += 2;
            v += e == 'n' ? '\n' : e == 't' ? '\t' : e == 'r' ? '\r' : e == '0' ? '\0' : e == 'a' ? '\x07' : e == 'b' ? '\b' : e == 'f' ? '\f' : e == 'v' ? '\v' : e;
            continue;
          }
          v += s[j++];
        }
        if (!ok) throw new BQError('Texto entre aspas sem fechar ' + where(s, i));
        push('str', v, i); i = j; continue;
      }
      if (c == '`') { const j = s.indexOf('`', i + 1); if (j < 0) throw new BQError('Crase (`) sem fechar ' + where(s, i)); push('qid', s.slice(i + 1, j), i); i = j + 1; continue; }
      m = /^(?:\d+\.?\d*(?:[eE][+-]?\d+)?|\.\d+(?:[eE][+-]?\d+)?)/.exec(s.slice(i, i + 40));
      if (m) { push('num', m[0], i); i += m[0].length; continue; }
      m = /^[A-Za-z_][A-Za-z0-9_]*/.exec(s.slice(i, i + 80));
      if (m) { push('id', m[0], i); i += m[0].length; continue; }
      const two = s.slice(i, i + 2);
      if (['<=', '>=', '<>', '!=', '||', '<<', '>>'].includes(two)) { push('op', two, i); i += 2; continue; }
      push('op', c, i); i++;
    }
    return out;
  }
  const isSig = t => t.k != 'ws' && t.k != 'cm';
  const nextSig = (tk, i) => { for (let j = i + 1; j < tk.length; j++) if (isSig(tk[j])) return j; return -1; };
  const prevSig = (tk, i) => { for (let j = i - 1; j >= 0; j--) if (isSig(tk[j])) return j; return -1; };
  const isOp = (t, v) => t && t.k == 'op' && t.v == v;
  const isId = (t, v) => t && t.k == 'id' && (v === undefined || t.v.toUpperCase() == v);
  function closeOf(tk, o) { let d = 0; for (let j = o; j < tk.length; j++) { if (isOp(tk[j], '(')) d++; else if (isOp(tk[j], ')') && --d == 0) return j; } throw new BQError('Parêntese ( sem o ) correspondente'); }
  function splitTop(tk, sep) {            // separa por vírgula (ou outra) fora de parênteses
    const out = [[]]; let d = 0;
    for (const t of tk) {
      if (isOp(t, '(')) d++; else if (isOp(t, ')')) d--;
      if (d == 0 && isOp(t, sep)) out.push([]); else out[out.length - 1].push(t);
    }
    return out;
  }
  const trimWs = tk => { let a = 0, b = tk.length; while (a < b && !isSig(tk[a])) a++; while (b > a && !isSig(tk[b - 1])) b--; return tk.slice(a, b); };
  const q1 = v => "'" + String(v).replace(/'/g, "''") + "'";
  const ident = v => /^[A-Za-z_]\w*$/.test(v) ? v : '"' + String(v).replace(/"/g, '""') + '"';
  const word = t => t ? (t.k == 'id' ? t.v.toUpperCase() : t.k == 'str' ? 'texto' : t.v) : 'o fim do comando';
  const RESERVED = new Set(['SELECT', 'WITH', 'UNNEST', 'LATERAL', 'WHERE', 'GROUP', 'ORDER', 'LIMIT', 'ON', 'USING', 'SET', 'VALUES']);
  // funções que existem no SQLite mas não no BigQuery: o aluno recebe o mesmo aviso do BigQuery, com o caminho certo
  const NOT_BQ = {
    STRFTIME: 'use FORMAT_DATE(\'%Y-%m\', data) ou EXTRACT(YEAR FROM data)', JULIANDAY: 'use DATE_DIFF(data1, data2, DAY)', IIF: 'use IF(condição, então, senão)',
    GROUP_CONCAT: 'use STRING_AGG(coluna, \', \')', TYPEOF: 'o BigQuery não tem TYPEOF', PRINTF: 'use FORMAT(...)', RANDOM: 'use RAND()', GLOB: 'use LIKE ou REGEXP_CONTAINS', TOTAL: 'use SUM(...)'
  };
  const UNSUPPORTED = new Set(['ARRAY', 'STRUCT', 'UNNEST', 'ARRAY_AGG', 'ARRAY_LENGTH', 'ARRAY_TO_STRING', 'GENERATE_ARRAY', 'GENERATE_DATE_ARRAY', 'SPLIT', 'TO_JSON_STRING', 'JSON_EXTRACT', 'JSON_VALUE']);

  // caminho de tabela: `projeto.dataset.tabela`, dataset.tabela ou tabela: no banco de treino todas ficam num lugar só, então vale o último pedaço
  function tablePath(tk, i) {        // i = índice logo depois da palavra (FROM, JOIN, INTO...)
    let j = i, pre = '';
    const skip = () => { while (j < tk.length && !isSig(tk[j])) { pre += E1(tk[j]); j++; } };
    skip();
    if (isId(tk[j], 'IF')) {          // IF [NOT] EXISTS
      let p = j;
      while (p < tk.length) {
        if (isSig(tk[p])) { const u = tk[p].k == 'id' ? tk[p].v.toUpperCase() : ''; if (!['IF', 'NOT', 'EXISTS'].includes(u)) break; if (u == 'EXISTS') { p++; break; } }
        p++;
      }
      pre += tk.slice(j, p).map(E1).join(''); j = p; skip();
    }
    const t0 = tk[j];
    if (!t0 || !(t0.k == 'qid' || (t0.k == 'id' && !RESERVED.has(t0.v.toUpperCase())))) return null;
    const segs = []; let e = j;
    for (;;) {
      const t = tk[e];
      if (t && t.k == 'qid') segs.push(...t.v.split('.')); else if (t && t.k == 'id') segs.push(t.v); else break;
      if (isOp(tk[e + 1], '.') && tk[e + 2] && (tk[e + 2].k == 'id' || tk[e + 2].k == 'qid')) e += 2; else break;
    }
    return { out: pre + ident(segs[segs.length - 1]), end: e, segs };
  }
  const E1 = t => t.k == 'str' ? q1(t.v) : t.k == 'cm' && t.v[0] == '#' ? '--' + t.v.slice(1) : t.v;

  // ---------------------------------------------------------------- tipos e partes de data
  const CAST_FN = {
    INT64: '__int64', INT: '__int64', INTEGER: '__int64', BIGINT: '__int64', SMALLINT: '__int64', TINYINT: '__int64', BYTEINT: '__int64',
    FLOAT64: '__float64', FLOAT: '__float64', DOUBLE: '__float64', NUMERIC: '__float64', DECIMAL: '__float64', BIGNUMERIC: '__float64', BIGDECIMAL: '__float64',
    STRING: '__string', VARCHAR: '__string', BOOL: '__bool', BOOLEAN: '__bool', DATE: '__date', DATETIME: '__datetime', TIMESTAMP: '__datetime'
  };
  const DDL_TYPE = { INT64: 'INTEGER', INT: 'INTEGER', SMALLINT: 'INTEGER', BIGINT: 'INTEGER', TINYINT: 'INTEGER', BYTEINT: 'INTEGER', FLOAT64: 'REAL', NUMERIC: 'REAL', BIGNUMERIC: 'REAL', STRING: 'TEXT', BOOL: 'INTEGER', BOOLEAN: 'INTEGER', DATE: 'TEXT', DATETIME: 'TEXT', TIMESTAMP: 'TEXT', TIME: 'TEXT', BYTES: 'BLOB' };
  const partText = tk => trimWs(tk).map(t => t.v).join('').toUpperCase();

  // ---------------------------------------------------------------- tradução
  function E(tk, ctx, opt) {
    ctx = ctx || {}; let o = '';
    for (let i = 0; i < tk.length; i++) {
      const t = tk[i];
      if (t.k == 'ws') { o += t.v; continue; }
      if (t.k == 'cm') { o += E1(t); continue; }
      if (t.k == 'str') { o += q1(t.v); continue; }
      if (t.k == 'num') { o += t.v; continue; }
      if (t.k == 'qid') {
        o += ident(t.v); continue;
      }
      if (t.k == 'op') {
        if (t.v == '/') { o += ' * 1.0 / '; continue; }                  // no BigQuery 7 / 2 = 3.5 (para dividir inteiros use DIV)
        if (t.v == ',') { const nx = nextSig(tk, i); if (nx >= 0 && isId(tk[nx], 'FROM')) continue; }   // vírgula sobrando antes do FROM é aceita no BigQuery
        if (t.v == '*') {                                                // SELECT * EXCEPT (...) / REPLACE (...)
          const nx = nextSig(tk, i);
          if (nx >= 0 && (isId(tk[nx], 'EXCEPT') || isId(tk[nx], 'REPLACE')) && isOp(tk[nextSig(tk, nx)], '(')) {
            const r = starMod(tk, i, nx, null, ctx, opt); o += r.out; i = r.end; continue;
          }
        }
        o += t.v; continue;
      }
      // palavras
      const up = t.v.toUpperCase(), nx = nextSig(tk, i);
      if (nx >= 0 && isOp(tk[nx], '.') && isOp(tk[nx + 1], '*') && nextSig(tk, nx + 1) >= 0 && (isId(tk[nextSig(tk, nx + 1)], 'EXCEPT') || isId(tk[nextSig(tk, nx + 1)], 'REPLACE')) && isOp(tk[nextSig(tk, nextSig(tk, nx + 1))], '(')) {
        const r = starMod(tk, nx + 1, nextSig(tk, nx + 1), t.v, ctx, opt); o += r.out; i = r.end; continue;
      }
      if (nx >= 0 && isOp(tk[nx], '(')) {                                // chamada de função: NOME ( ... )
        if (NOT_BQ[up]) throw new BQError(`Function not found: ${t.v} (${NOT_BQ[up]}) ${where(opt.src, t.p)}`);
        const close = closeOf(tk, nx), inner = tk.slice(nx + 1, close), r = call(up, t, inner, ctx, opt);
        const gap = tk.slice(i + 1, nx).map(E1).join('');
        if (r != null) o += r; else o += (ALIAS[up] || t.v) + gap + '(' + E(inner, ctx, opt) + ')';
        i = close; continue;
      }
      if ((up == 'ARRAY' || up == 'STRUCT' || up == 'UNNEST') && UNSUPPORTED.has(up)) throw new BQError(`${up} ainda não funciona neste editor (arrays e STRUCT ficam para uma próxima versão) ${where(opt.src, t.p)}`);
      switch (up) {
        case 'FROM': case 'JOIN': case 'INTO': case 'UPDATE': case 'TABLE': case 'VIEW': {
          if (up == 'FROM' && ctx.noFrom) break;
          if (up == 'TABLE' || up == 'VIEW') { const pv = prevSig(tk, i); if (pv < 0 || !(tk[pv].k == 'id' && ['CREATE', 'DROP', 'ALTER', 'TEMP', 'TEMPORARY', 'REPLACE', 'TRUNCATE', 'MATERIALIZED', 'EXTERNAL', 'SNAPSHOT'].includes(tk[pv].v.toUpperCase()))) break; }
          const p = tablePath(tk, i + 1);
          if (p) { o += t.v + p.out; i = p.end; continue; }
          break;
        }
        case 'UNION': case 'INTERSECT': case 'EXCEPT': {
          const w = nx >= 0 ? tk[nx] : null, wu = w && w.k == 'id' ? w.v.toUpperCase() : '';
          if (up == 'UNION' && wu == 'ALL') { o += 'UNION ALL'; i = nx; continue; }
          if (wu == 'DISTINCT') { o += up; i = nx; continue; }
          if (up == 'UNION') throw new BQError(`No BigQuery o UNION precisa de ALL ou DISTINCT (UNION ALL mantém as linhas repetidas, UNION DISTINCT tira) ${where(opt.src, t.p)}`);
          throw new BQError(`No BigQuery o ${up} precisa de DISTINCT: escreva ${up} DISTINCT ${where(opt.src, t.p)}`);
        }
        case 'DATE': case 'TIMESTAMP': case 'DATETIME': {
          if (nx >= 0 && tk[nx].k == 'str') { continue; }                  // DATE '2026-09-01' -> '2026-09-01'
          if (ctx.ddl && DDL_TYPE[up]) { o += DDL_TYPE[up]; continue; }
          break;
        }
        case 'CURRENT_DATE': o += '__today()'; continue;
        case 'CURRENT_TIMESTAMP': case 'CURRENT_DATETIME': o += '__now()'; continue;
        default:
          if (ctx.ddl && DDL_TYPE[up] && up != 'DATE') { o += DDL_TYPE[up]; continue; }
      }
      o += t.v;
    }
    return o;
  }

  // SELECT * EXCEPT (a, b) / REPLACE (expr AS c): vira a lista de colunas escrita por extenso
  function starMod(tk, star, kw, qual, ctx, opt) {
    const open = nextSig(tk, kw), close = closeOf(tk, open), isExc = isId(tk[kw], 'EXCEPT');
    // tabela de origem: o primeiro FROM no mesmo nível
    let d = 0, f = -1;
    for (let j = close + 1; j < tk.length; j++) { if (isOp(tk[j], '(')) d++; else if (isOp(tk[j], ')')) { d--; if (d < 0) break; } else if (d == 0 && isId(tk[j], 'FROM')) { f = j; break; } }
    if (f < 0) throw new BQError('SELECT * EXCEPT precisa de um FROM ' + where(opt.src, tk[star].p));
    let tbl = null;
    const find = (from, name) => {     // tabela (ou apelido) em FROM/JOIN
      let dd = 0;
      for (let j = from; j < tk.length; j++) {
        if (isOp(tk[j], '(')) dd++; else if (isOp(tk[j], ')')) { dd--; if (dd < 0) break; }
        if (dd == 0 && (isId(tk[j], 'FROM') || isId(tk[j], 'JOIN'))) {
          const p = tablePath(tk, j + 1); if (!p) continue;
          let a = nextSig(tk, p.end); let alias = null;
          if (a >= 0 && isId(tk[a], 'AS')) a = nextSig(tk, a);
          if (a >= 0 && tk[a].k == 'id' && !/^(WHERE|GROUP|ORDER|LIMIT|JOIN|LEFT|RIGHT|INNER|FULL|CROSS|ON|USING|UNION|EXCEPT|INTERSECT|QUALIFY|HAVING|WINDOW)$/i.test(tk[a].v)) alias = tk[a].v;
          if (!name || (alias && alias.toLowerCase() == name.toLowerCase()) || (!alias && p.segs[p.segs.length - 1].toLowerCase() == name.toLowerCase()) || p.segs[p.segs.length - 1].toLowerCase() == name.toLowerCase()) return p.segs[p.segs.length - 1];
        }
      }
      return null;
    };
    tbl = find(f, qual);
    const cols = tbl && opt.columns ? opt.columns(tbl) : null;
    if (!cols || !cols.length) throw new BQError('SELECT * EXCEPT/REPLACE só funciona com o nome de uma tabela ' + where(opt.src, tk[star].p));
    const groups = splitTop(tk.slice(open + 1, close), ',');
    const pref = qual ? ident(qual) + '.' : '';
    let list;
    if (isExc) {
      const drop = new Set(groups.map(g => trimWs(g).map(x => x.v).join('').toLowerCase()));
      list = cols.filter(c => !drop.has(c.toLowerCase())).map(c => pref + ident(c));
    } else {
      const rep = {};
      for (const g of groups) {
        const gt = trimWs(g); let a = -1; for (let j = gt.length - 1; j >= 0; j--) if (isId(gt[j], 'AS')) { a = j; break; }
        if (a < 0) throw new BQError('No REPLACE use  expressão AS coluna ' + where(opt.src, tk[kw].p));
        rep[trimWs(gt.slice(a + 1)).map(x => x.v).join('').toLowerCase()] = E(gt.slice(0, a), ctx, opt);
      }
      list = cols.map(c => rep[c.toLowerCase()] !== undefined ? `(${rep[c.toLowerCase()]}) AS ${ident(c)}` : pref + ident(c));
    }
    return { out: list.join(', '), end: close };
  }

  function call(up, t, inner, ctx, opt) {
    const A = () => splitTop(inner, ',').map(g => trimWs(g));
    const e = g => E(g, ctx, opt);
    switch (up) {
      case 'CAST': case 'SAFE_CAST': {
        let a = -1, d = 0; for (let j = 0; j < inner.length; j++) { if (isOp(inner[j], '(')) d++; else if (isOp(inner[j], ')')) d--; else if (d == 0 && isId(inner[j], 'AS')) a = j; }
        if (a < 0) throw new BQError(`${up} precisa de AS: ${up}(valor AS tipo) ${where(opt.src, t.p)}`);
        const ty = partText(inner.slice(a + 1)).replace(/\(.*$/, ''), fn = CAST_FN[ty];
        if (!fn) throw new BQError(`Tipo desconhecido no ${up}: ${ty || '(vazio)'} (use INT64, FLOAT64, STRING, BOOL, DATE...) ${where(opt.src, t.p)}`);
        return (up == 'SAFE_CAST' ? '__s' + fn.slice(2) : fn) + '(' + e(inner.slice(0, a)) + ')';
      }
      case 'EXTRACT': {
        let f = -1, d = 0; for (let j = 0; j < inner.length; j++) { if (isOp(inner[j], '(')) d++; else if (isOp(inner[j], ')')) d--; else if (d == 0 && isId(inner[j], 'FROM')) { f = j; break; } }
        if (f < 0) throw new BQError(`EXTRACT precisa de FROM: EXTRACT(YEAR FROM data) ${where(opt.src, t.p)}`);
        return `__extract(${q1(partText(inner.slice(0, f)))}, ${E(inner.slice(f + 1), Object.assign({}, ctx, { noFrom: true }), opt)})`;
      }
      case 'DATE_ADD': case 'DATE_SUB': {
        const a = A(); if (a.length != 2 || !isId(a[1][0], 'INTERVAL')) throw new BQError(`${up}(data, INTERVAL n DAY) ${where(opt.src, t.p)}`);
        const iv = a[1].slice(1), last = iv.length - 1; let pi = last; while (pi >= 0 && !isSig(iv[pi])) pi--;
        const part = iv[pi].v.toUpperCase(), n = e(iv.slice(0, pi));
        return `__date_add(${e(a[0])}, ${up == 'DATE_SUB' ? `-(${n})` : `(${n})`}, ${q1(part)})`;
      }
      case 'DATE_DIFF': { const a = A(); if (a.length != 3) throw new BQError(`DATE_DIFF(data1, data2, DAY) ${where(opt.src, t.p)}`); return `__date_diff(${e(a[0])}, ${e(a[1])}, ${q1(partText(a[2]))})`; }
      case 'DATE_TRUNC': { const a = A(); if (a.length != 2) throw new BQError(`DATE_TRUNC(data, MONTH) ${where(opt.src, t.p)}`); return `__date_trunc(${e(a[0])}, ${q1(partText(a[1]))})`; }
      case 'LAST_DAY': { const a = A(); if (a.length < 1 || a.length > 2) throw new BQError(`LAST_DAY(data) ${where(opt.src, t.p)}`); return `__last_day(${e(a[0])}, ${q1(a[1] ? partText(a[1]) : 'MONTH')})`; }
      case 'COUNTIF': return `COUNT(CASE WHEN ${e(inner)} THEN 1 END)`;
      case 'IF': return `IIF(${e(inner)})`;
      case 'STRING_AGG': return `GROUP_CONCAT(${e(inner)})`;
      case 'ANY_VALUE': return `MIN(${e(inner)})`;
      case 'APPROX_COUNT_DISTINCT': return `COUNT(DISTINCT ${e(inner)})`;
      case 'CURRENT_DATE': return '__today()';
      case 'CURRENT_TIMESTAMP': case 'CURRENT_DATETIME': return '__now()';
      default:
        if (UNSUPPORTED.has(up)) throw new BQError(`${up} ainda não funciona neste editor (arrays e STRUCT ficam para uma próxima versão) ${where(opt.src, t.p)}`);
        if (ctx.ddl && DDL_TYPE[up] && up != 'DATE') return DDL_TYPE[up];
        return null;
    }
  }
  const ALIAS = { DATE: '__date', DATETIME: '__datetime', TIMESTAMP: '__datetime', SUBSTRING: 'SUBSTR', CHAR_LENGTH: 'LENGTH', CHARACTER_LENGTH: 'LENGTH', CEILING: 'CEIL', POWER: 'POW' };

  // ---------------------------------------------------------------- QUALIFY: vira uma consulta por fora filtrando a coluna __qualify (que some do resultado)
  function qualifyPass(tk) {
    // 1) dentro dos parênteses primeiro
    const out = [];
    for (let i = 0; i < tk.length; i++) {
      if (isOp(tk[i], '(')) { const c = closeOf(tk, i); out.push(tk[i], ...qualifyPass(tk.slice(i + 1, c)), tk[c]); i = c; } else out.push(tk[i]);
    }
    // 2) QUALIFY neste nível
    let d = 0, qi = -1;
    for (let i = 0; i < out.length; i++) { if (isOp(out[i], '(')) d++; else if (isOp(out[i], ')')) d--; else if (d == 0 && isId(out[i], 'QUALIFY')) { qi = i; break; } }
    if (qi < 0) return out;
    // início do SELECT principal (depois de um WITH, o último SELECT no nível 0)
    d = 0; let si = -1;
    for (let i = 0; i < qi; i++) { if (isOp(out[i], '(')) d++; else if (isOp(out[i], ')')) d--; else if (d == 0 && isId(out[i], 'SELECT')) si = i; }
    if (si < 0) throw new BQError('QUALIFY precisa de um SELECT antes');
    d = 0; let end = out.length;
    for (let i = qi + 1; i < out.length; i++) { if (isOp(out[i], '(')) d++; else if (isOp(out[i], ')')) d--; else if (d == 0 && (isId(out[i], 'ORDER') || isId(out[i], 'LIMIT'))) { end = i; break; } }
    const head = out.slice(si, qi), cond = out.slice(qi + 1, end), tail = out.slice(end), pre = out.slice(0, si);
    const mk = (k, v) => ({ k, v, p: 0 });
    d = 0; let fi = head.length;                                         // a coluna extra entra na lista do SELECT, antes do FROM
    for (let i = 0; i < head.length; i++) { if (isOp(head[i], '(')) d++; else if (isOp(head[i], ')')) d--; else if (d == 0 && isId(head[i], 'FROM')) { fi = i; break; } }
    const extra = [mk('op', ','), mk('ws', ' '), mk('op', '('), ...cond, mk('op', ')'), mk('ws', ' '), mk('id', 'AS'), mk('ws', ' '), mk('id', '__qualify'), mk('ws', ' ')];
    return [...pre, mk('id', 'SELECT'), mk('ws', ' '), mk('op', '*'), mk('ws', ' '), mk('id', 'FROM'), mk('ws', ' '), mk('op', '('),
      ...head.slice(0, fi), ...extra, ...head.slice(fi), mk('op', ')'), mk('ws', ' '), mk('id', 'WHERE'), mk('ws', ' '), mk('id', '__qualify'), mk('ws', ' '), ...tail];
  }

  function stmt(tk, opt) {
    const sig = tk.filter(isSig); if (!sig.length) return tk.map(E1).join('');
    const w = sig.map(t => t.k == 'id' ? t.v.toUpperCase() : '');
    const topWhere = (() => { let d = 0; for (const t of tk) { if (isOp(t, '(')) d++; else if (isOp(t, ')')) d--; else if (d == 0 && isId(t, 'WHERE')) return true; } return false; })();
    if (w[0] == 'PRAGMA') throw new BQError('PRAGMA é do SQLite: o BigQuery não tem esse comando ' + where(opt.src, sig[0].p));
    if (w[0] == 'CREATE' && (w[1] == 'INDEX' || (w[1] == 'UNIQUE' && w[2] == 'INDEX'))) throw new BQError('O BigQuery não tem CREATE INDEX: ele lê só as colunas pedidas e organiza os dados por partição e cluster ' + where(opt.src, sig[0].p));
    if (w.includes('AUTOINCREMENT')) throw new BQError('O BigQuery não tem AUTOINCREMENT ' + where(opt.src, sig[0].p));
    if ((w[0] == 'UPDATE' || w[0] == 'DELETE') && !topWhere) throw new BQError(`${w[0]} precisa de WHERE no BigQuery (para atingir todas as linhas escreva WHERE true) ${where(opt.src, sig[0].p)}`);
    if (w[0] == 'TRUNCATE') { const p = tablePath(tk, tk.indexOf(sig[w[1] == 'TABLE' ? 1 : 0]) + 1); if (p) return 'DELETE FROM ' + p.out; }
    const ddl = (w[0] == 'CREATE' || w[0] == 'ALTER') && !w.includes('AS');             // só CREATE TABLE (colunas com tipo); no CREATE ... AS SELECT os nomes DATE, STRING... são do SELECT
    if (w[0] == 'CREATE' && w[1] == 'OR' && w[2] == 'REPLACE') {
      let k = 3; while (['TEMP', 'TEMPORARY'].includes(w[k])) k++;
      const kind = w[k]; const at = tk.indexOf(sig[k]);
      if (kind == 'TABLE' || kind == 'VIEW') {
        const p = tablePath(tk, at + 1);
        if (p) {
          const nm = p.out.trim(), rest = tk.slice(p.end + 1), head = `DROP ${kind} IF EXISTS ${nm}; CREATE ${kind} ${nm}`;
          return head + E(rest, { ddl }, opt);
        }
      }
    }
    return E(tk, { ddl }, opt);
  }

  function translate(sql, o) {
    const src = String(sql ?? ''), opt = Object.assign({}, o, { src });
    let tk = lex(src);
    if (tk.some(t => isId(t, 'QUALIFY'))) tk = qualifyPass(tk);
    const parts = [[]]; let d = 0;
    for (const t of tk) { if (isOp(t, '(')) d++; else if (isOp(t, ')')) d--; parts[parts.length - 1].push(t); if (d == 0 && isOp(t, ';')) parts.push([]); }
    return parts.map(p => stmt(p, opt)).join('');
  }

  // ---------------------------------------------------------------- funções do BigQuery que o SQLite não tem
  const DAY = 864e5;
  const num = x => x == null ? null : +x;
  const str = x => x == null ? null : String(x);
  const pad = (n, w = 2) => String(n).padStart(w, '0');
  function parseDate(s) {
    if (s == null) return null;
    const m = /^\s*(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/.exec(String(s));
    if (!m) throw `Invalid date: '${s}'`;
    const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0)));
    if (d.getUTCMonth() != +m[2] - 1 || d.getUTCDate() != +m[3]) throw `Invalid date: '${s}'`;
    return d;
  }
  const fd = d => `${pad(d.getUTCFullYear(), 4)}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
  const fdt = d => fd(d) + ' ' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds());
  const mid = d => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const dim = (y, m) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const yday = d => Math.round((mid(d) - Date.UTC(d.getUTCFullYear(), 0, 1)) / DAY);
  const weekStart = (d, mon) => { const wd = d.getUTCDay(), back = mon ? (wd + 6) % 7 : wd; return mid(d) - back * DAY; };
  function isoYW(d) {
    const t = new Date(mid(d)); t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
    const y = t.getUTCFullYear(); return [y, Math.ceil(((t - Date.UTC(y, 0, 1)) / DAY + 1) / 7)];
  }
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const WDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const quarter = d => Math.floor(d.getUTCMonth() / 3) + 1;
  function dateAdd(s, n, part) {
    const d = parseDate(s); if (d == null || n == null) return null; n = Math.trunc(+n);
    if (part == 'DAY') d.setUTCDate(d.getUTCDate() + n);
    else if (part == 'WEEK') d.setUTCDate(d.getUTCDate() + 7 * n);
    else if (part == 'MONTH' || part == 'QUARTER' || part == 'YEAR') {
      const k = n * (part == 'MONTH' ? 1 : part == 'QUARTER' ? 3 : 12), y0 = d.getUTCFullYear(), m0 = d.getUTCMonth() + k, y = y0 + Math.floor(m0 / 12), m = ((m0 % 12) + 12) % 12;
      d.setTime(Date.UTC(y, m, Math.min(d.getUTCDate(), dim(y, m))));
    } else throw `Parte de data não suportada: ${part}`;
    return fd(d);
  }
  function dateDiff(a, b, part) {
    const A = parseDate(a), B = parseDate(b); if (A == null || B == null) return null;
    switch (part) {
      case 'DAY': return Math.round((mid(A) - mid(B)) / DAY);
      case 'WEEK': return Math.round((weekStart(A, false) - weekStart(B, false)) / (7 * DAY));
      case 'WEEK(MONDAY)': case 'ISOWEEK': return Math.round((weekStart(A, true) - weekStart(B, true)) / (7 * DAY));
      case 'MONTH': return (A.getUTCFullYear() * 12 + A.getUTCMonth()) - (B.getUTCFullYear() * 12 + B.getUTCMonth());
      case 'QUARTER': return (A.getUTCFullYear() * 4 + quarter(A)) - (B.getUTCFullYear() * 4 + quarter(B));
      case 'YEAR': return A.getUTCFullYear() - B.getUTCFullYear();
      case 'ISOYEAR': return isoYW(A)[0] - isoYW(B)[0];
    }
    throw `Parte de data não suportada no DATE_DIFF: ${part}`;
  }
  function dateTrunc(s, part) {
    const d = parseDate(s); if (d == null) return null;
    switch (part) {
      case 'DAY': return fd(d);
      case 'WEEK': return fd(new Date(weekStart(d, false)));
      case 'WEEK(MONDAY)': case 'ISOWEEK': return fd(new Date(weekStart(d, true)));
      case 'MONTH': return fd(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)));
      case 'QUARTER': return fd(new Date(Date.UTC(d.getUTCFullYear(), (quarter(d) - 1) * 3, 1)));
      case 'YEAR': return fd(new Date(Date.UTC(d.getUTCFullYear(), 0, 1)));
    }
    throw `Parte de data não suportada no DATE_TRUNC: ${part}`;
  }
  function lastDay(s, part) {
    const d = parseDate(s); if (d == null) return null; part = part || 'MONTH';
    if (part == 'MONTH') return fd(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), dim(d.getUTCFullYear(), d.getUTCMonth()))));
    if (part == 'YEAR') return `${pad(d.getUTCFullYear(), 4)}-12-31`;
    if (part == 'QUARTER') { const m = quarter(d) * 3 - 1; return fd(new Date(Date.UTC(d.getUTCFullYear(), m, dim(d.getUTCFullYear(), m)))); }
    if (part == 'WEEK' || part == 'WEEK(MONDAY)') return fd(new Date(weekStart(d, part != 'WEEK') + 6 * DAY));
    throw `Parte de data não suportada no LAST_DAY: ${part}`;
  }
  function extract(part, s) {
    const d = parseDate(s); if (d == null) return null;
    switch (part) {
      case 'YEAR': return d.getUTCFullYear(); case 'MONTH': return d.getUTCMonth() + 1; case 'DAY': return d.getUTCDate();
      case 'DAYOFWEEK': return d.getUTCDay() + 1; case 'DAYOFYEAR': return yday(d) + 1; case 'QUARTER': return quarter(d);
      case 'WEEK': return Math.floor((yday(d) + 7 - d.getUTCDay()) / 7);
      case 'ISOWEEK': return isoYW(d)[1]; case 'ISOYEAR': return isoYW(d)[0];
      case 'HOUR': return d.getUTCHours(); case 'MINUTE': return d.getUTCMinutes(); case 'SECOND': return d.getUTCSeconds();
      case 'DATE': return fd(d);
    }
    throw `Parte não suportada no EXTRACT: ${part}`;
  }
  function formatDate(fmt, s) {
    const d = parseDate(s); if (d == null || fmt == null) return null;
    return String(fmt).replace(/%([A-Za-z%])/g, (m, c) => {
      switch (c) {
        case 'Y': return pad(d.getUTCFullYear(), 4); case 'y': return pad(d.getUTCFullYear() % 100); case 'm': return pad(d.getUTCMonth() + 1); case 'd': return pad(d.getUTCDate());
        case 'e': return String(d.getUTCDate()).padStart(2, ' '); case 'B': return MONTHS[d.getUTCMonth()]; case 'b': case 'h': return MONTHS[d.getUTCMonth()].slice(0, 3);
        case 'A': return WDAYS[d.getUTCDay()]; case 'a': return WDAYS[d.getUTCDay()].slice(0, 3); case 'u': return String(d.getUTCDay() || 7); case 'w': return String(d.getUTCDay());
        case 'j': return pad(yday(d) + 1, 3); case 'U': return pad(Math.floor((yday(d) + 7 - d.getUTCDay()) / 7)); case 'V': return pad(isoYW(d)[1]); case 'G': return String(isoYW(d)[0]);
        case 'Q': return String(quarter(d)); case 'F': return fd(d); case 'D': return `${pad(d.getUTCMonth() + 1)}/${pad(d.getUTCDate())}/${pad(d.getUTCFullYear() % 100)}`;
        case 'H': return pad(d.getUTCHours()); case 'M': return pad(d.getUTCMinutes()); case 'S': return pad(d.getUTCSeconds()); case '%': return '%';
      }
      throw `FORMAT_DATE: código não suportado ${m}`;
    });
  }
  function parseWith(fmt, s) {
    if (fmt == null || s == null) return null;
    const names = []; let re = '';
    for (let i = 0; i < fmt.length; i++) {
      if (fmt[i] == '%' && i + 1 < fmt.length) {
        const c = fmt[++i];
        if (c == 'Y') { re += '(\\d{4})'; names.push('Y'); } else if (c == 'y') { re += '(\\d{2})'; names.push('y'); } else if (c == 'm') { re += '(\\d{1,2})'; names.push('m'); } else if (c == 'd' || c == 'e') { re += '\\s*(\\d{1,2})'; names.push('d'); }
        else if (c == 'B' || c == 'b' || c == 'h') { re += '([A-Za-z]+)'; names.push('B'); } else if (c == 'F') { re += '(\\d{4})-(\\d{1,2})-(\\d{1,2})'; names.push('Y', 'm', 'd'); } else if (c == '%') re += '%';
        else throw `PARSE_DATE: código não suportado %${c}`;
      } else re += fmt[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    const m = new RegExp('^' + re + '$', 'i').exec(String(s).trim()); if (!m) throw `Failed to parse input string '${s}'`;
    let Y = 1970, M = 1, D = 1;
    names.forEach((k, i) => { const v = m[i + 1]; if (k == 'Y') Y = +v; else if (k == 'y') Y = +v < 70 ? 2000 + +v : 1900 + +v; else if (k == 'm') M = +v; else if (k == 'd') D = +v; else { const j = MONTHS.findIndex(x => x.toLowerCase().startsWith(v.slice(0, 3).toLowerCase())); if (j < 0) throw `Failed to parse input string '${s}'`; M = j + 1; } });
    return fd(new Date(Date.UTC(Y, M - 1, D)));
  }
  const toDate = (...a) => a.length >= 3 ? fd(new Date(Date.UTC(+a[0], +a[1] - 1, +a[2]))) : a[0] == null ? null : fd(parseDate(a[0]));
  const toInt = x => {
    if (x == null) return null;
    if (typeof x == 'number') { if (!isFinite(x)) throw 'Bad int64 value'; return x < 0 ? -Math.round(-x) : Math.round(x); }
    const s = String(x).trim(); if (!/^[+-]?\d+$/.test(s)) throw `Bad int64 value: ${x}`; return +s;
  };
  const toFloat = x => { if (x == null) return null; const s = typeof x == 'number' ? x : String(x).trim(); const n = +s; if (s === '' || isNaN(n)) throw `Bad double value: ${x}`; return n; };
  const toStr = x => x == null ? null : String(x);
  const toBool = x => { if (x == null) return null; if (typeof x == 'number') return x != 0 ? 1 : 0; const s = String(x).trim().toLowerCase(); if (['true', 't', 'yes', 'y', '1'].includes(s)) return 1; if (['false', 'f', 'no', 'n', '0'].includes(s)) return 0; throw `Bad bool value: ${x}`; };
  const safe = f => (...a) => { try { return f(...a); } catch { return null; } };
  const mod = (a, b) => { if (a == null || b == null) return null; if (+b == 0) throw 'division by zero: MOD(' + a + ', 0)'; return +a % +b; };
  const fmtNum = (x, c, flags, w, p) => {
    let s;
    if (c == 'd' || c == 'i') s = String(Math.trunc(+x)); else if (c == 'f') s = (+x).toFixed(p == null ? 6 : +p); else if (c == 'e') s = (+x).toExponential(p == null ? 6 : +p);
    else if (c == 'g') s = String(+(+x).toPrecision(p == null ? 6 : +p || 1)); else s = String(x);
    if (flags.includes('+') && +x >= 0) s = '+' + s;
    if (flags.includes(',') || flags.includes("'")) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if (w) s = flags.includes('-') ? s.padEnd(+w) : flags.includes('0') ? s.replace(/^([+-]?)(.*)$/, (m, g, r) => g + r.padStart(+w - g.length, '0')) : s.padStart(+w);
    return s;
  };
  function format(fmt, ...args) {
    if (fmt == null) return null; let k = 0;
    return String(fmt).replace(/%([-+ 0#,']*)(\d+)?(?:\.(\d+))?([a-zA-Z%])/g, (m, fl, w, p, c) => {
      if (c == '%') return '%';
      const v = args[k++]; if (v === undefined) throw 'FORMAT: faltam argumentos';
      if (v == null) return 'NULL';
      if ('difegxX'.includes(c)) { if (c == 'x') return (+v).toString(16); if (c == 'X') return (+v).toString(16).toUpperCase(); return fmtNum(v, c, fl, w, p); }
      if (c == 's' || c == 't' || c == 'T') { const s = c == 'T' && typeof v == 'string' ? "'" + v + "'" : String(v); return w ? (fl.includes('-') ? s.padEnd(+w) : s.padStart(+w)) : s; }
      throw `FORMAT: código não suportado ${m}`;
    });
  }
  const rx = (re, flags) => { try { return new RegExp(String(re), flags); } catch { throw `Cannot parse regular expression: ${re}`; } };
  const FN = {
    // texto
    UPPER: [a => str(a) == null ? null : String(a).toUpperCase(), [1]], LOWER: [a => a == null ? null : String(a).toLowerCase(), [1]],
    CONCAT: [(...a) => { if (a.some(x => x == null)) return null; if (a.some(x => typeof x == 'number')) throw 'No matching signature for function CONCAT for argument types: INT64. Use CAST(coluna AS STRING)'; return a.join(''); }, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]],
    REVERSE: [a => a == null ? null : Array.from(String(a)).reverse().join(''), [1]],
    STARTS_WITH: [(a, b) => a == null || b == null ? null : String(a).startsWith(String(b)) ? 1 : 0, [2]], ENDS_WITH: [(a, b) => a == null || b == null ? null : String(a).endsWith(String(b)) ? 1 : 0, [2]],
    CONTAINS_SUBSTR: [(a, b) => a == null || b == null ? null : String(a).toLowerCase().includes(String(b).toLowerCase()) ? 1 : 0, [2]],
    STRPOS: [(a, b) => a == null || b == null ? null : String(a).indexOf(String(b)) + 1, [2]],
    LEFT: [(a, n) => a == null || n == null ? null : String(a).slice(0, Math.max(0, +n)), [2]], RIGHT: [(a, n) => a == null || n == null ? null : +n <= 0 ? '' : String(a).slice(-(+n)), [2]],
    LPAD: [(a, n, p) => a == null || n == null ? null : lpad(String(a), +n, p == null ? ' ' : String(p), true), [2, 3]], RPAD: [(a, n, p) => a == null || n == null ? null : lpad(String(a), +n, p == null ? ' ' : String(p), false), [2, 3]],
    REPEAT: [(a, n) => a == null || n == null ? null : String(a).repeat(Math.max(0, +n)), [2]],
    INITCAP: [a => a == null ? null : String(a).toLowerCase().replace(/(^|[^A-Za-z0-9])([a-z])/g, (m, x, y) => x + y.toUpperCase()), [1]],
    REGEXP_CONTAINS: [(a, r) => a == null || r == null ? null : rx(r).test(String(a)) ? 1 : 0, [2]],
    REGEXP_EXTRACT: [(a, r) => { if (a == null || r == null) return null; const m = rx(r).exec(String(a)); return m ? (m[1] !== undefined ? m[1] : m[0]) : null; }, [2]],
    REGEXP_REPLACE: [(a, r, s) => a == null || r == null || s == null ? null : String(a).replace(rx(r, 'g'), String(s).replace(/\\(\d)/g, '$$$1')), [3]],
    FORMAT: [format, [1, 2, 3, 4, 5, 6, 7, 8, 9]],
    // números
    CEIL: [a => a == null ? null : Math.ceil(+a), [1]], FLOOR: [a => a == null ? null : Math.floor(+a), [1]], POW: [(a, b) => a == null || b == null ? null : Math.pow(+a, +b), [2]],
    SQRT: [a => { if (a == null) return null; if (+a < 0) throw 'SQRT de número negativo'; return Math.sqrt(+a); }, [1]], EXP: [a => a == null ? null : Math.exp(+a), [1]],
    LN: [a => { if (a == null) return null; if (+a <= 0) throw 'LN de número não positivo'; return Math.log(+a); }, [1]], LOG10: [a => a == null ? null : Math.log10(+a), [1]],
    LOG: [(a, b) => a == null || (b !== undefined && b == null) ? null : b === undefined ? Math.log(+a) : Math.log(+a) / Math.log(+b), [1, 2]],
    MOD: [mod, [2]], DIV: [(a, b) => { if (a == null || b == null) return null; if (+b == 0) throw 'division by zero: DIV(' + a + ', 0)'; return Math.trunc(+a / +b); }, [2]],
    SIGN: [a => a == null ? null : Math.sign(+a), [1]], TRUNC: [(a, n) => { if (a == null) return null; const f = Math.pow(10, +(n || 0)); return Math.trunc(+a * f) / f; }, [1, 2]],
    SAFE_DIVIDE: [(a, b) => a == null || b == null || +b == 0 ? null : +a / +b, [2]], IEEE_DIVIDE: [(a, b) => a == null || b == null ? null : +a / +b, [2]],
    SAFE_SUBTRACT: [(a, b) => a == null || b == null ? null : +a - +b, [2]], SAFE_ADD: [(a, b) => a == null || b == null ? null : +a + +b, [2]], SAFE_MULTIPLY: [(a, b) => a == null || b == null ? null : +a * +b, [2]],
    GREATEST: [(...a) => a.some(x => x == null) ? null : a.reduce((x, y) => x > y ? x : y), [1, 2, 3, 4, 5, 6, 7, 8]], LEAST: [(...a) => a.some(x => x == null) ? null : a.reduce((x, y) => x < y ? x : y), [1, 2, 3, 4, 5, 6, 7, 8]],
    // datas
    __today: [() => fd(new Date()), [0]], __now: [() => fdt(new Date()), [0]],
    __date: [toDate, [1, 3]], __datetime: [a => a == null ? null : fdt(parseDate(a)), [1]],
    __date_add: [dateAdd, [3]], __date_diff: [dateDiff, [3]], __date_trunc: [dateTrunc, [2]], __last_day: [lastDay, [1, 2]], __extract: [extract, [2]],
    FORMAT_DATE: [formatDate, [2]], PARSE_DATE: [parseWith, [2]],
    // CAST e SAFE_CAST
    __int64: [toInt, [1]], __float64: [toFloat, [1]], __string: [toStr, [1]], __bool: [toBool, [1]],
    __sint64: [safe(toInt), [1]], __sfloat64: [safe(toFloat), [1]], __sstring: [toStr, [1]], __sbool: [safe(toBool), [1]], __sdate: [safe(toDate), [1]], __sdatetime: [safe(a => a == null ? null : fdt(parseDate(a))), [1]]
  };
  function lpad(s, n, p, left) {
    if (n < 0) throw 'LPAD/RPAD: tamanho negativo'; if (!p) throw 'LPAD/RPAD: o texto de preenchimento não pode ser vazio';
    const cs = Array.from(s); if (cs.length >= n) return cs.slice(0, n).join('');
    let fill = ''; while (Array.from(fill).length < n - cs.length) fill += p; fill = Array.from(fill).slice(0, n - cs.length).join('');
    return left ? fill + s : s + fill;
  }
  const wrap = (name, f, ar) => {
    const g = (...a) => {
      try {
        if (!ar.includes(a.length)) throw `No matching signature for function ${name} (número de argumentos errado)`;
        const r = f(...a); return r === undefined ? null : typeof r == 'boolean' ? (r ? 1 : 0) : r;
      } catch (e) { throw String(e && e.message || e); }
    };
    Object.defineProperty(g, 'length', { value: -1 });     // -1 = aceita qualquer número de argumentos (o sql.js só deixa registrar cada nome uma vez)
    return g;
  };
  function setup(db) {
    if (db.__bq) return db; db.__bq = true;
    for (const [name, [f, ar]] of Object.entries(FN)) db.create_function(name, wrap(name, f, ar));
    try { (db.execRaw || db.exec).call(db, 'PRAGMA case_sensitive_like = ON'); } catch { }          // LIKE diferencia maiúsculas de minúsculas, como no BigQuery
    return db;
  }
  const columnsOf = db => t => { try { const r = db.__raw('PRAGMA table_info(' + ident(t) + ')')[0]; return r ? r.values.map(v => v[1]) : []; } catch { return []; } };
  function install(SQL) {
    const D = SQL.Database; if (D.__bq) return SQL;
    const P = D.prototype, raw = P.exec; D.__bq = true;
    P.__raw = P.execRaw = function (s, p) { return raw.call(this, s, p); };
    P.exec = function (sql, params) {
      setup(this);
      const res = raw.call(this, translate(sql, { columns: columnsOf(this) }), params);
      // como no BigQuery: coluna que não é um nome (COUNT(*), preco * 2...) sem apelido vira f0_, f1_... ; a coluna __qualify do QUALIFY some
      return res.map(r => {
        let cols = r.columns, vals = r.values; const n = cols.length;
        if (n && cols[n - 1] == '__qualify') { cols = cols.slice(0, -1); vals = vals.map(v => v.slice(0, -1)); }
        cols = cols.map((c, i) => /^[A-Za-z_]\w*$/.test(c) ? c : 'f' + i + '_');
        return { columns: cols, values: vals };
      });
    };
    return SQL;
  }
  return { translate, setup, install, BQError, lex };
});
