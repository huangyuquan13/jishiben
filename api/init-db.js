// 直接从 .env 文件读取，避免 PowerShell 编码问题
import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';

const env = {};
readFileSync('.env', 'utf-8').split('\n').forEach(line => {
  const [k, ...rest] = line.split('=');
  if (k && rest.length) env[k.trim()] = rest.join('=').trim();
});

const turso = createClient({
  url: env.TURSO_URL,
  authToken: env.TURSO_TOKEN,
});

const SQL = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE,
  password_hash TEXT,
  nickname TEXT DEFAULT '用户',
  avatar TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS bills (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
  amount REAL NOT NULL CHECK(amount > 0),
  category TEXT NOT NULL,
  note TEXT,
  bill_date TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'default',
  type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
  sort_order INTEGER DEFAULT 0
);
`;

try {
  // Turso 限制一次只能执行一条语句，拆分执行
  const stmts = SQL.split(';').filter(s => s.trim());
  for (const stmt of stmts) {
    await turso.execute(stmt + ';');
  }
  console.log('✅ 三张表创建成功！');
  process.exit(0);
} catch (err) {
  console.error('❌ 建表失败:', err.message);
  process.exit(1);
}
