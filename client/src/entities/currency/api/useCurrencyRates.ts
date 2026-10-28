import { useState, useEffect, useMemo } from "react";
import { api, handleApiError } from "../../../shared/api/client";
import { CurrencyRateDto } from "../model/types";

export const useCurrencyRates = () => {
  const [currencyRates, setCurrencyRates] = useState<CurrencyRateDto[]>([]);

  useEffect(() => {
    api
      .get<CurrencyRateDto[]>("/currency-rates/all")
      .then((res) => setCurrencyRates(res.data))
      .catch((err) => handleApiError(err));
  }, []);

  // Мапа для быстрого доступа: { RUB: 1, EUR: 98.5, ... }
  const rates = useMemo(() => {
    const map: Record<string, number> = { RUB: 1 };
    for (const rate of currencyRates) map[rate.letterCode] = rate.rate;
    return map;
  }, [currencyRates]);

  // Список доступных валют
  const availableCurrencies = useMemo(() => {
    const set = new Set(["RUB"]);
    for (const rate of currencyRates) set.add(rate.letterCode);
    return Array.from(set);
  }, [currencyRates]);

  return { rates, availableCurrencies };
};
