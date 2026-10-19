using BondBank_WebApi.Models.DataBase;
using BondBank_WebApi.Services.DataContext;
using BondBank_WebApi.Services.Interfaces;
using BondBank_WebApi.Models.DTOs.Users;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace BondBank_WebApi.Controllers.Users;

public sealed class UsersControllerService(
    ILogger<UsersControllerService> logger,
    ApplicationContext dbContext) : IUsersControllerService
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

    public async Task<UsersModel?> GetInfoByKeycloakIdAsync(string keycloakId)
    {
        logger.LogInformation($"Процесс получения информации о пользователе по Keycloak ID");
        return await LoadUserByKeycloakIdAsync(keycloakId);
    }

    public async Task CreateUserFromKeycloakAsync(CreateUserFromKeycloakDto dto)
    {
        try
        {
            var user = new UsersModel
            {
                KeycloakId = dto.KeycloakId,
                EmailAddress = dto.EmailAddress,
                FirstName = dto.FirstName,
                SecondName = dto.SecondName,
                SurName = string.Empty,
                Login = dto.Login,
                PhoneNumber = null,
                TIN = null,
                PassportId = null,
                SnilsId = null,
                LastLoginAt = DateTime.UtcNow
            };

            dbContext.Users.Add(user);
            await dbContext.SaveChangesAsync();
            logger.LogInformation($"User {dto.EmailAddress} created in local DB from Keycloak");
        }
        catch (Exception ex)
        {
            logger.LogError($"Error creating user from Keycloak: {ex.Message}");
            throw;
        }
    }

    public async Task UpdateUserFromKeycloakAsync(string keycloakId, UpdateUserFromKeycloakDto dto)
    {
        try
        {
            var user = await LoadUserByKeycloakIdAsync(keycloakId);
            if (user != null)
            {
                user.EmailAddress = dto.EmailAddress;
                user.FirstName = dto.FirstName;
                user.SecondName = dto.SecondName;
                user.PhoneNumber = dto.PhoneNumber;
                user.TIN = dto.TIN;

                await dbContext.SaveChangesAsync();
                logger.LogInformation($"User {keycloakId} updated in local DB from Keycloak");
            }
        }
        catch (Exception ex)
        {
            logger.LogError($"Error updating user from Keycloak: {ex.Message}");
            throw;
        }
    }

    public async Task DeleteUserByKeycloakIdAsync(string keycloakId)
    {
        try
        {
            var user = await LoadUserByKeycloakIdAsync(keycloakId);
            if (user != null)
            {
                dbContext.Users.Remove(user);
                await dbContext.SaveChangesAsync();
                logger.LogInformation($"User {keycloakId} deleted from local DB");
            }
        }
        catch (Exception ex)
        {
            logger.LogError($"Error deleting user from Keycloak: {ex.Message}");
            throw;
        }
    }

    public async Task EnsureUserExistsAsync(string keycloakId, string email, string name)
    {
        var existingUser = await LoadUserByKeycloakIdAsync(keycloakId);
        if (existingUser == null)
        {
            await CreateUserFromKeycloakAsync(new CreateUserFromKeycloakDto(
                KeycloakId: keycloakId,
                EmailAddress: email,
                FirstName: name,
                SecondName: string.Empty,
                Login: email
            ));
        }
        else
        {
            // Обновляем время последнего входа при каждом обращении
            existingUser.LastLoginAt = DateTime.UtcNow;
            await dbContext.SaveChangesAsync();
        }
    }

    // ==================== ПРИВАТНЫЕ МЕТОДЫ ====================

    private async Task<UsersModel?> LoadUserByKeycloakIdAsync(string keycloakId)
    {
        try
        {
            var user = await dbContext.Users.FirstOrDefaultAsync(u => u.KeycloakId == keycloakId);
            if (user != null) return user;

            logger.LogWarning($"User with Keycloak ID {keycloakId} not found");
            return null;
        }
        catch (Exception ex)
        {
            logger.LogError($"Error loading user by Keycloak ID: {ex.Message}");
            return null;
        }
    }

    private async Task<List<UsersModel>> LoadAllUsersAsync()
    {
        try
        {
            var usersData = await dbContext.Users.ToListAsync();
            if (usersData.Any()) return usersData;

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
            if (user != null) return user;

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
            if (user != null) return user;

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
            if (user != null) return user;

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
            if (user != null) return user;

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
            if (user != null) return user;

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
            if (user != null) return user;

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