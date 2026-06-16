using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace BondBank_WebApi.Models.DataBase;

[Table("SixGroupBonds")]
public class SixGroupBondsModel : BondsBaseModel
{
    [Required(AllowEmptyStrings = true)]
    [MaxLength(100)]
    public string ValorId { get; set; } = string.Empty;

    [Required(AllowEmptyStrings = true)]
    [MaxLength(10)]
    public string TradingBaseCurrency { get; set; } = string.Empty;

    [Required]
    [Column(TypeName = "decimal(18,4)")]
    public decimal CouponRate { get; set; }

    [Required] public DateOnly MaturityDate { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal ClosingPrice { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal ClosingPerfomance { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal BidPrice { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal AskPrice { get; set; }

    [Required] public TimeOnly MarketTime { get; set; }
    [Required] public DateOnly MarketDate { get; set; }

    [Required(AllowEmptyStrings = true)]
    [MaxLength(100)]
    public string IssuerNameFull { get; set; } = string.Empty;

    [Required(AllowEmptyStrings = true)]
    [MaxLength(10)]
    public string ProductLine { get; set; } = string.Empty;

    [Required] public int IndustrySectorCode { get; set; }

    [Required(AllowEmptyStrings = true)]
    [MaxLength(10)]
    public string SecTypeCode { get; set; } = string.Empty;

    [Required] public long AmountInIssue { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,4)")]
    public decimal YieldToWorst { get; set; }

    public int? PortfoliosId { get; set; }
    public int CurrencyRatesId { get; set; }
    [JsonIgnore] public virtual PortfoliosModel? Portfolios { get; set; }
    [JsonIgnore] public virtual CurrencyRatesModel? CurrencyRates { get; set; }
}