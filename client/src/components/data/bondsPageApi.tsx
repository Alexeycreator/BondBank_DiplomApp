import { api, handleApiError } from "./api";
import { BondsInfo } from "./types";

export const getBondsInfo = async (): Promise<BondsInfo> => {
    try {
        const response = await api.get<BondsInfo>("/BondsInfo/get-bonds-info");
        return response.data;
    } catch (error: any) {
        handleApiError(error);
    }
};