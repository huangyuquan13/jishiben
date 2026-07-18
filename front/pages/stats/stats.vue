<template>
    <view class="stats-container">
        <!-- 月份 + 类型切换 -->
        <view class="stats-controls">
            <picker mode="date" fields="month" :value="selectedMonth + '-01'" @change="onMonthChange">
                <view class="month-picker">
                    <text>📅</text>
                    <text class="month-text">{{ formatMonth(selectedMonth) }}</text>
                </view>
            </picker>

            <view class="type-tabs">
                <text
                    :class="['type-tab', activeTab === 'expense' ? 'tab-active' : '']"
                    @click="activeTab = 'expense'"
                >支出统计</text>
                <text
                    :class="['type-tab', activeTab === 'income' ? 'tab-active' : '']"
                    @click="activeTab = 'income'"
                >收入统计</text>
            </view>
        </view>

        <!-- 加载中 -->
        <view v-if="loading" class="loading-state">
            <view class="spinner" />
            <text class="loading-text">正在计算统计数据...</text>
        </view>

        <!-- 数据内容 -->
        <view v-else class="stats-content">
            <!-- 汇总卡片 -->
            <view class="summary-card">
                <text class="summary-label">{{ formatMonth(selectedMonth) }}{{ activeTab === 'expense' ? '总支出' : '总收入' }}</text>
                <text class="summary-total">¥{{ formatNum(totalAmount) }}</text>
                <view v-if="activeTab === 'expense' && stats" class="budget-line">
                    <text class="budget-text">预算进度 {{ budgetProgress }}%（{{ stats.totalExpense > stats.budget ? '超支' : '未超支' }}）</text>
                </view>
            </view>

            <!-- 分类占比饼图（用进度条模拟） -->
            <view class="chart-card">
                <view class="chart-title">
                    <text class="chart-icon">🍩</text>
                    <text class="chart-label">分类占比分析</text>
                </view>

                <view v-if="currentStats.length === 0" class="chart-empty">
                    <text class="chart-empty-icon">📊</text>
                    <text class="chart-empty-text">该月暂无账单数据</text>
                </view>

                <view v-else class="category-bars">
                    <view v-for="(item, index) in currentStats" :key="item.code" class="cat-bar-item">
                        <view class="cat-bar-header">
                            <view class="cat-bar-left">
                                <text class="cat-bar-icon">{{ item.icon }}</text>
                                <text class="cat-bar-name">{{ item.name }}</text>
                                <text class="cat-bar-pct">{{ item.percentage }}%</text>
                            </view>
                            <text class="cat-bar-amount">¥{{ item.amount.toFixed(2) }}</text>
                        </view>
                        <view class="cat-bar-track">
                            <view
                                class="cat-bar-fill"
                                :style="{ width: item.percentage + '%', backgroundColor: colors[index % colors.length] }"
                            />
                        </view>
                    </view>
                </view>
            </view>

            <!-- 每日趋势柱状图（用进度条模拟） -->
            <view class="chart-card">
                <view class="chart-title">
                    <text class="chart-icon">📈</text>
                    <text class="chart-label">每日交易分布</text>
                </view>

                <view v-if="activeTrendData.length === 0" class="chart-empty">
                    <text class="chart-empty-icon">📈</text>
                    <text class="chart-empty-text">暂无每日走势</text>
                </view>

                <view v-else class="trend-bars">
                    <view v-for="(d, idx) in activeTrendData" :key="idx" class="trend-item">
                        <view class="trend-labels">
                            <text class="trend-day">{{ d.day }}</text>
                            <text class="trend-amount">¥{{ (activeTab === 'expense' ? d.expense : d.income).toFixed(0) }}</text>
                        </view>
                        <view class="trend-track">
                            <view
                                class="trend-fill"
                                :style="{
                                    width: maxTrendVal > 0 ? ((activeTab === 'expense' ? d.expense : d.income) / maxTrendVal * 100) + '%' : '0%',
                                    backgroundColor: activeTab === 'expense' ? '#f43f5e' : '#10b981'
                                }"
                            />
                        </view>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { api } from '@/utils/api.js';

// ===== 状态 =====
const monthOptions = ['2026-07', '2026-06', '2026-05', '2026-04', '2026-03', '2026-02'];
const selectedMonth = ref('2026-07');
const activeTab = ref('expense');
const loading = ref(true);
const stats = ref(null);
const dailyTrend = ref([]);

const colors = ['#4CAF50','#FF9800','#2196F3','#E91E63','#9C27B0','#00BCD4','#FFEB3B','#795548','#607D8B','#FF5722','#9E9E9E','#3F51B5'];

// ===== 加载数据 =====
async function loadStats() {
    loading.value = true;
    try {
        const [s, t] = await Promise.all([
            api.getMonthlyStats(selectedMonth.value),
            api.getDailyTrend(selectedMonth.value)
        ]);
        stats.value = s;
        dailyTrend.value = t;
    } catch (e) {
        console.error('加载统计数据失败:', e);
    } finally {
        loading.value = false;
    }
}

// 初始加载 + 月份变化时重新加载
loadStats();
watch(selectedMonth, loadStats);

// ===== 计算属性 =====
const currentStats = computed(() =>
    activeTab.value === 'expense'
        ? stats.value?.categoryExpenses || []
        : stats.value?.categoryIncomes || []
);

const totalAmount = computed(() =>
    activeTab.value === 'expense'
        ? stats.value?.totalExpense || 0
        : stats.value?.totalIncome || 0
);

const budgetProgress = computed(() => {
    if (!stats.value || stats.value.budget <= 0) return 0;
    return Math.round((stats.value.totalExpense / stats.value.budget) * 100);
});

const activeTrendData = computed(() =>
    dailyTrend.value.filter(d => d.expense > 0 || d.income > 0)
);

const maxTrendVal = computed(() => {
    let max = 0;
    activeTrendData.value.forEach(d => {
        const v = activeTab.value === 'expense' ? d.expense : d.income;
        if (v > max) max = v;
    });
    return max;
});

function onMonthChange(e) {
    selectedMonth.value = e.detail.value.slice(0, 7);
}

function formatMonth(month) {
    const [y, m] = month.split('-');
    return `${y}年${m}月`;
}

function formatNum(num) {
    return num.toLocaleString('zh-CN', { minimumFractionDigits: 2 });
}
</script>

<style scoped>
.stats-container { min-height: 100vh; background: #f8fafc; padding-bottom: 40rpx; }

/* 控制栏 */
.stats-controls {
    display: flex; justify-content: space-between; align-items: center;
    background: #fff; padding: 24rpx 28rpx; border-bottom: 1rpx solid #f1f5f9;
}
.month-picker {
    display: flex; align-items: center; gap: 10rpx;
    border: 1rpx solid #e2e8f0; background: #f8fafc;
    border-radius: 16rpx; padding: 12rpx 20rpx;
}
.month-text { font-size: 26rpx; font-weight: 600; color: #1e293b; font-family: monospace; }

.type-tabs { display: flex; background: #f1f5f9; border-radius: 16rpx; padding: 4rpx; }
.type-tab {
    padding: 12rpx 24rpx; border-radius: 14rpx;
    font-size: 24rpx; font-weight: 600; color: #94a3b8; transition: all 0.2s;
}
.type-tab.tab-active { background: #fff; color: #10b981; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04); }

/* 加载 */
.loading-state { display: flex; flex-direction: column; align-items: center; padding: 160rpx 0; }
.spinner { width: 64rpx; height: 64rpx; border: 6rpx solid #10b981; border-top-color: transparent; border-radius: 50%; animation: spin 0.6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.loading-text { font-size: 26rpx; color: #94a3b8; margin-top: 20rpx; }

/* 汇总卡片 */
.summary-card {
    background: #fff; margin: 24rpx; border-radius: 24rpx;
    padding: 36rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
}
.summary-label { font-size: 26rpx; color: #94a3b8; }
.summary-total { font-size: 60rpx; font-weight: 800; color: #1e293b; font-family: monospace; display: block; margin-top: 8rpx; }
.budget-line { margin-top: 20rpx; padding-top: 20rpx; border-top: 1rpx solid #f8fafc; }
.budget-text { font-size: 24rpx; color: #64748b; font-family: monospace; }

/* 图表卡片 */
.chart-card {
    background: #fff; margin: 0 24rpx 24rpx; border-radius: 24rpx;
    padding: 28rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
}
.chart-title { display: flex; align-items: center; gap: 10rpx; margin-bottom: 24rpx; }
.chart-icon { font-size: 32rpx; }
.chart-label { font-size: 26rpx; font-weight: 600; color: #64748b; }
.chart-empty { text-align: center; padding: 60rpx 0; }
.chart-empty-icon { font-size: 72rpx; display: block; }
.chart-empty-text { font-size: 24rpx; color: #94a3b8; margin-top: 8rpx; }

/* 分类排行条 */
.cat-bar-item { margin-bottom: 28rpx; }
.cat-bar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10rpx; }
.cat-bar-left { display: flex; align-items: center; gap: 16rpx; }
.cat-bar-icon { font-size: 36rpx; }
.cat-bar-name { font-size: 26rpx; font-weight: 600; color: #1e293b; }
.cat-bar-pct { font-size: 22rpx; color: #94a3b8; font-family: monospace; }
.cat-bar-amount { font-size: 26rpx; font-weight: 600; color: #64748b; font-family: monospace; }
.cat-bar-track { height: 14rpx; background: #f1f5f9; border-radius: 14rpx; overflow: hidden; }
.cat-bar-fill { height: 100%; border-radius: 14rpx; transition: width 0.5s; }

/* 每日趋势 */
.trend-item { margin-bottom: 20rpx; }
.trend-labels { display: flex; justify-content: space-between; margin-bottom: 6rpx; }
.trend-day { font-size: 22rpx; color: #94a3b8; }
.trend-amount { font-size: 22rpx; color: #64748b; font-family: monospace; font-weight: 600; }
.trend-track { height: 10rpx; background: #f1f5f9; border-radius: 10rpx; overflow: hidden; }
.trend-fill { height: 100%; border-radius: 10rpx; transition: width 0.5s; min-width: 4rpx; }
</style>
