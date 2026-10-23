import { Spinner } from "react-bootstrap";
import { Portfolio } from "../../../entities/portfolio/model/types";
import { PortfolioCard } from "../../../entities/portfolio/ui/PortfolioCard";
import styles from "./PortfoliosPage.module.css";

interface PortfolioListSectionProps {
  portfolios: Portfolio[];
  isOtherUser: boolean;
  loading: boolean;
  selectedPortfolio: Portfolio | null;
  getTotalQuantity: (portfolioId: number) => number;
  getPortfolioValue: (portfolio: Portfolio) => {
    value: number;
    yield: number;
    isHistorical: boolean;
  };
  onOpenPortfolio: (portfolio: Portfolio) => void;
}

const PortfolioListSection = ({
  portfolios,
  isOtherUser,
  loading,
  selectedPortfolio,
  getTotalQuantity,
  getPortfolioValue,
  onOpenPortfolio,
}: PortfolioListSectionProps) => (
  <section className={styles.portfoliosSection}>
    <h2 className={styles.sectionTitle}>
      {isOtherUser ? "Портфели пользователя" : "Мои портфели"} (
      {portfolios.length})
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
      ) : portfolios.length > 0 ? (
        portfolios.map((portfolio) => {
          const totalQuantity = getTotalQuantity(portfolio.id);
          const {
            value,
            yield: portfolioYield,
            isHistorical,
          } = getPortfolioValue(portfolio);

          return (
            <PortfolioCard
              key={portfolio.id}
              portfolio={portfolio}
              totalQuantity={totalQuantity}
              currentValue={value}
              currentYield={portfolioYield}
              isHistorical={isHistorical}
              isActive={selectedPortfolio?.id === portfolio.id}
              onOpen={onOpenPortfolio}
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
);

export default PortfolioListSection;
