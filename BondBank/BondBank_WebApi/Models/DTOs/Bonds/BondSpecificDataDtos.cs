namespace BondBank_WebApi.Models.DTOs.Bonds;

public sealed record LjubljanaBondSpecificDataDto(
    char Sector,
    string Symbol,
    long ListedQuantity,
    decimal NominalValue,
    string Currency,
    DateOnly ListingDate,
    DateOnly? DelistingDate
);

public sealed record WienerBondSpecificDataDto(
    decimal Last,
    string Chg,
    DateTime Date,
    decimal Bid,
    decimal Ask,
    DateOnly Maturity,
    char Status,
    string Currency
);

public sealed record SixGroupBondSpecificDataDto(
    string ValorId,
    string TradingBaseCurrency,
    decimal CouponRate,
    DateOnly MaturityDate,
    decimal ClosingPrice,
    decimal ClosingPerfomance,
    decimal BidPrice,
    decimal AskPrice,
    TimeOnly MarketTime,
    DateOnly MarketDate,
    string IssuerNameFull,
    string ProductLine,
    int IndustrySectorCode,
    string SecTypeCode,
    long AmountInIssue,
    decimal YieldToWorst
);

public sealed record MoscowBondSpecificDataDto(
    string SecurityType,
    int SecurityTypeId,
    string Type,
    string SecId,
    string ShortName,
    string RegNumber,
    bool IsTraded,
    string PrimaryBoardId,
    string Market,
    string Engine,
    decimal FaceValue,
    string FaceUnit
);
