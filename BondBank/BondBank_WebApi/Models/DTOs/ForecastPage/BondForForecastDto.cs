namespace BondBank_WebApi.Models.DTOs.ForecastPage;

public class BondForForecastDto
{
    public string Isin { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public double Profitability { get; set; }
}