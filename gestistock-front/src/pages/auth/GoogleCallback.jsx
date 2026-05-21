import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../api/authService'
import { Package, AlertCircle } from 'lucide-react'

const ERROR_MESSAGES = {
  google_auth_failed: 'La connexion Google a échoué. Veuillez réessayer.',
  access_denied: 'Vous avez annulé la connexion Google.',
}

export default function GoogleCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setSession } = useAuth()
  const [error, setError] = useState('')
  const exchanged = useRef(false)

  useEffect(() => {
    if (exchanged.current) return

    const errorParam = searchParams.get('error')
    const code = searchParams.get('code')

    if (errorParam) {
      setError(ERROR_MESSAGES[errorParam] || ERROR_MESSAGES.google_auth_failed)
      return
    }

    if (!code) {
      setError('Lien de connexion invalide.')
      return
    }

    exchanged.current = true

    authService.exchangeGoogleCode(code)
      .then((res) => {
        setSession(res.data.user, res.data.token)
        navigate('/dashboard', { replace: true })
      })
      .catch((err) => {
        const message = err.response?.data?.errors?.code?.[0]
          || 'Impossible de finaliser la connexion Google.'
        setError(message)
      })
  }, [searchParams, navigate, setSession])

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-sm p-8 text-center">
        {error ? (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} className="text-red-600" />
            </div>
            <p className="text-red-600 font-medium mb-2">{error}</p>
            <button type="button" onClick={() => navigate('/login')} className="text-blue-600 hover:underline text-sm">
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
