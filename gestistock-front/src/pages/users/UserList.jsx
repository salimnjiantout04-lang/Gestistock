import { useState, useEffect } from 'react'
import AppLayout from '../../components/layouts/AppLayout'
import { userService } from '../../api/userService'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Plus, Edit, Trash2, X, Users, Shield, Eye } from 'lucide-react'

const roleConfig = {
  admin:        { label: 'Admin',        class: 'bg-blue-100 text-blue-700', icon: Shield },
  gestionnaire: { label: 'Gestionnaire', class: 'bg-blue-100 text-blue-700',     icon: Users  },
  lecteur:      { label: 'Lecteur',      class: 'bg-gray-100 text-gray-600',     icon: Eye    },
}

export default function UserList() {
  const { user: currentUser } = useAuth()
  const [users, setUsers]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]     = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors]       = useState({})
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'gestionnaire'
  })

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await userService.getAll()
      setUsers(res.data)
    } catch {
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', email: '', password: '', role: 'gestionnaire' })
    setErrors({})
    setShowModal(true)
  }

  const openEdit = (u) => {
    setEditing(u)
    setForm({ name: u.name, email: u.email, password: '', role: u.role })
    setErrors({})
    setShowModal(true)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editing) {
        const data = { name: form.name, email: form.email, role: form.role }
        await userService.update(editing.id, data)
        toast.success('Utilisateur mis à jour !')
      } else {
        await userService.create(form)
        toast.success('Utilisateur créé !')
      }
      setShowModal(false)
      fetchUsers()
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors)
      } else {
        toast.error(err.response?.data?.message || 'Erreur')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet utilisateur ?')) return
    try {
      await userService.delete(id)
      toast.success('Utilisateur supprimé')
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur')
    }
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Utilisateurs</h1>
          <p className="text-sm text-gray-500 mt-1">{users.length} utilisateur(s)</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Nouvel utilisateur
        </button>
      </div>

      {/* Cards stats rôles */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {Object.entries(roleConfig).map(([role, config]) => {
          const Icon = config.icon
          const count = users.filter(u => u.role === role).length
          return (
            <div key={role} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${config.class}`}>
                <Icon size={18} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{count}</p>
                <p className="text-xs text-gray-500">{config.label}(s)</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Rôle</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Membre depuis</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(u => {
                const config = roleConfig[u.role]
                const Icon = config.icon
                return (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm flex-shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{u.name}</p>
                          {u.id === currentUser?.id && (
                            <p className="text-xs text-blue-500">Vous</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-medium ${config.class}`}>
                        <Icon size={12} />
                        {config.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {new Date(u.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit', month: 'long', year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(u)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={15} />
                        </button>
                        {u.id !== currentUser?.id && (
                          <button
                            onClick={() => handleDelete(u.id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">
                {editing ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
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
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  required
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  required
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>}
              </div>

              {!editing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    required
                    minLength={8}
                  />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password[0]}</p>}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle *</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(roleConfig).map(([role, config]) => {
                    const Icon = config.icon
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setForm(p => ({ ...p, role }))}
                        className={`py-2.5 px-3 rounded-lg text-xs font-medium border transition-colors flex flex-col items-center gap-1 ${
                          form.role === role
                            ? `${config.class} border-current`
                            : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <Icon size={16} />
                        {config.label}
                      </button>
                    )
                  })}
                </div>
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