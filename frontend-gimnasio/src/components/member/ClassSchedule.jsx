import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaUser, FaCheck, FaTimes, FaFire, FaFilter } from 'react-icons/fa';
import { scheduleService } from '../../services/scheduleService';
import { useToast } from '../../hooks/useToast';
import './ClassSchedule.css';

const DAYS = ['Todos', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const ClassSchedule = ({ userId }) => {
  const toast = useToast();
  const [classes, setClasses] = useState([]);
  const [userReservations, setUserReservations] = useState([]);
  const [selectedDay, setSelectedDay] = useState('Todos');
  const [loading, setLoading] = useState(true);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const data = await scheduleService.getClasses();
      setClasses(data);
      if (userId) {
        const bookedIds = scheduleService.getUserReservations(userId);
        setUserReservations(bookedIds);
      }
    } catch (e) {
      console.error('Error al cargar agenda:', e);
      toast.error('Error al obtener la programación de clases.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, [userId]);

  const handleBook = async (classId, className) => {
    try {
      await scheduleService.bookClass(classId, userId);
      toast.success(`¡Cupo reservado exitosamente para ${className}!`);
      setUserReservations(prev => [...prev, classId]);
    } catch (e) {
      toast.error('Ocurrió un problema al procesar tu reserva.');
    }
  };

  const handleCancel = async (classId, className) => {
    try {
      await scheduleService.cancelBooking(classId, userId);
      toast.info(`Reserva cancelada para ${className}.`);
      setUserReservations(prev => prev.filter(id => id !== classId));
    } catch (e) {
      toast.error('Error al cancelar la reserva.');
    }
  };

  const filteredClasses = selectedDay === 'Todos'
    ? classes
    : classes.filter(c => c.day === selectedDay);

  return (
    <div className="schedule-card-container">
      <div className="schedule-header">
        <FaCalendarAlt className="schedule-icon" />
        <div>
          <h3>Agenda y Reserva de Clases Semanales</h3>
          <p>Asegura tu lugar en las sesiones grupales de Slimming Gym.</p>
        </div>
      </div>

      {/* Filtros de Días de la Semana */}
      <div className="days-filter-bar">
        <span className="filter-label"><FaFilter /> Filtrar por día:</span>
        <div className="days-btn-group">
          {DAYS.map(day => (
            <button
              key={day}
              className={`day-btn ${selectedDay === day ? 'active' : ''}`}
              onClick={() => setSelectedDay(day)}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Clases */}
      <div className="classes-grid">
        {filteredClasses.length > 0 ? (
          filteredClasses.map(cls => {
            const isBooked = userReservations.includes(cls.id);
            const isFull = cls.bookedCount >= cls.capacity && !isBooked;
            const percentage = Math.round((cls.bookedCount / cls.capacity) * 100);

            return (
              <div key={cls.id} className={`class-card ${isBooked ? 'booked' : ''}`}>
                <div className="class-top">
                  <span className={`category-badge ${cls.category.toLowerCase()}`}>{cls.category}</span>
                  <span className="class-day">{cls.day}</span>
                </div>

                <h4 className="class-title">{cls.name}</h4>

                <div className="class-details">
                  <div className="detail-item"><FaClock /> {cls.time}</div>
                  <div className="detail-item"><FaUser /> {cls.instructor}</div>
                </div>

                <div className="capacity-bar-box">
                  <div className="capacity-text">
                    <span>Cupos asignados</span>
                    <span>{cls.bookedCount} / {cls.capacity}</span>
                  </div>
                  <div className="capacity-track">
                    <div className="capacity-fill" style={{ width: `${percentage}%` }} />
                  </div>
                </div>

                {isBooked ? (
                  <button className="btn-cancel-reservation" onClick={() => handleCancel(cls.id, cls.name)}>
                    <FaTimes /> Cancelar Reserva
                  </button>
                ) : (
                  <button
                    className="btn-book-class"
                    onClick={() => handleBook(cls.id, cls.name)}
                    disabled={isFull}
                  >
                    {isFull ? 'Cupos Agotados' : <><FaCheck /> Reservar Mi Cupo</>}
                  </button>
                )}
              </div>
            );
          })
        ) : (
          <div className="no-classes">
            No hay clases programadas para el día seleccionado.
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassSchedule;
