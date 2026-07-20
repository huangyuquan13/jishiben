import { db } from '../_lib/db.js';
import { users } from '../_lib/schema.js';
import { sign } from '../_lib/jwt.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export function OPTIONS() { return new Response(null, { status: 204 }); }
export async function POST(req) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return Response.json({ code: 400, message: '用户名和密码不能为空' }, { status: 400 });
  }

  const [user] = await db.select().from(users).where(eq(users.username, username));
  if (!user) {
    return Response.json({ code: 401, message: '用户名或密码错误' }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return Response.json({ code: 401, message: '用户名或密码错误' }, { status: 401 });
  }

  const token = sign(user.id);

  return Response.json({
    code: 0,
    data: { token, userId: user.id, nickname: user.nickname },
  });
}
