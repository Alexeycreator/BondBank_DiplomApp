namespace BondBank_WebApi.Models.DTOs.Users;

public record CreateUserFromKeycloakDto(
    string KeycloakId,
    string EmailAddress,
    string FirstName,
    string SecondName,
    string Login
);