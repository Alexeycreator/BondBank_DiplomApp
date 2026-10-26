using BondBank_WebApi.Services.Interfaces;
using BondBank_WebApi.Models.DTOs.Passports;
using Microsoft.AspNetCore.Mvc;

namespace BondBank_WebApi.Controllers.Passports;

[ApiController]
[Route("api/[controller]/passports")]
public sealed class PassportsController(
    ILogger<PassportsController> logger,
    IPassportsControllerService passportsService) : ControllerBase
{
    [HttpGet("get-info-by-id")]
    public async Task<IActionResult> GetAllInfoByIdAsync(int passportId)
    {
        try
        {
            if (passportId < 1)
            {
                return BadRequest(new { message = $"Паспорта с ID = {passportId} не может существовать" });
            }

            var passportData = await passportsService.GetAllInfoByIdAsync(passportId);
            if (passportData == null)
            {
                return NotFound(new { message = $"Данных о паспорте нет" });
            }

            return Ok(PassportDto.From(passportData));
        }
        catch (Exception ex)
        {
            logger.LogError("Неизвестная ошибка при получении данных паспорта с id: '{PassportId}'. {ExMessage}", passportId, ex.Message);
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }
}