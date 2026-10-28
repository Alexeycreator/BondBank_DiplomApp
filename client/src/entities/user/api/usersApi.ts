import { api, handleApiError } from "../../../shared/api/client";
import { AdminUserResponseDto, UserModel } from "../model/types";
import keycloak from '../../../keycloak';

export const usersApi = {
  getMyProfile: async (): Promise<UserModel> => {
    const email = keycloak.tokenParsed?.email;

    if (!email) {
      throw new Error("Email не найден в токене Keycloak");
    }

    try {
      const response = await api.get<UserModel[]>("/users/filter", {
        params: { email },
      });
      const user = response.data[0];
      if (!user) throw new Error("Профиль пользователя не найден");
      return user;
    } catch (error: unknown) {
      handleApiError(error);
    }
  },

  getAllUsers: async (): Promise<AdminUserResponseDto[]> => {
    try {
      const response = await api.get<AdminUserResponseDto[]>("/users/all");
      return response.data;
    } catch (error: unknown) {
      handleApiError(error);
    }
  },

  getUserById: async (userId: number): Promise<UserModel[]> => {
    try {
      const response = await api.get<UserModel[]>("/users/filter", {
        params: { id: userId },
      });
      return response.data;
    } catch (error: unknown) {
      handleApiError(error);
    }
  },

  getUserByLogin: async (login: string): Promise<UserModel[]> => {
    try {
      const response = await api.get<UserModel[]>("/users/filter", {
        params: { login },
      });
      return response.data;
    } catch (error: unknown) {
      handleApiError(error);
    }
  },

  getUserByTin: async (tin: string): Promise<UserModel[]> => {
    try {
      const response = await api.get<UserModel[]>("/users/filter", {
        params: { tin },
      });
      return response.data;
    } catch (error: unknown) {
      handleApiError(error);
    }
  },

  getUserByFullName: async (
    secondName: string,
    firstName: string,
    surName = "",
  ): Promise<UserModel[]> => {
    try {
      const response = await api.get<UserModel[]>("/users/filter", {
        params: { secondName, firstName, surName },
      });
      return response.data;
    } catch (error: unknown) {
      handleApiError(error);
    }
  },

  getUserByPhoneNumber: async (phoneNumber: string): Promise<UserModel[]> => {
    try {
      const response = await api.get<UserModel[]>("/users/filter", {
        params: { phoneNumber },
      });
      return response.data;
    } catch (error: unknown) {
      handleApiError(error);
    }
  },

  updateLoginHeartbeat: async (): Promise<{ message: string; keycloakId: string }> => {
    try {
      const response = await api.post<{ message: string; keycloakId: string }>("/users/heartbeat");
      return response.data;
    } catch (error: unknown) {
      handleApiError(error);
    }
  },
};