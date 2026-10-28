import { api, handleApiError } from "../../../shared/api/client";
import { News, NewsRequestDto, SaveNewsResponseDto } from "../model/types";

export const getAllNews = async (): Promise<News[]> => {
    try {
        const response = await api.get<News[]>("/news/all");
        return response.data;
    } catch (error: unknown) {
        handleApiError(error);
    }
};

export const getNewsById = async (id: number): Promise<News> => {
    try {
        const response = await api.get<News>(`/news/${id}`);
        return response.data;
    } catch (error: unknown) {
        handleApiError(error);
    }
};

export const getNewsByFilter = async (category?: string, date?: string): Promise<News[]> => {
    try {
        const response = await api.get<News[]>("/news/filter", {
            params: { category, date },
        });
        return response.data;
    } catch (error: unknown) {
        handleApiError(error);
    }
};

export const saveNews = async (
    newsId: number | null,
    dto: NewsRequestDto,
): Promise<SaveNewsResponseDto> => {
    try {
        const response = await api.post<SaveNewsResponseDto>("/news/save", dto, {
            params: newsId ? { newsId } : undefined,
        });
        return response.data;
    } catch (error: unknown) {
        handleApiError(error);
    }
};

export const deleteNews = async (id: number): Promise<void> => {
    try {
        await api.delete(`/news/${id}`);
    } catch (error: unknown) {
        handleApiError(error);
    }
};
