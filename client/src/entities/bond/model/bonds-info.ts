import { BondDto } from "./bonds";
import { BondHistoryModel } from "./bond-history";
import { CurrencyRatesModel } from "./currency-rates";

export interface BondsInfo {
    bondsByTable: BondDto[];
    typeBondsByFilter: string[];
    bondByChart: BondHistoryModel[];
    currencyRates: CurrencyRatesModel[];
}