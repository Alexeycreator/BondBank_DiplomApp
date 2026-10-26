using BondBank_WebApi.Models.DTOs.Bonds;
using BondBank_WebApi.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BondBank_WebApi.Controllers.Bonds;

[ApiController]
[Route("api/bonds")]
public sealed class BondsController(
    ILogger<BondsController> logger,
    IBondControllerService bondService) : ControllerBase
{
    [HttpGet("all")]
    public async Task<IActionResult> GetAllBondsAsync()
    {
        try
        {
            var bonds = await bondService.GetAllBondsAsync();
            var bondDtos = bonds.ToList();
            if (bondDtos.Count != 0)
            {
                return Ok(bondDtos
                    .Where(bond => bond.Bond is not null && bond.Type is not null)
                    .Select(BondDtoMapper.ToResponseDto));
            }

            logger.LogWarning($"Облигаций нет в системе");
            return NotFound(new { message = $"Облигаций нет в системе" });
        }
        catch (Exception ex)
        {
            logger.LogError($"Ошибка при получении всех облигаций: {ex.Message}");
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpGet("type/{type}")]
    public async Task<IActionResult> GetBondsByTypeAsync(string type)
    {
        try
        {
            var bonds = await bondService.GetBondsByTypeAsync(type);
            var bondDtos = bonds.ToList();
            if (bondDtos.Count != 0)
            {
                return Ok(bondDtos
                    .Where(bond => bond.Bond is not null && bond.Type is not null)
                    .Select(BondDtoMapper.ToResponseDto));
            }

            logger.LogWarning("Облигаций типа: '{Type}' нет в системе", type);
            return NotFound(new { message = $"Облигаций типа: '{type}' нет в системе" });
        }
        catch (Exception ex)
        {
            logger.LogError("Ошибка при получении облигации по ее типу: {ExMessage}", ex.Message);
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpGet("isin/{isin}")]
    public async Task<IActionResult> GetBondByIsinAsync(string isin)
    {
        try
        {
            var bond = await bondService.GetBondByIsinAsync(isin);
            if (bond != null)
            {
                return Ok(BondDtoMapper.ToResponseDto(bond));
            }

            logger.LogWarning("Облигации с isin: '{Isin}' нет в системе", isin);
            return NotFound(new { message = $"Облигации с isin: '{isin}' нет в системе" });
        }
        catch (Exception ex)
        {
            logger.LogError("Ошибка при получении облигации по ISIN: {ExMessage}", ex.Message);
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }
    
    [HttpGet("forecast")]
    public async Task<IActionResult> GetAllForecastsAsync()
    {
        try
        {
            var forecastBonds = await bondService.GetForecastBondsAsync();
            if (forecastBonds.Count != 0)
            {
                return Ok(forecastBonds);
            }
            return NotFound(new { message = "Данных для прогнозирования нет" });
        }
        catch (Exception ex)
        {
            logger.LogError("Ошибка при получении прогнозов: {ExMessage}", ex.Message);
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }
    
    [HttpGet("forecast/{isin}")]
    public async Task<IActionResult> GetForecastByIsinAsync(string isin)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(isin))
                return BadRequest(new { message = "ISIN не может быть пустым" });
            
            if (isin.Length != 12)
                return BadRequest(new { message = "ISIN должен содержать 12 символов" });

            var forecastBonds = await bondService.GetForecastBondsAsync();
        
            if (forecastBonds.TryGetValue(isin, out var forecast))
            {
                return Ok(new { isin, forecast });
            }

            return NotFound(new { message = $"ISIN: '{isin}' не найден в системе" });
        }
        catch (Exception ex)
        {
            logger.LogError("Ошибка при получении прогноза по ISIN: {ExMessage}", ex.Message);
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }
}