import React from "react";
import { ProgressBar } from "react-bootstrap";
import styles from "./InfoCard.module.css";
import { StatusBadge } from "./StatusBadge";
import { CapacityBadge } from "./CapacityBadge";

// ==================== ЛОКАЛЬНЫЕ ТИПЫ ====================
export type PortfolioType = "conservative" | "balanced" | "aggressive";

export interface Portfolio {
    id: number;
    userId: number;
    name: string;
    description?: string;
    type: PortfolioType;
    currentValue: number;
    currentYield: number;
    createdAt: string;
}

// ✅ Функция для генерации моковых данных
export const getMockPortfolios = (userId: number): Portfolio[] => {
    const mockData: Portfolio[] = [
        { id: 1, userId: 1, name: "Консервативный", description: "Основной портфель для долгосрочных инвестиций", type: "conservative", currentValue: 1450000, currentYield: 4.2, createdAt: "2026-01-15" },
        { id: 2, userId: 1, name: "Агрессивный", description: "Для высокодоходных облигаций", type: "aggressive", currentValue: 2350000, currentYield: 7.8, createdAt: "2026-03-20" },
        { id: 3, userId: 1, name: "Сбалансированный", type: "balanced", currentValue: 3200000, currentYield: 5.6, createdAt: "2026-05-10" },
        { id: 4, userId: 2, name: "Портфель Петрова", description: "Личный портфель", type: "balanced", currentValue: 850000, currentYield: 5.0, createdAt: "2026-06-01" },
    ];
    return mockData.filter((p) => p.userId === userId);
};

// ==================== КОНСТАНТЫ ====================
const PORTFOLIO_LIMITS: Record<PortfolioType, { maxBonds: number }> = {
    conservative: { maxBonds: 200 },
    aggressive: { maxBonds: 300 },
    balanced: { maxBonds: 500 },
};

const typeDescription: Record<PortfolioType, string> = {
    conservative: "Низкий риск, стабильный доход",
    aggressive: "Высокий риск, высокая доходность",
    balanced: "Средний риск и доходность",
};

// ==================== КОМПОНЕНТ ====================
interface PortfolioCardProps {
    portfolio: Portfolio;
    totalQuantity: number;
    currentValue: number;
    currentYield: number;
    isHistorical: boolean;
    isActive: boolean;
    onOpen: (portfolio: Portfolio) => void;
}

export const PortfolioCard: React.FC<PortfolioCardProps> = ({
    portfolio,
    totalQuantity,
    currentValue,
    currentYield,
    isHistorical,
    isActive,
    onOpen,
}) => {
    const limits = PORTFOLIO_LIMITS[portfolio.type];
    const percentage = (totalQuantity / limits.maxBonds) * 100;

    // ✅ Выбираем вариант для Bootstrap ProgressBar
    let progressVariant = "success";
    if (percentage >= 90) progressVariant = "danger";
    else if (percentage >= 70) progressVariant = "warning";

    const formatPrice = (price: number): string => {
        return `${price.toLocaleString("ru-RU")} ₽`;
    };

    return (
        <div className={`${styles.card} ${isActive ? styles.active : ""}`}>
            <h3 className={styles.title}>{portfolio.name}</h3>
            {portfolio.description && (
                <p className={styles.subtitle}>{portfolio.description}</p>
            )}
            <span className={styles.meta}>{typeDescription[portfolio.type]}</span>
            
            <div className={styles.statsRow}>
                <div className={styles.statItem}>
                    <span className={styles.statLabel}>
                        {isHistorical ? "Стоимость на дату" : "Стоимость"}
                    </span>
                    <span className={styles.statValue}>{formatPrice(currentValue)}</span>
                </div>
                
                <div className={styles.statItem}>
                    <span className={styles.statLabel}>Облигаций</span>
                    <div style={{ marginTop: "4px" }}>
                        <CapacityBadge current={totalQuantity} max={limits.maxBonds} />
                    </div>
                </div>
                
                <div className={styles.statItem}>
                    <span className={styles.statLabel}>
                        {isHistorical ? "Доходность на дату" : "Доходность"}
                    </span>
                    <div style={{ marginTop: "4px" }}>
                        <StatusBadge variantType="yield" value={currentYield} />
                    </div>
                </div>
            </div>

            {/* ✅ Прогресс-бар с отображением процентов */}
            <div style={{ marginBottom: "16px" }}>
                <ProgressBar 
                    now={Math.min(percentage, 100)} 
                    variant={progressVariant} 
                    label={`${percentage.toFixed(0)}%`} // Отображаем проценты
                    style={{ height: "20px", fontSize: "12px", fontWeight: "bold" }} // Увеличиваем высоту, чтобы текст поместился
                />
            </div>
            
            <button className={styles.actionButton} onClick={() => onOpen(portfolio)}>
                Подробнее
            </button>
        </div>
    );
};