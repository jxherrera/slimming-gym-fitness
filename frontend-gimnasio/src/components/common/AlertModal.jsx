import React from 'react';
import { FaLock, FaExclamationTriangle, FaCreditCard, FaSyncAlt } from 'react-icons/fa';
import Modal from './Modal';
import './AlertModal.css';

const AlertModal = ({ isOpen, onClose, reason = 'expired', onGoToPayment }) => {
  const isExpired = reason === 'expired';
  const isSuspended = reason === 'suspended';

  const title = isExpired 
    ? 'Acceso Bloqueado: Membresía Vencida' 
    : 'Acceso Restringido: Suscripción Inactiva';

  const footer = (
    <div className="alert-modal-footer">
      <button className="btn-secondary-modal" onClick={onClose}>
        Entendido / Cerrar
      </button>
      {onGoToPayment && (
        <button className="btn-primary-modal" onClick={() => { onClose(); onGoToPayment(); }}>
          <FaCreditCard /> Ir a Reportar Pago
        </button>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={footer}
      size="md"
      closeOnBackdrop={false}
    >
      <div className="alert-modal-body">
        <div className="alert-lock-icon">
          <FaLock />
        </div>
        <h3 className="alert-modal-heading">
          {isExpired ? '¡Tu periodo de entrenamiento ha concluido!' : 'Se requiere renovación activa'}
        </h3>
        <p className="alert-modal-text">
          {isExpired 
            ? 'Estimado socio, para continuar accediendo a la reserva de clases semanales, rutinas personalizadas de tu entrenador y código de ingreso a las instalaciones de Slimming Gym, debes regularizar tu estado de cuenta.'
            : 'Tu suscripción actualmente se encuentra pendiente de verificación de pago o suspendida. Adjunta tu recibo o selecciona un nuevo plan en la sección de pagos.'}
        </p>
        
        <div className="alert-notice-box">
          <FaExclamationTriangle className="notice-icon" />
          <span>Una vez registrado tu comprobante, el equipo administrativo activará tu pase de inmediato.</span>
        </div>
      </div>
    </Modal>
  );
};

export default AlertModal;
