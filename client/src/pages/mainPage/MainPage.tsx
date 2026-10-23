import { useEffect, useState } from "react";
import styles from "./MainPage.module.css";
import { getInfoStatisticsBlockData } from "./api/mainPageApi";
import { InfoStatisticsBlock } from "./model/types";
import { ApiRequestError } from "../../shared/api/client";
import MainShowcase from "./ui/MainShowcase";
import MainContentSections from "./ui/MainContentSections";

const MainPage = () => {
  const [statistics, setStatistics] = useState<InfoStatisticsBlock | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{
    message: string;
    isNetwork: boolean;
  } | null>(null);

  const fetchStatistics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setStatistics(await getInfoStatisticsBlockData());
    } catch (requestError: unknown) {
      console.error("Ошибка загрузки статистики:", requestError);
      const apiError =
        requestError instanceof ApiRequestError ? requestError : null;
      const message =
        apiError?.serverMessage ||
        (requestError instanceof Error ? requestError.message : "") ||
        "Не удалось загрузить статистику. Попробуйте позже.";
      setError({ message, isNetwork: apiError?.isNetworkError ?? false });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchStatistics();
  }, []);

  return (
    <div className={styles.mainPage}>
      <MainShowcase />
      <MainContentSections
        statistics={statistics}
        isLoading={isLoading}
        error={error}
        onRetry={fetchStatistics}
      />
    </div>
  );
};

export default MainPage;
