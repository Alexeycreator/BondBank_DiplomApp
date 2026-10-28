import { useMemo, useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { LineChart } from "../../../shared/ui/charts/LineChart";
import { ForecastItem } from "../model/types";
import { formatForecastDate, getForecastDates } from "../model/forecast-dates";
import { useTheme } from "../../../shared/theme/ThemeContext";
import styles from "../ForecastsPage.module.css";

interface ForecastChartProps {
  forecast: ForecastItem;
  currency: string;
  rates: Record<string, number>;
}

const getMonthKey = (dateStr: string) => dateStr.slice(0, 7);

const formatMonthLabel = (monthKey: string) => {
  const [year, month] = monthKey.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });
};

const ForecastChart = ({ forecast, currency, rates }: ForecastChartProps) => {
  const { theme } = useTheme();
  const chartTextColor = theme === "dark" ? "#ffffff" : "#172033";
  const chartMutedColor = theme === "dark" ? "#a0aabf" : "#5f6b7c";

  // ✅ Состояние для выбранного месяца
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  // При смене облигации сбрасываем на последний доступный месяц
  useEffect(() => {
    if (forecast.history.length > 0) {
      const latestDate = forecast.history.reduce(
        (max, h) => (h.date > max ? h.date : max),
        forecast.history[0].date,
      );
      setSelectedMonth(getMonthKey(latestDate));
    }
  }, [forecast]);

  // Список доступных месяцев
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    for (const h of forecast.history) months.add(getMonthKey(h.date));
    return Array.from(months).sort();
  }, [forecast.history]);

  const currentMonthIndex = availableMonths.indexOf(selectedMonth);
  const handlePrevMonth = () => {
    if (currentMonthIndex > 0)
      setSelectedMonth(availableMonths[currentMonthIndex - 1]);
  };
  const handleNextMonth = () => {
    if (currentMonthIndex < availableMonths.length - 1)
      setSelectedMonth(availableMonths[currentMonthIndex + 1]);
  };

  const chartData = useMemo(() => {
    // Конвертация истории (из валюты облигации в выбранную)
    const convertHistoryPrice = (value: number): number => {
      const fromRate = rates[forecast.currency] ?? 1;
      const toRate = rates[currency] ?? 1;
      return (value * fromRate) / toRate;
    };

    // Конвертация прогноза (из RUB в выбранную)
    const convertForecastPrice = (value: number): number => {
      const fromRate = rates["RUB"] ?? 1;
      const toRate = rates[currency] ?? 1;
      return (value * fromRate) / toRate;
    };

    // ✅ Фильтруем историю по выбранному месяцу
    const filteredHistory = forecast.history.filter(
      (point) => getMonthKey(point.date) === selectedMonth,
    );

    const forecastDates = getForecastDates(
      forecast.currentDate,
      forecast.forecast.length,
    );

    return {
      labels: [
        ...filteredHistory.map((point) => formatForecastDate(point.date)),
        ...forecastDates.map(formatForecastDate),
      ],
      datasets: [
        {
          label: "История",
          data: [
            ...filteredHistory.map((point) => convertHistoryPrice(point.price)),
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
            // Обрезаем линию прогноза до последней точки отфильтрованной истории
            ...Array(Math.max(0, filteredHistory.length - 1)).fill(null),
            ...(filteredHistory.length > 0
              ? [
                  convertHistoryPrice(
                    filteredHistory[filteredHistory.length - 1].price,
                  ),
                ]
              : []),
            ...forecast.forecast.map((value) =>
              convertForecastPrice(Number(value)),
            ),
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
  }, [forecast, currency, rates, selectedMonth]);

  return (
    <section className={styles.chartSection}>
      {/* ✅ Кнопки переключения месяцев */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <Button
          variant="outline-info"
          size="sm"
          onClick={handlePrevMonth}
          disabled={currentMonthIndex <= 0}
        >
          ◀ Предыдущий
        </Button>
        <span style={{ color: chartTextColor, fontWeight: "bold" }}>
          {formatMonthLabel(selectedMonth)}
        </span>
        <Button
          variant="outline-info"
          size="sm"
          onClick={handleNextMonth}
          disabled={
            currentMonthIndex >= availableMonths.length - 1 ||
            availableMonths.length === 0
          }
        >
          Следующий ▶
        </Button>
      </div>

      <div className={styles.chartContainer}>
        <LineChart
          labels={chartData.labels}
          datasets={chartData.datasets}
          options={{
            plugins: {
              title: {
                display: true,
                text: `Прогноз для ${forecast.name} (${currency})`,
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
                    `${Number(value).toLocaleString("ru-RU", { maximumFractionDigits: 2 })} ${currency}`,
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
