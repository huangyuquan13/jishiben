import { db } from '../_lib/db.js';
import { users } from '../_lib/schema.js';
import { sign } from '../_lib/jwt.js';
import { v4 as uuid } from 'uuid';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  const { username, password, nickname } = await req.json();

  if (!username || !password) {
    return Response.json({ code: 400, message: '用户名和密码不能为空' }, { status: 400 });
  }
  if (username.length < 2 || username.length > 20) {
    return Response.json({ code: 400, message: '用户名需 2-20 个字符' }, { status: 400 });
  }
  if (password.length < 4) {
    return Response.json({ code: 400, message: '密码至少 4 位' }, { status: 400 });
  }

  // 检查用户名是否已存在
  const [exist] = await db.select().from(users).where(eq(users.username, username));
  if (exist) {
    return Response.json({ code: 400, message: '用户名已存在' }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: uuid(),
    username,
    passwordHash,
    nickname: nickname || username,
  };

  await db.insert(users).values(user);
  const token = sign(user.id);

  return Response.json({
    code: 0,
    data: { token, userId: user.id, nickname: user.nickname },
  });
}
