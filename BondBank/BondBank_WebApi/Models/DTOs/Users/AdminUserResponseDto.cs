using BondBank_WebApi.Models.DataBase;

namespace BondBank_WebApi.Models.DTOs.Users;

public sealed record AdminUserResponseDto(
    int Id,
    string SecondName,
    string FirstName,
    string SurName,
    string EmailAddress,
    string? PhoneNumber,
    string? TIN,
    string Login,
    DateTime? LastLoginAt)
{
    public static AdminUserResponseDto From(UsersModel model) =>
        new(
            model.Id,
            model.SecondName,
            model.FirstName,
            model.SurName,
            model.EmailAddress,
            model.PhoneNumber,
            model.TIN,
            model.Login,
            model.LastLoginAt);
}
