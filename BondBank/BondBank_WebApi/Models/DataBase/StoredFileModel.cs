using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BondBank_WebApi.Models.DataBase;

[Table("StoredFiles")]
public sealed class StoredFileModel : DataBaseModel
{
    [Required] [MaxLength(255)] public string OriginalFileName { get; set; } = string.Empty;
    [MaxLength(500)] public string? MinIoKey { get; set; }
    [MaxLength(500)] public string? LocalPath { get; set; }
    [MaxLength(100)] public string ContentType { get; set; } = string.Empty;
    public long SizeBytes { get; set; }
    [MaxLength(100)] public string Folder { get; set; } = string.Empty;
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}