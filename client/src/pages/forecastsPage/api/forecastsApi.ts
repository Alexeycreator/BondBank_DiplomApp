import { api, handleApiError } from "../../../shared/api/client";
import { ForecastInfoDto } from "../model/api-types";

export const getForecastInfo = async (date: string, currency: string): Promise<ForecastInfoDto> => {
    try {
        const response = await api.get<ForecastInfoDto>("/forecast/info", {
            params: { date, currency },
        });
        return response.data;
    } catch (error: unknown) {
        handleApiError(error);
    }
};
