import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Home from './pages/home/Home';
import SobreNosotros from './pages/sobrenossotros/SobreNosotros';
import Planes from './pages/planes/Planes';
import Login from './pages/login/Login';
import Admin from './pages/admin/admin';
import Coach from './pages/admin/Coach';
import Member from './pages/admin/Member';


function App() {
  return (
    <>
      <Navbar />
      <div className="page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sobre-nosotros" element={<SobreNosotros />} />
          <Route path="/planes" element={<Planes />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/coach" element={<Coach />} />
          <Route path="/member" element={<Member />} />
        </Routes>
      </div>
    </>
  );
}

export default App;