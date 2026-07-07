import React, { useState, useEffect } from 'react';
import { FaUser, FaIdCard, FaEnvelope, FaPhone, FaDumbbell, FaSave, FaUserCheck, FaCalendarAlt, FaClock, FaSyncAlt, FaKey } from 'react-icons/fa';
import Modal from '../common/Modal';
import { scheduleService } from '../../services/scheduleService';
import { memberService } from '../../services/memberService';
import { useToast } from '../../hooks/useToast';
import './UserProfile.css';

const UserProfile = ({ user, onUpdateSuccess }) => {
  const toast = useToast();
  const userId = user?.userId || user?.id;

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || user?.phone || '',
    idNumber: user?.idNumber || user?.IDNumber || ''
  });

  const [coaches, setCoaches] = useState([]);
  const [selectedCoachId, setSelectedCoachId] = useState('');
  const [assignedCoach, setAssignedCoach] = useState(null);
  const [loadingCoaches, setLoadingCoaches] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [coachSchedules, setCoachSchedules] = useState([]);
  const [coachClasses, setCoachClasses] = useState([]);
  const [isChangingCoach, setIsChangingCoach] = useState(false);
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || user.phone || '',
        idNumber: user.idNumber || user.IDNumber || ''
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        setLoadingCoaches(true);
        const data = await memberService.getCoaches();
        const list = Array.isArray(data) ? data : (data.coaches || []);
        setCoaches(list);

        // Buscar si hay un entrenador asignado en la base de datos
        try {
          const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
          const assignRes = await fetch(`${apiBase}/coaches/assignments`);
          if (assignRes.ok) {
            const assignData = await assignRes.json();
            const myAssignment = Array.isArray(assignData) ? assignData.find(a => String(a.MemberID) === String(userId)) : null;
            if (myAssignment) {
              const current = list.find(c => String(c.UserID || c.id) === String(myAssignment.CoachID));
              if (current) setAssignedCoach(current);
            }
          }
        } catch (err) {
          console.error("Error obteniendo asignaciones", err);
        }

        if (!assignedCoach && (user?.coachId || user?.assignedCoach)) {
          const current = list.find(c => c.UserID === user.coachId || c.id === user.coachId);
          if (current) setAssignedCoach(current);
        }
      } catch (e) {
        console.error('Error al obtener entrenadores:', e);
      } finally {
        setLoadingCoaches(false);
      }
    };

    fetchCoaches();
  }, [user]);

  useEffect(() => {
    if (assignedCoach && !isChangingCoach) {
      const fetchCoachData = async () => {
        try {
           const [schedules, classes] = await Promise.all([
             scheduleService.getCoachSchedules(),
             scheduleService.getClasses()
           ]);
           
           const coachIdStr = String(assignedCoach.UserID || assignedCoach.id);
           const coachNameStr = `${assignedCoach.FirstName || assignedCoach.firstName} ${assignedCoach.LastName || assignedCoach.lastName}`;
           
           const mySchedules = schedules.filter(s => String(s.coachId) === coachIdStr);
           const myClasses = classes.filter(c => c.instructor === coachNameStr);
           
           setCoachSchedules(mySchedules);
           setCoachClasses(myClasses);
        } catch (e) {
          console.error('Error fetching coach schedules and classes', e);
        }
      };
      fetchCoachData();
    }
  }, [assignedCoach, isChangingCoach]);

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      await memberService.updateProfile(userId, {
        FirstName: formData.firstName,
        LastName: formData.lastName,
        PhoneNumber: formData.phoneNumber
      });
      toast.success('Perfil actualizado correctamente.');
      if (onUpdateSuccess) onUpdateSuccess();
    } catch (e) {
      console.error('Error actualizando perfil:', e);
      toast.error('Error al actualizar datos personales.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssignCoach = async () => {
    if (!selectedCoachId) {
      toast.warning('Selecciona un entrenador de la lista.');
      return;
    }
    try {
      await memberService.assignCoach(selectedCoachId, userId);
      toast.success('Solicitud de entrenador enviada exitosamente.');
      const coachObj = coaches.find(c => String(c.UserID || c.id) === String(selectedCoachId));
      if (coachObj) {
        setAssignedCoach(coachObj);
        setIsChangingCoach(false);
      }
    } catch (e) {
      console.error('Error asignando entrenador:', e);
      toast.error('Ocurrió un error al vincular entrenador.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      toast.error('Las contraseñas nuevas no coinciden.');
      return;
    }
    try {
      setIsChangingPassword(true);
      await memberService.changePassword(userId, passwordData.current, passwordData.new);
      toast.success('Contraseña actualizada correctamente.');
      setShowPasswordModal(false);
      setPasswordData({ current: '', new: '', confirm: '' });
    } catch (e) {
      console.error('Error al cambiar contraseña:', e);
      toast.error(e.response?.data?.message || 'Error al cambiar la contraseña.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-grid">
        {/* Tarjeta 1: Datos Personales */}
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar-circle">
              <FaUser />
            </div>
            <div>
              <h3>{formData.firstName} {formData.lastName}</h3>
              <span className="profile-role-badge">Socio Activo</span>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="profile-form">
            <div className="form-group">
              <label><FaIdCard /> Número de Identificación (DNI / Cédula)</label>
              <input
                type="text"
                className="profile-input disabled"
                value={formData.idNumber}
                disabled
              />
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label>Nombre</label>
                <input
                  type="text"
                  name="firstName"
                  className="profile-input"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group flex-1">
                <label>Apellido</label>
                <input
                  type="text"
                  name="lastName"
                  className="profile-input"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label><FaEnvelope /> Correo Electrónico</label>
              <input
                type="email"
                className="profile-input disabled"
                value={formData.email}
                disabled
              />
            </div>

            <div className="form-group">
              <label><FaPhone /> Teléfono / WhatsApp</label>
              <input
                type="text"
                name="phoneNumber"
                className="profile-input"
                value={formData.phoneNumber}
                onChange={handleInputChange}
              />
            </div>

            <div className="profile-actions" style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button type="submit" className="profile-save-btn" disabled={isUpdating} style={{ flex: 1, margin: 0 }}>
                <FaSave /> {isUpdating ? 'Guardando...' : 'Actualizar'}
              </button>
              <button type="button" className="profile-save-btn" style={{ flex: 1, margin: 0, background: '#444' }} onClick={() => setShowPasswordModal(true)}>
                <FaKey /> Contraseña
              </button>
            </div>
          </form>
        </div>

        {/* Tarjeta 2: Asignación de Entrenador */}
        <div className="profile-card coach-section">
          <div className="profile-header">
            <div className="coach-avatar-circle">
              <FaDumbbell />
            </div>
            <div>
              <h3>Entrenador Personal</h3>
              <p className="profile-subtext">Tu guía en rutinas y metas físicas.</p>
            </div>
          </div>

          {assignedCoach && !isChangingCoach ? (
            <div className="assigned-coach-box">
              <div className="coach-info-wrapper" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div className="coach-info">
                  <FaUserCheck className="check-icon" />
                  <div>
                    <h4>{assignedCoach.FirstName || assignedCoach.firstName} {assignedCoach.LastName || assignedCoach.lastName}</h4>
                    <p>Especialista en Acondicionamiento Físico y Musculación</p>
                  </div>
                </div>
                <div className="coach-status-tag">Asignado</div>
              </div>

              <div className="coach-details-section">
                <div className="schedule-list">
                  <h5><FaClock /> Horario de Trabajo</h5>
                  {coachSchedules.length > 0 ? (
                    <ul>
                      {coachSchedules.map((s, idx) => {
                        const st = s.startTime.split('T')[1]?.substring(0, 5) || s.startTime;
                        const et = s.endTime.split('T')[1]?.substring(0, 5) || s.endTime;
                        return (
                          <li key={idx}><strong>{s.dayOfWeek}:</strong> {st} - {et}</li>
                        )
                      })}
                    </ul>
                  ) : (
                    <p className="no-data-text">Sin horarios definidos.</p>
                  )}
                </div>

                <div className="classes-list">
                  <h5><FaCalendarAlt /> Clases a Cargo</h5>
                  {coachClasses.length > 0 ? (
                    <ul>
                      {coachClasses.map(c => (
                        <li key={c.id}>
                          <strong>{c.name}</strong> - {c.day} {c.time}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="no-data-text">Sin clases asignadas.</p>
                  )}
                </div>
              </div>

              <button className="assign-btn secondary" onClick={() => setIsChangingCoach(true)} style={{ marginTop: '20px', backgroundColor: '#333' }}>
                <FaSyncAlt /> Cambiar Entrenador
              </button>
            </div>
          ) : (
            <div className="assign-coach-box">
              <p>{assignedCoach ? 'Selecciona a tu nuevo entrenador:' : 'No tienes un entrenador asignado en este momento. Selecciona uno del equipo profesional de Slimming Gym:'}</p>

              <div className="form-group">
                <select
                  className="profile-input"
                  value={selectedCoachId}
                  onChange={(e) => setSelectedCoachId(e.target.value)}
                  disabled={loadingCoaches}
                >
                  <option value="">-- Seleccionar Entrenador --</option>
                  {coaches.map(coach => (
                    <option key={coach.UserID || coach.id} value={coach.UserID || coach.id}>
                      Coach {coach.FirstName || coach.firstName} {coach.LastName || coach.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="assign-btn"
                  onClick={handleAssignCoach}
                  disabled={!selectedCoachId}
                >
                  <FaDumbbell /> {assignedCoach ? 'Confirmar Cambio' : 'Solicitar Entrenador'}
                </button>
                {assignedCoach && (
                  <button
                    type="button"
                    className="assign-btn"
                    style={{ backgroundColor: '#555', color: '#fff' }}
                    onClick={() => { setIsChangingCoach(false); setSelectedCoachId(''); }}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Cambiar Contraseña"
      >
        <form onSubmit={handleChangePassword} className="profile-form">
          <div className="form-group">
            <label>Contraseña Actual</label>
            <input
              type="password"
              className="profile-input"
              value={passwordData.current}
              onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Nueva Contraseña</label>
            <input
              type="password"
              className="profile-input"
              value={passwordData.new}
              onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Confirmar Nueva Contraseña</label>
            <input
              type="password"
              className="profile-input"
              value={passwordData.confirm}
              onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="profile-save-btn" disabled={isChangingPassword} style={{ marginTop: '15px' }}>
            {isChangingPassword ? 'Cambiando...' : 'Guardar Contraseña'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default UserProfile;
