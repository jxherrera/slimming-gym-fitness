import React, { useState } from 'react';
import { FaBell, FaExclamationTriangle, FaClock, FaTimesCircle, FaCheckCircle, FaChevronRight } from 'react-icons/fa';
import './Notifications.css';

const Notifications = ({ subscription, onRenovarClick }) => {
  const [closed, setClosed] = useState(false);

  if (!subscription || closed) return null;

  const { paymentStatus, remainingDays, paymentRequestStatus } = subscription;

  let type = 'info';
  let title = '';
  let message = '';
  let icon = <FaBell />;
  let showAction = false;

  if (paymentStatus === 'P') {
    if (remainingDays <= 0) {
      type = 'error';
      title = 'Membresía Vencida';
      message = 'Tu plan ha alcanzado su fecha límite. Para continuar accediendo a rutinas e instalaciones, realiza tu renovación.';
      icon = <FaTimesCircle />;
      showAction = true;
    } else if (remainingDays <= 7) {
      type = 'warning';
      title = `¡Tu membresía vence en ${remainingDays} día${remainingDays === 1 ? '' : 's'}!`;
      message = 'Te recomendamos realizar tu pago a tiempo para evitar interrupciones en tus entrenamientos.';
      icon = <FaExclamationTriangle />;
      showAction = true;
    } else {
      type = 'success';
      title = 'Membresía Activa';
      message = `Cuentas con ${remainingDays} días de acceso continuo a tus rutinas y clases.`;
      icon = <FaCheckCircle />;
    }
  } else if (paymentRequestStatus === 'P') {
    type = 'info';
    title = 'Pago en Revisión';
    message = 'Tu comprobante de pago ha sido enviado y está siendo verificado por la administración.';
    icon = <FaClock />;
  } else if (paymentRequestStatus === 'R') {
    type = 'error';
    title = 'Comprobante Rechazado';
    message = 'El comprobante subido no pudo ser verificado. Por favor, adjunta un nuevo recibo válido.';
    icon = <FaTimesCircle />;
    showAction = true;
  } else {
    type = 'warning';
    title = 'Suscripción Inactiva';
    message = 'Aún no posees una membresía activa. Adquiere un plan para desbloquear tu agenda y rutinas.';
    icon = <FaExclamationTriangle />;
    showAction = true;
  }

  return (
    <div className={`notification-banner notification-${type}`}>
      <div className="notification-header">
        <div className="notification-icon-wrapper">{icon}</div>
        <div className="notification-body">
          <h4 className="notification-title">{title}</h4>
          <p className="notification-message">{message}</p>
        </div>
      </div>
      {showAction && onRenovarClick && (
        <button className="notification-action-btn" onClick={onRenovarClick}>
          Renovar Plan <FaChevronRight />
        </button>
      )}
    </div>
  );
};

export default Notifications;
