import React, { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import styles from "./BondsPage.module.css";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

/**
 * Модель облигации
 */
interface Bond {
    id: number;
    name: string;
    isin: string;
    type: "lse" | "wb" | "sg" | "me";
    price: number;
    yield: number;
    maturity: string;
    currency: string;
    currencyRate: number;
    updatedAt: string;
}

/**
 * Курсы валют (моковые)
 */
const CURRENCY_RATES: Record<string, number> = {
    RUB: 1,
    USD: 90.5,
    EUR: 98.3,
    CNY: 12.5,
};

/**
 * Страница облигаций
 * Поддерживает чтение ISIN из URL для автоматического выбора облигации
 */
const BondsPage = () => {
    // ==================== URL ПАРАМЕТРЫ ====================
    const location = useLocation();
    const navigate = useNavigate();

    // ✅ Парсим isin из location.search — обновляется при каждом изменении URL
    const isinFromUrl = useMemo(() => {
        const params = new URLSearchParams(location.search);
        return params.get("isin");
    }, [location.search]);

    // ==================== МОКОВЫЕ ДАННЫЕ ====================
    const bondsData: Bond[] = useMemo(() => [
        { id: 1, name: "SIJ 4. IZDAJA", isin: "SI0032103580", type: "lse", price: 9850, yield: 4.2, maturity: "2028-06-15", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 2, name: "SIJ 5. IZDAJA", isin: "SI0032103598", type: "lse", price: 9920, yield: 3.8, maturity: "2029-07-20", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 3, name: "SDH 3. IZDAJA", isin: "SI0002103529", type: "wb", price: 9780, yield: 5.1, maturity: "2027-11-01", currency: "EUR", currencyRate: 98.3, updatedAt: "2026-08-30" },
        { id: 4, name: "TELEKOM SLOVENIJE", isin: "SI0032103630", type: "sg", price: 10150, yield: 3.2, maturity: "2030-03-10", currency: "CHF", currencyRate: 102.5, updatedAt: "2026-08-30" },
        { id: 5, name: "TIVOLI 2. IZDAJA", isin: "SI0032104232", type: "me", price: 9630, yield: 4.9, maturity: "2028-09-05", currency: "RUB", currencyRate: 1, updatedAt: "2026-08-30" },
    ], []);

    // ==================== СОСТОЯНИЕ ====================
    const [searchType, setSearchType] = useState<string>("");
    const [searchIsin, setSearchIsin] = useState<string>("");
    const [selectedBond, setSelectedBond] = useState<Bond | null>(null);
    const [selectedCurrency, setSelectedCurrency] = useState<string>("RUB");
    const [notFound, setNotFound] = useState<boolean>(false);
    const [badRequest, setBadRequest] = useState<string | null>(null);

    // ==================== АВТОВЫБОР ОБЛИГАЦИИ ИЗ URL ====================
    useEffect(() => {
        // ✅ Сбрасываем состояние при каждом изменении URL
        setNotFound(false);
        setBadRequest(null);
        setSelectedBond(null);

        // Если ISIN не указан — ничего не выбираем
        if (!isinFromUrl) return;

        // Проверка на пустой ISIN (пробелы)
        if (isinFromUrl.trim() === "") {
            setBadRequest("ISIN не может быть пустым или состоять из пробелов");
            return;
        }

        // Проверка длины ISIN (стандарт — 12 символов)
        if (isinFromUrl.length !== 12) {
            setBadRequest(`ISIN должен содержать 12 символов, получено: ${isinFromUrl.length}`);
            return;
        }

        // Поиск облигации по ISIN
        const foundBond = bondsData.find(
            (b) => b.isin.toLowerCase() === isinFromUrl.toLowerCase()
        );

        if (foundBond) {
            setSelectedBond(foundBond);
        } else {
            setNotFound(true);
        }
    }, [isinFromUrl, bondsData]);

    // ==================== ФИЛЬТРАЦИЯ ====================
    const filteredBonds = useMemo(() => {
        return bondsData.filter((bond) => {
            const matchType = searchType === "" || bond.type === searchType;
            const matchIsin = searchIsin === "" || bond.isin.toLowerCase().includes(searchIsin.toLowerCase());
            return matchType && matchIsin;
        });
    }, [bondsData, searchType, searchIsin]);

    // ==================== КОНВЕРТАЦИЯ ВАЛЮТ ====================
    const convertPrice = (priceInRub: number, targetCurrency: string): number => {
        const rate = CURRENCY_RATES[targetCurrency] || 1;
        return priceInRub / rate;
    };

    const formatPrice = (priceInRub: number, currency: string): string => {
        const converted = convertPrice(priceInRub, currency);
        return `${converted.toFixed(2)} ${currency}`;
    };

    // ==================== ДАННЫЕ ДЛЯ ГРАФИКА ====================
    const chartData = useMemo(() => ({
        labels: ["Авг 01", "Авг 03", "Авг 05", "Авг 07", "Авг 09", "Авг 11", "Авг 13"],
        datasets: [
            {
                label: `Цена облигации (${selectedCurrency})`,
                data: [97.2, 98.1, 97.8, 98.5, 99.0, 98.7, 99.3].map((p) =>
                    convertPrice(p * 100, selectedCurrency)
                ),
                borderColor: "#4fc3f7",
                backgroundColor: "rgba(79, 195, 247, 0.1)",
                fill: true,
                tension: 0.3,
                pointBackgroundColor: "#4fc3f7",
            },
        ],
    }), [selectedCurrency]);

    const chartOptions = useMemo(() => ({
        responsive: true,
        plugins: {
            legend: { display: true, position: "top" as const },
            title: {
                display: true,
                text: selectedBond
                    ? `Динамика цены: ${selectedBond.name}`
                    : "Выберите облигацию для просмотра графика",
                font: { size: 16 },
            },
        },
        scales: {
            y: {
                beginAtZero: false,
                ticks: {
                    callback: function (value: string | number) {
                        return `${value} ${selectedCurrency}`;
                    },
                },
            },
        },
    }), [selectedBond, selectedCurrency]);

    // ==================== ОБРАБОТЧИКИ ====================
    const handleBondClick = (bond: Bond) => {
        setSelectedBond(bond);
        setNotFound(false);
        setBadRequest(null);
        // Обновляем URL без перезагрузки
        navigate(`/bonds?isin=${bond.isin}`, { replace: true });
    };

    const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCurrency(e.target.value);
    };

    const handleResetError = () => {
        setBadRequest(null);
        setNotFound(false);
        navigate("/bonds", { replace: true });
    };

    // ==================== СТРАНИЦА BAD REQUEST ====================
    if (badRequest) {
        return (
            <div className={styles.errorPage}>
                <div className={styles.errorCard}>
                    <div className={styles.errorIcon}>⚠️</div>
                    <h1 className={styles.errorTitle}>400 — Некорректный запрос</h1>
                    <p className={styles.errorMessage}>{badRequest}</p>
                    <p className={styles.errorHint}>
                        Проверьте правильность введённого ISIN. Он должен содержать ровно 12 символов.
                    </p>
                    <button className={styles.errorButton} onClick={handleResetError}>
                        Вернуться к списку облигаций
                    </button>
                </div>
            </div>
        );
    }

    // ==================== СТРАНИЦА NOT FOUND ====================
    if (notFound) {
        return (
            <div className={styles.errorPage}>
                <div className={styles.errorCard}>
                    <div className={styles.errorIcon}>🔍</div>
                    <h1 className={styles.errorTitle}>404 — Облигация не найдена</h1>
                    <p className={styles.errorMessage}>
                        Облигация с ISIN <strong>"{isinFromUrl}"</strong> не найдена в системе.
                    </p>
                    <p className={styles.errorHint}>
                        Возможно, она была удалена или вы ввели неверный ISIN.
                    </p>
                    <button className={styles.errorButton} onClick={handleResetError}>
                        Вернуться к списку облигаций
                    </button>
                </div>
            </div>
        );
    }

    // ==================== ОСНОВНОЙ РЕНДЕР ====================
    return (
        <div className={styles.bondsPage}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>📈 Облигации</h1>
                    <p className={styles.pageDescription}>
                        Список доступных облигаций и график динамики цены
                    </p>
                </div>

                <div className={styles.currencySelector}>
                    <label htmlFor="currency">Валюта:</label>
                    <select
                        id="currency"
                        value={selectedCurrency}
                        onChange={handleCurrencyChange}
                        className={styles.currencySelect}
                    >
                        {Object.keys(CURRENCY_RATES).map((curr) => (
                            <option key={curr} value={curr}>{curr}</option>
                        ))}
                    </select>
                </div>
            </div>

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

            {/* ==================== ГРАФИК + ИНФОРМАЦИЯ ==================== */}
            <section className={styles.chartAndInfoSection}>
                <div className={styles.chartSection}>
                    <div className={styles.chartContainer}>
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </div>

                <div className={styles.infoSection}>
                    {selectedBond ? (
                        <>
                            <h2 className={styles.infoTitle}>{selectedBond.name}</h2>
                            <div className={styles.infoList}>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>ISIN:</span>
                                    <span className={styles.infoValue}>{selectedBond.isin}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Тип:</span>
                                    <span className={styles.infoValue}>{selectedBond.type.toUpperCase()}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Цена:</span>
                                    <span className={styles.infoValueHighlight}>
                                        {formatPrice(selectedBond.price, selectedCurrency)}
                                    </span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Доходность:</span>
                                    <span className={styles.infoValue}>{selectedBond.yield}%</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Дата погашения:</span>
                                    <span className={styles.infoValue}>{selectedBond.maturity}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Валюта:</span>
                                    <span className={styles.infoValue}>{selectedBond.currency}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Курс валюты:</span>
                                    <span className={styles.infoValue}>{selectedBond.currencyRate}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Обновлено:</span>
                                    <span className={styles.infoValue}>{selectedBond.updatedAt}</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className={styles.noSelection}>
                            <p>👈 Выберите облигацию из списка, чтобы увидеть подробную информацию</p>
                        </div>
                    )}
                </div>
            </section>

            {/* ==================== ТАБЛИЦА ==================== */}
            <section className={styles.tableSection}>
                <h2 className={styles.sectionTitle}>
                    Список облигаций ({filteredBonds.length})
                </h2>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Название</th>
                                <th>ISIN</th>
                                <th>Тип</th>
                                <th>Цена</th>
                                <th>Доходность</th>
                                <th>Дата погашения</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBonds.length > 0 ? (
                                filteredBonds.map((bond) => (
                                    <tr
                                        key={bond.id}
                                        onClick={() => handleBondClick(bond)}
                                        className={selectedBond?.id === bond.id ? styles.selectedRow : ""}
                                    >
                                        <td>{bond.id}</td>
                                        <td>{bond.name}</td>
                                        <td className={styles.isin}>{bond.isin}</td>
                                        <td>
                                            <span className={styles.typeBadge}>
                                                {bond.type.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>{formatPrice(bond.price, selectedCurrency)}</td>
                                        <td className={bond.yield > 4.5 ? styles.yieldHigh : styles.yieldLow}>
                                            {bond.yield}%
                                        </td>
                                        <td>{bond.maturity}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className={styles.noData}>
                                        Облигации не найдены
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default BondsPage;