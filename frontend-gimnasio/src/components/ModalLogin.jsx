import React from 'react';
import './ModalLogin.css';

const ModalLogin = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="close-x" onClick={onClose}>&times;</button>
        
        <form className="login-form-modal">
          <h2>SLIMMING <span className="red-text">GYM</span></h2>
          <p>Bienvenido de nuevo</p>
          
          <div className="input-box">
            <input type="email" placeholder="Correo Electrónico" required />
          </div>
          <div className="input-box">
            <input type="password" placeholder="Contraseña" required />
          </div>
          
          <button type="submit" className="btn-entrar">ENTRAR</button>
          <a href="#" className="forgot-pass">¿Olvidaste tu contraseña?</a>
        </form>
      </div>
    </div>
  );
};

export default ModalLogin;