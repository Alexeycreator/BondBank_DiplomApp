import { api, handleApiError } from "../../../shared/api/client";
import { BondsInfo } from "../model/bonds-info";
import { BondDto } from "../model/bonds";
import { ForecastByIsinDto } from "../../../pages/forecastsPage/model/api-types";

export const getBondsInfo = async (): Promise<BondsInfo> => {
    try {
        const response = await api.get<BondsInfo>("/bonds-page/bonds-info");
        return response.data;
    } catch (error: unknown) {
        handleApiError(error);
    }
};

export const getAllBonds = async (): Promise<BondDto[]> => {
    try {
        const response = await api.get<BondDto[]>("/bonds/all");
        return response.data;
    } catch (error: unknown) {
        handleApiError(error);
    }
};

export const getBondsByType = async (typeBond: string): Promise<BondDto[]> => {
    try {
        const response = await api.get<BondDto[]>(`/bonds/type/${encodeURIComponent(typeBond)}`);
        return response.data;
    } catch (error: unknown) {
        handleApiError(error);
    }
};

export const getBondByIsin = async (isin: string): Promise<BondDto> => {
    try {
        const response = await api.get<BondDto>(`/bonds/isin/${encodeURIComponent(isin)}`);
        return response.data;
    } catch (error: unknown) {
        handleApiError(error);
    }
};

export const getBondsByFilter = async (
    type?: string,
    isin?: string,
): Promise<BondDto[]> => {
    try {
        const response = await api.get<BondDto[]>("/bonds/filter", {
            params: { type, isin },
        });
        return response.data;
    } catch (error: unknown) {
        handleApiError(error);
    }
};

export const getForecastBonds = async (): Promise<Record<string, number[]>> => {
    try {
        const response = await api.get<Record<string, number[]>>(
            "/bonds/forecast",
        );
        return response.data;
    } catch (error: unknown) {
        handleApiError(error);
    }
};

export const getForecastByIsin = async (isin: string): Promise<ForecastByIsinDto> => {
    try {
        const response = await api.get<ForecastByIsinDto>(
            `/bonds/forecast/${encodeURIComponent(isin)}`,
        );
        return response.data;
    } catch (error: unknown) {
        handleApiError(error);
    }
};