import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Package, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { authService } from '../../api/authService'
import GoogleIcon from '../../components/auth/GoogleIcon'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
  const [showPassword, setShowPassword] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  useEffect(() => {
    const error = searchParams.get('error')
    if (error === 'google_auth_failed') {
      toast.error('La connexion Google a échoué. Veuillez réessayer.')
    }
  }, [searchParams])

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password)
      toast.success('Connexion réussie !')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.errors?.email?.[0] || 'Identifiants incorrects')
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    try {
      const res = await authService.googleAuth()
      window.location.href = res.data.url
    } catch {
      toast.error('Erreur de connexion Google')
      setGoogleLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-4" style={{ backgroundImage: "url('https://odoocdn.com/openerp_website/static/src/img/2016/components/arch_1.jpg')" }}>
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 w-full max-w-lg overflow-hidden">
        <div className="bg-[#2d3e50] px-6 py-4 flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-lg">
            <Package className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-white font-semibold text-lg">Connexion</h1>
            <p className="text-white/70 text-xs">Accédez à votre espace GestiStock</p>
          </div>
        </div>

        <div className="px-6 py-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse email *</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  className="w-full pl-9 pr-4 py-2.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0070CD] text-sm"
                  placeholder="vous@exemple.com"
                  {...register('email', { required: 'Veuillez saisir votre adresse email.' })}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full pl-9 pr-10 py-2.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0070CD] text-sm"
                  placeholder="••••••••"
                  {...register('password', { required: 'Veuillez saisir votre mot de passe.' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded text-sm font-semibold text-white disabled:opacity-50 bg-[#0070CD] hover:bg-[#005fa8]"
            >
              {isSubmitting ? 'Connexion...' : 'Se connecter'}
            </button>

            <div className="flex items-center justify-between text-xs pt-2">
              <p className="text-gray-600">
                Nouveau client ?{' '}
                <Link to="/register" className="text-[#0070CD] hover:underline font-medium">
                  Créez votre compte
                </Link>
              </p>
              <Link to="/forgot-password" className="text-[#0070CD] hover:underline font-medium">
                Mot de passe oublié ?
              </Link>
            </div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-gray-500">ou avec votre email</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 border border-gray-300 hover:bg-gray-50 text-gray-800 font-medium py-3 rounded text-sm"
            >
              <GoogleIcon />
              {googleLoading ? 'Redirection...' : 'Continuer avec Google'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
