import React from "react";
import { Dropdown } from "react-bootstrap";
import { useCurrency } from "../../currency/CurrencyContext";
import styles from "./CurrencySelector.module.css";

export const CurrencySelector = () => {
  const { selectedCurrency, setSelectedCurrency, availableCurrencies } =
    useCurrency();

  return (
    <Dropdown align="end">
      <Dropdown.Toggle variant="outline-info" id="currency-dropdown" size="sm">
        💱 {selectedCurrency}
      </Dropdown.Toggle>
      <Dropdown.Menu
        className={styles.currencyMenu}
        style={{ maxHeight: "250px", overflowY: "auto" }}
      >
        {availableCurrencies.map((curr) => (
          <Dropdown.Item
            key={curr}
            onClick={() => setSelectedCurrency(curr)}
            active={curr === selectedCurrency}
            className={styles.currencyItem}
          >
            {curr}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};
