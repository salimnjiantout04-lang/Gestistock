import api from './axios'

export const purchaseOrderService = {
  getAll: (params) => api.get('/purchase-orders', { params }),
  getOne: (id) => api.get(`/purchase-orders/${id}`),
  create: (data) => api.post('/purchase-orders', data),
  update: (id, data) => api.put(`/purchase-orders/${id}`, data),
  delete: (id) => api.delete(`/purchase-orders/${id}`),
  markOrdered: (id) => api.post(`/purchase-orders/${id}/order`),
  markReceived: (id) => api.post(`/purchase-orders/${id}/receive`),
  cancel: (id) => api.post(`/purchase-orders/${id}/cancel`),
}
