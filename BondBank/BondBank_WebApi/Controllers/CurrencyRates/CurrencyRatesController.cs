using BondBank_WebApi.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BondBank_WebApi.Controllers.CurrencyRates;

[ApiController]
[Route("api/[controller]/get-currency-rates")]
public sealed class CurrencyRatesController(
    ILogger<CurrencyRatesController> logger,
    ICurrencyRatesControllerService currencyRatesService) : ControllerBase
{
    [HttpGet("all")]
    public async Task<IActionResult> GetAllCurrencyRatesAsync()
    {
        try
        {
            var currencyRatesData = await currencyRatesService.GetAllCurrencyRatesAsync();
            if (currencyRatesData.Any())
            {
                return Ok(currencyRatesData);
            }

            return NotFound(new { message = $"Данных о курсах валют в БД нет" });
        }
        catch (Exception ex)
        {
            logger.LogError($"Ошибка при получении всех курсов валют: {ex.Message}");
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpGet("by-date-receipt-all")]
    public async Task<IActionResult> GetAllCurrencyRatesByDateReceiptAsync(DateOnly date)
    {
        try
        {
            var currentDate = DateTime.UtcNow;
            if (Convert.ToDateTime(date) > currentDate)
            {
                logger.LogWarning($"Дата '{date}' не может быть позднее текущей '{currentDate}'");
                return BadRequest(new { message = $"Дата '{date}' не может быть позднее текущей '{currentDate}'" });
            }

            var currencyRatesData = await currencyRatesService.GetAllCurrencyRatesByDateReceiptAsync(date);
            if (currencyRatesData.Any())
            {
                return Ok(currencyRatesData);
            }

            return NotFound(new { message = $"Данных о курсах валют за дату: '{date}' нет" });
        }
        catch (Exception ex)
        {
            logger.LogError($"Ошибка при получении курсов валют за дату: '{date}'. {ex.Message}");
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpGet("by-date-receipt")]
    public async Task<IActionResult> GetCurrencyRateByDateReceiptAsync(DateOnly date, string currency)
    {
        try
        {
            if (string.IsNullOrEmpty(currency))
            {
                logger.LogWarning($"Название валюты пустое или содержит пробелы");
                return BadRequest(new { message = $"Название валюты пустое или содержит пробелы" });
            }

            var currentDate = DateTime.UtcNow;
            if (Convert.ToDateTime(date) > currentDate)
            {
                logger.LogWarning($"Дата '{date}' не может быть позднее текущей '{currentDate}'");
                return BadRequest(new { message = $"Дата '{date}' не может быть позднее текущей '{currentDate}'" });
            }

            var currencyRatesData = await currencyRatesService.GetCurrencyRateByDateReceiptAsync(date, currency);
            return Ok(currencyRatesData);
        }
        catch (Exception ex)
        {
            logger.LogError($"Ошибка при получении курса валюты: '{currency}' за дату '{date}'. {ex.Message}");
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpGet("by-currency")]
    public async Task<IActionResult> GetCurrencyRatesByCurrencyAsync(string currency)
    {
        try
        {
            if (string.IsNullOrEmpty(currency))
            {
                logger.LogWarning($"Название валюты пустое или содержит пробелы");
                return BadRequest(new { message = $"Название валюты пустое или содержит пробелы" });
            }

            var currencyRatesData = await currencyRatesService.GetCurrencyRatesByCurrencyAsync(currency);
            if (currencyRatesData.Any())
            {
                return Ok(currencyRatesData);
            }

            return NotFound(new { message = $"Данных о курсах валюты: '{currency}' нет" });
        }
        catch (Exception ex)
        {
            logger.LogError($"Ошибка при получении курсов валюты: '{currency}'. {ex.Message}");
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpGet("name-currency")]
    public async Task<IActionResult> GetCurrencyNamesAsync()
    {
        try
        {
            var currencyData = await currencyRatesService.GetCurrencyAsync();
            if (currencyData.Any())
            {
                return Ok(currencyData);
            }

            return NotFound(new { message = $"Данных о названиях валют нет" });
        }
        catch (Exception ex)
        {
            logger.LogError($"Ошибка при получении названия валют: {ex.Message}");
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }
}