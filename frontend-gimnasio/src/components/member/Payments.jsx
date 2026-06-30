import React, { useState } from 'react';
import { FaMoneyBillWave, FaCamera, FaCreditCard, FaReceipt, FaCheckCircle, FaImage } from 'react-icons/fa';
import { memberService } from '../../services/memberService';
import { useToast } from '../../hooks/useToast';
import './Payments.css';

const Payments = ({ userId, plans = [], onPaymentSuccess }) => {
  const toast = useToast();
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Transferencia');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleUrlChange = (e) => {
    setReceiptUrl(e.target.value);
    setImageError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlanId || !paymentMethod || !referenceNumber || !receiptUrl) {
      toast.warning('Por favor completa todos los campos requeridos.');
      return;
    }

    try {
      setIsSubmitting(true);
      const data = await memberService.uploadPayment({
        userId,
        planId: Number(selectedPlanId),
        paymentMethod,
        referenceNumber,
        receiptUrl
      });

      if (data.success) {
        toast.success(data.message || 'Comprobante reportado con éxito. En proceso de verificación.');
        setSelectedPlanId('');
        setReferenceNumber('');
        setReceiptUrl('');
        if (onPaymentSuccess) onPaymentSuccess();
      } else {
        toast.error(data.message || 'Error al enviar comprobante.');
      }
    } catch (error) {
      console.error('Error enviando pago:', error);
      toast.error(error.response?.data?.message || 'Error de conexión al enviar el pago.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPlan = plans.find(p => String(p.PlanID) === String(selectedPlanId));

  return (
    <div className="payments-card-container">
      <div className="payments-header">
        <FaMoneyBillWave className="payments-icon-title" />
        <div>
          <h3>Reportar Comprobante de Pago</h3>
          <p>Adjunta la foto o URL de tu transferencia bancaria para renovar o activar tu suscripción.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="payments-form">
        <div className="form-row">
          <div className="form-group flex-1">
            <label htmlFor="plan-select-input"><FaReceipt /> Seleccionar Plan</label>
            <select
              id="plan-select-input"
              className="payments-input"
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              required
            >
              <option value="">-- Elige un plan de gimnasio --</option>
              {plans.map((plan) => (
                <option key={plan.PlanID} value={plan.PlanID}>
                  {plan.PlanName} - ${plan.Price} ({plan.DurationDays} días)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group flex-1">
            <label htmlFor="payment-method-select"><FaCreditCard /> Método de Pago</label>
            <select
              id="payment-method-select"
              className="payments-input"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              required
            >
              <option value="Transferencia">Transferencia Bancaria Directa</option>
              <option value="Tarjeta">Tarjeta de Crédito / Débito</option>
              <option value="Efectivo">Depósito en Ventanilla / Efectivo</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="reference-input"><FaReceipt /> Número de Referencia o Transacción</label>
          <input
            type="text"
            id="reference-input"
            className="payments-input"
            placeholder="Ej: REF-9876543210"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="receipt-url-input"><FaCamera /> URL / Enlace de la Foto del Recibo</label>
          <input
            type="url"
            id="receipt-url-input"
            className="payments-input"
            placeholder="Ej: https://imgur.com/foto_comprobante.png"
            value={receiptUrl}
            onChange={handleUrlChange}
            required
          />
        </div>

        {/* Previsualización en tiempo real del comprobante */}
        {receiptUrl && (
          <div className="receipt-preview-container">
            <span className="preview-label"><FaImage /> Previsualización de Comprobante:</span>
            {!imageError ? (
              <img
                src={receiptUrl}
                alt="Previsualización Recibo"
                className="receipt-image-preview"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="receipt-image-error">
                ⚠️ No se pudo cargar la imagen desde la URL ingresada. Verifica que el enlace sea directo y público.
              </div>
            )}
          </div>
        )}

        {selectedPlan && (
          <div className="summary-box">
            <span>Monto a confirmar: <strong>${selectedPlan.Price} USD</strong> ({selectedPlan.PlanName})</span>
          </div>
        )}

        <button type="submit" className="payments-submit-btn" disabled={isSubmitting}>
          {isSubmitting ? 'Enviando comprobante...' : <><FaCheckCircle /> Confirmar y Registrar Pago</>}
        </button>
      </form>
    </div>
  );
};

export default Payments;
