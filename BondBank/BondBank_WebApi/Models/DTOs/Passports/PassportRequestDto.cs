using BondBank_WebApi.Models.Enums;

namespace BondBank_WebApi.Models.DTOs.Passports;

public sealed record PassportRequestDto(
    int Series,
    int Number,
    string IssuedBy,
    DateOnly DateOfIssue,
    string DepartmentCode,
    GenderType Gender,
    DateOnly DateOfBirth,
    string PlaceOfBirth);