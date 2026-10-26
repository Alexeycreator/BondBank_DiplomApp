namespace BondBank_WebApi.Models.DTOs.CurrencyRates;

public sealed record CurrencyRateDto(
    int Id,
    int DigitalCode,
    string LetterCode,
    int Units,
    string Currency,
    decimal Rate,
    DateOnly DateReceipt)
{
    public static CurrencyRateDto From(BondBank_WebApi.Models.DataBase.CurrencyRatesModel model) =>
        new(model.Id, model.DigitalCode, model.LetterCode, model.Units, model.Currency, model.Rate, model.DateReceipt);
}
