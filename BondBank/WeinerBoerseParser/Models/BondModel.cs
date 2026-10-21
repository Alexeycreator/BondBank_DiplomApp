using Shared.Models;

namespace WeinerBoerseParser.Models;

public sealed class BondModel : BondBase
{
    public string? Last { get; set; }
    public string? Chg { get; set; }
    public string? Date { get; set; }
    public string? Bid { get; set; }
    public string? Ask { get; set; }
    public string? Maturity { get; set; }
    public string? Status { get; set; }
    public string? Currency { get; set; }
}