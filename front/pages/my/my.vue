<template>
    <view class="my-container">
        <!-- 深色个人信息头部 -->
        <view class="profile-header">
            <view class="profile-bg-deco deco-right" />
            <view class="profile-bg-deco deco-left" />

            <view class="profile-row">
                <view class="avatar">
                    <text class="avatar-text">{{ userEmail.charAt(0).toUpperCase() }}</text>
                </view>
                <view class="profile-info">
                    <text class="profile-name">前端开发者</text>
                    <text class="profile-email">{{ userEmail }}</text>
                </view>
            </view>

            <!-- 数据统计卡片 -->
            <view class="stats-grid">
                <view class="stat-cell">
                    <text class="stat-num">{{ stats.collections }}</text>
                    <text class="stat-label">收藏</text>
                </view>
                <view class="stat-cell">
                    <text class="stat-num">{{ stats.recipes }}</text>
                    <text class="stat-label">菜谱</text>
                </view>
                <view class="stat-cell">
                    <text class="stat-num">{{ stats.likes }}</text>
                    <text class="stat-label">获赞</text>
                </view>
                <view class="stat-cell">
                    <text class="stat-num">{{ stats.followers }}</text>
                    <text class="stat-label">粉丝</text>
                </view>
            </view>
        </view>

        <!-- 功能菜单 — uni-list -->
        <view class="menu-card">
            <uni-list>
                <uni-list-item title="支出统计" :border="false" clickable @click="goToStats">
                    <template #left>
                        <view class="menu-icon-wrap icon-green">
                            <uni-icons type="bars" size="18" color="#10b981" />
                        </view>
                    </template>
                    <template #right>
                        <uni-icons type="arrowright" size="16" color="#94a3b8" />
                    </template>
                </uni-list-item>

                <uni-list-item title="预算设置" :border="false" clickable @click="openBudgetModal">
                    <template #left>
                        <view class="menu-icon-wrap icon-green">
                            <uni-icons type="settings" size="18" color="#10b981" />
                        </view>
                    </template>
                    <template #right>
                        <view class="menu-right">
                            <text class="menu-value">¥{{ settings.monthlyBudget }}</text>
                            <uni-icons type="arrowright" size="16" color="#94a3b8" />
                        </view>
                    </template>
                </uni-list-item>

                <uni-list-item title="分类管理" :border="false" clickable @click="openCategoryModal">
                    <template #left>
                        <view class="menu-icon-wrap icon-green">
                            <uni-icons type="list" size="18" color="#10b981" />
                        </view>
                    </template>
                    <template #right>
                        <view class="menu-right">
                            <uni-badge :text="String(settings.categories.length)" type="success" size="small" />
                            <uni-icons type="arrowright" size="16" color="#94a3b8" />
                        </view>
                    </template>
                </uni-list-item>

                <uni-list-item title="关于小程序" :border="false" clickable @click="openAboutModal">
                    <template #left>
                        <view class="menu-icon-wrap icon-green">
                            <uni-icons type="info" size="18" color="#10b981" />
                        </view>
                    </template>
                    <template #right>
                        <uni-icons type="arrowright" size="16" color="#94a3b8" />
                    </template>
                </uni-list-item>
            </uni-list>
        </view>

        <!-- ===== 弹窗：预算设置 ===== -->
        <view v-if="activeModal === 'budget'" class="modal-mask" @click="activeModal = null" />
        <view v-if="activeModal === 'budget'" class="modal-card">
            <view class="modal-header">
                <text class="modal-title">⚙️ 月度预算设置</text>
                <text class="modal-close" @click="activeModal = null">✕</text>
            </view>
            <view class="modal-body">
                <text v-if="budgetError" class="modal-error">⚠️ {{ budgetError }}</text>
                <view class="modal-label">每月预算金额 (元)</view>
                <view class="modal-input-wrap">
                    <text class="modal-prefix">¥</text>
                    <input v-model="budgetInput" type="digit" class="modal-input" />
                </view>
                <text class="modal-hint">修改每月预算后，首页进度条和统计分析将同步更新。</text>
                <view class="modal-btn" @click="saveBudget">保存设置</view>
            </view>
        </view>

        <!-- ===== 弹窗：分类管理 ===== -->
        <view v-if="activeModal === 'category'" class="modal-mask" @click="activeModal = null" />
        <view v-if="activeModal === 'category'" class="modal-card">
            <view class="modal-header">
                <text class="modal-title">📋 分类项目管理</text>
                <text class="modal-close" @click="activeModal = null">✕</text>
            </view>
            <view class="modal-body cat-modal-body">
                <!-- 当前分类列表 -->
                <view class="cat-list-label">当前分类列表</view>
                <view class="cat-list">
                    <view v-for="cat in settings.categories" :key="cat.code" class="cat-row">
                        <view class="cat-row-left">
                            <text class="cat-row-icon">{{ cat.icon }}</text>
                            <text class="cat-row-name">{{ cat.name }}</text>
                            <text :class="cat.type === 'expense' ? 'cat-type-expense' : 'cat-type-income'">
                                {{ cat.type === 'expense' ? '支出' : '收入' }}
                            </text>
                        </view>
                        <text v-if="cat.code.startsWith('custom_')" class="cat-delete" @click="deleteCategory(cat.code)">🗑</text>
                    </view>
                </view>

                <!-- 添加新分类 -->
                <view class="cat-divider" />
                <view class="cat-add-title">添加自定义分类</view>
                <text v-if="catError" class="modal-error">⚠️ {{ catError }}</text>

                <view class="cat-form-row">
                    <view class="type-toggle-sm">
                        <text :class="catType === 'expense' ? 'toggle-active-expense' : ''" @click="catType = 'expense'">支出</text>
                        <text :class="catType === 'income' ? 'toggle-active-income' : ''" @click="catType = 'income'">收入</text>
                    </view>
                    <view class="cat-icon-current">
                        <text class="cat-icon-label">当前图标:</text>
                        <text class="cat-icon-show">{{ catIcon }}</text>
                    </view>
                </view>

                <input v-model="catName" placeholder="输入分类名称（如：零食、宠物）" class="cat-name-input" />

                <view class="emoji-label">选择分类图标</view>
                <view class="emoji-grid">
                    <text
                        v-for="emoji in emojiOptions"
                        :key="emoji"
                        :class="['emoji-item', catIcon === emoji ? 'emoji-selected' : '']"
                        @click="catIcon = emoji"
                    >{{ emoji }}</text>
                </view>

                <view class="modal-btn" @click="addCategory">+ 创建此分类</view>
            </view>
        </view>

        <!-- ===== 弹窗：关于 ===== -->
        <view v-if="activeModal === 'about'" class="modal-mask" @click="activeModal = null" />
        <view v-if="activeModal === 'about'" class="modal-card">
            <view class="modal-header">
                <text class="modal-title">ℹ️ 关于记账小工具</text>
                <text class="modal-close" @click="activeModal = null">✕</text>
            </view>
            <view class="modal-body about-body">
                <view class="about-icon-wrap">💰</view>
                <text class="about-name">记账小工具</text>
                <text class="about-version">Version 1.0.0 (uni-app Vue3)</text>
                <text class="about-desc">
                    本小程序是结合了 uni-app + uni-ui 功能设计文档开发的记账本。支持本地数据持久化储存，内嵌支出与收入图表统计、每日汇总分组、自定义收支分类增删等功能。
                </text>
                <view class="about-footer">
                    <text>👤 练手示范项目</text>
                    <text>·</text>
                    <text>📱 uni-app Vue3</text>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref } from 'vue';
import { api, loadSettings } from '@/utils/api.js';

const userEmail = 'abc@gmail.com';

// ===== 状态 =====
const settings = ref(loadSettings());
const activeModal = ref(null);

// 模拟统计数据
const stats = ref({
    collections: 4,
    recipes: 0,
    likes: 856,
    followers: 128
});

// ===== 预算弹窗 =====
const budgetInput = ref(String(settings.value.monthlyBudget));
const budgetError = ref('');

function openBudgetModal() {
    budgetInput.value = String(settings.value.monthlyBudget);
    budgetError.value = '';
    activeModal.value = 'budget';
}

async function saveBudget() {
    const val = parseFloat(budgetInput.value);
    if (isNaN(val) || val < 0) {
        budgetError.value = '请输入大于等于 0 的有效预算金额';
        return;
    }
    try {
        const updated = await api.updateSettings({ ...settings.value, monthlyBudget: val });
        settings.value = updated;
        activeModal.value = null;
        uni.showToast({ title: '预算已更新', icon: 'success' });
    } catch (e) {
        budgetError.value = '预算更新失败，请重试';
    }
}

// ===== 分类弹窗 =====
const catType = ref('expense');
const catName = ref('');
const catIcon = ref('📦');
const catError = ref('');

const emojiOptions = [
    '🍔','🍟','🍕','☕','🍺','🚗','✈️','🎮','🍿','🎬',
    '🏠','👔','👠','📱','💻','💊','📚','🏋️','🐶','🎁',
    '💰','📈','🪙','💼','📦'
];

function openCategoryModal() {
    catError.value = '';
    catName.value = '';
    catIcon.value = '📦';
    activeModal.value = 'category';
}

async function addCategory() {
    const name = catName.value.trim();
    if (!name) {
        catError.value = '请输入分类名称';
        return;
    }
    const dup = settings.value.categories.some(
        c => c.name.toLowerCase() === name.toLowerCase() && c.type === catType.value
    );
    if (dup) {
        catError.value = '该分类名称已存在';
        return;
    }
    try {
        const newCat = { code: 'custom_' + Date.now(), name, icon: catIcon.value, type: catType.value };
        const updated = await api.updateSettings({
            ...settings.value,
            categories: [...settings.value.categories, newCat]
        });
        settings.value = updated;
        catName.value = '';
        catIcon.value = '📦';
        uni.showToast({ title: '分类已添加', icon: 'success' });
    } catch (e) {
        catError.value = '添加失败，请重试';
    }
}

async function deleteCategory(code) {
    const updated = settings.value.categories.filter(c => c.code !== code);
    const newSettings = await api.updateSettings({ ...settings.value, categories: updated });
    settings.value = newSettings;
    uni.showToast({ title: '已删除', icon: 'none' });
}

// ===== 关于弹窗 =====
function openAboutModal() {
    activeModal.value = 'about';
}

// ===== 导航 =====
function goToStats() {
    uni.navigateTo({ url: '/pages/stats/stats' });
}
</script>

<style scoped>
.my-container { min-height: 100vh; background: #f8fafc; padding-bottom: 120rpx; }

/* 个人信息头部 */
.profile-header {
    position: relative; overflow: hidden;
    background: #1e293b; padding: 50rpx 36rpx 36rpx;
}
.profile-bg-deco { position: absolute; border-radius: 50%; background: rgba(16,185,129,0.08); }
.deco-right { right: -72rpx; top: -72rpx; width: 320rpx; height: 320rpx; }
.deco-left { left: -60rpx; bottom: -60rpx; width: 200rpx; height: 200rpx; }
.profile-row { display: flex; align-items: center; gap: 28rpx; position: relative; z-index: 1; }
.avatar {
    width: 100rpx; height: 100rpx; border-radius: 50%;
    background: #10b981; display: flex; align-items: center; justify-content: center;
    font-size: 44rpx; font-weight: 800;
}
.avatar-text { color: #fff; }
.profile-name { font-size: 34rpx; font-weight: 700; color: #fff; display: block; }
.profile-email { font-size: 24rpx; color: #94a3b8; font-family: monospace; margin-top: 4rpx; }

/* 统计卡片 */
.stats-grid {
    display: flex; background: rgba(255,255,255,0.05); border: 1rpx solid rgba(255,255,255,0.08);
    border-radius: 20rpx; padding: 32rpx 0; margin-top: 36rpx; position: relative; z-index: 1;
}
.stat-cell { flex: 1; text-align: center; }
.stat-num { font-size: 36rpx; font-weight: 800; color: #fff; font-family: monospace; display: block; }
.stat-label { font-size: 20rpx; color: #94a3b8; margin-top: 6rpx; }

/* 菜单卡片 */
.menu-card {
    background: #fff; border-radius: 20rpx; margin: -24rpx 24rpx 0;
    padding: 8rpx 16rpx; box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06);
    position: relative; z-index: 2;
}
.menu-item {
    display: flex; justify-content: space-between; align-items: center;
    padding: 28rpx 16rpx; border-bottom: 1rpx solid #f8fafc;
}
.menu-last { border-bottom: none; }
.menu-left { display: flex; align-items: center; gap: 20rpx; }
.menu-icon-wrap {
    width: 68rpx; height: 68rpx; border-radius: 18rpx;
    display: flex; align-items: center; justify-content: center;
}
.icon-green { background: #ecfdf5; }
.menu-icon { font-size: 32rpx; }
.menu-title { font-size: 28rpx; font-weight: 600; color: #1e293b; }
.menu-right { display: flex; align-items: center; gap: 8rpx; }
.menu-value { font-size: 26rpx; color: #94a3b8; font-family: monospace; }
.menu-badge { font-size: 22rpx; background: #f1f5f9; color: #94a3b8; padding: 6rpx 16rpx; border-radius: 20rpx; font-weight: 600; }
.menu-arrow { font-size: 36rpx; color: #94a3b8; }

/* 弹窗通用 */
.modal-mask { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 200; }
.modal-card {
    position: fixed; top: 15vh; left: 24rpx; right: 24rpx;
    background: #fff; border-radius: 32rpx; z-index: 201;
    max-width: 600rpx; margin: 0 auto;
    box-shadow: 0 20rpx 60rpx rgba(0,0,0,0.2);
}
.modal-header {
    display: flex; justify-content: space-between; align-items: center;
    padding: 32rpx 36rpx 20rpx; border-bottom: 1rpx solid #f8fafc;
}
.modal-title { font-size: 30rpx; font-weight: 700; color: #1e293b; }
.modal-close { font-size: 36rpx; color: #94a3b8; padding: 8rpx; }
.modal-body { padding: 28rpx 36rpx 36rpx; }
.modal-error { display: block; background: #fef2f2; border-radius: 12rpx; padding: 16rpx; font-size: 22rpx; color: #dc2626; margin-bottom: 16rpx; }
.modal-label { font-size: 22rpx; font-weight: 700; color: #94a3b8; margin-bottom: 12rpx; }
.modal-input-wrap {
    display: flex; align-items: center; background: #f8fafc; border: 1rpx solid #e2e8f0;
    border-radius: 20rpx; padding: 16rpx 24rpx;
}
.modal-prefix { font-size: 32rpx; font-weight: 600; color: #94a3b8; margin-right: 12rpx; }
.modal-input { flex: 1; font-size: 40rpx; font-weight: 700; color: #1e293b; font-family: monospace; }
.modal-hint { font-size: 20rpx; color: #94a3b8; display: block; margin-top: 16rpx; line-height: 1.5; }
.modal-btn {
    background: #1e293b; border-radius: 20rpx; padding: 26rpx;
    text-align: center; color: #fff; font-size: 28rpx; font-weight: 700;
    margin-top: 24rpx;
}

/* 分类弹窗 */
.cat-modal-body { max-height: 60vh; overflow-y: auto; }
.cat-list-label { font-size: 22rpx; font-weight: 700; color: #94a3b8; margin-bottom: 12rpx; }
.cat-list { background: #f8fafc; border-radius: 16rpx; padding: 8rpx; margin-bottom: 20rpx; max-height: 300rpx; overflow-y: auto; }
.cat-row { display: flex; justify-content: space-between; align-items: center; background: #fff; border-radius: 12rpx; padding: 16rpx 20rpx; margin-bottom: 6rpx; }
.cat-row-left { display: flex; align-items: center; gap: 12rpx; }
.cat-row-icon { font-size: 36rpx; }
.cat-row-name { font-size: 26rpx; font-weight: 600; color: #1e293b; }
.cat-type-expense { font-size: 18rpx; background: #fef2f2; color: #f43f5e; padding: 4rpx 12rpx; border-radius: 8rpx; }
.cat-type-income { font-size: 18rpx; background: #ecfdf5; color: #10b981; padding: 4rpx 12rpx; border-radius: 8rpx; }
.cat-delete { font-size: 28rpx; opacity: 0.5; padding: 4rpx; }
.cat-divider { border-top: 1rpx solid #f1f5f9; margin: 20rpx 0; }
.cat-add-title { font-size: 22rpx; font-weight: 700; color: #94a3b8; margin-bottom: 16rpx; }

.cat-form-row { display: flex; gap: 16rpx; margin-bottom: 16rpx; }
.type-toggle-sm {
    display: flex; background: #f1f5f9; border-radius: 14rpx; padding: 4rpx; flex: 1;
}
.type-toggle-sm text {
    flex: 1; text-align: center; padding: 12rpx; border-radius: 12rpx;
    font-size: 22rpx; font-weight: 600; color: #94a3b8;
}
.toggle-active-expense { background: #fff; color: #f43f5e; box-shadow: 0 2rpx 6rpx rgba(0,0,0,0.04); }
.toggle-active-income { background: #fff; color: #10b981; box-shadow: 0 2rpx 6rpx rgba(0,0,0,0.04); }
.cat-icon-current {
    display: flex; align-items: center; gap: 8rpx;
    border: 1rpx solid #e2e8f0; background: #f8fafc; border-radius: 14rpx; padding: 8rpx 20rpx;
}
.cat-icon-label { font-size: 20rpx; color: #94a3b8; }
.cat-icon-show { font-size: 36rpx; }

.cat-name-input {
    background: #f8fafc; border: 1rpx solid #e2e8f0; border-radius: 16rpx;
    padding: 20rpx 24rpx; font-size: 26rpx; color: #1e293b; margin-bottom: 16rpx;
}
.emoji-label { font-size: 20rpx; font-weight: 700; color: #94a3b8; margin-bottom: 12rpx; }
.emoji-grid {
    display: flex; flex-wrap: wrap; gap: 8rpx;
    border: 1rpx solid #e2e8f0; border-radius: 16rpx; padding: 16rpx;
    max-height: 220rpx; overflow-y: auto;
}
.emoji-item {
    font-size: 36rpx; padding: 8rpx; border-radius: 12rpx;
    border: 1rpx solid transparent; transition: all 0.2s;
}
.emoji-selected { background: #ecfdf5; border-color: #10b981; transform: scale(1.1); }

/* 关于弹窗 */
.about-body { text-align: center; }
.about-icon-wrap {
    width: 112rpx; height: 112rpx; border-radius: 24rpx;
    background: #10b981; display: flex; align-items: center; justify-content: center;
    font-size: 52rpx; margin: 0 auto 20rpx;
}
.about-name { font-size: 32rpx; font-weight: 700; color: #1e293b; display: block; }
.about-version { font-size: 22rpx; color: #94a3b8; font-family: monospace; margin-top: 4rpx; display: block; }
.about-desc {
    font-size: 24rpx; color: #64748b; line-height: 1.6; text-align: left;
    background: #f8fafc; border-radius: 16rpx; padding: 24rpx; margin-top: 24rpx; display: block;
}
.about-footer { display: flex; justify-content: center; gap: 16rpx; font-size: 22rpx; color: #94a3b8; margin-top: 24rpx; }
</style>
