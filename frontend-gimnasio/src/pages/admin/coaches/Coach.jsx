import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { FiSettings, FiUserPlus, FiTrash2, FiUserCheck } from 'react-icons/fi';
import '../shared/admin-core.css';

const AdminCoach = () => {
  const [coaches, setCoaches] = useState([]);
  const [members, setMembers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coachesRes, membersRes, assignRes] = await Promise.all([
        api.get('/coaches'),
        api.get('/users'), // Assuming /api/users returns all users
        api.get('/coaches/assignments')
      ]);
      setCoaches(coachesRes.data);
      setMembers(membersRes.data.users || membersRes.data || []);
      setAssignments(assignRes.data);
    } catch (error) {
      console.error('Error fetching coach data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTogglePermission = async (coachId, currentValue) => {
    try {
      await api.put(`/coaches/${coachId}/permissions`, {
        CanEditOthersRoutines: !currentValue
      });
      fetchData();
    } catch (error) {
      console.error('Error al actualizar permisos:', error);
    }
  };

  const handleOpenAssignModal = (coach) => {
    setSelectedCoach(coach);
    setSelectedMember('');
    setShowModal(true);
  };

  const handleAssignStudent = async (e) => {
    e.preventDefault();
    if (!selectedMember) return;
    try {
      await api.post(`/coaches/${selectedCoach.UserID}/assign`, {
        MemberID: selectedMember
      });
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error('Error al asignar alumno:', error);
      alert('Error al asignar alumno.');
    }
  };

  const handleRemoveAssignment = async (memberId) => {
    if (window.confirm('¿Deseas remover este alumno del entrenador?')) {
      try {
        await api.delete(`/coaches/assign/${memberId}`);
        fetchData();
      } catch (error) {
        console.error('Error al remover alumno:', error);
      }
    }
  };

  return (
    <div className="admin-page fade-in">
      <div className="settings-main-card">
        <h2 className="settings-title">Edición Avanzada de Entrenadores</h2>
        <p style={{ color: '#8b8593', marginBottom: '30px' }}>Administra permisos y asigna alumnos a los entrenadores del gimnasio.</p>

        <div className="settings-sub-header">Lista de Entrenadores</div>

        {loading ? (
          <div style={{ padding: '20px', color: '#8b8593' }}>Cargando entrenadores...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' }}>
            {coaches.map(coach => (
              <div key={coach.UserID} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }} className="theme-dark-fix-bg">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div className="setting-icon success" style={{ margin: 0 }}>
                    <FiUserCheck />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 4px 0', color: '#111827' }} className="theme-dark-fix-text">{coach.FirstName} {coach.LastName}</h3>
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>{coach.Email}</span>
                  </div>
                </div>

                <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#374151' }} className="theme-dark-fix-text">
                    <input 
                      type="checkbox" 
                      checked={coach.CanEditOthersRoutines}
                      onChange={() => handleTogglePermission(coach.UserID, coach.CanEditOthersRoutines)}
                      style={{ width: '18px', height: '18px', accentColor: '#3b82f6' }}
                    />
                    Puede editar rutinas de otros entrenadores
                  </label>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#4b5563', margin: 0 }} className="theme-dark-fix-text">Alumnos Asignados</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {assignments.filter(a => a.CoachID === coach.UserID).map(assign => (
                      <div key={assign.MemberID} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#e0e7ff', color: '#4338ca', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '500' }}>
                        {assign.MemberName}
                        <button onClick={() => handleRemoveAssignment(assign.MemberID)} title="Remover Alumno" style={{ background: 'transparent', border: 'none', color: '#4338ca', cursor: 'pointer', padding: '0', display: 'flex' }}>
                          <FiTrash2 style={{ fontSize: '14px' }} />
                        </button>
                      </div>
                    ))}
                    {assignments.filter(a => a.CoachID === coach.UserID).length === 0 && (
                      <span style={{ fontSize: '13px', color: '#9ca3af', fontStyle: 'italic' }}>Ningún alumno asignado</span>
                    )}
                  </div>
                  
                  <button 
                    className="btn-pill-blue" 
                    style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '10px', marginTop: '8px' }}
                    onClick={() => handleOpenAssignModal(coach)}
                  >
                    <FiUserPlus /> Asignar Alumno
                  </button>
                </div>
              </div>
            ))}
            {coaches.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#8b8593', background: '#f4f4f5', borderRadius: '16px' }}>
                No hay usuarios entrenadores registrados.
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card scale-in" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Asignar a {selectedCoach?.FirstName}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAssignStudent} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Seleccionar Alumno</label>
                <select 
                  value={selectedMember} 
                  onChange={(e) => setSelectedMember(e.target.value)}
                  required
                  style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', outline: 'none' }}
                >
                  <option value="">-- Elija un alumno --</option>
                  {members.map(member => (
                    <option key={member.UserID} value={member.UserID}>
                      {member.FirstName} {member.LastName} ({member.Email})
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', color: '#374151', cursor: 'pointer', fontWeight: '500' }}>
                  Cancelar
                </button>
                <button type="submit" className="btn-pill-blue" style={{ padding: '10px 20px' }}>
                  Asignar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoach;
