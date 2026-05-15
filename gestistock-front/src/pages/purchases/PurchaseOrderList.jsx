import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AppLayout from '../../components/layouts/AppLayout'
import { purchaseOrderService } from '../../api/purchaseOrderService'
import { supplierService } from '../../api/supplierService'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Plus, Eye, Truck, XCircle, Search, FileText } from 'lucide-react'

const statusConfig = {
  brouillon:  { label: 'Brouillon',  class: 'bg-gray-100 text-gray-600' },
  commande:   { label: 'Commandé',   class: 'bg-blue-100 text-blue-700' },
  recu:       { label: 'Reçu',       class: 'bg-green-100 text-green-700' },
  annule:     { label: 'Annulé',     class: 'bg-red-100 text-red-700' },
}

export default function PurchaseOrderList() {
  const { user: currentUser } = useAuth()
  const [orders, setOrders] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({})
  const [filters, setFilters] = useState({ status: '', supplier_id: '' })
  const canManage = ['admin', 'gestionnaire'].includes(currentUser?.role)

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true)
      const res = await purchaseOrderService.getAll({ ...filters, page })
      setOrders(res.data.data)
      setPagination(res.data)
    } catch {
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    supplierService.getAll().then(res => setSuppliers(res.data))
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [filters])

  const handleCancel = async id => {
    if (!confirm('Annuler ce bon de commande ?')) return
    try {
      await purchaseOrderService.cancel(id)
      toast.success('Bon annulé')
      fetchOrders()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur')
    }
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Bons de commande</h1>
          <p className="text-sm text-gray-500 mt-1">{pagination.total || 0} bon(s)</p>
        </div>
        {canManage && (
          <Link to="/purchases/create" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} />
            Nouveau bon
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 flex flex-wrap gap-3">
        <select
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.status}
          onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
        >
          <option value="">Tous les statuts</option>
          <option value="brouillon">Brouillon</option>
          <option value="commande">Commandé</option>
          <option value="recu">Reçu</option>
          <option value="annule">Annulé</option>
        </select>

        <select
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.supplier_id}
          onChange={e => setFilters(f => ({ ...f, supplier_id: e.target.value }))}
        >
          <option value="">Tous les fournisseurs</option>
          {suppliers.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <FileText size={40} className="mb-3" />
            <p className="text-sm">Aucun bon de commande</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Réf.</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Fournisseur</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Créé par</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{order.reference}</td>
                  <td className="px-6 py-4 text-gray-600">{order.supplier?.name}</td>
                  <td className="px-6 py-4 text-gray-900 font-medium">
                    {Number(order.total).toLocaleString()} FCFA
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[order.status]?.class}`}>
                      {statusConfig[order.status]?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{order.user?.name}</td>
                  <td className="px-6 py-4 text-gray-400 text-xs">
                    {new Date(order.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link to={`/purchases/${order.id}`}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Voir détails">
                        <Eye size={16} />
                      </Link>
                      {order.status === 'brouillon' && canManage && (
                        <Link to={`/purchases/${order.id}/edit`}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Modifier">
                          <FileText size={16} />
                        </Link>
                      )}
                      {canManage && in_array(order.status, ['brouillon', 'commande']) && (
                        <button onClick={() => handleCancel(order.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Annuler">
                          <XCircle size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {pagination.last_page > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">Page {pagination.current_page} sur {pagination.last_page}</p>
            <div className="flex gap-2">
              {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => fetchOrders(page)}
                  className={`w-8 h-8 rounded-lg text-sm transition-colors ${
                    page === pagination.current_page ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}>
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

function in_array(needle, haystack) {
  return haystack.includes(needle)
}
