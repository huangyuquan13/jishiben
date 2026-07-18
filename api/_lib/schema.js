import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// 用户表
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  openid: text('openid').unique(),
  nickname: text('nickname').default('用户'),
  avatar: text('avatar'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
});

// 账单表
export const bills = sqliteTable('bills', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  type: text('type', { enum: ['income', 'expense'] }).notNull(),
  amount: real('amount').notNull(),
  category: text('category').notNull(),
  note: text('note'),
  billDate: text('bill_date').notNull(),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
});

// 分类表
export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  icon: text('icon').default('default'),
  type: text('type', { enum: ['income', 'expense'] }).notNull(),
  sortOrder: integer('sort_order').default(0),
});
