using BondBank_WebApi.Models.DataBase;
using BondBank_WebApi.Models.Enums;

namespace BondBank_WebApi.Models.DTOs.Passports;

public sealed record PassportDto(
    int Id,
    int Series,
    int Number,
    string IssuedBy,
    DateOnly DateOfIssue,
    string DepartmentCode,
    GenderType Gender,
    DateOnly DateOfBirth,
    string PlaceOfBirth)
{
    public static PassportDto From(PassportsModel model) =>
        new(
            model.Id,
            model.Series,
            model.Number,
            model.IssuedBy,
            model.DateOfIssue,
            model.DepartmentCode,
            model.Gender,
            model.DateOfBirth,
            model.PlaceOfBirth);
}
