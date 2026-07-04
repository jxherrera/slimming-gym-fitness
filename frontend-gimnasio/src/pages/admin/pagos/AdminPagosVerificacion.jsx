import React, { useState, useEffect } from 'react';
import { memberService } from '../../../services/memberService';
import api from '../../../services/api';
import { useToast } from '../../../hooks/useToast';
import { FiUser, FiCheckCircle, FiXCircle, FiImage, FiFileText, FiDollarSign, FiInfo } from 'react-icons/fi';
import '../shared/admin-core.css';
import './AdminPagosVerificacion.css';

const AdminPagosVerificacion = () => {
  const toast = useToast();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Cargar pagos pendientes
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/payments/pending');
      const list = res.data?.payments || [];
      setPayments(list);
      
      // Auto-seleccionar el primero si no hay ninguno seleccionado o si el seleccionado ya no está en la lista
      if (list.length > 0) {
        if (!selectedPayment || !list.some(p => p.paymentId === selectedPayment.paymentId)) {
          setSelectedPayment(list[0]);
        }
      } else {
        setSelectedPayment(null);
      }
    } catch (error) {
      console.error('Error al obtener pagos pendientes:', error);
      toast.error('No se pudieron obtener los comprobantes pendientes del servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleVerify = async (status) => {
    if (!selectedPayment) return;

    const actionText = status === 'A' ? 'aprobar' : 'rechazar';
    const isConfirmed = window.confirm(`¿Estás seguro de que deseas ${actionText} este pago de $${selectedPayment.amountPaid} de ${selectedPayment.memberName}?`);
    
    if (!isConfirmed) return;

    try {
      setVerifying(true);
      
      // Llamar al endpoint PUT /api/payments/:id/verify mediante el servicio correspondiente
      const res = await memberService.verifyPayment(
        selectedPayment.paymentId, 
        status, 
        status === 'R' ? rejectReason : 'Aprobado por el Administrador'
      );

      if (res.success) {
        toast.success(res.message || `Pago ${status === 'A' ? 'aprobado' : 'rechazado'} correctamente.`);
        setRejectReason('');
        await fetchPayments();
      } else {
        toast.error(res.message || 'Error al actualizar el estado del pago.');
      }
    } catch (error) {
      console.error('Error al verificar pago:', error);
      toast.error('Hubo un error de red o de servidor al procesar la verificación.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="admin-page fade-in">
      <div className="settings-main-card verification-main">
        <h2 className="settings-title">Verificación de Comprobantes de Pago</h2>
        <p style={{ color: '#8b8593', marginBottom: '25px' }}>
          Revisa y aprueba los pagos reportados por los socios para reactivar sus suscripciones de forma transaccional.
        </p>

        {loading && payments.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#fff' }}>Cargando transacciones pendientes...</div>
        ) : (
          <div className="verification-layout">
            
            {/* COLUMNA IZQUIERDA: LISTA PENDIENTES */}
            <div className="verification-list-panel">
              <div className="panel-header-badge">Transacciones Pendientes ({payments.length})</div>
              <div className="payments-scroll-list">
                {payments.map(payment => (
                  <div 
                    key={payment.paymentId}
                    className={`payment-list-item ${selectedPayment?.paymentId === payment.paymentId ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedPayment(payment);
                      setRejectReason('');
                    }}
                  >
                    <div className="item-avatar"><FiUser /></div>
                    <div className="item-details">
                      <div className="item-name">{payment.memberName}</div>
                      <div className="item-meta">
                        {payment.planName} • <strong className="item-amount">${parseFloat(payment.amountPaid).toFixed(2)}</strong>
                      </div>
                      <div className="item-date-ref">
                        Ref: {payment.referenceNumber || 'Sin ref'} • {new Date(payment.paymentDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}

                {payments.length === 0 && (
                  <div className="empty-payments-state">
                    🎉 ¡Todo al día! No hay comprobantes pendientes de verificación en este momento.
                  </div>
                )}
              </div>
            </div>

            {/* COLUMNA DERECHA: EXPANDIDO & BOTONES */}
            <div className="verification-detail-panel">
              {selectedPayment ? (
                <div className="detail-panel-content">
                  <div className="detail-header">
                    <h4>Detalle de la Transacción</h4>
                    <span className="plan-badge">{selectedPayment.planName} ({selectedPayment.durationDays} días)</span>
                  </div>

                  <div className="detail-meta-grid">
                    <div className="meta-card">
                      <span className="meta-label">Socio</span>
                      <span className="meta-value">{selectedPayment.memberName}</span>
                      <span className="meta-subvalue">{selectedPayment.memberEmail}</span>
                    </div>
                    <div className="meta-card">
                      <span className="meta-label">Monto Recibido</span>
                      <span className="meta-value amount-text"><FiDollarSign /> {parseFloat(selectedPayment.amountPaid).toFixed(2)} USD</span>
                    </div>
                    <div className="meta-card">
                      <span className="meta-label">Referencia</span>
                      <span className="meta-value">{selectedPayment.referenceNumber || 'N/A'}</span>
                    </div>
                    <div className="meta-card">
                      <span className="meta-label">Fecha de Envío</span>
                      <span className="meta-value">{new Date(selectedPayment.paymentDate).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Visualización ampliada del comprobante */}
                  <div className="receipt-image-card">
                    <div className="receipt-image-header">
                      <FiImage /> Imagen del Comprobante
                    </div>
                    <div className="receipt-image-wrapper">
                      {selectedPayment.receiptImageUrl ? (
                        <img 
                          src={selectedPayment.receiptImageUrl} 
                          alt={`Comprobante de ${selectedPayment.memberName}`}
                          className="receipt-enlarged"
                          onClick={() => window.open(selectedPayment.receiptImageUrl, '_blank')}
                          title="Click para ver en tamaño completo"
                        />
                      ) : (
                        <div className="no-image-placeholder">
                          <FiImage size={48} style={{ opacity: 0.3, marginBottom: '10px' }} />
                          No se adjuntó una foto del recibo física para este pago.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Acciones de Verificación */}
                  <div className="verification-actions-card">
                    <div className="reject-reason-container">
                      <label htmlFor="reject-reason-input"><FiFileText /> Observaciones o motivo de rechazo (opcional):</label>
                      <input 
                        type="text" 
                        id="reject-reason-input"
                        placeholder="Ej: La referencia no coincide con el depósito..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="reason-input"
                      />
                    </div>

                    <div className="action-buttons">
                      <button 
                        className="btn-verify-approve"
                        onClick={() => handleVerify('A')}
                        disabled={verifying}
                      >
                        <FiCheckCircle /> Aprobar Transacción
                      </button>
                      <button 
                        className="btn-verify-reject"
                        onClick={() => handleVerify('R')}
                        disabled={verifying}
                      >
                        <FiXCircle /> Rechazar Pago
                      </button>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="no-selection-placeholder">
                  <FiInfo size={40} style={{ color: '#ff3b3b', marginBottom: '16px' }} />
                  <h4>Sin Selección</h4>
                  <p>Selecciona una transferencia de la lista de la izquierda para ver su comprobante y verificar el pago.</p>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPagosVerificacion;
