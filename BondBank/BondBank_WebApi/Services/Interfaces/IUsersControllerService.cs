using BondBank_WebApi.Models.DataBase;
using BondBank_WebApi.Models.DTOs.Users;

namespace BondBank_WebApi.Services.Interfaces;

public interface IUsersControllerService
{
    Task<IEnumerable<UsersModel>> GetAllUsersInfoAsync();
    Task<UsersModel?> GetInfoByKeycloakIdAsync(string keycloakId);
    Task CreateUserFromKeycloakAsync(CreateUserFromKeycloakDto dto);
    Task UpdateUserFromKeycloakAsync(string keycloakId, UpdateUserFromKeycloakDto dto);
    Task DeleteUserByKeycloakIdAsync(string keycloakId);
    Task EnsureUserExistsAsync(string keycloakId, string email, string secondName, string firstName);
    Task UpdateLastLoginAsync(string keycloakId);

    Task<IEnumerable<UsersModel>> GetUsersByFilterAsync(
        int? id, string? email, string? login, string? tin,
        string? phoneNumber, string? secondName, string? firstName, string? surName);
}