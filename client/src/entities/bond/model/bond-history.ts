export interface BondHistoryModel {
    id: number;
    isin: string | null;
    recordedDate: string;
    currencyRate: number;
    bondPrice: number;
    bondType: string | null;
}