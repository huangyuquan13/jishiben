import { request } from './request.js';

// 账单列表
export function getBills(params = {}) {
  const query = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');
  return request(`/api/bills?${query}`);
}

// 新增账单
export function createBill(data) {
  return request('/api/bills', { method: 'POST', data });
}

// 修改账单
export function updateBill(id, data) {
  return request(`/api/bills/${id}`, { method: 'PUT', data });
}

// 删除账单
export function deleteBill(id) {
  return request(`/api/bills/${id}`, { method: 'DELETE' });
}

// 统计数据
export function getStats(month) {
  return request(`/api/bills/stats?month=${month || ''}`);
}
