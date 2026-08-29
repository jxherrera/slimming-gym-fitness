import React from 'react';
import { useNavigate } from 'react-router-dom';
import PasswordInput from './PasswordInput';
import './ModalLogin.css';

const ModalLogin = ({ isVisible, onClose }) => {
  const navigate = useNavigate();

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
            <PasswordInput placeholder="Contraseña" required />
          </div>
          
          <button type="submit" className="btn-entrar">ENTRAR</button>
          <button 
            type="button" 
            className="forgot-pass"
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#d1d1d1', 
              cursor: 'pointer', 
              fontSize: '0.9rem', 
              textDecoration: 'underline', 
              marginTop: '8px',
              display: 'block',
              margin: '8px auto 0 auto'
            }}
            onClick={() => {
              onClose();
              navigate('/forgot-password');
            }}
          >
            ¿Olvidaste tu contraseña?
          </button>

          <div style={{ marginTop: '12px', textAlign: 'center' }}>
            <button
              type="button"
              className="btn-link"
              onClick={() => {
                onClose();
                navigate('/login');
              }}
            >
              ¿No tienes cuenta? Regístrate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalLogin;