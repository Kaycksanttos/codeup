#!/usr/bin/env node
// Executa o código JavaScript de um aluno de forma restrita. Uso: node tools/jsrun.js  (JSON na entrada: {"pre": "...", "code": "..."}; JSON na saída: {"ok", "out", "err"})
// Camadas de proteção (além do processo separado, ambiente vazio, diretório temporário, tempo limite e fila do jsrunner.js):
//   1) o código roda num contexto do módulo vm SEM require/process/fs, sem eval nem Function de texto e sem nenhum objeto do servidor (só recebe texto);
//   2) tempo limite dentro do contexto (laços infinitos) e limite de memória;  3) quando o node permite, o modelo de permissões tira fs/processos/threads.
const vm = require('vm'), path = require('path');
const JSRUN = require(path.join(__dirname, '..', 'public', 'jsrun.js'));
const CAP = 64 * 1024, LIMIT_MS = 2500;

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', d => { input += d; });
process.stdin.on('end', async () => {
  let req; try { req = JSON.parse(input); } catch { req = {}; }
  const r = await run(String(req.pre || ''), String(req.code || ''));
  process.stdout.write(JSON.stringify(r), () => process.exit(0));
});

async function run(pre, code) {
  let out = '', err = '', big = false;
  const emit = s => { if (out.length < CAP) out += s; else big = true; };
  const ctx = vm.createContext(Object.create(null), { codeGeneration: { strings: false, wasm: false }, microtaskMode: 'afterEvaluate' });
  let api;
  try { api = vm.runInContext(JSRUN.src, ctx)(emit); } catch (e) { return { ok: false, out: '', err: 'BOOT ' + e.message }; }
  const exec = (src, name) => new vm.Script(src, { filename: name }).runInContext(ctx, { timeout: LIMIT_MS });
  const safe = f => { try { return f(); } catch { return 'Erro'; } };
  const failed = e => { err = e && e.code === 'ERR_SCRIPT_EXECUTION_TIMEOUT' ? 'Tempo esgotado: o código demorou demais (laço infinito?)' : safe(() => api.errText(e)); };
  process.on('unhandledRejection', reason => { if (!err) err = safe(() => api.errText(reason)); });
  try {
    if (pre.trim()) exec(pre, 'preambulo.js');
    try { exec(code, 'main.js'); }
    catch (e) {
      // "await" no nível de cima do código: roda de novo dentro de uma função async
      if (e && e.name === 'SyntaxError' && /await|async/i.test(String(e.message))) exec('(async () => {\n' + code + '\n})().catch(e => { throw e; })', 'main.js');
      else throw e;
    }
  } catch (e) { failed(e); }
  // roda os temporizadores (relógio virtual) até acabar; cada passo tem o seu tempo limite
  const STEP = '__s' + Math.random().toString(36).slice(2); Object.defineProperty(ctx, STEP, { value: api.step, enumerable: false });
  if (!err) {
    for (let i = 0; i < 6000 && !err; i++) {
      await new Promise(r => setImmediate(r));
      let more = false;
      try { more = vm.runInContext(STEP + '()', ctx, { timeout: LIMIT_MS }); } catch (e) { failed(e); break; }
      if (!more) break;
    }
    await new Promise(r => setImmediate(r));
  }
  if (big) err = err || 'OUTPUT_TOO_BIG';
  return { ok: !err, out: out.slice(0, CAP), err };
}
