import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'jishiben-dev-secret-2026';

export function sign(userId) {
  return jwt.sign({ userId }, SECRET, { expiresIn: '30d' });
}

export function verify(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

// 从请求头提取用户ID
export function getUserId(req) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.replace('Bearer ', '');
  const payload = verify(token);
  return payload?.userId || null;
}
