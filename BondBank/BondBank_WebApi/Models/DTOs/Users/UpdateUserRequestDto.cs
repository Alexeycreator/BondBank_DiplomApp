namespace BondBank_WebApi.Models.DTOs.Users;

public record UpdateUserRequestDto(
    string KeycloakUserId,
    string EmailAddress,
    string FirstName,
    string SecondName,
    string PhoneNumber,
    string TIN
);