import { useMemo, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import styles from "./ForecastsPage.module.css";
import { ForecastCard } from "./ui/ForecastCard";
import ForecastChart from "./ui/ForecastChart";
import { SearchFilters } from "../../shared/ui/search-filters/SearchFilters";
import { ForecastItem } from "./model/types";
import { useForecasts } from "./model/useForecasts";

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
  const navigate = useNavigate();
  const { forecasts, isLoading, error } = useForecasts();

  const filteredForecasts = useMemo(
    () =>
      forecasts.filter((forecast) => {
        const matchesType =
          searchType === "" ||
          forecast.type.toLowerCase() === searchType.toLowerCase();
        const matchesIsin =
          searchIsin === "" ||
          forecast.isin.toLowerCase().includes(searchIsin.toLowerCase());
        return matchesType && matchesIsin;
      }),
    [forecasts, searchType, searchIsin],
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

      <Modal
        show={selectedForecast !== null}
        onHide={() => setSelectedForecast(null)}
        centered
        size="xl"
        scrollable
        contentClassName={styles.forecastModal}
      >
        {selectedForecast && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>
                Прогноз: {selectedForecast.name} ({selectedForecast.isin})
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <ForecastChart forecast={selectedForecast} />
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="outline-secondary"
                onClick={() => setSelectedForecast(null)}
              >
                Закрыть
              </Button>
              <Button
                variant="info"
                onClick={() => navigate(`/bonds?isin=${encodeURIComponent(selectedForecast.isin)}`)}
              >
                Перейти к облигации
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>

      <div className={styles.forecastGrid}>
        {isLoading ? (
          <div className={styles.noData}>Загрузка прогнозов…</div>
        ) : error ? (
          <div className={styles.noData} role="alert">{error}</div>
        ) : filteredForecasts.length > 0 ? (
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
