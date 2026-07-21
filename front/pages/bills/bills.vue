<template>
    <view class="bills-container">
        <MonthPicker v-model="month" @update:model-value="load" />

        <LoadingSpinner v-if="loading" />
        
        <template v-else>
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

            <EmptyState 
                v-if="filteredList.length === 0" 
                icon="📝" 
                text="暂无记录" 
                padding="120rpx 0"
            />

            <view v-else>
                <BillCard 
                    v-for="bill in filteredList" 
                    :key="bill.id" 
                    :bill="bill"
                    :show-delete="true"
                    @click="openEdit"
                    @delete="handleDelete"
                />
            </view>
        </template>

        <!-- 编辑弹窗 -->
        <uni-popup ref="editPopupRef" type="bottom" background-color="#fff" :safe-area="false">
            <view class="popup-wrapper">
                <!-- 滚动内容区 -->
                <scroll-view class="popup-scroll" scroll-y>
                    <view class="popup-content">
                        <view class="drawer-handle" />
                        <view class="drawer-header">
                            <text class="drawer-title">编辑账单</text>
                            <uni-icons type="closeempty" size="20" color="#94a3b8" @click="closeEdit" />
                        </view>
                        <view class="drawer-form">
                            <view v-if="editError" class="form-error"><text>⚠️ {{ editError }}</text></view>
                            
                            <uni-section title="交易类型" type="line" />
                            <TypeToggle v-model="editType" />
                            
                            <uni-section title="金额 (元)" type="line" />
                            <uni-easyinput v-model="editAmount" type="number" placeholder="0.00" :input-border="true" prefix="¥" />
                            
                            <uni-section title="分类" type="line" />
                            <CategoryGrid v-model="editCat" :type="editType" />
                            
                            <uni-section title="日期 & 备注" type="line" />
                            <view class="form-row">
                                <uni-datetime-picker v-model="editDate" type="date" class="date-picker" />
                                <uni-easyinput v-model="editNote" placeholder="例如：午餐外卖" :input-border="true" class="note-input" />
                            </view>
                        </view>
                    </view>
                </scroll-view>
                
                <!-- 固定底部按钮 -->
                <view class="submit-btn-fixed">
                    <view class="submit-btn" @click="submitEdit">
                        <uni-icons type="checkmarkempty" size="18" color="#fff" />
                        <text>保存修改</text>
                    </view>
                </view>
            </view>
        </uni-popup>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import MonthPicker from '@/components/MonthPicker.vue';
import BillCard from '@/components/BillCard.vue';
import TypeToggle from '@/components/TypeToggle.vue';
import CategoryGrid from '@/components/CategoryGrid.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import EmptyState from '@/components/EmptyState.vue';
import { getBills, deleteBill, updateBill } from '@/api/bills.js';
import { useUserStore } from '@/store/user.js';

const user = useUserStore();
const month = ref(new Date().toISOString().slice(0, 7));
const filter = ref('all');
const list = ref([]);
const loading = ref(true);

// ===== 编辑状态 =====
const editPopupRef = ref(null);
const editingId = ref('');
const editType = ref('expense');
const editAmount = ref('');
const editCat = ref('餐饮');
const editDate = ref('');
const editNote = ref('');
const editError = ref('');

function openEdit(bill) {
  editingId.value = bill.id;
  editType.value = bill.type;
  editAmount.value = String(bill.amount);
  editCat.value = bill.category;
  editDate.value = bill.billDate;
  editNote.value = bill.note || '';
  editError.value = '';
  editPopupRef.value.open();
}

function closeEdit() {
  editPopupRef.value.close();
}

async function submitEdit() {
  editError.value = '';
  const amount = parseFloat(editAmount.value);
  if (isNaN(amount) || amount <= 0) { 
    editError.value = '请输入大于 0 的有效金额'; 
    return; 
  }
  try {
    await updateBill(editingId.value, {
      type: editType.value, 
      amount, 
      category: editCat.value,
      note: editNote.value.trim() || editCat.value, 
      billDate: editDate.value,
    });
    editPopupRef.value.close();
    uni.showToast({ title: '已更新', icon: 'success' });
    load();
  } catch (e) { 
    editError.value = '保存失败，请重试'; 
  }
}

// ===== 列表逻辑 =====
async function load() {
  if (!user.isLogin) { 
    list.value = []; 
    loading.value = false; 
    return; 
  }
  loading.value = true;
  try {
    const data = await getBills({ pageSize: 200, month: month.value });
    list.value = data?.records || [];
  } catch (e) { 
    console.error('加载账单失败:', e);
  }
  loading.value = false;
}

import { onShow } from '@dcloudio/uni-app';
onShow(() => load());

const filteredList = computed(() => 
  list.value.filter(b => filter.value === 'all' || b.type === filter.value)
);

const totalExpense = computed(() => 
  list.value.filter(b => b.type === 'expense').reduce((s, b) => s + b.amount, 0)
);

const totalIncome = computed(() => 
  list.value.filter(b => b.type === 'income').reduce((s, b) => s + b.amount, 0)
);

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
.bills-container { 
  min-height: 100vh; 
  background: #f8fafc; 
  padding-bottom: 120rpx; 
}

.summary-bar { 
  display: flex; 
  gap: 16rpx; 
  padding: 16rpx 24rpx; 
  background: #fff; 
}

.summary-tag { 
  font-size: 22rpx; 
  padding: 8rpx 20rpx; 
  background: #f1f5f9; 
  border-radius: 20rpx; 
  color: #64748b; 
}

.summary-tag.income { 
  color: #10b981; 
}

.filter-bar { 
  display: flex; 
  gap: 12rpx; 
  padding: 16rpx 24rpx; 
}

.filter-btn { 
  font-size: 24rpx; 
  padding: 12rpx 32rpx; 
  border-radius: 20rpx; 
  background: #f1f5f9; 
  color: #94a3b8; 
  transition: all 0.3s ease;
}

.filter-btn.active { 
  background: #10b981; 
  color: #fff; 
}

/* 弹窗样式 - 按钮固定底部 */
.popup-wrapper {
  display: flex;
  flex-direction: column;
  max-height: 75vh;
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

.date-picker { 
  flex: 1; 
  z-index: 10; 
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
