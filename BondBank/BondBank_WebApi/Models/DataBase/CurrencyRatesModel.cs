using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace BondBank_WebApi.Models.DataBase;

[Table("CurrencyRates")]
public class CurrencyRatesModel : DataBaseModel
{
    public int DigitalCode { get; set; }
    [MaxLength(25)] public string LetterCode { get; set; }
    public int Units { get; set; }
    [MaxLength(100)] public string Currency { get; set; }
    [Column(TypeName = "decimal(18,4)")] public decimal Rate { get; set; }
    public DateOnly DateReceipt { get; set; }

    [JsonIgnore] public virtual ICollection<WienerBoerseBondsModel>? WienerBoerseBonds { get; set; }
    [JsonIgnore] public virtual ICollection<LjubljanaStockExchangeBondsModel>? LjubljanaStockExchangeBonds { get; set; }
    [JsonIgnore] public virtual ICollection<MoscowExchangeBondsModel>? MoscowExchangeBonds { get; set; }
    [JsonIgnore] public virtual ICollection<SixGroupBondsModel>? SixGroupBonds { get; set; }
}