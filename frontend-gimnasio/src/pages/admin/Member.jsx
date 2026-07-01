import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaMoneyBillWave, FaUser, FaDumbbell, FaClock, FaChartLine, FaFilePdf } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { memberService } from '../../services/memberService';
import Spinner from '../../components/common/Spinner';
import Notifications from '../../components/common/Notifications';
import AlertModal from '../../components/common/AlertModal';
import SubscriptionStatus from '../../components/member/SubscriptionStatus';
import Payments from '../../components/member/Payments';
import UserProfile from '../../components/member/UserProfile';
import ClassSchedule from '../../components/member/ClassSchedule';
import ProgressChart from '../../components/member/ProgressChart';
import RoutinePdfExporter from '../../components/member/RoutinePdfExporter';
import './Member.css';

const Member = () => {
  const { user } = useAuth();
  const toast = useToast();
  const userId = user?.userId || user?.id;

  const [activeTab, setActiveTab] = useState('subscription');
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertReason, setAlertReason] = useState('expired');

  const fetchData = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [plansData, subData] = await Promise.all([
        memberService.getPlans(),
        memberService.getSubscription(userId)
      ]);

      setPlans(Array.isArray(plansData) ? plansData : []);
      
      if (subData.success && subData.subscription) {
        setSubscription(subData.subscription);
        const sub = subData.subscription;
        if (sub.paymentStatus !== 'P' || sub.remainingDays <= 0) {
          setAlertReason(sub.remainingDays <= 0 ? 'expired' : 'suspended');
          setShowAlertModal(true);
        }
      } else {
        setAlertReason('suspended');
        setShowAlertModal(true);
      }

      // Cargar rutinas del socio
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/routines/user/${userId}`);
        const routinesData = await res.json();
        if (routinesData.success) {
          setRoutines(routinesData.routines || []);
        }
      } catch (e) {
        console.error('Error al cargar rutinas:', e);
      }

    } catch (error) {
      console.error('Error al cargar datos del panel:', error);
      toast.error('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const handleSelectPlanFromCatalog = (planId) => {
    setActiveTab('payments');
  };

  if (loading) {
    return <Spinner fullPage text="Cargando panel de socio..." size="lg" />;
  }

  return (
    <div className="member-dashboard">
      <AlertModal 
        isOpen={showAlertModal} 
        onClose={() => setShowAlertModal(false)}
        reason={alertReason}
        onGoToPayment={() => setActiveTab('payments')}
      />

      <div className="member-header">
        <div>
          <h1>Bienvenido, {user?.firstName || user?.name || 'Socio'}</h1>
          <p>Consulta tu estado de membresía, reserva tus clases, mide tu progreso e imprime tus rutinas.</p>
        </div>
      </div>

      {/* Componente Notifications */}
      <Notifications 
        subscription={subscription} 
        onRenovarClick={() => setActiveTab('payments')} 
      />

      {/* Navegación por Pestañas */}
      <div className="member-tabs-bar">
        <button 
          className={`tab-btn ${activeTab === 'subscription' ? 'active' : ''}`}
          onClick={() => setActiveTab('subscription')}
        >
          <FaCalendarAlt /> Estado y Planes
        </button>
        <button 
          className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          <FaClock /> Reserva de Clases
        </button>
        <button 
          className={`tab-btn ${activeTab === 'progress' ? 'active' : ''}`}
          onClick={() => setActiveTab('progress')}
        >
          <FaChartLine /> Mi Progreso Físico
        </button>
        <button 
          className={`tab-btn ${activeTab === 'pdf' ? 'active' : ''}`}
          onClick={() => setActiveTab('pdf')}
        >
          <FaFilePdf /> Rutina en PDF
        </button>
        <button 
          className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          <FaMoneyBillWave /> Reportar Pago
        </button>
        <button 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <FaUser /> Mi Perfil y Entrenador
        </button>
      </div>

      {/* Área de Contenido Dinámico */}
      <div className="tab-content-area">
        {activeTab === 'subscription' && (
          <SubscriptionStatus 
            subscription={subscription} 
            plans={plans} 
            onSelectPlan={handleSelectPlanFromCatalog}
          />
        )}

        {activeTab === 'schedule' && (
          <ClassSchedule userId={userId} />
        )}

        {activeTab === 'progress' && (
          <ProgressChart userId={userId} />
        )}

        {activeTab === 'pdf' && (
          <RoutinePdfExporter routines={routines} user={user} />
        )}

        {activeTab === 'payments' && (
          <Payments 
            userId={userId} 
            plans={plans} 
            onPaymentSuccess={fetchData}
          />
        )}

        {activeTab === 'profile' && (
          <UserProfile 
            user={user} 
            onUpdateSuccess={fetchData}
          />
        )}
      </div>
    </div>
  );
};

export default Member;
