import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaBars, FaTimes, FaHome, FaUser, FaDumbbell, 
  FaCalendarAlt, FaMoneyBillWave, FaCog, FaClipboardList
} from 'react-icons/fa';
import './AdminSidebar.css';

const AdminSidebar = ({ isCollapsed, toggleCollapse }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsOpen(!isOpen);
  };

  const menuItems = [
    {
      path: '/admin',
      name: 'Admin Dashboard',
      icon: <FaHome />
    },
    {
      path: '/coach',
      name: 'Coaches',
      icon: <FaDumbbell />
    },
    {
      path: '/member',
      name: 'Members',
      icon: <FaUser />
    },
    {
      path: '/admin/planes',
      name: 'Planes',
      icon: <FaClipboardList />
    },
    {
      path: '/admin/horarios',
      name: 'Horarios',
      icon: <FaCalendarAlt />
    },
    {
      path: '/admin/pagos',
      name: 'Pagos',
      icon: <FaMoneyBillWave />
    },
    {
      path: '/admin/configuracion',
      name: 'Configuración',
      icon: <FaCog />
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
          <h2 className="logo">{isCollapsed ? 'G' : 'GYM ADMIN'}</h2>
        </div>
        
        <div className="sidebar-menu">
          {menuItems.map((item, index) => (
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
