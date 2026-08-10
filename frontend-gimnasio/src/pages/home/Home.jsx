import React, { useState, useEffect } from 'react';
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
import api from '../../services/api';
import './Home.css';
import Skeleton from '../../components/common/Skeleton';
import { siteConfig } from '../../config/site';

const heroImg = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop";

const getPlanDetails = (plan, index) => {
  const name = String(plan.PlanName).toLowerCase();
  if (name.includes('vip') || name.includes('anual') || name.includes('año')) {
    return {
      badge: 'Máximo Ahorro',
      period: '/ año',
      isFeatured: false,
      features: [
        { text: 'Acceso VIP Preferencial a todas las sedes', enabled: true },
        { text: 'Plan Nutricional personalizado', enabled: true },
        { text: 'Asesoría 1-a-1 con Coach Máster', enabled: true },
        { text: 'Invitado gratis 2 veces al mes', enabled: true }
      ]
    };
  } else if (name.includes('pro') || name.includes('trimestral') || name.includes('3 meses') || index === 1) {
    return {
      badge: 'RECOMENDADO',
      period: '/ 3 meses',
      isFeatured: true,
      features: [
        { text: 'Todos los beneficios del Plan Básico', enabled: true },
        { text: 'Rutina digital personalizada en el panel', enabled: true },
        { text: 'Acceso ilimitado a clases grupales', enabled: true },
        { text: 'Acompañamiento con Entrenador', enabled: true }
      ]
    };
  } else {
    return {
      badge: 'Popular',
      period: '/ mes',
      isFeatured: false,
      features: [
        { text: 'Acceso ilimitado a zona de máquinas', enabled: true },
        { text: 'Evaluación física inicial', enabled: true },
        { text: 'Lockers y duchas de agua caliente', enabled: true },
        { text: 'Coach asignado dedicado', enabled: false }
      ]
    };
  }
};

const Home = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/plans')
      .then(res => {
        if (Array.isArray(res.data)) {
          setPlans(res.data);
        } else if (res.data && Array.isArray(res.data.plans)) {
          setPlans(res.data.plans);
        }
      })
      .catch(err => {
        console.error('Error al cargar planes desde la API:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="home-landing">
      {/* 1. HERO SECTION */}
      <section className="hero-section">
        <div className="hero-overlay">
          {/* Imagen visible al entrar: se carga con prioridad, nunca diferida */}
          <img
            className="hero-bg-img"
            src={heroImg}
            alt="Slimming Gym Fitness Hero"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
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

        {loading ? (
          <div className="plans-grid">
            {[1, 2, 3].map((n) => (
              <div key={n} className="plan-card skeleton-card">
                <Skeleton type="text" width="60%" height={24} style={{ marginBottom: '16px' }} />
                <Skeleton type="text" width="40%" height={16} style={{ marginBottom: '24px' }} />
                <Skeleton type="text" width="70%" height={32} style={{ marginBottom: '32px' }} />
                <Skeleton type="text" width="100%" height={12} count={4} style={{ marginBottom: '12px' }} />
                <Skeleton type="text" width="100%" height={40} style={{ marginTop: '24px', borderRadius: '8px' }} />
              </div>
            ))}
          </div>
        ) : plans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.6)' }}>
            <p>No se pudieron cargar los planes en este momento.</p>
            <p>Por favor contacta con nosotros al <strong>{siteConfig.contact.phone}</strong> o escribe a <strong>{siteConfig.contact.email}</strong> para recibir más información.</p>
          </div>
        ) : (
          <div className="plans-grid">
            {plans.map((plan, index) => {
              const details = getPlanDetails(plan, index);
              const priceStr = String(plan.Price);
              const dotIndex = priceStr.indexOf('.');
              let integerPart = priceStr;
              let decimalPart = '00';
              if (dotIndex !== -1) {
                integerPart = priceStr.substring(0, dotIndex);
                decimalPart = priceStr.substring(dotIndex + 1).padEnd(2, '0').substring(0, 2);
              }

              return (
                <div 
                  key={plan.PlanID || index} 
                  className={`plan-card ${details.isFeatured ? 'featured' : ''}`}
                >
                  {details.isFeatured && <div className="featured-banner">RECOMENDADO</div>}
                  {!details.isFeatured && details.badge && <div className="plan-badge-top">{details.badge}</div>}
                  
                  <h3 className="plan-name">{plan.PlanName}</h3>
                  <p className="plan-duration">Acceso por {plan.DurationDays} días</p>
                  
                  <div className="plan-price">
                    <span className="currency">$</span>
                    {integerPart}
                    <span className="cents">.{decimalPart}</span>
                    <span className="period">{details.period}</span>
                  </div>

                  <ul className="plan-features">
                    {details.features.map((feat, idx) => (
                      <li key={idx} className={feat.enabled ? '' : 'disabled'}>
                        <FaCheckCircle className="check-icon" /> {feat.text}
                      </li>
                    ))}
                  </ul>

                  <button 
                    className={`btn-plan-select ${details.isFeatured ? 'featured-btn' : ''}`}
                    onClick={() => navigate('/planes')}
                  >
                    {details.isFeatured ? 'Inscribirme Ahora' : `Elegir ${plan.PlanName}`}
                  </button>
                </div>
              );
            })}
          </div>
        )}
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
            <p><FaMapMarkerAlt className="footer-icon" /> {siteConfig.contact.address}</p>
            <p><FaPhoneAlt className="footer-icon" /> {siteConfig.contact.phone}</p>
            <p><FaEnvelope className="footer-icon" /> {siteConfig.contact.email}</p>
          </div>

          <div className="footer-col">
            <h4>Horarios de Atención</h4>
            <p>{siteConfig.schedule.weekdays}</p>
            <p>{siteConfig.schedule.saturdays}</p>
            <p>{siteConfig.schedule.sundays}</p>
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