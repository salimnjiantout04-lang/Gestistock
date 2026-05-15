import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Package, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { authService } from '../../api/authService'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: searchParams.get('email') || '',
    password: '',
    password_confirmation: '',
    token: searchParams.get('token') || '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authService.resetPassword(form)
      setDone(true)
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      setError(err.response?.data?.errors?.email?.[0] || 'Échec de la réinitialisation')
    } finally {
      setLoading(false)
    }
  }

  if (!form.token) {
    return (
      <div className="relative min-h-screen bg-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md p-8 text-center">
          <Package className="mx-auto text-gray-300 mb-4" size={48} />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Lien invalide</h1>
          <p className="text-sm text-gray-500 mb-6">Ce lien de réinitialisation est invalide ou a expiré.</p>
          <Link to="/forgot-password" className="text-blue-600 hover:underline text-sm font-medium">
            Renvoyer un lien
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-3 rounded-xl mb-3 shadow-lg shadow-blue-200">
            <Package className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">GestiStock</h1>
          <p className="text-gray-500 text-sm mt-1">Nouveau mot de passe</p>
        </div>

        {done ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <p className="text-green-600 font-medium">Mot de passe réinitialisé !</p>
            <p className="text-sm text-gray-500 mt-1">Redirection vers la connexion...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-500 cursor-not-allowed"
                value={form.email}
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Minimum 8 caractères"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  minLength={8}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Confirmer le mot de passe"
                  value={form.password_confirmation}
                  onChange={e => setForm(p => ({ ...p, password_confirmation: e.target.value }))}
                  required
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-xs">{error}</p>}

            <button
              type="submit"
              disabled={loading || form.password !== form.password_confirmation}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-all text-sm shadow-lg shadow-blue-200"
            >
              {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
