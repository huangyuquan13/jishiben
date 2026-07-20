<script>
export default {
    onLaunch() {
        console.log('App Launch');
        const token = uni.getStorageSync('token');
        if (!token) {
            // 无 token → 跳转独立登录页（没有 TabBar）
            uni.reLaunch({ url: '/pages/login/login' });
        }
    },
    onShow() { console.log('App Show'); },
    onHide() { console.log('App Hide'); },
};
</script>

<style lang="scss">
page {
    background-color: #f8fafc;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
/* 日历弹出层不被弹窗裁切 */
.uni-date__popup,
.uni-calendar__popup {
    position: fixed !important;
    z-index: 9999 !important;
}
</style>
