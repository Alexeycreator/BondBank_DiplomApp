import { useEffect, useState } from "react";
import { ApiRequestError } from "../../../shared/api/client";
import { getAllBonds, getForecastBonds } from "../../../entities/bond/api/bondsApi";
import { BondType } from "../../../entities/bond/model/bonds";
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
}

interface ForecastState {
    forecasts: ForecastItem[];
    isLoading: boolean;
    error: string | null;
}

export const useForecasts = (): ForecastState => {
    const [state, setState] = useState<ForecastState>({
        forecasts: [],
        isLoading: true,
        error: null,
    });

    useEffect(() => {
        let isCurrent = true;

        const loadForecasts = async () => {
            setState((current) => ({ ...current, isLoading: true, error: null }));
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
                    Object.entries(forecastByIsin).flatMap(
                    ([isin, forecast]) => {
                        const bond = bondByIsin.get(isin);
                        if (!bond || !bond.bond || !isBondType(bond.type)) return [];
                        const bondData = bond.bond;
                        return [getBondHistoriesByIsin(isin).then((history) => {
                            const sortedHistory = history
                                .filter((point) => point.isin === isin && Number.isFinite(Number(point.bondPrice)))
                                .sort((a, b) => a.recordedDate.localeCompare(b.recordedDate));
                            const lastDate = sortedHistory.at(-1)?.recordedDate ?? null;
                            const cutoffDate = lastDate
                                ? new Date(`${lastDate}T00:00:00Z`)
                                : null;
                            if (cutoffDate) cutoffDate.setUTCDate(cutoffDate.getUTCDate() - 6);
                            const weeklyHistory = sortedHistory
                                .filter((point) => !cutoffDate || new Date(`${point.recordedDate}T00:00:00Z`) >= cutoffDate)
                                .map((point) => ({
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
                            };
                        })];
                    },
                    ),
                );

                if (isCurrent) setState({ forecasts, isLoading: false, error: null });
            } catch (error: unknown) {
                if (!isCurrent) return;
                const message = error instanceof ApiRequestError
                    ? error.serverMessage || error.message
                    : error instanceof Error
                        ? error.message
                        : "Не удалось загрузить прогнозы";
                setState({ forecasts: [], isLoading: false, error: message });
            }
        };

        void loadForecasts();
        return () => {
            isCurrent = false;
        };
    }, []);

    return state;
};

const BOND_TYPES: readonly BondType[] = ["lse", "wb", "sg", "me"];

const isBondType = (value: string | null | undefined): value is BondType =>
    BOND_TYPES.some((type) => type === value);
