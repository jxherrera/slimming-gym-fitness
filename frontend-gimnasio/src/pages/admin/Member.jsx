import React, { useState, useEffect } from 'react';
import { FaDumbbell, FaMoneyBillWave, FaCalendarAlt, FaSpinner } from 'react-icons/fa';
import './Member.css';

// Base de la API obtenida de las variables de entorno o apuntando a localhost:5000
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Member = () => {
  // Datos del socio recuperados de la sesión local
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {};
  const userId = user.userId;

  // Estados para la carga de datos del panel del socio
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados del formulario de subida de pagos
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Transferencia');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Consulta de la suscripción actual del socio y los planes del gimnasio
  const fetchData = async () => {
    if (!userId) return;
    try {
      setLoading(true);

      // Carga paralela de planes, suscripción del socio y sus rutinas correspondientes
      const [plansRes, subRes, routinesRes] = await Promise.all([
        fetch(`${API_BASE}/plans`),
        fetch(`${API_BASE}/users/${userId}/subscription`),
        fetch(`${API_BASE}/routines/user/${userId}`)
      ]);

      const plansData = await plansRes.json();
      const subData = await subRes.json();
      const routinesData = await routinesRes.json();

      setPlans(plansData);
      if (subData.success) {
        setSubscription(subData.subscription);
      }
      if (routinesData.success) {
        setRoutines(routinesData.routines);
      }
    } catch (error) {
      console.error('Error al cargar datos del panel:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  // Manejador del formulario para registrar y subir un nuevo comprobante de pago
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setFormSuccess('');
    setFormError('');

    if (!selectedPlanId || !paymentMethod || !referenceNumber || !receiptUrl) {
      setFormError('Por favor, completa todos los campos del formulario.');
      return;
    }

    try {
      setFormSubmitting(true);
      const response = await fetch(`${API_BASE}/payments/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          planId: Number(selectedPlanId),
          paymentMethod,
          referenceNumber,
          receiptUrl
        })
      });

      const data = await response.json();

      if (data.success) {
        setFormSuccess(data.message);
        // Limpiar campos del formulario tras subir el comprobante de forma exitosa
        setSelectedPlanId('');
        setReferenceNumber('');
        setReceiptUrl('');
        // Recargar datos del panel para reflejar el pago pendiente de revisión
        fetchData();
      } else {
        setFormError(data.message || 'Error al procesar el pago.');
      }
    } catch (error) {
      console.error('Error al enviar pago:', error);
      setFormError('Ocurrió un error al enviar el comprobante de pago.');
    } finally {
      setFormSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="member-dashboard" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <FaSpinner className="spinner" style={{ fontSize: '3rem', animation: 'spin 1s linear infinite', color: '#3b82f6' }} />
      </div>
    );
  }

  // Cálculos para la barra de progreso de días restantes
  const hasSubscription = subscription && subscription.paymentStatus === 'P';
  const remainingDays = subscription ? Math.max(0, subscription.remainingDays) : 0;
  const durationDays = subscription ? subscription.durationDays : 30;
  const progressPercent = hasSubscription ? Math.min(100, Math.max(0, (remainingDays / durationDays) * 100)) : 0;
  const isWarningDays = remainingDays <= 7;

  return (
    <div className="member-dashboard">
      <div className="member-header">
        <div>
          <h1>Bienvenido, {user.firstName || 'Socio'}</h1>
          <p>Consulta tu estado de membresía, rutinas diarias y realiza tus pagos en línea.</p>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Columna Izquierda: Estado de Membresía e Indicador Gráfico */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="dashboard-card">
            <h2><FaCalendarAlt /> Estado de Membresía</h2>
            
            <div className="subscription-status">
              {subscription ? (
                <>
                  <div className="plan-info">
                    <div className="plan-name">{subscription.planName}</div>
                    <div className="plan-dates">
                      Vence el: {new Date(subscription.endDate).toLocaleDateString()}
                    </div>
                  </div>

                  {subscription.paymentStatus === 'P' ? (
                    <>
                      {/* Indicador gráfico de días restantes de la membresía */}
                      <div className="progress-bar-container">
                        <div 
                          className={`progress-bar-fill ${isWarningDays ? 'warning' : ''}`}
                          style={{ width: `${progressPercent}%` }}
                        >
                          <span className="progress-percent">{Math.round(progressPercent)}%</span>
                        </div>
                      </div>
                      <div className={`days-left-badge ${isWarningDays ? 'warning' : ''}`}>
                        {remainingDays} días restantes
                      </div>
                      {isWarningDays && (
                        <div className="alert-info-box" style={{ marginTop: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                          ⚠️ Tu membresía está próxima a vencer. ¡Realiza una renovación a tiempo!
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="alert-info-box">
                      {subscription.paymentRequestStatus === 'P' ? (
                        <span>🕒 Tu pago está en revisión por el administrador. Se activará pronto.</span>
                      ) : subscription.paymentRequestStatus === 'R' ? (
                        <span style={{ color: '#f87171' }}>❌ Comprobante rechazado. Por favor, sube un nuevo recibo válido en el formulario.</span>
                      ) : (
                        <span>⚠️ Suscripción pendiente de pago o activación.</span>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="no-data">
                  No tienes ninguna suscripción registrada. Por favor, selecciona un plan para comenzar.
                </div>
              )}
            </div>
          </div>

          {/* Sección de Visualización Amigable de Rutinas */}
          <div className="dashboard-card">
            <h2><FaDumbbell /> Mi Rutina del Día</h2>
            <div className="routine-list">
              {routines.length > 0 ? (
                routines.map((routine) => (
                  <div key={routine.RoutineID} className="routine-item">
                    <div className="routine-title-bar">
                      <h3 className="routine-name">{routine.RoutineName || 'Rutina Slimming Gym'}</h3>
                      <span className="routine-coach">Por: {routine.CoachName || 'Entrenador'}</span>
                    </div>
                    <p className="routine-goal">{routine.Goal}</p>
                  </div>
                ))
              ) : (
                <div className="no-data">
                  No tienes rutinas activas asignadas hoy. Consulta a tu entrenador para programar una rutina.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Formulario de Subida y Reporte de Pagos */}
        <div>
          <div className="dashboard-card">
            <h2><FaMoneyBillWave /> Reportar Comprobante de Pago</h2>
            {formSuccess && <div className="alert-success-box">{formSuccess}</div>}
            {formError && <div className="alert-error-box">{formError}</div>}
            
            <form onSubmit={handlePaymentSubmit} className="payment-form">
              <div className="form-group">
                <label htmlFor="plan-select">Selecciona el Plan a Pagar</label>
                <select 
                  id="plan-select" 
                  className="form-select" 
                  value={selectedPlanId} 
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  required
                >
                  <option value="">-- Elige un plan --</option>
                  {plans.map((plan) => (
                    <option key={plan.PlanID} value={plan.PlanID}>
                      {plan.PlanName} - ${plan.Price} ({plan.DurationDays} días)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="payment-method">Método de Pago</label>
                <select 
                  id="payment-method" 
                  className="form-select" 
                  value={paymentMethod} 
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  required
                >
                  <option value="Transferencia">Transferencia Bancaria</option>
                  <option value="Tarjeta">Tarjeta de Crédito / Débito</option>
                  <option value="Efectivo">Depósito en Efectivo</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="ref-number">Número de Referencia / Transacción</label>
                <input 
                  type="text" 
                  id="ref-number" 
                  className="form-input" 
                  placeholder="Ej: TXN987654321" 
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="receipt-url">URL del Comprobante / Recibo (Foto)</label>
                <input 
                  type="url" 
                  id="receipt-url" 
                  className="form-input" 
                  placeholder="Ej: https://imgur.com/recibo.png" 
                  value={receiptUrl}
                  onChange={(e) => setReceiptUrl(e.target.value)}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn-submit" 
                disabled={formSubmitting}
              >
                {formSubmitting ? 'Enviando...' : 'Registrar y Enviar Pago'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Member;
