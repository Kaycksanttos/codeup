# Executa o código Python de um aluno de forma restrita. Uso: python3 -I tools/pyrun.py  (JSON na entrada: {"pre": "...", "code": "..."})
# Camadas de proteção (além do processo separado, ambiente vazio, diretório temporário e tempo limite do pysandbox.js):
#   1) limites de CPU, memória e arquivos (resource);  2) "audit hook" que bloqueia rede, subprocessos, ctypes,
#   escrita em arquivos e leitura fora das pastas do próprio Python;  3) o preâmbulo da lição (dados de exemplo) roda antes do hook.
import sys, os, json, resource

req = json.loads(sys.stdin.read())
pre, code = req.get('pre') or '', req.get('code') or ''

resource.setrlimit(resource.RLIMIT_CPU, (5, 5))
resource.setrlimit(resource.RLIMIT_AS, (2 << 30, 2 << 30))
resource.setrlimit(resource.RLIMIT_FSIZE, (0, 0))
resource.setrlimit(resource.RLIMIT_NOFILE, (64, 64))
resource.setrlimit(resource.RLIMIT_CORE, (0, 0))

g = {'__name__': '__main__'}
if pre.strip():
    exec(compile(pre, '<preambulo>', 'exec'), g)       # dados de exemplo da lição (código nosso, confiável)

# pré-carrega o que o aluno costuma importar, para o hook poder ser bem restrito
if 'import' in code:
    for m in ('math', 'statistics', 'random', 'datetime', 'collections', 'itertools', 'functools', 're', 'json', 'csv', 'io', 'string', 'decimal', 'fractions', 'operator', 'textwrap'):
        try: __import__(m)
        except Exception: pass
    if 'pandas' in (pre + code) or 'numpy' in (pre + code):
        try: import numpy, pandas
        except Exception: pass

ALLOWED = [os.path.realpath(p) for p in sys.path if p and os.path.exists(p)] + [os.path.realpath(sys.prefix)]
ALLOWED += [p for p in ('/usr/share/zoneinfo', '/etc/localtime', '/dev/urandom', '/dev/null') if os.path.exists(p)]
ALLOWED = tuple(a.rstrip('/') for a in ALLOWED if a not in ('/', ''))
BLOCK_PREFIX = ('socket.', 'ctypes.', 'subprocess.', 'shutil.', 'urllib.', 'http.client.', 'ftplib.', 'smtplib.', 'telnetlib.', 'webbrowser.', 'pty.', 'glob.', 'sqlite3.',
                'os.exec', 'os.spawn', 'os.fork', 'os.posix_spawn', 'os.system', 'os.kill', 'os.chdir', 'os.chmod', 'os.chown', 'os.mkdir', 'os.remove', 'os.rename', 'os.rmdir',
                'os.symlink', 'os.link', 'os.truncate', 'os.listdir', 'os.scandir', 'os.putenv', 'os.unsetenv', 'os.setuid', 'os.setgid', 'os.mkfifo', 'os.mknod', 'os.utime',
                'resource.', 'signal.', 'mmap.', 'sys.settrace', 'sys.setprofile', 'code.', 'ensurepip')
BLOCK_IMPORT = {'ctypes', '_ctypes', 'subprocess', '_posixsubprocess', 'socket', '_socket', 'multiprocessing', '_multiprocessing', 'pty', 'shutil', 'resource', 'signal',
                'sqlite3', '_sqlite3', 'mmap', 'fcntl', 'ssl', '_ssl', 'urllib', 'http', 'ftplib', 'smtplib', 'pdb', 'webbrowser', 'pip', 'ensurepip'}
WRITE = os.O_WRONLY | os.O_RDWR | os.O_CREAT | os.O_APPEND | os.O_TRUNC
_realpath = os.path.realpath
_started = [False]

def hook(event, args):
    if not _started[0]:
        return
    if event == 'exec' or event == 'compile':
        return                                   # o próprio código do aluno é compilado/executado; o que importa é o que ele FAZ
    if event == 'import':
        name = str(args[0]).split('.')[0]
        if name in BLOCK_IMPORT or str(args[0]) in BLOCK_IMPORT:
            raise PermissionError('import bloqueado: ' + str(args[0]))
        return
    if event == 'open':
        path, mode, flags = args[0], args[1], args[2]
        if isinstance(path, int): raise PermissionError('abrir arquivo bloqueado')
        if isinstance(path, bytes): path = path.decode('utf8', 'replace')
        if flags & WRITE or (mode and any(c in str(mode) for c in 'wax+')):
            raise PermissionError('escrita em arquivo bloqueada')
        rp = _realpath(str(path))
        if rp.startswith(ALLOWED) or rp == '/dev/null':
            return
        raise PermissionError('leitura de arquivo bloqueada')
    if event.startswith(BLOCK_PREFIX):
        raise PermissionError('operação bloqueada: ' + event)

sys.addaudithook(hook)
_started[0] = True
exec(compile(code, '<codigo>', 'exec'), g)
sys.stdout.flush()
