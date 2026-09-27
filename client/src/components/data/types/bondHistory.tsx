import { DataBaseModel } from "./common";

export interface BondHistoryModel extends DataBaseModel {
    isin: string | null;
    recordedDate: string;
    currencyRate: number;
    bondPrice: number;
    bondType: string | null;
}