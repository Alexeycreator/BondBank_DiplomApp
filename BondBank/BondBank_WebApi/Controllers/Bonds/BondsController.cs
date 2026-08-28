using BondBank_WebApi.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BondBank_WebApi.Controllers.Bonds;

[ApiController]
[Route("api/[controller]")]
public sealed class BondsController(
    ILogger<BondsController> logger,
    IBondControllerService bondService) : ControllerBase
{
    [HttpGet("get-all-bonds")]
    public async Task<IActionResult> GetAllBondsAsync()
    {
        try
        {
            var bonds = await bondService.GetAllBondsAsync();
            if (bonds != null && bonds.Any())
            {
                return Ok(bonds);
            }

            logger.LogError($"Облигаций нет в системе");
            return NotFound(new { message = $"Облигаций нет в системе" });
        }
        catch (Exception ex)
        {
            logger.LogError($"Ошибка при получении всех облигаций: {ex.Message}");
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpGet("get-bonds-by-type")]
    public async Task<IActionResult> GetBondsByTypeAsync(string typeBond)
    {
        try
        {
            var bonds = await bondService.GetBondsByTypeAsync(typeBond);
            if (bonds != null && bonds.Any())
            {
                return Ok(bonds);
            }

            logger.LogError($"Облигаций типа: '{typeBond}' нет в системе");
            return NotFound(new { message = $"Облигаций типа: '{typeBond}' нет в системе" });
        }
        catch (Exception ex)
        {
            logger.LogError($"Ошибка при получении облигации по ее типу: {ex.Message}");
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpGet("get-bond-by-isin")]
    public async Task<IActionResult> GetBondByIsinAsync(string isin)
    {
        try
        {
            var bond = await bondService.GetBondByIsinAsync(isin);
            if (bond != null)
            {
                return Ok(bond);
            }

            logger.LogError($"Облигации с isin: '{isin}' нет в системе");
            return NotFound(new { message = $"Облигации с isin: '{isin}' нет в системе" });
        }
        catch (Exception ex)
        {
            logger.LogError($"Ошибка при получении облигации по ISIN: {ex.Message}");
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpGet("get-forecast-all-bonds-or-by-isin")]
    public async Task<IActionResult> GetForecastBondsAsync(string? isin)
    {
        try
        {
            var forecastBonds = await bondService.GetForecastBondsAsync();
            if (forecastBonds.Any())
            {
                if (!string.IsNullOrEmpty(isin))
                {
                    if (string.IsNullOrWhiteSpace(isin))
                    {
                        return BadRequest(new { message = "ISIN не может состоять только из пробелов" });
                    }

                    if (isin.Length != 12)
                    {
                        return BadRequest(new { message = "ISIN должен содержать 12 символов" });
                    }

                    if (forecastBonds.TryGetValue(isin, out var forecast))
                    {
                        return Ok(new { isin, forecast });
                    }

                    return NotFound(new { message = $"ISIN: '{isin}' не найден в системе" });
                }

                logger.LogInformation(
                    $"Пользователь не указал ISIN или он пустой, возвращаю целый список бондов с прогнозом");
                return Ok(forecastBonds);
            }

            logger.LogWarning($"Данных для прогнозирования нет");
            return NotFound(new { message = $"Данных для прогнозирования нет" });
        }
        catch (Exception ex)
        {
            logger.LogError($"Ошибка при получении прогнозов: {ex.Message}");
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }
}