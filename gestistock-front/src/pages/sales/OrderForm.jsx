import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppLayout from '../../components/layouts/AppLayout'
import { orderService } from '../../api/orderService'
import { productService } from '../../api/productService'
import toast from 'react-hot-toast'
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react'

export default function OrderForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)

  const [products, setProducts] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
    notes: '',
    items: [{ product_id: '', quantity: 1, unit_price: 0 }],
  })

  useEffect(() => {
    productService.getAll({ per_page: 200 }).then(res => setProducts(res.data.data))
  }, [])

  useEffect(() => {
    if (isEditing) {
      orderService.getOne(id).then(res => {
        const order = res.data
        setForm({
          customer_name: order.customer_name,
          customer_email: order.customer_email || '',
          customer_phone: order.customer_phone || '',
          customer_address: order.customer_address || '',
          notes: order.notes || '',
          items: order.items.map(i => ({
            product_id: i.product_id,
            quantity: i.quantity,
            unit_price: Number(i.unit_price),
          })),
        })
      }).catch(() => {
        toast.error('Erreur chargement commande')
        navigate('/sales')
      })
    }
  }, [id])

  const addItem = () => {
    setForm(f => ({ ...f, items: [...f.items, { product_id: '', quantity: 1, unit_price: 0 }] }))
  }

  const removeItem = (index) => {
    if (form.items.length <= 1) return
    setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== index) }))
  }

  const updateItem = (index, key, value) => {
    setForm(f => {
      const items = [...f.items]
      items[index] = { ...items[index], [key]: value }
      if (key === 'product_id') {
        const product = products.find(p => p.id === Number(value))
        if (product) items[index].unit_price = Number(product.price) || 0
      }
      return { ...f, items }
    })
  }

  const total = form.items.reduce((sum, item) =>
    sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0), 0
  )

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.customer_name.trim()) { toast.error('Veuillez saisir le nom du client'); return }
    if (form.items.some(i => !i.product_id)) { toast.error('Veuillez sélectionner un produit pour chaque ligne'); return }
    setSubmitting(true)
    try {
      if (isEditing) {
        await orderService.update(id, form)
        toast.success('Commande mise à jour')
      } else {
        await orderService.create(form)
        toast.success('Commande créée avec succès')
      }
      navigate('/sales')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'enregistrement')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <button onClick={() => navigate('/sales')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-2 transition-colors">
            <ArrowLeft size={16} /> Retour
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">
            {isEditing ? 'Modifier la commande' : 'Nouvelle commande client'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Client</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={form.customer_email} onChange={e => setForm(f => ({ ...f, customer_email: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={form.customer_phone} onChange={e => setForm(f => ({ ...f, customer_phone: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
              <textarea rows={2} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                value={form.customer_address} onChange={e => setForm(f => ({ ...f, customer_address: e.target.value }))} />
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
            <h2 className="text-lg font-semibold text-gray-900">Articles</h2>
            <button type="button" onClick={addItem}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
              <Plus size={16} /> Ajouter un produit
            </button>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Produit</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase w-32">Quantité</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase w-40">Prix unitaire</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase w-40">Sous-total</th>
                <th className="w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {form.items.map((item, index) => {
                const subtotal = (Number(item.quantity) || 0) * (Number(item.unit_price) || 0)
                return (
                  <tr key={index}>
                    <td className="px-6 py-3">
                      <select className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        value={item.product_id} onChange={e => updateItem(index, 'product_id', e.target.value)} required>
                        <option value="">Sélectionner</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.reference}) - Stock: {p.quantity}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-3">
                      <input type="number" min="1"
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        value={item.quantity} onChange={e => updateItem(index, 'quantity', e.target.value)} required />
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-1">
                        <input type="number" min="0" step="0.01"
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          value={item.unit_price} onChange={e => updateItem(index, 'unit_price', e.target.value)} required />
                        <span className="text-gray-400 text-xs whitespace-nowrap">FCFA</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 font-medium text-gray-900">{subtotal.toLocaleString()} FCFA</td>
                    <td className="px-6 py-3">
                      {form.items.length > 1 && (
                        <button type="button" onClick={() => removeItem(index)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot className="bg-gray-50 border-t border-gray-100">
              <tr>
                <td colSpan={3} className="px-6 py-4 text-right font-semibold text-gray-700">Total</td>
                <td className="px-6 py-4 font-bold text-gray-900">{total.toLocaleString()} FCFA</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/sales')}
            className="border border-gray-200 text-gray-600 py-2.5 px-6 rounded-lg text-sm hover:bg-gray-50">
            Annuler
          </button>
          <button type="submit" disabled={submitting}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 px-6 rounded-lg text-sm font-medium">
            <Save size={16} />
            {submitting ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Créer la commande'}
          </button>
        </div>
      </form>
    </AppLayout>
  )
}
