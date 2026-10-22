// Armazenamento dos dados. Com DATABASE_URL usa PostgreSQL; sem ela usa um arquivo JSON local.
// Modelo: o servidor trabalha com um objeto em memória { users:{id:{...}}, sessions:{...}, ... }.
// No Postgres cada item vira UMA LINHA (tabela entities: kind, id, data jsonb) e só o que mudou é regravado.
const fs = require('fs'), path = require('path');

function fileStore(F) {
  fs.mkdirSync(path.dirname(F), { recursive: true });
  return {
    kind: 'arquivo',
    async load() { return fs.existsSync(F) ? JSON.parse(fs.readFileSync(F, 'utf8')) : {}; },
    async save(DB) { fs.writeFileSync(F + '.tmp', JSON.stringify(DB)); fs.renameSync(F + '.tmp', F); },
    backup() {
      if (!fs.existsSync(F)) return;
      const dir = path.join(path.dirname(F), 'backups'); fs.mkdirSync(dir, { recursive: true });
      fs.copyFileSync(F, path.join(dir, `data-${new Date().toISOString().slice(0, 13)}.json`));
      fs.readdirSync(dir).sort().slice(0, -72).forEach(x => fs.unlinkSync(path.join(dir, x)));
    }
  };
}

function pgStore(pool, legacyFile) {
  const seen = new Map();   // "kind/id" -> JSON já gravado (para gravar só o que mudou)
  return {
    kind: 'PostgreSQL',
    async load() {
      try { await pool.query('CREATE TABLE entities (k text PRIMARY KEY, kind text, id text, data jsonb, updated timestamptz)'); }
      catch (e) { if (!/already exists/i.test(e.message)) throw e; }
      const { rows } = await pool.query('SELECT kind, id, data FROM entities');
      const DB = {};
      for (const r of rows) { (DB[r.kind] ??= {})[r.id] = r.data; seen.set(r.kind + '/' + r.id, JSON.stringify(r.data)); }
      if (!rows.length && legacyFile && fs.existsSync(legacyFile)) {            // 1ª vez: importa o arquivo antigo
        const old = JSON.parse(fs.readFileSync(legacyFile, 'utf8')); console.log('Importando dados do arquivo antigo para o PostgreSQL…');
        await this.save(old); return old;
      }
      return DB;
    },
    async save(DB) {
      const now = new Set(), up = [];
      for (const kind in DB) { const m = DB[kind]; if (!m || typeof m !== 'object') continue;
        for (const id in m) { const k = kind + '/' + id, j = JSON.stringify(m[id]); now.add(k); if (seen.get(k) !== j) up.push([kind, id, j]); } }
      const del = [...seen.keys()].filter(k => !now.has(k));
      if (!up.length && !del.length) return;
      const c = await pool.connect();
      try {
        await c.query('BEGIN');
        for (const [kind, id, j] of up) await c.query('INSERT INTO entities (k, kind, id, data, updated) VALUES ($1,$2,$3,$4::jsonb, now()) ON CONFLICT (k) DO UPDATE SET data = EXCLUDED.data, updated = now()', [kind + '/' + id, kind, id, j]);
        for (const k of del) { await c.query('DELETE FROM entities WHERE k=$1', [k]); }
        await c.query('COMMIT');
      } catch (e) { await c.query('ROLLBACK').catch(() => { }); throw e; } finally { c.release(); }
      up.forEach(([kind, id, j]) => seen.set(kind + '/' + id, j)); del.forEach(k => seen.delete(k));
    },
    backup() { /* os backups ficam por conta do provedor do banco (Render/Supabase/Neon fazem automaticamente) */ }
  };
}

function createStore({ file, url, pool } = {}) {
  if (pool) return pgStore(pool, file);
  if (url) {
    const { Pool } = require('pg');
    const local = /localhost|127\.0\.0\.1/.test(url);
    return pgStore(new Pool({ connectionString: url, max: 5, ssl: process.env.PGSSL === 'disable' || local ? false : { rejectUnauthorized: false } }), file);
  }
  return fileStore(file);
}
module.exports = { createStore };
