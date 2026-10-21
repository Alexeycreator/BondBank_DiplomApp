import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ForecastsPage.module.css";
import { LineChart } from "../../charts/LineChart";
import { ForecastCard, ForecastItem } from "../../infoCards/ForecastCard";
import { SearchFilters } from "../../search/SearchFilters";

const ForecastsPage = () => {
  const navigate = useNavigate();

  const [searchType, setSearchType] = useState<string>("");
  const [searchIsin, setSearchIsin] = useState<string>("");
  const [selectedForecast, setSelectedForecast] = useState<ForecastItem | null>(
    null,
  );

  // Моковые данные (оставлены для демонстрации)
  const forecasts: ForecastItem[] = [
    {
      isin: "SI0032103580",
      name: "SIJ 4. IZDAJA",
      type: "LSE",
      currentPrice: 98.5,
      forecastTomorrow: 99.8,
      forecastDayAfter: 100.5,
      changePercent: 2.03,
      confidence: "Высокая",
      history: [96.5, 97.2, 97.8, 98.1, 98.5, 98.7, 99.0, 98.5],
    },
    {
      isin: "SI0032103598",
      name: "SIJ 5. IZDAJA",
      type: "LSE",
      currentPrice: 99.2,
      forecastTomorrow: 100.5,
      forecastDayAfter: 101.2,
      changePercent: 2.02,
      confidence: "Средняя",
      history: [97.0, 97.8, 98.2, 98.5, 99.0, 99.2, 99.5, 99.2],
    },
    {
      isin: "SI0002103529",
      name: "SDH 3. IZDAJA",
      type: "WB",
      currentPrice: 97.8,
      forecastTomorrow: 96.2,
      forecastDayAfter: 95.4,
      changePercent: -2.45,
      confidence: "Высокая",
      history: [100.5, 99.8, 99.2, 98.5, 98.0, 97.8, 97.5, 97.8],
    },
    {
      isin: "SI0032103630",
      name: "TELEKOM SLOVENIJE",
      type: "SG",
      currentPrice: 101.5,
      forecastTomorrow: 103.2,
      forecastDayAfter: 104.8,
      changePercent: 3.25,
      confidence: "Низкая",
      history: [98.5, 99.2, 99.8, 100.5, 101.0, 101.5, 101.8, 101.5],
    },
  ];

  const filteredForecasts = useMemo(() => {
    return forecasts.filter((f) => {
      const matchType =
        searchType === "" || f.type.toLowerCase() === searchType.toLowerCase();
      const matchIsin =
        searchIsin === "" ||
        f.isin.toLowerCase().includes(searchIsin.toLowerCase());
      return matchType && matchIsin;
    });
  }, [searchType, searchIsin]);

  const chartData = useMemo(() => {
    if (!selectedForecast) return { labels: [], datasets: [] };

    const history = selectedForecast.history;
    const historyLength = history.length;

    const labels = [
      ...history.map((_, i) => `День ${i + 1}`),
      "Завтра",
      "Послезавтра",
    ];

    const historyData = [...history, null, null];
    const forecastData = [
      ...Array(historyLength - 1).fill(null),
      history[historyLength - 1],
      selectedForecast.forecastTomorrow,
      selectedForecast.forecastDayAfter,
    ];

    return {
      labels,
      datasets: [
        {
          label: "История цены",
          data: historyData,
          borderColor: "#4fc3f7",
          backgroundColor: "rgba(79, 195, 247, 0.1)",
          fill: true,
          tension: 0.3,
          pointBackgroundColor: "#4fc3f7",
        },
        {
          label: "Прогноз",
          data: forecastData,
          borderColor: "#ff9800",
          backgroundColor: "rgba(255, 152, 0, 0.1)",
          borderDash: [5, 5],
          fill: true,
          tension: 0.3,
          pointBackgroundColor: "#ff9800",
        },
      ],
    };
  }, [selectedForecast]);

  return (
    <div className={styles.forecastsPage}>
      <h1 className={styles.pageTitle}>📊 Прогнозы</h1>
      <p className={styles.pageDescription}>
        Прогнозы цен облигаций на основе алгоритмов машинного обучения (SSA)
      </p>

      <SearchFilters
        searchType={searchType}
        searchIsin={searchIsin}
        onTypeChange={setSearchType}
        onIsinChange={setSearchIsin}
        onReset={() => {
          setSearchType("");
          setSearchIsin("");
        }}
        availableTypes={[
          { value: "lse", label: "LSE (Любляна)" },
          { value: "wb", label: "WB (Вена)" },
          { value: "sg", label: "SG (Швейцария)" },
          { value: "me", label: "ME (Москва)" },
        ]}
      />

      {selectedForecast && (
        <section className={styles.chartSection}>
          <div className={styles.chartContainer}>
            <LineChart
              labels={chartData.labels}
              datasets={chartData.datasets}
              options={{
                plugins: {
                  title: {
                    display: true,
                    text: `Прогноз для ${selectedForecast.name}`,
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
          <div style={{ textAlign: "center", marginTop: "16px" }}>
            <button
              onClick={() => navigate(`/bonds?isin=${selectedForecast.isin}`)}
              style={{
                background: "#4fc3f7",
                color: "#0f172a",
                border: "none",
                padding: "10px 24px",
                borderRadius: "8px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Перейти к облигации →
            </button>
          </div>
        </section>
      )}

      <div className={styles.forecastGrid}>
        {filteredForecasts.length > 0 ? (
          filteredForecasts.map((item) => (
            <ForecastCard
              key={item.isin}
              forecast={item}
              onClick={(f) => setSelectedForecast(f)} // Теперь клик просто выбирает прогноз для графика
            />
          ))
        ) : (
          <div className={styles.noData}>
            <p>Прогнозы не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForecastsPage;
