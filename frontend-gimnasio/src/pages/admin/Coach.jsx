import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSettings, FiUserPlus, FiTrash2 } from 'react-icons/fi';

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
        axios.get('http://localhost:5000/api/coaches'),
        axios.get('http://localhost:5000/api/users'), // Assuming /api/users returns all users
        axios.get('http://localhost:5000/api/coaches/assignments')
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
      await axios.put(`http://localhost:5000/api/coaches/${coachId}/permissions`, {
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
      await axios.post(`http://localhost:5000/api/coaches/${selectedCoach.UserID}/assign`, {
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
        await axios.delete(`http://localhost:5000/api/coaches/assign/${memberId}`);
        fetchData();
      } catch (error) {
        console.error('Error al remover alumno:', error);
      }
    }
  };

  return (
    <div className="tab-content fade-in">
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <h2>Edición Avanzada de Entrenadores</h2>
        <p>Administra permisos y asigna alumnos a los entrenadores del gimnasio.</p>
      </div>

      {loading ? (
        <div className="loading-state">Cargando entrenadores...</div>
      ) : (
        <div className="form-grid">
          {coaches.map(coach => (
            <div key={coach.UserID} className="stat-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{coach.FirstName} {coach.LastName}</h3>
                  <span className="stat-label" style={{ fontSize: '0.75rem' }}>{coach.Email}</span>
                </div>
                <div className="stat-icon stat-icon-coaches" style={{ width: '36px', height: '36px', fontSize: '1rem' }}>
                  <FiSettings />
                </div>
              </div>

              <div style={{ background: 'var(--admin-surface-alt)', padding: '12px', borderRadius: '8px', border: '1px solid var(--admin-border)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' }}>
                  <input 
                    type="checkbox" 
                    checked={coach.CanEditOthersRoutines}
                    onChange={() => handleTogglePermission(coach.UserID, coach.CanEditOthersRoutines)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--admin-accent)' }}
                  />
                  Puede editar rutinas de otros entrenadores
                </label>
              </div>

              <div className="students-assignment-section" style={{ marginTop: '0', paddingTop: '8px', borderTop: 'none' }}>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '10px' }}>Alumnos Asignados</h4>
                <div className="assigned-students-list">
                  {assignments.filter(a => a.CoachID === coach.UserID).map(assign => (
                    <div key={assign.MemberID} className="student-tag">
                      {assign.MemberName}
                      <button className="btn-remove-student" onClick={() => handleRemoveAssignment(assign.MemberID)} title="Remover Alumno">
                        <FiTrash2 style={{ fontSize: '0.9rem' }} />
                      </button>
                    </div>
                  ))}
                  {assignments.filter(a => a.CoachID === coach.UserID).length === 0 && (
                    <span className="no-students-msg">Ningún alumno asignado</span>
                  )}
                </div>
                
                <button 
                  className="btn-submit" 
                  style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '8px' }}
                  onClick={() => handleOpenAssignModal(coach)}
                >
                  <FiUserPlus /> Asignar Alumno
                </button>
              </div>
            </div>
          ))}
          {coaches.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--admin-muted)' }}>
              No hay usuarios entrenadores registrados.
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card scale-in" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Asignar a {selectedCoach?.FirstName}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAssignStudent}>
              <div className="form-group">
                <span>Seleccionar Alumno</span>
                <select 
                  value={selectedMember} 
                  onChange={(e) => setSelectedMember(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--admin-border)', background: 'var(--admin-surface)', color: 'var(--admin-text)' }}
                >
                  <option value="">-- Elija un alumno --</option>
                  {members.map(member => (
                    <option key={member.UserID} value={member.UserID}>
                      {member.FirstName} {member.LastName} ({member.Email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-actions" style={{ marginTop: '24px' }}>
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-submit" style={{ marginTop: 0 }}>Asignar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoach;
