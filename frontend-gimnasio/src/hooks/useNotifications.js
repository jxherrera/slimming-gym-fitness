import { useState, useEffect, useCallback, useMemo } from 'react';
import { getNotifications, markAsRead } from '../services/notificationService';
import { useToast } from '../context/ToastContext';

export const useNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { addToast } = useToast();

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getNotifications(userId);
      if (data.success) {
        setNotifications(data.notifications || []);
      } else {
        setError(data.message || 'Error al obtener notificaciones.');
      }
    } catch (err) {
      console.error('Error in useNotifications hook:', err);
      setError(err.response?.data?.message || 'Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const markNotificationAsRead = useCallback(async (notificationId) => {
    if (!userId || !notificationId) return;
    try {
      const data = await markAsRead(userId, notificationId);
      if (data.success) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
        addToast('Notificación marcada como leída.', 'success');
      } else {
        addToast(data.message || 'No se pudo actualizar la notificación.', 'error');
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
      addToast(err.response?.data?.message || 'Error al marcar como leída.', 'error');
    }
  }, [userId, addToast]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = useMemo(() => {
    return notifications.filter((notif) => !notif.isRead).length;
  }, [notifications]);

  return {
    notifications,
    loading,
    error,
    unreadCount,
    refetch: fetchNotifications,
    markAsRead: markNotificationAsRead
  };
};
