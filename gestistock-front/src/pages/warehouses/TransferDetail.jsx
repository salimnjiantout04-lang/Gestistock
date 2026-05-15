import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layouts/AppLayout'
import { transferService } from '../../api/transferService'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { ArrowLeft, CheckCircle, XCircle, ArrowRightLeft, Calendar } from 'lucide-react'

const statusConfig = {
  brouillon: { label: 'Brouillon', class: 'bg-gray-100 text-gray-600', icon: ArrowRightLeft },
  valide:    { label: 'Validé',    class: 'bg-green-100 text-green-700', icon: CheckCircle },
  annule:    { label: 'Annulé',    class: 'bg-red-100 text-red-700', icon: XCircle },
}

export default function TransferDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const [transfer, setTransfer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const canManage = ['admin', 'gestionnaire'].includes(currentUser?.role)

  useEffect(() => {
    transferService.getOne(id)
      .then(res => setTransfer(res.data))
      .catch(() => toast.error('Erreur'))
      .finally(() => setLoading(false))
  }, [id])

  const handleValidate = async () => {
    if (!confirm('Valider ce transfert ? Les stocks seront automatiquement déplacés.')) return
    setActionLoading(true)
    try {
      const res = await transferService.validate(id)
      setTransfer(res.data)
      toast.success('Transfert validé ! Stocks mis à jour')
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur') }
    finally { setActionLoading(false) }
  }

  const handleCancel = async () => {
    if (!confirm('Annuler ce transfert ?')) return
    setActionLoading(true)
    try {
      const res = await transferService.cancel(id)
      setTransfer(res.data)
      toast.success('Transfert annulé')
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur') }
    finally { setActionLoading(false) }
  }

  if (loading) return (
    <AppLayout><div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div></AppLayout>
  )

  if (!transfer) return (
    <AppLayout><div className="text-center py-20 text-gray-400"><p>Transfert introuvable</p></div></AppLayout>
  )

  const StatusIcon = statusConfig[transfer.status]?.icon

  return (
    <AppLayout>
      <div className="mb-6">
        <button onClick={() => navigate('/transfers')} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-2">
          <ArrowLeft size={16} /> Retour
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{transfer.reference}</h1>
            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium mt-2 inline-flex ${statusConfig[transfer.status]?.class}`}>
              <StatusIcon size={14} /> {statusConfig[transfer.status]?.label}
            </span>
          </div>
          <div className="flex gap-2">
            {transfer.status === 'brouillon' && canManage && (
              <>
                <button onClick={handleValidate} disabled={actionLoading}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-medium">
                  <CheckCircle size={16} /> {actionLoading ? '...' : 'Valider le transfert'}
                </button>
                <button onClick={handleCancel} disabled={actionLoading}
                  className="flex items-center gap-2 border border-red-200 text-red-600 px-4 py-2.5 rounded-lg text-sm hover:bg-red-50">
                  <XCircle size={16} /> Annuler
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Entrepôt source</h3>
          <p className="font-semibold text-gray-900">{transfer.from_warehouse?.name}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Entrepôt destination</h3>
          <p className="font-semibold text-gray-900">{transfer.to_warehouse?.name}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2"><Calendar size={15} /> Dates</h3>
          <p className="text-sm text-gray-700">Création: {new Date(transfer.created_at).toLocaleDateString('fr-FR')}</p>
          {transfer.validated_at && <p className="text-sm text-gray-700">Validé: {new Date(transfer.validated_at).toLocaleDateString('fr-FR')}</p>}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Produits transférés</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Produit</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Référence</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Quantité</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {transfer.items.map((item, i) => (
              <tr key={item.id || i}>
                <td className="px-6 py-4 font-medium text-gray-900">{item.product?.name}</td>
                <td className="px-6 py-4 text-gray-500">{item.product?.reference}</td>
                <td className="px-6 py-4 font-medium">{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {transfer.notes && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 mt-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
          <p className="text-gray-700 text-sm">{transfer.notes}</p>
        </div>
      )}
    </AppLayout>
  )
}
