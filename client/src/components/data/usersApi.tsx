import { api } from './api';
import { UserModel } from './types/user';

export const usersApi = {
  // Отправка heartbeat (создание/обновление в БД)
  sendHeartbeat: async (): Promise<void> => {
    await api.post('/Users/heartbeat');
  },

  // Получение профиля текущего пользователя (понадобится для ProfilePage)
  getMyProfile: async (): Promise<UserModel> => {
    const response = await api.get('/Users/me'); // Нам нужно будет добавить этот метод в C#
    return response.data;
  }
};