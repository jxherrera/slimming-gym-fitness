import React, { useState, useEffect } from 'react';
import { FaChartLine, FaWeight, FaPercentage, FaDumbbell, FaPlus, FaCalendarAlt } from 'react-icons/fa';
import { progressService } from '../../services/progressService';
import { useToast } from '../../hooks/useToast';
import Modal from '../common/Modal';
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

  // Configuración de la métrica activa
  const metricConfig = {
    weight: { label: 'Peso Corporal (kg)', key: 'weight', color: '#ff3b3b', unit: 'kg', icon: <FaWeight /> },
    bodyFat: { label: 'Grasa Corporal (%)', key: 'bodyFat', color: '#ffb300', unit: '%', icon: <FaPercentage /> },
    muscleMass: { label: 'Masa Muscular (kg)', key: 'muscleMass', color: '#00e676', unit: 'kg', icon: <FaDumbbell /> }
  };

  const currentConfig = metricConfig[metric];

  // Cálculos para el gráfico SVG
  const values = history.map(h => h[currentConfig.key] || 0);
  const minVal = values.length ? Math.min(...values) * 0.95 : 0;
  const maxVal = values.length ? Math.max(...values) * 1.05 : 100;
  const range = maxVal - minVal || 1;

  const chartHeight = 220;
  const chartWidth = 600;
  const padding = 40;

  const points = history.map((item, index) => {
    const x = padding + (index / (Math.max(1, history.length - 1))) * (chartWidth - padding * 2);
    const val = item[currentConfig.key] || 0;
    const y = chartHeight - padding - ((val - minVal) / range) * (chartHeight - padding * 2);
    return { x, y, val, date: item.date };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = points.length
    ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`
    : '';

  // Cálculo de evolución total
  const firstVal = values[0] || 0;
  const lastVal = values[values.length - 1] || 0;
  const diff = (lastVal - firstVal).toFixed(1);

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

        <button className="btn-add-progress" onClick={() => setShowAddModal(true)}>
          <FaPlus /> Registrar Medidas
        </button>
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

      {/* Gráfico Vectorial Interactivo SVG */}
      <div className="chart-wrapper">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="svg-chart">
          {/* Fondo degradado */}
          <defs>
            <linearGradient id={`grad-${metric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={currentConfig.color} stopOpacity="0.4" />
              <stop offset="100%" stopColor={currentConfig.color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Líneas de cuadrícula */}
          {[0.2, 0.5, 0.8].map((ratio, idx) => (
            <line
              key={idx}
              x1={padding}
              y1={(chartHeight - padding * 2) * ratio + padding}
              x2={chartWidth - padding}
              y2={(chartHeight - padding * 2) * ratio + padding}
              stroke="rgba(255,255,255,0.06)"
              strokeDasharray="4"
            />
          ))}

          {/* Área sombreada bajo la curva */}
          {areaD && <path d={areaD} fill={`url(#grad-${metric})`} />}

          {/* Línea principal del gráfico */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke={currentConfig.color}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Puntos de datos interactivos */}
          {points.map((pt, i) => (
            <g key={i} className="chart-point-group">
              <circle
                cx={pt.x}
                cy={pt.y}
                r="6"
                fill="#16161c"
                stroke={currentConfig.color}
                strokeWidth="3"
              />
              <text
                x={pt.x}
                y={pt.y - 12}
                fill="#ffffff"
                fontSize="11"
                textAnchor="middle"
                fontWeight="bold"
              >
                {pt.val}{currentConfig.unit}
              </text>
              <text
                x={pt.x}
                y={chartHeight - 15}
                fill="#888888"
                fontSize="10"
                textAnchor="middle"
              >
                {pt.date.split('-').slice(1).join('/')}
              </text>
            </g>
          ))}
        </svg>
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
          <span className={`stat-value ${diff <= 0 ? 'diff-negative' : 'diff-positive'}`}>
            {diff > 0 ? `+${diff}` : diff} {currentConfig.unit}
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
