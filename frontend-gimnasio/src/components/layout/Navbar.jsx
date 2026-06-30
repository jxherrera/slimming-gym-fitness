import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, logout } = useAuth();
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
            
            {user ? (
              <>
                <li className="nav-user-mobile-info">
                  <span className="user-greeting-mobile">Hola, {user.firstName}</span>
                </li>
                <li className="btn-mobile">
                  <button 
                    className="btn-panel-nav" 
                    onClick={() => {
                      navigate(role === 'admin' ? '/admin' : role === 'coach' ? '/coach' : '/member');
                      closeMenu();
                    }}
                  >
                    Mi Panel
                  </button>
                </li>
                <li className="btn-mobile">
                  <button 
                    className="btn-logout-nav" 
                    onClick={() => {
                      logout();
                      closeMenu();
                    }}
                  >
                    Cerrar Sesión
                  </button>
                </li>
              </>
            ) : (
              <li className="btn-mobile">
                 <button className="btn-login-nav" onClick={goToLogin}>
                   Iniciar Sesión
                 </button>
              </li>
            )}
          </ul>

          <div className="btn-group-desktop">
            {user ? (
              <div className="user-area-desktop">
                <span className="user-greeting">
                  Hola, <strong className="user-name">{user.firstName}</strong>
                </span>
                <Link to={role === 'admin' ? '/admin' : role === 'coach' ? '/coach' : '/member'} className="btn-panel">
                  Mi Panel
                </Link>
                <button className="btn-logout" onClick={logout}>
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <button className="btn-login" onClick={goToLogin}>
                Iniciar Sesión
              </button>
            )}
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