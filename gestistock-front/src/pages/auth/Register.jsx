import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Package, Mail, Lock, Eye, EyeOff, ChevronRight, ChevronLeft, User, Phone } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../api/authService'
import PasswordRules, { isPasswordValid } from '../../components/auth/PasswordRules'
import GoogleIcon from '../../components/auth/GoogleIcon'

const STEPS = [
  { id: 1, label: 'Email' },
  { id: 2, label: 'Mot de passe' },
  { id: 3, label: 'Vos informations' },
]

const initialForm = {
  email: '',
  password: '',
  password_confirmation: '',
  civility: 'M.',
  first_name: '',
  last_name: '',
  phone: '',
  accept_terms: false,
  newsletter: false,
}

export default function Register() {
  const navigate = useNavigate()
  const { setSession } = useAuth()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(initialForm)
  const [showPassword, setShowPassword] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validateStep1 = () => {
    const next = {}
    if (!form.email.trim()) next.email = 'Veuillez saisir votre adresse email.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Adresse email invalide.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const validateStep2 = () => {
    const next = {}
    if (!isPasswordValid(form.password)) next.password = 'Le mot de passe ne respecte pas les critères.'
    if (form.password !== form.password_confirmation) next.password_confirmation = 'Les mots de passe ne correspondent pas.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const validateStep3 = () => {
    const next = {}
    if (!form.first_name.trim()) next.first_name = 'Le prénom est requis.'
    if (!form.last_name.trim()) next.last_name = 'Le nom est requis.'
    if (!form.accept_terms) next.accept_terms = 'Vous devez accepter les conditions générales.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const goNext = () => {
    if (step === 1 && validateStep1()) setStep(2)
    if (step === 2 && validateStep2()) setStep(3)
  }

  const goBack = () => setStep((s) => Math.max(1, s - 1))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateStep3()) return

    setLoading(true)
    try {
      const res = await authService.register({
        civility: form.civility,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        password: form.password,
        password_confirmation: form.password_confirmation,
        accept_terms: true,
        newsletter: form.newsletter,
      })
      setSession(res.data.user, res.data.token)
      toast.success('Bienvenue ! Votre compte a été créé.')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const apiErrors = err.response?.data?.errors
      if (apiErrors) {
        const mapped = {}
        Object.entries(apiErrors).forEach(([key, msgs]) => {
          mapped[key] = Array.isArray(msgs) ? msgs[0] : msgs
        })
        setErrors(mapped)
        if (apiErrors.email) setStep(1)
        else if (apiErrors.password) setStep(2)
        Object.values(apiErrors).flat().forEach((msg) => toast.error(msg))
      } else {
        toast.error('Impossible de créer le compte.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
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
            <h1 className="text-white font-semibold text-lg">Créer votre compte</h1>
            <p className="text-white/70 text-xs">Nouveau client ? Inscrivez-vous en quelques étapes</p>
          </div>
        </div>

        <div className="px-6 pt-5 pb-2">
          <div className="flex justify-between mb-2">
            {STEPS.map((s) => (
              <span key={s.id} className={`flex-1 text-center text-xs font-medium ${step >= s.id ? 'text-[#0070CD]' : 'text-gray-400'}`}>
                {s.label}
              </span>
            ))}
          </div>
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-[#0070CD] transition-all duration-300" style={{ width: `${(step / STEPS.length) * 100}%` }} />
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">Étape {step} sur {STEPS.length}</p>
        </div>

        <div className="px-6 pb-6">
          <form
            onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); goNext() }}
            className="space-y-4"
            noValidate
          >
            {step === 1 && (
              <>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse email *</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0070CD] text-sm"
                    placeholder="vous@exemple.com"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
              </>
            )}

            {step === 2 && (
              <>
                <p className="text-sm text-gray-600 bg-blue-50 border border-blue-100 rounded p-3">
                  Compte pour <strong>{form.email}</strong>
                  <button type="button" onClick={goBack} className="ml-2 text-[#0070CD] text-xs underline">Modifier</button>
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    autoComplete="new-password"
                    inputMode="text"
                    value={form.password ?? ''}
                    onChange={(e) => update('password', e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0070CD] text-sm"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <PasswordRules password={form.password} />
                {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}

                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe *</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password_confirmation"
                    autoComplete="new-password"
                    inputMode="text"
                    value={form.password_confirmation ?? ''}
                    onChange={(e) => update('password_confirmation', e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0070CD] text-sm"
                  />
                </div>
                {errors.password_confirmation && <p className="text-red-500 text-xs">{errors.password_confirmation}</p>}
              </>
            )}

            {step === 3 && (
              <>
                <label className="block text-sm font-medium text-gray-700 mb-1">Civilité *</label>
                <div className="flex gap-4 mb-2">
                  {['M.', 'Mme'].map((c) => (
                    <label key={c} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" name="civility" checked={form.civility === c} onChange={() => update('civility', c)} className="text-[#0070CD]" />
                      {c}
                    </label>
                  ))}
                </div>

                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={form.first_name} onChange={(e) => update('first_name', e.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0070CD] text-sm" />
                </div>
                {errors.first_name && <p className="text-red-500 text-xs">{errors.first_name}</p>}

                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={form.last_name} onChange={(e) => update('last_name', e.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0070CD] text-sm" />
                </div>
                {errors.last_name && <p className="text-red-500 text-xs">{errors.last_name}</p>}

                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone mobile (facultatif)</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0070CD] text-sm" placeholder="06 12 34 56 78" />
                </div>

                <label className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={form.accept_terms} onChange={(e) => update('accept_terms', e.target.checked)} className="mt-1" />
                  <span>J&apos;accepte les <a href="#" className="text-[#0070CD] underline">conditions générales</a> et la <a href="#" className="text-[#0070CD] underline">politique de confidentialité</a> *</span>
                </label>
                {errors.accept_terms && <p className="text-red-500 text-xs">{errors.accept_terms}</p>}

                <label className="flex items-start gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={form.newsletter} onChange={(e) => update('newsletter', e.target.checked)} className="mt-1" />
                  <span>Je souhaite recevoir les offres et actualités GestiStock par email</span>
                </label>
              </>
            )}

            <div className="flex gap-3 pt-2">
              {step > 1 && (
                <button type="button" onClick={goBack} className="flex items-center justify-center gap-1 px-4 py-2.5 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50">
                  <ChevronLeft size={16} /> Retour
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded text-sm font-semibold text-white disabled:opacity-50 ${step === 3 ? 'bg-[#f15a24] hover:bg-[#d94e1d]' : 'bg-[#0070CD] hover:bg-[#005fa8]'}`}
              >
                {loading ? 'Création...' : step === 3 ? 'Créer mon compte' : 'Continuer'}
                {step < 3 && <ChevronRight size={16} />}
              </button>
            </div>

            {step === 1 && (
              <>
                <div className="flex items-center justify-between text-xs">
                  <p className="text-gray-600">
                    Déjà client ?{' '}
                    <Link to="/login" className="text-[#0070CD] hover:underline font-medium">
                      Connectez-vous
                    </Link>
                  </p>
                </div>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                  <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-gray-500">ou avec votre email</span></div>
                </div>
                <button type="button" onClick={handleGoogleSignup} disabled={googleLoading} className="w-full flex items-center justify-center gap-3 border border-gray-300 hover:bg-gray-50 text-gray-800 font-medium py-3 rounded text-sm">
                  <GoogleIcon />
                  {googleLoading ? 'Redirection...' : 'Continuer avec Google'}
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
