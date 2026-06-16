using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace BondBank_WebApi.Models.DataBase;

[Table("Snils")]
public sealed class SnilsModel : DataBaseModel
{
    [Required(AllowEmptyStrings = true)]
    [MaxLength(14)]
    public string Number { get; set; } = string.Empty;

    public DateOnly? RegistrationDate { get; set; }
    [JsonIgnore] public UsersModel? User { get; set; }
}