<template>
  <view class="empty-state" :style="{ padding: padding }">
    <text class="empty-icon" :style="{ fontSize: iconSize }">{{ icon }}</text>
    <text class="empty-text">{{ text }}</text>
  </view>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    default: '📝'
  },
  text: {
    type: String,
    default: '暂无数据'
  },
  iconSize: {
    type: String,
    default: '72rpx'
  },
  padding: {
    type: String,
    default: '60rpx 0'
  }
});
</script>

<style scoped>
.empty-state {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-icon {
  display: block;
}

.empty-text {
  font-size: 26rpx;
  color: #94a3b8;
  margin-top: 8rpx;
}
</style>
