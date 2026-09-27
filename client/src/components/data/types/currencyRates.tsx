import { DataBaseModel } from "./common";

export interface CurrencyRatesModel extends DataBaseModel {
    digitalCode: number;
    letterCode: string;
    units: number;
    currency: string;
    rate: number;
    dateReceipt: string;
}