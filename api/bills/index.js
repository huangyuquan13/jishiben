import { db } from '../_lib/db.js';
import { bills } from '../_lib/schema.js';
import { getUserId } from '../_lib/jwt.js';
import { v4 as uuid } from 'uuid';
import { eq, and, desc, sql } from 'drizzle-orm';

// GET /api/bills?page=1&pageSize=20&type=expense&month=2026-07
export async function GET(req) {
  const userId = getUserId(req);
  if (!userId) return Response.json({ code: 401, message: '请先登录' }, { status: 401 });

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page')) || 1;
  const pageSize = parseInt(url.searchParams.get('pageSize')) || 20;
  const type = url.searchParams.get('type');
  const month = url.searchParams.get('month'); // YYYY-MM

  const conditions = [eq(bills.userId, userId)];
  if (type === 'income' || type === 'expense') conditions.push(eq(bills.type, type));
  if (month) {
    conditions.push(
      and(
        sql`${bills.billDate} >= ${month + '-01'}`,
        sql`${bills.billDate} <= ${month + '-31'}`
      )
    );
  }

  const list = await db
    .select()
    .from(bills)
    .where(and(...conditions))
    .orderBy(desc(bills.billDate), desc(bills.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return Response.json({ code: 0, data: { records: list, page, pageSize } });
}

// POST /api/bills
export async function POST(req) {
  const userId = getUserId(req);
  if (!userId) return Response.json({ code: 401, message: '请先登录' }, { status: 401 });

  const body = await req.json();
  const { type, amount, category, note, billDate } = body;

  if (!type || !amount || !category || !billDate) {
    return Response.json({ code: 400, message: '缺少必填字段' });
  }

  const record = {
    id: uuid(),
    userId,
    type,
    amount: parseFloat(amount),
    category,
    note: note || '',
    billDate,
  };

  await db.insert(bills).values(record);
  return Response.json({ code: 0, data: record });
}

// Vercel 路由分发
export default async function handler(req) {
  if (req.method === 'GET') return GET(req);
  if (req.method === 'POST') return POST(req);
  return Response.json({ code: 405, message: 'Method not allowed' }, { status: 405 });
}
