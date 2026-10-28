import { api, handleApiError } from "./client";

export interface HealthResponseDto {
    status: string;
    timestamp: string;
}

export const getHealth = async (): Promise<HealthResponseDto> => {
    try {
        const response = await api.get<HealthResponseDto>("/server/ping");
        return response.data;
    } catch (error: unknown) {
        handleApiError(error);
    }
};
