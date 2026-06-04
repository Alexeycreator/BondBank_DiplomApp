using Shared.Models;

namespace SixGroupParser.Models;

public sealed class BondModel : BondBase
{
    public string? ValorId { get; set; }
    public string? TradingBaseCurrency { get; set; }
    public string? CouponRate { get; set; }
    public string? MaturityDate { get; set; }
    public string? ClosingPrice { get; set; }
    public string? ClosingPerfomance { get; set; }
    public string? BidPrice { get; set; }
    public string? AskPrice { get; set; }
    public string? MarketTime { get; set; }
    public string? MarketDate { get; set; }
    public string? IssuerNameFull { get; set; }
    public string? ProductLine { get; set; }
    public string? IndustrySectorCode { get; set; }
    public string? SecTypeCode { get; set; }
    public string? AmountInIssue { get; set; }
    public string? YieldToWorst { get; set; }
}