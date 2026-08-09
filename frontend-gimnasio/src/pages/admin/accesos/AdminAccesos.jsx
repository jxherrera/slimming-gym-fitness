import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FiCheckCircle, FiXCircle, FiClock, FiSearch, FiUsers } from 'react-icons/fi';
import { attendanceService } from '../../../services/attendanceService';
import { useToast } from '../../../hooks/useToast';
import '../shared/admin-core.css';
import './AdminAccesos.css';

// La recepcion valida socios en serie: el resultado se limpia solo para dejar
// la pantalla lista sin que nadie tenga que vaciar el formulario a mano.
const MS_LIMPIAR_RESULTADO = 6000;

const AdminAccesos = () => {
  const toast = useToast();
  const inputRef = useRef(null);

  const [idNumber, setIdNumber] = useState('');
  const [validando, setValidando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [bitacora, setBitacora] = useState([]);
  const [cargandoBitacora, setCargandoBitacora] = useState(true);

  const cargarBitacora = useCallback(async () => {
    try {
      setBitacora(await attendanceService.getTodayAttendance());
    } catch (error) {
      console.error('Error al cargar la bitácora de ingresos:', error);
      toast.error('No se pudo cargar la bitácora de ingresos del día.');
    } finally {
      setCargandoBitacora(false);
    }
  }, [toast]);

  useEffect(() => {
    cargarBitacora();
    inputRef.current?.focus();
  }, [cargarBitacora]);

  useEffect(() => {
    if (!resultado) return undefined;
    const temporizador = setTimeout(() => setResultado(null), MS_LIMPIAR_RESULTADO);
    return () => clearTimeout(temporizador);
  }, [resultado]);

  const handleValidar = async (e) => {
    e.preventDefault();
    const cedula = idNumber.trim();
    if (!cedula || validando) return;

    setValidando(true);
    setResultado(null);

    try {
      const respuesta = await attendanceService.registerAccess(cedula);
      setResultado(respuesta);
      if (respuesta.accessGranted) {
        await cargarBitacora();
      }
    } catch (error) {
      console.error('Error al validar el ingreso:', error);
      setResultado({
        accessGranted: false,
        message: 'No se pudo conectar con el servidor. Intenta de nuevo.'
      });
    } finally {
      setValidando(false);
      setIdNumber('');
      inputRef.current?.focus();
    }
  };

  const formatearHora = (fecha) =>
    new Date(fecha).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="admin-page acc-page">
      <div className="admin-header">
        <div className="header-content">
          <span className="eyebrow">Recepción</span>
          <h1>Control de Ingreso</h1>
          <p>Digita la cédula del socio para validar su membresía en tiempo real.</p>
        </div>
      </div>

      <div className="admin-content acc-grid">
        <section className="acc-panel">
          <form onSubmit={handleValidar} className="acc-form">
            <label htmlFor="cedula-socio">Número de cédula</label>
            <div className="acc-input-row">
              <FiSearch className="acc-input-icon" aria-hidden="true" />
              <input
                id="cedula-socio"
                ref={inputRef}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                maxLength={15}
                placeholder="Ej. 1712345678"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, ''))}
                disabled={validando}
              />
              <button type="submit" disabled={validando || !idNumber.trim()}>
                {validando ? 'Validando…' : 'Validar'}
              </button>
            </div>
          </form>

          {resultado && (
            <div
              className={`acc-resultado ${resultado.accessGranted ? 'concedido' : 'denegado'}`}
              role="status"
              aria-live="polite"
            >
              {resultado.accessGranted ? <FiCheckCircle /> : <FiXCircle />}
              <div className="acc-resultado-texto">
                <strong>{resultado.accessGranted ? 'ACCESO CONCEDIDO' : 'ACCESO DENEGADO'}</strong>
                {resultado.memberName && <span className="acc-nombre">{resultado.memberName}</span>}
                <p>{resultado.message}</p>
                {resultado.status && <span className="acc-etiqueta">{resultado.status}</span>}
              </div>
            </div>
          )}

          {!resultado && !validando && (
            <p className="acc-ayuda">
              El resultado aparece aquí y se limpia solo para validar al siguiente socio.
            </p>
          )}
        </section>

        <section className="acc-panel">
          <h2>
            <FiClock aria-hidden="true" /> Ingresos de hoy
            <span className="acc-contador">{bitacora.length}</span>
          </h2>

          {cargandoBitacora ? (
            <p className="acc-vacio">Cargando bitácora…</p>
          ) : bitacora.length === 0 ? (
            <div className="acc-vacio-estado">
              <FiUsers aria-hidden="true" />
              <p>Aún no se han registrado ingresos hoy.</p>
            </div>
          ) : (
            <ul className="acc-bitacora">
              {bitacora.map((registro) => (
                <li key={registro.AttendanceID}>
                  <span className="acc-hora">{formatearHora(registro.CheckInTime)}</span>
                  <span className="acc-socio">
                    {registro.FirstName} {registro.LastName}
                    <small>{registro.IDNumber}</small>
                  </span>
                  <span className="acc-rol">{registro.RoleName || '—'}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminAccesos;
