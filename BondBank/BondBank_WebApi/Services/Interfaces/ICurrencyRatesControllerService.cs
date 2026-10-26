using BondBank_WebApi.Models.DataBase;

namespace BondBank_WebApi.Services.Interfaces;

/// <summary>
/// Для заключения контракта между контроллером и сервисом
/// </summary>
public interface ICurrencyRatesControllerService
{
    Task<IEnumerable<CurrencyRatesModel>> GetAllCurrencyRatesAsync();
    Task<CurrencyRatesModel> GetCurrencyRateByDateReceiptAsync(DateOnly date, string currency);
    Task<IEnumerable<string>> GetCurrencyAsync();
    Task<IEnumerable<CurrencyRatesModel>> GetCurrencyRatesByFilterAsync(string? currency, DateOnly? date);
}