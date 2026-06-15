import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiCheckCircle, FiXCircle, FiImage } from 'react-icons/fi';

const AdminPagos = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/payments/pending');
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
        await axios.put(`http://localhost:5000/api/payments/${id}/approve`);
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
        await axios.put(`http://localhost:5000/api/payments/${id}/reject`);
        fetchPayments();
      } catch (error) {
        console.error('Error al rechazar pago:', error);
      }
    }
  };

  return (
    <div className="tab-content fade-in">
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <h2>Aprobación de Pagos</h2>
        <p>Revisa los comprobantes subidos por los socios y activa sus suscripciones.</p>
      </div>

      {loading ? (
        <div className="loading-state">Cargando pagos pendientes...</div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Socio</th>
                <th>Plan Solicitado</th>
                <th>Monto ($)</th>
                <th>Fecha / Referencia</th>
                <th>Comprobante</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => (
                <tr key={payment.paymentId}>
                  <td>
                    <div style={{ fontWeight: '600' }}>{payment.memberName}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--admin-muted)' }}>{payment.memberEmail}</div>
                  </td>
                  <td>{payment.planName} ({payment.durationDays} días)</td>
                  <td style={{ fontWeight: '700', color: 'var(--admin-accent)' }}>
                    ${parseFloat(payment.amountPaid).toFixed(2)}
                  </td>
                  <td>
                    <div>{new Date(payment.paymentDate).toLocaleDateString()}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--admin-muted)' }}>Ref: {payment.referenceNumber || 'N/A'}</div>
                  </td>
                  <td>
                    {payment.receiptUrl ? (
                      <a href={payment.receiptUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>
                        <FiImage /> Ver Foto
                      </a>
                    ) : (
                      <span style={{ color: 'var(--admin-muted)' }}>Sin Imagen</span>
                    )}
                  </td>
                  <td className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                    <button className="btn-edit" onClick={() => handleApprove(payment.paymentId)} style={{ background: '#10b981' }} title="Aprobar Pago">
                      <FiCheckCircle /> Aprobar
                    </button>
                    <button className="btn-delete" onClick={() => handleReject(payment.paymentId)} title="Rechazar Pago">
                      <FiXCircle /> Rechazar
                    </button>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--admin-muted)' }}>
                    No hay pagos pendientes de revisión en este momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPagos;
