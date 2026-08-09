import React, { lazy, Suspense } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { useAuth } from './hooks/useAuth';
import ToastContainer from './components/common/Toast';
import Spinner from './components/common/Spinner';
import Navbar from './components/layout/Navbar';
import AdminLayout from './components/layout/AdminLayout';

const Home = lazy(() => import('./pages/home/Home'));
const SobreNosotros = lazy(() => import('./pages/sobrenossotros/SobreNosotros'));
const Planes = lazy(() => import('./pages/planes/Planes'));
const Login = lazy(() => import('./pages/login/Login'));
const Admin = lazy(() => import('./pages/admin/dashboard/AdminDashboard'));
const Coach = lazy(() => import('./pages/admin/CoachPanel'));
const RoutineManager = lazy(() => import('./pages/admin/coaches/RoutineManager'));
const Member = lazy(() => import('./pages/admin/Member'));
const AdminPlanes = lazy(() => import('./pages/admin/planes/AdminPlanes'));
const AdminPagos = lazy(() => import('./pages/admin/pagos/AdminPagos'));
const AdminHorarios = lazy(() => import('./pages/admin/horarios/AdminHorarios'));
const AdminPagosVerificacion = lazy(() => import('./pages/admin/pagos/AdminPagosVerificacion'));
const AdminCorreos = lazy(() => import('./pages/admin/correos/AdminCorreos'));
const AdminAccesos = lazy(() => import('./pages/admin/accesos/AdminAccesos'));
const TestDesignSystem = lazy(() => import('./pages/test/TestDesignSystem'));
const ForgotPassword = lazy(() => import('./pages/login/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/login/ResetPassword'));

function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Spinner fullPage text="Cargando sesión..." size="lg" />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  let role = String(user.role || 'member').toLowerCase();
  if (role === '1') role = 'member';
  if (role === '2') role = 'coach';
  if (role === '3') role = 'admin';

  if (!allowedRoles.includes(role) && role !== 'admin') {
    return <Navigate to={role === 'coach' ? '/coach' : '/member'} replace />;
  }
  return children;
}

function MainLayout() {
  const location = useLocation();
  const isAdminRoute = ['/admin', '/coach', '/member'].some(path => location.pathname.startsWith(path));
  const hideNavbar = location.pathname === '/login' || isAdminRoute;

  return (
    <>
      {!hideNavbar && <Navbar />}
      <div className={isAdminRoute ? '' : 'page'}>
        <Suspense fallback={<Spinner fullPage text="Cargando página..." size="lg" />}>
          <Routes>
            {/* Rutas Públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/sobre-nosotros" element={<SobreNosotros />} />
            <Route path="/planes" element={<Planes />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            {import.meta.env.DEV && (
              <Route path="/dev/design-system" element={<TestDesignSystem />} />
            )}
            
            {/* Rutas Protegidas de Administración / Socio */}
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><Admin /></ProtectedRoute>} />
              <Route path="/coach" element={<ProtectedRoute allowedRoles={['admin', 'coach']}><Coach /></ProtectedRoute>} />
              <Route path="/coach/rutinas" element={<ProtectedRoute allowedRoles={['admin', 'coach']}><RoutineManager coachId={2} /></ProtectedRoute>} />
              <Route path="/member" element={<ProtectedRoute allowedRoles={['admin', 'coach', 'member']}><Member /></ProtectedRoute>} />
              <Route path="/admin/planes" element={<ProtectedRoute allowedRoles={['admin']}><AdminPlanes /></ProtectedRoute>} />
              <Route path="/admin/pagos" element={<ProtectedRoute allowedRoles={['admin']}><AdminPagos /></ProtectedRoute>} />
              <Route path="/admin/pagos/verificacion" element={<ProtectedRoute allowedRoles={['admin']}><AdminPagosVerificacion /></ProtectedRoute>} />
              <Route path="/admin/horarios" element={<ProtectedRoute allowedRoles={['admin', 'coach']}><AdminHorarios /></ProtectedRoute>} />
              <Route path="/admin/correos" element={<ProtectedRoute allowedRoles={['admin']}><AdminCorreos /></ProtectedRoute>} />
              <Route path="/admin/accesos" element={<ProtectedRoute allowedRoles={['admin']}><AdminAccesos /></ProtectedRoute>} />
            </Route>
          </Routes>
        </Suspense>
      </div>
      <ToastContainer />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainLayout />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;