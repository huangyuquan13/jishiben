<template>
    <view class="stats-container">
        <view class="month-bar">
            <text class="arrow" @click="prevMonth">‹</text>
            <picker mode="date" fields="month" :value="month + '-01'" @change="onPick">
                <text class="month-text">📅 {{ displayMonth }}</text>
            </picker>
            <text class="arrow" @click="nextMonth">›</text>
        </view>

        <view v-if="loading" class="loading-wrap"><view class="spinner" /><text class="loading-text">加载中...</text></view>
        <view v-else-if="!hasData" class="empty-state">
            <text class="empty-icon">📊</text>
            <text class="empty-text">本月暂无数据</text>
        </view>
        <view v-else>
            <view class="summary-cards">
                <view class="s-card"><text class="s-label">收入</text><text class="s-val income">¥{{ fmt(stats.totalIncome) }}</text></view>
                <view class="s-card"><text class="s-label">支出</text><text class="s-val expense">¥{{ fmt(stats.totalExpense) }}</text></view>
                <view class="s-card"><text class="s-label">结余</text><text :class="['s-val', stats.balance >= 0 ? 'income' : 'expense']">¥{{ fmt(stats.balance) }}</text></view>
            </view>
            <uni-card margin="24rpx" :is-shadow="true">
                <uni-section title="支出分类占比" type="line" />
                <view class="chart-wrap"><view ref="pieRef" class="chart-box"></view></view>
            </uni-card>
            <uni-card margin="24rpx" :is-shadow="true">
                <uni-section title="收支对比" type="line" />
                <view class="chart-wrap"><view ref="barRef" class="chart-box"></view></view>
            </uni-card>
        </view>
    </view>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';
import { getStats } from '@/api/bills.js';
import { useUserStore } from '@/store/user.js';
import { onShow } from '@dcloudio/uni-app';
import * as echarts from 'echarts';

const user = useUserStore();
const month = ref(new Date().toISOString().slice(0, 7));
const stats = ref({ totalIncome: 0, totalExpense: 0, balance: 0, recordCount: 0, categoryRanking: [] });
const loading = ref(true);
const hasData = computed(() => stats.value.recordCount > 0);
const displayMonth = computed(() => {
  const [y, m] = month.value.split('-');
  return `${y}年${m}月`;
});

const pieRef = ref(null);
const barRef = ref(null);
let pieChart = null;
let barChart = null;

async function load() {
  if (!user.isLogin) { stats.value = { totalIncome: 0, totalExpense: 0, balance: 0, recordCount: 0, categoryRanking: [] }; loading.value = false; return; }
  loading.value = true;
  try {
    stats.value = await getStats(month.value) || stats.value;
    await nextTick();
    // H5 DOM 渲染延迟，多等一帧
    setTimeout(() => renderCharts(), 300);
  } catch (e) { /* */ }
  loading.value = false;
}

onShow(() => load());

function prevMonth() {
  const d = new Date(month.value + '-01'); d.setMonth(d.getMonth() - 1);
  month.value = d.toISOString().slice(0, 7); load();
}
function nextMonth() {
  const d = new Date(month.value + '-01'); d.setMonth(d.getMonth() + 1);
  month.value = d.toISOString().slice(0, 7); load();
}
function onPick(e) { month.value = e.detail.value.slice(0, 7); load(); }
function fmt(n) { return (n || 0).toFixed(2); }

function renderCharts() {
  if (!hasData.value) return;
  const pieDom = pieRef.value?.$el || pieRef.value;
  if (pieDom) {
    if (!pieChart) pieChart = echarts.init(pieDom);
    pieChart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: ¥{c}\n占比 {d}%' },
      series: [{ type: 'pie', radius: ['40%','70%'], data: stats.value.categoryRanking.map(c => ({ name: c.name, value: c.amount })), label: { formatter: '{b}\n¥{c}' } }],
      color: ['#10b981','#34d399','#6ee7b7','#f43f5e','#fb7185','#fda4af','#fbbf24','#f59e0b','#a7f3d0','#fecdd3'],
    });
  }
  const barDom = barRef.value?.$el || barRef.value;
  if (barDom) {
    if (!barChart) barChart = echarts.init(barDom);
    barChart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['本月'] },
      yAxis: { type: 'value' },
      series: [
        { name: '收入', type: 'bar', data: [stats.value.totalIncome], color: '#10b981', barWidth: 40 },
        { name: '支出', type: 'bar', data: [stats.value.totalExpense], color: '#f43f5e', barWidth: 40 },
      ],
    });
  }
}
</script>

<style scoped>
.stats-container { min-height: 100vh; background: #f8fafc; padding-bottom: 120rpx; }
.month-bar { display: flex; align-items: center; justify-content: center; background: #fff; padding: 20rpx; }
.arrow { font-size: 48rpx; color: #64748b; padding: 0 32rpx; }
.month-text { font-size: 28rpx; font-weight: 700; color: #1e293b; }
.loading-wrap { display: flex; flex-direction: column; align-items: center; padding: 160rpx 0; }
.spinner { width: 48rpx; height: 48rpx; border: 4rpx solid #e2e8f0; border-top-color: #10b981; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.loading-text { font-size: 24rpx; color: #94a3b8; margin-top: 16rpx; }
.empty-state { text-align: center; padding: 160rpx 0; }
.empty-icon { font-size: 80rpx; display: block; }
.empty-text { font-size: 26rpx; color: #94a3b8; margin-top: 16rpx; }
.summary-cards { display: flex; gap: 16rpx; padding: 24rpx; }
.s-card { flex: 1; background: #fff; border-radius: 16rpx; padding: 24rpx; text-align: center; }
.s-label { font-size: 22rpx; color: #94a3b8; display: block; }
.s-val { font-size: 36rpx; font-weight: 800; font-family: monospace; display: block; margin-top: 8rpx; }
.income { color: #10b981; }
.expense { color: #f43f5e; }
.chart-wrap { display: flex; justify-content: center; }
.chart-box { width: 100%; height: 400rpx; }
</style>
