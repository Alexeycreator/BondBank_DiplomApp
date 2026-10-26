using BondBank_WebApi.Models.DataBase;
using BondBank_WebApi.Models.DTOs.Passports;
using BondBank_WebApi.Services.DataContext;
using BondBank_WebApi.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace BondBank_WebApi.Controllers.Passports;

public sealed class PassportsControllerService(ILogger<PassportsControllerService> logger, ApplicationContext dbContext)
    : IPassportsControllerService
{
    public async Task<PassportsModel?> GetAllInfoByIdAsync(int passportId)
    {
        logger.LogInformation("Получение информации о паспорте с id: '{PassportId}'", passportId);
        return await LoadPassportById(passportId);
    }

    private async Task<PassportsModel?> LoadPassportById(int passportId)
    {
        try
        {
            var passportData = await dbContext.Passports.FindAsync(passportId);
            if (passportData != null)
                return passportData;

            logger.LogWarning("Нет данных о паспорте с id: '{PassportId}'", passportId);
            return null;
        }
        catch (NpgsqlException ex)
        {
            logger.LogError("Ошибка при работе Npgsql: {ExMessage}", ex.Message);
            return null;
        }
        catch (Exception ex)
        {
            logger.LogError("Неизвестная ошибка при получении данных о паспорте с id: '{PassportId}'. {ExMessage}",
                passportId, ex.Message);
            return null;
        }
    }

    public async Task<bool> SavePassportAsync(string keycloakId, PassportRequestDto dto)
    {
        try
        {
            var user = await dbContext.Users.FirstOrDefaultAsync(u => u.KeycloakId == keycloakId);
            if (user == null)
            {
                logger.LogWarning("Пользователь с KeycloakId {KeycloakId} не найден", keycloakId);
                return false;
            }

            PassportsModel? passport;

            if (user.PassportId.HasValue)
            {
                passport = await dbContext.Passports.FindAsync(user.PassportId.Value);
                if (passport == null) return false; // Ситуация, когда ID есть, а записи нет (битые данные)
            }
            else
            {
                passport = new PassportsModel();
                await dbContext.Passports.AddAsync(passport);
            }

            passport.Series = dto.Series;
            passport.Number = dto.Number;
            passport.IssuedBy = dto.IssuedBy;
            passport.DateOfIssue = dto.DateOfIssue;
            passport.DepartmentCode = dto.DepartmentCode;
            passport.Gender = dto.Gender;
            passport.DateOfBirth = dto.DateOfBirth;
            passport.PlaceOfBirth = dto.PlaceOfBirth;

            await dbContext.SaveChangesAsync();

            if (!user.PassportId.HasValue)
            {
                user.PassportId = passport.Id;
                await dbContext.SaveChangesAsync();
            }

            logger.LogInformation("Паспорт для пользователя {Email} успешно сохранен", user.EmailAddress);
            return true;
        }
        catch (NpgsqlException ex)
        {
            logger.LogError("Ошибка БД при сохранении паспорта: {ExMessage}. Код: {ExErrorCode}", ex.Message, ex.ErrorCode);
            return false;
        }
        catch (Exception ex)
        {
            logger.LogError("Ошибка при сохранении паспорта: {ExMessage}", ex.Message);
            return false;
        }
    }

    public async Task<bool> DeletePassportAsync(string keycloakId)
    {
        try
        {
            var user = await dbContext.Users.FirstOrDefaultAsync(u => u.KeycloakId == keycloakId);
            if (user == null) 
                return false;

            if (!user.PassportId.HasValue)
                return false;

            var passport = await dbContext.Passports.FindAsync(user.PassportId.Value);
            user.PassportId = null;
            if (passport != null)
                dbContext.Passports.Remove(passport);
            
            await dbContext.SaveChangesAsync();
            logger.LogInformation("Паспорт пользователя {Email} удален", user.EmailAddress);
            return true;
        }
        catch (NpgsqlException ex)
        {
            logger.LogError("Ошибка БД при удалении паспорта: {ExMessage}. Код: {ExErrorCode}", ex.Message, ex.ErrorCode);
            return false;
        }
        catch (Exception ex)
        {
            logger.LogError("Ошибка при удалении паспорта: {ExMessage}", ex.Message);
            return false;
        }
    }
}