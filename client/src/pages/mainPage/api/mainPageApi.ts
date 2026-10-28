import { api, handleApiError } from "../../../shared/api/client";
import { InfoStatisticsBlock } from "../model/types";

export const getInfoStatisticsBlockData = async (): Promise<InfoStatisticsBlock> => {
    try {
        const response = await api.get<InfoStatisticsBlock>(
            "/main-page/statistics-block"
        );
        return response.data;
    } catch (error: unknown) {
        handleApiError(error);
    }
};