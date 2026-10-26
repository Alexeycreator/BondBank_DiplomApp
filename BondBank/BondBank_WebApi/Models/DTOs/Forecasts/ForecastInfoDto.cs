using BondBank_WebApi.Models.DTOs.CurrencyRates;

namespace BondBank_WebApi.Models.DTOs.Forecasts;

public sealed class ForecastInfoDto
{
    public long TotalBonds { get; set; }
    public List<string> TypeBonds { get; set; } = new();
    public List<BondForForecastDto> BondsForForecast { get; set; } = new();
    public List<CurrencyRateDto> CurrencyRates { get; set; } = new();
}