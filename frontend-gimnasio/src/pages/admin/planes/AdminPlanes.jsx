import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { FiPlus, FiEdit2, FiArchive, FiCheckCircle, FiLayers } from 'react-icons/fi';
import '../shared/admin-core.css';

const AdminPlanes = () => {
  const [planes, setPlanes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [formData, setFormData] = useState({
    PlanName: '',
    Price: '',
    DurationDays: ''
  });
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);

  const fetchPlanes = async (includeArchived = showArchived) => {
    try {
      setLoading(true);
      const url = includeArchived 
        ? '/plans?all=true' 
        : '/plans';
      const res = await api.get(url);
      setPlanes(res.data);
    } catch (error) {
      console.error('Error al obtener planes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanes(showArchived);
  }, [showArchived]);

  const handleOpenModal = (plan = null) => {
    if (plan) {
      setCurrentPlan(plan);
      setFormData({
        PlanName: plan.PlanName,
        Price: plan.Price,
        DurationDays: plan.DurationDays
      });
    } else {
      setCurrentPlan(null);
      setFormData({ PlanName: '', Price: '', DurationDays: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentPlan(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentPlan) {
        await api.put(`/plans/${currentPlan.PlanID}`, formData);
      } else {
        await api.post('/plans', formData);
      }
      handleCloseModal();
      fetchPlanes();
    } catch (error) {
      console.error('Error al guardar plan:', error);
    }
  };

  const handleArchive = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas archivar este plan? Ya no estará disponible para nuevos miembros.')) {
      try {
        await api.delete(`/plans/${id}`);
        fetchPlanes(showArchived);
      } catch (error) {
        console.error('Error al archivar plan:', error);
      }
    }
  };

  const handleRestore = async (id) => {
    if (window.confirm('¿Deseas restaurar este plan? Volverá a estar disponible para todos.')) {
      try {
        await api.put(`/plans/${id}`, { Status: 'A' });
        fetchPlanes(showArchived);
      } catch (error) {
        console.error('Error al restaurar plan:', error);
      }
    }
  };

  return (
    <div className="admin-page fade-in">
      <div className="settings-main-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className="settings-title">Gestión de Planes</h2>
            <p style={{ color: '#8b8593', marginBottom: '30px' }}>Crea, edita o archiva los planes de suscripción para tus miembros.</p>
          </div>
          <button className="btn-pill-blue" onClick={() => handleOpenModal()} style={{ marginBottom: '30px', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiPlus /> Nuevo Plan
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="settings-sub-header" style={{ marginBottom: '0' }}>Planes Disponibles</div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
            <input 
              type="checkbox" 
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: '#3b82f6' }}
            />
            Mostrar archivados
          </label>
        </div>

        {loading ? (
          <div style={{ padding: '20px', color: '#8b8593' }}>Cargando planes...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {planes.map(plan => (
              <div className="setting-row" key={plan.PlanID} style={{ opacity: plan.Status === 'A' ? 1 : 0.6 }}>
                <div className={`setting-icon ${plan.Status === 'A' ? 'success' : ''}`}>
                  <FiLayers />
                </div>
                
                <div className="setting-content">
                  <div className="setting-title">{plan.PlanName}</div>
                  <div className="setting-desc">
                    <strong style={{ color: '#0ea5e9' }}>${plan.Price.toFixed(2)}</strong> • Duración: {plan.DurationDays} días
                    <br />
                    Estado: <span style={{ fontWeight: '600', color: plan.Status === 'A' ? '#10b981' : '#f59e0b' }}>
                      {plan.Status === 'A' ? 'Activo' : 'Archivado'}
                    </span>
                  </div>
                </div>

                <div className="setting-action" style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-pill-blue" onClick={() => handleOpenModal(plan)} title="Editar" style={{ background: '#f3f4f6', color: '#4b5563', border: '1px solid #d1d5db' }}>
                    <FiEdit2 /> Editar
                  </button>
                  {plan.Status === 'A' ? (
                    <button className="btn-pill-red" onClick={() => handleArchive(plan.PlanID)} title="Archivar">
                      <FiArchive /> Archivar
                    </button>
                  ) : (
                    <button className="btn-pill-blue" style={{ background: '#10b981' }} onClick={() => handleRestore(plan.PlanID)} title="Restaurar">
                      <FiCheckCircle /> Restaurar
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {planes.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#8b8593', background: '#f4f4f5', borderRadius: '16px' }}>
                No hay planes registrados.
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card scale-in" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>{currentPlan ? 'Editar Plan' : 'Crear Nuevo Plan'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Nombre del Plan</label>
                <input
                  type="text"
                  name="PlanName"
                  value={formData.PlanName}
                  onChange={handleChange}
                  placeholder="Ej: Plan Mensual Premium"
                  required
                  style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Precio ($)</label>
                <input
                  type="number"
                  step="0.01"
                  name="Price"
                  value={formData.Price}
                  onChange={handleChange}
                  placeholder="Ej: 49.99"
                  required
                  style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Duración en Días</label>
                <input
                  type="number"
                  name="DurationDays"
                  value={formData.DurationDays}
                  onChange={handleChange}
                  placeholder="Ej: 30"
                  required
                  style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="btn-cancel" onClick={handleCloseModal} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', color: '#374151', cursor: 'pointer', fontWeight: '500' }}>
                  Cancelar
                </button>
                <button type="submit" className="btn-pill-blue" style={{ padding: '10px 16px' }}>
                  {currentPlan ? 'Actualizar Plan' : 'Crear Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPlanes;
