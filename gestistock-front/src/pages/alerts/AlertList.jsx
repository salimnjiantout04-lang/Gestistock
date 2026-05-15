import { useState, useEffect } from 'react'
import AppLayout from '../../components/layouts/AppLayout'
import { productService } from '../../api/productService'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'
import { AlertTriangle, XCircle, Edit, FileText } from 'lucide-react'
import { purchaseOrderService } from '../../api/purchaseOrderService'

export default function AlertList() {
  const { user: currentUser } = useAuth()
  const [rupture, setRupture]   = useState([])
  const [faible, setFaible]     = useState([])
  const [commandes, setCommandes] = useState([])
  const [loading, setLoading]   = useState(true)
  const canManageStock = ['admin', 'gestionnaire'].includes(currentUser?.role)

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const [r, f, c] = await Promise.all([
          productService.getAll({ stock_status: 'rupture', per_page: 100 }),
          productService.getAll({ stock_status: 'faible',  per_page: 100 }),
          purchaseOrderService.getAll({ status_in: 'brouillon,commande', per_page: 100 }),
        ])
        setRupture(r.data.data)
        setFaible(f.data.data)
        setCommandes(c.data.data)
      } finally {
        setLoading(false)
      }
    }
    fetchAlerts()
  }, [])

  const ProductRow = ({ product }) => (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {product.image ? (
            <img
              src={`http://localhost:8000/storage/${product.image}`}
              className="w-9 h-9 rounded-lg object-cover"
              alt={product.name}
            />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
              <AlertTriangle size={14} className="text-gray-400" />
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900 text-sm">{product.name}</p>
            <p className="text-xs text-gray-400">{product.reference}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">{product.category?.name || '—'}</td>
      <td className="px-6 py-4">
        <span className={`font-semibold text-sm ${product.quantity === 0 ? 'text-red-600' : 'text-yellow-600'}`}>
          {product.quantity} {product.unit}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">{product.quantity_min} {product.unit}</td>
      {canManageStock && (
        <td className="px-6 py-4">
          <Link
            to={`/products/${product.id}/edit`}
            className="flex items-center gap-1.5 text-blue-600 hover:underline text-sm"
          >
            <Edit size={14} /> Réapprovisionner
          </Link>
        </td>
      )}
    </tr>
  )

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Alertes stock</h1>
        <p className="text-sm text-gray-500 mt-1">
          {rupture.length + faible.length + commandes.length} éléments nécessitent votre attention
        </p>
      </div>

      {/* Cards résumé */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-red-50 border border-red-100 rounded-xl p-5 flex items-center gap-4">
          <div className="bg-red-100 p-3 rounded-xl">
            <XCircle size={24} className="text-red-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">{rupture.length}</p>
            <p className="text-sm text-red-500 font-medium">Rupture de stock</p>
            <p className="text-xs text-red-400">Quantité = 0</p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-5 flex items-center gap-4">
          <div className="bg-yellow-100 p-3 rounded-xl">
            <AlertTriangle size={24} className="text-yellow-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-600">{faible.length}</p>
            <p className="text-sm text-yellow-600 font-medium">Stock faible</p>
            <p className="text-xs text-yellow-500">Quantité ≤ seuil minimum</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-xl">
            <FileText size={24} className="text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">{commandes.length}</p>
            <p className="text-sm text-blue-600 font-medium">Commandes en attente</p>
            <p className="text-xs text-blue-500">Brouillon ou commandé</p>
          </div>
        </div>
      </div>

      {/* Tableau rupture */}
      {rupture.length > 0 && (
        <div className="mb-6">
          <h2 className="text-base font-semibold text-red-600 mb-3 flex items-center gap-2">
            <XCircle size={18} /> Produits en rupture ({rupture.length})
          </h2>
          <div className="bg-white rounded-xl border border-red-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-red-50 border-b border-red-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-red-500 uppercase">Produit</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-red-500 uppercase">Catégorie</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-red-500 uppercase">Stock actuel</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-red-500 uppercase">Seuil min</th>
                  {canManageStock && (
                    <th className="text-left px-6 py-3 text-xs font-medium text-red-500 uppercase">Action</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-red-50">
                {rupture.map(p => <ProductRow key={p.id} product={p} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tableau faible */}
      {faible.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-yellow-600 mb-3 flex items-center gap-2">
            <AlertTriangle size={18} /> Stock faible ({faible.length})
          </h2>
          <div className="bg-white rounded-xl border border-yellow-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-yellow-50 border-b border-yellow-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-yellow-600 uppercase">Produit</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-yellow-600 uppercase">Catégorie</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-yellow-600 uppercase">Stock actuel</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-yellow-600 uppercase">Seuil min</th>
                  {canManageStock && (
                    <th className="text-left px-6 py-3 text-xs font-medium text-yellow-600 uppercase">Action</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-yellow-50">
                {faible.map(p => <ProductRow key={p.id} product={p} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tableau commandes en attente */}
      {commandes.length > 0 && (
        <div className="mb-6">
          <h2 className="text-base font-semibold text-blue-600 mb-3 flex items-center gap-2">
            <FileText size={18} /> Commandes en attente ({commandes.length})
          </h2>
          <div className="bg-white rounded-xl border border-blue-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-blue-50 border-b border-blue-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-blue-600 uppercase">N°</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-blue-600 uppercase">Fournisseur</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-blue-600 uppercase">Statut</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-blue-600 uppercase">Total</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-blue-600 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50">
                {commandes.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">#{c.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{c.supplier?.name || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        c.status === 'brouillon' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {c.status === 'brouillon' ? 'Brouillon' : 'Commandé'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{Number(c.total).toLocaleString()} FCFA</td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(c.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {rupture.length === 0 && faible.length === 0 && commandes.length === 0 && (
        <div className="bg-green-50 border border-green-100 rounded-xl p-10 text-center">
          <p className="text-green-600 font-medium">Tous les stocks sont en bonne santé !</p>
          <p className="text-green-400 text-sm mt-1">Aucune alerte pour le moment.</p>
        </div>
      )}
    </AppLayout>
  )
}
