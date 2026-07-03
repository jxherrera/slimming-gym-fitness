import React, { useState, useEffect } from 'react';
import { FaChartLine, FaWeight, FaPercentage, FaDumbbell, FaPlus, FaCalendarAlt, FaFilePdf } from 'react-icons/fa';
import { progressService } from '../../services/progressService';
import { memberService } from '../../services/memberService';
import { useToast } from '../../hooks/useToast';
import Modal from '../common/Modal';
import { jsPDF } from 'jspdf';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import './ProgressChart.css';

const ProgressChart = ({ userId }) => {
  const toast = useToast();
  const [history, setHistory] = useState([]);
  const [metric, setMetric] = useState('weight'); // 'weight' | 'bodyFat' | 'muscleMass'
  const [loading, setLoading] = useState(true);

  // Modal para agregar registro
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [newFat, setNewFat] = useState('');
  const [newMuscle, setNewMuscle] = useState('');

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const data = await progressService.getProgressHistory(userId);
      setHistory(data);
    } catch (e) {
      console.error('Error al cargar progreso:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [userId]);

  const handleAddRecord = async (e) => {
    e.preventDefault();
    if (!newWeight) {
      toast.warning('Ingresa al menos el peso en kg.');
      return;
    }
    try {
      await progressService.addProgressRecord(userId, {
        weight: parseFloat(newWeight),
        bodyFat: newFat ? parseFloat(newFat) : 20.0,
        muscleMass: newMuscle ? parseFloat(newMuscle) : 35.0
      });
      toast.success('¡Registro de evolución guardado!');
      setNewWeight('');
      setNewFat('');
      setNewMuscle('');
      setShowAddModal(false);
      fetchProgress();
    } catch (e) {
      toast.error('Error al guardar registro.');
    }
  };

  // Descarga de Ficha Deportiva (PDF)
  const handleExportFichaDeportiva = async () => {
    toast.info('Preparando la descarga de tu Ficha Deportiva...');
    try {
      // 1. Intentar el llamado al backend real con responseType: 'blob'
      const blobData = await memberService.getMemberPdfReport(userId);
      
      const fileUrl = window.URL.createObjectURL(blobData);
      const tempLink = document.createElement('a');
      tempLink.href = fileUrl;
      tempLink.setAttribute('download', `ficha_deportiva_${userId}.pdf`);
      document.body.appendChild(tempLink);
      tempLink.click();
      tempLink.remove();
      window.URL.revokeObjectURL(fileUrl);
      
      toast.success('Ficha Deportiva descargada con éxito.');
    } catch (error) {
      console.warn('Fallo descarga desde backend, generando reporte local con jsPDF...', error);
      
      // 2. Fallback local con jsPDF para asegurar que el botón funcione sin dependencias del backend
      try {
        const doc = new jsPDF();
        
        // Encabezado
        doc.setFillColor(22, 22, 28);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text("SLIMMING GYM", 20, 25);
        doc.setFontSize(10);
        doc.text("CENTRO DE ALTO RENDIMIENTO & FITNESS", 20, 32);
        
        // Cuerpo
        doc.setTextColor(33, 33, 33);
        doc.setFontSize(16);
        doc.text("FICHA DEPORTIVA Y EVOLUCIÓN FÍSICA", 20, 60);
        
        doc.setFontSize(11);
        doc.text(`ID del Socio: Member-${userId}`, 20, 72);
        doc.text(`Fecha del Reporte: ${new Date().toLocaleDateString()}`, 20, 80);
        
        doc.setLineWidth(0.5);
        doc.line(20, 85, 190, 85);
        
        // Tabla de Progreso
        doc.setFontSize(13);
        doc.text("Historial de Progresiones Corporales", 20, 100);
        
        let startY = 110;
        doc.setFontSize(10);
        doc.text("Fecha", 20, startY);
        doc.text("Peso corporal (kg)", 60, startY);
        doc.text("Grasa corporal (%)", 110, startY);
        doc.text("Masa muscular (kg)", 160, startY);
        
        doc.line(20, startY + 2, 190, startY + 2);
        
        startY += 10;
        history.forEach((record, index) => {
          doc.text(record.date || 'N/A', 20, startY);
          doc.text(`${record.weight} kg`, 60, startY);
          doc.text(`${record.bodyFat}%`, 110, startY);
          doc.text(`${record.muscleMass} kg`, 160, startY);
          
          doc.line(20, startY + 2, 190, startY + 2);
          startY += 10;
        });

        // Nota al pie
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.text("Documento oficial generado por la aplicación Slimming Gym. Todos los derechos reservados.", 20, 275);
        
        doc.save(`ficha_deportiva_${userId}.pdf`);
        toast.success('Ficha Deportiva (Generación Local) descargada correctamente.');
      } catch (pdfError) {
        console.error('Error al generar PDF local:', pdfError);
        toast.error('No se pudo exportar la ficha deportiva.');
      }
    }
  };

  // Configuración de la métrica activa
  const metricConfig = {
    weight: { label: 'Peso Corporal (kg)', key: 'weight', color: '#ff3b3b', unit: 'kg', icon: <FaWeight /> },
    bodyFat: { label: 'Grasa Corporal (%)', key: 'bodyFat', color: '#ffb300', unit: '%', icon: <FaPercentage /> },
    muscleMass: { label: 'Masa Muscular (kg)', key: 'muscleMass', color: '#00e676', unit: 'kg', icon: <FaDumbbell /> }
  };

  const currentConfig = metricConfig[metric];

  // Cálculo de evolución total
  const values = history.map(h => h[currentConfig.key] || 0);
  const firstVal = values[0] || 0;
  const lastVal = values[values.length - 1] || 0;
  const diff = (lastVal - firstVal).toFixed(1);

  // Formatear datos para el gráfico de Recharts
  const chartData = history.map(item => ({
    name: item.date.split('-').slice(1).join('/'),
    valor: item[currentConfig.key],
    ...item
  }));

  return (
    <div className="progress-card-container">
      <div className="progress-header">
        <div className="title-group">
          <FaChartLine className="progress-icon" />
          <div>
            <h3>Evolución y Gráficos de Progreso Físico</h3>
            <p>Monitorea tus cambios corporales a lo largo del tiempo.</p>
          </div>
        </div>

        <div className="progress-actions" style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-export-pdf" onClick={handleExportFichaDeportiva} style={{ background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', border: 'none', borderRadius: '10px', fontSize: '0.88rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.25s ease' }}>
            <FaFilePdf /> Exportar Ficha Deportiva
          </button>
          
          <button className="btn-add-progress" onClick={() => setShowAddModal(true)}>
            <FaPlus /> Registrar Medidas
          </button>
        </div>
      </div>

      {/* Botones de Selección de Métrica */}
      <div className="metrics-selector">
        {Object.keys(metricConfig).map(key => (
          <button
            key={key}
            className={`metric-btn ${metric === key ? 'active' : ''}`}
            onClick={() => setMetric(key)}
            style={{ '--active-color': metricConfig[key].color }}
          >
            {metricConfig[key].icon} {metricConfig[key].label}
          </button>
        ))}
      </div>

      {/* Gráfico Recharts Interactivo y Responsivo */}
      <div className="chart-wrapper" style={{ minHeight: '260px', width: '100%', marginTop: '10px' }}>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`colorMetric-${metric}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={currentConfig.color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={currentConfig.color} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="name" stroke="#888" tickLine={false} style={{ fontSize: '11px' }} />
            <YAxis stroke="#888" tickLine={false} domain={['auto', 'auto']} style={{ fontSize: '11px' }} />
            <Tooltip
              contentStyle={{ background: '#1e1e24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
              labelStyle={{ fontWeight: 'bold', color: '#ff3b3b' }}
            />
            <Area
              type="monotone"
              dataKey="valor"
              name={currentConfig.label}
              stroke={currentConfig.color}
              fillOpacity={1}
              fill={`url(#colorMetric-${metric})`}
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Resumen de Métrica */}
      <div className="progress-summary-bar">
        <div className="summary-stat">
          <span className="stat-label">Valor Inicial</span>
          <span className="stat-value">{firstVal} {currentConfig.unit}</span>
        </div>
        <div className="summary-stat">
          <span className="stat-label">Último Registro</span>
          <span className="stat-value highlight" style={{ color: currentConfig.color }}>
            {lastVal} {currentConfig.unit}
          </span>
        </div>
        <div className="summary-stat">
          <span className="stat-label">Variación Total</span>
          <span className={`stat-value ${Number(diff) <= 0 ? 'diff-negative' : 'diff-positive'}`}>
            {Number(diff) > 0 ? `+${diff}` : diff} {currentConfig.unit}
          </span>
        </div>
      </div>

      {/* Modal para ingresar nuevo pesaje */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Registrar Nuevas Medidas Corporales"
        size="sm"
      >
        <form onSubmit={handleAddRecord} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label><FaWeight /> Peso Actual (kg):</label>
            <input
              type="number"
              step="0.1"
              className="profile-input"
              placeholder="Ej: 75.5"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label><FaPercentage /> Porcentaje de Grasa (%):</label>
            <input
              type="number"
              step="0.1"
              className="profile-input"
              placeholder="Ej: 18.5"
              value={newFat}
              onChange={(e) => setNewFat(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label><FaDumbbell /> Masa Muscular (kg):</label>
            <input
              type="number"
              step="0.1"
              className="profile-input"
              placeholder="Ej: 36.0"
              value={newMuscle}
              onChange={(e) => setNewMuscle(e.target.value)}
            />
          </div>
          <button type="submit" className="payments-submit-btn" style={{ marginTop: '10px' }}>
            Guardar Avance
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default ProgressChart;
