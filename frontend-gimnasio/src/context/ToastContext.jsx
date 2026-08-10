/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useCallback, useMemo } from 'react';

export const ToastContext = createContext(null);

// Contexto aparte solo con las acciones. Su valor nunca cambia de identidad,
// que es lo que permite usar `toast` como dependencia de un useCallback sin
// provocar recargas en cadena.
export const ToastAccionesContext = createContext(null);

let toastCount = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastCount;
    const newToast = { id, message, type, duration };
    
    setToasts((prevToasts) => [...prevToasts, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = useCallback((msg, duration) => showToast(msg, 'success', duration), [showToast]);
  const error = useCallback((msg, duration) => showToast(msg, 'error', duration), [showToast]);
  const warning = useCallback((msg, duration) => showToast(msg, 'warning', duration), [showToast]);
  const info = useCallback((msg, duration) => showToast(msg, 'info', duration), [showToast]);

  // Las acciones se separan de la lista de avisos a proposito.
  //
  // Antes el contexto entregaba un objeto nuevo en cada render, y ese objeto
  // cambiaba tambien al mostrar u ocultar un aviso. Cualquier componente que
  // use `toast` como dependencia de un useCallback + useEffect (la agenda de
  // clases, por ejemplo) volvia a lanzar su carga; si la carga fallaba mostraba
  // otro aviso, que cambiaba el contexto otra vez. De ahi salian ocho errores
  // identicos apilados a partir de una sola peticion fallida.
  //
  // `acciones` conserva su identidad mientras viva el proveedor, asi que
  // depender de ella es seguro.
  const acciones = useMemo(
    () => ({ showToast, removeToast, success, error, warning, info }),
    [showToast, removeToast, success, error, warning, info]
  );

  // Este si cambia con cada aviso, y solo lo consume el contenedor que los pinta.
  const valorCompleto = useMemo(() => ({ ...acciones, toasts }), [acciones, toasts]);

  return (
    <ToastAccionesContext.Provider value={acciones}>
      <ToastContext.Provider value={valorCompleto}>
        {children}
      </ToastContext.Provider>
    </ToastAccionesContext.Provider>
  );
};
