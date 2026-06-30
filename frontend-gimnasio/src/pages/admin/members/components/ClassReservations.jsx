import React, { useState, useEffect } from 'react';
import api from '../../../../services/api';
import { useToast } from '../../../../context/ToastContext';
import { FaCalendarPlus, FaClock, FaUser, FaCheck, FaTimes, FaDumbbell } from 'react-icons/fa';

const ClassReservations = ({ user }) => {
  const userId = user?.userId;
  const { addToast } = useToast();

  const [classes, setClasses] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // Contiene ClassID en el que se ejecuta la acción

  // Días de la semana
  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const [selectedDayIndex, setSelectedDayIndex] = useState(0); // Lunes por defecto (0)

  const loadData = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [classesRes, reservationsRes] = await Promise.all([
        api.get('/classes'),
        api.get(`/classes/user/${userId}`)
      ]);

      if (classesRes.data.success) {
        setClasses(classesRes.data.classes || []);
      }
      if (reservationsRes.data.success) {
        setReservations(reservationsRes.data.reservations || []);
      }
    } catch (error) {
      console.error('Error al cargar clases/reservas:', error);
      addToast('Error al conectar con la API de reservas.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  // Convierte un objeto de fecha en un día de la semana (0 = Domingo, 1 = Lunes, etc.)
  // Lo mapeamos para que 1 = Lunes (0 en daysOfWeek), 0 = Domingo (6 en daysOfWeek)
  const getDayIndex = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDay(); // 0-6
    return day === 0 ? 6 : day - 1; // Ajuste para Lunes-Domingo
  };

  // Filtrar clases por el día seleccionado
  const filteredClasses = classes.filter((c) => getDayIndex(c.StartTime) === selectedDayIndex);

  const handleReserve = async (classId) => {
    setActionLoading(classId);
    try {
      const res = await api.post('/classes/reserve', { ClassID: classId, UserID: userId });
      if (res.data.success) {
        addToast('Reserva confirmada con éxito.', 'success');
        loadData();
      } else {
        addToast(res.data.message || 'Error al reservar.', 'error');
      }
    } catch (error) {
      console.error('Error reserving class:', error);
      addToast(error.response?.data?.message || 'Error al procesar reserva.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (reservationId, classId) => {
    setActionLoading(classId);
    try {
      const res = await api.post('/classes/cancel', { ReservationID: reservationId, UserID: userId });
      if (res.data.success) {
        addToast('Reserva cancelada exitosamente.', 'info');
        loadData();
      } else {
        addToast(res.data.message || 'Error al cancelar reserva.', 'error');
      }
    } catch (error) {
      console.error('Error canceling reservation:', error);
      addToast(error.response?.data?.message || 'Error al cancelar.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="tab-panel-content fade-in">
      <div className="classes-reservations-layout" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
        
        {/* Sección 1: Agenda Semanal de Clases */}
        <div className="classes-schedule-card" style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaCalendarPlus style={{ color: '#ff3b3b' }} /> Horarios de Clases
          </h3>

          {/* Selector de día (Lunes-Domingo) */}
          <div className="days-selector-nav" style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '25px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            {daysOfWeek.map((day, index) => (
              <button
                key={day}
                onClick={() => setSelectedDayIndex(index)}
                style={{
                  background: selectedDayIndex === index ? '#ff3b3b' : 'rgba(255,255,255,0.02)',
                  color: selectedDayIndex === index ? '#fff' : 'rgba(255,255,255,0.6)',
                  border: '1px solid ' + (selectedDayIndex === index ? '#ff3b3b' : 'rgba(255,255,255,0.05)'),
                  borderRadius: '20px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease'
                }}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Listado de clases para el día seleccionado */}
          <div className="classes-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {loading ? (
              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>Cargando agenda de clases...</p>
            ) : filteredClasses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 10px', color: 'rgba(255,255,255,0.4)', fontSize: '14px', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                No hay clases programadas para el día {daysOfWeek[selectedDayIndex]}.
              </div>
            ) : (
              filteredClasses.map((cls) => {
                const myReservation = reservations.find((r) => r.classId === cls.ClassID);
                const isReserved = !!myReservation;
                const isFull = cls.CurrentEnrollment >= cls.MaxCapacity;
                const startTime = new Date(cls.StartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const endTime = new Date(cls.EndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <div 
                    key={cls.ClassID}
                    style={{
                      background: isReserved ? 'rgba(255, 59, 59, 0.02)' : 'rgba(255,255,255,0.01)',
                      border: isReserved ? '1px solid rgba(255, 59, 59, 0.2)' : '1px solid rgba(255,255,255,0.04)',
                      borderRadius: '12px',
                      padding: '18px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '15px'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#fff' }}>{cls.ClassName}</h4>
                      <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{cls.Description}</p>
                      
                      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaClock style={{ color: '#ff3b3b' }} /> {startTime} - {endTime}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaUser style={{ color: '#ff3b3b' }} /> Entrenador: <strong>{cls.CoachName || 'No asignado'}</strong>
                        </span>
                        <span>
                          Cupo: <strong>{cls.CurrentEnrollment} / {cls.MaxCapacity}</strong>
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {isReserved ? (
                        <button
                          className="btn-cancel-reservation"
                          disabled={actionLoading === cls.ClassID}
                          onClick={() => handleCancel(myReservation.reservationId, cls.ClassID)}
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#ff3b3b',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <FaTimes /> {actionLoading === cls.ClassID ? 'Cancelando...' : 'Cancelar'}
                        </button>
                      ) : (
                        <button
                          disabled={isFull || actionLoading === cls.ClassID}
                          onClick={() => handleReserve(cls.ClassID)}
                          style={{
                            background: isFull ? 'rgba(255,255,255,0.02)' : '#ff3b3b',
                            border: 'none',
                            color: isFull ? 'rgba(255,255,255,0.3)' : '#fff',
                            padding: '8px 18px',
                            borderRadius: '20px',
                            fontWeight: '600',
                            cursor: isFull ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {isFull ? 'Lleno' : (actionLoading === cls.ClassID ? 'Reservando...' : 'Reservar')}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Sección 2: Mis Reservas Confirmadas */}
        <div className="classes-my-reservations-card" style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaCheck style={{ color: '#ff3b3b' }} /> Mis Reservas
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto' }}>
            {loading ? (
              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>Cargando tus reservas...</p>
            ) : reservations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 10px', color: 'rgba(255,255,255,0.4)', fontSize: '13px', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '10px' }}>
                No tienes reservas confirmadas en esta semana.
              </div>
            ) : (
              reservations.map((r) => {
                const date = new Date(r.startTime).toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'short' });
                const time = new Date(r.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <div
                    key={r.reservationId}
                    style={{
                      background: 'rgba(255,255,255,0.01)',
                      border: '1px solid rgba(255,255,255,0.03)',
                      borderRadius: '12px',
                      padding: '15px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <strong style={{ fontSize: '14px', color: '#fff' }}>{r.className}</strong>
                      <button
                        onClick={() => handleCancel(r.reservationId, r.classId)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ff3b3b',
                          cursor: 'pointer',
                          padding: '2px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title="Cancelar reserva"
                        disabled={actionLoading === r.classId}
                      >
                        <FaTimes size={14} />
                      </button>
                    </div>
                    
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <span>Fecha: <strong style={{ color: '#fff', textTransform: 'capitalize' }}>{date}</strong> a las {time}</span>
                      <span>Entrenador: {r.coachName || 'No asignado'}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ClassReservations;
