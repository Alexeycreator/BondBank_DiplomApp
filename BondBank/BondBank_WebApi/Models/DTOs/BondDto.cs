using BondBank_WebApi.Models.DataBase;

namespace BondBank_WebApi.Models.DTOs;

public sealed class BondDto
{
    public string? Type { get; set; }
    public BondsBaseModel? Bond { get; set; }
    public object? SpecificData { get; set; }
}