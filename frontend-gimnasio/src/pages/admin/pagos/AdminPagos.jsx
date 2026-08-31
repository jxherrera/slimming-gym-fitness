import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { FiCheckCircle, FiXCircle, FiImage, FiUser } from 'react-icons/fi';
import '../shared/admin-core.css';

const AdminPagos = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [payments, setPayments] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [dialog, setDialog] = useState({ isOpen: false, type: 'alert', message: '', onConfirm: null });
  const showAlert = (message) => setDialog({ isOpen: true, type: 'alert', message, onConfirm: null });
  const showConfirm = (message, onConfirm) => setDialog({ isOpen: true, type: 'confirm', message, onConfirm });

  const fetchPayments = async () => {
    try {
      setLoading(true);
      if (activeTab === 'pending') {
        const res = await api.get('/payments/pending');
        setPayments(res.data.payments || []);
      } else {
        const res = await api.get('/payments/history');
        setHistory(res.data.payments || []);
      }
    } catch (error) {
      console.error('Error al obtener pagos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [activeTab]);

  const handleApprove = (id) => {
    showConfirm('¿Confirmas que el pago es válido y deseas activar la suscripción?', async () => {
      try {
        await api.patch(`/payments/${id}/approve`);
        fetchPayments();
      } catch (error) {
        console.error('Error al aprobar pago:', error);
        showAlert('Hubo un error al aprobar el pago.');
      }
    });
  };

  const handleReject = (id) => {
    showConfirm('¿Seguro que deseas rechazar este comprobante?', async () => {
      try {
        await api.patch(`/payments/${id}/reject`);
        fetchPayments();
      } catch (error) {
        console.error('Error al rechazar pago:', error);
      }
    });
  };

  return (
    <div className="admin-page fade-in">
      <div className="settings-main-card">
        <h2 className="settings-title">Gestión de Pagos</h2>
        <p style={{ color: '#8b8593', marginBottom: '20px' }}>Revisa los comprobantes subidos por los socios y consulta el historial.</p>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
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
        </div>

        {loading ? (
          <div style={{ padding: '20px', color: '#8b8593' }}>Cargando datos...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {activeTab === 'pending' && payments.map(payment => (
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
            
            {activeTab === 'pending' && payments.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#8b8593', background: '#f4f4f5', borderRadius: '16px' }}>
                No hay pagos pendientes de revisión en este momento.
              </div>
            )}

            {activeTab === 'history' && history.map(payment => (
              <div className="setting-row" key={payment.paymentId}>
                <div className="setting-icon" style={{ background: payment.status === 'Approved' ? '#dcfce7' : '#fee2e2', color: payment.status === 'Approved' ? '#16a34a' : '#ef4444' }}>
                  {payment.status === 'Approved' ? <FiCheckCircle /> : <FiXCircle />}
                </div>
                
                <div className="setting-content">
                  <div className="setting-title">{payment.memberName}</div>
                  <div className="setting-desc">
                    {payment.planName} • <strong style={{ color: '#0ea5e9' }}>${parseFloat(payment.amountPaid).toFixed(2)}</strong>
                    <br />
                    Estado: <span style={{ fontWeight: 'bold', color: payment.status === 'Approved' ? '#16a34a' : '#ef4444' }}>{payment.status === 'Approved' ? 'Aprobado' : 'Rechazado'}</span> • {new Date(payment.paymentDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="setting-action">
                  {payment.receiptUrl && (
                    <a href={payment.receiptUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>
                      <FiImage /> Ver Comprobante
                    </a>
                  )}
                </div>
              </div>
            ))}

            {activeTab === 'history' && history.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#8b8593', background: '#f4f4f5', borderRadius: '16px' }}>
                No hay pagos en el historial.
              </div>
            )}
          </div>
        )}
      </div>

      {dialog.isOpen && (
        <div className="modal-backdrop" onClick={() => setDialog({ ...dialog, isOpen: false })}>
            <div className="modal-container modal-sm" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">{dialog.type === 'confirm' ? 'Confirmación' : 'Aviso'}</h3>
                </div>
                <div className="modal-body" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0' }}>
                    <span style={{ fontSize: '15px' }}>{dialog.message}</span>
                </div>
                <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    {dialog.type === 'confirm' && (
                        <button 
                            onClick={() => setDialog({ ...dialog, isOpen: false })}
                            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #d1d5db', background: 'transparent', cursor: 'pointer' }}
                        >
                            Cancelar
                        </button>
                    )}
                    <button 
                        onClick={() => {
                            setDialog({ ...dialog, isOpen: false });
                            if (dialog.onConfirm) dialog.onConfirm();
                        }}
                        className={dialog.type === 'confirm' ? "btn-primary-modal" : "btn-pill-blue"}
                        style={{ padding: '8px 16px' }}
                    >
                        Aceptar
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminPagos;
