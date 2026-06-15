import React, { useState, useEffect } from 'react';
import './PagosAdmin.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const PagosAdmin = () => {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Modal states for full receipt image view
  const [selectedImage, setSelectedImage] = useState(null);

  const loadPendingPayments = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/payments/pending`);
      if (!response.ok) {
        throw new Error('Error al obtener los pagos pendientes.');
      }
      const data = await response.json();
      if (data.success) {
        setPayments(data.payments);
      } else {
        setError(data.message || 'Error al cargar los pagos pendientes.');
      }
    } catch (err) {
      console.error(err);
      setError('No se pudo conectar con el servidor. Mostrando comprobantes de ejemplo.');
      // Fallback local data with realistic images/links
      setPayments([
        {
          paymentId: 101,
          subscriptionId: 1,
          amountPaid: 50.00,
          paymentDate: '2026-06-14T20:30:00.000Z',
          paymentMethod: 'Transferencia',
          referenceNumber: 'TX-982348',
          receiptUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=800',
          memberName: 'Carlos Ruiz',
          memberEmail: 'carlos@email.com',
          planName: 'Plan Mensual',
          durationDays: 30
        },
        {
          paymentId: 102,
          subscriptionId: 2,
          amountPaid: 135.00,
          paymentDate: '2026-06-14T18:15:00.000Z',
          paymentMethod: 'Transferencia',
          referenceNumber: 'TX-110934',
          receiptUrl: 'https://images.unsplash.com/photo-1621252179027-94459d278660?w=800',
          memberName: 'Ana García',
          memberEmail: 'ana@email.com',
          planName: 'Plan Trimestral',
          durationDays: 90
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPendingPayments();
  }, []);

  const handleApprove = async (paymentId) => {
    const confirmApprove = window.confirm('¿Deseas aprobar este pago? Esto activará automáticamente la suscripción del socio.');
    if (!confirmApprove) return;

    setError('');
    setSuccessMsg('');

    try {
      const response = await fetch(`${API_BASE}/payments/${paymentId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMsg('Pago aprobado con éxito. La suscripción del socio ha sido activada.');
        loadPendingPayments();
      } else {
        setError(data.message || 'No se pudo aprobar el pago.');
      }
    } catch (err) {
      console.error(err);
      setError('Error al procesar la aprobación en el servidor.');
    }
  };

  const handleReject = async (paymentId) => {
    const confirmReject = window.confirm('¿Estás seguro de que deseas rechazar este comprobante de pago?');
    if (!confirmReject) return;

    setError('');
    setSuccessMsg('');

    try {
      const response = await fetch(`${API_BASE}/payments/${paymentId}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMsg('El comprobante de pago ha sido rechazado.');
        loadPendingPayments();
      } else {
        setError(data.message || 'No se pudo rechazar el pago.');
      }
    } catch (err) {
      console.error(err);
      setError('Error al procesar el rechazo en el servidor.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="admin-page theme-dark">
      <div className="admin-header">
        <div className="header-content">
          <p className="eyebrow">Administración</p>
          <h1>Aprobación de Comprobantes de Pago</h1>
          <p>Verifica las transferencias y comprobantes subidos por los socios. Al aprobar, se activará su membresía al instante.</p>
          {error && <div className="admin-alert error-alert">{error}</div>}
          {successMsg && <div className="admin-alert success-alert">{successMsg}</div>}
        </div>
      </div>

      <div className="tab-content pagos-admin-content">
        <div className="table-section">
          <div className="section-header">
            <h3>Pagos Pendientes de Revisión</h3>
            <p>Verifica que el monto y el número de referencia coincidan con tu cuenta bancaria.</p>
          </div>

          {isLoading ? (
            <div className="loading-spinner">Cargando comprobantes...</div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Socio</th>
                    <th>Plan / Monto</th>
                    <th>Método / Ref</th>
                    <th>Fecha de Subida</th>
                    <th>Comprobante</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-row">No hay comprobantes pendientes de aprobación.</td>
                    </tr>
                  ) : (
                    payments.map(payment => (
                      <tr key={payment.paymentId}>
                        <td>
                          <div className="member-info-cell">
                            <span className="member-name">{payment.memberName}</span>
                            <span className="member-email">{payment.memberEmail}</span>
                          </div>
                        </td>
                        <td>
                          <div className="plan-info-cell">
                            <span className="plan-name">{payment.planName}</span>
                            <span className="plan-amount">${parseFloat(payment.amountPaid).toFixed(2)}</span>
                          </div>
                        </td>
                        <td>
                          <div className="method-info-cell">
                            <span className="payment-method">{payment.paymentMethod}</span>
                            <span className="ref-number">Ref: {payment.referenceNumber || 'N/A'}</span>
                          </div>
                        </td>
                        <td>{formatDate(payment.paymentDate)}</td>
                        <td>
                          {payment.receiptUrl ? (
                            <div className="thumbnail-wrapper" onClick={() => setSelectedImage(payment.receiptUrl)}>
                              <img 
                                src={payment.receiptUrl} 
                                alt="Comprobante" 
                                className="receipt-thumbnail" 
                                onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=Ver+Imagen'; }}
                              />
                              <div className="thumbnail-overlay">🔍 Ver</div>
                            </div>
                          ) : (
                            <span className="no-receipt">Sin comprobante</span>
                          )}
                        </td>
                        <td className="actions-cell payment-actions">
                          <button 
                            type="button" 
                            className="btn-approve"
                            onClick={() => handleApprove(payment.paymentId)}
                          >
                            Aprobar
                          </button>
                          <button 
                            type="button" 
                            className="btn-reject"
                            onClick={() => handleReject(payment.paymentId)}
                          >
                            Rechazar
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

      {/* Lightbox / Image Zoom Modal */}
      {selectedImage && (
        <div className="image-lightbox-backdrop" onClick={() => setSelectedImage(null)}>
          <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="lightbox-close" onClick={() => setSelectedImage(null)}>
              ×
            </button>
            <img src={selectedImage} alt="Comprobante ampliado" className="lightbox-image" />
          </div>
        </div>
      )}
    </div>
  );
};

export default PagosAdmin;
