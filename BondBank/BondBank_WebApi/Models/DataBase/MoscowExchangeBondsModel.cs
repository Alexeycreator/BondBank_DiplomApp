using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BondBank_WebApi.Models.DataBase;

[Table("MoscowExchangeBonds")]
public sealed class MoscowExchangeBondsModel : BondsBaseModel
{
    [Required(AllowEmptyStrings = true)]
    [MaxLength(100)]
    public string SecurityType { get; set; } = string.Empty;

    [Required] public int SecurityTypeId { get; set; }

    [Required(AllowEmptyStrings = true)]
    [MaxLength(100)]
    public string Type { get; set; } = string.Empty;

    [Required(AllowEmptyStrings = true)]
    [MaxLength(50)]
    public string SecId { get; set; } = string.Empty;

    [Required(AllowEmptyStrings = true)]
    [MaxLength(100)]
    public string ShortName { get; set; } = string.Empty;

    [Required(AllowEmptyStrings = true)]
    [MaxLength(100)]
    public string RegNumber { get; set; } = string.Empty;

    [Required] public bool IsTraded { get; set; }

    [Required(AllowEmptyStrings = true)]
    [MaxLength(50)]
    public string PrimaryBoardId { get; set; } = string.Empty;

    [Required(AllowEmptyStrings = true)]
    [MaxLength(25)]
    public string Market { get; set; } = string.Empty;

    [Required(AllowEmptyStrings = true)]
    [MaxLength(25)]
    public string Engine { get; set; } = string.Empty;

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal FaceValue { get; set; }

    [Required(AllowEmptyStrings = true)]
    [MaxLength(10)]
    public string FaceUnit { get; set; } = string.Empty;
}