const hasLowercase = (p) => /[a-z]/.test(p)
const hasUppercase = (p) => /[A-Z]/.test(p)
const hasDigit = (p) => /[0-9]/.test(p)

const RULES = [
  { id: 'length', label: 'Entre 8 et 30 caractères', test: (p) => p.length >= 8 && p.length <= 30 },
  { id: 'lower', label: 'Au moins une minuscule', test: hasLowercase },
  { id: 'upper', label: 'Au moins une majuscule', test: hasUppercase },
  { id: 'digit', label: 'Au moins un chiffre', test: hasDigit },
]

export function isPasswordValid(password) {
  const pwd = String(password ?? '')
  return RULES.every((rule) => rule.test(pwd))
}

function CheckIcon({ ok }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${ok ? 'block text-green-600' : 'hidden'}`} style={{ width: 14, height: 14 }}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function CrossIcon({ ok }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${ok ? 'hidden' : 'block text-gray-400'}`} style={{ width: 14, height: 14 }}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

export default function PasswordRules({ password = '' }) {
  const pwd = String(password ?? '')

  return (
    <ul className="mt-2 space-y-1">
      {RULES.map((rule) => {
        const ok = pwd.length > 0 && rule.test(pwd)
        return (
          <li key={rule.id} className={`flex items-center gap-2 text-xs ${ok ? 'text-green-600' : 'text-gray-500'}`}>
            <span className="relative inline-flex items-center justify-center" style={{ width: 14, height: 14 }}>
              <CheckIcon ok={ok} />
              <CrossIcon ok={ok} />
            </span>
            {rule.label}
          </li>
        )
      })}
    </ul>
  )
}
