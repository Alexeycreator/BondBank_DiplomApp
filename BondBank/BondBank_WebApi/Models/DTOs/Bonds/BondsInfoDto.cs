using BondBank_WebApi.Models.DTOs.CurrencyRates;

namespace BondBank_WebApi.Models.DTOs.Bonds;

public sealed class BondsInfoDto
{
    public List<BondResponseDto> BondsByTable { get; set; } = new();
    public List<string> TypeBondsByFilter { get; set; } = new ();
    public List<CurrencyRateDto> CurrencyRates { get; set; } = new();
}