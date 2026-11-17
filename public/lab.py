# ============================================================================================================
# CodeUp: o "computador de treino" das lições de Automações (Python).
#
# Automação mexe com arquivos, pastas, relógio, e-mail e internet. Nada disso pode tocar o computador de verdade,
# e o resultado precisa ser SEMPRE o mesmo para o corretor poder conferir. Então, antes de cada lição, este arquivo monta
# um computador de mentira: um disco virtual na memória, um relógio parado em 14/03/2025 09:00 (que só anda com time.sleep),
# um servidor de e-mail e uma "internet" de mentira. O código do aluno é o código de verdade (open, os, pathlib, shutil, glob,
# datetime, requests, smtplib...): ele só não enxerga o computador real.
#
# Este arquivo é a única fonte: o servidor (content/lab.js), o navegador (/lab.py) e os testes usam o mesmo texto.
# Tudo roda ANTES do código do aluno e desfaz o que mudou na próxima execução (sys._codeup_undo).
# ============================================================================================================
import sys as _sys, io as _io, builtins as _bi, types as _ty, posixpath as _px, os as _os, time as _tm, codecs as _cd

for _m in ('json', 'csv', 're', 'string', 'textwrap', 'collections', 'itertools', 'functools', 'random', 'hashlib', 'hmac', 'base64', 'secrets', 'uuid', 'difflib',
           'shlex', 'configparser', 'sched', 'argparse', 'logging', 'html', 'html.parser', 'math', 'statistics', 'decimal', 'fractions', 'operator', 'enum',
           'dataclasses', 'typing', 'contextlib', 'traceback', 'copy', 'pprint', 'calendar', 'fnmatch', 'glob', 'shutil', 'pathlib', 'zipfile', 'gzip', 'datetime',
           'urllib.parse', 'http', 'email.message', 'email.utils', 'email.mime.text', 'email.mime.multipart', 'xml.etree.ElementTree', 'unicodedata', 'zlib'):
    try: __import__(_m)
    except Exception: pass
del _m
import logging as _lg, datetime as _dtr, glob as _glr, shutil as _shr, pathlib as _plr, zipfile as _zfr, fnmatch as _fn, json as _js, sched as _sch, urllib.parse as _up

if getattr(_sys, '_codeup_undo', None): _sys._codeup_undo()          # desfaz o que a execução anterior mudou (no navegador o Python continua vivo)
globals().setdefault('__name__', '__main__')
if __name__ != '__main__': __name__ = '__main__'

_NOW0 = 1741942800.0                                    # sexta-feira, 14/03/2025, 09:00:00 (UTC)
_S = {'f': {}, 'd': {'/', '/treino', '/tmp', '/home', '/home/aluno', '/var', '/var/log', '/dados'}, 'cwd': '/treino', 'seq': 0, 'clk': _NOW0, 'seed': [], 'rotas': {}, 'contas': {'robo@exemplo.com': 'senha123'}}
_SWAP = ('os', 'os.path', 'shutil', 'glob', 'pathlib', 'datetime', 'zipfile', 'smtplib', 'requests', 'requests.exceptions', 'urllib.request', 'urllib.error')
_UP = _sys.modules['urllib']
_R = {'open': _bi.open, 'io_open': _io.open, 'argv': list(_sys.argv), 'mods': {n: _sys.modules.get(n) for n in _SWAP}, 'conv': _lg.Formatter.converter,
      'fho': getattr(_lg.FileHandler, '_builtin_open', None), 'schd': _sch.scheduler.__init__.__defaults__, 'up': {n: getattr(_UP, n, None) for n in ('request', 'error')},
      'tm': {k: getattr(_tm, k) for k in ('sleep', 'time', 'time_ns', 'monotonic', 'perf_counter', 'localtime', 'gmtime', 'strftime')}}

# ---------------------------------------------------------------- o disco virtual
def _fsp(p):
    if hasattr(p, '__fspath__'): p = p.__fspath__()
    if isinstance(p, bytes): p = p.decode('utf-8', 'replace')
    if not isinstance(p, str): raise TypeError('expected str, bytes or os.PathLike object, not ' + type(p).__name__)
    return p

def _ap(p):                                            # caminho absoluto e limpo
    s = _fsp(p)
    if s == '': raise FileNotFoundError(2, 'No such file or directory', '')
    if not s.startswith('/'): s = _S['cwd'] + '/' + s
    s = _px.normpath(s)
    return '/' + s.lstrip('/') if s.startswith('//') else s

_ROOTS = ('/treino', '/home', '/tmp', '/var', '/dados', '/data', '/mnt', '/srv', '/opt', '/backup', '/arquivos')
def _virt(p):                                          # o caminho é do disco virtual? (relativo ou dentro das pastas do treino)
    if isinstance(p, int): return None
    try: s = _fsp(p)
    except TypeError: return None
    if not s.startswith('/'): return _ap(s)
    a = _ap(s)
    return a if a == '/' or any(a == r or a.startswith(r + '/') for r in _ROOTS) else None

def _isdir(a): return a in _S['d']
def _isfile(a): return a in _S['f']
def _kids(a):
    pre = a.rstrip('/') + '/'; out = set()
    for k in list(_S['f']) + list(_S['d']):
        if k != a and k.startswith(pre) and '/' not in k[len(pre):]: out.add(k[len(pre):])
    return sorted(out)
def _stamp():
    _S['seq'] += 1
    return _S['clk'] + _S['seq'] * 1e-3
def _put(a, data, mt=None):
    _S['f'][a] = [bytes(data), _stamp() if mt is None else mt]
def _need_parent(a, raw):
    if _px.dirname(a) not in _S['d']: raise FileNotFoundError(2, 'No such file or directory', _fsp(raw))
def _mkpath(a):
    cur = ''
    for p in a.strip('/').split('/'):
        cur += '/' + p
        if cur in _S['f']: raise NotADirectoryError(20, 'Not a directory', cur)
        _S['d'].add(cur)

# ---- arquivos abertos (texto e binário): gravam no disco virtual ao fechar ou ao dar flush
class _VT(_io.StringIO):
    def __init__(s, init, a, name, mode, r, w, ap, enc, errs, nl):
        _io.StringIO.__init__(s, init, newline='')
        if ap: s.seek(0, 2)
        s._a, s.name, s.mode, s._r, s._w, s._enc, s._errs, s._nl = a, name, mode, r, w, enc, errs, nl
    def readable(s): return s._r
    def writable(s): return s._w
    def _cr(s):
        if not s._r and not s.closed: raise _io.UnsupportedOperation('not readable')
    def _cw(s):
        if not s._w and not s.closed: raise _io.UnsupportedOperation('not writable')
    def read(s, *a): s._cr(); return _io.StringIO.read(s, *a)
    def readline(s, *a): s._cr(); return _io.StringIO.readline(s, *a)
    def readlines(s, *a): s._cr(); return _io.StringIO.readlines(s, *a)
    def __next__(s): s._cr(); return _io.StringIO.__next__(s)
    def write(s, t): s._cw(); return _io.StringIO.write(s, t)
    def writelines(s, ls): s._cw(); return _io.StringIO.writelines(s, ls)
    def truncate(s, *a): s._cw(); return _io.StringIO.truncate(s, *a)
    def _sync(s):
        if s._w and not s.closed and _px.dirname(s._a) in _S['d']:
            t = s.getvalue()
            if s._nl in ('\r\n', '\r'): t = t.replace('\n', s._nl)
            _put(s._a, t.encode(s._enc, s._errs))
    def flush(s): s._sync(); return _io.StringIO.flush(s)
    def close(s):
        if not s.closed: s._sync()
        return _io.StringIO.close(s)
    def __repr__(s): return "<_io.TextIOWrapper name=%r mode=%r encoding='%s'>" % (s.name, s.mode, s._enc.upper())
_VT.__name__ = _VT.__qualname__ = 'TextIOWrapper'; _VT.__module__ = '_io'

class _VB(_io.BytesIO):
    def __init__(s, init, a, name, mode, r, w, ap):
        _io.BytesIO.__init__(s, init)
        if ap: s.seek(0, 2)
        s._a, s.name, s.mode, s._r, s._w = a, name, mode, r, w
    def readable(s): return s._r
    def writable(s): return s._w
    def _cr(s):
        if not s._r and not s.closed: raise _io.UnsupportedOperation('read')
    def _cw(s):
        if not s._w and not s.closed: raise _io.UnsupportedOperation('write')
    def read(s, *a): s._cr(); return _io.BytesIO.read(s, *a)
    def read1(s, *a): s._cr(); return _io.BytesIO.read1(s, *a)
    def readinto(s, b): s._cr(); return _io.BytesIO.readinto(s, b)
    def readline(s, *a): s._cr(); return _io.BytesIO.readline(s, *a)
    def readlines(s, *a): s._cr(); return _io.BytesIO.readlines(s, *a)
    def __next__(s): s._cr(); return _io.BytesIO.__next__(s)
    def write(s, b): s._cw(); return _io.BytesIO.write(s, b)
    def writelines(s, ls): s._cw(); return _io.BytesIO.writelines(s, ls)
    def truncate(s, *a): s._cw(); return _io.BytesIO.truncate(s, *a)
    def _sync(s):
        if s._w and not s.closed and _px.dirname(s._a) in _S['d']: _put(s._a, s.getvalue())
    def flush(s): s._sync(); return _io.BytesIO.flush(s)
    def close(s):
        if not s.closed: s._sync()
        return _io.BytesIO.close(s)
    def __repr__(s): return '<_io.BufferedRandom name=%r>' % (s.name,)
_VB.__name__ = _VB.__qualname__ = 'BufferedRandom'; _VB.__module__ = '_io'

def _vopen(raw, a, mode, enc, errs, nl):
    m = str(mode); name = _fsp(raw)
    if set(m) - set('rwxabt+U') or len(set(m)) != len(m): raise ValueError('invalid mode: %r' % mode)
    kinds = [c for c in 'rwxa' if c in m]
    if len(kinds) != 1: raise ValueError('must have exactly one of create/read/write/append mode')
    k, plus, binary = kinds[0], '+' in m, 'b' in m
    if binary and 't' in m: raise ValueError("can't have text and binary mode at once")
    if binary and enc is not None: raise ValueError("binary mode doesn't take an encoding argument")
    if a in _S['d']: raise IsADirectoryError(21, 'Is a directory', name)
    ex = a in _S['f']
    if k == 'r' and not ex: raise FileNotFoundError(2, 'No such file or directory', name)
    if k == 'x' and ex: raise FileExistsError(17, 'File exists', name)
    if k != 'r':
        _need_parent(a, raw)
        if k in 'wx' or not ex: _put(a, b'')
    data = _S['f'][a][0] if k in 'ra' and ex else b''
    r, w = k == 'r' or plus, k != 'r' or plus
    if binary: return _VB(data, a, name, m, r, w, k == 'a')
    enc = 'utf-8' if enc in (None, 'locale') else enc; _cd.lookup(enc)
    txt = data.decode(enc, errs or 'strict')
    if nl is None: txt = txt.replace('\r\n', '\n').replace('\r', '\n')
    return _VT(txt, a, name, m, r, w, k == 'a', enc, errs or 'strict', nl)

def _open(file, mode='r', buffering=-1, encoding=None, errors=None, newline=None, closefd=True, opener=None):
    a = _virt(file)
    if a is None: return _R['open'](file, mode, buffering, encoding, errors, newline, closefd, opener)
    return _vopen(file, a, mode, encoding, errors, newline)

# ---------------------------------------------------------------- módulo os
class _Fallback(_ty.ModuleType):                       # módulo de mentira: o que não foi trocado vem do módulo de verdade
    def __init__(s, name, real): _ty.ModuleType.__init__(s, name); s._real = real
    def __getattr__(s, n):
        if n.startswith('__') and n.endswith('__'): raise AttributeError(n)
        return getattr(s._real, n)
    def __dir__(s): return sorted(set(dir(s._real)) | set(s.__dict__))

class _Stat:
    def __init__(s, size, mt, d):
        s.st_size, s.st_mtime, s.st_atime, s.st_ctime = size, mt, mt, mt
        s.st_mtime_ns = s.st_atime_ns = s.st_ctime_ns = int(mt * 1e9); s.st_mode = 0o40755 if d else 0o100644; s.st_nlink = 1; s.st_uid = s.st_gid = 1000
    def __repr__(s): return 'os.stat_result(st_mode=%d, st_size=%d, st_mtime=%s)' % (s.st_mode, s.st_size, s.st_mtime)

def _exists(a): return a in _S['f'] or a in _S['d']
def _stat(p, *a, **k):
    ab = _ap(p)
    if ab in _S['f']: return _Stat(len(_S['f'][ab][0]), _S['f'][ab][1], False)
    if ab in _S['d']: return _Stat(4096, _NOW0, True)
    raise FileNotFoundError(2, 'No such file or directory', _fsp(p))
def _listdir(path='.'):
    a = _ap(path)
    if a not in _S['d']:
        raise NotADirectoryError(20, 'Not a directory', _fsp(path)) if a in _S['f'] else FileNotFoundError(2, 'No such file or directory', _fsp(path))
    return _kids(a)
def _mkdir(path, mode=0o777, *, dir_fd=None):
    a = _ap(path)
    if _exists(a): raise FileExistsError(17, 'File exists', _fsp(path))
    _need_parent(a, path); _S['d'].add(a)
def _makedirs(name, mode=0o777, exist_ok=False):
    a = _ap(name)
    if a in _S['d']:
        if exist_ok: return
        raise FileExistsError(17, 'File exists', _fsp(name))
    if a in _S['f']: raise FileExistsError(17, 'File exists', _fsp(name))
    _mkpath(a)
def _remove(path, *, dir_fd=None):
    a = _ap(path)
    if a in _S['d']: raise IsADirectoryError(21, 'Is a directory', _fsp(path))
    if a not in _S['f']: raise FileNotFoundError(2, 'No such file or directory', _fsp(path))
    del _S['f'][a]
def _rmdir(path, *, dir_fd=None):
    a = _ap(path)
    if a in _S['f']: raise NotADirectoryError(20, 'Not a directory', _fsp(path))
    if a not in _S['d']: raise FileNotFoundError(2, 'No such file or directory', _fsp(path))
    if _kids(a): raise OSError(39, 'Directory not empty', _fsp(path))
    _S['d'].discard(a)
def _rename(src, dst, *, src_dir_fd=None, dst_dir_fd=None):
    s, d, x, y = _ap(src), _ap(dst), _fsp(src), _fsp(dst)
    if not _exists(s): raise FileNotFoundError(2, 'No such file or directory', x, None, y)
    if _px.dirname(d) not in _S['d']: raise FileNotFoundError(2, 'No such file or directory', x, None, y)
    if s == d: return
    if s in _S['f']:
        if d in _S['d']: raise IsADirectoryError(21, 'Is a directory', x, None, y)
        _S['f'][d] = _S['f'].pop(s)
    else:
        if d in _S['f']: raise NotADirectoryError(20, 'Not a directory', x, None, y)
        if d.startswith(s + '/'): raise OSError(22, 'Invalid argument', x, None, y)
        if d in _S['d'] and _kids(d): raise OSError(39, 'Directory not empty', x, None, y)
        pre = s + '/'
        for k in [k for k in _S['f'] if k.startswith(pre)]: _S['f'][d + k[len(s):]] = _S['f'].pop(k)
        for k in [k for k in _S['d'] if k == s or k.startswith(pre)]: _S['d'].discard(k); _S['d'].add(d + k[len(s):])
def _walk(top, topdown=True, onerror=None, followlinks=False):
    a = _ap(top)
    if a not in _S['d']: return
    ns = _kids(a); j = lambda n: a.rstrip('/') + '/' + n
    ds, fs = [n for n in ns if j(n) in _S['d']], [n for n in ns if j(n) in _S['f']]
    t = _fsp(top)
    if topdown:
        yield t, ds, fs
        for d in ds: yield from _walk(_px.join(t, d), topdown)
    else:
        for d in ds: yield from _walk(_px.join(t, d), topdown)
        yield t, ds, fs
class _Entry:
    def __init__(s, base, n): s.name = n; s.path = _px.join(base, n); s._a = _ap(s.path)
    def is_file(s, *, follow_symlinks=True): return s._a in _S['f']
    def is_dir(s, *, follow_symlinks=True): return s._a in _S['d']
    def is_symlink(s): return False
    def stat(s, *, follow_symlinks=True): return _stat(s.path)
    def __repr__(s): return '<DirEntry %r>' % s.name
class _Scan:
    def __init__(s, path): s._it = iter([_Entry(_fsp(path), n) for n in _listdir(path)])
    def __iter__(s): return s
    def __next__(s): return next(s._it)
    def __enter__(s): return s
    def __exit__(s, *a): return None
    def close(s): return None
def _blocked(*a, **k): raise PermissionError(1, 'Operation not permitted: o computador de treino não executa programas nem mexe no sistema')
def _chdir(p):
    a = _ap(p)
    if a not in _S['d']: raise NotADirectoryError(20, 'Not a directory', _fsp(p)) if a in _S['f'] else FileNotFoundError(2, 'No such file or directory', _fsp(p))
    _S['cwd'] = a
class _Env(dict):
    def copy(s): return dict(s)
def _getenv(k, default=None): return _O.environ.get(k, default)

_O = _Fallback('os', _os)
for _n, _f in dict(listdir=_listdir, mkdir=_mkdir, makedirs=_makedirs, remove=_remove, unlink=_remove, rmdir=_rmdir, rename=_rename, replace=_rename, stat=_stat, walk=_walk,
                   scandir=_Scan, getcwd=lambda: _S['cwd'], chdir=_chdir, getenv=_getenv, getlogin=lambda: 'aluno', cpu_count=lambda: 4, getpid=lambda: 4242,
                   system=_blocked, popen=_blocked, kill=_blocked, fork=_blocked, startfile=_blocked, execv=_blocked, execl=_blocked, execvp=_blocked, spawnl=_blocked, spawnv=_blocked,
                   removedirs=lambda p: _rmdir(p), lstat=_stat, chmod=lambda *a, **k: None, utime=lambda *a, **k: None).items(): setattr(_O, _n, _f)
del _n, _f
_O.environ = _Env({'HOME': '/home/aluno', 'USER': 'aluno', 'LANG': 'pt_BR.UTF-8', 'PATH': '/usr/local/bin:/usr/bin:/bin', 'SHELL': '/bin/bash'})
_O.error = OSError

def _P_exists(p):
    try: return _exists(_ap(p))
    except (OSError, TypeError, ValueError): return False
def _P_isfile(p):
    try: return _ap(p) in _S['f']
    except (OSError, TypeError, ValueError): return False
def _P_isdir(p):
    try: return _ap(p) in _S['d']
    except (OSError, TypeError, ValueError): return False
def _P_size(p): return _stat(p).st_size
def _P_mtime(p): return _stat(p).st_mtime
def _P_rel(p, start=None): return _px.relpath(_ap(p), _ap(start or '.'))
def _P_user(p):
    p = _fsp(p)
    return '/home/aluno' + p[1:] if p == '~' or p.startswith('~/') else p
def _P_vars(p):
    import re
    return re.sub(r'\$(\w+)|\$\{(\w+)\}', lambda m: _O.environ.get(m.group(1) or m.group(2), m.group(0)), _fsp(p))
_P = _Fallback('posixpath', _px)
for _n, _f in dict(exists=_P_exists, lexists=_P_exists, isfile=_P_isfile, isdir=_P_isdir, islink=lambda p: False, ismount=lambda p: _P_exists(p) and _ap(p) == '/', getsize=_P_size, getmtime=_P_mtime,
                   getatime=_P_mtime, getctime=_P_mtime, abspath=lambda p: _ap(p or '.'), realpath=lambda p, **k: _ap(p or '.'), relpath=_P_rel, expanduser=_P_user, expandvars=_P_vars,
                   samefile=lambda a, b: _ap(a) == _ap(b)).items(): setattr(_P, _n, _f)
del _n, _f
_O.path = _P

# ---------------------------------------------------------------- módulo shutil
class _SameFile(OSError): pass
def _src_bytes(src):
    a = _ap(src)
    if a in _S['d']: raise IsADirectoryError(21, 'Is a directory', _fsp(src))
    if a not in _S['f']: raise FileNotFoundError(2, 'No such file or directory', _fsp(src))
    return a, _S['f'][a]
def _copyfile(src, dst, *, follow_symlinks=True):
    a, rec = _src_bytes(src); d = _ap(dst)
    if d == a: raise _SameFile('%r and %r are the same file' % (_fsp(src), _fsp(dst)))
    if d in _S['d']: raise IsADirectoryError(21, 'Is a directory', _fsp(dst))
    _need_parent(d, dst); _put(d, rec[0]); return _fsp(dst)
def _copy(src, dst, *, follow_symlinks=True):
    if _P_isdir(dst): dst = _px.join(_fsp(dst), _px.basename(_fsp(src)))
    return _copyfile(src, dst)
def _copy2(src, dst, *, follow_symlinks=True):
    if _P_isdir(dst): dst = _px.join(_fsp(dst), _px.basename(_fsp(src)))
    r = _copyfile(src, dst); _S['f'][_ap(dst)][1] = _S['f'][_ap(src)][1]; return r
def _move(src, dst, copy_function=None):
    d = _fsp(dst)
    if _P_isdir(d): d = _px.join(d, _px.basename(_fsp(src).rstrip('/')))
    if _exists(_ap(d)) and _P_isdir(d) and _P_isdir(src): raise _shr.Error("Destination path '%s' already exists" % d)
    _rename(src, d); return d
def _rmtree(path, ignore_errors=False, onerror=None, *, dir_fd=None, onexc=None):
    a = _ap(path)
    if a not in _S['d']:
        if ignore_errors: return
        raise NotADirectoryError(20, 'Not a directory', _fsp(path)) if a in _S['f'] else FileNotFoundError(2, 'No such file or directory', _fsp(path))
    pre = a.rstrip('/') + '/'
    for k in [k for k in _S['f'] if k.startswith(pre)]: del _S['f'][k]
    for k in [k for k in _S['d'] if k == a or k.startswith(pre)]: _S['d'].discard(k)
def _ignore_patterns(*pats):
    return lambda d, names: {n for n in names for p in pats if _fn.fnmatch(n, p)}
def _copytree(src, dst, symlinks=False, ignore=None, copy_function=None, ignore_dangling_symlinks=False, dirs_exist_ok=False):
    s, d = _ap(src), _ap(dst)
    if s not in _S['d']: raise FileNotFoundError(2, 'No such file or directory', _fsp(src))
    if _exists(d) and not dirs_exist_ok: raise FileExistsError(17, 'File exists', _fsp(dst))
    _need_parent(d, dst); _S['d'].add(d)
    names = _kids(s); skip = ignore(_fsp(src), names) if ignore else set()
    for n in names:
        if n in skip: continue
        a, b = _px.join(_fsp(src), n), _px.join(_fsp(dst), n)
        if _ap(a) in _S['d']: _copytree(a, b, ignore=ignore, dirs_exist_ok=dirs_exist_ok)
        else: _copy2(a, b)
    return _fsp(dst)
def _make_archive(base_name, format, root_dir=None, base_dir=None, **k):
    if format != 'zip': raise ValueError('formato de arquivo não conhecido: %s (neste treino, só zip)' % format)
    root = _ap(root_dir or '.'); out = _fsp(base_name) + '.zip'
    with _ZipFile(out, 'w') as z:
        for dp, ds, fs in _walk(root):
            for n in fs: z.write(_px.join(dp, n), _px.relpath(_px.join(dp, n), root))
    return _ap(out)
_SH = _Fallback('shutil', _shr)
for _n, _f in dict(copy=_copy, copy2=_copy2, copyfile=_copyfile, copytree=_copytree, move=_move, rmtree=_rmtree, ignore_patterns=_ignore_patterns, make_archive=_make_archive,
                   which=lambda cmd, **k: None, SameFileError=_SameFile).items(): setattr(_SH, _n, _f)
del _n, _f

# ---------------------------------------------------------------- módulo glob
def _has_magic(s): return any(c in s for c in '*?[')
def _glob(pattern, *, root_dir=None, dir_fd=None, recursive=False, include_hidden=False):
    pattern = _fsp(pattern)
    if pattern == '': return []
    absolute, dir_only = pattern.startswith('/'), pattern.endswith('/')
    segs = [s for s in pattern.split('/') if s != '']
    base = '/' if absolute else (_ap(root_dir) if root_dir is not None else _S['cwd'])
    join = lambda x, n: x.rstrip('/') + '/' + n
    jn = lambda o, n: n if o == '' else o.rstrip('/') + '/' + n
    res = []
    def go(cur, out, i):
        if i == len(segs):
            if out != '' and (not dir_only or cur in _S['d']): res.append(out + '/' if dir_only else out)
            return
        s, last = segs[i], i == len(segs) - 1
        if recursive and s == '**':
            go(cur, out, i + 1)
            for n in _kids(cur):
                if join(cur, n) in _S['d'] and (include_hidden or not n.startswith('.')): go(join(cur, n), jn(out, n), i)
            return
        if not _has_magic(s):
            full = join(cur, s)
            if full in _S['d'] or (last and full in _S['f']): go(full, jn(out, s), i + 1)
            return
        for n in _kids(cur):
            if n.startswith('.') and not s.startswith('.') and not include_hidden: continue
            full = join(cur, n)
            if _fn.fnmatchcase(n, s) and (last or full in _S['d']): go(full, jn(out, n), i + 1)
    go(base, '/' if absolute else '', 0)
    return sorted(set(r for r in res if r != '/'))
_GL = _Fallback('glob', _glr)
_GL.glob = _glob; _GL.iglob = lambda *a, **k: iter(_glob(*a, **k))

# ---------------------------------------------------------------- módulo pathlib
class _PP(_plr.PurePosixPath):
    __slots__ = ()
    @classmethod
    def cwd(cls): return cls(_S['cwd'])
    @classmethod
    def home(cls): return cls('/home/aluno')
    def _a(self): return _ap(str(self))
    def exists(self, *, follow_symlinks=True): return _exists(self._a())
    def is_file(self): return self._a() in _S['f']
    def is_dir(self): return self._a() in _S['d']
    def is_symlink(self): return False
    def stat(self, *, follow_symlinks=True): return _stat(str(self))
    def open(self, mode='r', buffering=-1, encoding=None, errors=None, newline=None): return _open(str(self), mode, buffering, encoding, errors, newline)
    def read_text(self, encoding=None, errors=None):
        with self.open('r', encoding=encoding, errors=errors) as f: return f.read()
    def write_text(self, data, encoding=None, errors=None, newline=None):
        if not isinstance(data, str): raise TypeError('data must be str, not ' + type(data).__name__)
        with self.open('w', encoding=encoding, errors=errors, newline=newline) as f: return f.write(data)
    def read_bytes(self):
        with self.open('rb') as f: return f.read()
    def write_bytes(self, data):
        v = memoryview(data)
        with self.open('wb') as f: return f.write(v)
    def iterdir(self):
        for n in _listdir(str(self)): yield self / n
    def glob(self, pattern, *, case_sensitive=None, recurse_symlinks=False):
        for r in _glob(_fsp(pattern), root_dir=str(self), recursive=True): yield self / r
    def rglob(self, pattern, *, case_sensitive=None, recurse_symlinks=False):
        for r in _glob('**/' + _fsp(pattern), root_dir=str(self), recursive=True): yield self / r
    def walk(self, top_down=True, on_error=None, follow_symlinks=False):
        for dp, ds, fs in _walk(str(self), top_down): yield type(self)(dp), ds, fs
    def mkdir(self, mode=0o777, parents=False, exist_ok=False):
        try:
            if parents: _makedirs(str(self), exist_ok=False)
            else: _mkdir(str(self))
        except FileExistsError:
            if not exist_ok or not self.is_dir(): raise
    def unlink(self, missing_ok=False):
        try: _remove(str(self))
        except FileNotFoundError:
            if not missing_ok: raise
    def rmdir(self): _rmdir(str(self))
    def rename(self, target): _rename(str(self), str(target)); return type(self)(target)
    def replace(self, target): return self.rename(target)
    def touch(self, mode=0o666, exist_ok=True):
        a = self._a()
        if a in _S['f']:
            if not exist_ok: raise FileExistsError(17, 'File exists', str(self))
            _S['f'][a][1] = _stamp()
        else: _vopen(str(self), a, 'w', None, None, None).close()
    def resolve(self, strict=False):
        if strict and not self.exists(): raise FileNotFoundError(2, 'No such file or directory', str(self))
        return type(self)(self._a())
    def absolute(self): return type(self)(self._a())
    def expanduser(self): return type(self)(_P_user(str(self)))
    def samefile(self, other): return self._a() == _ap(other)
    def chmod(self, mode, *, follow_symlinks=True): return None
    def owner(self): return 'aluno'
_PP.__name__ = _PP.__qualname__ = 'PosixPath'; _PP.__module__ = 'pathlib'
_PL = _Fallback('pathlib', _plr)
_PL.Path = _PL.PosixPath = _PP

# ---------------------------------------------------------------- relógio parado e datas fixas
def _clk(): return _S['clk']
def _sleep(s):
    if s < 0: raise ValueError('sleep length must be non-negative')
    _S['clk'] += s
def _gm(t=None): return _R['tm']['gmtime'](_clk() if t is None else t)
def _strftime(fmt, t=None): return _R['tm']['strftime'](fmt, _gm() if t is None else t)
_dt0 = _dtr
class _FDate(_dt0.date):
    __slots__ = ()
    @classmethod
    def today(cls):
        t = _dt0.datetime.fromtimestamp(_clk(), _dt0.timezone.utc); return cls(t.year, t.month, t.day)
    @classmethod
    def fromtimestamp(cls, ts):
        t = _dt0.datetime.fromtimestamp(ts, _dt0.timezone.utc); return cls(t.year, t.month, t.day)
    def __repr__(s): return 'datetime.' + _dt0.date.__repr__(s)
class _FDateTime(_dt0.datetime):
    __slots__ = ()
    @classmethod
    def fromtimestamp(cls, ts, tz=None):
        r = _dt0.datetime.fromtimestamp(ts, _dt0.timezone.utc if tz is None else tz)
        return cls(r.year, r.month, r.day, r.hour, r.minute, r.second, r.microsecond, None if tz is None else r.tzinfo)
    @classmethod
    def now(cls, tz=None): return cls.fromtimestamp(_clk(), tz)
    @classmethod
    def today(cls): return cls.fromtimestamp(_clk())
    @classmethod
    def utcnow(cls): return cls.fromtimestamp(_clk())
    def __repr__(s): return 'datetime.' + _dt0.datetime.__repr__(s)
for _c, _n in ((_FDate, 'date'), (_FDateTime, 'datetime')): _c.__name__ = _c.__qualname__ = _n; _c.__module__ = 'datetime'
_DT = _Fallback('datetime', _dt0)
_DT.date, _DT.datetime = _FDate, _FDateTime

# ---------------------------------------------------------------- a "internet" de mentira: requests, urllib e e-mail (smtplib)
import http as _http
def _reason(c):
    try: return _http.HTTPStatus(c).phrase
    except ValueError: return ''
class _Req:
    def __init__(s, method, url, params, headers, json, data): s.method, s.url, s.params, s.headers, s.json, s.data = method, url, dict(params or {}), dict(headers or {}), json, data
    def __repr__(s): return '<Req %s %s>' % (s.method, s.url)
def _route(method, url, params=None, headers=None, json=None, data=None):
    url = _fsp(url); full = url + (('&' if '?' in url else '?') + _up.urlencode(params, doseq=True) if params else '')
    base = url.split('?')[0]; rt = _S['rotas']
    q = dict(_up.parse_qsl(full.split('?', 1)[1])) if '?' in full else {}
    v = None
    for key in ((method, full), full, (method, base), base):
        if key in rt: v = rt[key]; break
    else: return 404, b'{"erro": "rota nao encontrada"}', {'Content-Type': 'application/json'}
    if callable(v): v = v(_Req(method, base, q, headers, json, data))
    st, hd = 200, {}
    if isinstance(v, tuple) and v and isinstance(v[0], int): st, v, hd = v[0], (v[1] if len(v) > 1 else ''), (v[2] if len(v) > 2 else {})
    if isinstance(v, BaseException): raise v
    if isinstance(v, (dict, list)): body, ct = _js.dumps(v).encode(), 'application/json'
    elif isinstance(v, bytes): body, ct = v, 'application/octet-stream'
    else: body, ct = str(v).encode(), 'text/html' if str(v).lstrip().startswith('<') else 'text/plain'
    h = {'Content-Type': ct}; h.update(hd)
    return st, body, h

class _RqExc(_ty.ModuleType): pass
class RequestException(OSError):
    def __init__(s, *a, response=None, request=None): OSError.__init__(s, *a); s.response, s.request = response, request
class _HTTPErr(RequestException): pass
class _ConnErr(RequestException): pass
class _Timeout(RequestException): pass
class _ConnTimeout(_ConnErr, _Timeout): pass
class _ReadTimeout(_Timeout): pass
class _JSONErr(RequestException, ValueError): pass
class _BadURL(RequestException, ValueError): pass
for _c, _n in ((RequestException, 'RequestException'), (_HTTPErr, 'HTTPError'), (_ConnErr, 'ConnectionError'), (_Timeout, 'Timeout'), (_ConnTimeout, 'ConnectTimeout'),
               (_ReadTimeout, 'ReadTimeout'), (_JSONErr, 'JSONDecodeError'), (_BadURL, 'InvalidURL')):
    _c.__name__ = _c.__qualname__ = _n; _c.__module__ = 'requests.exceptions'
_RE = _RqExc('requests.exceptions')
for _c in (RequestException, _HTTPErr, _ConnErr, _Timeout, _ConnTimeout, _ReadTimeout, _JSONErr, _BadURL): setattr(_RE, _c.__name__, _c)

class _Resp:
    def __init__(s, st, body, hd, url): s.status_code, s.content, s.headers, s.url, s.encoding, s.reason = st, body, dict(hd), url, 'utf-8', _reason(st)
    @property
    def text(s): return s.content.decode(s.encoding or 'utf-8', 'replace')
    @property
    def ok(s): return s.status_code < 400
    def json(s, **k):
        try: return _js.loads(s.text, **k)
        except ValueError as e: raise _JSONErr(str(e))
    def raise_for_status(s):
        if 400 <= s.status_code < 600: raise _HTTPErr('%d %s Error: %s for url: %s' % (s.status_code, 'Client' if s.status_code < 500 else 'Server', s.reason, s.url), response=s)
    def __bool__(s): return s.ok
    def __repr__(s): return '<Response [%d]>' % s.status_code
_Resp.__name__ = _Resp.__qualname__ = 'Response'; _Resp.__module__ = 'requests.models'
def _rq_request(method, url, params=None, headers=None, json=None, data=None, timeout=None, **k):
    u = _fsp(url)
    if not u.startswith(('http://', 'https://')): raise _BadURL("Invalid URL %r: No scheme supplied. Perhaps you meant https://%s?" % (u, u))
    st, body, hd = _route(method.upper(), u, params, headers, json, data)
    return _Resp(st, body, hd, u + (('&' if '?' in u else '?') + _up.urlencode(params, doseq=True) if params else ''))
class _Session:
    def __init__(s): s.headers = {}; s.params = {}
    def request(s, method, url, **k):
        h = dict(s.headers); h.update(k.pop('headers', None) or {}); return _rq_request(method, url, headers=h, **k)
    def __enter__(s): return s
    def __exit__(s, *a): return None
    def close(s): return None
for _m in ('get', 'post', 'put', 'patch', 'delete', 'head', 'options'): setattr(_Session, _m, (lambda m: lambda s, url, **k: s.request(m, url, **k))(_m))
_Session.__name__ = _Session.__qualname__ = 'Session'
_RQ = _ty.ModuleType('requests'); _RQ.__version__ = '2.32.3'; _RQ.exceptions = _RE; _RQ.Response = _Resp; _RQ.Session = _Session; _RQ.session = _Session
for _n in ('RequestException', 'HTTPError', 'ConnectionError', 'Timeout', 'ConnectTimeout', 'ReadTimeout', 'JSONDecodeError'): setattr(_RQ, _n, getattr(_RE, _n))
_RQ.request = _rq_request
for _m in ('get', 'post', 'put', 'patch', 'delete', 'head', 'options'): setattr(_RQ, _m, (lambda m: lambda url, **k: _rq_request(m, url, **k))(_m))
_RQ.codes = _ty.SimpleNamespace(**{s.name.lower(): s.value for s in _http.HTTPStatus})

class _URLError(OSError):
    def __init__(s, reason, filename=None): OSError.__init__(s, reason); s.reason = reason
    def __str__(s): return '<urlopen error %s>' % (s.reason,)
class _HTTPError(_URLError):
    def __init__(s, url, code, msg, hdrs, fp): OSError.__init__(s, msg); s.url, s.code, s.msg, s.hdrs, s.headers, s.fp, s.reason = url, code, msg, hdrs, hdrs, fp, msg
    def __str__(s): return 'HTTP Error %s: %s' % (s.code, s.msg)
    def read(s, *a): return s.fp.read(*a)
    def getcode(s): return s.code
_URLError.__name__ = _URLError.__qualname__ = 'URLError'; _HTTPError.__name__ = _HTTPError.__qualname__ = 'HTTPError'
_UE = _ty.ModuleType('urllib.error'); _UE.URLError, _UE.HTTPError = _URLError, _HTTPError
for _c in (_URLError, _HTTPError): _c.__module__ = 'urllib.error'
class _URequest:
    def __init__(s, url, data=None, headers=None, origin_req_host=None, unverifiable=False, method=None):
        s.full_url, s.data, s.headers, s.method = url, data, dict(headers or {}), method or ('POST' if data is not None else 'GET')
    def get_method(s): return s.method
    def add_header(s, k, v): s.headers[k.capitalize()] = v
_URequest.__name__ = _URequest.__qualname__ = 'Request'
class _UResp(_io.BytesIO):
    def __init__(s, url, st, body, hd): _io.BytesIO.__init__(s, body); s.url, s.status, s.code, s.headers, s.reason = url, st, st, dict(hd), _reason(st)
    def getcode(s): return s.status
    def geturl(s): return s.url
    def info(s): return s.headers
def _urlopen(url, data=None, timeout=None, **k):
    r = url if isinstance(url, _URequest) else _URequest(_fsp(url), data)
    if not r.full_url.startswith(('http://', 'https://')): raise ValueError('unknown url type: %r' % r.full_url)
    st, body, hd = _route(r.get_method(), r.full_url, None, r.headers, None, r.data)
    if st >= 400: raise _HTTPError(r.full_url, st, _reason(st), hd, _io.BytesIO(body))
    return _UResp(r.full_url, st, body, hd)
_UR = _ty.ModuleType('urllib.request'); _UR.urlopen, _UR.Request = _urlopen, _URequest; _UR.URLError, _UR.HTTPError = _URLError, _HTTPError

class _SMTPErr(OSError): pass
class _SMTPAuth(_SMTPErr):
    def __init__(s, code, msg): OSError.__init__(s, code, msg); s.smtp_code, s.smtp_error = code, msg
class _SMTP:
    def __init__(s, host='', port=0, *a, **k):
        if not host: raise _SMTPErr('o servidor de e-mail precisa ter um endereço, como smtp.exemplo.com')
        s.host, s.port, s._tls, s._user, s._open = host, port, False, None, True
    def __enter__(s): return s
    def __exit__(s, *a): s.quit()
    def ehlo(s, *a): return (250, b'ok')
    helo = ehlo
    def starttls(s, *a, **k): s._tls = True; return (220, b'Ready to start TLS')
    def login(s, user, password, **k):
        if _S['contas'].get(user) != password: raise _SMTPAuth(535, b'Authentication failed')
        s._user = user; return (235, b'Authentication successful')
    def send_message(s, msg, from_addr=None, to_addrs=None, **k):
        if not s._open: raise _SMTPErr('please run connect() first')
        if not (from_addr or msg['From']): raise ValueError('mensagem sem remetente (From)')
        if not (to_addrs or msg['To'] or msg['Cc'] or msg['Bcc']): raise ValueError('mensagem sem destinatario (To)')
        _SM.caixa.append(msg); return {}
    def sendmail(s, from_addr, to_addrs, msg, *a, **k):
        from email import message_from_string as _mfs
        _SM.caixa.append(_mfs(msg) if isinstance(msg, str) else msg); return {}
    def quit(s): s._open = False; return (221, b'Bye')
    close = quit
_SMTP.__name__ = _SMTP.__qualname__ = 'SMTP'
_SM = _ty.ModuleType('smtplib'); _SM.SMTP = _SMTP; _SM.SMTP_SSL = type('SMTP_SSL', (_SMTP,), {}); _SM.SMTPException = _SMTPErr; _SM.SMTPAuthenticationError = _SMTPAuth; _SM.caixa = []
for _c in (_SMTP, _SMTPErr, _SMTPAuth): _c.__module__ = 'smtplib'
_SM.SMTPException.__name__ = 'SMTPException'; _SMTPAuth.__name__ = _SMTPAuth.__qualname__ = 'SMTPAuthenticationError'

# ---------------------------------------------------------------- zip dentro do disco virtual
class _ZipFile(_zfr.ZipFile):
    def __init__(self, file, mode='r', *a, **k):
        self._lab = None
        if isinstance(file, (str, _os.PathLike)): file = self._lab = _open(file, {'r': 'rb', 'w': 'wb', 'a': 'r+b', 'x': 'xb'}.get(mode, 'rb'))
        _zfr.ZipFile.__init__(self, file, mode, *a, **k)
    def close(self):
        _zfr.ZipFile.close(self)
        if self._lab is not None and not self._lab.closed: self._lab.close()
    def write(self, filename, arcname=None, compress_type=None, compresslevel=None):
        a = _ap(filename)
        if a not in _S['f']: raise FileNotFoundError(2, 'No such file or directory', _fsp(filename))
        name = _px.normpath(_fsp(arcname or filename)).lstrip('/')
        self.writestr(name, _S['f'][a][0], compress_type=compress_type, compresslevel=compresslevel)
    def extractall(self, path=None, members=None, pwd=None):
        base = _fsp(path) if path is not None else '.'
        for n in (members or self.namelist()):
            n = n.filename if hasattr(n, 'filename') else n; dest = _px.join(base, n)
            if n.endswith('/'): _makedirs(dest, exist_ok=True)
            else: _makedirs(_px.dirname(dest) or '.', exist_ok=True); _put(_ap(dest), self.read(n))
    def extract(self, member, path=None, pwd=None):
        n = member.filename if hasattr(member, 'filename') else member; dest = _px.join(_fsp(path) if path is not None else '.', n)
        _makedirs(_px.dirname(dest) or '.', exist_ok=True); _put(_ap(dest), self.read(n)); return dest
_ZipFile.__name__ = _ZipFile.__qualname__ = 'ZipFile'; _ZipFile.__module__ = 'zipfile'
_ZM = _Fallback('zipfile', _zfr); _ZM.ZipFile = _ZipFile

# ---------------------------------------------------------------- ligar tudo (e como desfazer)
def _undo():
    _bi.open, _io.open = _R['open'], _R['io_open']
    for k, v in _R['tm'].items(): setattr(_tm, k, v)
    _lg.Formatter.converter = _R['conv']; _lg.os = _os
    if _R['fho'] is not None: _lg.FileHandler._builtin_open = _R['fho']
    _sch.scheduler.__init__.__defaults__ = _R['schd']
    for n, m in _R['mods'].items():
        if m is None: _sys.modules.pop(n, None)
        else: _sys.modules[n] = m
    for n, v in _R['up'].items():
        if v is None:
            try: delattr(_UP, n)
            except AttributeError: pass
        else: setattr(_UP, n, v)
    _sys.argv[:] = _R['argv']
    try: del _sys._codeup_undo
    except AttributeError: pass

_bi.open = _io.open = _open
for _k, _v in dict(sleep=_sleep, time=_clk, time_ns=lambda: int(_clk() * 1e9), monotonic=lambda: _clk() - _NOW0 + 1000.0, perf_counter=lambda: _clk() - _NOW0,
                   localtime=_gm, gmtime=_gm, strftime=_strftime).items(): setattr(_tm, _k, _v)
_lg.Formatter.converter = staticmethod(_gm); _lg.os = _O
if _R['fho'] is not None: _lg.FileHandler._builtin_open = staticmethod(_open)
_sch.scheduler.__init__.__defaults__ = (_tm.monotonic, _tm.sleep)
for _n, _m in (('os', _O), ('os.path', _P), ('shutil', _SH), ('glob', _GL), ('pathlib', _PL), ('datetime', _DT), ('zipfile', _ZM), ('smtplib', _SM), ('requests', _RQ),
               ('requests.exceptions', _RE), ('urllib.request', _UR), ('urllib.error', _UE)): _sys.modules[_n] = _m
_UP.request, _UP.error = _UR, _UE
_sys._codeup_undo = _undo
_sys.argv[:] = ['automacao.py']
import random as _rnd, logging as _lgg
_rnd.seed(42)
_lgg.root.handlers.clear(); _lgg.root.setLevel(_lgg.WARNING); _lgg.disable(_lgg.NOTSET)
for _lo in list(_lgg.Logger.manager.loggerDict.values()):
    if isinstance(_lo, _lgg.Logger): _lo.handlers.clear(); _lo.setLevel(_lgg.NOTSET); _lo.propagate = True; _lo.disabled = False
del _rnd, _lgg

# ---------------------------------------------------------------- o que cada lição usa para montar o computador de treino
def _lab_boot(arquivos=None, dias=None, env=None, rotas=None, contas=None, pastas=None):
    """arquivos: {'caminho': texto ou bytes} · dias: {'caminho': quantos dias atrás foi mexido} · env: variáveis de ambiente · rotas: a internet de mentira · contas: e-mails que podem entrar · pastas: pastas vazias"""
    for p in (pastas or []): _mkpath(_ap(p))
    for p, c in (arquivos or {}).items():
        a = _ap(p); _mkpath(_px.dirname(a))
        _put(a, c if isinstance(c, bytes) else c.encode('utf-8'), _NOW0 - (dias or {}).get(p, 0) * 86400.0); _S['seed'].append(a)
    if env: _O.environ.update(env)
    if rotas: _S['rotas'].update(rotas)
    if contas: _S['contas'].update(contas)

def lab_ver(conteudo=True):
    """mostra os arquivos que existem no computador de treino (botão "Ver os arquivos")"""
    if not _S['seed']: print('(o computador de treino começa vazio nesta lição: os arquivos nascem do seu código)'); return
    for a in _S['seed']:
        if a not in _S['f']: continue
        d = _S['f'][a][0]; rel = a[len('/treino/'):] if a.startswith('/treino/') else a
        print('%s  (%d %s)' % (rel, len(d), 'byte' if len(d) == 1 else 'bytes'))
        if conteudo:
            try: ls = d.decode('utf-8').split('\n')
            except UnicodeDecodeError: print('  (arquivo binário)'); continue
            if ls and ls[-1] == '': ls.pop()
            for ln in ls[:8]: print('  ' + ln)
            if len(ls) > 8: print('  ... (mais %d linhas)' % (len(ls) - 8))
