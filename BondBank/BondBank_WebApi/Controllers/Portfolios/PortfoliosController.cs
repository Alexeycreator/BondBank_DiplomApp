using BondBank_WebApi.Models.DTOs.Portfolios;
using BondBank_WebApi.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BondBank_WebApi.Controllers.Portfolios;

[ApiController]
[Route("api/[controller]/portfolios")]
public sealed class PortfoliosController(
    ILogger<PortfoliosController> logger,
    IPortfoliosControllerService portfoliosService,
    IUsersControllerService usersService) : ControllerBase
{
    [HttpGet("get-all-portfolios")]
    public async Task<IActionResult> GetAllPortfoliosAsync()
    {
        try
        {
            var portfoliosData = await portfoliosService.GetAllPortfoliosAsync();
            var portfoliosModels = portfoliosData.ToList();
            if (portfoliosModels.Count != 0)
            {
                return Ok(portfoliosModels.Select(PortfolioDto.From));
            }

            return NotFound(new { message = $"Данных о портфелях нет" });
        }
        catch (Exception ex)
        {
            logger.LogError("Неизвестная ошибка при получении информации о портфелях: {ExMessage}", ex.Message);
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
            var portfoliosModels = userPortfolios.ToList();
            if (portfoliosModels.Count != 0)
            {
                return Ok(portfoliosModels.Select(PortfolioDto.From));
            }

            return NotFound(new { message = $"Данных о портфелях пользователя ID = {userId} нет" });
        }
        catch (Exception ex)
        {
            logger.LogError("Неизвестная ошибка при получении информации о портфелях пользователя ID = {UserId}: {ExMessage}", userId, ex.Message);
            return StatusCode(500, new { error = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [Authorize]
    [HttpGet("get-portfolio-history")]
    public async Task<IActionResult> GetPortfolioHistoryAsync(int portfolioId)
    {
        try
        {
            if (portfolioId < 1)
            {
                return BadRequest(new { message = "ID портфеля должен быть положительным числом." });
            }

            var email = User.FindFirst("email")?.Value;
            if (string.IsNullOrWhiteSpace(email))
            {
                return Unauthorized(new { message = "В токене пользователя отсутствует email." });
            }

            var user = await usersService.GetInfoByEmailAsync(email);
            if (user is null)
            {
                return NotFound(new { message = "Профиль пользователя не найден." });
            }

            var userPortfolios = await portfoliosService.GetAllPortfoliosByUserAsync(user.Id);
            if (!userPortfolios.Any(portfolio => portfolio.Id == portfolioId))
            {
                return NotFound(new { message = "Портфель не найден." });
            }

            var history = await portfoliosService.GetPortfolioHistoryAsync(portfolioId);
            return Ok(history.Select(PortfolioHistoryDto.From));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ошибка при получении истории портфеля ID = {PortfolioId}", portfolioId);
            return StatusCode(500, new { message = "Не удалось загрузить историю портфеля." });
        }
    }
}