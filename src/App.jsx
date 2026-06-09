import { Routes, Route, Navigate } from 'react-router-dom';
import Overview from './admin/pages/Overview';
import LoginPage from './admin/pages/LoginPage';
import RoomManager from './admin/pages/RoomManager';
import ProductManager from './admin/pages/ProductManager';
import AdminSidebar from './admin/components/AdminSidebar';

// Ensure these point to their correct respective files
import RoomDetail from './admin/pages/RoomDetail'; 
// import ProductDetail from './admin/pages/ProductDetail'; // Make sure you have a separate file for products later

export default function App() {
  return (
    <Routes>
      {/* Redirect root → /admin */}
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="/admin" element={<Overview />} />
      <Route path="/admin/login" element={<LoginPage />} />
      
      {/* Rooms Routing */}
      <Route path="/admin/rooms" element={<RoomManager />} />
      <Route path="/admin/rooms/:id" element={<RoomDetail />} /> {/* Added missing route */}

      {/* Products Routing */}
      <Route path="/admin/products" element={<ProductManager />} />
      {/* <Route path="/admin/products/:id" element={<ProductDetail />} /> */}
      
      <Route path="/admin/sidebar" element={<AdminSidebar />} />
    </Routes>
  );
}