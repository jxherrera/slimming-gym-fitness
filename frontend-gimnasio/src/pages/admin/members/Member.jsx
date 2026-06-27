import React, { useState, useEffect } from 'react';
import { FaDumbbell, FaMoneyBillWave, FaCalendarAlt, FaSpinner } from 'react-icons/fa';
import '../shared/admin-core.css';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import api from '../../../services/api';

const Member = () => {
  const { user } = useAuth();
  const userId = user?.userId;

  // Control de Tema Oscuro/Claro desde Context
  const { isDarkMode, toggleTheme } = useTheme();
  const themeClass = isDarkMode ? 'theme-dark' : 'theme-light';
  const themeIcon = isDarkMode ? '☀️' : '🌙';

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
        api.get('/plans'),
        api.get(`/users/${userId}/subscription`),
        api.get(`/routines/user/${userId}`)
      ]);

      setPlans(plansRes.data);
      if (subRes.data.success) {
        setSubscription(subRes.data.subscription);
      }
      if (routinesRes.data.success) {
        setRoutines(routinesRes.data.routines);
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
      const response = await api.post('/payments/upload', {
        userId,
        planId: Number(selectedPlanId),
        paymentMethod,
        referenceNumber,
        receiptUrl
      });

      const data = response.data;

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
      <div className="admin-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
    <div className={`admin-page ${themeClass} fade-in`} style={{ padding: '20px' }}>
      <div className="settings-main-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="settings-title" style={{ marginBottom: '10px' }}>Panel de Socio</h2>
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Cambiar tema"
            style={{ width: '40px', height: '40px', borderRadius: '10px' }}
          >
            {themeIcon}
          </button>
        </div>
        <p style={{ color: '#8b8593', marginBottom: '40px', fontSize: '15px' }}>
          Bienvenido, <strong>{user.firstName || 'Socio'}</strong>. Gestiona tu membresía, pagos y rutinas aquí.
        </p>

        {/* --- SECCIÓN: ESTADO DE MEMBRESÍA --- */}
        <div className="settings-sub-header">Membresía y Accesos</div>
        
        <div className="setting-row">
          <div className={`setting-icon ${hasSubscription ? 'success' : 'warning'}`}>
            <FaCalendarAlt />
          </div>
          <div className="setting-content">
            <div className="setting-title">Estado de Suscripción</div>
            <div className="setting-desc">
              {subscription ? (
                <>
                  Plan <strong>{subscription.planName}</strong> • 
                  {subscription.paymentStatus === 'P' ? (
                     ` Vence el: ${new Date(subscription.endDate).toLocaleDateString()}`
                  ) : subscription.paymentRequestStatus === 'P' ? (
                     ' Pago en revisión por el administrador.'
                  ) : subscription.paymentRequestStatus === 'R' ? (
                     <span style={{ color: '#ef4444' }}> Comprobante rechazado.</span>
                  ) : (
                     ' Pendiente de pago.'
                  )}
                </>
              ) : (
                'No tienes suscripción activa.'
              )}
            </div>
          </div>
          <div className="setting-action">
            {hasSubscription && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '700', color: isWarningDays ? '#f59e0b' : '#10b981', fontSize: '14px' }}>
                  {remainingDays} días restantes
                </div>
                <div style={{ width: '100px', height: '8px', background: '#e2e8f0', borderRadius: '4px', marginTop: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${progressPercent}%`, height: '100%', background: isWarningDays ? '#f59e0b' : '#10b981' }}></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- SECCIÓN: RUTINAS --- */}
        <div className="settings-sub-header">Mi Rutina del Día</div>
        
        {routines.length > 0 ? (
          routines.map((routine) => (
            <div key={routine.RoutineID} className="setting-row">
              <div className="setting-icon">
                <FaDumbbell />
              </div>
              <div className="setting-content">
                <div className="setting-title">{routine.RoutineName || 'Rutina de Entrenamiento'}</div>
                <div className="setting-desc">
                  Entrenador: <strong>{routine.CoachName || 'No asignado'}</strong> • {routine.Goal}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="setting-row" style={{ justifyContent: 'center', background: 'transparent', border: '1px dashed #cbcccf' }}>
            <span style={{ color: '#8b8593', fontSize: '14px' }}>No tienes rutinas asignadas hoy. Consulta a tu entrenador.</span>
          </div>
        )}

        {/* --- SECCIÓN: PAGOS --- */}
        <div className="settings-sub-header">Información Financiera</div>
        
        <div style={{ background: '#f8f9fa', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb' }} className="theme-dark-fix-bg">
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#2b2532' }} className="theme-dark-fix-text">Reportar nuevo pago</h3>
          
          {formSuccess && <div style={{ background: '#dcfce7', color: '#166534', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{formSuccess}</div>}
          {formError && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{formError}</div>}
          
          <form onSubmit={handlePaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Plan a Pagar</label>
                <select 
                  className="form-select" 
                  style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: '10px', padding: '10px 12px', fontSize: '14px' }}
                  value={selectedPlanId} 
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  required
                >
                  <option value="">-- Elige un plan --</option>
                  {plans.map((plan) => (
                    <option key={plan.PlanID} value={plan.PlanID}>
                      {plan.PlanName} - ${plan.Price}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Método de Pago</label>
                <select 
                  className="form-select" 
                  style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: '10px', padding: '10px 12px', fontSize: '14px' }}
                  value={paymentMethod} 
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  required
                >
                  <option value="Transferencia">Transferencia Bancaria</option>
                  <option value="Tarjeta">Tarjeta de Crédito / Débito</option>
                  <option value="Efectivo">Depósito en Efectivo</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Número de Referencia</label>
                <input 
                  type="text" 
                  style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', outline: 'none' }}
                  placeholder="Ej: TXN987654321" 
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>URL del Recibo</label>
                <input 
                  type="url" 
                  style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', outline: 'none' }}
                  placeholder="https://..." 
                  value={receiptUrl}
                  onChange={(e) => setReceiptUrl(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button 
                type="submit" 
                className="btn-pill-blue"
                disabled={formSubmitting}
                style={{ padding: '10px 24px' }}
              >
                {formSubmitting ? 'Enviando...' : 'Reportar Pago'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Member;
