<template>
  <view class="loading-wrap" :style="{ padding: padding }">
    <view class="spinner" :style="{ width: size, height: size }" />
    <text v-if="text" class="loading-text">{{ text }}</text>
  </view>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: '加载中...'
  },
  size: {
    type: String,
    default: '48rpx'
  },
  padding: {
    type: String,
    default: '100rpx 0'
  }
});
</script>

<style scoped>
.loading-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.spinner {
  border: 4rpx solid #e2e8f0;
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 24rpx;
  color: #94a3b8;
  margin-top: 16rpx;
}
</style>
