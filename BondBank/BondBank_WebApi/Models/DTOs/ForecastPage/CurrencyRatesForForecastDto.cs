namespace BondBank_WebApi.Models.DTOs.ForecastPage;

public sealed class CurrencyRatesForForecastDto
{
    public int Id { get; set; }
    public string LetterCode { get; set; } = string.Empty;
    public decimal Rate { get; set; }
}