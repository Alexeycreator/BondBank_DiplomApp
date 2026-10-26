using BondBank_WebApi.HelperMethods.Validators;
using BondBank_WebApi.Services.Interfaces;
using BondBank_WebApi.Models.DTOs.CurrencyRates;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BondBank_WebApi.Controllers.CurrencyRates;

[ApiController]
[Route("api/currency-rates")]
public sealed class CurrencyRatesController(
    ILogger<CurrencyRatesController> logger,
    ICurrencyRatesControllerService currencyRatesService,
    CommonValidator commonValidator,
    CurrencyRateValidator validator) : ControllerBase
{
    /// <summary>
    /// Получить все курсы валют
    /// </summary>
    [HttpGet("all")]
    [Authorize]
    public async Task<IActionResult> GetAllCurrencyRatesAsync()
    {
        try
        {
            var currencyRatesData = await currencyRatesService.GetAllCurrencyRatesAsync();
            var currencyRatesModels = currencyRatesData.ToList();

            if (currencyRatesModels.Count != 0)
                return Ok(currencyRatesModels.Select(CurrencyRateDto.From));

            logger.LogWarning("Данных о курсах валют в БД нет");
            return NotFound(new { message = "Данных о курсах валют в БД нет" });
        }
        catch (Exception ex)
        {
            logger.LogError("Ошибка при получении всех курсов валют: {ExMessage}", ex.Message);
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    /// <summary>
    /// Получить список доступных названий валют (например, для выпадающего списка)
    /// </summary>
    [HttpGet("names-currency")]
    [Authorize]
    public async Task<IActionResult> GetCurrencyNamesAsync()
    {
        try
        {
            var currencyData = await currencyRatesService.GetCurrencyAsync();
            if (currencyData.Any())
                return Ok(currencyData);

            logger.LogWarning("Данных о названиях валют нет");
            return NotFound(new { message = "Данных о названиях валют нет" });
        }
        catch (Exception ex)
        {
            logger.LogError("Ошибка при получении названия валют: {ExMessage}", ex.Message);
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    /// <summary>
    /// Универсальный поиск курсов валют по фильтру (валюта, дата)
    /// </summary>
    /// <param name="currency">Код валюты (например, EUR, USD)</param>
    /// <param name="date">Дата курса</param>
    [HttpGet("filter")]
    [Authorize]
    public async Task<IActionResult> GetCurrencyRatesByFilterAsync(
        [FromQuery] string? currency,
        [FromQuery] DateOnly? date)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(currency) && !date.HasValue)
                return await GetAllCurrencyRatesAsync();

            if (!string.IsNullOrWhiteSpace(currency))
            {
                var validationCurrencyResult = validator.ValidateCurrency(currency);
                if (validationCurrencyResult != null)
                    return validationCurrencyResult;
            }

            if (date.HasValue)
            {
                var validationDateResult = commonValidator.ValidateDate(date.Value);
                if (validationDateResult != null)
                    return validationDateResult;
            }

            var currencyRatesData = await currencyRatesService.GetCurrencyRatesByFilterAsync(currency, date);
            var currencyRatesModels = currencyRatesData.ToList();

            if (currencyRatesModels.Count != 0)
                return Ok(currencyRatesModels.Select(CurrencyRateDto.From));

            logger.LogWarning("По заданным фильтрам курсы валют не найдены");
            return NotFound(new { message = "По заданным фильтрам курсы валют не найдены" });
        }
        catch (Exception ex)
        {
            logger.LogError("Ошибка при фильтрации курсов валют: {ExMessage}", ex.Message);
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }
}