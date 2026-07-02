using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace BondBank_WebApi.Models.DataBase;

public class BondsBaseModel : DataBaseModel
{
    [Required(AllowEmptyStrings = true)]
    [MaxLength(500)]
    public string Name { get; set; } = string.Empty;

    [Required(AllowEmptyStrings = true)]
    [MaxLength(50)]
    public string Isin { get; set; } = string.Empty;

    [Required] public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public int? PortfoliosId { get; set; }
    public int CurrencyRatesId { get; set; }
    [JsonIgnore] public PortfoliosModel? Portfolios { get; set; }
    [JsonIgnore] public CurrencyRatesModel? CurrencyRates { get; set; }
}