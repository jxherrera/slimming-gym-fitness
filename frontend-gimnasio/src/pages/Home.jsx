import React from 'react';
import './Home.css';

// Usamos la URL que te pasé directamente como una constante
const heroImg = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop"; 

const Home = () => {
  return (
    <div className="home">
      <div className="hero">
        <div className="mask">
          <img className="into-img" src={heroImg} alt="Gym Hero" />
        </div>
        <div className="content">
          <p>Transforma tu cuerpo,</p>
          <h1>eleva tu mente.</h1>
          <p className="subtext">El mejor equipamiento, entrenadores de élite y un ambiente diseñado para que alcances tu máximo potencial. Tu evolución comienza hoy.</p>
          <div>
            <button className="btn">Únete Ahora</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;