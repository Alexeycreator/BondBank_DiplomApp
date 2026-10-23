export type PortfolioType = "conservative" | "aggressive" | "balanced";

export interface Portfolio {
    id: number;
    userId: number | string;
    name: string;
    description?: string;
    type: PortfolioType;
    currentValue: number;
    currentYield: number;
    createdAt: string;
}

export interface PortfolioHistory {
    date: string;
    totalValue: number;
    yield: number;
}

export interface PortfolioBond {
    name: string;
    isin: string;
    bondType: string;
    quantity: number;
    price: number;
    total: number;
    yield: number;
}
