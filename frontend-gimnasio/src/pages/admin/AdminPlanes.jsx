import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit2, FiArchive, FiCheckCircle } from 'react-icons/fi';
import './PlanesAdmin.css';

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
        ? 'http://localhost:5000/api/plans?all=true' 
        : 'http://localhost:5000/api/plans';
      const res = await axios.get(url);
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
        await axios.put(`http://localhost:5000/api/plans/${currentPlan.PlanID}`, formData);
      } else {
        await axios.post('http://localhost:5000/api/plans', formData);
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
        await axios.delete(`http://localhost:5000/api/plans/${id}`);
        fetchPlanes(showArchived);
      } catch (error) {
        console.error('Error al archivar plan:', error);
      }
    }
  };

  const handleRestore = async (id) => {
    if (window.confirm('¿Deseas restaurar este plan? Volverá a estar disponible para todos.')) {
      try {
        await axios.put(`http://localhost:5000/api/plans/${id}`, { Status: 'A' });
        fetchPlanes(showArchived);
      } catch (error) {
        console.error('Error al restaurar plan:', error);
      }
    }
  };

  return (
    <div className="tab-content planes-admin-content fade-in">
      <div className="planes-section-header">
        <h2>Gestión de Planes</h2>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--admin-muted)' }}>
            <input 
              type="checkbox" 
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--admin-accent)' }}
            />
            Mostrar archivados
          </label>
          <button className="btn-add-plan" onClick={() => handleOpenModal()}>
            <FiPlus style={{ marginRight: '6px' }} />
            Nuevo Plan
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Cargando planes...</div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre del Plan</th>
                <th>Precio ($)</th>
                <th>Duración (Días)</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {planes.map(plan => (
                <tr key={plan.PlanID}>
                  <td style={{ fontWeight: '600' }}>{plan.PlanName}</td>
                  <td>${plan.Price.toFixed(2)}</td>
                  <td>{plan.DurationDays} días</td>
                  <td>
                    <span className="badge">
                      {plan.Status === 'A' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                    <button className="btn-edit" onClick={() => handleOpenModal(plan)} title="Editar">
                      <FiEdit2 /> Editar
                    </button>
                    {plan.Status === 'A' ? (
                      <button className="btn-delete" onClick={() => handleArchive(plan.PlanID)} title="Archivar">
                        <FiArchive /> Archivar
                      </button>
                    ) : (
                      <button className="btn-edit" style={{ background: '#10b981', marginLeft: '0' }} onClick={() => handleRestore(plan.PlanID)} title="Restaurar">
                        <FiCheckCircle /> Restaurar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {planes.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--admin-muted)' }}>
                    No hay planes registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card scale-in">
            <div className="modal-header">
              <h3>{currentPlan ? 'Editar Plan' : 'Crear Nuevo Plan'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <span>Nombre del Plan</span>
                <input
                  type="text"
                  name="PlanName"
                  value={formData.PlanName}
                  onChange={handleChange}
                  placeholder="Ej: Plan Mensual Premium"
                  required
                />
              </div>
              <div className="form-group" style={{ marginTop: '16px' }}>
                <span>Precio ($)</span>
                <input
                  type="number"
                  step="0.01"
                  name="Price"
                  value={formData.Price}
                  onChange={handleChange}
                  placeholder="Ej: 49.99"
                  required
                />
              </div>
              <div className="form-group" style={{ marginTop: '16px' }}>
                <span>Duración en Días</span>
                <input
                  type="number"
                  name="DurationDays"
                  value={formData.DurationDays}
                  onChange={handleChange}
                  placeholder="Ej: 30"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
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
