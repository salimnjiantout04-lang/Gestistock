import api from './axios'

export const orderService = {
  getAll: (params) => api.get('/orders', { params }),
  getOne: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  delete: (id) => api.delete(`/orders/${id}`),
  confirm: (id) => api.post(`/orders/${id}/confirm`),
  deliver: (id) => api.post(`/orders/${id}/deliver`),
  cancel: (id) => api.post(`/orders/${id}/cancel`),
}
