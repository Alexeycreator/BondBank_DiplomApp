namespace BondBank_WebApi.Models.DTOs.Bonds;

public sealed record BondBaseDto(
    int Id,
    string Name,
    string Isin,
    DateTime UpdatedAt,
    int? PortfoliosId,
    int CurrencyRatesId
);
