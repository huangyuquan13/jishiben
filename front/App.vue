<script>
import { api, loadSettings } from '@/utils/api.js';

export default {
    globalData: {
        bills: [],
        settings: { monthlyBudget: 5000, categories: [] }
    },

    onLaunch() {
        console.log('App Launch');
        this.refreshGlobalData();
    },

    onShow() {
        console.log('App Show — 从后台切回，刷新数据');
        this.refreshGlobalData();
    },

    onHide() {
        console.log('App Hide');
    },

    methods: {
        async refreshGlobalData() {
            try {
                const [billList, settingsData] = await Promise.all([
                    api.getBills('2026-07'),
                    api.getSettings()
                ]);
                this.globalData.bills = billList || [];
                this.globalData.settings = settingsData || loadSettings();
            } catch (e) {
                console.warn('后端连接失败，使用本地缓存');
                // 网络不通时保持已有数据不变
                if (!this.globalData.bills.length) {
                    this.globalData.bills = [];
                }
                if (!this.globalData.settings.monthlyBudget) {
                    this.globalData.settings = loadSettings();
                }
            }
        }
    }
};
</script>

<style lang="scss">
page {
    background-color: #f8fafc;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>
