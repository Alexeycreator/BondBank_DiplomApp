import { BondDto } from "./bonds";
import { CurrencyRateDto } from "../../currency/model/types";

export interface BondsInfo {
    bondsByTable: BondDto[];
    typeBondsByFilter: string[];
    currencyRates: CurrencyRateDto[];
}