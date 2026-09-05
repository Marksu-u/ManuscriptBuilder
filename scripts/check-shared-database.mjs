// --preview applies the pending migration inside the same rolled-back transaction.
// Without it, checks the deployed schema. No fixture survives either mode.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import dotenv from 'dotenv';
import pg from 'pg';
dotenv.config({ path: ['.env.local', '.env'], quiet: true });
const db = new pg.Client({ connectionString: process.env.DIRECT_URL, connectionTimeoutMillis: 10000 });
try {
  await db.connect();
  await db.query('BEGIN');
  const publicTables = ['public.users', 'public.manuscripts', 'public.manuscript_pages', 'public.manuscript_assets'];
  const oldTables = ['public.dynasties', 'public.characters', 'public.relationships', 'public.reports'];
  const newTables = ['public.dynasty_trees', 'public.dynasty_characters', 'public.dynasty_relationships', 'public.dynasty_reports'];
  const tables = [...publicTables, ...(process.argv.includes('--preview') ? oldTables : newTables)];
  const before = [];
  for (const table of tables) before.push((await db.query(`SELECT * FROM ${table} ORDER BY id`)).rows);
  if (process.argv.includes('--preview')) {
    const sql = readFileSync(new URL('../prisma/migrations/20260905150000_prefix_dynasty_tables/migration.sql', import.meta.url), 'utf8');
    await db.query(sql.replace(/^BEGIN;$/m, '').replace(/^COMMIT;$/m, ''));
  }
  assert.equal((await db.query("SELECT count(*)::int n FROM pg_namespace WHERE nspname='manuscript'")).rows[0].n, 0, 'Legacy schema has been removed');
  const after = [];
  for (const table of [...publicTables, ...newTables]) after.push((await db.query(`SELECT * FROM ${table} ORDER BY id`)).rows);
  assert.deepEqual(after, before, 'All application rows and ownership preserved');
  assert.equal((await db.query('SELECT count(*)::int n FROM auth.users a LEFT JOIN public.users u ON u."supabaseId"=a.id::text WHERE u.id IS NULL OR u.email IS DISTINCT FROM COALESCE(a.email,\'\')')).rows[0].n, 0);
  const authId = randomUUID();
  await db.query('INSERT INTO auth.users (id,email) VALUES ($1,$2)', [authId, `${authId}@example.invalid`]);
  const user = (await db.query('SELECT id FROM public.users WHERE "supabaseId"=$1', [authId])).rows[0];
  assert.ok(user, 'Auth insert provisions the shared user');
  await db.query('UPDATE auth.users SET email=$2 WHERE id=$1', [authId, `updated-${authId}@example.invalid`]);
  assert.equal((await db.query('SELECT email FROM public.users WHERE id=$1', [user.id])).rows[0].email, `updated-${authId}@example.invalid`);
  await db.query('INSERT INTO public.dynasty_trees (id,name,slug,"ownerId","updatedAt") VALUES ($1,$1,$1,$2,now())', [authId, user.id]);
  await db.query('INSERT INTO public.manuscripts (id,title,"ownerId","updatedAt") VALUES ($1,$1,$2,now())', [authId, user.id]);
  await db.query('INSERT INTO public.manuscript_pages (id,position,content,"manuscriptId","updatedAt") VALUES ($1,0,\'{}\',$1,now())', [authId]);
  await db.query('INSERT INTO public.manuscript_assets (id,"storagePath","mimeType","ownerId","manuscriptId") VALUES ($1,$1,\'image/png\',$2,$1)', [authId, user.id]);
  await db.query('DELETE FROM auth.users WHERE id=$1', [authId]);
  for (const table of ['public.users','public.dynasty_trees','public.manuscripts','public.manuscript_pages','public.manuscript_assets']) {
    assert.equal((await db.query(`SELECT count(*)::int n FROM ${table} WHERE id=$1`, [authId])).rows[0].n, 0, `${table} deletion cascade`);
  }
  console.log('PASS: all existing application rows preserved; Auth backfill, signup, email updates, shared ownership and ecosystem deletion. All changes rolled back.');
} catch (error) {
  console.error('FAIL:', error instanceof assert.AssertionError ? error.message : `${error.code ?? error.name}: ${error.message}`);
  process.exitCode = 1;
} finally {
  await db.query('ROLLBACK').catch(() => {});
  await db.end();
}
