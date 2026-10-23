import { Tab, Tabs } from "react-bootstrap";
import { PORTFOLIO_OPTIONS } from "../../../entities/portfolio/model/portfolio-options";
import {
  Portfolio,
  PortfolioBond,
  PortfolioHistory,
} from "../../../entities/portfolio/model/types";
import { PortfolioCharts } from "../../../widgets/portfolio-charts/ui/PortfolioCharts";
import { DataTable, TableColumn } from "../../../shared/ui/data-table/DataTable";
import { SearchFilters } from "../../../shared/ui/search-filters/SearchFilters";
import { StatusBadge } from "../../../shared/ui/status-badge/StatusBadge";
import styles from "./PortfoliosPage.module.css";

interface PortfolioDetailsProps {
  portfolio: Portfolio;
  ownerUserId?: string;
  isAdmin: boolean;
  isHistoricalView: boolean;
  selectedDate: string;
  endDate: string;
  isRangeMode: boolean;
  history: PortfolioHistory[];
  totalQuantity: number;
  bondsCount: number;
  currentValue: number;
  currentYield: number;
  filteredBonds: PortfolioBond[];
  selectedBondsCount: number;
  searchIsin: string;
  filterBondType: string;
  onSearchIsinChange: (value: string) => void;
  onFilterBondTypeChange: (value: string) => void;
  onResetFilters: () => void;
  onDateChange: (value: string) => void;
  onResetDates: () => void;
  onClose: () => void;
  onBondClick: (bond: PortfolioBond) => void;
  getTypeDistribution: () => Record<string, number>;
  formatDate: (date: string) => string;
  formatPrice: (price: number) => string;
}

const PortfolioDetails = ({
  portfolio,
  ownerUserId,
  isAdmin,
  isHistoricalView,
  selectedDate,
  endDate,
  isRangeMode,
  history,
  totalQuantity,
  bondsCount,
  currentValue,
  currentYield,
  filteredBonds,
  selectedBondsCount,
  searchIsin,
  filterBondType,
  onSearchIsinChange,
  onFilterBondTypeChange,
  onResetFilters,
  onDateChange,
  onResetDates,
  onClose,
  onBondClick,
  getTypeDistribution,
  formatDate,
  formatPrice,
}: PortfolioDetailsProps) => {
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

  return (
    <section className={styles.detailsSection}>
      <div className={styles.detailsHeader}>
        <div>
          <h2 className={styles.sectionTitle}>
            Портфель: {portfolio.name}
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
          {isAdmin && String(portfolio.userId) !== String(ownerUserId) && (
            <p className={styles.ownerInfo}>
              👤 Владелец: пользователь (ID: {portfolio.userId})
            </p>
          )}
        </div>
        <div className={styles.detailsActions}>
          {isHistoricalView && (
            <button className={styles.todayButton} onClick={onResetDates}>
              🔄 Вернуться на сегодня
            </button>
          )}
          <button className={styles.closeButton} onClick={onClose}>
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
                  {formatPrice(currentValue)}
                </span>
              </div>
              <div className={styles.keyStatCard}>
                <span className={styles.keyStatLabel}>
                  {isHistoricalView
                    ? "Доходность на дату"
                    : "Доходность сегодня"}
                </span>
                <span className={styles.keyStatValue}>
                  {currentYield.toFixed(2)}%
                </span>
              </div>
              <div className={styles.keyStatCard}>
                <span className={styles.keyStatLabel}>Всего штук</span>
                <span className={styles.keyStatValue}>{totalQuantity}</span>
              </div>
              <div className={styles.keyStatCard}>
                <span className={styles.keyStatLabel}>Видов облигаций</span>
                <span className={styles.keyStatValue}>{bondsCount}</span>
              </div>
            </div>

            <div className={styles.limitsInfo}>
              <p>
                <strong>Лимит портфеля:</strong> {totalQuantity} /{" "}
                {PORTFOLIO_OPTIONS[portfolio.type].maxBonds} шт. (можно добавить{" "}
                {PORTFOLIO_OPTIONS[portfolio.type].maxBonds - totalQuantity}{" "}
                шт.)
              </p>
              <p>
                <strong>Максимальная доходность:</strong>{" "}
                {PORTFOLIO_OPTIONS[portfolio.type].maxYield}%
              </p>
            </div>

            <PortfolioCharts
              selectedPortfolio={portfolio}
              portfolioHistory={{ [portfolio.id]: history }}
              selectedDate={selectedDate}
              isHistoricalView={isHistoricalView}
              onDateChange={onDateChange}
              getTypeDistribution={getTypeDistribution}
            />
          </div>
        </Tab>

        <Tab eventKey="bonds" title="📋 Облигации">
          <div className="pt-3">
            <SearchFilters
              searchType={filterBondType}
              searchIsin={searchIsin}
              onTypeChange={onFilterBondTypeChange}
              onIsinChange={onSearchIsinChange}
              onReset={onResetFilters}
              availableTypes={[
                { value: "lse", label: "LSE (Любляна)" },
                { value: "wb", label: "WB (Вена)" },
                { value: "sg", label: "SG (Швейцария)" },
                { value: "me", label: "ME (Москва)" },
              ]}
            />

            <div className={styles.filteredCount}>
              Найдено: <strong>{filteredBonds.length}</strong> из{" "}
              {selectedBondsCount}
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
              onRowClick={onBondClick}
              emptyMessage={
                selectedBondsCount === 0
                  ? "В портфеле пока нет облигаций."
                  : "По вашему запросу ничего не найдено"
              }
            />
          </div>
        </Tab>
      </Tabs>

    </section>
  );
};

export default PortfolioDetails;
