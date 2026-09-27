namespace BondBank_WebApi.Models.DTOs;

public sealed class MainInfoDto
{
    public long TotalBonds { get; set; }
    public long ActiveUsers { get; set; }
    public long Partners { get; set; }
    public long Exchanges { get; set; }
}