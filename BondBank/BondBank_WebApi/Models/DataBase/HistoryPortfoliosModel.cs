using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace BondBank_WebApi.Models.DataBase;

[Table("HistoryPortfolio")]
public class HistoryPortfoliosModel : DataBaseModel
{
    [Required] public DateTime DateSavePortfolioUser { get; set; }
    [Column(TypeName = "decimal(18,4)")] public decimal TotalValue { get; set; }
    [Column(TypeName = "decimal(18,4)")] public decimal TotalYield { get; set; }
    [Required] public int UsersId { get; set; }
    [Required] public int PortfoliosId { get; set; }
    [JsonIgnore] public virtual UsersModel? Users { get; set; }
    [JsonIgnore] public virtual PortfoliosModel? Portfolios { get; set; }
}