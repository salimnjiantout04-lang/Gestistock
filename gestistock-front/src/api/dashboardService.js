import api from './axios'

export const dashboardService = {
  stats: () => api.get('/dashboard/stats'),
  alerts: () => api.get('/dashboard/alerts'),
}
