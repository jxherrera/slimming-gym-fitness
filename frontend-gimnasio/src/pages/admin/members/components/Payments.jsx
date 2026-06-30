import React, { useState, useEffect } from 'react';
import api from '../../../../services/api';
import { useToast } from '../../../../context/ToastContext';
import { FaMoneyBillWave, FaList, FaUpload, FaCalendarDay } from 'react-icons/fa';

const Payments = ({ user, subscription, selectedPlanId, setSelectedPlanId, onPaymentSuccess }) => {
  const userId = user?.userId;
  const { addToast } = useToast();

  // Estados del formulario
  const [plans, setPlans] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('Transferencia');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Historial de pagos
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchPlansAndHistory = async () => {
    if (!userId) return;
    try {
      // 1. Cargar planes
      const plansRes = await api.get('/plans');
      setPlans(plansRes.data || []);

      // 2. Cargar historial de pagos
      setLoadingHistory(true);
      const historyRes = await api.get(`/users/${userId}/payments`);
      if (historyRes.data.success) {
        setPaymentHistory(historyRes.data.payments || []);
      }
    } catch (error) {
      console.error('Error al cargar datos de pagos:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchPlansAndHistory();
  }, [userId]);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlanId || !paymentMethod || !referenceNumber || !receiptUrl) {
      addToast('Por favor, completa todos los campos del formulario.', 'warning');
      return;
    }

    setFormSubmitting(true);
    try {
      const response = await api.post('/payments/upload', {
        userId,
        planId: Number(selectedPlanId),
        paymentMethod,
        referenceNumber,
        receiptUrl
      });

      if (response.data.success) {
        addToast('Comprobante de pago enviado correctamente. En revisión.', 'success');
        setReferenceNumber('');
        setReceiptUrl('');
        setSelectedPlanId('');
        // Recargar datos
        fetchPlansAndHistory();
        if (onPaymentSuccess) {
          onPaymentSuccess();
        }
      } else {
        addToast(response.data.message || 'Error al reportar pago.', 'error');
      }
    } catch (error) {
      console.error('Error al enviar pago:', error);
      addToast(error.response?.data?.message || 'Error de conexión al enviar pago.', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'A': return 'Aprobado';
      case 'R': return 'Rechazado';
      default: return 'Pendiente';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'A': return 'badge-status-approved';
      case 'R': return 'badge-status-rejected';
      default: return 'badge-status-pending';
    }
  };

  return (
    <div className="tab-panel-content fade-in">
      <div className="payments-view-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
        
        {/* Formulario de reporte de pagos */}
        <div className="payment-card-section" style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaUpload style={{ color: '#ff3b3b' }} /> Reportar Transferencia Bancaria
          </h3>

          <form onSubmit={handlePaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.6)' }}>Plan a Pagar</label>
                <select 
                  className="form-select" 
                  style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', color: '#fff', outline: 'none' }}
                  value={selectedPlanId} 
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  required
                >
                  <option value="" style={{ background: '#111' }}>-- Selecciona el Plan --</option>
                  {plans.map((plan) => (
                    <option key={plan.PlanID} value={plan.PlanID} style={{ background: '#111' }}>
                      {plan.PlanName} - ${plan.Price} USD
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.6)' }}>Método de Pago</label>
                <select 
                  className="form-select" 
                  style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', color: '#fff', outline: 'none' }}
                  value={paymentMethod} 
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  required
                >
                  <option value="Transferencia" style={{ background: '#111' }}>Transferencia Bancaria</option>
                  <option value="Tarjeta" style={{ background: '#111' }}>Tarjeta de Crédito / Débito</option>
                  <option value="Efectivo" style={{ background: '#111' }}>Depósito en Efectivo</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.6)' }}>Número de Referencia Bancaria</label>
              <input 
                type="text" 
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', color: '#fff', outline: 'none' }}
                placeholder="Ej: TXN-549102-M" 
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.6)' }}>URL de Comprobante / Foto</label>
              <input 
                type="url" 
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', color: '#fff', outline: 'none' }}
                placeholder="https://imgbb.com/tu-recibo.jpg" 
                value={receiptUrl}
                onChange={(e) => setReceiptUrl(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn-pill-red"
              disabled={formSubmitting}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 24px', cursor: 'pointer', marginTop: '10px', background: '#ff3b3b', border: '1px solid #ff3b3b', color: '#fff', borderRadius: '25px', fontWeight: '600', transition: 'all 0.3s ease' }}
            >
              <FaUpload /> {formSubmitting ? 'Enviando comprobante...' : 'Enviar Pago'}
            </button>
          </form>
        </div>

        {/* Historial de transacciones */}
        <div className="payment-card-section" style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaList style={{ color: '#ff3b3b' }} /> Historial de Transacciones
          </h3>

          <div className="payment-history-scroll-box" style={{ flexGrow: 1, overflowY: 'auto', maxHeight: '350px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {loadingHistory ? (
              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>Cargando transacciones...</p>
            ) : paymentHistory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 10px', color: 'rgba(255,255,255,0.4)', fontSize: '14px', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '10px' }}>
                No tienes pagos registrados todavía.
              </div>
            ) : (
              paymentHistory.map((pay) => (
                <div 
                  key={pay.paymentId}
                  style={{ 
                    background: 'rgba(255,255,255,0.01)', 
                    border: '1px solid rgba(255,255,255,0.03)', 
                    borderRadius: '12px', 
                    padding: '16px', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center' 
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <strong style={{ fontSize: '14px', color: '#fff' }}>{pay.planName}</strong>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FaCalendarDay size={11} /> {new Date(pay.paymentDate).toLocaleDateString()}
                    </span>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                      Ref: {pay.referenceNumber}
                    </span>
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                    <strong style={{ color: '#ff3b3b', fontSize: '15px' }}>${pay.amountPaid} USD</strong>
                    <span className={`badge-status ${getStatusClass(pay.status)}`} style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '50px' }}>
                      {getStatusText(pay.status)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Payments;
