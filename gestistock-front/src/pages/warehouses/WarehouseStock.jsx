import { useEffect, useState } from 'react'
import AppLayout from '../../components/layouts/AppLayout'
import { warehouseStockService } from '../../api/warehouseStockService'
import { warehouseService } from '../../api/warehouseService'
import { locationService } from '../../api/locationService'
import { productService } from '../../api/productService'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Search, Package, Plus, Trash2, X } from 'lucide-react'

export default function WarehouseStock() {
  const { user: currentUser } = useAuth()
  const [stocks, setStocks] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [locations, setLocations] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterWarehouse, setFilterWarehouse] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [pagination, setPagination] = useState({})
  const canManage = ['admin', 'gestionnaire'].includes(currentUser?.role)
  const [form, setForm] = useState({ product_id: '', warehouse_id: '', location_id: '', quantity: 1 })

  const fetchStocks = async (page = 1) => {
    try {
      setLoading(true)
      const params = { page }
      if (filterWarehouse) params.warehouse_id = filterWarehouse
      const res = await warehouseStockService.getAll(params)
      setStocks(res.data.data)
      setPagination(res.data)
    } catch { toast.error('Erreur chargement') } finally { setLoading(false) }
  }

  useEffect(() => {
    warehouseService.getAll().then(res => setWarehouses(res.data))
    productService.getAll({ per_page: 200 }).then(res => setProducts(res.data.data))
  }, [])

  useEffect(() => {
    if (filterWarehouse) locationService.getAll({ warehouse_id: filterWarehouse }).then(res => setLocations(res.data))
    else setLocations([])
  }, [filterWarehouse])

  useEffect(() => { fetchStocks() }, [filterWarehouse])

  const openCreate = () => {
    setForm({ product_id: '', warehouse_id: filterWarehouse || '', location_id: '', quantity: 1 })
    setShowModal(true)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await warehouseStockService.store(form)
      toast.success('Stock ajouté')
      setShowModal(false)
      fetchStocks()
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur') } finally { setSubmitting(false) }
  }

  const handleDelete = async id => {
    if (!confirm('Supprimer cette ligne de stock ?')) return
    try {
      await warehouseStockService.delete(id)
      toast.success('Stock supprimé')
      fetchStocks()
    } catch { toast.error('Erreur') }
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Stock par entrepôt</h1>
          <p className="text-sm text-gray-500 mt-1">{pagination.total || 0} ligne(s)</p>
        </div>
        {canManage && (
          <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium">
            <Plus size={16} /> Ajouter du stock
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
        <select className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filterWarehouse} onChange={e => setFilterWarehouse(e.target.value)}>
          <option value="">Tous les entrepôts</option>
          {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : stocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Package size={40} className="mb-3" /><p className="text-sm">Aucun stock</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Produit</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Entrepôt</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Emplacement</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Quantité</th>
                {canManage && <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stocks.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{s.product?.name}</td>
                  <td className="px-6 py-4 text-gray-600">{s.warehouse?.name}</td>
                  <td className="px-6 py-4 text-gray-500">{s.location?.name || '—'}</td>
                  <td className="px-6 py-4 font-medium">{s.quantity}</td>
                  {canManage && (
                    <td className="px-6 py-4">
                      <button onClick={() => handleDelete(s.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  )}
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
                <button key={p} onClick={() => fetchStocks(p)}
                  className={`w-8 h-8 rounded-lg text-sm ${p === pagination.current_page ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{p}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">Ajouter du stock</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Produit *</label>
                <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={form.product_id} onChange={e => setForm(f => ({ ...f, product_id: e.target.value }))} required>
                  <option value="">Sélectionner</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.reference})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entrepôt *</label>
                <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={form.warehouse_id} onChange={e => setForm(f => ({ ...f, warehouse_id: e.target.value, location_id: '' }))} required>
                  <option value="">Sélectionner</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emplacement</label>
                <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={form.location_id}
                  onChange={e => setForm(f => ({ ...f, location_id: e.target.value }))}>
                  <option value="">Aucun</option>
                  {locations.filter(l => l.warehouse_id == form.warehouse_id).map(l => (
                    <option key={l.id} value={l.id}>{l.code} - {l.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantité *</label>
                <input type="number" min="0" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} required />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50">Annuler</button>
                <button type="submit" disabled={submitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium">
                  {submitting ? '...' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
