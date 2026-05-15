import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { Package, AlertCircle } from 'lucide-react'

export default function GoogleCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    const errorParam = searchParams.get('error')

    if (errorParam) {
      setError('Authentification Google échouée.')
      return
    }

    if (token) {
      localStorage.setItem('token', token)
      api.get('/me')
        .then(res => {
          const loginEvent = new CustomEvent('google-login', { detail: { user: res.data, token } })
          window.dispatchEvent(loginEvent)
          navigate('/dashboard', { replace: true })
        })
        .catch(() => {
          localStorage.removeItem('token')
          setError('Erreur de récupération du profil.')
        })
    } else {
      setError('Token manquant.')
    }
  }, [])

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-sm p-8 text-center">
        {error ? (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} className="text-red-600" />
            </div>
            <p className="text-red-600 font-medium mb-2">{error}</p>
            <button onClick={() => navigate('/login')} className="text-blue-600 hover:underline text-sm">
              Retour à la connexion
            </button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Package size={32} className="text-blue-600" />
            </div>
            <p className="text-gray-600 font-medium">Connexion en cours...</p>
          </>
        )}
      </div>
    </div>
  )
}
