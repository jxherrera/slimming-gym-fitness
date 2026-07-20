import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaDumbbell, 
  FaUsers, 
  FaClock, 
  FaCheckCircle, 
  FaStar, 
  FaTrophy, 
  FaArrowRight, 
  FaHeartbeat, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaMapMarkerAlt 
} from 'react-icons/fa';
import './Home.css';

const heroImg = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-landing">
      {/* 1. HERO SECTION */}
      <section className="hero-section">
        <div className="hero-overlay">
          <img className="hero-bg-img" src={heroImg} alt="Slimming Gym Fitness Hero" />
        </div>

        <div className="hero-content">
          <div className="hero-badge">
            <FaTrophy className="badge-icon" /> El Gimnasio Premier de la Ciudad
          </div>
          <p className="hero-tagline">TRANSFORMA TU CUERPO</p>
          <h1 className="hero-title">ELEVA TU MENTE & ALCANZA TU MÁXIMO NIVEL</h1>
          <p className="hero-subtext">
            Equipamiento de última generación, entrenadores certificados de élite y rutinas personalizadas adaptadas a tus metas. Tu nueva versión comienza hoy.
          </p>

          <div className="hero-actions">
            <button className="btn-hero-primary" onClick={() => navigate('/planes')}>
              Ver Planes y Suscribirme <FaArrowRight />
            </button>
            <button className="btn-hero-secondary" onClick={() => navigate('/login')}>
              Acceso a Socios
            </button>
          </div>
        </div>
      </section>

      {/* 2. STATS BANNER */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-card">
            <h3>+1,500</h3>
            <p>Socios Activos</p>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-card">
            <h3>15+</h3>
            <p>Entrenadores de Élite</p>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-card">
            <h3>24/7</h3>
            <p>Acceso & Horario Flexible</p>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-card">
            <h3>99%</h3>
            <p>Clientes Satisfechos</p>
          </div>
        </div>
      </section>

      {/* 3. SERVICIOS & CARACTERÍSTICAS */}
      <section className="services-section">
        <div className="section-header">
          <span className="section-subtitle">¿POR QUÉ ELEGIRNOS?</span>
          <h2 className="section-title">SERVICIOS DE ALTO RENDIMIENTO</h2>
          <div className="title-underline"></div>
        </div>

        <div className="services-grid">
          <div className="service-card">
            <div className="service-icon-wrapper">
              <FaDumbbell />
            </div>
            <h3>Equipamiento de Élite</h3>
            <p>Maquinaria biomecánica de última generación y zona de peso libre optimizada para hipertrofia y fuerza.</p>
          </div>

          <div className="service-card">
            <div className="service-icon-wrapper">
              <FaUsers />
            </div>
            <h3>Coaches Certificados</h3>
            <p>Asesoría personalizada por profesionales del fitness con rutinas diseñadas a tu nivel y metas físicas.</p>
          </div>

          <div className="service-card">
            <div className="service-icon-wrapper">
              <FaClock />
            </div>
            <h3>Clases Grupales 24/7</h3>
            <p>Reservas para clases exclusivas de Spinning, CrossFit, Yoga y Funcional con instructores en vivo.</p>
          </div>

          <div className="service-card">
            <div className="service-icon-wrapper">
              <FaHeartbeat />
            </div>
            <h3>Seguimiento Nutricional</h3>
            <p>Evaluaciones de composición corporal (InBody) e informes de progreso en tiempo real dentro de tu panel.</p>
          </div>
        </div>
      </section>

      {/* 4. SECCIÓN DE PLANES BASE */}
      <section className="plans-preview-section">
        <div className="section-header">
          <span className="section-subtitle">MEMBRESÍAS DISPONIBLES</span>
          <h2 className="section-title">ELIGE TU PLAN DE ENTRENAMIENTO</h2>
          <div className="title-underline"></div>
        </div>

        <div className="plans-grid">
          {/* Plan Básico */}
          <div className="plan-card">
            <div className="plan-badge-top">Popular</div>
            <h3 className="plan-name">Plan Básico</h3>
            <p className="plan-duration">Acceso Mensual (30 días)</p>
            <div className="plan-price">
              <span className="currency">$</span>29<span className="cents">.99</span>
              <span className="period">/ mes</span>
            </div>
            <ul className="plan-features">
              <li><FaCheckCircle className="check-icon" /> Acceso ilimitado a zona de máquinas</li>
              <li><FaCheckCircle className="check-icon" /> Evaluación física inicial</li>
              <li><FaCheckCircle className="check-icon" /> Lockers y duchas de agua caliente</li>
              <li className="disabled"><FaCheckCircle className="check-icon" /> Coach asignado dedicado</li>
            </ul>
            <button className="btn-plan-select" onClick={() => navigate('/planes')}>
              Elegir Plan Básico
            </button>
          </div>

          {/* Plan Pro - Destacado */}
          <div className="plan-card featured">
            <div className="featured-banner">RECOMENDADO</div>
            <h3 className="plan-name">Plan Pro</h3>
            <p className="plan-duration">Acceso Trimestral (90 días)</p>
            <div className="plan-price">
              <span className="currency">$</span>79<span className="cents">.99</span>
              <span className="period">/ 3 meses</span>
            </div>
            <ul className="plan-features">
              <li><FaCheckCircle className="check-icon" /> Todos los beneficios del Plan Básico</li>
              <li><FaCheckCircle className="check-icon" /> Rutina digital personalizada en el panel</li>
              <li><FaCheckCircle className="check-icon" /> Acceso ilimitado a clases grupales</li>
              <li><FaCheckCircle className="check-icon" /> Acompañamiento con Entrenador</li>
            </ul>
            <button className="btn-plan-select featured-btn" onClick={() => navigate('/planes')}>
              Inscribirme Ahora
            </button>
          </div>

          {/* Plan VIP */}
          <div className="plan-card">
            <div className="plan-badge-top">Máximo Ahorro</div>
            <h3 className="plan-name">Plan VIP</h3>
            <p className="plan-duration">Acceso Anual (365 días)</p>
            <div className="plan-price">
              <span className="currency">$</span>279<span className="cents">.99</span>
              <span className="period">/ año</span>
            </div>
            <ul className="plan-features">
              <li><FaCheckCircle className="check-icon" /> Acceso VIP Preferencial a todas las sedes</li>
              <li><FaCheckCircle className="check-icon" /> Plan Nutricional personalizado</li>
              <li><FaCheckCircle className="check-icon" /> Asesoría 1-a-1 con Coach Máster</li>
              <li><FaCheckCircle className="check-icon" /> Invitado gratis 2 veces al mes</li>
            </ul>
            <button className="btn-plan-select" onClick={() => navigate('/planes')}>
              Elegir Plan VIP
            </button>
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIOS DE MIEMBROS */}
      <section className="testimonials-section">
        <div className="section-header">
          <span className="section-subtitle">HISTORIAS DE ÉXITO</span>
          <h2 className="section-title">LO QUE DICEN NUESTROS SOCIOS</h2>
          <div className="title-underline"></div>
        </div>

        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="stars-row">
              <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
            </div>
            <p className="testimonial-text">
              "Slimming Gym me cambió la vida. Con la rutina personalizada del coach Ariel bajé 12 kilos en 4 meses. Las instalaciones son insuperables."
            </p>
            <div className="testimonial-author">
              <div className="author-avatar">JP</div>
              <div>
                <h4>Juan Pérez</h4>
                <span>Socio Plan Pro</span>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="stars-row">
              <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
            </div>
            <p className="testimonial-text">
              "El panel web es increíble. Puedo reservar mis clases desde el celular y descargar mi rutina en PDF. 100% recomendado."
            </p>
            <div className="testimonial-author">
              <div className="author-avatar">MG</div>
              <div>
                <h4>María Gómez</h4>
                <span>Socio Plan VIP</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER PÚBLICO */}
      <footer className="home-footer">
        <div className="footer-container">
          <div className="footer-col brand">
            <h3 className="footer-logo">SLIMMING<span>GYM</span></h3>
            <p>El centro de entrenamiento y acondicionamiento físico diseñado para llevar tu potencial al siguiente nivel.</p>
          </div>

          <div className="footer-col">
            <h4>Contacto</h4>
            <p><FaMapMarkerAlt className="footer-icon" /> Av. Principal #123, Quito - Ecuador</p>
            <p><FaPhoneAlt className="footer-icon" /> +593 99 999 9999</p>
            <p><FaEnvelope className="footer-icon" /> info@slimminggym.com</p>
          </div>

          <div className="footer-col">
            <h4>Horarios de Atención</h4>
            <p>Lunes a Viernes: 05:00 AM - 10:00 PM</p>
            <p>Sábados: 06:00 AM - 08:00 PM</p>
            <p>Domingos: 07:00 AM - 02:00 PM</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Slimming Gym Fitness. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;