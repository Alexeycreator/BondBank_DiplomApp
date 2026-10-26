using BondBank_WebApi.Models.DataBase;
using BondBank_WebApi.Services.DataContext;
using BondBank_WebApi.Services.Interfaces;
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
            {
                return passportData;
            }

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
            logger.LogError("Неизвестная ошибка при получении данных о паспорте с id: '{PassportId}'. {ExMessage}", passportId, ex.Message);
            return null;
        }
    }
}