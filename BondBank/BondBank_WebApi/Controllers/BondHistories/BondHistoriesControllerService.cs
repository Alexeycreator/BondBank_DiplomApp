using BondBank_WebApi.Models.DataBase;
using BondBank_WebApi.Services.DataContext;
using BondBank_WebApi.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace BondBank_WebApi.Controllers.BondHistories;

public sealed class BondHistoriesControllerService(
    ILogger<BondHistoriesControllerService> logger,
    ApplicationContext dbContext) : IBondHistoriesControllerService
{
    private readonly HashSet<string> namesTypeBondHistories = new HashSet<string>();

    public async Task<IEnumerable<BondHistoryModel>> GetAllBondHistoriesAsync()
    {
        logger.LogInformation($"Процесс получения всей истории об облигациях...");
        return await LoadBondHistories();
    }

    public async Task<IEnumerable<BondHistoryModel>> GetBondHistoriesByIsinAsync(string isin)
    {
        logger.LogInformation("Процесс получения всей истории облигации с ISIN: '{Isin}'", isin);
        return await LoadBondHistoriesByIsin(isin);
    }

    public async Task<IEnumerable<BondHistoryModel>> GetBondHistoriesByTypeAsync(string type)
    {
        logger.LogInformation("Процесс получения всей истории облигаций типа: '{Type}'", type);
        return await LoadBondHistoriesByType(type);
    }

    public async Task<IEnumerable<BondHistoryModel>> GetBondHistoriesByRecordedDateAsync(DateOnly date)
    {
        logger.LogInformation("Процесс получения всей истории облигаций за дату: {DateOnly}", date);
        return await LoadBondHistories(date);
    }

    public async Task<IEnumerable<string>> GetTypeBondHistoriesAsync()
    {
        logger.LogInformation($"Процесс получения типов облигаций");
        return await GetNamesTypeAsync();
    }

    public async Task<IEnumerable<BondHistoryModel>> GetByFilterAsync(string? isin, string? type, DateOnly? date)
    {
        logger.LogInformation($"Процесс получения истории облигаций по фильтру");
        return await SearchByFilter(isin, type, date);
    }

    private async Task<List<BondHistoryModel>> LoadBondHistories()
    {
        try
        {
            var bondHistoriesData = await dbContext.BondHistories.ToListAsync();
            if (bondHistoriesData.Any())
            {
                return bondHistoriesData;
            }

            logger.LogWarning($"Данных об истории облигаций нет");
            return new List<BondHistoryModel>();
        }
        catch (NpgsqlException ex)
        {
            logger.LogError("Ошибка при работе Npgsql: {ExMessage}. Code: {ExErrorCode}", ex.Message, ex.ErrorCode);
            return new List<BondHistoryModel>();
        }
        catch (Exception ex)
        {
            logger.LogError("Неизвестная ошибка при получении историй всех облигаций: {ExMessage}", ex.Message);
            return new List<BondHistoryModel>();
        }
    }

    private async Task<List<BondHistoryModel>> LoadBondHistories(DateOnly date)
    {
        try
        {
            var bondHistoriesData = await dbContext.BondHistories.Where(b => b.RecordedDate == date).ToListAsync();
            if (bondHistoriesData.Any())
            {
                return bondHistoriesData;
            }

            logger.LogWarning("Данных истории об облигациях за дату {DateOnly} нет", date);
            return new List<BondHistoryModel>();
        }
        catch (NpgsqlException ex)
        {
            logger.LogError("Ошибка при работе Npgsql: {ExMessage}. Code: {ExErrorCode}", ex.Message, ex.ErrorCode);
            return new List<BondHistoryModel>();
        }
        catch (Exception ex)
        {
            logger.LogError("Неизвестная ошибка при получении истории всех облигаций за дату {DateOnly}: {ExMessage}", date, ex.Message);
            return new List<BondHistoryModel>();
        }
    }

    private async Task<List<BondHistoryModel>> LoadBondHistoriesByIsin(string isin)
    {
        try
        {
            var bondHistoriesData = await dbContext.BondHistories.Where(b => b.Isin == isin).ToListAsync();
            if (bondHistoriesData.Any())
            {
                return bondHistoriesData;
            }

            logger.LogWarning("Данных истории об облигациях с ISIN: '{Isin}' нет", isin);
            return new List<BondHistoryModel>();
        }
        catch (NpgsqlException ex)
        {
            logger.LogError("Ошибка при работе Npgsql: {ExMessage}. Code: {ExErrorCode}", ex.Message, ex.ErrorCode);
            return new List<BondHistoryModel>();
        }
        catch (Exception ex)
        {
            logger.LogError("Неизвестная ошибка при получении истории облигаций по ISIN: '{Isin}'. {ExMessage}", isin, ex.Message);
            return new List<BondHistoryModel>();
        }
    }

    private async Task<List<BondHistoryModel>> LoadBondHistoriesByType(string type)
    {
        try
        {
            var bondHistoriesData = await dbContext.BondHistories.Where(b => b.BondType == type).ToListAsync();
            if (bondHistoriesData.Any())
            {
                return bondHistoriesData;
            }

            logger.LogWarning("Данных истории об облигациях типа: '{Type}' нет", type);
            return new List<BondHistoryModel>();
        }
        catch (NpgsqlException ex)
        {
            logger.LogError("Ошибка при работе Npgsql: {ExMessage}. Code: {ExErrorCode}", ex.Message, ex.ErrorCode);
            return new List<BondHistoryModel>();
        }
        catch (Exception ex)
        {
            logger.LogError("Неизвестная ошибка при получении истории облигаций типа: '{Type}'. {ExMessage}", type, ex.Message);
            return new List<BondHistoryModel>();
        }
    }

    private async Task<HashSet<string>> GetNamesTypeAsync()
    {
        try
        {
            if (namesTypeBondHistories.Count != 0)
            {
                return namesTypeBondHistories;
            }

            var namesTypeData = await dbContext.BondHistories.Select(b => b.BondType).Distinct().ToListAsync();
            namesTypeBondHistories.UnionWith(namesTypeData!);
            return namesTypeBondHistories;
        }
        catch (NpgsqlException ex)
        {
            logger.LogError("Ошибка при работе Npgsql: {ExMessage}. Code: '{ExErrorCode}'", ex.Message, ex.ErrorCode);
            return new HashSet<string>();
        }
        catch (Exception ex)
        {
            logger.LogError("Неизвестная ошибка при получении типов облигаций: {ExMessage}", ex.Message);
            return new HashSet<string>();
        }
    }

    private async Task<IEnumerable<BondHistoryModel>> SearchByFilter(string? isin, string? type, DateOnly? date)
    {
        var query = dbContext.BondHistories.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(isin))
        {
            query = query.Where(h => h.Isin == isin);
        }

        if (!string.IsNullOrWhiteSpace(type))
        {
            query = query.Where(h => h.BondType == type);
        }

        if (date.HasValue)
        {
            query = query.Where(h => h.RecordedDate == date.Value);
        }

        return await query.ToListAsync();
    }
}