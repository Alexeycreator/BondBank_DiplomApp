import {
  BondBaseModel,
  BondDto,
  BondType,
  BondView,
  LseSpecificData,
  MeSpecificData,
  SgSpecificData,
  WbSpecificData,
} from "./bonds";
import { BondsInfo } from "./bonds-info";

const BOND_TYPES: readonly BondType[] = ["lse", "wb", "sg", "me"];

export const BOND_TYPE_LABELS: Record<BondType, string> = {
  lse: "LSE (Люблянская биржа)",
  wb: "WB (Венская биржа)",
  sg: "SG (Швейцарская биржа)",
  me: "ME (Московская биржа)",
};

export function isBondType(
  value: string | null | undefined,
): value is BondType {
  return BOND_TYPES.some((type) => type === value);
}

const extractPrice = (dto: BondDto): number => {
  if (!dto.specificData) return 0;
  switch (dto.type) {
    case "lse":
      return (dto.specificData as LseSpecificData).nominalValue ?? 0;
    case "wb":
      return (dto.specificData as WbSpecificData).last ?? 0;
    case "sg":
      return (dto.specificData as SgSpecificData).closingPrice ?? 0;
    case "me":
      return (dto.specificData as MeSpecificData).faceValue ?? 0;
  }
};

const extractYield = (dto: BondDto): number | null => {
  if (dto.type === "sg" && dto.specificData) {
    return (dto.specificData as SgSpecificData).yieldToWorst ?? null;
  }
  return null;
};

const extractCurrency = (dto: BondDto): string | null => {
  if (!dto.specificData) return null;
  switch (dto.type) {
    case "lse":
      return (dto.specificData as LseSpecificData).currency ?? null;
    case "wb":
      return (dto.specificData as WbSpecificData).currency ?? null;
    case "sg":
      return (dto.specificData as SgSpecificData).tradingBaseCurrency ?? null;
    case "me":
      return (dto.specificData as MeSpecificData).faceUnit ?? null;
  }
};

const extractMaturity = (dto: BondDto): string | null => {
  if (!dto.specificData) return null;
  switch (dto.type) {
    case "wb":
      return (dto.specificData as WbSpecificData).maturity ?? null;
    case "sg":
      return (dto.specificData as SgSpecificData).maturityDate ?? null;
    case "lse":
      return (dto.specificData as LseSpecificData).delistingDate ?? null;
    case "me":
      return null;
  }
};

export const mapBondsInfoToViews = (bondsInfo: BondsInfo): BondView[] => {
  const currencyRatesById = new Map(
    bondsInfo.currencyRates.map((rate) => [rate.id, rate]),
  );

  return bondsInfo.bondsByTable
    .filter(
      (dto): dto is BondDto & { bond: BondBaseModel; type: BondType } =>
        dto.bond !== null && isBondType(dto.type),
    )
    .map((dto) => {
      const rate = currencyRatesById.get(dto.bond.currencyRatesId);
      return {
        id: dto.bond.id,
        name: dto.bond.name,
        isin: dto.bond.isin,
        type: dto.type,
        updatedAt: dto.bond.updatedAt,
        price: extractPrice(dto),
        yield: extractYield(dto),
        maturity: extractMaturity(dto),
        currency: extractCurrency(dto) ?? rate?.letterCode ?? "RUB",
        currencyRate: rate?.rate ?? 1,
        currencyRatesId: dto.bond.currencyRatesId,
        currencyRateDate: rate?.dateReceipt ?? "—",
        specificData: dto.specificData,
      };
    });
};

export const formatBondNumber = (value: number): string => {
  if (!Number.isFinite(value)) return "—";
  const [integerPart, decimalPart] = value.toFixed(2).split(".");
  const withSeparators = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${withSeparators}.${decimalPart}`;
};

export const formatBondDateTime = (iso: string | null | undefined): string => {
  if (!iso) return "—";
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
  if (!match) return "—";
  const [, year, month, day, hours, minutes, seconds] = match;
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
