import { Form } from "react-bootstrap";
import styles from "./PortfoliosPage.module.css";

interface PortfolioDateControlsProps {
  selectedDate: string;
  endDate: string;
  today: string;
  isRangeMode: boolean;
  isHistoricalView: boolean;
  onDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onRangeModeChange: (enabled: boolean) => void;
  onReset: () => void;
  formatDate: (date: string) => string;
}

const PortfolioDateControls = ({
  selectedDate,
  endDate,
  today,
  isRangeMode,
  isHistoricalView,
  onDateChange,
  onEndDateChange,
  onRangeModeChange,
  onReset,
  formatDate,
}: PortfolioDateControlsProps) => (
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
        onChange={(event) => {
          onDateChange(event.target.value);
          if (isRangeMode && event.target.value > endDate) {
            onEndDateChange(event.target.value);
          }
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
            onChange={(event) => onEndDateChange(event.target.value)}
            className={styles.dateInput}
          />
        </>
      )}
      <Form.Check
        type="switch"
        id="range-switch"
        label="Выбрать диапазон"
        checked={isRangeMode}
        onChange={(event) => onRangeModeChange(event.target.checked)}
        className={styles.rangeSwitch}
      />
    </div>
    {isHistoricalView && (
      <>
        <span className={styles.historicalBadge}>
          Исторические данные: {formatDate(selectedDate)}
          {isRangeMode && ` — ${formatDate(endDate)}`}
        </span>
        <button className={styles.resetDateButton} onClick={onReset}>
          🔄 Вернуться на сегодня
        </button>
      </>
    )}
  </section>
);

export default PortfolioDateControls;
