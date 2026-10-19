namespace Shared.Services.MinIO;

public sealed class MinioFileInfo
{
    public string Key { get; set; } = string.Empty;
    public long? Size { get; set; }
    public DateTime LastModified { get; set; }
}