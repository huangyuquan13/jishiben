<template>
    <view class="stats-container">
        <MonthPicker v-model="month" @update:model-value="load" />

        <LoadingSpinner v-if="loading" padding="160rpx 0" />
        
        <EmptyState 
            v-else-if="!hasData" 
            icon="📊" 
            text="本月暂无数据" 
            icon-size="80rpx"
            padding="160rpx 0"
        />
        
        <view v-else>
            <view class="summary-cards">
                <view class="s-card">
                    <text class="s-label">收入</text>
                    <text class="s-val income">¥{{ fmt(stats.totalIncome) }}</text>
                </view>
                <view class="s-card">
                    <text class="s-label">支出</text>
                    <text class="s-val expense">¥{{ fmt(stats.totalExpense) }}</text>
                </view>
                <view class="s-card">
                    <text class="s-label">结余</text>
                    <text :class="['s-val', stats.balance >= 0 ? 'income' : 'expense']">¥{{ fmt(stats.balance) }}</text>
                </view>
            </view>
            
            <uni-card margin="24rpx" :is-shadow="true">
                <uni-section title="支出分类占比" type="line" />
                <view class="chart-wrap">
                    <view ref="pieRef" class="chart-box"></view>
                </view>
            </uni-card>
            
            <uni-card margin="24rpx" :is-shadow="true">
                <uni-section title="收支对比" type="line" />
                <view class="chart-wrap">
                    <view ref="barRef" class="chart-box"></view>
                </view>
            </uni-card>
        </view>
    </view>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';
import { getStats } from '@/api/bills.js';
import { useUserStore } from '@/store/user.js';
import { onShow } from '@dcloudio/uni-app';
import MonthPicker from '@/components/MonthPicker.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import EmptyState from '@/components/EmptyState.vue';
import * as echarts from 'echarts';

const user = useUserStore();
const month = ref(new Date().toISOString().slice(0, 7));
const stats = ref({ 
  totalIncome: 0, 
  totalExpense: 0, 
  balance: 0, 
  recordCount: 0, 
  categoryRanking: [] 
});
const loading = ref(true);
const hasData = computed(() => stats.value.recordCount > 0);

const pieRef = ref(null);
const barRef = ref(null);
let pieChart = null;
let barChart = null;

async function load() {
  if (!user.isLogin) { 
    stats.value = { 
      totalIncome: 0, 
      totalExpense: 0, 
      balance: 0, 
      recordCount: 0, 
      categoryRanking: [] 
    }; 
    loading.value = false; 
    return; 
  }
  destroyCharts();
  loading.value = true;
  try {
    stats.value = await getStats(month.value) || stats.value;
    await nextTick();
    setTimeout(() => renderCharts(), 300);
  } catch (e) { 
    console.error('加载统计数据失败:', e);
  }
  loading.value = false;
}

onShow(() => load());

function destroyCharts() {
  if (pieChart) { 
    pieChart.dispose(); 
    pieChart = null; 
  }
  if (barChart) { 
    barChart.dispose(); 
    barChart = null; 
  }
}

function renderCharts() {
  if (!hasData.value) return;
  
  const pieDom = pieRef.value?.$el || pieRef.value;
  if (pieDom) {
    if (!pieChart) pieChart = echarts.init(pieDom);
    pieChart.setOption({
      tooltip: { 
        trigger: 'item', 
        formatter: '{b}: ¥{c}\n占比 {d}%' 
      },
      series: [{ 
        type: 'pie', 
        radius: ['40%', '70%'], 
        data: stats.value.categoryRanking.map(c => ({ 
          name: c.name, 
          value: c.amount 
        })), 
        label: { 
          formatter: '{b}\n¥{c}' 
        } 
      }],
      color: [
        '#10b981', '#34d399', '#6ee7b7', '#f43f5e', '#fb7185', 
        '#fda4af', '#fbbf24', '#f59e0b', '#a7f3d0', '#fecdd3'
      ],
    });
  }
  
  const barDom = barRef.value?.$el || barRef.value;
  if (barDom) {
    if (!barChart) barChart = echarts.init(barDom);
    barChart.setOption({
      tooltip: { 
        trigger: 'axis' 
      },
      xAxis: { 
        type: 'category', 
        data: ['本月'] 
      },
      yAxis: { 
        type: 'value' 
      },
      series: [
        { 
          name: '收入', 
          type: 'bar', 
          data: [stats.value.totalIncome], 
          color: '#10b981', 
          barWidth: 40 
        },
        { 
          name: '支出', 
          type: 'bar', 
          data: [stats.value.totalExpense], 
          color: '#f43f5e', 
          barWidth: 40 
        },
      ],
    });
  }
}

function fmt(n) { 
  return (n || 0).toFixed(2); 
}
</script>

<style scoped>
.stats-container { 
  min-height: 100vh; 
  background: #f8fafc; 
  padding-bottom: 120rpx; 
}

.summary-cards { 
  display: flex; 
  gap: 16rpx; 
  padding: 24rpx; 
}

.s-card { 
  flex: 1; 
  background: #fff; 
  border-radius: 16rpx; 
  padding: 24rpx; 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
}

.s-label { 
  font-size: 22rpx; 
  color: #94a3b8; 
  display: block; 
}

.s-val { 
  font-size: 36rpx; 
  font-weight: 800; 
  font-family: monospace; 
  display: block; 
  margin-top: 8rpx; 
  text-align: center; 
}

.income { 
  color: #10b981; 
}

.expense { 
  color: #f43f5e; 
}

.chart-wrap { 
  display: flex; 
  justify-content: center; 
}

.chart-box { 
  width: 100%; 
  height: 400rpx; 
}
</style>
