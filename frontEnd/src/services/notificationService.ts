import api from './api';

export interface Notification {
  id: string;
  user_id: string;
  type: 'comment' | 'join';
  message: string;
  read: boolean;
  related_board_id: {
    _id: string;
    id: string;
    title: string;
  };
  created_at: string;
}

export const getNotifications = async (): Promise<Notification[]> => {
  const response = await api.get('/notifications');
  return response.data;
};

export const markAsRead = async (id: string): Promise<void> => {
  await api.put(`/notifications/${id}/read`);
};

export default {
  getNotifications,
  markAsRead
};
