import React from "react";
import { ProgressBar } from "react-bootstrap";
import styles from "../../../shared/ui/info-card/InfoCard.module.css";
import { StatusBadge } from "../../../shared/ui/status-badge/StatusBadge";
import { CapacityBadge } from "../../../shared/ui/capacity-badge/CapacityBadge";
import { PORTFOLIO_OPTIONS } from "../model/portfolio-options";
import { Portfolio } from "../model/types";

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
    const limits = PORTFOLIO_OPTIONS[portfolio.type];
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
            <span className={styles.meta}>{limits.description}</span>
            
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