<template>
  <view class="wrap">
    <view class="card">
      <text class="logo">💰</text>
      <text class="title">小记</text>
      <text class="sub">多端记账 · 云端同步</text>

      <view v-if="page === 'login'" class="form">
        <view class="field">
          <text class="label">用户名</text>
          <uni-easyinput v-model="username" placeholder="请输入用户名" :input-border="true" :disabled="loading" />
        </view>
        <view class="field">
          <text class="label">密码</text>
          <uni-easyinput v-model="password" type="password" placeholder="请输入密码" :input-border="true" :disabled="loading" />
        </view>
        <view v-if="error" class="err"><text class="err-icon">⚠️</text><text>{{ error }}</text></view>
        <view class="btn" :class="{ 'btn-disabled': loading }" @click="handleLogin">
          <text class="btn-txt">{{ loading ? '登录中...' : '登 录' }}</text>
        </view>
        <text class="link" @click="switchTo('register')">没有账号？<text class="hl">点击注册 →</text></text>
      </view>

      <view v-if="page === 'register'" class="form">
        <view class="field">
          <text class="label">昵称</text>
          <uni-easyinput v-model="nickname" placeholder="如：小明" :input-border="true" :disabled="loading" />
        </view>
        <view class="field">
          <text class="label">用户名</text>
          <uni-easyinput v-model="username" placeholder="请输入用户名" :input-border="true" :disabled="loading" />
        </view>
        <view class="field">
          <text class="label">密码</text>
          <uni-easyinput v-model="password" type="password" placeholder="至少4位" :input-border="true" :disabled="loading" />
        </view>
        <view v-if="error" class="err"><text class="err-icon">⚠️</text><text>{{ error }}</text></view>
        <view class="btn" :class="{ 'btn-disabled': loading }" @click="handleRegister">
          <text class="btn-txt">{{ loading ? '注册中...' : '注册并登录' }}</text>
        </view>
        <text class="link" @click="switchTo('login')">已有账号？<text class="hl">去登录 →</text></text>
      </view>
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
const loading = ref(false);

function switchTo(p) {
  page.value = p;
  error.value = '';
  if (p === 'login') nickname.value = '';
}

async function handleLogin() {
  if (loading.value) return;
  error.value = '';
  if (!username.value.trim() || !password.value.trim()) { error.value = '请输入用户名和密码'; return; }
  loading.value = true;
  try {
    await user.doLogin(username.value.trim(), password.value.trim());
    uni.showToast({ title: '登录成功', icon: 'success' });
    setTimeout(() => uni.switchTab({ url: '/pages/home/home' }), 600);
  } catch (e) { error.value = e.message || '登录失败'; }
  finally { loading.value = false; }
}

async function handleRegister() {
  if (loading.value) return;
  error.value = '';
  const u = username.value.trim(); const p = password.value.trim();
  if (!u || !p) { error.value = '请填写完整信息'; return; }
  if (p.length < 4) { error.value = '密码至少 4 位'; return; }
  loading.value = true;
  try {
    await user.doRegister(u, p, nickname.value.trim() || u);
    uni.showToast({ title: '注册成功', icon: 'success' });
    setTimeout(() => uni.switchTab({ url: '/pages/home/home' }), 600);
  } catch (e) { error.value = e.message || '注册失败'; }
  finally { loading.value = false; }
}
</script>

<style scoped>
.wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #f8fafc 100%); padding: 40rpx; box-sizing: border-box; }
.card { width: 100%; max-width: 640rpx; background: #fff; border: 1rpx solid #e2e8f0; border-radius: 24rpx; padding: 60rpx 48rpx 48rpx; box-shadow: 0 4rpx 24rpx rgba(0,0,0,0.06); text-align: center; }
.logo { font-size: 72rpx; display: block; }
.title { font-size: 40rpx; font-weight: 700; color: #1e293b; display: block; margin-top: 12rpx; letter-spacing: 2rpx; }
.sub { font-size: 22rpx; color: #94a3b8; margin-top: 6rpx; margin-bottom: 44rpx; display: block; }
.form { margin-top: 8rpx; }
.field { margin-bottom: 20rpx; text-align: left; }
.label { font-size: 22rpx; font-weight: 600; color: #475569; display: block; margin-bottom: 10rpx; }
.err { background: #fef2f2; border: 1rpx solid #fecaca; border-radius: 12rpx; padding: 14rpx 18rpx; margin-bottom: 16rpx; font-size: 24rpx; color: #dc2626; display: flex; align-items: center; gap: 8rpx; }
.err-icon { font-size: 22rpx; }
.btn { background: #10b981; border-radius: 14rpx; padding: 28rpx; margin-top: 28rpx; transition: opacity 0.2s; }
.btn:active { opacity: 0.8; }
.btn-disabled { opacity: 0.5; pointer-events: none; }
.btn-txt { color: #fff; font-size: 30rpx; font-weight: 600; letter-spacing: 2rpx; }
.link { font-size: 24rpx; color: #64748b; display: block; margin-top: 28rpx; }
.hl { color: #10b981; font-weight: 600; }
</style>
