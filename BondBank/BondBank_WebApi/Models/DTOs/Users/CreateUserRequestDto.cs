namespace BondBank_WebApi.Models.DTOs.Users;

public record CreateUserRequestDto(
    string EmailAddress,
    string FirstName,
    string SecondName,
    string PhoneNumber,
    string TIN,
    string Password,
    string Role = "user"
);