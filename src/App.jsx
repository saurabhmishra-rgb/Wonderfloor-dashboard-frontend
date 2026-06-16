// App.jsx
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Overview from './admin/pages/Overview';
import LoginPage from './admin/pages/LoginPage';
import RoomManager from './admin/pages/RoomManager';
import ProductManager from './admin/pages/ProductManager';
import AdminSidebar from './admin/components/AdminSidebar';
import RoomDetail from './admin/pages/RoomDetail'; 
import Settings from './admin/pages/Settings';
// import SignupPage from './admin/pages/SignupPage';
import ForgotPasswordPage from './admin/pages/ForgotPasswordPage';
import LogoutPage from './admin/pages/LogoutPage';

// (Adjust this relative import path depending on where you saved SearchContext.jsx)
import { SearchProvider } from './admin/components/SearchContext';

// ─── NEW: PublicRoute prevents logged-in users from seeing Auth pages ───
function PublicRoute({ children }) {
  const isAuthenticated = localStorage.getItem('wonderfloor_admin_token');
  if (isAuthenticated) {
    // If they already have a token, kick them straight to the dashboard
    return <Navigate to="/admin" replace />;
  }
  return children;
}

// ─── ProtectedRoute prevents logged-out users from seeing the Dashboard ───
function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem('wonderfloor_admin_token');
  if (!isAuthenticated) {
    // If they don't have a token, kick them to the login page
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

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
      {/* Redirect root directly to login */}
      <Route path="/" element={<Navigate to="/admin/login" replace />} />
      
      {/* ─── PUBLIC AUTH ROUTES (Wrapped in PublicRoute) ─── */}
      <Route path="/admin/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />
      
      {/* <Route path="/admin/signup" element={
        <PublicRoute>
          <SignupPage />
        </PublicRoute>
      } /> */}
      
      <Route path="/admin/forgot-password" element={
        <PublicRoute>
          <ForgotPasswordPage />
        </PublicRoute>
      } />
      
      {/* ─── STANDALONE PROTECTED ROUTES ─── */}
      <Route path="/admin/logout" element={
        <ProtectedRoute>
          <LogoutPage />
        </ProtectedRoute>
      } />

      {/* ─── SHARED CONTEXT DASHBOARD ROUTES (Wrapped in ProtectedRoute) ─── */}
      <Route element={
        <ProtectedRoute>
          <AdminSearchLayout />
        </ProtectedRoute>
      }>
        <Route path="/admin" element={<Overview />} />
        
        {/* Rooms Management */}
        <Route path="/admin/rooms" element={<RoomManager />} />
        <Route path="/admin/rooms/:id" element={<RoomDetail />} />

        {/* Products Management */}
        <Route path="/admin/products" element={<ProductManager />} />
        
        <Route path="/admin/sidebar" element={<AdminSidebar />} />
        <Route path="/admin/settings" element={<Settings />} /> 
      </Route>
    </Routes>
  );
}