import { Routes, Route,Navigate } from 'react-router-dom'
import Overview       from './admin/pages/Overview'
import LoginPage      from './admin/pages/LoginPage'
import RoomManager    from './admin/pages/RoomManager'
import ProductManager from './admin/pages/ProductManager'
import AdminSidebar from './admin/components/AdminSidebar'
export default function App() {
  return (
    <Routes>
         {/* Redirect root → /admin */}
      <Route path="/"               element={<Navigate to="/admin" replace />} />
      <Route path="/admin"          element={<Overview />} />
      <Route path="/admin/login"    element={<LoginPage />} />
      <Route path="/admin/rooms"    element={<RoomManager />} />
      <Route path="/admin/products" element={<ProductManager />} />
      <Route path = "/admin/sidebar" element={<AdminSidebar />} />
    </Routes>
  )
}