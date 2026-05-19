import React, { useState } from 'react';
import './Login.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    IDNumber: '',
    FirstName: '',
    LastName: '',
    Email: '',
    Password: '',
    PhoneNumber: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí enviarías 'formData' a tu API de Node.js/ASP.NET para el INSERT en la tabla Users
    console.log("Datos enviados:", formData);
    setMessage(isLogin ? 'Sesión iniciada correctamente' : 'Usuario registrado en la tabla Users');
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