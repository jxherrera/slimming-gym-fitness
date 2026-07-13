import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaPaperPlane, FaUserFriends, FaUser, FaSearch } from 'react-icons/fa';
import api from '../../../services/api';
import { useToast } from '../../../hooks/useToast';
import './AdminCorreos.css';

const AdminCorreos = () => {
  const toast = useToast();
  const [recipientType, setRecipientType] = useState('all'); // 'all', 'role', 'specific'
  const [selectedRole, setSelectedRole] = useState('member'); // 'admin', 'coach', 'member'
  const [selectedUserId, setSelectedUserId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  useEffect(() => {
    if (recipientType === 'specific' && users.length === 0) {
      fetchUsers();
    }
  }, [recipientType]);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await api.get('/emails/users');
      if (response.data.success) {
        setUsers(response.data.users);
        setFilteredUsers(response.data.users);
      }
    } catch (error) {
      toast.error('Error al cargar la lista de usuarios');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleSearchUser = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    if (term.trim() === '') {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(users.filter(u => 
        u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
      ));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) {
      toast.error('Por favor completa el asunto y el mensaje.');
      return;
    }
    
    if (recipientType === 'specific' && !selectedUserId) {
      toast.error('Por favor selecciona un usuario.');
      return;
    }

    setIsSending(true);

    try {
      const response = await api.post('/emails/send-admin', {
        recipientType,
        role: recipientType === 'role' ? selectedRole : undefined,
        userId: recipientType === 'specific' ? parseInt(selectedUserId) : undefined,
        subject,
        body
      });

      if (response.data.success) {
        toast.success(response.data.message || 'Correos enviados exitosamente');
        setSubject('');
        setBody('');
      } else {
        toast.error(response.data.message || 'Error al enviar correos');
      }
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || 'Error al enviar correos. Verifica tu conexión.';
      toast.error(errorMsg);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="admin-correos-container fade-in">
      <div className="page-header">
        <div className="header-icon-title">
          <FaEnvelope className="header-icon" />
          <h1>Panel de Correos</h1>
        </div>
        <p className="header-description">
          Envía notificaciones, avisos y mensajes personalizados a los miembros del gimnasio.
        </p>
      </div>

      <div className="correos-content">
        <form className="email-form" onSubmit={handleSubmit}>
          
          <div className="form-section">
            <h3 className="section-title">1. Destinatarios</h3>
            <div className="form-group recipient-type-group">
              <label>Enviar a:</label>
              <div className="radio-buttons-container">
                <label className={`radio-btn ${recipientType === 'all' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="recipientType"
                    value="all"
                    checked={recipientType === 'all'}
                    onChange={(e) => setRecipientType(e.target.value)}
                  />
                  <FaUserFriends /> Todos
                </label>
                <label className={`radio-btn ${recipientType === 'role' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="recipientType"
                    value="role"
                    checked={recipientType === 'role'}
                    onChange={(e) => setRecipientType(e.target.value)}
                  />
                  <FaUserFriends /> Por Rol
                </label>
                <label className={`radio-btn ${recipientType === 'specific' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="recipientType"
                    value="specific"
                    checked={recipientType === 'specific'}
                    onChange={(e) => setRecipientType(e.target.value)}
                  />
                  <FaUser /> Específico
                </label>
              </div>
            </div>

            {recipientType === 'role' && (
              <div className="form-group fade-in-up">
                <label htmlFor="roleSelect">Selecciona el rol:</label>
                <select 
                  id="roleSelect"
                  className="form-control"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option value="member">Socios</option>
                  <option value="coach">Entrenadores</option>
                  <option value="admin">Administradores</option>
                </select>
              </div>
            )}

            {recipientType === 'specific' && (
              <div className="form-group fade-in-up">
                <label>Buscar y Seleccionar Usuario:</label>
                <div className="search-user-wrapper">
                  <div className="search-input-container">
                    <FaSearch className="search-icon" />
                    <input 
                      type="text" 
                      className="form-control search-input" 
                      placeholder="Buscar por nombre o correo..." 
                      value={searchTerm}
                      onChange={handleSearchUser}
                    />
                  </div>
                  
                  {isLoadingUsers ? (
                    <div className="loading-users">Cargando usuarios...</div>
                  ) : (
                    <div className="users-list-dropdown">
                      {filteredUsers.length > 0 ? (
                        <select
                          className="form-control user-select"
                          value={selectedUserId}
                          onChange={(e) => setSelectedUserId(e.target.value)}
                          size="5"
                        >
                          <option value="" disabled>Seleccione un usuario de la lista</option>
                          {filteredUsers.map(u => (
                            <option key={u.id} value={u.id}>
                              {u.name} ({u.email}) - {u.roleName}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="no-users-found">No se encontraron usuarios</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="form-section">
            <h3 className="section-title">2. Contenido del Mensaje</h3>
            
            <div className="form-group">
              <label htmlFor="subject">Asunto:</label>
              <input
                type="text"
                id="subject"
                className="form-control"
                placeholder="Ej. Cambio de horarios por feriado"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="body">Mensaje:</label>
              <textarea
                id="body"
                className="form-control message-textarea"
                placeholder="Escribe el contenido de tu correo aquí..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows="8"
                required
              ></textarea>
              <small className="help-text">El mensaje se enviará con una plantilla predefinida y los saltos de línea se respetarán.</small>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary btn-submit"
              disabled={isSending}
            >
              {isSending ? (
                <>Enviando... <div className="spinner-small"></div></>
              ) : (
                <><FaPaperPlane /> Enviar Correo</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCorreos;
