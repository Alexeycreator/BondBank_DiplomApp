import React from "react";
import { StatusBadge } from "./StatusBadge";
import styles from "./InfoCard.module.css";

export interface ForecastItem {
  isin: string;
  name: string;
  type: string;
  currentPrice: number;
  forecastTomorrow: number;
  forecastDayAfter: number;
  changePercent: number;
  confidence: string;
  history: number[];
}

interface ForecastCardProps {
  forecast: ForecastItem;
  onClick?: (forecast: ForecastItem) => void;
}

export const ForecastCard: React.FC<ForecastCardProps> = ({
  forecast,
  onClick,
}) => {
  return (
    <div
      className={styles.card}
      onClick={() => onClick && onClick(forecast)}
      style={{ cursor: "pointer" }}
    >
      <div className={styles.header}>
        <span className={styles.isin}>{forecast.isin}</span>
        {/* ✅ Бейдж изменения цены (зеленый/красный) */}
        <StatusBadge variantType="yield" value={forecast.changePercent} />
      </div>

      <h3 className={styles.title}>{forecast.name}</h3>

      <div className={styles.typeRow}>
        {/* ✅ Бейдж типа (LSE, WB, SG, ME) */}
        <StatusBadge variantType="type" value={forecast.type} />
      </div>

      <div className={styles.prices}>
        <div className={styles.priceItem}>
          <span className={styles.priceLabel}>Текущая</span>
          <span className={styles.priceValue}>
            {forecast.currentPrice.toFixed(2)} ₽
          </span>
        </div>
        <div className={styles.priceItem}>
          <span className={styles.priceLabel}>Завтра</span>
          <span className={styles.priceValue} style={{ color: "#ff9800" }}>
            {forecast.forecastTomorrow.toFixed(2)} ₽
          </span>
        </div>
        <div className={styles.priceItem}>
          <span className={styles.priceLabel}>Послезавтра</span>
          <span className={styles.priceValue} style={{ color: "#ff9800" }}>
            {forecast.forecastDayAfter.toFixed(2)} ₽
          </span>
        </div>
      </div>

      <div className={styles.confidenceRow}>
        <span className={styles.confidenceLabel}>Уверенность:</span>
        {/* ✅ Бейдж уверенности (Высокая/Средняя/Низкая) */}
        <StatusBadge variantType="confidence" value={forecast.confidence} />
      </div>
    </div>
  );
};
