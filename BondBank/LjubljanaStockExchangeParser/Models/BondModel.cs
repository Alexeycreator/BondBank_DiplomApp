using Shared.Models;

namespace LjubljanaStockExchangeParser.Models;

public sealed class BondModel : BondBase
{
    public string Symbol { get; set; }
    public string Sector { get; set; }
    public string ListedQuantity { get; set; }
    public string NominalValue { get; set; }
    public string Currency { get; set; }
    public string ListingDate { get; set; }
    public string DelistingDate { get; set; }
}