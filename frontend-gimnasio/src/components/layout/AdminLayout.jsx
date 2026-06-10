import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import './AdminLayout.css';

const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = React.useState(true);

  return (
    <div className={`admin-layout ${isCollapsed ? 'collapsed' : ''}`}>
      <AdminSidebar isCollapsed={isCollapsed} toggleCollapse={() => setIsCollapsed(!isCollapsed)} />
      <div className="admin-content">
        <div className="admin-content-inner">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
