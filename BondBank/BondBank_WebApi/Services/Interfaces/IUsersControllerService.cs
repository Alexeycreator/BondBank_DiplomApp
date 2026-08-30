using BondBank_WebApi.Models.DataBase;

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
}