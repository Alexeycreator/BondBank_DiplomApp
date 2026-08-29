using BondBank_WebApi.Services.DataContext;
using BondBank_WebApi.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace BondBank_WebApi.Controllers.BondHistories;

[ApiController]
[Route("api/[controller]/bond-histories")]
public sealed class BondHistoriesController(
    ILogger<BondHistoriesController> logger,
    IBondHistoriesControllerService bondHistoriesService,
    IOptions<AppSettings> appSettings) : ControllerBase
{
    private readonly AppSettings valueAppSettings = appSettings.Value;
    
    [HttpGet("get-all")]
    public async Task<IActionResult> GetAllBondHistoriesAsync()
    {
        try
        {
            var bondHistoriesData = await bondHistoriesService.GetAllBondHistoriesAsync();
            if (bondHistoriesData.Any())
            {
                return Ok(bondHistoriesData);
            }

            return NotFound(new { message = $"Данных об истории облигаций нет" });
        }
        catch (Exception ex)
        {
            logger.LogError($"Ошибка при получении истории всех облигаций: {ex.Message}");
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }


    [HttpGet("get-by-isin")]
    public async Task<IActionResult> GetBondHistoriesByIsinAsync(string isin)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(isin))
            {
                return BadRequest(new { message = $"Введенный ISIN пустой или содержит пробелы" });
            }

            if (isin.Length != 12)
            {
                return BadRequest(new
                    { message = $"ISIN должен содержать ровно 12 символов, получено: {isin.Length}" });
            }

            var bondHistoriesData = await bondHistoriesService.GetBondHistoriesByIsinAsync(isin);
            if (bondHistoriesData.Any())
            {
                return Ok(bondHistoriesData);
            }

            return NotFound(new { message = $"Данных истории об облигация по ISIN: '{isin}' нет" });
        }
        catch (Exception ex)
        {
            logger.LogError($"Ошибка при получении истории облигаций по ISIN: '{isin}'. {ex.Message}");
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpGet("get-by-type")]
    public async Task<IActionResult> GetBondHistoriesByTypeAsync(string type)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(type))
            {
                return BadRequest(new { message = $"Тип облигации пустой или содержит пробелы" });
            }

            var normalizedType = type.ToLowerInvariant();
            var validBondsType = valueAppSettings.ValidBondTypes;
            if (!validBondsType.Contains(normalizedType))
            {
                return BadRequest(new { message = $"Такого типа: '{type}' облигаций нет в системе" });
            }

            var bondHistoriesData = await bondHistoriesService.GetBondHistoriesByTypeAsync(normalizedType);
            if (bondHistoriesData.Any())
            {
                return Ok(bondHistoriesData);
            }

            return NotFound(new { message = $"Данных истории об облигациях типа: '{type}' нет" });
        }
        catch (Exception ex)
        {
            logger.LogError($"Ошибка при получении истории облигаций по типу: '{type}'. {ex.Message}");
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpGet("get-by-date")]
    public async Task<IActionResult> GetBondHistoriesByRecordedDateAsync(DateOnly date)
    {
        try
        {
            var currentDate = DateTime.UtcNow;
            if (Convert.ToDateTime(date) > currentDate)
            {
                logger.LogWarning($"Дата '{date}' не может быть позднее текущей '{currentDate}'");
                return BadRequest(new { message = $"Дата '{date}' не может быть позднее текущей '{currentDate}'" });
            }

            var bondHistoriesData = await bondHistoriesService.GetBondHistoriesByRecordedDateAsync(date);
            if (bondHistoriesData.Any())
            {
                return Ok(bondHistoriesData);
            }

            return NotFound(new { message = $"Данных истории об облигациях за дату: {date} нет" });
        }
        catch (Exception ex)
        {
            logger.LogError($"Ошибка при получении истории облигаций по дате: {date}. {ex.Message}");
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpGet("get-names-type")]
    public async Task<IActionResult> GetNamesTypeAsync()
    {
        try
        {
            var namesTypeData = await bondHistoriesService.GetTypeBondHistoriesAsync();
            if (namesTypeData.Any())
            {
                return Ok(namesTypeData);
            }

            return NotFound(new { message = $"Данных о типах облигаций нет" });
        }
        catch (Exception ex)
        {
            logger.LogError($"Неизвестная ошибка при получении типов облигаций: {ex.Message}");
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }
}