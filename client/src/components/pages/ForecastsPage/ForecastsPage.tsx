import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import styles from "./ForecastsPage.module.css";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Filler
);

/**
 * Уровень уверенности прогноза
 */
type ConfidenceLevel = "Высокая" | "Средняя" | "Низкая";

/**
 * Модель прогноза облигации
 */
interface Forecast {
    isin: string;
    name: string;
    bondType: string;
    currentPrice: number;
    forecastDay1: number;    // Прогноз на завтра
    forecastDay2: number;    // Прогноз на послезавтра
    change: string;          // Изменение в %
    confidence: ConfidenceLevel;
    history: number[];       // История цен для графика
}

/**
 * Страница прогнозов
 * Отображает прогнозы цен облигаций на 2 дня вперёд
 */
const ForecastsPage = () => {
    const navigate = useNavigate();

    // ==================== СОСТОЯНИЕ ====================
    const [searchType, setSearchType] = useState<string>("");
    const [searchIsin, setSearchIsin] = useState<string>("");
    const [selectedForecast, setSelectedForecast] = useState<Forecast | null>(null);

    // ==================== МОКОВЫЕ ДАННЫЕ ====================
    const forecasts: Forecast[] = [
        {
            isin: "SI0032103580",
            name: "SIJ 4. IZDAJA",
            bondType: "lse",
            currentPrice: 98.50,
            forecastDay1: 99.80,
            forecastDay2: 100.50,
            change: "+2.03%",
            confidence: "Высокая",
            history: [96.5, 97.2, 97.8, 98.1, 98.5, 98.7, 99.0, 98.5],
        },
        {
            isin: "SI0032103598",
            name: "SIJ 5. IZDAJA",
            bondType: "lse",
            currentPrice: 99.20,
            forecastDay1: 100.50,
            forecastDay2: 101.20,
            change: "+2.02%",
            confidence: "Средняя",
            history: [97.0, 97.8, 98.2, 98.5, 99.0, 99.2, 99.5, 99.2],
        },
        {
            isin: "SI0002103529",
            name: "SDH 3. IZDAJA",
            bondType: "wb",
            currentPrice: 97.80,
            forecastDay1: 96.20,
            forecastDay2: 95.40,
            change: "-2.45%",
            confidence: "Высокая",
            history: [100.5, 99.8, 99.2, 98.5, 98.0, 97.8, 97.5, 97.8],
        },
        {
            isin: "SI0032103630",
            name: "TELEKOM SLOVENIJE",
            bondType: "sg",
            currentPrice: 101.50,
            forecastDay1: 103.20,
            forecastDay2: 104.80,
            change: "+3.25%",
            confidence: "Низкая",
            history: [98.5, 99.2, 99.8, 100.5, 101.0, 101.5, 101.8, 101.5],
        },
        {
            isin: "SI0032104232",
            name: "TIVOLI 2. IZDAJA",
            bondType: "me",
            currentPrice: 96.30,
            forecastDay1: 97.10,
            forecastDay2: 97.80,
            change: "+1.56%",
            confidence: "Средняя",
            history: [94.2, 94.8, 95.2, 95.5, 96.0, 96.3, 96.5, 96.3],
        },
    ];

    // ==================== ФИЛЬТРАЦИЯ ====================
    const filteredForecasts = useMemo(() => {
        return forecasts.filter((f) => {
            const matchType = searchType === "" || f.bondType === searchType;
            const matchIsin = searchIsin === "" || f.isin.toLowerCase().includes(searchIsin.toLowerCase());
            return matchType && matchIsin;
        });
    }, [forecasts, searchType, searchIsin]);

    // ==================== ОБРАБОТЧИКИ ====================
    /**
     * Переход на страницу облигаций с выбранным ISIN
     */
    const handleBondClick = (isin: string) => {
        navigate(`/bonds?isin=${isin}`);
    };

    /**
     * Форматирует цену
     */
    const formatPrice = (price: number): string => {
        return price.toFixed(2);
    };

    /**
     * Определяет цвет для уровня уверенности
     */
    const getConfidenceColor = (confidence: ConfidenceLevel): string => {
        switch (confidence) {
            case "Высокая":
                return styles.confidenceHigh;
            case "Средняя":
                return styles.confidenceMedium;
            case "Низкая":
                return styles.confidenceLow;
            default:
                return "";
        }
    };

    // ==================== ДАННЫЕ ДЛЯ ГРАФИКА ====================
    /**
     * График прогноза для выбранной облигации
     * Включает историю + 2 прогнозных дня
     */
    const forecastChartData = useMemo(() => {
        if (!selectedForecast) return { labels: [], datasets: [] };

        const historyLength = selectedForecast.history.length;
        const labels = [
            ...selectedForecast.history.map((_, i) => `День ${i + 1}`),
            "Завтра",
            "Послезавтра",
        ];

        const historyData = [...selectedForecast.history, null, null];
        const forecastData = [
            ...Array(historyLength - 1).fill(null),
            selectedForecast.history[historyLength - 1],
            selectedForecast.forecastDay1,
            selectedForecast.forecastDay2,
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

    const forecastChartOptions = {
        responsive: true,
        plugins: {
            legend: { display: true, position: "top" as const },
            title: {
                display: true,
                text: selectedForecast
                    ? `Прогноз для ${selectedForecast.name}`
                    : "Выберите облигацию",
                font: { size: 14 },
            },
        },
        scales: {
            y: {
                beginAtZero: false,
                ticks: {
                    callback: function (value: string | number) {
                        return `${value} ₽`;
                    },
                },
            },
        },
    };

    // ==================== РЕНДЕР ====================
    return (
        <div className={styles.forecastsPage}>
            <h1 className={styles.pageTitle}>📊 Прогнозы</h1>
            <p className={styles.pageDescription}>
                Прогнозы цен облигаций на основе алгоритмов машинного обучения (SSA)
            </p>

            {/* ==================== ПОИСК ==================== */}
            <section className={styles.searchSection}>
                <div className={styles.searchField}>
                    <label htmlFor="searchType">Тип облигации:</label>
                    <select
                        id="searchType"
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                        className={styles.searchSelect}
                    >
                        <option value="">Все типы</option>
                        <option value="lse">LSE (Любляна)</option>
                        <option value="wb">WB (Вена)</option>
                        <option value="sg">SG (Швейцария)</option>
                        <option value="me">ME (Москва)</option>
                    </select>
                </div>

                <div className={styles.searchField}>
                    <label htmlFor="searchIsin">ISIN:</label>
                    <input
                        id="searchIsin"
                        type="text"
                        value={searchIsin}
                        onChange={(e) => setSearchIsin(e.target.value)}
                        placeholder="Введите ISIN..."
                        className={styles.searchInput}
                    />
                </div>

                <button
                    className={styles.resetButton}
                    onClick={() => {
                        setSearchType("");
                        setSearchIsin("");
                    }}
                >
                    Сбросить
                </button>
            </section>

            {/* ==================== ГРАФИК ПРОГНОЗА ==================== */}
            {selectedForecast && (
                <section className={styles.chartSection}>
                    <div className={styles.chartContainer}>
                        <Line data={forecastChartData} options={forecastChartOptions} />
                    </div>
                </section>
            )}

            {/* ==================== СПИСОК ПРОГНОЗОВ ==================== */}
            <div className={styles.forecastGrid}>
                {filteredForecasts.length > 0 ? (
                    filteredForecasts.map((item) => (
                        <div
                            key={item.isin}
                            className={`${styles.forecastCard} ${selectedForecast?.isin === item.isin ? styles.selectedCard : ""}`}
                            onClick={() => setSelectedForecast(item)}
                        >
                            <div className={styles.forecastHeader}>
                                <span className={styles.forecastIsin}>{item.isin}</span>
                                <span
                                    className={`${styles.forecastChange} ${
                                        item.change.startsWith("+") ? styles.positive : styles.negative
                                    }`}
                                >
                                    {item.change}
                                </span>
                            </div>
                            <h3 className={styles.forecastName}>{item.name}</h3>
                            <span className={styles.bondType}>
                                {item.bondType.toUpperCase()}
                            </span>

                            {/* Цены: текущая, завтра, послезавтра */}
                            <div className={styles.forecastPrices}>
                                <div className={styles.priceBlock}>
                                    <span className={styles.priceLabel}>Текущая</span>
                                    <span className={styles.currentPrice}>
                                        {formatPrice(item.currentPrice)} ₽
                                    </span>
                                </div>
                                <div className={styles.priceBlock}>
                                    <span className={styles.priceLabel}>Завтра</span>
                                    <span className={styles.forecastPrice}>
                                        {formatPrice(item.forecastDay1)} ₽
                                    </span>
                                </div>
                                <div className={styles.priceBlock}>
                                    <span className={styles.priceLabel}>Послезавтра</span>
                                    <span className={styles.forecastPrice}>
                                        {formatPrice(item.forecastDay2)} ₽
                                    </span>
                                </div>
                            </div>

                            <div className={styles.forecastConfidence}>
                                Уверенность:{" "}
                                <span className={getConfidenceColor(item.confidence)}>
                                    {item.confidence}
                                </span>
                            </div>

                            {/* Кнопка перехода на страницу облигаций */}
                            <button
                                className={styles.detailsButton}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleBondClick(item.isin);
                                }}
                            >
                                Подробнее об облигации →
                            </button>
                        </div>
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