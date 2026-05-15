import { Link } from 'react-router-dom'
import { Package, BarChart3, Bell, TrendingUp, Users, Shield, ArrowRight, CheckCircle, Menu, X, Layers, Download, RefreshCw, Truck, Building2 } from 'lucide-react'
import { useState } from 'react'

const features = [
  { icon: Package, title: 'Gestion des produits', desc: 'Gérez votre catalogue produits avec catégories, fournisseurs, prix et images. Vue complète avec recherche et filtres.' },
  { icon: BarChart3, title: 'Mouvements de stock', desc: 'Suivez chaque entrée et sortie avec historique complet. Visualisez vos flux en temps réel via des graphiques.' },
  { icon: Bell, title: 'Alertes intelligentes', desc: 'Recevez des notifications automatiques pour les stocks faibles et les ruptures. Ne manquez jamais un réapprovisionnement.' },
  { icon: Building2, title: 'Multi-entrepôts', desc: 'Gérez plusieurs dépôts et emplacements. Transférez des stocks entre entrepôts avec traçabilité complète.' },
  { icon: TrendingUp, title: 'Tableaux de bord', desc: 'KPIs en temps réel, graphiques d\'évolution, top ventes. Une vision claire de votre activité en un coup d\'œil.' },
  { icon: Truck, title: 'Achats & Ventes', desc: 'Gérez vos commandes fournisseurs et vos ventes clients. Du bon de commande à la livraison, tout est suivi.' },
  { icon: Users, title: 'Gestion des utilisateurs', desc: 'Trois niveaux d\'accès : lecteur, gestionnaire, administrateur. Contrôle précis des permissions.' },
  { icon: Download, title: 'Export PDF & Excel', desc: 'Exportez vos données en PDF ou Excel avec un clic. Factures, rapports, inventaires prêts à imprimer.' },
  { icon: Shield, title: 'Authentification Google', desc: 'Connectez-vous avec votre compte Google en un clic. Sécurisé et rapide, sans mot de passe à retenir.' },
]

const stats = [
  { value: '10×', label: 'Plus rapide que les outils manuels' },
  { value: '100%', label: 'Traçabilité de vos mouvements' },
  { value: '3', label: 'Niveaux d\'accès utilisateurs' },
  { value: '24/7', label: 'Disponible en permanence' },
]

const steps = [
  { num: '01', title: 'Créez votre compte', desc: 'Inscrivez-vous gratuitement en quelques secondes, avec ou sans Google.' },
  { num: '02', title: 'Ajoutez vos produits', desc: 'Importez ou ajoutez vos produits avec catégories, prix et stocks initiaux.' },
  { num: '03', title: 'Gérez votre stock', desc: 'Enregistrez les mouvements, suivez les alertes et pilotez votre activité.' },
]

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Package size={20} className="text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">GestiStock</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-600 hover:text-blue-600 transition-colors font-medium">Solutions</a>
              <a href="#how-it-works" className="text-sm text-gray-600 hover:text-blue-600 transition-colors font-medium">Comment ça marche</a>
              <a href="#pricing" className="text-sm text-gray-600 hover:text-blue-600 transition-colors font-medium">Tarifs</a>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-blue-600 px-4 py-2 transition-colors">
                Se connecter
              </Link>
              <Link to="/register" className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-full transition-all  ">
                Essai gratuit
              </Link>
            </div>

            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2">
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-white border-b border-gray-100 px-4 py-4 space-y-3">
            <a href="#features" onClick={() => setMenuOpen(false)} className="block text-sm text-gray-600 py-2 font-medium">Fonctionnalités</a>
            <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="block text-sm text-gray-600 py-2 font-medium">Comment ça marche</a>
            <a href="#pricing" onClick={() => setMenuOpen(false)} className="block text-sm text-gray-600 py-2 font-medium">Tarifs</a>
            <div className="pt-2 flex gap-3">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 text-center text-sm font-medium text-gray-700 border border-gray-200 px-4 py-2.5 rounded-full">Se connecter</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="flex-1 text-center text-sm font-medium text-white bg-blue-600 px-4 py-2.5 rounded-full">Essai gratuit</Link>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.08),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.05),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs font-medium text-blue-700">Nouvelle version disponible</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 tracking-tight leading-[1.08] mb-6">
              Gérez votre stock
              <span className="block text-blue-600">simplement et efficacement</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-8 leading-relaxed">
              GestiStock est l'outil de gestion de stock moderne dont votre entreprise a besoin. 
              Suivi des mouvements, alertes intelligentes, rapports détaillés — le tout dans une interface élégante.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/register" className="w-full sm:w-auto text-center text-white bg-blue-600 hover:bg-blue-700 px-8 py-3.5 rounded-full text-sm font-semibold transition-all  shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5">
                Commencer gratuitement
              </Link>
              <a href="#features" className="w-full sm:w-auto text-center text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-8 py-3.5 rounded-full text-sm font-semibold transition-all">
                En savoir plus
              </a>
            </div>
            <p className="text-xs text-gray-400 mt-4">Aucune carte bancaire requise · Essai gratuit</p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            <div className="absolute -inset-4  rounded-3xl blur-xl" />
            <div className="relative bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 border-b border-gray-100">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
                <span className="ml-3 text-xs text-gray-400 font-mono">app.gestistock.com/dashboard</span>
              </div>
              <img
                src="/src/assets/dashboard-screenshot.png"
                alt="Aperçu du tableau de bord GestiStock"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16" style={{ backgroundColor: 'oklch(0.15 0.06 261.89)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <div key={i} className="text-center text-white">
                <p className="text-4xl md:text-5xl font-bold mb-1">{s.value}</p>
                <p className="text-sm text-blue-200">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full mb-4">Fonctionnalités</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-4">
              Tout ce dont vous avez besoin pour gérer votre stock
            </h2>
            <p className="text-gray-500">Une solution complète et intuitive pour les PME, les commerces et les entrepôts.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => {
              const Icon = feat.icon
              return (
                <div key={i} className="group p-6 rounded-2xl border border-gray-100 hover:border-blue-100 hover:shadow-lg hover:shadow-blue-50/50 transition-all duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon size={22} className="text-blue-600" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">{feat.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feat.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full mb-4">Comment ça marche</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-4">
              Prêt en 3 étapes
            </h2>
            <p className="text-gray-500">Configurez votre espace en quelques minutes et commencez à gérer votre stock.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative text-center">
                {i < 2 && <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px border-t-2 border-dashed border-gray-200" />}
                <div className="w-24 h-24 rounded-2xl bg-blue-700 flex items-center justify-center mx-auto mb-6 shadow-lg ">
                  <span className="text-2xl font-bold text-white">{step.num}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full mb-4">Tarifs</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-4">
              Simple et transparent
            </h2>
            <p className="text-gray-500">Pas de frais cachés, pas de surprise. Commencez gratuitement.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="rounded-2xl border border-gray-100 p-8 bg-white hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Starter</h3>
              <p className="text-sm text-gray-500 mb-6">Pour les petites structures</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">Gratuit</p>
              <p className="text-sm text-gray-400 mb-6">Toujours</p>
              <ul className="space-y-3 mb-8">
                {['Jusqu\'à 50 produits', 'Mouvements de stock', 'Tableau de bord', '1 entrepôt', 'Support email'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle size={16} className="text-blue-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="block w-full text-center text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 px-6 py-3 rounded-full transition-colors">
                Commencer
              </Link>
            </div>

            <div className="rounded-2xl border-2 border-blue-500 p-8 bg-white shadow-xl shadow-blue-100 relative scale-105">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-4 py-1 rounded-full">Populaire</span>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pro</h3>
              <p className="text-sm text-gray-500 mb-6">Pour les entreprises en croissance</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">14 900 <span className="text-base font-medium text-gray-400">FCFA/mois</span></p>
              <p className="text-sm text-gray-400 mb-6">Soit ~23 €/mois</p>
              <ul className="space-y-3 mb-8">
                {['Produits illimités', 'Multi-entrepôts', 'Alertes automatiques', 'Export PDF & Excel', '9 utilisateurs inclus', 'Support prioritaire'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle size={16} className="text-blue-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="block w-full text-center text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-full transition-all shadow-lg shadow-blue-200">
                Essai gratuit
              </Link>
            </div>

            <div className="rounded-2xl border border-gray-100 p-8 bg-white hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Enterprise</h3>
              <p className="text-sm text-gray-500 mb-6">Pour les grandes structures</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">Sur mesure</p>
              <p className="text-sm text-gray-400 mb-6">Nous contacter</p>
              <ul className="space-y-3 mb-8">
                {['Tout Pro inclus', 'Utilisateurs illimités', 'API & intégrations', 'Hébergement dédié', 'SLA garanti', 'Formation équipe'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle size={16} className="text-blue-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <a href="mailto:njiantout004@gmail.com" className="block w-full text-center text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-6 py-3 rounded-full transition-colors">
                Nous contacter
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Prêt à transformer votre gestion de stock ?
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Rejoignez les entreprises qui utilisent GestiStock au quotidien. 
            Commencez gratuitement, aucune carte bancaire requise.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register" className="w-full sm:w-auto text-center text-gray-900 bg-white hover:bg-gray-100 px-8 py-3.5 rounded-full text-sm font-semibold transition-all shadow-xl">
              Commencer gratuitement
            </Link>
            <a href="mailto:njiantout004@gmail.com" className="w-full sm:w-auto text-center text-white border border-gray-600 hover:border-gray-500 px-8 py-3.5 rounded-full text-sm font-semibold transition-all">
              Contacter l'équipe
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="bg-blue-600 p-1.5 rounded-lg">
                  <Package size={18} className="text-white" />
                </div>
                <span className="text-base font-bold text-gray-900">GestiStock</span>
              </Link>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                Solution de gestion de stock moderne pour les entreprises africaines.
              </p>
              <p className="text-xs text-gray-400">Douala, Cameroun</p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-4">Produit</h4>
              <ul className="space-y-2.5">
                {['Fonctionnalités', 'Tarifs', 'FAQ', 'Mises à jour'].map((item, i) => (
                  <li key={i}><a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-4">Entreprise</h4>
              <ul className="space-y-2.5">
                {['À propos', 'Blog', 'Contact', 'Partenaires'].map((item, i) => (
                  <li key={i}><a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-4">Légal</h4>
              <ul className="space-y-2.5">
                {['Confidentialité', 'Conditions', 'CGV', 'Mentions légales'].map((item, i) => (
                  <li key={i}><a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} GestiStock. tous droits réservés.
            </p>
            
          </div>
        </div>
      </footer>
    </div>
  )
}
