import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  FaBars, FaTimes, FaHome, FaUser, FaDumbbell, 
  FaCalendarAlt, FaMoneyBillWave, FaCog, FaClipboardList
} from 'react-icons/fa';
import './AdminSidebar.css';

const AdminSidebar = ({ isCollapsed, toggleCollapse }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMobileSidebar = () => {
    setIsOpen(!isOpen);
  };

  const isCoach = location.pathname.startsWith('/coach');
  const isMember = location.pathname.startsWith('/member');

  let roleTitle = 'GYM ADMIN';
  let dashboardName = 'Admin Dashboard';
  let basePath = '/admin';

  if (isCoach) {
    roleTitle = 'GYM COACHES';
    dashboardName = 'Coach Dashboard';
    basePath = '/coach';
  } else if (isMember) {
    roleTitle = 'GYM MEMBER';
    dashboardName = 'Member Dashboard';
    basePath = '/member';
  }

  const menuItems = [
    {
      path: basePath,
      name: dashboardName,
      icon: <FaHome />
    }
  ];

  if (!isCoach && !isMember) {
    menuItems.push(
      {
        path: '/coach',
        name: 'Coaches',
        icon: <FaDumbbell />
      },
      {
        path: '/member',
        name: 'Members',
        icon: <FaUser />
      }
    );
  }

  menuItems.push(
    {
      path: `${basePath}/planes`,
      name: 'Planes',
      icon: <FaClipboardList />
    },
    {
      path: `${basePath}/horarios`,
      name: 'Horarios',
      icon: <FaCalendarAlt />
    },
    {
      path: `${basePath}/pagos`,
      name: 'Historial de pagos',
      icon: <FaMoneyBillWave />
    },
    {
      path: `${basePath}/configuracion`,
      name: 'Configuración',
      icon: <FaCog />
    }
  );

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
          <h2 className="logo">{isCollapsed ? roleTitle.charAt(4) || 'G' : roleTitle}</h2>
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
