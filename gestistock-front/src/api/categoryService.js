import api from './axios'

export const categoryService = {
  getAll: ()           => api.get('/categories'),
  create: (data)       => api.post('/categories', data),
  update: (id, data)   => api.put(`/categories/${id}`, data),
  delete: (id)         => api.delete(`/categories/${id}`),
}