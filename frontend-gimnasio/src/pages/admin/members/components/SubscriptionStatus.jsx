import React, { useState, useEffect } from 'react';
import api from '../../../../services/api';
import { FaCalendarAlt, FaClipboardList, FaArrowRight } from 'react-icons/fa';

const SubscriptionStatus = ({ subscription, onSelectPlan }) => {
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      setLoadingPlans(true);
      try {
        const response = await api.get('/plans');
        setPlans(response.data || []);
      } catch (error) {
        console.error('Error al obtener catálogo de planes:', error);
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  const hasSubscription = subscription && subscription.paymentStatus === 'P';
  const remainingDays = subscription ? Math.max(0, subscription.remainingDays) : 0;
  const durationDays = subscription ? subscription.durationDays : 30;
  const progressPercent = hasSubscription ? Math.min(100, Math.max(0, (remainingDays / durationDays) * 100)) : 0;
  const isWarningDays = remainingDays <= 7;

  return (
    <div className="tab-panel-content fade-in">
      
      {/* 1. Resumen y Barra de Progreso */}
      <div className="subscription-summary-box" style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)', marginBottom: '30px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaCalendarAlt style={{ color: '#ff3b3b' }} /> Estado de la Suscripción
        </h3>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            {subscription ? (
              <p style={{ fontSize: '1.05rem', margin: 0 }}>
                Plan activo: <strong style={{ color: '#ff3b3b' }}>{subscription.planName}</strong><br />
                <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
                  Vence el: {new Date(subscription.endDate).toLocaleDateString()}
                </span>
              </p>
            ) : (
              <p style={{ fontSize: '1.05rem', margin: 0, color: 'rgba(255,255,255,0.6)' }}>
                No tienes suscripción activa en este momento.
              </p>
            )}
          </div>

          {hasSubscription && (
            <div style={{ flexGrow: 1, maxWidth: '300px', textAlign: 'right' }}>
              <div style={{ fontWeight: '700', color: isWarningDays ? '#f59e0b' : '#10b981', fontSize: '1.1rem', marginBottom: '6px' }}>
                {remainingDays} días restantes
              </div>
              <div style={{ width: '100%', height: '10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '5px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    width: `${progressPercent}%`, 
                    height: '100%', 
                    background: isWarningDays ? '#f59e0b' : '#10b981',
                    boxShadow: isWarningDays ? '0 0 10px rgba(245,158,11,0.5)' : '0 0 10px rgba(16,185,129,0.5)',
                    transition: 'width 0.5s ease-out'
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Catálogo de Planes */}
      <div className="plans-catalog-section">
        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaClipboardList style={{ color: '#ff3b3b' }} /> Catálogo de Planes del Gimnasio
        </h3>

        {loadingPlans ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div style={{ height: '220px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}></div>
            <div style={{ height: '220px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}></div>
            <div style={{ height: '220px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}></div>
          </div>
        ) : (
          <div className="plans-catalog-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '25px' }}>
            {plans.map((plan) => {
              const isCurrentPlan = subscription && Number(subscription.planId) === Number(plan.PlanID) && hasSubscription;
              
              return (
                <div 
                  key={plan.PlanID} 
                  className={`plan-catalog-card ${isCurrentPlan ? 'plan-card-current' : ''}`}
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.02)', 
                    border: isCurrentPlan ? '2px solid #ff3b3b' : '1px solid rgba(255, 255, 255, 0.05)', 
                    borderRadius: '16px', 
                    padding: '24px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between',
                    boxShadow: isCurrentPlan ? '0px 8px 24px rgba(255, 59, 59, 0.15)' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div>
                    {isCurrentPlan && (
                      <span style={{ background: '#ff3b3b', color: '#fff', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '50px', display: 'inline-block', marginBottom: '12px', textTransform: 'uppercase' }}>
                        Plan Actual
                      </span>
                    )}
                    <h4 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 10px 0', color: '#fff' }}>{plan.PlanName}</h4>
                    <p style={{ fontSize: '1.8rem', fontWeight: '800', color: '#ff3b3b', margin: '0 0 8px 0' }}>
                      ${plan.Price} <span style={{ fontSize: '0.9rem', fontWeight: '400', color: 'rgba(255,255,255,0.5)' }}>/ USD</span>
                    </p>
                    <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', margin: '0 0 20px 0' }}>
                      Acceso total por <strong style={{ color: '#fff' }}>{plan.DurationDays} días</strong>.
                    </p>
                  </div>

                  <button
                    className="btn-select-plan"
                    onClick={() => onSelectPlan(plan.PlanID)}
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      borderRadius: '25px', 
                      border: 'none', 
                      background: isCurrentPlan ? 'rgba(255, 255, 255, 0.08)' : '#ff3b3b', 
                      color: '#fff', 
                      fontWeight: '600', 
                      cursor: 'pointer', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '8px',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {isCurrentPlan ? 'Renovar Plan' : 'Comprar Ahora'} <FaArrowRight size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default SubscriptionStatus;
