<template>
  <view class="particle-bg">
    <!-- 渐变背景 -->
    <view class="gradient-layer"></view>
    
    <!-- 浮动光斑（纯 CSS 动画） -->
    <view class="floating-orbs">
      <view class="orb orb1"></view>
      <view class="orb orb2"></view>
      <view class="orb orb3"></view>
      <view class="orb orb4"></view>
      <view class="orb orb5"></view>
    </view>
    
    <!-- 点击波纹（点击时触发） -->
    <view 
      v-for="ripple in ripples" 
      :key="ripple.id" 
      class="click-ripple"
      :style="{
        left: ripple.x + 'px',
        top: ripple.y + 'px',
        background: ripple.color
      }"
    ></view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const ripples = ref([]);
let rippleId = 0;

// 项目主题色（Emerald 绿色系）
const RIPPLE_COLORS = [
  'rgba(16, 185, 129, 0.3)',   // emerald-500
  'rgba(52, 211, 153, 0.3)',   // emerald-400
  'rgba(110, 231, 183, 0.3)',  // emerald-300
  'rgba(167, 243, 208, 0.3)',  // emerald-200
];

function handleClick(e) {
  // 获取点击位置（兼容 H5 和小程序）
  let x, y;
  
  // #ifdef H5
  x = e.clientX || e.touches?.[0]?.clientX || 0;
  y = e.clientY || e.touches?.[0]?.clientY || 0;
  // #endif
  
  // #ifndef H5
  x = e.detail?.x || e.touches?.[0]?.clientX || 0;
  y = e.detail?.y || e.touches?.[0]?.clientY || 0;
  // #endif
  
  // 随机颜色
  const color = RIPPLE_COLORS[Math.floor(Math.random() * RIPPLE_COLORS.length)];
  
  // 添加波纹
  const id = rippleId++;
  ripples.value.push({ id, x, y, color });
  
  // 动画结束后移除
  setTimeout(() => {
    ripples.value = ripples.value.filter(r => r.id !== id);
  }, 1500);
}

onMounted(() => {
  // #ifdef H5
  document.addEventListener('click', handleClick);
  // #endif
  
  // #ifndef H5
  // 小程序端通过 uni-app 的事件系统监听
  uni.$on('login-bg-click', handleClick);
  // #endif
});

onUnmounted(() => {
  // #ifdef H5
  document.removeEventListener('click', handleClick);
  // #endif
  
  // #ifndef H5
  uni.$off('login-bg-click', handleClick);
  // #endif
});
</script>

<style scoped>
.particle-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

/* 渐变背景层 */
.gradient-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, 
    #f0fdf4 0%,      /* emerald-50 */
    #dcfce7 25%,     /* emerald-100 */
    #f8fafc 50%,     /* slate-50 */
    #ecfdf5 75%,     /* emerald-50 */
    #d1fae5 100%     /* emerald-100 */
  );
  animation: gradientShift 15s ease infinite;
}

@keyframes gradientShift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

/* 浮动光斑容器 */
.floating-orbs {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* 光斑基础样式 */
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60rpx);
  opacity: 0.4;
  animation: orbFloat 12s ease-in-out infinite;
}

/* 光斑 1 - 大右上 */
.orb1 {
  width: 400rpx;
  height: 400rpx;
  background: radial-gradient(circle, 
    rgba(16, 185, 129, 0.15) 0%, 
    rgba(16, 185, 129, 0.05) 40%,
    transparent 70%
  );
  top: -100rpx;
  right: -100rpx;
  animation-delay: 0s;
  animation-duration: 15s;
}

/* 光斑 2 - 中左下 */
.orb2 {
  width: 350rpx;
  height: 350rpx;
  background: radial-gradient(circle, 
    rgba(52, 211, 153, 0.12) 0%, 
    rgba(52, 211, 153, 0.04) 40%,
    transparent 70%
  );
  bottom: -80rpx;
  left: -80rpx;
  animation-delay: -3s;
  animation-duration: 18s;
}

/* 光斑 3 - 小中间 */
.orb3 {
  width: 280rpx;
  height: 280rpx;
  background: radial-gradient(circle, 
    rgba(110, 231, 183, 0.10) 0%, 
    rgba(110, 231, 183, 0.03) 40%,
    transparent 70%
  );
  top: 40%;
  left: 50%;
  animation-delay: -6s;
  animation-duration: 20s;
}

/* 光斑 4 - 小左上 */
.orb4 {
  width: 220rpx;
  height: 220rpx;
  background: radial-gradient(circle, 
    rgba(167, 243, 208, 0.12) 0%, 
    rgba(167, 243, 208, 0.04) 40%,
    transparent 70%
  );
  top: 15%;
  left: 10%;
  animation-delay: -9s;
  animation-duration: 16s;
}

/* 光斑 5 - 小右下 */
.orb5 {
  width: 260rpx;
  height: 260rpx;
  background: radial-gradient(circle, 
    rgba(16, 185, 129, 0.08) 0%, 
    rgba(16, 185, 129, 0.02) 40%,
    transparent 70%
  );
  bottom: 20%;
  right: 15%;
  animation-delay: -12s;
  animation-duration: 14s;
}

/* 光斑浮动动画 */
@keyframes orbFloat {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(30rpx, -40rpx) scale(1.1);
  }
  50% {
    transform: translate(-20rpx, 30rpx) scale(0.95);
  }
  75% {
    transform: translate(40rpx, 20rpx) scale(1.05);
  }
}

/* 点击波纹 */
.click-ripple {
  position: absolute;
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  animation: rippleExpand 1.5s ease-out forwards;
}

@keyframes rippleExpand {
  0% {
    width: 20rpx;
    height: 20rpx;
    opacity: 1;
  }
  100% {
    width: 400rpx;
    height: 400rpx;
    opacity: 0;
  }
}

/* 响应式优化 */
@media (max-width: 768px) {
  .orb {
    filter: blur(40rpx);
  }
  
  .orb1 {
    width: 300rpx;
    height: 300rpx;
  }
  
  .orb2 {
    width: 280rpx;
    height: 280rpx;
  }
  
  .orb3 {
    width: 220rpx;
    height: 220rpx;
  }
  
  .orb4 {
    width: 180rpx;
    height: 180rpx;
  }
  
  .orb5 {
    width: 200rpx;
    height: 200rpx;
  }
}
</style>
