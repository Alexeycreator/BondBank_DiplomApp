import React from "react";
import styles from "./InfoCard.module.css";
import { StatusBadge } from "./StatusBadge";

export interface ForecastItem {
    isin: string;
    name: string;
    type: string;
    changePercent: number;
    currentPrice: number;
    forecastTomorrow: number;
    forecastDayAfter: number;
    confidence: "Высокая" | "Средняя" | "Низкая";
    history?: number[]; 
}

interface ForecastCardProps {
    forecast: ForecastItem;
    onClick?: (forecast: ForecastItem) => void;
}

export const ForecastCard: React.FC<ForecastCardProps> = ({ forecast, onClick }) => {
    const isPositive = forecast.changePercent >= 0;

    return (
        <div 
            className={styles.card} 
            onClick={() => onClick && onClick(forecast)}
            style={{ cursor: onClick ? "pointer" : "default" }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", alignItems: "center" }}>
                <span className={styles.meta} style={{ margin: 0 }}>{forecast.isin}</span>
                {/* ✅ Используем StatusBadge для процентов */}
                <StatusBadge 
                    variantType="custom"
                    customBg={isPositive ? "success" : "danger"} 
                    value={`${isPositive ? "+" : ""}${forecast.changePercent.toFixed(2)}%`} 
                />
            </div>

            <h3 className={styles.title} style={{ marginBottom: "12px" }}>{forecast.name}</h3>
            {/* ✅ Используем StatusBadge для типа облигации */}
            <StatusBadge variantType="type" value={forecast.type} />

            <div className={styles.statsRow} style={{ marginTop: "20px" }}>
                <div className={styles.statItem}>
                    <span className={styles.statLabel}>Текущая</span>
                    <span className={styles.statValue}>{forecast.currentPrice.toFixed(2)} ₽</span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statLabel}>Завтра</span>
                    <span className={styles.statValue} style={{ color: "#ff9800" }}>
                        {forecast.forecastTomorrow.toFixed(2)} ₽
                    </span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statLabel}>Послезавтра</span>
                    <span className={styles.statValue} style={{ color: "#ff9800" }}>
                        {forecast.forecastDayAfter.toFixed(2)} ₽
                    </span>
                </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                <span className={styles.statLabel}>Уверенность:</span>
                {/* ✅ Используем StatusBadge для уверенности */}
                <StatusBadge 
                    variantType="custom"
                    customBg={
                        forecast.confidence === "Высокая" ? "success" : 
                        forecast.confidence === "Средняя" ? "warning" : "danger"
                    }
                    value={forecast.confidence}
                />
            </div>
            <button className={styles.actionButton} style={{ marginTop: "16px" }}>
                Подробнее об облигации →
            </button>
        </div>
    );
};