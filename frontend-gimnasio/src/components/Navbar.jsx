// src/components/Navbar.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa'; // Necesitas instalar react-icons
import './Navbar.css';

const Navbar = () => {
  const [click, setClick] = useState(false);
  const handleClick = () => setClick(!click);

  return (
    <div className="header">
      <Link to="/">
        <h1 className="logo">SLIMMING <span className="red-text">GYM</span></h1>
      </Link>
      
      {/* Menú de navegación */}
      <ul className={click ? "nav-menu active" : "nav-menu"}>
        <li>
          <Link to="/" onClick={handleClick}>Inicio</Link>
        </li>
        <li>
          <Link to="/sobre-nosotros" onClick={handleClick}>Sobre Nosotros</Link>
        </li>
        <li>
          <Link to="/planes" onClick={handleClick}>Planes</Link>
        </li>
        <li className="btn-mobile">
           <Link to="/login" className="btn-login" onClick={handleClick}>Iniciar Sesión</Link>
        </li>
      </ul>

      {/* Botón Iniciar Sesión para Desktop */}
      <div className="btn-group-desktop">
        <Link to="/login" className="btn-login">Iniciar Sesión</Link>
      </div>

      {/* Icono de Hamburguesa para celular */}
      <div className="hamburger" onClick={handleClick}>
        {click ? (<FaTimes size={20} style={{color: '#fff'}} />) : (<FaBars size={20} style={{color: '#fff'}} />)}
      </div>
    </div>
  );
};

export default Navbar;