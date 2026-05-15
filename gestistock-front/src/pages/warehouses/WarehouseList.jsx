import { useEffect, useState } from 'react'
import AppLayout from '../../components/layouts/AppLayout'
import { warehouseService } from '../../api/warehouseService'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Building2, Edit, MapPin, Phone, Plus, Trash2, UserRound, X } from 'lucide-react'

const emptyForm = {
  name: '',
  code: '',
  address: '',
  manager_name: '',
  phone: '',
  active: true,
}

export default function WarehouseList() {
  const { user: currentUser } = useAuth()
  const [warehouses, setWarehouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const canManageStock = ['admin', 'gestionnaire'].includes(currentUser?.role)

  const fetchWarehouses = async () => {
    try {
      setLoading(true)
      const res = await warehouseService.getAll()
      setWarehouses(res.data)
    } catch {
      toast.error('Erreur lors du chargement des entrepôts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchWarehouses() }, [])

  const openCreate = () => {
    if (!canManageStock) return
    setEditing(null)
    setForm(emptyForm)
    setErrors({})
    setShowModal(true)
  }

  const openEdit = warehouse => {
    if (!canManageStock) return
    setEditing(warehouse)
    setForm({
      name: warehouse.name || '',
      code: warehouse.code || '',
      address: warehouse.address || '',
      manager_name: warehouse.manager_name || '',
      phone: warehouse.phone || '',
      active: Boolean(warehouse.active),
    })
    setErrors({})
    setShowModal(true)
  }

  const updateForm = (key, value) => {
    setForm(current => ({ ...current, [key]: value }))
    setErrors(current => ({ ...current, [key]: null }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!canManageStock) return
    setSubmitting(true)
    try {
      if (editing) {
        await warehouseService.update(editing.id, form)
        toast.success('Entrepôt mis à jour')
      } else {
        await warehouseService.create(form)
        toast.success('Entrepôt créé')
      }
      setShowModal(false)
      fetchWarehouses()
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
    if (!confirm('Supprimer cet entrepôt ?')) return
    try {
      await warehouseService.delete(id)
      toast.success('Entrepôt supprimé')
      fetchWarehouses()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la suppression')
    }
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Entrepôts</h1>
          <p className="text-sm text-gray-500 mt-1">{warehouses.length} entrepôt(s)</p>
        </div>
        {canManageStock && (
          <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} />
            Nouvel entrepôt
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : warehouses.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 flex flex-col items-center justify-center py-20 text-gray-400">
          <Building2 size={40} className="mb-3" />
          <p className="text-sm">Aucun entrepôt enregistré</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {warehouses.map(warehouse => (
            <div key={warehouse.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-2.5 rounded-lg">
                    <Building2 size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">{warehouse.name}</h2>
                    <p className="text-xs text-gray-400">{warehouse.code}</p>
                  </div>
                </div>
                {canManageStock && (
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(warehouse)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit size={15} />
                    </button>
                    <button onClick={() => handleDelete(warehouse.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-2 text-sm text-gray-500">
                <p className="flex items-start gap-2"><MapPin size={15} className="mt-0.5" /> {warehouse.address || 'Adresse non renseignée'}</p>
                <p className="flex items-center gap-2"><UserRound size={15} /> {warehouse.manager_name || 'Responsable non renseigné'}</p>
                <p className="flex items-center gap-2"><Phone size={15} /> {warehouse.phone || 'Téléphone non renseigné'}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-50">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${warehouse.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {warehouse.active ? 'Actif' : 'Inactif'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">{editing ? 'Modifier l’entrepôt' : 'Nouvel entrepôt'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" value={form.name} onChange={e => updateForm('name', e.target.value)} required />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                <input className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm uppercase" value={form.code} onChange={e => updateForm('code', e.target.value.toUpperCase())} required />
                {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code[0]}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
                <input className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" value={form.manager_name} onChange={e => updateForm('manager_name', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" value={form.phone} onChange={e => updateForm('phone', e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                <textarea rows={3} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" value={form.address} onChange={e => updateForm('address', e.target.value)} />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" checked={form.active} onChange={e => updateForm('active', e.target.checked)} />
                Entrepôt actif
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
