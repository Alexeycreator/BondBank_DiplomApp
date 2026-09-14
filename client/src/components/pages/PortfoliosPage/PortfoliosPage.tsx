import React, { useState, useMemo } from "react";
import { Doughnut, Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
} from "chart.js";
import styles from "./PortfoliosPage.module.css";

ChartJS.register(
    ArcElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend
);

/**
 * Тип портфеля
 */
type PortfolioType = "conservative" | "aggressive" | "balanced";

/**
 * Модель портфеля
 */
interface Portfolio {
    id: number;
    name: string;
    type: PortfolioType;
    currentValue: number;
    currentYield: number;
}

/**
 * Модель облигации в портфеле
 */
interface PortfolioBond {
    name: string;
    isin: string;
    bondType: string;
    quantity: number;
    price: number;
    total: number;
    yield: number;
}

/**
 * Историческая запись стоимости портфеля
 */
interface PortfolioHistory {
    date: string;       // YYYY-MM-DD
    totalValue: number;
    yield: number;
}

/**
 * Ограничения по типам портфелей
 */
const PORTFOLIO_LIMITS: Record<PortfolioType, { maxBonds: number; maxYield: number; description: string }> = {
    conservative: { maxBonds: 200, maxYield: 5, description: "Низкий риск, стабильный доход" },
    aggressive: { maxBonds: 300, maxYield: 15, description: "Высокий риск, высокая доходность" },
    balanced: { maxBonds: 500, maxYield: 10, description: "Средний риск и доходность" },
};

/**
 * Страница портфелей с возможностью просмотра исторических данных
 * и переключения состава портфеля по датам
 */
const PortfoliosPage = () => {
    // ==================== СОСТОЯНИЕ ====================
    const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);

    // ==================== МОКОВЫЕ ДАННЫЕ ====================
    const portfolios: Portfolio[] = [
        { id: 1, name: "Консервативный", type: "conservative", currentValue: 1450000, currentYield: 4.2 },
        { id: 2, name: "Агрессивный", type: "aggressive", currentValue: 2350000, currentYield: 7.8 },
        { id: 3, name: "Сбалансированный", type: "balanced", currentValue: 3200000, currentYield: 5.6 },
    ];

    /**
     * Состав портфеля на текущую дату
     */
    const currentPortfolioBonds: Record<number, PortfolioBond[]> = {
        1: [
            { name: "SIJ 4. IZDAJA", isin: "SI0032103580", bondType: "lse", quantity: 50, price: 98.50, total: 4925, yield: 4.2 },
            { name: "SDH 3. IZDAJA", isin: "SI0002103529", bondType: "wb", quantity: 30, price: 97.80, total: 2934, yield: 5.1 },
            { name: "TIVOLI 2. IZDAJA", isin: "SI0032104232", bondType: "sg", quantity: 20, price: 96.30, total: 1926, yield: 4.9 },
            { name: "SIJ 5. IZDAJA", isin: "SI0032103598", bondType: "lse", quantity: 40, price: 99.20, total: 3968, yield: 3.8 },
        ],
        2: [
            { name: "TELEKOM SLOVENIJE", isin: "SI0032103630", bondType: "sg", quantity: 100, price: 101.50, total: 10150, yield: 3.2 },
            { name: "SIJ 4. IZDAJA", isin: "SI0032103580", bondType: "lse", quantity: 80, price: 98.50, total: 7880, yield: 4.2 },
        ],
        3: [
            { name: "SIJ 4. IZDAJA", isin: "SI0032103580", bondType: "lse", quantity: 60, price: 98.50, total: 5910, yield: 4.2 },
            { name: "SDH 3. IZDAJA", isin: "SI0002103529", bondType: "wb", quantity: 45, price: 97.80, total: 4401, yield: 5.1 },
            { name: "TIVOLI 2. IZDAJA", isin: "SI0032104232", bondType: "me", quantity: 35, price: 96.30, total: 3370.5, yield: 4.9 },
            { name: "TELEKOM SLOVENIJE", isin: "SI0032103630", bondType: "sg", quantity: 25, price: 101.50, total: 2537.5, yield: 3.2 },
        ],
    };

    /**
     * Состав портфеля на исторические даты.
     * Ключ — дата (YYYY-MM-DD), значение — массив облигаций.
     * Если для даты нет записи, показываем текущий состав.
     */
    const historicalPortfolioBonds: Record<string, Record<number, PortfolioBond[]>> = useMemo(() => {
        const today = new Date();
        const history: Record<string, Record<number, PortfolioBond[]>> = {};

        // Генерируем исторические составы за последние 30 дней
        for (let i = 1; i <= 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split("T")[0];

            history[dateStr] = {
                1: [
                    { name: "SIJ 4. IZDAJA", isin: "SI0032103580", bondType: "lse", quantity: 40 + i, price: 95 + (i % 5), total: 4925, yield: 4.2 },
                    { name: "SDH 3. IZDAJA", isin: "SI0002103529", bondType: "wb", quantity: 25 + i, price: 94 + (i % 4), total: 2934, yield: 5.1 },
                    { name: "TIVOLI 2. IZDAJA", isin: "SI0032104232", bondType: "sg", quantity: 15 + i, price: 92 + (i % 3), total: 1926, yield: 4.9 },
                ],
                2: [
                    { name: "TELEKOM SLOVENIJE", isin: "SI0032103630", bondType: "sg", quantity: 80 + i, price: 99 + (i % 5), total: 10150, yield: 3.2 },
                    { name: "SIJ 4. IZDAJA", isin: "SI0032103580", bondType: "lse", quantity: 60 + i, price: 95 + (i % 4), total: 7880, yield: 4.2 },
                ],
                3: [
                    { name: "SIJ 4. IZDAJA", isin: "SI0032103580", bondType: "lse", quantity: 50 + i, price: 95 + (i % 5), total: 5910, yield: 4.2 },
                    { name: "SDH 3. IZDAJA", isin: "SI0002103529", bondType: "wb", quantity: 35 + i, price: 94 + (i % 4), total: 4401, yield: 5.1 },
                    { name: "TIVOLI 2. IZDAJA", isin: "SI0032104232", bondType: "me", quantity: 25 + i, price: 92 + (i % 3), total: 3370.5, yield: 4.9 },
                ],
            };
        }

        return history;
    }, []);

    /**
     * История стоимости портфелей (за последние 30 дней)
     */
    const portfolioHistory: Record<number, PortfolioHistory[]> = useMemo(() => {
        const history: Record<number, PortfolioHistory[]> = { 1: [], 2: [], 3: [] };
        const today = new Date();

        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split("T")[0];

            history[1].push({
                date: dateStr,
                totalValue: 1450000 + Math.round((Math.random() - 0.5) * 100000),
                yield: 4.2 + (Math.random() - 0.5) * 0.5,
            });
            history[2].push({
                date: dateStr,
                totalValue: 2350000 + Math.round((Math.random() - 0.5) * 200000),
                yield: 7.8 + (Math.random() - 0.5) * 1.0,
            });
            history[3].push({
                date: dateStr,
                totalValue: 3200000 + Math.round((Math.random() - 0.5) * 300000),
                yield: 5.6 + (Math.random() - 0.5) * 0.8,
            });
        }

        return history;
    }, []);

    // ==================== ВЫЧИСЛЕНИЯ ====================
    const today = new Date().toISOString().split("T")[0];
    const isHistoricalView = selectedDate !== today;

    /**
     * Получает облигации портфеля на выбранную дату
     */
    const getSelectedBonds = (): PortfolioBond[] => {
        if (!selectedPortfolio) return [];

        if (isHistoricalView) {
            const historical = historicalPortfolioBonds[selectedDate];
            if (historical && historical[selectedPortfolio.id]) {
                return historical[selectedPortfolio.id];
            }
        }

        return currentPortfolioBonds[selectedPortfolio.id] || [];
    };

    /**
     * Считает общее количество штук облигаций
     */
    const getTotalQuantity = (portfolioId: number): number => {
        const bonds = isHistoricalView
            ? historicalPortfolioBonds[selectedDate]?.[portfolioId] || []
            : currentPortfolioBonds[portfolioId] || [];

        return bonds.reduce((sum, bond) => sum + bond.quantity, 0);
    };

    /**
     * Считает количество видов облигаций
     */
    const getBondsCount = (portfolioId: number): number => {
        const bonds = isHistoricalView
            ? historicalPortfolioBonds[selectedDate]?.[portfolioId] || []
            : currentPortfolioBonds[portfolioId] || [];

        return bonds.length;
    };

    /**
     * Получает стоимость портфеля на выбранную дату
     */
    const getPortfolioValue = (portfolio: Portfolio): { value: number; yield: number; isHistorical: boolean } => {
        if (!isHistoricalView) {
            return { value: portfolio.currentValue, yield: portfolio.currentYield, isHistorical: false };
        }

        const history = portfolioHistory[portfolio.id] || [];
        const historical = history.find((h) => h.date === selectedDate);

        if (historical) {
            return { value: historical.totalValue, yield: historical.yield, isHistorical: true };
        }

        return { value: 0, yield: 0, isHistorical: true };
    };

    /**
     * Считает распределение по типам облигаций
     */
    const getTypeDistribution = () => {
        const bonds = getSelectedBonds();
        const distribution: Record<string, number> = {};

        bonds.forEach((bond) => {
            distribution[bond.bondType] = (distribution[bond.bondType] || 0) + bond.quantity;
        });

        return distribution;
    };

    /**
     * Форматирует цену
     */
    const formatPrice = (price: number): string => {
        return `${price.toLocaleString("ru-RU")} ₽`;
    };

    /**
     * Форматирует дату
     */
    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("ru-RU", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    /**
     * Обработчик клика по точке на графике
     * Переключает дату на выбранную точку
     */
    const handleChartClick = (_event: any, elements: any[]) => {
        if (elements.length > 0 && selectedPortfolio) {
            const index = elements[0].index;
            const history = portfolioHistory[selectedPortfolio.id] || [];
            if (history[index]) {
                setSelectedDate(history[index].date);
            }
        }
    };

    /**
     * Сбрасывает дату на сегодня
     */
    const handleResetToToday = () => {
        setSelectedDate(today);
    };

    // ==================== ГРАФИКИ ====================
    const doughnutData = {
        labels: Object.keys(getTypeDistribution()).map((t) => t.toUpperCase()),
        datasets: [
            {
                label: "Количество облигаций",
                data: Object.values(getTypeDistribution()),
                backgroundColor: [
                    "rgba(79, 195, 247, 0.8)",
                    "rgba(255, 159, 64, 0.8)",
                    "rgba(75, 192, 192, 0.8)",
                    "rgba(255, 99, 132, 0.8)",
                ],
                borderColor: [
                    "rgba(79, 195, 247, 1)",
                    "rgba(255, 159, 64, 1)",
                    "rgba(75, 192, 192, 1)",
                    "rgba(255, 99, 132, 1)",
                ],
                borderWidth: 2,
            },
        ],
    };

    const doughnutOptions = {
        responsive: true,
        plugins: {
            legend: { position: "bottom" as const },
            title: {
                display: true,
                text: "Распределение по типам облигаций",
                font: { size: 14 },
            },
        },
    };

    /**
     * График стоимости портфеля с возможностью клика по точке
     */
    const valueChartData = useMemo(() => {
        if (!selectedPortfolio) return { labels: [], datasets: [] };

        const history = portfolioHistory[selectedPortfolio.id] || [];
        const isHistorical = isHistoricalView;

        return {
            labels: history.map((h) => {
                const date = new Date(h.date);
                return `${date.getDate()}.${date.getMonth() + 1}`;
            }),
            datasets: [
                {
                    label: "Стоимость портфеля (₽)",
                    data: history.map((h) => h.totalValue),
                    borderColor: isHistorical ? "#ff9800" : "#2ecc71",
                    backgroundColor: isHistorical
                        ? "rgba(255, 152, 0, 0.1)"
                        : "rgba(46, 204, 113, 0.1)",
                    fill: true,
                    tension: 0.3,
                    pointBackgroundColor: history.map((h) =>
                        h.date === selectedDate ? "#e74c3c" : isHistorical ? "#ff9800" : "#2ecc71"
                    ),
                    pointRadius: history.map((h) => (h.date === selectedDate ? 8 : 4)),
                    pointHoverRadius: 10,
                },
            ],
        };
    }, [selectedPortfolio, portfolioHistory, selectedDate, isHistoricalView]);

    const valueChartOptions = {
        responsive: true,
        onClick: handleChartClick,
        plugins: {
            legend: { display: true, position: "top" as const },
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        return `Стоимость: ${Number(context.raw).toLocaleString("ru-RU")} ₽`;
                    },
                    afterLabel: () => {
                        return "Нажмите, чтобы переключиться на эту дату";
                    },
                },
            },
        },
        scales: {
            y: {
                ticks: {
                    callback: function (value: string | number) {
                        return `${Number(value).toLocaleString("ru-RU")} ₽`;
                    },
                },
            },
        },
    };

    /**
     * График доходности
     */
    const yieldChartData = useMemo(() => {
        if (!selectedPortfolio) return { labels: [], datasets: [] };

        const history = portfolioHistory[selectedPortfolio.id] || [];
        return {
            labels: history.map((h) => {
                const date = new Date(h.date);
                return `${date.getDate()}.${date.getMonth() + 1}`;
            }),
            datasets: [
                {
                    label: "Доходность портфеля (%)",
                    data: history.map((h) => Number(h.yield.toFixed(2))),
                    borderColor: "#4fc3f7",
                    backgroundColor: "rgba(79, 195, 247, 0.1)",
                    fill: true,
                    tension: 0.3,
                },
            ],
        };
    }, [selectedPortfolio, portfolioHistory]);

    const yieldChartOptions = {
        responsive: true,
        plugins: {
            legend: { display: true, position: "top" as const },
        },
        scales: {
            y: {
                beginAtZero: false,
                ticks: {
                    callback: function (value: string | number) {
                        return `${value}%`;
                    },
                },
            },
        },
    };

    // ==================== РЕНДЕР ====================
    return (
        <div className={styles.portfoliosPage}>
            <h1 className={styles.pageTitle}>🏦 Портфели</h1>
            <p className={styles.pageDescription}>
                Управляйте своими инвестиционными портфелями
            </p>

            {/* ==================== ВЫБОР ДАТЫ ==================== */}
            <section className={styles.dateSection}>
                <label htmlFor="datePicker" className={styles.dateLabel}>
                    📅 Просмотр на дату:
                </label>
                <input
                    id="datePicker"
                    type="date"
                    value={selectedDate}
                    max={today}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className={styles.dateInput}
                />
                {isHistoricalView && (
                    <>
                        <span className={styles.historicalBadge}>
                            Исторические данные: {formatDate(selectedDate)}
                        </span>
                        <button
                            className={styles.resetDateButton}
                            onClick={handleResetToToday}
                        >
                            🔄 Вернуться на сегодня
                        </button>
                    </>
                )}
            </section>

            {/* ==================== СПИСОК ПОРТФЕЛЕЙ ==================== */}
            <section className={styles.portfoliosSection}>
                <h2 className={styles.sectionTitle}>Мои портфели</h2>
                <div className={styles.portfolioGrid}>
                    {portfolios.map((portfolio) => {
                        const limits = PORTFOLIO_LIMITS[portfolio.type];
                        const totalQuantity = getTotalQuantity(portfolio.id);
                        const { value, yield: portfolioYield, isHistorical } = getPortfolioValue(portfolio);

                        return (
                            <div key={portfolio.id} className={styles.portfolioCard}>
                                <h3 className={styles.portfolioName}>{portfolio.name}</h3>
                                <span className={styles.portfolioType}>
                                    {limits.description}
                                </span>
                                <div className={styles.portfolioStats}>
                                    <div>
                                        <span className={styles.statLabel}>
                                            {isHistorical ? "Стоимость на дату" : "Стоимость"}
                                        </span>
                                        <span className={styles.statValue}>{formatPrice(value)}</span>
                                    </div>
                                    <div>
                                        <span className={styles.statLabel}>Облигаций</span>
                                        <span className={styles.statValue}>
                                            {totalQuantity}/{limits.maxBonds}
                                        </span>
                                    </div>
                                    <div>
                                        <span className={styles.statLabel}>
                                            {isHistorical ? "Доходность на дату" : "Доходность"}
                                        </span>
                                        <span className={styles.statValue}>
                                            {portfolioYield.toFixed(2)}%
                                        </span>
                                    </div>
                                </div>
                                <div className={styles.progressBar}>
                                    <div
                                        className={styles.progressFill}
                                        style={{
                                            width: `${Math.min((totalQuantity / limits.maxBonds) * 100, 100)}%`,
                                        }}
                                    />
                                </div>
                                <button
                                    className={styles.viewButton}
                                    onClick={() => setSelectedPortfolio(portfolio)}
                                >
                                    Подробнее
                                </button>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ==================== ДЕТАЛИ ПОРТФЕЛЯ ==================== */}
            {selectedPortfolio && (
                <section className={styles.detailsSection}>
                    <div className={styles.detailsHeader}>
                        <h2 className={styles.sectionTitle}>
                            Портфель: {selectedPortfolio.name}
                            {isHistoricalView && (
                                <span className={styles.historicalDate}>
                                    {" "}— на {formatDate(selectedDate)}
                                </span>
                            )}
                        </h2>
                        <div className={styles.detailsActions}>
                            {isHistoricalView && (
                                <button
                                    className={styles.todayButton}
                                    onClick={handleResetToToday}
                                >
                                    🔄 Вернуться на сегодня
                                </button>
                            )}
                            <button
                                className={styles.closeButton}
                                onClick={() => setSelectedPortfolio(null)}
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Ключевые показатели */}
                    <div className={styles.keyStats}>
                        <div className={styles.keyStatCard}>
                            <span className={styles.keyStatLabel}>
                                {isHistoricalView ? "Цена на дату" : "Цена сегодня"}
                            </span>
                            <span className={styles.keyStatValue}>
                                {formatPrice(getPortfolioValue(selectedPortfolio).value)}
                            </span>
                        </div>
                        <div className={styles.keyStatCard}>
                            <span className={styles.keyStatLabel}>
                                {isHistoricalView ? "Доходность на дату" : "Доходность сегодня"}
                            </span>
                            <span className={styles.keyStatValue}>
                                {getPortfolioValue(selectedPortfolio).yield.toFixed(2)}%
                            </span>
                        </div>
                        <div className={styles.keyStatCard}>
                            <span className={styles.keyStatLabel}>Всего штук</span>
                            <span className={styles.keyStatValue}>
                                {getTotalQuantity(selectedPortfolio.id)}
                            </span>
                        </div>
                        <div className={styles.keyStatCard}>
                            <span className={styles.keyStatLabel}>Видов облигаций</span>
                            <span className={styles.keyStatValue}>
                                {getBondsCount(selectedPortfolio.id)}
                            </span>
                        </div>
                    </div>

                    {/* Лимиты портфеля */}
                    <div className={styles.limitsInfo}>
                        <p>
                            <strong>Лимит портфеля:</strong>{" "}
                            {getTotalQuantity(selectedPortfolio.id)} /{" "}
                            {PORTFOLIO_LIMITS[selectedPortfolio.type].maxBonds} шт.
                            {" "}(можно добавить{" "}
                            {PORTFOLIO_LIMITS[selectedPortfolio.type].maxBonds - getTotalQuantity(selectedPortfolio.id)} шт.)
                        </p>
                        <p>
                            <strong>Максимальная доходность:</strong>{" "}
                            {PORTFOLIO_LIMITS[selectedPortfolio.type].maxYield}%
                        </p>
                    </div>

                    {/* График стоимости с кликабельными точками */}
                    <div className={styles.fullWidthChart}>
                        <p className={styles.chartHint}>
                            💡 Нажмите на точку на графике, чтобы посмотреть состав портфеля на ту дату
                        </p>
                        <Line data={valueChartData} options={valueChartOptions} />
                    </div>

                    {/* Графики */}
                    <div className={styles.chartsRow}>
                        <div className={styles.chartCard}>
                            <Doughnut data={doughnutData} options={doughnutOptions} />
                        </div>
                        <div className={styles.chartCard}>
                            <Line data={yieldChartData} options={yieldChartOptions} />
                        </div>
                    </div>

                    {/* Таблица облигаций */}
                    <h3 className={styles.subsectionTitle}>
                        Облигации в портфеле
                        {isHistoricalView && (
                            <span className={styles.historicalDate}>
                                {" "}(на {formatDate(selectedDate)})
                            </span>
                        )}
                    </h3>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Название</th>
                                    <th>ISIN</th>
                                    <th>Тип</th>
                                    <th>Количество</th>
                                    <th>Цена</th>
                                    <th>Доходность</th>
                                    <th>Итого</th>
                                </tr>
                            </thead>
                            <tbody>
                                {getSelectedBonds().map((bond, index) => (
                                    <tr key={index}>
                                        <td>{bond.name}</td>
                                        <td className={styles.isin}>{bond.isin}</td>
                                        <td>
                                            <span className={styles.typeBadge}>
                                                {bond.bondType.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>{bond.quantity}</td>
                                        <td>{bond.price}</td>
                                        <td className={styles.yieldCell}>{bond.yield}%</td>
                                        <td>{bond.total.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </div>
    );
};

export default PortfoliosPage;