import React, { useState, useEffect } from 'react';
import { FaUser, FaIdCard, FaEnvelope, FaPhone, FaDumbbell, FaSave, FaUserCheck } from 'react-icons/fa';
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
      if (coachObj) setAssignedCoach(coachObj);
    } catch (e) {
      console.error('Error asignando entrenador:', e);
      toast.error('Ocurrió un error al vincular entrenador.');
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

            <button type="submit" className="profile-save-btn" disabled={isUpdating}>
              <FaSave /> {isUpdating ? 'Guardando...' : 'Actualizar Mis Datos'}
            </button>
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

          {assignedCoach ? (
            <div className="assigned-coach-box">
              <div className="coach-info">
                <FaUserCheck className="check-icon" />
                <div>
                  <h4>{assignedCoach.FirstName || assignedCoach.firstName} {assignedCoach.LastName || assignedCoach.lastName}</h4>
                  <p>Especialista en Acondicionamiento Físico y Musculación</p>
                </div>
              </div>
              <div className="coach-status-tag">Asignado</div>
            </div>
          ) : (
            <div className="assign-coach-box">
              <p>No tienes un entrenador asignado en este momento. Selecciona uno del equipo profesional de Slimming Gym:</p>

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

              <button
                type="button"
                className="assign-btn"
                onClick={handleAssignCoach}
                disabled={!selectedCoachId}
              >
                <FaDumbbell /> Solicitar Entrenador
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
