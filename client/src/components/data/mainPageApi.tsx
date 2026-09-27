import { api, handleApiError } from "./api";
import { InfoStatisticsBlock } from "./types";

export const getInfoStatisticsBlockData = async (): Promise<InfoStatisticsBlock> => {
    try {
        const response = await api.get<InfoStatisticsBlock>(
            "/MainPageInfo/get-info-statistics-block"
        );
        return response.data;
    } catch (error: any) {
        handleApiError(error);
    }
};