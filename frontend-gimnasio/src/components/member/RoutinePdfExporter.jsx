import React, { useRef, useState } from 'react';
import { FaFilePdf, FaDumbbell, FaUser, FaBullseye, FaPrint, FaCheckSquare, FaPlay } from 'react-icons/fa';
import { useToast } from '../../hooks/useToast';
import WorkoutMode from './WorkoutMode';
import './RoutinePdfExporter.css';

const RoutinePdfExporter = ({ routines = [], user }) => {
  const toast = useToast();
  const printRef = useRef(null);
  const [isWorkoutMode, setIsWorkoutMode] = useState(false);

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
        <p>Aún no tienes una rutina de entrenamiento. Pide a tu entrenador que te asigne una para poder verla y exportarla en PDF.</p>
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
    </div>
  );
};

export default RoutinePdfExporter;
