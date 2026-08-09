import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaCalendarAlt, FaMoneyBillWave, FaUser, FaDumbbell, FaClock, FaChartLine, FaFilePdf } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { memberService } from '../../services/memberService';
import Spinner from '../../components/common/Spinner';
import Notifications from '../../components/common/Notifications';
import AlertModal from '../../components/common/AlertModal';
import SubscriptionStatus from '@/features/member/components/SubscriptionStatus';
import Payments from '@/features/member/components/Payments';
import UserProfile from '@/features/member/components/UserProfile';
import ClassSchedule from '@/features/member/components/ClassSchedule';
import ProgressChart from '@/features/member/components/ProgressChart';
import RoutinePdfExporter from '@/features/member/components/RoutinePdfExporter';
import './Member.css';
import api from '@/services/api';

const Member = () => {
  const { user } = useAuth();
  const toast = useToast();
  const userId = user?.userId || user?.id;

  const [searchParams, setSearchParams] = useSearchParams();
  const modeParam = searchParams.get('mode');
  const validTabs = ['subscription', 'schedule', 'progress', 'pdf', 'payments', 'profile'];

  const [activeTab, setActiveTab] = useState(validTabs.includes(modeParam) ? modeParam : 'subscription');

  useEffect(() => {
    if (modeParam && validTabs.includes(modeParam)) {
      if (activeTab !== modeParam) {
        setActiveTab(modeParam);
      }
    }
    const planIdParam = searchParams.get('planId');
    if (planIdParam) {
      setPreselectedPlanId(planIdParam);
    }
  }, [modeParam, searchParams]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ mode: tabId });
  };
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertReason, setAlertReason] = useState('expired');
  const [preselectedPlanId, setPreselectedPlanId] = useState('');

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

      // Cargar rutina actual del socio
      try {
        const res = await api.get(`/routines/user/${userId}/current`);
        const routineData = res.data;
        if (routineData.success && routineData.routine) {
          setRoutines([routineData.routine]);
        } else {
          setRoutines([]);
        }
      } catch (error) {
        console.error('Error al cargar rutinas:', error);
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
    setPreselectedPlanId(planId);
    handleTabChange('payments');
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
        onGoToPayment={() => handleTabChange('payments')}
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
        onRenovarClick={() => handleTabChange('payments')} 
      />

      {/* Navegación por Pestañas */}
      <div className="member-tabs-bar">
        <button 
          className={`tab-btn ${activeTab === 'subscription' ? 'active' : ''}`}
          onClick={() => handleTabChange('subscription')}
        >
          <FaCalendarAlt /> Estado y Planes
        </button>
        <button 
          className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => handleTabChange('schedule')}
        >
          <FaClock /> Reserva de Clases
        </button>
        <button 
          className={`tab-btn ${activeTab === 'progress' ? 'active' : ''}`}
          onClick={() => handleTabChange('progress')}
        >
          <FaChartLine /> Mi Progreso Físico
        </button>
        <button 
          className={`tab-btn ${activeTab === 'pdf' ? 'active' : ''}`}
          onClick={() => handleTabChange('pdf')}
        >
          <FaFilePdf /> Rutina en PDF
        </button>
        <button 
          className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => handleTabChange('payments')}
        >
          <FaMoneyBillWave /> Reportar Pago
        </button>
        <button 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => handleTabChange('profile')}
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
            initialPlanId={preselectedPlanId}
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
