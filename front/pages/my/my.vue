<template>
    <view class="my-container">
        <view class="profile-header">
            <template v-if="user.isLogin">
                <view class="avatar"><text class="avatar-text">{{ user.nickname.charAt(0).toUpperCase() }}</text></view>
                <text class="profile-name">{{ user.nickname }}</text>
                <text class="profile-desc">云端同步 · Turso + Vercel</text>
            </template>
            <template v-else>
                <view class="avatar avatar-gray"><text class="avatar-text">?</text></view>
                <text class="profile-name">未登录</text>
                <text class="profile-desc">注册后数据云端同步，多端共享</text>
            </template>
        </view>

        <view class="menu-card">
            <!-- 登录表单（默认） -->
            <view v-if="!user.isLogin && page === 'login'" class="auth-form">
                <view class="form-title">登录</view>
                <input v-model="authUsername" class="form-input" placeholder="用户名" maxlength="20" />
                <input v-model="authPassword" class="form-input" type="password" placeholder="密码" />
                <text v-if="authError" class="auth-error">{{ authError }}</text>
                <view class="form-btn" @click="handleLogin">登录</view>
                <text class="form-link" @click="page = 'register'">没有账号？点击注册 →</text>
            </view>

            <!-- 注册表单 -->
            <view v-if="!user.isLogin && page === 'register'" class="auth-form">
                <view class="form-title">注册</view>
                <input v-model="regNickname" class="form-input" placeholder="昵称（如：小明）" maxlength="20" />
                <input v-model="authUsername" class="form-input" placeholder="用户名" maxlength="20" />
                <input v-model="authPassword" class="form-input" type="password" placeholder="密码（至少4位）" />
                <text v-if="authError" class="auth-error">{{ authError }}</text>
                <view class="form-btn" @click="handleRegister">注册</view>
                <text class="form-link" @click="page = 'login'">已有账号？去登录 →</text>
            </view>

            <!-- 已登录 -->
            <uni-list v-if="user.isLogin">
                <uni-list-item title="退出登录" clickable @click="handleLogout">
                    <template #left><view class="menu-icon icon-red"><uni-icons type="closeempty" size="18" color="#f43f5e" /></view></template>
                </uni-list-item>
            </uni-list>

            <uni-list>
                <uni-list-item title="关于" clickable @click="showAbout = !showAbout">
                    <template #left><view class="menu-icon icon-green"><uni-icons type="info" size="18" color="#10b981" /></view></template>
                </uni-list-item>
            </uni-list>
        </view>

        <view v-if="showAbout">
            <uni-card margin="24rpx">
                <text class="about-text">💰 小记 — 多端记账 v1.0
Vue3 + uni-app + Turso + Vercel
H5: jishiben-6zff-ruby.vercel.app</text>
            </uni-card>
        </view>
    </view>
</template>

<script setup>
import { ref } from 'vue';
import { useUserStore } from '@/store/user.js';

const user = useUserStore();
const page = ref('login');
const authUsername = ref('');
const authPassword = ref('');
const regNickname = ref('');
const authError = ref('');
const showAbout = ref(false);

async function handleLogin() {
  authError.value = '';
  const u = authUsername.value.trim();
  const p = authPassword.value.trim();
  if (!u || !p) { authError.value = '请输入用户名和密码'; return; }
  try {
    await user.doLogin(u, p);
    uni.showToast({ title: '登录成功', icon: 'success' });
    setTimeout(() => uni.switchTab({ url: '/pages/home/home' }), 500);
  } catch (e) {
    authError.value = e.message || '登录失败，请检查网络';
  }
}

async function handleRegister() {
  authError.value = '';
  const u = authUsername.value.trim();
  const p = authPassword.value.trim();
  if (!u || !p) { authError.value = '请填写完整信息'; return; }
  if (p.length < 4) { authError.value = '密码至少 4 位'; return; }
  try {
    const nick = regNickname.value.trim() || u;
    await user.doRegister(u, p, nick);
    uni.showToast({ title: '注册成功', icon: 'success' });
    setTimeout(() => uni.switchTab({ url: '/pages/home/home' }), 500);
  } catch (e) {
    authError.value = e.message || '注册失败，请检查网络';
  }
}

function handleLogout() {
  user.logout();
  authUsername.value = ''; authPassword.value = ''; regNickname.value = '';
  page.value = 'login';
  uni.showToast({ title: '已退出', icon: 'none' });
}
</script>

<style scoped>
.my-container { min-height: 100vh; background: #f8fafc; padding-bottom: 120rpx; }
.profile-header { background: #1e293b; padding: 60rpx 36rpx 40rpx; text-align: center; }
.avatar { width: 100rpx; height: 100rpx; border-radius: 50%; background: #10b981; display: flex; align-items: center; justify-content: center; margin: 0 auto 16rpx; }
.avatar-gray { background: #475569; }
.avatar-text { color: #fff; font-size: 44rpx; font-weight: 800; }
.profile-name { font-size: 32rpx; font-weight: 700; color: #fff; display: block; }
.profile-desc { font-size: 22rpx; color: #94a3b8; margin-top: 8rpx; display: block; }
.menu-card { background: #fff; border-radius: 20rpx; margin: -24rpx 24rpx 0; padding: 8rpx 16rpx; box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06); }
.menu-icon { width: 68rpx; height: 68rpx; border-radius: 18rpx; display: flex; align-items: center; justify-content: center; }
.icon-green { background: #ecfdf5; }
.icon-red { background: #fef2f2; }

.auth-form { padding: 32rpx; }
.form-title { font-size: 30rpx; font-weight: 700; color: #1e293b; margin-bottom: 24rpx; }
.form-input { background: #f8fafc; border: 1rpx solid #e2e8f0; border-radius: 16rpx; padding: 24rpx; font-size: 28rpx; color: #1e293b; margin-bottom: 16rpx; }
.auth-error { font-size: 22rpx; color: #dc2626; display: block; margin-bottom: 12rpx; }
.form-btn { background: #10b981; border-radius: 20rpx; padding: 26rpx; text-align: center; color: #fff; font-size: 28rpx; font-weight: 700; }
.form-link { font-size: 24rpx; color: #10b981; text-align: center; display: block; margin-top: 24rpx; }

.about-text { font-size: 24rpx; color: #64748b; text-align: center; white-space: pre-line; }
</style>
