import { api, handleApiError } from "../../../shared/api/client";
import { BondsInfo } from "../model/bonds-info";

export const getBondsInfo = async (): Promise<BondsInfo> => {
    try {
        const response = await api.get<BondsInfo>("/BondsInfo/get-bonds-info");
        return response.data;
    } catch (error: unknown) {
        handleApiError(error);
    }
};