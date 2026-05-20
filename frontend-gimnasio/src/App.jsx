import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SobreNosotros from './pages/SobreNosotros';
import Planes from './pages/Planes';
import Login from './pages/Login';
import Admin from './pages/admin';
import Coach from './pages/Coach';
import Member from './pages/Member';

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