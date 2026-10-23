import React, { useState, useMemo, useEffect, useRef } from "react";
import { Modal, Tabs, Tab, Dropdown, Toast, ToastContainer } from "react-bootstrap";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import styles from "./BondsPage.module.css";
import NotFoundPage from "../errorPages/NotFoundPage";
import BadRequestPage from "../errorPages/BadRequestPage";
import ImportBonds from "../../features/bond/import-export/ui/ImportBonds";
import ExportBonds from "../../features/bond/import-export/ui/ExportBonds";
import ErrorCard from "../../shared/ui/error-card/ErrorCard";
import { useAuth } from "../../shared/auth/AuthContext";
import { ApiRequestError } from "../../shared/api/client";
import { getBondsInfo } from "../../entities/bond/api/bondsApi";
import {
    BondType, BondView,
    LseSpecificData, WbSpecificData, SgSpecificData, MeSpecificData,
} from "../../entities/bond/model/bonds";
import { BondsInfo } from "../../entities/bond/model/bonds-info";
import {
    BOND_TYPE_LABELS,
    formatBondDateTime,
    formatBondNumber,
    isBondType,
    mapBondsInfoToViews,
} from "../../entities/bond/model/bond-mappers";
import PaginationControl from "../../shared/ui/pagination/PaginationControl";
import { DataTable, TableColumn } from "../../shared/ui/data-table/DataTable";
import { LineChart } from "../../shared/ui/charts/LineChart";
import { BondDetailsCard, BondDetailRow } from "../../entities/bond/ui/BondDetailsCard";
import { SearchFilters } from "../../shared/ui/search-filters/SearchFilters";
import { StatusBadge } from "../../shared/ui/status-badge/StatusBadge";
import { useUrlQuery } from "../../shared/lib/routing/useUrlQuery";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type SortField = "id" | "name" | "isin" | "type" | "price" | "yield" | "maturity";
type SortDirection = "asc" | "desc" | null;

const BondsPage = () => {
    const { searchParams, updateParams } = useUrlQuery();
    const { isAdmin, isAuthenticated } = useAuth();

    const isinFromUrl = searchParams.get("isin");
    const pageFromUrl = (() => {
        const raw = searchParams.get("page");
        const parsed = Number(raw);
        if (!raw || Number.isNaN(parsed) || parsed < 1) return 1;
        return Math.floor(parsed);
    })();

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
        } catch (err: unknown) {
            console.error("Ошибка загрузки облигаций:", err);
            const message = err instanceof ApiRequestError
                ? err.serverMessage || err.message
                : err instanceof Error
                    ? err.message
                    : "Не удалось загрузить облигации";
            setLoadError(message);
        } finally {
            setLoading(false);
            if (timerRef.current) clearTimeout(timerRef.current);
        }
    };

    useEffect(() => { 
        fetchBondsInfo(); 
        return () => { if (timerRef.current) clearTimeout(timerRef.current); }
    }, []);

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
        return mapBondsInfoToViews(bondsInfo);
    }, [bondsInfo]);

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
        if (searchParams.has("page")) {
            updateParams({ page: null });
        }
    }, [searchType, searchIsin, updateParams]);

    const handlePageChange = (page: number) => {
        const clamped = Math.min(Math.max(1, page), totalPages);
        if (clamped === safePage) return;
        updateParams({ page: clamped === 1 ? null : String(clamped) });
        setCurrentPage(clamped);
    };

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        updateParams({ page: null });
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
        return `${formatBondNumber(converted)} ${selectedCurrency}`;
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

        updateParams({
            isin: bond.isin,
            ...(safePage > 1 ? { page: String(safePage) } : {}),
        });
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
            { label: "Обновлено", value: formatBondDateTime(selectedBond.updatedAt) }
        );
        const d = selectedBond.specificData;
        if (d) {
            if (selectedBond.type === "lse") {
                const s = d as LseSpecificData;
                rows.push({ label: "Сектор", value: s.sector }, { label: "Символ", value: s.symbol }, { label: "В листинге", value: formatBondNumber(s.listedQuantity ?? 0) }, { label: "Номинал", value: formatBondNumber(s.nominalValue ?? 0) }, { label: "Дата листинга", value: s.listingDate }, { label: "Дата делистинга", value: s.delistingDate ?? "—" });
            } else if (selectedBond.type === "wb") {
                const s = d as WbSpecificData;
                rows.push({ label: "Последняя цена", value: s.last }, { label: "Изменение", value: s.chg }, { label: "Дата", value: formatBondDateTime(s.date) }, { label: "Bid", value: s.bid }, { label: "Ask", value: s.ask }, { label: "Погашение", value: s.maturity }, { label: "Статус", value: s.status });
            } else if (selectedBond.type === "sg") {
                const s = d as SgSpecificData;
                rows.push({ label: "Valor ID", value: s.valorId }, { label: "Валюта торгов", value: s.tradingBaseCurrency }, { label: "Купон", value: `${s.couponRate}%` }, { label: "Погашение", value: s.maturityDate }, { label: "Цена закрытия", value: s.closingPrice }, { label: "Изм. за день", value: s.closingPerfomance }, { label: "Bid", value: s.bidPrice }, { label: "Ask", value: s.askPrice }, { label: "Время торгов", value: s.marketTime }, { label: "Дата торгов", value: s.marketDate }, { label: "Эмитент", value: s.issuerNameFull }, { label: "Продуктовая линия", value: s.productLine }, { label: "Сектор (код)", value: s.industrySectorCode }, { label: "Тип бумаги", value: s.secTypeCode }, { label: "Объём выпуска", value: formatBondNumber(s.amountInIssue ?? 0) }, { label: "Доходность к погашению", value: `${s.yieldToWorst}%` });
            } else if (selectedBond.type === "me") {
                const s = d as MeSpecificData;
                rows.push({ label: "Тип бумаги", value: s.securityType }, { label: "Sec ID", value: s.secId }, { label: "Краткое имя", value: s.shortName }, { label: "Рег. номер", value: s.regNumber }, { label: "Торгуется", value: s.isTraded ? "Да" : "Нет" }, { label: "Режим торгов", value: s.primaryBoardId }, { label: "Рынок", value: s.market }, { label: "Движок", value: s.engine }, { label: "Номинал", value: `${formatBondNumber(s.faceValue)} ${s.faceUnit}` });
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