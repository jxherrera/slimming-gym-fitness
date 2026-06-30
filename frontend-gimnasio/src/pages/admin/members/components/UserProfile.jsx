import React, { useState, useEffect } from 'react';
import api from '../../../../services/api';
import { useToast } from '../../../../context/ToastContext';
import { FaUser, FaPhone, FaEnvelope, FaDumbbell, FaSave } from 'react-icons/fa';

const UserProfile = ({ user, onUpdateUser }) => {
  const userId = user?.userId;
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [coaches, setCoaches] = useState([]);
  const [assignedCoach, setAssignedCoach] = useState('Cargando...');
  const [selectedCoachId, setSelectedCoachId] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [coachSubmitting, setCoachSubmitting] = useState(false);

  const fetchProfileAndCoaches = async () => {
    if (!userId) return;
    try {
      // 1. Cargar todos los entrenadores
      const coachesRes = await api.get('/users/role/coach');
      if (coachesRes.data.success) {
        setCoaches(coachesRes.data.users || []);
      }

      // 2. Cargar asignación de entrenador
      const assignmentsRes = await api.get('/coaches/assignments');
      const myAssignment = assignmentsRes.data.find((a) => a.MemberID === userId);
      if (myAssignment) {
        setAssignedCoach(myAssignment.CoachName);
        setSelectedCoachId(myAssignment.CoachID);
      } else {
        setAssignedCoach('No asignado');
        setSelectedCoachId('');
      }
    } catch (error) {
      console.error('Error al cargar datos del perfil:', error);
    }
  };

  useEffect(() => {
    fetchProfileAndCoaches();
  }, [userId]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const response = await api.patch(`/users/${userId}`, formData);
      if (response.data.success) {
        addToast('Datos personales actualizados correctamente.', 'success');
        if (onUpdateUser) {
          onUpdateUser({ ...user, ...formData });
        }
      } else {
        addToast(response.data.message || 'Error al actualizar perfil.', 'error');
      }
    } catch (error) {
      console.error('Error al actualizar datos:', error);
      addToast(error.response?.data?.message || 'Error de conexión.', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleCoachAssign = async (e) => {
    e.preventDefault();
    if (!selectedCoachId) {
      addToast('Por favor, selecciona un entrenador.', 'warning');
      return;
    }
    setCoachSubmitting(true);
    try {
      const response = await api.post(`/coaches/${selectedCoachId}/assign`, { MemberID: userId });
      if (response.status === 200 || response.data.success) {
        addToast('Entrenador asignado con éxito.', 'success');
        // Recargar datos de asignación
        const selected = coaches.find((c) => Number(c.id) === Number(selectedCoachId));
        if (selected) {
          setAssignedCoach(selected.name || `${selected.firstName} ${selected.lastName}`);
        }
      } else {
        addToast(response.data.message || 'No se pudo asignar el entrenador.', 'error');
      }
    } catch (error) {
      console.error('Error al asignar entrenador:', error);
      addToast(error.response?.data?.message || 'Error al conectar con la API.', 'error');
    } finally {
      setCoachSubmitting(false);
    }
  };

  return (
    <div className="tab-panel-content fade-in">
      <div className="profile-dashboard-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
        
        {/* Formulario de Datos Personales */}
        <div className="profile-section-card" style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaUser style={{ color: '#ff3b3b' }} /> Datos Personales
          </h3>
          
          <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.6)' }}>Nombre</label>
                <input 
                  type="text" 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', outline: 'none' }}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.6)' }}>Apellido</label>
                <input 
                  type="text" 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', outline: 'none' }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.6)' }}>Correo Electrónico</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', outline: 'none' }}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.6)' }}>Teléfono</label>
              <input 
                type="text" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', outline: 'none' }}
                placeholder="Ej: +54 9 11 5555-5555"
              />
            </div>

            <button 
              type="submit" 
              className="btn-pill-blue"
              disabled={formSubmitting}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 24px', cursor: 'pointer', marginTop: '10px' }}
            >
              <FaSave /> {formSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </form>
        </div>

        {/* Sección: Entrenador Asignado */}
        <div className="profile-section-card" style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaDumbbell style={{ color: '#ff3b3b' }} /> Entrenador Personal
          </h3>

          <div style={{ background: 'rgba(255, 59, 59, 0.03)', border: '1px solid rgba(255, 59, 59, 0.15)', padding: '18px', borderRadius: '12px', marginBottom: '25px' }}>
            <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)', display: 'block', marginBottom: '4px' }}>Entrenador Actual</span>
            <strong style={{ fontSize: '1.2rem', color: '#fff' }}>{assignedCoach}</strong>
          </div>

          <form onSubmit={handleCoachAssign} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.6)' }}>Seleccionar nuevo entrenador</label>
              <select 
                value={selectedCoachId} 
                onChange={(e) => setSelectedCoachId(e.target.value)}
                style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', outline: 'none' }}
                required
              >
                <option value="" style={{ background: '#111' }}>-- Elige tu Entrenador --</option>
                {coaches.map((coach) => (
                  <option key={coach.id} value={coach.id} style={{ background: '#111' }}>
                    {coach.name || `${coach.firstName} ${coach.lastName}`}
                  </option>
                ))}
              </select>
            </div>

            <button 
              type="submit" 
              className="btn-pill-red"
              disabled={coachSubmitting}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 24px', cursor: 'pointer', marginTop: '10px', background: '#ff3b3b', border: '1px solid #ff3b3b', color: '#fff', borderRadius: '25px', fontWeight: '600', transition: 'all 0.3s ease' }}
            >
              <FaDumbbell /> {coachSubmitting ? 'Asignando...' : 'Asignar Entrenador'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default UserProfile;
