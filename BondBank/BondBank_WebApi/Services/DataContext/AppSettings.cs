namespace BondBank_WebApi.Services.DataContext;

public sealed class AppSettings
{
    public HashSet<string> ValidBondTypes { get; set; } = new HashSet<string>();
}