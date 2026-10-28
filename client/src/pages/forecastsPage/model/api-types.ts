import { CurrencyRateDto } from "../../../entities/currency/model/types";

export interface BondForecastDto {
    isin: string;
    name: string;
    type: string;
    forecast: number[];
}

export interface ForecastInfoDto {
    totalBonds: number;
    typeBonds: string[];
    bondsForForecast: BondForecastDto[];
    currencyRates: CurrencyRateDto[];
}

export interface ForecastByIsinDto {
    isin: string;
    forecast: number[];
}
