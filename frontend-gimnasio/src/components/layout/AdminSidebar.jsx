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

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {};
  let role = String(user.role || 'member').toLowerCase();
  if (role === '1') role = 'member';
  if (role === '2') role = 'coach';
  if (role === '3') role = 'admin';

  const menuItems = [
    {
      path: '/admin',
      name: 'Admin Dashboard',
      icon: <FaHome />,
      roles: ['admin']
    },
    {
      path: '/coach',
      name: 'Coaches',
      icon: <FaDumbbell />,
      roles: ['admin', 'coach']
    },
    {
      path: '/member',
      name: 'Members',
      icon: <FaUser />,
      roles: ['admin', 'coach', 'member']
    },
    {
      path: '/admin/planes',
      name: 'Planes',
      icon: <FaClipboardList />,
      roles: ['admin']
    },
    {
      path: '/admin/horarios',
      name: 'Horarios',
      icon: <FaCalendarAlt />,
      roles: ['admin', 'coach']
    },
    {
      path: '/admin/pagos',
      name: 'Pagos',
      icon: <FaMoneyBillWave />,
      roles: ['admin']
    },
    {
      path: '/admin/configuracion',
      name: 'Configuración',
      icon: <FaCog />,
      roles: ['admin']
    }
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(role) || role === 'admin');

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
