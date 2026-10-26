using BondBank_WebApi.Models.DataBase;
using BondBank_WebApi.Models.DTOs.Snils;
using BondBank_WebApi.Services.DataContext;
using BondBank_WebApi.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace BondBank_WebApi.Controllers.Snils;

public sealed class SnilsControllerService(
    ILogger<SnilsControllerService> logger,
    ApplicationContext dbContext) : ISnilsControllerService
{
    public async Task<SnilsModel?> GetAllInfoByIdAsync(int snilsId)
    {
        logger.LogInformation($"Процесс получения данных снилс");
        return await LoadSnilsByIdAsync(snilsId);
    }

    private async Task<SnilsModel?> LoadSnilsByIdAsync(int snilsId)
    {
        try
        {
            var snilsData = await dbContext.Snils.FindAsync(snilsId);
            if (snilsData != null)
                return snilsData;

            logger.LogWarning("Данных снилс с ID = {SnilsId} нет", snilsId);
            return null;
        }
        catch (NpgsqlException ex)
        {
            logger.LogError("Ошибка при работе Npgsql: {ExMessage}. Code: {ExErrorCode}", ex.Message, ex.ErrorCode);
            return null;
        }
        catch (Exception ex)
        {
            logger.LogError("Неизвестная ошибка при получении данных снилс по ID = {SnilsId}. {ExMessage}", snilsId,
                ex.Message);
            return null;
        }
    }

    public async Task<bool> SaveSnilsAsync(string keycloakId, SnilsRequestDto dto)
    {
        try
        {
            var user = await dbContext.Users.FirstOrDefaultAsync(u => u.KeycloakId == keycloakId);
            if (user == null)
            {
                logger.LogWarning("Пользователь с KeycloakId {KeycloakId} не найден", keycloakId);
                return false;
            }

            SnilsModel? snils;

            if (user.SnilsId.HasValue)
            {
                snils = await dbContext.Snils.FindAsync(user.SnilsId.Value);
                if (snils == null) 
                    return false;
            }
            else
            {
                snils = new SnilsModel();
                await dbContext.Snils.AddAsync(snils);
            }

            snils.Number = dto.Number;
            snils.RegistrationDate = dto.RegistrationDate;

            await dbContext.SaveChangesAsync();

            if (!user.SnilsId.HasValue)
            {
                user.SnilsId = snils.Id;
                await dbContext.SaveChangesAsync();
            }

            logger.LogInformation("СНИЛС для пользователя {Email} успешно сохранен", user.EmailAddress);
            return true;
        }
        catch (NpgsqlException ex)
        {
            logger.LogError("Ошибка БД при сохранении СНИЛС: {ExMessage}. Код: {ExErrorCode}", ex.Message,
                ex.ErrorCode);
            return false;
        }
        catch (Exception ex)
        {
            logger.LogError("Неизвестная ошибка при сохранении СНИЛС: {ExMessage}", ex.Message);
            return false;
        }
    }

    public async Task<bool> DeleteSnilsAsync(string keycloakId)
    {
        try
        {
            var user = await dbContext.Users.FirstOrDefaultAsync(u => u.KeycloakId == keycloakId);
            if (user == null)
                return false;

            if (!user.SnilsId.HasValue)
                return false;

            var snils = await dbContext.Snils.FindAsync(user.SnilsId.Value);

            user.SnilsId = null;

            if (snils != null)
            {
                dbContext.Snils.Remove(snils);
            }

            await dbContext.SaveChangesAsync();
            logger.LogInformation("СНИЛС пользователя {Email} удален", user.EmailAddress);
            return true;
        }
        catch (NpgsqlException ex)
        {
            logger.LogError("Ошибка БД при удалении СНИЛС: {ExMessage}. Код: {ExErrorCode}", ex.Message, ex.ErrorCode);
            return false;
        }
        catch (Exception ex)
        {
            logger.LogError("Неизвестная ошибка при удалении СНИЛС: {ExMessage}", ex.Message);
            return false;
        }
    }
}