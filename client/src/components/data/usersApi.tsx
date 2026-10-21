import { api } from './api';
import { UserModel } from './types/user';
import keycloak from '../../keycloak';

export const usersApi = {
  // Отправка heartbeat (создание/обновление в БД)
  sendHeartbeat: async (): Promise<void> => {
    await api.post('/Users/heartbeat');
  },

  // ✅ Получение профиля по email из токена Keycloak
  getMyProfile: async (): Promise<UserModel> => {
    // Берем email из токена (он гарантированно там есть, если настроен scope "email")
    const email = keycloak.tokenParsed?.email;
    
    if (!email) {
      throw new Error("Email не найден в токене Keycloak");
    }

    const response = await api.get<UserModel>(`/Users/get-user-by-email?email=${encodeURIComponent(email)}`);
    return response.data;
  },
};