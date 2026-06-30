import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Login.css';

const INITIAL_FORM_STATE = {
  email: '',
  password: '',
  IDNumber: '',
  FirstName: '',
  LastName: '',
  PhoneNumber: '',
  RoleID: 1
};

const Login = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  
  const [message, setMessage] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setMessage('');
    setFormData(INITIAL_FORM_STATE);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsSubmitting(true);

    try {
      if (isLogin) {
        const result = await login(formData.email, formData.password);
        const role = (result.user?.role || 'member').toString().trim().toLowerCase();
        
        const routes = {
          admin: '/admin',
          coach: '/coach',
          member: '/member'
        };
        const redirectPath = routes[role] || '/member';
        
        const welcomeName = result.user?.firstName ? ` ${result.user.firstName}` : '';
        setMessage(`Sesión iniciada correctamente. ¡Bienvenido${welcomeName}!`);
        
        setTimeout(() => {
          navigate(redirectPath);
        }, 300);
      } else {
        const resData = await register(formData);
        if (resData.success) {
          setMessage(resData.message || 'Usuario registrado con éxito. Ahora puedes iniciar sesión.');
          setIsLogin(true);
          setFormData(INITIAL_FORM_STATE);
        } else {
          setMessage(resData.message || 'Ocurrió un error al registrar.');
        }
      }
    } catch (error) {
      console.error('Error durante la autenticación:', error);
      const errMsg = error.response?.data?.message || error.message || 'Error al conectar con el servidor.';
      setMessage(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <button type="button" className="back-arrow" onClick={() => navigate(-1)} aria-label="Volver">
          ⇦
        </button>
        <div className="form-header">
          <h2>{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</h2>
          <button type="button" className="toggle-link" onClick={toggleMode}>
            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Iniciar sesión'}
          </button>
        </div>

        {/* Campos exclusivos de Registro */}
        {!isLogin && (
          <>
            <div className="form-group">
              <label>ID Número:</label>
              <input type="text" name="IDNumber" value={formData.IDNumber} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Nombre:</label>
              <input type="text" name="FirstName" value={formData.FirstName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Apellido:</label>
              <input type="text" name="LastName" value={formData.LastName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Teléfono:</label>
              <input type="text" name="PhoneNumber" value={formData.PhoneNumber} onChange={handleChange} />
            </div>
          </>
        )}

        {/* Campos comunes */}
        <div className="form-group">
          <label>Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Contraseña:</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
        </div>

        <button type="submit" className="login-btn" disabled={isSubmitting}>
          {isSubmitting ? 'Procesando...' : (isLogin ? 'Entrar' : 'Crear cuenta')}
        </button>

        {message && <p className="message-box">{message}</p>}
      </form>
    </div>
  );
};

export default Login;