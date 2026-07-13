import React, { useRef, useState } from 'react';
import { FaFilePdf, FaDumbbell, FaUser, FaBullseye, FaPrint, FaCheckSquare, FaPlay } from 'react-icons/fa';
import { useToast } from '../../hooks/useToast';
import WorkoutMode from './workout/WorkoutMode';
import './RoutinePdfExporter.css';

import Modal from './../common/Modal';

const RoutinePdfExporter = ({ routines = [], user, onRoutineAssigned }) => {
  const toast = useToast();
  const printRef = useRef(null);
  const [isWorkoutMode, setIsWorkoutMode] = useState(false);
  
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const fetchTemplates = async () => {
      try {
          setLoadingTemplates(true);
          const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
          const res = await fetch(`${API_BASE}/routines/templates/all`);
          const data = await res.json();
          if (data.success) {
              setTemplates(data.templates);
          }
      } catch (error) {
          console.error("Error al cargar plantillas:", error);
          toast.error("No se pudieron cargar las plantillas");
      } finally {
          setLoadingTemplates(false);
      }
  };

  const openTemplateModal = () => {
      setShowTemplateModal(true);
      fetchTemplates();
  };

  const assignTemplate = async (tpl) => {
      if (!window.confirm(`¿Deseas aplicar la rutina "${tpl.TemplateName}" a tu perfil? Esto reemplazará tu rutina actual.`)) return;
      
      try {
          setIsAssigning(true);
          const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
          const payload = {
              userId: user?.id || user?.userId,
              coachId: tpl.CoachID, // Asignamos el ID del coach que creó la plantilla
              goal: tpl.Goal || 'General',
              exercises: tpl.exercises || []
          };
          
          const response = await fetch(`${API_BASE}/routines/assign`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
          });
          
          const data = await response.json();
          if (data.success) {
              toast.success('¡Rutina aplicada con éxito!');
              setShowTemplateModal(false);
              if (onRoutineAssigned) {
                  onRoutineAssigned(); // Recargar datos en el padre
              } else {
                  window.location.reload(); // Fallback si no hay callback
              }
          } else {
              toast.error(data.message || 'Error al aplicar la rutina');
          }
      } catch (error) {
          console.error("Error asignando plantilla:", error);
          toast.error('Error de conexión.');
      } finally {
          setIsAssigning(false);
      }
  };

  const handleExportPDF = () => {
    toast.info('Generando documento PDF de tu rutina...');
    setTimeout(() => {
      window.print();
    }, 400);
  };

  const activeRoutine = routines[0];

  if (!activeRoutine) {
    return (
      <div className="pdf-exporter-container" style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '16px', border: '1px dashed rgba(255, 255, 255, 0.1)', color: 'rgba(255,255,255,0.5)' }}>
        <h3 style={{ color: '#fff', marginBottom: '10px' }}>Sin rutinas asignadas</h3>
        <p>Aún no tienes una rutina de entrenamiento. Pide a tu entrenador que te asigne una o elige una plantilla predefinida a continuación.</p>
        
        <button 
            onClick={openTemplateModal} 
            style={{ marginTop: '20px', padding: '12px 24px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
        >
            Ver Catálogo de Plantillas
        </button>
        {renderTemplateModal()}
      </div>
    );
  }

  const daysOrder = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  
  const groupedExercises = (activeRoutine.exercises || []).reduce((acc, ex) => {
    const day = ex.day || 'Sin asignar';
    if (!acc[day]) acc[day] = [];
    acc[day].push(ex);
    return acc;
  }, {});

  const sortedDays = Object.keys(groupedExercises).sort((a, b) => {
    const aIdx = daysOrder.indexOf(a);
    const bIdx = daysOrder.indexOf(b);
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="pdf-exporter-container">
      <div className="pdf-header-actions no-print">
        <div>
          <h3>Exportación de Rutina de Entrenamiento</h3>
          <p>Descarga o imprime tu plan de ejercicios en formato PDF oficial de Slimming Gym.</p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button 
            className="btn-export-pdf" 
            onClick={openTemplateModal}
            style={{ background: '#3b82f6', color: 'white', border: 'none' }}
          >
            Explorar Plantillas
          </button>
          <button 
            className="btn-export-pdf" 
            onClick={() => setIsWorkoutMode(true)}
            style={{ background: '#e53e3e', color: 'white', border: 'none' }}
          >
            <FaPlay /> Comenzar Rutina
          </button>
          <button className="btn-export-pdf" onClick={handleExportPDF}>
            <FaFilePdf /> Exportar a PDF
          </button>
        </div>
      </div>

      {isWorkoutMode && (
        <WorkoutMode 
          routine={activeRoutine} 
          user={user} 
          onClose={() => setIsWorkoutMode(false)} 
        />
      )}

      {/* ÁREA DE IMPRESIÓN DOCUMENTO PDF */}
      <div className="printable-pdf-document" ref={printRef}>
        <div className="pdf-branding-header">
          <div>
            <h1 className="pdf-logo">SLIMMING <span className="red-text">GYM</span></h1>
            <span className="pdf-tagline">Centro de Alto Rendimiento & Fitness</span>
          </div>
          <div className="pdf-meta">
            <p><strong>Socio:</strong> {user?.firstName || user?.name || 'Socio'} {user?.lastName || ''}</p>
            <p><strong>Fecha:</strong> {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="pdf-routine-banner">
          <h2><FaDumbbell /> Rutina de {activeRoutine.Goal || activeRoutine.RoutineName || activeRoutine.name || 'Entrenamiento'}</h2>
          <div className="pdf-banner-details">
            <span><FaUser /> Entrenador: <strong>{activeRoutine.CoachName || 'Coach Asignado'}</strong></span>
          </div>
        </div>

        <div className="pdf-exercises-table-container">
          <table className="pdf-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Ejercicio / Movimiento</th>
                <th>Series</th>
                <th>Repeticiones</th>
                <th>Peso Ideal</th>
              </tr>
            </thead>
            <tbody>
              {sortedDays.map(day => (
                <React.Fragment key={day}>
                  <tr className="day-header-row">
                    <td colSpan="5"><strong>{day.toUpperCase()}</strong></td>
                  </tr>
                  {groupedExercises[day].map((ex, idx) => (
                    <tr key={`${day}-${idx}`}>
                      <td className="center-cell"><FaCheckSquare className="check-box-icon" /></td>
                      <td className="exercise-name-cell">{ex.name}</td>
                      <td><strong>{ex.sets}</strong></td>
                      <td><strong>{ex.reps}</strong></td>
                      <td className="notes-cell">{ex.weight ? `${ex.weight} kg` : '-'}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pdf-footer-note">
          <p>💡 <em>Recuerda hidratarte adecuadamente durante la sesión y realizar un calentamiento dinámico de 10 minutos antes de comenzar.</em></p>
        </div>
      </div>

      {renderTemplateModal()}
    </div>
  );

  function renderTemplateModal() {
      return (
          <Modal isOpen={showTemplateModal} onClose={() => setShowTemplateModal(false)} title="Plantillas de Entrenamiento">
              <div style={{ padding: '10px', maxHeight: '60vh', overflowY: 'auto' }}>
                  {loadingTemplates ? (
                      <div style={{ textAlign: 'center', padding: '20px' }}>Cargando...</div>
                  ) : templates.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>No hay plantillas disponibles.</div>
                  ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                          {templates.map(tpl => (
                              <div key={tpl.TemplateID} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px', background: '#f9fafb', textAlign: 'left' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                      <div>
                                          <h4 style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#111827' }}>{tpl.TemplateName}</h4>
                                          <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#6b7280' }}>
                                              Objetivo: <strong style={{ color: '#3b82f6' }}>{tpl.Goal || 'General'}</strong> • Creado por: {tpl.CoachName}
                                          </p>
                                      </div>
                                      <button 
                                          onClick={() => assignTemplate(tpl)}
                                          disabled={isAssigning}
                                          style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                                      >
                                          {isAssigning ? 'Aplicando...' : 'Aplicar a mi perfil'}
                                      </button>
                                  </div>
                                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                      {Array.from(new Set((tpl.exercises || []).map(e => e.day))).map(day => (
                                          <span key={day} style={{ background: '#e0e7ff', color: '#4338ca', fontSize: '11px', padding: '3px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                                              {day}
                                          </span>
                                      ))}
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          </Modal>
      );
  }
};

export default RoutinePdfExporter;
