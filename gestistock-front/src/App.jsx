import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import PrivateRoute from './routes/PrivateRoute'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import GoogleCallback from './pages/auth/GoogleCallback'
import Landing from './pages/Landing'
import Dashboard from './pages/dashboard/Dashboard'
import ProductList from './pages/products/ProductList'
import ProductCreate from './pages/products/ProductCreate'
import ProductEdit from './pages/products/ProductEdit'
import MovementList from './pages/movements/MovementList'
import AlertList from './pages/alerts/AlertList'
import CategoryList from './pages/categories/CategoryList'
import SupplierList from './pages/suppliers/SupplierList'
import WarehouseList from './pages/warehouses/WarehouseList'
import UserList from './pages/users/UserList'
import PurchaseOrderList from './pages/purchases/PurchaseOrderList'
import PurchaseOrderForm from './pages/purchases/PurchaseOrderForm'
import PurchaseOrderDetail from './pages/purchases/PurchaseOrderDetail'
import OrderList from './pages/sales/OrderList'
import OrderForm from './pages/sales/OrderForm'
import OrderDetail from './pages/sales/OrderDetail'
import LocationList from './pages/warehouses/LocationList'
import WarehouseStock from './pages/warehouses/WarehouseStock'
import TransferList from './pages/warehouses/TransferList'
import TransferForm from './pages/warehouses/TransferForm'
import TransferDetail from './pages/warehouses/TransferDetail'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login"              element={<Login />} />
            <Route path="/register"           element={<Register />} />
            <Route path="/forgot-password"    element={<ForgotPassword />} />
            <Route path="/reset-password"     element={<ResetPassword />} />
            <Route path="/auth/google-callback" element={<GoogleCallback />} />
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/products" element={<PrivateRoute><ProductList /></PrivateRoute>} />
            <Route path="/products/create" element={<PrivateRoute roles={['admin', 'gestionnaire']}><ProductCreate /></PrivateRoute>} />
            <Route path="/products/:id/edit" element={<PrivateRoute roles={['admin', 'gestionnaire']}><ProductEdit /></PrivateRoute>} />
            <Route path="/movements" element={<PrivateRoute><MovementList /></PrivateRoute>} />
            <Route path="/alerts" element={<PrivateRoute><AlertList /></PrivateRoute>} />
            <Route path="/categories" element={<PrivateRoute><CategoryList /></PrivateRoute>} />
            <Route path="/suppliers" element={<PrivateRoute><SupplierList /></PrivateRoute>} />
            <Route path="/warehouses" element={<PrivateRoute><WarehouseList /></PrivateRoute>} />
            <Route path="/locations" element={<PrivateRoute><LocationList /></PrivateRoute>} />
            <Route path="/warehouse-stock" element={<PrivateRoute><WarehouseStock /></PrivateRoute>} />
            <Route path="/transfers" element={<PrivateRoute><TransferList /></PrivateRoute>} />
            <Route path="/transfers/create" element={<PrivateRoute roles={['admin', 'gestionnaire']}><TransferForm /></PrivateRoute>} />
            <Route path="/transfers/:id" element={<PrivateRoute><TransferDetail /></PrivateRoute>} />
            <Route path="/purchases" element={<PrivateRoute><PurchaseOrderList /></PrivateRoute>} />
            <Route path="/purchases/create" element={<PrivateRoute roles={['admin', 'gestionnaire']}><PurchaseOrderForm /></PrivateRoute>} />
            <Route path="/purchases/:id" element={<PrivateRoute><PurchaseOrderDetail /></PrivateRoute>} />
            <Route path="/purchases/:id/edit" element={<PrivateRoute roles={['admin', 'gestionnaire']}><PurchaseOrderForm /></PrivateRoute>} />
            <Route path="/sales" element={<PrivateRoute><OrderList /></PrivateRoute>} />
            <Route path="/sales/create" element={<PrivateRoute roles={['admin', 'gestionnaire']}><OrderForm /></PrivateRoute>} />
            <Route path="/sales/:id" element={<PrivateRoute><OrderDetail /></PrivateRoute>} />
            <Route path="/sales/:id/edit" element={<PrivateRoute roles={['admin', 'gestionnaire']}><OrderForm /></PrivateRoute>} />
            <Route path="/users" element={<PrivateRoute roles={['admin']}><UserList /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
