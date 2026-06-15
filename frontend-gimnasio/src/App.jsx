import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import AdminLayout from './components/layout/AdminLayout';
import Home from './pages/home/Home';
import SobreNosotros from './pages/sobrenossotros/SobreNosotros';
import Planes from './pages/planes/Planes';
import Login from './pages/login/Login';
import Admin from './pages/admin/admin';
import Coach from './pages/admin/Coach';
import Member from './pages/admin/Member';
import AdminPlanes from './pages/admin/AdminPlanes';
import AdminPagos from './pages/admin/AdminPagos';

function ProtectedRoute({ children, allowedRoles }) {
  const userStr = localStorage.getItem('user');
  if (!userStr) return <Navigate to="/login" replace />;
  const user = JSON.parse(userStr);
  let role = String(user.role || 'member').toLowerCase();
  if (role === '1') role = 'member';
  if (role === '2') role = 'coach';
  if (role === '3') role = 'admin';

  if (!allowedRoles.includes(role) && role !== 'admin') {
    return <Navigate to={role === 'coach' ? '/coach' : '/member'} replace />;
  }
  return children;
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
          
          {/* Rutas de Administrador */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><Admin /></ProtectedRoute>} />
            <Route path="/coach" element={<ProtectedRoute allowedRoles={['admin', 'coach']}><Coach /></ProtectedRoute>} />
            <Route path="/member" element={<ProtectedRoute allowedRoles={['admin', 'coach', 'member']}><Member /></ProtectedRoute>} />
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