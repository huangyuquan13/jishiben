import { db } from '../_lib/db.js';
import { users } from '../_lib/schema.js';
import { sign } from '../_lib/jwt.js';
import { v4 as uuid } from 'uuid';
import { eq } from 'drizzle-orm';

export async function POST(req) {
  const { code, openid: inputOpenid } = await req.json();

  const openid = inputOpenid || `dev-${code || uuid().slice(0, 8)}`;

  let [user] = await db.select().from(users).where(eq(users.openid, openid));

  if (!user) {
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
