using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace BondBank_WebApi.Models.DataBase;

[Table("Portfolio")]
public class PortfoliosModel : DataBaseModel
{
    [Required] [MaxLength(100)] public string Name { get; set; } = "DefaultName";
    [Required] public int UserId { get; set; }
    [JsonIgnore] public virtual UsersModel? Users { get; set; }
    [MaxLength(500)] public string? Description { get; set; }
    [MaxLength(50)] public string? Type { get; set; }
    public DateOnly CreatedAt { get; set; }
    [JsonIgnore] public virtual ICollection<LjubljanaStockExchangeBondsModel>? LjubljanaStockExchangeBonds { get; set; }
    [JsonIgnore] public virtual ICollection<MoscowExchangeBondsModel>? MoscowExchangeBonds { get; set; }
    [JsonIgnore] public virtual ICollection<SixGroupBondsModel>? SixGroupBonds { get; set; }
    [JsonIgnore] public virtual ICollection<WienerBoerseBondsModel>? WienerBoerseBonds { get; set; }
    [JsonIgnore] public virtual ICollection<HistoryPortfoliosModel>? HistoryPortfolios { get; set; }
}