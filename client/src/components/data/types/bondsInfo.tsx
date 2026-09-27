import { BondDto } from "./bonds";
import { BondHistoryModel } from "./bondHistory";
import { CurrencyRatesModel } from "./currencyRates";

export interface BondsInfo {
    bondsByTable: BondDto[];
    typeBondsByFilter: string[];
    bondByChart: BondHistoryModel[];
    currencyRates: CurrencyRatesModel[];
}