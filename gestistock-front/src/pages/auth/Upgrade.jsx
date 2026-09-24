import { Link } from 'react-router-dom'
import { Package, CheckCircle, MessageCircle, Lock } from 'lucide-react'

export default function Upgrade() {
  return (
    <div className="relative min-h-screen bg-white flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top_right,rgba(15,23,42,0.035),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(148,163,184,0.04),transparent_50%)]">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 w-full max-w-lg overflow-hidden">
        <div className="bg-[#2d3e50] px-6 py-5 flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-lg">
            <Lock className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-white font-semibold text-lg">Essai gratuit terminé</h1>
            <p className="text-white/70 text-xs">Passez au plan payant pour continuer</p>
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 mb-5">
            <p className="text-sm text-amber-800">
              Votre essai gratuit de <strong>7 jours</strong> est expiré. Pour continuer à utiliser
              GestiStock, choisissez un plan payant ci-dessous.
            </p>
          </div>

          <div className="border border-[#0070CD]/20 rounded-xl overflow-hidden mb-5">
            <div className="bg-[#0070CD] px-5 py-3 flex items-center justify-between">
              <span className="text-white font-semibold text-sm">Plan Pro</span>
              <span className="text-white/80 text-xs">Recommandé</span>
            </div>
            <div className="p-5">
              <p className="text-3xl font-bold text-gray-900 mb-3">Sur devis</p>
              <ul className="space-y-2.5">
                {[
                  'Stock et produits illimités',
                  'Commandes, achats et transferts',
                  'Alertes stock et mouvements',
                  'Multimagasins & utilisateurs',
                  'Support prioritaire',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle size={16} className="text-[#0070CD] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <a
            href="https://wa.me/237678330877"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 rounded text-sm font-bold text-white bg-[#25D366] hover:bg-[#1fae54] transition-colors"
          >
            <MessageCircle size={18} />
            Souscrire sur WhatsApp
          </a>

          <p className="text-center text-xs text-gray-400 mt-4">
            Notre équipe vous envoie le lien du plan dès votre message.
          </p>

          <div className="flex items-center justify-between text-xs pt-5">
            <Link to="/login" className="text-[#0070CD] hover:underline font-medium">
              Revenir à la connexion
            </Link>
            <Link to="/" className="text-gray-500 hover:underline">
              Accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}