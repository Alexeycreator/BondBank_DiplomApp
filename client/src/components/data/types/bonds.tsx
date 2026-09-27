import { DataBaseModel } from "./common";

// ==================== ТИПЫ ОБЛИГАЦИЙ ====================
export type BondType = "lse" | "wb" | "sg" | "me";

// ==================== ОБЛИГАЦИИ ====================
export interface BondBaseModel extends DataBaseModel {
    name: string;
    isin: string;
    updatedAt: string;            // ISO-строка с бэка
    portfoliosId: number | null;  // int? → null
    currencyRatesId: number;
}

// ==================== SPECIFIC DATA ПО ТИПАМ ====================
export interface LseSpecificData {
    sector: string;
    symbol: string;
    listedQuantity: number;
    nominalValue: number;
    currency: string;
    listingDate: string;
    delistingDate: string | null;
}

export interface WbSpecificData {
    last: number;
    chg: string;
    date: string;
    bid: number;
    ask: number;
    maturity: string;
    status: string;
    currency: string;
}

export interface SgSpecificData {
    valorId: string;
    tradingBaseCurrency: string;
    couponRate: number;
    maturityDate: string;
    closingPrice: number;
    closingPerfomance: number;
    bidPrice: number;
    askPrice: number;
    marketTime: string;
    marketDate: string;
    issuerNameFull: string;
    productLine: string;
    industrySectorCode: number;
    secTypeCode: string;
    amountInIssue: number;
    yieldToWorst: number;
}

export interface MeSpecificData {
    securityType: string;
    securityTypeId: number;
    type: string;
    secId: string;
    shortName: string;
    regNumber: string;
    isTraded: boolean;
    primaryBoardId: string;
    market: string;
    engine: string;
    faceValue: number;
    faceUnit: string;
}

// ==================== DTO С DISCRIMINATED UNION ====================
export interface BondDtoBase {
    bond: BondBaseModel | null;
}

export interface LseBondDto extends BondDtoBase {
    type: "lse";
    specificData: LseSpecificData | null;
}

export interface WbBondDto extends BondDtoBase {
    type: "wb";
    specificData: WbSpecificData | null;
}

export interface SgBondDto extends BondDtoBase {
    type: "sg";
    specificData: SgSpecificData | null;
}

export interface MeBondDto extends BondDtoBase {
    type: "me";
    specificData: MeSpecificData | null;
}

export type BondDto = LseBondDto | WbBondDto | SgBondDto | MeBondDto;

// ==================== VIEW ДЛЯ UI ====================
export interface BondView {
    id: number;
    name: string;
    isin: string;
    type: BondType;
    updatedAt: string;
    price: number;
    yield: number | null;
    maturity: string | null;
    currency: string;
    currencyRate: number;
    currencyRatesId: number;
    currencyRateDate: string;
    specificData: BondDto["specificData"];
}