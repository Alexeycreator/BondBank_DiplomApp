import {
  Portfolio,
  PortfolioBond,
  PortfolioHistory,
} from "../../../entities/portfolio/model/types";

export const MOCK_PORTFOLIOS: Portfolio[] = [];
export const MOCK_CURRENT_PORTFOLIO_BONDS: Record<number, PortfolioBond[]> = {};
export const MOCK_HISTORICAL_PORTFOLIO_BONDS: Record<
  string,
  Record<number, PortfolioBond[]>
> = {};
export const MOCK_PORTFOLIO_HISTORY: Record<number, PortfolioHistory[]> = {};
