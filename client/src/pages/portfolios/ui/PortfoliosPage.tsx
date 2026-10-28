import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import { useAuth } from "../../../shared/auth/AuthContext";
import { useUrlQuery } from "../../../shared/lib/routing/useUrlQuery";
import { useMyPortfolios } from "../../../entities/portfolio/model/useMyPortfolios";
import { useToast } from "../../../shared/notifications/ToastContext";
import { getBondsInfo } from "../../../entities/bond/api/bondsApi";
import { getPortfolioHistory } from "../../../entities/portfolio/api/portfoliosApi";
import { PortfolioHistoryDto } from "../../../entities/portfolio/model/api-types";
import { BondView } from "../../../entities/bond/model/bonds";
import { mapBondsInfoToViews, formatBondNumber } from "../../../entities/bond/model/bond-mappers";
import { PortfolioCharts } from "../../../widgets/portfolio-charts/ui/PortfolioCharts";
import { DataTable, TableColumn } from "../../../shared/ui/data-table/DataTable";
import { StatusBadge } from "../../../shared/ui/status-badge/StatusBadge";
import { ApiRequestError } from "../../../shared/api/client";
import styles from "./PortfoliosPage.module.css";

interface PortfolioHistoryPoint {
  id: number;
  date: string;
  totalValue: number;
  yield: number;
}

const formatDate = (date: string): string => {
  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime())
    ? date
    : parsedDate.toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
};

const formatPrice = (price: number): string =>
  `${price.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽`;

const getErrorMessage = (error: unknown): string =>
  error instanceof ApiRequestError
    ? error.serverMessage || error.message
    : error instanceof Error
      ? error.message
      : "Не удалось загрузить данные";

const PortfoliosPage = () => {
  const { hasCompleteProfile, isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const { searchParams, updateParams } = useUrlQuery();
  const { showToast } = useToast();
  const { portfolios, isLoading, error, reload } = useMyPortfolios(isAuthenticated);
  const [history, setHistory] = useState<PortfolioHistoryPoint[]>([]);
  const [portfolioBonds, setPortfolioBonds] = useState<BondView[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [selectedHistoryDate, setSelectedHistoryDate] = useState<string | null>(null);

  const selectedPortfolioId = useMemo(() => {
    const id = Number(searchParams.get("portfolioId"));
    return Number.isInteger(id) && id > 0 ? id : null;
  }, [searchParams]);
  const selectedPortfolio = portfolios.find((portfolio) => portfolio.id === selectedPortfolioId) ?? null;

  useEffect(() => {
    if (!selectedPortfolio) {
      setHistory([]);
      setPortfolioBonds([]);
      setDetailsError(null);
      setDetailsLoading(false);
      setSelectedHistoryDate(null);
      return;
    }

    let isCurrent = true;
    setDetailsLoading(true);
    setDetailsError(null);
    setSelectedHistoryDate(null);
    setHistory([]);
    setPortfolioBonds([]);

    void Promise.allSettled([
      getPortfolioHistory(selectedPortfolio.id),
      getBondsInfo(),
    ]).then(([historyResult, bondsResult]) => {
      if (!isCurrent) return;
      const errors: string[] = [];

      if (historyResult.status === "fulfilled") {
        const historyPoints: PortfolioHistoryPoint[] = historyResult.value
          .map((point: PortfolioHistoryDto) => ({
            id: point.id,
            date: point.dateSavePortfolioUser.slice(0, 10),
            totalValue: Number(point.totalValue),
            yield: Number(point.totalYield),
          }))
          .sort((a, b) => a.date.localeCompare(b.date));
        setHistory(historyPoints);
        setSelectedHistoryDate(historyPoints.at(-1)?.date ?? null);
      } else {
        errors.push(`История: ${getErrorMessage(historyResult.reason)}`);
      }

      if (bondsResult.status === "fulfilled") {
        setPortfolioBonds(mapBondsInfoToViews({
          ...bondsResult.value,
          bondsByTable: bondsResult.value.bondsByTable.filter(
            (bond) => bond.bond?.portfoliosId === selectedPortfolio.id,
          ),
        }));
      } else {
        errors.push(`Состав: ${getErrorMessage(bondsResult.reason)}`);
      }

      if (errors.length > 0) setDetailsError(errors.join(" · "));
    }).catch((requestError: unknown) => {
      if (!isCurrent) return;
      setDetailsError(getErrorMessage(requestError));
    }).finally(() => {
      if (isCurrent) setDetailsLoading(false);
    });

    return () => {
      isCurrent = false;
    };
  }, [selectedPortfolio?.id]);

  const selectedHistory = history.find((point) => point.date === selectedHistoryDate)
    ?? history.at(-1)
    ?? null;
  const portfolioHistory = useMemo(
    () => history.map((point) => ({
      date: point.date,
      totalValue: point.totalValue,
      yield: point.yield,
    })),
    [history],
  );

  const bondColumns: TableColumn<BondView>[] = [
    { key: "name", title: "Облигация", render: (bond) => bond.name },
    { key: "isin", title: "ISIN", render: (bond) => <span className={styles.portfolioIsin}>{bond.isin}</span> },
    { key: "type", title: "Тип", render: (bond) => <StatusBadge variantType="type" value={bond.type} /> },
    { key: "price", title: "Цена", render: (bond) => `${formatBondNumber(bond.price)} ${bond.currency}` },
    { key: "yield", title: "Доходность", render: (bond) => bond.yield === null ? "—" : <StatusBadge variantType="yield" value={bond.yield} /> },
    { key: "updatedAt", title: "Обновлено", render: (bond) => formatDate(bond.updatedAt) },
  ];

  if (!isAuthenticated) {
    return (
      <div className={styles.warningPage}>
        <div className={styles.warningCard}>
          <div className={styles.warningIcon}>🔒</div>
          <h1 className={styles.warningTitle}>Требуется авторизация</h1>
          <p className={styles.warningText}>Войдите, чтобы просматривать свои портфели.</p>
          <button className={styles.warningButton} onClick={login}>Войти / Зарегистрироваться</button>
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
          <p className={styles.warningText}>Для доступа к портфелям необходимо заполнить профиль.</p>
          <button className={styles.warningButton} onClick={() => navigate("/profile")}>Перейти в профиль</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.portfoliosPage}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>🏦 Портфели</h1>
          <p className={styles.pageDescription}>Состав и динамика стоимости по данным портфеля и истории из БД.</p>
        </div>
        <button
          className={styles.createPortfolioButton}
          onClick={() => showToast("Недоступно", "Сервер пока не предоставляет API для создания портфеля.", "info")}
        >
          + Создать портфель
        </button>
      </div>

      {isLoading ? (
        <div className={styles.portfolioLoading}><Spinner animation="border" variant="info" role="status" /></div>
      ) : error ? (
        <div className={styles.warningCard} role="alert">
          <h2 className={styles.warningTitle}>Не удалось загрузить портфели</h2>
          <p className={styles.warningText}>{error}</p>
          <button className={styles.metadataButton} onClick={reload}>Повторить загрузку</button>
        </div>
      ) : portfolios.length === 0 ? (
        <div className={styles.warningCard}>
          <h2 className={styles.warningTitle}>Портфелей пока нет</h2>
          <p className={styles.warningText}>Сервер не вернул портфели для этого пользователя.</p>
        </div>
      ) : (
        <section className={styles.portfoliosSection}>
          <h2 className={styles.sectionTitle}>Мои портфели ({portfolios.length})</h2>
          <div className={styles.portfolioGrid}>
            {portfolios.map((portfolio) => (
              <article
                key={portfolio.id}
                className={`${styles.portfolioItem} ${selectedPortfolioId === portfolio.id ? styles.portfolioItemSelected : ""}`}
              >
                <h3>{portfolio.name}</h3>
                <p>ID портфеля: {portfolio.id}</p>
                <button
                  className={styles.metadataButton}
                  onClick={() => updateParams({ portfolioId: String(portfolio.id) })}
                  aria-expanded={selectedPortfolioId === portfolio.id}
                >
                  {selectedPortfolioId === portfolio.id ? "Открыт" : "История и состав"}
                </button>
              </article>
            ))}
          </div>
        </section>
      )}

      {selectedPortfolio && (
        <section className={styles.portfolioDetails}>
          <div className={styles.portfolioDetailsHeader}>
            <div>
              <h2 className={styles.sectionTitle}>{selectedPortfolio.name}</h2>
              <p className={styles.pageDescription}>История портфеля из БД и текущее закрепление облигаций.</p>
            </div>
            <button className={styles.metadataButton} onClick={() => updateParams({ portfolioId: null })}>
              Закрыть
            </button>
          </div>

          {detailsLoading ? (
            <div className={styles.portfolioLoading}><Spinner animation="border" variant="info" role="status" /></div>
          ) : (
            <>
              {detailsError && (
                <div className={styles.warningCard} role="alert">
                  <p className={styles.warningText}>{detailsError}</p>
                </div>
              )}
              <div className={styles.portfolioStats}>
                <div className={styles.portfolioStat}>
                  <span>Стоимость на выбранную дату</span>
                  <strong>{formatPrice(selectedHistory?.totalValue ?? 0)}</strong>
                </div>
                <div className={styles.portfolioStat}>
                  <span>Доходность</span>
                  <strong>{selectedHistory ? `${selectedHistory.yield.toFixed(2)}%` : "—"}</strong>
                </div>
                <div className={styles.portfolioStat}>
                  <span>Дата значения</span>
                  <strong>{selectedHistory ? formatDate(selectedHistory.date) : "—"}</strong>
                </div>
                <div className={styles.portfolioStat}>
                  <span>Облигаций в портфеле</span>
                  <strong>{portfolioBonds.length}</strong>
                </div>
              </div>

              {history.length > 0 ? (
                <>
                  <div className={styles.portfolioChart}>
                    <PortfolioCharts
                      selectedPortfolio={selectedPortfolio}
                      portfolioHistory={{ [selectedPortfolio.id]: portfolioHistory }}
                      selectedDate={selectedHistoryDate ?? ""}
                      isHistoricalView={false}
                      onDateChange={setSelectedHistoryDate}
                      getTypeDistribution={() => portfolioBonds.reduce<Record<string, number>>((distribution, bond) => {
                        distribution[bond.type] = (distribution[bond.type] ?? 0) + 1;
                        return distribution;
                      }, {})}
                    />
                  </div>
                  <h3 className={styles.subsectionTitle}>История портфеля</h3>
                  <div className={styles.historyTable}>
                    <DataTable
                      data={history}
                      columns={[
                        { key: "date", title: "Дата", render: (point) => formatDate(point.date) },
                        { key: "totalValue", title: "Стоимость", render: (point) => formatPrice(point.totalValue) },
                        { key: "yield", title: "Доходность", render: (point) => `${point.yield.toFixed(2)}%` },
                      ]}
                      keyExtractor={(point) => point.id}
                      onRowClick={(point) => setSelectedHistoryDate(point.date)}
                      rowClassName={(point) => point.date === selectedHistoryDate ? styles.selectedHistoryRow : ""}
                      emptyMessage="История портфеля пока не содержит записей."
                    />
                  </div>
                </>
              ) : (
                <div className={styles.warningCard}>
                  <p className={styles.warningText}>В таблице истории пока нет записей для этого портфеля.</p>
                </div>
              )}

              <h3 className={styles.subsectionTitle}>Текущий состав портфеля</h3>
              <DataTable
                data={portfolioBonds}
                columns={bondColumns}
                keyExtractor={(bond) => bond.id}
                emptyMessage="В текущем составе портфеля нет облигаций."
              />
            </>
          )}
        </section>
      )}
    </div>
  );
};

export default PortfoliosPage;
