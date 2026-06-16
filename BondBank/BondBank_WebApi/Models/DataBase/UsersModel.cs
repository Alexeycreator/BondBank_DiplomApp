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

    [Required(AllowEmptyStrings = true)]
    [MaxLength(12)]
    [DataType(DataType.PhoneNumber)]
    [RegularExpression(@"^(\+7|7|8)\d{10}$", ErrorMessage = "Формат: 8XXXXXXXXXX, 7XXXXXXXXXX или +7XXXXXXXXXX")]
    public string PhoneNumber { get; set; } = string.Empty;

    [Required(AllowEmptyStrings = true)]
    [MaxLength(12)]
    [RegularExpression(@"^\d{10}$|^\d{12}$", ErrorMessage = "ИНН должен содержать 10 или 12 цифр")]
    public string TIN { get; set; } = string.Empty;

    [Required(AllowEmptyStrings = true)]
    [MaxLength(100)]
    public string Login { get; set; } = string.Empty;

    [Required(AllowEmptyStrings = true)]
    [DataType(DataType.Password)]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{10,100}$",
        ErrorMessage =
            "Пароль должен содержать от 10 до 100 символов, включать заглавные и строчные буквы, цифры и специальные символы")]
    public string Password { get; set; } = string.Empty;

    [MaxLength(1000)] public string? PasswordHash { get; set; }
    [MaxLength(500)] public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiryTime { get; set; }
    public DateTime? LastLoginAt { get; set; }
    [Required] public int LoginAttempts { get; set; } = 0;
    public DateTime? LockoutEnd { get; set; }

    [Required] public int PassportId { get; set; }
    public int? SnilsId { get; set; }
    [JsonIgnore] public virtual PassportsModel? Passports { get; set; }
    [JsonIgnore] public virtual SnilsModel? Snils { get; set; }
    [JsonIgnore] public virtual ICollection<PortfoliosModel>? Portfolios { get; set; }
    [JsonIgnore] public virtual ICollection<HistoryPortfoliosModel>? HistoryPortfolios { get; set; }
}