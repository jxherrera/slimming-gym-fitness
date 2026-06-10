import React, { useState, useEffect } from 'react';
import './admin.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Admin = () => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '◆' },
    { id: 'coaches', label: 'Entrenadores', icon: '▲' },
    { id: 'members', label: 'Miembros', icon: '■' },
    { id: 'register', label: 'Registrar usuario', icon: '✚' }
  ];

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [entities, setEntities] = useState({
    coaches: [],
    members: []
  });
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

  const themeClass = isDarkMode ? 'theme-dark' : 'theme-light';
  const themeIcon = isDarkMode ? '☀️' : '🌙';

  const loadAdminEntities = async () => {
    try {
      const [coachesRes, membersRes] = await Promise.all([
        fetch(`${API_BASE}/users/role/coach`),
        fetch(`${API_BASE}/users/role/member`)
      ]);

      if (!coachesRes.ok || !membersRes.ok) {
        throw new Error('No se pudo cargar la información del panel administrativo.');
      }

      const [coachesData, membersData] = await Promise.all([
        coachesRes.json(),
        membersRes.json()
      ]);

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

  useEffect(() => {
    const root = document.body;
    if (isDarkMode) {
      root.classList.add('theme-dark');
      root.classList.remove('theme-light');
    } else {
      root.classList.remove('theme-dark');
      root.classList.add('theme-light');
    }
    return () => {
      root.classList.remove('theme-dark');
      root.classList.remove('theme-light');
    };
  }, [isDarkMode]);

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

  const selectCoachForPermissions = (coach) => {
    setPermissionForm(prev => ({
      ...prev,
      coachId: coach.id,
      coachName: coach.name,
      manageRoutines: false,
      managePlans: false,
      sendMessages: false
    }));
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
      const response = await fetch(`${API_BASE}/users/${editForm.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        idNumber: editForm.idNumber,
        })
      });

      const data = await response.json();
      if (!response.ok) {
        setEditMessage(data.message || 'No se pudo actualizar el usuario.');
        setIsEditLoading(false);
        return;
      }

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
      const response = await fetch(`${API_BASE}/users/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (!response.ok) {
        setApiError(data.message || 'No se pudo eliminar el usuario.');
        return;
      }

      loadAdminEntities();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      setApiError('Error de conexión con el servidor.');
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
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        setRegisterMessage(data.message || 'Error al registrar el usuario.');
        setIsRegisterLoading(false);
        return;
      }

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
    <div className={`admin-page ${themeClass}`}>
      <button
        type="button"
        className="theme-toggle theme-toggle-outside"
        onClick={() => setIsDarkMode(prev => !prev)}
        aria-label="Cambiar tema"
      >
        {themeIcon}
      </button>

      <div className="admin-header">
        <div className="header-content">
          <p className="eyebrow">Panel de Administración</p>
          <h1>Control formal y seguro</h1>
          <p>Administra miembros, entrenadores y métricas del gimnasio con un diseño limpio y coherente con la identidad principal.</p>
          {apiError && <div className="admin-alert">{apiError}</div>}
        </div>
      </div>

      <div className="admin-nav">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="nav-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="admin-content">
        {activeTab === 'dashboard' ? (
          <div className="tab-content">
            <h2>Visión general</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">■</div>
                <div>
                  <p className="stat-label">Miembros activos</p>
                  <h3>{entities.members.length}</h3>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">▲</div>
                <div>
                  <p className="stat-label">Entrenadores</p>
                  <h3>{entities.coaches.length}</h3>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">◆</div>
                <div>
                  <p className="stat-label">Ingresos estimados</p>
                  <h3>${(entities.members.length * 50).toLocaleString()}</h3>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">▬</div>
                <div>
                  <p className="stat-label">Retención</p>
                  <h3>+15%</h3>
                </div>
              </div>
            </div>
            <div className="dashboard-info">
              <p>Bienvenido al panel administrativo. Aquí puedes revisar entrenadores, miembros y registrar nuevos usuarios con datos completos.</p>
            </div>
          </div>
        ) : activeTab === 'register' ? (
          <div className="tab-content">
            <h2>Registrar Usuario</h2>
            <div className="form-section">
              <div className="section-header">
                <h3>Nuevo usuario</h3>
                <p>Completa el formulario para crear un usuario con rol, correo y contraseña.</p>
              </div>
              <form onSubmit={handleRegisterSubmit}>
                <div className="form-grid">
                  <label className="form-group">
                    <span>ID Número:</span>
                    <input
                      type="text"
                      placeholder="ID número"
                      value={registerForm.IDNumber}
                      onChange={(e) => handleRegisterChange('IDNumber', e.target.value)}
                      required
                    />
                  </label>
                  <label className="form-group">
                    <span>Nombre:</span>
                    <input
                      type="text"
                      placeholder="Nombre"
                      value={registerForm.FirstName}
                      onChange={(e) => handleRegisterChange('FirstName', e.target.value)}
                      required
                    />
                  </label>
                  <label className="form-group">
                    <span>Apellido:</span>
                    <input
                      type="text"
                      placeholder="Apellido"
                      value={registerForm.LastName}
                      onChange={(e) => handleRegisterChange('LastName', e.target.value)}
                      required
                    />
                  </label>
                  <label className="form-group">
                    <span>Email:</span>
                    <input
                      type="email"
                      placeholder="Correo electrónico"
                      value={registerForm.Email}
                      onChange={(e) => handleRegisterChange('Email', e.target.value)}
                      required
                    />
                  </label>
                  <label className="form-group">
                    <span>Contraseña:</span>
                    <input
                      type="password"
                      placeholder="Contraseña"
                      value={registerForm.Password}
                      onChange={(e) => handleRegisterChange('Password', e.target.value)}
                      required
                    />
                  </label>
                  <label className="form-group">
                    <span>Teléfono:</span>
                    <input
                      type="text"
                      placeholder="Teléfono"
                      value={registerForm.PhoneNumber}
                      onChange={(e) => handleRegisterChange('PhoneNumber', e.target.value)}
                    />
                  </label>
                  <label className="form-group">
                    <span>Rol:</span>
                    <select
                      value={registerForm.RoleID}
                      onChange={(e) => handleRegisterChange('RoleID', e.target.value)}
                    >
                      <option value="1">Miembro</option>
                      <option value="2">Coach</option>
                      <option value="3">Admin</option>
                    </select>
                  </label>
                </div>
                <button type="submit" className="btn-submit" disabled={isRegisterLoading}>
                  {isRegisterLoading ? 'Registrando...' : 'Registrar usuario'}
                </button>
                {registerMessage && <p className="message-box">{registerMessage}</p>}
              </form>
            </div>
          </div>
        ) : (
          <div className="tab-content">
            <h2>{currentConfig.title}</h2>
            <div className="table-section">
              <div className="section-header">
                <h3>{currentConfig.title} registrados</h3>
                <p>Revisa, edita y elimina miembros o entrenadores directamente desde las acciones.</p>
              </div>
              <div className="table-actions">
                <label className="search-bar">
                  <span>Buscar {currentConfig.title.toLowerCase()}</span>
                  <input
                    type="search"
                    placeholder={`Buscar ${currentConfig.title.toLowerCase()} por nombre, email o ${currentConfig.title === 'Miembros' ? 'plan' : 'especialidad'}`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </label>
              </div>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      {currentConfig.columns.map(column => (
                        <th key={column.key}>{column.label}</th>
                      ))}
                      {(activeTab === 'coaches' || activeTab === 'members') && <th>Acciones</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan={currentConfig.columns.length + (activeTab === 'coaches' || activeTab === 'members' ? 1 : 0)} className="empty-row">
                          No hay datos registrados.
                        </td>
                      </tr>
                    ) : (
                      filteredItems.map(item => (
                        <tr key={item.id}>
                          {currentConfig.columns.map(column => (
                            <td key={column.key}>
                              {column.badge ? <span className="badge">{item[column.key]}</span> : item[column.key]}
                            </td>
                          ))}
                          {(activeTab === 'coaches' || activeTab === 'members') && (
                            <td className="actions-cell">
                              <button type="button" className="btn-edit" onClick={() => openEditModal(item)}>
                                Editar
                              </button>
                              <button type="button" className="btn-delete" onClick={() => handleDeleteUser(item.id)}>
                                Eliminar
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {activeTab === 'coaches' && (
              <div className="permission-panel">
                <div className="section-header">
                  <h3>Permisos de entrenadores</h3>
                  <p>Comienza a configurar permisos por entrenador antes de agregar acciones adicionales.</p>
                </div>
                <div className="permission-form">
                  <div className="permission-select">
                    <label>
                      Seleccionar entrenador
                      <select
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
                    </label>
                  </div>
                  <div className="permission-checkboxes">
                    <label>
                      <input
                        type="checkbox"
                        checked={permissionForm.manageRoutines}
                        onChange={(e) => handlePermissionChange('manageRoutines', e.target.checked)}
                      />
                      Gestionar rutinas
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={permissionForm.managePlans}
                        onChange={(e) => handlePermissionChange('managePlans', e.target.checked)}
                      />
                      Ajustar planes
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={permissionForm.sendMessages}
                        onChange={(e) => handlePermissionChange('sendMessages', e.target.checked)}
                      />
                      Enviar notificaciones
                    </label>
                  </div>
                  <div className="permission-note">
                    <p>Este panel es un comienzo para administrar permisos de entrenadores. Guardar aquí aún no modifica el backend, pero ya puedes usarlo como prototipo visual.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showEditModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Editar usuario</h3>
              <button type="button" className="modal-close" onClick={closeEditModal} aria-label="Cerrar">
                ×
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="form-grid modal-grid">
                <label className="form-group">
                  <span>Nombre</span>
                  <input
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) => handleEditChange('firstName', e.target.value)}
                    required
                  />
                </label>
                <label className="form-group">
                  <span>Apellido</span>
                  <input
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) => handleEditChange('lastName', e.target.value)}
                    required
                  />
                </label>
                <label className="form-group">
                  <span>Email</span>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => handleEditChange('email', e.target.value)}
                    required
                  />
                </label>
                <label className="form-group">
                  <span>Teléfono</span>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => handleEditChange('phone', e.target.value)}
                  />
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeEditModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit" disabled={isEditLoading}>
                  {isEditLoading ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
              {editMessage && <p className="message-box">{editMessage}</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
