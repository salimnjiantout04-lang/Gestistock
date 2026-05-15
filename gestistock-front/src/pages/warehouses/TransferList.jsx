import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AppLayout from '../../components/layouts/AppLayout'
import { transferService } from '../../api/transferService'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Plus, Eye, XCircle, ArrowRightLeft } from 'lucide-react'

const statusConfig = {
  brouillon: { label: 'Brouillon', class: 'bg-gray-100 text-gray-600' },
  valide:    { label: 'Validé',    class: 'bg-green-100 text-green-700' },
  annule:    { label: 'Annulé',    class: 'bg-red-100 text-red-700' },
}

export default function TransferList() {
  const { user: currentUser } = useAuth()
  const [transfers, setTransfers] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({})
  const [filterStatus, setFilterStatus] = useState('')
  const canManage = ['admin', 'gestionnaire'].includes(currentUser?.role)

  const fetchTransfers = async (page = 1) => {
    try {
      setLoading(true)
      const params = { page }
      if (filterStatus) params.status = filterStatus
      const res = await transferService.getAll(params)
      setTransfers(res.data.data)
      setPagination(res.data)
    } catch { toast.error('Erreur') } finally { setLoading(false) }
  }

  useEffect(() => { fetchTransfers() }, [filterStatus])

  const handleCancel = async id => {
    if (!confirm('Annuler ce transfert ?')) return
    try {
      await transferService.cancel(id)
      toast.success('Transfert annulé')
      fetchTransfers()
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur') }
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Transferts entre entrepôts</h1>
          <p className="text-sm text-gray-500 mt-1">{pagination.total || 0} transfert(s)</p>
        </div>
        {canManage && (
          <Link to="/transfers/create" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium">
            <Plus size={16} /> Nouveau transfert
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
        <select className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Tous les statuts</option>
          <option value="brouillon">Brouillon</option>
          <option value="valide">Validé</option>
          <option value="annule">Annulé</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : transfers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <ArrowRightLeft size={40} className="mb-3" /><p className="text-sm">Aucun transfert</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Réf.</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">De</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Vers</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transfers.map(t => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{t.reference}</td>
                  <td className="px-6 py-4 text-gray-600">{t.from_warehouse?.name}</td>
                  <td className="px-6 py-4 text-gray-600">{t.to_warehouse?.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[t.status]?.class}`}>
                      {statusConfig[t.status]?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs">
                    {new Date(t.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link to={`/transfers/${t.id}`} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Détails">
                        <Eye size={16} />
                      </Link>
                      {t.status === 'brouillon' && canManage && (
                        <button onClick={() => handleCancel(t.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Annuler">
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
              {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => fetchTransfers(p)}
                  className={`w-8 h-8 rounded-lg text-sm ${p === pagination.current_page ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{p}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
