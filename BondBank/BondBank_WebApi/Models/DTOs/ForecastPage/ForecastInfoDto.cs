namespace BondBank_WebApi.Models.DTOs.ForecastPage;

public sealed class ForecastInfoDto
{
    public long TotalBonds { get; set; }
    public List<string> TypeBonds { get; set; } = new();
    public List<BondForForecastDto> BondsForForecast { get; set; } = new();
    public List<CurrencyRatesForForecastDto> CurrencyRates { get; set; } = new();
    public double[] BondsForForecastChart { get; set; } = Array.Empty<double>();
}