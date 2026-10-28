using BondBank_WebApi.HelperMethods.Validators;
using BondBank_WebApi.Models.DTOs.Bonds;
using BondBank_WebApi.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BondBank_WebApi.Controllers.Bonds;

[ApiController]
[Route("api/bonds")]
public sealed class BondsController(
    ILogger<BondsController> logger,
    IBondControllerService bondService,
    BondValidator validator) : ControllerBase
{
    [HttpGet("all")]
    [Authorize]
    public async Task<IActionResult> GetAllBondsAsync()
    {
        try
        {
            var bonds = await bondService.GetAllBondsAsync();
            var bondDtos = bonds.ToList();
            if (bondDtos.Count != 0)
            {
                return Ok(bondDtos.Where(bond => bond.Bond is not null && bond.Type is not null)
                    .Select(BondDtoMapper.ToResponseDto));
            }

            logger.LogWarning($"Облигаций нет в системе");
            return NotFound(new { message = $"Облигаций нет в системе" });
        }
        catch (Exception ex)
        {
            logger.LogError("Ошибка при получении всех облигаций: {ExMessage}", ex.Message);
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpGet("type/{type}")]
    [Authorize]
    public async Task<IActionResult> GetBondsByTypeAsync(string type)
    {
        try
        {
            var validationResult = validator.ValidateType(type);
            if (validationResult != null)
                return validationResult;

            var bonds = await bondService.GetBondsByTypeAsync(type);
            var bondDtos = bonds.ToList();
            if (bondDtos.Count != 0)
            {
                return Ok(bondDtos.Where(bond => bond.Bond is not null && bond.Type is not null)
                    .Select(BondDtoMapper.ToResponseDto));
            }

            return NotFound(new { message = $"Облигаций типа: '{type}' нет в системе" });
        }
        catch (Exception ex)
        {
            logger.LogError("Ошибка при получении облигации по ее типу: {ExMessage}", ex.Message);
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpGet("isin/{isin}")]
    [Authorize]
    public async Task<IActionResult> GetBondByIsinAsync(string isin)
    {
        try
        {
            var validationResult = validator.ValidateIsin(isin);
            if (validationResult != null)
                return validationResult;

            var bond = await bondService.GetBondByIsinAsync(isin);
            if (bond != null)
                return Ok(BondDtoMapper.ToResponseDto(bond));

            return NotFound(new { message = $"Облигации с isin: '{isin}' нет в системе" });
        }
        catch (Exception ex)
        {
            logger.LogError("Ошибка при получении облигации по ISIN: {ExMessage}", ex.Message);
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpGet("forecast")]
    [Authorize]
    public async Task<IActionResult> GetAllForecastsAsync()
    {
        try
        {
            var forecastBonds = await bondService.GetForecastBondsAsync();
            if (forecastBonds.Count != 0)
                return Ok(forecastBonds);

            return NotFound(new { message = "Данных для прогнозирования нет" });
        }
        catch (Exception ex)
        {
            logger.LogError("Ошибка при получении прогнозов: {ExMessage}", ex.Message);
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpGet("forecast/{isin}")]
    [Authorize]
    public async Task<IActionResult> GetForecastByIsinAsync(string isin)
    {
        try
        {
            var validationResult = validator.ValidateIsin(isin);
            if (validationResult != null)
                return validationResult;

            var forecastBonds = await bondService.GetForecastBondsAsync();

            if (forecastBonds.TryGetValue(isin, out var forecast))
                return Ok(new { isin, forecast });

            return NotFound(new { message = $"ISIN: '{isin}' не найден в системе" });
        }
        catch (Exception ex)
        {
            logger.LogError("Ошибка при получении прогноза по ISIN: {ExMessage}", ex.Message);
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpGet("filter")]
    [Authorize]
    public async Task<IActionResult> GetBondsByFilterAsync(
        [FromQuery] string? type,
        [FromQuery] string? isin)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(type) && string.IsNullOrWhiteSpace(isin))
                return BadRequest(new { message = "Укажите хотя бы один параметр для фильтрации" });

            if (!string.IsNullOrWhiteSpace(type))
            {
                var typeValidation = validator.ValidateType(type);
                if (typeValidation != null)
                    return typeValidation;
            }

            if (!string.IsNullOrWhiteSpace(isin))
            {
                var isinValidation = validator.ValidateIsin(isin);
                if (isinValidation != null)
                    return isinValidation;
            }

            var bonds = await bondService.GetBondsByFilterAsync(type, isin);
            var bondDtos = bonds.ToList();

            if (bondDtos.Count != 0)
            {
                return Ok(bondDtos
                    .Where(bond => bond.Bond is not null && bond.Type is not null)
                    .Select(BondDtoMapper.ToResponseDto));
            }

            return NotFound(new { message = "По заданным фильтрам облигации не найдены" });
        }
        catch (Exception ex)
        {
            logger.LogError("Ошибка при фильтрации облигаций: {ExMessage}", ex.Message);
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }
}