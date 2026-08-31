import React, { useState, useEffect } from 'react';
import { memberService } from '../../../services/memberService';
import api from '../../../services/api';
import { useToast } from '../../../hooks/useToast';
import { FiUser, FiCheckCircle, FiXCircle, FiImage, FiFileText, FiDollarSign, FiInfo, FiBarChart2, FiBell } from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import '../shared/admin-core.css';
import './AdminPagosVerificacion.css';

const AdminPagosVerificacion = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('pending');
  const [payments, setPayments] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Cargar pagos pendientes e historial
  const fetchPayments = async () => {
    try {
      setLoading(true);
      if (activeTab === 'pending') {
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
      } else {
        const res = await api.get('/payments/history');
        const list = res.data?.data || res.data?.payments || [];
        setHistory(list);
        
        if (list.length > 0) {
          if (!selectedPayment || !list.some(p => p.paymentId === selectedPayment.paymentId)) {
            setSelectedPayment(list[0]);
          }
        } else {
          setSelectedPayment(null);
        }
      }
    } catch (error) {
      console.error('Error al obtener pagos:', error);
      toast.error('No se pudieron obtener los datos del servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [activeTab]);

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

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button 
                onClick={() => setActiveTab('pending')} 
                style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', background: activeTab === 'pending' ? '#f59e0b' : 'transparent', color: activeTab === 'pending' ? '#fff' : '#8b8593' }}
            >
                Pendientes de Revisión
            </button>
            <button 
                onClick={() => setActiveTab('history')} 
                style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', background: activeTab === 'history' ? '#3b82f6' : 'transparent', color: activeTab === 'history' ? '#fff' : '#8b8593' }}
            >
                Historial de Pagos
            </button>
            <button 
                onClick={() => setActiveTab('stats')} 
                style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', background: activeTab === 'stats' ? '#10b981' : 'transparent', color: activeTab === 'stats' ? '#fff' : '#8b8593' }}
            >
                Métricas y Notificaciones
            </button>
        </div>

        {loading && ((activeTab === 'pending' && payments.length === 0) || (activeTab === 'history' && history.length === 0) || activeTab === 'stats') ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#fff' }}>Cargando datos...</div>
        ) : activeTab === 'stats' ? (
          <div className="stats-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
            <div className="stats-card" style={{ background: '#1e1b4b', padding: '24px', borderRadius: '16px', border: '1px solid #312e81' }}>
              <h3 style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}><FiBarChart2 /> Estado de Pagos Recientes</h3>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Aprobados', value: history.filter(p => p.paymentStatus === 'A').length || 1 },
                        { name: 'Rechazados', value: history.filter(p => p.paymentStatus === 'R').length || 0 },
                        { name: 'Pendientes', value: payments.length || 0 }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#ef4444" />
                      <Cell fill="#f59e0b" />
                    </Pie>
                    <Tooltip contentStyle={{ background: '#312e81', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="stats-card" style={{ background: '#1e1b4b', padding: '24px', borderRadius: '16px', border: '1px solid #312e81' }}>
              <h3 style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}><FiBell /> Notificaciones Recientes</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {payments.slice(0, 3).map(p => (
                  <div key={p.paymentId} style={{ padding: '12px', background: '#312e81', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                    <div style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>Nuevo pago de {p.memberName}</div>
                    <div style={{ color: '#9ca3af', fontSize: '12px' }}>Requiere revisión por ${p.amountPaid}</div>
                  </div>
                ))}
                {history.slice(0, 3).map(p => (
                  <div key={p.paymentId} style={{ padding: '12px', background: '#312e81', borderRadius: '8px', borderLeft: `4px solid ${p.paymentStatus === 'A' ? '#10b981' : '#ef4444'}` }}>
                    <div style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>Pago de {p.memberName} {p.paymentStatus === 'A' ? 'Aprobado' : 'Rechazado'}</div>
                    <div style={{ color: '#9ca3af', fontSize: '12px' }}>Hace poco</div>
                  </div>
                ))}
                {payments.length === 0 && history.length === 0 && (
                  <div style={{ color: '#9ca3af', fontSize: '14px' }}>No hay notificaciones en este momento.</div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="verification-layout">
            
            {/* COLUMNA IZQUIERDA: LISTA */}
            <div className="verification-list-panel">
              <div className="panel-header-badge">{activeTab === 'pending' ? `Transacciones Pendientes (${payments.length})` : `Historial (${history.length})`}</div>
              <div className="payments-scroll-list">
                {(activeTab === 'pending' ? payments : history).map(payment => (
                  <div 
                    key={payment.paymentId}
                    className={`payment-list-item ${selectedPayment?.paymentId === payment.paymentId ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedPayment(payment);
                      setRejectReason('');
                    }}
                  >
                    <div className="item-avatar" style={{ background: activeTab === 'history' ? (payment.paymentStatus === 'A' ? '#dcfce7' : '#fee2e2') : undefined, color: activeTab === 'history' ? (payment.paymentStatus === 'A' ? '#16a34a' : '#ef4444') : undefined }}>
                      {activeTab === 'history' ? (payment.paymentStatus === 'A' ? <FiCheckCircle /> : <FiXCircle />) : <FiUser />}
                    </div>
                    <div className="item-details">
                      <div className="item-name">{payment.memberName}</div>
                      <div className="item-meta">
                        {payment.planName} • <strong className="item-amount">${parseFloat(payment.amountPaid).toFixed(2)}</strong>
                      </div>
                      <div className="item-date-ref">
                        {activeTab === 'history' ? (
                          <span style={{ fontWeight: 'bold', color: payment.paymentStatus === 'A' ? '#16a34a' : '#ef4444' }}>{payment.paymentStatus === 'A' ? 'Aprobado' : 'Rechazado'}</span>
                        ) : (
                          `Ref: ${payment.referenceNumber || 'Sin ref'}`
                        )} • {new Date(payment.paymentDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}

                {activeTab === 'pending' && payments.length === 0 && (
                  <div className="empty-payments-state">
                    🎉 ¡Todo al día! No hay comprobantes pendientes de verificación en este momento.
                  </div>
                )}
                {activeTab === 'history' && history.length === 0 && (
                  <div className="empty-payments-state">
                    No hay pagos en el historial.
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
                          loading="lazy"
                          decoding="async"
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
                  {activeTab === 'pending' && (
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
                  )}

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
