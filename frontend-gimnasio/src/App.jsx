import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import AdminLayout from './components/layout/AdminLayout';
import Home from './pages/home/Home';
import SobreNosotros from './pages/sobrenossotros/SobreNosotros';
import Planes from './pages/planes/Planes';
import Login from './pages/login/Login';
import Admin from './pages/admin/dashboard/AdminDashboard';
import Coach from './pages/admin/coaches/Coach';
import CoachPanel from './pages/admin/coaches/CoachPanel';
import Member from './pages/admin/members/Member';
import AdminPlanes from './pages/admin/planes/AdminPlanes';
import AdminPagos from './pages/admin/pagos/AdminPagos';
import TestDesignSystem from './pages/test/TestDesignSystem';
import Notifications from './pages/admin/notifications/Notifications';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, role, loading } = useAuth();
  
  if (loading) return null; // Avoid flicker
  if (!user) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(role) && role !== 'admin') {
    return <Navigate to={role === 'coach' ? '/coach' : '/member'} replace />;
  }
  return children;
}

function CoachRouteWrapper() {
  const { role, loading } = useAuth();
  
  if (loading) return null;

  if (role === 'admin') {
    return <Coach />;
  }
  return <CoachPanel />;
}

function App() {
  const location = useLocation();
  const isAdminRoute = ['/admin', '/coach', '/member'].some(path => location.pathname.startsWith(path));
  const hideNavbar = location.pathname === '/login' || isAdminRoute;

  return (
    <>
      {!hideNavbar && <Navbar />}
      <div className={isAdminRoute ? '' : 'page'}>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/sobre-nosotros" element={<SobreNosotros />} />
          <Route path="/planes" element={<Planes />} />
          <Route path="/login" element={<Login />} />
          <Route path="/test-design-system" element={<TestDesignSystem />} />
          
          {/* Rutas de Administrador */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><Admin /></ProtectedRoute>} />
            <Route path="/coach" element={<ProtectedRoute allowedRoles={['admin', 'coach']}><CoachRouteWrapper /></ProtectedRoute>} />
            <Route path="/member" element={<ProtectedRoute allowedRoles={['admin', 'coach', 'member']}><Member /></ProtectedRoute>} />
            <Route path="/member/notifications" element={<ProtectedRoute allowedRoles={['admin', 'coach', 'member']}><Notifications /></ProtectedRoute>} />
            <Route path="/admin/planes" element={<ProtectedRoute allowedRoles={['admin']}><AdminPlanes /></ProtectedRoute>} />
            <Route path="/admin/pagos" element={<ProtectedRoute allowedRoles={['admin']}><AdminPagos /></ProtectedRoute>} />
            <Route path="/admin/horarios" element={<ProtectedRoute allowedRoles={['admin', 'coach']}><div /></ProtectedRoute>} />
            <Route path="/admin/configuracion" element={<ProtectedRoute allowedRoles={['admin']}><div /></ProtectedRoute>} />
          </Route>
        </Routes>
      </div>
    </>
  );
}

export default App;