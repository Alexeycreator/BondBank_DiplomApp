import { api } from '../../../shared/api/client';
import { UserModel } from '../model/types';
import keycloak from '../../../keycloak';

export const usersApi = {
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