import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { FiPlus, FiCalendar, FiClock, FiUsers, FiUser } from 'react-icons/fi';
import '../shared/admin-core.css';

const AdminClases = () => {
  const [classes, setClasses] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [form, setForm] = useState({ ClassName: '', Description: '', CoachID: '', MaxCapacity: 20, StartTime: '', EndTime: '' });
  const [message, setMessage] = useState('');

  const loadData = async () => {
    try {
      const [classRes, coachRes] = await Promise.all([
        api.get('/classes'),
        api.get('/users/role/coach')
      ]);
      if (classRes.data.success) setClasses(classRes.data.classes);
      if (coachRes.data.success) setCoaches(coachRes.data.users);
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await api.post('/classes', form);
      if (response.data.success) {
        setMessage('Clase creada exitosamente.');
        setForm({ ClassName: '', Description: '', CoachID: '', MaxCapacity: 20, StartTime: '', EndTime: '' });
        loadData();
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error al crear la clase');
    }
  };

  return (
    <div className="admin-page fade-in" style={{ padding: '20px' }}>
      <div className="settings-main-card" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 className="settings-title">Gestión de Clases Grupales</h2>
        <p style={{ color: '#8b8593', marginBottom: '30px' }}>Programa nuevas clases y revisa la agenda de sesiones grupales.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
          
          <div style={{ background: '#f8f9fa', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb' }} className="theme-dark-fix-bg">
            <div className="settings-sub-header" style={{ marginBottom: '20px' }}>Programar Clase</div>
            {message && (
              <div style={{ background: message.includes('Error') ? '#fee2e2' : '#dcfce7', color: message.includes('Error') ? '#991b1b' : '#166534', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                {message}
              </div>
            )}
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Nombre de la Clase</label>
                <input type="text" placeholder="Ej: Yoga Avanzado" value={form.ClassName} onChange={e => handleChange('ClassName', e.target.value)} required style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', outline: 'none' }} />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Descripción</label>
                <textarea placeholder="Descripción breve..." value={form.Description} onChange={e => handleChange('Description', e.target.value)} style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', outline: 'none', resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Entrenador</label>
                <select value={form.CoachID} onChange={e => handleChange('CoachID', e.target.value)} required style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', outline: 'none' }}>
                  <option value="">Selecciona un Entrenador</option>
                  {coaches.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Capacidad Máxima</label>
                <input type="number" placeholder="Ej: 20" value={form.MaxCapacity} onChange={e => handleChange('MaxCapacity', e.target.value)} required style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', outline: 'none' }} />
              </div>
              
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Inicio</label>
                  <input type="datetime-local" value={form.StartTime} onChange={e => handleChange('StartTime', e.target.value)} required style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Fin</label>
                  <input type="datetime-local" value={form.EndTime} onChange={e => handleChange('EndTime', e.target.value)} required style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', outline: 'none' }} />
                </div>
              </div>
              
              <button type="submit" className="btn-pill-blue" style={{ padding: '12px', marginTop: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                <FiPlus /> Crear Clase
              </button>
            </form>
          </div>

          <div>
            <div className="settings-sub-header" style={{ marginTop: '0' }}>Agenda de Clases</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {classes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#8b8593', background: '#f4f4f5', borderRadius: '16px' }} className="theme-dark-fix-bg">
                  No hay clases programadas.
                </div>
              ) : classes.map(c => (
                <div className="setting-row" key={c.ClassID}>
                  <div className="setting-icon">
                    <FiCalendar />
                  </div>
                  
                  <div className="setting-content">
                    <div className="setting-title">{c.ClassName}</div>
                    <div className="setting-desc" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FiUser style={{ color: '#8b8593' }} /> Coach: <strong style={{ color: '#4b5563' }} className="theme-dark-fix-text">{c.CoachName}</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FiClock style={{ color: '#8b8593' }} /> {new Date(c.StartTime).toLocaleString()} - {new Date(c.EndTime).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>

                  <div className="setting-action">
                    <span style={{ 
                      background: c.CurrentEnrollment >= c.MaxCapacity ? '#fee2e2' : '#dcfce7', 
                      color: c.CurrentEnrollment >= c.MaxCapacity ? '#991b1b' : '#166534', 
                      padding: '6px 12px', 
                      borderRadius: '20px', 
                      fontSize: '13px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <FiUsers /> {c.CurrentEnrollment} / {c.MaxCapacity} cupos
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default AdminClases;
