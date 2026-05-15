import { useState, useEffect } from 'react'
import AppLayout from '../../components/layouts/AppLayout'
import { categoryService } from '../../api/categoryService'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Plus, Edit, Trash2, X, Tags } from 'lucide-react'

export default function CategoryList() {
  const { user: currentUser } = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [showModal, setShowModal]   = useState(false)
  const [editing, setEditing]       = useState(null)
  const [form, setForm]             = useState({ name: '', description: '' })
  const [errors, setErrors]         = useState({})
  const [submitting, setSubmitting] = useState(false)
  const canManageStock = ['admin', 'gestionnaire'].includes(currentUser?.role)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const res = await categoryService.getAll()
      setCategories(res.data)
    } catch {
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCategories() }, [])

  const openCreate = () => {
    if (!canManageStock) return
    setEditing(null)
    setForm({ name: '', description: '' })
    setErrors({})
    setShowModal(true)
  }

  const openEdit = (cat) => {
    if (!canManageStock) return
    setEditing(cat)
    setForm({ name: cat.name, description: cat.description || '' })
    setErrors({})
    setShowModal(true)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!canManageStock) return
    setSubmitting(true)
    try {
      if (editing) {
        await categoryService.update(editing.id, form)
        toast.success('Catégorie mise à jour !')
      } else {
        await categoryService.create(form)
        toast.success('Catégorie créée !')
      }
      setShowModal(false)
      fetchCategories()
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors)
      } else {
        toast.error('Erreur lors de l\'enregistrement')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!canManageStock) return
    if (!confirm('Supprimer cette catégorie ?')) return
    try {
      await categoryService.delete(id)
      toast.success('Catégorie supprimée')
      fetchCategories()
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Catégories</h1>
          <p className="text-sm text-gray-500 mt-1">{categories.length} catégorie(s)</p>
        </div>
        {canManageStock && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            Nouvelle catégorie
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 flex flex-col items-center justify-center py-20 text-gray-400">
          <Tags size={40} className="mb-3" />
          <p className="text-sm">Aucune catégorie créée</p>
          {canManageStock && (
            <button onClick={openCreate} className="mt-3 text-blue-600 text-sm hover:underline">
              Créer la première catégorie
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div key={cat.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="bg-blue-50 p-2.5 rounded-lg">
                  <Tags size={20} className="text-blue-600" />
                </div>
                {canManageStock && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(cat)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{cat.name}</h3>
              <p className="text-sm text-gray-400">
                {cat.description || 'Aucune description'}
              </p>
              <div className="mt-3 pt-3 border-t border-gray-50">
                <p className="text-xs text-gray-400">
                  Créée le {new Date(cat.created_at).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: 'long', year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">
                {editing ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Ex: Électronique"
                  value={form.name}
                  onChange={e => {
                    setForm(p => ({ ...p, name: e.target.value }))
                    setErrors(p => ({ ...p, name: null }))
                  }}
                  required
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                  placeholder="Description optionnelle..."
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
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
