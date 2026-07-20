<template>
  <view class="login-container">
    <view class="login-header">
      <text class="logo">💰</text>
      <text class="app-name">小记</text>
      <text class="app-desc">多端记账 · 云端同步</text>
    </view>

    <!-- 登录 -->
    <view v-if="page === 'login'" class="form-card">
      <text class="form-title">登录</text>
      <input v-model="username" class="form-input" placeholder="用户名" maxlength="20" />
      <input v-model="password" class="form-input" type="password" placeholder="密码" />
      <text v-if="error" class="form-error">{{ error }}</text>
      <view class="form-btn" @click="handleLogin">登录</view>
      <text class="form-link" @click="page = 'register'">没有账号？点击注册 →</text>
    </view>

    <!-- 注册 -->
    <view v-if="page === 'register'" class="form-card">
      <text class="form-title">注册</text>
      <input v-model="nickname" class="form-input" placeholder="昵称（如：小明）" maxlength="20" />
      <input v-model="username" class="form-input" placeholder="用户名" maxlength="20" />
      <input v-model="password" class="form-input" type="password" placeholder="密码（至少4位）" />
      <text v-if="error" class="form-error">{{ error }}</text>
      <view class="form-btn" @click="handleRegister">注册</view>
      <text class="form-link" @click="page = 'login'">已有账号？去登录 →</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { useUserStore } from '@/store/user.js';

const user = useUserStore();
const page = ref('login');
const username = ref('');
const password = ref('');
const nickname = ref('');
const error = ref('');

async function handleLogin() {
  error.value = '';
  if (!username.value.trim() || !password.value.trim()) { error.value = '请输入用户名和密码'; return; }
  try {
    await user.doLogin(username.value.trim(), password.value.trim());
    uni.switchTab({ url: '/pages/home/home' });
  } catch (e) { error.value = e.message || '登录失败'; }
}

async function handleRegister() {
  error.value = '';
  const u = username.value.trim(); const p = password.value.trim();
  if (!u || !p) { error.value = '请填写完整信息'; return; }
  if (p.length < 4) { error.value = '密码至少 4 位'; return; }
  try {
    await user.doRegister(u, p, nickname.value.trim() || u);
    uni.switchTab({ url: '/pages/home/home' });
  } catch (e) { error.value = e.message || '注册失败'; }
}
</script>

<style scoped>
.login-container { min-height: 100vh; background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%); display: flex; flex-direction: column; align-items: center; padding-top: 120rpx; }
.login-header { text-align: center; margin-bottom: 60rpx; }
.logo { font-size: 80rpx; display: block; }
.app-name { font-size: 48rpx; font-weight: 800; color: #fff; display: block; margin-top: 16rpx; }
.app-desc { font-size: 24rpx; color: #94a3b8; margin-top: 8rpx; display: block; }
.form-card { width: 600rpx; background: #fff; border-radius: 24rpx; padding: 48rpx 40rpx; }
.form-title { font-size: 32rpx; font-weight: 700; color: #1e293b; margin-bottom: 32rpx; display: block; }
.form-input { background: #f8fafc; border: 1rpx solid #e2e8f0; border-radius: 16rpx; padding: 24rpx; font-size: 28rpx; color: #1e293b; margin-bottom: 16rpx; }
.form-error { font-size: 22rpx; color: #dc2626; display: block; margin-bottom: 12rpx; }
.form-btn { background: #10b981; border-radius: 20rpx; padding: 26rpx; text-align: center; color: #fff; font-size: 28rpx; font-weight: 700; }
.form-link { font-size: 24rpx; color: #10b981; text-align: center; display: block; margin-top: 24rpx; }
</style>
