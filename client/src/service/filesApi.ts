import { api, handleApiError } from "../shared/api/client";

export const exportBondsFile = async (fileName: string): Promise<Blob> => {
    try {
        const response = await api.get<Blob>("/files/export-bonds", {
            params: { fileName },
            responseType: "blob",
        });
        return response.data;
    } catch (error: unknown) {
        handleApiError(error);
    }
};

export const importBondsFile = async (file: File, typeFile: string): Promise<string> => {
    try {
        const formData = new FormData();
        formData.append("file", file);
        const response = await api.post<string>("/files/import-bonds", formData, {
            params: { typeFile },
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    } catch (error: unknown) {
        handleApiError(error);
    }
};
