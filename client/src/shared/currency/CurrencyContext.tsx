import React, { createContext, useContext, useState, useEffect } from "react";
import { api, handleApiError } from "../api/client";
import { CurrencyRateDto } from "../../entities/currency/model/types";

interface CurrencyContextType {
  selectedCurrency: string;
  setSelectedCurrency: (currency: string) => void;
  availableCurrencies: string[];
  rates: Record<string, number>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined,
);

export const CurrencyProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState<string>("RUB");
  const [availableCurrencies, setAvailableCurrencies] = useState<string[]>([
    "RUB",
  ]);
  const [rates, setRates] = useState<Record<string, number>>({ RUB: 1 });

  useEffect(() => {
    // Загружаем курсы валют при старте приложения
    api
      .get<CurrencyRateDto[]>("/currency-rates/all")
      .then((res) => {
        const map: Record<string, number> = { RUB: 1 };
        const set = new Set<string>(["RUB"]);
        for (const rate of res.data) {
          map[rate.letterCode] = rate.rate;
          set.add(rate.letterCode);
        }
        setRates(map);
        setAvailableCurrencies(Array.from(set));
      })
      .catch(handleApiError);
  }, []);

  return (
    <CurrencyContext.Provider
      value={{
        selectedCurrency,
        setSelectedCurrency,
        availableCurrencies,
        rates,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context)
    throw new Error("useCurrency must be used within CurrencyProvider");
  return context;
};
