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
            logger.LogInformation("User {DtoEmailAddress} created in local DB from Keycloak", dto.EmailAddress);
        }
        catch (Exception ex)
        {
            logger.LogError("Error creating user from Keycloak: {ExMessage}", ex.Message);
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
                logger.LogInformation("User {KeycloakId} updated in local DB from Keycloak", keycloakId);
            }
        }
        catch (Exception ex)
        {
            logger.LogError("Error updating user from Keycloak: {ExMessage}", ex.Message);
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
                logger.LogInformation("User {KeycloakId} deleted from local DB", keycloakId);
            }
        }
        catch (Exception ex)
        {
            logger.LogError("Error deleting user from Keycloak: {ExMessage}", ex.Message);
            throw;
        }
    }

    public async Task EnsureUserExistsAsync(string keycloakId, string email, string secondName, string firstName)
    {
        var existingUser = await LoadUserByKeycloakIdAsync(keycloakId);
        if (existingUser == null)
        {
            await CreateUserFromKeycloakAsync(new CreateUserFromKeycloakDto(
                KeycloakId: keycloakId,
                EmailAddress: email,
                FirstName: firstName,
                SecondName: secondName,
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

            logger.LogWarning("User with Keycloak ID {KeycloakId} not found", keycloakId);
            return null;
        }
        catch (Exception ex)
        {
            logger.LogError("Error loading user by Keycloak ID: {ExMessage}", ex.Message);
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
            logger.LogError("Ошибка при работе Npgsql: {ExMessage}. Code: {ExErrorCode}", ex.Message, ex.ErrorCode);
            return new List<UsersModel>();
        }
        catch (Exception ex)
        {
            logger.LogError("Неизвестная ошибка при получении всех пользователей: {ExMessage}", ex.Message);
            return new List<UsersModel>();
        }
    }

    private async Task<UsersModel?> LoadUserByIdAsync(int userId)
    {
        try
        {
            var user = await dbContext.Users.FindAsync(userId);
            if (user != null) return user;

            logger.LogWarning("Данных о пользователе ID = {UserId} нет", userId);
            return null;
        }
        catch (NpgsqlException ex)
        {
            logger.LogError("Ошибка при работе Npgsql: {ExMessage}. Code: {ExErrorCode}", ex.Message, ex.ErrorCode);
            return null;
        }
        catch (Exception ex)
        {
            logger.LogError("Неизвестная ошибка при получении всех пользователей: {ExMessage}", ex.Message);
            return null;
        }
    }

    private async Task<UsersModel?> LoadUserByEmailAsync(string email)
    {
        try
        {
            var user = await dbContext.Users.FirstOrDefaultAsync(u => u.EmailAddress == email);
            if (user != null) return user;

            logger.LogWarning("Данных о пользователе с email: '{Email}' нет", email);
            return null;
        }
        catch (NpgsqlException ex)
        {
            logger.LogError("Ошибка при работе Npgsql: {ExMessage}. Code: {ExErrorCode}", ex.Message, ex.ErrorCode);
            return null;
        }
        catch (Exception ex)
        {
            logger.LogError("Неизвестная ошибка при получении всех пользователей: {ExMessage}", ex.Message);
            return null;
        }
    }

    private async Task<UsersModel?> LoadUserByLoginAsync(string login)
    {
        try
        {
            var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Login == login);
            if (user != null) return user;

            logger.LogWarning("Данных о пользователе с логином: '{Login}' нет", login);
            return null;
        }
        catch (NpgsqlException ex)
        {
            logger.LogError("Ошибка при работе Npgsql: {ExMessage}. Code: {ExErrorCode}", ex.Message, ex.ErrorCode);
            return null;
        }
        catch (Exception ex)
        {
            logger.LogError("Неизвестная ошибка при получении всех пользователей: {ExMessage}", ex.Message);
            return null;
        }
    }

    private async Task<UsersModel?> LoadUserByTinAsync(string tin)
    {
        try
        {
            var user = await dbContext.Users.FirstOrDefaultAsync(u => u.TIN == tin);
            if (user != null) return user;

            logger.LogWarning("Данных о пользователе с ИНН: '{Tin}' нет", tin);
            return null;
        }
        catch (NpgsqlException ex)
        {
            logger.LogError("Ошибка при работе Npgsql: {ExMessage}. Code: {ExErrorCode}", ex.Message, ex.ErrorCode);
            return null;
        }
        catch (Exception ex)
        {
            logger.LogError("Неизвестная ошибка при получении всех пользователей: {ExMessage}", ex.Message);
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

            logger.LogWarning("Данных о пользователе с ФИО: '{SecondName} {FirstName} {SurName}' нет", secondName, firstName, surName);
            return null;
        }
        catch (NpgsqlException ex)
        {
            logger.LogError("Ошибка при работе Npgsql: {ExMessage}. Code: {ExErrorCode}", ex.Message, ex.ErrorCode);
            return null;
        }
        catch (Exception ex)
        {
            logger.LogError("Неизвестная ошибка при получении всех пользователей: {ExMessage}", ex.Message);
            return null;
        }
    }

    private async Task<UsersModel?> LoadUserByPhoneNumberAsync(string phoneNumber)
    {
        try
        {
            var user = await dbContext.Users.FirstOrDefaultAsync(u => u.PhoneNumber == phoneNumber);
            if (user != null) return user;

            logger.LogWarning("Данных о пользователе с номером телефона: '{PhoneNumber}' нет", phoneNumber);
            return null;
        }
        catch (NpgsqlException ex)
        {
            logger.LogError("Ошибка при работе Npgsql: {ExMessage}. Code: {ExErrorCode}", ex.Message, ex.ErrorCode);
            return null;
        }
        catch (Exception ex)
        {
            logger.LogError("Неизвестная ошибка при получении всех пользователей: {ExMessage}", ex.Message);
            return null;
        }
    }
    
    public async Task UpdateLastLoginAsync(string keycloakId)
    {
        var user = await LoadUserByKeycloakIdAsync(keycloakId);
    
        if (user != null)
        {
            // Обновляем время последнего входа только если прошло больше 15 минут
            // (чтобы не делать лишние SaveChanges при каждом запросе)
            if (user.LastLoginAt == null || (DateTime.UtcNow - user.LastLoginAt.Value).TotalMinutes > 15)
            {
                user.LastLoginAt = DateTime.UtcNow;
                await dbContext.SaveChangesAsync();
                logger.LogInformation("Обновлено LastLoginAt для пользователя {UserEmailAddress}", user.EmailAddress);
            }
        }
        else
        {
            logger.LogWarning("Пользователь с KeycloakId {KeycloakId} не найден при обновлении времени входа.", keycloakId);
        }
    }
}