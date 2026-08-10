import React, { useCallback, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  FaBars, FaTimes, FaHome, FaUser, FaDumbbell,
  FaCalendarAlt, FaMoneyBillWave, FaClipboardList,
  FaChevronDown, FaChevronUp, FaEnvelope, FaDoorOpen
} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useDrawer } from '../../hooks/useDrawer';
import { useEsMovil } from '../../hooks/useMediaQuery';
import './AdminSidebar.css';

/* El colapso por hover solo tiene sentido con ratón: en una pantalla táctil
   el propio toque dispara mouseenter y el menú se abre y cierra solo. */
const tienePunteroFino = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches;

const AdminSidebar = ({ isCollapsed, toggleCollapse }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const { user } = useAuth();
  const location = useLocation();

  const toggleMobileSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeMobileSidebar = useCallback(() => setIsOpen(false), []);
  const esMovil = useEsMovil();

  /* El modo colapsado (solo iconos) es una función de escritorio. En móvil el
     sidebar es un panel deslizante que se ve completo, así que se ignora: si
     no, el logo aparecía como "G", desaparecían las categorías y los
     submenús no se podían desplegar. */
  const estaColapsado = isCollapsed && !esMovil;

  useDrawer(isOpen, closeMobileSidebar);

  const toggleSubmenu = (itemName, e) => {
    e.preventDefault();
    setExpandedMenus(prev => ({
      ...prev,
      [itemName]: !prev[itemName]
    }));
    if (estaColapsado && toggleCollapse) {
      toggleCollapse();
    }
  };

  let role = String(user?.role || 'member').toLowerCase();
  if (role === '1') role = 'member';
  if (role === '2') role = 'coach';
  if (role === '3') role = 'admin';

  const menuConfig = {
    admin: [
      {
        category: 'Gestión Principal',
        items: [
          { 
            path: '/admin', 
            name: 'Dashboard Admin', 
            icon: <FaHome />,
            subItems: [
              { path: '/admin?mode=dashboard', name: 'Dashboard' },
              { path: '/admin?mode=coaches', name: 'Entrenadores' },
              { path: '/admin?mode=members', name: 'Miembros' },
              { path: '/admin?mode=admins', name: 'Admins' },
              { path: '/admin?mode=register', name: 'Registrar Usuario' }
            ]
          }
        ]
      },
      {
        category: 'Finanzas',
        items: [
          { path: '/admin/planes', name: 'Planes', icon: <FaClipboardList /> },
          { path: '/admin/pagos/verificacion', name: 'Pagos', icon: <FaMoneyBillWave /> }
        ]
      },
      {
        category: 'Personal',
        items: [
          { 
            path: '/admin/horarios', 
            name: 'Horarios', 
            icon: <FaCalendarAlt />,
            subItems: [
              { path: '/admin/horarios?mode=class', name: 'Clases Grupales' },
              { path: '/admin/horarios?mode=schedule', name: 'Horas de Trabajo' }
            ]
          }
        ]
      },
      {
        category: 'Comunicaciones',
        items: [
          { path: '/admin/correos', name: 'Correos', icon: <FaEnvelope /> }
        ]
      },
      {
        category: 'Recepción',
        items: [
          { path: '/admin/accesos', name: 'Control de Ingreso', icon: <FaDoorOpen /> }
        ]
      },
      // Pendiente: reponer la categoria 'Ajustes' cuando exista la pantalla de
      // gestion de permisos de entrenador (tabla CoachPermissions y el endpoint
      // PUT /api/coaches/:id/permissions ya existen, falta la interfaz).
    ],
    coach: [
      {
        category: 'Mi Panel',
        items: [
          { 
            path: '/coach', 
            name: 'Panel Coach', 
            icon: <FaDumbbell />,
            subItems: [
              { path: '/coach?mode=alumnos', name: 'Mis Alumnos' },
              { path: '/coach?mode=agenda', name: 'Mi Agenda' },
              { path: '/coach/rutinas', name: 'Gestor de Rutinas' }
            ]
          }
        ]
      },
      {
        category: 'Organización',
        items: [
          { 
            path: '/admin/horarios', 
            name: 'Mis Horarios', 
            icon: <FaCalendarAlt />,
            subItems: [
              { path: '/admin/horarios?mode=class', name: 'Mis Clases' },
              { path: '/admin/horarios?mode=schedule', name: 'Mi Horario' }
            ]
          }
        ]
      }
    ],
    member: [
      {
        category: 'Mi Perfil',
        items: [
          { 
            path: '/member', 
            name: 'Panel Socio', 
            icon: <FaUser />,
            subItems: [
              { path: '/member?mode=subscription', name: 'Estado y Planes' },
              { path: '/member?mode=schedule', name: 'Reserva de Clases' },
              { path: '/member?mode=progress', name: 'Mi Progreso Físico' },
              { path: '/member?mode=pdf', name: 'Rutina en PDF' },
              { path: '/member?mode=payments', name: 'Reportar Pago' },
              { path: '/member?mode=profile', name: 'Mi Perfil' }
            ]
          }
        ]
      }
    ]
  };

  const currentMenu = menuConfig[role] || menuConfig['member'];

  return (
    <>
      <div className={isOpen ? "sidebar-backdrop active" : "sidebar-backdrop"} onClick={closeMobileSidebar}></div>
      <div className="mobile-admin-topbar">
        <button
          type="button"
          className="mobile-toggle"
          onClick={toggleMobileSidebar}
          aria-label={isOpen ? 'Cerrar menú lateral' : 'Abrir menú lateral'}
          aria-expanded={isOpen}
          aria-controls="admin-sidebar-menu"
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
        <div className="mobile-topbar-title">SLIMMING GYM</div>
      </div>

      <div
        id="admin-sidebar-menu"
        className={`admin-sidebar ${isOpen ? 'open' : ''} ${estaColapsado ? 'collapsed' : ''}`}
        onMouseEnter={() => tienePunteroFino() && isCollapsed && toggleCollapse()}
        onMouseLeave={() => tienePunteroFino() && !isCollapsed && toggleCollapse()}
      >
        <div className="sidebar-header">
          <h2 className="main-logo">{estaColapsado ? (role === 'admin' ? 'G' : role === 'coach' ? 'C' : 'U') : role === 'admin' ? 'GYM ADMIN' : role === 'coach' ? 'PANEL COACH' : 'MI PERFIL'}</h2>
        </div>
        
        <div className="sidebar-menu">
          {currentMenu.map((group, groupIndex) => (
            <div key={groupIndex} className="sidebar-group">
              {!estaColapsado && <div className="sidebar-category">{group.category}</div>}
              {group.items.map((item, index) => {
                const hasSubItems = item.subItems && item.subItems.length > 0;
                const isExpanded = expandedMenus[item.name];
                
                // If it has subitems, we might not want the parent to have 'active' class 
                // just because a subitem is active, or we might. Let's keep react-router's default for parent.
                
                return (
                  <div key={index} className="menu-item-wrapper">
                    <NavLink
                      to={item.path}
                      end={!hasSubItems}
                      className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}
                      onClick={(e) => {
                        if (hasSubItems) {
                          toggleSubmenu(item.name, e);
                        } else {
                          setIsOpen(false);
                        }
                      }}
                    >
                      <div className="icon">{item.icon}</div>
                      <div className="link-text">{item.name}</div>
                      {hasSubItems && !estaColapsado && (
                        <div className="submenu-arrow">
                          {isExpanded ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
                        </div>
                      )}
                    </NavLink>
                    
                    {hasSubItems && isExpanded && !estaColapsado && (
                      <div className="submenu">
                        {item.subItems.map((subItem, subIndex) => {
                          const isActiveSub = location.pathname + location.search === subItem.path;
                          return (
                            <NavLink
                              key={subIndex}
                              to={subItem.path}
                              className={`submenu-item ${isActiveSub ? 'active' : ''}`}
                              onClick={() => setIsOpen(false)}
                            >
                              <div className="submenu-link-text">{subItem.name}</div>
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        
        <div className="sidebar-footer">
          <NavLink to="/" className="menu-item exit-link" onClick={closeMobileSidebar}>
            <div className="icon"><FaTimes /></div>
            <div className="link-text">Salir al sitio</div>
          </NavLink>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
