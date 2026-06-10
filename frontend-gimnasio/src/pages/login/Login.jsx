import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/auth';

// Estado inicial limpio para evitar escribirlo dos veces
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
  const [message, setMessage] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setMessage(''); // Limpiar mensajes de error al cambiar de pestaña
    setFormData(INITIAL_FORM_STATE); // Resetear datos para evitar que se mezclen
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const endpoint = `${API_BASE}/${isLogin ? 'login' : 'register'}`;
    
    // Construcción del payload
    const payload = isLogin
      ? { Email: formData.email, Password: formData.password }
      : { ...formData, Email: formData.email, Password: formData.password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Ocurrió un error en la petición.');
        return;
      }

      // Lógica de redirección simplificada con un objeto (Diccionario)
      const role = (data.user?.role || 'member').toString().trim().toLowerCase();
      const routes = {
        admin: '/admin',
        coach: '/coach',
        member: '/member'
      };
      const redirectPath = routes[role] || '/member';

      const welcomeName = data.user?.firstName ? ` ${data.user.firstName}` : '';
      const successMsg = isLogin ? 'Sesión iniciada correctamente' : 'Usuario registrado con éxito';
      setMessage(`${data.message || successMsg}. ¡Bienvenido${welcomeName}!`);

      // Redirigir y limpiar si es registro
      navigate(redirectPath);
      if (!isLogin) setFormData(INITIAL_FORM_STATE);

    } catch (error) {
      console.error('Error al conectar con la API:', error);
      setMessage('No se pudo conectar con el servidor.');
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

        <button type="submit" className="login-btn">
          {isLogin ? 'Entrar' : 'Crear cuenta'}
        </button>

        {message && <p className="message-box">{message}</p>}
      </form>
    </div>
  );
};

export default Login;