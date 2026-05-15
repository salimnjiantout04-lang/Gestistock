import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import AppLayout from '../../components/layouts/AppLayout'
import { purchaseOrderService } from '../../api/purchaseOrderService'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { exportPurchaseOrderPDF } from '../../utils/pdfDocuments'
import { ArrowLeft, Edit, Send, CheckCircle, XCircle, Package, Truck, UserRound, Calendar, FileDown } from 'lucide-react'

const statusConfig = {
  brouillon:  { label: 'Brouillon',  class: 'bg-gray-100 text-gray-600', icon: Package },
  commande:   { label: 'Commandé',   class: 'bg-blue-100 text-blue-700', icon: Send },
  recu:       { label: 'Reçu',       class: 'bg-green-100 text-green-700', icon: CheckCircle },
  annule:     { label: 'Annulé',     class: 'bg-red-100 text-red-700', icon: XCircle },
}

export default function PurchaseOrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const canManage = ['admin', 'gestionnaire'].includes(currentUser?.role)

  useEffect(() => {
    purchaseOrderService.getOne(id)
      .then(res => setOrder(res.data))
      .catch(() => toast.error('Erreur chargement'))
      .finally(() => setLoading(false))
  }, [id])

  const handleAction = async (action, successMsg) => {
    if (!confirm(`Confirmer cette action ?`)) return
    setActionLoading(true)
    try {
      const fn = {
        order: purchaseOrderService.markOrdered,
        receive: purchaseOrderService.markReceived,
        cancel: purchaseOrderService.cancel,
      }
      const res = await fn[action](id)
      setOrder(res.data)
      toast.success(successMsg)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    )
  }

  if (!order) {
    return (
      <AppLayout>
        <div className="text-center py-20 text-gray-400">
          <p>Bon de commande introuvable</p>
          <button onClick={() => navigate('/purchases')} className="text-blue-600 mt-2">Retour</button>
        </div>
      </AppLayout>
    )
  }

  const StatusIcon = statusConfig[order.status]?.icon

  return (
    <AppLayout>
      <div className="mb-6">
        <button onClick={() => navigate('/purchases')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-2 transition-colors">
          <ArrowLeft size={16} />
          Retour aux bons de commande
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{order.reference}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusConfig[order.status]?.class}`}>
                <StatusIcon size={14} />
                {statusConfig[order.status]?.label}
              </span>
            </div>
          </div>

          {/* Actions buttons */}
          <div className="flex items-center gap-2">
            <button onClick={() => exportPurchaseOrderPDF(order)}
              className="flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors">
              <FileDown size={16} /> PDF
            </button>
            {order.status === 'brouillon' && canManage && (
              <>
                <Link to={`/purchases/${order.id}/edit`}
                  className="flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                  <Edit size={16} /> Modifier
                </Link>
                <button onClick={() => handleAction('order', 'Bon commandé avec succès')}
                  disabled={actionLoading}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
                  <Send size={16} /> {actionLoading ? '...' : 'Marquer commandé'}
                </button>
              </>
            )}
            {order.status === 'commande' && canManage && (
              <button onClick={() => handleAction('receive', 'Marchandises reçues ! Stock mis à jour')}
                disabled={actionLoading}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
                <CheckCircle size={16} /> {actionLoading ? '...' : 'Réceptionner'}
              </button>
            )}
            {in_array(order.status, ['brouillon', 'commande']) && canManage && (
              <button onClick={() => handleAction('cancel', 'Bon annulé')}
                disabled={actionLoading}
                className="flex items-center gap-2 border border-red-200 text-red-600 px-4 py-2.5 rounded-lg text-sm hover:bg-red-50 transition-colors">
                <XCircle size={16} /> Annuler
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
            <Truck size={15} /> Fournisseur
          </h3>
          <p className="font-semibold text-gray-900">{order.supplier?.name}</p>
          {order.supplier?.contact_name && (
            <p className="text-sm text-gray-500 mt-1">Contact: {order.supplier.contact_name}</p>
          )}
          {order.supplier?.email && (
            <p className="text-sm text-gray-500">{order.supplier.email}</p>
          )}
          {order.supplier?.phone && (
            <p className="text-sm text-gray-500">{order.supplier.phone}</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
            <UserRound size={15} /> Créé par
          </h3>
          <p className="font-semibold text-gray-900">{order.user?.name}</p>
          <p className="text-sm text-gray-500 capitalize mt-1">Rôle: {order.user?.role}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
            <Calendar size={15} /> Dates
          </h3>
          <p className="text-sm text-gray-700">Création: {formatDate(order.created_at)}</p>
          {order.ordered_at && <p className="text-sm text-gray-700">Commandé: {formatDate(order.ordered_at)}</p>}
          {order.received_at && <p className="text-sm text-gray-700">Reçu: {formatDate(order.received_at)}</p>}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Détail des articles</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Produit</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Référence</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Quantité</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Prix unitaire</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Sous-total</th>
              {order.status === 'recu' && (
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Reçu</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {order.items.map((item, i) => (
              <tr key={item.id || i}>
                <td className="px-6 py-4 font-medium text-gray-900">{item.product?.name}</td>
                <td className="px-6 py-4 text-gray-500">{item.product?.reference}</td>
                <td className="px-6 py-4 text-gray-900">{item.quantity} {item.product?.unit}</td>
                <td className="px-6 py-4 text-gray-600">{Number(item.unit_price).toLocaleString()} FCFA</td>
                <td className="px-6 py-4 font-medium text-gray-900">{Number(item.subtotal).toLocaleString()} FCFA</td>
                {order.status === 'recu' && (
                  <td className="px-6 py-4">
                    <span className="text-green-600 font-medium">{item.received_quantity}</span>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 border-t border-gray-100">
            <tr>
              <td colSpan={order.status === 'recu' ? 4 : 3} className="px-6 py-4 text-right font-semibold text-gray-700">Total</td>
              <td className="px-6 py-4 font-bold text-gray-900 text-lg">{Number(order.total).toLocaleString()} FCFA</td>
              {order.status === 'recu' && <td></td>}
            </tr>
          </tfoot>
        </table>
      </div>

      {order.notes && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 mt-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
          <p className="text-gray-700 text-sm">{order.notes}</p>
        </div>
      )}
    </AppLayout>
  )
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

function in_array(needle, haystack) {
  return haystack.includes(needle)
}
