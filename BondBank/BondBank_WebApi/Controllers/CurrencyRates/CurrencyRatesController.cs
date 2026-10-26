using BondBank_WebApi.Services.Interfaces;
using BondBank_WebApi.Models.DTOs.CurrencyRates;
using Microsoft.AspNetCore.Mvc;

namespace BondBank_WebApi.Controllers.CurrencyRates;

[ApiController]
[Route("api/currency-rates")]
public sealed class CurrencyRatesController(
    ILogger<CurrencyRatesController> logger,
    ICurrencyRatesControllerService currencyRatesService) : ControllerBase
{
    [HttpGet("get-all")]
    public async Task<IActionResult> GetAllCurrencyRatesAsync()
    {
        try
        {
            var currencyRatesData = await currencyRatesService.GetAllCurrencyRatesAsync();
            var currencyRatesModels = currencyRatesData.ToList();
            if (currencyRatesModels.Count != 0)
            {
                return Ok(currencyRatesModels.Select(CurrencyRateDto.From));
            }

            return NotFound(new { message = $"Данных о курсах валют в БД нет" });
        }
        catch (Exception ex)
        {
            logger.LogError("Ошибка при получении всех курсов валют: {ExMessage}", ex.Message);
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpGet("get-by-date-receipt-all")]
    public async Task<IActionResult> GetAllCurrencyRatesByDateReceiptAsync(DateOnly date)
    {
        try
        {
            var currentDate = DateTime.UtcNow;
            if (Convert.ToDateTime(date) > currentDate)
            {
                logger.LogWarning("Дата '{DateOnly}' не может быть позднее текущей '{CurrentDate}'", date, currentDate);
                return BadRequest(new { message = $"Дата '{date}' не может быть позднее текущей '{currentDate}'" });
            }

            var currencyRatesData = await currencyRatesService.GetAllCurrencyRatesByDateReceiptAsync(date);
            var currencyRatesModels = currencyRatesData.ToList();
            if (currencyRatesModels.Count != 0)
            {
                return Ok(currencyRatesModels.Select(CurrencyRateDto.From));
            }

            return NotFound(new { message = $"Данных о курсах валют за дату: '{date}' нет" });
        }
        catch (Exception ex)
        {
            logger.LogError("Ошибка при получении курсов валют за дату: '{DateOnly}'. {ExMessage}", date, ex.Message);
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpGet("get-by-date-receipt")]
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
                logger.LogWarning("Дата '{DateOnly}' не может быть позднее текущей '{CurrentDate}'", date, currentDate);
                return BadRequest(new { message = $"Дата '{date}' не может быть позднее текущей '{currentDate}'" });
            }

            var currencyRatesData = await currencyRatesService.GetCurrencyRateByDateReceiptAsync(date, currency);
            if (currencyRatesData.Id <= 0)
            {
                return NotFound(new { message = $"Данных о курсе валюты '{currency}' за дату '{date}' нет" });
            }

            return Ok(CurrencyRateDto.From(currencyRatesData));
        }
        catch (Exception ex)
        {
            logger.LogError("Ошибка при получении курса валюты: '{Currency}' за дату '{DateOnly}'. {ExMessage}", currency, date, ex.Message);
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpGet("get-by-currency")]
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
            var currencyRatesModels = currencyRatesData.ToList();
            if (currencyRatesModels.Count != 0)
            {
                return Ok(currencyRatesModels.Select(CurrencyRateDto.From));
            }

            return NotFound(new { message = $"Данных о курсах валюты: '{currency}' нет" });
        }
        catch (Exception ex)
        {
            logger.LogError("Ошибка при получении курсов валюты: '{Currency}'. {ExMessage}", currency, ex.Message);
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpGet("get-name-currency")]
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
            logger.LogError("Ошибка при получении названия валют: {ExMessage}", ex.Message);
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }
}