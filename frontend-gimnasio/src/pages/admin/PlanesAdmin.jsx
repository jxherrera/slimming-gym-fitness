import React, { useState, useEffect } from 'react';
import './PlanesAdmin.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const PlanesAdmin = () => {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  
  const [formValues, setFormValues] = useState({
    planName: '',
    price: '',
    durationDays: '',
    status: 'A'
  });

  const loadPlans = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/plans/admin`);
      if (!response.ok) {
        throw new Error('Error al obtener la lista de planes.');
      }
      const data = await response.json();
      if (data.success) {
        setPlans(data.plans);
      } else {
        setError(data.message || 'Error al cargar los planes.');
      }
    } catch (err) {
      console.error(err);
      setError('No se pudo conectar con el servidor. Mostrando datos locales temporales.');
      // Fallback local data
      setPlans([
        { PlanID: 1, PlanName: 'Plan Diario', Price: 10.00, DurationDays: 1, Status: 'A' },
        { PlanID: 2, PlanName: 'Plan Mensual', Price: 50.00, DurationDays: 30, Status: 'A' },
        { PlanID: 3, PlanName: 'Plan Trimestral', Price: 135.00, DurationDays: 90, Status: 'A' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleOpenAddModal = () => {
    setModalMode('add');
    setSelectedPlanId(null);
    setFormValues({
      planName: '',
      price: '',
      durationDays: '',
      status: 'A'
    });
    setSuccessMsg('');
    setError('');
    setShowModal(true);
  };

  const handleOpenEditModal = (plan) => {
    setModalMode('edit');
    setSelectedPlanId(plan.PlanID);
    setFormValues({
      planName: plan.PlanName,
      price: plan.Price.toString(),
      durationDays: plan.DurationDays.toString(),
      status: plan.Status
    });
    setSuccessMsg('');
    setError('');
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const payload = {
      planName: formValues.planName,
      price: parseFloat(formValues.price),
      durationDays: parseInt(formValues.durationDays, 10),
      status: formValues.status
    };

    if (isNaN(payload.price) || payload.price < 0) {
      setError('El precio debe ser un número positivo.');
      return;
    }
    if (isNaN(payload.durationDays) || payload.durationDays <= 0) {
      setError('La duración debe ser un número entero mayor a 0.');
      return;
    }

    try {
      let url = `${API_BASE}/plans`;
      let method = 'POST';

      if (modalMode === 'edit') {
        url = `${API_BASE}/plans/${selectedPlanId}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMsg(modalMode === 'add' ? 'Plan creado con éxito.' : 'Plan actualizado con éxito.');
        setShowModal(false);
        loadPlans();
      } else {
        setError(data.message || 'Error al guardar el plan.');
      }
    } catch (err) {
      console.error(err);
      setError('Error de comunicación con el servidor.');
    }
  };

  const handleArchivePlan = async (planId, currentStatus) => {
    const newStatus = currentStatus === 'A' ? 'I' : 'A';
    const actionText = newStatus === 'I' ? 'archivar' : 'reactivar';
    const confirmAction = window.confirm(`¿Estás seguro de que deseas ${actionText} este plan?`);
    if (!confirmAction) return;

    setError('');
    setSuccessMsg('');

    try {
      const response = await fetch(`${API_BASE}/plans/${planId}/archive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMsg(newStatus === 'I' ? 'Plan archivado con éxito.' : 'Plan reactivado con éxito.');
        loadPlans();
      } else {
        setError(data.message || 'No se pudo cambiar el estado del plan.');
      }
    } catch (err) {
      console.error(err);
      setError('Error al conectar con el servidor.');
    }
  };

  return (
    <div className="admin-page theme-dark">
      <div className="admin-header">
        <div className="header-content">
          <p className="eyebrow">Administración</p>
          <h1>Gestión de Planes de Gimnasio</h1>
          <p>Crea, edita o archiva los planes de membresía disponibles para los socios (Diario, Mensual, Trimestral).</p>
          {error && <div className="admin-alert error-alert">{error}</div>}
          {successMsg && <div className="admin-alert success-alert">{successMsg}</div>}
        </div>
      </div>

      <div className="tab-content planes-admin-content">
        <div className="table-section">
          <div className="section-header planes-section-header">
            <div>
              <h3>Planes Configurados</h3>
              <p>Revisa y gestiona las tarifas y duraciones de las membresías.</p>
            </div>
            <button type="button" className="btn-add-plan" onClick={handleOpenAddModal}>
              + Crear Plan
            </button>
          </div>

          {isLoading ? (
            <div className="loading-spinner">Cargando planes...</div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nombre del Plan</th>
                    <th>Precio</th>
                    <th>Duración (Días)</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="empty-row">No hay planes registrados.</td>
                    </tr>
                  ) : (
                    plans.map(plan => (
                      <tr key={plan.PlanID} className={plan.Status === 'I' ? 'archived-row' : ''}>
                        <td className="plan-name-cell">{plan.PlanName}</td>
                        <td className="plan-price-cell">${parseFloat(plan.Price).toFixed(2)}</td>
                        <td>{plan.DurationDays} {plan.DurationDays === 1 ? 'día' : 'días'}</td>
                        <td>
                          <span className={`badge ${plan.Status === 'A' ? 'badge-active' : 'badge-archived'}`}>
                            {plan.Status === 'A' ? 'Activo' : 'Archivado'}
                          </span>
                        </td>
                        <td className="actions-cell">
                          <button 
                            type="button" 
                            className="btn-edit" 
                            onClick={() => handleOpenEditModal(plan)}
                          >
                            Editar
                          </button>
                          <button 
                            type="button" 
                            className={`btn-delete ${plan.Status === 'A' ? 'btn-archive' : 'btn-restore'}`}
                            onClick={() => handleArchivePlan(plan.PlanID, plan.Status)}
                          >
                            {plan.Status === 'A' ? 'Archivar' : 'Activar'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{modalMode === 'add' ? 'Crear Nuevo Plan' : 'Editar Plan'}</h3>
              <button type="button" className="modal-close" onClick={() => setShowModal(false)} aria-label="Cerrar">
                ×
              </button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="form-grid modal-grid">
                <label className="form-group">
                  <span>Nombre del Plan</span>
                  <input
                    type="text"
                    name="planName"
                    value={formValues.planName}
                    onChange={handleFormChange}
                    placeholder="Ej: Plan Mensual Premium"
                    required
                  />
                </label>
                <label className="form-group">
                  <span>Precio ($)</span>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    value={formValues.price}
                    onChange={handleFormChange}
                    placeholder="Ej: 49.99"
                    required
                  />
                </label>
                <label className="form-group">
                  <span>Duración (en Días)</span>
                  <input
                    type="number"
                    name="durationDays"
                    value={formValues.durationDays}
                    onChange={handleFormChange}
                    placeholder="Ej: 30"
                    required
                  />
                </label>
                {modalMode === 'edit' && (
                  <label className="form-group">
                    <span>Estado</span>
                    <select
                      name="status"
                      value={formValues.status}
                      onChange={handleFormChange}
                    >
                      <option value="A">Activo</option>
                      <option value="I">Archivado</option>
                    </select>
                  </label>
                )}
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
                  {modalMode === 'add' ? 'Crear Plan' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanesAdmin;
