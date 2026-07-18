<template>
    <view class="stats-container">
        <view class="month-bar">
            <picker mode="date" fields="month" :value="month + '-01'" @change="onMonthChange">
                <text class="month-text">📅 {{ month }}</text>
            </picker>
        </view>

        <view v-if="stats.recordCount === 0" class="empty-state">
            <text>📊 本月暂无数据</text>
        </view>

        <view v-else class="stats-content">
            <!-- 汇总 -->
            <view class="summary-cards">
                <view class="s-card"><text class="s-label">收入</text><text class="s-val income">¥{{ fmt(stats.totalIncome) }}</text></view>
                <view class="s-card"><text class="s-label">支出</text><text class="s-val expense">¥{{ fmt(stats.totalExpense) }}</text></view>
                <view class="s-card"><text class="s-label">结余</text><text :class="['s-val', stats.balance >= 0 ? 'income' : 'expense']">¥{{ fmt(stats.balance) }}</text></view>
            </view>

            <!-- 分类排行 -->
            <uni-card margin="24rpx" :is-shadow="true">
                <uni-section title="支出分类排行" type="line" />
                <view v-for="(cat, i) in stats.categoryRanking" :key="cat.name" class="rank-row">
                    <view class="rank-left">
                        <text class="rank-num">{{ i + 1 }}</text>
                        <text class="rank-name">{{ cat.name }}</text>
                    </view>
                    <view class="rank-right">
                        <view class="rank-bar-bg"><view class="rank-bar" :style="{ width: maxAmount > 0 ? (cat.amount / maxAmount * 100) + '%' : '0%' }" /></view>
                        <text class="rank-amt">¥{{ cat.amount.toFixed(2) }}</text>
                    </view>
                </view>
            </uni-card>
        </view>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { getStats } from '@/api/bills.js';
import { useUserStore } from '@/store/user.js';

const user = useUserStore();
const month = ref(new Date().toISOString().slice(0, 7));
const stats = ref({ totalIncome: 0, totalExpense: 0, balance: 0, recordCount: 0, categoryRanking: [] });

async function load() {
  if (!user.isLogin) { stats.value = { totalIncome: 0, totalExpense: 0, balance: 0, recordCount: 0, categoryRanking: [] }; return; }
  try { stats.value = await getStats(month.value) || stats.value; } catch (e) { /* */ }
}

import { onShow } from '@dcloudio/uni-app';
onShow(() => load());

function onMonthChange(e) { month.value = e.detail.value.slice(0, 7); load(); }
function fmt(n) { return (n || 0).toFixed(2); }

const maxAmount = computed(() => {
  if (!stats.value.categoryRanking?.length) return 1;
  return stats.value.categoryRanking[0].amount || 1;
});
</script>

<style scoped>
.stats-container { min-height: 100vh; background: #f8fafc; padding-bottom: 120rpx; }
.month-bar { background: #fff; padding: 20rpx; text-align: center; }
.month-text { font-size: 28rpx; font-weight: 700; }
.empty-state { text-align: center; padding: 120rpx 0; color: #94a3b8; font-size: 28rpx; }
.summary-cards { display: flex; gap: 16rpx; padding: 24rpx; }
.s-card { flex: 1; background: #fff; border-radius: 16rpx; padding: 24rpx; text-align: center; }
.s-label { font-size: 22rpx; color: #94a3b8; display: block; }
.s-val { font-size: 36rpx; font-weight: 800; font-family: monospace; display: block; margin-top: 8rpx; }
.income { color: #10b981; }
.expense { color: #f43f5e; }
.rank-row { display: flex; align-items: center; justify-content: space-between; padding: 16rpx 0; border-bottom: 1rpx solid #f8fafc; }
.rank-left { display: flex; align-items: center; gap: 16rpx; }
.rank-num { font-size: 24rpx; font-weight: 700; color: #94a3b8; width: 40rpx; }
.rank-name { font-size: 26rpx; color: #1e293b; }
.rank-right { display: flex; align-items: center; gap: 12rpx; flex: 1; justify-content: flex-end; }
.rank-bar-bg { width: 120rpx; height: 12rpx; background: #f1f5f9; border-radius: 6rpx; overflow: hidden; }
.rank-bar { height: 100%; background: #10b981; border-radius: 6rpx; transition: width 0.5s; }
.rank-amt { font-size: 24rpx; font-family: monospace; color: #64748b; width: 120rpx; text-align: right; }
</style>
