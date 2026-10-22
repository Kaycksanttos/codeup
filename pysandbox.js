// Corrige Python NO SERVIDOR: roda o código do aluno num processo separado e restrito (tools/pyrun.py)
// e devolve a saída. Assim o resultado não depende do que o navegador diz ter impresso.
const { spawn, spawnSync } = require('child_process'), path = require('path'), fs = require('fs'), os = require('os');
const RUNNER = path.join(__dirname, 'tools', 'pyrun.py');
const PY = process.env.PYTHON_BIN || 'python3';
const MAXQ = +(process.env.PY_MAX_QUEUE || 40), MAX = +(process.env.PY_MAX_PARALLEL || 3), TIMEOUT = +(process.env.PY_TIMEOUT_MS || 8000), CAP = 64 * 1024;
let active = 0; const waiting = [];

function runNow(pre, code) {
  return new Promise(resolve => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pyrun-'));
    const p = spawn(PY, ['-I', RUNNER], { cwd: dir, env: { PATH: '/usr/local/bin:/usr/bin:/bin', OPENBLAS_NUM_THREADS: '1', OMP_NUM_THREADS: '1', MKL_NUM_THREADS: '1', PYTHONHASHSEED: '0', HOME: '/nonexistent', LANG: 'C.UTF-8' }, stdio: ['pipe', 'pipe', 'pipe'] });
    let out = '', err = '', done = false;
    const end = r => { if (done) return; done = true; clearTimeout(t); try { p.kill('SIGKILL'); } catch { } fs.rm(dir, { recursive: true, force: true }, () => { }); resolve(r); };
    const t = setTimeout(() => end({ ok: false, out, err: 'TIMEOUT' }), TIMEOUT);
    p.stdout.on('data', d => { out += d; if (out.length > CAP) end({ ok: false, out: out.slice(0, CAP), err: 'OUTPUT_TOO_BIG' }); });
    p.stderr.on('data', d => { if (err.length < 4000) err += d; });
    p.on('error', e => end({ ok: false, out, err: 'SPAWN:' + e.message }));
    p.on('close', c => end({ ok: c === 0, out, err }));
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
// verifica se há python3 utilizável (na inicialização do servidor)
function available() {
  if (process.env.PY_SERVER_CHECK === '0') return false;
  const r = spawnSync(PY, ['-I', '-c', 'import resource'], { timeout: 10000 });
  return r.status === 0;
}
module.exports = { run, available };
