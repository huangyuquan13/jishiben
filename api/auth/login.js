import { db } from '../_lib/db.js';
import { users } from '../_lib/schema.js';
import { sign } from '../_lib/jwt.js';
import { v4 as uuid } from 'uuid';
import { eq } from 'drizzle-orm';

// POST /api/auth/login
// Body: { code: "wx-xxx" } 或 { openid: "dev-user-1" }
export default async function handler(req) {
  if (req.method !== 'POST') {
    return Response.json({ code: 405, message: 'Method not allowed' }, { status: 405 });
  }

  const { code, openid: inputOpenid } = await req.json();

  // 简化版：直接用传入的 openid（开发/演示用）
  // 正式版需调微信接口 code2session
  const openid = inputOpenid || `dev-${code || uuid().slice(0, 8)}`;

  // 查用户是否存在
  let [user] = await db.select().from(users).where(eq(users.openid, openid));

  if (!user) {
    // 新用户自动注册
    const newUser = {
      id: uuid(),
      openid,
      nickname: '用户' + openid.slice(-4),
    };
    await db.insert(users).values(newUser);
    user = newUser;
  }

  const token = sign(user.id);

  return Response.json({
    code: 0,
    data: {
      token,
      userId: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
    },
  });
}
