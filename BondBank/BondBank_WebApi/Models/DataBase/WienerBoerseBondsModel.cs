using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BondBank_WebApi.Models.DataBase;

[Table("WienerBoerseBonds")]
public sealed class WienerBoerseBondsModel : BondsBaseModel
{
    [Required]
    [Column(TypeName = "decimal(18,4)")]
    public decimal Last { get; set; }

    [Required(AllowEmptyStrings = true)]
    [MaxLength(25)]
    public string Chg { get; set; } = string.Empty;

    [Required] public DateTime Date { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Bid { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Ask { get; set; }

    [Required] public DateOnly Maturity { get; set; }
    [Required] public char Status { get; set; }

    [Required(AllowEmptyStrings = true)]
    [MaxLength(10)]
    public string Currency { get; set; } = string.Empty;
}