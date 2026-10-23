import { PortfolioType } from "./types";

export interface PortfolioTypeInfo {
    maxBonds: number;
    maxYield: number;
    description: string;
    title: string;
    icon: string;
}

export const PORTFOLIO_OPTIONS: Record<PortfolioType, PortfolioTypeInfo> = {
    conservative: {
        maxBonds: 200,
        maxYield: 5,
        description: "Низкий риск, стабильный доход",
        title: "Консервативный",
        icon: "🛡️",
    },
    balanced: {
        maxBonds: 500,
        maxYield: 10,
        description: "Средний риск и доходность",
        title: "Сбалансированный",
        icon: "⚖️",
    },
    aggressive: {
        maxBonds: 300,
        maxYield: 15,
        description: "Высокий риск, высокая доходность",
        title: "Агрессивный",
        icon: "🚀",
    },
};

export const PORTFOLIO_TYPES = Object.keys(PORTFOLIO_OPTIONS) as PortfolioType[];
