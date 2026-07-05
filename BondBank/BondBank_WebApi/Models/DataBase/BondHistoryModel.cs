using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BondBank_WebApi.Models.DataBase;

[Table("BondHistories")]
public sealed class BondHistoryModel : DataBaseModel
{
    [MaxLength(15)] public string? Isin { get; set; }
    public DateOnly RecordedDate { get; set; }

    [Column(TypeName = "decimal(18,4)")] public decimal CurrencyRate { get; set; }
    [Column(TypeName = "decimal(18,4)")] public decimal BondPrice { get; set; }
    [MaxLength(10)] public string? BondType { get; set; }
}