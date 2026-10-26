using BondBank_WebApi.HelperMethods.Validators;
using BondBank_WebApi.Services.Interfaces;
using BondBank_WebApi.Models.DTOs.Snils;
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
}