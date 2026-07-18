const BASE_URL = 'https://jishiben-6zff-ruby.vercel.app';

// 注册/登录不走 request.js，因为 401 在此处代表"密码错误"而非"token过期"
function authFetch(path, data) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + path,
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      data,
      success(res) {
        if (res.data.code === 0) {
          resolve(res.data.data);
        } else {
          reject(new Error(res.data.message || '请求失败'));
        }
      },
      fail(err) {
        reject(new Error('网络请求失败'));
      },
    });
  });
}

// 注册
export function register(username, password, nickname) {
  return authFetch('/api/auth/register', { username, password, nickname });
}

// 登录
export function login(username, password) {
  return authFetch('/api/auth/login', { username, password });
}
