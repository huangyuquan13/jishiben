// uni-app API 请求封装
const BASE_URL = 'https://jishiben-6zff-ruby.vercel.app';

function getToken() {
  return uni.getStorageSync('token') || '';
}

export function request(url, options = {}) {
  const { method = 'GET', data, header = {} } = options;

  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + url,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': getToken() ? `Bearer ${getToken()}` : '',
        ...header,
      },
      success(res) {
        const { statusCode, data: resData } = res;
        if (statusCode === 401) {
          uni.removeStorageSync('token');
          uni.removeStorageSync('user');
          uni.reLaunch({ url: '/pages/my/my' });
          return reject(new Error('请先登录'));
        }
        if (resData.code === 0) {
          resolve(resData.data);
        } else {
          uni.showToast({ title: resData.message || '请求失败', icon: 'none' });
          reject(new Error(resData.message));
        }
      },
      fail(err) {
        uni.showToast({ title: '网络请求失败', icon: 'none' });
        reject(err);
      },
    });
  });
}

export default request;
