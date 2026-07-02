using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BondBank_WebApi.Models.DataBase;

[Table("LjubljanaStockExchangeBonds")]
public sealed class LjubljanaStockExchangeBondsModel : BondsBaseModel
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
}