using BondBank_WebApi.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BondBank_WebApi.Controllers.Portfolios;

[ApiController]
[Route("api/[controller]/portfolios")]
public sealed class PortfoliosController(
    ILogger<PortfoliosController> logger,
    IPortfoliosControllerService portfoliosService) : ControllerBase
{
    [HttpGet("get-all-portfolios")]
    public async Task<IActionResult> GetAllPortfoliosAsync()
    {
        try
        {
            var portfoliosData = await portfoliosService.GetAllPortfoliosAsync();
            if (portfoliosData.Any())
            {
                return Ok(portfoliosData);
            }

            return NotFound(new { message = $"Данных о портфелях нет" });
        }
        catch (Exception ex)
        {
            logger.LogError($"Неизвестная ошибка при получении информации о портфелях: {ex.Message}");
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpGet("get-portfolios-by-user")]
    public async Task<IActionResult> GetAllPortfoliosByUserAsync(int userId)
    {
        try
        {
            if (userId < 1)
            {
                return BadRequest(new { message = $"ID пользователя не может быть меньше 1" });
            }

            var userPortfolios = await portfoliosService.GetAllPortfoliosByUserAsync(userId);
            if (userPortfolios.Any())
            {
                return Ok(userPortfolios);
            }

            return NotFound(new { message = $"Данных о портфелях пользователя ID = {userId} нет" });
        }
        catch (Exception ex)
        {
            logger.LogError($"Неизвестная ошибка при получении информации о портфелях пользователя ID = {userId}: {ex.Message}");
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }
}