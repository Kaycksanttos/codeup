// Corrige JavaScript NO SERVIDOR: roda o código do aluno num processo separado e restrito (tools/jsrun.js) e devolve a saída do console.
// Mesma ideia do pysandbox.js: o resultado não depende do que o navegador diz ter impresso.
const { spawn, spawnSync } = require('child_process'), path = require('path'), fs = require('fs'), os = require('os');
const RUNNER = path.join(__dirname, 'tools', 'jsrun.js');
const MAXQ = +(process.env.JS_MAX_QUEUE || 40), MAX = +(process.env.JS_MAX_PARALLEL || 3), TIMEOUT = +(process.env.JS_TIMEOUT_MS || 6000), CAP = 64 * 1024;
let active = 0; const waiting = [];

// opções do node que tiram do processo o acesso a arquivos, processos filhos e threads (o nome da opção muda de versão para versão; testamos qual funciona)
let FLAGS = null;
function flags() {
  if (FLAGS) return FLAGS;
  const base = ['--max-old-space-size=160', '--disallow-code-generation-from-strings'];
  for (const perm of [['--permission', '--allow-fs-read=' + RUNNER], ['--experimental-permission', '--allow-fs-read=' + RUNNER], ['--experimental-permission', '--allow-fs-read=*'], []]) {
    const r = spawnSync(process.execPath, [...base, ...perm, RUNNER], { input: JSON.stringify({ pre: '', code: 'console.log("ok")' }), encoding: 'utf8', timeout: 8000, env: { PATH: process.env.PATH } });
    try { if (r.status === 0 && JSON.parse(r.stdout).out === 'ok\n') { FLAGS = [...base, ...perm]; return FLAGS; } } catch { }
  }
  FLAGS = base; return FLAGS;
}

function runNow(pre, code) {
  return new Promise(resolve => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'jsrun-'));
    const p = spawn(process.execPath, [...flags(), RUNNER], { cwd: dir, env: { PATH: '/usr/local/bin:/usr/bin:/bin', LANG: 'C.UTF-8', HOME: '/nonexistent' }, stdio: ['pipe', 'pipe', 'pipe'] });
    let buf = '', done = false;
    const end = r => { if (done) return; done = true; clearTimeout(t); try { p.kill('SIGKILL'); } catch { } fs.rm(dir, { recursive: true, force: true }, () => { }); resolve(r); };
    const t = setTimeout(() => end({ ok: false, out: '', err: 'TIMEOUT' }), TIMEOUT);
    p.stdout.on('data', d => { buf += d; if (buf.length > CAP * 2) end({ ok: false, out: '', err: 'OUTPUT_TOO_BIG' }); });
    p.stderr.on('data', () => { });
    p.on('error', e => end({ ok: false, out: '', err: 'SPAWN:' + e.message }));
    p.on('close', () => { try { const r = JSON.parse(buf); end({ ok: !!r.ok, out: String(r.out || ''), err: r.err || '' }); } catch { end({ ok: false, out: '', err: 'CRASH' }); } });
    p.stdin.on('error', () => { });
    p.stdin.end(JSON.stringify({ pre, code }));
  });
}
function run(pre, code) {
  return new Promise(resolve => {
    const go = () => { active++; runNow(pre, code).then(r => { active--; const n = waiting.shift(); if (n) n(); resolve(r); }); };
    if (active < MAX) return go();
    if (waiting.length >= MAXQ) return resolve({ ok: false, out: '', err: 'BUSY' });   // fila cheia: recusa em vez de acumular
    waiting.push(go);
  });
}
// versão síncrona, só para as ferramentas de conferência (build-content, check-ler): roda o mesmo executor
function runSync(pre, code) {
  const r = spawnSync(process.execPath, [...flags(), RUNNER], { input: JSON.stringify({ pre, code }), encoding: 'utf8', timeout: TIMEOUT + 4000, cwd: os.tmpdir(), env: { PATH: process.env.PATH } });
  try { const j = JSON.parse(r.stdout); return { ok: !!j.ok, out: String(j.out || ''), err: j.err || '' }; } catch { return { ok: false, out: '', err: 'CRASH ' + (r.stderr || '').slice(0, 200) }; }
}
function available() { if (process.env.JS_SERVER_CHECK === '0') return false; try { return runSync('', 'console.log(1)').out === '1\n'; } catch { return false; } }
module.exports = { run, runSync, available, flags };
