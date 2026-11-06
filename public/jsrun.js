// EXECUTOR DE JAVASCRIPT DO CODEUP (o mesmo código roda no navegador, num Web Worker, e no servidor, num processo separado).
// BOOT() é escrito DENTRO do "mundo" onde o código do aluno roda (o worker ou um contexto do módulo vm do Node) e dá a ele:
//   • console.log/info/debug/warn/error/group/groupEnd/table, formatado como o console do Node (inspect + util.format);
//   • setTimeout/setInterval/setImmediate/queueMicrotask com RELÓGIO VIRTUAL: o tempo "passa" instantaneamente, na ordem certa (a saída é a mesma sempre e a correção é rápida);
//   • a saída vai para a função emit(texto) que o chamador entrega; o código do aluno nunca recebe objetos do chamador.
// BOOT.toString() é avaliado no mundo de destino, por isso ele NÃO pode usar nada de fora dele.
(function (root, factory) {
  const m = factory();
  if (typeof module === 'object' && module.exports) module.exports = m; else root.JSRUN = m;
})(typeof self !== 'undefined' ? self : this, function () {
  function BOOT(emit) {
    'use strict';
    const O = Object, A = Array, S = String, N = Number, M = Math;
    const keysOf = O.keys, getProto = O.getPrototypeOf, ownDesc = O.getOwnPropertyDescriptor, hasOwn = (o, k) => O.prototype.hasOwnProperty.call(o, k);
    const objStr = v => O.prototype.toString.call(v), fnStr = f => Function.prototype.toString.call(f);
    const symStr = s => Symbol.prototype.toString.call(s);
    const own = o => { const ks = keysOf(o); const sy = O.getOwnPropertySymbols(o).filter(s => ownDesc(o, s).enumerable); return ks.concat(sy); };

    // ------------------------------------------------------------------ inspect (espelha o util.inspect do Node 20/22 com as opções padrão)
    const IDENT = /^[a-zA-Z_][a-zA-Z_0-9]*$/;
    function strEscape(s) {
      let q = "'";
      if (s.indexOf("'") !== -1) { if (s.indexOf('"') === -1) q = '"'; else if (s.indexOf('`') === -1 && s.indexOf('${') === -1) q = '`'; }
      let out = '';
      for (let i = 0; i < s.length; i++) {
        const c = s[i], code = s.charCodeAt(i);
        if (c === q || c === '\\') out += '\\' + c;
        else if (c === '\n') out += '\\n'; else if (c === '\t') out += '\\t'; else if (c === '\r') out += '\\r'; else if (c === '\b') out += '\\b'; else if (c === '\f') out += '\\f'; else if (c === '\v') out += '\\v';
        else if (code < 32 || code === 127) out += '\\x' + (code < 16 ? '0' : '') + code.toString(16).toUpperCase();
        else out += c;
      }
      return q + out + q;
    }
    function ctorName(obj) {
      let o = obj, first = true;
      while (o !== null && o !== undefined) {
        const d = ownDesc(o, 'constructor');
        if (d !== undefined && typeof d.value === 'function' && d.value.name !== '' && (function () { try { return obj instanceof d.value; } catch { return false; } })()) return d.value.name;
        o = getProto(o); first = false;
      }
      return null;
    }
    function prefixOf(constructor, tag, fallback, size) {
      if (constructor === null) { if (tag !== '' && fallback !== tag) return `[${fallback}${size !== undefined ? '(' + size + ')' : ''}: null prototype] [${tag}] `; return `[${fallback}${size !== undefined ? '(' + size + ')' : ''}: null prototype] `; }
      if (tag !== '' && constructor !== tag) return `${constructor}${size !== undefined ? '(' + size + ')' : ''} [${tag}] `;
      return `${constructor}${size !== undefined ? '(' + size + ')' : ''} `;
    }
    function fnBase(value, constructor, tag) {
      const s = fnStr(value);
      if (s.startsWith('class') && s.endsWith('}')) {
        const slice = s.slice(5, -1), bi = slice.indexOf('{');
        if (bi !== -1 && (!slice.slice(0, bi).includes('(') || /^(\s+[^(]*?)\s*{/.test(slice.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')))) {
          const hasName = hasOwn(value, 'name'), name = (hasName && value.name) || '(anonymous)';
          let base = `class ${name}`;
          if (constructor !== 'Function' && constructor !== null) base += ` [${constructor}]`;
          if (tag !== '' && constructor !== tag) base += ` [${tag}]`;
          if (constructor !== null) { const sn = getProto(value).name; if (sn) base += ` extends ${sn}`; } else base += ' extends [null prototype]';
          return `[${base}]`;
        }
      }
      let type = 'Function';
      const t = objStr(value);
      if (t === '[object GeneratorFunction]') type = 'GeneratorFunction'; else if (t === '[object AsyncFunction]') type = 'AsyncFunction'; else if (t === '[object AsyncGeneratorFunction]') type = 'AsyncGeneratorFunction';
      let base = `[${type}`;
      if (constructor === null) base += ' (null prototype)';
      base += value.name === '' ? ' (anonymous)' : `: ${value.name}`;
      base += ']';
      if (constructor !== type && constructor !== null) base += ` ${constructor}`;
      if (tag !== '' && constructor !== tag) base += ` [${tag}]`;
      return base;
    }
    function fmtNum(n) { return n === 0 && 1 / n === -Infinity ? '-0' : `${n}`; }
    function fmtPrim(ctx, v) {
      switch (typeof v) {
        case 'string': {
          if (v.length > 16 && v.length > ctx.breakLength - ctx.indentationLvl - 4) return v.split(/(?<=\n)/).map(l => strEscape(l)).join(` +\n${' '.repeat(ctx.indentationLvl + 2)}`);
          return strEscape(v);
        }
        case 'number': return fmtNum(v);
        case 'bigint': return `${v}n`;
        case 'boolean': return `${v}`;
        case 'undefined': return 'undefined';
        default: return symStr(v);
      }
    }
    function fmtValue(ctx, v, rt, typed) {
      if (typeof v !== 'object' && typeof v !== 'function') return fmtPrim(ctx, v);
      if (v === null) return 'null';
      if (ctx.seen.indexOf(v) !== -1) {
        let idx = 1;
        if (ctx.circular === undefined) { ctx.circular = new Map(); ctx.circular.set(v, idx); }
        else { idx = ctx.circular.get(v); if (idx === undefined) { idx = ctx.circular.size + 1; ctx.circular.set(v, idx); } }
        return `[Circular *${idx}]`;
      }
      return fmtRaw(ctx, v, rt, typed);
    }
    function fmtRaw(ctx, value, rt, typed) {
      let keys, protoProps;
      const constructor = ctorName(value);
      let tag = '';
      try { const t = value[Symbol.toStringTag]; if (typeof t === 'string' && t !== '') tag = t; } catch { }
      if (tag !== '' && tag === constructor) tag = '';
      let base = '', formatter = () => [], braces, noIterator = true, extra = 0;   // extra: 0 objeto, 1 array
      let i = 0;
      if (Symbol.iterator in value || constructor === null) {
        noIterator = false;
        if (A.isArray(value)) {
          const prefix = (constructor !== 'Array' || tag !== '') ? prefixOf(constructor, tag, 'Array', value.length) : '';
          keys = own(value).filter(k => typeof k !== 'string' || !/^(0|[1-9]\d*)$/.test(k) || +k >= value.length || +k > 4294967294);
          braces = [`${prefix}[`, ']'];
          if (value.length === 0 && keys.length === 0) return `${braces[0]}]`;
          extra = 1; formatter = fmtArray;
        } else if (objStr(value) === '[object Set]') {
          const size = Set.prototype.keys.call(value) && value.size;
          keys = own(value); const prefix = prefixOf(constructor, tag, 'Set', size);
          if (size === 0 && keys.length === 0) return `${prefix}{}`;
          braces = [`${prefix}{`, '}']; formatter = fmtSet;
        } else if (objStr(value) === '[object Map]') {
          const size = value.size; keys = own(value); const prefix = prefixOf(constructor, tag, 'Map', size);
          if (size === 0 && keys.length === 0) return `${prefix}{}`;
          braces = [`${prefix}{`, '}']; formatter = fmtMap;
        } else if (O.prototype.toString.call(value).indexOf('Array]') > 0 && ArrayBuffer.isView(value) && !(value instanceof DataView)) {
          keys = own(value).filter(k => typeof k !== 'string' || !/^\d+$/.test(k));
          const prefix = prefixOf(constructor, tag, 'TypedArray', value.length);
          braces = [`${prefix}[`, ']'];
          if (value.length === 0 && keys.length === 0) return `${braces[0]}]`;
          extra = 1; formatter = fmtTyped;
        } else noIterator = true;
      }
      if (noIterator) {
        keys = own(value);
        braces = ['{', '}'];
        const t = objStr(value);
        if (constructor === 'Object' && t !== '[object Error]' && t !== '[object Date]' && t !== '[object RegExp]' && t !== '[object Boolean]' && t !== '[object Number]' && t !== '[object String]' && t !== '[object Symbol]' && t !== '[object BigInt]' && t !== '[object Promise]' && t !== '[object WeakMap]' && t !== '[object WeakSet]' && t !== '[object Arguments]') {
          if (keys.length === 0) return tag !== '' ? `${prefixOf(constructor, tag, 'Object')}{}` : '{}';
          if (tag !== '') braces[0] = `${prefixOf(constructor, tag, 'Object')}{`;
        } else if (t === '[object Arguments]') {
          braces[0] = '[Arguments] ['; braces[1] = ']'; keys = keys.filter(k => !/^\d+$/.test(k)); extra = 1; formatter = (c, v, r) => { const o = []; for (let j = 0; j < v.length; j++) o.push(fmtValue(c, v[j], r)); return o; };
          if (value.length === 0 && keys.length === 0) return '[Arguments] []';
        } else if (typeof value === 'function') {
          base = fnBase(value, constructor, tag);
          if (keys.length === 0) return base;
        } else if (t === '[object RegExp]') {
          base = RegExp.prototype.toString.call(value); const pf = prefixOf(constructor, tag, 'RegExp'); if (pf !== 'RegExp ') base = `${pf}${base}`; if (keys.length === 0) return base;
        } else if (t === '[object Date]') {
          base = isNaN(Date.prototype.getTime.call(value)) ? 'Invalid Date' : Date.prototype.toISOString.call(value); const pf = prefixOf(constructor, tag, 'Date'); if (pf !== 'Date ') base = `${pf}${base}`; if (keys.length === 0) return base;
        } else if (t === '[object Error]') {
          let nm = 'Error', msg = '';
          try { nm = S(value.name); msg = S(value.message); } catch { }
          if (constructor && constructor !== nm && nm === 'Error') nm = constructor;
          base = msg ? `${nm}: ${msg}` : nm;
          keys = keys.filter(k => k !== 'stack' && k !== 'message');
          if (rt > 0 || ctx.nested) base = `[${base}]`;
          if (keys.length === 0) return base;
        } else if (t === '[object Promise]') {
          braces[0] = `${prefixOf(constructor, tag, 'Promise')}{`; formatter = () => ['<pending>'];
        } else if (t === '[object WeakSet]' || t === '[object WeakMap]') {
          braces[0] = `${prefixOf(constructor, tag, t === '[object WeakSet]' ? 'WeakSet' : 'WeakMap')}{`; formatter = () => ['<items unknown>'];
        } else if (t === '[object Number]' || t === '[object String]' || t === '[object Boolean]' || t === '[object Symbol]' || t === '[object BigInt]') {
          let type = t.slice(8, -1), prim = value.valueOf();
          base = `[${type}`; if (type !== constructor) base += constructor === null ? ' (null prototype)' : ` (${constructor})`;
          base += `: ${fmtPrim({ breakLength: Infinity, indentationLvl: 0 }, prim)}]`;
          if (tag !== '' && tag !== constructor) base += ` [${tag}]`;
          if (type === 'String') keys = keys.filter(k => typeof k !== 'string' || !/^\d+$/.test(k));
          if (keys.length === 0) return base;
        } else {
          if (keys.length === 0) return `${prefixOf(constructor, tag, 'Object')}{}`;
          braces[0] = `${prefixOf(constructor, tag, 'Object')}{`;
        }
      }
      if (rt > ctx.depth) {
        let nm = prefixOf(constructor, tag, extra === 1 ? 'Array' : 'Object').slice(0, -1);
        if (constructor !== null) nm = `[${nm}]`;
        return nm;
      }
      rt += 1; ctx.seen.push(value); ctx.currentDepth = rt;
      let output;
      try {
        output = formatter(ctx, value, rt);
        for (i = 0; i < keys.length; i++) output.push(fmtProp(ctx, value, rt, keys[i], extra));
      } finally { ctx.seen.pop(); }
      if (ctx.circular !== undefined) {
        const index = ctx.circular.get(value);
        if (index !== undefined) { const ref = `<ref *${index}>`; base = base === '' ? ref : `${ref} ${base}`; }
      }
      const res = reduce(ctx, output, base, braces, extra, rt, value);
      return res;
    }
    function fmtArray(ctx, value, rt) {
      const len = value.length, outLen = M.min(M.max(0, 100), len), remaining = len - outLen, output = [];
      for (let i = 0; i < outLen; i++) {
        if (!hasOwn(value, i)) {   // buraco
          let j = i; while (j < len && !hasOwn(value, j)) j++;
          const empty = j - i; output.push(`<${empty} empty item${empty > 1 ? 's' : ''}>`); i = j - 1; if (output.length >= 100) break; continue;
        }
        output.push(fmtProp(ctx, value, rt, i, 1));
      }
      if (remaining > 0) output.push(`... ${remaining} more item${remaining > 1 ? 's' : ''}`);
      return output;
    }
    function fmtTyped(ctx, value, rt) {
      const len = value.length, n = M.min(100, len), output = [];
      for (let i = 0; i < n; i++) output.push(typeof value[i] === 'bigint' ? `${value[i]}n` : fmtNum(value[i]));
      if (len > n) output.push(`... ${len - n} more item${len - n > 1 ? 's' : ''}`);
      return output;
    }
    function fmtSet(ctx, value, rt) {
      const output = []; ctx.indentationLvl += 2;
      Set.prototype.forEach.call(value, v => { output.push(fmtValue(ctx, v, rt)); });
      ctx.indentationLvl -= 2; return output;
    }
    function fmtMap(ctx, value, rt) {
      const output = []; ctx.indentationLvl += 2;
      Map.prototype.forEach.call(value, (v, k) => { output.push(`${fmtValue(ctx, k, rt)} => ${fmtValue(ctx, v, rt)}`); });
      ctx.indentationLvl -= 2; return output;
    }
    function fmtProp(ctx, value, rt, key, type) {
      let name, str;
      const desc = ownDesc(value, key) || { value: value[key], enumerable: true };
      if (desc.value !== undefined) {
        ctx.indentationLvl += 2; str = fmtValue(ctx, desc.value, rt); ctx.indentationLvl -= 2;
      } else if (desc.get !== undefined) {
        str = desc.set !== undefined ? '[Getter/Setter]' : '[Getter]';
      } else if (desc.set !== undefined) str = '[Setter]';
      else str = 'undefined';
      if (type === 1) return str;
      if (typeof key === 'symbol') name = `[${symStr(key)}]`;
      else if (key === '__proto__') name = "['__proto__']";
      else if (desc.enumerable === false) name = `[${key.replace(/[\x00-\x1f\x27\x5c\x7f-\x9f]/g, c => c)}]`;
      else if (IDENT.test(key)) name = key;
      else name = strEscape(key);
      return `${name}: ${str}`;
    }
    function groupArray(ctx, output, value) {
      let total = 0, maxLen = 0, i = 0, outLen = output.length;
      if (100 < output.length) outLen--;
      const sep = 2, dataLen = new A(outLen);
      for (; i < outLen; i++) { const len = output[i].length; dataLen[i] = len; total += len + sep; if (maxLen < len) maxLen = len; }
      const actualMax = maxLen + sep;
      if (actualMax * 3 + ctx.indentationLvl < ctx.breakLength && (total / actualMax > 5 || maxLen <= 6)) {
        const averageBias = M.sqrt(actualMax - total / output.length), biasedMax = M.max(actualMax - 3 - averageBias, 1);
        const columns = M.min(M.round(M.sqrt(2.5 * biasedMax * outLen) / biasedMax), M.floor((ctx.breakLength - ctx.indentationLvl) / actualMax), ctx.compact * 4, 15);
        if (columns <= 1) return output;
        const tmp = [], maxLineLength = [];
        for (let i = 0; i < columns; i++) { let lineLength = 0; for (let j = i; j < output.length; j += columns) if (dataLen[j] > lineLength) lineLength = dataLen[j]; maxLineLength.push(lineLength + sep); }
        let order = 'padStart';
        if (value !== undefined) { for (let i = 0; i < output.length; i++) if (typeof value[i] !== 'number' && typeof value[i] !== 'bigint') { order = 'padEnd'; break; } }
        for (let i = 0; i < outLen; i += columns) {
          const max = M.min(i + columns, outLen); let str = '', j = i;
          for (; j < max - 1; j++) { const padding = maxLineLength[j - i] + output[j].length - dataLen[j]; str += S.prototype[order].call(`${output[j]}, `, padding, ' '); }
          if (order === 'padStart') { const padding = maxLineLength[j - i] + output[j].length - dataLen[j] - sep; str += S.prototype.padStart.call(output[j], padding, ' '); }
          else str += output[j];
          tmp.push(str);
        }
        if (100 < output.length) tmp.push(output[outLen]);
        output = tmp;
      }
      return output;
    }
    function reduce(ctx, output, base, braces, extra, rt, value) {
      const entries = output.length;
      if (extra === 1 && entries > 6) output = groupArray(ctx, output, value);
      if (ctx.currentDepth - rt < ctx.compact && entries === output.length) {
        const start = output.length + ctx.indentationLvl + braces[0].length + base.length + 10;
        let totalLength = output.length + start, ok = totalLength + output.length <= ctx.breakLength;
        if (ok) for (let i = 0; i < output.length; i++) { totalLength += output[i].length; if (totalLength > ctx.breakLength) { ok = false; break; } }
        if (ok && (base === '' || base.indexOf('\n') === -1)) {
          const joined = output.join(', ');
          if (joined.indexOf('\n') === -1) return `${base ? `${base} ` : ''}${braces[0]} ${joined} ${braces[1]}`;
        }
      }
      const ind = `\n${' '.repeat(ctx.indentationLvl)}`;
      return `${base ? `${base} ` : ''}${braces[0]}${ind}  ${output.join(`,${ind}  `)}${ind}${braces[1]}`;
    }
    function inspect(v, o) {
      const ctx = { seen: [], indentationLvl: 0, currentDepth: 0, depth: 2, breakLength: 80, compact: 3, circular: undefined, nested: false };
      if (o) for (const k of keysOf(o)) ctx[k] = o[k];
      return fmtValue(ctx, v, 0);
    }
    // util.format: %s %d %i %f %j %o %O %c %%
    function format(args) {
      const first = args[0]; let a = 0, str = '', join = '';
      if (typeof first === 'string') {
        if (args.length === 1) return first;
        let last = 0;
        for (let i = 0; i < first.length - 1; i++) {
          if (first.charCodeAt(i) === 37) {
            const c = first[i + 1];
            if (a + 1 !== args.length) {
              let tmp;
              switch (c) {
                case 's': { const v = args[++a]; tmp = typeof v === 'number' ? fmtNum(v) : typeof v === 'bigint' ? `${v}n` : (typeof v !== 'object' || v === null) ? S(v) : (typeof v.toString === 'function' && v.toString !== O.prototype.toString && !(v instanceof Error) && v.toString !== A.prototype.toString) ? S(v) : inspect(v, { depth: 0 }); break; }
                case 'j': try { tmp = JSON.stringify(args[++a]); } catch { tmp = '[Circular]'; } break;
                case 'd': { const v = args[++a]; tmp = typeof v === 'bigint' ? `${v}n` : typeof v === 'symbol' ? 'NaN' : fmtNum(N(v)); break; }
                case 'O': tmp = inspect(args[++a]); break;
                case 'o': tmp = inspect(args[++a], { depth: 4 }); break;
                case 'i': { const v = args[++a]; tmp = typeof v === 'bigint' ? `${v}n` : typeof v === 'symbol' ? 'NaN' : fmtNum(parseInt(v)); break; }
                case 'f': { const v = args[++a]; tmp = typeof v === 'symbol' ? 'NaN' : fmtNum(parseFloat(v)); break; }
                case 'c': a += 1; tmp = ''; break;
                case '%': str += first.slice(last, i); last = i + 1; continue;
                default: continue;
              }
              if (last !== i) str += first.slice(last, i);
              str += tmp; last = i + 2; i++;
            } else if (c === '%') { str += first.slice(last, i); last = i + 1; }
          }
        }
        if (last !== 0) { a++; join = ' '; if (last < first.length) str += first.slice(last); }
      }
      while (a < args.length) { const v = args[a]; str += join; str += typeof v === 'string' ? v : inspect(v); join = ' '; a++; }
      return str;
    }

    // ------------------------------------------------------------------ console
    let indent = '';
    const counts = {};
    const write = args => {
      let s = format(args);
      if (indent) s = indent + s.split('\n').join('\n' + indent);
      emit(s + '\n');
    };
    const con = {
      log: (...a) => write(a), info: (...a) => write(a), debug: (...a) => write(a), warn: (...a) => write(a), error: (...a) => write(a), trace: (...a) => write(a),
      group: (...a) => { if (a.length) write(a); indent += '  '; }, groupEnd: () => { indent = indent.slice(0, -2); },
      dir: v => write([typeof v === 'string' ? strEscape(v) : v]), table: (v) => write([v]),
      assert: (c, ...a) => { if (!c) write(['Assertion failed' + (a.length ? ': ' + format(a) : '')]); },
      count: (l = 'default') => { counts[l] = (counts[l] || 0) + 1; write([`${l}: ${counts[l]}`]); },
      countReset: (l = 'default') => { counts[l] = 0; },
      time: () => { }, timeEnd: () => { }, timeLog: () => { }
    };
    con.groupCollapsed = con.group;
    O.defineProperty(globalThis, 'console', { value: con, writable: true, configurable: true, enumerable: false });

    // ------------------------------------------------------------------ relógio virtual
    let now = 0, seq = 0, nextId = 1; const timers = new Map();
    const realDate = Date, t0 = realDate.now();
    const addTimer = (fn, ms, args, every) => {
      if (typeof fn !== 'function') throw new TypeError('The "callback" argument must be of type function. Received ' + inspect(fn));
      ms = N(ms); if (!(ms >= 1)) ms = 1; if (ms > 2147483647) ms = 1; ms = M.floor(ms);
      const id = nextId++; timers.set(id, { id, fn, args, at: now + ms, seq: seq++, every: every ? ms : 0 }); return id;
    };
    const tm = {
      setTimeout: (fn, ms, ...a) => addTimer(fn, ms, a, false),
      setInterval: (fn, ms, ...a) => addTimer(fn, ms, a, true),
      setImmediate: (fn, ...a) => { const id = addTimer(fn, 0, a, false); timers.get(id).at = now; return id; },
      clearTimeout: id => { timers.delete(id); }, clearInterval: id => { timers.delete(id); }, clearImmediate: id => { timers.delete(id); },
      queueMicrotask: fn => { Promise.resolve().then(fn); }
    };
    for (const k of keysOf(tm)) O.defineProperty(globalThis, k, { value: tm[k], writable: true, configurable: true, enumerable: false });
    // Date.now() e new Date() acompanham o relógio virtual (a partir da hora real do início)
    const D = realDate;
    function FakeDate(...a) {
      if (!new.target) return new D(t0 + now).toString();
      return a.length ? new D(...a) : new D(t0 + now);
    }
    O.defineProperty(FakeDate, 'name', { value: 'Date' });
    FakeDate.prototype = D.prototype; O.setPrototypeOf(FakeDate, D);
    FakeDate.now = () => t0 + now;
    O.defineProperty(D.prototype, 'constructor', { value: FakeDate, writable: true, configurable: true, enumerable: false });
    O.defineProperty(globalThis, 'Date', { value: FakeDate, writable: true, configurable: true, enumerable: false });
    // executa o próximo temporizador; devolve false quando não há mais nenhum
    let fired = 0;
    function step() {
      let best = null;
      for (const t of timers.values()) if (best === null || t.at < best.at || (t.at === best.at && t.seq < best.seq)) best = t;
      if (best === null) return false;
      if (best.at > now) now = best.at;
      if (++fired > 5000 || now > 600000) { timers.clear(); throw new Error('Tempo esgotado: o programa continua agendando tarefas sem parar (setInterval sem clearInterval?)'); }
      if (best.every) { best.at = now + best.every; best.seq = seq++; } else timers.delete(best.id);
      best.fn(...best.args);
      return true;
    }
    function errText(e) {
      try {
        if (e !== null && typeof e === 'object' && typeof e.name === 'string') { const m = S(e.message); return m ? `${e.name}: ${m}` : e.name; }
        return 'Uncaught ' + inspect(e);
      } catch { return 'Erro'; }
    }
    return { step, errText, inspect, format };
  }
  return { BOOT, src: '(' + BOOT.toString() + ')' };
});
