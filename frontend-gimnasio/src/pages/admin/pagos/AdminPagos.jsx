import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { FiCheckCircle, FiXCircle, FiImage, FiUser } from 'react-icons/fi';
import '../shared/admin-core.css';

const AdminPagos = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/payments/pending');
      setPayments(res.data.payments || []);
    } catch (error) {
      console.error('Error al obtener pagos pendientes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleApprove = async (id) => {
    if (window.confirm('¿Confirmas que el pago es válido y deseas activar la suscripción?')) {
      try {
        await api.put(`/payments/${id}/approve`);
        fetchPayments();
      } catch (error) {
        console.error('Error al aprobar pago:', error);
        alert('Hubo un error al aprobar el pago.');
      }
    }
  };

  const handleReject = async (id) => {
    if (window.confirm('¿Seguro que deseas rechazar este comprobante?')) {
      try {
        await api.put(`/payments/${id}/reject`);
        fetchPayments();
      } catch (error) {
        console.error('Error al rechazar pago:', error);
      }
    }
  };

  return (
    <div className="admin-page fade-in">
      <div className="settings-main-card">
        <h2 className="settings-title">Aprobación de Pagos</h2>
        <p style={{ color: '#8b8593', marginBottom: '40px' }}>Revisa los comprobantes subidos por los socios y activa sus suscripciones.</p>

        <div className="settings-sub-header">Pagos Pendientes</div>

        {loading ? (
          <div style={{ padding: '20px', color: '#8b8593' }}>Cargando pagos pendientes...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {payments.map(payment => (
              <div className="setting-row" key={payment.paymentId}>
                <div className="setting-icon">
                  <FiUser />
                </div>
                
                <div className="setting-content">
                  <div className="setting-title">{payment.memberName}</div>
                  <div className="setting-desc">
                    {payment.planName} ({payment.durationDays} días) • <strong style={{ color: '#0ea5e9' }}>${parseFloat(payment.amountPaid).toFixed(2)}</strong>
                    <br />
                    Ref: {payment.referenceNumber || 'N/A'} • {new Date(payment.paymentDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="setting-action">
                  {payment.receiptUrl && (
                    <a href={payment.receiptUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#3b82f6', textDecoration: 'none', fontWeight: '500', marginRight: '16px' }}>
                      <FiImage /> Ver Foto
                    </a>
                  )}
                  <button className="btn-pill-blue" onClick={() => handleApprove(payment.paymentId)} title="Aprobar Pago">
                    <FiCheckCircle /> Aprobar
                  </button>
                  <button className="btn-pill-red" onClick={() => handleReject(payment.paymentId)} title="Rechazar Pago">
                    Rechazar
                  </button>
                </div>
              </div>
            ))}
            
            {payments.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#8b8593', background: '#f4f4f5', borderRadius: '16px' }}>
                No hay pagos pendientes de revisión en este momento.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPagos;
