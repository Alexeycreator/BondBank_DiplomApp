namespace BondBank_WebApi.Models.DTOs.BondHistories;

public sealed record BondHistoryDto(
    int Id,
    string? Isin,
    DateOnly RecordedDate,
    decimal CurrencyRate,
    decimal BondPrice,
    string? BondType)
{
    public static BondHistoryDto From(BondBank_WebApi.Models.DataBase.BondHistoryModel model) =>
        new(model.Id, model.Isin, model.RecordedDate, model.CurrencyRate, model.BondPrice, model.BondType);
}