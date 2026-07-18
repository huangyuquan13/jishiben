import { request } from './request.js';

// 注册
export function register(username, password, nickname) {
  return request('/api/auth/register', {
    method: 'POST',
    data: { username, password, nickname },
  });
}

// 登录
export function login(username, password) {
  return request('/api/auth/login', {
    method: 'POST',
    data: { username, password },
  });
}
