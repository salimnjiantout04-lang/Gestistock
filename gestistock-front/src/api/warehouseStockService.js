import api from './axios'

export const warehouseStockService = {
  getAll: (params) => api.get('/product-warehouse', { params }),
  store: (data) => api.post('/product-warehouse', data),
  delete: (id) => api.delete(`/product-warehouse/${id}`),
}
