import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaUserCircle, FaSignOutAlt, FaTachometerAlt } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [click, setClick] = useState(false);

  const { user, isAuthenticated, logout } = useAuth();

  const handleClick = () => setClick(!click);
  const closeMenu = () => setClick(false);
  
  const goToLogin = () => {
    navigate('/login');
    closeMenu();
  };

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/');
  };

  const getDashboardRoute = () => {
    if (!user) return '/member';
    const role = (user.role || 'member').toString().toLowerCase();
    if (role === 'admin') return '/admin';
    if (role === 'coach') return '/coach';
    return '/member';
  };

  const goToPanel = () => {
    navigate(getDashboardRoute());
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
              {isAuthenticated ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                  <span className="user-name-badge">
                    <FaUserCircle /> {user?.firstName || user?.name || 'Usuario'}
                  </span>
                  <button className="btn-panel" onClick={goToPanel}>
                    <FaTachometerAlt /> Mi Panel
                  </button>
                  <button className="btn-logout" onClick={handleLogout}>
                    <FaSignOutAlt /> Cerrar Sesión
                  </button>
                </div>
              ) : (
                <button className="btn-login-nav" onClick={goToLogin}>
                  Iniciar Sesión
                </button>
              )}
            </li>
          </ul>

          <div className="btn-group-desktop">
            {isAuthenticated ? (
              <div className="user-menu-group">
                <span className="user-name-badge">
                  <FaUserCircle /> {user?.firstName || user?.name || 'Usuario'}
                </span>
                <button className="btn-panel" onClick={goToPanel}>
                  Mi Panel
                </button>
                <button className="btn-logout" onClick={handleLogout} title="Cerrar Sesión">
                  <FaSignOutAlt />
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