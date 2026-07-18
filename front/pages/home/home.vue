<template>
    <view class="home-container">
        <!-- 顶部标题栏 -->
        <view class="home-header">
            <view class="header-left">
                <text class="header-title">记账小工具</text>
                <text class="header-subtitle">Simple & Elegant Bookkeeping</text>
            </view>
            <view class="header-action" @click="goToStats">
                <uni-icons type="bars" size="16" color="#10b981" />
                <text class="action-text">支出统计</text>
                <uni-icons type="arrowright" size="14" color="#94a3b8" />
            </view>
        </view>

        <!-- 月度预算卡片 — uni-card -->
        <uni-card margin="24rpx" :is-shadow="true" class="budget-card-wrap">
            <view class="budget-row">
                <view class="budget-item">
                    <text class="budget-label">2026年7月支出</text>
                    <text class="budget-amount">¥{{ formatNum(totalExpense) }}</text>
                </view>
                <view class="budget-item budget-right">
                    <text class="budget-label">本月预算</text>
                    <text class="budget-value">¥{{ formatNum(budget) }}</text>
                </view>
            </view>

            <view class="progress-section">
                <view class="progress-info">
                    <text class="progress-text">预算进度 {{ budgetProgress }}%</text>
                    <text :class="remainingBudget >= 0 ? 'progress-remain' : 'progress-over'">
                        {{ remainingBudget >= 0 ? '剩余 ¥' + formatNum(remainingBudget) : '超支 ¥' + formatNum(Math.abs(remainingBudget)) }}
                    </text>
                </view>
                <view class="progress-bar">
                    <view
                        :class="['progress-fill', budgetProgress >= 100 ? 'fill-danger' : budgetProgress >= 80 ? 'fill-warn' : 'fill-normal']"
                        :style="{ width: Math.min(budgetProgress, 100) + '%' }"
                    />
                </view>
            </view>

            <view v-if="budgetProgress >= 100" class="over-budget-warn">
                <uni-icons type="info-filled" size="14" color="#dc2626" />
                <text>本月支出已超出设定预算，建议合理规划消费！</text>
            </view>
        </uni-card>

        <!-- 记一笔按钮 — 统一风格 -->
        <view class="quick-btn" @click="openPopup">
            <uni-icons type="plus-filled" size="22" color="#fff" />
            <text class="quick-btn-text">记一笔账单</text>
        </view>

        <!-- 最近3笔 — uni-card + uni-list -->
        <uni-card margin="24rpx" :is-shadow="true">
            <uni-section title="最近账单 (3 笔)" type="line">
                <template #right>
                    <text class="recent-sync">实时同步</text>
                </template>
            </uni-section>

            <view v-if="recentBills.length === 0" class="empty-state">
                <text class="empty-icon">📝</text>
                <text class="empty-text">暂无账单记录，快记一笔吧！</text>
            </view>

            <uni-list v-else>
                <uni-list-item
                    v-for="bill in recentBills"
                    :key="bill.id"
                    :border="true"
                >
                    <template #header>
                        <view class="bill-icon-wrap">
                            <text class="bill-icon">{{ bill.categoryIcon }}</text>
                        </view>
                    </template>
                    <template #body>
                        <view class="bill-body">
                            <view class="bill-note-row">
                                <text class="bill-note">{{ bill.note }}</text>
                                <uni-tag
                                    :text="bill.categoryName"
                                    size="small"
                                    :circle="false"
                                    custom-style="background:#f1f5f9;color:#94a3b8;border:none;font-size:10px;"
                                />
                            </view>
                            <text class="bill-date">{{ bill.date }}</text>
                        </view>
                    </template>
                    <template #footer>
                        <view class="bill-footer-row">
                            <text :class="bill.type === 'expense' ? 'amount-minus' : 'amount-plus'">
                                {{ bill.type === 'expense' ? '-' : '+' }}{{ bill.amount.toFixed(2) }}
                            </text>
                            <view class="delete-btn" @click.stop="deleteBill(bill.id)">
                                <uni-icons type="trash" size="16" color="#94a3b8" />
                            </view>
                        </view>
                    </template>
                </uni-list-item>
            </uni-list>
        </uni-card>

        <!-- 半屏弹窗：uni-popup + uni-easyinput + uni-segmented-control -->
        <uni-popup ref="popupRef" type="bottom" background-color="#fff" :safe-area="false">
            <view class="popup-content">
                <view class="drawer-handle" />
                <view class="drawer-header">
                    <text class="drawer-title">记一笔账单</text>
                    <uni-icons type="closeempty" size="20" color="#94a3b8" @click="closePopup" />
                </view>

                <view class="drawer-form">
                    <!-- 错误提示 -->
                    <view v-if="formError" class="form-error">
                        <text>⚠️ {{ formError }}</text>
                    </view>

                    <!-- 支出/收入 — 统一 toggle -->
                    <uni-section title="交易类型" type="line" />
                    <view class="popup-type-toggle">
                        <text
                            :class="['popup-toggle-btn', txType === 'expense' ? 'popup-toggle-expense' : '']"
                            @click="txType = 'expense'"
                        >支出</text>
                        <text
                            :class="['popup-toggle-btn', txType === 'income' ? 'popup-toggle-income' : '']"
                            @click="txType = 'income'"
                        >收入</text>
                    </view>

                    <!-- 金额 — uni-easyinput -->
                    <uni-section title="账单金额 (元)" type="line" />
                    <uni-easyinput
                        v-model="formAmount"
                        type="number"
                        placeholder="0.00"
                        :input-border="true"
                        prefix="¥"
                    />

                    <!-- 分类选择 -->
                    <uni-section title="选择分类" type="line" />
                    <view class="cat-grid">
                        <view
                            v-for="cat in filteredCategories"
                            :key="cat.code"
                            :class="['cat-item', selectedCat === cat.code ? 'cat-selected' : '']"
                            @click="selectedCat = cat.code"
                        >
                            <text class="cat-emoji">{{ cat.icon }}</text>
                            <text class="cat-name">{{ cat.name }}</text>
                        </view>
                    </view>

                    <!-- 日期 + 备注 -->
                    <uni-section title="日期 & 备注" type="line" />
                    <view class="form-row">
                        <uni-datetime-picker v-model="formDate" type="date" class="date-picker" />
                        <uni-easyinput
                            v-model="formNote"
                            placeholder="例如：午餐外卖"
                            :input-border="true"
                            class="note-input"
                        />
                    </view>

                    <!-- 常用备注推荐 -->
                    <view class="form-group">
                        <text class="form-label-sm">常用备注推荐</text>
                        <view class="suggest-wrap">
                            <uni-tag
                                v-for="s in activeSuggestions"
                                :key="s"
                                :text="s"
                                size="small"
                                :circle="false"
                                custom-style="background:#f1f5f9;color:#64748b;border:none;margin:4rpx;"
                                @click="formNote = s"
                            />
                        </view>
                    </view>

                    <!-- 保存按钮 — 统一 emerald 风格 -->
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
import { api, loadSettings } from '@/utils/api.js';

// ===== 状态 =====
const popupRef = ref(null);
const txType = ref('expense');
const formAmount = ref('');
const selectedCat = ref('food');
const formDate = ref(getToday());
const formNote = ref('');
const formError = ref('');
const bills = ref([]);
const settings = ref(loadSettings());

async function loadData() {
    try {
        const [billList, settingsData] = await Promise.all([
            api.getBills('2026-07'),
            api.getSettings()
        ]);
        bills.value = billList || [];
        settings.value = settingsData || loadSettings();
        // 同步到 globalData
        const app = getApp();
        app.globalData.bills = bills.value;
        app.globalData.settings = settings.value;
    } catch (e) {
        // 网络不通时回退到本地
        const app = getApp();
        bills.value = app.globalData.bills || [];
        settings.value = app.globalData.settings || loadSettings();
    }
}

import { onShow } from '@dcloudio/uni-app';
loadData();
onShow(() => { loadData(); });

// ===== 计算属性 =====
const currentMonth = '2026-07';
const julyBills = computed(() => bills.value.filter(b => b.date.startsWith(currentMonth)));
const totalExpense = computed(() => julyBills.value.filter(b => b.type === 'expense').reduce((s, b) => s + b.amount, 0));
const budget = computed(() => settings.value.monthlyBudget);
const budgetProgress = computed(() => budget.value > 0 ? Math.round((totalExpense.value / budget.value) * 100) : 0);
const remainingBudget = computed(() => budget.value - totalExpense.value);
const recentBills = computed(() =>
    [...bills.value].sort((a, b) => b.createTime - a.createTime).slice(0, 3)
);
const filteredCategories = computed(() => settings.value.categories.filter(c => c.type === txType.value));
const activeSuggestions = computed(() =>
    txType.value === 'expense'
        ? ['午餐', '晚餐', '买菜', '地铁', '打车', '日用品', '买衣服', '饮料水果']
        : ['工资', '奖金', '兼职收益', '转账红包', '二手出售', '投资分红']
);

// ===== 方法 =====
function getToday() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function formatNum(num) { return num.toFixed(2); }
function openPopup() { formError.value = ''; popupRef.value.open(); }
function closePopup() { popupRef.value.close(); }

async function submitBill() {
    formError.value = '';
    const amount = parseFloat(formAmount.value);
    if (isNaN(amount) || amount <= 0) { formError.value = '请输入大于 0 的有效金额'; return; }
    const cat = settings.value.categories.find(c => c.code === selectedCat.value);
    if (!cat) { formError.value = '请选择一个分类'; return; }

    try {
        const newBill = await api.addBill({
            type: txType.value, amount,
            category: cat.code, categoryName: cat.name, categoryIcon: cat.icon,
            date: formDate.value, note: formNote.value.trim() || cat.name
        });
        // 重拉数据（确保和数据库一致）
        await loadData();
        formAmount.value = ''; formNote.value = '';
        popupRef.value.close();
        uni.showToast({ title: '保存成功', icon: 'success' });
    } catch (e) {
        formError.value = '保存失败，请重试';
    }
}

async function deleteBill(id) {
    uni.showModal({
        title: '确认删除？',
        content: '确定要删除这笔账单记录吗？',
        success: async (res) => {
            if (res.confirm) {
                await api.deleteBill(id);
                const app = getApp();
                app.globalData.bills = app.globalData.bills.filter(b => b.id !== id);
                bills.value = app.globalData.bills;
                uni.showToast({ title: '已删除', icon: 'none' });
            }
        }
    });
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

.budget-card-wrap { --uni-card-border-radius: 24rpx; }
.budget-row { display: flex; justify-content: space-between; }
.budget-label { font-size: 20rpx; color: #94a3b8; font-weight: 600; }
.budget-amount { font-size: 56rpx; font-weight: 800; color: #1e293b; display: block; margin-top: 8rpx; font-family: monospace; }
.budget-right { text-align: right; }
.budget-value { font-size: 32rpx; font-weight: 600; color: #64748b; display: block; margin-top: 8rpx; font-family: monospace; }

.progress-section { margin-top: 32rpx; }
.progress-info { display: flex; justify-content: space-between; margin-bottom: 10rpx; }
.progress-text { font-size: 20rpx; color: #94a3b8; }
.progress-remain { font-size: 20rpx; color: #64748b; }
.progress-over { font-size: 20rpx; color: #f43f5e; font-weight: 600; }
.progress-bar { height: 14rpx; background: #f1f5f9; border-radius: 14rpx; overflow: hidden; }
.progress-fill { height: 100%; border-radius: 14rpx; transition: width 0.5s; }
.fill-normal { background: #10b981; }
.fill-warn { background: #f59e0b; }
.fill-danger { background: #f43f5e; }

.over-budget-warn { margin-top: 20rpx; background: #fef2f2; border: 1rpx solid #fecaca; border-radius: 16rpx; padding: 16rpx; font-size: 22rpx; color: #dc2626; display: flex; align-items: center; gap: 8rpx; }

.quick-btn { margin: 24rpx 24rpx; background: #10b981; border-radius: 20rpx; padding: 28rpx; display: flex; align-items: center; justify-content: center; gap: 12rpx; box-shadow: 0 4rpx 16rpx rgba(16,185,129,0.3); }
.quick-btn:active { transform: scale(0.98); background: #059669; }
.quick-btn-text { font-size: 30rpx; color: #fff; font-weight: 600; }

.recent-sync { font-size: 22rpx; color: #94a3b8; }

.empty-state { text-align: center; padding: 60rpx 0; }
.empty-icon { font-size: 72rpx; display: block; }
.empty-text { font-size: 26rpx; color: #94a3b8; margin-top: 8rpx; }

.bill-icon-wrap { width: 72rpx; height: 72rpx; border-radius: 50%; background: #f8fafc; border: 1rpx solid #e2e8f0; display: flex; align-items: center; justify-content: center; margin-right: 16rpx; }
.bill-icon { font-size: 36rpx; }

.bill-body { display: flex; flex-direction: column; }
.bill-note-row { display: flex; align-items: center; gap: 10rpx; margin-bottom: 6rpx; }
.bill-note { font-size: 28rpx; font-weight: 600; color: #1e293b; }
.bill-date { font-size: 22rpx; color: #94a3b8; font-family: monospace; }

.bill-footer-row { display: flex; align-items: center; gap: 12rpx; }
.amount-minus { font-size: 28rpx; font-weight: 700; color: #f43f5e; font-family: monospace; }
.amount-plus { font-size: 28rpx; font-weight: 700; color: #10b981; font-family: monospace; }
.delete-btn { padding: 4rpx; }

/* uni-popup 内部样式 */
.popup-content { border-radius: 40rpx 40rpx 0 0; max-height: 85vh; overflow-y: auto; padding-bottom: 60rpx; }
.drawer-handle { width: 80rpx; height: 8rpx; background: #e2e8f0; border-radius: 4rpx; margin: 16rpx auto; }
.drawer-header { display: flex; justify-content: space-between; align-items: center; padding: 16rpx 36rpx; border-bottom: 1rpx solid #f8fafc; }
.drawer-title { font-size: 30rpx; font-weight: 700; color: #1e293b; }
.drawer-form { padding: 0 36rpx; }

.form-error { background: #fef2f2; border: 1rpx solid #fecaca; border-radius: 16rpx; padding: 16rpx; font-size: 24rpx; color: #dc2626; margin: 20rpx 0; }

.cat-grid { display: flex; flex-wrap: wrap; gap: 16rpx; }
.cat-item { display: flex; flex-direction: column; align-items: center; justify-content: center; width: calc(25% - 12rpx); padding: 20rpx 8rpx; border-radius: 20rpx; border: 1rpx solid #e2e8f0; background: #fff; transition: all 0.2s; }
.cat-selected { border-color: #10b981; background: #ecfdf5; }
.cat-emoji { font-size: 40rpx; }
.cat-name { font-size: 22rpx; color: #64748b; font-weight: 600; margin-top: 8rpx; }

.form-row { display: flex; gap: 24rpx; align-items: flex-start; }
.date-picker { flex: 1; }
.note-input { flex: 1; }

.form-group { margin-top: 16rpx; }
.form-label-sm { font-size: 20rpx; font-weight: 700; color: #94a3b8; margin-bottom: 12rpx; display: block; }
.suggest-wrap { display: flex; flex-wrap: wrap; gap: 8rpx; }

.submit-btn { background: #10b981; border-radius: 20rpx; padding: 24rpx; text-align: center; color: #fff; font-size: 28rpx; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 10rpx; box-shadow: 0 4rpx 16rpx rgba(16,185,129,0.3); margin-top: 24rpx; }
.submit-btn:active { transform: scale(0.98); background: #059669; }

/* 弹窗内支出/收入 toggle */
.popup-type-toggle { display: flex; background: #f1f5f9; border-radius: 16rpx; padding: 6rpx; }
.popup-toggle-btn { flex: 1; text-align: center; padding: 18rpx 0; border-radius: 14rpx; font-size: 28rpx; font-weight: 600; color: #94a3b8; transition: all 0.2s; }
.popup-toggle-expense { background: #fff; color: #f43f5e; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06); }
.popup-toggle-income { background: #fff; color: #10b981; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06); }
</style>
