import { api, handleApiError } from "../../../shared/api/client";
import { CurrencyRateDto } from "../model/types";

export const getAllCurrencyRates = async (): Promise<CurrencyRateDto[]> => {
    try {
        const response = await api.get<CurrencyRateDto[]>("/currency-rates/all");
        return response.data;
    } catch (error: unknown) {
        handleApiError(error);
    }
};

export const getCurrencyRatesByDate = async (date: string): Promise<CurrencyRateDto[]> => {
    try {
        const response = await api.get<CurrencyRateDto[]>(
            "/currency-rates/filter",
            { params: { date } },
        );
        return response.data;
    } catch (error: unknown) {
        handleApiError(error);
    }
};

export const getCurrencyRateByDate = async (
    date: string,
    currency: string,
): Promise<CurrencyRateDto[]> => {
    try {
        const response = await api.get<CurrencyRateDto[]>(
            "/currency-rates/filter",
            { params: { date, currency } },
        );
        return response.data;
    } catch (error: unknown) {
        handleApiError(error);
    }
};

export const getCurrencyRatesByCurrency = async (currency: string): Promise<CurrencyRateDto[]> => {
    try {
        const response = await api.get<CurrencyRateDto[]>(
            "/currency-rates/filter",
            { params: { currency } },
        );
        return response.data;
    } catch (error: unknown) {
        handleApiError(error);
    }
};

export const getCurrencyNames = async (): Promise<string[]> => {
    try {
        const response = await api.get<string[]>("/currency-rates/names-currency");
        return response.data;
    } catch (error: unknown) {
        handleApiError(error);
    }
};
