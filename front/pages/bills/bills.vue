<template>
    <view class="bills-container">
        <!-- 顶部月份选择器 -->
        <view class="month-bar">
            <view class="month-arrow" @click="prevMonth">
                <text :class="canPrev ? '' : 'arrow-disabled'">‹</text>
            </view>
            <picker mode="date" fields="month" :value="selectedMonth + '-01'" @change="onMonthChange">
                <view class="month-display">
                    <text class="month-icon">📅</text>
                    <text class="month-text">{{ formatMonthLabel(selectedMonth) }}</text>
                    <text class="month-drop">▼</text>
                </view>
            </picker>
            <view class="month-arrow" @click="nextMonth">
                <text :class="canNext ? '' : 'arrow-disabled'">›</text>
            </view>
        </view>

        <!-- 当月汇总 -->
        <view class="summary-bar">
            <view class="summary-item">
                <text class="summary-label">当月总支出</text>
                <text class="summary-amount expense">¥{{ totalExpense.toFixed(2) }}</text>
            </view>
            <view class="summary-item">
                <text class="summary-label">当月总收入</text>
                <text class="summary-amount income">¥{{ totalIncome.toFixed(2) }}</text>
            </view>
        </view>

        <!-- 搜索 + 筛选 -->
        <view class="filter-bar">
            <uni-search-bar
                v-model="searchQuery"
                placeholder="搜索账单备注、分类或金额..."
                radius="20"
                clearButton="auto"
                cancelButton="none"
                bgColor="#f8fafc"
                @clear="searchQuery = ''"
            />

            <view class="filter-row">
                <view class="type-toggle">
                    <text
                        :class="['toggle-btn', typeFilter === 'all' ? 'toggle-all-active' : '']"
                        @click="typeFilter = 'all'"
                    >全部</text>
                    <text
                        :class="['toggle-btn', typeFilter === 'expense' ? 'toggle-expense-active' : '']"
                        @click="typeFilter = 'expense'"
                    >支出</text>
                    <text
                        :class="['toggle-btn', typeFilter === 'income' ? 'toggle-income-active' : '']"
                        @click="typeFilter = 'income'"
                    >收入</text>
                </view>
                <picker :value="catIndex" :range="catOptions" range-key="name" @change="onCatChange">
                    <view class="filter-cat">
                        <text>🔽 {{ catOptions[catIndex].name }}</text>
                    </view>
                </picker>
            </view>
        </view>

        <!-- 账单列表（按日期分组） -->
        <view class="bills-list">
            <view v-if="groupedBills.length === 0" class="empty-state">
                <text class="empty-icon">🔍</text>
                <text class="empty-title">该月未筛选到账单记录</text>
                <text class="empty-desc">您可以试着切换分类、月份或清除搜索条件</text>
            </view>

            <view v-for="group in groupedBills" :key="group.date" class="day-group">
                <!-- 日期标题 -->
                <view class="day-header">
                    <text class="day-date">{{ formatDayHeader(group.date) }}</text>
                    <view class="day-summary">
                        <text v-if="group.dayTotalIncome > 0" class="day-income">收: ¥{{ group.dayTotalIncome.toFixed(2) }}</text>
                        <text v-if="group.dayTotalExpense > 0" class="day-expense">支: ¥{{ group.dayTotalExpense.toFixed(2) }}</text>
                    </view>
                </view>

                <!-- 当日账单明细 -->
                <view v-for="bill in group.items" :key="bill.id" class="bill-row">
                    <view class="bill-left">
                        <view class="bill-avatar">
                            <text>{{ bill.categoryIcon }}</text>
                        </view>
                        <view class="bill-info">
                            <view class="bill-title-row">
                                <text class="bill-note">{{ bill.note }}</text>
                                <text class="bill-tag">{{ bill.categoryName }}</text>
                            </view>
                            <text class="bill-time">{{ formatTime(bill.createTime) }}</text>
                        </view>
                    </view>
                    <view class="bill-right">
                        <text :class="bill.type === 'expense' ? 'text-expense' : 'text-income'">
                            {{ bill.type === 'expense' ? '-' : '+' }}{{ bill.amount.toFixed(2) }}
                        </text>
                        <text class="delete-btn" @click="handleDelete(bill.id)">🗑</text>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { api } from '@/utils/api.js';

// ===== 状态 =====
const monthOptions = ['2026-07', '2026-06', '2026-05', '2026-04', '2026-03', '2026-02'];
const selectedMonth = ref('2026-07');
const searchQuery = ref('');
const typeFilter = ref('all');
const selectedCatCode = ref('all');
const allBills = ref([]);

// ===== 生命周期 =====
async function loadAllBills() {
    try {
        const data = await api.getBills('2026-07');
        allBills.value = data || [];
        getApp().globalData.bills = allBills.value;
    } catch (e) {
        allBills.value = getApp().globalData.bills || [];
    }
}

loadAllBills();

// 每次显示刷新
import { onShow } from '@dcloudio/uni-app';
onShow(() => {
    loadAllBills();
});

// ===== 月份导航 =====
const monthIndex = computed(() => monthOptions.indexOf(selectedMonth.value));
const canPrev = computed(() => monthIndex.value < monthOptions.length - 1);
const canNext = computed(() => monthIndex.value > 0);

function prevMonth() {
    if (canPrev.value) selectedMonth.value = monthOptions[monthIndex.value + 1];
}
function nextMonth() {
    if (canNext.value) selectedMonth.value = monthOptions[monthIndex.value - 1];
}
function onMonthChange(e) {
    selectedMonth.value = e.detail.value.slice(0, 7);
}

// ===== 分类下拉 =====
const availableCategories = computed(() => {
    const codes = new Map();
    allBills.value.forEach(b => codes.set(b.category, b.categoryName));
    const list = [{ code: 'all', name: '全部分类' }];
    codes.forEach((name, code) => list.push({ code, name }));
    return list;
});

const catOptions = computed(() => availableCategories.value.map(c => c.name));
const catIndex = computed(() => {
    const idx = availableCategories.value.findIndex(c => c.code === selectedCatCode.value);
    return idx >= 0 ? idx : 0;
});

function onCatChange(e) {
    const cat = availableCategories.value[e.detail.value];
    if (cat) selectedCatCode.value = cat.code;
}

// ===== 过滤账单 =====
const filteredBills = computed(() => {
    return allBills.value.filter(bill => {
        if (!bill.date.startsWith(selectedMonth.value)) return false;
        if (typeFilter.value !== 'all' && bill.type !== typeFilter.value) return false;
        if (selectedCatCode.value !== 'all' && bill.category !== selectedCatCode.value) return false;
        if (searchQuery.value.trim()) {
            const q = searchQuery.value.toLowerCase();
            if (!bill.note.toLowerCase().includes(q) &&
                !bill.categoryName.toLowerCase().includes(q) &&
                !bill.amount.toString().includes(q)) return false;
        }
        return true;
    });
});

// ===== 按月汇总 =====
const totalIncome = computed(() =>
    allBills.value
        .filter(b => b.date.startsWith(selectedMonth.value) && b.type === 'income')
        .reduce((s, b) => s + b.amount, 0)
);

const totalExpense = computed(() =>
    allBills.value
        .filter(b => b.date.startsWith(selectedMonth.value) && b.type === 'expense')
        .reduce((s, b) => s + b.amount, 0)
);

// ===== 按日期分组 =====
const groupedBills = computed(() => {
    const groups = {};
    const sorted = [...filteredBills.value].sort((a, b) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return b.createTime - a.createTime;
    });

    sorted.forEach(bill => {
        if (!groups[bill.date]) {
            groups[bill.date] = { date: bill.date, dayTotalExpense: 0, dayTotalIncome: 0, items: [] };
        }
        groups[bill.date].items.push(bill);
        if (bill.type === 'expense') groups[bill.date].dayTotalExpense += bill.amount;
        else groups[bill.date].dayTotalIncome += bill.amount;
    });

    return Object.values(groups).sort((a, b) => b.date.localeCompare(a.date));
});

// ===== 工具函数 =====
function formatMonthLabel(month) {
    const [y, m] = month.split('-');
    return `${y}年${m}月`;
}

function formatDayHeader(dateStr) {
    const parts = dateStr.split('-');
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${parts[1]}/${parts[2]} ${weekDays[d.getDay()]}`;
}

function formatTime(timestamp) {
    const d = new Date(timestamp);
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
}

async function handleDelete(id) {
    uni.showModal({
        title: '确认删除？',
        content: '确定要删除这笔账单记录吗？',
        success: async (res) => {
            if (res.confirm) {
                await api.deleteBill(id);
                const app = getApp();
                app.globalData.bills = app.globalData.bills.filter(b => b.id !== id);
                allBills.value = app.globalData.bills;
                uni.showToast({ title: '已删除', icon: 'none' });
            }
        }
    });
}
</script>

<style scoped>
.bills-container { min-height: 100vh; background: #f8fafc; padding-bottom: 120rpx; }

/* 月份切换 */
.month-bar {
    display: flex; align-items: center; justify-content: center;
    background: #fff; padding: 20rpx 32rpx; border-bottom: 1rpx solid #f1f5f9;
}
.month-arrow { padding: 8rpx 16rpx; }
.month-arrow text { font-size: 48rpx; color: #64748b; font-weight: 300; }
.arrow-disabled { opacity: 0.2; }
.month-display {
    display: flex; align-items: center; gap: 12rpx;
    padding: 0 40rpx;
}
.month-icon { font-size: 32rpx; }
.month-text { font-size: 28rpx; font-weight: 700; color: #1e293b; font-family: monospace; }
.month-drop { font-size: 20rpx; color: #94a3b8; }

/* 汇总 */
.summary-bar {
    display: flex; background: #ecfdf5; padding: 20rpx 0;
}
.summary-item { flex: 1; text-align: center; }
.summary-label { font-size: 20rpx; color: #94a3b8; display: block; }
.summary-amount { font-size: 30rpx; font-weight: 700; font-family: monospace; }
.summary-amount.expense { color: #f43f5e; }
.summary-amount.income { color: #10b981; }

/* 搜索+筛选 */
.filter-bar { background: #fff; padding: 20rpx 24rpx; border-bottom: 1rpx solid #f1f5f9; }
.search-wrap {
    display: flex; align-items: center; background: #f8fafc;
    border: 1rpx solid #e2e8f0; border-radius: 20rpx;
    padding: 12rpx 20rpx; margin-bottom: 16rpx;
}
.search-icon { font-size: 28rpx; margin-right: 12rpx; }
.search-input { flex: 1; font-size: 24rpx; color: #1e293b; }
.search-clear { color: #94a3b8; font-size: 28rpx; padding: 4rpx 8rpx; }

.filter-row { display: flex; align-items: center; gap: 16rpx; }
.type-toggle {
    display: flex; background: #f1f5f9; border-radius: 14rpx; padding: 4rpx; flex: 1;
}
.toggle-btn {
    flex: 1; text-align: center; padding: 14rpx 0; border-radius: 12rpx;
    font-size: 22rpx; font-weight: 600; color: #94a3b8; transition: all 0.2s;
}
.toggle-all-active { background: #fff; color: #64748b; box-shadow: 0 2rpx 6rpx rgba(0,0,0,0.04); }
.toggle-expense-active { background: #fff; color: #f43f5e; box-shadow: 0 2rpx 6rpx rgba(0,0,0,0.04); }
.toggle-income-active { background: #fff; color: #10b981; box-shadow: 0 2rpx 6rpx rgba(0,0,0,0.04); }
.filter-cat {
    display: flex; align-items: center; gap: 8rpx;
    border: 1rpx solid #e2e8f0; border-radius: 16rpx;
    padding: 10rpx 20rpx; font-size: 22rpx;
}
.cat-select-text { color: #64748b; font-weight: 600; }

/* 账单列表 */
.bills-list { padding: 16rpx 24rpx; }

.empty-state { text-align: center; padding: 120rpx 0; }
.empty-icon { font-size: 80rpx; display: block; }
.empty-title { font-size: 26rpx; color: #94a3b8; display: block; margin-top: 16rpx; font-weight: 600; }
.empty-desc { font-size: 22rpx; color: #cbd5e1; display: block; margin-top: 8rpx; }

.day-group {
    background: #fff; border-radius: 20rpx; margin-bottom: 20rpx;
    overflow: hidden; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
}
.day-header {
    display: flex; justify-content: space-between; align-items: center;
    background: #f8fafc; padding: 16rpx 24rpx; border-bottom: 1rpx solid #f1f5f9;
}
.day-date { font-size: 24rpx; font-weight: 700; color: #64748b; }
.day-summary { display: flex; gap: 16rpx; font-size: 22rpx; font-family: monospace; }
.day-income { color: #10b981; }
.day-expense { color: #f43f5e; }

.bill-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 24rpx; border-bottom: 1rpx solid #f8fafc;
}
.bill-row:last-child { border-bottom: none; }
.bill-left { display: flex; align-items: center; gap: 20rpx; flex: 1; overflow: hidden; }
.bill-avatar {
    width: 68rpx; height: 68rpx; border-radius: 50%;
    background: #f8fafc; border: 1rpx solid #e2e8f0;
    display: flex; align-items: center; justify-content: center;
    font-size: 34rpx; flex-shrink: 0;
}
.bill-info { overflow: hidden; }
.bill-title-row { display: flex; align-items: center; gap: 10rpx; }
.bill-note { font-size: 26rpx; font-weight: 600; color: #1e293b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bill-tag { font-size: 18rpx; background: #f1f5f9; color: #94a3b8; padding: 4rpx 10rpx; border-radius: 8rpx; flex-shrink: 0; }
.bill-time { font-size: 20rpx; color: #94a3b8; margin-top: 6rpx; font-family: monospace; }

.bill-right { display: flex; align-items: center; gap: 16rpx; flex-shrink: 0; }
.text-expense { font-size: 26rpx; font-weight: 700; color: #f43f5e; font-family: monospace; }
.text-income { font-size: 26rpx; font-weight: 700; color: #10b981; font-family: monospace; }
.delete-btn { font-size: 28rpx; opacity: 0.5; padding: 4rpx; }
</style>
