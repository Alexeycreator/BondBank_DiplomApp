export type PortfolioType = "conservative" | "balanced" | "aggressive";

export interface PortfolioTypeInfo {
    maxBonds: number;
    maxYield: number;
    description: string;
    title: string;
    icon: string;
}

export const MOCK_PORTFOLIO_LIMITS: Record<PortfolioType, PortfolioTypeInfo> = {
    conservative: {
        maxBonds: 200,
        maxYield: 5,
        description: "Низкий риск, стабильный доход",
        title: "Консервативный",
        icon: "🛡️"
    },
    balanced: {
        maxBonds: 500,
        maxYield: 10,
        description: "Средний риск и доходность",
        title: "Сбалансированный",
        icon: "⚖️"
    },
    aggressive: {
        maxBonds: 300,
        maxYield: 15,
        description: "Высокий риск, высокая доходность",
        title: "Агрессивный",
        icon: "🚀"
    },
};

// Экспортируем массив ключей для удобного перебора
export const PORTFOLIO_TYPES: PortfolioType[] = ["conservative", "balanced", "aggressive"];