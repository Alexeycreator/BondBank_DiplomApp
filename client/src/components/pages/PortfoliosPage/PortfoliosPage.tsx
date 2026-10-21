import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Modal,
  Button,
  Form,
  Tabs,
  Tab,
  Toast,
  ToastContainer,
  Spinner,
} from "react-bootstrap";
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
import { useAuth } from "../../context/AuthContext";
import { Portfolio, PortfolioType } from "../../types";
import styles from "./PortfoliosPage.module.css";
import { LineChart } from "../../charts/LineChart";
import { DoughnutChart } from "../../charts/DoughnutChart";
import { PortfolioCard } from "../../infoCards/PortfolioCard";
import { CreatePortfolioModal } from "../../portfolios/CreatePortfolioModal";
import { DataTable, TableColumn } from "../../table/DataTable";
import { SearchFilters } from "../../search/SearchFilters";
import { StatusBadge } from "../../infoCards/StatusBadge";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
);

interface PortfolioBond {
  name: string;
  isin: string;
  bondType: string;
  quantity: number;
  price: number;
  total: number;
  yield: number;
}

interface PortfolioHistory {
  date: string;
  totalValue: number;
  yield: number;
}

const PORTFOLIO_LIMITS: Record<
  PortfolioType,
  { maxBonds: number; maxYield: number; description: string }
> = {
  conservative: {
    maxBonds: 200,
    maxYield: 5,
    description: "Низкий риск, стабильный доход",
  },
  aggressive: {
    maxBonds: 300,
    maxYield: 15,
    description: "Высокий риск, высокая доходность",
  },
  balanced: {
    maxBonds: 500,
    maxYield: 10,
    description: "Средний риск и доходность",
  },
};

const PortfoliosPage = () => {
  const { hasCompleteProfile, user, isAdmin, isAuthenticated, login } =
    useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const urlParams = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      userId: params.get("userId"),
      portfolioId: params.get("portfolioId")
        ? Number(params.get("portfolioId"))
        : null,
    };
  }, [location.search]);

  // Состояния данных
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(
    null,
  );

  // Стейты для графиков и таблиц (пока пустые, будут заполняться с бэка)
  const [currentPortfolioBonds, setCurrentPortfolioBonds] = useState<
    Record<number, PortfolioBond[]>
  >({});
  const [historicalPortfolioBonds, setHistoricalPortfolioBonds] = useState<
    Record<string, Record<number, PortfolioBond[]>>
  >({});
  const [portfolioHistory, setPortfolioHistory] = useState<
    Record<number, PortfolioHistory[]>
  >({});

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [isRangeMode, setIsRangeMode] = useState<boolean>(false);
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );

  const [searchIsin, setSearchIsin] = useState<string>("");
  const [filterBondType, setFilterBondType] = useState<string>("");
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [selectedBondForModal, setSelectedBondForModal] =
    useState<PortfolioBond | null>(null);

  // Состояния для загрузки и уведомлений
  const [loading, setLoading] = useState(true);
  const [showSlowWarning, setShowSlowWarning] = useState(false);
  const [showEmptyWarning, setShowEmptyWarning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isMyPortfolio = urlParams.userId === user?.sub;

  // Загрузка данных (симуляция запроса к бэкенду)
  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setShowEmptyWarning(false);
    setShowSlowWarning(false);

    timerRef.current = setTimeout(() => {
      setShowSlowWarning(true);
    }, 5000);

    // TODO: Здесь должен быть реальный запрос к API (axios.get('/api/portfolios'))
    const fetchTimer = setTimeout(() => {
      // Пример, если бэкенд вернул пустой список:
      const loadedPortfolios: Portfolio[] = []; // Сюда придут данные

      setPortfolios(loadedPortfolios);
      setCurrentPortfolioBonds({});
      setHistoricalPortfolioBonds({});
      setPortfolioHistory({});

      if (loadedPortfolios.length === 0) {
        setShowEmptyWarning(true);
      }
      setLoading(false);
      if (timerRef.current) clearTimeout(timerRef.current);
    }, 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      clearTimeout(fetchTimer);
    };
  }, [isAuthenticated, user?.sub]);

  // Редирект, если в URL нет userId
  useEffect(() => {
    if (isAuthenticated && user?.sub && !urlParams.userId) {
      navigate(`/portfolios?userId=${user.sub}`, { replace: true });
    }
  }, [isAuthenticated, user?.sub, urlParams.userId, navigate]);

  // Выбор конкретного портфеля из URL
  useEffect(() => {
    if (!urlParams.portfolioId) {
      setSelectedPortfolio(null);
      return;
    }
    const found = portfolios.find(
      (p) =>
        p.id === urlParams.portfolioId &&
        String(p.userId) === String(urlParams.userId),
    );
    if (found) setSelectedPortfolio(found);
    else {
      setSelectedPortfolio(null);
      navigate(`/portfolios?userId=${urlParams.userId || user?.sub}`, {
        replace: true,
      });
    }
  }, [
    urlParams.portfolioId,
    urlParams.userId,
    portfolios,
    navigate,
    user?.sub,
  ]);

  const today = new Date().toISOString().split("T")[0];
  const isHistoricalView =
    selectedDate !== today || (isRangeMode && endDate !== today);

  const getFilteredHistory = (history: PortfolioHistory[]) => {
    if (isRangeMode)
      return history.filter((h) => h.date >= selectedDate && h.date <= endDate);
    return history.filter((h) => h.date === selectedDate);
  };

  const getSelectedBonds = (): PortfolioBond[] => {
    if (!selectedPortfolio) return [];
    if (isRangeMode) {
      const historical =
        historicalPortfolioBonds[endDate] ||
        historicalPortfolioBonds[selectedDate];
      if (historical && historical[selectedPortfolio.id])
        return historical[selectedPortfolio.id];
    } else if (isHistoricalView) {
      const historical = historicalPortfolioBonds[selectedDate];
      if (historical && historical[selectedPortfolio.id])
        return historical[selectedPortfolio.id];
    }
    return currentPortfolioBonds[selectedPortfolio.id] || [];
  };

  const getTotalQuantity = (portfolioId: number): number =>
    (isHistoricalView
      ? historicalPortfolioBonds[selectedDate]?.[portfolioId] || []
      : currentPortfolioBonds[portfolioId] || []
    ).reduce((sum, bond) => sum + bond.quantity, 0);

  const getBondsCount = (portfolioId: number): number =>
    (isHistoricalView
      ? historicalPortfolioBonds[selectedDate]?.[portfolioId] || []
      : currentPortfolioBonds[portfolioId] || []
    ).length;

  const getPortfolioValue = (portfolio: Portfolio) => {
    if (!isHistoricalView)
      return {
        value: portfolio.currentValue,
        yield: portfolio.currentYield,
        isHistorical: false,
      };
    const history = portfolioHistory[portfolio.id] || [];
    const filtered = getFilteredHistory(history);
    if (filtered.length > 0) {
      const lastDay = filtered[filtered.length - 1];
      return {
        value: lastDay.totalValue,
        yield: lastDay.yield,
        isHistorical: true,
      };
    }
    return { value: 0, yield: 0, isHistorical: true };
  };

  const getTypeDistribution = () => {
    const bonds = getSelectedBonds();
    const distribution: Record<string, number> = {};
    bonds.forEach((bond) => {
      distribution[bond.bondType] =
        (distribution[bond.bondType] || 0) + bond.quantity;
    });
    return distribution;
  };

  const formatPrice = (price: number): string =>
    `${price.toLocaleString("ru-RU")} ₽`;
  const formatDate = (dateStr: string): string =>
    new Date(dateStr).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  const filteredBonds = useMemo(() => {
    const bonds = getSelectedBonds();
    return bonds.filter((bond) => {
      const matchIsin =
        searchIsin === "" ||
        bond.isin.toLowerCase().includes(searchIsin.toLowerCase());
      const matchType =
        filterBondType === "" || bond.bondType === filterBondType;
      return matchIsin && matchType;
    });
  }, [
    selectedPortfolio,
    selectedDate,
    endDate,
    isRangeMode,
    searchIsin,
    filterBondType,
    currentPortfolioBonds,
    historicalPortfolioBonds,
  ]);

  const handleCreatePortfolio = (data: {
    name: string;
    description: string;
    type: PortfolioType;
  }) => {
    const newId =
      portfolios.length > 0 ? Math.max(...portfolios.map((p) => p.id)) + 1 : 1;
    const portfolioToAdd: Portfolio = {
      id: newId,
      userId: user?.sub || "",
      name: data.name,
      description: data.description || undefined,
      type: data.type,
      currentValue: 0,
      currentYield: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setPortfolios([...portfolios, portfolioToAdd]);
    setShowCreateModal(false);
    navigate(
      `/portfolios?userId=${portfolioToAdd.userId}&portfolioId=${portfolioToAdd.id}`,
      { replace: true },
    );
  };

  const handleOpenPortfolio = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio);
    navigate(
      `/portfolios?userId=${portfolio.userId}&portfolioId=${portfolio.id}`,
      { replace: true },
    );
  };

  const handleClosePortfolio = () => {
    setSelectedPortfolio(null);
    navigate(`/portfolios?userId=${urlParams.userId || user?.sub}`, {
      replace: true,
    });
  };

  const handleBondClick = (bond: PortfolioBond) => {
    setSelectedBondForModal(bond);
  };

  const rawHistory = selectedPortfolio
    ? portfolioHistory[selectedPortfolio.id] || []
    : [];
  const history = getFilteredHistory(rawHistory);

  const valueLabels = history.map(
    (h) => `${new Date(h.date).getDate()}.${new Date(h.date).getMonth() + 1}`,
  );
  const valueDatasets = [
    {
      label: "Стоимость портфеля (₽)",
      data: history.map((h) => h.totalValue),
      borderColor: isHistoricalView ? "#ff9800" : "#2ecc71",
      backgroundColor: isHistoricalView
        ? "rgba(255, 152, 0, 0.1)"
        : "rgba(46, 204, 113, 0.1)",
      fill: true,
      tension: 0.3,
      pointBackgroundColor: history.map((h) =>
        h.date === selectedDate
          ? "#e74c3c"
          : isHistoricalView
            ? "#ff9800"
            : "#2ecc71",
      ),
      pointRadius: history.map((h) => (h.date === selectedDate ? 8 : 4)),
      pointHoverRadius: 10,
    },
  ];
  const yieldDatasets = [
    {
      label: "Доходность портфеля (%)",
      data: history.map((h) => Number(h.yield.toFixed(2))),
      borderColor: "#4fc3f7",
      backgroundColor: "rgba(79, 195, 247, 0.1)",
      fill: true,
      tension: 0.3,
    },
  ];
  const distribution = getTypeDistribution();
  const doughnutLabels = Object.keys(distribution).map((t) => t.toUpperCase());
  const doughnutData = Object.values(distribution);

  const portfolioColumns: TableColumn<PortfolioBond>[] = [
    { key: "name", title: "Название", render: (bond) => bond.name },
    {
      key: "isin",
      title: "ISIN",
      render: (bond) => <span className={styles.isin}>{bond.isin}</span>,
    },
    {
      key: "type",
      title: "Тип",
      render: (bond) => (
        <StatusBadge variantType="type" value={bond.bondType} />
      ),
    },
    { key: "quantity", title: "Количество", render: (bond) => bond.quantity },
    { key: "price", title: "Цена", render: (bond) => bond.price },
    {
      key: "yield",
      title: "Доходность",
      render: (bond) => <StatusBadge variantType="yield" value={bond.yield} />,
    },
    { key: "total", title: "Итого", render: (bond) => bond.total.toFixed(2) },
  ];

  if (!isAuthenticated) {
    return (
      <div className={styles.warningPage}>
        <div className={styles.warningCard}>
          <div className={styles.warningIcon}>🔒</div>
          <h1 className={styles.warningTitle}>Требуется авторизация</h1>
          <p className={styles.warningText}>
            Чтобы просматривать портфели и управлять ими, пожалуйста, войдите в
            систему.
          </p>
          <button className={styles.warningButton} onClick={() => login()}>
            Войти / Зарегистрироваться
          </button>
        </div>
      </div>
    );
  }

  if (!hasCompleteProfile) {
    return (
      <div className={styles.warningPage}>
        <div className={styles.warningCard}>
          <div className={styles.warningIcon}>⚠️</div>
          <h1 className={styles.warningTitle}>Профиль не заполнен</h1>
          <p className={styles.warningText}>
            Чтобы создавать портфели, необходимо заполнить паспортные данные,
            ИНН и СНИЛС.
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

  const userPortfolios = portfolios.filter(
    (p) => String(p.userId) === String(user?.sub),
  );

  return (
    <div className={styles.portfoliosPage}>
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
            Данных слишком много. Пожалуйста, подождите.
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
            <strong className="me-auto">📭 Портфелей не найдено</strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            У вас пока нет портфелей. Создайте свой первый портфель, нажав на
            кнопку выше!
          </Toast.Body>
        </Toast>
      </ToastContainer>

      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>🏦 Портфели</h1>
        </div>
        <button
          className={styles.createPortfolioButton}
          onClick={() => setShowCreateModal(true)}
        >
          + Создать портфель
        </button>
      </div>

      <section className={styles.dateSection}>
        <div className={styles.dateControlsWrapper}>
          <label htmlFor="datePicker" className={styles.dateLabel}>
            📅 {isRangeMode ? "Начало:" : "Просмотр на дату:"}
          </label>
          <input
            id="datePicker"
            type="date"
            value={selectedDate}
            max={today}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              if (isRangeMode && e.target.value > endDate)
                setEndDate(e.target.value);
            }}
            className={styles.dateInput}
          />
          {isRangeMode && (
            <>
              <label
                htmlFor="endDatePicker"
                className={styles.dateLabel}
                style={{ marginLeft: "12px" }}
              >
                по:
              </label>
              <input
                id="endDatePicker"
                type="date"
                value={endDate}
                min={selectedDate}
                max={today}
                onChange={(e) => setEndDate(e.target.value)}
                className={styles.dateInput}
              />
            </>
          )}
          <Form.Check
            type="switch"
            id="range-switch"
            label="Выбрать диапазон"
            checked={isRangeMode}
            onChange={(e) => {
              setIsRangeMode(e.target.checked);
              if (!e.target.checked) setEndDate(selectedDate);
            }}
            className={styles.rangeSwitch}
          />
        </div>
        {isHistoricalView && (
          <>
            <span className={styles.historicalBadge}>
              Исторические данные: {formatDate(selectedDate)}
              {isRangeMode && ` — ${formatDate(endDate)}`}
            </span>
            <button
              className={styles.resetDateButton}
              onClick={() => {
                setSelectedDate(today);
                setEndDate(today);
                setIsRangeMode(false);
              }}
            >
              🔄 Вернуться на сегодня
            </button>
          </>
        )}
      </section>

      <section className={styles.portfoliosSection}>
        <h2 className={styles.sectionTitle}>
          {isAdmin && !isMyPortfolio ? `Портфели пользователя` : "Мои портфели"}{" "}
          ({userPortfolios.length})
        </h2>

        <div className={styles.portfolioGrid}>
          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                padding: "50px",
                gridColumn: "1 / -1",
              }}
            >
              <Spinner animation="border" variant="info" />
            </div>
          ) : userPortfolios.length > 0 ? (
            userPortfolios.map((portfolio) => {
              const totalQuantity = getTotalQuantity(portfolio.id);
              const {
                value,
                yield: pYield,
                isHistorical,
              } = getPortfolioValue(portfolio);
              return (
                <PortfolioCard
                  key={portfolio.id}
                  portfolio={portfolio}
                  totalQuantity={totalQuantity}
                  currentValue={value}
                  currentYield={pYield}
                  isHistorical={isHistorical}
                  isActive={selectedPortfolio?.id === portfolio.id}
                  onOpen={handleOpenPortfolio}
                />
              );
            })
          ) : (
            <div
              style={{
                gridColumn: "1 / -1",
                textAlign: "center",
                padding: "60px",
                background: "rgba(255,255,255,0.05)",
                borderRadius: "12px",
                border: "1px dashed rgba(255,255,255,0.2)",
              }}
            >
              <h3 style={{ color: "#a0aabf", marginBottom: "10px" }}>
                У вас пока нет портфелей
              </h3>
              <p style={{ color: "#6c757d" }}>
                Нажмите кнопку <b>«+ Создать портфель»</b> выше, чтобы начать
                инвестировать.
              </p>
            </div>
          )}
        </div>
      </section>

      <CreatePortfolioModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreatePortfolio}
        existingNames={userPortfolios.map((p) => p.name)}
        userId={user?.sub || ""}
      />

      {selectedPortfolio && (
        <section className={styles.detailsSection}>
          <div className={styles.detailsHeader}>
            <div>
              <h2 className={styles.sectionTitle}>
                Портфель: {selectedPortfolio.name}
                {isHistoricalView && (
                  <span className={styles.historicalDate}>
                    {" "}
                    — на{" "}
                    {isRangeMode
                      ? `${formatDate(selectedDate)} - ${formatDate(endDate)}`
                      : formatDate(selectedDate)}
                  </span>
                )}
              </h2>
              {isAdmin &&
                String(selectedPortfolio.userId) !== String(user?.sub) && (
                  <p className={styles.ownerInfo}>
                    👤 Владелец: пользователь (ID: {selectedPortfolio.userId})
                  </p>
                )}
            </div>
            <div className={styles.detailsActions}>
              {isHistoricalView && (
                <button
                  className={styles.todayButton}
                  onClick={() => {
                    setSelectedDate(today);
                    setEndDate(today);
                    setIsRangeMode(false);
                  }}
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

          <Tabs
            defaultActiveKey="overview"
            id="portfolio-tabs"
            className="custom-tabs mb-4"
            fill
          >
            <Tab eventKey="overview" title="📊 Обзор">
              <div className="pt-3">
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
                      {isHistoricalView
                        ? "Доходность на дату"
                        : "Доходность сегодня"}
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

                <div className={styles.limitsInfo}>
                  <p>
                    <strong>Лимит портфеля:</strong>{" "}
                    {getTotalQuantity(selectedPortfolio.id)} /{" "}
                    {PORTFOLIO_LIMITS[selectedPortfolio.type].maxBonds} шт.
                    (можно добавить{" "}
                    {PORTFOLIO_LIMITS[selectedPortfolio.type].maxBonds -
                      getTotalQuantity(selectedPortfolio.id)}{" "}
                    шт.)
                  </p>
                  <p>
                    <strong>Максимальная доходность:</strong>{" "}
                    {PORTFOLIO_LIMITS[selectedPortfolio.type].maxYield}%
                  </p>
                </div>

                <div className={styles.chartsLayout}>
                  <div className={styles.chartsLeft}>
                    <div className={styles.chartCard}>
                      <p className={styles.chartHint}>
                        💡 Нажмите на точку, чтобы переключиться на дату
                      </p>
                      <LineChart
                        labels={valueLabels}
                        datasets={valueDatasets}
                        options={{
                          onClick: (_event: any, elements: any[]) => {
                            if (elements.length > 0) {
                              const index = elements[0].index;
                              if (history[index])
                                setSelectedDate(history[index].date);
                            }
                          },
                          plugins: {
                            tooltip: {
                              callbacks: {
                                label: (context: any) =>
                                  `Стоимость: ${Number(context.raw).toLocaleString("ru-RU")} ₽`,
                              },
                            },
                          },
                          scales: {
                            y: {
                              ticks: {
                                callback: (value: string | number) =>
                                  `${Number(value).toLocaleString("ru-RU")} ₽`,
                              },
                            },
                          },
                        }}
                      />
                    </div>
                    <div className={styles.chartCard}>
                      <LineChart
                        labels={valueLabels}
                        datasets={yieldDatasets}
                        options={{
                          scales: {
                            y: {
                              ticks: {
                                callback: (value: string | number) =>
                                  `${value}%`,
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                  <div className={styles.chartsRight}>
                    <div className={styles.chartCard}>
                      <DoughnutChart
                        labels={doughnutLabels}
                        data={doughnutData}
                        options={{
                          plugins: {
                            title: {
                              display: true,
                              text: "Распределение по типам облигаций",
                              color: "#ffffff",
                              font: { size: 14 },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Tab>

            <Tab eventKey="bonds" title="📋 Облигации">
              <div className="pt-3">
                <SearchFilters
                  searchType={filterBondType}
                  searchIsin={searchIsin}
                  onTypeChange={setFilterBondType}
                  onIsinChange={setSearchIsin}
                  onReset={() => {
                    setSearchIsin("");
                    setFilterBondType("");
                  }}
                  availableTypes={[
                    { value: "lse", label: "LSE (Любляна)" },
                    { value: "wb", label: "WB (Вена)" },
                    { value: "sg", label: "SG (Швейцария)" },
                    { value: "me", label: "ME (Москва)" },
                  ]}
                />

                <div className={styles.filteredCount}>
                  Найдено: <strong>{filteredBonds.length}</strong> из{" "}
                  {getSelectedBonds().length}
                </div>

                <h3 className={styles.subsectionTitle}>
                  Список облигаций в портфеле
                  {isHistoricalView && (
                    <span className={styles.historicalDate}>
                      {" "}
                      (на {formatDate(selectedDate)})
                    </span>
                  )}
                </h3>
                <p className={styles.tableHint}>
                  💡 Нажмите на строку, чтобы открыть карточку облигации
                </p>

                <DataTable
                  data={filteredBonds}
                  columns={portfolioColumns}
                  keyExtractor={(bond) => bond.isin}
                  onRowClick={handleBondClick}
                  emptyMessage={
                    getSelectedBonds().length === 0
                      ? "В портфеле пока нет облигаций."
                      : "По вашему запросу ничего не найдено"
                  }
                />
              </div>
            </Tab>
          </Tabs>
        </section>
      )}

      <Modal
        show={!!selectedBondForModal}
        onHide={() => setSelectedBondForModal(null)}
        centered
        scrollable
        contentClassName="bg-dark text-white border-secondary"
      >
        <Modal.Header
          closeButton
          closeVariant="white"
          className="border-secondary"
        >
          <Modal.Title>{selectedBondForModal?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBondForModal && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #2d3b5e",
                  paddingBottom: "8px",
                }}
              >
                <span style={{ color: "#a0aabf" }}>ISIN:</span>
                <span>{selectedBondForModal.isin}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #2d3b5e",
                  paddingBottom: "8px",
                }}
              >
                <span style={{ color: "#a0aabf" }}>Тип:</span>
                <StatusBadge
                  variantType="type"
                  value={selectedBondForModal.bondType}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #2d3b5e",
                  paddingBottom: "8px",
                }}
              >
                <span style={{ color: "#a0aabf" }}>Количество:</span>
                <span>{selectedBondForModal.quantity} шт.</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #2d3b5e",
                  paddingBottom: "8px",
                }}
              >
                <span style={{ color: "#a0aabf" }}>Цена:</span>
                <span>{selectedBondForModal.price} ₽</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #2d3b5e",
                  paddingBottom: "8px",
                }}
              >
                <span style={{ color: "#a0aabf" }}>Доходность:</span>
                <StatusBadge
                  variantType="yield"
                  value={selectedBondForModal.yield}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingBottom: "8px",
                }}
              >
                <span style={{ color: "#a0aabf" }}>Итого:</span>
                <span
                  style={{
                    color: "#4fc3f7",
                    fontWeight: "bold",
                    fontSize: "18px",
                  }}
                >
                  {selectedBondForModal.total.toFixed(2)} ₽
                </span>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-secondary">
          <Button
            variant="outline-secondary"
            onClick={() => setSelectedBondForModal(null)}
          >
            Закрыть
          </Button>
          <Button
            variant="info"
            className="text-dark fw-bold"
            onClick={() =>
              navigate(`/bonds?isin=${selectedBondForModal?.isin}`)
            }
          >
            Перейти на страницу облигации
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PortfoliosPage;
