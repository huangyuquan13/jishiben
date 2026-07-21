<template>
  <view class="cat-grid">
    <view 
      v-for="cat in categories" 
      :key="cat" 
      :class="['cat-item', modelValue === cat ? 'cat-selected' : '']" 
      @click="handleSelect(cat)"
    >
      <text class="cat-name">{{ cat }}</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'expense'
  }
});

const emit = defineEmits(['update:modelValue']);

const expenseCats = ['餐饮', '交通', '购物', '娱乐', '居住', '通讯', '医疗', '教育', '其他'];
const incomeCats = ['工资', '奖金', '兼职', '理财', '红包', '报销', '其他'];

const categories = computed(() => props.type === 'expense' ? expenseCats : incomeCats);

function handleSelect(cat) {
  emit('update:modelValue', cat);
}
</script>

<style scoped>
.cat-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.cat-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc(25% - 12rpx);
  padding: 20rpx 8rpx;
  border-radius: 20rpx;
  border: 1rpx solid #e2e8f0;
  background: #fff;
  transition: all 0.2s ease;
}

.cat-item:active {
  transform: scale(0.95);
}

.cat-selected {
  border-color: #10b981;
  background: #ecfdf5;
}

.cat-name {
  font-size: 22rpx;
  color: #64748b;
  font-weight: 600;
}

.cat-selected .cat-name {
  color: #10b981;
}
</style>
