import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNotifications } from '../../../hooks/useNotifications';
import { useTheme } from '../../../context/ThemeContext';
import Skeleton from '../../../components/common/Skeleton';
import Spinner from '../../../components/common/Spinner';
import { FaBell, FaCheck, FaTrashAlt } from 'react-icons/fa';
import './Notifications.css';

const Notifications = () => {
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const userId = user?.userId;

  const { notifications, loading, error, unreadCount, markAsRead, refetch } = useNotifications(userId);

  const themeClass = isDarkMode ? 'theme-dark' : 'theme-light';
  const themeIcon = isDarkMode ? '☀️' : '🌙';

  const handleMarkAllRead = async () => {
    // Para simplificar, recorremos las notificaciones no leídas y las marcamos
    const unread = notifications.filter((n) => !n.isRead);
    for (const notif of unread) {
      await markAsRead(notif.id);
    }
  };

  return (
    <div className={`admin-page ${themeClass} fade-in`} style={{ padding: '20px' }}>
      <div className="notifications-main-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Encabezado */}
        <div className="notifications-header-wrapper">
          <div>
            <h2 className="notifications-page-title">Notificaciones de Membresía</h2>
            <p className="notifications-page-desc">
              Revisa los avisos de vencimiento, alertas y novedades de tu cuenta.
            </p>
          </div>
          <div className="notifications-actions-header">
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label="Cambiar tema"
              style={{ width: '40px', height: '40px', borderRadius: '10px' }}
            >
              {themeIcon}
            </button>
          </div>
        </div>

        {/* Botones de acción masiva */}
        {notifications.length > 0 && unreadCount > 0 && (
          <div className="notifications-bulk-actions">
            <span className="unread-badge">
              {unreadCount} sin leer
            </span>
            <button className="btn-mark-all" onClick={handleMarkAllRead}>
              <FaCheck style={{ marginRight: '6px' }} /> Marcar todas como leídas
            </button>
          </div>
        )}

        {/* Listado de Notificaciones */}
        <div className="notifications-list-container">
          {loading && (
            <div className="notifications-skeleton-container">
              <Skeleton variant="rectangle" height={80} className="notif-sk" />
              <Skeleton variant="rectangle" height={80} className="notif-sk" />
              <Skeleton variant="rectangle" height={80} className="notif-sk" />
            </div>
          )}

          {error && (
            <div className="notifications-error-box">
              <p>{error}</p>
              <button onClick={refetch} className="btn-retry">Reintentar</button>
            </div>
          )}

          {!loading && !error && notifications.length === 0 && (
            <div className="notifications-empty-state">
              <div className="bell-empty-icon-wrapper">
                <FaBell className="bell-empty-icon" />
              </div>
              <h3>Bandeja de entrada limpia</h3>
              <p>No tienes notificaciones pendientes en este momento. ¡Buen trabajo!</p>
            </div>
          )}

          {!loading && !error && notifications.length > 0 && (
            <div className="notifications-items-grid">
              {notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`notif-card-item ${!notif.isRead ? 'notif-unread' : 'notif-read'}`}
                >
                  <div className="notif-icon-type">
                    <FaBell />
                  </div>
                  
                  <div className="notif-content-detail">
                    <p className="notif-message-text">{notif.message}</p>
                    <span className="notif-date-stamp">
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {!notif.isRead && (
                    <div className="notif-actions-cell">
                      <button 
                        className="btn-notif-action btn-mark-read"
                        onClick={() => markAsRead(notif.id)}
                        title="Marcar como leída"
                        aria-label="Marcar como leída"
                      >
                        <FaCheck />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Notifications;
