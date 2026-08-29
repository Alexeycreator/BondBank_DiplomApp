using BondBank_WebApi.Models.DataBase;
using BondBank_WebApi.Services.DataContext;
using BondBank_WebApi.Services.Interfaces;
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
            {
                return snilsData;
            }

            logger.LogWarning($"Данных снилс с ID = {snilsId} нет");
            return null;
        }
        catch (NpgsqlException ex)
        {
            logger.LogError($"Ошибка при работе Npgsql: {ex.Message}. Code: {ex.ErrorCode}");
            return null;
        }
        catch (Exception ex)
        {
            logger.LogError($"Неизвестная ошибка при получении данных снилс по ID = {snilsId}. {ex.Message}");
            return null;
        }
    }
}