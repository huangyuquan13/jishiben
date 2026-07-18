import { db } from '../_lib/db.js';
import { bills } from '../_lib/schema.js';
import { getUserId } from '../_lib/jwt.js';
import { eq, and } from 'drizzle-orm';

function getId(req) {
  const segments = new URL(req.url).pathname.split('/');
  return segments[segments.length - 1];
}

export async function PUT(req) {
  const userId = getUserId(req);
  if (!userId) return Response.json({ code: 401, message: '请先登录' }, { status: 401 });

  const id = getId(req);
  const body = await req.json();
  const updateData = {};
  if (body.type) updateData.type = body.type;
  if (body.amount !== undefined) updateData.amount = parseFloat(body.amount);
  if (body.category) updateData.category = body.category;
  if (body.note !== undefined) updateData.note = body.note;
  if (body.billDate) updateData.billDate = body.billDate;

  await db.update(bills).set(updateData).where(and(eq(bills.id, id), eq(bills.userId, userId)));
  return Response.json({ code: 0, message: '更新成功' });
}

export async function DELETE(req) {
  const userId = getUserId(req);
  if (!userId) return Response.json({ code: 401, message: '请先登录' }, { status: 401 });

  const id = getId(req);
  await db.delete(bills).where(and(eq(bills.id, id), eq(bills.userId, userId)));
  return Response.json({ code: 0, message: '删除成功' });
}
