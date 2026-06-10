import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import AdminLayout from './components/layout/AdminLayout';
import Home from './pages/home/Home';
import SobreNosotros from './pages/sobrenossotros/SobreNosotros';
import Planes from './pages/planes/Planes';
import Login from './pages/login/Login';
import Admin from './pages/admin/admin';
import Coach from './pages/admin/Coach';
import Member from './pages/admin/Member';


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
            <Route path="/admin" element={<Admin />} />
            <Route path="/coach" element={<Coach />} />
            <Route path="/member" element={<Member />} />
          </Route>
        </Routes>
      </div>
    </>
  );
}

export default App;