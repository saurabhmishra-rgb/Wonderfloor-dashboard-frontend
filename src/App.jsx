// App.jsx
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Overview from './admin/pages/Overview';
import LoginPage from './admin/pages/LoginPage';
import RoomManager from './admin/pages/RoomManager';
import ProductManager from './admin/pages/ProductManager';
import AdminSidebar from './admin/components/AdminSidebar';
import RoomDetail from './admin/pages/RoomDetail'; 
import Settings from './admin/pages/Settings';
// Import the SearchProvider we created earlier
// (Adjust this relative import path depending on where you saved SearchContext.jsx)
import { SearchProvider } from './admin/components/SearchContext';

/**
 * A lightweight layout route that wraps sub-routes in the global search context.
 * The <Outlet /> component renders whichever child route matches the URL.
 */
function AdminSearchLayout() {
  return (
    <SearchProvider>
      <Outlet />
    </SearchProvider>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public / Autonomous Routes */}
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="/admin/login" element={<LoginPage />} />
      
      {/* Shared Context Dashboard Routes */}
      <Route element={<AdminSearchLayout />}>
        <Route path="/admin" element={<Overview />} />
        
        {/* Rooms Management */}
        <Route path="/admin/rooms" element={<RoomManager />} />
        <Route path="/admin/rooms/:id" element={<RoomDetail />} />

        {/* Products Management */}
        <Route path="/admin/products" element={<ProductManager />} />
        {/* <Route path="/admin/products/:id" element={<ProductDetail />} /> */}
        
        <Route path="/admin/sidebar" element={<AdminSidebar />} />
        <Route path="/admin/settings" element={<Settings />} /> 
      </Route>
    </Routes>
  );
}
