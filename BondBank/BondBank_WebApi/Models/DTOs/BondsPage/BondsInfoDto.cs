using BondBank_WebApi.Models.DataBase;

namespace BondBank_WebApi.Models.DTOs.BondsPage;

public sealed class BondsInfoDto
{
    public List<BondDto> BondsByTable { get; set; } = new();
    public List<string> TypeBondsByFilter { get; set; } = new ();
    public List<BondHistoryModel> BondByChart { get; set; } = new();
    public List<CurrencyRatesModel> CurrencyRates { get; set; } = new();
}