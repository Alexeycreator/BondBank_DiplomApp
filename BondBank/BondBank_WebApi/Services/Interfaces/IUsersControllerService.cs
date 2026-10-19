using BondBank_WebApi.Models.DataBase;
using BondBank_WebApi.Models.DTOs.Users;

namespace BondBank_WebApi.Services.Interfaces;

public interface IUsersControllerService
{
    Task<IEnumerable<UsersModel>> GetAllUsersInfoAsync();
    Task<UsersModel?> GetInfoByEmailAsync(string email);
    Task<UsersModel?> GetInfoByPhoneNumberAsync(string phoneNumber);
    Task<UsersModel?> GetInfoByTinAsync(string tin);
    Task<UsersModel?> GetInfoByLoginAsync(string login);
    Task<UsersModel?> GetInfoByFullNameAsync(string secondName, string firstName, string surName);
    Task<UsersModel?> GetFullInfoUserByIdAsync(int userId);
    Task<UsersModel?> GetInfoByKeycloakIdAsync(string keycloakId);
    Task CreateUserFromKeycloakAsync(CreateUserFromKeycloakDto dto);
    Task UpdateUserFromKeycloakAsync(string keycloakId, UpdateUserFromKeycloakDto dto);
    Task DeleteUserByKeycloakIdAsync(string keycloakId);
    Task EnsureUserExistsAsync(string keycloakId, string email, string name);
}