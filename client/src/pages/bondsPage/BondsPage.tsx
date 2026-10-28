import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Modal,
  Tabs,
  Tab,
  Dropdown,
  Toast,
  ToastContainer,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import styles from "./BondsPage.module.css";
import NotFoundPage from "../errorPages/NotFoundPage";
import BadRequestPage from "../errorPages/BadRequestPage";
import ImportBonds from "../../features/bond/import-export/ui/ImportBonds";
import ExportBonds from "../../features/bond/import-export/ui/ExportBonds";
import ErrorCard from "../../shared/ui/error-card/ErrorCard";
import { useAuth } from "../../shared/auth/AuthContext";
import { useToast } from "../../shared/notifications/ToastContext";
import { ApiRequestError } from "../../shared/api/client";
import {
  getBondsInfo,
  getBondsByFilter,
} from "../../entities/bond/api/bondsApi";
import { getBondHistoriesByIsin } from "../../entities/bond/api/bondHistoriesApi";
import {
  BondType,
  BondView,
  LseSpecificData,
  WbSpecificData,
  SgSpecificData,
  MeSpecificData,
} from "../../entities/bond/model/bonds";
import { BondsInfo } from "../../entities/bond/model/bonds-info";
import {
  BOND_TYPE_LABELS,
  formatBondDateTime,
  formatBondNumber,
  isBondType,
  mapBondsInfoToViews,
} from "../../entities/bond/model/bond-mappers";
import { BondHistoryModel } from "../../entities/bond/model/bond-history";
import PaginationControl from "../../shared/ui/pagination/PaginationControl";
import { DataTable, TableColumn } from "../../shared/ui/data-table/DataTable";
import { LineChart } from "../../shared/ui/charts/LineChart";
import {
  BondDetailsCard,
  BondDetailRow,
} from "../../entities/bond/ui/BondDetailsCard";
import { SearchFilters } from "../../shared/ui/search-filters/SearchFilters";
import { StatusBadge } from "../../shared/ui/status-badge/StatusBadge";
import { useUrlQuery } from "../../shared/lib/routing/useUrlQuery";
import { useTheme } from "../../shared/theme/ThemeContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
);

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
  const { searchParams, updateParams } = useUrlQuery();
  const { isAdmin, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const { showToast } = useToast();

  const chartTextColor = theme === "dark" ? "#ffffff" : "#172033";
  const chartMutedColor = theme === "dark" ? "#a0aabf" : "#5f6b7c";

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

  // Состояния для серверной фильтрации
  const [serverBonds, setServerBonds] = useState<BondView[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Состояния для уведомлений
  const [showSlowWarning, setShowSlowWarning] = useState(false);
  const [showEmptyWarning, setShowEmptyWarning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchBondsInfo = async (isRetry = false) => {
    try {
      if (!isRetry) {
        setLoading(true);
        setLoadError(null);
      }

      setShowEmptyWarning(false);
      setShowSlowWarning(false);
      setServerBonds([]);

      timerRef.current = setTimeout(() => setShowSlowWarning(true), 5000);

      const data = await getBondsInfo();
      setBondsInfo(data);

      if (data.bondsByTable.length === 0) {
        setShowEmptyWarning(true);
      }
    } catch (err: unknown) {
      console.error("Ошибка загрузки облигаций:", err);

      let errorMessage = "Не удалось загрузить облигации";

      if (err instanceof ApiRequestError) {
        errorMessage = err.serverMessage || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setLoadError(errorMessage);

      if (isRetry) {
        showToast("Ошибка", errorMessage, "danger");
      }
    } finally {
      if (!isRetry) {
        setLoading(false);
      }
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  };

  useEffect(() => {
    fetchBondsInfo();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleServerSearch = async (type: string, isin: string) => {
    if (!type && !isin) {
      setServerBonds([]);
      setSearchError(null);
      return;
    }

    try {
      setIsSearching(true);
      setSearchError(null);

      // Получаем отфильтрованные данные с сервера
      const filteredDtos = await getBondsByFilter(
        type || undefined,
        isin || undefined,
      );

      // ✅ Создаем временный объект BondsInfo, чтобы использовать ваш маппер
      const fakeBondsInfo: BondsInfo = {
        bondsByTable: filteredDtos,
        typeBondsByFilter: [],
        currencyRates: bondsInfo?.currencyRates || [], // Берем курсы из основного стейта
      };

      // ✅ Прогоняем через маппер, который правильно достанет цену, доходность и т.д.
      const mappedViews = mapBondsInfoToViews(fakeBondsInfo);

      setServerBonds(mappedViews);
    } catch (error: unknown) {
      if (error instanceof ApiRequestError) {
        setSearchError(error.serverMessage || "Ошибка валидации данных");
      } else {
        setSearchError("Ошибка при поиске облигаций");
      }
      setServerBonds([]);
    } finally {
      setIsSearching(false);
    }
  };

  const currencyRatesByCode = useMemo<Record<string, number>>(() => {
    const map: Record<string, number> = { RUB: 1 };
    if (!bondsInfo?.currencyRates) return map;
    for (const rate of bondsInfo.currencyRates)
      map[rate.letterCode] = rate.rate;
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
  const [bondHistory, setBondHistory] = useState<BondHistoryModel[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
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
      setBadRequest(
        `ISIN должен содержать 12 символов, получено: ${isinFromUrl.length}`,
      );
      return;
    }

    const foundBond = bondsData.find(
      (b) => b.isin.toLowerCase() === isinFromUrl.toLowerCase(),
    );
    if (foundBond) {
      setSelectedBond(foundBond);
      setIsModalOpen(true);
    } else {
      setNotFound(true);
    }
  }, [isinFromUrl, bondsData]);

  useEffect(() => {
    setCurrentPage(pageFromUrl);
  }, [pageFromUrl]);

  useEffect(() => {
    if (!selectedBond) {
      setBondHistory([]);
      setHistoryError(null);
      setHistoryLoading(false);
      return;
    }

    let isCurrentRequest = true;
    setBondHistory([]);
    setHistoryError(null);
    setHistoryLoading(true);

    getBondHistoriesByIsin(selectedBond.isin)
      .then((history) => {
        if (isCurrentRequest) setBondHistory(history);
      })
      .catch(() => {
        if (isCurrentRequest) setHistoryError("Не удалось загрузить историю");
      })
      .finally(() => {
        if (isCurrentRequest) setHistoryLoading(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [selectedBond?.isin]);

  const displayBonds = useMemo(() => {
    if (searchType || searchIsin) {
      return serverBonds;
    }
    return bondsData;
  }, [serverBonds, bondsData, searchType, searchIsin]);

  const sortedBonds = useMemo(() => {
    if (!sortField || !sortDirection) return displayBonds;
    const direction = sortDirection === "asc" ? 1 : -1;
    return [...displayBonds].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal === null && bVal === null) return 0;
      if (aVal === null) return 1;
      if (bVal === null) return -1;
      if (typeof aVal === "number" && typeof bVal === "number")
        return (aVal - bVal) * direction;
      return String(aVal).localeCompare(String(bVal), "ru") * direction;
    });
  }, [displayBonds, sortField, sortDirection]);

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
    if (sortField !== field) {
      setSortField(field);
      setSortDirection("asc");
      return;
    }
    if (sortDirection === "asc") setSortDirection("desc");
    else if (sortDirection === "desc") {
      setSortField(null);
      setSortDirection(null);
    } else setSortDirection("asc");
  };

  const getSortIcon = (field: SortField): string => {
    if (sortField !== field) return "⇅";
    if (sortDirection === "asc") return "▲";
    if (sortDirection === "desc") return "▼";
    return "⇅";
  };

  const convertToSelected = (
    price: number,
    fromCurrency: string,
    toCurrency: string,
  ): number => {
    const fromRate = currencyRatesByCode[fromCurrency] ?? 1;
    const toRate = currencyRatesByCode[toCurrency] ?? 1;
    return (price * fromRate) / toRate;
  };

  const formatPrice = (bond: BondView): string => {
    const converted = convertToSelected(
      bond.price,
      bond.currency,
      selectedCurrency,
    );
    return `${formatBondNumber(converted)} ${selectedCurrency}`;
  };

  const handleImport = async () => {
    await fetchBondsInfo();
  };

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
    if (!selectedBond) return { labels: [], datasets: [emptyDataset] };

    const history = bondHistory
      .filter((h) => h.isin === selectedBond.isin)
      .filter((h) => Number.isFinite(Number(h.bondPrice)))
      .sort((a, b) => a.recordedDate.localeCompare(b.recordedDate));

    if (history.length === 0) return { labels: [], datasets: [emptyDataset] };

    return {
      labels: history.map((h) => h.recordedDate),
      datasets: [
        {
          ...emptyDataset,
          data: history.map((h) =>
            convertToSelected(Number(h.bondPrice), "RUB", selectedCurrency),
          ),
        },
      ],
    };
  }, [selectedBond, bondHistory, selectedCurrency, currencyRatesByCode]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: selectedBond
            ? `Динамика цены: ${selectedBond.name}`
            : "Выберите облигацию",
          font: { size: 16 },
          color: chartTextColor,
        },
      },
      scales: {
        x: {
          grid: { color: "rgba(127, 140, 160, 0.18)" },
          ticks: { color: chartMutedColor },
        },
        y: {
          grid: { color: "rgba(127, 140, 160, 0.18)" },
          ticks: {
            color: chartMutedColor,
            callback: (value: string | number) =>
              `${formatBondNumber(Number(value))} ${selectedCurrency}`,
          },
        },
      },
    }),
    [selectedBond, selectedCurrency, chartTextColor, chartMutedColor],
  );

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

  const selectedBondDetails: BondDetailRow[] = useMemo(() => {
    if (!selectedBond) return [];
    const rows: BondDetailRow[] = [
      { label: "ISIN", value: selectedBond.isin },
      { label: "Тип", value: BOND_TYPE_LABELS[selectedBond.type] },
      { label: "Цена", value: formatPrice(selectedBond), isHighlight: true },
    ];
    if (selectedBond.yield !== null)
      rows.push({ label: "Доходность", value: `${selectedBond.yield}%` });
    if (selectedBond.maturity)
      rows.push({ label: "Дата погашения", value: selectedBond.maturity });
    rows.push(
      { label: "Валюта", value: selectedBond.currency },
      { label: "Курс валюты", value: selectedBond.currencyRate },
      { label: "Дата курса", value: selectedBond.currencyRateDate },
      { label: "Обновлено", value: formatBondDateTime(selectedBond.updatedAt) },
    );
    const d = selectedBond.specificData;
    if (d) {
      if (selectedBond.type === "lse") {
        const s = d as LseSpecificData;
        rows.push(
          { label: "Сектор", value: s.sector },
          { label: "Символ", value: s.symbol },
          {
            label: "В листинге",
            value: formatBondNumber(s.listedQuantity ?? 0),
          },
          { label: "Номинал", value: formatBondNumber(s.nominalValue ?? 0) },
          { label: "Дата листинга", value: s.listingDate },
          { label: "Дата делистинга", value: s.delistingDate ?? "—" },
        );
      } else if (selectedBond.type === "wb") {
        const s = d as WbSpecificData;
        rows.push(
          { label: "Последняя цена", value: s.last },
          { label: "Изменение", value: s.chg },
          { label: "Дата", value: formatBondDateTime(s.date) },
          { label: "Bid", value: s.bid },
          { label: "Ask", value: s.ask },
          { label: "Погашение", value: s.maturity },
          { label: "Статус", value: s.status },
        );
      } else if (selectedBond.type === "sg") {
        const s = d as SgSpecificData;
        rows.push(
          { label: "Valor ID", value: s.valorId },
          { label: "Валюта торгов", value: s.tradingBaseCurrency },
          { label: "Купон", value: `${s.couponRate}%` },
          { label: "Погашение", value: s.maturityDate },
          { label: "Цена закрытия", value: s.closingPrice },
          { label: "Изм. за день", value: s.closingPerfomance },
          { label: "Bid", value: s.bidPrice },
          { label: "Ask", value: s.askPrice },
          { label: "Время торгов", value: s.marketTime },
          { label: "Дата торгов", value: s.marketDate },
          { label: "Эмитент", value: s.issuerNameFull },
          { label: "Продуктовая линия", value: s.productLine },
          { label: "Сектор (код)", value: s.industrySectorCode },
          { label: "Тип бумаги", value: s.secTypeCode },
          {
            label: "Объём выпуска",
            value: formatBondNumber(s.amountInIssue ?? 0),
          },
          { label: "Доходность к погашению", value: `${s.yieldToWorst}%` },
        );
      } else if (selectedBond.type === "me") {
        const s = d as MeSpecificData;
        rows.push(
          { label: "Тип бумаги", value: s.securityType },
          { label: "Sec ID", value: s.secId },
          { label: "Краткое имя", value: s.shortName },
          { label: "Рег. номер", value: s.regNumber },
          { label: "Торгуется", value: s.isTraded ? "Да" : "Нет" },
          { label: "Режим торгов", value: s.primaryBoardId },
          { label: "Рынок", value: s.market },
          { label: "Движок", value: s.engine },
          {
            label: "Номинал",
            value: `${formatBondNumber(s.faceValue)} ${s.faceUnit}`,
          },
        );
      }
    }
    return rows;
  }, [selectedBond, selectedCurrency]);

  const bondColumns: TableColumn<BondView>[] = [
    { key: "num", title: "№", render: (_item, rowNumber) => rowNumber },
    {
      key: "name",
      title: (
        <>
          Название{" "}
          <span className={styles.sortIcon}>{getSortIcon("name")}</span>
        </>
      ),
      onClick: () => handleSort("name"),
    },
    {
      key: "isin",
      title: (
        <>
          ISIN <span className={styles.sortIcon}>{getSortIcon("isin")}</span>
        </>
      ),
      onClick: () => handleSort("isin"),
      className: styles.isin,
    },
    {
      key: "type",
      title: (
        <>
          Тип <span className={styles.sortIcon}>{getSortIcon("type")}</span>
        </>
      ),
      onClick: () => handleSort("type"),
      render: (bond) => <StatusBadge variantType="type" value={bond.type} />,
    },
    {
      key: "price",
      title: (
        <>
          Цена{" "}
          <span className={styles.headerCurrency}>({selectedCurrency})</span>{" "}
          <span className={styles.sortIcon}>{getSortIcon("price")}</span>
        </>
      ),
      onClick: () => handleSort("price"),
      render: (bond) => formatPrice(bond),
    },
    {
      key: "yield",
      title: (
        <>
          Доходность{" "}
          <span className={styles.sortIcon}>{getSortIcon("yield")}</span>
        </>
      ),
      onClick: () => handleSort("yield"),
      render: (bond) =>
        bond.yield !== null ? (
          <StatusBadge variantType="yield" value={bond.yield} />
        ) : (
          "—"
        ),
    },
    {
      key: "maturity",
      title: (
        <>
          Дата погашения{" "}
          <span className={styles.sortIcon}>{getSortIcon("maturity")}</span>
        </>
      ),
      onClick: () => handleSort("maturity"),
      render: (bond) => bond.maturity ?? "—",
    },
  ];

  if (badRequest)
    return (
      <BadRequestPage
        message={badRequest}
        hint="Проверьте ISIN (12 символов)"
        returnPath="/bonds"
        returnLabel="Вернуться"
      />
    );
  if (notFound)
    return (
      <NotFoundPage
        isin={isinFromUrl || ""}
        returnPath="/bonds"
        returnLabel="Вернуться"
      />
    );
  if (loadError) {
    return (
      <div className={styles.bondsPage}>
        <ErrorCard
          icon="⚠️"
          title="Ошибка"
          message={loadError}
          retryLabel="Повторить"
          onRetry={() => fetchBondsInfo(true)}
        />
      </div>
    );
  }

  const searchAvailableTypes = typeBonds.map((type) => ({
    value: type,
    label: BOND_TYPE_LABELS[type],
  }));

  return (
    <div className={styles.bondsPage}>
      <ToastContainer
        position="top-end"
        className="p-3"
        style={{ position: "fixed", zIndex: 9999 }}
      >
        <Toast
          show={showSlowWarning}
          onClose={() => setShowSlowWarning(false)}
          bg="warning"
          delay={15000}
          autohide
        >
          <Toast.Header>
            <strong className="me-auto">
              ⏳ Загрузка занимает много времени
            </strong>
          </Toast.Header>
          <Toast.Body className="text-dark">
            Данных слишком много. Загрузка может занять больше минуты.
          </Toast.Body>
        </Toast>
        <Toast
          show={showEmptyWarning}
          onClose={() => setShowEmptyWarning(false)}
          bg="primary"
          delay={15000}
          autohide
        >
          <Toast.Header>
            <strong className="me-auto">📭 Облигаций нет в системе</strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            Упс, облигаций нет в системе. Обратитесь в поддержку.
          </Toast.Body>
        </Toast>
      </ToastContainer>

      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>📈 Облигации</h1>
        </div>
        <div className={styles.headerActions}>
          {isAdmin && (
            <OverlayTrigger
              placement="bottom"
              delay={{ show: 1500, hide: 0 }}
              overlay={<Tooltip>Импорт облигаций из CSV</Tooltip>}
            >
              <div>
                <ImportBonds onImport={handleImport} />
              </div>
            </OverlayTrigger>
          )}
          {isAuthenticated && (
            <OverlayTrigger
              placement="bottom"
              delay={{ show: 1500, hide: 0 }}
              overlay={<Tooltip>Экспорт облигаций в CSV</Tooltip>}
            >
              <div>
                <ExportBonds bonds={sortedBonds} filename="bonds" />
              </div>
            </OverlayTrigger>
          )}
        </div>
      </div>

      <section className={styles.tableSection}>
        <div className={styles.tableHeader}>
          <h2 className={styles.sectionTitle}>
            Список облигаций{" "}
            {!loading && !isSearching && `(${sortedBonds.length})`}
            {isSearching && " (поиск...)"}
          </h2>

          <Dropdown align="end">
            <Dropdown.Toggle
              variant="outline-info"
              id="currency-dropdown"
              size="sm"
            >
              💱 Валюта: {selectedCurrency}
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

        <SearchFilters
          searchType={searchType}
          searchIsin={searchIsin}
          onSearch={(type, isin) => {
            setSearchType(type);
            setSearchIsin(isin);
            handleServerSearch(type, isin);
          }}
          onReset={() => {
            setSearchType("");
            setSearchIsin("");
            setSortField(null);
            setSortDirection(null);
            setServerBonds([]);
            setSearchError(null);
          }}
          availableTypes={searchAvailableTypes}
          serverError={searchError}
        />

        <DataTable
          data={paginatedBonds}
          columns={bondColumns}
          keyExtractor={(bond) => `${bond.type}-${bond.id}`}
          onRowClick={handleBondClick}
          rowClassName={(bond) =>
            selectedBond?.id === bond.id && selectedBond?.type === bond.type
              ? styles.selectedRow
              : ""
          }
          emptyMessage={loading || isSearching ? "" : "Облигации не найдены"}
          startIndex={(safePage - 1) * pageSize + 1}
          isLoading={loading || isSearching}
        />

        {!loading && !isSearching && totalPages > 0 && (
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
        <Modal.Header
          closeButton
          closeVariant="white"
          className="border-secondary"
        >
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
                <div
                  style={{
                    height: "400px",
                    position: "relative",
                    marginTop: "16px",
                  }}
                >
                  {historyLoading ? (
                    <p>Загружаем историю облигации...</p>
                  ) : historyError ? (
                    <p role="alert">{historyError}</p>
                  ) : chartData.labels.length === 0 ? (
                    <p>История по этой облигации не найдена.</p>
                  ) : (
                    <LineChart
                      labels={chartData.labels}
                      datasets={chartData.datasets}
                      options={chartOptions}
                    />
                  )}
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
