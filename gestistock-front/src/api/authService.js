import api from './axios'

export const authService = {
  forgotPassword: (email) => api.post('/forgot-password', { email }),
  verifyResetCode: (email, code) => api.post('/verify-reset-code', { email, code }),
  resetPassword: (data) => api.post('/reset-password', data),
  googleAuth: () => api.get('/auth/google'),
}
