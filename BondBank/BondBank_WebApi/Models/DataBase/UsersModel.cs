using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace BondBank_WebApi.Models.DataBase;

[Table("Users")]
public class UsersModel : DataBaseModel
{
    [Required(AllowEmptyStrings = true)]
    [MaxLength(100)]
    public string SecondName { get; set; } = string.Empty;

    [Required(AllowEmptyStrings = true)]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required(AllowEmptyStrings = true)]
    [MaxLength(100)]
    public string SurName { get; set; } = string.Empty;

    [Required(AllowEmptyStrings = true)]
    [MaxLength(100)]
    [DataType(DataType.EmailAddress)]
    public string EmailAddress { get; set; } = string.Empty;

    [MaxLength(12)]
    [DataType(DataType.PhoneNumber)]
    public string? PhoneNumber { get; set; } = string.Empty;

    [MaxLength(12)] public string? TIN { get; set; } = string.Empty;

    [Required(AllowEmptyStrings = true)]
    [MaxLength(100)]
    public string Login { get; set; } = string.Empty;

    [MaxLength(255)] public string? KeycloakId { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public int? PassportId { get; set; }
    public int? SnilsId { get; set; }

    [JsonIgnore] public virtual PassportsModel? Passports { get; set; }
    [JsonIgnore] public virtual SnilsModel? Snils { get; set; }
    [JsonIgnore] public virtual ICollection<PortfoliosModel>? Portfolios { get; set; }
    [JsonIgnore] public virtual ICollection<HistoryPortfoliosModel>? HistoryPortfolios { get; set; }
}