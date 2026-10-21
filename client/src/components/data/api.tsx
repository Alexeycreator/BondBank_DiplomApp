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
    (error) => Promise.reject(error)
);

export function handleApiError(error: any): never {
    if (error.response) {
        throw {
            ...error,
            serverMessage: error.response.data?.message || "Неизвестная ошибка",
            statusCode: error.response.status,
        };
    } else if (error.request) {
        throw { message: "Нет ответа от сервера", isNetworkError: true };
    } else {
        throw { message: error.message, isSetupError: true };
    }
}