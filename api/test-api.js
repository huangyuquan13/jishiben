// 直接测试数据库 CRUD，无需启动服务器
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

const { v4: uuid } = await import('uuid');

console.log('=== 多端记账 API 测试 ===\n');

// 1. 创建用户
const userId = uuid();
await turso.execute({
  sql: 'INSERT OR IGNORE INTO users (id, openid, nickname) VALUES (?, ?, ?)',
  args: [userId, 'test-001', '测试用户'],
});
console.log('✅ 1. 用户创建:', userId);

// 2. 新增收入
const bill1 = uuid();
await turso.execute({
  sql: 'INSERT INTO bills (id, user_id, type, amount, category, note, bill_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
  args: [bill1, userId, 'income', 5000, '工资', '7月工资', '2026-07-15'],
});
console.log('✅ 2. 新增收入: +5000 (工资)');

// 3. 新增支出
const bill2 = uuid();
await turso.execute({
  sql: 'INSERT INTO bills (id, user_id, type, amount, category, note, bill_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
  args: [bill2, userId, 'expense', 35.5, '餐饮', '午饭', '2026-07-18'],
});
console.log('✅ 3. 新增支出: -35.5 (餐饮)');

// 4. 查询账单列表
const list = await turso.execute({
  sql: 'SELECT * FROM bills WHERE user_id = ? ORDER BY bill_date DESC',
  args: [userId],
});
console.log(`✅ 4. 账单列表: ${list.rows.length} 条`);
list.rows.forEach(r => console.log(`   ${r.bill_date} | ${r.type === 'income' ? '+' : '-'}${r.amount} | ${r.category} | ${r.note || '-'}`));

// 5. 统计汇总
const stats = await turso.execute({
  sql: `
    SELECT type, SUM(amount) as total
    FROM bills WHERE user_id = ?
    GROUP BY type
  `,
  args: [userId],
});
let income = 0, expense = 0;
stats.rows.forEach(r => {
  if (r.type === 'income') income = r.total;
  else expense = r.total;
});
console.log(`✅ 5. 统计: 收入 ${income} | 支出 ${expense} | 结余 ${income - expense}`);

// 6. 删除测试数据
await turso.execute({ sql: 'DELETE FROM bills WHERE user_id = ?', args: [userId] });
await turso.execute({ sql: 'DELETE FROM users WHERE id = ?', args: [userId] });
console.log('✅ 6. 测试数据已清理');

console.log('\n🎉 全部测试通过！数据库 CRUD 正常工作。');
process.exit(0);
