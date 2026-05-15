import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import AppLayout from '../../components/layouts/AppLayout'
import { productService } from '../../api/productService'
import { categoryService } from '../../api/categoryService'
import { supplierService } from '../../api/supplierService'
import toast from 'react-hot-toast'
import { ArrowLeft, Upload } from 'lucide-react'

export default function ProductEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [suppliers, setSuppliers]   = useState([])
  const [loading, setLoading]       = useState(false)
  const [preview, setPreview]       = useState(null)
  const [form, setForm] = useState({
    name:         '',
    reference:    '',
    description:  '',
    price:        '',
    quantity:     '',
    quantity_min: '',
    unit:         'pcs',
    category_id:  '',
    supplier_id:  '',
    image:        null,
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    Promise.all([
      categoryService.getAll(),
      supplierService.getAll(),
    ]).then(([categoriesRes, suppliersRes]) => {
      setCategories(categoriesRes.data)
      setSuppliers(suppliersRes.data.filter(supplier => supplier.active))
    })
    productService.getOne(id).then(res => {
      const p = res.data
      setForm({
        name:         p.name,
        reference:    p.reference,
        description:  p.description || '',
        price:        p.price,
        quantity:     p.quantity,
        quantity_min: p.quantity_min,
        unit:         p.unit,
        category_id:  p.category_id || '',
        supplier_id:  p.supplier_id || '',
        image:        null,
      })
      if (p.image) {
        setPreview(`http://localhost:8000/storage/${p.image}`)
      }
    })
  }, [id])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: null }))
  }

  const handleImage = e => {
    const file = e.target.files[0]
    if (!file) return
    setForm(prev => ({ ...prev, image: file }))
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData()
    Object.entries(form).forEach(([key, val]) => {
      if (val !== null && val !== '') formData.append(key, val)
    })

    try {
      await productService.update(id, formData)
      toast.success('Produit mis à jour !')
      navigate('/products')
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors)
      } else {
        toast.error(err.response?.data?.message || 'Erreur lors de la mise à jour')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="mb-6 flex items-center gap-3">
        <Link to="/products" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Modifier le produit</h1>
          <p className="text-sm text-gray-500 mt-1">Modifiez les informations du produit</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-base font-medium text-gray-900 mb-4">Informations générales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Référence *</label>
                <input
                  type="text"
                  name="reference"
                  value={form.reference}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                {errors.reference && <p className="text-red-500 text-xs mt-1">{errors.reference[0]}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <select
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Sans catégorie</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
                <select
                  name="supplier_id"
                  value={form.supplier_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Sans fournisseur</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-base font-medium text-gray-900 mb-4">Stock & Prix</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prix (FCFA) *</label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  min="0"
                />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price[0]}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantité *</label>
                <input
                  type="number"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  min="0"
                />
                {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity[0]}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seuil minimum *</label>
                <input
                  type="number"
                  name="quantity_min"
                  value={form.quantity_min}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unité *</label>
                <select
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="pcs">Pièces</option>
                  <option value="kg">Kg</option>
                  <option value="l">Litres</option>
                  <option value="m">Mètres</option>
                  <option value="boite">Boîte</option>
                  <option value="carton">Carton</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne image + bouton */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-base font-medium text-gray-900 mb-4">Image du produit</h2>
            <label className="cursor-pointer block">
              <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
              {preview ? (
                <img src={preview} alt="preview" className="w-full h-48 object-cover rounded-lg" />
              ) : (
                <div className="w-full h-48 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-blue-400 transition-colors">
                  <Upload size={24} className="text-gray-400" />
                  <p className="text-sm text-gray-400">Cliquer pour uploader</p>
                  <p className="text-xs text-gray-300">PNG, JPG max 2MB</p>
                </div>
              )}
            </label>
            {preview && (
              <button
                type="button"
                onClick={() => { setPreview(null); setForm(p => ({ ...p, image: null })) }}
                className="mt-2 text-xs text-red-500 hover:underline w-full text-center"
              >
                Supprimer l'image
              </button>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
            >
              {loading ? 'Enregistrement...' : 'Mettre à jour'}
            </button>
            <Link
              to="/products"
              className="block w-full text-center border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-2.5 rounded-lg transition-colors text-sm"
            >
              Annuler
            </Link>
          </div>
        </div>
      </form>
    </AppLayout>
  )
}
