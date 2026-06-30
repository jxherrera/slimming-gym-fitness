import React from 'react';
import { FaCalendarAlt, FaCheckCircle, FaStar, FaFire, FaRegClock } from 'react-icons/fa';
import './SubscriptionStatus.css';

const SubscriptionStatus = ({ subscription, plans = [], onSelectPlan }) => {
  const hasSubscription = subscription && subscription.paymentStatus === 'P';
  const remainingDays = subscription ? Math.max(0, subscription.remainingDays) : 0;
  const durationDays = subscription ? subscription.durationDays : 30;
  const progressPercent = hasSubscription ? Math.min(100, Math.max(0, (remainingDays / durationDays) * 100)) : 0;
  const isWarningDays = remainingDays <= 7;

  return (
    <div className="subscription-container">
      {/* Estado Actual e Indicador Gráfico */}
      <div className="subscription-card active-plan-card">
        <div className="card-header-sub">
          <FaCalendarAlt className="header-icon" />
          <div>
            <h3>Tu Membresía Actual</h3>
            <p>Detalles de vigencia y progreso del plan en curso.</p>
          </div>
        </div>

        {subscription ? (
          <div className="subscription-body">
            <div className="plan-summary-row">
              <div className="plan-badge-title">
                <span className="plan-name-tag">{subscription.planName}</span>
                <span className={`status-pill ${hasSubscription ? 'active' : 'pending'}`}>
                  {hasSubscription ? 'Activa' : 'Pendiente / Inactiva'}
                </span>
              </div>
              <div className="plan-dates-info">
                <span>Vence el: <strong>{new Date(subscription.endDate).toLocaleDateString()}</strong></span>
              </div>
            </div>

            {hasSubscription && (
              <div className="progress-section">
                <div className="progress-labels">
                  <span>Días Restantes</span>
                  <span className="percent-text">{Math.round(progressPercent)}%</span>
                </div>
                <div className="progress-bar-track">
                  <div
                    className={`progress-bar-fill-graphic ${isWarningDays ? 'warning-fill' : ''}`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="days-counter">
                  <FaRegClock /> {remainingDays} días disponibles de {durationDays} días totales
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="no-sub-box">
            <p>Aún no posees una suscripción activa. Explora nuestro catálogo y elige el plan perfecto para ti.</p>
          </div>
        )}
      </div>

      {/* Catálogo Interactivo de Planes */}
      <div className="catalog-section">
        <div className="catalog-title">
          <h2><FaFire style={{ color: '#ff3b3b' }} /> Catálogo de Planes y Membresías</h2>
          <p>Selecciona la opción que mejor se adapte a tus metas de entrenamiento.</p>
        </div>

        <div className="plans-grid">
          {plans.map((plan) => {
            const isCurrent = subscription && String(subscription.planId) === String(plan.PlanID);
            return (
              <div key={plan.PlanID} className={`plan-card ${isCurrent ? 'current-plan' : ''}`}>
                {isCurrent && <div className="current-badge"><FaStar /> Tu Plan Actual</div>}
                <h4 className="catalog-plan-name">{plan.PlanName}</h4>
                <div className="catalog-plan-price">
                  <span className="currency">$</span>
                  <span className="amount">{plan.Price}</span>
                  <span className="period">/ {plan.DurationDays} días</span>
                </div>

                <ul className="plan-features-list">
                  <li><FaCheckCircle className="check-feat" /> Acceso ilimitado a máquinas</li>
                  <li><FaCheckCircle className="check-feat" /> Rutinas personalizadas</li>
                  <li><FaCheckCircle className="check-feat" /> Evaluación física mensual</li>
                  <li><FaCheckCircle className="check-feat" /> Vestidores y lockers</li>
                </ul>

                <button
                  className={`select-plan-btn ${isCurrent ? 'btn-disabled' : ''}`}
                  onClick={() => onSelectPlan && onSelectPlan(plan.PlanID)}
                  disabled={isCurrent}
                >
                  {isCurrent ? 'Plan Actual' : 'Seleccionar Plan'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionStatus;
