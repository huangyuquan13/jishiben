<template>
    <view class="home-container">
        <!-- 顶部标题栏 -->
        <view class="home-header">
            <view class="header-left">
                <text class="header-title">记账小工具</text>
                <text class="header-subtitle" v-if="user.isLogin">{{ user.nickname }} · 云端同步</text>
                <text class="header-subtitle" v-else>点击「我的」登录</text>
            </view>
            <view class="header-action" @click="goToStats">
                <uni-icons type="bars" size="16" color="#10b981" />
                <text class="action-text">支出统计</text>
                <uni-icons type="arrowright" size="14" color="#94a3b8" />
            </view>
        </view>

        <!-- 月度汇总卡片 -->
        <uni-card margin="24rpx" :is-shadow="true">
            <view class="summary-row">
                <view class="summary-item">
                    <text class="summary-label">本月收入</text>
                    <text class="summary-amount income">¥{{ fmt(stats.totalIncome) }}</text>
                </view>
                <view class="summary-item summary-center">
                    <text class="summary-label">本月支出</text>
                    <text class="summary-amount expense">¥{{ fmt(stats.totalExpense) }}</text>
                </view>
                <view class="summary-item summary-right">
                    <text class="summary-label">结余</text>
                    <text :class="['summary-amount', stats.balance >= 0 ? 'income' : 'expense']">¥{{ fmt(stats.balance) }}</text>
                </view>
            </view>
        </uni-card>

        <!-- 记一笔按钮 -->
        <view class="quick-btn" @click="openPopup">
            <uni-icons type="plus-filled" size="22" color="#fff" />
            <text class="quick-btn-text">记一笔账单</text>
        </view>

        <!-- 最近账单 -->
        <uni-card margin="24rpx" :is-shadow="true">
            <uni-section title="最近账单" type="line" />
            <view v-if="recentBills.length === 0" class="empty-state">
                <text class="empty-icon">📝</text>
                <text class="empty-text">暂无账单记录，快记一笔吧！</text>
            </view>
            <uni-list v-else>
                <uni-list-item v-for="bill in recentBills" :key="bill.id" :border="true">
                    <template #body>
                        <view class="bill-row">
                            <view class="bill-info">
                                <text class="bill-cat">{{ bill.category }}</text>
                                <text class="bill-date">{{ bill.billDate }}</text>
                            </view>
                            <text :class="bill.type === 'expense' ? 'text-expense' : 'text-income'">
                                {{ bill.type === 'expense' ? '-' : '+' }}¥{{ bill.amount.toFixed(2) }}
                            </text>
                        </view>
                    </template>
                </uni-list-item>
            </uni-list>
        </uni-card>

        <!-- 记账弹窗 -->
        <uni-popup ref="popupRef" type="bottom" background-color="#fff" :safe-area="false">
            <view class="popup-content">
                <view class="drawer-handle" />
                <view class="drawer-header">
                    <text class="drawer-title">记一笔账单</text>
                    <uni-icons type="closeempty" size="20" color="#94a3b8" @click="closePopup" />
                </view>
                <view class="drawer-form">
                    <view v-if="formError" class="form-error"><text>⚠️ {{ formError }}</text></view>
                    <uni-section title="交易类型" type="line" />
                    <view class="type-toggle">
                        <text :class="['toggle-btn', txType === 'expense' ? 'active-expense' : '']" @click="txType = 'expense'">支出</text>
                        <text :class="['toggle-btn', txType === 'income' ? 'active-income' : '']" @click="txType = 'income'">收入</text>
                    </view>
                    <uni-section title="金额 (元)" type="line" />
                    <uni-easyinput v-model="formAmount" type="number" placeholder="0.00" :input-border="true" prefix="¥" />
                    <uni-section title="分类" type="line" />
                    <view class="cat-grid">
                        <view v-for="cat in currentCats" :key="cat" :class="['cat-item', selectedCat === cat ? 'cat-selected' : '']" @click="selectedCat = cat">
                            <text class="cat-name">{{ cat }}</text>
                        </view>
                    </view>
                    <uni-section title="日期 & 备注" type="line" />
                    <view class="form-row">
                        <uni-datetime-picker v-model="formDate" type="date" class="date-picker" />
                        <uni-easyinput v-model="formNote" placeholder="例如：午餐外卖" :input-border="true" class="note-input" />
                    </view>
                </view>
                <view class="submit-btn" @click="submitBill">
                    <uni-icons type="checkmarkempty" size="18" color="#fff" />
                    <text>保存账单</text>
                </view>
            </view>
        </uni-popup>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useUserStore } from '@/store/user.js';
import { getBills, createBill, deleteBill, getStats } from '@/api/bills.js';

const user = useUserStore();
const popupRef = ref(null);
const txType = ref('expense');
const formAmount = ref('');
const selectedCat = ref('餐饮');
const formDate = ref(getToday());
const formNote = ref('');
const formError = ref('');
const bills = ref([]);
const stats = ref({ totalIncome: 0, totalExpense: 0, balance: 0 });

const expenseCats = ['餐饮', '交通', '购物', '娱乐', '居住', '通讯', '医疗', '教育', '其他'];
const incomeCats = ['工资', '奖金', '兼职', '理财', '红包', '报销', '其他'];
const currentCats = computed(() => txType.value === 'expense' ? expenseCats : incomeCats);

async function loadData() {
  if (!user.isLogin) {
    bills.value = []; stats.value = { totalIncome: 0, totalExpense: 0, balance: 0 };
    return;
  }
  try {
    const month = new Date().toISOString().slice(0, 7);
    const [billData, statData] = await Promise.all([getBills({ pageSize: 50, month }), getStats(month)]);
    bills.value = billData?.records || [];
    stats.value = statData || { totalIncome: 0, totalExpense: 0, balance: 0 };
  } catch (e) { /* 网络不通静默处理 */ }
}

import { onShow } from '@dcloudio/uni-app';
onShow(() => loadData());

const recentBills = computed(() => bills.value.slice(0, 5));

function getToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function fmt(n) { return (n || 0).toFixed(2); }
function openPopup() { formError.value = ''; popupRef.value.open(); }
function closePopup() { popupRef.value.close(); }

async function submitBill() {
  formError.value = '';
  const amount = parseFloat(formAmount.value);
  if (isNaN(amount) || amount <= 0) { formError.value = '请输入大于 0 的有效金额'; return; }
  try {
    await createBill({ type: txType.value, amount, category: selectedCat.value, note: formNote.value.trim() || selectedCat.value, billDate: formDate.value });
    formAmount.value = ''; formNote.value = ''; popupRef.value.close();
    uni.showToast({ title: '保存成功', icon: 'success' });
    loadData();
  } catch (e) { formError.value = '保存失败，请重试'; }
}

function goToStats() { uni.navigateTo({ url: '/pages/stats/stats' }); }
</script>

<style scoped>
.home-container { min-height: 100vh; background: #f8fafc; padding-bottom: 120rpx; }
.home-header { background: #fff; padding: 30rpx 32rpx 24rpx; display: flex; justify-content: space-between; align-items: center; border-bottom: 1rpx solid #f1f5f9; }
.header-left { display: flex; flex-direction: column; }
.header-title { font-size: 40rpx; font-weight: 800; color: #1e293b; }
.header-subtitle { font-size: 22rpx; color: #94a3b8; margin-top: 4rpx; }
.header-action { display: flex; align-items: center; gap: 8rpx; background: #f1f5f9; padding: 12rpx 24rpx; border-radius: 40rpx; }
.action-text { font-size: 24rpx; color: #64748b; font-weight: 600; }
.summary-row { display: flex; }
.summary-item { flex: 1; }
.summary-center { text-align: center; }
.summary-right { text-align: right; }
.summary-label { font-size: 20rpx; color: #94a3b8; font-weight: 600; }
.summary-amount { font-size: 44rpx; font-weight: 800; font-family: monospace; display: block; margin-top: 8rpx; }
.income { color: #10b981; }
.expense { color: #f43f5e; }
.quick-btn { margin: 24rpx 24rpx; background: #10b981; border-radius: 20rpx; padding: 28rpx; display: flex; align-items: center; justify-content: center; gap: 12rpx; box-shadow: 0 4rpx 16rpx rgba(16,185,129,0.3); }
.quick-btn:active { transform: scale(0.98); }
.quick-btn-text { font-size: 30rpx; color: #fff; font-weight: 600; }
.empty-state { text-align: center; padding: 60rpx 0; }
.empty-icon { font-size: 72rpx; display: block; }
.empty-text { font-size: 26rpx; color: #94a3b8; margin-top: 8rpx; }
.bill-row { display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 8rpx 0; }
.bill-info { display: flex; flex-direction: column; }
.bill-cat { font-size: 28rpx; font-weight: 600; color: #1e293b; }
.bill-date { font-size: 22rpx; color: #94a3b8; font-family: monospace; }
.text-expense { font-size: 28rpx; font-weight: 700; color: #f43f5e; font-family: monospace; }
.text-income { font-size: 28rpx; font-weight: 700; color: #10b981; font-family: monospace; }
.popup-content { border-radius: 40rpx 40rpx 0 0; max-height: 65vh; overflow-y: auto; padding-bottom: 32rpx; }
.drawer-handle { width: 80rpx; height: 8rpx; background: #e2e8f0; border-radius: 4rpx; margin: 12rpx auto; }
.drawer-header { display: flex; justify-content: space-between; align-items: center; padding: 12rpx 36rpx; border-bottom: 1rpx solid #f8fafc; }
.drawer-title { font-size: 28rpx; font-weight: 700; color: #1e293b; }
.drawer-form { padding: 0 28rpx; }
.form-error { background: #fef2f2; border: 1rpx solid #fecaca; border-radius: 16rpx; padding: 16rpx; font-size: 24rpx; color: #dc2626; margin: 20rpx 0; }
.type-toggle { display: flex; background: #f1f5f9; border-radius: 16rpx; padding: 6rpx; }
.toggle-btn { flex: 1; text-align: center; padding: 18rpx 0; border-radius: 14rpx; font-size: 28rpx; font-weight: 600; color: #94a3b8; }
.active-expense { background: #fff; color: #f43f5e; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06); }
.active-income { background: #fff; color: #10b981; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06); }
.cat-grid { display: flex; flex-wrap: wrap; gap: 16rpx; }
.cat-item { display: flex; align-items: center; justify-content: center; width: calc(25% - 12rpx); padding: 20rpx 8rpx; border-radius: 20rpx; border: 1rpx solid #e2e8f0; background: #fff; }
.cat-selected { border-color: #10b981; background: #ecfdf5; }
.cat-name { font-size: 22rpx; color: #64748b; font-weight: 600; }
.form-row { display: flex; gap: 24rpx; align-items: flex-start; }
.date-picker { flex: 1; z-index: 10; }
.native-date { flex: 1; border: 1rpx solid #e2e8f0; border-radius: 16rpx; padding: 20rpx; font-size: 28rpx; color: #1e293b; background: #f8fafc; }
.note-input { flex: 1; }
.submit-btn { background: #10b981; border-radius: 20rpx; padding: 24rpx; text-align: center; color: #fff; font-size: 28rpx; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 10rpx; margin: 24rpx 36rpx 36rpx; }
.submit-btn:active { transform: scale(0.98); }
</style>
