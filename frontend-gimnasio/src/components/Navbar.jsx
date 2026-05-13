import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import './Navbar.css';
// 1. Importa el componente que crearemos (paso 2)
import ModalLogin from './ModalLogin'; 

const Navbar = () => {
  const [click, setClick] = useState(false);
  const [showModal, setShowModal] = useState(false); // Estado para el modal

  const handleClick = () => setClick(!click);
  
  // Función para abrir modal y cerrar menú móvil
  const openModal = (e) => {
    e.preventDefault(); // Evita que el Link navegue a otra página
    setShowModal(true);
    if(click) setClick(false); 
  };

  return (
    <div className="header">
      <Link to="/">
        <h1 className="logo">SLIMMING <span className="red-text">GYM</span></h1>
      </Link>
      
      <ul className={click ? "nav-menu active" : "nav-menu"}>
        <li><Link to="/" onClick={handleClick}>Inicio</Link></li>
        <li><Link to="/sobre-nosotros" onClick={handleClick}>Sobre Nosotros</Link></li>
        <li><Link to="/planes" onClick={handleClick}>Planes</Link></li>
        
        {/* Botón Móvil */}
        <li className="btn-mobile">
           <button className="btn-login-nav" onClick={openModal}>Iniciar Sesión</button>
        </li>
      </ul>

      {/* Botón Desktop */}
      <div className="btn-group-desktop">
        <button className="btn-login" onClick={openModal}>Iniciar Sesión</button>
      </div>

      <div className="hamburger" onClick={handleClick}>
        {click ? (<FaTimes size={20} style={{color: '#fff'}} />) : (<FaBars size={20} style={{color: '#fff'}} />)}
      </div>


      {/* 2. Insertamos el Modal aquí */}
      <ModalLogin isVisible={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default Navbar;