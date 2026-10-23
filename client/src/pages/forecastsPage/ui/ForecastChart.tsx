import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { LineChart } from "../../../shared/ui/charts/LineChart";
import { ForecastItem } from "../model/types";
import styles from "../ForecastsPage.module.css";

interface ForecastChartProps {
  forecast: ForecastItem;
}

const ForecastChart = ({ forecast }: ForecastChartProps) => {
  const navigate = useNavigate();
  const chartData = useMemo(() => {
    const historyLength = forecast.history.length;
    return {
      labels: [
        ...forecast.history.map((_, index) => `День ${index + 1}`),
        "Завтра",
        "Послезавтра",
      ],
      datasets: [
        {
          label: "История цены",
          data: [...forecast.history, null, null],
          borderColor: "#4fc3f7",
          backgroundColor: "rgba(79, 195, 247, 0.1)",
          fill: true,
          tension: 0.3,
          pointBackgroundColor: "#4fc3f7",
        },
        {
          label: "Прогноз",
          data: [
            ...Array<number | null>(historyLength - 1).fill(null),
            forecast.history[historyLength - 1] ?? forecast.currentPrice,
            forecast.forecastTomorrow,
            forecast.forecastDayAfter,
          ],
          borderColor: "#ff9800",
          backgroundColor: "rgba(255, 152, 0, 0.1)",
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
                color: "#ffffff",
                font: { size: 16, weight: "bold" },
              },
              legend: { labels: { color: "#a0aabf" } },
            },
            scales: {
              x: { ticks: { color: "#a0aabf" } },
              y: {
                beginAtZero: false,
                ticks: {
                  color: "#a0aabf",
                  callback: (value: string | number) => `${value} ₽`,
                },
              },
            },
          }}
        />
      </div>
      <button
        className={styles.actionButton}
        onClick={() => navigate(`/bonds?isin=${forecast.isin}`)}
      >
        Перейти к облигации →
      </button>
    </section>
  );
};

export default ForecastChart;
