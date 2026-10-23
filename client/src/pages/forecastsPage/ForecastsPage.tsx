import { useMemo, useState } from "react";
import styles from "./ForecastsPage.module.css";
import { ForecastCard } from "./ui/ForecastCard";
import ForecastChart from "./ui/ForecastChart";
import { SearchFilters } from "../../shared/ui/search-filters/SearchFilters";
import { MOCK_FORECASTS } from "./model/mock-data";
import { ForecastItem } from "./model/types";

const AVAILABLE_TYPES = [
  { value: "lse", label: "LSE (Любляна)" },
  { value: "wb", label: "WB (Вена)" },
  { value: "sg", label: "SG (Швейцария)" },
  { value: "me", label: "ME (Москва)" },
];

const ForecastsPage = () => {
  const [searchType, setSearchType] = useState("");
  const [searchIsin, setSearchIsin] = useState("");
  const [selectedForecast, setSelectedForecast] =
    useState<ForecastItem | null>(null);

  const filteredForecasts = useMemo(
    () =>
      MOCK_FORECASTS.filter((forecast) => {
        const matchesType =
          searchType === "" ||
          forecast.type.toLowerCase() === searchType.toLowerCase();
        const matchesIsin =
          searchIsin === "" ||
          forecast.isin.toLowerCase().includes(searchIsin.toLowerCase());
        return matchesType && matchesIsin;
      }),
    [searchType, searchIsin],
  );

  return (
    <div className={styles.forecastsPage}>
      <h1 className={styles.pageTitle}>📊 Прогнозы</h1>
      <p className={styles.pageDescription}>
        Прогнозы цен облигаций на основе алгоритмов машинного обучения (SSA)
      </p>

      <SearchFilters
        searchType={searchType}
        searchIsin={searchIsin}
        onTypeChange={setSearchType}
        onIsinChange={setSearchIsin}
        onReset={() => {
          setSearchType("");
          setSearchIsin("");
        }}
        availableTypes={AVAILABLE_TYPES}
      />

      {selectedForecast && <ForecastChart forecast={selectedForecast} />}

      <div className={styles.forecastGrid}>
        {filteredForecasts.length > 0 ? (
          filteredForecasts.map((forecast) => (
            <ForecastCard
              key={forecast.isin}
              forecast={forecast}
              onClick={setSelectedForecast}
            />
          ))
        ) : (
          <div className={styles.noData}>
            <p>Прогнозы не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForecastsPage;
