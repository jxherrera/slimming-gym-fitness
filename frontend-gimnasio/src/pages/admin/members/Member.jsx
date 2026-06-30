import React, { useState, useEffect } from 'react';
import { FaUser, FaDumbbell, FaCalendarAlt, FaMoneyBillWave, FaSpinner } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import '../shared/admin-core.css';
import './components/MemberTabs.css';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import api from '../../../services/api';
import AlertModal from '../../../components/common/AlertModal';
import UserProfile from './components/UserProfile';
import SubscriptionStatus from './components/SubscriptionStatus';
import ClassReservations from './components/ClassReservations';
import ProgressCharts from './components/ProgressCharts';
import Payments from './components/Payments';

const Member = () => {
  const { user, logout, updateUser } = useAuth();
  const userId = user?.userId;

  // Control de Tema Oscuro/Claro desde Context
  const { isDarkMode, toggleTheme } = useTheme();
  const themeClass = isDarkMode ? 'theme-dark' : 'theme-light';
  const themeIcon = isDarkMode ? '☀️' : '🌙';

  // Estados para la carga de datos
  const [subscription, setSubscription] = useState(null);
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentOnly, setShowPaymentOnly] = useState(false);

  // Estados de navegación interna (Pestañas)
  const [activeTab, setActiveTab] = useState('perfil'); // 'perfil' | 'membresia' | 'clases' | 'progreso' | 'pagos'
  const [selectedPlanId, setSelectedPlanId] = useState('');

  // Consulta de suscripción y rutinas del socio
  const fetchData = async () => {
    if (!userId) return;
    try {
      setLoading(true);

      const [subRes, routinesRes] = await Promise.all([
        api.get(`/users/${userId}/subscription`),
        api.get(`/routines/user/${userId}`)
      ]);

      if (subRes.data.success) {
        setSubscription(subRes.data.subscription);
      }
      if (routinesRes.data.success) {
        setRoutines(routinesRes.data.routines);
      }
    } catch (error) {
      console.error('Error al cargar datos del panel:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  // Manejo de selección de plan desde el catálogo
  const handleSelectPlan = (planId) => {
    setSelectedPlanId(planId);
    setActiveTab('pagos');
  };

  // Exportar rutinas activas a PDF usando jsPDF
  const exportRoutinesToPDF = () => {
    if (routines.length === 0) return;
    
    const doc = new jsPDF();
    
    // Configurar Estilos y Fuentes
    doc.setFillColor(43, 37, 50); // Fondo oscuro en la cabecera
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("SLIMMING GYM FITNESS", 15, 25);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Rutina de Entrenamiento Personalizada", 15, 33);
    
    // Información del Socio
    doc.setTextColor(43, 37, 50);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Información del Socio", 15, 55);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Nombre: ${user?.firstName || 'Socio'} ${user?.lastName || ''}`, 15, 63);
    doc.text(`Email: ${user?.email}`, 15, 70);
    doc.text(`Fecha de Exportación: ${new Date().toLocaleDateString()}`, 15, 77);
    
    doc.setDrawColor(229, 231, 235);
    doc.line(15, 83, 195, 83); // Divisor
    
    // Listado de Rutinas
    let currentY = 95;
    
    routines.forEach((routine, index) => {
      // Dibujar caja de rutina
      doc.setFillColor(249, 250, 251);
      doc.rect(15, currentY, 180, 40, 'F');
      doc.setDrawColor(229, 231, 235);
      doc.rect(15, currentY, 180, 40, 'S');
      
      doc.setTextColor(43, 37, 50);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(`${index + 1}. ${routine.RoutineName || 'Rutina de Entrenamiento'}`, 20, currentY + 10);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Objetivo: ${routine.Goal}`, 20, currentY + 20);
      doc.text(`Entrenador: ${routine.CoachName || 'No asignado'}`, 20, currentY + 28);
      
      currentY += 50;
      
      // Manejo de salto de página si hay muchas rutinas
      if (currentY > 260) {
        doc.addPage();
        currentY = 20;
      }
    });
    
    // Guardar PDF
    doc.save(`Rutina_${user?.firstName || 'Socio'}.pdf`);
  };

  if (loading) {
    return (
      <div className="admin-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <FaSpinner className="spinner" style={{ fontSize: '3rem', animation: 'spin 1s linear infinite', color: '#ff3b3b' }} />
      </div>
    );
  }

  // Verificación de membresía activa
  const hasSubscription = subscription && subscription.paymentStatus === 'P' && subscription.remainingDays > 0;

  // Render para usuarios bloqueados (membresía inactiva)
  if (!hasSubscription && !showPaymentOnly) {
    const isUnderReview = subscription && subscription.paymentRequestStatus === 'P';
    return (
      <div className={`admin-page ${themeClass}`} style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <AlertModal
          isOpen={true}
          title={isUnderReview ? "Pago en Revisión" : "Acceso Restringido"}
          message={
            isUnderReview
              ? "Tu comprobante de pago está siendo revisado por el administrador. Restableceremos tu acceso a las rutinas y reservas tan pronto como sea aprobado."
              : "Tu membresía de Slimming Gym se encuentra inactiva, vencida o suspendida. Por favor, reporta un pago de transferencia o contacta al administrador para reactivar tu cuenta."
          }
          actions={
            <>
              {!isUnderReview && (
                <button 
                  className="btn-pill-blue" 
                  onClick={() => setShowPaymentOnly(true)}
                  style={{ padding: '12px', width: '100%', fontWeight: '600', cursor: 'pointer' }}
                >
                  Reportar Pago
                </button>
              )}
              <button 
                className="btn-modal-cancel" 
                onClick={logout}
                style={{ padding: '12px', width: '100%', fontWeight: '600', marginTop: '10px', cursor: 'pointer' }}
              >
                Cerrar Sesión
              </button>
            </>
          }
        />
      </div>
    );
  }

  // Vista restringida del formulario de pagos (cuando el usuario vencido pulsa "Reportar Pago")
  if (!hasSubscription && showPaymentOnly) {
    return (
      <div className={`admin-page ${themeClass} fade-in`} style={{ padding: '20px' }}>
        <div className="settings-main-card" style={{ maxWidth: '700px', margin: '40px auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
            <button 
              type="button" 
              className="back-arrow" 
              onClick={() => setShowPaymentOnly(false)} 
              aria-label="Volver"
              style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' }}
            >
              ⇦
            </button>
            <h2 className="settings-title" style={{ margin: 0 }}>Reportar Pago de Membresía</h2>
          </div>
          
          <Payments 
            user={user} 
            subscription={subscription} 
            selectedPlanId={selectedPlanId}
            setSelectedPlanId={setSelectedPlanId}
            onPaymentSuccess={fetchData}
          />
        </div>
      </div>
    );
  }

  // Panel del socio principal desbloqueado
  return (
    <div className={`admin-page ${themeClass} fade-in`} style={{ padding: '20px' }}>
      <div className="settings-main-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Cabecera del Panel */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h2 className="settings-title" style={{ margin: 0 }}>Panel de Socio</h2>
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Cambiar tema"
            style={{ width: '40px', height: '40px', borderRadius: '10px' }}
          >
            {themeIcon}
          </button>
        </div>
        <p style={{ color: '#8b8593', marginBottom: '40px', fontSize: '15px' }}>
          Bienvenido, <strong>{user?.firstName || 'Socio'}</strong>. Gestiona tu membresía, pagos y datos desde aquí.
        </p>

        {/* Navegación por pestañas */}
        <div className="member-tabs-nav">
          <button 
            className={`member-tab-btn ${activeTab === 'perfil' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('perfil')}
          >
            <FaUser /> Mi Perfil
          </button>
          <button 
            className={`member-tab-btn ${activeTab === 'membresia' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('membresia')}
          >
            <FaCalendarAlt /> Mi Membresía
          </button>
          <button 
            className={`member-tab-btn ${activeTab === 'clases' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('clases')}
          >
            🗓️ Clases y Reservas
          </button>
          <button 
            className={`member-tab-btn ${activeTab === 'progreso' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('progreso')}
          >
            📊 Mi Progreso
          </button>
          <button 
            className={`member-tab-btn ${activeTab === 'pagos' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('pagos')}
          >
            <FaMoneyBillWave /> Pagos e Historial
          </button>
        </div>

        {/* Contenido dinámico de las pestañas */}
        {activeTab === 'perfil' && (
          <div className="tab-container">
            <UserProfile user={user} onUpdateUser={updateUser} />
            
            {/* Mi Rutina del Día (Se muestra en la pestaña de Perfil) */}
            <div style={{ marginTop: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaDumbbell style={{ color: '#ff3b3b' }} /> Mi Rutina del Día
                </h3>
                {routines.length > 0 && (
                  <button
                    onClick={exportRoutinesToPDF}
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    📥 Descargar PDF
                  </button>
                )}
              </div>
              
              {routines.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {routines.map((routine) => (
                    <div 
                      key={routine.RoutineID} 
                      style={{ 
                        background: 'rgba(255, 255, 255, 0.02)', 
                        border: '1px solid rgba(255, 255, 255, 0.05)', 
                        padding: '20px', 
                        borderRadius: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', color: '#fff' }}>{routine.RoutineName || 'Rutina de Entrenamiento'}</h4>
                        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                          Entrenador: <strong style={{ color: '#fff' }}>{routine.CoachName || 'No asignado'}</strong>
                        </span>
                      </div>
                      <span style={{ background: 'rgba(255,59,59,0.1)', color: '#ff3b3b', padding: '4px 12px', borderRadius: '50px', fontSize: '12px', fontWeight: '700' }}>
                        {routine.Goal}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 10px', color: 'rgba(255,255,255,0.4)', fontSize: '14px', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                  No tienes rutinas asignadas hoy. Consulta a tu entrenador personal.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'membresia' && (
          <SubscriptionStatus 
            subscription={subscription} 
            onSelectPlan={handleSelectPlan} 
          />
        )}

        {activeTab === 'clases' && (
          <ClassReservations user={user} />
        )}

        {activeTab === 'progreso' && (
          <ProgressCharts user={user} />
        )}

        {activeTab === 'pagos' && (
          <Payments 
            user={user} 
            subscription={subscription} 
            selectedPlanId={selectedPlanId}
            setSelectedPlanId={setSelectedPlanId}
            onPaymentSuccess={fetchData}
          />
        )}

      </div>
    </div>
  );
};

export default Member;
