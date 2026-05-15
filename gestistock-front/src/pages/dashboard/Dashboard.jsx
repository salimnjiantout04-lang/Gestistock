import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AppLayout from '../../components/layouts/AppLayout'
import { dashboardService } from '../../api/dashboardService'
import {
  Package, TrendingUp, AlertTriangle, XCircle, ArrowDownCircle, ArrowUpCircle,
  ShoppingCart, FileText, TrendingDown
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardService.stats()
      .then(res => setStats(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    )
  }

  const chartData = () => {
    const map = {}
    stats.mouvements_30j.forEach(m => {
      if (!map[m.date]) map[m.date] = { date: m.date, entree: 0, sortie: 0 }
      map[m.date][m.type] = Number(m.total)
    })
    return Object.values(map).slice(-14)
  }

  const kpis = [
    {
      label: 'Produits', value: stats.total_produits, icon: Package,
      color: 'bg-blue-50 text-blue-600', border: 'border-blue-100',
    },
    {
      label: 'Valeur stock', value: Number(stats.valeur_stock).toLocaleString() + ' FCFA', icon: TrendingUp,
      color: 'bg-blue-50 text-blue-600', border: 'border-blue-100',
    },
    {
      label: 'Ventes du mois', value: Number(stats.ventes_du_mois).toLocaleString() + ' FCFA', icon: ShoppingCart,
      color: 'bg-blue-50 text-blue-600', border: 'border-blue-100',
    },
    {
      label: 'Stock faible', value: stats.stock_faible, icon: AlertTriangle,
      color: 'bg-blue-50 text-blue-600', border: 'border-blue-100',
    },
    {
      label: 'En rupture', value: stats.en_rupture, icon: XCircle,
      color: 'bg-blue-50 text-blue-600', border: 'border-blue-100',
    },
    {
      label: 'Commandes en attente', value: stats.commandes_attentes, icon: FileText,
      color: 'bg-blue-50 text-blue-600', border: 'border-blue-100', link: '/purchases',
    },
  ]

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Tableau de bord</h1>
        <p className="text-sm text-gray-500 mt-1">Vue d'ensemble de votre activité</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {kpis.map(({ label, value, icon: Icon, color, border, link }) => {
          const card = (
            <div className={`bg-white rounded-xl border ${border} p-4 flex items-center gap-3 ${link ? 'cursor-pointer hover:shadow-sm' : ''}`}>
              <div className={`p-2.5 rounded-xl ${color}`}><Icon size={18} /></div>
              <div className="min-w-0">
                <p className="text-lg font-bold text-gray-900 truncate">{value}</p>
                <p className="text-xs text-gray-500 truncate">{label}</p>
              </div>
            </div>
          )
          return link ? <Link key={label} to={link}>{card}</Link> : <div key={label}>{card}</div>
        })}
      </div>

      {/* Mouvements + top ventes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Graphique mouvements */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-base font-medium text-gray-900 mb-4">Mouvements (14 jours)</h2>
          {chartData().length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Aucun mouvement</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData()}>
                <defs>
                  <linearGradient id="entree" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="sortie" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }}
                  tickFormatter={d => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val, name) => [val, name === 'entree' ? 'Entrées' : 'Sorties']}
                  labelFormatter={d => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })} />
                <Legend formatter={v => v === 'entree' ? 'Entrées' : 'Sorties'} />
                <Area type="monotone" dataKey="entree" stroke="#22c55e" fill="url(#entree)" strokeWidth={2} />
                <Area type="monotone" dataKey="sortie" stroke="#ef4444" fill="url(#sortie)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top ventes */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-base font-medium text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-600" /> Top 5 ventes
          </h2>
          {stats.top_ventes?.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Aucune vente</p>
          ) : (
            <div className="space-y-3">
              {stats.top_ventes?.map((v, i) => (
                <div key={v.product_id} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{v.product?.name}</p>
                    <p className="text-xs text-gray-400">{v.total_qty} vendus · {Number(v.total_ventes).toLocaleString()} FCFA</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Ventes mensuelles */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-base font-medium text-gray-900 mb-4">Ventes mensuelles (12 mois)</h2>
          {stats.ventes_mensuelles?.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Aucune donnée</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.ventes_mensuelles}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mois" tick={{ fontSize: 10 }}
                  tickFormatter={d => { const [y, m] = d.split('-'); return `${m}/${y.slice(2)}` }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={val => [Number(val).toLocaleString() + ' FCFA', 'Ventes']}
                  labelFormatter={l => `Mois: ${l}`} />
                <Bar dataKey="total_ventes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Achats par statut */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-base font-medium text-gray-900 mb-4">Achats par statut</h2>
          {!stats.achats_par_statut || Object.keys(stats.achats_par_statut).length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Aucun achat</p>
          ) : (() => {
            const labels = { brouillon: 'Brouillon', commande: 'Commandé', recu: 'Reçu', annule: 'Annulé' }
            const colors = { brouillon: '#f59e0b', commande: '#3b82f6', recu: '#22c55e', annule: '#ef4444' }
            const data = Object.entries(stats.achats_par_statut).filter(([_, v]) => Number(v) > 0).map(([k, v]) => ({ name: labels[k] || k, value: Number(v), fill: colors[k] || '#999' }))
            return (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" nameKey="name"
                    label={({ name, value }) => `${name}: ${value}`}>
                    {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )
          })()}
        </div>
      </div>

      {/* Derniers mouvements */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-base font-medium text-gray-900 mb-4">Derniers mouvements</h2>
        {stats.derniers_mouvements.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Aucun mouvement</p>
        ) : (
          <div className="space-y-3">
            {stats.derniers_mouvements.map(m => (
              <div key={m.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50">
                <div className={`p-2 rounded-lg ${m.type === 'entree' ? 'bg-green-50' : 'bg-red-50'}`}>
                  {m.type === 'entree'
                    ? <ArrowDownCircle size={18} className="text-green-600" />
                    : <ArrowUpCircle size={18} className="text-red-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{m.product?.name}</p>
                  <p className="text-xs text-gray-400">{m.reason || 'Sans motif'} · {m.user?.name}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-semibold ${m.type === 'entree' ? 'text-green-600' : 'text-red-500'}`}>
                    {m.type === 'entree' ? '+' : '-'}{m.quantity}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(m.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
