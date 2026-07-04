import React, { useState, useEffect, useRef } from 'react';
import { FaMoneyBillWave, FaCamera, FaCreditCard, FaReceipt, FaCheckCircle, FaImage, FaUpload } from 'react-icons/fa';
import { memberService } from '../../services/memberService';
import { useToast } from '../../hooks/useToast';
import './Payments.css';

const Payments = ({ userId, plans = [], onPaymentSuccess }) => {
  const toast = useToast();
  const fileInputRef = useRef(null);
  
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Transferencia');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Drag & Drop / File states
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Revocar URL del preview para evitar fugas de memoria
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (file) => {
    if (file && file.type.startsWith('image/')) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      toast.info(`Foto cargada: ${file.name}`);
    } else {
      toast.error('Por favor, selecciona un archivo de imagen válido (PNG, JPG, JPEG).');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlanId || !paymentMethod || !referenceNumber) {
      toast.warning('Por favor completa todos los campos requeridos.');
      return;
    }
    if (!selectedFile) {
      toast.warning('Por favor carga la foto de tu comprobante de transferencia.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Construir FormData para multipart/form-data
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('planId', Number(selectedPlanId));
      formData.append('paymentMethod', paymentMethod);
      formData.append('referenceNumber', referenceNumber);
      formData.append('receipt', selectedFile);
      
      // Enviar como fallback también la URL local si el backend espera un string en el esquema antiguo
      formData.append('receiptUrl', previewUrl);

      const data = await memberService.uploadPayment(formData);

      if (data.success) {
        toast.success(data.message || 'Comprobante de pago subido con éxito. En proceso de verificación.');
        setSelectedPlanId('');
        setReferenceNumber('');
        setSelectedFile(null);
        setPreviewUrl('');
        if (onPaymentSuccess) onPaymentSuccess();
      } else {
        toast.error(data.message || 'Error al enviar comprobante.');
      }
    } catch (error) {
      console.error('Error enviando pago:', error);
      toast.error(error.response?.data?.message || 'Error de conexión al enviar el comprobante.');
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
          <h3>Renovar Membresía</h3>
          <p>Sube la foto de tu transferencia para verificar tu pago y reactivar tu suscripción.</p>
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

        {/* Zona Interactiva de Drag & Drop para cargar el comprobante */}
        <div className="form-group">
          <label><FaCamera /> Comprobante de Transferencia (Foto / Captura)</label>
          
          <input
            type="file"
            id="receipt-file-input"
            ref={fileInputRef}
            className="payments-input"
            style={{ display: 'none' }}
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileChange(e.target.files[0]);
              }
            }}
          />

          {!selectedFile ? (
            <div 
              className={`drag-drop-zone ${dragActive ? 'active' : ''}`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
            >
              <FaUpload className="drag-drop-icon" />
              <p className="drag-drop-text">Arrastra y suelta tu foto aquí, o haz clic para buscar</p>
              <p className="drag-drop-subtext">Formatos permitidos: PNG, JPG, JPEG. Tamaño máx. 5MB.</p>
            </div>
          ) : (
            <div className="thumbnail-container">
              <div className="thumbnail-header">
                <span>Archivo listo: <strong>{selectedFile.name}</strong></span>
                <button type="button" className="remove-file-btn" onClick={removeFile}>Eliminar</button>
              </div>
              <img
                src={previewUrl}
                alt="Vista previa de comprobante"
                className="receipt-image-preview"
              />
            </div>
          )}
        </div>

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
