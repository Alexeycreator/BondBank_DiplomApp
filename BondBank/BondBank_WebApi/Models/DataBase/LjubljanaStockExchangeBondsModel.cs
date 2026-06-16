using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace BondBank_WebApi.Models.DataBase;

[Table("LjubljanaStockExchangeBonds")]
public class LjubljanaStockExchangeBondsModel : BondsBaseModel
{
    [Required(AllowEmptyStrings = true)]
    [MaxLength(10)]
    public string Symbol { get; set; } = string.Empty;

    [Required] public char Sector { get; set; }
    [Required] public long ListedQuantity { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal NominalValue { get; set; }

    [Required(AllowEmptyStrings = true)]
    [MaxLength(10)]
    public string Currency { get; set; } = string.Empty;

    [Required] public DateOnly ListingDate { get; set; }
    public DateOnly? DelistingDate { get; set; }

    public int? PortfoliosId { get; set; }
    public int CurrencyRatesId { get; set; }
    [JsonIgnore] public virtual PortfoliosModel? Portfolios { get; set; }
    [JsonIgnore] public virtual CurrencyRatesModel? CurrencyRates { get; set; }
}