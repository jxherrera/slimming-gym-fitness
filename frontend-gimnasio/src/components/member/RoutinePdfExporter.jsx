import React, { useRef } from 'react';
import { FaFilePdf, FaDumbbell, FaUser, FaBullseye, FaPrint, FaCheckSquare } from 'react-icons/fa';
import { useToast } from '../../hooks/useToast';
import './RoutinePdfExporter.css';

const RoutinePdfExporter = ({ routines = [], user }) => {
  const toast = useToast();
  const printRef = useRef(null);

  const handleExportPDF = () => {
    toast.info('Generando documento PDF de tu rutina...');
    setTimeout(() => {
      window.print();
    }, 400);
  };

  const activeRoutine = routines[0] || {
    RoutineName: 'Rutina de Hipertrofia & Fuerza General',
    CoachName: 'Coach Carlos Rodriguez',
    Goal: 'Desarrollo de fuerza muscular, definición corporal y acondicionamiento aeróbico.',
    exercises: [
      { name: 'Sentadilla Libre con Barra (Squat)', sets: '4 series x 10-12 reps', rest: '90 seg', notes: 'Mantener espalda recta y bajar a 90 grados.' },
      { name: 'Press de Banca Plano (Bench Press)', sets: '4 series x 8-10 reps', rest: '90 seg', notes: 'Controlar el descenso y empujar con fuerza explosiva.' },
      { name: 'Peso Muerto Rumano (Romanian Deadlift)', sets: '3 series x 12 reps', rest: '60 seg', notes: 'Enfocarse en mantener isquiotibiales tensionados.' },
      { name: 'Dominadas Asistidas / Jalón al Pecho', sets: '4 series x 10 reps', rest: '60 seg', notes: 'Retracción escapular completa en cada repetición.' },
      { name: 'Press Militar con Mancuernas', sets: '3 series x 12 reps', rest: '60 seg', notes: 'Evitar hiperextender la zona lumbar.' }
    ]
  };

  return (
    <div className="pdf-exporter-container">
      <div className="pdf-header-actions no-print">
        <div>
          <h3>Exportación de Rutina de Entrenamiento</h3>
          <p>Descarga o imprime tu plan de ejercicios en formato PDF oficial de Slimming Gym.</p>
        </div>
        <button className="btn-export-pdf" onClick={handleExportPDF}>
          <FaFilePdf /> Exportar Rutina a PDF / Imprimir
        </button>
      </div>

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
          <h2><FaDumbbell /> {activeRoutine.RoutineName || activeRoutine.name || 'Rutina Slimming Gym'}</h2>
          <div className="pdf-banner-details">
            <span><FaUser /> Entrenador: <strong>{activeRoutine.CoachName || 'Coach Asignado'}</strong></span>
            <span><FaBullseye /> Objetivo: <strong>{activeRoutine.Goal || 'Acondicionamiento'}</strong></span>
          </div>
        </div>

        <div className="pdf-exercises-table-container">
          <table className="pdf-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Ejercicio / Movimiento</th>
                <th>Dosificación (Series x Reps)</th>
                <th>Descanso</th>
                <th>Indicaciones del Coach</th>
              </tr>
            </thead>
            <tbody>
              {(activeRoutine.exercises || []).map((ex, idx) => (
                <tr key={idx}>
                  <td className="center-cell"><FaCheckSquare className="check-box-icon" /></td>
                  <td className="exercise-name-cell">{ex.name}</td>
                  <td><strong>{ex.sets}</strong></td>
                  <td>{ex.rest}</td>
                  <td className="notes-cell">{ex.notes}</td>
                </tr>
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
