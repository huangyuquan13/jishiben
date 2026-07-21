<template>
  <view class="bill-card" @click="handleClick">
    <view class="bill-left">
      <text class="bill-cat">{{ bill.category }}</text>
      <text class="bill-note" v-if="bill.note && showNote">{{ bill.note }}</text>
      <text class="bill-date">{{ bill.billDate }}</text>
    </view>
    <view class="bill-right">
      <text :class="bill.type === 'expense' ? 'expense' : 'income'">
        {{ bill.type === 'expense' ? '-' : '+' }}¥{{ bill.amount.toFixed(2) }}
      </text>
      <text v-if="showDelete" class="del-btn" @click.stop="handleDelete">🗑</text>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  bill: {
    type: Object,
    required: true
  },
  showDelete: {
    type: Boolean,
    default: false
  },
  showNote: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['click', 'delete']);

function handleClick() {
  emit('click', props.bill);
}

function handleDelete() {
  emit('delete', props.bill.id);
}
</script>

<style scoped>
.bill-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  margin: 12rpx 24rpx;
  padding: 24rpx;
  border-radius: 16rpx;
  transition: transform 0.2s ease;
}

.bill-card:active {
  transform: scale(0.98);
}

.bill-left {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  flex: 1;
}

.bill-cat {
  font-size: 28rpx;
  font-weight: 600;
  color: #1e293b;
}

.bill-note {
  font-size: 22rpx;
  color: #94a3b8;
}

.bill-date {
  font-size: 20rpx;
  color: #cbd5e1;
  font-family: monospace;
}

.bill-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.expense {
  font-size: 28rpx;
  font-weight: 700;
  color: #f43f5e;
  font-family: monospace;
}

.income {
  font-size: 28rpx;
  font-weight: 700;
  color: #10b981;
  font-family: monospace;
}

.del-btn {
  font-size: 28rpx;
  opacity: 0.4;
  transition: opacity 0.2s ease;
}

.del-btn:active {
  opacity: 1;
}
</style>
