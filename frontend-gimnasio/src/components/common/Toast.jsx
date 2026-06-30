import React from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import { useToast } from '../../hooks/useToast';
import './Toast.css';

const ToastItem = ({ toast, onRemove }) => {
  const { id, message, type, duration } = toast;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="toast-icon success" />;
      case 'error':
        return <FaTimesCircle className="toast-icon error" />;
      case 'warning':
        return <FaExclamationTriangle className="toast-icon warning" />;
      case 'info':
      default:
        return <FaInfoCircle className="toast-icon info" />;
    }
  };

  return (
    <div className={`toast-card ${type}`}>
      <div className="toast-content">
        {getIcon()}
        <span className="toast-message">{message}</span>
        <button className="toast-close-btn" onClick={() => onRemove(id)} aria-label="Cerrar alerta">
          <FaTimes />
        </button>
      </div>
      {duration > 0 && (
        <div 
          className="toast-progress-bar" 
          style={{ animationDuration: `${duration}ms` }}
        />
      )}
    </div>
  );
};

export const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  if (!toasts.length) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

export default ToastContainer;
