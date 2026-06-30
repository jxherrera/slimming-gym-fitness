import React, { useState, useEffect } from 'react';
import api from '../../../../services/api';
import { FaChartLine, FaWeight, FaPercentage, FaRunning } from 'react-icons/fa';

const ProgressCharts = ({ user }) => {
  const userId = user?.userId;

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeMetric, setActiveMetric] = useState('weight'); // 'weight' | 'fat' | 'muscle'

  useEffect(() => {
    const fetchHistory = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const res = await api.get(`/evaluations/user/${userId}`);
        if (res.data.success) {
          // Invertir el array para mostrar cronológicamente (más antiguo a más reciente) en el gráfico
          const chronHistory = [...(res.data.history || [])].reverse();
          setHistory(chronHistory);
        }
      } catch (err) {
        console.error('Error fetching progress metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [userId]);

  const hasData = history.length > 0;

  // Mapear la métrica activa a la columna correspondiente
  const getMetricDetails = () => {
    switch (activeMetric) {
      case 'fat':
        return {
          label: 'Grasa Corporal',
          unit: '%',
          color: '#3b82f6',
          gradientId: 'fatGrad',
          extract: (d) => d.BodyFatPercentage,
        };
      case 'muscle':
        return {
          label: 'Masa Muscular',
          unit: '%',
          color: '#10b981',
          gradientId: 'muscleGrad',
          extract: (d) => d.MuscleMassPercentage,
        };
      default:
        return {
          label: 'Peso',
          unit: 'kg',
          color: '#ff3b3b',
          gradientId: 'weightGrad',
          extract: (d) => d.WeightKg,
        };
    }
  };

  const metric = getMetricDetails();

  // Filtrar los registros que tengan datos válidos para la métrica elegida
  const chartData = history
    .map((item) => ({
      date: new Date(item.EvaluationDate).toLocaleDateString([], { day: '2-digit', month: 'short' }),
      value: metric.extract(item),
    }))
    .filter((d) => d.value !== null && d.value !== undefined);

  // Generar coordenadas SVG
  const width = 600;
  const height = 250;
  const paddingX = 40;
  const paddingY = 40;

  let points = [];
  let pathD = '';
  let areaD = '';

  if (chartData.length > 0) {
    const values = chartData.map((d) => d.value);
    const maxVal = Math.max(...values);
    const minVal = Math.min(...values);
    
    // Evitar división por cero
    const valRange = maxVal === minVal ? 10 : maxVal - minVal;
    // Dar un margen arriba y abajo para que el gráfico no toque los bordes
    const marginY = valRange * 0.15;
    const yMax = maxVal + marginY;
    const yMin = Math.max(0, minVal - marginY);
    const scaleY = yMax - yMin;

    points = chartData.map((d, index) => {
      const x = chartData.length === 1 
        ? width / 2 
        : paddingX + (index / (chartData.length - 1)) * (width - paddingX * 2);
      
      const y = height - paddingY - ((d.value - yMin) / scaleY) * (height - paddingY * 2);
      return { x, y, value: d.value, date: d.date };
    });

    if (points.length > 0) {
      pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ');
      areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;
    }
  }

  return (
    <div className="tab-panel-content fade-in">
      <div className="progress-metrics-layout" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* Ficha Principal de Gráficos */}
        <div className="progress-charts-card" style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '25px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaChartLine style={{ color: '#ff3b3b' }} /> Evolución Física
            </h3>
            
            {/* Selector de Métricas */}
            <div style={{ display: 'flex', gap: '6px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <button
                onClick={() => setActiveMetric('weight')}
                style={{
                  background: activeMetric === 'weight' ? '#ff3b3b' : 'transparent',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
              >
                <FaWeight size={11} /> Peso
              </button>
              <button
                onClick={() => setActiveMetric('fat')}
                style={{
                  background: activeMetric === 'fat' ? '#3b82f6' : 'transparent',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
              >
                <FaPercentage size={11} /> Grasa
              </button>
              <button
                onClick={() => setActiveMetric('muscle')}
                style={{
                  background: activeMetric === 'muscle' ? '#10b981' : 'transparent',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
              >
                <FaRunning size={11} /> Masa Muscular
              </button>
            </div>
          </div>

          {/* Gráfico SVG */}
          {loading ? (
            <div style={{ height: '250px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'rgba(255,255,255,0.4)' }}>
              Cargando historial físico...
            </div>
          ) : !hasData || chartData.length === 0 ? (
            <div style={{ height: '250px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '10px', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px', color: 'rgba(255,255,255,0.4)', padding: '20px' }}>
              <span style={{ fontSize: '14px' }}>No hay registros de medidas físicas aún para este socio.</span>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>Tu entrenador registrará tus evaluaciones físicas para verlas graficadas aquí.</span>
            </div>
          ) : (
            <div style={{ position: 'relative', overflowX: 'auto', background: 'rgba(0,0,0,0.15)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
              <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} style={{ minWidth: '500px', display: 'block' }}>
                <defs>
                  {/* Gradiente dinámico bajo la línea de gráfico */}
                  <linearGradient id={metric.gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={metric.color} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={metric.color} stopOpacity="0.00" />
                  </linearGradient>
                </defs>

                {/* Líneas horizontales de guía */}
                <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
                <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
                <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="rgba(255,255,255,0.08)" />

                {/* Dibujo de Área de Relleno */}
                {areaD && <path d={areaD} fill={`url(#${metric.gradientId})`} />}

                {/* Dibujo de la Línea del Gráfico */}
                {pathD && <path d={pathD} fill="none" stroke={metric.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}

                {/* Dibujo de los Puntos (Nodos) */}
                {points.map((pt, i) => (
                  <g key={i}>
                    <circle cx={pt.x} cy={pt.y} r="6" fill="#111" stroke={metric.color} strokeWidth="3" />
                    {/* Tooltip de valor fijo sobre cada nodo */}
                    <text 
                      x={pt.x} 
                      y={pt.y - 12} 
                      fill="#fff" 
                      fontSize="11" 
                      fontWeight="700"
                      textAnchor="middle"
                      style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.8))' }}
                    >
                      {pt.value} {metric.unit}
                    </text>
                    {/* Etiqueta de la Fecha en el eje X */}
                    <text 
                      x={pt.x} 
                      y={height - paddingY + 18} 
                      fill="rgba(255,255,255,0.5)" 
                      fontSize="10" 
                      textAnchor="middle"
                    >
                      {pt.date}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          )}
        </div>

        {/* Tabla Detallada del Historial */}
        {hasData && (
          <div className="progress-history-card" style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '20px', color: '#fff' }}>Tabla Histórica de Medidas</h3>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>
                    <th style={{ padding: '12px 8px' }}>Fecha</th>
                    <th style={{ padding: '12px 8px' }}>Peso (kg)</th>
                    <th style={{ padding: '12px 8px' }}>Grasa Corporal (%)</th>
                    <th style={{ padding: '12px 8px' }}>Masa Muscular (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((evalItem) => (
                    <tr key={evalItem.EvaluationID} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', hover: { background: 'rgba(255,255,255,0.01)' } }}>
                      <td style={{ padding: '12px 8px', fontWeight: '600' }}>
                        {new Date(evalItem.EvaluationDate).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '12px 8px', color: '#ff3b3b', fontWeight: '700' }}>{evalItem.WeightKg} kg</td>
                      <td style={{ padding: '12px 8px', color: '#3b82f6' }}>{evalItem.BodyFatPercentage ? `${evalItem.BodyFatPercentage}%` : '-'}</td>
                      <td style={{ padding: '12px 8px', color: '#10b981' }}>{evalItem.MuscleMassPercentage ? `${evalItem.MuscleMassPercentage}%` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProgressCharts;
