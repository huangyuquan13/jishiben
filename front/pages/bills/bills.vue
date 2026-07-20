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

        <view v-for="bill in filteredList" :key="bill.id" class="bill-card" @click="openEdit(bill)">
            <view class="bill-left">
                <text class="bill-cat">{{ bill.category }}</text>
                <text class="bill-note" v-if="bill.note">{{ bill.note }}</text>
                <text class="bill-date">{{ bill.billDate }}</text>
            </view>
            <view class="bill-right">
                <text :class="bill.type === 'expense' ? 'expense' : 'income'">
                    {{ bill.type === 'expense' ? '-' : '+' }}{{ bill.amount.toFixed(2) }}
                </text>
                <text class="del-btn" @click.stop="handleDelete(bill.id)">🗑</text>
            </view>
        </view>

        <!-- 编辑弹窗 -->
        <uni-popup ref="editPopupRef" type="bottom" background-color="#fff" :safe-area="false">
            <view class="popup-content">
                <view class="drawer-handle" />
                <view class="drawer-header">
                    <text class="drawer-title">编辑账单</text>
                    <uni-icons type="closeempty" size="20" color="#94a3b8" @click="closeEdit" />
                </view>
                <view class="drawer-form">
                    <view v-if="editError" class="form-error"><text>⚠️ {{ editError }}</text></view>
                    <uni-section title="交易类型" type="line" />
                    <view class="type-toggle">
                        <text :class="['toggle-btn', editType === 'expense' ? 'active-expense' : '']" @click="editType = 'expense'">支出</text>
                        <text :class="['toggle-btn', editType === 'income' ? 'active-income' : '']" @click="editType = 'income'">收入</text>
                    </view>
                    <uni-section title="金额 (元)" type="line" />
                    <uni-easyinput v-model="editAmount" type="number" placeholder="0.00" :input-border="true" prefix="¥" />
                    <uni-section title="分类" type="line" />
                    <view class="cat-grid">
                        <view v-for="cat in editCats" :key="cat" :class="['cat-item', editCat === cat ? 'cat-selected' : '']" @click="editCat = cat">
                            <text class="cat-name">{{ cat }}</text>
                        </view>
                    </view>
                    <uni-section title="日期 & 备注" type="line" />
                    <view class="form-row">
                        <uni-datetime-picker v-model="editDate" type="date" class="date-picker" />
                        <uni-easyinput v-model="editNote" placeholder="例如：午餐外卖" :input-border="true" class="note-input" />
                    </view>
                </view>
                <view class="submit-btn" @click="submitEdit">
                    <uni-icons type="checkmarkempty" size="18" color="#fff" />
                    <text>保存修改</text>
                </view>
            </view>
        </uni-popup>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { getBills, deleteBill, updateBill } from '@/api/bills.js';
import { useUserStore } from '@/store/user.js';

const user = useUserStore();
const month = ref(new Date().toISOString().slice(0, 7));
const filter = ref('all');
const list = ref([]);

// ===== 编辑状态 =====
const editPopupRef = ref(null);
const editingId = ref('');
const editType = ref('expense');
const editAmount = ref('');
const editCat = ref('餐饮');
const editDate = ref('');
const editNote = ref('');
const editError = ref('');

const expenseCats = ['餐饮', '交通', '购物', '娱乐', '居住', '通讯', '医疗', '教育', '其他'];
const incomeCats = ['工资', '奖金', '兼职', '理财', '红包', '报销', '其他'];
const editCats = computed(() => editType.value === 'expense' ? expenseCats : incomeCats);

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
  if (isNaN(amount) || amount <= 0) { editError.value = '请输入大于 0 的有效金额'; return; }
  try {
    await updateBill(editingId.value, {
      type: editType.value, amount, category: editCat.value,
      note: editNote.value.trim() || editCat.value, billDate: editDate.value,
    });
    editPopupRef.value.close();
    uni.showToast({ title: '已更新', icon: 'success' });
    load();
  } catch (e) { editError.value = '保存失败，请重试'; }
}

// ===== 列表逻辑 =====
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

/* 编辑弹窗 */
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
.note-input { flex: 1; }
.submit-btn { background: #10b981; border-radius: 20rpx; padding: 24rpx; text-align: center; color: #fff; font-size: 28rpx; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 10rpx; margin: 24rpx 36rpx 36rpx; }
.submit-btn:active { transform: scale(0.98); }
</style>
