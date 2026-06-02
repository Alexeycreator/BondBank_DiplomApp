namespace Shared.Models;

public abstract class BondBase
{
    public string? Name { get; set; }
    public string? Isin { get; set; }
    public DateTime UpdatedAt { get; set; }
}