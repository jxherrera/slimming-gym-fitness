import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [click, setClick] = useState(false);

  const handleClick = () => setClick(!click);
  const closeMenu = () => setClick(false);
  
  const goToLogin = () => {
    navigate('/login');
    closeMenu();
  };

  const isLoginPage = location.pathname === '/login';

  return (
    <div className="header">
      <Link to="/" onClick={closeMenu} style={{ textDecoration: 'none' }}>
        <h1 className="logo">SLIMMING <span className="red-text">GYM</span></h1>
      </Link>
      
      {!isLoginPage && (
        <>
          <ul className={click ? "nav-menu active" : "nav-menu"}>
            <li><Link to="/" onClick={closeMenu}>Inicio</Link></li>
            <li><Link to="/sobre-nosotros" onClick={closeMenu}>Sobre Nosotros</Link></li>
            <li><Link to="/planes" onClick={closeMenu}>Planes</Link></li>
            
            <li className="btn-mobile">
               <button className="btn-login-nav" onClick={goToLogin}>
                 Iniciar Sesión
               </button>
            </li>
          </ul>

          <div className="btn-group-desktop">
            <button className="btn-login" onClick={goToLogin}>
              Iniciar Sesión
            </button>
          </div>

          <div className="hamburger" onClick={handleClick}>
            {click ? (
              <FaTimes size={24} style={{ color: '#fff' }} />
            ) : (
              <FaBars size={24} style={{ color: '#fff' }} />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Navbar;