using BondBank_WebApi.HelperMethods.Validators;
using BondBank_WebApi.Models.DTOs.BondHistories;
using BondBank_WebApi.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BondBank_WebApi.Controllers.BondHistories;

[ApiController]
[Route("api/bond-histories")]
public sealed class BondHistoriesController(
    ILogger<BondHistoriesController> logger,
    IBondHistoriesControllerService bondHistoriesService,
    BondValidator validator,
    CommonValidator commonValidator) : ControllerBase
{
    /// <summary>
    /// Метод получения всех данных из истории облигаций
    /// </summary>
    /// <returns>Возвращает список со всеми данными в таблице</returns>
    [HttpGet("all")]
    public async Task<IActionResult> GetAllBondHistoriesAsync()
    {
        try
        {
            var bondHistoriesData = await bondHistoriesService.GetAllBondHistoriesAsync();
            var bondHistoryModels = bondHistoriesData.ToList();
            if (bondHistoryModels.Count != 0)
                return Ok(bondHistoryModels.Select(BondHistoryDto.From));

            return NotFound(new { message = $"Данных об истории облигаций нет" });
        }
        catch (Exception ex)
        {
            logger.LogError("Ошибка при получении истории всех облигаций: {ExMessage}", ex.Message);
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    /// <summary>
    /// Метод для получения всех данных истории облигаций по isin
    /// </summary>
    /// <param name="isin">ISIN облигации</param>
    /// <returns>Возвращает список данных облигации указанного ISIN</returns>
    [HttpGet("isin/{isin}")]
    public async Task<IActionResult> GetBondHistoriesByIsinAsync(string isin)
    {
        try
        {
            var validationResult = validator.ValidateIsin(isin);
            if (validationResult != null)
                return validationResult;

            var bondHistoriesData = await bondHistoriesService.GetBondHistoriesByIsinAsync(isin);
            var bondHistoryModels = bondHistoriesData.ToList();
            if (bondHistoryModels.Count != 0)
                return Ok(bondHistoryModels.Select(BondHistoryDto.From));

            return NotFound(new { message = $"Данных истории об облигация по ISIN: '{isin}' нет" });
        }
        catch (Exception ex)
        {
            logger.LogError("Ошибка при получении истории облигаций по ISIN: '{Isin}'. {ExMessage}", isin, ex.Message);
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    /// <summary>
    /// Метод получения истории облигаций по типу, тип проверяется в файле конфигурации приложения и приводится к нижнему регистру
    /// </summary>
    /// <param name="type">Тип облигации</param>
    /// <returns>Возвращает список облигаций указанного типа</returns>
    [HttpGet("type/{type}")]
    public async Task<IActionResult> GetBondHistoriesByTypeAsync(string type)
    {
        try
        {
            var validationResult = validator.ValidateType(type);
            if (validationResult != null)
                return validationResult;

            var normalizedType = type.ToLowerInvariant();
            var bondHistoriesData = await bondHistoriesService.GetBondHistoriesByTypeAsync(normalizedType);
            var bondHistoryModels = bondHistoriesData.ToList();
            if (bondHistoryModels.Count != 0)
                return Ok(bondHistoryModels.Select(BondHistoryDto.From));

            return NotFound(new { message = $"Данных истории об облигациях типа: '{type}' нет" });
        }
        catch (Exception ex)
        {
            logger.LogError("Ошибка при получении истории облигаций по типу: '{Type}'. {ExMessage}", type, ex.Message);
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    /// <summary>
    /// Получение истории облигаций за дату
    /// </summary>
    /// <param name="date">Интересующая дата истории</param>
    /// <returns>Возвращает список истории облигации за дату</returns>
    [HttpGet("date/{date}")]
    public async Task<IActionResult> GetBondHistoriesByRecordedDateAsync(DateOnly date)
    {
        try
        {
            var validationResult = commonValidator.ValidateDate(date);
            if (validationResult != null)
                return validationResult;

            var bondHistoriesData = await bondHistoriesService.GetBondHistoriesByRecordedDateAsync(date);
            var bondHistoryModels = bondHistoriesData.ToList();
            if (bondHistoryModels.Count != 0)
                return Ok(bondHistoryModels.Select(BondHistoryDto.From));

            return NotFound(new { message = $"Данных истории об облигациях за дату: {date} нет" });
        }
        catch (Exception ex)
        {
            logger.LogError("Ошибка при получении истории облигаций по дате: {DateOnly}. {ExMessage}", date,
                ex.Message);
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    /// <summary>
    /// Получение всех типов облигаций
    /// </summary>
    /// <returns>Возвращает список типов облигаций</returns>
    [HttpGet("names-type")]
    public async Task<IActionResult> GetNamesTypeAsync()
    {
        try
        {
            var namesTypeData = await bondHistoriesService.GetTypeBondHistoriesAsync();
            if (namesTypeData.Any())
                return Ok(namesTypeData);

            return NotFound(new { message = $"Данных о типах облигаций нет" });
        }
        catch (Exception ex)
        {
            logger.LogError("Неизвестная ошибка при получении типов облигаций: {ExMessage}", ex.Message);
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpGet("filter")]
    public async Task<IActionResult> GetByFilter([FromQuery] string? isin, [FromQuery] string? type,
        [FromQuery] DateOnly? date)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(type) && !date.HasValue)
                return BadRequest();

            var result = await bondHistoriesService.GetByFilterAsync(isin, type, date);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка при фильтрации истории");
            return StatusCode(500, new { error = ex.Message });
        }
    }
}