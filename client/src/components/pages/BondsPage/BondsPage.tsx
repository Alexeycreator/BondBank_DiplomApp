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
import NotFoundPage from "../errorPages/NotFoundPage";
import BadRequestPage from "../errorPages/BadRequestPage";
import ImportBonds from "../../importExport/ImportBonds";
import ExportBonds from "../../importExport/ExportBonds";
import ErrorCard from "../../errorCard/ErrorCard";
import Spinner from "../../spinner/Spinner";
import { useAuth } from "../../context/AuthContext";
import { getBondsInfo } from "../../data/bondsPageApi";
import {
    BondDto,
    BondBaseModel,
    BondsInfo,
    CurrencyRatesModel,
    BondType,
    BondView,
    LseSpecificData,
    WbSpecificData,
    SgSpecificData,
    MeSpecificData,
} from "../../data/types";
// ✅ 1. Импортируем новый компонент пагинации
// Убедитесь, что путь правильный (зависит от того, куда вы его положили)
import PaginationControl from "../../pagination/PaginationControl";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

/** Известные типы облигаций — для безопасной валидации */
const BOND_TYPES: readonly BondType[] = ["lse", "wb", "sg", "me"] as const;

function isBondType(value: string | null | undefined): value is BondType {
    return (
        value !== null &&
        value !== undefined &&
        (BOND_TYPES as readonly string[]).includes(value)
    );
}

/** Расшифровка типов облигаций (биржа) для UI */
const BOND_TYPE_LABELS: Record<BondType, string> = {
    lse: "LSE (Люблянская биржа)",
    wb: "WB (Венская биржа)",
    sg: "SG (Швейцарская биржа)",
    me: "ME (Московская биржа)",
};

/** ✅ Форматирует число с разделителями: 1 000 000 000.00 */
const formatNumber = (value: number): string => {
    if (!Number.isFinite(value)) return "—";
    const [integerPart, decimalPart] = value.toFixed(2).split(".");
    const withSeparators = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return `${withSeparators}.${decimalPart}`;
};

/** Форматирует ISO-дату в "YYYY-MM-DD HH:mm:ss" */
const formatDateTime = (iso: string | null | undefined): string => {
    if (!iso) return "—";

    const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
    if (!match) return "—";

    const [, year, month, day, hours, minutes, seconds] = match;
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/** Извлекает цену из specificData по типу облигации */
function extractPrice(dto: BondDto): number {
    if (!dto.specificData) return 0;

    switch (dto.type) {
        case "lse":
            return (dto.specificData as LseSpecificData).nominalValue ?? 0;
        case "wb":
            return (dto.specificData as WbSpecificData).last ?? 0;
        case "sg":
            return (dto.specificData as SgSpecificData).closingPrice ?? 0;
        case "me":
            return (dto.specificData as MeSpecificData).faceValue ?? 0;
        default:
            return 0;
    }
}

/** Извлекает доходность (только для sg) */
function extractYield(dto: BondDto): number | null {
    if (!dto.specificData) return null;

    switch (dto.type) {
        case "sg":
            return (dto.specificData as SgSpecificData).yieldToWorst ?? null;
        default:
            return null;
    }
}

/** Извлекает валюту */
function extractCurrency(dto: BondDto): string | null {
    if (!dto.specificData) return null;

    switch (dto.type) {
        case "lse":
            return (dto.specificData as LseSpecificData).currency ?? null;
        case "wb":
            return (dto.specificData as WbSpecificData).currency ?? null;
        case "sg":
            return (dto.specificData as SgSpecificData).tradingBaseCurrency ?? null;
        case "me":
            return (dto.specificData as MeSpecificData).faceUnit ?? null;
        default:
            return null;
    }
}

/** Извлекает дату погашения */
function extractMaturity(dto: BondDto): string | null {
    if (!dto.specificData) return null;

    switch (dto.type) {
        case "wb":
            return (dto.specificData as WbSpecificData).maturity ?? null;
        case "sg":
            return (dto.specificData as SgSpecificData).maturityDate ?? null;
        case "lse":
            return (dto.specificData as LseSpecificData).delistingDate ?? null;
        default:
            return null;
    }
}

/** ✅ Поля, по которым можно сортировать таблицу */
type SortField =
    | "id"
    | "name"
    | "isin"
    | "type"
    | "price"
    | "yield"
    | "maturity";

type SortDirection = "asc" | "desc" | null;

const BondsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAdmin, isAuthenticated } = useAuth();

    // ==================== URL ПАРАМЕТРЫ ====================
    const isinFromUrl = useMemo(() => {
        const params = new URLSearchParams(location.search);
        return params.get("isin");
    }, [location.search]);

    const pageFromUrl = useMemo(() => {
        const params = new URLSearchParams(location.search);
        const raw = params.get("page");
        const parsed = Number(raw);
        if (!raw || Number.isNaN(parsed) || parsed < 1) return 1;
        return Math.floor(parsed);
    }, [location.search]);

    // ==================== ДАННЫЕ С БЭКА ====================
    const [bondsInfo, setBondsInfo] = useState<BondsInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const fetchBondsInfo = async () => {
        try {
            setLoading(true);
            setLoadError(null);
            const data = await getBondsInfo();
            setBondsInfo(data);
            console.log(data);
        } catch (err: any) {
            console.error("Ошибка загрузки облигаций:", err);
            setLoadError(
                err.serverMessage || err.message || "Не удалось загрузить облигации"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBondsInfo();
    }, []);

    // ==================== КУРСЫ ВАЛЮТ ====================
    const currencyRatesById = useMemo<Map<number, CurrencyRatesModel>>(() => {
        const map = new Map<number, CurrencyRatesModel>();
        if (!bondsInfo?.currencyRates) return map;

        for (const rate of bondsInfo.currencyRates) {
            map.set(rate.id, rate);
        }
        return map;
    }, [bondsInfo]);

    const currencyRatesByCode = useMemo<Record<string, number>>(() => {
        const map: Record<string, number> = { RUB: 1 };
        if (!bondsInfo?.currencyRates) return map;

        for (const rate of bondsInfo.currencyRates) {
            map[rate.letterCode] = rate.rate;
        }
        return map;
    }, [bondsInfo]);

    const availableCurrencies = useMemo<string[]>(() => {
        if (!bondsInfo?.currencyRates) return ["RUB"];

        const set = new Set<string>();
        set.add("RUB");
        for (const rate of bondsInfo.currencyRates) {
            set.add(rate.letterCode);
        }
        return Array.from(set);
    }, [bondsInfo]);

    // ==================== DTO → VIEW ====================
    const bondsData: BondView[] = useMemo(() => {
        if (!bondsInfo) return [];

        return bondsInfo.bondsByTable
            .filter(
                (dto): dto is BondDto & { bond: BondBaseModel; type: BondType } =>
                    dto.bond !== null && isBondType(dto.type)
            )
            .map((dto) => {
                const rate = currencyRatesById.get(dto.bond.currencyRatesId);

                return {
                    id: dto.bond.id,
                    name: dto.bond.name,
                    isin: dto.bond.isin,
                    type: dto.type,
                    updatedAt: dto.bond.updatedAt,
                    price: extractPrice(dto),
                    yield: extractYield(dto),
                    maturity: extractMaturity(dto),
                    currency: extractCurrency(dto) ?? rate?.letterCode ?? "RUB",
                    currencyRate: rate?.rate ?? 1,
                    currencyRatesId: dto.bond.currencyRatesId,
                    currencyRateDate: rate?.dateReceipt ?? "—",
                    specificData: dto.specificData,
                };
            });
    }, [bondsInfo, currencyRatesById]);

    const typeBonds: BondType[] = useMemo(() => {
        if (!bondsInfo?.typeBondsByFilter) return [];
        return bondsInfo.typeBondsByFilter.filter(isBondType);
    }, [bondsInfo]);

    // ==================== СОСТОЯНИЕ ====================
    const [searchType, setSearchType] = useState<string>("");
    const [searchIsin, setSearchIsin] = useState<string>("");
    const [selectedBond, setSelectedBond] = useState<BondView | null>(null);
    const [selectedCurrency, setSelectedCurrency] = useState<string>("RUB");
    const [notFound, setNotFound] = useState<boolean>(false);
    const [badRequest, setBadRequest] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(pageFromUrl);

    // ✅ 2. Добавляем состояние для размера страницы (заменяем константу PAGE_SIZE)
    const [pageSize, setPageSize] = useState<number>(50);

    // ✅ Состояние сортировки
    const [sortField, setSortField] = useState<SortField | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);

    // ==================== АВТОВЫБОР ИЗ URL ====================
    useEffect(() => {
        setNotFound(false);
        setBadRequest(null);
        setSelectedBond(null);

        if (!isinFromUrl) return;

        if (isinFromUrl.trim() === "") {
            setBadRequest("ISIN не может быть пустым или состоять из пробелов");
            return;
        }

        if (isinFromUrl.length !== 12) {
            setBadRequest(
                `ISIN должен содержать 12 символов, получено: ${isinFromUrl.length}`
            );
            return;
        }

        const foundBond = bondsData.find(
            (b) => b.isin.toLowerCase() === isinFromUrl.toLowerCase()
        );

        if (foundBond) {
            setSelectedBond(foundBond);
        } else {
            setNotFound(true);
        }
    }, [isinFromUrl, bondsData]);

    useEffect(() => {
        setCurrentPage(pageFromUrl);
    }, [pageFromUrl]);

    // ==================== ФИЛЬТРАЦИЯ ====================
    const filteredBonds = useMemo(() => {
        return bondsData.filter((bond) => {
            const matchType = searchType === "" || bond.type === searchType;
            const matchIsin =
                searchIsin === "" ||
                bond.isin.toLowerCase().includes(searchIsin.toLowerCase());
            return matchType && matchIsin;
        });
    }, [bondsData, searchType, searchIsin]);

    // ==================== СОРТИРОВКА ====================
    const sortedBonds = useMemo(() => {
        if (!sortField || !sortDirection) return filteredBonds;

        const direction = sortDirection === "asc" ? 1 : -1;

        return [...filteredBonds].sort((a, b) => {
            const aVal = a[sortField];
            const bVal = b[sortField];

            // null-значения всегда в конец
            if (aVal === null && bVal === null) return 0;
            if (aVal === null) return 1;
            if (bVal === null) return -1;

            if (typeof aVal === "number" && typeof bVal === "number") {
                return (aVal - bVal) * direction;
            }

            return String(aVal).localeCompare(String(bVal), "ru") * direction;
        });
    }, [filteredBonds, sortField, sortDirection]);

    // ==================== ПАГИНАЦИЯ ====================
    // ✅ 3. Используем pageSize вместо PAGE_SIZE
    const totalPages = Math.max(1, Math.ceil(sortedBonds.length / pageSize));
    const safePage = Math.min(currentPage, totalPages);

    const paginatedBonds = useMemo(() => {
        const start = (safePage - 1) * pageSize;
        return sortedBonds.slice(start, start + pageSize);
    }, [sortedBonds, safePage, pageSize]);

    useEffect(() => {
        setCurrentPage(1);
        const params = new URLSearchParams(location.search);
        if (params.has("page")) {
            params.delete("page");
            navigate(`/bonds?${params.toString()}`, { replace: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchType, searchIsin]);

    const handlePageChange = (page: number) => {
        const clamped = Math.min(Math.max(1, page), totalPages);
        if (clamped === safePage) return;

        const params = new URLSearchParams(location.search);
        if (clamped === 1) {
            params.delete("page");
        } else {
            params.set("page", String(clamped));
        }
        navigate(`/bonds?${params.toString()}`, { replace: true });
        setCurrentPage(clamped);
    };

    // ✅ 4. Обработчик изменения количества строк на странице
    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        // При смене размера страницы сбрасываем пагинацию на 1-ю страницу
        const params = new URLSearchParams(location.search);
        params.delete("page");
        navigate(`/bonds?${params.toString()}`, { replace: true });
        setCurrentPage(1);
    };

    // ==================== СОРТИРОВКА: ОБРАБОТЧИК ====================
    const handleSort = (field: SortField) => {
        if (sortField !== field) {
            setSortField(field);
            setSortDirection("asc");
            return;
        }

        if (sortDirection === "asc") {
            setSortDirection("desc");
        } else if (sortDirection === "desc") {
            setSortField(null);
            setSortDirection(null);
        } else {
            setSortDirection("asc");
        }
    };

    const getSortIcon = (field: SortField): string => {
        if (sortField !== field) return "⇅";
        if (sortDirection === "asc") return "▲";
        if (sortDirection === "desc") return "▼";
        return "⇅";
    };

    // ==================== КОНВЕРТАЦИЯ ====================
    const convertToSelected = (
        price: number,
        fromCurrency: string,
        toCurrency: string
    ): number => {
        const fromRate = currencyRatesByCode[fromCurrency] ?? 1;
        const toRate = currencyRatesByCode[toCurrency] ?? 1;
        const priceInRub = price * fromRate;
        return priceInRub / toRate;
    };

    const formatPrice = (bond: BondView): string => {
        const converted = convertToSelected(
            bond.price,
            bond.currency,
            selectedCurrency
        );
        return `${formatNumber(converted)} ${selectedCurrency}`;
    };

    // ==================== ИМПОРТ ====================
    const handleImport = async () => {
        await fetchBondsInfo();
    };

    // ==================== ГРАФИК ====================
    const chartData = useMemo(() => {
        const emptyDataset = {
            label: `Цена облигации (${selectedCurrency})`,
            data: [] as number[],
            borderColor: "#4fc3f7",
            backgroundColor: "rgba(79, 195, 247, 0.1)",
            fill: true,
            tension: 0.3,
            pointBackgroundColor: "#4fc3f7",
            pointRadius: 6,
            pointHoverRadius: 8,
        };

        if (!selectedBond || !bondsInfo?.bondByChart) {
            return { labels: [], datasets: [emptyDataset] };
        }

        const history = bondsInfo.bondByChart
            .filter((h) => h.isin === selectedBond.isin)
            .sort((a, b) => a.recordedDate.localeCompare(b.recordedDate));

        if (history.length === 0) {
            return { labels: [], datasets: [emptyDataset] };
        }

        return {
            labels: history.map((h) => h.recordedDate),
            datasets: [
                {
                    ...emptyDataset,
                    data: history.map((h) =>
                        convertToSelected(
                            Number(h.bondPrice),
                            selectedBond.currency,
                            selectedCurrency
                        )
                    ),
                },
            ],
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedBond, bondsInfo, selectedCurrency, currencyRatesByCode]);

    const chartOptions = useMemo(
        () => ({
            responsive: true,
            maintainAspectRatio: false,
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
                    grace: "10%",
                    ticks: {
                        callback: function (value: string | number) {
                            return `${value} ${selectedCurrency}`;
                        },
                    },
                },
            },
        }),
        [selectedBond, selectedCurrency]
    );

    // ==================== ОБРАБОТЧИКИ ====================
    const handleBondClick = (bond: BondView) => {
        setSelectedBond(bond);
        setNotFound(false);
        setBadRequest(null);
        const params = new URLSearchParams(location.search);
        params.set("isin", bond.isin);
        if (safePage > 1) params.set("page", String(safePage));
        navigate(`/bonds?${params.toString()}`, { replace: true });
    };

    const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCurrency(e.target.value);
    };

    // ==================== РЕНДЕР SPECIFICDATA ====================
    const renderSpecificData = (bond: BondView): React.ReactNode => {
        const d = bond.specificData;
        if (!d) return null;

        const row = (label: string, value: React.ReactNode, key: string) => (
            <div className={styles.infoRow} key={key}>
                <span className={styles.infoLabel}>{label}:</span>
                <span className={styles.infoValue}>{value ?? "—"}</span>
            </div>
        );

        switch (bond.type) {
            case "lse": {
                const s = d as LseSpecificData;
                return (
                    <>
                        {row("Сектор", s.sector, "sector")}
                        {row("Символ", s.symbol, "symbol")}
                        {row("В листинге", formatNumber(s.listedQuantity ?? 0), "listedQty")}
                        {row("Номинал", formatNumber(s.nominalValue ?? 0), "nominal")}
                        {row("Дата листинга", s.listingDate, "listingDate")}
                        {row("Дата делистинга", s.delistingDate ?? "—", "delistingDate")}
                    </>
                );
            }
            case "wb": {
                const s = d as WbSpecificData;
                return (
                    <>
                        {row("Последняя цена", s.last, "last")}
                        {row("Изменение", s.chg, "chg")}
                        {row("Дата", formatDateTime(s.date), "date")}
                        {row("Bid", s.bid, "bid")}
                        {row("Ask", s.ask, "ask")}
                        {row("Погашение", s.maturity, "maturity")}
                        {row("Статус", s.status, "status")}
                    </>
                );
            }
            case "sg": {
                const s = d as SgSpecificData;
                return (
                    <>
                        {row("Valor ID", s.valorId, "valorId")}
                        {row("Валюта торгов", s.tradingBaseCurrency, "currency")}
                        {row("Купон", `${s.couponRate}%`, "coupon")}
                        {row("Погашение", s.maturityDate, "maturity")}
                        {row("Цена закрытия", s.closingPrice, "closingPrice")}
                        {row("Изм. за день", s.closingPerfomance, "closingPerf")}
                        {row("Bid", s.bidPrice, "bid")}
                        {row("Ask", s.askPrice, "ask")}
                        {row("Время торгов", s.marketTime, "marketTime")}
                        {row("Дата торгов", s.marketDate, "marketDate")}
                        {row("Эмитент", s.issuerNameFull, "issuer")}
                        {row("Продуктовая линия", s.productLine, "productLine")}
                        {row("Сектор (код)", s.industrySectorCode, "industryCode")}
                        {row("Тип бумаги", s.secTypeCode, "secTypeCode")}
                        {row("Объём выпуска", formatNumber(s.amountInIssue ?? 0), "amount")}
                        {row("Доходность к погашению", `${s.yieldToWorst}%`, "ytw")}
                    </>
                );
            }
            case "me": {
                const s = d as MeSpecificData;
                return (
                    <>
                        {row("Тип бумаги", s.securityType, "securityType")}
                        {row("Sec ID", s.secId, "secId")}
                        {row("Краткое имя", s.shortName, "shortName")}
                        {row("Рег. номер", s.regNumber, "regNumber")}
                        {row("Торгуется", s.isTraded ? "Да" : "Нет", "isTraded")}
                        {row("Режим торгов", s.primaryBoardId, "board")}
                        {row("Рынок", s.market, "market")}
                        {row("Движок", s.engine, "engine")}
                        {row("Номинал", `${formatNumber(s.faceValue)} ${s.faceUnit}`, "faceValue")}
                    </>
                );
            }
            default:
                return null;
        }
    };

    // ==================== BAD REQUEST ====================
    if (badRequest) {
        return (
            <BadRequestPage
                message={badRequest}
                hint="Проверьте правильность введённого ISIN. Он должен содержать ровно 12 символов."
                returnPath="/bonds"
                returnLabel="Вернуться к списку облигаций"
            />
        );
    }

    // ==================== NOT FOUND ====================
    if (notFound) {
        return (
            <NotFoundPage
                isin={isinFromUrl || ""}
                returnPath="/bonds"
                returnLabel="Вернуться к списку облигаций"
            />
        );
    }

    // ==================== ЗАГРУЗКА ====================
    if (loading) {
        return (
            <div className={styles.bondsPage}>
                <div className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>📈 Облигации</h1>
                </div>
                <Spinner
                    size="large"
                    variant="primary"
                    label="Загрузка облигаций…"
                    fullScreen
                />
            </div>
        );
    }

    // ==================== ОШИБКА ====================
    if (loadError) {
        return (
            <div className={styles.bondsPage}>
                <div className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>📈 Облигации</h1>
                </div>
                <div style={{ padding: "40px 20px" }}>
                    <ErrorCard
                        icon="⚠️"
                        title="Не удалось загрузить облигации"
                        message={loadError}
                        retryLabel="Повторить"
                        onRetry={fetchBondsInfo}
                    />
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

                <div className={styles.headerActions}>
                    {isAdmin && <ImportBonds onImport={handleImport} />}
                    {isAuthenticated && (
                        <ExportBonds bonds={sortedBonds} filename="bonds" />
                    )}

                    {/* ✅ Выделенный селектор валют */}
                    <div
                        className={styles.currencySelector}
                        title="Валюта отображения цен"
                    >
                        <span className={styles.currencyIcon}>💱</span>
                        <div className={styles.currencyTexts}>
                            <label
                                htmlFor="currency"
                                className={styles.currencyLabel}
                            >
                                Валюта отображения
                            </label>
                            <select
                                id="currency"
                                value={selectedCurrency}
                                onChange={handleCurrencyChange}
                                className={styles.currencySelect}
                            >
                                {availableCurrencies.map((curr) => (
                                    <option key={curr} value={curr}>
                                        {curr}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* ГРАФИК + ИНФОРМАЦИЯ */}
            <section className={styles.chartAndInfoSection}>
                <div className={styles.chartSection}>
                    <div className={styles.chartContainer}>
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </div>

                <div className={styles.infoSection}>
                    {selectedBond ? (
                        <>
                            <h2 className={styles.infoTitle}>
                                {selectedBond.name}
                            </h2>
                            <div className={styles.infoList}>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>ISIN:</span>
                                    <span className={styles.infoValue}>
                                        {selectedBond.isin}
                                    </span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Тип:</span>
                                    <span className={styles.infoValue}>
                                        {BOND_TYPE_LABELS[selectedBond.type]}
                                    </span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Цена:</span>
                                    <span className={styles.infoValueHighlight}>
                                        {formatPrice(selectedBond)}
                                    </span>
                                </div>
                                {selectedBond.yield !== null && (
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>
                                            Доходность:
                                        </span>
                                        <span className={styles.infoValue}>
                                            {selectedBond.yield}%
                                        </span>
                                    </div>
                                )}
                                {selectedBond.maturity && (
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>
                                            Дата погашения:
                                        </span>
                                        <span className={styles.infoValue}>
                                            {selectedBond.maturity}
                                        </span>
                                    </div>
                                )}
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>
                                        Валюта:
                                    </span>
                                    <span className={styles.infoValue}>
                                        {selectedBond.currency}
                                    </span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>
                                        Курс валюты:
                                    </span>
                                    <span className={styles.infoValue}>
                                        {selectedBond.currencyRate}
                                    </span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>
                                        Дата курса:
                                    </span>
                                    <span className={styles.infoValue}>
                                        {selectedBond.currencyRateDate}
                                    </span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>
                                        Обновлено:
                                    </span>
                                    <span className={styles.infoValue}>
                                        {formatDateTime(selectedBond.updatedAt)}
                                    </span>
                                </div>

                                {renderSpecificData(selectedBond)}
                            </div>
                        </>
                    ) : (
                        <div className={styles.noSelection}>
                            <p>
                                👈 Выберите облигацию из списка, чтобы увидеть
                                подробную информацию
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* ТАБЛИЦА */}
            <section className={styles.tableSection}>
                <h2 className={styles.sectionTitle}>
                    Список облигаций ({sortedBonds.length})
                </h2>

                {/* ✅ ПОИСК ПЕРЕМЕЩЁН К ТАБЛИЦЕ */}
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
                            {typeBonds.map((type) => (
                                <option key={type} value={type}>
                                    {BOND_TYPE_LABELS[type]}
                                </option>
                            ))}
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
                            setSortField(null);
                            setSortDirection(null);
                        }}
                    >
                        Сбросить
                    </button>
                </section>

                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.sortableHeader} style={{ cursor: "default" }}>
                                    №
                                </th>
                                <th
                                    onClick={() => handleSort("name")}
                                    className={styles.sortableHeader}
                                >
                                    Название{" "}
                                    <span className={styles.sortIcon}>
                                        {getSortIcon("name")}
                                    </span>
                                </th>
                                <th
                                    onClick={() => handleSort("isin")}
                                    className={styles.sortableHeader}
                                >
                                    ISIN{" "}
                                    <span className={styles.sortIcon}>
                                        {getSortIcon("isin")}
                                    </span>
                                </th>
                                <th
                                    onClick={() => handleSort("type")}
                                    className={styles.sortableHeader}
                                >
                                    Тип{" "}
                                    <span className={styles.sortIcon}>
                                        {getSortIcon("type")}
                                    </span>
                                </th>
                                <th
                                    onClick={() => handleSort("price")}
                                    className={styles.sortableHeader}
                                >
                                    Цена{" "}
                                    <span className={styles.headerCurrency}>
                                        ({selectedCurrency})
                                    </span>{" "}
                                    <span className={styles.sortIcon}>
                                        {getSortIcon("price")}
                                    </span>
                                </th>
                                <th
                                    onClick={() => handleSort("yield")}
                                    className={styles.sortableHeader}
                                >
                                    Доходность{" "}
                                    <span className={styles.sortIcon}>
                                        {getSortIcon("yield")}
                                    </span>
                                </th>
                                <th
                                    onClick={() => handleSort("maturity")}
                                    className={styles.sortableHeader}
                                >
                                    Дата погашения{" "}
                                    <span className={styles.sortIcon}>
                                        {getSortIcon("maturity")}
                                    </span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedBonds.length > 0 ? (
                                paginatedBonds.map((bond, index) => {
                                    // Сквозная нумерация с учётом пагинации:
                                    // 1-я страница → 1..50, 2-я → 51..100 и т.д.
                                    const rowNumber = (safePage - 1) * pageSize + index + 1;

                                    return (
                                        <tr
                                            key={bond.id}
                                            onClick={() => handleBondClick(bond)}
                                            className={
                                                selectedBond?.id === bond.id
                                                    ? styles.selectedRow
                                                    : ""
                                            }
                                        >
                                            <td>{rowNumber}</td>
                                            <td>{bond.name}</td>
                                            <td className={styles.isin}>
                                                {bond.isin}
                                            </td>
                                            <td>
                                                <span
                                                    className={styles.typeBadge}
                                                    title={BOND_TYPE_LABELS[bond.type]}
                                                >
                                                    {bond.type.toUpperCase()}
                                                </span>
                                            </td>
                                            <td>
                                                {formatPrice(bond)}
                                            </td>
                                            <td
                                                className={
                                                    bond.yield !== null && bond.yield > 4.5
                                                        ? styles.yieldHigh
                                                        : styles.yieldLow
                                                }
                                            >
                                                {bond.yield !== null
                                                    ? `${bond.yield}%`
                                                    : "—"}
                                            </td>
                                            <td>{bond.maturity ?? "—"}</td>
                                        </tr>
                                    );
                                })
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

                {/* ✅ 5. Заменяем старый блок пагинации на новый компонент */}
                {totalPages > 0 && (
                    <PaginationControl
                        currentPage={safePage}
                        totalPages={totalPages}
                        pageSize={pageSize}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                    />
                )}
            </section>
        </div>
    );
};

export default BondsPage;