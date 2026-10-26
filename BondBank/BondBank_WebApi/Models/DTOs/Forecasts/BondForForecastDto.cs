namespace BondBank_WebApi.Models.DTOs.Forecasts;

public class BondForForecastDto
{
    public string Isin { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public double[] Forecast { get; set; } = Array.Empty<double>();
}