export interface PortfolioDto {
    id: number;
    name: string;
    userId: number;
    description: string | null;
    type: string | null;
    createdAt: string;
}

export interface PortfolioRequestDto {
    name: string;
    description: string | null;
    type: string | null;
}

export interface PortfolioHistoryDto {
    id: number;
    dateSavePortfolioUser: string;
    totalValue: number;
    totalYield: number;
    portfoliosId: number;
}
