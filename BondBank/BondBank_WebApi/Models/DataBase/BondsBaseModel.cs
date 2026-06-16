using System.ComponentModel.DataAnnotations;

namespace BondBank_WebApi.Models.DataBase;

public class BondsBaseModel : DataBaseModel
{
    [Required(AllowEmptyStrings = true)]
    [MaxLength(500)]
    public string Name { get; set; } = string.Empty;

    [Required(AllowEmptyStrings = true)]
    [MaxLength(50)]
    public string Isin { get; set; } = string.Empty;

    [Required] public DateTime UpdatedAt { get; set; } = DateTime.Now;
}