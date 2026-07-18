// ============================================
//  API 层 — SpringBoot 后端
//  开发: 连电脑WiFi用局域网IP
//  上线: 换成服务器域名/IP
// ============================================

// 公网地址 — natapp 穿透（你电脑开着后端，任何人任何网络都能用）
const NATAPP_URL = 'http://f6894bca.natappfree.cc';

// 根据运行环境自动切换
// #ifdef APP-PLUS
const BASE_URL = NATAPP_URL + '/api';    // App 真机 → natapp公网
// #endif
// #ifdef MP-WEIXIN
const BASE_URL = NATAPP_URL + '/api';  // 先走natapp测试
// #endif
// #ifdef H5
const BASE_URL = NATAPP_URL + '/api';  // 先走natapp测试
// #endif

// 默认分类（前端缓存，首次加载没拿到设置时用）
export const DEFAULT_CATEGORIES = [
    { code: 'food', name: '餐饮', icon: '🍜', type: 'expense' },
    { code: 'shopping', name: '购物', icon: '🛒', type: 'expense' },
    { code: 'transport', name: '交通', icon: '🚌', type: 'expense' },
    { code: 'entertainment', name: '娱乐', icon: '🎮', type: 'expense' },
    { code: 'housing', name: '住房', icon: '🏠', type: 'expense' },
    { code: 'medical', name: '医疗', icon: '🏥', type: 'expense' },
    { code: 'education', name: '教育', icon: '🎓', type: 'expense' },
    { code: 'other_expense', name: '其他支出', icon: '📦', type: 'expense' },
    { code: 'salary', name: '工资', icon: '💰', type: 'income' },
    { code: 'part_time', name: '兼职', icon: '💼', type: 'income' },
    { code: 'investment', name: '理财', icon: '📈', type: 'income' },
    { code: 'gift', name: '礼金', icon: '🎁', type: 'income' },
    { code: 'other_income', name: '其他收入', icon: '🪙', type: 'income' }
];

// ===== HTTP 请求封装 =====
function request(options) {
    return new Promise((resolve, reject) => {
        uni.request({
            url: BASE_URL + options.url,
            method: options.method || 'GET',
            data: options.data,
            header: {
                'Content-Type': 'application/json'
            },
            success: (res) => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(res.data);
                } else {
                    uni.showToast({ title: '请求失败: ' + res.statusCode, icon: 'none' });
                    reject(res.data);
                }
            },
            fail: (err) => {
                console.error('网络请求失败:', err);
                uni.showToast({ title: '网络请求失败，请检查后端是否启动', icon: 'none' });
                reject(err);
            }
        });
    });
}

// ===== API 接口（对应 SpringBoot BillController + SettingsController） =====
export const api = {
    // --- 账单 ---
    getBills(month) {
        return request({ url: '/bills', data: { month } });
    },

    addBill(billData) {
        return request({ url: '/bills', method: 'POST', data: billData });
    },

    deleteBill(id) {
        return request({ url: `/bills/${id}`, method: 'DELETE' });
    },

    // --- 设置 ---
    getSettings() {
        return request({ url: '/settings' });
    },

    updateSettings(settings) {
        return request({ url: '/settings', method: 'PUT', data: settings });
    },

    // --- 统计 ---
    getMonthlyStats(month) {
        return request({ url: '/bills/stats', data: { month } });
    },

    getDailyTrend(month) {
        return request({ url: '/bills/trend', data: { month } });
    }
};

// ===== 本地缓存工具（保留给 App.vue 初始化用） =====
export function loadBills() {
    return [];  // 后端接管后，本地不再存放账单数据
}

export function loadSettings() {
    try {
        const data = uni.getStorageSync('jizhang_settings');
        if (data) return JSON.parse(data);
    } catch (e) { /* ignore */ }
    return { monthlyBudget: 5000, categories: DEFAULT_CATEGORIES };
}

export function saveSettings(settings) {
    uni.setStorageSync('jizhang_settings', JSON.stringify(settings));
}
