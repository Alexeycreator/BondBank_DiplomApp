import { api, handleApiError } from "../../../shared/api/client";
import { BondHistoryModel } from "../model/bond-history";

export const getAllBondHistories = async (): Promise<BondHistoryModel[]> => {
    try {
        const response = await api.get<BondHistoryModel[]>("/bond-histories/all");
        return response.data;
    } catch (error: unknown) {
        handleApiError(error);
    }
};

export const getBondHistoriesByIsin = async (isin: string): Promise<BondHistoryModel[]> => {
    try {
        const response = await api.get<BondHistoryModel[]>(
            `/bond-histories/isin/${encodeURIComponent(isin)}`,
        );
        return response.data;
    } catch (error: unknown) {
        handleApiError(error);
    }
};

export const getBondHistoriesByType = async (type: string): Promise<BondHistoryModel[]> => {
    try {
        const response = await api.get<BondHistoryModel[]>(
            `/bond-histories/type/${encodeURIComponent(type)}`,
        );
        return response.data;
    } catch (error: unknown) {
        handleApiError(error);
    }
};

export const getBondHistoriesByDate = async (date: string): Promise<BondHistoryModel[]> => {
    try {
        const response = await api.get<BondHistoryModel[]>(
            `/bond-histories/date/${encodeURIComponent(date)}`,
        );
        return response.data;
    } catch (error: unknown) {
        handleApiError(error);
    }
};

export const getBondHistoryTypes = async (): Promise<string[]> => {
    try {
        const response = await api.get<string[]>("/bond-histories/names-type");
        return response.data;
    } catch (error: unknown) {
        handleApiError(error);
    }
};

export const getBondHistoriesByFilter = async (filters: {
    isin?: string;
    type?: string;
    date?: string;
}): Promise<BondHistoryModel[]> => {
    try {
        const response = await api.get<BondHistoryModel[]>("/bond-histories/filter", {
            params: filters,
        });
        return response.data;
    } catch (error: unknown) {
        handleApiError(error);
    }
};
