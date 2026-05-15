import { useEffect, useState } from 'react'
import AppLayout from '../../components/layouts/AppLayout'
import { supplierService } from '../../api/supplierService'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Edit, Mail, Phone, Plus, Trash2, Truck, X } from 'lucide-react'

const emptyForm = {
  name: '',
  contact_name: '',
  email: '',
  phone: '',
  address: '',
  notes: '',
  active: true,
}

export default function SupplierList() {
  const { user: currentUser } = useAuth()
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const canManageStock = ['admin', 'gestionnaire'].includes(currentUser?.role)

  const fetchSuppliers = async () => {
    try {
      setLoading(true)
      const res = await supplierService.getAll()
      setSuppliers(res.data)
    } catch {
      toast.error('Erreur lors du chargement des fournisseurs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSuppliers() }, [])

  const openCreate = () => {
    if (!canManageStock) return
    setEditing(null)
    setForm(emptyForm)
    setErrors({})
    setShowModal(true)
  }

  const openEdit = supplier => {
    if (!canManageStock) return
    setEditing(supplier)
    setForm({
      name: supplier.name || '',
      contact_name: supplier.contact_name || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      notes: supplier.notes || '',
      active: Boolean(supplier.active),
    })
    setErrors({})
    setShowModal(true)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!canManageStock) return
    setSubmitting(true)
    try {
      if (editing) {
        await supplierService.update(editing.id, form)
        toast.success('Fournisseur mis à jour')
      } else {
        await supplierService.create(form)
        toast.success('Fournisseur créé')
      }
      setShowModal(false)
      fetchSuppliers()
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors)
      } else {
        toast.error(err.response?.data?.message || 'Erreur lors de l’enregistrement')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async id => {
    if (!canManageStock) return
    if (!confirm('Supprimer ce fournisseur ?')) return
    try {
      await supplierService.delete(id)
      toast.success('Fournisseur supprimé')
      fetchSuppliers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la suppression')
    }
  }

  const updateForm = (key, value) => {
    setForm(current => ({ ...current, [key]: value }))
    setErrors(current => ({ ...current, [key]: null }))
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Fournisseurs</h1>
          <p className="text-sm text-gray-500 mt-1">{suppliers.length} fournisseur(s)</p>
        </div>
        {canManageStock && (
          <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} />
            Nouveau fournisseur
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : suppliers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 flex flex-col items-center justify-center py-20 text-gray-400">
          <Truck size={40} className="mb-3" />
          <p className="text-sm">Aucun fournisseur enregistré</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Fournisseur</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Produits</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Statut</th>
                {canManageStock && <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {suppliers.map(supplier => (
                <tr key={supplier.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{supplier.name}</p>
                    <p className="text-xs text-gray-400">{supplier.address || 'Adresse non renseignée'}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <p>{supplier.contact_name || '—'}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1"><Mail size={12} /> {supplier.email || '—'}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1"><Phone size={12} /> {supplier.phone || '—'}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{supplier.products_count || 0}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${supplier.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {supplier.active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  {canManageStock && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(supplier)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(supplier.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">{editing ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" value={form.name} onChange={e => updateForm('name', e.target.value)} required />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                <input className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" value={form.contact_name} onChange={e => updateForm('contact_name', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" value={form.email} onChange={e => updateForm('email', e.target.value)} />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" value={form.phone} onChange={e => updateForm('phone', e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                <textarea rows={2} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" value={form.address} onChange={e => updateForm('address', e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea rows={2} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" value={form.notes} onChange={e => updateForm('notes', e.target.value)} />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" checked={form.active} onChange={e => updateForm('active', e.target.checked)} />
                Fournisseur actif
              </label>
              <div className="md:col-span-2 flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors">Annuler</button>
                <button type="submit" disabled={submitting} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
                  {submitting ? 'Enregistrement...' : editing ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
