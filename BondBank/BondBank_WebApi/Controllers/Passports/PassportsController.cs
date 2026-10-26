using BondBank_WebApi.HelperMethods.Validators;
using BondBank_WebApi.Services.Interfaces;
using BondBank_WebApi.Models.DTOs.Passports;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BondBank_WebApi.Controllers.Passports;

[ApiController]
[Route("api/passports")]
public sealed class PassportsController(
    ILogger<PassportsController> logger,
    IPassportsControllerService passportsService,
    CommonValidator commonValidator) : ControllerBase
{
    [HttpGet("info")]
    [Authorize]
    public async Task<IActionResult> GetAllInfoByIdAsync([FromQuery] int passportId)
    {
        try
        {
            var validationResult = commonValidator.ValidateId(passportId);
            if (validationResult != null)
                return validationResult;

            var passportData = await passportsService.GetAllInfoByIdAsync(passportId);
            if (passportData == null)
                return NotFound(new { message = $"Данных о паспорте нет" });

            return Ok(PassportDto.From(passportData));
        }
        catch (Exception ex)
        {
            logger.LogError("Неизвестная ошибка при получении данных паспорта с id: '{PassportId}'. {ExMessage}",
                passportId, ex.Message);
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpPost("save")]
    [Authorize]
    public async Task<IActionResult> SavePassportAsync([FromBody] PassportRequestDto dto)
    {
        try
        {
            var keycloakId = User.FindFirst("sub")?.Value
                             ?? User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")
                                 ?.Value;

            if (string.IsNullOrEmpty(keycloakId))
                return Unauthorized(new { message = "В токене отсутствует идентификатор пользователя" });

            var success = await passportsService.SavePassportAsync(keycloakId, dto);

            if (success)
                return Ok(new { message = "Данные паспорта успешно сохранены" });

            return NotFound(new { message = "Пользователь не найден в БД" });
        }
        catch (Exception ex)
        {
            logger.LogError("Ошибка при сохранении паспорта: {ExMessage}", ex.Message);
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpDelete("delete")]
    [Authorize]
    public async Task<IActionResult> DeletePassportAsync()
    {
        try
        {
            var keycloakId = User.FindFirst("sub")?.Value
                             ?? User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")
                                 ?.Value;

            if (string.IsNullOrEmpty(keycloakId))
                return Unauthorized(new { message = "В токене отсутствует идентификатор пользователя" });

            var success = await passportsService.DeletePassportAsync(keycloakId);

            if (success)
                return Ok(new { message = "Данные паспорта успешно удалены" });

            return NotFound(new { message = "Паспорт не найден или пользователь не существует" });
        }
        catch (Exception ex)
        {
            logger.LogError("Ошибка при удалении паспорта: {ExMessage}", ex.Message);
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }
}