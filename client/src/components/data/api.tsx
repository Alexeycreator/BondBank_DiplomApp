/* eslint-disable no-throw-literal */
import axios from "axios";

const apiUrl =
    process.env.REACT_APP_API_URL_HTTPS ||
    process.env.REACT_APP_API_URL_HTTP ||
    "https://localhost:57041/api";

export const api = axios.create({
    baseURL: apiUrl,
    headers: {
        "Content-Type": "application/json",
    },
});

/**
 * Универсальный обработчик ошибок axios.
 * Бросает объект с полями serverMessage / statusCode / isNetworkError.
 */
export function handleApiError(error: any): never {
    if (error.response) {
        throw {
            ...error,
            serverMessage:
                error.response.data?.message ||
                error.response.data ||
                "Неизвестная ошибка",
            statusCode: error.response.status,
        };
    } else if (error.request) {
        throw { message: "Нет ответа от сервера", isNetworkError: true };
    } else {
        throw { message: error.message, isSetupError: true };
    }
}