import { useMemo, useState } from "react";
import { Button, Modal, Toast, ToastContainer } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import styles from "./ForecastsPage.module.css";
import { ForecastCard } from "./ui/ForecastCard";
import ForecastChart from "./ui/ForecastChart";
import { SearchFilters } from "../../shared/ui/search-filters/SearchFilters";
import { ForecastItem } from "./model/types";
import { useForecasts } from "./model/useForecasts";
import ErrorCard from "../../shared/ui/error-card/ErrorCard";
import { useToast } from "../../shared/notifications/ToastContext";
import { useCurrency } from "../../shared/currency/CurrencyContext";

const AVAILABLE_TYPES = [
  { value: "lse", label: "LSE (Любляна)" },
  { value: "wb", label: "WB (Вена)" },
  { value: "sg", label: "SG (Швейцария)" },
  { value: "me", label: "ME (Москва)" },
];

const ForecastsPage = () => {
  const [searchType, setSearchType] = useState("");
  const [searchIsin, setSearchIsin] = useState("");
  const [selectedForecast, setSelectedForecast] = useState<ForecastItem | null>(
    null,
  );

  // ✅ Берем валюту и курсы из контекста
  const { selectedCurrency, rates } = useCurrency();

  const [showSlowWarning, setShowSlowWarning] = useState(false);
  const [showEmptyWarning, setShowEmptyWarning] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();
  const { forecasts, isLoading, error, reload } = useForecasts();

  const handleRetry = async () => {
    try {
      await reload(true);
    } catch (err: any) {
      showToast(
        "Ошибка",
        err.message || "Не удалось загрузить прогнозы",
        "danger",
      );
    }
  };

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

  if (error && !isLoading) {
    return (
      <div className={styles.forecastsPage}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
          }}
        >
          <ErrorCard
            icon={error.includes("авторизац") ? "🔒" : "⚠️"}
            title={error.includes("авторизац") ? "Требуется вход" : "Ошибка"}
            message={error}
            retryLabel="Повторить"
            onRetry={handleRetry}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.forecastsPage}>
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
            <strong className="me-auto">📭 Прогнозов нет</strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            Прогнозы не найдены. Обратитесь в поддержку.
          </Toast.Body>
        </Toast>
      </ToastContainer>

      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>📊 Прогнозы</h1>
          <p className={styles.pageDescription}>
            Прогнозы цен облигаций на основе алгоритмов машинного обучения (SSA)
          </p>
        </div>
        {/* ❌ Убрали Dropdown, он теперь в шапке */}
      </div>

      <SearchFilters
        searchType={searchType}
        searchIsin={searchIsin}
        onSearch={(type, isin) => {
          setSearchType(type);
          setSearchIsin(isin);
        }}
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
              <ForecastChart
                forecast={selectedForecast}
                currency={selectedCurrency}
                rates={rates}
              />
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
                onClick={() =>
                  navigate(
                    `/bonds?isin=${encodeURIComponent(selectedForecast.isin)}`,
                  )
                }
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
        ) : filteredForecasts.length > 0 ? (
          filteredForecasts.map((forecast) => (
            <ForecastCard
              key={forecast.isin}
              forecast={forecast}
              currency={selectedCurrency}
              rates={rates}
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
