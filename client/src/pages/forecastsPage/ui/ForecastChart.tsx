import { useMemo } from "react";
import { LineChart } from "../../../shared/ui/charts/LineChart";
import { ForecastItem } from "../model/types";
import { formatForecastDate, getForecastDates } from "../model/forecast-dates";
import { useTheme } from "../../../shared/theme/ThemeContext";
import styles from "../ForecastsPage.module.css";

interface ForecastChartProps {
  forecast: ForecastItem;
}

const ForecastChart = ({ forecast }: ForecastChartProps) => {
  const { theme } = useTheme();
  const chartTextColor = theme === "dark" ? "#ffffff" : "#172033";
  const chartMutedColor = theme === "dark" ? "#a0aabf" : "#5f6b7c";
  const chartData = useMemo(() => {
    const forecastDates = getForecastDates(forecast.currentDate, forecast.forecast.length);
    const historyPoints = forecast.history;
    const historyCount = historyPoints.length;

    return {
      labels: [
        ...historyPoints.map((point) => formatForecastDate(point.date)),
        ...forecastDates.map(formatForecastDate),
      ],
      datasets: [
        {
          label: "История",
          data: [
            ...historyPoints.map((point) => point.price),
            ...forecast.forecast.map(() => null),
          ],
          borderColor: "#4fc3f7",
          backgroundColor: "rgba(79, 195, 247, 0.08)",
          fill: false,
          tension: 0.3,
          pointBackgroundColor: "#4fc3f7",
        },
        {
          label: "Прогноз",
          data: [
            ...Array(Math.max(0, historyCount - 1)).fill(null),
            ...(historyCount > 0 ? [historyPoints[historyCount - 1].price] : []),
            ...forecast.forecast,
          ],
          borderColor: "#ff9800",
          backgroundColor: "rgba(255, 152, 0, 0.08)",
          borderDash: [5, 5],
          fill: true,
          tension: 0.3,
          pointBackgroundColor: "#ff9800",
        },
      ],
    };
  }, [forecast]);

  return (
    <section className={styles.chartSection}>
      <div className={styles.chartContainer}>
        <LineChart
          labels={chartData.labels}
          datasets={chartData.datasets}
          options={{
            plugins: {
              title: {
                display: true,
                text: `Прогноз для ${forecast.name}`,
                color: chartTextColor,
                font: { size: 16, weight: "bold" },
              },
              legend: { labels: { color: chartMutedColor } },
            },
            scales: {
              x: { ticks: { color: chartMutedColor } },
              y: {
                beginAtZero: false,
                ticks: {
                  color: chartMutedColor,
                  callback: (value: string | number) =>
                    `${Number(value).toLocaleString("ru-RU", { maximumFractionDigits: 2 })} ₽`,
                },
              },
            },
          }}
        />
      </div>
    </section>
  );
};

export default ForecastChart;
