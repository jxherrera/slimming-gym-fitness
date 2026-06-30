import React from 'react';
import './AlertModal.css';

const AlertModal = ({ isOpen, title, message, actions }) => {
  if (!isOpen) return null;

  return (
    <div className="alert-modal-overlay">
      <div className="alert-modal-dialog" role="alertdialog" aria-modal="true" aria-labelledby="alert-title">
        <div className="alert-modal-header">
          <div className="alert-icon-wrapper">
            <span className="alert-danger-icon">⚠</span>
          </div>
          <h2 className="alert-modal-title" id="alert-title">{title}</h2>
        </div>
        
        <div className="alert-modal-body">
          <p>{message}</p>
        </div>
        
        <div className="alert-modal-footer">
          {actions}
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
