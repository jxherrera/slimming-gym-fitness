import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/auth';

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    IDNumber: '',
    FirstName: '',
    LastName: '',
    Email: '',
    Password: '',
    PhoneNumber: '',
    RoleName: 'Member'
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const endpoint = isLogin ? `${API_BASE}/login` : `${API_BASE}/register`;
    const payload = isLogin
      ? { Email: formData.Email, Password: formData.Password }
      : {
          ...formData,
          RoleName: formData.RoleName || 'Member'
        };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Ocurrió un error en la petición.');
        return;
      }

      // 1. Extraemos el rol directamente (el backend ahora envía 'user.role' limpio)
      const role = (data.user?.role || '').toString().trim().toLowerCase();

      // 2. Evaluamos la ruta a la que debe ir basados solo en el nombre del rol
      const redirectPath = role === 'admin' 
        ? '/admin' 
        : role === 'coach' 
          ? '/coach' 
          : '/member';

      // 3. Mostramos mensaje de bienvenida y redirigimos
      const welcomeName = data.user?.firstName ? ` ${data.user.firstName}` : '';
      setMessage(`${data.message || (isLogin ? 'Sesión iniciada correctamente' : 'Usuario registrado con éxito')}. ¡Bienvenido${welcomeName}!`);

      navigate(redirectPath);

      // 4. Limpiamos el formulario si fue un registro exitoso
      if (!isLogin) {
        setFormData({
          IDNumber: '',
          FirstName: '',
          LastName: '',
          Email: '',
          Password: '',
          PhoneNumber: '',
          RoleName: 'Member'
        });
      }
    } catch (error) {
      console.error('Error al conectar con la API:', error);
      setMessage('No se pudo conectar con el servidor.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="form-header">
          <h2>{isLogin ? '¡Bienvenido!' : 'Registro de Socio'}</h2>
          <p>{isLogin ? 'Ingresa tus credenciales' : 'Completa tus datos personales'}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          
          {!isLogin && (
            <>
              <div className="input-row">
                <div className="input-group">
                  <label htmlFor="FirstName">Nombre</label>
                  <input type="text" id="FirstName" onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label htmlFor="LastName">Apellido</label>
                  <input type="text" id="LastName" onChange={handleChange} required />
                </div>
              </div>
              
              <div className="input-group">
                <label htmlFor="IDNumber">Identificación (Cédula/Pasaporte)</label>
                <input type="text" id="IDNumber" onChange={handleChange} required />
              </div>

              <div className="input-group">
                <label htmlFor="PhoneNumber">Teléfono</label>
                <input type="text" id="PhoneNumber" onChange={handleChange} />
              </div>

              <div className="input-group">
                <label htmlFor="RoleName">Rol</label>
                <select id="RoleName" value={formData.RoleName} onChange={handleChange}>
                  <option value="Member">Member</option>
                  <option value="Coach">Coach</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </>
          )}

          <div className="input-group">
            <label htmlFor="Email">Correo Electrónico</label>
            <input type="email" id="Email" onChange={handleChange} placeholder="nombre@ejemplo.com" required />
          </div>

          <div className="input-group">
            <label htmlFor="Password">Contraseña</label>
            <input type="password" id="Password" onChange={handleChange} placeholder="••••••••" required />
          </div>

          <button type="submit" className="submit-btn">
            {isLogin ? 'Iniciar Sesión' : 'Registrar Usuario'}
          </button>
        </form>

        <div className="toggle-container">
          <span>{isLogin ? "¿Eres nuevo?" : "¿Ya tienes cuenta?"}</span>
          <button className="toggle-btn" onClick={() => { setIsLogin(!isLogin); setMessage(''); }}>
            {isLogin ? "Crea una cuenta aquí" : "Inicia sesión"}
          </button>
        </div>

        {message && <p className="message-box">{message}</p>}
      </div>
    </div>
  );
};

export default Login;