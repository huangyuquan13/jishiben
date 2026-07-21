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

        <!-- 加载中 -->
        <LoadingSpinner v-if="loading" />

        <template v-else>
            <!-- 月度汇总卡片 -->
            <uni-card margin="24rpx" :is-shadow="true">
                <view class="summary-row">
                    <view class="summary-item">
                        <text class="summary-label">本月收入</text>
                        <text class="summary-amount income">¥{{ fmt(stats.totalIncome) }}</text>
                    </view>
                    <view class="summary-item">
                        <text class="summary-label">本月支出</text>
                        <text class="summary-amount expense">¥{{ fmt(stats.totalExpense) }}</text>
                    </view>
                    <view class="summary-item">
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
                <EmptyState 
                    v-if="recentBills.length === 0" 
                    icon="📝" 
                    text="暂无账单记录，快记一笔吧！" 
                />
                <view v-else>
                    <BillCard 
                        v-for="bill in recentBills" 
                        :key="bill.id" 
                        :bill="bill"
                        :show-note="false"
                    />
                </view>
            </uni-card>
        </template>

        <!-- 记账弹窗 - 全屏覆盖 -->
        <uni-popup ref="popupRef" type="bottom" background-color="#fff" :safe-area="false" @change="onPopupChange">
            <view class="popup-wrapper">
                <!-- 滚动内容区 -->
                <scroll-view 
                    class="popup-scroll" 
                    scroll-y 
                    :scroll-top="scrollTop"
                    :scroll-with-animation="true"
                >
                    <view class="popup-content">
                        <view class="drawer-handle" />
                        <view class="drawer-header">
                            <text class="drawer-title">记一笔账单</text>
                            <uni-icons type="closeempty" size="20" color="#94a3b8" @click="closePopup" />
                        </view>
                        <view class="drawer-form">
                            <view v-if="formError" class="form-error"><text>⚠️ {{ formError }}</text></view>
                            
                            <uni-section title="交易类型" type="line" />
                            <TypeToggle v-model="txType" />
                            
                            <uni-section title="金额 (元)" type="line" />
                            <uni-easyinput v-model="formAmount" type="number" placeholder="0.00" :input-border="true" prefix="¥" />
                            
                            <uni-section title="分类" type="line" />
                            <CategoryGrid v-model="selectedCat" :type="txType" />
                            
                            <uni-section title="日期 & 备注" type="line" />
                            <view class="form-row">
                                <!-- 统一使用 picker 下拉式日期选择器 -->
                                <picker mode="date" :value="formDate" @change="onDateChange" class="date-picker-mobile">
                                    <view class="picker-display">
                                        <uni-icons type="calendar" size="16" color="#64748b" />
                                        <text class="picker-text">{{ formDate }}</text>
                                    </view>
                                </picker>
                                <uni-easyinput v-model="formNote" placeholder="例如：午餐外卖" :input-border="true" class="note-input" />
                            </view>
                        </view>
                    </view>
                </scroll-view>
                
                <!-- 固定底部按钮 -->
                <view class="submit-btn-fixed">
                    <view class="submit-btn" @click="submitBill">
                        <uni-icons type="checkmarkempty" size="18" color="#fff" />
                        <text>保存账单</text>
                    </view>
                </view>
            </view>
        </uni-popup>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useUserStore } from '@/store/user.js';
import { getBills, createBill, getStats } from '@/api/bills.js';
import BillCard from '@/components/BillCard.vue';
import TypeToggle from '@/components/TypeToggle.vue';
import CategoryGrid from '@/components/CategoryGrid.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import EmptyState from '@/components/EmptyState.vue';

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
const loading = ref(true);
const scrollTop = ref(0); // 用于错误时滚动到顶部

async function loadData() {
  if (!user.isLogin) {
    bills.value = []; 
    stats.value = { totalIncome: 0, totalExpense: 0, balance: 0 };
    loading.value = false; 
    return;
  }
  loading.value = true;
  try {
    const month = new Date().toISOString().slice(0, 7);
    const [billData, statData] = await Promise.all([
      getBills({ pageSize: 50, month }), 
      getStats(month)
    ]);
    bills.value = billData?.records || [];
    stats.value = statData || { totalIncome: 0, totalExpense: 0, balance: 0 };
  } catch (e) { 
    console.error('加载数据失败:', e);
  }
  loading.value = false;
}

import { onShow } from '@dcloudio/uni-app';
onShow(() => loadData());

const recentBills = computed(() => bills.value.slice(0, 5));

function getToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function fmt(n) { 
  return (n || 0).toFixed(2); 
}

function openPopup() { 
  formError.value = ''; 
  popupRef.value.open();
  // 弹窗打开时隐藏 TabBar
  // #ifndef H5
  uni.hideTabBar();
  // #endif
}

function closePopup() { 
  popupRef.value.close();
  // 弹窗关闭时显示 TabBar
  // #ifndef H5
  uni.showTabBar();
  // #endif
}

// 弹窗状态变化
function onPopupChange(e) {
  if (!e.show) {
    // 弹窗关闭时显示 TabBar
    // #ifndef H5
    uni.showTabBar();
    // #endif
  }
}

// 手机端日期选择
function onDateChange(e) {
  formDate.value = e.detail.value;
}

async function submitBill() {
  formError.value = '';
  const amount = parseFloat(formAmount.value);
  if (isNaN(amount) || amount <= 0) { 
    formError.value = '请输入大于 0 的有效金额'; 
    scrollToTop(); // 错误时滚动到顶部
    return; 
  }
  try {
    await createBill({ 
      type: txType.value, 
      amount, 
      category: selectedCat.value, 
      note: formNote.value.trim() || selectedCat.value, 
      billDate: formDate.value 
    });
    formAmount.value = ''; 
    formNote.value = ''; 
    popupRef.value.close();
    uni.showToast({ title: '保存成功', icon: 'success' });
    loadData();
  } catch (e) { 
    formError.value = '保存失败，请重试'; 
    scrollToTop(); // 错误时滚动到顶部
  }
}

// 滚动到顶部（显示错误提示）
function scrollToTop() {
  scrollTop.value = 0;
  // 强制触发滚动
  setTimeout(() => {
    scrollTop.value = 0.1;
  }, 50);
}

function goToStats() { 
  uni.navigateTo({ url: '/pages/stats/stats' }); 
}
</script>

<style scoped>
.home-container { 
  min-height: 100vh; 
  background: #f8fafc; 
  padding-bottom: 120rpx; 
}

.home-header { 
  background: #fff; 
  padding: 30rpx 32rpx 24rpx; 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  border-bottom: 1rpx solid #f1f5f9; 
}

.header-left { 
  display: flex; 
  flex-direction: column; 
}

.header-title { 
  font-size: 40rpx; 
  font-weight: 800; 
  color: #1e293b; 
}

.header-subtitle { 
  font-size: 22rpx; 
  color: #94a3b8; 
  margin-top: 4rpx; 
}

.header-action { 
  display: flex; 
  align-items: center; 
  gap: 8rpx; 
  background: #f1f5f9; 
  padding: 12rpx 24rpx; 
  border-radius: 40rpx; 
}

.action-text { 
  font-size: 24rpx; 
  color: #64748b; 
  font-weight: 600; 
}

.summary-row { 
  display: flex; 
}

.summary-item { 
  flex: 1; 
  text-align: center; 
}

.summary-label { 
  font-size: 20rpx; 
  color: #94a3b8; 
  font-weight: 600; 
  display: block; 
}

.summary-amount { 
  font-size: 44rpx; 
  font-weight: 800; 
  font-family: monospace; 
  display: block; 
  margin-top: 8rpx; 
}

.income { 
  color: #10b981; 
}

.expense { 
  color: #f43f5e; 
}

.quick-btn { 
  margin: 24rpx 24rpx; 
  background: #10b981; 
  border-radius: 20rpx; 
  padding: 28rpx; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  gap: 12rpx; 
  box-shadow: 0 4rpx 16rpx rgba(16, 185, 129, 0.3); 
  transition: transform 0.2s ease;
}

.quick-btn:active { 
  transform: scale(0.98); 
}

.quick-btn-text { 
  font-size: 30rpx; 
  color: #fff; 
  font-weight: 600; 
}

/* 弹窗样式 - 按钮固定底部 */
.popup-wrapper {
  display: flex;
  flex-direction: column;
  max-height: 70vh; /* 增加高度，因为 TabBar 已隐藏 */
  border-radius: 40rpx 40rpx 0 0;
  background: #fff;
}

.popup-scroll {
  flex: 1;
  overflow-y: auto;
}

.popup-content {
  padding-bottom: 20rpx;
}

.drawer-handle { 
  width: 80rpx; 
  height: 8rpx; 
  background: #e2e8f0; 
  border-radius: 4rpx; 
  margin: 12rpx auto; 
}

.drawer-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  padding: 12rpx 36rpx; 
  border-bottom: 1rpx solid #f8fafc; 
}

.drawer-title { 
  font-size: 28rpx; 
  font-weight: 700; 
  color: #1e293b; 
}

.drawer-form { 
  padding: 0 28rpx; 
}

.form-error { 
  background: #fef2f2; 
  border: 1rpx solid #fecaca; 
  border-radius: 16rpx; 
  padding: 16rpx; 
  font-size: 24rpx; 
  color: #dc2626; 
  margin: 20rpx 0; 
}

.form-row { 
  display: flex; 
  gap: 24rpx; 
  align-items: flex-start; 
}

/* 日期选择器样式 */
.date-picker-mobile {
  flex: 1;
}

.picker-display {
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: #f8fafc;
  border: 2rpx solid #e2e8f0;
  border-radius: 16rpx;
  padding: 24rpx 28rpx;
  transition: border-color 0.2s ease;
}

.picker-display:active {
  border-color: #10b981;
}

.picker-text {
  font-size: 28rpx;
  color: #1e293b;
}

.note-input { 
  flex: 1; 
}

.submit-btn-fixed {
  padding: 20rpx 36rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1rpx solid #f1f5f9;
}

.submit-btn { 
  background: #10b981; 
  border-radius: 20rpx; 
  padding: 24rpx; 
  text-align: center; 
  color: #fff; 
  font-size: 28rpx; 
  font-weight: 700; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  gap: 10rpx;
  transition: transform 0.2s ease;
}

.submit-btn:active { 
  transform: scale(0.98); 
}
</style>
