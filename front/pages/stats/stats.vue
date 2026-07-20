<template>
    <view class="stats-container">
        <MonthPicker v-model="month" @update:model-value="load" />

        <view v-if="loading" class="loading-wrap"><view class="spinner" /><text class="loading-text">加载中...</text></view>
        <template v-else>

        <view v-if="!hasData" class="empty-state">
            <text class="empty-icon">📊</text>
            <text class="empty-text">本月暂无数据</text>
        </view>

        <template v-else>
            <!-- 汇总卡片 -->
            <view class="summary-cards">
                <view class="s-card"><text class="s-label">收入</text><text class="s-val income">¥{{ fmt(stats.totalIncome) }}</text></view>
                <view class="s-card"><text class="s-label">支出</text><text class="s-val expense">¥{{ fmt(stats.totalExpense) }}</text></view>
                <view class="s-card"><text class="s-label">结余</text><text :class="['s-val', stats.balance >= 0 ? 'income' : 'expense']">¥{{ fmt(stats.balance) }}</text></view>
            </view>

            <!-- 饼图：支出分类占比 -->
            <uni-card margin="24rpx" :is-shadow="true">
                <uni-section title="支出分类占比" type="line" />
                <view class="chart-wrap"><view id="pieChart" class="chart-box"></view></view>
            </uni-card>

            <!-- 柱状图：收支对比 -->
            <uni-card margin="24rpx" :is-shadow="true">
                <uni-section title="收支对比" type="line" />
                <view class="chart-wrap"><view id="barChart" class="chart-box"></view></view>
            </uni-card>
        </template>
        </template>
    </view>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';
import MonthPicker from '@/components/MonthPicker.vue';
import { getStats } from '@/api/bills.js';
import { useUserStore } from '@/store/user.js';
import { onShow } from '@dcloudio/uni-app';
import * as echarts from 'echarts';

const user = useUserStore();
const month = ref(new Date().toISOString().slice(0, 7));
const stats = ref({ totalIncome: 0, totalExpense: 0, balance: 0, recordCount: 0, categoryRanking: [] });
const loading = ref(true);
const hasData = computed(() => stats.value.recordCount > 0);

let pieChart = null;
let barChart = null;

async function load() {
  if (!user.isLogin) { stats.value = { totalIncome: 0, totalExpense: 0, balance: 0, recordCount: 0, categoryRanking: [] }; loading.value = false; return; }
  loading.value = true;
  try {
    stats.value = await getStats(month.value) || stats.value;
    await nextTick();
    renderCharts();
  } catch (e) { /* */ }
  loading.value = false;
}

onShow(() => { load(); });

function fmt(n) { return (n || 0).toFixed(2); }

function renderCharts() {
  if (!hasData.value) return;

  // 饼图
  const pieDom = document.getElementById('pieChart');
  if (pieDom) {
    if (!pieChart) pieChart = echarts.init(pieDom);
    const pieData = stats.value.categoryRanking.map(c => ({ name: c.name, value: c.amount }));
    pieChart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: ¥{c}\n占比 {d}%' },
      series: [{
        type: 'pie', radius: ['40%', '70%'], center: ['50%', '50%'],
        data: pieData,
        label: { formatter: '{b}\n¥{c}' },
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      }],
      color: ['#10b981','#34d399','#6ee7b7','#a7f3d0','#f43f5e','#fb7185','#fda4af','#fecdd3','#fbbf24','#f59e0b'],
    });
  }

  // 柱状图
  const barDom = document.getElementById('barChart');
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
