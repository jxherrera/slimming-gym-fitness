import React, { useState, useEffect } from 'react';
import { FaChartLine, FaUserTie, FaUsers, FaUserPlus, FaDollarSign } from 'react-icons/fa';
import '../shared/admin-core.css';
import { useTheme } from '../../../context/ThemeContext';
import api from '../../../services/api';

const Admin = () => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <FaChartLine /> },
    { id: 'coaches', label: 'Entrenadores', icon: <FaUserTie /> },
    { id: 'members', label: 'Miembros', icon: <FaUsers /> },
    { id: 'register', label: 'Registrar usuario', icon: <FaUserPlus /> }
  ];

  const [activeTab, setActiveTab] = useState('dashboard');
  const { isDarkMode, toggleTheme } = useTheme();
  const [entities, setEntities] = useState({
    coaches: [],
    members: []
  });
  const [dashboardSummary, setDashboardSummary] = useState({ members: 0, coaches: 0, estimatedRevenue: 0 });
  const [apiError, setApiError] = useState('');

  const [registerForm, setRegisterForm] = useState({
    IDNumber: '',
    FirstName: '',
    LastName: '',
    Email: '',
    Password: '',
    PhoneNumber: '',
    RoleID: '1'
  });
  const [registerMessage, setRegisterMessage] = useState('');
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editForm, setEditForm] = useState({ id: '', idNumber: '', firstName: '', lastName: '', email: '', phone: '' });
  const [showEditModal, setShowEditModal] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [editMessage, setEditMessage] = useState('');
  const [permissionForm, setPermissionForm] = useState({
    coachId: '',
    coachName: '',
    manageRoutines: false,
    managePlans: false,
    sendMessages: false
  });
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [isCoachSaving, setIsCoachSaving] = useState(false);
  const [coachSaveMsg, setCoachSaveMsg] = useState('');

  const themeClass = isDarkMode ? 'theme-dark' : 'theme-light';
  const themeIcon = isDarkMode ? '☀️' : '🌙';

  const loadAdminEntities = async () => {
    try {
      const [coachesRes, membersRes, allMembersRes, summaryRes] = await Promise.all([
        api.get('/users/role/coach'),
        api.get('/users/role/member'),
        api.get('/coaches/members').catch(() => ({ data: { success: false } })),
        api.get('/users/summary').catch(() => ({ data: { success: false, summary: { members: 0, coaches: 0, estimatedRevenue: 0 } } }))
      ]);

      const coachesData = coachesRes.data;
      const membersData = membersRes.data;
      const allMembersData = allMembersRes.data;

      setEntities({
        coaches: coachesData.users.map((user) => ({
          id: user.id,
          idNumber: user.idNumber || '',
          firstName: user.firstName,
          lastName: user.lastName,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          specialty: user.specialty || 'N/A'
        })),
        members: membersData.users.map((user) => ({
          id: user.id,
          idNumber: user.idNumber || '',
          firstName: user.firstName,
          lastName: user.lastName,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          plan: user.plan || 'Sin plan'
        }))
      });
      
      if (allMembersData && allMembersData.success) {
        setAllMembers(allMembersData.members);
      }
      if (summaryRes.data && summaryRes.data.success) {
        setDashboardSummary(summaryRes.data.summary);
      }
      setApiError('');
    } catch (error) {
      console.error('Error cargando datos del admin:', error);
      setEntities({
        coaches: [
          { id: 1, name: 'Juan Pérez', email: 'juan@gym.com', specialty: 'Fuerza' },
          { id: 2, name: 'María López', email: 'maria@gym.com', specialty: 'Cardio' }
        ],
        members: [
          { id: 1, name: 'Carlos Ruiz', email: 'carlos@email.com', plan: 'Premium' },
          { id: 2, name: 'Ana García', email: 'ana@email.com', plan: 'Básico' }
        ]
      });
      setDashboardSummary({ members: 2, coaches: 2, estimatedRevenue: 100 });
      setApiError('No se pudieron cargar los datos del servidor. Mostrando datos de ejemplo.');
    }
  };

  useEffect(() => {
    loadAdminEntities();
  }, []);

  useEffect(() => {
    if (activeTab === 'coaches' || activeTab === 'members') {
      loadAdminEntities();
    }
  }, [activeTab]);

  useEffect(() => {
    setSearchQuery('');
  }, [activeTab]);

  const entityConfig = {
    coaches: {
      title: 'Entrenadores',
      columns: [
        { key: 'name', label: 'Nombre' },
        { key: 'email', label: 'Email' },
        { key: 'specialty', label: 'Especialidad', badge: true }
      ]
    },
    members: {
      title: 'Miembros',
      columns: [
        { key: 'name', label: 'Nombre' },
        { key: 'email', label: 'Email' },
        { key: 'plan', label: 'Plan', badge: true }
      ]
    }
  };

  const handleRegisterChange = (field, value) => {
    setRegisterForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePermissionChange = (field, value) => {
    setPermissionForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const selectCoachForPermissions = async (coach) => {
    setPermissionForm(prev => ({
      ...prev,
      coachId: coach.id,
      coachName: coach.name,
      manageRoutines: false,
      managePlans: false,
      sendMessages: false
    }));
    setAssignedStudents([]);
    setCoachSaveMsg('');

    try {
      const response = await api.get(`/coaches/${coach.id}/settings`);
      const data = response.data;
      if (data.success) {
        setPermissionForm({
          coachId: coach.id,
          coachName: coach.name,
          manageRoutines: data.permissions.canEditOthersRoutines,
          managePlans: data.permissions.canManagePlans,
          sendMessages: data.permissions.canSendMessages
        });
        setAssignedStudents(data.students || []);
      }
    } catch (error) {
      console.error('Error al cargar la configuración del entrenador:', error);
    }
  };

  const handleAddStudent = (studentId) => {
    const student = allMembers.find(m => m.id === studentId);
    if (student && !assignedStudents.some(s => s.id === studentId)) {
      setAssignedStudents(prev => [...prev, { id: student.id, name: student.name, email: student.email }]);
    }
  };

  const handleRemoveStudent = (studentId) => {
    setAssignedStudents(prev => prev.filter(s => s.id !== studentId));
  };

  const handleSaveCoachSettings = async () => {
    if (!permissionForm.coachId) return;
    setIsCoachSaving(true);
    setCoachSaveMsg('');
    try {
      const response = await api.put(`/coaches/${permissionForm.coachId}/settings`, {
        permissions: {
          canEditOthersRoutines: permissionForm.manageRoutines,
          canManagePlans: permissionForm.managePlans,
          canSendMessages: permissionForm.sendMessages
        },
        studentIds: assignedStudents.map(s => s.id)
      });

      const data = response.data;
      if (data.success) {
        setCoachSaveMsg('Ajustes y asignaciones guardadas con éxito.');
        // Refresh all members to update assignment labels in selector
        const allMembersRes = await api.get('/coaches/members');
        const allMembersData = allMembersRes.data;
        if (allMembersData.success) {
          setAllMembers(allMembersData.members);
        }
      } else {
        setCoachSaveMsg(data.message || 'Error al guardar los ajustes.');
      }
    } catch (error) {
      console.error('Error al guardar ajustes:', error);
      setCoachSaveMsg('Error de conexión con el servidor.');
    } finally {
      setIsCoachSaving(false);
    }
  };

  const openEditModal = (item) => {
    setEditForm({
      id: item.id,
      idNumber: item.idNumber || '',
      firstName: item.firstName || '',
      lastName: item.lastName || '',
      email: item.email || '',
      phone: item.phone || ''
    });
    setEditMessage('');
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditMessage('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditMessage('');
    setIsEditLoading(true);

    try {
      const response = await api.patch(`/users/${editForm.id}`, {
        idNumber: editForm.idNumber,
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email,
        phone: editForm.phone
      });

      const data = response.data;
      setEditMessage('Usuario actualizado correctamente.');
      setIsEditLoading(false);
      loadAdminEntities();
      closeEditModal();
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      setEditMessage('Error de conexión con el servidor.');
      setIsEditLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    const shouldDelete = window.confirm('¿Estás seguro de que deseas eliminar este usuario? Esta acción desactivará al usuario.');
    if (!shouldDelete) return;

    try {
      await api.delete(`/users/${id}`);
      loadAdminEntities();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      setApiError(error.response?.data?.message || 'Error al eliminar usuario.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterMessage('');
    setIsRegisterLoading(true);

    const payload = {
      ...registerForm,
      RoleID: Number(registerForm.RoleID)
    };

    try {
      await api.post('/auth/register', payload);

      setRegisterMessage('Usuario registrado con éxito.');
      setRegisterForm({
        IDNumber: '',
        FirstName: '',
        LastName: '',
        Email: '',
        Password: '',
        PhoneNumber: '',
        RoleID: '1'
      });
      setIsRegisterLoading(false);
      loadAdminEntities();
      if (payload.RoleID === 2) {
        setActiveTab('coaches');
      } else if (payload.RoleID === 1) {
        setActiveTab('members');
      }
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      setRegisterMessage('Error de conexión con el servidor.');
      setIsRegisterLoading(false);
    }
  };

  const currentConfig = entityConfig[activeTab] || {};
  const currentItems = entities[activeTab] || [];
  const lowerSearchQuery = searchQuery.trim().toLowerCase();
  const filteredItems = currentItems.filter(item => {
    if (!lowerSearchQuery) return true;
    return currentConfig.columns.some(column =>
      String(item[column.key] ?? '').toLowerCase().includes(lowerSearchQuery)
    ) || String(item.phone || '').toLowerCase().includes(lowerSearchQuery);
  });

  return (
    <div className={`admin-page ${themeClass} fade-in`} style={{ padding: '20px' }}>
      <div className="settings-main-card" style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="settings-title" style={{ marginBottom: '10px' }}>Panel de Administración</h2>
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Cambiar tema"
            style={{ width: '40px', height: '40px', borderRadius: '10px' }}
          >
            {themeIcon}
          </button>
        </div>
        <p style={{ color: '#8b8593', marginBottom: '30px', fontSize: '15px' }}>
          Administra miembros, entrenadores y métricas del gimnasio con un diseño limpio y coherente con la identidad principal.
        </p>

        {apiError && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{apiError}</div>}

        <div className="admin-nav theme-dark-fix-border" style={{ marginBottom: '24px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{ background: 'transparent', border: 'none', borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent', color: activeTab === tab.id ? '#3b82f6' : '#6b7280', fontWeight: '600', padding: '10px 16px', cursor: 'pointer', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
            >
              <span className="nav-icon" style={{ fontSize: '16px' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="admin-content">
          {activeTab === 'dashboard' ? (
            <div className="tab-content">
              <div className="settings-sub-header">Visión General</div>
              <div className="stats-grid">
                <div className="stat-card stat-card-members" style={{ borderRadius: '16px' }}>
                  <div className="stat-icon stat-icon-members"><FaUsers /></div>
                  <div>
                    <p className="stat-label">Miembros activos</p>
                    <h3>{dashboardSummary.members}</h3>
                  </div>
                </div>
                <div className="stat-card stat-card-coaches" style={{ borderRadius: '16px' }}>
                  <div className="stat-icon stat-icon-coaches"><FaUserTie /></div>
                  <div>
                    <p className="stat-label">Entrenadores</p>
                    <h3>{dashboardSummary.coaches}</h3>
                  </div>
                </div>
                <div className="stat-card stat-card-revenue" style={{ borderRadius: '16px' }}>
                  <div className="stat-icon stat-icon-revenue"><FaDollarSign /></div>
                  <div>
                    <p className="stat-label">Ingresos estimados</p>
                    <h3>${dashboardSummary.estimatedRevenue.toLocaleString()}</h3>
                  </div>
                </div>
                <div className="stat-card stat-card-retention" style={{ borderRadius: '16px' }}>
                  <div className="stat-icon stat-icon-retention"><FaChartLine /></div>
                  <div>
                    <p className="stat-label">Retención</p>
                    <h3>+15%</h3>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'register' ? (
            <div className="tab-content">
              <div className="settings-sub-header">Registrar Nuevo Usuario</div>
              <div style={{ background: '#f8f9fa', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb' }} className="theme-dark-fix-bg">
                {registerMessage && <div style={{ background: registerMessage.includes('Error') ? '#fee2e2' : '#dcfce7', color: registerMessage.includes('Error') ? '#991b1b' : '#166534', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{registerMessage}</div>}
                
                <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>ID Número</label>
                      <input type="text" style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', outline: 'none' }} value={registerForm.IDNumber} onChange={(e) => handleRegisterChange('IDNumber', e.target.value)} required />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Email</label>
                      <input type="email" style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', outline: 'none' }} value={registerForm.Email} onChange={(e) => handleRegisterChange('Email', e.target.value)} required />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Nombre</label>
                      <input type="text" style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', outline: 'none' }} value={registerForm.FirstName} onChange={(e) => handleRegisterChange('FirstName', e.target.value)} required />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Apellido</label>
                      <input type="text" style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', outline: 'none' }} value={registerForm.LastName} onChange={(e) => handleRegisterChange('LastName', e.target.value)} required />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Contraseña</label>
                      <input type="password" style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', outline: 'none' }} value={registerForm.Password} onChange={(e) => handleRegisterChange('Password', e.target.value)} required />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Teléfono</label>
                      <input type="text" style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', outline: 'none' }} value={registerForm.PhoneNumber} onChange={(e) => handleRegisterChange('PhoneNumber', e.target.value)} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Rol</label>
                    <select style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', outline: 'none' }} value={registerForm.RoleID} onChange={(e) => handleRegisterChange('RoleID', e.target.value)}>
                      <option value="1">Miembro</option>
                      <option value="2">Coach</option>
                      <option value="3">Admin</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                    <button type="submit" className="btn-pill-blue" disabled={isRegisterLoading} style={{ padding: '10px 24px' }}>
                      {isRegisterLoading ? 'Registrando...' : 'Registrar usuario'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="tab-content">
              <div className="settings-sub-header">{currentConfig.title} registrados</div>
              <div style={{ marginBottom: '20px' }}>
                <input
                  type="search"
                  style={{ background: '#f4f4f5', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '12px 16px', width: '100%', fontSize: '14px', outline: 'none' }}
                  placeholder={`Buscar ${currentConfig.title.toLowerCase()} por nombre, email o ${currentConfig.title === 'Miembros' ? 'plan' : 'especialidad'}`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="theme-dark-fix-bg theme-dark-fix-text theme-dark-fix-border"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {filteredItems.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#8b8593', background: '#f4f4f5', borderRadius: '16px' }} className="theme-dark-fix-bg">
                    No hay datos registrados.
                  </div>
                ) : (
                  filteredItems.map(item => (
                    <div className="setting-row" key={item.id}>
                      <div className="setting-icon">
                        {activeTab === 'coaches' ? <FaUserTie /> : <FaUsers />}
                      </div>
                      <div className="setting-content">
                        <div className="setting-title">{item.name}</div>
                        <div className="setting-desc">
                          Email: {item.email} • Tel: {item.phone || 'N/A'} • 
                          <strong style={{ color: '#0ea5e9', marginLeft: '4px' }}>
                            {activeTab === 'coaches' ? item.specialty : item.plan}
                          </strong>
                        </div>
                      </div>
                      <div className="setting-action">
                        <button type="button" className="btn-pill-blue" onClick={() => openEditModal(item)} style={{ marginRight: '8px', padding: '6px 12px', fontSize: '13px' }}>
                          Editar
                        </button>
                        <button type="button" className="btn-pill-red" onClick={() => handleDeleteUser(item.id)} style={{ padding: '6px 12px', fontSize: '13px' }}>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {activeTab === 'coaches' && (
                <div style={{ marginTop: '30px' }}>
                  <div className="settings-sub-header">Permisos y Alumnos de Entrenadores</div>
                  <div style={{ background: '#f8f9fa', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb' }} className="theme-dark-fix-bg">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Seleccionar entrenador</label>
                      <select
                        style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', outline: 'none' }}
                        value={permissionForm.coachId}
                        onChange={(e) => {
                          const selected = entities.coaches.find(coach => coach.id.toString() === e.target.value);
                          if (selected) selectCoachForPermissions(selected);
                        }}
                      >
                        <option value="">-- Elige un coach --</option>
                        {entities.coaches.map(coach => (
                          <option key={coach.id} value={coach.id}>{coach.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    {permissionForm.coachId && (
                      <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: '#4b5563' }}>
                            <input type="checkbox" checked={permissionForm.manageRoutines} onChange={(e) => handlePermissionChange('manageRoutines', e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#3b82f6' }} />
                            Editar rutinas de otros entrenadores
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: '#4b5563' }}>
                            <input type="checkbox" checked={permissionForm.managePlans} onChange={(e) => handlePermissionChange('managePlans', e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#3b82f6' }} />
                            Ajustar planes
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: '#4b5563' }}>
                            <input type="checkbox" checked={permissionForm.sendMessages} onChange={(e) => handlePermissionChange('sendMessages', e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#3b82f6' }} />
                            Enviar notificaciones
                          </label>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '12px' }}>Alumnos Asignados</h4>
                          {assignedStudents.length === 0 ? (
                            <p style={{ fontSize: '14px', color: '#9ca3af' }}>Este entrenador no tiene alumnos asignados actualmente.</p>
                          ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {assignedStudents.map(student => (
                                <div key={student.id} style={{ background: '#e0e7ff', color: '#3730a3', padding: '6px 12px', borderRadius: '99px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span>{student.name}</span>
                                  <button type="button" onClick={() => handleRemoveStudent(student.id)} style={{ background: 'transparent', border: 'none', color: '#3730a3', cursor: 'pointer', padding: '0', fontSize: '16px', lineHeight: '1' }}>×</button>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Asignar nuevo alumno:</label>
                            <select 
                              value="" 
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val) handleAddStudent(Number(val));
                              }}
                              style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', outline: 'none' }}
                            >
                              <option value="">-- Selecciona un alumno --</option>
                              {allMembers.filter(member => !assignedStudents.some(s => s.id === member.id)).map(member => (
                                <option key={member.id} value={member.id}>{member.name} {member.coachName ? `(Con: ${member.coachName})` : '(Sin entrenador)'}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <button type="button" className="btn-pill-blue" onClick={handleSaveCoachSettings} disabled={isCoachSaving} style={{ padding: '10px 24px' }}>
                            {isCoachSaving ? 'Guardando...' : 'Guardar Cambios de Entrenador'}
                          </button>
                        </div>
                        {coachSaveMsg && <div style={{ background: coachSaveMsg.includes('Error') ? '#fee2e2' : '#dcfce7', color: coachSaveMsg.includes('Error') ? '#991b1b' : '#166534', padding: '12px', borderRadius: '8px', marginTop: '16px', fontSize: '14px' }}>{coachSaveMsg}</div>}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showEditModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card scale-in" style={{ maxWidth: '500px', background: '#fff', borderRadius: '24px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>Editar usuario</h3>
              <button type="button" onClick={closeEditModal} style={{ background: 'transparent', border: 'none', fontSize: '24px', color: '#9ca3af', cursor: 'pointer' }}>×</button>
            </div>
            {editMessage && <div style={{ background: editMessage.includes('Error') ? '#fee2e2' : '#dcfce7', color: editMessage.includes('Error') ? '#991b1b' : '#166534', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{editMessage}</div>}
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Nombre</label>
                  <input type="text" style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', outline: 'none' }} value={editForm.firstName} onChange={(e) => handleEditChange('firstName', e.target.value)} required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Apellido</label>
                  <input type="text" style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', outline: 'none' }} value={editForm.lastName} onChange={(e) => handleEditChange('lastName', e.target.value)} required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Email</label>
                  <input type="email" style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', outline: 'none' }} value={editForm.email} onChange={(e) => handleEditChange('email', e.target.value)} required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Teléfono</label>
                  <input type="text" style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', outline: 'none' }} value={editForm.phone} onChange={(e) => handleEditChange('phone', e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={closeEditModal} style={{ background: 'transparent', border: '1px solid #d1d5db', borderRadius: '99px', padding: '10px 24px', fontSize: '14px', fontWeight: '600', color: '#4b5563', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit" className="btn-pill-blue" disabled={isEditLoading} style={{ padding: '10px 24px' }}>
                  {isEditLoading ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
