import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  FaBars, FaTimes, FaHome, FaUser, FaDumbbell, 
  FaCalendarAlt, FaMoneyBillWave, FaCog, FaClipboardList,
  FaChevronDown, FaChevronUp, FaEnvelope
} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import './AdminSidebar.css';

const AdminSidebar = ({ isCollapsed, toggleCollapse }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const { user } = useAuth();
  const location = useLocation();

  const toggleMobileSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleSubmenu = (itemName, e) => {
    e.preventDefault();
    setExpandedMenus(prev => ({
      ...prev,
      [itemName]: !prev[itemName]
    }));
    if (isCollapsed && toggleCollapse) {
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
        category: 'Ajustes',
        items: [
          { path: '/admin/configuracion', name: 'Configuración', icon: <FaCog /> }
        ]
      }
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
      <div className="mobile-toggle" onClick={toggleMobileSidebar}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </div>
      
      <div 
        className={`admin-sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}
        onMouseEnter={() => isCollapsed && toggleCollapse()}
        onMouseLeave={() => !isCollapsed && toggleCollapse()}
      >
        <div className="sidebar-header">
          <h2 className="logo">{isCollapsed ? (role === 'admin' ? 'G' : role === 'coach' ? 'C' : 'U') : role === 'admin' ? 'GYM ADMIN' : role === 'coach' ? 'PANEL COACH' : 'MI PERFIL'}</h2>
        </div>
        
        <div className="sidebar-menu">
          {currentMenu.map((group, groupIndex) => (
            <div key={groupIndex} className="sidebar-group">
              {!isCollapsed && <div className="sidebar-category">{group.category}</div>}
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
                      {hasSubItems && !isCollapsed && (
                        <div className="submenu-arrow">
                          {isExpanded ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
                        </div>
                      )}
                    </NavLink>
                    
                    {hasSubItems && isExpanded && !isCollapsed && (
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
          <NavLink to="/" className="menu-item exit-link">
            <div className="icon"><FaTimes /></div>
            <div className="link-text">Salir al sitio</div>
          </NavLink>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
