import { api, handleApiError } from "../../../shared/api/client";
import {
    PassportDto,
    PassportRequestDto,
    SnilsDto,
    SnilsRequestDto,
} from "../model/security-data-types";

export const getPassportById = async (passportId: number): Promise<PassportDto> => {
    try {
        const response = await api.get<PassportDto>("/passports/info", {
            params: { passportId },
        });
        return response.data;
    } catch (error: unknown) {
        handleApiError(error);
    }
};

export const getSnilsById = async (snilsId: number): Promise<SnilsDto> => {
    try {
        const response = await api.get<SnilsDto>("/snils/info", {
            params: { snilsId },
        });
        return response.data;
    } catch (error: unknown) {
        handleApiError(error);
    }
};

export const savePassport = async (dto: PassportRequestDto): Promise<void> => {
    try {
        await api.post("/passports/save", dto);
    } catch (error: unknown) {
        handleApiError(error);
    }
};

export const deletePassport = async (): Promise<void> => {
    try {
        await api.delete("/passports/delete");
    } catch (error: unknown) {
        handleApiError(error);
    }
};

export const saveSnils = async (dto: SnilsRequestDto): Promise<void> => {
    try {
        await api.post("/snils/save", dto);
    } catch (error: unknown) {
        handleApiError(error);
    }
};

export const deleteSnils = async (): Promise<void> => {
    try {
        await api.delete("/snils/delete");
    } catch (error: unknown) {
        handleApiError(error);
    }
};
