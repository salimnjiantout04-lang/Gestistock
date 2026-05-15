import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layouts/AppLayout'
import { transferService } from '../../api/transferService'
import { warehouseService } from '../../api/warehouseService'
import { productService } from '../../api/productService'
import toast from 'react-hot-toast'
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react'

export default function TransferForm() {
  const navigate = useNavigate()
  const [warehouses, setWarehouses] = useState([])
  const [products, setProducts] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    from_warehouse_id: '',
    to_warehouse_id: '',
    notes: '',
    items: [{ product_id: '', quantity: 1 }],
  })

  useEffect(() => {
    warehouseService.getAll().then(res => setWarehouses(res.data))
    productService.getAll({ per_page: 200 }).then(res => setProducts(res.data.data))
  }, [])

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { product_id: '', quantity: 1 }] }))

  const removeItem = (index) => {
    if (form.items.length <= 1) return
    setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== index) }))
  }

  const updateItem = (index, key, value) => {
    setForm(f => {
      const items = [...f.items]
      items[index] = { ...items[index], [key]: value }
      return { ...f, items }
    })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.from_warehouse_id || !form.to_warehouse_id) {
      toast.error('Veuillez sélectionner les deux entrepôts')
      return
    }
    if (form.from_warehouse_id === form.to_warehouse_id) {
      toast.error('Les entrepôts doivent être différents')
      return
    }
    if (form.items.some(i => !i.product_id)) {
      toast.error('Veuillez sélectionner un produit pour chaque ligne')
      return
    }
    setSubmitting(true)
    try {
      await transferService.create(form)
      toast.success('Transfert créé')
      navigate('/transfers')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur')
    } finally { setSubmitting(false) }
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <button onClick={() => navigate('/transfers')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-2">
            <ArrowLeft size={16} /> Retour
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">Nouveau transfert</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Entrepôts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">De l'entrepôt *</label>
              <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={form.from_warehouse_id} onChange={e => setForm(f => ({ ...f, from_warehouse_id: e.target.value }))} required>
                <option value="">Sélectionner</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vers l'entrepôt *</label>
              <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={form.to_warehouse_id} onChange={e => setForm(f => ({ ...f, to_warehouse_id: e.target.value }))} required>
                <option value="">Sélectionner</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea rows={2} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Produits à transférer</h2>
            <button type="button" onClick={addItem}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
              <Plus size={16} /> Ajouter
            </button>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Produit</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase w-32">Quantité</th>
                <th className="w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {form.items.map((item, i) => (
                <tr key={i}>
                  <td className="px-6 py-3">
                    <select className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      value={item.product_id} onChange={e => updateItem(i, 'product_id', e.target.value)} required>
                      <option value="">Sélectionner</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.reference}) - Stock: {p.quantity}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-3">
                    <input type="number" min="1" className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} required />
                  </td>
                  <td className="px-6 py-3">
                    {form.items.length > 1 && (
                      <button type="button" onClick={() => removeItem(i)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/transfers')}
            className="border border-gray-200 text-gray-600 py-2.5 px-6 rounded-lg text-sm hover:bg-gray-50">Annuler</button>
          <button type="submit" disabled={submitting}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 px-6 rounded-lg text-sm font-medium">
            <Save size={16} /> {submitting ? '...' : 'Créer le transfert'}
          </button>
        </div>
      </form>
    </AppLayout>
  )
}
