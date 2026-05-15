import api from './axios'

export const movementService = {
  getAll: (params) => api.get('/stock-movements', { params }),
  create: (data)   => api.post('/stock-movements', data),
}