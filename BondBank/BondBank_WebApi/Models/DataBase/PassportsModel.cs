using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using BondBank_WebApi.Models.Enums;

namespace BondBank_WebApi.Models.DataBase;

[Table("Passports")]
public sealed class PassportsModel : DataBaseModel
{
    [MaxLength(4)] public int Series { get; set; }
    [MaxLength(6)] public int Number { get; set; }

    [Required(AllowEmptyStrings = true)]
    [MaxLength(200)]
    public string IssuedBy { get; set; } = string.Empty;

    public DateOnly DateOfIssue { get; set; }

    [Required(AllowEmptyStrings = true)]
    [MaxLength(100)]
    public string DepartmentCode { get; set; } = string.Empty;

    public GenderType Gender { get; set; }
    public DateOnly DateOfBirth { get; set; }

    [Required(AllowEmptyStrings = true)]
    [MaxLength(100)]
    public string PlaceOfBirth { get; set; } = string.Empty;

    [JsonIgnore] public UsersModel? User { get; set; }
}