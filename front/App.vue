<script>
export default {
    onLaunch() {
        console.log('App Launch');
        // 检查登录态：有 token 就恢复，首次使用跳登录页
        const token = uni.getStorageSync('token');
        if (token) {
            console.log('已登录，token:', token.slice(0, 20) + '...');
        } else {
            console.log('未登录，等待用户登录');
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
/* PC端日历选择器弹出层不被弹窗裁切 */
.uni-date__popup,
.uni-calendar__popup {
    position: fixed !important;
    z-index: 9999 !important;
}
</style>
