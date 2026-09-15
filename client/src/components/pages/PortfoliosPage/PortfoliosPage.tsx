import React, { useState, useMemo, useEffect } from "react";
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
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Portfolio, PortfolioType } from "../../types";
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
    date: string;
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
 * Страница портфелей с возможностью создания нового портфеля
 * Поддерживает userId и portfolioId в URL
 */
const PortfoliosPage = () => {
    const { hasCompleteProfile, user, isAdmin } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // ==================== URL ПАРАМЕТРЫ ====================
    const urlParams = useMemo(() => {
        const params = new URLSearchParams(location.search);
        const userIdParam = params.get("userId");
        const portfolioIdParam = params.get("portfolioId");
        return {
            userId: userIdParam ? Number(userIdParam) : null,
            portfolioId: portfolioIdParam ? Number(portfolioIdParam) : null,
        };
    }, [location.search]);

    // ==================== СОСТОЯНИЕ ====================
    const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
    const [searchIsin, setSearchIsin] = useState<string>("");
    const [filterBondType, setFilterBondType] = useState<string>("");

    const [portfolios, setPortfolios] = useState<Portfolio[]>([
        { id: 1, userId: 1, name: "Консервативный", description: "Основной портфель для долгосрочных инвестиций", type: "conservative", currentValue: 1450000, currentYield: 4.2, createdAt: "2026-01-15" },
        { id: 2, userId: 1, name: "Агрессивный", description: "Для высокодоходных облигаций", type: "aggressive", currentValue: 2350000, currentYield: 7.8, createdAt: "2026-03-20" },
        { id: 3, userId: 1, name: "Сбалансированный", type: "balanced", currentValue: 3200000, currentYield: 5.6, createdAt: "2026-05-10" },
        { id: 4, userId: 2, name: "Портфель Петрова", description: "Личный портфель", type: "balanced", currentValue: 850000, currentYield: 5.0, createdAt: "2026-06-01" },
    ]);

    // ✅ Состояние модального окна создания
    const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
    const [newPortfolio, setNewPortfolio] = useState({
        name: "",
        description: "",
        type: "conservative" as PortfolioType,
    });
    const [createError, setCreateError] = useState<string>("");

    // ==================== СИНХРОНИЗАЦИЯ userId С URL ====================
    useEffect(() => {
        // Если userId не указан — подставляем текущего пользователя
        if (!urlParams.userId && user) {
            navigate(`/portfolios?userId=${user.id}`, { replace: true });
            return;
        }

        // Если userId указан, но не совпадает с текущим (и это не админ) — редирект на свой
        if (urlParams.userId && user && urlParams.userId !== user.id && !isAdmin) {
            navigate(`/portfolios?userId=${user.id}`, { replace: true });
        }
    }, [urlParams.userId, user, isAdmin, navigate]);

    // ==================== ПОРТФЕЛИ ПОЛЬЗОВАТЕЛЯ ====================
    const userPortfolios = useMemo(() => {
        if (!urlParams.userId) return [];
        return portfolios.filter((p) => p.userId === urlParams.userId);
    }, [portfolios, urlParams.userId]);

    // ==================== АВТОВЫБОР ПОРТФЕЛЯ ИЗ URL ====================
    useEffect(() => {
        if (!urlParams.portfolioId) {
            setSelectedPortfolio(null);
            return;
        }

        const found = portfolios.find(
            (p) => p.id === urlParams.portfolioId && p.userId === urlParams.userId
        );

        if (found) {
            setSelectedPortfolio(found);
        } else {
            // Портфель не найден — сбрасываем URL
            setSelectedPortfolio(null);
            navigate(
                `/portfolios?userId=${urlParams.userId || user?.id}`,
                { replace: true }
            );
        }
    }, [urlParams.portfolioId, urlParams.userId, portfolios, navigate, user]);

    // ==================== МОКОВЫЕ ДАННЫЕ ОБЛИГАЦИЙ ====================
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
        4: [
            { name: "SIJ 4. IZDAJA", isin: "SI0032103580", bondType: "lse", quantity: 20, price: 98.50, total: 1970, yield: 4.2 },
        ],
    };

    const historicalPortfolioBonds: Record<string, Record<number, PortfolioBond[]>> = useMemo(() => {
        const today = new Date();
        const history: Record<string, Record<number, PortfolioBond[]>> = {};

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
                4: [
                    { name: "SIJ 4. IZDAJA", isin: "SI0032103580", bondType: "lse", quantity: 10 + i, price: 95 + (i % 5), total: 1970, yield: 4.2 },
                ],
            };
        }

        return history;
    }, []);

    const portfolioHistory: Record<number, PortfolioHistory[]> = useMemo(() => {
        const history: Record<number, PortfolioHistory[]> = { 1: [], 2: [], 3: [], 4: [] };
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
            history[4].push({
                date: dateStr,
                totalValue: 850000 + Math.round((Math.random() - 0.5) * 50000),
                yield: 5.0 + (Math.random() - 0.5) * 0.5,
            });
        }

        return history;
    }, []);

    // ==================== ВЫЧИСЛЕНИЯ ====================
    const today = new Date().toISOString().split("T")[0];
    const isHistoricalView = selectedDate !== today;

    /**
     * Получает облигации выбранного портфеля
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
     * Общее количество штук облигаций
     */
    const getTotalQuantity = (portfolioId: number): number => {
        const bonds = isHistoricalView
            ? historicalPortfolioBonds[selectedDate]?.[portfolioId] || []
            : currentPortfolioBonds[portfolioId] || [];

        return bonds.reduce((sum, bond) => sum + bond.quantity, 0);
    };

    /**
     * Количество видов облигаций
     */
    const getBondsCount = (portfolioId: number): number => {
        const bonds = isHistoricalView
            ? historicalPortfolioBonds[selectedDate]?.[portfolioId] || []
            : currentPortfolioBonds[portfolioId] || [];

        return bonds.length;
    };

    /**
     * Стоимость портфеля на выбранную дату
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
     * Распределение по типам облигаций
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
     * Форматирование цены
     */
    const formatPrice = (price: number): string => {
        return `${price.toLocaleString("ru-RU")} ₽`;
    };

    /**
     * Форматирование даты
     */
    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("ru-RU", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    // ==================== ФИЛЬТРАЦИЯ ОБЛИГАЦИЙ ====================
    const filteredBonds = useMemo(() => {
        const bonds = getSelectedBonds();
        return bonds.filter((bond) => {
            const matchIsin = searchIsin === "" || bond.isin.toLowerCase().includes(searchIsin.toLowerCase());
            const matchType = filterBondType === "" || bond.bondType === filterBondType;
            return matchIsin && matchType;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedPortfolio, selectedDate, searchIsin, filterBondType]);

    // ==================== СОЗДАНИЕ ПОРТФЕЛЯ ====================
    const handleOpenCreateModal = () => {
        setNewPortfolio({
            name: "",
            description: "",
            type: "conservative",
        });
        setCreateError("");
        setShowCreateModal(true);
    };

    const handleCreatePortfolio = () => {
        setCreateError("");

        if (!newPortfolio.name.trim()) {
            setCreateError("Введите название портфеля");
            return;
        }

        if (newPortfolio.name.trim().length < 3) {
            setCreateError("Название должно содержать минимум 3 символа");
            return;
        }

        if (newPortfolio.name.trim().length > 50) {
            setCreateError("Название не должно превышать 50 символов");
            return;
        }

        const exists = userPortfolios.find(
            (p) => p.name.toLowerCase() === newPortfolio.name.trim().toLowerCase()
        );
        if (exists) {
            setCreateError("Портфель с таким названием уже существует");
            return;
        }

        const newId = Math.max(...portfolios.map((p) => p.id), 0) + 1;
        const portfolioToAdd: Portfolio = {
            id: newId,
            userId: user?.id || 0,
            name: newPortfolio.name.trim(),
            description: newPortfolio.description.trim() || undefined,
            type: newPortfolio.type,
            currentValue: 0,
            currentYield: 0,
            createdAt: new Date().toISOString().split("T")[0],
        };

        setPortfolios([...portfolios, portfolioToAdd]);
        setShowCreateModal(false);

        // ✅ Открываем созданный портфель с URL
        navigate(
            `/portfolios?userId=${portfolioToAdd.userId}&portfolioId=${portfolioToAdd.id}`,
            { replace: true }
        );
    };

    // ==================== ОБРАБОТЧИКИ ====================
    /**
     * Открыть портфель (обновляет URL)
     */
    const handleOpenPortfolio = (portfolio: Portfolio) => {
        setSelectedPortfolio(portfolio);
        navigate(
            `/portfolios?userId=${portfolio.userId}&portfolioId=${portfolio.id}`,
            { replace: true }
        );
    };

    /**
     * Закрыть портфель (убирает portfolioId из URL)
     */
    const handleClosePortfolio = () => {
        setSelectedPortfolio(null);
        navigate(
            `/portfolios?userId=${urlParams.userId || user?.id}`,
            { replace: true }
        );
    };

    /**
     * Переход на страницу облигации по ISIN
     */
    const handleBondClick = (isin: string) => {
        navigate(`/bonds?isin=${isin}`);
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
        onClick: (_event: any, elements: any[]) => {
            if (elements.length > 0 && selectedPortfolio) {
                const index = elements[0].index;
                const history = portfolioHistory[selectedPortfolio.id] || [];
                if (history[index]) {
                    setSelectedDate(history[index].date);
                }
            }
        },
        plugins: {
            legend: { display: true, position: "top" as const },
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        return `Стоимость: ${Number(context.raw).toLocaleString("ru-RU")} ₽`;
                    },
                    afterLabel: () => "Нажмите, чтобы переключиться на эту дату",
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

    // ==================== ПРОВЕРКА ПРОФИЛЯ ====================
    if (!hasCompleteProfile) {
        return (
            <div className={styles.warningPage}>
                <div className={styles.warningCard}>
                    <div className={styles.warningIcon}>⚠️</div>
                    <h1 className={styles.warningTitle}>Профиль не заполнен</h1>
                    <p className={styles.warningText}>
                        Чтобы создавать портфели, необходимо заполнить паспортные данные, ИНН и СНИЛС.
                    </p>
                    <button
                        className={styles.warningButton}
                        onClick={() => navigate("/profile")}
                    >
                        Перейти в профиль
                    </button>
                </div>
            </div>
        );
    }

    // ==================== РЕНДЕР ====================
    return (
        <div className={styles.portfoliosPage}>
            {/* ==================== ЗАГОЛОВОК + КНОПКА СОЗДАНИЯ ==================== */}
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>🏦 Портфели</h1>
                    <p className={styles.pageDescription}>
                        Управляйте своими инвестиционными портфелями
                    </p>
                    {/* ✅ Показываем, чьи портфели смотрим */}
                    {isAdmin && urlParams.userId && urlParams.userId !== user?.id && (
                        <p className={styles.ownerInfo}>
                            👑 Просмотр портфелей пользователя #{urlParams.userId}
                        </p>
                    )}
                </div>
                <button
                    className={styles.createPortfolioButton}
                    onClick={handleOpenCreateModal}
                >
                    + Создать портфель
                </button>
            </div>

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
                            onClick={() => setSelectedDate(today)}
                        >
                            🔄 Вернуться на сегодня
                        </button>
                    </>
                )}
            </section>

            {/* ==================== СПИСОК ПОРТФЕЛЕЙ ==================== */}
            <section className={styles.portfoliosSection}>
                <h2 className={styles.sectionTitle}>
                    {isAdmin && urlParams.userId !== user?.id
                        ? `Портфели пользователя #${urlParams.userId}`
                        : "Мои портфели"}
                    {" "}({userPortfolios.length})
                </h2>
                <div className={styles.portfolioGrid}>
                    {userPortfolios.length > 0 ? (
                        userPortfolios.map((portfolio) => {
                            const limits = PORTFOLIO_LIMITS[portfolio.type];
                            const totalQuantity = getTotalQuantity(portfolio.id);
                            const { value, yield: portfolioYield, isHistorical } = getPortfolioValue(portfolio);

                            return (
                                <div
                                    key={portfolio.id}
                                    className={`${styles.portfolioCard} ${selectedPortfolio?.id === portfolio.id ? styles.portfolioCardActive : ""}`}
                                >
                                    <h3 className={styles.portfolioName}>{portfolio.name}</h3>
                                    {portfolio.description && (
                                        <p className={styles.portfolioDescription}>{portfolio.description}</p>
                                    )}
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
                                        onClick={() => handleOpenPortfolio(portfolio)}
                                    >
                                        Подробнее
                                    </button>
                                </div>
                            );
                        })
                    ) : (
                        <div className={styles.noPortfolios}>
                            <p>У этого пользователя пока нет портфелей</p>
                        </div>
                    )}
                </div>
            </section>

            {/* ==================== МОДАЛЬНОЕ ОКНО СОЗДАНИЯ ==================== */}
            {showCreateModal && (
                <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>➕ Создать портфель</h2>
                            <button
                                className={styles.modalClose}
                                onClick={() => setShowCreateModal(false)}
                            >
                                ✕
                            </button>
                        </div>

                        {createError && (
                            <div className={styles.modalError}>{createError}</div>
                        )}

                        {/* Название */}
                        <div className={styles.formGroup}>
                            <label>
                                Название портфеля <span className={styles.required}>*</span>
                            </label>
                            <input
                                type="text"
                                value={newPortfolio.name}
                                onChange={(e) => setNewPortfolio({ ...newPortfolio, name: e.target.value })}
                                placeholder="Например: Мой портфель"
                                maxLength={50}
                                autoFocus
                            />
                            <span className={styles.charCount}>
                                {newPortfolio.name.length}/50
                            </span>
                        </div>

                        {/* Описание */}
                        <div className={styles.formGroup}>
                            <label>
                                Описание <span className={styles.optional}>(необязательно)</span>
                            </label>
                            <textarea
                                value={newPortfolio.description}
                                onChange={(e) => setNewPortfolio({ ...newPortfolio, description: e.target.value })}
                                placeholder="Краткое описание портфеля..."
                                rows={3}
                                maxLength={200}
                            />
                            <span className={styles.charCount}>
                                {newPortfolio.description.length}/200
                            </span>
                        </div>

                        {/* Тип портфеля */}
                        <div className={styles.formGroup}>
                            <label>Тип портфеля</label>
                            <div className={styles.typeOptions}>
                                {(["conservative", "balanced", "aggressive"] as PortfolioType[]).map((t) => (
                                    <label
                                        key={t}
                                        className={`${styles.typeOption} ${newPortfolio.type === t ? styles.typeOptionActive : ""}`}
                                    >
                                        <input
                                            type="radio"
                                            name="portfolioType"
                                            value={t}
                                            checked={newPortfolio.type === t}
                                            onChange={() => setNewPortfolio({ ...newPortfolio, type: t })}
                                        />
                                        <span className={styles.typeOptionTitle}>
                                            {t === "conservative" && "🛡️ Консервативный"}
                                            {t === "balanced" && "⚖️ Сбалансированный"}
                                            {t === "aggressive" && "🚀 Агрессивный"}
                                        </span>
                                        <span className={styles.typeOptionDesc}>
                                            {PORTFOLIO_LIMITS[t].description}
                                        </span>
                                        <span className={styles.typeOptionLimits}>
                                            До {PORTFOLIO_LIMITS[t].maxBonds} шт. • До {PORTFOLIO_LIMITS[t].maxYield}%
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Кнопки */}
                        <div className={styles.modalActions}>
                            <button
                                className={styles.cancelButton}
                                onClick={() => setShowCreateModal(false)}
                            >
                                Отмена
                            </button>
                            <button
                                className={styles.confirmButton}
                                onClick={handleCreatePortfolio}
                            >
                                Создать
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ==================== ДЕТАЛИ ПОРТФЕЛЯ ==================== */}
            {selectedPortfolio && (
                <section className={styles.detailsSection}>
                    <div className={styles.detailsHeader}>
                        <div>
                            <h2 className={styles.sectionTitle}>
                                Портфель: {selectedPortfolio.name}
                                {isHistoricalView && (
                                    <span className={styles.historicalDate}>
                                        {" "}— на {formatDate(selectedDate)}
                                    </span>
                                )}
                            </h2>
                            {isAdmin && selectedPortfolio.userId !== user?.id && (
                                <p className={styles.ownerInfo}>
                                    👤 Владелец: пользователь #{selectedPortfolio.userId}
                                </p>
                            )}
                        </div>
                        <div className={styles.detailsActions}>
                            {isHistoricalView && (
                                <button
                                    className={styles.todayButton}
                                    onClick={() => setSelectedDate(today)}
                                >
                                    🔄 Вернуться на сегодня
                                </button>
                            )}
                            <button
                                className={styles.closeButton}
                                onClick={handleClosePortfolio}
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

                    {/* ✅ Графики: слева 2 линейных, справа круговая */}
                    <div className={styles.chartsLayout}>
                        {/* Левая колонка — линейные графики */}
                        <div className={styles.chartsLeft}>
                            <div className={styles.chartCard}>
                                <p className={styles.chartHint}>
                                    💡 Нажмите на точку, чтобы переключиться на дату
                                </p>
                                <Line data={valueChartData} options={valueChartOptions} />
                            </div>

                            <div className={styles.chartCard}>
                                <Line data={yieldChartData} options={yieldChartOptions} />
                            </div>
                        </div>

                        {/* Правая колонка — круговая диаграмма */}
                        <div className={styles.chartsRight}>
                            <div className={styles.chartCard}>
                                <Doughnut data={doughnutData} options={doughnutOptions} />
                            </div>
                        </div>
                    </div>

                    {/* ==================== ПОИСК И ФИЛЬТРАЦИЯ ==================== */}
                    <div className={styles.filtersSection}>
                        <div className={styles.filterField}>
                            <label htmlFor="searchIsinPortfolio">🔍 Поиск по ISIN:</label>
                            <input
                                id="searchIsinPortfolio"
                                type="text"
                                value={searchIsin}
                                onChange={(e) => setSearchIsin(e.target.value)}
                                placeholder="Введите ISIN..."
                                className={styles.filterInput}
                            />
                        </div>

                        <div className={styles.filterField}>
                            <label htmlFor="filterBondType">Тип облигации:</label>
                            <select
                                id="filterBondType"
                                value={filterBondType}
                                onChange={(e) => setFilterBondType(e.target.value)}
                                className={styles.filterSelect}
                            >
                                <option value="">Все типы</option>
                                <option value="lse">LSE (Любляна)</option>
                                <option value="wb">WB (Вена)</option>
                                <option value="sg">SG (Швейцария)</option>
                                <option value="me">ME (Москва)</option>
                            </select>
                        </div>

                        <button
                            className={styles.filterResetButton}
                            onClick={() => {
                                setSearchIsin("");
                                setFilterBondType("");
                            }}
                        >
                            Сбросить
                        </button>
                    </div>

                    {/* Счётчик найденных */}
                    <div className={styles.filteredCount}>
                        Найдено: <strong>{filteredBonds.length}</strong> из {getSelectedBonds().length}
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

                    {/* ✅ Подсказка о кликабельности */}
                    <p className={styles.tableHint}>
                        💡 Нажмите на строку, чтобы перейти к подробной информации об облигации
                    </p>

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
                                {filteredBonds.length > 0 ? (
                                    filteredBonds.map((bond, index) => (
                                        <tr
                                            key={index}
                                            className={styles.clickableRow}
                                            onClick={() => handleBondClick(bond.isin)}
                                            title={`Перейти к облигации ${bond.isin}`}
                                        >
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
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className={styles.noBonds}>
                                            {getSelectedBonds().length === 0
                                                ? "В портфеле пока нет облигаций. Добавьте облигации со страницы «Облигации»."
                                                : "По вашему запросу ничего не найдено"}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </div>
    );
};

export default PortfoliosPage;