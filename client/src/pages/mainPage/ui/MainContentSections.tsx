import { InfoStatisticsBlock } from "../model/types";
import { FeatureCard } from "./FeatureCard";
import {
  GETTING_STARTED_STEPS,
  HOME_ADVANTAGES,
  HOME_LIMITATIONS,
  MAIN_FEATURES,
} from "../model/content";
import ErrorCard from "../../../shared/ui/error-card/ErrorCard";
import styles from "../MainPage.module.css";

interface MainContentSectionsProps {
  statistics: InfoStatisticsBlock | null;
  isLoading: boolean;
  error: { message: string; isNetwork: boolean } | null;
  onRetry: () => void;
}

const MainContentSections = ({
  statistics,
  isLoading,
  error,
  onRetry,
}: MainContentSectionsProps) => {
  const statisticItems = [
    {
      label: "Всего облигаций",
      value: statistics?.totalBonds?.toLocaleString("ru-RU") ?? "—",
      icon: "📄",
    },
    {
      label: "Активных пользователей",
      value: statistics?.activeUsers?.toLocaleString("ru-RU") ?? "—",
      icon: "👥",
    },
    {
      label: "Бирж",
      value: statistics?.exchanges?.toLocaleString("ru-RU") ?? "—",
      icon: "🏛️",
    },
  ];

  return (
    <>
      <section className={styles.statsSection}>
        <h2 className={styles.sectionTitle}>Платформа в цифрах</h2>
        {error ? (
          <ErrorCard
            icon={error.isNetwork ? "🛰️" : "⚠️"}
            title={
              error.isNetwork
                ? "Сервер недоступен"
                : "Не удалось загрузить данные"
            }
            message={error.message}
            retryLabel="Повторить"
            onRetry={onRetry}
          />
        ) : (
          <div className={styles.statsGrid}>
            {statisticItems.map((item) => (
              <div key={item.label} className={styles.statCardNew}>
                <div className={styles.statIcon}>{item.icon}</div>
                <div className={styles.statLabelNew}>{item.label}</div>
                <div className={styles.statValueNew}>
                  {isLoading ? "..." : item.value}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={styles.startSection}>
        <h2 className={styles.startTitle}>🚀 С чего начать?</h2>
        <p className={styles.startSubtitle}>
          Всего 5 простых шагов от регистрации до первого анализа
        </p>
        <div className={styles.stepsGrid}>
          {GETTING_STARTED_STEPS.map((item) => (
            <div key={item.step} className={styles.stepCard}>
              <div className={styles.stepNumber}>{item.step}</div>
              <h3 className={styles.stepTitle}>{item.title}</h3>
              <p className={styles.stepDesc}>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.infoSection}>
        <h2 className={styles.sectionTitle}>Возможности платформы</h2>
        <div className={styles.infoGrid}>
          {MAIN_FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      <section className={styles.prosConsSection}>
        <h2 className={styles.sectionTitle}>Плюсы и минусы</h2>
        <div className={styles.prosConsGrid}>
          <div className={styles.prosCard}>
            <h3 className={`${styles.listTitle} ${styles.listTitlePros}`}>
              <span style={{ fontSize: "28px" }}>✅</span> Преимущества
            </h3>
            <ul className={styles.list}>
              {HOME_ADVANTAGES.map((item) => (
                <li key={item.title}>
                  <b>{item.title}</b> {item.description}
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.consCard}>
            <h3 className={`${styles.listTitle} ${styles.listTitleCons}`}>
              <span style={{ fontSize: "28px" }}>⚠️</span> Ограничения
            </h3>
            <ul className={styles.list}>
              {HOME_LIMITATIONS.map((item) => (
                <li key={item.title}>
                  <b>{item.title}</b> {item.description}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
};

export default MainContentSections;
