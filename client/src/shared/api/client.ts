import axios from "axios";
import keycloak from "../../keycloak";

const apiUrl =
  import.meta.env.VITE_API_URL_HTTPS ||
  import.meta.env.VITE_API_URL_HTTP ||
  "http://localhost:57042/api";

export const api = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    if (keycloak.token) {
      config.headers.Authorization = `Bearer ${keycloak.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export class ApiRequestError extends Error {
  readonly serverMessage?: string;
  readonly statusCode?: number;
  readonly isNetworkError?: boolean;
  readonly isSetupError?: boolean;

  constructor(
    message: string,
    details: {
      serverMessage?: string;
      statusCode?: number;
      isNetworkError?: boolean;
      isSetupError?: boolean;
    } = {},
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.serverMessage = details.serverMessage;
    this.statusCode = details.statusCode;
    this.isNetworkError = details.isNetworkError;
    this.isSetupError = details.isSetupError;
  }
}

export function handleApiError(error: unknown): never {
  if (!axios.isAxiosError(error)) {
    const message =
      error instanceof Error ? error.message : "Неизвестная ошибка";
    throw new ApiRequestError(message, { isSetupError: true });
  }

  if (error.response) {
    const data = error.response.data;
    const status = error.response.status;
    let serverMessage = "Неизвестная ошибка";

    // ✅ Извлекаем сообщение из ответа
    if (typeof data === "string" && data.length > 0) {
      serverMessage = data;
    } else if (data && typeof data === "object") {
      serverMessage =
        data.message ||
        data.error ||
        data.title ||
        data.detail ||
        serverMessage;
    }

    // ✅ Если сервер вернул 401 и не прислал текст, пишем сами
    if (status === 401) {
      serverMessage = "Для просмотра этой страницы необходимо авторизоваться.";
    }
    // ✅ Если 403 (Forbidden)
    else if (status === 403) {
      serverMessage = "У вас недостаточно прав для просмотра этой страницы.";
    }

    throw new ApiRequestError(error.message, {
      serverMessage: serverMessage,
      statusCode: status,
    });
  }

  if (error.request) {
    throw new ApiRequestError("Нет ответа от сервера", {
      isNetworkError: true,
    });
  }

  throw new ApiRequestError(error.message, { isSetupError: true });
}
