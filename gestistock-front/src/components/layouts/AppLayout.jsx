import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { dashboardService } from '../../api/dashboardService'
import toast from 'react-hot-toast'
import {
  LayoutDashboard,
  Package,
  Tags,
  ArrowLeftRight,
  Bell,
  Building2,
  LogOut,
  Menu,
  Moon,
  Sun,
  Truck,
  X,
  Users,
  FileText,
  ShoppingCart,
  MapPin,
  ArrowRightLeft
} from 'lucide-react'
import { useState, useEffect } from 'react'

export default function AppLayout({ children }) {
  const { user: currentUser, logout } = useAuth()
  const { isDarkMode, toggleTheme } = useTheme()
  const location  = useLocation()
  const navigate  = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [alerts, setAlerts] = useState({ total: 0 })

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await dashboardService.alerts()
        setAlerts(res.data)
      } catch {}
    }
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 60000)
    return () => clearInterval(interval)
  }, [])

  const navItems = [
    { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard',    roles: ['admin', 'gestionnaire', 'lecteur'] },
    { to: '/products',   icon: Package,         label: 'Produits',     roles: ['admin', 'gestionnaire', 'lecteur'] },
    { to: '/categories', icon: Tags,            label: 'Catégories',   roles: ['admin', 'gestionnaire', 'lecteur'] },
    { to: '/suppliers',  icon: Truck,           label: 'Fournisseurs', roles: ['admin', 'gestionnaire', 'lecteur'] },
    { to: '/warehouses',      icon: Building2,       label: 'Entrepôts',       roles: ['admin', 'gestionnaire', 'lecteur'] },
    { to: '/locations',       icon: MapPin,          label: 'Emplacements',    roles: ['admin', 'gestionnaire', 'lecteur'] },
    { to: '/warehouse-stock', icon: Package,          label: 'Stock/Entrepôt',  roles: ['admin', 'gestionnaire', 'lecteur'] },
    { to: '/transfers',       icon: ArrowRightLeft,  label: 'Transferts',      roles: ['admin', 'gestionnaire', 'lecteur'] },
    { to: '/purchases',  icon: FileText,        label: 'Achats',       roles: ['admin', 'gestionnaire', 'lecteur'] },
    { to: '/sales',      icon: ShoppingCart,    label: 'Ventes',       roles: ['admin', 'gestionnaire', 'lecteur'] },
    { to: '/movements',  icon: ArrowLeftRight,  label: 'Mouvements',   roles: ['admin', 'gestionnaire', 'lecteur'] },
    { to: '/alerts',     icon: Bell,            label: 'Alertes',      roles: ['admin', 'gestionnaire', 'lecteur'], badge: 'alerts' },
    { to: '/users',      icon: Users,           label: 'Utilisateurs', roles: ['admin'] },
  ]

  const filteredNav = navItems.filter(item => item.roles.includes(currentUser?.role))

  const handleLogout = async () => {
    navigate('/')
    await logout()
    toast.success('Déconnecté avec succès')
  }

  const ThemeToggle = ({ className = '' }) => (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDarkMode ? 'Activer le mode clair' : 'Activer le mode nuit'}
      aria-label={isDarkMode ? 'Activer le mode clair' : 'Activer le mode nuit'}
      className={`flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50 hover:text-blue-600 transition-colors ${className}`}
    >
      {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-100 fixed h-full">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Package size={20} className="text-white" />
          </div>
          <span className="font-semibold text-gray-900">GestiStock</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {filteredNav.map(({ to, icon: Icon, label, badge }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                location.pathname === to
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon size={18} />
              {label}
              {badge === 'alerts' && alerts.total > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {alerts.total}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
              {currentUser?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{currentUser?.name}</p>
              <p className="text-xs text-gray-400 truncate capitalize">{currentUser?.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle className="w-10 h-10 shrink-0" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 flex-1 transition-colors"
            >
              <LogOut size={18} />
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Package size={16} className="text-white" />
          </div>
          <span className="font-semibold text-gray-900">GestiStock</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle className="w-9 h-9" />
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-1">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white pt-16 px-4">
          <nav className="space-y-1">
            {filteredNav.map(({ to, icon: Icon, label, badge }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors ${
                  location.pathname === to
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={18} />
                {label}
                {badge === 'alerts' && alerts.total > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
{alerts.total}
                  </span>
                )}
              </Link>
            ))}
          </nav>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-red-500 mt-4 w-full"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-60 pt-16 md:pt-0">
        <div className="p-6">
          {children}
        </div>
      </main>

    </div>
  )
}
