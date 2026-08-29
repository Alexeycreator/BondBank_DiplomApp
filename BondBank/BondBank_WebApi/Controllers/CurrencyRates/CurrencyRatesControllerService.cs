using BondBank_WebApi.Models.DataBase;
using BondBank_WebApi.Services.DataContext;
using BondBank_WebApi.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace BondBank_WebApi.Controllers.CurrencyRates;

public sealed class CurrencyRatesControllerService(
    ILogger<CurrencyRatesControllerService> logger,
    ApplicationContext dbContext) : ICurrencyRatesControllerService
{
    private readonly HashSet<string> currencies = new HashSet<string>();

    public async Task<IEnumerable<CurrencyRatesModel>> GetAllCurrencyRatesAsync()
    {
        logger.LogInformation($"Процесс получения всех курсов валют");
        return await LoadCurrencyRatesAsync();
    }

    public async Task<IEnumerable<CurrencyRatesModel>> GetCurrencyRatesByCurrencyAsync(string currency)
    {
        logger.LogInformation($"Процесс получения значений валюты '{currency}'");
        return await LoadCurrencyRatesAsync(currency);
    }

    public async Task<CurrencyRatesModel> GetCurrencyRateByDateReceiptAsync(DateOnly date, string currency)
    {
        logger.LogInformation($"Процесс получения курса валюты '{currency}' за дату: {date}");
        return await LoadCurrencyRatesAsync(date, currency);
    }

    public async Task<IEnumerable<CurrencyRatesModel>> GetAllCurrencyRatesByDateReceiptAsync(DateOnly date)
    {
        logger.LogInformation($"Процесс получения курсов валют за дату: {date}");
        return await LoadCurrencyRatesAsync(date);
    }

    public async Task<IEnumerable<string>> GetCurrencyAsync()
    {
        logger.LogInformation($"Процесс получения названия валют");
        return await GetCurrencyNamesAsync();
    }

    private async Task<List<CurrencyRatesModel>> LoadCurrencyRatesAsync()
    {
        try
        {
            var currencyRatesData = await dbContext.CurrencyRates.ToListAsync();
            if (currencyRatesData.Any())
            {
                return currencyRatesData;
            }

            logger.LogWarning($"Данных о курсах валют в БД нет.");
            return new List<CurrencyRatesModel>();
        }
        catch (NpgsqlException ex)
        {
            logger.LogError($"Ошибка при работе Npgsql: {ex.Message}. Code: '{ex.ErrorCode}'");
            return new List<CurrencyRatesModel>();
        }
        catch (Exception ex)
        {
            logger.LogError($"Неизвестная ошибка при заполнении данных всех курсов валют: {ex.Message}");
            return new List<CurrencyRatesModel>();
        }
    }

    private async Task<List<CurrencyRatesModel>> LoadCurrencyRatesAsync(string currency)
    {
        try
        {
            var currencyRatesData = await dbContext.CurrencyRates.Where(c => c.Currency == currency).ToListAsync();
            if (currencyRatesData.Any())
            {
                return currencyRatesData;
            }

            logger.LogWarning($"Данных о курсах валюты: '{currency}' в БД нет.");
            return new List<CurrencyRatesModel>();
        }
        catch (NpgsqlException ex)
        {
            logger.LogError($"Ошибка при работе Npgsql: {ex.Message}. Code: '{ex.ErrorCode}'");
            return new List<CurrencyRatesModel>();
        }
        catch (Exception ex)
        {
            logger.LogError($"Неизвестная ошибка при заполнении данных о курсах валюты: '{currency}'. {ex.Message}");
            return new List<CurrencyRatesModel>();
        }
    }

    private async Task<CurrencyRatesModel> LoadCurrencyRatesAsync(DateOnly date, string currency)
    {
        try
        {
            var currencyRatesData = await dbContext.CurrencyRates
                .FirstOrDefaultAsync(c => c.DateReceipt == date && c.Currency == currency);
            if (currencyRatesData != null)
            {
                return currencyRatesData;
            }

            logger.LogWarning($"Данных о курсах валюты: '{currency}' за дату {date} в БД нет");
            return new CurrencyRatesModel();
        }
        catch (NpgsqlException ex)
        {
            logger.LogError($"Ошибка при работе Npgsql: {ex.Message}. Code: '{ex.ErrorCode}'");
            return new CurrencyRatesModel();
        }
        catch (Exception ex)
        {
            logger.LogError(
                $"Неизвестная ошибка при заполнении данных о курсах валюты: '{currency}' за дату: {date}. {ex.Message}");
            return new CurrencyRatesModel();
        }
    }

    private async Task<List<CurrencyRatesModel>> LoadCurrencyRatesAsync(DateOnly date)
    {
        try
        {
            var currencyRatesData = await dbContext.CurrencyRates.Where(c => c.DateReceipt == date).ToListAsync();
            if (currencyRatesData.Any())
            {
                return currencyRatesData;
            }

            logger.LogWarning($"Данных о курсах валют за дату {date} в БД нет");
            return new List<CurrencyRatesModel>();
        }
        catch (NpgsqlException ex)
        {
            logger.LogError($"Ошибка при работе Npgsql: {ex.Message}. Code: '{ex.ErrorCode}'");
            return new List<CurrencyRatesModel>();
        }
        catch (Exception ex)
        {
            logger.LogError($"Неизвестная ошибка при заполнении данных о курсах валют за дату: {date}. {ex.Message}");
            return new List<CurrencyRatesModel>();
        }
    }

    private async Task<HashSet<string>> GetCurrencyNamesAsync()
    {
        try
        {
            if (currencies.Any())
            {
                return currencies;
            }

            var currencyData = await dbContext.CurrencyRates.Select(c => c.Currency).Distinct().ToListAsync();
            currencies.UnionWith(currencyData);
            logger.LogInformation($"Загружено валют: {currencies.Count}");

            return currencies;
        }
        catch (NpgsqlException ex)
        {
            logger.LogError($"Ошибка при работе Npgsql: {ex.Message}. Code: '{ex.ErrorCode}'");
            return new HashSet<string>();
        }
        catch (Exception ex)
        {
            logger.LogError($"Неизвестная ошибка при заполнении данных о названиях валют. {ex.Message}");
            return new HashSet<string>();
        }
    }
}