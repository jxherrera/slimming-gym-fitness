import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaBars, FaTimes, FaHome, FaUser, FaDumbbell, 
  FaCalendarAlt, FaMoneyBillWave, FaCog, FaClipboardList
} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import './AdminSidebar.css';

const AdminSidebar = ({ isCollapsed, toggleCollapse }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  const toggleMobileSidebar = () => {
    setIsOpen(!isOpen);
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
          { path: '/admin', name: 'Dashboard Admin', icon: <FaHome /> }
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
          { path: '/admin/horarios', name: 'Horarios', icon: <FaCalendarAlt /> }
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
          { path: '/coach', name: 'Panel Coach', icon: <FaDumbbell /> }
        ]
      },
      {
        category: 'Organización',
        items: [
          { path: '/admin/horarios', name: 'Mis Horarios', icon: <FaCalendarAlt /> }
        ]
      }
    ],
    member: [
      {
        category: 'Mi Perfil',
        items: [
          { path: '/member', name: 'Panel Socio', icon: <FaUser /> }
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
          <h2 className="logo">{isCollapsed ? 'G' : role === 'admin' ? 'GYM ADMIN' : role === 'coach' ? 'PANEL COACH' : 'MI PERFIL'}</h2>
        </div>
        
        <div className="sidebar-menu">
          {currentMenu.map((group, groupIndex) => (
            <div key={groupIndex} className="sidebar-group">
              {!isCollapsed && <div className="sidebar-category">{group.category}</div>}
              {group.items.map((item, index) => (
                <NavLink
                  to={item.path}
                  key={index}
                  className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}
                  onClick={() => setIsOpen(false)}
                >
                  <div className="icon">{item.icon}</div>
                  <div className="link-text">{item.name}</div>
                </NavLink>
              ))}
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
