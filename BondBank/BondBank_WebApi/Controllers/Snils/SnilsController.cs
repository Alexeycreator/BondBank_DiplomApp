using BondBank_WebApi.HelperMethods.Validators;
using BondBank_WebApi.Services.Interfaces;
using BondBank_WebApi.Models.DTOs.Snils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BondBank_WebApi.Controllers.Snils;

[ApiController]
[Route("api/snils")]
public sealed class SnilsController(
    ILogger<SnilsController> logger,
    ISnilsControllerService snilsService,
    CommonValidator commonValidator) : ControllerBase
{
    [HttpGet("info")]
    public async Task<IActionResult> GetAllInfoByIdAsync([FromQuery] int snilsId)
    {
        try
        {
            var validationResult = commonValidator.ValidateId(snilsId);
            if (validationResult != null)
                return validationResult;

            var snilsData = await snilsService.GetAllInfoByIdAsync(snilsId);
            if (snilsData == null)
                return NotFound(new { message = $"Данных о снилс ID = {snilsId} нет" });

            return Ok(SnilsDto.From(snilsData));
        }
        catch (Exception ex)
        {
            logger.LogError("Неизвестная ошибка при получении данных снилс ID = {SnilsId}. {ExMessage}", snilsId, ex.Message);
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }
    
    [HttpPost("save")]
    [Authorize]
    public async Task<IActionResult> SaveSnilsAsync([FromBody] SnilsRequestDto dto)
    {
        try
        {
            var keycloakId = User.FindFirst("sub")?.Value
                             ?? User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;

            if (string.IsNullOrEmpty(keycloakId))
                return Unauthorized(new { message = "В токене отсутствует идентификатор пользователя" });

            var success = await snilsService.SaveSnilsAsync(keycloakId, dto);
            
            if (success)
                return Ok(new { message = "Данные СНИЛС успешно сохранены" });

            return NotFound(new { message = "Пользователь не найден в БД" });
        }
        catch (Exception ex)
        {
            logger.LogError("Ошибка при сохранении СНИЛС: {ExMessage}", ex.Message);
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpDelete("delete")]
    [Authorize]
    public async Task<IActionResult> DeleteSnilsAsync()
    {
        try
        {
            var keycloakId = User.FindFirst("sub")?.Value
                             ?? User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;

            if (string.IsNullOrEmpty(keycloakId))
                return Unauthorized(new { message = "В токене отсутствует идентификатор пользователя" });

            var success = await snilsService.DeleteSnilsAsync(keycloakId);
            
            if (success)
                return Ok(new { message = "Данные СНИЛС успешно удалены" });

            return NotFound(new { message = "СНИЛС не найден или пользователь не существует" });
        }
        catch (Exception ex)
        {
            logger.LogError("Ошибка при удалении СНИЛС: {ExMessage}", ex.Message);
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }
}