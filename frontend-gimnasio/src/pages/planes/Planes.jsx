import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaStar, FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import Skeleton from '../../components/common/Skeleton';
import './Planes.css';

const Planes = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
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
      .catch(err => console.error('Error al cargar planes:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectPlan = (planId) => {
    if (isAuthenticated) {
      navigate(`/member?mode=payments&planId=${planId}`);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="planes-page-container">
      <div className="planes-hero-header">
        <span className="planes-badge"><FaShieldAlt /> Garantía de Satisfacción</span>
        <h1>Nuestros Planes de Membresía</h1>
        <p>Elige el plan ideal para tus metas de acondicionamiento físico. Sin contratos forzosos.</p>
      </div>

      {loading ? (
        <div className="planes-grid-container">
          {[1, 2, 3].map((n) => (
            <div key={n} className="planes-card skeleton-card">
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
          <p>No se pudieron cargar los planes de membresía en este momento.</p>
          <p>Por favor vuelve a intentarlo más tarde o contacta con la administración del gimnasio.</p>
        </div>
      ) : (
        <div className="planes-grid-container">
          {plans.map((plan, index) => {
            const isPro = plan.PlanName.toLowerCase().includes('pro') || index === 1;
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
      )}
    </div>
  );
};

export default Planes;