import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Toast, ToastContainer } from "react-bootstrap";
import { useAuth } from "../../../shared/auth/AuthContext";
import {
  Portfolio,
  PortfolioBond,
  PortfolioHistory,
  PortfolioType,
} from "../../../entities/portfolio/model/types";
import styles from "./PortfoliosPage.module.css";
import { CreatePortfolioModal } from "../../../features/portfolio/create/ui/CreatePortfolioModal";
import { PortfolioBondDetailsModal } from "../../../features/portfolio/view-bond/ui/PortfolioBondDetailsModal";
import PortfolioDetails from "./PortfolioDetails";
import PortfolioDateControls from "./PortfolioDateControls";
import PortfolioListSection from "./PortfolioListSection";
import { useUrlQuery } from "../../../shared/lib/routing/useUrlQuery";
import {
  MOCK_CURRENT_PORTFOLIO_BONDS,
  MOCK_HISTORICAL_PORTFOLIO_BONDS,
  MOCK_PORTFOLIO_HISTORY,
  MOCK_PORTFOLIOS,
} from "../model/mock-data";

const PortfoliosPage = () => {
  const { hasCompleteProfile, user, isAdmin, isAuthenticated, login } =
    useAuth();
  const navigate = useNavigate();
  const { searchParams, updateParams } = useUrlQuery();

  const urlParams = useMemo(() => {
    return {
      userId: searchParams.get("userId"),
      portfolioId: searchParams.get("portfolioId")
        ? Number(searchParams.get("portfolioId"))
        : null,
    };
  }, [searchParams]);

  // Состояния данных
  const [portfolios, setPortfolios] = useState<Portfolio[]>(MOCK_PORTFOLIOS);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(
    null,
  );

  // Стейты для графиков и таблиц (пока пустые, будут заполняться с бэка)
  const [currentPortfolioBonds, setCurrentPortfolioBonds] = useState<
    Record<number, PortfolioBond[]>
  >(MOCK_CURRENT_PORTFOLIO_BONDS);
  const [historicalPortfolioBonds, setHistoricalPortfolioBonds] = useState<
    Record<string, Record<number, PortfolioBond[]>>
  >(MOCK_HISTORICAL_PORTFOLIO_BONDS);
  const [portfolioHistory, setPortfolioHistory] = useState<
    Record<number, PortfolioHistory[]>
  >(MOCK_PORTFOLIO_HISTORY);

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
      const loadedPortfolios = MOCK_PORTFOLIOS;

      setPortfolios(loadedPortfolios);
      setCurrentPortfolioBonds(MOCK_CURRENT_PORTFOLIO_BONDS);
      setHistoricalPortfolioBonds(MOCK_HISTORICAL_PORTFOLIO_BONDS);
      setPortfolioHistory(MOCK_PORTFOLIO_HISTORY);

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
      updateParams({ userId: user.sub, portfolioId: null });
    }
  }, [isAuthenticated, user?.sub, urlParams.userId, updateParams]);

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
      updateParams({ portfolioId: null });
    }
  }, [
    urlParams.portfolioId,
    urlParams.userId,
    portfolios,
    updateParams,
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
    updateParams({
      userId: String(portfolioToAdd.userId),
      portfolioId: String(portfolioToAdd.id),
    });
  };

  const handleOpenPortfolio = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio);
    updateParams({
      userId: String(portfolio.userId),
      portfolioId: String(portfolio.id),
    });
  };

  const handleClosePortfolio = () => {
    setSelectedPortfolio(null);
    updateParams({
      userId: urlParams.userId || user?.sub || null,
      portfolioId: null,
    });
  };

  const handleBondClick = (bond: PortfolioBond) => {
    setSelectedBondForModal(bond);
  };

  const rawHistory = selectedPortfolio
    ? portfolioHistory[selectedPortfolio.id] || []
    : [];
  const history = getFilteredHistory(rawHistory);

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

      <PortfolioDateControls
        selectedDate={selectedDate}
        endDate={endDate}
        today={today}
        isRangeMode={isRangeMode}
        isHistoricalView={isHistoricalView}
        onDateChange={setSelectedDate}
        onEndDateChange={setEndDate}
        onRangeModeChange={(enabled) => {
          setIsRangeMode(enabled);
          if (!enabled) setEndDate(selectedDate);
        }}
        onReset={() => {
          setSelectedDate(today);
          setEndDate(today);
          setIsRangeMode(false);
        }}
        formatDate={formatDate}
      />

      <PortfolioListSection
        portfolios={userPortfolios}
        isOtherUser={isAdmin && !isMyPortfolio}
        loading={loading}
        selectedPortfolio={selectedPortfolio}
        getTotalQuantity={getTotalQuantity}
        getPortfolioValue={getPortfolioValue}
        onOpenPortfolio={handleOpenPortfolio}
      />

      <CreatePortfolioModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreatePortfolio}
        existingNames={userPortfolios.map((p) => p.name)}
      />

      {selectedPortfolio && (
        <PortfolioDetails
          portfolio={selectedPortfolio}
          ownerUserId={user?.sub}
          isAdmin={isAdmin}
          isHistoricalView={isHistoricalView}
          selectedDate={selectedDate}
          endDate={endDate}
          isRangeMode={isRangeMode}
          history={history}
          totalQuantity={getTotalQuantity(selectedPortfolio.id)}
          bondsCount={getBondsCount(selectedPortfolio.id)}
          currentValue={getPortfolioValue(selectedPortfolio).value}
          currentYield={getPortfolioValue(selectedPortfolio).yield}
          filteredBonds={filteredBonds}
          selectedBondsCount={getSelectedBonds().length}
          searchIsin={searchIsin}
          filterBondType={filterBondType}
          onSearchIsinChange={setSearchIsin}
          onFilterBondTypeChange={setFilterBondType}
          onResetFilters={() => {
            setSearchIsin("");
            setFilterBondType("");
          }}
          onDateChange={setSelectedDate}
          onResetDates={() => {
            setSelectedDate(today);
            setEndDate(today);
            setIsRangeMode(false);
          }}
          onClose={handleClosePortfolio}
          onBondClick={handleBondClick}
          getTypeDistribution={getTypeDistribution}
          formatDate={formatDate}
          formatPrice={formatPrice}
        />
      )}

      <PortfolioBondDetailsModal
        bond={selectedBondForModal}
        onClose={() => setSelectedBondForModal(null)}
        onOpenBond={(isin) => navigate(`/bonds?isin=${isin}`)}
      />
    </div>
  );
};

export default PortfoliosPage;
