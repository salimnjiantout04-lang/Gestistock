import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AppLayout from '../../components/layouts/AppLayout'
import { productService } from '../../api/productService'
import { categoryService } from '../../api/categoryService'
import { useAuth } from '../../context/AuthContext'
import { exportStockPDF } from '../../utils/exportPDF'
import { exportInventoryReportPDF } from '../../utils/pdfDocuments'
import toast from 'react-hot-toast'
import { Plus, Search, Edit, Trash2, AlertTriangle, XCircle, FileDown, FileSpreadsheet, ClipboardList } from 'lucide-react'
import { exportStockExcel } from '../../utils/exportExcel'

const statusConfig = {
  normal:  { label: 'Normal',  class: 'bg-green-100 text-green-700'   },
  faible:  { label: 'Faible',  class: 'bg-yellow-100 text-yellow-700' },
  rupture: { label: 'Rupture', class: 'bg-red-100 text-red-700'       },
}

export default function ProductList() {
  const { user: currentUser } = useAuth()
  const [products, setProducts]       = useState([])
  const [categories, setCategories]   = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [categoryId, setCategoryId]   = useState('')
  const [stockStatus, setStockStatus] = useState('')
  const [pagination, setPagination]   = useState({})
  const canManageStock = ['admin', 'gestionnaire'].includes(currentUser?.role)

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true)
      const res = await productService.getAll({
        page,
        search,
        category_id:  categoryId,
        stock_status: stockStatus,
      })
      setProducts(res.data.data)
      setPagination(res.data)
    } catch {
      toast.error('Erreur lors du chargement des produits')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    categoryService.getAll().then(res => setCategories(res.data))
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [search, categoryId, stockStatus])

  const handleDelete = async (id) => {
    if (!canManageStock) return
    if (!confirm('Supprimer ce produit ?')) return
    try {
      await productService.delete(id)
      toast.success('Produit supprimé')
      fetchProducts()
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleExport = async () => {
    try {
      const res = await productService.getAll({ per_page: 1000 })
      exportStockPDF(res.data.data)
      toast.success('PDF généré avec succès !')
    } catch {
      toast.error('Erreur lors de la génération du PDF')
    }
  }
const handleExportExcel = async () => {
  try {
    const res = await productService.getAll({ per_page: 1000 })
    exportStockExcel(res.data.data)
    toast.success('Excel généré avec succès !')
  } catch {
    toast.error('Erreur lors de la génération Excel')
  }
}
  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Produits</h1>
          <p className="text-sm text-gray-500 mt-1">{pagination.total || 0} produit(s) au total</p>
        </div>
       <div className="flex items-center gap-3">
  <button
    onClick={handleExportExcel}
    className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-600 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
  >
    <FileSpreadsheet size={16} />
    Exporter Excel
  </button>
  <button
    onClick={handleExport}
    className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-600 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
  >
    <FileDown size={16} />
    Exporter PDF
  </button>
  <button
    onClick={async () => {
      try {
        const res = await productService.getAll({ per_page: 1000 })
        exportInventoryReportPDF(res.data.data)
        toast.success('Inventaire PDF généré')
      } catch { toast.error('Erreur') }
    }}
    className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-600 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
  >
    <ClipboardList size={16} />
    Inventaire
  </button>
  {canManageStock && (
    <Link
      to="/products/create"
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
    >
      <Plus size={16} />
      Nouveau produit
    </Link>
  )}
</div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
        >
          <option value="">Toutes les catégories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={stockStatus}
          onChange={e => setStockStatus(e.target.value)}
        >
          <option value="">Tous les stocks</option>
          <option value="normal">Normal</option>
          <option value="faible">Faible</option>
          <option value="rupture">Rupture</option>
        </select>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <XCircle size={40} className="mb-3" />
            <p className="text-sm">Aucun produit trouvé</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Produit</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Référence</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Fournisseur</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Prix</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Quantité</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Statut</th>
                {canManageStock && (
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {product.image ? (
                        <img
                          src={`http://localhost:8000/storage/${product.image}`}
                          className="w-10 h-10 rounded-lg object-cover"
                          alt={product.name}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <AlertTriangle size={16} className="text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-400">{product.unit}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{product.reference}</td>
                  <td className="px-6 py-4 text-gray-600">{product.category?.name || '—'}</td>
                  <td className="px-6 py-4 text-gray-600">{product.supplier?.name || '—'}</td>
                  <td className="px-6 py-4 text-gray-600">{Number(product.price).toLocaleString()} FCFA</td>
                  <td className="px-6 py-4">
                    <span className={`font-medium ${
                      product.quantity === 0
                        ? 'text-red-600'
                        : product.quantity <= product.quantity_min
                        ? 'text-yellow-600'
                        : 'text-gray-900'
                    }`}>
                      {product.quantity} {product.unit}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[product.stock_status]?.class}`}>
                      {statusConfig[product.stock_status]?.label}
                    </span>
                  </td>
                  {canManageStock && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/products/${product.id}/edit`}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Page {pagination.current_page} sur {pagination.last_page}
            </p>
            <div className="flex gap-2">
              {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => fetchProducts(page)}
                  className={`w-8 h-8 rounded-lg text-sm transition-colors ${
                    page === pagination.current_page
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
