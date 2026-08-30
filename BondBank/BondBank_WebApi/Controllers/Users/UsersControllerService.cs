using System.Text;
using BondBank_WebApi.Models.DataBase;
using BondBank_WebApi.Services.DataContext;
using BondBank_WebApi.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace BondBank_WebApi.Controllers.Users;

public sealed class UsersControllerService(
    ILogger<UsersControllerService> logger,
    ApplicationContext dbContext)
    : IUsersControllerService
{
    public async Task<IEnumerable<UsersModel>> GetAllUsersInfoAsync()
    {
        logger.LogInformation($"Процесс получения информации о всех пользователях");
        return await LoadAllUsersAsync();
    }

    public async Task<UsersModel?> GetFullInfoUserByIdAsync(int userId)
    {
        logger.LogInformation($"Процесс получения информации о пользователе");
        return await LoadUserByIdAsync(userId);
    }

    public async Task<UsersModel?> GetInfoByEmailAsync(string email)
    {
        logger.LogInformation($"Процесс получения информации о пользователе по его email");
        return await LoadUserByEmailAsync(email);
    }

    public async Task<UsersModel?> GetInfoByLoginAsync(string login)
    {
        logger.LogInformation($"Процесс получения информации о пользователе по его логину");
        return await LoadUserByLoginAsync(login);
    }

    public async Task<UsersModel?> GetInfoByTinAsync(string tin)
    {
        logger.LogInformation($"Процесс получения информации о пользователе по его ИНН");
        return await LoadUserByTinAsync(tin);
    }

    public async Task<UsersModel?> GetInfoByFullNameAsync(string secondName, string firstName, string surName)
    {
        logger.LogInformation($"Процесс получения информации о пользователе по его ФИО");
        return await LoadUserByFullNameAsync(secondName, firstName, surName);
    }

    public async Task<UsersModel?> GetInfoByPhoneNumberAsync(string phoneNumber)
    {
        logger.LogInformation($"Процесс получения информации о пользователе по его номеру телефона");
        return await LoadUserByPhoneNumberAsync(phoneNumber);
    }

    private async Task<List<UsersModel>> LoadAllUsersAsync()
    {
        try
        {
            var usersData = await dbContext.Users.ToListAsync();
            if (usersData.Any())
            {
                return usersData;
            }

            logger.LogWarning($"Данных о пользователях нет");
            return new List<UsersModel>();
        }
        catch (NpgsqlException ex)
        {
            logger.LogError($"Ошибка при работе Npgsql: {ex.Message}. Code: {ex.ErrorCode}");
            return new List<UsersModel>();
        }
        catch (Exception ex)
        {
            logger.LogError($"Неизвестная ошибка при получении всех пользователей: {ex.Message}");
            return new List<UsersModel>();
        }
    }

    private async Task<UsersModel?> LoadUserByIdAsync(int userId)
    {
        try
        {
            var user = await dbContext.Users.FindAsync(userId);
            if (user != null)
            {
                return user;
            }

            logger.LogWarning($"Данных о пользователе ID = {userId} нет");
            return null;
        }
        catch (NpgsqlException ex)
        {
            logger.LogError($"Ошибка при работе Npgsql: {ex.Message}. Code: {ex.ErrorCode}");
            return null;
        }
        catch (Exception ex)
        {
            logger.LogError($"Неизвестная ошибка при получении всех пользователей: {ex.Message}");
            return null;
        }
    }

    private async Task<UsersModel?> LoadUserByEmailAsync(string email)
    {
        try
        {
            var user = await dbContext.Users.FirstOrDefaultAsync(u => u.EmailAddress == email);
            if (user != null)
            {
                return user;
            }

            logger.LogWarning($"Данных о пользователе с email: '{email}' нет");
            return null;
        }
        catch (NpgsqlException ex)
        {
            logger.LogError($"Ошибка при работе Npgsql: {ex.Message}. Code: {ex.ErrorCode}");
            return null;
        }
        catch (Exception ex)
        {
            logger.LogError($"Неизвестная ошибка при получении всех пользователей: {ex.Message}");
            return null;
        }
    }

    private async Task<UsersModel?> LoadUserByLoginAsync(string login)
    {
        try
        {
            var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Login == login);
            if (user != null)
            {
                return user;
            }

            logger.LogWarning($"Данных о пользователе с логином: '{login}' нет");
            return null;
        }
        catch (NpgsqlException ex)
        {
            logger.LogError($"Ошибка при работе Npgsql: {ex.Message}. Code: {ex.ErrorCode}");
            return null;
        }
        catch (Exception ex)
        {
            logger.LogError($"Неизвестная ошибка при получении всех пользователей: {ex.Message}");
            return null;
        }
    }

    private async Task<UsersModel?> LoadUserByTinAsync(string tin)
    {
        try
        {
            var user = await dbContext.Users.FirstOrDefaultAsync(u => u.TIN == tin);
            if (user != null)
            {
                return user;
            }

            logger.LogWarning($"Данных о пользователе с ИНН: '{tin}' нет");
            return null;
        }
        catch (NpgsqlException ex)
        {
            logger.LogError($"Ошибка при работе Npgsql: {ex.Message}. Code: {ex.ErrorCode}");
            return null;
        }
        catch (Exception ex)
        {
            logger.LogError($"Неизвестная ошибка при получении всех пользователей: {ex.Message}");
            return null;
        }
    }

    private async Task<UsersModel?> LoadUserByFullNameAsync(string secondName, string firstName, string surName)
    {
        try
        {
            var user = await dbContext.Users.FirstOrDefaultAsync(u =>
                u.SecondName == secondName && u.FirstName == firstName && u.SurName == surName);
            if (user != null)
            {
                return user;
            }

            logger.LogWarning($"Данных о пользователе с ФИО: '{secondName} {firstName} {surName}' нет");
            return null;
        }
        catch (NpgsqlException ex)
        {
            logger.LogError($"Ошибка при работе Npgsql: {ex.Message}. Code: {ex.ErrorCode}");
            return null;
        }
        catch (Exception ex)
        {
            logger.LogError($"Неизвестная ошибка при получении всех пользователей: {ex.Message}");
            return null;
        }
    }

    private async Task<UsersModel?> LoadUserByPhoneNumberAsync(string phoneNumber)
    {
        try
        {
            var user = await dbContext.Users.FirstOrDefaultAsync(u => u.PhoneNumber == phoneNumber);
            if (user != null)
            {
                return user;
            }

            logger.LogWarning($"Данных о пользователе с номером телефона: '{phoneNumber}' нет");
            return null;
        }
        catch (NpgsqlException ex)
        {
            logger.LogError($"Ошибка при работе Npgsql: {ex.Message}. Code: {ex.ErrorCode}");
            return null;
        }
        catch (Exception ex)
        {
            logger.LogError($"Неизвестная ошибка при получении всех пользователей: {ex.Message}");
            return null;
        }
    }
}