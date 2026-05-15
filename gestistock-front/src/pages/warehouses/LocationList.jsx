import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import AppLayout from '../../components/layouts/AppLayout'
import { locationService } from '../../api/locationService'
import { warehouseService } from '../../api/warehouseService'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Edit, Plus, Trash2, X, Layers, MapPin } from 'lucide-react'

const emptyForm = { warehouse_id: '', name: '', code: '', description: '', active: true }

export default function LocationList() {
  const { user: currentUser } = useAuth()
  const { warehouseId } = useParams()
  const [locations, setLocations] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [filterWarehouse, setFilterWarehouse] = useState(warehouseId || '')
  const canManage = ['admin', 'gestionnaire'].includes(currentUser?.role)

  const fetchLocations = async () => {
    try {
      setLoading(true)
      const params = filterWarehouse ? { warehouse_id: filterWarehouse } : {}
      const res = await locationService.getAll(params)
      setLocations(res.data)
    } catch { toast.error('Erreur chargement') } finally { setLoading(false) }
  }

  useEffect(() => { warehouseService.getAll().then(res => setWarehouses(res.data)) }, [])
  useEffect(() => { fetchLocations() }, [filterWarehouse])

  const openCreate = () => {
    setEditing(null)
    setForm({ ...emptyForm, warehouse_id: filterWarehouse || '' })
    setErrors({})
    setShowModal(true)
  }

  const openEdit = loc => {
    setEditing(loc)
    setForm({
      warehouse_id: loc.warehouse_id,
      name: loc.name, code: loc.code,
      description: loc.description || '',
      active: Boolean(loc.active),
    })
    setErrors({})
    setShowModal(true)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editing) {
        await locationService.update(editing.id, form)
        toast.success('Emplacement mis à jour')
      } else {
        await locationService.create(form)
        toast.success('Emplacement créé')
      }
      setShowModal(false)
      fetchLocations()
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors)
      else toast.error(err.response?.data?.message || 'Erreur')
    } finally { setSubmitting(false) }
  }

  const handleDelete = async id => {
    if (!confirm('Supprimer cet emplacement ?')) return
    try {
      await locationService.delete(id)
      toast.success('Emplacement supprimé')
      fetchLocations()
    } catch { toast.error('Erreur suppression') }
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Emplacements / Rayons</h1>
          <p className="text-sm text-gray-500 mt-1">{locations.length} emplacement(s)</p>
        </div>
        {canManage && (
          <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium">
            <Plus size={16} /> Nouvel emplacement
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

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : locations.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 flex flex-col items-center justify-center py-20 text-gray-400">
          <Layers size={40} className="mb-3" />
          <p className="text-sm">Aucun emplacement</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {locations.map(loc => (
            <div key={loc.id} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-2.5 rounded-lg">
                    <MapPin size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">{loc.name}</h2>
                    <p className="text-xs text-gray-400">{loc.code}</p>
                  </div>
                </div>
                {canManage && (
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(loc)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Edit size={15} />
                    </button>
                    <button onClick={() => handleDelete(loc.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500">{loc.warehouse?.name || '—'}</p>
              {loc.description && <p className="text-sm text-gray-400 mt-1">{loc.description}</p>}
              <div className="mt-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${loc.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {loc.active ? 'Actif' : 'Inactif'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">{editing ? 'Modifier' : 'Nouvel emplacement'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entrepôt *</label>
                <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={form.warehouse_id} onChange={e => setForm(f => ({ ...f, warehouse_id: e.target.value }))} required
                  disabled={editing}>
                  <option value="">Sélectionner</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                  <input className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm uppercase"
                    value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} required />
                  {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code[0]}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={2} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
                Actif
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50">Annuler</button>
                <button type="submit" disabled={submitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium">
                  {submitting ? '...' : editing ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
