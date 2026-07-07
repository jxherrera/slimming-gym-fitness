import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import { scheduleService } from '../../../services/scheduleService';
import api from '../../../services/api';
import { FiCalendar, FiClock, FiPlus, FiTrash2, FiUser, FiUsers, FiBriefcase, FiEdit2 } from 'react-icons/fi';
import { useToast } from '../../../hooks/useToast';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../shared/admin-core.css';
import './AdminHorarios.css';

// Configurar localizador en español
moment.locale('es');
const localizer = momentLocalizer(moment);

const CustomToolbar = ({ label, onView, onNavigate, views, view, localizer: tLocalizer }) => {
  const goToBack = () => onNavigate('PREV');
  const goToNext = () => onNavigate('NEXT');
  const goToCurrent = () => onNavigate('TODAY');

  return (
    <div className="custom-calendar-toolbar">
      <div className="toolbar-nav">
        <button className="toolbar-btn" onClick={goToCurrent}>Hoy</button>
        <button className="toolbar-btn" onClick={goToBack}>Ant</button>
        <button className="toolbar-btn" onClick={goToNext}>Sig</button>
      </div>
      <div className="toolbar-label">
        {label}
      </div>
      <div className="toolbar-views">
        {views.map(v => (
          <button 
            key={v} 
            className={`toolbar-btn ${view === v ? 'active' : ''}`}
            onClick={() => onView(v)}
          >
            {tLocalizer.messages[v]}
          </button>
        ))}
      </div>
    </div>
  );
};

const AdminHorarios = () => {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const modeParam = searchParams.get('mode');
  
  // Datos principales
  const [classes, setClasses] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [events, setEvents] = useState([]);
  
  // Estado de carga y mensajes
  const [loading, setLoading] = useState(true);
  const [formMode, setFormMode] = useState(modeParam === 'schedule' ? 'schedule' : 'class'); // 'class' | 'schedule'
  
  useEffect(() => {
    if (modeParam === 'class' || modeParam === 'schedule') {
      if (formMode !== modeParam) {
        setFormMode(modeParam);
        resetForms();
      }
    }
  }, [modeParam]);

  const handleFormModeChange = (mode) => {
    setFormMode(mode);
    setSearchParams({ mode });
    resetForms();
  };

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Modal state
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Calendar controlled state
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState('week');
  
  // Formularios
  const [classForm, setClassForm] = useState({
    ClassName: '',
    Description: '',
    CoachID: '',
    MaxCapacity: 20,
    StartTime: '',
    EndTime: ''
  });

  const [scheduleForm, setScheduleForm] = useState({
    CoachID: '',
    StartTime: '',
    EndTime: '',
    Title: 'Turno de Trabajo'
  });

  // Entrenadores disponibles dinámicamente según horario
  const [availableCoaches, setAvailableCoaches] = useState([]);

  // Cargar datos al montar el componente
  const loadData = async () => {
    try {
      setLoading(true);
      const [classesData, schedulesData, coachesRes] = await Promise.all([
        scheduleService.getClasses(),
        scheduleService.getCoachSchedules(),
        api.get('/users/role/coach').catch(() => ({ data: { success: false, users: [] } }))
      ]);

      setClasses(classesData || []);
      setSchedules(schedulesData || []);
      
      const coachesList = coachesRes.data?.users || [];
      setCoaches(coachesList);

      // Mapear eventos para react-big-calendar
      formatEvents(classesData || [], schedulesData || []);
    } catch (error) {
      console.error('Error al cargar datos de agenda:', error);
      toast.error('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Dar formato a las clases y turnos para el calendario
  const formatEvents = (classesList, schedulesList) => {
    const formattedClasses = classesList.map(c => ({
      id: `class-${c.ClassID || c.id}`,
      type: 'class',
      rawId: c.ClassID || c.id,
      title: `Clase: ${c.ClassName} (Coach: ${c.CoachName || 'N/A'})`,
      start: new Date(c.StartTime),
      end: new Date(c.EndTime),
      color: '#3b82f6', // Azul para clases
      original: c
    }));

    const formattedSchedules = schedulesList.map(s => ({
      id: `sched-${s.id}`,
      type: 'schedule',
      rawId: s.id,
      title: `Horario: ${s.title || 'Turno'} (${s.coachName || 'Coach'})`,
      start: new Date(s.startTime),
      end: new Date(s.endTime),
      color: '#10b981', // Verde para turnos de trabajo
      original: s
    }));

    setEvents([...formattedClasses, ...formattedSchedules]);
  };

  const isCoachAvailable = (coachId, start, end, classIdToExclude = null) => {
    const checkStart = new Date(start);
    const checkEnd = new Date(end);

    if (isNaN(checkStart.getTime()) || isNaN(checkEnd.getTime())) return true;

    const classConflict = classes.some(c => {
      if (classIdToExclude && Number(c.ClassID || c.id) === Number(classIdToExclude)) return false;
      if (Number(c.CoachID) !== Number(coachId)) return false;
      const classStart = new Date(c.StartTime);
      const classEnd = new Date(c.EndTime);
      return (checkStart < classEnd && checkEnd > classStart);
    });

    if (classConflict) return false;

    const scheduleConflict = schedules.some(s => {
      if (formMode === 'schedule' && isEditing && Number(s.id) === Number(editingId)) return false;
      
      if (Number(s.coachId || s.CoachID) !== Number(coachId)) return false;
      const schedStart = new Date(s.startTime);
      const schedEnd = new Date(s.endTime);
      return (checkStart < schedEnd && checkEnd > schedStart);
    });

    if (formMode === 'schedule' && scheduleConflict) return false;

    return true;
  };

  useEffect(() => {
    const start = formMode === 'class' ? classForm.StartTime : scheduleForm.StartTime;
    const end = formMode === 'class' ? classForm.EndTime : scheduleForm.EndTime;

    if (start && end) {
      const available = coaches.filter(coach => {
        const coachId = coach.UserID || coach.id;
        const excludeId = isEditing && formMode === 'class' ? editingId : null;
        return isCoachAvailable(coachId, start, end, excludeId);
      });
      setAvailableCoaches(available);

      const currentSelected = formMode === 'class' ? classForm.CoachID : scheduleForm.CoachID;
      if (currentSelected && !available.some(c => String(c.UserID || c.id) === String(currentSelected))) {
        if (formMode === 'class') {
          setClassForm(prev => ({ ...prev, CoachID: '' }));
        } else {
          setScheduleForm(prev => ({ ...prev, CoachID: '' }));
        }
        toast.warning('El entrenador seleccionado previamente ya no está disponible en este horario.');
      }
    } else {
      setAvailableCoaches(coaches);
    }
  }, [classForm.StartTime, classForm.EndTime, scheduleForm.StartTime, scheduleForm.EndTime, formMode, classes, schedules, coaches, isEditing, editingId]);

  const resetForms = () => {
    setClassForm({ ClassName: '', Description: '', CoachID: '', MaxCapacity: 20, StartTime: '', EndTime: '' });
    setScheduleForm({ CoachID: '', StartTime: '', EndTime: '', Title: 'Turno de Trabajo' });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleSelectSlot = ({ start, end }) => {
    const formatDateTimeLocal = (date) => {
      const offset = date.getTimezoneOffset();
      const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
      return adjustedDate.toISOString().substring(0, 16);
    };

    const startStr = formatDateTimeLocal(start);
    const endStr = formatDateTimeLocal(end);

    if (formMode === 'class') {
      setClassForm(prev => ({ ...prev, StartTime: startStr, EndTime: endStr }));
    } else {
      setScheduleForm(prev => ({ ...prev, StartTime: startStr, EndTime: endStr }));
    }
    toast.info(`Horario seleccionado: ${moment(start).format('LLL')} a ${moment(end).format('LT')}`);
  };

  const handleClassSubmit = async (e) => {
    e.preventDefault();
    const { ClassName, CoachID, StartTime, EndTime, MaxCapacity, Description } = classForm;

    if (!ClassName || !CoachID || !StartTime || !EndTime) {
      toast.warning('Por favor completa todos los campos.');
      return;
    }

    if (new Date(StartTime) >= new Date(EndTime)) {
      toast.error('La fecha de fin debe ser posterior a la de inicio.');
      return;
    }

    if (!isCoachAvailable(CoachID, StartTime, EndTime, isEditing ? editingId : null)) {
      toast.error('Conflicto: El entrenador seleccionado ya está ocupado en este horario.');
      return;
    }

    const selectedCoach = coaches.find(c => String(c.UserID || c.id) === String(CoachID));

    const payload = {
      ClassName,
      Description,
      CoachID: Number(CoachID),
      CoachName: selectedCoach ? `${selectedCoach.firstName || selectedCoach.name} ${selectedCoach.lastName || ''}`.trim() : 'Coach',
      MaxCapacity: Number(MaxCapacity),
      StartTime,
      EndTime
    };

    try {
      let res;
      if (isEditing) {
        res = await scheduleService.updateClass(editingId, payload);
      } else {
        res = await scheduleService.createClass(payload);
      }

      if (res.success) {
        toast.success(res.message || `Clase grupal ${isEditing ? 'actualizada' : 'programada'} con éxito.`);
        resetForms();
        loadData();
      } else {
        toast.error(res.message || `Error al ${isEditing ? 'actualizar' : 'programar'} clase.`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al enviar la solicitud al servidor.');
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    const { CoachID, StartTime, EndTime, Title } = scheduleForm;

    if (!CoachID || !StartTime || !EndTime) {
      toast.warning('Por favor completa todos los campos.');
      return;
    }

    if (new Date(StartTime) >= new Date(EndTime)) {
      toast.error('La fecha de fin debe ser posterior a la de inicio.');
      return;
    }

    const selectedCoach = coaches.find(c => String(c.UserID || c.id) === String(CoachID));
    const coachName = selectedCoach ? `${selectedCoach.firstName || selectedCoach.name} ${selectedCoach.lastName || ''}`.trim() : 'Entrenador';

    const payload = {
      CoachID: Number(CoachID),
      coachId: Number(CoachID),
      coachName,
      StartTime,
      EndTime,
      startTime: StartTime,
      endTime: EndTime,
      title: Title ? `${Title} - ${coachName}` : `Horario - ${coachName}`
    };

    try {
      let res;
      if (isEditing) {
        res = await scheduleService.updateCoachSchedule(editingId, payload);
      } else {
        res = await scheduleService.createCoachSchedule(payload);
      }

      if (res.success) {
        toast.success(res.message || `Horario de trabajo ${isEditing ? 'actualizado' : 'asignado'} con éxito.`);
        resetForms();
        loadData();
      } else {
        toast.error(res.message || 'Error al guardar el horario.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al enviar la solicitud al servidor.');
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  const handleEditEvent = (event) => {
    setIsEditing(true);
    setEditingId(event.rawId);
    
    const formatDateTimeLocal = (dateString) => {
      const date = new Date(dateString);
      const offset = date.getTimezoneOffset();
      const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
      return adjustedDate.toISOString().substring(0, 16);
    };

    if (event.type === 'class') {
      setFormMode('class');
      setClassForm({
        ClassName: event.original.ClassName,
        Description: event.original.Description || '',
        CoachID: event.original.CoachID,
        MaxCapacity: event.original.MaxCapacity || 20,
        StartTime: formatDateTimeLocal(event.original.StartTime),
        EndTime: formatDateTimeLocal(event.original.EndTime)
      });
    } else {
      setFormMode('schedule');
      let titleOnly = event.original.title || '';
      if (titleOnly.includes(' - ')) {
        titleOnly = titleOnly.split(' - ')[0];
      }
      setScheduleForm({
        CoachID: event.original.coachId || event.original.CoachID,
        StartTime: formatDateTimeLocal(event.original.startTime),
        EndTime: formatDateTimeLocal(event.original.endTime),
        Title: titleOnly
      });
    }
    
    setSelectedEvent(null);
    toast.info('Modo edición activado.');
  };

  const handleDeleteEvent = async (event) => {
    const typeLabel = event.type === 'class' ? 'Clase Grupal' : 'Horario de Trabajo';
    const confirmDelete = window.confirm(`¿Estás seguro de que deseas eliminar este evento?\n\n[${typeLabel}] ${event.title}`);
    
    if (confirmDelete) {
      try {
        let res;
        if (event.type === 'class') {
          res = await scheduleService.deleteClass(event.rawId);
        } else {
          res = await scheduleService.deleteCoachSchedule(event.rawId);
        }

        if (res.success) {
          toast.success('Evento eliminado correctamente.');
          setSelectedEvent(null);
          loadData();
        } else {
          toast.error(res.message || 'No se pudo eliminar el evento.');
        }
      } catch (err) {
        console.error(err);
        toast.error('Error al intentar eliminar el evento.');
      }
    }
  };

  // Improved Event Style Getter for preventing solid block overlaps and compact month view
  const eventStyleGetter = (event) => {
    const isMonthView = calendarView === 'month';

    if (event.type === 'schedule') {
      if (isMonthView) {
        // Diseño ultra compacto para vista de MES (Turnos de trabajo)
        return {
          style: {
            backgroundColor: 'transparent',
            borderLeft: '3px solid #10b981',
            color: '#10b981',
            borderRadius: '2px',
            display: 'block',
            fontSize: '10px',
            fontWeight: '600',
            padding: '1px 4px',
            margin: '1px 0',
            boxShadow: 'none',
            zIndex: 1
          }
        };
      }
      // Horarios de trabajo en SEMANA / DIA: Translucidos, como un fondo
      return {
        style: {
          backgroundColor: 'rgba(16, 185, 129, 0.15)', // Verde muy transparente
          borderLeft: '4px solid #10b981', // Borde solido izquierdo
          color: '#059669', // Texto más oscuro para contrastar con el fondo
          borderRadius: '4px',
          display: 'block',
          fontSize: '12px',
          fontWeight: '600',
          padding: '2px 6px',
          boxShadow: 'none',
          zIndex: 1
        }
      };
    } else {
      if (isMonthView) {
        // Diseño compacto para vista de MES (Clases Grupales)
        return {
          style: {
            backgroundColor: '#3b82f6',
            borderRadius: '4px',
            color: 'white',
            border: 'none',
            display: 'block',
            fontSize: '10px',
            fontWeight: '600',
            padding: '2px 4px',
            margin: '1px 0',
            boxShadow: 'none',
            zIndex: 5
          }
        };
      }
      // Clases Grupales en SEMANA / DIA: Bloques sólidos superpuestos
      return {
        style: {
          backgroundColor: '#3b82f6', // Azul solido
          borderRadius: '6px',
          color: 'white',
          border: '1px solid rgba(255,255,255,0.2)',
          display: 'block',
          fontSize: '12px',
          fontWeight: '700',
          padding: '4px 6px',
          boxShadow: '0 4px 10px rgba(59, 130, 246, 0.4)',
          zIndex: 5
        }
      };
    }
  };

  return (
    <div className="admin-page fade-in">
      <div className="settings-main-card">
        <h2 className="settings-title">Gestión de Horarios y Calendarios</h2>
        <p style={{ color: '#8b8593', marginBottom: '30px' }}>
          Asigna horas de trabajo a entrenadores y crea clases grupales interactivas. Haz click en el calendario para seleccionar un rango horario.
        </p>

        {loading ? (
          <div style={{ color: '#fff', textAlign: 'center', padding: '50px' }}>Cargando calendario de gimnasio...</div>
        ) : (
          <div className="horarios-grid">
            
            <div className="horarios-form-card">
              <div className="form-toggle-buttons">
                <button 
                  className={`toggle-btn ${formMode === 'class' ? 'active' : ''}`}
                  onClick={() => handleFormModeChange('class')}
                >
                  <FiUsers /> Clases Grupales
                </button>
                <button 
                  className={`toggle-btn ${formMode === 'schedule' ? 'active' : ''}`}
                  onClick={() => handleFormModeChange('schedule')}
                >
                  <FiBriefcase /> Horas de Trabajo
                </button>
              </div>

              {formMode === 'class' ? (
                <form onSubmit={handleClassSubmit} className="horarios-styled-form">
                  <div className="form-title-badge">
                    {isEditing ? 'Editar Clase Grupal' : 'Crear Clase Grupal'}
                  </div>
                  
                  <div className="form-group">
                    <label>Nombre de la Clase</label>
                    <input 
                      type="text" 
                      placeholder="Ej: Baile, Yoga Vinyasa, Spinning"
                      value={classForm.ClassName}
                      onChange={(e) => setClassForm(prev => ({ ...prev, ClassName: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Descripción</label>
                    <textarea 
                      placeholder="Breve descripción de la clase..."
                      rows="2"
                      value={classForm.Description}
                      onChange={(e) => setClassForm(prev => ({ ...prev, Description: e.target.value }))}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group flex-1">
                      <label>Hora de Inicio</label>
                      <input 
                        type="datetime-local"
                        value={classForm.StartTime}
                        onChange={(e) => setClassForm(prev => ({ ...prev, StartTime: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="form-group flex-1">
                      <label>Hora de Fin</label>
                      <input 
                        type="datetime-local"
                        value={classForm.EndTime}
                        onChange={(e) => setClassForm(prev => ({ ...prev, EndTime: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Entrenador Asignado (Reactivo)</label>
                    <select
                      value={classForm.CoachID}
                      onChange={(e) => setClassForm(prev => ({ ...prev, CoachID: e.target.value }))}
                      required
                    >
                      <option value="">-- Elige un Coach Disponible --</option>
                      {availableCoaches.map(c => (
                        <option key={c.UserID || c.id} value={c.UserID || c.id}>
                          Coach {c.firstName || c.name} {c.lastName || ''}
                        </option>
                      ))}
                    </select>
                    <span className="helper-text-reactive">
                      💡 Solo se muestran entrenadores libres en las fechas seleccionadas.
                    </span>
                  </div>

                  <div className="form-group">
                    <label>Capacidad Máxima (Aforo)</label>
                    <input 
                      type="number" 
                      min="5" 
                      max="100"
                      value={classForm.MaxCapacity}
                      onChange={(e) => setClassForm(prev => ({ ...prev, MaxCapacity: e.target.value }))}
                      required
                    />
                  </div>

                  <button type="submit" className="horarios-submit-btn class-btn">
                    {isEditing ? <FiEdit2 /> : <FiPlus />}
                    {isEditing ? ' Guardar Cambios' : ' Crear Clase Grupal'}
                  </button>
                  {isEditing && (
                    <button type="button" className="horarios-submit-btn" style={{background: 'rgba(255,255,255,0.1)', marginTop: '8px'}} onClick={resetForms}>
                      Cancelar Edición
                    </button>
                  )}
                </form>
              ) : (
                <form onSubmit={handleScheduleSubmit} className="horarios-styled-form">
                  <div className="form-title-badge schedule-badge">
                    {isEditing ? 'Editar Horas de Trabajo' : 'Asignar Horas de Trabajo'}
                  </div>
                  
                  <div className="form-group">
                    <label>Etiqueta / Título del Turno</label>
                    <input 
                      type="text" 
                      placeholder="Ej: Turno Mañana, Guardía Especial"
                      value={scheduleForm.Title}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, Title: e.target.value }))}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group flex-1">
                      <label>Fecha/Hora Inicio</label>
                      <input 
                        type="datetime-local"
                        value={scheduleForm.StartTime}
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, StartTime: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="form-group flex-1">
                      <label>Fecha/Hora Fin</label>
                      <input 
                        type="datetime-local"
                        value={scheduleForm.EndTime}
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, EndTime: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Entrenador (Reactivo)</label>
                    <select
                      value={scheduleForm.CoachID}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, CoachID: e.target.value }))}
                      required
                    >
                      <option value="">-- Elige un Coach Disponible --</option>
                      {availableCoaches.map(c => (
                        <option key={c.UserID || c.id} value={c.UserID || c.id}>
                          Coach {c.firstName || c.name} {c.lastName || ''}
                        </option>
                      ))}
                    </select>
                    <span className="helper-text-reactive">
                      💡 Muestra entrenadores sin cruces de turnos activos.
                    </span>
                  </div>

                  <button type="submit" className="horarios-submit-btn schedule-btn">
                    {isEditing ? <FiEdit2 /> : <FiPlus />}
                    {isEditing ? ' Guardar Cambios' : ' Guardar Horas de Trabajo'}
                  </button>
                  {isEditing && (
                    <button type="button" className="horarios-submit-btn" style={{background: 'rgba(255,255,255,0.1)', marginTop: '8px'}} onClick={resetForms}>
                      Cancelar Edición
                    </button>
                  )}
                </form>
              )}
            </div>

            <div className="horarios-calendar-card">
              <div className="calendar-legend">
                <span className="legend-item"><span className="color-dot class-dot"></span> Clase Grupal</span>
                <span className="legend-item"><span className="color-dot schedule-dot"></span> Horario de Trabajo</span>
              </div>
              <div className="calendar-container">
                <Calendar
                  localizer={localizer}
                  events={events}
                  date={calendarDate}
                  view={calendarView}
                  onNavigate={(newDate) => setCalendarDate(newDate)}
                  onView={(newView) => setCalendarView(newView)}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '620px' }}
                  selectable
                  popup={true}
                  onSelectSlot={handleSelectSlot}
                  onSelectEvent={handleSelectEvent}
                  eventPropGetter={eventStyleGetter}
                  views={['month', 'week', 'day', 'agenda']}
                  components={{
                    toolbar: CustomToolbar
                  }}
                  messages={{
                    next: 'Sig',
                    previous: 'Ant',
                    today: 'Hoy',
                    month: 'Mes',
                    week: 'Semana',
                    day: 'Día',
                    agenda: 'Agenda',
                    date: 'Fecha',
                    time: 'Hora',
                    event: 'Evento',
                    noEventsInRange: 'No hay eventos en este rango.'
                  }}
                />
              </div>
            </div>

          </div>
        )}

        {/* Modal para Editar/Eliminar Evento */}
        {selectedEvent && (
          <div className="event-modal-overlay" onClick={() => setSelectedEvent(null)}>
            <div className="event-modal" onClick={e => e.stopPropagation()}>
              <div className="event-modal-header">
                <h3>{selectedEvent.type === 'class' ? 'Clase Grupal' : 'Horario de Trabajo'}</h3>
                <button className="close-btn" onClick={() => setSelectedEvent(null)}>&times;</button>
              </div>
              <div className="event-modal-body">
                <p><strong>{selectedEvent.title}</strong></p>
                <p><FiClock /> {moment(selectedEvent.start).format('LLL')} - {moment(selectedEvent.end).format('LT')}</p>
                {selectedEvent.type === 'class' && (
                  <p><FiUsers /> Capacidad: {selectedEvent.original.MaxCapacity || selectedEvent.original.maxCapacity}</p>
                )}
              </div>
              <div className="event-modal-actions">
                <button className="edit-btn" onClick={() => handleEditEvent(selectedEvent)}>
                  <FiEdit2 /> Editar
                </button>
                <button className="delete-btn" onClick={() => handleDeleteEvent(selectedEvent)}>
                  <FiTrash2 /> Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHorarios;
