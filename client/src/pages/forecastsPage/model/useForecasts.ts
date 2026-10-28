import { useEffect, useState, useCallback } from "react";
import { ApiRequestError } from "../../../shared/api/client";
import {
  getAllBonds,
  getForecastBonds,
} from "../../../entities/bond/api/bondsApi";
import {
  BondType,
  LseSpecificData,
  WbSpecificData,
  SgSpecificData,
  MeSpecificData,
} from "../../../entities/bond/model/bonds";
import { getBondHistoriesByIsin } from "../../../entities/bond/api/bondHistoriesApi";

export interface ForecastHistoryPoint {
  date: string;
  price: number;
}

export interface ForecastItem {
  isin: string;
  name: string;
  type: BondType;
  forecast: number[];
  history: ForecastHistoryPoint[];
  currentDate: string | null;
  currentPrice: number | null;
  currency: string;
}

interface ForecastState {
  forecasts: ForecastItem[];
  isLoading: boolean;
  error: string | null;
}

export const useForecasts = (): ForecastState & {
  reload: (isRetry?: boolean) => Promise<void>;
} => {
  const [state, setState] = useState<ForecastState>({
    forecasts: [],
    isLoading: true,
    error: null,
  });

  const loadForecasts = useCallback(async (isRetry = false) => {
    if (!isRetry) {
      setState((current) => ({ ...current, isLoading: true, error: null }));
    }

    try {
      const [bonds, forecastByIsin] = await Promise.all([
        getAllBonds(),
        getForecastBonds(),
      ]);
      const bondByIsin = new Map(
        bonds.flatMap((bond) =>
          bond.bond ? [[bond.bond.isin, bond] as const] : [],
        ),
      );

      const forecasts = await Promise.all(
        Object.entries(forecastByIsin).flatMap(([isin, forecast]) => {
          const bond = bondByIsin.get(isin);
          if (!bond || !bond.bond || !isBondType(bond.type)) return [];

          const bondData = bond.bond;
          const specificData = bond.specificData;

          let currency = "RUB";
          if (specificData) {
            if (bond.type === "lse")
              currency = (specificData as LseSpecificData).currency;
            else if (bond.type === "wb")
              currency = (specificData as WbSpecificData).currency;
            else if (bond.type === "sg")
              currency = (specificData as SgSpecificData).tradingBaseCurrency;
            else if (bond.type === "me")
              currency = (specificData as MeSpecificData).faceUnit;
          }

          return [
            getBondHistoriesByIsin(isin).then((history) => {
              const sortedHistory = history
                .filter(
                  (point) =>
                    point.isin === isin &&
                    Number.isFinite(Number(point.bondPrice)) &&
                    // ✅ Игнорируем "битые" записи с курсом 1 (если это не ME)
                    (point.bondType === "me" ||
                      Number(point.currencyRate) !== 1),
                )
                .sort((a, b) => a.recordedDate.localeCompare(b.recordedDate));

              // ✅ Убрали обрезку cutoffDate, теперь берем всю доступную историю
              const weeklyHistory = sortedHistory.map((point) => ({
                date: point.recordedDate,
                price: Number(point.bondPrice),
              }));
              const currentPoint = weeklyHistory.at(-1);

              return {
                isin,
                name: bondData.name,
                type: bond.type,
                forecast,
                history: weeklyHistory,
                currentDate: currentPoint?.date ?? null,
                currentPrice: currentPoint?.price ?? null,
                currency: currency || "RUB",
              };
            }),
          ];
        }),
      );

      setState({ forecasts, isLoading: false, error: null });
    } catch (error: unknown) {
      const message =
        error instanceof ApiRequestError
          ? error.serverMessage || error.message
          : error instanceof Error
            ? error.message
            : "Не удалось загрузить прогнозы";

      if (!isRetry) {
        setState({ forecasts: [], isLoading: false, error: message });
      } else {
        throw new Error(message);
      }
    }
  }, []);

  useEffect(() => {
    void loadForecasts();
  }, [loadForecasts]);

  return { ...state, reload: loadForecasts };
};

const BOND_TYPES: readonly BondType[] = ["lse", "wb", "sg", "me"];

const isBondType = (value: string | null | undefined): value is BondType =>
  BOND_TYPES.some((type) => type === value);
