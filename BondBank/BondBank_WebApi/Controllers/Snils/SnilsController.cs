using BondBank_WebApi.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BondBank_WebApi.Controllers.Snils;

[ApiController]
[Route("api/[controller]/snils")]
public sealed class SnilsController(
    ILogger<SnilsController> logger,
    ISnilsControllerService snilsService) : ControllerBase
{
    [HttpGet("get-by-id")]
    public async Task<IActionResult> GetAllInfoByIdAsync(int snilsId)
    {
        try
        {
            if (snilsId < 1)
            {
                return BadRequest(new { message = $"Снилс с ID = {snilsId} не может существовать" });
            }

            var snilsData = await snilsService.GetAllInfoByIdAsync(snilsId);
            if (snilsData == null)
            {
                return NotFound(new { message = $"Данных о снилс ID = {snilsId} нет" });
            }

            return Ok(snilsData);
        }
        catch (Exception ex)
        {
            logger.LogError($"Неизвестная ошибка при получении данных снилс ID = {snilsId}. {ex.Message}");
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }
}