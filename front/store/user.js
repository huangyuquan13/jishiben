import { defineStore } from 'pinia';
import { login, register } from '../api/auth.js';

export const useUserStore = defineStore('user', {
  state: () => ({
    token: uni.getStorageSync('token') || '',
    userId: uni.getStorageSync('userId') || '',
    nickname: uni.getStorageSync('nickname') || '',
    isLogin: !!uni.getStorageSync('token'),
  }),

  actions: {
    async doLogin(username, password) {
      const data = await login(username, password);
      this._save(data);
      return data;
    },

    async doRegister(username, password, nickname) {
      const data = await register(username, password, nickname);
      this._save(data);
      return data;
    },

    _save(data) {
      this.token = data.token;
      this.userId = data.userId;
      this.nickname = data.nickname;
      this.isLogin = true;
      uni.setStorageSync('token', data.token);
      uni.setStorageSync('userId', data.userId);
      uni.setStorageSync('nickname', data.nickname);
    },

    logout() {
      this.token = '';
      this.userId = '';
      this.nickname = '';
      this.isLogin = false;
      uni.removeStorageSync('token');
      uni.removeStorageSync('userId');
      uni.removeStorageSync('nickname');
    },
  },
});
