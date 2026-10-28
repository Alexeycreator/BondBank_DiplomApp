import { api, handleApiError } from "../../../shared/api/client";
import { PortfolioDto, PortfolioHistoryDto, PortfolioRequestDto } from "../model/api-types";

export const getAllPortfolios = async (): Promise<PortfolioDto[]> => {
    try {
        const response = await api.get<PortfolioDto[]>("/portfolios/all");
        return response.data;
    } catch (error: unknown) {
        handleApiError(error);
    }
};

export const getPortfoliosByUser = async (userId: number): Promise<PortfolioDto[]> => {
    try {
        const response = await api.get<PortfolioDto[]>("/portfolios/user", {
            params: { userId },
        });
        return response.data;
    } catch (error: unknown) {
        handleApiError(error);
    }
};

export const getPortfolioHistory = async (portfolioId: number): Promise<PortfolioHistoryDto[]> => {
    try {
        const response = await api.get<PortfolioHistoryDto[]>(
            "/portfolios/history",
            { params: { portfolioId } },
        );
        return response.data;
    } catch (error: unknown) {
        handleApiError(error);
    }
};

export const savePortfolio = async (
    portfolioId: number | null,
    dto: PortfolioRequestDto,
): Promise<{ id: number; message: string }> => {
    try {
        const response = await api.post<{ id: number; message: string }>("/portfolios/save", dto, {
            params: portfolioId ? { portfolioId } : undefined,
        });
        return response.data;
    } catch (error: unknown) {
        handleApiError(error);
    }
};

export const deletePortfolio = async (portfolioId: number): Promise<void> => {
    try {
        await api.delete(`/portfolios/${portfolioId}`);
    } catch (error: unknown) {
        handleApiError(error);
    }
};
