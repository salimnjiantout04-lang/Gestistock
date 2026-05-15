import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Mail, ArrowLeft, CheckCircle, KeyRound, Lock, Eye, EyeOff } from 'lucide-react'
import { authService } from '../../api/authService'

export default function ForgotPassword() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [done, setDone] = useState(false)

  const handleSendCode = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authService.forgotPassword(email)
      setMessage(res.data.message)
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.errors?.email?.[0] || "Impossible d'envoyer le code")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authService.verifyResetCode(email, code)
      setStep(3)
    } catch (err) {
      setError(err.response?.data?.errors?.code?.[0] || "Code invalide")
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authService.resetPassword({
        email,
        code,
        password,
        password_confirmation: passwordConfirmation,
      })
      setDone(true)
    } catch (err) {
      setError(err.response?.data?.errors?.code?.[0] || err.response?.data?.errors?.email?.[0] || "Échec de la réinitialisation")
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="relative min-h-screen bg-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <p className="text-green-600 font-medium mb-2">Mot de passe réinitialisé !</p>
          <p className="text-sm text-gray-500 mb-6">Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
          <Link to="/login" className="inline-block bg-blue-600 text-white font-medium py-2.5 px-6 rounded-lg text-sm shadow-lg shadow-blue-200">
            Se connecter
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
          <p className="text-gray-500 text-sm mt-1">Mot de passe oublié</p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === s ? 'bg-blue-600 text-white' : step > s ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
            }`}>
              {step > s ? <CheckCircle size={16} /> : s}
            </div>
          ))}
        </div>

        {step === 1 && (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-all text-sm shadow-lg shadow-blue-200"
            >
              {loading ? 'Envoi...' : 'Envoyer le code'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <p className="text-sm text-gray-500 text-center">
              Un code à 6 chiffres a été envoyé à <strong>{email}</strong>
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code de vérification</label>
              <div className="relative">
                <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-center tracking-[0.5em] font-mono"
                  placeholder="000000"
                  maxLength={6}
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                />
              </div>
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-all text-sm shadow-lg shadow-blue-200"
            >
              {loading ? 'Vérification...' : 'Vérifier le code'}
            </button>
            <button
              type="button"
              onClick={handleSendCode}
              disabled={loading}
              className="w-full text-blue-600 hover:underline text-sm font-medium bg-transparent"
            >
              Renvoyer le code
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Minimum 8 caractères"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
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
                  value={passwordConfirmation}
                  onChange={e => setPasswordConfirmation(e.target.value)}
                  required
                />
              </div>
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button
              type="submit"
              disabled={loading || password !== passwordConfirmation || password.length < 8}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-all text-sm shadow-lg shadow-blue-200"
            >
              {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6 flex items-center justify-center gap-1">
          <ArrowLeft size={14} />
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  )
}
