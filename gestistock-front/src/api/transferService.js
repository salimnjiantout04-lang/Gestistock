import api from './axios'

export const transferService = {
  getAll: (params) => api.get('/transfers', { params }),
  getOne: (id) => api.get(`/transfers/${id}`),
  create: (data) => api.post('/transfers', data),
  delete: (id) => api.delete(`/transfers/${id}`),
  validate: (id) => api.post(`/transfers/${id}/validate`),
  cancel: (id) => api.post(`/transfers/${id}/cancel`),
}
