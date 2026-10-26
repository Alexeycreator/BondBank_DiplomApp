namespace BondBank_WebApi.Models.DTOs.Bonds;

public sealed record BondResponseDto(
    string Type,
    BondBaseDto Bond,
    object SpecificData
);
