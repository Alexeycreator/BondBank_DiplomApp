import React from "react";
import { ForecastItem } from "../model/types";
import { StatusBadge } from "../../../shared/ui/status-badge/StatusBadge";
import { formatForecastDate, getForecastDates } from "../model/forecast-dates";
import styles from "./ForecastCard.module.css";

export type { ForecastItem } from "../model/types";

interface ForecastCardProps {
  forecast: ForecastItem;
  onClick?: (forecast: ForecastItem) => void;
}

const formatPrice = (value: number): string =>
  `${value.toLocaleString("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ₽`;

export const ForecastCard: React.FC<ForecastCardProps> = ({
  forecast,
  onClick,
}) => {
  const forecastDates = getForecastDates(forecast.currentDate, forecast.forecast.length);

  return (
    <button
      type="button"
      className={styles.card}
      onClick={() => onClick && onClick(forecast)}
    >
      <div className={styles.cardHeader}>
        <span className={styles.isinLabel}>ISIN</span>
        <span className={styles.isin}>{forecast.isin}</span>
        <StatusBadge variantType="type" value={forecast.type} />
      </div>

      <h3 className={styles.title}>{forecast.name}</h3>

      <div className={styles.currentPrice}>
        <span className={styles.label}>Текущая цена</span>
        <span className={styles.price}>
          {forecast.currentPrice === null
            ? "—"
            : formatPrice(forecast.currentPrice)}
        </span>
        <span className={styles.date}>
          {forecast.currentDate
            ? `на ${formatForecastDate(forecast.currentDate)}`
            : "Дата последней цены не указана"}
        </span>
      </div>

      <div className={styles.forecastPrices}>
        {forecast.forecast.map((value, index) => {
          const date = forecastDates[index];
          return (
            <div className={styles.forecastPrice} key={`${date ?? "forecast"}-${index}`}>
              <span className={styles.label}>{date ? formatForecastDate(date) : "Прогноз"}</span>
              <span className={styles.forecastValue}>
                {formatPrice(Number(value))}
              </span>
            </div>
          );
        })}
      </div>
      <span className={styles.footer}>
        История за последнюю неделю · {forecast.forecast.length} прогноза
      </span>
    </button>
  );
};
