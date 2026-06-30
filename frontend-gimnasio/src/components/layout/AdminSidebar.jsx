import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FaBars, FaTimes, FaHome, FaUser, FaDumbbell, 
  FaCalendarAlt, FaMoneyBillWave, FaCog, FaClipboardList,
  FaChevronDown, FaChevronRight, FaSearch, FaBell
} from 'react-icons/fa';
import './AdminSidebar.css';

const AdminSidebar = ({ isCollapsed, toggleCollapse }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState({
    'GESTIONAR': true,
    'ENTRENAR': true,
    'FIDELIZAR': true
  });

  const toggleMobileSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleGroup = (groupTitle) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupTitle]: !prev[groupTitle]
    }));
  };

  const { role, logout } = useAuth();

  const menuGroups = [
    {
      title: 'GESTIONAR',
      items: [
        { path: '/admin', name: 'Panel', icon: <FaHome />, roles: ['admin'] },
        { path: '/member', name: 'Clientes', icon: <FaUser />, roles: ['admin', 'coach', 'member'] },
        { path: '/coach', name: 'Entrenadores', icon: <FaDumbbell />, roles: ['admin', 'coach'] },
        { path: '/member/notifications', name: 'Notificaciones', icon: <FaBell />, roles: ['admin', 'coach', 'member'] },
      ]
    },
    {
      title: 'ENTRENAR',
      items: [
        { path: '/admin/planes', name: 'Planes', icon: <FaClipboardList />, roles: ['admin'] },
        { path: '/admin/horarios', name: 'Agenda', icon: <FaCalendarAlt />, roles: ['admin', 'coach'] },
      ]
    },
    {
      title: 'FIDELIZAR',
      items: [
        { path: '/admin/pagos', name: 'Pagos', icon: <FaMoneyBillWave />, roles: ['admin'] },
        { path: '/admin/configuracion', name: 'Tareas / Configuración', icon: <FaCog />, roles: ['admin'] }
      ]
    }
  ];

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
          <div className="logo-container">
            <div className="logo-box"></div>
            <span className="logo-text">Tu Logo <FaChevronDown className="logo-dropdown" /></span>
          </div>
        </div>

        <div className="sidebar-search">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input type="text" placeholder="Buscar..." />
          </div>
        </div>
        
        <div className="sidebar-menu">
          {menuGroups.map((group, gIndex) => {
            const filteredItems = group.items.filter(item => item.roles.includes(role) || role === 'admin');
            if (filteredItems.length === 0) return null;

            const isGroupOpen = openGroups[group.title];

            return (
              <div key={gIndex} className="menu-group">
                <div 
                  className="menu-group-header" 
                  onClick={() => toggleGroup(group.title)}
                >
                  <span className="group-title">{group.title}</span>
                  {isGroupOpen ? <FaChevronDown className="group-chevron" /> : <FaChevronRight className="group-chevron" />}
                </div>
                
                {isGroupOpen && (
                  <div className="menu-group-items">
                    {filteredItems.map((item, index) => (
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
                )}
              </div>
            );
          })}
        </div>
        
        <div className="sidebar-footer">
          <button onClick={logout} className="menu-item exit-link" style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}>
            <div className="icon"><FaTimes /></div>
            <div className="link-text">Cerrar Sesión</div>
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;

