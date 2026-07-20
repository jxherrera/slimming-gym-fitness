import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaStar, FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import './Planes.css';

const Planes = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/plans`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPlans(data);
        } else if (data.plans) {
          setPlans(data.plans);
        }
      })
      .catch(err => console.error('Error al cargar planes:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectPlan = (planId) => {
    if (isAuthenticated) {
      navigate('/member?mode=payments');
    } else {
      navigate('/login');
    }
  };

  const defaultPlans = [
    { PlanID: 1, PlanName: 'Plan Básico (Mensual)', Price: 29.99, DurationDays: 30, isFeatured: false },
    { PlanID: 2, PlanName: 'Plan Pro (Trimestral)', Price: 79.99, DurationDays: 90, isFeatured: true },
    { PlanID: 3, PlanName: 'Plan VIP (Anual)', Price: 279.99, DurationDays: 365, isFeatured: false }
  ];

  const displayPlans = plans.length > 0 ? plans : defaultPlans;

  return (
    <div className="planes-page-container">
      <div className="planes-hero-header">
        <span className="planes-badge"><FaShieldAlt /> Garantía de Satisfacción</span>
        <h1>Nuestros Planes de Membresía</h1>
        <p>Elige el plan ideal para tus metas de acondicionamiento físico. Sin contratos forzosos.</p>
      </div>

      <div className="planes-grid-container">
        {displayPlans.map((plan, index) => {
          const isPro = plan.PlanName.includes('Pro') || index === 1;
          return (
            <div key={plan.PlanID || index} className={`planes-card ${isPro ? 'featured' : ''}`}>
              {isPro && <div className="planes-featured-tag"><FaStar /> MÁS POPULAR</div>}
              <h3 className="planes-card-title">{plan.PlanName}</h3>
              <p className="planes-card-days">{plan.DurationDays} Días de Acceso</p>
              
              <div className="planes-card-price">
                <span className="dollar">$</span>
                <span className="amount">{plan.Price}</span>
              </div>

              <ul className="planes-card-features">
                <li><FaCheckCircle className="check" /> Acceso a todas las máquinas</li>
                <li><FaCheckCircle className="check" /> Lockers y vestidores</li>
                <li><FaCheckCircle className="check" /> Asesoría en panel web</li>
                {isPro && <li><FaCheckCircle className="check" /> Clases grupales ilimitadas</li>}
              </ul>

              <button 
                className={`planes-card-btn ${isPro ? 'btn-featured' : ''}`}
                onClick={() => handleSelectPlan(plan.PlanID)}
              >
                {isAuthenticated ? 'Inscribirme en este Plan' : 'Unirme Ahora'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Planes;