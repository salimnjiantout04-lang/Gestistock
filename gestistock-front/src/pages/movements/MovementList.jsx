import { useState, useEffect } from 'react'
import AppLayout from '../../components/layouts/AppLayout'
import { movementService } from '../../api/movementService'
import { productService } from '../../api/productService'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Plus, ArrowDownCircle, ArrowUpCircle, X } from 'lucide-react'

export default function MovementList() {
  const { user: currentUser } = useAuth()
  const [movements, setMovements]   = useState([])
  const [products, setProducts]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [pagination, setPagination] = useState({})
  const [showModal, setShowModal]   = useState(false)
  const [filters, setFilters] = useState({
    product_id: '',
    type:       '',
    date_from:  '',
    date_to:    '',
  })
  const [form, setForm] = useState({
    product_id: '',
    type:       'entree',
    quantity:   '',
    reason:     '',
    note:       '',
  })
  const [submitting, setSubmitting] = useState(false)
  const canManageStock = ['admin', 'gestionnaire'].includes(currentUser?.role)

  const fetchMovements = async (page = 1) => {
    try {
      setLoading(true)
      const res = await movementService.getAll({ ...filters, page })
      setMovements(res.data.data)
      setPagination(res.data)
    } catch {
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    productService.getAll({ per_page: 100 }).then(res => setProducts(res.data.data))
  }, [])

  useEffect(() => {
    fetchMovements()
  }, [filters])

  const handleSubmit = async e => {
    e.preventDefault()
    if (!canManageStock) return
    setSubmitting(true)
    try {
      await movementService.create(form)
      toast.success('Mouvement enregistré !')
      setShowModal(false)
      setForm({ product_id: '', type: 'entree', quantity: '', reason: '', note: '' })
      fetchMovements()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'enregistrement')
    } finally {
      setSubmitting(false)
    }
  }

  const reasons = {
    entree: ['Achat fournisseur', 'Retour client', 'Ajustement inventaire', 'Don', 'Autre'],
    sortie: ['Vente', 'Consommation interne', 'Perte/Casse', 'Ajustement inventaire', 'Autre'],
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Mouvements de stock</h1>
          <p className="text-sm text-gray-500 mt-1">{pagination.total || 0} mouvement(s)</p>
        </div>
        {canManageStock && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            Nouveau mouvement
          </button>
        )}
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 flex flex-wrap gap-3">
        <select
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.product_id}
          onChange={e => setFilters(p => ({ ...p, product_id: e.target.value }))}
        >
          <option value="">Tous les produits</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.type}
          onChange={e => setFilters(p => ({ ...p, type: e.target.value }))}
        >
          <option value="">Tous les types</option>
          <option value="entree">Entrée</option>
          <option value="sortie">Sortie</option>
        </select>

        <input
          type="date"
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.date_from}
          onChange={e => setFilters(p => ({ ...p, date_from: e.target.value }))}
        />
        <input
          type="date"
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.date_to}
          onChange={e => setFilters(p => ({ ...p, date_to: e.target.value }))}
        />
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : movements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <p className="text-sm">Aucun mouvement enregistré</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Produit</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Quantité</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Avant</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Après</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Motif</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Par</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {movements.map(m => (
                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    {m.type === 'entree' ? (
                      <span className="flex items-center gap-1.5 text-green-600 font-medium">
                        <ArrowDownCircle size={16} /> Entrée
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-red-500 font-medium">
                        <ArrowUpCircle size={16} /> Sortie
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{m.product?.name}</td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${m.type === 'entree' ? 'text-green-600' : 'text-red-500'}`}>
                      {m.type === 'entree' ? '+' : '-'}{m.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{m.quantity_before}</td>
                  <td className="px-6 py-4 text-gray-900 font-medium">{m.quantity_after}</td>
                  <td className="px-6 py-4 text-gray-500">{m.reason || '—'}</td>
                  <td className="px-6 py-4 text-gray-500">{m.user?.name}</td>
                  <td className="px-6 py-4 text-gray-400 text-xs">
                    {new Date(m.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
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
                <button
                  key={page}
                  onClick={() => fetchMovements(page)}
                  className={`w-8 h-8 rounded-lg text-sm transition-colors ${
                    page === pagination.current_page ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal nouveau mouvement */}
      {canManageStock && showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">Nouveau mouvement</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Produit *</label>
                <select
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={form.product_id}
                  onChange={e => setForm(p => ({ ...p, product_id: e.target.value }))}
                  required
                >
                  <option value="">Sélectionner un produit</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (stock: {p.quantity})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm(p => ({ ...p, type: 'entree', reason: '' }))}
                    className={`py-2.5 rounded-lg text-sm font-medium border transition-colors flex items-center justify-center gap-2 ${
                      form.type === 'entree'
                        ? 'bg-green-50 border-green-500 text-green-700'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <ArrowDownCircle size={16} /> Entrée
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(p => ({ ...p, type: 'sortie', reason: '' }))}
                    className={`py-2.5 rounded-lg text-sm font-medium border transition-colors flex items-center justify-center gap-2 ${
                      form.type === 'sortie'
                        ? 'bg-red-50 border-red-500 text-red-600'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <ArrowUpCircle size={16} /> Sortie
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantité *</label>
                <input
                  type="number"
                  min="1"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={form.quantity}
                  onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motif</label>
                <select
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={form.reason}
                  onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
                >
                  <option value="">Sélectionner un motif</option>
                  {reasons[form.type].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                <textarea
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                  value={form.note}
                  onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
                  placeholder="Note optionnelle..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  {submitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
