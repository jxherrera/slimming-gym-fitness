import api from './api';

export const getNotifications = async (userId) => {
  const response = await api.get(`/users/${userId}/notifications`);
  return response.data;
};

export const markAsRead = async (userId, notificationId) => {
  const response = await api.patch(`/users/${userId}/notifications/${notificationId}/read`);
  return response.data;
};
