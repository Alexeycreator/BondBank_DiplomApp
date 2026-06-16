using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace BondBank_WebApi.Models.DataBase;

[Table("HistoryPortfolio")]
public class HistoryPortfoliosModel : DataBaseModel
{
    [Required] public DateTime DateSavePortfolioUser { get; set; }

    [Required(AllowEmptyStrings = true)]
    [MaxLength(4000)]
    public string Details { get; set; } = string.Empty;

    [Required] public int UsersId { get; set; }
    [Required] public int PortfoliosId { get; set; }
    [JsonIgnore] public virtual UsersModel? Users { get; set; }
    [JsonIgnore] public virtual PortfoliosModel? Portfolios { get; set; }
}