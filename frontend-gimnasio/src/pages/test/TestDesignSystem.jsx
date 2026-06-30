import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/common/Spinner';
import Skeleton from '../../components/common/Skeleton';
import Modal from '../../components/common/Modal';
import './TestDesignSystem.css';

const TestDesignSystem = () => {
  const { addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const triggerSuccessToast = () => {
    addToast('¡Operación realizada con éxito!', 'success');
  };

  const triggerErrorToast = () => {
    addToast('Ocurrió un error al procesar la solicitud.', 'error');
  };

  const triggerWarningToast = () => {
    addToast('Atención: Tu membresía está próxima a vencer.', 'warning');
  };

  const triggerInfoToast = () => {
    addToast('Información: El gimnasio cerrará temprano este viernes.', 'info');
  };

  return (
    <div className="test-page-container">
      <header className="test-header">
        <h1>Sistema de Diseño <span className="red-text">Core</span></h1>
        <p>Demostración interactiva de Toasts, Modales, Spinners y Skeletons.</p>
      </header>

      <div className="test-grid">
        {/* Sección: Toasts / Alertas */}
        <section className="test-section">
          <h2>1. Sistema de Alertas (Toast)</h2>
          <p>Dispara notificaciones emergentes globales con animaciones fluidas:</p>
          <div className="button-group">
            <button className="btn-test btn-success" onClick={triggerSuccessToast}>
              Éxito (Success)
            </button>
            <button className="btn-test btn-error" onClick={triggerErrorToast}>
              Error (Error)
            </button>
            <button className="btn-test btn-warning" onClick={triggerWarningToast}>
              Advertencia (Warning)
            </button>
            <button className="btn-test btn-info" onClick={triggerInfoToast}>
              Información (Info)
            </button>
          </div>
        </section>

        {/* Sección: Spinners */}
        <section className="test-section">
          <h2>2. Componentes de Carga (Spinner)</h2>
          <p>Indicadores de carga circulares en diferentes tamaños y variantes de color:</p>
          <div className="spinner-showcase">
            <div className="spinner-item">
              <Spinner size="small" />
              <span>Small</span>
            </div>
            <div className="spinner-item">
              <Spinner size="medium" />
              <span>Medium</span>
            </div>
            <div className="spinner-item">
              <Spinner size="large" />
              <span>Large</span>
            </div>
            <div className="spinner-item" style={{ background: '#ff3b3b', padding: '10px', borderRadius: '8px' }}>
              <Spinner size="medium" color="secondary" />
              <span style={{ color: '#fff' }}>Secundario</span>
            </div>
          </div>
        </section>

        {/* Sección: Skeletons */}
        <section className="test-section">
          <h2>3. Skeletons (Placeholder Loader)</h2>
          <p>Estructuras de carga para suavizar la percepción del tiempo de espera:</p>
          <div className="skeleton-showcase">
            <div className="skeleton-item-row">
              <Skeleton variant="circular" width={50} height={50} />
              <div style={{ flexGrow: 1 }}>
                <Skeleton variant="text" width="60%" height={16} />
                <Skeleton variant="text" width="40%" height={12} />
              </div>
            </div>
            <Skeleton variant="rectangle" width="100%" height={120} />
          </div>
        </section>

        {/* Sección: Modales */}
        <section className="test-section">
          <h2>4. Modales Animados</h2>
          <p>Ventanas de diálogo fluidas con soporte de accesibilidad y animaciones:</p>
          <button className="btn-test btn-modal-trigger" onClick={() => setIsModalOpen(true)}>
            Abrir Modal Demostración
          </button>
        </section>
      </div>

      {/* Modal Genérico */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Membresía Slimming Gym"
        footer={
          <>
            <button className="btn-modal-cancel" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </button>
            <button 
              className="btn-modal-action" 
              onClick={() => {
                addToast('¡Membresía renovada con éxito!', 'success');
                setIsModalOpen(false);
              }}
            >
              Confirmar Renovación
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <p>Estás a punto de renovar tu suscripción mensual para el plan actual. Se aplicará el cobro automático con el método de pago registrado.</p>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Plan Seleccionado:</span>
              <strong style={{ color: '#ff3b3b' }}>VIP Mensual</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Precio total:</span>
              <strong>$49.99 USD</strong>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TestDesignSystem;
