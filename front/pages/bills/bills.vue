<template>
    <view class="bills-container">
        <view class="month-bar">
            <text class="month-arrow" @click="prevMonth">‹</text>
            <picker mode="date" fields="month" :value="month + '-01'" @change="onMonthChange">
                <text class="month-text">📅 {{ month }}</text>
            </picker>
            <text class="month-arrow" @click="nextMonth">›</text>
        </view>

        <view class="summary-bar">
            <text class="summary-tag">支出 ¥{{ totalExpense.toFixed(2) }}</text>
            <text class="summary-tag income">收入 ¥{{ totalIncome.toFixed(2) }}</text>
            <text class="summary-tag">共 {{ list.length }} 笔</text>
        </view>

        <view class="filter-bar">
            <text :class="['filter-btn', filter === 'all' ? 'active' : '']" @click="filter = 'all'">全部</text>
            <text :class="['filter-btn', filter === 'expense' ? 'active' : '']" @click="filter = 'expense'">支出</text>
            <text :class="['filter-btn', filter === 'income' ? 'active' : '']" @click="filter = 'income'">收入</text>
        </view>

        <view v-if="filteredList.length === 0" class="empty-state">
            <text>📝 暂无记录</text>
        </view>

        <view v-for="bill in filteredList" :key="bill.id" class="bill-card">
            <view class="bill-left">
                <text class="bill-cat">{{ bill.category }}</text>
                <text class="bill-note" v-if="bill.note">{{ bill.note }}</text>
                <text class="bill-date">{{ bill.billDate }}</text>
            </view>
            <view class="bill-right">
                <text :class="bill.type === 'expense' ? 'expense' : 'income'">
                    {{ bill.type === 'expense' ? '-' : '+' }}{{ bill.amount.toFixed(2) }}
                </text>
                <text class="del-btn" @click="handleDelete(bill.id)">🗑</text>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { getBills, deleteBill } from '@/api/bills.js';
import { useUserStore } from '@/store/user.js';

const user = useUserStore();
const month = ref(new Date().toISOString().slice(0, 7));
const filter = ref('all');
const list = ref([]);

async function load() {
  if (!user.isLogin) { list.value = []; return; }
  try {
    const data = await getBills({ pageSize: 200, month: month.value });
    list.value = data?.records || [];
  } catch (e) { /* */ }
}

import { onShow } from '@dcloudio/uni-app';
onShow(() => load());

const filteredList = computed(() => list.value.filter(b => filter.value === 'all' || b.type === filter.value));
const totalExpense = computed(() => list.value.filter(b => b.type === 'expense').reduce((s, b) => s + b.amount, 0));
const totalIncome = computed(() => list.value.filter(b => b.type === 'income').reduce((s, b) => s + b.amount, 0));

function prevMonth() {
  const d = new Date(month.value + '-01'); d.setMonth(d.getMonth() - 1);
  month.value = d.toISOString().slice(0, 7); load();
}
function nextMonth() {
  const d = new Date(month.value + '-01'); d.setMonth(d.getMonth() + 1);
  month.value = d.toISOString().slice(0, 7); load();
}
function onMonthChange(e) { month.value = e.detail.value.slice(0, 7); load(); }

async function handleDelete(id) {
  const { confirm } = await uni.showModal({ title: '确认删除？' });
  if (confirm) {
    await deleteBill(id);
    list.value = list.value.filter(b => b.id !== id);
    uni.showToast({ title: '已删除', icon: 'none' });
  }
}
</script>

<style scoped>
.bills-container { min-height: 100vh; background: #f8fafc; padding-bottom: 120rpx; }
.month-bar { display: flex; align-items: center; justify-content: center; background: #fff; padding: 20rpx; }
.month-arrow { font-size: 48rpx; color: #64748b; padding: 0 32rpx; }
.month-text { font-size: 28rpx; font-weight: 700; }
.summary-bar { display: flex; gap: 16rpx; padding: 16rpx 24rpx; background: #fff; }
.summary-tag { font-size: 22rpx; padding: 8rpx 20rpx; background: #f1f5f9; border-radius: 20rpx; color: #64748b; }
.summary-tag.income { color: #10b981; }
.filter-bar { display: flex; gap: 12rpx; padding: 16rpx 24rpx; }
.filter-btn { font-size: 24rpx; padding: 12rpx 32rpx; border-radius: 20rpx; background: #f1f5f9; color: #94a3b8; }
.filter-btn.active { background: #10b981; color: #fff; }
.empty-state { text-align: center; padding: 120rpx 0; color: #94a3b8; font-size: 28rpx; }
.bill-card { display: flex; justify-content: space-between; align-items: center; background: #fff; margin: 12rpx 24rpx; padding: 24rpx; border-radius: 16rpx; }
.bill-left { display: flex; flex-direction: column; gap: 4rpx; }
.bill-cat { font-size: 28rpx; font-weight: 600; color: #1e293b; }
.bill-note { font-size: 22rpx; color: #94a3b8; }
.bill-date { font-size: 20rpx; color: #cbd5e1; font-family: monospace; }
.bill-right { display: flex; align-items: center; gap: 12rpx; }
.expense { font-size: 28rpx; font-weight: 700; color: #f43f5e; font-family: monospace; }
.income { font-size: 28rpx; font-weight: 700; color: #10b981; font-family: monospace; }
.del-btn { font-size: 28rpx; opacity: 0.4; }
</style>
