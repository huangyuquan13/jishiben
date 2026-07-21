<template>
  <view class="type-toggle">
    <text 
      :class="['toggle-btn', modelValue === 'expense' ? 'active-expense' : '']" 
      @click="handleChange('expense')"
    >支出</text>
    <text 
      :class="['toggle-btn', modelValue === 'income' ? 'active-income' : '']" 
      @click="handleChange('income')"
    >收入</text>
  </view>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    default: 'expense'
  }
});

const emit = defineEmits(['update:modelValue']);

function handleChange(value) {
  emit('update:modelValue', value);
}
</script>

<style scoped>
.type-toggle {
  display: flex;
  background: #f1f5f9;
  border-radius: 16rpx;
  padding: 6rpx;
}

.toggle-btn {
  flex: 1;
  text-align: center;
  padding: 18rpx 0;
  border-radius: 14rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #94a3b8;
  transition: all 0.3s ease;
}

.active-expense {
  background: #fff;
  color: #f43f5e;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.active-income {
  background: #fff;
  color: #10b981;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}
</style>
