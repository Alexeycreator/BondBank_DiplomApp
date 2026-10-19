namespace BondBank_WebApi.Models.DTOs.Users;

public record UserResponseDto(
    int Id,
    string SecondName,
    string FirstName,
    string SurName,
    string EmailAddress,
    string PhoneNumber,
    string TIN,
    string Login,
    int PassportId,
    int? SnilsId,
    string? KeycloakId,
    DateTime? LastLoginAt
);