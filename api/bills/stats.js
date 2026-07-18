import { db } from '../_lib/db.js';
import { bills } from '../_lib/schema.js';
import { getUserId } from '../_lib/jwt.js';
import { eq, and, sql } from 'drizzle-orm';

// GET /api/bills/stats?month=2026-07
export default async function handler(req) {
  const userId = getUserId(req);
  if (!userId) return Response.json({ code: 401, message: '请先登录' }, { status: 401 });

  const url = new URL(req.url);
  const month = url.searchParams.get('month'); // YYYY-MM

  // 月度汇总
  const conditions = [eq(bills.userId, userId)];
  if (month) {
    conditions.push(
      and(
        sql`${bills.billDate} >= ${month + '-01'}`,
        sql`${bills.billDate} <= ${month + '-31'}`
      )
    );
  }

  const all = await db.select().from(bills).where(and(...conditions));

  // 计算汇总
  let totalIncome = 0;
  let totalExpense = 0;
  const categoryMap = {};

  for (const b of all) {
    if (b.type === 'income') {
      totalIncome += b.amount;
    } else {
      totalExpense += b.amount;
      categoryMap[b.category] = (categoryMap[b.category] || 0) + b.amount;
    }
  }

  // 分类支出排行
  const categoryRanking = Object.entries(categoryMap)
    .map(([name, amount]) => ({ name, amount: Math.round(amount * 100) / 100 }))
    .sort((a, b) => b.amount - a.amount);

  return Response.json({
    code: 0,
    data: {
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpense: Math.round(totalExpense * 100) / 100,
      balance: Math.round((totalIncome - totalExpense) * 100) / 100,
      recordCount: all.length,
      categoryRanking,
    },
  });
}
