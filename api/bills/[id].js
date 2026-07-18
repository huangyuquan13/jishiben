import { db } from '../_lib/db.js';
import { bills } from '../_lib/schema.js';
import { getUserId } from '../_lib/jwt.js';
import { eq, and } from 'drizzle-orm';

// PUT /api/bills/:id
async function PUT(req, id) {
  const userId = getUserId(req);
  if (!userId) return Response.json({ code: 401, message: '请先登录' }, { status: 401 });

  const body = await req.json();
  const updateData = {};
  if (body.type) updateData.type = body.type;
  if (body.amount !== undefined) updateData.amount = parseFloat(body.amount);
  if (body.category) updateData.category = body.category;
  if (body.note !== undefined) updateData.note = body.note;
  if (body.billDate) updateData.billDate = body.billDate;

  await db
    .update(bills)
    .set(updateData)
    .where(and(eq(bills.id, id), eq(bills.userId, userId)));

  return Response.json({ code: 0, message: '更新成功' });
}

// DELETE /api/bills/:id
async function DELETE(req, id) {
  const userId = getUserId(req);
  if (!userId) return Response.json({ code: 401, message: '请先登录' }, { status: 401 });

  await db
    .delete(bills)
    .where(and(eq(bills.id, id), eq(bills.userId, userId)));

  return Response.json({ code: 0, message: '删除成功' });
}

export default async function handler(req) {
  // Vercel 动态路由：从 URL 提取 id
  const url = new URL(req.url);
  const segments = url.pathname.split('/');
  const id = segments[segments.length - 1];

  if (req.method === 'PUT') return PUT(req, id);
  if (req.method === 'DELETE') return DELETE(req, id);
  return Response.json({ code: 405, message: 'Method not allowed' }, { status: 405 });
}
