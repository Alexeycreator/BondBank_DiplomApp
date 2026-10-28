using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BondBank_WebApi.Models.DataBase;

[Table("News")]
public sealed class NewsModel : DataBaseModel
{
    [Required] [MaxLength(50)] public string Category { get; set; }
    [Required] public DateOnly Date { get; set; }
    [Required] [MaxLength(150)] public string Title { get; set; }
    [MaxLength(1000)] public string? Image { get; set; }
    [Required] public string Body { get; set; }
}