export type BondType = "lse" | "wb" | "sg" | "me";

export interface Bond {
    id: number;
    name: string;
    isin: string;
    type: BondType;
    price: number;
    yield: number;
    maturity: string;
    currency: string;
    currencyRate: number;
    updatedAt: string;
}
