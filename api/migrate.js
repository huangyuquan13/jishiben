// 重建 users 表（新增 username + password_hash 字段）
import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';

const env = {};
readFileSync('.env', 'utf-8').split('\n').forEach(line => {
  const [k, ...rest] = line.split('=');
  if (k && rest.length) env[k.trim()] = rest.join('=').trim();
});

const turso = createClient({ url: env.TURSO_URL, authToken: env.TURSO_TOKEN });

// 删除旧表（外键约束要先删 bills）
await turso.execute('DROP TABLE IF EXISTS bills');
await turso.execute('DROP TABLE IF EXISTS categories');
await turso.execute('DROP TABLE IF EXISTS users');

// 重建
await turso.execute(`CREATE TABLE users (
  id TEXT PRIMARY KEY, username TEXT UNIQUE, password_hash TEXT,
  nickname TEXT DEFAULT '用户', avatar TEXT,
  created_at TEXT DEFAULT (datetime('now'))
)`);

await turso.execute(`CREATE TABLE bills (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id),
  type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
  amount REAL NOT NULL CHECK(amount > 0),
  category TEXT NOT NULL, note TEXT, bill_date TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
)`);

await turso.execute(`CREATE TABLE categories (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id),
  name TEXT NOT NULL, icon TEXT DEFAULT 'default',
  type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
  sort_order INTEGER DEFAULT 0
)`);

console.log('✅ 表结构已重建（users 新增 username + password_hash）');
process.exit(0);
