import React from "react";
import { ForecastItem } from "../model/types";
import { StatusBadge } from "../../../shared/ui/status-badge/StatusBadge";
import { formatForecastDate, getForecastDates } from "../model/forecast-dates";
import styles from "./ForecastCard.module.css";

export type { ForecastItem } from "../model/types";

interface ForecastCardProps {
  forecast: ForecastItem;
  currency: string;
  rates: Record<string, number>;
  onClick?: (forecast: ForecastItem) => void;
}

export const ForecastCard: React.FC<ForecastCardProps> = ({
  forecast,
  currency,
  rates,
  onClick,
}) => {
  const forecastDates = getForecastDates(
    forecast.currentDate,
    forecast.forecast.length,
  );

  // ✅ Конвертируем историю (из валюты облигации в выбранную)
  const convertHistoryPrice = (
    value: number | null | undefined,
  ): number | null => {
    if (value === null || value === undefined) return null;
    const fromRate = rates[forecast.currency] ?? 1;
    const toRate = rates[currency] ?? 1;
    return (value * fromRate) / toRate;
  };

  // ✅ Конвертируем прогноз (из RUB в выбранную)
  // Если прогноз уже в RUB (как в вашем случае), мы просто делим на курс выбранной валюты.
  // Если выбран RUB, то toRate = 1, значение не меняется.
  const convertForecastPrice = (value: number): number => {
    const toRate = rates[currency] ?? 1;
    return value / toRate;
  };

  const formatPrice = (value: number | null): string =>
    value === null
      ? "—"
      : `${value.toLocaleString("ru-RU", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} ${currency}`;

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
          {/* ✅ Текущую цену конвертируем из валюты облигации */}
          {formatPrice(convertHistoryPrice(forecast.currentPrice))}
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
            <div
              className={styles.forecastPrice}
              key={`${date ?? "forecast"}-${index}`}
            >
              <span className={styles.label}>
                {date ? formatForecastDate(date) : "Прогноз"}
              </span>
              <span className={styles.forecastValue}>
                {formatPrice(convertForecastPrice(Number(value)))}
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
