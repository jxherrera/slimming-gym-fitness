import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './Login.css'; // Reutilizamos los estilos principales del formulario de login

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setMessage('');

    try {
      // Intentamos enviar el correo al backend
      await api.post('/auth/forgot-password', { Email: email });
      // Siempre mostramos el mismo mensaje de éxito para evitar la enumeración de usuarios
      setMessage('Si el correo está registrado, recibirás un enlace de recuperación.');
    } catch (error) {
      console.error('Error solicitando recuperación de contraseña:', error);
      // Para evitar ataques de enumeración, incluso si el backend da error (ej. 404),
      // mostramos el mismo mensaje genérico a menos que sea un error de conexión grave.
      if (error.code === 'ERR_NETWORK') {
        setMessage('Error de conexión. Por favor comprueba tu red.');
      } else {
        setMessage('Si el correo está registrado, recibirás un enlace de recuperación.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <button type="button" className="back-arrow" onClick={() => navigate('/login')} aria-label="Volver al login">
          ⇦
        </button>
        <div className="form-header">
          <h2>Recuperar Contraseña</h2>
          <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#b0b0b0', marginTop: '4px' }}>
            Ingresa tu correo electrónico registrado y te enviaremos un enlace para restablecer tu cuenta.
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="recovery-email">Correo Electrónico:</label>
          <input 
            type="email" 
            inputMode="email"
            autoComplete="email"
            autoCapitalize="off"
            id="recovery-email" 
            name="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="ejemplo@correo.com"
            required 
            enterKeyHint="done"
          />
        </div>

        <button type="submit" className="login-btn" disabled={isSubmitting}>
          {isSubmitting ? 'Enviando...' : 'Enviar Enlace'}
        </button>

        {message && <p className="message-box" style={{ marginTop: '10px' }}>{message}</p>}

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
          <button type="button" className="toggle-link" onClick={() => navigate('/login')}>
            Volver al inicio de sesión
          </button>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;
