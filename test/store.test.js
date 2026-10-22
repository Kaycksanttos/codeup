const test = require('node:test'), assert = require('node:assert/strict');
const { newDb } = require('pg-mem'), { createStore } = require('../store');

test('Postgres: grava só o que mudou, remove apagados e recarrega igual', async () => {
  const pg = newDb().adapters.createPg(), pool = new pg.Pool();
  const s = createStore({ pool });
  assert.deepEqual(await s.load(), {});
  const DB = { users: { a: { id: 'a', name: 'Ana', xp: 1 }, b: { id: 'b', name: 'Bia', xp: 2 } }, sessions: { t1: { id: 'a', exp: 1 } } };
  await s.save(DB);
  DB.users.a.xp = 50; delete DB.sessions.t1; DB.users.c = { id: 'c', name: 'Caio', xp: 0 };
  await s.save(DB);
  const s2 = createStore({ pool }), back = await s2.load();
  assert.equal(back.users.a.xp, 50); assert.equal(back.users.b.name, 'Bia'); assert.equal(back.users.c.name, 'Caio'); assert.equal(back.sessions, undefined);
  const { rows } = await pool.query('SELECT count(*)::int n FROM entities'); assert.equal(rows[0].n, 3);
  delete DB.users.b; await s.save(DB);
  assert.equal(Object.keys((await createStore({ pool }).load()).users).length, 2);
});

test('Postgres: importa o arquivo JSON antigo na primeira vez', async () => {
  const fs = require('fs'), os = require('os'), path = require('path');
  const f = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'old-')), 'data.json'); fs.writeFileSync(f, JSON.stringify({ users: { z: { id: 'z', name: 'Zeca' } } }));
  const pool = new (newDb().adapters.createPg().Pool)();
  const db = await createStore({ pool, file: f }).load(); assert.equal(db.users.z.name, 'Zeca');
  assert.equal((await createStore({ pool }).load()).users.z.name, 'Zeca', 'ficou gravado no banco');
});
