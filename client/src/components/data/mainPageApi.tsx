/* eslint-disable no-throw-literal */
import React from "react";
import axios from "axios";

const apiUrl = process.env.REACT_APP_API_URL_HTTPS ||
    process.env.REACT_APP_API_URL_HTTP ||
    "https://localhost:57041/api";

const api = axios.create({
    baseURL: apiUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface InfoStatisticsBlock {
    totalBonds: number;
    activeUsers: number;
    exchanges: number;
};

export const getInfoStatisticsBlockData = async (): Promise<InfoStatisticsBlock> => {
    try {
        const response = await api.get<InfoStatisticsBlock>('/MainPageInfo/get-info-statistics-block');
        return response.data;
    } catch (error: any) {
        if (error.response) {
            console.log('Ошибка ответа:', error.response.data);
            console.log('Статус:', error.response.status);
            throw {
                ...error,
                serverMessage: error.response.data?.message || 'Неизвестная ошибка',
                statusCode: error.response.status
            };
        } else if (error.request) {
            throw { message: 'Нет ответа от сервера', isNetworkError: true };
        } else {
            throw { message: error.message, isSetupError: true };
        }
    }
};