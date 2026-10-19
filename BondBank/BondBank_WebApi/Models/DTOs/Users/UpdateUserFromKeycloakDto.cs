namespace BondBank_WebApi.Models.DTOs.Users;

public record UpdateUserFromKeycloakDto(
    string EmailAddress,
    string FirstName,
    string SecondName,
    string PhoneNumber,
    string TIN
);