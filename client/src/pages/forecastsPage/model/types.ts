export interface ForecastItem {
  isin: string;
  name: string;
  type: string;
  currentPrice: number;
  forecastTomorrow: number;
  forecastDayAfter: number;
  changePercent: number;
  confidence: string;
  history: number[];
}
