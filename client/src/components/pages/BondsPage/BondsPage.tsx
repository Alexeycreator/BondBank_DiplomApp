import React, { useState, useMemo, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Modal, Tabs, Tab, Dropdown, Toast, ToastContainer } from "react-bootstrap";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import styles from "./BondsPage.module.css";
import NotFoundPage from "../errorPages/NotFoundPage";
import BadRequestPage from "../errorPages/BadRequestPage";
import ImportBonds from "../../importExport/ImportBonds";
import ExportBonds from "../../importExport/ExportBonds";
import ErrorCard from "../../errorCard/ErrorCard";
import { useAuth } from "../../context/AuthContext";
import { getBondsInfo } from "../../data/bondsPageApi";
import {
    BondDto, BondBaseModel, BondsInfo, CurrencyRatesModel,
    BondType, BondView, LseSpecificData, WbSpecificData, SgSpecificData, MeSpecificData,
} from "../../data/types";
import PaginationControl from "../../pagination/PaginationControl";
import { DataTable, TableColumn } from "../../table/DataTable";
import { LineChart } from "../../charts/LineChart";
import { BondDetailsCard, BondDetailRow } from "../../infoCards/BondDetailsCard";
import { SearchFilters } from "../../search/SearchFilters";
import { StatusBadge } from "../../infoCards/StatusBadge";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const BOND_TYPES: readonly BondType[] = ["lse", "wb", "sg", "me"] as const;
function isBondType(value: string | null | undefined): value is BondType {
    return value !== null && value !== undefined && (BOND_TYPES as readonly string[]).includes(value);
}

const BOND_TYPE_LABELS: Record<BondType, string> = {
    lse: "LSE (Люблянская биржа)",
    wb: "WB (Венская биржа)",
    sg: "SG (Швейцарская биржа)",
    me: "ME (Московская биржа)",
};

const formatNumber = (value: number): string => {
    if (!Number.isFinite(value)) return "—";
    const [integerPart, decimalPart] = value.toFixed(2).split(".");
    const withSeparators = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return `${withSeparators}.${decimalPart}`;
};

const formatDateTime = (iso: string | null | undefined): string => {
    if (!iso) return "—";
    const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
    if (!match) return "—";
    const [, year, month, day, hours, minutes, seconds] = match;
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

function extractPrice(dto: BondDto): number {
    if (!dto.specificData) return 0;
    switch (dto.type) {
        case "lse": return (dto.specificData as LseSpecificData).nominalValue ?? 0;
        case "wb": return (dto.specificData as WbSpecificData).last ?? 0;
        case "sg": return (dto.specificData as SgSpecificData).closingPrice ?? 0;
        case "me": return (dto.specificData as MeSpecificData).faceValue ?? 0;
        default: return 0;
    }
}

function extractYield(dto: BondDto): number | null {
    if (!dto.specificData) return null;
    switch (dto.type) {
        case "sg": return (dto.specificData as SgSpecificData).yieldToWorst ?? null;
        default: return null;
    }
}

function extractCurrency(dto: BondDto): string | null {
    if (!dto.specificData) return null;
    switch (dto.type) {
        case "lse": return (dto.specificData as LseSpecificData).currency ?? null;
        case "wb": return (dto.specificData as WbSpecificData).currency ?? null;
        case "sg": return (dto.specificData as SgSpecificData).tradingBaseCurrency ?? null;
        case "me": return (dto.specificData as MeSpecificData).faceUnit ?? null;
        default: return null;
    }
}

function extractMaturity(dto: BondDto): string | null {
    if (!dto.specificData) return null;
    switch (dto.type) {
        case "wb": return (dto.specificData as WbSpecificData).maturity ?? null;
        case "sg": return (dto.specificData as SgSpecificData).maturityDate ?? null;
        case "lse": return (dto.specificData as LseSpecificData).delistingDate ?? null;
        default: return null;
    }
}

type SortField = "id" | "name" | "isin" | "type" | "price" | "yield" | "maturity";
type SortDirection = "asc" | "desc" | null;

const BondsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAdmin, isAuthenticated } = useAuth();

    const isinFromUrl = useMemo(() => new URLSearchParams(location.search).get("isin"), [location.search]);
    const pageFromUrl = useMemo(() => {
        const raw = new URLSearchParams(location.search).get("page");
        const parsed = Number(raw);
        if (!raw || Number.isNaN(parsed) || parsed < 1) return 1;
        return Math.floor(parsed);
    }, [location.search]);

    const [bondsInfo, setBondsInfo] = useState<BondsInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    // Состояния для уведомлений
    const [showSlowWarning, setShowSlowWarning] = useState(false);
    const [showEmptyWarning, setShowEmptyWarning] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchBondsInfo = async () => {
        try {
            setLoading(true);
            setLoadError(null);
            setShowEmptyWarning(false);
            setShowSlowWarning(false);

            // Запускаем таймер на 5 секунд
            timerRef.current = setTimeout(() => {
                setShowSlowWarning(true);
            }, 5000);

            const data = await getBondsInfo();
            setBondsInfo(data);

            // Если данные пришли, но список пуст
            if (data.bondsByTable.length === 0) {
                setShowEmptyWarning(true);
            }
        } catch (err: any) {
            console.error("Ошибка загрузки облигаций:", err);
            setLoadError(err.serverMessage || err.message || "Не удалось загрузить облигации");
        } finally {
            setLoading(false);
            if (timerRef.current) clearTimeout(timerRef.current);
        }
    };

    useEffect(() => { 
        fetchBondsInfo(); 
        return () => { if (timerRef.current) clearTimeout(timerRef.current); }
    }, []);

    const currencyRatesById = useMemo<Map<number, CurrencyRatesModel>>(() => {
        const map = new Map<number, CurrencyRatesModel>();
        if (!bondsInfo?.currencyRates) return map;
        for (const rate of bondsInfo.currencyRates) map.set(rate.id, rate);
        return map;
    }, [bondsInfo]);

    const currencyRatesByCode = useMemo<Record<string, number>>(() => {
        const map: Record<string, number> = { RUB: 1 };
        if (!bondsInfo?.currencyRates) return map;
        for (const rate of bondsInfo.currencyRates) map[rate.letterCode] = rate.rate;
        return map;
    }, [bondsInfo]);

    const availableCurrencies = useMemo<string[]>(() => {
        if (!bondsInfo?.currencyRates) return ["RUB"];
        const set = new Set<string>(["RUB"]);
        for (const rate of bondsInfo.currencyRates) set.add(rate.letterCode);
        return Array.from(set);
    }, [bondsInfo]);

    const bondsData: BondView[] = useMemo(() => {
        if (!bondsInfo) return [];
        return bondsInfo.bondsByTable
            .filter((dto): dto is BondDto & { bond: BondBaseModel; type: BondType } => dto.bond !== null && isBondType(dto.type))
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

    const [searchType, setSearchType] = useState<string>("");
    const [searchIsin, setSearchIsin] = useState<string>("");
    const [selectedBond, setSelectedBond] = useState<BondView | null>(null);
    const [selectedCurrency, setSelectedCurrency] = useState<string>("RUB");
    const [notFound, setNotFound] = useState<boolean>(false);
    const [badRequest, setBadRequest] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(pageFromUrl);
    const [pageSize, setPageSize] = useState<number>(50);
    const [sortField, setSortField] = useState<SortField | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
            setBadRequest(`ISIN должен содержать 12 символов, получено: ${isinFromUrl.length}`);
            return;
        }

        const foundBond = bondsData.find((b) => b.isin.toLowerCase() === isinFromUrl.toLowerCase());
        if (foundBond) {
            setSelectedBond(foundBond);
            setIsModalOpen(true);
        } else {
            setNotFound(true);
        }
    }, [isinFromUrl, bondsData]);

    useEffect(() => { setCurrentPage(pageFromUrl); }, [pageFromUrl]);

    const filteredBonds = useMemo(() => {
        return bondsData.filter((bond) => {
            const matchType = searchType === "" || bond.type === searchType;
            const matchIsin = searchIsin === "" || bond.isin.toLowerCase().includes(searchIsin.toLowerCase());
            return matchType && matchIsin;
        });
    }, [bondsData, searchType, searchIsin]);

    const sortedBonds = useMemo(() => {
        if (!sortField || !sortDirection) return filteredBonds;
        const direction = sortDirection === "asc" ? 1 : -1;
        return [...filteredBonds].sort((a, b) => {
            const aVal = a[sortField];
            const bVal = b[sortField];
            if (aVal === null && bVal === null) return 0;
            if (aVal === null) return 1;
            if (bVal === null) return -1;
            if (typeof aVal === "number" && typeof bVal === "number") return (aVal - bVal) * direction;
            return String(aVal).localeCompare(String(bVal), "ru") * direction;
        });
    }, [filteredBonds, sortField, sortDirection]);

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
    }, [searchType, searchIsin]);

    const handlePageChange = (page: number) => {
        const clamped = Math.min(Math.max(1, page), totalPages);
        if (clamped === safePage) return;
        const params = new URLSearchParams(location.search);
        if (clamped === 1) params.delete("page");
        else params.set("page", String(clamped));
        navigate(`/bonds?${params.toString()}`, { replace: true });
        setCurrentPage(clamped);
    };

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        const params = new URLSearchParams(location.search);
        params.delete("page");
        navigate(`/bonds?${params.toString()}`, { replace: true });
        setCurrentPage(1);
    };

    const handleSort = (field: SortField) => {
        if (sortField !== field) { setSortField(field); setSortDirection("asc"); return; }
        if (sortDirection === "asc") setSortDirection("desc");
        else if (sortDirection === "desc") { setSortField(null); setSortDirection(null); }
        else setSortDirection("asc");
    };

    const getSortIcon = (field: SortField): string => {
        if (sortField !== field) return "⇅";
        if (sortDirection === "asc") return "▲";
        if (sortDirection === "desc") return "▼";
        return "⇅";
    };

    const convertToSelected = (price: number, fromCurrency: string, toCurrency: string): number => {
        const fromRate = currencyRatesByCode[fromCurrency] ?? 1;
        const toRate = currencyRatesByCode[toCurrency] ?? 1;
        return (price * fromRate) / toRate;
    };

    const formatPrice = (bond: BondView): string => {
        const converted = convertToSelected(bond.price, bond.currency, selectedCurrency);
        return `${formatNumber(converted)} ${selectedCurrency}`;
    };

    const handleImport = async () => { await fetchBondsInfo(); };

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
        if (!selectedBond || !bondsInfo?.bondByChart) return { labels: [], datasets: [emptyDataset] };

        const history = bondsInfo.bondByChart
            .filter((h) => h.isin === selectedBond.isin)
            .sort((a, b) => a.recordedDate.localeCompare(b.recordedDate));

        if (history.length === 0) return { labels: [], datasets: [emptyDataset] };

        return {
            labels: history.map((h) => h.recordedDate),
            datasets: [{
                ...emptyDataset,
                data: history.map((h) => convertToSelected(Number(h.bondPrice), selectedBond.currency, selectedCurrency)),
            }],
        };
    }, [selectedBond, bondsInfo, selectedCurrency, currencyRatesByCode]);

    const chartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: {
                display: true,
                text: selectedBond ? `Динамика цены: ${selectedBond.name}` : "Выберите облигацию",
                font: { size: 16 },
                color: "#ffffff",
            },
        },
        scales: {
            x: { grid: { color: "rgba(255, 255, 255, 0.05)" }, ticks: { color: "#a0aabf" } },
            y: { grid: { color: "rgba(255, 255, 255, 0.05)" }, ticks: { color: "#a0aabf", callback: (value: string | number) => `${value} ${selectedCurrency}` } },
        },
    }), [selectedBond, selectedCurrency]);

    const handleBondClick = (bond: BondView) => {
        setSelectedBond(bond);
        setNotFound(false);
        setBadRequest(null);
        setIsModalOpen(true);

        const params = new URLSearchParams(location.search);
        params.set("isin", bond.isin);
        if (safePage > 1) params.set("page", String(safePage));
        navigate(`/bonds?${params.toString()}`, { replace: true });
    };

    const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCurrency(e.target.value);
    };

    const selectedBondDetails: BondDetailRow[] = useMemo(() => {
        if (!selectedBond) return [];
        const rows: BondDetailRow[] = [
            { label: "ISIN", value: selectedBond.isin },
            { label: "Тип", value: BOND_TYPE_LABELS[selectedBond.type] },
            { label: "Цена", value: formatPrice(selectedBond), isHighlight: true },
        ];
        if (selectedBond.yield !== null) rows.push({ label: "Доходность", value: `${selectedBond.yield}%` });
        if (selectedBond.maturity) rows.push({ label: "Дата погашения", value: selectedBond.maturity });
        rows.push(
            { label: "Валюта", value: selectedBond.currency },
            { label: "Курс валюты", value: selectedBond.currencyRate },
            { label: "Дата курса", value: selectedBond.currencyRateDate },
            { label: "Обновлено", value: formatDateTime(selectedBond.updatedAt) }
        );
        const d = selectedBond.specificData;
        if (d) {
            if (selectedBond.type === "lse") {
                const s = d as LseSpecificData;
                rows.push({ label: "Сектор", value: s.sector }, { label: "Символ", value: s.symbol }, { label: "В листинге", value: formatNumber(s.listedQuantity ?? 0) }, { label: "Номинал", value: formatNumber(s.nominalValue ?? 0) }, { label: "Дата листинга", value: s.listingDate }, { label: "Дата делистинга", value: s.delistingDate ?? "—" });
            } else if (selectedBond.type === "wb") {
                const s = d as WbSpecificData;
                rows.push({ label: "Последняя цена", value: s.last }, { label: "Изменение", value: s.chg }, { label: "Дата", value: formatDateTime(s.date) }, { label: "Bid", value: s.bid }, { label: "Ask", value: s.ask }, { label: "Погашение", value: s.maturity }, { label: "Статус", value: s.status });
            } else if (selectedBond.type === "sg") {
                const s = d as SgSpecificData;
                rows.push({ label: "Valor ID", value: s.valorId }, { label: "Валюта торгов", value: s.tradingBaseCurrency }, { label: "Купон", value: `${s.couponRate}%` }, { label: "Погашение", value: s.maturityDate }, { label: "Цена закрытия", value: s.closingPrice }, { label: "Изм. за день", value: s.closingPerfomance }, { label: "Bid", value: s.bidPrice }, { label: "Ask", value: s.askPrice }, { label: "Время торгов", value: s.marketTime }, { label: "Дата торгов", value: s.marketDate }, { label: "Эмитент", value: s.issuerNameFull }, { label: "Продуктовая линия", value: s.productLine }, { label: "Сектор (код)", value: s.industrySectorCode }, { label: "Тип бумаги", value: s.secTypeCode }, { label: "Объём выпуска", value: formatNumber(s.amountInIssue ?? 0) }, { label: "Доходность к погашению", value: `${s.yieldToWorst}%` });
            } else if (selectedBond.type === "me") {
                const s = d as MeSpecificData;
                rows.push({ label: "Тип бумаги", value: s.securityType }, { label: "Sec ID", value: s.secId }, { label: "Краткое имя", value: s.shortName }, { label: "Рег. номер", value: s.regNumber }, { label: "Торгуется", value: s.isTraded ? "Да" : "Нет" }, { label: "Режим торгов", value: s.primaryBoardId }, { label: "Рынок", value: s.market }, { label: "Движок", value: s.engine }, { label: "Номинал", value: `${formatNumber(s.faceValue)} ${s.faceUnit}` });
            }
        }
        return rows;
    }, [selectedBond, selectedCurrency]);

    const bondColumns: TableColumn<BondView>[] = [
        { key: "num", title: "№", render: (_item, rowNumber) => rowNumber },
        { key: "name", title: <>Название <span className={styles.sortIcon}>{getSortIcon("name")}</span></>, onClick: () => handleSort("name") },
        { key: "isin", title: <>ISIN <span className={styles.sortIcon}>{getSortIcon("isin")}</span></>, onClick: () => handleSort("isin"), className: styles.isin },
        {
            key: "type",
            title: <>Тип <span className={styles.sortIcon}>{getSortIcon("type")}</span></>,
            onClick: () => handleSort("type"),
            render: (bond) => <StatusBadge variantType="type" value={bond.type} />
        },
        { key: "price", title: <>Цена <span className={styles.headerCurrency}>({selectedCurrency})</span> <span className={styles.sortIcon}>{getSortIcon("price")}</span></>, onClick: () => handleSort("price"), render: (bond) => formatPrice(bond) },
        {
            key: "yield",
            title: <>Доходность <span className={styles.sortIcon}>{getSortIcon("yield")}</span></>,
            onClick: () => handleSort("yield"),
            render: (bond) => bond.yield !== null
                ? <StatusBadge variantType="yield" value={bond.yield} />
                : "—"
        },
        { key: "maturity", title: <>Дата погашения <span className={styles.sortIcon}>{getSortIcon("maturity")}</span></>, onClick: () => handleSort("maturity"), render: (bond) => bond.maturity ?? "—" },
    ];

    if (badRequest) return <BadRequestPage message={badRequest} hint="Проверьте ISIN (12 символов)" returnPath="/bonds" returnLabel="Вернуться" />;
    if (notFound) return <NotFoundPage isin={isinFromUrl || ""} returnPath="/bonds" returnLabel="Вернуться" />;
    if (loadError) return <div className={styles.bondsPage}><ErrorCard icon="⚠️" title="Ошибка" message={loadError} retryLabel="Повторить" onRetry={fetchBondsInfo} /></div>;

    const searchAvailableTypes = typeBonds.map((type) => ({
        value: type,
        label: BOND_TYPE_LABELS[type],
    }));

    return (
        <div className={styles.bondsPage}>
            {/* Контейнер уведомлений в правом верхнем углу */}
            <ToastContainer position="top-end" className="p-3" style={{ position: "fixed", zIndex: 9999 }}>
                <Toast show={showSlowWarning} onClose={() => setShowSlowWarning(false)} bg="warning" delay={15000} autohide>
                    <Toast.Header>
                        <strong className="me-auto">⏳ Загрузка занимает много времени</strong>
                    </Toast.Header>
                    <Toast.Body className="text-dark">
                        Данных слишком много. Загрузка может занять больше минуты. Пожалуйста, подождите.
                    </Toast.Body>
                </Toast>

                <Toast show={showEmptyWarning} onClose={() => setShowEmptyWarning(false)} bg="primary" delay={15000} autohide>
                    <Toast.Header>
                        <strong className="me-auto">📭 Облигаций нет в системе</strong>
                    </Toast.Header>
                    <Toast.Body className="text-white">
                        Упс, облигаций нет в системе. Если это ошибка, обратитесь в поддержку: <br/>
                        <b>Email:</b> support@bondbank.ru <br/>
                        <b>Телефон:</b> 8 (800) 555-35-35
                    </Toast.Body>
                </Toast>
            </ToastContainer>

            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>📈 Облигации</h1>
                </div>
                <div className={styles.headerActions}>
                    {isAdmin && <ImportBonds onImport={handleImport} />}
                    {isAuthenticated && <ExportBonds bonds={sortedBonds} filename="bonds" />}
                    <Dropdown align="end">
                        <Dropdown.Toggle variant="outline-info" id="currency-dropdown" size="sm">
                            💱 {selectedCurrency}
                        </Dropdown.Toggle>

                        <Dropdown.Menu
                            className="bg-dark border-secondary"
                            style={{ maxHeight: "250px", overflowY: "auto" }}
                        >
                            {availableCurrencies.map((curr) => (
                                <Dropdown.Item
                                    key={curr}
                                    onClick={() => setSelectedCurrency(curr)}
                                    active={curr === selectedCurrency}
                                    className={styles.currencyItem}
                                >
                                    {curr}
                                </Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </div>

            <section className={styles.tableSection}>
                <h2 className={styles.sectionTitle}>
                    Список облигаций {!loading && `(${sortedBonds.length})`}
                </h2>

                <SearchFilters
                    searchType={searchType}
                    searchIsin={searchIsin}
                    onTypeChange={setSearchType}
                    onIsinChange={setSearchIsin}
                    onReset={() => {
                        setSearchType("");
                        setSearchIsin("");
                        setSortField(null);
                        setSortDirection(null);
                    }}
                    availableTypes={searchAvailableTypes}
                />

                <DataTable 
                    data={paginatedBonds} 
                    columns={bondColumns} 
                    keyExtractor={(bond) => bond.id} 
                    onRowClick={handleBondClick} 
                    rowClassName={(bond) => selectedBond?.id === bond.id ? styles.selectedRow : ""} 
                    emptyMessage={loading ? "" : "Облигации не найдены"}
                    startIndex={(safePage - 1) * pageSize + 1} 
                    isLoading={loading} 
                />

                {/* Прячем пагинацию во время загрузки */}
                {!loading && totalPages > 0 && (
                    <PaginationControl 
                        currentPage={safePage} 
                        totalPages={totalPages} 
                        pageSize={pageSize} 
                        onPageChange={handlePageChange} 
                        onPageSizeChange={handlePageSizeChange} 
                    />
                )}
            </section>

            <Modal
                show={isModalOpen}
                onHide={() => setIsModalOpen(false)}
                centered
                size="lg"
                scrollable
                contentClassName="bg-dark text-white border-secondary"
            >
                <Modal.Header closeButton closeVariant="white" className="border-secondary">
                    <Modal.Title>Облигация: {selectedBond?.name}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {selectedBond && (
                        <Tabs
                            defaultActiveKey="chart"
                            id="bond-details-tabs"
                            className="mb-3 custom-tabs"
                            fill
                        >
                            <Tab eventKey="chart" title="📈 График">
                                <div style={{ height: "400px", position: "relative", marginTop: "16px" }}>
                                    <LineChart labels={chartData.labels} datasets={chartData.datasets} options={chartOptions} />
                                </div>
                            </Tab>

                            <Tab eventKey="info" title="📋 Информация">
                                <div style={{ marginTop: "16px" }}>
                                    <BondDetailsCard title="" rows={selectedBondDetails} />
                                </div>
                            </Tab>
                        </Tabs>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default BondsPage;