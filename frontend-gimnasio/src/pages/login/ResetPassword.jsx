import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../hooks/useToast';
import './Login.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validaciones interactivas
  const isMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password && password === confirmPassword;

  useEffect(() => {
    if (!token) {
      setMessage('El enlace de recuperación es inválido o ha expirado.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Token no encontrado. No se puede restablecer la contraseña.');
      return;
    }

    if (!isMinLength || !hasLetter || !hasNumber) {
      toast.warning('La contraseña no cumple con las políticas de seguridad.');
      return;
    }

    if (!passwordsMatch) {
      toast.warning('Las contraseñas no coinciden.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await api.post('/auth/reset-password', {
        Token: token,
        Password: password
      });

      if (response.data.success) {
        toast.success(response.data.message || 'Contraseña restablecida correctamente.');
        setMessage('Contraseña actualizada con éxito. Redirigiendo al inicio de sesión...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setMessage(response.data.message || 'Error al restablecer la contraseña.');
      }
    } catch (error) {
      console.error('Error al restablecer la contraseña:', error);
      setMessage(error.response?.data?.message || 'Error al conectar con el servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-header">
          <h2>Restablecer Contraseña</h2>
          <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#b0b0b0', marginTop: '4px' }}>
            Ingresa tu nueva contraseña para recuperar el acceso a tu cuenta.
          </p>
        </div>

        {!token ? (
          <p className="message-box" style={{ color: '#ff6b6b' }}>
            Enlace de recuperación inválido o sin token de sesión.
          </p>
        ) : (
          <>
            <div className="form-group">
              <label htmlFor="new-password">Nueva Contraseña:</label>
              <input 
                type="password" 
                autoComplete="new-password"
                id="new-password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Mínimo 8 caracteres"
                required 
                enterKeyHint="next"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm-new-password">Confirmar Contraseña:</label>
              <input 
                type="password" 
                autoComplete="new-password"
                id="confirm-new-password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                placeholder="Repite la contraseña"
                required 
                enterKeyHint="done"
              />
            </div>

            {/* Panel de políticas de contraseña interactivo con estética premium */}
            <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '12px', borderRadius: '6px', fontSize: '0.85rem' }}>
              <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#e0e0e0' }}>Políticas de seguridad:</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li style={{ color: isMinLength ? '#4ade80' : '#f87171', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '1rem' }}>{isMinLength ? '✓' : '✗'}</span> Mínimo 8 caracteres
                </li>
                <li style={{ color: hasLetter ? '#4ade80' : '#f87171', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '1rem' }}>{hasLetter ? '✓' : '✗'}</span> Al menos una letra
                </li>
                <li style={{ color: hasNumber ? '#4ade80' : '#f87171', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '1rem' }}>{hasNumber ? '✓' : '✗'}</span> Al menos un número
                </li>
                <li style={{ color: passwordsMatch ? '#4ade80' : '#f87171', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '1rem' }}>{passwordsMatch ? '✓' : '✗'}</span> Las contraseñas coinciden
                </li>
              </ul>
            </div>

            <button 
              type="submit" 
              className="login-btn" 
              disabled={isSubmitting || !isMinLength || !hasLetter || !hasNumber || !passwordsMatch}
            >
              {isSubmitting ? 'Restableciendo...' : 'Cambiar Contraseña'}
            </button>
          </>
        )}

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

export default ResetPassword;
