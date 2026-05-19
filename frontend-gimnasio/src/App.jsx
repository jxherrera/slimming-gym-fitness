import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SobreNosotros from './pages/SobreNosotros';
import Planes from './pages/Planes';
import Login from './pages/Login';

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
        </Routes>
      </div>
    </>
  );
}

export default App;