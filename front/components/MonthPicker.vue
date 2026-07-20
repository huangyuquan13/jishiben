<template>
  <view class="month-bar">
    <text class="arrow" @click="go(-1)">‹</text>
    <picker mode="date" fields="month" :value="modelValue + '-01'" @change="onPick">
      <text class="month-text">📅 {{ display }}</text>
    </picker>
    <text class="arrow" @click="go(1)">›</text>
  </view>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({ modelValue: String });
const emit = defineEmits(['update:modelValue']);

const display = computed(() => {
  const [y, m] = (props.modelValue || '').split('-');
  return `${y || ''}年${m || ''}月`;
});

function go(delta) {
  const d = new Date((props.modelValue || '2026-01') + '-01');
  d.setMonth(d.getMonth() + delta);
  emit('update:modelValue', d.toISOString().slice(0, 7));
}

function onPick(e) {
  emit('update:modelValue', e.detail.value.slice(0, 7));
}
</script>

<style scoped>
.month-bar { display: flex; align-items: center; justify-content: center; background: #fff; padding: 20rpx; }
.arrow { font-size: 48rpx; color: #64748b; padding: 0 32rpx; }
.month-text { font-size: 28rpx; font-weight: 700; color: #1e293b; }
</style>
